description: 'システムテーブルとは何か、その有用性に関する概要。'
keywords: ['システムテーブル', '概要']
sidebar_label: '概要'
sidebar_position: 52
slug: /operations/system-tables/overview
title: 'システムテーブルの概要'
```

## システムテーブルの概要 {#system-tables-introduction}

システムテーブルは、以下に関する情報を提供します：

- サーバーの状態、プロセス、および環境。
- サーバー内部のプロセス。
- ClickHouse バイナリがビルドされたときのオプション。

システムテーブル：

- `system` データベースに存在します。
- データの読み取り専用で利用可能です。
- 削除または変更することはできませんが、デタッチすることは可能です。

ほとんどのシステムテーブルはデータをRAMに格納します。ClickHouseサーバーはこのようなシステムテーブルを起動時に作成します。

他のシステムテーブルとは異なり、システムログテーブル [metric_log](../../operations/system-tables/metric_log.md)、[query_log](../../operations/system-tables/query_log.md)、[query_thread_log](../../operations/system-tables/query_thread_log.md)、[trace_log](../../operations/system-tables/trace_log.md)、[part_log](../../operations/system-tables/part_log.md)、[crash_log](../../operations/system-tables/crash-log.md)、[text_log](../../operations/system-tables/text_log.md) および [backup_log](../../operations/system-tables/backup_log.md) は [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルエンジンによって提供され、デフォルトでファイルシステムにデータを格納します。ファイルシステムからテーブルを削除すると、ClickHouse サーバーは次のデータ書き込み時に空のものを再作成します。システムテーブルのスキーマが新しいリリースで変更された場合、ClickHouseは現在のテーブルの名前を変更し、新しいテーブルを作成します。

システムログテーブルは、/etc/clickhouse-server/config.d/ に同名の設定ファイルを作成することによってカスタマイズするか、/etc/clickhouse-server/config.xml で対応する要素を設定することでカスタマイズできます。カスタマイズ可能な要素は：

- `database`: システムログテーブルが属するデータベース。このオプションは非推奨です。すべてのシステムログテーブルはデータベース `system` にあります。
- `table`: データを挿入するテーブル。
- `partition_by`: [PARTITION BY](../../engines/table-engines/mergetree-family/custom-partitioning-key.md) 表現を指定します。
- `ttl`: テーブルの [TTL](../../sql-reference/statements/alter/ttl.md) 表現を指定します。
- `flush_interval_milliseconds`: ディスクへのデータフラッシュの間隔。
- `engine`: パラメータ付きの完全なエンジン表現（`ENGINE =` で始まる）を提供します。このオプションは `partition_by` および `ttl` と衝突します。一緒に設定された場合、サーバーは例外を発生させて終了します。

例：

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

デフォルトでは、テーブルの成長は無制限です。テーブルのサイズを制御するために、古いログレコードを削除するための [TTL](/sql-reference/statements/alter/ttl) 設定を使用できます。また、 `MergeTree` エンジンテーブルのパーティショニング機能を使用することもできます。

## システムメトリクスのソース {#system-tables-sources-of-system-metrics}

システムメトリクスを収集するために、ClickHouse サーバーは次のものを使用します：

- `CAP_NET_ADMIN` 権限。
- [procfs](https://en.wikipedia.org/wiki/Procfs)（Linux のみ）。

**procfs**

ClickHouse サーバーが `CAP_NET_ADMIN` 権限を持っていない場合、`ProcfsMetricsProvider` にフォールバックしようとします。`ProcfsMetricsProvider` は、クエリごとのシステムメトリクス（CPU および I/O 用）を収集することを可能にします。

procfs がサポートされ、システムで有効になっている場合、ClickHouse サーバーは以下のメトリクスを収集します：

- `OSCPUVirtualTimeMicroseconds`
- `OSCPUWaitMicroseconds`
- `OSIOWaitMicroseconds`
- `OSReadChars`
- `OSWriteChars`
- `OSReadBytes`
- `OSWriteBytes`

:::note
`OSIOWaitMicroseconds` は、5.14.x 以降の Linux カーネルではデフォルトで無効です。
`sudo sysctl kernel.task_delayacct=1` を使用するか、/etc/sysctl.d/ に `kernel.task_delayacct = 1` を設定した `.conf` ファイルを作成することで有効化できます。
:::

## ClickHouse Cloud におけるシステムテーブル {#system-tables-in-clickhouse-cloud}

ClickHouse Cloud では、システムテーブルはセルフマネージドデプロイメントと同様に、サービスの状態とパフォーマンスに関する重要な洞察を提供します。一部のシステムテーブルはクラスタ全体のレベルで機能し、特に分散メタデータを管理する Keeper ノードからデータを取得するものです。これらのテーブルは、クラスターの全体的な状態を反映し、個々のノードでクエリされたときに一貫性がある必要があります。例えば、[`parts`](/operations/system-tables/parts) は、クエリが実行されるノードに関係なく一貫性がある必要があります：

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

逆に、他のシステムテーブルはノード固有のもので、例えば、内部メモリに格納されたり、MergeTree テーブルエンジンを使用してデータを永続化したりします。これは、ログやメトリクスなどのデータによく見られます。この永続性により、過去のデータは分析のために利用可能なままになります。しかし、これらのノード固有のテーブルは本質的に各ノードに固有です。

一般的に、システムテーブルがノード固有であるかどうかを判断する際に適用できるルールは次の通りです：

- `_log` サフィックスのあるシステムテーブル。
- メトリクスを公開するシステムテーブル（例：`metrics`、`asynchronous_metrics`、`events`）。
- 現在のプロセスを公開するシステムテーブル（例：`processes`、`merges`）。

さらに、システムテーブルの新しいバージョンは、アップグレードやスキーマの変更の結果として作成される場合があります。これらのバージョンは数値のサフィックスを使用して名前付けされます。

例えば、ノードによって実行された各クエリの行を含む `system.query_log` テーブルを考えてみましょう：

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

### 複数バージョンのクエリ {#querying-multiple-versions}

[`merge`](/sql-reference/table-functions/merge) 関数を使用して、これらのテーブルを横断的にクエリすることができます。例えば、以下のクエリは、各 `query_log` テーブルに対してターゲットノードに発行された最新のクエリを識別します：

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

11 rows in set. Elapsed: 0.373 sec. Processed 6.44 million rows, 25.77 MB (17.29 million rows/s., 69.17 MB/s.)
```

