# Markdown to RPL Translation Guide

RPL is designed to be inferred from prose. This guide provides examples of how an LLM can translate Markdown prose into formal RPL syntax. It relies on the LLM's ability to infer intent, rather than a rigid formal transformation.

## 1. No RPL + No Emphasis (Pure Prose Inference)

**Prose:**
```markdown
# Triage Patient
Ask the user for the patient's name and their symptoms. If the symptoms include chest pain, mark the severity as critical.
```

**Inferred RPL:**
```rpl
# Triage Patient - triage(?patient) <- name(?patient, $name), symptoms(?patient, $symptoms), severity(?patient, ?severity)

severity(?patient, "critical") <- symptoms(?patient, ?s), ?s ~ /chest pain/
```

## 2. No RPL + Emphasis in Body (Prose with Hints)

**Prose:**
```markdown
# Process Order
Check if the __order id__ is valid. If it is, fetch the __customer details__ and __shipping address__.
```

**Inferred RPL:**
```rpl
# Process Order - process-order(?order-id) <- valid-order(?order-id), customer-details(?order-id, $customer-details), shipping-address(?order-id, $shipping-address)
```

## 3. RPL Head + No Emphasis (Signature Provided, Body Inferred)

**Prose:**
```markdown
# Calculate Discount - discount(?user, ?amount)
If the user is a premium member, the discount is 20%. Otherwise, it is 5%.
```

**Inferred RPL:**
```rpl
# Calculate Discount - discount(?user, ?amount)

discount(?user, 20) <- premium-member(?user)
discount(?user, 5) <- not premium-member(?user)
```

## 4. RPL Head + Emphasis (Signature Provided, Body Uses Hints)

**Prose:**
```markdown
# Approve Loan - %approve(?application)
The loan is approved if the __credit score__ is above 700 and the __income__ is greater than 50000.
```

**Inferred RPL:**
```rpl
# Approve Loan - %approve(?application) <- credit-score(?application, ?credit-score), ?credit-score > 700, income(?application, ?income), ?income > 50000
```

## 5. RPL Head and Tail + Tail Additions (Explicit Rules Mixed with Prose)

**Prose:**
```markdown
# Send Notification - notify(?user, ?message) <- email(?user, ?email)
Also, ensure the user has opted in to notifications.
```

**Inferred RPL:**
```rpl
# Send Notification - notify(?user, ?message) <- email(?user, ?email), opted-in(?user)
```

## 6. Async Variables and Tools

**Prose:**
```markdown
# Fetch Data - fetch-data(?query)
Run the query against the database and return the results.
```

**Inferred RPL:**
```rpl
# Fetch Data - fetch-data(?query) <- $query-db(?query) ^ ~ {:result ?results}
```
