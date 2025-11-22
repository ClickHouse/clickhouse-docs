---
description: '`Merge` エンジン（`MergeTree` と混同しないでください）は自身ではデータを保存せず、任意の数の他のテーブルから同時に読み取ることができます。'
sidebar_label: 'Merge'
sidebar_position: 30
slug: /engines/table-engines/special/merge
title: 'Merge テーブルエンジン'
doc_type: 'reference'
---



# Merge テーブルエンジン

`Merge` エンジン（`MergeTree` と混同しないでください）は自身ではデータを保存せず、任意数の他のテーブルから同時に読み取ることができます。

読み取りは自動的に並列化されます。テーブルへの書き込みはサポートされていません。読み取り時には、存在する場合は実際に読み込まれるテーブルのインデックスが使用されます。



## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE ... Engine=Merge(db_name, tables_regexp)
```


## エンジンパラメータ {#engine-parameters}

### `db_name` {#db_name}

`db_name` — 指定可能な値: - データベース名、- データベース名を含む文字列を返す定数式(例: `currentDatabase()`)、- `REGEXP(expression)`(ここで `expression` はDB名にマッチする正規表現)。

### `tables_regexp` {#tables_regexp}

`tables_regexp` — 指定されたデータベース内のテーブル名にマッチする正規表現。

正規表現 — [re2](https://github.com/google/re2)(PCREのサブセットをサポート)、大文字小文字を区別します。
正規表現内のエスケープ記号については、「match」セクションの注記を参照してください。


## 使用方法 {#usage}

読み取るテーブルを選択する際、`Merge`テーブル自体は正規表現に一致する場合でも選択されません。これはループを回避するためです。
互いのデータを無限に読み取ろうとする2つの`Merge`テーブルを作成することは可能ですが、推奨されません。

`Merge`エンジンの典型的な使用方法は、多数の`TinyLog`テーブルを単一のテーブルとして扱うことです。


## 例 {#examples}

**例 1**

2つのデータベース `ABC_corporate_site` と `ABC_store` があるとします。`all_visitors` テーブルには、両方のデータベースの `visitors` テーブルからのIDが含まれます。

```sql
CREATE TABLE all_visitors (id UInt32) ENGINE=Merge(REGEXP('ABC_*'), 'visitors');
```

**例 2**

古いテーブル `WatchLog_old` があり、データを新しいテーブル `WatchLog_new` に移動せずにパーティショニングを変更することにしたとします。両方のテーブルのデータを参照する必要があります。

```sql
CREATE TABLE WatchLog_old(
    date Date,
    UserId Int64,
    EventType String,
    Cnt UInt64
)
ENGINE=MergeTree
ORDER BY (date, UserId, EventType);

INSERT INTO WatchLog_old VALUES ('2018-01-01', 1, 'hit', 3);

CREATE TABLE WatchLog_new(
    date Date,
    UserId Int64,
    EventType String,
    Cnt UInt64
)
ENGINE=MergeTree
PARTITION BY date
ORDER BY (UserId, EventType)
SETTINGS index_granularity=8192;

INSERT INTO WatchLog_new VALUES ('2018-01-02', 2, 'hit', 3);

CREATE TABLE WatchLog AS WatchLog_old ENGINE=Merge(currentDatabase(), '^WatchLog');

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


## 仮想カラム {#virtual-columns}

- `_table` — データが読み取られたテーブルの名前。型: [String](../../../sql-reference/data-types/string.md)。

  `_table` でフィルタリングする場合（例: `WHERE _table='xyz'`）、フィルタ条件を満たすテーブルのみが読み取られます。

- `_database` — データが読み取られたデータベースの名前。型: [String](../../../sql-reference/data-types/string.md)。

**関連項目**

- [仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [merge](../../../sql-reference/table-functions/merge.md) テーブル関数
