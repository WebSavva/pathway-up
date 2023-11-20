import {
  Layout,
  StyledButton,
  StyledParagraph,
  StyledLink,
} from '@/components';

export interface ConfirmFrameProps {
  confirmUrl: string;
  username: string;
  buttonText: string;
  introText: string;
  previewText: string;
};

export const ConfirmFrame = ({
  confirmUrl,
  username,
  buttonText,
  previewText,
  introText,
}: ConfirmFrameProps) => {
  return (
    <Layout previewText={previewText}>
      <StyledParagraph
        style={{
          fontWeight: '500',
        }}
      >
        Hi, {username} !
      </StyledParagraph>

      <StyledParagraph>{introText}</StyledParagraph>

      <StyledButton pX={10} pY={10} href={confirmUrl}>
        {buttonText}
      </StyledButton>

      <StyledParagraph>
        If there is an issue with the confirmation button, you can use the
        following link
      </StyledParagraph>

      <StyledLink href={confirmUrl}>{confirmUrl}</StyledLink>
    </Layout>
  );
};
