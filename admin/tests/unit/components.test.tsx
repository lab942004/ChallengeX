import { describe, expect, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Button, Input } from '../../src/components/common/FormControls';
import { DataTable } from '../../src/components/common/DataTable';
import { ConfirmDialog } from '../../src/components/common/Modal';

describe('admin Button', () => {
  it('renders and clicks', () => {
    let clicked = false;
    render(<Button onClick={() => (clicked = true)}>Save</Button>);
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(clicked).toBe(true);
  });

  it('stays inert while loading', () => {
    let clicked = false;
    render(
      <Button loading onClick={() => (clicked = true)}>
        Save
      </Button>,
    );
    fireEvent.click(screen.getByRole('button', { name: /save/i }));
    expect(clicked).toBe(false);
  });
});

describe('admin Input', () => {
  it('associates label and input', () => {
    render(<Input label="Email" name="email" />);
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });
});

describe('DataTable', () => {
  interface Row {
    id: string;
    name: string;
  }
  const columns = [{ header: 'Name', cell: (r: Row) => r.name }];

  it('renders rows', () => {
    render(
      <DataTable
        columns={columns}
        rows={[{ id: '1', name: 'Ada' }]}
        rowKey={(r) => r.id}
      />,
    );
    expect(screen.getByText('Ada')).toBeInTheDocument();
  });

  it('shows empty state', () => {
    render(<DataTable columns={columns} rows={[]} rowKey={(r) => r.id} empty="Nothing here." />);
    expect(screen.getByText('Nothing here.')).toBeInTheDocument();
  });

  it('invokes onRowClick', () => {
    let clicked: Row | null = null;
    render(
      <MemoryRouter>
        <DataTable
          columns={columns}
          rows={[{ id: '1', name: 'Ada' }]}
          rowKey={(r) => r.id}
          onRowClick={(r) => (clicked = r)}
        />
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByText('Ada'));
    expect(clicked).not.toBeNull();
  });
});

describe('ConfirmDialog', () => {
  it('confirms destructive actions', () => {
    let confirmed = false;
    render(
      <ConfirmDialog
        open
        title="Delete user"
        message="Are you sure?"
        onConfirm={() => (confirmed = true)}
        onCancel={() => undefined}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    expect(confirmed).toBe(true);
  });
});
