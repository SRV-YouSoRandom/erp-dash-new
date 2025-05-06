import React, { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { createGroup } from '../services/wallet';
import { formatTransactionResult } from '../utils/helpers';

const GroupForm = ({ onGroupCreated }) => {
  const { wallet } = useWallet();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!wallet) {
      setError('Please connect your wallet first');
      return;
    }

    if (!name.trim()) {
      setError('Group name is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const result = await createGroup(wallet, name.trim(), description.trim());
      
      console.log('Group creation result:', result);
      setSuccess(`Group "${name}" created successfully! ${formatTransactionResult(result)}`);
      
      // Clear form
      setName('');
      setDescription('');
      
      // Notify parent component to refresh list
      if (onGroupCreated) {
        onGroupCreated();
      }
      
    } catch (err) {
      console.error('Error creating group:', err);
      setError(err.message || 'Failed to create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group-form card">
      <h2>Create New Group</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Group Name:</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Assets, Liabilities, Equity, etc."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the group"
            rows={3}
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button type="submit" className="btn-primary" disabled={loading || !wallet}>
          {loading ? 'Creating...' : 'Create Group'}
        </button>
      </form>
    </div>
  );
};

export default GroupForm;