---
'description': 'Filesに関するドキュメント'
'sidebar_label': 'ファイル'
'slug': '/sql-reference/functions/files'
'title': 'ファイル'
'doc_type': 'reference'
---

## file {#file}

ファイルを文字列として読み込み、指定されたカラムにデータをロードします。ファイルの内容は解釈されません。

詳しくは、テーブル関数 [file](../table-functions/file.md) を参照してください。

**構文**

```sql
file(path[, default])
```

**引数**

- `path` — [user_files_path](../../operations/server-configuration-parameters/settings.md#user_files_path) に対するファイルのパス。ワイルドカード `*`, `**`, `?`, `{abc,def}` および `{N..M}` （ここで、`N` と `M` は数字、`'abc', 'def'` は文字列）をサポートしています。
- `default` — ファイルが存在しないか、アクセスできない場合に返される値。サポートされているデータ型: [String](../data-types/string.md) と [NULL](/operations/settings/formats#input_format_null_as_default)。

**例**

ファイル a.txt と b.txt からデータを文字列としてテーブルに挿入します：

```sql
INSERT INTO table SELECT file('a.txt'), file('b.txt');
```
