```mermaid
flowchart TD
    A[React Frontend] -->|Data Requests| B[TypeScript Backend Server]
    B -->|API Calls| C[SOS Contador API]
    C -->|Response| B
    B -->|Data Response| A
```