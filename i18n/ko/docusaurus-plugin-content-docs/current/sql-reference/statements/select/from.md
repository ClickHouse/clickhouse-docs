---
'description': 'FROM 절에 대한 Documentation'
'sidebar_label': 'FROM'
'slug': '/sql-reference/statements/select/from'
'title': 'FROM 절'
'doc_type': 'reference'
---


# FROM 절

`FROM` 절은 데이터를 읽어올 출처를 지정합니다:

- [테이블](../../../engines/table-engines/index.md)
- [서브쿼리](../../../sql-reference/statements/select/index.md) 
- [테이블 함수](/sql-reference/table-functions)

[JOIN](../../../sql-reference/statements/select/join.md) 및 [ARRAY JOIN](../../../sql-reference/statements/select/array-join.md) 절은 `FROM` 절의 기능을 확장하는 데에도 사용될 수 있습니다.

서브쿼리는 `FROM` 절 내의 괄호 안에 지정될 수 있는 또 다른 `SELECT` 쿼리입니다.

`FROM` 절에는 여러 데이터 소스를 포함할 수 있으며, 이는 각각 쉼표로 구분되어 [CROSS JOIN](../../../sql-reference/statements/select/join.md)을 수행하는 것과 동일합니다.

`FROM` 절은 선택적으로 `SELECT` 절 앞에 나타날 수 있습니다. 이는 `SELECT` 문을 더 읽기 쉽게 만드는 ClickHouse 전용 확장입니다. 예를 들어:

```sql
FROM table
SELECT *
```

## FINAL 수정자 {#final-modifier}

`FINAL`이 지정되면, ClickHouse는 결과를 반환하기 전에 데이터를 완전히 병합합니다. 이것은 주어진 테이블 엔진에 대해 병합 중 발생하는 모든 데이터 변환 작업을 수행합니다.

이는 다음 테이블 엔진을 사용하여 테이블에서 데이터를 선택할 때 적용됩니다:
- `ReplacingMergeTree`
- `SummingMergeTree`
- `AggregatingMergeTree`
- `CollapsingMergeTree`
- `VersionedCollapsingMergeTree`

`FINAL`이 있는 `SELECT` 쿼리는 병렬로 실행됩니다. [max_final_threads](/operations/settings/settings#max_final_threads) 설정은 사용되는 스레드 수를 제한합니다.

### 단점 {#drawbacks}

`FINAL`을 사용하는 쿼리는 `FINAL`을 사용하지 않는 유사한 쿼리보다 약간 느리게 실행됩니다. 그 이유는 다음과 같습니다:

- 쿼리 실행 중에 데이터가 병합됩니다.
- `FINAL` 쿼리는 쿼리에 지정된 컬럼 외에도 기본 키 컬럼을 읽을 수 있습니다.

`FINAL`은 추가적인 계산 및 메모리 자원을 필요로 합니다. 왜냐하면 보통 병합 시에 발생하는 처리가 쿼리 시점에 메모리에서 이루어져야 하기 때문입니다. 그러나 정확한 결과를 생성하기 위해 `FINAL`을 사용하는 것이 때때로 필요할 수 있습니다 (데이터가 아직 완전히 병합되지 않았기 때문에). `FINAL`을 사용하여 강제로 병합을 수행하는 것보다 비용이 덜 듭니다.

`FINAL`을 사용하는 대안으로, `MergeTree` 엔진의 백그라운드 프로세스가 아직 발생하지 않았다고 가정하고 집계를 적용함으로써 (예를 들어 중복 항목을 버리기 위해) 다른 쿼리를 사용할 수 있는 경우가 있습니다. 필수 결과를 얻기 위해 쿼리에 `FINAL`을 사용해야 하는 경우, 그렇게 해도 괜찮지만 추가 처리에 대한 인식을 가지고 있어야 합니다.

`FINAL`은 쿼리의 모든 테이블에 대해 세션 또는 사용자 프로필을 사용하여 [FINAL](../../../operations/settings/settings.md#final) 설정을 자동으로 적용할 수 있습니다.

### 사용 예시 {#example-usage}

`FINAL` 키워드 사용

```sql
SELECT x, y FROM mytable FINAL WHERE x > 1;
```

쿼리 수준 설정으로서 `FINAL` 사용

```sql
SELECT x, y FROM mytable WHERE x > 1 SETTINGS final = 1;
```

세션 수준 설정으로서 `FINAL` 사용

```sql
SET final = 1;
SELECT x, y FROM mytable WHERE x > 1;
```

## 구현 세부 사항 {#implementation-details}

`FROM` 절이 생략되면, 데이터는 `system.one` 테이블에서 읽어옵니다.
`system.one` 테이블은 정확히 한 행을 포함하며 (이 테이블은 다른 DBMS에서 발견되는 DUAL 테이블과 같은 용도를 가집니다).

쿼리를 실행하기 위해 쿼리에 나열된 모든 컬럼은 적절한 테이블에서 가져옵니다. 외부 쿼리에 필요하지 않은 모든 컬럼은 서브쿼리에서 제거됩니다.
쿼리에 어떤 컬럼도 나열되지 않은 경우 (예: `SELECT count() FROM t`), 행 수 계산을 위해 가장 작은 컬럼이 테이블에서 추출됩니다.
