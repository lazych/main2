'use client';
import React, { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { createPortal } from 'react-dom';

const API_BASE_URL = 'https://api-internal-2.sellauth.com/v1';

export interface CartItem {
    productId: number;
    variantId?: number;
    quantity: number;
}

export interface CheckoutOptions {
    cart: CartItem[];
    shopId: number;
    modal?: boolean;
    scrollTop?: boolean;
}

export interface SellAuthEmbedHook {
    checkout: (options: CheckoutOptions) => Promise<void>;
    isLoading: boolean;
    closeModal: () => void;
    captcha: React.ReactElement;
    modal: React.ReactElement | null;
}

interface AltchaWidgetElement extends HTMLElement {
    value: string;
}

const HiddenAltcha = forwardRef<{ value: string | null }, { onStateChange?: (ev: any) => void }>(
    ({ onStateChange }, ref) => {
        const widgetRef = useRef<HTMLElement>(null);
        const [value, setValue] = useState<string | null>(null);
        const [isReady, setIsReady] = useState(false);

        useImperativeHandle(ref, () => {
            return {
                get value() {
                    return value;
                }
            };
        }, [value]);

        useEffect(() => {
            const load = async () => {
                try {
                    await import('altcha');
                    await customElements.whenDefined('altcha-widget');
                    setIsReady(true);
                } catch (error) {
                    console.error('Failed to load altcha:', error);
                }
            };

            load();
        }, []);

        useEffect(() => {
            if (!isReady || !widgetRef.current) {
                return;
            }

            const widget = widgetRef.current;

            const handleStateChange = (ev: Event) => {
                const customEv = ev as CustomEvent;
                if (customEv.detail && 'payload' in customEv.detail) {
                    const payload = customEv.detail.payload || null;
                    setValue(payload);
                    onStateChange?.(customEv);
                }
            };

            widget.addEventListener('statechange', handleStateChange);

            return () => {
                widget.removeEventListener('statechange', handleStateChange);
            };
        }, [isReady, onStateChange]);

        if (!isReady) {
            return null;
        }

        // Using `as any` for style to bypass typing issues with web component.
        return createPortal(
            <altcha-widget
                ref={widgetRef}
                challengeurl={`${API_BASE_URL}/altcha`}
                auto="onload"
                hidefooter={true}
                hidelogo={true}
                style={{
                    display: 'none',
                    position: 'absolute',
                    top: '-9999px',
                    left: '-9999px',
                    '--altcha-max-width': '100%',
                } as any}
            />,
            document.body
        );
    }
);

HiddenAltcha.displayName = 'HiddenAltcha';

function CheckoutModal({ url, onClose }: { url: string; onClose: () => void }) {
    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
                className="fixed inset-0 bg-black/75 backdrop-blur-sm"
                onClick={onClose}
            />
            <div className="relative bg-[#141414] text-white rounded-xl max-w-[98vw] md:max-w-[32rem] w-full max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-[1.125rem] z-10 p-1 text-white hover:text-gray-300 transition-colors"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        fill="currentColor"
                        viewBox="0 0 256 256"
                    >
                        <path d="M205.66,194.34a8,8,0,0,1-11.32,11.32L128,139.31,61.66,205.66a8,8,0,0,1-11.32-11.32L116.69,128,50.34,61.66A8,8,0,0,1,61.66,50.34L128,116.69l66.34-66.35a8,8,0,0,1,11.32,11.32L139.31,128Z" />
                    </svg>
                </button>
                <div className="w-full h-full">
                    <iframe
                        src={url}
                        title="SellAuth Embed"
                        referrerPolicy="no-referrer"
                        allow="payment; clipboard-write"
                        className="w-full h-[46rem] md:h-[52rem] border-0"
                    />
                </div>
            </div>
        </div>,
        document.body
    );
}

