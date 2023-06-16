import { useEffect } from 'react';

import { isFunction } from '@shared/utils';

export function useOnMount(effect: () => void | Promise<void> | (() => void)) {
  useEffect(() => {
    const fn = effect();
    return () => (isFunction(fn) ? fn() : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
