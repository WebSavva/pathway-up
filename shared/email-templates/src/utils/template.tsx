import type { FC } from 'react';
import { render } from '@react-email/components';

export const createTemplate = <P extends Record<string, any>>(
  Template: FC<P>,
) => {
  return (props: P) => ({
    html: render(<Template {...props} />),
    text: render(<Template {...props} />, {
      plainText: true,
    }),
  });
};
