---
description: "システムテーブルとは何か、そしてそれがなぜ有用であるかの概要。"
slug: /operations/system-tables/overview
sidebar_position: 52
sidebar_label: 概要
title: "システムテーブルの概要"
keywords: ["システムテーブル", "概要"]
---

## はじめに {#system-tables-introduction}

システムテーブルは以下の情報を提供します：

- サーバーの状態、プロセス、環境。
- サーバーの内部プロセス。
- ClickHouse バイナリがビルドされた際のオプション。

システムテーブルは：

- `system` データベースに存在します。
- データを読み出すためのみ利用可能です。
- ドロップや変更はできませんが、デタッチすることは可能です。

ほとんどのシステムテーブルは、RAM にデータを格納します。ClickHouse サーバーは、開始時にこのようなシステムテーブルを作成します。

他のシステムテーブルとは異なり、システムログテーブル [metric_log](../../operations/system-tables/metric_log.md)、[query_log](../../operations/system-tables/query_log.md)、[query_thread_log](../../operations/system-tables/query_thread_log.md)、[trace_log](../../operations/system-tables/trace_log.md)、[part_log](../../operations/system-tables/part_log.md)、[crash_log](../../operations/system-tables/crash-log.md)、[text_log](../../operations/system-tables/text_log.md) および [backup_log](../../operations/system-tables/backup_log.md) は、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルエンジンによって提供され、デフォルトではファイルシステムにデータを保存します。テーブルをファイルシステムから削除すると、次回のデータ書き込み時に ClickHouse サーバーが空のものを再作成します。システムテーブルのスキーマが新しいリリースで変更された場合、ClickHouse は現在のテーブルの名前を変更し、新しいものを作成します。

システムログテーブルは、`/etc/clickhouse-server/config.d/` 配下に同名の設定ファイルを作成すること、または `/etc/clickhouse-server/config.xml` に対応する要素を設定することでカスタマイズできます。カスタマイズ可能な要素は次の通りです：

- `database`: システムログテーブルが属するデータベース。このオプションは現在は非推奨です。すべてのシステムログテーブルは `system` データベース配下にあります。
- `table`: データを挿入するテーブル。
- `partition_by`: [PARTITION BY](../../engines/table-engines/mergetree-family/custom-partitioning-key.md) 式を指定します。
- `ttl`: テーブルの [TTL](../../sql-reference/statements/alter/ttl.md) 式を指定します。
- `flush_interval_milliseconds`: ディスクへのデータフラッシュの間隔。
- `engine`: パラメータを含む完全なエンジン式 ( `ENGINE =` で始まる) を提供します。このオプションは `partition_by` および `ttl` と競合します。一緒に設定した場合、サーバーは例外を発生させて終了します。

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

