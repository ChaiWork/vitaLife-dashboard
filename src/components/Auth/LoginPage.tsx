import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Activity } from 'lucide-react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword 
} from '../../lib/firebase';

export const LoginPage: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email. Please register first.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else {
        setError(err.message || 'An error occurred during authentication');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      if (err.code === 'auth/popup-blocked') {
        setError('The Google login popup was blocked. Please allow popups for this site or open the app in a new tab.');
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError('Login was cancelled. Please try again.');
      } else {
        setError(err.message || 'Google login failed. Please ensure third-party cookies are enabled.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-minimal-bg p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 md:p-12 rounded-[40px] max-w-md w-full text-center relative z-10"
      >
        <div className="w-16 h-16 bg-minimal-blue text-white rounded-2xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-minimal-blue/20">
          <Activity size={32} />
        </div>
        <h1 className="text-3xl font-bold mb-2 tracking-tight text-minimal-ink">VitaLifeAssistant</h1>
        <p className="text-minimal-muted mb-8 text-sm leading-relaxed">
          {isRegistering ? 'Create your health account' : 'Welcome back to your health intelligence'}
        </p>

        <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
          <div className="text-left space-y-1">
            <label className="text-[10px] uppercase font-bold text-minimal-muted tracking-widest px-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-minimal-white border border-minimal-border rounded-xl focus:ring-2 focus:ring-minimal-blue/20 outline-none transition-all text-sm"
              placeholder="name@example.com"
            />
          </div>
          <div className="text-left space-y-1">
            <label className="text-[10px] uppercase font-bold text-minimal-muted tracking-widest px-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-minimal-white border border-minimal-border rounded-xl focus:ring-2 focus:ring-minimal-blue/20 outline-none transition-all text-sm"
              placeholder="••••••••"
            />
          </div>
          
          {error && <p className="text-xs text-red-500 mt-2 bg-red-50 dark:bg-red-950/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30 leading-tight">{error}</p>}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-minimal-ink text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isRegistering ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-minimal-border"></div></div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-widest"><span className="bg-minimal-white px-4 text-minimal-muted font-bold">Or continue with</span></div>
        </div>
        
        <button 
          onClick={handleGoogleLogin}
          type="button"
          disabled={loading}
          className="w-full py-3 bg-minimal-white border border-minimal-border text-minimal-ink rounded-xl font-semibold text-sm hover:bg-minimal-bg transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
          Sign in with Google
        </button>

        <p className="mt-8 text-xs text-minimal-muted">
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button 
            onClick={() => setIsRegistering(!isRegistering)}
            className="text-minimal-blue font-bold hover:underline"
          >
            {isRegistering ? 'Sign In' : 'Create one'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};
