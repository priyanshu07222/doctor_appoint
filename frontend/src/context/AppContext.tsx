import { createContext, ReactNode, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

// **Changes: Updated types for doctors and setToken**
interface AppContextType {
    doctors: any[];                     // Changed from [any] to any[] (array type)
    currencySymbol: string;
    token: string | boolean;            // Adjusted the type to handle string or boolean
    setToken: (value: string | boolean) => void;  // Changed to a function type
    userData: any | boolean;            // Added userData to the context
    setUserData: (value: any | boolean) => void;  // Added setUserData to the context
    loadUserProfileData: () => Promise<void>;     // Added function types
    getAllDoctorsData: () => Promise<void>;       // Added function types
    backendUrl: string
}

export const AppContext = createContext<AppContextType>({} as AppContextType);  // **Change: Added type assertion**

const AppContextProvider = (props: { children: ReactNode }) => {
    const currencySymbol = '$';
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    const [doctors, setDoctors] = useState<any[]>([]);  // **Change: Typed the doctors array correctly**
    const [token, setToken] = useState<string | boolean>(localStorage.getItem('token') ? localStorage.getItem('token') as string : false);  // **Change: Token type string | boolean**
    const [userData, setUserData] = useState<any | boolean>(false);  // **Change: Initialized userData as boolean | any**

    const getAllDoctorsData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/doctor/list');
            if (data.success) {
                setDoctors(data.doctors);
            } else {
                toast.error(data.message);
            }
        } catch (error: any) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const loadUserProfileData = async () => {
        try {
            const { data } = await axios.get(backendUrl + '/api/user/get-profile', { headers: { token } });
            if (data.success) {
                setUserData(data.userData);
            } else {
                toast.error(data.message);
            }
        } catch (error: any) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const value = {
        doctors,
        currencySymbol,
        token, setToken,           // **Change: Correct type for token and setToken**
        userData, setUserData,     // **Change: Added userData and setUserData**
        backendUrl,
        loadUserProfileData,
        getAllDoctorsData,
    };

    useEffect(() => {
        getAllDoctorsData();
    }, []);

    useEffect(() => {
        if (token) {
            loadUserProfileData();
        } else {
            setUserData(false);
        }
    }, [token]);

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;
