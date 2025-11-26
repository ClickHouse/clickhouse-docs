---
description: 'システムテーブルとは何かと、その有用性の概要。'
keywords: ['システムテーブル', '概要']
sidebar_label: '概要'
sidebar_position: 52
slug: /operations/system-tables/overview
title: 'システムテーブルの概要'
doc_type: 'reference'
---



## システムテーブルの概要

システムテーブルは以下の情報を提供します:

* サーバーの状態、プロセス、および環境。
* サーバー内部のプロセス。
* ClickHouse バイナリのビルド時に使用されたオプション。

システムテーブルの特性:

* `system` データベース内に配置されている。
* データの読み取り専用で利用できる。
* 削除 (`DROP`) や変更 (`ALTER`) はできないが、切り離し (`DETACH`) は可能。

ほとんどのシステムテーブルは、データを RAM 上に保持します。ClickHouse サーバーは起動時にこのようなシステムテーブルを作成します。

他のシステムテーブルとは異なり、システムログテーブル [metric&#95;log](../../operations/system-tables/metric_log.md)、[query&#95;log](../../operations/system-tables/query_log.md)、[query&#95;thread&#95;log](../../operations/system-tables/query_thread_log.md)、[trace&#95;log](../../operations/system-tables/trace_log.md)、[part&#95;log](../../operations/system-tables/part_log.md)、[crash&#95;log](../../operations/system-tables/crash_log.md)、[text&#95;log](../../operations/system-tables/text_log.md)、および [backup&#95;log](../../operations/system-tables/backup_log.md) は [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルエンジンで動作しており、デフォルトではファイルシステムにデータを保存します。ファイルシステムからテーブルを削除した場合、ClickHouse サーバーは次回のデータ書き込み時に空のテーブルを再作成します。新しいリリースでシステムテーブルのスキーマが変更された場合、ClickHouse は現在のテーブルの名前を変更し、新しいテーブルを作成します。

システムログテーブルは、テーブルと同じ名前の設定ファイルを `/etc/clickhouse-server/config.d/` 配下に作成するか、`/etc/clickhouse-server/config.xml` 内の対応する要素を設定することでカスタマイズできます。カスタマイズ可能な要素は次のとおりです:

* `database`: システムログテーブルが属するデータベース。このオプションは現在非推奨です。すべてのシステムログテーブルは `system` データベース配下にあります。
* `table`: データを挿入するテーブル。
* `partition_by`: [PARTITION BY](../../engines/table-engines/mergetree-family/custom-partitioning-key.md) 句の式を指定。
* `ttl`: テーブルの [TTL](../../sql-reference/statements/alter/ttl.md) 式を指定。
* `flush_interval_milliseconds`: データをディスクへフラッシュする間隔。
* `engine`: パラメータ付きで、`ENGINE =` で始まる完全なエンジン式を指定。このオプションは `partition_by` および `ttl` と競合します。同時に設定した場合、サーバーは例外をスローして終了します。

例:

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

デフォルトでは、テーブルの成長に上限はありません。テーブルサイズを制御するには、古くなったログレコードを削除するための [TTL](/sql-reference/statements/alter/ttl) 設定を使用できます。また、`MergeTree` エンジンを使用するテーブルのパーティション機能を利用することもできます。


## システムメトリクスの取得元 {#system-tables-sources-of-system-metrics}

システムメトリクスを収集するために、ClickHouse サーバーは次を使用します。

- `CAP_NET_ADMIN` ケーパビリティ
- [procfs](https://en.wikipedia.org/wiki/Procfs)（Linux のみ）

**procfs**

ClickHouse サーバーが `CAP_NET_ADMIN` ケーパビリティを持たない場合、`ProcfsMetricsProvider` へのフォールバックを試みます。`ProcfsMetricsProvider` により、クエリごとのシステムメトリクス（CPU および I/O）を収集できます。

procfs がシステムでサポートされていて有効化されている場合、ClickHouse サーバーは次のメトリクスを収集します。

- `OSCPUVirtualTimeMicroseconds`
- `OSCPUWaitMicroseconds`
- `OSIOWaitMicroseconds`
- `OSReadChars`
- `OSWriteChars`
- `OSReadBytes`
- `OSWriteBytes`

:::note
`OSIOWaitMicroseconds` は、Linux カーネル 5.14.x 以降ではデフォルトで無効になっています。
`sudo sysctl kernel.task_delayacct=1` を実行するか、`/etc/sysctl.d/` に `kernel.task_delayacct = 1` を含む `.conf` ファイルを作成することで有効にできます。
:::



## ClickHouse Cloud における system テーブル

ClickHouse Cloud では、system テーブルは自己管理型デプロイメントの場合と同様に、サービスの状態とパフォーマンスに関する重要な洞察を提供します。いくつかの system テーブルは、特に分散メタデータを管理する Keeper ノードからデータを取得するものについては、クラスタ全体で動作します。これらのテーブルはクラスタの集合的な状態を反映しており、個々のノードでクエリした場合にも結果が整合している必要があります。たとえば、[`parts`](/operations/system-tables/parts) は、どのノードからクエリしても一貫した結果が得られる必要があります。

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

一方、他の system テーブルはノード固有です。例えば、メモリ上にのみ存在するものや、MergeTree テーブルエンジンを使ってデータを永続化しているものがあります。これは、ログやメトリクスといったデータで一般的です。この永続化により、過去のデータが分析のために利用可能な状態で保持されます。しかし、これらのノード固有テーブルは、本質的に各ノードに固有です。

一般に、ある system テーブルがノード固有かどうかを判断する際には、次のルールを適用できます。

* `_log` 接尾辞を持つ system テーブル。
* メトリクスを公開する system テーブル。例: `metrics`、`asynchronous_metrics`、`events`。
* 実行中のプロセスを公開する system テーブル。例: `processes`、`merges`。

さらに、アップグレードやスキーマ変更の結果として、新しいバージョンの system テーブルが作成される場合があります。これらのバージョンは数値の接尾辞を使って命名されます。

例えば、`system.query_log` テーブル群を考えてみましょう。これらのテーブルには、ノードで実行された各クエリごとに 1 行が格納されます。

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

11行が返されました。経過時間: 0.004秒。
```

### 複数バージョンにまたがるクエリ

[`merge`](/sql-reference/table-functions/merge) 関数を使用すると、これらのテーブルをまたいでクエリを実行できます。たとえば、次のクエリは、各 `query_log` テーブル内で対象ノードに対して発行された最新のクエリを特定します。

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


11 行が返されました。経過時間: 0.373 秒。処理行数: 644 万行、25.77 MB（毎秒 1,729 万行、69.17 MB）。
ピークメモリ使用量: 28.45 MiB。

````

:::note 順序付けに数値接尾辞を使用しないでください
テーブルの数値接尾辞はデータの順序を示唆する場合がありますが、これに依存すべきではありません。このため、特定の日付範囲を対象とする場合は、必ず日付フィルタと組み合わせてmergeテーブル関数を使用してください。
:::

重要な点として、これらのテーブルは依然として**各ノードにローカル**です。

### ノード間でのクエリ実行                         

クラスタ全体を包括的に表示するには、[`clusterAllReplicas`](/sql-reference/table-functions/cluster)関数を`merge`関数と組み合わせて使用できます。`clusterAllReplicas`関数は、「default」クラスタ内のすべてのレプリカにわたってシステムテーブルをクエリし、ノード固有のデータを統合された結果に集約します。`merge`関数と組み合わせることで、クラスタ内の特定のテーブルのすべてのシステムデータを対象とすることができます。 

このアプローチは、クラスタ全体の操作の監視とデバッグに特に有用であり、ユーザーがClickHouse Cloudデプロイメントの健全性とパフォーマンスを効果的に分析できるようにします。

:::note
ClickHouse Cloudは、冗長性とフェイルオーバーのために複数のレプリカのクラスタを提供します。これにより、動的な自動スケーリングやゼロダウンタイムアップグレードなどの機能が実現されます。特定の時点で、新しいノードがクラスタに追加される過程にあるか、クラスタから削除される過程にある可能性があります。これらのノードをスキップするには、以下に示すように`clusterAllReplicas`を使用するクエリに`SETTINGS skip_unavailable_shards = 1`を追加してください。
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

### ノードおよびバージョンをまたいだクエリ実行

system テーブルのバージョニングにより、これだけではクラスタ全体のデータをすべて表しているわけではありません。上記に `merge` 関数を組み合わせることで、指定した日付範囲について正確な結果を得ることができます。

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


3 行のセット。経過時間: 0.462 秒。処理した行数: 7.94 百万行、31.75 MB (17.17 百万行/秒、68.67 MB/秒)。

```
```


## 関連コンテンツ {#related-content}

- ブログ: [システムテーブルと ClickHouse の内部構造を覗く](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables)
- ブログ: [必須監視クエリ - パート 1 - INSERT クエリ](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)
- ブログ: [必須監視クエリ - パート 2 - SELECT クエリ](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)
