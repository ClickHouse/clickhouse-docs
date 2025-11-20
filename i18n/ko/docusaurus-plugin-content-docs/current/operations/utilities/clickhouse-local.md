---
'description': '서버 없이 데이터를 처리하기 위한 clickhouse-local 사용 가이드'
'sidebar_label': 'clickhouse-local'
'sidebar_position': 60
'slug': '/operations/utilities/clickhouse-local'
'title': 'clickhouse-local'
'doc_type': 'reference'
---


# clickhouse-local

## clickhouse-local과 ClickHouse를 사용할 때 {#when-to-use-clickhouse-local-vs-clickhouse}

`clickhouse-local`은 SQL을 사용하여 로컬 및 원격 파일에서 빠른 처리를 수행해야 하는 개발자에게 이상적인 사용하기 쉬운 ClickHouse 버전입니다. 전체 데이터베이스 서버를 설치할 필요 없이 `clickhouse-local`을 사용하면 개발자들은 명령줄에서 [ClickHouse SQL 방언](../../sql-reference/index.md)으로 SQL 명령을 사용할 수 있어, 전체 ClickHouse 설치 없이 ClickHouse 기능에 접근할 수 있는 간단하고 효율적인 방법을 제공합니다. `clickhouse-local`의 주요 이점 중 하나는 [clickhouse-client](/operations/utilities/clickhouse-local) 설치시 이미 포함되어 있는 것입니다. 이는 개발자들이 복잡한 설치 프로세스 없이도 `clickhouse-local`로 빠르게 시작할 수 있음을 의미합니다.

`clickhouse-local`은 개발 및 테스트 용도와 파일 처리를 위해 훌륭한 도구지만, 최종 사용자나 애플리케이션에 서비스를 제공하는 데는 적합하지 않습니다. 이러한 시나리오에서는 오픈 소스 [ClickHouse](/install)를 사용하는 것이 좋습니다. ClickHouse는 대규모 분석 작업을 처리하도록 설계된 강력한 OLAP 데이터베이스입니다. 이는 대규모 데이터 세트에 대한 복잡한 쿼리를 신속하고 효율적으로 처리할 수 있게 하여, 높은 성능이 중요한 생산 환경에서 사용하기에 이상적입니다. 또한 ClickHouse는 대규모 데이터 세트를 처리하고 애플리케이션에 서비스를 제공하는 데 필수적인 복제, 샤딩, 고가용성과 같은 다양한 기능을 제공합니다. 더 큰 데이터 세트를 처리하거나 최종 사용자 또는 애플리케이션에 서비스를 제공해야 하는 경우, `clickhouse-local` 대신 오픈 소스 ClickHouse를 사용하는 것을 권장합니다.

