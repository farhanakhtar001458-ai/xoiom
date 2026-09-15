import { useHashRoute } from './lib/hooks.jsx';
import { ToastProvider } from './components/ui.jsx';
import Home from './pages/Home.jsx';
import AdminPage from './admin/AdminPage.jsx';

export default function App() {
  const route = useHashRoute();
  const isAdmin = route === '/admin' || route.startsWith('/admin/');
  return (
    <ToastProvider>
      {isAdmin ? <AdminPage /> : <Home />}
    </ToastProvider>
  );
}
