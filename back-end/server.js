// back-end/server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors'); // Declarado apenas uma vez, perfeito!
const mongoose = require('mongoose'); 

const app = express();

// Configurações do Express (Middlewares)
app.use(cors()); // Liberado para o front-end se conectar sem erros de CORS!
app.use(express.json());

const PORT = process.env.PORT || 3001;

// ==========================================
// CONFIGURAÇÃO DO BANCO DE DADOS (MONGODB)
// ==========================================

// Ouvintes de eventos para monitorar a conexão em tempo real
mongoose.connection.on('connected', () => {
  console.log('✅ Conectado ao MongoDB com sucesso!');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Erro na conexão do Mongoose:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('🔌 Mongoose desconectado.');
});

// Conecta de fato usando a URL do arquivo .env
mongoose.connect(process.env.MONGODB_URI)
  .catch((err) => {
    console.error('❌ Erro inicial de configuração no Mongoose.connect:', err.message);
  });

// ==========================================
// MODELO DE DADOS (SCHEMA) - NOVO!
// ==========================================
const FavoriteSchema = new mongoose.Schema({
  coinId: {
    type: String,
    required: true,
    unique: true // Evita duplicados no banco
  },
  favoritedAt: {
    type: Date,
    default: Date.now
  }
});

const Favorite = mongoose.model('Favorite', FavoriteSchema);

// ==========================================
// ROTAS DA API
// ==========================================

// Rota de teste inicial para o Front-end
app.get('/api/status', (req, res) => {
  res.json({ 
    status: "online", 
    message: "O back-end está conversando com o front-end com sucesso!" 
  });
});

// Rota oficial para buscar as criptomoedas da CoinGecko (Geral - 100 moedas)
app.get('/api/coins', async (req, res) => {
  try {
    const response = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 100,
        page: 1,
        sparkline: false
      },
      headers: {
        'x-cg-demo-api-key': process.env.COINGECKO_API_KEY 
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error('Erro na requisição geral de moedas:', error.message);
    res.status(500).json({ error: 'Erro ao buscar dados da API' });
  }
});

// Buscar detalhes de UMA moeda por ID
app.get('/api/coins/:id', async (req, res) => {
  try {
    const { id } = req.params; // Captura o ID vindo da URL (ex: 'bitcoin', 'ethereum')
    
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${id}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false,
        sparkline: false
      },
      headers: {
        'x-cg-demo-api-key': process.env.COINGECKO_API_KEY 
      }
    });
    
    res.json(response.data);
  } catch (error) {
    console.error(`Erro ao buscar detalhes da moeda [${req.params.id}]:`, error.message);
    res.status(500).json({ error: 'Erro ao buscar detalhes da moeda específica' });
  }
});

// ==========================================
// ROTAS DE FAVORITOS (SALVAR NO MONGODB) - NOVO!
// ==========================================

// 1. GET - Listar todos os favoritos salvos no banco
app.get('/api/favorites', async (req, res) => {
  try {
    const favorites = await Favorite.find().sort({ favoritedAt: -1 });
    res.json(favorites);
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error.message);
    res.status(500).json({ error: 'Erro ao buscar favoritos' });
  }
});

// 2. POST - Adicionar um novo favorito ao banco
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

// 3. DELETE - Remover um favorito do banco usando o coinId direto
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