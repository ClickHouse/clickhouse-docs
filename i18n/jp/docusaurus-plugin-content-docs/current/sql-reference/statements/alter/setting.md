---
description: 'テーブル設定の変更に関するドキュメント'
sidebar_label: 'SETTING'
sidebar_position: 38
slug: /sql-reference/statements/alter/setting
title: 'テーブル設定の変更'
doc_type: 'reference'
---

# テーブル設定の操作 {#table-settings-manipulations}

テーブル設定を変更するためのクエリがいくつか用意されています。設定を変更したり、デフォルト値にリセットしたりできます。1 つのクエリで複数の設定を同時に変更できます。
指定した名前の設定が存在しない場合、クエリは例外を送出します。

**構文**

```sql
ALTER TABLE [db].name [ON CLUSTER cluster] MODIFY|RESET SETTING ...
```

:::note\
これらのクエリは [MergeTree](../../../engines/table-engines/mergetree-family/mergetree.md) テーブルにのみ適用できます。
:::

## MODIFY SETTING {#modify-setting}

テーブルの設定を変更します。

**構文**

```sql
MODIFY SETTING 設定名=値 [, ...]
```

**例**

```sql
CREATE TABLE example_table (id UInt32, data String) ENGINE=MergeTree() ORDER BY id;

ALTER TABLE example_table MODIFY SETTING max_part_loading_threads=8, max_parts_in_total=50000;
```

## RESET SETTING {#reset-setting}

テーブル設定をデフォルト値にリセットします。設定がすでにデフォルト状態の場合は、何も行われません。

**構文**

```sql
RESET SETTING setting_name [, ...]
```

**例**

```sql
CREATE TABLE example_table (id UInt32, data String) ENGINE=MergeTree() ORDER BY id
    SETTINGS max_part_loading_threads=8;

ALTER TABLE example_table RESET SETTING max_part_loading_threads;
```

**関連項目**

* [MergeTree の設定](../../../operations/settings/merge-tree-settings.md)
