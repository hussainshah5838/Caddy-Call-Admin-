import React from "react";
import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Router from "./routes/Router";

const App = () => {
  return (
    <>
      <RouterProvider router={Router} />
      <ToastContainer position="top-right" autoClose={2500} />
    </>
  );
};

export default App;
 