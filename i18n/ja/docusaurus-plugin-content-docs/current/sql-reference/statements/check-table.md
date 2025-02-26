---
slug: /sql-reference/statements/check-table
sidebar_position: 41
sidebar_label: CHECK TABLE
title: "CHECK TABLE ステートメント"
---

`CHECK TABLE` クエリは、特定のテーブルまたはそのパーティションに対して検証チェックを行うために ClickHouse で使用されます。このクエリは、チェックサムやその他の内部データ構造を検証することによって、データの整合性を確保します。

具体的には、実際のファイルサイズをサーバーに保存されている予想値と比較します。ファイルサイズが保存された値と一致しない場合、データが破損していることを意味します。これは、例えば、クエリ実行中のシステムクラッシュによって引き起こされることがあります。

:::note
`CHECK TABLE` クエリは、テーブル内のすべてのデータを読み取り、リソースを保持する可能性があるため、リソース集約型です。
このクエリを実行する前に、パフォーマンスやリソース利用に対する潜在的な影響を考慮してください。
:::

## 構文 {#syntax}

クエリの基本構文は次のとおりです：

```sql
CHECK TABLE table_name [PARTITION partition_expression | PART part_name] [FORMAT format] [SETTINGS check_query_single_value_result = (0|1) [, other_settings]]
```

- `table_name`: チェックしたいテーブルの名前を指定します。
- `partition_expression`: （オプション）特定のパーティションをチェックしたい場合、この式を使用してパーティションを指定できます。
- `part_name`: （オプション）テーブル内の特定のパートをチェックしたい場合、文字列リテラルを追加してパート名を指定できます。
- `FORMAT format`: （オプション）結果の出力形式を指定します。
- `SETTINGS`: （オプション）追加の設定を許可します。
	- **`check_query_single_value_result`**: （オプション）この設定を使用すると、詳細結果（`0`）と要約結果（`1`）の間で切り替えることができます。
	- その他の設定も適用可能です。結果の決定的な順序が必要ない場合、max_threads を 1 より大きい値に設定することでクエリが高速化されます。

クエリの応答は、`check_query_single_value_result` 設定の値によって異なります。
`check_query_single_value_result = 1` の場合、単一行の `result` カラムのみが返されます。この行の値は、整合性チェックが通過した場合は `1`、データが破損している場合は `0` です。

`check_query_single_value_result = 0` の場合、クエリは次のカラムを返します：
- `part_path`: データパートまたはファイル名へのパスを示します。
- `is_passed`: このパートのチェックが成功した場合は 1、そうでない場合は 0 を返します。
- `message`: チェックに関連する追加メッセージ（エラーや成功メッセージなど）を示します。

`CHECK TABLE` クエリは、次のテーブルエンジンをサポートしています：

- [Log](../../engines/table-engines/log-family/log.md)
- [TinyLog](../../engines/table-engines/log-family/tinylog.md)
- [StripeLog](../../engines/table-engines/log-family/stripelog.md)
- [MergeTree ファミリー](../../engines/table-engines/mergetree-family/mergetree.md)

他のテーブルエンジンに対してこの操作を実行すると `NOT_IMPLEMENTED` 例外が発生します。

`*Log` ファミリーのエンジンは、障害時に自動的なデータ復旧を提供しません。データ損失をタイムリーに追跡するために、`CHECK TABLE` クエリを使用してください。

## 例 {#examples}

デフォルトでは、`CHECK TABLE` クエリはテーブルの一般的なチェックステータスを表示します：

```sql
CHECK TABLE test_table;
```

```text
┌─result─┐
│      1 │
└────────┘
```

個々のデータパートのチェックステータスを確認したい場合は、`check_query_single_value_result` 設定を使用します。

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

同様に、`PART` キーワードを使用してテーブルの特定のパートを確認できます。

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

存在しないパートをチェックすると、クエリはエラーを返します：

```sql
CHECK TABLE t0 PART '201003_111_222_0'
```

```text
DB::Exception: テーブル 'default.t0' にチェックするデータパート '201003_111_222_0' は存在しません。 (NO_SUCH_DATA_PART)
```

### '破損した' 結果を受け取る {#receiving-a-corrupted-result}

:::warning
免責事項: ここで説明する手順、特にデータディレクトリからのファイルの手動操作または削除は、実験環境または開発環境専用です。生産サーバーでこれを試みないでください。データ損失やその他の意図しない結果を招く可能性があります。
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
│ 201003_3_3_0 │         1 │ チェックサムが再カウントされ、ディスクに書き込まれました。 │
└──────────────┴───────────┴──────────────────────────────────────────┘
```

チェックサムファイルが欠落している場合、それは復元できます。特定のパーティションに対して `CHECK TABLE` コマンドを実行中に再計算され、書き込まれ、ステータスは依然として 'is_passed = 1' として報告されます。

すべての既存の `(Replicated)MergeTree` テーブルを一度にチェックするには、`CHECK ALL TABLES` クエリを使用できます。

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

テーブルが破損している場合、破損していないデータを別のテーブルにコピーできます。これを行うには：

1.  壊れたテーブルと同じ構造の新しいテーブルを作成します。これを実行するには、クエリ `CREATE TABLE <new_table_name> AS <damaged_table_name>` を実行します。
2.  次のクエリを1つのスレッドで処理するように `max_threads` の値を1に設定します。これを行うには、クエリ `SET max_threads = 1` を実行します。
3.  クエリ `INSERT INTO <new_table_name> SELECT * FROM <damaged_table_name>` を実行します。このリクエストは、壊れたテーブルから破損していないデータを別のテーブルにコピーします。破損したパート以前のデータのみがコピーされます。
4.  `clickhouse-client` を再起動して `max_threads` の値をリセットします。
