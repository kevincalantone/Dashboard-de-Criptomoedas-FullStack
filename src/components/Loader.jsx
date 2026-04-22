//Um componente visual para o estado de espera.

import React from 'react'

const Loader = () => {
  return (
    <div className='loader-container'>
      <div className="spinner"></div>
      <p>Buscando dados do mercado...</p>
    </div>
  )
}

export default Loader