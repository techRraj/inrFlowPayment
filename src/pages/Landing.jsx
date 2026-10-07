import { Link } from 'react-router-dom';
import {
  FiZap, FiShield, FiTrendingUp, FiRepeat, FiCreditCard, FiDollarSign, FiCheckCircle,
  FiArrowRight,
} from 'react-icons/fi';

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="brand-lg">
          <div className="logo-mark" style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#4f46e5,#06b6d4)', display: 'grid', placeItems: 'center', color: '#fff', fontWeight: 800, fontSize: '.85rem' }}>IF</div>
          INRFlow
        </div>
        <nav className="links">
          <a href="#how">How It Works</a>
          <a href="#features">Features</a>
          <a href="#faq">FAQ</a>
          <Link to="/login">Login</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Create Demo Account</Link>
        </nav>
        <span className="demo-badge">DEMO</span>
      </header>

      <section className="hero">
        <div>
          <span className="demo-badge" style={{ marginBottom: '1rem', display: 'inline-flex' }}>DEMO MODE</span>
          <h1>Move INR. <span>Buy &amp; Sell.</span> Earn Rewards.</h1>
          <p className="lead">
            Experience a complete digital wallet and transaction workflow with automatic commission tracking —
            built as a fully interactive frontend prototype. No real money is processed.
          </p>
          <div className="hero-cta">
            <Link to="/login" className="btn btn-primary btn-lg">Explore Demo <FiArrowRight /></Link>
            <Link to="/register" className="btn btn-outline btn-lg">Create Demo Account</Link>
          </div>
          <p className="muted small mt-2" style={{ maxWidth: 540 }}>
            Demo accounts: user@demo.com / User@123 &nbsp;·&nbsp; admin@demo.com / Admin@123
          </p>
        </div>

        <div className="hero-preview">
          <div className="card card-pad mb-2">
            <div className="muted small">Available Balance</div>
            <div style={{ fontSize: '2rem', fontWeight: 800 }}>₹25,000.00</div>
            <div className="muted small">Demo wallet</div>
          </div>
          <div className="stat-grid">
            <div className="stat-card">
              <div className="stat-label">Total Commission</div>
              <div className="stat-value">₹600.00</div>
              <div className="stat-sub">2% on transactions</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Transactions</div>
              <div className="stat-value">6</div>
              <div className="stat-sub">4 successful</div>
            </div>
          </div>
          <div className="card mt-2">
            <div className="card-header"><div className="card-title">Recent Activity</div></div>
            <div style={{ padding: '.5rem 1rem' }}>
              {[
                { t: 'BUY', a: '₹10,000', c: '₹200' },
                { t: 'SELL', a: '₹5,000', c: '₹100' },
                { t: 'BUY', a: '₹2,500', c: '₹50' },
              ].map((r, i) => (
                <div key={i} className="flex-between" style={{ padding: '.6rem 0', borderBottom: i < 2 ? '1px solid #eef0f6' : 'none' }}>
                  <div className="flex-center">
                    <span className={`badge ${r.t === 'BUY' ? 'badge-primary' : 'badge-info'}`}>{r.t}</span>
                    <span className="mono">{r.a}</span>
                  </div>
                  <div className="text-success fw-700">+{r.c}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="section">
        <h2 className="section-title">How It Works</h2>
        <p className="section-sub">A complete demonstration flow from onboarding to commission credit.</p>
        <div className="steps">
          {[
            ['1', 'Create Demo Account', 'Register with a demo email and mobile. A wallet is created automatically.'],
            ['2', 'Fund Demo Wallet', 'Add demo money via simulated UPI, card or net banking options.'],
            ['3', 'Buy or Sell', 'Enter an amount. The platform calculates commission automatically at the configured rate.'],
            ['4', 'Simulated Payment', 'Review the order and run a simulated payment. It succeeds or fails locally.'],
            ['5', 'Commission Credited', 'On success, commission is calculated and credited to your wallet with a ledger entry.'],
          ].map(([n, t, d]) => (
            <div key={n} className="step-card card">
              <div className="step-num">{n}</div>
              <div style={{ fontWeight: 700 }}>{t}</div>
              <div className="muted small mt-1">{d}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="features" className="section">
        <h2 className="section-title">Features</h2>
        <p className="section-sub">Everything works entirely in your browser using localStorage.</p>
        <div className="feature-grid">
          {[
            [<FiCreditCard key="w" />, 'Digital Wallet', 'Track balance, credits, debits and commission with a full ledger.', '#eef2ff', '#4f46e5'],
            [<FiRepeat key="r" />, 'Buy & Sell', 'Professional trading interface with instant, automatic commission calculation.', '#ecfeff', '#06b6d4'],
            [<FiDollarSign key="c" />, 'Auto Commission', 'Configurable 2% default rate. Historical records never change.', '#d1fae5', '#10b981'],
            [<FiShield key="k" />, 'Simulated KYC', 'Multi-step demo KYC workflow with admin review — no real ID used.', '#fef3c7', '#f59e0b'],
            [<FiTrendingUp key="d" />, 'Live Dashboard', 'Charts and statistics calculated from stored records, not hardcoded.', '#fce7f3', '#db2777'],
            [<FiZap key="a" />, 'Admin Console', 'Users, KYC, settlements, disputes, reports, audit logs and settings.', '#ede9fe', '#7c3aed'],
          ].map(([icon, title, desc, bg, color], i) => (
            <div key={i} className="feature-card">
              <div className="feature-icon" style={{ background: bg, color }}>{icon}</div>
              <div style={{ fontWeight: 700, marginBottom: '.35rem' }}>{title}</div>
              <div className="muted small">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="commission-hero">
          <div className="muted small" style={{ color: '#e0e7ff', marginBottom: '.5rem' }}>COMMISSION EXAMPLE</div>
          <div className="amount">₹200</div>
          <div style={{ fontSize: '1.05rem' }}>
            Commission on a <strong>₹10,000</strong> transaction at <strong>2%</strong>
          </div>
          <div className="small mt-2" style={{ color: '#e0e7ff' }}>
            ₹10,000 × 2% = ₹200 credited to your demo wallet automatically.
          </div>
        </div>
      </section>

      <section className="section">
        <h2 className="section-title">Security &amp; Transparency</h2>
        <p className="section-sub">This prototype is deliberately simulated and clearly marked.</p>
        <div className="grid grid-3">
          {[
            ['Demo Mode Everywhere', 'A persistent banner reminds every user that no real money, payment gateway or identity verification is used.'],
            ['No External Services', 'No backend, database, payment API, KYC API or network request. Everything runs locally.'],
            ['Data You Control', 'All data is stored in your browser\'s localStorage and can be reset, exported or imported.'],
          ].map(([t, d], i) => (
            <div key={i} className="card card-pad">
              <FiCheckCircle color="#10b981" size={22} />
              <div style={{ fontWeight: 700, margin: '.6rem 0 .3rem' }}>{t}</div>
              <div className="muted small">{d}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="section">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="grid grid-2">
          {[
            ['Is any real money processed?', 'No. Every payment, wallet credit and commission is simulated locally in your browser. No payment gateway is used.'],
            ['Do I need to register to try it?', 'No. Use user@demo.com / User@123 for the user demo, or admin@demo.com / Admin@123 for the admin demo.'],
            ['How is commission calculated?', 'Commission = amount × commission rate ÷ 100. The default rate is 2% and can be changed by admin for future transactions only.'],
            ['Is my data stored on a server?', 'No. Everything is stored in your browser\'s localStorage and never leaves your device.'],
            ['Does it perform real KYC?', 'No. The KYC workflow is simulated and does not collect or verify real Aadhaar, PAN or any identity document.'],
            ['Can I reset the demo?', 'Yes. Admin settings includes Reset Demo Data, Export Demo Data and Import Demo Data.'],
          ].map(([q, a], i) => (
            <div key={i} className="card card-pad">
              <div style={{ fontWeight: 700, marginBottom: '.4rem' }}>{q}</div>
              <div className="muted small">{a}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <h2 style={{ fontSize: '2rem', letterSpacing: '-.02em', margin: '0 0 .6rem' }}>Ready to explore INRFlow?</h2>
        <p style={{ margin: '0 0 1.5rem', color: '#e0e7ff' }}>
          Open the demo, add demo money, run a transaction and watch commission credit automatically.
        </p>
        <div className="flex-center" style={{ justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/login" className="btn btn-lg" style={{ background: '#fff', color: '#4f46e5' }}>Sign in to Demo</Link>
          <Link to="/register" className="btn btn-lg btn-outline" style={{ background: 'transparent', color: '#fff', borderColor: 'rgba(255,255,255,.5)' }}>Register</Link>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-grid">
          <div>
            <div className="brand-lg" style={{ color: '#fff', marginBottom: '.6rem' }}>
              <div className="logo-mark" style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,#4f46e5,#06b6d4)', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: '.85rem' }}>IF</div>
              INRFlow
            </div>
            <p className="small" style={{ maxWidth: 320 }}>
              A modern demonstration platform for INR transactions, digital wallets, buy/sell workflows and
              automated commission tracking.
            </p>
          </div>
          <div>
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#how">How It Works</a>
            <a href="#faq">FAQ</a>
          </div>
          <div>
            <h4>Demo</h4>
            <Link to="/login">User Login</Link>
            <Link to="/login">Admin Login</Link>
            <Link to="/register">Register</Link>
          </div>
          <div>
            <h4>Legal</h4>
            <span className="small">Prototype only — no real services</span>
          </div>
        </div>
        <div className="footer-bottom">
          INRFlow Demo — Simulated transactions only. No real money is processed.
        </div>
      </footer>
    </div>
  );
}