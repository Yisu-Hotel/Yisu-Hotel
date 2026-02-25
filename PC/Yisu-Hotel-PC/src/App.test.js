import { render, screen } from '@testing-library/react';
import App from './App';

test('renders login page headline', () => {
  render(<App />);
  const title = screen.getByText('欢迎您！');
  expect(title).toBeInTheDocument();
});
