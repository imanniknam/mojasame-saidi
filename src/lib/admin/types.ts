import type { ReactNode } from "react";

export type AdminPageMeta = {
  title: string;
  description?: string;
  /** Primary action label for page header */
  actionLabel?: string;
  actionHref?: string;
};

export type AdminTableColumn<T> = {
  key: string;
  header: string;
  className?: string;
  hideOnMobile?: boolean;
  render: (row: T) => ReactNode;
};
