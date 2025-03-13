---
slug: /faq/integration/json-import
title: JSONをClickHouseにインポートする方法は？
toc_hidden: true
toc_priority: 11
---


# JSONをClickHouseにインポートする方法は？ {#how-to-import-json-into-clickhouse}

ClickHouseは、広範な[データフォーマットの入出力をサポート](../../interfaces/formats.md)しています。その中には複数のJSONのバリエーションがありますが、データの取り込みに最も一般的に使用されるのは[JSONEachRow](../../interfaces/formats.md#jsoneachrow)です。これは、各行に1つのJSONオブジェクトを期待し、各オブジェクトは改行で区切られています。

## 例 {#examples}

[HTTPインターフェース](../../interfaces/http.md)を使用する場合:

``` bash
$ echo '{"foo":"bar"}' | curl 'http://localhost:8123/?query=INSERT%20INTO%20test%20FORMAT%20JSONEachRow' --data-binary @-
```

[CLIインターフェース](../../interfaces/cli.md)を使用する場合:

``` bash
$ echo '{"foo":"bar"}'  | clickhouse-client --query="INSERT INTO test FORMAT JSONEachRow"
```

データを手動で挿入する代わりに、[統合ツール](../../integrations/index.mdx)を使用することを検討してもよいでしょう。

## 有用な設定 {#useful-settings}

- `input_format_skip_unknown_fields`は、テーブルスキーマに存在しない追加フィールドがあってもJSONを挿入できるようにします（それらを捨てることにより）。
- `input_format_import_nested_json`は、[Nested](../../sql-reference/data-types/nested-data-structures/index.md)型のカラムにネストされたJSONオブジェクトを挿入できるようにします。

:::note
設定は、HTTPインターフェースの`GET`パラメータとして、または`CLI`インターフェース用の追加コマンドライン引数として`--`でプレフィックスを付けて指定されます。
:::
