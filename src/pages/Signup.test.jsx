import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Signup from './Signup';

vi.mock('../context/AuthContext', async () => {
  return await import('../context/__mocks__/AuthContext');
});

import { AuthProvider } from '../context/AuthContext';

function renderSignup() {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Signup />
      </AuthProvider>
    </BrowserRouter>
  );
}

describe('Signup page', () => {
  it('renders email and password inputs', () => {
    renderSignup();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  it('renders a submit button', () => {
    renderSignup();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});