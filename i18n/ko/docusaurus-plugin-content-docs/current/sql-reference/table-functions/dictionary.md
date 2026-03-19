---
description: '딕셔너리 데이터를 ClickHouse 테이블로 표시합니다. Dictionary 엔진과 동일하게 동작합니다.'
sidebar_label: 'dictionary'
sidebar_position: 47
slug: /sql-reference/table-functions/dictionary
title: 'dictionary'
doc_type: 'reference'
---

# dictionary 테이블 함수 \{#dictionary-table-function\}

[dictionary](../statements/create/dictionary/overview.md) 데이터를 ClickHouse 테이블로 표시합니다. [Dictionary](../../engines/table-engines/special/dictionary.md) 엔진과 같은 방식으로 동작합니다.

## 구문 \{#syntax\}

```sql
dictionary('dict')
```


## 인수 \{#arguments\}

- `dict` — 딕셔너리의 이름입니다. [String](../../sql-reference/data-types/string.md).

## 반환값 \{#returned_value\}

ClickHouse 테이블이 반환됩니다.

## 예제 \{#examples\}

입력 테이블 `dictionary_source_table`:

```text
┌─id─┬─value─┐
│  0 │     0 │
│  1 │     1 │
└────┴───────┘
```

딕셔너리를 생성하십시오:

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


## 관련 항목 \{#related\}

- [딕셔너리 엔진](/engines/table-engines/special/dictionary)