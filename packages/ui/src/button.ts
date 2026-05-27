export const buttonVariants = {
  primary: "bg-brand-500 text-white",
  secondary: "bg-gray-100 text-gray-900",
} as const;

export type ButtonVariant = keyof typeof buttonVariants;
