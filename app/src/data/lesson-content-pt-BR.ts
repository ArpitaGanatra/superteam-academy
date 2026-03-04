import type { LessonContent } from "./lesson-content";

export const ptBRLessons: LessonContent[] = [
  /* ── Curso: Fundamentos de Solana ── */
  {
    courseSlug: "solana-fundamentals",
    lessonId: "l1",
    title: "O Que Torna a Solana Diferente",
    type: "video",
    markdown: `## O Que Torna a Solana Diferente

Solana e uma blockchain de alto desempenho projetada para velocidade e escalabilidade. Diferente do modelo de execucao sequencial do Ethereum, a Solana processa transacoes **em paralelo** usando um runtime chamado **Sealevel**.

### Inovacoes Principais

**Proof of History (PoH)**
Um relogio criptografico que marca as transacoes com timestamp antes de entrarem no consenso. Isso significa que os validadores nao precisam concordar sobre *quando* algo aconteceu — eles ja sabem.

\`\`\`
hash(previous_hash + data + timestamp) -> next_hash
\`\`\`

**Sealevel — Execucao Paralela**
Transacoes que nao acessam as mesmas contas podem ser executadas simultaneamente em nucleos de GPU. Por isso as transacoes na Solana devem declarar suas contas antecipadamente.

**Tower BFT**
Um consenso PBFT otimizado que usa PoH como relogio, reduzindo a sobrecarga de comunicacao entre validadores.

### Numeros de Desempenho

| Metrica | Solana | Ethereum |
|---------|--------|----------|
| Tempo de bloco | ~400ms | ~12s |
| TPS (teorico) | 65.000 | ~15 |
| Finalidade | ~5s | ~15 min |
| Custo por tx | ~$0,00025 | $1-50+ |

### Por Que Isso Importa para Desenvolvedores

Como desenvolvedor Solana, voce precisa pensar de forma diferente:
- **Contas sao o modelo de dados** — tudo e uma conta
- **Programas sao stateless** — eles leem/escrevem em contas
- **Transacoes declaram contas** — permitindo execucao paralela
- **Computacao e orcada** — cada transacao tem um limite de unidades de computacao

> Na proxima licao, vamos mergulhar no modelo de contas da Solana — a base de tudo que voce constroi.
`,
  },
  {
    courseSlug: "solana-fundamentals",
    lessonId: "l2",
    title: "Contas e o Modelo de Contas",
    type: "reading",
    markdown: `## Contas e o Modelo de Contas

Na Solana, **tudo e uma conta**. Programas, tokens, NFTs, dados de usuarios — tudo armazenado em contas. Entender o modelo de contas e o conceito mais importante para o desenvolvimento na Solana.

### Estrutura de uma Conta

Toda conta possui estes campos:

\`\`\`rust
pub struct Account {
    pub lamports: u64,        // Balance in lamports (1 SOL = 1B lamports)
    pub data: Vec<u8>,        // Arbitrary data stored by the account
    pub owner: Pubkey,        // Program that owns this account
    pub executable: bool,     // Is this account a program?
    pub rent_epoch: u64,      // Next epoch rent is due
}
\`\`\`

### Regras Fundamentais

1. **Somente o proprietario pode modificar dados** — um programa so pode escrever em contas que ele possui
2. **Qualquer pessoa pode creditar lamports** — voce pode enviar SOL para qualquer conta
3. **Somente o proprietario pode debitar lamports** — apenas o programa proprietario pode deduzir SOL
4. **Dados so podem ser alterados pelo proprietario** — o System Program e o proprietario de novas contas por padrao

### Tipos de Conta

| Tipo | Proprietario | Finalidade |
|------|-------------|------------|
| System Account | System Program | Carteiras, saldos de SOL |
| Program Account | BPF Loader | Codigo executavel de programas |
| Data Account | Seu Programa | Armazenamento de estado para programas |
| Token Account | Token Program | Saldos de tokens SPL |

### Criando Contas

Contas devem ser criadas explicitamente e financiadas com rent:

\`\`\`typescript
const createAccountIx = SystemProgram.createAccount({
  fromPubkey: payer.publicKey,
  newAccountPubkey: newAccount.publicKey,
  lamports: await connection.getMinimumBalanceForRentExemption(dataSize),
  space: dataSize,
  programId: ownerProgram,
});
\`\`\`

### Rent

Contas devem manter um saldo minimo de SOL para permanecerem on-chain. Se o saldo de uma conta cair abaixo desse limite, o runtime pode fazer a coleta de lixo (garbage-collect) dela.

A formula: **~0,00089 SOL por byte por ano**, mas a maioria das contas e tornada **isenta de rent** depositando 2 anos de rent antecipadamente.

> **Pratique:** Calcule o rent para uma conta de 100 bytes. Voce vai precisar de \`connection.getMinimumBalanceForRentExemption(100)\`.
`,
  },
  {
    courseSlug: "solana-fundamentals",
    lessonId: "l3",
    title: "Rent e Ciclo de Vida de Contas",
    type: "reading",
    markdown: `## Rent e Ciclo de Vida de Contas

Toda conta na Solana deve pagar pelo espaco que ocupa. Esse mecanismo previne o inchaço de estado e mantem a rede enxuta.

### Isencao de Rent

Em vez de pagar rent a cada epoch, contas podem depositar SOL suficiente para se tornarem **isentas de rent**. Esta e a pratica padrao:

\`\`\`typescript
const rentExemptBalance = await connection.getMinimumBalanceForRentExemption(
  accountDataSize  // in bytes
);
\`\`\`

O saldo minimo e aproximadamente **6,96 SOL por MB**, ou cerca de **0,00089 SOL por byte por ano** (x2 para isencao de rent).

### Ciclo de Vida de uma Conta

\`\`\`
Create -> Fund (rent-exempt) -> Use -> Close (reclaim SOL)
\`\`\`

1. **Criar**: Alocar espaco com \`SystemProgram.createAccount\`
2. **Financiar**: Deve depositar pelo menos o minimo para isencao de rent
3. **Usar**: O programa proprietario le/escreve dados
4. **Fechar**: Transferir lamports para fora, zerar os dados -> runtime faz garbage collect

### Fechando Contas

Quando voce terminar de usar uma conta, feche-a para recuperar o SOL:

\`\`\`rust
// In Anchor
#[account(
    mut,
    close = recipient,  // lamports go here
)]
pub data_account: Account<'info, MyData>,
\`\`\`

### Armadilha Comum: Ataque de Ressurreicao

Se voce fechar uma conta mas nao zerar seus dados, alguem pode "ressuscita-la" enviando lamports de volta. Sempre zere os dados E transfira todos os lamports ao fechar.

> **Conclusao principal:** Sempre torne as contas isentas de rent. Sempre zere os dados ao fechar contas.
`,
  },
  {
    courseSlug: "solana-fundamentals",
    lessonId: "l4",
    title: "Quiz: Fundamentos de Contas",
    type: "challenge",
    markdown: `## Desafio: Fundamentos de Contas

Teste seu entendimento do modelo de contas da Solana. Complete a funcao que cria uma nova conta de dados para armazenar um valor de contador.

### Requisitos

1. Crie uma nova conta pertencente ao programa
2. Torne-a isenta de rent
3. Aloque exatamente 8 bytes de espaco (para um contador u64)
4. Retorne a assinatura da transacao

### Dicas

- Use \`SystemProgram.createAccount\` para criar a conta
- O espaco deve ser 8 bytes para um u64
- Nao esqueca de tornar o pagador um signatario
`,
    starterCode: `import {
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

const PROGRAM_ID = new PublicKey("YOUR_PROGRAM_ID");

async function createCounterAccount(
  connection: Connection,
  payer: Keypair
): Promise<string> {
  const counterAccount = Keypair.generate();

  // TODO: Calculate rent-exempt balance for 8 bytes


  // TODO: Create the transaction with createAccount instruction


  // TODO: Send and confirm the transaction


  // Return the transaction signature
}`,
    solutionCode: `import {
  Connection,
  Keypair,
  SystemProgram,
  Transaction,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

const PROGRAM_ID = new PublicKey("YOUR_PROGRAM_ID");

async function createCounterAccount(
  connection: Connection,
  payer: Keypair
): Promise<string> {
  const counterAccount = Keypair.generate();

  // Calculate rent-exempt balance for 8 bytes
  const lamports = await connection.getMinimumBalanceForRentExemption(8);

  // Create the transaction with createAccount instruction
  const tx = new Transaction().add(
    SystemProgram.createAccount({
      fromPubkey: payer.publicKey,
      newAccountPubkey: counterAccount.publicKey,
      lamports,
      space: 8,
      programId: PROGRAM_ID,
    })
  );

  // Send and confirm the transaction
  const signature = await sendAndConfirmTransaction(
    connection,
    tx,
    [payer, counterAccount]
  );

  return signature;
}`,
    hints: [
      "Use `connection.getMinimumBalanceForRentExemption(8)` para obter os lamports necessarios.",
      "A instrucao `createAccount` precisa de: fromPubkey, newAccountPubkey, lamports, space e programId.",
      "Tanto o pagador quanto a nova conta precisam assinar a transacao.",
    ],
    testCases: [
      {
        name: "Cria conta com o espaco correto",
        input: "space = 8 bytes (u64 counter)",
        expected: "Account created with 8 bytes of data space",
      },
      {
        name: "Conta e isenta de rent",
        input: "lamports >= getMinimumBalanceForRentExemption(8)",
        expected: "Account balance meets rent-exempt threshold",
      },
      {
        name: "Proprietario do programa correto",
        input: "programId = PROGRAM_ID",
        expected: "Account owned by the target program",
      },
      {
        name: "Ambos signatarios incluidos",
        input: "signers = [payer, counterAccount]",
        expected: "Transaction signed by payer and new account",
      },
    ],
  },
  {
    courseSlug: "solana-fundamentals",
    lessonId: "l5",
    title: "Anatomia de uma Transacao",
    type: "video",
    markdown: `## Anatomia de uma Transacao

Toda interacao com a Solana passa por uma transacao. Vamos detalhar exatamente o que uma transacao contem e como ela flui pela rede.

### Estrutura da Transacao

\`\`\`
Transaction
├── Message
│   ├── Header
│   │   ├── num_required_signatures
│   │   ├── num_readonly_signed
│   │   └── num_readonly_unsigned
│   ├── Account Keys []        <- todas as contas usadas
│   ├── Recent Blockhash       <- previne replay
│   └── Instructions []
│       ├── program_id_index   <- qual programa chamar
│       ├── account_indexes [] <- quais contas passar
│       └── data []            <- payload da instrucao
└── Signatures []              <- assinaturas ed25519
\`\`\`

### Por Que as Contas Sao Declaradas Antecipadamente

Esta e a chave para a execucao paralela da Solana. Ao saber quais contas cada transacao acessa, o runtime pode:

1. **Executar transacoes nao sobrepostas em paralelo**
2. **Bloquear apenas as contas necessarias**
3. **Detectar conflitos antes da execucao**

\`\`\`
Tx A: [Account 1, Account 2]  -┐
                                ├── Executam em paralelo ✓
Tx B: [Account 3, Account 4]  -┘

Tx C: [Account 1, Account 5]  -┐
                                ├── Devem serializar ✗
Tx D: [Account 1, Account 6]  -┘
\`\`\`

### Ciclo de Vida da Transacao

\`\`\`
Build -> Sign -> Send -> Process -> Confirm -> Finalize
\`\`\`

1. **Construir**: Criar instrucoes, definir contas
2. **Assinar**: Todos os signatarios obrigatorios assinam a mensagem
3. **Enviar**: Submeter a um no RPC
4. **Processar**: O lider valida e executa
5. **Confirmar**: O bloco se propaga para os validadores
6. **Finalizar**: 31+ confirmacoes (~13 segundos)

### Limites de Tamanho

- Tamanho maximo da transacao: **1.232 bytes**
- Maximo de contas por transacao: **64** (com lookup tables: 256)
- Maximo de instrucoes por transacao: sem limite rigido, mas restrito por tamanho e computacao

> **A seguir:** Vamos construir transacoes do zero e aprender codificacao de instrucoes.
`,
  },

  /* ── Curso: Desenvolvimento com Anchor ── */
  {
    courseSlug: "anchor-development",
    lessonId: "l1",
    title: "Por Que Anchor?",
    type: "video",
    markdown: `## Por Que Anchor?

Anchor e o framework dominante para desenvolvimento de programas na Solana. Ele fornece macros, validacao de contas, serializacao e tratamento de erros prontos para uso.

### Solana Nativa vs Anchor

**Sem Anchor** (nativo):
\`\`\`rust
pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8],
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let account = next_account_info(accounts_iter)?;

    // Manual validation...
    if !account.is_signer {
        return Err(ProgramError::MissingRequiredSignature);
    }
    if account.owner != program_id {
        return Err(ProgramError::IncorrectProgramId);
    }

    // Manual deserialization...
    let mut data = account.data.borrow_mut();
    let counter = u64::from_le_bytes(data[..8].try_into().unwrap());
    // ...
}
\`\`\`

**Com Anchor**:
\`\`\`rust
#[program]
pub mod counter {
    use super::*;

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        ctx.accounts.counter.count += 1;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut)]
    pub counter: Account<'info, Counter>,
}
\`\`\`

### O Que o Anchor Oferece

| Recurso | Beneficio |
|---------|-----------|
| Macros de validacao de contas | Sem verificacoes manuais de signatario/proprietario |
| Serializacao Borsh | (De)serializacao automatica |
| Geracao de IDL | Cliente TypeScript gerado automaticamente |
| Tratamento de erros | Erros tipados com codigos de erro |
| Eventos | Registro de eventos on-chain |
| Helpers de CPI | Chamadas cross-program type-safe |

### Quando NAO Usar Anchor

- **Otimizacao maxima de CU** — programas nativos podem ser mais eficientes
- **Layouts de conta nao padrao** — serializacao customizada necessaria
- **Aprendendo fundamentos** — entender o nativo ajuda voce a debugar

> Anchor nao substitui o entendimento da Solana — ele acelera a construcao sobre ela.
`,
  },
  {
    courseSlug: "anchor-development",
    lessonId: "l4",
    title: "Programa Hello World",
    type: "challenge",
    markdown: `## Desafio: Programa Hello World

Construa seu primeiro programa Anchor. Crie um contador simples que pode ser inicializado e incrementado.

### Requisitos

1. Defina uma struct de conta \`Counter\` com um campo \`count: u64\`
2. Implemente \`initialize\` para criar o contador com count = 0
3. Implemente \`increment\` para adicionar 1 ao contador
4. Use validacao de contas Anchor adequada

### Dicas

- Use \`#[account(init, payer = user, space = 8 + 8)]\` para inicializacao
- Os primeiros 8 bytes sao o discriminador de conta
- Use \`#[account(mut)]\` para a instrucao de incremento
`,
    starterCode: `use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        // TODO: Set the counter to 0
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        // TODO: Increment the counter by 1
        Ok(())
    }
}

// TODO: Define the Initialize accounts struct


// TODO: Define the Increment accounts struct


// TODO: Define the Counter account struct
`,
    solutionCode: `use anchor_lang::prelude::*;

declare_id!("11111111111111111111111111111111");

#[program]
pub mod counter {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = 0;
        Ok(())
    }

    pub fn increment(ctx: Context<Increment>) -> Result<()> {
        let counter = &mut ctx.accounts.counter;
        counter.count = counter.count.checked_add(1)
            .ok_or(ErrorCode::Overflow)?;
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(init, payer = user, space = 8 + 8)]
    pub counter: Account<'info, Counter>,
    #[account(mut)]
    pub user: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Increment<'info> {
    #[account(mut)]
    pub counter: Account<'info, Counter>,
}

#[account]
pub struct Counter {
    pub count: u64,
}

#[error_code]
pub enum ErrorCode {
    #[msg("Counter overflow")]
    Overflow,
}`,
    hints: [
      "A struct Initialize precisa de tres contas: counter (init), user (mut, Signer) e system_program.",
      "Use `#[account(init, payer = user, space = 8 + 8)]` — 8 bytes para o discriminador + 8 para u64.",
      "Para o incremento, use `checked_add(1)` para prevenir overflow — nunca use `+= 1` em codigo on-chain.",
    ],
    testCases: [
      {
        name: "Struct de conta Counter definida",
        input: "#[account] pub struct Counter",
        expected: "Counter has a `count: u64` field",
      },
      {
        name: "Initialize define o contador como 0",
        input: "initialize(ctx)",
        expected: "counter.count == 0",
      },
      {
        name: "Increment adiciona 1",
        input: "increment(ctx) after initialize",
        expected: "counter.count == 1",
      },
      {
        name: "Usa aritmetica verificada",
        input: "checked_add(1)",
        expected: "Overflow returns ErrorCode::Overflow",
      },
      {
        name: "Init aloca o espaco correto",
        input: "space = 8 + 8",
        expected: "8 bytes discriminator + 8 bytes u64",
      },
    ],
  },
];
