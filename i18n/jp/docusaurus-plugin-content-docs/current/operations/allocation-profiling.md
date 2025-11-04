---
'description': 'ClickHouseにおけるアロケーションプロファイリングの詳細ページ'
'sidebar_label': 'アロケーションプロファイリング'
'slug': '/operations/allocation-profiling'
'title': 'アロケーションプロファイリング'
'doc_type': 'guide'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# アロケーションプロファイリング

ClickHouseはグローバルアロケータとして [jemalloc](https://github.com/jemalloc/jemalloc) を使用しています。 Jemallocにはアロケーションサンプリングとプロファイリングのためのツールがいくつか備わっています。  
アロケーションプロファイリングをより便利にするために、ClickHouseとKeeperは設定、クエリ設定、`SYSTEM`コマンド、およびKeeperの4文字コマンド（4LW）を使用してサンプリングを制御することを可能にしています。  
また、サンプルは`system.trace_log`テーブルの`JemallocSample`タイプに収集することができます。

:::note

このガイドはバージョン25.9以降に適用されます。
それ以前のバージョンについては、[バージョン25.9以前のアロケーションプロファイリング](/operations/allocation-profiling-old.md)を確認してください。

:::

## サンプリングアロケーション {#sampling-allocations}

`jemalloc`でアロケーションをサンプリングしプロファイリングするには、設定`jemalloc_enable_global_profiler`を有効にした状態でClickHouse/Keeperを起動する必要があります。

```xml
<clickhouse>
    <jemalloc_enable_global_profiler>1</jemalloc_enable_global_profiler>
</clickhouse>
```

`jemalloc`はアロケーションをサンプリングし、情報を内部的に保存します。

また、`jemalloc_enable_profiler`設定を使用することで、クエリごとにアロケーションを有効にすることもできます。

:::warning 警告
ClickHouseはアロケーション負荷の大きいアプリケーションであるため、jemallocのサンプリングはパフォーマンスのオーバーヘッドを引き起こす可能性があります。
:::

## `system.trace_log`におけるjemallocサンプルの保存 {#storing-jemalloc-samples-in-system-trace-log}

すべてのjemallocサンプルを、`JemallocSample`タイプとして`system.trace_log`に保存することができます。
グローバルにこれを有効にするには、設定`jemalloc_collect_global_profile_samples_in_trace_log`を使用します。

```xml
<clickhouse>
    <jemalloc_collect_global_profile_samples_in_trace_log>1</jemalloc_collect_global_profile_samples_in_trace_log>
</clickhouse>
```

:::warning 警告
ClickHouseはアロケーション負荷の大きいアプリケーションであるため、system.trace_logへのすべてのサンプルの収集は高負荷を引き起こす可能性があります。
:::

また、`jemalloc_collect_profile_samples_in_trace_log`設定を使用することで、クエリごとに有効にすることもできます。

### `system.trace_log`を使用したクエリのメモリ使用量分析の例 {#example-analyzing-memory-usage-trace-log}

まず、jemallocプロファイラを有効にしてクエリを実行し、そのサンプルを`system.trace_log`に収集する必要があります：

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

`system.trace_log`をフラッシュします：

```sql
SYSTEM FLUSH LOGS trace_log
```
そして、実行したクエリの各時点でのメモリ使用量を取得するためにクエリします：
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

メモリ使用量が最も高かった時点を見つけることもできます：

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

その結果を使用して、その時点でのアクティブなアロケーションがどこから発生したかを確認できます：

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

デフォルトでは、ヒーププロファイルファイルは`/tmp/jemalloc_clickhouse._pid_._seqnum_.heap`に生成されます。ここで、`_pid_`はClickHouseのPIDで、`_seqnum_`は現在のヒーププロファイルのグローバルシーケンス番号です。  
Keeperの場合、デフォルトファイルは`/tmp/jemalloc_keeper._pid_._seqnum_.heap`で、同じルールに従います。

現在のプロファイルをフラッシュするには、`jemalloc`に次のコマンドを実行します：

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

`prof_prefix`オプションを付加した`MALLOC_CONF`環境変数を追加することで、異なる場所を定義できます。  
例えば、ファイル名のプレフィックスを`my_current_profile`にして`/data`フォルダにプロファイルを生成したい場合、次の環境変数でClickHouse/Keeperを実行します：

```sh
MALLOC_CONF=prof_prefix:/data/my_current_profile
```

生成されたファイルは、プレフィックスPIDとシーケンス番号に追加されます。

## ヒーププロファイルの分析 {#analyzing-heap-profiles}

ヒーププロファイルが生成されたら、それを分析する必要があります。  
そのために、`jemalloc`のツールである [jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in) を使用することができます。これは複数の方法でインストールできます：
- システムのパッケージマネージャを使用
- [jemallocリポジトリ](https://github.com/jemalloc/jemalloc)をクローンし、ルートフォルダから`autogen.sh`を実行します。これにより、`bin`フォルダ内に`jeprof`スクリプトが提供されます。

:::note
`jeprof`はスタックトレースを生成するために`addr2line`を使用し、非常に遅くなる場合があります。  
その場合は、ツールの[代替実装](https://github.com/gimli-rs/addr2line)をインストールすることが推奨されます。   

```bash
git clone https://github.com/gimli-rs/addr2line.git --depth=1 --branch=0.23.0
cd addr2line
cargo build --features bin --release
cp ./target/release/addr2line path/to/current/addr2line
```

また、`llvm-addr2line`も同様に機能します。

:::

`jeprof`を使用してヒーププロファイルから生成するフォーマットは多くあります。
ツールの使用法やさまざまなオプションについての情報は、`jeprof --help`を実行することをお勧めします。 

一般的に、`jeprof`コマンドは次のように使用されます：

```sh
jeprof path/to/binary path/to/heap/profile --output_format [ > output_file]
```

2つのプロファイル間でどのアロケーションが発生したかを比較したい場合は、`base`引数を設定できます：

```sh
jeprof path/to/binary --base path/to/first/heap/profile path/to/second/heap/profile --output_format [ > output_file]
```

### 例 {#examples}

- 各手続きが1行ずつ書かれたテキストファイルを生成したい場合：

```sh
jeprof path/to/binary path/to/heap/profile --text > result.txt
```

- コールグラフを持つPDFファイルを生成したい場合：

```sh
jeprof path/to/binary path/to/heap/profile --pdf > result.pdf
```

### ファイアフレームグラフの生成 {#generating-flame-graph}

`jeprof`はファイアフレームグラフを構築するために圧縮スタックを生成することができます。

`--collapsed`引数を使用する必要があります：

```sh
jeprof path/to/binary path/to/heap/profile --collapsed > result.collapsed
```

その後、圧縮スタックを視覚化するために多くの異なるツールを使用できます。

最も人気のあるツールは、[FlameGraph](https://github.com/brendangregg/FlameGraph)で、`flamegraph.pl`というスクリプトを備えています：

```sh
cat result.collapsed | /path/to/FlameGraph/flamegraph.pl --color=mem --title="Allocation Flame Graph" --width 2400 > result.svg
```

もう一つの興味深いツールは、[speedscope](https://www.speedscope.app/)で、収集されたスタックをよりインタラクティブに分析できます。

## プロファイラに関する追加オプション {#additional-options-for-profiler}

`jemalloc`には、プロファイラに関連する多数の異なるオプションがあります。これらは`MALLOC_CONF`環境変数を変更することで制御できます。
例えば、アロケーションサンプルの間隔は`lg_prof_sample`で制御できます。  
Nバイトごとにヒーププロファイルをダンプしたい場合は`lg_prof_interval`を使用して有効にできます。

オプションの完全なリストについては、`jemalloc`の[リファレンスページ](https://jemalloc.net/jemalloc.3.html)を確認することをお勧めします。

## その他のリソース {#other-resources}

ClickHouse/Keeperは、`jemalloc`関連のメトリクスをさまざまな方法で公開しています。

:::warning 警告
これらのメトリクスはすべて同期されていないため、値がずれる可能性があることを認識しておくことが重要です。
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

異なるサイズクラス（ビン）においてjemallocアロケータを介して行われたメモリアロケーションに関する情報を、すべてのアリーナから集約して含みます。

[リファレンス](/operations/system-tables/jemalloc_bins)

### Prometheus {#prometheus}

`asynchronous_metrics`からのすべての`jemalloc`関連メトリクスは、ClickHouseとKeeperの両方でPrometheusエンドポイントを使用して公開されています。

[リファレンス](/operations/server-configuration-parameters/settings#prometheus)

### Keeperの`jmst` 4LWコマンド {#jmst-4lw-command-in-keeper}

Keeperは、[基本アロケータ統計](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics)を返す`jmst` 4LWコマンドをサポートしています：

```sh
echo jmst | nc localhost 9181
```
