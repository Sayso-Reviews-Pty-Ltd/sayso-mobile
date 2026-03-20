export type AuthMode = 'login' | 'register';

export type LoginScreenProps = {
  defaultMode?: AuthMode;
};

export type FocusedField = 'username' | 'email' | 'password' | null;
