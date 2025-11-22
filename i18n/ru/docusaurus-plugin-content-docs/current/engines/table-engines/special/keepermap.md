---
description: 'Этот движок позволяет использовать кластер Keeper/ZooKeeper как согласованное
  хранилище ключ-значение с линеаризуемыми операциями записи и чтением с последовательной согласованностью.'
sidebar_label: 'KeeperMap'
sidebar_position: 150
slug: /engines/table-engines/special/keeper-map
title: 'Движок таблицы KeeperMap'
doc_type: 'reference'
---



# Движок таблиц KeeperMap

Этот движок позволяет использовать кластер Keeper/ZooKeeper как согласованное хранилище ключ–значение с линеаризуемой записью и последовательно согласованным чтением.

Чтобы включить табличный движок KeeperMap, необходимо задать путь в ZooKeeper, где будут храниться таблицы, с помощью параметра конфигурации `<keeper_map_path_prefix>`.

Например:

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```

где path может быть любым другим допустимым путём в ZooKeeper.


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

- `root_path` — путь ZooKeeper, где будет храниться `table_name`.  
  Этот путь не должен содержать префикс, определённый в конфигурации `<keeper_map_path_prefix>`, поскольку префикс будет автоматически добавлен к `root_path`.  
  Дополнительно поддерживается формат `auxiliary_zookeeper_cluster_name:/some/path`, где `auxiliary_zookeeper_cluster` — это кластер ZooKeeper, определённый в конфигурации `<auxiliary_zookeepers>`.  
  По умолчанию используется кластер ZooKeeper, определённый в конфигурации `<zookeeper>`.
- `keys_limit` — количество ключей, допустимых в таблице.  
  Это мягкое ограничение, и в некоторых граничных случаях в таблице может оказаться больше ключей.
- `primary_key_name` — любое имя столбца из списка столбцов.
- `primary key` должен быть указан, поддерживается только один столбец в первичном ключе. Первичный ключ будет сериализован в бинарном виде как `node name` внутри ZooKeeper.
- столбцы, отличные от первичного ключа, будут сериализованы в бинарный формат в соответствующем порядке и сохранены как значение результирующего узла, определённого сериализованным ключом.
- запросы с фильтрацией по ключу `equals` или `in` будут оптимизированы для поиска нескольких ключей из `Keeper`, в противном случае будут извлечены все значения.

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

с конфигурацией

```xml
<clickhouse>
    <keeper_map_path_prefix>/keeper_map_tables</keeper_map_path_prefix>
</clickhouse>
```

Каждое значение, представляющее собой бинарную сериализацию `(v1, v2, v3)`, будет храниться в `/keeper_map_tables/keeper_map_table/data/serialized_key` в `Keeper`.
Дополнительно для количества ключей будет установлено мягкое ограничение в 4 ключа.

Если несколько таблиц создаются по одному и тому же пути ZooKeeper, значения сохраняются до тех пор, пока существует хотя бы одна таблица, использующая этот путь.  
В результате можно использовать конструкцию `ON CLUSTER` при создании таблицы и совместном использовании данных из нескольких экземпляров ClickHouse.  
Разумеется, можно вручную выполнить `CREATE TABLE` с одинаковым путём на несвязанных экземплярах ClickHouse для достижения того же эффекта совместного использования данных.


## Поддерживаемые операции {#supported-operations}

### Вставка данных {#inserts}

При вставке новых строк в `KeeperMap`, если ключ не существует, создаётся новая запись для этого ключа.
Если ключ существует и параметр `keeper_map_strict_mode` установлен в `true`, генерируется исключение, в противном случае значение ключа перезаписывается.

Пример:

```sql
INSERT INTO keeper_map_table VALUES ('some key', 1, 'value', 3.2);
```

### Удаление данных {#deletes}

Строки можно удалить с помощью запроса `DELETE` или `TRUNCATE`.
Если ключ существует и параметр `keeper_map_strict_mode` установлен в `true`, получение и удаление данных будет выполнено успешно только при атомарном выполнении операции.

```sql
DELETE FROM keeper_map_table WHERE key LIKE 'some%' AND v1 > 1;
```

```sql
ALTER TABLE keeper_map_table DELETE WHERE key LIKE 'some%' AND v1 > 1;
```

```sql
TRUNCATE TABLE keeper_map_table;
```

### Обновление данных {#updates}

Значения можно обновить с помощью запроса `ALTER TABLE`. Первичный ключ обновить нельзя.
Если параметр `keeper_map_strict_mode` установлен в `true`, получение и обновление данных будет выполнено успешно только при атомарном выполнении операции.

```sql
ALTER TABLE keeper_map_table UPDATE v1 = v1 * 10 + 2 WHERE key LIKE 'some%' AND v3 > 3.1;
```


## Связанный контент {#related-content}

- Блог: [Создание приложений для аналитики в реальном времени с ClickHouse и Hex](https://clickhouse.com/blog/building-real-time-applications-with-clickhouse-and-hex-notebook-keeper-engine)
