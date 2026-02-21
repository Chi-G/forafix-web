import { create } from 'zustand';
import React from 'react';

interface HeaderState {
    extraActions: React.ReactNode | null;
    setExtraActions: (actions: React.ReactNode | null) => void;
}

export const useHeaderStore = create<HeaderState>((set) => ({
    extraActions: null,
    setExtraActions: (actions) => set({ extraActions: actions }),
}));
