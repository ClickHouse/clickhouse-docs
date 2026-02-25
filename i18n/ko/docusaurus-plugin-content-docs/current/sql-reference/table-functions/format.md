---
description: '지정된 입력 포맷에 따라 인수로부터 데이터를 파싱합니다. structure 인수가 지정되지 않으면 데이터에서 구조를 추출합니다.'
slug: /sql-reference/table-functions/format
sidebar_position: 65
sidebar_label: 'format'
title: 'format'
doc_type: 'reference'
---



# format Table Function \{#format-table-function\}

지정된 입력 포맷에 따라 인자에서 데이터를 파싱합니다. `structure` 인자가 지정되지 않으면 구조는 데이터에서 추출됩니다.



## 구문 \{#syntax\}

```sql
format(format_name, [structure], data)
```


## Arguments \{#arguments\}

- `format_name` — 데이터 [format](/sql-reference/formats)의 이름입니다.
- `structure` - 테이블 구조입니다. 선택적인 인수입니다. 형식은 'column1_name column1_type, column2_name column2_type, ...'입니다.
- `data` — 지정된 format의 데이터를 포함하는 문자열을 반환하는 문자열 리터럴 또는 상수 표현식입니다.



## 반환 값 \{#returned_value\}

지정된 형식과 지정되거나 추출된 구조에 따라 `data` 인수에서 파싱된 데이터를 포함하는 테이블입니다.



## 예시 \{#examples\}

`structure` 인수 없이:

**쿼리:**

```sql
SELECT * FROM format(JSONEachRow,
$$
{"a": "Hello", "b": 111}
{"a": "World", "b": 123}
{"a": "Hello", "b": 112}
{"a": "World", "b": 124}
$$)
```

**결과:**

```response
┌───b─┬─a─────┐
│ 111 │ Hello │
│ 123 │ World │
│ 112 │ Hello │
│ 124 │ World │
└─────┴───────┘
```

**쿼리:**

```sql
DESC format(JSONEachRow,
$$
{"a": "Hello", "b": 111}
{"a": "World", "b": 123}
{"a": "Hello", "b": 112}
{"a": "World", "b": 124}
$$)
```

**결과:**

```response
┌─name─┬─type──────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ b    │ Nullable(Float64) │              │                    │         │                  │                │
│ a    │ Nullable(String)  │              │                    │         │                  │                │
└──────┴───────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

`structure` 인자를 사용할 때:

**쿼리:**

```sql
SELECT * FROM format(JSONEachRow, 'a String, b UInt32',
$$
{"a": "Hello", "b": 111}
{"a": "World", "b": 123}
{"a": "Hello", "b": 112}
{"a": "World", "b": 124}
$$)
```

**결과:**

```response
┌─a─────┬───b─┐
│ Hello │ 111 │
│ World │ 123 │
│ Hello │ 112 │
│ World │ 124 │
└───────┴─────┘
```


## 관련 문서 \{#related\}

- [포맷](../../interfaces/formats.md)
