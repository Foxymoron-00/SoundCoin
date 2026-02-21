import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Headphones, Github, Chrome } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { signIn, signInWithOAuth } from '@/lib/supabase';

export function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    try {
      await signInWithOAuth(provider);
    } catch (error: any) {
      toast.error(error.message || `Failed to sign in with ${provider}`);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-8 flex items-center justify-center">
      <div className="w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <Headphones className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-semibold text-white font-['Fraunces']">
              SoundCoin
            </span>
          </Link>
        </div>

        {/* Login Card */}
        <div className="glass-card p-8">
          <h1 className="text-2xl font-medium text-white text-center mb-2 font-['Fraunces']">
            Welcome Back
          </h1>
          <p className="text-white/60 text-center mb-8">
            Sign in to continue earning
          </p>

          {/* OAuth Buttons */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <Button
              variant="outline"
              onClick={() => handleOAuth('google')}
              className="border-white/20 hover:bg-white/5"
            >
              <Chrome className="w-5 h-5 mr-2" />
              Google
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOAuth('github')}
              className="border-white/20 hover:bg-white/5"
            >
              <Github className="w-5 h-5 mr-2" />
              GitHub
            </Button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#0a0a0a] text-white/40">Or continue with</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-2 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 py-6 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#FF5A65] focus:ring-[#FF5A65]/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-white/60 mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 pr-12 py-6 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#FF5A65] focus:ring-[#FF5A65]/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                  className="border-white/20 data-[state=checked]:bg-[#FF5A65] data-[state=checked]:border-[#FF5A65]"
                />
                <label htmlFor="remember" className="text-sm text-white/60">
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-[#FF5A65] hover:text-[#FF8A93]"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full btn-primary py-6"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center mt-6 text-white/60">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#FF5A65] hover:text-[#FF8A93]">
              Sign up
            </Link>
          </p>
        </div>

        {/* Trust Badges */}
        <div className="mt-8 flex items-center justify-center gap-6 text-white/40 text-sm">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Secure
          </span>
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Free Forever
          </span>
        </div>
      </div>
    </div>
  );
}
