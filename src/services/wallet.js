import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { SigningStargateClient, StargateClient, defaultRegistryTypes } from '@cosmjs/stargate';
import { Registry } from '@cosmjs/proto-signing';
import { bech32 } from '@cosmjs/encoding';
import { stringToPath } from '@cosmjs/crypto';
import { fetchAccount, fetchChainId } from './api';

// Create a custom registry with ERP Rollup types
const getCustomRegistry = () => {
  // Start with the default registry types
  const registry = new Registry(defaultRegistryTypes);
  
  // Register your custom message types
  registry.register('/erprollup.ledger.MsgCreateGroup', {
    typeUrl: '/erprollup.ledger.MsgCreateGroup',
    encode: (value) => {
      return {
        creator: value.creator,
        name: value.name,
        description: value.description
      };
    }
  });
  
  registry.register('/erprollup.ledger.MsgCreateJournalEntry', {
    typeUrl: '/erprollup.ledger.MsgCreateJournalEntry',
    encode: (value) => {
      return {
        creator: value.creator,
        description: value.description,
        debitGroup: value.debitGroup,
        creditGroup: value.creditGroup,
        amount: value.amount
      };
    }
  });
  
  registry.register('/erprollup.ledger.MsgSendAndRecord', {
    typeUrl: '/erprollup.ledger.MsgSendAndRecord',
    encode: (value) => {
      return {
        creator: value.creator,
        receiver: value.receiver,
        amount: value.amount,
        debitGroup: value.debitGroup,
        creditGroup: value.creditGroup,
        description: value.description
      };
    }
  });
  
  return registry;
};

// Create a wallet from mnemonic
export const createWalletFromMnemonic = async (mnemonic) => {
  try {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: 'erp', // Address prefix for your chain
      hdPaths: [stringToPath("m/44'/118'/0'/0/0")] // Standard Cosmos HD path
    });
    const [firstAccount] = await wallet.getAccounts();
    return { wallet, address: firstAccount.address };
  } catch (error) {
    console.error('Error creating wallet from mnemonic:', error);
    throw new Error('Invalid mnemonic phrase');
  }
};

// Create a wallet from private key (Note: This is not directly supported by CosmJS)
// This is a placeholder and would require additional libraries
export const createWalletFromPrivateKey = async (privateKey) => {
  throw new Error('Private key import is not implemented yet');
};

// Initialize a signing client
export const initSigningClient = async (wallet) => {
  try {
    // RPC endpoint would be different than REST API
    // You might need to adjust this based on your setup
    const rpcEndpoint = 'http://212.90.121.86:26657';
    
    // Initialize with custom registry
    const registry = getCustomRegistry();
    return await SigningStargateClient.connectWithSigner(
      rpcEndpoint, 
      wallet,
      { registry }
    );
  } catch (error) {
    console.error('Error initializing signing client:', error);
    throw error;
  }
};

// Initialize a read-only client
export const initClient = async () => {
  try {
    const rpcEndpoint = 'http://212.90.121.86:26657';
    return await StargateClient.connect(rpcEndpoint);
  } catch (error) {
    console.error('Error initializing client:', error);
    throw error;
  }
};

// Create a group
export const createGroup = async (wallet, name, description) => {
  try {
    const client = await initSigningClient(wallet);
    const [account] = await wallet.getAccounts();
    const chainId = await fetchChainId();
    
    const msg = {
      typeUrl: "/erprollup.ledger.MsgCreateGroup",
      value: {
        creator: account.address,
        name: name,
        description: description
      }
    };

    const fee = {
      amount: [
        {
          denom: "stake",
          amount: "50",
        },
      ],
      gas: "200000",
    };

    const result = await client.signAndBroadcast(
      account.address,
      [msg],
      fee,
      ""
    );

    return result;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

// Create a journal entry
export const createJournalEntry = async (wallet, description, debitGroupId, creditGroupId, amount) => {
  try {
    const client = await initSigningClient(wallet);
    const [account] = await wallet.getAccounts();
    const chainId = await fetchChainId();
    
    const msg = {
      typeUrl: "/erprollup.ledger.MsgCreateJournalEntry",
      value: {
        creator: account.address,
        description: description,
        debitGroup: debitGroupId.toString(),
        creditGroup: creditGroupId.toString(),
        amount: amount.toString()
      }
    };

    const fee = {
      amount: [
        {
          denom: "stake",
          amount: "50",
        },
      ],
      gas: "200000",
    };

    const result = await client.signAndBroadcast(
      account.address,
      [msg],
      fee,
      ""
    );

    return result;
  } catch (error) {
    console.error('Error creating journal entry:', error);
    throw error;
  }
};

// Send and record function
export const sendAndRecord = async (wallet, receiverAddress, amount, denom, debitGroupId, creditGroupId, description) => {
  try {
    const client = await initSigningClient(wallet);
    const [account] = await wallet.getAccounts();
    const chainId = await fetchChainId();
    
    const msg = {
      typeUrl: "/erprollup.ledger.MsgSendAndRecord",
      value: {
        creator: account.address,
        receiver: receiverAddress,
        amount: {
          denom: denom,
          amount: amount.toString(),
        },
        debitGroup: debitGroupId.toString(),
        creditGroup: creditGroupId.toString(),
        description: description
      }
    };

    const fee = {
      amount: [
        {
          denom: "stake",
          amount: "50",
        },
      ],
      gas: "200000",
    };

    const result = await client.signAndBroadcast(
      account.address,
      [msg],
      fee,
      ""
    );

    return result;
  } catch (error) {
    console.error('Error sending and recording:', error);
    throw error;
  }
};