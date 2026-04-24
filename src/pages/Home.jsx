import { useState, useEffect } from "react"
import CoinCard from "../components/CoinCard"
import useFetch from "../hooks/useFetch"
import SearchBar from "../components/SearchBar"
import Loader  from "../components/Loader"

function Home(){
    const {data, loading, error} = useFetch(
       '/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false'
    )


    // --- NOVO: Estado para armazenar o texto da busca ---
    const [search, setSearch] = useState('')

    const [favorites, setFavorites] = useState(() =>{
        const saved = localStorage.getItem('@cripto-favs')
        return saved ? JSON.parse(saved) : []
    })

    useEffect(() =>{
        localStorage.setItem('@cripto-favs', JSON.stringify(favorites))
    }, [favorites])

    function handleFav(id){
        if (favorites.includes(id)){
            setFavorites(favorites.filter(fav =>fav !== id))
        } else {
            setFavorites([...favorites,id])
        }
    }

    //lista filtrada baseada no que o usuário digita
    const filteredCoins = data?.filter(coin =>
        coin.name.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) return <Loader/>
    if (error) return <h1 className="error">Erro ao buscar dados da API</h1>

    return(
        <main className="container">
            <h1 className="title">Mercado de Cripto</h1>
            
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