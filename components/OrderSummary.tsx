// components/OrderSummary.tsx

"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";

export default function OrderSummary() {
  const { cart, cartTotal } = useCart();

  const shipping = cartTotal > 0 ? 9.99 : 0;
  const total = cartTotal + shipping;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Order Summary</h2>

      <ul className="divide-y divide-gray-200">
        {cart.map((item) => (
          <li key={item.id} className="flex items-center gap-4 py-3">
            {item.image && (
              <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">
                {item.name}
              </p>
              <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
            </div>
            <p className="text-sm font-semibold text-gray-800">
              ${(item.price * item.quantity).toFixed(2)}
            </p>
          </li>
        ))}
      </ul>

      {cart.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          Your cart is empty.
        </p>
      )}

      <div className="border-t border-gray-200 pt-4 space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${cartTotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>{shipping > 0 ? `$${shipping.toFixed(2)}` : "—"}</span>
        </div>
        <div className="flex justify-between font-semibold text-gray-800 text-base pt-2 border-t border-gray-200">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}