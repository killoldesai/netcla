"use client";
import React, { useRef } from "react";
import type { Content } from "../content";
import { HomeFooter, HomeHeader } from "./Chrome";
import { Contact, CtaBand } from "./Contact";
import { homeSections } from "./copy";
import {
  Faq,
  Hero,
  Hire,
  India,
  Industries,
  Process,
  Results,
  Services,
  Stack,
  Supporting,
  Work,
} from "./Sections";
import { HomeContext } from "./ui";
import { useReveal } from "./useReveal";

type Listing = {
  path: string;
  kind: string;
  title: string;
  description: string;
}[];

const order = homeSections.map((section) => section.id);

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
  const root = useRef<HTMLDivElement>(null);
  useReveal(root);
  return (
    <HomeContext.Provider value={{ content, paths, preview, linkMap, order }}>
      <div ref={root} className="n-home">
        <HomeHeader />
        <main id="main">
          <Hero />
          <Services />
          <Results />
          <Supporting />
          <Process />
          <Stack />
          <India />
          <Hire />
          <Industries />
          <Work listing={listing} />
          <Faq />
          <CtaBand />
          <Contact />
          {children}
        </main>
        <HomeFooter />
      </div>
    </HomeContext.Provider>
  );
}
