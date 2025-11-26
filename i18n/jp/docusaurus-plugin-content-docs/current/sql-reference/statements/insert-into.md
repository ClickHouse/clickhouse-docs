---
description: 'INSERT INTO ステートメントのリファレンス'
sidebar_label: 'INSERT INTO'
sidebar_position: 33
slug: /sql-reference/statements/insert-into
title: 'INSERT INTO ステートメント'
doc_type: 'reference'
---



# INSERT INTO ステートメント

テーブルにデータを挿入します。

**構文**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] [SETTINGS ...] VALUES (v11, v12, v13), (v21, v22, v23), ...
```

`(c1, c2, c3)` を使用して挿入する列のリストを指定できます。列の[マッチャー](../../sql-reference/statements/select/index.md#asterisk)である `*` や、[APPLY](/sql-reference/statements/select/apply-modifier)、[EXCEPT](/sql-reference/statements/select/except-modifier)、[REPLACE](/sql-reference/statements/select/replace-modifier) などの[モディファイア](../../sql-reference/statements/select/index.md#select-modifiers)を用いた式を使うこともできます。

たとえば、次のようなテーブルがあるとします。

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

列 `b` を除くすべての列にデータを挿入したい場合は、`EXCEPT` キーワードを使用して実行できます。上記の構文を参考に、指定した列 (`(c1, c3)`) の数と同じ数だけ値 (`VALUES (v11, v13)`) を挿入するようにする必要があります。

```sql
INSERT INTO insert_select_testtable (* EXCEPT(b)) Values (2, 2);
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

この例では、2 行目として挿入された行では `a` 列と `c` 列が指定した値で埋められ、`b` 列にはデフォルト値が入っていることがわかります。`DEFAULT` キーワードを使用してデフォルト値を挿入することもできます。

```sql
INSERT INTO insert_select_testtable VALUES (1, DEFAULT, 1) ;
```

列リストに既存のすべての列が含まれていない場合、残りの列には次の値が設定されます。

* テーブル定義で指定された `DEFAULT` 式から計算された値。
* `DEFAULT` 式が定義されていない場合は、ゼロおよび空文字列。

データは、ClickHouse がサポートする任意の[フォーマット](/sql-reference/formats)で INSERT に渡すことができます。フォーマットはクエリ内で明示的に指定する必要があります。

```sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT format_name data_set
```

たとえば、次のクエリ形式は、基本的な `INSERT ... VALUES` と同じです。

```sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT Values (v11, v12, v13), (v21, v22, v23), ...
```

ClickHouse は、データの前にあるすべてのスペースと、（存在する場合は）1 つの改行を削除します。クエリを構築する際は、データがスペースで始まる場合に重要となるため、クエリ演算子の後で改行し、その次の行にデータを配置することを推奨します。

例:

```sql
INSERT INTO t FORMAT TabSeparated
11  こんにちは、世界！
22  Qwerty
```

クエリとは別にデータを挿入するには、[コマンドラインクライアント](/operations/utilities/clickhouse-local) または [HTTP インターフェイス](/interfaces/http/) を使用できます。

:::note
`INSERT` クエリに対して `SETTINGS` を指定する場合は、`FORMAT` 句の *前に* 指定する必要があります。`FORMAT format_name` 以降はすべてデータとして扱われるためです。例えば、次のようにします。

```sql
INSERT INTO table SETTINGS ... FORMAT format_name data_set
```

:::


## 制約 {#constraints}

