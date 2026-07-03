import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'
import { CONTRACTS } from './constants/contracts'

// 1. Get projectId
const projectId = 'c0fd1378367c559475f44bce63d47a8a';

// 2. Set chains
const bsc = {
  chainId: 56,
  name: 'BNB Smart Chain',
  currency: 'BNB',
  explorerUrl: 'https://bscscan.com',
  rpcUrl: CONTRACTS.RPC_URL
}

// 3. Create modal
const metadata = {
  name: 'Dominix Presale',
  description: 'Dominix Presale Protocol',
  url: window.location.origin,
  icons: ['https://avatars.dominix.com/']
}

createWeb3Modal({
  ethersConfig: defaultConfig({ metadata }),
  chains: [bsc],
  projectId,
  enableAnalytics: true,
  themeMode: 'dark',
  themeVariables: {
    '--w3m-font-family': 'Inter, system-ui, sans-serif',
    '--w3m-accent': '#0dcaf0',
    '--w3m-color-mix': '#000000',
    '--w3m-color-mix-strength': 40,
    '--w3m-border-radius-master': '2px',
    '--w3m-z-index': 9999,
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
