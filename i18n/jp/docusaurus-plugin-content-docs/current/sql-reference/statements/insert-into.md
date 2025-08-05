---
description: 'INSERT INTO ステートメントのドキュメント'
sidebar_label: 'INSERT INTO'
sidebar_position: 33
slug: '/sql-reference/statements/insert-into'
title: 'INSERT INTO ステートメント'
---




# INSERT INTO ステートメント

テーブルにデータを挿入します。

**構文**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] [SETTINGS ...] VALUES (v11, v12, v13), (v21, v22, v23), ...
```

挿入するカラムのリストを `(c1, c2, c3)` を使用して指定できます。また、カラムの [マッチャー](../../sql-reference/statements/select/index.md#asterisk) である `*` や、[修飾子](../../sql-reference/statements/select/index.md#select-modifiers) である [APPLY](/sql-reference/statements/select#apply)、[EXCEPT](/sql-reference/statements/select#except)、[REPLACE](/sql-reference/statements/select#replace) を使用することもできます。

例えば、次のテーブルを考えます:

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

全てのカラムにデータを挿入したいが、カラム `b` だけは除外したい場合、`EXCEPT` キーワードを使うことができます。上記の構文を参照すると、指定するカラムの数（`(c1, c3)`）と同じ数の値を挿入する必要があります (`VALUES (v11, v13)`)：

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

この例では、2番目に挿入された行が `a` および `c` カラムに渡された値で埋められ、`b` カラムはデフォルト値で埋められています。`DEFAULT` キーワードを使用してデフォルト値を挿入することも可能です：

```sql
INSERT INTO insert_select_testtable VALUES (1, DEFAULT, 1) ;
```

カラムのリストに全ての既存カラムが含まれていない場合、残りのカラムは以下の方法で埋められます：

- テーブル定義に指定された `DEFAULT` 表現から計算された値。
- `DEFAULT` 表現が定義されていない場合はゼロおよび空文字列。

データは、ClickHouse によってサポートされている任意の [フォーマット](/sql-reference/formats) で `INSERT` に渡すことができます。フォーマットはクエリ内で明示的に指定する必要があります：

```sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT format_name data_set
```

例えば、次のクエリのフォーマットは基本的な `INSERT ... VALUES` のバージョンと同じです：

```sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT VALUES (v11, v12, v13), (v21, v22, v23), ...
```

ClickHouse は、データの前にある全てのスペースと 1 行の改行を削除します。クエリを形成する際には、データがクエリ演算子の後に新しい行に置かれることを推奨します。データがスペースで始まる場合に重要です。

例：

```sql
INSERT INTO t FORMAT TabSeparated
11  Hello, world!
22  Qwerty
```

[コマンドラインクライアント](/operations/utilities/clickhouse-local) または [HTTP インターフェイス](/interfaces/http/) を使用してクエリとは別にデータを挿入することもできます。

:::note
`INSERT` クエリに `SETTINGS` を指定したい場合は、`FORMAT` 句の前にそれを行う必要があります。`FORMAT format_name` の後の全てはデータとして扱われます。例えば：

```sql
INSERT INTO table SETTINGS ... FORMAT format_name data_set
```
:::

## 制約 {#constraints}

テーブルに [制約](../../sql-reference/statements/create/table.md#constraints) がある場合、挿入されたデータの各行に対してそれらの表現がチェックされます。どれかの制約が満たされない場合、サーバーは制約名と表現を含む例外を発生させ、クエリは停止します。

## SELECT の結果を挿入 {#inserting-the-results-of-select}

**構文**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] SELECT ...
```

カラムは `SELECT` 句での位置に基づいてマッピングされます。ただし、`SELECT` の表現内での名前と `INSERT` のテーブルの名前は異なる場合があります。必要に応じて型キャストが行われます。

Values 形式を除く他のデータ形式では `now()`、`1 + 2` などの表現に値を設定することは許可されていません。Values 形式では表現の限定的な使用が許可されていますが、これは推奨されません。なぜなら、この場合非効率的なコードがその実行に使用されるからです。

データパーツを変更するための他のクエリはサポートされていません： `UPDATE`、`DELETE`、`REPLACE`、`MERGE`、`UPSERT`、`INSERT UPDATE`。
ただし、古いデータを削除するには `ALTER TABLE ... DROP PARTITION` を使用できます。

`FORMAT` 句は、`SELECT` 句にテーブル関数 [input()](../../sql-reference/table-functions/input.md) が含まれている場合、クエリの最後に指定する必要があります。

非NULLデータ型のカラムに `NULL` の代わりにデフォルト値を挿入するためには、[insert_null_as_default](../../operations/settings/settings.md#insert_null_as_default) 設定を有効にします。

`INSERT` は CTE（共通テーブル式）もサポートしています。例えば、次の2つの文は等価です：

```sql
INSERT INTO x WITH y AS (SELECT * FROM numbers(10)) SELECT * FROM y;
WITH y AS (SELECT * FROM numbers(10)) INSERT INTO x SELECT * FROM y;
```

## ファイルからデータを挿入 {#inserting-data-from-a-file}

**構文**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] FROM INFILE file_name [COMPRESSION type] [SETTINGS ...] [FORMAT format_name]
```

上記の構文を使用して、**クライアント**側に保存されたファイルまたはファイルからデータを挿入します。`file_name` と `type` は文字列リテラルです。入力ファイルの [フォーマット](../../interfaces/formats.md) は `FORMAT` 句で設定する必要があります。

圧縮ファイルもサポートされています。圧縮タイプはファイル名の拡張子で検出されます。また、`COMPRESSION` 句で明示的に指定することもできます。サポートされているタイプは次の通りです： `'none'`、`'gzip'`、`'deflate'`、`'br'`、`'xz'`、`'zstd'`、`'lz4'`、`'bz2'`。

この機能は [コマンドラインクライアント](../../interfaces/cli.md) と [clickhouse-local](../../operations/utilities/clickhouse-local.md) で利用できます。

**例**

### FROM INFILE を使用した単一ファイル {#single-file-with-from-infile}

以下のクエリを [コマンドラインクライアント](../../interfaces/cli.md) を使用して実行します：

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

### FROM INFILE を使用した複数ファイル（グロブ利用） {#multiple-files-with-from-infile-using-globs}

この例は前の例と非常に似ていますが、複数のファイルから `FROM INFILE 'input_*.csv` を使用して挿入が行われます。

