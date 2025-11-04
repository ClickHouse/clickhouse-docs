---
'description': 'Table Enginesのドキュメント'
'slug': '/engines/table-engines/'
'toc_folder_title': 'Table Engines'
'toc_priority': 26
'toc_title': 'Introduction'
'title': 'テーブルエンジン'
'doc_type': 'reference'
---


# テーブルエンジン

テーブルエンジン（テーブルの種類）は以下を決定します：

- データの保存方法と場所、書き込み先および読み込み先。
- サポートされているクエリとその方法。
- 同時データアクセス。
- インデックスの使用（存在する場合）。
- マルチスレッドリクエスト実行が可能かどうか。
- データレプリケーションパラメータ。

## エンジンファミリー {#engine-families}

### MergeTree {#mergetree}

高負荷タスクに最も汎用的で機能的なテーブルエンジンです。これらのエンジンに共通する特性は、迅速なデータ挿入とその後のバックグラウンドデータ処理です。 `MergeTree`ファミリーのエンジンは、データレプリケーション（[Replicated\*](/engines/table-engines/mergetree-family/replication)バージョンのエンジン）、パーティショニング、セカンダリデータスキッピングインデックス、その他のエンジンではサポートされていない機能をサポートしています。

ファミリー内のエンジン：

| MergeTree エンジン                                                                                                                         |
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

最小機能を持つ軽量の[エンジン](../../engines/table-engines/log-family/index.md)です。大量の小さなテーブル（約100万行まで）を迅速に書き込み、後でそれらを全体として読む必要がある場合に最も効果的です。

ファミリー内のエンジン：

| Log エンジン                                                                |
|----------------------------------------------------------------------------|
| [TinyLog](/engines/table-engines/log-family/tinylog)       |
| [StripeLog](/engines/table-engines/log-family/stripelog) |
| [Log](/engines/table-engines/log-family/log)                   |

### 統合エンジン {#integration-engines}

他のデータストレージおよび処理システムと通信するためのエンジンです。

ファミリー内のエンジン：

| 統合エンジン                                                             |
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

ファミリー内のエンジン：

| 特殊エンジン                                               |
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
| [FileLog](/engines/table-engines/special/filelog)                                                   |

## 仮想カラム {#table_engines-virtual_columns}

仮想カラムは、エンジンのソースコードで定義された不可欠なテーブルエンジン属性です。

`CREATE TABLE`クエリで仮想カラムを指定することはできず、`SHOW CREATE TABLE`や`DESCRIBE TABLE`クエリの結果にも表示されません。仮想カラムは読み取り専用であり、データを挿入することはできません。

仮想カラムからデータを選択するには、その名前を`SELECT`クエリで指定する必要があります。`SELECT *`は仮想カラムからの値を返しません。

同じ名前のカラムを持つテーブルを作成すると、仮想カラムがアクセスできなくなります。これを行うことはお勧めしません。競合を避けるために、仮想カラムの名前は通常アンダースコアで始まります。

- `_table` — データが読み取られたテーブルの名前を含みます。タイプ: [String](../../sql-reference/data-types/string.md)。

    使用されているテーブルエンジンにかかわらず、各テーブルには`_table`という名前の普遍的な仮想カラムが含まれています。

    マージテーブルエンジンを持つテーブルをクエリするとき、`WHERE/PREWHERE`句で`_table`に定数条件を設定できます（例：`WHERE _table='xyz'`）。この場合、条件が満たされたテーブルに対してのみ読み取り操作が行われるため、`_table`カラムはインデックスとして機能します。

    `SELECT ... FROM (... UNION ALL ... )` のようにフォーマットされたクエリを使用する場合、戻された行が実際にどのテーブルから由来するのかを`_table`カラムを指定することで判断できます。
