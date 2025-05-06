import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { createJournalEntry } from '../services/wallet';
import { fetchGroups } from '../services/api';
import { formatTransactionResult } from '../utils/helpers';

const JournalEntryForm = ({ onEntryCreated }) => {
  const { wallet } = useWallet();
  const [description, setDescription] = useState('');
  const [debitGroupId, setDebitGroupId] = useState('');
  const [creditGroupId, setCreditGroupId] = useState('');
  const [amount, setAmount] = useState('');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingGroups, setFetchingGroups] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch groups on mount
  useEffect(() => {
    const loadGroups = async () => {
      try {
        setFetchingGroups(true);
        const data = await fetchGroups();
        setGroups(data.Group || []);
      } catch (err) {
        console.error('Error loading groups:', err);
        setError('Failed to load groups. Please refresh the page.');
      } finally {
        setFetchingGroups(false);
      }
    };

    loadGroups();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!wallet) {
      setError('Please connect your wallet first');
      return;
    }

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    if (!debitGroupId) {
      setError('Please select a debit group');
      return;
    }

    if (!creditGroupId) {
      setError('Please select a credit group');
      return;
    }

    if (!amount || isNaN(amount) || parseInt(amount) <= 0) {
      setError('Please enter a valid amount (positive number)');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const result = await createJournalEntry(
        wallet, 
        description.trim(), 
        debitGroupId,
        creditGroupId,
        parseInt(amount)
      );
      
      console.log('Journal entry creation result:', result);
      setSuccess(`Journal entry created successfully! ${formatTransactionResult(result)}`);
      
      // Clear form
      setDescription('');
      setDebitGroupId('');
      setCreditGroupId('');
      setAmount('');
      
      // Notify parent component to refresh list
      if (onEntryCreated) {
        onEntryCreated();
      }
      
    } catch (err) {
      console.error('Error creating journal entry:', err);
      setError(err.message || 'Failed to create journal entry');
    } finally {
      setLoading(false);
    }
  };

  if (fetchingGroups) {
    return <div className="loading">Loading groups...</div>;
  }

  return (
    <div className="journal-entry-form card">
      <h2>Create New Journal Entry</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Initial investment, Office supplies purchase, etc."
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="debitGroup">Debit Group:</label>
          <select
            id="debitGroup"
            value={debitGroupId}
            onChange={(e) => setDebitGroupId(e.target.value)}
            required
          >
            <option value="">Select Debit Group</option>
            {groups.map((group) => (
              <option key={`debit-${group.id}`} value={group.id}>
                {group.name} - {group.description}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="creditGroup">Credit Group:</label>
          <select
            id="creditGroup"
            value={creditGroupId}
            onChange={(e) => setCreditGroupId(e.target.value)}
            required
          >
            <option value="">Select Credit Group</option>
            {groups.map((group) => (
              <option key={`credit-${group.id}`} value={group.id}>
                {group.name} - {group.description}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="amount">Amount:</label>
          <input
            id="amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            min="1"
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button type="submit" className="btn-primary" disabled={loading || !wallet}>
          {loading ? 'Creating...' : 'Create Journal Entry'}
        </button>
      </form>
    </div>
  );
};

export default JournalEntryForm;