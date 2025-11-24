---
'title': '쿼리 성능 - 시간 시리즈'
'sidebar_label': '쿼리 성능'
'description': '시간 시리즈 쿼리 성능 개선하기'
'slug': '/use-cases/time-series/query-performance'
'keywords':
- 'time-series'
- 'query performance'
- 'optimization'
- 'indexing'
- 'partitioning'
- 'query tuning'
- 'performance'
'show_related_blogs': true
'doc_type': 'guide'
---


# 시간 시리즈 쿼리 성능

저장소를 최적화한 후 다음 단계는 쿼리 성능 개선입니다.
이 섹션에서는 두 가지 주요 기술을 탐구합니다: `ORDER BY` 키 최적화 및 물리화된 뷰 사용.
이러한 접근 방식이 쿼리 시간을 초 단위에서 밀리초 단위로 줄일 수 있는 방법을 살펴보겠습니다.

## `ORDER BY` 키 최적화 {#time-series-optimize-order-by}

다른 최적화를 시도하기 전에, ClickHouse가 가능한 한 빠른 결과를 생성할 수 있도록 정렬 키를 최적화해야 합니다.
올바른 키 선택은 주로 실행할 쿼리에 따라 다릅니다. 대부분의 쿼리가 `project` 및 `subproject` 컬럼으로 필터링된다고 가정해 보겠습니다.
이 경우, `time` 컬럼과 함께 이들을 정렬 키에 추가하는 것이 좋습니다. 왜냐하면 시간에 따라 쿼리를 실행하기 때문입니다.

`wikistat`와 동일한 컬럼 유형을 가지며 `(project, subproject, time)`으로 정렬된 또 다른 버전의 테이블을 만들어 보겠습니다.

```sql
CREATE TABLE wikistat_project_subproject
(
    `time` DateTime,
    `project` String,
    `subproject` String,
    `path` String,
    `hits` UInt64
)
ENGINE = MergeTree
ORDER BY (project, subproject, time);
```

이제 여러 쿼리를 비교하여 우리의 정렬 키 표현이 성능에 얼마나 중요한지 확인해 보겠습니다. 이전의 데이터 타입 및 코덱 최적화를 적용하지 않았으므로, 쿼리 성능 차이는 정렬 순서에만 기반합니다.

<table>
    <thead>
        <tr>
            <th  style={{ width: '36%' }}>쿼리</th>
            <th style={{ textAlign: 'right', width: '32%' }}>`(time)`</th>
            <th style={{ textAlign: 'right', width: '32%' }}>`(project, subproject, time)`</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td>
```sql
SELECT project, sum(hits) AS h
FROM wikistat
GROUP BY project
ORDER BY h DESC
LIMIT 10;
```
            </td>
            <td style={{ textAlign: 'right' }}>2.381 초</td>
            <td style={{ textAlign: 'right' }}>1.660 초</td>
        </tr>

        <tr>
            <td>
```sql
SELECT subproject, sum(hits) AS h
FROM wikistat
WHERE project = 'it'
GROUP BY subproject
ORDER BY h DESC
LIMIT 10;
```
            </td>
            <td style={{ textAlign: 'right' }}>2.148 초</td>
            <td style={{ textAlign: 'right' }}>0.058 초</td>
        </tr>
      
        <tr>
            <td>
```sql
SELECT toStartOfMonth(time) AS m, sum(hits) AS h
FROM wikistat
WHERE (project = 'it') AND (subproject = 'zero')
GROUP BY m
ORDER BY m DESC
LIMIT 10;
```
            </td>
            <td style={{ textAlign: 'right' }}>2.192 초</td>
            <td style={{ textAlign: 'right' }}>0.012 초</td>
        </tr>

        <tr>
            <td>
```sql
SELECT path, sum(hits) AS h
FROM wikistat
WHERE (project = 'it') AND (subproject = 'zero')
GROUP BY path
ORDER BY h DESC
LIMIT 10;
```
            </td>
            <td style={{ textAlign: 'right' }}>2.968 초</td>
            <td style={{ textAlign: 'right' }}>0.010 초</td>
        </tr>
    </tbody>
</table>

## 물리화된 뷰 {#time-series-materialized-views}

또 다른 옵션은 물리화된 뷰를 사용하여 자주 실행되는 쿼리의 결과를 집계하고 저장하는 것입니다. 이러한 결과는 원본 테이블 대신 쿼리할 수 있습니다. 만약 다음 쿼리가 우리 경우에 자주 실행된다고 가정해 보겠습니다:

```sql
SELECT path, SUM(hits) AS v
FROM wikistat
WHERE toStartOfMonth(time) = '2015-05-01'
GROUP BY path
ORDER BY v DESC
LIMIT 10
```

