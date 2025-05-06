import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { truncateAddress, formatTokenAmount } from '../utils/helpers';

const Navigation = () => {
  const { wallet, address, balance, resetWallet } = useWallet();
  const location = useLocation();

  const handleLogout = () => {
    resetWallet();
  };

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  // Format balance for display
  const getFormattedBalance = () => {
    if (!balance || balance.length === 0) {
      return '0 stake';
    }
    
    const stakeBalance = balance.find(b => b.denom === 'stake');
    return stakeBalance 
      ? formatTokenAmount(stakeBalance.amount, stakeBalance.denom) 
      : '0 stake';
  };

  return (
    <nav className="navigation">
      <div className="nav-brand">
        <Link to="/">ERP Rollup</Link>
      </div>
      
      <div className="nav-links">
        {wallet ? (
          <>
            <Link to="/groups" className={isActive('/groups')}>Groups</Link>
            <Link to="/journal-entries" className={isActive('/journal-entries')}>Journal Entries</Link>
            <Link to="/send" className={isActive('/send')}>Send &amp; Record</Link>
          </>
        ) : null}
      </div>
      
      <div className="nav-wallet">
        {wallet ? (
          <div className="wallet-info">
            <div className="wallet-address">
              <span className="address-label">Address:</span>
              <span className="address-value">{truncateAddress(address)}</span>
            </div>
            <div className="wallet-balance">
              <span className="balance-label">Balance:</span>
              <span className="balance-value">{getFormattedBalance()}</span>
            </div>
            <button onClick={handleLogout} className="btn-logout">
              Logout
            </button>
          </div>
        ) : (
          <Link to="/" className="btn-connect">
            Connect Wallet
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navigation;