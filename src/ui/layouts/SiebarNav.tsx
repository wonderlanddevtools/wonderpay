"use client";
/*
 * Documentation:
 * SiebarNav — https://app.subframe.com/2c4f0ae04dde/library?component=SiebarNav_a57b1c43-310a-493f-b807-8cc88e2452cf
 * Sidebar with large items — https://app.subframe.com/2c4f0ae04dde/library?component=Sidebar+with+large+items_70c3656e-47c2-460e-8007-e198804e8862
 * Button — https://app.subframe.com/2c4f0ae04dde/library?component=Button_3b777358-b86b-40af-9327-891efc6826fe
 */

import React from "react";
import * as SubframeCore from "@subframe/core";
import { SidebarWithLargeItems } from "../components/SidebarWithLargeItems";
import { Button } from "../components/Button";

interface SiebarNavRootProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

const SiebarNavRoot = React.forwardRef<HTMLElement, SiebarNavRootProps>(
  function SiebarNavRoot(
    { children, className, ...otherProps }: SiebarNavRootProps,
    ref
  ) {
    return (
      <div
        className={SubframeCore.twClassNames(
          "flex h-screen w-full items-center rounded-md bg-neutral-50 px-6 py-6",
          className
        )}
        ref={ref as any}
        {...otherProps}
      >
        <div className="flex h-256 w-60 flex-none items-start">
          <SidebarWithLargeItems
            className="mobile:hidden"
            header={
              <>
                <img
                  className="h-40 w-44 flex-none object-contain"
                  src="https://res.cloudinary.com/subframe/image/upload/v1736234687/uploads/4629/tju1xfldjj63cqlzrxtw.png"
                />
                <span className="text-body font-body text-default-font"></span>
              </>
            }
            footer={
              <Button
                variant="brand-secondary"
                size="small"
                icon="FeatherLogOut"
              >
                Log Out
              </Button>
            }
          >
            <div className="flex w-full flex-col items-start gap-6 bg-default-background">
              <SidebarWithLargeItems.NavItem icon="FeatherHome" selected={true}>
                Home
              </SidebarWithLargeItems.NavItem>
              <SidebarWithLargeItems.NavItem icon="FeatherArrowUpRight">
                Bill Pay
              </SidebarWithLargeItems.NavItem>
              <SidebarWithLargeItems.NavItem icon="FeatherArrowDownLeft">
                Receivables
              </SidebarWithLargeItems.NavItem>
              <SidebarWithLargeItems.NavItem icon="FeatherFilePlus">
                Create Invoice
              </SidebarWithLargeItems.NavItem>
              <SidebarWithLargeItems.NavItem icon="FeatherDollarSign">
                QuickPay
              </SidebarWithLargeItems.NavItem>
              <SidebarWithLargeItems.NavItem icon="FeatherBanknote">
                WonderPay Capital
              </SidebarWithLargeItems.NavItem>
              <SidebarWithLargeItems.NavItem icon="FeatherContact">
                Clients &amp; Vendors
              </SidebarWithLargeItems.NavItem>
              <SidebarWithLargeItems.NavItem icon="FeatherSettings">
                Settings
              </SidebarWithLargeItems.NavItem>
            </div>
          </SidebarWithLargeItems>
        </div>
        {children ? (
          <div className="flex grow shrink-0 basis-0 flex-col items-start gap-4 self-stretch overflow-y-auto bg-default-background">
            {children}
          </div>
        ) : null}
      </div>
    );
  }
);

export const SiebarNav = SiebarNavRoot;
