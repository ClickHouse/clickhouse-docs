---
'description': '스타 스키마 벤치마크 (SSB) 데이터 세트 및 쿼리'
'sidebar_label': '스타 스키마 벤치마크'
'slug': '/getting-started/example-datasets/star-schema'
'title': '스타 스키마 벤치마크 (SSB, 2009)'
'doc_type': 'guide'
'keywords':
- 'example dataset'
- 'star schema'
- 'sample data'
- 'data modeling'
- 'benchmark'
---

Star Schema Benchmark는 대략적으로 [TPC-H](tpch.md)의 테이블과 쿼리를 기반으로 하지만, TPC-H와는 달리 스타 스키마 레이아웃을 사용합니다. 대부분의 데이터는 거대한 팩트 테이블에 저장되며, 이 팩트 테이블은 여러 개의 작은 차원 테이블에 의해 둘러싸여 있습니다. 쿼리는 필터 기준을 적용하기 위해 한 개 이상의 차원 테이블과 팩트 테이블을 조인합니다. 예를 들어, `MONTH = 'JANUARY'`와 같은 조건입니다.

참고 문헌:
- [Star Schema Benchmark](https://cs.umb.edu/~poneil/StarSchemaB.pdf) (O'Neil et. al), 2009
- [Variations of the Star Schema Benchmark to Test the Effects of Data Skew on Query Performance](https://doi.org/10.1145/2479871.2479927) (Rabl. et. al.), 2013

먼저, 스타 스키마 벤치마크 리포지토리를 확인하고 데이터 생성기를 컴파일하세요:

```bash
git clone https://github.com/vadimtk/ssb-dbgen.git
cd ssb-dbgen
make
```

그 다음, 데이터를 생성합니다. 파라미터 `-s`는 스케일 팩터를 지정합니다. 예를 들어, `-s 100`을 사용하면 6억 행이 생성됩니다.

```bash
./dbgen -s 1000 -T c
./dbgen -s 1000 -T l
./dbgen -s 1000 -T p
./dbgen -s 1000 -T s
./dbgen -s 1000 -T d
```

이제 ClickHouse에서 테이블을 생성합니다:

```sql
CREATE TABLE customer
(
        C_CUSTKEY       UInt32,
        C_NAME          String,
        C_ADDRESS       String,
        C_CITY          LowCardinality(String),
        C_NATION        LowCardinality(String),
        C_REGION        LowCardinality(String),
        C_PHONE         String,
        C_MKTSEGMENT    LowCardinality(String)
)
ENGINE = MergeTree ORDER BY (C_CUSTKEY);

CREATE TABLE lineorder
(
    LO_ORDERKEY             UInt32,
    LO_LINENUMBER           UInt8,
    LO_CUSTKEY              UInt32,
    LO_PARTKEY              UInt32,
    LO_SUPPKEY              UInt32,
    LO_ORDERDATE            Date,
    LO_ORDERPRIORITY        LowCardinality(String),
    LO_SHIPPRIORITY         UInt8,
    LO_QUANTITY             UInt8,
    LO_EXTENDEDPRICE        UInt32,
    LO_ORDTOTALPRICE        UInt32,
    LO_DISCOUNT             UInt8,
    LO_REVENUE              UInt32,
    LO_SUPPLYCOST           UInt32,
    LO_TAX                  UInt8,
    LO_COMMITDATE           Date,
    LO_SHIPMODE             LowCardinality(String)
)
ENGINE = MergeTree PARTITION BY toYear(LO_ORDERDATE) ORDER BY (LO_ORDERDATE, LO_ORDERKEY);

CREATE TABLE part
(
        P_PARTKEY       UInt32,
        P_NAME          String,
        P_MFGR          LowCardinality(String),
        P_CATEGORY      LowCardinality(String),
        P_BRAND         LowCardinality(String),
        P_COLOR         LowCardinality(String),
        P_TYPE          LowCardinality(String),
        P_SIZE          UInt8,
        P_CONTAINER     LowCardinality(String)
)
ENGINE = MergeTree ORDER BY P_PARTKEY;

CREATE TABLE supplier
(
        S_SUPPKEY       UInt32,
        S_NAME          String,
        S_ADDRESS       String,
        S_CITY          LowCardinality(String),
        S_NATION        LowCardinality(String),
        S_REGION        LowCardinality(String),
        S_PHONE         String
)
ENGINE = MergeTree ORDER BY S_SUPPKEY;

CREATE TABLE date
(
        D_DATEKEY            Date,
        D_DATE               FixedString(18),
        D_DAYOFWEEK          LowCardinality(String),
        D_MONTH              LowCardinality(String),
        D_YEAR               UInt16,
        D_YEARMONTHNUM       UInt32,
        D_YEARMONTH          LowCardinality(FixedString(7)),
        D_DAYNUMINWEEK       UInt8,
        D_DAYNUMINMONTH      UInt8,
        D_DAYNUMINYEAR       UInt16,
        D_MONTHNUMINYEAR     UInt8,
        D_WEEKNUMINYEAR      UInt8,
        D_SELLINGSEASON      String,
        D_LASTDAYINWEEKFL    UInt8,
        D_LASTDAYINMONTHFL   UInt8,
        D_HOLIDAYFL          UInt8,
        D_WEEKDAYFL          UInt8
)
ENGINE = MergeTree ORDER BY D_DATEKEY;
```

데이터는 다음과 같이 가져올 수 있습니다:

```bash
clickhouse-client --query "INSERT INTO customer FORMAT CSV" < customer.tbl
clickhouse-client --query "INSERT INTO part FORMAT CSV" < part.tbl
clickhouse-client --query "INSERT INTO supplier FORMAT CSV" < supplier.tbl
clickhouse-client --query "INSERT INTO lineorder FORMAT CSV" < lineorder.tbl
clickhouse-client --query "INSERT INTO date FORMAT CSV" < date.tbl
```

ClickHouse의 많은 사용 사례에서는 여러 테이블이 하나의 비정규화된 평면 테이블로 변환됩니다. 이 단계는 선택 사항이며, 아래 쿼리는 원래 형태와 비정규화된 테이블을 위해 다시 작성된 형식으로 나열되어 있습니다.

```sql
SET max_memory_usage = 20000000000;

CREATE TABLE lineorder_flat
ENGINE = MergeTree ORDER BY (LO_ORDERDATE, LO_ORDERKEY)
AS SELECT
    l.LO_ORDERKEY AS LO_ORDERKEY,
    l.LO_LINENUMBER AS LO_LINENUMBER,
    l.LO_CUSTKEY AS LO_CUSTKEY,
    l.LO_PARTKEY AS LO_PARTKEY,
    l.LO_SUPPKEY AS LO_SUPPKEY,
    l.LO_ORDERDATE AS LO_ORDERDATE,
    l.LO_ORDERPRIORITY AS LO_ORDERPRIORITY,
    l.LO_SHIPPRIORITY AS LO_SHIPPRIORITY,
    l.LO_QUANTITY AS LO_QUANTITY,
    l.LO_EXTENDEDPRICE AS LO_EXTENDEDPRICE,
    l.LO_ORDTOTALPRICE AS LO_ORDTOTALPRICE,
    l.LO_DISCOUNT AS LO_DISCOUNT,
    l.LO_REVENUE AS LO_REVENUE,
    l.LO_SUPPLYCOST AS LO_SUPPLYCOST,
    l.LO_TAX AS LO_TAX,
    l.LO_COMMITDATE AS LO_COMMITDATE,
    l.LO_SHIPMODE AS LO_SHIPMODE,
    c.C_NAME AS C_NAME,
    c.C_ADDRESS AS C_ADDRESS,
    c.C_CITY AS C_CITY,
    c.C_NATION AS C_NATION,
    c.C_REGION AS C_REGION,
    c.C_PHONE AS C_PHONE,
    c.C_MKTSEGMENT AS C_MKTSEGMENT,
    s.S_NAME AS S_NAME,
    s.S_ADDRESS AS S_ADDRESS,
    s.S_CITY AS S_CITY,
    s.S_NATION AS S_NATION,
    s.S_REGION AS S_REGION,
    s.S_PHONE AS S_PHONE,
    p.P_NAME AS P_NAME,
    p.P_MFGR AS P_MFGR,
    p.P_CATEGORY AS P_CATEGORY,
    p.P_BRAND AS P_BRAND,
    p.P_COLOR AS P_COLOR,
    p.P_TYPE AS P_TYPE,
    p.P_SIZE AS P_SIZE,
    p.P_CONTAINER AS P_CONTAINER
FROM lineorder AS l
INNER JOIN customer AS c ON c.C_CUSTKEY = l.LO_CUSTKEY
INNER JOIN supplier AS s ON s.S_SUPPKEY = l.LO_SUPPKEY
INNER JOIN part AS p ON p.P_PARTKEY = l.LO_PARTKEY;
```

쿼리는 `./qgen -s <scaling_factor>`에 의해 생성됩니다. `s = 100`에 대한 예제 쿼리:

Q1.1

```sql
SELECT
    sum(LO_EXTENDEDPRICE * LO_DISCOUNT) AS REVENUE
FROM
    lineorder,
    date
WHERE
    LO_ORDERDATE = D_DATEKEY
    AND D_YEAR = 1993
    AND LO_DISCOUNT BETWEEN 1 AND 3
    AND LO_QUANTITY < 25;
```

비정규화된 테이블:

```sql
SELECT
    sum(LO_EXTENDEDPRICE * LO_DISCOUNT) AS revenue
FROM
    lineorder_flat
WHERE
    toYear(LO_ORDERDATE) = 1993
    AND LO_DISCOUNT BETWEEN 1 AND 3
    AND LO_QUANTITY < 25;
```

Q1.2

```sql
SELECT
    sum(LO_EXTENDEDPRICE * LO_DISCOUNT) AS REVENUE
FROM
    lineorder,
    date
WHERE
    LO_ORDERDATE = D_DATEKEY
    AND D_YEARMONTHNUM = 199401
    AND LO_DISCOUNT BETWEEN 4 AND 6
    AND LO_QUANTITY BETWEEN 26 AND 35;
```

비정규화된 테이블:

```sql
SELECT
    sum(LO_EXTENDEDPRICE * LO_DISCOUNT) AS revenue
FROM
    lineorder_flat
WHERE
    toYYYYMM(LO_ORDERDATE) = 199401
    AND LO_DISCOUNT BETWEEN 4 AND 6
    AND LO_QUANTITY BETWEEN 26 AND 35;
```

Q1.3

```sql
SELECT
    sum(LO_EXTENDEDPRICE*LO_DISCOUNT) AS REVENUE
FROM
    lineorder,
    date
WHERE
    LO_ORDERDATE = D_DATEKEY
    AND D_WEEKNUMINYEAR = 6
    AND D_YEAR = 1994
    AND LO_DISCOUNT BETWEEN 5 AND 7
    AND LO_QUANTITY BETWEEN 26 AND 35;
```

비정규화된 테이블:

```sql
SELECT
    sum(LO_EXTENDEDPRICE * LO_DISCOUNT) AS revenue
FROM
    lineorder_flat
WHERE
    toISOWeek(LO_ORDERDATE) = 6
    AND toYear(LO_ORDERDATE) = 1994
    AND LO_DISCOUNT BETWEEN 5 AND 7
    AND LO_QUANTITY BETWEEN 26 AND 35;
```

Q2.1

```sql
SELECT
    sum(LO_REVENUE),
    D_YEAR,
    P_BRAND
FROM
    lineorder,
    date,
    part,
    supplier
WHERE
    LO_ORDERDATE = D_DATEKEY
    AND LO_PARTKEY = P_PARTKEY
    AND LO_SUPPKEY = S_SUPPKEY
    AND P_CATEGORY = 'MFGR#12'
    AND S_REGION = 'AMERICA'
GROUP BY
    D_YEAR,
    P_BRAND
ORDER BY
    D_YEAR,
    P_BRAND;
```

비정규화된 테이블:

```sql
SELECT
    sum(LO_REVENUE),
    toYear(LO_ORDERDATE) AS year,
    P_BRAND
FROM lineorder_flat
WHERE
    P_CATEGORY = 'MFGR#12'
    AND S_REGION = 'AMERICA'
GROUP BY
    year,
    P_BRAND
ORDER BY
    year,
    P_BRAND;
```

Q2.2

```sql
SELECT
    sum(LO_REVENUE),
    D_YEAR,
    P_BRAND
FROM
    lineorder,
    date,
    part,
    supplier
WHERE
    LO_ORDERDATE = D_DATEKEY
    AND LO_PARTKEY = P_PARTKEY
    AND LO_SUPPKEY = S_SUPPKEY
    AND P_BRAND BETWEEN
    'MFGR#2221' AND 'MFGR#2228'
    AND S_REGION = 'ASIA'
GROUP BY
    D_YEAR,
    P_BRAND
ORDER BY
    D_YEAR,
    P_BRAND;
```

비정규화된 테이블:

```sql
SELECT
    sum(LO_REVENUE),
    toYear(LO_ORDERDATE) AS year,
    P_BRAND
FROM lineorder_flat
WHERE P_BRAND >= 'MFGR#2221' AND P_BRAND <= 'MFGR#2228' AND S_REGION = 'ASIA'
GROUP BY
    year,
    P_BRAND
ORDER BY
    year,
    P_BRAND;
```

Q2.3

```sql
SELECT
    sum(LO_REVENUE),
    D_YEAR,
    P_BRAND
FROM
    lineorder,
    date,
    part,
    supplier
WHERE
    LO_ORDERDATE = D_DATEKEY
    AND LO_PARTKEY = P_PARTKEY
    AND LO_SUPPKEY = S_SUPPKEY
    AND P_BRAND = 'MFGR#2221'
    AND S_REGION = 'EUROPE'
GROUP BY
    D_YEAR,
    P_BRAND
ORDER BY
    D_YEAR,
    P_BRAND;
```

비정규화된 테이블:

```sql
SELECT
    sum(LO_REVENUE),
    toYear(LO_ORDERDATE) AS year,
    P_BRAND
FROM lineorder_flat
WHERE P_BRAND = 'MFGR#2239' AND S_REGION = 'EUROPE'
GROUP BY
    year,
    P_BRAND
ORDER BY
    year,
    P_BRAND;
```

Q3.1

```sql
SELECT
    C_NATION,
    S_NATION,
    D_YEAR,
    sum(LO_REVENUE) AS REVENUE
FROM
    customer,
    lineorder,
    supplier,
    date
WHERE
    LO_CUSTKEY = C_CUSTKEY
    AND LO_SUPPKEY = S_SUPPKEY
    AND LO_ORDERDATE = D_DATEKEY
    AND C_REGION = 'ASIA' AND S_REGION = 'ASIA'
    AND D_YEAR >= 1992 AND D_YEAR <= 1997
GROUP BY
    C_NATION,
    S_NATION,
    D_YEAR
ORDER BY
    D_YEAR ASC,
    REVENUE DESC;
```

비정규화된 테이블:

```sql
SELECT
    C_NATION,
    S_NATION,
    toYear(LO_ORDERDATE) AS year,
    sum(LO_REVENUE) AS revenue
FROM lineorder_flat
WHERE
    C_REGION = 'ASIA'
    AND S_REGION = 'ASIA'
    AND year >= 1992
    AND year <= 1997
GROUP BY
    C_NATION,
    S_NATION,
    year
ORDER BY
    year ASC,
    revenue DESC;
```

Q3.2

```sql
SELECT
    C_CITY,
    S_CITY,
    D_YEAR,
    sum(LO_REVENUE) AS REVENUE
FROM
    customer,
    lineorder,
    supplier,
    date
WHERE
    LO_CUSTKEY = C_CUSTKEY
    AND LO_SUPPKEY = S_SUPPKEY
    AND LO_ORDERDATE = D_DATEKEY
    AND C_NATION = 'UNITED STATES'
    AND S_NATION = 'UNITED STATES'
    AND D_YEAR >= 1992 AND D_YEAR <= 1997
GROUP BY
    C_CITY,
    S_CITY,
    D_YEAR
ORDER BY
    D_YEAR ASC,
    REVENUE DESC;
```

비정규화된 테이블:

```sql
SELECT
    C_CITY,
    S_CITY,
    toYear(LO_ORDERDATE) AS year,
    sum(LO_REVENUE) AS revenue
FROM lineorder_flat
WHERE
    C_NATION = 'UNITED STATES'
    AND S_NATION = 'UNITED STATES'
    AND year >= 1992
    AND year <= 1997
GROUP BY
    C_CITY,
    S_CITY,
    year
ORDER BY
    year ASC,
    revenue DESC;
```

Q3.3

```sql
SELECT
    C_CITY,
    S_CITY,
    D_YEAR,
    sum(LO_REVENUE) AS revenue
FROM
    customer,
    lineorder,
    supplier,
    date
WHERE
    LO_CUSTKEY = C_CUSTKEY
    AND LO_SUPPKEY = S_SUPPKEY
    AND LO_ORDERDATE = D_DATEKEY
    AND (C_CITY = 'UNITED KI1' OR C_CITY = 'UNITED KI5')
    AND (S_CITY = 'UNITED KI1' OR S_CITY = 'UNITED KI5')
    AND D_YEAR >= 1992
    AND D_YEAR <= 1997
GROUP BY
    C_CITY,
    S_CITY,
    D_YEAR
ORDER BY
    D_YEAR ASC,
    revenue DESC;
```

비정규화된 테이블:

```sql
SELECT
    C_CITY,
    S_CITY,
    toYear(LO_ORDERDATE) AS year,
    sum(LO_REVENUE) AS revenue
FROM lineorder_flat
WHERE
    (C_CITY = 'UNITED KI1' OR C_CITY = 'UNITED KI5')
    AND (S_CITY = 'UNITED KI1' OR S_CITY = 'UNITED KI5')
    AND year >= 1992
    AND year <= 1997
GROUP BY
    C_CITY,
    S_CITY,
    year
ORDER BY
    year ASC,
    revenue DESC;
```

Q3.4

```sql
SELECT
    C_CITY,
    S_CITY,
    D_YEAR,
    sum(LO_REVENUE) AS revenue
FROM
    customer,
    lineorder,
    supplier,
    date
WHERE
    LO_CUSTKEY = C_CUSTKEY
    AND LO_SUPPKEY = S_SUPPKEY
    AND LO_ORDERDATE = D_DATEKEY
    AND (C_CITY='UNITED KI1' OR C_CITY='UNITED KI5')
    AND (S_CITY='UNITED KI1' OR S_CITY='UNITED KI5')
    AND D_YEARMONTH = 'Dec1997'
GROUP BY
    C_CITY,
    S_CITY,
    D_YEAR
ORDER BY
    D_YEAR ASC,
    revenue DESC;
```

비정규화된 테이블:

```sql
SELECT
    C_CITY,
    S_CITY,
    toYear(LO_ORDERDATE) AS year,
    sum(LO_REVENUE) AS revenue
FROM lineorder_flat
WHERE
    (C_CITY = 'UNITED KI1' OR C_CITY = 'UNITED KI5')
    AND (S_CITY = 'UNITED KI1' OR S_CITY = 'UNITED KI5')
    AND toYYYYMM(LO_ORDERDATE) = 199712
GROUP BY
    C_CITY,
    S_CITY,
    year
ORDER BY
    year ASC,
    revenue DESC;
```

Q4.1

```sql
SELECT
    D_YEAR,
    C_NATION,
    sum(LO_REVENUE - LO_SUPPLYCOST) AS PROFIT
FROM
    date,
    customer,
    supplier,
    part,
    lineorder
WHERE
    LO_CUSTKEY = C_CUSTKEY
    AND LO_SUPPKEY = S_SUPPKEY
    AND LO_PARTKEY = P_PARTKEY
    AND LO_ORDERDATE = D_DATEKEY
    AND C_REGION = 'AMERICA'
    AND S_REGION = 'AMERICA'
    AND (P_MFGR = 'MFGR#1' OR P_MFGR = 'MFGR#2')
GROUP BY
    D_YEAR,
    C_NATION
ORDER BY
    D_YEAR,
    C_NATION
```

비정규화된 테이블:

```sql
SELECT
    toYear(LO_ORDERDATE) AS year,
    C_NATION,
    sum(LO_REVENUE - LO_SUPPLYCOST) AS profit
FROM lineorder_flat
WHERE C_REGION = 'AMERICA' AND S_REGION = 'AMERICA' AND (P_MFGR = 'MFGR#1' OR P_MFGR = 'MFGR#2')
GROUP BY
    year,
    C_NATION
ORDER BY
    year ASC,
    C_NATION ASC;
```

Q4.2

```sql
SELECT
    D_YEAR,
    S_NATION,
    P_CATEGORY,
    sum(LO_REVENUE - LO_SUPPLYCOST) AS profit
FROM
    date,
    customer,
    supplier,
    part,
    lineorder
WHERE
    LO_CUSTKEY = C_CUSTKEY
    AND LO_SUPPKEY = S_SUPPKEY
    AND LO_PARTKEY = P_PARTKEY
    AND LO_ORDERDATE = D_DATEKEY
    AND C_REGION = 'AMERICA'
    AND S_REGION = 'AMERICA'
    AND (D_YEAR = 1997 OR D_YEAR = 1998)
    AND (P_MFGR = 'MFGR#1' OR P_MFGR = 'MFGR#2')
GROUP BY
    D_YEAR,
    S_NATION,
    P_CATEGORY
ORDER BY
    D_YEAR,
    S_NATION,
    P_CATEGORY
```

비정규화된 테이블:

```sql
SELECT
    toYear(LO_ORDERDATE) AS year,
    S_NATION,
    P_CATEGORY,
    sum(LO_REVENUE - LO_SUPPLYCOST) AS profit
FROM lineorder_flat
WHERE
    C_REGION = 'AMERICA'
    AND S_REGION = 'AMERICA'
    AND (year = 1997 OR year = 1998)
    AND (P_MFGR = 'MFGR#1' OR P_MFGR = 'MFGR#2')
GROUP BY
    year,
    S_NATION,
    P_CATEGORY
ORDER BY
    year ASC,
    S_NATION ASC,
    P_CATEGORY ASC;
```

Q4.3

```sql
SELECT
    D_YEAR,
    S_CITY,
    P_BRAND,
    sum(LO_REVENUE - LO_SUPPLYCOST) AS profit
FROM
    date,
    customer,
    supplier,
    part,
    lineorder
WHERE
    LO_CUSTKEY = C_CUSTKEY
    AND LO_SUPPKEY = S_SUPPKEY
    AND LO_PARTKEY = P_PARTKEY
    AND LO_ORDERDATE = D_DATEKEY
    AND C_REGION = 'AMERICA'
    AND S_NATION = 'UNITED STATES'
    AND (D_YEAR = 1997 OR D_YEAR = 1998)
    AND P_CATEGORY = 'MFGR#14'
GROUP BY
    D_YEAR,
    S_CITY,
    P_BRAND
ORDER BY
    D_YEAR,
    S_CITY,
    P_BRAND
```

비정규화된 테이블:

```sql
SELECT
    toYear(LO_ORDERDATE) AS year,
    S_CITY,
    P_BRAND,
    sum(LO_REVENUE - LO_SUPPLYCOST) AS profit
FROM
    lineorder_flat
WHERE
    S_NATION = 'UNITED STATES'
    AND (year = 1997 OR year = 1998)
    AND P_CATEGORY = 'MFGR#14'
GROUP BY
    year,
    S_CITY,
    P_BRAND
ORDER BY
    year ASC,
    S_CITY ASC,
    P_BRAND ASC;
```
