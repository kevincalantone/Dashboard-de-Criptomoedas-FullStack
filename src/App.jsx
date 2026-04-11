import { useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Favorites from './pages/Favorites'
import CoinDetails from './pages/CoinDetails'
import Navbar from './components/Navbar'
import './styles/global.css'


function App() {


  return (
      <>
      <BrowserRouter>
          {/* A Navbar fica fora das Routes para aparecer em todas as páginas */}
          <Navbar/>
          <Routes>
            <Route path='/' element={<Home/>}/>
            <Route path='/favorites' element={<Favorites/>}/>
            {/* O :id é um parâmetro dinâmico para sabermos qual moeda abrir */}
            <Route path='/coin/:id' element={<CoinDetails/>}/>
          </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
