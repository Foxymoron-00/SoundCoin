import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Headphones, Github, Chrome, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { signUp, signInWithOAuth } from '@/lib/supabase';

export function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const passwordRequirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'Contains a number', met: /\d/.test(password) },
    { label: 'Contains a special character', met: /[!@#$%^&*]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }

    setLoading(true);

    try {
      await signUp(email, password, username);
      toast.success('Account created! Please check your email to verify.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    try {
      await signInWithOAuth(provider);
    } catch (error: any) {
      toast.error(error.message || `Failed to sign up with ${provider}`);
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

        {/* Register Card */}
        <div className="glass-card p-8">
          <h1 className="text-2xl font-medium text-white text-center mb-2 font-['Fraunces']">
            Create Account
          </h1>
          <p className="text-white/60 text-center mb-8">
            Start earning while you listen
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
              <span className="px-2 bg-[#0a0a0a] text-white/40">Or sign up with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-2 block">Username</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  type="text"
                  placeholder="musiclover"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-12 py-6 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#FF5A65] focus:ring-[#FF5A65]/20"
                  required
                />
              </div>
            </div>

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

              {/* Password Requirements */}
              <div className="mt-3 space-y-1">
                {passwordRequirements.map((req) => (
                  <div
                    key={req.label}
                    className={`flex items-center gap-2 text-xs ${
                      req.met ? 'text-green-500' : 'text-white/40'
                    }`}
                  >
                    <CheckCircle className={`w-3 h-3 ${req.met ? 'opacity-100' : 'opacity-40'}`} />
                    {req.label}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-white/60 mb-2 block">Confirm Password</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pl-12 py-6 bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-[#FF5A65] focus:ring-[#FF5A65]/20"
                  required
                />
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="terms"
                checked={agreeTerms}
                onCheckedChange={(checked) => setAgreeTerms(checked as boolean)}
                className="mt-1 border-white/20 data-[state=checked]:bg-[#FF5A65] data-[state=checked]:border-[#FF5A65]"
              />
              <label htmlFor="terms" className="text-sm text-white/60">
                I agree to the{' '}
                <Link to="/terms" className="text-[#FF5A65] hover:text-[#FF8A93]">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="text-[#FF5A65] hover:text-[#FF8A93]">
                  Privacy Policy
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              className="w-full btn-primary py-6"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="text-center mt-6 text-white/60">
            Already have an account?{' '}
            <Link to="/login" className="text-[#FF5A65] hover:text-[#FF8A93]">
              Sign in
            </Link>
          </p>
        </div>

        {/* Benefits */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          {[
            { icon: '🎵', label: 'Free Music' },
            { icon: '💰', label: 'Earn Coins' },
            { icon: '🎁', label: 'Real Rewards' },
          ].map((item) => (
            <div key={item.label} className="text-white/60">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="text-xs">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
