---
'description': 'INTO OUTFILE 句に関するドキュメント'
'sidebar_label': 'INTO OUTFILE'
'slug': '/sql-reference/statements/select/into-outfile'
'title': 'INTO OUTFILE 句'
'doc_type': 'reference'
---


# INTO OUTFILE 句

`INTO OUTFILE` 句は、`SELECT` クエリの結果を **クライアント** 側のファイルにリダイレクトします。

圧縮ファイルがサポートされています。圧縮タイプはファイル名の拡張子によって検出されます（デフォルトではモード `'auto'` が使用されます）。また、`COMPRESSION` 句で明示的に指定することもできます。特定の圧縮タイプの圧縮レベルは、`LEVEL` 句で指定できます。

**構文**

```sql
SELECT <expr_list> INTO OUTFILE file_name [AND STDOUT] [APPEND | TRUNCATE] [COMPRESSION type [LEVEL level]]
```

`file_name` と `type` は文字列リテラルです。サポートされている圧縮タイプは次の通りです：`'none'`、`'gzip'`、`'deflate'`、`'br'`、`'xz'`、`'zstd'`、`'lz4'`、`'bz2'`。

`level` は数値リテラルです。次の範囲の正の整数がサポートされています：`1-12` は `lz4` タイプ、`1-22` は `zstd` タイプ、そして `1-9` は他の圧縮タイプです。

## 実装の詳細 {#implementation-details}

- この機能は [コマンドラインクライアント](../../../interfaces/cli.md) と [clickhouse-local](../../../operations/utilities/clickhouse-local.md) で利用可能です。したがって、[HTTPインターフェース](../../../interfaces/http.md) を介して送信されたクエリは失敗します。
- 同じファイル名のファイルが既に存在する場合、クエリは失敗します。
- デフォルトの [出力形式](../../../interfaces/formats.md) は `TabSeparated` です（コマンドラインクライアントのバッチモードと同様）。これを変更するには [FORMAT](format.md) 句を使用します。
- クエリに `AND STDOUT` が含まれている場合、ファイルに書き込まれる出力は標準出力にも表示されます。圧縮が使用される場合、プレーンテキストが標準出力に表示されます。
- クエリに `APPEND` が含まれている場合、出力は既存のファイルに追加されます。圧縮が使用される場合、追加は使用できません。
- 既に存在するファイルに書き込む場合は、`APPEND` または `TRUNCATE` を使用する必要があります。

**例**

次のクエリを [コマンドラインクライアント](../../../interfaces/cli.md) を使用して実行します：

```bash
clickhouse-client --query="SELECT 1,'ABC' INTO OUTFILE 'select.gz' FORMAT CSV;"
zcat select.gz 
```

結果：

```text
1,"ABC"
```
