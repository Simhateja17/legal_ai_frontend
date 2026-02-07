import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

interface LayoutProps {
  healthy: boolean | null;
  onNewChat: () => void;
}

export default function Layout({ healthy, onNewChat }: LayoutProps) {
  return (
    <div className="flex h-screen">
      <Sidebar healthy={healthy} onNewChat={onNewChat} />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
