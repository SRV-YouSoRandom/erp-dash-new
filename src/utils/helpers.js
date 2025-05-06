// Format token amounts with denomination
export const formatTokenAmount = (amount, denom) => {
    if (!amount) return '0 ' + denom;
    return `${amount} ${denom}`;
  };
  
  // Format date from timestamp
  export const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };
  
  // Get a truncated address for display
  export const truncateAddress = (address, startLength = 8, endLength = 4) => {
    if (!address) return '';
    if (address.length <= startLength + endLength) return address;
    
    return `${address.substring(0, startLength)}...${address.substring(
      address.length - endLength
    )}`;
  };
  
  // Parse error messages from API responses
  export const parseErrorMessage = (error) => {
    if (!error) return 'An unknown error occurred';
    
    if (error.response && error.response.data) {
      if (error.response.data.message) {
        return error.response.data.message;
      }
      if (error.response.data.error) {
        return error.response.data.error;
      }
    }
    
    return error.message || 'An error occurred while processing your request';
  };
  
  // Find group by name
  export const findGroupByName = (groups, name) => {
    if (!groups || !Array.isArray(groups)) return null;
    
    return groups.find(group => 
      group.name.toLowerCase() === name.toLowerCase()
    );
  };
  
  // Format transaction result
  export const formatTransactionResult = (result) => {
    if (!result) return 'No result';
    
    if (result.code === 0) {
      return `Success: Transaction hash ${result.transactionHash}`;
    }
    
    return `Error: ${result.rawLog || 'Unknown error'}`;
  };