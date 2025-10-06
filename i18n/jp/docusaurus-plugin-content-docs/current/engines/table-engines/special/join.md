---
'description': 'JOIN 操作で使用するためのオプションの準備済みデータ構造。'
'sidebar_label': 'Join'
'sidebar_position': 70
'slug': '/engines/table-engines/special/join'
'title': 'Join テーブルエンジン'
'doc_type': 'reference'
---


# `Join` テーブルエンジン

[JOIN](/sql-reference/statements/select/join) 操作で使用するためのオプションの準備されたデータ構造です。

:::note
これは [JOIN 句](/sql-reference/statements/select/join) 自体に関する記事ではありません。
:::

:::note
ClickHouse Cloud では、サービスが 25.4 より前のバージョンで作成された場合、`SET compatibility=25.4` を使用して互換性を少なくとも 25.4 に設定する必要があります。
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

## エンジンパラメーター {#engine-parameters}

### `join_strictness` {#join_strictness}

`join_strictness` – [JOIN の厳密性](/sql-reference/statements/select/join#supported-types-of-join)。

### `join_type` {#join_type}

`join_type` – [JOIN の種類](/sql-reference/statements/select/join#supported-types-of-join)。

### キーカラム {#key-columns}

`k1[, k2, ...]` – `JOIN` 操作が行われる `USING` 句からのキーカラム。

`join_strictness` と `join_type` パラメーターは引用符なしで入力します。例えば `Join(ANY, LEFT, col1)` のように。これらはテーブルが使用される `JOIN` 操作と一致する必要があります。パラメータが一致しない場合、ClickHouse は例外をスローせず、正しくないデータを返す可能性があります。

## 特殊事項と推奨事項 {#specifics-and-recommendations}

### データストレージ {#data-storage}

`Join` テーブルのデータは常に RAM に存在します。テーブルに行を挿入する際、ClickHouse はデータブロックをディレクトリにディスク上に書き込み、サーバーが再起動したときに復元できるようにします。

サーバーが不正に再起動した場合、ディスク上のデータブロックが失われるか、破損する可能性があります。この場合、破損したデータを含むファイルを手動で削除する必要があります。

### データの選択と挿入 {#selecting-and-inserting-data}

`Insert` クエリを使用して `Join` エンジンテーブルにデータを追加できます。テーブルが `ANY` 厳密性で作成された場合、重複するキーのデータは無視されます。`ALL` 厳密性の場合、すべての行が追加されます。

`Join` エンジンテーブルの主な使用ケースは次のとおりです：

- `JOIN` 句の右側にテーブルを配置する。
- [joinGet](/sql-reference/functions/other-functions.md/#joinget) 関数を呼び出し、辞書と同じ方法でテーブルからデータを抽出する。

### データの削除 {#deleting-data}

`Join` エンジンテーブルに対する `ALTER DELETE` クエリは [マテレーション](/sql-reference/statements/alter/index.md#mutations) として実装されています。`DELETE` マテレーションはフィルターされたデータを読み込み、メモリとディスクのデータを上書きします。

### 制限事項と設定 {#join-limitations-and-settings}

テーブルを作成する際に、次の設定が適用されます：

#### `join_use_nulls` {#join_use_nulls}

[join_use_nulls](/operations/settings/settings.md/#join_use_nulls)

#### `max_rows_in_join` {#max_rows_in_join}

[max_rows_in_join](/operations/settings/settings#max_rows_in_join)

#### `max_bytes_in_join` {#max_bytes_in_join}

[max_bytes_in_join](/operations/settings/settings#max_bytes_in_join)

#### `join_overflow_mode` {#join_overflow_mode}

[join_overflow_mode](/operations/settings/settings#join_overflow_mode)

#### `join_any_take_last_row` {#join_any_take_last_row}

[join_any_take_last_row](/operations/settings/settings.md/#join_any_take_last_row)
#### `join_use_nulls` {#join_use_nulls-1}

#### Persistent {#persistent}

Join と [Set](/engines/table-engines/special/set.md) テーブルエンジンに対する持続性を無効にします。

I/O オーバーヘッドを削減します。パフォーマンスを追求し、持続性を必要としないシナリオに適しています。

可能な値：

- 1 — 有効
- 0 — 無効

デフォルト値：`1`。

`Join` エンジンテーブルは `GLOBAL JOIN` 操作に使用できません。

`Join` エンジンは `CREATE TABLE` ステートメントで [join_use_nulls](/operations/settings/settings.md/#join_use_nulls) 設定を指定することができます。 [SELECT](/sql-reference/statements/select/index.md) クエリは同じ `join_use_nulls` 値を持つ必要があります。

## 使用例 {#example}

左側のテーブルの作成：

```sql
CREATE TABLE id_val(`id` UInt32, `val` UInt32) ENGINE = TinyLog;
```

```sql
INSERT INTO id_val VALUES (1,11)(2,12)(3,13);
```

右側の `Join` テーブルの作成：

```sql
CREATE TABLE id_val_join(`id` UInt32, `val` UInt8) ENGINE = Join(ANY, LEFT, id);
```

```sql
INSERT INTO id_val_join VALUES (1,21)(1,22)(3,23);
```

テーブルの結合：

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

代わりに、結合キー値を指定して `Join` テーブルからデータを取得できます：

```sql
SELECT joinGet('id_val_join', 'val', toUInt32(1));
```

```text
┌─joinGet('id_val_join', 'val', toUInt32(1))─┐
│                                         21 │
└────────────────────────────────────────────┘
```

`Join` テーブルからの行の削除：

```sql
ALTER TABLE id_val_join DELETE WHERE id = 3;
```

```text
┌─id─┬─val─┐
│  1 │  21 │
└────┴─────┘
```
