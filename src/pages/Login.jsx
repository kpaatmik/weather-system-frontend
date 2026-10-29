import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { normalizeApiError } from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login, user, isAuthenticated, isLoading } = useAuth(); const navigate = useNavigate(); const location = useLocation()
  const [form, setForm] = useState({ username: '', password: '' }); const [error, setError] = useState('')
  if (isAuthenticated) return <Navigate to={user?.role === 'ADMIN' ? '/admin' : '/dashboard'} replace />
  function update(event) { setForm({ ...form, [event.target.name]: event.target.value }); setError('') }
  async function submit(event) { event.preventDefault(); if (!form.username || !form.password) return setError('Enter your username and password to continue.'); try { const user = await login(form); const destination = location.state?.from?.pathname || (user.role === 'ADMIN' ? '/admin' : '/dashboard'); navigate(destination, { replace: true }) } catch (requestError) { setError(requestError.response?.status === 401 ? 'Invalid username or password.' : normalizeApiError(requestError).message) } }
  return <main className="auth-shell"><div className="auth-aside"><Link className="brand brand-light" to="/login"><span className="brand-mark">w</span><span>weather<span className="brand-dot">.</span>local</span></Link><div className="aside-copy"><span className="eyebrow">A calmer forecast</span><h1>Know the sky before you step outside.</h1><p>Local conditions, without the noise. See what is happening in the cities that matter to you.</p></div><div className="aside-foot">Built for everyday weather watchers <span>✦</span></div></div><section className="auth-panel"><div className="form-box"><span className="eyebrow">Welcome back</span><h2>Sign in to your forecast</h2><p className="form-intro">Your local weather, right where you left it.</p><form onSubmit={submit} noValidate><label>Username<input name="username" value={form.username} onChange={update} autoComplete="username" placeholder="e.g. maya" /></label><label>Password<input type="password" name="password" value={form.password} onChange={update} autoComplete="current-password" placeholder="Your password" /></label>{error && <div className="form-error">{error}</div>}<button className="button button-primary button-wide" disabled={isLoading}>{isLoading ? 'Signing in...' : 'Sign in'} <span>→</span></button></form><p className="switch-auth">New here? <Link to="/register">Create an account</Link></p></div></section></main>
}
