# RPL Vocab — Roles

Relations and constraints for entity roles, permissions, and capabilities.

---

## Core Relations

```rpl
role(?entity, ?role)             -- ?entity holds ?role
permits(?role, ?action)          -- ?role is permitted to perform ?action
capable(?entity, ?action)        -- derived: ?entity can perform ?action
requires-role(?action, ?role)    -- ?action requires ?role to proceed
```

---

## Derived Relations

```rpl
capable(?entity, ?action) <= role(?entity, ?role), permits(?role, ?action)
```

---

## Constraints

```rpl
-- an action requiring a role may only be performed by capable entities
requires-role(?action, ?role), performed-by(?action, ?entity) =>
  capable(?entity, ?action)

-- mutual exclusion: some roles cannot be held simultaneously
exclusive-roles(?r1, ?r2) <= ...  -- author-defined
role(?e, ?r1), role(?e, ?r2), exclusive-roles(?r1, ?r2) => false
```

---

## Goal: Role-Gated Action

```rpl
%authorised(?entity, ?action) <=
  requires-role(?action, ?role),
  role(?entity, ?role)
```

Compose with domain goals:

```rpl
%approve(?doc) <= %authorised(?reviewer, "approve"), review(?reviewer, ?doc)
```
