import { useState, useEffect } from 'react';
import api from '../services/api'; 

const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!url) return;

    const fetchData = async () => {
      setLoading(true);
      try {
    
        const response = await api.get(url);
        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err.message || 'Erro ao buscar dados');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [url]);

  return { data, loading, error };
};

export default useFetch;