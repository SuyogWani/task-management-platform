import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Register from './Register';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('Register page', () => {
  it('renders registration fields', () => {
    render(
      <MemoryRouter>
        <Register onAuth={vi.fn()} />
      </MemoryRouter>
    );

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('submits the form and calls onAuth', async () => {
    const onAuth = vi.fn();
    api.post.mockResolvedValueOnce({ data: { token: 'fake-token', user: { id: 1, name: 'Alice', email: 'alice@example.com' } } });

    render(
      <MemoryRouter>
        <Register onAuth={onAuth} />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/name/i), 'Alice');
    await userEvent.type(screen.getByLabelText(/email/i), 'alice@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(onAuth).toHaveBeenCalledWith('fake-token');
    });
  });

  it('shows error message when API fails', async () => {
    api.post.mockRejectedValueOnce({ response: { data: { message: 'Email already registered.' } } });

    render(
      <MemoryRouter>
        <Register onAuth={vi.fn()} />
      </MemoryRouter>
    );

    await userEvent.type(screen.getByLabelText(/name/i), 'Alice');
    await userEvent.type(screen.getByLabelText(/email/i), 'alice@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');
    await userEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText(/email already registered/i)).toBeInTheDocument();
    });
  });
});
