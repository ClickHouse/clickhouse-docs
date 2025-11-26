---
description: 'Системная таблица, содержащая информацию о реплицируемых таблицах и их статусе на локальном сервере. Полезна для мониторинга.'
keywords: ['системная таблица', 'реплики']
slug: /operations/system-tables/replicas
title: 'system.replicas'
doc_type: 'reference'
---

# system.replicas

Содержит информацию и состояние реплицируемых таблиц, расположенных на локальном сервере.
Эту таблицу можно использовать для мониторинга. Таблица содержит по одной строке для каждой таблицы Replicated*.

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


- `database` (`String`) - Имя базы данных
- `table` (`String`) - Имя таблицы
- `engine` (`String`) - Имя движка таблицы
- `is_leader` (`UInt8`) - Является ли реплика лидером.
    Одновременно лидерами могут быть несколько реплик. Реплике можно запретить становиться лидером с помощью настройки `merge_tree` `replicated_can_become_leader`. Лидеры отвечают за планирование фоновых слияний.
    Обратите внимание, что запись может выполняться в любую реплику, которая доступна и имеет сессию в ZK, независимо от того, является ли она лидером.
- `can_become_leader` (`UInt8`) - Может ли реплика быть лидером.
- `is_readonly` (`UInt8`) - Находится ли реплика в режиме только для чтения.
    Этот режим включается, если в конфигурации нет секций с ClickHouse Keeper, если при переинициализации сессий в ClickHouse Keeper произошла неизвестная ошибка, а также во время переинициализации сессий в ClickHouse Keeper.
- `is_session_expired` (`UInt8`) - Сессия с ClickHouse Keeper истекла. По сути то же самое, что `is_readonly`.
- `future_parts` (`UInt32`) - Количество частей данных, которые появятся в результате операций INSERT или слияний, которые еще не выполнены.
- `parts_to_check` (`UInt32`) - Количество частей данных в очереди на проверку. Часть помещается в очередь на проверку, если есть подозрение, что она может быть повреждена.
- `zookeeper_path` (`String`) - Путь к данным таблицы в ClickHouse Keeper.
- `replica_name` (`String`) - Имя реплики в ClickHouse Keeper. У разных реплик одной и той же таблицы разные имена.
- `replica_path` (`String`) - Путь к данным реплики в ClickHouse Keeper. То же, что и конкатенация 'zookeeper_path/replicas/replica_path'.
- `columns_version` (`Int32`) - Номер версии структуры таблицы. Показывает, сколько раз выполнялась операция ALTER. Если у реплик разные версии, это означает, что некоторые реплики еще не выполнили все операции ALTER.
- `queue_size` (`UInt32`) - Размер очереди операций, ожидающих выполнения. Операции включают вставку блоков данных, слияния и некоторые другие действия. Обычно совпадает со значением `future_parts`.
- `inserts_in_queue` (`UInt32`) - Количество вставок блоков данных, которые нужно выполнить. Вставки обычно реплицируются достаточно быстро. Если это число велико, значит что-то не так.
- `merges_in_queue` (`UInt32`) - Количество слияний, ожидающих выполнения. Иногда слияния длятся долго, поэтому это значение может оставаться больше нуля в течение длительного времени.
- `part_mutations_in_queue` (`UInt32`) - Количество мутаций, ожидающих выполнения.
- `queue_oldest_time` (`DateTime`) - Если `queue_size` больше 0, показывает, когда в очередь была добавлена самая старая операция.
- `inserts_oldest_time` (`DateTime`) - См. `queue_oldest_time`.
- `merges_oldest_time` (`DateTime`) - См. `queue_oldest_time`.
- `part_mutations_oldest_time` (`DateTime`) - См. `queue_oldest_time`.

Следующие 4 столбца имеют ненулевое значение только там, где есть активная сессия с ZK.

- `log_max_index` (`UInt64`) - Максимальный номер записи в логе общей активности.
- `log_pointer` (`UInt64`) - Максимальный номер записи в логе общей активности, который реплика скопировала в свою очередь выполнения, плюс один. Если `log_pointer` значительно меньше, чем `log_max_index`, это указывает на проблему.
- `last_queue_update` (`DateTime`) - Время последнего обновления очереди.
- `absolute_delay` (`UInt64`) - Величина задержки текущей реплики в секундах.
- `total_replicas` (`UInt8`) - Общее количество известных реплик этой таблицы.
- `active_replicas` (`UInt8`) - Количество реплик этой таблицы, которые имеют сессию в ClickHouse Keeper (т.е. количество работающих реплик).
- `lost_part_count` (`UInt64`) - Общее количество частей данных, потерянных всеми репликами таблицы с момента ее создания. Значение сохраняется в ClickHouse Keeper и может только увеличиваться.
- `last_queue_update_exception` (`String`) - Сообщение об исключении, возникающем, когда в очереди содержатся поврежденные записи. Особенно важно, когда ClickHouse нарушает обратную совместимость между версиями и записи лога, сделанные более новыми версиями, не могут быть разобраны старыми версиями.
- `zookeeper_exception` (`String`) - Сообщение о последнем исключении, полученное при возникновении ошибки во время получения информации из ClickHouse Keeper.
- `replica_is_active` ([Map(String, UInt8)](../../sql-reference/data-types/map.md)) — Отображение между именем реплики и признаком того, активна ли эта реплика.

Если запросить все столбцы, таблица может работать немного медленнее, поскольку для каждой строки выполняется несколько чтений из ClickHouse Keeper.
Если не запрашивать последние 4 столбца (log&#95;max&#95;index, log&#95;pointer, total&#95;replicas, active&#95;replicas), таблица работает быстро.

Например, вы можете проверить, что всё работает корректно, следующим образом:

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

Если этот запрос не возвращает результатов, значит всё в порядке.
