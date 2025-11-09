import React from "react";
import { supabase } from "../config/env";

const DebugInfo = () => {
  const checkEnvironment = () => {
    console.log("🔍 Environment Debug Info:");
    console.log("🌐 Supabase URL:", supabase.supabaseUrl);
    console.log(
      "🔑 API Key exists:",
      !!import.meta.env.VITE_SUPABASE_PROD_API_KEY
    );
    console.log(
      "🔑 API Key length:",
      import.meta.env.VITE_SUPABASE_PROD_API_KEY?.length
    );
    console.log("⏰ Current time:", new Date().toISOString());
    console.log("⏰ Timestamp:", Date.now());

    // Check if we can make a simple request
    supabase.auth.getUser().then(({ data, error }) => {
      console.log("🧪 Test getUser result:", { data: !!data?.user, error });
    });
  };

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 text-white p-4 rounded-lg shadow-lg z-50">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <button
        onClick={checkEnvironment}
        className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-sm"
      >
        Check Environment
      </button>
    </div>
  );
};

export default DebugInfo;