```bash
echo 1,A > input_1.csv ; echo 2,B > input_2.csv
clickhouse-client --query="CREATE TABLE infile_globs (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;"
clickhouse-client --query="INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;"
clickhouse-client --query="SELECT * FROM infile_globs FORMAT PrettyCompact;"
```

:::tip
`*` を使用して複数のファイルを選択するだけでなく、範囲（`{1,2}` または `{1..9}`）や他の [グロブ置換](/sql-reference/table-functions/file.md/#globs-in-path) を使用することもできます。これら3つは、上の例と共に機能します：

```sql
INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_{1,2}.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_?.csv' FORMAT CSV;
```
:::

## テーブル関数を使用して挿入 {#inserting-using-a-table-function}

データは [テーブル関数](../../sql-reference/table-functions/index.md) で参照されるテーブルに挿入できます。

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

## ClickHouse Cloud に挿入 {#inserting-into-clickhouse-cloud}

デフォルトでは、ClickHouse Cloud のサービスは高可用性のために複数のレプリカを提供します。サービスに接続すると、これらのレプリカのいずれかに接続が確立されます。

`INSERT` が成功すると、データは基盤となるストレージに書き込まれます。しかし、レプリカがこれらの更新を受け取るまでには時間がかかる場合があります。したがって、これらの他のレプリカのいずれかで `SELECT` クエリを実行する異なる接続を使用した場合、更新されたデータがまだ反映されないことがあります。

`select_sequential_consistency` を使用してレプリカが最新の更新を受け取るよう強制することができます。この設定を使用した `SELECT` クエリの例は次の通りです：

```sql
SELECT .... SETTINGS select_sequential_consistency = 1;
```

`select_sequential_consistency` を使用すると ClickHouse Keeper（ClickHouse Cloud 内部で使用）の負荷が増加し、サービスの負荷に応じてパフォーマンスが低下する可能性があることに注意してください。必要がない限り、この設定を有効にすることは推奨しません。推奨されるアプローチは、同じセッション内で read/write を実行するか、ネイティブプロトコルを使用するクライアントドライバを使用する（したがって、スティッキー接続をサポートする）ことです。

## レプリケートされたセットアップに挿入 {#inserting-into-a-replicated-setup}

レプリケートされたセットアップでは、データはレプリケーションされた後に他のレプリカで表示されます。データは `INSERT` の直後にレプリケート（他のレプリカにダウンロード）されます。これは、データがすぐに共有ストレージに書き込まれ、レプリカがメタデータの変更を購読する ClickHouse Cloud とは異なります。

レプリケートされたセットアップの場合、`INSERT` は時にはかなりの時間がかかることがあることに注意してください（おおよそ1秒の範囲で）。このプロセスは、分散コンセンサスのために ClickHouse Keeper にコミットを行うためです。S3 をストレージに使用することも追加の遅延をもたらします。

## パフォーマンスの考慮事項 {#performance-considerations}

`INSERT` は入力データを主キーでソートし、パーティションキーでパーティションに分割します。複数のパーティションに一度にデータを挿入すると、`INSERT` クエリのパフォーマンスが著しく低下する可能性があります。これを回避するために：

- 比較的大きなバッチ（例えば、10万行）でデータを追加します。
- ClickHouse にアップロードする前に、パーティションキーでデータをグループ化します。

次の条件ではパフォーマンスは低下しません：

- データがリアルタイムで追加されるとき。
- 通常時系列でソートされたデータをアップロードする場合。

### 非同期挿入 {#asynchronous-inserts}

小規模だが頻繁な挿入でデータを非同期に挿入することが可能です。そのような挿入からのデータはバッチにまとめられ、安全にテーブルに挿入されます。非同期挿入を使用するには、[`async_insert`](/operations/settings/settings#async_insert) 設定を有効にします。

`async_insert` や [`Buffer` テーブルエンジン](/engines/table-engines/special/buffer) を使用すると、追加のバッファリングが発生します。

### 大量または長時間実行される挿入 {#large-or-long-running-inserts}

大量のデータを挿入する場合、ClickHouse は「スクワッシング」と呼ばれるプロセスを通じて書き込み性能を最適化します。メモリ内に挿入された小さなデータブロックは、より大きなブロックに結合され、ディスクに書き込まれる前に圧縮されます。スクワッシングは、各書き込み操作に関連するオーバーヘッドを減少させます。このプロセス中、ClickHouse が [`max_insert_block_size`](/operations/settings/settings#max_insert_block_size) 行の書き込みを完了した後、挿入されたデータはクエリ可能になります。

**関連情報**

- [async_insert](/operations/settings/settings#async_insert)
- [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert)
- [wait_for_async_insert_timeout](/operations/settings/settings#wait_for_async_insert_timeout)
- [async_insert_max_data_size](/operations/settings/settings#async_insert_max_data_size)
- [async_insert_busy_timeout_ms](/operations/settings/settings#async_insert_busy_timeout_max_ms)
- [async_insert_stale_timeout_ms](/operations/settings/settings#async_insert_max_data_size)
