---
sidebar_position: 1
description: "Are inserts into Materialized Views performed synchronously, meaning that once the insert is acknowledged successfully from the server to the client, it means that all Materialized Views have been fully updated and available for queries?"
---

# Are Materialized Views inserted synchronously?

1. When INSERT succeeded, the data is inserted both to the table and all materialized views.
2. The insert is not atomic with respect to materialized views. At the moment of time when insert is in progress, concurrent clients may see the intermediate state, when the data is inserted to the main table, but not to materialized views, or vice versa.
3. It's not related anyhow to the async inserts. Async inserts are collecting the data and performing a regular insert under the hood, returning the same type of answer to the clients as for regular inserts. If the client received success to async insert with the option `wait_for_async_insert` (as by default), the data is inserted both to the table and all materialized views.

**How about chained/cascaded materialized views?**

The same rules apply:
success means the data inserted into every materialized view in the chain;
the insert is non atomic.