```text
┌─path──────────────────┬────────v─┐
│ -                     │ 89650862 │
│ Angelsberg            │ 19165753 │
│ Ana_Sayfa             │  6368793 │
│ Academy_Awards        │  4901276 │
│ Accueil_(homonymie)   │  3805097 │
│ Adolf_Hitler          │  2549835 │
│ 2015_in_spaceflight   │  2077164 │
│ Albert_Einstein       │  1619320 │
│ 19_Kids_and_Counting  │  1430968 │
│ 2015_Nepal_earthquake │  1406422 │
└───────────────────────┴──────────┘

10 rows in set. Elapsed: 2.285 sec. Processed 231.41 million rows, 9.22 GB (101.26 million rows/s., 4.03 GB/s.)
Peak memory usage: 1.50 GiB.
```

### 물리화된 뷰 만들기 {#time-series-create-materialized-view}

다음과 같은 물리화된 뷰를 만들 수 있습니다:

```sql
CREATE TABLE wikistat_top
(
    `path` String,
    `month` Date,
    hits UInt64
)
ENGINE = SummingMergeTree
ORDER BY (month, hits);
```

```sql
CREATE MATERIALIZED VIEW wikistat_top_mv 
TO wikistat_top
AS
SELECT
    path,
    toStartOfMonth(time) AS month,
    sum(hits) AS hits
FROM wikistat
GROUP BY path, month;
```

### 대상 테이블 백필 {#time-series-backfill-destination-table}

이 대상 테이블은 `wikistat` 테이블에 새 레코드가 삽입될 때만 채워지므로, [백필링](https://docs/data-modeling/backfilling)을 수행해야 합니다.

이를 수행하는 가장 쉬운 방법은 [`INSERT INTO SELECT`](../../sql-reference/statements/insert-into#inserting-the-results-of-select) 문을 사용하여 물리화된 뷰의 대상 테이블에 직접 삽입하는 것입니다. 이때 뷰의 `SELECT` 쿼리(변환)를 사용합니다:

```sql
INSERT INTO wikistat_top
SELECT
    path,
    toStartOfMonth(time) AS month,
    sum(hits) AS hits
FROM wikistat
GROUP BY path, month;
```

원본 데이터 세트의 카디널리티에 따라(우리는 10억 행이 있습니다!) 이 접근 방식은 메모리를 많이 사용할 수 있습니다. 대안으로 최소한의 메모리만 요구하는 변형을 사용할 수 있습니다:

* Null 테이블 엔진을 사용하여 임시 테이블 생성
* 일반적으로 사용되는 물리화된 뷰의 복사본을 해당 임시 테이블에 연결
* `INSERT INTO SELECT` 쿼리를 사용하여 원본 데이터 세트의 모든 데이터를 해당 임시 테이블로 복사
* 임시 테이블과 임시 물리화된 뷰 삭제

이 접근 방식에서는 원본 데이터 세트의 행이 블록 단위로 임시 테이블에 복사되고(이 행을 저장하지 않음), 각 행 블록에 대해 부분 상태가 계산되어 대상 테이블에 기록되며, 이러한 상태는 백그라운드에서 점진적으로 병합됩니다.

```sql
CREATE TABLE wikistat_backfill
(
    `time` DateTime,
    `project` String,
    `subproject` String,
    `path` String,
    `hits` UInt64
)
ENGINE = Null;
```

다음으로, `wikistat_backfill`에서 읽고 `wikistat_top`으로 쓰기 위한 물리화된 뷰를 만들겠습니다.

```sql
CREATE MATERIALIZED VIEW wikistat_backfill_top_mv 
TO wikistat_top
AS
SELECT
    path,
    toStartOfMonth(time) AS month,
    sum(hits) AS hits
FROM wikistat_backfill
GROUP BY path, month;
```

그리고 마지막으로, 초기 `wikistat` 테이블에서 `wikistat_backfill`을 채우겠습니다:

```sql
INSERT INTO wikistat_backfill
SELECT * 
FROM wikistat;
```

쿼리가 완료되면 백필 테이블과 물리화된 뷰를 삭제할 수 있습니다:

```sql
DROP VIEW wikistat_backfill_top_mv;
DROP TABLE wikistat_backfill;
```

이제 원본 테이블 대신 물리화된 뷰를 쿼리할 수 있습니다:

```sql
SELECT path, sum(hits) AS hits
FROM wikistat_top
WHERE month = '2015-05-01'
GROUP BY ALL
ORDER BY hits DESC
LIMIT 10;
```

```text
┌─path──────────────────┬─────hits─┐
│ -                     │ 89543168 │
│ Angelsberg            │  7047863 │
│ Ana_Sayfa             │  5923985 │
│ Academy_Awards        │  4497264 │
│ Accueil_(homonymie)   │  2522074 │
│ 2015_in_spaceflight   │  2050098 │
│ Adolf_Hitler          │  1559520 │
│ 19_Kids_and_Counting  │   813275 │
│ Andrzej_Duda          │   796156 │
│ 2015_Nepal_earthquake │   726327 │
└───────────────────────┴──────────┘

10 rows in set. Elapsed: 0.004 sec.
```

여기서 성능 개선은 극적입니다.
이 쿼리의 답변을 계산하는 데 이전에는 2초 이상 걸렸으나, 이제는 4밀리초만 소요됩니다.
