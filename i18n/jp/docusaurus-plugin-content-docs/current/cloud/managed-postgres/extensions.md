---
slug: /cloud/managed-postgres/extensions
sidebar_label: '拡張機能'
title: 'PostgreSQL 拡張機能'
description: 'ClickHouse Managed Postgres で利用可能な PostgreSQL 拡張機能'
keywords: ['postgres 拡張機能', 'postgis', 'pgvector', 'pg_cron', 'postgresql 拡張機能']
doc_type: 'ガイド'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge link="https://clickhouse.com/cloud/postgres" galaxyTrack={true} slug="extensions" />

Managed Postgres には、データベースの機能を拡張するために選定された拡張機能が含まれています。以下に、利用可能な拡張機能の一覧を示します。


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

| 拡張機能                           | バージョン  | 概要                                                              |
| ------------------------------ | ------ | --------------------------------------------------------------- |
| `address_standardizer`         | 3.6.1  | 住所を構成要素に分解して解析するために使用されます                                       |
| `address_standardizer_data_us` | 3.6.1  | Address Standardizer US データセットのサンプル                             |
| `adminpack`                    | 2.1    | PostgreSQL の管理用関数 *(PG16 のみ)*                                   |
| `amcheck`                      |        | リレーションの整合性を検証する関数                                               |
| `autoinc`                      | 1.0    | オートインクリメントフィールド用の関数                                             |
| `bloom`                        | 1.0    | Bloom アクセスメソッド - シグネチャファイルベースの索引                                |
| `bool_plperl`                  | 1.0    | bool 型と plperl 間の変換                                             |
| `bool_plperlu`                 | 1.0    | bool 型と plperlu 言語間の変換                                          |
| `btree_gin`                    | 1.3    | GIN における一般的なデータ型への索引作成をサポート                                     |
| `btree_gist`                   | 1.8    | 一般的なデータ型に対する GiST 索引のサポート                                       |
| `citext`                       | 1.8    | 大文字と小文字を区別しない文字列データ型                                            |
| `cube`                         | 1.5    | 多次元キューブを表すデータ型                                                  |
| `dblink`                       | 1.2    | 1つのデータベースから他の PostgreSQL データベースへ接続する                            |
| `dict_int`                     | 1.0    | 整数用テキスト検索 Dictionary テンプレート                                     |
| `dict_xsyn`                    | 1.0    | 拡張された同義語処理用のテキスト検索辞書テンプレート                                      |
| `earthdistance`                | 1.2    | 地球表面上の大円距離を計算する                                                 |
| `file_fdw`                     | 1.0    | フラットファイルアクセス用の外部データラッパー                                         |
| `fuzzystrmatch`                | 1.2    | 文字列同士の類似度および距離を算出する                                             |
| `h3`                           | 4.2.3  | PostgreSQL 向け H3 バインディング                                        |
| `h3_postgis`                   | 4.2.3  | H3 と PostGIS の統合                                                |
| `hll`                          | 2.19   | HyperLogLog データを格納するためのデータ型                                     |
| `hstore`                       | 1.8    | キーと値のペア集合を格納するためのデータ型                                           |
| `hstore_plperl`                | 1.0    | hstore と plperl の相互変換                                           |
| `hstore_plperlu`               | 1.0    | hstore と plperlu 間の相互変換                                         |
| `hypopg`                       | 1.4.2  | PostgreSQL 用の仮想的な索引                                             |
| `intagg`                       | 1.1    | 整数の集約および列挙機能 (廃止済み)                                             |
| `insert_username`              | 1.0    | テーブルの変更者を追跡するための関数                                              |
| `intarray`                     | 1.5    | 整数の1次元配列用の関数、演算子、および索引のサポート                                     |
| `ip4r`                         | 2.4    | IPv4 および IPv6 範囲の索引型                                            |
| `isn`                          | 1.3    | 国際商品番号規格用データ型                                                   |
| `jsonb_plperl`                 | 1.0    | jsonb と plperl の相互変換                                            |
| `jsonb_plperlu`                | 1.0    | jsonb と plperlu の相互変換                                           |
| `lo`                           | 1.2    | ラージオブジェクトの管理                                                    |
| `ltree`                        | 1.3    | 階層的なツリー構造を表現するためのデータ型                                           |
| `moddatetime`                  | 1.0    | 最終更新時刻を追跡する関数群                                                  |
| `mysql_fdw`                    | 1.2    | MySQL サーバーに対してクエリを実行するための外部データラッパー                              |
| `old_snapshot`                 | 1.0    | old&#95;snapshot&#95;threshold をサポートするユーティリティ群 *(PG16 のみ)*      |
| `orafce`                       | 4.16   | Oracle RDBMS の関数およびパッケージの一部をエミュレートする関数と演算子                      |
| `pageinspect`                  | 1.13   | データベースページの内容を低レベルで調査する                                          |
| `pg_buffercache`               |        | 共有バッファキャッシュを検査する                                                |
| `pg_clickhouse`                | 0.1    | PostgreSQL から ClickHouse データベースをクエリするためのインターフェース                |
| `pg_cron`                      | 1.6    | PostgreSQL 用のジョブスケジューラ                                          |
| `pg_freespacemap`              | 1.3    | 空き領域マップ (FSM) を確認する                                             |
| `pg_hint_plan`                 |        | PostgreSQL 向けのオプティマイザーヒント                                       |
| `pg_ivm`                       | 1.13   | PostgreSQL 向けインクリメンタルビューのメンテナンス機能                               |
| `pg_logicalinspect`            | 1.0    | 論理デコーディングコンポーネントを検査する関数 *(PG18+)*                               |
| `pg_partman`                   | 5.4.0  | 時間またはIDでパーティション分割されたテーブルを管理する拡張機能                               |
| `pg_prewarm`                   | 1.2    | リレーションデータを事前に読み込みキャッシュ                                          |
| `pg_re2`                       |        | Google の RE2 をバックエンドとする ClickHouse 互換の正規表現関数                    |
| `pg_repack`                    | 1.5.3  | PostgreSQL データベース内のテーブルを最小限のロックで再編成                             |
| `pg_similarity`                | 1.0    | 類似度検索をサポート                                                      |
| `pg_stat_ch`                   |        | クエリごとの実行テレメトリをリアルタイムで ClickHouse にストリーミングする                     |
| `pg_stat_statements`           |        | 実行されたすべての SQL 文のプランニングおよび実行に関する統計情報を追跡します                       |
| `pg_surgery`                   | 1.0    | 破損したリレーションに対して外科的な修復操作を行うための拡張機能                                |
| `pg_tokenizer`                 | 0.1.1  | `vchord_bm25` で使用されるテキストトークナイザー                                 |
| `pg_trgm`                      | 1.6    | トライグラムに基づくテキスト類似度の計測および索引検索                                     |
| `pg_visibility`                | 1.2    | 可視性マップ (VM) およびページ単位の可視性情報を調査します                                |
| `pg_walinspect`                | 1.1    | PostgreSQL Write-Ahead Log の内容を検査する関数                           |
| `pgaudit`                      |        | 監査機能を提供する                                                       |
| `pgcrypto`                     | 1.4    | 暗号化関数                                                           |
| `pglogical`                    | 2.4.6  | PostgreSQL の論理レプリケーション                                          |
| `pglogical_origin`             | 1.0.0  | Postgres 9.4 からのアップグレード時の互換性を確保するためのダミー拡張機能                     |
| `pgrouting`                    | 4.0.0  | pgRouting 拡張機能                                                  |
| `pgrowlocks`                   | 1.2    | 行レベルロック情報を表示                                                    |
| `pgstattuple`                  | 1.5    | タプルレベルの統計情報を表示                                                  |
| `pgtap`                        | 1.3.4  | PostgreSQL 用ユニットテスト                                             |
| `plperl`                       | 1.0    | PL/Perl 手続き言語                                                   |
| `plperlu`                      | 1.0    | PL/PerlU 非信頼手続き言語                                               |
| `plpgsql`                      | 1.0    | PL/pgSQL 手続き言語                                                  |
| `plpgsql_check`                | 2.8    | PL/pgSQL 関数向け拡張チェック                                             |
| `postgis`                      | 3.6.1  | PostGIS の geometry / geography 空間データ型および関数                      |
| `postgis_raster`               | 3.6.1  | PostGIS のラスターデータ型および関数                                          |
| `postgis_sfcgal`               | 3.6.1  | PostGIS SFCGAL の関数                                              |
| `postgis_tiger_geocoder`       | 3.6.1  | PostGIS Tiger のジオコーダーおよびリバースジオコーダー                              |
| `postgis_topology`             | 3.6.1  | トポロジ用の空間型および関数                                                  |
| `postgres_fdw`                 | 1.2    | リモート PostgreSQL サーバー用の外部データラッパー                                 |
| `prefix`                       | 1.2.0  | PostgreSQL 用 Prefix Range モジュール                                 |
| `refint`                       | 1.0    | 参照整合性を実装する関数群 (非推奨)                                             |
| `seg`                          | 1.4    | 線分または浮動小数点数の区間を表すデータ型                                           |
| `semver`                       | 0.41.0 | セマンティックバージョン番号を表すデータ型                                           |
| `sslinfo`                      | 1.2    | SSL 証明書情報                                                       |
| `tablefunc`                    | 1.0    | テーブル全体 (クロスタブを含む) を操作する関数                                       |
| `tcn`                          | 1.0    | トリガによる変更通知                                                      |
| `tds_fdw`                      | 2.0.5  | TDS データベース (Sybase または Microsoft SQL Server) をクエリするための外部データラッパー |
| `tsm_system_rows`              | 1.0    | 行数を上限として指定できる TABLESAMPLE メソッド                                  |
| `tsm_system_time`              | 1.0    | 制限としてミリ秒単位の時間を受け付ける TABLESAMPLE メソッド                            |
| `uint`                         |        | 符号なし整数型                                                         |
| `unaccent`                     | 1.1    | アクセント記号を取り除くテキスト検索用 Dictionary                                  |
| `unit`                         | 7      | SI 単位用拡張機能                                                      |
| `uuid-ossp`                    | 1.1    | UUID (Universally Unique Identifier) を生成します                     |
| `vchord`                       | 1.1.1  | Postgres 向けベクトルインデックス用アクセスメソッド                                  |
| `vchord_bm25`                  | 0.3.0  | 全文検索用の BM25 ランキングアクセスメソッド                                       |
| `vector`                       | 0.8.1  | ベクトルデータ型および ivfflat、hnsw アクセスメソッド                               |
| `xml2`                         | 1.2    | XPath クエリ処理と XSLT                                               |

