---
'description': '해커 뉴스 데이터가 포함된 28 백만 행의 데이터셋.'
'sidebar_label': 'Hacker news'
'slug': '/getting-started/example-datasets/hacker-news'
'title': 'Hacker News 데이터셋'
'doc_type': 'guide'
'keywords':
- 'example dataset'
- 'hacker news'
- 'sample data'
- 'text analysis'
- 'vector search'
---


# Hacker News 데이터셋

> 이 튜토리얼에서는 Hacker News 데이터를 CSV 및 Parquet 형식 모두에서 ClickHouse 테이블에 2800만 행 삽입하고, 데이터를 탐색하기 위한 간단한 쿼리를 실행합니다.

## CSV {#csv}

<VerticalStepper headerLevel="h3">

### CSV 다운로드 {#download}

데이터셋의 CSV 버전은 공용 [S3 버킷](https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz)에서 다운로드하거나 다음 명령어를 실행하여 다운로드할 수 있습니다:

```bash
wget https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz
```

4.6GB 크기와 2800만 행으로, 이 압축 파일은 다운로드하는 데 5-10분이 소요됩니다.

### 데이터 샘플링 {#sampling}

[`clickhouse-local`](/operations/utilities/clickhouse-local/)를 사용하면 사용자가 ClickHouse 서버를 배포하고 구성하지 않고도 로컬 파일에서 빠른 처리를 수행할 수 있습니다.

ClickHouse에 데이터를 저장하기 전에 clickhouse-local을 사용하여 파일을 샘플링해 보겠습니다. 
콘솔에서 다음을 실행하세요:

```bash
clickhouse-local
```

다음으로, 데이터를 탐색하기 위해 다음 명령어를 실행합니다:

```sql title="Query"
SELECT *
FROM file('hacknernews.csv.gz', CSVWithNames)
LIMIT 2
SETTINGS input_format_try_infer_datetimes = 0
FORMAT Vertical
```

```response title="Response"
Row 1:
──────
id:          344065
deleted:     0
type:        comment
by:          callmeed
time:        2008-10-26 05:06:58
text:        What kind of reports do you need?<p>ActiveMerchant just connects your app to a gateway for cc approval and processing.<p>Braintree has very nice reports on transactions and it's very easy to refund a payment.<p>Beyond that, you are dealing with Rails after all–it's pretty easy to scaffold out some reports from your subscriber base.
dead:        0
parent:      344038
poll:        0
kids:        []
url:
score:       0
title:
parts:       []
descendants: 0

Row 2:
──────
id:          344066
deleted:     0
type:        story
by:          acangiano
time:        2008-10-26 05:07:59
text:
dead:        0
parent:      0
poll:        0
kids:        [344111,344202,344329,344606]
url:         http://antoniocangiano.com/2008/10/26/what-arc-should-learn-from-ruby/
score:       33
title:       What Arc should learn from Ruby
parts:       []
descendants: 10
```

