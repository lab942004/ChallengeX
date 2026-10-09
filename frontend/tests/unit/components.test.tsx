import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Button } from '../../src/components/ui/Button';
import { ErrorState } from '../../src/components/common/ErrorState';
import { RealmBackground } from '../../src/components/common/RealmBackground';

describe('RealmBackground (layered artwork)', () => {
  it('renders the artwork as a decorative, non-interactive layer', () => {
    const { container } = render(<RealmBackground variant="app" />);
    const root = container.firstElementChild as HTMLElement;

    // Decorative contract: aria-hidden + pointer-events: none (Tailwind class,
    // asserted via className because CSS is not loaded in unit tests).
    expect(root).toHaveAttribute('aria-hidden');
    expect(root.className).toContain('pointer-events-none');
    expect(root.className).toContain('fixed');

    // The supplied artwork is referenced with a valid path.
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('src', '/assets/all-pages-background.png');
    expect(img).toHaveAttribute('alt', '');
  });

  it('drops the artwork layer when the asset fails to load (no broken images)', () => {
    const { container } = render(<RealmBackground variant="gate" />);
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('src', '/assets/entry-gate.webp');

    fireEvent.error(img!);
    expect(container.querySelector('img')).toBeNull();

    // The near-black foundation remains even without artwork.
    expect(container.firstElementChild).toBeInTheDocument();
  });
});

describe('Button', () => {
  it('renders its label', () => {
    render(<Button>Enter the Realm</Button>);
    expect(screen.getByRole('button', { name: /enter the realm/i })).toBeInTheDocument();
  });

  it('fires onClick', () => {
    let clicked = false;
    render(<Button onClick={() => (clicked = true)}>Press</Button>);
    fireEvent.click(screen.getByRole('button', { name: /press/i }));
    expect(clicked).toBe(true);
  });

  it('does not fire when disabled', () => {
    let clicked = false;
    render(
      <Button disabled onClick={() => (clicked = true)}>
        Press
      </Button>,
    );
    fireEvent.click(screen.getByRole('button', { name: /press/i }));
    expect(clicked).toBe(false);
  });
});

describe('ErrorState (themed error handling)', () => {
  it('renders the themed 404 copy', () => {
    render(
      <BrowserRouter>
        <ErrorState kind="404" />
      </BrowserRouter>,
    );
    expect(screen.getByText('THE PATH HAS VANISHED')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /return to gate/i })).toBeInTheDocument();
  });

  it('renders the network error copy', () => {
    render(
      <BrowserRouter>
        <ErrorState kind="network" />
      </BrowserRouter>,
    );
    expect(
      screen.getByText('THE CONNECTION TO THE REALM WAS LOST'),
    ).toBeInTheDocument();
  });

  it('never renders stack traces or technical dumps', () => {
    const { container } = render(
      <BrowserRouter>
        <ErrorState kind="500" />
      </BrowserRouter>,
    );
    expect(container.textContent).not.toMatch(/at\s+\w+\s*\(/); // no stack frames
    expect(container.textContent).not.toMatch(/Error:/);
  });
});
