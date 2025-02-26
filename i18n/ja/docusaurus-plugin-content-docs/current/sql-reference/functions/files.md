---
slug: /sql-reference/functions/files
sidebar_position: 75
sidebar_label: ファイル
---

## file {#file}

ファイルを文字列として読み込み、指定されたカラムにデータをロードします。ファイルの内容は解釈されません。

テーブル関数 [file](../table-functions/file.md) も参照してください。

**構文**

``` sql
file(path[, default])
```

**引数**

- `path` — [user_files_path](../../operations/server-configuration-parameters/settings.md#user_files_path) に対するファイルの相対パス。ワイルドカード `*`, `**`, `?`, `{abc,def}` および `{N..M}` をサポートしており、ここで `N`, `M` は数字、`'abc', 'def'` は文字列です。
- `default` — ファイルが存在しない、またはアクセスできない場合に返される値。サポートされているデータ型: [String](../data-types/string.md) と [NULL](../../sql-reference/syntax.md#null-literal)。

**例**

ファイル a.txt と b.txt から文字列としてテーブルにデータを挿入します：

``` sql
INSERT INTO table SELECT file('a.txt'), file('b.txt');
```