이 명령어에는 많은 미묘한 기능이 있습니다. 
[`file`](/sql-reference/functions/files/#file) 연산자는 로컬 디스크에서 파일을 읽게 해주며, `CSVWithNames` 형식만 지정하면 됩니다.
가장 중요한 것은 스키마가 파일 내용을 기반으로 자동으로 유추된다는 점입니다.
또한 `clickhouse-local`이 압축 파일을 읽을 수 있는 방법도 주목하세요. 확장에서 gzip 포맷을 유추하고 있습니다.
`Vertical` 형식은 각 컬럼의 데이터를 더 쉽게 볼 수 있도록 합니다.

### 스키마 유추로 데이터 로드하기 {#loading-the-data}

가장 간단하고 강력한 데이터 로딩 도구는 `clickhouse-client`: 기능이 풍부한 네이티브 명령줄 클라이언트입니다.
데이터를 로드하려면 다시 스키마 유추를 사용하여 ClickHouse가 컬럼의 타입을 결정하도록 할 수 있습니다.

다음 명령어를 실행해 원격 CSV 파일에서 데이터를 직접 삽입하도록 테이블을 생성합니다. [`url`](https://clickhouse.com/docs/en/sql-reference/table-functions/url) 함수를 통해 내용을 접근하므로 스키마가 자동으로 유추됩니다:

```sql
CREATE TABLE hackernews ENGINE = MergeTree ORDER BY tuple
(
) EMPTY AS SELECT * FROM url('https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz', 'CSVWithNames');
```

이 명령은 데이터에서 유추된 스키마를 사용하여 빈 테이블을 생성합니다.
[`DESCRIBE TABLE`](/sql-reference/statements/describe-table) 명령어를 사용하면 이러한 할당된 타입을 이해할 수 있습니다.

```sql title="Query"
DESCRIBE TABLE hackernews
```

```text title="Response"
┌─name────────┬─type─────────────────────┬
│ id          │ Nullable(Float64)        │
│ deleted     │ Nullable(Float64)        │
│ type        │ Nullable(String)         │
│ by          │ Nullable(String)         │
│ time        │ Nullable(String)         │
│ text        │ Nullable(String)         │
│ dead        │ Nullable(Float64)        │
│ parent      │ Nullable(Float64)        │
│ poll        │ Nullable(Float64)        │
│ kids        │ Array(Nullable(Float64)) │
│ url         │ Nullable(String)         │
│ score       │ Nullable(Float64)        │
│ title       │ Nullable(String)         │
│ parts       │ Array(Nullable(Float64)) │
│ descendants │ Nullable(Float64)        │
└─────────────┴──────────────────────────┴
```

이 테이블에 데이터를 삽입하려면 `INSERT INTO, SELECT` 명령을 사용하세요.
`url` 함수와 함께 사용하면 데이터가 URL에서 직접 스트리밍됩니다:

```sql
INSERT INTO hackernews SELECT *
FROM url('https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.csv.gz', 'CSVWithNames')
```

하나의 명령어로 ClickHouse에 2800만 행이 성공적으로 삽입되었습니다!

### 데이터 탐색 {#explore}

Hacker News 이야기를 샘플링하고 특정 컬럼을 아래 쿼리를 실행하여 조회하세요:

```sql title="Query"
SELECT
    id,
    title,
    type,
    by,
    time,
    url,
    score
FROM hackernews
WHERE type = 'story'
LIMIT 3
FORMAT Vertical
```

```response title="Response"
Row 1:
──────
id:    2596866
title:
type:  story
by:
time:  1306685152
url:
score: 0

Row 2:
──────
id:    2596870
title: WordPress capture users last login date and time
type:  story
by:    wpsnipp
time:  1306685252
url:   http://wpsnipp.com/index.php/date/capture-users-last-login-date-and-time/
score: 1

Row 3:
──────
id:    2596872
title: Recent college graduates get some startup wisdom
type:  story
by:    whenimgone
time:  1306685352
url:   http://articles.chicagotribune.com/2011-05-27/business/sc-cons-0526-started-20110527_1_business-plan-recession-college-graduates
score: 1
```

스키마 유추는 초기 데이터 탐색에 좋은 도구이지만, 이는 “최선의 노력”이며 데이터에 대해 최적의 스키마를 정의하는 장기적인 대체물은 아닙니다.

### 스키마 정의 {#define-a-schema}

즉각적인 최적화는 각 필드에 대한 타입을 정의하는 것입니다. 
시각 필드를 `DateTime` 타입으로 선언하는 것 외에도, 기존 데이터셋을 삭제한 후 아래 필드 각각에 대해 적절한 타입을 정의합니다.
ClickHouse에서 데이터의 기본 키 id는 `ORDER BY` 절을 통해 정의됩니다.

적절한 타입을 선택하고 `ORDER BY` 절에 포함할 컬럼을 선택하면 쿼리 속도와 압축을 개선하는 데 도움이 됩니다.

아래 쿼리를 실행하여 기존 스키마를 삭제하고 개선된 스키마를 생성합니다:

```sql title="Query"
DROP TABLE IF EXISTS hackernews;

CREATE TABLE hackernews
(
    `id` UInt32,
    `deleted` UInt8,
    `type` Enum('story' = 1, 'comment' = 2, 'poll' = 3, 'pollopt' = 4, 'job' = 5),
    `by` LowCardinality(String),
    `time` DateTime,
    `text` String,
    `dead` UInt8,
    `parent` UInt32,
    `poll` UInt32,
    `kids` Array(UInt32),
    `url` String,
    `score` Int32,
    `title` String,
    `parts` Array(UInt32),
    `descendants` Int32
)
    ENGINE = MergeTree
ORDER BY id
```

최적화된 스키마로 이제 로컬 파일 시스템에서 데이터를 삽입할 수 있습니다.
다시 `clickhouse-client`를 사용해 명시적 `INSERT INTO`로 파일을 삽입하세요.

```sql title="Query"
INSERT INTO hackernews FROM INFILE '/data/hacknernews.csv.gz' FORMAT CSVWithNames
```

### 샘플 쿼리 실행 {#run-sample-queries}

자신의 쿼리를 작성하기 위해 영감을 줄 몇 가지 샘플 쿼리를 아래에 제시합니다.

#### "ClickHouse" 주제가 Hacker News에 얼마나 널리 퍼져 있나요? {#how-pervasive}

점수 필드는 이야기에 대한 인기 지표를 제공하며, `id` 필드와 `||` 
연결 연산자를 사용하여 원래 게시물에 대한 링크를 생성할 수 있습니다.

```sql title="Query"
SELECT
    time,
    score,
    descendants,
    title,
    url,
    'https://news.ycombinator.com/item?id=' || toString(id) AS hn_url
FROM hackernews
WHERE (type = 'story') AND (title ILIKE '%ClickHouse%')
ORDER BY score DESC
LIMIT 5 FORMAT Vertical
```

```response title="Response"
Row 1:
──────
time:        1632154428
score:       519
descendants: 159
title:       ClickHouse, Inc.
url:         https://github.com/ClickHouse/ClickHouse/blob/master/website/blog/en/2021/clickhouse-inc.md
hn_url:      https://news.ycombinator.com/item?id=28595419

Row 2:
──────
time:        1614699632
score:       383
descendants: 134
title:       ClickHouse as an alternative to Elasticsearch for log storage and analysis
url:         https://pixeljets.com/blog/clickhouse-vs-elasticsearch/
hn_url:      https://news.ycombinator.com/item?id=26316401

Row 3:
──────
time:        1465985177
score:       243
descendants: 70
title:       ClickHouse – high-performance open-source distributed column-oriented DBMS
url:         https://clickhouse.yandex/reference_en.html
hn_url:      https://news.ycombinator.com/item?id=11908254

Row 4:
──────
time:        1578331410
score:       216
descendants: 86
title:       ClickHouse cost-efficiency in action: analyzing 500B rows on an Intel NUC
url:         https://www.altinity.com/blog/2020/1/1/clickhouse-cost-efficiency-in-action-analyzing-500-billion-rows-on-an-intel-nuc
hn_url:      https://news.ycombinator.com/item?id=21970952

Row 5:
──────
time:        1622160768
score:       198
descendants: 55
title:       ClickHouse: An open-source column-oriented database management system
url:         https://github.com/ClickHouse/ClickHouse
hn_url:      https://news.ycombinator.com/item?id=27310247
```

ClickHouse가 시간이 지남에 따라 더 많은 노이즈를 생성하고 있습니까? 여기서 `time` 필드를 
`DateTime`으로 정의하는 유용성이 드러나며, 적절한 데이터 타입을 사용하면 `toYYYYMM()` 함수를 사용할 수 있습니다:

```sql title="Query"
SELECT
   toYYYYMM(time) AS monthYear,
   bar(count(), 0, 120, 20)
FROM hackernews
WHERE (type IN ('story', 'comment')) AND ((title ILIKE '%ClickHouse%') OR (text ILIKE '%ClickHouse%'))
GROUP BY monthYear
ORDER BY monthYear ASC
```

```response title="Response"
┌─monthYear─┬─bar(count(), 0, 120, 20)─┐
│    201606 │ ██▎                      │
│    201607 │ ▏                        │
│    201610 │ ▎                        │
│    201612 │ ▏                        │
│    201701 │ ▎                        │
│    201702 │ █                        │
│    201703 │ ▋                        │
│    201704 │ █                        │
│    201705 │ ██                       │
│    201706 │ ▎                        │
│    201707 │ ▎                        │
│    201708 │ ▏                        │
│    201709 │ ▎                        │
│    201710 │ █▌                       │
│    201711 │ █▌                       │
│    201712 │ ▌                        │
│    201801 │ █▌                       │
│    201802 │ ▋                        │
│    201803 │ ███▏                     │
│    201804 │ ██▏                      │
│    201805 │ ▋                        │
│    201806 │ █▏                       │
│    201807 │ █▌                       │
│    201808 │ ▋                        │
│    201809 │ █▌                       │
│    201810 │ ███▌                     │
│    201811 │ ████                     │
│    201812 │ █▌                       │
│    201901 │ ████▋                    │
│    201902 │ ███                      │
│    201903 │ ▋                        │
│    201904 │ █                        │
│    201905 │ ███▋                     │
│    201906 │ █▏                       │
│    201907 │ ██▎                      │
│    201908 │ ██▋                      │
│    201909 │ █▋                       │
│    201910 │ █                        │
│    201911 │ ███                      │
│    201912 │ █▎                       │
│    202001 │ ███████████▋             │
│    202002 │ ██████▌                  │
│    202003 │ ███████████▋             │
│    202004 │ ███████▎                 │
│    202005 │ ██████▏                  │
│    202006 │ ██████▏                  │
│    202007 │ ███████▋                 │
│    202008 │ ███▋                     │
│    202009 │ ████                     │
│    202010 │ ████▌                    │
│    202011 │ █████▏                   │
│    202012 │ ███▋                     │
│    202101 │ ███▏                     │
│    202102 │ █████████                │
│    202103 │ █████████████▋           │
│    202104 │ ███▏                     │
│    202105 │ ████████████▋            │
│    202106 │ ███                      │
│    202107 │ █████▏                   │
│    202108 │ ████▎                    │
│    202109 │ ██████████████████▎      │
│    202110 │ ▏                        │
└───────────┴──────────────────────────┘
```

"ClickHouse"가 시간이 지남에 따라 인기가 증가하고 있는 것 같습니다.

#### ClickHouse 관련 기사에서 상위 댓글러는 누구인가요? {#top-commenters}

```sql title="Query"
SELECT
   by,
   count() AS comments
FROM hackernews
WHERE (type IN ('story', 'comment')) AND ((title ILIKE '%ClickHouse%') OR (text ILIKE '%ClickHouse%'))
GROUP BY by
ORDER BY comments DESC
LIMIT 5
```

```response title="Response"
┌─by──────────┬─comments─┐
│ hodgesrm    │       78 │
│ zX41ZdbW    │       45 │
│ manigandham │       39 │
│ pachico     │       35 │
│ valyala     │       27 │
└─────────────┴──────────┘
```

#### 어떤 댓글이 가장 많은 관심을 끌까요? {#comments-by-most-interest}

```sql title="Query"
SELECT
  by,
  sum(score) AS total_score,
  sum(length(kids)) AS total_sub_comments
FROM hackernews
WHERE (type IN ('story', 'comment')) AND ((title ILIKE '%ClickHouse%') OR (text ILIKE '%ClickHouse%'))
GROUP BY by
ORDER BY total_score DESC
LIMIT 5
```

```response title="Response"
┌─by───────┬─total_score─┬─total_sub_comments─┐
│ zX41ZdbW │        571  │              50    │
│ jetter   │        386  │              30    │
│ hodgesrm │        312  │              50    │
│ mechmind │        243  │              16    │
│ tosh     │        198  │              12    │
└──────────┴─────────────┴────────────────────┘
```

</VerticalStepper>

## Parquet {#parquet}

ClickHouse의 강점 중 하나는 다양한 [형식](/interfaces/formats)을 처리할 수 있는 능력입니다.
CSV는 꽤 이상적인 사용 사례를 나타내지만, 데이터 교환에는 가장 효율적이지 않습니다.

다음으로, 효율적인 컬럼 지향 형식인 Parquet 파일에서 데이터를 로드할 것입니다.

Parquet에는 ClickHouse가 준수해야 할 최소한의 타입이 있으며, 이 타입 정보는 형식 자체에 인코딩되어 있습니다.
Parquet 파일에 대한 타입 유추는 CSV 파일의 스키마와 약간 다르게 될 것입니다.

<VerticalStepper headerLevel="h3">

### 데이터 삽입 {#insert-the-data}

다음 쿼리를 실행하여 원격 데이터를 읽기 위해 url 함수를 다시 사용하여 Parquet 형식의 동일한 데이터를 읽습니다:

```sql
DROP TABLE IF EXISTS hackernews;

CREATE TABLE hackernews
ENGINE = MergeTree
ORDER BY id
SETTINGS allow_nullable_key = 1 EMPTY AS
SELECT *
FROM url('https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.parquet', 'Parquet')

INSERT INTO hackernews SELECT *
FROM url('https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.parquet', 'Parquet')
```

:::note Null 키와 Parquet
Parquet 형식의 조건으로 키가 `NULL`일 수 있음을 수용해야 하며,
실제로 데이터에서는 그렇지 않습니다.
:::

다음 명령어를 실행하여 유추된 스키마를 봅니다:

```sql title="Query"
┌─name────────┬─type───────────────────┬
│ id          │ Nullable(Int64)        │
│ deleted     │ Nullable(UInt8)        │
│ type        │ Nullable(String)       │
│ time        │ Nullable(Int64)        │
│ text        │ Nullable(String)       │
│ dead        │ Nullable(UInt8)        │
│ parent      │ Nullable(Int64)        │
│ poll        │ Nullable(Int64)        │
│ kids        │ Array(Nullable(Int64)) │
│ url         │ Nullable(String)       │
│ score       │ Nullable(Int32)        │
│ title       │ Nullable(String)       │
│ parts       │ Array(Nullable(Int64)) │
│ descendants │ Nullable(Int32)        │
└─────────────┴────────────────────────┴
```

CSV 파일과 마찬가지로, 선택한 타입에 대한 제어를 높이기 위해 스키마를 수동으로 지정하고 
s3에서 직접 데이터를 삽입할 수 있습니다:

```sql
CREATE TABLE hackernews
(
    `id` UInt64,
    `deleted` UInt8,
    `type` String,
    `author` String,
    `timestamp` DateTime,
    `comment` String,
    `dead` UInt8,
    `parent` UInt64,
    `poll` UInt64,
    `children` Array(UInt32),
    `url` String,
    `score` UInt32,
    `title` String,
    `parts` Array(UInt32),
    `descendants` UInt32
)
ENGINE = MergeTree
ORDER BY (type, author);

INSERT INTO hackernews
SELECT * FROM s3(
        'https://datasets-documentation.s3.eu-west-3.amazonaws.com/hackernews/hacknernews.parquet',
        'Parquet',
        'id UInt64,
         deleted UInt8,
         type String,
         by String,
         time DateTime,
         text String,
         dead UInt8,
         parent UInt64,
         poll UInt64,
         kids Array(UInt32),
         url String,
         score UInt32,
         title String,
         parts Array(UInt32),
         descendants UInt32');
```

### 쿼리 속도를 높이기 위해 스키핑 인덱스 추가 {#add-skipping-index}

"ClickHouse"를 언급한 댓글 수를 확인하기 위해 아래 쿼리를 실행하세요:

```sql title="Query"
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'ClickHouse');
```

```response title="Response"
#highlight-next-line
1 row in set. Elapsed: 0.843 sec. Processed 28.74 million rows, 9.75 GB (34.08 million rows/s., 11.57 GB/s.)
┌─count()─┐
│     516 │
└─────────┘
```

다음으로, 이 쿼리의 속도를 높이기 위해 "comment" 컬럼에 역 [인덱스](/engines/table-engines/mergetree-family/invertedindexes)를 생성할 것입니다.
소문자 댓글이 대소문자에 관계없이 용어를 찾기 위해 인덱싱된다는 점에 유의하세요.

인덱스를 생성하기 위해 다음 명령어를 실행합니다:

```sql
ALTER TABLE hackernews ADD INDEX comment_idx(lower(comment)) TYPE inverted;
ALTER TABLE hackernews MATERIALIZE INDEX comment_idx;
```

인덱스를 만드는 데 시간이 걸립니다(인덱스가 생성되었는지 확인하려면 시스템 테이블 `system.data_skipping_indices`를 사용하세요).

인덱스가 생성된 후 쿼리를 다시 실행하세요:

```sql title="Query"
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'clickhouse');
```

인덱스를 사용하여 쿼리가 이제 0.248초만 소요되고, 이전의 0.843초에서 줄어들었음을 확인하세요:

```response title="Response"
#highlight-next-line
1 row in set. Elapsed: 0.248 sec. Processed 4.54 million rows, 1.79 GB (18.34 million rows/s., 7.24 GB/s.)
┌─count()─┐
│    1145 │
└─────────┘
```

[`EXPLAIN`](/sql-reference/statements/explain) 절을 사용하면 이 인덱스 추가가 쿼리를 약 3.4배 개선한 이유를 이해할 수 있습니다.

```response text="Query"
EXPLAIN indexes = 1
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'clickhouse')
```

```response title="Response"
┌─explain─────────────────────────────────────────┐
│ Expression ((Projection + Before ORDER BY))     │
│   Aggregating                                   │
│     Expression (Before GROUP BY)                │
│       Filter (WHERE)                            │
│         ReadFromMergeTree (default.hackernews)  │
│         Indexes:                                │
│           PrimaryKey                            │
│             Condition: true                     │
│             Parts: 4/4                          │
│             Granules: 3528/3528                 │
│           Skip                                  │
│             Name: comment_idx                   │
│             Description: inverted GRANULARITY 1 │
│             Parts: 4/4                          │
│             Granules: 554/3528                  │
└─────────────────────────────────────────────────┘
```

인덱스가 상당히 많은 그라뉼을 건너뛰게 하여 쿼리를 빠르게 했음을 확인하세요.

이제 하나 또는 여러 용어를 효율적으로 검색하는 것도 가능합니다:

```sql title="Query"
SELECT count(*)
FROM hackernews
WHERE multiSearchAny(lower(comment), ['oltp', 'olap']);
```

```response title="Response"
┌─count()─┐
│    2177 │
└─────────┘
```

```sql title="Query"
SELECT count(*)
FROM hackernews
WHERE hasToken(lower(comment), 'avx') AND hasToken(lower(comment), 'sve');
```

```response
┌─count()─┐
│      22 │
└─────────┘
```

</VerticalStepper>
