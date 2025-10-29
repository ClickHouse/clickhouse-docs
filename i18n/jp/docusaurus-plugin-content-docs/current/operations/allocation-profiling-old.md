---
'description': 'ClickHouseにおけるアロケーションプロファイリングに関するページ'
'sidebar_label': '25.9以前のアロケーションプロファイリング'
'slug': '/operations/allocation-profiling-old'
'title': '25.9以前のアロケーションプロファイリング'
'doc_type': 'reference'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';



# 25.9以前のバージョンのアロケーションプロファイリング

ClickHouseは、[jemalloc](https://github.com/jemalloc/jemalloc) をグローバルアロケーターとして使用しています。Jemallocには、アロケーションのサンプリングとプロファイリングのためのツールが付属しています。  
アロケーションプロファイリングをより便利にするために、`SYSTEM` コマンドと Keeper の4文字ワード (4LW) コマンドが提供されています。

## アロケーションのサンプリングとヒーププロファイルのフラッシュ {#sampling-allocations-and-flushing-heap-profiles}

`jemalloc` のアロケーションをサンプリングしてプロファイリングするには、環境変数 `MALLOC_CONF` を使用してプロファイリングを有効にして ClickHouse/Keeper を起動する必要があります：

```sh
MALLOC_CONF=background_thread:true,prof:true
```

`jemalloc` はアロケーションをサンプリングし、情報を内部で保存します。

現在のプロファイルをフラッシュするには、以下のコマンドを実行します：

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

デフォルトでは、ヒーププロファイルファイルは `/tmp/jemalloc_clickhouse._pid_._seqnum_.heap` に生成され、ここで `_pid_` は ClickHouse の PID、`_seqnum_` は現在のヒーププロファイルのグローバルシーケンス番号です。  
Keeper の場合、デフォルトファイルは `/tmp/jemalloc_keeper._pid_._seqnum_.heap` で、同じルールに従います。

異なる場所を定義するには、`prof_prefix` オプションと一緒に `MALLOC_CONF` 環境変数を追加します。  
たとえば、ファイル名のプレフィックスを `my_current_profile` として `/data` フォルダ内にプロファイルを生成したい場合、次の環境変数を使用して ClickHouse/Keeper を実行できます：

```sh
MALLOC_CONF=background_thread:true,prof:true,prof_prefix:/data/my_current_profile
```

生成されたファイルは、プレフィックス PID とシーケンス番号に追加されます。

## ヒーププロファイルの分析 {#analyzing-heap-profiles}

ヒーププロファイルが生成されたら、それを分析する必要があります。  
そのために、`jemalloc` のツールである [jeprof](https://github.com/jemalloc/jemalloc/blob/dev/bin/jeprof.in) を使用できます。これは複数の方法でインストールできます：
- システムのパッケージマネージャを使用する
- [jemalloc リポジトリ](https://github.com/jemalloc/jemalloc) をクローンして、ルートフォルダから `autogen.sh` を実行します。これにより `bin` フォルダ内に `jeprof` スクリプトが提供されます。

:::note
`jeprof` はスタックトレースを生成するために `addr2line` を使用しますが、これは非常に遅くなる可能性があります。  
その場合は、ツールの [代替実装](https://github.com/gimli-rs/addr2line) をインストールすることをお勧めします。

```bash
git clone https://github.com/gimli-rs/addr2line.git --depth=1 --branch=0.23.0
cd addr2line
cargo build --features bin --release
cp ./target/release/addr2line path/to/current/addr2line
```
:::

`jeprof` を使用してヒーププロファイルから生成できる形式は多様です。  
使用法やツールが提供するさまざまなオプションに関する情報は、`jeprof --help` を実行することをお勧めします。

一般的に、`jeprof` コマンドの使い方は次のとおりです：

```sh
jeprof path/to/binary path/to/heap/profile --output_format [ > output_file]
```

2つのプロファイル間でどのアロケーションが発生したかを比較したい場合は、`base` 引数を設定できます：

```sh
jeprof path/to/binary --base path/to/first/heap/profile path/to/second/heap/profile --output_format [ > output_file]
```

### 例 {#examples}

- 各手続きを行ごとに書き込んだテキストファイルを生成したい場合：

```sh
jeprof path/to/binary path/to/heap/profile --text > result.txt
```

- コールグラフを持つPDFファイルを生成したい場合：

```sh
jeprof path/to/binary path/to/heap/profile --pdf > result.pdf
```

### フレームグラフの生成 {#generating-flame-graph}

`jeprof` を使用すると、フレームグラフを構築するための折りたたまれたスタックを生成できます。

`--collapsed` 引数を使用する必要があります：

```sh
jeprof path/to/binary path/to/heap/profile --collapsed > result.collapsed
```

その後、多くの異なるツールを使用して折りたたまれたスタックを視覚化できます。

最も популяр なものは [FlameGraph](https://github.com/brendangregg/FlameGraph) で、`flamegraph.pl` と呼ばれるスクリプトが含まれています：

```sh
cat result.collapsed | /path/to/FlameGraph/flamegraph.pl --color=mem --title="Allocation Flame Graph" --width 2400 > result.svg
```

もう1つの興味深いツールは [speedscope](https://www.speedscope.app/) で、収集されたスタックをよりインタラクティブな方法で分析できます。

## 実行時のアロケーションプロファイラの制御 {#controlling-allocation-profiler-during-runtime}

ClickHouse/Keeper がプロファイラを有効にして起動されると、実行時にアロケーションプロファイリングを無効/有効にする追加のコマンドがサポートされます。  
これらのコマンドを使用することで、特定のインターバルのみをプロファイリングするのが容易になります。

プロファイラを無効にするには：

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

プロファイラを有効にするには：

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

プロファイラの初期状態を制御することも可能で、デフォルトで有効になっています。  
たとえば、起動中にアロケーションのサンプリングを行わず、後でのみ行いたい場合は、プロファイラを無効にできます。次の環境変数を使用して ClickHouse/Keeper を起動できます：

```sh
MALLOC_CONF=background_thread:true,prof:true,prof_active:false
```

プロファイラは後で有効にできます。

## プロファイラの追加オプション {#additional-options-for-profiler}

`jemalloc` には、プロファイラに関連する多くの異なるオプションが用意されています。これらは `MALLOC_CONF` 環境変数を変更することで制御できます。  
たとえば、アロケーションサンプル間の間隔は `lg_prof_sample` で制御できます。  
N バイトごとにヒーププロファイルをダンプしたい場合は、`lg_prof_interval` を使用して有効にできます。

オプションの完全なリストについては、`jemalloc` の [リファレンスページ](https://jemalloc.net/jemalloc.3.html) を確認することをお勧めします。

## その他のリソース {#other-resources}

ClickHouse/Keeper は、`jemalloc` に関連するメトリクスを多くの異なる方法で公開しています。

:::warning 警告
これらのメトリクスは相互に同期されていないため、値がずれる可能性があることに注意してください。
:::

### システムテーブル `asynchronous_metrics` {#system-table-asynchronous_metrics}

```sql
SELECT *
FROM system.asynchronous_metrics
WHERE metric LIKE '%jemalloc%'
FORMAT Vertical
```

[参考](/operations/system-tables/asynchronous_metrics)

### システムテーブル `jemalloc_bins` {#system-table-jemalloc_bins}

異なるサイズクラス（ビン）での jemalloc アロケーターによるメモリアロケーションに関する情報を含み、すべてのアリーナから集約されています。

[参考](/operations/system-tables/jemalloc_bins)

### Prometheus {#prometheus}

`asynchronous_metrics` からのすべての `jemalloc` 関連メトリクスは、ClickHouse と Keeper の両方で Prometheus エンドポイントを使用して公開されています。

[参考](/operations/server-configuration-parameters/settings#prometheus)

### Keeper の `jmst` 4LW コマンド {#jmst-4lw-command-in-keeper}

Keeper は、[基本アロケータ統計](https://github.com/jemalloc/jemalloc/wiki/Use-Case%3A-Basic-Allocator-Statistics)を返す `jmst` 4LW コマンドをサポートしています：

```sh
echo jmst | nc localhost 9181
```
