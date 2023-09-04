import { onButtonClick } from "@webng/ui";
import { useState } from "react";

const SpinIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        className="w-6 h-6"
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
        />
    </svg>
);

const UI = () => {
    const [count, setCount] = useState(0);

    return (
        <div className="grid w-full h-full items-center justify-center">
            <div className="grid gap-4 text-center justify-center">
                <h1 className="text-white text-4xl font-bold">{count}</h1>
                <div>
                    <button
                        id="spin"
                        onClick={(event) => {
                            setCount(count + 1);
                            onButtonClick(event.currentTarget);
                        }}
                        className="bg-yellow-400 hover:bg-yellow-300 active:bg-yellow-500 transition-colors p-2 rounded-full hover:shadow active:shadow-none text-yellow-900"
                    >
                        <SpinIcon />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UI;
