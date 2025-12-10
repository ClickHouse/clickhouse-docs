---
description: 'DEFLATE_QPL Codec を用いて ClickHouse をビルドし、ベンチマークを実行する方法'
sidebar_label: 'DEFLATE_QPL のビルドとベンチマーク'
sidebar_position: 73
slug: /development/building_and_benchmarking_deflate_qpl
title: 'DEFLATE_QPL を使用して ClickHouse をビルドする'
doc_type: 'guide'
---

# DEFLATE_QPL を使用して ClickHouse をビルドする {#build-clickhouse-with-deflate_qpl}

- ホストマシンが QPL の要求する[前提条件](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#prerequisites)を満たしていることを確認してください
- `cmake` ビルド時には `deflate_qpl` はデフォルトで有効になっています。誤って設定を変更してしまった場合は、ビルドフラグ `ENABLE_QPL=1` になっていることを必ず再確認してください

- 一般的な要件については、ClickHouse の一般的な[ビルド手順](/development/build.md)を参照してください

# DEFLATE_QPL を使ってベンチマークを実行する {#run-benchmark-with-deflate_qpl}

## ファイル一覧 {#files-list}

[qpl-cmake](https://github.com/ClickHouse/ClickHouse/tree/master/contrib/qpl-cmake) 配下の `benchmark_sample` フォルダには、Python スクリプトを用いてベンチマークを実行するためのサンプルが含まれています。

`client_scripts` には、代表的なベンチマークを実行するための Python スクリプトが含まれています。例えば:
- `client_stressing_test.py`: 1〜4 台のサーバーインスタンスに対してクエリのストレステストを行う Python スクリプト。
- `queries_ssb.sql`: [Star Schema Benchmark](/getting-started/example-datasets/star-schema/) の全クエリを列挙したファイル。
- `allin1_ssb.sh`: ベンチマークのワークフローを自動で一括実行するシェルスクリプト。

`database_files` には、lz4/deflate/zstd コーデックごとにデータベースファイルが保存されます。

## スター・スキーマ向けベンチマークを自動実行する: {#run-benchmark-automatically-for-star-schema}

```bash
$ cd ./benchmark_sample/client_scripts
$ sh run_ssb.sh
```

処理が完了したら、`./output/` フォルダ内のすべての結果を確認してください。

失敗した場合は、以下のセクションに従ってベンチマークを手動で実行してください。

## 定義 {#definition}

[CLICKHOUSE_EXE] は ClickHouse の実行可能ファイルへのパスを表します。

## 環境 {#environment}

* CPU: Sapphire Rapid
* OS 要件については [System Requirements for QPL](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#system-requirements) を参照してください
* IAA のセットアップについては [Accelerator Configuration](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration) を参照してください
* Python モジュールをインストールします:

```bash
pip3 install clickhouse_driver numpy
```

[IAA の自己チェック]

```bash
$ accel-config list | grep -P 'iax|state'
```

期待される出力は次のとおりです：

```bash
    "dev":"iax1",
    "state":"有効",
            "state":"有効",
```

何も出力されない場合は、IAA の準備がまだ整っていないことを意味します。IAA のセットアップを再度確認してください。

## 未加工データを生成する {#generate-raw-data}

```bash
$ cd ./benchmark_sample
$ mkdir rawdata_dir && cd rawdata_dir
```

[`dbgen`](/getting-started/example-datasets/star-schema) を使用し、次のパラメータで 1 億行のデータを生成します:
-s 20

`*.tbl` のようなファイルは、`./benchmark_sample/rawdata_dir/ssb-dbgen` 配下に出力されます:

## データベースのセットアップ {#database-setup}

LZ4 コーデックを使用したデータベースのセットアップ

```bash
$ cd ./database_dir/lz4
$ [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

コンソールに `Connected to ClickHouse server` というメッセージが表示されていれば、クライアントがサーバーへの接続を正常に確立できたことを意味します。

[Star Schema Benchmark](/getting-started/example-datasets/star-schema) で説明されている以下の 3 ステップを完了します。

* ClickHouse にテーブルを作成します
* データを挿入します。ここでは入力データとして `./benchmark_sample/rawdata_dir/ssb-dbgen/*.tbl` を使用します。
* &quot;star schema&quot; を非正規化した &quot;flat schema&quot; に変換します

IAA Deflate コーデックを使用してデータベースをセットアップします。

```bash
$ cd ./database_dir/deflate
$ [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

上記の lz4 と同様に 3 つの手順を完了します

ZSTD コーデックを使用してデータベースをセットアップします

```bash
$ cd ./database_dir/zstd
$ [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

上記の lz4 と同様に、同じ 3 つの手順を実行してください

[self-check]
各コーデック（lz4/zstd/deflate）について、データベースが正しく作成されていることを確認するために、次のクエリを実行してください:

```sql
SELECT count() FROM lineorder_flat
```

想定される出力は次のとおりです：

```sql
┌───count()─┐
│ 119994608 │
└───────────┘
```

[IAA Deflate コーデックのセルフチェック]

クライアントから初めて挿入やクエリを実行した際に、ClickHouse サーバーのコンソールには次のログが出力されるはずです:

```text
ハードウェアアクセラレーション対応DeflateQplコーデックが利用可能になりました！
```

もしこれが一度も出力されず、代わりに次のような別のログが表示される場合:

```text
ハードウェアアクセラレーション対応DeflateQplコーデックの初期化に失敗しました
```

これは IAA デバイスが使用可能な状態になっていないことを意味します。IAA のセットアップをもう一度確認する必要があります。

## 単一インスタンスでのベンチマーク {#benchmark-with-single-instance}

* ベンチマークを開始する前に、C6 を無効化し、CPU周波数ガバナーを `performance` に設定してください

```bash
$ cpupower idle-set -d 3
$ cpupower frequency-set -g performance
```

* ソケットをまたぐメモリアクセスによるボトルネックの影響を排除するため、`numactl` を使用してサーバーを一方のソケットに、クライアントをもう一方のソケットにバインドします。
* シングルインスタンスとは、1つのサーバーが1つのクライアントに接続されている構成を意味します。

次に、LZ4/Deflate/ZSTD のベンチマークをそれぞれ実行します：

LZ4:

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

ZSTD:

```bash
$ cd ./database_dir/zstd
$ numactl -m 0 -N 0 [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 1 > zstd.log
```

これで、想定どおり 3 件のログが出力されるはずです。

```text
lz4.log
deflate.log
zstd.log
```

パフォーマンスメトリクスの確認方法：

QPS を中心に確認します。キーワード `QPS_Final` を検索し、統計情報を収集してください

## マルチインスタンスでのベンチマーク {#benchmark-with-multi-instances}

* メモリボトルネックがスレッド数の増加に与える影響を抑えるため、マルチインスタンス構成でベンチマークを実行することを推奨します。
* マルチインスタンスとは、複数（2 または 4）台のサーバーがそれぞれ個別のクライアントに接続されている構成を指します。
* 1 ソケット内のコアは均等に分割し、各サーバーにそれぞれ割り当てる必要があります。
* マルチインスタンスの場合、各 codec 用に新しいディレクトリを作成し、シングルインスタンスと同様の手順でデータセットを挿入する必要があります。

主な違いは 2 つあります:

* クライアント側では、テーブル作成およびデータ挿入時に、割り当てられたポートで ClickHouse を起動する必要があります。
* サーバー側では、ポートが割り当てられた特定の XML 設定ファイルを指定して ClickHouse を起動する必要があります。マルチインスタンス用のすべてのカスタマイズ済み XML 設定ファイルは、./server&#95;config 配下に用意されています。

ここでは、1 ソケットあたり 60 コアあり、2 インスタンスを起動する例を示します。
最初のインスタンス用のサーバーを起動します
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

[2つ目のインスタンス用サーバーを起動する]

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

IAA Deflate：

```bash
$ cd ./database_dir && mkdir deflate_s2 && cd deflate_s2
$ cp ../../server_config/config_deflate_s2.xml ./
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_deflate_s2.xml >&/dev/null&
```

第2インスタンス向けテーブルの作成とデータ挿入

テーブルの作成：

```bash
$ [CLICKHOUSE_EXE] client -m --port=9001 
```

データの挿入：

```bash
$ [CLICKHOUSE_EXE] client --query "INSERT INTO [TBL_FILE_NAME] FORMAT CSV" < [TBL_FILE_NAME].tbl  --port=9001
```

* [TBL&#95;FILE&#95;NAME] は、`./benchmark_sample/rawdata_dir/ssb-dbgen` 配下にあり、正規表現 *. tbl にマッチするファイルの名前を表します。
* `--port=9001` はサーバーインスタンスに割り当てられたポートを表し、config&#95;lz4&#95;s2.xml/config&#95;zstd&#95;s2.xml/config&#95;deflate&#95;s2.xml でも定義されています。さらに多くのインスタンスを起動する場合は、s3/s4 インスタンスをそれぞれ表す 9002/9003 に置き換える必要があります。指定しない場合、デフォルトのポートは 9000 で、これは最初のインスタンスで使用されています。

2 インスタンスでのベンチマーク

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

IAA deflate

```bash
$ cd ./database_dir/deflate
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ cd ./database_dir/deflate_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_deflate_s2.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2 > deflate_2insts.log
```

ここで、client&#95;stressing&#95;test.py の最後の引数 `2` はインスタンス数を表します。インスタンス数を増やす場合は、この値を 3 または 4 に変更してください。このスクリプトは最大 4 インスタンスまでサポートします。

これで、期待どおり 3 件のログが出力されるはずです。

```text
lz4_2insts.log
deflate_2insts.log
zstd_2insts.log
```

パフォーマンスメトリクスの確認方法：

ここでは QPS に注目します。キーワード `QPS_Final` を検索し、統計情報を収集してください。

4 インスタンス構成でのベンチマーク環境は、上記の 2 インスタンス構成の場合と同様です。
レビュー用の最終レポートには、2 インスタンス構成のベンチマークデータを採用することを推奨します。

## ヒント {#tips}

新しい ClickHouse サーバーを起動する前には毎回、バックグラウンドで動作している ClickHouse プロセスがないことを必ず確認し、残っている古いプロセスがあれば終了させてください。

```bash
$ ps -aux| grep clickhouse
$ kill -9 [PID]
```

./client&#95;scripts/queries&#95;ssb.sql 内のクエリ一覧を公式の [Star Schema Benchmark](/getting-started/example-datasets/star-schema) と比較すると、Q1.2 / Q1.3 / Q3.4 の 3 つのクエリが含まれていないことが確認できます。これは、これらのクエリでは CPU 使用率が 10% 未満と非常に低く、性能差を示すことができないためです。
