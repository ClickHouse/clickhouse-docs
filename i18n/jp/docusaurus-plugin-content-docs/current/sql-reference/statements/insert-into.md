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

挿入するカラムのリストを `(c1, c2, c3)` を使って指定することができます。また、カラムの[マッチャー](../../sql-reference/statements/select/index.md#asterisk)（例えば `*`）や[修飾子](../../sql-reference/statements/select/index.md#select-modifiers)（例えば[APPLY](../../sql-reference/statements/select/index.md#apply-modifier)、[EXCEPT](../../sql-reference/statements/select/index.md#except-modifier)、[REPLACE](../../sql-reference/statements/select/index.md#replace-modifier)）を使うことも可能です。

例えば、次のテーブルを考えます：

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

全てのカラムにデータを挿入したいがカラム `b` を除外したい場合、`EXCEPT` キーワードを使用します。上記の構文を参照し、指定したカラム (`(c1, c3)`) と同じ数の値 (`VALUES (v11, v13)`) を挿入する必要があります：

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

この例では、二番目に挿入された行が `a` および `c` カラムに渡された値で埋められ、`b` はデフォルト値で埋められていることが確認できます。また、デフォルト値を挿入するために `DEFAULT` キーワードを使用することも可能です：

``` sql
INSERT INTO insert_select_testtable VALUES (1, DEFAULT, 1) ;
```

カラムのリストに全ての既存カラムが含まれていない場合、残りのカラムには次の値が入ります：

- テーブル定義に指定された `DEFAULT` 表現から計算された値。
- `DEFAULT` 表現が定義されていない場合、ゼロや空文字列。

データは ClickHouse がサポートする任意の[フォーマット](/interfaces/formats.md#formats)で INSERT に渡すことができます。フォーマットはクエリ内で明示的に指定する必要があります：

``` sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT format_name data_set
```

例えば、以下のクエリフォーマットは `INSERT ... VALUES` の基本バージョンと同じです：

``` sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT Values (v11, v12, v13), (v21, v22, v23), ...
```

ClickHouse はデータの前に全ての空白と1行の改行（もしあれば）を削除します。クエリを形成する際には、データをクエリ演算子の後に新しい行で置くことを推奨します。データが空白で始まる場合は特に重要です。

例：

``` sql
INSERT INTO t FORMAT TabSeparated
11  Hello, world!
22  Qwerty
```

クエリとは別にデータを挿入する場合は、[コマンドラインクライアント](/operations/utilities/clickhouse-local)や[HTTPインターフェース](/docs/interfaces/http/)を使用できます。

:::note
`INSERT` クエリのために `SETTINGS` を指定したい場合は、`FORMAT` 句の前に行う必要があります。`FORMAT format_name` の後の全てはデータとして扱われます。例えば：

```sql
INSERT INTO table SETTINGS ... FORMAT format_name data_set
```
:::

## 制約 {#constraints}

テーブルに[制約](../../sql-reference/statements/create/table.md#constraints)がある場合、挿入される各行のデータに対してその表現がチェックされます。もしその制約が満たされていない場合、サーバーは制約の名前と表現を含む例外を発生させ、クエリは停止します。

## SELECT の結果を挿入する {#inserting-the-results-of-select}

**構文**

``` sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] SELECT ...
```

カラムは `SELECT` 句の位置に応じてマッピングされます。ただし、`SELECT` の表現内の名前と `INSERT` のテーブルの名前は異なる場合があります。必要に応じて、型キャストが行われます。

値のフォーマット以外は、`now()`, `1 + 2` などの式に値を設定することはできません。Values フォーマットは限られた式の使用を許可しますが、これは推奨されません。この場合、非効率的なコードが使用されます。

データパーツを変更するための他のクエリはサポートされていません：`UPDATE`、`DELETE`、`REPLACE`、`MERGE`、`UPSERT`、`INSERT UPDATE`。
しかし、古いデータを削除するには `ALTER TABLE ... DROP PARTITION` を使用できます。

`SELECT` 句がテーブル関数 [input()](../../sql-reference/table-functions/input.md) を含む場合は、クエリの最後に `FORMAT` 句を指定する必要があります。

非NULL型のカラムに `NULL` の代わりにデフォルト値を挿入するには、[insert_null_as_default](../../operations/settings/settings.md#insert_null_as_default) 設定を有効にします。

`INSERT` は CTE（共通テーブル式）もサポートしています。例えば、以下の2つのステートメントは等価です：

``` sql
INSERT INTO x WITH y AS (SELECT * FROM numbers(10)) SELECT * FROM y;
WITH y AS (SELECT * FROM numbers(10)) INSERT INTO x SELECT * FROM y;
```

## ファイルからデータを挿入する {#inserting-data-from-a-file}

**構文**

``` sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] FROM INFILE file_name [COMPRESSION type] [SETTINGS ...] [FORMAT format_name]
```

上記の構文を使用して、**クライアント**側に保存されたファイルからデータを挿入します。`file_name` と `type` は文字列リテラルです。入力ファイルの[フォーマット](../../interfaces/formats.md)は `FORMAT` 句で設定する必要があります。

圧縮ファイルがサポートされています。圧縮タイプはファイル名の拡張子によって検出されます。あるいは、`COMPRESSION` 句で明示的に指定することもできます。サポートされているタイプは：`'none'`、`'gzip'`、`'deflate'`、`'br'`、`'xz'`、`'zstd'`、`'lz4'`、`'bz2'` です。

この機能は、[コマンドラインクライアント](../../interfaces/cli.md)および [clickhouse-local](../../operations/utilities/clickhouse-local.md) で利用可能です。

**例**

### FROM INFILE を使用した単一ファイル {#single-file-with-from-infile}

以下のクエリを[コマンドラインクライアント](../../interfaces/cli.md)を使用して実行します：

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

### グロブを使用した複数ファイルによるFROM INFILE {#multiple-files-with-from-infile-using-globs}

この例は前の例と非常に似ていますが、複数のファイルから挿入が行われます。`FROM INFILE 'input_*.csv'` を使用します。

```bash
echo 1,A > input_1.csv ; echo 2,B > input_2.csv
clickhouse-client --query="CREATE TABLE infile_globs (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;"
clickhouse-client --query="INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;"
clickhouse-client --query="SELECT * FROM infile_globs FORMAT PrettyCompact;"
```

:::tip
`*` を使って複数のファイルを選択するだけでなく、範囲（`{1,2}` または `{1..9}`）や他の[グロブ置換](/sql-reference/table-functions/file.md/#globs-in-path)も使用できます。これらの3つはすべて上記の例で機能します：

```sql
INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_{1,2}.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_?.csv' FORMAT CSV;
```
:::

## テーブル関数を使用して挿入する {#inserting-using-a-table-function}

データは[テーブル関数](../../sql-reference/table-functions/index.md)によって参照されるテーブルに挿入することができます。

**構文**

``` sql
INSERT INTO [TABLE] FUNCTION table_func ...
```

**例**

以下のクエリでは[remote](../../sql-reference/table-functions/index.md#remote)テーブル関数を使用しています：

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

デフォルトでは、ClickHouse Cloud のサービスは高可用性のために複数のレプリカを提供します。サービスに接続すると、これらのレプリカのうちの一つに接続が確立されます。

`INSERT` が成功すると、データが基盤となるストレージに書き込まれます。ただし、レプリカがこれらの更新を受け取るまでには時間がかかる場合があります。そのため、別の接続を使ってこれらの他のレプリカのいずれかで `SELECT` クエリを実行すると、更新されたデータがまだ反映されていない可能性があります。

`select_sequential_consistency` を使用して、レプリカが最新の更新を受け取るように強制することが可能です。この設定を使用した `SELECT` クエリの例は以下の通りです：

```sql
SELECT .... SETTINGS select_sequential_consistency = 1;
```

`select_sequential_consistency` を使用すると、ClickHouse Cloud 内部で使用される ClickHouse Keeperへの負荷が増加し、サービスの負荷に応じてパフォーマンスが低下する可能性があることに注意してください。この設定を有効にするのは必要な場合に限ることを推奨します。推奨されるアプローチは、同じセッション内で読み書きを実行するか、ネイティブプロトコルを使用するクライアントドライバ(したがって、スティッキー接続をサポートする)を使用することです。

## レプリケートされたセットアップへの挿入 {#inserting-into-a-replicated-setup}

レプリケートされたセットアップでは、データは複製された後に他のレプリカで表示されます。データは `INSERT` があるとすぐに複製され始めます（他のレプリカにダウンロードされます）。これは、ClickHouse Cloud とは異なり、データが共有ストレージにすぐに書き込まれ、レプリカはメタデータの変更を購読するようなものである。

レプリケートされたセットアップの場合、`INSERT` は時にはかなりの時間（約1秒程度）かかることがあります。これは、分散コンセンサスのために ClickHouse Keeper へのコミットが必要だからです。ストレージとして S3 を使用すると、さらに追加の遅延が発生します。

## パフォーマンスに関する考慮事項 {#performance-considerations}

`INSERT` は入力データを主キーでソートし、パーティションキーでパーティションに分割します。複数のパーティションに同時にデータを挿入すると、`INSERT` クエリのパフォーマンスが大幅に低下する可能性があります。これを避けるには：

- 一度に100,000行など、比較的大きなバッチでデータを追加します。
- ClickHouse にアップロードする前に、パーティションキーでデータをグループ化します。

パフォーマンスが低下しないのは以下の場合です：

- データがリアルタイムで追加される場合。
- 通常、時間でソートされたデータをアップロードする場合。

### 非同期挿入 {#asynchronous-inserts}

小さく頻繁な挿入で非同期にデータを挿入することが可能です。このような挿入からのデータはバッチに組み合わされ、その後安全にテーブルに挿入されます。非同期挿入を使用するには、[`async_insert`](/operations/settings/settings#async_insert) 設定を有効にします。

`async_insert` または [`Buffer` テーブルエンジン](/engines/table-engines/special/buffer)を使用することは、追加のバッファリングをもたらします。

### 大規模または長時間にわたる挿入 {#large-or-long-running-inserts}

大量のデータを挿入している場合、ClickHouse は「スカッシング」と呼ばれるプロセスを通じて書き込み性能を最適化します。挿入された小さなデータブロックはメモリ内でマージされ、ディスクに書き込まれる前に大きなブロックにスカッシュされます。スカッシングは各書き込み操作に伴うオーバーヘッドを減少させます。このプロセスでは、挿入されたデータは ClickHouse が各 [`max_insert_block_size`](/operations/settings/settings#max_insert_block_size) 行の書き込みを完了するまでクエリできるようになります。

**参照**

- [async_insert](/operations/settings/settings#async_insert)
- [async_insert_threads](../../operations/settings/settings.md#async-insert-threads)
- [wait_for_async_insert](../../operations/settings/settings.md#wait-for-async-insert)
- [wait_for_async_insert_timeout](../../operations/settings/settings.md#wait-for-async-insert-timeout)
- [async_insert_max_data_size](../../operations/settings/settings.md#async-insert-max-data-size)
- [async_insert_busy_timeout_ms](../../operations/settings/settings.md#async-insert-busy-timeout-ms)
- [async_insert_stale_timeout_ms](../../operations/settings/settings.md#async-insert-stale-timeout-ms)
