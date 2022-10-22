import { useRef } from "react"

const PromiseState = <T,>(promise: Promise<T>) => {
    let state: [false, undefined] | [true, T] = [false, undefined]
    promise.then((v) => state = [true, v])
    return () => state as [false, undefined] | [true, T]
}

const promiseMap = new Map<Promise<any>, ReturnType<typeof PromiseState<any>>>()

export const use = <T,>(p: Promise<T>) => {
    const ref = useRef([p, false, undefined]);
    if (ref.current[0] !== p)
        ref.current = [p, false, undefined]
    else if (ref.current[1])
        return ref.current[2] as T;
    !promiseMap.has(p) && promiseMap.set(p, PromiseState(p))
    const promiseState = promiseMap.get(p)!
    const state = promiseState()
    if (!state[0])
        throw p;
    promiseMap.delete(p)
    ref.current = [p, ...state]
    return state[1] as T;
}