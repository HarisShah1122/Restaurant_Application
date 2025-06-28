import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ isAuthenticated, setIsAuthenticated }) {
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light shadow-sm p-3 mb-5 bg-body rounded animate__animated animate__slideInDown">
            <div className="container-fluid">
                <Link className="navbar-brand" to="/">
                    {/* Inline SVG logo */}
                    <svg width="40" height="40" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="50" cy="50" r="40" stroke="green" strokeWidth="4" fill="gold" />
                        <text x="50" y="58" fontSize="28" textAnchor="middle" fill="white" fontFamily="Arial" fontWeight="bold">DD</text>
                    </svg>
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav ms-auto">
                        <li className="nav-item">
                            <Link className="nav-link" to="/search" data-bs-toggle="tooltip" title="Find Restaurants">
                                Search <i className="bi bi-search"></i>
                            </Link>
                        </li>
                        {!isAuthenticated && (
                            <>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/login" data-bs-toggle="tooltip" title="Sign In">
                                        Login <i className="bi bi-box-arrow-in-right"></i>
                                    </Link>
                                </li>
                                <li className="nav-item">
                                    <Link className="nav-link" to="/register" data-bs-toggle="tooltip" title="Create Account">
                                        Register <i className="bi bi-person-plus"></i>
                                    </Link>
                                </li>
                            </>
                        )}
                        {isAuthenticated && (
                            <li className="nav-item">
                                <Link
                                    className="nav-link"
                                    to="/login"
                                    onClick={() => { localStorage.removeItem('token'); setIsAuthenticated(false); }}
                                    data-bs-toggle="tooltip"
                                    title="Sign Out"
                                >
                                    Logout <i className="bi bi-box-arrow-right"></i>
                                </Link>
                            </li>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
