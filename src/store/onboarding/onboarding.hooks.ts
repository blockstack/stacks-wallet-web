import { useAtom } from 'jotai';
import { useAtomValue, useUpdateAtom } from 'jotai/utils';
import {
  authRequestState,
  hasAllowedDiagnosticsState,
  magicRecoveryCodePasswordState,
  magicRecoveryCodeState,
  secretKeyState,
  seedInputErrorState,
  seedInputState,
  userHasAllowedDiagnosticsKey,
} from './onboarding';

export { userHasAllowedDiagnosticsKey };

export function useAuthRequest() {
  return useAtomValue(authRequestState);
}

export function useUpdateAuthRequest() {
  return useUpdateAtom(authRequestState);
}

export function useSeedInputState() {
  return useAtom(seedInputState);
}

export function useSeedInputErrorState() {
  return useAtom(seedInputErrorState);
}

export function useMagicRecoveryCodeState() {
  return useAtom(magicRecoveryCodeState);
}

export function useMagicRecoveryCodeValue() {
  return useAtomValue(magicRecoveryCodeState);
}

export function useMagicRecoveryCodePasswordState() {
  return useAtom(magicRecoveryCodePasswordState);
}

export function useSecretKeyState() {
  return useAtomValue(secretKeyState);
}

export function useHasAllowedDiagnostics() {
  return useAtom(hasAllowedDiagnosticsState);
}
