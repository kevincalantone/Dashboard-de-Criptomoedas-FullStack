import { useState, useEffect } from 'react'
import api from '../services/api' // Importa a instância configurada
import CoinCard from '../components/CoinCard'
import Loader from '../components/Loader'

function Favorites() {
  const [coins, setCoins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Busca os favoritos do banco e cruza com a rota geral de moedas
  useEffect(() => {
    async function loadFavoriteData() {
      try {
        setLoading(true)

        // 1. Busca os IDs favoritados no seu MongoDB Atlas (/api/favorites)
        const favsResponse = await api.get('/favorites')
        const favIds = favsResponse.data.map(fav => fav.coinId)

        // 2. Busca a lista geral de moedas na sua rota correta do back-end (/api/coins)
        const coinsResponse = await api.get('/coins')

        // 3. Filtra mantendo apenas as moedas que estão salvas no banco
        const favoritedCoins = coinsResponse.data.filter(coin => favIds.includes(coin.id))
        
        setCoins(favoritedCoins)
        setError(false)
      } catch (err) {
        console.error("Erro ao carregar favoritos:", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    loadFavoriteData()
  }, [])

  // Função para remover o favorito direto pelo clique na estrela
  const handleFav = async (id) => {
    try {
      // 1. Avisa o back-end para deletar do MongoDB
      await api.delete(`/favorites/${id}`)
      
      // 2. Remove da tela imediatamente atualizando o estado do React
      setCoins(coins.filter(coin => coin.id !== id))
    } catch (err) {
      console.error("Erro ao remover favorito do banco:", err)
    }
  }

  if (loading) return <Loader />
  if (error) return <h1 className="error">Erro ao carregar favoritos</h1>

  return (
    <main className="container">
      <h1 className="title">Meus Favoritos</h1>

      {coins.length > 0 ? (
        <div className="coin-grid">
          {coins.map(coin => (
            <CoinCard
              key={coin.id}
              coin={coin}
              isFav={true} // Se está nesta página, com certeza está favoritada
              onFav={() => handleFav(coin.id)}
            />
          ))}
        </div>
      ) : (
        <p style={{ textAlign: 'center', marginTop: '50px', color: '#888' }}>
          Você ainda não favoritou nenhuma moeda.
        </p>
      )}
    </main>
  )
}

export default Favorites