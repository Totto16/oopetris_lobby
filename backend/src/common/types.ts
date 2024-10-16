export type ErrorOr<T, ET = string> =
    | [data: null, error: ET]
    | [data: T, error: null];

export function error<ET = string>(error: ET): ErrorOr<any, ET> {
    return [null, error];
}

export function success<T>(data: T): ErrorOr<T, any> {
    return [data, null];
}
