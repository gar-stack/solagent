import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileText, Shield, TerminalSquare, Workflow } from 'lucide-react';

const sections = [
  {
    id: 'doc-setup',
    title: '1. Setup and Environment',
    body: 'Install dependencies, configure devnet RPC, and define your default CLI wallet. Keep local wallet files out of git and run lint/build before any release.',
  },
  {
    id: 'doc-access',
    title: '2. Access Model',
    body: 'Dashboard agent controls require a connected master wallet (Phantom). CLI/SDK users operate directly via terminal/code paths without web dashboard control.',
  },
  {
    id: 'doc-agents',
    title: '3. Agent Execution',
    body: 'Agent decisions are validated by confidence thresholds, allowed actions, and risk limits before any execution. Expand executor support and add policy engines for production.',
  },
  {
    id: 'doc-security',
    title: '4. Security Hardening',
    body: 'Move from plaintext key storage to managed secrets, add action-level audit sinks, signed policy updates, and continuous monitoring with alerts.',
  },
  {
    id: 'doc-release',
    title: '5. Release Checklist',
    body: 'Run integration tests on devnet, verify rollback strategy, benchmark RPC reliability, and validate operator runbooks before shipping a public demo.',
  },
];

export function DocsPortal() {
  return (
    <section id="docs-portal" className="py-20 bg-slate-950">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="mb-10 text-center">
          <Badge className="mb-4 px-4 py-2 bg-emerald-500/20 text-emerald-300 border-emerald-500/30">Documentation Hub</Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Operational Documentation</h2>
          <p className="text-slate-400 max-w-3xl mx-auto">
            Structured guidance for setup, access control, execution policy, and production hardening.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <TerminalSquare className="w-5 h-5 text-cyan-300" />
                CLI and Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 text-sm">
              Use signed CLI access codes to authorize dashboard controls without exposing private keys in-browser.
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <Workflow className="w-5 h-5 text-emerald-300" />
                Agent Lifecycle
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 text-sm">
              Analyze, decide, validate, execute, and log. Guardrails must be enforced before every action.
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-amber-300" />
                Security Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="text-slate-300 text-sm">
              Rate limits, action whitelists, signed auth, and production key management are mandatory before launch.
            </CardContent>
          </Card>
        </div>

        <Card className="bg-slate-900 border-slate-800 mb-8">
          <CardHeader>
            <CardTitle className="text-white">Detailed Runbook</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {sections.map((section) => (
                <AccordionItem key={section.id} value={section.id} className="border-slate-800">
                  <AccordionTrigger className="text-slate-200 hover:text-white">{section.title}</AccordionTrigger>
                  <AccordionContent className="text-slate-400">{section.body}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>

        <div className="flex flex-wrap gap-3 justify-center">
          <Button variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800" asChild>
            <a href="https://github.com/gar-stack/solagent/blob/main/docs/GETTING_STARTED.md" target="_blank" rel="noopener noreferrer">
              <FileText className="w-4 h-4 mr-2" />
              Getting Started
              <ExternalLink className="w-3 h-3 ml-2" />
            </a>
          </Button>
          <Button variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800" asChild>
            <a href="https://github.com/gar-stack/solagent/blob/main/docs/SECURITY.md" target="_blank" rel="noopener noreferrer">
              <Shield className="w-4 h-4 mr-2" />
              Security Guide
              <ExternalLink className="w-3 h-3 ml-2" />
            </a>
          </Button>
          <Button variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-800" asChild>
            <a href="https://github.com/gar-stack/solagent/blob/main/docs/PRODUCTION_TASKS.md" target="_blank" rel="noopener noreferrer">
              <Workflow className="w-4 h-4 mr-2" />
              Production Tasks
              <ExternalLink className="w-3 h-3 ml-2" />
            </a>
          </Button>
        </div>
      </div>
    </section>
  );
}
