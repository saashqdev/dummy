import { Fragment } from "react";
import clsx from "clsx";
import { PageBlock } from "./PageBlock";
import LayoutBlockUtils from "./shared/layout/LayoutBlockUtils";
import { PageBlockDto } from "./PageBlockDto";

export default function PageBlocks({ items, className = "overflow-hidden" }: { items: PageBlockDto[]; className?: string }) {
  return (
    <Fragment>
      <div className={clsx("relative", className)}>
        {items?.map((item, idx) => {
          return (
            <div key={idx} className={clsx("group relative", item.header && "z-10")}>
              <div className={clsx(LayoutBlockUtils.getClasses(item))}>
                <PageBlock item={item} />
              </div>
            </div>
          );
        })}
      </div>
    </Fragment>
  );
}
