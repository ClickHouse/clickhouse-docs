---
slug: /en/cloud/bestpractices/avoid-optimize-final
sidebar_label: Avoid Optimize Final
title: Avoid Optimize Final
---

Using the [`OPTIMIZE TABLE ... FINAL`](/docs/en/sql-reference/statements/optimize/) query will initiate an unscheduled merge of data parts for the specific table into one data part. During this process, ClickHouse reads all the data parts, uncompresses, merges, compresses them into a single part, and then rewrites back into object store, causing huge CPU and IO consumption.

Note that this optimization rewrites the one part even if they are already merged into a single part. Also, it is important to note the scope of a "single part" - this indicates that the value of the setting [`max_bytes_to_merge_at_max_space_in_pool`](https://clickhouse.com/docs/en/operations/settings/merge-tree-settings#max-bytes-to-merge-at-max-space-in-pool) will be ignored. For example, [`max_bytes_to_merge_at_max_space_in_pool`](https://clickhouse.com/docs/en/operations/settings/merge-tree-settings#max-bytes-to-merge-at-max-space-in-pool) is by default set to 150 GB. When running OPTIMIZE TABLE ... FINAL, the remaining single part could exceed even this size. This is another important consideration and reason not to generally use this command, since merging a large number of 150 GB parts into a single part could require a significant amount of time and/or memory.


