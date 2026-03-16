import { AuthProvider } from './context/AuthContext';
import { ThemeContextProvider } from './context/ThemeContext';
import AppRouter from './routes/AppRouter';

export default function App() {
  return (
    <AuthProvider>
      <ThemeContextProvider>
        <AppRouter />
      </ThemeContextProvider>
    </AuthProvider>
  );
}
