// src/components/ToastProvider.jsx
import React from "react";
import { Toaster } from "react-hot-toast";

export default function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      containerStyle={{
        top: 170,
        right: 120, 
      }}
      toastOptions={{
        duration: 3000, 
        style: {
          fontSize: "14px",
          borderRadius: "8px",
        },
      }}
    />
  );
}
