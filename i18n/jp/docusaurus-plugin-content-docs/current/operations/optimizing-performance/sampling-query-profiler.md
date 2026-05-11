---
description: 'ClickHouse のサンプリングクエリプロファイラツールに関するドキュメント'
sidebar_label: 'クエリプロファイリング'
sidebar_position: 54
slug: /operations/optimizing-performance/sampling-query-profiler
title: 'サンプリングクエリプロファイラ'
doc_type: 'reference'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_no_roadmap.md';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# サンプリングクエリプロファイラ \{#sampling-query-profiler\}

ClickHouse には、クエリ実行を分析するためのサンプリングプロファイラがあります。
このプロファイラを使用すると、クエリ実行中に最も頻繁に使用されるソースコード中のルーチンを特定できます。
CPU 時間と、アイドル時間を含む経過時間を追跡できます。

ClickHouse Cloud では、クエリプロファイラは自動的に有効になります。
次のクエリ例では、関数名とソース位置を解決したうえで、プロファイル対象のクエリについて最も頻出するスタックトレースを特定します。

:::tip
`query_id` の値は、プロファイルしたいクエリの ID に置き換えてください。
:::

<Tabs groupId="deployment">
  <TabItem value="cloud" label="ClickHouse Cloud">
    ClickHouse Cloud では、クエリ結果テーブルの上にあるバーの右端 (テーブル/チャート切り替えの横) にある **&quot;...&quot;** をクリックすると、クエリ ID を取得できます。コンテキストメニューが開くので、**&quot;Copy query ID&quot;** をクリックしてください。

    クラスター内のすべてのノードから選択するには、`clusterAllReplicas(default, system.trace_log)` を使用します。

    ```sql
    SELECT
        count(),
        arrayStringConcat(arrayMap(x -> concat(demangle(addressToSymbol(x)), '\n    ', addressToLine(x)), trace), '\n') AS sym
    FROM clusterAllReplicas(default, system.trace_log)
    WHERE query_id = '<query_id>' AND trace_type = 'CPU' AND event_date = today()
    GROUP BY trace
    ORDER BY count() DESC
    LIMIT 10
    SETTINGS allow_introspection_functions = 1
    ```
  </TabItem>

  <TabItem value="self-managed" label="セルフマネージド">
    ```sql
    SELECT
        count(),
        arrayStringConcat(arrayMap(x -> concat(demangle(addressToSymbol(x)), '\n    ', addressToLine(x)), trace), '\n') AS sym
    FROM system.trace_log
    WHERE query_id = '<query_id>' AND trace_type = 'CPU' AND event_date = today()
    GROUP BY trace
    ORDER BY count() DESC
    LIMIT 10
    SETTINGS allow_introspection_functions = 1
    ```
  </TabItem>
</Tabs>

## セルフマネージド環境でクエリプロファイラを使用する \{#self-managed-query-profiler\}

セルフマネージド環境でクエリプロファイラを使用するには、以下の手順に従ってください。

