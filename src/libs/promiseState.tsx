import { ReactNode, useContext, useId, useRef, useState, createContext, Suspense } from "react"

type ContextType = { values: { [key: string]: unknown; }, promises: Promise<any>[], finished: boolean }

const context = createContext<ContextType>(undefined as never);

export const usePromiseState = <T,>(p: Promise<T> | (() => Promise<T>)) => {
    const c = useContext(context)
    const id = useId()
    const [state, setState] = useState<Promise<T>>(() => {
        if (typeof window === "undefined") {
            const promise = typeof p === "function" ? p() : p;
            c.promises.push(promise);
            promise.then((v) => {
                c.values[id] = v;
            })
            return promise
        }
        return c.values[id] ?
            Promise.resolve(c.values[id] as T) :
            typeof p === "function" ? p() : p
    });
    return [state, setState] as const
}

const DataRender = () => {
    const c = useContext(context)
    if (!c.finished)
        throw Promise.all(c.promises).then((v) => { c.finished = true; return v })
    return <script
        id="__NEXT_DATA_PROMISE__"
        type="application/json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(c.values) }}
    />;
}

export const PromiseProvider = ({ children }: { children: ReactNode }) => {
    const refContext = useRef({ values: {}, promises: [], finished: false });
    if (typeof window !== "undefined" && !refContext.current.finished) {
        const node = document.getElementById("__NEXT_DATA_PROMISE__");
        if (node)
            refContext.current.values = JSON.parse(node.innerHTML)
        refContext.current.finished = true;
    }
    return (
        <context.Provider value={refContext.current}>
            {children}
            <Suspense>
                <DataRender />
            </Suspense>
        </context.Provider >)
}