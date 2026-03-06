---
description: 'TPC-H ベンチマークのデータセットとクエリ。'
sidebar_label: 'TPC-H'
slug: /getting-started/example-datasets/tpch
title: 'TPC-H (1999)'
doc_type: 'guide'
keywords: ['サンプルデータセット', 'tpch', 'ベンチマーク', 'サンプルデータ', 'パフォーマンス テスト']
---

卸売サプライヤーの社内データウェアハウスをモデル化した、広く用いられているベンチマークです。
データは第 3 正規形で表現されており、クエリ実行時に多数の `JOIN` が必要になります。
データが一様かつ互いに独立に分布しているという非現実的な前提と、ベンチマーク自体の古さにもかかわらず、TPC-H は現在も最も広く利用されている OLAP ベンチマークです。

**参考文献**

* [TPC-H](https://www.tpc.org/tpc_documents_current_versions/current_specifications5.asp)
* [New TPC Benchmarks for Decision Support and Web Commerce](https://doi.org/10.1145/369275.369291) (Poess et. al., 2000)
* [TPC-H Analyzed: Hidden Messages and Lessons Learned from an Influential Benchmark](https://doi.org/10.1007/978-3-319-04936-6_5) (Boncz et. al.), 2013
* [Quantifying TPC-H Choke Points and Their Optimizations](https://doi.org/10.14778/3389133.3389138) (Dresseler et. al.), 2020

## データ生成とインポート \{#data-generation-and-import\}

まず、TPC-H リポジトリを取得し、データ生成ツールをコンパイルします。

```bash
git clone https://github.com/gregrahn/tpch-kit.git
cd tpch-kit/dbgen
make
```

次にデータを生成します。パラメータ `-s` はスケール係数を指定します。例えば `-s 100` の場合、テーブル&#39;lineitem&#39;に 6 億行のデータが生成されます。

```bash
./dbgen -s 100
```

処理を高速化するには、&quot;chunked&quot;（チャンク単位の）生成（複数プロセスによる）を使用できます。

```bash
for i in $(seq 1 8); do
    ./dbgen -s 100 -C 8 -S $i &
done
wait
```

スケールファクター 100 の場合の詳細なテーブルサイズ:

| Table    | size (in rows) | size (compressed in ClickHouse) |
| -------- | -------------- | ------------------------------- |
| nation   | 25             | 2 kB                            |
| region   | 5              | 1 kB                            |
| part     | 20.000.000     | 895 MB                          |
| supplier | 1.000.000      | 75 MB                           |
| partsupp | 80.000.000     | 4.37 GB                         |
| customer | 15.000.000     | 1.19 GB                         |
| orders   | 150.000.000    | 6.15 GB                         |
| lineitem | 600.000.000    | 26.69 GB                        |

（ClickHouse における圧縮後のサイズは `system.tables.total_bytes` から取得したもので、以下のテーブル定義に基づきます。）

次に、ClickHouse にテーブルを作成します。テーブル定義は、ClickHouse リポジトリ内の [`init.sql`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/benchmarks/tpc-h/init.sql) にあります。

データは次のようにインポートできます。

```bash
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO nation FORMAT CSV" < nation.tbl
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO region FORMAT CSV" < region.tbl
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO part FORMAT CSV" < part.tbl
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO supplier FORMAT CSV" < supplier.tbl
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO partsupp FORMAT CSV" < partsupp.tbl
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO customer FORMAT CSV" < customer.tbl
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO orders FORMAT CSV" < orders.tbl
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO lineitem FORMAT CSV" < lineitem.tbl
```

:::note
tpch-kit を使用して自分でテーブルを生成する代わりに、公開 S3 バケットからデータをインポートすることもできます。
その場合は、まず [`init.sql`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/benchmarks/tpc-h/init.sql) を使って空のテーブルを作成しておいてください。


```sql
-- Scaling factor 1
INSERT INTO nation SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/h/1/nation.tbl', NOSIGN, CSV) SETTINGS format_csv_delimiter = '|', input_format_defaults_for_omitted_fields = 1, input_format_csv_empty_as_default = 1;
INSERT INTO region SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/h/1/region.tbl', NOSIGN, CSV) SETTINGS format_csv_delimiter = '|', input_format_defaults_for_omitted_fields = 1, input_format_csv_empty_as_default = 1;
INSERT INTO part SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/h/1/part.tbl', NOSIGN, CSV) SETTINGS format_csv_delimiter = '|', input_format_defaults_for_omitted_fields = 1, input_format_csv_empty_as_default = 1;
INSERT INTO supplier SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/h/1/supplier.tbl', NOSIGN, CSV) SETTINGS format_csv_delimiter = '|', input_format_defaults_for_omitted_fields = 1, input_format_csv_empty_as_default = 1;
INSERT INTO partsupp SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/h/1/partsupp.tbl', NOSIGN, CSV) SETTINGS format_csv_delimiter = '|', input_format_defaults_for_omitted_fields = 1, input_format_csv_empty_as_default = 1;
INSERT INTO customer SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/h/1/customer.tbl', NOSIGN, CSV) SETTINGS format_csv_delimiter = '|', input_format_defaults_for_omitted_fields = 1, input_format_csv_empty_as_default = 1;
INSERT INTO orders SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/h/1/orders.tbl', NOSIGN, CSV) SETTINGS format_csv_delimiter = '|', input_format_defaults_for_omitted_fields = 1, input_format_csv_empty_as_default = 1;
INSERT INTO lineitem SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/h/1/lineitem.tbl', NOSIGN, CSV) SETTINGS format_csv_delimiter = '|', input_format_defaults_for_omitted_fields = 1, input_format_csv_empty_as_default = 1;

-- Scaling factor 100
INSERT INTO nation SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/h/100/nation.tbl.gz', NOSIGN, CSV) SETTINGS format_csv_delimiter = '|', input_format_defaults_for_omitted_fields = 1, input_format_csv_empty_as_default = 1;
INSERT INTO region SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/h/100/region.tbl.gz', NOSIGN, CSV) SETTINGS format_csv_delimiter = '|', input_format_defaults_for_omitted_fields = 1, input_format_csv_empty_as_default = 1;
INSERT INTO part SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/h/100/part.tbl.gz', NOSIGN, CSV) SETTINGS format_csv_delimiter = '|', input_format_defaults_for_omitted_fields = 1, input_format_csv_empty_as_default = 1;
INSERT INTO supplier SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/h/100/supplier.tbl.gz', NOSIGN, CSV) SETTINGS format_csv_delimiter = '|', input_format_defaults_for_omitted_fields = 1, input_format_csv_empty_as_default = 1;
INSERT INTO partsupp SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/h/100/partsupp.tbl.gz', NOSIGN, CSV) SETTINGS format_csv_delimiter = '|', input_format_defaults_for_omitted_fields = 1, input_format_csv_empty_as_default = 1;
INSERT INTO customer SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/h/100/customer.tbl.gz', NOSIGN, CSV) SETTINGS format_csv_delimiter = '|', input_format_defaults_for_omitted_fields = 1, input_format_csv_empty_as_default = 1;
INSERT INTO orders SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/h/100/orders.tbl.gz', NOSIGN, CSV) SETTINGS format_csv_delimiter = '|', input_format_defaults_for_omitted_fields = 1, input_format_csv_empty_as_default = 1;
INSERT INTO lineitem SELECT * FROM s3('https://clickhouse-datasets.s3.amazonaws.com/h/100/lineitem.tbl.gz', NOSIGN, CSV) SETTINGS format_csv_delimiter = '|', input_format_defaults_for_omitted_fields = 1, input_format_csv_empty_as_default = 1;
```

:::

## クエリ \{#queries\}

22 個の TPC-H クエリは、ClickHouse リポジトリ内の[こちら](https://github.com/ClickHouse/ClickHouse/tree/master/tests/benchmarks/tpc-h/queries)から参照できます。

SQL 標準に準拠した動作と期待される結果を得るには、[`settings.json`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/benchmarks/tpc-h/settings.json) の設定を適用してください。
既知の問題および特定のクエリに関する注意事項については、[README](https://github.com/ClickHouse/ClickHouse/blob/master/tests/benchmarks/tpc-h/README.md) を参照してください。

**正確性**

特に断りがない限り、クエリ結果は公式の結果と一致します。検証するには、スケールファクタ = 1 の TPC-H データベース（`dbgen`、前述）を生成し、[tpch-kit における期待される結果](https://github.com/gregrahn/tpch-kit/tree/master/dbgen/answers)と比較してください。