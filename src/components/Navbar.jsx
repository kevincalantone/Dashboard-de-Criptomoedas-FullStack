import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <NavLink to="/">CriptoDash</NavLink>
      </div>
      
      <div className="navbar-links">
        <NavLink to="/" end>Início</NavLink>
        <NavLink to="/favorites">Meus Favoritos</NavLink>
      </div>
    </nav>
  );
};

export default Navbar;