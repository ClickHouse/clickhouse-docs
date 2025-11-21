---
slug: /managing-data/deleting-data/overview
title: 'データの削除'
description: 'ClickHouse におけるデータ削除方法 - 目次'
keywords: ['delete', 'truncate', 'drop', 'lightweight delete']
doc_type: 'guide'
---

このセクションでは、
ClickHouse でデータを削除する方法を説明します。

| Page                                                        | Description                                                                                                                  |
|-------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| [Overview](./overview)                                      | ClickHouse でデータを削除するさまざまな方法の概要を説明します。                                                                 |
| [Lightweight deletes](/guides/developer/lightweight-delete) | データを削除するために Lightweight Delete を使用する方法について説明します。                                                   |
| [Delete mutations](/managing-data/delete_mutations)         | Delete Mutations について説明します。                                                                                          |
| [Truncate table](../truncate)                               | テーブルまたはデータベース内のデータを削除しつつ、その存在は維持する `TRUNCATE` の使用方法について説明します。                     |
| [Drop partitions](../drop_partition)                        | ClickHouse におけるパーティションの削除方法について説明します。                                                                |