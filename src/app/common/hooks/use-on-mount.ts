import { useEffect } from 'react';

import { isFunction } from '@shared/utils';

export function useOnMount(effect: () => void | (() => void) | Promise<unknown>) {
  useEffect(() => {
    const fn = effect();
    return () => (isFunction(fn) ? fn() : undefined);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
