---
'description': 'The `Merge` engine (not to be confused with `MergeTree`) does not
  store data itself, but allows reading from any number of other tables simultaneously.'
'sidebar_label': 'Merge'
'sidebar_position': 30
'slug': '/engines/table-engines/special/merge'
'title': 'Merge Table Engine'
---




# Merge Table Engine

`Merge`エンジン（`MergeTree`と混同しないでください）は、データを自身で保存することはありませんが、他の任意の数のテーブルから同時に読み取ることを可能にします。

読み取りは自動的に並列化されます。テーブルへの書き込みはサポートされていません。読み取る際には、実際に読み取られているテーブルのインデックスが使用されます（存在する場合）。

## テーブルの作成 {#creating-a-table}

```sql
CREATE TABLE ... Engine=Merge(db_name, tables_regexp [, table_to_write])
```

## エンジンパラメータ {#engine-parameters}

### db_name {#db_name}

`db_name` — 可能な値:
  - データベース名、
  - データベース名を返す定数式、例えば、`currentDatabase()`、
  - `REGEXP(expression)`、ここで `expression` はDB名に一致する正規表現です。

### tables_regexp {#tables_regexp}

`tables_regexp` — 指定されたDBまたはDBs内のテーブル名に一致する正規表現。

正規表現 — [re2](https://github.com/google/re2)（PCREのサブセットをサポート）、大文字と小文字を区別します。
正規表現のシンボルのエスケープに関する注意点は、「一致」セクションを参照してください。

### table_to_write {#table_to_write}

`table_to_write` - `Merge`テーブルへの挿入時に書き込むテーブル名。
可能な値:
  - `'db_name.table_name'` - 特定のデータベースの特定のテーブルに挿入します。
  - `'table_name'` - テーブル `db_name.table_name` に挿入します。最初のパラメータ `db_name` が正規表現でない場合のみ許可されます。
  - `auto` - 辞書順で`tables_regexp`に渡された最後のテーブルに挿入します。最初のパラメータ `db_name` が正規表現でない場合のみ許可されます。

## 使用法 {#usage}

読み取るテーブルを選択する際に、`Merge`テーブル自体は選択されません。これはループを避けるためです。
互いのデータを無限に読み取ろうとする2つの`Merge`テーブルを作成することは可能ですが、良いアイデアではありません。

`Merge`エンジンの典型的な使用方法は、多数の`TinyLog`テーブルを単一のテーブルとして操作することです。

## 例 {#examples}

**例 1**

2つのデータベース `ABC_corporate_site` と `ABC_store`を考えます。`all_visitors`テーブルは、両方のデータベースの`visitors`テーブルからIDを含みます。

```sql
CREATE TABLE all_visitors (id UInt32) ENGINE=Merge(REGEXP('ABC_*'), 'visitors');
```

**例 2**

古いテーブル`WatchLog_old`があり、データを新しいテーブル`WatchLog_new`に移動することなくパーティショニングを変更することにしたとしましょう。そして、両方のテーブルのデータを確認する必要があります。

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

テーブル`WatchLog`への挿入はテーブル`WatchLog_new`に行われます。
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

- `_table` — データが読み取られたテーブルの名前を含みます。型: [String](../../../sql-reference/data-types/string.md)。

    `WHERE/PREWHERE`節で`_table`に定数条件を設定できます（例えば、`WHERE _table='xyz'`）。この場合、読み取り操作は条件を満たすテーブルに対してのみ行われるため、`_table`カラムはインデックスとして機能します。

**参照先**

- [仮想カラム](../../../engines/table-engines/index.md#table_engines-virtual_columns)
- [merge](../../../sql-reference/table-functions/merge.md) テーブル関数
