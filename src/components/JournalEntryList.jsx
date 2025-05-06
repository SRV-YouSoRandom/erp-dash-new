import React, { useState, useEffect } from 'react';
import { fetchJournalEntries, fetchGroups } from '../services/api';

const JournalEntryList = () => {
  const [entries, setEntries] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load both journal entries and groups to display names
        const [entriesData, groupsData] = await Promise.all([
          fetchJournalEntries(),
          fetchGroups()
        ]);
        
        setEntries(entriesData.JournalEntry || []);
        setGroups(groupsData.Group || []);
        setError('');
      } catch (err) {
        console.error('Error loading journal entries:', err);
        setError('Failed to load journal entries. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Helper function to get group name by ID
  const getGroupName = (id) => {
    const group = groups.find(g => g.id === id);
    return group ? group.name : `Group ${id}`;
  };

  if (loading) {
    return <div className="loading">Loading journal entries...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (entries.length === 0) {
    return <div className="no-data">No journal entries found. Create a new entry to get started.</div>;
  }

  return (
    <div className="journal-entry-list">
      <h2>Journal Entries</h2>
      
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Description</th>
            <th>Debit Group</th>
            <th>Credit Group</th>
            <th>Amount</th>
            <th>Creator</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.id}>
              <td>{entry.id}</td>
              <td>{entry.description}</td>
              <td>{getGroupName(entry.debitGroup)}</td>
              <td>{getGroupName(entry.creditGroup)}</td>
              <td>{entry.amount}</td>
              <td>{entry.creator}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default JournalEntryList;