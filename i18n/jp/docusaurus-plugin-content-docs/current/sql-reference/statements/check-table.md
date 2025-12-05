---
description: 'Check Table のドキュメント'
sidebar_label: 'CHECK TABLE'
sidebar_position: 41
slug: /sql-reference/statements/check-table
title: 'CHECK TABLE 文'
doc_type: 'reference'
---

ClickHouse における `CHECK TABLE` クエリは、特定のテーブルまたはそのパーティションに対して整合性チェックを実行するために使用されます。チェックサムおよびその他の内部データ構造を検証することで、データの整合性を確認します。

具体的には、実際のファイルサイズと、サーバー上に保存されている期待される値を比較します。ファイルサイズが保存されている値と一致しない場合、そのデータは破損していることを意味します。これは、たとえばクエリ実行中のシステムクラッシュなどによって発生する可能性があります。

:::warning
`CHECK TABLE` クエリはテーブル内のすべてのデータを読み取り、一定のリソースを占有する可能性があるため、リソース負荷の高い処理となり得ます。
このクエリを実行する前に、パフォーマンスおよびリソース使用への影響を十分に考慮してください。
このクエリによってシステムのパフォーマンスが向上することはないため、自分が行っていることに確信が持てない場合は実行すべきではありません。
:::



## 構文 {#syntax}

クエリの基本的な構文は以下のとおりです。

```sql
CHECK TABLE table_name [PARTITION partition_expression | PART part_name] [FORMAT format] [SETTINGS check_query_single_value_result = (0|1) [, other_settings]]
```

* `table_name`: チェック対象のテーブル名を指定します。
* `partition_expression`: （任意）テーブル内の特定のパーティションのみをチェックしたい場合、この式でパーティションを指定できます。
* `part_name`: （任意）テーブル内の特定のパーツのみをチェックしたい場合、文字列リテラルでパーツ名を指定できます。
* `FORMAT format`: （任意）結果の出力フォーマットを指定できます。
* `SETTINGS`: （任意）追加の設定を指定できます。
  * **`check_query_single_value_result`**: （任意）詳細な結果（`0`）と要約結果（`1`）を切り替えるための設定です。
  * 他の設定も適用できます。結果の順序が決定的である必要がない場合は、クエリを高速化するために `max_threads` を 1 より大きい値に設定できます。

クエリ結果は、`check_query_single_value_result` 設定の値に依存します。
`check_query_single_value_result = 1` の場合は、1 行のみを含む `result` カラムだけが返されます。この行の値は、整合性チェックに合格した場合は `1`、データが破損している場合は `0` です。

`check_query_single_value_result = 0` の場合、クエリは次のカラムを返します。

* `part_path`: データパーツまたはファイル名へのパスを示します。
* `is_passed`: このパーツのチェックが成功した場合は 1、そうでない場合は 0 を返します。
* `message`: エラーや成功メッセージなど、チェックに関連する追加メッセージです。

`CHECK TABLE` クエリは次のテーブルエンジンをサポートします。

* [Log](../../engines/table-engines/log-family/log.md)
* [TinyLog](../../engines/table-engines/log-family/tinylog.md)
* [StripeLog](../../engines/table-engines/log-family/stripelog.md)
* [MergeTree family](../../engines/table-engines/mergetree-family/mergetree.md)

その他のテーブルエンジンを使用するテーブルに対して実行すると、`NOT_IMPLEMENTED` 例外が発生します。

`*Log` ファミリーのエンジンは、障害発生時の自動データ復旧を提供しません。`CHECK TABLE` クエリを使用して、データ損失をタイムリーに検知してください。


## Examples {#examples}

デフォルトでは、`CHECK TABLE` クエリはテーブル全体のチェック結果を表示します。

```sql
CHECK TABLE test_table;
```

```text
┌─result─┐
│      1 │
└────────┘
```

各データパーツごとのチェック状況を確認したい場合は、`check_query_single_value_result` 設定を使用できます。

また、テーブルの特定のパーティションのみをチェックするには、`PARTITION` キーワードを使用できます。

```sql
CHECK TABLE t0 PARTITION ID '201003'
FORMAT PrettyCompactMonoBlock
SETTINGS check_query_single_value_result = 0
```

