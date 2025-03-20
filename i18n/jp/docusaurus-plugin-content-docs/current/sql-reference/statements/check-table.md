---
slug: /sql-reference/statements/check-table
sidebar_position: 41
sidebar_label: CHECK TABLE
title: "CHECK TABLE ステートメント"
---

`CHECK TABLE` クエリは、ClickHouse において特定のテーブルまたはそのパーティションに対して検証チェックを実施するために使用されます。これは、チェックサムやその他の内部データ構造を確認することでデータの整合性を保証します。

特に、実際のファイルサイズとサーバーに保存されている期待値を比較します。ファイルサイズが保存された値と一致しない場合、データが破損していることを示します。例えば、クエリ実行中にシステムがクラッシュした場合などに発生することがあります。

:::note
`CHECK TABLE` クエリはテーブル内のすべてのデータを読み取り、いくつかのリソースを保持するため、リソース集約的になります。
このクエリを実行する前に、パフォーマンスやリソース使用に対する潜在的な影響を考慮してください。
:::

## 構文 {#syntax}

クエリの基本的な構文は次のとおりです：

```sql
CHECK TABLE table_name [PARTITION partition_expression | PART part_name] [FORMAT format] [SETTINGS check_query_single_value_result = (0|1) [, other_settings]]
```

- `table_name`: チェックしたいテーブルの名前を指定します。
- `partition_expression`: （オプション）テーブルの特定のパーティションをチェックしたい場合、この式を使用してパーティションを指定できます。
- `part_name`: （オプション）テーブルの特定のパーツをチェックしたい場合、文字列リテラルを追加してパート名を指定できます。
- `FORMAT format`: （オプション）結果の出力フォーマットを指定できます。
- `SETTINGS`: （オプション）追加の設定を許可します。
	- **`check_query_single_value_result`**: （オプション）詳細な結果（`0`）または要約結果（`1`）を切り替えることができるこの設定です。
	- 他の設定も適用可能です。結果の決定的な順序が不要であれば、max_threads を 1 より大きい値に設定してクエリを高速化できます。

クエリの応答は、`check_query_single_value_result` 設定の値に依存します。
`check_query_single_value_result = 1` の場合、単一行の結果列のみが返されます。この行の値は、整合性チェックが合格した場合は `1`、データが破損している場合は `0` です。

`check_query_single_value_result = 0` の場合、クエリは次の列を返します：
    - `part_path`: データパートまたはファイル名へのパスを示します。
    - `is_passed`: このパートのチェックが成功した場合は `1`、そうでない場合は `0` を返します。
    - `message`: チェックに関連する追加メッセージ（エラーや成功メッセージなど）です。

`CHECK TABLE` クエリは次のテーブルエンジンをサポートしています：

- [Log](../../engines/table-engines/log-family/log.md)
- [TinyLog](../../engines/table-engines/log-family/tinylog.md)
- [StripeLog](../../engines/table-engines/log-family/stripelog.md)
- [MergeTree ファミリー](../../engines/table-engines/mergetree-family/mergetree.md)

他のテーブルエンジンで実行すると、`NOT_IMPLEMENTED` 例外が発生します。

`*Log` ファミリーのエンジンは、障害時の自動データ回復を提供しません。`CHECK TABLE` クエリを使用して、データ損失をタイムリーに追跡してください。

## 例 {#examples}

デフォルトでは `CHECK TABLE` クエリはテーブルの一般的なチェックステータスを表示します：

```sql
CHECK TABLE test_table;
```

```text
┌─result─┐
│      1 │
└────────┘
```

すべての個々のデータパートのチェックステータスを表示したい場合は、`check_query_single_value_result` 設定を使用できます。

また、テーブルの特定のパーティションをチェックしたい場合は、`PARTITION` キーワードを使用できます。

```sql
CHECK TABLE t0 PARTITION ID '201003'
FORMAT PrettyCompactMonoBlock
SETTINGS check_query_single_value_result = 0
```

出力：

```text
┌─part_path────┬─is_passed─┬─message─┐
│ 201003_7_7_0 │         1 │         │
│ 201003_3_3_0 │         1 │         │
└──────────────┴───────────┴─────────┘
```

同様に、`PART` キーワードを使用してテーブルの特定のパーツをチェックできます。

```sql
CHECK TABLE t0 PART '201003_7_7_0'
FORMAT PrettyCompactMonoBlock
SETTINGS check_query_single_value_result = 0
```

出力：

```text
┌─part_path────┬─is_passed─┬─message─┐
│ 201003_7_7_0 │         1 │         │
└──────────────┴───────────┴─────────┘
```

パートが存在しない場合、クエリはエラーを返します：

```sql
CHECK TABLE t0 PART '201003_111_222_0'
```

```text
DB::Exception: テーブル 'default.t0' にチェックするデータパート '201003_111_222_0' は存在しません。(NO_SUCH_DATA_PART)
```

### '破損' の結果を受け取る {#receiving-a-corrupted-result}

:::warning
免責事項：ここで説明する手順（データディレクトリからのファイルを直接手動で操作または削除することを含む）は、実験的または開発環境のみを対象としています。本番サーバーでこれを試みることは **しないでください**。データ損失やその他の予期しない結果を招く可能性があります。
:::

既存のチェックサムファイルを削除します：

```bash
rm /var/lib/clickhouse-server/data/default/t0/201003_3_3_0/checksums.txt
```

```sql
CHECK TABLE t0 PARTITION ID '201003'
FORMAT PrettyCompactMonoBlock
SETTINGS check_query_single_value_result = 0
```

出力：

```text
┌─part_path────┬─is_passed─┬─message──────────────────────────────────┐
│ 201003_7_7_0 │         1 │                                          │
│ 201003_3_3_0 │         1 │ チェックサムが再計算され、ディスクに書き込まれました。 │
└──────────────┴───────────┴──────────────────────────────────────────┘
```

checksums.txt ファイルが欠損している場合、復元できます。これは特定のパーティションに対する CHECK TABLE コマンドの実行中に再計算され、再書き込まれますが、ステータスは引き続き 'is_passed = 1' として報告されます。

`CHECK ALL TABLES` クエリを使用して、存在するすべての `(Replicated)MergeTree` テーブルを一度にチェックできます。

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

## データが破損している場合 {#if-the-data-is-corrupted}

テーブルが破損している場合、破損していないデータを別のテーブルにコピーできます。これを行う手順は次のとおりです：

1.  破損したテーブルと同じ構造の新しいテーブルを作成します。このために、クエリ `CREATE TABLE <new_table_name> AS <damaged_table_name>` を実行します。
2.  次のクエリを単一スレッドで処理するために、`max_threads` 値を 1 に設定します。このためにクエリ `SET max_threads = 1` を実行します。
3.  クエリ `INSERT INTO <new_table_name> SELECT * FROM <damaged_table_name>` を実行します。このリクエストは、破損したテーブルから破損していないデータを別のテーブルにコピーします。破損したパートより前のデータのみがコピーされます。
4.  `clickhouse-client` を再起動して `max_threads` 値をリセットします。
