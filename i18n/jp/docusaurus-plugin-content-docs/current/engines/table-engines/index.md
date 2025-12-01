---
description: 'テーブルエンジンのドキュメント'
slug: /engines/table-engines/
toc_folder_title: 'テーブルエンジン'
toc_priority: 26
toc_title: '概要'
title: 'テーブルエンジン'
doc_type: 'reference'
---



# テーブルエンジン {#table-engines}

テーブルエンジン（テーブルの種類）は、次の点を決定します。

- データの保存方法と保存場所、書き込み先および読み取り元。
- どのクエリがどのようにサポートされるか。
- データへの同時アクセス。
- インデックスが存在する場合の利用方法。
- リクエストをマルチスレッドで実行できるかどうか。
- データレプリケーションの設定。



## エンジンファミリー {#engine-families}

### MergeTree {#mergetree}

高負荷ワークロード向けの、最も汎用的かつ高機能なテーブルエンジンです。これらのエンジンに共通する特性は、高速なデータ挿入と、その後のバックグラウンドでのデータ処理です。`MergeTree` ファミリーのエンジンは、データレプリケーション（エンジンの [Replicated\*](/engines/table-engines/mergetree-family/replication) バージョンによる）、パーティショニング、セカンダリのデータスキップインデックス、その他のエンジンではサポートされない機能をサポートします。

このファミリーに含まれるエンジン:

| MergeTree エンジン                                                                                                                        |
|-------------------------------------------------------------------------------------------------------------------------------------------|
| [MergeTree](/engines/table-engines/mergetree-family/mergetree)                                                          |
| [ReplacingMergeTree](/engines/table-engines/mergetree-family/replacingmergetree)                               |
| [SummingMergeTree](/engines/table-engines/mergetree-family/summingmergetree)                                     |
| [AggregatingMergeTree](/engines/table-engines/mergetree-family/aggregatingmergetree)                         |
| [CollapsingMergeTree](/engines/table-engines/mergetree-family/collapsingmergetree)               |
| [VersionedCollapsingMergeTree](/engines/table-engines/mergetree-family/versionedcollapsingmergetree) |
| [GraphiteMergeTree](/engines/table-engines/mergetree-family/graphitemergetree)                                  |
| [CoalescingMergeTree](/engines/table-engines/mergetree-family/coalescingmergetree)                                     |

### Log {#log}

最小限の機能を持つ軽量な [エンジン](../../engines/table-engines/log-family/index.md) です。多数の小さなテーブル（最大で約 100 万行）をすばやく書き込み、その後にテーブル全体をまとめて読み出す必要がある場合に最も効果的です。

このファミリーに含まれるエンジン:

| Log エンジン                                                               |
|----------------------------------------------------------------------------|
| [TinyLog](/engines/table-engines/log-family/tinylog)       |
| [StripeLog](/engines/table-engines/log-family/stripelog) |
| [Log](/engines/table-engines/log-family/log)                   |

### 統合エンジン {#integration-engines}

他のデータストレージおよび処理システムと連携するためのエンジンです。

このファミリーに含まれるエンジン:

| 統合エンジン                                                                      |
|---------------------------------------------------------------------------------|
| [ODBC](../../engines/table-engines/integrations/odbc.md)                        |
| [JDBC](../../engines/table-engines/integrations/jdbc.md)                        |
| [MySQL](../../engines/table-engines/integrations/mysql.md)                      |
| [MongoDB](../../engines/table-engines/integrations/mongodb.md)                  |
| [Redis](../../engines/table-engines/integrations/redis.md)                      |
| [HDFS](../../engines/table-engines/integrations/hdfs.md)                        |
| [S3](../../engines/table-engines/integrations/s3.md)                            |
| [Kafka](../../engines/table-engines/integrations/kafka.md)                      |
| [EmbeddedRocksDB](../../engines/table-engines/integrations/embedded-rocksdb.md) |
| [RabbitMQ](../../engines/table-engines/integrations/rabbitmq.md)                |
| [PostgreSQL](../../engines/table-engines/integrations/postgresql.md)            |
| [S3Queue](../../engines/table-engines/integrations/s3queue.md)                  |
| [TimeSeries](../../engines/table-engines/integrations/time-series.md)           |

### 特殊エンジン {#special-engines}

このファミリーに含まれるエンジン:



| 特殊エンジン                                                   |
|---------------------------------------------------------------|
| [Distributed](/engines/table-engines/special/distributed)     |
| [Dictionary](/engines/table-engines/special/dictionary)       |
| [Merge](/engines/table-engines/special/merge)                 |
| [Executable](/engines/table-engines/special/executable)       |
| [File](/engines/table-engines/special/file)                   |
| [Null](/engines/table-engines/special/null)                   |
| [Set](/engines/table-engines/special/set)                     |
| [Join](/engines/table-engines/special/join)                   |
| [URL](/engines/table-engines/special/url)                     |
| [View](/engines/table-engines/special/view)                   |
| [Memory](/engines/table-engines/special/memory)               |
| [Buffer](/engines/table-engines/special/buffer)               |
| [External Data](/engines/table-engines/special/external-data) |
| [GenerateRandom](/engines/table-engines/special/generate)     |
| [KeeperMap](/engines/table-engines/special/keeper-map)        |
| [FileLog](/engines/table-engines/special/filelog)             |



## 仮想列 {#table_engines-virtual_columns}

仮想列は、テーブルエンジンのソースコード内で定義されている、そのテーブルエンジンに本質的な属性です。

`CREATE TABLE` クエリで仮想列を指定してはならず、`SHOW CREATE TABLE` や `DESCRIBE TABLE` クエリの結果にも表示されません。仮想列は読み取り専用であり、仮想列にデータを挿入することはできません。

仮想列からデータを取得するには、その名前を `SELECT` クエリで指定する必要があります。`SELECT *` では仮想列の値は返されません。

テーブルの仮想列の 1 つと同じ名前の列を定義してテーブルを作成した場合、その仮想列にはアクセスできなくなります。このような構成は推奨されません。競合を避けるため、仮想列の名前には通常アンダースコアが接頭辞として付けられます。

- `_table` — データが読み取られたテーブル名を含みます。型: [String](../../sql-reference/data-types/string.md)。

    使用されているテーブルエンジンに関係なく、各テーブルには `_table` という名前の汎用仮想列が含まれています。

    マージテーブルエンジンを使用するテーブルに対してクエリを実行する場合、`WHERE` / `PREWHERE` 句で `_table` に対する定数条件を設定できます（例: `WHERE _table='xyz'`）。この場合、読み取り処理は `_table` に対する条件が満たされるテーブルに対してのみ実行されるため、`_table` 列はインデックスとして機能します。

    `SELECT ... FROM (... UNION ALL ...)` のような形式のクエリを使用する場合、`_table` 列を指定することで、返された行がどの実テーブルに由来するかを判別できます。
