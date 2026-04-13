import useFetch from "../hooks/useFetch"


function Home(){
    const {data, loading, error} = useFetch(
       '/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1&sparkline=false'
    )

    if (loading) return <h1 className="loader">Carregando moedas...</h1>
    if (error) return <h1 className="error">Erro ao buscar dados da API</h1>

    return(
        <main className="container">
            <h1>Cripto Atualizadas</h1>
            <div className="coin-list">
                {data && data.map(coin =>(
                    <div key={coin.id} className="coin-item">
                        <img src={coin.image} alt={coin.name} width={30} />
                        <span>{coin.name}</span>
                        <span> U$ {coin.current_price.toLocaleString()}</span>
                    </div>
                ))}
            </div>
        </main>
    )
}

export default Home