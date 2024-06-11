---
slug: /en/guides/developer/insertion-deduplication-on-retries
sidebar_label: Insertion deduplication on retries
sidebar_position: 0
description: On retries inderted data is deduplicated.
---

# What is deduplication on insertion retries?
Some times the result of insert operation is unsertan. For example the case when user gets timeout error. The inserted data could be actually inserted to the destination or not.
Such failed operations should be retried by the user. When an user retries that operations Clickhouse tries to determine if the inserted data has been succesfuly inserted already or not. If that inserted data is marked as duplication than Clickhouse would not insert it to the destination table and user would recieve successful status of operation as if the data has been inserted.

# How enable or disable deduplication of insertion?
Only the enginges from the family of engines `*MergeTree` support the deduplication on insertion.
For engines from `*ReplicatedMergeTree` engine family deduplication is controlled by the settings: `replicated_deduplication_window` and `replicated_deduplication_window_seconds`.
For non-replicated engine family `*MergeTree` deduplication is controlled by the settings: `non_replicated_deduplication_window`.
That settings determine parameters of deduplication log for the table. Deduplication log stores finite count of `block_id`'s. That set of `block_id`'s determine how deduplication works.
The query setting `insert_deduplicate` controls deduplication on the query level. Note: all the data which is inserted with `insert_deduplicate=0` could not be deduplicated with the following insertion retry with `insert_deduplicate=1`. There is two reasons for that. First -- there are no `block_id`'s writted for the blocks from the insertion with the settions `insert_deduplicate=0`. Second -- user has to perform retries with the same settins as original operation.

# How insertion deduplication works?
When some data is inserted to the Clickhouse its is splited by rows count and bytes count to the sequence of the blocks. For each such block `*MergeTree` engine calculates hash from the data in that block. That hash is called `blob_id` and it is used as a unique key for that operation. That approach works just well enough for the most cases assuming that different insertions contain different data. Othervise you need to use insertion setting `insert_deduplication_token`. That setting gives you precise control over deduplication process. Insertions only with equal `insert_deduplication_token` is deduplicated with each other.

Each time that data is inserted to the destination table, `blob_id` is written to the deduplication log. For each insertion the condition is checked that there is no such `block_id` in deduplication log. If `block_id` is found in deduplication log, than the block is considered as duplicate. Note that Deduplication log stores finite count of `block_id`'s. Only insertions which meet the deduplication log window parameters have chances to be deduplicated.

For `INSERT VALUES` queries splitting the inserted data to the block is deterministic and it is determined by settings. Therefore user shoud retry insertions with the same settings values as they were at first operation.

For `INSERT SELECT` queries it is important that `SELECT` part of the query returns the same data in the same order each try. That is hard to achive in practical usage for many reasons. In order to achieve the stable data order on retries you could define precise `ORDER BY` section in `SELECT` part of the query. But the selected table could be updated between retries therefore the result data could change. Also there are could be a lot of data as a result a lot of blocks after sptitting inserted data by rows count and bytes count. That count of blocks might overflow deduplication log window.


# How insertion deduplication works with materialized views?
When a table has one or several materialized views, the inserted data is also inserted to the destination of that views with some defined transformation.
That transformed data is also deduplicated.
