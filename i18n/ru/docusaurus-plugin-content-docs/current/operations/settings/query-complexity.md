---
description: 'Настройки, ограничивающие сложность запросов.'
sidebar_label: 'Ограничения сложности запросов'
sidebar_position: 59
slug: /operations/settings/query-complexity
title: 'Ограничения сложности запросов'
doc_type: 'reference'
---



# Ограничения сложности запросов



## Обзор {#overview}

В рамках [настроек](/operations/settings/overview) ClickHouse предоставляет
возможность устанавливать ограничения на сложность запросов. Это помогает защититься от
потенциально ресурсоёмких запросов, обеспечивая более безопасное и предсказуемое
выполнение, особенно при использовании пользовательского интерфейса.

Почти все ограничения применяются только к запросам `SELECT`, а при распределённой
обработке запросов ограничения применяются на каждом сервере отдельно.

ClickHouse обычно проверяет ограничения только после полной обработки кусков данных,
а не для каждой строки. Это может
привести к ситуации, когда ограничения нарушаются в процессе обработки куска.


## Настройки `overflow_mode` {#overflow_mode_setting}

Большинство ограничений также имеют настройку `overflow_mode`, которая определяет поведение
при превышении лимита и может принимать одно из двух значений:

- `throw`: выбросить исключение (по умолчанию).
- `break`: остановить выполнение запроса и вернуть частичный результат, как если бы
  исходные данные закончились.


## Настройки `group_by_overflow_mode` {#group_by_overflow_mode_settings}

Настройка `group_by_overflow_mode` также имеет
значение `any`:

- `any` : продолжать агрегацию для ключей, которые попали в набор, но не
  добавлять в набор новые ключи.


## Список настроек {#relevant-settings}

Следующие настройки используются для применения ограничений на сложность запросов.

:::note
Ограничения на «максимальное количество чего-либо» могут принимать значение `0`,
что означает «без ограничений».
:::


