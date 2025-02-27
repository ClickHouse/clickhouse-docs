---
slug: /faq/integration/json-import
title: JSONをClickHouseにインポートする方法は？
toc_hidden: true
toc_priority: 11
---

# JSONをClickHouseにインポートする方法は？ {#how-to-import-json-into-clickhouse}

ClickHouseは幅広い[入出力データフォーマット](../../interfaces/formats.md)をサポートしています。その中には複数のJSONバリエーションがありますが、データ取り込みに最も一般的に使用されるのは[JSONEachRow](../../interfaces/formats.md#jsoneachrow)です。このフォーマットは、各行に1つのJSONオブジェクトが必要で、各オブジェクトは改行で区切られます。

## 例 {#examples}

[HTTPインターフェース](../../interfaces/http.md)を使用する場合:

``` bash
$ echo '{"foo":"bar"}' | curl 'http://localhost:8123/?query=INSERT%20INTO%20test%20FORMAT%20JSONEachRow' --data-binary @-
```

[CLIインターフェース](../../interfaces/cli.md)を使用する場合:

``` bash
$ echo '{"foo":"bar"}'  | clickhouse-client --query="INSERT INTO test FORMAT JSONEachRow"
```

データを手動で挿入する代わりに、[統合ツール](../../integrations/index.mdx)を使用することを検討するかもしれません。

## 便利な設定 {#useful-settings}

- `input_format_skip_unknown_fields`を使用することで、テーブルスキーマに存在しない追加フィールドがあってもJSONを挿入できます（それらを破棄します）。
- `input_format_import_nested_json`を使用することで、[Nested](../../sql-reference/data-types/nested-data-structures/index.md)型のカラムにネストされたJSONオブジェクトを挿入できます。

:::note
設定は、HTTPインターフェースの`GET`パラメータとして、または`CLI`インターフェースの追加コマンドライン引数として`--`で始まる形式で指定されます。
:::
