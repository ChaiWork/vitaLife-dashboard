/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

export function NavButton({ active, onClick, icon, label }: NavButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-0 py-3 rounded-xl text-sm font-medium transition-all ${
        active 
          ? 'text-minimal-ink' 
          : 'text-minimal-muted hover:text-minimal-ink'
      }`}
    >
      <span className={active ? 'text-minimal-blue' : ''}>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
