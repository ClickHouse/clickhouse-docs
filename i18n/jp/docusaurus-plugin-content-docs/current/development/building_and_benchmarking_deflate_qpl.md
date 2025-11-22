---
description: 'DEFLATE_QPL コーデックを使用して ClickHouse をビルドし、ベンチマークを実行する方法'
sidebar_label: 'DEFLATE_QPL のビルドとベンチマーク'
sidebar_position: 73
slug: /development/building_and_benchmarking_deflate_qpl
title: 'DEFLATE_QPL を有効にして ClickHouse をビルドする'
doc_type: 'guide'
---



# DEFLATE_QPL を使用して ClickHouse をビルドする

- ホストマシンが QPL で要求されている[前提条件](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#prerequisites)を満たしていることを確認してください
- deflate_qpl は CMake ビルド時にデフォルトで有効化されています。誤って変更してしまった場合は、ビルドフラグ `ENABLE_QPL=1` を再度確認してください

- 一般的なビルド要件については、ClickHouse の汎用[ビルド手順](/development/build.md)を参照してください



# DEFLATE_QPL を使ったベンチマークの実行



## ファイル一覧 {#files-list}

[qpl-cmake](https://github.com/ClickHouse/ClickHouse/tree/master/contrib/qpl-cmake) 配下の `benchmark_sample` フォルダには、Pythonスクリプトを使用したベンチマーク実行例が含まれています。

`client_scripts` には、典型的なベンチマークを実行するためのPythonスクリプトが含まれています。例:

- `client_stressing_test.py`: [1~4]個のサーバーインスタンスを使用したクエリストレステスト用のPythonスクリプト
- `queries_ssb.sql`: [Star Schema Benchmark](/getting-started/example-datasets/star-schema/)の全クエリを記載したファイル
- `allin1_ssb.sh`: ベンチマークワークフロー全体を自動的に一括実行するシェルスクリプト

`database_files` は、lz4/deflate/zstdコーデックに応じたデータベースファイルの格納場所を示します。


## スタースキーマのベンチマークを自動実行する: {#run-benchmark-automatically-for-star-schema}

```bash
$ cd ./benchmark_sample/client_scripts
$ sh run_ssb.sh
```

完了後、このフォルダ内のすべての結果を確認してください: `./output/`

失敗した場合は、以下のセクションに従って手動でベンチマークを実行してください。


## 定義 {#definition}

[CLICKHOUSE_EXE]はClickHouse実行ファイルのパスを示します。


## 環境 {#environment}

- CPU: Sapphire Rapid
- OS要件は[QPLのシステム要件](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#system-requirements)を参照してください
- IAAセットアップは[アクセラレータ設定](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration)を参照してください
- Pythonモジュールをインストールします:

```bash
pip3 install clickhouse_driver numpy
```

[IAAのセルフチェック]

```bash
$ accel-config list | grep -P 'iax|state'
```

期待される出力例:

```bash
    "dev":"iax1",
    "state":"enabled",
            "state":"enabled",
```

何も出力されない場合、IAAが動作可能な状態ではありません。IAAセットアップを再度確認してください。


## 生データの生成 {#generate-raw-data}

```bash
$ cd ./benchmark_sample
$ mkdir rawdata_dir && cd rawdata_dir
```

[`dbgen`](/getting-started/example-datasets/star-schema)を使用して、以下のパラメータで1億行のデータを生成します:
-s 20

`*.tbl`形式のファイルが`./benchmark_sample/rawdata_dir/ssb-dbgen`配下に出力されます:


## データベースのセットアップ {#database-setup}

LZ4コーデックを使用したデータベースのセットアップ

```bash
$ cd ./database_dir/lz4
$ [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

コンソールに`Connected to ClickHouse server`というメッセージが表示されます。これは、クライアントがサーバーへの接続を正常に確立したことを意味します。

[Star Schema Benchmark](/getting-started/example-datasets/star-schema)に記載されている以下の3つの手順を完了してください。

- ClickHouseでのテーブル作成
- データの挿入。ここでは`./benchmark_sample/rawdata_dir/ssb-dbgen/*.tbl`を入力データとして使用します。
- 「スタースキーマ」から非正規化された「フラットスキーマ」への変換

IAA Deflateコーデックを使用したデータベースのセットアップ

```bash
$ cd ./database_dir/deflate
$ [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

上記のlz4と同じ3つの手順を完了してください。

ZSTDコーデックを使用したデータベースのセットアップ

```bash
$ cd ./database_dir/zstd
$ [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

上記のlz4と同じ3つの手順を完了してください。

[セルフチェック]
各コーデック(lz4/zstd/deflate)について、以下のクエリを実行してデータベースが正常に作成されたことを確認してください。

```sql
SELECT count() FROM lineorder_flat
```

以下の出力が表示されます。

```sql
┌───count()─┐
│ 119994608 │
└───────────┘
```

[IAA Deflateコーデックのセルフチェック]

クライアントから初めて挿入またはクエリを実行すると、ClickHouseサーバーコンソールに以下のログが出力されます。

```text
Hardware-assisted DeflateQpl codec is ready!
```

このログが表示されず、代わりに以下のようなログが表示される場合:

```text
Initialization of hardware-assisted DeflateQpl codec failed
```

これは、IAAデバイスの準備ができていないことを意味します。IAAのセットアップを再度確認してください。


## 単一インスタンスでのベンチマーク {#benchmark-with-single-instance}

- ベンチマークを開始する前に、C6を無効化し、CPU周波数ガバナーを`performance`に設定してください

```bash
$ cpupower idle-set -d 3
$ cpupower frequency-set -g performance
```

- ソケット間のメモリバウンドの影響を排除するため、`numactl`を使用してサーバーを1つのソケットに、クライアントを別のソケットにバインドします。
- 単一インスタンスとは、1つのサーバーと1つのクライアントが接続された状態を意味します

次に、LZ4/Deflate/ZSTDのそれぞれについてベンチマークを実行します:

LZ4:

```bash
$ cd ./database_dir/lz4
$ numactl -m 0 -N 0 [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 1 > lz4.log
```

IAA deflate:

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

これで、以下の3つのログが期待通りに出力されます:

```text
lz4.log
deflate.log
zstd.log
```

パフォーマンスメトリクスの確認方法:

QPSに注目します。キーワード`QPS_Final`を検索して統計情報を収集してください


## マルチインスタンスでのベンチマーク {#benchmark-with-multi-instances}

- 過剰なスレッド数によるメモリ制約の影響を軽減するため、マルチインスタンスでのベンチマーク実行を推奨します。
- マルチインスタンスとは、それぞれのクライアントに接続された複数(2または4)のサーバーを意味します。
- 1つのソケットのコアを均等に分割し、各サーバーに割り当てる必要があります。
- マルチインスタンスの場合、各コーデックに対して新しいフォルダを作成し、シングルインスタンスと同様の手順でデータセットを挿入する必要があります。

2つの相違点があります:

- クライアント側では、テーブル作成とデータ挿入時に割り当てられたポートでClickHouseを起動する必要があります。
- サーバー側では、ポートが割り当てられた特定のXML設定ファイルでClickHouseを起動する必要があります。マルチインスタンス用のカスタマイズされたXML設定ファイルはすべて./server_config配下に提供されています。

ここでは、ソケットあたり60コアを想定し、2インスタンスを例として説明します。
最初のインスタンスのサーバーを起動
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

2番目のインスタンスのテーブル作成とデータ挿入

テーブルの作成:

```bash
$ [CLICKHOUSE_EXE] client -m --port=9001
```

データの挿入:

```bash
$ [CLICKHOUSE_EXE] client --query "INSERT INTO [TBL_FILE_NAME] FORMAT CSV" < [TBL_FILE_NAME].tbl  --port=9001
```

- [TBL_FILE_NAME]は、`./benchmark_sample/rawdata_dir/ssb-dbgen`配下の正規表現\*.tblに一致するファイル名を表します。
- `--port=9001`は、config_lz4_s2.xml/config_zstd_s2.xml/config_deflate_s2.xmlでも定義されているサーバーインスタンスの割り当てポートを表します。さらに多くのインスタンスを使用する場合は、それぞれs3/s4インスタンスを表す9002/9003の値に置き換える必要があります。指定しない場合、デフォルトでポート9000が使用されますが、これは最初のインスタンスで既に使用されています。

2インスタンスでのベンチマーク実行

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

IAA Deflate

```bash
$ cd ./database_dir/deflate
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ cd ./database_dir/deflate_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_deflate_s2.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2 > deflate_2insts.log
```

ここで、client&#95;stressing&#95;test.py の最後の引数 `2` はインスタンス数を表します。インスタンス数を増やすには、この値を 3 または 4 に変更する必要があります。このスクリプトは最大 4 インスタンスまでサポートします。

これで、期待どおりに 3 つのログが出力されるはずです。

```text
lz4_2insts.log
deflate_2insts.log
zstd_2insts.log
```

パフォーマンスメトリクスの確認方法:

本ドキュメントでは QPS に注目します。キーワード `QPS_Final` を検索し、統計情報を収集してください。

4 インスタンス構成でのベンチマーク環境のセットアップは、上記の 2 インスタンス構成の場合と同様です。
最終的なレビュー用レポートとしては、2 インスタンスでのベンチマークデータを使用することを推奨します。


## ヒント {#tips}

新しいClickHouseサーバーを起動する前に、必ずバックグラウンドでClickHouseプロセスが実行されていないことを確認してください。古いプロセスを確認して終了させてください：

```bash
$ ps -aux| grep clickhouse
$ kill -9 [PID]
```

./client_scripts/queries_ssb.sql内のクエリリストを公式の[Star Schema Benchmark](/getting-started/example-datasets/star-schema)と比較すると、3つのクエリが含まれていないことがわかります：Q1.2/Q1.3/Q3.4。これは、これらのクエリのCPU使用率が10%未満と非常に低く、パフォーマンスの差異を実証できないためです。
