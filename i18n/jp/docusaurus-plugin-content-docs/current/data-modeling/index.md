---
slug: /data-modeling/overview
title: 'データモデリングの概要'
description: 'データモデリングの概要'
keywords: ['data modelling', 'schema design', 'dictionary', 'materialized view', 'data compression', 'denormalizing data']
doc_type: 'landing-page'
---

# データモデリング 

このセクションでは ClickHouse におけるデータモデリングについて説明し、次のトピックを含みます：

| ページ                                                            | 説明                                                                                                                                                                                   |
|-----------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Schema Design](/data-modeling/schema-design)                   | クエリ、データ更新、レイテンシ、データ量などの要因を考慮し、最適なパフォーマンスを実現するための ClickHouse のスキーマ設計について説明します。                                               |
| [Dictionary](/dictionary)                                       | クエリパフォーマンスを向上させ、データをリッチ化するためのディクショナリの定義方法と使用方法について解説します。                                                                           |
| [Materialized Views](/materialized-views)                       | ClickHouse におけるマテリアライズドビューおよびリフレッシュ可能なマテリアライズドビューに関する情報です。                                                                                           |
| [Projections](/data-modeling/projections)| ClickHouse におけるプロジェクションに関する情報です。|
| [Data Compression](/data-compression/compression-in-clickhouse) | ClickHouse のさまざまな圧縮モードと、特定のデータ型およびワークロードに適した圧縮方式を選択することで、データ保存とクエリパフォーマンスを最適化する方法について説明します。                     |
| [Denormalizing Data](/data-modeling/denormalization)            | 関連するデータを 1 つのテーブルに格納することでクエリパフォーマンスの向上を目指す、ClickHouse で使用される非正規化アプローチについて説明します。                                           |