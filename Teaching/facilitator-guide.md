# Guida Facilitatore

Questa guida supporta sette sessioni da 45 minuti per insegnare progettazione di sistemi di sviluppo agentico. Ogni sessione usa questo repository come esempio, ma obiettivo è insegnare principi trasferibili.

## Sessione 1: Da Prompt a Sistemi

Obiettivo: aiutare partecipanti a capire perché prompt una tantum non bastano per lavoro software ripetibile.

Principio: partire dai failure mode e trasformarli in design del workflow.

Esempio repo da mostrare:

- [../docs/agents/governance.md](../docs/agents/governance.md)
- [../AGENTS.md](../AGENTS.md)

Tempi:

- 5 min: chiedi dove agent hanno aiutato e dove sono usciti da binario.
- 10 min: spiega differenza tra prompt, workflow e sistema.
- 10 min: percorri file governance come risposte ai failure mode.
- 10 min: esercizio gruppo: elenca tre rischi agent nei repo dei partecipanti.
- 5 min: collega ogni rischio a un controllo possibile.
- 5 min: riepilogo.

Prompt demo live:

```text
/teach-agents inspect the custom agentic system at a high level and explain which failure modes it is designed to prevent. Do not inspect app feature code.
```

Comportamento atteso:

- Agent si concentra su file del sistema agentico.
- Agent nomina rischi come approvazione saltata, drift di contesto, ownership non chiara, evidenza mancante.
- Agent evita implementazione feature service desk.

Prompt discussione:

- Quali errori agent sono costosi per tuo team?
- Quali errori sono solo fastidiosi?
- Quali errori richiedono processo e quali prompt migliori?

Takeaway partecipante: sistemi agentici vanno progettati intorno al rischio reale del workflow, non intorno alla novita dello strumento.

## Sessione 2: Gerarchia Istruzioni e Modalita

Obiettivo: insegnare come istruzioni competono e come le modalità esplicite cambiano comportamento.

Principio: rendere visibili precedenza e switch modalità.

Esempio repo da mostrare:

- [../AGENTS.md](../AGENTS.md)
- [system-map.md](system-map.md)

Tempi:

- 5 min: ripassa failure mode della sessione precedente.
- 10 min: spiega precedenza istruzioni.
- 10 min: mostra le skill `/customize-agents`, `/teach-agents` e le skill intake come esempi di switch di modalità.
- 10 min: mappa un workflow dei partecipanti in modalità default più una modalità override.
- 5 min: discuti rischio di troppe modalità.
- 5 min: riepilogo.

Prompt demo live:

```text
/teach-agents improve the explanation of mode switches in Teaching/principles.md. Keep the work inside Teaching/.
```

Comportamento atteso:

- Agent tratta richiesta come lavoro materiale didattico.
- Agent non chiede session ID service desk.
- Agent non modifica codice applicativo.

Prompt discussione:

- Quali istruzioni nel tuo repo devono avere autorità massima?
- Quali skill devono attivare workflow speciali?
- Cosa deve vietare esplicitamente una modalità?

Takeaway partecipante: agent sono più prevedibili quando rami workflow sono nominati e delimitati.

## Sessione 3: Separazione Ruoli

Obiettivo: mostrare come ruoli planner, implementor, tester e reviewer riducono drift di contesto e autorità.

Principio: separare lavoro dove cambia responsabilita o permesso.

Esempio repo da mostrare:

- [../.github/agents/DemoPlanner.agent.md](../.github/agents/DemoPlanner.agent.md)
- [../.github/agents/DemoVisionUI.agent.md](../.github/agents/DemoVisionUI.agent.md)
- [../.github/agents/DemoImplementor.agent.md](../.github/agents/DemoImplementor.agent.md)
- [../.github/agents/DemoTester.agent.md](../.github/agents/DemoTester.agent.md)
- [../.github/agents/DemoReviewer.agent.md](../.github/agents/DemoReviewer.agent.md)

Tempi:

