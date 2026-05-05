---
description: 'TPC-DS 基准数据集和查询。'
sidebar_label: 'TPC-DS'
slug: /getting-started/example-datasets/tpcds
title: 'TPC-DS (2012)'
doc_type: 'guide'
keywords: ['example dataset', 'tpcds', 'benchmark', 'sample data', 'performance testing']
---

与 [Star Schema Benchmark (SSB)](star-schema.md) 类似，TPC-DS 以 [TPC-H](tpch.md) 为基础，但走了相反的路线，即采用复杂的雪花模式存储数据（24 张表而不是 8 张），从而增加了所需的连接次数。
数据分布是倾斜的（例如正态分布和泊松分布）。
它包含 99 个带有随机替换的报表和即席查询。

**参考文献**

- [The Making of TPC-DS](https://dl.acm.org/doi/10.5555/1182635.1164217) (Nambiar)，2006 年

## 数据生成与导入 \{#data-generation-and-import\}

首先，检出 TPC-DS 仓库并编译数据生成器：

```bash
git clone https://github.com/gregrahn/tpcds-kit.git
cd tpcds-kit/tools
make
```

然后生成数据。参数 `-scale` 用于指定规模因子。

```bash
./dsdgen -scale 1
```

现在在 ClickHouse 中创建数据表。表结构定义位于 ClickHouse 仓库中的 [`init.sql`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/benchmarks/tpc-ds/init.sql) 文件。

数据可以按如下方式导入：

```bash
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO call_center FORMAT CSV" < call_center.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO catalog_page FORMAT CSV" < catalog_page.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO catalog_returns FORMAT CSV" < catalog_returns.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO catalog_sales FORMAT CSV" < catalog_sales.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO customer FORMAT CSV" < customer.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO customer_address FORMAT CSV" < customer_address.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO customer_demographics FORMAT CSV" < customer_demographics.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO date_dim FORMAT CSV" < date_dim.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO household_demographics FORMAT CSV" < household_demographics.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO income_band FORMAT CSV" < income_band.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO inventory FORMAT CSV" < inventory.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO item FORMAT CSV" < item.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO promotion FORMAT CSV" < promotion.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO reason FORMAT CSV" < reason.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO ship_mode FORMAT CSV" < ship_mode.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO store FORMAT CSV" < store.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO store_returns FORMAT CSV" < store_returns.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO store_sales FORMAT CSV" < store_sales.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO time_dim FORMAT CSV" < time_dim.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO warehouse FORMAT CSV" < warehouse.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO web_page FORMAT CSV" < web_page.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO web_returns FORMAT CSV" < web_returns.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO web_sales FORMAT CSV" < web_sales.dat
clickhouse-client --format_csv_delimiter '|' --query "INSERT INTO web_site FORMAT CSV" < web_site.dat
```

接下来运行生成的查询。


## 查询 \{#queries\}

可以在 ClickHouse 仓库的[此位置](https://github.com/ClickHouse/ClickHouse/tree/master/tests/benchmarks/tpc-ds/queries)找到 99 个 TPC-DS 查询。

要获得与 SQL 标准兼容的行为和预期结果，请应用 [`settings.json`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/benchmarks/tpc-ds/settings.json) 中的设置。
有关已知问题和特定查询的说明，请参阅 [README](https://github.com/ClickHouse/ClickHouse/blob/master/tests/benchmarks/tpc-ds/README.md)。

**正确性**

除非特别说明，否则查询结果与官方结果一致。可能会存在轻微的精度差异，这是被 TPC-DS 规范所允许的。