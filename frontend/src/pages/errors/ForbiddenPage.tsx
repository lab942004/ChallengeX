import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants';
import { useDocumentTitle } from '../../hooks';
import { ErrorState } from '../../components/common/ErrorState';

export function ForbiddenPage() {
  useDocumentTitle('Access Denied');
  return (
    <ErrorState
      kind="401"
      action={
        <Link to={ROUTES.login} className="btn-primary">
          Login
        </Link>
      }
    />
  );
}
