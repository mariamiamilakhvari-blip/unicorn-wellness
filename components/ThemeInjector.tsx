'use client'

import { useEffect } from 'react'

export function ThemeInjector({ css }: { css: string }) {
  useEffect(() => {
    if (!css) return
    const style = document.createElement('style')
    style.id = 'unicorn-theme'
    style.innerHTML = css
    document.head.appendChild(style)
    return () => { document.getElementById('unicorn-theme')?.remove() }
  }, [css])
  return null
}
