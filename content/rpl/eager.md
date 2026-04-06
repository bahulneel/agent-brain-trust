# RPL Eager Execution Algorithm

The classic execution algorithm for RPL operates on an 8-phase timestep. It drives derivation to fixpoint, activates goals, dispatches async operations, and updates plans.

## 1. The 8-Phase Timestep
The runtime cycles through eight phases:
1. **Assert New Avars**: Ground values from resolved async operations (tools, `$ask`, events) enter the store.
2. **Assert Input Novelty**: New facts or schema changes are asserted.
3. **Quiesce Relations**: Derive all relations to fixpoint. Ungrounded constraints (`->`) are checked.
4. **Activate Goals**: Evaluate abductives (`;`) on goal rules.
5. **Update Plans**: The agent updates its internal plan based on active goals.
6. **Progress Plan**: New facts from planning become novelty for the next quiescence.
7. **Quiesce Relations**: Derive to fixpoint again. Constraints may become traces.
8. **Dispatch Asyncs**: Unresolved avars and tool calls are dispatched.

## 2. Goal Resolution
Goals (`%goal`) drive execution.
1. **Root Goal**: If a root `%` exists, it is evaluated first.
2. **Named Goals**: If no root `%`, the agent chooses among named goals based on context.
3. **Evaluate Abductives**: The `;` clause of each candidate is evaluated.
4. **Syntactic Order**: Eligible rules are evaluated in syntactic order.
5. **Unbound Args**: Unbound arguments trigger async collection (`$ask`, `$choose`, `$x`).
6. **Satisfaction**: When a goal is satisfied, the agent offers to continue.
7. **Termination**: The user decides when to stop.

## 3. Traces and Constraints
A constraint (`->`) is an invariant.
- **Ungrounded**: `rel(?x) -> valid(?x)` (live check during quiescence).
- **Fully Grounded (Trace)**: When all variables are bound, it becomes a trace.
  - `rel(?x) ^^ {x "value"} -> true` (holds from introduction onward).
  - Traces carry the binding context (`^^`).
- **Retraction**: Asserting `-> false` retracts a trace.
  - `rel(?x) ^^ {x "value"} -> false`
- **Async Resolution**: When an avar resolves, it creates a trace.
  - `$tool(?args) ^ ~ {:result "res"} ^^ {args "val"} -> true`
