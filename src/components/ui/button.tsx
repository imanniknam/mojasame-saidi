import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-45 active:scale-[0.98] [&_svg]:pointer-events-none [&_svg]:size-[1.125rem] [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-elegant hover:bg-primary/92",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/85",
        outline:
          "border border-highlight/35 bg-background/35 text-foreground shadow-xs hover:border-highlight/60 hover:bg-highlight/10",
        ghost: "hover:bg-muted/55",
        /** دکمه لوکس: برنز ملایم روی کرم */
        luxury:
          "border border-highlight/30 bg-gradient-to-b from-highlight to-highlight/75 text-highlight-foreground shadow-card hover:brightness-[1.06]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-elegant hover:bg-destructive/90",
        link: "text-highlight underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 min-h-touch px-5 py-2 md:h-10 md:min-h-0",
        sm: "h-10 rounded-md px-3.5 text-xs md:h-9",
        lg: "h-12 min-h-touch rounded-xl px-8 text-base md:h-11",
        /** حداقل ۴۴px برای انگشت */
        touch: "h-12 min-h-touch min-w-touch px-6 text-base rounded-xl",
        icon: "h-11 w-11 min-h-touch min-w-touch md:h-10 md:w-10 md:min-h-0 md:min-w-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
