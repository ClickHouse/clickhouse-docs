---
'description': 'システムテーブルとその有用性の概要。'
'keywords':
- 'system tables'
- 'overview'
'sidebar_label': '概要'
'sidebar_position': 52
'slug': '/operations/system-tables/overview'
'title': 'System Tables Overview'
---




## システムテーブルの概要 {#system-tables-introduction}

システムテーブルは以下に関する情報を提供します：

- サーバーの状態、プロセス、および環境。
- サーバーの内部プロセス。
- ClickHouseバイナリがビルドされた際に使用されたオプション。

システムテーブル：

- `system` データベースに存在。
- データの読み取りのみが可能。
- 削除や変更はできませんが、切り離すことは可能です。

ほとんどのシステムテーブルは、そのデータをRAMに格納します。ClickHouseサーバーは、起動時にこのようなシステムテーブルを作成します。

他のシステムテーブルとは異なり、システムログテーブル [metric_log](../../operations/system-tables/metric_log.md)、 [query_log](../../operations/system-tables/query_log.md)、 [query_thread_log](../../operations/system-tables/query_thread_log.md)、 [trace_log](../../operations/system-tables/trace_log.md)、 [part_log](../../operations/system-tables/part_log.md)、 [crash_log](../../operations/system-tables/crash-log.md)、 [text_log](../../operations/system-tables/text_log.md)、および [backup_log](../../operations/system-tables/backup_log.md) は、 [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md) テーブルエンジンによって提供され、デフォルトではファイルシステムにデータを保存します。ファイルシステムからテーブルを削除すると、ClickHouseサーバーは次回データを書き込む際に再び空のテーブルを作成します。新しいリリースでシステムテーブルのスキーマが変更された場合、ClickHouseは現在のテーブルの名前を変更し、新しいテーブルを作成します。

システムログテーブルは、 `/etc/clickhouse-server/config.d/` 内にテーブルと同じ名前の設定ファイルを作成するか、 `/etc/clickhouse-server/config.xml` に対応する要素を設定することでカスタマイズできます。カスタマイズ可能な要素は以下の通りです：

- `database`: システムログテーブルが属するデータベース。このオプションは現在非推奨です。すべてのシステムログテーブルはデータベース `system` にあります。
- `table`: データを挿入するテーブル。
- `partition_by`: [PARTITION BY](../../engines/table-engines/mergetree-family/custom-partitioning-key.md) 式を指定します。
- `ttl`: テーブルの [TTL](../../sql-reference/statements/alter/ttl.md) 式を指定します。
- `flush_interval_milliseconds`: ディスクにデータをフラッシュする間隔。
- `engine`: パラメータを持つ完全なエンジン式（`ENGINE =` で始まる）を提供します。このオプションは `partition_by` および `ttl` と競合します。これらを同時に設定すると、サーバーは例外を発生させて終了します。

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

デフォルトでは、テーブルの成長は無制限です。テーブルのサイズを制御するために、古いログレコードを削除するための [TTL](/sql-reference/statements/alter/ttl) 設定を使用できます。また、`MergeTree`エンジンテーブルのパーティショニング機能も利用できます。

## システムメトリクスのソース {#system-tables-sources-of-system-metrics}

システムメトリクスを収集するために、ClickHouseサーバーは以下を使用します：

