import { render } from '@react-email/components';
import type { ReactElement } from 'react';

export interface EmailTemplateProps {
  [name: string]: Number | Boolean | String;
}

export class EmailTemplate {
  props: EmailTemplateProps = {};

  template?: () => ReactElement;

  render() {
    if (!this.template) return '';

    return render(this.template());
  }
}
