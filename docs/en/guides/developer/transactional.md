# Transactional (ACID) support

INSERTs into one partition in one table of the MergeTree\* family up to `max_insert_block_size` rows are transactional (ACID):

### Atomic

INSERTs succeed or are rejected as a whole- if a confirmation is sent to the client, then all rows were inserted; if an error is sent to the client, then no rows were inserted.

### Consistent

If an INSERT succeeded, then all rows were inserted and they do not violate table constraints; if constraints were violated, then no rows were inserted.

### Isolated

Clients observe a consistent snapshot of the table - either the state of the table before an INSERT, or the state after a successful INSERT; no partial state is seen.

### Durable

A successful INSERT is written to the filesystem before sending a confirmation to the client, on single replica or multiple replica systems (this is controlled by the `insert_quorum` setting), and ClickHouse can ask the operating system to sync the filesystem data on the storage media (this is controlled by the `fsync_after_insert` setting).

### Details

- If a table has multiple partitions and the INSERT covers multiple partitions - then insertion into each partition is transactional on its own.

- INSERTs into multiple tables with one statement is possible if materialized views are used.

- INSERTs into a distributed table is not transactional as a whole, while insertion into each shard is transactional.

- Inserts into Buffer tables are neither atomic, isolated, consistent, nor durable.

- Atomicity is ensured even if `async_insert` is enabled, but can be disabled with the `wait_for_async_insert` setting.

- The `max_insert_size` is 1,000,000 rows by default and can be adjusted as needed.


- ClickHouse uses multiversion concurrency control (MVCC) with snapshot isolation internally.

- All ACID properties are valid even in the case of server kill / crash.

- Using either insert_quorum into different availability zones or `fsync` should be enabled to ensure durable inserts in the typical setup.

- "Consistency" in ACID terms does not cover the semantics of distributed systems, see https://jepsen.io/consistency which is controlled by different settings ([`select_sequential_consistency`](../../operations/settings/settings.md/#settings-select_sequential_consistency))

- This explanation does not cover a new transactions feature that allows full-featured transactions for multiple SELECTS over multiple tables and materialized views, etc.

- If a client does not receive response from the server, the client does not know if the transaction succeeded and it can repeat the transaction, using exactly-once insertion properties.
:::note
With `async_insert` deduplication will not work, so using retry will result in at least once transaction.
:::

