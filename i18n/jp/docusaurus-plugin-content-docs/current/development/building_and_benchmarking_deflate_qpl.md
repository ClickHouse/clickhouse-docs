---
slug: /development/building_and_benchmarking_deflate_qpl
sidebar_position: 73
sidebar_label: DEFLATE_QPLの構築とベンチマーキング
description: Clickhouseをビルドし、DEFLATE_QPLコーデックでベンチマークを実行する方法
---


# DEFLATE_QPLでClickhouseをビルドする

- ホストマシンがQPLの必要な [前提条件](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#prerequisites) を満たしていることを確認してください。
- deflate_qplはcmakeビルド中にデフォルトで有効になっています。誤って変更した場合は、ビルドフラグを再確認してください: ENABLE_QPL=1

- 一般的な要件については、Clickhouseの一般的な [ビルド手順](/development/build.md) を参照してください。


# DEFLATE_QPLでベンチマークを実行する

## ファイルリスト {#files-list}

`qpl-cmake`フォルダー内の `benchmark_sample` は、Pythonスクリプトを使用してベンチマークを実行する例を示します:

`client_scripts` には典型的なベンチマークを実行するためのPythonスクリプトが含まれています。例えば:
- `client_stressing_test.py`: [1～4] のサーバーインスタンスでのクエリストレステスト用のPythonスクリプト。
- `queries_ssb.sql`: [Star Schema Benchmark](/getting-started/example-datasets/star-schema/) 用のすべてのクエリをリストしたファイル。
- `allin1_ssb.sh`: このシェルスクリプトは、ベンチマークワークフローを自動的に1回で実行します。

`database_files` は、lz4/deflate/zstdコーデックに基づいてデータベースファイルを保存します。

## スターシーマの自動ベンチマーク実行: {#run-benchmark-automatically-for-star-schema}

``` bash
$ cd ./benchmark_sample/client_scripts
$ sh run_ssb.sh
```

完了後、すべての結果はこのフォルダーにあります: `./output/`

失敗した場合は、以下のセクションに従ってベンチマークを手動で実行してください。

## 定義 {#definition}

[CLICKHOUSE_EXE] はClickhouseの実行可能プログラムのパスを意味します。

## 環境 {#environment}

- CPU: Sapphire Rapid
- OS要件は [QPLのシステム要件](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#system-requirements) を参照してください。
- IAA設定については [アクセラレーターの設定](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration) を参照してください。
- Pythonモジュールをインストールします:

``` bash
pip3 install clickhouse_driver numpy
```

[IAAの自己チェック]

``` bash
$ accel-config list | grep -P 'iax|state'
```

期待される出力は次の通りです:
``` bash
    "dev":"iax1",
    "state":"enabled",
            "state":"enabled",
```

何も出力されない場合、IAAが準備が整っていないことを意味します。もう一度IAA設定を確認してください。

## 生データの生成 {#generate-raw-data}

``` bash
$ cd ./benchmark_sample
$ mkdir rawdata_dir && cd rawdata_dir
```

[`dbgen`](/getting-started/example-datasets/star-schema)を使用して、100百万行のデータを生成します。パラメータは:
-s 20

ファイル `*.tbl` は、`./benchmark_sample/rawdata_dir/ssb-dbgen` の下に出力されることが期待されます:

## データベースのセットアップ {#database-setup}

LZ4コーデックでデータベースをセットアップします

``` bash
$ cd ./database_dir/lz4
$ [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

ここでコンソールから `Connected to ClickHouse server` というメッセージが表示されるべきであり、クライアントがサーバーとの接続を正常に設定したことを意味します。

以下のブログで言及された3つのステップを完了します: [Star Schema Benchmark](/getting-started/example-datasets/star-schema)
- ClickHouseでテーブルを作成する
- データを挿入する。ここでは `./benchmark_sample/rawdata_dir/ssb-dbgen/*.tbl` を入力データとして使用します。
- "スターシーマ"を非正規化された "フラットスキーマ" に変換する

IAA Deflateコーデックでデータベースをセットアップします

``` bash
$ cd ./database_dir/deflate
$ [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```
上記のLZ4と同様に3つのステップを完了します。

ZSTDコーデックでデータベースをセットアップします

``` bash
$ cd ./database_dir/zstd
$ [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```
上記のLZ4と同様に3つのステップを完了します。

[自己チェック]
各コーデック(lz4/zstd/deflate)に対して、以下のクエリを実行してデータベースが正常に作成されたことを確認してください:
```sql
select count() from lineorder_flat
```
以下の出力が期待されます:
```sql
┌───count()─┐
│ 119994608 │
└───────────┘
```
[IAA Deflateコーデックの自己チェック]

クライアントから挿入またはクエリを初めて実行したときに、Clickhouseサーバーコンソールはこのログを出力することが期待されます:
```text
Hardware-assisted DeflateQpl codec is ready!
```
これが表示されない場合、次のような別のログが表示される場合:
```text
Initialization of hardware-assisted DeflateQpl codec failed
```
これはIAAデバイスが準備が整っていないことを意味します。もう一度IAA設定を確認する必要があります。

## 単一インスタンスでのベンチマーク {#benchmark-with-single-instance}

- ベンチマークを開始する前に、C6を無効にし、CPU周波数のガバナーを `performance` に設定してください。

``` bash
$ cpupower idle-set -d 3
$ cpupower frequency-set -g performance
```

- メモリバウンドの影響を減らすために、`numactl`を使用してサーバーを1つのソケットにバインドし、クライアントを別のソケットにバインドします。
- 単一インスタンスは、単一のサーバーが単一のクライアントに接続されていることを意味します。

LZ4、Deflate、ZSTDのそれぞれでベンチマークを実行します:

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

現在、3つのログが期待通りに出力されるべきです:
```text
lz4.log
deflate.log
zstd.log
```

パフォーマンスメトリックスを確認する方法:

QPSに焦点を当て、キーワード: `QPS_Final` を検索し、統計情報を収集してください。

## マルチインスタンスでのベンチマーク {#benchmark-with-multi-instances}

- スレッド数が多すぎる場合のメモリバウンドの影響を減らすために、マルチインスタンスでベンチマークを実行することを推奨します。
- マルチインスタンスは、複数（2または4）のサーバーがそれぞれのクライアントに接続されていることを意味します。
- 1つのソケットのコアは均等に分割し、それぞれのサーバーに割り当てる必要があります。
- マルチインスタンスの場合、各コーデックに新しいフォルダーを作成し、単一インスタンスと同様の手順に従ってデータセットを挿入する必要があります。

2つの違いがあります:
- クライアント側では、テーブル作成とデータ挿入時に割り当てられたポートでClickHouseを起動する必要があります。
- サーバー側では、割り当てられたポートのある特定のxml設定ファイルでClickHouseを起動する必要があります。マルチインスタンス用にカスタマイズされたすべてのxml設定ファイルは、./server_configに提供されています。

ここでは、各ソケットに60コアがあると仮定し、2インスタンスの例を取ります。
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

[第2インスタンスのサーバーを起動]

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

第2インスタンスのためのテーブル作成とデータ挿入

テーブル作成:

``` bash
$ [CLICKHOUSE_EXE] client -m --port=9001
```

データ挿入:

``` bash
$ [CLICKHOUSE_EXE] client --query "INSERT INTO [TBL_FILE_NAME] FORMAT CSV" < [TBL_FILE_NAME].tbl  --port=9001
```

- [TBL_FILE_NAME] は、`./benchmark_sample/rawdata_dir/ssb-dbgen` の下にある正規表現: *.tblで名付けられたファイルの名前を表します。
- `--port=9001` は、第2インスタンスのサーバーポートを指し、config_lz4_s2.xml/config_zstd_s2.xml/config_deflate_s2.xmlで定義されています。さらに多くのインスタンスの場合は、9002/9003という値に置き換える必要があります。これらはそれぞれs3/s4インスタンスを指します。割り当てを行わない場合、ポートはデフォルトで9000になっており、最初のインスタンスに使用されています。

2インスタンスでのベンチマーク

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

IAA deflate:

``` bash
$ cd ./database_dir/deflate
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ cd ./database_dir/deflate_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_deflate_s2.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2 > deflate_2insts.log
```

ここで、client_stressing_test.pyの最後の引数 `2` はインスタンスの数を意味します。さらに多くのインスタンスの場合は、3や4に置き換える必要があります。このスクリプトは最大で4インスタンスをサポートします。

現在、3つのログが期待通りに出力されるべきです:

``` text
lz4_2insts.log
deflate_2insts.log
zstd_2insts.log
```
パフォーマンスメトリックスを確認する方法:

QPSに焦点を当て、キーワード: `QPS_Final` を検索し、統計情報を収集してください。

4インスタンスのベンチマーク設定は、上記の2インスタンスと同様です。
最終報告のためのレビュー用に、2インスタンスのベンチマークデータを使用することを推奨します。

## ヒント {#tips}

新しいClickhouseサーバーを起動する前に、バックグラウンドで実行中のClickhouseプロセスがないことを確認してください。古いプロセスを確認して終了してください:

``` bash
$ ps -aux| grep clickhouse
$ kill -9 [PID]
```
./client_scripts/queries_ssb.sql内のクエリリストと公式の [Star Schema Benchmark](/getting-started/example-datasets/star-schema) を比較すると、Q1.2/Q1.3/Q3.4の3つのクエリが含まれていないことがわかります。これは、これらのクエリのCPU利用率%が非常に低く\<10%であるため、パフォーマンスの違いを示すことができないことを意味します。
