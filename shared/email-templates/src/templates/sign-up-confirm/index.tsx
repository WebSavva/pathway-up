import {
  Layout,
  StyledButton,
  StyledParagraph,
  StyledLink,
} from '@/components';

import { createTemplate } from '@/utils/template';
import { TemplateName } from '@/utils/template-names'

export interface SignUpConfirmTemplateProps {
  confirmUrl: string;
  username: string;
}

export const SignUpConfirmEmailTemplate = createTemplate(
  TemplateName.SignUpConfirmEmail,
  ({ confirmUrl, username }: SignUpConfirmTemplateProps) => {
    return (
      <Layout previewText="Email Confirmation | PathwayUp">
        <StyledParagraph
          style={{
            fontWeight: '500',
          }}
        >
          Hi, {username} !
        </StyledParagraph>

        <StyledParagraph>
          Thanks for joining PathwayUp. Before starting to use our app, you need
          to confirm your email by pressing the button below:
        </StyledParagraph>

        <StyledButton pX={10} pY={10} href={confirmUrl}>
          Confirm email
        </StyledButton>

        <StyledParagraph>
          If there is an issue with the confirmation button, you can use the
          following link
        </StyledParagraph>

        <StyledLink href={confirmUrl}>{confirmUrl}</StyledLink>
      </Layout>
    );
  },
);
