import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import { toast } from 'react-toastify'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'


export const MyAppointments = () => {
  const context = useContext(AppContext)
  const [appointments, setAppointments] = useState([])
  const navigate = useNavigate()
  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  

  const slotDateFormat = (slotDate:string) => {
    const dateArray = slotDate.split('_')
    return dateArray[0] + " " + months[Number(dateArray[1])] + " " + dateArray[2]
  }

  if (!context) {
    throw new Error("contxt not found")
  }

  const { backendUrl, token, getAllDoctorsData } = context;

  const getUserAppointments = async () => {
    try {
      console.log("muss token", token)
      const { data } = await axios.get(backendUrl + '/api/user/appointments', { headers: { token } })
      if (data.success) {
        setAppointments(data.appointments.reverse())
      } else {
        toast.error(data.message)
      }
    } catch (error: any) {
      console.log(error)
      toast.error(error.message)
    }
  }

  const cancelAppointment = async (appointmentId:string) => {
    try {
      console.log(appointmentId)
      const { data } = await axios.post(backendUrl + '/api/user/cancel-appointment', { appointmentId }, { headers: { token } })
      if (data.success) {
        toast.success(data.message)
        getUserAppointments()
        getAllDoctorsData()
      } else {
        toast.error(data.message)
      }
    } catch (error: any) {
      console.log(error)
      toast.error(error.message)
    }
  }


  const initPay = (order:any) => {
    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      amount: order.amount,
      currency: order.currency,
      name:"Appointment Payment",
      description:"Appointment Payment",
      order_id: order.id,
      receipt: order.receipt,
      handler: async(response: Response) => {
        console.log(response);
        try {
          const {data} = await axios.post(backendUrl + '/api/user/verifyRazorpay', response, {headers:{token}})
          if(data.success){
            getUserAppointments()
            navigate('/my-appointment')
          }
        } catch (error:any) {
          console.log(error)
          toast.error(error.message)
        }
        
      }
    }

    const rzp = new (window as any).Razorpay(options)
    rzp.open()
  }

  const appointmentRazorpay = async (appointmentId: string) => {
    try {
      const {data} = await axios.post(backendUrl + '/api/user/payment-razorpay', {appointmentId}, {headers:{token}})

      if(data.success){
        initPay(data.order)
        toast.success(data.success)
      }else{
        toast.error(data.message)
      }
    } catch (error:any) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    if (token) {
      getUserAppointments()
      console.log("appointments", appointments)
    }
  }, [token])
  return ( appointments &&
    <div>
      <p className='pb-3 mt-12 font-medium text-zinc-700 border-b'>My Appointment</p>
      <div>
        {
          appointments.map((item:{
            _id:string,
            docData: {
              _id: string;
              name: string;
              image: string;
              speciality: string;
              degree: string;
              experience: string;
              about: string;
              fees: number;
              address: {
                line1: string;
                line2: string;
              };
              slots_booked: [any]
            }
            cancelled: boolean,
            payment: boolean, 
            slotTime:string,
            slotDate:string
          }, index) => (
            <div className='grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b' key={index}>
              <div>
                <img className='w-32 bg-indigo-50' src={item.docData.image} alt="" />
                {/* {item.} */}
              </div>
              <div className='flex-1 text-sm text-zinc-600'>
                <p className='text-neutral-800 font-semibold'>{item.docData.name}</p>
                <p>{item.docData.speciality}</p>
                <p className='text-zinc-700 font-medium mt-1'>Address:</p>
                <p className='text-xs'>{item.docData.address.line1}</p>
                <p className='text-xs'>{item.docData.address.line2}</p>
                <p className='text-xs mt-1'><span className='text-sm text-neutral-700 font-medium'>Date & Time:</span><span className=''>{slotDateFormat(item.slotDate)} | {item.slotTime}</span></p>
              </div>
              <div></div>
              <div>
                {!item.cancelled && item.payment && <button className='sm:min-w-48 py-2 border rounded text-slate-500 bg-indigo-50'>Paid</button>}
                {!item.cancelled && !item.payment && <button onClick={() => {appointmentRazorpay(item._id)}} className=' text-xs text-stone-500 text-center sm:min-w-48 py-2 border hover:bg-primary hover:text-white transition-all duration-300'>Pay Online</button>}
                {!item.cancelled && <button onClick={() => cancelAppointment(item._id)} className=' text-xs text-stone-500 text-center sm:min-w-48 py-2 border hover:bg-red-600 hover:text-white transition-all duration-300'>Cancel Appointment</button>}
                {item.cancelled && <button className='sm:min-w-48 py-2 border border-red-500 rounded text-red-500'>Appointment cancelled</button>}
              </div>
            </div>

          ))
        }
      </div>
    </div>
  )
}


