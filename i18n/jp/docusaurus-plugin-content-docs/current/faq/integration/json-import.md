---
slug: /faq/integration/json-import
title: 'JSON を ClickHouse にインポートする方法'
toc_hidden: true
toc_priority: 11
description: 'このページでは、JSON を ClickHouse にインポートする方法を説明します。'
keywords: ['JSON インポート', 'JSONEachRow フォーマット', 'データインポート', 'JSON インジェスト', 'データフォーマット']
doc_type: 'guide'
---



# ClickHouse に JSON をインポートする方法 {#how-to-import-json-into-clickhouse}

ClickHouse は、[入出力用のさまざまなデータ形式](/interfaces/formats)をサポートしています。その中には複数の JSON 系フォーマットがありますが、データのインジェストで最も一般的に使用されるのは [JSONEachRow](/interfaces/formats/JSONEachRow) です。これは、1 行に 1 つの JSON オブジェクトがあり、各オブジェクトが改行で区切られている形式を前提としています。



## 例

[HTTP インターフェース](../../interfaces/http.md)を使用する場合：

```bash
$ echo '{"foo":"bar"}' | curl 'http://localhost:8123/?query=INSERT%20INTO%20test%20FORMAT%20JSONEachRow' --data-binary @-
```

[CLI インターフェース](../../interfaces/cli.md)を使用する:

```bash
$ echo '{"foo":"bar"}'  | clickhouse-client --query="INSERT INTO test FORMAT JSONEachRow"
```

データを手動で挿入するのではなく、[インテグレーションツール](../../integrations/index.mdx)の利用を検討してください。


## 便利な設定 {#useful-settings}

- `input_format_skip_unknown_fields` は、テーブルのスキーマに存在しない追加フィールドが含まれていても（それらを破棄して）JSON データを挿入できるようにします。
- `input_format_import_nested_json` は、[Nested](../../sql-reference/data-types/nested-data-structures/index.md) 型のカラムにネストされた JSON オブジェクトを挿入できるようにします。

:::note
設定は、HTTP インターフェイスでは `GET` パラメータとして、`CLI` インターフェイスでは先頭に `--` を付けた追加のコマンドライン引数として指定します。
:::
