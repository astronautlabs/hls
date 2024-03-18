/**
 * Provides strict casting to the specified type. This is different than using <> or "as T" casting in Typescript, as
 * those are actually type assertions. Casting using this function requires that the type completely confirms to T, as 
 * opposed to *is compatibly asserted* to be T.
 * 
 * @param value 
 * @returns 
 */
export function as<T>(value: T): T {
    return value;
}