<VerticalStepper headerLevel="h3">
  ### デバッグ情報付きの ClickHouse をインストールする \{#debug-info\}

  `clickhouse-common-static-dbg` パッケージをインストールします。

  1. [「Debian リポジトリをセットアップする」](/install/debian_ubuntu#setup-the-debian-repository) の手順に従います
  2. `sudo apt-get install clickhouse-server clickhouse-client clickhouse-common-static-dbg` を実行し、デバッグ情報付きでビルドされた ClickHouse のバイナリをインストールします
  3. `sudo service clickhouse-server start` を実行してサーバーを起動します
  4. `clickhouse-client` を実行します。`clickhouse-common-static-dbg` のデバッグシンボルはサーバーによって自動的に使用されるため、有効化のための特別な操作は不要です

  ### サーバー設定を確認する \{#server-config\}

  [サーバー設定ファイル](/operations/configuration-files)の [`trace_log`](../../operations/server-configuration-parameters/settings.md#trace_log) セクションがセットアップされていることを確認してください。これはデフォルトで有効です。

  ```xml
  <!-- トレースログ。クエリプロファイラによって収集されたスタックトレースを保存します。
       query_profiler_real_time_period_ns および query_profiler_cpu_time_period_ns 設定を参照してください。 -->
  <trace_log>
      <database>system</database>
      <table>trace_log</table>

      <partition_by>toYYYYMM(event_date)</partition_by>
      <flush_interval_milliseconds>7500</flush_interval_milliseconds>
      <max_size_rows>1048576</max_size_rows>
      <reserved_size_rows>8192</reserved_size_rows>
      <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
      <!-- クラッシュ時にログをディスクにダンプするかどうかを示します -->
      <flush_on_crash>false</flush_on_crash>
      <symbolize>true</symbolize>
  </trace_log>
  ```

  このセクションでは、プロファイラの実行結果を含む [trace&#95;log](/operations/system-tables/trace_log) system テーブルを設定します。
  このテーブル内のデータは、サーバーの稼働中にのみ有効であることに注意してください。
  サーバーを再起動しても ClickHouse はこのテーブルをクリーンアップしないため、保存されている仮想メモリアドレスは無効になる可能性があります。

  ### プロファイラのタイマーを設定する \{#configure-profile-timers\}

  [`query_profiler_cpu_time_period_ns`](../../operations/settings/settings.md#query_profiler_cpu_time_period_ns) または [`query_profiler_real_time_period_ns`](../../operations/settings/settings.md#query_profiler_real_time_period_ns) を設定します。
  これら 2 つの設定は同時に使用できます。

  これらの設定により、プロファイラのタイマーを構成できます。
  これらはセッション設定であるため、サーバー全体、個々のユーザーやユーザープロファイル、対話セッション、さらには個々のクエリごとに異なるサンプリング頻度を設定できます。

  デフォルトのサンプリング頻度は 1 秒あたり 1 サンプルで、CPU タイマーと実時間タイマーの両方が有効です。
  この頻度であれば、サーバーのパフォーマンスに影響を与えずに、ClickHouse クラスターに関する十分な情報を収集できます。
  個々のクエリをそれぞれプロファイルする必要がある場合は、より高いサンプリング頻度を使用してください。

  ### `trace_log` system テーブルを分析する \{#analyze-trace-log-system-table\}

  `trace_log` system テーブルを分析するには、[`allow_introspection_functions`](../../operations/settings/settings.md#allow_introspection_functions) 設定でイントロスペクション関数を有効にします。

  ```sql
  SET allow_introspection_functions=1
  ```

  :::note
  セキュリティ上の理由により、イントロスペクション関数はデフォルトで無効になっています
  :::

  `addressToLine`、`addressToLineWithInlines`、`addressToSymbol`、`demangle` の[イントロスペクション関数](../../sql-reference/functions/introspection.md)を使用して、関数名と ClickHouse コード内の位置を取得します。
  特定のクエリのプロファイルを取得するには、`trace_log` テーブルのデータを集約する必要があります。
  データは個々の関数単位でも、スタックトレース全体単位でも集約できます。

  :::tip
  `trace_log` の情報を可視化する必要がある場合は、[flamegraph](/interfaces/third-party/gui#clickhouse-flamegraph) と [speedscope](https://www.speedscope.app) を試してください。
  :::
</VerticalStepper>

## `flameGraph` 関数でフレームグラフを作成する \{#flamegraph\}

ClickHouse には、`trace_log` に保存されたスタックトレースから直接フレームグラフを生成する [`flameGraph`](/sql-reference/aggregate-functions/reference/flame_graph) 集約関数があります。
出力は、[flamegraph.pl](https://github.com/brendangregg/FlameGraph) と互換性のあるフォーマットの文字列配列です。

**構文:**

```sql
flameGraph(traces, [size = 1], [ptr = 0])
```

**引数:**

* `traces` — スタックトレース。[`Array(UInt64)`](/sql-reference/data-types/array)。
* `size` — メモリ性能分析用の割り当てサイズ。[`Int64`](/sql-reference/data-types/int-uint)。
* `ptr` — 割り当てアドレス。[`UInt64`](/sql-reference/data-types/int-uint)。

`ptr` が 0 以外の場合、`flameGraph` は同じサイズとポインタを持つ割り当て (`size > 0`) と解放 (`size < 0`) を対応付けます。
解放されていない割り当てだけが表示されます。
対応しない解放は無視されます。

### CPUフレームグラフ \{#cpu-flame-graph\}

:::note
以下のクエリを実行するには、[flamegraph.pl](https://github.com/brendangregg/FlameGraph) がインストールされている必要があります。

インストールするには、次を実行します。

```bash
git clone https://github.com/brendangregg/FlameGraph
# Then use it as:
# ~/FlameGraph/flamegraph.pl
```

以下のクエリ内の `flamegraph.pl` を、お使いのマシン上での `flamegraph.pl` のパスに置き換えてください
:::

```sql
SET query_profiler_cpu_time_period_ns = 10000000;
```

クエリを実行し、続いてフレームグラフを生成します:

```bash
clickhouse client --allow_introspection_functions=1 \
    -q "SELECT arrayJoin(flameGraph(arrayReverse(trace)))
        FROM system.trace_log
        WHERE trace_type = 'CPU' AND query_id = '<query_id>'" \
    | flamegraph.pl > flame_cpu.svg
```

### メモリのフレームグラフ — すべての割り当て \{#memory-flame-graph-all\}

```sql
SET memory_profiler_sample_probability = 1, max_untracked_memory = 1;
```

クエリを実行し、続いてフレームグラフを生成します。

```bash
clickhouse client --allow_introspection_functions=1 \
    -q "SELECT arrayJoin(flameGraph(trace, size))
        FROM system.trace_log
        WHERE trace_type = 'MemorySample' AND query_id = '<query_id>'" \
    | flamegraph.pl --countname=bytes --color=mem > flame_mem.svg
```

### メモリフレームグラフ — 未解放の割り当て \{#memory-flame-graph-unfreed\}

このバリアントでは、ポインタ単位で割り当てと解放を対応付け、クエリの実行中に解放されなかったメモリのみを表示します。

```sql
SET memory_profiler_sample_probability = 1, max_untracked_memory = 1,
    use_uncompressed_cache = 1,
    merge_tree_max_rows_to_use_cache = 100000000000,
    merge_tree_max_bytes_to_use_cache = 1000000000000;
```

フレームグラフを作成するには、次のクエリを実行します。

```bash
clickhouse client --allow_introspection_functions=1 \
    -q "SELECT arrayJoin(flameGraph(trace, size, ptr))
        FROM system.trace_log
        WHERE trace_type = 'MemorySample' AND query_id = '<query_id>'" \
    | flamegraph.pl --countname=bytes --color=mem > flame_mem_unfreed.svg
```

### メモリフレームグラフ — ある時点で有効なメモリ割り当て \{#memory-flame-graph-time-point\}

この方法では、ピーク時のメモリ使用量を特定し、その時点で何が割り当てられていたかを可視化できます。

```sql
SET memory_profiler_sample_probability = 1, max_untracked_memory = 1;
```

#### 時系列でメモリ使用量を確認する \{#find-memory-usage-over-time\}

```sql
SELECT
    event_time,
    formatReadableSize(max(s)) AS m
FROM (
    SELECT
        event_time,
        sum(size) OVER (ORDER BY event_time) AS s
    FROM system.trace_log
    WHERE query_id = '<query_id>' AND trace_type = 'MemorySample'
)
GROUP BY event_time
ORDER BY event_time;
```

#### メモリ使用量が最大の時点を見つける \{#find-time-point-maximum-memory-usage\}

```sql
SELECT
    argMax(event_time, s),
    max(s)
FROM (
    SELECT
        event_time,
        sum(size) OVER (ORDER BY event_time) AS s
    FROM system.trace_log
    WHERE query_id = '<query_id>' AND trace_type = 'MemorySample'
);
```

#### その時点におけるアクティブな割り当てのフレームグラフを作成する \{#build-flame-graph\}

```bash
clickhouse client --allow_introspection_functions=1 \
    -q "SELECT arrayJoin(flameGraph(trace, size, ptr))
        FROM (
            SELECT * FROM system.trace_log
            WHERE trace_type = 'MemorySample'
              AND query_id = '<query_id>'
              AND event_time <= '<time_point>'
            ORDER BY event_time
        )" \
    | flamegraph.pl --countname=bytes --color=mem > flame_mem_time_point_pos.svg
```

#### その時点以降のメモリ解放のフレームグラフを作成する (後から何が解放されたかを把握するため) \{#build-flame-graph-deallocations\}

```bash
clickhouse client --allow_introspection_functions=1 \
    -q "SELECT arrayJoin(flameGraph(trace, -size, ptr))
        FROM (
            SELECT * FROM system.trace_log
            WHERE trace_type = 'MemorySample'
              AND query_id = '<query_id>'
              AND event_time > '<time_point>'
            ORDER BY event_time DESC
        )" \
    | flamegraph.pl --countname=bytes --color=mem > flame_mem_time_point_neg.svg
```

## 例 \{#example\}

以下のコードスニペットでは:

* クエリ識別子と現在の日付で `trace_log` データをフィルタリングします。
* スタックトレース単位で集計します。
* イントロスペクション関数を使用して、次の内容を含むレポートを取得します。
  * シンボル名と、それに対応するソースコード上の関数名
  * これらの関数が記述されているソースコード上の位置

```sql
SELECT
    count(),
    arrayStringConcat(arrayMap(x -> concat(demangle(addressToSymbol(x)), '\n    ', addressToLine(x)), trace), '\n') AS sym
FROM system.trace_log
WHERE (query_id = '<query_id>') AND (event_date = today())
GROUP BY trace
ORDER BY count() DESC
LIMIT 10
```