- 5 min: spiega perché un solo agent tuttofare tende al drift.
- 10 min: confronta responsabilita intake, planner visuale, planner e implementor.
- 10 min: confronta responsabilita tester e reviewer.
- 10 min: partecipanti disegnano ruoli per workflow proprio.
- 5 min: identifica dove servono campi di handoff.
- 5 min: riepilogo.

Prompt demo live:

```text
/teach-agents explain why the Demo Planner should not implement code and why the Demo Implementor should work from approved artifacts.
```

Comportamento atteso:

- Agent spiega autorità dei ruoli, non dettagli app.
- Agent usa file agent custom come esempi, incluso `Demo Vision UI` come ruolo stretto di estrazione visuale.
- Agent evidenzia dipendenza da approvazione prima di implementare.

Prompt discussione:

- Quali ruoli nel tuo workflow richiedono permessi diversi?
- Dove serve un ruolo stretto che traduce evidenza grezza in artifact riusabile?
- Cosa deve essere vietato a planner?
- Cosa deve rifiutare implementor senza evidenza?

Takeaway partecipante: separazione ruoli è controllo su autorità, contesto e revisionabilità.

## Sessione 4: Artifact e Gate di Approvazione

Obiettivo: insegnare perché artifact durevoli sono più forti della memoria chat.

Principio: catturare decisioni prima di attraversare gate ad alto rischio.

Esempio repo da mostrare:

- [../.agents/skills/artifact-workflow/SKILL.md](../.agents/skills/artifact-workflow/SKILL.md)
- [../.github/agents/DemoVisionUI.agent.md](../.github/agents/DemoVisionUI.agent.md)
- [../docs/agents/governance.md](../docs/agents/governance.md)

Tempi:

- 5 min: chiedi cosa si perde tra sessioni chat.
- 10 min: mostra pacchetto artifact di sessione.
- 10 min: mostra differenza tra immagine grezza e artifact visuale canonico.
- 10 min: spiega metadata di approvazione.
- 10 min: partecipanti scelgono artifact per un workflow proprio.
- 5 min: discuti cosa resta locale e cosa committare.
- 5 min: riepilogo.

Prompt demo live:

```text
/teach-agents show what artifacts a healthy agentic development workflow should produce before code changes begin, including how screenshots become reusable planning artifacts.
```

Comportamento atteso:

- Agent descrive artifact di sessione.
- Agent spiega che immagini, mockup, browser capture e diagrammi restano evidenza grezza finché `Demo Vision UI` non li converte in `SlimUI v1` piu `Planner Notes`.
- Agent spiega che `session-brief.md` deve registrare anche artifact visuali generati quando influenzano scope o UX.
- Agent distingue materiale didattico da implementazione applicativa.
- Agent spiega perché metadata di approvazione contano.

Prompt discussione:

- Quale evidenza deve esistere prima che agent cambi codice?
- Quando una schermata va conservata solo come evidenza e quando va trasformata in artifact riusabile?
- Quali approvazioni devono essere registrate in file?
- Quali artifact sono utili e quali solo cerimonia?

Takeaway partecipante: artifact rendono lavoro agent riprendibile, revisionabile e governabile.

## Sessione 5: Skill come Moduli Workflow Riusabili

Obiettivo: insegnare quando un task ripetuto deve diventare skill.

Principio: impacchettare ragionamento ripetibile in moduli piccoli e trovabili.

Esempio repo da mostrare:

- [../.agents/skills/requirements-analysis/SKILL.md](../.agents/skills/requirements-analysis/SKILL.md)
- [../.agents/skills/implementation-planning/SKILL.md](../.agents/skills/implementation-planning/SKILL.md)
- [../.agents/skills/test-strategy/SKILL.md](../.agents/skills/test-strategy/SKILL.md)
- [../.agents/skills/plan-from-github-issue/SKILL.md](../.agents/skills/plan-from-github-issue/SKILL.md)

Tempi:

