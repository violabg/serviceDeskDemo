# Insegnare Sviluppo Agentico

Questa cartella contiene un pacchetto demo in sette sessioni per insegnare ai colleghi come costruire i propri sistemi di sviluppo agentico. Usa agent custom, skill, documenti di governance e workflow ad artifact di questo repository come esempio continuo, ma non e un corso sull applicazione service desk.

## Pubblico

- Sviluppatori intermedi che gia usano agent AI di coding o strumenti di coding via chat.
- Team lead che vogliono workflow agente ripetibili invece di prompt isolati.
- Ingegneri che devono adattare idee a proprio repository, dominio e profilo di rischio.

## Formato

- 7 sessioni
- 45 minuti per sessione
- Ogni sessione combina principio, artifact concreto del repo, prompt live ed esercizio di trasferimento.

## Cosa Insegna

Corso focalizzato su progettazione di sistemi di sviluppo agentico:

1. Come passare da prompt singoli a workflow governati.
2. Come gerarchia istruzioni e cambi modalita modellano comportamento agente.
3. Come separazione ruoli riduce drift.
4. Come artifact rendono tracciabili pianificazione, approvazione, implementazione, test e review.
5. Come skill impacchettano workflow ripetibili.
6. Come caricamento conoscenza limitato protegge qualita contesto.
7. Come review, handoff e regole di revisione rendono auditabile lavoro multi agente.

## Fuori Ambito

- Sviluppare feature service desk.
- Spiegare dettagli di implementazione Next.js, Prisma, Neon o UI.
- Modificare file sorgente applicazione.
- Insegnare questo repository come architettura prodotto.

I file service desk possono apparire solo come esempi quando illustrano un principio di sviluppo agentico.

## Guida Cartella

- [system-map.md](system-map.md) mappa sistema agentico custom.
- [principles.md](principles.md) spiega principi trasferibili.
- [facilitator-guide.md](facilitator-guide.md) fornisce sette sessioni didattiche da 45 minuti.
- [slide-outline.md](slide-outline.md) trasforma sessioni in struttura presentazione.
- [live-demo-script.md](live-demo-script.md) fornisce prompt esatti e comportamento atteso agente.

## Come Usare Questo Pacchetto

1. Leggi [system-map.md](system-map.md) per capire sistema di esempio.
2. Leggi [principles.md](principles.md) per separare idee portabili da dettagli specifici del repo.
3. Usa [facilitator-guide.md](facilitator-guide.md) per condurre sessioni.
4. Costruisci slide da [slide-outline.md](slide-outline.md).
5. Prova demo live da [live-demo-script.md](live-demo-script.md).

## Impostazione Didattica

Non presentare questo sistema come unica struttura corretta. Presentalo come esempio pratico di metodo piu ampio:

1. Identifica rischi nel processo di sviluppo del team.
2. Trasforma rischi in regole esplicite di workflow.
3. Separa ruoli agente dove contesto o autorita devono restare isolati.
4. Cattura decisioni come artifact.
5. Aggiungi skill riusabili per lavoro ripetibile.
6. Aggiungi enforcement solo dopo che workflow e chiaro.
