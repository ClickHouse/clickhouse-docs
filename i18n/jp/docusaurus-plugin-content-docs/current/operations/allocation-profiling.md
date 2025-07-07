---
'description': 'ClickHouse における割り当てプロファイリングに関するページ'
'sidebar_label': 'アロケーションプロファイリング'
'slug': '/operations/allocation-profiling'
'title': 'Allocation profiling'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

```md

# アロケーションプロファイリング

ClickHouseは、アロケーションサンプリングとプロファイリングのためのツールを備えたグローバルアロケータとして[jemalloc](https://github.com/jemalloc/jemalloc)を使用しています。  
アロケーションプロファイリングをより便利にするために、`SYSTEM`コマンドがKeeperの4LWコマンドと共に提供されています。

## アロケーションのサンプリングとヒーププロファイルのフラッシュ {#sampling-allocations-and-flushing-heap-profiles}

`jemalloc`でアロケーションをサンプリングおよびプロファイリングするには、環境変数`MALLOC_CONF`を使用してプロファイリングを有効にしてClickHouse/Keeperを起動する必要があります。

```sh
MALLOC_CONF=background_thread:true,prof:true
```

`jemalloc`はアロケーションをサンプリングし、情報を内部に保存します。

現在のプロファイルをフラッシュするには、次のコマンドを実行します。

<Tabs groupId="binary">
<TabItem value="clickhouse" label="ClickHouse">

    SYSTEM JEMALLOC FLUSH PROFILE

</TabItem>
<TabItem value="keeper" label="Keeper">

    echo jmfp | nc localhost 9181

</TabItem>
</Tabs>

デフォルトでは、ヒーププロファイルファイルは`/tmp/jemalloc_clickhouse._pid_._seqnum_.heap`に生成されます。ここで、`_pid_`はClickHouseのPIDで、`_seqnum_`は現在のヒーププロファイルのグローバルシーケンス番号です。  
Keeperの場合、デフォルトのファイルは`/tmp/jemalloc_keeper._pid_._seqnum_.heap`で、同様のルールに従います。

異なる場所を定義するには、`prof_prefix`オプションを付加して`MALLOC_CONF`環境変数を設定します。  
例えば、ファイル名のプレフィックスを`my_current_profile`にして`/data`フォルダにプロファイルを生成したい場合、次の環境変数でClickHouse/Keeperを実行します。
```sh
MALLOC_CONF=background_thread:true,prof:true,prof_prefix:/data/my_current_profile
```
生成されるファイルはプレフィックスにPIDとシーケンス番号を付加したものになります。

## ヒーププロファイルの分析 {#analyzing-heap-profiles}

ヒーププロファイルを生成した後、これを分析する必要があります。  
そのために、`jemalloc`のツールである[jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in)を使用します。これは複数の方法でインストールできます：
- システムのパッケージマネージャを使用して`jemalloc`をインストール
- [jemallocレポジトリ](https://github.com/jemalloc/jemalloc)をクローンし、ルートフォルダからautogen.shを実行して`bin`フォルダ内に`jeprof`スクリプトを提供します。

:::note
`jeprof`はスタックトレースを生成するために`addr2line`を使用するため、非常に遅くなることがあります。  
その場合、ツールの[代替実装](https://github.com/gimli-rs/addr2line)をインストールすることをお勧めします。

```bash
git clone https://github.com/gimli-rs/addr2line.git --depth=1 --branch=0.23.0
cd addr2line
cargo build --features bin --release
cp ./target/release/addr2line path/to/current/addr2line
```
:::

`jeprof`を使用してヒーププロファイルから生成できる異なるフォーマットが多数あります。
`jeprof --help`を実行して、ツールが提供する多くの異なるオプションと使用法を確認することをお勧めします。

一般的に、`jeprof`コマンドは次のようになります：

```sh
jeprof path/to/binary path/to/heap/profile --output_format [ > output_file]
```

2つのプロファイル間でどのアロケーションが発生したかを比較したい場合は、ベース引数を設定できます：

```sh
jeprof path/to/binary --base path/to/first/heap/profile path/to/second/heap/profile --output_format [ > output_file]
```

例えば：

- 各手続きを行ごとに記述したテキストファイルを生成したい場合：

```sh
jeprof path/to/binary path/to/heap/profile --text > result.txt
```

- コールグラフを含むPDFファイルを生成したい場合：

```sh
jeprof path/to/binary path/to/heap/profile --pdf > result.pdf
```

### フレームグラフの生成 {#generating-flame-graph}

`jeprof`は、フレームグラフを構築するために圧縮スタックを生成できます。

`--collapsed`引数を使用する必要があります：

```sh
jeprof path/to/binary path/to/heap/profile --collapsed > result.collapsed
```

その後、圧縮スタックを視覚化するために多くの異なるツールを使用できます。

最も人気があるのは、[FlameGraph](https://github.com/brendangregg/FlameGraph)で、`flamegraph.pl`というスクリプトが含まれています：

```sh
cat result.collapsed | /path/to/FlameGraph/flamegraph.pl --color=mem --title="Allocation Flame Graph" --width 2400 > result.svg
```

もう一つ興味深いツールは、収集されたスタックをよりインタラクティブに分析できる[speedscope](https://www.speedscope.app/)です。

## 実行時のアロケーションプロファイラーの制御 {#controlling-allocation-profiler-during-runtime}

ClickHouse/Keeperがプロファイラーを有効にして起動された場合、実行時にアロケーションプロファイリングを無効/有効にするための追加コマンドをサポートしています。
これらのコマンドを使用すると、特定の間隔だけをプロファイリングすることが容易になります。

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

プロファイラーの初期状態を`prof_active`オプションによって制御することも可能で、デフォルトでは有効になっています。  
例えば、起動時にアロケーションをサンプリングしたくないが、プロファイラーを有効にした後のみサンプリングを行いたい場合、次の環境変数でClickHouse/Keeperを起動します。
```sh
MALLOC_CONF=background_thread:true,prof:true,prof_active:false
```

そして、後でプロファイラーを有効にします。

## プロファイラーの追加オプション {#additional-options-for-profiler}

`jemalloc`には、プロファイラーに関連する多くの異なるオプションがあり、`MALLOC_CONF`環境変数を変更することで制御できます。
例えば、アロケーションサンプル間の間隔は`lg_prof_sample`で制御できます。  
Nバイトごとにヒーププロファイルをダンプしたい場合は、`lg_prof_interval`を使用して有効にできます。

そのようなオプションについては、`jemalloc`の[リファレンスページ](https://jemalloc.net/jemalloc.3.html)を確認することをお勧めします。

## その他のリソース {#other-resources}

ClickHouse/Keeperは、さまざまな方法で`jemalloc`に関連するメトリックを公開しています。

:::warning 警告
これらのメトリックは互いに同期されていないため、値がずれる可能性があることを認識しておくことが重要です。
:::

### システムテーブル `asynchronous_metrics` {#system-table-asynchronous_metrics}

```sql
SELECT *
FROM system.asynchronous_metrics
WHERE metric ILIKE '%jemalloc%'
FORMAT Vertical
```

[参照](/operations/system-tables/asynchronous_metrics)

### システムテーブル `jemalloc_bins` {#system-table-jemalloc_bins}

異なるサイズクラス（ビン）でのjemallocアロケータによるメモリアロケーションに関する情報を、すべてのアリーナから集約したものを含んでいます。

[参照](/operations/system-tables/jemalloc_bins)

### Prometheus {#prometheus}

`asynchronous_metrics`からのすべての`jemalloc`に関連するメトリックは、ClickHouseとKeeperの両方でPrometheusエンドポイントを介して公開されています。

[参照](/operations/server-configuration-parameters/settings#prometheus)

### Keeperの`jmst` 4LWコマンド {#jmst-4lw-command-in-keeper}

Keeperは、[基本的なアロケータ統計](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics)を返す`jmst` 4LWコマンドをサポートしています。

例：
```sh
echo jmst | nc localhost 9181
```