- `CAP_NET_ADMIN` の権限。
- [procfs](https://en.wikipedia.org/wiki/Procfs)（Linuxのみ）。

**procfs**

ClickHouseサーバーが `CAP_NET_ADMIN` の権限を持っていない場合、代わりに `ProcfsMetricsProvider` を使用しようとします。`ProcfsMetricsProvider` は、クエリごとのシステムメトリクス（CPUおよびI/Oのため）を収集することを可能にします。

procfsがサポートされ、有効化されているシステムでは、ClickHouseサーバーは以下のメトリクスを収集します：

- `OSCPUVirtualTimeMicroseconds`
- `OSCPUWaitMicroseconds`
- `OSIOWaitMicroseconds`
- `OSReadChars`
- `OSWriteChars`
- `OSReadBytes`
- `OSWriteBytes`

:::note
`OSIOWaitMicroseconds`は、Linuxカーネル5.14.x以降でデフォルトで無効です。`sudo sysctl kernel.task_delayacct=1`を使用するか、`/etc/sysctl.d/`に `kernel.task_delayacct = 1` を設定した.confファイルを作成することで有効化できます。
:::

## ClickHouse Cloudにおけるシステムテーブル {#system-tables-in-clickhouse-cloud}

ClickHouse Cloudでは、システムテーブルは、セルフマネージドのデプロイメントと同様に、サービスの状態とパフォーマンスに関する重要な洞察を提供します。一部のシステムテーブルはクラスタ全体のレベルで操作され、特に分散メタデータを管理するKeeperノードからデータを派生させるテーブルはそうです。これらのテーブルは、クラスタの集合的な状態を反映し、個々のノードでクエリした際に一貫性が保たれるべきです。たとえば、[`parts`](/operations/system-tables/parts)は、クエリ元のノードに関係なく一貫性があるべきです：

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

逆に、他のシステムテーブルはノード固有であり、例えば、メモリ内で動作するか、MergeTreeテーブルエンジンを使用してデータを持続させます。これは通常、ログやメトリクスといったデータに典型的です。この持続性により、歴史的データが分析のために利用可能であり続けます。しかし、これらのノード固有のテーブルは各ノードに固有のものであります。

一般的に、システムテーブルがノード固有かどうかを判断する際に適用できる以下のルールがあります：

- `_log` サフィックスを持つシステムテーブル。
- メトリクスを公開するシステムテーブル（例: `metrics`, `asynchronous_metrics`, `events`）。
- 進行中のプロセスを公開するシステムテーブル（例: `processes`, `merges`）。

さらに、システムテーブルの新バージョンは、アップグレードやスキーマの変更によって作成されることがあります。これらのバージョンは数値サフィックスを用いて命名されます。

例えば、ノードによって実行された各クエリの行を含む `system.query_log` テーブルを考えてみます：

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

[`merge`](/sql-reference/table-functions/merge) 関数を使用して、これらのテーブルを横断してクエリを実行することができます。例えば、以下のクエリは各 `query_log` テーブルに対してターゲットノードに発行された最新のクエリを特定します：

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

:::note 数字サフィックスに頼らないでください
テーブルの数字サフィックスはデータの順序を示唆することができますが、それに頼るべきではありません。このため、特定の日付範囲を対象とする際には、常にマージテーブル機能と日付フィルタを組み合わせて使用してください。
:::

重要なことに、これらのテーブルは依然として **各ノードにローカル** です。

### ノード間のクエリ {#querying-across-nodes}

クラスタ全体を包括的に表示するために、ユーザーは [`clusterAllReplicas`](/sql-reference/table-functions/cluster) 関数を `merge` 関数と組み合わせて活用することができます。`clusterAllReplicas` 関数は、"default" クラスター内のすべてのレプリカ間でシステムテーブルをクエリすることを可能にし、ノード固有のデータを統合された結果に集約します。`merge` 関数と組み合わせることで、クラスター内の特定のテーブルのすべてのシステムデータを対象とすることができます。

このアプローチは、クラスタ全体の操作を監視し、デバッグする際に特に価値があります。ユーザーはClickHouse Cloudデプロイメントの健全性とパフォーマンスを効果的に分析することができます。

:::note
ClickHouse Cloudは冗長性とフェイルオーバーのために複数のレプリカのクラスターを提供します。これにより、動的なオートスケーリングやゼロダウンタイムのアップグレードなどの機能が可能になります。特定の時点において、新しいノードがクラスターに追加されるプロセス中またはクラスターから削除されていることがあります。これらのノードをスキップするには、`clusterAllReplicas`を使用したクエリに `SETTINGS skip_unavailable_shards = 1` を追加してください。以下のようになります。
:::

例えば、分析にしばしば不可欠な `query_log` テーブルをクエリする際の違いを考えてみましょう。

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

システムテーブルのバージョニングのため、これでもクラスタ内の全データを表すものではありません。上記を`merge` 関数と組み合わせることで、特定の日付範囲について正確な結果が得られます：

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

- ブログ: [システムテーブルとClickHouseの内部を覗く](https://clickhouse.com/blog/clickhouse-debugging-issues-with-system-tables)
- ブログ: [必須の監視クエリ - パート1 - INSERTクエリ](https://clickhouse.com/blog/monitoring-troubleshooting-insert-queries-clickhouse)
- ブログ: [必須の監視クエリ - パート2 - SELECTクエリ](https://clickhouse.com/blog/monitoring-troubleshooting-select-queries-clickhouse)
