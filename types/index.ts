export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: string | number;
}

type Page = {
  text: string;
  url: string;
};

export type CardVariants = "default" | "md" | "sm" | null;
export type PostCategory = "travel" | "lifestyle" | "destination";

type Social = {
  name: string;
  icon: React.ComponentType;
  url: string;
};

export type SiteLink = {
  pages: Page[];
  socials: Social[];
};

export type Post = {
  key: string;
  title: string;
  slug: string;
  image: string;
  postDate: Date;
  description: string;
};
