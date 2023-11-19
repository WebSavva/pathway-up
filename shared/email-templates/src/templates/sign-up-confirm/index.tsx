import { ConfirmFrame, type ConfirmFrameProps } from '@/components';

import { createTemplate } from '@/utils/template';
import { TemplateName } from '@/utils/template-names';

export type SignUpConfirmTemplateProps = Pick<
  ConfirmFrameProps,
  'confirmUrl' | 'username'
>;

export const SignUpConfirmEmailTemplate = createTemplate(
  TemplateName.SignUpConfirmEmail,
  (props: SignUpConfirmTemplateProps) => {
    return (
      <ConfirmFrame
        {...props}
        previewText="Email Confirmation | PathwayUp"
        introText="Thanks for joining PathwayUp. Before starting to use our app, you need
        to confirm your email by pressing the button below:"
        buttonText="Confirm email"
      />
    );
  },
);
