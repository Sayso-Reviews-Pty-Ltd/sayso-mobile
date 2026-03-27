import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { useRouter } from 'expo-router';
import { AuthGateSheet } from '../components/AuthGateSheet';
import { routes } from '../navigation/routes';

type AuthGateConfig = {
  /** e.g. "Log in to save The Test Kitchen" */
  message: string;
};

type AuthGateContextValue = {
  showAuthGate: (config: AuthGateConfig) => void;
};

const AuthGateContext = createContext<AuthGateContextValue | null>(null);

export function AuthGateProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [config, setConfig] = useState<AuthGateConfig | null>(null);

  const showAuthGate = useCallback((next: AuthGateConfig) => {
    setConfig(next);
  }, []);

  const dismiss = useCallback(() => setConfig(null), []);

  const handleLogin = useCallback(() => {
    dismiss();
    router.push(routes.login() as never);
  }, [dismiss, router]);

  const handleRegister = useCallback(() => {
    dismiss();
    router.push(routes.register() as never);
  }, [dismiss, router]);

  return (
    <AuthGateContext.Provider value={{ showAuthGate }}>
      {children}
      <AuthGateSheet
        visible={config !== null}
        message={config?.message ?? ''}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onDismiss={dismiss}
      />
    </AuthGateContext.Provider>
  );
}

export function useAuthGate(): AuthGateContextValue {
  const ctx = useContext(AuthGateContext);
  if (!ctx) throw new Error('useAuthGate must be used inside AuthGateProvider');
  return ctx;
}
