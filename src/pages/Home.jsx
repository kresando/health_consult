import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Bot, MessageSquare, Shield, Clock, Users, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const navigate = useNavigate();
  const { user, signInWithGoogle } = useAuth();

  const handleGetStarted = async () => {
    if (!user) {
      try {
        await signInWithGoogle();
      } catch (error) {
        console.error('Error signing in:', error);
      }
    }
    navigate('/consultation');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-8">
                <Bot className="w-10 h-10 text-primary" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Konsultasi Kesehatan dengan{' '}
                <span className="text-primary">AI Assistant</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Dapatkan informasi kesehatan yang akurat dan terpercaya dari AI Health Assistant kami.
                Konsultasi kapan saja, di mana saja.
              </p>
              <button
                onClick={handleGetStarted}
                className="inline-flex items-center justify-center rounded-xl text-lg font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-8 transition-colors"
              >
                Mulai Konsultasi
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Fitur Unggulan</h2>
            <p className="text-muted-foreground">Nikmati berbagai kemudahan dalam konsultasi kesehatan</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: MessageSquare,
                title: "Chat AI Cerdas",
                description: "Dapatkan jawaban cepat dan akurat untuk setiap pertanyaan kesehatan Anda"
              },
              {
                icon: Shield,
                title: "Privasi Terjamin",
                description: "Data Anda dilindungi dengan sistem keamanan tingkat tinggi"
              },
              {
                icon: Clock,
                title: "24/7 Tersedia",
                description: "Akses kapan saja dan di mana saja, sistem kami selalu siap membantu"
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { number: "24/7", label: "Layanan" },
              { number: "100%", label: "Privasi" },
              { number: "1000+", label: "Konsultasi" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2 }}
                className="text-center p-6 rounded-xl bg-primary/5"
              >
                <div className="text-4xl font-bold text-primary mb-2">{stat.number}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Mulai Konsultasi Sekarang</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Dapatkan jawaban untuk pertanyaan kesehatan Anda dengan cepat dan mudah
          </p>
          <button
            onClick={handleGetStarted}
            className="inline-flex items-center justify-center rounded-xl text-lg font-medium bg-background text-primary hover:bg-background/90 h-12 px-8 transition-colors"
          >
            {user ? 'Lanjutkan Konsultasi' : 'Masuk dengan Google'}
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </section>
    </div>
  );
}
