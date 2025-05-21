---
description: 'ClickHouseにおけるアロケーションプロファイリングの詳細を説明するページ'
sidebar_label: 'アロケーションプロファイリング'
slug: /operations/allocation-profiling
title: 'アロケーションプロファイリング'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# アロケーションプロファイリング

ClickHouseは、アロケーションサンプリングおよびプロファイリング用のツールを備えたグローバルアロケーターとして [jemalloc](https://github.com/jemalloc/jemalloc) を使用しています。  
アロケーションプロファイリングをより便利にするために、Keeperの4LWコマンドに沿った `SYSTEM` コマンドが提供されています。

## アロケーションのサンプリングとヒーププロファイルのフラッシュ {#sampling-allocations-and-flushing-heap-profiles}

`jemalloc` のアロケーションをサンプリングしてプロファイリングするには、環境変数 `MALLOC_CONF` を使用してプロファイリングを有効にしてClickHouse/Keeperを起動する必要があります。

```sh
MALLOC_CONF=background_thread:true,prof:true
```

`jemalloc` はアロケーションをサンプリングし、情報を内部に保存します。

現在のプロファイルをフラッシュするために `jemalloc` に以下を実行します:

<Tabs groupId="binary">
<TabItem value="clickhouse" label="ClickHouse">

    SYSTEM JEMALLOC FLUSH PROFILE

</TabItem>
<TabItem value="keeper" label="Keeper">

    echo jmfp | nc localhost 9181

</TabItem>
</Tabs>

デフォルトでは、ヒーププロファイルファイルは `/tmp/jemalloc_clickhouse._pid_._seqnum_.heap` に生成されます。ここで、`_pid_` はClickHouseのPID、`_seqnum_` は現在のヒーププロファイルのグローバルシーケンス番号です。  
Keeperの場合、デフォルトファイルは `/tmp/jemalloc_keeper._pid_._seqnum_.heap` で同じルールに従います。

異なる場所を定義するには、`prof_prefix`オプションで `MALLOC_CONF` 環境変数を追加します。  
例えば、ファイル名のプレフィックスを `my_current_profile` にして `/data` フォルダにプロファイルを生成したい場合は、次の環境変数でClickHouse/Keeperを実行します:
```sh
MALLOC_CONF=background_thread:true,prof:true,prof_prefix:/data/my_current_profile
```
生成されたファイルはプレフィックスにPIDとシーケンス番号を追加します。

## ヒーププロファイルの分析 {#analyzing-heap-profiles}

ヒーププロファイルを生成した後、これらを分析する必要があります。  
そのためには `jemalloc` のツールである [jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in) を使用します。これは複数の方法でインストールできます:
- システムのパッケージマネージャを使用して `jemalloc` をインストールする
- [jemallocリポジトリ](https://github.com/jemalloc/jemalloc) をクローンし、ルートフォルダから autogen.sh を実行すると、`bin` フォルダ内に `jeprof` スクリプトが提供されます

:::note
`jeprof` はスタックトレースを生成するために `addr2line` を使用しますが、これが非常に遅い場合があります。  
その場合、ツールの[代替実装](https://github.com/gimli-rs/addr2line)をインストールすることをお勧めします。

```bash
git clone https://github.com/gimli-rs/addr2line.git --depth=1 --branch=0.23.0
cd addr2line
cargo build --features bin --release
cp ./target/release/addr2line path/to/current/addr2line
```
:::

`jeprof` を使用してヒーププロファイルから生成できる形式は多数あります。  
ツールが提供する使用法やさまざまなオプションを確認するには、`jeprof --help` を実行することをお勧めします。

一般的に、`jeprof` コマンドは次のようになります:

```sh
jeprof path/to/binary path/to/heap/profile --output_format [ > output_file]
```

2つのプロファイル間でどのアロケーションが発生したかを比較したい場合は、ベース引数を設定できます:

```sh
jeprof path/to/binary --base path/to/first/heap/profile path/to/second/heap/profile --output_format [ > output_file]
```

例えば:

- 各手続きが行ごとに書かれたテキストファイルを生成したい場合:

```sh
jeprof path/to/binary path/to/heap/profile --text > result.txt
```

- コールグラフを持つPDFファイルを生成したい場合:

```sh
jeprof path/to/binary path/to/heap/profile --pdf > result.pdf
```

### フレームグラフの生成 {#generating-flame-graph}

`jeprof` はフレームグラフを生成するための折りたたまれたスタックを生成することを可能にします。

`--collapsed` 引数を使用する必要があります:

```sh
jeprof path/to/binary path/to/heap/profile --collapsed > result.collapsed
```

その後、折りたたまれたスタックを可視化するためのさまざまなツールを使用できます。

最も一般的なのは、[FlameGraph](https://github.com/brendangregg/FlameGraph) で、`flamegraph.pl` というスクリプトが含まれています:

```sh
cat result.collapsed | /path/to/FlameGraph/flamegraph.pl --color=mem --title="アロケーションフレームグラフ" --width 2400 > result.svg
```

もう1つの興味深いツールは、[speedscope](https://www.speedscope.app/) で、収集したスタックをよりインタラクティブに分析することができます。

## 実行中のアロケーションプロファイラの制御 {#controlling-allocation-profiler-during-runtime}

ClickHouse/Keeperがプロファイラを有効にして起動された場合、実行中にアロケーションプロファイリングを無効または有効にするための追加コマンドをサポートしています。  
これらのコマンドを使用すると、特定の期間のみプロファイルするのが簡単です。

プロファイラを無効にする:

<Tabs groupId="binary">
<TabItem value="clickhouse" label="ClickHouse">

    SYSTEM JEMALLOC DISABLE PROFILE

</TabItem>
<TabItem value="keeper" label="Keeper">

    echo jmdp | nc localhost 9181

</TabItem>
</Tabs>

プロファイラを有効にする:

<Tabs groupId="binary">
<TabItem value="clickhouse" label="ClickHouse">

    SYSTEM JEMALLOC ENABLE PROFILE

</TabItem>
<TabItem value="keeper" label="Keeper">

    echo jmep | nc localhost 9181

</TabItem>
</Tabs>

プロファイラの初期状態を制御するためにも、デフォルトで有効になっている `prof_active` オプションを設定することが可能です。  
起動中にアロケーションをサンプリングしないようにしたい場合、プロファイラを有効にした後のみサンプリングしたい場合は、次の環境変数でClickHouse/Keeperを起動します:
```sh
MALLOC_CONF=background_thread:true,prof:true,prof_active:false
```

そして、後でプロファイラを有効にします。

## プロファイラの追加オプション {#additional-options-for-profiler}

`jemalloc` には、プロファイラに関連する多くの異なるオプションが利用可能で、`MALLOC_CONF` 環境変数を変更することで制御できます。  
例えば、アロケーションサンプルの間隔は `lg_prof_sample` で制御できます。  
Nバイトごとにヒーププロファイルをダンプしたい場合は、`lg_prof_interval` を使用して有効にできます。  

このようなオプションについては、`jemalloc` の [リファレンスページ](https://jemalloc.net/jemalloc.3.html) を確認することをお勧めします。

## その他のリソース {#other-resources}

ClickHouse/Keeperは、さまざまな方法で `jemalloc` に関連するメトリクスを公開しています。

:::warning 注意
これらのメトリクスは互いに同期されておらず、値がずれる可能性があることに注意することが重要です。
:::

### システムテーブル `asynchronous_metrics` {#system-table-asynchronous_metrics}

```sql
SELECT *
FROM system.asynchronous_metrics
WHERE metric ILIKE '%jemalloc%'
FORMAT Vertical
```

[リファレンス](/operations/system-tables/asynchronous_metrics)

### システムテーブル `jemalloc_bins` {#system-table-jemalloc_bins}

異なるサイズクラス（ビン）での `jemalloc` アロケーターを使用したメモリアロケーションに関する情報が、すべてのアリーナから集計されて含まれています。

[リファレンス](/operations/system-tables/jemalloc_bins)

### Prometheus {#prometheus}

`asynchronous_metrics` からのすべての `jemalloc` 関連メトリクスは、ClickHouseとKeeperの両方でPrometheusエンドポイントを使用して公開されています。

[リファレンス](/operations/server-configuration-parameters/settings#prometheus)

### Keeperの `jmst` 4LWコマンド {#jmst-4lw-command-in-keeper}

Keeperは、[基本的なアロケーターの統計情報](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics)を返す `jmst` 4LWコマンドをサポートしています。

例:
```sh
echo jmst | nc localhost 9181
```
