---
slug: /engines/table-engines/special/merge
sidebar_position: 30
sidebar_label: Merge
title: "Merge テーブルエンジン"
description: "`Merge` エンジン ( `MergeTree` と混同しないでください ) は、データを自体に保存することはありませんが、他の任意の数のテーブルから同時に読み取ることを可能にします。"
---


# Merge テーブルエンジン

`Merge` エンジン ( `MergeTree` と混同しないでください ) は、データを自体に保存することはありませんが、他の任意の数のテーブルから同時に読み取ることを可能にします。

読み取りは自動的に並列化されます。テーブルへの書き込みはサポートされていません。読み取り時には、実際に読み取られているテーブルのインデックスが使用されます（存在する場合）。

## テーブルの作成 {#creating-a-table}

``` sql
CREATE TABLE ... Engine=Merge(db_name, tables_regexp)
```

## エンジンパラメータ {#engine-parameters}

### db_name {#db_name}

`db_name` — 考えられる値：
    - データベース名、
    - データベース名を返す定数式（例： `currentDatabase()` ）、
    - `REGEXP(expression)`、ここで `expression` は DB 名に一致する正規表現です。

### tables_regexp {#tables_regexp}

`tables_regexp` — 指定された DB または DBs 内のテーブル名に一致する正規表現。

正規表現 — [re2](https://github.com/google/re2) （PCREのサブセットをサポート）、大文字と小文字を区別します。
正規表現内の記号のエスケープについての注意については、「一致」セクションを参照してください。

## 使用法 {#usage}

読み取るテーブルを選択する際に、正規表現に一致しても `Merge` テーブル自体は選択されません。これはループを回避するためです。
2つの `Merge` テーブルを作成し、それぞれが互いのデータを読み取ろうとし続けることができますが、これは良いアイデアではありません。

`Merge` エンジンの典型的な使用法は、単一のテーブルとして大規模な `TinyLog` テーブル群を扱うことです。

## 例 {#examples}

**例 1**

データベース `ABC_corporate_site` と `ABC_store` の2つを考えます。 `all_visitors` テーブルには、両方のデータベースの `visitors` テーブルからのIDが含まれます。

``` sql
CREATE TABLE all_visitors (id UInt32) ENGINE=Merge(REGEXP('ABC_*'), 'visitors');
```

**例 2**

古いテーブル `WatchLog_old` があり、データを新しいテーブル `WatchLog_new` に移動せずにパーティショニングを変更することに決め、両方のテーブルからデータを見たい場合を考えます。

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

- `_table` — データが読み取られたテーブルの名前が含まれています。タイプ: [String](../../../sql-reference/data-types/string.md)。

    `WHERE/PREWHERE` 句で `_table` に対する定数条件を設定できます (例えば、 `WHERE _table='xyz'` )。この場合、条件が `_table` に満たされているテーブルのみで読み取り操作が実行されるため、`_table` カラムはインデックスとして機能します。

**関連項目**

- [仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [merge](../../../sql-reference/table-functions/merge.md) テーブル関数
