---
slug: /cloud/bestpractices/avoid-optimize-final
sidebar_label: 'Avoid Optimize Final'
title: 'Avoid Optimize Final'
keywords: ['OPTIMIZE TABLE', 'FINAL', 'unscheduled merge']
description: 'TODO: Add description'
---

Using the [`OPTIMIZE TABLE ... FINAL`](/sql-reference/statements/optimize/) query initiates an unscheduled merge of data parts for a specific table into one single data part. 
During this process, ClickHouse performs the following steps:

- Data parts are read.
- The parts get uncompressed.
- The parts get merged.
- They are compressed into a single part.
- The part is then written back into the object store.

The operations described above are resource intensive, consuming significant CPU and disk I/O.
It is important to note that using this optimization will force a rewrite of a part, 
even if merging to a single part has already occurred.

Additionally, use of the `OPTIMIZE TABLE ... FINAL` query may disregard 
setting [`max_bytes_to_merge_at_max_space_in_pool`](/operations/settings/merge-tree-settings#max-bytes-to-merge-at-max-space-in-pool) which controls the maximum size of parts
that ClickHouse will typically merge by itself in the background.

The [`max_bytes_to_merge_at_max_space_in_pool`](/operations/settings/merge-tree-settings#max-bytes-to-merge-at-max-space-in-pool) setting is by default set to 150 GB. 
When running `OPTIMIZE TABLE ... FINAL`, 
the steps outlined above will be performed resulting in a single part after merge. 
This remaining single part could exceed the 150 GB specified by the default of this setting. 
This is another important consideration and reason why you should avoid use of this statement, 
since merging a large number of 150 GB parts into a single part could require a significant amount of time and/or memory.



