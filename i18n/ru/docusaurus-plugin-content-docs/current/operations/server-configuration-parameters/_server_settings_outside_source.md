## asynchronous&#95;metric&#95;log {#asynchronous_metric_log}

По умолчанию включено в развертываниях ClickHouse Cloud.

Если этот параметр не включён по умолчанию в вашей среде, в зависимости от того, как был установлен ClickHouse, вы можете воспользоваться приведённой ниже инструкцией, чтобы включить или отключить его.

**Включение**

Чтобы вручную включить ведение истории в асинхронном журнале метрик [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md), создайте файл `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` со следующим содержимым:

```xml
<clickhouse>
     <asynchronous_metric_log>
        <database>system</database>
        <table>asynchronous_metric_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </asynchronous_metric_log>
</clickhouse>
```

**Отключение**

Чтобы отключить параметр `asynchronous_metric_log`, необходимо создать файл `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` со следующим содержимым:

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters />

## auth_use_forwarded_address {#auth_use_forwarded_address}

Использовать исходный IP-адрес для аутентификации клиентов, подключённых через прокси.

:::note
Эта настройка должна использоваться с особой осторожностью, так как адреса, передаваемые прокси, легко подделать — серверы, принимающие такую аутентификацию, не должны быть доступны напрямую, а только через доверенный прокси.
:::

## резервные копии {#backups}

Настройки для резервного копирования, используемые при выполнении операторов [`BACKUP` и `RESTORE`](../backup.md).

Следующие настройки можно задать с помощью под-тегов:

{/* SQL
  WITH settings AS (
  SELECT arrayJoin([
    ('allow_concurrent_backups', 'Bool','Определяет, могут ли несколько операций резервного копирования выполняться параллельно на одном хосте.', 'true'),
    ('allow_concurrent_restores', 'Bool', 'Определяет, могут ли несколько операций восстановления выполняться параллельно на одном хосте.', 'true'),
    ('allowed_disk', 'String', 'Диск для резервного копирования при использовании `File()`. Этот параметр должен быть задан для использования `File`.', ''),
    ('allowed_path', 'String', 'Путь для резервного копирования при использовании `File()`. Этот параметр должен быть задан для использования `File`.', ''),
    ('attempts_to_collect_metadata_before_sleep', 'UInt', 'Количество попыток сбора метаданных перед переходом в режим ожидания в случае несогласованности после сравнения собранных метаданных.', '2'),
    ('collect_metadata_timeout', 'UInt64', 'Тайм-аут в миллисекундах на сбор метаданных во время резервного копирования.', '600000'),
    ('compare_collected_metadata', 'Bool', 'Если true, сравнивает собранные метаданные с существующими, чтобы убедиться, что они не изменяются во время резервного копирования.', 'true'),
    ('create_table_timeout', 'UInt64', 'Тайм-аут в миллисекундах на создание таблиц во время восстановления.', '300000'),
    ('max_attempts_after_bad_version', 'UInt64', 'Максимальное количество попыток повторить операцию после ошибки «неверная версия» при координированном резервном копировании/восстановлении.', '3'),
    ('max_sleep_before_next_attempt_to_collect_metadata', 'UInt64', 'Максимальное время ожидания в миллисекундах перед следующей попыткой сбора метаданных.', '100'),
    ('min_sleep_before_next_attempt_to_collect_metadata', 'UInt64', 'Минимальное время ожидания в миллисекундах перед следующей попыткой сбора метаданных.', '5000'),
    ('remove_backup_files_after_failure', 'Bool', 'Если команда `BACKUP` завершилась с ошибкой, ClickHouse попытается удалить файлы, уже скопированные в резервную копию до сбоя, иначе скопированные файлы будут оставлены как есть.', 'true'),
    ('sync_period_ms', 'UInt64', 'Период синхронизации в миллисекундах для координированного резервного копирования/восстановления.', '5000'),
    ('test_inject_sleep', 'Bool', 'Тестовая задержка (sleep), используемая при тестировании.', 'false'),
    ('test_randomize_order', 'Bool', 'Если true, случайным образом изменяет порядок некоторых операций в целях тестирования.', 'false'),
    ('zookeeper_path', 'String', 'Путь в ZooKeeper, по которому хранятся метаданные резервного копирования и восстановления при использовании предложения `ON CLUSTER`.', '/clickhouse/backups')
  ]) AS t )
  SELECT concat('`', t.1, '`') AS Setting, t.2 AS Type, t.3 AS Description, concat('`', t.4, '`') AS Default FROM settings FORMAT Markdown
  */ }

| Настройка                                           | Тип    | Описание                                                                                                                                                                                            | По умолчанию          |
| :-------------------------------------------------- | :----- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------- |
| `allow_concurrent_backups`                          | Булево | Определяет, могут ли несколько операций резервного копирования выполняться одновременно на одном и том же хосте.                                                                                    | `true`                |
| `allow_concurrent_restores`                         | Bool   | Определяет, можно ли выполнять несколько операций восстановления одновременно на одном хосте.                                                                                                       | `true`                |
| `allowed_disk`                                      | Строка | Диск, на который выполняется резервное копирование при использовании `File()`. Этот параметр необходимо задать, чтобы использовать `File()`.                                                        | ``                    |
| `allowed_path`                                      | Строка | Путь для сохранения резервной копии при использовании `File()`. Этот параметр необходимо задать, чтобы использовать `File`.                                                                         | ``                    |
| `attempts_to_collect_metadata_before_sleep`         | UInt   | Количество попыток сбора метаданных, прежде чем сделать паузу при обнаружении несоответствий после сравнения собранных метаданных.                                                                  | `2`                   |
| `collect_metadata_timeout`                          | UInt64 | Тайм-аут (в миллисекундах) на сбор метаданных при создании резервной копии.                                                                                                                         | `600000`              |
| `compare_collected_metadata`                        | Bool   | Если значение — `true`, сравнивает собранные метаданные с существующими, чтобы убедиться, что они не изменялись во время резервного копирования.                                                    | `true`                |
| `create_table_timeout`                              | UInt64 | Таймаут в миллисекундах на создание таблиц при восстановлении.                                                                                                                                      | `300000`              |
| `max_attempts_after_bad_version`                    | UInt64 | Максимальное число повторных попыток при возникновении ошибки некорректной версии во время координированного резервного копирования/восстановления.                                                 | `3`                   |
| `max_sleep_before_next_attempt_to_collect_metadata` | UInt64 | Максимальное время ожидания (в миллисекундах) перед следующей попыткой сбора метаданных.                                                                                                            | `100`                 |
| `min_sleep_before_next_attempt_to_collect_metadata` | UInt64 | Минимальная пауза (в миллисекундах) перед следующей попыткой сбора метаданных.                                                                                                                      | `5000`                |
| `remove_backup_files_after_failure`                 | Bool   | Если команда `BACKUP` завершается с ошибкой, ClickHouse попытается удалить файлы, уже скопированные в резервную копию к моменту сбоя, в противном случае оставит скопированные файлы без изменений. | `true`                |
| `sync_period_ms`                                    | UInt64 | Период синхронизации в миллисекундах для согласованного резервного копирования и восстановления.                                                                                                    | `5000`                |
| `test_inject_sleep`                                 | Bool   | Пауза для тестирования                                                                                                                                                                              | `false`               |
| `test_randomize_order`                              | Bool   | Если имеет значение `true`, случайным образом изменяет порядок некоторых операций для целей тестирования.                                                                                           | `false`               |
| `zookeeper_path`                                    | String | Путь в ZooKeeper, где хранятся метаданные резервного копирования и восстановления при использовании выражения `ON CLUSTER`.                                                                         | `/clickhouse/backups` |

По умолчанию этот параметр имеет следующее значение:

```xml
<backups>
    ....
</backups>
```

## bcrypt&#95;workfactor {#bcrypt_workfactor}

Коэффициент сложности для типа аутентификации `bcrypt_password`, который использует [алгоритм Bcrypt](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/).
Он определяет объём вычислений и время, необходимые для вычисления хеша и проверки пароля.

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

:::warning
Для приложений с частыми операциями аутентификации
из-за вычислительных затрат bcrypt при более высоких параметрах сложности
рассмотрите альтернативные методы аутентификации.
:::

## table_engines_require_grant {#table_engines_require_grant}

Если установлено в значение `true`, пользователям требуется привилегия для создания таблицы с определённым движком, например: `GRANT TABLE ENGINE ON TinyLog TO user`.

:::note
По умолчанию, для сохранения обратной совместимости, при создании таблицы с конкретным движком требование привилегии игнорируется, однако вы можете изменить это поведение, установив данный параметр в `true`.
:::

## builtin&#95;dictionaries&#95;reload&#95;interval {#builtin_dictionaries_reload_interval}

Интервал в секундах между перезагрузками встроенных словарей.

ClickHouse перезагружает встроенные словари каждые x секунд. Это позволяет редактировать словари «на лету» без перезапуска сервера.

**Пример**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```

## compression {#compression}

Настройки сжатия данных для таблиц с движком [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

:::note
Мы рекомендуем не изменять этот параметр, если вы только начинаете работать с ClickHouse.
:::

**Шаблон конфигурации**:

```xml
<compression>
    <case>
      <min_part_size>...</min_part_size>
      <min_part_size_ratio>...</min_part_size_ratio>
      <method>...</method>
      <level>...</level>
    </case>
    ...
</compression>
```

**Поля `<case>`**:

* `min_part_size` – Минимальный размер части данных.
* `min_part_size_ratio` – Отношение размера части данных к размеру таблицы.
* `method` – Метод сжатия. Допустимые значения: `lz4`, `lz4hc`, `zstd`,`deflate_qpl`.
* `level` – Уровень сжатия. См. [Codecs](/sql-reference/statements/create/table#general-purpose-codecs).

:::note
Вы можете сконфигурировать несколько секций `<case>`.
:::

**Действия при выполнении условий**:

* Если часть данных соответствует набору условий, ClickHouse использует указанный метод сжатия.
* Если часть данных соответствует нескольким наборам условий, ClickHouse использует первый подходящий набор.

:::note
Если ни одно условие не выполнено для части данных, ClickHouse использует сжатие `lz4`.
:::

**Пример**

```xml
<compression incl="clickhouse_compression">
    <case>
        <min_part_size>10000000000</min_part_size>
        <min_part_size_ratio>0.01</min_part_size_ratio>
        <method>zstd</method>
        <level>1</level>
    </case>
</compression>
```

## encryption {#encryption}

Настраивает команду для получения ключа, который будет использоваться [кодеками шифрования](/sql-reference/statements/create/table#encryption-codecs). Ключ (или ключи) должен быть передан через переменные окружения или задан в конфигурационном файле.

Ключи могут быть в шестнадцатеричном формате или строкой длиной 16 байт.

**Пример**

Загрузка из конфигурации:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key>1234567812345678</key>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
Хранить ключи в конфигурационном файле не рекомендуется — это небезопасно. Вы можете вынести ключи в отдельный конфигурационный файл на защищённом диске и поместить символическую ссылку на этот файл в папку `config.d/`.
:::

Загрузка из конфигурации, когда ключ задан в шестнадцатеричном формате:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex>00112233445566778899aabbccddeeff</key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

Загрузка ключа из переменной окружения:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex from_env="ENVVAR"></key_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

Здесь `current_key_id` задаёт текущий ключ для шифрования, а все перечисленные ключи могут использоваться для расшифровки.

Каждый из этих методов может быть применён для нескольких ключей:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
        <key_hex id="1" from_env="ENVVAR"></key_hex>
        <current_key_id>1</current_key_id>
    </aes_128_gcm_siv>
</encryption_codecs>
```

Здесь `current_key_id` указывает текущий ключ шифрования.

Также пользователь может задать nonce длиной 12 байт (по умолчанию в процессах шифрования и расшифровки используется nonce, состоящий из нулевых байт):

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

Или его можно задать в шестнадцатеричном формате:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
Все вышесказанное применимо и к `aes_256_gcm_siv` (но длина ключа должна быть 32 байта).
:::

## error&#95;log {#error_log}

По умолчанию он отключён.

**Включение**

Чтобы вручную включить сбор истории ошибок [`system.error_log`](../../operations/system-tables/error_log.md), создайте `/etc/clickhouse-server/config.d/error_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <error_log>
        <database>system</database>
        <table>error_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </error_log>
</clickhouse>
```

**Отключение**

Чтобы отключить параметр `error_log`, нужно создать файл `/etc/clickhouse-server/config.d/disable_error_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters />

## custom&#95;settings&#95;prefixes {#custom_settings_prefixes}

Список префиксов для [пользовательских настроек](/operations/settings/query-level#custom_settings). Префиксы должны быть разделены запятыми.

**Пример**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**См. также**

* [Пользовательские настройки](/operations/settings/query-level#custom_settings)

## core&#95;dump {#core_dump}

Настраивает мягкое ограничение на размер файла дампа памяти (core dump).

:::note
Жёсткое ограничение настраивается с помощью системных инструментов
:::

**Пример**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```

