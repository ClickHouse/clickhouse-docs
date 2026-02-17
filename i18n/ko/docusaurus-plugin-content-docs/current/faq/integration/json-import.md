---
slug: /faq/integration/json-import
title: 'ClickHouse에 JSON을 가져오는 방법'
toc_hidden: true
toc_priority: 11
description: '이 페이지에서는 ClickHouse에 JSON을 가져오는 방법을 설명합니다'
keywords: ['JSON 가져오기', 'JSONEachRow 형식', '데이터 가져오기', 'JSON 수집', '데이터 형식']
doc_type: 'guide'
---

# ClickHouse에 JSON을 가져오는 방법 \{#how-to-import-json-into-clickhouse\}

ClickHouse는 [입력과 출력을 위한 다양한 데이터 포맷](/interfaces/formats)을 지원합니다. 이들 중에는 여러 JSON 변형 포맷이 포함되어 있지만, 데이터 수집에 가장 일반적으로 사용되는 포맷은 [JSONEachRow](/interfaces/formats/JSONEachRow)입니다. 이 포맷에서는 한 행마다 하나의 JSON 객체가 있어야 하며, 각 객체는 줄바꿈 문자로 구분됩니다.

## 예제 \{#examples\}

[HTTP 인터페이스](/interfaces/http) 사용:

```bash
$ echo '{"foo":"bar"}' | curl 'http://localhost:8123/?query=INSERT%20INTO%20test%20FORMAT%20JSONEachRow' --data-binary @-
```

[CLI 인터페이스](../../interfaces/cli.md) 사용:

```bash
$ echo '{"foo":"bar"}'  | clickhouse-client --query="INSERT INTO test FORMAT JSONEachRow"
```

데이터를 수동으로 삽입하는 대신 [integration tool](../../integrations/index.mdx)을 사용하는 방안을 고려해 보십시오.


## 유용한 설정 \{#useful-settings\}

- `input_format_skip_unknown_fields`는 테이블 스키마에 존재하지 않는 추가 필드가 있어도(이를 버려서) JSON을 삽입할 수 있게 합니다.
- `input_format_import_nested_json`은 중첩된 JSON 객체를 [Nested](../../sql-reference/data-types/nested-data-structures/index.md) 타입 컬럼에 삽입할 수 있게 합니다.

:::note
설정은 HTTP 인터페이스에서는 `GET` 파라미터로, `CLI` 인터페이스에서는 앞에 `--`를 붙인 추가 커맨드라인 인수로 지정합니다.
:::