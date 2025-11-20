---
slug: /data-modeling/overview
title: 'データモデリングの概要'
description: 'データモデリングの概要'
keywords: ['data modelling', 'schema design', 'dictionary', 'materialized view', 'data compression', 'denormalizing data']
doc_type: 'landing-page'
---

# データモデリング 

このセクションでは ClickHouse におけるデータモデリングについて説明し、次のトピックを扱います。

| Page                                                            | Description                                                                                                                                                                                   |
|-----------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [Schema Design](/data-modeling/schema-design)                   | クエリ、データ更新、レイテンシ、データ量などの要素を考慮し、最適なパフォーマンスを実現するための ClickHouse のスキーマ設計について説明します。                                                              |
| [Dictionary](/dictionary)                                       | クエリ性能の向上とデータの付加価値化のために、dictionary を定義して使用する方法を解説します。                                                                                              |
| [Materialized Views](/materialized-views)                       | ClickHouse における Materialized View および Refreshable Materialized View に関する情報です。                                                                                                           |
| [Projections](/data-modeling/projections)| ClickHouse における Projection に関する情報です。|
| [Data Compression](/data-compression/compression-in-clickhouse) | ClickHouse のさまざまな圧縮モードについて説明し、特定のデータ型やワークロードに適した圧縮方式を選択することで、データ保存とクエリ性能を最適化する方法を解説します。 |
| [Denormalizing Data](/data-modeling/denormalization)            | 関連するデータを 1 つのテーブルに格納することでクエリ性能の向上を図る、ClickHouse で用いられる非正規化アプローチについて説明します。                                                  |