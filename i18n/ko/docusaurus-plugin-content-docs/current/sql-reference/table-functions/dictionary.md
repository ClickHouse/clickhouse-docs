---
'description': 'ClickHouse 테이블로서 딕셔너리 데이터를 표시합니다. Dictionary 엔진과 동일한 방식으로 작동합니다.'
'sidebar_label': '딕셔너리'
'sidebar_position': 47
'slug': '/sql-reference/table-functions/dictionary'
'title': '딕셔너리'
'doc_type': 'reference'
---


# dictionary Table Function

ClickHouse 테이블로 [딕셔너리](../../sql-reference/dictionaries/index.md) 데이터를 표시합니다. [Dictionary](../../engines/table-engines/special/dictionary.md) 엔진과 동일하게 작동합니다.

## Syntax {#syntax}

```sql
dictionary('dict')
```

## Arguments {#arguments}

- `dict` — 딕셔너리 이름. [문자열](../../sql-reference/data-types/string.md).

## Returned value {#returned_value}

ClickHouse 테이블입니다.

## Examples {#examples}

입력 테이블 `dictionary_source_table`:

```text
┌─id─┬─value─┐
│  0 │     0 │
│  1 │     1 │
└────┴───────┘
```

딕셔너리 생성:

```sql
CREATE DICTIONARY new_dictionary(id UInt64, value UInt64 DEFAULT 0) PRIMARY KEY id
SOURCE(CLICKHOUSE(HOST 'localhost' PORT tcpPort() USER 'default' TABLE 'dictionary_source_table')) LAYOUT(DIRECT());
```

쿼리:

```sql
SELECT * FROM dictionary('new_dictionary');
```

결과:

```text
┌─id─┬─value─┐
│  0 │     0 │
│  1 │     1 │
└────┴───────┘
```

## Related {#related}

- [Dictionary engine](/engines/table-engines/special/dictionary)
