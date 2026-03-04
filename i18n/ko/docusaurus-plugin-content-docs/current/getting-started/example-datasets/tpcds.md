---
description: 'TPC-DS 벤치마크 데이터 세트와 쿼리.'
sidebar_label: 'TPC-DS'
slug: /getting-started/example-datasets/tpcds
title: 'TPC-DS (2012)'
doc_type: 'guide'
keywords: ['예제 데이터 세트', 'tpcds', '벤치마크', '샘플 데이터', '성능 테스트']
---

[Star Schema Benchmark (SSB)](star-schema.md)와 유사하게, TPC-DS는 [TPC-H](tpch.md)를 기반으로 하지만, 반대 방향을 취해 데이터를 복잡한 스노우플레이크 스키마에 저장함으로써 필요한 조인 수를 늘렸습니다(8개 테이블 대신 24개 테이블).
데이터 분포는 편향되어 있습니다(예: 정규 분포 및 포아송 분포).
무작위 치환값이 사용되는 99개의 리포팅 및 애드혹 쿼리가 제공됩니다.

**참고 자료**

- [The Making of TPC-DS](https://dl.acm.org/doi/10.5555/1182635.1164217) (Nambiar), 2006

## 데이터 생성 및 가져오기 \{#data-generation-and-import\}

먼저 TPC-DS 리포지토리를 체크아웃한 후 데이터 생성기를 컴파일합니다.

```bash
git clone https://github.com/gregrahn/tpcds-kit.git
cd tpcds-kit/tools
make
```

그런 다음 데이터를 생성합니다. 매개변수 `-scale`로 스케일 팩터를 지정합니다.

```bash
./dsdgen -scale 1
```

이제 ClickHouse에 테이블을 생성합니다. 테이블 정의는 ClickHouse 리포지토리의 [`init.sql`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/benchmarks/tpc-ds/init.sql)에 있습니다.

데이터는 다음과 같이 가져올 수 있습니다:

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

이제 생성된 쿼리를 실행합니다.


## 쿼리 \{#queries\}

99개의 TPC-DS 쿼리는 ClickHouse 리포지토리의 [여기](https://github.com/ClickHouse/ClickHouse/tree/master/tests/benchmarks/tpc-ds/queries)에서 확인할 수 있습니다.

SQL 표준과 호환되는 동작 및 예상되는 결과를 얻으려면 [`settings.json`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/benchmarks/tpc-ds/settings.json)의 설정을 적용하십시오.
알려진 문제와 특정 쿼리에 대한 설명은 [README](https://github.com/ClickHouse/ClickHouse/blob/master/tests/benchmarks/tpc-ds/README.md)를 참고하십시오.

**정확성**

별도로 언급하지 않는 한 쿼리 결과는 공식 결과와 일치합니다. TPC-DS 사양에서 허용하는 범위 내에서 정밀도에 약간의 차이가 있을 수 있습니다.