---
description: '`Merge` エンジン（`MergeTree` と混同しないでください）は自分自身ではデータを保存せず、任意の数の他のテーブルから同時に読み出すことができます。'
sidebar_label: 'Merge'
sidebar_position: 30
slug: /engines/table-engines/special/merge
title: 'Merge テーブルエンジン'
doc_type: 'reference'
---

# Merge テーブルエンジン \{#merge-table-engine\}

`Merge` エンジン（`MergeTree` と混同しないでください）は、自身ではデータを保存せず、任意の数の他のテーブルから同時に読み取ることができます。

読み取りは自動的に並列化されます。テーブルへの書き込みはサポートされていません。読み取り時には、存在する場合は、実際に読み出されるテーブルのインデックスが使用されます。

## テーブルを作成する \{#creating-a-table\}

```sql
CREATE TABLE ... Engine=Merge(db_name, tables_regexp)
```

## エンジンパラメータ \{#engine-parameters\}

### `db_name` \{#db_name\}

`db_name` — 指定可能な値:
    - データベース名
    - データベース名の文字列を返す定数式（例: `currentDatabase()`）
    - `REGEXP(expression)`。ここで `expression` は DB 名にマッチする正規表現。

### `tables_regexp` \{#tables_regexp\}

`tables_regexp` — 指定した DB または複数の DB 内のテーブル名にマッチさせるための正規表現。

正規表現 — [re2](https://github.com/google/re2)（PCRE のサブセットをサポート）、大文字小文字を区別します。
正規表現内での記号のエスケープについては「match」セクションの注意事項を参照してください。

## 使用方法 \{#usage\}

テーブルを読み取り対象として選択する際は、たとえ正規表現にマッチしても `Merge` テーブル自体は選択されません。これはループを避けるためです。
互いのデータを延々と読み合おうとする 2 つの `Merge` テーブルを作成することも技術的には可能ですが、これは望ましくありません。

`Merge` エンジンの典型的な使用方法は、多数の `TinyLog` テーブルを 1 つのテーブルであるかのように扱うことです。

## 例 \{#examples\}

**例 1**

2 つのデータベース `ABC_corporate_site` と `ABC_store` があるとします。`all_visitors` テーブルには、両方のデータベースにある `visitors` テーブルの ID が含まれます。

```sql
CREATE TABLE all_visitors (id UInt32) ENGINE=Merge(REGEXP('ABC_*'), 'visitors');
```

**例 2**

古いテーブル `WatchLog_old` があり、データを新しいテーブル `WatchLog_new` に移行せずにパーティション分割を変更することにしたとします。この場合、両方のテーブルのデータを参照する必要があります。

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

## 仮想カラム \{#virtual-columns\}

- `_table` — データが読み取られたテーブルの名前。型: [String](../../../sql-reference/data-types/string.md)。

    `_table` に対してフィルタを行う場合（例: `WHERE _table='xyz'`）、フィルタ条件を満たすテーブルのみが読み取られます。

- `_database` — データが読み取られたデータベースの名前。型: [String](../../../sql-reference/data-types/string.md)。

**参照**

- [仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [merge](../../../sql-reference/table-functions/merge.md) テーブル関数
