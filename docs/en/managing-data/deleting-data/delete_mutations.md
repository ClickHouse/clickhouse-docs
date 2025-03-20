---
slug: /en/managing-data/delete_mutations
sidebar_label: Delete Mutations
title: Delete Mutations
hide_title: false
---

Delete mutations refers to `ALTER` queries that manipulate table data through delete. Most notably they are queries like `ALTER TABLE DELETE`, etc. Performing such queries will produce new mutated versions of the data parts. This means that such statements would trigger a rewrite of whole data parts for all data that was inserted before the mutation, translating to a large amount of write requests.

:::info
For deletes, you can avoid these large amounts of write requests by using specialised table engines like [ReplacingMergeTree](/docs/en/guides/replacing-merge-tree) or [CollapsingMergeTree](/docs/en/engines/table-engines/mergetree-family/collapsingmergetree) instead of the default MergeTree table engine.
:::

import DeleteMutations from '@site/docs/en/sql-reference/statements/alter/delete.md';

<DeleteMutations/>