---
'description': 'Системная таблица, содержащая информацию о и статусе реплицированной
  базы данных.'
'keywords':
- 'system table'
- 'database_replicas'
'slug': '/operations/system-tables/database_replicas'
'title': 'system.database_replicas'
'doc_type': 'reference'
---
Содержит информацию о каждой реплике реплицируемой базы данных.

Столбцы:

- `database` ([String](../../sql-reference/data-types/string.md)) — Имя реплицируемой базы данных.

- `is_readonly` ([UInt8](../../sql-reference/data-types/int-uint.md)) - Является ли реплика базы данных в режиме только для чтения. 
    Этот режим включен, если в конфигурации нет разделов с Zookeeper/ClickHouse Keeper.

- `is_session_expired` ([UInt8](../../sql-reference/data-types/int-uint.md)) - сессия с ClickHouse Keeper истекла. В основном то же самое, что и `is_readonly`.

- `max_log_ptr` ([UInt32](../../sql-reference/data-types/int-uint.md)) - Максимальный номер записи в журнале общей активности.

- `zookeeper_path` ([String](../../sql-reference/data-types/string.md)) - Путь к данным базы данных в ClickHouse Keeper.

- `replica_name` ([String](../../sql-reference/data-types/string.md)) - Имя реплики в ClickHouse Keeper.

- `replica_path` ([String](../../sql-reference/data-types/string.md)) - Путь к данным реплики в ClickHouse Keeper.

- `zookeeper_exception` ([String](../../sql-reference/data-types/string.md)) - Последнее сообщение об исключении, полученное, если ошибка произошла при получении информации из ClickHouse Keeper.

- `total_replicas` ([UInt32](../../sql-reference/data-types/int-uint.md)) - Общее количество известных реплик этой базы данных.

- `log_ptr` ([UInt32](../../sql-reference/data-types/int-uint.md)) - Максимальный номер записи в журнале общей активности, который реплика скопировала в свою очередь выполнения, плюс один.

**Пример**

```sql
SELECT * FROM system.database_replicas FORMAT Vertical;
```

```text
Row 1:
──────
database:            db_2
is_readonly:         0
max_log_ptr:         2
replica_name:        replica1
replica_path:        /test/db_2/replicas/shard1|replica1
zookeeper_path:      /test/db_2
shard_name:          shard1
log_ptr:             2
total_replicas:      1
zookeeper_exception: 
is_session_expired:  0
```