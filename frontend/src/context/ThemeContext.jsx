// import React, { createContext, useContext, useEffect, useState } from 'react';

// const ThemeContext = createContext();

// export const ThemeProvider = ({ children }) => {
//   // Force dark mode as the only state
//   const [isDarkMode] = useState(true);

//   useEffect(() => {
//     const root = window.document.documentElement;
//     // Always add dark class
//     root.classList.add('dark');
//     localStorage.setItem('theme', 'dark');
//   }, []);

//   // toggleTheme becomes a no-op since user wants dark only
//   const toggleTheme = () => console.warn('Theme is locked to Dark Mode');

//   return (
//     <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// export const useTheme = () => {
//   const context = useContext(ThemeContext);
//   if (context === undefined) {
//     throw new Error('useTheme must be used within a ThemeProvider');
//   }
//   return context;
// };


import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Force dark mode as the only state
  const [isDarkMode] = useState(true);

  useEffect(() => {
    const root = window.document.documentElement;
    // Always add dark class
    root.classList.add('dark');
    localStorage.setItem('theme', 'dark');
  }, []);

  // toggleTheme becomes a no-op since user wants dark only
  const toggleTheme = () => console.warn('Theme is locked to Dark Mode');

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
