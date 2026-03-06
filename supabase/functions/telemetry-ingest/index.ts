import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      return new Response(JSON.stringify({ error: 'Supabase env is not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const body = await req.json();
    const {
      reactorId,
      reactorName,
      location,
      status,
      temperature,
      ph,
      pressure,
      flowRate,
      enzymeActivity,
      substrateConcentration,
      productYield,
      dissolvedOxygen,
      uptimeHours = 0,
      unresolvedAlerts = 0,
      capturedAt,
    } = body || {};

    if (!reactorId || !reactorName || temperature === undefined || ph === undefined) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: reactorId, reactorName, temperature, ph' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const row = {
      reactor_id: reactorId,
      reactor_name: reactorName,
      location: location || 'Unknown',
      status: status || 'running',
      temperature: Number(temperature),
      ph: Number(ph),
      pressure: Number(pressure || 0),
      flow_rate: Number(flowRate || 0),
      enzyme_activity: Number(enzymeActivity || 0),
      substrate_concentration: Number(substrateConcentration || 0),
      product_yield: Number(productYield || 0),
      dissolved_oxygen: Number(dissolvedOxygen || 0),
      uptime_hours: Number(uptimeHours || 0),
      unresolved_alerts: Number(unresolvedAlerts || 0),
      captured_at: capturedAt ? new Date(capturedAt).toISOString() : new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('telemetry_events')
      .insert(row)
      .select('id, created_at')
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ inserted: data }), {
      status: 201,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unexpected error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

