---
description: 'Documentation for Files'
sidebar_label: 'Files'
sidebar_position: 75
slug: '/sql-reference/functions/files'
title: 'Files'
---



## file {#file}

ファイルを文字列として読み込み、指定されたカラムにデータをロードします。ファイルの内容は解釈されません。

また、テーブル関数 [file](../table-functions/file.md) を参照してください。

**構文**

```sql
file(path[, default])
```

**引数**

- `path` — [user_files_path](../../operations/server-configuration-parameters/settings.md#user_files_path) に対するファイルのパス。ワイルドカード `*`、`**`、`?`、`{abc,def}` と `{N..M}` がサポートされており、ここで `N` と `M` は数字、`'abc'` と `'def'` は文字列です。
- `default` — ファイルが存在しない場合またはアクセスできない場合に返される値。サポートされているデータ型： [String](../data-types/string.md) と [NULL](/operations/settings/formats#input_format_null_as_default)。

**例**

ファイル a.txt と b.txt からテーブルにデータを文字列として挿入します：

```sql
INSERT INTO table SELECT file('a.txt'), file('b.txt');
```
