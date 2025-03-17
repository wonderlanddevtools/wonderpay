"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Info, X } from "lucide-react";

const notificationBannerVariants = cva(
  "relative w-full flex items-center gap-3 px-4 py-3 text-sm",
  {
    variants: {
      variant: {
        success: "bg-emerald-50 text-emerald-900 border-l-4 border-emerald-500 dark:bg-emerald-950/50 dark:text-emerald-100",
        error: "bg-red-50 text-red-900 border-l-4 border-red-500 dark:bg-red-950/50 dark:text-red-100",
        info: "bg-blue-50 text-blue-900 border-l-4 border-blue-500 dark:bg-blue-950/50 dark:text-blue-100",
      },
      rounded: {
        none: "",
        default: "rounded-lg",
      }
    },
    defaultVariants: {
      variant: "info",
      rounded: "default",
    }
  }
);

interface NotificationBannerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof notificationBannerVariants> {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  onClose?: () => void;
  isClosable?: boolean;
}

const NotificationBanner = React.forwardRef<HTMLDivElement, NotificationBannerProps>(
  ({ className, variant, rounded, title, description, action, onClose, isClosable = true, children, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(true);

    const handleClose = () => {
      setIsVisible(false);
      onClose?.();
    };

    if (!isVisible) return null;

    const icons = {
      success: <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0" />,
      error: <AlertCircle className="h-5 w-5 text-red-500 shrink-0" />,
      info: <Info className="h-5 w-5 text-blue-500 shrink-0" />,
    };

    return (
      <div
        ref={ref}
        className={cn(notificationBannerVariants({ variant, rounded }), className)}
        {...props}
      >
        {variant && icons[variant]}
        <div className="flex grow flex-col justify-between gap-2 md:flex-row md:items-center">
          <div>
            {title && <p className="font-medium">{title}</p>}
            {description && <p className="text-sm opacity-90">{description}</p>}
            {children}
          </div>
          {action && (
            <div className="flex shrink-0 items-center gap-2">
              {action}
            </div>
          )}
        </div>
        {isClosable && (
          <Button
            variant="ghost"
            className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
            onClick={handleClose}
            aria-label="Close notification"
          >
            <X
              size={16}
              strokeWidth={2}
              className="opacity-60 transition-opacity group-hover:opacity-100"
              aria-hidden="true"
            />
          </Button>
        )}
      </div>
    );
  }
);

NotificationBanner.displayName = "NotificationBanner";

export { NotificationBanner, type NotificationBannerProps };