- 5 min: definisci prompt, skill e agent.
- 10 min: analizza frontmatter e procedura di una skill.
- 10 min: mostra come skill supportano ruolo senza sostituirlo e come delegano immagini a un agent specializzato.
- 10 min: partecipanti identificano workflow ripetibile nel proprio team.
- 5 min: bozza frase trigger di skill.
- 5 min: riepilogo.

Prompt demo live:

```text
/teach-agents use the requirements-analysis skill as an example to explain the anatomy of a good skill.
```

Comportamento atteso:

- Agent spiega trigger, procedura e output.
- Agent non avvia pianificazione app.
- Agent estrae pattern riusabile dalla skill.

Prompt discussione:

- Quale lavoro il tuo team ripete spesso?
- Deve essere prompt, skill o agent custom?
- Dove una skill deve preservare input grezzi e poi delegare trasformazione a un ruolo dedicato?
- Quale output deve produrre sempre la skill?

Takeaway partecipante: skill standardizzano pensiero ripetuto senza sovra-costruire agent.

## Sessione 6: Caricamento Conoscenza Limitato

Obiettivo: mostrare perché agent non devono leggere intero repo per default.

Principio: selezionare conoscenza per trigger e registrare cosa è stato caricato.

Esempio repo da mostrare:

- [../.github/agents/DemoPlanner.agent.md](../.github/agents/DemoPlanner.agent.md)
- [../docs/agents/common-knowledge.md](../docs/agents/common-knowledge.md)
- [../docs/agents/knowledge/README.md](../docs/agents/knowledge/README.md)

Tempi:

- 5 min: spiega contesto come budget limitato.
- 10 min: mostra gate di selezione conoscenza e gate di intake visuale prima della lettura ampia.
- 10 min: confronta bulk loading contro index-first loading.
- 10 min: partecipanti progettano mini indice conoscenza per proprio repo.
- 5 min: discuti come registrare conoscenza selezionata.
- 5 min: riepilogo.

Prompt demo live:

```text
/teach-agents explain bounded knowledge loading using the planner knowledge-selection gate. Do not inspect unrelated app folders.
```

Comportamento atteso:

- Agent identifica caricamento index-first.
- Agent spiega che visuali requirement-relevant passano prima da `Demo Vision UI`, poi diventano input testuale stabile per planner.
- Agent spiega perché scoperta delimitata migliora qualità.
- Agent evita esplorazione ampia dell app.

Prompt discussione:

- Quali documenti agent devono leggere per primi nel tuo repo?
- Quali input non devono essere solo letti ma prima normalizzati in un artifact dedicato?
- Cosa deve essere caricato solo su richiesta?
- Come agent deve registrare cio che seleziona?

Takeaway partecipante: contesto utile agente si seleziona, non si accumula.

## Sessione 7: Review, Tracciabilita e Adattamento

Obiettivo: aiutare partecipanti a progettare proprio sistema agentico minimo vitale.

Principio: revisionare sia output sia processo che lo ha prodotto.

Esempio repo da mostrare:

- [../.github/agents/DemoReviewer.agent.md](../.github/agents/DemoReviewer.agent.md)
- [../docs/agents/enforcement-spec.md](../docs/agents/enforcement-spec.md)
- [principles.md](principles.md)

Tempi:

- 5 min: riepiloga sei principi precedenti.
- 10 min: spiega review di processo contro review di codice.
- 10 min: mostra controlli handoff e revisione.
- 15 min: partecipanti preparano sistema base: regole, ruoli, artifact, skill, controlli.
- 5 min: discussione finale.

Prompt demo live:

```text
/teach-agents help me draft a starter agentic system checklist for a different team, using this repo only as an example.
```

Comportamento atteso:

- Agent fornisce checklist portabile.
- Agent evita copiare dettagli service desk come requisiti universali.
- Agent separa principi da scelte di implementazione.

Prompt discussione:

- Qual è il sistema minimo che tuo team può provare prossima settimana?
- Quali regole vale la pena far rispettare dopo?
- Come saprai che sistema sta aiutando?

Takeaway partecipante: sistema migliore è il più piccolo che previene in modo affidabile i failure reali del team.
