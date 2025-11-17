---
title: 'Does ClickHouse support distributed JOIN?'
toc_hidden: true
toc_priority: 10
slug: /faq/general/distributed-join
description: 'ClickHouse supports distributed JOIN'
doc_type: 'reference'
keywords: ['distributed', 'join']
---

# Does ClickHouse support distributed JOIN?

ClickHouse supports distributed JOIN on a cluster.

When the data is co-located on the cluster (e.g., the JOIN is performed by the user identifier, which is also a sharding key), ClickHouse provides a way to perform the JOIN without data movement on the network.

When the data is not co-located, ClickHouse allows a broadcast JOIN, when parts of the joined data are distributed across the nodes of the cluster.

As of 2025, ClickHouse does not perform the shuffle-join algorithm, which means redistribution of the both sides of the join over network across the cluster according to the join keys.