出力例:

```text
┌─part_path────┬─is_passed─┬─message─┐
│ 201003_7_7_0 │         1 │         │
│ 201003_3_3_0 │         1 │         │
└──────────────┴───────────┴─────────┘
```

同様に、`PART` キーワードを使用すると、テーブル内の特定のパートを確認できます。

```sql
CHECK TABLE t0 PART '201003_7_7_0'
FORMAT PrettyCompactMonoBlock
SETTINGS check_query_single_value_result = 0
```

出力結果:

```text
┌─part_path────┬─is_passed─┬─message─┐
│ 201003_7_7_0 │         1 │         │
└──────────────┴───────────┴─────────┘
```

なお、パートが存在しない場合は、クエリはエラーを返します。

```sql
CHECK TABLE t0 PART '201003_111_222_0'
```

```text
DB::Exception: No such data part '201003_111_222_0' to check in table 'default.t0'. (NO_SUCH_DATA_PART)
```

### 「Corrupted（破損）」という結果を受け取った場合 {#receiving-a-corrupted-result}

:::warning
免責事項: ここで説明している手順（データディレクトリ内のファイルを手動で操作したり、直接削除したりすることを含む）は、実験または開発環境のみを対象としています。これを本番サーバーで実行しないでください。データ損失やその他の予期しない結果を招く可能性があります。
:::

既存のチェックサムファイルを削除します:

```bash
rm /var/lib/clickhouse-server/data/default/t0/201003_3_3_0/checksums.txt
```

````sql
CHECK TABLE t0 PARTITION ID '201003'
FORMAT PrettyCompactMonoBlock
SETTINGS check_query_single_value_result = 0


Output:

```text
┌─part_path────┬─is_passed─┬─message──────────────────────────────────┐
│ 201003_7_7_0 │         1 │                                          │
│ 201003_3_3_0 │         1 │ Checksums recounted and written to disk. │
└──────────────┴───────────┴──────────────────────────────────────────┘
````

checksums.txt ファイルが存在しない場合でも、復元できます。特定のパーティションに対して `CHECK TABLE` コマンドを実行する際に再計算されて書き込まれ、そのステータスは引き続き &#39;is&#95;passed = 1&#39; として報告されます。

`CHECK ALL TABLES` クエリを使用すると、既存のすべての `(Replicated)MergeTree` テーブルを一度にチェックできます。

```sql
CHECK ALL TABLES
FORMAT PrettyCompactMonoBlock
SETTINGS check_query_single_value_result = 0
```


```text
┌─database─┬─table────┬─part_path───┬─is_passed─┬─message─┐
│ default  │ t2       │ all_1_95_3  │         1 │         │
│ db1      │ table_01 │ all_39_39_0 │         1 │         │
│ default  │ t1       │ all_39_39_0 │         1 │         │
│ db1      │ t1       │ all_39_39_0 │         1 │         │
│ db1      │ table_01 │ all_1_6_1   │         1 │         │
│ default  │ t1       │ all_1_6_1   │         1 │         │
│ db1      │ t1       │ all_1_6_1   │         1 │         │
│ db1      │ table_01 │ all_7_38_2  │         1 │         │
│ db1      │ t1       │ all_7_38_2  │         1 │         │
│ default  │ t1       │ all_7_38_2  │         1 │         │
└──────────┴──────────┴─────────────┴───────────┴─────────┘
```


## If the Data Is Corrupted {#if-the-data-is-corrupted}

テーブルが破損している場合、破損していないデータを別のテーブルにコピーできます。次の手順を実行します。

1.  破損したテーブルと同じ構造を持つ新しいテーブルを作成します。そのためには、クエリ `CREATE TABLE <new_table_name> AS <damaged_table_name>` を実行します。
2.  次のクエリを単一スレッドで処理するために、`max_threads` の値を 1 に設定します。そのためには、クエリ `SET max_threads = 1` を実行します。
3.  クエリ `INSERT INTO <new_table_name> SELECT * FROM <damaged_table_name>` を実行します。このクエリは、破損していないデータを破損したテーブルから別のテーブルにコピーします。破損している部分より前のデータのみがコピーされます。
4.  `max_threads` の値をリセットするために、`clickhouse-client` を再起動します。
