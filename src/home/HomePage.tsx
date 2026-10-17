"use client";
import type React from "react";
import type { Content } from "../content";
import { V2Shell } from "../site/v2/shell";
import { V2_VERSION } from "../site/v2/ui";
import { Contact } from "./Contact";
import { homeSections } from "./copy";
import {
  Assurance,
  Faq,
  Hero,
  Hire,
  India,
  Industries,
  Process,
  Services,
  Stack,
  Supporting,
  Team,
  Work,
  Words,
} from "./Sections";
import { HomeContext } from "./ui";

type Listing = {
  path: string;
  kind: string;
  title: string;
  description: string;
}[];

const order = homeSections.map((section) => section.id);

// The homepage, rendered inside the v2 shell (header, footer, styles and behaviours).
export function HomePage({
  content,
  paths = [],
  listing = [],
  preview = false,
  linkMap = {},
  children,
}: {
  content: Content;
  paths?: string[];
  listing?: Listing;
  preview?: boolean;
  linkMap?: Record<string, string>;
  children?: React.ReactNode;
}) {
  return (
    <HomeContext.Provider value={{ content, paths, preview, linkMap, order }}>
      <V2Shell
        home
        paths={paths}
        preview={preview}
        linkMap={linkMap}
        contactHref="#contact"
        cta={false}
      >
        <link rel="stylesheet" href={`/assets/v2/pages/showcase.css?v=${V2_VERSION}`} />
        <Hero />
        <Stack />
        <Services />
        <Supporting />
        <Team />
        <India />
        <Assurance />
        <Process />
        <Hire />
        <Industries />
        <Words />
        <Work listing={listing} />
        <Faq />
        <Contact />
        {children}
      </V2Shell>
    </HomeContext.Provider>
  );
}
