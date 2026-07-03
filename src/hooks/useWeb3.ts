import { useState, useEffect, useCallback } from 'react';
import { BrowserProvider, Contract, formatUnits, parseUnits, MaxUint256 } from 'ethers';
import { useWeb3Modal, useWeb3ModalAccount, useWeb3ModalProvider, useDisconnect } from '@web3modal/ethers/react';
import { CONTRACTS, ABIS } from '../constants/contracts';

const INITIAL_STATE = {
  account: null as string | null,
  chainId: null as number | null,
  currentPhase: 1,
  currentPrice: '0',
  phaseSold: '0',
  phaseCap: '0',
  dmxBalance: '0',
  usdtBalance: '0',
  bnbBalance: '0',
  headline: '',
  registeredEmail: '',
  loading: false,
  connecting: false,
};

export function useWeb3(showToast?: (msg: string, type: string) => void) {
  const { open } = useWeb3Modal();
  const { address, isConnected, chainId } = useWeb3ModalAccount();
  const { walletProvider } = useWeb3ModalProvider();
  const { disconnect } = useDisconnect();

  const [state, setState] = useState(INITIAL_STATE);
  const [provider, setProvider] = useState<BrowserProvider | null>(null);
  const [signer, setSigner] = useState<any>(null);

  const fetchData = useCallback(async (currentProvider: BrowserProvider, currentAddress: string) => {
    try {
      const network = await currentProvider.getNetwork();
      if (Number(network.chainId) !== CONTRACTS.CHAIN_ID) {
        try {
          await currentProvider.send('wallet_switchEthereumChain', [{ chainId: '0x38' }]);
          return;
        } catch (switchError: any) {
          if (switchError.code === 4902) {
            await currentProvider.send('wallet_addEthereumChain', [{
              chainId: '0x38',
              chainName: 'BNB Smart Chain',
              nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
              rpcUrls: [CONTRACTS.RPC_URL],
              blockExplorerUrls: ['https://bscscan.com'],
            }]);
          }
          return;
        }
      }

      const presaleContract = new Contract(CONTRACTS.PRESALE_ADDRESS, ABIS.PRESALE, currentProvider);
      const dmxContract = new Contract(CONTRACTS.DMX_ADDRESS, ABIS.ERC20, currentProvider);
      const usdtContract = new Contract(CONTRACTS.USDT_ADDRESS, ABIS.ERC20, currentProvider);

      const phaseIndex = await presaleContract.currentPhaseIndex();
      const [phaseData, dmxBal, usdtBal, bnbBal, headline, email] = await Promise.all([
        presaleContract.phases(phaseIndex),
        dmxContract.balanceOf(currentAddress).catch(() => 0n),
        usdtContract.balanceOf(currentAddress).catch(() => 0n),
        currentProvider.getBalance(currentAddress).catch(() => 0n),
        presaleContract.newsHeadline().catch(() => ''),
        presaleContract.userEmails(currentAddress).catch(() => ''),
      ]);

      setState((prev) => ({
        ...prev,
        account: currentAddress,
        chainId: Number(network.chainId),
        currentPhase: Number(phaseIndex) + 1,
        currentPrice: formatUnits(phaseData.price, 18),
        phaseSold: formatUnits(phaseData.sold, 18),
        phaseCap: formatUnits(phaseData.totalCap, 18),
        dmxBalance: formatUnits(dmxBal, 18),
        usdtBalance: formatUnits(usdtBal, 18),
        bnbBalance: formatUnits(bnbBal, 18),
        headline,
        registeredEmail: email,
        loading: false,
      }));
    } catch (error) {
      console.error('Fetch error:', error);
    }
  }, []);

  useEffect(() => {
    if (isConnected && walletProvider && address) {
      const browserProvider = new BrowserProvider(walletProvider);
      setProvider(browserProvider);
      browserProvider.getSigner().then((s) => {
        setSigner(s);
        fetchData(browserProvider, address);
      });
    } else {
      setProvider(null);
      setSigner(null);
      setState(INITIAL_STATE);
    }
  }, [isConnected, walletProvider, address, chainId, fetchData]);

  return {
    ...state,
    connectWallet: async () => {
      setState((s) => ({ ...s, connecting: true }));
      try {
        await open();
      } catch (err) {
        console.error(err);
        setState((s) => ({ ...s, connecting: false }));
      }
    },
    disconnectWallet: async () => {
      try {
        await disconnect();
        setState(INITIAL_STATE);
        showToast?.('Wallet disconnected', 'info');
      } catch (err) {
        console.error(err);
      }
    },
    buyTokens: async (amount: string, ref: string, email: string) => {
      if (!amount || parseFloat(amount) <= 0) return showToast?.('Please enter a valid amount', 'error');
      if (!signer || !provider) return showToast?.('Connect wallet first', 'error');
      
      setState((s) => ({ ...s, loading: true }));
      try {
        const usdtContract = new Contract(CONTRACTS.USDT_ADDRESS, ABIS.ERC20, signer);
        const presaleContract = new Contract(CONTRACTS.PRESALE_ADDRESS, ABIS.PRESALE, signer);
        
        const price = parseFloat(state.currentPrice) || 1;
        const dmxToReceive = parseUnits((parseFloat(amount) / price).toFixed(18), 18);
        const usdtToPay = parseUnits(amount, 18);
        const referral = ref.length === 42 ? ref : '0x0000000000000000000000000000000000000000';

        const allowance = await usdtContract.allowance(address, CONTRACTS.PRESALE_ADDRESS);
        if (allowance < usdtToPay) {
          const tx = await usdtContract.approve(CONTRACTS.PRESALE_ADDRESS, MaxUint256);
          await tx.wait();
          showToast?.('USDT Approved. Confirming Buy...', 'info');
        }

        const buyTx = await presaleContract.buyTokens(dmxToReceive, referral, email);
        await buyTx.wait();
        
        // Give the node a moment to sync balances
        setTimeout(() => fetchData(provider, address!), 1000);
        showToast?.('Purchase successful', 'success');
      } catch (err: any) {
        console.error(err);
        const msg = err.message.includes('user rejected') ? 'Transaction rejected' : (err.reason || err.message || 'Transaction failed');
        showToast?.(msg, 'error');
      } finally {
        setState((s) => ({ ...s, loading: false }));
      }
    },
    sellTokens: async (amount: string) => {
      if (!amount || parseFloat(amount) <= 0) return showToast?.('Please enter a valid amount', 'error');
      if (!signer || !provider) return showToast?.('Connect wallet first', 'error');

      setState((s) => ({ ...s, loading: true }));
      try {
        const dmxContract = new Contract(CONTRACTS.DMX_ADDRESS, ABIS.ERC20, signer);
        const presaleContract = new Contract(CONTRACTS.PRESALE_ADDRESS, ABIS.PRESALE, signer);
        const amt = parseUnits(amount, 18);

        const allowance = await dmxContract.allowance(address, CONTRACTS.PRESALE_ADDRESS);
        if (allowance < amt) {
          const tx = await dmxContract.approve(CONTRACTS.PRESALE_ADDRESS, amt);
          await tx.wait();
          showToast?.('DMX Approved. Confirming Sell...', 'info');
        }

        const sellTx = await presaleContract.sellBack(amt);
        await sellTx.wait();
        
        // Give the node a moment to sync balances
        setTimeout(() => fetchData(provider, address!), 1000);
        showToast?.('Tokens sold successfully', 'success');
      } catch (err: any) {
        console.error(err);
        const msg = err.message.includes('user rejected') ? 'Transaction rejected' : (err.reason || err.message || 'Transaction failed');
        showToast?.(msg, 'error');
      } finally {
        setState((s) => ({ ...s, loading: false }));
      }
    },
    registerEmail: async (email: string) => {
      if (!signer || !address) return showToast?.('Connect wallet first', 'error');
      setState((s) => ({ ...s, emailLoading: true } as any));
      try {
        const presaleContract = new Contract(CONTRACTS.PRESALE_ADDRESS, ABIS.PRESALE, signer);
        const tx = await presaleContract.registerEmail(email);
        await tx.wait();
        setState((s) => ({ ...s, registeredEmail: email }));
        showToast?.('Email registered successfully', 'success');
      } catch (err: any) {
        showToast?.(err.reason || err.message, 'error');
      } finally {
        setState((s) => ({ ...s, emailLoading: false } as any));
      }
    },
  };
}
