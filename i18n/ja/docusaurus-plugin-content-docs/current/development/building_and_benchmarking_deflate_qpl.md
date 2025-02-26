---
slug: /development/building_and_benchmarking_deflate_qpl
sidebar_position: 73
sidebar_label: DEFLATE_QPLのビルドとベンチマーキング
description: Clickhouseをビルドし、DEFLATE_QPL Codecでベンチマークを実行する方法
---

# DEFLATE_QPLを使ったClickhouseのビルド

- ホストマシンがQPLの必要な[前提条件](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#prerequisites)を満たしていることを確認してください。
- deflate_qplはcmakeビルド中にデフォルトで有効になっています。もし誤って変更した場合は、ビルドフラグを再確認してください: ENABLE_QPL=1

- 一般的な要件については、Clickhouseの一般的な[ビルド指示](https://clickhouse.com/docs/ja/development/build.md)を参照してください。

# DEFLATE_QPLでのベンチマーキングの実行

## ファイルリスト {#files-list}

`benchmark_sample`フォルダは、[qpl-cmake](https://github.com/ClickHouse/ClickHouse/tree/master/contrib/qpl-cmake)の下にあり、Pythonスクリプトを使ってベンチマークを実行する例を示しています。

`client_scripts`には、典型的なベンチマークを実行するためのPythonスクリプトが含まれています。例えば:
- `client_stressing_test.py`: 1〜4のサーバーインスタンスでのクエリストレステスト用のPythonスクリプト。
- `queries_ssb.sql`: [Star Schema Benchmark](https://clickhouse.com/docs/ja/getting-started/example-datasets/star-schema/)のすべてのクエリをリストしたファイル。
- `allin1_ssb.sh`: このシェルスクリプトは、すべてのワークフローを自動的に実行します。

`database_files`は、lz4/deflate/zstdコーデックに従ってデータベースファイルを保存することを意味します。

## スター・スキーマのために自動的にベンチマークを実行する: {#run-benchmark-automatically-for-star-schema}

``` bash
$ cd ./benchmark_sample/client_scripts
$ sh run_ssb.sh
```

完了した後は、すべての結果をこのフォルダで確認してください: `./output/`

もし失敗した場合は、以下のセクションに従って手動でベンチマークを実行してください。

## 定義 {#definition}

[CLICKHOUSE_EXE]はClickhouse実行可能プログラムのパスを意味します。

## 環境 {#environment}

- CPU: Sapphire Rapid
- OS要件は[QPLのシステム要件](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#system-requirements)を参照してください。
- IAAの設定は[アクセラレータ構成](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration)を参照してください。
- Pythonモジュールをインストールします:

``` bash
pip3 install clickhouse_driver numpy
```

[IAAのセルフチェック]

``` bash
$ accel-config list | grep -P 'iax|state'
```

期待される出力は次のようになります:
``` bash
    "dev":"iax1",
    "state":"enabled",
            "state":"enabled",
```

出力が何も表示されない場合、IAAは動作の準備ができていないことを意味します。もう一度IAAの設定を確認してください。

## 生データの生成 {#generate-raw-data}

``` bash
$ cd ./benchmark_sample
$ mkdir rawdata_dir && cd rawdata_dir
```

[`dbgen`](https://clickhouse.com/docs/ja/getting-started/example-datasets/star-schema)を使用して、次のパラメータで1億行のデータを生成します:
-s 20

`*.tbl`のようなファイルが`./benchmark_sample/rawdata_dir/ssb-dbgen`の下に出力されることが期待されます。

## データベースのセットアップ {#database-setup}

LZ4コーデックを使ったデータベースの設定

``` bash
$ cd ./database_dir/lz4
$ [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

ここでは、コンソールから`Connected to ClickHouse server`のメッセージが表示されるはずです。これは、クライアントがサーバーとの接続を正常に確立したことを意味します。

[Star Schema Benchmark](https://clickhouse.com/docs/ja/getting-started/example-datasets/star-schema)に記載されている以下の3つのステップを完了してください。
- ClickHouseでテーブルを作成すること。
- データを挿入すること。ここでは`./benchmark_sample/rawdata_dir/ssb-dbgen/*.tbl`を入力データとして使用する必要があります。
- "スター・スキーマ"を非正規化された"フラット・スキーマ"に変換すること。

IAA Deflateコーデックを使ったデータベースの設定

``` bash
$ cd ./database_dir/deflate
$ [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```
上記のLZ4と同様に3つのステップを完了してください。

ZSTDコーデックを使ったデータベースの設定

``` bash
$ cd ./database_dir/zstd
$ [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```
上記のLZ4と同様に3つのステップを完了してください。

[セルフチェック]
各コーデック（lz4/zstd/deflate）について、データベースが正常に作成されたことを確認するために以下のクエリを実行してください:
```sql
select count() from lineorder_flat
```
次の出力が期待されます:
```sql
┌───count()─┐
│ 119994608 │
└───────────┘
```
[IAA Deflateコーデックのセルフチェック]

最初に挿入またはクエリをクライアントから実行する際に、Clickhouseサーバーのコンソールは次のログを出力することが期待されます:
```text
Hardware-assisted DeflateQpl codec is ready!
```
もしこのログが表示されず、次のような別のログが表示される場合:
```text
Initialization of hardware-assisted DeflateQpl codec failed
```
これはIAAデバイスの準備ができていないことを意味しますので、もう一度IAAの設定を確認する必要があります。

## 単一インスタンスでのベンチマーク {#benchmark-with-single-instance}

- ベンチマークを開始する前に、C6を無効にし、CPU周波数のガバナーを`performance`に設定してください。

``` bash
$ cpupower idle-set -d 3
$ cpupower frequency-set -g performance
```

- メモリのバウンドの影響を排除するために、`numactl`を使用してサーバーを1つのソケットにバインドし、クライアントを別のソケットにバインドします。
- 単一インスタンスとは、1つのサーバーに接続された1つのクライアントを指します。

次に、LZ4/Deflate/ZSTDそれぞれでベンチマークを実行します:

LZ4:

``` bash
$ cd ./database_dir/lz4 
$ numactl -m 0 -N 0 [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 1 > lz4.log
```

IAA deflate:

``` bash
$ cd ./database_dir/deflate
$ numactl -m 0 -N 0 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 1 > deflate.log
```

ZSTD:

``` bash
$ cd ./database_dir/zstd
$ numactl -m 0 -N 0 [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 1 > zstd.log
```

これで次の3つのログが期待通りに出力されるはずです:
```text
lz4.log
deflate.log
zstd.log
```

パフォーマンスメトリックを確認する方法:

私たちはQPSに注目します。`QPS_Final`というキーワードを検索し、統計を収集してください。

## マルチインスタンスでのベンチマーク {#benchmark-with-multi-instances}

- スレッドの影響を軽減するために、マルチインスタンスでベンチマークを実行することをお勧めします。
- マルチインスタンスとは、複数（2または4）のサーバーがそれぞれのクライアントに接続された状態を指します。
- 1つのソケットのコアは均等に分割され、サーバーに割り当てられる必要があります。
- マルチインスタンスの場合、各コーデックのために新しいフォルダを作成し、単一インスタンスと同様のステップに従ってデータセットを挿入する必要があります。

2つの違いがあります:
- クライアント側では、テーブル作成とデータ挿入中に割り当てられたポートでClickhouseを起動する必要があります。
- サーバー側では、特定のXML設定ファイルを使用してClickhouseを起動する必要があります。そのポートは割り当てられている必要があります。マルチインスタンス用のカスタマイズされたXML設定ファイルは、./server_configの下に提供されています。

ここでは、ソケットあたり60コアがあると仮定し、2インスタンスを例にします。
最初のインスタンスのサーバーを起動します。
LZ4:

``` bash
$ cd ./database_dir/lz4
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
```

ZSTD:

``` bash
$ cd ./database_dir/zstd
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
```

IAA Deflate:

``` bash
$ cd ./database_dir/deflate
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
```

[2番目のインスタンスのサーバーを起動]

LZ4:

``` bash
$ cd ./database_dir && mkdir lz4_s2 && cd lz4_s2
$ cp ../../server_config/config_lz4_s2.xml ./
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_lz4_s2.xml >&/dev/null&
```

ZSTD:

``` bash
$ cd ./database_dir && mkdir zstd_s2 && cd zstd_s2
$ cp ../../server_config/config_zstd_s2.xml ./
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_zstd_s2.xml >&/dev/null&
```

IAA Deflate:

``` bash
$ cd ./database_dir && mkdir deflate_s2 && cd deflate_s2
$ cp ../../server_config/config_deflate_s2.xml ./
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_deflate_s2.xml >&/dev/null&
```

2番目のインスタンスのためにテーブルを作成し、データを挿入します。

テーブル作成:

``` bash
$ [CLICKHOUSE_EXE] client -m --port=9001 
```

データ挿入:

``` bash
$ [CLICKHOUSE_EXE] client --query "INSERT INTO [TBL_FILE_NAME] FORMAT CSV" < [TBL_FILE_NAME].tbl  --port=9001
```

- [TBL_FILE_NAME]は`./benchmark_sample/rawdata_dir/ssb-dbgen`の下にある正規表現で命名されたファイルの名前を表しています。
- `--port=9001`はサーバーインスタンスの割り当てられたポートを表しており、これはconfig_lz4_s2.xml/config_zstd_s2.xml/config_deflate_s2.xmlで定義されています。さらにインスタンスがある場合には、それぞれ9002/9003の値に置き換える必要があります（s3/s4インスタンス）。割り当てを行わない場合、ポートはデフォルトの9000になり、最初のインスタンスで使用されます。

2インスタンスでのベンチマーキング

LZ4:

``` bash
$ cd ./database_dir/lz4
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ cd ./database_dir/lz4_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_lz4_s2.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2  > lz4_2insts.log
```

ZSTD:

``` bash
$ cd ./database_dir/zstd
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ cd ./database_dir/zstd_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_zstd_s2.xml >&/dev/null& 
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2 > zstd_2insts.log
```

IAA Deflate:

``` bash
$ cd ./database_dir/deflate
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ cd ./database_dir/deflate_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_deflate_s2.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2 > deflate_2insts.log
```

ここでのクライアントストレッシングテストスクリプトの最後の引数: `2`はインスタンスの数を表します。さらに多くのインスタンスの場合、この値を3または4に置き換える必要があります。このスクリプトは最大4インスタンスをサポートします。

次に、3つのログが期待通りに出力されるはずです:

``` text
lz4_2insts.log
deflate_2insts.log
zstd_2insts.log
```
パフォーマンスメトリックを確認する方法:

私たちはQPSに注目します。`QPS_Final`というキーワードを検索し、統計を収集してください。

4インスタンスのベンチマークセットアップは、上記の2インスタンスと似ています。
最終報告用に2インスタンスのベンチマークデータを使用することをお勧めします。

## ヒント {#tips}

新しいClickhouseサーバーを起動する前に、バックグラウンドで実行されているClickhouseプロセスがないことを確認してください。古いプロセスをチェックして、終了させてください:

``` bash
$ ps -aux | grep clickhouse
$ kill -9 [PID]
```
./client_scripts/queries_ssb.sqlのクエリリストと公式の[Star Schema Benchmark](https://clickhouse.com/docs/ja/getting-started/example-datasets/star-schema)を比較すると、3つのクエリQ1.2/Q1.3/Q3.4が含まれていないことがわかります。これは、これらのクエリのCPU使用率%が非常に低く< 10%であり、パフォーマンスの違いを示すことができないことを意味します。
