---
description: 'テーブルチェックのためのドキュメント'
sidebar_label: 'CHECK TABLE'
sidebar_position: 41
slug: /sql-reference/statements/check-table
title: 'CHECK TABLE ステートメント'
---

ClickHouseの `CHECK TABLE` クエリは、特定のテーブルまたはそのパーティションに対してバリデーションチェックを実行するために使用されます。これは、チェックサムやその他の内部データ構造を検証することによって、データの整合性を確保します。

具体的には、実際のファイルサイズをサーバーに保存されている期待値と比較します。ファイルサイズが保存された値と一致しない場合、データが破損していることを意味します。これは、例えば、クエリの実行中にシステムクラッシュが発生した場合などに起こり得ます。

:::warning
`CHECK TABLE` クエリはテーブル内のすべてのデータを読み取る可能性があり、いくつかのリソースを保持するため、リソース集約的です。このクエリを実行する前に、パフォーマンスとリソース利用への影響を考慮してください。このクエリはシステムのパフォーマンスを向上させるものではなく、何をしているのか確信がない場合は実行しないでください。
:::

## 構文 {#syntax}

クエリの基本構文は次のとおりです：

```sql
CHECK TABLE table_name [PARTITION partition_expression | PART part_name] [FORMAT format] [SETTINGS check_query_single_value_result = (0|1) [, other_settings]]
```

- `table_name`: チェックしたいテーブルの名前を指定します。
- `partition_expression`: (オプション) テーブルの特定のパーティションをチェックしたい場合、この式を使用してパーティションを指定できます。
- `part_name`: (オプション) テーブルの特定のパーツをチェックしたい場合、文字列リテラルを追加してパート名を指定できます。
- `FORMAT format`: (オプション) 結果の出力形式を指定できます。
- `SETTINGS`: (オプション) 追加の設定を許可します。
    - **`check_query_single_value_result`**: (オプション) この設定により、詳細な結果（`0`）または要約された結果（`1`）を切り替えることができます。
    - その他の設定も適用できます。結果に決定的な順序が必要ない場合は、max_threadsを1より大きい値に設定してクエリを加速できます。

クエリの応答は `check_query_single_value_result` 設定の値に依存します。`check_query_single_value_result = 1` の場合、単一行を持つ `result` カラムのみが返されます。この行内の値は、整合性チェックが通過すれば `1`、データが破損していれば `0` です。

`check_query_single_value_result = 0` の場合、クエリは次のカラムを返します：
- `part_path`: データパートまたはファイル名へのパスを示します。
- `is_passed`: このパートのチェックが成功した場合に `1` を返し、そうでない場合は `0` を返します。
- `message`: チェックに関連する追加のメッセージ（エラーや成功メッセージなど）。

`CHECK TABLE` クエリは次のテーブルエンジンをサポートしています：

- [Log](../../engines/table-engines/log-family/log.md)
- [TinyLog](../../engines/table-engines/log-family/tinylog.md)
- [StripeLog](../../engines/table-engines/log-family/stripelog.md)
- [MergeTreeファミリー](../../engines/table-engines/mergetree-family/mergetree.md)

別のテーブルエンジンに対して実行すると `NOT_IMPLEMENTED` 例外が発生します。

`*Log` ファミリーのエンジンは、障害時に自動データ回復を提供しません。`CHECK TABLE` クエリを使用して、タイムリーにデータ損失を追跡してください。

## 例 {#examples}

デフォルトの `CHECK TABLE` クエリは、一般的なテーブルチェックのステータスを表示します：

```sql
CHECK TABLE test_table;
```

```text
┌─result─┐
│      1 │
└────────┘
```

各データパートのチェックステータスを確認したい場合は、`check_query_single_value_result` 設定を使用します。

また、テーブルの特定のパーティションをチェックするには、`PARTITION` キーワードを使用できます。

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

同様に、`PART` キーワードを使用してテーブルの特定のパートをチェックできます。

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

パートが存在しない場合、クエリはエラーを返すことに注意してください：

```sql
CHECK TABLE t0 PART '201003_111_222_0'
```

```text
DB::Exception: No such data part '201003_111_222_0' to check in table 'default.t0'. (NO_SUCH_DATA_PART)
```

### 'Corrupted' 結果を受け取る {#receiving-a-corrupted-result}

:::warning
免責事項：ここで説明されている手順（データディレクトリからファイルを手動で操作または削除することを含む）は、実験環境や開発環境専用です。生産サーバーでこれを試みることは **しないでください**。データ損失やその他の意図しない結果を引き起こす可能性があります。
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
│ 201003_3_3_0 │         1 │ Checksums recounted and written to disk. │
└──────────────┴───────────┴──────────────────────────────────────────┘
```

checksums.txtファイルが欠落している場合は、復元できます。これは特定のパーティションの `CHECK TABLE` コマンドが実行される際に再計算され、ディスクに書き込まれ、ステータスは依然として' is_passed = 1' として報告されます。

`CHECK ALL TABLES` クエリを使用してすべての既存の `(Replicated)MergeTree` テーブルを一度にチェックできます。

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

テーブルが破損している場合は、非破損データを別のテーブルにコピーできます。これを行うには：

1.  破損したテーブルと同じ構造の新しいテーブルを作成します。そのためには、クエリ `CREATE TABLE <new_table_name> AS <damaged_table_name>` を実行します。
2.  次のクエリを単一スレッドで処理するために、`max_threads` の値を1に設定します。そのためには、クエリ `SET max_threads = 1` を実行します。
3.  クエリ `INSERT INTO <new_table_name> SELECT * FROM <damaged_table_name>` を実行します。このリクエストは、破損したテーブルから非破損データを別のテーブルにコピーします。破損した部分より前のデータのみがコピーされます。
4.  `max_threads` の値をリセットするために `clickhouse-client` を再起動します。
