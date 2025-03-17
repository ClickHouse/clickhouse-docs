---
slug: /data-modeling/overview
title: データモデリングの概要
description: データモデリングの概要
keywords: [データモデリング, スキーマ設計, Dictionary, Materialized View, データ圧縮, データの非正規化]
---


# データモデリング 

このセクションでは、ClickHouseにおけるデータモデリングについて説明し、以下のトピックを含みます。

| ページ                                                              | 説明                                                                                                                                                                                         |
|-------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [スキーマ設計](/data-modeling/schema-design)                       | クエリ、データ更新、レイテンシ、ボリュームなどの要因を考慮した最適なパフォーマンスのためのClickHouseのスキーマ設計について説明します。                                                        |
| [Dictionary](/dictionary)                                         | クエリパフォーマンスを向上させ、データを豊かにするためにDictionaryを定義して使用する方法について説明します。                                                                               |
| [Materialized Views](/materialized-views)                         | ClickHouseにおけるMaterialized ViewsおよびRefreshable Materialized Viewsの情報を提供します。                                                                                                  |
| [データ圧縮](/data-compression/compression-in-clickhouse)         | ClickHouseにおけるさまざまな圧縮モードと、特定のデータタイプやワークロードに応じて最適な圧縮方法を選択することでデータストレージとクエリパフォーマンスを最適化する方法について説明します。                     |
| [データの非正規化](/data-modeling/denormalization)                | 関連データを単一のテーブルに格納することでクエリパフォーマンスを向上させることを目的としたClickHouseでの非正規化アプローチについて説明します。                                                     |