| Настройка                                                                                                              | Краткое описание                                                                                                                                                              |
| ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`max_memory_usage`](/operations/settings/settings#max_memory_usage)                                                   | Максимальный объём оперативной памяти, используемый для выполнения запроса на одном сервере.                                                                                  |
| [`max_memory_usage_for_user`](/operations/settings/settings#max_memory_usage_for_user)                                 | Максимальный объём оперативной памяти, который может использоваться для выполнения запросов пользователя на одном сервере.                                                    |
| [`max_rows_to_read`](/operations/settings/settings#max_rows_to_read)                                                   | Максимальное количество строк, которые могут быть прочитаны из таблицы при выполнении запроса.                                                                                |
| [`max_bytes_to_read`](/operations/settings/settings#max_bytes_to_read)                                                 | Максимальный объём данных в байтах (в несжатом виде), который может быть прочитан из таблицы при выполнении запроса.                                                          |
| [`read_overflow_mode_leaf`](/operations/settings/settings#read_overflow_mode_leaf)                                     | Определяет, что происходит, когда объём прочитанных данных превышает один из лимитов для листовых узлов                                                                       |
| [`max_rows_to_read_leaf`](/operations/settings/settings#max_rows_to_read_leaf)                                         | Максимальное количество строк, которые можно прочитать из локальной таблицы на листовом узле при выполнении распределённого запроса                                           |
| [`max_bytes_to_read_leaf`](/operations/settings/settings#max_bytes_to_read_leaf)                                       | Максимальное количество байт (несжатых данных), которое может быть прочитано из локальной таблицы на листовом узле при выполнении распределённого запроса.                    |
| [`read_overflow_mode_leaf`](/docs/operations/settings/settings#read_overflow_mode_leaf)                                | Определяет поведение при превышении объёма прочитанных данных над одним из ограничений листа.                                                                                 |
| [`max_rows_to_group_by`](/operations/settings/settings#max_rows_to_group_by)                                           | Максимальное количество уникальных ключей, полученных в результате агрегации.                                                                                                 |
| [`group_by_overflow_mode`](/operations/settings/settings#group_by_overflow_mode)                                       | Задаёт поведение при превышении лимита на количество уникальных ключей агрегации                                                                                              |
| [`max_bytes_before_external_group_by`](/operations/settings/settings#max_bytes_before_external_group_by)               | Включает или отключает выполнение операций `GROUP BY` во внешней памяти.                                                                                                      |
| [`max_bytes_ratio_before_external_group_by`](/operations/settings/settings#max_bytes_ratio_before_external_group_by)   | Доля доступной памяти, которую можно использовать для `GROUP BY`. После её исчерпания для агрегации используется внешняя память.                                              |
| [`max_bytes_before_external_sort`](/operations/settings/settings#max_bytes_before_external_sort)                       | Включает или отключает выполнение операторов `ORDER BY` с использованием внешней памяти.                                                                                      |
| [`max_bytes_ratio_before_external_sort`](/operations/settings/settings#max_bytes_ratio_before_external_sort)           | Доля доступной памяти, которую можно использовать для `ORDER BY`. После её исчерпания используется внешняя сортировка.                                                        |
| [`max_rows_to_sort`](/operations/settings/settings#max_rows_to_sort)                                                   | Максимальное количество строк до сортировки. Позволяет ограничить потребление памяти при сортировке.                                                                          |
| [`max_bytes_to_sort`](/operations/settings/settings#max_rows_to_sort)                                                  | Максимальный объём данных (в байтах) до сортировки.                                                                                                                           |
| [`sort_overflow_mode`](/operations/settings/settings#sort_overflow_mode)                                               | Определяет, что происходит, если количество строк, полученных до сортировки, превышает один из лимитов.                                                                       |
| [`max_result_rows`](/operations/settings/settings#max_result_rows)                                                     | Ограничивает количество строк в результате.                                                                                                                                   |
| [`max_result_bytes`](/operations/settings/settings#max_result_bytes)                                                   | Ограничивает размер результата в байтах (несжатых данных)                                                                                                                     |
| [`result_overflow_mode`](/operations/settings/settings#result_overflow_mode)                                           | Задает, что делать, если объем результата превышает один из лимитов.                                                                                                          |
| [`max_execution_time`](/operations/settings/settings#max_execution_time)                                               | Максимальное время выполнения запроса в секундах.                                                                                                                             |
| [`timeout_overflow_mode`](/operations/settings/settings#timeout_overflow_mode)                                         | Определяет, что делать, если запрос выполняется дольше, чем `max_execution_time`, или ожидаемое время выполнения превышает `max_estimated_execution_time`.                    |
| [`max_execution_time_leaf`](/operations/settings/settings#max_execution_time_leaf)                                     | По смыслу аналогичен `max_execution_time`, но применяется только на конечных (листовых) узлах при выполнении распределённых или удалённых запросов.                           |
| [`timeout_overflow_mode_leaf`](/operations/settings/settings#timeout_overflow_mode_leaf)                               | Определяет, что происходит, если запрос на листовом узле выполняется дольше, чем `max_execution_time_leaf`.                                                                   |
| [`min_execution_speed`](/operations/settings/settings#min_execution_speed)                                             | Минимальная скорость выполнения в строках в секунду.                                                                                                                          |
| [`min_execution_speed_bytes`](/operations/settings/settings#min_execution_speed_bytes)                                 | Минимальное количество байт, обрабатываемых в секунду.                                                                                                                        |
| [`max_execution_speed`](/operations/settings/settings#max_execution_speed)                                             | Максимальное количество обрабатываемых строк в секунду.                                                                                                                       |
| [`max_execution_speed_bytes`](/operations/settings/settings#max_execution_speed_bytes)                                 | Максимальное количество байт, обрабатываемых в секунду.                                                                                                                       |
| [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)     | Проверяет, что скорость выполнения не слишком низкая (не ниже `min_execution_speed`) по истечении указанного времени в секундах.                                              |
| [`max_estimated_execution_time`](/operations/settings/settings#max_estimated_execution_time)                           | Максимальное предполагаемое время выполнения запроса в секундах.                                                                                                              |
| [`max_columns_to_read`](/operations/settings/settings#max_columns_to_read)                                             | Максимальное число столбцов, которые можно прочитать из таблицы в одном запросе.                                                                                              |
| [`max_temporary_columns`](/operations/settings/settings#max_temporary_columns)                                         | Максимальное количество временных столбцов, которые требуется одновременно хранить в оперативной памяти при выполнении запроса, включая константные столбцы.                  |
| [`max_temporary_non_const_columns`](/operations/settings/settings#max_temporary_non_const_columns)                     | Максимальное число временных столбцов, которые должны одновременно храниться в оперативной памяти при выполнении запроса, но без учета константных столбцов.                  |
| [`max_subquery_depth`](/operations/settings/settings#max_subquery_depth)                                               | Определяет поведение, если запрос содержит больше, чем заданное количество вложенных подзапросов.                                                                             |
| [`max_ast_depth`](/operations/settings/settings#max_ast_depth)                                                         | Максимальная глубина вложенности синтаксического дерева запроса.                                                                                                              |
| [`max_ast_elements`](/operations/settings/settings#max_ast_elements)                                                   | Максимальное количество элементов в синтаксическом дереве запроса.                                                                                                            |
| [`max_rows_in_set`](/operations/settings/settings#max_rows_in_set)                                                     | Максимальное количество строк в наборе данных в предикате IN, полученном из подзапроса.                                                                                       |
| [`max_bytes_in_set`](/operations/settings/settings#max_bytes_in_set)                                                   | Максимальный объём несжатых данных в байтах, используемых множеством в условии IN, сформированным из подзапроса.                                                              |
| [`set_overflow_mode`](/operations/settings/settings#max_bytes_in_set)                                                  | Определяет, что произойдёт, когда объём данных превысит один из лимитов.                                                                                                      |
| [`max_rows_in_distinct`](/operations/settings/settings#max_rows_in_distinct)                                           | Максимальное количество уникальных строк при использовании DISTINCT.                                                                                                          |
| [`max_bytes_in_distinct`](/operations/settings/settings#max_bytes_in_distinct)                                         | Максимальный объём состояния в памяти (в несжатом виде) в байтах, который использует хеш-таблица при выполнении DISTINCT.                                                     |
| [`distinct_overflow_mode`](/operations/settings/settings#distinct_overflow_mode)                                       | Задаёт, что происходит, когда объём данных превышает один из лимитов.                                                                                                         |
| [`max_rows_to_transfer`](/operations/settings/settings#max_rows_to_transfer)                                           | Максимальное количество строк, которое может быть передано на удалённый сервер или сохранено во временной таблице при выполнении GLOBAL IN/JOIN.                              |
| [`max_bytes_to_transfer`](/operations/settings/settings#max_bytes_to_transfer)                                         | Максимальное количество байт (несжатых данных), которое может быть передано на удалённый сервер или сохранено во временной таблице при выполнении конструкции GLOBAL IN/JOIN. |
| [`transfer_overflow_mode`](/operations/settings/settings#transfer_overflow_mode)                                       | Определяет поведение при превышении одного из лимитов объёма данных.                                                                                                          |
| [`max_rows_in_join`](/operations/settings/settings#max_rows_in_join)                                                   | Ограничивает количество строк в хеш-таблице, используемой при выполнении операций соединения таблиц.                                                                          |
| [`max_bytes_in_join`](/operations/settings/settings#max_bytes_in_join)                                                 | Максимальный размер хеш-таблицы в байтах, используемой при соединении таблиц.                                                                                                 |
| [`join_overflow_mode`](/operations/settings/settings#join_overflow_mode)                                               | Определяет, что делает ClickHouse при достижении любого из следующих ограничений для JOIN.                                                                                    |
| [`max_partitions_per_insert_block`](/operations/settings/settings#max_partitions_per_insert_block)                     | Ограничивает максимальное число партиций в одном вставляемом блоке, и если блок содержит слишком много партиций, генерируется исключение.                                     |
| [`throw_on_max_partitions_per_insert_block`](/operations/settings/settings#throw_on_max_partitions_per_insert_block)   | Позволяет управлять поведением при достижении предельного значения параметра `max_partitions_per_insert_block`.                                                               |
| [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#throw_on_max_partitions_per_insert_block)   | Максимальный объём данных, потребляемый временными файлами на диске, в байтах, для всех одновременно выполняющихся пользовательских запросов.                                 |
| [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query) | Максимальный объем данных в байтах, который могут занимать временные файлы на диске для всех одновременно выполняющихся запросов.                                             |
| [`max_sessions_for_user`](/operations/settings/settings#max_sessions_for_user)                                         | Максимальное количество одновременных сеансов для одного аутентифицированного пользователя сервера ClickHouse.                                                                |
| [`max_partitions_to_read`](/operations/settings/settings#max_partitions_to_read)                                       | Ограничивает максимальное число партиций, к которым можно обратиться в одном запросе.                                                                                         |





## Устаревшие настройки {#obsolete-settings}

:::note
Следующие настройки устарели
:::

### max_pipeline_depth {#max-pipeline-depth}

Максимальная глубина конвейера. Соответствует количеству преобразований, которые
проходит каждый блок данных при обработке запроса. Учитывается в пределах
одного сервера. При превышении глубины конвейера выбрасывается исключение.
