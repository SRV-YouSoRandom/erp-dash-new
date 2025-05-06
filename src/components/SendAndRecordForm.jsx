import React, { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { sendAndRecord } from '../services/wallet';
import { fetchGroups } from '../services/api';
import { formatTransactionResult } from '../utils/helpers';

const SendAndRecordForm = () => {
  const { wallet, address, balance } = useWallet();
  const [receiver, setReceiver] = useState('');
  const [amount, setAmount] = useState('');
  const [denom, setDenom] = useState('stake');
  const [debitGroupId, setDebitGroupId] = useState('');
  const [creditGroupId, setCreditGroupId] = useState('');
  const [description, setDescription] = useState('');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingGroups, setFetchingGroups] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Available denominations
  const denominations = ['stake']; // Add more if your chain supports others

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

    if (!receiver.trim()) {
      setError('Receiver address is required');
      return;
    }

    if (!amount || isNaN(amount) || parseInt(amount) <= 0) {
      setError('Please enter a valid amount (positive number)');
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

    if (!description.trim()) {
      setError('Description is required');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const result = await sendAndRecord(
        wallet,
        receiver.trim(),
        parseInt(amount),
        denom,
        debitGroupId,
        creditGroupId,
        description.trim()
      );
      
      console.log('Send and record result:', result);
      setSuccess(`Transaction completed successfully! ${formatTransactionResult(result)}`);
      
      // Clear form
      setReceiver('');
      setAmount('');
      setDescription('');
      
    } catch (err) {
      console.error('Error in send and record:', err);
      setError(err.message || 'Failed to complete transaction');
    } finally {
      setLoading(false);
    }
  };

  // Get available balance for selected denomination
  const getAvailableBalance = () => {
    if (!balance || balance.length === 0) return 0;
    
    const selectedDenom = balance.find(b => b.denom === denom);
    return selectedDenom ? parseInt(selectedDenom.amount) : 0;
  };

  if (fetchingGroups) {
    return <div className="loading">Loading groups...</div>;
  }

  return (
    <div className="send-record-form card">
      <h2>Send Tokens &amp; Record Transaction</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="receiver">Receiver Address:</label>
          <input
            id="receiver"
            type="text"
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            placeholder="erp..."
            required
          />
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
          <small>Available Balance: {getAvailableBalance()} {denom}</small>
        </div>

        <div className="form-group">
          <label htmlFor="denom">Token:</label>
          <select
            id="denom"
            value={denom}
            onChange={(e) => setDenom(e.target.value)}
            required
          >
            {denominations.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
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
          <label htmlFor="description">Description:</label>
          <input
            id="description"
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Payment for services, Loan repayment, etc."
            required
          />
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <button type="submit" className="btn-primary" disabled={loading || !wallet}>
          {loading ? 'Processing...' : 'Send & Record'}
        </button>
      </form>
    </div>
  );
};

export default SendAndRecordForm;