export * from './sign-up-confirm';
export * from './password-change-confirm';
export * from '@/utils/template-names';

import { SignUpConfirmEmailTemplate } from './sign-up-confirm';
import { PasswordChangeConfirmEmailTemplate } from './password-change-confirm';

const templatesMap = {
  SignUpConfirmEmailTemplate,
  PasswordChangeConfirmEmailTemplate,
} as const;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

type TemplatesMap = typeof templatesMap;

export type Templates = UnionToIntersection<
  {
    [TemplateName in keyof TemplatesMap]: Record<
      TemplatesMap[TemplateName]['key'],
      TemplatesMap[TemplateName]['template']
    >;
  }[keyof TemplatesMap]
>;

export const templates = Object.fromEntries(
  Object.values(templatesMap).map(({ key, template }) => [key, template]),
) as unknown as Templates;
