"use client";

import { useState } from "react";
import StatusBadge from "@/components/admin/StatusBadge";

type OrderStatus = "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";

interface Order {
  id: string;
  shippingName: string | null;
  shippingEmail: string | null;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: string;
  createdAt: string;
}

interface OrdersTableProps {
  orders: Order[];
  onStatusChange: (orderId: string, status: OrderStatus) => Promise<void>;
}

export default function OrdersTable({ orders, onStatusChange }: OrdersTableProps) {
  const [updating, setUpdating] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, status: OrderStatus) => {
    setUpdating(orderId);
    await onStatusChange(orderId, status);
    setUpdating(null);
  };

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm">
      <table className="min-w-full divide-y divide-gray-100 bg-white">
        <thead className="bg-gray-50">
          <tr>
            {["Order ID", "Customer", "Date", "Total", "Payment", "Status", "Update"].map(
              (h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {orders.map((order) => (
            <tr key={order.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 text-xs font-mono text-gray-500">
                {order.id.slice(0, 8)}…
              </td>
              <td className="px-4 py-3">
                <p className="text-sm font-medium text-gray-900">{order.shippingName ?? "—"}</p>
                <p className="text-xs text-gray-400">{order.shippingEmail ?? "—"}</p>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500">
                {new Date(order.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                ${order.totalAmount.toFixed(2)}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    order.paymentStatus === "PAID"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.paymentStatus}
                </span>
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={order.status} />
              </td>
              <td className="px-4 py-3">
                <select
                  defaultValue={order.status}
                  disabled={updating === order.id}
                  onChange={(e) =>
                    handleStatusChange(order.id, e.target.value as OrderStatus)
                  }
                  className="text-sm border border-gray-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-50"
                >
                  {["PENDING", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map(
                    (s) => (
                      <option key={s} value={s}>
                        {s.charAt(0) + s.slice(1).toLowerCase()}
                      </option>
                    )
                  )}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 && (
        <p className="text-center text-gray-400 py-10 text-sm">No orders found.</p>
      )}
    </div>
  );
}