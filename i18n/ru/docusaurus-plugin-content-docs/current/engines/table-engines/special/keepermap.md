---
description: 'Этот движок позволяет использовать кластер Keeper/ZooKeeper как согласованное
  хранилище пар ключ–значение с линеаризуемыми записями и последовательной согласованностью при чтении.'
sidebar_label: 'KeeperMap'
sidebar_position: 150
slug: /engines/table-engines/special/keeper-map
title: 'Табличный движок KeeperMap'
doc_type: 'reference'
---

# Табличный движок KeeperMap \\{#keepermap-table-engine\\}

Этот движок позволяет использовать кластер Keeper/ZooKeeper как согласованное хранилище ключ–значение с линеаризуемыми записями и последовательно согласованными чтениями.

Чтобы включить табличный движок KeeperMap, необходимо задать в конфигурации параметр `<keeper_map_path_prefix>`, определяющий путь в ZooKeeper, по которому будут храниться таблицы.

Например:

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```

где path может быть любым другим допустимым путем в ZooKeeper.

## Создание таблицы \\{#creating-a-table\\}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = KeeperMap(root_path, [keys_limit]) PRIMARY KEY(primary_key_name)
```

Параметры движка:

* `root_path` — путь в ZooKeeper, по которому будет храниться `table_name`.\
  Этот путь не должен содержать префикс, определённый в конфигурации `<keeper_map_path_prefix>`, поскольку префикс будет автоматически добавлен к `root_path`.\
  Также поддерживается формат `auxiliary_zookeeper_cluster_name:/some/path`, где `auxiliary_zookeeper_cluster` — это кластер ZooKeeper, определённый в конфигурации `<auxiliary_zookeepers>`.\
  По умолчанию используется кластер ZooKeeper, определённый в конфигурации `<zookeeper>`.
* `keys_limit` — максимальное количество ключей, разрешённых в таблице.\
  Это мягкое ограничение, и в некоторых крайних случаях в таблице может оказаться большее количество ключей.
* `primary_key_name` — любое имя столбца из списка столбцов.
* `primary key` должен быть указан; он может содержать только один столбец. Первичный ключ будет сериализован в бинарном виде как `node name` в ZooKeeper.
* столбцы, отличные от первичного ключа, будут сериализованы в бинарном виде в соответствующем порядке и сохранены как значение результирующего узла, определяемого сериализованным ключом.
* запросы с фильтрацией по ключу с операторами `equals` или `in` будут оптимизированы до поиска по нескольким ключам в `Keeper`, в противном случае будут извлечены все значения.

Пример:

```sql
CREATE TABLE keeper_map_table
(
    `key` String,
    `v1` UInt32,
    `v2` String,
    `v3` Float32
)
ENGINE = KeeperMap('/keeper_map_table', 4)
PRIMARY KEY key
```

с

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```

Каждое значение — бинарная сериализация `(v1, v2, v3)` — будет храниться в `/keeper_map_tables/keeper_map_table/data/serialized_key` в `Keeper`.
Кроме того, на количество ключей будет действовать мягкий лимит в 4 ключа.

Если несколько таблиц создаются на одном и том же пути в ZooKeeper, значения сохраняются до тех пор, пока существует как минимум одна таблица, использующая их.\
В результате можно использовать предложение `ON CLUSTER` при создании таблицы и разделять данные между несколькими экземплярами ClickHouse.\
Разумеется, можно вручную выполнить `CREATE TABLE` с тем же путём на несвязанных экземплярах ClickHouse, чтобы получить тот же эффект совместного использования данных.

## Поддерживаемые операции \\{#supported-operations\\}

### Вставки \\{#inserts\\}

Когда в `KeeperMap` вставляются новые строки, если ключ не существует, создаётся новая запись с этим ключом.
Если ключ существует и настройка `keeper_map_strict_mode` имеет значение `true`, выбрасывается исключение, в противном случае значение для ключа перезаписывается.

Пример:

```sql
INSERT INTO keeper_map_table VALUES ('some key', 1, 'value', 3.2);
```

### Удаления \\{#deletes\\}

Строки можно удалять с помощью запроса `DELETE` или команды `TRUNCATE`.
Если ключ существует и параметр `keeper_map_strict_mode` установлен в значение `true`, операции выборки и удаления данных завершатся успешно только в том случае, если их можно выполнить атомарно.

```sql
DELETE FROM keeper_map_table WHERE key LIKE 'some%' AND v1 > 1;
```

```sql
ALTER TABLE keeper_map_table DELETE WHERE key LIKE 'some%' AND v1 > 1;
```

```sql
TRUNCATE TABLE keeper_map_table;
```

### Обновления \\{#updates\\}

Значения можно изменять с помощью запроса `ALTER TABLE`. Первичный ключ изменить нельзя.
Если параметр `keeper_map_strict_mode` имеет значение `true`, выборка и обновление данных выполнятся успешно только при атомарном выполнении операции.

```sql
ALTER TABLE keeper_map_table UPDATE v1 = v1 * 10 + 2 WHERE key LIKE 'some%' AND v3 > 3.1;
```

## Связанные материалы \\{#related-content\\}

- Блог: [Создание аналитических приложений реального времени с ClickHouse и Hex](https://clickhouse.com/blog/building-real-time-applications-with-clickhouse-and-hex-notebook-keeper-engine)
