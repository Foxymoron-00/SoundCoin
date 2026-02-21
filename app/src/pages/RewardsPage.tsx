import { useState } from 'react';
import { Coins, Wallet, History, Gift, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useCoins } from '@/hooks/useCoins';
import type { User } from '@/types';

interface RewardsPageProps {
  user: User;
}

// Sustainable coin model:
// 1 coin = $0.0001 (10,000 coins = $1)
// Audio ad: 1 coin, Video ad: 3 coins
const redemptionOptions = [
  { coins: 1000, value: 0.1, label: '$0.10', popular: false },    // ~333 audio ads
  { coins: 2500, value: 0.25, label: '$0.25', popular: true },    // ~833 audio ads
  { coins: 5000, value: 0.5, label: '$0.50', popular: false },    // ~1667 audio ads
  { coins: 10000, value: 1.0, label: '$1.00', popular: false },   // ~3333 audio ads
];

export function RewardsPage({ user }: RewardsPageProps) {
  const { coins, redemptions, loading, redeemCoins, getCoinValue } = useCoins(user.id);
  const [selectedOption, setSelectedOption] = useState<typeof redemptionOptions[0] | null>(null);
  const [paypalEmail, setPaypalEmail] = useState('');
  const [showRedeemDialog, setShowRedeemDialog] = useState(false);

  const handleRedeem = async () => {
    if (!selectedOption) return;

    if (coins < selectedOption.coins) {
      toast.error('Insufficient coins');
      return;
    }

    if (!paypalEmail) {
      toast.error('Please enter your PayPal email');
      return;
    }

    const result = await redeemCoins(selectedOption.coins, 'paypal', paypalEmail);

    if (result) {
      toast.success(`Redemption request submitted! You'll receive ${selectedOption.label} soon.`);
      setShowRedeemDialog(false);
      setSelectedOption(null);
      setPaypalEmail('');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
      approved: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
      completed: 'bg-green-500/20 text-green-500 border-green-500/30',
      rejected: 'bg-red-500/20 text-red-500 border-red-500/30',
    };

    return (
      <Badge variant="outline" className={variants[status] || ''}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Calculate estimated earnings
  const audioAdsNeeded = Math.ceil(coins / 1);
  const videoAdsNeeded = Math.ceil(coins / 3);

  return (
    <div className="min-h-screen pt-24 pb-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl sm:text-4xl font-medium text-white mb-4 font-['Fraunces']">
            Your <span className="gradient-text">Rewards</span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Redeem your hard-earned SoundCoins for real cash via PayPal
          </p>
        </div>

        {/* Balance Card */}
        <div className="glass-card p-8 mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Coins className="w-8 h-8 text-[#FF5A65]" />
            <span className="text-white/60">Current Balance</span>
          </div>
          <div className="flex items-baseline justify-center gap-2 mb-2">
            <span className="text-6xl font-bold gradient-text">{coins.toLocaleString()}</span>
            <span className="text-2xl text-white/60">SoundCoins</span>
          </div>
          <p className="text-white/40">
            ≈ ${getCoinValue(coins)} USD
          </p>
          
          {/* Progress to next milestone */}
          <div className="mt-6 max-w-md mx-auto">
            <div className="flex justify-between text-sm text-white/40 mb-2">
              <span>Progress to $0.10</span>
              <span>{Math.min(Math.round((coins / 1000) * 100), 100)}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div 
                className="h-full gradient-bg rounded-full transition-all duration-500"
                style={{ width: `${Math.min((coins / 1000) * 100, 100)}%` }}
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-white/40">
            <AlertCircle className="w-4 h-4" />
            <span>1,000 SoundCoins = $0.10 USD</span>
          </div>
        </div>

        {/* Earning Stats */}
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          <div className="glass-card p-6 text-center">
            <p className="text-white/60 text-sm mb-2">Audio Ads Watched</p>
            <p className="text-2xl font-bold text-white">~{audioAdsNeeded.toLocaleString()}</p>
            <p className="text-white/40 text-xs mt-1">1 coin per ad</p>
          </div>
          <div className="glass-card p-6 text-center">
            <p className="text-white/60 text-sm mb-2">Video Ads Watched</p>
            <p className="text-2xl font-bold text-white">~{videoAdsNeeded.toLocaleString()}</p>
            <p className="text-white/40 text-xs mt-1">3 coins per ad</p>
          </div>
        </div>

        {/* Redemption Options */}
        <div className="mb-12">
          <h2 className="text-xl font-medium text-white mb-6 flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#FF5A65]" />
            Redeem Options
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {redemptionOptions.map((option) => (
              <div
                key={option.coins}
                className={`relative glass-card p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
                  selectedOption?.coins === option.coins
                    ? 'border-[#FF5A65] bg-[#FF5A65]/5'
                    : ''
                } ${coins < option.coins ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => coins >= option.coins && setSelectedOption(option)}
              >
                {option.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[#FF5A65] text-white">Popular</Badge>
                  </div>
                )}

                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">
                    {option.label}
                  </div>
                  <div className="flex items-center justify-center gap-1 text-white/60 mb-4">
                    <Coins className="w-4 h-4" />
                    <span>{option.coins.toLocaleString()} SoundCoins</span>
                  </div>
                  
                  <div className="text-xs text-white/40 mb-4">
                    ~{Math.ceil(option.coins / 3)} video ads
                  </div>

                  <Dialog
                    open={showRedeemDialog && selectedOption?.coins === option.coins}
                    onOpenChange={setShowRedeemDialog}
                  >
                    <DialogTrigger asChild>
                      <Button
                        className="w-full btn-primary"
                        disabled={coins < option.coins}
                        onClick={() => setSelectedOption(option)}
                      >
                        {coins < option.coins ? 'Not Enough' : 'Redeem'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-[#1a1a1a] border-white/10">
                      <DialogHeader>
                        <DialogTitle className="text-white">Redeem SoundCoins</DialogTitle>
                        <DialogDescription className="text-white/60">
                          You're about to redeem {option.coins.toLocaleString()} SoundCoins for {option.label}
                        </DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 mt-4">
                        <div>
                          <label className="text-sm text-white/60 mb-2 block">
                            PayPal Email
                          </label>
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            value={paypalEmail}
                            onChange={(e) => setPaypalEmail(e.target.value)}
                            className="bg-white/5 border-white/10 text-white"
                          />
                        </div>

                        <div className="glass-card p-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-white/60">SoundCoins to redeem:</span>
                            <span className="text-white">{option.coins.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-white/60">You'll receive:</span>
                            <span className="text-[#FF5A65] font-medium">
                              {option.label}
                            </span>
                          </div>
                        </div>

                        <Button
                          onClick={handleRedeem}
                          className="w-full btn-primary"
                          disabled={loading}
                        >
                          {loading ? 'Processing...' : 'Confirm Redemption'}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Gift Cards Section */}
        <div className="mb-12">
          <h2 className="text-xl font-medium text-white mb-6 flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#FF5A65]" />
            Gift Cards (Coming Soon)
          </h2>

          <div className="grid sm:grid-cols-3 gap-4 opacity-50">
            {['Amazon', 'Spotify', 'Apple'].map((brand) => (
              <div key={brand} className="glass-card p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                  <Gift className="w-8 h-8 text-white/40" />
                </div>
                <h3 className="text-white font-medium">{brand}</h3>
                <p className="text-white/40 text-sm mt-1">Coming soon</p>
              </div>
            ))}
          </div>
        </div>

        {/* Redemption History */}
        <div>
          <h2 className="text-xl font-medium text-white mb-6 flex items-center gap-2">
            <History className="w-5 h-5 text-[#FF5A65]" />
            Redemption History
          </h2>

          {redemptions.length === 0 ? (
            <div className="glass-card p-8 text-center">
              <History className="w-12 h-12 text-white/20 mx-auto mb-4" />
              <h3 className="text-white mb-2">No redemptions yet</h3>
              <p className="text-white/60">Start listening to earn SoundCoins!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {redemptions.map((redemption) => (
                <div
                  key={redemption.id}
                  className="glass-card p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    {getStatusIcon(redemption.status)}
                    <div>
                      <p className="text-white font-medium">
                        ${redemption.amount.toFixed(2)} via{' '}
                        {redemption.method.charAt(0).toUpperCase() +
                          redemption.method.slice(1)}
                      </p>
                      <p className="text-white/40 text-sm">
                        {redemption.coins_used.toLocaleString()} SoundCoins •{' '}
                        {new Date(redemption.requested_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(redemption.status)}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="mt-12 glass-card p-6">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-[#FF5A65]" />
            How Redemptions Work
          </h3>
          <ul className="space-y-2 text-white/60 text-sm">
            <li>• Redemptions are processed within 24-48 hours</li>
            <li>• PayPal payments are sent to your registered email</li>
            <li>• Minimum redemption is 1,000 SoundCoins ($0.10)</li>
            <li>• No fees or charges on redemptions</li>
            <li>• Watch video ads to earn 3x faster!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
