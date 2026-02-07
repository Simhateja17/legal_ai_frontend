import { NavLink } from 'react-router-dom';
import de from '../i18n/de';

interface SidebarProps {
  healthy: boolean | null;
  onNewChat: () => void;
}

const links = [
  { to: '/', label: de.nav.chat, icon: '💬' },
  { to: '/suche', label: de.nav.search, icon: '🔍' },
  { to: '/status', label: de.nav.health, icon: '📊' },
  { to: '/einstellungen', label: de.nav.settings, icon: '⚙️' },
];

export default function Sidebar({ healthy, onNewChat }: SidebarProps) {
  return (
    <aside className="flex h-screen w-60 flex-col bg-gray-900 text-gray-100">
      <div className="flex items-center gap-2 px-4 py-5">
        <span className="text-xl">⚖️</span>
        <h1 className="text-base font-semibold">{de.app.title}</h1>
      </div>

      <button
        onClick={onNewChat}
        className="mx-3 mb-4 rounded-lg border border-gray-600 px-3 py-2 text-sm hover:bg-gray-800 transition-colors cursor-pointer"
      >
        + {de.nav.newChat}
      </button>

      <nav className="flex-1 space-y-1 px-3">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive ? 'bg-gray-700 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`
            }
          >
            <span>{link.icon}</span>
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="flex items-center gap-2 px-6 py-4 text-xs text-gray-500">
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            healthy === null ? 'bg-gray-500' : healthy ? 'bg-green-400' : 'bg-red-400'
          }`}
        />
        {healthy === null ? de.health.unknown : healthy ? de.health.connected : de.health.disconnected}
      </div>
    </aside>
  );
}
