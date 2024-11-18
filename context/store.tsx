"use client"
import { createContext, Dispatch, SetStateAction, useState } from "react"

interface ContextProps {
    loadingFullScreen: boolean;
    setLoadingFullScreen: Dispatch<SetStateAction<boolean>>,

}

const GlobalContext = createContext<ContextProps>({
    loadingFullScreen: false,
    setLoadingFullScreen: () => { },
});

export default GlobalContext;

export const GlobalContextProvider = ({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) => {
    const [loadingFullScreen, setLoadingFullScreen] = useState(false);

    return <GlobalContext.Provider value={{ loadingFullScreen, setLoadingFullScreen }} >
        {children}
    </GlobalContext.Provider>
}