:::note 数字のサフィックスによる順序には頼らないでください
テーブルの数字のサフィックスはデータの順序を示唆することができますが、それに頼ってはいけません。このため、特定の日付範囲をターゲットにする際は、常に日付フィルターと組み合わせたマージテーブル関数を使用してください。
:::

重要なことに、これらのテーブルは依然として **各ノードにローカル** です。

### ノード間のクエリ {#querying-across-nodes}

クラスター全体を包括的に表示するために、ユーザーは [`clusterAllReplicas`](/sql-reference/table-functions/cluster) 関数を `merge` 関数と組み合わせて利用することができます。`clusterAllReplicas` 関数は、「default」クラスタ内のすべてのレプリカにわたってシステムテーブルをクエリし、ノード固有のデータを統合された結果にまとめることを可能にします。これを `merge` 関数と組み合わせることで、クラスター内の特定のテーブルのすべてのシステムデータをターゲットにできます。

このアプローチは、クラスタ全体の操作を監視およびデバッグする際に特に価値があり、ユーザーが自分の ClickHouse Cloud デプロイメントの健全性とパフォーマンスを効果的に分析できるようにします。

:::note
ClickHouse Cloud は冗長性とフェイルオーバーのために複数のレプリカのクラスタを提供します。これにより、動的オートスケーリングやゼロダウンタイムのアップグレードなどの機能が有効になります。ある時点で、新しいノードがクラスターに追加されたり、クラスターから削除されたりするプロセスが進行中かもしれません。これらのノードをスキップするには、`clusterAllReplicas` を使用するクエリに `SETTINGS skip_unavailable_shards = 1` を追加してください。以下に示すように。
:::

例えば、分析に不可欠なことが多い `query_log` テーブルをクエリする際の違いを考えてみましょう。

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
```

### ノード間およびバージョン間のクエリ {#querying-across-nodes-and-versions}

システムテーブルのバージョン管理のため、これでもクラスター内の全データを表すことはできません。上記の内容を `merge` 関数と組み合わせることで、特定の日付範囲に対して正確な結果を得ることができます：

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

3 rows in set. Elapsed: 0.462 sec. Processed 7.94 million rows, 31.75 MB (17.17 million rows/s., 68.67 MB/s.)
```

## 関連コンテンツ {#related-content}

- ブログ: [システムテーブルと ClickHouse の内部への窓](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables)
- ブログ: [重要な監視クエリ - 第1部 - INSERT クエリ](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)
- ブログ: [重要な監視クエリ - 第2部 - SELECT クエリ](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)
