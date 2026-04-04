import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/** Ouvre la modale « ADE / formulaire » une fois après inscription (état de navigation). */
export function usePostRegisterWelcomeModal() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const handled = useRef(false);

  useEffect(() => {
    if (handled.current) return;

    const params = new URLSearchParams(location.search);
    if (params.get('welcome') === '1') {
      handled.current = true;
      setOpen(true);
      params.delete('welcome');
      const q = params.toString();
      navigate(
        { pathname: location.pathname, search: q ? `?${q}` : '', hash: location.hash },
        { replace: true }
      );
      return;
    }

    const st = location.state as { showWelcomeChoice?: boolean } | undefined;
    if (st?.showWelcomeChoice) {
      handled.current = true;
      setOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.pathname, location.search, location.state, location.hash, navigate]);

  return { open, onClose: () => setOpen(false) };
}
