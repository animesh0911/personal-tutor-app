# Local ticket labels

- `ready-for-agent`: scoped and ready to implement when blockers are complete.
- `needs-decision`: requires a product or technical decision before implementation.
- `needs-reproduction`: reported behavior must be reproduced before fixing.
- `needs-info`: missing external information or an artifact.
- `blocked`: cannot proceed until the declared blocking edge changes.

The current MVP tickets use `ready-for-agent`; their dependency fields describe execution order.
