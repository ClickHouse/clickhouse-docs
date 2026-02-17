---
description: '서버 없이 데이터를 처리하기 위한 clickhouse-local 사용 가이드'
sidebar_label: 'clickhouse-local'
sidebar_position: 60
slug: /operations/utilities/clickhouse-local
title: 'clickhouse-local'
doc_type: 'reference'
---



# clickhouse-local \{#clickhouse-local\}



## clickhouse-local과 ClickHouse를 언제 사용해야 하는지 \{#when-to-use-clickhouse-local-vs-clickhouse\}

`clickhouse-local`은 전체 데이터베이스 서버를 설치하지 않고도 SQL을 사용하여 로컬 및 원격 파일을 빠르게 처리해야 하는 개발자에게 적합한, 사용하기 쉬운 ClickHouse 버전입니다. `clickhouse-local`을 사용하면 개발자는 명령줄에서 직접 [ClickHouse SQL dialect](../../sql-reference/index.md)를 사용하는 SQL 명령을 실행할 수 있으므로, 전체 ClickHouse를 설치하지 않고도 ClickHouse 기능에 접근할 수 있는 간단하고 효율적인 방법을 제공합니다. `clickhouse-local`의 주요 이점 중 하나는 [clickhouse-client](/operations/utilities/clickhouse-local)를 설치할 때 이미 함께 포함된다는 점입니다. 따라서 개발자는 복잡한 설치 과정 없이도 `clickhouse-local`을 신속하게 사용하기 시작할 수 있습니다.

`clickhouse-local`은 개발 및 테스트 목적, 그리고 파일 처리에는 훌륭한 도구이지만, 최종 사용자나 애플리케이션에 직접 서비스를 제공하는 용도로는 적합하지 않습니다. 이러한 상황에서는 오픈 소스 [ClickHouse](/install)를 사용하는 것이 권장됩니다. ClickHouse는 대규모 분석 워크로드를 처리하도록 설계된 강력한 OLAP 데이터베이스입니다. 대용량 데이터셋에 대한 복잡한 쿼리를 빠르고 효율적으로 처리하므로, 고성능이 중요한 프로덕션 환경에서 사용하기에 적합합니다. 또한 ClickHouse는 대규모 데이터셋을 처리하고 애플리케이션에 서비스를 제공하기 위해 필수적인 복제(replication), 세그먼트(shard), 고가용성과 같은 다양한 기능을 제공합니다. 더 큰 데이터셋을 처리하거나 최종 사용자 및 애플리케이션에 서비스를 제공해야 하는 경우, `clickhouse-local` 대신 오픈 소스 ClickHouse 사용을 권장합니다.

