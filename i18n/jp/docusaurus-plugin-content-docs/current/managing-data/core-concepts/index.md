---
slug: /managing-data/core-concepts
title: 'コアコンセプト'
description: 'ClickHouse の動作に関する主要な概念を学ぶ'
keywords: ['concepts', 'part', 'partition', 'primary index']
doc_type: 'guide'
---

このセクションでは、
ClickHouse がどのように動作するかを理解するうえで重要な、いくつかの基本概念について説明します。

| Page                                         | Description                                                                                                                                                                                                           |
|----------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Table parts](./parts.md)                        | ClickHouse におけるテーブルパーツ（table part）とは何かを解説します。                                                                                                                                                    |
| [Table partitions](./partitions.mdx)             | テーブルパーティション（table partition）とは何か、その役割と用途について学びます。                                                                                                                                      |
| [Table part merges](./merges.mdx)                | テーブルパーツのマージ（table part merge）とは何か、その目的と仕組みについて学びます。                                                                                                                                   |
| [Table shards and replicas](./shards.mdx)        | テーブルシャード（table shard）とレプリカ（replica）とは何か、それぞれの役割と用途について学びます。                                                                                                                     |
| [Primary indexes](./primary-indexes.mdx)         | ClickHouse の疎なプライマリインデックスを紹介し、クエリ実行時に不要なデータを効率よくスキップする仕組みを説明します。インデックスの構築方法と利用方法を、効果を確認するための例やツールとともに解説し、高度なユースケースとベストプラクティスを扱う詳細な解説へのリンクも示します。 |
| [Architectural Overview](./academic_overview.mdx) | VLDB 2024 の学術論文に基づき、ClickHouse アーキテクチャを構成するすべてのコンポーネントを簡潔に概説します。                                                                                                             |