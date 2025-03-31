---
description: 'Настройки, ограничивающие сложность запросов.'
sidebar_label: 'Ограничения сложности запросов'
sidebar_position: 59
slug: /operations/settings/query-complexity
title: 'Ограничения сложности запросов'
---


# Ограничения сложности запросов

## Обзор {#overview}

В рамках [настроек](/operations/settings/overview), ClickHouse предлагает
возможность установить ограничения на сложность запросов. Это помогает защититься от
потенциально ресурсоемких запросов, обеспечивая более безопасное и предсказуемое
выполнение, особенно при использовании пользовательского интерфейса.

Почти все ограничения применяются только к запросам `SELECT`, а для распределенной
обработки запросов ограничения применяются на каждом сервере отдельно.

ClickHouse обычно проверяет ограничения только после полной обработки частей данных,
а не при проверке ограничений для каждой строки. Это может
привести к ситуации, когда ограничения нарушаются во время обработки части.

## Настройки `overflow_mode` {#overflow_mode_setting}

Большинство ограничений также имеют настройку `overflow_mode`, которая определяет, что происходит
при превышении лимита, и может принимать одно из двух значений:
- `throw`: выбросить исключение (по умолчанию).
- `break`: прекратить выполнение запроса и вернуть частичный результат, как если бы
           исходные данные закончились.

## Настройки `group_by_overflow_mode` {#group_by_overflow_mode_settings}

Настройка `group_by_overflow_mode` также имеет
значение `any`:
- `any`: продолжить агрегацию для ключей, которые попали в набор, но не
         добавлять новые ключи в набор.

## Список настроек {#relevant-settings}

Следующие настройки используются для применения ограничений на сложность запросов.

:::note
Ограничения на "максимальное количество чего-либо" могут принимать значение `0`,
что означает "без ограничений".
:::

