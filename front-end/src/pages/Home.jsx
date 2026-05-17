import { useState, useEffect } from "react"
import api from "../services/api" // Instância configurada do Axios
import CoinCard from "../components/CoinCard"
import SearchBar from "../components/SearchBar"
import Loader from "../components/Loader"

function Home(){
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [search, setSearch] = useState('')
    const [favorites, setFavorites] = useState([]) // Guardará apenas os IDs vindos do banco

    // 1. Carrega as moedas gerais E os favoritos do banco de dados ao iniciar a página
    useEffect(() => {
        async function loadData() {
            try {
                setLoading(true)
                
                // Busca as 100 moedas do mercado
                const response = await api.get('/coins') 
                setData(response.data)

                // Busca os favoritos direto do MongoDB Atlas
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

    // 2. Função de favoritar/desfavoritar atualizada para o banco de dados Full-Stack
    async function handleFav(id) {
        try {
            if (favorites.includes(id)) {
                // Se já é favorito, deleta do MongoDB
                await api.delete(`/favorites/${id}`)
                setFavorites(favorites.filter(fav => fav !== id))
            } else {
                // Se não é favorito, adiciona no MongoDB
                await api.post('/favorites', { coinId: id })
                setFavorites([...favorites, id])
            }
        } catch (err) {
            console.error("Erro ao atualizar favorito no banco:", err)
        }
    }

    const filteredCoins = data?.filter(coin =>
        coin.name.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) return <Loader/>
    if (error) return <h1 className="error">Erro ao buscar dados da API</h1>

    return(
        <main className="container">
            <h1 className="title">Radar Cripto</h1>
            
            <SearchBar value={search} onChange={setSearch}/>

            <div className="coin-grid">
                {filteredCoins && filteredCoins.map(coin => (
                  <CoinCard 
                   key={coin.id}
                   coin={coin}
                   isFav={favorites.includes(coin.id)} // Verifica se o ID está na lista do banco
                   onFav={() => handleFav(coin.id)} 
                   />
                ))}
            </div>
        </main>
    )
}

export default Home