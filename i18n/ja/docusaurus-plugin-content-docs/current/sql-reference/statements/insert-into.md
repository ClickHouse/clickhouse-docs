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

挿入するカラムのリストを `(c1, c2, c3)` を使用して指定できます。また、`*` などのカラムの [マッチャー](../../sql-reference/statements/select/index.md#asterisk)や、[APPLY](../../sql-reference/statements/select/index.md#apply-modifier)、[EXCEPT](../../sql-reference/statements/select/index.md#except-modifier)、[REPLACE](../../sql-reference/statements/select/index.md#replace-modifier) などの [修飾子](../../sql-reference/statements/select/index.md#select-modifiers) を使用することもできます。

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

すべてのカラムにデータを挿入したいが、カラム `b` を除外する場合は、`EXCEPT` キーワードを使用できます。上記の構文に従って、指定するカラムの数 (`(c1, c3)`) と同じだけの値を挿入する必要があります (`VALUES (v11, v13)`)：

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

この例では、2 行目に挿入された行が `a` および `c` カラムには渡された値が埋められ、`b` にはデフォルト値が設定されていることがわかります。デフォルト値を挿入するために `DEFAULT` キーワードを使用することも可能です：

``` sql
INSERT INTO insert_select_testtable VALUES (1, DEFAULT, 1) ;
```

カラムのリストにすべての既存のカラムが含まれていない場合、残りのカラムには次のいずれかで埋められます：

- テーブル定義で指定された `DEFAULT` 式から計算される値
- `DEFAULT` 式が定義されていない場合はゼロと空文字列

データはClickHouseによりサポートされている任意の [フォーマット](/interfaces/formats.md#formats) で挿入できます。フォーマットはクエリ内で明示的に指定する必要があります：

``` sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT format_name data_set
```

例えば、次のクエリのフォーマットは基本的な `INSERT ... VALUES` のバージョンと同じです：

``` sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT Values (v11, v12, v13), (v21, v22, v23), ...
```

ClickHouseは、データの前にすべてのスペースと1つの行フィード（もしあれば）を削除します。クエリを形成する際には、クエリオペレーターの後に新しい行としてデータを配置することをお勧めします。これは、データがスペースで始まる場合に重要です。

例：

``` sql
INSERT INTO t FORMAT TabSeparated
11  Hello, world!
22  Qwerty
```

クエリからデータを別々に挿入するために、[コマンドラインクライアント](/integrations/sql-clients/clickhouse-client-local)または[HTTPインターフェース](/interfaces/http/)を使用できます。

:::note
`INSERT`クエリに `SETTINGS`を指定したい場合は、`FORMAT` 句の前にそれを行う必要があります。`FORMAT format_name` の後のすべてはデータとして扱われるためです。例えば：

```sql
INSERT INTO table SETTINGS ... FORMAT format_name data_set
```
:::

## 制約 {#constraints}

テーブルに [制約](../../sql-reference/statements/create/table.md#constraints) がある場合、その式は挿入される各行に対してチェックされます。これらの制約が満たされない場合、サーバーは制約の名前と式を含む例外を発生させ、クエリは停止します。

## SELECTの結果を挿入する {#inserting-the-results-of-select}

**構文**

``` sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] SELECT ...
```

カラムは `SELECT` 句の位置に従ってマッピングされます。ただし、`SELECT` 式内の名前と `INSERT` 用のテーブルでの名前は異なる場合があります。必要に応じて、型変換が行われます。

値を `now()` や `1 + 2` などの式に設定することは、Valuesフォーマットを除いて他のデータフォーマットではサポートされていません。Valuesフォーマットでは式の限定的な使用が許可されますが、効率的なコードが使用されないため推奨されません。

データ部分を変更するための他のクエリはサポートされていません： `UPDATE`、`DELETE`、`REPLACE`、`MERGE`、`UPSERT`、`INSERT UPDATE`。
ただし、`ALTER TABLE ... DROP PARTITION`を使用して古いデータを削除することはできます。

`SELECT` 句がテーブル関数 [input()](../../sql-reference/table-functions/input.md) を含む場合、`FORMAT` 句はクエリの最後に指定する必要があります。

カラムが非NULLのデータ型であるにもかかわらず、`NULL` の代わりにデフォルト値を挿入するには、[insert_null_as_default](../../operations/settings/settings.md#insert_null_as_default) 設定を有効にしてください。

`INSERT` はCTE（共通テーブル式）もサポートしています。例えば、以下の2つのステートメントは同等です：

``` sql
INSERT INTO x WITH y AS (SELECT * FROM numbers(10)) SELECT * FROM y;
WITH y AS (SELECT * FROM numbers(10)) INSERT INTO x SELECT * FROM y;
```

## ファイルからデータを挿入する {#inserting-data-from-a-file}

**構文**

``` sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] FROM INFILE file_name [COMPRESSION type] [SETTINGS ...] [FORMAT format_name]
```

上記の構文を使用して、**クライアント** 側に保存されたファイル、またはファイル群からデータを挿入します。`file_name` と `type` は文字列リテラルです。入力ファイルの [フォーマット](../../interfaces/formats.md) は `FORMAT` 句で設定する必要があります。

圧縮ファイルがサポートされています。圧縮タイプはファイル名の拡張子により検出されます。あるいは、`COMPRESSION` 句で明示的に指定することもできます。サポートされているタイプは： `'none'`、`'gzip'`、`'deflate'`、`'br'`、`'xz'`、`'zstd'`、`'lz4'`、`'bz2'` です。

この機能は[コマンドラインクライアント](../../interfaces/cli.md) および [clickhouse-local](../../operations/utilities/clickhouse-local.md) で利用可能です。

**例**

### FROM INFILEを使用した単一ファイル {#single-file-with-from-infile}

以下のクエリを [コマンドラインクライアント](../../interfaces/cli.md)を使用して実行します：

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

### ワイルドカードを使用した複数ファイルのFROM INFILE {#multiple-files-with-from-infile-using-globs}

この例は前の例と非常に似ていますが、`FROM INFILE 'input_*.csv`を使用して複数のファイルから挿入が行われる点が異なります。

```bash
echo 1,A > input_1.csv ; echo 2,B > input_2.csv
clickhouse-client --query="CREATE TABLE infile_globs (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;"
clickhouse-client --query="INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;"
clickhouse-client --query="SELECT * FROM infile_globs FORMAT PrettyCompact;"
```

:::tip
`*` を使用して複数のファイルを選択するだけでなく、範囲（`{1,2}` または `{1..9}`）や他の [グロブ置換](/sql-reference/table-functions/file.md/#globs-in-path) も使用できます。これらのすべては、上記の例で機能します：

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

次のクエリでは [remote](../../sql-reference/table-functions/index.md#remote) テーブル関数を使用しています：

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

## ClickHouse Cloudへの挿入 {#inserting-into-clickhouse-cloud}

デフォルトでは、ClickHouse Cloudのサービスは高可用性のために複数のレプリカを提供します。サービスに接続する際、一つのレプリカとの接続が確立されます。

`INSERT` が成功した後、データは基盤となるストレージに書き込まれます。しかし、レプリカがこれらの更新を受け取るまでにはしばらく時間がかかる場合があります。したがって、他のレプリカのいずれかで `SELECT` クエリを実行する別の接続を使用した場合、更新されたデータがまだ反映されていないことがあります。

`select_sequential_consistency` を使用して、レプリカが最新の更新を受信するように強制することが可能です。この設定を使用した `SELECT` クエリの例は次のとおりです：

```sql
SELECT .... SETTINGS select_sequential_consistency = 1;
```

`select_sequential_consistency` を使用すると、ClickHouse Keeper（ClickHouse Cloud内部で使用）への負荷が増加し、サービスの負荷に応じてパフォーマンスが低下する可能性があります。この設定は、必要でない限り有効にすることはお勧めしません。推奨されるアプローチは、同じセッション内で読み書きを実行するか、ネイティブプロトコルを使用するクライアントドライバを使用することです（したがって、スティッキー接続をサポートします）。

## レプリケートされたセットアップへの挿入 {#inserting-into-a-replicated-setup}

レプリケートされたセットアップでは、データはレプリケーションされた後、他のレプリカで表示されます。データは `INSERT` 直後にレプリケート（他のレプリカにダウンロード）が開始されます。これは、データが直ちに共有ストレージに書き込まれ、レプリカがメタデータの変更を購読するClickHouse Cloudとは異なります。

レプリケートされたセットアップでは、`INSERTs` に時間がかかる場合があることに注意してください（約1秒程度）。これは、分散コンセンサスのためにClickHouse Keeperにコミットする必要があるためです。S3をストレージに使用すると、追加のレイテンシも発生します。

## パフォーマンスに関する考慮事項 {#performance-considerations}

`INSERT` は入力データを主キーでソートし、パーティションキーでパーティションに分割します。一度に複数のパーティションにデータを挿入する場合、`INSERT` クエリのパフォーマンスが大幅に低下する可能性があります。これを避けるためには：

- かなり大きなバッチ（例えば10万行）でデータを追加します。
- データをClickHouseにアップロードする前にパーティションキーでグループ化します。

リアルタイムでデータが追加される場合や、通常時間でソートされたデータをアップロードする場合は、パフォーマンスは低下しません。

### 非同期挿入 {#asynchronous-inserts}

小さなが頻繁な挿入でデータを非同期に挿入することが可能です。このような挿入からのデータはバッチにまとめられ、テーブルに安全に挿入されます。非同期挿入を使用するには、[`async_insert`](../../operations/settings/settings.md#async-insert) 設定を有効にします。

`async_insert` または [`Buffer` テーブルエンジン](/engines/table-engines/special/buffer)を使用すると、追加のバッファリングが発生します。

### 大量または長時間の挿入 {#large-or-long-running-inserts}

大量のデータを挿入している場合、ClickHouseは「スカッシング」と呼ばれるプロセスを通じて書き込みパフォーマンスを最適化します。メモリ内に挿入されたデータの小さなブロックがマージされ、大きなブロックにスカッシュされてからディスクに書き込まれます。スカッシングにより、各書き込み操作に伴うオーバーヘッドが削減されます。このプロセスでは、挿入されたデータはClickHouseが各 [`max_insert_block_size`](/operations/settings/settings#max_insert_block_size) 行の書き込みを完了した後にクエリ可能になります。

**関連事項**

- [async_insert](../../operations/settings/settings.md#async-insert)
- [async_insert_threads](../../operations/settings/settings.md#async-insert-threads)
- [wait_for_async_insert](../../operations/settings/settings.md#wait-for-async-insert)
- [wait_for_async_insert_timeout](../../operations/settings/settings.md#wait-for-async-insert-timeout)
- [async_insert_max_data_size](../../operations/settings/settings.md#async-insert-max-data-size)
- [async_insert_busy_timeout_ms](../../operations/settings/settings.md#async-insert-busy-timeout-ms)
- [async_insert_stale_timeout_ms](../../operations/settings/settings.md#async-insert-stale-timeout-ms)
