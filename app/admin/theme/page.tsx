'use client'

import { useEffect, useState, useCallback } from 'react'
import { Save, RefreshCw, Palette, Type, Sliders } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'

const GOOGLE_FONTS = [
  'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
  'Raleway', 'Nunito', 'Source Sans 3', 'Playfair Display', 'Merriweather',
  'DM Sans', 'Outfit', 'Sora', 'Plus Jakarta Sans',
]

const DEFAULT_THEME: Record<string, string> = {
  '--primary': '262 83% 58%',
  '--primary-foreground': '0 0% 100%',
  '--secondary': '142 76% 36%',
  '--secondary-foreground': '0 0% 100%',
  '--background': '0 0% 100%',
  '--foreground': '270 15% 10%',
  '--muted': '270 20% 96%',
  '--muted-foreground': '270 10% 45%',
  '--accent': '270 20% 94%',
  '--border': '270 20% 90%',
  '--radius': '0.75rem',
  'font-family': 'Inter',
  'font-size-base': '16',
}

type HslValue = { h: number; s: number; l: number }

function parseHsl(hslStr: string): HslValue {
  const parts = hslStr.trim().split(/\s+/)
  return {
    h: parseFloat(parts[0] ?? '0'),
    s: parseFloat(parts[1] ?? '0'),
    l: parseFloat(parts[2] ?? '0'),
  }
}

function toHslString(v: HslValue) {
  return `${Math.round(v.h)} ${Math.round(v.s)}% ${Math.round(v.l)}%`
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100; l /= 100
  const k = (n: number) => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return '#' + [f(0), f(8), f(4)].map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('')
}

function hexToHsl(hex: string): HslValue {
  let r = 0, g = 0, b = 0
  if (hex.length === 7) {
    r = parseInt(hex.slice(1, 3), 16) / 255
    g = parseInt(hex.slice(3, 5), 16) / 255
    b = parseInt(hex.slice(5, 7), 16) / 255
  }
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
}

const COLOR_VARS = [
  { key: '--primary', label: 'Primary', desc: 'Buttons, links, accents' },
  { key: '--secondary', label: 'Secondary', desc: 'Secondary actions' },
  { key: '--background', label: 'Background', desc: 'Page background' },
  { key: '--foreground', label: 'Foreground', desc: 'Main text color' },
  { key: '--muted', label: 'Muted', desc: 'Subtle backgrounds' },
  { key: '--accent', label: 'Accent', desc: 'Hover highlights' },
  { key: '--border', label: 'Border', desc: 'Card and input borders' },
]

const BRAND_PALETTES = [
  { name: 'Velvet Purple', primary: '#73306b', secondary: '#22c55e' },
  { name: 'Ocean Blue', primary: '#2563eb', secondary: '#0891b2' },
  { name: 'Sunset Orange', primary: '#ea580c', secondary: '#f59e0b' },
  { name: 'Forest Green', primary: '#16a34a', secondary: '#0891b2' },
  { name: 'Rose Pink', primary: '#e11d48', secondary: '#d97706' },
  { name: 'Slate Dark', primary: '#475569', secondary: '#0ea5e9' },
]

