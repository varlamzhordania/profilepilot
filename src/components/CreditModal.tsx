import React, {useState, useEffect} from 'react';
import {UserProfile, CreditTransaction} from '../types';
import {safeFetchJson} from '../utils/apiUtils';
import {
    Coins,
    Sparkles,
    Check,
    CreditCard,
    Lock,
    Zap,
    X,
    Globe2,
    ShieldCheck,
    ArrowRight,
    ArrowLeft,
    Code,
    Terminal,
    ExternalLink,
    QrCode,
    UserCheck,
    UserPlus,
    History,
    HelpCircle
} from 'lucide-react';
import {SERVER_PACKAGE_MAP, CREDIT_PACKAGES_LIST} from '@/src/constants/packages';
import {PayPalScriptProvider, PayPalButtons} from '@paypal/react-paypal-js';

interface CreditModalProps {
    isOpen: boolean;
    user: UserProfile;
    firebaseUser?: any;
    onClose: () => void;
    onPurchaseCredits: (packId: string, amount: number) => Promise<void>;
    onOpenAuthModal?: () => void;
}

interface CurrencyConfig {
    code: string;
    symbol: string;
    name: string;
    flag: string;
    regionLabel: string;
}

const SUPPORTED_CURRENCIES: CurrencyConfig[] = [
    {code: 'USD', symbol: '$', name: 'US Dollar (USA & Global)', flag: '🇺🇸', regionLabel: 'USA & Tier-1 Western'},
    {code: 'GBP', symbol: '£', name: 'British Pound (UK)', flag: '🇬🇧', regionLabel: 'United Kingdom'},
    {code: 'EUR', symbol: '€', name: 'Euro (Europe)', flag: '🇪🇺', regionLabel: 'European Union'},
    {code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', flag: '🇨🇦', regionLabel: 'Canada'},
    {code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', flag: '🇦🇺', regionLabel: 'Australia'},
    {code: 'INR', symbol: '₹', name: 'Indian Rupee (India)', flag: '🇮🇳', regionLabel: 'India & South Asia'},
    {code: 'AED', symbol: 'AED ', name: 'UAE Dirham', flag: '🇦🇪', regionLabel: 'UAE & Middle East'},
];

interface PaymentGateway {
    id: 'razorpay' | 'paypal';
    name: string;
    badge: string;
    description: string;
    supportedCurrencies: string[];
}

const PAYMENT_GATEWAYS: PaymentGateway[] = [
    {
        id: 'razorpay',
        name: 'Razorpay / UPI / GPay',
        badge: 'GPay / PhonePe / Paytm / Cards',
        description: 'Instant UPI, QR Code & Indian/Global Bank Cards',
        supportedCurrencies: ['INR', 'USD', 'EUR', 'GBP'],
    },
    {
        id: 'paypal',
        name: 'PayPal',
        badge: 'PayPal / Credit Card / Pay Later',
        description: 'PayPal Balance, Visa/Mastercard, Buy Now Pay Later',
        supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'],
    },
];

export const CreditModal: React.FC<CreditModalProps> = ({
                                                            isOpen,
                                                            user,
                                                            firebaseUser,
                                                            onClose,
                                                            onPurchaseCredits,
                                                            onOpenAuthModal,
                                                        }) => {
    const [activeTab, setActiveTab] = useState<'buy' | 'history'>('buy');
    const [selectedPackId, setSelectedPackId] = useState<string>('pro_wingman');
    const [currency, setCurrency] = useState<CurrencyConfig>(SUPPORTED_CURRENCIES[0]); // USD default
    const [gateway, setGateway] = useState<PaymentGateway>(PAYMENT_GATEWAYS[0]); // Razorpay default
    const [upiId, setUpiId] = useState<string>('user@okhdfcbank');

    const [isProcessing, setIsProcessing] = useState(false);
    const [purchaseSuccess, setPurchaseSuccess] = useState<string | null>(null);
    const [showDeveloperGuide, setShowDeveloperGuide] = useState<boolean>(false);

    const [creditHistory, setCreditHistory] = useState<CreditTransaction[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState<boolean>(false);

    const isUserRegistered = Boolean(firebaseUser && firebaseUser.email);

    const fetchCreditHistory = async () => {
        setIsLoadingHistory(true);
        try {
            const {ok, data} = await safeFetchJson<{
                success?: boolean;
                history?: CreditTransaction[]
            }>('/api/credits/history');
            if (ok && Array.isArray(data.history)) {
                setCreditHistory(data.history);
            }
        } catch (e) {
            console.error('Failed to fetch credit history:', e);
        } finally {
            setIsLoadingHistory(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchCreditHistory();
        }
    }, [isOpen]);

    // Authentication Guard on Payment Flow: If user is not authenticated via Firebase, redirect to AuthModal
    useEffect(() => {
        if (isOpen && !isUserRegistered) {
            if (onOpenAuthModal) {
                onOpenAuthModal();
            }
        }
    }, [isOpen, isUserRegistered, onOpenAuthModal]);

    // Keyboard Escape & Body Scroll Lock
    useEffect(() => {
        if (!isOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const currentPack = CREDIT_PACKAGES_LIST.find((p) => p.id === selectedPackId) || CREDIT_PACKAGES_LIST[1];

    const getFormattedPrice = () => {
        const priceObj = currentPack.prices[currency.code] || currentPack.prices['USD'];
        return priceObj.formatted;
    };

    const formattedPrice = getFormattedPrice();

    const loadRazorpayScript = () => {
        return new Promise<boolean>((resolve) => {
            if ((window as any).Razorpay) {
                resolve(true);
                return;
            }
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handleCheckout = async () => {
        if (!isUserRegistered) {
            if (onOpenAuthModal) {
                onOpenAuthModal();
            } else {
                alert('Please create an account or log in first so your payment details and credits can be remembered!');
            }
            return;
        }

        setIsProcessing(true);
        setPurchaseSuccess(null);

        const priceObj = currentPack.prices[currency.code] || currentPack.prices['USD'];
        const exactPrice = priceObj.price;

        try {
            // 1. Call backend Razorpay Create Order Endpoint
            const {ok: orderOk, data: orderData} = await safeFetchJson<{
                success?: boolean;
                message?: string;
                key_id?: string;
                keyId?: string;
                order_id?: string;
                orderId?: string;
                currency?: string;
                amount?: number;
                currencyConverted?: boolean;
                displayAmount?: string;
            }>('/api/create-order', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    packId: currentPack.id,
                    price: exactPrice,
                    credits: currentPack.credits,
                    currency: currency.code,
                }),
            });

            if (!orderOk || !orderData.success) {
                alert(orderData?.message || 'Failed to create Razorpay order.');
                setIsProcessing(false);
                return;
            }

            // 2. Ensure Razorpay script is loaded
            const scriptLoaded = await loadRazorpayScript();
            if (!scriptLoaded || !(window as any).Razorpay) {
                alert('Failed to load Razorpay Checkout SDK. Please check your internet connection.');
                setIsProcessing(false);
                return;
            }

            // 3. Configure Razorpay Standard Checkout options
            const keyId = orderData.key_id || orderData.keyId || (import.meta as any).env?.VITE_RAZORPAY_KEY_ID || 'rzp_live_TIQmvp6HTSHaDs';
            const orderId = orderData.order_id || orderData.orderId;
            const orderCurrency = orderData.currency || currency.code || 'INR';
            const orderAmount = orderData.amount;

            let paymentDescription = `${currentPack.credits} AI Profile Credits Refill`;
            if (orderData.currencyConverted) {
                paymentDescription = `${currentPack.credits} Credits (${currentPack.prices[currency.code]?.formatted || currency.code} converted to ${orderData.displayAmount || '₹' + Math.round((orderAmount || 0) / 100) + ' INR'})`;
            }

            const options = {
                key: keyId,
                amount: orderAmount,
                currency: orderCurrency,
                name: 'ProfilePilot AI',
                description: paymentDescription,
                order_id: orderId,
                prefill: {
                    email: user.email || 'user@example.com',
                    name: user.displayName || 'ProfilePilot User',
                },
                theme: {
                    color: '#f43f5e',
                },
                handler: async function (response: {
                    razorpay_payment_id: string;
                    razorpay_order_id: string;
                    razorpay_signature: string;
                }) {
                    setIsProcessing(true);
                    try {
                        // 4. Send payment details & signature to backend for verification
                        const {ok: verifyOk, data: verifyData} = await safeFetchJson<{
                            success?: boolean;
                            message?: string;
                            error?: string;
                            credits?: number;
                        }>('/api/verify-payment', {
                            method: 'POST',
                            headers: {'Content-Type': 'application/json'},
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                                packId: currentPack.id,
                                credits: currentPack.credits,
                            }),
                        });

                        if (verifyOk && verifyData.success) {
                            await onPurchaseCredits(currentPack.id, currentPack.credits);
                            setPurchaseSuccess(
                                `Payment verified!\n+${currentPack.credits} credits have been added to: ${user.email || 'your account'}`
                            );
                            fetchCreditHistory();
                            setTimeout(() => {
                                setPurchaseSuccess(null);
                                onClose();
                            }, 3000);
                        } else {
                            alert(verifyData.message || verifyData.error || 'Razorpay payment verification failed.');
                        }
                    } catch (e: any) {
                        console.error('Payment verification request failed:', e);
                        alert('Server error during payment verification.');
                    } finally {
                        setIsProcessing(false);
                    }
                },
                modal: {
                    ondismiss: function () {
                        setIsProcessing(false);
                    },
                },
            };

            const rzp = new (window as any).Razorpay(options);

            rzp.on('payment.failed', function (response: any) {
                console.error('Razorpay payment failed:', response.error);
                alert(`Payment Failed: ${response.error?.description || 'Transaction was declined.'}`);
                setIsProcessing(false);
            });

            rzp.open();
        } catch (e: any) {
            console.error('Checkout error:', e);
            alert(e?.message || 'An unexpected error occurred while launching Razorpay checkout.');
            setIsProcessing(false);
        }
    };

    return (
        <div
            onClick={(e) => {
                if (e.target === e.currentTarget && !isProcessing) {
                    onClose();
                }
            }}
            className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-4 sm:p-6"
            role="dialog"
            aria-modal="true"
            aria-labelledby="credit-modal-title"
        >
            <div className="flex min-h-full items-center justify-center">
                <div
                    className="relative w-full overflow-hidden max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl my-8 animate-fadeIn text-slate-100">

                    {/* Header */}
                    <div
                        className="bg-gradient-to-r from-orange-950/60 via-slate-900 to-pink-950/60 border-b border-slate-800 p-6 relative">
                        <div className="flex items-center justify-between mb-3">
                            <button
                                onClick={onClose}
                                aria-label="Back to main app"
                                className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-slate-700/80"
                            >
                                <ArrowLeft className="w-4 h-4"/>
                                <span>Back to Home</span>
                            </button>

                            <button
                                onClick={onClose}
                                aria-label="Close pricing and credits page"
                                className="text-slate-400 hover:text-white p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 cursor-pointer transition-all border border-slate-700/80"
                            >
                                <X className="w-5 h-5"/>
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <div
                                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-lg shadow-amber-500/10 shrink-0">
                                <Coins className="w-7 h-7"/>
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 id="credit-modal-title" className="text-xl font-extrabold text-white">Refill
                                        Profilepilot Credits</h2>
                                    <span
                                        className="text-[10px] bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                  Razorpay & Global UPI
                </span>
                                </div>
                                <p className="text-xs text-slate-400">
                                    Unlock instant AI Coach Chat, AI Photo Studio & Prompts Lab generations
                                </p>
                            </div>
                        </div>

                        {/* Header Balance & Tab Switcher */}
                        <div
                            className="my-4 p-3 bg-slate-950/80 border border-slate-800/80 rounded-2xl flex items-center justify-between text-xs gap-2 flex-wrap">
                            <span className="text-slate-400">Current Credit Balance:</span>
                            <div className="flex items-center gap-2">
              <span
                  className="font-extrabold text-amber-400 text-sm flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                <Coins className="w-4 h-4 text-amber-400"/>
                  {user.credits} {user.credits === 1 ? 'Credit' : 'Credits'}
              </span>
                            </div>
                        </div>

                        {/* Tab Navigation */}
                        <div className="flex border-b border-slate-800 gap-4 text-xs font-bold">
                            <button
                                onClick={() => setActiveTab('buy')}
                                className={`pb-3 px-1 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                                    activeTab === 'buy'
                                        ? 'border-orange-500 text-orange-400 font-extrabold'
                                        : 'border-transparent text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <Zap className="w-4 h-4"/>
                                <span>Refill Credit Packs</span>
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('history');
                                    fetchCreditHistory();
                                }}
                                className={`pb-3 px-1 flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                                    activeTab === 'history'
                                        ? 'border-orange-500 text-orange-400 font-extrabold'
                                        : 'border-transparent text-slate-400 hover:text-slate-200'
                                }`}
                            >
                                <History className="w-4 h-4"/>
                                <span>Credit History</span>
                            </button>
                        </div>
                    </div>

                    {/* Content Body */}
                    <div className="p-6 space-y-5">

                        {activeTab === 'history' ? (
                            /* Credit History View */
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                                        <History className="w-4 h-4 text-orange-400"/>
                                        <span>Recent Credit Transactions</span>
                                    </h3>
                                    <button
                                        onClick={fetchCreditHistory}
                                        disabled={isLoadingHistory}
                                        className="text-xs text-orange-400 hover:text-orange-300 font-bold underline cursor-pointer"
                                    >
                                        {isLoadingHistory ? 'Refreshing...' : 'Refresh'}
                                    </button>
                                </div>

                                {isLoadingHistory ? (
                                    <div
                                        className="p-8 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                                        <div
                                            className="w-4 h-4 border-2 border-orange-500/30 border-t-orange-500 rounded-full animate-spin"/>
                                        <span>Loading transaction log...</span>
                                    </div>
                                ) : creditHistory.length === 0 ? (
                                    <div
                                        className="p-8 border border-slate-800/80 rounded-2xl bg-slate-950/60 text-center space-y-2">
                                        <Coins className="w-8 h-8 text-slate-600 mx-auto"/>
                                        <p className="text-xs text-slate-400">No credit history recorded yet.</p>
                                        <p className="text-[11px] text-slate-500">Purchases and feature usage
                                            transactions
                                            will appear here.</p>
                                    </div>
                                ) : (
                                    <div
                                        className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/80">
                                        <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                                            {creditHistory.map((tx) => {
                                                const isPositive = tx.amount > 0;
                                                return (
                                                    <div key={tx.id}
                                                         className="p-3 text-xs flex items-center justify-between hover:bg-slate-900/50 transition-colors">
                                                        <div className="space-y-0.5">
                                                            <p className="font-semibold text-slate-200">{tx.description}</p>
                                                            <p className="text-[10px] text-slate-500 font-mono">
                                                                {new Date(tx.timestamp).toLocaleString()}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                            <span
                                className={`font-mono font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {isPositive ? `+${tx.amount}` : tx.amount}
                            </span>
                                                            <span
                                                                className="block text-[10px] text-slate-400 font-mono">
                              Balance: {tx.balanceAfter}
                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Refill Packs View */
                            <>
                                {/* Feature Cost Legend */}
                                <div className="p-3.5 bg-slate-950/90 border border-slate-800 rounded-2xl space-y-2">
                                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                                        <HelpCircle className="w-3.5 h-3.5 text-amber-400"/>
                                        <span>Fixed Credit Costs:</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                                        <div className="p-2 bg-slate-900/90 rounded-xl border border-slate-800/80">
                                            <span className="block text-slate-400 text-[10px]">Profile Analysis</span>
                                            <strong className="text-amber-400 font-black">30 Credits</strong>
                                        </div>
                                        <div className="p-2 bg-slate-900/90 rounded-xl border border-slate-800/80">
                                            <span className="block text-slate-400 text-[10px]">AI Photo</span>
                                            <strong className="text-amber-400 font-black">10 Credits</strong>
                                        </div>
                                        <div className="p-2 bg-slate-900/90 rounded-xl border border-slate-800/80">
                                            <span className="block text-slate-400 text-[10px]">Coach Reply / Text</span>
                                            <strong className="text-amber-400 font-black">1 Credit</strong>
                                        </div>
                                    </div>
                                </div>

                                {/* Iframe Preview Warning / New Tab Notice */}
                                {window.self !== window.top && (
                                    <div
                                        className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-[11px] text-amber-300 flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="text-amber-400 font-bold">💡 Note:</span>
                    If Razorpay modal is blocked by embedded iframe sandbox rules:
                  </span>
                                        <a
                                            href={window.location.href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/40 rounded-xl font-bold whitespace-nowrap text-[10px] transition-all flex items-center gap-1"
                                        >
                                            <span>Open App in New Tab ↗</span>
                                        </a>
                                    </div>
                                )}

                                {/* Success Alert */}
                                {purchaseSuccess && (
                                    <div
                                        className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-bold flex items-center gap-2.5 animate-bounce">
                                        <Check className="w-5 h-5 shrink-0 text-emerald-400"/>
                                        <span>{purchaseSuccess}</span>
                                    </div>
                                )}

                                {/* Region & Currency Switcher */}
                                <div className="space-y-2">
                                    <label
                                        className="font-extrabold text-xs text-slate-300 flex items-center justify-between uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Globe2 className="w-3.5 h-3.5 text-blue-400"/>
                    Select Currency Pricing:
                  </span>
                                        <span className="text-[10px] text-slate-400 font-mono">{currency.name}</span>
                                    </label>
                                    <div className="flex flex-wrap gap-1.5">
                                        {SUPPORTED_CURRENCIES.map((curr) => {
                                            const isSelected = currency.code === curr.code;
                                            return (
                                                <button
                                                    key={curr.code}
                                                    onClick={() => setCurrency(curr)}
                                                    className={`px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                                                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                                                    }`}
                                                >
                                                    <span>{curr.flag}</span>
                                                    <span>{curr.code}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Credit Pack Options */}
                                <div className="space-y-3">
                                    <label
                                        className="font-extrabold text-xs text-slate-300 block uppercase tracking-wider">
                                        1. Select Credit Package:
                                    </label>

                                    <div className="grid grid-cols-1 gap-3">
                                        {CREDIT_PACKAGES_LIST.map((pack) => {
                                            const isSelected = selectedPackId === pack.id;
                                            const packPriceObj = pack.prices[currency.code] || pack.prices['USD'];

                                            return (
                                                <div
                                                    key={pack.id}
                                                    onClick={() => setSelectedPackId(pack.id)}
                                                    className={`relative p-4 rounded-2xl border transition-all cursor-pointer ${
                                                        isSelected
                                                            ? 'bg-gradient-to-r from-orange-950/40 via-slate-900 to-pink-950/40 border-orange-500 shadow-lg shadow-orange-500/10'
                                                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                                                    }`}
                                                >
                                                    {pack.badge && (
                                                        <span
                                                            className={`absolute -top-2.5 right-4 px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border shadow-sm ${
                                                                pack.popular
                                                                    ? 'bg-gradient-to-r from-orange-500 to-pink-600 text-white border-orange-400/30'
                                                                    : pack.bestValue
                                                                        ? 'bg-purple-600 text-white border-purple-400/30'
                                                                        : 'bg-slate-800 text-slate-300 border-slate-700'
                                                            }`}>
                            {pack.badge}
                          </span>
                                                    )}

                                                    <div className="flex items-start justify-between gap-3">
                                                        <div className="flex items-start gap-3">
                                                            <div
                                                                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors mt-0.5 shrink-0 ${
                                                                    isSelected ? 'border-orange-500 bg-orange-500 text-white' : 'border-slate-700 bg-slate-800'
                                                                }`}>
                                                                {isSelected &&
                                                                    <Check className="w-3.5 h-3.5 stroke-[3]"/>}
                                                            </div>
                                                            <div className="space-y-1">
                                                                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                                                                    <span>{pack.name}</span>
                                                                    {pack.secondaryBadge && (
                                                                        <span
                                                                            className="text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-extrabold border border-amber-500/20">
                                    {pack.secondaryBadge}
                                  </span>
                                                                    )}
                                                                </h3>
                                                                <p className="text-xs text-slate-300 font-medium">
                                                                    {pack.description}
                                                                </p>
                                                                <p className="text-[11px] text-amber-400/90 font-mono bg-slate-900/60 px-2 py-1 rounded-lg border border-slate-800/60 inline-block">
                                                                    💡 Usage: {pack.usageExample}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="text-right shrink-0">
                                                        <span
                                                            className="text-lg font-black text-white">{packPriceObj.formatted}</span>
                                                            <span
                                                                className="text-[10px] block text-slate-400 font-mono">{currency.code}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Payment Gateway Selector */}
                        <div className="space-y-2.5">
                            <label className="font-extrabold text-xs text-slate-300 block uppercase tracking-wider">
                                2. Select Payment Gateway:
                            </label>

                            <div className="grid grid-cols-1 gap-2">
                                {PAYMENT_GATEWAYS.map((gw) => {
                                    const isSelected = gateway.id === gw.id;
                                    return (
                                        <button
                                            key={gw.id}
                                            onClick={() => {
                                                setGateway(gw);
                                                if (gw.id === 'paypal') {
                                                    const paypalCodes = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];
                                                    if (!paypalCodes.includes(currency.code)) {
                                                        setCurrency(SUPPORTED_CURRENCIES[0]);
                                                    }
                                                }
                                            }}
                                            className={`p-3 rounded-2xl border text-left cursor-pointer transition-all space-y-1 ${
                                                isSelected
                                                    ? 'bg-orange-950/40 border-orange-500 text-white shadow-md'
                                                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="font-extrabold text-xs text-white">{gw.name}</span>
                                                {isSelected && <Check className="w-3.5 h-3.5 text-orange-400"/>}
                                            </div>
                                            <p className="text-[9.5px] text-slate-400 line-clamp-1">{gw.badge}</p>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Razorpay Dedicated UPI Section */}
                        {gateway.id === 'razorpay' && (
                            <div
                                className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/30 via-slate-950 to-orange-950/30 border border-blue-500/30 space-y-3">
                                <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                  <QrCode className="w-4 h-4 text-blue-400"/>
                  Razorpay Instant UPI / Netbanking / Debit Card
                </span>
                                    <span
                                        className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-mono">INR ₹ Gateway</span>
                                </div>

                                {/* Supported Apps Badges */}
                                <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                                <span
                                    className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Google Pay</span>
                                    <span
                                        className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">PhonePe</span>
                                    <span
                                        className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">Paytm UPI</span>
                                    <span
                                        className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">BHIM / All Cards</span>
                                </div>

                                <div>
                                    <label className="text-[11px] text-slate-400 font-semibold block mb-1">Enter VPA /
                                        UPI
                                        ID (e.g., yourname@okhdfcbank):</label>
                                    <input
                                        type="text"
                                        value={upiId}
                                        onChange={(e) => setUpiId(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-400"
                                        placeholder="username@upi"
                                    />
                                </div>
                            </div>
                        )}

                        {/* PayPal Info Section */}
                        {gateway.id === 'paypal' && (
                            <div
                                className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/30 via-slate-950 to-indigo-950/30 border border-blue-500/30 space-y-3">
                                <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-400"/>
                  PayPal / Credit & Debit Cards / Buy Now Pay Later
                </span>
                                    <span
                                        className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full font-mono">Global Gateway</span>
                                </div>
                                <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                                <span
                                    className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">💙 PayPal Balance</span>
                                    <span
                                        className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Visa / Mastercard</span>
                                    <span
                                        className="px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">Pay in 4</span>
                                    <span
                                        className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">Amex / Discover</span>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                    Supports USD, EUR, GBP, CAD & AUD. INR is not supported — USD pricing is used
                                    automatically.
                                </p>
                            </div>
                        )}

                        {/* Checkout Breakdown & Button */}
                        <div className="pt-2 space-y-3">
                            {!isUserRegistered ? (
                                <div
                                    className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-purple-500/10 border border-amber-500/30 space-y-2 text-xs">
                                    <div className="flex items-center gap-2 font-bold text-amber-400">
                                        <UserCheck className="w-4 h-4 text-amber-400 shrink-0"/>
                                        <span>Account Registration Required Prior to Purchase</span>
                                    </div>
                                    <p className="text-slate-300 leading-relaxed text-[11px]">
                                        You are browsing as a guest. To ensure your payment details, transaction
                                        receipts,
                                        and refill credits are saved securely to your account, please create an account
                                        or
                                        log in first.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => onOpenAuthModal && onOpenAuthModal()}
                                        className="w-full mt-1 py-2.5 px-4 rounded-xl font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-500/20"
                                    >
                                        <UserPlus className="w-4 h-4"/>
                                        <span>Register / Log In to Enable Payment</span>
                                    </button>
                                </div>
                            ) : (
                                <div
                                    className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 text-xs space-y-2">
                                    <div className="flex items-center justify-between text-slate-300 font-bold">
                                        <span className="text-slate-400 font-medium">Purchasing for:</span>
                                        <span
                                            className="text-pink-400 font-mono font-bold">{user.email || 'authenticated-user@example.com'}</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400">
                                        Credits will be added only to this ProfilePilot account
                                        ({user.email || 'authenticated-user@example.com'}).
                                    </p>
                                    <div className="flex justify-end pt-0.5">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                onClose();
                                                if (onOpenAuthModal) onOpenAuthModal();
                                            }}
                                            className="text-[11px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                                        >
                                            Cancel / Choose another account
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div
                                className="p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs space-y-1.5 text-slate-400">
                                <div className="flex justify-between">
                                    <span>Selected Refill Pack:</span>
                                    <span
                                        className="text-white font-bold">{currentPack.name} (+{currentPack.credits} Credits)</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Gateway & Method:</span>
                                    <span className="text-orange-400 font-bold">{gateway.name} ({currency.code})</span>
                                </div>
                                <div
                                    className="flex justify-between border-t border-slate-800/80 pt-1.5 font-bold text-white text-sm">
                                    <span>Total Refill Amount Due:</span>
                                    <span className="text-amber-400">{formattedPrice} {currency.code}</span>
                                </div>
                            </div>

                            {/* Razorpay checkout button */}
                            {gateway.id === 'razorpay' && (
                                <button
                                    onClick={handleCheckout}
                                    disabled={isProcessing}
                                    className={`w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-[0.99] ${
                                        !isUserRegistered
                                            ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 shadow-md'
                                            : 'bg-gradient-to-r from-orange-500 via-rose-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white shadow-xl shadow-orange-500/20'
                                    }`}
                                >
                                    {!isUserRegistered ? (
                                        <>
                                            <Lock className="w-4 h-4 text-amber-400"/>
                                            <span>Register / Log In First to Pay {formattedPrice}</span>
                                        </>
                                    ) : isProcessing ? (
                                        <div
                                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>
                                    ) : (
                                        <>
                                            <CreditCard className="w-4 h-4"/>
                                            Pay {formattedPrice} with Razorpay & Refill
                                        </>
                                    )}
                                </button>
                            )}

                            {/* PayPal Smart Buttons */}
                            {gateway.id === 'paypal' && isUserRegistered && (
                                <div className="space-y-2">
                                    {isProcessing ? (
                                        <div
                                            className="flex items-center justify-center gap-2 py-5 text-sm text-slate-400">
                                            <div
                                                className="w-5 h-5 border-2 border-blue-500/30 border-t-blue-400 rounded-full animate-spin"/>
                                            <span>Processing PayPal payment…</span>
                                        </div>
                                    ) : (
                                        <PayPalScriptProvider
                                            options={{
                                                clientId: (import.meta as any).env?.VITE_PAYPAL_CLIENT_ID || 'test',
                                                currency: (['USD', 'EUR', 'GBP', 'CAD', 'AUD'].includes(currency.code) ? currency.code : 'USD'),
                                                intent: 'capture',
                                                components: 'buttons',
                                            }}
                                        >
                                            <PayPalButtons
                                                style={{layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay'}}
                                                createOrder={async () => {

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
                                                                currency: currency.code,
                                                                gateway: 'paypal',
                                                            }),
                                                        });
                                                        if (!ok || !data.success) {
                                                            setIsProcessing(false);
                                                            throw new Error(data.message || 'Could not create PayPal order.');
                                                        }
                                                        return data.paypalOrderId || data.orderId || '';
                                                    } catch (e: any) {
                                                        setIsProcessing(false);
                                                        throw e;
                                                    }
                                                }}
                                                onApprove={async (data) => {
                                                    setIsProcessing(true);
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
                                                            await onPurchaseCredits(currentPack.id, currentPack.credits);
                                                            setPurchaseSuccess(
                                                                `PayPal payment confirmed!\n+${currentPack.credits} credits added to: ${user.email}`
                                                            );
                                                            fetchCreditHistory();
                                                            setTimeout(() => {
                                                                setPurchaseSuccess(null);
                                                                onClose();
                                                            }, 3000);
                                                        } else {
                                                            alert(captureData.message || 'PayPal payment capture failed. Please contact support.');
                                                        }
                                                    } catch (e: any) {
                                                        console.error('PayPal capture error:', e);
                                                        alert('Server error during PayPal capture. Please contact support.');
                                                    } finally {
                                                        setIsProcessing(false);
                                                    }
                                                }}
                                                onError={(err) => {
                                                    console.error('PayPal SDK error:', err);
                                                    alert('PayPal encountered an error. Please try again.');
                                                    setIsProcessing(false);
                                                }}
                                                onCancel={() => {
                                                    setIsProcessing(false);
                                                }}
                                            />
                                        </PayPalScriptProvider>
                                    )}
                                </div>
                            )}

                            {/* PayPal – not-registered guard */}
                            {gateway.id === 'paypal' && !isUserRegistered && (
                                <button
                                    type="button"
                                    onClick={() => onOpenAuthModal && onOpenAuthModal()}
                                    className="w-full py-4 px-6 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/30 shadow-md transition-all cursor-pointer"
                                >
                                    <Lock className="w-4 h-4 text-amber-400"/>
                                    <span>Register / Log In First to Pay with PayPal</span>
                                </button>
                            )}

                            <div className="pt-2 border-t border-slate-800/80 text-center space-y-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                                >
                                    <ArrowLeft className="w-3.5 h-3.5 text-slate-400"/>
                                    <span>Back to Main Site</span>
                                </button>
                                <p className="text-center text-[10px] text-slate-500 flex items-center justify-center gap-1">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400"/>
                                    Instant Credit Synchronization • Razorpay & PayPal Secure Checkout
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
