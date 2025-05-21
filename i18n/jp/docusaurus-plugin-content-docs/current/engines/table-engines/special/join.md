---
description: 'JOIN操作で使用するためのオプションの準備されたデータ構造。'
sidebar_label: 'ジョイン'
sidebar_position: 70
slug: /engines/table-engines/special/join
title: 'ジョインテーブルエンジン'
---


# ジョインテーブルエンジン

[JOIN](/sql-reference/statements/select/join)操作で使用するためのオプションの準備されたデータ構造。

:::note
これは[JOIN句](/sql-reference/statements/select/join)自体に関する記事ではありません。
:::

## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
) ENGINE = Join(join_strictness, join_type, k1[, k2, ...])
```

[CREATE TABLE](/sql-reference/statements/create/table)クエリの詳細な説明を参照してください。

## エンジンパラメータ {#engine-parameters}

### join_strictness {#join_strictness}

`join_strictness` – [JOINの厳密さ](/sql-reference/statements/select/join#supported-types-of-join)。

### join_type {#join_type}

`join_type` – [JOINのタイプ](/sql-reference/statements/select/join#supported-types-of-join)。

### 主キー {#key-columns}

`k1[, k2, ...]` – `USING`句からの主キーで、`JOIN`操作が行われるカラム。

`join_strictness`および`join_type`パラメータは引用符なしで入力します。たとえば、`Join(ANY, LEFT, col1)`のようにします。これらはテーブルが使用される`JOIN`操作と一致する必要があります。パラメータが一致しない場合、ClickHouseは例外をスローせず、不正確なデータを返すことがあります。

## 特性と推奨事項 {#specifics-and-recommendations}

### データストレージ {#data-storage}

`Join`テーブルのデータは常にRAMに格納されます。テーブルに行を挿入する際、ClickHouseはデータブロックをディスク上のディレクトリに書き込むことで、サーバーが再起動したときに復元できるようにします。

サーバーが不正に再起動した場合、ディスク上のデータブロックが失われたり破損したりする可能性があります。この場合、破損したデータのファイルを手動で削除する必要があるかもしれません。

### データの選択と挿入 {#selecting-and-inserting-data}

`INSERT`クエリを使用して`Join`エンジンのテーブルにデータを追加できます。テーブルが`ANY`の厳密さで作成された場合、重複するキーのデータは無視されます。`ALL`の厳密さでは、すべての行が追加されます。

`Join`エンジンテーブルの主な使用ケースは次のとおりです。

- `JOIN`句の右側にテーブルを配置する。
- [joinGet](/sql-reference/functions/other-functions.md/#joinget)関数を呼び出し、辞書と同じ方法でテーブルからデータを抽出できるようにします。

### データの削除 {#deleting-data}

`Join`エンジンテーブルに対する`ALTER DELETE`クエリは[ミューテーション](/sql-reference/statements/alter/index.md#mutations)として実装されています。`DELETE`ミューテーションはフィルタリングされたデータを読み取り、メモリとディスクのデータを上書きします。

### 制限事項と設定 {#join-limitations-and-settings}

テーブルを作成する際、次の設定が適用されます。

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

Joinおよび[Set](/engines/table-engines/special/set.md)テーブルエンジンの永続性を無効にします。

I/Oのオーバーヘッドを削減します。パフォーマンスを追求し、永続性を必要としないシナリオに適しています。

可能な値：

- 1 — 有効。
- 0 — 無効。

デフォルト値: `1`。

`Join`エンジンテーブルは`GLOBAL JOIN`操作に使用できません。

`Join`エンジンは、`CREATE TABLE`文で[join_use_nulls](/operations/settings/settings.md/#join_use_nulls)設定を指定できます。[SELECT](/sql-reference/statements/select/index.md)クエリは同じ`join_use_nulls`値を持つ必要があります。

## 使用例 {#example}

左側のテーブルを作成する：

```sql
CREATE TABLE id_val(`id` UInt32, `val` UInt32) ENGINE = TinyLog;
```

```sql
INSERT INTO id_val VALUES (1,11)(2,12)(3,13);
```

右側の`Join`テーブルを作成する：

```sql
CREATE TABLE id_val_join(`id` UInt32, `val` UInt8) ENGINE = Join(ANY, LEFT, id);
```

```sql
INSERT INTO id_val_join VALUES (1,21)(1,22)(3,23);
```

テーブルを結合する：

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

代替として、ジョインキー値を指定して`Join`テーブルからデータを取得できます：

```sql
SELECT joinGet('id_val_join', 'val', toUInt32(1));
```

```text
┌─joinGet('id_val_join', 'val', toUInt32(1))─┐
│                                         21 │
└────────────────────────────────────────────┘
```

`Join`テーブルから行を削除する：

```sql
ALTER TABLE id_val_join DELETE WHERE id = 3;
```

```text
┌─id─┬─val─┐
│  1 │  21 │
└────┴─────┘
```
