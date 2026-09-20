import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function PolytopeViewer3D({ period = 1 }: { period?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    camera.position.set(4.8, 3.8, 6.8)
    camera.lookAt(0, 0, 0)
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    const geometry = new THREE.IcosahedronGeometry(2, 1)
    const region = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: '#0284c7', transparent: true, opacity: 0.13 }))
    const wire = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: '#0284c7', opacity: 0.72, transparent: true }))
    const path = new THREE.Line(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 18 }, (_, index) => { const progress = index / 17; return new THREE.Vector3(-1.9 + progress * 1.8, 1.5 - progress * 1.35, -1.4 + progress * 1.3) })), new THREE.LineBasicMaterial({ color: '#0ea5e9' }))
    const vertex = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), new THREE.MeshBasicMaterial({ color: '#059669' }))
    vertex.position.set(0, 0.15, 0.1)
    scene.add(region, wire, path, vertex)
    const resize = () => { const width = canvas.clientWidth || 640; const height = canvas.clientHeight || 330; camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false) }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)
    let frame = 0
    const animate = () => { frame = requestAnimationFrame(animate); const phase = performance.now() * 0.00035; region.rotation.y = phase + period * 0.04; wire.rotation.y = region.rotation.y; renderer.render(scene, camera) }
    animate()
    return () => { cancelAnimationFrame(frame); observer.disconnect(); geometry.dispose(); renderer.dispose() }
  }, [period])
  return <canvas ref={canvasRef} className="h-full min-h-[300px] w-full" aria-label="3D feasible polytope with PDHG trajectory" />
}
