---
description: 'ファイルに関するドキュメント'
sidebar_label: 'ファイル'
sidebar_position: 75
slug: /sql-reference/functions/files
title: 'ファイル'
---

## file {#file}

ファイルを文字列として読み取り、指定されたカラムにデータをロードします。ファイルの内容は解釈されません。

テーブル関数 [file](../table-functions/file.md) も参照してください。

**構文**

```sql
file(path[, default])
```

**引数**

- `path` — [user_files_path](../../operations/server-configuration-parameters/settings.md#user_files_path) に対するファイルのパス。ワイルドカード `*`、`**`、`?`、`{abc,def}` および `{N..M}` をサポートしています。ここで、`N`、`M` は数字、`'abc', 'def'` は文字列です。
- `default` — ファイルが存在しない場合やアクセスできない場合に返される値。サポートされているデータ型: [String](../data-types/string.md) および [NULL](/operations/settings/formats#input_format_null_as_default)。

**例**

a.txt と b.txt から文字列としてテーブルにデータを挿入する:

```sql
INSERT INTO table SELECT file('a.txt'), file('b.txt');
```
