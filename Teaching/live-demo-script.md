# Script Demo Live

Questo script fornisce prompt esatti e comportamento atteso per sette sessioni didattiche. Usa i prompt come scritti durante demo, poi fermati per spiegare cosa ha fatto agent e perché.

Tutte le sessioni usano la skill `/teach-agents` per attivare la modalità materiale didattico. In questa modalità, l'agent deve migliorare o spiegare file sotto `Teaching/` ed evitare normale sviluppo applicazione service desk.

## Controllo Sicurezza Demo

Prompt:

```text
/teach-agents explain what mode you are in and what files you are allowed to modify.
```

Comportamento atteso:

- Agent dice che è in modalità materiale didattico.
- Agent dice che lavoro deve concentrarsi su lezioni/file in `Teaching/`.
- Agent non chiede session ID service desk.
- Agent non pianifica cambi codice applicativo.

Nota didattica: esegui questo per primo se pubblico deve vedere perché le modalità esplicite contano.

## Demo Sessione 1: Da Prompt a Sistemi

Prompt:

```text
/teach-agents inspect the custom agentic system at a high level and explain which failure modes it is designed to prevent. Do not inspect app feature code.
```

Comportamento atteso:

- Legge o cita file sistema agentico come `AGENTS.md`, `.github/agents/`, `.agents/skills/`, `docs/agents/`.
- Nomina failure mode: approvazione saltata, caricamento contesto troppo ampio, ownership ruoli poco chiara, evidenza mancante, conflitti tra istruzioni.
- Spiega che sistema è risposta a questi failure.

Pausa facilitatore:

Chiedi ai partecipanti di nominare un failure visto nel proprio team. Mappalo a un controllo: istruzione, ruolo, artifact, skill o enforcement.

## Demo Sessione 2: Gerarchia Istruzioni e Modalità

Prompt:

```text
/teach-agents improve the explanation of mode switches in Teaching/principles.md. Keep the work inside Teaching/.
```

Comportamento atteso:

- Modifica solo file `Teaching/` se richiesta implementazione.
- Spiega `/teach-agents` come skill che attiva una modalità, non come richiesta feature normale.
- Non tocca cartelle applicative.

Pausa facilitatore:

Mostra [../AGENTS.md](../AGENTS.md). Evidenzia come la modalità definisce cosa è permesso e cosa è vietato.

## Demo Sessione 3: Separazione Ruoli

Prompt:

```text
/teach-agents explain why the Demo Planner should not implement code and why the Demo Implementor should work from approved artifacts.
```

Comportamento atteso:

- Cita [../.github/agents/DemoPlanner.agent.md](../.github/agents/DemoPlanner.agent.md) e [../.github/agents/DemoImplementor.agent.md](../.github/agents/DemoImplementor.agent.md).
- Cita che autorità di pianificazione e autorità di implementazione sono diverse.
- Spiega che metadata di approvazione proteggono transizione verso implementazione.

Pausa facilitatore:

Chiedi ai partecipanti dove nel loro workflow attuale cambia autorità senza essere esplicitato.

## Demo Sessione 4: Artifact e Gate di Approvazione

Prompt:

```text
/teach-agents show what artifacts a healthy agentic development workflow should produce before code changes begin.
```

Comportamento atteso:

- Elenca artifact come session brief, requirements analysis, specification, task breakdown, implementation plan, test plan.
- Spiega metadata di approvazione.
- Distingue artifact di sessione da documenti committati nel repository.

Pausa facilitatore:

Chiedi quali artifact sono essenziali nell ambiente dei partecipanti e quali sarebbero cerimonia inutile.

## Demo Sessione 5: Skill come Moduli Workflow Riusabili

Prompt:

```text
/teach-agents use the requirements-analysis skill as an example to explain the anatomy of a good skill.
```

Comportamento atteso:

- Spiega una skill come trigger più procedura più contratto output.
- Cita che skill sono utili per workflow ripetuti.
- Evita di trasformare spiegazione in analisi requisiti service desk.

Pausa facilitatore:

Fai scrivere ai partecipanti una descrizione skill con questa forma:

```text
Use when: <trigger phrase and task context>.
Output: <artifact or decision the skill should produce>.
Procedure: <short sequence of steps>.
```

## Demo Sessione 6: Caricamento Conoscenza Limitato

Prompt:

```text
/teach-agents explain bounded knowledge loading using the planner knowledge-selection gate. Do not inspect unrelated app folders.
```

Comportamento atteso:

- Spiega lettura index-first.
- Spiega selezione basata su trigger.
- Spiega perché conoscenza selezionata va registrata.
- Evita esplorazione ampia app.

Pausa facilitatore:

Chiedi ai partecipanti di identificare primi tre documenti che agent deve leggere nel loro repo e tre documenti da caricare solo su richiesta.

## Demo Sessione 7: Review, Tracciabilita e Adattamento

Prompt:

```text
/teach-agents help me draft a starter agentic system checklist for a different team, using this repo only as an example.
```

Comportamento atteso:

- Produce checklist portabile.
- Separa principi da implementazione specifica service desk.
- Include regole, ruoli, artifact, skill e controlli review.

Pausa facilitatore:

Chiedi ai partecipanti di scegliere versione minima praticabile da provare prossima settimana.

## Demo Opzionale di Chiusura

Prompt:

```text
/teach-agents review Teaching/ for consistency across the seven sessions. Report mismatched session names, missing principles, and any places that drift into app implementation details.
```

Comportamento atteso:

- Revisiona solo file didattici.
- Riporta problemi documentazione e incoerenze.
- Non esegue test app e non ispeziona codice feature salvo richiesta esplicita.

## Cosa Osservare Durante Demo

Segnali buoni:

- Agent dichiara scope prima di agire.
- Agent tocca solo materiale didattico.
- Agent usa file di sistema come esempi senza trasformare demo in sviluppo app.
- Agent separa principi portabili da dettagli specifici repository.

Segnali di allarme:

- Agent chiede session ID service desk.
- Agent inizia pianificazione implementazione app.
- Agent modifica file sorgente applicazione.
- Agent tratta ogni termine specifico repo come principio universale.

Se compare un segnale di allarme, ferma e chiedi:

```text
/teach-agents reset to teaching-material mode and explain the allowed scope before continuing.
```
