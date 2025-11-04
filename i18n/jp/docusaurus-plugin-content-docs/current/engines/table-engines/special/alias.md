---
'description': 'テーブルのエイリアスを作成する。'
'sidebar_label': 'エイリアス'
'sidebar_position': 120
'slug': '/en/engines/table-engines/special/alias'
'title': 'エイリアステーブルエンジン'
'doc_type': 'reference'
---


# エイリアス テーブル エンジン

エイリアス テーブル エンジンは、別のテーブルへの参照です。

## ClickHouse サーバーでの使用法 {#usage-in-clickhouse-server}

```sql
ENGINE = Alias(database_name.table_name)
-- or
ENGINE = Alias(database_name, table_name)
-- or
ENGINE = Alias(UUID)
```

- `database_name` および `table_name` パラメータは、データベースおよび参照されたテーブルの名前を指定します。
- `UUID` パラメータは、参照されたテーブルの UUID を指定します。

エイリアス テーブルに対するテーブルスキーマの定義は禁止されており、常に参照テーブルと同じでなければなりません。

## 例 {#example}

**1.** `ref_table` テーブルを作成し、`ref_table` のエイリアスとして `alias_table` テーブルを作成します：

```sql
create table ref_table (id UInt32, name String) Engine=MergeTree order by id;
create table alias_table Engine=Alias(default.ref_table);
create table alias_table_with_uuid Engine=Alias('5a39dc94-7b13-432a-b96e-b92cb12957d3');
```

**2.** `ref_table` または `alias_table` にデータを挿入します：

```sql
insert into ref_table values (1, 'one'), (2, 'two'), (3, 'three');
insert into alias_table values (4, 'four');
```

**3.** データをクエリします：

```sql
select * from alias_table order by id;
```

## 実装の詳細 {#details-of-implementation}

`Alias` ストレージに対する操作は、それに関連付けられた参照テーブルに向けられます。
