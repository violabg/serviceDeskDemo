# Principi di Sviluppo Agentico

Questi principi sono idee portabili dietro sistema demo. File del repository sono esempi, non prescrizioni.

## 1. Parti Dai Failure Mode

Un sistema agentico deve rispondere a domanda pratica: cosa continua ad andare storto quando agent aiutano sviluppo?

Failure mode comuni:

- Agent implementa prima che team concordi su scope.
- Agent legge troppo e perde contesto importante.
- Agent mescola pianificazione, coding, test e review in una sola conversazione non tracciabile.
- Agent tratta approvazione in chat come sufficiente, anche senza record durevole.
- Agent segue istruzione più recente invece di istruzione con autorità corretta.

Esempio: [../docs/agents/governance.md](../docs/agents/governance.md) trasforma failure mode in policy esplicite per approvazione, isolamento ruoli, artifact di sessione, validazione e violazioni regole.

Domanda di trasferimento: quali sono i cinque errori agente principali che team vuole prevenire?

## 2. Rendi Esplicita la Precedenza Istruzioni

Gli agent hanno bisogno di modo per risolvere istruzioni in conflitto. Senza modello di precedenza, ogni nuovo prompt può sovrascrivere per errore una regola più importante.

Esempio: [../AGENTS.md](../AGENTS.md) e [../docs/agents/governance.md](../docs/agents/governance.md) definiscono ordine: istruzioni root, agent custom, skill custom, skill non custom e prompt ad hoc.

Pattern riusabile:

```text
Autorità alta: policy durevole del team
Autorità media: file di ruolo e workflow
Autorità bassa: testo prompt specifico del task
```

Domanda di trasferimento: dove deve mettere team regole che devono sopravvivere a ogni conversazione?

## 3. Usa Modalità per Cambiare Workflow in Modo Deliberato

Una modalità è un ramo esplicito di comportamento. Permette ad agent di dire: "questa richiesta non è lavoro applicativo normale".

Esempi in [../AGENTS.md](../AGENTS.md):

- La skill `/customize-agents` attiva la modalità di manutenzione del sistema agent.
- Le skill `/create-user-story` e `/create-bug` attivano la modalità intake.
- La skill `/teach-agents` attiva la modalità materiale didattico.

Le buone modalità sono strette. Definiscono cosa è permesso, cosa è vietato e quando la modalità finisce.

Domanda di trasferimento: quali workflow nel tuo repo meritano una modalità dedicata invece di condividere il percorso di sviluppo predefinito?

## 4. Separa Ruoli per Ridurre Drift

Un agent può fare molte cose, ma una conversazione non deve cambiare autorità in silenzio. Separazione ruoli da un lavoro chiaro a ogni fase.

Ruoli di esempio:

- [../.github/agents/DemoPlanner.agent.md](../.github/agents/DemoPlanner.agent.md): crea artifact e chiede approvazione.
- [../.github/agents/DemoImplementor.agent.md](../.github/agents/DemoImplementor.agent.md): implementa solo piani approvati.
- [../.github/agents/DemoTester.agent.md](../.github/agents/DemoTester.agent.md): valida comportamento atteso.
- [../.github/agents/DemoReviewer.agent.md](../.github/agents/DemoReviewer.agent.md): revisiona conformita, difetti e rischio.

Domanda di trasferimento: quali parti del workflow non devono essere fatte dallo stesso agent nello stesso passaggio?

## 5. Rendi Artifact Fonte di Continuita

Chat e utile, ma artifact preservano stato. Un buon workflow agentico scrive decisioni importanti in file stabili.

Pacchetto artifact di esempio:

```text
sessions/<session-id>/
  session-brief.md
  requirements-analysis.md
  clarification-questions.md
  spec.md
  task-breakdown.md
  implementation-plan.md
  test-plan.md
  review-report.md
  changed-files.md
```

[../.agents/skills/artifact-workflow/SKILL.md](../.agents/skills/artifact-workflow/SKILL.md) definisce regole artifact. Principio chiave: ogni fase ha output che fase successiva può ispezionare.

Domanda di trasferimento: quali file permettono al team di riprendere lavoro senza dipendere dalla memoria di un thread chat?

## 6. Metti Gate nelle Transizioni ad Alto Rischio

Un gate è un punto di controllo esplicito che blocca l'avanzamento di un agent finché una condizione non è soddisfatta. Non ogni passaggio richiede un gate. Le transizioni ad alto rischio sì.

### Perché i Gate Esistono

Senza gate, un agent può:

- implementare prima che il team concordi sul piano
- cambiare codice senza approvazione esplicita registrata
- attraversare confini di responsabilità senza lasciare traccia
- ignorare evidenza mancante perché nessun controllo la richiede

Il gate trasforma una conversazione informale in un impegno verificabile.

### Tipi di Gate

