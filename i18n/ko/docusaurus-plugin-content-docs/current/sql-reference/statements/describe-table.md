---
'description': 'Describe Table에 대한 문서'
'sidebar_label': 'DESCRIBE TABLE'
'sidebar_position': 42
'slug': '/sql-reference/statements/describe-table'
'title': 'DESCRIBE TABLE'
'doc_type': 'reference'
---

테이블 컬럼에 대한 정보를 반환합니다.

**구문**

```sql
DESC|DESCRIBE TABLE [db.]table [INTO OUTFILE filename] [FORMAT format]
```

`DESCRIBE` 문은 다음 [문자열](../../sql-reference/data-types/string.md) 값이 포함된 각 테이블 컬럼에 대해 행을 반환합니다:

- `name` — 컬럼 이름.
- `type` — 컬럼 유형.
- `default_type` — [기본 표현식](/sql-reference/statements/create/table)에서 사용되는 절: `DEFAULT`, `MATERIALIZED` 또는 `ALIAS`. 기본 표현식이 없으면 빈 문자열이 반환됩니다.
- `default_expression` — `DEFAULT` 절 뒤에 지정된 표현식.
- `comment` — [컬럼 주석](/sql-reference/statements/alter/column#comment-column).
- `codec_expression` — 컬럼에 적용된 [코덱](/sql-reference/statements/create/table#column_compression_codec).
- `ttl_expression` — [TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) 표현식.
- `is_subcolumn` — 내부 서브컬럼에 대해 `1`인 플래그. 서브컬럼 설명이 [describe_include_subcolumns](../../operations/settings/settings.md#describe_include_subcolumns) 설정에 의해 활성화된 경우에만 결과에 포함됩니다.

[Nested](../../sql-reference/data-types/nested-data-structures/index.md) 데이터 구조의 모든 컬럼은 별도로 설명됩니다. 각 컬럼의 이름은 부모 컬럼 이름과 점으로 접두사가 붙습니다.

다른 데이터 유형의 내부 서브컬럼을 표시하려면 [describe_include_subcolumns](../../operations/settings/settings.md#describe_include_subcolumns) 설정을 사용하세요.

**예제**

쿼리:

```sql
CREATE TABLE describe_example (
    id UInt64, text String DEFAULT 'unknown' CODEC(ZSTD),
    user Tuple (name String, age UInt8)
) ENGINE = MergeTree() ORDER BY id;

DESCRIBE TABLE describe_example;
DESCRIBE TABLE describe_example SETTINGS describe_include_subcolumns=1;
```

결과:

```text
┌─name─┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ id   │ UInt64                        │              │                    │         │                  │                │
│ text │ String                        │ DEFAULT      │ 'unknown'          │         │ ZSTD(1)          │                │
│ user │ Tuple(name String, age UInt8) │              │                    │         │                  │                │
└──────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

두 번째 쿼리는 추가로 서브컬럼을 보여줍니다:

```text
┌─name──────┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┬─is_subcolumn─┐
│ id        │ UInt64                        │              │                    │         │                  │                │            0 │
│ text      │ String                        │ DEFAULT      │ 'unknown'          │         │ ZSTD(1)          │                │            0 │
│ user      │ Tuple(name String, age UInt8) │              │                    │         │                  │                │            0 │
│ user.name │ String                        │              │                    │         │                  │                │            1 │
│ user.age  │ UInt8                         │              │                    │         │                  │                │            1 │
└───────────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┴──────────────┘
```

**참고**

- [describe_include_subcolumns](../../operations/settings/settings.md#describe_include_subcolumns) 설정.
