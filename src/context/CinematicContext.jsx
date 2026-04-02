import React, { createContext, useContext, useState, useCallback } from 'react'

const CinematicContext = createContext()

export function CinematicProvider({ children }) {
  const [activeCinematic, setActiveCinematic] = useState(null)
  const [cinematicData, setCinematicData] = useState(null)

  const triggerCinematic = useCallback((type, data = {}) => {
    setCinematicData(data)
    setActiveCinematic(type)
  }, [])

  const closeCinematic = useCallback(() => {
    setActiveCinematic(null)
    setCinematicData(null)
  }, [])

  return (
    <CinematicContext.Provider value={{
      activeCinematic,
      cinematicData,
      triggerCinematic,
      closeCinematic,
    }}>
      {children}
    </CinematicContext.Provider>
  )
}

export function useCinematic() {
  const context = useContext(CinematicContext)
  if (!context) {
    throw new Error('useCinematic must be used within a CinematicProvider')
  }
  return context
}
