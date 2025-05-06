import axios from 'axios';

const API_BASE_URL = '/api'; // This will be proxied to http://212.90.121.86:1317

// Group-related API calls
export const fetchGroups = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/erprollup/ledger/group`);
    return response.data;
  } catch (error) {
    console.error('Error fetching groups:', error);
    throw error;
  }
};

export const fetchGroupById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/erprollup/ledger/group/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching group ${id}:`, error);
    throw error;
  }
};

// Journal Entry-related API calls
export const fetchJournalEntries = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/erprollup/ledger/journal_entry`);
    return response.data;
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    throw error;
  }
};

export const fetchJournalEntryById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/erprollup/ledger/journal_entry/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching journal entry ${id}:`, error);
    throw error;
  }
};

// Bank module API calls
export const fetchBalance = async (address) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cosmos/bank/v1beta1/balances/${address}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching balance for ${address}:`, error);
    throw error;
  }
};

// Utility function to broadcast a transaction
export const broadcastTx = async (txBytes) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/cosmos/tx/v1beta1/txs`, {
      tx_bytes: txBytes,
      mode: "BROADCAST_MODE_SYNC"
    });
    return response.data;
  } catch (error) {
    console.error('Error broadcasting transaction:', error);
    throw error;
  }
};

// Chain info
export const fetchChainId = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cosmos/base/tendermint/v1beta1/node_info`);
    return response.data.default_node_info.network;
  } catch (error) {
    console.error('Error fetching chain ID:', error);
    return 'erprollup'; // Fallback to a default value
  }
};

// Account info
export const fetchAccount = async (address) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/cosmos/auth/v1beta1/accounts/${address}`);
    return response.data.account;
  } catch (error) {
    console.error(`Error fetching account for ${address}:`, error);
    throw error;
  }
};