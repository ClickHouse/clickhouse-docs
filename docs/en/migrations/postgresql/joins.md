---
sidebar_label: Handling joins
sidebar_position: 100
title: Handling joins
slug: /en/migrations/postgresql/joins
description: Handling joins
keywords: [migrate, migration, migrating, data, etl, elt, postgresql, postgres, concepts, mappings, data types, joins]
---

Users migrating from Postgres will be used to a database that is heavily optimized for workloads using JOINs. While ClickHouse has[ full JOIN support](https://clickhouse.com/blog/clickhouse-fully-supports-joins-part1), with a wide selection of join algorithms, join optimization often has to be performed manually - although recent developments with the new analyzer mean this is[ improving with each release](https://clickhouse.com/blog/clickhouse-release-24-05#cross-join-improvements).

## General guidelines

Users should aim to follow the recommendations listed below:

* For optimal performance, users should aim to reduce the number of JOINs in queries, especially for real-time analytical workloads where ms performance is required. Aim for a maximum of 3-4 joins in a query. We detail a number of changes to minimize joins in the [data modeling section](/docs/en/data-modeling/schema-design), including denormalization, dictionaries, and materialized views.
* Currently, ClickHouse does not reorder joins. Always ensure the smallest table is on the right-hand side of the Join. This will be held in memory for most join algorithms and will ensure the lowest memory overhead for the query.
* If your query requires a direct join i.e. a `LEFT ANY JOIN` - as shown below, we recommend using Dictionaries where possible. We detail this approach for the Stack Overflow dataset in the data modeling guide [here](/docs/en/dictionary).

<img src={require('./images/left_any.png').default} class="image" alt="Left any join" style={{width: '25%', marginBottom: '20px', textAlign: 'left'}}/>
