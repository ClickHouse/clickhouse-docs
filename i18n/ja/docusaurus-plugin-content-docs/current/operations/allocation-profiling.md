---
slug: /operations/allocation-profiling
sidebar_label: "アロケーションプロファイリング"
title: "アロケーションプロファイリング"
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# アロケーションプロファイリング

ClickHouseは、アロケーションサンプリングとプロファイリングのためのツールを持つグローバルアロケーターとして[jemalloc](https://github.com/jemalloc/jemalloc)を使用しています。  
アロケーションプロファイリングをより便利にするために、Keeperの4LWコマンドに沿った`SYSTEM`コマンドが提供されています。

## アロケーションのサンプリングとヒーププロファイルのフラッシュ {#sampling-allocations-and-flushing-heap-profiles}

`jemalloc`でアロケーションをサンプリングしてプロファイリングするには、 `MALLOC_CONF`環境変数を使用してプロファイリングを有効にしてClickHouse/Keeperを起動する必要があります。

```sh
MALLOC_CONF=background_thread:true,prof:true
```

`jemalloc`はアロケーションをサンプリングし、内部に情報を保存します。

現在のプロファイルをフラッシュするように`jemalloc`に指示するには、以下を実行します：

<Tabs groupId="binary">
<TabItem value="clickhouse" label="ClickHouse">

    SYSTEM JEMALLOC FLUSH PROFILE

</TabItem>
<TabItem value="keeper" label="Keeper">

    echo jmfp | nc localhost 9181

</TabItem>
</Tabs>

デフォルトでは、ヒーププロファイルファイルは`/tmp/jemalloc_clickhouse._pid_._seqnum_.heap`に生成されます。ここで、`_pid_`はClickHouseのPIDで、`_seqnum_`は現在のヒーププロファイルのグローバルシーケンス番号です。  
Keeperの場合、デフォルトファイルは`/tmp/jemalloc_keeper._pid_._seqnum_.heap`で、同様のルールに従います。

異なる場所を定義するには、`prof_prefix`オプションを付加して`MALLOC_CONF`環境変数を設定できます。  
例えば、ファイル名の接頭辞を`my_current_profile`とし、`/data`フォルダにプロファイルを生成したい場合、次の環境変数を使用してClickHouse/Keeperを起動します：
```sh
MALLOC_CONF=background_thread:true,prof:true,prof_prefix:/data/my_current_profile
```
生成されるファイルは接頭辞にPIDとシーケンス番号を追加します。

## ヒーププロファイルの分析 {#analyzing-heap-profiles}

ヒーププロファイルを生成した後、それを分析する必要があります。  
そのためには、`jemalloc`のツールである[jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in)を使用する必要があります。このツールは複数の方法でインストールできます：
- システムのパッケージマネージャーを使用して`jemalloc`をインストールする
- [jemallocリポジトリ](https://github.com/jemalloc/jemalloc)をクローンし、ルートフォルダからautogen.shを実行すると、`bin`フォルダ内に`jeprof`スクリプトが提供されます

:::note
`jeprof`はスタックトレースを生成するために`addr2line`を使用しますが、これが非常に遅くなることがあります。  
その場合、ツールの[代替実装](https://github.com/gimli-rs/addr2line)をインストールすることをお勧めします。

```bash
git clone https://github.com/gimli-rs/addr2line.git --depth=1 --branch=0.23.0
cd addr2line
cargo build --features bin --release
cp ./target/release/addr2line path/to/current/addr2line
```
:::

`jeprof`を使用してヒーププロファイルから生成できる形式は多様です。  
`jeprof --help`を実行して、ツールが提供する使用方法やさまざまなオプションを確認することをお勧めします。

一般的に、`jeprof`コマンドは次のようになります：

```sh
jeprof path/to/binary path/to/heap/profile --output_format [ > output_file]
```

2つのプロファイル間でどのアロケーションが発生したかを比較したい場合は、基準引数を設定できます：

```sh
jeprof path/to/binary --base path/to/first/heap/profile path/to/second/heap/profile --output_format [ > output_file]
```

例えば：

- 各手続きを行ごとに書き込んだテキストファイルを生成したい場合：

```sh
jeprof path/to/binary path/to/heap/profile --text > result.txt
```

- コールグラフを含むPDFファイルを生成したい場合：

```sh
jeprof path/to/binary path/to/heap/profile --pdf > result.pdf
```

### フレームグラフの生成 {#generating-flame-graph}

`jeprof`を使用して、フレームグラフを構築するための圧縮スタックを生成することができます。

`--collapsed`引数を使用する必要があります：

```sh
jeprof path/to/binary path/to/heap/profile --collapsed > result.collapsed
```

その後、圧縮スタックを可視化するためのさまざまなツールを使用できます。

最も人気のあるツールは[FlameGraph](https://github.com/brendangregg/FlameGraph)で、`flamegraph.pl`というスクリプトが含まれています：

```sh
cat result.collapsed | /path/to/FlameGraph/flamegraph.pl --color=mem --title="アロケーション フレーム グラフ" --width 2400 > result.svg
```

もう一つの興味深いツールは、収集したスタックをよりインタラクティブに分析できる[speedscope](https://www.speedscope.app/)です。

## 実行時のアロケーションプロファイラーの制御 {#controlling-allocation-profiler-during-runtime}

ClickHouse/Keeperがプロファイラーを有効にして開始された場合、実行時にアロケーションプロファイリングを無効および有効にするための追加コマンドをサポートしています。  
これらのコマンドを使用することで、特定の間隔のみをプロファイリングするのが簡単になります。

プロファイラーを無効にする：

<Tabs groupId="binary">
<TabItem value="clickhouse" label="ClickHouse">

    SYSTEM JEMALLOC DISABLE PROFILE

</TabItem>
<TabItem value="keeper" label="Keeper">

    echo jmdp | nc localhost 9181

</TabItem>
</Tabs>

プロファイラーを有効にする：

<Tabs groupId="binary">
<TabItem value="clickhouse" label="ClickHouse">

    SYSTEM JEMALLOC ENABLE PROFILE

</TabItem>
<TabItem value="keeper" label="Keeper">

    echo jmep | nc localhost 9181

</TabItem>
</Tabs>

プロファイラーの初期状態を`prof_active`オプションを設定することで制御することも可能です。このオプションはデフォルトで有効になっています。  
例えば、起動中にアロケーションをサンプリングせず、プロファイラーを有効にした後のみサンプリングを行いたい場合は、以下の環境変数を使用してClickHouse/Keeperを起動できます：
```sh
MALLOC_CONF=background_thread:true,prof:true,prof_active:false
```

その後、後でプロファイラーを有効にします。

## プロファイラーの追加オプション {#additional-options-for-profiler}

`jemalloc`には、プロファイラーに関連するさまざまなオプションがあり、`MALLOC_CONF`環境変数を変更することで制御できます。  
例えば、アロケーションサンプルの間隔は`lg_prof_sample`で制御可能です。  
Nバイトごとにヒーププロファイルをダンプしたい場合は、`lg_prof_interval`を使用して有効にすることができます。

このようなオプションについては、`jemalloc`の[リファレンスページ](https://jemalloc.net/jemalloc.3.html)を確認することをお勧めします。

## その他のリソース {#other-resources}

ClickHouse/Keeperは、`jemalloc`に関連するメトリックをさまざまな方法で公開しています。

:::warning 注意
これらのメトリックは互いに同期されていないため、値がずれる可能性があることに注意してください。
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

異なるサイズクラス（ビン）でjemallocアロケーターを介して行われたメモリアロケーションに関する情報が、すべてのアリーナから集計されています。

[リファレンス](/operations/system-tables/jemalloc_bins)

### Prometheus {#prometheus}

`asynchronous_metrics`のすべての`jemalloc`関連メトリックは、ClickHouseとKeeperの両方でPrometheusエンドポイントを使用して公開されています。

[リファレンス](/operations/server-configuration-parameters/settings#prometheus)

### Keeperの`jmst` 4LWコマンド {#jmst-4lw-command-in-keeper}

Keeperは、[基本的なアロケーター統計](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics)を返す`jmst` 4LWコマンドをサポートしています。

例：
```sh
echo jmst | nc localhost 9181
```
