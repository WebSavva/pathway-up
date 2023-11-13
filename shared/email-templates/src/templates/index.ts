export * from './sign-up-confirm';
export * from '@/utils/template-names';

import { SignUpConfirmEmailTemplate } from './sign-up-confirm';

const TemplatesMap = {
  SignUpConfirmEmailTemplate,
} as const;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

export type Templates = UnionToIntersection<{
  [TemplateName in keyof typeof TemplatesMap]: Record<
    (typeof TemplatesMap)[TemplateName]['key'],
    (typeof TemplatesMap)[TemplateName]['template']
  >;
}[keyof typeof TemplatesMap]>;

export const templates = Object.fromEntries(
  ([SignUpConfirmEmailTemplate] as const).map(({ key, template }) => [
    key,
    template,
  ]),
) as unknown as Templates;
