---
description: 'Check Table のドキュメント'
sidebar_label: 'CHECK TABLE'
sidebar_position: 41
slug: /sql-reference/statements/check-table
title: 'CHECK TABLE ステートメント'
doc_type: 'reference'
---

ClickHouse の `CHECK TABLE` クエリは、特定のテーブルまたはそのパーティションに対して整合性検査を実行するために使用されます。チェックサムおよびその他の内部データ構造を検証することで、データの完全性を保証します。

特に、実際のファイルサイズとサーバー上に保存されている想定値を比較します。ファイルサイズが保存されている値と一致しない場合、データが破損していることを意味します。これは、たとえばクエリ実行中のシステムクラッシュによって発生する可能性があります。

:::warning
`CHECK TABLE` クエリはテーブル内のすべてのデータを読み取り、一部のリソースを長時間占有する可能性があり、多くのリソースを消費します。
このクエリを実行する前に、パフォーマンスおよびリソース使用への潜在的な影響を検討してください。
このクエリによってシステムのパフォーマンスが向上することはなく、何をしているかを十分に理解していない場合は実行すべきではありません。
:::



## 構文 {#syntax}

クエリの基本構文は以下の通りです:

```sql
CHECK TABLE table_name [PARTITION partition_expression | PART part_name] [FORMAT format] [SETTINGS check_query_single_value_result = (0|1) [, other_settings]]
```

- `table_name`: チェックするテーブルの名前を指定します。
- `partition_expression`: (オプション) テーブルの特定のパーティションをチェックする場合、この式を使用してパーティションを指定できます。
- `part_name`: (オプション) テーブル内の特定のパートをチェックする場合、文字列リテラルを追加してパート名を指定できます。
- `FORMAT format`: (オプション) 結果の出力形式を指定できます。
- `SETTINGS`: (オプション) 追加の設定を指定できます。
  - **`check_query_single_value_result`**: (オプション) この設定により、詳細な結果 (`0`) または要約された結果 (`1`) を切り替えることができます。
  - その他の設定も適用できます。結果の決定的な順序が不要な場合は、max_threadsを1より大きい値に設定することでクエリを高速化できます。

クエリの応答は`check_query_single_value_result`設定の値に依存します。
`check_query_single_value_result = 1`の場合、単一行の`result`列のみが返されます。この行の値は、整合性チェックが成功した場合は`1`、データが破損している場合は`0`となります。

`check_query_single_value_result = 0`の場合、クエリは以下の列を返します:
- `part_path`: データパートへのパスまたはファイル名を示します。
- `is_passed`: このパートのチェックが成功した場合は1、それ以外の場合は0を返します。
- `message`: エラーや成功メッセージなど、チェックに関連する追加メッセージ。

`CHECK TABLE`クエリは以下のテーブルエンジンをサポートしています:

- [Log](../../engines/table-engines/log-family/log.md)
- [TinyLog](../../engines/table-engines/log-family/tinylog.md)
- [StripeLog](../../engines/table-engines/log-family/stripelog.md)
- [MergeTree family](../../engines/table-engines/mergetree-family/mergetree.md)

他のテーブルエンジンを使用するテーブルに対して実行すると、`NOT_IMPLEMENTED`例外が発生します。

`*Log`ファミリーのエンジンは、障害時の自動データ復旧機能を提供しません。`CHECK TABLE`クエリを使用して、データ損失を適時に追跡してください。


## 例 {#examples}

デフォルトでは、`CHECK TABLE`クエリはテーブルチェックの全体的なステータスを表示します:

```sql
CHECK TABLE test_table;
```

```text
┌─result─┐
│      1 │
└────────┘
```

個々のデータパートごとのチェックステータスを確認したい場合は、`check_query_single_value_result`設定を使用できます。

また、テーブルの特定のパーティションをチェックするには、`PARTITION`キーワードを使用できます。

```sql
CHECK TABLE t0 PARTITION ID '201003'
FORMAT PrettyCompactMonoBlock
SETTINGS check_query_single_value_result = 0
```

出力:

```text
┌─part_path────┬─is_passed─┬─message─┐
│ 201003_7_7_0 │         1 │         │
│ 201003_3_3_0 │         1 │         │
└──────────────┴───────────┴─────────┘
```

同様に、`PART`キーワードを使用してテーブルの特定のパートをチェックできます。

```sql
CHECK TABLE t0 PART '201003_7_7_0'
FORMAT PrettyCompactMonoBlock
SETTINGS check_query_single_value_result = 0
```

出力:

```text
┌─part_path────┬─is_passed─┬─message─┐
│ 201003_7_7_0 │         1 │         │
└──────────────┴───────────┴─────────┘
```

パートが存在しない場合、クエリはエラーを返すことに注意してください:

```sql
CHECK TABLE t0 PART '201003_111_222_0'
```

```text
DB::Exception: No such data part '201003_111_222_0' to check in table 'default.t0'. (NO_SUCH_DATA_PART)
```

### '破損'結果の受信 {#receiving-a-corrupted-result}

:::warning
免責事項: ここで説明する手順は、データディレクトリから直接ファイルを手動で操作または削除することを含め、実験環境または開発環境専用です。本番サーバーでは**実行しないでください**。データ損失やその他の意図しない結果を招く可能性があります。
:::

既存のチェックサムファイルを削除します:

```bash
rm /var/lib/clickhouse-server/data/default/t0/201003_3_3_0/checksums.txt
```

````sql
CHECK TABLE t0 PARTITION ID '201003'
FORMAT PrettyCompactMonoBlock
SETTINGS check_query_single_value_result = 0


出力:

```text
┌─part_path────┬─is_passed─┬─message──────────────────────────────────┐
│ 201003_7_7_0 │         1 │                                          │
│ 201003_3_3_0 │         1 │ Checksums recounted and written to disk. │
└──────────────┴───────────┴──────────────────────────────────────────┘
````

checksums.txtファイルが欠落している場合、復元できます。特定のパーティションに対してCHECK TABLEコマンドを実行する際に再計算され、書き直されます。その場合でもステータスは'is_passed = 1'として報告されます。

`CHECK ALL TABLES`クエリを使用して、既存のすべての`(Replicated)MergeTree`テーブルを一度にチェックできます。

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

テーブルが破損している場合、破損していないデータを別のテーブルにコピーできます。手順は以下の通りです:

1.  破損したテーブルと同じ構造の新しいテーブルを作成します。`CREATE TABLE <new_table_name> AS <damaged_table_name>` クエリを実行してください。
2.  次のクエリを単一スレッドで処理するために、`max_threads` の値を1に設定します。`SET max_threads = 1` クエリを実行してください。
3.  `INSERT INTO <new_table_name> SELECT * FROM <damaged_table_name>` クエリを実行します。このクエリは、破損したテーブルから破損していないデータを別のテーブルにコピーします。破損した部分より前のデータのみがコピーされます。
4.  `clickhouse-client` を再起動して、`max_threads` の値をリセットします。
