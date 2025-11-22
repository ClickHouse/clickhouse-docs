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

挿入する列のリストは `(c1, c2, c3)` のように指定できます。列の[マッチャー](../../sql-reference/statements/select/index.md#asterisk)である `*` や、[APPLY](/sql-reference/statements/select/apply-modifier)、[EXCEPT](/sql-reference/statements/select/except-modifier)、[REPLACE](/sql-reference/statements/select/replace-modifier) といった[修飾子](../../sql-reference/statements/select/index.md#select-modifiers)を用いた式を指定することもできます。

例えば、次のようなテーブルを考えます。

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

列 `b` 以外のすべての列にデータを挿入したい場合は、`EXCEPT` キーワードを使用して実行できます。上記の構文を参照すると、指定した列 (`(c1, c3)`) の数と同じ数の値 (`VALUES (v11, v13)`) を挿入する必要があります。

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

この例では、2 行目として挿入された行では、`a` 列と `c` 列は渡された値で埋められ、`b` 列はデフォルト値で埋められていることが分かります。`DEFAULT` キーワードを使用してデフォルト値を挿入することも可能です。

```sql
INSERT INTO insert_select_testtable VALUES (1, DEFAULT, 1) ;
```

列リストに既存のすべての列が含まれていない場合、残りの列は次の値で埋められます。

* テーブル定義で指定された `DEFAULT` 式から計算された値
* `DEFAULT` 式が定義されていない場合は、ゼロおよび空文字列

データは、ClickHouse がサポートする任意の[フォーマット](/sql-reference/formats)で INSERT に渡すことができます。フォーマットはクエリ内で明示的に指定する必要があります。

```sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT format_name data_set
```

例えば、次のクエリ形式は、`INSERT ... VALUES` の基本バージョンと同じです。

```sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT Values (v11, v12, v13), (v21, v22, v23), ...
```

ClickHouse は、データの前にあるすべてのスペースと、（存在する場合は）1 つの改行を削除します。クエリを作成する際には、特にデータがスペースで始まる場合、クエリ演算子の後で改行し、その次の行にデータを配置することを推奨します。

例:

```sql
INSERT INTO t FORMAT TabSeparated
11  こんにちは、世界！
22  Qwerty
```

[コマンドラインクライアント](/operations/utilities/clickhouse-local) または [HTTP インターフェイス](/interfaces/http/) を使用して、クエリとは別にデータを挿入できます。

:::note
`INSERT` クエリに対して `SETTINGS` を指定する場合は、`FORMAT` 句よりも *前に* 指定する必要があります。`FORMAT format_name` 以降はすべてデータとして扱われるためです。例えば次のようにします。

```sql
INSERT INTO table SETTINGS ... FORMAT format_name data_set
```

:::


## 制約 {#constraints}

テーブルに[制約](../../sql-reference/statements/create/table.md#constraints)が定義されている場合、挿入データの各行に対してその制約式が検証されます。制約のいずれかが満たされない場合、サーバーは制約名と式を含む例外を発生させ、クエリは停止します。


## SELECTの結果の挿入 {#inserting-the-results-of-select}

**構文**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] SELECT ...
```

カラムは`SELECT`句内の位置に従ってマッピングされます。ただし、`SELECT`式内のカラム名と`INSERT`先のテーブルのカラム名は異なっていても構いません。必要に応じて型変換が実行されます。

Valuesフォーマット以外のデータフォーマットでは、`now()`や`1 + 2`などの式を値として設定することはできません。Valuesフォーマットでは式の限定的な使用が可能ですが、この場合は非効率的なコードが実行に使用されるため推奨されません。

データパーツを変更する他のクエリはサポートされていません：`UPDATE`、`DELETE`、`REPLACE`、`MERGE`、`UPSERT`、`INSERT UPDATE`。
ただし、`ALTER TABLE ... DROP PARTITION`を使用して古いデータを削除することは可能です。

`SELECT`句にテーブル関数[input()](../../sql-reference/table-functions/input.md)が含まれている場合、`FORMAT`句はクエリの最後に指定する必要があります。

非NULL型のカラムに`NULL`の代わりにデフォルト値を挿入するには、[insert_null_as_default](../../operations/settings/settings.md#insert_null_as_default)設定を有効にしてください。

`INSERT`はCTE（共通テーブル式）もサポートしています。例えば、以下の2つのステートメントは同等です：

```sql
INSERT INTO x WITH y AS (SELECT * FROM numbers(10)) SELECT * FROM y;
WITH y AS (SELECT * FROM numbers(10)) INSERT INTO x SELECT * FROM y;
```


## ファイルからのデータ挿入 {#inserting-data-from-a-file}

**構文**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] FROM INFILE file_name [COMPRESSION type] [SETTINGS ...] [FORMAT format_name]
```

上記の構文を使用して、**クライアント**側に保存されているファイルからデータを挿入します。`file_name`と`type`は文字列リテラルです。入力ファイルの[フォーマット](../../interfaces/formats.md)は`FORMAT`句で指定する必要があります。

圧縮ファイルがサポートされています。圧縮タイプはファイル名の拡張子から自動検出されます。または、`COMPRESSION`句で明示的に指定することもできます。サポートされているタイプは`'none'`、`'gzip'`、`'deflate'`、`'br'`、`'xz'`、`'zstd'`、`'lz4'`、`'bz2'`です。

この機能は[コマンドラインクライアント](../../interfaces/cli.md)および[clickhouse-local](../../operations/utilities/clickhouse-local.md)で利用できます。

**例**

### FROM INFILEを使用した単一ファイルの挿入 {#single-file-with-from-infile}

[コマンドラインクライアント](../../interfaces/cli.md)を使用して以下のクエリを実行します:

```bash
echo 1,A > input.csv ; echo 2,B >> input.csv
clickhouse-client --query="CREATE TABLE table_from_file (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;"
clickhouse-client --query="INSERT INTO table_from_file FROM INFILE 'input.csv' FORMAT CSV;"
clickhouse-client --query="SELECT * FROM table_from_file FORMAT PrettyCompact;"
```

結果:

```text
┌─id─┬─text─┐
│  1 │ A    │
│  2 │ B    │
└────┴──────┘
```

### globを使用したFROM INFILEによる複数ファイルの挿入 {#multiple-files-with-from-infile-using-globs}

この例は前の例と非常に似ていますが、`FROM INFILE 'input_*.csv`を使用して複数のファイルから挿入を実行します。

```bash
echo 1,A > input_1.csv ; echo 2,B > input_2.csv
clickhouse-client --query="CREATE TABLE infile_globs (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;"
clickhouse-client --query="INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;"
clickhouse-client --query="SELECT * FROM infile_globs FORMAT PrettyCompact;"
```

:::tip
`*`で複数のファイルを選択することに加えて、範囲指定(`{1,2}`または`{1..9}`)やその他の[glob置換](/sql-reference/table-functions/file.md/#globs-in-path)を使用できます。以下の3つはすべて上記の例で動作します:

```sql
INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_{1,2}.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_?.csv' FORMAT CSV;
```

:::


## テーブル関数を使用した挿入 {#inserting-using-a-table-function}

[テーブル関数](../../sql-reference/table-functions/index.md)で参照されるテーブルにデータを挿入できます。

**構文**

```sql
INSERT INTO [TABLE] FUNCTION table_func ...
```

**例**

以下のクエリでは[remote](/sql-reference/table-functions/remote)テーブル関数を使用しています:

```sql
CREATE TABLE simple_table (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;
INSERT INTO TABLE FUNCTION remote('localhost', default.simple_table)
    VALUES (100, 'inserted via remote()');
SELECT * FROM simple_table;
```

結果:

```text
┌──id─┬─text──────────────────┐
│ 100 │ inserted via remote() │
└─────┴───────────────────────┘
```


## ClickHouse Cloudへのデータ挿入 {#inserting-into-clickhouse-cloud}

デフォルトでは、ClickHouse Cloudのサービスは高可用性のために複数のレプリカを提供します。サービスに接続すると、これらのレプリカのいずれかへの接続が確立されます。

`INSERT`が成功すると、データは基盤となるストレージに書き込まれます。ただし、レプリカがこれらの更新を受信するまでには時間がかかる場合があります。そのため、別の接続を使用して他のレプリカのいずれかで`SELECT`クエリを実行した場合、更新されたデータがまだ反映されていない可能性があります。

`select_sequential_consistency`を使用することで、レプリカに最新の更新を強制的に受信させることができます。この設定を使用した`SELECT`クエリの例を以下に示します:

```sql
SELECT .... SETTINGS select_sequential_consistency = 1;
```

`select_sequential_consistency`を使用すると、ClickHouse Keeper(ClickHouse Cloudが内部的に使用)への負荷が増加し、サービスの負荷状況によってはパフォーマンスが低下する可能性があることに注意してください。必要でない限り、この設定を有効にすることは推奨されません。推奨されるアプローチは、同じセッション内で読み取り/書き込みを実行するか、ネイティブプロトコルを使用するクライアントドライバー(スティッキー接続をサポート)を使用することです。


## レプリケーション構成へのデータ挿入 {#inserting-into-a-replicated-setup}

レプリケーション構成では、データはレプリケーション完了後に他のレプリカで参照可能になります。`INSERT`の直後にデータのレプリケーション(他のレプリカへのダウンロード)が開始されます。これはClickHouse Cloudとは異なります。ClickHouse Cloudでは、データは即座に共有ストレージに書き込まれ、レプリカはメタデータの変更をサブスクライブします。

レプリケーション構成では、分散合意のためにClickHouse Keeperへのコミットが必要となるため、`INSERT`に相当な時間(1秒程度のオーダー)がかかる場合があることに注意してください。ストレージにS3を使用すると、さらにレイテンシが増加します。


## パフォーマンスに関する考慮事項 {#performance-considerations}

`INSERT`は入力データをプライマリキーでソートし、パーティションキーによってパーティションに分割します。複数のパーティションに同時にデータを挿入すると、`INSERT`クエリのパフォーマンスが大幅に低下する可能性があります。これを回避するには:

- 一度に100,000行など、かなり大きなバッチでデータを追加します。
- ClickHouseにアップロードする前に、パーティションキーでデータをグループ化します。

次の場合、パフォーマンスは低下しません:

- データがリアルタイムで追加される場合。
- 通常時間でソートされたデータをアップロードする場合。

### 非同期挿入 {#asynchronous-inserts}

小規模だが頻繁な挿入で、データを非同期に挿入することが可能です。このような挿入からのデータはバッチに結合され、その後安全にテーブルに挿入されます。非同期挿入を使用するには、[`async_insert`](/operations/settings/settings#async_insert)設定を有効にします。

`async_insert`または[`Buffer`テーブルエンジン](/engines/table-engines/special/buffer)を使用すると、追加のバッファリングが発生します。

### 大規模または長時間実行される挿入 {#large-or-long-running-inserts}

大量のデータを挿入する場合、ClickHouseは「スカッシング」と呼ばれるプロセスを通じて書き込みパフォーマンスを最適化します。メモリ内の挿入データの小さなブロックは、ディスクに書き込まれる前にマージされ、より大きなブロックにスカッシングされます。スカッシングは、各書き込み操作に関連するオーバーヘッドを削減します。このプロセスでは、ClickHouseが[`max_insert_block_size`](/operations/settings/settings#max_insert_block_size)行ごとの書き込みを完了した後、挿入されたデータがクエリで利用可能になります。

**関連項目**

- [async_insert](/operations/settings/settings#async_insert)
- [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert)
- [wait_for_async_insert_timeout](/operations/settings/settings#wait_for_async_insert_timeout)
- [async_insert_max_data_size](/operations/settings/settings#async_insert_max_data_size)
- [async_insert_busy_timeout_ms](/operations/settings/settings#async_insert_busy_timeout_max_ms)
- [async_insert_stale_timeout_ms](/operations/settings/settings#async_insert_max_data_size)
