import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Login from './Login';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('Login page', () => {
  it('renders login fields', () => {
    render(
      <MemoryRouter>
        <Login onAuth={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('calls onAuth when login succeeds', async () => {
    const onAuth = vi.fn();
    api.post.mockResolvedValueOnce({ data: { token: 'login-token' } });

    render(
      <MemoryRouter>
        <Login onAuth={onAuth} />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(onAuth).toHaveBeenCalledWith('login-token');
    });
  });

  it('displays error when login fails', async () => {
    api.post.mockRejectedValueOnce({ response: { data: { message: 'Invalid email or password.' } } });

    render(
      <MemoryRouter>
        <Login onAuth={vi.fn()} />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'badpassword');
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });
});
