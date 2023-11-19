import { ConfirmFrame, type ConfirmFrameProps } from '@/components';

import { createTemplate } from '@/utils/template';
import { TemplateName } from '@/utils/template-names';

export type PasswordChangeConfirmTemplateProps = Pick<
  ConfirmFrameProps,
  'confirmUrl' | 'username'
>;

export const PasswordChangeConfirmEmailTemplate = createTemplate(
  TemplateName.PasswordChangeConfirmEmail,
  (props: PasswordChangeConfirmTemplateProps) => {
    return (
      <ConfirmFrame
        {...props}
        previewText="Password Change | PathwayUp"
        introText="You've requested password change. In order to confirm that, please press the button below:"
        buttonText="Confirm password change"
      />
    );
  },
);
