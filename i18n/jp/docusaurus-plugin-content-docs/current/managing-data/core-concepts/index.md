---
slug: /managing-data/core-concepts
title: 'コアコンセプト'
description: 'ClickHouse の動作に関するコアコンセプトを学ぶ'
keywords: ['コンセプト', 'パーツ', 'パーティション', 'プライマリインデックス']
doc_type: 'guide'
---

このセクションでは、
ClickHouse がどのように動作するかに関する主要なコアコンセプトを学びます。

| ページ                                         | 説明                                                                                                                                                                                                           |
|----------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Table parts](./parts.md)                        | ClickHouse におけるテーブルパーツ（table part）とは何かについて学びます。                                                                                                                                         |
| [Table partitions](./partitions.mdx)             | テーブルパーティション（table partition）とは何か、およびそれが何に使用されるかを学びます。                                                                                                                        |
| [Table part merges](./merges.mdx)                | テーブルパーツのマージ（table part merge）とは何か、およびそれが何に使用されるかを学びます。                                                                                                                      |
| [Table shards and replicas](./shards.mdx)        | テーブルシャード（table shard）とレプリカ（replica）とは何か、およびそれが何に使用されるかを学びます。                                                                                                             |
| [Primary indexes](./primary-indexes.mdx)         | ClickHouse のスパースなプライマリインデックスを紹介し、クエリ実行時に不要なデータを効率的にスキップする方法を説明します。インデックスがどのように構築・利用されるかを、効果を観測するための例とツールとともに解説します。高度なユースケースとベストプラクティスに関する詳細な解説へのリンクも含みます。 |
| [Architectural Overview](./academic_overview.mdx) | VLDB 2024 の学術論文に基づき、ClickHouse アーキテクチャを構成するすべてのコンポーネントを簡潔に概観するアカデミックな概要です。                                                                                   |