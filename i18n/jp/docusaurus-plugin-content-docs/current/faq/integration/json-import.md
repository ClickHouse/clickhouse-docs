---
'slug': '/faq/integration/json-import'
'title': 'JSON を ClickHouse にインポートする方法は？'
'toc_hidden': true
'toc_priority': 11
'description': 'このページでは、JSON を ClickHouse にインポートする方法を示します。'
'doc_type': 'guide'
---


# How to Import JSON Into ClickHouse? {#how-to-import-json-into-clickhouse}

ClickHouseは、さまざまな[data formats for input and output](../../interfaces/formats.md)をサポートしています。その中には複数のJSONバリエーションがありますが、データインジェクションに最も一般的に使用されるのは[JSONEachRow](../../interfaces/formats.md#jsoneachrow)です。これは、各行に1つのJSONオブジェクトを期待し、各オブジェクトは改行で区切られます。

## Examples {#examples}

[HTTP interface](../../interfaces/http.md)を使用した場合:

```bash
$ echo '{"foo":"bar"}' | curl 'http://localhost:8123/?query=INSERT%20INTO%20test%20FORMAT%20JSONEachRow' --data-binary @-
```

[CLI interface](../../interfaces/cli.md)を使用した場合:

```bash
$ echo '{"foo":"bar"}'  | clickhouse-client --query="INSERT INTO test FORMAT JSONEachRow"
```

手動でデータを挿入する代わりに、[integration tool](../../integrations/index.mdx)を使用することを検討してもよいでしょう。

## Useful settings {#useful-settings}

- `input_format_skip_unknown_fields`を使用すると、テーブルスキーマに存在しない追加フィールドを破棄することで、JSONを挿入することができます。
- `input_format_import_nested_json`を使用すると、[Nested](../../sql-reference/data-types/nested-data-structures/index.md)型のカラムにネストされたJSONオブジェクトを挿入することができます。

:::note
設定は、HTTPインターフェイスの`GET`パラメータとして、または`CLI`インターフェイスのために`--`で始まる追加のコマンドライン引数として指定されます。
:::
