"use client";

import { useState } from "react";
import { Provider } from "react-redux";
import { type AppStore, makeStore } from "../lib/store";

export default function StoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Create the store instance the first time this renders
  const [store] = useState<AppStore>(makeStore);

  return <Provider store={store}>{children}</Provider>;
}
