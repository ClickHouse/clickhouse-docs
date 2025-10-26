---
'description': 'システムテーブルが何であるか、そしてそれらがなぜ便利であるかの概要。'
'keywords':
- 'system tables'
- 'overview'
'sidebar_label': '概要'
'sidebar_position': 52
'slug': '/operations/system-tables/overview'
'title': 'システムテーブルの概要'
'doc_type': 'reference'
---

## システムテーブルの概要 {#system-tables-introduction}

システムテーブルは次の情報を提供します：

- サーバーの状態、プロセス、および環境。
- サーバーの内部プロセス。
- ClickHouseバイナリがビルドされたときに使用されたオプション。

システムテーブル：

- `system` データベースに配置されています。
- データを読み取る専用です。
- 削除や変更はできませんが、切り離すことはできます。

ほとんどのシステムテーブルはデータをRAMに格納します。ClickHouseサーバーは起動時にこれらのシステムテーブルを作成します。

他のシステムテーブルとは異なり、システムログテーブル [metric_log](../../operations/system-tables/metric_log.md)、 [query_log](../../operations/system-tables/query_log.md)、 [query_thread_log](../../operations/system-tables/query_thread_log.md)、 [trace_log](../../operations/system-tables/trace_log.md)、 [part_log](../../operations/system-tables/part_log.md)、 [crash_log](../../operations/system-tables/crash_log.md)、 [text_log](../../operations/system-tables/text_log.md) および [backup_log](../../operations/system-tables/backup_log.md) は [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルエンジンによって提供され、デフォルトではファイルシステムにデータを格納します。ファイルシステムからテーブルを削除すると、ClickHouseサーバーは次回のデータ書き込み時に空のテーブルを再作成します。新しいリリースでシステムテーブルのスキーマが変更された場合、ClickHouseは現在のテーブルの名前を変更し、新しいものを作成します。

システムログテーブルは、 `/etc/clickhouse-server/config.d/` にテーブルと同名の設定ファイルを作成するか、 `/etc/clickhouse-server/config.xml` に対応する要素を設定することでカスタマイズできます。カスタマイズできる要素は次のとおりです：

- `database`: システムログテーブルが属するデータベース。このオプションは非推奨です。すべてのシステムログテーブルはデータベース `system` にあります。
- `table`: データを挿入するテーブル。
- `partition_by`: [PARTITION BY](../../engines/table-engines/mergetree-family/custom-partitioning-key.md) 表現を指定します。
- `ttl`: テーブル [TTL](../../sql-reference/statements/alter/ttl.md) 表現を指定します。
- `flush_interval_milliseconds`: ディスクへのデータフラッシュの間隔。
- `engine`: パラメータを伴う完全なエンジンの表現（ `ENGINE =` で始まる）を提供します。このオプションは `partition_by` および `ttl` と競合します。一緒に設定された場合、サーバーは例外を発生させて終了します。

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

デフォルトでは、テーブルの成長は無制限です。テーブルのサイズを制御するには、古いログレコードを削除するために [TTL](/sql-reference/statements/alter/ttl) 設定を使用できます。また、 `MergeTree` エンジンテーブルのパーティショニング機能を使用することもできます。

## システムメトリクスのソース {#system-tables-sources-of-system-metrics}

システムメトリクスを収集するためにClickHouseサーバーは次を使用します：

- `CAP_NET_ADMIN` 権限。
- [procfs](https://en.wikipedia.org/wiki/Procfs)（Linux のみ）。

**procfs**

ClickHouseサーバーに `CAP_NET_ADMIN` 権限がない場合、`ProcfsMetricsProvider` にフォールバックしようとします。 `ProcfsMetricsProvider` はCPUおよびI/Oのためのクエリごとのシステムメトリクスを収集することを可能にします。

procfs がシステムでサポートされ有効になっている場合、ClickHouseサーバーは次のメトリクスを収集します：

- `OSCPUVirtualTimeMicroseconds`
- `OSCPUWaitMicroseconds`
- `OSIOWaitMicroseconds`
- `OSReadChars`
- `OSWriteChars`
- `OSReadBytes`
- `OSWriteBytes`

:::note
`OSIOWaitMicroseconds` は、Linuxカーネルのバージョン 5.14.x 以降でデフォルトで無効です。これを有効にするには、`sudo sysctl kernel.task_delayacct=1` を使用するか、 `/etc/sysctl.d/` に `kernel.task_delayacct = 1` を含む `.conf` ファイルを作成します。
:::

## ClickHouse Cloudのシステムテーブル {#system-tables-in-clickhouse-cloud}

ClickHouse Cloud のシステムテーブルは、セルフマネージドデプロイメントと同様に、サービスの状態とパフォーマンスに関する重要な洞察を提供します。一部のシステムテーブルはクラスタ全体で操作され、特に分散メタデータを管理するKeeper ノードからデータを派生するものです。これらのテーブルはクラスタの集合的な状態を反映し、個々のノードでクエリされたときに一貫している必要があります。例えば、 [`parts`](/operations/system-tables/parts) はクエリを実行するノードに関係なく一貫であるべきです：

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

逆に、他のシステムテーブルはノード特有のものであり、例えばメモリ内で動作するか、MergeTree テーブルエンジンを使用してデータを永続化します。これは、ログやメトリクスなどのデータに典型的です。この永続性により、履歴データは分析のために利用可能なまま維持されます。これらのノード特有のテーブルは、本質的に各ノードに固有です。

一般的に、システムテーブルがノード特有であるかどうかを判断する際に適用されるルールは次のとおりです：

- `_log` サフィックスを持つシステムテーブル。
- メトリクスを公開するシステムテーブル（例： `metrics`、 `asynchronous_metrics`、 `events` ）。
- 進行中のプロセスを公開するシステムテーブル（例： `processes`、 `merges` ）。

さらに、システムテーブルの新しいバージョンは、アップグレードやスキーマの変更の結果として作成されることがあります。これらのバージョンは、数値サフィックスを使用して命名されます。

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

これらのテーブルを使用して、 [`merge`](/sql-reference/table-functions/merge) 関数を使用してクエリを実行できます。例えば、以下のクエリは、各 `query_log` テーブルに対してターゲットノードに送信された最新のクエリを特定します：

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
Peak memory usage: 28.45 MiB.
```

:::note 数値サフィックスでの順序に依存しないこと
テーブルの数値サフィックスはデータの順序を示唆することができますが、決して依存すべきではありません。このため、特定の日付範囲を対象とするときは、常にマージテーブル関数を使用し、日付フィルタを組み合わせて使用する必要があります。
:::

重要なことに、これらのテーブルは **各ノードにローカル** です。

### ノードを越えたクエリ {#querying-across-nodes}

クラスタ全体を総合的に表示するために、ユーザーは [`clusterAllReplicas`](/sql-reference/table-functions/cluster) 関数を `merge` 関数と組み合わせて活用できます。 `clusterAllReplicas` 関数は、"default" クラスター内のすべてのレプリカでシステムテーブルをクエリできるようにし、ノード特有のデータを統一された結果に統合します。 `merge` 関数と組み合わせることで、クラスタ内の特定のテーブルに対するすべてのシステムデータをターゲットにすることができます。

このアプローチは、クラスタ全体の操作を監視し、デバッグするために特に価値があります。これにより、ユーザーはClickHouse Cloudデプロイメントの健康状態とパフォーマンスを効果的に分析できます。

:::note
ClickHouse Cloud は、冗長性とフェールオーバーのために複数のレプリカのクラスターを提供します。これにより、動的なオートスケーリングとゼロダウンタイムのアップグレードなどの機能が有効になります。ある時点で、新しいノードがクラスターに追加されるか、クラスターから削除されるプロセスにある可能性があります。これらのノードをスキップするには、以下のように `clusterAllReplicas` を使用するクエリに `SETTINGS skip_unavailable_shards = 1` を追加します。
:::

例えば、分析にしばしば重要な `query_log` テーブルをクエリするときの違いを考えてみましょう。

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

### ノードとバージョンを越えたクエリ {#querying-across-nodes-and-versions}

システムテーブルのバージョンにより、これは依然としてクラスター内の完全なデータを表すわけではありません。上記を `merge` 関数と組み合わせることで、特定の日付範囲の正確な結果を得ることができます：

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

- ブログ: [システムテーブルとClickHouseの内部へのウィンドウ](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables)
- ブログ: [重要な監視クエリ - パート1 - INSERTクエリ](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)
- ブログ: [重要な監視クエリ - パート2 - SELECTクエリ](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)