デフォルトでは、テーブルの成長は無制限です。テーブルのサイズを制御するには、古いログレコードを削除するための [TTL](../../sql-reference/statements/alter/ttl.md#manipulations-with-table-ttl) 設定を使用できます。また、`MergeTree` エンジンテーブルのパーティショニング機能を利用することができます。

## システムメトリクスのソース {#system-tables-sources-of-system-metrics}

システムメトリクスを収集するために ClickHouse サーバーは以下を使用します：

- `CAP_NET_ADMIN` 権限。
- [procfs](https://en.wikipedia.org/wiki/Procfs)（Linux のみ）。

**procfs**

ClickHouse サーバーが `CAP_NET_ADMIN` 権限を持たない場合、`ProcfsMetricsProvider` にフォールバックしようとします。`ProcfsMetricsProvider` は、クエリごとのシステムメトリクス（CPU および I/O のため）を収集することを可能にします。

procfs がサポートされ、システムで有効になっている場合、ClickHouse サーバーはこれらのメトリクスを収集します：

- `OSCPUVirtualTimeMicroseconds`
- `OSCPUWaitMicroseconds`
- `OSIOWaitMicroseconds`
- `OSReadChars`
- `OSWriteChars`
- `OSReadBytes`
- `OSWriteBytes`

:::note
`OSIOWaitMicroseconds` は、Linux カーネル 5.14.x 以降のバージョンでデフォルトで無効になっています。
`sudo sysctl kernel.task_delayacct=1` を使用するか、 `/etc/sysctl.d/` に `kernel.task_delayacct = 1` という設定を持つ `.conf` ファイルを作成することで有効にできます。
:::

## ClickHouse Cloud のシステムテーブル {#system-tables-in-clickhouse-cloud}

ClickHouse Cloud では、システムテーブルがサービスの状態とパフォーマンスに関する重要な洞察を提供します。これはセルフマネージドデプロイメントと同様です。いくつかのシステムテーブルはクラスター全体のレベルで動作し、特に分散メタデータを管理する Keeper ノードからデータを派生するテーブルが該当します。これらのテーブルはクラスターの全体的な状態を反映し、個々のノードでクエリを実行した際に一貫性が求められます。例えば、[`parts`](/operations/system-tables/parts) は、クエリされたノードに関係なく一貫しているべきです：

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

逆に、他のシステムテーブルはノード固有です。例えば、メモリ内で動作するか、MergeTree テーブルエンジンを使用してデータを永続化します。これは、ログやメトリクスなどのデータに典型的です。この永続化により、履歴データが分析のために利用可能なまま保持されます。しかし、これらのノード固有のテーブルは、それぞれのノードに固有のものであり、各ノードの特性を反映しています。

クラスター全体を包括的に表示したい場合、ユーザーは [`clusterAllReplicas`](/sql-reference/table-functions/cluster) 関数を利用できます。この関数は、"default" クラスター内のすべてのレプリカを横断してシステムテーブルをクエリすることを可能にし、ノード特有のデータを統合結果にまとめます。このアプローチは、クラスターレベルの操作を監視およびデバッグする際に特に価値があり、ユーザーが ClickHouse Cloud デプロイメントの健康とパフォーマンスを効果的に分析するのを助けます。

:::note
ClickHouse Cloud は冗長性とフェイルオーバーのために複数のレプリカからなるクラスタを提供します。これにより、自動スケーリングやゼロダウンタイムアップグレードなどの機能が可能になります。ある時点において、新しいノードがクラスタに追加されるプロセスの途中であったり、クラスタから削除されるプロセスの途中である場合があります。これらのノードをスキップするには、`clusterAllReplicas` を使ったクエリに `SETTINGS skip_unavailable_shards = 1` を追加することができます。
:::

例えば、`query_log` テーブルをクエリする場合に、分析にしばしば重要な違いが生じることがあります。

```sql
SELECT
    hostname() AS host,
    count()
FROM system.query_log
WHERE (event_time >= '2024-12-20 12:30:00') AND (event_time <= '2024-12-20 14:30:00')
GROUP BY host

┌─host──────────────────────────┬─count()─┐
│ c-ecru-oc-31-server-ectk72m-0 │   84132 │
└───────────────────────────────┴─────────┘

1 row in set. Elapsed: 0.010 sec. Processed 154.63 thousand rows, 618.55 KB (16.12 million rows/s., 64.49 MB/s.)


SELECT
    hostname() AS host,
    count()
FROM clusterAllReplicas('default', system.query_log)
WHERE (event_time >= '2024-12-20 12:30:00') AND (event_time <= '2024-12-20 14:30:00')
GROUP BY host SETTINGS skip_unavailable_shards = 1

┌─host──────────────────────────┬─count()─┐
│ c-ecru-oc-31-server-ectk72m-0 │   84132 │
│ c-ecru-oc-31-server-myt0lr4-0 │   81473 │
│ c-ecru-oc-31-server-5mp9vn3-0 │   84292 │
└───────────────────────────────┴─────────┘

3 rows in set. Elapsed: 0.309 sec. Processed 686.09 thousand rows, 2.74 MB (2.22 million rows/s., 8.88 MB/s.)
Peak memory usage: 6.07 MiB.
```

一般的に、システムテーブルがノード固有であるかどうかを判断する際には、以下のルールが適用されます：

- `_log` サフィックスを持つシステムテーブル。
- メトリクスを公開するシステムテーブル（例： `metrics`、`asynchronous_metrics`、`events`）。
- 進行中のプロセスを公開するシステムテーブル（例： `processes`、`merges`）。

## 関連コンテンツ {#related-content}

- ブログ: [システムテーブルと ClickHouse の内部を覗く窓](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables)
- ブログ: [重要な監視クエリ - パート 1 - INSERT クエリ](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)
- ブログ: [重要な監視クエリ - パート 2 - SELECT クエリ](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)
