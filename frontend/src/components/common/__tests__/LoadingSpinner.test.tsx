import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import LoadingSpinner from '../LoadingSpinner'

describe('LoadingSpinner (smoke)', () => {
  it('renders spinner with text', () => {
    render(<LoadingSpinner text="加载中..." size="sm" color="blue" />)
    expect(screen.getByText('加载中...')).toBeInTheDocument()
    // Ensure an SVG with spin class exists
    const svg = document.querySelector('svg')
    expect(svg?.getAttribute('class') || '').toContain('animate-spin')
  })

  it('supports fullScreen overlay', () => {
    render(<LoadingSpinner fullScreen text="请稍候" />)
    expect(screen.getByText('请稍候')).toBeInTheDocument()
    const overlay = document.querySelector('.fixed.inset-0')
    expect(overlay).not.toBeNull()
  })
})