**Gate di approvazione**: richiede che un umano approvi esplicitamente un artifact prima che l'agent possa avanzare. Esempio: il piano di implementazione deve essere approvato prima che l'implementor possa iniziare.

**Gate di artifact**: richiede che uno o più artifact esistano e siano completi. Esempio: spec, task-breakdown e implementation-plan devono esistere prima che il tester possa creare il test-plan.

**Gate di qualità**: richiede che un controllo automatico passi. Esempio: test verdi e build pulita prima che il reviewer approvi.

**Gate di handoff**: richiede che il mittente registri esplicitamente cosa ha fatto, cosa manca e cosa è il definition of done per il destinatario.

### Come i Gate Sono Implementati in Questo Sistema

In questo sistema, implementazione non può iniziare finché:

- l'utente non approva esplicitamente il piano di implementazione
- i metadata di approvazione non sono registrati nel set artifact

Campi esempio approvazione:

```text
Approved: true
Approved By:
Approved At:
Source Message:
```

Il campo `Source Message` cattura il messaggio chat che ha dato l'approvazione. Questo collega il gate all'evidenza originale.

### Anti-Pattern da Evitare

- **Approvazione implicita**: l'agent interpreta il silenzio o un messaggio generico come approvazione. Non è un gate.
- **Chat come unica evidenza**: la cronologia chat può essere persa o fraintesa. I gate richiedono artifact durevoli.
- **Gate ovunque**: troppi gate rallentano il workflow senza ridurre rischio reale. Un gate serve dove il costo di un errore è alto.

### Progettare i Gate Giusti

Fai questa domanda per ogni transizione: se l'agent sbagliasse qui, quanto costerebbe correggerlo? Se il costo è alto, metti un gate. Se è basso, lascia l'agent procedere.

Principio: un gate non è burocrazia. Un gate è rendere durevole l'autorità prima che l'agent cambi codice.

Domanda di trasferimento: dove un umano deve approvare esplicitamente prima che l'agent possa continuare? Dove basta un artifact completo?

## 7. Impacchetta Ragionamento Ripetibile come Skill

Una skill è un modulo workflow riusabile. È più strutturata di un prompt e più leggera di un agent custom completo.

Esempi:

- [../.agents/skills/requirements-analysis/SKILL.md](../.agents/skills/requirements-analysis/SKILL.md) per grooming e analisi ambiguita.
- [../.agents/skills/task-decomposition/SKILL.md](../.agents/skills/task-decomposition/SKILL.md) per trasformare spec in task.
- [../.agents/skills/implementation-planning/SKILL.md](../.agents/skills/implementation-planning/SKILL.md) per piani a livello file.
- [../.agents/skills/test-strategy/SKILL.md](../.agents/skills/test-strategy/SKILL.md) per copertura validazione.

Una skill utile ha trigger chiaro, procedura delimitata e output noto.

Domanda di trasferimento: cosa ripetono i tuoi agent abbastanza spesso da meritare una skill?

## 8. Carica Conoscenza Su Richiesta

Contesto è una risorsa scarsa. Un buon sistema aiuta agent a scegliere conoscenza rilevante invece di caricare ogni file.

Esempio: [../.github/agents/DemoPlanner.agent.md](../.github/agents/DemoPlanner.agent.md) istruisce planner a leggere prima indice conoscenza e selezionare solo file rilevanti.

Regola riusabile:

```text
Leggi indice.
Seleziona per trigger.
Registra cosa hai selezionato.
Non fare bulk-load per default.
```

Domanda di trasferimento: quale conoscenza deve essere indicizzata per permettere ad agent di sceglierla in modo deliberato?

## 9. Usa Handoff Envelope

Un handoff envelope è un contratto tra fasi. Evita che un agent indovini cosa ha fatto altro agent.

Campi minimi in questo sistema:

```text
Session ID
From Agent
To Agent
Current Gate
Approval State
Required Artifacts
Open Questions
Blocking Risks
Definition of Done for Next Agent
```

Principio semplice: ogni handoff deve dire al prossimo agent cosa e vero, cosa manca e cosa significa fatto.

Domanda di trasferimento: cosa deve sapere prossimo agent prima di poter continuare in sicurezza?

## 10. Preserva Tracciabilita con Revisioni

Artifact approvati non devono essere riscritti in silenzio. Se cambiano, crea revisione e spiega motivo.

Policy esempio: [../docs/agents/governance.md](../docs/agents/governance.md) dice che artifact approvati sono immutabili e revisioni devono collegarsi a versioni precedenti.

Domanda di trasferimento: quali record nel workflow devono diventare immutabili dopo approvazione?

## Ciclo di Progettazione Centrale

Usa questo ciclo quando costruisci tuo sistema:

1. Nomina failure mode.
2. Decidi se serve istruzione, separazione ruoli, evidenza artifact, una skill o enforcement.
3. Scrivi regola più piccola che previene failure.
4. Testa regola in workflow reale.
5. Promuovi regola a documentazione durevole solo quando dimostra valore.
