[`Nullable` column](/sql-reference/data-types/nullable/) (예: `Nullable(String)`)은 `UInt8` 타입의 별도 컬럼을 생성합니다. 이 추가 컬럼은 사용자가 Nullable 컬럼을 사용할 때마다 매번 처리해야 합니다. 이로 인해 추가적인 저장 공간이 필요하고, 대부분의 경우 성능에 부정적인 영향을 줍니다.

`Nullable` 컬럼을 피하려면 해당 컬럼에 기본값을 설정하는 것을 고려하십시오. 예를 들어, 다음과 같이 하는 대신:

```sql
CREATE TABLE default.sample
(
    `x` Int8,
    -- highlight-next-line
    `y` Nullable(Int8)
)
ENGINE = MergeTree
ORDER BY x
```

사용

```sql
CREATE TABLE default.sample2
(
    `x` Int8,
    -- highlight-next-line
    `y` Int8 DEFAULT 0
)
ENGINE = MergeTree
ORDER BY x
```

사용 사례를 충분히 검토하십시오. 기본값이 적합하지 않을 수 있습니다.
