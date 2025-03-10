"use client"

import React, { useRef, useState } from 'react'

function Page() {

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const handleFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setSelectedFile(file);
  };

  const UploadToCloudinary = async() =>{
    try {
        if (selectedFile?.type === 'image/png' || selectedFile?.type === 'image/jpeg' || selectedFile?.type === 'image/jpg'){
            
          const formdata = new FormData();
          formdata.append('file', selectedFile)
          formdata.append('upload_preset','cvrhackthon')
          const uploadResponse = await fetch(
            "https://api.cloudinary.com/v1_1/dvudkkxl4/image/upload",
            {
              method: "POST",
              body: formdata,
            }
          );
          const uploadedImageData = await uploadResponse.json();
          const imageUrl = uploadedImageData.url;
          return imageUrl
        }
        else{
            console.log('Please upload only images')
        }
    } catch (error) {
        console.log(error);
    }

  } 


  return (
    
    <>
   <input type="file" onChange={handleFileInput} />
   <button onClick={(e)=>{e.preventDefault();UploadToCloudinary()}}>Add File</button>
    </>
  )
}

export default Page