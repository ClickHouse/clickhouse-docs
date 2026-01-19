---
title: 'Настройки форматов'
sidebar_label: 'Настройки форматов'
slug: /operations/settings/formats
toc_max_heading_level: 2
description: 'Настройки, управляющие форматами ввода и вывода.'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

{/* Сгенерировано автоматически */ }

Эти настройки генерируются автоматически из [source](https://github.com/ClickHouse/ClickHouse/blob/master/src/Core/FormatFactorySettings.h).


## allow_special_bool_values_inside_variant \{#allow_special_bool_values_inside_variant\}

<SettingsInfoBlock type="Bool" default_value="0" />

Позволяет распознавать значения Bool внутри типа Variant из специальных текстовых булевых представлений, таких как «on», «off», «enable», «disable» и т. д.

## bool_false_representation \{#bool_false_representation\}

<SettingsInfoBlock type="String" default_value="false" />

Текст, используемый для представления булева значения false в форматах TSV/CSV/Vertical/Pretty.

## bool_true_representation \{#bool_true_representation\}

<SettingsInfoBlock type="String" default_value="true" />

Строковое представление логического значения true в форматах TSV/CSV/Vertical/Pretty.

## check_conversion_from_numbers_to_enum \{#check_conversion_from_numbers_to_enum\}

<SettingsInfoBlock type="Bool" default_value="0" />

Генерировать исключение при преобразовании Numbers в Enum, если значение отсутствует в Enum.

По умолчанию отключено.

## column_names_for_schema_inference \{#column_names_for_schema_inference\}

Список названий столбцов, используемых при выводе схемы для форматов, не содержащих названий столбцов. Формат: `column1,column2,column3,...`

## date_time_64_output_format_cut_trailing_zeros_align_to_groups_of_thousands \{#date_time_64_output_format_cut_trailing_zeros_align_to_groups_of_thousands\}

<SettingsInfoBlock type="Bool" default_value="0" />

Динамически удаляет конечные нули в значениях datetime64, чтобы подстроить масштаб вывода под [0, 3, 6],
что соответствует 'seconds', 'milliseconds' и 'microseconds'.

## date_time_input_format \{#date_time_input_format\}

<SettingsInfoBlock type="DateTimeInputFormat" default_value="basic" />

Позволяет выбрать парсер текстового представления даты и времени.

Настройка не применяется к [функциям работы с датой и временем](../../sql-reference/functions/date-time-functions.md).

Возможные значения:

- `'best_effort'` — Включает расширенный режим разбора.

    ClickHouse может разбирать базовый формат `YYYY-MM-DD HH:MM:SS` и все форматы даты и времени [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601). Например, `'2018-06-08T01:02:03.000Z'`.

- `'best_effort_us'` — Аналогично `best_effort` (см. различия в [parseDateTimeBestEffortUS](../../sql-reference/functions/type-conversion-functions#parseDateTimeBestEffortUS))

- `'basic'` — Использовать базовый парсер.

    ClickHouse может разбирать только базовый формат `YYYY-MM-DD HH:MM:SS` или `YYYY-MM-DD`. Например, `2019-08-20 10:18:56` или `2019-08-20`.

Значение по умолчанию в Cloud: `'best_effort'`.

См. также:

- [Тип данных DateTime.](../../sql-reference/data-types/datetime.md)
- [Функции для работы с датами и временем.](../../sql-reference/functions/date-time-functions.md)

## date_time_output_format \{#date_time_output_format\}

<SettingsInfoBlock type="DateTimeOutputFormat" default_value="simple" />

Позволяет выбирать различные форматы вывода текстового представления даты и времени.

Возможные значения:

- `simple` — простой формат вывода.

    ClickHouse выводит дату и время в формате `YYYY-MM-DD hh:mm:ss`. Например, `2019-08-20 10:18:56`. Вычисление выполняется в часовом поясе типа данных (если он задан) или часовом поясе сервера.

- `iso` — формат вывода ISO.

    ClickHouse выводит дату и время в формате [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) `YYYY-MM-DDThh:mm:ssZ`. Например, `2019-08-20T10:18:56Z`. Обратите внимание, что вывод производится в UTC (`Z` означает UTC).

- `unix_timestamp` — формат вывода в виде Unix timestamp.

    ClickHouse выводит дату и время в формате [Unix timestamp](https://en.wikipedia.org/wiki/Unix_time). Например, `1566285536`.

См. также:

- [Тип данных DateTime.](../../sql-reference/data-types/datetime.md)
- [Функции для работы с датами и временем.](../../sql-reference/functions/date-time-functions.md)

## date_time_overflow_behavior \{#date_time_overflow_behavior\}

<SettingsInfoBlock type="DateTimeOverflowBehavior" default_value="ignore" />

Определяет поведение при преобразовании [Date](../../sql-reference/data-types/date.md), [Date32](../../sql-reference/data-types/date32.md), [DateTime](../../sql-reference/data-types/datetime.md), [DateTime64](../../sql-reference/data-types/datetime64.md) или целых чисел в Date, Date32, DateTime или DateTime64, если значение не может быть представлено в результирующем типе.

Возможные значения:

- `ignore` — Переполнения молча игнорируются. Результат не определён.
- `throw` — Генерировать исключение в случае переполнения.
- `saturate` — «Насыщать» результат. Если значение меньше минимального значения, которое может быть представлено целевым типом, результат выбирается как наименьшее представимое значение. Если значение больше максимального значения, которое может быть представлено целевым типом, результат выбирается как наибольшее представимое значение.

Значение по умолчанию: `ignore`.

## errors_output_format \{#errors_output_format\}

<SettingsInfoBlock type="String" default_value="CSV" />

Способ вывода ошибок в текстовом формате.

## format_avro_schema_registry_url \{#format_avro_schema_registry_url\}

Для формата AvroConfluent: URL-адрес Confluent Schema Registry.

## format_binary_max_array_size \{#format_binary_max_array_size\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

Максимально допустимый размер массива Array в формате RowBinary. Это предотвращает выделение большого объёма памяти в случае повреждённых данных. Значение 0 означает отсутствие ограничения.

## format_binary_max_object_size \{#format_binary_max_object_size\}

<SettingsInfoBlock type="UInt64" default_value="100000" />

Максимально допустимое число путей в одном Object для формата RowBinary типа JSON. Это предотвращает выделение большого объёма памяти в случае повреждённых данных. Значение 0 означает отсутствие ограничения.

## format_binary_max_string_size \{#format_binary_max_string_size\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

Максимально допустимый размер значения типа String в формате RowBinary. Предотвращает выделение большого объёма памяти в случае повреждённых данных. Значение 0 означает отсутствие ограничения.

## format_capn_proto_enum_comparising_mode \{#format_capn_proto_enum_comparising_mode\}

<SettingsInfoBlock type="CapnProtoEnumComparingMode" default_value="by_values" />

Как сопоставлять перечисления ClickHouse Enum и CapnProto Enum

## format_capn_proto_max_message_size \{#format_capn_proto_max_message_size\}

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

Максимальный размер одного сообщения CapnProto в байтах. Защищает от избыточного выделения памяти при ошибочных или повреждённых данных. Значение по умолчанию — 1 GiB.

## format_capn_proto_use_autogenerated_schema \{#format_capn_proto_use_autogenerated_schema\}

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать автоматически сгенерированную схему CapnProto, если параметр format_schema не задан

## format_csv_allow_double_quotes \{#format_csv_allow_double_quotes\}

<SettingsInfoBlock type="Bool" default_value="1" />

Если установлено значение true, разрешается использовать строки в двойных кавычках.

## format_csv_allow_single_quotes \{#format_csv_allow_single_quotes\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если установлено в значение true, разрешает строки в одиночных кавычках.

## format_csv_delimiter \{#format_csv_delimiter\}

<SettingsInfoBlock type="Char" default_value="," />

Символ, используемый в качестве разделителя в данных CSV. Если параметр задаётся строкой, длина строки должна быть равна 1.

## format_csv_null_representation \{#format_csv_null_representation\}

<SettingsInfoBlock type="String" default_value="\N" />

Настраиваемое представление значения NULL в формате CSV

## format_custom_escaping_rule \{#format_custom_escaping_rule\}

<SettingsInfoBlock type="EscapingRule" default_value="Escaped" />

Правило экранирования полей (для формата CustomSeparated)

## format_custom_field_delimiter \{#format_custom_field_delimiter\}

<SettingsInfoBlock type="String" default_value="	" />

Разделитель между полями (для формата CustomSeparated)

## format_custom_result_after_delimiter \{#format_custom_result_after_delimiter\}

Суффикс, добавляемый после набора результатов (для формата CustomSeparated)

## format_custom_result_before_delimiter \{#format_custom_result_before_delimiter\}

Префикс перед результирующим набором (для формата CustomSeparated)

## format_custom_row_after_delimiter \{#format_custom_row_after_delimiter\}

<SettingsInfoBlock type="String" default_value="
" />

Разделитель после поля последнего столбца (для формата CustomSeparated)

## format_custom_row_before_delimiter \{#format_custom_row_before_delimiter\}

Разделитель перед полем первого столбца (для формата CustomSeparated)

## format_custom_row_between_delimiter \{#format_custom_row_between_delimiter\}

Разделитель между строками (для формата CustomSeparated)

## format_display_secrets_in_show_and_select \{#format_display_secrets_in_show_and_select\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает отображение секретов в запросах `SHOW` и `SELECT` для таблиц, баз данных,
табличных функций и словарей.

Чтобы пользователь мог видеть секреты, у него также должны быть
включена [настройка сервера `display_secrets_in_show_and_select`](../server-configuration-parameters/settings#display_secrets_in_show_and_select)
и привилегия
[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect).

Возможные значения:

-   0 — Отключено.
-   1 — Включено.

## format_json_object_each_row_column_for_object_name \{#format_json_object_each_row_column_for_object_name\}

Имя столбца, которое будет использоваться для хранения и записи имён объектов в формате [JSONObjectEachRow](/interfaces/formats/JSONObjectEachRow).
Тип столбца должен быть String. Если значение не задано, для имён объектов будут использованы имена по умолчанию `row_{i}`.

## format_protobuf_use_autogenerated_schema \{#format_protobuf_use_autogenerated_schema\}

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать автоматически сгенерированный Protobuf, если format_schema не задан

## format_regexp \{#format_regexp\}

Регулярное выражение (для формата Regexp)

## format_regexp_escaping_rule \{#format_regexp_escaping_rule\}

<SettingsInfoBlock type="EscapingRule" default_value="Raw" />

Правило экранирования поля (для формата Regexp)

## format_regexp_skip_unmatched \{#format_regexp_skip_unmatched\}

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускать строки, которые не соответствуют регулярному выражению (для формата Regexp)

## format_schema \{#format_schema\}

Этот параметр полезен при работе с форматами, которые требуют определения схемы, такими как [Cap'n Proto](https://capnproto.org/) или [Protobuf](https://developers.google.com/protocol-buffers/). Значение зависит от формата.

## format_schema_message_name \{#format_schema_message_name\}

Определяет имя требуемого сообщения в схеме, указанной в `format_schema`.
Для сохранения совместимости с устаревшим форматом `format_schema` (`file_name:message_name`):

- Если `format_schema_message_name` не указано, имя сообщения определяется по части `message_name` устаревшего значения `format_schema`.
- Если `format_schema_message_name` указано при использовании устаревшего формата, будет сгенерирована ошибка.

## format_schema_source \{#format_schema_source\}

<SettingsInfoBlock type="String" default_value="file" />

Определяет источник `format_schema`.
Возможные значения:

- 'file' (по умолчанию): `format_schema` — это имя файла схемы, расположенного в каталоге `format_schemas`.
- 'string': `format_schema` — это буквальное содержимое схемы.
- 'query': `format_schema` — это запрос для получения схемы.
Когда `format_schema_source` установлен в значение 'query', применяются следующие условия:
- Запрос должен возвращать ровно одно значение: одну строку с одним строковым столбцом.
- Результат запроса интерпретируется как содержимое схемы.
- Этот результат кэшируется локально в каталоге `format_schemas`.
- Вы можете очистить локальный кэш с помощью команды: `SYSTEM DROP FORMAT SCHEMA CACHE FOR Files`.
- После помещения в кэш идентичные запросы не выполняются повторно для получения схемы до явной очистки кэша.
- В дополнение к локальным кэш-файлам сообщения Protobuf также кэшируются в памяти. Даже после очистки локальных кэш-файлов кэш в памяти необходимо очистить с помощью `SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf]`, чтобы полностью обновить схему.
- Выполните запрос `SYSTEM DROP FORMAT SCHEMA CACHE`, чтобы одновременно очистить кэш и для файлов кэша, и для схем сообщений Protobuf.

## format_template_resultset \{#format_template_resultset\}

Путь к файлу, содержащему строку формата для результирующего набора (для формата Template)

## format_template_resultset_format \{#format_template_resultset_format\}

Строка формата для результирующего набора (для формата Template)

## format_template_row \{#format_template_row\}

Путь к файлу, содержащему строку формата для строк (для формата Template)

## format_template_row_format \{#format_template_row_format\}

Форматная строка для строк (для формата Template)

## format_template_rows_between_delimiter \{#format_template_rows_between_delimiter\}

<SettingsInfoBlock type="String" default_value="
" />

Разделитель между строками (для формата Template)

## format_tsv_null_representation \{#format_tsv_null_representation\}

<SettingsInfoBlock type="String" default_value="\N" />

Пользовательское представление значения NULL в формате TSV

## input_format_allow_errors_num \{#input_format_allow_errors_num\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Задаёт максимально допустимое число ошибок при чтении текстовых форматов (CSV, TSV и т. д.).

Значение по умолчанию — 0.

Всегда используйте вместе с `input_format_allow_errors_ratio`.

Если при чтении строк произошла ошибка, но счётчик ошибок всё ещё меньше `input_format_allow_errors_num`, ClickHouse игнорирует строку и переходит к следующей.

Если превышены и `input_format_allow_errors_num`, и `input_format_allow_errors_ratio`, ClickHouse генерирует исключение.

## input_format_allow_errors_ratio \{#input_format_allow_errors_ratio\}

<SettingsInfoBlock type="Float" default_value="0" />

Устанавливает максимальный процент ошибок, допускаемых при чтении текстовых форматов (CSV, TSV и т.д.).
Процент ошибок задаётся числом с плавающей запятой в диапазоне от 0 до 1.

Значение по умолчанию — 0.

Всегда используйте его вместе с `input_format_allow_errors_num`.

Если при чтении строк произошла ошибка, но счётчик ошибок всё ещё меньше `input_format_allow_errors_ratio`, ClickHouse игнорирует строку и переходит к следующей.

Если и `input_format_allow_errors_num`, и `input_format_allow_errors_ratio` превышены, ClickHouse выбрасывает исключение.

## input_format_allow_seeks \{#input_format_allow_seeks\}

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает переход к произвольной позиции (seek) при чтении во входных форматах ORC/Parquet/Arrow.

По умолчанию включено.

## input_format_arrow_allow_missing_columns \{#input_format_arrow_allow_missing_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает пропуск столбцов при чтении входных форматов Arrow

## input_format_arrow_case_insensitive_column_matching \{#input_format_arrow_case_insensitive_column_matching\}

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорирует регистр при сопоставлении столбцов Arrow со столбцами в ClickHouse.

## input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference \{#input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускать столбцы с неподдерживаемыми типами при определении схемы для формата Arrow

## input_format_avro_allow_missing_fields \{#input_format_avro_allow_missing_fields\}

<SettingsInfoBlock type="Bool" default_value="0" />

Для форматов Avro и AvroConfluent: если поле отсутствует в схеме, вместо ошибки используется значение по умолчанию

## input_format_avro_null_as_default \{#input_format_avro_null_as_default\}

<SettingsInfoBlock type="Bool" default_value="0" />

Для форматов Avro/AvroConfluent: вставлять значение по умолчанию в случае `null` и столбца, не являющегося Nullable

## input_format_binary_decode_types_in_binary_format \{#input_format_binary_decode_types_in_binary_format\}

<SettingsInfoBlock type="Bool" default_value="0" />

Читать типы данных в двоичном формате вместо имен типов во входном формате RowBinaryWithNamesAndTypes

## input_format_binary_max_type_complexity \{#input_format_binary_max_type_complexity\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Максимальное количество узлов типа при декодировании двоичных типов (не глубина, а общее количество). `Map(String, UInt32)` = 3 узла. Защищает от вредоносных входных данных. 0 = без ограничений.

## input_format_binary_read_json_as_string \{#input_format_binary_read_json_as_string\}

<SettingsInfoBlock type="Bool" default_value="0" />

Считывает значения типа данных [JSON](../../sql-reference/data-types/newjson.md) как строковые значения JSON типа [String](../../sql-reference/data-types/string.md) в формате ввода RowBinary.

## input_format_bson_skip_fields_with_unsupported_types_in_schema_inference \{#input_format_bson_skip_fields_with_unsupported_types_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускать поля с неподдерживаемыми типами при определении схемы для формата BSON.

## input_format_capn_proto_skip_fields_with_unsupported_types_in_schema_inference \{#input_format_capn_proto_skip_fields_with_unsupported_types_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускать столбцы с неподдерживаемыми типами при определении схемы для формата CapnProto

## input_format_csv_allow_cr_end_of_line \{#input_format_csv_allow_cr_end_of_line\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если установлено значение true, \\r будет разрешён в конце строки, если за ним не следует 

## input_format_csv_allow_variable_number_of_columns \{#input_format_csv_allow_variable_number_of_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускать дополнительные столбцы во входных данных CSV (если файл содержит больше столбцов, чем ожидается) и считать отсутствующие поля во входных данных CSV значениями по умолчанию

## input_format_csv_allow_whitespace_or_tab_as_delimiter \{#input_format_csv_allow_whitespace_or_tab_as_delimiter\}

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает использовать пробелы и символ табуляции (\\t) в качестве разделителя полей в строках CSV.

## input_format_csv_arrays_as_nested_csv \{#input_format_csv_arrays_as_nested_csv\}

<SettingsInfoBlock type="Bool" default_value="0" />

При чтении Array из CSV предполагается, что его элементы были сериализованы во вложенном формате CSV, а затем заключены в строку. Пример: \"[\"\"Hello\"\", \"\"world\"\", \"\"42\"\"\"\" TV\"\"]\". Квадратные скобки вокруг массива можно опустить.

## input_format_csv_deserialize_separate_columns_into_tuple \{#input_format_csv_deserialize_separate_columns_into_tuple\}

<SettingsInfoBlock type="Bool" default_value="1" />

Если установлено значение true, отдельные столбцы в формате CSV могут быть десериализованы в столбец типа Tuple.

## input_format_csv_detect_header \{#input_format_csv_detect_header\}

<SettingsInfoBlock type="Bool" default_value="1" />

Автоматически определять строку заголовка с именами и типами в CSV-данных

## input_format_csv_empty_as_default \{#input_format_csv_empty_as_default\}

<SettingsInfoBlock type="Bool" default_value="1" />

Обрабатывать пустые поля во входных данных CSV как значения по умолчанию.

## input_format_csv_enum_as_number \{#input_format_csv_enum_as_number\}

<SettingsInfoBlock type="Bool" default_value="0" />

Обрабатывать значения enum, вставляемые в форматах CSV, как индексы enum

## input_format_csv_skip_first_lines \{#input_format_csv_skip_first_lines\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Пропускает указанное количество строк в начале входных данных в формате CSV

## input_format_csv_skip_trailing_empty_lines \{#input_format_csv_skip_trailing_empty_lines\}

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускать пустые строки в конце файла в формате CSV

## input_format_csv_trim_whitespaces \{#input_format_csv_trim_whitespaces\}

<SettingsInfoBlock type="Bool" default_value="1" />

Удаляет пробелы и символы табуляции (\\t) в начале и в конце строк CSV

## input_format_csv_try_infer_numbers_from_strings \{#input_format_csv_try_infer_numbers_from_strings\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если включено, при определении схемы ClickHouse будет пытаться распознавать числа в строковых полях.
Это может быть полезно, если данные CSV содержат заключённые в кавычки числа типа UInt64.

По умолчанию отключено.

## input_format_csv_try_infer_strings_from_quoted_tuples \{#input_format_csv_try_infer_strings_from_quoted_tuples\}

<SettingsInfoBlock type="Bool" default_value="1" />

Интерпретировать заключённые в кавычки кортежи во входных данных как значения типа String.

## input_format_csv_use_best_effort_in_schema_inference \{#input_format_csv_use_best_effort_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать дополнительные эвристики и приёмы для определения схемы в формате CSV

## input_format_csv_use_default_on_bad_values \{#input_format_csv_use_default_on_bad_values\}

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает устанавливать для столбца значение по умолчанию, если десериализация поля CSV завершилась неудачно из‑за некорректного значения

## input_format_custom_allow_variable_number_of_columns \{#input_format_custom_allow_variable_number_of_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорировать лишние столбцы во входных данных CustomSeparated (если в файле больше столбцов, чем ожидается) и интерпретировать отсутствующие поля во входных данных CustomSeparated как значения по умолчанию.

## input_format_custom_detect_header \{#input_format_custom_detect_header\}

<SettingsInfoBlock type="Bool" default_value="1" />

Автоматически распознавать заголовок с именами и типами в формате CustomSeparated

## input_format_custom_skip_trailing_empty_lines \{#input_format_custom_skip_trailing_empty_lines\}

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускать пустые строки в конце в формате CustomSeparated

## input_format_defaults_for_omitted_fields \{#input_format_defaults_for_omitted_fields\}

<SettingsInfoBlock type="Bool" default_value="1" />

При выполнении запросов `INSERT` эта настройка заменяет пропущенные входные значения столбцов значениями по умолчанию соответствующих столбцов. Эта опция применяется к форматам [JSONEachRow](/interfaces/formats/JSONEachRow) (и другим JSON-форматам), [CSV](/interfaces/formats/CSV), [TabSeparated](/interfaces/formats/TabSeparated), [TSKV](/interfaces/formats/TSKV), [Parquet](/interfaces/formats/Parquet), [Arrow](/interfaces/formats/Arrow), [Avro](/interfaces/formats/Avro), [ORC](/interfaces/formats/ORC), [Native](/interfaces/formats/Native), а также к форматам с суффиксами `WithNames`/`WithNamesAndTypes`.

:::note
Когда эта опция включена, с сервера на клиент отправляются расширенные метаданные таблицы. Это требует дополнительных вычислительных ресурсов на сервере и может снизить производительность.
:::

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## input_format_force_null_for_omitted_fields \{#input_format_force_null_for_omitted_fields\}

<SettingsInfoBlock type="Bool" default_value="0" />

Принудительно инициализировать пропущенные поля значением NULL

## input_format_hive_text_allow_variable_number_of_columns \{#input_format_hive_text_allow_variable_number_of_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

Игнорировать дополнительные столбцы во входных данных формата Hive Text (если в файле больше столбцов, чем ожидается) и трактовать отсутствующие поля во входных данных Hive Text как значения по умолчанию.

## input_format_hive_text_collection_items_delimiter \{#input_format_hive_text_collection_items_delimiter\}

<SettingsInfoBlock type="Char" default_value="" />

Разделитель между элементами коллекции (array или map) в текстовом файле Hive

## input_format_hive_text_fields_delimiter \{#input_format_hive_text_fields_delimiter\}

<SettingsInfoBlock type="Char" default_value="" />

Разделитель между полями в текстовых файлах Hive

## input_format_hive_text_map_keys_delimiter \{#input_format_hive_text_map_keys_delimiter\}

<SettingsInfoBlock type="Char" default_value="" />

Разделитель между парой ключ/значение в карте (map) в текстовом файле Hive

## input_format_import_nested_json \{#input_format_import_nested_json\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает возможность вставки JSON-данных со вложенными объектами.

Поддерживаемые форматы:

- [JSONEachRow](/interfaces/formats/JSONEachRow)

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

См. также:

- [Использование вложенных структур](/integrations/data-formats/json/other-formats#accessing-nested-json-objects) с форматом `JSONEachRow`.

## input_format_ipv4_default_on_conversion_error \{#input_format_ipv4_default_on_conversion_error\}

<SettingsInfoBlock type="Bool" default_value="0" />

При десериализации IPv4 будут использоваться значения по умолчанию вместо генерации исключения при ошибке преобразования.

Отключено по умолчанию.

## input_format_ipv6_default_on_conversion_error \{#input_format_ipv6_default_on_conversion_error\}

<SettingsInfoBlock type="Bool" default_value="0" />

При десериализации значений IPv6 при ошибке преобразования вместо выбрасывания исключения будут использоваться значения по умолчанию.

По умолчанию параметр отключен.

## input_format_json_compact_allow_variable_number_of_columns \{#input_format_json_compact_allow_variable_number_of_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает переменное число столбцов в строках во входных форматах JSONCompact/JSONCompactEachRow.
Игнорирует лишние столбцы в строках, где столбцов больше, чем ожидается, и рассматривает отсутствующие столбцы как значения по умолчанию.

По умолчанию отключено.

## input_format_json_defaults_for_missing_elements_in_named_tuple \{#input_format_json_defaults_for_missing_elements_in_named_tuple\}

<SettingsInfoBlock type="Bool" default_value="1" />

Вставляет значения по умолчанию для отсутствующих элементов в JSON-объекте при разборе именованного кортежа.
Эта настройка работает только при включённой настройке `input_format_json_named_tuples_as_objects`.

По умолчанию включена.

## input_format_json_empty_as_default \{#input_format_json_empty_as_default\}

<SettingsInfoBlock type="Bool" default_value="0" />

Когда этот параметр включён, пустые поля во входных данных JSON заменяются значениями по умолчанию. Для сложных выражений по умолчанию также должен быть включён `input_format_defaults_for_omitted_fields`.

Возможные значения:

+ 0 — выключено.
+ 1 — включено.

## input_format_json_ignore_unknown_keys_in_named_tuple \{#input_format_json_ignore_unknown_keys_in_named_tuple\}

<SettingsInfoBlock type="Bool" default_value="1" />

Игнорирует неизвестные ключи в JSON-объекте для именованных кортежей.

Включено по умолчанию.

## input_format_json_ignore_unnecessary_fields \{#input_format_json_ignore_unnecessary_fields\}

<SettingsInfoBlock type="Bool" default_value="1" />

Игнорировать ненужные поля и не разбирать их. Включение этой настройки может привести к тому, что исключения не будут генерироваться для JSON-строк с некорректным форматом или с дублирующимися полями.

## input_format_json_infer_array_of_dynamic_from_array_of_different_types \{#input_format_json_infer_array_of_dynamic_from_array_of_different_types\}

<SettingsInfoBlock type="Bool" default_value="1" />

Если параметр включен, при определении схемы ClickHouse будет использовать тип Array(Dynamic) для JSON-массивов, содержащих значения разных типов данных.

Пример:

```sql
SET input_format_json_infer_array_of_dynamic_from_array_of_different_types=1;
DESC format(JSONEachRow, '{"a" : [42, "hello", [1, 2, 3]]}');
```

```response
┌─name─┬─type───────────┐
│ a    │ Array(Dynamic) │
└──────┴────────────────┘
```

```sql
SET input_format_json_infer_array_of_dynamic_from_array_of_different_types=0;
DESC format(JSONEachRow, '{"a" : [42, "hello", [1, 2, 3]]}');
```

```response
┌─name─┬─type─────────────────────────────────────────────────────────────┐
│ a    │ Tuple(Nullable(Int64), Nullable(String), Array(Nullable(Int64))) │
└──────┴──────────────────────────────────────────────────────────────────┘
```

Включён по умолчанию.


## input_format_json_infer_incomplete_types_as_strings \{#input_format_json_infer_incomplete_types_as_strings\}

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает использовать тип String для JSON-ключей, которые содержат только `Null`/`{}`/`[]` в выборке данных при выводе схемы.
В JSON-форматах любое значение может быть считано как String, что позволяет избежать ошибок вида `Cannot determine type for column 'column_name' by first 25000 rows of data, most likely this column contains only Nulls or empty Arrays/Maps` при выводе схемы
за счёт использования типа String для ключей с неизвестными типами.

Пример:

```sql
SET input_format_json_infer_incomplete_types_as_strings = 1, input_format_json_try_infer_named_tuples_from_objects = 1;
DESCRIBE format(JSONEachRow, '{"obj" : {"a" : [1,2,3], "b" : "hello", "c" : null, "d" : {}, "e" : []}}');
SELECT * FROM format(JSONEachRow, '{"obj" : {"a" : [1,2,3], "b" : "hello", "c" : null, "d" : {}, "e" : []}}');
```

Результат:

```
┌─name─┬─type───────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Array(Nullable(Int64)), b Nullable(String), c Nullable(String), d Nullable(String), e Array(Nullable(String))) │              │                    │         │                  │                │
└──────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘

┌─obj────────────────────────────┐
│ ([1,2,3],'hello',NULL,'{}',[]) │
└────────────────────────────────┘
```

Включено по умолчанию.


## input_format_json_map_as_array_of_tuples \{#input_format_json_map_as_array_of_tuples\}

<SettingsInfoBlock type="Bool" default_value="0" />

Десериализует столбцы типа Map как JSON-массивы кортежей.

По умолчанию отключено.

## input_format_json_max_depth \{#input_format_json_max_depth\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Максимальная глубина вложенности поля в JSON. Это не жёсткое ограничение, его не требуется строго соблюдать.

## input_format_json_named_tuples_as_objects \{#input_format_json_named_tuples_as_objects\}

<SettingsInfoBlock type="Bool" default_value="1" />

Разбирать столбцы именованных кортежей как JSON-объекты.

Включено по умолчанию.

## input_format_json_read_arrays_as_strings \{#input_format_json_read_arrays_as_strings\}

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает разбирать массивы JSON как строки во входных JSON-форматах.

Пример:

```sql
SET input_format_json_read_arrays_as_strings = 1;
SELECT arr, toTypeName(arr), JSONExtractArrayRaw(arr)[3] from format(JSONEachRow, 'arr String', '{"arr" : [1, "Hello", [1,2,3]]}');
```

Результат:

```
┌─arr───────────────────┬─toTypeName(arr)─┬─arrayElement(JSONExtractArrayRaw(arr), 3)─┐
│ [1, "Hello", [1,2,3]] │ String          │ [1,2,3]                                   │
└───────────────────────┴─────────────────┴───────────────────────────────────────────┘
```

По умолчанию включено.


## input_format_json_read_bools_as_numbers \{#input_format_json_read_bools_as_numbers\}

<SettingsInfoBlock type="Bool" default_value="1" />

Позволяет интерпретировать логические значения как числа во входных форматах JSON.

Включено по умолчанию.

## input_format_json_read_bools_as_strings \{#input_format_json_read_bools_as_strings\}

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает разбор логических значений, представленных в виде строк, во входных форматах JSON.

Включен по умолчанию.

## input_format_json_read_numbers_as_strings \{#input_format_json_read_numbers_as_strings\}

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает интерпретировать числа как строки во входных форматах JSON.

Включено по умолчанию.

## input_format_json_read_objects_as_strings \{#input_format_json_read_objects_as_strings\}

<SettingsInfoBlock type="Bool" default_value="1" />

Позволяет парсить JSON-объекты как строки в JSON-форматах ввода.

Пример:

```sql
SET input_format_json_read_objects_as_strings = 1;
CREATE TABLE test (id UInt64, obj String, date Date) ENGINE=Memory();
INSERT INTO test FORMAT JSONEachRow {"id" : 1, "obj" : {"a" : 1, "b" : "Hello"}, "date" : "2020-01-01"};
SELECT * FROM test;
```

Результат:

```
┌─id─┬─obj──────────────────────┬───────date─┐
│  1 │ {"a" : 1, "b" : "Hello"} │ 2020-01-01 │
└────┴──────────────────────────┴────────────┘
```

Включён по умолчанию.


## input_format_json_throw_on_bad_escape_sequence \{#input_format_json_throw_on_bad_escape_sequence\}

<SettingsInfoBlock type="Bool" default_value="1" />

Выбрасывает исключение, если JSON-строка содержит некорректную последовательность экранирования во входных JSON-форматах. Если параметр отключён, такие последовательности останутся в данных без изменений.

По умолчанию включён.

## input_format_json_try_infer_named_tuples_from_objects \{#input_format_json_try_infer_named_tuples_from_objects\}

<SettingsInfoBlock type="Bool" default_value="1" />

Если параметр включен, при определении схемы ClickHouse попытается вывести именованный Tuple из JSON-объектов.
Полученный именованный Tuple будет содержать все элементы из всех соответствующих JSON-объектов из примера данных.

Пример:

```sql
SET input_format_json_try_infer_named_tuples_from_objects = 1;
DESC format(JSONEachRow, '{"obj" : {"a" : 42, "b" : "Hello"}}, {"obj" : {"a" : 43, "c" : [1, 2, 3]}}, {"obj" : {"d" : {"e" : 42}}}')
```

Результат:

```
┌─name─┬─type───────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
│ obj  │ Tuple(a Nullable(Int64), b Nullable(String), c Array(Nullable(Int64)), d Tuple(e Nullable(Int64))) │              │                    │         │                  │                │
└──────┴────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
```

Включено по умолчанию.


## input_format_json_try_infer_numbers_from_strings \{#input_format_json_try_infer_numbers_from_strings\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если параметр включён, при определении схемы ClickHouse будет пытаться выводить числовые типы из строковых полей.
Это может быть полезно, если JSON-данные содержат заключённые в кавычки числа типа UInt64.

По умолчанию параметр отключён.

## input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects \{#input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects\}

<SettingsInfoBlock type="Bool" default_value="0" />

Использовать тип String вместо генерации исключения в случае неоднозначных путей в JSON-объектах при определении типов именованных кортежей

## input_format_json_validate_types_from_metadata \{#input_format_json_validate_types_from_metadata\}

<SettingsInfoBlock type="Bool" default_value="1" />

Для форматов ввода JSON/JSONCompact/JSONColumnsWithMetadata, если для этого параметра установлено значение 1,
типы из метаданных во входных данных будут сравниваться с типами соответствующих столбцов таблицы.

Параметр включен по умолчанию.

## input_format_max_block_size_bytes \{#input_format_max_block_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает размер блоков, формируемых при разборе данных во входных форматах, в байтах. Используется во входных форматах, основанных на строках, когда блок формируется на стороне ClickHouse.
0 означает отсутствие ограничения по размеру в байтах.

## input_format_max_bytes_to_read_for_schema_inference \{#input_format_max_bytes_to_read_for_schema_inference\}

<SettingsInfoBlock type="UInt64" default_value="33554432" />

Максимальный объём данных в байтах, считываемый для автоматического определения схемы.

## input_format_max_rows_to_read_for_schema_inference \{#input_format_max_rows_to_read_for_schema_inference\}

<SettingsInfoBlock type="UInt64" default_value="25000" />

Максимальное количество строк данных, считываемых для автоматического определения схемы.

## input_format_msgpack_number_of_columns \{#input_format_msgpack_number_of_columns\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Количество столбцов во вставляемых данных в формате MsgPack. Используется для автоматического определения схемы на основе данных.

## input_format_mysql_dump_map_column_names \{#input_format_mysql_dump_map_column_names\}

<SettingsInfoBlock type="Bool" default_value="1" />

Сопоставлять столбцы таблицы в дампе MySQL со столбцами таблицы ClickHouse по именам

## input_format_mysql_dump_table_name \{#input_format_mysql_dump_table_name\}

Имя таблицы в дампе MySQL, из которой считывать данные

## input_format_native_allow_types_conversion \{#input_format_native_allow_types_conversion\}

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает преобразование типов данных во входном формате Native

## input_format_native_decode_types_in_binary_format \{#input_format_native_decode_types_in_binary_format\}

<SettingsInfoBlock type="Bool" default_value="0" />

Считывать типы данных в двоичном формате вместо их названий во входном формате Native

## input_format_null_as_default \{#input_format_null_as_default\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает инициализацию полей [NULL](/sql-reference/syntax#literals) [значениями по умолчанию](/sql-reference/statements/create/table#default_values), если тип данных этих полей не является [Nullable](/sql-reference/data-types/nullable).
Если тип столбца не Nullable и эта настройка отключена, вставка `NULL` приводит к исключению. Если тип столбца Nullable, то значения `NULL` вставляются как есть, независимо от этой настройки.

Эта настройка применима к большинству форматов ввода.

Для сложных выражений по умолчанию необходимо также включить `input_format_defaults_for_omitted_fields`.

Возможные значения:

- 0 — Вставка `NULL` в столбец с типом, не поддерживающим Nullable, приводит к исключению.
- 1 — Поля `NULL` инициализируются значениями столбца по умолчанию.

## input_format_orc_allow_missing_columns \{#input_format_orc_allow_missing_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает отсутствие столбцов при чтении входных форматов ORC

## input_format_orc_case_insensitive_column_matching \{#input_format_orc_case_insensitive_column_matching\}

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорировать регистр при сопоставлении столбцов ORC со столбцами ClickHouse.

## input_format_orc_dictionary_as_low_cardinality \{#input_format_orc_dictionary_as_low_cardinality\}

<SettingsInfoBlock type="Bool" default_value="1" />

При чтении файлов ORC трактовать закодированные словарём столбцы формата ORC как столбцы типа LowCardinality.

## input_format_orc_filter_push_down \{#input_format_orc_filter_push_down\}

<SettingsInfoBlock type="Bool" default_value="1" />

При чтении файлов ORC можно пропускать целые страйпы или группы строк на основе выражений WHERE/PREWHERE, статистик min/max или фильтра Блума из метаданных ORC.

## input_format_orc_reader_time_zone_name \{#input_format_orc_reader_time_zone_name\}

<SettingsInfoBlock type="String" default_value="GMT" />

Имя часового пояса, используемого ридером строк ORC; по умолчанию используется GMT.

## input_format_orc_row_batch_size \{#input_format_orc_row_batch_size\}

<SettingsInfoBlock type="Int64" default_value="100000" />

Размер пакета строк при чтении страйпов ORC.

## input_format_orc_skip_columns_with_unsupported_types_in_schema_inference \{#input_format_orc_skip_columns_with_unsupported_types_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускать столбцы с неподдерживаемыми типами при автоматическом определении схемы для формата ORC

## input_format_orc_use_fast_decoder \{#input_format_orc_use_fast_decoder\}

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать более быструю реализацию декодера ORC.

## input_format_parallel_parsing \{#input_format_parallel_parsing\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает параллельный разбор форматов данных с сохранением порядка. Поддерживается только для форматов [TabSeparated (TSV)](/interfaces/formats/TabSeparated), [TSKV](/interfaces/formats/TSKV), [CSV](/interfaces/formats/CSV) и [JSONEachRow](/interfaces/formats/JSONEachRow).

Возможные значения:

- 1 — включено.
- 0 — отключено.

## input_format_parquet_allow_geoparquet_parser \{#input_format_parquet_allow_geoparquet_parser\}

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать парсер геостолбцов для преобразования Array(UInt8) в типы Point/Linestring/Polygon/MultiLineString/MultiPolygon.

## input_format_parquet_allow_missing_columns \{#input_format_parquet_allow_missing_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает отсутствие столбцов при чтении данных в формате Parquet

## input_format_parquet_bloom_filter_push_down \{#input_format_parquet_bloom_filter_push_down\}

<SettingsInfoBlock type="Bool" default_value="1" />

При чтении файлов Parquet целые группы строк пропускаются на основе выражений WHERE и bloom-фильтра из метаданных Parquet.

## input_format_parquet_case_insensitive_column_matching \{#input_format_parquet_case_insensitive_column_matching\}

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорировать регистр при сопоставлении столбцов Parquet со столбцами CH.

## input_format_parquet_enable_json_parsing \{#input_format_parquet_enable_json_parsing\}

<SettingsInfoBlock type="Bool" default_value="1" />

При чтении файлов Parquet интерпретировать JSON-столбцы как столбцы JSON ClickHouse.

## input_format_parquet_enable_row_group_prefetch \{#input_format_parquet_enable_row_group_prefetch\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает предварительную выборку групп строк при разборе формата Parquet. В настоящее время предварительная выборка возможна только при однопоточном разборе.

## input_format_parquet_filter_push_down \{#input_format_parquet_filter_push_down\}

<SettingsInfoBlock type="Bool" default_value="1" />

При чтении файлов Parquet позволяет пропускать целые группы строк на основе выражений WHERE/PREWHERE и min/max статистики в метаданных Parquet.

## input_format_parquet_local_file_min_bytes_for_seek \{#input_format_parquet_local_file_min_bytes_for_seek\}

<SettingsInfoBlock type="UInt64" default_value="8192" />

Минимальное количество байт при локальном чтении файла, начиная с которого выполняется seek вместо чтения с пропуском данных во входном формате Parquet

## input_format_parquet_local_time_as_utc \{#input_format_parquet_local_time_as_utc\}

<SettingsInfoBlock type="Bool" default_value="1" />

Определяет тип данных, используемый при выводе схемы для временных меток Parquet с isAdjustedToUTC=false. Если true: DateTime64(..., 'UTC'), если false: DateTime64(...). Ни один из вариантов не является полностью корректным, поскольку в ClickHouse нет типа данных для локального времени по настенным часам. На первый взгляд парадоксально, но значение true, скорее всего, является менее некорректным вариантом, потому что форматирование временной метки с 'UTC' как String приведёт к отображению корректного локального времени.

## input_format_parquet_max_block_size \{#input_format_parquet_max_block_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="65409" />

Максимальный размер блока для ридера Parquet.

## input_format_parquet_memory_high_watermark \{#input_format_parquet_memory_high_watermark\}

<SettingsInfoBlock type="UInt64" default_value="4294967296" />

Приблизительное ограничение по объёму памяти для считывателя Parquet v3. Ограничивает количество групп строк или столбцов, которые можно читать параллельно. При чтении нескольких файлов в одном запросе лимит применяется к общему использованию памяти всеми этими файлами.

## input_format_parquet_memory_low_watermark \{#input_format_parquet_memory_low_watermark\}

<SettingsInfoBlock type="UInt64" default_value="2097152" />

Включает более агрессивное упреждающее чтение, если использование памяти ниже заданного порога. Может быть полезно, например, когда по сети нужно прочитать много небольших bloom-фильтров.

## input_format_parquet_page_filter_push_down \{#input_format_parquet_page_filter_push_down\}

<SettingsInfoBlock type="Bool" default_value="1" />

Пропускать страницы, используя минимальные и максимальные значения из индекса столбца.

## input_format_parquet_prefer_block_bytes \{#input_format_parquet_prefer_block_bytes\}

<SettingsInfoBlock type="UInt64" default_value="16744704" />

Средний размер блока в байтах, формируемого Parquet-ридером

## input_format_parquet_preserve_order \{#input_format_parquet_preserve_order\}

<SettingsInfoBlock type="Bool" default_value="0" />

Избегает изменения порядка строк при чтении файлов Parquet. Не рекомендуется, поскольку порядок строк обычно не гарантируется, и другие части конвейера обработки запроса могут его изменить. Вместо этого используйте `ORDER BY _row_number`.

## input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference \{#input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускать столбцы с неподдерживаемыми типами при определении схемы для формата Parquet

## input_format_parquet_use_native_reader_v3 \{#input_format_parquet_use_native_reader_v3\}

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать ридер Parquet v3.

## input_format_parquet_use_offset_index \{#input_format_parquet_use_offset_index\}

<SettingsInfoBlock type="Bool" default_value="1" />

Небольшое изменение в способе чтения страниц из файла Parquet при отсутствии фильтрации страниц.

## input_format_parquet_verify_checksums \{#input_format_parquet_verify_checksums\}

<SettingsInfoBlock type="Bool" default_value="1" />

Проверяет контрольные суммы страниц при чтении файлов Parquet.

## input_format_protobuf_flatten_google_wrappers \{#input_format_protobuf_flatten_google_wrappers\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает использование обёрток Google для обычных невложенных столбцов, например google.protobuf.StringValue 'str' для столбца типа String 'str'. Для столбцов типа Nullable пустые обёртки интерпретируются как значения по умолчанию, а отсутствующие — как NULL.

## input_format_protobuf_oneof_presence \{#input_format_protobuf_oneof_presence\}

<SettingsInfoBlock type="Bool" default_value="0" />

Указывает, какое поле protobuf oneof было найдено, путем установки значения перечисления в специальном столбце.

## input_format_protobuf_skip_fields_with_unsupported_types_in_schema_inference \{#input_format_protobuf_skip_fields_with_unsupported_types_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускать поля с неподдерживаемыми типами при определении схемы для формата Protobuf

## input_format_record_errors_file_path \{#input_format_record_errors_file_path\}

Путь к файлу для записи ошибок, возникающих при чтении текстовых форматов (CSV, TSV).

## input_format_skip_unknown_fields \{#input_format_skip_unknown_fields\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает пропуск вставки дополнительных данных.

При записи данных ClickHouse вызывает исключение, если входные данные содержат столбцы, которых нет в целевой таблице. Если пропуск включён, ClickHouse не вставляет дополнительные данные и не вызывает исключение.

Поддерживаемые форматы:

- [JSONEachRow](/interfaces/formats/JSONEachRow) (и другие форматы JSON)
- [BSONEachRow](/interfaces/formats/BSONEachRow) (и другие форматы JSON)
- [TSKV](/interfaces/formats/TSKV)
- Все форматы с суффиксами WithNames/WithNamesAndTypes
- [MySQLDump](/interfaces/formats/MySQLDump)
- [Native](/interfaces/formats/Native)

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## input_format_try_infer_dates \{#input_format_try_infer_dates\}

<SettingsInfoBlock type="Bool" default_value="1" />

Если параметр включён, ClickHouse будет пытаться определять тип `Date` по строковым полям при выводе схемы для текстовых форматов. Если все значения столбца во входных данных были успешно разобраны как даты, результирующий тип будет `Date`, если хотя бы одно значение не было разобрано как дата, результирующий тип будет `String`.

Включено по умолчанию.

## input_format_try_infer_datetimes \{#input_format_try_infer_datetimes\}

<SettingsInfoBlock type="Bool" default_value="1" />

Если параметр включен, ClickHouse будет пытаться определять тип `DateTime64` на основе строковых полей при автоматическом выводе схемы для текстовых форматов. Если все значения столбца во входных данных были успешно разобраны как дата-время, результирующим типом будет `DateTime64`; если хотя бы одно значение не удалось разобрать как дату-время, результирующим типом будет `String`.

По умолчанию включено.

## input_format_try_infer_datetimes_only_datetime64 \{#input_format_try_infer_datetimes_only_datetime64\}

<SettingsInfoBlock type="Bool" default_value="0" />

Когда `input_format_try_infer_datetimes` включён, следует определять только типы `DateTime64`, но не `DateTime`.

## input_format_try_infer_exponent_floats \{#input_format_try_infer_exponent_floats\}

<SettingsInfoBlock type="Bool" default_value="0" />

Пытаться выводить тип вещественных чисел для значений в экспоненциальной нотации при выводе схемы в текстовых форматах (кроме JSON, где числа с экспонентой всегда распознаются как вещественные)

## input_format_try_infer_integers \{#input_format_try_infer_integers\}

<SettingsInfoBlock type="Bool" default_value="1" />

Если параметр включен, ClickHouse попытается определять целые числа вместо чисел с плавающей запятой при выводе схемы для текстовых форматов. Если все числа в столбце входных данных являются целыми, результирующим типом будет `Int64`, если хотя бы одно число является числом с плавающей запятой, результирующим типом будет `Float64`.

Включено по умолчанию.

## input_format_try_infer_variants \{#input_format_try_infer_variants\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если параметр включен, ClickHouse будет пытаться определять тип [`Variant`](../../sql-reference/data-types/variant.md) при автоопределении схемы для текстовых форматов, когда для элементов столбца/массива существует более одного возможного типа.

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## input_format_tsv_allow_variable_number_of_columns \{#input_format_tsv_allow_variable_number_of_columns\}

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорирует лишние столбцы во входных данных TSV (если в файле больше столбцов, чем ожидается) и рассматривает отсутствующие поля во входных данных TSV как значения по умолчанию.

## input_format_tsv_crlf_end_of_line \{#input_format_tsv_crlf_end_of_line\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если установлено значение true, функция file будет читать файлы в формате TSV с окончаниями строк \\r\\n вместо \\n.

## input_format_tsv_detect_header \{#input_format_tsv_detect_header\}

<SettingsInfoBlock type="Bool" default_value="1" />

Автоматически определять заголовок с именами и типами в формате TSV

## input_format_tsv_empty_as_default \{#input_format_tsv_empty_as_default\}

<SettingsInfoBlock type="Bool" default_value="0" />

Обрабатывать пустые поля во входных данных TSV как значения по умолчанию.

## input_format_tsv_enum_as_number \{#input_format_tsv_enum_as_number\}

<SettingsInfoBlock type="Bool" default_value="0" />

Обрабатывать вставляемые значения типа Enum в форматах TSV как числовые индексы перечисления.

## input_format_tsv_skip_first_lines \{#input_format_tsv_skip_first_lines\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Пропускает указанное количество строк в начале входных данных в формате TSV

## input_format_tsv_skip_trailing_empty_lines \{#input_format_tsv_skip_trailing_empty_lines\}

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускать пустые строки в конце файла в формате TSV

## input_format_tsv_use_best_effort_in_schema_inference \{#input_format_tsv_use_best_effort_in_schema_inference\}

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать различные приемы и эвристики для определения схемы в формате TSV

## input_format_values_accurate_types_of_literals \{#input_format_values_accurate_types_of_literals\}

<SettingsInfoBlock type="Bool" default_value="1" />

Для формата Values: при разборе и интерпретации выражений с использованием Template проверять фактический тип литерала, чтобы избежать возможного переполнения и потери точности.

## input_format_values_deduce_templates_of_expressions \{#input_format_values_deduce_templates_of_expressions\}

<SettingsInfoBlock type="Bool" default_value="1" />

Для формата Values: если поле не удалось разобрать потоковым парсером, запустить SQL-парсер, определить шаблон SQL-выражения, попытаться разобрать все строки с использованием этого шаблона, а затем интерпретировать выражение для всех строк.

## input_format_values_interpret_expressions \{#input_format_values_interpret_expressions\}

<SettingsInfoBlock type="Bool" default_value="1" />

Для формата Values: если поле не удаётся разобрать потоковым парсером, запускается SQL‑парсер, и выполняется попытка интерпретировать его как SQL‑выражение.

## input_format_with_names_use_header \{#input_format_with_names_use_header\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает проверку порядка столбцов при вставке данных.

Для повышения производительности вставки рекомендуется отключить эту проверку, если вы уверены, что порядок столбцов во входных данных совпадает с порядком столбцов в целевой таблице.

Поддерживаемые форматы:

- [CSVWithNames](/interfaces/formats/CSVWithNames)
- [CSVWithNamesAndTypes](/interfaces/formats/CSVWithNamesAndTypes)
- [TabSeparatedWithNames](/interfaces/formats/TabSeparatedWithNames)
- [TabSeparatedWithNamesAndTypes](/interfaces/formats/TabSeparatedWithNamesAndTypes)
- [JSONCompactEachRowWithNames](/interfaces/formats/JSONCompactEachRowWithNames)
- [JSONCompactEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactEachRowWithNamesAndTypes)
- [JSONCompactStringsEachRowWithNames](/interfaces/formats/JSONCompactStringsEachRowWithNames)
- [JSONCompactStringsEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactStringsEachRowWithNamesAndTypes)
- [RowBinaryWithNames](/interfaces/formats/RowBinaryWithNames)
- [RowBinaryWithNamesAndTypes](/interfaces/formats/RowBinaryWithNamesAndTypes)
- [CustomSeparatedWithNames](/interfaces/formats/CustomSeparatedWithNames)
- [CustomSeparatedWithNamesAndTypes](/interfaces/formats/CustomSeparatedWithNamesAndTypes)

Возможные значения:

- 0 — отключено.
- 1 — включено.

## input_format_with_types_use_header \{#input_format_with_types_use_header\}

<SettingsInfoBlock type="Bool" default_value="1" />

Определяет, следует ли проверять, совпадают ли типы данных во входных данных с типами данных целевой таблицы.

Поддерживаемые форматы:

- [CSVWithNamesAndTypes](/interfaces/formats/CSVWithNamesAndTypes)
- [TabSeparatedWithNamesAndTypes](/interfaces/formats/TabSeparatedWithNamesAndTypes)
- [JSONCompactEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactEachRowWithNamesAndTypes)
- [JSONCompactStringsEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactStringsEachRowWithNamesAndTypes)
- [RowBinaryWithNamesAndTypes](/interfaces/formats/RowBinaryWithNamesAndTypes)
- [CustomSeparatedWithNamesAndTypes](/interfaces/formats/CustomSeparatedWithNamesAndTypes)

Возможные значения:

- 0 — отключено.
- 1 — включено.

## insert_distributed_one_random_shard \{#insert_distributed_one_random_shard\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает вставку данных в случайный сегмент таблицы [Distributed](/engines/table-engines/special/distributed), когда не задан ключ распределения.

По умолчанию при вставке данных в таблицу `Distributed` с более чем одним сегментом сервер ClickHouse отклоняет любой запрос на вставку, если не указан ключ распределения. Если `insert_distributed_one_random_shard = 1`, вставки разрешены, и данные распределяются случайным образом между всеми сегментами.

Возможные значения:

- 0 — Вставка отклоняется, если есть несколько сегментов и ключ распределения не задан.
- 1 — Вставка выполняется случайным образом между всеми доступными сегментами, если ключ распределения не задан.

## interval_output_format \{#interval_output_format\}

<SettingsInfoBlock type="IntervalOutputFormat" default_value="numeric" />

Позволяет выбирать различные форматы текстового вывода типов интервалов.

Возможные значения:

-   `kusto` - формат вывода в стиле KQL.

    ClickHouse выводит интервалы в [формате KQL](https://learn.microsoft.com/en-us/dotnet/standard/base-types/standard-timespan-format-strings#the-constant-c-format-specifier). Например, `toIntervalDay(2)` будет отформатирован как `2.00:00:00`. Обратите внимание, что для интервальных типов переменной длины (то есть `IntervalMonth` и `IntervalYear`) учитывается среднее количество секунд на один интервал.

-   `numeric` - числовой формат вывода.

    ClickHouse выводит интервалы как их базовое числовое представление. Например, `toIntervalDay(2)` будет отформатирован как `2`.

См. также:

-   [Interval](../../sql-reference/data-types/special-data-types/interval.md)

## into_outfile_create_parent_directories \{#into_outfile_create_parent_directories\}

<SettingsInfoBlock type="Bool" default_value="0" />

Автоматически создавать родительские каталоги при использовании INTO OUTFILE, если они ещё не созданы.

## json_type_escape_dots_in_keys \{#json_type_escape_dots_in_keys\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если параметр включен, точки в ключах JSON будут экранироваться при разборе.

## output_format_arrow_compression_method \{#output_format_arrow_compression_method\}

<SettingsInfoBlock type="ArrowCompression" default_value="lz4_frame" />

Метод сжатия для формата вывода Arrow. Поддерживаемые кодеки: lz4_frame, zstd, none (без сжатия).

## output_format_arrow_fixed_string_as_fixed_byte_array \{#output_format_arrow_fixed_string_as_fixed_byte_array\}

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать тип Arrow FIXED_SIZE_BINARY вместо типа Binary для столбцов FixedString.

## output_format_arrow_low_cardinality_as_dictionary \{#output_format_arrow_low_cardinality_as_dictionary\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает вывод типа LowCardinality в виде типа Arrow Dictionary

## output_format_arrow_string_as_string \{#output_format_arrow_string_as_string\}

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать тип Arrow String вместо Binary для столбцов типа String

## output_format_arrow_use_64_bit_indexes_for_dictionary \{#output_format_arrow_use_64_bit_indexes_for_dictionary\}

<SettingsInfoBlock type="Bool" default_value="0" />

Всегда использовать 64-битные целые числа для индексов словаря в формате Arrow

## output_format_arrow_use_signed_indexes_for_dictionary \{#output_format_arrow_use_signed_indexes_for_dictionary\}

<SettingsInfoBlock type="Bool" default_value="1" />

Использует знаковые целые числа для индексов словаря в формате Arrow

## output_format_avro_codec \{#output_format_avro_codec\}

Кодек сжатия, используемый при выводе. Возможные значения: 'null', 'deflate', 'snappy', 'zstd'.

## output_format_avro_rows_in_file \{#output_format_avro_rows_in_file\}

<SettingsInfoBlock type="UInt64" default_value="1" />

Максимальное количество строк в файле (если позволяет хранилище)

## output_format_avro_string_column_pattern \{#output_format_avro_string_column_pattern\}

Для формата Avro: регулярное выражение (regexp) для столбцов типа String, которые следует сериализовать как AVRO string.

## output_format_avro_sync_interval \{#output_format_avro_sync_interval\}

<SettingsInfoBlock type="UInt64" default_value="16384" />

Интервал синхронизации в байтах.

## output_format_binary_encode_types_in_binary_format \{#output_format_binary_encode_types_in_binary_format\}

<SettingsInfoBlock type="Bool" default_value="0" />

Записывать типы данных в двоичном формате вместо названий типов в формате вывода RowBinaryWithNamesAndTypes

## output_format_binary_write_json_as_string \{#output_format_binary_write_json_as_string\}

<SettingsInfoBlock type="Bool" default_value="0" />

Записывает значения типа данных [JSON](../../sql-reference/data-types/newjson.md) как строковые значения типа [String](../../sql-reference/data-types/string.md) в формате вывода RowBinary.

## output_format_bson_string_as_string \{#output_format_bson_string_as_string\}

<SettingsInfoBlock type="Bool" default_value="0" />

Использовать BSON-тип String вместо Binary для строковых столбцов.

## output_format_compression_level \{#output_format_compression_level\}

<SettingsInfoBlock type="UInt64" default_value="3" />

Уровень сжатия по умолчанию при сжатии результата запроса. Настройка применяется, когда запрос `SELECT` содержит `INTO OUTFILE` или при записи в табличные функции `file`, `url`, `hdfs`, `s3` или `azureBlobStorage`.

Возможные значения: от `1` до `22`

## output_format_compression_zstd_window_log \{#output_format_compression_zstd_window_log\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Может использоваться, когда метод сжатия вывода — `zstd`. Если значение больше `0`, этот параметр явно задаёт размер окна сжатия (степень двойки) и включает режим long-range для сжатия zstd. Это может помочь достичь лучшего коэффициента сжатия.

Возможные значения: неотрицательные числа. Обратите внимание, что если значение слишком маленькое или слишком большое, `zstdlib` выбросит исключение. Типичные значения — от `20` (размер окна = `1MB`) до `30` (размер окна = `1GB`).

## output_format_csv_crlf_end_of_line \{#output_format_csv_crlf_end_of_line\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если установлено в true, конец строки в формате CSV будет \\r\\n вместо \\n.

## output_format_csv_serialize_tuple_into_separate_columns \{#output_format_csv_serialize_tuple_into_separate_columns\}

<SettingsInfoBlock type="Bool" default_value="1" />

Если установлено значение true, то кортежи в формате CSV сериализуются как отдельные столбцы (то есть их вложенность в кортеже не сохраняется).

## output_format_decimal_trailing_zeros \{#output_format_decimal_trailing_zeros\}

<SettingsInfoBlock type="Bool" default_value="0" />

Выводить конечные нули при выводе значений типа Decimal. Например, 1.230000 вместо 1.23.

По умолчанию отключено.

## output_format_json_array_of_rows \{#output_format_json_array_of_rows\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает вывод всех строк в виде JSON-массива в формате [JSONEachRow](/interfaces/formats/JSONEachRow).

Возможные значения:

* 1 — ClickHouse выводит все строки как массив, каждая строка в формате `JSONEachRow`.
* 0 — ClickHouse выводит каждую строку отдельно в формате `JSONEachRow`.

**Пример запроса с включённой настройкой**

Запрос:

```sql
SET output_format_json_array_of_rows = 1;
SELECT number FROM numbers(3) FORMAT JSONEachRow;
```

Результат:

```text
[
{"number":"0"},
{"number":"1"},
{"number":"2"}
]
```

**Пример запроса с отключенной настройкой**

Запрос:

```sql
SET output_format_json_array_of_rows = 0;
SELECT number FROM numbers(3) FORMAT JSONEachRow;
```

Результат:

```text
{"number":"0"}
{"number":"1"}
{"number":"2"}
```


## output_format_json_escape_forward_slashes \{#output_format_json_escape_forward_slashes\}

<SettingsInfoBlock type="Bool" default_value="1" />

Управляет экранированием символов прямой косой черты (/) для строковых значений в формате вывода JSON. Предназначено для совместимости с JavaScript. Не путайте с символами обратной косой черты (\), которые всегда экранируются.

По умолчанию параметр включён.

## output_format_json_map_as_array_of_tuples \{#output_format_json_map_as_array_of_tuples\}

<SettingsInfoBlock type="Bool" default_value="0" />

Сериализует столбцы типа Map как JSON-массивы кортежей.

По умолчанию отключено.

## output_format_json_named_tuples_as_objects \{#output_format_json_named_tuples_as_objects\}

<SettingsInfoBlock type="Bool" default_value="1" />

Сериализует столбцы именованных кортежей как JSON-объекты.

Включено по умолчанию.

## output_format_json_pretty_print \{#output_format_json_pretty_print\}

<SettingsInfoBlock type="Bool" default_value="1" />

Этот параметр задаёт, как вложенные структуры, такие как Tuples, Maps и Arrays, отображаются внутри массива `data` при использовании формата вывода JSON.

Например, вместо вывода:

```json
"data":
[
  {
    "tuple": {"a":1,"b":2,"c":3},
    "array": [1,2,3],
    "map": {"a":1,"b":2,"c":3}
  }
],
```

Результат будет иметь следующий формат:

```json
"data":
[
    {
        "tuple": {
            "a": 1,
            "b": 2,
            "c": 3
        },
        "array": [
            1,
            2,
            3
        ],
        "map": {
            "a": 1,
            "b": 2,
            "c": 3
        }
    }
],
```

Включено по умолчанию.


## output_format_json_quote_64bit_floats \{#output_format_json_quote_64bit_floats\}

<SettingsInfoBlock type="Bool" default_value="0" />

Управляет заключением 64-битных [чисел с плавающей запятой](../../sql-reference/data-types/float.md) в кавычки при их выводе в форматах JSON*.

По умолчанию отключено.

## output_format_json_quote_64bit_integers \{#output_format_json_quote_64bit_integers\}

<SettingsInfoBlock type="Bool" default_value="0" />

Определяет, заключаются ли 64-битные и более крупные [целые числа](../../sql-reference/data-types/int-uint.md) (такие как `UInt64` или `Int128`) в кавычки при выводе в формате [JSON](/interfaces/formats/JSON).
По умолчанию такие целые числа заключаются в кавычки. Такое поведение совместимо с большинством реализаций JavaScript.

Возможные значения:

- 0 — целые числа выводятся без кавычек.
- 1 — целые числа заключаются в кавычки.

## output_format_json_quote_decimals \{#output_format_json_quote_decimals\}

<SettingsInfoBlock type="Bool" default_value="0" />

Управляет заключением десятичных чисел в кавычки в форматах вывода JSON.

По умолчанию отключено.

## output_format_json_quote_denormals \{#output_format_json_quote_denormals\}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает вывод значений `+nan`, `-nan`, `+inf`, `-inf` в формате [JSON](/interfaces/formats/JSON).

Возможные значения:

* 0 — отключено.
* 1 — включено.

**Пример**

Рассмотрим следующую таблицу `account_orders`:

```text
┌─id─┬─name───┬─duration─┬─period─┬─area─┐
│  1 │ Andrew │       20 │      0 │  400 │
│  2 │ John   │       40 │      0 │    0 │
│  3 │ Bob    │       15 │      0 │ -100 │
└────┴────────┴──────────┴────────┴──────┘
```

Когда `output_format_json_quote_denormals = 0`, запрос возвращает значения `null` в выходных данных:

```sql
SELECT area/period FROM account_orders FORMAT JSON;
```

```json
{
        "meta":
        [
                {
                        "name": "divide(area, period)",
                        "type": "Float64"
                }
        ],

        "data":
        [
                {
                        "divide(area, period)": null
                },
                {
                        "divide(area, period)": null
                },
                {
                        "divide(area, period)": null
                }
        ],

        "rows": 3,

        "statistics":
        {
                "elapsed": 0.003648093,
                "rows_read": 3,
                "bytes_read": 24
        }
}
```

Когда `output_format_json_quote_denormals = 1`, запрос вернёт:

```json
{
        "meta":
        [
                {
                        "name": "divide(area, period)",
                        "type": "Float64"
                }
        ],

        "data":
        [
                {
                        "divide(area, period)": "inf"
                },
                {
                        "divide(area, period)": "-nan"
                },
                {
                        "divide(area, period)": "-inf"
                }
        ],

        "rows": 3,

        "statistics":
        {
                "elapsed": 0.000070241,
                "rows_read": 3,
                "bytes_read": 24
        }
}
```


## output_format_json_skip_null_value_in_named_tuples \{#output_format_json_skip_null_value_in_named_tuples\}

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускает пары ключ–значение со значением null при сериализации столбцов именованных кортежей в объекты JSON. Применяется только если output_format_json_named_tuples_as_objects имеет значение true.

## output_format_json_validate_utf8 \{#output_format_json_validate_utf8\}

<SettingsInfoBlock type="Bool" default_value="0" />

Управляет проверкой последовательностей UTF-8 в форматах вывода JSON, не влияет на форматы JSON/JSONCompact/JSONColumnsWithMetadata — они всегда выполняют проверку UTF-8.

По умолчанию отключено.

## output_format_markdown_escape_special_characters \{#output_format_markdown_escape_special_characters\}

<SettingsInfoBlock type="Bool" default_value="0" />

При включении выполняет экранирование специальных символов в Markdown.

[CommonMark](https://spec.commonmark.org/0.30/#example-12) определяет следующие специальные символы, которые могут экранироваться этим параметром:

```
! " # $ % & ' ( ) * + , - . / : ; < = > ? @ [ \ ] ^ _ ` { | } ~
```

Возможные значения:

* 0 — отключено.
* 1 — включено.


## output_format_msgpack_uuid_representation \{#output_format_msgpack_uuid_representation\}

<SettingsInfoBlock type="MsgPackUUIDRepresentation" default_value="ext" />

Определяет способ вывода UUID в формате MsgPack.

## output_format_native_encode_types_in_binary_format \{#output_format_native_encode_types_in_binary_format\}

<SettingsInfoBlock type="Bool" default_value="0" />

Записывает типы данных в двоичном формате вместо их имен в формате вывода Native

## output_format_native_use_flattened_dynamic_and_json_serialization \{#output_format_native_use_flattened_dynamic_and_json_serialization\}

<SettingsInfoBlock type="Bool" default_value="0" />

Записывать данные столбцов [JSON](../../sql-reference/data-types/newjson.md) и [Dynamic](../../sql-reference/data-types/dynamic.md) в развёрнутом формате (все типы/пути в виде отдельных подстолбцов).

## output_format_native_write_json_as_string \{#output_format_native_write_json_as_string\}

<SettingsInfoBlock type="Bool" default_value="0" />

Записывает данные столбца типа [JSON](../../sql-reference/data-types/newjson.md) как столбец типа [String](../../sql-reference/data-types/string.md), содержащий JSON-строки, вместо стандартной нативной сериализации JSON.

## output_format_orc_compression_block_size \{#output_format_orc_compression_block_size\}

<SettingsInfoBlock type="UInt64" default_value="262144" />

Размер блока сжатия в байтах для выходного формата ORC.

## output_format_orc_compression_method \{#output_format_orc_compression_method\}

<SettingsInfoBlock type="ORCCompression" default_value="zstd" />

Метод сжатия для формата вывода ORC. Поддерживаемые кодеки сжатия: lz4, snappy, zlib, zstd, none (без сжатия).

## output_format_orc_dictionary_key_size_threshold \{#output_format_orc_dictionary_key_size_threshold\}

<SettingsInfoBlock type="Double" default_value="0" />

Для строкового столбца в формате вывода ORC, если число уникальных значений превышает эту долю от общего числа строк с ненулевыми (не-NULL) значениями, кодирование с использованием словаря отключается. В противном случае кодирование с использованием словаря остается включенным.

## output_format_orc_row_index_stride \{#output_format_orc_row_index_stride\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

Целевой интервал индексации строк в выходном формате ORC

## output_format_orc_string_as_string \{#output_format_orc_string_as_string\}

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать тип ORC String вместо Binary для строковых столбцов

## output_format_orc_writer_time_zone_name \{#output_format_orc_writer_time_zone_name\}

<SettingsInfoBlock type="String" default_value="GMT" />

Имя часового пояса для модуля записи ORC; по умолчанию используется часовой пояс GMT.

## output_format_parallel_formatting \{#output_format_parallel_formatting\}

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает параллельное форматирование данных. Поддерживается только для форматов [TSV](/interfaces/formats/TabSeparated), [TSKV](/interfaces/formats/TSKV), [CSV](/interfaces/formats/CSV) и [JSONEachRow](/interfaces/formats/JSONEachRow).

Возможные значения:

- 1 — Включено.
- 0 — Отключено.

## output_format_parquet_batch_size \{#output_format_parquet_batch_size\}

<SettingsInfoBlock type="NonZeroUInt64" default_value="1024" />

Проверять размер страницы после указанного количества строк. Рассмотрите возможность уменьшить это значение, если у вас есть столбцы со средним размером значений более нескольких КБ.

## output_format_parquet_bloom_filter_bits_per_value \{#output_format_parquet_bloom_filter_bits_per_value\}

<SettingsInfoBlock type="Double" default_value="10.5" />

Приблизительное количество бит, используемых для каждого уникального значения в bloom-фильтрах Parquet. Оценочные вероятности ложноположительных срабатываний:

*  6   бит — 10%
  * 10.5 бит —  1%
  * 16.9 бит —  0.1%
  * 26.4 бит —  0.01%
  * 41   бит —  0.001%

## output_format_parquet_bloom_filter_flush_threshold_bytes \{#output_format_parquet_bloom_filter_flush_threshold_bytes\}

<SettingsInfoBlock type="UInt64" default_value="134217728" />

Где в файле Parquet размещать bloom-фильтры. Bloom-фильтры будут записываться группами примерно такого размера. В частности:

* если значение равно 0, bloom-фильтры каждой группы строк записываются сразу после группы строк,
  * если значение больше суммарного размера всех bloom-фильтров, bloom-фильтры для всех групп строк будут накапливаться в памяти, а затем записываться вместе ближе к концу файла,
  * в противном случае bloom-фильтры будут накапливаться в памяти и записываться, когда их общий размер превысит это значение.

## output_format_parquet_compliant_nested_types \{#output_format_parquet_compliant_nested_types\}

<SettingsInfoBlock type="Bool" default_value="1" />

В схеме файла Parquet использовать имя `element` вместо `item` для элементов списка. Это исторический артефакт реализации библиотеки Arrow. В целом повышает совместимость, за исключением, возможно, некоторых старых версий Arrow.

## output_format_parquet_compression_method \{#output_format_parquet_compression_method\}

<SettingsInfoBlock type="ParquetCompression" default_value="zstd" />

Метод сжатия выходного формата Parquet. Поддерживаемые кодеки: snappy, lz4, brotli, zstd, gzip, none — без сжатия.

## output_format_parquet_data_page_size \{#output_format_parquet_data_page_size\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

Целевой размер страницы в байтах до сжатия.

## output_format_parquet_date_as_uint16 \{#output_format_parquet_date_as_uint16\}

<SettingsInfoBlock type="Bool" default_value="0" />

Записывать значения типа Date в виде обычных 16-битных чисел (считываются обратно как UInt16) вместо преобразования в 32-битный тип DATE формата Parquet (считывается обратно как Date32).

## output_format_parquet_datetime_as_uint32 \{#output_format_parquet_datetime_as_uint32\}

<SettingsInfoBlock type="Bool" default_value="0" />

Записывать значения DateTime как «сырые» unix‑таймстемпы (читаются как UInt32), вместо преобразования в миллисекунды (читаются как DateTime64(3)).

## output_format_parquet_enum_as_byte_array \{#output_format_parquet_enum_as_byte_array\}

<SettingsInfoBlock type="Bool" default_value="1" />

Записывает значения Enum, используя физический тип Parquet BYTE_ARRAY и логический тип ENUM

## output_format_parquet_fixed_string_as_fixed_byte_array \{#output_format_parquet_fixed_string_as_fixed_byte_array\}

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать тип данных Parquet FIXED_LEN_BYTE_ARRAY вместо Binary для столбцов FixedString.

## output_format_parquet_geometadata \{#output_format_parquet_geometadata\}

<SettingsInfoBlock type="Bool" default_value="1" />

Позволяет записывать информацию о столбцах с геоданными в метаданные Parquet и кодировать эти столбцы в формате WKB.

## output_format_parquet_max_dictionary_size \{#output_format_parquet_max_dictionary_size\}

<SettingsInfoBlock type="UInt64" default_value="1048576" />

Если размер словаря превышает указанное количество байт, используется кодирование без словаря. Установите значение 0, чтобы отключить кодирование со словарём.

## output_format_parquet_parallel_encoding \{#output_format_parquet_parallel_encoding\}

<SettingsInfoBlock type="Bool" default_value="1" />

Выполнять кодирование Parquet в нескольких потоках. Требует включённой настройки output_format_parquet_use_custom_encoder.

## output_format_parquet_row_group_size \{#output_format_parquet_row_group_size\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

Целевой размер группы по числу строк.

## output_format_parquet_row_group_size_bytes \{#output_format_parquet_row_group_size_bytes\}

<SettingsInfoBlock type="UInt64" default_value="536870912" />

Целевой размер группы строк в байтах до сжатия.

## output_format_parquet_string_as_string \{#output_format_parquet_string_as_string\}

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать тип данных Parquet String вместо Binary для строковых столбцов.

## output_format_parquet_use_custom_encoder \{#output_format_parquet_use_custom_encoder\}

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать более быструю реализацию кодировщика Parquet.

## output_format_parquet_version \{#output_format_parquet_version\}

<SettingsInfoBlock type="ParquetVersion" default_value="2.latest" />

Версия формата Parquet при выводе данных. Поддерживаемые версии: 1.0, 2.4, 2.6 и 2.latest (по умолчанию).

## output_format_parquet_write_bloom_filter \{#output_format_parquet_write_bloom_filter\}

<SettingsInfoBlock type="Bool" default_value="1" />

Записывает фильтры Блума в файлы Parquet. Требует, чтобы параметр output_format_parquet_use_custom_encoder был установлен в true.

## output_format_parquet_write_checksums \{#output_format_parquet_write_checksums\}

<SettingsInfoBlock type="Bool" default_value="1" />

Записывать контрольные суммы CRC32 в заголовки страниц формата Parquet.

## output_format_parquet_write_page_index \{#output_format_parquet_write_page_index\}

<SettingsInfoBlock type="Bool" default_value="1" />

Записывает индекс столбца и индекс смещения (т. е. статистику по каждой странице данных, которая может использоваться для фильтрации при чтении) в файлы Parquet.

## output_format_pretty_color \{#output_format_pretty_color\}

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

Использовать управляющие последовательности ANSI в форматах Pretty. 0 — отключено, 1 — включено, `auto` — включено, если вывод осуществляется в терминал.

## output_format_pretty_display_footer_column_names \{#output_format_pretty_display_footer_column_names\}

<SettingsInfoBlock type="UInt64" default_value="1" />

Отображать имена столбцов в нижнем колонтитуле, если в таблице много строк.

Возможные значения:

* 0 — имена столбцов не отображаются в нижнем колонтитуле.
* 1 — имена столбцов отображаются в нижнем колонтитуле, если число строк больше либо равно пороговому значению, заданному настройкой [output&#95;format&#95;pretty&#95;display&#95;footer&#95;column&#95;names&#95;min&#95;rows](#output_format_pretty_display_footer_column_names_min_rows) (по умолчанию — 50).

**Пример**

Запрос:

```sql
SELECT *, toTypeName(*) FROM (SELECT * FROM system.numbers LIMIT 1000);
```

Результат:

```response
      ┌─number─┬─toTypeName(number)─┐
   1. │      0 │ UInt64             │
   2. │      1 │ UInt64             │
   3. │      2 │ UInt64             │
   ...
 999. │    998 │ UInt64             │
1000. │    999 │ UInt64             │
      └─number─┴─toTypeName(number)─┘
```


## output_format_pretty_display_footer_column_names_min_rows \{#output_format_pretty_display_footer_column_names_min_rows\}

<SettingsInfoBlock type="UInt64" default_value="50" />

Задает минимальное количество строк, при котором будет отображаться футер с именами столбцов, если включена настройка [output_format_pretty_display_footer_column_names](#output_format_pretty_display_footer_column_names).

## output_format_pretty_fallback_to_vertical \{#output_format_pretty_fallback_to_vertical\}

<SettingsInfoBlock type="Bool" default_value="1" />

Если параметр включён и таблица широкая, но короткая, формат Pretty выведет её так же, как формат Vertical.
См. `output_format_pretty_fallback_to_vertical_max_rows_per_chunk` и `output_format_pretty_fallback_to_vertical_min_table_width` для подробной настройки этого поведения.

## output_format_pretty_fallback_to_vertical_max_rows_per_chunk \{#output_format_pretty_fallback_to_vertical_max_rows_per_chunk\}

<SettingsInfoBlock type="UInt64" default_value="10" />

Переход к формату Vertical (см. `output_format_pretty_fallback_to_vertical`) будет выполняться только в том случае, если количество строк во фрагменте не превышает указанное значение.

## output_format_pretty_fallback_to_vertical_min_columns \{#output_format_pretty_fallback_to_vertical_min_columns\}

<SettingsInfoBlock type="UInt64" default_value="5" />

Переключение на формат Vertical (см. `output_format_pretty_fallback_to_vertical`) будет выполняться только в том случае, если количество столбцов превышает указанное значение.

## output_format_pretty_fallback_to_vertical_min_table_width \{#output_format_pretty_fallback_to_vertical_min_table_width\}

<SettingsInfoBlock type="UInt64" default_value="250" />

Автоматическое переключение на формат Vertical (см. `output_format_pretty_fallback_to_vertical`) будет выполнено только в том случае, если сумма длин столбцов в таблице не менее указанного значения или если хотя бы одно значение содержит символ новой строки.

## output_format_pretty_glue_chunks \{#output_format_pretty_glue_chunks\}

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

Если данные, выводимые в форматах Pretty, поступили в нескольких фрагментах, даже с задержкой, но следующий фрагмент имеет те же ширины столбцов, что и предыдущий, используйте управляющие последовательности ANSI, чтобы вернуться на предыдущую строку и перерисовать нижнюю строку предыдущего фрагмента, продолжив его данными нового фрагмента. Это делает результат более приятным визуально.

0 — отключено, 1 — включено, 'auto' — включено, если вывод в терминал.

## output_format_pretty_grid_charset \{#output_format_pretty_grid_charset\}

<SettingsInfoBlock type="String" default_value="UTF-8" />

Набор символов для отображения границ таблицы. Доступные наборы символов: ASCII, UTF-8 (по умолчанию).

## output_format_pretty_highlight_digit_groups \{#output_format_pretty_highlight_digit_groups\}

<SettingsInfoBlock type="Bool" default_value="1" />

Если параметр включен и вывод осуществляется в терминал, каждая цифра в разрядах тысяч, миллионов и т.д. подчеркивается.

## output_format_pretty_highlight_trailing_spaces \{#output_format_pretty_highlight_trailing_spaces\}

<SettingsInfoBlock type="Bool" default_value="1" />

Если параметр включен и вывод идет в терминал, подсвечивает пробелы в конце строк серым цветом и подчеркивает их.

## output_format_pretty_max_column_name_width_cut_to \{#output_format_pretty_max_column_name_width_cut_to\}

<SettingsInfoBlock type="UInt64" default_value="24" />

Если имя столбца слишком длинное, оно будет усечено до этой длины.
Имя столбца будет усечено, если его длина больше, чем `output_format_pretty_max_column_name_width_cut_to` плюс `output_format_pretty_max_column_name_width_min_chars_to_cut`.

## output_format_pretty_max_column_name_width_min_chars_to_cut \{#output_format_pretty_max_column_name_width_min_chars_to_cut\}

<SettingsInfoBlock type="UInt64" default_value="4" />

Минимальное количество символов, на которое сокращается имя столбца, если оно слишком длинное.
Имя столбца будет сокращено, если его длина превышает сумму `output_format_pretty_max_column_name_width_cut_to` и `output_format_pretty_max_column_name_width_min_chars_to_cut`.

## output_format_pretty_max_column_pad_width \{#output_format_pretty_max_column_pad_width\}

<SettingsInfoBlock type="UInt64" default_value="250" />

Максимальная ширина, до которой дополняются все значения в столбце в форматах Pretty.

## output_format_pretty_max_rows \{#output_format_pretty_max_rows\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Предельное количество строк для форматов Pretty.

## output_format_pretty_max_value_width \{#output_format_pretty_max_value_width\}

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальная ширина значения при отображении в форматах Pretty. Если значение больше — оно будет обрезано.
Значение 0 означает, что обрезка не выполняется.

## output_format_pretty_max_value_width_apply_for_single_value \{#output_format_pretty_max_value_width_apply_for_single_value\}

<SettingsInfoBlock type="UInt64" default_value="0" />

Обрезать значения (см. настройку `output_format_pretty_max_value_width`) только в том случае, когда в блоке более одного значения. В противном случае выводить значение полностью, что полезно для запроса `SHOW CREATE TABLE`.

## output_format_pretty_multiline_fields \{#output_format_pretty_multiline_fields\}

<SettingsInfoBlock type="Bool" default_value="1" />

При включении форматы Pretty будут отображать многострочные поля внутри ячейки таблицы, чтобы сохранить границы таблицы.
При отключении они будут выводиться как есть, что может деформировать таблицу (одним из преимуществ отключения является упрощение копирования и вставки многострочных значений).

## output_format_pretty_named_tuples_as_json \{#output_format_pretty_named_tuples_as_json\}

<SettingsInfoBlock type="Bool" default_value="1" />

Определяет, выводятся ли именованные кортежи в формате Pretty как красиво отформатированные JSON-объекты.

## output_format_pretty_row_numbers \{#output_format_pretty_row_numbers\}

<SettingsInfoBlock type="Bool" default_value="1" />

Добавляет порядковые номера перед каждой строкой в формате вывода Pretty

## output_format_pretty_single_large_number_tip_threshold \{#output_format_pretty_single_large_number_tip_threshold\}

<SettingsInfoBlock type="UInt64" default_value="1000000" />

Выводит подсказку с числом в человекочитаемом виде справа от таблицы, если блок содержит одно число, которое превышает это значение (за исключением 0).

## output_format_pretty_squash_consecutive_ms \{#output_format_pretty_squash_consecutive_ms\}

<SettingsInfoBlock type="UInt64" default_value="50" />

Ожидать следующий блок до указанного количества миллисекунд и объединить его с предыдущим перед выводом.
Это позволяет избежать частого вывода слишком маленьких блоков, но при этом по‑прежнему отображать данные в потоковом режиме.

## output_format_pretty_squash_max_wait_ms \{#output_format_pretty_squash_max_wait_ms\}

<SettingsInfoBlock type="UInt64" default_value="1000" />

Выводит невыведенный блок в форматах Pretty, если с момента предыдущего вывода прошло больше указанного количества миллисекунд.

## output_format_protobuf_nullables_with_google_wrappers \{#output_format_protobuf_nullables_with_google_wrappers\}

<SettingsInfoBlock type="Bool" default_value="0" />

При сериализации столбцов типа Nullable с использованием оберток Google значения по умолчанию сериализуются как пустые обертки. Если параметр отключен, значения по умолчанию и null не сериализуются

## output_format_schema \{#output_format_schema\}

Путь к файлу, в котором автоматически сгенерированная схема будет сохранена в формате [Cap'n Proto](/interfaces/formats/CapnProto) или [Protobuf](/interfaces/formats/Protobuf).

## output_format_sql_insert_include_column_names \{#output_format_sql_insert_include_column_names\}

<SettingsInfoBlock type="Bool" default_value="1" />

Добавлять имена столбцов в запрос INSERT

## output_format_sql_insert_max_batch_size \{#output_format_sql_insert_max_batch_size\}

<SettingsInfoBlock type="UInt64" default_value="65409" />

Максимальное количество строк в одном операторе INSERT.

## output_format_sql_insert_quote_names \{#output_format_sql_insert_quote_names\}

<SettingsInfoBlock type="Bool" default_value="1" />

Заключать имена столбцов в символы «`»

## output_format_sql_insert_table_name \{#output_format_sql_insert_table_name\}

<SettingsInfoBlock type="String" default_value="table" />

Имя таблицы в выходном запросе INSERT

## output_format_sql_insert_use_replace \{#output_format_sql_insert_use_replace\}

<SettingsInfoBlock type="Bool" default_value="0" />

Использовать оператор REPLACE вместо INSERT

## output_format_tsv_crlf_end_of_line \{#output_format_tsv_crlf_end_of_line\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если установлено значение true, символы конца строки в формате TSV будут \\r\\n вместо \\n.

## output_format_values_escape_quote_with_quote \{#output_format_values_escape_quote_with_quote\}

<SettingsInfoBlock type="Bool" default_value="0" />

Если значение `true`, экранировать `'` как `''`, в противном случае заключать в кавычки как `\\'`.

## output_format_write_statistics \{#output_format_write_statistics\}

<SettingsInfoBlock type="Bool" default_value="1" />

Записывает статистику о прочитанных строках, байтах и затраченном времени в подходящих форматах вывода.

Включена по умолчанию

## precise_float_parsing \{#precise_float_parsing\}

<SettingsInfoBlock type="Bool" default_value="0" />

Предпочитать более точный (но более медленный) алгоритм разбора чисел с плавающей запятой.

## schema_inference_hints \{#schema_inference_hints\}

Список названий и типов столбцов, которые используются в качестве подсказок при выводе схемы для форматов без схемы.

Пример:

Запрос:

```sql
desc format(JSONEachRow, '{"x" : 1, "y" : "String", "z" : "0.0.0.0" }') settings schema_inference_hints='x UInt8, z IPv4';
```

Результат:

```sql
x   UInt8
y   Nullable(String)
z   IPv4
```

:::note
Если `schema_inference_hints` имеет некорректный формат, содержит опечатку, неверный тип данных и т.п., весь `schema_inference_hints` будет проигнорирован.
:::


## schema_inference_make_columns_nullable \{#schema_inference_make_columns_nullable\}

<SettingsInfoBlock type="UInt64Auto" default_value="3" />

Управляет приведением выводимых типов к `Nullable` при выводе схемы.
Возможные значения:

* 0 - выводимый тип никогда не будет `Nullable` (используйте input_format_null_as_default, чтобы контролировать, как обрабатывать значения NULL в этом случае),
 * 1 - все выводимые типы будут `Nullable`,
 * 2 или `auto` - выводимый тип будет `Nullable` только если столбец содержит `NULL` в выборке, которая разбирается во время вывода схемы, или если метаданные файла содержат информацию о допускаемости NULL в столбце,
 * 3 - допускаемость NULL для выводимого типа будет соответствовать метаданным файла, если формат их содержит (например, Parquet), в противном случае тип всегда будет Nullable (например, CSV).

## schema_inference_make_json_columns_nullable \{#schema_inference_make_json_columns_nullable\}

<SettingsInfoBlock type="Bool" default_value="0" />

Управляет приведением выводимых типов JSON к `Nullable` при автоматическом определении схемы.
Если этот параметр включен вместе с schema_inference_make_columns_nullable, выводимый тип JSON будет `Nullable`.

## schema_inference_mode \{#schema_inference_mode\}

<SettingsInfoBlock type="SchemaInferenceMode" default_value="default" />

Режим определения схемы. `default` — предполагается, что все файлы имеют одинаковую схему, и схему можно определить по любому файлу; `union` — файлы могут иметь разные схемы, и результирующая схема должна представлять собой объединение схем всех файлов.

## show_create_query_identifier_quoting_rule \{#show_create_query_identifier_quoting_rule\}

<SettingsInfoBlock type="IdentifierQuotingRule" default_value="when_necessary" />

Задаёт правило кавычирования идентификаторов в запросе SHOW CREATE

## show_create_query_identifier_quoting_style \{#show_create_query_identifier_quoting_style\}

<SettingsInfoBlock type="IdentifierQuotingStyle" default_value="Backticks" />

Определяет стиль заключения идентификаторов в кавычки в запросах SHOW CREATE

## type_json_allow_duplicated_key_with_literal_and_nested_object \{#type_json_allow_duplicated_key_with_literal_and_nested_object\}

<SettingsInfoBlock type="Bool" default_value="0" />

Когда настройка включена, допускается разбор JSON-объектов вида `{"a" : 42, "a" : {"b" : 42}}`, где некоторый ключ дублируется, но одно из его значений является вложенным объектом.

## type_json_skip_duplicated_paths \{#type_json_skip_duplicated_paths\}

<SettingsInfoBlock type="Bool" default_value="0" />

При включении при разборе JSON-объекта в тип JSON дублирующиеся пути игнорируются, и вместо выбрасывания исключения вставляется только первое значение.

## type_json_skip_invalid_typed_paths \{#type_json_skip_invalid_typed_paths\}

<SettingsInfoBlock type="Bool" default_value="0" />

При включении поля, значения которых не могут быть приведены к объявленному типу в столбцах типа JSON с типизированными путями, пропускаются вместо выброса ошибки. Пропущенные поля рассматриваются как отсутствующие и используют значения по умолчанию/null в соответствии с определением типизированного пути.

Этот параметр применяется только к столбцам типа JSON (например, JSON(a Int64, b String)), для которых для конкретных путей объявлены типы. Он не применяется к обычным форматам входных данных JSON, таким как JSONEachRow, при вставке в обычные типизированные столбцы.

Возможные значения:

+ 0 — Отключить (вызывать ошибку при несоответствии типов).
+ 1 — Включить (пропускать поле при несоответствии типов).

## type_json_use_partial_match_to_skip_paths_by_regexp \{#type_json_use_partial_match_to_skip_paths_by_regexp\}

<SettingsInfoBlock type="Bool" default_value="1" />

Когда параметр включён, при разборе JSON-объекта в значение типа JSON регулярные выражения, заданные с помощью SKIP REGEXP, требуют частичного совпадения, чтобы путь был пропущен. Когда параметр отключён, для пропуска пути требуется полное совпадение.

## validate_experimental_and_suspicious_types_inside_nested_types \{#validate_experimental_and_suspicious_types_inside_nested_types\}

<SettingsInfoBlock type="Bool" default_value="1" />

Проверять использование экспериментальных и подозрительных типов внутри вложенных типов, таких как Array/Map/Tuple