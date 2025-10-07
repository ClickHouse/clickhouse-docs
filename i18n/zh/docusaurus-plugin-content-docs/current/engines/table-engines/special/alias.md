---
'description': '创建一个表的别名。'
'sidebar_label': 'Alias'
'sidebar_position': 120
'slug': '/en/engines/table-engines/special/alias'
'title': '别名表引擎'
'doc_type': 'reference'
---


# Alias 表引擎

Alias 表引擎是指向另一个表的引用。

## 在 ClickHouse 服务器中的用法 {#usage-in-clickhouse-server}

```sql
ENGINE = Alias(database_name.table_name)
-- or
ENGINE = Alias(database_name, table_name)
-- or
ENGINE = Alias(UUID)
```

- `database_name` 和 `table_name` 参数指定了数据库和被引用表的名称。
- `UUID` 参数指定了被引用表的 UUID。

Alias 表禁止定义表模式，因为它应该始终与引用表相同。

## 示例 {#example}

**1.** 创建 `ref_table` 表以及作为 `ref_table` 别名的 `alias_table` 表：

```sql
create table ref_table (id UInt32, name String) Engine=MergeTree order by id;
create table alias_table Engine=Alias(default.ref_table);
create table alias_table_with_uuid Engine=Alias('5a39dc94-7b13-432a-b96e-b92cb12957d3');
```

**2.** 向 `ref_table` 或 `alias_table` 插入数据：

```sql
insert into ref_table values (1, 'one'), (2, 'two'), (3, 'three');
insert into alias_table values (4, 'four');
```

**3.** 查询数据：

```sql
select * from alias_table order by id;
```

## 实现细节 {#details-of-implementation}

对 `Alias` 存储的操作将被导向其引用表。
