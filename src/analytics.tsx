"use client";
import Script from "next/script";
import { usePathname } from "next/navigation";
export function Analytics({ id, enabled }: { id?: string; enabled: boolean }) {
  const path = usePathname();
  if (
    !enabled ||
    !id ||
    !/^G-[A-Z0-9]+$/.test(id) ||
    /^\/(admin|design-preview|api)(\/|$)/.test(path)
  )
    return null;
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script
        id="ga4"
        strategy="afterInteractive"
      >{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${id}',{send_page_view:false});gtag('event','page_view',{page_location:location.origin+location.pathname,page_referrer:document.referrer?new URL(document.referrer).origin:''});`}</Script>
    </>
  );
}
