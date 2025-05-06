import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { SigningStargateClient, StargateClient, defaultRegistryTypes } from '@cosmjs/stargate';
import { Registry } from '@cosmjs/proto-signing';
import { bech32 } from '@cosmjs/encoding';
import { stringToPath } from '@cosmjs/crypto';
import { fetchAccount, fetchChainId } from './api';
import { Any } from 'cosmjs-types/google/protobuf/any';
import { MsgSend } from 'cosmjs-types/cosmos/bank/v1beta1/tx';
import Long from 'long';

// Create a custom registry with ERP Rollup types
const getCustomRegistry = () => {
  // Start with the default registry types
  const registry = new Registry(defaultRegistryTypes);
  
  // Register your custom message types using properly defined encoders
  // NOTE: For proper implementation, we should use protobuf-generated types.
  // This is a simplified workaround for demo purposes.
  
  registry.register('/erprollup.ledger.MsgCreateGroup', {
    typeUrl: '/erprollup.ledger.MsgCreateGroup',
    encode: (value) => {
      // Create a simple Uint8Array encoding of the fields
      const creator = new TextEncoder().encode(value.creator);
      const name = new TextEncoder().encode(value.name);
      const description = new TextEncoder().encode(value.description || '');
      
      // Simple encoding: lengths followed by values
      const result = new Uint8Array(
        4 + creator.length + 
        4 + name.length + 
        4 + description.length
      );
      
      let offset = 0;
      
      // Creator
      const creatorView = new DataView(result.buffer);
      creatorView.setUint32(offset, creator.length, true);
      offset += 4;
      result.set(creator, offset);
      offset += creator.length;
      
      // Name
      creatorView.setUint32(offset, name.length, true);
      offset += 4;
      result.set(name, offset);
      offset += name.length;
      
      // Description
      creatorView.setUint32(offset, description.length, true);
      offset += 4;
      result.set(description, offset);
      
      return result;
    }
  });
  
  registry.register('/erprollup.ledger.MsgCreateJournalEntry', {
    typeUrl: '/erprollup.ledger.MsgCreateJournalEntry',
    encode: (value) => {
      const creator = new TextEncoder().encode(value.creator);
      const description = new TextEncoder().encode(value.description || '');
      const debitGroup = new TextEncoder().encode(value.debitGroup);
      const creditGroup = new TextEncoder().encode(value.creditGroup);
      const amount = new TextEncoder().encode(value.amount);
      
      const result = new Uint8Array(
        4 + creator.length + 
        4 + description.length + 
        4 + debitGroup.length + 
        4 + creditGroup.length +
        4 + amount.length
      );
      
      let offset = 0;
      const view = new DataView(result.buffer);
      
      // Creator
      view.setUint32(offset, creator.length, true);
      offset += 4;
      result.set(creator, offset);
      offset += creator.length;
      
      // Description
      view.setUint32(offset, description.length, true);
      offset += 4;
      result.set(description, offset);
      offset += description.length;
      
      // DebitGroup
      view.setUint32(offset, debitGroup.length, true);
      offset += 4;
      result.set(debitGroup, offset);
      offset += debitGroup.length;
      
      // CreditGroup
      view.setUint32(offset, creditGroup.length, true);
      offset += 4;
      result.set(creditGroup, offset);
      offset += creditGroup.length;
      
      // Amount
      view.setUint32(offset, amount.length, true);
      offset += 4;
      result.set(amount, offset);
      
      return result;
    }
  });
  
  registry.register('/erprollup.ledger.MsgSendAndRecord', {
    typeUrl: '/erprollup.ledger.MsgSendAndRecord',
    encode: (value) => {
      const creator = new TextEncoder().encode(value.creator);
      const receiver = new TextEncoder().encode(value.receiver);
      const amountDenom = new TextEncoder().encode(value.amount.denom);
      const amountValue = new TextEncoder().encode(value.amount.amount);
      const debitGroup = new TextEncoder().encode(value.debitGroup);
      const creditGroup = new TextEncoder().encode(value.creditGroup);
      const description = new TextEncoder().encode(value.description || '');
      
      const result = new Uint8Array(
        4 + creator.length + 
        4 + receiver.length + 
        4 + amountDenom.length +
        4 + amountValue.length +
        4 + debitGroup.length + 
        4 + creditGroup.length +
        4 + description.length
      );
      
      let offset = 0;
      const view = new DataView(result.buffer);
      
      // Creator
      view.setUint32(offset, creator.length, true);
      offset += 4;
      result.set(creator, offset);
      offset += creator.length;
      
      // Receiver
      view.setUint32(offset, receiver.length, true);
      offset += 4;
      result.set(receiver, offset);
      offset += receiver.length;
      
      // Amount denom
      view.setUint32(offset, amountDenom.length, true);
      offset += 4;
      result.set(amountDenom, offset);
      offset += amountDenom.length;
      
      // Amount value
      view.setUint32(offset, amountValue.length, true);
      offset += 4;
      result.set(amountValue, offset);
      offset += amountValue.length;
      
      // DebitGroup
      view.setUint32(offset, debitGroup.length, true);
      offset += 4;
      result.set(debitGroup, offset);
      offset += debitGroup.length;
      
      // CreditGroup
      view.setUint32(offset, creditGroup.length, true);
      offset += 4;
      result.set(creditGroup, offset);
      offset += creditGroup.length;
      
      // Description
      view.setUint32(offset, description.length, true);
      offset += 4;
      result.set(description, offset);
      
      return result;
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

// Create a wallet from private key (placeholder - would require additional libraries)
export const createWalletFromPrivateKey = async (privateKey) => {
  throw new Error('Private key import is not implemented yet');
};

// Initialize a signing client
export const initSigningClient = async (wallet) => {
  try {
    // RPC endpoint would be different than REST API
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
      ]
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
      ]
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
      ]
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