import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the main app navigation', () => {
  render(<App />);
  expect(screen.getByText(/3D Printing Manager/i)).toBeInTheDocument();
  expect(screen.getByRole('link', { name: /Orders/i })).toBeInTheDocument();
});
