import { createContext, ReactNode, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

interface AppContextType {
    doctors: [any];
    currencySymbol: string,
    token: string,
    setToken: string
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

const AppContextProvider = (props: { children: ReactNode }) => {
    const currencySymbol = '$'
    const backendUrl = import.meta.env.VITE_BACKEND_URL
    const [doctors, setDoctors] = useState<[]>([])
    const [token, setToken] = useState(localStorage.getItem('token') ? localStorage.getItem('token') : false)
    const [userData, setUserData] = useState(false)


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

    const loadUserProfileData = async () => {
        try {
            const {data} = await axios.get(backendUrl + '/api/user/get-profile', {headers: {token}})
            if(data.success) {
                setUserData(data.userData)
            }else {
                toast.error(data.message)
            }
        }  catch (error:any) {
            console.log(error)
            toast.error(error.message)
        }
    }

    const value = {
        doctors,
        currencySymbol,
        token, setToken,
        backendUrl,
        userData,
        setUserData,
        loadUserProfileData
    }

    useEffect(() => {
        getAllDoctorsData()
    }, [])

    useEffect(() => {
        if(token){
            loadUserProfileData()
        } else{
            setUserData(false)
        }
    }, [token])

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider;