---
description: '`Merge` エンジン（`MergeTree` とは異なることに注意）はデータを自体では保持しませんが、同時に任意の数の他のテーブルから読み取ることを可能にします。'
sidebar_label: 'Merge'
sidebar_position: 30
slug: /engines/table-engines/special/merge
title: 'Merge テーブルエンジン'
---


# Merge テーブルエンジン

`Merge` エンジン（`MergeTree` とは混同しないでください）はデータを自体では保持しませんが、同時に任意の数の他のテーブルから読み取ることを可能にします。

読み取りは自動的に並列化されます。テーブルへの書き込みはサポートされていません。読み取り時には、実際に読み取られているテーブルのインデックスが存在する場合に使用されます。

## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE ... Engine=Merge(db_name, tables_regexp [, table_to_write])
```

## エンジンパラメータ {#engine-parameters}

### db_name {#db_name}

`db_name` — 可能な値:
    - データベース名,
    - データベース名を返す定数式。例: `currentDatabase()`,
    - `REGEXP(expression)`。ここで `expression` はデータベース名に一致する正規表現です。

### tables_regexp {#tables_regexp}

`tables_regexp` — 指定されたデータベース内のテーブル名に一致する正規表現です。

正規表現 — [re2](https://github.com/google/re2) (PCRE のサブセットをサポート)、大文字と小文字を区別します。
正規表現内で文字をエスケープする方法に関する注意事項は、「match」セクションにあります。

### table_to_write {#table_to_write}

`table_to_write` - `Merge` テーブルへの挿入時に書き込むテーブル名。
可能な値:
    - `'db_name.table_name'` - 特定のデータベース内の特定のテーブルに挿入します。
    - `'table_name'` - `db_name.table_name` テーブルに挿入します。最初のパラメータ `db_name` が正規表現でない場合にのみ許可されます。
    - `auto` - レキシカル順で`tables_regexp` に渡された最後のテーブルに挿入します。最初のパラメータ `db_name` が正規表現でない場合にのみ許可されます。

## 使用法 {#usage}

読み取り用のテーブルを選択する際、`Merge` テーブル自体は選択されません。これはループを回避するためです。
相互にデータを読み取ろうとする2つの `Merge` テーブルを作成することは可能ですが、これは良い考えではありません。

`Merge` エンジンを使用する一般的な方法は、複数の `TinyLog` テーブルを 1 つのテーブルのように扱うことです。

## 例 {#examples}

**例 1**

`ABC_corporate_site` と `ABC_store` という 2 つのデータベースを考えます。`all_visitors` テーブルには、両方のデータベースの `visitors` テーブルの ID が含まれます。

```sql
CREATE TABLE all_visitors (id UInt32) ENGINE=Merge(REGEXP('ABC_*'), 'visitors');
```

**例 2**

古いテーブル `WatchLog_old` があり、データを新しいテーブル `WatchLog_new` に移動せずにパーティショニングを変更することを決定し、両方のテーブルからデータを表示する必要があるとします。

```sql
CREATE TABLE WatchLog_old(date Date, UserId Int64, EventType String, Cnt UInt64)
    ENGINE=MergeTree(date, (UserId, EventType), 8192);
INSERT INTO WatchLog_old VALUES ('2018-01-01', 1, 'hit', 3);

CREATE TABLE WatchLog_new(date Date, UserId Int64, EventType String, Cnt UInt64)
    ENGINE=MergeTree PARTITION BY date ORDER BY (UserId, EventType) SETTINGS index_granularity=8192;
INSERT INTO WatchLog_new VALUES ('2018-01-02', 2, 'hit', 3);

CREATE TABLE WatchLog as WatchLog_old ENGINE=Merge(currentDatabase(), '^WatchLog', 'WatchLog_new');

SELECT * FROM WatchLog;
```

```text
┌───────date─┬─UserId─┬─EventType─┬─Cnt─┐
│ 2018-01-01 │      1 │ hit       │   3 │
└────────────┴────────┴───────────┴─────┘
┌───────date─┬─UserId─┬─EventType─┬─Cnt─┐
│ 2018-01-02 │      2 │ hit       │   3 │
└────────────┴────────┴───────────┴─────┘
```

`WatchLog` テーブルへの挿入は `WatchLog_new` テーブルに行われます
```sql
INSERT INTO WatchLog VALUES ('2018-01-03', 3, 'hit', 3);

SELECT * FROM WatchLog_New;
```

```text
┌───────date─┬─UserId─┬─EventType─┬─Cnt─┐
│ 2018-01-02 │      2 │ hit       │   3 │
└────────────┴────────┴───────────┴─────┘
┌───────date─┬─UserId─┬─EventType─┬─Cnt─┐
│ 2018-01-03 │      3 │ hit       │   3 │
└────────────┴────────┴───────────┴─────┘
```

## 仮想カラム {#virtual-columns}

- `_table` — データを読み込んだ元のテーブル名が含まれます。タイプ: [String](../../../sql-reference/data-types/string.md)。

    `_table` 上で定数条件を設定することができます `WHERE/PREWHERE` 句（例: `WHERE _table='xyz'`）。この場合、`_table` 列が満たされるテーブルのみで読み取り操作が実行されるため、`_table` 列はインデックスとして機能します。

**関連情報**

- [仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [merge](../../../sql-reference/table-functions/merge.md) テーブル関数
