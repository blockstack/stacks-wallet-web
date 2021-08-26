import * as yup from 'yup';

const MUST_BE_INTEGER = 'Must be an integer';
export function nonceSchema() {
  return yup.number().required().integer(MUST_BE_INTEGER).min(0).typeError(MUST_BE_INTEGER);
}
