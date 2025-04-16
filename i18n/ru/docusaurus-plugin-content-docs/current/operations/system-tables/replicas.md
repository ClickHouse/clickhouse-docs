---
description: 'Системная таблица, содержащая информацию о реплицированных таблицах и их статусе, находящихся на локальном сервере. Полезно для мониторинга.'
keywords: ['системная таблица', 'реплики']
slug: /operations/system-tables/replicas
title: 'system.replicas'
---


# system.replicas

Содержит информацию и статус для реплицированных таблиц, находящихся на локальном сервере. Эта таблица может использоваться для мониторинга. Таблица содержит строку для каждой таблицы типа Replicated*.

Пример:

```sql
SELECT *
FROM system.replicas
WHERE table = 'test_table'
FORMAT Vertical
```

```text
Идентификатор запроса: dc6dcbcb-dc28-4df9-ae27-4354f5b3b13e

Строка 1:
───────
database:                    db
table:                       test_table
engine:                      ReplicatedMergeTree
is_leader:                   1
can_become_leader:           1
is_readonly:                 0
is_session_expired:          0
future_parts:                0
parts_to_check:              0
zookeeper_path:              /test/test_table
replica_name:                r1
replica_path:                /test/test_table/replicas/r1
columns_version:             -1
queue_size:                  27
inserts_in_queue:            27
merges_in_queue:             0
part_mutations_in_queue:     0
queue_oldest_time:           2021-10-12 14:48:48
inserts_oldest_time:         2021-10-12 14:48:48
merges_oldest_time:          1970-01-01 03:00:00
part_mutations_oldest_time:  1970-01-01 03:00:00
oldest_part_to_get:          1_17_17_0
oldest_part_to_merge_to:
oldest_part_to_mutate_to:
log_max_index:               206
log_pointer:                 207
last_queue_update:           2021-10-12 14:50:08
absolute_delay:              99
total_replicas:              5
active_replicas:             5
lost_part_count:             0
last_queue_update_exception:
zookeeper_exception:
replica_is_active:           {'r1':1,'r2':1}
```

Столбцы:

- `database` (`String`) - имя базы данных
- `table` (`String`) - имя таблицы
- `engine` (`String`) - имя движка таблицы
- `is_leader` (`UInt8`) - является ли реплика лидером. 
    Несколько реплик могут быть лидерами одновременно. Реплику можно запретить стать лидером, используя настройку `merge_tree` `replicated_can_become_leader`. Лидеры отвечают за планирование фоновых слияний.
    Обратите внимание, что записи могут выполняться на любой доступной реплике, которая имеет сессию в ZK, независимо от того, является ли она лидером.
- `can_become_leader` (`UInt8`) - может ли реплика стать лидером.
- `is_readonly` (`UInt8`) - находится ли реплика в режиме только для чтения.
    Этот режим включается, если в конфигурации нет секций с ClickHouse Keeper, если произошла неизвестная ошибка при повторной инициализации сессий в ClickHouse Keeper, а также во время повторной инициализации сессии в ClickHouse Keeper.
