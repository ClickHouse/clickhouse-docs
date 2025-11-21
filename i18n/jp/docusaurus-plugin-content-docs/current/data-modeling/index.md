---
slug: /data-modeling/overview
title: 'データモデリング概要'
description: 'データモデリングの概要'
keywords: ['データモデリング', 'スキーマ設計', '辞書', 'マテリアライズドビュー', 'データ圧縮', 'データの非正規化']
doc_type: 'landing-page'
---

# データモデリング

このセクションでは ClickHouse におけるデータモデリングについて説明し、次のトピックを含みます。

| ページ                                                          | 説明                                                                                                                                                                                           |
|-----------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Schema Design](/data-modeling/schema-design)                   | クエリ、データ更新、レイテンシ、ボリュームなどの要因を考慮しながら、最適なパフォーマンスを実現する ClickHouse のスキーマ設計について説明します。                                               |
| [Dictionary](/dictionary)                                       | クエリパフォーマンスの向上やデータの拡充のために、辞書を定義して利用する方法について解説します。                                                                                              |
| [Materialized Views](/materialized-views)                       | ClickHouse におけるマテリアライズドビュー（Materialized Views）および更新可能マテリアライズドビュー（Refreshable Materialized Views）に関する情報です。                                       |
| [Projections](/data-modeling/projections)                       | ClickHouse におけるプロジェクション（Projections）に関する情報です。                                                                                                                          |
| [Data Compression](/data-compression/compression-in-clickhouse) | ClickHouse で利用可能な各種圧縮モードと、特定のデータ型やワークロードに適した圧縮方式を選択することで、データ保存とクエリパフォーマンスを最適化する方法について説明します。                   |
| [Denormalizing Data](/data-modeling/denormalization)            | 関連データを 1 つのテーブルに格納することでクエリパフォーマンスの向上を図る、ClickHouse で採用されている非正規化アプローチについて説明します。                                                |