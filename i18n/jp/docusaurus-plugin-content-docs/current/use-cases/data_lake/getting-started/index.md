---
title: 'レイクハウスのテーブルフォーマット入門'
sidebar_label: 'はじめに'
slug: /use-cases/data-lake/getting-started
sidebar_position: 1
pagination_prev: use-cases/data_lake/index
pagination_next: use-cases/data_lake/getting-started/querying-directly
description: 'ClickHouse を使用して、オープンなテーブル形式のデータに対してクエリ実行・高速化・書き戻しを行うためのハンズオン入門ガイドです。'
keywords: ['データレイク', 'レイクハウス', 'はじめに', 'iceberg', 'デルタレイク', 'hudi', 'paimon']
doc_type: 'guide'
---

このガイドでは、レイクハウスのテーブルフォーマットを扱うために ClickHouse が提供するコア機能について、ハンズオン形式で紹介します。

## データをそのままクエリする \{#querying-data-in-place\}

ClickHouse は、オブジェクトストレージに保存されたオープンテーブルフォーマットに対するクエリエンジンとして動作できます。データを複製することなく、既存の Iceberg、Delta Lake、Hudi、Paimon テーブルを ClickHouse から参照するだけで、すぐにクエリを実行できます。本番ワークロードを支える場合でも、対話的にデータを探索する場合でも利用可能です。これは、テーブル関数やテーブルエンジンを用いた直接読み取り、またはデータカタログへの接続によって実現できます。

- [オープンテーブル形式を直接クエリする](/use-cases/data-lake/getting-started/querying-directly) — ClickHouse のテーブル関数を使用して、事前のセットアップなしにオブジェクトストレージ内の Iceberg、Delta Lake、Hudi、Paimon テーブルを読み取ることができます。
- [データカタログに接続する](/use-cases/data-lake/getting-started/connecting-catalogs) — カタログを ClickHouse のデータベースとして公開し、標準 SQL を使用してそのテーブルをクエリできます。カタログ内の複数のテーブルへアクセスする必要がある場合に推奨されます。 

## 分析の高速化 \{#accelerating-analytics\}

低レイテンシな応答と高い同時実行性が求められるワークロードでは、オープンなテーブル形式のデータを ClickHouse の MergeTree エンジンにロードすることで、パフォーマンスを劇的に向上できます。スパースなプライマリ索引、スキップ索引、および列指向ストレージを利用することで、Parquet ファイルに対して数秒かかるクエリをミリ秒単位で完了できるようになります。

- [MergeTree による分析の高速化](/use-cases/data-lake/getting-started/accelerating-analytics) - カタログから MergeTree テーブルにデータをロードし、クエリを約 40 倍高速化します。

## データを書き戻す \{#writing-data-back\}

データは、ClickHouse からオープンテーブル形式へも流すことができます。古いデータを長期保存用ストレージにオフロードする場合でも、変換結果を下流システム向けに公開する場合でも、ClickHouse はオブジェクトストレージ上の Iceberg および Delta テーブルに書き込むことができます。

- [オープンテーブル形式へのデータ書き込み](/use-cases/data-lake/getting-started/writing-data) - ClickHouse から `INSERT INTO SELECT` を使用して、生データや集計結果を Iceberg テーブルに書き込みます。