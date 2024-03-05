"use client";

import { useEffect } from "react";
import { Crisp } from "crisp-sdk-web";

export const CrispChat = () => {
  useEffect(() => {
    Crisp.configure("c1c5b660-4f99-4d52-8940-a3a2836e5529");
  }, []);

  return null;
};
