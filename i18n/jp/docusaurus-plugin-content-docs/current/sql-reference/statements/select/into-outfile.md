---
description: 'INTO OUTFILE 句に関するドキュメント'
sidebar_label: 'INTO OUTFILE'
slug: /sql-reference/statements/select/into-outfile
title: 'INTO OUTFILE 句'
doc_type: 'reference'
---

# INTO OUTFILE 句 {#into-outfile-clause}

`INTO OUTFILE` 句は、`SELECT` クエリの結果を **クライアント** 側のファイルにリダイレクトします。

圧縮ファイルをサポートします。圧縮方式はファイル名の拡張子によって自動検出されます（デフォルトではモード `'auto'` が使用されます）。または、`COMPRESSION` 句で明示的に指定することもできます。特定の圧縮方式に対する圧縮レベルは、`LEVEL` 句で指定できます。

**構文**

```sql
SELECT <expr_list> INTO OUTFILE file_name [AND STDOUT] [APPEND | TRUNCATE] [COMPRESSION type [LEVEL level]]
```

`file_name` と `type` は文字列リテラルです。サポートされている圧縮方式は次のとおりです: `'none'`, `'gzip'`, `'deflate'`, `'br'`, `'xz'`, `'zstd'`, `'lz4'`, `'bz2'`。

`level` は数値リテラルです。サポートされている正の整数の範囲は、`lz4` では `1-12`、`zstd` では `1-22`、その他の圧縮方式では `1-9` です。

## 実装の詳細 {#implementation-details}

* この機能は [command-line client](../../../interfaces/cli.md) と [clickhouse-local](../../../operations/utilities/clickhouse-local.md) で利用できます。したがって、[HTTP interface](/interfaces/http) 経由で送信されたクエリはエラーになります。
* 同じファイル名のファイルがすでに存在する場合、そのクエリはエラーになります。
* デフォルトの [出力フォーマット](../../../interfaces/formats.md) は `TabSeparated`（command-line client のバッチモードと同様）です。変更するには [FORMAT](format.md) 句を使用します。
* クエリ内で `AND STDOUT` が指定されている場合、ファイルに書き込まれる出力は標準出力にも表示されます。圧縮を使用している場合は、標準出力には非圧縮の出力が表示されます。
* クエリ内で `APPEND` が指定されている場合、出力は既存のファイルに追記されます。圧縮を使用している場合、`APPEND` は使用できません。
* 既存のファイルに書き込む場合は、`APPEND` または `TRUNCATE` を使用する必要があります。

**例**

[command-line client](../../../interfaces/cli.md) を使用して次のクエリを実行します:

```bash
clickhouse-client --query="SELECT 1,'ABC' INTO OUTFILE 'select.gz' FORMAT CSV;"
zcat select.gz 
```

結果：

```text
1,"ABC"
```
