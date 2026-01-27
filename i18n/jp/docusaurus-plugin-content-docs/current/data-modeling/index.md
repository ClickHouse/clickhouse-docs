---
slug: /data-modeling/overview
title: 'データモデリングの概要'
description: 'データモデリングの概要'
keywords: ['データモデリング', 'スキーマ設計', 'ディクショナリ', 'マテリアライズドビュー', 'データ圧縮', 'データの非正規化']
doc_type: 'landing-page'
---

# データモデリング \{#data-modeling\}

このセクションでは ClickHouse におけるデータモデリングについて説明し、次のトピックを扱います：

| ページ                                                            | 説明                                                                                                                                                                                           |
|-----------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Schema Design](/data-modeling/schema-design)                   | クエリ特性、データ更新頻度、レイテンシ要件、データ量などを考慮し、最適なパフォーマンスを実現するための ClickHouse のスキーマ設計について解説します。                                             |
| [Dictionary](/dictionary)                                       | クエリパフォーマンスの向上とデータの拡充のために、ディクショナリを定義および利用する方法について説明します。                                                                                  |
| [Materialized Views](/materialized-views)                       | ClickHouse におけるマテリアライズドビューおよびリフレッシュ可能なマテリアライズドビューに関する情報です。                                                                                      |
| [Projections](/data-modeling/projections)| ClickHouse における Projection（プロジェクション）に関する情報です。|
| [Data Compression](/data-compression/compression-in-clickhouse) | ClickHouse のさまざまな圧縮モードと、特定のデータ型やワークロードに対して適切な圧縮方式を選択することで、データ保存とクエリパフォーマンスを最適化する方法について説明します。                   |
| [Denormalizing Data](/data-modeling/denormalization)            | 関連するデータを 1 つのテーブルに格納することでクエリパフォーマンスの向上を図る、ClickHouse で用いられる非正規化アプローチについて説明します。                                                 |