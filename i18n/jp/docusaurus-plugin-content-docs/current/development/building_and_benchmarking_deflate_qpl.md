description: 'DEFLATE_QPL コーデックを使用して Clickhouse をビルドし、ベンチマークを実行する方法'
sidebar_label: 'DEFLATE_QPL のビルドとベンチマーク'
sidebar_position: 73
slug: /development/building_and_benchmarking_deflate_qpl
title: 'DEFLATE_QPL で Clickhouse をビルド'
---


# DEFLATE_QPL で Clickhouse をビルド

- ホストマシンが QPL の必要な [前提条件](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#prerequisites)を満たしていることを確認してください。
- deflate_qpl は cmake ビルド中にデフォルトで有効になっています。誤って変更した場合は、ビルドフラグを再確認してください： ENABLE_QPL=1

- 一般的な要件については、Clickhouse の一般的な [ビルド手順](/development/build.md) を参照してください。


# DEFLATE_QPL でベンチマークを実行する

## ファイルリスト {#files-list}

フォルダ `benchmark_sample` の下にある [qpl-cmake](https://github.com/ClickHouse/ClickHouse/tree/master/contrib/qpl-cmake) は、Python スクリプトを使用してベンチマークを実行する例を示しています：

`client_scripts` には、一般的なベンチマークを実行するための Python スクリプトが含まれています。例えば：
- `client_stressing_test.py`： [1～4] サーバーインスタンスでのクエリ stress テストのための Python スクリプト。
- `queries_ssb.sql`： [Star Schema Benchmark](/getting-started/example-datasets/star-schema/) のすべてのクエリをリストするファイル。
- `allin1_ssb.sh`：このシェルスクリプトは、ベンチマークワークフローを自動的に1つにまとめて実行します。

`database_files` というのは、lz4/deflate/zstd コーデックに従ってデータベースファイルを保存することを意味します。

## Star Schema のために自動的にベンチマークを実行する: {#run-benchmark-automatically-for-star-schema}

```bash
$ cd ./benchmark_sample/client_scripts
$ sh run_ssb.sh
```

完了後は、このフォルダ `./output/` で結果を確認してください。

失敗した場合は、以下のセクションに従って手動でベンチマークを実行してください。

## 定義 {#definition}

[CLICKHOUSE_EXE] は、ClickHouse 実行可能プログラムのパスを意味します。

## 環境 {#environment}

- CPU: Sapphire Rapid
- OS 要件は [QPL のシステム要件](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#system-requirements) を参照してください。
- IAA セットアップは [アクセラレータ構成](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration) を参照してください。
- Python モジュールをインストールします：

```bash
pip3 install clickhouse_driver numpy
```

[IAA 自己チェック]

```bash
$ accel-config list | grep -P 'iax|state'
```

期待される出力は次のようになります：
```bash
    "dev":"iax1",
    "state":"enabled",
            "state":"enabled",
```

出力が何も表示されない場合、IAA は動作する準備が整っていません。IAA セットアップを再確認してください。

## 生データを生成する {#generate-raw-data}

```bash
$ cd ./benchmark_sample
$ mkdir rawdata_dir && cd rawdata_dir
```

[`dbgen`](/getting-started/example-datasets/star-schema) を使用して 1 億行のデータを生成します 。
パラメータ： -s 20

`*.tbl` のようなファイルが `./benchmark_sample/rawdata_dir/ssb-dbgen` の下に出力されることが期待されます：

## データベースの設定 {#database-setup}

LZ4 コーデックを使用してデータベースを設定します。

```bash
$ cd ./database_dir/lz4
$ [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

ここで、コンソールから 'Connected to ClickHouse server' のメッセージが表示されるはずです。これは、クライアントがサーバーとの接続を正常に設定したことを意味します。

[Star Schema Benchmark](/getting-started/example-datasets/star-schema) に記載されている以下の 3 つのステップを完了します。
- ClickHouse でのテーブルの作成
- データの挿入。ここでは `./benchmark_sample/rawdata_dir/ssb-dbgen/*.tbl` を入力データとして使用する必要があります。
- "star schema" を非正規化された "flat schema" に変換

IAA Deflate コーデックを使用してデータベースを設定します。

```bash
$ cd ./database_dir/deflate
$ [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

上記の lz4 と同様に、3 つのステップを完了します。

ZSTD コーデックを使用してデータベースを設定します。

```bash
$ cd ./database_dir/zstd
$ [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

上記の lz4 と同様に、3 つのステップを完了します。

[自己チェック]
各コーデック（lz4/zstd/deflate）について、以下のクエリを実行してデータベースが正常に作成されていることを確認してください：
```sql
select count() from lineorder_flat
```
次の出力を見ることが期待されます：
```sql
┌───count()─┐
│ 119994608 │
└───────────┘
```
[IAA Deflate コーデックの自己チェック]

クライアントからの挿入またはクエリを初めて実行すると、ClickHouse サーバーコンソールは次のログを出力することが期待されます：
```text
Hardware-assisted DeflateQpl codec is ready!
```
これが見つからず、次のログが表示された場合は：
```text
Initialization of hardware-assisted DeflateQpl codec failed
```
それは、IAA デバイスが準備できていないことを意味します。IAA セットアップを再確認する必要があります。

## 単一インスタンスでのベンチマーク {#benchmark-with-single-instance}

- ベンチマークを開始する前に、C6 を無効にし、CPU 周波数ガバナーを `performance` に設定してください。

```bash
$ cpupower idle-set -d 3
$ cpupower frequency-set -g performance
```

- メモリのバウンドの影響を排除するために、`numactl` を使用してサーバーを1つのソケットに、クライアントを別のソケットにバインドします。
- 単一インスタンスとは、単一のサーバーが単一のクライアントに接続することを意味します。

LZ4/Deflate/ZSTD のそれぞれについて、ベンチマークを実行します。

LZ4：

```bash
$ cd ./database_dir/lz4 
$ numactl -m 0 -N 0 [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 1 > lz4.log
```

IAA Deflate：

```bash
$ cd ./database_dir/deflate
$ numactl -m 0 -N 0 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 1 > deflate.log
```

ZSTD：

```bash
$ cd ./database_dir/zstd
$ numactl -m 0 -N 0 [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 1 > zstd.log
```

これにより、次のように期待される 3 つのログが出力されるはずです：
```text
lz4.log
deflate.log
zstd.log
```

パフォーマンスメトリックを確認する方法：

QPS に焦点を当て、キーワード `QPS_Final` を検索して統計を収集します。

## 複数インスタンスでのベンチマーク {#benchmark-with-multi-instances}

- 多くのスレッドによるメモリバウンドの影響を低減するため、複数のインスタンスでベンチマークを実行することをお勧めします。
- マルチインスタンスとは、複数（2 または 4）のサーバーがそれぞれのクライアントに接続することを意味します。
- 1つのソケットのコアは均等に分割し、サーバーにそれぞれ割り当てる必要があります。
- マルチインスタンスの場合、各コーデック用に新しいフォルダを作成し、単一インスタンスと同様の手順に従ってデータセットを挿入する必要があります。

2 つの違いがあります：
- クライアント側では、テーブルの作成やデータ挿入時に指定されたポートで ClickHouse を実行する必要があります。
- サーバー側では、ポートが割り当てられた特定の XML 設定ファイルで ClickHouse を実行する必要があります。マルチインスタンス用にカスタマイズされた XML 設定ファイルは、すべて ./server_config に提供されています。

ここでは、ソケットあたり 60 コアがあり、例として 2 インスタンスを取り上げます。
最初のインスタンスのサーバーを起動します。
LZ4：

```bash
$ cd ./database_dir/lz4
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
```

ZSTD：

```bash
$ cd ./database_dir/zstd
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
```

IAA Deflate：

```bash
$ cd ./database_dir/deflate
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
```

[2 番目のインスタンスのサーバーを起動]

LZ4：

```bash
$ cd ./database_dir && mkdir lz4_s2 && cd lz4_s2
$ cp ../../server_config/config_lz4_s2.xml ./
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_lz4_s2.xml >&/dev/null&
```

ZSTD：

```bash
$ cd ./database_dir && mkdir zstd_s2 && cd zstd_s2
$ cp ../../server_config/config_zstd_s2.xml ./
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_zstd_s2.xml >&/dev/null&
```

IAA Deflate：

```bash
$ cd ./database_dir && mkdir deflate_s2 && cd deflate_s2
$ cp ../../server_config/config_deflate_s2.xml ./
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_deflate_s2.xml >&/dev/null&
```

2 番目のインスタンスのためのテーブルを作成し、データを挿入します。

テーブルの作成：

```bash
$ [CLICKHOUSE_EXE] client -m --port=9001 
```

データの挿入：

```bash
$ [CLICKHOUSE_EXE] client --query "INSERT INTO [TBL_FILE_NAME] FORMAT CSV" < [TBL_FILE_NAME].tbl  --port=9001
```

- [TBL_FILE_NAME] は `./benchmark_sample/rawdata_dir/ssb-dbgen` の下にある正規表現 *.tbl に名前付けされたファイルの名前を表します。
- `--port=9001` は、config_lz4_s2.xml/config_zstd_s2.xml/config_deflate_s2.xml で定義されているサーバーインスタンスに割り当てられたポートを指します。さらに多くのインスタンスがある場合は、それぞれ 9002/9003 に置き換える必要があります。これが s3/s4 インスタンスを表します。割り当てがない場合、ポートはデフォルトで 9000 であり、最初のインスタンスで使用されます。

2 インスタンスでのベンチマーク

LZ4：

```bash
$ cd ./database_dir/lz4
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ cd ./database_dir/lz4_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_lz4_s2.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2  > lz4_2insts.log
```

ZSTD：

```bash
$ cd ./database_dir/zstd
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ cd ./database_dir/zstd_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_zstd_s2.xml >&/dev/null& 
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2 > zstd_2insts.log
```

IAA Deflate：

```bash
$ cd ./database_dir/deflate
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ cd ./database_dir/deflate_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_deflate_s2.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2 > deflate_2insts.log
```

ここで、クライアントの `client_stressing_test.py` の最後の引数： `2` はインスタンスの数を示します。さらなるインスタンスについては、3 または 4 の値に置き換える必要があります。このスクリプトは最大 4 インスタンスをサポートします。

以上で、期待通りの 3 つのログが出力されるはずです：

```text
lz4_2insts.log
deflate_2insts.log
zstd_2insts.log
```
パフォーマンスメトリックを確認する方法：

QPS に焦点を当て、キーワード `QPS_Final` を検索して統計を収集します。

4 インスタンスのベンチマーク設定は、上記の 2 インスタンスと似ています。
最終レポートに対するレビューには、2 インスタンスのベンチマークデータを使用することをお勧めします。

## ヒント {#tips}

新しい ClickHouse サーバーを起動する前に、必ずバックグラウンドで実行中の ClickHouse プロセスがないことを確認し、古いプロセスを確認して終了してください：

```bash
$ ps -aux| grep clickhouse
$ kill -9 [PID]
```
`./client_scripts/queries_ssb.sql` のクエリリストを公式の [Star Schema Benchmark](/getting-started/example-datasets/star-schema) と比較すると、3 つのクエリ Q1.2/Q1.3/Q3.4 が含まれていないことがわかります。これは、これらのクエリの CPU 使用率 % が非常に低く < 10% であり、パフォーマンス差を示すことができないことを意味します。
