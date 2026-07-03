import React, { useState, useEffect } from 'react';
import { Navbar, Container, Nav, NavDropdown, Badge, Row, Col, Card, ProgressBar, Alert, Button } from 'react-bootstrap';
import { Globe, Power, ArrowDown } from 'lucide-react';
import { useWeb3 } from './hooks/useWeb3';



const Tokenomics: React.FC = () => {
  const allocations = [
    { label: "Community Sale", pct: 50, color: "info", desc: "Public Presale Allocation" },
    { label: "Founders & Team", pct: 25, color: "primary", desc: "12-Month Linear Vesting" },
    { label: "Venture Capital", pct: 15, color: "warning", desc: "Strategic Partnerships" },
    { label: "Marketing", pct: 10, color: "danger", desc: "Global Awareness & CEX Listings" },
  ];

  return (
    <Container className="py-5" id="tokenomics">
      <div className="text-center mb-5">
        <h2 className="display-5 fw-bold mb-3 gradient-text">Tokenomics</h2>
        <p className="text-secondary lead">Strategic distribution designed for long-term sustainability.</p>
      </div>
      <Row className="justify-content-center">
        <Col lg={10} xl={9}>
          <Card className="glass-panel border-0 rounded-5 text-white overflow-hidden">
            <Card.Body className="p-0">
              <Row className="g-0">
                <Col md={5} className="p-5 d-flex flex-column justify-content-center align-items-center text-center position-relative" style={{ background: 'linear-gradient(135deg, rgba(13,202,240,0.15) 0%, rgba(11,14,23,0.9) 100%)' }}>
                  <div className="mb-5 position-relative z-1">
                    <small className="text-info fw-bold letter-spacing-2 text-uppercase d-block mb-2">Total Supply</small>
                    <h2 className="display-4 fw-bold mb-0">10M</h2>
                    <span className="text-white-50 small">DMX TOKENS</span>
                  </div>
                  <div className="position-relative z-1">
                    <small className="text-success fw-bold letter-spacing-2 text-uppercase d-block mb-2">Launch Target</small>
                    <h2 className="display-4 fw-bold mb-0">$10</h2>
                    <span className="text-white-50 small">PER TOKEN</span>
                  </div>
                  <div className="position-absolute top-0 start-0 w-100 h-100" style={{ background: 'radial-gradient(circle, rgba(13,202,240,0.1) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
                </Col>
                <Col md={7} className="p-4 p-md-5 bg-dark bg-opacity-25">
                  <h4 className="fw-bold mb-4">Allocation Breakdown</h4>
                  <div className="d-flex flex-column gap-4">
                    {allocations.map((a, i) => (
                      <div key={i}>
                        <div className="d-flex justify-content-between align-items-end mb-2">
                          <div>
                            <span className="fw-bold text-white d-block">{a.label}</span>
                            <small className="text-secondary" style={{ fontSize: '0.8rem' }}>{a.desc}</small>
                          </div>
                          <span className={`fw-bold text-${a.color} fs-5`}>{a.pct}%</span>
                        </div>
                        <div className="progress" style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '10px' }}>
                          <div 
                            className={`progress-bar bg-${a.color}`} 
                            role="progressbar" 
                            style={{ width: `${a.pct}%`, borderRadius: '10px', boxShadow: `0 0 10px var(--bs-${a.color})` }}
                            aria-valuenow={a.pct} aria-valuemin={0} aria-valuemax={100}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

const App: React.FC = () => {
  const [toast, setToast] = useState<{ msg: string, type: string } | null>(null);
  const web3 = useWeb3((msg, type) => setToast({ msg, type }));
  const [mode, setMode] = useState<'BUY' | 'SELL'>('BUY');
  const [amount, setAmount] = useState('');
  const [ref, setRef] = useState('');
  const [email, setEmail] = useState('');
  const [receiveAmount, setReceiveAmount] = useState('');

  useEffect(() => {
    if (!amount) {
      setReceiveAmount('');
      return;
    }
    const price = parseFloat(web3.currentPrice) || 1;
    const amt = parseFloat(amount);
    if (mode === 'BUY') {
      setReceiveAmount((amt / price).toFixed(4));
    } else {
      setReceiveAmount((amt * price * 0.85).toFixed(4));
    }
  }, [amount, mode, web3.currentPrice]);

  const handleAction = () => {
    if (!web3.account) {
      web3.connectWallet();
      return;
    }
    if (mode === 'BUY') {
      web3.buyTokens(amount, ref, email);
    } else {
      web3.sellTokens(amount);
    }
  };

  const handleAddToken = async () => {
    try {
      if (!(window as any).ethereum) return;
      await (window as any).ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: '0x906DfaB01976d0d4f04fe2547d97E0c9ba69e6BB',
            symbol: 'DMX',
            decimals: 18,
            image: window.location.origin + '/assets/dmx.png',
          },
        },
      });
    } catch (err) {
      console.error(err);
    }
  };

  const truncateAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  const progress = (parseFloat(web3.phaseSold) / parseFloat(web3.phaseCap)) * 100 || 0;
  const balance = mode === 'BUY' ? parseFloat(web3.usdtBalance).toFixed(2) : parseFloat(web3.dmxBalance).toFixed(2);

  return (
    <div className="min-vh-100 bg-black text-white position-relative overflow-hidden font-sans-serif">
      {/* Background Image */}
      <img 
        src="https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=2552" 
        alt="Background" 
        className="position-fixed top-0 start-0 w-100 h-100 object-fit-cover opacity-25 z-0"
      />

      <div className="position-relative z-1">
        {/* Navbar */}
        <Navbar expand="lg" variant="dark" className="py-3 bg-dark bg-opacity-75 border-bottom border-secondary border-opacity-25 sticky-top backdrop-blur">
          <Container>
            <Navbar.Brand className="d-flex align-items-center gap-2 fw-bold fs-4 me-0" style={{ minWidth: '200px' }}>
              <img src="/assets/dmx.png" alt="Dominix" width="40" height="40" className="object-fit-contain" />
              <span className="text-info tracking-wider">DOMINIX</span>
            </Navbar.Brand>
            
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="mx-auto my-2 my-lg-0">
                <Nav.Link href="#" className="text-white mx-3 fw-semibold">Swap</Nav.Link>
                <Nav.Link href="#phases" className="text-white-50 mx-3">Phases</Nav.Link>
                <Nav.Link href="#tokenomics" className="text-white-50 mx-3">Tokenomics</Nav.Link>
              </Nav>
              
              <div className="d-flex align-items-center justify-content-lg-end gap-3" style={{ minWidth: '200px' }}>
                {web3.account ? (
                  <div className="d-flex align-items-center gap-2">
                    <Button 
                      variant="dark" 
                      className="d-none d-xl-flex align-items-center gap-2 px-3 py-2 rounded-pill bg-dark border border-secondary border-opacity-25 hover-bg-secondary transition-all"
                      onClick={handleAddToken}
                      title="Add DMX to MetaMask"
                    >
                      <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" width="20" alt="MetaMask" />
                      <span className="text-white-50 small font-monospace">DMX</span>
                    </Button>

                    <div className="d-none d-lg-flex align-items-center gap-2 px-3 py-2 rounded-pill bg-black bg-opacity-25 border border-white border-opacity-10">
                      <img src="/assets/dmx.png" width="20" height="20" alt="DMX" />
                      <div className="d-flex flex-column lh-1">
                        <span className="small text-white-50" style={{ fontSize: '0.65rem' }}>YOUR BALANCE</span>
                        <span className="fw-bold text-info small">{parseFloat(web3.dmxBalance).toFixed(2)} DMX</span>
                      </div>
                    </div>

                    <NavDropdown 
                      align={{ lg: 'end' }}
                      title={
                        <div className="d-flex align-items-center gap-2 rounded-pill px-3 py-2 border border-info border-opacity-25 bg-info bg-opacity-10 text-white">
                          <div className="bg-success rounded-circle" style={{ width: 8, height: 8 }}></div>
                          <span className="small fw-bold text-info">BSC</span>
                          <div className="vr mx-2 bg-secondary"></div>
                          <span className="small fw-bold">{truncateAddress(web3.account)}</span>
                        </div>
                      }
                      id="account-dropdown"
                      className="custom-nav-dropdown"
                    >
                      <div className="p-3 bg-dark text-white rounded-4 shadow-lg border border-secondary border-opacity-25" style={{ minWidth: '260px' }}>
                        <div className="d-flex align-items-center gap-2 mb-3 px-2">
                          <Globe size={16} />
                          <span className="small text-white-50">Connected to BSC Mainnet</span>
                        </div>
                        
                        <div className="bg-info bg-opacity-10 rounded-3 p-2 mb-2 border border-info border-opacity-25">
                          <div className="d-flex justify-content-between text-info small mb-1">
                            <span className="fw-bold">Your Holdings</span>
                          </div>
                          <div className="d-flex align-items-center gap-2">
                            <img src="/assets/dmx.png" width="20" height="20" alt="DMX" />
                            <span className="fw-bold text-white fs-5">{parseFloat(web3.dmxBalance).toFixed(2)} DMX</span>
                          </div>
                        </div>

                        <div className="bg-black bg-opacity-50 rounded-3 p-2 mb-3">
                           <div className="d-flex justify-content-between text-secondary small mb-1">
                            <span>BNB Balance</span>
                          </div>
                          <div className="fw-bold text-white">{parseFloat(web3.bnbBalance).toFixed(4)} BNB</div>
                        </div>

                        <NavDropdown.Item onClick={web3.disconnectWallet} className="text-danger rounded-3 d-flex align-items-center gap-2 hover-bg-secondary p-2">
                          <Power size={16} /> Disconnect
                        </NavDropdown.Item>
                      </div>
                    </NavDropdown>
                  </div>
                ) : (
                  <Button variant="info" className="rounded-pill px-4 fw-bold" onClick={web3.connectWallet}>
                    Connect Wallet
                  </Button>
                )}
              </div>
            </Navbar.Collapse>
          </Container>
        </Navbar>

        {web3.headline && (
          <div className="container mt-3">
            <Alert 
              variant="info" 
              className="py-2 px-3 rounded-pill small fw-semibold shadow-sm mx-auto border-info border-opacity-25" 
              style={{ 
                maxWidth: 'fit-content', 
                background: 'rgba(13, 202, 240, 0.1)',
                color: '#0dcaf0'
              }}
            >
              <div className="ticker-container">
                <div className="ticker-content">
                  {web3.headline}
                </div>
              </div>
            </Alert>
          </div>
        )}

        {/* Hero Section */}
        <Container className="py-5">

          <Row className="justify-content-center align-items-start min-vh-75 py-lg-5">
            <Col lg={6} className="text-center text-lg-start mb-5 mb-lg-0 pt-lg-5">
              <Badge bg="dark" className="border border-info text-info px-3 py-2 rounded-pill mb-3">
                ● Presale Phase {web3.currentPhase} Live
              </Badge>
              <h1 className="display-4 fw-bold mb-3 lh-1">
                Secure Your <br /> <span className="gradient-text">Early Allocation</span>
              </h1>
              <p className="text-secondary mb-4 lead">
                Don't wait for the public listing at $10.00. Buy DMX now at the lowest possible entry price before the next phase increase.
              </p>

              <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
                <div className="p-3 px-4 rounded-4 glass-panel border border-white border-opacity-10 text-center text-lg-start hover-scale transition-all">
                  <small className="d-block text-white-50 text-uppercase fw-bold mb-1" style={{ fontSize: '0.7rem' }}>Current Price</small>
                  <div className="d-flex align-items-center justify-content-center justify-content-lg-start gap-2">
                    <span className="h3 fw-bold text-white mb-0">${parseFloat(web3.currentPrice).toFixed(2)}</span>
                    <Badge bg="info" className="text-dark rounded-pill">LIVE</Badge>
                  </div>
                </div>

                <div className="p-3 px-4 rounded-4 bg-success bg-opacity-10 border border-success border-opacity-25 text-center text-lg-start">
                  <small className="d-block text-success text-uppercase fw-bold mb-1" style={{ fontSize: '0.7rem' }}>Listing Target</small>
                  <div className="d-flex align-items-center justify-content-center justify-content-lg-start gap-2">
                    <span className="h3 fw-bold text-white mb-0">$10.00</span>
                    <span className="text-success fw-bold fs-5 lh-1">↗</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-3 rounded-4 glass-panel border border-secondary border-opacity-25">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-white small fw-bold text-uppercase">
                    <span className="text-info me-2">●</span> Phase {web3.currentPhase}
                  </span>
                  <Badge bg="dark" className="text-secondary fw-normal border border-secondary border-opacity-25">
                    {parseFloat(web3.phaseSold).toFixed(0)} / {parseFloat(web3.phaseCap).toFixed(0)}
                  </Badge>
                </div>
                <ProgressBar now={progress} variant="info" animated striped className="rounded-pill bg-white bg-opacity-10" />
                <div className="d-flex justify-content-end mt-1">
                  <small className="text-info fw-bold" style={{ fontSize: '0.75rem' }}>{progress.toFixed(2)}% Complete</small>
                </div>
              </div>
            </Col>

            {/* Swap Card */}
            <Col lg={5} xl={5}>
              <Card className="glass-panel border-0 rounded-5 text-white shadow-lg backdrop-blur overflow-hidden">
                <Card.Body className="p-4">
                  <h5 className="fw-bold mb-3">Buy DMX</h5>
                  
                  <div className="d-flex bg-black bg-opacity-50 p-1 rounded-pill mb-4 border border-secondary border-opacity-25">
                    <div 
                      onClick={() => setMode('BUY')}
                      className={`flex-fill text-center py-2 rounded-pill fw-bold small transition-all cursor-pointer ${mode === 'BUY' ? 'toggle-active-buy shadow' : 'text-secondary opacity-50'}`}
                      role="button"
                    >Buy</div>
                    <div 
                      onClick={() => setMode('SELL')}
                      className={`flex-fill text-center py-2 rounded-pill fw-bold small transition-all cursor-pointer ${mode === 'SELL' ? 'toggle-active-sell shadow' : 'text-secondary opacity-50'}`}
                      role="button"
                    >Sell</div>
                  </div>

                  <div className="p-3 mb-2 bg-glass-dark rounded-4 border border-white border-opacity-10">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-secondary small fw-semibold" style={{ fontSize: '0.75rem' }}>You pay</span>
                      <span className="text-secondary small" style={{ fontSize: '0.75rem' }}>Bal: {balance}</span>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <input 
                        type="text" 
                        inputMode="decimal"
                        placeholder="0"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-transparent border-0 text-white fw-bold fs-4 w-75 p-0 shadow-none outline-none"
                      />
                      <Badge bg="dark" className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill border border-secondary border-opacity-25 text-white">
                        <img src={mode === 'BUY' ? 'https://cryptologos.cc/logos/tether-usdt-logo.png' : '/assets/dmx.png'} width="20" alt="Icon" />
                        {mode === 'BUY' ? 'USDT' : 'DMX'}
                      </Badge>
                    </div>
                  </div>

                  <div className="position-relative text-center my-3">
                    <div className="position-absolute top-50 start-50 translate-middle bg-dark p-1 rounded-3 border border-secondary border-opacity-25 z-1">
                      <div className="bg-secondary bg-opacity-25 rounded-2 p-1 text-white">
                        <ArrowDown size={20} />
                      </div>
                    </div>
                    <hr className="border-secondary border-opacity-25" />
                  </div>

                  <div className="p-3 mb-3 bg-glass-dark rounded-4 border border-white border-opacity-10">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-secondary small fw-semibold" style={{ fontSize: '0.75rem' }}>You receive</span>
                    </div>
                    <div className="d-flex align-items-center justify-content-between">
                      <div className="text-white fw-bold fs-4">{receiveAmount || '0'}</div>
                      <Badge bg="dark" className="d-flex align-items-center gap-2 px-3 py-2 rounded-pill border border-secondary border-opacity-25 text-white">
                        <img src={mode === 'BUY' ? '/assets/dmx.png' : 'https://cryptologos.cc/logos/tether-usdt-logo.png'} width="20" alt="Icon" />
                        {mode === 'BUY' ? 'DMX' : 'USDT'}
                      </Badge>
                    </div>
                  </div>

                  {mode === 'BUY' && (
                    <div className="mb-4">
                      <label className="text-secondary small fw-semibold mb-2 d-block" style={{ fontSize: '0.75rem' }}>Referral Address (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="0x..."
                        value={ref}
                        onChange={(e) => setRef(e.target.value)}
                        className="w-100 bg-glass-dark border border-white border-opacity-10 text-white rounded-4 p-3 outline-none transition-all focus-border-info"
                      />
                    </div>
                  )}

                  {mode === 'BUY' && web3.account && (
                    web3.registeredEmail ? (
                      <div className="alert alert-success py-2 small rounded-4 mb-4 bg-success bg-opacity-10 border-success border-opacity-25 text-success">
                        Email Already registered: <strong>{web3.registeredEmail}</strong>
                      </div>
                    ) : (
                      <div className="mb-4">
                        <label className="text-secondary small fw-semibold mb-2 d-block" style={{ fontSize: '0.75rem' }}>Registration Email</label>
                        <input 
                          type="email"
                          placeholder="you@example.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-100 bg-glass-dark border border-white border-opacity-10 text-white rounded-4 p-3 outline-none transition-all focus-border-info"
                        />
                      </div>
                    )
                  )}

                  <Button 
                    variant={mode === 'BUY' ? 'info' : 'warning'} 
                    className={`w-100 py-3 rounded-4 fw-bold fs-5 shadow-sm mb-3 border-0 transition-all active-scale-95 ${mode === 'BUY' ? 'bg-gradient-info text-white' : ''}`}
                    onClick={handleAction}
                    disabled={web3.loading}
                    style={{ 
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }}
                  >
                    {web3.loading ? 'Processing...' : (web3.account ? (mode === 'BUY' ? (email || web3.registeredEmail ? 'Buy & Register' : 'Buy Now') : 'Sell Back') : 'Connect Wallet')}
                  </Button>

                  <div className="text-center">
                    <small className="text-white-50">
                      1 USDT = {parseFloat(web3.currentPrice) > 0 ? (1 / parseFloat(web3.currentPrice)).toFixed(4) : '...'} DMX
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>

        {/* Phases Section */}
        <div id="phases" className="py-5 position-relative border-top border-secondary border-opacity-10">
          <Container>
            <div className="text-center mb-5">
              <h2 className="display-5 fw-bold mb-3 gradient-text">Price Schedule</h2>
              <p className="text-secondary lead">Secure your position before the next price increase.</p>
            </div>
            <Row className="g-4 justify-content-center">
              {[1, 2, 3, 4, 5].map((p) => {
                const isCurrent = web3.currentPhase === p;
                const isPast = web3.currentPhase > p;
                return (
                  <Col xs={6} md={4} lg={2} key={p}>
                    <div 
                      className={`p-4 rounded-4 text-center h-100 d-flex flex-column justify-content-center position-relative transition-all ${isCurrent ? 'active-glass-panel' : 'glass-panel'}`}
                    >
                      <div className="mb-3">
                        {isPast ? <Badge bg="success" className="bg-opacity-25 text-success border border-success border-opacity-25">SOLD OUT</Badge> : 
                         isCurrent ? <Badge bg="info" className="text-black shadow-sm">LIVE NOW</Badge> : 
                         <Badge bg="dark" className="text-secondary border border-secondary border-opacity-25">UPCOMING</Badge>}
                      </div>
                      <div className={`small fw-bold mb-1 ${isCurrent ? 'text-info' : 'text-secondary'}`}>PHASE {p}</div>
                      <h3 className={`fw-bold mb-0 ${isCurrent ? 'text-white' : 'text-secondary'}`}>${p}.00</h3>
                    </div>
                  </Col>
                )
              })}
            </Row>
          </Container>
        </div>

        {/* Tokenomics Section */}
        <Tokenomics />

        {/* Footer */}
        <footer className="py-4 text-white-50 small border-top border-secondary border-opacity-10 bg-black bg-opacity-50">
          <Container className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3">
            <div className="d-flex align-items-center gap-2">
              <img src="/assets/dmx.png" alt="Dominix" width="24" height="24" />
              <span className="fw-bold text-white tracking-wider small">DOMINIX</span>
            </div>
            <p className="mb-0">© 2025 Dominix Protocol. All rights reserved.</p>
          </Container>
        </footer>
      </div>


      {/* Toast Notification */}
      {toast && (
        <div 
          className="position-fixed top-0 start-50 translate-middle-x mt-3 z-3" 
          style={{ pointerEvents: 'none' }}
        >
          <Alert 
            variant={toast.type === 'error' ? 'danger' : toast.type}
            className="border-0 rounded-4 shadow-lg text-white fw-semibold px-4 py-3"
            style={{ 
              pointerEvents: 'auto',
              minWidth: '280px',
              background: toast.type === 'success' ? 'linear-gradient(135deg, #00c851, #007e33)' : 
                          toast.type === 'error' ? 'linear-gradient(135deg, #ff4444, #cc0000)' : 
                          'linear-gradient(135deg, #33b5e5, #0099cc)'
            }}
            onClose={() => setToast(null)}
            dismissible
          >
            {toast.msg}
          </Alert>
        </div>
      )}
    </div>
  );
};

export default App;
