---
slug: /managing-data/deleting-data/overview
title: '删除数据'
description: '如何在 ClickHouse 中删除数据（目录）'
keywords: ['delete', 'truncate', 'drop', 'lightweight delete']
doc_type: 'guide'
---

在本节文档中，
我们将介绍如何在 ClickHouse 中删除数据。

| Page                                                        | Description                                                                                                                  |
|-------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| [Overview](./overview)                                     | 概述在 ClickHouse 中删除数据的多种方式。                                                       |
| [Lightweight deletes](/guides/developer/lightweight-delete) | 了解如何使用轻量级删除（Lightweight Delete）功能删除数据。                                                                      |
| [Delete mutations](/managing-data/delete_mutations)         | 了解删除变更（Delete Mutations）机制。                                                                                                |
| [Truncate table](../truncate)                              | 了解如何使用 TRUNCATE，在保留表或数据库本身的前提下删除其中的数据。 |
| [Drop partitions](../drop_partition)                       | 了解如何在 ClickHouse 中删除分区。                                                                               |