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

{/* Автоматически сгенерировано */ }

Эти настройки автоматически генерируются из исходного файла [source](https://github.com/ClickHouse/ClickHouse/blob/master/src/Core/FormatFactorySettings.h).


## allow_special_bool_values_inside_variant {#allow_special_bool_values_inside_variant}   

<SettingsInfoBlock type="Bool" default_value="0" />

Позволяет разбирать значения Bool внутри типа Variant из специальных строковых булевых значений, таких как "on", "off", "enable", "disable" и т. д.

## bool_false_representation {#bool_false_representation}   

<SettingsInfoBlock type="String" default_value="false" />

Текст, используемый для представления булевого значения `false` в форматах TSV/CSV/Vertical/Pretty.

## bool_true_representation {#bool_true_representation}   

<SettingsInfoBlock type="String" default_value="true" />

Текстовое представление логического значения `true` в форматах TSV/CSV/Vertical/Pretty.

## column_names_for_schema_inference {#column_names_for_schema_inference}   

Список названий столбцов, используемых при определении схемы для форматов без названий столбцов. Формат: 'column1,column2,column3,...'

## cross_to_inner_join_rewrite {#cross_to_inner_join_rewrite}   

<SettingsInfoBlock type="UInt64" default_value="1" />

Использовать inner join вместо comma/cross join, если в разделе WHERE есть выражения соединения. Значения: 0 — не переписывать; 1 — применять при возможности для comma/cross join; 2 — принудительно переписывать все comma join (а cross join — если возможно).

## date_time_64_output_format_cut_trailing_zeros_align_to_groups_of_thousands {#date_time_64_output_format_cut_trailing_zeros_align_to_groups_of_thousands}   

<SettingsInfoBlock type="Bool" default_value="0" />

Динамически удаляет конечные нули в значениях datetime64, чтобы привести масштаб вывода (количество знаков после запятой) к одному из значений [0, 3, 6], соответствующих 'seconds', 'milliseconds' и 'microseconds'.

## date_time_input_format {#date_time_input_format}   

<SettingsInfoBlock type="DateTimeInputFormat" default_value="basic" />

Позволяет выбрать парсер текстового представления даты и времени.

Настройка не применяется к [функциям работы с датой и временем](../../sql-reference/functions/date-time-functions.md).

Возможные значения:

- `'best_effort'` — Включает расширенный разбор.

    ClickHouse может разбирать базовый формат `YYYY-MM-DD HH:MM:SS` и все форматы даты и времени [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601). Например, `'2018-06-08T01:02:03.000Z'`.

- `'best_effort_us'` — Аналогично `best_effort` (см. отличие в работе [parseDateTimeBestEffortUS](../../sql-reference/functions/type-conversion-functions#parseDateTimeBestEffortUS)).

- `'basic'` — Использует базовый парсер.

    ClickHouse может разбирать только базовые форматы `YYYY-MM-DD HH:MM:SS` или `YYYY-MM-DD`. Например, `2019-08-20 10:18:56` или `2019-08-20`.

Значение по умолчанию в Cloud: `'best_effort'`.

См. также:

- [Тип данных DateTime.](../../sql-reference/data-types/datetime.md)
- [Функции для работы с датами и временем.](../../sql-reference/functions/date-time-functions.md)

## date_time_output_format {#date_time_output_format}   

<SettingsInfoBlock type="DateTimeOutputFormat" default_value="simple" />

Позволяет выбрать формат вывода текстового представления даты и времени.

Возможные значения:

- `simple` — простой формат вывода.

    ClickHouse выводит дату и время в формате `YYYY-MM-DD hh:mm:ss`. Например, `2019-08-20 10:18:56`. Вычисление выполняется в соответствии с часовым поясом типа данных (если он задан) или часовым поясом сервера.

- `iso` — формат вывода ISO.

    ClickHouse выводит дату и время в формате [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) `YYYY-MM-DDThh:mm:ssZ`. Например, `2019-08-20T10:18:56Z`. Обратите внимание, что вывод производится в UTC (`Z` означает UTC).

- `unix_timestamp` — формат вывода Unix timestamp.

    ClickHouse выводит дату и время в формате [Unix timestamp](https://en.wikipedia.org/wiki/Unix_time). Например, `1566285536`.

См. также:

- [Тип данных DateTime.](../../sql-reference/data-types/datetime.md)
- [Функции для работы с датой и временем.](../../sql-reference/functions/date-time-functions.md)

## date_time_overflow_behavior {#date_time_overflow_behavior}   

<SettingsInfoBlock type="DateTimeOverflowBehavior" default_value="ignore" />

Определяет поведение при преобразовании [Date](../../sql-reference/data-types/date.md), [Date32](../../sql-reference/data-types/date32.md), [DateTime](../../sql-reference/data-types/datetime.md), [DateTime64](../../sql-reference/data-types/datetime64.md) или целых чисел в Date, Date32, DateTime или DateTime64, когда значение не может быть представлено в результирующем типе.

Возможные значения:

- `ignore` — Незаметно игнорировать переполнения. Результат не определён.
- `throw` — Генерировать исключение в случае переполнения.
- `saturate` — Ограничивать результат сверху и снизу. Если значение меньше минимального значения, которое может быть представлено целевым типом, в качестве результата выбирается минимальное представимое значение. Если значение больше максимального значения, которое может быть представлено целевым типом, в качестве результата выбирается максимальное представимое значение.

Значение по умолчанию: `ignore`.

## dictionary_use_async_executor {#dictionary_use_async_executor}   

<SettingsInfoBlock type="Bool" default_value="0" />

Выполняет конвейер чтения данных из источника словаря в нескольких потоках. Поддерживается только для словарей с локальным источником CLICKHOUSE.

## errors_output_format {#errors_output_format}   

<SettingsInfoBlock type="String" default_value="CSV" />

Метод вывода ошибок в текстовом формате.

## exact_rows_before_limit {#exact_rows_before_limit}   

<SettingsInfoBlock type="Bool" default_value="0" />

Если параметр включён, ClickHouse будет возвращать точное значение статистики rows_before_limit_at_least, но за счёт того, что данные до применения limit придётся полностью прочитать

## format_avro_schema_registry_url {#format_avro_schema_registry_url}   

Для формата AvroConfluent: URL реестра схем Confluent.

## format_binary_max_array_size {#format_binary_max_array_size}   

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

Максимально допустимый размер Array в формате RowBinary. Это предотвращает выделение большого объёма памяти в случае повреждения данных. 0 означает отсутствие ограничения.

## format_binary_max_object_size {#format_binary_max_object_size}   

<SettingsInfoBlock type="UInt64" default_value="100000" />

Максимально допустимое количество путей в одном Object для формата RowBinary типа JSON. Это предотвращает выделение большого объема памяти в случае повреждённых данных. Значение 0 означает отсутствие ограничения.

## format_binary_max_string_size {#format_binary_max_string_size}   

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

Максимально допустимый размер значения типа String в формате RowBinary. Предотвращает выделение большого объёма памяти в случае повреждённых данных. Значение 0 означает отсутствие ограничения.

## format_capn_proto_enum_comparising_mode {#format_capn_proto_enum_comparising_mode}   

<SettingsInfoBlock type="CapnProtoEnumComparingMode" default_value="by_values" />

Как сопоставить перечисления Enum в ClickHouse и CapnProto

## format_capn_proto_max_message_size {#format_capn_proto_max_message_size}   

<SettingsInfoBlock type="UInt64" default_value="1073741824" />

Максимально допустимый размер одного сообщения CapnProto в байтах. Ограничивает случаи, когда некорректные или повреждённые данные приводят к чрезмерному выделению памяти. Значение по умолчанию — 1 GiB.

## format_capn_proto_use_autogenerated_schema {#format_capn_proto_use_autogenerated_schema}   

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать автоматически сгенерированную схему CapnProto, если format_schema не задан

## format_csv_allow_double_quotes {#format_csv_allow_double_quotes}   

<SettingsInfoBlock type="Bool" default_value="1" />

Если установлено значение `true`, разрешает использование строк в двойных кавычках.

## format_csv_allow_single_quotes {#format_csv_allow_single_quotes}   

<SettingsInfoBlock type="Bool" default_value="0" />

Если установлено в true, разрешает строки в одинарных кавычках.

## format_csv_delimiter {#format_csv_delimiter}   

<SettingsInfoBlock type="Char" default_value="," />

Символ, который следует рассматривать как разделитель в CSV‑данных. Если значение задаётся строкой, она должна состоять из одного символа.

## format_csv_null_representation {#format_csv_null_representation}   

<SettingsInfoBlock type="String" default_value="\N" />

Настраиваемое представление значения NULL в формате CSV

## format_custom_escaping_rule {#format_custom_escaping_rule}   

<SettingsInfoBlock type="EscapingRule" default_value="Escaped" />

Правило экранирования полей (для формата CustomSeparated)

## format_custom_field_delimiter {#format_custom_field_delimiter}   

<SettingsInfoBlock type="String" default_value="	" />

Разделитель между полями (для формата CustomSeparated)

## format_custom_result_after_delimiter {#format_custom_result_after_delimiter}   

Суффикс, добавляемый после результирующего набора (для формата CustomSeparated)

## format_custom_result_before_delimiter {#format_custom_result_before_delimiter}   

Префикс перед набором результатов запроса (для формата CustomSeparated)

## format_custom_row_after_delimiter {#format_custom_row_after_delimiter}   

<SettingsInfoBlock type="String" default_value="
" />

Разделитель после поля в последнем столбце (для формата CustomSeparated)

## format_custom_row_before_delimiter {#format_custom_row_before_delimiter}   

Разделитель перед полем первого столбца (для формата CustomSeparated)

## format_custom_row_between_delimiter {#format_custom_row_between_delimiter}   

Разделитель между строками (для формата CustomSeparated)

## format_display_secrets_in_show_and_select {#format_display_secrets_in_show_and_select}   

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает отображение секретов в запросах `SHOW` и `SELECT` для таблиц, баз данных,
табличных функций и словарей.

Пользователь, который хочет просматривать секреты, также должен иметь
включенную [настройку сервера `display_secrets_in_show_and_select`](../server-configuration-parameters/settings#display_secrets_in_show_and_select)
и привилегию
[`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect).

Возможные значения:

-   0 — Отключено.
-   1 — Включено.

## format_json_object_each_row_column_for_object_name {#format_json_object_each_row_column_for_object_name}   

Имя столбца, которое будет использоваться для хранения/записи имён объектов в формате [JSONObjectEachRow](/interfaces/formats/JSONObjectEachRow).
Тип столбца должен быть String. Если значение не задано, для имён объектов будут использоваться имена по умолчанию `row_{i}`.

## format_protobuf_use_autogenerated_schema {#format_protobuf_use_autogenerated_schema}   

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать автоматически сгенерированную схему Protobuf, если параметр format_schema не задан

## format_regexp {#format_regexp}   

Регулярное выражение (для формата Regexp)

## format_regexp_escaping_rule {#format_regexp_escaping_rule}   

<SettingsInfoBlock type="EscapingRule" default_value="Raw" />

Правило экранирования полей (для формата Regexp)

## format_regexp_skip_unmatched {#format_regexp_skip_unmatched}   

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускать строки, не соответствующие регулярному выражению (для формата Regexp)

## format_schema {#format_schema}   

Этот параметр используется, когда вы применяете форматы, требующие определения схемы, такие как [Cap'n Proto](https://capnproto.org/) или [Protobuf](https://developers.google.com/protocol-buffers/). Конкретное значение зависит от формата.

## format_schema_message_name {#format_schema_message_name}   

Определяет имя необходимого сообщения в схеме, заданной в `format_schema`.
Для сохранения совместимости с устаревшим форматом `format_schema` (`file_name:message_name`):

- Если `format_schema_message_name` не указан, имя сообщения определяется из части `message_name` устаревшего значения `format_schema`.
- Если `format_schema_message_name` указан при использовании устаревшего формата, будет сгенерирована ошибка.

## format_schema_source {#format_schema_source}   

<SettingsInfoBlock type="String" default_value="file" />

Определяет источник `format_schema`.
Возможные значения:

- 'file' (по умолчанию): `format_schema` — это имя файла схемы, расположенного в директории `format_schemas`.
- 'string': `format_schema` — это буквальное содержимое схемы.
- 'query': `format_schema` — это запрос для получения схемы.
Если `format_schema_source` установлено в значение 'query', применяются следующие условия:
- Запрос должен возвращать ровно одно значение: одну строку с одним строковым столбцом.
- Результат запроса интерпретируется как содержимое схемы.
- Этот результат кэшируется локально в директории `format_schemas`.
- Локальный кэш можно очистить с помощью команды: `SYSTEM DROP FORMAT SCHEMA CACHE FOR Files`.
- После кэширования идентичные запросы не выполняются для повторного получения схемы, пока кэш не будет явно очищен.
- Помимо локальных файлов кэша, сообщения Protobuf также кэшируются в памяти. Даже после очистки локальных файлов кэша кэш в памяти необходимо очистить с помощью `SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf]`, чтобы полностью обновить схему.
- Выполните запрос `SYSTEM DROP FORMAT SCHEMA CACHE`, чтобы очистить кэш одновременно и для файлов кэша, и для схем сообщений Protobuf.

## format_template_resultset {#format_template_resultset}   

Путь к файлу, который содержит форматную строку для результирующего набора (для формата Template)

## format_template_resultset_format {#format_template_resultset_format}   

Строка формата результирующего набора данных (для формата Template)

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

Задаёт максимальное количество допустимых ошибок при чтении из текстовых форматов (CSV, TSV и т. д.).

Значение по умолчанию — 0.

Всегда используйте его вместе с `input_format_allow_errors_ratio`.

Если при чтении строк возникает ошибка, но счётчик ошибок всё ещё меньше `input_format_allow_errors_num`, ClickHouse игнорирует строку и переходит к следующей.

Если превышены и `input_format_allow_errors_num`, и `input_format_allow_errors_ratio`, ClickHouse выбрасывает исключение.

## input_format_allow_errors_ratio {#input_format_allow_errors_ratio}   

<SettingsInfoBlock type="Float" default_value="0" />

Задает максимальный допустимый процент ошибок при чтении текстовых форматов (CSV, TSV и т.д.).
Процент ошибок задается как число с плавающей запятой в диапазоне от 0 до 1.

Значение по умолчанию — 0.

Всегда используйте эту настройку вместе с `input_format_allow_errors_num`.

Если при чтении строк произошла ошибка, но счетчик ошибок все еще меньше `input_format_allow_errors_ratio`, ClickHouse игнорирует эту строку и переходит к следующей.

Если превышены и `input_format_allow_errors_num`, и `input_format_allow_errors_ratio`, ClickHouse генерирует исключение.

## input_format_allow_seeks {#input_format_allow_seeks}   

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает произвольный доступ при чтении из входных форматов ORC/Parquet/Arrow.

По умолчанию — включён.

## input_format_arrow_allow_missing_columns {#input_format_arrow_allow_missing_columns}   

<SettingsInfoBlock type="Bool" default_value="1" />

Допускает отсутствие столбцов при чтении входных форматов Arrow

## input_format_arrow_case_insensitive_column_matching {#input_format_arrow_case_insensitive_column_matching}   

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорировать регистр при сопоставлении столбцов Arrow со столбцами ClickHouse.

## input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference {#input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускать столбцы с неподдерживаемыми типами при выводе схемы для формата Arrow

## input_format_avro_allow_missing_fields {#input_format_avro_allow_missing_fields}   

<SettingsInfoBlock type="Bool" default_value="0" />

Для форматов Avro/AvroConfluent: если поле не найдено в схеме, используется значение по умолчанию вместо ошибки

## input_format_avro_null_as_default {#input_format_avro_null_as_default}   

<SettingsInfoBlock type="Bool" default_value="0" />

Для форматов Avro/AvroConfluent: подставлять значение по умолчанию при NULL в столбце, который не является Nullable

## input_format_binary_decode_types_in_binary_format {#input_format_binary_decode_types_in_binary_format}   

<SettingsInfoBlock type="Bool" default_value="0" />

Считывать типы данных в бинарном формате вместо имен типов во входном формате RowBinaryWithNamesAndTypes.

## input_format_binary_read_json_as_string {#input_format_binary_read_json_as_string}   

<SettingsInfoBlock type="Bool" default_value="0" />

Считывать значения типа данных [JSON](../../sql-reference/data-types/newjson.md) как значения [String](../../sql-reference/data-types/string.md) при использовании формата ввода RowBinary.

## input_format_bson_skip_fields_with_unsupported_types_in_schema_inference {#input_format_bson_skip_fields_with_unsupported_types_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускать поля с неподдерживаемыми типами при определении схемы для формата BSON.

## input_format_capn_proto_skip_fields_with_unsupported_types_in_schema_inference {#input_format_capn_proto_skip_fields_with_unsupported_types_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускать столбцы с неподдерживаемыми типами при автоматическом определении схемы для формата CapnProto

## input_format_csv_allow_cr_end_of_line {#input_format_csv_allow_cr_end_of_line}   

<SettingsInfoBlock type="Bool" default_value="0" />

Если установлено значение true, символ \\r будет допустим в конце строки, за которым не следует 

## input_format_csv_allow_variable_number_of_columns {#input_format_csv_allow_variable_number_of_columns}   

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорирует дополнительные столбцы во входных данных CSV (если в файле больше столбцов, чем ожидается) и рассматривает отсутствующие поля во входных данных CSV как значения по умолчанию

## input_format_csv_allow_whitespace_or_tab_as_delimiter {#input_format_csv_allow_whitespace_or_tab_as_delimiter}   

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает использование пробелов и символа табуляции (\\t) в качестве разделителя полей в строках CSV

## input_format_csv_arrays_as_nested_csv {#input_format_csv_arrays_as_nested_csv}   

<SettingsInfoBlock type="Bool" default_value="0" />

При чтении `Array` из CSV ожидается, что его элементы были сериализованы во вложенный CSV, а затем помещены в строку. Пример: \"[\"\"Hello\"\", \"\"world\"\", \"\"42\"\"\"\" TV\"\"]\". Квадратные скобки вокруг массива можно опустить.

## input_format_csv_deserialize_separate_columns_into_tuple {#input_format_csv_deserialize_separate_columns_into_tuple}   

<SettingsInfoBlock type="Bool" default_value="1" />

Если значение параметра равно true, отдельные столбцы, записанные в формате CSV, можно десериализовать в столбец типа Tuple.

## input_format_csv_detect_header {#input_format_csv_detect_header}   

<SettingsInfoBlock type="Bool" default_value="1" />

Автоматически определять заголовок с именами и типами столбцов в формате CSV

## input_format_csv_empty_as_default {#input_format_csv_empty_as_default}   

<SettingsInfoBlock type="Bool" default_value="1" />

Интерпретировать пустые поля во входных CSV-данных как значения по умолчанию.

## input_format_csv_enum_as_number {#input_format_csv_enum_as_number}   

<SettingsInfoBlock type="Bool" default_value="0" />

Рассматривать вставляемые в форматах CSV значения enum как их числовые индексы

## input_format_csv_skip_first_lines {#input_format_csv_skip_first_lines}   

<SettingsInfoBlock type="UInt64" default_value="0" />

Пропускать указанное количество строк в начале входных данных в формате CSV

## input_format_csv_skip_trailing_empty_lines {#input_format_csv_skip_trailing_empty_lines}   

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускать завершающие пустые строки в формате CSV

## input_format_csv_trim_whitespaces {#input_format_csv_trim_whitespaces}   

<SettingsInfoBlock type="Bool" default_value="1" />

Удаляет пробелы и символы табуляции (\\t) в начале и в конце CSV-строк

## input_format_csv_try_infer_numbers_from_strings {#input_format_csv_try_infer_numbers_from_strings}   

<SettingsInfoBlock type="Bool" default_value="0" />

Если включено, при определении схемы ClickHouse будет пытаться выводить числовые значения из строковых полей.
Это может быть полезно, если CSV‑данные содержат заключённые в кавычки числа типа UInt64.

По умолчанию отключено.

## input_format_csv_try_infer_strings_from_quoted_tuples {#input_format_csv_try_infer_strings_from_quoted_tuples}   

<SettingsInfoBlock type="Bool" default_value="1" />

Интерпретировать заключённые в кавычки кортежи во входных данных как значение типа String.

## input_format_csv_use_best_effort_in_schema_inference {#input_format_csv_use_best_effort_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать дополнительные эвристики и приёмы для определения схемы в формате CSV

## input_format_csv_use_default_on_bad_values {#input_format_csv_use_default_on_bad_values}   

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает устанавливать значение по умолчанию для столбца, если при десериализации поля CSV произошла ошибка из‑за некорректного значения

## input_format_custom_allow_variable_number_of_columns {#input_format_custom_allow_variable_number_of_columns}   

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорировать лишние столбцы во входных данных CustomSeparated (если в файле больше столбцов, чем ожидается) и интерпретировать отсутствующие поля во входных данных CustomSeparated как значения по умолчанию

## input_format_custom_detect_header {#input_format_custom_detect_header}   

<SettingsInfoBlock type="Bool" default_value="1" />

Автоматически определять заголовок с именами и типами в формате CustomSeparated

## input_format_custom_skip_trailing_empty_lines {#input_format_custom_skip_trailing_empty_lines}   

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускать пустые строки в конце в формате CustomSeparated

## input_format_defaults_for_omitted_fields {#input_format_defaults_for_omitted_fields}   

<SettingsInfoBlock type="Bool" default_value="1" />

При выполнении запросов `INSERT` пропущенные значения во входных данных для столбцов заменяются значениями по умолчанию соответствующих столбцов. Эта опция применяется к форматам [JSONEachRow](/interfaces/formats/JSONEachRow) (и другим JSON-форматам), [CSV](/interfaces/formats/CSV), [TabSeparated](/interfaces/formats/TabSeparated), [TSKV](/interfaces/formats/TSKV), [Parquet](/interfaces/formats/Parquet), [Arrow](/interfaces/formats/Arrow), [Avro](/interfaces/formats/Avro), [ORC](/interfaces/formats/ORC), [Native](/interfaces/formats/Native), а также к форматам с суффиксами `WithNames`/`WithNamesAndTypes`.

:::note
Когда эта опция включена, с сервера на клиент отправляются расширенные метаданные таблицы. Это требует дополнительных вычислительных ресурсов на сервере и может снизить производительность.
:::

Возможные значения:

- 0 — Отключена.
- 1 — Включена.

## input_format_force_null_for_omitted_fields {#input_format_force_null_for_omitted_fields}   

<SettingsInfoBlock type="Bool" default_value="0" />

Принудительно инициализировать опущенные поля значением NULL

## input_format_hive_text_allow_variable_number_of_columns {#input_format_hive_text_allow_variable_number_of_columns}   

<SettingsInfoBlock type="Bool" default_value="1" />

Игнорировать лишние столбцы во входных данных Hive Text (если файл содержит больше столбцов, чем ожидается) и считать отсутствующие поля во входных данных Hive Text значениями по умолчанию.

## input_format_hive_text_collection_items_delimiter {#input_format_hive_text_collection_items_delimiter}   

<SettingsInfoBlock type="Char" default_value="" />

Разделитель между элементами коллекции (array или map) в текстовом файле Hive

## input_format_hive_text_fields_delimiter {#input_format_hive_text_fields_delimiter}   

<SettingsInfoBlock type="Char" default_value="" />

Разделитель полей в файлах Hive TextFile

## input_format_hive_text_map_keys_delimiter {#input_format_hive_text_map_keys_delimiter}   

<SettingsInfoBlock type="Char" default_value="" />

Разделитель между парой ключ/значение map в текстовом файле Hive

## input_format_import_nested_json {#input_format_import_nested_json}   

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает вставку JSON-данных с вложенными объектами.

Поддерживаемые форматы:

- [JSONEachRow](/interfaces/formats/JSONEachRow)

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

См. также:

- [Использование вложенных структур](/integrations/data-formats/json/other-formats#accessing-nested-json-objects) с форматом `JSONEachRow`.

## input_format_ipv4_default_on_conversion_error {#input_format_ipv4_default_on_conversion_error}   

<SettingsInfoBlock type="Bool" default_value="0" />

При десериализации IPv4 при ошибке преобразования вместо генерации исключения будут использоваться значения по умолчанию.

По умолчанию отключено.

## input_format_ipv6_default_on_conversion_error {#input_format_ipv6_default_on_conversion_error}   

<SettingsInfoBlock type="Bool" default_value="0" />

При десериализации IPv6 будут использоваться значения по умолчанию вместо генерации исключения при ошибке преобразования.

По умолчанию отключено.

## input_format_json_compact_allow_variable_number_of_columns {#input_format_json_compact_allow_variable_number_of_columns}   

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает переменное количество столбцов в строках во входных форматах JSONCompact и JSONCompactEachRow.
Игнорирует лишние столбцы в строках, содержащих больше столбцов, чем ожидается, и обрабатывает отсутствующие столбцы как значения по умолчанию.

По умолчанию отключено.

## input_format_json_defaults_for_missing_elements_in_named_tuple {#input_format_json_defaults_for_missing_elements_in_named_tuple}   

<SettingsInfoBlock type="Bool" default_value="1" />

Подставляет значения по умолчанию для отсутствующих полей JSON-объекта при разборе именованного кортежа.
Этот параметр работает только при включённой настройке `input_format_json_named_tuples_as_objects`.

По умолчанию включён.

## input_format_json_empty_as_default {#input_format_json_empty_as_default}   

<SettingsInfoBlock type="Bool" default_value="0" />

Если параметр включен, пустые поля во входных данных JSON заменяются значениями по умолчанию. Для сложных выражений значений по умолчанию также должен быть включен `input_format_defaults_for_omitted_fields`.

Возможные значения:

+ 0 — Отключить.
+ 1 — Включить.

## input_format_json_ignore_unknown_keys_in_named_tuple {#input_format_json_ignore_unknown_keys_in_named_tuple}   

<SettingsInfoBlock type="Bool" default_value="1" />

Игнорировать неизвестные ключи в JSON-объекте для именованных кортежей.

Включено по умолчанию.

## input_format_json_ignore_unnecessary_fields {#input_format_json_ignore_unnecessary_fields}   

<SettingsInfoBlock type="Bool" default_value="1" />

Игнорировать ненужные поля и не разбирать их. Включение этой настройки может привести к тому, что при разборе JSON-строк с некорректным форматом или с дублирующимися полями исключения не будут выбрасываться.

## input&#95;format&#95;json&#95;infer&#95;array&#95;of&#95;dynamic&#95;from&#95;array&#95;of&#95;different&#95;types {#input_format_json_infer_array_of_dynamic_from_array_of_different_types}

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

По умолчанию включено.


## input&#95;format&#95;json&#95;infer&#95;incomplete&#95;types&#95;as&#95;strings {#input_format_json_infer_incomplete_types_as_strings}

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает использовать тип String для JSON-ключей, которые в выборке данных содержат только `Null`/`{}`/`[]` при выводе схемы.

В JSON-форматах любое значение может быть прочитано как String, и мы можем избежать ошибок вида `Cannot determine type for column 'column_name' by first 25000 rows of data, most likely this column contains only Nulls or empty Arrays/Maps` при выводе схемы,
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

По умолчанию включено.


## input_format_json_map_as_array_of_tuples {#input_format_json_map_as_array_of_tuples}   

<SettingsInfoBlock type="Bool" default_value="0" />

Десериализует столбцы типа Map в виде JSON-массивов кортежей.

По умолчанию отключено.

## input_format_json_max_depth {#input_format_json_max_depth}   

<SettingsInfoBlock type="UInt64" default_value="1000" />

Максимальная глубина вложенности поля в JSON. Это не жёсткое ограничение; его не обязательно соблюдать строго.

## input_format_json_named_tuples_as_objects {#input_format_json_named_tuples_as_objects}   

<SettingsInfoBlock type="Bool" default_value="1" />

Разбирать столбцы именованных кортежей как JSON-объекты.

Включено по умолчанию.

## input&#95;format&#95;json&#95;read&#95;arrays&#95;as&#95;strings {#input_format_json_read_arrays_as_strings}

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает парсить JSON-массивы как строки во входных форматах JSON.

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


## input_format_json_read_bools_as_numbers {#input_format_json_read_bools_as_numbers}   

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает разбор булевых значений как чисел во входных форматах JSON.

Включено по умолчанию.

## input_format_json_read_bools_as_strings {#input_format_json_read_bools_as_strings}   

<SettingsInfoBlock type="Bool" default_value="1" />

Позволяет разбирать булевы значения как строки во входных форматах JSON.

Включено по умолчанию.

## input_format_json_read_numbers_as_strings {#input_format_json_read_numbers_as_strings}   

<SettingsInfoBlock type="Bool" default_value="1" />

Позволяет разбирать числа как строки во входных форматах JSON.

Включено по умолчанию.

## input&#95;format&#95;json&#95;read&#95;objects&#95;as&#95;strings {#input_format_json_read_objects_as_strings}

<SettingsInfoBlock type="Bool" default_value="1" />

Позволяет разбирать JSON-объекты как строки во входных форматах JSON.

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

Выбрасывать исключение, если строка JSON содержит некорректную escape-последовательность во входных форматах JSON. Если параметр отключён, некорректные escape-последовательности останутся в данных без изменений.

По умолчанию включено.

## input&#95;format&#95;json&#95;try&#95;infer&#95;named&#95;tuples&#95;from&#95;objects {#input_format_json_try_infer_named_tuples_from_objects}

<SettingsInfoBlock type="Bool" default_value="1" />

Если параметр включён, при выводе схемы ClickHouse будет пытаться выводить именованный Tuple из JSON-объектов.
Получившийся именованный Tuple будет содержать все элементы из всех соответствующих JSON-объектов в выборке данных.

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

По умолчанию включено.


## input_format_json_try_infer_numbers_from_strings {#input_format_json_try_infer_numbers_from_strings}   

<SettingsInfoBlock type="Bool" default_value="0" />

Если включено, при определении схемы ClickHouse будет пытаться распознавать числовые значения в строковых полях.
Это может быть полезно, если JSON‑данные содержат заключённые в кавычки числа типа UInt64.

По умолчанию отключено.

## input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects {#input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects}   

<SettingsInfoBlock type="Bool" default_value="0" />

Использовать тип String вместо генерации исключения в случае неоднозначных путей в объектах JSON при определении типов именованных кортежей

## input_format_json_validate_types_from_metadata {#input_format_json_validate_types_from_metadata}   

<SettingsInfoBlock type="Bool" default_value="1" />

Для форматов ввода JSON, JSONCompact и JSONColumnsWithMetadata, если этот параметр установлен в 1,
типы из метаданных во входных данных будут сравниваться с типами соответствующих столбцов таблицы.

Параметр включен по умолчанию.

## input_format_max_block_size_bytes {#input_format_max_block_size_bytes}   

<SettingsInfoBlock type="UInt64" default_value="0" />

Ограничивает размер блоков, формируемых при разборе данных во входных форматах, в байтах. Используется в построчных форматах ввода, когда блок формируется на стороне ClickHouse.
0 означает отсутствие ограничения в байтах.

## input_format_max_bytes_to_read_for_schema_inference {#input_format_max_bytes_to_read_for_schema_inference}   

<SettingsInfoBlock type="UInt64" default_value="33554432" />

Максимальный объем данных в байтах, который считывается для автоматического определения схемы.

## input_format_max_rows_to_read_for_schema_inference {#input_format_max_rows_to_read_for_schema_inference}   

<SettingsInfoBlock type="UInt64" default_value="25000" />

Максимальное количество строк данных, считываемых для автоматического определения схемы.

## input_format_msgpack_number_of_columns {#input_format_msgpack_number_of_columns}   

<SettingsInfoBlock type="UInt64" default_value="0" />

Количество столбцов во вставляемых данных MsgPack. Используется для автоматического определения схемы на основе данных.

## input_format_mysql_dump_map_column_names {#input_format_mysql_dump_map_column_names}   

<SettingsInfoBlock type="Bool" default_value="1" />

Сопоставлять столбцы таблицы из дампа MySQL и столбцы таблицы ClickHouse по именам

## input_format_mysql_dump_table_name {#input_format_mysql_dump_table_name}   

Имя таблицы в дампе MySQL, из которой читать данные

## input_format_native_allow_types_conversion {#input_format_native_allow_types_conversion}   

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает преобразование типов данных во входном формате Native

## input_format_native_decode_types_in_binary_format {#input_format_native_decode_types_in_binary_format}   

<SettingsInfoBlock type="Bool" default_value="0" />

Считывать типы данных в двоичном формате вместо имён типов во входном формате Native

## input_format_null_as_default {#input_format_null_as_default}   

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает инициализацию полей [NULL](/sql-reference/syntax#literals) [значениями по умолчанию](/sql-reference/statements/create/table#default_values), если тип данных этих полей не является [Nullable](/sql-reference/data-types/nullable).
Если тип столбца не Nullable и эта настройка отключена, вставка `NULL` приводит к исключению. Если тип столбца Nullable, то значения `NULL` вставляются как есть, независимо от этой настройки.

Эта настройка применяется для большинства форматов ввода.

Для сложных выражений по умолчанию настройку `input_format_defaults_for_omitted_fields` также необходимо включить.

Возможные значения:

- 0 — вставка `NULL` в столбец с типом, не являющимся Nullable, приводит к исключению.
- 1 — поля `NULL` инициализируются значениями столбца по умолчанию.

## input_format_orc_allow_missing_columns {#input_format_orc_allow_missing_columns}   

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешать отсутствие столбцов при чтении входных данных в формате ORC

## input_format_orc_case_insensitive_column_matching {#input_format_orc_case_insensitive_column_matching}   

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорировать регистр при сопоставлении столбцов ORC со столбцами ClickHouse.

## input_format_orc_dictionary_as_low_cardinality {#input_format_orc_dictionary_as_low_cardinality}   

<SettingsInfoBlock type="Bool" default_value="1" />

Рассматривать столбцы ORC, закодированные с помощью словаря, как столбцы LowCardinality при чтении файлов в формате ORC.

## input_format_orc_filter_push_down {#input_format_orc_filter_push_down}   

<SettingsInfoBlock type="Bool" default_value="1" />

При чтении файлов ORC пропускаются целые полосы (stripes) или группы строк на основе выражений WHERE/PREWHERE, минимальных/максимальных статистик или bloom-фильтра в метаданных ORC.

## input_format_orc_reader_time_zone_name {#input_format_orc_reader_time_zone_name}   

<SettingsInfoBlock type="String" default_value="GMT" />

Имя часового пояса для ORC-ридера строк; часовой пояс ORC-ридера строк по умолчанию — GMT.

## input_format_orc_row_batch_size {#input_format_orc_row_batch_size}   

<SettingsInfoBlock type="Int64" default_value="100000" />

Размер пакета строк при чтении stripes формата ORC.

## input_format_orc_skip_columns_with_unsupported_types_in_schema_inference {#input_format_orc_skip_columns_with_unsupported_types_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускать столбцы с неподдерживаемыми типами при автоматическом определении схемы для формата ORC

## input_format_orc_use_fast_decoder {#input_format_orc_use_fast_decoder}   

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать более быструю реализацию декодера ORC.

## input_format_parquet_allow_geoparquet_parser {#input_format_parquet_allow_geoparquet_parser}   

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать парсер гео-столбцов для преобразования столбцов типа Array(UInt8) в типы Point/Linestring/Polygon/MultiLineString/MultiPolygon

## input_format_parquet_allow_missing_columns {#input_format_parquet_allow_missing_columns}   

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает отсутствие столбцов при чтении входных данных в формате Parquet

## input_format_parquet_bloom_filter_push_down {#input_format_parquet_bloom_filter_push_down}   

<SettingsInfoBlock type="Bool" default_value="1" />

При чтении файлов Parquet пропускает целые группы строк на основании выражений WHERE и bloom-фильтра в метаданных Parquet.

## input_format_parquet_case_insensitive_column_matching {#input_format_parquet_case_insensitive_column_matching}   

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорировать регистр при сопоставлении столбцов Parquet со столбцами ClickHouse.

## input_format_parquet_enable_json_parsing {#input_format_parquet_enable_json_parsing}   

<SettingsInfoBlock type="Bool" default_value="1" />

При чтении файлов Parquet разбирать JSON-столбцы как JSON-столбцы ClickHouse.

## input_format_parquet_enable_row_group_prefetch {#input_format_parquet_enable_row_group_prefetch}   

<SettingsInfoBlock type="Bool" default_value="1" />

Включает предварительную выборку групп строк при разборе файлов Parquet. В настоящее время предварительная выборка поддерживается только при однопоточном разборе.

## input_format_parquet_filter_push_down {#input_format_parquet_filter_push_down}   

<SettingsInfoBlock type="Bool" default_value="1" />

При чтении файлов Parquet пропускает целые группы строк на основе выражений WHERE/PREWHERE и min/max‑статистики в метаданных Parquet.

## input_format_parquet_local_file_min_bytes_for_seek {#input_format_parquet_local_file_min_bytes_for_seek}   

<SettingsInfoBlock type="UInt64" default_value="8192" />

Минимальное количество байт локального чтения файла, при котором выполняется переход по смещению (seek) вместо чтения с пропуском данных во входном формате Parquet

## input_format_parquet_local_time_as_utc {#input_format_parquet_local_time_as_utc}   

<SettingsInfoBlock type="Bool" default_value="1" />

Определяет тип данных, используемый при выводе схемы для временных меток Parquet с isAdjustedToUTC=false. Если true: DateTime64(..., 'UTC'), если false: DateTime64(...). Ни один из вариантов не является полностью корректным, так как в ClickHouse нет типа данных для локального настенного времени. Как ни парадоксально, значение 'true' является, вероятно, менее некорректным вариантом, поскольку форматирование временной метки 'UTC' в String даст представление корректного локального времени.

## input_format_parquet_max_block_size {#input_format_parquet_max_block_size}   

<SettingsInfoBlock type="NonZeroUInt64" default_value="65409" />

Максимальный размер блока при чтении Parquet.

## input_format_parquet_memory_high_watermark {#input_format_parquet_memory_high_watermark}   

<SettingsInfoBlock type="UInt64" default_value="4294967296" />

Примерный предел использования памяти для ридера Parquet v3. Ограничивает количество групп строк или столбцов, которые могут считываться параллельно. При чтении нескольких файлов в одном запросе лимит относится к суммарному использованию памяти для всех этих файлов.

## input_format_parquet_memory_low_watermark {#input_format_parquet_memory_low_watermark}   

<SettingsInfoBlock type="UInt64" default_value="2097152" />

Предварительная выборка выполняется более агрессивно, если использование памяти ниже этого порога. Потенциально полезно, например, если по сети нужно прочитать много небольших фильтров Блума.

## input_format_parquet_page_filter_push_down {#input_format_parquet_page_filter_push_down}   

<SettingsInfoBlock type="Bool" default_value="1" />

Пропускать страницы на основе минимальных и максимальных значений индекса столбца.

## input_format_parquet_prefer_block_bytes {#input_format_parquet_prefer_block_bytes}   

<SettingsInfoBlock type="UInt64" default_value="16744704" />

Средний размер блока в байтах, возвращаемый ридером Parquet

## input_format_parquet_preserve_order {#input_format_parquet_preserve_order}   

<SettingsInfoBlock type="Bool" default_value="0" />

Избегает изменения порядка строк при чтении из файлов Parquet. Не рекомендуется, так как порядок строк, как правило, не гарантирован, и другие этапы конвейера обработки запроса могут его нарушить. Вместо этого используйте `ORDER BY _row_number`.

## input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference {#input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускать столбцы с неподдерживаемыми типами при определении схемы для формата Parquet

## input_format_parquet_use_native_reader_v3 {#input_format_parquet_use_native_reader_v3}   

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать ридер Parquet v3.

## input_format_parquet_use_offset_index {#input_format_parquet_use_offset_index}   

<SettingsInfoBlock type="Bool" default_value="1" />

Небольшое изменение в способе чтения страниц из файла Parquet при отсутствии фильтрации страниц.

## input_format_parquet_verify_checksums {#input_format_parquet_verify_checksums}   

<SettingsInfoBlock type="Bool" default_value="1" />

Проверять контрольные суммы страниц при чтении файлов в формате Parquet.

## input_format_protobuf_flatten_google_wrappers {#input_format_protobuf_flatten_google_wrappers}   

<SettingsInfoBlock type="Bool" default_value="0" />

Включает Google-обёртки для обычных невложенных столбцов, например google.protobuf.StringValue 'str' для столбца String 'str'. Для столбцов Nullable пустые обёртки интерпретируются как значения по умолчанию, а отсутствующие — как null.

## input_format_protobuf_oneof_presence {#input_format_protobuf_oneof_presence}   

<SettingsInfoBlock type="Bool" default_value="0" />

Определяет, какое поле protobuf oneof было обнаружено путём задания значения перечисления в специальном столбце

## input_format_protobuf_skip_fields_with_unsupported_types_in_schema_inference {#input_format_protobuf_skip_fields_with_unsupported_types_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускать поля с неподдерживаемыми типами при автоопределении схемы для формата Protobuf

## input_format_record_errors_file_path {#input_format_record_errors_file_path}   

Путь к файлу, в который записываются ошибки при чтении текстовых форматов (CSV, TSV).

## input_format_skip_unknown_fields {#input_format_skip_unknown_fields}   

<SettingsInfoBlock type="Bool" default_value="1" />

Включает или отключает пропуск дополнительных данных при вставке.

При записи данных ClickHouse выбрасывает исключение, если входные данные содержат столбцы, которые не существуют в целевой таблице. Если пропуск включён, ClickHouse не вставляет дополнительные данные и не выбрасывает исключение.

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

Если параметр включён, ClickHouse будет пытаться вывести тип `Date` из строковых полей при определении схемы для текстовых форматов. Если все значения столбца во входных данных были успешно распознаны как даты, результирующий тип — `Date`. Если хотя бы одно значение не было распознано как дата, результирующий тип — `String`.

Включено по умолчанию.

## input_format_try_infer_datetimes {#input_format_try_infer_datetimes}   

<SettingsInfoBlock type="Bool" default_value="1" />

Если параметр включён, ClickHouse попытается определить тип `DateTime64` по строковым полям при определении схемы для текстовых форматов. Если все значения столбца во входных данных были успешно разобраны как дата‑время, результирующим типом будет `DateTime64`; если хотя бы одно значение не было разобрано как дата‑время, результирующим типом будет `String`.

По умолчанию параметр включён.

## input_format_try_infer_datetimes_only_datetime64 {#input_format_try_infer_datetimes_only_datetime64}   

<SettingsInfoBlock type="Bool" default_value="0" />

Если параметр input_format_try_infer_datetimes включён, автоматически распознаются только значения типа DateTime64, но не DateTime.

## input_format_try_infer_exponent_floats {#input_format_try_infer_exponent_floats}   

<SettingsInfoBlock type="Bool" default_value="0" />

Пытаться интерпретировать числа в экспоненциальной записи как значения типа `Float` при выводе схемы в текстовых форматах (кроме JSON, где числа с показателем степени всегда интерпретируются таким образом)

## input_format_try_infer_integers {#input_format_try_infer_integers}   

<SettingsInfoBlock type="Bool" default_value="1" />

Если включено, ClickHouse будет пытаться определять целые числа вместо чисел с плавающей запятой при выводе схемы для текстовых форматов. Если все числа в столбце входных данных являются целыми, результирующим типом будет `Int64`, а если хотя бы одно число является числом с плавающей запятой — результирующим типом будет `Float64`.

Включено по умолчанию.

## input_format_try_infer_variants {#input_format_try_infer_variants}   

<SettingsInfoBlock type="Bool" default_value="0" />

Если параметр включён, ClickHouse будет пытаться определить тип [`Variant`](../../sql-reference/data-types/variant.md) при автоматическом определении схемы для текстовых форматов, когда существует более одного возможного типа для элементов столбца или массива.

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## input_format_tsv_allow_variable_number_of_columns {#input_format_tsv_allow_variable_number_of_columns}   

<SettingsInfoBlock type="Bool" default_value="0" />

Игнорировать лишние столбцы во входных данных TSV (если файл содержит больше столбцов, чем ожидается) и считать отсутствующие поля во входных данных TSV значениями по умолчанию

## input_format_tsv_crlf_end_of_line {#input_format_tsv_crlf_end_of_line}   

<SettingsInfoBlock type="Bool" default_value="0" />

Если установлено значение true, функция file будет читать TSV с \\r\\n вместо \\n.

## input_format_tsv_detect_header {#input_format_tsv_detect_header}   

<SettingsInfoBlock type="Bool" default_value="1" />

Автоматически определять наличие заголовка с именами и типами в формате TSV

## input_format_tsv_empty_as_default {#input_format_tsv_empty_as_default}   

<SettingsInfoBlock type="Bool" default_value="0" />

Интерпретировать пустые поля во входных данных TSV как значения по умолчанию.

## input_format_tsv_enum_as_number {#input_format_tsv_enum_as_number}   

<SettingsInfoBlock type="Bool" default_value="0" />

Обрабатывать значения enum, вставляемые в форматах TSV, как числовые индексы enum.

## input_format_tsv_skip_first_lines {#input_format_tsv_skip_first_lines}   

<SettingsInfoBlock type="UInt64" default_value="0" />

Пропускает указанное количество строк в начале входных данных в формате TSV

## input_format_tsv_skip_trailing_empty_lines {#input_format_tsv_skip_trailing_empty_lines}   

<SettingsInfoBlock type="Bool" default_value="0" />

Пропускать завершающие пустые строки в формате TSV

## input_format_tsv_use_best_effort_in_schema_inference {#input_format_tsv_use_best_effort_in_schema_inference}   

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать дополнительные приёмы и эвристики для определения схемы в формате TSV

## input_format_values_accurate_types_of_literals {#input_format_values_accurate_types_of_literals}   

<SettingsInfoBlock type="Bool" default_value="1" />

Для формата Values: при разборе и интерпретации выражений с использованием Template следует проверять фактический тип литерала, чтобы избежать возможных проблем с переполнением и потерей точности.

## input_format_values_deduce_templates_of_expressions {#input_format_values_deduce_templates_of_expressions}   

<SettingsInfoBlock type="Bool" default_value="1" />

Для формата Values: если поле не удалось разобрать потоковым парсером, то запускается SQL‑парсер, определяется шаблон SQL‑выражения, затем выполняется попытка разобрать все строки по этому шаблону, после чего выражение интерпретируется для всех строк.

## input_format_values_interpret_expressions {#input_format_values_interpret_expressions}   

<SettingsInfoBlock type="Bool" default_value="1" />

Для формата Values: если потоковому парсеру не удалось разобрать поле, выполняется SQL‑парсер, который пытается интерпретировать его как SQL‑выражение.

## input_format_with_names_use_header {#input_format_with_names_use_header}   

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

- 0 — Отключено.
- 1 — Включено.

## input_format_with_types_use_header {#input_format_with_types_use_header}   

<SettingsInfoBlock type="Bool" default_value="1" />

Определяет, нужно ли парсеру формата проверять, совпадают ли типы данных во входных данных с типами данных в целевой таблице.

Поддерживаемые форматы:

- [CSVWithNamesAndTypes](/interfaces/formats/CSVWithNamesAndTypes)
- [TabSeparatedWithNamesAndTypes](/interfaces/formats/TabSeparatedWithNamesAndTypes)
- [JSONCompactEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactEachRowWithNamesAndTypes)
- [JSONCompactStringsEachRowWithNamesAndTypes](/interfaces/formats/JSONCompactStringsEachRowWithNamesAndTypes)
- [RowBinaryWithNamesAndTypes](/interfaces/formats/RowBinaryWithNamesAndTypes)
- [CustomSeparatedWithNamesAndTypes](/interfaces/formats/CustomSeparatedWithNamesAndTypes)

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

## insert_distributed_one_random_shard {#insert_distributed_one_random_shard}   

<SettingsInfoBlock type="Bool" default_value="0" />

Включает или отключает вставку данных в случайный сегмент таблицы [Distributed](/engines/table-engines/special/distributed), когда не задан распределённый ключ.

По умолчанию при вставке данных в таблицу `Distributed` с более чем одним сегментом сервер ClickHouse отклоняет любой запрос на вставку, если не указан распределённый ключ. Когда `insert_distributed_one_random_shard = 1`, вставка разрешена, и данные перенаправляются на случайный сегмент.

Возможные значения:

- 0 — Вставка отклоняется, если есть несколько сегментов и не задан распределённый ключ.
- 1 — Вставка выполняется в случайный сегмент среди всех доступных сегментов, когда не задан распределённый ключ.

## interval_output_format {#interval_output_format}   

<SettingsInfoBlock type="IntervalOutputFormat" default_value="numeric" />

Позволяет выбрать формат текстового вывода типов интервалов.

Возможные значения:

-   `kusto` — формат вывода в стиле KQL.

    ClickHouse выводит интервалы в [формате KQL](https://learn.microsoft.com/en-us/dotnet/standard/base-types/standard-timespan-format-strings#the-constant-c-format-specifier). Например, `toIntervalDay(2)` будет выведен как `2.00:00:00`. Обратите внимание, что для интервальных типов переменной длительности (то есть `IntervalMonth` и `IntervalYear`) учитывается среднее количество секунд на интервал.

-   `numeric` — числовой формат вывода.

    ClickHouse выводит интервалы как их числовое представление. Например, `toIntervalDay(2)` будет выведен как `2`.

См. также:

-   [Interval](../../sql-reference/data-types/special-data-types/interval.md)

## into_outfile_create_parent_directories {#into_outfile_create_parent_directories}   

<SettingsInfoBlock type="Bool" default_value="0" />

Автоматически создавать родительские каталоги при использовании оператора INTO OUTFILE, если они ещё не существуют.

## json_type_escape_dots_in_keys {#json_type_escape_dots_in_keys}   

<SettingsInfoBlock type="Bool" default_value="0" />

Если включено, точки в ключах JSON будут экранироваться при разборе.

## output_format_arrow_compression_method {#output_format_arrow_compression_method}   

<SettingsInfoBlock type="ArrowCompression" default_value="lz4_frame" />

Метод сжатия при выводе в формате Arrow. Поддерживаемые кодеки: lz4_frame, zstd, none (без сжатия)

## output_format_arrow_fixed_string_as_fixed_byte_array {#output_format_arrow_fixed_string_as_fixed_byte_array}   

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать тип данных Arrow FIXED_SIZE_BINARY вместо Binary для столбцов FixedString.

## output_format_arrow_low_cardinality_as_dictionary {#output_format_arrow_low_cardinality_as_dictionary}   

<SettingsInfoBlock type="Bool" default_value="0" />

Включить вывод типа LowCardinality как типа Dictionary в формате Arrow

## output_format_arrow_string_as_string {#output_format_arrow_string_as_string}   

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать тип Arrow String вместо Binary для строковых столбцов

## output_format_arrow_use_64_bit_indexes_for_dictionary {#output_format_arrow_use_64_bit_indexes_for_dictionary}   

<SettingsInfoBlock type="Bool" default_value="0" />

Всегда использовать 64-битные целые числа в качестве индексов словаря в формате Arrow

## output_format_arrow_use_signed_indexes_for_dictionary {#output_format_arrow_use_signed_indexes_for_dictionary}   

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать знаковые целые числа для индексов словаря в формате Arrow

## output_format_avro_codec {#output_format_avro_codec}   

Кодек сжатия, используемый при выводе. Допустимые значения: 'null', 'deflate', 'snappy', 'zstd'.

## output_format_avro_rows_in_file {#output_format_avro_rows_in_file}   

<SettingsInfoBlock type="UInt64" default_value="1" />

Максимальное число строк в файле (если это поддерживается хранилищем)

## output_format_avro_string_column_pattern {#output_format_avro_string_column_pattern}   

Для формата Avro: регулярное выражение для выбора столбцов типа String, которые следует выводить как строки AVRO.

## output_format_avro_sync_interval {#output_format_avro_sync_interval}   

<SettingsInfoBlock type="UInt64" default_value="16384" />

Интервал синхронизации в байтах.

## output_format_binary_encode_types_in_binary_format {#output_format_binary_encode_types_in_binary_format}   

<SettingsInfoBlock type="Bool" default_value="0" />

Записывать типы данных в двоичном виде вместо их имен в формате вывода RowBinaryWithNamesAndTypes

## output_format_binary_write_json_as_string {#output_format_binary_write_json_as_string}   

<SettingsInfoBlock type="Bool" default_value="0" />

Записывать значения типа данных [JSON](../../sql-reference/data-types/newjson.md) как строковые JSON-значения типа [String](../../sql-reference/data-types/string.md) в формате RowBinary.

## output_format_bson_string_as_string {#output_format_bson_string_as_string}   

<SettingsInfoBlock type="Bool" default_value="0" />

Использовать тип BSON String вместо типа Binary для столбцов типа String.

## output_format_csv_crlf_end_of_line {#output_format_csv_crlf_end_of_line}   

<SettingsInfoBlock type="Bool" default_value="0" />

Если установлено значение true, в конце строки в формате CSV будет использоваться \\r\\n вместо \\n.

## output_format_csv_serialize_tuple_into_separate_columns {#output_format_csv_serialize_tuple_into_separate_columns}   

<SettingsInfoBlock type="Bool" default_value="1" />

Если параметр имеет значение `true`, кортежи в формате CSV сериализуются как отдельные столбцы (то есть теряется информация об их вложенности в кортеже).

## output_format_decimal_trailing_zeros {#output_format_decimal_trailing_zeros}   

<SettingsInfoBlock type="Bool" default_value="0" />

Выводить конечные нули при выводе значений типа Decimal. Например, 1.230000 вместо 1.23.

По умолчанию параметр отключён.

## output&#95;format&#95;json&#95;array&#95;of&#95;rows {#output_format_json_array_of_rows}

<SettingsInfoBlock type="Bool" default_value="0" />

Включает вывод всех строк в виде JSON-массива в формате [JSONEachRow](/interfaces/formats/JSONEachRow).

Возможные значения:

* 1 — ClickHouse выводит все строки в виде массива, каждая строка в формате `JSONEachRow`.
* 0 — ClickHouse выводит каждую строку отдельно в формате `JSONEachRow`.

**Пример запроса при включённой настройке**

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

**Пример запроса с отключённой настройкой**

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

Управляет экранированием прямых слешей в строковых значениях при выводе в формате JSON. Предназначен для совместимости с JavaScript. Не путайте с обратными слешами, которые всегда экранируются.

По умолчанию параметр включён.

## output_format_json_map_as_array_of_tuples {#output_format_json_map_as_array_of_tuples}   

<SettingsInfoBlock type="Bool" default_value="0" />

Сериализует столбцы Map как JSON-массивы кортежей.

По умолчанию отключено.

## output_format_json_named_tuples_as_objects {#output_format_json_named_tuples_as_objects}   

<SettingsInfoBlock type="Bool" default_value="1" />

Сериализует столбцы типа «именованный кортеж» как объекты JSON.

Включено по умолчанию.

## output&#95;format&#95;json&#95;pretty&#95;print {#output_format_json_pretty_print}

<SettingsInfoBlock type="Bool" default_value="1" />

Этот параметр определяет, как вложенные структуры, такие как Tuples, Maps и Arrays, отображаются внутри массива `data` при использовании формата JSON.

Например, вместо следующего вывода:

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

По умолчанию включено.


## output_format_json_quote_64bit_floats {#output_format_json_quote_64bit_floats}   

<SettingsInfoBlock type="Bool" default_value="0" />

Управляет заключением 64-битных [чисел с плавающей запятой](../../sql-reference/data-types/float.md) в кавычки при их выводе в форматах JSON*.

По умолчанию отключено.

## output_format_json_quote_64bit_integers {#output_format_json_quote_64bit_integers}   

<SettingsInfoBlock type="Bool" default_value="0" />

Управляет заключением в кавычки 64-битных и более крупных [целых чисел](../../sql-reference/data-types/int-uint.md) (таких как `UInt64` или `Int128`) при выводе в формате [JSON](/interfaces/formats/JSON).
По умолчанию такие целые числа заключаются в кавычки. Это поведение совместимо с большинством реализаций JavaScript.

Возможные значения:

- 0 — целые числа выводятся без кавычек.
- 1 — целые числа заключаются в кавычки.

## output_format_json_quote_decimals {#output_format_json_quote_decimals}   

<SettingsInfoBlock type="Bool" default_value="0" />

Управляет заключением десятичных чисел в кавычки в форматах вывода JSON.

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

Когда `output_format_json_quote_denormals = 1`, запрос будет возвращать:

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

Пропускает пары ключ-значение со значением null при сериализации столбцов именованных кортежей в виде JSON-объектов. Действует только, когда output_format_json_named_tuples_as_objects имеет значение true.

## output_format_json_validate_utf8 {#output_format_json_validate_utf8}   

<SettingsInfoBlock type="Bool" default_value="0" />

Управляет проверкой последовательностей UTF-8 в форматах вывода JSON. Не влияет на форматы JSON/JSONCompact/JSONColumnsWithMetadata — они всегда проверяют UTF-8.

По умолчанию отключён.

## output&#95;format&#95;markdown&#95;escape&#95;special&#95;characters {#output_format_markdown_escape_special_characters}

<SettingsInfoBlock type="Bool" default_value="0" />

При включении специальные символы в Markdown экранируются.

[Common Mark](https://spec.commonmark.org/0.30/#example-12) определяет следующие специальные символы, которые могут быть экранированы:

```
! " # $ % & ' ( ) * + , - . / : ; < = > ? @ [ \ ] ^ _ ` { | } ~
```

Возможные значения:

* 0 — отключено.
* 1 — включено.


## output_format_msgpack_uuid_representation {#output_format_msgpack_uuid_representation}   

<SettingsInfoBlock type="MsgPackUUIDRepresentation" default_value="ext" />

Способ вывода значений UUID в формате MsgPack.

## output_format_native_encode_types_in_binary_format {#output_format_native_encode_types_in_binary_format}   

<SettingsInfoBlock type="Bool" default_value="0" />

Записывать типы данных в двоичном виде вместо их названий в формате Native

## output_format_native_use_flattened_dynamic_and_json_serialization {#output_format_native_use_flattened_dynamic_and_json_serialization}   

<SettingsInfoBlock type="Bool" default_value="0" />

Записывает данные столбцов [JSON](../../sql-reference/data-types/newjson.md) и [Dynamic](../../sql-reference/data-types/dynamic.md) в плоском формате (все типы/пути — как отдельные подстолбцы).

## output_format_native_write_json_as_string {#output_format_native_write_json_as_string}   

<SettingsInfoBlock type="Bool" default_value="0" />

Записывает данные столбца [JSON](../../sql-reference/data-types/newjson.md) в виде столбца [String](../../sql-reference/data-types/string.md), содержащего JSON-строки, вместо стандартной нативной сериализации JSON по умолчанию.

## output_format_orc_compression_block_size {#output_format_orc_compression_block_size}   

<SettingsInfoBlock type="UInt64" default_value="262144" />

Размер блока сжатия в байтах для выходного формата ORC.

## output_format_orc_compression_method {#output_format_orc_compression_method}   

<SettingsInfoBlock type="ORCCompression" default_value="zstd" />

Метод сжатия для формата ORC при выводе. Поддерживаемые кодеки: lz4, snappy, zlib, zstd, none (без сжатия).

## output_format_orc_dictionary_key_size_threshold {#output_format_orc_dictionary_key_size_threshold}   

<SettingsInfoBlock type="Double" default_value="0" />

Для строкового столбца в формате вывода ORC, если количество различных значений превышает эту долю от общего числа строк с ненулевыми значениями, кодирование с использованием словаря отключается. В противном случае кодирование с использованием словаря включено.

## output_format_orc_row_index_stride {#output_format_orc_row_index_stride}   

<SettingsInfoBlock type="UInt64" default_value="10000" />

Целевой шаг индексации строк в выходном формате ORC

## output_format_orc_string_as_string {#output_format_orc_string_as_string}   

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать тип данных ORC String вместо Binary для столбцов String

## output_format_orc_writer_time_zone_name {#output_format_orc_writer_time_zone_name}   

<SettingsInfoBlock type="String" default_value="GMT" />

Имя часового пояса для модуля записи ORC; по умолчанию используется часовой пояс GMT.

## output_format_parquet_batch_size {#output_format_parquet_batch_size}   

<SettingsInfoBlock type="NonZeroUInt64" default_value="1024" />

Проверять размер страницы каждые заданное количество строк. Рекомендуется уменьшить значение, если в таблице есть столбцы со средним размером значения более нескольких КБ.

## output_format_parquet_bloom_filter_bits_per_value {#output_format_parquet_bloom_filter_bits_per_value}   

<SettingsInfoBlock type="Double" default_value="10.5" />

Примерное число бит, используемых для каждого отдельного значения в bloom-фильтрах Parquet. Оценочные вероятности ложных срабатываний:

*  6   бит — 10%
  * 10.5 бит —  1%
  * 16.9 бит —  0.1%
  * 26.4 бит —  0.01%
  * 41   бит —  0.001%

## output_format_parquet_bloom_filter_flush_threshold_bytes {#output_format_parquet_bloom_filter_flush_threshold_bytes}   

<SettingsInfoBlock type="UInt64" default_value="134217728" />

Где в файле Parquet размещать фильтры Блума. Фильтры Блума будут записываться группами примерно такого размера. В частности:

* если значение равно 0, фильтры Блума каждой группы строк записываются сразу после этой группы строк,
  * если значение больше общего размера всех фильтров Блума, фильтры Блума для всех групп строк будут накапливаться в памяти, а затем записаны одним блоком ближе к концу файла,
  * иначе фильтры Блума будут накапливаться в памяти и записываться каждый раз, когда их общий размер превышает это значение.

## output_format_parquet_compliant_nested_types {#output_format_parquet_compliant_nested_types}   

<SettingsInfoBlock type="Bool" default_value="1" />

В схеме parquet-файла использовать имя `element` вместо `item` для элементов списка. Это исторический артефакт реализации библиотеки Arrow. В целом повышает совместимость, за исключением, возможно, некоторых старых версий Arrow.

## output_format_parquet_compression_method {#output_format_parquet_compression_method}   

<SettingsInfoBlock type="ParquetCompression" default_value="zstd" />

Метод сжатия для выходного формата Parquet. Поддерживаемые кодеки: snappy, lz4, brotli, zstd, gzip, none (без сжатия)

## output_format_parquet_data_page_size {#output_format_parquet_data_page_size}   

<SettingsInfoBlock type="UInt64" default_value="1048576" />

Целевой размер страницы данных в байтах до сжатия.

## output_format_parquet_date_as_uint16 {#output_format_parquet_date_as_uint16}   

<SettingsInfoBlock type="Bool" default_value="0" />

Записывает значения типа Date как обычные 16-битные числа (при чтении интерпретируются как UInt16), вместо преобразования в 32-битный тип DATE формата Parquet (при чтении интерпретируются как Date32).

## output_format_parquet_datetime_as_uint32 {#output_format_parquet_datetime_as_uint32}   

<SettingsInfoBlock type="Bool" default_value="0" />

Записывать значения DateTime как непреобразованный UNIX timestamp (при чтении интерпретируется как UInt32), вместо преобразования в миллисекунды (при чтении интерпретируется как DateTime64(3)).

## output_format_parquet_enum_as_byte_array {#output_format_parquet_enum_as_byte_array}   

<SettingsInfoBlock type="Bool" default_value="1" />

Записывать enum, используя физический тип формата Parquet: BYTE_ARRAY и логический тип: ENUM

## output_format_parquet_fixed_string_as_fixed_byte_array {#output_format_parquet_fixed_string_as_fixed_byte_array}   

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать тип Parquet FIXED_LEN_BYTE_ARRAY вместо Binary для столбцов FixedString.

## output_format_parquet_geometadata {#output_format_parquet_geometadata}   

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает записывать информацию о геопространственных столбцах в метаданные формата Parquet и кодировать эти столбцы в формате WKB.

## output_format_parquet_max_dictionary_size {#output_format_parquet_max_dictionary_size}   

<SettingsInfoBlock type="UInt64" default_value="1048576" />

Если размер словаря превышает это значение в байтах, используется кодирование без словаря. Установите 0, чтобы отключить кодирование со словарём.

## output_format_parquet_parallel_encoding {#output_format_parquet_parallel_encoding}   

<SettingsInfoBlock type="Bool" default_value="1" />

Выполнять кодирование Parquet в нескольких потоках. Требует включения параметра output_format_parquet_use_custom_encoder.

## output_format_parquet_row_group_size {#output_format_parquet_row_group_size}   

<SettingsInfoBlock type="UInt64" default_value="1000000" />

Целевой размер группы по числу строк.

## output_format_parquet_row_group_size_bytes {#output_format_parquet_row_group_size_bytes}   

<SettingsInfoBlock type="UInt64" default_value="536870912" />

Целевой размер группы строк в байтах до сжатия.

## output_format_parquet_string_as_string {#output_format_parquet_string_as_string}   

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать тип Parquet String вместо Binary для столбцов String.

## output_format_parquet_use_custom_encoder {#output_format_parquet_use_custom_encoder}   

<SettingsInfoBlock type="Bool" default_value="1" />

Использовать более быструю реализацию кодировщика Parquet.

## output_format_parquet_version {#output_format_parquet_version}   

<SettingsInfoBlock type="ParquetVersion" default_value="2.latest" />

Версия формата Parquet для выходных данных. Поддерживаемые версии: 1.0, 2.4, 2.6 и 2.latest (по умолчанию)

## output_format_parquet_write_bloom_filter {#output_format_parquet_write_bloom_filter}   

<SettingsInfoBlock type="Bool" default_value="1" />

Записывать bloom-фильтры в parquet-файлы. Требуется `output_format_parquet_use_custom_encoder = true`.

## output_format_parquet_write_checksums {#output_format_parquet_write_checksums}   

<SettingsInfoBlock type="Bool" default_value="1" />

Записывать контрольные суммы CRC32 в заголовки страниц формата Parquet.

## output_format_parquet_write_page_index {#output_format_parquet_write_page_index}   

<SettingsInfoBlock type="Bool" default_value="1" />

Записывает индекс столбца и индекс смещений (т. е. статистику по каждой странице данных, которая может использоваться для фильтрации при чтении) в файлы Parquet.

## output_format_pretty_color {#output_format_pretty_color}   

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

Использовать escape-последовательности ANSI в форматах Pretty. 0 — отключено, 1 — включено, `auto` — включено, если вывод идёт в терминал.

## output&#95;format&#95;pretty&#95;display&#95;footer&#95;column&#95;names {#output_format_pretty_display_footer_column_names}

<SettingsInfoBlock type="UInt64" default_value="1" />

Отображает имена столбцов в нижнем колонтитуле, если в таблице много строк.

Возможные значения:

* 0 — Имена столбцов в нижнем колонтитуле не отображаются.
* 1 — Имена столбцов отображаются в нижнем колонтитуле, если количество строк больше либо равно пороговому значению, установленному параметром [output&#95;format&#95;pretty&#95;display&#95;footer&#95;column&#95;names&#95;min&#95;rows](#output_format_pretty_display_footer_column_names_min_rows) (по умолчанию 50).

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

Задает минимальное число строк, начиная с которого будет отображаться нижний колонтитул с именами столбцов, если включен параметр [output_format_pretty_display_footer_column_names](#output_format_pretty_display_footer_column_names).

## output_format_pretty_fallback_to_vertical {#output_format_pretty_fallback_to_vertical}   

<SettingsInfoBlock type="Bool" default_value="1" />

Если параметр включён и таблица широкая, но короткая, формат Pretty выведет её так же, как формат Vertical.
См. `output_format_pretty_fallback_to_vertical_max_rows_per_chunk` и `output_format_pretty_fallback_to_vertical_min_table_width` для более подробной настройки этого поведения.

## output_format_pretty_fallback_to_vertical_max_rows_per_chunk {#output_format_pretty_fallback_to_vertical_max_rows_per_chunk}   

<SettingsInfoBlock type="UInt64" default_value="10" />

Автоматический переход к формату Vertical (см. `output_format_pretty_fallback_to_vertical`) будет выполняться только в том случае, если число строк во фрагменте не превышает указанное значение.

## output_format_pretty_fallback_to_vertical_min_columns {#output_format_pretty_fallback_to_vertical_min_columns}   

<SettingsInfoBlock type="UInt64" default_value="5" />

Переход к формату Vertical (см. `output_format_pretty_fallback_to_vertical`) будет выполняться только в том случае, если число столбцов больше указанного значения.

## output_format_pretty_fallback_to_vertical_min_table_width {#output_format_pretty_fallback_to_vertical_min_table_width}   

<SettingsInfoBlock type="UInt64" default_value="250" />

Переход к формату Vertical (см. `output_format_pretty_fallback_to_vertical`) будет использоваться только в том случае, если суммарная ширина столбцов в таблице не меньше заданного значения или если хотя бы одно значение содержит символ перевода строки.

## output_format_pretty_glue_chunks {#output_format_pretty_glue_chunks}   

<SettingsInfoBlock type="UInt64Auto" default_value="auto" />

Если данные, отображаемые в форматах Pretty, приходят в нескольких фрагментах, даже если с задержкой, но следующий фрагмент имеет те же ширины столбцов, что и предыдущий, используются управляющие последовательности ANSI, чтобы вернуться к предыдущей строке и перезаписать футер предыдущего фрагмента, продолжив его данными нового фрагмента. Это делает результат более визуально приятным.

0 - отключено, 1 - включено, 'auto' - включено, если используется терминал.

## output_format_pretty_grid_charset {#output_format_pretty_grid_charset}   

<SettingsInfoBlock type="String" default_value="UTF-8" />

Набор символов для печати границ таблицы. Доступные наборы символов: ASCII, UTF-8 (значение по умолчанию).

## output_format_pretty_highlight_digit_groups {#output_format_pretty_highlight_digit_groups}   

<SettingsInfoBlock type="Bool" default_value="1" />

Если включено и вывод идет в терминал, каждая цифра в разрядах тысяч, миллионов и т. д. выделяется подчеркиванием.

## output_format_pretty_highlight_trailing_spaces {#output_format_pretty_highlight_trailing_spaces}   

<SettingsInfoBlock type="Bool" default_value="1" />

Если параметр включён и вывод идёт в терминал, подсвечивает завершающие пробелы серым цветом и подчёркивает их.

## output_format_pretty_max_column_name_width_cut_to {#output_format_pretty_max_column_name_width_cut_to}   

<SettingsInfoBlock type="UInt64" default_value="24" />

Если имя столбца слишком длинное, его обрезают до этой длины.
Столбец будет обрезан, если его длина превышает `output_format_pretty_max_column_name_width_cut_to` плюс `output_format_pretty_max_column_name_width_min_chars_to_cut`.

## output_format_pretty_max_column_name_width_min_chars_to_cut {#output_format_pretty_max_column_name_width_min_chars_to_cut}   

<SettingsInfoBlock type="UInt64" default_value="4" />

Минимальное количество символов, на которое сокращается имя столбца, если оно слишком длинное.
Столбец будет обрезан, если его длина превышает сумму `output_format_pretty_max_column_name_width_cut_to` и `output_format_pretty_max_column_name_width_min_chars_to_cut`.

## output_format_pretty_max_column_pad_width {#output_format_pretty_max_column_pad_width}   

<SettingsInfoBlock type="UInt64" default_value="250" />

Максимальная ширина, до которой дополняются значения в столбце в форматах Pretty.

## output_format_pretty_max_rows {#output_format_pretty_max_rows}   

<SettingsInfoBlock type="UInt64" default_value="1000" />

Максимальное количество строк для форматов Pretty.

## output_format_pretty_max_value_width {#output_format_pretty_max_value_width}   

<SettingsInfoBlock type="UInt64" default_value="10000" />

Максимальная ширина значения для отображения в форматах Pretty. Если значение больше, оно будет обрезано.
Значение 0 означает, что значение никогда не обрезается.

## output_format_pretty_max_value_width_apply_for_single_value {#output_format_pretty_max_value_width_apply_for_single_value}   

<SettingsInfoBlock type="UInt64" default_value="0" />

Обрезать значения (см. настройку `output_format_pretty_max_value_width`) только в том случае, когда значение не единственное в блоке. Если значение в блоке одно, выводить его полностью, что полезно для запроса `SHOW CREATE TABLE`.

## output_format_pretty_multiline_fields {#output_format_pretty_multiline_fields}   

<SettingsInfoBlock type="Bool" default_value="1" />

Если включено, форматы Pretty будут отображать многострочные поля в пределах одной ячейки таблицы, так что границы таблицы будут сохранены.
Если выключено, многострочные значения будут отображаться как есть, что потенциально может деформировать таблицу (одно из преимуществ отключения — более простое копирование и вставка многострочных значений).

## output_format_pretty_named_tuples_as_json {#output_format_pretty_named_tuples_as_json}   

<SettingsInfoBlock type="Bool" default_value="1" />

Определяет, будут ли именованные кортежи в формате Pretty выводиться как красиво отформатированные объекты JSON.

## output_format_pretty_row_numbers {#output_format_pretty_row_numbers}   

<SettingsInfoBlock type="Bool" default_value="1" />

Добавляет номера строк перед каждой строкой для формата вывода Pretty

## output_format_pretty_single_large_number_tip_threshold {#output_format_pretty_single_large_number_tip_threshold}   

<SettingsInfoBlock type="UInt64" default_value="1000000" />

Печатает подсказку с числом в удобочитаемом виде в правой части таблицы, если блок состоит из одного числа, которое превышает это значение (за исключением 0)

## output_format_pretty_squash_consecutive_ms {#output_format_pretty_squash_consecutive_ms}   

<SettingsInfoBlock type="UInt64" default_value="50" />

Ожидать следующий блок в течение указанного числа миллисекунд и объединять его с предыдущим перед выводом.
Это позволяет избежать частого вывода слишком маленьких блоков, но при этом по-прежнему отображать данные в потоковом режиме.

## output_format_pretty_squash_max_wait_ms {#output_format_pretty_squash_max_wait_ms}   

<SettingsInfoBlock type="UInt64" default_value="1000" />

Выводить накопленный блок в форматах Pretty, если с момента предыдущего вывода прошло больше указанного количества миллисекунд.

## output_format_protobuf_nullables_with_google_wrappers {#output_format_protobuf_nullables_with_google_wrappers}   

<SettingsInfoBlock type="Bool" default_value="0" />

При сериализации столбцов типа Nullable с использованием Google wrappers значения по умолчанию сериализуются как пустые обёртки. Если параметр отключён, значения по умолчанию и NULL не сериализуются.

## output_format_schema {#output_format_schema}   

Путь к файлу, в который будет сохранена автоматически сгенерированная схема в формате [Cap'n Proto](/interfaces/formats/CapnProto) или [Protobuf](/interfaces/formats/Protobuf).

## output_format_sql_insert_include_column_names {#output_format_sql_insert_include_column_names}   

<SettingsInfoBlock type="Bool" default_value="1" />

Включать имена столбцов в запрос INSERT

## output_format_sql_insert_max_batch_size {#output_format_sql_insert_max_batch_size}   

<SettingsInfoBlock type="UInt64" default_value="65409" />

Максимальное количество строк в одном операторе INSERT.

## output_format_sql_insert_quote_names {#output_format_sql_insert_quote_names}   

<SettingsInfoBlock type="Bool" default_value="1" />

Заключать имена столбцов в символы '`'

## output_format_sql_insert_table_name {#output_format_sql_insert_table_name}   

<SettingsInfoBlock type="String" default_value="table" />

Имя таблицы в результирующем запросе INSERT

## output_format_sql_insert_use_replace {#output_format_sql_insert_use_replace}   

<SettingsInfoBlock type="Bool" default_value="0" />

Использовать оператор REPLACE вместо INSERT.

## output_format_tsv_crlf_end_of_line {#output_format_tsv_crlf_end_of_line}   

<SettingsInfoBlock type="Bool" default_value="0" />

Если установлено значение true, в формате TSV в качестве конца строки будет использоваться \\r\\n вместо \\n.

## output_format_values_escape_quote_with_quote {#output_format_values_escape_quote_with_quote}   

<SettingsInfoBlock type="Bool" default_value="0" />

Если значение `true`, экранирует `'` как `''`, иначе — с помощью `\\'`.

## output_format_write_statistics {#output_format_write_statistics}   

<SettingsInfoBlock type="Bool" default_value="1" />

Записывать статистику о прочитанных строках и байтах, а также о затраченном времени в подходящих форматах вывода.

По умолчанию включено

## precise_float_parsing {#precise_float_parsing}   

<SettingsInfoBlock type="Bool" default_value="0" />

Использовать более точный (но более медленный) алгоритм разбора чисел с плавающей запятой

## regexp_dict_allow_hyperscan {#regexp_dict_allow_hyperscan}   

<SettingsInfoBlock type="Bool" default_value="1" />

Разрешает словарю regexp_tree использовать библиотеку Hyperscan.

## regexp_dict_flag_case_insensitive {#regexp_dict_flag_case_insensitive}   

<SettingsInfoBlock type="Bool" default_value="0" />

Использовать сопоставление без учета регистра для словаря regexp_tree. Может быть переопределено в отдельных выражениях с помощью (?i) и (?-i).

## regexp_dict_flag_dotall {#regexp_dict_flag_dotall}   

<SettingsInfoBlock type="Bool" default_value="0" />

Разрешает символу «.» соответствовать символам перевода строки в словаре regexp_tree.

## rows_before_aggregation {#rows_before_aggregation}   

<SettingsInfoBlock type="Bool" default_value="0" />

Если параметр включён, ClickHouse будет предоставлять точное значение статистики rows_before_aggregation — количества строк, прочитанных до выполнения агрегации.

## schema&#95;inference&#95;hints {#schema_inference_hints}

Список имён столбцов и их типов, используемых в качестве подсказок при выводе схемы для форматов без схемы.

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
Если `schema_inference_hints` задан некорректно (неверный формат, опечатка, неправильный тип данных и т. п.), весь `schema_inference_hints` будет проигнорирован.
:::


## schema_inference_make_columns_nullable {#schema_inference_make_columns_nullable}   

<SettingsInfoBlock type="UInt64Auto" default_value="3" />

Определяет, будут ли выводимые типы делаться `Nullable` при выводе схемы.
Возможные значения:

* 0 — выводимый тип никогда не будет `Nullable` (используйте input_format_null_as_default, чтобы управлять обработкой значений `NULL` в этом случае),
 * 1 — все выводимые типы будут `Nullable`,
 * 2 или `auto` — выводимый тип будет `Nullable` только если столбец содержит `NULL` в выборке, разобранной при выводе схемы, или метаданные файла содержат информацию о Nullable-статусе столбца,
 * 3 — Nullable-статус выводимого типа будет соответствовать метаданным файла, если формат их содержит (например, Parquet), в противном случае тип всегда будет Nullable (например, CSV).

## schema_inference_make_json_columns_nullable {#schema_inference_make_json_columns_nullable}   

<SettingsInfoBlock type="Bool" default_value="0" />

Определяет, будут ли выводимые JSON-типы делаться `Nullable` при выводе схемы.
Если этот параметр включён одновременно с schema_inference_make_columns_nullable, выводимый JSON-тип будет `Nullable`.

## schema_inference_mode {#schema_inference_mode}   

<SettingsInfoBlock type="SchemaInferenceMode" default_value="default" />

Режим определения схемы. `default` — предполагается, что все файлы имеют одинаковую схему, и схему можно определить по любому файлу; `union` — файлы могут иметь разные схемы, и результирующая схема должна быть объединением схем всех файлов.

## show_create_query_identifier_quoting_rule {#show_create_query_identifier_quoting_rule}   

<SettingsInfoBlock type="IdentifierQuotingRule" default_value="when_necessary" />

Определяет правило заключения идентификаторов в кавычки в запросе SHOW CREATE

## show_create_query_identifier_quoting_style {#show_create_query_identifier_quoting_style}   

<SettingsInfoBlock type="IdentifierQuotingStyle" default_value="Backticks" />

Определяет стиль кавычек для идентификаторов в запросе SHOW CREATE

## type_json_skip_duplicated_paths {#type_json_skip_duplicated_paths}   

<SettingsInfoBlock type="Bool" default_value="0" />

Когда параметр включён, при разборе JSON-объекта в тип JSON дублирующиеся пути будут игнорироваться, и будет вставлен только первый путь вместо генерации исключения.

## type_json_skip_invalid_typed_paths {#type_json_skip_invalid_typed_paths}   

<SettingsInfoBlock type="Bool" default_value="0" />

Если параметр включен, поля со значениями, которые не могут быть приведены к объявленному типу в столбцах типа JSON с типизированными путями, пропускаются вместо выброса ошибки. Пропущенные поля рассматриваются как отсутствующие и будут использовать значения по умолчанию или NULL в соответствии с определением типизированного пути.

Этот параметр применяется только к столбцам типа JSON (например, JSON(a Int64, b String)), в которых для конкретных путей объявлены типы. Он не применяется к обычным форматам ввода JSON, таким как JSONEachRow, при вставке в обычные типизированные столбцы.

Возможные значения:

+ 0 — Отключить (выдавать ошибку при несоответствии типов).
+ 1 — Включить (пропускать поле при несоответствии типов).

## validate_experimental_and_suspicious_types_inside_nested_types {#validate_experimental_and_suspicious_types_inside_nested_types}   

<SettingsInfoBlock type="Bool" default_value="1" />

Проверять использование экспериментальных и подозрительных типов внутри вложенных типов, например Array/Map/Tuple