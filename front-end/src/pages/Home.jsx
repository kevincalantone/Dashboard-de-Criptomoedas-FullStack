import { useState, useEffect } from "react"
// Substituímos o useFetch pelo serviço da API
import api from "../services/api" 
import CoinCard from "../components/CoinCard"
import SearchBar from "../components/SearchBar"
import Loader from "../components/Loader"

function Home(){
 
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)
    const [search, setSearch] = useState('')

    const [favorites, setFavorites] = useState(() =>{
        const saved = localStorage.getItem('@cripto-favs')
        return saved ? JSON.parse(saved) : []
    })

    useEffect(() => {
        async function loadCoins() {
            try {
                setLoading(true)
              
                const response = await api.get('/coins/markets', {
                    params: {
                        vs_currency: 'usd',
                        order: 'market_cap_desc',
                        per_page: 10,
                        page: 1,
                        sparkline: false
                    }
                })
                setData(response.data)
                setError(false)
            } catch (err) {
                console.error(err)
                setError(true)
            } finally {
                setLoading(false)
            }
        }

        loadCoins()
    }, [])

    useEffect(() =>{
        localStorage.setItem('@cripto-favs', JSON.stringify(favorites))
    }, [favorites])

    function handleFav(id){
        if (favorites.includes(id)){
            setFavorites(favorites.filter(fav => fav !== id))
        } else {
            setFavorites([...favorites, id])
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
                {filteredCoins && filteredCoins.map(coin =>(
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