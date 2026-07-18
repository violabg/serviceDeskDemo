# Scaletta Slide

Usa questa scaletta per costruire un deck conciso per sette sessioni da 45 minuti. Ogni sessione deve mantenere visibile un principio centrale.

## Sessione 1: Da Prompt a Sistemi

1. Titolo: Da prompt utili a workflow affidabili
2. Problema: prompt isolati non preservano scope, autorita o evidenza
3. Concetto: progettare dai failure mode
4. Artifact repo: [../docs/agents/governance.md](../docs/agents/governance.md)
5. Pattern: rischio -> regola -> artifact -> controllo
6. Esercizio: elenca tre failure agente che team vuole prevenire
7. Takeaway: sistema agentico e risposta a rischio di workflow

## Sessione 2: Gerarchia Istruzioni e Modalita

1. Titolo: Chi vince quando istruzioni confliggono?
2. Problema: ultimo prompt non e sempre autorita corretta
3. Concetto: precedenza esplicita
4. Artifact repo: [../AGENTS.md](../AGENTS.md)
5. Esempi modalita: `customize agents`, modalita intake, `teach agents`
6. Esercizio: progetta uno switch di modalita per tuo repo
7. Takeaway: modalita sono rami deliberati, non eccezioni accidentali

## Sessione 3: Separazione Ruoli

1. Titolo: Un agent, molti lavori, troppo drift
2. Problema: pianificazione, coding, test e review si confondono
3. Concetto: isolare responsabilita e permessi
4. Artifact repo: file agent planner, implementor, tester, reviewer
5. Pattern: ogni ruolo possiede una transizione e un output
6. Esercizio: abbozza ruoli del tuo team
7. Takeaway: separa ruoli dove cambia autorita

## Sessione 4: Artifact e Gate di Approvazione

1. Titolo: Chat non basta come evidenza
2. Problema: decisioni spariscono tra sessioni
3. Concetto: artifact durevoli e metadata di approvazione
4. Artifact repo: [../.agents/skills/artifact-workflow/SKILL.md](../.agents/skills/artifact-workflow/SKILL.md)
5. Pattern: pacchetto artifact piu campi approvazione espliciti
6. Esercizio: scegli artifact minimi utili per un workflow
7. Takeaway: transizioni ad alto rischio richiedono autorita registrata

## Sessione 5: Skill come Moduli Workflow Riusabili

1. Titolo: Ragionamento ripetibile merita modulo
2. Problema: team rispiega stesso processo in ogni prompt
3. Concetto: skill impacchettano procedure delimitate
4. Artifact repo: skill di requisiti, planning, task e test
5. Pattern: trigger + procedura + forma output
6. Esercizio: bozza descrizione di una skill per tuo team
7. Takeaway: usa skill per workflow ripetuti, agent per ruoli isolati

## Sessione 6: Caricamento Conoscenza Limitato

1. Titolo: Piu contesto non e sempre contesto migliore
2. Problema: esplorazione ampia brucia attenzione e introduce rumore
3. Concetto: caricamento conoscenza index-first e trigger-based
4. Artifact repo: [../.github/agents/DemoPlanner.agent.md](../.github/agents/DemoPlanner.agent.md)
5. Pattern: leggi indice -> seleziona conoscenza rilevante -> registra selezione
6. Esercizio: progetta mini indice conoscenza
7. Takeaway: agent devono selezionare conoscenza in modo deliberato

## Sessione 7: Review, Tracciabilita e Adattamento

1. Titolo: Revisiona lavoro e workflow
2. Problema: output bello puo nascere da processo rotto
3. Concetto: review conformita, handoff, revisioni, enforcement
4. Artifact repo: [../.github/agents/DemoReviewer.agent.md](../.github/agents/DemoReviewer.agent.md), [../docs/agents/enforcement-spec.md](../docs/agents/enforcement-spec.md)
5. Pattern: controlli output piu controlli processo
6. Esercizio: bozza sistema agentico minimo vitale per tuo team
7. Takeaway: inizia piccolo, enforcement dopo, migliora da evidenza

## Slide di Chiusura

Titolo: Costruisci dai bisogni del tuo team

Punti:

- Non copiare questo sistema alla cieca.
- Copia domande di progettazione.
- Parti dai failure mode.
- Aggiungi solo ruoli, artifact, skill e gate che riducono rischio reale.
- Mantieni sistema insegnabile, ispezionabile e facile da rivedere.
