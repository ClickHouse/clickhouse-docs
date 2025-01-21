---
slug: /en/cloud/bestpractices
keywords: [Cloud, Best Practices, Bulk Inserts, Asynchronous Inserts, Avoid Mutations, Avoid Nullable Columns, Avoid Optimize Final, Low Cardinality Partitioning Key]
title: Overview
hide_title: true
---

# Best Practices in ClickHouse

This section provides six best practices you will want to follow to get the most out of ClickHouse Cloud.

| Page                                                     | Description                                                                |
|----------------------------------------------------------|----------------------------------------------------------------------------|
| [Use Bulk Inserts](/docs/en/cloud/bestpractices/bulk-inserts)                                  | Learn why you should ingest data in bulk in ClickHouse                     |
| [Asynchronous Inserts](/docs/en/cloud/bestpractices/asynchronous-inserts)                              | Learn how to asynchronously insert data if bulk inserts are not an option. |
| [Avoid Mutations](/docs/en/cloud/bestpractices/avoid-mutations)                                   | Learn why you should avoid mutations which trigger rewrites.               |
| [Avoid Nullable Columns](/docs/en/cloud/bestpractices/avoid-nullable-columns)                            | Learn why you should ideally avoid Nullable columns                        |
| [Avoid Optimize Final](/docs/en/cloud/bestpractices/avoid-optimize-final)                              | Learn why you should avoid `OPTIMIZE TABLE ... FINAL`                      |
| [Choose a Low Cardinality Partitioning Key](/docs/en/cloud/bestpractices/low-cardinality-partitioning-key)         | Learn how to choose a low cardinality partitioning key.                    |
| [Usage Limits](/docs/en/cloud/bestpractices/usage-limits)| Explore the limits of ClickHouse.                                          |