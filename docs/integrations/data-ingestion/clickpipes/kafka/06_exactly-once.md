---
sidebar_label: 'Exactly-once semantics'
description: 'How exactly-once delivery works in Kafka ClickPipes, and how to tune a pipe to use it effectively.'
slug: /integrations/clickpipes/kafka/exactly-once
sidebar_position: 1
title: 'Exactly-once semantics'
doc_type: 'guide'
keywords: ['exactly-once', 'kafka clickpipes', 'insert deduplication', 'deduplication token', 'high water mark', 'delivery semantics']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

Exactly-once semantics guarantee that each Kafka record is inserted into ClickHouse exactly once, even across pod restarts, consumer rebalances, and failures that interrupt an insert. ClickPipes achieves this by tracking ingestion progress in its own state store and relying on ClickHouse [insert deduplication](/guides/developer/deduplicating-inserts-on-retries) to reject any record it sends more than once.

## How it works {#how-it-works}

ClickPipes records the ingestion progress of each Kafka partition in its internal state store using two values:

- **High-water mark** — the offset up to which every record on the partition is confirmed inserted into ClickHouse. On restart, ClickPipes drops any polled record at or below this mark, so data that already landed is never sent again.
- **Pending ranges** — the offset ranges of insert blocks that have been sent to ClickHouse but not confirmation was record by ClickPipes. After a failure, ClickPipes replays exactly these ranges.

ClickPipes groups each partition's rows into an insert block that covers a contiguous range of offsets, and tags the block with a deterministic [deduplication token](/guides/developer/deduplicating-inserts-on-retries) of the form `topic:partition:firstOffset-lastOffset`. The token depends only on the offset range, not on the bytes of the block.

When a failure forces a block to be replayed, ClickPipes reads the pending ranges from its state store and rebuilds the same offset range, producing the same token. ClickHouse recognizes the token and rejects the duplicate, so each record is inserted exactly once — even when the replayed block isn't byte-for-byte identical to the original.

## Tradeoffs and tuning {#tradeoffs-and-tuning}

Reproducing the same token on replay requires ClickPipes to build one insert Native format insert block per partition, each covering a contiguous range of offsets. Larger blocks create fewer, larger [parts](/parts) in ClickHouse, which keeps merge overhead low — but ClickPipes holds a partition's rows in memory while it accumulates the block, so larger blocks use more memory.

Each ClickPipe runs a fixed number of insert workers, determined by the replica size and the number of replicas. Every partition is pinned to a single worker, which accumulates and seals the blocks for that partition.

A pipe performs best when the ratio of partitions to workers approaches 1. Each worker then owns roughly one partition and can build large blocks without competing for memory, producing fewer parts. When one worker handles many partitions, it holds a separate in-memory block for each. The added memory pressure then forces smaller blocks and more parts.

To approach a 1:1 ratio, scale the pipe so the total number of workers is close to the number of partitions on your topic. Raise the replica size, the replica count, or both under **Settings** -> **Advanced Settings** -> **Scaling**. See [Scaling](/integrations/clickpipes/kafka/best-practices#scaling) for more detail.
