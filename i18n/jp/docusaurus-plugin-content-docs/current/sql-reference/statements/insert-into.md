---
slug: '/sql-reference/statements/insert-into'
sidebar_position: 33
sidebar_label: 'INSERT INTO'
keywords: ['ClickHouse', 'INSERT INTO', 'SQL', 'database', 'データベース']
description: 'INSERT INTOステートメントはテーブルにデータを挿入します。'
---


# INSERT INTO ステートメント

テーブルにデータを挿入します。

**構文**

``` sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] [SETTINGS ...] VALUES (v11, v12, v13), (v21, v22, v23), ...
```

挿入するカラムのリストを `(c1, c2, c3)` を使用して指定できます。また、`*` や [APPLY](/sql-reference/statements/select#apply)、 [EXCEPT](/sql-reference/statements/select#except)、 [REPLACE](/sql-reference/statements/select#replace) などのカラム [マッチャー](../../sql-reference/statements/select/index.md#asterisk) や [モディファイア](../../sql-reference/statements/select/index.md#select-modifiers) を使用することもできます。

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

すべてのカラムにデータを挿入したいが、カラム `b` を除外したい場合は、`EXCEPT` キーワードを使用できます。上記の構文に基づいて、指定されたカラム `(c1, c3)` に対して同じ数の値 (`VALUES (v11, v13)`) を挿入する必要があります：

``` sql
INSERT INTO insert_select_testtable (* EXCEPT(b)) Values (2, 2);
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

この例では、2番目に挿入した行の `a` と `c` カラムは渡された値で埋められ、`b` カラムはデフォルト値で埋められていることがわかります。また、`DEFAULT` キーワードを使用してデフォルト値を挿入することも可能です：

``` sql
INSERT INTO insert_select_testtable VALUES (1, DEFAULT, 1) ;
```

カラムのリストにすべての既存のカラムが含まれていない場合、残りのカラムは以下で埋められます：

- テーブル定義に指定された `DEFAULT` 式から計算された値。
- `DEFAULT` 式が定義されていない場合はゼロと空の文字列。

データは ClickHouse がサポートする任意の [フォーマット](/sql-reference/formats) で `INSERT` に渡すことができます。フォーマットはクエリ内で明示的に指定する必要があります：

``` sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT format_name data_set
```

例えば、次のクエリフォーマットは基本版の `INSERT ... VALUES` と同じです：

``` sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT Values (v11, v12, v13), (v21, v22, v23), ...
```

ClickHouse はデータの前にすべての空白と1行の改行（もしあれば）を削除します。クエリを形成する際には、データがクエリ演算子の後に新しい行に配置されることをお勧めします。データが空白で始まる場合は特に重要です。

例：

``` sql
INSERT INTO t FORMAT TabSeparated
11  Hello, world!
22  Qwerty
```

[コマンドラインクライアント](/operations/utilities/clickhouse-local) または [HTTPインターフェース](/interfaces/http/) を使用して、クエリからデータを別々に挿入することもできます。

:::note
`INSERT` クエリに `SETTINGS` を指定したい場合は、`FORMAT` クローズの前に行う必要があります。なぜなら、`FORMAT format_name` の後のすべてはデータとして扱われるからです。例えば：

```sql
INSERT INTO table SETTINGS ... FORMAT format_name data_set
```
:::

## 制約 {#constraints}

テーブルに [制約](../../sql-reference/statements/create/table.md#constraints) がある場合、それらの式は挿入されたデータの各行に対してチェックされます。いずれかの制約が満たされない場合、サーバーは制約名と式を含む例外を発生させ、クエリは停止します。

## SELECT の結果を挿入する {#inserting-the-results-of-select}

**構文**

``` sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] SELECT ...
```

カラムは `SELECT` クローズ内の位置に応じてマッピングされます。ただし、`INSERT` のテーブル内の `SELECT` 式のカラム名は異なる場合があります。必要に応じて型キャストが行われます。

値を `now()` や `1 + 2` などの式に設定することは、Values フォーマットを除くデータフォーマットでは許可されていません。Values フォーマットは限られた式の使用を許可していますが、これはお勧めしません。この場合、非効率的なコードが実行されます。

データパーツを変更する他のクエリはサポートされていません：`UPDATE`、`DELETE`、`REPLACE`、`MERGE`、`UPSERT`、`INSERT UPDATE`。しかし、`ALTER TABLE ... DROP PARTITION` を使用して古いデータを削除することができます。

`SELECT` クローズにテーブル関数 [input()](../../sql-reference/table-functions/input.md) が含まれる場合、`FORMAT` クローズはクエリの最後に指定する必要があります。

非NULLデータ型のカラムに `NULL` の代わりにデフォルト値を挿入するには、[insert_null_as_default](../../operations/settings/settings.md#insert_null_as_default) 設定を有効にします。

`INSERT` は CTE（共通テーブル式）もサポートしています。例えば、次の2つのステートメントは同等です：

``` sql
INSERT INTO x WITH y AS (SELECT * FROM numbers(10)) SELECT * FROM y;
WITH y AS (SELECT * FROM numbers(10)) INSERT INTO x SELECT * FROM y;
```

## ファイルからデータを挿入する {#inserting-data-from-a-file}

**構文**

``` sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] FROM INFILE file_name [COMPRESSION type] [SETTINGS ...] [FORMAT format_name]
```

上記の構文を使用して、**クライアント**側に保存されたファイル、またはファイルからデータを挿入します。`file_name` と `type` は文字列リテラルです。入力ファイルの [フォーマット](../../interfaces/formats.md) は、`FORMAT` クローズで設定する必要があります。

圧縮ファイルがサポートされています。圧縮タイプはファイル名の拡張子によって検出されます。または、`COMPRESSION` クローズで明示的に指定することもできます。サポートされているタイプは： `'none'`、 `'gzip'`、 `'deflate'`、 `'br'`、 `'xz'`、 `'zstd'`、 `'lz4'`、 `'bz2'` です。

この機能は [コマンドラインクライアント](../../interfaces/cli.md) と [clickhouse-local](../../operations/utilities/clickhouse-local.md) で利用可能です。

**例**

### FROM INFILE 付きの単一ファイル {#single-file-with-from-infile}

次のクエリを [コマンドラインクライアント](../../interfaces/cli.md) を使用して実行します：

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

### glob を使用して FROM INFILE から複数ファイルを挿入する {#multiple-files-with-from-infile-using-globs}

この例は前の例に非常に似ていますが、`FROM INFILE 'input_*.csv'` を使用して複数のファイルから挿入を行います。

```bash
echo 1,A > input_1.csv ; echo 2,B > input_2.csv
clickhouse-client --query="CREATE TABLE infile_globs (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;"
clickhouse-client --query="INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;"
clickhouse-client --query="SELECT * FROM infile_globs FORMAT PrettyCompact;"
```

:::tip
`*` を使用して複数のファイルを選択することに加えて、範囲（`{1,2}` または `{1..9}`）や他の [glob 置換](/sql-reference/table-functions/file.md/#globs-in-path) を使用することができます。これらの3つはすべて、上記の例で機能します：

```sql
INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_{1,2}.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_?.csv' FORMAT CSV;
```
:::

## テーブル関数を使用して挿入する {#inserting-using-a-table-function}

データは [テーブル関数](../../sql-reference/table-functions/index.md) で参照されるテーブルに挿入できます。

**構文**

``` sql
INSERT INTO [TABLE] FUNCTION table_func ...
```

**例**

次のクエリでは [remote](/sql-reference/table-functions/remote) テーブル関数が使用されます：

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

デフォルトでは、ClickHouse Cloud 上のサービスは高可用性のために複数のレプリカを提供します。サービスに接続すると、これらのレプリカのいずれかに接続が確立されます。

`INSERT` が成功すると、データが基盤となるストレージに書き込まれます。ただし、レプリカがこれらの更新を受け取るまでに時間がかかる場合があります。したがって、これらの他のレプリカのいずれかで `SELECT` クエリを実行する別の接続を使用した場合、更新されたデータがまだ反映されていない可能性があります。

`select_sequential_consistency` を使用して、レプリカに最新の更新を強制的に受信させることができます。次のように設定を使用した `SELECT` クエリの例を示します：

```sql
SELECT .... SETTINGS select_sequential_consistency = 1;
```

`select_sequential_consistency` を使用すると、ClickHouse Cloud 内部で使用される ClickHouse Keeper の負荷が増加し、サービスの負荷に応じてパフォーマンスが低下する可能性があることに注意してください。この設定を有効にすることは、必要でない限りお勧めしません。推奨のアプローチは、同じセッション内で読み書きを実行するか、ネイティブプロトコルを使用するクライアントドライバを使用することです（つまり、ステッキー接続をサポートしています）。

## レプリケーションされたセットアップへの挿入 {#inserting-into-a-replicated-setup}

レプリケーションされたセットアップでは、データがレプリケートされた後、他のレプリカでも表示されます。`INSERT` 直後からデータのレプリケーション（他のレプリカにダウンロード）が始まります。これは、データが共有ストレージに即座に書き込まれ、レプリカがメタデータの変更を購読する ClickHouse Cloud とは異なります。

レプリケーションされたセットアップでは、`INSERT` が時折かなりの時間（約1秒）かかることがあることに注意してください。これは、分散コンセンサスのために ClickHouse Keeper にコミットする必要があるためです。ストレージに S3 を使用する場合は、追加のレイテンシが加わります。

## パフォーマンスに関する考慮事項 {#performance-considerations}

`INSERT` は入力データを主キーでソートし、パーティションキーでパーティションに分割します。同時にいくつかのパーティションにデータを挿入すると、`INSERT` クエリのパフォーマンスが大幅に低下する可能性があります。これを回避するためには：

- 比較的大きなバッチでデータを追加します。例えば、100,000行ずつ。
- ClickHouse にアップロードする前にパーティションキーでデータをグループ化します。

リアルタイムでデータが追加される場合や、通常は時間でソートされたデータをアップロードする場合は、パフォーマンスが低下しません。

### 非同期挿入 {#asynchronous-inserts}

小さくても頻繁にデータを非同期に挿入することが可能です。このような挿入からのデータはバッチにまとめられ、安全にテーブルに挿入されます。非同期挿入を使用するには、[`async_insert`](/operations/settings/settings#async_insert) 設定を有効にします。

`async_insert` または [`Buffer` テーブルエンジン](/engines/table-engines/special/buffer) を使用すると、追加のバッファリングが発生します。

### 大規模または長時間にわたる挿入 {#large-or-long-running-inserts}

大量のデータを挿入しているとき、ClickHouse は「スカッシング」と呼ばれるプロセスを通じて書き込みパフォーマンスを最適化します。メモリ内に挿入された小さなデータブロックはマージされ、大きなブロックにスカッシュされてディスクに書き込まれます。スカッシングは、各書き込み操作に関連するオーバーヘッドを削減します。このプロセスでは、挿入されたデータは ClickHouse が [`max_insert_block_size`](/operations/settings/settings#max_insert_block_size) 行の書き込みを完了した後にクエリ可能になります。

**関連項目**

- [async_insert](/operations/settings/settings#async_insert)
- [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert)
- [wait_for_async_insert_timeout](/operations/settings/settings#wait_for_async_insert_timeout)
- [async_insert_max_data_size](/operations/settings/settings#async_insert_max_data_size)
- [async_insert_busy_timeout_ms](/operations/settings/settings#async_insert_busy_timeout_max_ms)
- [async_insert_stale_timeout_ms](/operations/settings/settings#async_insert_max_data_size)
