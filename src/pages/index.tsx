import { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import { use } from "../libs/use";

export interface Weather {
    publishingOffice: string;
    reportDatetime: Date;
    targetArea: string;
    headlineText: string;
    text: string;
}

const fetchWeather = (id: number) =>
    fetch(
        `https://www.jma.go.jp/bosai/forecast/data/overview_forecast/${id}.json`
    ).then((r) => r.json())


const WeatherView = ({ weather: p }: { weather: Promise<Weather> }) => {
    const weather = use(p)
    return <div>
        <h1>{weather.targetArea}</h1>
        <div>{new Date(weather.reportDatetime).toLocaleString()}</div>
        <div>{weather.headlineText}</div>
        <pre>{weather.text}</pre>
    </div>
}

const Page = () => {
    if (typeof window === "undefined")
        return null;
    const [weather, setWeather] = useState(() => fetchWeather(130000))
    return (
        <div>
            <div><a href="https://github.com/SoraKumo001/next-use">Source Code</a></div>
            <hr />
            <div>
                <button onClick={() => setWeather(fetchWeather(130000))}>東京</button>
                <button onClick={() => setWeather(fetchWeather(120000))}>千葉</button>
                <button onClick={() => setWeather(fetchWeather(140000))}>神奈川</button>
            </div>
            <Suspense fallback={"読み込み中"}>
                <WeatherView weather={weather} />
            </Suspense>
        </div>
    )
}

//　Next.jsでSSRを切る
export default dynamic(() => Promise.resolve(Page), { ssr: false });
