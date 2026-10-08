import { useDocumentTitle } from '../../hooks';
import { ErrorState } from '../../components/common/ErrorState';

export function NotFoundPage() {
  useDocumentTitle('Path Vanished');
  return <ErrorState kind="404" />;
}
