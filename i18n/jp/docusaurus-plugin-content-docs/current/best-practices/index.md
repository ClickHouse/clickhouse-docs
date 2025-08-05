---
slug: '/best-practices'
keywords:
- 'Cloud'
- 'Primary key'
- 'Ordering key'
- 'Materialized Views'
- 'Best Practices'
- 'Bulk Inserts'
- 'Asynchronous Inserts'
- 'Avoid Mutations'
- 'Avoid Nullable Columns'
- 'Avoid Optimize Final'
- 'Partitioning Key'
title: '概要'
hide_title: true
description: 'ClickHouseのベストプラクティスセクションのランディングページ'
---




# Best Practices in ClickHouse {#best-practices-in-clickhouse}

このセクションでは、ClickHouseを最大限に活用するために従うべきベストプラクティスを提供します。

| ページ                                                                 | 説明                                                                  |
|----------------------------------------------------------------------|----------------------------------------------------------------------|
| [Choosing a Primary Key](/best-practices/choosing-a-primary-key)     | ClickHouseで効果的な主キーを選択するためのガイダンス。                       |
| [Select Data Types](/best-practices/select-data-types)               | 適切なデータ型を選択するための推奨事項。                                  |
| [Use Materialized Views](/best-practices/use-materialized-views)     | マテリアライズドビューを利用するタイミングと方法。                        |
| [Minimize and Optimize JOINs](/best-practices/minimize-optimize-joins)| JOIN操作を最小限に抑え、最適化するためのベストプラクティス。                    |
| [Choosing a Partitioning Key](/best-practices/choosing-a-partitioning-key) | パーティショニングキーを効果的に選択・適用する方法。                     |
| [Selecting an Insert Strategy](/best-practices/selecting-an-insert-strategy) | ClickHouseにおける効率的なデータ挿入戦略。                              |
| [Data Skipping Indices](/best-practices/use-data-skipping-indices-where-appropriate) | パフォーマンス向上のためにデータスキッピングインデックスを適用するタイミング。   |
| [Avoid Mutations](/best-practices/avoid-mutations)                   | ミューテーションを避ける理由と、それなしで設計する方法。                     |
| [Avoid OPTIMIZE FINAL](/best-practices/avoid-optimize-final)         | `OPTIMIZE FINAL`がコスト高になる理由とその回避方法。                       |
| [Use JSON where appropriate](/best-practices/use-json-where-appropriate) | ClickHouseにおけるJSONカラム使用の考慮事項。                             |
