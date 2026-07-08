import '@testing-library/jest-dom';
import { vi } from 'vitest';
import React from 'react';

vi.mock('motion/react', () => {
  return {
    motion: {
      section: ({ children, className, ...props }: any) => React.createElement('section', { className, 'data-testid': props['data-testid'], ...props }, children),
      form: ({ children, className, onSubmit, ...props }: any) => React.createElement('form', { className, onSubmit, 'data-testid': props['data-testid'] }, children),
      div: ({ children, className, ...props }: any) => React.createElement('div', { className, 'data-testid': props['data-testid'], ...props }, children),
      p: ({ children, className, ...props }: any) => React.createElement('p', { className, 'data-testid': props['data-testid'], ...props }, children),
    },
    AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
  };
});
