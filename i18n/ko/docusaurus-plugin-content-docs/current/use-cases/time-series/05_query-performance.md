---
title: '쿼리 성능 - 시계열'
sidebar_label: '쿼리 성능'
description: '시계열 쿼리 성능 향상'
slug: /use-cases/time-series/query-performance
keywords: ['시계열', '쿼리 성능', '최적화', '인덱싱', '파티셔닝', '쿼리 튜닝', '성능']
show_related_blogs: true
doc_type: 'guide'
---

# 시계열 쿼리 성능 \{#time-series-query-performance\}

스토리지를 최적화한 다음에는 쿼리 성능을 향상해야 합니다.
이 섹션에서는 두 가지 핵심 기법인 `ORDER BY` 키 최적화와 materialized view 사용을 살펴봅니다.
이러한 접근 방식이 쿼리 시간을 초 단위에서 밀리초 단위로 단축하는 데 어떤 도움이 되는지 살펴봅니다.

## `ORDER BY` 키 최적화 \{#time-series-optimize-order-by\}

다른 최적화를 시도하기 전에 ClickHouse가 가능한 한 가장 빠르게 결과를 반환하도록 ORDER BY 키를 먼저 최적화해야 합니다.
적절한 키 선택은 주로 실행하려는 쿼리에 따라 달라집니다. 대부분의 쿼리가 `project` 및 `subproject` 컬럼으로 필터링된다고 가정해 보겠습니다.
이 경우 정렬 키에 이 컬럼들을 추가하는 것이 좋으며, 시간 기준으로도 쿼리하므로 `time` 컬럼도 함께 포함하는 것이 좋습니다.

`wikistat`와 동일한 컬럼 타입을 가지되 `(project, subproject, time)`으로 정렬되는 또 다른 버전의 테이블을 생성해 보겠습니다.

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

이제 여러 쿼리를 비교해 보면서 정렬 키 표현식이 성능에 얼마나 중요한지 살펴보겠습니다. 앞에서 사용했던 데이터 타입 및 코덱 최적화는 적용하지 않았으므로, 쿼리 간 성능 차이는 모두 정렬 순서에만 기인합니다.

<table>
  <thead>
    <tr>
      <th style={{ width: '36%' }}>쿼리</th>
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

      <td style={{ textAlign: 'right' }}>2.381초</td>
      <td style={{ textAlign: 'right' }}>1.660초</td>
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

      <td style={{ textAlign: 'right' }}>2.148초</td>
      <td style={{ textAlign: 'right' }}>0.058초</td>
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

      <td style={{ textAlign: 'right' }}>2.192초</td>
      <td style={{ textAlign: 'right' }}>0.012초</td>
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

      <td style={{ textAlign: 'right' }}>2.968초</td>
      <td style={{ textAlign: 'right' }}>0.010초</td>
    </tr>
  </tbody>
</table>

## materialized view \{#time-series-materialized-views\}

또 다른 옵션은 materialized view를 사용하여 자주 사용되는 쿼리의 결과를 집계하고 저장하는 것입니다. 이렇게 저장된 결과를 원본 테이블 대신 조회할 수 있습니다. 예를 들어, 다음과 같은 쿼리가 우리의 사례에서 상당히 자주 실행된다고 가정합니다:

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

### materialized view 생성하기 \{#time-series-create-materialized-view\}

다음과 같은 materialized view를 생성할 수 있습니다:

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

### 대상 테이블 백필 작업 \{#time-series-backfill-destination-table\}

이 대상 테이블은 `wikistat` 테이블에 새로운 레코드가 삽입될 때만 채워지므로, [백필(backfilling)](/docs/data-modeling/backfilling)을 수행해야 합니다.

가장 쉬운 방법은 [`INSERT INTO SELECT`](/docs/sql-reference/statements/insert-into#inserting-the-results-of-select) SQL 문을 사용하여 materialized view의 대상 테이블에 직접 삽입하는 것입니다. 이때 view의 `SELECT` 쿼리(변환)를 [이용하여](https://github.com/ClickHouse/examples/tree/main/ClickHouse_vs_ElasticSearch/DataAnalytics#variant-1---directly-inserting-into-the-target-table-by-using-the-materialized-views-transformation-query) 삽입합니다.

```sql
INSERT INTO wikistat_top
SELECT
    path,
    toStartOfMonth(time) AS month,
    sum(hits) AS hits
FROM wikistat
GROUP BY path, month;
```

원시 데이터 세트의 카디널리티(여기서는 행이 10억 개입니다!)에 따라 이 방법은 메모리를 많이 사용할 수 있습니다. 대신, 최소한의 메모리만 사용하는 다른 방법을 사용할 수 있습니다:

* Null table engine을 사용하는 임시 테이블 생성
* 일반적으로 사용하던 materialized view의 복사본을 해당 임시 테이블에 연결
* `INSERT INTO SELECT` 쿼리를 사용해 원시 데이터 세트의 모든 데이터를 임시 테이블로 복사
* 임시 테이블과 임시 materialized view 삭제

이 방법에서는 원시 데이터 세트의 행이 블록 단위로 임시 테이블로 복사되지만(이 임시 테이블은 이러한 행을 실제로 저장하지 않습니다), 각 행 블록마다 부분 상태(partial state)가 계산되어 대상 테이블에 기록되고, 이 상태들이 백그라운드에서 점진적으로 병합됩니다.

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

다음으로 `wikistat_backfill`에서 데이터를 읽어 `wikistat_top`에 쓰는 materialized view를 생성합니다.

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

이제 마지막으로, 초기 `wikistat` 테이블에서 데이터를 가져와 `wikistat_backfill` 테이블을 채웁니다:

```sql
INSERT INTO wikistat_backfill
SELECT * 
FROM wikistat;
```

해당 쿼리가 완료되면 백필에 사용한 테이블과 materialized view를 삭제할 수 있습니다.

```sql
DROP VIEW wikistat_backfill_top_mv;
DROP TABLE wikistat_backfill;
```

이제 원본 테이블 대신 materialized view를 대상으로 쿼리를 실행할 수 있습니다:

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

여기서는 성능 향상이 비약적입니다.
이전에는 이 쿼리의 결과를 계산하는 데 2초가 조금 넘게 걸렸지만, 이제는 4밀리초면 됩니다.
