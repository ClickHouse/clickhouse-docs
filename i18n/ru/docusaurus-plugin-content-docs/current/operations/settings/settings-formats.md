---
title: 'Настройки форматов'
sidebar_label: 'Настройки форматов'
slug: /operations/settings/formats
toc_max_heading_level: 2
description: 'Настройки, которые контролируют входные и выходные форматы.'
doc_type: 'reference'
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
import BetaBadge from '@theme/badges/BetaBadge';
import SettingsInfoBlock from '@theme/SettingsInfoBlock/SettingsInfoBlock';
import VersionHistory from '@theme/VersionHistory/VersionHistory';

{/* Автоматически сгенерировано */ }

Эти настройки автоматически сгенерированы из [исходного кода](https://github.com/ClickHouse/ClickHouse/blob/master/src/Core/FormatFactorySettings.h).

## allow_special_bool_values_inside_variant {#allow_special_bool_values_inside_variant}   

<SettingsInfoBlock type="Bool" default_value="0" />

Позволяет разбирать значения Bool внутри типа Variant из специальных текстовых булевых значений, таких как "on", "off", "enable", "disable" и т. д.

## bool_false_representation {#bool_false_representation}   

<SettingsInfoBlock type="String" default_value="false" />

Текст, используемый для представления значения `false` логического типа в форматах TSV/CSV/Vertical/Pretty.

## bool_true_representation {#bool_true_representation}   

<SettingsInfoBlock type="String" default_value="true" />

Текстовое представление логического значения `true` в форматах TSV/CSV/Vertical/Pretty.

## column_names_for_schema_inference {#column_names_for_schema_inference}   



Список названий столбцов, используемых для вывода схемы для форматов без названий столбцов. Формат: 'column1,column2,column3,...'

## cross_to_inner_join_rewrite {#cross_to_inner_join_rewrite}   

<SettingsInfoBlock type="UInt64" default_value="1" />

Использовать `INNER JOIN` вместо запятой/`CROSS JOIN`, если в секции `WHERE` есть выражения соединения. Значения: 0 — не переписывать, 1 — по возможности применять для запятой/`CROSS JOIN`, 2 — принудительно переписывать все соединения через запятую, cross — по возможности.

## date_time_64_output_format_cut_trailing_zeros_align_to_groups_of_thousands {#date_time_64_output_format_cut_trailing_zeros_align_to_groups_of_thousands}   

<SettingsInfoBlock type="Bool" default_value="0" />

Динамически удаляет конечные нули в значениях `datetime64`, чтобы корректировать масштаб вывода до [0, 3, 6],
соответствующих «секундам», «миллисекундам» и «микросекундам».

## date_time_input_format {#date_time_input_format}   

<SettingsInfoBlock type="DateTimeInputFormat" default_value="basic" />

Позволяет выбрать парсер текстового представления даты и времени.

Настройка не применяется к [функциям для работы с датой и временем](../../sql-reference/functions/date-time-functions.md).

Возможные значения:

- `'best_effort'` — Включает расширенный режим разбора.

    ClickHouse может разбирать базовый формат `YYYY-MM-DD HH:MM:SS` и все форматы даты и времени [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601). Например, `'2018-06-08T01:02:03.000Z'`.

- `'best_effort_us'` — Аналогично `best_effort` (см. отличие в [parseDateTimeBestEffortUS](../../sql-reference/functions/type-conversion-functions#parsedatetimebesteffortus)).

- `'basic'` — Использовать базовый парсер.

    ClickHouse может разбирать только базовый формат `YYYY-MM-DD HH:MM:SS` или `YYYY-MM-DD`. Например, `2019-08-20 10:18:56` или `2019-08-20`.

Значение по умолчанию в ClickHouse Cloud: `'best_effort'`.

См. также:

- [Тип данных DateTime.](../../sql-reference/data-types/datetime.md)
- [Функции для работы с датами и временем.](../../sql-reference/functions/date-time-functions.md)

## date_time_output_format {#date_time_output_format}   

<SettingsInfoBlock type="DateTimeOutputFormat" default_value="simple" />

Позволяет выбрать формат текстового представления даты и времени при выводе.

Возможные значения:

- `simple` — простой формат вывода.

    ClickHouse выводит дату и время в формате `YYYY-MM-DD hh:mm:ss`. Например, `2019-08-20 10:18:56`. Расчёт выполняется в соответствии с часовым поясом типа данных (если он задан) или часовым поясом сервера.

- `iso` — формат вывода ISO.

    ClickHouse выводит дату и время в формате [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) `YYYY-MM-DDThh:mm:ssZ`. Например, `2019-08-20T10:18:56Z`. Обратите внимание, что вывод производится в UTC (`Z` означает UTC).

- `unix_timestamp` — формат вывода Unix timestamp.

    ClickHouse выводит дату и время в формате [Unix timestamp](https://en.wikipedia.org/wiki/Unix_time). Например, `1566285536`.

См. также:

- [Тип данных DateTime.](../../sql-reference/data-types/datetime.md)
- [Функции для работы с датами и временем.](../../sql-reference/functions/date-time-functions.md)

## date_time_overflow_behavior {#date_time_overflow_behavior}   

<SettingsInfoBlock type="DateTimeOverflowBehavior" default_value="ignore" />

Определяет поведение при преобразовании типов [Date](../../sql-reference/data-types/date.md), [Date32](../../sql-reference/data-types/date32.md), [DateTime](../../sql-reference/data-types/datetime.md), [DateTime64](../../sql-reference/data-types/datetime64.md) или целочисленных значений в типы Date, Date32, DateTime или DateTime64, когда значение не может быть представлено в результирующем типе.

Возможные значения:

- `ignore` — Без уведомления игнорировать переполнения. Результат не определён.
- `throw` — Выбрасывать исключение в случае переполнения.
- `saturate` — Насыщать результат. Если значение меньше минимального значения, которое может быть представлено целевым типом, в качестве результата выбирается минимальное представимое значение. Если значение больше максимального значения, которое может быть представлено целевым типом, в качестве результата выбирается максимальное представимое значение.

Значение по умолчанию: `ignore`.

## dictionary_use_async_executor {#dictionary_use_async_executor}   

<SettingsInfoBlock type="Bool" default_value="0" />

Запускает конвейер чтения из источника словаря в нескольких потоках. Поддерживается только словарями с локальным источником CLICKHOUSE.

## errors_output_format {#errors_output_format}   

<SettingsInfoBlock type="String" default_value="CSV" />

Метод записи ошибок в текстовый вывод.

## exact_rows_before_limit {#exact_rows_before_limit}   

<SettingsInfoBlock type="Bool" default_value="0" />

Когда этот параметр включён, ClickHouse будет возвращать точное значение статистики rows_before_limit_at_least, но ценой того, что данные до применения LIMIT придётся полностью прочитать.

## format_avro_schema_registry_url {#format_avro_schema_registry_url}   



Для формата AvroConfluent: URL-адрес реестра схем Confluent.

## format_binary_max_array_size {#format_binary_max_array_size}   

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

Максимально допустимый размер `Array` в формате `RowBinary`. Это предотвращает выделение большого объёма памяти при повреждении данных. Значение `0` означает отсутствие ограничения.

## format_binary_max_string_size {#format_binary_max_string_size}   

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

Максимально допустимый размер значения типа String в формате RowBinary. Предотвращает выделение большого объёма памяти в случае повреждённых данных. Значение 0 означает отсутствие ограничения.

## format_capn_proto_enum_comparising_mode {#format_capn_proto_enum_comparising_mode}   

<SettingsInfoBlock type="CapnProtoEnumComparingMode" default_value="by_values" />

Как сопоставлять перечисления Enum ClickHouse и CapnProto

## format_capn_proto_use_autogenerated_schema {#format_capn_proto_use_autogenerated_schema}   

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать автоматически сгенерированную схему CapnProto, если format_schema не задан

## format_csv_allow_double_quotes {#format_csv_allow_double_quotes}   

<SettingsInfoBlock type="Bool" default_value="1" />

Если установлено в значение true, разрешает строки, заключённые в двойные кавычки.

## format_csv_allow_single_quotes {#format_csv_allow_single_quotes}   

<SettingsInfoBlock type="Bool" default_value="0" />

Если установлено в true, разрешает использование строк в одинарных кавычках.

## format_csv_delimiter {#format_csv_delimiter}   

<SettingsInfoBlock type="Char" default_value="," />

Символ, который будет использоваться как разделитель в данных CSV. Если задаёте значение строкой, длина строки должна быть равна 1.

## format_csv_null_representation {#format_csv_null_representation}   

<SettingsInfoBlock type="String" default_value="\N" />

Настраиваемое представление NULL в формате CSV

## format_custom_escaping_rule {#format_custom_escaping_rule}   

<SettingsInfoBlock type="EscapingRule" default_value="Экранирование" />

Правило экранирования полей (для формата CustomSeparated)

## format_custom_field_delimiter {#format_custom_field_delimiter}   

<SettingsInfoBlock type="String" default_value="	" />

Разделитель между полями (для формата CustomSeparated)

## format_custom_result_after_delimiter {#format_custom_result_after_delimiter}   



Суффикс, добавляемый после набора результатов (для формата CustomSeparated)

## format_custom_result_before_delimiter {#format_custom_result_before_delimiter}   



Префикс перед результирующим набором (для формата CustomSeparated)

## format_custom_row_after_delimiter {#format_custom_row_after_delimiter}   

<SettingsInfoBlock type="String" default_value="
" />

Разделитель после поля в последнем столбце (для формата CustomSeparated)

## format_custom_row_before_delimiter {#format_custom_row_before_delimiter}   



Разделитель перед полем в первом столбце (для формата CustomSeparated)

## format_custom_row_between_delimiter {#format_custom_row_between_delimiter}   



Разделитель между строками (для формата CustomSeparated)

## format_display_secrets_in_show_and_select {#format_display_secrets_in_show_and_select}   

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает отображение секретов в запросах `SHOW` и `SELECT` для таблиц, баз данных,
табличных функций и словарей.

Чтобы пользователь мог видеть секреты, у него также должна быть включена
настройка сервера [`display_secrets_in_show_and_select`](../server-configuration-parameters/settings#display_secrets_in_show_and_select)
и выдана привилегия
[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect).

Возможные значения:

-   0 — Отключено.
-   1 — Включено.

## format_json_object_each_row_column_for_object_name {#format_json_object_each_row_column_for_object_name}   



Имя столбца, которое будет использоваться для хранения/записи имён объектов в формате [JSONObjectEachRow](/interfaces/formats/JSONObjectEachRow).
Тип столбца должен быть `String`. Если значение не задано, им объектам будут присвоены имена по умолчанию `row_{i}`.

## format_protobuf_use_autogenerated_schema {#format_protobuf_use_autogenerated_schema}   

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать автоматически сгенерированный Protobuf, если format_schema не задан

## format_regexp {#format_regexp}   



Регулярное выражение (для формата Regexp)

## format_regexp_escaping_rule {#format_regexp_escaping_rule}   

<SettingsInfoBlock type="EscapingRule" default_value="Raw" />

Правило экранирования полей (для формата Regexp)

## format_regexp_skip_unmatched {#format_regexp_skip_unmatched}   

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускать строки, не соответствующие регулярному выражению (для формата Regexp)

## format_schema {#format_schema}   



Этот параметр используется при работе с форматами, которым требуется определение схемы, такими как [Cap'n Proto](https://capnproto.org/) или [Protobuf](https://developers.google.com/protocol-buffers/). Его значение зависит от формата.

## format_schema_message_name {#format_schema_message_name}   



Определяет имя требуемого сообщения в схеме, заданной в `format_schema`.
Чтобы сохранить совместимость с устаревшим форматом `format_schema` (`file_name:message_name`):
- Если `format_schema_message_name` не указан, имя сообщения извлекается из части `message_name` устаревшего значения `format_schema`.
- Если `format_schema_message_name` указан при использовании устаревшего формата, будет сгенерирована ошибка.

## format_schema_source {#format_schema_source}   

<SettingsInfoBlock type="String" default_value="file" />

Определяет источник значения `format_schema`.
Возможные значения:
- 'file' (по умолчанию): `format_schema` — это имя файла схемы, расположенного в директории `format_schemas`.
- 'string': `format_schema` — это буквальное содержимое схемы.
- 'query': `format_schema` — это запрос для получения схемы.
Когда для `format_schema_source` установлено значение 'query', применяются следующие условия:
- Запрос должен возвращать ровно одно значение: одну строку с одним столбцом строкового типа.
- Результат запроса трактуется как содержимое схемы.
- Этот результат кэшируется локально в директории `format_schemas`.
- Вы можете очистить локальный кэш с помощью команды: `SYSTEM DROP FORMAT SCHEMA CACHE FOR Files`.
- После кэширования идентичные запросы не выполняются повторно для получения схемы, пока кэш явно не очищен.
- В дополнение к локальным файлам кэша сообщения Protobuf также кэшируются в оперативной памяти. Даже после очистки локальных файлов кэша кэш в памяти необходимо очистить с помощью `SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf]`, чтобы полностью обновить схему.
- Выполните запрос `SYSTEM DROP FORMAT SCHEMA CACHE`, чтобы очистить кэш как для файлов кэша, так и для схем сообщений Protobuf одновременно.

## format_template_resultset {#format_template_resultset}   



Путь к файлу, содержащему строку формата для результирующего набора (для формата Template)

## format_template_resultset_format {#format_template_resultset_format}   



Форматная строка для результирующего набора данных (для формата Template)

## format_template_row {#format_template_row}   



Путь к файлу, содержащему строку формата для строк (для формата Template)

## format_template_row_format {#format_template_row_format}   



Форматная строка для строк (для формата Template)

## format_template_rows_between_delimiter {#format_template_rows_between_delimiter}   

<SettingsInfoBlock type="String" default_value="
" />

Разделитель строк (для формата Template)

## format_tsv_null_representation {#format_tsv_null_representation}   

<SettingsInfoBlock type="String" default_value="\N" />

Настраиваемое представление значения NULL в формате TSV

## input_format_allow_errors_num {#input_format_allow_errors_num}   

<SettingsInfoBlock type="UInt64" default_value="0" />

Устанавливает максимальное число допустимых ошибок при чтении из текстовых форматов (CSV, TSV и т. д.).

Значение по умолчанию — 0.

Всегда используйте вместе с `input_format_allow_errors_ratio`.

Если при чтении строк произошла ошибка, но счётчик ошибок всё ещё меньше `input_format_allow_errors_num`, ClickHouse игнорирует строку и переходит к следующей.

Если превышены и `input_format_allow_errors_num`, и `input_format_allow_errors_ratio`, ClickHouse генерирует исключение.

## input_format_allow_errors_ratio {#input_format_allow_errors_ratio}   

<SettingsInfoBlock type="Float" default_value="0" />

Устанавливает максимальный процент допускаемых ошибок при чтении текстовых форматов (CSV, TSV и т. д.).
Процент ошибок задаётся числом с плавающей запятой в диапазоне от 0 до 1.

Значение по умолчанию — 0.

Всегда используйте этот параметр вместе с `input_format_allow_errors_num`.

Если при чтении строк произошла ошибка, но счётчик ошибок всё ещё меньше `input_format_allow_errors_ratio`, ClickHouse игнорирует строку и переходит к следующей.

Если превышены и `input_format_allow_errors_num`, и `input_format_allow_errors_ratio`, ClickHouse выбрасывает исключение.

## input_format_allow_seeks {#input_format_allow_seeks}   

<SettingsInfoBlock type="Bool" default_value="1" />

Позволяет выполнять произвольное позиционирование (seek) при чтении во входных форматах ORC/Parquet/Arrow.

Включено по умолчанию.

## input_format_arrow_allow_missing_columns {#input_format_arrow_allow_missing_columns}   

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает отсутствие столбцов при чтении входных форматов Arrow

## input_format_arrow_case_insensitive_column_matching {#input_format_arrow_case_insensitive_column_matching}   

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорировать регистр при сопоставлении столбцов Arrow со столбцами CH.

## input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference {#input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускать столбцы с неподдерживаемыми типами при определении схемы для формата Arrow

## input_format_avro_allow_missing_fields {#input_format_avro_allow_missing_fields}   

<SettingsInfoBlock type="Bool" default_value="0" />

Для форматов Avro/AvroConfluent: при отсутствии поля в схеме использовать значение по умолчанию вместо возникновения ошибки

## input_format_avro_null_as_default {#input_format_avro_null_as_default}   

<SettingsInfoBlock type="Bool" default_value="0" />

Для формата Avro/AvroConfluent: подставлять значение по умолчанию при получении NULL для столбца с типом, не допускающим NULL

## input_format_binary_decode_types_in_binary_format {#input_format_binary_decode_types_in_binary_format}   

<SettingsInfoBlock type="Bool" default_value="0" />

Читать типы данных в двоичном формате вместо названий типов во входном формате RowBinaryWithNamesAndTypes

## input_format_binary_read_json_as_string {#input_format_binary_read_json_as_string}   

<SettingsInfoBlock type="Bool" default_value="0" />

Считывает значения типа данных [JSON](../../sql-reference/data-types/newjson.md) в формате ввода RowBinary как значения типа [String](../../sql-reference/data-types/string.md), содержащие JSON.

## input_format_bson_skip_fields_with_unsupported_types_in_schema_inference {#input_format_bson_skip_fields_with_unsupported_types_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускать поля с неподдерживаемыми типами при автоматическом определении схемы для формата BSON.

## input_format_capn_proto_skip_fields_with_unsupported_types_in_schema_inference {#input_format_capn_proto_skip_fields_with_unsupported_types_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускать столбцы с неподдерживаемыми типами при автоматическом определении схемы для формата CapnProto

## input_format_csv_allow_cr_end_of_line {#input_format_csv_allow_cr_end_of_line}   

<SettingsInfoBlock type="Bool" default_value="0" />

Если установлено в значение true, символ \\r будет допускаться в конце строки, если за ним не следует 

## input_format_csv_allow_variable_number_of_columns {#input_format_csv_allow_variable_number_of_columns}   

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорировать лишние столбцы во входных данных CSV (если файл содержит больше столбцов, чем ожидается) и использовать значения по умолчанию для отсутствующих полей во входных данных CSV

## input_format_csv_allow_whitespace_or_tab_as_delimiter {#input_format_csv_allow_whitespace_or_tab_as_delimiter}   

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает использовать пробелы и табуляцию (\\t) в качестве разделителя полей в строках CSV

## input_format_csv_arrays_as_nested_csv {#input_format_csv_arrays_as_nested_csv}   

<SettingsInfoBlock type="Bool" default_value="0" />

При чтении значения типа `Array` из CSV предполагается, что его элементы были сериализованы во вложенный CSV и затем помещены в строку. Пример: \"[\"\"Hello\"\", \"\"world\"\", \"\"42\"\"\"\" TV\"\"]\". Квадратные скобки вокруг массива можно опустить.

## input_format_csv_deserialize_separate_columns_into_tuple {#input_format_csv_deserialize_separate_columns_into_tuple}   

<SettingsInfoBlock type="Bool" default_value="1" />

Если параметр установлен в значение `true`, отдельные столбцы, записанные в формате CSV, могут быть десериализованы в столбец типа Tuple.

## input_format_csv_detect_header {#input_format_csv_detect_header}   

<SettingsInfoBlock type="Bool" default_value="1" />

Автоматически определять наличие заголовка с именами и типами в формате CSV

## input_format_csv_empty_as_default {#input_format_csv_empty_as_default}   

<SettingsInfoBlock type="Bool" default_value="1" />

Рассматривать пустые поля во входных данных CSV как значения по умолчанию.

## input_format_csv_enum_as_number {#input_format_csv_enum_as_number}   

<SettingsInfoBlock type="Bool" default_value="0" />

Рассматривать вставляемые значения Enum в форматах CSV как числовые индексы перечисления

## input_format_csv_skip_first_lines {#input_format_csv_skip_first_lines}   

<SettingsInfoBlock type="UInt64" default_value="0" />

Пропускает указанное количество строк в начале данных в формате CSV

## input_format_csv_skip_trailing_empty_lines {#input_format_csv_skip_trailing_empty_lines}   

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускать пустые строки в конце CSV

## input_format_csv_trim_whitespaces {#input_format_csv_trim_whitespaces}   

<SettingsInfoBlock type="Bool" default_value="1" />

Удаляет пробелы и символы табуляции (\\t) в начале и в конце строк CSV

## input_format_csv_try_infer_numbers_from_strings {#input_format_csv_try_infer_numbers_from_strings}   

<SettingsInfoBlock type="Bool" default_value="0" />

Если включено, при определении схемы ClickHouse будет пытаться определять числа в строковых полях.
Это может быть полезно, если данные CSV содержат заключённые в кавычки числа типа UInt64.

По умолчанию отключено.

## input_format_csv_try_infer_strings_from_quoted_tuples {#input_format_csv_try_infer_strings_from_quoted_tuples}   

<SettingsInfoBlock type="Bool" default_value="1" />

Интерпретирует заключённые в кавычки кортежи во входных данных как значение типа String.

## input_format_csv_use_best_effort_in_schema_inference {#input_format_csv_use_best_effort_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="1" />

Применять дополнительные приёмы и эвристики для определения схемы по данным в формате CSV

## input_format_csv_use_default_on_bad_values {#input_format_csv_use_default_on_bad_values}   

<SettingsInfoBlock type="Bool" default_value="0" />

Позволяет задавать значение по умолчанию для столбца, если при десериализации поля CSV произошла ошибка из‑за некорректного значения

## input_format_custom_allow_variable_number_of_columns {#input_format_custom_allow_variable_number_of_columns}   

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорировать лишние столбцы во входных данных CustomSeparated (если в файле больше столбцов, чем ожидается) и рассматривать отсутствующие поля во входных данных CustomSeparated как значения по умолчанию

## input_format_custom_detect_header {#input_format_custom_detect_header}   

<SettingsInfoBlock type="Bool" default_value="1" />

Автоматически распознавать заголовок с именами столбцов и их типами в формате CustomSeparated

## input_format_custom_skip_trailing_empty_lines {#input_format_custom_skip_trailing_empty_lines}   

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускать пустые строки в конце в формате CustomSeparated

## input_format_defaults_for_omitted_fields {#input_format_defaults_for_omitted_fields}   

<SettingsInfoBlock type="Bool" default_value="1" />

При выполнении запросов `INSERT` пропущенные значения входных столбцов заменяются значениями по умолчанию для соответствующих столбцов. Этот параметр применяется к форматам [JSONEachRow](/interfaces/formats/JSONEachRow) (и другим JSON-форматам), [CSV](/interfaces/formats/CSV), [TabSeparated](/interfaces/formats/TabSeparated), [TSKV](/interfaces/formats/TSKV), [Parquet](/interfaces/formats/Parquet), [Arrow](/interfaces/formats/Arrow), [Avro](/interfaces/formats/Avro), [ORC](/interfaces/formats/ORC), [Native](/interfaces/formats/Native), а также к форматам с суффиксами `WithNames`/`WithNamesAndTypes`.

:::note
Когда этот параметр включён, расширенные метаданные таблицы передаются от сервера к клиенту. Это потребляет дополнительные вычислительные ресурсы на сервере и может снизить производительность.
:::

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## input_format_force_null_for_omitted_fields {#input_format_force_null_for_omitted_fields}   

<SettingsInfoBlock type="Bool" default_value="0" />

Принудительно инициализировать опущенные поля значением NULL

## input_format_hive_text_allow_variable_number_of_columns {#input_format_hive_text_allow_variable_number_of_columns}   

<SettingsInfoBlock type="Bool" default_value="1" />

Игнорировать лишние столбцы во входных данных Hive Text (если файл содержит больше столбцов, чем ожидается) и обрабатывать отсутствующие поля во входных данных Hive Text как значения по умолчанию.

## input_format_hive_text_collection_items_delimiter {#input_format_hive_text_collection_items_delimiter}   

<SettingsInfoBlock type="Char" default_value="" />

Разделитель между элементами коллекции (array или map) в текстовом файле Hive (Hive Text File)

## input_format_hive_text_fields_delimiter {#input_format_hive_text_fields_delimiter}   

<SettingsInfoBlock type="Char" default_value="" />

Разделитель между полями в текстовом файле Hive

## input_format_hive_text_map_keys_delimiter {#input_format_hive_text_map_keys_delimiter}   

<SettingsInfoBlock type="Char" default_value="" />

Разделитель между элементами (парами ключ–значение) отображения (map) в Hive Text File

## input_format_import_nested_json {#input_format_import_nested_json}   

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает вставку JSON-данных со вложенными объектами.

Поддерживаемые форматы:

- [JSONEachRow](/interfaces/formats/JSONEachRow)

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

См. также:

- [Использование вложенных структур](/integrations/data-formats/json/other-formats#accessing-nested-json-objects) с форматом `JSONEachRow`.

## input_format_ipv4_default_on_conversion_error {#input_format_ipv4_default_on_conversion_error}   

<SettingsInfoBlock type="Bool" default_value="0" />

Десериализация IPv4 будет использовать значения по умолчанию вместо выбрасывания исключения при ошибке преобразования.

По умолчанию отключено.

## input_format_ipv6_default_on_conversion_error {#input_format_ipv6_default_on_conversion_error}   

<SettingsInfoBlock type="Bool" default_value="0" />

При десериализации IPv6-адресов вместо выбрасывания исключения при ошибке преобразования будут использоваться значения по умолчанию.

По умолчанию параметр отключён.

## input_format_json_compact_allow_variable_number_of_columns {#input_format_json_compact_allow_variable_number_of_columns}   

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает использовать переменное количество столбцов в строках во входных форматах JSONCompact/JSONCompactEachRow.
Игнорирует лишние столбцы в строках, содержащих больше столбцов, чем ожидается, и считает отсутствующие столбцы значениями по умолчанию.

По умолчанию отключено.

## input_format_json_defaults_for_missing_elements_in_named_tuple {#input_format_json_defaults_for_missing_elements_in_named_tuple}   

<SettingsInfoBlock type="Bool" default_value="1" />

Подставлять значения по умолчанию для отсутствующих элементов в JSON-объекте при разборе именованного кортежа.
Этот параметр работает только при включённой настройке `input_format_json_named_tuples_as_objects`.

Включено по умолчанию.

## input_format_json_empty_as_default {#input_format_json_empty_as_default}   

<SettingsInfoBlock type="Bool" default_value="0" />

Если параметр включён, пустые поля во входном JSON заменяются значениями по умолчанию. Для сложных выражений значений по умолчанию необходимо также включить `input_format_defaults_for_omitted_fields`.

Возможные значения:

+ 0 — Отключено.
+ 1 — Включено.

## input_format_json_ignore_unknown_keys_in_named_tuple {#input_format_json_ignore_unknown_keys_in_named_tuple}   

<SettingsInfoBlock type="Bool" default_value="1" />

Игнорирует неизвестные ключи в JSON-объекте для именованных кортежей.

Включено по умолчанию.

## input_format_json_ignore_unnecessary_fields {#input_format_json_ignore_unnecessary_fields}   

<SettingsInfoBlock type="Bool" default_value="1" />

Игнорировать ненужные поля и не парсить их. Включение этой настройки может привести к тому, что исключения не будут генерироваться для JSON-строк с некорректным форматом или с дублирующимися полями.

## input&#95;format&#95;json&#95;infer&#95;array&#95;of&#95;dynamic&#95;from&#95;array&#95;of&#95;different&#95;types {#input_format_json_infer_array_of_dynamic_from_array_of_different_types}

<SettingsInfoBlock type="Bool" default_value="1" />

Если параметр включён, во время определения схемы ClickHouse будет использовать тип Array(Dynamic) для JSON-массивов со значениями разных типов данных.

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

Включено по умолчанию.

## input&#95;format&#95;json&#95;infer&#95;incomplete&#95;types&#95;as&#95;strings {#input_format_json_infer_incomplete_types_as_strings}

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает использовать тип String для JSON-ключей, которые содержат только `Null`/`{}`/`[]` в образце данных при выводе схемы.
В JSON-форматах любое значение может быть считано как String, и мы можем избежать ошибок вида `Cannot determine type for column 'column_name' by first 25000 rows of data, most likely this column contains only Nulls or empty Arrays/Maps` при выводе схемы,
используя тип String для ключей с неизвестными типами.

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

## input_format_json_map_as_array_of_tuples {#input_format_json_map_as_array_of_tuples}   

<SettingsInfoBlock type="Bool" default_value="0" />

Десериализует столбцы типа Map в виде JSON-массивов кортежей.

По умолчанию отключено.

## input_format_json_max_depth {#input_format_json_max_depth}   

<SettingsInfoBlock type="UInt64" default_value="1000" />

Максимальная глубина поля в JSON. Это не строгое ограничение, его не обязательно соблюдать в точности.

## input_format_json_named_tuples_as_objects {#input_format_json_named_tuples_as_objects}   

<SettingsInfoBlock type="Bool" default_value="1" />

Разбирать столбцы с именованными кортежами как объекты JSON.

Включено по умолчанию.

## input&#95;format&#95;json&#95;read&#95;arrays&#95;as&#95;strings {#input_format_json_read_arrays_as_strings}

<SettingsInfoBlock type="Bool" default_value="1" />

Позволяет разбирать массивы JSON как строки во входных форматах JSON.

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

Включено по умолчанию.

## input_format_json_read_bools_as_numbers {#input_format_json_read_bools_as_numbers}   

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает парсинг логических значений типа `bool` как чисел во входных форматах JSON.

Включено по умолчанию.

## input_format_json_read_bools_as_strings {#input_format_json_read_bools_as_strings}   

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает интерпретировать логические значения как строки во входных форматах JSON.

Включено по умолчанию.

## input_format_json_read_numbers_as_strings {#input_format_json_read_numbers_as_strings}   

<SettingsInfoBlock type="Bool" default_value="1" />

Позволяет разбирать числа как строки во входных форматах JSON.

Включено по умолчанию.

## input&#95;format&#95;json&#95;read&#95;objects&#95;as&#95;strings {#input_format_json_read_objects_as_strings}

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает парсить объекты JSON как строки во входных форматах JSON.

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

По умолчанию включено.

## input_format_json_throw_on_bad_escape_sequence {#input_format_json_throw_on_bad_escape_sequence}   

<SettingsInfoBlock type="Bool" default_value="1" />

Выбрасывать исключение, если JSON-строка содержит некорректную escape-последовательность во входных форматах JSON. Если параметр отключен, некорректные escape-последовательности будут сохранены в данных без изменений.

По умолчанию включен.

## input&#95;format&#95;json&#95;try&#95;infer&#95;named&#95;tuples&#95;from&#95;objects {#input_format_json_try_infer_named_tuples_from_objects}

<SettingsInfoBlock type="Bool" default_value="1" />

Если параметр включён, при определении схемы ClickHouse будет пытаться выводить именованные `Tuple` из JSON-объектов.
Полученный именованный `Tuple` будет содержать все элементы из всех соответствующих JSON-объектов в выборке данных.

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

## input_format_json_try_infer_numbers_from_strings {#input_format_json_try_infer_numbers_from_strings}   

<SettingsInfoBlock type="Bool" default_value="0" />

Если включено, при определении схемы ClickHouse будет пытаться распознавать числовые значения в строковых полях.
Это может быть полезно, если JSON‑данные содержат заключённые в кавычки числа типа UInt64.

По умолчанию выключено.

## input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects {#input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects}   

<SettingsInfoBlock type="Bool" default_value="0" />

Использовать тип String вместо генерации исключения в случае неоднозначных путей в объектах JSON при выводе типа именованных кортежей

## input_format_json_validate_types_from_metadata {#input_format_json_validate_types_from_metadata}   

<SettingsInfoBlock type="Bool" default_value="1" />

Для входных форматов JSON/JSONCompact/JSONColumnsWithMetadata, если этот параметр принимает значение 1,
типы из метаданных во входных данных будут сравниваться с типами соответствующих столбцов в таблице.

Включено по умолчанию.

## input_format_max_block_size_bytes {#input_format_max_block_size_bytes}   

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает размер блоков, формируемых при разборе данных во входных форматах, в байтах. Используется в построчных входных форматах, когда блок формируется на стороне ClickHouse.
0 означает отсутствие ограничения по размеру в байтах.

## input_format_max_bytes_to_read_for_schema_inference {#input_format_max_bytes_to_read_for_schema_inference}   

<SettingsInfoBlock type="UInt64" default_value="33554432" />

Максимальный объём данных в байтах, считываемый для автоматического вывода схемы.

## input_format_max_rows_to_read_for_schema_inference {#input_format_max_rows_to_read_for_schema_inference}   

<SettingsInfoBlock type="UInt64" default_value="25000" />

Максимальное количество строк данных, считываемых при автоматическом определении схемы.

## input_format_msgpack_number_of_columns {#input_format_msgpack_number_of_columns}   

<SettingsInfoBlock type="UInt64" default_value="0" />

Количество столбцов во вставляемых данных в формате MsgPack. Используется для автоматического вывода схемы по данным.

## input_format_mysql_dump_map_column_names {#input_format_mysql_dump_map_column_names}   

<SettingsInfoBlock type="Bool" default_value="1" />

Сопоставлять столбцы в дампе MySQL и столбцы таблицы ClickHouse по именам

## input_format_mysql_dump_table_name {#input_format_mysql_dump_table_name}   



Имя таблицы в дампе MySQL, из которой читать данные

## input_format_native_allow_types_conversion {#input_format_native_allow_types_conversion}   

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает преобразование типов данных в формате ввода Native

## input_format_native_decode_types_in_binary_format {#input_format_native_decode_types_in_binary_format}   

<SettingsInfoBlock type="Bool" default_value="0" />

Считывать типы данных в двоичном формате вместо их названий в формате ввода Native

## input_format_null_as_default {#input_format_null_as_default}   

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает инициализацию полей [NULL](/sql-reference/syntax#literals) [значениями по умолчанию](/sql-reference/statements/create/table#default_values), если тип данных этих полей не является [Nullable](/sql-reference/data-types/nullable).
Если тип столбца не Nullable и эта настройка отключена, вставка `NULL` приводит к исключению. Если тип столбца Nullable, то значения `NULL` вставляются как есть, независимо от этой настройки.

Эта настройка применима к большинству форматов ввода.

Для сложных выражений по умолчанию настройка `input_format_defaults_for_omitted_fields` также должна быть включена.

Возможные значения:

- 0 — вставка `NULL` в столбец с типом, не допускающим Nullable, приводит к исключению.
- 1 — поля `NULL` инициализируются значениями столбца по умолчанию.

## input_format_orc_allow_missing_columns {#input_format_orc_allow_missing_columns}   

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает отсутствие столбцов при чтении входных данных в формате ORC

## input_format_orc_case_insensitive_column_matching {#input_format_orc_case_insensitive_column_matching}   

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорировать регистр при сопоставлении столбцов ORC со столбцами ClickHouse.

## input_format_orc_dictionary_as_low_cardinality {#input_format_orc_dictionary_as_low_cardinality}   

<SettingsInfoBlock type="Bool" default_value="1" />

Обрабатывать столбцы ORC, закодированные с помощью словаря, как столбцы LowCardinality при чтении файлов ORC.

## input_format_orc_filter_push_down {#input_format_orc_filter_push_down}   

<SettingsInfoBlock type="Bool" default_value="1" />

При чтении файлов ORC целиком пропускаются страйпы (stripes) или группы строк на основе выражений WHERE/PREWHERE, статистики min/max или фильтра Блума в метаданных ORC.

## input_format_orc_reader_time_zone_name {#input_format_orc_reader_time_zone_name}   

<SettingsInfoBlock type="String" default_value="GMT" />

Имя часового пояса для ORC row reader; по умолчанию используется часовой пояс GMT.

## input_format_orc_row_batch_size {#input_format_orc_row_batch_size}   

<SettingsInfoBlock type="Int64" default_value="100000" />

Размер пакета при чтении страйпов ORC.

## input_format_orc_skip_columns_with_unsupported_types_in_schema_inference {#input_format_orc_skip_columns_with_unsupported_types_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускать столбцы с неподдерживаемыми типами при определении схемы для формата ORC

## input_format_orc_use_fast_decoder {#input_format_orc_use_fast_decoder}   

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать более быструю реализацию декодера ORC.

## input_format_parquet_allow_geoparquet_parser {#input_format_parquet_allow_geoparquet_parser}   

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать парсер геоколонок для преобразования значений Array(UInt8) в типы Point/Linestring/Polygon/MultiLineString/MultiPolygon

## input_format_parquet_allow_missing_columns {#input_format_parquet_allow_missing_columns}   

<SettingsInfoBlock type="Bool" default_value="1" />

Допускает отсутствие столбцов при чтении входных данных в формате Parquet

## input_format_parquet_bloom_filter_push_down {#input_format_parquet_bloom_filter_push_down}   

<SettingsInfoBlock type="Bool" default_value="1" />

При чтении файлов Parquet позволяет пропускать целые группы строк на основе выражений WHERE и bloom-фильтра в метаданных Parquet.

## input_format_parquet_case_insensitive_column_matching {#input_format_parquet_case_insensitive_column_matching}   

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорировать регистр при сопоставлении столбцов Parquet со столбцами ClickHouse.

## input_format_parquet_enable_json_parsing {#input_format_parquet_enable_json_parsing}   

<SettingsInfoBlock type="Bool" default_value="1" />

При чтении файлов Parquet разбирать столбцы JSON как столбцы JSON в ClickHouse.

## input_format_parquet_enable_row_group_prefetch {#input_format_parquet_enable_row_group_prefetch}   

<SettingsInfoBlock type="Bool" default_value="1" />

Включает предварительную выборку групп строк при разборе Parquet. В данный момент предварительная выборка поддерживается только при однопоточном разборе.

## input_format_parquet_filter_push_down {#input_format_parquet_filter_push_down}   

<SettingsInfoBlock type="Bool" default_value="1" />

При чтении файлов Parquet целые группы строк пропускаются на основе выражений WHERE/PREWHERE и статистики минимальных и максимальных значений в метаданных Parquet.

## input_format_parquet_local_file_min_bytes_for_seek {#input_format_parquet_local_file_min_bytes_for_seek}   

<SettingsInfoBlock type="UInt64" default_value="8192" />

Минимальный размер локального чтения (из файла) в байтах, при котором выполняется seek вместо чтения с пропуском в формате ввода Parquet

## input_format_parquet_local_time_as_utc {#input_format_parquet_local_time_as_utc}   

<SettingsInfoBlock type="Bool" default_value="1" />

Определяет тип данных, используемый при автоматическом выводе схемы для временных меток Parquet с isAdjustedToUTC=false. Если значение true: DateTime64(..., 'UTC'), если false: DateTime64(...). Ни один из вариантов не является полностью корректным, так как в ClickHouse нет типа данных для локального «настенного» времени. На первый взгляд парадоксально, но вариант true, вероятно, менее некорректен, поскольку форматирование временной метки с 'UTC' как String приведёт к представлению корректного локального времени.

## input_format_parquet_max_block_size {#input_format_parquet_max_block_size}   

<SettingsInfoBlock type="NonZeroUInt64" default_value="65409" />

Максимальный размер блока для ридера формата Parquet.

## input_format_parquet_memory_high_watermark {#input_format_parquet_memory_high_watermark}   

<SettingsInfoBlock type="UInt64" default_value="4294967296" />

Приблизительное ограничение объёма памяти для ридера Parquet v3. Ограничивает количество групп строк или столбцов, которые могут считываться параллельно. При чтении нескольких файлов в одном запросе лимит применяется к общему использованию памяти всеми этими файлами.

## input_format_parquet_memory_low_watermark {#input_format_parquet_memory_low_watermark}   

<SettingsInfoBlock type="UInt64" default_value="2097152" />

Более агрессивно планирует предварительную выборку, если использование памяти ниже заданного порогового значения. Потенциально полезно, например, когда по сети необходимо прочитать множество небольших bloom-фильтров.

## input_format_parquet_page_filter_push_down {#input_format_parquet_page_filter_push_down}   

<SettingsInfoBlock type="Bool" default_value="1" />

Пропускает страницы на основе минимальных и максимальных значений из индекса столбца.

## input_format_parquet_prefer_block_bytes {#input_format_parquet_prefer_block_bytes}   

<SettingsInfoBlock type="UInt64" default_value="16744704" />

Средний размер блока в байтах, возвращаемого ридером Parquet

## input_format_parquet_preserve_order {#input_format_parquet_preserve_order}   

<SettingsInfoBlock type="Bool" default_value="0" />

Не изменяет порядок строк при чтении из файлов Parquet. Не рекомендуется к использованию, так как порядок строк, как правило, не гарантируется, а другие части конвейера обработки запроса могут его нарушить. Вместо этого используйте `ORDER BY _row_number`.

## input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference {#input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускать столбцы с неподдерживаемыми типами при определении схемы для формата Parquet

## input_format_parquet_use_native_reader {#input_format_parquet_use_native_reader}   

<SettingsInfoBlock type="Bool" default_value="0" />

Использовать нативный ридер Parquet v1. Достаточно быстрый, но ещё не доработан. Устарел.

## input_format_parquet_use_native_reader_v3 {#input_format_parquet_use_native_reader_v3}   

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать считыватель Parquet v3.

## input_format_parquet_use_offset_index {#input_format_parquet_use_offset_index}   

<SettingsInfoBlock type="Bool" default_value="1" />

Небольшое изменение в способе чтения страниц из файла Parquet, когда не используется фильтрация страниц.

## input_format_parquet_verify_checksums {#input_format_parquet_verify_checksums}   

<SettingsInfoBlock type="Bool" default_value="1" />

Проверяет контрольные суммы страниц при чтении файлов Parquet.

## input_format_protobuf_flatten_google_wrappers {#input_format_protobuf_flatten_google_wrappers}   

<SettingsInfoBlock type="Bool" default_value="0" />

Включает использование Google wrappers для обычных невложенных столбцов, например `google.protobuf.StringValue 'str'` для столбца типа `String` `str`. Для столбцов `Nullable` пустые wrappers интерпретируются как значения по умолчанию, а отсутствующие — как `NULL`.

## input_format_protobuf_oneof_presence {#input_format_protobuf_oneof_presence}   

<SettingsInfoBlock type="Bool" default_value="0" />

Определяет, какое поле protobuf oneof было обнаружено, путем установки значения перечисления в специальном столбце

## input_format_protobuf_skip_fields_with_unsupported_types_in_schema_inference {#input_format_protobuf_skip_fields_with_unsupported_types_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускать поля с неподдерживаемыми типами при определении схемы для формата Protobuf

## input_format_record_errors_file_path {#input_format_record_errors_file_path}   



Путь к файлу, в который записываются ошибки при чтении текстовых форматов (CSV, TSV).

## input_format_skip_unknown_fields {#input_format_skip_unknown_fields}   

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает пропуск лишних данных при вставке.

При записи данных ClickHouse выбрасывает исключение, если входные данные содержат столбцы, которых нет в целевой таблице. Если пропуск включён, ClickHouse не вставляет лишние данные и не выбрасывает исключение.

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

## input_format_try_infer_dates {#input_format_try_infer_dates}   

<SettingsInfoBlock type="Bool" default_value="1" />

Если включено, ClickHouse пытается определять тип `Date` по строковым полям при автоматическом определении схемы для текстовых форматов. Если все значения столбца во входных данных были успешно разобраны как даты, результирующим типом будет `Date`. Если хотя бы одно значение не было разобрано как дата, результирующим типом будет `String`.

По умолчанию включено.

## input_format_try_infer_datetimes {#input_format_try_infer_datetimes}   

<SettingsInfoBlock type="Bool" default_value="1" />

Если параметр включен, ClickHouse будет пытаться определить тип `DateTime64` по строковым полям при автоматическом определении схемы для текстовых форматов. Если все значения столбца во входных данных были успешно интерпретированы как значения даты и времени, результирующим типом будет `DateTime64`; если хотя бы одно значение не было интерпретировано как дата и время, результирующим типом будет `String`.

По умолчанию включен.

## input_format_try_infer_datetimes_only_datetime64 {#input_format_try_infer_datetimes_only_datetime64}   

<SettingsInfoBlock type="Bool" default_value="0" />

Когда `input_format_try_infer_datetimes` включён, определяется только тип `DateTime64`, а не `DateTime`.

## input_format_try_infer_exponent_floats {#input_format_try_infer_exponent_floats}   

<SettingsInfoBlock type="Bool" default_value="0" />

Пытаться распознавать числа с плавающей запятой в экспоненциальной нотации при автоматическом определении схемы в текстовых форматах (кроме JSON, где числа с экспонентой всегда распознаются)

## input_format_try_infer_integers {#input_format_try_infer_integers}   

<SettingsInfoBlock type="Bool" default_value="1" />

Если параметр включён, ClickHouse будет пытаться определять целые числа вместо чисел с плавающей запятой при выводе схемы для текстовых форматов. Если все числа в столбце входных данных — целые, результирующим типом будет `Int64`, если хотя бы одно число — с плавающей запятой, результирующим типом будет `Float64`.

Включён по умолчанию.

## input_format_try_infer_variants {#input_format_try_infer_variants}   

<SettingsInfoBlock type="Bool" default_value="0" />

Если параметр включен, ClickHouse будет пытаться определять тип [`Variant`](../../sql-reference/data-types/variant.md) при выводе схемы для текстовых форматов, когда для элементов столбца или массива возможно более одного типа.

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## input_format_tsv_allow_variable_number_of_columns {#input_format_tsv_allow_variable_number_of_columns}   

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорировать лишние столбцы во входных данных TSV (если в файле больше столбцов, чем ожидается) и считать отсутствующие поля во входных данных TSV значениями по умолчанию

## input_format_tsv_crlf_end_of_line {#input_format_tsv_crlf_end_of_line}   

<SettingsInfoBlock type="Bool" default_value="0" />

Если установлено значение true, функция file будет читать формат TSV с \\r\\n вместо \\n.

## input_format_tsv_detect_header {#input_format_tsv_detect_header}   

<SettingsInfoBlock type="Bool" default_value="1" />

Автоматически определять строку заголовка с именами столбцов и их типами в формате TSV

## input_format_tsv_empty_as_default {#input_format_tsv_empty_as_default}   

<SettingsInfoBlock type="Bool" default_value="0" />

Считать пустые поля во входных данных TSV значениями по умолчанию.

## input_format_tsv_enum_as_number {#input_format_tsv_enum_as_number}   

<SettingsInfoBlock type="Bool" default_value="0" />

Обрабатывать вставляемые значения Enum в форматах TSV как числовые индексы Enum.

## input_format_tsv_skip_first_lines {#input_format_tsv_skip_first_lines}   

<SettingsInfoBlock type="UInt64" default_value="0" />

Пропускает заданное количество строк в начале данных в формате TSV

## input_format_tsv_skip_trailing_empty_lines {#input_format_tsv_skip_trailing_empty_lines}   

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускать пустые строки в конце данных в формате TSV

## input_format_tsv_use_best_effort_in_schema_inference {#input_format_tsv_use_best_effort_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать дополнительные методы и эвристики для определения схемы в формате TSV

## input_format_values_accurate_types_of_literals {#input_format_values_accurate_types_of_literals}   

<SettingsInfoBlock type="Bool" default_value="1" />

Для формата Values: при разборе и интерпретации выражений с использованием шаблона выполняется проверка фактического типа литерала, чтобы избежать возможного переполнения и потери точности.

## input_format_values_deduce_templates_of_expressions {#input_format_values_deduce_templates_of_expressions}   

<SettingsInfoBlock type="Bool" default_value="1" />

Для формата Values: если потоковому парсеру не удалось разобрать поле, запустить SQL-парсер, определить шаблон SQL-выражения, попытаться разобрать все строки, используя этот шаблон, а затем интерпретировать выражение для всех строк.

## input_format_values_interpret_expressions {#input_format_values_interpret_expressions}   

<SettingsInfoBlock type="Bool" default_value="1" />

Для формата Values: если потоковому парсеру не удалось разобрать поле, выполнить разбор с помощью SQL-парсера и попытаться интерпретировать его как SQL-выражение.

## input_format_with_names_use_header {#input_format_with_names_use_header}   

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает проверку порядка столбцов при вставке данных.

Для повышения производительности операций вставки рекомендуется отключить эту проверку, если вы уверены, что порядок столбцов во входных данных совпадает с порядком в целевой таблице.

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

- 0 — Отключено.
- 1 — Включено.

## input_format_with_types_use_header {#input_format_with_types_use_header}   

<SettingsInfoBlock type="Bool" default_value="1" />

Определяет, должен ли парсер формата проверять соответствие типов данных во входных данных типам данных целевой таблицы.

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

## insert_distributed_one_random_shard {#insert_distributed_one_random_shard}   

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает вставку данных в случайный шард таблицы [Distributed](/engines/table-engines/special/distributed), когда не задан распределённый ключ.

По умолчанию при вставке данных в таблицу `Distributed` с более чем одним шардом сервер ClickHouse отклоняет любой запрос на вставку, если распределённый ключ отсутствует. Когда `insert_distributed_one_random_shard = 1`, вставки разрешены, и данные распределяются случайным образом между всеми шардами.

Возможные значения:

- 0 — Вставка отклоняется, если есть несколько шардов и не задан распределённый ключ.
- 1 — Вставка выполняется случайным образом по всем доступным шардам, когда распределённый ключ не задан.

## interval_output_format {#interval_output_format}   

<SettingsInfoBlock type="IntervalOutputFormat" default_value="numeric" />

Позволяет выбрать формат вывода текстового представления интервальных типов.

Возможные значения:

-   `kusto` - формат вывода в стиле KQL.

    ClickHouse выводит интервалы в [формате KQL](https://learn.microsoft.com/en-us/dotnet/standard/base-types/standard-timespan-format-strings#the-constant-c-format-specifier). Например, `toIntervalDay(2)` будет иметь формат `2.00:00:00`. Обратите внимание, что для интервальных типов переменной длины (например, `IntervalMonth` и `IntervalYear`) учитывается среднее количество секунд на интервал.

-   `numeric` - числовой формат вывода.

    ClickHouse выводит интервалы в виде их базового числового представления. Например, `toIntervalDay(2)` будет иметь формат `2`.

См. также:

-   [Interval](../../sql-reference/data-types/special-data-types/interval.md)

## into_outfile_create_parent_directories {#into_outfile_create_parent_directories}   

<SettingsInfoBlock type="Bool" default_value="0" />

Автоматически создавать родительские директории при использовании INTO OUTFILE, если они ещё не существуют.

## json_type_escape_dots_in_keys {#json_type_escape_dots_in_keys}   

<SettingsInfoBlock type="Bool" default_value="0" />

При включении точки в ключах JSON будут экранироваться при разборе.

## output_format_arrow_compression_method {#output_format_arrow_compression_method}   

<SettingsInfoBlock type="ArrowCompression" default_value="lz4_frame" />

Метод сжатия для формата вывода Arrow. Поддерживаемые кодеки: lz4_frame, zstd, none (без сжатия).

## output_format_arrow_fixed_string_as_fixed_byte_array {#output_format_arrow_fixed_string_as_fixed_byte_array}   

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать тип данных Arrow FIXED_SIZE_BINARY вместо Binary для столбцов FixedString.

## output_format_arrow_low_cardinality_as_dictionary {#output_format_arrow_low_cardinality_as_dictionary}   

<SettingsInfoBlock type="Bool" default_value="0" />

Включает вывод столбцов типа LowCardinality как столбцов типа Arrow Dictionary

## output_format_arrow_string_as_string {#output_format_arrow_string_as_string}   

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать тип Arrow String вместо Binary для строковых столбцов

## output_format_arrow_use_64_bit_indexes_for_dictionary {#output_format_arrow_use_64_bit_indexes_for_dictionary}   

<SettingsInfoBlock type="Bool" default_value="0" />

Всегда использовать 64-разрядные целые числа для индексов словаря в формате Arrow

## output_format_arrow_use_signed_indexes_for_dictionary {#output_format_arrow_use_signed_indexes_for_dictionary}   

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать знаковые целые числа для индексов словаря в формате Arrow

## output_format_avro_codec {#output_format_avro_codec}   



Кодек сжатия, используемый для вывода. Возможные значения: 'null', 'deflate', 'snappy', 'zstd'.

## output_format_avro_rows_in_file {#output_format_avro_rows_in_file}   

<SettingsInfoBlock type="UInt64" default_value="1" />

Максимальное количество строк в файле (если допускается хранилищем)

## output_format_avro_string_column_pattern {#output_format_avro_string_column_pattern}   


Для формата Avro: регулярное выражение для выбора столбцов типа String, которые следует интерпретировать как строки Avro.

## output_format_avro_sync_interval {#output_format_avro_sync_interval}   

<SettingsInfoBlock type="UInt64" default_value="16384" />

Интервал синхронизации в байтах.

## output_format_binary_encode_types_in_binary_format {#output_format_binary_encode_types_in_binary_format}   

<SettingsInfoBlock type="Bool" default_value="0" />

Записывать типы данных в бинарном формате вместо имен типов в формате вывода RowBinaryWithNamesAndTypes

## output_format_binary_write_json_as_string {#output_format_binary_write_json_as_string}   

<SettingsInfoBlock type="Bool" default_value="0" />

Записывает значения типа данных [JSON](../../sql-reference/data-types/newjson.md) как значения типа [String](../../sql-reference/data-types/string.md) с JSON-содержимым в формате RowBinary.

## output_format_bson_string_as_string {#output_format_bson_string_as_string}   

<SettingsInfoBlock type="Bool" default_value="0" />

Использовать тип BSON String вместо Binary для столбцов типа String.

## output_format_csv_crlf_end_of_line {#output_format_csv_crlf_end_of_line}   

<SettingsInfoBlock type="Bool" default_value="0" />

Если установлено значение `true`, символы конца строки в формате CSV будут \\r\\n вместо \\n.

## output_format_csv_serialize_tuple_into_separate_columns {#output_format_csv_serialize_tuple_into_separate_columns}   

<SettingsInfoBlock type="Bool" default_value="1" />

Если установлено значение `true`, то кортежи (`Tuple`) в формате CSV сериализуются как отдельные столбцы (то есть их вложенная структура теряется).

## output_format_decimal_trailing_zeros {#output_format_decimal_trailing_zeros}   

<SettingsInfoBlock type="Bool" default_value="0" />

Выводить завершающие нули при отображении значений типа Decimal. Например, 1.230000 вместо 1.23.

По умолчанию — отключено.

## output&#95;format&#95;json&#95;array&#95;of&#95;rows {#output_format_json_array_of_rows}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает возможность выводить все строки в виде JSON‑массива в формате [JSONEachRow](/interfaces/formats/JSONEachRow).

Возможные значения:

* 1 — ClickHouse выводит все строки в виде массива, где каждая строка представлена в формате `JSONEachRow`.
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

**Пример запроса с отключённым параметром**

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

## output_format_json_escape_forward_slashes {#output_format_json_escape_forward_slashes}   

<SettingsInfoBlock type="Bool" default_value="1" />

Управляет экранированием прямых слешей (`/`) в строковых значениях при выводе в формате JSON. Предназначен для совместимости с JavaScript. Не путайте с обратными слешами (`\`), которые всегда экранируются.

По умолчанию параметр включён.

## output_format_json_map_as_array_of_tuples {#output_format_json_map_as_array_of_tuples}   

<SettingsInfoBlock type="Bool" default_value="0" />

Сериализует столбцы Map как JSON-массивы кортежей.

По умолчанию отключено.

## output_format_json_named_tuples_as_objects {#output_format_json_named_tuples_as_objects}   

<SettingsInfoBlock type="Bool" default_value="1" />

Сериализует столбцы именованных кортежей в виде JSON-объектов.

Включено по умолчанию.

## output&#95;format&#95;json&#95;pretty&#95;print {#output_format_json_pretty_print}

<SettingsInfoBlock type="Bool" default_value="1" />

Этот параметр определяет, как вложенные структуры, такие как Tuples, Maps и Arrays, отображаются внутри массива `data` при использовании формата вывода JSON.

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

Результат будет отформатирован следующим образом:

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

## output_format_json_quote_64bit_floats {#output_format_json_quote_64bit_floats}   

<SettingsInfoBlock type="Bool" default_value="0" />

Управляет заключением в кавычки 64-битных [значений с плавающей запятой](../../sql-reference/data-types/float.md) при их выводе в форматах JSON*.

По умолчанию отключено.

## output_format_json_quote_64bit_integers {#output_format_json_quote_64bit_integers}   

<SettingsInfoBlock type="Bool" default_value="0" />

Управляет тем, заключаются ли в кавычки [целые числа](../../sql-reference/data-types/int-uint.md) разрядностью 64 бита и более (такие как `UInt64` или `Int128`) при их выводе в формате [JSON](/interfaces/formats/JSON).
По умолчанию такие целые числа заключаются в кавычки. Это поведение совместимо с большинством реализаций JavaScript.

Возможные значения:

- 0 — целые числа выводятся без кавычек.
- 1 — целые числа заключаются в кавычки.

## output_format_json_quote_decimals {#output_format_json_quote_decimals}   

<SettingsInfoBlock type="Bool" default_value="0" />

Управляет тем, заключаются ли десятичные числа в кавычки в JSON-форматах вывода.

По умолчанию отключено.

## output&#95;format&#95;json&#95;quote&#95;denormals {#output_format_json_quote_denormals}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает вывод значений `+nan`, `-nan`, `+inf`, `-inf` в формате [JSON](/interfaces/formats/JSON).

Возможные значения:

* 0 — Отключено.
* 1 — Включено.

**Пример**

Рассмотрим следующую таблицу `account_orders`:

```text
┌─id─┬─name───┬─duration─┬─period─┬─area─┐
│  1 │ Andrew │       20 │      0 │  400 │
│  2 │ John   │       40 │      0 │    0 │
│  3 │ Bob    │       15 │      0 │ -100 │
└────┴────────┴──────────┴────────┴──────┘
```

Когда `output_format_json_quote_denormals = 0`, запрос возвращает значения `null` в результате:

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

Когда `output_format_json_quote_denormals = 1`, запрос возвращает:

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

## output_format_json_skip_null_value_in_named_tuples {#output_format_json_skip_null_value_in_named_tuples}   

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускает пары ключ–значение со значением null при сериализации столбцов с именованными кортежами в JSON-объекты. Применяется только, если output_format_json_named_tuples_as_objects имеет значение true.

## output_format_json_validate_utf8 {#output_format_json_validate_utf8}   

<SettingsInfoBlock type="Bool" default_value="0" />

Управляет проверкой корректности UTF-8-последовательностей в форматах вывода JSON, не влияет на форматы JSON/JSONCompact/JSONColumnsWithMetadata — они всегда проверяют UTF-8.

По умолчанию настройка отключена.

## output&#95;format&#95;markdown&#95;escape&#95;special&#95;characters {#output_format_markdown_escape_special_characters}

<SettingsInfoBlock type="Bool" default_value="0" />

При включении специальные символы в Markdown экранируются.

[CommonMark](https://spec.commonmark.org/0.30/#example-12) определяет следующие специальные символы, которые могут быть экранированы:

```
! " # $ % & ' ( ) * + , - . / : ; < = > ? @ [ \ ] ^ _ ` { | } ~
```

Возможные значения:

* 0 — Отключено.
* 1 — Включено.

## output_format_msgpack_uuid_representation {#output_format_msgpack_uuid_representation}   

<SettingsInfoBlock type="MsgPackUUIDRepresentation" default_value="ext" />

Определяет способ вывода UUID в формате MsgPack.

## output_format_native_encode_types_in_binary_format {#output_format_native_encode_types_in_binary_format}   

<SettingsInfoBlock type="Bool" default_value="0" />

Записывать типы данных в двоичном виде вместо их имен в формате вывода Native

## output_format_native_use_flattened_dynamic_and_json_serialization {#output_format_native_use_flattened_dynamic_and_json_serialization}   

<SettingsInfoBlock type="Bool" default_value="0" />

Записывает данные столбцов [JSON](../../sql-reference/data-types/newjson.md) и [Dynamic](../../sql-reference/data-types/dynamic.md) в плоском формате (все типы/пути как отдельные подстолбцы).

## output_format_native_write_json_as_string {#output_format_native_write_json_as_string}   

<SettingsInfoBlock type="Bool" default_value="0" />

Записывает данные столбца типа [JSON](../../sql-reference/data-types/newjson.md) как столбец типа [String](../../sql-reference/data-types/string.md), содержащий строки в формате JSON, вместо используемой по умолчанию нативной сериализации JSON.

## output_format_orc_compression_block_size {#output_format_orc_compression_block_size}   

<SettingsInfoBlock type="UInt64" default_value="262144" />

Размер блока сжатия в байтах для выходного формата ORC.

## output_format_orc_compression_method {#output_format_orc_compression_method}   

<SettingsInfoBlock type="ORCCompression" default_value="zstd" />

Метод сжатия для формата вывода ORC. Поддерживаемые кодеки: lz4, snappy, zlib, zstd, none (без сжатия).

## output_format_orc_dictionary_key_size_threshold {#output_format_orc_dictionary_key_size_threshold}   

<SettingsInfoBlock type="Double" default_value="0" />

Для строкового столбца в формате вывода ORC, если количество различных значений больше этой доли от общего числа строк с ненулевыми (non-NULL) значениями, словарное кодирование отключается. В противном случае словарное кодирование включается.

## output_format_orc_row_index_stride {#output_format_orc_row_index_stride}   

<SettingsInfoBlock type="UInt64" default_value="10000" />

Целевой интервал индексации строк в выходном формате ORC

## output_format_orc_string_as_string {#output_format_orc_string_as_string}   

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать тип данных ORC String вместо Binary для столбцов с типом String

## output_format_orc_writer_time_zone_name {#output_format_orc_writer_time_zone_name}   

<SettingsInfoBlock type="String" default_value="GMT" />

Название часового пояса, используемого модулем записи ORC; по умолчанию используется часовой пояс GMT.

## output_format_parquet_batch_size {#output_format_parquet_batch_size}   

<SettingsInfoBlock type="NonZeroUInt64" default_value="1024" />

Проверять размер страницы после каждого указанного количества строк. Рассмотрите возможность уменьшения значения, если в данных есть столбцы со средним размером значений более нескольких КБ.

## output_format_parquet_bloom_filter_bits_per_value {#output_format_parquet_bloom_filter_bits_per_value}   

<SettingsInfoBlock type="Double" default_value="10.5" />

Примерное количество бит, используемых для каждого различного значения в Bloom-фильтрах Parquet. Оценочные значения вероятности ложноположительных срабатываний:
  *  6   бит — 10%
  * 10.5 бита —  1%
  * 16.9 бита —  0.1%
  * 26.4 бита —  0.01%
  * 41   бит —  0.001%

## output_format_parquet_bloom_filter_flush_threshold_bytes {#output_format_parquet_bloom_filter_flush_threshold_bytes}   

<SettingsInfoBlock type="UInt64" default_value="134217728" />

Где в файле Parquet будут размещаться фильтры Блума. Фильтры Блума будут записываться группами приблизительно такого размера. В частности:
  * если 0 — фильтры Блума каждой группы строк записываются сразу после соответствующей группы строк;
  * если значение больше общего размера всех фильтров Блума — фильтры Блума для всех групп строк будут накапливаться в памяти, а затем записываться вместе ближе к концу файла;
  * в противном случае фильтры Блума будут накапливаться в памяти и записываться каждый раз, как только их общий размер превысит это значение.

## output_format_parquet_compliant_nested_types {#output_format_parquet_compliant_nested_types}   

<SettingsInfoBlock type="Bool" default_value="1" />

В схеме файла Parquet использовать имя `element` вместо `item` для элементов списка. Это исторический артефакт реализации библиотеки Arrow. В общем случае повышает совместимость, за исключением, возможно, некоторых старых версий Arrow.

## output_format_parquet_compression_method {#output_format_parquet_compression_method}   

<SettingsInfoBlock type="ParquetCompression" default_value="zstd" />

Метод сжатия для выходного формата Parquet. Поддерживаемые кодеки: snappy, lz4, brotli, zstd, gzip, none (без сжатия)

## output_format_parquet_data_page_size {#output_format_parquet_data_page_size}   

<SettingsInfoBlock type="UInt64" default_value="1048576" />

Целевой размер страницы в байтах перед сжатием.

## output_format_parquet_date_as_uint16 {#output_format_parquet_date_as_uint16}   

<SettingsInfoBlock type="Bool" default_value="0" />

Записывать значения типа Date как обычные 16-битные числа (считываются как UInt16), вместо преобразования в 32-битный тип Parquet DATE (считывается как Date32).

## output_format_parquet_datetime_as_uint32 {#output_format_parquet_datetime_as_uint32}   

<SettingsInfoBlock type="Bool" default_value="0" />

Записывать значения DateTime как исходный Unix timestamp (считываются обратно как UInt32), вместо преобразования в миллисекунды (считываются обратно как DateTime64(3)).

## output_format_parquet_enum_as_byte_array {#output_format_parquet_enum_as_byte_array}   

<SettingsInfoBlock type="Bool" default_value="1" />

Записывает значения enum с физическим типом Parquet BYTE_ARRAY и логическим типом ENUM

## output_format_parquet_fixed_string_as_fixed_byte_array {#output_format_parquet_fixed_string_as_fixed_byte_array}   

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать тип FIXED_LEN_BYTE_ARRAY формата Parquet вместо Binary для столбцов FixedString.

## output_format_parquet_geometadata {#output_format_parquet_geometadata}   

<SettingsInfoBlock type="Bool" default_value="1" />

Позволяет записывать информацию о геометрических столбцах в метаданные Parquet и кодировать столбцы в формате WKB.

## output_format_parquet_max_dictionary_size {#output_format_parquet_max_dictionary_size}   

<SettingsInfoBlock type="UInt64" default_value="1048576" />

Если размер словаря превышает это количество байт, используется кодирование без словаря. Установите значение 0, чтобы отключить словарное кодирование.

## output_format_parquet_parallel_encoding {#output_format_parquet_parallel_encoding}   

<SettingsInfoBlock type="Bool" default_value="1" />

Выполняет многопоточное кодирование Parquet. Требует включения настройки output_format_parquet_use_custom_encoder.

## output_format_parquet_row_group_size {#output_format_parquet_row_group_size}   

<SettingsInfoBlock type="UInt64" default_value="1000000" />

Целевой размер группы строк (в количестве строк).

## output_format_parquet_row_group_size_bytes {#output_format_parquet_row_group_size_bytes}   

<SettingsInfoBlock type="UInt64" default_value="536870912" />

Целевой размер группы строк в байтах (до сжатия).

## output_format_parquet_string_as_string {#output_format_parquet_string_as_string}   

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать в Parquet тип String вместо Binary для столбцов с типом String.

## output_format_parquet_use_custom_encoder {#output_format_parquet_use_custom_encoder}   

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать более быструю реализацию кодировщика Parquet.

## output_format_parquet_version {#output_format_parquet_version}   

<SettingsInfoBlock type="ParquetVersion" default_value="2.latest" />

Версия формата Parquet, используемая для формата вывода. Поддерживаемые версии: 1.0, 2.4, 2.6 и 2.latest (по умолчанию)

## output_format_parquet_write_bloom_filter {#output_format_parquet_write_bloom_filter}   

<SettingsInfoBlock type="Bool" default_value="1" />

Записывает фильтры Блума в файлы Parquet. Требуется, чтобы параметр `output_format_parquet_use_custom_encoder` имел значение `true`.

## output_format_parquet_write_checksums {#output_format_parquet_write_checksums}   

<SettingsInfoBlock type="Bool" default_value="1" />

Помещает контрольные суммы CRC32 в заголовки страниц формата Parquet.

## output_format_parquet_write_page_index {#output_format_parquet_write_page_index}   

<SettingsInfoBlock type="Bool" default_value="1" />

Записывать индекс столбцов и индекс смещений (т. е. статистику по каждой странице данных, которую можно использовать для проталкивания фильтров при чтении) в файлы Parquet.

## output_format_pretty_color {#output_format_pretty_color}   

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

Использовать управляющие последовательности ANSI в форматах Pretty. 0 — отключено, 1 — включено, `auto` — включено, если вывод осуществляется в терминал.

## output&#95;format&#95;pretty&#95;display&#95;footer&#95;column&#95;names {#output_format_pretty_display_footer_column_names}

<SettingsInfoBlock type="UInt64" default_value="1" />

Отображает имена столбцов в нижнем колонтитуле, если в таблице много строк.

Возможные значения:

* 0 — имена столбцов не отображаются в нижнем колонтитуле.
* 1 — имена столбцов отображаются в нижнем колонтитуле, если количество строк больше или равно пороговому значению, заданному настройкой [output&#95;format&#95;pretty&#95;display&#95;footer&#95;column&#95;names&#95;min&#95;rows](#output_format_pretty_display_footer_column_names_min_rows) (по умолчанию — 50).

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

## output_format_pretty_display_footer_column_names_min_rows {#output_format_pretty_display_footer_column_names_min_rows}   

<SettingsInfoBlock type="UInt64" default_value="50" />

Устанавливает минимальное количество строк, начиная с которого будет отображаться футер с именами столбцов, если включена настройка [output_format_pretty_display_footer_column_names](#output_format_pretty_display_footer_column_names).

## output_format_pretty_fallback_to_vertical {#output_format_pretty_fallback_to_vertical}   

<SettingsInfoBlock type="Bool" default_value="1" />

Если параметр включён и таблица широкая, но короткая, формат Pretty выведет её так же, как формат Vertical.
См. `output_format_pretty_fallback_to_vertical_max_rows_per_chunk` и `output_format_pretty_fallback_to_vertical_min_table_width` для тонкой настройки этого поведения.

## output_format_pretty_fallback_to_vertical_max_rows_per_chunk {#output_format_pretty_fallback_to_vertical_max_rows_per_chunk}   

<SettingsInfoBlock type="UInt64" default_value="10" />

Переход к формату Vertical (см. `output_format_pretty_fallback_to_vertical`) будет выполняться только в том случае, если число строк в чанке не превышает указанного значения.

## output_format_pretty_fallback_to_vertical_min_columns {#output_format_pretty_fallback_to_vertical_min_columns}   

<SettingsInfoBlock type="UInt64" default_value="5" />

Автоматический переход к формату Vertical (см. `output_format_pretty_fallback_to_vertical`) будет выполняться только в том случае, если количество столбцов превышает указанное значение.

## output_format_pretty_fallback_to_vertical_min_table_width {#output_format_pretty_fallback_to_vertical_min_table_width}   

<SettingsInfoBlock type="UInt64" default_value="250" />

Переход к формату Vertical (см. `output_format_pretty_fallback_to_vertical`) будет выполняться только в том случае, если суммарная ширина столбцов в таблице не меньше заданного значения или если хотя бы одно значение содержит символ перевода строки.

## output_format_pretty_glue_chunks {#output_format_pretty_glue_chunks}   

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

Если данные, выводимые в форматах Pretty, поступили в нескольких чанках, даже с задержкой, но следующий чанк имеет те же ширины столбцов, что и предыдущий, будут использованы управляющие последовательности ANSI, чтобы вернуться на предыдущую строку и перезаписать футер предыдущего чанка, продолжив его данными нового чанка. Так результат выглядит более аккуратно.

0 — отключено, 1 — включено, 'auto' — включено, если вывод в терминал.

## output_format_pretty_grid_charset {#output_format_pretty_grid_charset}   

<SettingsInfoBlock type="String" default_value="UTF-8" />

Кодировка символов, используемая для отображения границ таблицы. Доступные кодировки: ASCII, UTF-8 (по умолчанию).

## output_format_pretty_highlight_digit_groups {#output_format_pretty_highlight_digit_groups}   

<SettingsInfoBlock type="Bool" default_value="1" />

Если параметр включён и вывод осуществляется в терминал, каждая цифра в разрядах тысяч, миллионов и т. д. подчёркивается.

## output_format_pretty_highlight_trailing_spaces {#output_format_pretty_highlight_trailing_spaces}   

<SettingsInfoBlock type="Bool" default_value="1" />

Если включено и если вывод осуществляется в терминал, подсвечивает пробелы в конце строк серым цветом и подчеркиванием.

## output_format_pretty_max_column_name_width_cut_to {#output_format_pretty_max_column_name_width_cut_to}   

<SettingsInfoBlock type="UInt64" default_value="24" />

Если имя столбца слишком длинное, оно обрезается до этой длины.
Имя столбца будет обрезано, если его длина превышает сумму значений `output_format_pretty_max_column_name_width_cut_to` и `output_format_pretty_max_column_name_width_min_chars_to_cut`.

## output_format_pretty_max_column_name_width_min_chars_to_cut {#output_format_pretty_max_column_name_width_min_chars_to_cut}   

<SettingsInfoBlock type="UInt64" default_value="4" />

Минимальное число символов, на которое укорачивается имя столбца, если оно слишком длинное.  
Имя столбца будет укорочено, если его длина превышает `output_format_pretty_max_column_name_width_cut_to` плюс `output_format_pretty_max_column_name_width_min_chars_to_cut`.

## output_format_pretty_max_column_pad_width {#output_format_pretty_max_column_pad_width}   

<SettingsInfoBlock type="UInt64" default_value="250" />

Максимальная ширина, до которой дополняются значения в столбце в форматах Pretty.

## output_format_pretty_max_rows {#output_format_pretty_max_rows}   

<SettingsInfoBlock type="UInt64" default_value="1000" />

Максимальное количество строк для форматов Pretty.

## output_format_pretty_max_value_width {#output_format_pretty_max_value_width}   

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальная длина значения для отображения в форматах Pretty. Если она больше — значение будет обрезано.
Значение 0 означает, что обрезка никогда не выполняется.

## output_format_pretty_max_value_width_apply_for_single_value {#output_format_pretty_max_value_width_apply_for_single_value}   

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивать длину значений (см. настройку `output_format_pretty_max_value_width`) только когда в блоке более одного значения. В противном случае выводить значение полностью, что полезно для запроса `SHOW CREATE TABLE`.

## output_format_pretty_multiline_fields {#output_format_pretty_multiline_fields}   

<SettingsInfoBlock type="Bool" default_value="1" />

Если включено, форматы Pretty будут отображать многострочные поля внутри ячейки таблицы, при этом границы таблицы будут сохранены.
Если выключено, они будут отображаться как есть, что может деформировать таблицу (одно из преимуществ отключения — более удобное копирование и вставка многострочных значений).

## output_format_pretty_row_numbers {#output_format_pretty_row_numbers}   

<SettingsInfoBlock type="Bool" default_value="1" />

Добавляет номера строк перед каждой строкой для формата вывода Pretty

## output_format_pretty_single_large_number_tip_threshold {#output_format_pretty_single_large_number_tip_threshold}   

<SettingsInfoBlock type="UInt64" default_value="1000000" />

Выводит справа от таблицы подсказку с числом в удобочитаемом виде, если блок состоит из одного числа, которое превышает это значение (кроме 0).

## output_format_pretty_squash_consecutive_ms {#output_format_pretty_squash_consecutive_ms}   

<SettingsInfoBlock type="UInt64" default_value="50" />

Ожидать появления следующего блока до указанного количества миллисекунд и объединять его с предыдущим перед выводом.
Это позволяет избежать частого вывода слишком маленьких блоков, но при этом по-прежнему отображать данные в потоковом режиме.

## output_format_pretty_squash_max_wait_ms {#output_format_pretty_squash_max_wait_ms}   

<SettingsInfoBlock type="UInt64" default_value="1000" />

Выводит накопленный блок в форматах pretty, если с момента предыдущего вывода прошло больше указанного количества миллисекунд.

## output_format_protobuf_nullables_with_google_wrappers {#output_format_protobuf_nullables_with_google_wrappers}   

<SettingsInfoBlock type="Bool" default_value="0" />

При сериализации столбцов `Nullable` с использованием обёрток Google значения по умолчанию сериализуются как пустые обёртки. Если параметр отключён, значения по умолчанию и `NULL` не сериализуются.

## output_format_schema {#output_format_schema}   



Путь к файлу, в который будет сохранена автоматически сгенерированная схема в формате [Cap'n Proto](/interfaces/formats/CapnProto) или [Protobuf](/interfaces/formats/Protobuf).

## output_format_sql_insert_include_column_names {#output_format_sql_insert_include_column_names}   

<SettingsInfoBlock type="Bool" default_value="1" />

Включать имена столбцов в запросе INSERT

## output_format_sql_insert_max_batch_size {#output_format_sql_insert_max_batch_size}   

<SettingsInfoBlock type="UInt64" default_value="65409" />

Максимальное количество строк в одном запросе INSERT.

## output_format_sql_insert_quote_names {#output_format_sql_insert_quote_names}   

<SettingsInfoBlock type="Bool" default_value="1" />

Заключать имена столбцов в символы '`'

## output_format_sql_insert_table_name {#output_format_sql_insert_table_name}   

<SettingsInfoBlock type="String" default_value="table" />

Имя таблицы в результирующем запросе INSERT

## output_format_sql_insert_use_replace {#output_format_sql_insert_use_replace}   

<SettingsInfoBlock type="Bool" default_value="0" />

Использовать оператор REPLACE вместо INSERT

## output_format_tsv_crlf_end_of_line {#output_format_tsv_crlf_end_of_line}   

<SettingsInfoBlock type="Bool" default_value="0" />

Если установлено значение true, строки в формате TSV будут оканчиваться на \\r\\n вместо \\n.

## output_format_values_escape_quote_with_quote {#output_format_values_escape_quote_with_quote}   

<SettingsInfoBlock type="Bool" default_value="0" />

Если имеет значение true, символ ' экранируется как '', иначе — как \\'.

## output_format_write_statistics {#output_format_write_statistics}   

<SettingsInfoBlock type="Bool" default_value="1" />

Записывает статистику о прочитанных строках, объёме данных (в байтах) и затраченном времени в соответствующих форматах вывода.

Включено по умолчанию

## precise_float_parsing {#precise_float_parsing}   

<SettingsInfoBlock type="Bool" default_value="0" />

Использовать более точный (но более медленный) алгоритм разбора чисел с плавающей запятой

## regexp_dict_allow_hyperscan {#regexp_dict_allow_hyperscan}   

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает использование словаря `regexp_tree`, использующего библиотеку Hyperscan.

## regexp_dict_flag_case_insensitive {#regexp_dict_flag_case_insensitive}   

<SettingsInfoBlock type="Bool" default_value="0" />

Использовать сопоставление, нечувствительное к регистру, для словаря `regexp_tree`. Может быть переопределено в отдельных выражениях с помощью `(?i)` и `(?-i)`.

## regexp_dict_flag_dotall {#regexp_dict_flag_dotall}   

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает символу «.» совпадать с символами новой строки для словаря `regexp_tree`.

## rows_before_aggregation {#rows_before_aggregation}   

<SettingsInfoBlock type="Bool" default_value="0" />

Когда он включён, ClickHouse будет предоставлять точное значение статистики rows_before_aggregation — количества строк, прочитанных до агрегации.

## schema&#95;inference&#95;hints {#schema_inference_hints}

Список имён столбцов и их типов, используемых в качестве подсказок при определении схемы для форматов без заданной схемы.

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
Если `schema_inference_hints` имеет неправильный формат или в нём есть опечатка, неверный тип данных и т.п., все значения `schema_inference_hints` будут проигнорированы.
:::

## schema_inference_make_columns_nullable {#schema_inference_make_columns_nullable}   

<SettingsInfoBlock type="UInt64Auto" default_value="3" />

Определяет, будут ли выводимые типы иметь модификатор `Nullable` при выводе схемы.
Возможные значения:
 * 0 — выводимый тип никогда не будет `Nullable` (используйте `input_format_null_as_default`, чтобы контролировать, что делать со значениями `NULL` в этом случае),
 * 1 — все выводимые типы будут `Nullable`,
 * 2 или `auto` — выводимый тип будет `Nullable` только если столбец содержит `NULL` в образце данных, который разбирается при выводе схемы, или метаданные файла содержат информацию о допускаемости `NULL` для столбца,
 * 3 — допускаемость `NULL` для выводимого типа будет соответствовать метаданным файла, если формат их содержит (например, Parquet), и всегда будет `Nullable` в противном случае (например, CSV).

## schema_inference_make_json_columns_nullable {#schema_inference_make_json_columns_nullable}   

<SettingsInfoBlock type="Bool" default_value="0" />

Определяет, нужно ли делать выводимые JSON-типы `Nullable` при выводе схемы.
Если этот параметр включён одновременно с schema_inference_make_columns_nullable, выводимый JSON-тип будет `Nullable`.

## schema_inference_mode {#schema_inference_mode}   

<SettingsInfoBlock type="SchemaInferenceMode" default_value="default" />

Режим определения схемы. `default` — предполагается, что все файлы имеют одинаковую схему, и схему можно вывести из любого файла; `union` — файлы могут иметь разные схемы, и итоговая схема должна представлять собой объединение схем всех файлов.

## show_create_query_identifier_quoting_rule {#show_create_query_identifier_quoting_rule}   

<SettingsInfoBlock type="IdentifierQuotingRule" default_value="when_necessary" />

Задает правило заключения идентификаторов в кавычки в запросе SHOW CREATE

## show_create_query_identifier_quoting_style {#show_create_query_identifier_quoting_style}   

<SettingsInfoBlock type="IdentifierQuotingStyle" default_value="Backticks" />

Определяет стиль кавычек для идентификаторов в запросе SHOW CREATE.

## type_json_skip_duplicated_paths {#type_json_skip_duplicated_paths}   

<SettingsInfoBlock type="Bool" default_value="0" />

При включении во время разбора JSON-объекта в тип JSON дублирующиеся пути будут игнорироваться, и вместо генерации исключения будет использовано только первое значение.

## validate_experimental_and_suspicious_types_inside_nested_types {#validate_experimental_and_suspicious_types_inside_nested_types}   

<SettingsInfoBlock type="Bool" default_value="1" />

Проверять использование экспериментальных и сомнительных типов внутри вложенных типов, таких как Array/Map/Tuple


