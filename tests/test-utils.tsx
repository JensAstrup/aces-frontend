import { RenderHookOptions, renderHook } from '@testing-library/react-hooks'
import { ReactElement, act } from 'react'
import { createRoot } from 'react-dom/client'


const customRenderHook = <TProps, TResult>(
  render: (initialProps: TProps) => TResult,
  options?: RenderHookOptions<TProps>
) => {
  const container = document.createElement('div')
  document.body.appendChild(container)

  const root = createRoot(container)

  const result = renderHook(render, {
    ...options,
    // @ts-expect-error Don't worry about the children
    wrapper: ({ children }) => {
      root.render(children as ReactElement)
      return null
    },
  })

  result.unmount = () => {
    act(() => {
      root.unmount()
    })
    document.body.removeChild(container)
  }

  return result
}

export { customRenderHook }