[로컬 파일 쿼리](#query_data_in_file)나 [S3의 Parquet 파일 읽기](#query-data-in-a-parquet-file-in-aws-s3)와 같이 `clickhouse-local`의 예시 사용 사례를 보여 주는 아래 문서를 참고하십시오.



## clickhouse-local 다운로드 \{#download-clickhouse-local\}

`clickhouse-local`은 ClickHouse 서버와 `clickhouse-client`를 실행하는 것과 동일한 `clickhouse` 바이너리를 사용하여 실행합니다. 최신 버전을 다운로드하는 가장 쉬운 방법은 다음 명령어를 실행하는 것입니다:

```bash
curl https://clickhouse.com/ | sh
```

:::note
방금 다운로드한 이 바이너리는 다양한 ClickHouse 도구와 유틸리티를 실행할 수 있습니다. ClickHouse를 데이터베이스 서버로 실행하려면 [Quick Start](/get-started/quick-start)를 참고하십시오.
:::


## SQL을 사용하여 파일의 데이터 쿼리하기 \{#query_data_in_file\}

`clickhouse-local`의 일반적인 사용 예는 파일에 대해 애드훅(ad hoc) 쿼리를 실행하는 것입니다. 이때 데이터를 테이블에 삽입할 필요가 없습니다. `clickhouse-local`은 파일에서 데이터를 임시 테이블로 스트리밍하여 SQL을 실행할 수 있습니다.

파일이 `clickhouse-local`과 동일한 서버에 있다면, 로드할 파일만 지정하면 됩니다. 다음 `reviews.tsv` 파일에는 Amazon 상품 리뷰 샘플이 포함되어 있습니다:

```bash
./clickhouse local -q "SELECT * FROM 'reviews.tsv'"
```

이 명령은 다음 명령의 단축형입니다:

```bash
./clickhouse local -q "SELECT * FROM file('reviews.tsv')"
```

ClickHouse는 파일 이름의 확장자를 보고 해당 파일이 탭으로 구분된 형식을 사용한다는 것을 알아냅니다. 형식을 명시적으로 지정해야 하는 경우에는 [여러 ClickHouse 입력 형식](../../interfaces/formats.md) 중 하나를 추가하기만 하면 됩니다:

```bash
./clickhouse local -q "SELECT * FROM file('reviews.tsv', 'TabSeparated')"
```

`file` 테이블 함수는 테이블을 생성하며, `DESCRIBE`를 사용하여 추론된 스키마를 확인할 수 있습니다:

```bash
./clickhouse local -q "DESCRIBE file('reviews.tsv')"
```

:::tip
파일 이름에 glob 패턴을 사용할 수 있습니다(자세한 내용은 [glob substitutions](/sql-reference/table-functions/file.md/#globs-in-path)을(를) 참조하십시오).

예:

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

가장 평점이 높은 상품을 찾아보겠습니다.

```bash
./clickhouse local -q "SELECT
    argMax(product_title,star_rating),
    max(star_rating)
FROM file('reviews.tsv')"
```

```response
Monopoly Junior Board Game    5
```


## AWS S3의 Parquet 파일에서 데이터 쿼리하기 \{#query-data-in-a-parquet-file-in-aws-s3\}

S3에 파일이 있는 경우 `clickhouse-local`과 `s3` 테이블 함수를 사용하여 데이터를 ClickHouse 테이블에 삽입하지 않고 해당 파일에 직접 쿼리를 실행할 수 있습니다. 공개 버킷에 `house_0.parquet`라는 파일이 있으며, 영국에서 판매된 부동산의 주택 가격 데이터가 포함되어 있습니다. 이 파일에 몇 개의 행이 있는지 확인해 보겠습니다:

```bash
./clickhouse local -q "
SELECT count()
FROM s3('https://datasets-documentation.s3.eu-west-3.amazonaws.com/house_parquet/house_0.parquet')"
```

이 파일에는 행이 270만 개 있습니다:

```response
2772030
```

파일에서 ClickHouse가 추론한 스키마를 확인해 보는 것은 항상 유용합니다.

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

어느 동네가 가장 비싼지 살펴보겠습니다:

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
파일을 ClickHouse에 삽입할 준비가 되면 ClickHouse 서버를 시작한 다음 `file` 및 `s3` 테이블 함수의 결과를 `MergeTree` 테이블에 삽입하십시오. 자세한 내용은 [Quick Start](/get-started/quick-start)를 참조하십시오.
:::


## 형식 변환 \{#format-conversions\}

`clickhouse-local`을 사용하여 서로 다른 형식 간에 데이터를 변환할 수 있습니다. 예를 들어:

```bash
$ clickhouse-local --input-format JSONLines --output-format CSV --query "SELECT * FROM table" < data.json > data.csv
```

형식은 파일 확장자를 통해 자동으로 감지됩니다:

```bash
$ clickhouse-local --query "SELECT * FROM table" < data.json > data.csv
```

간단히 `--copy` 인자를 사용하여 작성할 수 있습니다:

```bash
$ clickhouse-local --copy < data.json > data.csv
```


## 사용 방법 \{#usage\}

기본적으로 `clickhouse-local`은 동일한 호스트에 있는 ClickHouse 서버의 데이터에 접근할 수 있으며, 서버 설정에 의존하지 않습니다. 또한 `--config-file` 인수를 사용하여 서버 설정을 로드하는 것도 지원합니다. 임시 데이터는 기본적으로 고유한 임시 데이터 디렉터리가 생성됩니다.

기본 사용법(Linux):

```bash
$ clickhouse-local --structure "table_structure" --input-format "format_of_incoming_data" --query "query"
```

기본 사용(Mac):

```bash
$ ./clickhouse local --structure "table_structure" --input-format "format_of_incoming_data" --query "query"
```

:::note
`clickhouse-local`은 WSL2를 통해 Windows에서도 지원됩니다.
:::

Arguments:

* `-S`, `--structure` — 입력 데이터의 테이블 구조입니다.
* `--input-format` — 입력 포맷이며, 기본값은 `TSV`입니다.
* `-F`, `--file` — 데이터 경로이며, 기본값은 `stdin`입니다.
* `-q`, `--query` — `;`를 구분자로 사용하는 실행할 쿼리입니다. `--query`는 여러 번 지정할 수 있으며, 예를 들면 `--query "SELECT 1" --query "SELECT 2"`와 같이 사용할 수 있습니다. `--queries-file`과 동시에 사용할 수 없습니다.
* `--queries-file` - 실행할 쿼리가 들어 있는 파일 경로입니다. `--queries-file`은 여러 번 지정할 수 있으며, 예를 들면 `--query queries1.sql --query queries2.sql`과 같이 사용할 수 있습니다. `--query`와 동시에 사용할 수 없습니다.
* `--multiquery, -n` – 지정된 경우, 세미콜론으로 구분된 여러 개의 쿼리를 `--query` 옵션 뒤에 나열할 수 있습니다. 편의를 위해 `--query`를 생략하고 `--multiquery` 뒤에 쿼리를 바로 전달하는 것도 가능합니다.
* `-N`, `--table` — 출력 데이터를 저장할 테이블 이름이며, 기본값은 `table`입니다.
* `-f`, `--format`, `--output-format` — 출력 포맷이며, 기본값은 `TSV`입니다.
* `-d`, `--database` — 기본 데이터베이스이며, 기본값은 `_local`입니다.
* `--stacktrace` — 예외 발생 시 디버그 출력을 덤프할지 여부입니다.
* `--echo` — 실행 전에 쿼리를 출력합니다.
* `--verbose` — 쿼리 실행에 대한 더 많은 세부 정보를 출력합니다.
* `--logger.console` — 콘솔로 로그를 출력합니다.
* `--logger.log` — 로그 파일 이름입니다.
* `--logger.level` — 로그 레벨입니다.
* `--ignore-error` — 쿼리가 실패하더라도 처리를 중지하지 않습니다.
* `-c`, `--config-file` — ClickHouse 서버와 동일한 형식의 설정 파일 경로입니다. 기본적으로 설정은 비어 있습니다.
* `--no-system-tables` — 시스템 테이블을 연결하지 않습니다.
* `--help` — `clickhouse-local`에 대한 인자 설명을 출력합니다.
* `-V`, `--version` — 버전 정보를 출력하고 종료합니다.

또한 각 ClickHouse 설정 변수마다 `--config-file` 대신 더 일반적으로 사용되는 인자를 제공합니다.


## 예제 \{#examples\}

```bash
$ echo -e "1,2\n3,4" | clickhouse-local --structure "a Int64, b Int64" \
    --input-format "CSV" --query "SELECT * FROM table"
Read 2 rows, 32.00 B in 0.000 sec., 5182 rows/sec., 80.97 KiB/sec.
1   2
3   4
```

앞선 예제는 다음과 같습니다:

```bash
$ echo -e "1,2\n3,4" | clickhouse-local -n --query "
    CREATE TABLE table (a Int64, b Int64) ENGINE = File(CSV, stdin);
    SELECT a, b FROM table;
    DROP TABLE table;"
Read 2 rows, 32.00 B in 0.000 sec., 4987 rows/sec., 77.93 KiB/sec.
1   2
3   4
```

`stdin`이나 `--file` 인자를 사용할 필요 없이, [`file` table function](../../sql-reference/table-functions/file.md)을 사용해 원하는 만큼 많은 파일을 열 수 있습니다:

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

이제 각 Unix 사용자별 메모리 사용량을 출력해 보겠습니다:

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


## 관련 콘텐츠 \{#related-content-1\}

- [clickhouse-local을 사용하여 로컬 파일의 데이터 추출, 변환 및 쿼리하기](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)
- [ClickHouse로 데이터 가져오기 - 1부](https://clickhouse.com/blog/getting-data-into-clickhouse-part-1)
- [대규모 실세계 데이터 세트 탐색: ClickHouse로 살펴보는 100년 이상 기상 기록](https://clickhouse.com/blog/real-world-data-noaa-climate-data)
- 블로그: [clickhouse-local을 사용하여 로컬 파일의 데이터 추출, 변환 및 쿼리하기](https://clickhouse.com/blog/extracting-converting-querying-local-files-with-sql-clickhouse-local)
