---
description: 'Настройки, которые ограничивают сложность запросов.'
sidebar_label: 'Ограничения на Сложность Запросов'
sidebar_position: 59
slug: /operations/settings/query-complexity
title: 'Ограничения на Сложность Запросов'
---


# Ограничения на Сложность Запросов

## Обзор {#overview}

В рамках [настроек](/operations/settings/overview) ClickHouse предлагает возможность устанавливать ограничения на сложность запросов. Это помогает защитить от потенциально ресурсоемких запросов, обеспечивая более безопасное и предсказуемое выполнение, особенно при использовании пользовательского интерфейса.

Практически все ограничения применяются только к запросам `SELECT`, а для распределенной обработки запросов ограничения применяются на каждом сервере отдельно.

ClickHouse обычно проверяет ограничения только после полной обработки частей данных, а не для каждой строки. Это может привести к ситуации, когда нарушения ограничений происходят во время обработки части.

## Настройки `overflow_mode` {#overflow_mode_setting}

У большинства ограничений также есть настройка `overflow_mode`, которая определяет, что происходит, когда лимит превышен, и может принимать одно из двух значений:
- `throw`: выбросить исключение (значение по умолчанию).
- `break`: остановить выполнение запроса и вернуть частичный результат, как если бы исходные данные исчерпались.

## Настройки `group_by_overflow_mode` {#group_by_overflow_mode_settings}

Настройка `group_by_overflow_mode` также имеет значение `any`:
- `any`: продолжить агрегацию для ключей, которые попали в набор, но не добавлять новые ключи в набор.

## Список настроек {#relevant-settings}

Следующие настройки используются для применения ограничений на сложность запросов.

:::note
Ограничения на "максимальное количество чего-либо" могут принимать значение `0`, что означает, что это "без ограничений".
:::

