"use client";
import "@/cssFiles/homeanimations.css";
import axios from "axios";
import toast from "react-hot-toast";


export default function LogoutButton() {
  const onLogout = ()=>{
    try {
      axios.get('/api/users/logout').then(()=>{
        toast.success('logout successfully')
      })
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div>
      <button onClick={e=>{onLogout()}} >logout</button>
    </div>
  );
}
