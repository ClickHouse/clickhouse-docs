---
slug: /managing-data/deleting-data/overview
title: 'データの削除'
description: 'ClickHouse でのデータ削除方法の概要'
keywords: ['delete', 'truncate', 'drop', 'lightweight delete']
doc_type: 'guide'
---

このセクションでは、
ClickHouse でデータを削除する方法について説明します。

| Page                                                        | Description                                                                                                                  |
|-------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------|
| [Overview](./overview)                                     | ClickHouse におけるさまざまなデータ削除方法の概要を説明します。                                                              |
| [Lightweight deletes](/guides/developer/lightweight-delete) | `Lightweight Delete` を使用してデータを削除する方法について説明します。                                                      |
| [Delete mutations](/managing-data/delete_mutations)         | `Delete Mutations` について説明します。                                                                                      |
| [Truncate table](../truncate)                              | テーブルまたはデータベースのデータを削除しつつ、そのオブジェクト自体は保持する `TRUNCATE` の使い方について説明します。        |
| [Drop partitions](../drop_partition)                       | ClickHouse でパーティションを削除する方法について説明します。                                                                |