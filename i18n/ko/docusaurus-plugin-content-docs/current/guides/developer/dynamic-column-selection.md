---
'slug': '/guides/developer/dynamic-column-selection'
'sidebar_label': '동적 컬럼 선택'
'title': '동적 컬럼 선택'
'description': 'ClickHouse에서 대체 쿼리 언어 사용'
'doc_type': 'guide'
'keywords':
- 'dynamic column selection'
- 'regular expressions'
- 'APPLY modifier'
- 'advanced queries'
- 'developer guide'
---

[동적 컬럼 선택](/docs/sql-reference/statements/select#dynamic-column-selection)은 각 컬럼의 이름을 개별적으로 지정하는 대신 정규 표현식을 사용하여 컬럼을 선택할 수 있는 강력하지만 제대로 활용되지 않는 ClickHouse 기능입니다. 또한 `APPLY` 수식어를 사용하여 일치하는 컬럼에 함수를 적용할 수 있어 데이터 분석 및 변환 작업에 매우 유용합니다.

우리는 [New York taxis dataset](/docs/getting-started/example-datasets/nyc-taxi)의 도움을 받아 이 기능을 사용하는 방법을 배우게 될 것이며, 이 데이터셋은 [ClickHouse SQL playground](https://sql.clickhouse.com?query=LS0gRGF0YXNldCBjb250YWluaW5nIHRheGkgcmlkZSBkYXRhIGluIE5ZQyBmcm9tIDIwMDkuIE1vcmUgaW5mbyBoZXJlOiBodHRwczovL2NsaWNraG91c2UuY29tL2RvY3MvZW4vZ2V0dGluZy1zdGFydGVkL2V4YW1wbGUtZGF0YXNldHMvbnljLXRheGkKU0VMRUNUICogRlJPTSBueWNfdGF4aS50cmlwcyBMSU1JVCAxMDA)에서도 찾을 수 있습니다.

<iframe width="768" height="432" src="https://www.youtube.com/embed/moabRqqHNo4?si=jgmInV-u3UxtLvMS" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>

## 패턴과 일치하는 컬럼 선택하기 {#selecting-columns}

가장 일반적인 시나리오부터 시작해 봅시다: NYC 택시 데이터셋에서 `_amount`가 포함된 컬럼만 선택합니다. 각 컬럼 이름을 수동으로 입력하는 대신 정규 표현식과 함께 `COLUMNS` 표현식을 사용할 수 있습니다:

```sql
FROM nyc_taxi.trips
SELECT COLUMNS('.*_amount')
LIMIT 10;
```

> [SQL playground에서 이 쿼리 시도하기](https://sql.clickhouse.com?query=U0VMRUNUIENPTFVNTlMoJy4qX2Ftb3VudCcpCkZST00gbnljX3RheGkudHJpcHMKTElNSVQgMTA7&run_query=true)

이 쿼리는 이름이 `.*_amount` 패턴과 일치하는 컬럼에 대해 첫 10개 행을 반환합니다 (어떤 문자든 "_amount" 다음에 오는 경우).

```text
    ┌─fare_amount─┬─tip_amount─┬─tolls_amount─┬─total_amount─┐
 1. │           9 │          0 │            0 │          9.8 │
 2. │           9 │          0 │            0 │          9.8 │
 3. │         3.5 │          0 │            0 │          4.8 │
 4. │         3.5 │          0 │            0 │          4.8 │
 5. │         3.5 │          0 │            0 │          4.3 │
 6. │         3.5 │          0 │            0 │          4.3 │
 7. │         2.5 │          0 │            0 │          3.8 │
 8. │         2.5 │          0 │            0 │          3.8 │
 9. │           5 │          0 │            0 │          5.8 │
10. │           5 │          0 │            0 │          5.8 │
    └─────────────┴────────────┴──────────────┴──────────────┘
```

`fee` 또는 `tax` 용어가 포함된 컬럼도 반환하고 싶다고 가정해 보겠습니다. 우리는 정규 표현식을 수정하여 이를 포함시킬 수 있습니다:

```sql
SELECT COLUMNS('.*_amount|fee|tax')
FROM nyc_taxi.trips
ORDER BY rand() 
LIMIT 3;
```

> [SQL playground에서 이 쿼리 시도하기](https://sql.clickhouse.com?query=U0VMRUNUIENPTFVNTlMoJy4qX2Ftb3VudHxmZWV8dGF4JykKRlJPTSBueWNfdGF4aS50cmlwcwpPUkRFUiBCWSByYW5kKCkgCkxJTUlUIDM7&run_query=true)

```text
   ┌─fare_amount─┬─mta_tax─┬─tip_amount─┬─tolls_amount─┬─ehail_fee─┬─total_amount─┐
1. │           5 │     0.5 │          1 │            0 │         0 │          7.8 │
2. │        12.5 │     0.5 │          0 │            0 │         0 │         13.8 │
3. │         4.5 │     0.5 │       1.66 │            0 │         0 │         9.96 │
   └─────────────┴─────────┴────────────┴──────────────┴───────────┴──────────────┘
```

## 여러 패턴 선택하기 {#selecting-multiple-patterns}

하나의 쿼리에서 여러 컬럼 패턴을 결합할 수도 있습니다:

```sql
SELECT 
    COLUMNS('.*_amount'),
    COLUMNS('.*_date.*')
FROM nyc_taxi.trips
LIMIT 5;
```

> [SQL playground에서 이 쿼리 시도하기](https://sql.clickhouse.com?query=U0VMRUNUIAogICAgQ09MVU1OUygnLipfYW1vdW50JyksCiAgICBDT0xVTU5TKCcuKl9kYXRlLionKQpGUk9NIG55Y190YXhpLnRyaXBzCkxJTUlUIDU7&run_query=true)

```text
   ┌─fare_amount─┬─tip_amount─┬─tolls_amount─┬─total_amount─┬─pickup_date─┬─────pickup_datetime─┬─dropoff_date─┬────dropoff_datetime─┐
1. │           9 │          0 │            0 │          9.8 │  2001-01-01 │ 2001-01-01 00:01:48 │   2001-01-01 │ 2001-01-01 00:15:47 │
2. │           9 │          0 │            0 │          9.8 │  2001-01-01 │ 2001-01-01 00:01:48 │   2001-01-01 │ 2001-01-01 00:15:47 │
3. │         3.5 │          0 │            0 │          4.8 │  2001-01-01 │ 2001-01-01 00:02:08 │   2001-01-01 │ 2001-01-01 01:00:02 │
4. │         3.5 │          0 │            0 │          4.8 │  2001-01-01 │ 2001-01-01 00:02:08 │   2001-01-01 │ 2001-01-01 01:00:02 │
5. │         3.5 │          0 │            0 │          4.3 │  2001-01-01 │ 2001-01-01 00:02:26 │   2001-01-01 │ 2001-01-01 00:04:49 │
   └─────────────┴────────────┴──────────────┴──────────────┴─────────────┴─────────────────────┴──────────────┴─────────────────────┘
```

## 모든 컬럼에 함수 적용하기 {#applying-functions}

우리는 또한 [`APPLY`](/sql-reference/statements/select) 수식어를 사용하여 모든 컬럼에 함수를 적용할 수 있습니다. 예를 들어, 각 컬럼의 최대값을 찾고 싶다면 다음 쿼리를 실행할 수 있습니다:

```sql
SELECT COLUMNS('.*_amount|fee|tax') APPLY(max)
FROM nyc_taxi.trips;
```

> [SQL playground에서 이 쿼리 시도하기](https://sql.clickhouse.com?query=U0VMRUNUIENPTFVNTlMoJy4qX2Ftb3VudHxmZWV8dGF4JykgQVBQTFkobWF4KQpGUk9NIG55Y190YXhpLnRyaXBzOw&run_query=true)

```text
   ┌─max(fare_amount)─┬─max(mta_tax)─┬─max(tip_amount)─┬─max(tolls_amount)─┬─max(ehail_fee)─┬─max(total_amount)─┐
1. │           998310 │     500000.5 │       3950588.8 │           7999.92 │           1.95 │         3950611.5 │
   └──────────────────┴──────────────┴─────────────────┴───────────────────┴────────────────┴───────────────────┘
```

아니면 평균값을 보고 싶을 수도 있습니다:

```sql
SELECT COLUMNS('.*_amount|fee|tax') APPLY(avg)
FROM nyc_taxi.trips
```

> [SQL playground에서 이 쿼리 시도하기](https://sql.clickhouse.com?query=U0VMRUNUIENPTFVNTlMoJy4qX2Ftb3VudHxmZWV8dGF4JykgQVBQTFkoYXZnKQpGUk9NIG55Y190YXhpLnRyaXBzOw&run_query=true)

```text
   ┌─avg(fare_amount)─┬───────avg(mta_tax)─┬────avg(tip_amount)─┬──avg(tolls_amount)─┬──────avg(ehail_fee)─┬──avg(total_amount)─┐
1. │ 11.8044154834777 │ 0.4555942672733423 │ 1.3469850969211845 │ 0.2256511991414463 │ 3.37600560437412e-9 │ 14.423323722271563 │
   └──────────────────┴────────────────────┴────────────────────┴────────────────────┴─────────────────────┴────────────────────┘
```

이 값들은 소수점 자리가 많지만, 함수 연결을 통해 이를 해결할 수 있습니다. 이 경우, avg 함수를 적용한 다음 round 함수를 사용하겠습니다:

```sql
SELECT COLUMNS('.*_amount|fee|tax') APPLY(avg) APPLY(round)
FROM nyc_taxi.trips;
```

> [SQL playground에서 이 쿼리 시도하기](https://sql.clickhouse.com?query=U0VMRUNUIENPTFVNTlMoJy4qX2Ftb3VudHxmZWV8dGF4JykgQVBQTFkoYXZnKSBBUFBMWShyb3VuZCkKRlJPTSBueWNfdGF4aS50cmlwczs&run_query=true)

```text
   ┌─round(avg(fare_amount))─┬─round(avg(mta_tax))─┬─round(avg(tip_amount))─┬─round(avg(tolls_amount))─┬─round(avg(ehail_fee))─┬─round(avg(total_amount))─┐
1. │                      12 │                   0 │                      1 │                        0 │                     0 │                       14 │
   └─────────────────────────┴─────────────────────┴────────────────────────┴──────────────────────────┴───────────────────────┴──────────────────────────┘
```

그러나 이것은 평균을 정수로 반올림합니다. 2소수점으로 반올림하려면 이렇게 할 수 있습니다. `APPLY` 수식어는 함수 외에도 람다를 수용하므로, round 함수가 평균 값을 2소수점으로 반올림하도록 유연성을 제공합니다:

```sql
SELECT COLUMNS('.*_amount|fee|tax') APPLY(avg) APPLY(x -> round(x, 2))
FROM nyc_taxi.trips;
```

> [SQL playground에서 이 쿼리 시도하기](https://sql.clickhouse.com?query=U0VMRUNUIENPTFVNTlMoJy4qX2Ftb3VudHxmZWV8dGF4JykgQVBQTFkgYXZnIEFQUExZIHggLT4gcm91bmQoeCwgMikKRlJPTSBueWNfdGF4aS50cmlwcw&run_query=true)

```text
   ┌─round(avg(fare_amount), 2)─┬─round(avg(mta_tax), 2)─┬─round(avg(tip_amount), 2)─┬─round(avg(tolls_amount), 2)─┬─round(avg(ehail_fee), 2)─┬─round(avg(total_amount), 2)─┐
1. │                       11.8 │                   0.46 │                      1.35 │                        0.23 │                        0 │                       14.42 │
   └────────────────────────────┴────────────────────────┴───────────────────────────┴─────────────────────────────┴──────────────────────────┴─────────────────────────────┘
```

## 컬럼 교체하기 {#replacing-columns}

지금까지 잘 진행되고 있습니다. 하지만 한 값을 조정하고 다른 값은 그대로 두고 싶다고 가정해 봅시다. 예를 들어, 총 금액을 두 배로 늘리고 MTA 세금을 1.1로 나누고 싶을 수 있습니다. 이를 위해 [`REPLACE`](/sql-reference/statements/select) 수식어를 사용하여 한 컬럼을 교체하면서 다른 컬럼은 그대로 두도록 할 수 있습니다.

```sql
FROM nyc_taxi.trips 
SELECT 
  COLUMNS('.*_amount|fee|tax')
  REPLACE(
    total_amount*2 AS total_amount,
    mta_tax/1.1 AS mta_tax
  ) 
  APPLY(avg)
  APPLY(col -> round(col, 2));
```

> [SQL playground에서 이 쿼리 시도하기](https://sql.clickhouse.com?query=RlJPTSBueWNfdGF4aS50cmlwcyAKU0VMRUNUIAogIENPTFVNTlMoJy4qX2Ftb3VudHxmZWV8dGF4JykKICBSRVBMQUNFKAogICAgdG90YWxfYW1vdW50KjIgQVMgdG90YWxfYW1vdW50LAogICAgbXRhX3RheC8xLjEgQVMgbXRhX3RheAogICkgCiAgQVBQTFkoYXZnKQogIEFQUExZKGNvbCAtPiByb3VuZChjb2wsIDIpKTs&run_query=true)

```text
   ┌─round(avg(fare_amount), 2)─┬─round(avg(di⋯, 1.1)), 2)─┬─round(avg(tip_amount), 2)─┬─round(avg(tolls_amount), 2)─┬─round(avg(ehail_fee), 2)─┬─round(avg(mu⋯nt, 2)), 2)─┐
1. │                       11.8 │                     0.41 │                      1.35 │                        0.23 │                        0 │                    28.85 │
   └────────────────────────────┴──────────────────────────┴───────────────────────────┴─────────────────────────────┴──────────────────────────┴──────────────────────────┘
```

## 컬럼 제외하기 {#excluding-columns}

`EXCEPT` 수식어를 사용하여 필드를 제외할 수도 있습니다. 예를 들어 `tolls_amount` 컬럼을 제거하려면 다음 쿼리를 작성합니다:

```sql
FROM nyc_taxi.trips 
SELECT 
  COLUMNS('.*_amount|fee|tax') EXCEPT(tolls_amount)
  REPLACE(
    total_amount*2 AS total_amount,
    mta_tax/1.1 AS mta_tax
  ) 
  APPLY(avg)
  APPLY(col -> round(col, 2));
```

> [SQL playground에서 이 쿼리 시도하기](https://sql.clickhouse.com?query=RlJPTSBueWNfdGF4aS50cmlwcyAKU0VMRUNUIAogIENPTFVNTlMoJy4qX2Ftb3VudHxmZWV8dGF4JykgRVhDRVBUKHRvbGxzX2Ftb3VudCkKICBSRVBMQUNFKAogICAgdG90YWxfYW1vdW50KjIgQVMgdG90YWxfYW1vdW50LAogICAgbXRhX3RheC8xLjEgQVMgbXRhX3RheAogICkgCiAgQVBQTFkoYXZnKQogIEFQUExZKGNvbCAtPiByb3VuZChjb2wsIDIpKTs&run_query=true)

```text
   ┌─round(avg(fare_amount), 2)─┬─round(avg(di⋯, 1.1)), 2)─┬─round(avg(tip_amount), 2)─┬─round(avg(ehail_fee), 2)─┬─round(avg(mu⋯nt, 2)), 2)─┐
1. │                       11.8 │                     0.41 │                      1.35 │                        0 │                    28.85 │
   └────────────────────────────┴──────────────────────────┴───────────────────────────┴──────────────────────────┴──────────────────────────┘
```
