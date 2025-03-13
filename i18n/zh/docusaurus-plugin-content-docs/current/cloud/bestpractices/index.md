---
slug: /cloud/bestpractices
keywords: ['Cloud', '最佳实践', '批量插入', '异步插入', '避免变更', '避免 Nullable 列', '避免优化最终', '低基数分区键']
title: '概述'
hide_title: true
---


# ClickHouse 最佳实践

本节提供六个最佳实践，您将希望遵循这些实践以充分利用 ClickHouse Cloud。

| 页面                                                     | 描述                                                                  |
|----------------------------------------------------------|----------------------------------------------------------------------|
| [使用批量插入](/cloud/bestpractices/bulk-inserts)                                  | 了解为什么您应该在 ClickHouse 中批量导入数据                        |
| [异步插入](/cloud/bestpractices/asynchronous-inserts)                              | 了解如何在批量插入不可用时异步插入数据。                             |
| [避免变更](/cloud/bestpractices/avoid-mutations)                                   | 了解为什么您应该避免触发重写的变更。                               |
| [避免 Nullable 列](/cloud/bestpractices/avoid-nullable-columns)                            | 了解为什么您应该尽量避免使用 Nullable 列。                         |
| [避免优化最终](/cloud/bestpractices/avoid-optimize-final)                              | 了解为什么您应该避免使用 `OPTIMIZE TABLE ... FINAL`                 |
| [选择低基数分区键](/cloud/bestpractices/low-cardinality-partitioning-key)         | 了解如何选择低基数分区键。                                          |
| [使用限制](/cloud/bestpractices/usage-limits)| 探索 ClickHouse 的限制。                                            |
