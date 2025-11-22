---
description: 'ClickHouse におけるメモリアロケーションプロファイリングの詳細ページ'
sidebar_label: 'アロケーションプロファイリング'
slug: /operations/allocation-profiling
title: 'アロケーションプロファイリング'
doc_type: 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# アロケーションプロファイリング

ClickHouse はグローバルアロケーターとして [jemalloc](https://github.com/jemalloc/jemalloc) を使用します。jemalloc には、アロケーションのサンプリングおよびプロファイリング用のツールが付属しています。  
アロケーションプロファイリングをより便利に行えるように、ClickHouse および Keeper では、設定ファイル、クエリ設定、`SYSTEM` コマンド、および Keeper の four-letter word (4LW) コマンドを用いてサンプリングを制御できます。  
さらに、サンプルは `JemallocSample` 型として `system.trace_log` テーブルに収集できます。

:::note

このガイドはバージョン 25.9 以降に適用されます。
それ以前のバージョンについては、[25.9 より前のバージョン向けアロケーションプロファイリング](/operations/allocation-profiling-old.md) を参照してください。

:::



## アロケーションのサンプリング {#sampling-allocations}

`jemalloc`でアロケーションをサンプリングおよびプロファイリングする場合は、`jemalloc_enable_global_profiler`設定を有効にしてClickHouse/Keeperを起動する必要があります。

```xml
<clickhouse>
    <jemalloc_enable_global_profiler>1</jemalloc_enable_global_profiler>
</clickhouse>
```

`jemalloc`はアロケーションをサンプリングし、その情報を内部に保存します。

また、`jemalloc_enable_profiler`設定を使用することで、クエリごとにアロケーションのプロファイリングを有効にすることもできます。

:::warning 警告
ClickHouseはアロケーション負荷の高いアプリケーションであるため、jemallocのサンプリングによってパフォーマンスオーバーヘッドが発生する可能性があります。
:::


## `system.trace_log`へのjemallocサンプルの保存 {#storing-jemalloc-samples-in-system-trace-log}

すべてのjemallocサンプルを`system.trace_log`に`JemallocSample`タイプとして保存できます。
グローバルに有効化するには、設定`jemalloc_collect_global_profile_samples_in_trace_log`を使用します。

```xml
<clickhouse>
    <jemalloc_collect_global_profile_samples_in_trace_log>1</jemalloc_collect_global_profile_samples_in_trace_log>
</clickhouse>
```

:::warning 警告
ClickHouseはメモリ割り当てが頻繁に発生するアプリケーションであるため、system.trace_logにすべてのサンプルを収集すると高負荷が発生する可能性があります。
:::

クエリごとに有効化する場合は、`jemalloc_collect_profile_samples_in_trace_log`設定を使用します。

### `system.trace_log`を使用したクエリのメモリ使用量分析の例 {#example-analyzing-memory-usage-trace-log}

まず、jemallocプロファイラを有効にしてクエリを実行し、サンプルを`system.trace_log`に収集する必要があります:

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
ClickHouseが`jemalloc_enable_global_profiler`で起動された場合、`jemalloc_enable_profiler`を有効にする必要はありません。
`jemalloc_collect_global_profile_samples_in_trace_log`と`jemalloc_collect_profile_samples_in_trace_log`についても同様です。
:::

`system.trace_log`をフラッシュします:

```sql
SYSTEM FLUSH LOGS trace_log
```

次に、実行したクエリの各時点でのメモリ使用量を取得するためにクエリを実行します:

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

メモリ使用量が最も高かった時刻を見つけることもできます:

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

この結果を使用して、その時点で最も活発なメモリ割り当てがどこから発生していたかを確認できます:


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

デフォルトでは、ヒーププロファイルファイルは `/tmp/jemalloc_clickhouse._pid_._seqnum_.heap` に生成されます。ここで `_pid_` は ClickHouse のプロセスID、`_seqnum_` は現在のヒーププロファイルのグローバルシーケンス番号です。  
Keeper の場合、デフォルトファイルは `/tmp/jemalloc_keeper._pid_._seqnum_.heap` であり、同じ規則に従います。

以下を実行することで、`jemalloc` に現在のプロファイルをフラッシュするよう指示できます:

<Tabs groupId="binary">
<TabItem value="clickhouse" label="ClickHouse">
    
```sql
SYSTEM JEMALLOC FLUSH PROFILE
```

フラッシュされたプロファイルの場所が返されます。

</TabItem>
<TabItem value="keeper" label="Keeper">
    
```sh
echo jmfp | nc localhost 9181
```

</TabItem>
</Tabs>

`MALLOC_CONF` 環境変数に `prof_prefix` オプションを追加することで、異なる場所を指定できます。  
例えば、ファイル名のプレフィックスが `my_current_profile` となる `/data` フォルダにプロファイルを生成したい場合、以下の環境変数を設定して ClickHouse/Keeper を実行できます:

```sh
MALLOC_CONF=prof_prefix:/data/my_current_profile
```

生成されるファイル名には、プレフィックスに続いてプロセスIDとシーケンス番号が付加されます。


## ヒーププロファイルの解析 {#analyzing-heap-profiles}

ヒーププロファイルが生成された後、それらを解析する必要があります。
そのために、`jemalloc`のツールである[jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in)を使用できます。これは複数の方法でインストールできます:

- システムのパッケージマネージャーを使用する
- [jemallocリポジトリ](https://github.com/jemalloc/jemalloc)をクローンし、ルートフォルダから`autogen.sh`を実行する。これにより、`bin`フォルダ内に`jeprof`スクリプトが提供されます

:::note
`jeprof`はスタックトレースを生成するために`addr2line`を使用しますが、これは非常に遅くなる可能性があります。
その場合は、このツールの[代替実装](https://github.com/gimli-rs/addr2line)をインストールすることを推奨します。

```bash
git clone https://github.com/gimli-rs/addr2line.git --depth=1 --branch=0.23.0
cd addr2line
cargo build --features bin --release
cp ./target/release/addr2line path/to/current/addr2line
```

あるいは、`llvm-addr2line`も同様に機能します。

:::

`jeprof`を使用してヒーププロファイルから生成できる形式は多数あります。
使用方法とツールが提供する各種オプションについての情報は、`jeprof --help`を実行することを推奨します。

一般的に、`jeprof`コマンドは次のように使用されます:

```sh
jeprof path/to/binary path/to/heap/profile --output_format [ > output_file]
```

2つのプロファイル間でどのアロケーションが発生したかを比較したい場合は、`base`引数を設定できます:

```sh
jeprof path/to/binary --base path/to/first/heap/profile path/to/second/heap/profile --output_format [ > output_file]
```

### 例 {#examples}

- 各プロシージャを1行ずつ記述したテキストファイルを生成したい場合:

```sh
jeprof path/to/binary path/to/heap/profile --text > result.txt
```

- コールグラフを含むPDFファイルを生成したい場合:

```sh
jeprof path/to/binary path/to/heap/profile --pdf > result.pdf
```

### フレームグラフの生成 {#generating-flame-graph}

`jeprof`を使用すると、フレームグラフを構築するための折りたたまれたスタックを生成できます。

`--collapsed`引数を使用する必要があります:

```sh
jeprof path/to/binary path/to/heap/profile --collapsed > result.collapsed
```

その後、折りたたまれたスタックを可視化するために、さまざまなツールを使用できます。

最も人気があるのは[FlameGraph](https://github.com/brendangregg/FlameGraph)で、`flamegraph.pl`というスクリプトが含まれています:

```sh
cat result.collapsed | /path/to/FlameGraph/flamegraph.pl --color=mem --title="Allocation Flame Graph" --width 2400 > result.svg
```

もう1つの興味深いツールは[speedscope](https://www.speedscope.app/)で、収集されたスタックをよりインタラクティブな方法で解析できます。


## プロファイラーの追加オプション {#additional-options-for-profiler}

`jemalloc`には、プロファイラーに関連する多数のオプションが用意されています。これらは`MALLOC_CONF`環境変数を変更することで制御できます。
例えば、割り当てサンプル間の間隔は`lg_prof_sample`で制御できます。  
Nバイトごとにヒーププロファイルをダンプする場合は、`lg_prof_interval`を使用して有効にできます。

オプションの完全なリストについては、`jemalloc`の[リファレンスページ](https://jemalloc.net/jemalloc.3.html)を確認することを推奨します。


## その他のリソース {#other-resources}

ClickHouse/Keeperは、`jemalloc`関連のメトリクスをさまざまな方法で公開しています。

:::warning 警告
これらのメトリクスは互いに同期されておらず、値にずれが生じる可能性があることに注意してください。
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

すべてのアリーナから集約された、jemallocアロケータによる異なるサイズクラス(ビン)でのメモリ割り当てに関する情報を含みます。

[リファレンス](/operations/system-tables/jemalloc_bins)

### Prometheus {#prometheus}

`asynchronous_metrics`のすべての`jemalloc`関連メトリクスは、ClickHouseとKeeperの両方でPrometheusエンドポイントを使用して公開されています。

[リファレンス](/operations/server-configuration-parameters/settings#prometheus)

### Keeperの`jmst` 4LWコマンド {#jmst-4lw-command-in-keeper}

Keeperは、[基本的なアロケータ統計](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics)を返す`jmst` 4LWコマンドをサポートしています:

```sh
echo jmst | nc localhost 9181
```
