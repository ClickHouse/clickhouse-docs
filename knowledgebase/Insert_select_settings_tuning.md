---
date: 2023-07-21
---

# TOO MANY PARTS error during an INSERT...SELECT

## Question

When executing a `INSERT...SELECT` statement, I am getting too many parts (TOO_MANY_PARTS) error. 

How can I solve this? 

## Answer

Below are some of the settings to tune to avoid this error, this is expert level tuning of ClickHouse and these values should be set only after understanding the specifications of the ClickHouse cloud service or on-prem cluster where these will be used, so do not take these values as "one size fits all".


[max_insert_block_size](https://clickhouse.com/docs/en/operations/settings/settings#settings-max_insert_block_size) = `100_000_000` (default `1_048_576`)

Increase from ~1M to 100M would allow larger blocks to form

Note: This setting only applies when the server forms the blocks. i.e. INSERT via the HTTP interface, and not for clickhouse-client


[min_insert_block_size_rows](https://clickhouse.com/docs/en/operations/settings/settings#min-insert-block-size-rows) = `100_000_000` (default `1_048_576`)

Increase from ~1M to 100M would allow larger blocks to form.


[min_insert_block_size_bytes](https://clickhouse.com/docs/en/operations/settings/settings#min-insert-block-size-bytes) = `500_000_000` (default `268_435_456`)

Increase from 268.44 MB to 500 MB would allow larger blocks to form.


[parts_to_delay_insert](https://clickhouse.com/docs/en/operations/settings/merge-tree-settings#parts-to-delay-insert) = `500` (default `150`)

Increasing this so that INSERTs are not artificially slowed down when the number of active parts in a single partition is reached.


[parts_to_throw_insert](https://clickhouse.com/docs/en/operations/settings/merge-tree-settings#parts-to-delay-insert) = `1500` (default `300`)

Increasing this would generally affect query performance to the table, but this would be fine for data migration.
