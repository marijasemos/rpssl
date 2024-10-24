import { useCallback, useEffect, useState } from "react";

async function sendHttpRequest(url, config) {
    const finalConfig = {
        ...config,
    };

    const response = await fetch(url, finalConfig);
    const resData = await response.json();

    if (!response.ok) {
        throw new Error(resData.message || 'Something went wrong, failed to send request!');
    }
    return resData;
}

export default function useHttp(initialUrl, initialConfig = {}, initialData = null) {
    const [data, setData] = useState(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [url, setUrl] = useState(initialUrl);
    const [config, setConfig] = useState(initialConfig);

    const sendRequest = useCallback(
        async function sendRequest(overrideUrl, overrideConfig) {
            setIsLoading(true);
            try {
                const finalUrl = overrideUrl || url;
                const finalConfig = overrideConfig ? { ...config, ...overrideConfig } : config;
                const resData = await sendHttpRequest(finalUrl, finalConfig);
                setData(resData);
            } catch (error) {
                setError(error.message || 'Something went wrong!');
            }
            setIsLoading(false);
        }, [url, config]
    );

    useEffect(() => {
        if ((config.method === 'GET' || !config.method) && url) {
            sendRequest();
        }
    }, [url, config, sendRequest]);

    const setRequestDetails = (newUrl, newConfig = {}) => {
        setUrl(newUrl);
        setConfig((prevConfig) => ({ ...prevConfig, ...newConfig }));
    };

    return {
        data,
        isLoading,
        error,
        sendRequest,
        setRequestDetails,
    };
}
