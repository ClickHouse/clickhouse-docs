---
slug: /best-practices
keywords: ['Cloud', 'Primary key', 'Ordering key', 'Materialized Views', 'Best Practices', 'Bulk Inserts', 'Asynchronous Inserts', 'Avoid Mutations', 'Avoid nullable Columns', 'Avoid Optimize Final', 'Partitioning Key']
title: 'Overview'
hide_title: true
description: 'Landing page for Best Practices section in ClickHouse'
doc_type: explanation
---

# Best Practices in ClickHouse {#best-practices-in-clickhouse}

This section provides the best practices you will want to follow to get the most out of ClickHouse.

| Page                                                                 | Description                                                              |
|----------------------------------------------------------------------|--------------------------------------------------------------------------|
| [Choosing a Primary Key](/best-practices/choosing-a-primary-key)     | Guidance on selecting an effective Primary Key in ClickHouse.            |
| [Select Data Types](/best-practices/select-data-types)               | Recommendations for choosing appropriate data types.                     |
| [Use Materialized Views](/best-practices/use-materialized-views)     | When and how to benefit from materialized views.                         |
| [Minimize and Optimize JOINs](/best-practices/minimize-optimize-joins)| Best practices for minimizing and optimizing JOIN operations.            |
| [Choosing a Partitioning Key](/best-practices/choosing-a-partitioning-key) | How to choose and apply partitioning keys effectively.              |
| [Selecting an Insert Strategy](/best-practices/selecting-an-insert-strategy) | Strategies for efficient data insertion in ClickHouse.             |
| [Data Skipping Indices](/best-practices/use-data-skipping-indices-where-appropriate) | When to apply data skipping indices for performance gains.    |
| [Avoid Mutations](/best-practices/avoid-mutations)                   | Reasons to avoid mutations and how to design without them.               |
| [Avoid OPTIMIZE FINAL](/best-practices/avoid-optimize-final)         | Why `OPTIMIZE FINAL` can be costly and how to work around it.           |
| [Use JSON where appropriate](/best-practices/use-json-where-appropriate) | Considerations for using JSON columns in ClickHouse.               |
