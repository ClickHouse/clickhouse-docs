---
'slug': '/faq/integration/json-import'
'title': 'How to import JSON into ClickHouse?'
'toc_hidden': true
'toc_priority': 11
'description': '이 페이지에서는 JSON을 ClickHouse에 가져오는 방법을 보여줍니다.'
'keywords':
- 'JSON import'
- 'JSONEachRow format'
- 'data import'
- 'JSON ingestion'
- 'data formats'
'doc_type': 'guide'
---


# How to Import JSON Into ClickHouse? {#how-to-import-json-into-clickhouse}

ClickHouse는 입력 및 출력을 위한 다양한 [데이터 형식](/interfaces/formats)을 지원합니다. 그 중 여러 가지 JSON 변형이 있지만, 데이터 수집에 가장 일반적으로 사용되는 것은 [JSONEachRow](/interfaces/formats/JSONEachRow)입니다. 각 행마다 하나의 JSON 객체가 필요하며, 각 객체는 개행으로 구분됩니다.

## Examples {#examples}

[HTTP 인터페이스](../../interfaces/http.md)를 사용하여:

```bash
$ echo '{"foo":"bar"}' | curl 'http://localhost:8123/?query=INSERT%20INTO%20test%20FORMAT%20JSONEachRow' --data-binary @-
```

[CLI 인터페이스](../../interfaces/cli.md)를 사용하여:

```bash
$ echo '{"foo":"bar"}'  | clickhouse-client --query="INSERT INTO test FORMAT JSONEachRow"
```

데이터를 수동으로 삽입하는 대신, [통합 도구](../../integrations/index.mdx)를 사용하는 것을 고려할 수 있습니다.

## Useful settings {#useful-settings}

- `input_format_skip_unknown_fields`는 테이블 스키마에 없는 추가 필드가 있더라도 JSON을 삽입할 수 있도록 하여 이를 버립니다.
- `input_format_import_nested_json`은 [Nested](../../sql-reference/data-types/nested-data-structures/index.md) 유형의 컬럼에 중첩된 JSON 객체를 삽입할 수 있도록 합니다.

:::note
설정은 HTTP 인터페이스에 대한 `GET` 매개변수로 또는 `CLI` 인터페이스의 경우 `--`로 접두사 붙인 추가 명령줄 인수로 지정됩니다.
:::
