---
slug: /sql-reference/statements/insert-into
sidebar_position: 33
sidebar_label: INSERT INTO
---


# INSERT INTO ステートメント

テーブルにデータを挿入します。

**構文**

``` sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] [SETTINGS ...] VALUES (v11, v12, v13), (v21, v22, v23), ...
```

挿入するカラムのリストは `(c1, c2, c3)` を使って指定できます。また、カラム [マッチャー](../../sql-reference/statements/select/index.md#asterisk) である `*` および/または [修飾子](../../sql-reference/statements/select/index.md#select-modifiers) である [APPLY](../../sql-reference/statements/select/index.md#apply-modifier)、[EXCEPT](../../sql-reference/statements/select/index.md#except-modifier)、[REPLACE](../../sql-reference/statements/select/index.md#replace-modifier) を使うこともできます。

例えば、次のテーブルを考えてみましょう：

``` sql
SHOW CREATE insert_select_testtable;
```

```text
CREATE TABLE insert_select_testtable
(
    `a` Int8,
    `b` String,
    `c` Int8
)
ENGINE = MergeTree()
ORDER BY a
```

``` sql
INSERT INTO insert_select_testtable (*) VALUES (1, 'a', 1) ;
```

すべてのカラムにデータを挿入したいが、カラム `b` を除外したい場合は、`EXCEPT` キーワードを使用して挿入できます。上記の構文を参照すると、指定されたカラム (`(c1, c3)`) と同じ数の値 (`VALUES (v11, v13)`) を挿入する必要があります：

``` sql
INSERT INTO insert_select_testtable (* EXCEPT(b)) VALUES (2, 2);
```

``` sql
SELECT * FROM insert_select_testtable;
```

```text
┌─a─┬─b─┬─c─┐
│ 2 │   │ 2 │
└───┴───┴───┘
┌─a─┬─b─┬─c─┐
│ 1 │ a │ 1 │
└───┴───┴───┘
```

この例では、二番目に挿入された行のカラム `a` と `c` が渡された値で埋められ、カラム `b` はデフォルトの値で埋められています。また、`DEFAULT` キーワードを使用してデフォルト値を挿入することも可能です：

``` sql
INSERT INTO insert_select_testtable VALUES (1, DEFAULT, 1) ;
```

カラムのリストにすべての既存カラムが含まれていない場合、残りのカラムは以下で埋められます：

- テーブル定義に指定された `DEFAULT` 式から計算された値。
- `DEFAULT` 式が定義されていない場合は、ゼロおよび空文字列。

データは、`INSERT` にサポートされている任意の [フォーマット](/interfaces/formats.md#formats) で渡すことができます。フォーマットはクエリ内で明示的に指定する必要があります：

``` sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT format_name data_set
```

例えば、以下のクエリフォーマットは `INSERT ... VALUES` の基本バージョンと同じです：

``` sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT VALUES (v11, v12, v13), (v21, v22, v23), ...
```

ClickHouse はデータの前にすべての空白と1つの改行を削除します。クエリを形成する際、データがクエリ演算子の後の新しい行に配置されることをお勧めします。データが空白で始まる場合には特に重要です。

例：

``` sql
INSERT INTO t FORMAT TabSeparated
11  Hello, world!
22  Qwerty
```

クエリとは別にデータを挿入することも、[コマンドラインクライアント](/operations/utilities/clickhouse-local) や [HTTP インターフェース](/docs/interfaces/http/) を使用することで可能です。

:::note
`INSERT` クエリのために `SETTINGS` を指定したい場合は、`FORMAT` 句の前に行う必要があります。`FORMAT format_name` の以降はすべてデータとして扱われます。例えば：

```sql
INSERT INTO table SETTINGS ... FORMAT format_name data_set
```
:::

## 制約 {#constraints}

テーブルに [制約](../../sql-reference/statements/create/table.md#constraints) がある場合、これらの式は挿入されたデータの各行に対してチェックされます。もしその制約のいずれかが満たされない場合、サーバーは制約名と式を含む例外を発生させ、クエリは停止します。

## SELECT の結果を挿入する {#inserting-the-results-of-select}

**構文**

``` sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] SELECT ...
```

カラムは `SELECT` 句内の位置に従ってマッピングされます。ただし、`SELECT` 式の名前と `INSERT` テーブルの名前は異なる場合があります。必要に応じて型キャストが行われます。

Values フォーマット以外のデータフォーマットでは、`now()`、`1 + 2` などの式に値を設定することは認められていません。Values フォーマットでは式の使用が制限されていますが、推奨されません。この場合、効率の悪いコードが実行されるためです。

データパーツを変更する他のクエリはサポートされていません：`UPDATE`、`DELETE`、`REPLACE`、`MERGE`、`UPSERT`、`INSERT UPDATE`。
ただし、`ALTER TABLE ... DROP PARTITION` を使用して古いデータを削除することは可能です。

`SELECT` 句にテーブル関数 [input()](../../sql-reference/table-functions/input.md) が含まれている場合、`FORMAT` 句はクエリの最後に指定する必要があります。

`NULL` の代わりに非NULLデータ型のカラムにデフォルト値を挿入するには、[insert_null_as_default](../../operations/settings/settings.md#insert_null_as_default) 設定を有効にします。

`INSERT` は CTE（共通テーブル式）もサポートします。例えば、次の2つの文は同等です：

``` sql
INSERT INTO x WITH y AS (SELECT * FROM numbers(10)) SELECT * FROM y;
WITH y AS (SELECT * FROM numbers(10)) INSERT INTO x SELECT * FROM y;
```


## ファイルからデータを挿入する {#inserting-data-from-a-file}

**構文**

``` sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] FROM INFILE file_name [COMPRESSION type] [SETTINGS ...] [FORMAT format_name]
```

上記の構文を使用して、**クライアント**側に保存されているファイルからデータを挿入します。`file_name` と `type` は文字列リテラルです。入力ファイル [フォーマット](../../interfaces/formats.md) は `FORMAT` 句で指定する必要があります。

圧縮ファイルがサポートされています。圧縮タイプはファイル名の拡張子によって検出されます。また、`COMPRESSION` 句で明示的に指定することもできます。サポートされているタイプは `'none'`、`'gzip'`、`'deflate'`、`'br'`、`'xz'`、`'zstd'`、`'lz4'`、`'bz2'` です。

この機能は [コマンドラインクライアント](../../interfaces/cli.md) および [clickhouse-local](../../operations/utilities/clickhouse-local.md) で利用できます。

**例**

### FROM INFILE を使用した単一ファイル {#single-file-with-from-infile}

次のクエリを [コマンドラインクライアント](../../interfaces/cli.md) を使用して実行します。

```bash
echo 1,A > input.csv ; echo 2,B >> input.csv
clickhouse-client --query="CREATE TABLE table_from_file (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;"
clickhouse-client --query="INSERT INTO table_from_file FROM INFILE 'input.csv' FORMAT CSV;"
clickhouse-client --query="SELECT * FROM table_from_file FORMAT PrettyCompact;"
```

結果：

```text
┌─id─┬─text─┐
│  1 │ A    │
│  2 │ B    │
└────┴──────┘
```

### グロブを使用した FROM INFILE による複数のファイル {#multiple-files-with-from-infile-using-globs}

この例は前の例と非常に似ており、`FROM INFILE 'input_*.csv` を使用して複数のファイルから挿入が行われます。

```bash
echo 1,A > input_1.csv ; echo 2,B > input_2.csv
clickhouse-client --query="CREATE TABLE infile_globs (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;"
clickhouse-client --query="INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;"
clickhouse-client --query="SELECT * FROM infile_globs FORMAT PrettyCompact;"
```

:::tip
`*` を使用して複数のファイルを選択するだけでなく、範囲（`{1,2}` または `{1..9}`）や他の [グロブ置換](/sql-reference/table-functions/file.md/#globs-in-path) を使用することもできます。これらの3つはすべて前の例として機能します：

```sql
INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_{1,2}.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_?.csv' FORMAT CSV;
```
:::

## テーブル関数を使用して挿入する {#inserting-using-a-table-function}

[テーブル関数](../../sql-reference/table-functions/index.md) で参照されるテーブルにデータを挿入できます。

**構文**

``` sql
INSERT INTO [TABLE] FUNCTION table_func ...
```

**例**

以下のクエリでは [remote](../../sql-reference/table-functions/index.md#remote) テーブル関数が使用されています：

``` sql
CREATE TABLE simple_table (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;
INSERT INTO TABLE FUNCTION remote('localhost', default.simple_table)
    VALUES (100, 'inserted via remote()');
SELECT * FROM simple_table;
```

結果：

``` text
┌──id─┬─text──────────────────┐
│ 100 │ inserted via remote() │
└─────┴───────────────────────┘
```

## ClickHouse Cloud への挿入 {#inserting-into-clickhouse-cloud}

デフォルトでは、ClickHouse Cloud のサービスは高可用性のために複数のレプリカを提供します。サービスに接続すると、それらのレプリカのいずれかに接続が確立されます。

`INSERT` が成功すると、データは基盤となるストレージに書き込まれます。ただし、レプリカがこれらの更新を受け取るまでに時間がかかる場合があります。そのため、他のレプリカのいずれかで `SELECT` クエリを実行すると、更新されたデータがまだ反映されていない場合があります。

`select_sequential_consistency` を使用して、レプリカが最新の更新を受け取るように強制することも可能です。この設定を使用した `SELECT` クエリの例は次の通りです：

```sql
SELECT .... SETTINGS select_sequential_consistency = 1;
```

`select_sequential_consistency` を使用すると、ClickHouse Keeper（ClickHouse Cloud 内部で使用される）への負荷が増加し、サービスの負荷に応じてパフォーマンスが低下する可能性があります。この設定を有効にする必要がない限り、推奨されません。推奨されるアプローチは、同じセッションで読み書きを実行するか、ネイティブプロトコルを使用するクライアントドライバーを使用することです（したがって、スティッキー接続をサポートします）。

## レプリケーション環境への挿入 {#inserting-into-a-replicated-setup}

レプリケーション環境では、データはレプリケーションされた後、他のレプリカで見ることができます。`INSERT` 直後にデータがレプリケーション（他のレプリカへダウンロード）され始めます。これは、ClickHouse Cloud の場合とは異なり、データは共有ストレージに即座に書き込まれ、レプリカはメタデータの変更を購読します。

レプリケーション環境では、`INSERT` が時にかなりの時間（1秒単位）かかる場合があります。これは、分散コンセンサスのために ClickHouse Keeper にコミットする必要があるためです。S3 をストレージとして使用することも追加の待機時間を増加させます。

## パフォーマンスに関する考慮事項 {#performance-considerations}

`INSERT` は入力データを主キーでソートし、パーティションキーでパーティション分割します。一度に複数のパーティションにデータを挿入すると、`INSERT` クエリのパフォーマンスが著しく低下する可能性があります。これを避けるために：

- 100,000 行などのかなり大きなバッチでデータを追加します。
- ClickHouse にアップロードする前に、パーティションキーでデータをグループ化します。

リアルタイムでデータが追加される場合や、通常時間でソートされたデータをアップロードする場合は、パフォーマンスが低下することはありません。

### 非同期挿入 {#asynchronous-inserts}

小さいが頻繁なデータ挿入を非同期で行うことが可能です。そのような挿入からのデータはバッチにまとめられ、安全にテーブルに挿入されます。非同期挿入を使用するには、[`async_insert`](/operations/settings/settings#async_insert) 設定を有効にします。

`async_insert` または [`Buffer` テーブルエンジン](/engines/table-engines/special/buffer) を使用すると、追加のバッファリングが発生します。

### 大量または長時間実行される挿入 {#large-or-long-running-inserts}

大量のデータを挿入すると、ClickHouse は "スカッシュ" と呼ばれるプロセスを通じて書き込みパフォーマンスを最適化します。メモリ内の小さな挿入されたデータブロックがマージされ、大きなブロックに圧縮されてからディスクに書き込まれます。スカッシュは各書き込み操作に関連するオーバーヘッドを削減します。このプロセスでは、挿入されたデータは ClickHouse がそれぞれの [`max_insert_block_size`](/operations/settings/settings#max_insert_block_size) 行の書き込みを完了した後にクエリ可能となります。

**参照**

- [async_insert](/operations/settings/settings#async_insert)
- [async_insert_threads](../../operations/settings/settings.md#async-insert-threads)
- [wait_for_async_insert](/operations/settings/settings.md#wait_for_async_insert)
- [wait_for_async_insert_timeout](../../operations/settings/settings.md#wait-for-async-insert-timeout)
- [async_insert_max_data_size](../../operations/settings/settings.md#async-insert-max-data-size)
- [async_insert_busy_timeout_ms](../../operations/settings/settings.md#async-insert-busy-timeout-ms)
- [async_insert_stale_timeout_ms](../../operations/settings/settings.md#async-insert-stale-timeout-ms)

