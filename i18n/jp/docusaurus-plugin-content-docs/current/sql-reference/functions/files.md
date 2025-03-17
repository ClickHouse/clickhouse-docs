---
slug: /sql-reference/functions/files
sidebar_position: 75
sidebar_label: ファイル
---

## file {#file}

ファイルを文字列として読み取り、指定されたカラムにデータをロードします。ファイルの内容は解釈されません。

テーブル関数 [file](../table-functions/file.md) も参照してください。

**構文**

``` sql
file(path[, default])
```

**引数**

- `path` — [user_files_path](../../operations/server-configuration-parameters/settings.md#user_files_path) に対するファイルの相対パス。ワイルドカード `*`、`**`、`?`、`{abc,def}`、および `{N..M}`（ここで `N` と `M` は数字、`'abc'` と `'def'` は文字列）をサポートしています。
- `default` — ファイルが存在しないか、アクセスできない場合に返される値。サポートされるデータ型: [String](../data-types/string.md) および [NULL](/operations/settings/formats#input_format_null_as_default)。

**例**

a.txt および b.txt から文字列としてデータをテーブルに挿入する:

``` sql
INSERT INTO table SELECT file('a.txt'), file('b.txt');
```
