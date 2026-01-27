---
description: 'ClickHouse におけるアロケーションプロファイリングの詳細ページ'
sidebar_label: 'バージョン 25.9 以前のアロケーションプロファイリング'
slug: /operations/allocation-profiling-old
title: 'バージョン 25.9 以前のアロケーションプロファイリング'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 25.9 以前のバージョン向けのアロケーションプロファイリング \{#allocation-profiling-for-versions-before-259\}

ClickHouse はグローバルアロケータとして [jemalloc](https://github.com/jemalloc/jemalloc) を使用します。jemalloc には、アロケーションのサンプリングとプロファイリングのためのツールが付属しています。  
アロケーションプロファイリングをより便利に行えるように、Keeper では `SYSTEM` コマンドに加えて four letter word (4LW) コマンドも提供されています。

## アロケーションのサンプリングとヒーププロファイルのフラッシュ \{#sampling-allocations-and-flushing-heap-profiles\}

`jemalloc` でアロケーションのサンプリングとプロファイリングを行う場合は、環境変数 `MALLOC_CONF` を使用してプロファイリングを有効にし、ClickHouse/Keeper を起動する必要があります。

```sh
MALLOC_CONF=background_thread:true,prof:true
```

`jemalloc` はアロケーションをサンプリングし、その情報を内部に保持します。

現在のプロファイルをフラッシュするように `jemalloc` に指示するには、次を実行します:

<Tabs groupId="binary">
  <TabItem value="clickhouse" label="ClickHouse">
    ```sql
    SYSTEM JEMALLOC FLUSH PROFILE
    ```
  </TabItem>

  <TabItem value="keeper" label="Keeper">
    ```sh
    echo jmfp | nc localhost 9181
    ```
  </TabItem>
</Tabs>

デフォルトでは、ヒーププロファイル用のファイルは `/tmp/jemalloc_clickhouse._pid_._seqnum_.heap` に生成されます。ここで `_pid_` は ClickHouse の PID、`_seqnum_` は現在のヒーププロファイルに対するグローバルシーケンス番号です。\
Keeper の場合、デフォルトファイルは `/tmp/jemalloc_keeper._pid_._seqnum_.heap` であり、同じルールに従います。

`MALLOC_CONF` 環境変数に `prof_prefix` オプションを追加することで、別の場所を指定できます。\
たとえば、`/data` ディレクトリ内に、ファイル名のプレフィックスを `my_current_profile` としてプロファイルを生成したい場合は、ClickHouse/Keeper を次の環境変数を指定して実行します:

```sh
MALLOC_CONF=background_thread:true,prof:true,prof_prefix:/data/my_current_profile
```

生成されるファイル名は、接頭辞、PID、シーケンス番号を連結したものになります。

## ヒーププロファイルの解析 \{#analyzing-heap-profiles\}

ヒーププロファイルを生成したら、それを解析する必要があります。\
そのために、`jemalloc` のツールである [jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in) を使用できます。これは複数の方法でインストールできます:

* システムのパッケージマネージャーを使用する
* [jemalloc リポジトリ](https://github.com/jemalloc/jemalloc) をクローンし、ルートディレクトリで `autogen.sh` を実行する。この方法では、`bin` ディレクトリ内で `jeprof` スクリプトが利用できるようになります

:::note
`jeprof` はスタックトレースを生成するために `addr2line` を使用しますが、これは非常に遅くなる場合があります。\
その場合は、このツールの[代替実装](https://github.com/gimli-rs/addr2line)をインストールすることを推奨します。

```bash
git clone https://github.com/gimli-rs/addr2line.git --depth=1 --branch=0.23.0
cd addr2line
cargo build --features bin --release
cp ./target/release/addr2line path/to/current/addr2line
```

:::

`jeprof` を使用してヒーププロファイルから生成できる形式には、さまざまなものがあります。
ツールの使い方および利用可能な各種オプションについては、`jeprof --help` を実行して確認することをお勧めします。

一般的に、`jeprof` コマンドは次のように使用します。

```sh
jeprof path/to/binary path/to/heap/profile --output_format [ > output_file]
```

2つのプロファイル間でどの割り当てが行われたかを比較したい場合は、`base` 引数を指定できます。

```sh
jeprof path/to/binary --base path/to/first/heap/profile path/to/second/heap/profile --output_format [ > output_file]
```

### 例 \{#examples\}

* 各プロシージャを1行ごとに記述したテキストファイルを生成したい場合:

```sh
jeprof path/to/binary path/to/heap/profile --text > result.txt
```

* コールグラフを含む PDF ファイルを生成したい場合:

```sh
jeprof path/to/binary path/to/heap/profile --pdf > result.pdf
```

### フレームグラフの生成 \{#generating-flame-graph\}

`jeprof` を使用すると、フレームグラフの作成に必要な折りたたみスタック（collapsed stack）を生成できます。

`--collapsed` 引数を指定する必要があります。

```sh
jeprof path/to/binary path/to/heap/profile --collapsed > result.collapsed
```

その後、折り畳まれたスタックを可視化するために、さまざまなツールを利用できます。

最も一般的なのは [FlameGraph](https://github.com/brendangregg/FlameGraph) で、`flamegraph.pl` というスクリプトが付属しています。

```sh
cat result.collapsed | /path/to/FlameGraph/flamegraph.pl --color=mem --title="Allocation Flame Graph" --width 2400 > result.svg
```

もう 1 つ有用なツールとして [speedscope](https://www.speedscope.app/) があり、収集したスタック情報をよりインタラクティブに解析できます。

## 実行時のアロケーションプロファイラの制御 \{#controlling-allocation-profiler-during-runtime\}

ClickHouse/Keeper をプロファイラを有効にした状態で起動した場合、実行時にアロケーションプロファイリングを無効化/有効化するための追加コマンドを使用できます。
これらのコマンドを使用すると、特定の時間区間のみをプロファイルしやすくなります。

プロファイラを無効にするには:

<Tabs groupId="binary">
  <TabItem value="clickhouse" label="ClickHouse">
    ```sql
    SYSTEM JEMALLOC DISABLE PROFILE
    ```
  </TabItem>

  <TabItem value="keeper" label="Keeper">
    ```sh
    echo jmdp | nc localhost 9181
    ```
  </TabItem>
</Tabs>

プロファイラを有効にするには:

<Tabs groupId="binary">
  <TabItem value="clickhouse" label="ClickHouse">
    ```sql
    SYSTEM JEMALLOC ENABLE PROFILE
    ```
  </TabItem>

  <TabItem value="keeper" label="Keeper">
    ```sh
    echo jmep | nc localhost 9181
    ```
  </TabItem>
</Tabs>

`prof_active` オプションを設定することで、プロファイラの初期状態を制御することも可能です。このオプションはデフォルトで有効になっています。\
たとえば、起動時にはアロケーションをサンプリングせず、起動後のみサンプリングしたい場合は、その時点でプロファイラを有効にします。次の環境変数を指定して ClickHouse/Keeper を起動できます:

```sh
MALLOC_CONF=background_thread:true,prof:true,prof_active:false
```

プロファイラは後から有効化することもできます。

## プロファイラの追加オプション \{#additional-options-for-profiler\}

`jemalloc` にはプロファイラに関連する多数のオプションが用意されており、`MALLOC_CONF` 環境変数を変更して制御できます。
たとえば、アロケーションサンプル間の間隔は `lg_prof_sample` で制御できます。  
ヒーププロファイルを N バイトごとにダンプしたい場合は、`lg_prof_interval` を有効化してください。  

利用可能なオプションの一覧については、`jemalloc` の[リファレンスページ](https://jemalloc.net/jemalloc.3.html)を参照してください。

## その他のリソース \{#other-resources\}

ClickHouse/Keeper は、`jemalloc` 関連のメトリクスをさまざまな方法で公開しています。

:::warning 注意
これらのメトリクスは互いに同期されておらず、値がずれていく可能性があることを認識しておくことが重要です。
:::

### システムテーブル `asynchronous_metrics` \{#system-table-asynchronous_metrics\}

```sql
SELECT *
FROM system.asynchronous_metrics
WHERE metric LIKE '%jemalloc%'
FORMAT Vertical
```

[リファレンス](/operations/system-tables/asynchronous_metrics)

### システムテーブル `jemalloc_bins` \{#system-table-jemalloc_bins\}

サイズクラス（bin）ごとに `jemalloc` アロケータ経由で行われたメモリ割り当てに関する情報を、すべてのアリーナから集約して格納します。

[リファレンス](/operations/system-tables/jemalloc_bins)

### Prometheus \{#prometheus\}

`asynchronous_metrics` に含まれるすべての `jemalloc` 関連メトリクスは、ClickHouse と Keeper の両方で Prometheus エンドポイントを通じても公開されます。

[リファレンス](/operations/server-configuration-parameters/settings#prometheus)

### Keeper における `jmst` 4LW コマンド \{#jmst-4lw-command-in-keeper\}

Keeper は `jmst` 4LW コマンドをサポートしており、[基本的なアロケータ統計情報](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics) を返します。

```sh
echo jmst | nc localhost 9181
```
