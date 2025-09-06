import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export const GlassCard = ({
  children,
  className = '',
  hoverEffect = false,
  ...props
}: GlassCardProps) => {
  return (
    <div
      className={`glassmorphism rounded-2xl p-6 backdrop-blur-lg bg-white/10 dark:bg-gray-900/30 border border-white/20 dark:border-gray-700/50 shadow-lg ${hoverEffect ? 'transition-all duration-300 hover:bg-white/20 hover:dark:bg-gray-800/40' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

interface NeumorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  darkMode?: boolean;
}

export const NeumorphicCard = ({
  children,
  className = '',
  hoverEffect = false,
  darkMode = false,
  ...props
}: NeumorphicCardProps) => {
  const baseClasses = 'rounded-2xl p-6 transition-all duration-300';
  const lightModeClasses = 'bg-gray-100 shadow-neumorph hover:shadow-neumorph-hover';
  const darkModeClasses = 'dark:bg-gray-800 dark:shadow-neumorph-dark dark:hover:shadow-neumorph-dark-hover';
  
  return (
    <div
      className={`${baseClasses} ${darkMode ? darkModeClasses : lightModeClasses} ${hoverEffect ? 'hover:-translate-y-1' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const GlassButton = ({
  children,
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  return (
    <button
      className={`glassmorphism-button px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:shadow-lg ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const NeumorphicButton = ({
  children,
  className = '',
  darkMode = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { darkMode?: boolean }) => {
  const baseClasses = 'px-6 py-3 rounded-xl font-medium transition-all duration-300';
  const lightModeClasses = 'bg-gray-100 shadow-neumorph hover:shadow-neumorph-hover active:shadow-neumorph-active';
  const darkModeClasses = 'dark:bg-gray-800 dark:shadow-neumorph-dark dark:hover:shadow-neumorph-dark-hover dark:active:shadow-neumorph-dark-active';
  
  return (
    <button
      className={`${baseClasses} ${darkMode ? darkModeClasses : lightModeClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
