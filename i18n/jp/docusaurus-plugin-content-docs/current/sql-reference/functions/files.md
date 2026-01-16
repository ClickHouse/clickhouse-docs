---
description: 'Files 関数のドキュメント'
sidebar_label: 'Files'
slug: /sql-reference/functions/files
title: 'Files'
doc_type: 'reference'
---

## file \{#file\}

ファイルを文字列として読み取り、そのデータを指定された列に読み込みます。ファイルの内容は解釈されません。

テーブル関数 [file](../table-functions/file.md) も参照してください。

**構文**

```sql
file(path[, default])
```

**引数**

* `path` — [user&#95;files&#95;path](../../operations/server-configuration-parameters/settings.md#user_files_path) からの相対パスで指定されるファイルのパス。ワイルドカード `*`、`**`、`?`、`{abc,def}`、および `{N..M}`（ここで `N`、`M` は数値、`'abc'`、`'def'` は文字列）をサポートします。
* `default` — ファイルが存在しない、またはアクセスできない場合に返される値。サポートされるデータ型: [String](../data-types/string.md) および [NULL](/operations/settings/formats#input_format_null_as_default)。

**例**

a.txt と b.txt というファイルからデータを読み込み、文字列としてテーブルに挿入します:

```sql
INSERT INTO table SELECT file('a.txt'), file('b.txt');
```
