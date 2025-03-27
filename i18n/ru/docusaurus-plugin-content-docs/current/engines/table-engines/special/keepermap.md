---
description: 'Этот движок позволяет использовать кластер Keeper/ZooKeeper в качестве согласованного хранилища пар ключ-значение с линейноизменяемыми записями и последовательной согласованностью при чтении.'
sidebar_label: 'KeeperMap'
sidebar_position: 150
slug: /engines/table-engines/special/keeper-map
title: 'KeeperMap'
---


# KeeperMap {#keepermap}

Этот движок позволяет использовать кластер Keeper/ZooKeeper в качестве согласованного хранилища пар ключ-значение с линейноизменяемыми записями и последовательной согласованностью при чтении.

Чтобы включить движок хранения KeeperMap, необходимо определить путь ZooKeeper, где будут храниться таблицы, используя конфигурацию `<keeper_map_path_prefix>`.

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
Этот путь не должен содержать префикс, определенный в конфигурации `<keeper_map_path_prefix>`, так как префикс будет автоматически добавлен к `root_path`.  
Кроме того, поддерживается формат `auxiliary_zookeeper_cluster_name:/some/path`, где `auxiliary_zookeeper_cluster` — это кластер ZooKeeper, определенный внутри конфигурации `<auxiliary_zookeepers>`.  
По умолчанию используется кластер ZooKeeper, определенный в конфигурации `<zookeeper>`.
- `keys_limit` - количество ключей, допустимых в таблице.  
Этот лимит является мягким ограничением, и в некоторых крайних случаях может оказаться, что в таблице будет больше ключей.
- `primary_key_name` – любое имя столбца из списка столбцов.
- `primary key` должен быть указан, он поддерживает только один столбец в первичном ключе. Первичный ключ будет сериализован в двоичном виде как `имя узла` внутри ZooKeeper. 
- столбцы, отличные от первичного ключа, будут сериализованы в двоичном виде в соответствующем порядке и храниться как значение результирующего узла, определяемого сериализованным ключом.
- запросы с фильтрацией по ключу `equals` или `in` будут оптимизированы для многократного поиска ключей из `Keeper`, в противном случае будут извлекаться все значения.

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

Каждое значение, которое является бинарной сериализацией `(v1, v2, v3)`, будет храниться внутри `/keeper_map_tables/keeper_map_table/data/serialized_key` в `Keeper`.
Кроме того, количество ключей будет иметь мягкий лимит 4.

Если несколько таблиц создаются на одном и том же пути ZooKeeper, значения сохранятся до тех пор, пока существует хотя бы 1 таблица, использующая его.  
В результате можно использовать предложение `ON CLUSTER` при создании таблицы и делиться данными между несколькими экземплярами ClickHouse.  
Конечно, также возможно вручную выполнить `CREATE TABLE` с тем же путем на несвязанных экземплярах ClickHouse, чтобы достичь того же эффекта совместного использования данных.

## Поддерживаемые операции {#supported-operations}

### Вставки {#inserts}

При вставке новых строк в `KeeperMap`, если ключ не существует, создается новая запись для ключа.  
Если ключ существует и настройка `keeper_map_strict_mode` установлена в `true`, выбрасывается исключение, в противном случае значение по ключу перезаписывается.

Пример:

```sql
INSERT INTO keeper_map_table VALUES ('some key', 1, 'value', 3.2);
```

### Удаления {#deletes}

Строки можно удалять с помощью запроса `DELETE` или `TRUNCATE`.  
Если ключ существует и настройка `keeper_map_strict_mode` установлена в `true`, получение и удаление данных будет успешным только в том случае, если оно может быть выполнено атомарно.

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

Значения можно обновлять с помощью запроса `ALTER TABLE`. Первичный ключ не может быть обновлен.  
Если настройка `keeper_map_strict_mode` установлена в `true`, получение и обновление данных будет успешным только в том случае, если оно выполнено атомарно.

```sql
ALTER TABLE keeper_map_table UPDATE v1 = v1 * 10 + 2 WHERE key LIKE 'some%' AND v3 > 3.1;
```

## Связанный контент {#related-content}

- Блог: [Создание приложений для аналитики в реальном времени с ClickHouse и Hex](https://clickhouse.com/blog/building-real-time-applications-with-clickhouse-and-hex-notebook-keeper-engine)