## pg_clickhouse extension \{#pg-clickhouse\}

`pg_clickhouse` 拡張機能は、すべての Managed Postgres インスタンスにあらかじめインストールされています。これにより、PostgreSQL から直接 ClickHouse データベースにクエリを実行でき、トランザクション処理と分析の両方に対するクエリレイヤーを統一できます。

セットアップ手順および使用方法の詳細については、[pg_clickhouse のドキュメント](/integrations/pg_clickhouse) を参照してください。

## pg_stat_ch 拡張機能 \{#pg-stat-ch\}

`pg_stat_ch` 拡張機能は、Managed Postgres インスタンスにクエリレベルのオブザーバビリティを提供します。クエリごとのテレメトリ (実行時間、行、バッファ、WAL、エラー) を収集し、ClickHouse Cloud UI に送信します。ClickHouse Cloud UI では、スロークエリ、エラー、ワークロードの各ビューで確認できます。設定は不要です。

## pg_re2 拡張機能 \{#pg-re2\}

`pg_re2` 拡張機能は、Google の RE2 エンジンをベースに、ClickHouse 互換の正規表現関数を Managed Postgres に追加します。両者間でクエリを移植する場合や、両側で同一のパターンマッチング動作が必要なハイブリッド ワークロードを実行する場合に便利です。