テーブルに[制約](../../sql-reference/statements/create/table.md#constraints)がある場合、それらの式は挿入されたデータの各行に対して評価されます。これらの制約のいずれかが満たされない場合、サーバーは制約名と式を含む例外をスローし、クエリの実行は中断されます。



## SELECT の結果の挿入

**構文**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] SELECT ...
```

列は、`SELECT` 句内での位置に基づいてマッピングされます。ただし、`SELECT` 式内の列名と `INSERT` 先のテーブル内の列名は異なる場合があります。必要に応じて、型キャストが行われます。

Values 形式を除くどのデータ形式でも、`now()`、`1 + 2` などの式を値として指定することはできません。Values 形式では限定的に式を使用できますが、その場合は実行に非効率なコードが使われるため推奨されません。

データパーツを変更するためのその他のクエリはサポートされていません: `UPDATE`、`DELETE`、`REPLACE`、`MERGE`、`UPSERT`、`INSERT UPDATE`。
ただし、`ALTER TABLE ... DROP PARTITION` を使用して古いデータを削除することはできます。

`SELECT` 句にテーブル関数 [input()](../../sql-reference/table-functions/input.md) が含まれる場合、クエリの末尾で `FORMAT` 句を指定する必要があります。

NULL 非許容のデータ型の列に `NULL` の代わりにデフォルト値を挿入するには、[insert&#95;null&#95;as&#95;default](../../operations/settings/settings.md#insert_null_as_default) 設定を有効にします。

`INSERT` は CTE (共通テーブル式) もサポートします。例えば、次の 2 つの文は同等です。

```sql
INSERT INTO x WITH y AS (SELECT * FROM numbers(10)) SELECT * FROM y;
WITH y AS (SELECT * FROM numbers(10)) INSERT INTO x SELECT * FROM y;
```


## ファイルからのデータ挿入

**構文**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] FROM INFILE file_name [COMPRESSION type] [SETTINGS ...] [FORMAT format_name]
```

上記の構文を使用して、**クライアント**側に保存されている 1 つまたは複数のファイルからデータを挿入できます。`file_name` と `type` は文字列リテラルです。入力ファイルの[フォーマット](../../interfaces/formats.md)は、`FORMAT` 句で指定する必要があります。

圧縮されたファイルもサポートされます。圧縮形式はファイル名の拡張子から自動的に検出されます。また、`COMPRESSION` 句で明示的に指定することもできます。サポートされている形式は `'none'`, `'gzip'`, `'deflate'`, `'br'`, `'xz'`, `'zstd'`, `'lz4'`, `'bz2'` です。

この機能は [command-line client](../../interfaces/cli.md) と [clickhouse-local](../../operations/utilities/clickhouse-local.md) で利用できます。

**例**

### FROM INFILE を用いた単一ファイル

次のクエリを [command-line client](../../interfaces/cli.md) を使って実行します。

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

### FROM INFILE でグロブを使用した複数ファイル

この例は前の例と非常によく似ていますが、`FROM INFILE 'input_*.csv'` を使用して複数のファイルからデータを挿入します。

```bash
echo 1,A > input_1.csv ; echo 2,B > input_2.csv
clickhouse-client --query="CREATE TABLE infile_globs (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;"
clickhouse-client --query="INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;"
clickhouse-client --query="SELECT * FROM infile_globs FORMAT PrettyCompact;"
```

