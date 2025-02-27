---
description: "システムテーブルとは何か、またそれがなぜ有用であるかの概要。"
slug: /ja/operations/system-tables/overview
sidebar_position: 52
sidebar_label: 概要
title: "システムテーブルの概要"
keywords: ["システムテーブル", "概要"]
---

## はじめに {#system-tables-introduction}

システムテーブルは、次の情報を提供します。

- サーバーの状態、プロセス、環境。
- サーバーの内部プロセス。
- ClickHouseバイナリがビルドされたときに使用されたオプション。

システムテーブルは次のようになります：

- `system`データベースに存在します。
- データの読み取りのみ可能です。
- 削除や変更はできませんが、切り離すことができます。

ほとんどのシステムテーブルは、RAMにデータを格納します。ClickHouseサーバーは、起動時にこのようなシステムテーブルを作成します。

他のシステムテーブルとは異なり、システムログテーブル[metric_log](../../operations/system-tables/metric_log.md)、[query_log](../../operations/system-tables/query_log.md)、[query_thread_log](../../operations/system-tables/query_thread_log.md)、[trace_log](../../operations/system-tables/trace_log.md)、[part_log](../../operations/system-tables/part_log.md)、[crash_log](../../operations/system-tables/crash-log.md)、[text_log](../../operations/system-tables/text_log.md)および[backup_log](../../operations/system-tables/backup_log.md)は、[MergeTree](../../engines/table-engines/mergetree-family/mergetree.md)テーブルエンジンによって提供され、デフォルトでファイルシステムにデータを保存します。ファイルシステムからテーブルを削除すると、ClickHouseサーバーは次のデータ書き込み時に空のテーブルを再作成します。新しいリリースでシステムテーブルのスキーマが変更された場合、ClickHouseは現在のテーブルの名前を変更し、新しいテーブルを作成します。

システムログテーブルは、`/etc/clickhouse-server/config.d/`の下にテーブルと同名の構成ファイルを作成するか、`/etc/clickhouse-server/config.xml`内の対応する要素を設定することでカスタマイズできます。カスタマイズ可能な要素は以下の通りです：

- `database`: システムログテーブルが属するデータベース。このオプションは現在非推奨です。すべてのシステムログテーブルはデータベース`system`に属します。
- `table`: データを挿入するためのテーブル。
- `partition_by`: [PARTITION BY](../../engines/table-engines/mergetree-family/custom-partitioning-key.md)式を指定します。
- `ttl`: テーブルの[TTL](../../sql-reference/statements/alter/ttl.md)式を指定します。
- `flush_interval_milliseconds`: データをディスクにフラッシュする間隔。
- `engine`: パラメータを含む完全なエンジン式（`ENGINE =`で始まる）を提供します。このオプションは`partition_by`および`ttl`と競合します。一緒に設定された場合、サーバーは例外を発生させて終了します。

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

デフォルトでは、テーブルの成長は無制限です。テーブルのサイズを制御するには、古いログレコードを削除するための[TTL](../../sql-reference/statements/alter/ttl.md#manipulations-with-table-ttl)設定を使用できます。また、`MergeTree`エンジンテーブルのパーティショニング機能を使用することもできます。

## システムメトリクスのソース {#system-tables-sources-of-system-metrics}

システムメトリクスを収集するためにClickHouseサーバーは次のものを使用します：

- `CAP_NET_ADMIN`権限。
- [procfs](https://en.wikipedia.org/wiki/Procfs)（Linuxのみ）。

**procfs**

ClickHouseサーバーに`CAP_NET_ADMIN`権限がない場合、`ProcfsMetricsProvider`にフォールバックしようとします。`ProcfsMetricsProvider`は、クエリごとのシステムメトリクス（CPUおよびI/O用）を収集することを可能にします。

システムでprocfsがサポートされ、有効になっている場合、ClickHouseサーバーは次のメトリクスを収集します：

- `OSCPUVirtualTimeMicroseconds`
- `OSCPUWaitMicroseconds`
- `OSIOWaitMicroseconds`
- `OSReadChars`
- `OSWriteChars`
- `OSReadBytes`
- `OSWriteBytes`

:::note
`OSIOWaitMicroseconds`は、5.14.x以降のLinuxカーネルではデフォルトで無効です。
次のコマンドで有効にできます：`sudo sysctl kernel.task_delayacct=1`、または`/etc/sysctl.d/`に`kernel.task_delayacct = 1`という`.conf`ファイルを作成します。
:::

## ClickHouse Cloudのシステムテーブル {#system-tables-in-clickhouse-cloud}

ClickHouse Cloudでは、システムテーブルがサービスの状態とパフォーマンスに関する重要な洞察を提供し、セルフマネージドデプロイメントと同様に機能します。一部のシステムテーブルはクラスタ全体のレベルで操作され、特に分散メタデータを管理するKeeperノードからデータを取得するテーブルが該当します。これらのテーブルはクラスタの集団的な状態を反映し、各ノードでクエリされたときに一貫性が保たれるべきです。例えば、[`parts`](/en/operations/system-tables/parts)は、クエリされるノードにかかわらず一貫性を持つべきです：

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

逆に、他のシステムテーブルはノード固有であり、メモリ内またはMergeTreeテーブルエンジンを使用してデータを永続化しています。これは、ログやメトリクスなどのデータに典型的です。この永続性により、履歴データが分析のために利用可能であり続けることが保証されます。しかし、これらのノード固有のテーブルは各ノードに固有です。

クラスタ全体を包括的に見るために、ユーザーは[`clusterAllReplicas`](/en/sql-reference/table-functions/cluster)関数を活用できます。この関数は、"default"クラスタ内のすべてのレプリカでシステムテーブルをクエリし、ノード固有のデータを統合された結果にまとめることを可能にします。このアプローチは、クラスタ全体の操作の監視やデバッグに特に価値があり、ユーザーが自らのClickHouse Cloudデプロイメントの健全性とパフォーマンスを効果的に分析できるようにします。

:::note
ClickHouse Cloudは、冗長性とフェイルオーバーのために複数のレプリカのクラスタを提供しています。これにより、動的なオートスケーリングやダウンタイムゼロのアップグレードなどの機能が可能になります。一時的に、新しいノードがクラスタに追加されるか、クラスタから削除されるプロセスにある可能性があります。これらのノードをスキップするには、以下のように`clusterAllReplicas`を使用するクエリに`SETTINGS skip_unavailable_shards = 1`を追加してください。
:::

例えば、分析に不可欠なことが多い`query_log`テーブルをクエリする際の違いを考えてみましょう。

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

一般的に、システムテーブルがノード固有かどうかを判断する際に適用できる規則は次の通りです：

- `_log`接尾辞のあるシステムテーブル。
- メトリクスを公開するシステムテーブル（例：`metrics`, `asynchronous_metrics`, `events`）。
- 継続中のプロセスを公開するシステムテーブル（例：`processes`, `merges`）。

## 関連コンテンツ {#related-content}

- ブログ: [システムテーブルとClickHouse内部のウィンドウ](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables)
- ブログ: [必須の監視クエリ - パート1 - INSERTクエリ](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)
- ブログ: [必須の監視クエリ - パート2 - SELECTクエリ](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)
