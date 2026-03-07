import { useState, useEffect } from "react"

export function useTypewriter(text: string, speed: number = 30) {
    const [displayedText, setDisplayedText] = useState("")
    const [isTyping, setIsTyping] = useState(true)

    useEffect(() => {
        setDisplayedText("")
        setIsTyping(true)

        let i = 0
        const timeoutIds: NodeJS.Timeout[] = []

        const typeChar = () => {
            if (i < text.length) {
                setDisplayedText(text.substring(0, i + 1))
                i++
                const id = setTimeout(typeChar, speed)
                timeoutIds.push(id)
            } else {
                setIsTyping(false)
            }
        }

        // Start typing
        typeChar()

        return () => {
            timeoutIds.forEach(clearTimeout)
        }
    }, [text, speed])

    return { displayedText, isTyping }
}
