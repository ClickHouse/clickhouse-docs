---
description: 'JOIN 操作で使用するためのオプションの事前構築されたデータ構造。'
sidebar_label: 'Join'
sidebar_position: 70
slug: /engines/table-engines/special/join
title: 'Join テーブルエンジン'
doc_type: 'reference'
---

# Join テーブルエンジン \{#join-table-engine\}

[JOIN](/sql-reference/statements/select/join) 演算で使用するための、オプションの事前構築済みデータ構造です。

:::note
ClickHouse Cloud で、サービスがバージョン 25.4 より前に作成されている場合は、`SET compatibility=25.4` を実行して、compatibility を少なくとも 25.4 に設定する必要があります。
:::

## テーブルの作成 \{#creating-a-table\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1] [TTL expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2] [TTL expr2],
) ENGINE = Join(join_strictness, join_type, k1[, k2, ...])
```

[CREATE TABLE](/sql-reference/statements/create/table) クエリの詳細については、説明を参照してください。

## エンジンパラメータ \{#engine-parameters\}

### `join_strictness` \{#join_strictness\}

`join_strictness` – [JOIN の厳密度](/sql-reference/statements/select/join#supported-types-of-join)。

### `join_type` \{#join_type\}

`join_type` – [JOIN の種類](/sql-reference/statements/select/join#supported-types-of-join)。

### キー列 \{#key-columns\}

`k1[, k2, ...]` – `JOIN` 演算が実行される際の、`USING` 句内のキー列。

`join_strictness` および `join_type` パラメータは、`Join(ANY, LEFT, col1)` のように引用符なしで指定します。これらは、そのテーブルが使用される `JOIN` 演算と一致していなければなりません。パラメータが一致しない場合でも、ClickHouse は例外をスローせず、誤ったデータを返す可能性があります。

## 詳細と推奨事項 \{#specifics-and-recommendations\}

### データストレージ \{#data-storage\}

`Join` テーブルのデータは常に RAM 上にあります。テーブルに行を挿入するとき、ClickHouse はデータブロックをディスク上のディレクトリに書き込み、サーバーの再起動時にそれらを復元できるようにします。

サーバーが異常終了したり正しくない手順で再起動された場合、ディスク上のデータブロックが失われたり破損したりすることがあります。この場合、破損したデータを含むファイルを手動で削除する必要が生じることがあります。

### データの選択と挿入 \{#selecting-and-inserting-data\}

`INSERT` クエリを使用して、`Join` エンジンのテーブルにデータを追加できます。テーブルが `ANY` 厳密度で作成されている場合、重複キーのデータは無視されます。`ALL` 厳密度では、すべての行が追加されます。

`Join` エンジンテーブルの主なユースケースは次のとおりです。

- `JOIN` 句の右側にテーブルを配置する。
- [joinGet](/sql-reference/functions/other-functions.md/#joinGet) 関数を呼び出し、辞書と同じ方法でテーブルからデータを抽出する。

### データの削除 \{#deleting-data\}

`Join` エンジンテーブルに対する `ALTER DELETE` クエリは、[mutation](/sql-reference/statements/alter/index.md#mutations) として実装されています。`DELETE` mutation はフィルタ済みのデータを読み取り、メモリおよびディスク上のデータを上書きします。

### 制限事項と設定 \{#join-limitations-and-settings\}

テーブル作成時には、次の設定が適用されます。

#### `join_use_nulls` \{#join_use_nulls\}

[join_use_nulls](/operations/settings/settings.md/#join_use_nulls)

#### `max_rows_in_join` \{#max_rows_in_join\}

[max_rows_in_join](/operations/settings/settings#max_rows_in_join)

#### `max_bytes_in_join` \{#max_bytes_in_join\}

[max_bytes_in_join](/operations/settings/settings#max_bytes_in_join)

#### `join_overflow_mode` \{#join_overflow_mode\}

[join_overflow_mode](/operations/settings/settings#join_overflow_mode)

#### `join_any_take_last_row` \{#join_any_take_last_row\}

[join_any_take_last_row](/operations/settings/settings.md/#join_any_take_last_row)
#### `join_use_nulls` \{#join_use_nulls-1\}

#### Persistent \{#persistent\}

Join および [Set](/engines/table-engines/special/set.md) テーブルエンジンの永続化を無効にします。

I/O オーバーヘッドを削減します。性能を重視し、永続化を必要としないシナリオに適しています。

設定可能な値:

- 1 — 有効。
- 0 — 無効。

デフォルト値: `1`。

`Join` エンジンテーブルは `GLOBAL JOIN` 操作では使用できません。

`Join` エンジンでは、`CREATE TABLE` 文内で [join_use_nulls](/operations/settings/settings.md/#join_use_nulls) 設定を指定できます。[SELECT](/sql-reference/statements/select/index.md) クエリでも同じ `join_use_nulls` の値を使用する必要があります。

## 使用例 \{#example\}

左側テーブルの作成：

```sql
CREATE TABLE id_val(`id` UInt32, `val` UInt32) ENGINE = TinyLog;
```

```sql
INSERT INTO id_val VALUES (1,11)(2,12)(3,13);
```

右側の `Join` テーブルを作成する：

```sql
CREATE TABLE id_val_join(`id` UInt32, `val` UInt8) ENGINE = Join(ANY, LEFT, id);
```

```sql
INSERT INTO id_val_join VALUES (1,21)(1,22)(3,23);
```

テーブル結合：

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

代わりに、結合キーの値を指定して `Join` テーブルからデータを取得することもできます。

```sql
SELECT joinGet('id_val_join', 'val', toUInt32(1));
```

```text
┌─joinGet('id_val_join', 'val', toUInt32(1))─┐
│                                         21 │
└────────────────────────────────────────────┘
```

`Join` テーブルから行を削除する：

```sql
ALTER TABLE id_val_join DELETE WHERE id = 3;
```

```text
┌─id─┬─val─┐
│  1 │  21 │
└────┴─────┘
```
