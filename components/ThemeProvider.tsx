'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper function to get initial theme
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  
  // Check if dark class is already on html element (from the script)
  const hasDarkClass = document.documentElement.classList.contains('dark');
  
  // Check localStorage
  const savedTheme = localStorage.getItem('theme') as Theme;
  if (savedTheme) {
    return savedTheme;
  }
  
  // If dark class is present, return dark
  if (hasDarkClass) {
    return 'dark';
  }
  
  // Check system preference
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Start with 'light' to match server render, then update after mount
  const [theme, setTheme] = useState<Theme>('light');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Get the actual theme after mount
    const initialTheme = getInitialTheme();
    
    // Sync the DOM with the theme
    const html = document.documentElement;
    const body = document.body;
    
    // Find wrapper div and main element by ID
    const wrapper = document.getElementById('theme-wrapper');
    const main = document.getElementById('theme-main');
    const navbar = document.getElementById('theme-navbar') as HTMLElement;
    
    if (initialTheme === 'dark') {
      html.classList.add('dark');
      body.style.backgroundColor = '#09090b';
      body.style.color = '#fafafa';
      if (wrapper) {
        wrapper.style.backgroundColor = '#09090b';
        wrapper.style.color = '#fafafa';
      }
      if (main) {
        main.style.backgroundColor = '#09090b';
        main.style.color = '#fafafa';
      }
      if (navbar) {
        navbar.style.backgroundColor = '#B22222';
        navbar.style.borderColor = '#27272a';
      }
    } else {
      html.classList.remove('dark');
      body.style.backgroundColor = '#ffffff';
      body.style.color = '#171717';
      if (wrapper) {
        wrapper.style.backgroundColor = '#ffffff';
        wrapper.style.color = '#171717';
      }
      if (main) {
        main.style.backgroundColor = '#ffffff';
        main.style.color = '#171717';
      }
      if (navbar) {
        navbar.style.backgroundColor = '#B22222';
        navbar.style.borderColor = '#e4e4e7';
      }
    }
    
    setTheme(initialTheme);
  }, []);

  useEffect(() => {
    if (mounted) {
      // Sync the DOM when theme changes after mount
      const html = document.documentElement;
      const body = document.body;
      
      // Find wrapper div and main element by ID
      const wrapper = document.getElementById('theme-wrapper');
      const main = document.getElementById('theme-main');
      const navbar = document.getElementById('theme-navbar') as HTMLElement;
      
      if (theme === 'dark') {
        html.classList.add('dark');
        // Force background color directly on all elements
        body.style.backgroundColor = '#09090b';
        body.style.color = '#fafafa';
        if (wrapper) {
          wrapper.style.backgroundColor = '#09090b';
          wrapper.style.color = '#fafafa';
        }
        if (main) {
          main.style.backgroundColor = '#09090b';
          main.style.color = '#fafafa';
        }
        if (navbar) {
          navbar.style.backgroundColor = '#B22222';
          navbar.style.borderColor = '#3f3f46';
        }
      } else {
        html.classList.remove('dark');
        // Force background color directly on all elements
        body.style.backgroundColor = '#ffffff';
        body.style.color = '#171717';
        if (wrapper) {
          wrapper.style.backgroundColor = '#ffffff';
          wrapper.style.color = '#171717';
        }
        if (main) {
          main.style.backgroundColor = '#ffffff';
          main.style.color = '#171717';
        }
        if (navbar) {
          navbar.style.backgroundColor = '#B22222';
          navbar.style.borderColor = '#d4d4d8';
        }
      }
    }
  }, [theme, mounted]);

  const toggleTheme = () => {
    setTheme((currentTheme) => {
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      // Update DOM immediately for instant feedback
      const html = document.documentElement;
      const body = document.body;
      
      // Find wrapper div and main element by ID
      const wrapper = document.getElementById('theme-wrapper');
      const main = document.getElementById('theme-main');
      const navbar = document.getElementById('theme-navbar') as HTMLElement;
      
      if (newTheme === 'dark') {
        html.classList.add('dark');
        body.style.backgroundColor = '#09090b';
        body.style.color = '#fafafa';
        if (wrapper) {
          wrapper.style.backgroundColor = '#09090b';
          wrapper.style.color = '#fafafa';
        }
        if (main) {
          main.style.backgroundColor = '#09090b';
          main.style.color = '#fafafa';
        }
        if (navbar) {
          navbar.style.backgroundColor = '#B22222';
          navbar.style.borderColor = '#3f3f46';
        }
      } else {
        html.classList.remove('dark');
        body.style.backgroundColor = '#ffffff';
        body.style.color = '#171717';
        if (wrapper) {
          wrapper.style.backgroundColor = '#ffffff';
          wrapper.style.color = '#171717';
        }
        if (main) {
          main.style.backgroundColor = '#ffffff';
          main.style.color = '#171717';
        }
        if (navbar) {
          navbar.style.backgroundColor = '#B22222';
          navbar.style.borderColor = '#d4d4d8';
        }
      }
      
      // Update localStorage
      localStorage.setItem('theme', newTheme);
      
      return newTheme;
    });
  };

  // Always provide the context
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
