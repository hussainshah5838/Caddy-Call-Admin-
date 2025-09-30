import React from "react";
import {
  MdShoppingCart,
  MdGroup,
  MdAttachMoney,
  MdPlace,
} from "react-icons/md";
import { formatNumber, formatCurrency } from "../../../utils/format";

const ICONS = {
  cart: MdShoppingCart,
  users: MdGroup,
  money: MdAttachMoney,
  pin: MdPlace,
};

const Accent = {
  cart: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
  users: "bg-blue-50 text-blue-600 ring-1 ring-blue-100",
  money: "bg-violet-50 text-violet-600 ring-1 ring-violet-100",
  pin: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
};

function Value({ value, currency }) {
  if (currency) return <span>{formatCurrency(value, currency)}</span>;
  return <span>{formatNumber(value)}</span>;
}

const StatCard = React.memo(function StatCard({
  title,
  value,
  delta = 0,
  sub,
  icon = "cart",
  currency,
}) {
  const Icon = ICONS[icon] || MdShoppingCart;
  const accent = Accent[icon] || Accent.cart;
  const up = delta >= 0;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="text-sm text-gray-500">{title}</div>
        <div
          className={[
            "h-8 w-8 rounded-full grid place-items-center",
            accent,
          ].join(" ")}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-2 text-2xl font-semibold text-gray-900 tracking-tight">
        <Value value={value} currency={currency} />
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span
          className={[
            "text-sm font-medium",
            up ? "text-emerald-600" : "text-rose-600",
          ].join(" ")}
        >
          {up ? "+" : ""}
          {delta}%
        </span>
        <span className="text-sm text-gray-500">{sub}</span>
      </div>
    </div>
  );
});

export default StatCard;
