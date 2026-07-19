# Prompt per Progettare il Tuo Sistema Agentico

Usa questo prompt con un coding agent dentro il tuo repository. Obiettivo: produrre una prima versione concreta del sistema agentico del tuo team, non un documento generico.

```text
Voglio progettare un sistema agentico per questo repository.

Lavora come architetto di workflow agentico. Non modificare codice applicativo. Analizza solo struttura del repo, documentazione esistente, workflow di sviluppo e rischi operativi. Se devi creare file, crea solo documenti di proposta sotto una cartella dedicata, per esempio docs/agents/ o .agents/.

Prima di iniziare, chiarisci queste scelte con il team:

- Lingua output: genera tutto in inglese per default. Chiedi se il team vuole altra lingua per artifact, agent, skill, prompt e documentazione.
- Sistema sessioni: prima inferisci dal repository quale sistema il team sembra usare per issue, sessioni, tracking o knowledge retrieval. Cerca segnali come configurazioni MCP, riferimenti a GitHub Issue, Jira, Linear, Azure DevOps, Notion, tracker interni, cartelle sessions/ o documentazione workflow. Poi proponi il sistema piu coerente con evidenza trovata e chiedi conferma.
- Se non trovi segnali forti: non proporre un default. Chiedi quale sistema usare per sessioni, issue, bug, recupero contesto e collegamento decisioni. Offri una lista di opzioni: GitHub Issue con MCP, Jira con MCP, Linear con MCP, Azure DevOps con MCP, Notion con MCP, tracker interno con MCP, oppure file Markdown locali nel repo per tracking issue/bug e artifact, per esempio sessions/session-id/ o docs/issues/.

Usa questo metodo.

1. Trova i failure mode
   Identifica i 5 errori piu probabili quando agent AI aiutano questo team.
   Esempi: scope ambiguo, implementazione senza approvazione, contesto caricato male, test saltati, review debole, istruzioni in conflitto.

2. Definisci precedenza istruzioni
   Proponi dove mettere regole durevoli del team, regole di ruolo, skill riusabili e prompt ad hoc.
   Output richiesto: una gerarchia chiara tipo:
   - policy team
   - agent custom
   - skill workflow
   - prompt del task

3. Disegna modalita strette
   Identifica quali workflow meritano una modalita dedicata.
   Per ogni modalita scrivi:
   - quando si attiva
   - cosa puo fare
   - cosa non puo fare
   - quando deve fermarsi

4. Separa ruoli agent
   Proponi ruoli minimi per ridurre drift.
   Parti da questi, poi adatta al repo:
   - Planner: chiarisce requisito e produce artifact
   - Implementor: modifica codice solo da piano approvato
   - Tester: crea ed esegue strategia test
   - Reviewer: cerca bug, regressioni, rischi e gap rispetto al piano

5. Progetta artifact durevoli
   Definisci i file che permettono al team di riprendere lavoro senza memoria della chat.
   Includi almeno:
   - session-brief.md
   - requirements-analysis.md
   - spec.md
   - task-breakdown.md
   - implementation-plan.md
   - test-plan.md
   - review-report.md
   - changed-files.md

6. Metti gate dove il rischio e alto
   Proponi gate minimi.
   Almeno valuta:
   - approvazione umana prima di implementare
   - artifact completi prima di handoff
   - test verdi prima di review finale
   - revisioni obbligatorie per artifact gia approvati

7. Impacchetta lavoro ripetibile come skill
   Proponi skill con trigger chiaro, procedura corta e output noto.
   Esempi:
   - requirements-analysis
   - task-decomposition
   - implementation-planning
   - test-strategy
   - review-checklist

8. Crea indice conoscenza su richiesta
   Proponi una knowledge map che aiuti agent a leggere solo cio che serve.
   Non caricare tutto il repo per default.
   Output richiesto: lista di documenti conoscenza, trigger di lettura, e cosa ogni file deve contenere.

9. Definisci handoff envelope
   Crea formato standard per passaggio tra agent o fasi.
   Deve includere:
   - session id
   - from agent
   - to agent
   - current gate
   - approval state
   - required artifacts
   - open questions
   - blocking risks
   - definition of done for next agent

10. Produci piano file
   Prima di creare qualsiasi file, fai una sessione di grilling per chiudere gap non chiari. Fai domande dirette su rischi, proprietari, approvazioni, sistema sessioni, lingua, confini dei ruoli, artifact obbligatori e costo dei gate.
   Poi mostra un piano di generazione file in formato Markdown, come se fosse planning.md, ma senza ancora scriverlo su disco.
   Chiedi approvazione esplicita del piano. Non creare, modificare o spostare file finche il team non approva.
   Nel piano proponi file concreti da creare o aggiornare.
    Per ogni file indica:
    - path
    - scopo
    - contenuto essenziale
    - chi lo usa
    - quale failure mode previene

Vincoli:
- Non vendere il sistema come perfetto.
- Preferisci regole piccole, verificabili, facili da cambiare.
- Non aggiungere burocrazia senza rischio chiaro.
- Distingui sempre tra esempio specifico del repo e principio trasferibile.
- Se mancano informazioni, fai massimo 7 domande di chiarimento, ordinate per impatto.

Output finale richiesto:

1. Sommario dei failure mode
2. Proposta di gerarchia istruzioni
3. Modalita consigliate
4. Ruoli agent consigliati
5. Artifact e gate
6. Skill candidate
7. Knowledge map
8. Handoff envelope
9. Piano file iniziale
10. Tre esperimenti piccoli per validare sistema in una settimana
```

## Uso Rapido in Aula

Chiedi ai colleghi di lanciare il prompt nel proprio repository e portare tre output alla sessione successiva:

- i cinque failure mode principali del loro team
- un gate che blocca un errore costoso
- una skill che impacchetta lavoro ripetibile

Poi confrontate sistemi diversi. Buon segnale: non tutti avranno stessi ruoli, gate e artifact. Vuol dire che hanno progettato dal rischio reale, non copiato struttura demo.