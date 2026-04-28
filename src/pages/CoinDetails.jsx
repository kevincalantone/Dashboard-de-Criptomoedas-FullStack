import { useParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import Loader from '../components/Loader';
import { currencyFormatter } from '../utils/formatter';

const CoinDetails = () => {
  const { id } = useParams(); // Pega o 'id' que vem da URL
  const { data: coin, loading, error } = useFetch(`/coins/${id}`);

  if (loading) return <Loader />;
  if (error) return <h1 className="error">Erro ao carregar detalhes...</h1>;
  if (!coin) return null;

  return (
    <main className="container coin-details">
      <div className="details-header">
        <img src={coin.image?.large} alt={coin.name} />
        <h1>{coin.name} ({coin.symbol?.toUpperCase()})</h1>
      </div>

      <div className="details-info">
        <div className="info-card">
          <h3>Preço Atual</h3>
          <p>{currencyFormatter(coin.market_data?.current_price.usd)}</p>
        </div>
        
        <div className="info-card">
          <h3>Market Cap Rank</h3>
          <p>#{coin.market_cap_rank}</p>
        </div>
      </div>

      <div className="details-description">
        <h3>Sobre a moeda</h3>
        {/* Usamos dangerouslySetInnerHTML porque a API envia a descrição com tags HTML */}
        <p dangerouslySetInnerHTML={{ __html: coin.description?.en }}></p>
      </div>
    </main>
  );
};

export default CoinDetails;