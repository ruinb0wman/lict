import { Minus, X } from 'lucide-react'
import '@/index.css'

export function TitleBar() {
  const handleMinimize = () => {
    window.electronWindow.minimize()
  }

  const handleClose = () => {
    window.electronWindow.close()
  }

  return (
    <div className="title-bar">
      <div className="title-bar-drag">
        <span className="title-bar-text">Dict</span>
      </div>
      <div className="title-bar-buttons">
        <button
          className="title-bar-btn minimize"
          onClick={handleMinimize}
          title="最小化"
        >
          <Minus size={14} strokeWidth={1.5} />
        </button>
        <button
          className="title-bar-btn close"
          onClick={handleClose}
          title="关闭"
        >
          <X size={14} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  )
}
