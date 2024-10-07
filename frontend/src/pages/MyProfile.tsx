import React, { useState } from 'react'
import { assets } from '../assets/assets'

export const MyProfile = () => {
  const [userData, setUserData] = useState({
    name:"Edward Vincent",
    image: assets.profile_pic,
    email: 'richardjameswap@gmail.com',
    phone: '+1 32566777886',
    address: {
      line1: "57th Cross, Richmond",
      line2: "Circle, Church Road, London"
    },
    gender: 'Male',
    dob: '2002-03-21'
  })

  const [isEdit, setIsEdit] = useState(false)
  return (
    <div>
      <img src={userData.image} alt="" />
      {
        isEdit ? <input value={userData.name} type="text" onChange={(e) => setUserData(prev => ({...prev, name: e.target.value}))} />
        : <p>{userData.name}</p>
      }

      <hr />
      <div>
        <p>CONTACT INFORMATION</p>
        <div></div>
      </div>
    </div>
  )
}
