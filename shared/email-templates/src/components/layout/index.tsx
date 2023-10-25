import type { FC, ReactNode } from 'react';
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Img,
} from '@react-email/components';

import { StyledHr } from '@/components/hr';

import { mainStyle, footerStyle, sectionStyle, containerStyle } from './style';

export interface LayoutProps {
  previewText: string;
  children: ReactNode;
};

export const Layout: FC<LayoutProps> = (props) => {
  return (
    <Html>
      <Head />

      <Preview>{props.previewText}</Preview>

      <Body style={mainStyle}>
        <Container style={containerStyle}>
          <Section style={sectionStyle}>
            <Img
              src="/logo-text.png"
              height={40}
              style={{
                display: 'inline-block',
                width: '100%',
                objectFit: 'contain',
                marginBottom: 10,
              }}
            />

            <StyledHr />

            {props.children}

            <StyledHr />

            <Text style={footerStyle}>
              &copy; PathwayUp, {new Date().getFullYear()}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};
