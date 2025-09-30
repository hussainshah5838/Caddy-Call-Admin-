import React from "react";

const Input = React.memo(function Input(props) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-600/60 ${
        props.className || ""
      }`}
    />
  );
});

export default Input;
