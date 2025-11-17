---
title: 'Does ClickHouse support real-time updates?'
toc_hidden: true
toc_priority: 10
slug: /faq/general/updates
description: 'ClickHouse supports lightweight real-time updates'
doc_type: 'reference'
keywords: ['updates', 'real-time']
---

# Does ClickHouse support real-time updates?

ClickHouse supports the UPDATE statement and is capable running real-time updates as fast as it runs INSERTs.

This is possible thanks to the patch parts data structure, which allows quickly applying changes without a significant impact on the SELECT performance.

Moreover, due to MVCC (multi-version concurrency control) and snapshot isolation, updates provide ACID properties.

:::info
Lightweight updates were first introduced in ClickHouse version 25.7.
:::
