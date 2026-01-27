---
description: 'CHECK TABLE に関するドキュメント'
sidebar_label: 'CHECK TABLE'
sidebar_position: 41
slug: /sql-reference/statements/check-table
title: 'CHECK TABLE ステートメント'
doc_type: 'reference'
---

ClickHouse における `CHECK TABLE` クエリは、特定のテーブルまたはそのパーティションに対して検証を実行するために使用されます。チェックサムやその他の内部データ構造を検証することで、データの整合性を確認します。

特に、サーバー上に保存されている期待されるファイルサイズと実際のファイルサイズを比較します。ファイルサイズが保存されている値と一致しない場合、データが破損していることを意味します。これは、例えばクエリ実行中のシステムクラッシュなどが原因で発生することがあります。

:::warning
`CHECK TABLE` クエリはテーブル内のすべてのデータを読み取り、多くのリソースを占有する可能性があるため、リソース負荷の高い処理となる場合があります。
このクエリを実行する前に、パフォーマンスやリソース使用量への影響を十分に考慮してください。
このクエリはシステムのパフォーマンスを向上させるものではなく、何をしているか確信が持てない場合には実行すべきではありません。
:::

## 構文 \{#syntax\}

クエリの基本的な構文は次のとおりです。

```sql
CHECK TABLE table_name [PARTITION partition_expression | PART part_name] [FORMAT format] [SETTINGS check_query_single_value_result = (0|1) [, other_settings]]
```

* `table_name`: チェック対象のテーブル名を指定します。
* `partition_expression`: （任意）テーブル内の特定のパーティションのみをチェックしたい場合、この式を使ってパーティションを指定します。
* `part_name`: （任意）テーブル内の特定のパーツのみをチェックしたい場合、パーツ名を指定する文字列リテラルを追加します。
* `FORMAT format`: （任意）結果の出力フォーマットを指定できます。
* `SETTINGS`: （任意）追加の設定を行えます。
  * （任意）：[check&#95;query&#95;single&#95;value&#95;result](../../operations/settings/settings#check_query_single_value_result): 詳細な結果（`0`）と要約結果（`1`）を切り替えるための設定です。
  * その他の設定も適用できます。結果の順序が決定的である必要がない場合、クエリを高速化するために max&#95;threads を 1 より大きい値に設定できます。

クエリのレスポンスは、`check_query_single_value_result` 設定の値に依存します。
`check_query_single_value_result = 1` の場合、単一行のみを持つ `result` 列だけが返されます。この行の値は、整合性チェックに合格した場合は `1`、データが破損している場合は `0` です。

`check_query_single_value_result = 0` の場合、クエリは以下の列を返します。

* `part_path`: データパーツのパスまたはファイル名を示します。
  * `is_passed`: このパーツのチェックが成功した場合は 1、そうでない場合は 0 を返します。
  * `message`: エラーや成功メッセージなど、チェックに関連する追加メッセージです。

`CHECK TABLE` クエリは、次のテーブルエンジンをサポートします。

* [Log](../../engines/table-engines/log-family/log.md)
* [TinyLog](../../engines/table-engines/log-family/tinylog.md)
* [StripeLog](../../engines/table-engines/log-family/stripelog.md)
* [MergeTree family](../../engines/table-engines/mergetree-family/mergetree.md)

これら以外のテーブルエンジンのテーブルに対して実行した場合は、`NOT_IMPLEMENTED` 例外が発生します。

`*Log` ファミリーのエンジンは、障害発生時の自動データ復旧を提供しません。`CHECK TABLE` クエリを使用して、データ損失をタイムリーに検知してください。

## 例 \{#examples\}

デフォルトでは、`CHECK TABLE` クエリはテーブル全体の総合的なチェック結果を表示します。

```sql
CHECK TABLE test_table;
```

```text
┌─result─┐
│      1 │
└────────┘
```

各データパーツごとのチェックステータスを確認したい場合は、`check_query_single_value_result` 設定を使用できます。

また、テーブルの特定パーティションをチェックするには、`PARTITION` キーワードを使用できます。

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

同様に、`PART` キーワードを使用してテーブル内の特定のデータパーツのみをチェックすることもできます。

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

データパートが存在しない場合、そのクエリはエラーを返します。

```sql
CHECK TABLE t0 PART '201003_111_222_0'
```

```text
DB::Exception: No such data part '201003_111_222_0' to check in table 'default.t0'. (NO_SUCH_DATA_PART)
```

### 「Corrupted（破損）」という結果を受け取った場合 \{#receiving-a-corrupted-result\}

:::warning
免責事項：ここで説明する手順（データディレクトリ内のファイルを手動で操作・削除することを含みます）は、実験環境または開発環境でのみ使用してください。本番サーバーでは絶対に実行しないでください。データ損失やその他の予期しない結果を招くおそれがあります。
:::

既存のチェックサムファイルを削除します:

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

checksums.txt ファイルが存在しない場合は、復元できます。特定のパーティションに対して `CHECK TABLE` コマンドを実行する際に再計算および再書き込みされ、ステータスは引き続き &#39;is&#95;passed = 1&#39; として報告されます。

`CHECK ALL TABLES` クエリを使用すると、既存の `(Replicated)MergeTree` テーブルをすべて一度にチェックできます。

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

テーブルが破損している場合は、破損していないデータを別のテーブルにコピーできます。そのためには、次の手順を実行します。

1.  破損したテーブルと同じ構造を持つ新しいテーブルを作成します。これには、クエリ `CREATE TABLE <new_table_name> AS <damaged_table_name>` を実行します。
2.  次のクエリを単一スレッドで処理するために、`max_threads` の値を1に設定します。これには、クエリ `SET max_threads = 1` を実行します。
3.  クエリ `INSERT INTO <new_table_name> SELECT * FROM <damaged_table_name>` を実行します。このクエリは、破損したテーブルから破損していないデータを別のテーブルにコピーします。破損部分より前のデータのみがコピーされます。
4.  `max_threads` の値をリセットするために、`clickhouse-client` を再起動します。