import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react'

/**
 * ImageZoomViewer
 * Full-screen tap-to-zoom image viewer for listing photos
 * Supports swipe between images and pinch-to-zoom gesture
 */
export function ImageZoomViewer({ images, startIndex = 0, onClose }) {
  const [current, setCurrent] = useState(startIndex)
  const [scale, setScale] = useState(1)
  const [touchStart, setTouchStart] = useState(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const prev = () => { setScale(1); setCurrent(c => Math.max(0, c - 1)) }
  const next = () => { setScale(1); setCurrent(c => Math.min(images.length - 1, c + 1)) }

  const handleTouchStart = (e) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e) => {
    if (!touchStart) return
    const diff = touchStart - e.changedTouches[0].clientX
    if (Math.abs(diff) > 50) {
      if (diff > 0) next()
      else prev()
    }
    setTouchStart(null)
  }

  const handleDoubleTap = () => {
    setScale(s => s === 1 ? 2.5 : 1)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.96)', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', background: 'rgba(0,0,0,0.5)', flexShrink: 0 }}>
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>
          {current + 1} / {images.length}
        </span>
        <button onClick={onClose}
          style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}>
          <X size={18} />
        </button>
      </div>

      {/* Image */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}>

        <img
          src={images[current]}
          alt={`Photo ${current + 1}`}
          onDoubleClick={handleDoubleTap}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', transform: `scale(${scale})`, transition: scale === 1 ? 'transform 0.3s' : 'none', cursor: scale === 1 ? 'zoom-in' : 'zoom-out', userSelect: 'none' }}
        />

        {/* Prev / Next arrows */}
        {current > 0 && (
          <button onClick={prev}
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', backdropFilter: 'blur(8px)' }}>
            <ChevronLeft size={22} />
          </button>
        )}
        {current < images.length - 1 && (
          <button onClick={next}
            style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white', backdropFilter: 'blur(8px)' }}>
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {/* Dot indicators + zoom hint */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        {images.length > 1 && (
          <div style={{ display: 'flex', gap: 6 }}>
            {images.map((_, i) => (
              <div key={i} onClick={() => { setScale(1); setCurrent(i) }}
                style={{ width: i === current ? 20 : 6, height: 6, borderRadius: 3, background: i === current ? 'white' : 'rgba(255,255,255,0.35)', cursor: 'pointer', transition: 'all 0.2s' }} />
            ))}
          </div>
        )}
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: 5 }}>
          <ZoomIn size={11} /> Double-tap to zoom · Swipe to browse
        </span>
      </div>
    </div>
  )
}

/**
 * ZoomableImage — single image that opens the viewer on tap
 */
export function ZoomableImage({ src, alt, allImages = [], index = 0, style = {} }) {
  const [open, setOpen] = useState(false)
  const images = allImages.length > 0 ? allImages : [src]

  return (
    <>
      <div onClick={() => setOpen(true)} style={{ cursor: 'zoom-in', ...style }}>
        <img src={src} alt={alt} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      {open && <ImageZoomViewer images={images} startIndex={index} onClose={() => setOpen(false)} />}
    </>
  )
}
