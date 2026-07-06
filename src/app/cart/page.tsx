"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { resolveImagePath } from '@/utils/resolveImagePath';

export default function CartPage() {
  const { cartItems, removeFromCart, cartTotal } = useCart();

  return (
    <div className="min-h-screen text-white font-sans selection:bg-zinc-800">
      <main className="w-full max-w-4xl mx-auto px-6 md:px-12 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white mb-12">
          Your Cart
        </h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-24 bg-zinc-900/50 rounded-2xl border border-zinc-800">
            <h2 className="text-xl text-zinc-400 mb-6">Your cart is currently empty.</h2>
            <Link href="/photography" className="bg-white text-black font-medium px-6 py-3 rounded-full hover:bg-zinc-200 transition-colors">
              Browse Prints
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Cart Items */}
            <div className="flex-1">
              <div className="flex flex-col gap-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-6 bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 items-center">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-zinc-950 flex-shrink-0">
                      <Image
                        src={resolveImagePath(item.image)}
                        alt="Print thumbnail"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-white mb-1">Fine Art Print</h3>
                      <p className="text-sm text-zinc-400 mb-2">Size: {item.size}</p>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-sm text-red-500 hover:text-red-400 transition-colors"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="text-xl font-bold text-white">
                      ${item.price}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-1/3">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sticky top-32">
                <h3 className="text-xl font-semibold text-white mb-6">Order Summary</h3>
                
                <div className="flex justify-between text-zinc-400 mb-4">
                  <span>Subtotal</span>
                  <span>${cartTotal}</span>
                </div>
                <div className="flex justify-between text-zinc-400 mb-6 pb-6 border-b border-zinc-800">
                  <span>Shipping</span>
                  <span>Calculated at checkout</span>
                </div>
                
                <div className="flex justify-between text-white font-bold text-2xl mb-8">
                  <span>Total</span>
                  <span>${cartTotal}</span>
                </div>

                <button 
                  onClick={() => alert("This is where the user would be redirected to Stripe/Shopify to complete checkout!")}
                  className="w-full py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-xl transition-colors shadow-lg shadow-green-900/50"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
