import type { FC } from 'react';
import { render } from '@react-email/components';

import type { TemplateName } from './template-names';

export const createTemplate = <
  N extends TemplateName,
  P extends Record<string, any>,
>(
  key: N,
  Template: FC<P>,
) => {
  return {
    template: (props: P) => ({
      html: render(<Template {...props} />),
      text: render(<Template {...props} />, {
        plainText: true,
      }),
    }),
    key,
  };
};
