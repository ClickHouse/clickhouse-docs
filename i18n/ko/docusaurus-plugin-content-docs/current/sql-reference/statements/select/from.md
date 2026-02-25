---
description: 'FROM 절 문서'
sidebar_label: 'FROM'
slug: /sql-reference/statements/select/from
title: 'FROM 절'
doc_type: 'reference'
---



# FROM 절 \{#from-clause\}

`FROM` 절은 데이터를 읽어 올 소스를 지정합니다:

* [테이블](../../../engines/table-engines/index.md)
* [서브쿼리](../../../sql-reference/statements/select/index.md)
* [테이블 함수](/sql-reference/table-functions)

[JOIN](../../../sql-reference/statements/select/join.md) 및 [ARRAY JOIN](../../../sql-reference/statements/select/array-join.md) 절을 사용하여 `FROM` 절의 기능을 확장할 수 있습니다.

서브쿼리는 `FROM` 절 안에서 괄호로 둘러싸여 지정할 수 있는 또 다른 `SELECT` 쿼리입니다.

`FROM` 절에는 여러 개의 데이터 소스를 쉼표로 구분하여 포함할 수 있으며, 이는 이들에 대해 [CROSS JOIN](../../../sql-reference/statements/select/join.md)을 수행하는 것과 동일합니다.

`FROM` 절은 선택적으로 `SELECT` 절 앞에 올 수 있습니다. 이는 표준 SQL을 확장한 ClickHouse 고유 기능으로, `SELECT` SQL 문을 더 읽기 쉽게 해줍니다. 예:

```sql
FROM table
SELECT *
```


## FINAL 수정자 \{#final-modifier\}

`FINAL`이 지정되면 ClickHouse는 결과를 반환하기 전에 데이터를 완전히 병합합니다. 이때 해당 테이블 엔진에서 병합 시 수행되는 모든 데이터 변환도 함께 수행합니다.

다음 테이블 엔진을 사용하는 테이블에서 데이터를 조회할 때 적용할 수 있습니다:

* `ReplacingMergeTree`
* `SummingMergeTree`
* `AggregatingMergeTree`
* `CollapsingMergeTree`
* `VersionedCollapsingMergeTree`

`FINAL`이 있는 `SELECT` 쿼리는 병렬로 실행됩니다. [max&#95;final&#95;threads](/operations/settings/settings#max_final_threads) 설정은 사용되는 스레드 수를 제한합니다.

### 단점 \{#drawbacks\}

`FINAL`을 사용하는 쿼리는 `FINAL`을 사용하지 않는 유사한 쿼리보다 약간 더 느리게 실행됩니다. 그 이유는 다음과 같습니다:

* 쿼리 실행 중에 데이터가 병합됩니다.
* `FINAL`이 있는 쿼리는 쿼리에서 지정한 컬럼 외에 기본 키 컬럼도 추가로 읽을 수 있습니다.

`FINAL`은 일반적으로 병합 시점에 발생하는 처리를 쿼리 시점에 메모리에서 수행해야 하므로, 추가적인 연산 및 메모리 리소스가 필요합니다. 그러나 정확한 결과를 생성하기 위해(데이터가 아직 완전히 병합되지 않았을 수 있으므로) `FINAL`을 사용해야 하는 경우가 있습니다. 병합을 강제로 수행하기 위해 `OPTIMIZE`를 실행하는 것보다는 비용이 적게 듭니다.

`FINAL`을 사용하는 대신, `MergeTree` 엔진의 백그라운드 프로세스가 아직 수행되지 않았음을 전제로 하고 이를 집계를 적용하여 처리하는(예를 들어 중복을 제거하는) 다른 쿼리를 사용하는 것이 가능할 때도 있습니다. 필요한 결과를 얻기 위해 쿼리에서 `FINAL`을 사용해야 한다면 사용해도 되지만, 그로 인해 추가 처리가 필요하다는 점을 인지해야 합니다.

`FINAL`은 세션이나 사용자 프로필에서 [FINAL](../../../operations/settings/settings.md#final) 설정을 사용하여 쿼리 내 모든 테이블에 자동으로 적용할 수 있습니다.

### 사용 예시 \{#example-usage\}

`FINAL` 키워드 사용

```sql
SELECT x, y FROM mytable FINAL WHERE x > 1;
```

`FINAL`을 쿼리 단위 설정으로 사용하기

```sql
SELECT x, y FROM mytable WHERE x > 1 SETTINGS final = 1;
```

`FINAL`을 세션 수준 설정으로 사용하기

```sql
SET final = 1;
SELECT x, y FROM mytable WHERE x > 1;
```


## 구현 세부사항 \{#implementation-details\}

`FROM` 절을 생략하면 `system.one` 테이블에서 데이터를 읽습니다.
`system.one` 테이블에는 정확히 하나의 행만 포함되어 있습니다(이 테이블은 다른 DBMS에서 사용하는 DUAL 테이블과 동일한 역할을 합니다).

쿼리를 실행하면 쿼리에 나열된 모든 컬럼이 해당 테이블에서 추출됩니다. 외부 쿼리에 필요하지 않은 컬럼은 서브쿼리에서 제거됩니다.
쿼리에 어떤 컬럼도 명시되지 않은 경우(예를 들어 `SELECT count() FROM t`), 행 개수를 계산하기 위해 테이블에서 컬럼 하나를 어쨌든 추출하며, 이때 가능한 한 가장 작은 컬럼을 우선 선택합니다.