- `is_session_expired` (`UInt8`) - сессия с ClickHouse Keeper истекла. В основном то же самое, что и `is_readonly`.
- `future_parts` (`UInt32`) - количество частей данных, которые появятся в результате еще не выполненных INSERT или слияний.
- `parts_to_check` (`UInt32`) - количество частей данных в очереди на проверку. Часть ставится в очередь на проверку, если есть подозрение, что она может быть повреждена.
- `zookeeper_path` (`String`) - путь к данным таблицы в ClickHouse Keeper.
- `replica_name` (`String`) - имя реплики в ClickHouse Keeper. Разные реплики одной и той же таблицы имеют разные имена.
- `replica_path` (`String`) - путь к данным реплики в ClickHouse Keeper. То же самое, что и конкатенация 'zookeeper_path/replicas/replica_path'.
- `columns_version` (`Int32`) - номер версии структуры таблицы. Указывает, сколько раз выполнялся ALTER. Если у реплик разные версии, это означает, что некоторые реплики не выполнили все ALTER.
- `queue_size` (`UInt32`) - размер очереди для операций, ожидающих выполнения. Операции включают вставку блоков данных, слияния и некоторые другие действия. Обычно это совпадает с `future_parts`.
- `inserts_in_queue` (`UInt32`) - количество вставок блоков данных, которые необходимо выполнить. Обычно вставки реплицируются довольно быстро. Если это число велико, это означает, что что-то не так.
- `merges_in_queue` (`UInt32`) - количество слияний, ожидающих выполнения. Иногда слияния могут длиться долго, поэтому это значение может быть больше нуля длительное время.
- `part_mutations_in_queue` (`UInt32`) - количество мутаций, ожидающих выполнения.
- `queue_oldest_time` (`DateTime`) - если `queue_size` больше 0, показывает, когда самая старая операция была добавлена в очередь.
- `inserts_oldest_time` (`DateTime`) - см. `queue_oldest_time`
- `merges_oldest_time` (`DateTime`) - см. `queue_oldest_time`
- `part_mutations_oldest_time` (`DateTime`) - см. `queue_oldest_time`

Следующие 4 столбца имеют ненулевое значение только там, где есть активная сессия с ZK.

- `log_max_index` (`UInt64`) - Максимальный номер записи в журнале общей активности.
- `log_pointer` (`UInt64`) - Максимальный номер записи в журнале общей активности, который реплика скопировала в свою очередь выполнения, плюс один. Если `log_pointer` значительно меньше, чем `log_max_index`, это означает, что что-то не так.
- `last_queue_update` (`DateTime`) - Когда очередь была обновлена в последний раз.
- `absolute_delay` (`UInt64`) - Какой большой запаздывание в секундах у текущей реплики.
- `total_replicas` (`UInt8`) - Общее количество известных реплик этой таблицы.
- `active_replicas` (`UInt8`) - Количество реплик этой таблицы, которые имеют сессию в ClickHouse Keeper (т.е. количество функционирующих реплик).
- `lost_part_count` (`UInt64`) - Количество потерянных частей данных в таблице всеми репликами всего с момента создания таблицы. Значение сохраняется в ClickHouse Keeper и может только увеличиваться.
- `last_queue_update_exception` (`String`) - Когда в очереди присутствуют поврежденные записи. Особенно важно, когда ClickHouse нарушает обратную совместимость между версиями и записи журнала, написанные более новыми версиями, не могут быть обработаны старыми версиями.
- `zookeeper_exception` (`String`) - Сообщение об последнем исключении, полученное, если ошибка произошла при получении информации из ClickHouse Keeper.
- `replica_is_active` ([Map(String, UInt8)](../../sql-reference/data-types/map.md)) — карта между именем реплики и ее активностью.

Если вы запрашиваете все столбцы, таблица может работать немного медленно, поскольку для каждой строки выполняется несколько чтений из ClickHouse Keeper. Если вы не запрашиваете последние 4 столбца (`log_max_index`, `log_pointer`, `total_replicas`, `active_replicas`), таблица работает быстро.

Например, вы можете проверить, что все работает правильно, следующим образом:

```sql
SELECT
    database,
    table,
    is_leader,
    is_readonly,
    is_session_expired,
    future_parts,
    parts_to_check,
    columns_version,
    queue_size,
    inserts_in_queue,
    merges_in_queue,
    log_max_index,
    log_pointer,
    total_replicas,
    active_replicas
FROM system.replicas
WHERE
       is_readonly
    OR is_session_expired
    OR future_parts > 20
    OR parts_to_check > 10
    OR queue_size > 20
    OR inserts_in_queue > 10
    OR log_max_index - log_pointer > 10
    OR total_replicas < 2
    OR active_replicas < total_replicas
```

Если этот запрос ничего не возвращает, это означает, что все в порядке.
