import React from "react";
import { Loader2 } from "lucide-react";

const Loader = () => {
  return (
    <div className="flex items-center justify-center w-full h-full p-6 bg-auto">
      <Loader2 className="w-10 h-10 text-pink-500 animate-spin" />
    </div>
  );
};

export default Loader;
