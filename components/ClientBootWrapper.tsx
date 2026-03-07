"use client"

import React, { useState, useEffect } from "react"
import BootSequence from "./BootSequence"

export function ClientBootWrapper({ children }: { children: React.ReactNode }) {
    const [booted, setBooted] = useState(false)

    useEffect(() => {
        // Check session storage to only boot once per session
        if (sessionStorage.getItem("zvision_booted") === "true") {
            setBooted(true)
        }
    }, [])

    const handleBootComplete = () => {
        sessionStorage.setItem("zvision_booted", "true")
        setBooted(true)
    }

    return (
        <>
            {!booted && <BootSequence onComplete={handleBootComplete} />}
            {booted && children}
        </>
    )
}
