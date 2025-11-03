export interface User {
  id: string;
  full_name: string;
  email: string;
}

// Example static logout method for demonstration
export const User = {
  logout: async () => {
    // Implement your logout logic here (e.g., API call, clear local storage, etc.)
    return Promise.resolve();
  }
};
