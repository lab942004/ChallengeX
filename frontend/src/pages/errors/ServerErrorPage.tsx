import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { useDocumentTitle } from '../../hooks';
import { ErrorState } from '../../components/common/ErrorState';
import { Button } from '../../components/ui/Button';

export function ServerErrorPage() {
  useDocumentTitle('Realm Failure');
  const navigate = useNavigate();
  return (
    <ErrorState
      kind="500"
      action={
        <Button onClick={() => navigate(ROUTES.gate)}>Return to Gate</Button>
      }
    />
  );
}
