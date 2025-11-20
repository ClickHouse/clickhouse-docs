---
slug: /managing-data/core-concepts
title: 'コアコンセプト'
description: 'ClickHouse の仕組みに関するコアコンセプトを学ぶ'
keywords: ['concepts', 'part', 'partition', 'primary index']
doc_type: 'guide'
---

このセクションでは、
ClickHouse の仕組みに関するいくつかのコアコンセプトについて学びます。

| Page                                         | Description                                                                                                                                                                                                           |
|----------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Table parts](./parts.md)                        | ClickHouse における table part とは何かを学びます。                                                                                                                                                                             |
| [Table partitions](./partitions.mdx)             | table partition とは何か、およびその用途について学びます。                                                                                                                                                           |
| [Table part merges](./merges.mdx)                | table part のマージとは何か、およびその用途について学びます。                                                                                                                                                          |
| [Table shards and replicas](./shards.mdx)        | table shard と replica とは何か、およびその用途について学びます。                                                                                                                                                  |
| [Primary indexes](./primary-indexes.mdx)         | ClickHouse の疎な primary index を紹介し、クエリ実行時に不要なデータを効率的にスキップする仕組みを説明します。インデックスの構築方法と利用方法を、例およびその効果を観察するためのツールとともに解説します。さらに、発展的なユースケースとベストプラクティスを詳説したコンテンツへのリンクも示します。 |
| [Architectural Overview](./academic_overview.mdx) | VLDB 2024 の学術論文に基づき、ClickHouse アーキテクチャを構成するすべてのコンポーネントについて簡潔に概説します。                                                                                                |