## default&#95;profile {#default_profile}

Профиль настроек по умолчанию. Профили настроек находятся в файле, указанном в параметре `user_config`.

**Пример**

```xml
<default_profile>default</default_profile>
```

## dictionaries&#95;config {#dictionaries_config}

Путь к конфигурационному файлу словарей.

Путь:

* Укажите абсолютный путь или путь, относительный к файлу конфигурации сервера.
* Путь может содержать подстановочные знаки * и ?.

См. также:

* &quot;[Словари](../../sql-reference/dictionaries/index.md)&quot;.

**Пример**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```

## user&#95;defined&#95;executable&#95;functions&#95;config {#user_defined_executable_functions_config}

Путь к конфигурационному файлу исполняемых пользовательских функций.

Путь:

* Укажите абсолютный путь или путь относительно конфигурационного файла сервера.
* Путь может содержать подстановочные символы * и ?.

См. также:

* &quot;[Исполняемые пользовательские функции](/sql-reference/functions/udf#executable-user-defined-functions).&quot;.

**Пример**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```

## format&#95;schema&#95;path {#format_schema_path}

Путь к каталогу со схемами для входных данных, например, схем для формата [CapnProto](/interfaces/formats/CapnProto).

**Пример**

```xml
<!-- Директория, содержащая файлы схем для различных входных форматов. -->
<format_schema_path>format_schemas/</format_schema_path>
```

## graphite {#graphite}

Отправка данных в [Graphite](https://github.com/graphite-project).

Настройки:

* `host` – сервер Graphite.
* `port` – порт на сервере Graphite.
* `interval` – интервал отправки данных, в секундах.
* `timeout` – тайм-аут при отправке данных, в секундах.
* `root_path` – префикс для ключей.
* `metrics` – отправка данных из таблицы [system.metrics](/operations/system-tables/metrics).
* `events` – отправка дельта-данных, накопленных за период времени, из таблицы [system.events](/operations/system-tables/events).
* `events_cumulative` – отправка накопительных (кумулятивных) данных из таблицы [system.events](/operations/system-tables/events).
* `asynchronous_metrics` – отправка данных из таблицы [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics).

Можно настроить несколько блоков `<graphite>`. Например, это можно использовать для отправки разных данных с разными интервалами.

**Пример**

```xml
<graphite>
    <host>localhost</host>
    <port>42000</port>
    <timeout>0.1</timeout>
    <interval>60</interval>
    <root_path>one_min</root_path>
    <metrics>true</metrics>
    <events>true</events>
    <events_cumulative>false</events_cumulative>
    <asynchronous_metrics>true</asynchronous_metrics>
</graphite>
```

## graphite&#95;rollup {#graphite_rollup}

Настройки прореживания данных для Graphite.

Для получения дополнительной информации см. [GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md).

**Пример**

```xml
<graphite_rollup_example>
    <default>
        <function>max</function>
        <retention>
            <age>0</age>
            <precision>60</precision>
        </retention>
        <retention>
            <age>3600</age>
            <precision>300</precision>
        </retention>
        <retention>
            <age>86400</age>
            <precision>3600</precision>
        </retention>
    </default>
</graphite_rollup_example>
```

## google&#95;protos&#95;path {#google_protos_path}

Задает каталог, содержащий proto-файлы для типов Protobuf.

Пример:

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```

## http&#95;handlers {#http_handlers}

Позволяет использовать пользовательские HTTP-обработчики.
Чтобы добавить новый http-обработчик, просто добавьте новый `<rule>`.
Правила проверяются сверху вниз в указанном порядке,
и первый совпавший запускает обработчик.

Следующие настройки могут быть сконфигурированы с помощью подтегов:

| Sub-tags             | Definition                                                                                                                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`                | Для сопоставления URL запроса можно использовать префикс &#39;regex:&#39; для сопоставления по регулярному выражению (необязательно)                                                                                            |
| `methods`            | Для сопоставления HTTP-методов запроса можно использовать запятые для разделения нескольких методов (необязательно)                                                                                                             |
| `headers`            | Для сопоставления заголовков запроса сопоставляйте каждый дочерний элемент (имя дочернего элемента — это имя заголовка), можно использовать префикс &#39;regex:&#39; для сопоставления по регулярному выражению (необязательно) |
| `handler`            | Обработчик запроса                                                                                                                                                                                                              |
| `empty_query_string` | Проверяет, что в URL отсутствует строка запроса                                                                                                                                                                                 |

`handler` содержит следующие настройки, которые могут быть сконфигурированы с помощью подтегов:

| Sub-tags           | Definition                                                                                                                                                                                                     |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`              | URL-адрес для перенаправления                                                                                                                                                                                  |
| `type`             | Поддерживаемые типы: static, dynamic&#95;query&#95;handler, predefined&#95;query&#95;handler, redirect                                                                                                         |
| `status`           | Используется с типом static, код статуса ответа                                                                                                                                                                |
| `query_param_name` | Используется с типом dynamic&#95;query&#95;handler, извлекает и выполняет значение параметра HTTP-запроса, соответствующее `<query_param_name>`                                                                |
| `query`            | Используется с типом predefined&#95;query&#95;handler, выполняет запрос при вызове обработчика                                                                                                                 |
| `content_type`     | Используется с типом static, content-type ответа                                                                                                                                                               |
| `response_content` | Используется с типом static, содержимое ответа, отправляемое клиенту; при использовании префикса &#39;file://&#39; или &#39;config://&#39; содержимое берётся из файла или конфигурации и отправляется клиенту |

Помимо списка правил, вы можете указать `<defaults/>`, который включает все обработчики по умолчанию.

Пример:

```xml
<http_handlers>
    <rule>
        <url>/</url>
        <methods>POST,GET</methods>
        <headers><pragma>no-cache</pragma></headers>
        <handler>
            <type>dynamic_query_handler</type>
            <query_param_name>query</query_param_name>
        </handler>
    </rule>

    <rule>
        <url>/predefined_query</url>
        <methods>POST,GET</methods>
        <handler>
            <type>predefined_query_handler</type>
            <query>SELECT * FROM system.settings</query>
        </handler>
    </rule>

    <rule>
        <handler>
            <type>static</type>
            <status>200</status>
            <content_type>text/plain; charset=UTF-8</content_type>
            <response_content>config://http_server_default_response</response_content>
        </handler>
    </rule>
</http_handlers>
```

## http&#95;server&#95;default&#95;response {#http_server_default_response}

Страница, которая показывается по умолчанию при обращении к HTTP(S)-серверу ClickHouse.
Значение по умолчанию — &quot;Ok.&quot; (с символом новой строки в конце).

**Пример**

При обращении к `http://localhost:http_port` открывается `https://tabix.io/`.

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```

## http&#95;options&#95;response {#http_options_response}

Используется для добавления заголовков к ответу на HTTP-запрос `OPTIONS`.
Метод `OPTIONS` используется при выполнении предварительных CORS-запросов (preflight).

Для получения дополнительной информации см. [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS).

Пример:

```xml
<http_options_response>
     <header>
            <name>Access-Control-Allow-Origin</name>
            <value>*</value>
     </header>
     <header>
          <name>Access-Control-Allow-Headers</name>
          <value>origin, x-requested-with, x-clickhouse-format, x-clickhouse-user, x-clickhouse-key, Authorization</value>
     </header>
     <header>
          <name>Access-Control-Allow-Methods</name>
          <value>POST, GET, OPTIONS</value>
     </header>
     <header>
          <name>Access-Control-Max-Age</name>
          <value>86400</value>
     </header>
</http_options_response>
```

## hsts&#95;max&#95;age {#hsts_max_age}

Срок действия HSTS в секундах.

:::note
Значение `0` означает, что ClickHouse отключает HSTS. Если указать положительное число, HSTS будет включён, а max-age будет равен этому числу.
:::

**Пример**

```xml
<hsts_max_age>600000</hsts_max_age>
```

## mlock&#95;executable {#mlock_executable}

Выполнить `mlockall` после запуска, чтобы уменьшить задержку первых запросов и предотвратить выгрузку исполняемого файла ClickHouse в своп при высокой нагрузке на подсистему ввода-вывода (IO).

:::note
Рекомендуется включить этот параметр, но это приведёт к увеличению времени запуска на несколько секунд.
Имейте в виду, что этот параметр не будет работать без capability &quot;CAP&#95;IPC&#95;LOCK&quot;.
:::

**Пример**

```xml
<mlock_executable>false</mlock_executable>
```

## include&#95;from {#include_from}

Путь к файлу с подстановками. Поддерживаются форматы XML и YAML.

Подробнее см. в разделе &quot;[Configuration files](/operations/configuration-files)&quot;.

**Пример**

```xml
<include_from>/etc/metrica.xml</include_from>
```

## interserver&#95;listen&#95;host {#interserver_listen_host}

Ограничение на хосты, которые могут обмениваться данными между серверами ClickHouse.
Если используется Keeper, то такое же ограничение будет применяться к взаимодействию между различными экземплярами Keeper.

:::note
По умолчанию значение совпадает с настройкой [`listen_host`](#listen_host).
:::

**Пример**

```xml
<interserver_listen_host>::ffff:a00:1</interserver_listen_host>
<interserver_listen_host>10.0.0.1</interserver_listen_host>
```

Тип:

Значение по умолчанию:

## interserver&#95;http&#95;port {#interserver_http_port}

Порт, используемый для обмена данными между серверами ClickHouse.

**Пример**

```xml
<interserver_http_port>9009</interserver_http_port>
```

## interserver&#95;http&#95;host {#interserver_http_host}

Имя хоста, которое могут использовать другие серверы для доступа к этому серверу.

Если параметр не задан, его значение определяется так же, как командой `hostname -f`.

Полезен, чтобы не зависеть от конкретного сетевого интерфейса.

**Пример**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```

## interserver&#95;https&#95;port {#interserver_https_port}

Порт для обмена данными между серверами ClickHouse по `HTTPS`.

**Пример**

```xml
<interserver_https_port>9010</interserver_https_port>
```

## interserver&#95;https&#95;host {#interserver_https_host}

Аналогично [`interserver_http_host`](#interserver_http_host), за исключением того, что это имя хоста может использоваться другими серверами для доступа к этому серверу по `HTTPS`.

**Пример**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```

## interserver&#95;http&#95;credentials {#interserver_http_credentials}

Имя пользователя и пароль, используемые для подключения к другим серверам во время [репликации](../../engines/table-engines/mergetree-family/replication.md). Кроме того, сервер аутентифицирует другие реплики, используя эти учетные данные.
Поэтому `interserver_http_credentials` должны быть одинаковыми для всех реплик в кластере.

:::note

* По умолчанию, если секция `interserver_http_credentials` опущена, аутентификация при репликации не используется.
* Настройки `interserver_http_credentials` не связаны с учетными данными клиента ClickHouse в [конфигурации](../../interfaces/cli.md#configuration_files).
* Эти учетные данные являются общими для репликации через `HTTP` и `HTTPS`.
  :::

Следующие настройки могут быть настроены с помощью подтегов:

* `user` — Имя пользователя.
* `password` — Пароль.
* `allow_empty` — Если `true`, то другим репликам разрешено подключаться без аутентификации, даже если заданы учетные данные. Если `false`, то подключения без аутентификации отклоняются. Значение по умолчанию: `false`.
* `old` — Содержит старые `user` и `password`, использовавшиеся во время ротации учетных данных. Можно указать несколько секций `old`.

**Ротация учетных данных**

ClickHouse поддерживает динамическую ротацию межсерверных учетных данных без одновременной остановки всех реплик для обновления их конфигурации. Учетные данные можно изменить в несколько шагов.

Чтобы включить аутентификацию, установите `interserver_http_credentials.allow_empty` в `true` и добавьте учетные данные. Это позволит выполнять подключения как с аутентификацией, так и без нее.

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

После того как настроите все реплики, установите параметр `allow_empty` в значение `false` или удалите его. Это сделает аутентификацию с использованием новых учетных данных обязательной.

Чтобы изменить существующие учетные данные, переместите имя пользователя и пароль в раздел `interserver_http_credentials.old` и задайте новые значения параметрам `user` и `password`. На этом этапе сервер использует новые учетные данные для подключения к другим репликам и принимает подключения как с новыми, так и со старыми учетными данными.

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>222</password>
    <old>
        <user>admin</user>
        <password>111</password>
    </old>
    <old>
        <user>temp</user>
        <password>000</password>
    </old>
</interserver_http_credentials>
```

После применения новых учетных данных ко всем репликам старые учетные данные можно удалить.

## ldap_servers {#ldap_servers}

Перечислите здесь LDAP‑серверы с их параметрами подключения, чтобы:
- использовать их как аутентификаторы для отдельных локальных пользователей, у которых вместо механизма аутентификации `password` указан `ldap`
- использовать их как удалённые директории пользователей.

Следующие настройки могут быть настроены с помощью подтегов:

| Setting                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                              |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                         | Имя хоста или IP‑адрес LDAP‑сервера; этот параметр является обязательным и не может быть пустым.                                                                                                                                                                                                                                                                                                                                         |
| `port`                         | Порт LDAP‑сервера, по умолчанию `636`, если `enable_tls` установлен в `true`, иначе `389`.                                                                                                                                                                                                                                                                                                                                                |
| `bind_dn`                      | Шаблон, используемый для построения DN, к которому выполняется привязка. Итоговый DN будет построен путём замены всех подстрок `\{user_name\}` в шаблоне на фактическое имя пользователя при каждой попытке аутентификации.                                                                                                                                                                                                               |
| `user_dn_detection`            | Раздел с параметрами LDAP‑поиска для определения фактического пользовательского DN привязанного пользователя. В основном используется в фильтрах поиска для последующего сопоставления ролей, когда сервером является Active Directory. Полученный пользовательский DN будет использоваться при замене подстрок `\{user_dn\}` везде, где это разрешено. По умолчанию пользовательский DN устанавливается равным bind DN, но после выполнения поиска он будет обновлён фактически обнаруженным значением пользовательского DN. |
| `verification_cooldown`        | Период времени в секундах после успешной попытки привязки, в течение которого пользователь считается успешно аутентифицированным для всех последующих запросов без обращения к LDAP‑серверу. Укажите `0` (значение по умолчанию) для отключения кэширования и принудительного обращения к LDAP‑серверу для каждого запроса аутентификации.                                                                                                              |
| `enable_tls`                   | Флаг, включающий использование защищённого соединения с LDAP‑сервером. Укажите `no` для протокола в открытом виде (`ldap://`) (не рекомендуется). Укажите `yes` для LDAP поверх SSL/TLS (`ldaps://`) (рекомендуется, значение по умолчанию). Укажите `starttls` для устаревшего протокола StartTLS (протокол в открытом виде (`ldap://`), с последующим повышением до TLS).                                                                                                   |
| `tls_minimum_protocol_version` | Минимальная версия протокола SSL/TLS. Допустимые значения: `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2` (значение по умолчанию).                                                                                                                                                                                                                                                                                                         |
| `tls_require_cert`             | Поведение проверки сертификата удалённого узла SSL/TLS. Допустимые значения: `never`, `allow`, `try`, `demand` (значение по умолчанию).                                                                                                                                                                                                                                                                                                   |
| `tls_cert_file`                | Путь к файлу сертификата.                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `tls_key_file`                 | Путь к файлу ключа сертификата.                                                                                                                                                                                                                                                                                                                                                                                                          |
| `tls_ca_cert_file`             | Путь к файлу сертификата CA (центра сертификации).                                                                                                                                                                                                                                                                                                                                                                                        |
| `tls_ca_cert_dir`              | Путь к каталогу, содержащему сертификаты CA.                                                                                                                                                                                                                                                                                                                                                                                             |
| `tls_cipher_suite`             | Допустимый набор шифров (в нотации OpenSSL).                                                                                                                                                                                                                                                                                                                                                                                             |

Настройка `user_dn_detection` может быть настроена с помощью подтегов:

| Setting         | Description                                                                                                                                                                                                                                                                                                                                    |
|-----------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`       | Шаблон, используемый для построения базового DN для LDAP‑поиска. Итоговый DN будет построен путём замены всех подстрок `\{user_name\}` и `\{bind_dn\}` в шаблоне на фактическое имя пользователя и bind DN во время LDAP‑поиска.                                                                                                              |
| `scope`         | Область LDAP‑поиска. Допустимые значения: `base`, `one_level`, `children`, `subtree` (значение по умолчанию).                                                                                                                                                                                                                                  |
| `search_filter` | Шаблон, используемый для построения фильтра для LDAP‑поиска. Итоговый фильтр будет построен путём замены всех подстрок `\{user_name\}`, `\{bind_dn\}` и `\{base_dn\}` в шаблоне на фактическое имя пользователя, bind DN и base DN во время LDAP‑поиска. Обратите внимание, что специальные символы должны быть корректно экранированы в XML. |

Пример:

```xml
<my_ldap_server>
    <host>localhost</host>
    <port>636</port>
    <bind_dn>uid={user_name},ou=users,dc=example,dc=com</bind_dn>
    <verification_cooldown>300</verification_cooldown>
    <enable_tls>yes</enable_tls>
    <tls_minimum_protocol_version>tls1.2</tls_minimum_protocol_version>
    <tls_require_cert>demand</tls_require_cert>
    <tls_cert_file>/path/to/tls_cert_file</tls_cert_file>
    <tls_key_file>/path/to/tls_key_file</tls_key_file>
    <tls_ca_cert_file>/path/to/tls_ca_cert_file</tls_ca_cert_file>
    <tls_ca_cert_dir>/path/to/tls_ca_cert_dir</tls_ca_cert_dir>
    <tls_cipher_suite>ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:AES256-GCM-SHA384</tls_cipher_suite>
</my_ldap_server>
```

Пример (типичная среда Active Directory с настроенным определением DN пользователя для дальнейшего сопоставления ролей):

```xml
<my_ad_server>
    <host>localhost</host>
    <port>389</port>
    <bind_dn>EXAMPLE\{user_name}</bind_dn>
    <user_dn_detection>
        <base_dn>CN=Users,DC=example,DC=com</base_dn>
        <search_filter>(&amp;(objectClass=user)(sAMAccountName={user_name}))</search_filter>
    </user_dn_detection>
    <enable_tls>no</enable_tls>
</my_ad_server>
```

## listen&#95;host {#listen_host}

Ограничение на хосты, с которых могут поступать запросы. Если вы хотите, чтобы сервер отвечал на запросы со всех хостов, укажите `::`.

Примеры:

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```

## listen&#95;try {#listen_try}

Сервер не будет завершать работу, если сети IPv6 или IPv4 недоступны при попытке начать прослушивание.

**Пример**

```xml
<listen_try>0</listen_try>
```

## listen&#95;reuse&#95;port {#listen_reuse_port}

Позволяет нескольким серверам прослушивать один и тот же адрес:порт. Запросы будут направляться операционной системой на случайный сервер. Включать этот параметр не рекомендуется.

**Пример**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

Тип:

Значение по умолчанию:

## listen&#95;backlog {#listen_backlog}

Backlog (размер очереди ожидающих подключений) listen-сокета. Значение по умолчанию `4096` совпадает со значением для Linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)).

