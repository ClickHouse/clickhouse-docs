---
title: "Настройки форматов"
sidebar_label: "Настройки форматов"
slug: /operations/settings/formats
toc_max_heading_level: 2
description: "Настройки, которые управляют форматами ввода и вывода."
doc_type: "reference"
---

import ExperimentalBadge from "@theme/badges/ExperimentalBadge"
import BetaBadge from "@theme/badges/BetaBadge"
import SettingsInfoBlock from "@theme/SettingsInfoBlock/SettingsInfoBlock"
import VersionHistory from "@theme/VersionHistory/VersionHistory"

<!-- Автоматически сгенерировано -->

Эти настройки автоматически генерируются из [исходного кода](https://github.com/ClickHouse/ClickHouse/blob/master/src/Core/FormatFactorySettings.h).


## allow_special_bool_values_inside_variant {#allow_special_bool_values_inside_variant}

<SettingsInfoBlock type='Bool' default_value='0' />

Позволяет разбирать значения Bool внутри типа Variant из специальных текстовых булевых значений, таких как "on", "off", "enable", "disable" и т. д.


## bool_false_representation {#bool_false_representation}

<SettingsInfoBlock type='String' default_value='false' />

Текст для представления логического значения false в форматах TSV/CSV/Vertical/Pretty.


## bool_true_representation {#bool_true_representation}

<SettingsInfoBlock type='String' default_value='true' />

Текст для представления истинного булева значения в форматах TSV/CSV/Vertical/Pretty.


## column_names_for_schema_inference {#column_names_for_schema_inference}

Список имён столбцов, используемых при автоматическом определении схемы для форматов без имён столбцов. Формат: 'column1,column2,column3,...'


## cross_to_inner_join_rewrite {#cross_to_inner_join_rewrite}

<SettingsInfoBlock type='UInt64' default_value='1' />

Использовать INNER JOIN вместо COMMA/CROSS JOIN, если в секции WHERE присутствуют выражения для соединения. Значения: 0 — не переписывать, 1 — применять при возможности для COMMA/CROSS, 2 — принудительно переписывать все COMMA JOIN, CROSS — при возможности


## date_time_64_output_format_cut_trailing_zeros_align_to_groups_of_thousands {#date_time_64_output_format_cut_trailing_zeros_align_to_groups_of_thousands}

<SettingsInfoBlock type='Bool' default_value='0' />

Динамически обрезает конечные нули значений datetime64 для приведения выходного масштаба к [0, 3, 6],
что соответствует 'секундам', 'миллисекундам' и 'микросекундам'


## date_time_input_format {#date_time_input_format}

<SettingsInfoBlock type='DateTimeInputFormat' default_value='basic' />

Позволяет выбрать парсер для текстового представления даты и времени.

Настройка не применяется к [функциям для работы с датами и временем](../../sql-reference/functions/date-time-functions.md).

Возможные значения:

- `'best_effort'` — Включает расширенный парсинг.

  ClickHouse может распознавать базовый формат `YYYY-MM-DD HH:MM:SS` и все форматы даты и времени [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601). Например, `'2018-06-08T01:02:03.000Z'`.

- `'best_effort_us'` — Аналогично `best_effort` (различия см. в описании [parseDateTimeBestEffortUS](../../sql-reference/functions/type-conversion-functions#parsedatetimebesteffortus)).

- `'basic'` — Использовать базовый парсер.

  ClickHouse может распознавать только базовый формат `YYYY-MM-DD HH:MM:SS` или `YYYY-MM-DD`. Например, `2019-08-20 10:18:56` или `2019-08-20`.

Значение по умолчанию в Cloud: `'best_effort'`.

См. также:

- [Тип данных DateTime.](../../sql-reference/data-types/datetime.md)
- [Функции для работы с датами и временем.](../../sql-reference/functions/date-time-functions.md)


## date_time_output_format {#date_time_output_format}

<SettingsInfoBlock type='DateTimeOutputFormat' default_value='simple' />

Позволяет выбирать различные форматы вывода текстового представления даты и времени.

Возможные значения:

- `simple` — простой формат вывода.

  ClickHouse выводит дату и время в формате `YYYY-MM-DD hh:mm:ss`. Например, `2019-08-20 10:18:56`. Вычисление выполняется в соответствии с часовым поясом типа данных (если он указан) или часовым поясом сервера.

- `iso` — формат вывода ISO.

  ClickHouse выводит дату и время в формате [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) `YYYY-MM-DDThh:mm:ssZ`. Например, `2019-08-20T10:18:56Z`. Обратите внимание, что вывод осуществляется в UTC (символ `Z` означает UTC).

- `unix_timestamp` — формат вывода Unix timestamp.

  ClickHouse выводит дату и время в формате [Unix timestamp](https://en.wikipedia.org/wiki/Unix_time). Например, `1566285536`.

См. также:

- [Тип данных DateTime.](../../sql-reference/data-types/datetime.md)
- [Функции для работы с датами и временем.](../../sql-reference/functions/date-time-functions.md)


## date_time_overflow_behavior {#date_time_overflow_behavior}

<SettingsInfoBlock type='DateTimeOverflowBehavior' default_value='ignore' />

Определяет поведение при преобразовании типов [Date](../../sql-reference/data-types/date.md), [Date32](../../sql-reference/data-types/date32.md), [DateTime](../../sql-reference/data-types/datetime.md), [DateTime64](../../sql-reference/data-types/datetime64.md) или целых чисел в Date, Date32, DateTime или DateTime64, когда значение не может быть представлено в результирующем типе.

Возможные значения:

- `ignore` — Игнорировать переполнения без предупреждений. Результат не определён.
- `throw` — Генерировать исключение в случае переполнения.
- `saturate` — Ограничить результат допустимым диапазоном. Если значение меньше минимального значения, которое может быть представлено целевым типом, результатом становится минимальное представимое значение. Если значение больше максимального значения, которое может быть представлено целевым типом, результатом становится максимальное представимое значение.

Значение по умолчанию: `ignore`.


## dictionary_use_async_executor {#dictionary_use_async_executor}

<SettingsInfoBlock type='Bool' default_value='0' />

Выполнять конвейер для чтения источника словаря в нескольких потоках. Поддерживается только для словарей с локальным источником CLICKHOUSE.


## errors_output_format {#errors_output_format}

<SettingsInfoBlock type='String' default_value='CSV' />

Метод записи ошибок в текстовый вывод.


## exact_rows_before_limit {#exact_rows_before_limit}

<SettingsInfoBlock type='Bool' default_value='0' />

При включении ClickHouse будет предоставлять точное значение для статистики rows_before_limit_at_least, но ценой этого будет полное чтение данных до применения LIMIT


## format_avro_schema_registry_url {#format_avro_schema_registry_url}

Для формата AvroConfluent: URL Confluent Schema Registry.


## format_binary_max_array_size {#format_binary_max_array_size}

<SettingsInfoBlock type='UInt64' default_value='1073741824' />

Максимально допустимый размер массива (Array) в формате RowBinary. Предотвращает выделение большого объёма памяти при повреждении данных. Значение 0 означает отсутствие ограничения


## format_binary_max_string_size {#format_binary_max_string_size}

<SettingsInfoBlock type='UInt64' default_value='1073741824' />

Максимально допустимый размер для String в формате RowBinary. Предотвращает выделение большого объёма памяти в случае повреждённых данных. Значение 0 означает отсутствие ограничения


## format_capn_proto_enum_comparising_mode {#format_capn_proto_enum_comparising_mode}

<SettingsInfoBlock
  type='CapnProtoEnumComparingMode'
  default_value='by_values'
/>

Способ сопоставления типов Enum в ClickHouse и CapnProto


## format_capn_proto_use_autogenerated_schema {#format_capn_proto_use_autogenerated_schema}

<SettingsInfoBlock type='Bool' default_value='1' />

Использовать автоматически сгенерированную схему CapnProto, когда параметр format_schema не установлен


## format_csv_allow_double_quotes {#format_csv_allow_double_quotes}

<SettingsInfoBlock type='Bool' default_value='1' />

Если установлено значение true, разрешает использование строк в двойных кавычках.


## format_csv_allow_single_quotes {#format_csv_allow_single_quotes}

<SettingsInfoBlock type='Bool' default_value='0' />

Если установлено в true, разрешает строки в одинарных кавычках.


## format_csv_delimiter {#format_csv_delimiter}

<SettingsInfoBlock type='Char' default_value=',' />

Символ, используемый в качестве разделителя в CSV-данных. При задании строкового значения длина строки должна составлять 1 символ.


## format_csv_null_representation {#format_csv_null_representation}

<SettingsInfoBlock type='String' default_value='\N' />

Пользовательское представление NULL в формате CSV


## format_custom_escaping_rule {#format_custom_escaping_rule}

<SettingsInfoBlock type='EscapingRule' default_value='Escaped' />

Правило экранирования полей (для формата CustomSeparated)


## format_custom_field_delimiter {#format_custom_field_delimiter}

<SettingsInfoBlock type='String' default_value='	' />

Разделитель между полями (для формата CustomSeparated)


## format_custom_result_after_delimiter {#format_custom_result_after_delimiter}

Суффикс после набора результатов (для формата CustomSeparated)


## format_custom_result_before_delimiter {#format_custom_result_before_delimiter}

Префикс перед результирующим набором данных (для формата CustomSeparated)


## format_custom_row_after_delimiter {#format_custom_row_after_delimiter}

<SettingsInfoBlock
  type='String'
  default_value='
'
/>

Разделитель после поля последнего столбца (для формата CustomSeparated)


## format_custom_row_before_delimiter {#format_custom_row_before_delimiter}

Разделитель перед полем первого столбца (для формата CustomSeparated)


## format_custom_row_between_delimiter {#format_custom_row_between_delimiter}

Разделитель между строками (для формата CustomSeparated)


## format_display_secrets_in_show_and_select {#format_display_secrets_in_show_and_select}

<SettingsInfoBlock type='Bool' default_value='0' />

Включает или отключает отображение секретов в запросах `SHOW` и `SELECT` для таблиц, баз данных,
табличных функций и словарей.

Пользователь, который хочет видеть секреты, также должен иметь
включенную [серверную настройку `display_secrets_in_show_and_select`](../server-configuration-parameters/settings#display_secrets_in_show_and_select)
и
привилегию [`displaySecretsInShowAndSelect`](/sql-reference/statements/grant#displaysecretsinshowandselect).

Возможные значения:

- 0 — Отключено.
- 1 — Включено.


## format_json_object_each_row_column_for_object_name {#format_json_object_each_row_column_for_object_name}

Имя столбца, который будет использоваться для сохранения/записи имён объектов в формате [JSONObjectEachRow](/interfaces/formats/JSONObjectEachRow).
Тип столбца должен быть String. Если значение не задано, для имён объектов будут использоваться имена по умолчанию `row_{i}`.


## format_protobuf_use_autogenerated_schema {#format_protobuf_use_autogenerated_schema}

<SettingsInfoBlock type='Bool' default_value='1' />

Использовать автоматически сгенерированную схему Protobuf, если format_schema не задана


## format_regexp {#format_regexp}

Регулярное выражение (для формата Regexp)


## format_regexp_escaping_rule {#format_regexp_escaping_rule}

<SettingsInfoBlock type='EscapingRule' default_value='Raw' />

Правило экранирования полей (для формата Regexp)


## format_regexp_skip_unmatched {#format_regexp_skip_unmatched}

<SettingsInfoBlock type='Bool' default_value='0' />

Пропускать строки, не соответствующие регулярному выражению (для формата Regexp)


## format_schema {#format_schema}

Этот параметр используется при работе с форматами, которые требуют определения схемы, например [Cap'n Proto](https://capnproto.org/) или [Protobuf](https://developers.google.com/protocol-buffers/). Значение параметра зависит от формата.


## format_schema_message_name {#format_schema_message_name}

Определяет имя требуемого сообщения в схеме, определённой в `format_schema`.
Для обеспечения совместимости с устаревшим форматом format_schema (`file_name:message_name`):

- Если `format_schema_message_name` не указан, имя сообщения определяется из части `message_name` устаревшего значения `format_schema`.
- Если `format_schema_message_name` указан при использовании устаревшего формата, будет возвращена ошибка.


## format_schema_source {#format_schema_source}

<SettingsInfoBlock type='String' default_value='file' />

Определяет источник `format_schema`.
Возможные значения:

- 'file' (по умолчанию): `format_schema` — это имя файла схемы, расположенного в директории `format_schemas`.
- 'string': `format_schema` — это непосредственное содержимое схемы.
- 'query': `format_schema` — это запрос для получения схемы.
  Когда `format_schema_source` установлен в 'query', применяются следующие условия:
- Запрос должен возвращать ровно одно значение: одну строку с одним столбцом типа string.
- Результат запроса интерпретируется как содержимое схемы.
- Этот результат кэшируется локально в директории `format_schemas`.
- Локальный кэш можно очистить с помощью команды: `SYSTEM DROP FORMAT SCHEMA CACHE FOR Files`.
- После кэширования идентичные запросы не выполняются для повторного получения схемы до тех пор, пока кэш не будет явно очищен.
- Помимо локальных файлов кэша, сообщения Protobuf также кэшируются в памяти. Даже после очистки локальных файлов кэша необходимо очистить кэш в памяти с помощью команды `SYSTEM DROP FORMAT SCHEMA CACHE [FOR Protobuf]` для полного обновления схемы.
- Выполните запрос `SYSTEM DROP FORMAT SCHEMA CACHE` для одновременной очистки кэша как файлов, так и схем сообщений Protobuf.


## format_template_resultset {#format_template_resultset}

Путь к файлу, содержащему строку формата для результирующего набора (для формата Template)


## format_template_resultset_format {#format_template_resultset_format}

Строка формата для результирующего набора данных (для формата Template)


## format_template_row {#format_template_row}

Путь к файлу, который содержит строку форматирования для строк (для формата Template)


## format_template_row_format {#format_template_row_format}

Строка формата для строк (для формата Template)


## format_template_rows_between_delimiter {#format_template_rows_between_delimiter}

<SettingsInfoBlock
  type='String'
  default_value='
'
/>

Разделитель между строками (для формата Template)


## format_tsv_null_representation {#format_tsv_null_representation}

<SettingsInfoBlock type='String' default_value='\N' />

Пользовательское представление NULL в формате TSV


## input_format_allow_errors_num {#input_format_allow_errors_num}

<SettingsInfoBlock type='UInt64' default_value='0' />

Задаёт максимальное количество допустимых ошибок при чтении из текстовых форматов (CSV, TSV и т. д.).

Значение по умолчанию — 0.

Всегда используйте эту настройку совместно с `input_format_allow_errors_ratio`.

Если при чтении строк возникла ошибка, но счётчик ошибок всё ещё меньше `input_format_allow_errors_num`, ClickHouse игнорирует эту строку и переходит к следующей.

Если превышены оба параметра `input_format_allow_errors_num` и `input_format_allow_errors_ratio`, ClickHouse генерирует исключение.


## input_format_allow_errors_ratio {#input_format_allow_errors_ratio}

<SettingsInfoBlock type='Float' default_value='0' />

Устанавливает максимальный процент допустимых ошибок при чтении текстовых форматов (CSV, TSV и т. д.).
Процент ошибок задается в виде числа с плавающей точкой в диапазоне от 0 до 1.

Значение по умолчанию: 0.

Всегда используйте эту настройку совместно с `input_format_allow_errors_num`.

Если при чтении строк возникла ошибка, но счетчик ошибок все еще меньше `input_format_allow_errors_ratio`, ClickHouse игнорирует эту строку и переходит к следующей.

Если превышены оба параметра — `input_format_allow_errors_num` и `input_format_allow_errors_ratio`, ClickHouse генерирует исключение.


## input_format_allow_seeks {#input_format_allow_seeks}

<SettingsInfoBlock type='Bool' default_value='1' />

Разрешает операции позиционирования (seeks) при чтении данных в форматах ORC/Parquet/Arrow.

Включено по умолчанию.


## input_format_arrow_allow_missing_columns {#input_format_arrow_allow_missing_columns}

<SettingsInfoBlock type='Bool' default_value='1' />

Разрешает отсутствие столбцов при чтении входных форматов Arrow


## input_format_arrow_case_insensitive_column_matching {#input_format_arrow_case_insensitive_column_matching}

<SettingsInfoBlock type='Bool' default_value='0' />

Игнорировать регистр символов при сопоставлении столбцов Arrow со столбцами ClickHouse.


## input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference {#input_format_arrow_skip_columns_with_unsupported_types_in_schema_inference}

<SettingsInfoBlock type='Bool' default_value='0' />

Пропускать столбцы с неподдерживаемыми типами данных при автоматическом определении схемы для формата Arrow


## input_format_avro_allow_missing_fields {#input_format_avro_allow_missing_fields}

<SettingsInfoBlock type='Bool' default_value='0' />

Для форматов Avro/AvroConfluent: если поле не найдено в схеме, использовать значение по умолчанию вместо возврата ошибки


## input_format_avro_null_as_default {#input_format_avro_null_as_default}

<SettingsInfoBlock type='Bool' default_value='0' />

Для форматов Avro/AvroConfluent: вставлять значение по умолчанию при null и не-Nullable столбце


## input_format_binary_decode_types_in_binary_format {#input_format_binary_decode_types_in_binary_format}

<SettingsInfoBlock type='Bool' default_value='0' />

Читать типы данных в двоичном формате вместо имён типов во входном формате RowBinaryWithNamesAndTypes


## input_format_binary_read_json_as_string {#input_format_binary_read_json_as_string}

<SettingsInfoBlock type='Bool' default_value='0' />

Читать значения типа данных [JSON](../../sql-reference/data-types/newjson.md) как значения [String](../../sql-reference/data-types/string.md) в формате JSON во входном формате RowBinary.


## input_format_bson_skip_fields_with_unsupported_types_in_schema_inference {#input_format_bson_skip_fields_with_unsupported_types_in_schema_inference}

<SettingsInfoBlock type='Bool' default_value='0' />

Пропускать поля с неподдерживаемыми типами при автоматическом определении схемы для формата BSON.


## input_format_capn_proto_skip_fields_with_unsupported_types_in_schema_inference {#input_format_capn_proto_skip_fields_with_unsupported_types_in_schema_inference}

<SettingsInfoBlock type='Bool' default_value='0' />

Пропускать столбцы с неподдерживаемыми типами при выводе схемы для формата CapnProto


## input_format_csv_allow_cr_end_of_line {#input_format_csv_allow_cr_end_of_line}

<SettingsInfoBlock type='Bool' default_value='0' />

Если установлено значение true, символ \\r будет допускаться в конце строки, если за ним не следует


## input_format_csv_allow_variable_number_of_columns {#input_format_csv_allow_variable_number_of_columns}

<SettingsInfoBlock type='Bool' default_value='0' />

Игнорировать лишние столбцы во входных CSV-данных (если файл содержит больше столбцов, чем ожидается) и обрабатывать отсутствующие поля во входных CSV-данных как значения по умолчанию


## input_format_csv_allow_whitespace_or_tab_as_delimiter {#input_format_csv_allow_whitespace_or_tab_as_delimiter}

<SettingsInfoBlock type='Bool' default_value='0' />

Разрешает использование пробелов и табуляций (\\t) в качестве разделителей полей в CSV-строках


## input_format_csv_arrays_as_nested_csv {#input_format_csv_arrays_as_nested_csv}

<SettingsInfoBlock type='Bool' default_value='0' />

При чтении массива из CSV предполагается, что его элементы были сериализованы во вложенном формате CSV и затем помещены в строку. Пример: \"[\"\"Hello\"\", \"\"world\"\", \"\"42\"\"\"\" TV\"\"]\". Квадратные скобки вокруг массива могут быть опущены.


## input_format_csv_deserialize_separate_columns_into_tuple {#input_format_csv_deserialize_separate_columns_into_tuple}

<SettingsInfoBlock type='Bool' default_value='1' />

Если установлено значение true, отдельные столбцы в формате CSV могут быть десериализованы в столбец типа Tuple.


## input_format_csv_detect_header {#input_format_csv_detect_header}

<SettingsInfoBlock type='Bool' default_value='1' />

Автоматически определять заголовок с именами и типами в формате CSV


## input_format_csv_empty_as_default {#input_format_csv_empty_as_default}

<SettingsInfoBlock type='Bool' default_value='1' />

Обрабатывать пустые поля во входных CSV-данных как значения по умолчанию.


## input_format_csv_enum_as_number {#input_format_csv_enum_as_number}

<SettingsInfoBlock type='Bool' default_value='0' />

Обрабатывать вставляемые значения перечислений в форматах CSV как индексы перечислений


## input_format_csv_skip_first_lines {#input_format_csv_skip_first_lines}

<SettingsInfoBlock type='UInt64' default_value='0' />

Пропускает указанное количество строк в начале данных в формате CSV


## input_format_csv_skip_trailing_empty_lines {#input_format_csv_skip_trailing_empty_lines}

<SettingsInfoBlock type='Bool' default_value='0' />

Пропускать конечные пустые строки в формате CSV


## input_format_csv_trim_whitespaces {#input_format_csv_trim_whitespaces}

<SettingsInfoBlock type='Bool' default_value='1' />

Удаляет пробелы и символы табуляции (\\t) в начале и в конце строк CSV


## input_format_csv_try_infer_numbers_from_strings {#input_format_csv_try_infer_numbers_from_strings}

<SettingsInfoBlock type='Bool' default_value='0' />

Если включено, при автоматическом определении схемы ClickHouse будет пытаться распознать числа в строковых полях.
Это может быть полезно, если CSV-данные содержат числа UInt64, заключённые в кавычки.

По умолчанию отключено.


## input_format_csv_try_infer_strings_from_quoted_tuples {#input_format_csv_try_infer_strings_from_quoted_tuples}

<SettingsInfoBlock type='Bool' default_value='1' />

Интерпретировать кортежи в кавычках во входных данных как значения типа String.


## input_format_csv_use_best_effort_in_schema_inference {#input_format_csv_use_best_effort_in_schema_inference}

<SettingsInfoBlock type='Bool' default_value='1' />

Использовать дополнительные настройки и эвристики для вывода схемы в формате CSV


## input_format_csv_use_default_on_bad_values {#input_format_csv_use_default_on_bad_values}

<SettingsInfoBlock type='Bool' default_value='0' />

Позволяет устанавливать значение по умолчанию для столбца при ошибке десериализации поля CSV из-за некорректного значения


## input_format_custom_allow_variable_number_of_columns {#input_format_custom_allow_variable_number_of_columns}

<SettingsInfoBlock type='Bool' default_value='0' />

Игнорировать дополнительные столбцы во входных данных формата CustomSeparated (если файл содержит больше столбцов, чем ожидается) и обрабатывать отсутствующие поля во входных данных формата CustomSeparated как значения по умолчанию


## input_format_custom_detect_header {#input_format_custom_detect_header}

<SettingsInfoBlock type='Bool' default_value='1' />

Автоматически определять заголовок с именами и типами в формате CustomSeparated


## input_format_custom_skip_trailing_empty_lines {#input_format_custom_skip_trailing_empty_lines}

<SettingsInfoBlock type='Bool' default_value='0' />

Пропускать конечные пустые строки в формате CustomSeparated


## input_format_defaults_for_omitted_fields {#input_format_defaults_for_omitted_fields}

<SettingsInfoBlock type='Bool' default_value='1' />

При выполнении запросов `INSERT` заменяет пропущенные значения входных столбцов значениями по умолчанию соответствующих столбцов. Эта настройка применяется к форматам [JSONEachRow](/interfaces/formats/JSONEachRow) (и другим форматам JSON), [CSV](/interfaces/formats/CSV), [TabSeparated](/interfaces/formats/TabSeparated), [TSKV](/interfaces/formats/TSKV), [Parquet](/interfaces/formats/Parquet), [Arrow](/interfaces/formats/Arrow), [Avro](/interfaces/formats/Avro), [ORC](/interfaces/formats/ORC), [Native](/interfaces/formats/Native), а также к форматам с суффиксами `WithNames`/`WithNamesAndTypes`.

:::note
Когда эта настройка включена, расширенные метаданные таблицы передаются с сервера клиенту. Это потребляет дополнительные вычислительные ресурсы на сервере и может снизить производительность.
:::

Возможные значения:

- 0 — отключено.
- 1 — включено.


## input_format_force_null_for_omitted_fields {#input_format_force_null_for_omitted_fields}

<SettingsInfoBlock type='Bool' default_value='0' />

Принудительно инициализировать отсутствующие поля значениями null


## input_format_hive_text_allow_variable_number_of_columns {#input_format_hive_text_allow_variable_number_of_columns}

<SettingsInfoBlock type='Bool' default_value='1' />

Игнорировать дополнительные столбцы во входных данных формата Hive Text (если файл содержит больше столбцов, чем ожидается) и обрабатывать отсутствующие поля как значения по умолчанию


## input_format_hive_text_collection_items_delimiter {#input_format_hive_text_collection_items_delimiter}

<SettingsInfoBlock type='Char' default_value='' />

Разделитель между элементами коллекции (массив или map) в текстовом файле Hive


## input_format_hive_text_fields_delimiter {#input_format_hive_text_fields_delimiter}

<SettingsInfoBlock type='Char' default_value='' />

Разделитель между полями в текстовом файле Hive


## input_format_hive_text_map_keys_delimiter {#input_format_hive_text_map_keys_delimiter}

<SettingsInfoBlock type='Char' default_value='' />

Разделитель между парой ключ/значение карты (map) в текстовом файле Hive


## input_format_import_nested_json {#input_format_import_nested_json}

<SettingsInfoBlock type='Bool' default_value='0' />

Включает или отключает вставку JSON-данных с вложенными объектами.

Поддерживаемые форматы:

- [JSONEachRow](/interfaces/formats/JSONEachRow)

Возможные значения:

- 0 — отключено.
- 1 — включено.

См. также:

- [Использование вложенных структур](/integrations/data-formats/json/other-formats#accessing-nested-json-objects) с форматом `JSONEachRow`.


## input_format_ipv4_default_on_conversion_error {#input_format_ipv4_default_on_conversion_error}

<SettingsInfoBlock type='Bool' default_value='0' />

При десериализации IPv4 будут использоваться значения по умолчанию вместо генерации исключения при ошибке преобразования.

Отключено по умолчанию.


## input_format_ipv6_default_on_conversion_error {#input_format_ipv6_default_on_conversion_error}

<SettingsInfoBlock type='Bool' default_value='0' />

При ошибке преобразования десериализация IPv6 будет использовать значения по умолчанию вместо генерации исключения.

Отключено по умолчанию.


## input_format_json_compact_allow_variable_number_of_columns {#input_format_json_compact_allow_variable_number_of_columns}

<SettingsInfoBlock type='Bool' default_value='0' />

Позволяет использовать переменное количество столбцов в строках во входных форматах JSONCompact/JSONCompactEachRow.
Игнорирует лишние столбцы в строках, содержащих больше столбцов, чем ожидается, и обрабатывает отсутствующие столбцы как значения по умолчанию.

Отключено по умолчанию.


## input_format_json_defaults_for_missing_elements_in_named_tuple {#input_format_json_defaults_for_missing_elements_in_named_tuple}

<SettingsInfoBlock type='Bool' default_value='1' />

Вставлять значения по умолчанию для отсутствующих элементов в JSON-объекте при парсинге именованного кортежа.
Эта настройка работает только при включённой настройке `input_format_json_named_tuples_as_objects`.

Включена по умолчанию.


## input_format_json_empty_as_default {#input_format_json_empty_as_default}

<SettingsInfoBlock type='Bool' default_value='0' />

При включении заменяет пустые входные поля в JSON значениями по умолчанию. Для сложных выражений значений по умолчанию также необходимо включить `input_format_defaults_for_omitted_fields`.

Возможные значения:

- 0 — Отключить.
- 1 — Включить.


## input_format_json_ignore_unknown_keys_in_named_tuple {#input_format_json_ignore_unknown_keys_in_named_tuple}

<SettingsInfoBlock type='Bool' default_value='1' />

Игнорировать неизвестные ключи в JSON-объекте для именованных кортежей.

Включена по умолчанию.


## input_format_json_ignore_unnecessary_fields {#input_format_json_ignore_unnecessary_fields}

<SettingsInfoBlock type='Bool' default_value='1' />

Игнорировать лишние поля и не выполнять их разбор. При включении этого параметра исключения могут не выбрасываться для JSON-строк неверного формата или с дублирующимися полями


## input_format_json_infer_array_of_dynamic_from_array_of_different_types {#input_format_json_infer_array_of_dynamic_from_array_of_different_types}

<SettingsInfoBlock type='Bool' default_value='1' />

Если включено, при автоматическом определении схемы ClickHouse будет использовать тип Array(Dynamic) для JSON-массивов со значениями разных типов данных.

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


## input_format_json_infer_incomplete_types_as_strings {#input_format_json_infer_incomplete_types_as_strings}

<SettingsInfoBlock type='Bool' default_value='1' />

Позволяет использовать тип String для ключей JSON, содержащих только `Null`/`{}`/`[]` в образце данных при выводе схемы.
В форматах JSON любое значение может быть прочитано как String, что позволяет избежать ошибок вида `Cannot determine type for column 'column_name' by first 25000 rows of data, most likely this column contains only Nulls or empty Arrays/Maps` при выводе схемы
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


## input_format_json_map_as_array_of_tuples {#input_format_json_map_as_array_of_tuples}

<SettingsInfoBlock type='Bool' default_value='0' />

Десериализует столбцы типа Map как JSON-массивы кортежей.

Отключено по умолчанию.


## input_format_json_max_depth {#input_format_json_max_depth}

<SettingsInfoBlock type='UInt64' default_value='1000' />

Максимальная глубина поля в JSON. Это не строгое ограничение, оно не обязательно должно применяться точно.


## input_format_json_named_tuples_as_objects {#input_format_json_named_tuples_as_objects}

<SettingsInfoBlock type='Bool' default_value='1' />

Парсить столбцы именованных кортежей как JSON-объекты.

Включено по умолчанию.


## input_format_json_read_arrays_as_strings {#input_format_json_read_arrays_as_strings}

<SettingsInfoBlock type='Bool' default_value='1' />

Позволяет обрабатывать JSON-массивы как строки во входных форматах JSON.

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

Включена по умолчанию.


## input_format_json_read_bools_as_numbers {#input_format_json_read_bools_as_numbers}

<SettingsInfoBlock type='Bool' default_value='1' />

Позволяет интерпретировать логические значения как числа во входных форматах JSON.

Включено по умолчанию.


## input_format_json_read_bools_as_strings {#input_format_json_read_bools_as_strings}

<SettingsInfoBlock type='Bool' default_value='1' />

Разрешает парсинг логических значений как строк во входных форматах JSON.

Включено по умолчанию.


## input_format_json_read_numbers_as_strings {#input_format_json_read_numbers_as_strings}

<SettingsInfoBlock type='Bool' default_value='1' />

Разрешает парсинг чисел как строк во входных форматах JSON.

Включено по умолчанию.


## input_format_json_read_objects_as_strings {#input_format_json_read_objects_as_strings}

<SettingsInfoBlock type='Bool' default_value='1' />

Позволяет парсить JSON-объекты как строки во входных форматах JSON.

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

Включено по умолчанию.


## input_format_json_throw_on_bad_escape_sequence {#input_format_json_throw_on_bad_escape_sequence}

<SettingsInfoBlock type='Bool' default_value='1' />

Генерировать исключение, если строка JSON содержит некорректную escape-последовательность во входных форматах JSON. Если параметр отключён, некорректные escape-последовательности сохраняются в данных без изменений.

Включено по умолчанию.


## input_format_json_try_infer_named_tuples_from_objects {#input_format_json_try_infer_named_tuples_from_objects}

<SettingsInfoBlock type='Bool' default_value='1' />

Если включено, при автоматическом определении схемы ClickHouse будет пытаться определить именованный Tuple из JSON-объектов.
Результирующий именованный Tuple будет содержать все элементы из всех соответствующих JSON-объектов в образце данных.

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

<SettingsInfoBlock type='Bool' default_value='0' />

Если параметр включен, при автоматическом определении схемы ClickHouse будет пытаться распознать числа в строковых полях.
Это может быть полезно, если JSON-данные содержат числа типа UInt64 в кавычках.

По умолчанию отключено.


## input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects {#input_format_json_use_string_type_for_ambiguous_paths_in_named_tuples_inference_from_objects}

<SettingsInfoBlock type='Bool' default_value='0' />

Использовать тип String вместо генерации исключения в случае неоднозначных путей в JSON-объектах при автоматическом определении типов именованных кортежей


## input_format_json_validate_types_from_metadata {#input_format_json_validate_types_from_metadata}

<SettingsInfoBlock type='Bool' default_value='1' />

Для входных форматов JSON/JSONCompact/JSONColumnsWithMetadata, если эта настройка установлена в 1,
типы из метаданных во входных данных будут сравниваться с типами соответствующих столбцов из таблицы.

Включена по умолчанию.


## input_format_max_block_size_bytes {#input_format_max_block_size_bytes}

<SettingsInfoBlock type='UInt64' default_value='0' />

Ограничивает размер блоков, формируемых при парсинге данных во входных форматах, в байтах. Используется в построчных входных форматах, когда блок формируется на стороне ClickHouse.
0 означает отсутствие ограничения по размеру в байтах.


## input_format_max_bytes_to_read_for_schema_inference {#input_format_max_bytes_to_read_for_schema_inference}

<SettingsInfoBlock type='UInt64' default_value='33554432' />

Максимальный объём данных в байтах, который читается для автоматического определения схемы.


## input_format_max_rows_to_read_for_schema_inference {#input_format_max_rows_to_read_for_schema_inference}

<SettingsInfoBlock type='UInt64' default_value='25000' />

Максимальное количество строк данных, которые необходимо прочитать для автоматического определения схемы.


## input_format_msgpack_number_of_columns {#input_format_msgpack_number_of_columns}

<SettingsInfoBlock type='UInt64' default_value='0' />

Количество столбцов во вставляемых данных MsgPack. Используется для автоматического вывода схемы из данных.


## input_format_mysql_dump_map_column_names {#input_format_mysql_dump_map_column_names}

<SettingsInfoBlock type='Bool' default_value='1' />

Сопоставлять столбцы таблицы в дампе MySQL со столбцами таблицы ClickHouse по именам


## input_format_mysql_dump_table_name {#input_format_mysql_dump_table_name}

Имя таблицы в дампе MySQL, из которой необходимо прочитать данные


## input_format_native_allow_types_conversion {#input_format_native_allow_types_conversion}

<SettingsInfoBlock type='Bool' default_value='1' />

Разрешает преобразование типов данных во входном формате Native


## input_format_native_decode_types_in_binary_format {#input_format_native_decode_types_in_binary_format}

<SettingsInfoBlock type='Bool' default_value='0' />

Читать типы данных в двоичном формате вместо имён типов во входном формате Native


## input_format_null_as_default {#input_format_null_as_default}

<SettingsInfoBlock type='Bool' default_value='1' />

Включает или отключает инициализацию полей [NULL](/sql-reference/syntax#literals) [значениями по умолчанию](/sql-reference/statements/create/table#default_values), если тип данных этих полей не является [nullable](/sql-reference/data-types/nullable).
Если тип столбца не nullable и эта настройка отключена, то вставка `NULL` вызывает исключение. Если тип столбца nullable, то значения `NULL` вставляются как есть, независимо от этой настройки.

Эта настройка применима к большинству входных форматов.

Для сложных выражений по умолчанию также должна быть включена настройка `input_format_defaults_for_omitted_fields`.

Возможные значения:

- 0 — Вставка `NULL` в столбец, не являющийся nullable, вызывает исключение.
- 1 — Поля `NULL` инициализируются значениями столбцов по умолчанию.


## input_format_orc_allow_missing_columns {#input_format_orc_allow_missing_columns}

<SettingsInfoBlock type='Bool' default_value='1' />

Разрешает отсутствие столбцов при чтении данных в формате ORC


## input_format_orc_case_insensitive_column_matching {#input_format_orc_case_insensitive_column_matching}

<SettingsInfoBlock type='Bool' default_value='0' />

Игнорировать регистр символов при сопоставлении столбцов ORC со столбцами ClickHouse.


## input_format_orc_dictionary_as_low_cardinality {#input_format_orc_dictionary_as_low_cardinality}

<SettingsInfoBlock type='Bool' default_value='1' />

Обрабатывать столбцы ORC, закодированные словарём, как столбцы LowCardinality при чтении файлов ORC.


## input_format_orc_filter_push_down {#input_format_orc_filter_push_down}

<SettingsInfoBlock type='Bool' default_value='1' />

При чтении ORC-файлов пропускать целые полосы (stripes) или группы строк на основе выражений WHERE/PREWHERE, статистики min/max или фильтра Блума в метаданных ORC.


## input_format_orc_reader_time_zone_name {#input_format_orc_reader_time_zone_name}

<SettingsInfoBlock type='String' default_value='GMT' />

Название часового пояса для чтения строк ORC. По умолчанию используется часовой пояс GMT.


## input_format_orc_row_batch_size {#input_format_orc_row_batch_size}

<SettingsInfoBlock type='Int64' default_value='100000' />

Размер пакета при чтении страйпов ORC.


## input_format_orc_skip_columns_with_unsupported_types_in_schema_inference {#input_format_orc_skip_columns_with_unsupported_types_in_schema_inference}

<SettingsInfoBlock type='Bool' default_value='0' />

Пропускать столбцы с неподдерживаемыми типами при автоматическом определении схемы для формата ORC


## input_format_orc_use_fast_decoder {#input_format_orc_use_fast_decoder}

<SettingsInfoBlock type='Bool' default_value='1' />

Использовать более быструю реализацию декодера ORC.


## input_format_parquet_allow_geoparquet_parser {#input_format_parquet_allow_geoparquet_parser}

<SettingsInfoBlock type='Bool' default_value='1' />

Использовать парсер геоколонок для преобразования типа Array(UInt8) в типы Point/Linestring/Polygon/MultiLineString/MultiPolygon


## input_format_parquet_allow_missing_columns {#input_format_parquet_allow_missing_columns}

<SettingsInfoBlock type='Bool' default_value='1' />

Разрешает отсутствие столбцов при чтении данных в формате Parquet


## input_format_parquet_bloom_filter_push_down {#input_format_parquet_bloom_filter_push_down}

<SettingsInfoBlock type='Bool' default_value='1' />

При чтении файлов Parquet пропускает целые группы строк на основе выражений WHERE и фильтра Блума в метаданных Parquet.


## input_format_parquet_case_insensitive_column_matching {#input_format_parquet_case_insensitive_column_matching}

<SettingsInfoBlock type='Bool' default_value='0' />

Игнорировать регистр символов при сопоставлении столбцов Parquet со столбцами ClickHouse.


## input_format_parquet_enable_json_parsing {#input_format_parquet_enable_json_parsing}

<SettingsInfoBlock type='Bool' default_value='1' />

При чтении файлов Parquet парсить JSON-столбцы как тип данных JSON ClickHouse.


## input_format_parquet_enable_row_group_prefetch {#input_format_parquet_enable_row_group_prefetch}

<SettingsInfoBlock type='Bool' default_value='1' />

Включает предварительную загрузку групп строк при парсинге Parquet. В настоящее время предварительная загрузка поддерживается только в однопоточном режиме парсинга.


## input_format_parquet_filter_push_down {#input_format_parquet_filter_push_down}

<SettingsInfoBlock type='Bool' default_value='1' />

При чтении файлов Parquet пропускает целые группы строк на основе выражений WHERE/PREWHERE и статистики min/max в метаданных Parquet.


## input_format_parquet_local_file_min_bytes_for_seek {#input_format_parquet_local_file_min_bytes_for_seek}

<SettingsInfoBlock type='UInt64' default_value='8192' />

Минимальное количество байтов, необходимое для выполнения операции seek при локальном чтении файла вместо последовательного чтения с пропуском данных во входном формате Parquet


## input_format_parquet_local_time_as_utc {#input_format_parquet_local_time_as_utc}

<SettingsInfoBlock type='Bool' default_value='1' />

Определяет тип данных, используемый при автоматическом выводе схемы для временных меток Parquet с параметром isAdjustedToUTC=false. Если true: DateTime64(..., 'UTC'), если false: DateTime64(...). Ни один из вариантов поведения не является полностью корректным, так как в ClickHouse отсутствует тип данных для локального времени (wall-clock time). Как ни парадоксально, значение 'true', вероятно, является менее некорректным вариантом, поскольку форматирование временной метки 'UTC' в String даст представление корректного локального времени.


## input_format_parquet_max_block_size {#input_format_parquet_max_block_size}

<SettingsInfoBlock type='NonZeroUInt64' default_value='65409' />

Максимальный размер блока для чтения Parquet.


## input_format_parquet_memory_high_watermark {#input_format_parquet_memory_high_watermark}

<SettingsInfoBlock type='UInt64' default_value='4294967296' />

Приблизительный лимит памяти для Parquet reader v3. Ограничивает количество групп строк или столбцов, которые могут быть прочитаны параллельно. При чтении нескольких файлов в одном запросе лимит применяется к суммарному использованию памяти по всем файлам.


## input_format_parquet_memory_low_watermark {#input_format_parquet_memory_low_watermark}

<SettingsInfoBlock type='UInt64' default_value='2097152' />

Планировать предварительную загрузку более агрессивно, если использование памяти ниже указанного порога. Может быть полезно, например, при чтении большого количества небольших bloom-фильтров по сети.


## input_format_parquet_page_filter_push_down {#input_format_parquet_page_filter_push_down}

<SettingsInfoBlock type='Bool' default_value='1' />

Пропускать страницы на основе минимальных и максимальных значений из индекса столбца.


## input_format_parquet_prefer_block_bytes {#input_format_parquet_prefer_block_bytes}

<SettingsInfoBlock type='UInt64' default_value='16744704' />

Средний размер блока в байтах, выдаваемый читателем Parquet


## input_format_parquet_preserve_order {#input_format_parquet_preserve_order}

<SettingsInfoBlock type='Bool' default_value='0' />

Предотвращает изменение порядка строк при чтении из файлов Parquet. Не рекомендуется, поскольку порядок строк обычно не гарантируется, и другие части конвейера запросов могут его нарушить. Вместо этого используйте `ORDER BY _row_number`.


## input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference {#input_format_parquet_skip_columns_with_unsupported_types_in_schema_inference}

<SettingsInfoBlock type='Bool' default_value='0' />

Пропускать столбцы с неподдерживаемыми типами при автоматическом определении схемы для формата Parquet


## input_format_parquet_use_native_reader {#input_format_parquet_use_native_reader}

<SettingsInfoBlock type='Bool' default_value='0' />

Использовать встроенный читатель Parquet версии 1. Относительно быстрый, но незавершённый. Устарел.


## input_format_parquet_use_native_reader_v3 {#input_format_parquet_use_native_reader_v3}

<SettingsInfoBlock type='Bool' default_value='1' />

Использовать версию 3 читателя Parquet.


## input_format_parquet_use_offset_index {#input_format_parquet_use_offset_index}

<SettingsInfoBlock type='Bool' default_value='1' />

Незначительная корректировка способа чтения страниц из файла Parquet при отсутствии фильтрации страниц.


## input_format_parquet_verify_checksums {#input_format_parquet_verify_checksums}

<SettingsInfoBlock type='Bool' default_value='1' />

Проверять контрольные суммы страниц при чтении файлов Parquet.


## input_format_protobuf_flatten_google_wrappers {#input_format_protobuf_flatten_google_wrappers}

<SettingsInfoBlock type='Bool' default_value='0' />

Включает использование обёрток Google для обычных невложенных столбцов, например google.protobuf.StringValue 'str' для столбца String 'str'. Для столбцов Nullable пустые обёртки интерпретируются как значения по умолчанию, а отсутствующие — как NULL


## input_format_protobuf_oneof_presence {#input_format_protobuf_oneof_presence}

<SettingsInfoBlock type='Bool' default_value='0' />

Указывает, какое поле protobuf oneof было найдено, посредством установки значения enum в специальном столбце


## input_format_protobuf_skip_fields_with_unsupported_types_in_schema_inference {#input_format_protobuf_skip_fields_with_unsupported_types_in_schema_inference}

<SettingsInfoBlock type='Bool' default_value='0' />

Пропускать поля с неподдерживаемыми типами при автоматическом определении схемы для формата Protobuf


## input_format_record_errors_file_path {#input_format_record_errors_file_path}

Путь к файлу для записи ошибок при чтении текстовых форматов (CSV, TSV).


## input_format_skip_unknown_fields {#input_format_skip_unknown_fields}

<SettingsInfoBlock type='Bool' default_value='1' />

Включает или отключает пропуск вставки лишних данных.

При записи данных ClickHouse генерирует исключение, если входные данные содержат столбцы, отсутствующие в целевой таблице. Если пропуск включен, ClickHouse не вставляет лишние данные и не генерирует исключение.

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

<SettingsInfoBlock type='Bool' default_value='1' />

Если параметр включен, ClickHouse будет пытаться определить тип `Date` из строковых полей при автоматическом выводе схемы для текстовых форматов. Если все поля столбца во входных данных были успешно распознаны как даты, результирующим типом будет `Date`. Если хотя бы одно поле не удалось распознать как дату, результирующим типом будет `String`.

Включен по умолчанию.


## input_format_try_infer_datetimes {#input_format_try_infer_datetimes}

<SettingsInfoBlock type='Bool' default_value='1' />

Если параметр включен, ClickHouse будет пытаться определить тип `DateTime64` из строковых полей при автоматическом выводе схемы для текстовых форматов. Если все поля столбца во входных данных были успешно распознаны как значения datetime, результирующим типом будет `DateTime64`. Если хотя бы одно поле не удалось распознать как datetime, результирующим типом будет `String`.

Включен по умолчанию.


## input_format_try_infer_datetimes_only_datetime64 {#input_format_try_infer_datetimes_only_datetime64}

<SettingsInfoBlock type='Bool' default_value='0' />

Если включена настройка input_format_try_infer_datetimes, выводить только тип DateTime64, но не DateTime


## input_format_try_infer_exponent_floats {#input_format_try_infer_exponent_floats}

<SettingsInfoBlock type='Bool' default_value='0' />

Пытаться определять числа с плавающей точкой в экспоненциальной записи при автоматическом выводе схемы в текстовых форматах (за исключением JSON, где числа в экспоненциальной записи всегда определяются автоматически)


## input_format_try_infer_integers {#input_format_try_infer_integers}

<SettingsInfoBlock type='Bool' default_value='1' />

Если параметр включен, ClickHouse будет пытаться определить целые числа вместо чисел с плавающей точкой при автоматическом выводе схемы для текстовых форматов. Если все числа в столбце входных данных являются целыми, результирующим типом будет `Int64`. Если хотя бы одно число является числом с плавающей точкой, результирующим типом будет `Float64`.

Включен по умолчанию.


## input_format_try_infer_variants {#input_format_try_infer_variants}

<SettingsInfoBlock type='Bool' default_value='0' />

Если включено, ClickHouse будет пытаться определить тип [`Variant`](../../sql-reference/data-types/variant.md) при выводе схемы для текстовых форматов, когда для столбца/элементов массива возможен более чем один тип.

Возможные значения:

- 0 — Отключено.
- 1 — Включено.


## input_format_tsv_allow_variable_number_of_columns {#input_format_tsv_allow_variable_number_of_columns}

<SettingsInfoBlock type='Bool' default_value='0' />

Игнорировать лишние столбцы во входных данных TSV (если файл содержит больше столбцов, чем ожидается) и обрабатывать отсутствующие поля во входных данных TSV как значения по умолчанию


## input_format_tsv_crlf_end_of_line {#input_format_tsv_crlf_end_of_line}

<SettingsInfoBlock type='Bool' default_value='0' />

Если установлено значение true, функция file будет читать формат TSV с символами \\r\\n вместо \\n.


## input_format_tsv_detect_header {#input_format_tsv_detect_header}

<SettingsInfoBlock type='Bool' default_value='1' />

Автоматически определять заголовок с именами и типами в формате TSV


## input_format_tsv_empty_as_default {#input_format_tsv_empty_as_default}

<SettingsInfoBlock type='Bool' default_value='0' />

Обрабатывать пустые поля во входных данных TSV как значения по умолчанию.


## input_format_tsv_enum_as_number {#input_format_tsv_enum_as_number}

<SettingsInfoBlock type='Bool' default_value='0' />

Обрабатывать вставляемые значения перечислений в форматах TSV как индексы перечислений.


## input_format_tsv_skip_first_lines {#input_format_tsv_skip_first_lines}

<SettingsInfoBlock type='UInt64' default_value='0' />

Пропускает указанное количество строк в начале данных в формате TSV


## input_format_tsv_skip_trailing_empty_lines {#input_format_tsv_skip_trailing_empty_lines}

<SettingsInfoBlock type='Bool' default_value='0' />

Пропускать конечные пустые строки в формате TSV


## input_format_tsv_use_best_effort_in_schema_inference {#input_format_tsv_use_best_effort_in_schema_inference}

<SettingsInfoBlock type='Bool' default_value='1' />

Использовать дополнительные настройки и эвристики для вывода схемы в формате TSV


## input_format_values_accurate_types_of_literals {#input_format_values_accurate_types_of_literals}

<SettingsInfoBlock type='Bool' default_value='1' />

Для формата Values: при разборе и интерпретации выражений с использованием шаблона проверяет фактический тип литерала во избежание возможного переполнения и потери точности.


## input_format_values_deduce_templates_of_expressions {#input_format_values_deduce_templates_of_expressions}

<SettingsInfoBlock type='Bool' default_value='1' />

Для формата Values: если поле не удалось разобрать потоковым парсером, запускается SQL-парсер, определяется шаблон SQL-выражения, выполняется попытка разобрать все строки с использованием этого шаблона, после чего выражение интерпретируется для всех строк.


## input_format_values_interpret_expressions {#input_format_values_interpret_expressions}

<SettingsInfoBlock type='Bool' default_value='1' />

Для формата Values: если поле не удалось разобрать с помощью потокового парсера, запускается SQL-парсер, который пытается интерпретировать его как SQL-выражение.


## input_format_with_names_use_header {#input_format_with_names_use_header}

<SettingsInfoBlock type='Bool' default_value='1' />

Включает или отключает проверку порядка столбцов при вставке данных.

Для повышения производительности вставки рекомендуется отключить эту проверку, если вы уверены, что порядок столбцов входных данных совпадает с порядком столбцов в целевой таблице.

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


## input_format_with_types_use_header {#input_format_with_types_use_header}

<SettingsInfoBlock type='Bool' default_value='1' />

Определяет, должен ли парсер формата проверять соответствие типов данных во входных данных типам данных в целевой таблице.

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

<SettingsInfoBlock type='Bool' default_value='0' />

Включает или отключает вставку данных в случайный шард таблицы [Distributed](/engines/table-engines/special/distributed) при отсутствии ключа распределения.

По умолчанию при вставке данных в таблицу `Distributed` с несколькими шардами сервер ClickHouse отклоняет любой запрос на вставку, если ключ распределения не указан. При значении `insert_distributed_one_random_shard = 1` вставки разрешены, и данные направляются в случайный шард.

Возможные значения:

- 0 — вставка отклоняется, если имеется несколько шардов и ключ распределения не указан.
- 1 — вставка выполняется в случайный шард из всех доступных, если ключ распределения не указан.


## interval_output_format {#interval_output_format}

<SettingsInfoBlock type='IntervalOutputFormat' default_value='numeric' />

Позволяет выбрать формат вывода текстового представления интервальных типов данных.

Возможные значения:

- `kusto` — формат вывода в стиле KQL.

  ClickHouse выводит интервалы в [формате KQL](https://learn.microsoft.com/en-us/dotnet/standard/base-types/standard-timespan-format-strings#the-constant-c-format-specifier). Например, `toIntervalDay(2)` будет отформатирован как `2.00:00:00`. Обратите внимание, что для интервальных типов переменной длины (т.е. `IntervalMonth` и `IntervalYear`) используется среднее количество секунд в интервале.

- `numeric` — числовой формат вывода.

  ClickHouse выводит интервалы как их числовое представление. Например, `toIntervalDay(2)` будет отформатирован как `2`.

См. также:

- [Interval](../../sql-reference/data-types/special-data-types/interval.md)


## into_outfile_create_parent_directories {#into_outfile_create_parent_directories}

<SettingsInfoBlock type='Bool' default_value='0' />

Автоматически создавать родительские каталоги при использовании INTO OUTFILE, если они ещё не существуют.


## json_type_escape_dots_in_keys {#json_type_escape_dots_in_keys}

<SettingsInfoBlock type='Bool' default_value='0' />

Если включено, точки в ключах JSON будут экранироваться при разборе.


## output_format_arrow_compression_method {#output_format_arrow_compression_method}

<SettingsInfoBlock type='ArrowCompression' default_value='lz4_frame' />

Метод сжатия для выходного формата Arrow. Поддерживаемые кодеки: lz4_frame, zstd, none (несжатый)


## output_format_arrow_fixed_string_as_fixed_byte_array {#output_format_arrow_fixed_string_as_fixed_byte_array}

<SettingsInfoBlock type='Bool' default_value='1' />

Использовать тип Arrow FIXED_SIZE_BINARY вместо Binary для столбцов FixedString.


## output_format_arrow_low_cardinality_as_dictionary {#output_format_arrow_low_cardinality_as_dictionary}

<SettingsInfoBlock type='Bool' default_value='0' />

Включает вывод типа LowCardinality как типа Dictionary в формате Arrow


## output_format_arrow_string_as_string {#output_format_arrow_string_as_string}

<SettingsInfoBlock type='Bool' default_value='1' />

Использовать тип Arrow String вместо Binary для столбцов String


## output_format_arrow_use_64_bit_indexes_for_dictionary {#output_format_arrow_use_64_bit_indexes_for_dictionary}

<SettingsInfoBlock type='Bool' default_value='0' />

Всегда использовать 64-битные целые числа для индексов словарей в формате Arrow


## output_format_arrow_use_signed_indexes_for_dictionary {#output_format_arrow_use_signed_indexes_for_dictionary}

<SettingsInfoBlock type='Bool' default_value='1' />

Использовать знаковые целые числа для индексов словарей в формате Arrow


## output_format_avro_codec {#output_format_avro_codec}

Кодек сжатия, используемый для вывода данных. Возможные значения: 'null', 'deflate', 'snappy', 'zstd'.


## output_format_avro_rows_in_file {#output_format_avro_rows_in_file}

<SettingsInfoBlock type='UInt64' default_value='1' />

Максимальное количество строк в файле (если поддерживается хранилищем)


## output_format_avro_string_column_pattern {#output_format_avro_string_column_pattern}

Для формата Avro: регулярное выражение для выбора столбцов типа String в качестве строк AVRO.


## output_format_avro_sync_interval {#output_format_avro_sync_interval}

<SettingsInfoBlock type='UInt64' default_value='16384' />

Интервал синхронизации в байтах.


## output_format_binary_encode_types_in_binary_format {#output_format_binary_encode_types_in_binary_format}

<SettingsInfoBlock type='Bool' default_value='0' />

Записывать типы данных в двоичном формате вместо имён типов в формате вывода RowBinaryWithNamesAndTypes


## output_format_binary_write_json_as_string {#output_format_binary_write_json_as_string}

<SettingsInfoBlock type='Bool' default_value='0' />

Записывать значения типа данных [JSON](../../sql-reference/data-types/newjson.md) как значения JSON типа [String](../../sql-reference/data-types/string.md) в формате вывода RowBinary.


## output_format_bson_string_as_string {#output_format_bson_string_as_string}

<SettingsInfoBlock type='Bool' default_value='0' />

Использовать тип BSON String вместо Binary для столбцов String.


## output_format_csv_crlf_end_of_line {#output_format_csv_crlf_end_of_line}

<SettingsInfoBlock type='Bool' default_value='0' />

Если установлено значение true, в качестве символа конца строки в формате CSV будет использоваться \\r\\n вместо \\n.


## output_format_csv_serialize_tuple_into_separate_columns {#output_format_csv_serialize_tuple_into_separate_columns}

<SettingsInfoBlock type='Bool' default_value='1' />

Если установлено значение true, то кортежи в формате CSV сериализуются как отдельные столбцы (то есть их вложенная структура не сохраняется)


## output_format_decimal_trailing_zeros {#output_format_decimal_trailing_zeros}

<SettingsInfoBlock type='Bool' default_value='0' />

Выводить завершающие нули при выводе значений типа Decimal. Например, 1.230000 вместо 1.23.

Отключено по умолчанию.


## output_format_json_array_of_rows {#output_format_json_array_of_rows}

<SettingsInfoBlock type='Bool' default_value='0' />

Включает возможность вывода всех строк в виде JSON-массива в формате [JSONEachRow](/interfaces/formats/JSONEachRow).

Возможные значения:

- 1 — ClickHouse выводит все строки в виде массива, каждая строка представлена в формате `JSONEachRow`.
- 0 — ClickHouse выводит каждую строку отдельно в формате `JSONEachRow`.

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

<SettingsInfoBlock type='Bool' default_value='1' />

Управляет экранированием прямых слешей в строковых значениях при выводе в формате JSON. Предназначено для обеспечения совместимости с JavaScript. Не следует путать с обратными слешами, которые экранируются всегда.

Включено по умолчанию.


## output_format_json_map_as_array_of_tuples {#output_format_json_map_as_array_of_tuples}

<SettingsInfoBlock type='Bool' default_value='0' />

Сериализует столбцы типа Map как JSON-массивы кортежей.

Отключено по умолчанию.


## output_format_json_named_tuples_as_objects {#output_format_json_named_tuples_as_objects}

<SettingsInfoBlock type='Bool' default_value='1' />

Сериализует столбцы именованных кортежей как JSON-объекты.

Включено по умолчанию.


## output_format_json_pretty_print {#output_format_json_pretty_print}

<SettingsInfoBlock type='Bool' default_value='1' />

Эта настройка определяет способ отображения вложенных структур, таких как кортежи (Tuple), словари (Map) и массивы (Array), внутри массива `data` при использовании формата вывода JSON.

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

Вывод будет отформатирован следующим образом:

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

Включена по умолчанию.


## output_format_json_quote_64bit_floats {#output_format_json_quote_64bit_floats}

<SettingsInfoBlock type='Bool' default_value='0' />

Управляет заключением в кавычки 64-битных [чисел с плавающей точкой](../../sql-reference/data-types/float.md) при выводе в форматах JSON\*.

Отключено по умолчанию.


## output_format_json_quote_64bit_integers {#output_format_json_quote_64bit_integers}

<SettingsInfoBlock type='Bool' default_value='0' />

Управляет заключением в кавычки 64-битных и более крупных [целых чисел](../../sql-reference/data-types/int-uint.md) (например, `UInt64` или `Int128`) при выводе в формате [JSON](/interfaces/formats/JSON).
По умолчанию такие целые числа заключаются в кавычки. Такое поведение совместимо с большинством реализаций JavaScript.

Возможные значения:

- 0 — целые числа выводятся без кавычек.
- 1 — целые числа заключаются в кавычки.


## output_format_json_quote_decimals {#output_format_json_quote_decimals}

<SettingsInfoBlock type='Bool' default_value='0' />

Управляет заключением десятичных чисел в кавычки в форматах вывода JSON.

По умолчанию отключена.


## output_format_json_quote_denormals {#output_format_json_quote_denormals}

<SettingsInfoBlock type='Bool' default_value='0' />

Включает вывод значений `+nan`, `-nan`, `+inf`, `-inf` в формате [JSON](/interfaces/formats/JSON).

Возможные значения:

- 0 — Отключено.
- 1 — Включено.

**Пример**

Рассмотрим таблицу `account_orders`:

```text
┌─id─┬─name───┬─duration─┬─period─┬─area─┐
│  1 │ Andrew │       20 │      0 │  400 │
│  2 │ John   │       40 │      0 │    0 │
│  3 │ Bob    │       15 │      0 │ -100 │
└────┴────────┴──────────┴────────┴──────┘
```

При `output_format_json_quote_denormals = 0` запрос возвращает значения `null`:

```sql
SELECT area/period FROM account_orders FORMAT JSON;
```

```json
{
  "meta": [
    {
      "name": "divide(area, period)",
      "type": "Float64"
    }
  ],

  "data": [
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

  "statistics": {
    "elapsed": 0.003648093,
    "rows_read": 3,
    "bytes_read": 24
  }
}
```

При `output_format_json_quote_denormals = 1` запрос возвращает:

```json
{
  "meta": [
    {
      "name": "divide(area, period)",
      "type": "Float64"
    }
  ],

  "data": [
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

  "statistics": {
    "elapsed": 0.000070241,
    "rows_read": 3,
    "bytes_read": 24
  }
}
```


## output_format_json_skip_null_value_in_named_tuples {#output_format_json_skip_null_value_in_named_tuples}

<SettingsInfoBlock type='Bool' default_value='0' />

Пропускать пары ключ-значение со значением null при сериализации столбцов именованных кортежей в виде JSON-объектов. Действует только при включённой настройке output_format_json_named_tuples_as_objects.


## output_format_json_validate_utf8 {#output_format_json_validate_utf8}

<SettingsInfoBlock type='Bool' default_value='0' />

Управляет проверкой последовательностей UTF-8 в форматах вывода JSON, не влияет на форматы JSON/JSONCompact/JSONColumnsWithMetadata, которые всегда проверяют UTF-8.

По умолчанию отключена.


## output_format_markdown_escape_special_characters {#output_format_markdown_escape_special_characters}

<SettingsInfoBlock type='Bool' default_value='0' />

При включении экранирует специальные символы в Markdown.

[Common Mark](https://spec.commonmark.org/0.30/#example-12) определяет следующие специальные символы, которые могут быть экранированы с помощью \:

```
! " # $ % & ' ( ) * + , - . / : ; < = > ? @ [ \ ] ^ _ ` { | } ~
```

Возможные значения:

- 0 — Отключено.
- 1 — Включено.


## output_format_msgpack_uuid_representation {#output_format_msgpack_uuid_representation}

<SettingsInfoBlock type='MsgPackUUIDRepresentation' default_value='ext' />

Способ вывода UUID в формате MsgPack.


## output_format_native_encode_types_in_binary_format {#output_format_native_encode_types_in_binary_format}

<SettingsInfoBlock type='Bool' default_value='0' />

Записывать типы данных в двоичном формате вместо имён типов в выходном формате Native


## output_format_native_use_flattened_dynamic_and_json_serialization {#output_format_native_use_flattened_dynamic_and_json_serialization}

<SettingsInfoBlock type='Bool' default_value='0' />

Записывать данные столбцов [JSON](../../sql-reference/data-types/newjson.md) и [Dynamic](../../sql-reference/data-types/dynamic.md) в плоском формате (все типы и пути как отдельные подстолбцы).


## output_format_native_write_json_as_string {#output_format_native_write_json_as_string}

<SettingsInfoBlock type='Bool' default_value='0' />

Записывать данные столбца [JSON](../../sql-reference/data-types/newjson.md) как столбец [String](../../sql-reference/data-types/string.md), содержащий JSON-строки, вместо нативной JSON-сериализации по умолчанию.


## output_format_orc_compression_block_size {#output_format_orc_compression_block_size}

<SettingsInfoBlock type='UInt64' default_value='262144' />

Размер блока сжатия в байтах для формата вывода ORC.


## output_format_orc_compression_method {#output_format_orc_compression_method}

<SettingsInfoBlock type='ORCCompression' default_value='zstd' />

Метод сжатия для выходного формата ORC. Поддерживаемые кодеки: lz4, snappy, zlib, zstd, none (без сжатия)


## output_format_orc_dictionary_key_size_threshold {#output_format_orc_dictionary_key_size_threshold}

<SettingsInfoBlock type='Double' default_value='0' />

Для строкового столбца в формате вывода ORC, если количество уникальных значений превышает указанную долю от общего числа ненулевых строк, словарное кодирование отключается. В противном случае словарное кодирование включено


## output_format_orc_row_index_stride {#output_format_orc_row_index_stride}

<SettingsInfoBlock type='UInt64' default_value='10000' />

Шаг индекса строк в выходном формате ORC


## output_format_orc_string_as_string {#output_format_orc_string_as_string}

<SettingsInfoBlock type='Bool' default_value='1' />

Использовать тип ORC String вместо Binary для столбцов String


## output_format_orc_writer_time_zone_name {#output_format_orc_writer_time_zone_name}

<SettingsInfoBlock type='String' default_value='GMT' />

Название часового пояса для записи в формате ORC. По умолчанию используется часовой пояс GMT.


## output_format_parquet_batch_size {#output_format_parquet_batch_size}

<SettingsInfoBlock type='NonZeroUInt64' default_value='1024' />

Проверять размер страницы каждые указанное количество строк. Рекомендуется уменьшить значение, если столбцы содержат значения со средним размером более нескольких КБ.


## output_format_parquet_bloom_filter_bits_per_value {#output_format_parquet_bloom_filter_bits_per_value}

<SettingsInfoBlock type='Double' default_value='10.5' />

Приблизительное количество битов на каждое уникальное значение в фильтрах Блума Parquet. Ожидаемая частота ложноположительных срабатываний:

- 6 бит - 10%
- 10,5 бит - 1%
- 16,9 бит - 0,1%
- 26,4 бит - 0,01%
- 41 бит - 0,001%


## output_format_parquet_bloom_filter_flush_threshold_bytes {#output_format_parquet_bloom_filter_flush_threshold_bytes}

<SettingsInfoBlock type='UInt64' default_value='134217728' />

Определяет расположение фильтров Блума в файле Parquet. Фильтры Блума записываются группами приблизительно указанного размера. В частности:

- если значение равно 0, фильтры Блума каждой группы строк записываются сразу после соответствующей группы строк;
- если значение превышает общий размер всех фильтров Блума, фильтры Блума для всех групп строк накапливаются в памяти и затем записываются вместе ближе к концу файла;
- в остальных случаях фильтры Блума накапливаются в памяти и записываются при превышении их общим размером указанного значения.


## output_format_parquet_compliant_nested_types {#output_format_parquet_compliant_nested_types}

<SettingsInfoBlock type='Bool' default_value='1' />

В схеме файла Parquet использовать имя 'element' вместо 'item' для элементов списков. Это исторический артефакт реализации библиотеки Arrow. Как правило, повышает совместимость, за исключением, возможно, некоторых старых версий Arrow.


## output_format_parquet_compression_method {#output_format_parquet_compression_method}

<SettingsInfoBlock type='ParquetCompression' default_value='zstd' />

Метод сжатия для выходного формата Parquet. Поддерживаемые кодеки: snappy, lz4, brotli, zstd, gzip, none (без сжатия)


## output_format_parquet_data_page_size {#output_format_parquet_data_page_size}

<SettingsInfoBlock type='UInt64' default_value='1048576' />

Целевой размер страницы в байтах до сжатия.


## output_format_parquet_date_as_uint16 {#output_format_parquet_date_as_uint16}

<SettingsInfoBlock type='Bool' default_value='0' />

Записывать значения Date как простые 16-битные числа (при чтении возвращаются как UInt16) вместо преобразования в 32-битный тип DATE формата Parquet (при чтении возвращаются как Date32).


## output_format_parquet_datetime_as_uint32 {#output_format_parquet_datetime_as_uint32}

<SettingsInfoBlock type='Bool' default_value='0' />

Записывать значения DateTime как необработанную временную метку Unix (читаются обратно как UInt32) вместо преобразования в миллисекунды (читаются обратно как DateTime64(3)).


## output_format_parquet_enum_as_byte_array {#output_format_parquet_enum_as_byte_array}

<SettingsInfoBlock type='Bool' default_value='1' />

Записывать enum с использованием физического типа Parquet: BYTE_ARRAY и логического типа: ENUM


## output_format_parquet_fixed_string_as_fixed_byte_array {#output_format_parquet_fixed_string_as_fixed_byte_array}

<SettingsInfoBlock type='Bool' default_value='1' />

Использовать тип Parquet FIXED_LEN_BYTE_ARRAY вместо Binary для столбцов FixedString.


## output_format_parquet_geometadata {#output_format_parquet_geometadata}

<SettingsInfoBlock type='Bool' default_value='1' />

Разрешает запись информации о геоколонках в метаданные Parquet и кодирование колонок в формате WKB.


## output_format_parquet_max_dictionary_size {#output_format_parquet_max_dictionary_size}

<SettingsInfoBlock type='UInt64' default_value='1048576' />

Если размер словаря превышает указанное количество байтов, происходит переключение на кодирование без словаря. Установите значение 0 для отключения кодирования со словарём.


## output_format_parquet_parallel_encoding {#output_format_parquet_parallel_encoding}

<SettingsInfoBlock type='Bool' default_value='1' />

Выполнять кодирование Parquet в нескольких потоках. Требует включения настройки output_format_parquet_use_custom_encoder.


## output_format_parquet_row_group_size {#output_format_parquet_row_group_size}

<SettingsInfoBlock type='UInt64' default_value='1000000' />

Целевой размер группы строк (в количестве строк).


## output_format_parquet_row_group_size_bytes {#output_format_parquet_row_group_size_bytes}

<SettingsInfoBlock type='UInt64' default_value='536870912' />

Целевой размер группы строк в байтах до сжатия.


## output_format_parquet_string_as_string {#output_format_parquet_string_as_string}

<SettingsInfoBlock type='Bool' default_value='1' />

Использовать тип Parquet String вместо Binary для столбцов String.


## output_format_parquet_use_custom_encoder {#output_format_parquet_use_custom_encoder}

<SettingsInfoBlock type='Bool' default_value='1' />

Использовать более быструю реализацию кодировщика Parquet.


## output_format_parquet_version {#output_format_parquet_version}

<SettingsInfoBlock type='ParquetVersion' default_value='2.latest' />

Версия формата Parquet для вывода данных. Поддерживаемые версии: 1.0, 2.4, 2.6 и 2.latest (по умолчанию)


## output_format_parquet_write_bloom_filter {#output_format_parquet_write_bloom_filter}

<SettingsInfoBlock type='Bool' default_value='1' />

Записывать bloom-фильтры в parquet-файлы. Требуется output_format_parquet_use_custom_encoder = true.


## output_format_parquet_write_checksums {#output_format_parquet_write_checksums}

<SettingsInfoBlock type='Bool' default_value='1' />

Добавлять контрольные суммы CRC32 в заголовки страниц Parquet.


## output_format_parquet_write_page_index {#output_format_parquet_write_page_index}

<SettingsInfoBlock type='Bool' default_value='1' />

Записывать индекс столбцов и индекс смещений (т.е. статистику по каждой странице данных, которая может использоваться для проталкивания фильтров при чтении) в файлы Parquet.


## output_format_pretty_color {#output_format_pretty_color}

<SettingsInfoBlock type='UInt64Auto' default_value='auto' />

Использовать ANSI escape-последовательности в форматах Pretty. 0 — отключено, 1 — включено, 'auto' — включено при выводе в терминал.


## output_format_pretty_display_footer_column_names {#output_format_pretty_display_footer_column_names}

<SettingsInfoBlock type='UInt64' default_value='1' />

Отображать имена столбцов в нижнем колонтитуле при большом количестве строк в таблице.

Возможные значения:

- 0 — Имена столбцов в нижнем колонтитуле не отображаются.
- 1 — Имена столбцов отображаются в нижнем колонтитуле, если количество строк больше или равно пороговому значению, заданному параметром [output_format_pretty_display_footer_column_names_min_rows](#output_format_pretty_display_footer_column_names_min_rows) (по умолчанию 50).

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

<SettingsInfoBlock type='UInt64' default_value='50' />

Задает минимальное количество строк, при котором будет отображаться нижний колонтитул с именами столбцов, если включена настройка [output_format_pretty_display_footer_column_names](#output_format_pretty_display_footer_column_names).


## output_format_pretty_fallback_to_vertical {#output_format_pretty_fallback_to_vertical}

<SettingsInfoBlock type='Bool' default_value='1' />

Если включено и таблица широкая, но короткая, формат Pretty будет выводить её так же, как формат Vertical.
См. `output_format_pretty_fallback_to_vertical_max_rows_per_chunk` и `output_format_pretty_fallback_to_vertical_min_table_width` для детальной настройки данного поведения.


## output_format_pretty_fallback_to_vertical_max_rows_per_chunk {#output_format_pretty_fallback_to_vertical_max_rows_per_chunk}

<SettingsInfoBlock type='UInt64' default_value='10' />

Переход на формат Vertical (см. `output_format_pretty_fallback_to_vertical`) будет выполнен только в том случае, если количество записей в блоке данных не превышает указанное значение.


## output_format_pretty_fallback_to_vertical_min_columns {#output_format_pretty_fallback_to_vertical_min_columns}

<SettingsInfoBlock type='UInt64' default_value='5' />

Переключение на вертикальный формат (см. `output_format_pretty_fallback_to_vertical`) активируется только в том случае, если количество столбцов превышает указанное значение.


## output_format_pretty_fallback_to_vertical_min_table_width {#output_format_pretty_fallback_to_vertical_min_table_width}

<SettingsInfoBlock type='UInt64' default_value='250' />

Переход на вертикальный формат (см. `output_format_pretty_fallback_to_vertical`) будет активирован только в том случае, если сумма длин столбцов в таблице составляет не менее указанного значения или если хотя бы одно значение содержит символ перевода строки.


## output_format_pretty_glue_chunks {#output_format_pretty_glue_chunks}

<SettingsInfoBlock type='UInt64Auto' default_value='auto' />

Если данные, отображаемые в форматах Pretty, поступают несколькими фрагментами, даже с задержкой, но следующий фрагмент имеет ту же ширину столбцов, что и предыдущий, используются управляющие последовательности ANSI для возврата к предыдущей строке и перезаписи нижнего колонтитула предыдущего фрагмента, чтобы продолжить его данными нового фрагмента. Это делает результат визуально более приятным.

0 — отключено, 1 — включено, 'auto' — включено при работе в терминале.


## output_format_pretty_grid_charset {#output_format_pretty_grid_charset}

<SettingsInfoBlock type='String' default_value='UTF-8' />

Кодировка для вывода границ сетки. Доступные кодировки: ASCII, UTF-8 (по умолчанию).


## output_format_pretty_highlight_digit_groups {#output_format_pretty_highlight_digit_groups}

<SettingsInfoBlock type='Bool' default_value='1' />

Если включено и вывод осуществляется в терминал, выделяет подчёркиванием каждую цифру, соответствующую разрядам тысяч, миллионов и т. д.


## output_format_pretty_highlight_trailing_spaces {#output_format_pretty_highlight_trailing_spaces}

<SettingsInfoBlock type='Bool' default_value='1' />

Если включено и вывод осуществляется в терминал, завершающие пробелы выделяются серым цветом и подчёркиванием.


## output_format_pretty_max_column_name_width_cut_to {#output_format_pretty_max_column_name_width_cut_to}

<SettingsInfoBlock type='UInt64' default_value='24' />

Если имя столбца слишком длинное, оно обрезается до этой длины.
Имя столбца обрезается, если его длина превышает сумму `output_format_pretty_max_column_name_width_cut_to` и `output_format_pretty_max_column_name_width_min_chars_to_cut`.


## output_format_pretty_max_column_name_width_min_chars_to_cut {#output_format_pretty_max_column_name_width_min_chars_to_cut}

<SettingsInfoBlock type='UInt64' default_value='4' />

Минимальное количество символов для обрезки при слишком длинном имени столбца.
Имя столбца будет обрезано, если его длина превышает сумму `output_format_pretty_max_column_name_width_cut_to` и `output_format_pretty_max_column_name_width_min_chars_to_cut`.


## output_format_pretty_max_column_pad_width {#output_format_pretty_max_column_pad_width}

<SettingsInfoBlock type='UInt64' default_value='250' />

Максимальная ширина для заполнения всех значений в столбце в форматах Pretty.


## output_format_pretty_max_rows {#output_format_pretty_max_rows}

<SettingsInfoBlock type='UInt64' default_value='1000' />

Ограничение на количество строк для форматов Pretty.


## output_format_pretty_max_value_width {#output_format_pretty_max_value_width}

<SettingsInfoBlock type='UInt64' default_value='10000' />

Максимальная ширина значения для отображения в форматах Pretty. Если больше — значение будет обрезано.
Значение 0 означает, что обрезка не производится.


## output_format_pretty_max_value_width_apply_for_single_value {#output_format_pretty_max_value_width_apply_for_single_value}

<SettingsInfoBlock type='UInt64' default_value='0' />

Обрезать значения (см. настройку `output_format_pretty_max_value_width`) только если в блоке содержится более одного значения. В противном случае выводить значение полностью, что полезно для запроса `SHOW CREATE TABLE`.


## output_format_pretty_multiline_fields {#output_format_pretty_multiline_fields}

<SettingsInfoBlock type='Bool' default_value='1' />

Если включено, форматы Pretty будут отображать многострочные поля внутри ячеек таблицы, сохраняя её структуру.
Если отключено, они будут отображаться как есть, что может нарушить структуру таблицы (преимуществом отключения является упрощение копирования многострочных значений).


## output_format_pretty_row_numbers {#output_format_pretty_row_numbers}

<SettingsInfoBlock type='Bool' default_value='1' />

Добавлять номера строк перед каждой строкой для форматов вывода pretty


## output_format_pretty_single_large_number_tip_threshold {#output_format_pretty_single_large_number_tip_threshold}

<SettingsInfoBlock type='UInt64' default_value='1000000' />

Выводить читаемую подсказку с числом справа от таблицы, если блок состоит из единственного числа, которое превышает это значение (кроме 0)


## output_format_pretty_squash_consecutive_ms {#output_format_pretty_squash_consecutive_ms}

<SettingsInfoBlock type='UInt64' default_value='50' />

Ожидать следующий блок в течение указанного количества миллисекунд и объединять его с предыдущим перед записью.
Это позволяет избежать частого вывода слишком маленьких блоков, сохраняя при этом возможность отображения данных в потоковом режиме.


## output_format_pretty_squash_max_wait_ms {#output_format_pretty_squash_max_wait_ms}

<SettingsInfoBlock type='UInt64' default_value='1000' />

Выводит ожидающий блок в форматах pretty, если с момента предыдущего вывода прошло более указанного количества миллисекунд.


## output_format_protobuf_nullables_with_google_wrappers {#output_format_protobuf_nullables_with_google_wrappers}

<SettingsInfoBlock type='Bool' default_value='0' />

При сериализации Nullable-столбцов с обёртками Google значения по умолчанию сериализуются как пустые обёртки. Если параметр отключён, значения по умолчанию и null не сериализуются


## output_format_schema {#output_format_schema}

Путь к файлу, в который будет сохранена автоматически сгенерированная схема в формате [Cap'n Proto](/interfaces/formats/CapnProto) или [Protobuf](/interfaces/formats/Protobuf).


## output_format_sql_insert_include_column_names {#output_format_sql_insert_include_column_names}

<SettingsInfoBlock type='Bool' default_value='1' />

Включать имена столбцов в запрос INSERT


## output_format_sql_insert_max_batch_size {#output_format_sql_insert_max_batch_size}

<SettingsInfoBlock type='UInt64' default_value='65409' />

Максимальное количество строк в одной инструкции INSERT.


## output_format_sql_insert_quote_names {#output_format_sql_insert_quote_names}

<SettingsInfoBlock type='Bool' default_value='1' />

Заключать имена столбцов в кавычки '`'


## output_format_sql_insert_table_name {#output_format_sql_insert_table_name}

<SettingsInfoBlock type='String' default_value='table' />

Имя таблицы в выходном INSERT-запросе


## output_format_sql_insert_use_replace {#output_format_sql_insert_use_replace}

<SettingsInfoBlock type='Bool' default_value='0' />

Использовать оператор REPLACE вместо INSERT


## output_format_tsv_crlf_end_of_line {#output_format_tsv_crlf_end_of_line}

<SettingsInfoBlock type='Bool' default_value='0' />

Если установлено значение true, в качестве символа конца строки в формате TSV будет использоваться \\r\\n вместо \\n.


## output_format_values_escape_quote_with_quote {#output_format_values_escape_quote_with_quote}

<SettingsInfoBlock type='Bool' default_value='0' />

Если true, одинарная кавычка ' экранируется как '', в противном случае как \\'


## output_format_write_statistics {#output_format_write_statistics}

<SettingsInfoBlock type='Bool' default_value='1' />

Записывать статистику о прочитанных строках, байтах и затраченном времени в поддерживаемых форматах вывода.

Включено по умолчанию


## precise_float_parsing {#precise_float_parsing}

<SettingsInfoBlock type='Bool' default_value='0' />

Использовать более точный (но медленный) алгоритм парсинга чисел с плавающей точкой


## regexp_dict_allow_hyperscan {#regexp_dict_allow_hyperscan}

<SettingsInfoBlock type='Bool' default_value='1' />

Разрешает использование библиотеки Hyperscan для словаря regexp_tree.


## regexp_dict_flag_case_insensitive {#regexp_dict_flag_case_insensitive}

<SettingsInfoBlock type='Bool' default_value='0' />

Использовать сопоставление без учёта регистра для словаря regexp_tree. Может быть переопределено в отдельных выражениях с помощью (?i) и (?-i).


## regexp_dict_flag_dotall {#regexp_dict_flag_dotall}

<SettingsInfoBlock type='Bool' default_value='0' />

Позволяет символу '.' соответствовать символам перевода строки в словаре regexp_tree.


## rows_before_aggregation {#rows_before_aggregation}

<SettingsInfoBlock type='Bool' default_value='0' />

При включении ClickHouse будет предоставлять точное значение статистики rows_before_aggregation, представляющей количество строк, прочитанных до агрегации


## schema_inference_hints {#schema_inference_hints}

Список имён и типов столбцов, используемых в качестве подсказок при автоматическом определении схемы для форматов без явной схемы.

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
Если параметр `schema_inference_hints` имеет неправильный формат, содержит опечатку, неверный тип данных и т.д., то весь параметр schema_inference_hints будет проигнорирован.
:::


## schema_inference_make_columns_nullable {#schema_inference_make_columns_nullable}

<SettingsInfoBlock type='UInt64Auto' default_value='3' />

Управляет преобразованием выведенных типов в `Nullable` при автоматическом определении схемы.
Возможные значения:

- 0 — выведенный тип никогда не будет `Nullable` (используйте настройку input_format_null_as_default для управления обработкой null-значений в этом случае),
- 1 — все выведенные типы будут `Nullable`,
- 2 или `auto` — выведенный тип будет `Nullable` только если столбец содержит `NULL` в образце данных, анализируемом при определении схемы, или если метаданные файла содержат информацию о допустимости null-значений в столбце,
- 3 — допустимость null-значений выведенного типа будет соответствовать метаданным файла, если формат их поддерживает (например, Parquet), в противном случае всегда будет Nullable (например, CSV).


## schema_inference_make_json_columns_nullable {#schema_inference_make_json_columns_nullable}

<SettingsInfoBlock type='Bool' default_value='0' />

Управляет тем, будут ли выведенные типы JSON преобразованы в `Nullable` при выводе схемы.
Если эта настройка включена вместе с schema_inference_make_columns_nullable, выведенный тип JSON будет `Nullable`.


## schema_inference_mode {#schema_inference_mode}

<SettingsInfoBlock type='SchemaInferenceMode' default_value='default' />

Режим определения схемы. 'default' — предполагается, что все файлы имеют одинаковую схему, которая может быть определена из любого файла; 'union' — файлы могут иметь разные схемы, и итоговая схема должна представлять собой объединение схем всех файлов


## show_create_query_identifier_quoting_rule {#show_create_query_identifier_quoting_rule}

<SettingsInfoBlock
  type='IdentifierQuotingRule'
  default_value='when_necessary'
/>

Задаёт правило заключения идентификаторов в кавычки в запросе SHOW CREATE


## show_create_query_identifier_quoting_style {#show_create_query_identifier_quoting_style}

<SettingsInfoBlock type='IdentifierQuotingStyle' default_value='Backticks' />

Задает стиль заключения идентификаторов в кавычки в запросе SHOW CREATE


## type_json_skip_duplicated_paths {#type_json_skip_duplicated_paths}

<SettingsInfoBlock type='Bool' default_value='0' />

Если включено, при парсинге JSON-объекта в тип JSON дублирующиеся пути будут игнорироваться, и будет вставлен только первый путь вместо генерации исключения


## validate_experimental_and_suspicious_types_inside_nested_types {#validate_experimental_and_suspicious_types_inside_nested_types}

<SettingsInfoBlock type='Bool' default_value='1' />

Проверять использование экспериментальных и подозрительных типов внутри вложенных типов, таких как Array/Map/Tuple
