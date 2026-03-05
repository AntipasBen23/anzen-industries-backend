const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    service: 'anzen-backend',
    supabaseConfigured: Boolean(supabase),
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/telemetry', async (req, res) => {
  if (!supabase) {
    return res.status(503).json({
      error: 'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    });
  }

  const limit = Math.min(Number(req.query.limit || 100), 500);
  const { data, error } = await supabase
    .from('telemetry_events')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.json({ count: data.length, events: data });
});

app.post('/api/telemetry', async (req, res) => {
  if (!supabase) {
    return res.status(503).json({
      error: 'Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
    });
  }

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
  } = req.body || {};

  if (!reactorId || !reactorName || temperature === undefined || ph === undefined) {
    return res.status(400).json({
      error: 'Missing required fields: reactorId, reactorName, temperature, ph',
    });
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
    captured_at: capturedAt ? new Date(capturedAt) : new Date(),
  };

  const { data, error } = await supabase
    .from('telemetry_events')
    .insert(row)
    .select('id, created_at')
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json({ inserted: data });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`anzen-backend running on http://localhost:${port}`);
});

