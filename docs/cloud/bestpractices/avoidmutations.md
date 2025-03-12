---
slug: /cloud/bestpractices/avoid-mutations
sidebar_label: 'Avoid Mutations'
title: 'Avoid Mutations'
description: 'TODO: Add description'
---

Mutations refers to [ALTER](/sql-reference/statements/alter/) queries that manipulate table data through deletion or updates. Most notably they are queries like ALTER TABLE … DELETE, UPDATE, etc. Performing such queries will produce new mutated versions of the data parts. This means that such statements would trigger a rewrite of whole data parts for all data that was inserted before the mutation, translating to a large amount of write requests.

For updates, you can avoid these large amounts of write requests by using specialised table engines like [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree.md) or [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree.md) instead of the default MergeTree table engine.


## Related content {#related-content}

- Blog: [Handling Updates and Deletes in ClickHouse](https://clickhouse.com/blog/handling-updates-and-deletes-in-clickhouse)
