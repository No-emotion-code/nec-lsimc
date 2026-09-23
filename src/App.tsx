import { useEffect, useState } from 'react'
import './App.css'

type Candidate = {
  name: string
  vpName: string
  role: string
  mark: string
  color: string
  detail: string
  image: string
}

type Role = 'voter' | 'admin' | 'auditor'
type Account = { id: string; name: string; role: Role; password: string; voted: boolean }

const initialAccounts: Account[] = [
  { id: 'ADMIN-001', name: 'LSU Election Committee', role: 'admin', password: 'admin2026', voted: false },
  { id: 'AUDIT-001', name: 'Student Electoral Board', role: 'auditor', password: 'audit2026', voted: false },
]

const candidates: Candidate[] = [
  {
    name: 'Maya Okafor',
    vpName: 'Samuel Kpadeh',
    role: 'Civic Alliance',
    mark: 'MO',
    color: 'coral',
    detail: 'Open government, resilient neighborhoods, and public-first services.',
    image: '',
  },
  {
    name: 'Elias Reed',
    vpName: 'Grace Kollie',
    role: 'Forward Union',
    mark: 'ER',
    color: 'blue',
    detail: 'A stronger local economy built around skills, access, and accountability.',
    image: '',
  },
  {
    name: 'Priya Shah',
    vpName: 'Emmanuel Doe',
    role: 'Common Ground',
    mark: 'PS',
    color: 'yellow',
    detail: 'Practical climate action and a fairer path to shared prosperity.',
    image: '',
  },
]

