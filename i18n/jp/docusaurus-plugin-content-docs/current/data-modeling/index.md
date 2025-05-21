---
slug: /data-modeling/overview
title: 'データモデリングの概要'
description: 'データモデリングの概要'
keywords: ['データモデリング', 'スキーマ設計', 'Dictionary', 'Materialized View', 'データ圧縮', 'データの非正規化']
---


# データモデリング 

このセクションでは、ClickHouseにおけるデータモデリングについて説明し、以下のトピックを含みます。

| ページ                                                            | 説明                                                                                                                                                                                   |
|-----------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [スキーマ設計](/data-modeling/schema-design)                   | クエリ、データ更新、レイテンシ、ボリュームなどの要因を考慮して、最適なパフォーマンスのためのClickHouseのスキーマ設計について議論します。                                                              |
| [Dictionary](/dictionary)                                       | クエリパフォーマンスを改善し、データを豊かにするためにDictionaryを定義し、使用する方法について説明します。                                                                                              |
| [Materialized Views](/materialized-views)                       | ClickHouseにおけるMaterialized ViewsおよびRefreshable Materialized Viewsに関する情報です。                                                                                                           |
| [Projections](/data-modeling/projections)| ClickHouseにおけるProjectionsに関する情報です。|
| [データ圧縮](/data-compression/compression-in-clickhouse) | ClickHouseのさまざまな圧縮モードと、特定のデータタイプとワークロードに対して最適な圧縮方法を選択することでデータストレージとクエリパフォーマンスを最適化する方法について議論します。 |
| [データの非正規化](/data-modeling/denormalization)            | 関連するデータを1つのテーブルに保存することによってクエリパフォーマンスを改善することを目的としたClickHouseで使用される非正規化アプローチについて議論します。                                                  |
