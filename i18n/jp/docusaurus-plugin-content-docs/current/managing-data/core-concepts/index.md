---
slug: /managing-data/core-concepts
title: '基本概念'
description: 'ClickHouse の動作に関する基本概念を学ぶ'
keywords: ['concepts', 'part', 'partition', 'primary index']
doc_type: 'guide'
---

このセクションでは、
ClickHouse がどのように動作するかに関する基本的な概念を学びます。

| Page                                         | Description                                                                                                                                                                                                           |
|----------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Table parts](./parts.md)                        | ClickHouse における table part が何かを学びます。                                                                                                                                                                   |
| [Table partitions](./partitions.mdx)             | table partition が何であり、どのような用途で使われるかを学びます。                                                                                                                                                  |
| [Table part merges](./merges.mdx)                | table part merge が何であり、どのような用途で使われるかを学びます。                                                                                                                                                 |
| [Table shards and replicas](./shards.mdx)        | table shard と replica が何であり、どのような用途で使われるかを学びます。                                                                                                                                           |
| [Primary indexes](./primary-indexes.mdx)         | ClickHouse のスパースな primary index を紹介し、クエリ実行時に不要なデータを効率的にスキップするのにどのように役立つかを説明します。インデックスの構築方法と利用方法を、例やその効果を観察するためのツールとともに解説します。高度なユースケースとベストプラクティス向けの詳細な解説へのリンクも含みます。 |
| [Architectural Overview](./academic_overview.mdx) | VLDB 2024 の学術論文に基づき、ClickHouse アーキテクチャのすべてのコンポーネントを簡潔かつ学術的な観点から概観します。                                                                                              |