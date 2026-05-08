import { render, screen, fireEvent } from '@testing-library/react';
import Dummy from './Dummy';
import { describe, it, expect, vi } from 'vitest';

describe('Dummy Component', () => {
  it('renders the title', () => {
    render(<Dummy title="Hello Vitest" />);
    expect(screen.getByText('Hello Vitest')).toBeInTheDocument();
  });

  it('handles click', () => {
    const consoleSpy = vi.spyOn(console, 'log');
    render(<Dummy title="Test Click" />);
    fireEvent.click(screen.getByText('Click me'));
    expect(consoleSpy).toHaveBeenCalledWith('clicked');
  });
});
