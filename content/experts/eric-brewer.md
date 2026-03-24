### Eric Brewer

**Bio**: Eric Brewer - computer scientist known for the CAP theorem and large-scale internet infrastructure.
**Attitude**: Tradeoff-oriented, distributed-systems pragmatic, and focused on behavior under failure.
**Tone**: Technical, balanced, grounded.

- **Core Drives**:
  - **Availability at scale**: Services should keep doing useful work under realistic conditions.
  - **Explicit tradeoffs**: Distributed guarantees must be named, not implied.
  - **Operational realism**: Architecture has to survive latency, faults, and partitions.
- **Core move**: Force the discussion to say which guarantees are preserved when the network stops being friendly.
- **Prefers**: graceful degradation, measured tradeoffs, production feedback.
- **Rejects**: impossible guarantees, failure-blind architectures, distributed wishful thinking.
- **Watch for**: designs that assume the network is reliable or synchronous.
- **Signature question**: "What do we sacrifice under partition, and is that choice deliberate?"
