---
slug: /en/guides/developer/transactional
---
# Transactional (ACID) support

INSERT into one partition* in one table* of MergeTree* family up to max_insert_block_size rows* is transactional (ACID):
- Atomic: INSERT is succeeded or rejected as a whole: if confirmation is sent to the client, all rows INSERTed; if error is sent to the client, no rows INSERTed.
- Consistent: if INSERT succeeded, all rows inserted and they don't violate table constraints; if constraints violated, no rows inserted.
- Isolated: concurrent clients observe a consistent snapshot of the table - the state of the table either as if before INSERT or after successfull INSERT; no partial state is seen;
- Durable: successful INSERT is written to the filesystem before answering to the client, on single replica or multiple replicas (controlled by the `insert_quorum` setting), and ClickHouse can ask the OS to sync the filesystem data on the storage media (controlled by the `fsync_after_insert` setting).
* if table has many partitions and INSERT covers many partitions - then insertion into every partition is transactional on its own;
* INSERT into multiple tables with one statement is possible if materialized views are involved;
* INSERT into Distributed table is not transactional as a whole, while insertion into every shard is transactional;
* another example: insert into Buffer tables is neither atomic or isolated or consistent or durable;
* atomicity is ensured even if async_insert is enabled, but it can be turned off by the wait_for_async_insert setting;
* max_insert_block_size is 1 000 000 by default and can be adjusted as needed;
* if client did not receive the answer from the server, the client does not know if transaction succeeded and it can repeat the transaction, using exactly-once insertion properties;
* ClickHouse is using MVCC with snapshot isolation internally;
* all ACID properties are valid even in case of server kill / crash;
* either insert_quorum into different AZ or fsync should be enabled to ensure durable inserts in typical setup;
* "consistency" in ACID terms does not cover the semantics of distributed systems, see https://jepsen.io/consistency which is controlled by different settings (select_sequential_consistency)
* this explanation does not cover a new transactions feature that allow to have full featured transactions over multiple tables, materialized views, for multiple SELECTs, etc.
