import { useState, useEffect } from 'react'
import useFetch from '../hooks/useFetch'
import CoinCard from '../components/CoinCard'
import Loader from '../components/Loader'

function Favorites() {
  const { data, loading, error } = useFetch(
    '/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false'
  )

  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('@cripto-favs')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    localStorage.setItem('@cripto-favs', JSON.stringify(favorites))
  }, [favorites])

  const handleFav = (id) => {
    setFavorites(favorites.filter(fav => fav !== id))
  }

  const favoriteCoins = data?.filter(coin => favorites.includes(coin.id))

  if (loading) return <Loader />
  if (error) return <h1 className="error">Erro ao carregar favoritos</h1>

  return (
    <main className="container">
      <h1 className="title">Meus Favoritos</h1>

      {favoriteCoins?.length > 0 ? (
        <div className="coin-grid">
          {favoriteCoins.map(coin => (
            <CoinCard
              key={coin.id}
              coin={coin}
              isFav={true}
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