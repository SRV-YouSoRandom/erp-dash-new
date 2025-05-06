import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { createWalletFromMnemonic, createWalletFromPrivateKey } from '../services/wallet';
import { fetchBalance } from '../services/api';

const WalletImport = () => {
  const { setWallet, setAddress, setBalance, loading, setLoading, error, setError } = useWallet();
  const [importType, setImportType] = useState('mnemonic');
  const [mnemonic, setMnemonic] = useState('');
  const [privateKey, setPrivateKey] = useState('');

  const handleImport = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let result;

      if (importType === 'mnemonic') {
        if (!mnemonic.trim()) {
          throw new Error('Please enter a valid mnemonic phrase');
        }
        result = await createWalletFromMnemonic(mnemonic.trim());
      } else {
        if (!privateKey.trim()) {
          throw new Error('Please enter a valid private key');
        }
        result = await createWalletFromPrivateKey(privateKey.trim());
      }

      const { wallet, address } = result;
      setWallet(wallet);
      setAddress(address);

      // Fetch initial balance
      try {
        const balanceData = await fetchBalance(address);
        setBalance(balanceData.balances);
      } catch (balanceError) {
        console.error('Error fetching balance:', balanceError);
        setBalance([]);
      }

      // Clear form
      setMnemonic('');
      setPrivateKey('');
      
    } catch (err) {
      setError(err.message);
      console.error('Wallet import error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wallet-import card">
      <h2>Import Wallet</h2>
      <div className="import-options">
        <button 
          className={`option-btn ${importType === 'mnemonic' ? 'active' : ''}`}
          onClick={() => setImportType('mnemonic')}
        >
          Mnemonic Phrase
        </button>
        <button 
          className={`option-btn ${importType === 'privateKey' ? 'active' : ''}`}
          onClick={() => setImportType('privateKey')}
        >
          Private Key
        </button>
      </div>

      <form onSubmit={handleImport}>
        {importType === 'mnemonic' ? (
          <div className="form-group">
            <label htmlFor="mnemonic">Mnemonic Phrase:</label>
            <textarea
              id="mnemonic"
              value={mnemonic}
              onChange={(e) => setMnemonic(e.target.value)}
              placeholder="Enter your mnemonic phrase (12 or 24 words)"
              rows={4}
              required
            />
          </div>
        ) : (
          <div className="form-group">
            <label htmlFor="privateKey">Private Key:</label>
            <input
              id="privateKey"
              type="password"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="Enter your private key"
              required
            />
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Importing...' : 'Import Wallet'}
        </button>
      </form>
    </div>
  );
};

export default WalletImport;