export function useSellAuthEmbed(): SellAuthEmbedHook {
    const [isLoading, setIsLoading] = useState(false);
    const [modalUrl, setModalUrl] = useState<string | null>(null);
    const [altchaToken, setaltchaToken] = useState<string | null>(null);
    const [altchaKey, setAltchaKey] = useState(0);
    const altchaRef = useRef<{ value: string | null; reset: () => void }>(null);

    const handleCaptchaStateChange = useCallback((ev: any) => {
        if (ev.detail?.state === 'verified') {
            setaltchaToken(ev.detail.payload);
        }
    }, []);

    const closeModal = useCallback(() => {
        setModalUrl(null);
    }, []);

    const checkout = useCallback(async ({ cart, shopId, modal = true, scrollTop = true }: CheckoutOptions) => {
        if (isLoading) {
            return;
        }

        if (!altchaToken) {
            alert('Captcha not ready. Please try again in a moment.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ cart, shopId, altcha: altchaToken }),
            });

            const responseData = await response.json();

            if (responseData.error) {
                throw new Error(responseData.error);
            }

            if (!responseData.url) {
                throw new Error('No checkout URL returned. Please try again.');
            }

            if (modal) {
                setModalUrl(responseData.url);
                if (scrollTop) {
                    window.scrollTo(0, 0);
                }
            } else {
                window.open(responseData.url, '_blank');
            }
        } catch (error) {
            console.error(error);
            alert(error instanceof Error ? error.message : 'An error occurred during checkout');
        } finally {
            setIsLoading(false);
            setAltchaKey(prev => prev + 1);
            setaltchaToken(null);
        }
    }, [isLoading, altchaToken]);

    return {
        checkout,
        isLoading,
        closeModal,
        captcha: <HiddenAltcha key={altchaKey} ref={altchaRef} onStateChange={handleCaptchaStateChange} />,
        modal: modalUrl ? <CheckoutModal url={modalUrl} onClose={closeModal} /> : null,
    };
}

export interface SellAuthButtonProps {
    cart: CartItem[];
    shopId: number;
    modal?: boolean;
    scrollTop?: boolean;
    className?: string;
    children?: React.ReactNode;
    disabled?: boolean;
}

export function SellAuthButton({
    cart,
    shopId,
    modal = true,
    scrollTop = true,
    className = '',
    children,
    disabled = false,
}: SellAuthButtonProps) {
    const { checkout, isLoading, modal: checkoutModal, captcha } = useSellAuthEmbed();

    const handleClick = () => {
        checkout({ cart, shopId, modal, scrollTop });
    };

    const defaultClassName = "inline-flex items-center justify-center rounded-md bg-gray-800/50 px-4 py-2 text-sm font-medium duration-100 disabled:pointer-events-none disabled:opacity-50 hover:bg-gray-700 hover:text-white transition-colors backdrop-blur-md cursor-pointer";

    return (
        <>
            {captcha}
            <button
                type="button"
                className={className || defaultClassName}
                onClick={handleClick}
                disabled={disabled || isLoading}
            >
                {children || (
                    <>
                        <span>Buy Now</span>
                        {!isLoading && (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="size-5 ml-2"
                                fill="currentColor"
                                viewBox="0 0 256 256"
                            >
                                <path d="M230.14,58.87A8,8,0,0,0,224,56H62.68L56.6,22.57A8,8,0,0,0,48.73,16H24a8,8,0,0,0,0,16h18L67.56,172.29a24,24,0,0,0,5.33,11.27,28,28,0,1,0,44.4,8.44h45.42A27.75,27.75,0,0,0,160,204a28,28,0,1,0,28-28H91.17a8,8,0,0,1-7.87-6.57L80.13,152h116a24,24,0,0,0,23.61-19.71l12.16-66.86A8,8,0,0,0,230.14,58.87ZM104,204a12,12,0,1,1-12-12A12,12,0,0,1,104,204Zm96,0a12,12,0,1,1-12-12A12,12,0,0,1,200,204Zm4-74.57A8,8,0,0,1,196.1,136H77.22L65.59,72H214.41Z" />
                            </svg>
                        )}
                        {isLoading && (
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="size-5 ml-2 animate-spin"
                                fill="currentColor"
                                viewBox="0 0 256 256"
                            >
                                <path d="M232,128a104,104,0,0,1-208,0c0-41,23.81-78.36,60.66-95.27a8,8,0,0,1,6.68,14.54C60.15,61.59,40,93.27,40,128a88,88,0,0,0,176,0c0-34.73-20.15-66.41-51.34-80.73a8,8,0,0,1,6.68-14.54C208.19,49.64,232,87,232,128Z" />
                            </svg>
                        )}
                    </>
                )}
            </button>
            {checkoutModal}
        </>
    );
}
