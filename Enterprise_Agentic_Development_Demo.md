# Enterprise Agentic Development Demo

## Obiettivo

Costruire una demo enterprise che evolva durante l'anno e mostri un
workflow AI-first.

## Stack

- Next.js (App Router)
- React + TypeScript
- Prisma
- Neon DB
- Neon Auth
- GitHub (Repository, Issues, Projects)
- GitHub MCP
- AI Hero Skills
- Vitest + React Testing Library

## Dominio

Service Desk IT.

### Moduli iniziali

- Dashboard
- Ticket
  - Lista
  - Nuovo Ticket
  - Dettaglio
- Clienti
- Tecnici
- Asset
- Report
- Amministrazione

## Obiettivo didattico

Dimostrare la differenza tra: - prompt tradizionale - workflow agentico
enterprise

## Architettura agentica

Planner - legge Issue GitHub - pone domande di grooming - carica solo la
knowledge pertinente - genera Spec - genera Piano - genera Test Plan -
salva gli artifact

Implementor - carica gli artifact - implementa il piano - aggiorna i
file

Tester - implementa Unit Test - verifica copertura

Reviewer - esegue review tecnica

## Context Engineering

La knowledge è modulare.

knowledge/ - architecture.md - project-overview.md -
coding-guidelines.md - component-guidelines.md - testing-guidelines.md -
styling-guidelines.md - prisma-guidelines.md

Ogni agente carica solo i documenti necessari.

## Sessione e Artifact

Prima di iniziare la pianificazione, il Planner chiede di creare o
confermare il nome della sessione da pianificare. Se l'utente accetta il
default, il nome segue il formato `session-YYYYMMDD-slug-descrittivo`.

Tutti gli artifact generati vengono salvati sotto:

artifacts/ session-id/ session-brief.md requirements-analysis.md
clarification-questions.md spec.md task-breakdown.md
implementation-plan.md test-plan.md changed-files.md review-report.md

Il file `session-brief.md` contiene metadati della sessione e stato di
approvazione. Il file `implementation-plan.md` contiene anche una sezione
`Proposed Diffs` con snippet before/after delle modifiche proposte sui
file markdown, agent, skill, config o codice interessati.

## Roadmap (8 sessioni)

1. Setup progetto e workflow enterprise
2. Context Engineering e Knowledge Base
3. GitHub Issue → Grooming → Spec
4. Spec → Piano → Artifact con diff proposte
5. Implementazione guidata dal piano
6. Testing AI-assisted
7. Bug fixing enterprise
8. Workflow end-to-end

## Evoluzione del repository

Ogni nuova feature viene sviluppata tramite: Issue → Sessione → Planner
→ Spec → Piano con diff proposte → Approvazione → Implementazione → Test
→ Review → Pull Request

## Tipi di User Story

- Nuova funzionalità
- Refactoring
- Bug fixing
- Performance
- Accessibilità
- Sicurezza
- UX

## Prompt finali

Planner: `/plan issue-123`

Implementazione: `/implement session-123`

Test: `/test session-123`

Review: `/review session-123`

L'obiettivo è ridurre il prompt al minimo e spostare l'intelligenza nel
workflow.
