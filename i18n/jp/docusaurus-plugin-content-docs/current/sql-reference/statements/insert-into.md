---
'description': 'INSERT INTO ステートメントのドキュメント'
'sidebar_label': 'INSERT INTO'
'sidebar_position': 33
'slug': '/sql-reference/statements/insert-into'
'title': 'INSERT INTO ステートメント'
'doc_type': 'reference'
---


# INSERT INTO文

テーブルにデータを挿入します。

**構文**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] [SETTINGS ...] VALUES (v11, v12, v13), (v21, v22, v23), ...
```

挿入するカラムのリストは、`(c1, c2, c3)`を使用して指定できます。また、`*`のようなカラム [マッチャー](../../sql-reference/statements/select/index.md#asterisk)や、[APPLY](/sql-reference/statements/select/apply-modifier)、[EXCEPT](/sql-reference/statements/select/except-modifier)、[REPLACE](/sql-reference/statements/select/replace-modifier)といった[修飾子](../../sql-reference/statements/select/index.md#select-modifiers)を使った式も使用できます。

たとえば、次のテーブルを考えます：

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

すべてのカラムにデータを挿入したいが、カラム`b`は除外したい場合、`EXCEPT`キーワードを使用して行うことができます。上記の構文を参照すると、指定したカラム数（`(c1, c3)`）と同じだけの値（`VALUES (v11, v13)`）を挿入する必要があります：

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

この例では、挿入された2番目の行が`a`と`c`カラムに指定された値で埋められ、`b`カラムはデフォルト値で埋められているのが分かります。また、デフォルト値を挿入するために`DEFAULT`キーワードを使用することも可能です：

```sql
INSERT INTO insert_select_testtable VALUES (1, DEFAULT, 1) ;
```

カラムのリストにすべての既存のカラムが含まれていない場合、残りのカラムには次の値が設定されます：

- テーブル定義で指定された`DEFAULT`式から計算された値。
- `DEFAULT`式が定義されていない場合はゼロや空文字列。

データは、ClickHouseがサポートする任意の[フォーマット](/sql-reference/formats)でINSERTに渡すことができます。フォーマットはクエリで明示的に指定する必要があります：

```sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT format_name data_set
```

たとえば、次のクエリフォーマットは基本的な`INSERT ... VALUES`バージョンと同じです：

```sql
INSERT INTO [db.]table [(c1, c2, c3)] FORMAT Values (v11, v12, v13), (v21, v22, v23), ...
```

ClickHouseは、データの前にすべてのスペースと1行の改行（もしあれば）を削除します。クエリを形成する際には、データがクエリ演算子の後の新しい行に配置されることをお勧めします。データがスペースで始まる場合は特に重要です。

例：

```sql
INSERT INTO t FORMAT TabSeparated
11  Hello, world!
22  Qwerty
```

[コマンドラインクライアント](/operations/utilities/clickhouse-local)や[HTTPインターフェース](/interfaces/http/)を使用することで、クエリとは別にデータを挿入することができます。

:::note
`INSERT`クエリに`SETTINGS`を指定したい場合は、`FORMAT`句の前にそれを行う必要があります。なぜなら`FORMAT format_name`の後はすべてデータとして扱われるからです。例えば：

```sql
INSERT INTO table SETTINGS ... FORMAT format_name data_set
```
:::

## 制約 {#constraints}

テーブルに[制約](../../sql-reference/statements/create/table.md#constraints)がある場合、挿入されたデータの各行に対してそれらの式がチェックされます。いずれかの制約が満たされない場合、サーバーは制約名と式を含む例外を発生させ、クエリは停止します。

## SELECTの結果を挿入する {#inserting-the-results-of-select}

**構文**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] SELECT ...
```

カラムは`SELECT`句の位置に従ってマッピングされます。しかし、`SELECT`式の中の名前とINSERT用のテーブルでの名前は異なっていても構いません。必要に応じて型のキャストが行われます。

