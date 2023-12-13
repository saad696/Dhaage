"use client";

import React from "react";
import { Button } from "../ui/button";
import { MoveLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const NavigateBack = () => {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      className="mb-8 hover:bg-gray-700"
      onClick={() => router.back()}
    >
      <MoveLeft className="text-light-1" />
    </Button>
  );
};

export default NavigateBack;
