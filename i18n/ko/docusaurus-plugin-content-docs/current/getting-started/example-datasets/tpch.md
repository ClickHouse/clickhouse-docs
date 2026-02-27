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

* [TPC-H](https://www.tpc.org/tpc_documents_current_versions/current_specifications5.asp)
* [New TPC Benchmarks for Decision Support and Web Commerce](https://doi.org/10.1145/369275.369291) (Poess et. al., 2000)
* [TPC-H Analyzed: Hidden Messages and Lessons Learned from an Influential Benchmark](https://doi.org/10.1007/978-3-319-04936-6_5) (Boncz et. al.), 2013
* [Quantifying TPC-H Choke Points and Their Optimizations](https://doi.org/10.14778/3389133.3389138) (Dresseler et. al.), 2020

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

이제 ClickHouse에 테이블을 생성합니다.

TPC-H 명세의 규칙을 가능한 한 충실하게 따릅니다:

* 기본 키는 명세 1.4.2.2 절에 언급된 컬럼에 대해서만 생성합니다.
* 대체 매개변수는 명세 2.1.x.4 절에 나와 있는 쿼리 검증용 값으로 치환했습니다.
* 1.4.2.1 절에 따라, `dbgen`이 기본적으로 생성하더라도 테이블 정의에서는 선택적인 `NOT NULL` 제약 조건을 사용하지 않습니다.
  ClickHouse에서 `SELECT` 쿼리의 성능은 `NOT NULL` 제약 조건의 존재 여부에 영향을 받지 않습니다.
* 1.3.1 절에 따라, 명세에서 언급된 추상 데이터 타입(예: `Identifier`, `Variable text, size N`)을 구현하기 위해 ClickHouse의 고유 데이터 타입(예: `Int32`, `String`)을 사용합니다. 이에 따른 효과는 가독성이 좋아지는 것뿐이며, `dbgen`이 생성하는 SQL-92 데이터 타입(예: `INTEGER`, `VARCHAR(40)`)도 ClickHouse에서 그대로 동작합니다.

```sql
CREATE TABLE nation (
    n_nationkey  Int32,
    n_name       String,
    n_regionkey  Int32,
    n_comment    String)
ORDER BY (n_nationkey);

CREATE TABLE region (
    r_regionkey  Int32,
    r_name       String,
    r_comment    String)
ORDER BY (r_regionkey);

CREATE TABLE part (
    p_partkey     Int32,
    p_name        String,
    p_mfgr        String,
    p_brand       String,
    p_type        String,
    p_size        Int32,
    p_container   String,
    p_retailprice Decimal(15,2),
    p_comment     String)
ORDER BY (p_partkey);

CREATE TABLE supplier (
    s_suppkey     Int32,
    s_name        String,
    s_address     String,
    s_nationkey   Int32,
    s_phone       String,
    s_acctbal     Decimal(15,2),
    s_comment     String)
ORDER BY (s_suppkey);

CREATE TABLE partsupp (
    ps_partkey     Int32,
    ps_suppkey     Int32,
    ps_availqty    Int32,
    ps_supplycost  Decimal(15,2),
    ps_comment     String)
ORDER BY (ps_partkey, ps_suppkey);

CREATE TABLE customer (
    c_custkey     Int32,
    c_name        String,
    c_address     String,
    c_nationkey   Int32,
    c_phone       String,
    c_acctbal     Decimal(15,2),
    c_mktsegment  String,
    c_comment     String)
ORDER BY (c_custkey);

CREATE TABLE orders  (
    o_orderkey       Int32,
    o_custkey        Int32,
    o_orderstatus    String,
    o_totalprice     Decimal(15,2),
    o_orderdate      Date,
    o_orderpriority  String,
    o_clerk          String,
    o_shippriority   Int32,
    o_comment        String)
ORDER BY (o_orderkey);
-- The following is an alternative order key which is not compliant with the official TPC-H rules but recommended by sec. 4.5 in
-- "Quantifying TPC-H Choke Points and Their Optimizations":
-- ORDER BY (o_orderdate, o_orderkey);

CREATE TABLE lineitem (
    l_orderkey       Int32,
    l_partkey        Int32,
    l_suppkey        Int32,
    l_linenumber     Int32,
    l_quantity       Decimal(15,2),
    l_extendedprice  Decimal(15,2),
    l_discount       Decimal(15,2),
    l_tax            Decimal(15,2),
    l_returnflag     String,
    l_linestatus     String,
    l_shipdate       Date,
    l_commitdate     Date,
    l_receiptdate    Date,
    l_shipinstruct   String,
    l_shipmode       String,
    l_comment        String)
ORDER BY (l_orderkey, l_linenumber);
-- The following is an alternative order key which is not compliant with the official TPC-H rules but recommended by sec. 4.5 in
-- "Quantifying TPC-H Choke Points and Their Optimizations":
-- ORDER BY (l_shipdate, l_orderkey, l_linenumber);
```

데이터는 다음과 같이 가져옵니다:

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
tpch-kit을 사용해 직접 테이블을 생성하는 대신, 공개 S3 버킷에서 데이터를 가져올 수도 있습니다. 먼저 위의 `CREATE` 문을 사용하여 빈 테이블을 생성하십시오.

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

:::note
SQL 표준에 따른 올바른 결과를 얻으려면 [`join_use_nulls`](../../operations/settings/settings.md#join_use_nulls) 설정을 활성화해야 합니다.
:::

:::note
일부 TPC-H 쿼리는 v25.8부터 지원되는 상관 서브쿼리(correlated subquery)를 사용합니다.
이 쿼리를 실행하려면 최소한 해당 ClickHouse 버전 이상을 사용해야 합니다.

ClickHouse 25.5, 25.6, 25.7 버전에서는 추가로 다음 설정을 해야 합니다:

```sql
SET allow_experimental_correlated_subqueries = 1;
```

:::

쿼리는 `./qgen -s <scaling_factor>` 명령으로 생성합니다. 아래는 `s = 100`인 경우의 예시 쿼리입니다:

**정확성(Correctness)**

별도로 언급하지 않는 한 쿼리 결과는 공식 결과와 일치합니다. 이를 검증하려면 스케일 팩터(scale factor)가 1인 TPC-H 데이터베이스를 `dbgen`(위 참조)으로 생성한 후 [tpch-kit의 예상 결과](https://github.com/gregrahn/tpch-kit/tree/master/dbgen/answers)와 비교하십시오.

**Q1**

```sql
SELECT
    l_returnflag,
    l_linestatus,
    sum(l_quantity) AS sum_qty,
    sum(l_extendedprice) AS sum_base_price,
    sum(l_extendedprice * (1 - l_discount)) AS sum_disc_price,
    sum(l_extendedprice * (1 - l_discount) * (1 + l_tax)) AS sum_charge,
    avg(l_quantity) AS avg_qty,
    avg(l_extendedprice) AS avg_price,
    avg(l_discount) AS avg_disc,
    count(*) AS count_order
FROM
    lineitem
WHERE
    l_shipdate <= DATE '1998-12-01' - INTERVAL '90' DAY
GROUP BY
    l_returnflag,
    l_linestatus
ORDER BY
    l_returnflag,
    l_linestatus;
```

**Q2**

```sql
SELECT
    s_acctbal,
    s_name,
    n_name,
    p_partkey,
    p_mfgr,
    s_address,
    s_phone,
    s_comment
FROM
    part,
    supplier,
    partsupp,
    nation,
    region
WHERE
    p_partkey = ps_partkey
    AND s_suppkey = ps_suppkey
    AND p_size = 15
    AND p_type LIKE '%BRASS'
    AND s_nationkey = n_nationkey
    AND n_regionkey = r_regionkey
    AND r_name = 'EUROPE'
    AND ps_supplycost = (
        SELECT
            min(ps_supplycost)
        FROM
            partsupp,
            supplier,
            nation,
            region
        WHERE
            p_partkey = ps_partkey
            AND s_suppkey = ps_suppkey
            AND s_nationkey = n_nationkey
            AND n_regionkey = r_regionkey
            AND r_name = 'EUROPE'
    )
ORDER BY
    s_acctbal DESC,
    n_name,
    s_name,
    p_partkey
LIMIT 100;
```

**쿼리 3**

```sql
SELECT
    l_orderkey,
    sum(l_extendedprice * (1 - l_discount)) AS revenue,
    o_orderdate,
    o_shippriority
FROM
    customer,
    orders,
    lineitem
WHERE
    c_mktsegment = 'BUILDING'
    AND c_custkey = o_custkey
    AND l_orderkey = o_orderkey
    AND o_orderdate < DATE '1995-03-15'
    AND l_shipdate > DATE '1995-03-15'
GROUP BY
    l_orderkey,
    o_orderdate,
    o_shippriority
ORDER BY
    revenue DESC,
    o_orderdate
LIMIT 10;
```

**Q4**

```sql
SELECT
    o_orderpriority,
    count(*) AS order_count
FROM
    orders
WHERE
    o_orderdate >= DATE '1993-07-01'
    AND o_orderdate < DATE '1993-07-01' + INTERVAL '3' MONTH
    AND EXISTS (
        SELECT
            *
        FROM
            lineitem
        WHERE
            l_orderkey = o_orderkey
            AND l_commitdate < l_receiptdate
    )
GROUP BY
    o_orderpriority
ORDER BY
    o_orderpriority;
```

**Q5**

```sql
SELECT
    n_name,
    sum(l_extendedprice * (1 - l_discount)) AS revenue
FROM
    customer,
    orders,
    lineitem,
    supplier,
    nation,
    region
WHERE
    c_custkey = o_custkey
    AND l_orderkey = o_orderkey
    AND l_suppkey = s_suppkey
    AND c_nationkey = s_nationkey
    AND s_nationkey = n_nationkey
    AND n_regionkey = r_regionkey
    AND r_name = 'ASIA'
    AND o_orderdate >= DATE '1994-01-01'
    AND o_orderdate < DATE '1994-01-01' + INTERVAL '1' year
GROUP BY
    n_name
ORDER BY
    revenue DESC;
```

**Q6**

```sql
SELECT
    sum(l_extendedprice * l_discount) AS revenue
FROM
    lineitem
WHERE
    l_shipdate >= DATE '1994-01-01'
    AND l_shipdate < DATE '1994-01-01' + INTERVAL '1' year
    AND l_discount BETWEEN 0.06 - 0.01 AND 0.06 + 0.01
    AND l_quantity < 24;
```

::::note
2025년 2월 기준으로 Decimal 덧셈 관련 버그 때문에 이 쿼리는 기본 설정만으로는 동작하지 않습니다. 관련 이슈: https://github.com/ClickHouse/ClickHouse/issues/70136

이 대체 쿼리는 정상적으로 동작하며, 참조 결과를 반환하는 것으로 검증되었습니다.

```sql
SELECT
    sum(l_extendedprice * l_discount) AS revenue
FROM
    lineitem
WHERE
    l_shipdate >= DATE '1994-01-01'
    AND l_shipdate < DATE '1994-01-01' + INTERVAL '1' year
    AND l_discount BETWEEN 0.05 AND 0.07
    AND l_quantity < 24;
```

::::

**Q7**

```sql
SELECT
    supp_nation,
    cust_nation,
    l_year,
    sum(volume) AS revenue
FROM (
    SELECT
        n1.n_name AS supp_nation,
        n2.n_name AS cust_nation,
        extract(year FROM l_shipdate) AS l_year,
        l_extendedprice * (1 - l_discount) AS volume
    FROM
        supplier,
        lineitem,
        orders,
        customer,
        nation n1,
        nation n2
    WHERE
        s_suppkey = l_suppkey
        AND o_orderkey = l_orderkey
        AND c_custkey = o_custkey
        AND s_nationkey = n1.n_nationkey
        AND c_nationkey = n2.n_nationkey
        AND (
            (n1.n_name = 'FRANCE' AND n2.n_name = 'GERMANY')
            OR (n1.n_name = 'GERMANY' AND n2.n_name = 'FRANCE')
        )
        AND l_shipdate BETWEEN DATE '1995-01-01' AND DATE '1996-12-31'
    ) AS shipping
GROUP BY
    supp_nation,
    cust_nation,
    l_year
ORDER BY
    supp_nation,
    cust_nation,
    l_year;
```

**Q8**

```sql
SELECT
    o_year,
    sum(CASE
            WHEN nation = 'BRAZIL'
            THEN volume
            ELSE 0
        END) / sum(volume) AS mkt_share
FROM (
    SELECT
        extract(year FROM o_orderdate) AS o_year,
        l_extendedprice * (1 - l_discount) AS volume,
        n2.n_name AS nation
    FROM
        part,
        supplier,
        lineitem,
        orders,
        customer,
        nation n1,
        nation n2,
        region
    WHERE
        p_partkey = l_partkey
        AND s_suppkey = l_suppkey
        AND l_orderkey = o_orderkey
        AND o_custkey = c_custkey
        AND c_nationkey = n1.n_nationkey
        AND n1.n_regionkey = r_regionkey
        AND r_name = 'AMERICA'
        AND s_nationkey = n2.n_nationkey
        AND o_orderdate BETWEEN DATE '1995-01-01' AND DATE '1996-12-31'
        AND p_type = 'ECONOMY ANODIZED STEEL'
    ) AS all_nations
GROUP BY
    o_year
ORDER BY
    o_year;
```

**쿼리 9**

```sql
SELECT
    nation,
    o_year,
    sum(amount) AS sum_profit
FROM (
    SELECT
        n_name AS nation,
        extract(year FROM o_orderdate) AS o_year,
        l_extendedprice * (1 - l_discount) - ps_supplycost * l_quantity AS amount
    FROM
        part,
        supplier,
        lineitem,
        partsupp,
        orders,
        nation
    WHERE
        s_suppkey = l_suppkey
        AND ps_suppkey = l_suppkey
        AND ps_partkey = l_partkey
        AND p_partkey = l_partkey
        AND o_orderkey = l_orderkey
        AND s_nationkey = n_nationkey
        AND p_name LIKE '%green%'
    ) AS profit
GROUP BY
    nation,
    o_year
ORDER BY
    nation,
    o_year DESC;
```

**Q10**

```sql
SELECT
    c_custkey,
    c_name,
    sum(l_extendedprice * (1 - l_discount)) AS revenue,
    c_acctbal,
    n_name,
    c_address,
    c_phone,
    c_comment
FROM
    customer,
    orders,
    lineitem,
    nation
WHERE
    c_custkey = o_custkey
    AND l_orderkey = o_orderkey
    AND o_orderdate >= DATE '1993-10-01'
    AND o_orderdate < DATE '1993-10-01' + INTERVAL '3' MONTH
    AND l_returnflag = 'R'
    AND c_nationkey = n_nationkey
GROUP BY
    c_custkey,
    c_name,
    c_acctbal,
    c_phone,
    n_name,
    c_address,
    c_comment
ORDER BY
    revenue DESC
LIMIT 20;
```

**Q11**

```sql
SELECT
    ps_partkey,
    sum(ps_supplycost * ps_availqty) AS value
FROM
    partsupp,
    supplier,
    nation
WHERE
    ps_suppkey = s_suppkey
    AND s_nationkey = n_nationkey
    AND n_name = 'GERMANY'
GROUP BY
    ps_partkey
HAVING
    sum(ps_supplycost * ps_availqty) > (
        SELECT
            sum(ps_supplycost * ps_availqty) * 0.0001
        FROM
            partsupp,
            supplier,
            nation
        WHERE
            ps_suppkey = s_suppkey
            AND s_nationkey = n_nationkey
            AND n_name = 'GERMANY'
    )
ORDER BY
    value DESC;
```

**Q12**

```sql
SELECT
    l_shipmode,
    sum(CASE
            WHEN o_orderpriority = '1-URGENT'
                OR o_orderpriority = '2-HIGH'
            THEN 1
            ELSE 0
        END) AS high_line_count,
    sum(CASE
        WHEN o_orderpriority <> '1-URGENT'
                AND o_orderpriority <> '2-HIGH'
            THEN 1
        ELSE 0
        END) AS low_line_count
FROM
    orders,
    lineitem
WHERE
    o_orderkey = l_orderkey
    AND l_shipmode IN ('MAIL', 'SHIP')
    AND l_commitdate < l_receiptdate
    AND l_shipdate < l_commitdate
    AND l_receiptdate >= DATE '1994-01-01'
    AND l_receiptdate < DATE '1994-01-01' + INTERVAL '1' year
GROUP BY
    l_shipmode
ORDER BY
    l_shipmode;
```

**Q13**

```sql
SELECT
    c_count,
    count(*) AS custdist
FROM (
    SELECT
        c_custkey,
        count(o_orderkey) AS c_count
    FROM
        customer LEFT OUTER JOIN orders ON
            c_custkey = o_custkey
            AND o_comment NOT LIKE '%special%requests%'
    GROUP BY
        c_custkey
    ) AS c_orders
GROUP BY
    c_count
ORDER BY
    custdist DESC,
    c_count DESC;
```

**Q14**

```sql
SELECT
    100.00 * sum(CASE
                    WHEN p_type LIKE 'PROMO%'
                    THEN l_extendedprice * (1 - l_discount)
                    ELSE 0
                END) / sum(l_extendedprice * (1 - l_discount)) AS promo_revenue
FROM
    lineitem,
    part
WHERE
    l_partkey = p_partkey
    AND l_shipdate >= DATE '1995-09-01'
    AND l_shipdate < DATE '1995-09-01' + INTERVAL '1' MONTH;
```

**Q15**

```sql
WITH revenue_view AS (
    SELECT
        l_suppkey AS supplier_no,
        sum(l_extendedprice * (1 - l_discount)) AS total_revenue
    FROM
        lineitem
    WHERE
        l_shipdate >= '1996-01-01'
      AND l_shipdate < '1996-04-01'
    GROUP BY
        l_suppkey)
SELECT
    s_suppkey,
    s_name,
    total_revenue
FROM
    supplier,
    revenue_view
WHERE
    s_suppkey = supplier_no
    AND total_revenue = (
        SELECT
            max(total_revenue)
        FROM
            revenue_view
    )
ORDER BY
    s_suppkey;
```

**Q16**

```sql
SELECT
    p_brand,
    p_type,
    p_size,
    count(DISTINCT ps_suppkey) AS supplier_cnt
FROM
    partsupp,
    part
WHERE
    p_partkey = ps_partkey
    AND p_brand <> 'Brand#45'
    AND p_type NOT LIKE 'MEDIUM POLISHED%'
    AND p_size IN (49, 14, 23,  45, 19, 3, 36, 9)
    AND ps_suppkey NOT IN (
        SELECT
            s_suppkey
        FROM
            supplier
        WHERE
            s_comment LIKE '%Customer%Complaints%'
    )
GROUP BY
    p_brand,
    p_type,
    p_size
ORDER BY
    supplier_cnt DESC,
    p_brand,
    p_type,
    p_size;
```

**Q17**

```sql
SELECT
    sum(l_extendedprice) / 7.0 AS avg_yearly
FROM
    lineitem,
    part
WHERE
    p_partkey = l_partkey
    AND p_brand = 'Brand#23'
    AND p_container = 'MED BOX'
    AND l_quantity < (
        SELECT
            0.2 * avg(l_quantity)
        FROM
            lineitem
        WHERE
            l_partkey = p_partkey
    );
```

**Q18**

```sql
SELECT
    c_name,
    c_custkey,
    o_orderkey,
    o_orderdate,
    o_totalprice,
    sum(l_quantity)
FROM
    customer,
    orders,
    lineitem
WHERE
    o_orderkey IN (
        SELECT
            l_orderkey
        FROM
            lineitem
        GROUP BY
            l_orderkey
        HAVING
            sum(l_quantity) > 300
    )
    AND c_custkey = o_custkey
    AND o_orderkey = l_orderkey
GROUP BY
    c_name,
    c_custkey,
    o_orderkey,
    o_orderdate,
    o_totalprice
ORDER BY
    o_totalprice DESC,
    o_orderdate
LIMIT 100;
```

**Q19**

```sql
SELECT
    sum(l_extendedprice * (1 - l_discount)) AS revenue
FROM
    lineitem,
    part
WHERE
    (
        p_partkey = l_partkey
        AND p_brand = 'Brand#12'
        AND p_container IN ('SM CASE', 'SM BOX', 'SM PACK', 'SM PKG')
        AND l_quantity >= 1 AND l_quantity <= 1 + 10
        AND p_size BETWEEN 1 AND 5
        AND l_shipmode IN ('AIR', 'AIR REG')
        AND l_shipinstruct = 'DELIVER IN PERSON'
    )
    OR
    (
        p_partkey = l_partkey
        AND p_brand = 'Brand#23'
        AND p_container IN ('MED BAG', 'MED BOX', 'MED PKG', 'MED PACK')
        AND l_quantity >= 10 AND l_quantity <= 10 + 10
        AND p_size BETWEEN 1 AND 10
        AND l_shipmode IN ('AIR', 'AIR REG')
        AND l_shipinstruct = 'DELIVER IN PERSON'
    )
    OR
    (
        p_partkey = l_partkey
        AND p_brand = 'Brand#34'
        AND p_container IN ('LG CASE', 'LG BOX', 'LG PACK', 'LG PKG')
        AND l_quantity >= 20 AND l_quantity <= 20 + 10
        AND p_size BETWEEN 1 AND 15
        AND l_shipmode IN ('AIR', 'AIR REG')
        AND l_shipinstruct = 'DELIVER IN PERSON'
    );
```

**Q20**

```sql
SELECT
    s_name,
    s_address
FROM
    supplier,
    nation
WHERE
    s_suppkey in (
        SELECT
            ps_suppkey
        FROM
            partsupp
        WHERE
            ps_partkey in (
                SELECT
                    p_partkey
                FROM
                    part
                WHERE
                    p_name LIKE 'forest%'
            )
            AND ps_availqty > (
                SELECT
                    0.5 * sum(l_quantity)
                FROM
                    lineitem
                WHERE
                    l_partkey = ps_partkey
                    AND l_suppkey = ps_suppkey
                    AND l_shipdate >= DATE '1994-01-01'
                    AND l_shipdate < DATE '1994-01-01' + INTERVAL '1' year
            )
    )
    AND s_nationkey = n_nationkey
    AND n_name = 'CANADA'
ORDER BY
    s_name;
```

**Q21**

```sql
SELECT
    s_name,
    count(*) AS numwait
FROM
    supplier,
    lineitem l1,
    orders,
    nation
WHERE
    s_suppkey = l1.l_suppkey
    AND o_orderkey = l1.l_orderkey
    AND o_orderstatus = 'F'
    AND l1.l_receiptdate > l1.l_commitdate
    AND EXISTS (
        SELECT
            *
        FROM
            lineitem l2
        WHERE
            l2.l_orderkey = l1.l_orderkey
            AND l2.l_suppkey <> l1.l_suppkey
    )
    AND NOT EXISTS (
        SELECT
            *
        FROM
            lineitem l3
        WHERE
            l3.l_orderkey = l1.l_orderkey
            AND l3.l_suppkey <> l1.l_suppkey
            AND l3.l_receiptdate > l3.l_commitdate
    )
    AND s_nationkey = n_nationkey
    AND n_name = 'SAUDI ARABIA'
GROUP BY
    s_name
ORDER BY
    numwait DESC,
    s_name
LIMIT 100;
```

**Q22**

```sql
SELECT
    cntrycode,
    count(*) AS numcust,
    sum(c_acctbal) AS totacctbal
FROM (
    SELECT
        substring(c_phone FROM 1 for 2) AS cntrycode,
        c_acctbal
    FROM
        customer
    WHERE
        substring(c_phone FROM 1 for 2) in
            ('13', '31', '23', '29', '30', '18', '17')
        AND c_acctbal > (
            SELECT
                avg(c_acctbal)
            FROM
                customer
            WHERE
                c_acctbal > 0.00
                AND substring(c_phone FROM 1 for 2) in
                    ('13', '31', '23', '29', '30', '18', '17')
        )
        AND NOT EXISTS (
            SELECT
                *
            FROM
                orders
            WHERE
                o_custkey = c_custkey
        )
    ) AS custsale
GROUP BY
    cntrycode
ORDER BY
    cntrycode;
```