아래의 문서를 읽어보십시오. 여기에는 `clickhouse-local`의 예제 사용 사례가 나와 있습니다. 예를 들어 [로컬 파일 쿼리하기](#query_data_in_file) 또는 [S3에서 Parquet 파일 읽기](#query-data-in-a-parquet-file-in-aws-s3) 등이 있습니다.

## clickhouse-local 다운로드 {#download-clickhouse-local}

`clickhouse-local`은 ClickHouse 서버와 `clickhouse-client`을 실행하는 동일한 `clickhouse` 바이너리를 사용하여 실행됩니다. 최신 버전을 다운로드하는 가장 쉬운 방법은 다음 명령어를 사용하는 것입니다:

```bash
curl https://clickhouse.com/ | sh
```

:::note
방금 다운로드한 바이너리는 다양한 ClickHouse 도구와 유틸리티를 실행할 수 있습니다. ClickHouse를 데이터베이스 서버로 실행하고 싶다면 [빠른 시작](/get-started/quick-start)을 참조하세요.
:::

## SQL을 사용하여 파일에서 데이터 쿼리하기 {#query_data_in_file}

`clickhouse-local`의 일반적인 사용법 중 하나는 파일에서 애드혹 쿼리를 실행하는 것입니다. 이 경우 데이터를 테이블에 삽입할 필요가 없습니다. `clickhouse-local`은 파일에서 데이터를 스트리밍하여 임시 테이블로 만들어 SQL을 실행할 수 있습니다.

파일이 `clickhouse-local`과 동일한 머신에 위치한다면, 로드할 파일을 간단히 지정할 수 있습니다. 다음 `reviews.tsv` 파일에는 Amazon 제품 리뷰 샘플이 포함되어 있습니다:

```bash
./clickhouse local -q "SELECT * FROM 'reviews.tsv'"
```

이 명령은 다음의 단축키입니다:

```bash
./clickhouse local -q "SELECT * FROM file('reviews.tsv')"
```

ClickHouse는 파일 이름 확장에서 탭으로 구분된 형식을 사용한다고 인식합니다. 형식을 명시적으로 지정해야 하는 경우, [많은 ClickHouse 입력 형식](../../interfaces/formats.md) 중 하나를 추가하면 됩니다:
```bash
./clickhouse local -q "SELECT * FROM file('reviews.tsv', 'TabSeparated')"
```

`file` 테이블 함수는 테이블을 생성하며, `DESCRIBE`를 사용하여 유추된 스키마를 확인할 수 있습니다:

```bash
./clickhouse local -q "DESCRIBE file('reviews.tsv')"
```

:::tip
파일 이름에서 글로브를 사용할 수 있습니다 (See [glob substitutions](/sql-reference/table-functions/file.md/#globs-in-path)).

예시:

```bash
./clickhouse local -q "SELECT * FROM 'reviews*.jsonl'"
./clickhouse local -q "SELECT * FROM 'review_?.csv'"
./clickhouse local -q "SELECT * FROM 'review_{1..3}.csv'"
```

:::

```response
marketplace    Nullable(String)
customer_id    Nullable(Int64)
review_id    Nullable(String)
product_id    Nullable(String)
product_parent    Nullable(Int64)
product_title    Nullable(String)
product_category    Nullable(String)
star_rating    Nullable(Int64)
helpful_votes    Nullable(Int64)
total_votes    Nullable(Int64)
vine    Nullable(String)
verified_purchase    Nullable(String)
review_headline    Nullable(String)
review_body    Nullable(String)
review_date    Nullable(Date)
```

평점이 가장 높은 제품을 찾습니다:

```bash
./clickhouse local -q "SELECT
    argMax(product_title,star_rating),
    max(star_rating)
FROM file('reviews.tsv')"
```

```response
Monopoly Junior Board Game    5
```

## AWS S3에서 Parquet 파일의 데이터 쿼리하기 {#query-data-in-a-parquet-file-in-aws-s3}

S3에 파일이 있는 경우, `clickhouse-local`과 `s3` 테이블 함수를 사용하여 ClickHouse 테이블에 데이터를 삽입하지 않고 파일을 직접 쿼리할 수 있습니다. 우리는 영국에서 판매된 주택 가격이 포함된 공용 버킷의 `house_0.parquet`라는 파일을 보유하고 있습니다. 이 파일의 행 수를 확인해 보겠습니다:

```bash
./clickhouse local -q "
SELECT count()
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/house_parquet/house_0.parquet')"
```

파일에는 2.7M개의 행이 있습니다:

```response
2772030
```

ClickHouse가 파일에서 결정한 유추된 스키마를 보는 것은 항상 유용합니다:

```bash
./clickhouse local -q "DESCRIBE s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/house_parquet/house_0.parquet')"
```

```response
price    Nullable(Int64)
date    Nullable(UInt16)
postcode1    Nullable(String)
postcode2    Nullable(String)
type    Nullable(String)
is_new    Nullable(UInt8)
duration    Nullable(String)
addr1    Nullable(String)
addr2    Nullable(String)
street    Nullable(String)
locality    Nullable(String)
town    Nullable(String)
district    Nullable(String)
county    Nullable(String)
```

가장 비싼 지역이 어디인지 알아보겠습니다:

```bash
./clickhouse local -q "
SELECT
    town,
    district,
    count() AS c,
    round(avg(price)) AS price,
    bar(price, 0, 5000000, 100)
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/house_parquet/house_0.parquet')
GROUP BY
    town,
    district
HAVING c >= 100
ORDER BY price DESC
LIMIT 10"
```

```response
LONDON    CITY OF LONDON    886    2271305    █████████████████████████████████████████████▍
LEATHERHEAD    ELMBRIDGE    206    1176680    ███████████████████████▌
LONDON    CITY OF WESTMINSTER    12577    1108221    ██████████████████████▏
LONDON    KENSINGTON AND CHELSEA    8728    1094496    █████████████████████▉
HYTHE    FOLKESTONE AND HYTHE    130    1023980    ████████████████████▍
CHALFONT ST GILES    CHILTERN    113    835754    ████████████████▋
AMERSHAM    BUCKINGHAMSHIRE    113    799596    ███████████████▉
VIRGINIA WATER    RUNNYMEDE    356    789301    ███████████████▊
BARNET    ENFIELD    282    740514    ██████████████▊
NORTHWOOD    THREE RIVERS    184    731609    ██████████████▋
```

:::tip
파일을 ClickHouse에 삽입할 준비가 되면, ClickHouse 서버를 시작하고 `file` 및 `s3` 테이블 함수의 결과를 `MergeTree` 테이블에 삽입하세요. 자세한 내용은 [빠른 시작](/get-started/quick-start)을 참조하세요.
:::

## 형식 변환 {#format-conversions}

`clickhouse-local`을 사용하여 다양한 형식 간의 데이터 변환을 수행할 수 있습니다. 예시:

```bash
$ clickhouse-local --input-format JSONLines --output-format CSV --query "SELECT * FROM table" < data.json > data.csv
```

형식은 파일 확장에서 자동으로 감지됩니다:

```bash
$ clickhouse-local --query "SELECT * FROM table" < data.json > data.csv
```

단축키로, `--copy` 인수를 사용하여 작성할 수 있습니다:
```bash
$ clickhouse-local --copy < data.json > data.csv
```

## 사용법 {#usage}

기본적으로 `clickhouse-local`은 동일한 호스트의 ClickHouse 서버 데이터에 접근할 수 있으며, 서버 구성에 의존하지 않습니다. 또한 `--config-file` 인수를 사용하여 서버 구성을 로드하는 것을 지원합니다. 임시 데이터의 경우, 기본적으로 고유한 임시 데이터 디렉터리가 생성됩니다.

기본 사용법 (리눅스):

```bash
$ clickhouse-local --structure "table_structure" --input-format "format_of_incoming_data" --query "query"
```

기본 사용법 (맥):

```bash
$ ./clickhouse local --structure "table_structure" --input-format "format_of_incoming_data" --query "query"
```

:::note
`clickhouse-local`은 WSL2를 통해 Windows에서도 지원됩니다.
:::

인수:

- `-S`, `--structure` — 입력 데이터에 대한 테이블 구조.
- `--input-format` — 입력 형식, 기본값은 `TSV`.
- `-F`, `--file` — 데이터 경로, 기본값은 `stdin`.
- `-q`, `--query` — 세미콜론을 구분자로 실행할 쿼리. `--query`는 여러 번 지정할 수 있으며, 예를 들어 `--query "SELECT 1" --query "SELECT 2"`와 같이 사용할 수 있습니다. `--queries-file`와 동시에 사용할 수 없습니다.
- `--queries-file` - 실행할 쿼리가 포함된 파일 경로. `--queries-file`은 여러 번 지정할 수 있으며, 예를 들어 `--query queries1.sql --query queries2.sql`과 같이 사용할 수 있습니다. `--query`와 동시에 사용할 수 없습니다.
- `--multiquery, -n` – 지정 시, 세미콜론으로 구분된 여러 쿼리를 `--query` 옵션 뒤에 나열할 수 있습니다. 편의상 `--query`를 생략하고 `--multiquery` 뒤에 쿼리를 직접 전달할 수도 있습니다.
- `-N`, `--table` — 출력 데이터를 저장할 테이블 이름, 기본값은 `table`.
- `-f`, `--format`, `--output-format` — 출력 형식, 기본값은 `TSV`.
- `-d`, `--database` — 기본 데이터베이스, 기본값은 `_local`.
- `--stacktrace` — 예외 발생 시 디버그 출력을 덤프할지 여부.
- `--echo` — 실행 전에 쿼리를 출력.
- `--verbose` — 쿼리 실행에 대한 자세한 내용.
- `--logger.console` — 콘솔에 로깅.
- `--logger.log` — 로그 파일 이름.
- `--logger.level` — 로그 수준.
- `--ignore-error` — 쿼리 실패 시 처리 중단하지 않음.
- `-c`, `--config-file` — ClickHouse 서버와 동일한 형식의 구성 파일 경로, 기본값은 빈 구성입니다.
- `--no-system-tables` — 시스템 테이블을 연결하지 않음.
- `--help` — `clickhouse-local`에 대한 인수 참조.
- `-V`, `--version` — 버전 정보를 출력하고 종료.

또한 `--config-file` 대신 일반적으로 더 많이 사용되는 각 ClickHouse 구성 변수에 대한 인수도 있습니다.

## 예제 {#examples}

```bash
$ echo -e "1,2\n3,4" | clickhouse-local --structure "a Int64, b Int64" \
    --input-format "CSV" --query "SELECT * FROM table"
Read 2 rows, 32.00 B in 0.000 sec., 5182 rows/sec., 80.97 KiB/sec.
1   2
3   4
```

이전 예는 다음과 동일합니다:

```bash
$ echo -e "1,2\n3,4" | clickhouse-local -n --query "
    CREATE TABLE table (a Int64, b Int64) ENGINE = File(CSV, stdin);
    SELECT a, b FROM table;
    DROP TABLE table;"
Read 2 rows, 32.00 B in 0.000 sec., 4987 rows/sec., 77.93 KiB/sec.
1   2
3   4
```

`stdin` 또는 `--file` 인수를 사용할 필요가 없으며, [`file` 테이블 함수](../../sql-reference/table-functions/file.md)를 사용하여 원하는 수의 파일을 열 수 있습니다:

```bash
$ echo 1 | tee 1.tsv
1

$ echo 2 | tee 2.tsv
2

$ clickhouse-local --query "
    select * from file('1.tsv', TSV, 'a int') t1
    cross join file('2.tsv', TSV, 'b int') t2"
1    2
```

이제 각 유닉스 사용자에 대한 메모리 사용량을 출력해 보겠습니다:

쿼리:

```bash
$ ps aux | tail -n +2 | awk '{ printf("%s\t%s\n", $1, $4) }' \
    | clickhouse-local --structure "user String, mem Float64" \
        --query "SELECT user, round(sum(mem), 2) as memTotal
            FROM table GROUP BY user ORDER BY memTotal DESC FORMAT Pretty"
```

결과:

```text
Read 186 rows, 4.15 KiB in 0.035 sec., 5302 rows/sec., 118.34 KiB/sec.
┏━━━━━━━━━━┳━━━━━━━━━━┓
┃ user     ┃ memTotal ┃
┡━━━━━━━━━━╇━━━━━━━━━━┩
│ bayonet  │    113.5 │
├──────────┼──────────┤
│ root     │      8.8 │
├──────────┼──────────┤
...
```

## 관련 콘텐츠 {#related-content-1}

- [clickhouse-local을 사용하여 로컬 파일에서 데이터 추출, 변환 및 쿼리하기](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)
- [ClickHouse로 데이터 가져오기 - 1부](https://clickhouse.com/blog/getting-data-into-clickhouse-part-1)
- [대규모 실제 데이터 세트 탐색: ClickHouse에서의 100년 이상의 날씨 기록](https://clickhouse.com/blog/real-world-data-noaa-climate-data)
- 블로그: [clickhouse-local을 사용하여 로컬 파일에서 데이터 추출, 변환 및 쿼리하기](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)
