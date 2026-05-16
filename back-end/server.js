// back-end/server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose'); // 1. Importamos o Mongoose

const app = express();
app.use(cors());
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
// ROTAS DA API
// ==========================================

// Rota para buscar as criptomoedas
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
    console.error('Erro na requisição:', error.message);
    res.status(500).json({ error: 'Erro ao buscar dados da API' });
  }
});

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));