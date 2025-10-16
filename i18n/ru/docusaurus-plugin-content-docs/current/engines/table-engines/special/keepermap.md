---
slug: '/engines/table-engines/special/keeper-map'
sidebar_label: KeeperMap
sidebar_position: 150
description: 'Этот движок позволяет использовать кластер Keeper/ZooKeeper в качестве'
title: KeeperMap
doc_type: reference
---
# KeeperMap {#keepermap}

Этот движок позволяет использовать кластер Keeper/ZooKeeper в качестве согласованного хранилища ключ-значение с линейно согласованными записями и последовательно согласованными чтениями.

Чтобы включить движок хранения KeeperMap, необходимо определить путь в ZooKeeper, где будут храниться таблицы, с помощью конфигурации `<keeper_map_path_prefix>`.

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
Этот путь не должен содержать префикс, определенный конфигурацией `<keeper_map_path_prefix>`, так как префикс будет автоматически добавлен к `root_path`.  
Дополнительно поддерживается формат `auxiliary_zookeeper_cluster_name:/some/path`, где `auxiliary_zookeeper_cluster` - это кластер ZooKeeper, определенный в конфигурации `<auxiliary_zookeepers>`.  
По умолчанию используется кластер ZooKeeper, определенный в конфигурации `<zookeeper>`.
- `keys_limit` - количество ключей, допустимое в таблице.  
Этот лимит является мягким и может быть возможно, что в таблице окажется больше ключей в некоторых крайних случаях.
- `primary_key_name` – любое имя колонки из списка колонок.
- `primary key` должен быть указан, он поддерживает только одну колонку в первичном ключе. Первичный ключ будет сериализован в двоичном формате как `имя узла` внутри ZooKeeper. 
- колонки, отличные от первичного ключа, будут сериализованы в двоичном формате в соответствующем порядке и сохранены как значение результирующего узла, определенного сериализованным ключом.
- запросы с фильтрацией по ключу `equals` или `in` будут оптимизированы для многократного поиска ключей из `Keeper`, иначе будут извлечены все значения.

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
Кроме того, количество ключей будет иметь мягкий лимит в 4 для количества ключей.

Если несколько таблиц создаются по одному и тому же пути ZooKeeper, значения сохраняются, пока существует хотя бы 1 таблица, использующая его.  
В результате возможна использование оператора `ON CLUSTER` при создании таблицы и совместное использование данных из нескольких экземпляров ClickHouse.  
Конечно, можно вручную запустить `CREATE TABLE` с тем же путем на несвязанных экземплярах ClickHouse, чтобы добиться того же эффекта совместного использования данных.

## Поддерживаемые операции {#supported-operations}

### Вставки {#inserts}

Когда новые строки вставляются в `KeeperMap`, если ключ не существует, создается новая запись для ключа.
Если ключ существует, и настройка `keeper_map_strict_mode` установлена в `true`, выдается исключение, в противном случае значение для ключа перезаписывается.

Пример:

```sql
INSERT INTO keeper_map_table VALUES ('some key', 1, 'value', 3.2);
```

### Удаления {#deletes}

Строки можно удалить с помощью запроса `DELETE` или `TRUNCATE`. 
Если ключ существует, и настройка `keeper_map_strict_mode` установлена в `true`, получение и удаление данных будет успешным только если это может быть выполнено атомарно.

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

Значения можно обновлять с помощью запроса `ALTER TABLE`. Первичный ключ нельзя обновлять.
Если настройка `keeper_map_strict_mode` установлена в `true`, получение и обновление данных будут успешными только если это выполняется атомарно.

```sql
ALTER TABLE keeper_map_table UPDATE v1 = v1 * 10 + 2 WHERE key LIKE 'some%' AND v3 > 3.1;
```

## Связанное содержимое {#related-content}

- Блог: [Создание приложений для аналитики в реальном времени с ClickHouse и Hex](https://clickhouse.com/blog/building-real-time-applications-with-clickhouse-and-hex-notebook-keeper-engine)