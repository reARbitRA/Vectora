export const EASINGS={linear:'linear',standard:'cubic-bezier(.2,0,0,1)',enter:'cubic-bezier(.05,.7,.1,1)',exit:'cubic-bezier(.3,0,.8,.15)',elastic:'cubic-bezier(.68,-.55,.265,1.55)',smooth:'cubic-bezier(.25,.46,.45,.94)'} as const;
export type EasingName=keyof typeof EASINGS;
