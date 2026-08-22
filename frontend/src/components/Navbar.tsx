import { Link, NavLink } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/hr', label: 'HR Interview' },
  { to: '/debate', label: 'Debate' },
  { to: '/history', label: 'Sessions' },
]

export default function Navbar() {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-8 py-6">
        <Link to="/" className="font-serif text-lg italic tracking-tight text-slate-200">
          SpeakWise
        </Link>
        <div className="flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `rounded-full px-4 py-1.5 text-xs font-medium tracking-wide transition-colors ${
                  isActive ? 'text-ember-300' : 'text-slate-500 hover:text-slate-300'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>
      </nav>
    </header>
  )
}
