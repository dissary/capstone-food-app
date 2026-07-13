import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Login from './Login';

vi.mock('../context/AuthContext', async () => {
  return await import('../context/__mocks__/AuthContext');
});

// eslint-disable-next-line import/first
import { AuthProvider } from '../context/AuthContext'; // resolves to the mocked version above

function renderLogin() {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Login />
      </AuthProvider>
    </BrowserRouter>
  );
}

describe('Login page', () => {
  it('renders email and password inputs', () => {
    renderLogin();
    expect(screen.getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/password/i)).toBeInTheDocument();
  });

  it('lets the user type into the email field', async () => {
    renderLogin();
    const emailInput = screen.getByPlaceholderText(/email/i);
    await userEvent.type(emailInput, 'test@example.com');
    expect(emailInput.value).toBe('test@example.com');
  });

it('renders a submit button', () => {
  renderLogin();
  expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
});

it('renders a Google sign-in button', () => {
  renderLogin();
  expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
});
});