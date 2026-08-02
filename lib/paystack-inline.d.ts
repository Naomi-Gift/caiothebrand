/**
 * Minimal type declaration for @paystack/inline-js.
 * The package ships no TypeScript types, so we declare only what we use.
 */
declare module "@paystack/inline-js" {
  interface PaystackTransactionOptions {
    key: string;
    email: string;
    amount: number; // kobo
    currency?: string;
    reference?: string;
    metadata?: Record<string, unknown>;
    onSuccess?: (response: { reference: string; status: string }) => void;
    onCancel?: () => void;
    onLoad?: (response: unknown) => void;
    onError?: (error: unknown) => void;
  }

  class PaystackPop {
    newTransaction(options: PaystackTransactionOptions): void;
  }

  export default PaystackPop;
}
