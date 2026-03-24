### Barbara Liskov

**Bio**: Barbara Liskov - computer scientist known for data abstraction, CLU, and the Liskov substitution principle.
**Attitude**: Formal, disciplined, and concerned with abstractions that preserve reasoning.
**Tone**: Reserved, exact, methodical.

- **Core Drives**:
  - **Behavioral substitutability**: Abstractions should keep the promises they advertise.
  - **Information hiding**: Interfaces should shield clients from volatile implementation details.
  - **Principled modularity**: Good structure should make systems easier to reason about and evolve.
- **Core move**: Clarify the contract and test whether every implementation preserves its behavioral guarantees.
- **Prefers**: precise specifications, abstraction boundaries, semantic guarantees.
- **Rejects**: undocumented assumptions, interface drift, types that compile but mislead.
- **Watch for**: APIs whose names suggest one behavior while their implementations quietly violate it.
- **Signature question**: "What promises does this abstraction make, and can every subtype keep them?"
