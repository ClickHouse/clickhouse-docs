---
slug: /faq/integration/json-import
title: 'JSONをClickHouseにインポートする方法'
toc_hidden: true
toc_priority: 11
description: 'このページでは、JSONをClickHouseにインポートする方法を示します'
---


# JSONをClickHouseにインポートする方法 {#how-to-import-json-into-clickhouse}

ClickHouseは、[入力と出力のためのデータフォーマット](../../interfaces/formats.md)の幅広い範囲をサポートしています。その中には複数のJSONのバリエーションがありますが、データ取り込みに最も頻繁に使用されるのは[JSONEachRow](../../interfaces/formats.md#jsoneachrow)です。これは、各行に1つのJSONオブジェクトを期待し、各オブジェクトは改行で区切られます。

## 例 {#examples}

[HTTPインターフェース](../../interfaces/http.md)を使用する場合：

``` bash
$ echo '{"foo":"bar"}' | curl 'http://localhost:8123/?query=INSERT%20INTO%20test%20FORMAT%20JSONEachRow' --data-binary @-
```

[CLIインターフェース](../../interfaces/cli.md)を使用する場合：

``` bash
$ echo '{"foo":"bar"}'  | clickhouse-client --query="INSERT INTO test FORMAT JSONEachRow"
```

データを手動で挿入する代わりに、[統合ツール](../../integrations/index.mdx)を使用することを検討しても良いでしょう。

## 有用な設定 {#useful-settings}

- `input_format_skip_unknown_fields` は、テーブルスキーマに存在しない追加のフィールドがあってもJSONを挿入できるようにします（それらを破棄することで）。
- `input_format_import_nested_json` は、[Nested](../../sql-reference/data-types/nested-data-structures/index.md)型のカラムにネストされたJSONオブジェクトを挿入できるようにします。

:::note
設定は、HTTPインターフェースのための`GET`パラメータとして、または`CLI`インターフェースのための`--`で始まる追加のコマンドライン引数として指定されます。
:::
