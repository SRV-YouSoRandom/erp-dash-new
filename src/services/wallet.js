import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { SigningStargateClient, StargateClient, defaultRegistryTypes } from '@cosmjs/stargate';
import { Registry, GeneratedType } from '@cosmjs/proto-signing';
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
  
  // MsgCreateGroup message type
  const MsgCreateGroup = {
    typeUrl: '/erprollup.ledger.MsgCreateGroup',
    encode: (message, writer = new Writer()) => {
      if (message.creator !== "") {
        writer.uint32(10).string(message.creator);
      }
      if (message.name !== "") {
        writer.uint32(18).string(message.name);
      }
      if (message.description !== "") {
        writer.uint32(26).string(message.description);
      }
      return writer;
    },
    decode: (input, length) => {
      // Not needed for sending transactions
      return {};
    },
    fromJSON: (object) => {
      // Not needed for sending transactions
      return {};
    },
    toJSON: (message) => {
      // Not needed for sending transactions
      return {};
    },
    fromPartial: (object) => {
      const message = { ...baseMsgCreateGroup };
      if (object.creator !== undefined && object.creator !== null) {
        message.creator = object.creator;
      }
      if (object.name !== undefined && object.name !== null) {
        message.name = object.name;
      }
      if (object.description !== undefined && object.description !== null) {
        message.description = object.description;
      }
      return message;
    }
  };
  
  // MsgCreateJournalEntry message type
  const MsgCreateJournalEntry = {
    typeUrl: '/erprollup.ledger.MsgCreateJournalEntry',
    encode: (message, writer = new Writer()) => {
      if (message.creator !== "") {
        writer.uint32(10).string(message.creator);
      }
      if (message.description !== "") {
        writer.uint32(18).string(message.description);
      }
      if (message.debitGroup !== "") {
        writer.uint32(26).string(message.debitGroup);
      }
      if (message.creditGroup !== "") {
        writer.uint32(34).string(message.creditGroup);
      }
      if (message.amount !== "") {
        writer.uint32(42).string(message.amount);
      }
      return writer;
    },
    decode: (input, length) => {
      // Not needed for sending transactions
      return {};
    },
    fromJSON: (object) => {
      // Not needed for sending transactions
      return {};
    },
    toJSON: (message) => {
      // Not needed for sending transactions
      return {};
    },
    fromPartial: (object) => {
      const message = { ...baseMsgCreateJournalEntry };
      if (object.creator !== undefined && object.creator !== null) {
        message.creator = object.creator;
      }
      if (object.description !== undefined && object.description !== null) {
        message.description = object.description;
      }
      if (object.debitGroup !== undefined && object.debitGroup !== null) {
        message.debitGroup = object.debitGroup;
      }
      if (object.creditGroup !== undefined && object.creditGroup !== null) {
        message.creditGroup = object.creditGroup;
      }
      if (object.amount !== undefined && object.amount !== null) {
        message.amount = object.amount;
      }
      return message;
    }
  };
  
  // MsgSendAndRecord message type
  const MsgSendAndRecord = {
    typeUrl: '/erprollup.ledger.MsgSendAndRecord',
    encode: (message, writer = new Writer()) => {
      if (message.creator !== "") {
        writer.uint32(10).string(message.creator);
      }
      if (message.receiver !== "") {
        writer.uint32(18).string(message.receiver);
      }
      if (message.amount !== undefined) {
        writer.uint32(26).string(message.amount.denom);
        writer.uint32(34).string(message.amount.amount);
      }
      if (message.debitGroup !== "") {
        writer.uint32(42).string(message.debitGroup);
      }
      if (message.creditGroup !== "") {
        writer.uint32(50).string(message.creditGroup);
      }
      if (message.description !== "") {
        writer.uint32(58).string(message.description);
      }
      return writer;
    },
    decode: (input, length) => {
      // Not needed for sending transactions
      return {};
    },
    fromJSON: (object) => {
      // Not needed for sending transactions
      return {};
    },
    toJSON: (message) => {
      // Not needed for sending transactions
      return {};
    },
    fromPartial: (object) => {
      const message = { ...baseMsgSendAndRecord };
      if (object.creator !== undefined && object.creator !== null) {
        message.creator = object.creator;
      }
      if (object.receiver !== undefined && object.receiver !== null) {
        message.receiver = object.receiver;
      }
      if (object.amount !== undefined && object.amount !== null) {
        message.amount = {
          denom: object.amount.denom || "",
          amount: object.amount.amount || ""
        };
      }
      if (object.debitGroup !== undefined && object.debitGroup !== null) {
        message.debitGroup = object.debitGroup;
      }
      if (object.creditGroup !== undefined && object.creditGroup !== null) {
        message.creditGroup = object.creditGroup;
      }
      if (object.description !== undefined && object.description !== null) {
        message.description = object.description;
      }
      return message;
    }
  };

  // Create base message objects with default values
  const baseMsgCreateGroup = { creator: "", name: "", description: "" };
  const baseMsgCreateJournalEntry = { creator: "", description: "", debitGroup: "", creditGroup: "", amount: "" };
  const baseMsgSendAndRecord = { creator: "", receiver: "", amount: { denom: "", amount: "" }, debitGroup: "", creditGroup: "", description: "" };

  // Simple Writer class to simulate protobuf encoding
  class Writer {
    constructor() {
      this.ldelim = () => this;
      this.bytes = new Uint8Array(0);
    }
    
    uint32(val) {
      return this;
    }
    
    string(val) {
      return this;
    }
    
    finish() {
      return this.bytes;
    }
  }
  
  // Register the message types
  registry.register('/erprollup.ledger.MsgCreateGroup', MsgCreateGroup);
  registry.register('/erprollup.ledger.MsgCreateJournalEntry', MsgCreateJournalEntry);
  registry.register('/erprollup.ledger.MsgSendAndRecord', MsgSendAndRecord);
  
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