function App() {
  const [accounts, setAccounts] = useState<Account[]>(() => JSON.parse(localStorage.getItem('civic-accounts') || JSON.stringify(initialAccounts)))
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [loginId, setLoginId] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')
  const session = accounts.find((account) => account.id === sessionId)
  const role: Role = session?.role || 'voter'
  const [registered, setRegistered] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const [voted, setVoted] = useState(false)
  const [candidateList, setCandidateList] = useState<Candidate[]>(() => JSON.parse(localStorage.getItem('lsu-candidates') || JSON.stringify(candidates)))
  const [candidateName, setCandidateName] = useState('')
  const [candidateParty, setCandidateParty] = useState('')
  const [candidatePlan, setCandidatePlan] = useState('')
  const [candidateVp, setCandidateVp] = useState('')
  const [candidateImage, setCandidateImage] = useState('')
  const [published, setPublished] = useState(false)
  const [adminVoterName, setAdminVoterName] = useState('')
  const [adminEligibility, setAdminEligibility] = useState('')
  const [adminCredential, setAdminCredential] = useState('')
  const [newAccountRole, setNewAccountRole] = useState<Role>('voter')
  const [countdown, setCountdown] = useState('')

  const canManageElection = role === 'admin'
  const accountBlocks = accounts.slice(-5).reverse().map((account, index) => ({
    time: `${String(9 - Math.floor(index / 2)).padStart(2, '0')}:${String(42 - index * 7).padStart(2, '0')}:18`,
    title: `Block #${String(8421 + accounts.indexOf(account)).padStart(6, '0')} · ${account.name}`,
    meta: `${account.id} · ${account.role} credential issued`,
    tone: index === 0 ? 'mint' : index % 2 ? 'blue' : 'coral',
  }))

  useEffect(() => { localStorage.setItem('civic-accounts', JSON.stringify(accounts)) }, [accounts])
  useEffect(() => { localStorage.setItem('lsu-candidates', JSON.stringify(candidateList)) }, [candidateList])
  useEffect(() => {
    const updateCountdown = () => {
      const target = new Date('2026-09-25T08:00:00').getTime()
      const remaining = Math.max(0, target - Date.now())
      const days = Math.floor(remaining / 86400000)
      const hours = Math.floor((remaining % 86400000) / 3600000)
      const minutes = Math.floor((remaining % 3600000) / 60000)
      setCountdown(`${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`)
    }
    updateCountdown()
    const timer = window.setInterval(updateCountdown, 60000)
    return () => window.clearInterval(timer)
  }, [])

  const login = () => {
    const account = accounts.find((item) => item.id.toLowerCase() === loginId.trim().toLowerCase() && item.password === loginPassword)
    if (!account) { setLoginError('Invalid admin-issued credential or password.'); return }
    setSessionId(account.id)
    setRegistered(account.role === 'voter')
    setVoted(account.voted)
    setLoginError('')
  }

  const publishCandidate = () => {
    if (!candidateName || !candidateParty || !candidatePlan) return
    if (!candidateVp) return
    setCandidateList((current) => [...current, { name: candidateName, vpName: candidateVp, role: candidateParty, mark: candidateName.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(), color: 'blue', detail: candidatePlan, image: candidateImage }])
    setCandidateName('')
    setCandidateParty('')
    setCandidatePlan('')
    setCandidateVp('')
    setCandidateImage('')
    setPublished(true)
  }

  const issueAdminCredential = () => {
    if (!adminVoterName || !adminEligibility || !canManageElection) return
    const passwordName = adminVoterName.replace(/[^a-zA-Z0-9]/g, '').slice(0, 12) || 'Voter'
    const account: Account = { id: `${newAccountRole.toUpperCase()}-${String(Date.now()).slice(-6)}`, name: adminVoterName, role: newAccountRole, password: `${passwordName}${Math.floor(10000 + Math.random() * 90000)}`, voted: false }
    setAccounts((current) => [...current, account])
    setAdminCredential(`${account.id} · ${account.password}`)
    setAdminVoterName('')
    setAdminEligibility('')
  }

  const deleteAccount = (accountId: string) => {
    if (!canManageElection || accountId === sessionId) return
    setAccounts((current) => current.filter((account) => account.id !== accountId))
  }

  const deleteCandidate = (candidateName: string) => {
    if (!canManageElection) return
    setCandidateList((current) => current.filter((candidate) => candidate.name !== candidateName))
  }

  const castVote = () => {
    if (!session || session.role !== 'voter' || session.voted || !selected) return
    setAccounts((current) => current.map((account) => account.id === session.id ? { ...account, voted: true } : account))
    setVoted(true)
  }

  if (!session) return <LoginScreen loginId={loginId} setLoginId={setLoginId} loginPassword={loginPassword} setLoginPassword={setLoginPassword} loginError={loginError} login={login} />

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Liberian Student Union home">
          <span className="brand-mark">LSU</span>
          <span>Liberian Student Union</span>
        </a>
        <div className="election-status"><span className="status-dot" /> Live election · Mianyang campus</div>
        <div className="session-chip">{session.role} · {session.name}</div>
        <button className="mode-button" type="button" onClick={() => setSessionId(null)}>Sign out</button>
      </header>

      <div className="content-grid" id="top">
        {role !== 'voter' ? (
          <section className="admin-console">
            <div className="eyebrow"><span className="eyebrow-line" /> {role === 'admin' ? 'ELECTION ADMINISTRATION' : 'PUBLIC AUDIT VIEW'} <span className="eyebrow-line" /></div>
            <div className="intro-row admin-intro"><div><h1>{role === 'admin' ? <>Run the <em>union.</em></> : <>Inspect the <em>election.</em></>}</h1><p className="intro-copy">{role === 'admin' ? 'Manage the LSU election, issue student credentials, and monitor participation with accountability.' : 'Review student participation, election records, and public events without access to election controls.'}</p></div><div className="admin-state"><span className="status-dot" /> {role === 'admin' ? 'ELECTION LIVE' : 'READ ONLY'}<strong>Friday · {countdown}</strong></div></div>
            <div className="admin-metrics"><div><span>ISSUED ACCOUNTS</span><strong>{accounts.length}</strong><small>Admin-controlled credentials</small></div><div><span>BALLOTS CAST</span><strong>{accounts.filter((account) => account.voted).length}</strong><small>{accounts.filter((account) => account.role === 'voter' && account.voted).length} voter receipts</small></div><div><span>CHAIN HEALTH</span><strong>99.98%</strong><small className="healthy">● All validators online</small></div></div>
            <div className="admin-columns">
              {canManageElection ? <section className="panel-accent candidate-manager"><div className="panel-label">01 <span>Candidate registry</span></div><h2>Publish a candidate</h2><p>Add the presidential and VP ticket to the public LSU ballot.</p><div className="admin-form"><label>PRESIDENTIAL CANDIDATE<input value={candidateName} onChange={(event) => setCandidateName(event.target.value)} placeholder="e.g. Jordan Davis" /></label><label>VICE PRESIDENT CANDIDATE<input value={candidateVp} onChange={(event) => setCandidateVp(event.target.value)} placeholder="e.g. Alex Johnson" /></label><label>PLATFORM OR SLATE<input value={candidateParty} onChange={(event) => setCandidateParty(event.target.value)} placeholder="e.g. Student First" /></label><label>PHOTO URL<input value={candidateImage} onChange={(event) => setCandidateImage(event.target.value)} placeholder="https://..." /></label><label>ONE-LINE PLATFORM<textarea value={candidatePlan} onChange={(event) => setCandidatePlan(event.target.value)} placeholder="What will this ticket deliver for students?" /></label><button className="primary-button" type="button" disabled={!candidateName || !candidateVp || !candidateParty || !candidatePlan} onClick={publishCandidate}>Publish ticket <span>↗</span></button>{published && <div className="published-note">✓ Candidate ticket published to the ballot</div>}</div></section> : <section className="side-panel access-panel"><div className="panel-label">01 <span>Access policy</span></div><h2>Read-only access</h2><p>Auditors can verify public chain events and election totals. Candidate, credential, and ballot controls are restricted to election administrators.</p><span className="verified-pill">AUDITOR ROLE ACTIVE</span></section>}
              <section className="side-panel registry-panel"><div className="side-heading"><span>PUBLIC BALLOT</span><span className="verified-pill">{candidateList.length} TICKETS</span></div><div className="registry-list">{candidateList.map((candidate) => <div className="registry-item" key={candidate.name}>{candidate.image ? <img className="candidate-photo" src={candidate.image} alt="" /> : <span className={`candidate-mark ${candidate.color}`}>{candidate.mark}</span>}<div><strong>{candidate.name}</strong><span>VP: {candidate.vpName}</span><span>{candidate.role}</span></div>{canManageElection ? <button className="delete-button" type="button" onClick={() => deleteCandidate(candidate.name)}>Delete</button> : <b>LIVE</b>}</div>)}</div><button className="outline-button" type="button">Preview voter ballot <span>↗</span></button></section>
            </div>
            <section className="side-panel monitor-panel"><div className="side-heading"><span>LIVE ELECTION MONITOR</span><button type="button" className="live-tag"><span className="status-dot" /> LIVE</button></div><div className="monitor-grid"><div><span>LAST BLOCK</span><strong>#008421</strong><small>sealed 18 sec ago</small></div><div><span>REGISTRATIONS / HR</span><strong>126</strong><small>within expected range</small></div><div><span>VOTE DUPLICATES</span><strong>0</strong><small className="healthy">● No anomalies detected</small></div><div><span>PUBLIC AUDIT</span><strong>Open</strong><small>All receipts verifiable</small></div></div></section>
            {canManageElection && <section className="side-panel admin-credential-panel"><div className="panel-label">02 <span>Voter credentials</span></div><h2>Issue a credential</h2><p>Use only after checking the voter against the official eligibility register.</p><div className="admin-form"><label>VOTER NAME<input value={adminVoterName} onChange={(event) => setAdminVoterName(event.target.value)} placeholder="Verified voter name" /></label><label>ELIGIBILITY REFERENCE<input value={adminEligibility} onChange={(event) => setAdminEligibility(event.target.value)} placeholder="Official reference" /></label><button className="primary-button" type="button" disabled={!adminVoterName || !adminEligibility} onClick={issueAdminCredential}>Issue credential <span>↗</span></button>{adminCredential && <div className="published-note">✓ Credential issued: {adminCredential}</div>}</div></section>}
            {canManageElection && <section className="side-panel admin-credential-panel"><div className="panel-label">02 <span>Admin-issued login credentials</span></div><h2>Generate access</h2><p>Verify the person first, assign their role, then hand them the generated login details.</p><div className="admin-form"><label>ACCOUNT NAME<input value={adminVoterName} onChange={(event) => setAdminVoterName(event.target.value)} placeholder="Verified person" /></label><label>ELIGIBILITY REFERENCE<input value={adminEligibility} onChange={(event) => setAdminEligibility(event.target.value)} placeholder="Official reference" /></label><label>ASSIGN ROLE<select value={newAccountRole} onChange={(event) => setNewAccountRole(event.target.value as Role)}><option value="voter">Voter</option><option value="auditor">Auditor</option><option value="admin">Election admin</option></select></label><button className="primary-button" type="button" disabled={!adminVoterName || !adminEligibility} onClick={issueAdminCredential}>Generate credential <span>↗</span></button>{adminCredential && <div className="published-note">✓ Login issued: {adminCredential}</div>}</div></section>}
            {canManageElection && <section className="side-panel account-registry-panel"><div className="side-heading"><span>ISSUED CREDENTIALS</span><span className="verified-pill">{accounts.length} ACCOUNTS</span></div><div className="account-list">{accounts.map((account) => <div className="account-row" key={account.id}><div><strong>{account.name}</strong><span>{account.id} · {account.role}</span></div>{account.id === sessionId ? <small className="current-account">CURRENT</small> : <button className="delete-button" type="button" onClick={() => deleteAccount(account.id)}>Delete</button>}</div>)}</div></section>}
          </section>
        ) : (
          <>
            <section className="main-column">
              <div className="eyebrow"><span className="eyebrow-line" /> 2026 LOCAL ELECTION <span className="eyebrow-line" /></div>
              <div className="intro-row">
                <div>
                  <h1>Your vote, <em>verified.</em></h1>
                  <h1>Your voice, <em>represented.</em></h1>
                  <p className="intro-copy">Choose the student leaders who will represent the Liberian Student Union in Mianyang.</p>
                </div>
                <div className="deadline"><span>ELECTION DAY · FRIDAY, SEPTEMBER 25</span><strong>{countdown || 'Friday at 08:00'}</strong></div>
              </div>

              {!registered ? (
                <section className="registration-panel panel-accent">
                  <div className="panel-label">01 <span>Identity check</span></div>
                  <h2>Credential required</h2>
                  <p>Your account was not issued voter access. Contact the election administrator to verify your eligibility and receive a voter credential.</p>
                  <p>Your account was not issued voter access. Contact the LSU election committee to verify your student eligibility and receive a voter credential.</p>
                  <div className="input-row">
                    <div className="privacy-note"><span>◈</span> Login roles and credentials are controlled by the administrator</div>
                  </div>
                </section>
              ) : voted ? (
                <section className="receipt-panel panel-accent">
                  <div className="success-icon">✓</div>
                  <div className="panel-label">BALLOT CAST <span>Receipt confirmed</span></div>
                  <h2>Your vote is sealed.</h2>
                  <p>Your encrypted ballot was committed to the Civic Ledger. It can be counted, but never connected back to your identity.</p>
                  <p>Your encrypted ballot was committed to the LSU election record. It can be counted, but never connected back to your identity.</p>
                  <div className="receipt-code"><span>TRANSACTION HASH</span><strong>0x7fa2e1...91b4c08d</strong><button type="button" title="Copy receipt">□</button></div>
                  <button className="text-button" type="button" onClick={() => setVoted(false)}>View ballot receipt <span>↗</span></button>
                </section>
              ) : (
                <section className="ballot-panel panel-accent">
                  <div className="panel-label">02 <span>Select one candidate</span></div>
                  <h2>Make your choice</h2>
                  <div className="candidate-list">
                    {candidateList.map((candidate) => (
                      <button className={`candidate-card ${selected === candidate.name ? 'selected' : ''}`} type="button" key={candidate.name} onClick={() => setSelected(candidate.name)}>
                        {candidate.image ? <img className="candidate-photo" src={candidate.image} alt="" /> : <span className={`candidate-mark ${candidate.color}`}>{candidate.mark}</span>}
                        <span className="candidate-info"><strong>{candidate.name}</strong><small>VP: {candidate.vpName} · {candidate.role}</small><span>{candidate.detail}</span></span>
                        <span className="radio-mark">{selected === candidate.name ? '✓' : ''}</span>
                      </button>
                    ))}
                  </div>
                  <div className="ballot-footer"><span><span className="lock">⌁</span> Your selection is encrypted</span><button className="primary-button" type="button" disabled={!selected || session.voted} onClick={castVote}>Cast my vote <span>↗</span></button></div>
                </section>
              )}

              <div className="trust-row"><span><b>◈</b> VERIFIED IDENTITY</span><span><b>⌁</b> PRIVATE BALLOT</span><span><b>◉</b> PUBLICLY AUDITABLE</span></div>
            </section>

            <aside className="sidebar">
              <section className="side-panel voter-panel">
                <div className="side-heading"><span>YOUR STATUS</span><span className="verified-pill">● VERIFIED</span></div>
                <div className="profile-row"><div className="avatar">{session.name.slice(0, 2).toUpperCase()}</div><div><strong>{session.name}</strong><span>Credential ···· {session.id.slice(-4)}</span></div><span className="check-badge">✓</span></div>
                <div className="profile-meta"><span>REGISTRATION</span><strong>{registered ? 'Complete' : 'Not started'}</strong></div>
              </section>

              <section className="side-panel activity-panel">
                <div className="side-heading"><span>CHAIN ACTIVITY</span><button type="button" className="live-tag"><span className="status-dot" /> LIVE</button></div>
                <div className="chain-number"><strong>{String(8421 + accounts.length)}</strong><span>blocks confirmed</span></div>
                <div className="chain-line">{accountBlocks.map((event) => <div className="chain-event" key={event.title}><span className={`event-dot ${event.tone}`} /><div><small>{event.time}</small><strong>{event.title}</strong><span>{event.meta}</span></div></div>)}</div>
                <button className="outline-button" type="button">Open block explorer <span>↗</span></button>
              </section>

              <section className="side-panel principle-panel"><span className="principle-kicker">THE LSU ELECTION PRINCIPLE</span><blockquote>“Every student voice matters, every ballot is private, and every result is accountable.”</blockquote><span className="principle-author">— Liberian Student Union · Mianyang</span></section>
            </aside>
          </>
        )}
      </div>
      <footer className="footer"><span>© 2026 Liberian Student Union</span><span>Mianyang campus election</span><span>Election record <i className="status-dot" /> Operational</span></footer>
    </main>
  )
}

