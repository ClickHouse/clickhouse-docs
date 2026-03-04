---
description: 'TPC-DS ベンチマークのデータセットとクエリ。'
sidebar_label: 'TPC-DS'
slug: /getting-started/example-datasets/tpcds
title: 'TPC-DS (2012)'
doc_type: 'guide'
keywords: ['example dataset', 'tpcds', 'benchmark', 'sample data', 'performance testing']
---

[Star Schema Benchmark (SSB)](star-schema.md) と同様に、TPC-DS は [TPC-H](tpch.md) をベースとしていますが、逆のアプローチを取り、データを複雑なスノーフレークスキーマ（8 テーブルではなく 24 テーブル）に格納することで必要な JOIN の数を増やしています。
データ分布は偏っており（例：正規分布やポアソン分布）、ランダムな値の代入を伴う 99 個のレポートおよびアドホッククエリが含まれます。

**参考文献**

* [The Making of TPC-DS](https://dl.acm.org/doi/10.5555/1182635.1164217) (Nambiar), 2006

## データ生成とインポート \{#data-generation-and-import\}

まず、TPC-DS リポジトリをチェックアウトしてデータ生成ツールをコンパイルします。

```bash
git clone https://github.com/gregrahn/tpcds-kit.git
cd tpcds-kit/tools
make
```

次にデータを生成します。パラメータ `-scale` はスケールファクターを指定します。

```bash
./dsdgen -scale 1
```

次に ClickHouse でテーブルを作成します。テーブル定義は、ClickHouse リポジトリ内の [`init.sql`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/benchmarks/tpc-ds/init.sql) にあります。

データは次のようにしてインポートできます。

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

次に、生成されたクエリを実行します。


## クエリ \{#queries\}

99 個の TPC-DS クエリは ClickHouse リポジトリ内の [こちら](https://github.com/ClickHouse/ClickHouse/tree/master/tests/benchmarks/tpc-ds/queries) にあります。

SQL 標準と互換性のある動作および期待される結果を得るには、[`settings.json`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/benchmarks/tpc-ds/settings.json) の設定を適用してください。
既知の問題や特定クエリに関する注意事項については [README](https://github.com/ClickHouse/ClickHouse/blob/master/tests/benchmarks/tpc-ds/README.md) を参照してください。

**正確性**

特に断りがない限り、クエリ結果は公式の結果と一致します。TPC-DS 仕様で許容されている範囲内で、精度上のわずかな差異が生じる場合があります。