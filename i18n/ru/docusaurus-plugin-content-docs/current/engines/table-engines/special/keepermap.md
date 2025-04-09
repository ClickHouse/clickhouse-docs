---
description: 'Этот движок позволяет использовать кластер Keeper/ZooKeeper в качестве согласованного хранилища ключ-значение с линейно согласованными записями и последовательно согласованными чтениями.'
sidebar_label: 'KeeperMap'
sidebar_position: 150
slug: /engines/table-engines/special/keeper-map
title: 'KeeperMap'
---


# KeeperMap {#keepermap}

Этот движок позволяет использовать кластер Keeper/ZooKeeper в качестве согласованного хранилища ключ-значение с линейно согласованными записями и последовательно согласованными чтениями.

Чтобы включить движок хранения KeeperMap, необходимо задать путь ZooKeeper, по которому будут храниться таблицы, с помощью конфигурации `<keeper_map_path_prefix>`.

Например:

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```

где путь может быть любым другим допустимым путем ZooKeeper.

## Создание таблицы {#creating-a-table}

```sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = KeeperMap(root_path, [keys_limit]) PRIMARY KEY(primary_key_name)
```

Параметры движка:

- `root_path` - путь ZooKeeper, где будет храниться `table_name`.  
Этот путь не должен содержать префикс, заданный в конфигурации `<keeper_map_path_prefix>`, так как префикс будет автоматически добавлен к `root_path`.  
Дополнительно поддерживается формат `auxiliary_zookeeper_cluster_name:/some/path`, где `auxiliary_zookeeper_cluster` – это кластер ZooKeeper, определенный в конфигурации `<auxiliary_zookeepers>`.  
По умолчанию используется кластер ZooKeeper, определенный в конфигурации `<zookeeper>`.
- `keys_limit` - количество ключей, допустимых в таблице.  
Этот лимит является мягким, и может быть так, что в таблице окажется больше ключей в некоторых крайних случаях.
- `primary_key_name` – любое имя колонки из списка колонок.
- `primary key` должен быть указан, он поддерживает только одну колонку в первичном ключе. Первичный ключ будет сериализован в бинарном виде как `имя узла` внутри ZooKeeper. 
- колонки, отличные от первичного ключа, будут сериализованы в бинарном виде в соответствующем порядке и храниться как значение результирующего узла, определенного сериализованным ключом.
- запросы с фильтрацией ключа `equals` или `in` будут оптимизированы для многократного поиска ключей из `Keeper`, в противном случае будут извлечены все значения.

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

Каждое значение, которое представляет собой бинарную сериализацию `(v1, v2, v3)`, будет храниться внутри `/keeper_map_tables/keeper_map_table/data/serialized_key` в `Keeper`.
Дополнительно, количество ключей будет иметь мягкий лимит в 4 для количества ключей.

Если несколько таблиц созданы по одному и тому же пути ZooKeeper, значения будут сохраняться до тех пор, пока существует хотя бы одна таблица, использующая его.  
Таким образом, возможно использовать оператор `ON CLUSTER` при создании таблицы и делиться данными между несколькими экземплярами ClickHouse.  
Конечно, возможно вручную запустить `CREATE TABLE` с тем же путем на несвязанных экземплярах ClickHouse, чтобы добиться аналогичного эффекта совместного использования данных.

## Поддерживаемые операции {#supported-operations}

### Вставки {#inserts}

При вставке новых строк в `KeeperMap`, если ключ не существует, создается новая запись для ключа.  
Если ключ существует, и настройка `keeper_map_strict_mode` установлена в `true`, возникает исключение, в противном случае значение для ключа перезаписывается.

Пример:

```sql
INSERT INTO keeper_map_table VALUES ('some key', 1, 'value', 3.2);
```

### Удаления {#deletes}

Строки можно удалять с помощью запроса `DELETE` или `TRUNCATE`. 
Если ключ существует, и настройка `keeper_map_strict_mode` установлена в `true`, получение и удаление данных будут успешными только в том случае, если они могут быть выполнены атомарно.

```sql
DELETE FROM keeper_map_table WHERE key LIKE 'some%' AND v1 > 1;
```

```sql
ALTER TABLE keeper_map_table DELETE WHERE key LIKE 'some%' AND v1 > 1;
```

```sql
TRUNCATE TABLE keeper_map_table;
```

### Обновления {#updates}

Значения можно обновлять с помощью запроса `ALTER TABLE`. Первичный ключ обновить нельзя.  
Если настройка `keeper_map_strict_mode` установлена в `true`, получение и обновление данных будут успешными только если это выполняется атомарно.

```sql
ALTER TABLE keeper_map_table UPDATE v1 = v1 * 10 + 2 WHERE key LIKE 'some%' AND v3 > 3.1;
```

## Связанный контент {#related-content}

- Блог: [Создание приложений аналитики в реальном времени с ClickHouse и Hex](https://clickhouse.com/blog/building-real-time-applications-with-clickhouse-and-hex-notebook-keeper-engine)
