---
description: 'DESCRIBE TABLE에 대한 문서'
sidebar_label: 'DESCRIBE TABLE'
sidebar_position: 42
slug: /sql-reference/statements/describe-table
title: 'DESCRIBE TABLE'
doc_type: 'reference'
---

테이블 컬럼에 대한 정보를 반환합니다.

**구문**

```sql
DESC|DESCRIBE TABLE [db.]table [INTO OUTFILE filename] [FORMAT format]
```

`DESCRIBE` SQL 문은 각 테이블 컬럼마다 다음과 같은 [String](../../sql-reference/data-types/string.md) 값을 갖는 행을 하나씩 반환합니다:

* `name` — 컬럼 이름입니다.
* `type` — 컬럼 타입입니다.
* `default_type` — 컬럼의 [기본 표현식(default expression)](/sql-reference/statements/create/table)에 사용되는 절입니다. `DEFAULT`, `MATERIALIZED`, `ALIAS` 중 하나입니다. 기본 표현식이 없으면 빈 문자열이 반환됩니다.
* `default_expression` — `DEFAULT` 절 뒤에 지정된 표현식입니다.
* `comment` — [컬럼 주석](/sql-reference/statements/alter/column#comment-column)입니다.
* `codec_expression` — 컬럼에 적용되는 [코덱](/sql-reference/statements/create/table#column_compression_codec)입니다.
* `ttl_expression` — [TTL](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-ttl) 표현식입니다.
* `is_subcolumn` — 내부 서브컬럼일 경우 값이 `1`인 플래그입니다. [describe&#95;include&#95;subcolumns](../../operations/settings/settings.md#describe_include_subcolumns) 설정으로 서브컬럼 설명을 활성화한 경우에만 결과에 포함됩니다.

[Nested](../../sql-reference/data-types/nested-data-structures/index.md) 데이터 구조 안의 모든 컬럼은 각각 별도로 기술됩니다. 각 컬럼 이름 앞에는 상위 컬럼 이름과 점(.)이 붙습니다.

다른 데이터 타입의 내부 서브컬럼을 표시하려면 [describe&#95;include&#95;subcolumns](../../operations/settings/settings.md#describe_include_subcolumns) 설정을 사용합니다.

**예시**

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

두 번째 쿼리는 하위 컬럼도 함께 보여 줍니다:

```text
┌─name──────┬─type──────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┬─is_subcolumn─┐
│ id        │ UInt64                        │              │                    │         │                  │                │            0 │
│ text      │ String                        │ DEFAULT      │ 'unknown'          │         │ ZSTD(1)          │                │            0 │
│ user      │ Tuple(name String, age UInt8) │              │                    │         │                  │                │            0 │
│ user.name │ String                        │              │                    │         │                  │                │            1 │
│ user.age  │ UInt8                         │              │                    │         │                  │                │            1 │
└───────────┴───────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┴──────────────┘
```

`DESCRIBE` 문은 서브쿼리나 스칼라 표현식에도 사용할 수 있습니다:

```SQL
DESCRIBE SELECT 1 FORMAT TSV;
```

또는

```SQL
DESCRIBE (SELECT 1) FORMAT TSV;
```

결과:

```text
1       UInt8
```

이 사용법은 지정된 쿼리 또는 서브쿼리의 결과 컬럼에 대한 메타데이터를 반환합니다. 복잡한 쿼리를 실행하기 전에 그 구조를 미리 파악하는 데 유용합니다.

**참고**

* [describe&#95;include&#95;subcolumns](../../operations/settings/settings.md#describe_include_subcolumns) 설정.
