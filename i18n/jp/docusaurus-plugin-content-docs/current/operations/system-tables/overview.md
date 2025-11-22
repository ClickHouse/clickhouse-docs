---
description: 'system テーブルとは何か、およびそれがなぜ有用なのかの概要。'
keywords: ['system テーブル', '概要']
sidebar_label: '概要'
sidebar_position: 52
slug: /operations/system-tables/overview
title: 'system テーブルの概要'
doc_type: 'reference'
---



## システムテーブルの概要 {#system-tables-introduction}

システムテーブルは以下に関する情報を提供します:

- サーバーの状態、プロセス、および環境
- サーバーの内部プロセス
- ClickHouseバイナリのビルド時に使用されたオプション

システムテーブルの特徴:

- `system`データベースに配置されています
- データの読み取り専用です
- 削除や変更はできませんが、デタッチは可能です

ほとんどのシステムテーブルはデータをRAMに格納します。ClickHouseサーバーは起動時にこれらのシステムテーブルを作成します。

他のシステムテーブルとは異なり、システムログテーブルである[metric_log](../../operations/system-tables/metric_log.md)、[query_log](../../operations/system-tables/query_log.md)、[query_thread_log](../../operations/system-tables/query_thread_log.md)、[trace_log](../../operations/system-tables/trace_log.md)、[part_log](../../operations/system-tables/part_log.md)、[crash_log](../../operations/system-tables/crash_log.md)、[text_log](../../operations/system-tables/text_log.md)、および[backup_log](../../operations/system-tables/backup_log.md)は、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)テーブルエンジンによって提供され、デフォルトでファイルシステムにデータを格納します。ファイルシステムからテーブルを削除した場合、ClickHouseサーバーは次回のデータ書き込み時に空のテーブルを再作成します。新しいリリースでシステムテーブルのスキーマが変更された場合、ClickHouseは現在のテーブルの名前を変更し、新しいテーブルを作成します。

システムログテーブルは、`/etc/clickhouse-server/config.d/`配下にテーブルと同じ名前の設定ファイルを作成するか、`/etc/clickhouse-server/config.xml`内の対応する要素を設定することでカスタマイズできます。カスタマイズ可能な要素は以下の通りです:

- `database`: システムログテーブルが属するデータベース。このオプションは現在非推奨です。すべてのシステムログテーブルは`system`データベース配下にあります。
- `table`: データを挿入するテーブル。
- `partition_by`: [PARTITION BY](../../engines/table-engines/mergetree-family/custom-partitioning-key.md)式を指定します。
- `ttl`: テーブルの[TTL](../../sql-reference/statements/alter/ttl.md)式を指定します。
- `flush_interval_milliseconds`: ディスクへのデータフラッシュ間隔。
- `engine`: パラメータを含む完全なエンジン式(`ENGINE =`で始まる)を指定します。このオプションは`partition_by`および`ttl`と競合します。同時に設定すると、サーバーは例外を発生させて終了します。

設定例:

```xml
<clickhouse>
    <query_log>
        <database>system</database>
        <table>query_log</table>
        <partition_by>toYYYYMM(event_date)</partition_by>
        <ttl>event_date + INTERVAL 30 DAY DELETE</ttl>
        <!--
        <engine>ENGINE = MergeTree PARTITION BY toYYYYMM(event_date) ORDER BY (event_date, event_time) SETTINGS index_granularity = 1024</engine>
        -->
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </query_log>
</clickhouse>
```

デフォルトでは、テーブルの増加は無制限です。テーブルのサイズを制御するには、古いログレコードを削除するための[TTL](/sql-reference/statements/alter/ttl)設定を使用できます。また、`MergeTree`エンジンテーブルのパーティショニング機能を使用することもできます。


## システムメトリクスのソース {#system-tables-sources-of-system-metrics}

システムメトリクスを収集するために、ClickHouseサーバーは以下を使用します:

