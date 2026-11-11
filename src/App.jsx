import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { esES } from '@mui/x-date-pickers/locales';
import 'dayjs/locale/es';
import { AuthProvider } from './context/AuthContext';
import { ThemeContextProvider } from './context/ThemeContext';
import AppRouter from './routes/AppRouter';

export default function App() {
  return (
    <AuthProvider>
      <ThemeContextProvider>
        {/* Spanish calendars (Monday first) for every DateField */}
        <LocalizationProvider
          dateAdapter={AdapterDayjs}
          adapterLocale="es"
          localeText={esES.components.MuiLocalizationProvider.defaultProps.localeText}
        >
          <AppRouter />
        </LocalizationProvider>
      </ThemeContextProvider>
    </AuthProvider>
  );
}
