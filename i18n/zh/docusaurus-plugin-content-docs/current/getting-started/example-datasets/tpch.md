---
description: 'TPC-H 基准数据集和查询。'
sidebar_label: 'TPC-H'
slug: /getting-started/example-datasets/tpch
title: 'TPC-H (1999)'
doc_type: 'guide'
keywords: ['示例数据集', 'tpch', '基准测试', '示例数据', '性能测试']
---

一种流行的基准测试，用于建模某批发供应商的内部数据仓库。
数据以第三范式的形式存储，在查询执行时需要大量的 JOIN 操作。
尽管年代久远，且在数据均匀且相互独立分布这一假设上不够现实，TPC-H 仍然是迄今最流行的 OLAP 基准测试。

**参考文献**

* [TPC-H](https://www.tpc.org/tpc_documents_current_versions/current_specifications5.asp)
* [New TPC Benchmarks for Decision Support and Web Commerce](https://doi.org/10.1145/369275.369291)（Poess 等，2000）
* [TPC-H Analyzed: Hidden Messages and Lessons Learned from an Influential Benchmark](https://doi.org/10.1007/978-3-319-04936-6_5)（Boncz 等，2013）
* [Quantifying TPC-H Choke Points and Their Optimizations](https://doi.org/10.14778/3389133.3389138)（Dresseler 等，2020）

## 数据生成与导入 \{#data-generation-and-import\}

首先，检出 TPC-H 仓库代码并编译数据生成器：

```bash
git clone https://github.com/gregrahn/tpch-kit.git
cd tpch-kit/dbgen
make
```

然后生成数据。参数 `-s` 用于指定规模因子。例如，当使用 `-s 100` 时，会为表 &#39;lineitem&#39; 生成 6 亿行数据。

```bash
./dbgen -s 100
```

为了加快速度，你可以使用“分块（chunked）”生成（在多个进程中并行执行）：

```bash
for i in $(seq 1 8); do
    ./dbgen -s 100 -C 8 -S $i &
done
wait
```

在规模因子 100 下的各表详细大小：

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

（ClickHouse 中的压缩大小取自 `system.tables.total_bytes`，并基于下述表定义。）

现在在 ClickHouse 中创建表。表定义可以在 ClickHouse 仓库中的 [`init.sql`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/benchmarks/tpc-h/init.sql) 文件中找到。

可以按如下方式导入数据：

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
你也可以选择从公共 S3 存储桶导入数据，而无需使用 tpch-kit 自行生成各个表。请确保先使用 [`init.sql`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/benchmarks/tpc-h/init.sql) 创建空表。

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

## 查询 \{#queries\}

可以在 ClickHouse 仓库中的[此处](https://github.com/ClickHouse/ClickHouse/tree/master/tests/benchmarks/tpc-h/queries)找到 22 个 TPC-H 查询。

若要获得与 SQL 标准兼容的行为和预期结果，请应用 [`settings.json`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/benchmarks/tpc-h/settings.json) 中的设置。
有关已知问题和特定查询说明，请参阅 [README](https://github.com/ClickHouse/ClickHouse/blob/master/tests/benchmarks/tpc-h/README.md)。

**正确性**

除非特别说明，查询结果与官方结果一致。要进行验证，请使用规模因子 = 1（`dbgen`，见上文）生成一个 TPC-H 数据库，并与 [tpch-kit 中的预期结果](https://github.com/gregrahn/tpch-kit/tree/master/dbgen/answers) 进行比较。