- `CAP_NET_ADMIN` ケーパビリティ。
- [procfs](https://en.wikipedia.org/wiki/Procfs) (Linuxのみ)。

**procfs**

ClickHouseサーバーが `CAP_NET_ADMIN` ケーパビリティを持たない場合、`ProcfsMetricsProvider` へのフォールバックを試みます。`ProcfsMetricsProvider` は、クエリごとのシステムメトリクス(CPUおよびI/O)の収集を可能にします。

procfsがシステムでサポートされ有効化されている場合、ClickHouseサーバーは以下のメトリクスを収集します:

- `OSCPUVirtualTimeMicroseconds`
- `OSCPUWaitMicroseconds`
- `OSIOWaitMicroseconds`
- `OSReadChars`
- `OSWriteChars`
- `OSReadBytes`
- `OSWriteBytes`

:::note
`OSIOWaitMicroseconds` は、Linuxカーネル5.14.x以降ではデフォルトで無効化されています。
`sudo sysctl kernel.task_delayacct=1` を使用するか、`/etc/sysctl.d/` に `kernel.task_delayacct = 1` を含む `.conf` ファイルを作成することで有効化できます。
:::


## ClickHouse Cloudのシステムテーブル {#system-tables-in-clickhouse-cloud}

ClickHouse Cloudでは、システムテーブルはセルフマネージド環境と同様に、サービスの状態とパフォーマンスに関する重要な情報を提供します。一部のシステムテーブルは、特に分散メタデータを管理するKeeperノードからデータを取得するものなど、クラスタ全体のレベルで動作します。これらのテーブルはクラスタの全体的な状態を反映しており、個々のノードでクエリを実行した場合でも一貫した結果が得られます。例えば、[`parts`](/operations/system-tables/parts)は、どのノードからクエリを実行しても一貫した結果が得られます:

```sql
SELECT hostname(), count()
FROM system.parts
WHERE `table` = 'pypi'

┌─hostname()────────────────────┬─count()─┐
│ c-ecru-qn-34-server-vccsrty-0 │      26 │
└───────────────────────────────┴─────────┘

1 row in set. Elapsed: 0.005 sec.

SELECT
 hostname(),
    count()
FROM system.parts
WHERE `table` = 'pypi'

┌─hostname()────────────────────┬─count()─┐
│ c-ecru-qn-34-server-w59bfco-0 │      26 │
└───────────────────────────────┴─────────┘

1 row in set. Elapsed: 0.004 sec.
```

一方、他のシステムテーブルはノード固有のものであり、例えばインメモリであったり、MergeTreeテーブルエンジンを使用してデータを永続化したりします。これはログやメトリクスなどのデータに典型的です。この永続化により、履歴データが分析のために利用可能な状態を保ちます。ただし、これらのノード固有のテーブルは本質的に各ノードに固有のものです。

一般的に、システムテーブルがノード固有であるかどうかを判断する際には、以下のルールを適用できます:

- `_log`サフィックスを持つシステムテーブル
- メトリクスを公開するシステムテーブル(例: `metrics`、`asynchronous_metrics`、`events`)
- 進行中のプロセスを公開するシステムテーブル(例: `processes`、`merges`)

さらに、アップグレードやスキーマの変更の結果として、システムテーブルの新しいバージョンが作成される場合があります。これらのバージョンは数値サフィックスを使用して命名されます。

例えば、ノードによって実行された各クエリの行を含む`system.query_log`テーブルを考えてみましょう:

```sql
SHOW TABLES FROM system LIKE 'query_log%'

┌─name─────────┐
│ query_log    │
│ query_log_1  │
│ query_log_10 │
│ query_log_2  │
│ query_log_3  │
│ query_log_4  │
│ query_log_5  │
│ query_log_6  │
│ query_log_7  │
│ query_log_8  │
│ query_log_9  │
└──────────────┘

11 rows in set. Elapsed: 0.004 sec.
```

### 複数のバージョンへのクエリ実行 {#querying-multiple-versions}

これらのテーブルに対して[`merge`](/sql-reference/table-functions/merge)関数を使用してクエリを実行できます。例えば、以下のクエリは各`query_log`テーブルで対象ノードに発行された最新のクエリを特定します:

```sql
SELECT
    _table,
    max(event_time) AS most_recent
FROM merge('system', '^query_log')
GROUP BY _table
ORDER BY most_recent DESC

┌─_table───────┬─────────most_recent─┐
│ query_log    │ 2025-04-13 10:59:29 │
│ query_log_1  │ 2025-04-09 12:34:46 │
│ query_log_2  │ 2025-04-09 12:33:45 │
│ query_log_3  │ 2025-04-07 17:10:34 │
│ query_log_5  │ 2025-03-24 09:39:39 │
│ query_log_4  │ 2025-03-24 09:38:58 │
│ query_log_6  │ 2025-03-19 16:07:41 │
│ query_log_7  │ 2025-03-18 17:01:07 │
│ query_log_8  │ 2025-03-18 14:36:07 │
│ query_log_10 │ 2025-03-18 14:01:33 │
│ query_log_9  │ 2025-03-18 14:01:32 │
└──────────────┴─────────────────────┘

```


11 rows in set. Elapsed: 0.373 sec. Processed 6.44 million rows, 25.77 MB (17.29 million rows/s., 69.17 MB/s.)
Peak memory usage: 28.45 MiB.

````

:::note 順序付けに数値サフィックスを使用しないでください
テーブルの数値サフィックスはデータの順序を示唆することがありますが、これに依存すべきではありません。そのため、特定の日付範囲を対象とする場合は、必ず日付フィルタと組み合わせてmergeテーブル関数を使用してください。
:::

重要な点として、これらのテーブルは依然として**各ノードにローカル**です。

### ノード間でのクエリ実行 {#querying-across-nodes}

クラスタ全体を包括的に表示するには、[`clusterAllReplicas`](/sql-reference/table-functions/cluster)関数を`merge`関数と組み合わせて使用します。`clusterAllReplicas`関数は、「default」クラスタ内のすべてのレプリカにわたってシステムテーブルをクエリし、ノード固有のデータを統合された結果に集約します。`merge`関数と組み合わせることで、クラスタ内の特定のテーブルのすべてのシステムデータを対象にできます。

このアプローチは、クラスタ全体の操作の監視とデバッグに特に有用であり、ClickHouse Cloudデプロイメントの健全性とパフォーマンスを効果的に分析できます。

:::note
ClickHouse Cloudは、冗長性とフェイルオーバーのために複数のレプリカで構成されるクラスタを提供します。これにより、動的な自動スケーリングやゼロダウンタイムアップグレードなどの機能が実現されます。特定の時点で、新しいノードがクラスタに追加される途中であったり、クラスタから削除される途中である場合があります。これらのノードをスキップするには、以下に示すように`clusterAllReplicas`を使用するクエリに`SETTINGS skip_unavailable_shards = 1`を追加してください。
:::

例えば、分析に不可欠な`query_log`テーブルをクエリする際の違いを考えてみましょう。

```sql
SELECT
    hostname() AS host,
    count()
FROM system.query_log
WHERE (event_time >= '2025-04-01 00:00:00') AND (event_time <= '2025-04-12 00:00:00')
GROUP BY host

┌─host──────────────────────────┬─count()─┐
│ c-ecru-qn-34-server-s5bnysl-0 │  650543 │
└───────────────────────────────┴─────────┘

1 row in set. Elapsed: 0.010 sec. Processed 17.87 thousand rows, 71.51 KB (1.75 million rows/s., 7.01 MB/s.)

SELECT
    hostname() AS host,
    count()
FROM clusterAllReplicas('default', system.query_log)
WHERE (event_time >= '2025-04-01 00:00:00') AND (event_time <= '2025-04-12 00:00:00')
GROUP BY host SETTINGS skip_unavailable_shards = 1

┌─host──────────────────────────┬─count()─┐
│ c-ecru-qn-34-server-s5bnysl-0 │  650543 │
│ c-ecru-qn-34-server-6em4y4t-0 │  656029 │
│ c-ecru-qn-34-server-iejrkg0-0 │  641155 │
└───────────────────────────────┴─────────┘

3 rows in set. Elapsed: 0.026 sec. Processed 1.97 million rows, 7.88 MB (75.51 million rows/s., 302.05 MB/s.)
````

### ノードとバージョン間でのクエリ実行 {#querying-across-nodes-and-versions}

システムテーブルのバージョン管理により、これだけではクラスタ内の完全なデータを表していません。上記を`merge`関数と組み合わせることで、日付範囲に対する正確な結果が得られます:

```sql
SELECT
    hostname() AS host,
    count()
FROM clusterAllReplicas('default', merge('system', '^query_log'))
WHERE (event_time >= '2025-04-01 00:00:00') AND (event_time <= '2025-04-12 00:00:00')
GROUP BY host SETTINGS skip_unavailable_shards = 1

┌─host──────────────────────────┬─count()─┐
│ c-ecru-qn-34-server-s5bnysl-0 │ 3008000 │
│ c-ecru-qn-34-server-6em4y4t-0 │ 3659443 │
│ c-ecru-qn-34-server-iejrkg0-0 │ 1078287 │
└───────────────────────────────┴─────────┘

```


3 行が結果セットに含まれています。経過時間: 0.462 秒。7.94 百万行、31.75 MB を処理しました（17.17 百万行/秒、68.67 MB/秒）。

```
```


## 関連コンテンツ {#related-content}

- ブログ: [システムテーブルとClickHouse内部構造への窓](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables)
- ブログ: [必須の監視クエリ - パート1 - INSERTクエリ](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)
- ブログ: [必須の監視クエリ - パート2 - SELECTクエリ](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)
