import React, {useEffect} from 'react';
import {PayPalScriptProvider, PayPalButtons, usePayPalScriptReducer} from '@paypal/react-paypal-js';
import {safeFetchJson} from '../utils/apiUtils';
import {ServerPackage, PAYPAL_SUPPORTED_CURRENCIES} from '../constants/packages';
import {AlertTriangle, Lock} from 'lucide-react';

interface PayPalCheckoutButtonProps {
    currencyCode: string;
    currentPack: ServerPackage;
    userEmail: string;
    isUserRegistered: boolean;
    onOpenAuthModal?: () => void;
    onSuccess: (creditsAdded: number) => void;
    onError: (errorMessage: string) => void;
    onProcessingChange: (isProcessing: boolean) => void;
}

const PayPalButtonWrapper: React.FC<{
    currencyCode: string;
    currentPack: ServerPackage;
    userEmail: string;
    onSuccess: (creditsAdded: number) => void;
    onError: (errorMessage: string) => void;
    onProcessingChange: (isProcessing: boolean) => void;
}> = ({
          currencyCode,
          currentPack,
          userEmail,
          onSuccess,
          onError,
          onProcessingChange,
      }) => {
    const [{options, isPending}, dispatch] = usePayPalScriptReducer();

    // Safely update the SDK currency via script reducer instead of remounting with key
    useEffect(() => {
        const safeCurrency = (PAYPAL_SUPPORTED_CURRENCIES as readonly string[]).includes(currencyCode)
            ? currencyCode
            : 'USD';

        if (options.currency !== safeCurrency) {
            dispatch({
                type: 'resetOptions',
                value: {
                    ...options,
                    currency: safeCurrency,
                },
            });
        }
    }, [currencyCode, options, dispatch]);

    if (isPending) {
        return (
            <div
                className="flex items-center justify-center gap-2.5 py-4 text-xs text-slate-400 bg-slate-950/60 rounded-2xl border border-slate-800">
                <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin"/>
                <span>Loading PayPal checkout for {currencyCode}…</span>
            </div>
        );
    }

    const priceObj = currentPack.prices[currencyCode] || currentPack.prices['USD'];
    const exactPrice = priceObj.price;

    return (
        <PayPalButtons
            forceReRender={[currencyCode, currentPack.id, exactPrice]}
            style={{layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay'}}
            createOrder={async () => {
                onProcessingChange(true);
                try {
                    const {ok, data} = await safeFetchJson<{
                        success?: boolean;
                        message?: string;
                        paypalOrderId?: string;
                        orderId?: string;
                    }>('/api/create-order', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({
                            packId: currentPack.id,
                            currency: currencyCode,
                            gateway: 'paypal',
                        }),
                    });

                    if (!ok || !data.success) {
                        onProcessingChange(false);
                        const msg = data.message || 'Could not initiate PayPal order.';
                        onError(msg);
                        throw new Error(msg);
                    }

                    return data.paypalOrderId || data.orderId || '';
                } catch (err: any) {
                    onProcessingChange(false);
                    onError(err.message || 'Failed to create PayPal order.');
                    throw err;
                }
            }}
            onApprove={async (data) => {
                onProcessingChange(true);
                try {
                    const {ok, data: captureData} = await safeFetchJson<{
                        success?: boolean;
                        message?: string;
                        creditsAdded?: number;
                        newBalance?: number;
                    }>('/api/payments/paypal/capture-order', {
                        method: 'POST',
                        headers: {'Content-Type': 'application/json'},
                        body: JSON.stringify({paypalOrderId: data.orderID}),
                    });

                    if (ok && captureData.success) {
                        onSuccess(currentPack.credits);
                    } else {
                        onError(captureData.message || 'PayPal payment capture failed.');
                    }
                } catch (err: any) {
                    onError('Server error during PayPal payment verification.');
                } finally {
                    onProcessingChange(false);
                }
            }}
            onError={(err: any) => {
                onProcessingChange(false);
                // Ignore transient zoid cleanup noise during component teardown
                if (err?.message && !err.message.includes('zoid')) {
                    onError('PayPal encountered an error. Please try again.');
                }
            }}
            onCancel={() => {
                onProcessingChange(false);
            }}
        />
    );
};

export const PayPalCheckoutButton: React.FC<PayPalCheckoutButtonProps> = ({
                                                                              currencyCode,
                                                                              currentPack,
                                                                              userEmail,
                                                                              isUserRegistered,
                                                                              onOpenAuthModal,
                                                                              onSuccess,
                                                                              onError,
                                                                              onProcessingChange,
                                                                          }) => {
    if (!isUserRegistered) {
        return (
            <button
                type="button"
                onClick={() => onOpenAuthModal && onOpenAuthModal()}
                className="w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 shadow-md transition-all cursor-pointer"
            >
                <Lock className="w-4 h-4 text-amber-400"/>
                <span>Register / Log In First to Pay with PayPal</span>
            </button>
        );
    }

    const clientId = (import.meta as any).env?.VITE_PAYPAL_CLIENT_ID || "BAAsFYO16KDUAOTootaQKbLLllWwQMyRHzzTSSd4hhIqJYVo13jFfMDKrBLiMeX8stVs6J7CKMcoz2ki7k";
    const environment = (import.meta as any).env?.VITE_PAYPAL_MODE;

    if (!clientId) {
        return (
            <div
                className="w-full p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-300">
                <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400"/>
                <div className="text-left">
                    <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
                        PayPal Unavailable
                    </p>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        PayPal integration is currently not configured (<code
                        className="font-mono text-[10px] text-amber-300 bg-amber-950/50 px-1.5 py-0.5 rounded border border-amber-500/20">VITE_PAYPAL_CLIENT_ID</code> missing).
                    </p>
                </div>
            </div>
        );
    }

    const initialCurrency = (PAYPAL_SUPPORTED_CURRENCIES as readonly string[]).includes(currencyCode)
        ? currencyCode
        : 'USD';

    return (
        <div className="w-full">
            <PayPalScriptProvider
                options={{
                    clientId,
                    currency: initialCurrency,
                    intent: 'capture',
                    components: 'buttons',
                    environment: environment === 'sandbox' ? 'sandbox' : 'production'
                }}
            >
                <PayPalButtonWrapper
                    currencyCode={currencyCode}
                    currentPack={currentPack}
                    userEmail={userEmail}
                    onSuccess={onSuccess}
                    onError={onError}
                    onProcessingChange={onProcessingChange}
                />
            </PayPalScriptProvider>
        </div>
    );
};