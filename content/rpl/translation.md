# Markdown to RPL Translation Guide

RPL is designed to be inferred from prose. This guide provides examples of how an LLM can translate Markdown prose into formal RPL syntax. It relies on the LLM's ability to infer intent, rather than a rigid formal transformation.

## 0. Style: readability and string quotes

**Readability comes first** for every formal expression you emit: short, clear rules that scan well beat clever compression. **String literals** may use `"…"` or `'…'` interchangeably—the meaning is the same. Choose the delimiter (and line breaks) that keeps each rule easiest to read in context (for example, single quotes when the text contains double quotes, or vice versa).

## 1. No RPL + No Emphasis (Pure Prose Inference)

**Prose:**
```markdown
# Triage Patient
Ask the user for the patient's name and their symptoms. When symptoms include chest pain, severity is critical.
```

**Inferred RPL:**
```rpl
# Triage Patient - triage(?patient) <- name(?patient, $name), symptoms(?patient, $symptoms), severity(?patient, ?severity)

severity(?patient, "critical") <- symptoms(?patient, ?s), ?s ~ /chest pain/
```

## 2. No RPL + Emphasis in Body (Prose with Hints)

**Prose:**
```markdown
# Order Fulfillment
An order is fulfillable when its __order id__ is valid. A fulfillable order has __customer details__ and a __shipping address__.
```

**Inferred RPL:**
```rpl
# Order Fulfillment - fulfillable(?order-id) <- valid-order(?order-id), customer-details(?order-id, $customer-details), shipping-address(?order-id, $shipping-address)
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
Notification also requires the user to have opted in.
```

**Inferred RPL:**
```rpl
# Send Notification - notify(?user, ?message) <- email(?user, ?email), opted-in(?user)
```

## 6. Async Variables and Tools

**Prose:**
```markdown
# Query Result - query-result(?query, ?results)
A query has results from the database.
```

**Inferred RPL:**
```rpl
# Query Result - query-result(?query, ?results) <- $query-db(?query) ^ ~ {:result ?results}
```
