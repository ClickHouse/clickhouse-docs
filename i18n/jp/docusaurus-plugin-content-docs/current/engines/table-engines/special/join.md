---
description: 'JOIN 操作で使用するためのオプションの準備済みデータ構造。'
sidebar_label: 'Join'
sidebar_position: 70
slug: '/engines/table-engines/special/join'
title: 'Join テーブルエンジン'
---




# ジョインテーブルエンジン

[JOIN](/sql-reference/statements/select/join) 操作に使用するオプションの準備データ構造です。

:::note
これは [JOIN句](/sql-reference/statements/select/join) 自体に関する記事ではありません。
:::

## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
) ENGINE = Join(join_strictness, join_type, k1[, k2, ...])
```

[CREATE TABLE](/sql-reference/statements/create/table) クエリの詳細な説明を参照してください。

## エンジンパラメータ {#engine-parameters}

### join_strictness {#join_strictness}

`join_strictness` – [JOINの厳密さ](/sql-reference/statements/select/join#supported-types-of-join)。

### join_type {#join_type}

`join_type` – [JOINのタイプ](/sql-reference/statements/select/join#supported-types-of-join)。

### キーカラム {#key-columns}

`k1[, k2, ...]` – `USING`句からのキー列で、`JOIN`操作が行われます。

`join_strictness` および `join_type` パラメータは引用符なしで入力してください。たとえば、`Join(ANY, LEFT, col1)` のように。これらは、テーブルが使用される `JOIN` 操作と一致する必要があります。パラメータが一致しない場合、ClickHouseは例外を投げず、正しくないデータを返す可能性があります。

## 特徴と推奨事項 {#specifics-and-recommendations}

### データストレージ {#data-storage}

`Join`テーブルのデータは常にRAMにあります。テーブルに行を挿入すると、ClickHouseはデータブロックをディレクトリにディスク上に書き込み、サーバーが再起動するときにそれらを復元できるようにします。

サーバーが不正に再起動した場合、ディスク上のデータブロックが失われるか、損傷する可能性があります。この場合、損傷したデータのファイルを手動で削除する必要があるかもしれません。

### データの選択と挿入 {#selecting-and-inserting-data}

`INSERT`クエリを使用して、`Join`エンジンテーブルにデータを追加できます。テーブルが `ANY` 厳密さで作成された場合、重複キーのデータは無視されます。`ALL` 厳密さの場合は、すべての行が追加されます。

`Join`エンジンテーブルの主な使用ケースは以下の通りです：

- `JOIN`句の右側にテーブルを配置します。
- [joinGet](/sql-reference/functions/other-functions.md/#joinget) 関数を呼び出して、辞書からデータを抽出するのと同じ方法でテーブルからデータを取得します。

### データの削除 {#deleting-data}

`Join`エンジンテーブルに対する `ALTER DELETE` クエリは、[ミューテーション](/sql-reference/statements/alter/index.md#mutations)として実装されています。`DELETE`ミューテーションは、フィルタリングされたデータを読み取り、メモリとディスクのデータを上書きします。

### 制限事項と設定 {#join-limitations-and-settings}

テーブルを作成する際、次の設定が適用されます：

#### join_use_nulls {#join_use_nulls}

[join_use_nulls](/operations/settings/settings.md/#join_use_nulls)

#### max_rows_in_join {#max_rows_in_join}

[max_rows_in_join](/operations/settings/settings#max_rows_in_join)

#### max_bytes_in_join {#max_bytes_in_join}

[max_bytes_in_join](/operations/settings/settings#max_bytes_in_join)

#### join_overflow_mode {#join_overflow_mode}

[join_overflow_mode](/operations/settings/settings#join_overflow_mode)

#### join_any_take_last_row {#join_any_take_last_row}

[join_any_take_last_row](/operations/settings/settings.md/#join_any_take_last_row)
#### join_use_nulls {#join_use_nulls-1}

#### persistent {#persistent}

Join および [Set](/engines/table-engines/special/set.md) テーブルエンジンの持続性を無効にします。

I/Oのオーバーヘッドを削減します。パフォーマンスを追求し、持続性を要求しないシナリオに適しています。

可能な値：

- 1 — 有効
- 0 — 無効

デフォルト値： `1`

`Join`エンジンテーブルは、`GLOBAL JOIN`操作で使用できません。

`Join`エンジンは、`CREATE TABLE`ステートメントにおいて[join_use_nulls](/operations/settings/settings.md/#join_use_nulls)設定を指定することを許可します。[SELECT](/sql-reference/statements/select/index.md) クエリは同じ `join_use_nulls` 値を持つ必要があります。

## 使用例 {#example}

左側のテーブルを作成：

```sql
CREATE TABLE id_val(`id` UInt32, `val` UInt32) ENGINE = TinyLog;
```

```sql
INSERT INTO id_val VALUES (1,11)(2,12)(3,13);
```

右側の `Join` テーブルを作成：

```sql
CREATE TABLE id_val_join(`id` UInt32, `val` UInt8) ENGINE = Join(ANY, LEFT, id);
```

```sql
INSERT INTO id_val_join VALUES (1,21)(1,22)(3,23);
```

テーブルを結合：

```sql
SELECT * FROM id_val ANY LEFT JOIN id_val_join USING (id);
```

```text
┌─id─┬─val─┬─id_val_join.val─┐
│  1 │  11 │              21 │
│  2 │  12 │               0 │
│  3 │  13 │              23 │
└────┴─────┴─────────────────┘
```

代わりに、結合キーの値を指定して `Join` テーブルからデータを取得できます：

```sql
SELECT joinGet('id_val_join', 'val', toUInt32(1));
```

```text
┌─joinGet('id_val_join', 'val', toUInt32(1))─┐
│                                         21 │
└────────────────────────────────────────────┘
```

`Join` テーブルから行を削除：

```sql
ALTER TABLE id_val_join DELETE WHERE id = 3;
```

```text
┌─id─┬─val─┐
│  1 │  21 │
└────┴─────┘
```
