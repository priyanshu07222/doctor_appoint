import { createContext, ReactNode, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface AppContextType {
    doctors: [any];
    currencySymbol: string
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const AppContextProvider = (props: { children: ReactNode }) => {
    const currencySymbol = '$'
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [doctors, setDoctors] = useState<[]>([])

    const value = {
        doctors,
        currencySymbol
    }

    const getAllDoctorsData = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/doctor/list')
            if(data.success){
                setDoctors(data.doctors)
            }else{
                toast.error(data.message)
            }
        } catch (error:any) {
            console.log(error)
            toast.error(error.message)
        }
    }

    useEffect(() => {
        getAllDoctorsData()
    }, [])

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider;