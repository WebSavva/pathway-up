import {
  Button as BaseButton,
} from '@react-email/button';

import { styled } from '@/utils/styled';

export const buttonStyle = {
  backgroundColor: '#2592ff',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
};

export const StyledButton = styled(BaseButton, buttonStyle);
