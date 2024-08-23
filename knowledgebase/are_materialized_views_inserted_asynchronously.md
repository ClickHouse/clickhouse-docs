---
date: 2023-03-01
---

# Are Materialized Views inserted synchronously?

**Question:** When a source table has new rows inserted into it, those new rows are also sent to all of the materialized views of that source table. Are inserts into Materialized Views performed synchronously, meaning that once the insert is acknowledged successfully from the server to the client, it means that all Materialized Views have been fully updated and available for queries?

**Answer:**

1. When an `INSERT` succeeds, the data is inserted both to the table and all materialized views.
2. The insert is not atomic with respect to materialized views. At the moment of time when the `INSERT` is in progress, concurrent clients may see the intermediate state, when the data is inserted to the main table, but not to materialized views, or vice versa.
3. If you are using [async inserts](https://clickhouse.com/docs/en/optimize/asynchronous-inserts/), they collect the data and perform a regular insert under the hood, returning the same type of answer to the client as for regular inserts. If the client received success from an async insert with the option `wait_for_async_insert` (as by default), the data is inserted into both the table and all of its materialized views.

**Question:** How about chained/cascaded materialized views?

**Answer:**
The same rules apply - an `INSERT` with a successful response means that the data was inserted into every materialized view in the chain. The insert is non-atomic.
