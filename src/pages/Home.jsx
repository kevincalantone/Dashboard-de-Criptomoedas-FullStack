import { useState, useEffect } from "react"
import CoinCard from "../components/CoinCard"
import useFetch from "../hooks/useFetch"


function Home(){
    const {data, loading, error} = useFetch(
       '/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false'
    )

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


    if (loading) return <h1 className="loader">Carregando moedas...</h1>
    if (error) return <h1 className="error">Erro ao buscar dados da API</h1>

    return(
        <main className="container">
            <h1 className="title">Mercado de Cripto</h1>
            <div className="coin-grid">
                {data && data.map(coin =>(
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