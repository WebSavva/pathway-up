import type { ForwardRefExoticComponent, CSSProperties } from 'react';

export const styled = <P extends Record<string, any>>(
  Component: ForwardRefExoticComponent<P>,
  style: CSSProperties,
) => {
  return (props: P) => {
    const mergedProps = {
      ...props,
      style: {
        ...style,
        ...(props.style || {}),
      },
    };
    return <Component {...mergedProps} />;
  };
};
