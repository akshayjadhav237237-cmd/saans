/** Generic Result type for predictable error handling across architectural boundaries. */
export type Result<T, E> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: E };

/** Creates an Ok result variant. */
export function ok<T, E = never>(value: T): Result<T, E> {
  return { ok: true, value };
}

/** Creates an Err result variant. */
export function err<T = never, E = string>(error: E): Result<T, E> {
  return { ok: false, error };
}

/** Maps the successful value of a Result with a transformation function. */
export function map<T, U, E>(result: Result<T, E>, fn: (val: T) => U): Result<U, E> {
  if (result.ok) {
    return { ok: true, value: fn(result.value) };
  }
  return result;
}
