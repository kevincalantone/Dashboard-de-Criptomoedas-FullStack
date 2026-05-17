import { useState, useEffect } from "react"
import api from "../services/api" 
import CoinCard from "../components/CoinCard"
import SearchBar from "../components/SearchBar"
import Loader from "../components/Loader"
import { toast } from 'react-toastify'

function Home(){
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [search, setSearch] = useState('')
    const [favorites, setFavorites] = useState([]) 
    const [orderBy, setOrderBy] = useState('market_cap_desc')

    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true)
                const response = await api.get('/coins') 
                setData(response.data)

                const favsResponse = await api.get('/favorites')
                const favIds = favsResponse.data.map(fav => fav.coinId)
                setFavorites(favIds)

                setError(false)
            } catch (err) {
                console.error("Erro ao buscar dados:", err)
                setError(true)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [])

    async function handleFav(id) {
        try {
            if (favorites.includes(id)) {
                await api.delete(`/favorites/${id}`)
                setFavorites(favorites.filter(fav => fav !== id))
                toast.info("Moeda removida dos favoritos!")
            } else {
                await api.post('/favorites', { coinId: id })
                setFavorites([...favorites, id])
                toast.success("Moeda favoritada com sucesso! ✨")
            }
        } catch (err) {
            console.error("Erro ao atualizar favorito no banco:", err)
            toast.error("Erro ao processar favorito.")
        }
    }

    const filteredCoins = data?.filter(coin =>
        coin.name.toLowerCase().includes(search.toLowerCase())
    )

    const sortedCoins = filteredCoins ? [...filteredCoins].sort((a, b) => {
        if (orderBy === 'price_desc') return b.current_price - a.current_price
        if (orderBy === 'price_asc') return a.current_price - b.current_price
        if (orderBy === 'name_asc') return a.name.localeCompare(b.name)
        return b.market_cap - a.market_cap
    }) : []

    if (loading) return <Loader/>
    if (error) return <h1 className="error">Erro ao buscar dados da API</h1>

    return(
        <main className="container">
            <h1 className="title">Rastreador Cripto</h1>
            
            <div className="filter-container">
                <SearchBar value={search} onChange={setSearch}/>
                
                <select value={orderBy} onChange={(e) => setOrderBy(e.target.value)}>
                    <option value="market_cap_desc">Mais Relevantes</option>
                    <option value="price_desc">Preço: Maior para Menor</option>
                    <option value="price_asc">Preço: Menor para Maior</option>
                    <option value="name_asc">Nome: A-Z</option>
                </select>
            </div>

            <div className="coin-grid">
                {sortedCoins.map(coin => (
                  <CoinCard 
                   key={coin.id}
                   coin={coin}
                   isFav={favorites.includes(coin.id)} 
                   onFav={() => handleFav(coin.id)} 
                   />
                ))}
            </div>
        </main>
    )
}

export default Home