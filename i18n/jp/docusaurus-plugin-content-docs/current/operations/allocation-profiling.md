---
slug: /operations/allocation-profiling
sidebar_label: "アロケーションプロファイリング"
title: "アロケーションプロファイリング"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# アロケーションプロファイリング

ClickHouseは、アロケーションサンプリングとプロファイリングのためのいくつかのツールを備えたグローバルアロケータとして[jemalloc](https://github.com/jemalloc/jemalloc)を使用しています。  
アロケーションプロファイリングをより便利にするために、`SYSTEM`コマンドがKeeperの4LWコマンドと共に提供されています。

## アロケーションのサンプリングとヒーププロファイルのフラッシュ {#sampling-allocations-and-flushing-heap-profiles}

`jemalloc`でアロケーションをサンプリングおよびプロファイリングしたい場合は、環境変数`MALLOC_CONF`を使用してプロファイリングを有効にしてClickHouse/Keeperを起動する必要があります。

```sh
MALLOC_CONF=background_thread:true,prof:true
```

`jemalloc`はアロケーションをサンプリングし、内部に情報を格納します。

現在のプロファイルをフラッシュするために、`jemalloc`に次のコマンドを実行するよう指示できます：

<Tabs groupId="binary">
<TabItem value="clickhouse" label="ClickHouse">

    SYSTEM JEMALLOC FLUSH PROFILE

</TabItem>
<TabItem value="keeper" label="Keeper">

    echo jmfp | nc localhost 9181

</TabItem>
</Tabs>

デフォルトでは、ヒーププロファイルファイルは`/tmp/jemalloc_clickhouse._pid_._seqnum_.heap`に生成され、ここで`_pid_`はClickHouseのPID、`_seqnum_`は現在のヒーププロファイルのグローバルシーケンス番号です。  
Keeperの場合、デフォルトファイルは同じルールに従い、`/tmp/jemalloc_keeper._pid_._seqnum_.heap`です。

異なる場所を定義するには、`MALLOC_CONF`環境変数に`prof_prefix`オプションを追加します。  
たとえば、ファイル名のプレフィックスが`my_current_profile`である`/data`フォルダーにプロファイルを生成したい場合、次のようにClickHouse/Keeperを実行できます：
```sh
MALLOC_CONF=background_thread:true,prof:true,prof_prefix:/data/my_current_profile
```
生成されるファイルは、プレフィックスPIDとシーケンス番号を付加します。

## ヒーププロファイルの分析 {#analyzing-heap-profiles}

ヒーププロファイルを生成した後、これを分析する必要があります。  
そのためには、`jemalloc`のツールである[jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in)を使用する必要があります。これは複数の方法でインストールできます：
- システムのパッケージマネージャを使用して`jemalloc`をインストール
- [jemallocリポジトリ](https://github.com/jemalloc/jemalloc)をクローンし、ルートフォルダーからautogen.shを実行して、`bin`フォルダー内に`jeprof`スクリプトを提供する

:::note
`jeprof`は、非常に遅くなる可能性があるスタックトレースを生成するために`addr2line`を使用します。  
その場合、ツールの[代替実装](https://github.com/gimli-rs/addr2line)をインストールすることをお勧めします。

```bash
git clone https://github.com/gimli-rs/addr2line.git --depth=1 --branch=0.23.0
cd addr2line
cargo build --features bin --release
cp ./target/release/addr2line path/to/current/addr2line
```
:::

`jeprof`を使用してヒーププロファイルから生成できるさまざまなフォーマットがあります。  
ツールが提供する使用法とさまざまなオプションを確認するには、`jeprof --help`を実行することをお勧めします。

一般的に、`jeprof`コマンドは次のようになります：

```sh
jeprof path/to/binary path/to/heap/profile --output_format [ > output_file]
```

2つのプロファイル間でどのアロケーションが発生したかを比較したい場合は、ベース引数を設定できます：

```sh
jeprof path/to/binary --base path/to/first/heap/profile path/to/second/heap/profile --output_format [ > output_file]
```

例えば：

- 各手続きを1行ずつ書いたテキストファイルを生成したい場合：

```sh
jeprof path/to/binary path/to/heap/profile --text > result.txt
```

- コールグラフを持つPDFファイルを生成したい場合：

```sh
jeprof path/to/binary path/to/heap/profile --pdf > result.pdf
```

### フレームグラフの生成 {#generating-flame-graph}

`jeprof`は、フレームグラフを構築するための折りたたまれたスタックを生成することを可能にします。

`--collapsed`引数を使用する必要があります：

```sh
jeprof path/to/binary path/to/heap/profile --collapsed > result.collapsed
```

その後、折りたたまれたスタックを視覚化するために多くの異なるツールを使用できます。

最も人気のあるツールは、[FlameGraph](https://github.com/brendangregg/FlameGraph)であり、`flamegraph.pl`というスクリプトが含まれています：

```sh
cat result.collapsed | /path/to/FlameGraph/flamegraph.pl --color=mem --title="Allocation Flame Graph" --width 2400 > result.svg
```

もう一つの興味深いツールは、よりインタラクティブに収集したスタックを分析できる[speedscope](https://www.speedscope.app/)です。

## 実行時中のアロケーションプロファイラの制御 {#controlling-allocation-profiler-during-runtime}

プロファイラが有効な状態でClickHouse/Keeperが起動された場合、実行時中にアロケーションプロファイリングを無効/有効にするための追加コマンドをサポートしています。  
これらのコマンドを使用することで、特定の間隔だけをプロファイルしやすくなります。

プロファイラを無効にする：

<Tabs groupId="binary">
<TabItem value="clickhouse" label="ClickHouse">

    SYSTEM JEMALLOC DISABLE PROFILE

</TabItem>
<TabItem value="keeper" label="Keeper">

    echo jmdp | nc localhost 9181

</TabItem>
</Tabs>

プロファイラを有効にする：

<Tabs groupId="binary">
<TabItem value="clickhouse" label="ClickHouse">

    SYSTEM JEMALLOC ENABLE PROFILE

</TabItem>
<TabItem value="keeper" label="Keeper">

    echo jmep | nc localhost 9181

</TabItem>
</Tabs>

プロファイラの初期状態を設定することも可能で、デフォルトで有効になっています。  
たとえば、起動時にアロケーションをサンプリングしたくないが、プロファイラを有効にした後にのみサンプリングを行いたい場合、次の環境変数でClickHouse/Keeperを開始できます：
```sh
MALLOC_CONF=background_thread:true,prof:true,prof_active:false
```

その後、後でプロファイラを有効にします。

## プロファイラの追加オプション {#additional-options-for-profiler}

`jemalloc`にはプロファイラに関連するさまざまなオプションがあり、`MALLOC_CONF`環境変数を修正することで制御できます。  
たとえば、アロケーションサンプル間の間隔は`lg_prof_sample`で制御できます。  
Nバイトごとにヒーププロファイルをダンプしたい場合は、`lg_prof_interval`を使用して有効にできます。

そのようなオプションについては、`jemalloc`の[リファレンスページ](https://jemalloc.net/jemalloc.3.html)を確認することをお勧めします。

## その他のリソース {#other-resources}

ClickHouse/Keeperは、さまざまな方法で`jemalloc`に関連するメトリクスを公開しています。

:::warning 注意
これらのメトリクスは互いに有効ではなく、値がずれる可能性があることを認識しておくことが重要です。
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

異なるサイズクラス（ビン）で、jemallocアロケータによって実行されるメモリアロケーションに関する情報を、すべてのアリーナから集約したものです。

[リファレンス](/operations/system-tables/jemalloc_bins)

### Prometheus {#prometheus}

`asynchronous_metrics`からのすべての`jemalloc`関連のメトリクスは、ClickHouseとKeeperの両方でPrometheusエンドポイントを使用して公開されています。

[リファレンス](/operations/server-configuration-parameters/settings#prometheus)

### Keeperの`jmst` 4LWコマンド {#jmst-4lw-command-in-keeper}

Keeperは、[基本アロケータ統計](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics)を返す`jmst` 4LWコマンドをサポートしています。

例：
```sh
echo jmst | nc localhost 9181
```
