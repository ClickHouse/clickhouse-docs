[`Nullable` 컬럼](/sql-reference/data-types/nullable/) (예: `Nullable(String)`)은 `UInt8` 타입의 별도 컬럼을 생성합니다. 이 추가 컬럼은 사용자가 Nullable 컬럼을 사용할 때마다 처리해야 합니다. 이로 인해 추가 저장 공간이 사용되며, 성능에 거의 항상 부정적인 영향을 미칩니다.

`Nullable` 컬럼을 피하기 위해, 해당 컬럼에 대한 기본 값을 설정하는 것을 고려하십시오. 예를 들어, 대신에:

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
사용하십시오.

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

사용 사례를 고려하십시오; 기본 값이 부적절할 수 있습니다.
