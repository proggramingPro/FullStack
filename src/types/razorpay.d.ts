export interface RazorpayOptions {
    key: string;
    amount: string | number;
    currency: string;
    name: string;
    description?: string;
    image?: string;
    order_id: string;
    handler: (response: RazorpayPaymentResponse) => void;
    prefill?: {
        name?: string;
        email?: string;
        contact?: string;
    };
    notes?: {
        [key: string]: string;
    };
    theme?: {
        color?: string;
    };
}

export interface RazorpayPaymentResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

declare global {
    interface Window {
        Razorpay: any;
    }
}
