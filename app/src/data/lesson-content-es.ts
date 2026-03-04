import type { LessonContent } from "./lesson-content";

export const esLessons: LessonContent[] = [
  /* ── Contenido de lecciones de Fundamentos de Solana ── */
  {
    courseSlug: "solana-fundamentals",
    lessonId: "l1",
    title: "Que Hace Diferente a Solana",
    type: "video",
    markdown: `## Que Hace Diferente a Solana

Solana es una blockchain de alto rendimiento disenada para velocidad y escalabilidad. A diferencia del modelo de ejecucion secuencial de Ethereum, Solana procesa transacciones **en paralelo** utilizando un runtime llamado **Sealevel**.

### Innovaciones Clave

**Proof of History (PoH)**
Un reloj criptografico que marca las transacciones con una marca de tiempo antes de que entren al consenso. Esto significa que los validadores no necesitan ponerse de acuerdo sobre *cuando* ocurrio algo — ya lo saben.

\`\`\`
hash(previous_hash + data + timestamp) → next_hash
\`\`\`

**Sealevel — Ejecucion en Paralelo**
Las transacciones que no tocan las mismas cuentas pueden ejecutarse simultaneamente en los nucleos de la GPU. Por eso las transacciones de Solana deben declarar sus cuentas por adelantado.

**Tower BFT**
Un consenso PBFT optimizado que usa PoH como reloj, reduciendo la sobrecarga de comunicacion entre validadores.

### Numeros de Rendimiento

| Metrica | Solana | Ethereum |
|---------|--------|----------|
| Tiempo de bloque | ~400ms | ~12s |
| TPS (teorico) | 65,000 | ~15 |
| Finalidad | ~5s | ~15 min |
| Costo por Tx | ~$0.00025 | $1-50+ |

### Por Que Esto Importa para Desarrolladores

Como desarrollador de Solana, necesitas pensar de manera diferente:
- **Las cuentas son el modelo de datos** — todo es una cuenta
- **Los programas no tienen estado** — leen y escriben en cuentas
- **Las transacciones declaran cuentas** — habilitando la ejecucion en paralelo
- **El computo tiene presupuesto** — cada transaccion tiene un limite de unidades de computo

> En la proxima leccion, profundizaremos en el modelo de cuentas de Solana — la base de todo lo que construyas.
`,
  },
  {
    courseSlug: "solana-fundamentals",
    lessonId: "l2",
    title: "Cuentas y el Modelo de Cuentas",
    type: "reading",
    markdown: `## Cuentas y el Modelo de Cuentas

En Solana, **todo es una cuenta**. Programas, tokens, NFTs, datos de usuario — todo almacenado en cuentas. Entender el modelo de cuentas es el concepto mas importante para el desarrollo en Solana.

### Estructura de una Cuenta

Cada cuenta tiene estos campos:

\`\`\`rust
pub struct Account {
    pub lamports: u64,        // Balance in lamports (1 SOL = 1B lamports)
    pub data: Vec<u8>,        // Arbitrary data stored by the account
    pub owner: Pubkey,        // Program that owns this account
    pub executable: bool,     // Is this account a program?
    pub rent_epoch: u64,      // Next epoch rent is due
}
\`\`\`

### Reglas Clave

1. **Solo el propietario puede modificar datos** — un programa solo puede escribir en cuentas que le pertenecen
2. **Cualquiera puede acreditar lamports** — puedes enviar SOL a cualquier cuenta
3. **Solo el propietario puede debitar lamports** — solo el programa propietario puede deducir SOL
4. **Los datos solo pueden ser cambiados por el propietario** — el System Program es el propietario de las cuentas nuevas por defecto

### Tipos de Cuentas

| Tipo | Propietario | Proposito |
|------|-------------|-----------|
| System Account | System Program | Billeteras, balances de SOL |
| Program Account | BPF Loader | Codigo ejecutable del programa |
| Data Account | Tu Programa | Almacenamiento de estado para programas |
| Token Account | Token Program | Balances de tokens SPL |

### Creando Cuentas

Las cuentas deben ser creadas explicitamente y financiadas con rent:

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

Las cuentas deben mantener un balance minimo de SOL para permanecer en la cadena. Si el balance de una cuenta cae por debajo de este umbral, el runtime puede recolectarla como basura.

La formula: **~0.00089 SOL por byte por ano**, pero la mayoria de las cuentas se hacen **exentas de rent** depositando 2 anos de rent por adelantado.

> **Practica:** Calcula el rent para una cuenta de 100 bytes. Necesitaras \`connection.getMinimumBalanceForRentExemption(100)\`.
`,
  },
  {
    courseSlug: "solana-fundamentals",
    lessonId: "l3",
    title: "Rent y Ciclo de Vida de Cuentas",
    type: "reading",
    markdown: `## Rent y Ciclo de Vida de Cuentas

Cada cuenta en Solana debe pagar por el espacio que ocupa. Este mecanismo previene la acumulacion de estado y mantiene la red ligera.

### Exencion de Rent

En lugar de pagar rent cada epoch, las cuentas pueden depositar suficiente SOL para volverse **exentas de rent**. Esta es la practica estandar:

\`\`\`typescript
const rentExemptBalance = await connection.getMinimumBalanceForRentExemption(
  accountDataSize  // in bytes
);
\`\`\`

El balance minimo es aproximadamente **6.96 SOL por MB**, o alrededor de **0.00089 SOL por byte por ano** (x2 para exencion de rent).

### Ciclo de Vida de una Cuenta

\`\`\`
Create → Fund (rent-exempt) → Use → Close (reclaim SOL)
\`\`\`

1. **Crear**: Asignar espacio con \`SystemProgram.createAccount\`
2. **Financiar**: Debe depositar al menos el minimo de exencion de rent
3. **Usar**: El programa propietario lee/escribe datos
4. **Cerrar**: Transferir lamports, limpiar los datos → el runtime recolecta como basura

### Cerrando Cuentas

Cuando terminas con una cuenta, cierrala para recuperar el SOL:

\`\`\`rust
// In Anchor
#[account(
    mut,
    close = recipient,  // lamports go here
)]
pub data_account: Account<'info, MyData>,
\`\`\`

### Error Comun: Ataque de Reactivacion

Si cierras una cuenta pero no limpias sus datos, alguien podria "reactivarla" enviando lamports de vuelta. Siempre limpia los datos Y transfiere todos los lamports al cerrar.

> **Punto clave:** Siempre haz las cuentas exentas de rent. Siempre limpia los datos al cerrar cuentas.
`,
  },
  {
    courseSlug: "solana-fundamentals",
    lessonId: "l4",
    title: "Quiz: Conceptos Basicos de Cuentas",
    type: "challenge",
    markdown: `## Desafio: Conceptos Basicos de Cuentas

Pon a prueba tu comprension del modelo de cuentas de Solana. Completa la funcion que crea una nueva cuenta de datos para almacenar un valor de contador.

### Requisitos

1. Crear una nueva cuenta propiedad del programa
2. Hacerla exenta de rent
3. Asignar exactamente 8 bytes de espacio (para un contador u64)
4. Devolver la firma de la transaccion

### Pistas

- Usa \`SystemProgram.createAccount\` para crear la cuenta
- El espacio debe ser 8 bytes para un u64
- No olvides hacer que el pagador sea un firmante
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
      "Usa `connection.getMinimumBalanceForRentExemption(8)` para obtener los lamports requeridos.",
      "La instruccion `createAccount` necesita: fromPubkey, newAccountPubkey, lamports, space y programId.",
      "Tanto el pagador como la nueva cuenta necesitan firmar la transaccion.",
    ],
    testCases: [
      {
        name: "Crea la cuenta con el espacio correcto",
        input: "space = 8 bytes (u64 counter)",
        expected: "Account created with 8 bytes of data space",
      },
      {
        name: "La cuenta es exenta de rent",
        input: "lamports >= getMinimumBalanceForRentExemption(8)",
        expected: "Account balance meets rent-exempt threshold",
      },
      {
        name: "Propietario del programa correcto",
        input: "programId = PROGRAM_ID",
        expected: "Account owned by the target program",
      },
      {
        name: "Ambos firmantes incluidos",
        input: "signers = [payer, counterAccount]",
        expected: "Transaction signed by payer and new account",
      },
    ],
  },
  {
    courseSlug: "solana-fundamentals",
    lessonId: "l5",
    title: "Anatomia de una Transaccion",
    type: "video",
    markdown: `## Anatomia de una Transaccion

Cada interaccion con Solana pasa por una transaccion. Desglosemos exactamente que contiene una transaccion y como fluye a traves de la red.

### Estructura de una Transaccion

\`\`\`
Transaction
├── Message
│   ├── Header
│   │   ├── num_required_signatures
│   │   ├── num_readonly_signed
│   │   └── num_readonly_unsigned
│   ├── Account Keys []        ← todas las cuentas utilizadas
│   ├── Recent Blockhash       ← previene repeticion
│   └── Instructions []
│       ├── program_id_index   ← que programa llamar
│       ├── account_indexes [] ← que cuentas pasar
│       └── data []            ← datos de la instruccion
└── Signatures []              ← firmas ed25519
\`\`\`

### Por Que las Cuentas se Declaran por Adelantado

Esta es la clave de la ejecucion en paralelo de Solana. Al saber que cuentas toca cada transaccion, el runtime puede:

1. **Ejecutar transacciones que no se solapan en paralelo**
2. **Bloquear solo las cuentas necesarias**
3. **Detectar conflictos antes de la ejecucion**

\`\`\`
Tx A: [Account 1, Account 2]  ─┐
                                ├── Ejecutar en paralelo ✓
Tx B: [Account 3, Account 4]  ─┘

Tx C: [Account 1, Account 5]  ─┐
                                ├── Deben serializarse ✗
Tx D: [Account 1, Account 6]  ─┘
\`\`\`

### Ciclo de Vida de una Transaccion

\`\`\`
Build → Sign → Send → Process → Confirm → Finalize
\`\`\`

1. **Construir**: Crear instrucciones, establecer cuentas
2. **Firmar**: Todos los firmantes requeridos firman el mensaje
3. **Enviar**: Enviar a un nodo RPC
4. **Procesar**: El lider valida y ejecuta
5. **Confirmar**: El bloque se propaga a los validadores
6. **Finalizar**: 31+ confirmaciones (~13 segundos)

### Limites de Tamano

- Tamano maximo de transaccion: **1,232 bytes**
- Maximo de cuentas por transaccion: **64** (con lookup tables: 256)
- Maximo de instrucciones por transaccion: sin limite fijo, pero restringido por tamano y computo

> **A continuacion:** Construiremos transacciones desde cero y aprenderemos la codificacion de instrucciones.
`,
  },
  /* ── Lecciones de Desarrollo con Anchor ── */
  {
    courseSlug: "anchor-development",
    lessonId: "l1",
    title: "Por Que Anchor?",
    type: "video",
    markdown: `## Por Que Anchor?

Anchor es el framework dominante para el desarrollo de programas en Solana. Proporciona macros, validacion de cuentas, serializacion y manejo de errores listos para usar.

### Solana Nativo vs Anchor

**Sin Anchor** (nativo):
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

**Con Anchor**:
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

### Lo Que Anchor Te Ofrece

| Caracteristica | Beneficio |
|----------------|-----------|
| Macros de validacion de cuentas | Sin verificaciones manuales de firmante/propietario |
| Serializacion Borsh | (De)serializacion automatica |
| Generacion de IDL | Cliente TypeScript auto-generado |
| Manejo de errores | Errores tipados con codigos de error |
| Eventos | Registro de eventos en cadena |
| Helpers de CPI | Llamadas cross-program con tipado seguro |

### Cuando NO Usar Anchor

- **Optimizacion maxima de CU** — los programas nativos pueden ser mas eficientes
- **Layouts de cuentas no estandar** — se necesita serializacion personalizada
- **Aprender los fundamentos** — entender lo nativo te ayuda a depurar

> Anchor no reemplaza la comprension de Solana — acelera la construccion sobre ella.
`,
  },
  {
    courseSlug: "anchor-development",
    lessonId: "l4",
    title: "Programa Hola Mundo",
    type: "challenge",
    markdown: `## Desafio: Programa Hola Mundo

Construye tu primer programa en Anchor. Crea un contador simple que pueda ser inicializado e incrementado.

### Requisitos

1. Definir una estructura de cuenta \`Counter\` con un campo \`count: u64\`
2. Implementar \`initialize\` para crear el contador con count = 0
3. Implementar \`increment\` para sumar 1 al contador
4. Usar la validacion de cuentas adecuada de Anchor

### Consejos

- Usa \`#[account(init, payer = user, space = 8 + 8)]\` para la inicializacion
- Los primeros 8 bytes son el discriminador de cuenta
- Usa \`#[account(mut)]\` para la instruccion de incremento
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
      "La estructura Initialize necesita tres cuentas: counter (init), user (mut, Signer) y system_program.",
      "Usa `#[account(init, payer = user, space = 8 + 8)]` — 8 bytes para el discriminador + 8 para u64.",
      "Para increment, usa `checked_add(1)` para prevenir overflow — nunca uses `+= 1` en codigo on-chain.",
    ],
    testCases: [
      {
        name: "Estructura de cuenta Counter definida",
        input: "#[account] pub struct Counter",
        expected: "Counter has a `count: u64` field",
      },
      {
        name: "Initialize establece el contador en 0",
        input: "initialize(ctx)",
        expected: "counter.count == 0",
      },
      {
        name: "Increment suma 1",
        input: "increment(ctx) after initialize",
        expected: "counter.count == 1",
      },
      {
        name: "Usa aritmetica verificada",
        input: "checked_add(1)",
        expected: "Overflow returns ErrorCode::Overflow",
      },
      {
        name: "Init asigna el espacio correcto",
        input: "space = 8 + 8",
        expected: "8 bytes discriminator + 8 bytes u64",
      },
    ],
  },
];
