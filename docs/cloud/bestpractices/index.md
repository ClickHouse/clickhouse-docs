---
slug: /cloud/bestpractices
keywords: ['Cloud', 'Best Practices', 'Bulk Inserts', 'Asynchronous Inserts', 'Avoid Mutations', 'Avoid Nullable Columns', 'Avoid Optimize Final', 'Low Cardinality Partitioning Key', 'Multi Tenancy']
title: 'Overview'
hide_title: true
description: 'Landing page for Best Practices section in ClickHouse'
---

# Best Practices in ClickHouse

This section provides six best practices you will want to follow to get the most out of ClickHouse Cloud.

| Page                                                     | Description                                                                |
|----------------------------------------------------------|----------------------------------------------------------------------------|
| [Use Bulk Inserts](/cloud/bestpractices/bulk-inserts)                                  | Learn why you should ingest data in bulk in ClickHouse                     |
| [Asynchronous Inserts](/cloud/bestpractices/asynchronous-inserts)                              | Learn how to asynchronously insert data if bulk inserts are not an option. |
| [Avoid Mutations](/cloud/bestpractices/avoid-mutations)                                   | Learn why you should avoid mutations which trigger rewrites.               |
| [Avoid Nullable Columns](/cloud/bestpractices/avoid-nullable-columns)                            | Learn why you should ideally avoid Nullable columns                        |
| [Avoid Optimize Final](/cloud/bestpractices/avoid-optimize-final)                              | Learn why you should avoid `OPTIMIZE TABLE ... FINAL`                      |
| [Choose a Low Cardinality Partitioning Key](/cloud/bestpractices/low-cardinality-partitioning-key)         | Learn how to choose a low cardinality partitioning key.                    |
| [Usage Limits](/cloud/bestpractices/usage-limits)| Explore the limits of ClickHouse.                                          |
| [Multi tenancy](/cloud/bestpractices/multi-tenancy)| Learn about different strategies to implement multi-tenancy.                                          |
