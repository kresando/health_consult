import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Bot, LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const { signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (user) {
    return <Navigate to="/" />;
  }

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setLoading(true);
      await signInWithGoogle();
      navigate('/');
    } catch (error) {
      setError(error.message);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-card p-8 rounded-2xl shadow-lg"
      >
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
            <Bot className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Selamat Datang di Health Consultation
          </h2>
          <p className="text-muted-foreground">
            Masuk untuk mengakses konsultasi kesehatan personal
          </p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </motion.div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-card hover:bg-muted border shadow-sm py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
            ) : (
              <img src="/google.svg" alt="Google" className="w-5 h-5" />
            )}
            <span className="font-medium">
              {loading ? 'Sedang Masuk...' : 'Lanjutkan dengan Google'}
            </span>
          </button>

          <p className="text-center text-sm text-muted-foreground">
            Dengan melanjutkan, Anda menyetujui{' '}
            <a href="#" className="text-primary hover:underline">
              Ketentuan Layanan
            </a>{' '}
            dan{' '}
            <a href="#" className="text-primary hover:underline">
              Kebijakan Privasi
            </a>{' '}
            kami
          </p>
        </div>
      </motion.div>
    </div>
  );
}
