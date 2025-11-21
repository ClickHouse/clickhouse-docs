---
slug: /faq/integration/json-import
title: 'JSON を ClickHouse にインポートするには？'
toc_hidden: true
toc_priority: 11
description: 'このページでは、JSON を ClickHouse にインポートする方法を紹介します'
keywords: ['JSON インポート', 'JSONEachRow 形式', 'データ インポート', 'JSON 取り込み', 'データ形式']
doc_type: 'guide'
---



# ClickHouseにJSONをインポートする方法 {#how-to-import-json-into-clickhouse}

ClickHouseは、幅広い[入出力用データフォーマット](/interfaces/formats)をサポートしています。その中には複数のJSON形式が含まれていますが、データ取り込みで最も一般的に使用されるのは[JSONEachRow](/interfaces/formats/JSONEachRow)です。このフォーマットでは、1行につき1つのJSONオブジェクトを記述し、各オブジェクトを改行で区切ります。


## 例 {#examples}

[HTTPインターフェース](../../interfaces/http.md)を使用する場合:

```bash
$ echo '{"foo":"bar"}' | curl 'http://localhost:8123/?query=INSERT%20INTO%20test%20FORMAT%20JSONEachRow' --data-binary @-
```

[CLIインターフェース](../../interfaces/cli.md)を使用する場合:

```bash
$ echo '{"foo":"bar"}'  | clickhouse-client --query="INSERT INTO test FORMAT JSONEachRow"
```

手動でデータを挿入する代わりに、[統合ツール](../../integrations/index.mdx)の使用を検討することもできます。


## 有用な設定 {#useful-settings}

- `input_format_skip_unknown_fields` は、テーブルスキーマに存在しない追加フィールドがある場合でも、それらを破棄してJSONを挿入できるようにします。
- `input_format_import_nested_json` は、ネストされたJSONオブジェクトを[Nested](../../sql-reference/data-types/nested-data-structures/index.md)型のカラムに挿入できるようにします。

:::note
設定は、HTTPインターフェースでは`GET`パラメータとして、`CLI`インターフェースでは`--`を接頭辞とする追加のコマンドライン引数として指定します。
:::
