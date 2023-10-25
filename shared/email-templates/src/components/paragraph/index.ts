import { Text } from '@react-email/text';

import { styled } from '@/utils/styled';

export const paragraphStyle = {
  color: '#525f7f',

  fontSize: '16px',
  lineHeight: '1.7',
  textAlign: 'left' as const,
};

export const StyledParagraph = styled(Text, paragraphStyle);
