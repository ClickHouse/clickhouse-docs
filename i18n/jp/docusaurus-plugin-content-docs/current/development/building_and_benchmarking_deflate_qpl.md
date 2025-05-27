---
'description': 'How to build Clickhouse and run benchmark with DEFLATE_QPL Codec'
'sidebar_label': 'Building and Benchmarking DEFLATE_QPL'
'sidebar_position': 73
'slug': '/development/building_and_benchmarking_deflate_qpl'
'title': 'Build Clickhouse with DEFLATE_QPL'
---




# DEFLATE_QPLを使ってClickhouseをビルドする

- ホストマシンがQPLの必要な[前提条件](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#prerequisites)を満たしていることを確認してください。
- deflate_qplはcmakeビルド中にデフォルトで有効です。もし、誤って変更した場合は、ビルドフラグを再確認してください: ENABLE_QPL=1

- 一般的な要件については、Clickhouseの一般的な[ビルド手順](/development/build.md)を参照してください。


# DEFLATE_QPLを使ったベンチマークの実行

## ファイルリスト {#files-list}

フォルダ `benchmark_sample` は、[qpl-cmake](https://github.com/ClickHouse/ClickHouse/tree/master/contrib/qpl-cmake) 内にあり、Pythonスクリプトを使ってベンチマークを実行する方法の例を提供します：

`client_scripts` には典型的なベンチマークを実行するためのPythonスクリプトが含まれています。例えば：
- `client_stressing_test.py`: [1~4]のサーバーインスタンスを使ったクエリストレステスト用のPythonスクリプトです。
- `queries_ssb.sql`: [Star Schema Benchmark](/getting-started/example-datasets/star-schema/) のすべてのクエリをリストしたファイルです。
- `allin1_ssb.sh`: このシェルスクリプトは、ベンチマークのワークフローをすべて自動的に実行します。

`database_files` は、lz4/deflate/zstd コーデックに従ってデータベースファイルを保存することを意味します。

## Star Schemaの自動ベンチマーク実行: {#run-benchmark-automatically-for-star-schema}

```bash
$ cd ./benchmark_sample/client_scripts
$ sh run_ssb.sh
```

完了後、すべての結果はこのフォルダ:`./output/`に保存されます。

失敗した場合は、以下のセクションに従って手動でベンチマークを実行してください。

## 定義 {#definition}

[CLICKHOUSE_EXE] は、ClickHouse実行可能プログラムのパスを意味します。

## 環境 {#environment}

- CPU: Sapphire Rapid
- OS要件は[QPLのシステム要件](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#system-requirements)を参照してください。
- IAAセットアップは[アクセラレータの設定](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration)を参照してください。
- Pythonモジュールのインストール:

```bash
pip3 install clickhouse_driver numpy
```

[IAAの自己チェック]

```bash
$ accel-config list | grep -P 'iax|state'
```

期待される出力は次のようになります：
```bash
    "dev":"iax1",
    "state":"enabled",
            "state":"enabled",
```

何も出力されない場合は、IAAが作動する準備ができていないことを意味します。再度IAA設定を確認してください。

## 生データの生成 {#generate-raw-data}

```bash
$ cd ./benchmark_sample
$ mkdir rawdata_dir && cd rawdata_dir
```

[`dbgen`](/getting-started/example-datasets/star-schema)を使用して、パラメータ-s 20で1億行のデータを生成します。

`*.tbl`のようなファイルは、`./benchmark_sample/rawdata_dir/ssb-dbgen`の下に出力されることが期待されます。

## データベースのセットアップ {#database-setup}

LZ4 コーデックでデータベースをセットアップします。

```bash
$ cd ./database_dir/lz4
$ [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

ここで、コンソールに `Connected to ClickHouse server` のメッセージが表示されれば、クライアントがサーバーとの接続を正常にセットアップしたことを意味します。

[Star Schema Benchmark](/getting-started/example-datasets/star-schema) に記載されている以下の3つのステップを完了してください。
- ClickHouse内のテーブルの作成
- データの挿入。ここでは、`./benchmark_sample/rawdata_dir/ssb-dbgen/*.tbl`を入力データとして使用する必要があります。
- "star schema"を非正規化された"flat schema"に変換します。

IAA Deflate コーデックでデータベースをセットアップします。

```bash
$ cd ./database_dir/deflate
$ [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

LZ4と同様に、上記の3つのステップを完了してください。

ZSTD コーデックでデータベースをセットアップします。

```bash
$ cd ./database_dir/zstd
$ [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

LZ4と同様に、上記の3つのステップを完了してください。

[自己チェック]
各コーデック(lz4/zstd/deflate)について、以下のクエリを実行してデータベースが正常に作成されたことを確認してください：
```sql
select count() from lineorder_flat
```
期待される出力は以下の通りです：
```sql
┌───count()─┐
│ 119994608 │
└───────────┘
```
[IAA Deflate コーデックの自己チェック]

クライアントから挿入またはクエリを初めて実行すると、ClickHouseサーバーコンソールは次のログを表示することが期待されます：
```text
Hardware-assisted DeflateQpl codec is ready!
```
これが見つからず、次のようなログが表示された場合：
```text
Initialization of hardware-assisted DeflateQpl codec failed
```
それはIAAデバイスが準備ができていないことを意味し、再度IAA設定を確認する必要があります。

## 単一インスタンスでのベンチマーク {#benchmark-with-single-instance}

- ベンチマークを開始する前に、C6を無効にし、CPU周波数のガバナーを `performance` に設定してください。

```bash
$ cpupower idle-set -d 3
$ cpupower frequency-set -g performance
```

- メモリバウンドの影響を排除するために、`numactl`を使用してサーバーを1つのソケットに、クライアントを別のソケットにバインドします。
- 単一インスタンスとは、単一のクライアントに接続された単一のサーバーを意味します。

今、LZ4/Deflate/ZSTDそれぞれのベンチマークを実行します：

LZ4:

```bash
$ cd ./database_dir/lz4 
$ numactl -m 0 -N 0 [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 1 > lz4.log
```

IAA Deflate:

```bash
$ cd ./database_dir/deflate
$ numactl -m 0 -N 0 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 1 > deflate.log
```

ZSTD:

```bash
$ cd ./database_dir/zstd
$ numactl -m 0 -N 0 [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 1 > zstd.log
```

今、3つのログが期待通りに出力されるはずです：
```text
lz4.log
deflate.log
zstd.log
```

性能指標を確認する方法：

私たちはQPSに焦点を当てています。キーワード`QPS_Final`を検索し、統計を収集してください。

## 複数インスタンスでのベンチマーク {#benchmark-with-multi-instances}

- スレッドが多すぎるためにメモリの影響を減らすために、複数インスタンスでベンチマークを実行することをお勧めします。
- 複数インスタンスとは、複数（2または4）のサーバーがそれぞれのクライアントに接続されていることを意味します。
- 1つのソケットのコアは均等に分けられ、サーバーにそれぞれ割り当てられる必要があります。
- 複数インスタンスの場合は、各コーデック用に新しいフォルダを作成し、単一インスタンスでの手順に従ってデータセットを挿入する必要があります。

2つの違いがあります：
- クライアント側では、テーブルの作成とデータの挿入時に割り当てられたポートでClickHouseを起動する必要があります。
- サーバー側では、ポートが割り当てられた特定のxml設定ファイルでClickHouseを起動する必要があります。すべてのカスタマイズされたxml設定ファイルは、./server_configに提供されています。

ここでは、ソケットあたり60コアとし、2インスタンスを例に取ります。
最初のインスタンスのサーバーを起動します。

LZ4:

```bash
$ cd ./database_dir/lz4
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
```

ZSTD:

```bash
$ cd ./database_dir/zstd
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
```

IAA Deflate:

```bash
$ cd ./database_dir/deflate
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
```

[2番目のインスタンスのサーバーを起動]

LZ4:

```bash
$ cd ./database_dir && mkdir lz4_s2 && cd lz4_s2
$ cp ../../server_config/config_lz4_s2.xml ./
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_lz4_s2.xml >&/dev/null&
```

ZSTD:

```bash
$ cd ./database_dir && mkdir zstd_s2 && cd zstd_s2
$ cp ../../server_config/config_zstd_s2.xml ./
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_zstd_s2.xml >&/dev/null&
```

IAA Deflate:

```bash
$ cd ./database_dir && mkdir deflate_s2 && cd deflate_s2
$ cp ../../server_config/config_deflate_s2.xml ./
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_deflate_s2.xml >&/dev/null&
```

2番目のインスタンスのためのテーブルの作成とデータの挿入

テーブルの作成:

```bash
$ [CLICKHOUSE_EXE] client -m --port=9001 
```

データの挿入:

```bash
$ [CLICKHOUSE_EXE] client --query "INSERT INTO [TBL_FILE_NAME] FORMAT CSV" < [TBL_FILE_NAME].tbl  --port=9001
```

- [TBL_FILE_NAME]は、`./benchmark_sample/rawdata_dir/ssb-dbgen`の下にある正規表現：*. tblで命名されたファイルの名前を表します。
- `--port=9001` は、config_lz4_s2.xml/config_zstd_s2.xml/config_deflate_s2.xmlで定義されたサーバーインスタンスのための割り当てられたポートを示します。さらに多くのインスタンスの場合は、9002/9003という値に置き換えなければなりません。これはそれぞれs3/s4インスタンスを意味します。割り当てを行わない場合、ポートはデフォルトで9000となり、最初のインスタンスによって使用されます。

2インスタンスでのベンチマーキング

LZ4:

```bash
$ cd ./database_dir/lz4
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ cd ./database_dir/lz4_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_lz4_s2.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2  > lz4_2insts.log
```

ZSTD:

```bash
$ cd ./database_dir/zstd
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ cd ./database_dir/zstd_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_zstd_s2.xml >&/dev/null& 
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2 > zstd_2insts.log
```

IAA Deflate:

```bash
$ cd ./database_dir/deflate
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ cd ./database_dir/deflate_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_deflate_s2.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2 > deflate_2insts.log
```

ここで、`client_stressing_test.py`の最後の引数：`2`はインスタンスの数を意味します。さらに多くのインスタンスのためには、`3`または`4`という値に置き換える必要があります。このスクリプトは最大4インスタンスをサポートしています。

今、3つのログが期待通りに出力されるはずです：

```text
lz4_2insts.log
deflate_2insts.log
zstd_2insts.log
```
性能指標を確認する方法：

私たちはQPSに焦点を当てています。キーワード`QPS_Final`を検索し、統計を収集してください。

4インスタンスのベンチマークセットアップは、上記の2インスタンスと似ています。
最終報告のレビューには、2インスタンスのベンチマークデータを使用することをお勧めします。

## ヒント {#tips}

新しいClickhouseサーバーを起動する前に、バックグラウンドのClickhouseプロセスが動いていないことを確認してください。古いプロセスを確認し、終了させてください。

```bash
$ ps -aux| grep clickhouse
$ kill -9 [PID]
```
./client_scripts/queries_ssb.sql内のクエリリストを公式の[Star Schema Benchmark](/getting-started/example-datasets/star-schema)と比較すると、Q1.2/Q1.3/Q3.4の3つのクエリが含まれていないことがわかります。これは、これらのクエリのCPU使用率%が非常に低く< 10%であり、性能の違いを示すことができないことを意味します。
