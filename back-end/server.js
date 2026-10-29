// back-end/server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

// ==========================================
// CONFIGURAÇÃO DO BANCO DE DADOS (MONGODB)
// ==========================================
mongoose.connection.on('connected', () => {
  console.log('✅ Conectado ao MongoDB com sucesso!');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Erro na conexão do Mongoose:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose desconectado.');
});

mongoose.connect(process.env.MONGODB_URI)
  .catch((err) => {
    console.error('❌ Erro inicial de configuração no Mongoose.connect:', err.message);
  });

// ==========================================
// MODELO DE DADOS (SCHEMA)
// ==========================================
const FavoriteSchema = new mongoose.Schema({
  coinId: { type: String, required: true, unique: true },
  favoritedAt: { type: Date, default: Date.now }
});

const Favorite = mongoose.model('Favorite', FavoriteSchema);

// ==========================================
// ROTAS DA API
// ==========================================
app.get('/api/status', (req, res) => {
  res.json({
    status: "online",
    message: "O back-end está conversando com o front-end com sucesso!"
  });
});

// ==========================================
// CLIENTE COINGECKO (chave + cache)
// ==========================================
// COINGECKO_API_KEY  -> sua chave (Demo começa com "CG-")
// COINGECKO_PLAN     -> "demo" (padrão) ou "pro"
const CG_KEY = (process.env.COINGECKO_API_KEY || '').trim().replace(/^["']|["']$/g, '');
const CG_PLAN = (process.env.COINGECKO_PLAN || 'demo').toLowerCase();
const CG_BASE = CG_PLAN === 'pro'
  ? 'https://pro-api.coingecko.com/api/v3'
  : 'https://api.coingecko.com/api/v3';

if (!CG_KEY) {
  console.warn('⚠️  COINGECKO_API_KEY não definida — usando a API pública sem chave (limite bem menor).');
}

const coingecko = axios.create({
  baseURL: CG_BASE,
  timeout: 10000,
  headers: CG_KEY
    ? { [CG_PLAN === 'pro' ? 'x-cg-pro-api-key' : 'x-cg-demo-api-key']: CG_KEY }
    : {}
});

// Cache em memória: evita estourar o limite de requisições do plano Demo
const cache = new Map();
async function cgGet(path, params = {}, ttlMs = 60_000) {
  const key = path + JSON.stringify(params);
  const hit = cache.get(key);
  if (hit && Date.now() - hit.time < ttlMs) return hit.data;

  const { data } = await coingecko.get(path, { params });
  cache.set(key, { data, time: Date.now() });
  return data;
}

// Repassa ao front o erro real da CoinGecko (em vez de um 500 genérico)
function handleCgError(res, error, contexto) {
  const status = error.response?.status;
  const detalhe = error.response?.data?.status?.error_message
    || error.response?.data?.error
    || error.message;
  console.error(`Erro CoinGecko [${contexto}] (${status ?? 'sem resposta'}):`, detalhe);

  if (status === 401 || status === 403) {
    return res.status(502).json({ error: 'Chave da CoinGecko inválida, revogada ou do plano errado.', detalhe });
  }
  if (status === 429) {
    return res.status(429).json({ error: 'Limite de requisições da CoinGecko atingido. Tente em instantes.' });
  }
  if (status === 404) {
    return res.status(404).json({ error: 'Moeda não encontrada.' });
  }
  return res.status(502).json({ error: 'Erro ao buscar dados da CoinGecko', detalhe });
}

// Diagnóstico rápido da chave: GET /api/status/coingecko
app.get('/api/status/coingecko', async (req, res) => {
  try {
    const data = await coingecko.get('/ping').then(r => r.data);
    res.json({ ok: true, plano: CG_PLAN, chaveConfigurada: Boolean(CG_KEY), resposta: data });
  } catch (error) {
    res.status(502).json({
      ok: false,
      plano: CG_PLAN,
      chaveConfigurada: Boolean(CG_KEY),
      status: error.response?.status,
      detalhe: error.response?.data?.status?.error_message || error.message
    });
  }
});

// Lista geral (100 moedas)
app.get('/api/coins', async (req, res) => {
  try {
    const data = await cgGet('/coins/markets', {
      vs_currency: 'usd',
      order: 'market_cap_desc',
      per_page: 100,
      page: 1,
      sparkline: false
    });
    res.json(data);
  } catch (error) {
    handleCgError(res, error, 'lista de moedas');
  }
});

// Detalhes de UMA moeda por ID
app.get('/api/coins/:id', async (req, res) => {
  try {
    const data = await cgGet(`/coins/${encodeURIComponent(req.params.id)}`, {
      localization: false,
      tickers: false,
      market_data: true,
      community_data: false,
      developer_data: false,
      sparkline: false
    }, 120_000);
    res.json(data);
  } catch (error) {
    handleCgError(res, error, `detalhes ${req.params.id}`);
  }
});

// ==========================================
// ROTAS DE FAVORITOS (SALVAR NO MONGODB)
// ==========================================
app.get('/api/favorites', async (req, res) => {
  try {
    const favorites = await Favorite.find().sort({ favoritedAt: -1 });
    res.json(favorites);
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error.message);
    res.status(500).json({ error: 'Erro ao buscar favoritos' });
  }
});

app.post('/api/favorites', async (req, res) => {
  try {
    const { coinId } = req.body;
    if (!coinId) return res.status(400).json({ error: 'O coinId é obrigatório' });

    const newFavorite = new Favorite({ coinId });
    await newFavorite.save();
    res.status(201).json({ message: 'Moeda favoritada com sucesso!', favorite: newFavorite });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ error: 'Esta moeda já está nos favoritos' });
    console.error('Erro ao salvar favorito:', error.message);
    res.status(500).json({ error: 'Erro ao salvar favorito' });
  }
});

app.delete('/api/favorites/:coinId', async (req, res) => {
  try {
    const { coinId } = req.params;
    const deleted = await Favorite.findOneAndDelete({ coinId });
    if (!deleted) return res.status(404).json({ error: 'Moeda não encontrada nos favoritos' });
    res.json({ message: 'Moeda removida dos favoritos com sucesso!' });
  } catch (error) {
    console.error('Erro ao remover favorito:', error.message);
    res.status(500).json({ error: 'Erro ao remover favorito' });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));