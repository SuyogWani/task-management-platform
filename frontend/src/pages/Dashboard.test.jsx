import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from './Dashboard';
import api from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('Dashboard page', () => {
  beforeEach(() => {
    api.get.mockReset();
    api.post.mockReset();
    api.put.mockReset();
    api.delete.mockReset();
  });

  it('renders tasks from the API', async () => {
    api.get.mockResolvedValueOnce({ data: [{ id: 1, title: 'Task 1', description: 'Do this', status: 'TODO' }] });

    render(<Dashboard />);

    await waitFor(() => {
      expect(screen.getByText(/task 1/i)).toBeInTheDocument();
    });
  });

  it('submits a new task and refreshes the list', async () => {
    api.get.mockResolvedValueOnce({ data: [] });
    api.post.mockResolvedValueOnce({ data: { id: 2, title: 'New task', description: 'New item', status: 'TODO' } });
    api.get.mockResolvedValueOnce({ data: [{ id: 2, title: 'New task', description: 'New item', status: 'TODO' }] });

    render(<Dashboard />);

    await userEvent.type(screen.getByLabelText(/task title/i), 'New task');
    await userEvent.type(screen.getByLabelText(/description/i), 'New item');
    await userEvent.click(screen.getByRole('button', { name: /create task/i }));

    await waitFor(() => {
      expect(screen.getByText(/new task/i)).toBeInTheDocument();
    });
  });
});
