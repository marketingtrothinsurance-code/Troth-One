import { useState, type FormEvent } from 'react'
import { ArrowRight, Eye, EyeOff, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react'

interface Props {
  onLogin: (username: string, password: string) => boolean
}

interface FieldErrors {
  username?: string
  password?: string
}

export function LoginPage({onLogin}: Props) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [loginError, setLoginError] = useState('')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const errors: FieldErrors = {}
    if (!username.trim()) errors.username = 'Username is required.'
    if (!password) errors.password = 'Password is required.'
    setFieldErrors(errors)
    setLoginError('')
    if (Object.keys(errors).length) return
    if (!onLogin(username, password)) setLoginError('Invalid username or password.')
  }

  return <main className="login-page">
    <section className="login-brand-panel" aria-label="TROTH ONE introduction">
      <div className="login-brand">
        <span>T1</span>
        <div><b>TROTH ONE</b><small>FINANCIAL SERVICES</small></div>
      </div>
      <div className="login-brand-copy">
        <span className="login-eyebrow">ONE CONNECTED WORKSPACE</span>
        <h1>Financial services,<br/>managed with clarity.</h1>
        <p>Access your secure workspace for customers, applications, operations and business performance.</p>
      </div>
      <div className="login-trust"><ShieldCheck/><div><b>Trusted workspace</b><span>Purpose-built for efficient financial operations</span></div></div>
      <div className="login-brand-orbit orbit-one"/><div className="login-brand-orbit orbit-two"/>
    </section>

    <section className="login-form-panel">
      <div className="login-mobile-brand">
        <span>T1</span><div><b>TROTH ONE</b><small>FINANCIAL SERVICES</small></div>
      </div>
      <div className="login-card">
        <header>
          <span className="login-lock"><LockKeyhole/></span>
          <h2>Welcome back</h2>
          <p>Sign in to continue to TROTH ONE</p>
        </header>

        <form onSubmit={submit} noValidate>
          {loginError && <div className="login-error" role="alert">{loginError}</div>}
          <label className={fieldErrors.username ? 'invalid' : ''}>
            <span>Username</span>
            <div className="login-input"><UserRound/><input autoFocus autoComplete="username" value={username} onChange={event=>{setUsername(event.target.value);setFieldErrors(current=>({...current,username:undefined}));setLoginError('')}} placeholder="Enter your username" aria-invalid={Boolean(fieldErrors.username)} aria-describedby={fieldErrors.username?'username-error':undefined}/></div>
            {fieldErrors.username && <small id="username-error">{fieldErrors.username}</small>}
          </label>
          <label className={fieldErrors.password ? 'invalid' : ''}>
            <span>Password</span>
            <div className="login-input"><LockKeyhole/><input type={showPassword?'text':'password'} autoComplete="current-password" value={password} onChange={event=>{setPassword(event.target.value);setFieldErrors(current=>({...current,password:undefined}));setLoginError('')}} placeholder="Enter your password" aria-invalid={Boolean(fieldErrors.password)} aria-describedby={fieldErrors.password?'password-error':undefined}/><button type="button" onClick={()=>setShowPassword(value=>!value)} aria-label={showPassword?'Hide password':'Show password'} title={showPassword?'Hide password':'Show password'}>{showPassword?<EyeOff/>:<Eye/>}</button></div>
            {fieldErrors.password && <small id="password-error">{fieldErrors.password}</small>}
          </label>
          <button className="login-submit" type="submit">Login <ArrowRight/></button>
        </form>

        <footer><ShieldCheck/>Temporary development access. This login is not production authentication.</footer>
      </div>
      <p className="login-copyright">© 2026 TROTH ONE · Financial Services Platform</p>
    </section>
  </main>
}
