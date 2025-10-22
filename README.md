### Structure

- **apps/**: Contains deployable applications (e.g., `api`, `client`)
- **packages/**: Contains shared packages (e.g., `eslint-config`, `typescript-config`)

### Commands
Start local development servers for all apps
```sh
turbo run dev
```

Start linting all relevant codebases
```sh
turbo run lint
```

Start tests across the repo
```sh
turbo run test
```

Build all apps and packages in topological order
```sh
turbo run build
```

You can also run commands in specific apps/packages:
```sh
turbo run build --filter=client
turbo run dev --filter=api
```

## OTP with email
you should get email from authentication@notification.dynamicauth.com, with one time password for app called "self".
![Alt text](.github/images/otp-email-example-email.png)

## The better auth flow for such apps should be:
```mermaid
sequenceDiagram
    participant User
    participant Client as Client App
    participant Wallet as Ethereum Wallet
    participant Server as Private API Server

    Note over User,Server: 1. Initiate Auth & Nonce Request
    User->>Client: Request login (e.g., "Sign In")
    Client->>Server: GET /api/nonce<br/>(optional: with session/IP for tying)
    Server->>Server: Generate nonce + expiry<br/>(randomBytes, exp = now + 5min)<br/>(store in Redis with TTL)
    Server->>Client: 200 OK + nonce, expiresIn: 300s (5m)

    Note over User,Server: 2. Sign Message
    Client->>Client: Generate SIWE message<br/>(domain, uri, address, nonce, exp=now+5min)
    Client->>Wallet: Prompt sign (e.g., via EIP-1193)
    Wallet->>User: Display message for approval
    User->>Wallet: Approve & sign
    Wallet->>Client: Return signature

    Note over User,Server: 3. Verify Signature & Nonce
    Client->>Server: POST /auth/siwe<br/>(message, signature)
    Server->>Server: Reconstruct message & verify sig<br/>(ethers.js/viem: matches address?)
    Server->>Server: Check nonce: stored? now < expiry? unused?<br/>(if valid: mark used/delete)
    alt Valid (sig + nonce + !expired)
        Server->>Client: 200 OK + JWT/Session Token<br/>(embedded: address, exp)
    else Invalid (wrong sig, expired nonce, replay)
        Server->>Client: 401 Unauthorized
    end

    Note over User,Server: 4. Access Private API
    Client->>Server: GET /private/data<br/>(Authorization: Bearer <token>)
    Server->>Server: Validate token<br/>(JWT verify: sig, exp, address)
    alt Valid Token
        Server->>Client: 200 OK + Protected Data
    else Invalid/Expired
        Server->>Client: 401 Unauthorized<br/>(Re-auth: new nonce needed)
    end
```

## React issue
The same is at this example https://react.dev/reference/react/useActionState#display-information-after-submitting-a-form
![React Form Issue](.github/images/same-issue-on-react-docs-prod.png)