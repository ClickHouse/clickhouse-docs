---
description: "システムテーブルの概要とその利点について"
slug: /operations/system-tables/overview
sidebar_position: 52
sidebar_label: 概要
title: "システムテーブルの概要"
keywords: ["system tables", "overview"]
---

## はじめに {#system-tables-introduction}

システムテーブルは、以下に関する情報を提供します：

- サーバーの状態、プロセス、環境。
- サーバーの内部プロセス。
- ClickHouse バイナリがビルドされた際に使用されたオプション。

システムテーブルの特徴：

- `system` データベースに存在します。
- データの読み取り専用です。
- ドロップや変更はできませんが、ディタッチは可能です。

ほとんどのシステムテーブルは、RAMにデータを保存します。ClickHouseサーバーは起動時にこのようなシステムテーブルを作成します。

他のシステムテーブルとは異なり、システムログテーブル [metric_log](../../operations/system-tables/metric_log.md)、[query_log](../../operations/system-tables/query_log.md)、[query_thread_log](../../operations/system-tables/query_thread_log.md)、[trace_log](../../operations/system-tables/trace_log.md)、[part_log](../../operations/system-tables/part_log.md)、[crash_log](../../operations/system-tables/crash-log.md)、[text_log](../../operations/system-tables/text_log.md) および [backup_log](../../operations/system-tables/backup_log.md) は [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルエンジンによって処理され、デフォルトではファイルシステムにデータを保存します。ファイルシステムからテーブルを削除すると、ClickHouseサーバーは次回のデータ書き込み時に再度空のテーブルを作成します。新しいリリースでシステムテーブルのスキーマが変更された場合、ClickHouseは現在のテーブルの名前を変更し、新しいテーブルを作成します。

システムログテーブルは、`/etc/clickhouse-server/config.d/` にテーブルと同じ名前の設定ファイルを作成するか、`/etc/clickhouse-server/config.xml` に対応する要素を設定することでカスタマイズできます。カスタマイズできる要素は以下の通りです：

- `database`: システムログテーブルが所属するデータベース。このオプションは現在非推奨です。すべてのシステムログテーブルはデータベース `system` の下に存在します。
- `table`: データを挿入するテーブル。
- `partition_by`: [PARTITION BY](../../engines/table-engines/mergetree-family/custom-partitioning-key.md) 式を指定します。
- `ttl`: テーブルの [TTL](../../sql-reference/statements/alter/ttl.md) 式を指定します。
- `flush_interval_milliseconds`: データをディスクにフラッシュする間隔。
- `engine`: パラメータ付きの完全なエンジン式 ( `ENGINE =` で始まる) を提供します。このオプションは `partition_by` と `ttl` と競合します。両方を設定する場合、サーバーは例外を発生させて終了します。

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

デフォルトでは、テーブルの成長に制限はありません。テーブルのサイズを制御するには、古くなったログレコードを削除するために [TTL](/sql-reference/statements/alter/ttl) 設定を使用できます。また、`MergeTree` エンジンテーブルのパーティショニング機能を使用することもできます。

## システムメトリックのソース {#system-tables-sources-of-system-metrics}

システムメトリックの収集のために、ClickHouseサーバーは以下を使用します：

- `CAP_NET_ADMIN` 権限。
- [procfs](https://en.wikipedia.org/wiki/Procfs) (Linux のみ)。

**procfs**

ClickHouseサーバーが `CAP_NET_ADMIN` 権限を持っていない場合、`ProcfsMetricsProvider` にフォールバックしようとします。`ProcfsMetricsProvider` は、CPUとI/Oのためのクエリごとのシステムメトリックを収集することを可能にします。

procfs がシステムでサポートされ、有効になっている場合、ClickHouseサーバーは以下のメトリックを収集します：

- `OSCPUVirtualTimeMicroseconds`
- `OSCPUWaitMicroseconds`
- `OSIOWaitMicroseconds`
- `OSReadChars`
- `OSWriteChars`
- `OSReadBytes`
- `OSWriteBytes`

:::note
`OSIOWaitMicroseconds` は、Linux カーネル 5.14.x 以降ではデフォルトで無効になっています。
`sudo sysctl kernel.task_delayacct=1` を実行するか、`/etc/sysctl.d/` 内に `kernel.task_delayacct = 1` の `.conf` ファイルを作成することで有効化できます。
:::

## ClickHouse Cloud のシステムテーブル {#system-tables-in-clickhouse-cloud}

ClickHouse Cloud では、システムテーブルがサービスの状態とパフォーマンスに関する重要な洞察を提供します。これはセルフマネージドデプロイメントと同様です。いくつかのシステムテーブルはクラスタ全体のレベルで操作され、特に分散メタデータを管理する Keeper ノードからデータを取得します。これらのテーブルはクラスタの集合的な状態を反映し、個々のノードでクエリされたときに一貫性を保つべきです。たとえば、[`parts`](/operations/system-tables/parts) は、クエリを実行されるノードに関係なく、一貫性を持つべきです：

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

対照的に、他のシステムテーブルはノード固有であり、例えばインメモリまたは MergeTree テーブルエンジンを使用してデータを永続化しています。これは、ログやメトリクスなどのデータに一般的です。この永続性により、歴史的データが分析のために利用可能なままとなります。しかし、これらのノード固有のテーブルは、それぞれのノードに固有です。

クラスタ全体を包括的に表示するには、ユーザーは [`clusterAllReplicas`](/sql-reference/table-functions/cluster) 関数を活用できます。この関数は、"default" クラスタ内のすべてのレプリカにわたってシステムテーブルをクエリし、ノード固有のデータを統合された結果にまとめます。このアプローチは、クラスタ全体の操作を監視およびデバッグするために特に価値があり、ユーザーが ClickHouse Cloud デプロイメントの健康状態とパフォーマンスを効果的に分析できるようにします。

:::note
ClickHouse Cloud は冗長性とフェイルオーバーのための複数レプリカのクラスタを提供しています。これにより、動的オートスケーリングやゼロダウンタイムのアップグレードなどの機能が可能になります。特定の時間に、新しいノードがクラスタに追加されるプロセス中であったり、クラスタから削除されるプロセス中である可能性があります。これらのノードをスキップするには、`clusterAllReplicas` を使用するクエリに `SETTINGS skip_unavailable_shards = 1` を追加してください。
:::

たとえば、分析にしばしば重要な `query_log` テーブルをクエリする際の違いを考えてみましょう。

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

一般に、システムテーブルがノード固有であるかどうかを判断する際に次のルールを適用できます：

- `_log` サフィックスを持つシステムテーブル。
- メトリックを公開するシステムテーブル： `metrics`、`asynchronous_metrics`、`events`。
- 進行中のプロセスを公開するシステムテーブル： `processes`、`merges`。

## 関連コンテンツ {#related-content}

- ブログ: [システムテーブルと ClickHouse の内部を覗く窓](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables)
- ブログ: [重要な監視クエリ - パート 1 - INSERT クエリ](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)
- ブログ: [重要な監視クエリ - パート 2 - SELECT クエリ](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)
