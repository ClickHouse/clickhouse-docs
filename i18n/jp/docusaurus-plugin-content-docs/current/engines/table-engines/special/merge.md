---
'description': '`Merge` エンジンは (`MergeTree` とは異なり)、データを直接保存することはありませんが、同時に他の任意の数のテーブルから読み取ることを可能にします。'
'sidebar_label': 'Merge'
'sidebar_position': 30
'slug': '/engines/table-engines/special/merge'
'title': 'Merge Table Engine'
'doc_type': 'reference'
---


# Merge テーブルエンジン

`Merge` エンジン（`MergeTree` と混同しないこと）は、データを自体で保存することはなく、任意の数の他のテーブルから同時に読み取ることを可能にします。

読み取りは自動的に並列化されます。テーブルへの書き込みはサポートされていません。読み取りの際には、実際に読み取られるテーブルのインデックスが存在する場合に使用されます。

## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE ... Engine=Merge(db_name, tables_regexp)
```

## エンジンパラメータ {#engine-parameters}

### `db_name` {#db_name}

`db_name` — 可能な値：
    - データベース名、
    - データベース名を返す定数式、例： `currentDatabase()`、
    - `REGEXP(expression)`、ここで `expression` は DB 名に一致する正規表現です。

### `tables_regexp` {#tables_regexp}

`tables_regexp` — 指定された DB または DBs 内のテーブル名に一致する正規表現。

正規表現 — [re2](https://github.com/google/re2)（PCRE のサブセットをサポート）、大文字小文字を区別します。
正規表現内の記号のエスケープに関するメモは「一致」セクションを参照してください。

## 使用法 {#usage}

読み取るテーブルを選択する際、`Merge` テーブル自体は正規表現に一致しても選択されません。これはループを避けるためです。
互いのデータを延々と読み取ろうとする 2 つの `Merge` テーブルを作成することは可能ですが、これは良いアイデアではありません。

`Merge` エンジンの典型的な使用法は、多数の `TinyLog` テーブルを単一のテーブルのように扱うことです。

## 例 {#examples}

**例 1**

2 つのデータベース `ABC_corporate_site` と `ABC_store` を考えてみましょう。`all_visitors` テーブルは、両方のデータベースの `visitors` テーブルからの ID を含みます。

```sql
CREATE TABLE all_visitors (id UInt32) ENGINE=Merge(REGEXP('ABC_*'), 'visitors');
```

**例 2**

古いテーブル `WatchLog_old` があり、データを新しいテーブル `WatchLog_new` に移動せずにパーティショニングを変更することにしたとしましょう。この場合、両方のテーブルからデータを見る必要があります。

```sql
CREATE TABLE WatchLog_old(date Date, UserId Int64, EventType String, Cnt UInt64)
    ENGINE=MergeTree(date, (UserId, EventType), 8192);
INSERT INTO WatchLog_old VALUES ('2018-01-01', 1, 'hit', 3);

CREATE TABLE WatchLog_new(date Date, UserId Int64, EventType String, Cnt UInt64)
    ENGINE=MergeTree PARTITION BY date ORDER BY (UserId, EventType) SETTINGS index_granularity=8192;
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

- `_table` — データが読み取られたテーブルの名前を含みます。型: [String](../../../sql-reference/data-types/string.md)。

    `WHERE/PREWHERE` 句で `_table` に定数条件を設定できます（例: `WHERE _table='xyz'`）。この場合、`_table` に対する条件が満たされるテーブルに対してのみ読み取り操作が行われ、したがって `_table` カラムはインデックスとして機能します。

**関連情報**

- [仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [merge](../../../sql-reference/table-functions/merge.md) テーブル関数