Values形式以外のデータフォーマットでは、`now()`や`1 + 2`などの式へ値を設定することはできません。Values形式は限られた使用の表現を許可しますが、この場合は非効率なコードが使用されるため推奨されません。

データ部分を変更するための他のクエリはサポートされていません：`UPDATE`、`DELETE`、`REPLACE`、`MERGE`、`UPSERT`、`INSERT UPDATE`。
ただし、`ALTER TABLE ... DROP PARTITION`を使用して古いデータを削除することはできます。

`SELECT`句にテーブル関数[input()](../../sql-reference/table-functions/input.md)が含まれている場合、`FORMAT`句はクエリの最後に指定する必要があります。

ノンヌルデータ型のカラムに`NULL`の代わりにデフォルト値を挿入するには、[insert_null_as_default](../../operations/settings/settings.md#insert_null_as_default)設定を有効にします。

`INSERT`はCTE（共通テーブル式）もサポートしています。たとえば、次の二つのステートメントは同等です：

```sql
INSERT INTO x WITH y AS (SELECT * FROM numbers(10)) SELECT * FROM y;
WITH y AS (SELECT * FROM numbers(10)) INSERT INTO x SELECT * FROM y;
```

## ファイルからデータを挿入する {#inserting-data-from-a-file}

**構文**

```sql
INSERT INTO [TABLE] [db.]table [(c1, c2, c3)] FROM INFILE file_name [COMPRESSION type] [SETTINGS ...] [FORMAT format_name]
```

上記の構文を使用して、**クライアント**側に保存されたファイルからデータを挿入します。`file_name`と`type`は文字列リテラルです。入力ファイルの[フォーマット](../../interfaces/formats.md)は`FORMAT`句で設定する必要があります。

圧縮ファイルがサポートされています。圧縮タイプはファイル名の拡張子によって検出されます。また、`COMPRESSION`句で明示的に指定することも可能です。サポートされているタイプは： `'none'`、`'gzip'`、`'deflate'`、`'br'`、`'xz'`、`'zstd'`、`'lz4'`、`'bz2'`です。

この機能は[コマンドラインクライアント](../../interfaces/cli.md)や[clickhouse-local](../../operations/utilities/clickhouse-local.md)で利用できます。

**例**

### FROM INFILEを使用した単一ファイル {#single-file-with-from-infile}

次のクエリを[コマンドラインクライアント](../../interfaces/cli.md)を使用して実行します：

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

この例は前の例に非常に似ていますが、`FROM INFILE 'input_*.csv'`を使用して複数のファイルから挿入を行います。

```bash
echo 1,A > input_1.csv ; echo 2,B > input_2.csv
clickhouse-client --query="CREATE TABLE infile_globs (id UInt32, text String) ENGINE=MergeTree() ORDER BY id;"
clickhouse-client --query="INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;"
clickhouse-client --query="SELECT * FROM infile_globs FORMAT PrettyCompact;"
```

:::tip
複数のファイルを`*`で選択する他に、範囲（`{1,2}`または`{1..9}`）や他の[グロブ置換](/sql-reference/table-functions/file.md/#globs-in-path)を使用することができます。これらの3つはすべて、上記の例で機能します：

```sql
INSERT INTO infile_globs FROM INFILE 'input_*.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_{1,2}.csv' FORMAT CSV;
INSERT INTO infile_globs FROM INFILE 'input_?.csv' FORMAT CSV;
```
:::

## テーブル関数を使用した挿入 {#inserting-using-a-table-function}

データは[テーブル関数](../../sql-reference/table-functions/index.md)で参照されるテーブルに挿入できます。

**構文**

```sql
INSERT INTO [TABLE] FUNCTION table_func ...
```

**例**

次のクエリでは[remote](/sql-reference/table-functions/remote)テーブル関数が使用されています：

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

## ClickHouse Cloudへの挿入 {#inserting-into-clickhouse-cloud}

デフォルトでは、ClickHouse Cloud上のサービスは高可用性のために複数のレプリカを提供します。サービスに接続すると、これらのレプリカの1つに接続されます。

`INSERT`が成功すると、データは基盤となるストレージに書き込まれます。ただし、レプリカがこれらの更新を受け取るには少し時間がかかる場合があります。したがって、他のレプリカの1つで`SELECT`クエリを実行する異なる接続を使用すると、更新されたデータがまだ反映されない場合があります。

`select_sequential_consistency`を使用して、レプリカが最新の更新を受け取るよう強制することができます。この設定を使った`SELECT`クエリの例は次のとおりです：

```sql
SELECT .... SETTINGS select_sequential_consistency = 1;
```

`select_sequential_consistency`を使用すると、ClickHouse Keeper（ClickHouse Cloud内部で使用される）がより負荷高くなり、サービスの負荷に応じてパフォーマンスが遅くなる可能性があることに注意してください。この設定は必要がない限り有効にしないことをお勧めします。推奨アプローチは、同じセッションで読み取り/書き込みを実行するか、ネイティブプロトコルを使用するクライアントドライバを使用すること（したがって、スティッキー接続がサポートされます）です。

## レプリケーションされたセットアップへの挿入 {#inserting-into-a-replicated-setup}

レプリケーションされたセットアップでは、データは複製された後、他のレプリカで利用可能になります。データは、`INSERT` 直後にすぐに複製が開始されます（他のレプリカにダウンロードされます）。これは、データがすぐに共有ストレージに書き込まれ、レプリカがメタデータの変更にサブスクライブするClickHouse Cloudとは異なります。

レプリケーションされたセットアップでは、`INSERT`にかなりの時間（約1秒程度）がかかる場合があることに注意が必要です。これは、分散合意のためにClickHouse Keeperへのコミットが必要なためです。S3をストレージとして使用する場合にも追加の待機時間が発生します。

## パフォーマンスの考慮事項 {#performance-considerations}

`INSERT`は入力データを主キーでソートし、パーティションキーでパーティションに分割します。一度に複数のパーティションにデータを挿入すると、`INSERT`クエリのパフォーマンスが大きく低下することがあります。これを避けるためには：

- 1回に100,000行など、かなり大きなバッチでデータを追加します。
- データをClickHouseにアップロードする前に、パーティションキーでグループ化します。

リアルタイムでデータが追加される場合や、通常時間でソートされたデータをアップロードする場合は、パフォーマンスが低下することはありません。

### 非同期挿入 {#asynchronous-inserts}

小さいが頻繁な挿入を使用して非同期にデータを挿入することが可能です。そのような挿入からのデータはバッチにまとめられ、安全にテーブルに挿入されます。非同期挿入を使用するには、[`async_insert`](/operations/settings/settings#async_insert)設定を有効にします。

`async_insert`または[`Buffer`テーブルエンジン](/engines/table-engines/special/buffer)を使用すると、追加のバッファリングが発生します。

### 大量または長時間の挿入 {#large-or-long-running-inserts}

大量のデータを挿入する場合、ClickHouseは「圧縮」と呼ばれるプロセスを通じて書き込み性能を最適化します。メモリ内に挿入された小さなデータブロックはマージされ、大きなブロックに圧縮されてからディスクに書き込まれます。圧縮は、各書き込み操作に伴うオーバーヘッドを軽減します。このプロセスでは、挿入されたデータはClickHouseが[`max_insert_block_size`](/operations/settings/settings#max_insert_block_size)行の書き込みを完了した後にクエリ可能となります。

**その他の関連項目**

- [async_insert](/operations/settings/settings#async_insert)
- [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert)
- [wait_for_async_insert_timeout](/operations/settings/settings#wait_for_async_insert_timeout)
- [async_insert_max_data_size](/operations/settings/settings#async_insert_max_data_size)
- [async_insert_busy_timeout_ms](/operations/settings/settings#async_insert_busy_timeout_max_ms)
- [async_insert_stale_timeout_ms](/operations/settings/settings#async_insert_max_data_size)
