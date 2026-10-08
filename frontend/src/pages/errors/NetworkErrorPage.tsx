import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks';
import { ErrorState } from '../../components/common/ErrorState';
import { Button } from '../../components/ui/Button';

export function NetworkErrorPage() {
  useDocumentTitle('Connection Lost');
  const navigate = useNavigate();
  return (
    <ErrorState
      kind="network"
      action={
        <Button onClick={() => navigate(0)}>Try Again</Button>
      }
    />
  );
}
