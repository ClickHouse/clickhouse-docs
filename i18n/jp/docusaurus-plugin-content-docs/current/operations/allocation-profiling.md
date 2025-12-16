---
description: 'ClickHouse におけるアロケーションプロファイリングを詳しく説明するページ'
sidebar_label: 'アロケーションプロファイリング'
slug: /operations/allocation-profiling
title: 'アロケーションプロファイリング'
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# アロケーションプロファイリング {#allocation-profiling}

ClickHouse はグローバルアロケータとして [jemalloc](https://github.com/jemalloc/jemalloc) を使用しています。jemalloc には、アロケーションのサンプリングおよびプロファイリング用のツールが付属しています。  
アロケーションプロファイリングをより手軽に行えるように、ClickHouse と Keeper では、設定ファイルやクエリ設定、`SYSTEM` コマンド、Keeper の four letter word (4LW) コマンドを使用してサンプリングを制御できます。  
さらに、サンプルは `JemallocSample` 型として `system.trace_log` テーブルに収集できます。

:::note

このガイドはバージョン 25.9 以降に適用されます。  
それ以前のバージョンについては、[25.9 より前のバージョン向けアロケーションプロファイリング](/operations/allocation-profiling-old.md) を参照してください。

:::

## アロケーションのサンプリング {#sampling-allocations}

`jemalloc` でアロケーションのサンプリングおよびプロファイリングを行うには、`jemalloc_enable_global_profiler` 設定を有効にして ClickHouse/Keeper を起動する必要があります。

```xml
<clickhouse>
    <jemalloc_enable_global_profiler>1</jemalloc_enable_global_profiler>
</clickhouse>
```

`jemalloc` はアロケーションをサンプリングし、その情報を内部に保持します。

`jemalloc_enable_profiler` 設定を使用することで、クエリ単位のアロケーションを有効にすることもできます。

:::warning 警告
ClickHouse はアロケーションが多いアプリケーションであるため、jemalloc のサンプリングによりパフォーマンス上のオーバーヘッドが発生する可能性があります。
:::

## `system.trace_log` に jemalloc サンプルを保存する {#storing-jemalloc-samples-in-system-trace-log}

すべての jemalloc サンプルを `JemallocSample` 型として `system.trace_log` に格納できます。
これをグローバルに有効化するには、設定項目 `jemalloc_collect_global_profile_samples_in_trace_log` を使用します。

```xml
<clickhouse>
    <jemalloc_collect_global_profile_samples_in_trace_log>1</jemalloc_collect_global_profile_samples_in_trace_log>
</clickhouse>
```

:::warning 警告
ClickHouse はメモリ割り当てを多用するアプリケーションであるため、`system.trace_log` ですべてのサンプルを収集すると高負荷になる可能性があります。
:::

`jemalloc_collect_profile_samples_in_trace_log` 設定を使用して、クエリごとに有効化することもできます。

### `system.trace_log` を使用してクエリのメモリ使用量を分析する例 {#example-analyzing-memory-usage-trace-log}

まず、jemalloc プロファイラを有効にしてクエリを実行し、そのクエリのサンプルを `system.trace_log` に収集する必要があります。

```sql
SELECT *
FROM numbers(1000000)
ORDER BY number DESC
SETTINGS max_bytes_ratio_before_external_sort = 0
FORMAT `Null`
SETTINGS jemalloc_enable_profiler = 1, jemalloc_collect_profile_samples_in_trace_log = 1

Query id: 8678d8fe-62c5-48b8-b0cd-26851c62dd75

Ok.

0 rows in set. Elapsed: 0.009 sec. Processed 1.00 million rows, 8.00 MB (108.58 million rows/s., 868.61 MB/s.)
Peak memory usage: 12.65 MiB.
```

:::note
ClickHouse を起動するときに `jemalloc_enable_global_profiler` を有効にしている場合、`jemalloc_enable_profiler` を有効にする必要はありません。\
`jemalloc_collect_global_profile_samples_in_trace_log` と `jemalloc_collect_profile_samples_in_trace_log` についても同様です。
:::

ここで `system.trace_log` をフラッシュします。

```sql
SYSTEM FLUSH LOGS trace_log
```

そして、各時点において実行したクエリのメモリ使用量を取得するためにクエリします。

```sql
WITH per_bucket AS
(
    SELECT
        event_time_microseconds AS bucket_time,
        sum(size) AS bucket_sum
    FROM system.trace_log
    WHERE trace_type = 'JemallocSample'
      AND query_id = '8678d8fe-62c5-48b8-b0cd-26851c62dd75'
    GROUP BY bucket_time
)
SELECT
    bucket_time,
    sum(bucket_sum) OVER (
        ORDER BY bucket_time ASC
        ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
    ) AS cumulative_size,
    formatReadableSize(cumulative_size) AS cumulative_size_readable
FROM per_bucket
ORDER BY bucket_time
```

メモリ使用量が最大だった時刻も確認できます：

```sql
SELECT
    argMax(bucket_time, cumulative_size),
    max(cumulative_size)
FROM
(
    WITH per_bucket AS
    (
        SELECT
            event_time_microseconds AS bucket_time,
            sum(size) AS bucket_sum
        FROM system.trace_log
        WHERE trace_type = 'JemallocSample'
          AND query_id = '8678d8fe-62c5-48b8-b0cd-26851c62dd75'
        GROUP BY bucket_time
    )
    SELECT
        bucket_time,
        sum(bucket_sum) OVER (
            ORDER BY bucket_time ASC
            ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW
        ) AS cumulative_size,
        formatReadableSize(cumulative_size) AS cumulative_size_readable
    FROM per_bucket
    ORDER BY bucket_time
)
```

その結果を使って、その時点でどこが最も活発に割り当てを行っていたかを確認できます。

```sql
SELECT
    concat(
        '\n',
        arrayStringConcat(
            arrayMap(
                (x, y) -> concat(x, ': ', y),
                arrayMap(x -> addressToLine(x), allocation_trace),
                arrayMap(x -> demangle(addressToSymbol(x)), allocation_trace)
            ),
            '\n'
        )
    ) AS symbolized_trace,
    sum(s) AS per_trace_sum
FROM
(
    SELECT
        ptr,
        sum(size) AS s,
        argMax(trace, event_time_microseconds) AS allocation_trace
    FROM system.trace_log
    WHERE trace_type = 'JemallocSample'
      AND query_id = '8678d8fe-62c5-48b8-b0cd-26851c62dd75'
      AND event_time_microseconds <= '2025-09-04 11:56:21.737139'
    GROUP BY ptr
    HAVING s > 0
)
GROUP BY ALL
ORDER BY per_trace_sum ASC
```

## ヒーププロファイルのフラッシュ {#flushing-heap-profiles}

デフォルトでは、ヒーププロファイル用ファイルは `/tmp/jemalloc_clickhouse._pid_._seqnum_.heap` に生成されます。ここで `_pid_` は ClickHouse の PID、`_seqnum_` は現在のヒーププロファイルに対応するグローバルなシーケンス番号です。\
Keeper のデフォルトファイルは `/tmp/jemalloc_keeper._pid_._seqnum_.heap` で、同じルールに従います。

`jemalloc` に現在のプロファイルをフラッシュさせるには、次を実行します。

<Tabs groupId="binary">
  <TabItem value="clickhouse" label="ClickHouse">
    ```sql
    SYSTEM JEMALLOC FLUSH PROFILE
    ```

    フラッシュされたプロファイルの保存先パスが返されます。
  </TabItem>

  <TabItem value="keeper" label="Keeper">
    ```sh
    echo jmfp | nc localhost 9181
    ```
  </TabItem>
</Tabs>

`MALLOC_CONF` 環境変数に `prof_prefix` オプションを追加することで、別の保存場所を指定できます。\
例えば、`/data` ディレクトリ内に、ファイル名のプレフィックスを `my_current_profile` としてプロファイルを生成したい場合は、次の環境変数を指定して ClickHouse/Keeper を実行します。

```sh
MALLOC_CONF=prof_prefix:/data/my_current_profile
```

生成されるファイル名には、プレフィックスに続いて PID とシーケンス番号が付加されます。

## ヒーププロファイルの分析 {#analyzing-heap-profiles}

ヒーププロファイルが生成されたら、それらを分析する必要があります。\
そのために、`jemalloc` のツールである [jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in) を使用できます。次のいずれかの方法でインストールできます。

* システムのパッケージマネージャーを使用する
* [jemalloc リポジトリ](https://github.com/jemalloc/jemalloc)をクローンし、ルートディレクトリで `autogen.sh` を実行する。これにより、`bin` ディレクトリ内に `jeprof` スクリプトが作成されます

:::note
`jeprof` はスタックトレースを生成するために `addr2line` を使用しますが、処理が非常に遅くなる場合があります。\
そのような場合には、このツールの[代替実装](https://github.com/gimli-rs/addr2line)をインストールすることを推奨します。

```bash
git clone https://github.com/gimli-rs/addr2line.git --depth=1 --branch=0.23.0
cd addr2line
cargo build --features bin --release
cp ./target/release/addr2line path/to/current/addr2line
```

また、`llvm-addr2line` も同様に問題なく動作します。

:::

`jeprof` を使用して、ヒーププロファイルからさまざまな形式を生成できます。
ツールの使い方や提供される各種オプションについては、`jeprof --help` を実行して確認することを推奨します。

一般的に、`jeprof` コマンドは次のように使用します。

```sh
jeprof path/to/binary path/to/heap/profile --output_format [ > output_file]
```

2つのプロファイルを比較して、その間にどの割り当てが発生したかを確認したい場合は、`base` 引数を指定します。

```sh
jeprof path/to/binary --base path/to/first/heap/profile path/to/second/heap/profile --output_format [ > output_file]
```

### 例 {#examples}

* 各プロシージャを1行ごとに記述したテキストファイルを生成したい場合:

```sh
jeprof path/to/binary path/to/heap/profile --text > result.txt
```

* コールグラフを含む PDF ファイルを生成したい場合:

```sh
jeprof path/to/binary path/to/heap/profile --pdf > result.pdf
```

### フレームグラフの生成 {#generating-flame-graph}

`jeprof` を使用すると、フレームグラフの作成に必要な折り畳みスタック（collapsed stacks）を生成できます。

`--collapsed` 引数を使用する必要があります。

```sh
jeprof path/to/binary path/to/heap/profile --collapsed > result.collapsed
```

その後は、コラプスされたスタックを可視化するために利用できるツールが多数あります。

最も広く使われているのは [FlameGraph](https://github.com/brendangregg/FlameGraph) で、`flamegraph.pl` というスクリプトが含まれています。

```sh
cat result.collapsed | /path/to/FlameGraph/flamegraph.pl --color=mem --title="メモリ割り当てフレームグラフ" --width 2400 > result.svg
```

もう 1 つ便利なツールに [speedscope](https://www.speedscope.app/) があり、収集したスタックをよりインタラクティブに分析できます。

## プロファイラ用の追加オプション {#additional-options-for-profiler}

`jemalloc` にはプロファイラに関連する多くのオプションがあり、`MALLOC_CONF` 環境変数を変更することで制御できます。
例えば、メモリ割り当てサンプル間の間隔は `lg_prof_sample` で制御できます。  
ヒーププロファイルを N バイトごとにダンプしたい場合は、`lg_prof_interval` を有効にします。  

利用可能なオプションの完全な一覧については、`jemalloc` の [リファレンスページ](https://jemalloc.net/jemalloc.3.html) を参照してください。

## その他のリソース {#other-resources}

ClickHouse/Keeper は、`jemalloc` 関連のメトリクスをさまざまな方法で公開します。

:::warning 警告
これらのメトリクスは相互に同期されておらず、値がずれる可能性があることを認識しておくことが重要です。
:::

### システムテーブル `asynchronous_metrics` {#system-table-asynchronous_metrics}

```sql
SELECT *
FROM system.asynchronous_metrics
WHERE metric LIKE '%jemalloc%'
FORMAT Vertical
```

[リファレンス](/operations/system-tables/asynchronous_metrics)

### システムテーブル `jemalloc_bins` {#system-table-jemalloc_bins}

すべてのアリーナから集約された、さまざまなサイズクラス（bin）における jemalloc アロケータによるメモリ割り当てに関する情報を含みます。

[リファレンス](/operations/system-tables/jemalloc_bins)

### Prometheus {#prometheus}

`asynchronous_metrics` に含まれるすべての `jemalloc` 関連メトリクスは、ClickHouse と Keeper の両方で Prometheus エンドポイントからも公開されます。

[リファレンス](/operations/server-configuration-parameters/settings#prometheus)

### Keeper における `jmst` 4LW コマンド {#jmst-4lw-command-in-keeper}

Keeper は `jmst` 4LW コマンドをサポートしており、[基本的なアロケータ統計情報](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics)を返します。

```sh
echo jmst | nc localhost 9181
```
