---
slug: /engines/table-engines/special/merge
sidebar_position: 30
sidebar_label: マージ
title: "マージテーブルエンジン"
description: "`Merge` エンジン（`MergeTree` とは異なる）は、データを自身で保存するのではなく、任意の数の他のテーブルから同時に読み取ることを可能にします。"
---

# マージテーブルエンジン

`Merge` エンジン（`MergeTree` とは異なる）は、データを自身で保存するのではなく、任意の数の他のテーブルから同時に読み取ることを可能にします。

読み取りは自動的に並列化されます。テーブルへの書き込みはサポートされていません。読み取りの際、実際に読み取られるテーブルのインデックスが存在する場合、それが使用されます。

## テーブルの作成 {#creating-a-table}

``` sql
CREATE TABLE ... Engine=Merge(db_name, tables_regexp)
```

## エンジンパラメータ {#engine-parameters}

### db_name {#db_name}

`db_name` — 可能な値:
    - データベース名、
    - データベース名の文字列を返す定数式、例えば、`currentDatabase()`、
    - `REGEXP(expression)`、ここで `expression` はDB名に一致させる正規表現です。

### tables_regexp {#tables_regexp}

`tables_regexp` — 指定されたDBまたはDBs内のテーブル名に一致する正規表現です。

正規表現 — [re2](https://github.com/google/re2)（PCREのサブセットをサポート）、大文字と小文字を区別します。
正規表現での記号のエスケープに関する注意は「マッチ」セクションを参照してください。

## 使用法 {#usage}

読み取るテーブルを選択する際、`Merge` テーブル自体は正規表現に一致しても選択されません。これはループを避けるためです。
互いのデータを無限に読み取ろうとする2つの `Merge` テーブルを作成することは可能ですが、これは良いアイデアではありません。

`Merge` エンジンを使用する典型的な方法は、大量の `TinyLog` テーブルを単一のテーブルのように扱うことです。

## 例 {#examples}

**例1**

データベース `ABC_corporate_site` と `ABC_store` の2つを考えます。`all_visitors` テーブルには、両方のデータベースにある `visitors` テーブルのIDが含まれます。

``` sql
CREATE TABLE all_visitors (id UInt32) ENGINE=Merge(REGEXP('ABC_*'), 'visitors');
```

**例2**

古いテーブル `WatchLog_old` があり、データを新しいテーブル `WatchLog_new` に移動せずにパーティションを変更することに決め、両方のテーブルのデータを見たいとします。

``` sql
CREATE TABLE WatchLog_old(date Date, UserId Int64, EventType String, Cnt UInt64)
    ENGINE=MergeTree(date, (UserId, EventType), 8192);
INSERT INTO WatchLog_old VALUES ('2018-01-01', 1, 'hit', 3);

CREATE TABLE WatchLog_new(date Date, UserId Int64, EventType String, Cnt UInt64)
    ENGINE=MergeTree PARTITION BY date ORDER BY (UserId, EventType) SETTINGS index_granularity=8192;
INSERT INTO WatchLog_new VALUES ('2018-01-02', 2, 'hit', 3);

CREATE TABLE WatchLog as WatchLog_old ENGINE=Merge(currentDatabase(), '^WatchLog');

SELECT * FROM WatchLog;
```

``` text
┌───────date─┬─UserId─┬─EventType─┬─Cnt─┐
│ 2018-01-01 │      1 │ hit       │   3 │
└────────────┴────────┴───────────┴─────┘
┌───────date─┬─UserId─┬─EventType─┬─Cnt─┐
│ 2018-01-02 │      2 │ hit       │   3 │
└────────────┴────────┴───────────┴─────┘
```

## 仮想カラム {#virtual-columns}

- `_table` — データが読み取られたテーブルの名前を含みます。タイプ: [String](../../../sql-reference/data-types/string.md)。

    `_table` に対して `WHERE/PREWHERE` 句で定数条件を設定できます（例えば、`WHERE _table='xyz'`）。この場合、条件が `_table` に満たされるテーブルのみに対して読み取り操作が行われるため、`_table` カラムはインデックスの役割を果たします。

**参考**

- [仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [merge](../../../sql-reference/table-functions/merge.md) テーブル関数