| Настройка                                                                                                           | Краткое описание                                                                                                                                                 |
|---------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| [`max_memory_usage`](/operations/settings/settings#max_memory_usage)                                              | Максимальное количество оперативной памяти, которое можно использовать для выполнения запроса на одном сервере.                                                 |
| [`max_memory_usage_for_user`](/operations/settings/settings#max_memory_usage_for_user)                            | Максимальное количество оперативной памяти, которое можно использовать для выполнения запросов пользователя на одном сервере.                                   |
| [`max_rows_to_read`](/operations/settings/settings#max_rows_to_read)                                              | Максимальное количество строк, которое можно прочитать из таблицы при выполнении запроса.                                                                        |
| [`max_bytes_to_read`](/operations/settings/settings#max_bytes_to_read)                                            | Максимальное количество байт (некомпрессированных данных), которое можно прочитать из таблицы при выполнении запроса.                                            |
| [`read_overflow_mode_leaf`](/operations/settings/settings#read_overflow_mode_leaf)                                | Устанавливает, что происходит, когда объем прочитанных данных превышает один из предельных значений.                                                              |
| [`max_rows_to_read_leaf`](/operations/settings/settings#max_rows_to_read_leaf)                                    | Максимальное количество строк, которое можно прочитать из локальной таблицы на узле листа при выполнении распределенного запроса.                               |
| [`max_bytes_to_read_leaf`](/operations/settings/settings#max_bytes_to_read_leaf)                                  | Максимальное количество байт (некомпрессированных данных), которое можно прочитать из локальной таблицы на узле листа при выполнении распределенного запроса.   |
| [`read_overflow_mode_leaf`](/docs/operations/settings/settings#read_overflow_mode_leaf)                           | Устанавливает, что происходит, когда объем прочитанных данных превышает один из предельных значений.                                                              |
| [`max_rows_to_group_by`](/operations/settings/settings#max_rows_to_group_by)                                       | Максимальное количество уникальных ключей, полученных из агрегации.                                                                                             |
| [`group_by_overflow_mode`](/operations/settings/settings#group_by_overflow_mode)                                   | Устанавливает, что происходит, когда количество уникальных ключей для агрегации превышает лимит.                                                                  |
| [`max_bytes_before_external_group_by`](/operations/settings/settings#max_bytes_before_external_group_by)           | Включает или отключает выполнение операторов `GROUP BY` во внешней памяти.                                                                                       |
| [`max_bytes_ratio_before_external_group_by`](/operations/settings/settings#max_bytes_ratio_before_external_group_by) | Соотношение доступной памяти, которое разрешено для `GROUP BY`. После достижения этого значения используется внешняя память для агрегации.                      |
| [`max_bytes_before_external_sort`](/operations/settings/settings#max_bytes_before_external_sort)                   | Включает или отключает выполнение операторов `ORDER BY` во внешней памяти.                                                                                       |
| [`max_bytes_ratio_before_external_sort`](/operations/settings/settings#max_bytes_ratio_before_external_sort)       | Соотношение доступной памяти, которое разрешено для `ORDER BY`. После достижения этого значения используется внешняя сортировка.                               |
| [`max_rows_to_sort`](/operations/settings/settings#max_rows_to_sort)                                              | Максимальное количество строк перед сортировкой. Позволяет ограничить потребление памяти при сортировке.                                                        |
| [`max_bytes_to_sort`](/operations/settings/settings#max_rows_to_sort)                                             | Максимальное количество байт перед сортировкой.                                                                                                                |
| [`sort_overflow_mode`](/operations/settings/settings#sort_overflow_mode)                                          | Устанавливает, что происходит, если количество строк, полученных перед сортировкой, превышает один из предельных значений.                                     |
| [`max_result_rows`](/operations/settings/settings#max_result_rows)                                                | Ограничивает количество строк в результате.                                                                                                                     |
| [`max_result_bytes`](/operations/settings/settings#max_result_bytes)                                              | Ограничивает размер результата в байтах (некомпрессированных).                                                                                                   |
| [`result_overflow_mode`](/operations/settings/settings#result_overflow_mode)                                       | Устанавливает, что делать, если объем результата превышает одно из предельных значений.                                                                           |
| [`max_execution_time`](/operations/settings/settings#max_execution_time)                                          | Максимальное время выполнения запроса в секундах.                                                                                                               |
| [`timeout_overflow_mode`](/operations/settings/settings#timeout_overflow_mode)                                    | Устанавливает, что делать, если запрос выполняется дольше, чем `max_execution_time`, или предполагаемое время выполнения превышает `max_estimated_execution_time`. |
| [`max_execution_time_leaf`](/operations/settings/settings#max_execution_time_leaf)                                | Семантически похоже на `max_execution_time`, но применяется только на узлах листа для распределенных или удаленных запросов.                                   |
| [`timeout_overflow_mode_leaf`](/operations/settings/settings#timeout_overflow_mode_leaf)                          | Устанавливает, что происходит, когда запрос на узле листа выполняется дольше, чем `max_execution_time_leaf`.                                                      |
| [`min_execution_speed`](/operations/settings/settings#min_execution_speed)                                          | Минимальная скорость выполнения в строках в секунду.                                                                                                            |
| [`min_execution_speed_bytes`](/operations/settings/settings#min_execution_speed_bytes)                            | Минимальное количество байт выполнения в секунду.                                                                                                              |
| [`max_execution_speed`](/operations/settings/settings#max_execution_speed)                                          | Максимальное количество строк выполнения в секунду.                                                                                                             |
| [`max_execution_speed_bytes`](/operations/settings/settings#max_execution_speed_bytes)                             | Максимальное количество байт выполнения в секунду.                                                                                                             |
| [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)  | Проверяет, что скорость выполнения не слишком медленная (не менее `min_execution_speed`), после истечения указанного времени в секундах.                       |
| [`max_estimated_execution_time`](/operations/settings/settings#max_estimated_execution_time)                      | Максимальное оценочное время выполнения запроса в секундах.                                                                                                      |
| [`max_columns_to_read`](/operations/settings/settings#max_columns_to_read)                                        | Максимальное количество колонок, которые можно прочитать из таблицы в одном запросе.                                                                             |
| [`max_temporary_columns`](/operations/settings/settings#max_temporary_columns)                                    | Максимальное количество временных колонок, которые должны храниться в оперативной памяти одновременно при выполнении запроса, включая постоянные колонки.       |
| [`max_temporary_non_const_columns`](/operations/settings/settings#max_temporary_non_const_columns)                 | Максимальное количество временных колонок, которые должны храниться в оперативной памяти одновременно при выполнении запроса, но без учета постоянных колонок. |
| [`max_subquery_depth`](/operations/settings/settings#max_subquery_depth)                                          | Устанавливает, что происходит, если запрос содержит больше указанного количества вложенных подзапросов.                                                        |
| [`max_ast_depth`](/operations/settings/settings#max_ast_depth)                                                    | Максимальная глубина вложения синтаксического дерева запроса.                                                                                                   |
| [`max_ast_elements`](/operations/settings/settings#max_ast_elements)                                              | Максимальное количество элементов в синтаксическом дереве запроса.                                                                                              |
| [`max_rows_in_set`](/operations/settings/settings#max_rows_in_set)                                                | Максимальное количество строк для набора данных в IN-клаузе, созданном из подзапроса.                                                                            |
| [`max_bytes_in_set`](/operations/settings/settings#max_bytes_in_set)                                              | Максимальное количество байт (некомпрессированных данных), используемое набором в IN-клаузе, созданной из подзапроса.                                          |
| [`set_overflow_mode`](/operations/settings/settings#max_bytes_in_set)                                             | Устанавливает, что происходит, когда количество данных превышает одно из предельных значений.                                                                    |
| [`max_rows_in_distinct`](/operations/settings/settings#max_rows_in_distinct)                                      | Максимальное количество различных строк при использовании DISTINCT.                                                                                              |
| [`max_bytes_in_distinct`](/operations/settings/settings#max_bytes_in_distinct)                                    | Максимальное количество байт состояния (в некомпрессированных байтах) в памяти, используемое хеш-таблицей при использовании DISTINCT.                            |
| [`distinct_overflow_mode`](/operations/settings/settings#distinct_overflow_mode)                                   | Устанавливает, что происходит, когда количество данных превышает одно из предельных значений.                                                                    |
| [`max_rows_to_transfer`](/operations/settings/settings#max_rows_to_transfer)                                      | Максимальный размер (в строках), который можно передать на удаленный сервер или сохранить во временной таблице при выполнении секции GLOBAL IN/JOIN.           |
| [`max_bytes_to_transfer`](/operations/settings/settings#max_bytes_to_transfer)                                    | Максимальное количество байт (некомпрессированных данных), которые можно передать на удаленный сервер или сохранить во временной таблице при выполнении секции GLOBAL IN/JOIN.|
| [`transfer_overflow_mode`](/operations/settings/settings#transfer_overflow_mode)                                   | Устанавливает, что происходит, когда количество данных превышает одно из предельных значений.                                                                    |
| [`max_rows_in_join`](/operations/settings/settings#max_rows_in_join)                                              | Ограничивает количество строк в хеш-таблице, используемой при соединении таблиц.                                                                                 |
| [`max_bytes_in_join`](/operations/settings/settings#max_bytes_in_join)                                            | Максимальный размер в байтах хеш-таблицы, используемой при соединении таблиц.                                                                                  |
| [`join_overflow_mode`](/operations/settings/settings#join_overflow_mode)                                          | Определяет, какое действие выполняет ClickHouse, когда достигается одно из следующих ограничений соединения.                                                    |
| [`max_partitions_per_insert_block`](/operations/settings/settings#max_partitions_per_insert_block)                  | Ограничивает максимальное количество партиций в одном вставленном блоке, и выбрасывается исключение, если блок содержит слишком много партиций.                 |
| [`throw_on_max_partitions_per_insert_block`](/operations/settings/settings#throw_on_max_partitions_per_insert_block)| Позволяет контролировать поведение при достижении `max_partitions_per_insert_block`.                                                                               |
| [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#throw_on_max_partitions_per_insert_block)  | Максимальное количество данных, потребляемых временными файлами на диске в байтах для всех одновременно выполняемых пользовательских запросов.                    |
| [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query) | Максимальное количество данных, потребляемых временными файлами на диске в байтах для всех одновременно выполняемых запросов.                                    |
| [`max_sessions_for_user`](/operations/settings/settings#max_sessions_for_user)                                     | Максимальное количество одновременных сессий на одного аутентифицированного пользователя на сервере ClickHouse.                                                  |
| [`max_partitions_to_read`](/operations/settings/settings#max_partitions_to_read)                                    | Ограничивает максимальное количество партиций, которые можно получить в одном запросе.                                                                            |

## Устаревшие настройки {#obsolete-settings}

:::note
Следующие настройки устарели.
:::

### max_pipeline_depth {#max-pipeline-depth}

Максимальная глубина конвейера. Соответствует количеству преобразований, которые проходит каждый блок данных во время обработки запроса. Считается в пределах одного сервера. Если глубина конвейера больше, выбрасывается исключение.
