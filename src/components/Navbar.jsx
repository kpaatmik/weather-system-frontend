import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Navbar({ admin = false }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  async function handleLogout() { await logout(); navigate('/login', { replace: true }) }
  return <header className="topbar">
    <Link className="brand" to={admin ? '/admin' : '/dashboard'}><span className="brand-mark">w</span><span>weather<span className="brand-dot">.</span>local</span></Link>
    <div className="topbar-actions">
      <span className="identity"><span className="identity-dot" />{user?.username}<small>{user?.role}</small></span>
      <button className="button button-quiet" onClick={handleLogout}>Log out</button>
    </div>
  </header>
}