Обычно это значение не требуется менять, поскольку:

* значение по умолчанию достаточно велико;
* для принятия клиентских подключений у сервера есть отдельный поток.

Поэтому даже если у вас `TcpExtListenOverflows` (из `nstat`) имеет ненулевое значение и этот счётчик растёт для сервера ClickHouse, это не означает, что это значение нужно увеличивать, поскольку:

* обычно, если `4096` недостаточно, это указывает на внутреннюю проблему масштабирования ClickHouse, поэтому лучше сообщить о проблеме;
* это не означает, что сервер сможет обработать больше подключений позже (и даже если сможет, к тому времени клиенты уже могут пропасть или отключиться).

**Пример**

```xml
<listen_backlog>4096</listen_backlog>
```

## logger {#logger}

Расположение и формат сообщений журнала.

**Ключи**:

| Key                    | Description                                                                                                                                                        |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                | Уровень логирования. Допустимые значения: `none` (отключить логирование), `fatal`, `critical`, `error`, `warning`, `notice`, `information`, `debug`, `trace`, `test` |
| `log`                  | Путь к файлу журнала.                                                                                                                                              |
| `errorlog`             | Путь к файлу журнала ошибок.                                                                                                                                       |
| `size`                 | Политика ротации: максимальный размер файлов журнала в байтах. После превышения этого порога файл журнала переименовывается и архивируется, а затем создаётся новый файл журнала. |
| `count`                | Политика ротации: максимальное количество исторических файлов журнала ClickHouse, которое будет сохраняться.                                                      |
| `stream_compress`      | Сжимать сообщения журнала с использованием LZ4. Установите `1` или `true`, чтобы включить.                                                                         |
| `console`              | Включить логирование в консоль. Установите `1` или `true`, чтобы включить. По умолчанию — `1`, если ClickHouse не запущен в режиме демона, иначе — `0`.           |
| `console_log_level`    | Уровень логирования для вывода в консоль. По умолчанию используется значение `level`.                                                                             |
| `formatting.type`      | Формат логов для вывода в консоль. В настоящее время поддерживается только `json`.                                                                                |
| `use_syslog`           | Дополнительно перенаправлять вывод журнала в syslog.                                                                                                               |
| `syslog_level`         | Уровень логирования для записи в syslog.                                                                                                                           |
| `async`                | При значении `true` (по умолчанию) логирование выполняется асинхронно (по одному фоновому потоку на каждый канал вывода). В противном случае запись идёт в потоке, вызывающем LOG. |
| `async_queue_max_size` | При использовании асинхронного логирования — максимальное количество сообщений, которые будут храниться в очереди в ожидании сброса. Лишние сообщения будут отброшены. |
| `startup_level`        | Уровень при запуске используется для установки уровня корневого логгера при старте сервера. После запуска уровень логирования возвращается к значению параметра `level`. |
| `shutdown_level`       | Уровень при завершении работы используется для установки уровня корневого логгера при остановке сервера.                                                          |

**Спецификаторы формата журнала**

Имена файлов в путях `log` и `errorLog` поддерживают приведённые ниже спецификаторы формата для результирующего имени файла (часть пути, соответствующая каталогу, их не поддерживает).

Столбец «Example» показывает вывод для `2023-07-06 18:32:07`.

| Спецификатор | Описание                                                                                                                                                                                                    | Пример                     |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `%%`         | Символ % как литерал                                                                                                                                                                                        | `%`                        |
| `%n`         | Символ новой строки                                                                                                                                                                                         |                            |
| `%t`         | Символ горизонтальной табуляции                                                                                                                                                                             |                            |
| `%Y`         | Год в десятичном формате, например 2017                                                                                                                                                                     | `2023`                     |
| `%y`         | Последние 2 цифры года как десятичное число (диапазон [00, 99])                                                                                                                                             | `23`                       |
| `%C`         | Первые две цифры года в виде десятичного числа (диапазон [00, 99])                                                                                                                                          | `20`                       |
| `%G`         | Четырёхзначный [год по ISO 8601, основанный на неделях](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), то есть год, к которому относится указанная неделя. Обычно используется только совместно с `%V` | `2023`                     |
| `%g`         | Последние две цифры [недельного года по ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), то есть года, к которому относится указанная неделя.                                                  | `23`                       |
| `%b`         | Сокращённое название месяца, например Oct (в зависимости от локали)                                                                                                                                         | `Июл`                      |
| `%h`         | Синоним для %b                                                                                                                                                                                              | `июл`                      |
| `%B`         | Полное название месяца, например Октябрь (зависит от локали)                                                                                                                                                | `Июль`                     |
| `%m`         | Месяц в десятичном формате (диапазон [01, 12])                                                                                                                                                              | `07`                       |
| `%U`         | Номер недели года как десятичное число (воскресенье — первый день недели) (диапазон [00,53])                                                                                                                | `27`                       |
| `%W`         | Номер недели года в виде десятичного числа (понедельник — первый день недели) (диапазон [00,53])                                                                                                            | `27`                       |
| `%V`         | Номер недели по ISO 8601 (диапазон [01,53])                                                                                                                                                                 | `27`                       |
| `%j`         | День года в виде десятичного числа (диапазон [001,366])                                                                                                                                                     | `187`                      |
| `%d`         | День месяца в виде десятичного числа с ведущим нулём (диапазон [01, 31]). Однозначные значения дополняются ведущим нулём.                                                                                   | `06`                       |
| `%e`         | День месяца в виде десятичного числа с добавлением ведущего пробела (диапазон [1, 31]). Однозначные значения предваряются пробелом.                                                                         | `&nbsp; 6`                 |
| `%a`         | Сокращённое название дня недели, например «Fri» (зависит от локали)                                                                                                                                         | `Чт`                       |
| `%A`         | Полное название дня недели, например «Friday» (зависит от локали)                                                                                                                                           | `четверг`                  |
| `%w`         | День недели как целое число, где воскресенье — 0 (диапазон от 0 до 6)                                                                                                                                       | `4`                        |
| `%u`         | День недели как десятичное число, где понедельник — 1 (формат ISO 8601) (диапазон [1–7])                                                                                                                    | `4`                        |
| `%H`         | Часы в виде десятичного числа, 24-часовой формат (диапазон [00–23])                                                                                                                                         | `18`                       |
| `%I`         | Час в виде десятичного числа в 12-часовом формате (диапазон [01,12])                                                                                                                                        | `06`                       |
| `%M`         | Минута в виде десятичного числа (в диапазоне [00, 59])                                                                                                                                                      | `32`                       |
| `%S`         | Секунда в десятичном формате (диапазон [00,60])                                                                                                                                                             | `07`                       |
| `%c`         | Стандартная строка даты и времени, например, Sun Oct 17 04:41:13 2010 (формат зависит от локали)                                                                                                            | `Thu Jul  6 18:32:07 2023` |
| `%x`         | Локализованный формат даты (зависит от локали)                                                                                                                                                              | `06.07.23`                 |
| `%X`         | Локализованный формат времени, например 18:40:20 или 6:40:20 PM (в зависимости от локали)                                                                                                                   | `18:32:07`                 |
| `%D`         | Краткая дата в формате MM/DD/YY, эквивалентная %m/%d/%y                                                                                                                                                     | `07.06.23`                 |
| `%F`         | Краткий формат даты YYYY-MM-DD, эквивалентный %Y-%m-%d                                                                                                                                                      | `2023-07-06`               |
| `%r`         | Локализованное время в 12‑часовом формате (зависит от настроек локали)                                                                                                                                      | `06:32:07 PM`              |
| `%R`         | Эквивалентно &quot;%H:%M&quot;                                                                                                                                                                              | `18:32`                    |
| `%T`         | Эквивалентно «%H:%M:%S» (формат времени ISO 8601)                                                                                                                                                           | `18:32:07`                 |
| `%p`         | Локализованное обозначение a.m./p.m. (зависит от локали)                                                                                                                                                    | `PM`                       |
| `%z`         | Смещение от UTC в формате ISO 8601 (например, -0430) или пустая строка, если сведения о часовом поясе недоступны                                                                                            | `+0800`                    |
| `%Z`         | Локализованное название или аббревиатура часового пояса, либо пустая строка, если информация о часовом поясе недоступна                                                                                     | `Z AWST `                  |

