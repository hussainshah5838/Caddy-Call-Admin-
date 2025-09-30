import React from "react";
import { MdArrowForward } from "react-icons/md";

const unreadCls = "bg-emerald-50/50";
const readCls = "bg-white";

const NotificationItem = React.memo(function NotificationItem({
  item,
  onClick,
}) {
  return (
    <button
      onClick={() => onClick?.(item)}
      className={`w-full text-left rounded-xl border border-gray-200 ${
        item.unread ? unreadCls : readCls
      }
                  hover:bg-gray-50 transition-colors shadow-sm`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <img
          src={item.avatar}
          alt=""
          className="h-10 w-10 rounded-full object-cover"
          loading="lazy"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">{item.user}</span>
            <span className="text-xs text-gray-400">{item.time}</span>
          </div>
          <div className="text-xs text-gray-500 truncate">{item.text}</div>
        </div>

        <MdArrowForward className="h-5 w-5 text-gray-600" />
      </div>
    </button>
  );
});

export default NotificationItem;
