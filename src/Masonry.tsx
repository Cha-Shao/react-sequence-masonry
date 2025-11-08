"use client"

import { useEffect, useRef, useState, ReactNode, Children, useCallback, useLayoutEffect, useMemo, createRef } from "react"

type ColsBreakPoint = number | Record<number, number>

interface MasonryProps {
  children: ReactNode
  gutter?: string | number
  colsBreakPoint?: ColsBreakPoint
}

const useIsomorphicLayoutEffect = typeof window !== "undefined"
  ? useLayoutEffect
  : useEffect

const useHasMounted = () => {
  const [hasMounted, setHasMounted] = useState(false)
  useIsomorphicLayoutEffect(() => {
    setHasMounted(true)

    return () => setHasMounted(false)
  }, [])
  return hasMounted
}

const useWindowWidth = () => {
  const hasMounted = useHasMounted()
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  )

  const handleResize = useCallback(() => {
    if (!hasMounted) return
    setWidth(window.innerWidth)
  }, [hasMounted])

  useIsomorphicLayoutEffect(() => {
    if (hasMounted) {
      window.addEventListener("resize", handleResize)
      handleResize()
      return () => window.removeEventListener("resize", handleResize)
    }
  }, [hasMounted, handleResize])

  return width
}

const Masonry = ({
  children,
  gutter = "1rem",
  colsBreakPoint = 3,
}: MasonryProps) => {
  const hasMounted = useHasMounted()
  const width = useWindowWidth()
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const containerRef = useRef<HTMLOListElement>(null)
  const [containerHeight, setContainerHeight] = useState(0)

  const childRefs = useMemo(() =>
    Children.map(children, () => createRef<HTMLLIElement>())!
    , [children])

  const [positions, setPositions] = useState<
    { top: number; left: number; width: number }[]
  >([])

  const calculateCols = useCallback((colsBreakPoint: number | Record<number, number>): number => {
    if (typeof colsBreakPoint === "number") return colsBreakPoint
    const breakpoints = Object.entries(colsBreakPoint)
      .map(([width, cols]) => ({ cols: Number(cols), width: Number(width) }))
      .sort((a, b) => b.width - a.width)

    for (const bp of breakpoints) {
      if (width >= bp.width) {
        return bp.cols
      }
    }

    return breakpoints[breakpoints.length - 1]?.cols || 1
  }, [width])

  const cols = useMemo(() =>
    calculateCols(colsBreakPoint)
    , [calculateCols, colsBreakPoint])

  const getGutterInPixels = useCallback(() => {
    if (typeof gutter === "number") return gutter
    if (gutter.endsWith("rem")) {
      return Number.parseFloat(gutter) * 16
    }
    if (gutter.endsWith("px")) {
      return Number.parseFloat(gutter)
    }
    return 16
  }, [gutter])

  const gutterPx = useMemo(() => getGutterInPixels(), [getGutterInPixels])

  useIsomorphicLayoutEffect(() => {
    if (!containerRef.current) return

    const containerWidth = containerRef.current.getBoundingClientRect().width
    const columnWidth = (containerWidth - gutterPx * (cols - 1)) / cols

    const columnHeights = new Array(cols).fill(0)
    const newPositions: { top: number; left: number; width: number }[] = []

    childRefs.forEach((ref, index) => {
      if (!ref.current) return

      const origWidth = ref.current.getBoundingClientRect().width
      const widthScale = columnWidth / origWidth
      const height = ref.current.getBoundingClientRect().height * widthScale
      const col = columnHeights.indexOf(Math.min(...columnHeights))

      const top = columnHeights[col]
      const left = col * (columnWidth + gutterPx)

      newPositions[index] = { top, left, width: columnWidth }
      columnHeights[col] += height + gutterPx
    })

    setPositions(newPositions)
    setContainerHeight(Math.max(...columnHeights) - gutterPx)

    setTimeout(() => {
      setIsLoading(false)
    }, 200)
  }, [childRefs, cols, width, gutterPx, hasMounted])

  return hasMounted && (
    <ol
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: isLoading ? "auto" : `${containerHeight}px`,
        margin: 0,
        padding: 0,
        listStyle: "none",
      }}
    >
      {isLoading && Children.toArray(children).slice(0, cols).map((child, i) => (
        <li key={i} style={{
          padding: `0 ${gutterPx / 2}px`,
          display: "inline-block",
          width: `calc(${100 / cols}%)`,
          verticalAlign: "top",
        }}>
          {child}
        </li>
      ))}
      {Children.map(children, (child, index) => {
        const pos = positions[index]

        return (
          <li
            key={index}
            ref={childRefs[index]}
            style={{
              position: "absolute",
              transform: pos ? `translate(${pos.left}px, ${pos.top}px)` : undefined,
              width: pos?.width,
              transition: "transform .2s",
              willChange: "transform",
              visibility: isLoading ? "hidden" : void 0,
            }}
          >
            {child}
          </li>
        )
      })}
    </ol>
  )
}

export default Masonry
