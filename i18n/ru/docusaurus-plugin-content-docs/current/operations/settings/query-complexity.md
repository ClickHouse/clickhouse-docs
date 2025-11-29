---
description: 'Настройки, ограничивающие сложность запросов.'
sidebar_label: 'Ограничения сложности запросов'
sidebar_position: 59
slug: /operations/settings/query-complexity
title: 'Ограничения сложности запросов'
doc_type: 'reference'
---



# Ограничения сложности запросов {#restrictions-on-query-complexity}



## Обзор {#overview}

В рамках [настроек](/operations/settings/overview) ClickHouse предоставляет
возможность накладывать ограничения на сложность запросов. Это помогает защититься
от потенциально ресурсоёмких запросов, обеспечивая более безопасное и предсказуемое 
выполнение, особенно при использовании пользовательского интерфейса.

Почти все ограничения применяются только к запросам `SELECT`, а при распределённой 
обработке запросов ограничения применяются на каждом сервере отдельно.

Как правило, ClickHouse проверяет ограничения только после того, как части данных
были полностью обработаны, а не проверяет их для каждой строки. Это может приводить к ситуации,
когда ограничения нарушаются в процессе обработки части данных.



## Настройки `overflow_mode` {#overflow_mode_setting}

У большинства ограничений также есть настройка `overflow_mode`, которая определяет, что происходит
при превышении лимита, и может принимать одно из двух значений:
- `throw`: сгенерировать исключение (по умолчанию).
- `break`: остановить выполнение запроса и вернуть частичный результат — как если бы 
           исходные данные закончились.



## Настройки `group_by_overflow_mode` {#group_by_overflow_mode_settings}

Параметр `group_by_overflow_mode` также может принимать
значение `any`:
- `any` : продолжать агрегацию для ключей, которые попали в множество, но не 
          добавлять в множество новые ключи.



## Список настроек {#relevant-settings}

Следующие настройки используются для ограничения сложности запросов.

:::note
Ограничения вида «максимальное количество чего-либо» могут принимать значение `0`,
что означает «без ограничений».
:::



