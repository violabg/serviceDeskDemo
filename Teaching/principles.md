# Principi di Sviluppo Agentico

Questi principi sono idee portabili dietro sistema demo. File del repository sono esempi, non prescrizioni.

## 1. Parti Dai Failure Mode

Un sistema agentico deve rispondere a domanda pratica: cosa continua ad andare storto quando agent aiutano sviluppo?

Failure mode comuni:

- Agent implementa prima che team concordi su scope.
- Agent legge troppo e perde contesto importante.
- Agent mescola pianificazione, coding, test e review in una sola conversazione non tracciabile.
- Agent tratta approvazione in chat come sufficiente, anche senza record durevole.
- Agent segue istruzione piu recente invece di istruzione con autorita corretta.

Esempio: [../docs/agents/governance.md](../docs/agents/governance.md) trasforma failure mode in policy esplicite per approvazione, isolamento ruoli, artifact di sessione, validazione e violazioni regole.

Domanda di trasferimento: quali sono i cinque errori agente principali che team vuole prevenire?

## 2. Rendi Esplicita la Precedenza Istruzioni

Gli agent hanno bisogno di modo per risolvere istruzioni in conflitto. Senza modello di precedenza, ogni nuovo prompt puo sovrascrivere per errore regola piu importante.

Esempio: [../AGENTS.md](../AGENTS.md) e [../docs/agents/governance.md](../docs/agents/governance.md) definiscono ordine: istruzioni root, agent custom, skill custom, skill non custom e prompt ad hoc.

Pattern riusabile:

```text
Autorita alta: policy durevole del team
Autorita media: file di ruolo e workflow
Autorita bassa: testo prompt specifico del task
```

Domanda di trasferimento: dove deve mettere team regole che devono sopravvivere a ogni conversazione?

## 3. Usa Modalita per Cambiare Workflow in Modo Deliberato

Una modalita e ramo esplicito di comportamento. Permette ad agent di dire: "questa richiesta non e lavoro applicativo normale".

Esempi in [../AGENTS.md](../AGENTS.md):

- `customize agents` entra in modalita manutenzione sistema agent.
- `/create-user-story` e `/create-bug` entrano in modalita intake.
- `teach agents` entra in modalita materiale didattico.

Buone modalita sono strette. Definiscono cosa e permesso, cosa e vietato e quando modalita finisce.

Domanda di trasferimento: quali workflow nel tuo repo meritano modalita dedicata invece di condividere percorso di sviluppo predefinito?

## 4. Separa Ruoli per Ridurre Drift

Un agent puo fare molte cose, ma una conversazione non deve cambiare autorita in silenzio. Separazione ruoli da un lavoro chiaro a ogni fase.

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

[../.agents/skills/artifact-workflow/SKILL.md](../.agents/skills/artifact-workflow/SKILL.md) definisce regole artifact. Principio chiave: ogni fase ha output che fase successiva puo ispezionare.

Domanda di trasferimento: quali file permettono al team di riprendere lavoro senza dipendere dalla memoria di un thread chat?

## 6. Metti Gate nelle Transizioni ad Alto Rischio

Non ogni passaggio richiede approvazione. Le transizioni pericolose si.

In questo sistema, implementazione non puo iniziare finche:

- utente non approva esplicitamente piano di implementazione
- metadata di approvazione non sono registrati nel set artifact

Campi esempio approvazione:

```text
Approved: true
Approved By:
Approved At:
Source Message:
```

Principio non e burocrazia. Principio e rendere durevole autorita prima che agent cambi codice.

Domanda di trasferimento: dove un umano deve approvare esplicitamente prima che agent possa continuare?

## 7. Impacchetta Ragionamento Ripetibile come Skill

Una skill e modulo workflow riusabile. E piu strutturata di un prompt e piu leggera di un agent custom completo.

Esempi:

- [../.agents/skills/requirements-analysis/SKILL.md](../.agents/skills/requirements-analysis/SKILL.md) per grooming e analisi ambiguita.
- [../.agents/skills/task-decomposition/SKILL.md](../.agents/skills/task-decomposition/SKILL.md) per trasformare spec in task.
- [../.agents/skills/implementation-planning/SKILL.md](../.agents/skills/implementation-planning/SKILL.md) per piani a livello file.
- [../.agents/skills/test-strategy/SKILL.md](../.agents/skills/test-strategy/SKILL.md) per copertura validazione.

Una skill utile ha trigger chiaro, procedura delimitata e output noto.

Domanda di trasferimento: cosa ripetono i tuoi agent abbastanza spesso da meritare una skill?

## 8. Carica Conoscenza Su Richiesta

Contesto e risorsa scarsa. Un buon sistema aiuta agent a scegliere conoscenza rilevante invece di caricare ogni file.

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

Un handoff envelope e contratto tra fasi. Evita che un agent indovini cosa ha fatto altro agent.

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
3. Scrivi regola piu piccola che previene failure.
4. Testa regola in workflow reale.
5. Promuovi regola a documentazione durevole solo quando dimostra valore.
