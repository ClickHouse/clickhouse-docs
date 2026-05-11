---
description: 'AWS Glue、Unity、REST、Lakekeeper、Nessie、OneLake などのデータレイクカタログに ClickHouse を接続するためのリファレンスガイド。'
pagination_prev: null
pagination_next: null
sidebar_position: 2
slug: /use-cases/data-lake/reference
title: 'カタログガイド'
keywords: ['データレイク', 'レイクハウス', 'カタログ', 'glue', 'unity', 'rest', 'lakekeeper', 'nessie', 'OneLake']
doc_type: 'landing-page'
---

ClickHouse は、[`DataLakeCatalog`](/engines/database-engines/datalakecatalog) データベースエンジンを通じて、さまざまなデータレイクカタログと連携します。以下のガイドでは、各対応カタログへの ClickHouse の接続方法を、設定や認証、クエリ例とともに解説します。

| カタログ | 説明 |
|---------|-------------|
| [AWS Glue](/use-cases/data-lake/glue-catalog) | S3 に保存されたデータから、AWS Glue Data Catalog に登録された Iceberg テーブルに対してクエリを実行します。 |
| [Databricks Unity Catalog](/use-cases/data-lake/unity-catalog) | Databricks Unity Catalog に接続して、Delta Lake および Iceberg テーブルを利用します。 |
| [Iceberg REST Catalog](/use-cases/data-lake/rest-catalog) | Tabular など、Iceberg REST 仕様を実装した任意のカタログを利用します。 |
| [Lakekeeper](/use-cases/data-lake/lakekeeper-catalog) | Iceberg テーブル向けに Lakekeeper Catalog に接続します。 |
| [Project Nessie](/use-cases/data-lake/nessie-catalog) | Git のようなデータバージョン管理を備えた Nessie Catalog を用いて Iceberg テーブルにクエリを実行します。 |
| [Microsoft OneLake](/use-cases/data-lake/onelake-catalog) | Microsoft Fabric OneLake 上の Iceberg テーブルにクエリを実行します。 |