| Настройка                                                                                                              | Краткое описание                                                                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`max_memory_usage`](/operations/settings/settings#max_memory_usage)                                                   | Максимальный объём оперативной памяти, используемый при выполнении запроса на одном сервере.                                                                           |
| [`max_memory_usage_for_user`](/operations/settings/settings#max_memory_usage_for_user)                                 | Максимальный объём оперативной памяти, используемый для выполнения запросов пользователя на одном сервере.                                                             |
| [`max_rows_to_read`](/operations/settings/settings#max_rows_to_read)                                                   | Максимальное число строк, которые могут быть прочитаны из таблицы при выполнении запроса.                                                                              |
| [`max_bytes_to_read`](/operations/settings/settings#max_bytes_to_read)                                                 | Максимальное число байт несжатых данных, которое может быть прочитано из таблицы при выполнении запроса.                                                               |
| [`read_overflow_mode_leaf`](/operations/settings/settings#read_overflow_mode_leaf)                                     | Определяет поведение при превышении объёма читаемых данных одного из листовых лимитов                                                                                  |
| [`max_rows_to_read_leaf`](/operations/settings/settings#max_rows_to_read_leaf)                                         | Максимальное число строк, которое можно прочитать из локальной таблицы на листовом узле при выполнении распределённого запроса                                         |
| [`max_bytes_to_read_leaf`](/operations/settings/settings#max_bytes_to_read_leaf)                                       | Максимальное количество байт (несжатых данных), которое можно прочитать из локальной таблицы на листовом узле при выполнении распределённого запроса.                  |
| [`read_overflow_mode_leaf`](/docs/operations/settings/settings#read_overflow_mode_leaf)                                | Задаёт поведение при превышении объёма читаемых данных над одним из листовых ограничений.                                                                              |
| [`max_rows_to_group_by`](/operations/settings/settings#max_rows_to_group_by)                                           | Максимальное количество уникальных ключей, полученных при агрегации.                                                                                                   |
| [`group_by_overflow_mode`](/operations/settings/settings#group_by_overflow_mode)                                       | Задаёт, что происходит, когда число уникальных ключей агрегации превышает предел                                                                                       |
| [`max_bytes_before_external_group_by`](/operations/settings/settings#max_bytes_before_external_group_by)               | Включает или отключает выполнение конструкций `GROUP BY` во внешней памяти.                                                                                            |
| [`max_bytes_ratio_before_external_group_by`](/operations/settings/settings#max_bytes_ratio_before_external_group_by)   | Доля доступной памяти, которую может использовать `GROUP BY`. При достижении этого порога для агрегации используется внешняя память.                                   |
| [`max_bytes_before_external_sort`](/operations/settings/settings#max_bytes_before_external_sort)                       | Включает или отключает выполнение выражений `ORDER BY` во внешней памяти.                                                                                              |
| [`max_bytes_ratio_before_external_sort`](/operations/settings/settings#max_bytes_ratio_before_external_sort)           | Часть доступной памяти, которую можно использовать для `ORDER BY`. При достижении этого порога используется внешняя сортировка.                                        |
| [`max_rows_to_sort`](/operations/settings/settings#max_rows_to_sort)                                                   | Максимальное количество строк до сортировки. Позволяет ограничить потребление памяти при сортировке.                                                                   |
| [`max_bytes_to_sort`](/operations/settings/settings#max_rows_to_sort)                                                  | Максимальный объём в байтах до сортировки.                                                                                                                             |
| [`sort_overflow_mode`](/operations/settings/settings#sort_overflow_mode)                                               | Определяет поведение при превышении одного из лимитов на число строк, полученных до сортировки.                                                                        |
| [`max_result_rows`](/operations/settings/settings#max_result_rows)                                                     | Ограничивает количество строк в результате.                                                                                                                            |
| [`max_result_bytes`](/operations/settings/settings#max_result_bytes)                                                   | Ограничивает размер результата в байтах (без сжатия)                                                                                                                   |
| [`result_overflow_mode`](/operations/settings/settings#result_overflow_mode)                                           | Определяет, что делать, если объем результата превышает одно из ограничений.                                                                                           |
| [`max_execution_time`](/operations/settings/settings#max_execution_time)                                               | Максимальное время выполнения запроса в секундах.                                                                                                                      |
| [`timeout_overflow_mode`](/operations/settings/settings#timeout_overflow_mode)                                         | Определяет, что делать, если запрос выполняется дольше, чем `max_execution_time`, или расчетное время выполнения превышает `max_estimated_execution_time`.             |
| [`max_execution_time_leaf`](/operations/settings/settings#max_execution_time_leaf)                                     | По смыслу аналогичен параметру `max_execution_time`, но применяется только на листовых узлах при выполнении распределённых или удалённых запросов.                     |
| [`timeout_overflow_mode_leaf`](/operations/settings/settings#timeout_overflow_mode_leaf)                               | Определяет, что происходит, когда выполнение запроса на листовом узле превышает `max_execution_time_leaf`.                                                             |
| [`min_execution_speed`](/operations/settings/settings#min_execution_speed)                                             | Минимальная скорость выполнения (строк в секунду).                                                                                                                     |
| [`min_execution_speed_bytes`](/operations/settings/settings#min_execution_speed_bytes)                                 | Минимальное количество байт, обрабатываемых в секунду.                                                                                                                 |
| [`max_execution_speed`](/operations/settings/settings#max_execution_speed)                                             | Максимальное количество строк, обрабатываемых в секунду.                                                                                                               |
| [`max_execution_speed_bytes`](/operations/settings/settings#max_execution_speed_bytes)                                 | Максимальное число байт, обрабатываемых в секунду.                                                                                                                     |
| [`timeout_before_checking_execution_speed`](/operations/settings/settings#timeout_before_checking_execution_speed)     | Проверяет, что скорость выполнения не слишком низкая (не меньше `min_execution_speed`) после истечения указанного количества секунд.                                   |
| [`max_estimated_execution_time`](/operations/settings/settings#max_estimated_execution_time)                           | Максимальная оценка времени выполнения запроса в секундах.                                                                                                             |
| [`max_columns_to_read`](/operations/settings/settings#max_columns_to_read)                                             | Максимальное количество столбцов, которые можно прочитать из таблицы за один запрос.                                                                                   |
| [`max_temporary_columns`](/operations/settings/settings#max_temporary_columns)                                         | Максимальное количество временных столбцов, одновременно хранимых в оперативной памяти при выполнении запроса, включая константные столбцы.                            |
| [`max_temporary_non_const_columns`](/operations/settings/settings#max_temporary_non_const_columns)                     | Максимальное количество временных столбцов, которые необходимо одновременно хранить в оперативной памяти при выполнении запроса, но без учета константных столбцов.    |
| [`max_subquery_depth`](/operations/settings/settings#max_subquery_depth)                                               | Определяет, что происходит, если запрос содержит больше, чем указанное число вложенных подзапросов.                                                                    |
| [`max_ast_depth`](/operations/settings/settings#max_ast_depth)                                                         | Максимальная глубина вложенности синтаксического дерева запроса.                                                                                                       |
| [`max_ast_elements`](/operations/settings/settings#max_ast_elements)                                                   | Максимальное число элементов в синтаксическом дереве запроса.                                                                                                          |
| [`max_rows_in_set`](/operations/settings/settings#max_rows_in_set)                                                     | Максимальное количество строк в наборе данных для условия IN, сформированного подзапросом.                                                                             |
| [`max_bytes_in_set`](/operations/settings/settings#max_bytes_in_set)                                                   | Максимальное количество байт (несжатых данных), которое может занимать множество в условии IN, построенном на основе подзапроса.                                       |
| [`set_overflow_mode`](/operations/settings/settings#max_bytes_in_set)                                                  | Задаёт поведение при превышении объёма данных по одному из ограничений.                                                                                                |
| [`max_rows_in_distinct`](/operations/settings/settings#max_rows_in_distinct)                                           | Максимальное количество уникальных строк при использовании DISTINCT.                                                                                                   |
| [`max_bytes_in_distinct`](/operations/settings/settings#max_bytes_in_distinct)                                         | Максимальный размер состояния в памяти в байтах (в несжатом виде), используемый хеш-таблицей при выполнении DISTINCT.                                                  |
| [`distinct_overflow_mode`](/operations/settings/settings#distinct_overflow_mode)                                       | Задаёт поведение при превышении объёма данных по одному из лимитов.                                                                                                    |
| [`max_rows_to_transfer`](/operations/settings/settings#max_rows_to_transfer)                                           | Максимальный размер (в строках), который может быть передан на удалённый сервер или сохранён во временной таблице при выполнении конструкции GLOBAL IN/JOIN.           |
| [`max_bytes_to_transfer`](/operations/settings/settings#max_bytes_to_transfer)                                         | Максимальное количество байт несжатых данных, которое может быть передано на удалённый сервер или сохранено во временной таблице при выполнении секции GLOBAL IN/JOIN. |
| [`transfer_overflow_mode`](/operations/settings/settings#transfer_overflow_mode)                                       | Определяет поведение, когда объём данных превышает один из лимитов.                                                                                                    |
| [`max_rows_in_join`](/operations/settings/settings#max_rows_in_join)                                                   | Ограничивает количество строк в хеш-таблице, используемой при выполнении операции соединения таблиц.                                                                   |
| [`max_bytes_in_join`](/operations/settings/settings#max_bytes_in_join)                                                 | Максимальный размер (в байтах) хэш-таблицы, используемой при соединении таблиц.                                                                                        |
| [`join_overflow_mode`](/operations/settings/settings#join_overflow_mode)                                               | Определяет, какое действие выполняет ClickHouse при достижении любого из следующих ограничений для JOIN.                                                               |
| [`max_partitions_per_insert_block`](/operations/settings/settings#max_partitions_per_insert_block)                     | Ограничивает максимальное количество партиций в одном вставляемом блоке, и если блок содержит слишком много партиций, генерируется исключение.                         |
| [`throw_on_max_partitions_per_insert_block`](/operations/settings/settings#throw_on_max_partitions_per_insert_block)   | Позволяет контролировать поведение при достижении предела `max_partitions_per_insert_block`.                                                                           |
| [`max_temporary_data_on_disk_size_for_user`](/operations/settings/settings#throw_on_max_partitions_per_insert_block)   | Максимальный объём данных во временных файлах на диске (в байтах) для всех одновременно выполняющихся пользовательских запросов.                                       |
| [`max_temporary_data_on_disk_size_for_query`](/operations/settings/settings#max_temporary_data_on_disk_size_for_query) | Максимальный объём данных в байтах, занимаемый временными файлами на диске для всех одновременно выполняемых запросов.                                                 |
| [`max_sessions_for_user`](/operations/settings/settings#max_sessions_for_user)                                         | Максимальное количество одновременных сессий на сервере ClickHouse для одного аутентифицированного пользователя.                                                       |
| [`max_partitions_to_read`](/operations/settings/settings#max_partitions_to_read)                                       | Ограничивает максимальное количество разделов, к которым можно получить доступ в одном запросе.                                                                        |





## Устаревшие настройки {#obsolete-settings}

:::note
Следующие настройки устарели
:::

### max_pipeline_depth {#max-pipeline-depth}

Максимальная глубина конвейера. Соответствует количеству преобразований, которые проходит каждый 
блок данных во время обработки запроса. Считается в пределах 
одного сервера. Если глубина конвейера превышает это значение, выбрасывается исключение.
