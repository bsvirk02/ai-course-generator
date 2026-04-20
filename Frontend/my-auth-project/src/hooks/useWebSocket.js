"use client"

import { useState, useEffect, useRef } from "react"

const useWebSocket = (url, onMessage) => {
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState(null)
  const wsRef = useRef(null)

  useEffect(() => {
    if (!url) return;
    const ws = new WebSocket(url)
    wsRef.current = ws

    ws.onopen = () => {
      console.log(`WebSocket connected to ${url}`)
      setIsConnected(true)
      setError(null)
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onMessage(data)
      } catch (err) {
        console.error("Error parsing WebSocket message:", err)
      }
    }

    ws.onerror = (event) => {
      console.error("WebSocket error:", event)
      setError("Failed to connect to WebSocket server")
    }

    ws.onclose = () => {
      console.log("WebSocket disconnected")
      setIsConnected(false)
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [url, onMessage])

  const sendMessage = (data) => {
    if (wsRef.current && isConnected) {
      wsRef.current.send(JSON.stringify(data))
    } else {
      console.error("WebSocket is not connected")
    }
  }

  return { isConnected, error, sendMessage }
}

export default useWebSocket
