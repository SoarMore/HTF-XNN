import "./globals.css"
import React from "react";
import Link from "next/link";


export default function RootLayout({
  children,
}:{
  children : React.ReactNode;
}){
  return(
    <html>
      <body>
        
        <main>{children}</main>
       
      </body>
    </html>
  )
}