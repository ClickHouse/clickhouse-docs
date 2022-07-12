# Transactional (ACID) support

INSERTs into ClickHouse are always durable.  Additionally, INSERTs into one partition of one table of the MergeTree\* family up to `max_insert_block_size` rows are also atomic, consistent, and isolated.
:::note
Understanding how and when [the `max_insert_block_size` setting](../../operations/settings/settings.md#settings-max_insert_block_size) is used in MergeTree\* tables is key to ensuring atomic, consistent, and isolated inserts.
:::

<dl>
  <dt><strong>Atomic</strong></dt>
  <dd>INSERTs succeed or are rejected as a whole - if a confirmation is sent to the client, then all rows were inserted; if an error is sent to the client, then no rows were inserted.</dd>
  <dt><strong>Consistent</strong></dt>
  <dd>If an INSERT succeeded, then all rows were inserted and they do not violate table constraints; if constraints were violated, then no rows were inserted.</dd>
  <dt><strong>Isolated</strong></dt>
  <dd>Clients observe a consistent snapshot of the table - either the state of the table before an INSERT, or the state after a successful INSERT; no partial state is seen.</dd>
  <dt><strong>Durable</strong></dt>
  <dd>A successful INSERT is written to the filesystem before sending a confirmation to the client, on single replica or multiple replica systems (this is controlled by the `insert_quorum` setting), and ClickHouse can ask the operating system to sync the filesystem data on the storage media (this is controlled by the `fsync_after_insert` setting).</dd>
</dl>

## Details

- If a table has multiple partitions and the INSERT covers multiple partitions - then insertion into each partition is transactional on its own.

- Atomic INSERTs into multiple tables with one statement are possible if materialized views are used.

- INSERTs into a distributed table are not transactional as a whole, while insertion into each shard are transactional.

- Inserts into Buffer tables are neither atomic, isolated, consistent, nor durable.

- Atomicity is ensured even if `async_insert` is enabled, but can be disabled with the `wait_for_async_insert` setting.

- The `max_insert_block_size` is 1,048,576 rows by default and can be adjusted as needed.


- ClickHouse uses multiversion concurrency control (MVCC) with snapshot isolation internally.

- All ACID properties are valid even in the case of server kill / crash.

- Using either `insert_quorum` into different availability zones or `fsync_after_insert=1` to ensure durable inserts in the typical setup.

- "Consistency" in ACID terms does not cover the semantics of distributed systems, see [Jepsen](https://jepsen.io/consistency) which is controlled by different settings ([`select_sequential_consistency`](../../operations/settings/settings.md/#settings-select_sequential_consistency))

- This explanation does not cover a new transactions feature that allows full-featured transactions for multiple SELECTS over multiple tables and materialized views, etc.

- If a client does not receive response from the server, the client does not know if the transaction succeeded and it can repeat the transaction, using exactly-once insertion properties.
- With `async_insert` deduplication will not work per INSERT, so retries on failures will result in at least once semantics of INSERTs.

