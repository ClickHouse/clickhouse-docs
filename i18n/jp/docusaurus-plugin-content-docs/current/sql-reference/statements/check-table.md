---
'description': 'CHECK TABLE 的文档'
'sidebar_label': 'CHECK TABLE'
'sidebar_position': 41
'slug': '/sql-reference/statements/check-table'
'title': 'CHECK TABLE 文章'
'doc_type': 'reference'
---

The `CHECK TABLE` クエリは ClickHouse において、特定のテーブルまたはそのパーティションの検証チェックを実行するために使用されます。これは、チェックサムやその他の内部データ構造を検証することによってデータの整合性を確保します。

特に、実際のファイルサイズとサーバーに保存されている期待値を比較します。ファイルサイズが保存されている値と一致しない場合、それはデータが破損していることを意味します。これは、例えばクエリ実行中のシステムクラッシュによって引き起こされる可能性があります。

:::warning
`CHECK TABLE` クエリは、テーブル内のすべてのデータを読み取り、一部のリソースを保持する可能性があるため、リソース集約的です。
このクエリを実行する前に、パフォーマンスとリソース利用に対する潜在的な影響を考慮してください。
このクエリはシステムのパフォーマンスを改善することはなく、何をしているのかわからない場合は実行しないでください。
:::

## 構文 {#syntax}

クエリの基本構文は次のとおりです：

```sql
CHECK TABLE table_name [PARTITION partition_expression | PART part_name] [FORMAT format] [SETTINGS check_query_single_value_result = (0|1) [, other_settings]]
```

- `table_name`: チェックしたいテーブルの名前を指定します。
- `partition_expression`: （オプション）テーブルの特定のパーティションをチェックしたい場合、この式を使用してパーティションを指定できます。
- `part_name`: （オプション）テーブルの特定のパートをチェックしたい場合、文字列リテラルを追加してパート名を指定できます。
- `FORMAT format`: （オプション）結果の出力形式を指定できます。
- `SETTINGS`: （オプション）追加の設定を可能にします。
  - **`check_query_single_value_result`**: （オプション）この設定を使用すると、詳細な結果（`0`）と要約された結果（`1`）の間で切り替えることができます。
  - 他の設定も適用可能です。結果の決定的な順序を必要としない場合、max_threads を 1 より大きな値に設定して、クエリを高速化できます。

クエリの応答は `check_query_single_value_result` 設定の値に依存します。
`check_query_single_value_result = 1` の場合、単一の行を持つ `result` カラムだけが返されます。この行内の値は、整合性チェックが通った場合は `1`、データが破損している場合は `0` です。

`check_query_single_value_result = 0` の場合、クエリは次のカラムを返します：
    - `part_path`: データパートまたはファイル名へのパスを示します。
    - `is_passed`: このパートのチェックが成功した場合は `1`、そうでない場合は `0` を返します。
    - `message`: チェックに関連する追加のメッセージ（エラーや成功メッセージなど）です。

`CHECK TABLE` クエリは、次のテーブルエンジンをサポートしています：

- [Log](../../engines/table-engines/log-family/log.md)
- [TinyLog](../../engines/table-engines/log-family/tinylog.md)
- [StripeLog](../../engines/table-engines/log-family/stripelog.md)
- [MergeTree family](../../engines/table-engines/mergetree-family/mergetree.md)

他のテーブルエンジンの上で実行すると `NOT_IMPLEMENTED` 例外が発生します。

`*Log` ファミリーのエンジンは、失敗時に自動データ回復を提供しません。データ損失をタイムリーに追跡するために `CHECK TABLE` クエリを使用します。

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

すべての個々のデータパートのチェックステータスが見たい場合は、`check_query_single_value_result` 設定を使用できます。

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

パートが存在しない場合は、クエリがエラーを返すことに注意してください：

```sql
CHECK TABLE t0 PART '201003_111_222_0'
```

```text
DB::Exception: No such data part '201003_111_222_0' to check in table 'default.t0'. (NO_SUCH_DATA_PART)
```

### 'Corrupted' 結果の受信 {#receiving-a-corrupted-result}

:::warning
免責事項：ここで説明されている手順、特にデータディレクトリからファイルを手動で操作したり削除したりすることは、実験または開発環境専用です。生産サーバーではこれを試みないでください。データ損失やその他の意図しない結果を招く可能性があります。
:::

既存のチェックサムファイルを削除します：

```bash
rm /var/lib/clickhouse-server/data/default/t0/201003_3_3_0/checksums.txt
```

```sql
CHECK TABLE t0 PARTITION ID '201003'
FORMAT PrettyCompactMonoBlock
SETTINGS check_query_single_value_result = 0


Output:

```text
┌─part_path────┬─is_passed─┬─message──────────────────────────────────┐
│ 201003_7_7_0 │         1 │                                          │
│ 201003_3_3_0 │         1 │ Checksums recounted and written to disk. │
└──────────────┴───────────┴──────────────────────────────────────────┘
```

checksums.txt ファイルが欠落している場合は、復元できます。このファイルは、特定のパーティションの CHECK TABLE コマンドの実行中に再計算され、書き直されます。また、状態は 'is_passed = 1' として報告されます。

`CHECK ALL TABLES` クエリを使用して、すべての既存の `(Replicated)MergeTree` テーブルを一度にチェックできます。

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

テーブルが破損している場合、非破損データを別のテーブルにコピーできます。そのためには：

1.  破損したテーブルと同じ構造の新しいテーブルを作成します。これには、`CREATE TABLE <new_table_name> AS <damaged_table_name>` クエリを実行します。
2.  次のクエリを単一スレッドで処理するために `max_threads` 値を 1 に設定します。これには、`SET max_threads = 1` クエリを実行します。
3.  `INSERT INTO <new_table_name> SELECT * FROM <damaged_table_name>` クエリを実行します。このリクエストは、破損したテーブルから別のテーブルに非破損データをコピーします。破損した部分の前のデータのみがコピーされます。
4.  `clickhouse-client` を再起動して `max_threads` 値をリセットします。
