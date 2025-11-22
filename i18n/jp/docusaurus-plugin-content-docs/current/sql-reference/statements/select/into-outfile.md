---
description: 'INTO OUTFILE 句のドキュメント'
sidebar_label: 'INTO OUTFILE'
slug: /sql-reference/statements/select/into-outfile
title: 'INTO OUTFILE 句'
doc_type: 'reference'
---



# INTO OUTFILE 句

`INTO OUTFILE` 句は、`SELECT` クエリの結果を **クライアント** 側のファイルへリダイレクトします。

圧縮ファイルもサポートされます。圧縮形式はファイル名の拡張子から検出されます（デフォルトではモード `'auto'` が使用されます）。または、`COMPRESSION` 句で明示的に指定することもできます。特定の圧縮形式に対する圧縮レベルは、`LEVEL` 句で指定できます。

**構文**

```sql
SELECT <expr_list> INTO OUTFILE file_name [AND STDOUT] [APPEND | TRUNCATE] [COMPRESSION type [LEVEL level]]
```

`file_name` と `type` は文字列リテラルです。サポートされている圧縮形式は `'none'`, `'gzip'`, `'deflate'`, `'br'`, `'xz'`, `'zstd'`, `'lz4'`, `'bz2'` です。

`level` は数値リテラルです。使用可能な正の整数の範囲は、`lz4` タイプでは `1-12`、`zstd` タイプでは `1-22`、その他の圧縮形式では `1-9` です。


## 実装の詳細 {#implementation-details}

- この機能は[コマンドラインクライアント](../../../interfaces/cli.md)および[clickhouse-local](../../../operations/utilities/clickhouse-local.md)で利用できます。そのため、[HTTPインターフェース](../../../interfaces/http.md)経由で送信されたクエリは失敗します。
- 同じファイル名のファイルが既に存在する場合、クエリは失敗します。
- デフォルトの[出力フォーマット](../../../interfaces/formats.md)は`TabSeparated`です(コマンドラインクライアントのバッチモードと同様)。変更するには[FORMAT](format.md)句を使用します。
- クエリに`AND STDOUT`が指定されている場合、ファイルに書き込まれる出力は標準出力にも表示されます。圧縮と併用する場合、平文が標準出力に表示されます。
- クエリに`APPEND`が指定されている場合、出力は既存のファイルに追記されます。圧縮を使用する場合、追記は使用できません。
- 既に存在するファイルに書き込む場合は、`APPEND`または`TRUNCATE`を使用する必要があります。

**例**

[コマンドラインクライアント](../../../interfaces/cli.md)を使用して次のクエリを実行します:

```bash
clickhouse-client --query="SELECT 1,'ABC' INTO OUTFILE 'select.gz' FORMAT CSV;"
zcat select.gz
```

結果:

```text
1,"ABC"
```