:::tip
`*` を使って複数のファイルを選択するだけでなく、範囲（`{1,2}` や `{1..9}`）や、その他の [グロブの展開](/sql-reference/table-functions/file.md/#globs-in-path) も利用できます。上記の例では、次の 3 つはいずれも有効です。

```sql
INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_{1,2}.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_?.csv' FORMAT CSV;
```

:::


## テーブル関数を使った挿入

[テーブル関数](../../sql-reference/table-functions/index.md)で参照されるテーブルにデータを挿入できます。

**構文**

```sql
INSERT INTO [TABLE] FUNCTION table_func ...
```

**例**

以下のクエリでは、[remote](/sql-reference/table-functions/remote) テーブル関数を使用します。

```sql
CREATE TABLE simple_table (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;
INSERT INTO TABLE FUNCTION remote('localhost', default.simple_table)
    VALUES (100, 'remote()経由で挿入');
SELECT * FROM simple_table;
```

結果：

```text
┌──id─┬─text──────────────────┐
│ 100 │ inserted via remote() │
└─────┴───────────────────────┘
```


## ClickHouse Cloud への挿入

デフォルトでは、ClickHouse Cloud のサービスは高可用性を実現するために複数のレプリカを持ちます。サービスに接続すると、これらのレプリカのいずれかに接続が確立されます。

`INSERT` が成功すると、データは基盤となるストレージに書き込まれます。ただし、レプリカがこれらの更新を受け取るまでに時間がかかる場合があります。そのため、別の接続を使用して他のレプリカのいずれかで `SELECT` クエリを実行した場合、更新後のデータがまだ反映されていない可能性があります。

`select_sequential_consistency` を使用して、レプリカが最新の更新を確実に受け取るように強制できます。以下は、この設定を使用した `SELECT` クエリの例です。

```sql
SELECT .... SETTINGS select_sequential_consistency = 1;
```

`select_sequential_consistency` を使用すると、ClickHouse Keeper（ClickHouse Cloud で内部的に使用されます）への負荷が増加し、サービスの負荷状況によってはパフォーマンスが低下する可能性がある点に注意してください。必要な場合を除き、この設定を有効にすることは推奨しません。推奨されるアプローチは、同一セッション内で読み取り／書き込みを実行するか、ネイティブプロトコルを利用する（そのためスティッキー接続をサポートする）クライアントドライバを使用することです。


## レプリケーション構成での挿入 {#inserting-into-a-replicated-setup}

レプリケーション構成では、データは複製が完了した後に他のレプリカ上で参照できるようになります。`INSERT` の直後から、データのレプリケーション（他のレプリカへのダウンロード）が開始されます。これは、データが即座に共有ストレージに書き込まれ、レプリカがメタデータの変更をサブスクライブする ClickHouse Cloud とは挙動が異なります。

レプリケーション構成では、分散コンセンサスのために ClickHouse Keeper へのコミットが必要となるため、`INSERT` が完了するまでに比較的長い時間（1 秒程度）がかかる場合がある点に注意してください。ストレージに S3 を使用すると、さらに追加のレイテンシーが発生します。



## パフォーマンス上の考慮事項 {#performance-considerations}

`INSERT` は、入力データを主キーでソートし、パーティションキーによってパーティションに分割します。複数のパーティションに対して一度にデータを挿入すると、`INSERT` クエリのパフォーマンスが大きく低下する可能性があります。これを避けるには、次のようにします。

- 10 万行程度など、十分に大きなバッチ単位でデータを挿入する。
- ClickHouse にアップロードする前に、データをパーティションキーでグループ化する。

次の場合、パフォーマンスは低下しません。

- データがリアルタイムに追加される場合。
- 通常、時間順にソートされたデータをアップロードする場合。

### 非同期挿入 {#asynchronous-inserts}

小さなデータを高頻度で非同期に挿入することができます。このような挿入によるデータはバッチにまとめられ、その後安全にテーブルに挿入されます。非同期挿入を使用するには、[`async_insert`](/operations/settings/settings#async_insert) 設定を有効にします。

`async_insert` または [`Buffer` テーブルエンジン](/engines/table-engines/special/buffer) を使用すると、追加のバッファリングが行われます。

### 大規模または長時間実行される挿入 {#large-or-long-running-inserts}

大量のデータを挿入する場合、ClickHouse は「squashing」と呼ばれる処理により書き込みパフォーマンスを最適化します。メモリ上の小さな挿入データブロックはマージされて 1 つの大きなブロックにまとめられてからディスクに書き込まれます。squashing により、各書き込み操作に関連するオーバーヘッドが削減されます。この処理では、ClickHouse が各 [`max_insert_block_size`](/operations/settings/settings#max_insert_block_size) 行の書き込みを完了するたびに、挿入されたデータがクエリで利用可能になります。

**参照**

- [async_insert](/operations/settings/settings#async_insert)
- [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert)
- [wait_for_async_insert_timeout](/operations/settings/settings#wait_for_async_insert_timeout)
- [async_insert_max_data_size](/operations/settings/settings#async_insert_max_data_size)
- [async_insert_busy_timeout_ms](/operations/settings/settings#async_insert_busy_timeout_max_ms)
- [async_insert_stale_timeout_ms](/operations/settings/settings#async_insert_max_data_size)