| Настройка                                                                                                              | Краткое описание                                                                                                                                                |
|------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`max_memory_usage`](/operations/settings/settings#max_memory_usage)                                                   | Максимальный объем оперативной памяти для использования при выполнении запроса на одном сервере.                                                                |
| [`max_memory_usage_for_user`](/operations/settings/settings#max_memory_usage_for_user)                                 | Максимальный объем оперативной памяти для использования при выполнении запросов пользователя на одном сервере.                                                  |
| [`max_rows_to_read`](/operations/settings/settings#max_rows_to_read)                                                   | Максимальное количество строк, которые можно прочитать из таблицы при выполнении запроса.                                                                       |
| [`max_bytes_to_read`](/operations/settings/settings#max_bytes_to_read)                                                 | Максимальное количество байт (несжатых данных), которые можно прочитать из таблицы при выполнении запроса.                                                      |
| [`read_overflow_mode_leaf`](/operations/settings/settings#read_overflow_mode_leaf)                                     | Устанавливает, что происходит, когда объем прочитанных данных превышает один из лимитов листовых узлов                                                         |
| [`max_rows_to_read_leaf`](/operations/settings/settings#max_rows_to_read_leaf)                                         | Максимальное количество строк, которые можно прочитать из локальной таблицы на листовом узле при выполнении распределенного запроса                            |
| [`max_bytes_to_read_leaf`](/operations/settings/settings#max_bytes_to_read_leaf)                                       | Максимальное количество байт (несжатых данных), которые можно прочитать из локальной таблицы на листовом узле при выполнении распределенного запроса.          |
| [`read_overflow_mode_leaf`](/docs/operations/settings/settings#read_overflow_mode_leaf)                                | Устанавливает, что происходит, когда объем прочитанных данных превышает один из лимитов листовых узлов.                                                        |
| [`max_rows_to_group_by`](/operations/settings/settings#max_rows_to_group_by)                                           | Максимальное количество уникальных ключей, полученных из агрегации.                                                                                            |
| [`group_by_overflow_mode`](/operations/settings/settings#group_by_overflow_mode)                                       | Устанавливает, что происходит, когда количество уникальных ключей для агрегации превышает лимит                                                                |
| [`max_bytes_before_external_group_by`](/operations/settings/settings#max_bytes_before_external_group_by)               | Включает или отключает выполнение клауз `GROUP BY` во внешней памяти.                                                                                          |
| [`max_bytes_ratio_before_external_group_by`](/operations/settings/settings#max_bytes_ratio_before_external_group_by)   | Доля доступной памяти, разрешенная для `GROUP BY`. После достижения этого значения используется внешняя память для агрегации.                                  |
| [`max_bytes_before_external_sort`](/operations/settings/settings#max_bytes_before_external_sort)                       | Включает или отключает выполнение клауз `ORDER BY` во внешней памяти.                                                                                          |
| [`max_bytes_ratio_before_external_sort`](/operations/settings/settings#max_bytes_ratio_before_external_sort)           | Доля доступной памяти, разрешенная для `ORDER BY`. После достижения этого значения используется внешняя сортировка.                                            |
| [`max_rows_to_sort`](/operations/settings/settings#max_rows_to_sort)                                                   | Максимальное количество строк перед сортировкой. Позволяет ограничить потребление памяти при сортировке.                                                       |
| [`max_bytes_to_sort`](/operations/settings/settings#max_rows_to_sort)                                                  | Максимальное количество байт перед сортировкой.                                                                                                                |
| [`sort_overflow_mode`](/operations/settings/settings#sort_overflow_mode)                                               | Устанавливает, что происходит, если количество полученных строк перед сортировкой превышает один из лимитов.                                                   |
| [`max_result_rows`](/operations/settings/settings#max_result_rows)                                                     | Ограничивает количество строк в результате.                                                                                                                    |
| [`max_result_bytes`](/operations/settings/settings#max_result_bytes)                                                   | Ограничивает размер результата в байтах (несжатых)                                                                                                             |
| [`result_overflow_mode`](/operations/settings/settings#result_overflow_mode)                                           | Устанавливает, что делать, если объем результата превышает один из лимитов.                                                                                    |
| [`max_execution_time`](/operations/settings/settings#max_execution_time)                                               | Максимальное время выполнения запроса в секундах.                                                                                                              |
| [`timeout_overflow_mode`](/operations/settings/settings#timeout_overflow_mode)                                         | Устанавливает, что делать, если запрос выполняется дольше, чем `max_execution_time`, или предполагаемое время выполнения превышает `max_estimated_execution_time`. |
| [`max_execution_time_leaf`](/operations/settings/settings#max_execution_time_leaf)                                     | Семантически аналогично `max_execution_time`, но применяется только на листовых узлах для распределенных или удаленных запросов.                               |
| [`timeout_overflow_mode_leaf`](/operations/settings/settings#timeout_overflow_mode_leaf)                               | Устанавливает, что происходит, когда запрос на листовом узле выполняется дольше, чем `max_execution_time_leaf`.                                                |
| [`min_execution_speed`](/operations/settings/settings#min_execution_speed)                                             | Минимальная скорость выполнения в строках в секунду.                                                                                                           |
| [`min_execution_speed_bytes`](/operations/settings/settings#min_execution_speed_bytes)                                 | Минимальное количество байт выполнения в секунду.                                                                                                              |
| [`max_execution_speed`](/operations/settings/settings#max_execution_speed)                                             | Максимальное количество строк выполнения в секунду.                                                                                                            |
| [`max_execution_speed_bytes`](/operations/settings/settings#max_execution_speed_bytes)                                 | Максимальное количество байт выполнения в секунду.                                                                                                             |
| [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)     | Проверяет, что скорость выполнения не слишком медленная (не менее `min_execution_speed`), после истечения указанного времени в секундах.                       |
| [`max_estimated_execution_time`](/operations/settings/settings#max_estimated_execution_time)                           | Максимальное оценочное время выполнения запроса в секундах.                                                                                                    |
| [`max_columns_to_read`](/operations/settings/settings#max_columns_to_read)                                             | Максимальное количество столбцов, которые можно прочитать из таблицы в одном запросе.                                                                          |
| [`max_temporary_columns`](/operations/settings/settings#max_temporary_columns)                                         | Максимальное количество временных столбцов, которые должны храниться в оперативной памяти одновременно при выполнении запроса, включая константные столбцы.    |
| [`max_temporary_non_const_columns`](/operations/settings/settings#max_temporary_non_const_columns)                     | Максимальное количество временных столбцов, которые должны храниться в оперативной памяти одновременно при выполнении запроса, но без учета константных столбцов. |
| [`max_subquery_depth`](/operations/settings/settings#max_subquery_depth)                                               | Устанавливает, что происходит, если запрос имеет больше указанного количества вложенных подзапросов.                                                           |
| [`max_ast_depth`](/operations/settings/settings#max_ast_depth)                                                         | Максимальная глубина вложенности синтаксического дерева запроса.                                                                                               |
| [`max_ast_elements`](/operations/settings/settings#max_ast_elements)                                                   | Максимальное количество элементов в синтаксическом дереве запроса.                                                                                             |
| [`max_rows_in_set`](/operations/settings/settings#max_rows_in_set)                                                     | Максимальное количество строк для набора данных в клаузе IN, созданного из подзапроса.                                                                         |
| [`max_bytes_in_set`](/operations/settings/settings#max_bytes_in_set)                                                   | Максимальное количество байт (несжатых данных), используемых набором в клаузе IN, созданным из подзапроса.                                                     |
| [`set_overflow_mode`](/operations/settings/settings#max_bytes_in_set)                                                  | Устанавливает, что происходит, когда объем данных превышает один из лимитов.                                                                                   |
| [`max_rows_in_distinct`](/operations/settings/settings#max_rows_in_distinct)                                           | Максимальное количество различных строк при использовании DISTINCT.                                                                                            |
| [`max_bytes_in_distinct`](/operations/settings/settings#max_bytes_in_distinct)                                         | Максимальное количество байт состояния (в несжатых байтах) в памяти, которое используется хеш-таблицей при использовании DISTINCT.                             |
| [`distinct_overflow_mode`](/operations/settings/settings#distinct_overflow_mode)                                       | Устанавливает, что происходит, когда объем данных превышает один из лимитов.                                                                                   |
| [`max_rows_to_transfer`](/operations/settings/settings#max_rows_to_transfer)                                           | Максимальный размер (в строках), который может быть передан на удаленный сервер или сохранен во временной таблице при выполнении секции GLOBAL IN/JOIN.        |
| [`max_bytes_to_transfer`](/operations/settings/settings#max_bytes_to_transfer)                                         | Максимальное количество байт (несжатых данных), которое может быть передано на удаленный сервер или сохранено во временной таблице при выполнении секции GLOBAL IN/JOIN. |
| [`transfer_overflow_mode`](/operations/settings/settings#transfer_overflow_mode)                                       | Устанавливает, что происходит, когда объем данных превышает один из лимитов.                                                                                   |
| [`max_rows_in_join`](/operations/settings/settings#max_rows_in_join)                                                   | Ограничивает количество строк в хеш-таблице, которая используется при соединении таблиц.                                                                       |
| [`max_bytes_in_join`](/operations/settings/settings#max_bytes_in_join)                                                 | Максимальный размер в байтах хеш-таблицы, используемой при соединении таблиц.                                                                                  |
| [`join_overflow_mode`](/operations/settings/settings#join_overflow_mode)                                               | Определяет, какое действие выполняет ClickHouse при достижении любого из следующих лимитов соединения.                                                         |
| [`max_partitions_per_insert_block`](/operations/settings/settings#max_partitions_per_insert_block)                     | Ограничивает максимальное количество партиций в одном вставляемом блоке, и выбрасывается исключение, если блок содержит слишком много партиций.                |
| [`throw_on_max_partitions_per_insert_block`](/operations/settings/settings#throw_on_max_partitions_per_insert_block)   | Позволяет контролировать поведение при достижении `max_partitions_per_insert_block`.                                                                           |
| [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#throw_on_max_partitions_per_insert_block)   | Максимальный объем данных, потребляемых временными файлами на диске в байтах для всех одновременно выполняющихся запросов пользователя.                        |
| [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query) | Максимальный объем данных, потребляемых временными файлами на диске в байтах для всех одновременно выполняющихся запросов.                                     |
| [`max_sessions_for_user`](/operations/settings/settings#max_sessions_for_user)                                         | Максимальное количество одновременных сессий для аутентифицированного пользователя на сервере ClickHouse.                                                      |
| [`max_partitions_to_read`](/operations/settings/settings#max_partitions_to_read)                                       | Ограничивает максимальное количество партиций, к которым можно получить доступ в одном запросе.                                                                |

## Устаревшие настройки {#obsolete-settings}

:::note
Следующие настройки устарели
:::

### max_pipeline_depth {#max-pipeline-depth}

Максимальная глубина конвейера. Соответствует количеству преобразований, через которые 
проходит каждый блок данных при обработке запроса. Считается в пределах одного 
сервера. Если глубина конвейера больше, выбрасывается исключение.
