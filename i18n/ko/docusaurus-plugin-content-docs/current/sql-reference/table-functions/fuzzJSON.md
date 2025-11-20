---
'description': '무작위 변형으로 JSON 문자열을 교란시킵니다.'
'sidebar_label': 'fuzzJSON'
'sidebar_position': 75
'slug': '/sql-reference/table-functions/fuzzJSON'
'title': 'fuzzJSON'
'doc_type': 'reference'
---


# fuzzJSON 테이블 함수

무작위 변형으로 JSON 문자열을 변형합니다.

## 문법 {#syntax}

```sql
fuzzJSON({ named_collection [, option=value [,..]] | json_str[, random_seed] })
```

## 인수 {#arguments}

| 인수                               | 설명                                                                                      |
|------------------------------------|-------------------------------------------------------------------------------------------|
| `named_collection`                 | [NAMED COLLECTION](sql-reference/statements/create/named-collection.md).                  |
| `option=value`                     | 명명된 컬렉션의 선택적 매개변수 및 해당 값.                                             |
| `json_str` (String)                | JSON 형식으로 표준화된 데이터를 나타내는 원본 문자열입니다.                              |
| `random_seed` (UInt64)             | 안정적인 결과 생성을 위한 수동 난수 시드입니다.                                         |
| `reuse_output` (boolean)           | 변형 프로세스의 출력을 다음 퍼저에 대한 입력으로 재사용합니다.                          |
| `malform_output` (boolean)         | JSON 객체로 파싱할 수 없는 문자열을 생성합니다.                                         |
| `max_output_length` (UInt64)       | 생성된 또는 변형된 JSON 문자열의 최대 허용 길이입니다.                                   |
| `probability` (Float64)            | JSON 필드를 변형할 확률입니다 (키-값 쌍). [0, 1] 범위 내여야 합니다.                     |
| `max_nesting_level` (UInt64)       | JSON 데이터 내에서 허용되는 중첩 구조의 최대 깊이입니다.                                 |
| `max_array_size` (UInt64)          | JSON 배열의 최대 허용 크기입니다.                                                        |
| `max_object_size` (UInt64)         | JSON 객체의 한 레벨에서 허용되는 필드의 최대 수입니다.                                   |
| `max_string_value_length` (UInt64) | 문자열 값의 최대 길이입니다.                                                             |
| `min_key_length` (UInt64)          | 최소 키 길이입니다. 최소 1이어야 합니다.                                                 |
| `max_key_length` (UInt64)          | 최대 키 길이입니다. 지정된 경우 `min_key_length` 이상이어야 합니다.                      |

## 반환값 {#returned_value}

변형된 JSON 문자열을 포함하는 단일 컬럼을 가진 테이블 객체입니다.

## 사용 예제 {#usage-example}

```sql
CREATE NAMED COLLECTION json_fuzzer AS json_str='{}';
SELECT * FROM fuzzJSON(json_fuzzer) LIMIT 3;
```

```text
{"52Xz2Zd4vKNcuP2":true}
{"UPbOhOQAdPKIg91":3405264103600403024}
{"X0QUWu8yT":[]}
```

```sql
SELECT * FROM fuzzJSON(json_fuzzer, json_str='{"name" : "value"}', random_seed=1234) LIMIT 3;
```

```text
{"key":"value", "mxPG0h1R5":"L-YQLv@9hcZbOIGrAn10%GA"}
{"BRE3":true}
{"key":"value", "SWzJdEJZ04nrpSfy":[{"3Q23y":[]}]}
```

```sql
SELECT * FROM fuzzJSON(json_fuzzer, json_str='{"students" : ["Alice", "Bob"]}', reuse_output=true) LIMIT 3;
```

```text
{"students":["Alice", "Bob"], "nwALnRMc4pyKD9Krv":[]}
{"students":["1rNY5ZNs0wU&82t_P", "Bob"], "wLNRGzwDiMKdw":[{}]}
{"xeEk":["1rNY5ZNs0wU&82t_P", "Bob"], "wLNRGzwDiMKdw":[{}, {}]}
```

```sql
SELECT * FROM fuzzJSON(json_fuzzer, json_str='{"students" : ["Alice", "Bob"]}', max_output_length=512) LIMIT 3;
```

```text
{"students":["Alice", "Bob"], "BREhhXj5":true}
{"NyEsSWzJdeJZ04s":["Alice", 5737924650575683711, 5346334167565345826], "BjVO2X9L":true}
{"NyEsSWzJdeJZ04s":["Alice", 5737924650575683711, 5346334167565345826], "BjVO2X9L":true, "k1SXzbSIz":[{}]}
```

```sql
SELECT * FROM fuzzJSON('{"id":1}', 1234) LIMIT 3;
```

```text
{"id":1, "mxPG0h1R5":"L-YQLv@9hcZbOIGrAn10%GA"}
{"BRjE":16137826149911306846}
{"XjKE":15076727133550123563}
```

```sql
SELECT * FROM fuzzJSON(json_nc, json_str='{"name" : "FuzzJSON"}', random_seed=1337, malform_output=true) LIMIT 3;
```

```text
U"name":"FuzzJSON*"SpByjZKtr2VAyHCO"falseh
{"name"keFuzzJSON, "g6vVO7TCIk":jTt^
{"DBhz":YFuzzJSON5}
```