function LoginScreen({ loginId, setLoginId, loginPassword, setLoginPassword, loginError, login }: { loginId: string; setLoginId: (value: string) => void; loginPassword: string; setLoginPassword: (value: string) => void; loginError: string; login: () => void }) {
  return (
    <main className="login-shell">
      <section className="login-card">
        <div className="brand login-brand"><span className="brand-mark">LSU</span><span>Liberian Student Union</span></div>
        <div className="eyebrow"><span className="eyebrow-line" /> SECURE ELECTION ACCESS <span className="eyebrow-line" /></div>
        <h1>Enter your <em>credential.</em></h1>
        <p>Credentials are generated and distributed by the LSU election committee. Your assigned role controls what you can access.</p>
        <label className="login-field">LOGIN CREDENTIAL<input value={loginId} onChange={(event) => setLoginId(event.target.value)} placeholder="e.g. VOTER-123456" autoComplete="username" /></label>
        <label className="login-field">PASSWORD<input value={loginPassword} onChange={(event) => setLoginPassword(event.target.value)} placeholder="Enter your password" type="password" autoComplete="current-password" onKeyDown={(event) => event.key === 'Enter' && login()} /></label>
        {loginError && <div className="login-error">{loginError}</div>}
        <button className="primary-button login-button" type="button" onClick={login}>Log in securely <span>↗</span></button>
        <div className="login-note"><span>◈</span> Access is controlled by the election administrator</div>
      </section>
    </main>
  )
}

export default App
