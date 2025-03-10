'use client'
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';

function Page() {
  
  const [logins , setLogins] = useState([]);
  const [myToken,setMyToken] = useState();
  
  const getsessions = async()=>{
    try {
    await axios.get('/api/users/getsessions').then((res)=>{
      setLogins(res.data.sessions)
      setMyToken(res.data.yourtoken)
  })
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(()=>{
getsessions();
  },[])


  const logoutSession = async (token)=>{
   await axios.post('/api/users/logoutothers',{token}).then((res)=>{
      toast.success("successfully logged out")
      location.reload();
    })
  }



  return (
    <div>{logins && <>
    
    {logins.map((login)=>{

        return <div key={login._id} className=''>

        <p> {login.token} </p> 
        <button  onClick={(e)=>{e.preventDefault();logoutSession(login.token)}} > Logout {login.token == myToken ? "this" : "other"} Session </button>
        </div> 

    })}
    
    
    </>}</div>
  )
}

export default Page