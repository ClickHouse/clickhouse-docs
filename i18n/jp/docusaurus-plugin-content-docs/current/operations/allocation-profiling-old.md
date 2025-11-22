---
description: 'ClickHouse におけるアロケーションプロファイリングの詳細ページ'
sidebar_label: 'バージョン 25.9 より前向けのアロケーションプロファイリング'
slug: /operations/allocation-profiling-old
title: 'バージョン 25.9 より前向けのアロケーションプロファイリング'
doc_type: 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';


# 25.9 以前のバージョンにおけるアロケーションプロファイリング

ClickHouse はグローバルアロケータとして [jemalloc](https://github.com/jemalloc/jemalloc) を使用しています。jemalloc には、アロケーションのサンプリングおよびプロファイリング用のツールが付属しています。  
アロケーションプロファイリングをより簡便に行えるように、Keeper では `SYSTEM` コマンドに加えて four-letter word (4LW) コマンドが提供されています。



## アロケーションのサンプリングとヒーププロファイルのフラッシュ {#sampling-allocations-and-flushing-heap-profiles}

`jemalloc`でアロケーションをサンプリングおよびプロファイリングする場合は、環境変数`MALLOC_CONF`を使用してプロファイリングを有効にした状態でClickHouse/Keeperを起動する必要があります:

```sh
MALLOC_CONF=background_thread:true,prof:true
```

`jemalloc`はアロケーションをサンプリングし、その情報を内部に保存します。

次のコマンドを実行することで、`jemalloc`に現在のプロファイルをフラッシュするよう指示できます:

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

デフォルトでは、ヒーププロファイルファイルは`/tmp/jemalloc_clickhouse._pid_._seqnum_.heap`に生成されます。ここで`_pid_`はClickHouseのPID、`_seqnum_`は現在のヒーププロファイルのグローバルシーケンス番号です。  
Keeperの場合、デフォルトファイルは`/tmp/jemalloc_keeper._pid_._seqnum_.heap`であり、同じ規則に従います。

`MALLOC_CONF`環境変数に`prof_prefix`オプションを追加することで、別の場所を指定できます。  
例えば、ファイル名のプレフィックスを`my_current_profile`として`/data`フォルダにプロファイルを生成したい場合は、次の環境変数を使用してClickHouse/Keeperを実行できます:

```sh
MALLOC_CONF=background_thread:true,prof:true,prof_prefix:/data/my_current_profile
```

生成されるファイル名には、プレフィックスにPIDとシーケンス番号が付加されます。


## ヒーププロファイルの分析 {#analyzing-heap-profiles}

ヒーププロファイルが生成された後は、それらを分析する必要があります。
そのために、`jemalloc`のツールである[jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in)を使用できます。インストール方法は複数あります:

- システムのパッケージマネージャーを使用する
- [jemallocリポジトリ](https://github.com/jemalloc/jemalloc)をクローンし、ルートフォルダから`autogen.sh`を実行する。これにより、`bin`フォルダ内に`jeprof`スクリプトが提供されます

:::note
`jeprof`は`addr2line`を使用してスタックトレースを生成しますが、これは非常に遅くなる可能性があります。
その場合は、このツールの[代替実装](https://github.com/gimli-rs/addr2line)をインストールすることを推奨します。

```bash
git clone https://github.com/gimli-rs/addr2line.git --depth=1 --branch=0.23.0
cd addr2line
cargo build --features bin --release
cp ./target/release/addr2line path/to/current/addr2line
```

:::

`jeprof`を使用してヒーププロファイルから生成できる形式は多数あります。
使用方法とツールが提供する各種オプションについての情報を確認するには、`jeprof --help`を実行することを推奨します。

一般的に、`jeprof`コマンドは次のように使用されます:

```sh
jeprof path/to/binary path/to/heap/profile --output_format [ > output_file]
```

2つのプロファイル間でどのアロケーションが発生したかを比較したい場合は、`base`引数を設定できます:

```sh
jeprof path/to/binary --base path/to/first/heap/profile path/to/second/heap/profile --output_format [ > output_file]
```

### 例 {#examples}

- 各プロシージャを1行ごとに記述したテキストファイルを生成する場合:

```sh
jeprof path/to/binary path/to/heap/profile --text > result.txt
```

- コールグラフを含むPDFファイルを生成する場合:

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

もう1つの興味深いツールは[speedscope](https://www.speedscope.app/)で、収集されたスタックをよりインタラクティブな方法で分析できます。


## 実行時のアロケーションプロファイラの制御 {#controlling-allocation-profiler-during-runtime}

ClickHouse/Keeperをプロファイラを有効にして起動した場合、実行時にアロケーションプロファイリングを無効化/有効化するための追加コマンドがサポートされます。
これらのコマンドを使用することで、特定の期間のみをプロファイリングすることが容易になります。

プロファイラを無効化するには:

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

プロファイラを有効化するには:

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

`prof_active`オプション(デフォルトで有効)を設定することで、プロファイラの初期状態を制御することも可能です。
例えば、起動時にはアロケーションをサンプリングせず、その後のみサンプリングしたい場合、次の環境変数を使用してClickHouse/Keeperを起動できます:

```sh
MALLOC_CONF=background_thread:true,prof:true,prof_active:false
```

プロファイラは後で有効化できます。


## プロファイラの追加オプション {#additional-options-for-profiler}

`jemalloc`には、プロファイラに関連する多数のオプションが用意されています。これらは`MALLOC_CONF`環境変数を変更することで制御できます。
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
