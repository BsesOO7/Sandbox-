// lib/validations.ts

export const ValidationRules = {
  // Alphanumeric and All Caps
  accountNumber: (val: string) => {
    if (!val) return "Account number is required";
    if (!/^[A-Z0-9]+$/.test(val)) {
      return "Must be alphanumeric and ALL CAPS";
    }
    return null;
  },

  panNumber: (val: string) => {
    if (!val) return "PAN is required";
    if (!/^\d+$/.test(val)) return "PAN must be numeric only";
    if (val.length < 9) return "PAN must be at least 9 digits";
    return null;
  },

  email: (val: string) => {
    if (!val) return "Email is required";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) return "Invalid email address";
    return null;
  },

  password: (val: string) => {
    if (!val) return "Password is required";
    if (val.length < 8) return "Password must be at least 8 characters";
    return null;
  },

  required: (name: string, val: string) => {
    if (!val || val.trim() === "") return `${name} is required`;
    return null;
  },
};
