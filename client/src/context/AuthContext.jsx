import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { authService } from "../services/authService";
import {
  requestPushPermission,
  listenForegroundMessages,
} from "../services/pushNotificationService";

const AuthContext = createContext(null);
const TOKEN_KEY = "eksathe_token";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hydrate = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authService.getMe();
        setUser(res.data);
        // Start listening for foreground messages after hydration
        listenForegroundMessages();
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    hydrate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const saveToken = useCallback((newToken) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
  }, []);

  const login = useCallback(
    async (credentials) => {
      const res = await authService.login(credentials);
      saveToken(res.token);
      setUser(res.data);
      // Start foreground listener immediately after login
      listenForegroundMessages();
      // Non-blocking — request push permission 2s after login
      setTimeout(() => {
        requestPushPermission().catch(() => {});
      }, 2000);
      return res;
    },
    [saveToken],
  );

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
    }
  }, []);

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!token && !!user,
    login,
    logout,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};