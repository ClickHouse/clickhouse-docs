---
'description': 'DEFLATE_QPL Codecを用いてClickhouseをビルドし、ベンチマークを実行する方法'
'sidebar_label': 'DEFLATE_QPLのビルドとベンチマーク'
'sidebar_position': 73
'slug': '/development/building_and_benchmarking_deflate_qpl'
'title': 'DEFLATE_QPLでClickhouseをビルドする'
'doc_type': 'guide'
---


# Build Clickhouse with DEFLATE_QPL

- QPLの必要な [前提条件](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#prerequisites) を満たしていることを確認してください。
- deflate_qpl は cmake ビルド中にデフォルトで有効になっています。もし誤って変更してしまった場合は、ビルドフラグを再確認してください: ENABLE_QPL=1

- 一般的な要件については、Clickhouseの一般的な [ビルド指示](/development/build.md) を参照してください。


# Run Benchmark with DEFLATE_QPL

## Files list {#files-list}

フォルダ `benchmark_sample` は、[qpl-cmake](https://github.com/ClickHouse/ClickHouse/tree/master/contrib/qpl-cmake) の下にあり、Pythonスクリプトを使ってベンチマークを実行する例を示しています。

`client_scripts` には、典型的なベンチマークを実行するためのPythonスクリプトが含まれています。例えば:
- `client_stressing_test.py`: [1~4] サーバインスタンスでのクエリストレステストのためのPythonスクリプトです。
- `queries_ssb.sql`: [Star Schema Benchmark](/getting-started/example-datasets/star-schema/) のためのすべてのクエリをリストしたファイルです。
- `allin1_ssb.sh`: このシェルスクリプトは、ベンチマークワークフローを自動的にすべて実行します。

`database_files` は、lz4/deflate/zstd コーデックに従ってデータベースファイルを保存することを意味します。

## Run benchmark automatically for Star Schema: {#run-benchmark-automatically-for-star-schema}

```bash
$ cd ./benchmark_sample/client_scripts
$ sh run_ssb.sh
```

完了したら、すべての結果をこのフォルダで確認してください: `./output/`

失敗に遭遇した場合は、以下のセクションのように手動でベンチマークを実行してください。

## Definition {#definition}

[CLICKHOUSE_EXE] は、ClickHouse実行可能プログラムのパスを意味します。

## Environment {#environment}

- CPU: Sapphire Rapid
- OS要件は、[QPLのシステム要件](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#system-requirements)を参照してください。
- IAA設定は、[アクセラレータ設定](https://intel.github.io/qpl/documentation/get_started_docs/installation.html#accelerator-configuration)を参照してください。
- Pythonモジュールをインストールする:

```bash
pip3 install clickhouse_driver numpy
```

[Self-check for IAA]

```bash
$ accel-config list | grep -P 'iax|state'
```

期待される出力は次のようになります:
```bash
"dev":"iax1",
"state":"enabled",
        "state":"enabled",
```

何も出力が見えない場合は、IAAが作業の準備が整っていないことを意味します。IAA設定を再確認してください。

## Generate raw data {#generate-raw-data}

```bash
$ cd ./benchmark_sample
$ mkdir rawdata_dir && cd rawdata_dir
```

[`dbgen`](/getting-started/example-datasets/star-schema) を使用して、以下のパラメータで1億行のデータを生成します:
-s 20

`*.tbl` のようなファイルは、`./benchmark_sample/rawdata_dir/ssb-dbgen` の下に出力されることが期待されます。

## Database setup {#database-setup}

LZ4コーデックでデータベースを設定します。

```bash
$ cd ./database_dir/lz4
$ [CLICKHOUSE_EXE] server -C config_lz4.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```

ここで、コンソールから `Connected to ClickHouse server` というメッセージが表示されることを確認してください。これは、クライアントがサーバーとの接続を正常に設定したことを意味します。

[Star Schema Benchmark](/getting-started/example-datasets/star-schema) に記載されている下記の3つのステップを完了してください。
- ClickHouseでのテーブル作成
- データの挿入。ここでは `./benchmark_sample/rawdata_dir/ssb-dbgen/*.tbl` を入力データとして使用する必要があります。
- "スター スキーマ"を非正規化された"フラットスキーマ"に変換

IAA Deflateコーデックでデータベースをセットアップします。

```bash
$ cd ./database_dir/deflate
$ [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```
lz4と同様に3つのステップを完了してください。

ZSTDコーデックでデータベースをセットアップします。

```bash
$ cd ./database_dir/zstd
$ [CLICKHOUSE_EXE] server -C config_zstd.xml >&/dev/null&
$ [CLICKHOUSE_EXE] client
```
lz4と同様に3つのステップを完了してください。

[self-check]
各コーデック(lz4/zstd/deflate)に対して、データベースが正常に作成されたことを確認するために以下のクエリを実行してください:
```sql
SELECT count() FROM lineorder_flat
```
以下の出力が期待されます:
```sql
┌───count()─┐
│ 119994608 │
└───────────┘
```
[Self-check for IAA Deflate codec]

クライアントからの挿入またはクエリの実行を最初に行うと、ClickHouseサーバーコンソールはこのログを出力することが期待されます:
```text
Hardware-assisted DeflateQpl codec is ready!
```
これを見つけられないが、次のような別のログを見た場合:
```text
Initialization of hardware-assisted DeflateQpl codec failed
```
それはIAAデバイスが準備できていないことを意味し、再度IAA設定を確認する必要があります。

## Benchmark with single instance {#benchmark-with-single-instance}

- ベンチマークを開始する前に、C6を無効にし、CPU周波数のガバナーを `performance` に設定してください。

```bash
$ cpupower idle-set -d 3
$ cpupower frequency-set -g performance
```

- メモリバウンドの影響を軽減するために、サーバーを1ソケットに、クライアントを別のソケットにバインドするために `numactl` を使用します。
- シングルインスタンスは、シングルサーバーがシングルクライアントに接続された状態を指します。

LZ4/Deflate/ZSTDそれぞれのベンチマークを実行します:

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

期待される3つのログが出力されるはずです:
```text
lz4.log
deflate.log
zstd.log
```

パフォーマンスメトリクスの確認方法:

QPSに焦点を当て、キーワード: `QPS_Final` を検索し、統計を収集してください。

## Benchmark with multi-instances {#benchmark-with-multi-instances}

- あまりにも多くのスレッドによるメモリバウンドの影響を減らすために、マルチインスタンスでベンチマークを実行することをお勧めします。
- マルチインスタンスは、複数（2または4）のサーバーがそれぞれのクライアントに接続された状態を指します。
- 1ソケットのコアは均等に分割され、それぞれのサーバーに割り当てられる必要があります。
- マルチインスタンスでは、各コーデックのために新しいフォルダーを作成し、シングルインスタンスと同様の手順でデータセットを挿入する必要があります。

2つの違いがあります:
- クライアント側では、テーブル作成とデータ挿入中に指定されたポートでClickHouseを起動する必要があります。
- サーバー側では、ポートが指定された特定のxml構成ファイルを使用してClickHouseを起動する必要があります。マルチインスタンス用のすべてのカスタマイズされたxml構成ファイルは `./server_config` の下に提供されています。

ここでは、1ソケットあたり60コアがあり、2インスタンスを例に取ります。
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

[第二インスタンスのサーバーを起動する]

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

第二インスタンスのためのテーブル作成 && データ挿入

テーブル作成:

```bash
$ [CLICKHOUSE_EXE] client -m --port=9001 
```

データ挿入:

```bash
$ [CLICKHOUSE_EXE] client --query "INSERT INTO [TBL_FILE_NAME] FORMAT CSV" < [TBL_FILE_NAME].tbl  --port=9001
```

- [TBL_FILE_NAME] は、`./benchmark_sample/rawdata_dir/ssb-dbgen` 下の正規表現: *.tbl で名前の付けられたファイルの名前を表します。
- `--port=9001` は、サーバーインスタンスに割り当てられたポートを示し、config_lz4_s2.xml/config_zstd_s2.xml/config_deflate_s2.xml にも定義されています。さらにインスタンスの場合、ポート9002/9003に置き換える必要があります。これはそれぞれs3/s4インスタンスを指します。指定しない場合、ポートはデフォルトで9000になり、最初のインスタンスで使用されています。

2インスタンスによるベンチマーキング

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

IAA deflate:

```bash
$ cd ./database_dir/deflate
$ numactl -C 0-29,120-149 [CLICKHOUSE_EXE] server -C config_deflate.xml >&/dev/null&
$ cd ./database_dir/deflate_s2
$ numactl -C 30-59,150-179 [CLICKHOUSE_EXE] server -C config_deflate_s2.xml >&/dev/null&
$ cd ./client_scripts
$ numactl -m 1 -N 1 python3 client_stressing_test.py queries_ssb.sql 2 > deflate_2insts.log
```

ここでの最後の引数: `2` は client_stressing_test.py のインスタンス数を示します。さらに多くのインスタンスの場合、3または4に置き換える必要があります。このスクリプトは最大4インスタンスをサポートしています。

期待される3つのログが出力されるはずです:

```text
lz4_2insts.log
deflate_2insts.log
zstd_2insts.log
```
パフォーマンスメトリクスの確認方法:

QPSに焦点を当て、キーワード: `QPS_Final` を検索し、統計を収集してください。

4インスタンスのベンチマーク設定は、上記の2インスタンスと似ています。
最終報告用にレビューするには、2インスタンスのベンチマークデータを使用することをお勧めします。

## Tips {#tips}

新しいClickhouseサーバーを起動する前に、必ずバックグラウンドのClickhouseプロセスが実行されていないことを確認し、古いものを確認して終了させてください:

```bash
$ ps -aux| grep clickhouse
$ kill -9 [PID]
```
./client_scripts/queries_ssb.sql のクエリリストを公式の [Star Schema Benchmark](/getting-started/example-datasets/star-schema) と比較すると、Q1.2/Q1.3/Q3.4 の3つのクエリが含まれていないことがわかります。これは、これらのクエリに対するCPU利用率%が非常に低いため（< 10%）、パフォーマンスの差異を示すことができないためです。
