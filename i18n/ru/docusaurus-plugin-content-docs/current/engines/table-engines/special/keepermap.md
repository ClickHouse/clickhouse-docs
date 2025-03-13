---
slug: /engines/table-engines/special/keeper-map
sidebar_position: 150
sidebar_label: KeeperMap
title: "KeeperMap"
description: "Этот движок позволяет использовать кластер Keeper/ZooKeeper в качестве консистентного хранилища ключ-значение с линейно согласованными записями и последовательно согласованными чтениями."
---


# KeeperMap {#keepermap}

Этот движок позволяет использовать кластер Keeper/ZooKeeper в качестве консистентного хранилища ключ-значение с линейно согласованными записями и последовательно согласованными чтениями.

Чтобы включить хранилище KeeperMap, вам необходимо определить путь ZooKeeper, по которому будут храниться таблицы, используя конфигурацию `<keeper_map_path_prefix>`.

Например:

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```

где путь может быть любым другим действительным путем ZooKeeper.

## Создание таблицы {#creating-a-table}

``` sql
CREATE TABLE [IF NOT EXISTS] [db.]table_name [ON CLUSTER cluster]
(
    name1 [type1] [DEFAULT|MATERIALIZED|ALIAS expr1],
    name2 [type2] [DEFAULT|MATERIALIZED|ALIAS expr2],
    ...
) ENGINE = KeeperMap(root_path, [keys_limit]) PRIMARY KEY(primary_key_name)
```

Параметры движка:

- `root_path` - путь ZooKeeper, по которому будет храниться `table_name`.  
Этот путь не должен содержать префикс, определенный конфигурацией `<keeper_map_path_prefix>`, так как префикс будет автоматически добавлен к `root_path`.  
Дополнительно поддерживается формат `auxiliary_zookeeper_cluster_name:/some/path`, где `auxiliary_zookeeper_cluster` — это кластер ZooKeeper, определенный внутри конфигурации `<auxiliary_zookeepers>`.  
По умолчанию используется кластер ZooKeeper, определенный в конфигурации `<zookeeper>`.
- `keys_limit` - количество ключей, разрешенных внутри таблицы.  
Этот лимит является мягким и возможно, что больше ключей окажется в таблице в некоторых крайних случаях.
- `primary_key_name` – любое имя колонки в списке колонок.
- `primary key` должен быть указан и поддерживает только одну колонку в первичном ключе. Первичный ключ будет сериализован в двоичном виде как `имя узла` внутри ZooKeeper. 
- Колонки, кроме первичного ключа, будут сериализованы в двоичном виде в соответствующем порядке и храниться как значение результирующего узла, определяемого сериализованным ключом.
- Запросы с фильтрацией по ключу `equals` или `in` будут оптимизированы для поиска нескольких ключей из `Keeper`, в противном случае все значения будут извлечены.

Пример:

``` sql
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

Каждое значение, которое представляет собой двоичную сериализацию `(v1, v2, v3)`, будет храниться внутри `/keeper_map_tables/keeper_map_table/data/serialized_key` в `Keeper`.  
Кроме того, количество ключей будет иметь мягкий лимит в 4 для количества ключей.

Если несколько таблиц создаются по одному и тому же пути ZooKeeper, значения сохраняются, пока существует хотя бы одна таблица, использующая его.  
Как результат, возможно использовать клаузу `ON CLUSTER` при создании таблицы и совместно использовать данные между несколькими экземплярами ClickHouse.  
Конечно, возможно вручную запустить `CREATE TABLE` с тем же путем на независимых экземплярах ClickHouse, чтобы достичь того же эффекта совместного использования данных.

## Поддерживаемые операции {#supported-operations}

### Вставки {#inserts}

Когда новые строки вставляются в `KeeperMap`, если ключ не существует, создается новая запись для ключа.  
Если ключ существует, и настройки `keeper_map_strict_mode` установлены на `true`, возникает исключение, в противном случае значение для ключа перезаписывается.

Пример:

```sql
INSERT INTO keeper_map_table VALUES ('some key', 1, 'value', 3.2);
```

### Удаления {#deletes}

Строки могут быть удалены с помощью запроса `DELETE` или `TRUNCATE`.  
Если ключ существует, и настройки `keeper_map_strict_mode` установлены на `true`, извлечение и удаление данных будет успешно выполнено только в том случае, если это может быть выполнено атомарно.

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

Значения могут быть обновлены с помощью запроса `ALTER TABLE`. Первичный ключ не может быть обновлен.  
Если настройки `keeper_map_strict_mode` установлены на `true`, извлечение и обновление данных будет успешно выполнено только если это выполняется атомарно.

```sql
ALTER TABLE keeper_map_table UPDATE v1 = v1 * 10 + 2 WHERE key LIKE 'some%' AND v3 > 3.1;
```

## Связанный контент {#related-content}

- Блог: [Создание приложений аналитики в реальном времени с ClickHouse и Hex](https://clickhouse.com/blog/building-real-time-applications-with-clickhouse-and-hex-notebook-keeper-engine)
