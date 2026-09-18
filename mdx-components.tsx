import type { MDXComponents } from "mdx/types";
import Image from "next/image";

const components: MDXComponents = {
  h1: ({ children }: { children: React.ReactNode }) => {
    return <h1 className="font-playfair-display">{children}</h1>;
  },
  h2: ({ children }: { children: React.ReactNode }) => {
    return <h2 className="font-playfair-display">{children}</h2>;
  },
  h3: ({ children }: { children: React.ReactNode }) => {
    return <h3 className="font-playfair-display">{children}</h3>;
  },
  h4: ({ children }: { children: React.ReactNode }) => {
    return <h4 className="font-playfair-display">{children}</h4>;
  },
  img: ({...props}) => {
    return <Image width="4096" height="2731" sizes="max(min(max(100vw - 120px, 1px), 1220px), 1px)" {...props}/>
  }
};

export function useMDXComponents(): MDXComponents {
  return components;
}
