/**
 * SoundCoin API Worker
 * Cloudflare Worker for serverless backend functions
 */

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle CORS preflight
function handleCORS(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
}

// Verify JWT token (simplified - in production use proper JWT verification)
async function verifyToken(request) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  // In production, verify the JWT with Supabase
  return authHeader.slice(7);
}

// API Routes
const routes = {
  // Health check
  '/api/health': async (request, env) => {
    return jsonResponse({ status: 'ok', timestamp: new Date().toISOString() });
  },

  // Get tracks with filters
  '/api/tracks': async (request, env) => {
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    const genre = searchParams.get('genre');
    const mood = searchParams.get('mood');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    try {
      // Query Supabase
      const supabaseUrl = env.SUPABASE_URL;
      const supabaseKey = env.SUPABASE_SERVICE_KEY;

      let query = `${supabaseUrl}/rest/v1/tracks?select=*&active=eq.true`;
      
      if (genre) query += `&genre=eq.${encodeURIComponent(genre)}`;
      if (mood) query += `&mood=eq.${encodeURIComponent(mood)}`;
      if (search) query += `&or=(title.ilike.*${search}*,artist.ilike.*${search}*)`;
      
      query += `&order=created_at.desc&limit=${limit}&offset=${offset}`;

      const response = await fetch(query, {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      });

      const data = await response.json();
      return jsonResponse({ tracks: data });
    } catch (error) {
      return jsonResponse({ error: error.message }, 500);
    }
  },

  // Get single track
  '/api/tracks/:id': async (request, env, params) => {
    try {
      const supabaseUrl = env.SUPABASE_URL;
      const supabaseKey = env.SUPABASE_SERVICE_KEY;

      const response = await fetch(
        `${supabaseUrl}/rest/v1/tracks?id=eq.${params.id}&select=*`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );

      const data = await response.json();
      return jsonResponse({ track: data[0] || null });
    } catch (error) {
      return jsonResponse({ error: error.message }, 500);
    }
  },

  // Record ad view and award coins
  '/api/ads/view': async (request, env) => {
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    const token = await verifyToken(request);
    if (!token) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    try {
      const body = await request.json();
      const { ad_id, track_id, completed } = body;

      const supabaseUrl = env.SUPABASE_URL;
      const supabaseKey = env.SUPABASE_SERVICE_KEY;

      // Get user ID from token (simplified)
      // In production, decode JWT to get user_id
      const user_id = body.user_id; // Should be extracted from JWT

      // Get ad details
      const adResponse = await fetch(
        `${supabaseUrl}/rest/v1/ads?id=eq.${ad_id}&select=coin_reward`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );

      const adData = await adResponse.json();
      const coinReward = adData[0]?.coin_reward || 5;

      // Record ad view
      const viewResponse = await fetch(
        `${supabaseUrl}/rest/v1/ad_views`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            user_id,
            ad_id,
            track_id,
            completed,
            verified: true,
            coins_earned: completed ? coinReward : 0,
            viewed_at: new Date().toISOString(),
          }),
        }
      );

      if (!viewResponse.ok) {
        throw new Error('Failed to record ad view');
      }

      // Award coins if completed
      if (completed) {
        // Get current coins
        const profileResponse = await fetch(
          `${supabaseUrl}/rest/v1/profiles?id=eq.${user_id}&select=coins`,
          {
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
            },
          }
        );

        const profileData = await profileResponse.json();
        const currentCoins = profileData[0]?.coins || 0;

        // Update coins
        await fetch(
          `${supabaseUrl}/rest/v1/profiles?id=eq.${user_id}`,
          {
            method: 'PATCH',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
              coins: currentCoins + coinReward,
              updated_at: new Date().toISOString(),
            }),
          }
        );

        // Record transaction
        await fetch(
          `${supabaseUrl}/rest/v1/coin_transactions`,
          {
            method: 'POST',
            headers: {
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=minimal',
            },
            body: JSON.stringify({
              user_id,
              amount: coinReward,
              type: 'earned',
              description: 'Ad view reward',
              related_ad_id: ad_id,
              created_at: new Date().toISOString(),
            }),
          }
        );
      }

      return jsonResponse({
        success: true,
        coins_earned: completed ? coinReward : 0,
      });
    } catch (error) {
      return jsonResponse({ error: error.message }, 500);
    }
  },

  // Create redemption request
  '/api/redemptions': async (request, env) => {
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405);
    }

    const token = await verifyToken(request);
    if (!token) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    try {
      const body = await request.json();
      const { user_id, amount, coins_used, method, paypal_email } = body;

      const supabaseUrl = env.SUPABASE_URL;
      const supabaseKey = env.SUPABASE_SERVICE_KEY;

      // Verify user has enough coins
      const profileResponse = await fetch(
        `${supabaseUrl}/rest/v1/profiles?id=eq.${user_id}&select=coins`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );

      const profileData = await profileResponse.json();
      const currentCoins = profileData[0]?.coins || 0;

      if (currentCoins < coins_used) {
        return jsonResponse({ error: 'Insufficient coins' }, 400);
      }

      // Create redemption
      const redemptionResponse = await fetch(
        `${supabaseUrl}/rest/v1/redemptions`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            user_id,
            amount,
            coins_used,
            method,
            paypal_email,
            status: 'pending',
            requested_at: new Date().toISOString(),
          }),
        }
      );

      const redemptionData = await redemptionResponse.json();

      // Deduct coins
      await fetch(
        `${supabaseUrl}/rest/v1/profiles?id=eq.${user_id}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            coins: currentCoins - coins_used,
            updated_at: new Date().toISOString(),
          }),
        }
      );

      // Record transaction
      await fetch(
        `${supabaseUrl}/rest/v1/coin_transactions`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            user_id,
            amount: -coins_used,
            type: 'redeemed',
            description: `Redemption: $${amount}`,
            created_at: new Date().toISOString(),
          }),
        }
      );

      return jsonResponse({
        success: true,
        redemption: redemptionData[0],
      });
    } catch (error) {
      return jsonResponse({ error: error.message }, 500);
    }
  },

  // Get admin stats
  '/api/admin/stats': async (request, env) => {
    const token = await verifyToken(request);
    if (!token) {
      return jsonResponse({ error: 'Unauthorized' }, 401);
    }

    try {
      const supabaseUrl = env.SUPABASE_URL;
      const supabaseKey = env.SUPABASE_SERVICE_KEY;

      // Get counts
      const [usersRes, tracksRes, adsRes, pendingRes] = await Promise.all([
        fetch(`${supabaseUrl}/rest/v1/profiles?select=id`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
        }),
        fetch(`${supabaseUrl}/rest/v1/tracks?select=id`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
        }),
        fetch(`${supabaseUrl}/rest/v1/ads?select=id`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
        }),
        fetch(`${supabaseUrl}/rest/v1/redemptions?status=eq.pending&select=id`, {
          headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
        }),
      ]);

      const [users, tracks, ads, pending] = await Promise.all([
        usersRes.json(),
        tracksRes.json(),
        adsRes.json(),
        pendingRes.json(),
      ]);

      return jsonResponse({
        total_users: users.length,
        total_tracks: tracks.length,
        total_ads: ads.length,
        pending_redemptions: pending.length,
      });
    } catch (error) {
      return jsonResponse({ error: error.message }, 500);
    }
  },
};

// Helper function for JSON responses
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

// Main request handler
export default {
  async fetch(request, env, ctx) {
    // Handle CORS
    const corsResponse = handleCORS(request);
    if (corsResponse) return corsResponse;

    const url = new URL(request.url);
    const path = url.pathname;

    // Find matching route
    for (const [route, handler] of Object.entries(routes)) {
      // Simple route matching (in production use a proper router)
      if (route === path || path.startsWith(route.replace(':id', ''))) {
        // Extract params if needed
        const params = {};
        if (route.includes(':id')) {
          const routeParts = route.split('/');
          const pathParts = path.split('/');
          routeParts.forEach((part, i) => {
            if (part.startsWith(':')) {
              params[part.slice(1)] = pathParts[i];
            }
          });
        }
        return handler(request, env, params);
      }
    }

    // 404 for unknown routes
    return jsonResponse({ error: 'Not found' }, 404);
  },
};
