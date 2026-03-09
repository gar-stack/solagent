import { Documentation } from '@/features/marketing/sections/DocumentationSection';
import { DocsPortal } from '@/features/marketing/sections/DocsPortalSection';
import { Footer } from '@/features/marketing/sections/FooterSection';

export function DocsPage() {
  return (
    <>
      <Documentation />
      <DocsPortal />
      <Footer />
    </>
  );
}
