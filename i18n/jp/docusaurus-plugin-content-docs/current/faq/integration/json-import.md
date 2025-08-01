---
slug: '/faq/integration/json-import'
title: 'ClickHouseへのJSONインポート方法'
toc_hidden: true
toc_priority: 11
description: 'このページでは、JSONをClickHouseにインポートする方法について説明します。'
---




# How to Import JSON Into ClickHouse? {#how-to-import-json-into-clickhouse}

ClickHouse は、入力と出力のための幅広い [データフォーマット](../../interfaces/formats.md) をサポートしています。その中には複数の JSON バリエーションがありますが、データの取り込みに最も一般的に使用されるのは [JSONEachRow](../../interfaces/formats.md#jsoneachrow) です。これは、各行ごとに 1 つの JSON オブジェクトを期待し、各オブジェクトは改行で区切られる必要があります。

## Examples {#examples}

[HTTP インターフェース](../../interfaces/http.md)を使用する場合:

``` bash
$ echo '{"foo":"bar"}' | curl 'http://localhost:8123/?query=INSERT%20INTO%20test%20FORMAT%20JSONEachRow' --data-binary @-
```

[CLI インターフェース](../../interfaces/cli.md)を使用する場合:

``` bash
$ echo '{"foo":"bar"}'  | clickhouse-client --query="INSERT INTO test FORMAT JSONEachRow"
```

データを手動で挿入する代わりに、[統合ツール](../../integrations/index.mdx) を使用することを検討しても良いでしょう。

## Useful Settings {#useful-settings}

- `input_format_skip_unknown_fields` は、テーブルスキーマに存在しない追加のフィールドがあっても JSON を挿入することを可能にします（それらを破棄します）。
- `input_format_import_nested_json` は、[Nested](../../sql-reference/data-types/nested-data-structures/index.md) タイプのカラムにネストされた JSON オブジェクトを挿入することを可能にします。

:::note
設定は、HTTP インターフェースの `GET` パラメータとして指定するか、`CLI` インターフェースのために `--` で始まる追加のコマンドライン引数として指定されます。
:::
