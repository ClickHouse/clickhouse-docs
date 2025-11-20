---
'description': '이 함수는 값 `x`에 대한 빈도 히스토그램과 이 값들의 반복 비율 `y`를 구간 `[min_x, max_x]`에 걸쳐
  그립니다.'
'sidebar_label': 'sparkbar'
'sidebar_position': 187
'slug': '/sql-reference/aggregate-functions/reference/sparkbar'
'title': 'sparkbar'
'doc_type': 'reference'
---


# sparkbar

이 함수는 값 `x`에 대한 빈도 히스토그램과 이 값의 반복 비율 `y`를 구간 `[min_x, max_x]`에 대해 플롯합니다. 동일한 버킷에 해당하는 모든 `x`의 반복은 평균화되므로, 데이터는 사전 집계되어야 합니다. 음수 반복은 무시됩니다.

간격이 지정되지 않은 경우, 최소 `x`가 간격 시작으로 사용되며, 최대 `x`가 간격 끝으로 사용됩니다. 그렇지 않으면 간격 밖의 값은 무시됩니다.

**구문**

```sql
sparkbar(buckets[, min_x, max_x])(x, y)
```

**매개변수**

- `buckets` — 세그먼트 수. 유형: [정수](../../../sql-reference/data-types/int-uint.md).
- `min_x` — 간격 시작. 선택적 매개변수.
- `max_x` — 간격 끝. 선택적 매개변수.

**인수**

- `x` — 값이 있는 필드.
- `y` — 값의 빈도 필드.

**반환값**

- 빈도 히스토그램.

**예제**

쿼리:

```sql
CREATE TABLE spark_bar_data (`value` Int64, `event_date` Date) ENGINE = MergeTree ORDER BY event_date;

INSERT INTO spark_bar_data VALUES (1,'2020-01-01'), (3,'2020-01-02'), (4,'2020-01-02'), (-3,'2020-01-02'), (5,'2020-01-03'), (2,'2020-01-04'), (3,'2020-01-05'), (7,'2020-01-06'), (6,'2020-01-07'), (8,'2020-01-08'), (2,'2020-01-11');

SELECT sparkbar(9)(event_date,cnt) FROM (SELECT sum(value) as cnt, event_date FROM spark_bar_data GROUP BY event_date);

SELECT sparkbar(9, toDate('2020-01-01'), toDate('2020-01-10'))(event_date,cnt) FROM (SELECT sum(value) as cnt, event_date FROM spark_bar_data GROUP BY event_date);
```

결과:

```text
┌─sparkbar(9)(event_date, cnt)─┐
│ ▂▅▂▃▆█  ▂                    │
└──────────────────────────────┘

┌─sparkbar(9, toDate('2020-01-01'), toDate('2020-01-10'))(event_date, cnt)─┐
│ ▂▅▂▃▇▆█                                                                  │
└──────────────────────────────────────────────────────────────────────────┘
```

이 함수의 별명은 sparkBar입니다.