export default function ThemePage() {
  const [config, setConfig] = useState<Record<string, string>>(DEFAULT_THEME)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/theme')
      .then(r => r.json())
      .then(d => {
        if (d.config && Object.keys(d.config).length > 0) {
          setConfig({ ...DEFAULT_THEME, ...d.config })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const updateColor = useCallback((key: string, hex: string) => {
    const hsl = hexToHsl(hex)
    setConfig(c => ({ ...c, [key]: toHslString(hsl) }))
  }, [])

  async function save() {
    setSaving(true)
    await fetch('/api/admin/theme', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates: config }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    // Apply to current page for preview
    applyTheme(config)
  }

  function applyTheme(cfg: Record<string, string>) {
    const root = document.documentElement
    Object.entries(cfg).forEach(([key, value]) => {
      if (key.startsWith('--')) root.style.setProperty(key, value)
    })
    if (cfg['font-family']) {
      root.style.setProperty('--font-family', cfg['font-family'])
      document.body.style.fontFamily = `'${cfg['font-family']}', sans-serif`
    }
    if (cfg['font-size-base']) {
      document.documentElement.style.fontSize = `${cfg['font-size-base']}px`
    }
  }

  function applyPalette(p: { primary: string; secondary: string }) {
    const primaryHsl = hexToHsl(p.primary)
    const secondaryHsl = hexToHsl(p.secondary)
    setConfig(c => ({
      ...c,
      '--primary': toHslString(primaryHsl),
      '--secondary': toHslString(secondaryHsl),
    }))
  }

  function resetToDefaults() {
    setConfig(DEFAULT_THEME)
  }

  if (loading) return <div className="p-8 text-gray-400">Loading theme settings…</div>

  const fontSize = parseInt(config['font-size-base'] || '16')
  const radiusNum = parseFloat(config['--radius'] || '0.75')

  return (
    <div className="p-8 space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Theme Editor</h1>
          <p className="text-gray-500 text-sm mt-1">Customize colors, fonts, and layout</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={resetToDefaults} className="border-gray-700 text-gray-300 hover:bg-gray-800">
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button size="sm" onClick={save} disabled={saving} className="bg-velvet-600 hover:bg-velvet-700 text-white">
            <Save className="h-4 w-4 mr-2" />
            {saved ? 'Saved!' : saving ? 'Saving…' : 'Save Theme'}
          </Button>
        </div>
      </div>

      {/* Quick palettes */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Palette className="h-4 w-4 text-velvet-400" />
            Quick Palettes
          </CardTitle>
          <CardDescription className="text-gray-500">One-click brand presets</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {BRAND_PALETTES.map(p => (
              <button
                key={p.name}
                onClick={() => applyPalette(p)}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-lg border border-gray-700 hover:border-gray-500 bg-gray-800 hover:bg-gray-750 transition-all text-sm text-gray-300"
              >
                <div className="flex">
                  <div className="w-4 h-4 rounded-l-full border border-gray-700" style={{ backgroundColor: p.primary }} />
                  <div className="w-4 h-4 rounded-r-full border border-gray-700" style={{ backgroundColor: p.secondary }} />
                </div>
                {p.name}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Colors */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Palette className="h-4 w-4 text-velvet-400" />
            Colors
          </CardTitle>
          <CardDescription className="text-gray-500">CSS variable overrides applied site-wide</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {COLOR_VARS.map(({ key, label, desc }) => {
              const hsl = parseHsl(config[key] || '0 0% 50%')
              const hex = hslToHex(hsl.h, hsl.s, hsl.l)
              return (
                <div key={key} className="flex items-center gap-4 p-3 rounded-xl bg-gray-800 border border-gray-700">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-lg border-2 border-gray-600 overflow-hidden">
                      <input
                        type="color"
                        value={hex}
                        onChange={e => updateColor(key, e.target.value)}
                        className="w-14 h-14 -mt-2 -ml-2 cursor-pointer border-none bg-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{label}</p>
                    <p className="text-xs text-gray-500">{desc}</p>
                    <p className="text-xs text-gray-600 mt-0.5 font-mono">{key}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-gray-400">{hex}</p>
                    <p className="text-xs text-gray-600 font-mono">{config[key]}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Type className="h-4 w-4 text-velvet-400" />
            Typography
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Font family */}
          <div>
            <Label className="text-gray-300 text-sm mb-3 block">Font Family</Label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
              {GOOGLE_FONTS.map(font => (
                <button
                  key={font}
                  onClick={() => setConfig(c => ({ ...c, 'font-family': font }))}
                  className={`px-3 py-2 rounded-lg text-xs border transition-all ${config['font-family'] === font
                    ? 'border-velvet-500 bg-velvet-600/20 text-velvet-300'
                    : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-500'
                  }`}
                  style={{ fontFamily: `'${font}', sans-serif` }}
                >
                  {font}
                </button>
              ))}
            </div>
          </div>

          {/* Font size */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-gray-300 text-sm">Base Font Size</Label>
              <span className="text-velvet-400 text-sm font-mono">{fontSize}px</span>
            </div>
            <Slider
              min={12}
              max={22}
              step={1}
              value={[fontSize]}
              onValueChange={([v]) => setConfig(c => ({ ...c, 'font-size-base': String(v) }))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>12px (small)</span>
              <span>22px (large)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Layout */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm flex items-center gap-2">
            <Sliders className="h-4 w-4 text-velvet-400" />
            Layout
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="text-gray-300 text-sm">Border Radius</Label>
              <span className="text-velvet-400 text-sm font-mono">{radiusNum.toFixed(2)}rem</span>
            </div>
            <Slider
              min={0}
              max={2}
              step={0.05}
              value={[radiusNum]}
              onValueChange={([v]) => setConfig(c => ({ ...c, '--radius': `${v.toFixed(2)}rem` }))}
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>0rem (sharp)</span>
              <span>2rem (round)</span>
            </div>
            {/* Preview */}
            <div className="mt-4 flex gap-3 items-center">
              <p className="text-xs text-gray-500">Preview:</p>
              <div className="w-16 h-8 bg-velvet-600" style={{ borderRadius: `${radiusNum}rem` }} />
              <div className="w-24 h-8 border-2 border-velvet-500" style={{ borderRadius: `${radiusNum}rem` }} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Live preview */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-white text-sm">Preview</CardTitle>
          <CardDescription className="text-gray-500">Sample of current settings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-5 rounded-xl border border-gray-700 bg-white space-y-3" style={{
            fontFamily: `'${config['font-family']}', sans-serif`,
            fontSize: `${fontSize}px`,
            borderRadius: config['--radius'],
          }}>
            <h2 className="font-bold text-xl" style={{ color: '#1a1a2e' }}>Your mess is safe here</h2>
            <p className="text-sm text-gray-600">This is how your font and layout will look to users on the site.</p>
            <div className="flex gap-2">
              <div className="px-4 py-2 text-white text-sm font-semibold" style={{
                backgroundColor: hslToHex(...(Object.values(parseHsl(config['--primary'] || '262 83% 58%')) as [number, number, number])),
                borderRadius: config['--radius'],
              }}>
                Get started
              </div>
              <div className="px-4 py-2 text-sm font-medium border border-gray-300" style={{ borderRadius: config['--radius'] }}>
                Sign in
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
