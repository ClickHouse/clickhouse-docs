---
description: 'Системная таблица, содержащая информацию о и статус реплицированных таблиц, находящихся на локальном сервере. Полезно для мониторинга.'
slug: /operations/system-tables/replicas
title: 'system.replicas'
keywords: ['системная таблица', 'реплики']
---

Содержит информацию и статус для реплицированных таблиц, находящихся на локальном сервере. Эта таблица может использоваться для мониторинга. Таблица содержит строку для каждой таблицы типа Replicated*.

Пример:

``` sql
SELECT *
FROM system.replicas
WHERE table = 'test_table'
FORMAT Vertical
```

``` text
Query id: dc6dcbcb-dc28-4df9-ae27-4354f5b3b13e

Row 1:
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

Колонки:

- `database` (`String`) - Имя базы данных
- `table` (`String`) - Имя таблицы
- `engine` (`String`) - Имя движка таблицы
- `is_leader` (`UInt8`) - Является ли реплика лидером.
    Несколько реплик могут быть лидерами одновременно. Реплике можно запретить стать лидером с помощью настройки `merge_tree` `replicated_can_become_leader`. Лидеры отвечают за планирование фоновый слияний.
    Обратите внимание, что записи могут выполняться на любой доступной реплике, имеющей сессию в ZK, независимо от того, является ли она лидером.
- `can_become_leader` (`UInt8`) - Может ли реплика быть лидером.
- `is_readonly` (`UInt8`) - Является ли реплика в режиме только для чтения.
    Этот режим включается, если в конфигурации нет разделов с ClickHouse Keeper, если возникла неизвестная ошибка при повторной инициализации сессий в ClickHouse Keeper и во время повторной инициализации сессии в ClickHouse Keeper.
- `is_session_expired` (`UInt8`) - Сессия с ClickHouse Keeper истекла. По сути, то же самое, что и `is_readonly`.
- `future_parts` (`UInt32`) - Количество частей данных, которые появятся в результате INSERT или слияний, которые еще не выполнены.
- `parts_to_check` (`UInt32`) - Количество частей данных в очереди на проверку. Часть помещается в очередь на проверку, если есть подозрение, что она может быть повреждена.
- `zookeeper_path` (`String`) - Путь к данным таблицы в ClickHouse Keeper.
- `replica_name` (`String`) - Имя реплики в ClickHouse Keeper. Разные реплики одной и той же таблицы имеют разные имена.
- `replica_path` (`String`) - Путь к данным реплики в ClickHouse Keeper. То же самое, что и конкатенация 'zookeeper_path/replicas/replica_path'.
- `columns_version` (`Int32`) - Номер версии структуры таблицы. Указывает, сколько раз было выполнено ALTER. Если у реплик разные версии, это означает, что некоторые реплики не выполнили все ALTER.
- `queue_size` (`UInt32`) - Размер очереди для операций, ожидающих выполнения. Операции включают вставку блоков данных, слияния и некоторые другие действия. Обычно совпадает с `future_parts`.
- `inserts_in_queue` (`UInt32`) - Количество вставок блоков данных, которые необходимо выполнить. Вставки обычно реплицируются довольно быстро. Если это число велико, это означает, что что-то не так.
- `merges_in_queue` (`UInt32`) - Количество слияний, ожидающих выполнения. Иногда слияния занимают много времени, поэтому это значение может быть больше нуля длительное время.
- `part_mutations_in_queue` (`UInt32`) - Количество мутаций, ожидающих выполнения.
- `queue_oldest_time` (`DateTime`) - Если `queue_size` больше 0, показывает, когда самая старая операция была добавлена в очередь.
- `inserts_oldest_time` (`DateTime`) - Смотрите `queue_oldest_time`
- `merges_oldest_time` (`DateTime`) - Смотрите `queue_oldest_time`
- `part_mutations_oldest_time` (`DateTime`) - Смотрите `queue_oldest_time`

Следующие 4 колонки имеют ненулевое значение только там, где есть активная сессия с ZK.

- `log_max_index` (`UInt64`) - Максимальный номер записи в журнале общей активности.
- `log_pointer` (`UInt64`) - Максимальный номер записи в журнале общей активности, которую реплика скопировала в свою очередь выполнения, плюс один. Если `log_pointer` намного меньше `log_max_index`, что-то не так.
- `last_queue_update` (`DateTime`) - Когда очередь была обновлена в последний раз.
- `absolute_delay` (`UInt64`) - Насколько велик задержка в секундах у текущей реплики.
- `total_replicas` (`UInt8`) - Общее число известных реплик этой таблицы.
- `active_replicas` (`UInt8`) - Количество реплик этой таблицы, которые имеют сессию в ClickHouse Keeper (т.е. количество функционирующих реплик).
- `lost_part_count` (`UInt64`) - Количество частей данных, потерянных в таблице всеми репликами с момента создания таблицы. Значение хранится в ClickHouse Keeper и может только увеличиваться.
- `last_queue_update_exception` (`String`) - Когда очередь содержит поврежденные записи. Особенно важно, когда ClickHouse нарушает обратную совместимость между версиями, и записи лога, записанные новыми версиями, не могут быть разобраны старыми версиями.
- `zookeeper_exception` (`String`) - Сообщение о последнем исключении, полученное при ошибке при получении информации из ClickHouse Keeper.
- `replica_is_active` ([Map(String, UInt8)](../../sql-reference/data-types/map.md)) — Карта между именем реплики и активна ли реплика.

Если вы запрашиваете все колонки, таблица может работать немного медленнее, поскольку для каждой строки выполняется несколько чтений из ClickHouse Keeper. Если вы не запрашиваете последние 4 колонки (log_max_index, log_pointer, total_replicas, active_replicas), таблица работает быстро.

Например, вы можете проверить, что все работает правильно так:

``` sql
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

Если этот запрос ничего не вернет, это означает, что все в порядке.
