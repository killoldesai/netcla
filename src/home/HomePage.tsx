"use client";
import type React from "react";
import type { Content } from "../content";
import { NxShell } from "../site/shell";
import { Contact } from "./Contact";
import { homeSections } from "./copy";
import {
  Assurance,
  Brief,
  Faq,
  Hero,
  Hire,
  India,
  Industries,
  Process,
  Services,
  Stack,
  Supporting,
  Work,
} from "./Sections";
import { HomeContext } from "./ui";

type Listing = {
  path: string;
  kind: string;
  title: string;
  description: string;
}[];

const order = homeSections.map((section) => section.id);

// The homepage, rendered inside the shared site shell (header, footer, styles and behaviours).
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
      <NxShell
        page="home"
        paths={paths}
        preview={preview}
        linkMap={linkMap}
        contactHref="#contact"
        ctaHref="#contact"
      >
        <Hero />
        <Brief />
        <Assurance />
        <Stack />
        <Services />
        <Supporting />
        <Process />
        <India />
        <Hire />
        <Industries />
        <Work listing={listing} />
        <Faq />
        <Contact />
        {children}
      </NxShell>
    </HomeContext.Provider>
  );
}
