// Test file to debug transaction signing issues
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { SigningStargateClient, StargateClient } from '@cosmjs/stargate';
import { Registry } from '@cosmjs/proto-signing';
import axios from 'axios';

const API_BASE_URL = 'http://212.90.121.86:1317';
const RPC_ENDPOINT = 'http://212.90.121.86:26657';

// Debug logger
const log = (message, data) => {
  console.log(`[DEBUG] ${message}`);
  if (data !== undefined) {
    console.log(JSON.stringify(data, null, 2));
  }
};

// Custom registry with detailed error handling
const createCustomRegistry = () => {
  log('Creating custom registry');
  
  const registry = new Registry();
  
  // Register MsgCreateGroup type with detailed logging
  registry.register('/erprollup.ledger.MsgCreateGroup', {
    typeUrl: '/erprollup.ledger.MsgCreateGroup',
    encode: (value) => {
      log('Encoding MsgCreateGroup', value);
      
      try {
        // Create a simple Uint8Array encoding of the fields
        const creator = new TextEncoder().encode(value.creator);
        const name = new TextEncoder().encode(value.name);
        const description = new TextEncoder().encode(value.description || '');
        
        log('Encoded field lengths', {
          creator: creator.length,
          name: name.length,
          description: description.length
        });
        
        // Simple encoding: lengths followed by values
        const result = new Uint8Array(
          4 + creator.length + 
          4 + name.length + 
          4 + description.length
        );
        
        let offset = 0;
        
        // Creator
        const view = new DataView(result.buffer);
        view.setUint32(offset, creator.length, true);
        offset += 4;
        result.set(creator, offset);
        offset += creator.length;
        
        // Name
        view.setUint32(offset, name.length, true);
        offset += 4;
        result.set(name, offset);
        offset += name.length;
        
        // Description
        view.setUint32(offset, description.length, true);
        offset += 4;
        result.set(description, offset);
        
        log('Successfully encoded message', { resultLength: result.length });
        return result;
      } catch (err) {
        log('Error encoding message', { error: err.message });
        throw err;
      }
    }
  });
  
  return registry;
};

// Create a wallet from mnemonic
const createWalletFromMnemonic = async (mnemonic) => {
  log('Creating wallet from mnemonic');
  
  try {
    const wallet = await DirectSecp256k1HdWallet.fromMnemonic(mnemonic, {
      prefix: 'erp',
      hdPaths: [("m/44'/118'/0'/0/0")]
    });
    
    const [firstAccount] = await wallet.getAccounts();
    log('Wallet created successfully', { address: firstAccount.address });
    
    return { wallet, address: firstAccount.address };
  } catch (error) {
    log('Error creating wallet', { error: error.message });
    throw error;
  }
};

// Initialize a signing client with verbose logging
const initSigningClient = async (wallet) => {
  log('Initializing signing client');
  
  try {
    const registry = createCustomRegistry();
    log('Connecting to RPC endpoint', { endpoint: RPC_ENDPOINT });
    
    const client = await SigningStargateClient.connectWithSigner(
      RPC_ENDPOINT, 
      wallet, 
      { registry }
    );
    
    log('Signing client initialized successfully');
    return client;
  } catch (error) {
    log('Error initializing signing client', { 
      error: error.message, 
      stack: error.stack 
    });
    throw error;
  }
};

// Create a group with verbose logging
const testCreateGroup = async (mnemonic, name, description) => {
  log('Starting test: Create Group', { name, description });
  
  try {
    // Create wallet
    const { wallet, address } = await createWalletFromMnemonic(mnemonic);
    log('Using address', { address });
    
    // Initialize client
    const client = await initSigningClient(wallet);
    
    // Check account exists
    try {
      const account = await axios.get(`${API_BASE_URL}/cosmos/auth/v1beta1/accounts/${address}`);
      log('Account found', { accountNumber: account.data.account.account_number });
    } catch (accountError) {
      log('Error fetching account', { error: accountError.message });
      throw new Error('Account not found or not accessible');
    }
    
    // Check balance
    try {
      const balance = await axios.get(`${API_BASE_URL}/cosmos/bank/v1beta1/balances/${address}`);
      log('Account balance', { balances: balance.data.balances });
    } catch (balanceError) {
      log('Error fetching balance', { error: balanceError.message });
      // Continue anyway
    }
    
    // Prepare message
    const msg = {
      typeUrl: "/erprollup.ledger.MsgCreateGroup",
      value: {
        creator: address,
        name: name,
        description: description
      }
    };
    
    log('Prepared message', { msg });
    
    // Prepare fee
    const fee = {
      amount: [
        {
          denom: "stake",
          amount: "50",
        },
      ],
      gas: "200000",  // Add explicit gas limit
    };
    
    log('Prepared fee', { fee });
    
    // Sign and broadcast
    log('Signing and broadcasting transaction');
    
    const result = await client.signAndBroadcast(
      address,
      [msg],
      fee,
      "Test transaction"  // Add memo
    );
    
    log('Transaction result', { result });
    return result;
  } catch (error) {
    log('Test failed', { 
      error: error.message, 
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
};

// Run the test
const runTest = async () => {
  try {
    // Replace with your mnemonic
    const mnemonic = "clip collect narrow push edge agent thank report shoulder witness owner few myth math scan job rug cat brand chunk treat shuffle cushion pepper";
    
    // Test creating a group
    const result = await testCreateGroup(
      mnemonic,
      "Test Group " + new Date().toISOString(),
      "Created for testing transaction signing"
    );
    
    console.log("TEST SUCCESSFUL:");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("TEST FAILED:");
    console.error(error);
  }
};

// Run the test when the script is executed
runTest();