const PromiseState = <T,>(promise: Promise<T>) => {
    let state: [false, undefined] | [true, T] = [false, undefined]
    promise.then((v) => state = [true, v])
    return () => state as [false, undefined] | [true, T]
}
//これを解放する術がないのでリソースがリーク
const promiseMap = new Map<Promise<any>, ReturnType<typeof PromiseState<any>>>()
export const use = <T,>(p: Promise<T>) => {
    !promiseMap.has(p) && promiseMap.set(p, PromiseState(p))
    const promiseState = promiseMap.get(p)!
    const state = promiseState()
    if (!state[0])
        throw p;
    return state[1] as T;
}