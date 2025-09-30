import React from "react";

const Select = React.memo(function Select(props) {
  return (
    <select
      {...props}
      className={`w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600/60 ${
        props.className || ""
      }`}
    />
  );
});

export default Select;
