---
slug: /cloud/managed-postgres/extensions
sidebar_label: '拡張機能'
title: 'PostgreSQL 拡張機能'
description: 'ClickHouse Managed Postgres で利用可能な PostgreSQL 拡張機能'
keywords: ['postgres 拡張機能', 'postgis', 'pgvector', 'pg_cron', 'postgresql 拡張機能']
doc_type: 'ガイド'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge />

Managed Postgres には、データベースの機能を拡張するために選定された拡張機能が含まれています。以下に、利用可能な拡張機能とそのバージョンの一覧を示します。


## 拡張機能のインストール \{#installing-extensions\}

拡張機能をインストールするには、データベースに接続して次のコマンドを実行します。

```sql
CREATE EXTENSION extension_name;
```

現在インストールされている拡張機能を確認するには、次のコマンドを実行します:

```sql
SELECT * FROM pg_extension;
```

利用可能なすべての拡張機能とそのバージョンを表示するには、次のコマンドを実行します。

```sql
SELECT * FROM pg_available_extensions;
```


## 利用可能な拡張機能 \{#available-extensions\}

| Extension | Version | Description |
|-----------|---------|-------------|
| `h3` | 4.2.3 | PostgreSQL 用の H3 バインディング |
| `h3_postgis` | 4.2.3 | H3 と PostGIS の統合 |
| `hll` | 2.19 | HyperLogLog データを保存するための型 |
| `hypopg` | 1.4.2 | PostgreSQL 用の仮想（仮説）索引 |
| `ip4r` | 2.4 | IPv4 および IPv6 範囲索引用の型 |
| `mysql_fdw` | 1.2 | MySQL サーバーに対してクエリを実行するための foreign data wrapper |
| `orafce` | 4.16 | Oracle RDBMS の関数およびパッケージのサブセットをエミュレートする関数および演算子 |
| `pg_clickhouse` | 0.1 | PostgreSQL から ClickHouse データベースにクエリするためのインターフェイス |
| `pg_cron` | 1.6 | PostgreSQL 用のジョブスケジューラ |
| `pg_hint_plan` | 1.8.0 | PostgreSQL 用のオプティマイザヒント |
| `pg_ivm` | 1.13 | PostgreSQL におけるインクリメンタルビューのメンテナンス |
| `pg_partman` | 5.3.1 | 時間または ID によるパーティション化テーブルを管理するための拡張機能 |
| `pg_repack` | 1.5.3 | PostgreSQL データベース内のテーブルを最小限のロックで再編成 |
| `pg_similarity` | 1.0 | 類似度クエリをサポート |
| `pgaudit` | 18.0 | 監査機能を提供 |
| `pglogical` | 2.4.6 | PostgreSQL の論理レプリケーション拡張機能 |
| `pgrouting` | 4.0.0 | pgRouting 拡張機能 |
| `pgtap` | 1.3.4 | PostgreSQL 向けのユニットテスト |
| `plpgsql_check` | 2.8 | plpgsql 関数向けの拡張チェック |
| `postgis` | 3.6.1 | PostGIS のジオメトリおよびジオグラフィ空間型と関数 |
| `postgis_raster` | 3.6.1 | PostGIS のラスタ型および関数 |
| `postgis_sfcgal` | 3.6.1 | PostGIS の SFCGAL 関数 |
| `postgis_tiger_geocoder` | 3.6.1 | PostGIS の tiger ジオコーダおよび逆ジオコーダ |
| `postgis_topology` | 3.6.1 | PostGIS のトポロジ空間型および関数 |
| `address_standardizer` | 3.6.1 | 住所を構成要素に分解して解析するために使用。一般的に、ジオコーディングにおける住所正規化ステップをサポートするために使用される。 |
| `address_standardizer_data_us` | 3.6.1 | Address Standardizer 用の米国データセット例 |
| `prefix` | 1.2.0 | PostgreSQL 用の Prefix Range モジュール |
| `semver` | 0.41.0 | セマンティックバージョン用データ型 |
| `unit` | 7 | SI 単位拡張機能 |
| `vector` | 0.8.1 | ベクターデータ型および ivfflat・hnsw アクセスメソッド |

## pg_clickhouse extension \{#pg-clickhouse\}

`pg_clickhouse` 拡張機能は、すべての Managed Postgres インスタンスにあらかじめインストールされています。これにより、PostgreSQL から直接 ClickHouse データベースにクエリを実行でき、トランザクション処理と分析の両方に対するクエリレイヤーを統一できます。

セットアップ手順および使用方法の詳細については、[pg_clickhouse のドキュメント](/integrations/pg_clickhouse) を参照してください。