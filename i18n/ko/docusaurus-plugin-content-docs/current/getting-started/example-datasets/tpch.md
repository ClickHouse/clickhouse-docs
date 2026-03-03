---
description: 'TPC-H 벤치마크 데이터 세트와 쿼리.'
sidebar_label: 'TPC-H'
slug: /getting-started/example-datasets/tpch
title: 'TPC-H (1999)'
doc_type: 'guide'
keywords: ['예제 데이터 세트', 'tpch', '벤치마크', '샘플 데이터', '성능 테스트']
---

도매 공급업체의 내부 데이터 웨어하우스를 모델링한 대표적인 벤치마크입니다.
데이터는 3차 정규형으로 저장되어, 쿼리를 실행할 때 많은 조인이 필요합니다.
데이터가 균일하고 서로 독립적으로 분포한다는 비현실적인 가정과 제법 오래된 설계임에도 불구하고, TPC-H는 현재까지 가장 널리 사용되는 OLAP 벤치마크입니다.

**참고 자료**

- [TPC-H](https://www.tpc.org/tpc_documents_current_versions/current_specifications5.asp)
- [New TPC Benchmarks for Decision Support and Web Commerce](https://doi.org/10.1145/369275.369291) (Poess et. al., 2000)
- [TPC-H Analyzed: Hidden Messages and Lessons Learned from an Influential Benchmark](https://doi.org/10.1007/978-3-319-04936-6_5) (Boncz et. al.), 2013
- [Quantifying TPC-H Choke Points and Their Optimizations](https://doi.org/10.14778/3389133.3389138) (Dresseler et. al.), 2020

## 데이터 생성 및 가져오기 \{#data-generation-and-import\}

먼저 TPC-H 저장소를 체크아웃한 다음 데이터 생성기를 컴파일합니다.

```bash
git clone https://github.com/gregrahn/tpch-kit.git
cd tpch-kit/dbgen
make
```

그다음 데이터를 생성합니다. 매개변수 `-s`는 스케일 팩터(scale factor)를 지정합니다. 예를 들어 `-s 100`을 사용하면 「lineitem」 테이블에는 6억 개의 행이 생성됩니다.

```bash
./dbgen -s 100
```

속도를 높이기 위해 여러 프로세스에서 실행되는 「청크 단위」 생성 방식을 사용할 수 있습니다.

```bash
for i in $(seq 1 8); do
    ./dbgen -s 100 -C 8 -S $i &
done
wait
```

스케일 팩터 100에서의 테이블별 상세 크기:

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

(ClickHouse에서의 압축 크기는 `system.tables.total_bytes` 값을 기반으로 하며, 아래 테이블 정의를 바탕으로 산출되었습니다.)

이제 ClickHouse에 테이블을 생성합니다. 테이블 정의는 ClickHouse 저장소의 [`init.sql`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/benchmarks/tpc-h/init.sql)에서 확인할 수 있습니다.

데이터는 다음과 같이 가져올 수 있습니다:

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
tpch-kit을 사용하여 직접 테이블을 생성하는 대신, 공개 S3 버킷에서 데이터를 가져와 사용할 수도 있습니다. 먼저 [`init.sql`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/benchmarks/tpc-h/init.sql)을 사용하여 비어 있는 테이블을 생성했는지 확인하십시오.


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


## 쿼리 \{#queries\}

22개의 TPC-H 쿼리는 ClickHouse 리포지터리의 [여기](https://github.com/ClickHouse/ClickHouse/tree/master/tests/benchmarks/tpc-h/queries)에서 확인할 수 있습니다.

SQL 표준과 호환되는 동작과 기대한 결과를 얻으려면 [`settings.json`](https://github.com/ClickHouse/ClickHouse/blob/master/tests/benchmarks/tpc-h/settings.json)에 정의된 설정을 적용하십시오.
알려진 이슈와 특정 쿼리에 대한 참고 사항은 [README](https://github.com/ClickHouse/ClickHouse/blob/master/tests/benchmarks/tpc-h/README.md)를 참조하십시오.

**정확성(Correctness)**

별도로 언급하지 않는 한 쿼리 결과는 공식 결과와 일치합니다. 이를 검증하려면 스케일 팩터(scale factor)가 1인 TPC-H 데이터베이스를 `dbgen`(위 참조)으로 생성한 후 [tpch-kit의 예상 결과](https://github.com/gregrahn/tpch-kit/tree/master/dbgen/answers)와 비교하십시오.