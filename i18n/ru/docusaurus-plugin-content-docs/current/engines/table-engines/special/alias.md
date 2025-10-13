---
'description': 'Создайте псевдоним таблицы.'
'sidebar_label': 'Alias'
'sidebar_position': 120
'slug': '/en/engines/table-engines/special/alias'
'title': 'Alias Table Engine'
'doc_type': 'reference'
---
# Движок таблиц Alias

Движок таблиц Alias является ссылкой на другую таблицу.

## Использование в сервере ClickHouse {#usage-in-clickhouse-server}

```sql
ENGINE = Alias(database_name.table_name)
-- or
ENGINE = Alias(database_name, table_name)
-- or
ENGINE = Alias(UUID)
```

- Параметры `database_name` и `table_name` указывают на базу данных и название ссылаемой таблицы.
- Параметр `UUID` указывает на UUID ссылаемой таблицы.

Определение схемы таблицы запрещено для Alias таблицы, так как она всегда должна соответствовать ссылаемой таблице.

## Пример {#example}

**1.** Создайте таблицу `ref_table` и таблицу `alias_table` как alias для `ref_table`:

```sql
create table ref_table (id UInt32, name String) Engine=MergeTree order by id;
create table alias_table Engine=Alias(default.ref_table);
create table alias_table_with_uuid Engine=Alias('5a39dc94-7b13-432a-b96e-b92cb12957d3');
```

**2.** Вставьте данные в `ref_table` или `alias_table`:

```sql
insert into ref_table values (1, 'one'), (2, 'two'), (3, 'three');
insert into alias_table values (4, 'four');
```

**3.** Запросите данные:

```sql
select * from alias_table order by id;
```

## Особенности реализации {#details-of-implementation}

Операции с хранилищем `Alias` будут направлены на его ссылаемую таблицу.