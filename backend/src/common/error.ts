type Error<ET> = [data: null, error: ET];

type Result<T> = [data: T, error: null];

export type ErrorOr<T, ET = string> = Result<T> | Error<ET>;

export function error<ET = string>(error: ET): ErrorOr<any, ET> {
    return [null, error];
}

export function success<T>(data: T): ErrorOr<T, any> {
    return [data, null];
}

export function isError<T, ET = string>(
    result: ErrorOr<T, ET>,
): result is Error<ET> {
    return result[0] === null;
}

export function isSuccess<T, ET = string>(
    result: ErrorOr<T, ET>,
): result is Result<T> {
    return result[1] === null;
}

export function getError<ET = string>(data: Error<ET>): ET {
    return data[1];
}

export function getResult<T>(data: Result<T>): T {
    return data[0];
}
