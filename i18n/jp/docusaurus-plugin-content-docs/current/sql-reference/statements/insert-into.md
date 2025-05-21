description: 'INSERT INTO ステートメントに関するドキュメント'
sidebar_label: 'INSERT INTO'
sidebar_position: 33
slug: /sql-reference/statements/insert-into
title: 'INSERT INTO ステートメント'
```


# INSERT INTO ステートメント

テーブルにデータを挿入します。

**構文**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] [SETTINGS ...] VALUES (v11, v12, v13), (v21, v22, v23), ...
```

挿入するカラムのリストを `(c1, c2, c3)` を使って指定できます。また、`*` などのカラムの [マッチャー](../../sql-reference/statements/select/index.md#asterisk) または、[APPLY](/sql-reference/statements/select#apply)、[EXCEPT](/sql-reference/statements/select#except)、[REPLACE](/sql-reference/statements/select#replace) などの [修飾子](../../sql-reference/statements/select/index.md#select-modifiers) を含む式を使用することもできます。

例えば、以下のテーブルを考えます：

```sql
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

```sql
INSERT INTO insert_select_testtable (*) VALUES (1, 'a', 1) ;
```

すべてのカラムにデータを挿入したい場合は、カラム `b` を除外して `EXCEPT` キーワードを使用することができます。この場合、挿入する値の数 (`VALUES (v11, v13)`) と指定するカラムの数 (`(c1, c3)`) が一致する必要があります：

```sql
INSERT INTO insert_select_testtable (* EXCEPT(b)) VALUES (2, 2);
```

```sql
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

この例では、二番目に挿入された行は `a` および `c` カラムが渡された値で埋められていますが、`b` カラムはデフォルト値で埋められています。`DEFAULT` キーワードを使ってデフォルト値を挿入することも可能です：

```sql
INSERT INTO insert_select_testtable VALUES (1, DEFAULT, 1) ;
```

カラムリストにすべての既存カラムが含まれていない場合、残りのカラムには次のように値が埋め込まれます：

- テーブル定義で指定された `DEFAULT` 式から計算された値。
- `DEFAULT` 式が定義されていない場合はゼロや空の文字列。

データは、ClickHouse がサポートする任意の [フォーマット](/sql-reference/formats) で `INSERT` に渡すことができます。フォーマットはクエリ中で明示的に指定する必要があります：

```sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT format_name data_set
```

例えば、以下のクエリフォーマットは基本の `INSERT ... VALUES` バージョンと同じです：

```sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT VALUES (v11, v12, v13), (v21, v22, v23), ...
```

ClickHouse はデータの前に全てのスペースと一行の改行（ある場合）を削除します。クエリを形成する際には、データをクエリオペレーターの後の新しい行に置くことを推奨します。これはデータがスペースで始まる場合に重要です。

例：

```sql
INSERT INTO t FORMAT TabSeparated
11  Hello, world!
22  Qwerty
```

[コマンドラインクライアント](/operations/utilities/clickhouse-local) や [HTTPインターフェース](/interfaces/http/) を使用して、クエリとは別にデータを挿入することもできます。

:::note
`INSERT` クエリに対して `SETTINGS` を指定したい場合は、`FORMAT` 節の前に行う必要があります。`FORMAT format_name` の後はすべてデータとして扱われます。例えば：

```sql
INSERT INTO table SETTINGS ... FORMAT format_name data_set
```
:::

## 制約 {#constraints}

テーブルに [制約](../../sql-reference/statements/create/table.md#constraints) がある場合、挿入されたデータの各行に対してその式がチェックされます。制約が満たされない場合、サーバーは制約名と式を含む例外を発生させ、クエリは停止します。

## SELECT の結果を挿入する {#inserting-the-results-of-select}

**構文**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] SELECT ...
```

カラムは `SELECT` 節の位置に応じてマッピングされます。ただし、`SELECT` 式内の名前と `INSERT` 用のテーブルの名前は異なっていてもかまいません。必要であれば、型変換が行われます。

Values 形式以外のデータ形式は、`now()` や `1 + 2` などの式に値を設定することを許可していません。Values 形式は限られた使用を許しますが、実行のために非効率的なコードが使用されるため、推奨されません。

データパーツを変更するための他のクエリはサポートされていません：`UPDATE`、`DELETE`、`REPLACE`、`MERGE`、`UPSERT`、`INSERT UPDATE`。
ただし、`ALTER TABLE ... DROP PARTITION` を使用して古いデータを削除することができます。

`SELECT` 節がテーブル関数 [input()](../../sql-reference/table-functions/input.md) を含む場合、`FORMAT` 節はクエリの最後に指定する必要があります。

非NULL型のカラムに対して `NULL` の代わりにデフォルト値を挿入するには、[insert_null_as_default](../../operations/settings/settings.md#insert_null_as_default) 設定を有効にします。

`INSERT` は CTE（共通テーブル式）もサポートしています。例えば、次の2つのステートメントは等価です：

```sql
INSERT INTO x WITH y AS (SELECT * FROM numbers(10)) SELECT * FROM y;
WITH y AS (SELECT * FROM numbers(10)) INSERT INTO x SELECT * FROM y;
```

## ファイルからデータを挿入する {#inserting-data-from-a-file}

**構文**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] FROM INFILE file_name [COMPRESSION type] [SETTINGS ...] [FORMAT format_name]
```

上記の構文を使用して、**クライアント**側に保存されているファイルからデータを挿入します。`file_name` と `type` は文字列リテラルです。入力ファイルの [フォーマット](../../interfaces/formats.md) は `FORMAT` 節で指定する必要があります。

圧縮ファイルもサポートされています。圧縮タイプはファイル名の拡張子から検出されます。また、`COMPRESSION` 節で明示的に指定することもできます。サポートされているタイプは：`'none'`、`'gzip'`、`'deflate'`、`'br'`、`'xz'`、`'zstd'`、`'lz4'`、`'bz2'` です。

この機能は [コマンドラインクライアント](../../interfaces/cli.md) および [clickhouse-local](../../operations/utilities/clickhouse-local.md) で利用可能です。

**例**

### FROM INFILE を使用した単一ファイル {#single-file-with-from-infile}

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

### グロブを使用したFROM INFILEによる複数ファイル {#multiple-files-with-from-infile-using-globs}

この例は非常に似ていますが、`FROM INFILE 'input_*.csv'` を使用して複数のファイルから挿入を行います。

```bash
echo 1,A > input_1.csv ; echo 2,B > input_2.csv
clickhouse-client --query="CREATE TABLE infile_globs (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;"
clickhouse-client --query="INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;"
clickhouse-client --query="SELECT * FROM infile_globs FORMAT PrettyCompact;"
```

:::tip
`*` を使った複数ファイルの選択に加えて、範囲（`{1,2}` または `{1..9}`）や他の [グロブの置換](/sql-reference/table-functions/file.md/#globs-in-path) を使用することもできます。これら3つはいずれも上記の例で機能します：

```sql
INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_{1,2}.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_?.csv' FORMAT CSV;
```
:::

## テーブル関数を使用して挿入する {#inserting-using-a-table-function}

データは [テーブル関数](../../sql-reference/table-functions/index.md) によって参照されるテーブルに挿入できます。

**構文**

```sql
INSERT INTO [TABLE] FUNCTION table_func ...
```

**例**

以下のクエリでは [remote](/sql-reference/table-functions/remote) テーブル関数が使用されています：

```sql
CREATE TABLE simple_table (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;
INSERT INTO TABLE FUNCTION remote('localhost', default.simple_table)
    VALUES (100, 'inserted via remote()');
SELECT * FROM simple_table;
```

結果：

```text
┌──id─┬─text──────────────────┐
│ 100 │ inserted via remote() │
└─────┴───────────────────────┘
```

## ClickHouse Cloud への挿入 {#inserting-into-clickhouse-cloud}

デフォルトでは、ClickHouse Cloud のサービスは高可用性のために複数のレプリカを提供します。サービスに接続すると、これらのレプリカのいずれかに接続されます。

`INSERT` が成功すると、データは基盤となるストレージに書き込まれます。ただし、レプリカがこれらの更新を受け取るにはしばらく時間がかかる場合があります。したがって、異なる接続を使用してこれらの他のレプリカのいずれかで `SELECT` クエリを実行すると、更新されたデータがまだ反映されていない場合があります。

`select_sequential_consistency` を使用して、レプリカが最新の更新を受信するように強制することが可能です。以下はこの設定を使用した `SELECT` クエリの例です：

```sql
SELECT .... SETTINGS select_sequential_consistency = 1;
```

`select_sequential_consistency` を使用すると、ClickHouse Keeper（ClickHouse Cloud 内部で使用される）への負荷が増加し、サービスの負荷に応じてパフォーマンスが遅くなる可能性があることに注意してください。この設定は、必要な場合を除いて有効にしないことをお勧めします。推奨されるアプローチは、同じセッション内で読み書きを実行するか、ネイティブプロトコルを使用するクライアントドライバを使用することです（そのため、スティッキー接続をサポートします）。

## レプリケートされたセットアップへの挿入 {#inserting-into-a-replicated-setup}

レプリケートされたセットアップでは、データはレプリケーションが完了した後、他のレプリカでも表示されます。データは `INSERT` 直後にすぐにレプリケート（他のレプリカにダウンロード）され始めます。これは、ClickHouse Cloud と異なり、データが共有ストレージに即座に書き込まれ、レプリカがメタデータの変更を購読する場合とは異なります。

レプリケートされたセットアップでは、`INSERT` が時々かなりの時間（約1秒）かかる場合があります。これは、分散コンセンサスのために ClickHouse Keeper にコミットする必要があるためです。S3をストレージとして使用することも追加の遅延を引き起こします。

## パフォーマンスに関する考慮事項 {#performance-considerations}

`INSERT` は入力データを主キーでソートし、パーティションキーでパーティションに分割します。一度に複数のパーティションにデータを挿入すると、`INSERT` クエリのパフォーマンスが大幅に低下する可能性があります。これを避けるためには：

- 100,000 行などの比較的大きなバッチでデータを追加します。
- データを ClickHouse にアップロードする前に、パーティションキーでグループ化します。

リアルタイムでデータが追加されている場合や、通常は時間でソートされたデータをアップロードする場合、パフォーマンスが低下することはありません。

### 非同期挿入 {#asynchronous-inserts}

小さいが頻繁な挿入で非同期にデータを挿入することができます。このような挿入からのデータはバッチに統合され、その後安全にテーブルに挿入されます。非同期挿入を使用するには、[`async_insert`](/operations/settings/settings#async_insert) 設定を有効にします。

`async_insert` または [`Buffer` テーブルエンジン](/engines/table-engines/special/buffer) の使用は、追加のバッファリングをもたらします。

### 大きなデータや長時間実行する挿入 {#large-or-long-running-inserts}

大量のデータを挿入する場合、ClickHouse は「スクワッシング」と呼ばれるプロセスを通じて書き込みパフォーマンスを最適化します。メモリ内の挿入されたデータの小さなブロックが結合され、大きなブロックに圧縮されてからディスクに書き込まれます。スクワッシングは、各書き込み操作に関連するオーバーヘッドを削減します。このプロセスでは、挿入されたデータは ClickHouse が [`max_insert_block_size`](/operations/settings/settings#max_insert_block_size) 行の書き込みを完了した後にクエリ可能になります。

**参照**

- [async_insert](/operations/settings/settings#async_insert)
- [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert)
- [wait_for_async_insert_timeout](/operations/settings/settings#wait_for_async_insert_timeout)
- [async_insert_max_data_size](/operations/settings/settings#async_insert_max_data_size)
- [async_insert_busy_timeout_ms](/operations/settings/settings#async_insert_busy_timeout_max_ms)
- [async_insert_stale_timeout_ms](/operations/settings/settings#async_insert_max_data_size)