**Пример**

```xml
<logger>
    <level>trace</level>
    <log>/var/log/clickhouse-server/clickhouse-server-%F-%T.log</log>
    <errorlog>/var/log/clickhouse-server/clickhouse-server-%F-%T.err.log</errorlog>
    <size>1000M</size>
    <count>10</count>
    <stream_compress>true</stream_compress>
</logger>
```

Чтобы выводить лог‑сообщения только в консоль:

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**Переопределения по уровням**

Можно переопределить уровень логирования для отдельных логгеров. Например, чтобы отключить все сообщения логгеров &quot;Backup&quot; и &quot;RBAC&quot;.

```xml
<logger>
    <levels>
        <logger>
            <name>Backup</name>
            <level>none</level>
        </logger>
        <logger>
            <name>RBAC</name>
            <level>none</level>
        </logger>
    </levels>
</logger>
```

**syslog**

Чтобы дополнительно отправлять журнальные сообщения в syslog:

```xml
<logger>
    <use_syslog>1</use_syslog>
    <syslog>
        <address>syslog.remote:10514</address>
        <hostname>myhost.local</hostname>
        <facility>LOG_LOCAL6</facility>
        <format>syslog</format>
    </syslog>
</logger>
```

Keys for `<syslog>`:

| Key        | Description                                                                                                                                                                                                                                                                   |
| ---------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `address`  | Адрес сервера syslog в формате `host\[:port\]`. Если не указан, используется локальный демон.                                                                                                                                                                                 |
| `hostname` | Имя хоста, с которого отправляются логи (необязательный параметр).                                                                                                                                                                                                            |
| `facility` | [Ключевое слово facility](https://en.wikipedia.org/wiki/Syslog#Facility) для syslog. Должно быть указано в верхнем регистре с префиксом `LOG_`, например: `LOG_USER`, `LOG_DAEMON`, `LOG_LOCAL3` и т. д. По умолчанию: `LOG_USER`, если указан `address`, иначе `LOG_DAEMON`. |
| `format`   | Формат лог-сообщений. Возможные значения: `bsd` и `syslog`.                                                                                                                                                                                                                   |

**Форматы логов**

Вы можете указать формат логов, который будет выводиться в консоль. В настоящее время поддерживается только JSON.

**Пример**

Ниже приведён пример выходного JSON-лога:

```json
{
  "date_time_utc": "2024-11-06T09:06:09Z",
  "date_time": "1650918987.180175",
  "thread_name": "#1",
  "thread_id": "254545",
  "level": "Trace",
  "query_id": "",
  "logger_name": "BaseDaemon",
  "message": "Получен сигнал 2",
  "source_file": "../base/daemon/BaseDaemon.cpp; virtual void SignalListener::run()",
  "source_line": "192"
}
```

Чтобы включить логирование в формате JSON, используйте следующий фрагмент:

```xml
<logger>
    <formatting>
        <type>json</type>
        <!-- Может быть настроено для каждого канала (log, errorlog, console, syslog) или глобально для всех каналов (тогда просто опустите этот параметр). -->
        <!-- <channel></channel> -->
        <names>
            <date_time>date_time</date_time>
            <thread_name>thread_name</thread_name>
            <thread_id>thread_id</thread_id>
            <level>level</level>
            <query_id>query_id</query_id>
            <logger_name>logger_name</logger_name>
            <message>message</message>
            <source_file>source_file</source_file>
            <source_line>source_line</source_line>
        </names>
    </formatting>
</logger>
```

**Переименование ключей JSON‑логов**

Имена ключей можно изменить, задав другие значения тегов внутри тега `<names>`. Например, чтобы заменить `DATE_TIME` на `MY_DATE_TIME`, можно использовать `<date_time>MY_DATE_TIME</date_time>`.

**Пропуск ключей JSON‑логов**

Свойства лога можно опустить, закомментировав соответствующее свойство. Например, если вы не хотите, чтобы в логе выводился `query_id`, вы можете закомментировать тег `<query_id>`.

## send&#95;crash&#95;reports {#send_crash_reports}

Настройки отправки отчётов о сбоях команде разработчиков ядра ClickHouse.

Включение этой функции, особенно в предпродакшн-средах, крайне приветствуется.

Ключи:

| Key                   | Description                                                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`             | Логический флаг для включения функции, по умолчанию `true`. Установите `false`, чтобы запретить отправку отчётов о сбоях.                         |
| `send_logical_errors` | `LOGICAL_ERROR` похож на `assert`: это ошибка (баг) в ClickHouse. Этот логический флаг включает отправку таких исключений (по умолчанию: `true`). |
| `endpoint`            | Позволяет переопределить URL конечной точки для отправки отчётов о сбоях.                                                                         |

**Рекомендуемое использование**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```

## ssh&#95;server {#ssh_server}

Публичная часть ключа хоста будет записана в файл known&#95;hosts
на стороне SSH-клиента при первом подключении.

Параметры ключа хоста по умолчанию отключены.
Раскомментируйте параметры ключа хоста и укажите путь к соответствующему ssh-ключу, чтобы их активировать:

Пример:

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```

## tcp&#95;ssh&#95;port {#tcp_ssh_port}

Порт SSH-сервера, позволяющий пользователю подключаться и выполнять запросы в интерактивном режиме с помощью встроенного клиента через PTY.

Пример:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```

## storage&#95;configuration {#storage_configuration}

Поддерживает многодисковую конфигурацию хранилища.

Конфигурация хранилища имеет следующую структуру:

```xml
<storage_configuration>
    <disks>
        <!-- конфигурация -->
    </disks>
    <policies>
        <!-- конфигурация -->
    </policies>
</storage_configuration>
```

### Конфигурация дисков {#configuration-of-disks}

Конфигурация раздела `disks` имеет следующую структуру:

```xml
<storage_configuration>
    <disks>
        <disk_name_1>
            <path>/mnt/fast_ssd/clickhouse/</path>
        </disk_name_1>
        <disk_name_2>
            <path>/mnt/hdd1/clickhouse/</path>
            <keep_free_space_bytes>10485760</keep_free_space_bytes>
        </disk_name_2>
        <disk_name_3>
            <path>/mnt/hdd2/clickhouse/</path>
            <keep_free_space_bytes>10485760</keep_free_space_bytes>
        </disk_name_3>
        ...
    </disks>
</storage_configuration>
```

Вложенные теги выше определяют следующие настройки для `disks`:

| Параметр                | Описание                                                                                                        |
| ----------------------- | --------------------------------------------------------------------------------------------------------------- |
| `<disk_name_N>`         | Имя диска, которое должно быть уникальным.                                                                      |
| `path`                  | Путь, по которому будут храниться данные сервера (каталоги `data` и `shadow`). Должен оканчиваться символом `/` |
| `keep_free_space_bytes` | Размер зарезервированного свободного пространства на диске.                                                     |

:::note
Порядок дисков не имеет значения.
:::

### Конфигурация политик {#configuration-of-policies}

Вложенные теги выше определяют следующие настройки для `policies`:

| Setting                      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`              | Имя политики. Имена политик должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `volume_name_N`              | Имя тома. Имена томов должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `disk`                       | Диск, расположенный внутри тома.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `max_data_part_size_bytes`   | Максимальный размер части данных, которая может находиться на любом из дисков в этом томе. Если результат слияния приводит к тому, что ожидаемый размер части превышает `max_data_part_size_bytes`, эта часть будет записана в следующий том. По сути, эта возможность позволяет хранить новые / небольшие части на «горячем» томе (SSD) и перемещать их на «холодный» том (HDD), когда они достигают большого размера. Не используйте эту опцию, если в политике только один том.                        |
| `move_factor`                | Доля доступного свободного пространства на томе. Если свободного места становится меньше, данные начинают переноситься на следующий том, если он существует. Для переноса части сортируются по размеру от большей к меньшей (по убыванию) и выбираются те части, суммарный размер которых достаточен для выполнения условия `move_factor`; если суммарный размер всех частей недостаточен, будут перенесены все части.                                                                                                  |
| `perform_ttl_move_on_insert` | Отключает перенос данных с истекшим TTL при вставке. По умолчанию (если включено), если вставляется фрагмент данных, срок жизни которого уже истёк согласно правилу переноса по времени жизни, он немедленно переносится в том / на диск, указанный в правиле переноса. Это может существенно замедлить вставку, если целевой том / диск медленный (например, S3). Если отключено, просроченная часть данных записывается в том по умолчанию и затем сразу переносится в том, указанный в правиле для истекшего TTL. |
| `load_balancing`             | Политика балансировки дисков: `round_robin` или `least_used`.                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `least_used_ttl_ms`          | Устанавливает тайм-аут (в миллисекундах) обновления доступного пространства на всех дисках (`0` — всегда обновлять, `-1` — никогда не обновлять, значение по умолчанию — `60000`). Обратите внимание: если диск используется только ClickHouse и не будет подвергаться «на лету» изменению размера файловой системы, вы можете использовать значение `-1`. Во всех остальных случаях это не рекомендуется, так как в итоге приведёт к некорректному распределению пространства.                      |
| `prefer_not_to_merge`        | Отключает слияние частей данных на этом томе. Примечание: это потенциально вредно и может вызывать замедление. При включении этого параметра (не делайте так) слияние данных на этом томе запрещено (что плохо). Это позволяет управлять тем, как ClickHouse работает с медленными дисками. Мы рекомендуем вообще не использовать этот параметр.                                                                                                                                                          |
| `volume_priority`            | Определяет приоритет (порядок), в котором заполняются тома. Чем меньше значение, тем выше приоритет. Значения параметра должны быть натуральными числами и непрерывно покрывать диапазон от 1 до N (N — наибольшее указанное значение параметра) без пропусков.                                                                                                                                                                                                                                                 |

Для `volume_priority`:
- Если у всех томов задан этот параметр, они получают приоритет в указанном порядке.
- Если он есть только у _некоторых_ томов, тома без него имеют наименьший приоритет. Тома, у которых параметр задан, получают приоритет в соответствии со значением параметра, приоритет остальных определяется их порядком описания в конфигурационном файле относительно друг друга.
- Если _ни одному_ тому этот параметр не задан, их порядок определяется порядком описания в конфигурационном файле.
- Приоритеты томов могут отличаться друг от друга.

## macros {#macros}

Подстановки параметров для реплицируемых таблиц.

Можно опустить, если реплицируемые таблицы не используются.

Подробнее см. раздел [Creating replicated tables](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables).

**Пример**

```xml
<macros incl="macros" optional="true" />
```

## replica&#95;group&#95;name {#replica_group_name}

Имя группы реплик для базы данных Replicated.

Кластер, созданный базой данных Replicated, будет состоять из реплик одной и той же группы.
DDL-запросы будут ожидать только реплики в той же группе.

По умолчанию — пустое значение.

**Пример**

```xml
<replica_group_name>backups</replica_group_name>
```

## remap&#95;executable {#remap_executable}

Настройка для перераспределения памяти под машинный код («text») с использованием больших страниц.

:::note
Эта возможность является экспериментальной.
:::

Пример:

```xml
<remap_executable>false</remap_executable>
```

## max&#95;open&#95;files {#max_open_files}

Максимальное количество открытых файлов.

:::note
Рекомендуем использовать этот параметр в macOS, поскольку функция `getrlimit()` возвращает некорректное значение.
:::

**Пример**

```xml
<max_open_files>262144</max_open_files>
```

## max&#95;session&#95;timeout {#max_session_timeout}

Максимальное время сеанса, в секундах.

Пример:

```xml
<max_session_timeout>3600</max_session_timeout>
```

## merge&#95;tree {#merge_tree}

Тонкая настройка таблиц [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

Для получения более подробной информации см. заголовочный файл MergeTreeSettings.h.

**Пример**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```

## metric&#95;log {#metric_log}

По умолчанию он отключён.

**Включение**

Чтобы вручную включить сбор истории метрик в [`system.metric_log`](../../operations/system-tables/metric_log.md), создайте файл `/etc/clickhouse-server/config.d/metric_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <metric_log>
        <database>system</database>
        <table>metric_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </metric_log>
</clickhouse>
```

**Отключение**

Чтобы отключить параметр `metric_log`, необходимо создать следующий файл `/etc/clickhouse-server/config.d/disable_metric_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />

## replicated&#95;merge&#95;tree {#replicated_merge_tree}

Тонкая настройка для таблиц в [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Этот параметр имеет более высокий приоритет.

Для получения дополнительной информации см. заголовочный файл MergeTreeSettings.h.

**Пример**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```

## opentelemetry&#95;span&#95;log {#opentelemetry_span_log}

Настройки системной таблицы [`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md).

<SystemLogParameters />

Пример:

```xml
<opentelemetry_span_log>
    <engine>
        engine MergeTree
        partition by toYYYYMM(finish_date)
        order by (finish_date, finish_time_us, trace_id)
    </engine>
    <database>system</database>
    <table>opentelemetry_span_log</table>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</opentelemetry_span_log>
```

## openSSL {#openSSL}

Конфигурация SSL для клиента и сервера.

Поддержка SSL реализована с использованием библиотеки `libpoco`. Доступные параметры конфигурации описаны в [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h). Значения по умолчанию можно найти в [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp).

Ключи настроек сервера и клиента:

| Опция                         | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Значение по умолчанию                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| `privateKeyFile`              | Путь к файлу с закрытым ключом PEM-сертификата. В одном файле могут одновременно находиться и ключ, и сертификат.                                                                                                                                                                                                                                                                                                                                                                                                  |                                                                                            |
| `certificateFile`             | Путь к файлу клиентского/серверного сертификата в формате PEM. Можно не указывать, если `privateKeyFile` содержит сертификат.                                                                                                                                                                                                                                                                                                                                                                                      |                                                                                            |
| `caConfig`                    | Путь к файлу или каталогу, содержащему доверенные сертификаты УЦ (CA). Если указан файл, он должен быть в PEM-формате и может содержать несколько сертификатов УЦ. Если указан каталог, он должен содержать по одному файлу с расширением .pem на каждый сертификат УЦ. Имена файлов определяются по хэшу имени субъекта УЦ. Подробности можно найти на странице руководства man для [SSL&#95;CTX&#95;load&#95;verify&#95;locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html). |                                                                                            |
| `verificationMode`            | Метод проверки сертификатов узла. Подробности см. в описании класса [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h). Возможные значения: `none`, `relaxed`, `strict`, `once`.                                                                                                                                                                                                                                                                           | `relaxed`                                                                                  |
| `verificationDepth`           | Максимально допустимая длина цепочки проверки сертификатов. Проверка завершится с ошибкой, если длина цепочки сертификатов превышает заданное значение.                                                                                                                                                                                                                                                                                                                                                            | `9`                                                                                        |
| `loadDefaultCAFile`           | Определяет, будут ли использоваться встроенные сертификаты удостоверяющих центров (CA) для OpenSSL. ClickHouse предполагает, что встроенные сертификаты CA находятся в файле `/etc/ssl/cert.pem` (или в каталоге `/etc/ssl/certs`), либо в файле (или каталоге), заданном переменной окружения `SSL_CERT_FILE` (соответственно, `SSL_CERT_DIR`).                                                                                                                                                                   | `true`                                                                                     |
| `cipherList`                  | Поддерживаемые алгоритмы шифрования OpenSSL.                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`                                                  |
| `cacheSessions`               | Включает или отключает кэширование сеансов. Используется совместно с `sessionIdContext`. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                     | `false`                                                                                    |
| `sessionIdContext`            | Уникальный набор случайных символов, который сервер добавляет к каждому сгенерированному идентификатору. Длина строки не должна превышать `SSL_MAX_SSL_SESSION_ID_LENGTH`. Всегда рекомендуется задавать этот параметр, так как он помогает избежать проблем как в случае, когда сервер кэширует сеанс, так и если клиент запросил кэширование.                                                                                                                                                                    | `$\{application.name\}`                                                                    |
| `sessionCacheSize`            | Максимальное количество сеансов, которые кеширует сервер. Значение `0` означает неограниченное количество сеансов.                                                                                                                                                                                                                                                                                                                                                                                                 | [1024*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978) |
| `sessionTimeout`              | Время хранения сеанса в кэше на сервере (в часах).                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `2`                                                                                        |
| `extendedVerification`        | Если параметр включён, убедитесь, что CN или SAN сертификата совпадает с именем узла-пира.                                                                                                                                                                                                                                                                                                                                                                                                                         | `false`                                                                                    |
| `requireTLSv1`                | Требовать соединение по протоколу TLSv1. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                     | `false`                                                                                    |
| `requireTLSv1_1`              | Требовать установления соединения по TLSv1.1. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                | `false`                                                                                    |
| `requireTLSv1_2`              | Требовать соединение по TLSv1.2. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                                                             | `false`                                                                                    |
| `fips`                        | Активирует режим OpenSSL FIPS. Поддерживается, если версия OpenSSL, используемая библиотекой, поддерживает FIPS.                                                                                                                                                                                                                                                                                                                                                                                                   | `false`                                                                                    |
| `privateKeyPassphraseHandler` | Класс (подкласс PrivateKeyPassphraseHandler), предназначенный для запроса парольной фразы для доступа к закрытому ключу. Например: `<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`.                                                                                                                                                                                                                               | `KeyConsoleHandler`                                                                        |
| `invalidCertificateHandler`   | Класс (подкласс CertificateHandler) для обработки недействительных сертификатов. Например: `<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>` .                                                                                                                                                                                                                                                                                                                      | `RejectCertificateHandler`                                                                 |
| `disableProtocols`            | Протоколы, которые запрещено использовать.                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |                                                                                            |
| `preferServerCiphers`         | Серверные шифры по выбору клиента.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | `false`                                                                                    |

**Пример настроек:**

```xml
<openSSL>
    <server>
        <!-- openssl req -subj "/CN=localhost" -new -newkey rsa:2048 -days 365 -nodes -x509 -keyout /etc/clickhouse-server/server.key -out /etc/clickhouse-server/server.crt -->
        <certificateFile>/etc/clickhouse-server/server.crt</certificateFile>
        <privateKeyFile>/etc/clickhouse-server/server.key</privateKeyFile>
        <!-- openssl dhparam -out /etc/clickhouse-server/dhparam.pem 4096 -->
        <dhParamsFile>/etc/clickhouse-server/dhparam.pem</dhParamsFile>
        <verificationMode>none</verificationMode>
        <loadDefaultCAFile>true</loadDefaultCAFile>
        <cacheSessions>true</cacheSessions>
        <disableProtocols>sslv2,sslv3</disableProtocols>
        <preferServerCiphers>true</preferServerCiphers>
    </server>
    <client>
        <loadDefaultCAFile>true</loadDefaultCAFile>
        <cacheSessions>true</cacheSessions>
        <disableProtocols>sslv2,sslv3</disableProtocols>
        <preferServerCiphers>true</preferServerCiphers>
        <!-- Для самоподписанных сертификатов: <verificationMode>none</verificationMode> -->
        <invalidCertificateHandler>
            <!-- Для самоподписанных сертификатов: <name>AcceptCertificateHandler</name> -->
            <name>RejectCertificateHandler</name>
        </invalidCertificateHandler>
    </client>
</openSSL>
```

## part&#95;log {#part_log}

Логирование событий, связанных с [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md), например добавления или слияния данных. Вы можете использовать журнал для моделирования алгоритмов слияния и сравнения их характеристик, а также для визуализации процесса слияния.

Запросы логируются в таблицу [system.part&#95;log](/operations/system-tables/part_log), а не в отдельный файл. Имя этой таблицы можно настроить с помощью параметра `table` (см. ниже).

<SystemLogParameters />

**Пример**

```xml
<part_log>
    <database>system</database>
    <table>part_log</table>
    <partition_by>toMonday(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</part_log>
```

## path {#path}

Путь к каталогу, содержащему данные.

:::note
Обязателен завершающий слэш.
:::

**Пример**

```xml
<path>/var/lib/clickhouse/</path>
```

## processors&#95;profile&#95;log {#processors_profile_log}

Настройки для системной таблицы [`processors_profile_log`](../system-tables/processors_profile_log.md).

<SystemLogParameters />

Параметры по умолчанию:

```xml
<processors_profile_log>
    <database>system</database>
    <table>processors_profile_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</processors_profile_log>
```

## prometheus {#prometheus}

Экспорт метрик для опроса из [Prometheus](https://prometheus.io).

Параметры:

* `endpoint` – HTTP-эндпоинт для сбора метрик сервером Prometheus. Должен начинаться с &#39;/&#39;.
* `port` – Порт для `endpoint`.
* `metrics` – Экспорт метрик из таблицы [system.metrics](/operations/system-tables/metrics).
* `events` – Экспорт метрик из таблицы [system.events](/operations/system-tables/events).
* `asynchronous_metrics` – Экспорт текущих значений метрик из таблицы [system.asynchronous&#95;metrics](/operations/system-tables/asynchronous_metrics).
* `errors` – Экспорт количества ошибок по кодам ошибок, произошедших с момента последнего перезапуска сервера. Эту информацию можно также получить из таблицы [system.errors](/operations/system-tables/errors).

**Пример**

```xml
<clickhouse>
    <listen_host>0.0.0.0</listen_host>
    <http_port>8123</http_port>
    <tcp_port>9000</tcp_port>
    <!-- highlight-start -->
    <prometheus>
        <endpoint>/metrics</endpoint>
        <port>9363</port>
        <metrics>true</metrics>
        <events>true</events>
        <asynchronous_metrics>true</asynchronous_metrics>
        <errors>true</errors>
    </prometheus>
    <!-- highlight-end -->
</clickhouse>
```

Проверьте (замените `127.0.0.1` на IP-адрес или имя хоста вашего сервера ClickHouse):

```bash
curl 127.0.0.1:9363/metrics
```

## query&#95;log {#query_log}

Настройка для логирования запросов при включённой опции [log&#95;queries=1](../../operations/settings/settings.md).

Запросы логируются в таблицу [system.query&#95;log](/operations/system-tables/query_log), а не в отдельный файл. Имя таблицы можно изменить с помощью параметра `table` (см. ниже).

<SystemLogParameters />

Если таблица не существует, ClickHouse создаст её. Если структура журнала запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой будет переименована, а новая таблица будет создана автоматически.

**Пример**

```xml
<query_log>
    <database>system</database>
    <table>query_log</table>
    <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</query_log>
```

## query&#95;metric&#95;log {#query_metric_log}

По умолчанию он отключён.

**Включение**

Чтобы вручную включить сбор истории метрик [`system.query_metric_log`](../../operations/system-tables/query_metric_log.md), создайте файл `/etc/clickhouse-server/config.d/query_metric_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <query_metric_log>
        <database>system</database>
        <table>query_metric_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </query_metric_log>
</clickhouse>
```

**Отключение**

Чтобы отключить настройку `query_metric_log`, необходимо создать файл `/etc/clickhouse-server/config.d/disable_query_metric_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />

## query&#95;cache {#query_cache}

Конфигурация [кеша запросов](../query-cache.md).

Доступны следующие настройки:

| Setting                   | Description                                                                                         | Default Value |
| ------------------------- | --------------------------------------------------------------------------------------------------- | ------------- |
| `max_size_in_bytes`       | Максимальный размер кеша в байтах. Значение `0` означает, что кеш запросов отключён.                | `1073741824`  |
| `max_entries`             | Максимальное количество результатов запросов `SELECT`, хранящихся в кеше.                           | `1024`        |
| `max_entry_size_in_bytes` | Максимальный размер в байтах результатов запросов `SELECT`, которые могут быть сохранены в кеше.    | `1048576`     |
| `max_entry_size_in_rows`  | Максимальное количество строк в результатах запросов `SELECT`, которые могут быть сохранены в кеше. | `30000000`    |

:::note

* Изменённые настройки вступают в силу немедленно.
* Данные для кеша запросов размещаются в DRAM. Если объём памяти ограничен, установите небольшое значение `max_size_in_bytes` или полностью отключите кеш запросов.
  :::

**Пример**

```xml
<query_cache>
    <max_size_in_bytes>1073741824</max_size_in_bytes>
    <max_entries>1024</max_entries>
    <max_entry_size_in_bytes>1048576</max_entry_size_in_bytes>
    <max_entry_size_in_rows>30000000</max_entry_size_in_rows>
</query_cache>
```

## query&#95;thread&#95;log {#query_thread_log}

Настройка параметров логирования потоков запросов, включаемого параметром [log&#95;query&#95;threads=1](/operations/settings/settings#log_query_threads).

Запросы логируются в таблицу [system.query&#95;thread&#95;log](/operations/system-tables/query_thread_log), а не в отдельный файл. Имя таблицы можно изменить в параметре `table` (см. ниже).

<SystemLogParameters />

Если таблица не существует, ClickHouse создаст её. Если структура журнала потоков запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой переименовывается, и новая таблица создаётся автоматически.

**Пример**

```xml
<query_thread_log>
    <database>system</database>
    <table>query_thread_log</table>
    <partition_by>toMonday(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</query_thread_log>
```

## query&#95;views&#95;log {#query_views_log}

Настройка для логирования представлений (live, materialized и т. д.), зависящая от запросов, выполняемых при включённой настройке [log&#95;query&#95;views=1](/operations/settings/settings#log_query_views).

Запросы записываются в таблицу [system.query&#95;views&#95;log](/operations/system-tables/query_views_log), а не в отдельный файл. Вы можете изменить имя таблицы с помощью параметра `table` (см. ниже).

<SystemLogParameters />

Если таблицы не существует, ClickHouse создаст её. Если структура журнала представлений запросов изменилась после обновления сервера ClickHouse, таблица со старой структурой будет переименована, а новая таблица будет создана автоматически.

**Пример**

```xml
<query_views_log>
    <database>system</database>
    <table>query_views_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</query_views_log>
```

## text&#95;log {#text_log}

Настройки системной таблицы [text&#95;log](/operations/system-tables/text_log) для журналирования текстовых сообщений.

<SystemLogParameters />

Дополнительно:

| Параметр | Описание                                                                                    | Значение по умолчанию |
| -------- | ------------------------------------------------------------------------------------------- | --------------------- |
| `level`  | Максимальный уровень сообщений (по умолчанию `Trace`), которые будут сохраняться в таблице. | `Trace`               |

**Пример**

```xml
<clickhouse>
    <text_log>
        <level>notice</level>
        <database>system</database>
        <table>text_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
        <!-- <partition_by>event_date</partition_by> -->
        <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine>
    </text_log>
</clickhouse>
```

## trace&#95;log {#trace_log}

Параметры системной таблицы [trace&#95;log](/operations/system-tables/trace_log).

<SystemLogParameters />

Конфигурационный файл сервера по умолчанию `config.xml` содержит следующий раздел настроек:

```xml
<trace_log>
    <database>system</database>
    <table>trace_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1048576</max_size_rows>
    <reserved_size_rows>8192</reserved_size_rows>
    <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
    <symbolize>false</symbolize>
</trace_log>
```

## asynchronous&#95;insert&#95;log {#asynchronous_insert_log}

Параметры системной таблицы [asynchronous&#95;insert&#95;log](/operations/system-tables/asynchronous_insert_log), отвечающей за журналирование асинхронных вставок.

<SystemLogParameters />

**Пример**

```xml
<clickhouse>
    <asynchronous_insert_log>
        <database>system</database>
        <table>asynchronous_insert_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <partition_by>toYYYYMM(event_date)</partition_by>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
        <!-- <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine> -->
    </asynchronous_insert_log>
</clickhouse>
```

## crash&#95;log {#crash_log}

Настройки для работы системной таблицы [crash&#95;log](../../operations/system-tables/crash_log.md).

Следующие настройки могут быть заданы с помощью подтегов:

| Setting                            | Description                                                                                                                                                         | Default             | Note                                                                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `database`                         | Имя базы данных.                                                                                                                                                    |                     |                                                                                                                           |
| `table`                            | Имя системной таблицы.                                                                                                                                              |                     |                                                                                                                           |
| `engine`                           | [Определение движка MergeTree](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-creating-a-table) для системной таблицы.                    |                     | Нельзя использовать, если определены `partition_by` или `order_by`. Если не указано, по умолчанию выбирается `MergeTree`. |
| `partition_by`                     | [Пользовательский ключ партиционирования](/engines/table-engines/mergetree-family/custom-partitioning-key.md) для системной таблицы.                                |                     | Если для системной таблицы указан `engine`, параметр `partition_by` должен быть указан непосредственно внутри `engine`.   |
| `ttl`                              | Задает [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) таблицы.                                                                 |                     | Если для системной таблицы указан `engine`, параметр `ttl` должен быть указан непосредственно внутри `engine`.            |
| `order_by`                         | [Пользовательский ключ сортировки](/engines/table-engines/mergetree-family/mergetree#order_by) для системной таблицы. Нельзя использовать, если определен `engine`. |                     | Если для системной таблицы указан `engine`, параметр `order_by` должен быть указан непосредственно внутри `engine`.       |
| `storage_policy`                   | Имя политики хранения, используемой для таблицы (необязательно).                                                                                                    |                     | Если для системной таблицы указан `engine`, параметр `storage_policy` должен быть указан непосредственно внутри `engine`. |
| `settings`                         | [Дополнительные параметры](/engines/table-engines/mergetree-family/mergetree/#settings), управляющие поведением MergeTree (необязательно).                          |                     | Если для системной таблицы указан `engine`, параметр `settings` должен быть указан непосредственно внутри `engine`.       |
| `flush_interval_milliseconds`      | Интервал сброса данных из буфера в памяти в таблицу.                                                                                                                | `7500`              |                                                                                                                           |
| `max_size_rows`                    | Максимальный размер логов в строках. Когда количество несброшенных логов достигает `max_size_rows`, логи сбрасываются на диск.                                      | `1024`              |                                                                                                                           |
| `reserved_size_rows`               | Предварительно выделенный объем памяти в строках для логов.                                                                                                         | `1024`              |                                                                                                                           |
| `buffer_size_rows_flush_threshold` | Порог по количеству строк. Если порог достигнут, в фоновом режиме запускается сброс логов на диск.                                                                  | `max_size_rows / 2` |                                                                                                                           |
| `flush_on_crash`                   | Определяет, должны ли логи сбрасываться на диск в случае сбоя.                                                                                                      | `false`             |                                                                                                                           |

Файл конфигурации сервера по умолчанию `config.xml` содержит следующий раздел настроек:

```xml
<crash_log>
    <database>system</database>
    <table>crash_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <max_size_rows>1024</max_size_rows>
    <reserved_size_rows>1024</reserved_size_rows>
    <buffer_size_rows_flush_threshold>512</buffer_size_rows_flush_threshold>
    <flush_on_crash>false</flush_on_crash>
</crash_log>
```

## custom&#95;cached&#95;disks&#95;base&#95;directory {#custom_cached_disks_base_directory}

Этот параметр задает путь к кэшу для пользовательских дисков (созданных через SQL).
`custom_cached_disks_base_directory` имеет более высокий приоритет для пользовательских дисков по сравнению с `filesystem_caches_path` (указанным в `filesystem_caches_path.xml`),
который используется, если первая настройка отсутствует.
Путь, заданный в настройке файлового кэша, должен находиться внутри этого каталога,
в противном случае будет выброшено исключение, предотвращающее создание диска.

:::note
Это не влияет на диски, созданные в более старой версии, с которой был обновлен сервер.
В этом случае исключение выброшено не будет, чтобы сервер смог успешно запуститься.
:::

Пример:

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```

## backup&#95;log {#backup_log}

Настройки системной таблицы [backup&#95;log](../../operations/system-tables/backup_log.md) для ведения журнала операций `BACKUP` и `RESTORE`.

<SystemLogParameters />

**Пример**

```xml
<clickhouse>
    <backup_log>
        <database>system</database>
        <table>backup_log</table>
        <flush_interval_milliseconds>1000</flush_interval_milliseconds>
        <partition_by>toYYYYMM(event_date)</partition_by>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
        <!-- <engine>Engine = MergeTree PARTITION BY event_date ORDER BY event_time TTL event_date + INTERVAL 30 day</engine> -->
    </backup_log>
</clickhouse>
```

## blob&#95;storage&#95;log {#blob_storage_log}

Параметры системной таблицы [`blob_storage_log`](../system-tables/blob_storage_log.md).

<SystemLogParameters />

Пример:

```xml
<blob_storage_log>
    <database>system</database
    <table>blob_storage_log</table
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds
    <ttl>event_date + INTERVAL 30 DAY</ttl>
</blob_storage_log>
```

## query&#95;masking&#95;rules {#query_masking_rules}

Правила на основе регулярных выражений, которые применяются к запросам, а также ко всем сообщениям журнала перед их сохранением в серверные логи,
таблицы [`system.query_log`](/operations/system-tables/query_log), [`system.text_log`](/operations/system-tables/text_log), [`system.processes`](/operations/system-tables/processes) и в логи, отправляемые клиенту. Это позволяет предотвратить утечку конфиденциальных данных из SQL-запросов, таких как имена, адреса электронной почты, персональные идентификаторы или номера кредитных карт, в журналы.

**Пример**

```xml
<query_masking_rules>
    <rule>
        <name>скрыть номер SSN</name>
        <regexp>(^|\D)\d{3}-\d{2}-\d{4}($|\D)</regexp>
        <replace>000-00-0000</replace>
    </rule>
</query_masking_rules>
```

**Поля конфигурации**:

| Setting   | Description                                                                                  |
| --------- | -------------------------------------------------------------------------------------------- |
| `name`    | имя правила (необязательно)                                                                  |
| `regexp`  | регулярное выражение, совместимое с RE2 (обязательно)                                        |
| `replace` | строка подстановки для чувствительных данных (необязательно, по умолчанию — шесть звездочек) |

Правила маскирования применяются ко всему запросу (чтобы предотвратить утечки чувствительных данных из некорректных / неразбираемых запросов).

В таблице [`system.events`](/operations/system-tables/events) есть счётчик `QueryMaskingRulesMatch`, который показывает общее количество срабатываний правил маскирования запросов.

Для распределённых запросов каждый сервер должен быть настроен отдельно, иначе подзапросы, передаваемые на другие узлы, будут сохраняться без маскирования.

## remote&#95;servers {#remote_servers}

Конфигурация кластеров, используемых движком таблиц [Distributed](../../engines/table-engines/special/distributed.md) и табличной функцией `cluster`.

**Пример**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

Сведения о значении атрибута `incl` см. в разделе «[Файлы конфигурации](/operations/configuration-files)».

**См. также**

* [skip&#95;unavailable&#95;shards](../../operations/settings/settings.md#skip_unavailable_shards)
* [Обнаружение кластеров](../../operations/cluster-discovery.md)
* [Движок реплицируемой базы данных](../../engines/database-engines/replicated.md)

## remote&#95;url&#95;allow&#95;hosts {#remote_url_allow_hosts}

Список хостов, которые разрешено использовать в движках хранения и табличных функциях, работающих с URL.

При добавлении хоста с помощью XML-тега `\<host\>`:

* он должен быть указан в точности так же, как в URL, поскольку имя проверяется до разрешения DNS-имени. Например: `<host>clickhouse.com</host>`
* если порт явно указан в URL, то host:port проверяется как единое целое. Например: `<host>clickhouse.com:80</host>`
* если хост указан без порта, то разрешён любой порт этого хоста. Например: если указан `<host>clickhouse.com</host>`, то `clickhouse.com:20` (FTP), `clickhouse.com:80` (HTTP), `clickhouse.com:443` (HTTPS) и т. д. разрешены.
* если хост указан как IP-адрес, то он проверяется так, как указан в URL. Например: `[2a02:6b8:a::a]`.
* если есть перенаправления и поддержка перенаправлений включена, то каждое перенаправление (заголовок Location) проверяется.

Например:

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```

## timezone {#timezone}

Часовой пояс сервера.

Указывается как идентификатор IANA для часового пояса UTC или географического региона (например, Africa/Abidjan).

Часовой пояс необходим для преобразований между форматами String и DateTime, когда поля DateTime выводятся в текстовый формат (на экран или в файл), а также при получении значения DateTime из строки. Кроме того, часовой пояс используется в функциях, которые работают с датой и временем, если часовой пояс не был передан во входных параметрах.

**Пример**

```xml
<timezone>Asia/Istanbul</timezone>
```

**См. также**

* [session&#95;timezone](../settings/settings.md#session_timezone)

## tcp&#95;port {#tcp_port}

Порт для взаимодействия с клиентами по протоколу TCP.

**Пример**

```xml
<tcp_port>9000</tcp_port>
```

## tcp&#95;port&#95;secure {#tcp_port_secure}

TCP-порт для защищённого взаимодействия с клиентами. Используйте его вместе с настройками [OpenSSL](#openssl).

**Значение по умолчанию**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```

## mysql&#95;port {#mysql_port}

Порт для взаимодействия с клиентами по протоколу MySQL.

:::note

* Положительные целые значения задают номер порта для прослушивания.
* Пустое значение используется для отключения взаимодействия с клиентами по протоколу MySQL.
  :::

**Пример**

```xml
<mysql_port>9004</mysql_port>
```

## postgresql&#95;port {#postgresql_port}

Порт для взаимодействия с клиентами по протоколу PostgreSQL.

:::note

* Положительные целые числа задают номер порта, который необходимо прослушивать.
* Пустые значения используются, чтобы отключить взаимодействие с клиентами по протоколу PostgreSQL.
  :::

**Пример**

```xml
<postgresql_port>9005</postgresql_port>
```

## mysql_require_secure_transport {#mysql_require_secure_transport}

Если параметр установлен в значение true, при взаимодействии с клиентами через [mysql_port](#mysql_port) требуется защищённое соединение. Подключения с опцией `--ssl-mode=none` будут отклоняться. Используйте вместе с настройками [OpenSSL](#openssl).

## postgresql_require_secure_transport {#postgresql_require_secure_transport}

Если установлено значение true, для клиентов через [postgresql_port](#postgresql_port) требуется защищённое соединение. Соединения с опцией `sslmode=disable` будут отклоняться. Используйте вместе с настройками [OpenSSL](#openssl).

## tmp&#95;path {#tmp_path}

Путь в локальной файловой системе для хранения временных данных при обработке больших запросов.

:::note

* Для настройки хранилища временных данных можно использовать только один из параметров: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
* Конечный слэш (/) обязателен.
  :::

**Пример**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```

## url&#95;scheme&#95;mappers {#url_scheme_mappers}

Настройка преобразования сокращённых или символических URL-префиксов в полные URL.

Пример:

```xml
<url_scheme_mappers>
    <s3>
        <to>https://{bucket}.s3.amazonaws.com</to>
    </s3>
    <gs>
        <to>https://storage.googleapis.com/{bucket}</to>
    </gs>
    <oss>
        <to>https://{bucket}.oss.aliyuncs.com</to>
    </oss>
</url_scheme_mappers>
```

## user&#95;files&#95;path {#user_files_path}

Каталог пользовательских файлов. Используется в табличных функциях [file()](../../sql-reference/table-functions/file.md) и [fileCluster()](../../sql-reference/table-functions/fileCluster.md).

**Пример**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```

## user&#95;scripts&#95;path {#user_scripts_path}

Каталог, содержащий файлы пользовательских скриптов. Используется для исполняемых пользовательских функций [Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions).

**Пример**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

Тип:

Значение по умолчанию:

## user&#95;defined&#95;path {#user_defined_path}

Каталог с пользовательскими файлами. Используется для пользовательских SQL-функций [SQL User Defined Functions](/sql-reference/functions/udf).

**Пример**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```

## users&#95;config {#users_config}

Путь к файлу, содержащему:

* Конфигурации пользователей.
* Права доступа.
* Профили настроек.
* Настройки квот.

**Пример**

```xml
<users_config>users.xml</users_config>
```

## access&#95;control&#95;improvements {#access_control_improvements}

Настройки для дополнительных (необязательных) улучшений в системе управления доступом.

| Setting                                         | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Default |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `users_without_row_policies_can_read_rows`      | Определяет, могут ли пользователи без разрешающих политик по строкам читать строки с помощью запроса `SELECT`. Например, если есть два пользователя A и B, и политика по строкам определена только для A, то при значении параметра `true` пользователь B увидит все строки. При значении `false` пользователь B не увидит ни одной строки.                                                                                                                                                                                                                                      | `true`  |
| `on_cluster_queries_require_cluster_grant`      | Определяет, требуется ли для запросов с `ON CLUSTER` привилегия `CLUSTER`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | `true`  |
| `select_from_system_db_requires_grant`          | Определяет, требует ли запрос `SELECT * FROM system.<table>` каких-либо прав и может ли он выполняться любым пользователем. Если установлено значение `true`, этот запрос требует `GRANT SELECT ON system.<table>` так же, как и для несистемных таблиц. Исключения: несколько системных таблиц (`tables`, `columns`, `databases` и некоторые константные таблицы, такие как `one`, `contributors`) остаются доступными для всех; кроме того, если выдана привилегия `SHOW` (например, `SHOW USERS`), соответствующая системная таблица (то есть `system.users`) будет доступна. | `true`  |
| `select_from_information_schema_requires_grant` | Определяет, требует ли запрос `SELECT * FROM information_schema.<table>` каких-либо прав и может ли он выполняться любым пользователем. Если установлено значение `true`, этот запрос требует `GRANT SELECT ON information_schema.<table>` так же, как и для обычных таблиц.                                                                                                                                                                                                                                                                                                     | `true`  |
| `settings_constraints_replace_previous`         | Определяет, будет ли ограничение в профиле настроек для некоторой настройки отменять действие предыдущего ограничения (определённого в других профилях) для этой настройки, включая поля, которые не заданы новым ограничением. Также включает тип ограничения `changeable_in_readonly`.                                                                                                                                                                                                                                                                                         | `true`  |
| `table_engines_require_grant`                   | Определяет, требуется ли привилегия для создания таблицы с конкретным движком таблицы.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | `false` |
| `role_cache_expiration_time_seconds`            | Определяет количество секунд с момента последнего доступа, в течение которых роль хранится в кэше ролей (Role Cache).                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `600`   |

Пример:

```xml
<access_control_improvements>
    <users_without_row_policies_can_read_rows>true</users_without_row_policies_can_read_rows>
    <on_cluster_queries_require_cluster_grant>true</on_cluster_queries_require_cluster_grant>
    <select_from_system_db_requires_grant>true</select_from_system_db_requires_grant>
    <select_from_information_schema_requires_grant>true</select_from_information_schema_requires_grant>
    <settings_constraints_replace_previous>true</settings_constraints_replace_previous>
    <table_engines_require_grant>false</table_engines_require_grant>
    <role_cache_expiration_time_seconds>600</role_cache_expiration_time_seconds>
</access_control_improvements>
```

## s3queue&#95;log {#s3queue_log}

Настройки системной таблицы `s3queue_log`.

<SystemLogParameters />

Настройки по умолчанию следующие:

```xml
<s3queue_log>
    <database>system</database>
    <table>s3queue_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</s3queue_log>
```

## dead&#95;letter&#95;queue {#dead_letter_queue}

Настройка системной таблицы &#39;dead&#95;letter&#95;queue&#39;.

<SystemLogParameters />

Параметры по умолчанию:

```xml
<dead_letter_queue>
    <database>system</database>
    <table>dead_letter</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</dead_letter_queue>
```

## zookeeper {#zookeeper}

Содержит настройки, которые позволяют ClickHouse взаимодействовать с кластером [ZooKeeper](http://zookeeper.apache.org/). ClickHouse использует ZooKeeper для хранения метаданных реплик при использовании реплицируемых таблиц. Если реплицируемые таблицы не используются, этот раздел параметров можно опустить.

Следующие настройки могут быть заданы с помощью подтегов:

| Setting                                    | Description                                                                                                                                                                                                                           |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node`                                     | Конечная точка ZooKeeper. Можно задать несколько endpoints. Например, `<node index="1"><host>example_host</host><port>2181</port></node>`. Атрибут `index` задаёт порядок обхода узлов при попытке подключиться к кластеру ZooKeeper. |
| `session_timeout_ms`                       | Максимальное время ожидания для клиентской сессии в миллисекундах.                                                                                                                                                                    |
| `operation_timeout_ms`                     | Максимальное время ожидания для одной операции в миллисекундах.                                                                                                                                                                       |
| `root` (optional)                          | znode, который используется как корневой для znode, используемых сервером ClickHouse.                                                                                                                                                 |
| `fallback_session_lifetime.min` (optional) | Минимальное ограничение времени жизни сессии ZooKeeper к резервному узлу, когда основной недоступен (балансировка нагрузки). Указывается в секундах. Значение по умолчанию: 3 часа.                                                   |
| `fallback_session_lifetime.max` (optional) | Максимальное ограничение времени жизни сессии ZooKeeper к резервному узлу, когда основной недоступен (балансировка нагрузки). Указывается в секундах. Значение по умолчанию: 6 часов.                                                 |
| `identity` (optional)                      | Имя пользователя и пароль, требуемые ZooKeeper для доступа к запрашиваемым znode.                                                                                                                                                     |
| `use_compression` (optional)               | Включает сжатие в протоколе Keeper, если установлено значение true.                                                                                                                                                                   |

Также существует настройка `zookeeper_load_balancing` (необязательная), которая позволяет выбрать алгоритм выбора узла ZooKeeper:

| Algorithm Name                  | Description                                                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `random`                        | случайным образом выбирает один из узлов ZooKeeper.                                                                 |
| `in_order`                      | выбирает первый узел ZooKeeper, если он недоступен — второй и так далее.                                            |
| `nearest_hostname`              | выбирает узел ZooKeeper с именем хоста, наиболее похожим на имя хоста сервера; имена сравниваются по префиксу.      |
| `hostname_levenshtein_distance` | так же, как `nearest_hostname`, но сравнивает имена хостов по расстоянию Левенштейна.                               |
| `first_or_random`               | выбирает первый узел ZooKeeper, если он недоступен — случайным образом выбирает один из оставшихся узлов ZooKeeper. |
| `round_robin`                   | выбирает первый узел ZooKeeper, при переподключении выбирает следующий.                                             |

**Пример конфигурации**

```xml
<zookeeper>
    <node>
        <host>example1</host>
        <port>2181</port>
    </node>
    <node>
        <host>example2</host>
        <port>2181</port>
    </node>
    <session_timeout_ms>30000</session_timeout_ms>
    <operation_timeout_ms>10000</operation_timeout_ms>
    <!-- Необязательный параметр. Суффикс chroot. Должен существовать. -->
    <root>/path/to/zookeeper/node</root>
    <!-- Необязательный параметр. Строка digest ACL для ZooKeeper. -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**См. также**

* [Репликация](../../engines/table-engines/mergetree-family/replication.md)
* [Руководство программиста ZooKeeper](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
* [Необязательное защищённое взаимодействие между ClickHouse и ZooKeeper](/operations/ssl-zookeeper)

## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper}

Способ хранения заголовков частей данных в ZooKeeper. Этот параметр применяется только к семейству [`MergeTree`](/engines/table-engines/mergetree-family). Его можно задать:

**Глобально в разделе [merge_tree](#merge_tree) файла `config.xml`**

ClickHouse использует этот параметр для всех таблиц на сервере. Вы можете изменить его в любой момент. Поведение существующих таблиц изменится при изменении значения параметра.

**Для каждой таблицы**

При создании таблицы укажите соответствующую [настройку движка](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table). Поведение существующей таблицы с уже заданным значением этого параметра не меняется, даже если глобальная настройка изменена.

**Возможные значения**

- `0` — Функция отключена.
- `1` — Функция включена.

Если [`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper), то [реплицируемые](../../engines/table-engines/mergetree-family/replication.md) таблицы хранят заголовки частей данных компактно, используя один `znode`. Если таблица содержит много столбцов, этот способ хранения значительно уменьшает объём данных, хранимых в ZooKeeper.

:::note
После применения `use_minimalistic_part_header_in_zookeeper = 1` вы не сможете понизить версию сервера ClickHouse до версии, которая не поддерживает этот параметр. Будьте осторожны при обновлении ClickHouse на серверах в кластере. Не обновляйте все серверы одновременно. Безопаснее тестировать новые версии ClickHouse в тестовой среде или только на нескольких серверах кластера.

Заголовки частей данных, уже сохранённые с включённой настройкой, нельзя восстановить в их прежнее (некомпактное) представление.
:::

## distributed&#95;ddl {#distributed_ddl}

Управляет выполнением [распределённых DDL-запросов](../../sql-reference/distributed-ddl.md) (`CREATE`, `DROP`, `ALTER`, `RENAME`) на кластере.
Работает только при включённом [ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper).

Настраиваемые параметры в разделе `<distributed_ddl>` включают:

| Setting                | Description                                                                                                                               | Default Value                          |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `path`                 | путь в Keeper к `task_queue` для DDL-запросов                                                                                             |                                        |
| `profile`              | профиль, используемый для выполнения DDL-запросов                                                                                         |                                        |
| `pool_size`            | сколько запросов `ON CLUSTER` может выполняться одновременно                                                                              |                                        |
| `max_tasks_in_queue`   | максимальное количество задач, которое может находиться в очереди.                                                                        | `1,000`                                |
| `task_max_lifetime`    | удалять узел, если его возраст превышает это значение.                                                                                    | `7 * 24 * 60 * 60` (неделя в секундах) |
| `cleanup_delay_period` | очистка запускается после получения события о новом узле, если с момента последней очистки прошло не менее `cleanup_delay_period` секунд. | `60` секунд                            |

**Пример**

```xml
<distributed_ddl>
    <!-- Путь в ZooKeeper к очереди с DDL-запросами -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- Настройки из этого профиля будут использоваться для выполнения DDL-запросов -->
    <profile>default</profile>

    <!-- Определяет, сколько запросов ON CLUSTER может выполняться одновременно. -->
    <pool_size>1</pool_size>

    <!--
         Настройки очистки (активные задачи не удаляются)
    -->

    <!-- Определяет TTL задачи (по умолчанию 1 неделя) -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- Определяет, как часто выполняется очистка (в секундах) -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- Определяет максимальное количество задач в очереди -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```

## access_control_path {#access_control_path}

Путь к папке, в которой сервер ClickHouse хранит конфигурации пользователей и ролей, созданные SQL-командами.

**См. также**

- [Управление доступом и учетными записями](/operations/access-rights#access-control-usage)

## allow&#95;plaintext&#95;password {#allow_plaintext_password}

Задает, разрешено ли использование небезопасных паролей в открытом виде (plaintext-password).

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```

## allow&#95;no&#95;password {#allow_no_password}

Определяет, допускается ли использование небезопасного типа пароля `no&#95;password`.

```xml
<allow_no_password>1</allow_no_password>
```

## allow&#95;implicit&#95;no&#95;password {#allow_implicit_no_password}

Запрещает создание пользователя без пароля, если явно не указано &#39;IDENTIFIED WITH no&#95;password&#39;.

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```

## default&#95;session&#95;timeout {#default_session_timeout}

Тайм-аут сеанса по умолчанию, в секундах.

```xml
<default_session_timeout>60</default_session_timeout>
```

## default&#95;password&#95;type {#default_password_type}

Задает тип пароля, который будет автоматически устанавливаться в запросах вида `CREATE USER u IDENTIFIED BY 'p'`.

Допустимые значения:

* `plaintext_password`
* `sha256_password`
* `double_sha1_password`
* `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```

## user&#95;directories {#user_directories}

Раздел файла конфигурации, содержащий настройки:

* Путь к файлу конфигурации с предопределёнными пользователями.
* Путь к папке, где хранятся пользователи, создаваемые с помощью SQL-команд.
* Путь к узлу ZooKeeper, где хранятся и реплицируются пользователи, создаваемые с помощью SQL-команд.

Если этот раздел задан, путь из [users&#95;config](/operations/server-configuration-parameters/settings#users_config) и [access&#95;control&#95;path](../../operations/server-configuration-parameters/settings.md#access_control_path) не используется.

Раздел `user_directories` может содержать любое количество элементов, порядок элементов определяет их приоритет (чем выше элемент, тем выше приоритет).

**Примеры**

```xml
<user_directories>
    <users_xml>
        <path>/etc/clickhouse-server/users.xml</path>
    </users_xml>
    <local_directory>
        <path>/var/lib/clickhouse/access/</path>
    </local_directory>
</user_directories>
```

Пользователей, роли, политики на уровне строк, квоты и профили также можно хранить в ZooKeeper:

```xml
<user_directories>
    <users_xml>
        <path>/etc/clickhouse-server/users.xml</path>
    </users_xml>
    <replicated>
        <zookeeper_path>/clickhouse/access/</zookeeper_path>
    </replicated>
</user_directories>
```

Вы также можете определить секции `memory` — это означает, что информация хранится только в памяти, без записи на диск, и `ldap` — это означает хранение информации на сервере LDAP.

Чтобы добавить сервер LDAP в качестве удалённого каталога для пользователей, не определённых локально, задайте единственную секцию `ldap` со следующими настройками:

| Setting  | Description                                                                                                                                                                                                                                                                                                                                                                                                 |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `server` | одно из имён серверов LDAP, определённых в секции конфигурации `ldap_servers`. Этот параметр является обязательным и не может быть пустым.                                                                                                                                                                                                                                                                  |
| `roles`  | секция со списком локально определённых ролей, которые будут назначаться каждому пользователю, полученному с сервера LDAP. Если роли не указаны, пользователь не сможет выполнять какие-либо действия после аутентификации. Если какая-либо из перечисленных ролей не определена локально на момент аутентификации, попытка аутентификации завершится неудачей так, как если бы был указан неверный пароль. |

**Пример**

```xml
<ldap>
    <server>my_ldap_server</server>
        <roles>
            <my_local_role1 />
            <my_local_role2 />
        </roles>
</ldap>
```

## top&#95;level&#95;domains&#95;list {#top_level_domains_list}

Определяет список пользовательских доменов верхнего уровня, в котором каждая запись имеет формат `<name>/path/to/file</name>`.

Например:

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

См. также:

* функцию [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cutToFirstSignificantSubdomainCustom) и её варианты,
  которая принимает имя пользовательского списка TLD и возвращает часть домена, включающую домены верхнего уровня и поддомены вплоть до первого значимого поддомена.

## proxy {#proxy}

Определите прокси‑серверы для HTTP‑ и HTTPS‑запросов, которые в настоящее время поддерживаются хранилищем S3, табличными функциями S3 и функциями URL.

Существуют три способа определения прокси‑серверов:

* переменные окружения
* списки прокси
* удалённые резолверы прокси.

Обход прокси‑серверов для конкретных хостов также поддерживается с помощью `no_proxy`.

**Переменные окружения**

Переменные окружения `http_proxy` и `https_proxy` позволяют указать
прокси‑сервер для заданного протокола. Если они настроены в вашей системе, всё должно работать без дополнительной настройки.

Это самый простой подход, если для заданного протокола используется
только один прокси‑сервер и этот прокси‑сервер не меняется.

**Списки прокси**

Этот подход позволяет указать один или несколько
прокси‑серверов для протокола. Если определено более одного прокси‑сервера,
ClickHouse использует разные прокси‑серверы по круговой схеме (round-robin), распределяя
нагрузку между серверами. Это самый простой подход, если для протокола больше
одного прокси‑сервера и список прокси‑серверов не меняется.

**Шаблон конфигурации**

```xml
<proxy>
    <http>
        <uri>http://proxy1</uri>
        <uri>http://proxy2:3128</uri>
    </http>
    <https>
        <uri>http://proxy1:3128</uri>
    </https>
</proxy>
```

Выберите родительское поле на вкладках ниже, чтобы просмотреть их дочерние поля:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>
    | Поле      | Описание                                     |
    | --------- | -------------------------------------------- |
    | `<http>`  | Список из одного или нескольких HTTP-прокси  |
    | `<https>` | Список из одного или нескольких HTTPS-прокси |
  </TabItem>

  <TabItem value="http_https" label="<http> and <https>">
    | Поле    | Описание           |
    | ------- | ------------------ |
    | `<uri>` | URI прокси-сервера |
  </TabItem>
</Tabs>

**Удалённые резолверы прокси**

Прокси-серверы могут изменяться динамически. В этом
случае вы можете определить конечную точку резолвера. ClickHouse отправляет
пустой GET-запрос на эту конечную точку, удалённый резолвер должен вернуть хост прокси.
ClickHouse будет использовать его для формирования URI прокси по следующему шаблону: `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

**Шаблон конфигурации**

```xml
<proxy>
    <http>
        <resolver>
            <endpoint>http://resolver:8080/hostname</endpoint>
            <proxy_scheme>http</proxy_scheme>
            <proxy_port>80</proxy_port>
            <proxy_cache_time>10</proxy_cache_time>
        </resolver>
    </http>

    <https>
        <resolver>
            <endpoint>http://resolver:8080/hostname</endpoint>
            <proxy_scheme>http</proxy_scheme>
            <proxy_port>3128</proxy_port>
            <proxy_cache_time>10</proxy_cache_time>
        </resolver>
    </https>

</proxy>
```

Выберите родительское поле во вкладках ниже, чтобы просмотреть соответствующие дочерние поля:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>
    | Поле      | Описание                                    |
    | --------- | ------------------------------------------- |
    | `<http>`  | Список из одного или нескольких резолверов* |
    | `<https>` | Список из одного или нескольких резолверов* |
  </TabItem>

  <TabItem value="http_https" label="<http> и <https>">
    | Поле         | Описание                                                |
    | ------------ | ------------------------------------------------------- |
    | `<resolver>` | Конечная точка (endpoint) и другие сведения о резолвере |

    :::note
    Можно указать несколько элементов `<resolver>`, но используется только первый
    `<resolver>` для данного протокола. Любые другие элементы `<resolver>`
    для этого протокола игнорируются. Это означает, что балансировка нагрузки
    (если она требуется) должна быть реализована на стороне удалённого резолвера.
    :::
  </TabItem>

  <TabItem value="resolver" label="<resolver>">
    | Поле                 | Описание                                                                                                                                                                                              |
    | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    | `<endpoint>`         | URI прокси-резолвера                                                                                                                                                                                  |
    | `<proxy_scheme>`     | Протокол итогового URI прокси. Может быть `http` или `https`.                                                                                                                                         |
    | `<proxy_port>`       | Номер порта прокси-резолвера                                                                                                                                                                          |
    | `<proxy_cache_time>` | Время в секундах, в течение которого значения от резолвера должны кэшироваться в ClickHouse. Установка значения `0` заставляет ClickHouse обращаться к резолверу для каждого HTTP- или HTTPS-запроса. |
  </TabItem>
</Tabs>

**Приоритет**

Параметры прокси определяются в следующем порядке:

| Порядок | Параметр                    |
|---------|-----------------------------|
| 1.      | Удалённые прокси‑резолверы  |
| 2.      | Списки прокси‑серверов      |
| 3.      | Переменные окружения        |

ClickHouse проверит тип резолвера с наивысшим приоритетом для протокола запроса. Если он не определён,
будет проверен следующий по приоритету тип резолвера, пока не будет достигнут резолвер на основе переменных окружения.
Это также позволяет одновременно использовать несколько типов резолверов.

## отключение&#95;туннелирования&#95;HTTPS&#95;запросов&#95;через&#95;HTTP&#95;прокси {#disable_tunneling_for_https_requests_over_http_proxy}

По умолчанию туннелирование (т. е. `HTTP CONNECT`) используется для выполнения `HTTPS`‑запросов через `HTTP`‑прокси. Этот параметр можно использовать, чтобы отключить его.

**no&#95;proxy**

По умолчанию все запросы проходят через прокси. Чтобы отключить его для отдельных хостов, необходимо задать переменную `no_proxy`.
Её можно задать внутри блока `<proxy>` для резолверов типов list и remote, а также в виде переменной окружения для резолвера типа environment.
Поддерживаются IP-адреса, домены, поддомены и шаблон `'*'` для полного обхода. Ведущие точки удаляются так же, как это делает curl.

**Example**

Ниже приведена конфигурация, которая обходит прокси для запросов к `clickhouse.cloud` и ко всем его поддоменам (например, `auth.clickhouse.cloud`).
То же самое относится к GitLab, даже если домен указан с ведущей точкой: и `gitlab.com`, и `about.gitlab.com` будут обходить прокси.

```xml
<proxy>
    <no_proxy>clickhouse.cloud,.gitlab.com</no_proxy>
    <http>
        <uri>http://proxy1</uri>
        <uri>http://proxy2:3128</uri>
    </http>
    <https>
        <uri>http://proxy1:3128</uri>
    </https>
</proxy>
```

## workload&#95;path {#workload_path}

Каталог, используемый для хранения всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. По умолчанию используется каталог `/workload/` в рабочем каталоге сервера.

**Пример**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**См. также**

* [Иерархия рабочих нагрузок](/operations/workload-scheduling.md#workloads)
* [workload&#95;zookeeper&#95;path](#workload_zookeeper_path)

## workload&#95;zookeeper&#95;path {#workload_zookeeper_path}

Путь к узлу ZooKeeper, который используется в качестве хранилища для всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. Для единообразия все SQL-определения хранятся в виде значения этого единственного `znode`. По умолчанию ZooKeeper не используется, и определения сохраняются на [диск](#workload_path).

**Пример**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**См. также**

* [Иерархия рабочих нагрузок](/operations/workload-scheduling.md#workloads)
* [workload&#95;path](#workload_path)

## zookeeper&#95;log {#zookeeper_log}

Настройки для системной таблицы [`zookeeper_log`](/operations/system-tables/zookeeper_log).

Следующие настройки можно настроить с помощью подтегов:

<SystemLogParameters />

**Пример**

```xml
<clickhouse>
    <zookeeper_log>
        <database>system</database>
        <table>zookeeper_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <ttl>event_date + INTERVAL 1 WEEK DELETE</ttl>
    </zookeeper_log>
</clickhouse>
```
