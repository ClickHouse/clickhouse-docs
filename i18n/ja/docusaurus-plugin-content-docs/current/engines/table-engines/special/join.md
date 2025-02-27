---
slug: /engines/table-engines/special/join
sidebar_position: 70
sidebar_label: ジョイン
title: "Join テーブルエンジン"
description: "JOIN操作で使用するためのオプションの準備されたデータ構造。"
---

# Join テーブルエンジン

[JOIN](/sql-reference/statements/select/join.md/#select-join)操作で使用するためのオプションの準備されたデータ構造です。

:::note
これは[JOIN句](/sql-reference/statements/select/join.md/#select-join)自体に関する記事ではありません。
:::

## テーブルの作成 {#creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
) ENGINE = Join(join_strictness, join_type, k1[, k2, ...])
```

[CREATE TABLE](/sql-reference/statements/create/table.md/#create-table-query)クエリの詳細な説明を参照してください。

## エンジンパラメータ {#engine-parameters}

### join_strictness {#join_strictness}

`join_strictness` – [JOINの厳密性](/sql-reference/statements/select/join.md/#select-join-types)。

### join_type {#join_type}

`join_type` – [JOINタイプ](/sql-reference/statements/select/join.md/#select-join-types)。

### キーカラム {#key-columns}

`k1[, k2, ...]` – `USING`句からのキーカラムで、`JOIN`操作が行われるものです。

`join_strictness`および`join_type`パラメータはクォートなしで入力してください。例えば、`Join(ANY, LEFT, col1)`のように入力します。これらは、テーブルが使用される`JOIN`操作と一致する必要があります。パラメータが一致しない場合、ClickHouseは例外をスローせず、誤ったデータを返す可能性があります。

## 特記事項と推奨事項 {#specifics-and-recommendations}

### データの保存 {#data-storage}

`Join`テーブルのデータは常にRAMにあります。テーブルに行を挿入する際、ClickHouseはデータブロックをディレクトリにディスクに書き込むため、サーバーの再起動時に復元できるようにします。

サーバーが不正に再起動した場合、ディスク上のデータブロックが失われるか、破損する可能性があります。この場合、破損したデータが含まれるファイルを手動で削除する必要があることがあります。

### データの選択と挿入 {#selecting-and-inserting-data}

`INSERT`クエリを使用して`Join`エンジンテーブルにデータを追加できます。テーブルが`ANY`の厳密性で作成された場合、重複キーのデータは無視されます。`ALL`の厳密性の場合、すべての行が追加されます。

`Join`エンジンテーブルの主な使用ケースは以下の通りです：

- `JOIN`句の右側にテーブルを配置する。
- [joinGet](/sql-reference/functions/other-functions.md/#joinget)関数を呼び出し、辞書と同様の方法でテーブルからデータを抽出する。

### データの削除 {#deleting-data}

`Join`エンジンテーブルに対する`ALTER DELETE`クエリは、[変更](/sql-reference/statements/alter/index.md#mutations)として実装されます。`DELETE`操作はフィルタリングされたデータを読み込み、メモリとディスクのデータを上書きします。

### 制限事項と設定 {#join-limitations-and-settings}

テーブルを作成する際、以下の設定が適用されます：

#### join_use_nulls {#join_use_nulls}

[join_use_nulls](/operations/settings/settings.md/#join_use_nulls)

#### max_rows_in_join {#max_rows_in_join}

[max_rows_in_join](/operations/settings/query-complexity.md/#settings-max_rows_in_join)

#### max_bytes_in_join {#max_bytes_in_join}

[max_bytes_in_join](/operations/settings/query-complexity.md/#settings-max_bytes_in_join)

#### join_overflow_mode {#join_overflow_mode}

[join_overflow_mode](/operations/settings/query-complexity.md/#settings-join_overflow_mode)

#### join_any_take_last_row {#join_any_take_last_row}

[join_any_take_last_row](/operations/settings/settings.md/#join_any_take_last_row)

#### persistent {#persistent}

Joinおよび[Set](/engines/table-engines/special/set.md)テーブルエンジンの永続性を無効にします。

I/Oオーバーヘッドを削減します。パフォーマンスを追求し、永続性を必要としないシナリオに適しています。

可能な値：

- 1 — 有効。
- 0 — 無効。

デフォルト値：`1`。

`Join`エンジンテーブルは`GLOBAL JOIN`操作で使用できません。

`Join`エンジンは、`CREATE TABLE`ステートメント内で[join_use_nulls](/operations/settings/settings.md/#join_use_nulls)設定を指定することを許可します。[SELECT](/sql-reference/statements/select/index.md)クエリは同じ`join_use_nulls`値を持っている必要があります。

## 使用例 {#example}

左側のテーブルを作成：

``` sql
CREATE TABLE id_val(`id` UInt32, `val` UInt32) ENGINE = TinyLog;
```

``` sql
INSERT INTO id_val VALUES (1,11)(2,12)(3,13);
```

右側の`Join`テーブルを作成：

``` sql
CREATE TABLE id_val_join(`id` UInt32, `val` UInt8) ENGINE = Join(ANY, LEFT, id);
```

``` sql
INSERT INTO id_val_join VALUES (1,21)(1,22)(3,23);
```

テーブルを結合：

``` sql
SELECT * FROM id_val ANY LEFT JOIN id_val_join USING (id);
```

``` text
┌─id─┬─val─┬─id_val_join.val─┐
│  1 │  11 │              21 │
│  2 │  12 │               0 │
│  3 │  13 │              23 │
└────┴─────┴─────────────────┘
```

代わりに、結合キー値を指定して`Join`テーブルからデータを取得することもできます：

``` sql
SELECT joinGet('id_val_join', 'val', toUInt32(1));
```

``` text
┌─joinGet('id_val_join', 'val', toUInt32(1))─┐
│                                         21 │
└────────────────────────────────────────────┘
```

`Join`テーブルから行を削除：

```sql
ALTER TABLE id_val_join DELETE WHERE id = 3;
```

```text
┌─id─┬─val─┐
│  1 │  21 │
└────┴─────┘
```
