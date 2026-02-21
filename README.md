# SoundCoin 🎵💰

A revolutionary royalty-free music streaming platform where listeners earn real rewards. Stream music, watch ads, collect coins, and redeem for PayPal cash.

## Features

### For Listeners
- 🎵 **Curated Music Library** - Thousands of royalty-free tracks
- 💰 **Earn While Listening** - Collect coins for every ad viewed
- 🎯 **Focus Modes** - Special playlists for Focus, Study, Sleep, Workout
- 🎁 **Real Rewards** - Redeem coins for PayPal cash ($0.10 - $1.00)
- 📱 **Modern UI** - Beautiful dark theme with smooth animations
- 🔐 **Secure Auth** - Email/password + OAuth (Google, GitHub)

### For Admins
- 📊 **Dashboard** - Real-time stats and analytics
- 🎶 **Track Management** - Upload and manage music
- 📺 **Ad Management** - Upload audio/video ads
- 💸 **Payout Management** - Review and approve redemptions
- ⚙️ **Platform Settings** - Configure revenue share and coin values

## Tech Stack

### Frontend
- React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- GSAP for animations
- React Router for navigation

### Backend
- Cloudflare Workers (serverless)
- Supabase (PostgreSQL + Auth + Storage)
- PayPal API for payouts

### Infrastructure (All Free Tier)
- **Hosting**: Cloudflare Pages ($0)
- **API**: Cloudflare Workers ($0)
- **Database**: Supabase ($0)
- **Storage**: Supabase Storage ($0)

## Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/soundcoin.git
cd soundcoin

# Install dependencies
cd app
npm install

# Start development server
npm run dev
```

### Environment Setup

Create `app/.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=your_worker_url
```

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

### Quick Deploy

```bash
# Build frontend
cd app
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy dist --project-name=soundcoin-app

# Deploy backend
cd ../backend
wrangler deploy
```

## Project Structure

```
soundcoin/
├── app/                    # Frontend React app
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── sections/       # Landing page sections
│   │   ├── lib/            # Utilities
│   │   └── types/          # TypeScript types
│   ├── public/             # Static assets
│   └── dist/               # Build output
├── backend/                # Cloudflare Worker
│   ├── worker.js           # Main worker code
│   └── wrangler.toml       # Worker config
├── DEPLOYMENT.md           # Deployment guide
└── README.md               # This file
```

## How It Works

### Revenue Model
1. Advertisers pay to show ads on the platform
2. 70% of revenue goes to users as coin rewards
3. 30% goes to platform owner (you)

### Coin System (Sustainable Model)
- 1 SoundCoin = $0.0001 USD (10,000 SoundCoins = $1)
- Audio ads: 1 SoundCoin per view
- Video ads: 3 SoundCoins per view (3x faster earning)
- Minimum redemption: 1,000 SoundCoins ($0.10)

### Ad Modes
- **Audio Mode**: Ads play between songs (background friendly)
- **Video Mode**: Silent video with subtitles (3x coin reward)

## Monetization

### For Platform Owner
- Google AdSense integration
- Direct ad sales
- Premium subscriptions (optional)

### For Users
- PayPal payouts
- Gift cards (coming soon)
- Premium perks (coming soon)

## API Endpoints

### Authentication
- `POST /auth/signup` - Register new user
- `POST /auth/signin` - Login
- `POST /auth/oauth` - OAuth login

### Tracks
- `GET /api/tracks` - List tracks
- `GET /api/tracks/:id` - Get single track
- `POST /api/tracks` - Upload track (admin)

### Ads
- `GET /api/ads` - Get active ad
- `POST /api/ads/view` - Record ad view

### Rewards
- `GET /api/coins/balance` - Get coin balance
- `POST /api/redemptions` - Create redemption
- `GET /api/redemptions` - List redemptions

## Database Schema

See `backend/schema.sql` for complete database schema.

### Key Tables
- `profiles` - User profiles
- `tracks` - Music tracks
- `ads` - Advertisements
- `ad_views` - Ad view tracking
- `coin_transactions` - Coin history
- `redemptions` - Payout requests

## Security

- Row Level Security (RLS) on all tables
- JWT authentication
- Anti-fraud checks on ad views
- Rate limiting on API endpoints

## Customization

### Branding
- Update colors in `app/src/index.css`
- Replace logo in `app/public/`
- Update site metadata in `app/index.html`

### Features
- Add new focus modes in `app/src/pages/PlayerPage.tsx`
- Adjust coin rewards in admin settings
- Configure ad frequency in player hook

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Support

For support, email support@soundcoin.app or open an issue on GitHub.

---

**Built with ❤️ for music lovers everywhere**
