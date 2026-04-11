//gerenciar o "carregando" automaticamente.

import { useState, useEffect } from "react";
import api from '../services/api'

export function useFetch(url){
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            try{
                setLoading(true)
                // O "await" trava a execução aqui até a API responder
                const response = await api.get(url)
                setData(response.data)
            }catch(err){
                setError(err)
            }finally{
                setLoading(false)
            }
        }
        fetchData()
        
    }, [url]);

    return {data, loading, error}
}