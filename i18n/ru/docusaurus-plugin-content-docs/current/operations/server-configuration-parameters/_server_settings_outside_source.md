## asynchronous_metric_log {#asynchronous_metric_log}

По умолчанию включено в развертываниях ClickHouse Cloud.

Если настройка не включена по умолчанию в вашей среде, в зависимости от способа установки ClickHouse вы можете воспользоваться приведенными ниже инструкциями для ее включения или отключения.

**Включение**

Чтобы вручную включить сбор истории журналов асинхронных метрик [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md), создайте файл `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` со следующим содержимым:

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

Чтобы отключить настройку `asynchronous_metric_log`, создайте файл `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` со следующим содержимым:

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters />


## auth_use_forwarded_address {#auth_use_forwarded_address}

Использовать исходный адрес для аутентификации клиентов, подключающихся через прокси-сервер.

:::note
Эту настройку следует использовать с особой осторожностью, поскольку переадресованные адреса могут быть легко подделаны — серверы, принимающие такую аутентификацию, не должны быть доступны напрямую, а исключительно через доверенный прокси-сервер.
:::


## backups {#backups}

Настройки для резервного копирования, используемые при выполнении операторов [`BACKUP` и `RESTORE`](../backup.md).

Следующие настройки можно задать с помощью подтегов:


<!-- SQL
WITH settings AS (
  SELECT arrayJoin([
    ('allow_concurrent_backups', 'Bool','Determines whether multiple backup operations can run concurrently on the same host.', 'true'),
    ('allow_concurrent_restores', 'Bool', 'Determines whether multiple restore operations can run concurrently on the same host.', 'true'),
    ('allowed_disk', 'String', 'Disk to backup to when using `File()`. This setting must be set in order to use `File`.', ''),
    ('allowed_path', 'String', 'Path to backup to when using `File()`. This setting must be set in order to use `File`.', ''),
    ('attempts_to_collect_metadata_before_sleep', 'UInt', 'Number of attempts to collect metadata before sleeping in case of inconsistency after comparing collected metadata.', '2'),
    ('collect_metadata_timeout', 'UInt64', 'Timeout in milliseconds for collecting metadata during backup.', '600000'),
    ('compare_collected_metadata', 'Bool', 'If true, compares the collected metadata with the existing metadata to ensure they are not changed during backup .', 'true'),
    ('create_table_timeout', 'UInt64', 'Timeout in milliseconds for creating tables during restore.', '300000'),
    ('max_attempts_after_bad_version', 'UInt64', 'Maximum number of attempts to retry after encountering a bad version error during coordinated backup/restore.', '3'),
    ('max_sleep_before_next_attempt_to_collect_metadata', 'UInt64', 'Maximum sleep time in milliseconds before the next attempt to collect metadata.', '100'),
    ('min_sleep_before_next_attempt_to_collect_metadata', 'UInt64', 'Minimum sleep time in milliseconds before the next attempt to collect metadata.', '5000'),
    ('remove_backup_files_after_failure', 'Bool', 'If the `BACKUP` command fails, ClickHouse will try to remove the files already copied to the backup before the failure,  otherwise it will leave the copied files as they are.', 'true'),
    ('sync_period_ms', 'UInt64', 'Synchronization period in milliseconds for coordinated backup/restore.', '5000'),
    ('test_inject_sleep', 'Bool', 'Testing related sleep', 'false'),
    ('test_randomize_order', 'Bool', 'If true, randomizes the order of certain operations for testing purposes.', 'false'),
    ('zookeeper_path', 'String', 'Path in ZooKeeper where backup and restore metadata is stored when using `ON CLUSTER` clause.', '/clickhouse/backups')
  ]) AS t )
SELECT concat('`', t.1, '`') AS Setting, t.2 AS Type, t.3 AS Description, concat('`', t.4, '`') AS Default FROM settings FORMAT Markdown
-->

| Настройка                                           | Тип    | Описание                                                                                                                                                                      | По умолчанию          |
| :-------------------------------------------------- | :----- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------- |
| `allow_concurrent_backups`                          | Bool   | Определяет, могут ли несколько операций резервного копирования выполняться одновременно на одном хосте.                                                                       | `true`                |
| `allow_concurrent_restores`                         | Bool   | Определяет, могут ли несколько операций восстановления выполняться одновременно на одном хосте.                                                                               | `true`                |
| `allowed_disk`                                      | String | Диск для резервного копирования при использовании `File()`. Эта настройка должна быть задана для использования `File`.                                                       | ``                    |
| `allowed_path`                                      | String | Путь для резервного копирования при использовании `File()`. Эта настройка должна быть задана для использования `File`.                                                       | ``                    |
| `attempts_to_collect_metadata_before_sleep`         | UInt   | Количество попыток сбора метаданных перед переходом в режим ожидания в случае несоответствия после сравнения собранных метаданных.                                           | `2`                   |
| `collect_metadata_timeout`                          | UInt64 | Таймаут в миллисекундах для сбора метаданных во время резервного копирования.                                                                                                | `600000`              |
| `compare_collected_metadata`                        | Bool   | Если включено, сравнивает собранные метаданные с существующими метаданными, чтобы убедиться, что они не изменились во время резервного копирования.                          | `true`                |
| `create_table_timeout`                              | UInt64 | Таймаут в миллисекундах для создания таблиц во время восстановления.                                                                                                         | `300000`              |
| `max_attempts_after_bad_version`                    | UInt64 | Максимальное количество попыток повтора после обнаружения ошибки несовместимой версии во время координированного резервного копирования/восстановления.                       | `3`                   |
| `max_sleep_before_next_attempt_to_collect_metadata` | UInt64 | Максимальное время ожидания в миллисекундах перед следующей попыткой сбора метаданных.                                                                                       | `100`                 |
| `min_sleep_before_next_attempt_to_collect_metadata` | UInt64 | Минимальное время ожидания в миллисекундах перед следующей попыткой сбора метаданных.                                                                                        | `5000`                |
| `remove_backup_files_after_failure`                 | Bool   | Если команда `BACKUP` завершается с ошибкой, ClickHouse попытается удалить файлы, уже скопированные в резервную копию до сбоя, в противном случае скопированные файлы останутся без изменений. | `true`                |
| `sync_period_ms`                                    | UInt64 | Период синхронизации в миллисекундах для координированного резервного копирования/восстановления.                                                                            | `5000`                |
| `test_inject_sleep`                                 | Bool   | Задержка для тестирования                                                                                                                                                     | `false`               |
| `test_randomize_order`                              | Bool   | Если включено, рандомизирует порядок определенных операций в целях тестирования.                                                                                             | `false`               |
| `zookeeper_path`                                    | String | Путь в ZooKeeper, где хранятся метаданные резервного копирования и восстановления при использовании конструкции `ON CLUSTER`.                                                | `/clickhouse/backups` |

По умолчанию этот параметр имеет следующее значение:

```xml
<backups>
    ....
</backups>
```


## bcrypt_workfactor {#bcrypt_workfactor}

Фактор сложности для типа аутентификации `bcrypt_password`, который использует [алгоритм Bcrypt](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/).
Фактор сложности определяет объём вычислений и время, необходимые для вычисления хеша и проверки пароля.

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

:::warning
Для приложений с частой аутентификацией
рекомендуется использовать альтернативные методы аутентификации из-за
высоких вычислительных затрат bcrypt при больших значениях фактора сложности.
:::


## table_engines_require_grant {#table_engines_require_grant}

Если установлено значение true, для создания таблицы с определённым движком пользователям требуется соответствующее разрешение, например `GRANT TABLE ENGINE ON TinyLog to user`.

:::note
По умолчанию для обеспечения обратной совместимости при создании таблицы с определённым движком разрешения не проверяются, однако это поведение можно изменить, установив данный параметр в true.
:::


## builtin_dictionaries_reload_interval {#builtin_dictionaries_reload_interval}

Интервал в секундах между перезагрузками встроенных словарей.

ClickHouse перезагружает встроенные словари каждые x секунд. Это позволяет редактировать словари «на лету» без перезапуска сервера.

**Пример**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```


## compression {#compression}

Настройки сжатия данных для таблиц с движками семейства [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

:::note
Не рекомендуется изменять эти настройки, если вы только начинаете работать с ClickHouse.
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

- `min_part_size` – Минимальный размер куска данных.
- `min_part_size_ratio` – Отношение размера куска данных к размеру таблицы.
- `method` – Метод сжатия. Допустимые значения: `lz4`, `lz4hc`, `zstd`, `deflate_qpl`.
- `level` – Уровень сжатия. См. [Кодеки](/sql-reference/statements/create/table#general-purpose-codecs).

:::note
Можно настроить несколько секций `<case>`.
:::

**Действия при выполнении условий**:

- Если кусок данных соответствует набору условий, ClickHouse использует указанный метод сжатия.
- Если кусок данных соответствует нескольким наборам условий, ClickHouse использует первый подходящий набор.

:::note
Если для куска данных не выполнено ни одно условие, ClickHouse использует сжатие `lz4`.
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

Настраивает команду для получения ключа, используемого [кодеками шифрования](/sql-reference/statements/create/table#encryption-codecs). Ключ (или ключи) должны быть записаны в переменные окружения или заданы в конфигурационном файле.

Ключи могут быть представлены в шестнадцатеричном формате или в виде строки длиной 16 байт.

**Пример**

Загрузка из конфигурационного файла:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key>1234567812345678</key>
    </aes_128_gcm_siv>
</encryption_codecs>
```

:::note
Хранение ключей в конфигурационном файле не рекомендуется, так как это небезопасно. Вы можете переместить ключи в отдельный конфигурационный файл на защищённом диске и создать символическую ссылку на этот файл в папке `config.d/`.
:::

Загрузка из конфигурационного файла, когда ключ представлен в шестнадцатеричном формате:

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

Здесь `current_key_id` задаёт текущий ключ для шифрования, при этом все указанные ключи могут использоваться для расшифровки.

Каждый из этих методов может применяться для нескольких ключей:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
        <key_hex id="1" from_env="ENVVAR"></key_hex>
        <current_key_id>1</current_key_id>
    </aes_128_gcm_siv>
</encryption_codecs>
```

Здесь `current_key_id` указывает текущий ключ для шифрования.

Также можно добавить nonce, который должен иметь длину 12 байт (по умолчанию процессы шифрования и расшифровки используют nonce, состоящий из нулевых байтов):

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
Всё вышеперечисленное применимо и к `aes_256_gcm_siv` (но ключ должен иметь длину 32 байта).
:::


## error_log {#error_log}

По умолчанию отключен.

**Включение**

Чтобы вручную включить сбор истории ошибок [`system.error_log`](../../operations/system-tables/error_log.md), создайте файл `/etc/clickhouse-server/config.d/error_log.xml` со следующим содержимым:

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

Чтобы отключить настройку `error_log`, создайте файл `/etc/clickhouse-server/config.d/disable_error_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## custom_settings_prefixes {#custom_settings_prefixes}

Список префиксов для [пользовательских настроек](/operations/settings/query-level#custom_settings). Префиксы должны разделяться запятыми.

**Пример**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**См. также**

- [Пользовательские настройки](/operations/settings/query-level#custom_settings)


## core_dump {#core_dump}

Настраивает мягкое ограничение размера файла core dump.

:::note
Жёсткое ограничение настраивается с помощью системных инструментов
:::

**Пример**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```


## default_profile {#default_profile}

Профиль настроек по умолчанию. Профили настроек располагаются в файле, указанном в настройке `user_config`.

**Пример**

```xml
<default_profile>default</default_profile>
```


## dictionaries_config {#dictionaries_config}

Путь к файлу конфигурации словарей.

Путь:

- Укажите абсолютный путь или путь относительно файла конфигурации сервера.
- Путь может содержать символы подстановки \* и ?.

См. также:

- "[Словари](../../sql-reference/dictionaries/index.md)".

**Пример**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```


## user_defined_executable_functions_config {#user_defined_executable_functions_config}

Путь к файлу конфигурации для исполняемых пользовательских функций.

Путь:

- Укажите абсолютный путь или путь относительно файла конфигурации сервера.
- Путь может содержать подстановочные знаки \* и ?.

См. также:

- "[Исполняемые пользовательские функции](/sql-reference/functions/udf#executable-user-defined-functions)".

**Пример**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```


## format_schema_path {#format_schema_path}

Путь к каталогу со схемами для входных данных, например, схемами для формата [CapnProto](/interfaces/formats/CapnProto).

**Пример**

```xml
<!-- Каталог, содержащий файлы схем для различных форматов входных данных. -->
<format_schema_path>format_schemas/</format_schema_path>
```


## graphite {#graphite}

Отправка данных в [Graphite](https://github.com/graphite-project).

Настройки:

- `host` – Сервер Graphite.
- `port` – Порт сервера Graphite.
- `interval` – Интервал отправки в секундах.
- `timeout` – Таймаут отправки данных в секундах.
- `root_path` – Префикс для ключей.
- `metrics` – Отправка данных из таблицы [system.metrics](/operations/system-tables/metrics).
- `events` – Отправка данных о приращениях, накопленных за период времени, из таблицы [system.events](/operations/system-tables/events).
- `events_cumulative` – Отправка накопительных данных из таблицы [system.events](/operations/system-tables/events).
- `asynchronous_metrics` – Отправка данных из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).

Можно настроить несколько секций `<graphite>`. Например, это можно использовать для отправки различных данных с разными интервалами.

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


## graphite_rollup {#graphite_rollup}

Настройки для прореживания данных Graphite.

Подробнее см. [GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md).

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


## google_protos_path {#google_protos_path}

Определяет каталог, содержащий proto-файлы для типов Protobuf.

Пример:

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```


## http_handlers {#http_handlers}

Позволяет использовать пользовательские HTTP-обработчики.
Чтобы добавить новый HTTP-обработчик, просто добавьте новый элемент `<rule>`.
Правила проверяются сверху вниз в порядке их определения,
и первое совпадение запустит обработчик.

Следующие настройки могут быть сконфигурированы с помощью вложенных элементов:

| Вложенные элементы   | Определение                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`                | Для сопоставления URL запроса можно использовать префикс 'regex:' для применения регулярного выражения (необязательно)                            |
| `methods`            | Для сопоставления методов запроса можно использовать запятые для разделения нескольких методов (необязательно)                                    |
| `headers`            | Для сопоставления заголовков запроса сопоставляется каждый дочерний элемент (имя дочернего элемента — это имя заголовка), можно использовать префикс 'regex:' для применения регулярного выражения (необязательно) |
| `handler`            | Обработчик запроса                                                                                                                                |
| `empty_query_string` | Проверка отсутствия строки запроса в URL                                                                                                          |

`handler` содержит следующие настройки, которые могут быть сконфигурированы с помощью вложенных элементов:

| Вложенные элементы | Определение                                                                                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `url`              | Адрес для перенаправления                                                                                                                                             |
| `type`             | Поддерживаемые типы: static, dynamic_query_handler, predefined_query_handler, redirect                                                                                |
| `status`           | Используется с типом static, код статуса ответа                                                                                                                       |
| `query_param_name` | Используется с типом dynamic_query_handler, извлекает и выполняет значение, соответствующее значению `<query_param_name>` в параметрах HTTP-запроса                  |
| `query`            | Используется с типом predefined_query_handler, выполняет запрос при вызове обработчика                                                                                |
| `content_type`     | Используется с типом static, тип содержимого ответа                                                                                                                   |
| `response_content` | Используется с типом static, содержимое ответа, отправляемое клиенту; при использовании префикса 'file://' или 'config://' содержимое извлекается из файла или конфигурации и отправляется клиенту |

Вместе со списком правил можно указать `<defaults/>`, который включает все обработчики по умолчанию.

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


## http_server_default_response {#http_server_default_response}

Страница, отображаемая по умолчанию при обращении к HTTP(s)-серверу ClickHouse.
Значение по умолчанию: "Ok." (с символом перевода строки в конце)

**Пример**

Открывает `https://tabix.io/` при обращении к `http://localhost: http_port`.

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```


## http_options_response {#http_options_response}

Используется для добавления заголовков к ответу на HTTP-запрос `OPTIONS`.
Метод `OPTIONS` применяется при выполнении предварительных CORS-запросов (preflight requests).

Подробнее см. [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS).

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


## hsts_max_age {#hsts_max_age}

Время действия HSTS в секундах.

:::note
Значение `0` означает, что ClickHouse отключает HSTS. При установке положительного числа HSTS будет включен, а max-age будет равен указанному значению.
:::

**Пример**

```xml
<hsts_max_age>600000</hsts_max_age>
```


## mlock_executable {#mlock_executable}

Выполняет `mlockall` после запуска для снижения задержки первых запросов и предотвращения выгрузки исполняемого файла ClickHouse из памяти при высокой нагрузке на ввод-вывод.

:::note
Рекомендуется включить эту опцию, однако это приведет к увеличению времени запуска до нескольких секунд.
Обратите внимание, что эта настройка не будет работать без привилегии «CAP_IPC_LOCK».
:::

**Пример**

```xml
<mlock_executable>false</mlock_executable>
```


## include_from {#include_from}

Путь к файлу с подстановками. Поддерживаются форматы XML и YAML.

Подробнее см. в разделе «[Конфигурационные файлы](/operations/configuration-files)».

**Пример**

```xml
<include_from>/etc/metrica.xml</include_from>
```


## interserver_listen_host {#interserver_listen_host}

Ограничение на хосты, которые могут обмениваться данными между серверами ClickHouse.
Если используется Keeper, то же ограничение применяется к взаимодействию между различными экземплярами Keeper.

:::note
По умолчанию значение совпадает с настройкой [`listen_host`](#listen_host).
:::

**Пример**

```xml
<interserver_listen_host>::ffff:a00:1</interserver_listen_host>
<interserver_listen_host>10.0.0.1</interserver_listen_host>
```

Тип:

По умолчанию:


## interserver_http_port {#interserver_http_port}

Порт для обмена данными между серверами ClickHouse.

**Пример**

```xml
<interserver_http_port>9009</interserver_http_port>
```


## interserver_http_host {#interserver_http_host}

Имя хоста, которое может использоваться другими серверами для доступа к данному серверу.

Если параметр не указан, он определяется так же, как и при выполнении команды `hostname -f`.

Полезно для отвязки от конкретного сетевого интерфейса.

**Пример**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```


## interserver_https_port {#interserver_https_port}

Порт для обмена данными между серверами ClickHouse по протоколу `HTTPS`.

**Пример**

```xml
<interserver_https_port>9010</interserver_https_port>
```


## interserver_https_host {#interserver_https_host}

Аналогично [`interserver_http_host`](#interserver_http_host), но это имя хоста используется другими серверами для доступа к данному серверу по протоколу `HTTPS`.

**Пример**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```


## interserver_http_credentials {#interserver_http_credentials}

Имя пользователя и пароль, используемые для подключения к другим серверам во время [репликации](../../engines/table-engines/mergetree-family/replication.md). Кроме того, сервер аутентифицирует другие реплики с помощью этих учетных данных.
Параметр `interserver_http_credentials` должен быть одинаковым для всех реплик в кластере.

:::note

- По умолчанию, если секция `interserver_http_credentials` отсутствует, аутентификация при репликации не используется.
- Настройки `interserver_http_credentials` не связаны с [конфигурацией](../../interfaces/cli.md#configuration_files) учетных данных клиента ClickHouse.
- Эти учетные данные являются общими для репликации по протоколам `HTTP` и `HTTPS`.
  :::

Следующие настройки могут быть заданы с помощью вложенных тегов:

- `user` — имя пользователя.
- `password` — пароль.
- `allow_empty` — если `true`, другим репликам разрешено подключаться без аутентификации, даже если учетные данные заданы. Если `false`, подключения без аутентификации отклоняются. Значение по умолчанию: `false`.
- `old` — содержит старые значения `user` и `password`, используемые при ротации учетных данных. Можно указать несколько секций `old`.

**Ротация учетных данных**

ClickHouse поддерживает динамическую ротацию межсерверных учетных данных без одновременной остановки всех реплик для обновления их конфигурации. Учетные данные можно изменить в несколько этапов.

Чтобы включить аутентификацию, установите `interserver_http_credentials.allow_empty` в `true` и добавьте учетные данные. Это позволяет подключаться как с аутентификацией, так и без нее.

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

После настройки всех реплик установите `allow_empty` в `false` или удалите этот параметр. Это сделает аутентификацию с новыми учетными данными обязательной.

Чтобы изменить существующие учетные данные, переместите имя пользователя и пароль в секцию `interserver_http_credentials.old` и обновите `user` и `password` новыми значениями. На этом этапе сервер использует новые учетные данные для подключения к другим репликам и принимает подключения как с новыми, так и со старыми учетными данными.

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

Перечислите здесь LDAP-серверы с параметрами подключения для:

- использования в качестве аутентификаторов для выделенных локальных пользователей, у которых указан механизм аутентификации 'ldap' вместо 'password'
- использования в качестве удалённых каталогов пользователей.

Следующие настройки могут быть сконфигурированы с помощью вложенных тегов:

| Настройка                      | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `host`                         | Имя хоста или IP-адрес LDAP-сервера. Этот параметр обязателен и не может быть пустым.                                                                                                                                                                                                                                                                                                                                                     |
| `port`                         | Порт LDAP-сервера. По умолчанию 636, если `enable_tls` установлен в true, иначе `389`.                                                                                                                                                                                                                                                                                                                                                    |
| `bind_dn`                      | Шаблон, используемый для построения DN для привязки. Результирующий DN будет построен путём замены всех подстрок `\{user_name\}` в шаблоне на фактическое имя пользователя при каждой попытке аутентификации.                                                                                                                                                                                                                             |
| `user_dn_detection`            | Секция с параметрами поиска LDAP для определения фактического DN привязанного пользователя. Используется в основном в фильтрах поиска для дальнейшего сопоставления ролей, когда сервером является Active Directory. Результирующий DN пользователя будет использоваться при замене подстрок `\{user_dn\}` везде, где они разрешены. По умолчанию DN пользователя устанавливается равным DN привязки, но после выполнения поиска он будет обновлён до фактического обнаруженного значения DN пользователя. |
| `verification_cooldown`        | Период времени в секундах после успешной попытки привязки, в течение которого пользователь будет считаться успешно аутентифицированным для всех последующих запросов без обращения к LDAP-серверу. Укажите `0` (по умолчанию) для отключения кэширования и принудительного обращения к LDAP-серверу при каждом запросе аутентификации.                                                                                                    |
| `enable_tls`                   | Флаг для активации использования защищённого соединения с LDAP-сервером. Укажите `no` для протокола открытого текста (`ldap://`) (не рекомендуется). Укажите `yes` для протокола LDAP через SSL/TLS (`ldaps://`) (рекомендуется, по умолчанию). Укажите `starttls` для устаревшего протокола StartTLS (протокол открытого текста (`ldap://`), обновлённый до TLS).                                                                      |
| `tls_minimum_protocol_version` | Минимальная версия протокола SSL/TLS. Допустимые значения: `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2` (по умолчанию).                                                                                                                                                                                                                                                                                                                  |
| `tls_require_cert`             | Поведение проверки сертификата узла SSL/TLS. Допустимые значения: `never`, `allow`, `try`, `demand` (по умолчанию).                                                                                                                                                                                                                                                                                                                       |
| `tls_cert_file`                | Путь к файлу сертификата.                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `tls_key_file`                 | Путь к файлу ключа сертификата.                                                                                                                                                                                                                                                                                                                                                                                                            |
| `tls_ca_cert_file`             | Путь к файлу сертификата CA.                                                                                                                                                                                                                                                                                                                                                                                                               |
| `tls_ca_cert_dir`              | Путь к каталогу, содержащему сертификаты CA.                                                                                                                                                                                                                                                                                                                                                                                               |
| `tls_cipher_suite`             | Разрешённый набор шифров (в нотации OpenSSL).                                                                                                                                                                                                                                                                                                                                                                                              |

Настройка `user_dn_detection` может быть сконфигурирована с помощью вложенных тегов:

| Настройка       | Описание                                                                                                                                                                                                                                                                                                                                            |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base_dn`       | Шаблон, используемый для построения базового DN для поиска LDAP. Результирующий DN будет построен путём замены всех подстрок `\{user_name\}` и '\{bind_dn\}' в шаблоне на фактическое имя пользователя и DN привязки во время поиска LDAP.                                                                                                         |
| `scope`         | Область поиска LDAP. Допустимые значения: `base`, `one_level`, `children`, `subtree` (по умолчанию).                                                                                                                                                                                                                                               |
| `search_filter` | Шаблон, используемый для построения фильтра поиска для поиска LDAP. Результирующий фильтр будет построен путём замены всех подстрок `\{user_name\}`, `\{bind_dn\}` и `\{base_dn\}` в шаблоне на фактическое имя пользователя, DN привязки и базовый DN во время поиска LDAP. Обратите внимание, что специальные символы должны быть правильно экранированы в XML. |

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

Пример (типичная конфигурация Active Directory с настроенным определением DN пользователя для последующего сопоставления с ролями):

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


## listen_host {#listen_host}

Ограничение на хосты, с которых могут поступать запросы. Если необходимо, чтобы сервер принимал запросы со всех хостов, укажите `::`.

Примеры:

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```


## listen_try {#listen_try}

Сервер не завершит работу, если сети IPv6 или IPv4 недоступны при попытке начать прослушивание.

**Пример**

```xml
<listen_try>0</listen_try>
```


## listen_reuse_port {#listen_reuse_port}

Позволяет нескольким серверам прослушивать один и тот же адрес:порт. Запросы будут направляться операционной системой на случайный сервер. Не рекомендуется включать эту настройку.

**Пример**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

Тип:

По умолчанию:


## listen_backlog {#listen_backlog}

Backlog (размер очереди ожидающих соединений) сокета прослушивания. Значение по умолчанию `4096` соответствует значению в Linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)).

Обычно это значение не требует изменения, так как:

- Значение по умолчанию достаточно велико,
- Для приёма клиентских соединений сервер использует отдельный поток.

Таким образом, даже если значение `TcpExtListenOverflows` (из `nstat`) ненулевое и этот счётчик растёт для сервера ClickHouse, это не означает, что данное значение необходимо увеличивать, так как:

- Обычно, если `4096` недостаточно, это указывает на внутреннюю проблему масштабирования ClickHouse, поэтому лучше сообщить об этом.
- Это не означает, что сервер сможет обработать больше соединений позже (и даже если бы мог, к тому моменту клиенты могут уже отключиться).

**Пример**

```xml
<listen_backlog>4096</listen_backlog>
```


## logger {#logger}

Расположение и формат сообщений журнала.

**Ключи**:

| Ключ                   | Описание                                                                                                                                                           |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `level`                | Уровень журналирования. Допустимые значения: `none` (отключить журналирование), `fatal`, `critical`, `error`, `warning`, `notice`, `information`, `debug`, `trace`, `test` |
| `log`                  | Путь к файлу журнала.                                                                                                                                              |
| `errorlog`             | Путь к файлу журнала ошибок.                                                                                                                                       |
| `size`                 | Политика ротации: максимальный размер файлов журнала в байтах. Когда размер файла журнала превышает этот порог, он переименовывается и архивируется, после чего создается новый файл журнала. |
| `count`                | Политика ротации: максимальное количество исторических файлов журнала, которые хранятся в ClickHouse.                                                              |
| `stream_compress`      | Сжимать сообщения журнала с использованием LZ4. Установите значение `1` или `true` для включения.                                                                  |
| `console`              | Включить журналирование в консоль. Установите значение `1` или `true` для включения. По умолчанию `1`, если ClickHouse не работает в режиме демона, иначе `0`.    |
| `console_log_level`    | Уровень журналирования для вывода в консоль. По умолчанию соответствует значению `level`.                                                                          |
| `formatting.type`      | Формат журнала для вывода в консоль. В настоящее время поддерживается только `json`.                                                                               |
| `use_syslog`           | Также перенаправлять вывод журнала в syslog.                                                                                                                       |
| `syslog_level`         | Уровень журналирования для записи в syslog.                                                                                                                        |
| `async`                | Если установлено значение `true` (по умолчанию), журналирование будет выполняться асинхронно (один фоновый поток на канал вывода). В противном случае запись будет выполняться внутри потока, вызывающего LOG. |
| `async_queue_max_size` | При использовании асинхронного журналирования — максимальное количество сообщений, которые будут храниться в очереди в ожидании записи. Дополнительные сообщения будут отброшены. |
| `startup_level`        | Уровень запуска используется для установки уровня корневого логгера при запуске сервера. После запуска уровень журналирования возвращается к значению параметра `level`. |
| `shutdown_level`       | Уровень завершения используется для установки уровня корневого логгера при завершении работы сервера.                                                              |

**Спецификаторы формата журнала**

Имена файлов в путях `log` и `errorLog` поддерживают следующие спецификаторы формата для результирующего имени файла (часть пути с директорией их не поддерживает).

Столбец «Example» показывает вывод на момент `2023-07-06 18:32:07`.


| Спецификатор | Описание                                                                                                                                                                                                      | Пример                     |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `%%`         | Литерал «%»                                                                                                                                                                                                   | `%`                        |
| `%n`         | Символ новой строки                                                                                                                                                                                           |                            |
| `%t`         | Символ горизонтальной табуляции                                                                                                                                                                               |                            |
| `%Y`         | Год в виде десятичного числа, например, 2017                                                                                                                                                                  | `2023`                     |
| `%y`         | Последние 2 цифры года как десятичное число (диапазон [00, 99])                                                                                                                                               | `23`                       |
| `%C`         | Первые две цифры года в виде десятичного числа (диапазон [00, 99])                                                                                                                                            | `20`                       |
| `%G`         | Четырёхзначный [год по ISO 8601, основанный на нумерации недель](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), т.е. год, который содержит указанную неделю. Обычно используется только совместно с `%V` | `2023`                     |
| `%g`         | Последние две цифры [недельного года по стандарту ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), то есть года, к которому относится указанная неделя.                                          | `23`                       |
| `%b`         | Сокращённое название месяца, например Oct (зависит от локали)                                                                                                                                                 | `июл`                      |
| `%h`         | Синоним для %b                                                                                                                                                                                                | `Июл`                      |
| `%B`         | Полное название месяца, например «October» (зависит от локали)                                                                                                                                                | `июль`                     |
| `%m`         | Месяц в десятичном формате (диапазон [01, 12])                                                                                                                                                                | `07`                       |
| `%U`         | Номер недели года в виде десятичного числа (воскресенье — первый день недели) (диапазон [00, 53])                                                                                                             | `27`                       |
| `%W`         | Номер недели года как десятичное число (понедельник — первый день недели) (диапазон [00,53])                                                                                                                  | `27`                       |
| `%V`         | Номер недели по ISO 8601 (в диапазоне [01,53])                                                                                                                                                                | `27`                       |
| `%j`         | День года в виде десятичного числа (диапазон [001, 366])                                                                                                                                                      | `187`                      |
| `%d`         | День месяца в виде десятичного числа с ведущим нулём (диапазон [01,31]), однозначные значения дополняются нулём слева.                                                                                        | `06`                       |
| `%e`         | День месяца в виде десятичного числа, выровненного пробелом слева (диапазон [1, 31]). Однозначному числу добавляется ведущий пробел.                                                                          | `&nbsp; 6`                 |
| `%a`         | Сокращённое название дня недели, например, Fri (в зависимости от локали)                                                                                                                                      | `Чт`                       |
| `%A`         | Полное название дня недели, например «пятница» (зависит от локали)                                                                                                                                            | `Четверг`                  |
| `%w`         | День недели в виде целого числа, где воскресенье — 0 (диапазон [0–6])                                                                                                                                         | `4`                        |
| `%u`         | День недели в виде десятичного числа, где понедельник — 1 (формат ISO 8601, диапазон [1–7])                                                                                                                   | `4`                        |
| `%H`         | Час как десятичное число, 24‑часовой формат (диапазон [00–23])                                                                                                                                                | `18`                       |
| `%I`         | Час как десятичное число, 12-часовой формат (диапазон [01, 12])                                                                                                                                               | `06`                       |
| `%M`         | Минута в формате десятичного числа (диапазон [00, 59])                                                                                                                                                        | `32`                       |
| `%S`         | Секунда в виде десятичного числа (в диапазоне [00,60])                                                                                                                                                        | `07`                       |
| `%c`         | Стандартное строковое представление даты и времени, например Sun Oct 17 04:41:13 2010 (зависит от локали)                                                                                                     | `Thu Jul  6 18:32:07 2023` |
| `%x`         | Локализованный формат даты (зависит от локали)                                                                                                                                                                | `06.07.23`                 |
| `%X`         | Локализованное представление времени, например 18:40:20 или 6:40:20 PM (в зависимости от локали)                                                                                                              | `18:32:07`                 |
| `%D`         | Краткий формат даты MM/DD/YY, эквивалентный %m/%d/%y                                                                                                                                                          | `06.07.23`                 |
| `%F`         | Краткий формат даты YYYY-MM-DD, эквивалентный %Y-%m-%d                                                                                                                                                        | `2023-07-06`               |
| `%r`         | Локализованное время в 12-часовом формате (зависит от настроек локали)                                                                                                                                        | `18:32:07`                 |
| `%R`         | Эквивалентно «%H:%M»                                                                                                                                                                                          | `18:32`                    |
| `%T`         | Эквивалентно «%H:%M:%S» (формат времени по ISO 8601)                                                                                                                                                          | `18:32:07`                 |
| `%p`         | Локализованное обозначение a.m. или p.m. (в зависимости от локали)                                                                                                                                            | `PM`                       |
| `%z`         | Смещение от UTC в формате ISO 8601 (например, -0430), или пустая строка, если информация о часовом поясе недоступна                                                                                           | `+0800`                    |
| `%Z`         | Название часового пояса или его аббревиатура, зависящие от локали, или пустая строка, если информация о часовом поясе недоступна                                                                              | `Z AWST `                  |

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

Чтобы выводить сообщения лога только в консоль:

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**Переопределения для отдельных уровней**

Можно переопределять уровень логирования для отдельных логгеров. Например, чтобы отключить все сообщения логгеров «Backup» и «RBAC».

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

Чтобы также записывать сообщения журнала в syslog:

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

Ключи для `<syslog>`:

| Ключ       | Описание                                                                                                                                                                                                                                                                         |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `address`  | Адрес syslog в формате `host\[:port\]`. Если не указан, используется локальный демон.                                                                                                                                                                                            |
| `hostname` | Имя хоста, с которого отправляются логи (необязательный параметр).                                                                                                                                                                                                               |
| `facility` | [Ключевое слово facility](https://en.wikipedia.org/wiki/Syslog#Facility) для syslog. Должно быть указано прописными буквами с префиксом «LOG&#95;», например `LOG_USER`, `LOG_DAEMON`, `LOG_LOCAL3` и т. д. По умолчанию: `LOG_USER`, если указан `address`, иначе `LOG_DAEMON`. |
| `format`   | Формат сообщения лога. Допустимые значения: `bsd` и `syslog`.                                                                                                                                                                                                                    |

**Форматы логов**

Вы можете указать формат лога, который будет выводиться в консоль. В данный момент поддерживается только JSON.

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

Чтобы включить поддержку логирования в формате JSON, используйте следующий фрагмент:

```xml
<logger>
    <formatting>
        <type>json</type>
        <!-- Может быть настроено для каждого канала отдельно (log, errorlog, console, syslog) или глобально для всех каналов (в этом случае просто не указывайте этот параметр). -->
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

**Переименование ключей для JSON‑логов**

Имена ключей можно изменить, задав другие значения тегов внутри тега `<names>`. Например, чтобы изменить `DATE_TIME` на `MY_DATE_TIME`, можно использовать `<date_time>MY_DATE_TIME</date_time>`.

**Исключение ключей из JSON‑логов**

Отдельные свойства лога можно исключить, закомментировав соответствующий тег. Например, если вы не хотите, чтобы ваш лог выводил `query_id`, вы можете закомментировать тег `<query_id>`.


## send_crash_reports {#send_crash_reports}

Настройки для отправки отчётов о сбоях команде основных разработчиков ClickHouse.

Включение этой функции, особенно в предпродакшн-окружениях, крайне приветствуется.

Ключи:

| Ключ                  | Описание                                                                                                                                    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `enabled`             | Логический флаг для включения функции, по умолчанию `true`. Установите значение `false`, чтобы отключить отправку отчётов о сбоях.         |
| `send_logical_errors` | `LOGICAL_ERROR` подобна `assert`, это ошибка в ClickHouse. Этот логический флаг включает отправку таких исключений (по умолчанию: `true`). |
| `endpoint`            | Вы можете переопределить URL конечной точки для отправки отчётов о сбоях.                                                                   |

**Рекомендуемое использование**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```


## ssh_server {#ssh_server}

Публичная часть ключа хоста будет записана в файл known_hosts
на стороне SSH-клиента при первом подключении.

Конфигурации ключей хоста по умолчанию неактивны.
Раскомментируйте конфигурации ключей хоста и укажите путь к соответствующему SSH-ключу для их активации:

Пример:

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```


## tcp_ssh_port {#tcp_ssh_port}

Порт для SSH-сервера, который позволяет пользователю подключаться и выполнять запросы в интерактивном режиме с использованием встроенного клиента через PTY.

Пример:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```


## storage_configuration {#storage_configuration}

Позволяет настроить многодисковую конфигурацию хранилища.

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

Конфигурация `disks` имеет следующую структуру:

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

Указанные выше подтеги определяют следующие параметры для `disks`:

| Параметр                | Описание                                                                                              |
| ----------------------- | ----------------------------------------------------------------------------------------------------- |
| `<disk_name_N>`         | Имя диска, которое должно быть уникальным.                                                            |
| `path`                  | Путь, по которому будут храниться данные сервера (каталоги `data` и `shadow`). Должен заканчиваться на `/` |
| `keep_free_space_bytes` | Размер зарезервированного свободного пространства на диске.                                           |

:::note
Порядок дисков не имеет значения.
:::

### Конфигурация политик {#configuration-of-policies}

Указанные выше подтеги определяют следующие параметры для `policies`:


| Setting                      | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`              | Имя политики. Имена политик должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `volume_name_N`              | Имя тома. Имена томов должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `disk`                       | Диск, находящийся внутри тома.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `max_data_part_size_bytes`   | Максимальный размер части данных, которая может находиться на любом из дисков в этом томе. Если в результате слияния ожидается, что размер части превысит `max_data_part_size_bytes`, эта часть будет записана в следующий том. По сути, эта функция позволяет хранить новые/небольшие части на «горячем» томе (SSD) и перемещать их на «холодный» том (HDD), когда они достигают большого размера. Не используйте эту опцию, если в политике только один том.                                      |
| `move_factor`                | Доля доступного свободного пространства на томе. Если свободного места становится меньше, данные начинают переноситься на следующий том, если он есть. Для переноса части сортируются по размеру от большей к меньшей (по убыванию) и выбираются те части, суммарный размер которых достаточен для выполнения условия `move_factor`. Если суммарный размер всех частей недостаточен, будут перенесены все части.                                                                                                    |
| `perform_ttl_move_on_insert` | Отключает перемещение данных с истёкшим TTL при вставке. По умолчанию (если включено), если мы вставляем часть данных, срок жизни которой уже истёк согласно правилу перемещения по TTL, она немедленно перемещается на том/диск, указанный в правиле перемещения. Это может существенно замедлить вставку, если целевой том/диск медленный (например, S3). Если опция отключена, просроченная часть данных записывается в том по умолчанию, а затем немедленно перемещается на том, указанный в правиле для истёкшего TTL. |
| `load_balancing`             | Политика балансировки между дисками: `round_robin` или `least_used`.                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `least_used_ttl_ms`          | Задаёт таймаут (в миллисекундах) для обновления доступного пространства на всех дисках (`0` — всегда обновлять, `-1` — никогда не обновлять, значение по умолчанию — `60000`). Учтите, что если диск используется только ClickHouse и к нему не будет применяться динамическое изменение размера файловой системы «на лету», вы можете использовать значение `-1`. Во всех остальных случаях это не рекомендуется, так как в итоге приведёт к некорректному распределению места.                                 |
| `prefer_not_to_merge`        | Отключает слияние частей данных на этом томе. Примечание: это потенциально вредно и может вызвать замедление. Когда этот параметр включён (не делайте так), слияние данных на этом томе запрещено (что плохо). Это позволяет управлять тем, как ClickHouse взаимодействует с медленными дисками. Мы рекомендуем вовсе не использовать этот параметр.                                                                                                                                                               |
| `volume_priority`            | Определяет приоритет (порядок), в котором заполняются тома. Чем меньше значение, тем выше приоритет. Значения параметра должны быть натуральными числами и без пропусков покрывать диапазон от 1 до N (где N — наибольшее указанное значение параметра).                                                                                                                                                                                                                                                        |

Для `volume_priority`:
- Если у всех томов задан этот параметр, они имеют приоритет в указанном порядке.
- Если он задан только у _части_ томов, тома без этого параметра имеют наименьший приоритет. Для томов с этим параметром приоритет задаётся значением параметра, приоритет остальных определяется порядком их описания в конфигурационном файле относительно друг друга.
- Если _ни одному_ тому этот параметр не задан, их порядок определяется порядком описания в конфигурационном файле.
- Приоритеты томов могут отличаться.



## macros {#macros}

Подстановка параметров для реплицируемых таблиц.

Можно не указывать, если реплицируемые таблицы не используются.

Подробнее см. раздел [Создание реплицируемых таблиц](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables).

**Пример**

```xml
<macros incl="macros" optional="true" />
```


## replica_group_name {#replica_group_name}

Имя группы реплик для реплицируемой базы данных (Replicated).

Кластер, создаваемый реплицируемой базой данных, будет состоять из реплик одной группы.
DDL-запросы будут ожидать выполнения только на репликах той же группы.

По умолчанию не задано.

**Пример**

```xml
<replica_group_name>backups</replica_group_name>
```


## remap_executable {#remap_executable}

Настройка для перераспределения памяти машинного кода («text») с использованием больших страниц памяти.

:::note
Эта функция находится на экспериментальной стадии разработки.
:::

Пример:

```xml
<remap_executable>false</remap_executable>
```


## max_open_files {#max_open_files}

Максимальное количество открытых файлов.

:::note
Рекомендуется использовать этот параметр в macOS, так как функция `getrlimit()` возвращает некорректное значение.
:::

**Пример**

```xml
<max_open_files>262144</max_open_files>
```


## max_session_timeout {#max_session_timeout}

Максимальное время ожидания сеанса в секундах.

Пример:

```xml
<max_session_timeout>3600</max_session_timeout>
```


## merge_tree {#merge_tree}

Тонкая настройка таблиц семейства [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

Дополнительную информацию см. в заголовочном файле MergeTreeSettings.h.

**Пример**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```


## metric_log {#metric_log}

По умолчанию отключено.

**Включение**

Чтобы вручную включить сбор истории метрик [`system.metric_log`](../../operations/system-tables/metric_log.md), создайте файл `/etc/clickhouse-server/config.d/metric_log.xml` со следующим содержимым:

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

Чтобы отключить настройку `metric_log`, создайте файл `/etc/clickhouse-server/config.d/disable_metric_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## replicated_merge_tree {#replicated_merge_tree}

Тонкая настройка для таблиц [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Эта настройка имеет более высокий приоритет.

Дополнительную информацию см. в заголовочном файле MergeTreeSettings.h.

**Пример**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```


## opentelemetry_span_log {#opentelemetry_span_log}

Настройки для системной таблицы [`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md).

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

Поддержка SSL обеспечивается библиотекой `libpoco`. Доступные параметры конфигурации описаны в файле [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h). Значения по умолчанию можно найти в файле [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp).

Ключи для настроек сервера и клиента:


| Параметр                      | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Значение по умолчанию                                                                      |
| ----------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `privateKeyFile`              | Путь к файлу с закрытым ключом сертификата в формате PEM. Файл может одновременно содержать и ключ, и сертификат.                                                                                                                                                                                                                                                                                                                                                             |                                                                                            |
| `certificateFile`             | Путь к файлу клиентского/серверного сертификата в формате PEM. Можно не указывать, если `privateKeyFile` содержит сертификат.                                                                                                                                                                                                                                                                                                                                                 |                                                                                            |
| `caConfig`                    | Путь к файлу или каталогу с доверенными сертификатами ЦС. Если указан файл, он должен быть в формате PEM и может содержать несколько сертификатов ЦС. Если указан каталог, он должен содержать по одному файлу .pem на каждый сертификат ЦС. Имена файлов определяются по хеш‑значению имени субъекта ЦС. Подробности приведены на man-странице [SSL&#95;CTX&#95;load&#95;verify&#95;locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html). |                                                                                            |
| `verificationMode`            | Метод проверки сертификатов узла. Подробнее см. описание класса [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h). Возможные значения: `none`, `relaxed`, `strict`, `once`.                                                                                                                                                                                                                                          | `relaxed`                                                                                  |
| `verificationDepth`           | Максимальная длина цепочки проверки. Проверка завершится с ошибкой, если длина цепочки сертификатов превысит заданное значение.                                                                                                                                                                                                                                                                                                                                               | `9`                                                                                        |
| `loadDefaultCAFile`           | Определяет, будут ли использоваться встроенные сертификаты УЦ для OpenSSL. По умолчанию ClickHouse предполагает, что встроенные сертификаты УЦ находятся в файле `/etc/ssl/cert.pem` (соответственно, в каталоге `/etc/ssl/certs`) или в файле (соответственно, каталоге), указанном в переменной окружения `SSL_CERT_FILE` (соответственно, `SSL_CERT_DIR`).                                                                                                                 | `true`                                                                                     |
| `cipherList`                  | Поддерживаемые алгоритмы шифрования OpenSSL.                                                                                                                                                                                                                                                                                                                                                                                                                                  | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`                                                  |
| `cacheSessions`               | Включает или отключает кеширование сессий. Должен использоваться совместно с `sessionIdContext`. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                        | `false`                                                                                    |
| `sessionIdContext`            | Уникальный набор случайных символов, который сервер добавляет к каждому сгенерированному идентификатору. Длина строки не должна превышать `SSL_MAX_SSL_SESSION_ID_LENGTH`. Использование этого параметра всегда рекомендуется, поскольку он помогает избежать проблем как при кэшировании сеанса на стороне сервера, так и когда клиент запрашивает кэширование.                                                                                                              | `$\{application.name\}`                                                                    |
| `sessionCacheSize`            | Максимальное количество сеансов, которые кэширует сервер. Значение `0` означает неограниченное количество сеансов.                                                                                                                                                                                                                                                                                                                                                            | [1024*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978) |
| `sessionTimeout`              | Время хранения сеанса в кэше на сервере (в часах).                                                                                                                                                                                                                                                                                                                                                                                                                            | `2`                                                                                        |
| `extendedVerification`        | Если параметр включён, проверяет, что CN или SAN сертификата совпадает с именем хоста удалённой стороны.                                                                                                                                                                                                                                                                                                                                                                      | `false`                                                                                    |
| `requireTLSv1`                | Требовать соединение по TLSv1. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                          | `false`                                                                                    |
| `requireTLSv1_1`              | Требовать подключение по TLSv1.1. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                       | `false`                                                                                    |
| `requireTLSv1_2`              | Требовать соединение по TLSv1.2. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                        | `false`                                                                                    |
| `fips`                        | Включает режим FIPS в OpenSSL. Поддерживается, если используемая версия библиотеки OpenSSL поддерживает FIPS.                                                                                                                                                                                                                                                                                                                                                                 | `false`                                                                                    |
| `privateKeyPassphraseHandler` | Класс (подкласс PrivateKeyPassphraseHandler), который запрашивает парольную фразу для доступа к закрытому ключу. Например: `<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`.                                                                                                                                                                                                  | `KeyConsoleHandler`                                                                        |
| `invalidCertificateHandler`   | Класс (подкласс CertificateHandler) для обработки недействительных сертификатов. Например: `<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>`.                                                                                                                                                                                                                                                                                  | `RejectCertificateHandler`                                                                 |
| `disableProtocols`            | Протоколы, которые запрещено использовать.                                                                                                                                                                                                                                                                                                                                                                                                                                    |                                                                                            |
| `preferServerCiphers`         | Серверные шифры с приоритетом клиента.                                                                                                                                                                                                                                                                                                                                                                                                                                        | `false`                                                                                    |

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


## part_log {#part_log}

Журналирование событий, связанных с [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Например, добавление или слияние данных. Журнал можно использовать для моделирования алгоритмов слияния и сравнения их характеристик. Процесс слияния можно визуализировать.

События регистрируются в таблице [system.part_log](/operations/system-tables/part_log), а не в отдельном файле. Имя этой таблицы можно настроить в параметре `table` (см. ниже).

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

Путь к каталогу с данными.

:::note
Завершающий слеш обязателен.
:::

**Пример**

```xml
<path>/var/lib/clickhouse/</path>
```


## processors_profile_log {#processors_profile_log}

Настройки системной таблицы [`processors_profile_log`](../system-tables/processors_profile_log.md).

<SystemLogParameters />

Настройки по умолчанию:

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

Предоставление данных метрик для сбора сервером [Prometheus](https://prometheus.io).

Настройки:

- `endpoint` – HTTP-эндпоинт для сбора метрик сервером Prometheus. Должен начинаться с '/'.
- `port` – Порт для `endpoint`.
- `metrics` – Предоставлять метрики из таблицы [system.metrics](/operations/system-tables/metrics).
- `events` – Предоставлять метрики из таблицы [system.events](/operations/system-tables/events).
- `asynchronous_metrics` – Предоставлять текущие значения метрик из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).
- `errors` – Предоставлять количество ошибок по кодам ошибок, произошедших с момента последнего перезапуска сервера. Эту информацию также можно получить из таблицы [system.errors](/operations/system-tables/errors).

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

Проверка (замените `127.0.0.1` на IP-адрес или имя хоста вашего сервера ClickHouse):

```bash
curl 127.0.0.1:9363/metrics
```


## query_log {#query_log}

Настройка для журналирования запросов, полученных с параметром [log_queries=1](../../operations/settings/settings.md).

Запросы записываются в таблицу [system.query_log](/operations/system-tables/query_log), а не в отдельный файл. Имя таблицы можно изменить в параметре `table` (см. ниже).

<SystemLogParameters />

Если таблица не существует, ClickHouse создаст её. Если структура журнала запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой переименовывается, и автоматически создаётся новая таблица.

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


## query_metric_log {#query_metric_log}

По умолчанию отключён.

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

Чтобы отключить настройку `query_metric_log`, создайте файл `/etc/clickhouse-server/config.d/disable_query_metric_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters />


## query_cache {#query_cache}

Конфигурация [кеша запросов](../query-cache.md).

Доступны следующие настройки:

| Настройка                 | Описание                                                                             | Значение по умолчанию |
| ------------------------- | ------------------------------------------------------------------------------------ | ------------- |
| `max_size_in_bytes`       | Максимальный размер кеша в байтах. Значение `0` означает, что кеш запросов отключен. | `1073741824`  |
| `max_entries`             | Максимальное количество результатов запросов `SELECT`, сохраняемых в кеше.           | `1024`        |
| `max_entry_size_in_bytes` | Максимальный размер в байтах результатов запросов `SELECT`, которые могут быть сохранены в кеше. | `1048576`     |
| `max_entry_size_in_rows`  | Максимальное количество строк в результатах запросов `SELECT`, которые могут быть сохранены в кеше. | `30000000`    |

:::note

- Изменения настроек вступают в силу немедленно.
- Данные кеша запросов размещаются в оперативной памяти (DRAM). При нехватке памяти рекомендуется установить небольшое значение для `max_size_in_bytes` или полностью отключить кеш запросов.
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


## query_thread_log {#query_thread_log}

Настройка для логирования потоков запросов, полученных с настройкой [log_query_threads=1](/operations/settings/settings#log_query_threads).

Запросы логируются в таблицу [system.query_thread_log](/operations/system-tables/query_thread_log), а не в отдельный файл. Имя таблицы можно изменить в параметре `table` (см. ниже).

<SystemLogParameters />

Если таблица не существует, ClickHouse создаст её. Если структура журнала потоков запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой переименовывается, и автоматически создаётся новая таблица.

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


## query_views_log {#query_views_log}

Настройка для логирования представлений (live, материализованных и т.д.), зависящих от запросов, полученных с настройкой [log_query_views=1](/operations/settings/settings#log_query_views).

Запросы логируются в таблице [system.query_views_log](/operations/system-tables/query_views_log), а не в отдельном файле. Имя таблицы можно изменить в параметре `table` (см. ниже).

<SystemLogParameters />

Если таблица не существует, ClickHouse создаст её. Если структура журнала представлений запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой переименовывается, и автоматически создаётся новая таблица.

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


## text_log {#text_log}

Настройки системной таблицы [text_log](/operations/system-tables/text_log) для журналирования текстовых сообщений.

<SystemLogParameters />

Дополнительно:

| Настройка | Описание                                                                 | Значение по умолчанию |
| ------- | --------------------------------------------------------------------------- | ------------- |
| `level` | Максимальный уровень сообщений (по умолчанию `Trace`), которые будут сохраняться в таблице. | `Trace`       |

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


## trace_log {#trace_log}

Настройки для работы системной таблицы [trace_log](/operations/system-tables/trace_log).

<SystemLogParameters />

Файл конфигурации сервера по умолчанию `config.xml` содержит следующую секцию настроек:

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


## asynchronous_insert_log {#asynchronous_insert_log}

Настройки для системной таблицы [asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log), предназначенной для журналирования асинхронных вставок.

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


## crash_log {#crash_log}

Настройки для работы системной таблицы [crash_log](../../operations/system-tables/crash_log.md).

Следующие настройки могут быть заданы с помощью подтегов:

| Настройка                          | Описание                                                                                                                                     | По умолчанию        | Примечание                                                                                                         |
| ---------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `database`                         | Имя базы данных.                                                                                                                             |                     |                                                                                                                    |
| `table`                            | Имя системной таблицы.                                                                                                                       |                     |                                                                                                                    |
| `engine`                           | [Определение движка MergeTree](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-creating-a-table) для системной таблицы. |                     | Не может использоваться, если определены `partition_by` или `order_by`. Если не указано, по умолчанию используется `MergeTree`        |
| `partition_by`                     | [Пользовательский ключ партиционирования](/engines/table-engines/mergetree-family/custom-partitioning-key.md) для системной таблицы.            |                     | Если для системной таблицы указан `engine`, параметр `partition_by` должен быть указан непосредственно внутри 'engine'   |
| `ttl`                              | Задает [TTL](/engines/table-engines/mergetree-family/mergetree#table_engine-mergetree-ttl) таблицы.                                     |                     | Если для системной таблицы указан `engine`, параметр `ttl` должен быть указан непосредственно внутри 'engine'            |
| `order_by`                         | [Пользовательский ключ сортировки](/engines/table-engines/mergetree-family/mergetree#order_by) для системной таблицы. Не может использоваться, если определен `engine`.      |                     | Если для системной таблицы указан `engine`, параметр `order_by` должен быть указан непосредственно внутри 'engine'       |
| `storage_policy`                   | Имя политики хранения, используемой для таблицы (необязательно).                                                                                  |                     | Если для системной таблицы указан `engine`, параметр `storage_policy` должен быть указан непосредственно внутри 'engine' |
| `settings`                         | [Дополнительные параметры](/engines/table-engines/mergetree-family/mergetree/#settings), управляющие поведением MergeTree (необязательно).  |                     | Если для системной таблицы указан `engine`, параметр `settings` должен быть указан непосредственно внутри 'engine'       |
| `flush_interval_milliseconds`      | Интервал сброса данных из буфера в памяти в таблицу.                                                                           | `7500`              |                                                                                                                    |
| `max_size_rows`                    | Максимальный размер логов в строках. Когда количество несброшенных логов достигает max_size, логи сбрасываются на диск.                   | `1024`              |                                                                                                                    |
| `reserved_size_rows`               | Предварительно выделенный размер памяти в строках для логов.                                                                                             | `1024`              |                                                                                                                    |
| `buffer_size_rows_flush_threshold` | Пороговое значение количества строк. При достижении порога сброс логов на диск запускается в фоновом режиме.                             | `max_size_rows / 2` |                                                                                                                    |
| `flush_on_crash`                   | Определяет, должны ли логи сбрасываться на диск в случае сбоя.                                                                           | `false`             |                                                                                                                    |

Файл конфигурации сервера по умолчанию `config.xml` содержит следующую секцию настроек:

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


## custom_cached_disks_base_directory {#custom_cached_disks_base_directory}

Эта настройка задает путь к кешу для пользовательских кешируемых дисков (созданных из SQL).
Для пользовательских дисков параметр `custom_cached_disks_base_directory` имеет более высокий приоритет, чем `filesystem_caches_path` (находится в `filesystem_caches_path.xml`),
который используется при отсутствии первого.
Путь настройки кеша файловой системы должен находиться внутри этого каталога,
иначе будет выброшено исключение, препятствующее созданию диска.

:::note
Это не повлияет на диски, созданные в более старой версии, с которой был выполнен апгрейд сервера.
В этом случае исключение не будет выброшено, чтобы сервер мог успешно запуститься.
:::

Пример:

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```


## backup_log {#backup_log}

Настройки системной таблицы [backup_log](../../operations/system-tables/backup_log.md) для регистрации операций `BACKUP` и `RESTORE`.

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


## blob_storage_log {#blob_storage_log}

Настройки для системной таблицы [`blob_storage_log`](../system-tables/blob_storage_log.md).

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


## query_masking_rules {#query_masking_rules}

Правила на основе регулярных выражений, которые применяются к запросам и всем сообщениям журналов перед их сохранением в журналы сервера,
таблицы [`system.query_log`](/operations/system-tables/query_log), [`system.text_log`](/operations/system-tables/text_log), [`system.processes`](/operations/system-tables/processes), а также в журналы, отправляемые клиенту. Это позволяет предотвратить
утечку конфиденциальных данных из SQL-запросов, таких как имена, адреса электронной почты, персональные идентификаторы или номера кредитных карт.

**Пример**

```xml
<query_masking_rules>
    <rule>
        <name>hide SSN</name>
        <regexp>(^|\D)\d{3}-\d{2}-\d{4}($|\D)</regexp>
        <replace>000-00-0000</replace>
    </rule>
</query_masking_rules>
```

**Поля конфигурации**:

| Параметр  | Описание                                                                                  |
| --------- | ----------------------------------------------------------------------------------------- |
| `name`    | имя правила (необязательный параметр)                                                     |
| `regexp`  | регулярное выражение, совместимое с RE2 (обязательный параметр)                           |
| `replace` | строка замены для конфиденциальных данных (необязательный параметр, по умолчанию — шесть звездочек) |

Правила маскирования применяются ко всему запросу (для предотвращения утечек конфиденциальных данных из некорректных или не поддающихся синтаксическому разбору запросов).

Таблица [`system.events`](/operations/system-tables/events) содержит счетчик `QueryMaskingRulesMatch`, который показывает общее количество срабатываний правил маскирования запросов.

Для распределенных запросов каждый сервер должен быть настроен отдельно, в противном случае подзапросы, передаваемые на другие
узлы, будут сохраняться без маскирования.


## remote_servers {#remote_servers}

Конфигурация кластеров, используемых движком таблиц [Distributed](../../engines/table-engines/special/distributed.md) и табличной функцией `cluster`.

**Пример**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

Значение атрибута `incl` см. в разделе «[Конфигурационные файлы](/operations/configuration-files)».

**См. также**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [Обнаружение кластеров](../../operations/cluster-discovery.md)
- [Движок баз данных Replicated](../../engines/database-engines/replicated.md)


## remote_url_allow_hosts {#remote_url_allow_hosts}

Список хостов, которые разрешено использовать в движках хранения и табличных функциях, работающих с URL.

При добавлении хоста с помощью XML-тега `\<host\>`:

- он должен быть указан точно так же, как в URL, поскольку имя проверяется до разрешения DNS. Например: `<host>clickhouse.com</host>`
- если порт явно указан в URL, то проверяется комбинация host:port целиком. Например: `<host>clickhouse.com:80</host>`
- если хост указан без порта, то разрешён любой порт этого хоста. Например: если указан `<host>clickhouse.com</host>`, то разрешены `clickhouse.com:20` (FTP), `clickhouse.com:80` (HTTP), `clickhouse.com:443` (HTTPS) и т. д.
- если хост указан как IP-адрес, то он проверяется в том виде, в котором указан в URL. Например: `[2a02:6b8:a::a]`.
- если есть перенаправления и поддержка перенаправлений включена, то проверяется каждое перенаправление (поле location).

Например:

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```


## timezone {#timezone}

Часовой пояс сервера.

Указывается в виде идентификатора IANA для часового пояса UTC или географического местоположения (например, Africa/Abidjan).

Часовой пояс необходим для преобразования между форматами String и DateTime при выводе полей DateTime в текстовом формате (на экран или в файл), а также при получении DateTime из строки. Кроме того, часовой пояс используется в функциях для работы со временем и датой, если часовой пояс не был передан во входных параметрах.

**Пример**

```xml
<timezone>Asia/Istanbul</timezone>
```

**См. также**

- [session_timezone](../settings/settings.md#session_timezone)


## tcp_port {#tcp_port}

Порт для взаимодействия с клиентами по протоколу TCP.

**Пример**

```xml
<tcp_port>9000</tcp_port>
```


## tcp_port_secure {#tcp_port_secure}

TCP-порт для защищённого соединения с клиентами. Используется с настройками [OpenSSL](#openssl).

**Значение по умолчанию**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```


## mysql_port {#mysql_port}

Порт для взаимодействия с клиентами по протоколу MySQL.

:::note

- Положительные целые числа указывают номер порта для прослушивания
- Пустые значения используются для отключения взаимодействия с клиентами по протоколу MySQL.
  :::

**Пример**

```xml
<mysql_port>9004</mysql_port>
```


## postgresql_port {#postgresql_port}

Порт для взаимодействия с клиентами по протоколу PostgreSQL.

:::note

- Положительные целые числа задают номер порта для прослушивания
- Пустые значения используются для отключения взаимодействия с клиентами по протоколу PostgreSQL.
  :::

**Пример**

```xml
<postgresql_port>9005</postgresql_port>
```


## mysql_require_secure_transport {#mysql_require_secure_transport}

Если установлено значение true, для клиентов требуется защищённое соединение через [mysql_port](#mysql_port). Подключение с параметром `--ssl-mode=none` будет отклонено. Используйте совместно с настройками [OpenSSL](#openssl).


## postgresql_require_secure_transport {#postgresql_require_secure_transport}

Если установлено значение true, для клиентов требуется защищённое соединение через [postgresql_port](#postgresql_port). Подключение с параметром `sslmode=disable` будет отклонено. Используйте совместно с настройками [OpenSSL](#openssl).


## tmp_path {#tmp_path}

Путь в локальной файловой системе для хранения временных данных при обработке больших запросов.

:::note

- Для настройки хранилища временных данных можно использовать только один из параметров: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
- Завершающий слеш обязателен.
  :::

**Пример**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```


## url_scheme_mappers {#url_scheme_mappers}

Конфигурация для преобразования сокращённых или символьных префиксов URL в полные URL.

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


## user_files_path {#user_files_path}

Директория с пользовательскими файлами. Используется в табличных функциях [file()](../../sql-reference/table-functions/file.md), [fileCluster()](../../sql-reference/table-functions/fileCluster.md).

**Пример**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```


## user_scripts_path {#user_scripts_path}

Директория с файлами пользовательских скриптов. Используется для исполняемых пользовательских функций [Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions).

**Пример**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

Тип:

По умолчанию:


## user_defined_path {#user_defined_path}

Директория с пользовательскими файлами. Используется для пользовательских функций SQL [Пользовательские функции SQL](/sql-reference/functions/udf).

**Пример**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```


## users_config {#users_config}

Путь к файлу, содержащему:

- Конфигурации пользователей.
- Права доступа.
- Профили настроек.
- Настройки квот.

**Пример**

```xml
<users_config>users.xml</users_config>
```


## access_control_improvements {#access_control_improvements}

Настройки для дополнительных улучшений системы контроля доступа.

| Настройка                                       | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | По умолчанию |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `users_without_row_policies_can_read_rows`      | Определяет, могут ли пользователи без разрешающих политик строк читать строки с помощью запроса `SELECT`. Например, если есть два пользователя A и B, и политика строк определена только для A, то при значении true пользователь B увидит все строки. При значении false пользователь B не увидит ни одной строки.                                                                                                                                                                                    | `true`  |
| `on_cluster_queries_require_cluster_grant`      | Определяет, требуют ли запросы `ON CLUSTER` привилегии `CLUSTER`.                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `true`  |
| `select_from_system_db_requires_grant`          | Определяет, требует ли запрос `SELECT * FROM system.<table>` каких-либо привилегий и может ли быть выполнен любым пользователем. При значении true этот запрос требует `GRANT SELECT ON system.<table>` так же, как и для несистемных таблиц. Исключения: несколько системных таблиц (`tables`, `columns`, `databases` и некоторые константные таблицы, такие как `one`, `contributors`) остаются доступными для всех; и если предоставлена привилегия `SHOW` (например, `SHOW USERS`), то соответствующая системная таблица (т. е. `system.users`) будет доступна. | `true`  |
| `select_from_information_schema_requires_grant` | Определяет, требует ли запрос `SELECT * FROM information_schema.<table>` каких-либо привилегий и может ли быть выполнен любым пользователем. При значении true этот запрос требует `GRANT SELECT ON information_schema.<table>` так же, как и для обычных таблиц.                                                                                                                                                                                                                                                 | `true`  |
| `settings_constraints_replace_previous`         | Определяет, будет ли ограничение в профиле настроек для некоторой настройки отменять действия предыдущего ограничения (определенного в других профилях) для этой настройки, включая поля, которые не установлены новым ограничением. Также включает тип ограничения `changeable_in_readonly`.                                                                                                                                                                                                            | `true`  |
| `table_engines_require_grant`                   | Определяет, требует ли создание таблицы с определенным движком таблицы привилегии.                                                                                                                                                                                                                                                                                                                                                                                                                                     | `false` |
| `role_cache_expiration_time_seconds`            | Устанавливает количество секунд с момента последнего обращения, в течение которых роль хранится в кэше ролей.                                                                                                                                                                                                                                                                                                                                                                                                           | `600`   |

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


## s3queue_log {#s3queue_log}

Настройки системной таблицы `s3queue_log`.

<SystemLogParameters />

Настройки по умолчанию:

```xml
<s3queue_log>
    <database>system</database>
    <table>s3queue_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</s3queue_log>
```


## dead_letter_queue {#dead_letter_queue}

Настройка системной таблицы `dead_letter_queue`.

<SystemLogParameters />

Настройки по умолчанию:

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

| Настройка                                  | Описание                                                                                                                                                                                                                     |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node`                                     | Конечная точка ZooKeeper. Можно указать несколько конечных точек. Например: `<node index="1"><host>example_host</host><port>2181</port></node>`. Атрибут `index` определяет порядок узлов при попытке подключения к кластеру ZooKeeper. |
| `session_timeout_ms`                       | Максимальное время ожидания клиентской сессии в миллисекундах.                                                                                                                                                               |
| `operation_timeout_ms`                     | Максимальное время ожидания одной операции в миллисекундах.                                                                                                                                                                  |
| `root` (необязательно)                     | Узел znode, который используется в качестве корневого для узлов znode, используемых сервером ClickHouse.                                                                                                                    |
| `fallback_session_lifetime.min` (необязательно) | Минимальное ограничение времени жизни сессии zookeeper к резервному узлу, когда основной узел недоступен (балансировка нагрузки). Указывается в секундах. По умолчанию: 3 часа.                                             |
| `fallback_session_lifetime.max` (необязательно) | Максимальное ограничение времени жизни сессии zookeeper к резервному узлу, когда основной узел недоступен (балансировка нагрузки). Указывается в секундах. По умолчанию: 6 часов.                                           |
| `identity` (необязательно)                 | Имя пользователя и пароль, требуемые ZooKeeper для доступа к запрашиваемым узлам znode.                                                                                                                                     |
| `use_compression` (необязательно)          | Включает сжатие в протоколе Keeper, если установлено значение true.                                                                                                                                                         |

Также существует настройка `zookeeper_load_balancing` (необязательно), которая позволяет выбрать алгоритм выбора узла ZooKeeper:

| Название алгоритма              | Описание                                                                                                                       |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `random`                        | случайным образом выбирает один из узлов ZooKeeper.                                                                            |
| `in_order`                      | выбирает первый узел ZooKeeper, если он недоступен, то второй, и так далее.                                                    |
| `nearest_hostname`              | выбирает узел ZooKeeper с именем хоста, наиболее похожим на имя хоста сервера, имя хоста сравнивается по префиксу имени.      |
| `hostname_levenshtein_distance` | аналогично nearest_hostname, но сравнивает имя хоста с использованием расстояния Левенштейна.                                  |
| `first_or_random`               | выбирает первый узел ZooKeeper, если он недоступен, то случайным образом выбирает один из оставшихся узлов ZooKeeper.          |
| `round_robin`                   | выбирает первый узел ZooKeeper, при переподключении выбирает следующий.                                                        |

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
    <!-- Необязательно. Суффикс chroot. Должен существовать. -->
    <root>/path/to/zookeeper/node</root>
    <!-- Необязательно. Строка digest ACL для Zookeeper. -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**См. также**

- [Репликация](../../engines/table-engines/mergetree-family/replication.md)
- [Руководство программиста ZooKeeper](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [Необязательная защищенная связь между ClickHouse и Zookeeper](/operations/ssl-zookeeper)


## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper}

Метод хранения заголовков кусков данных в ZooKeeper. Эта настройка применяется только к семейству [`MergeTree`](/engines/table-engines/mergetree-family). Она может быть указана:

**Глобально в секции [merge_tree](#merge_tree) файла `config.xml`**

ClickHouse использует эту настройку для всех таблиц на сервере. Настройку можно изменить в любое время. Существующие таблицы изменяют свое поведение при изменении настройки.

**Для каждой таблицы**

При создании таблицы укажите соответствующую [настройку движка](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table). Поведение существующей таблицы с этой настройкой не изменяется, даже если изменится глобальная настройка.

**Возможные значения**

- `0` — функциональность отключена.
- `1` — функциональность включена.

Если [`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper), то [реплицируемые](../../engines/table-engines/mergetree-family/replication.md) таблицы хранят заголовки кусков данных компактно, используя один `znode`. Если таблица содержит много столбцов, этот метод хранения значительно сокращает объем данных, хранящихся в Zookeeper.

:::note
После применения `use_minimalistic_part_header_in_zookeeper = 1` невозможно откатить сервер ClickHouse до версии, которая не поддерживает эту настройку. Будьте осторожны при обновлении ClickHouse на серверах в кластере. Не обновляйте все серверы одновременно. Безопаснее тестировать новые версии ClickHouse в тестовой среде или только на нескольких серверах кластера.

Заголовки кусков данных, уже сохраненные с этой настройкой, невозможно восстановить в их предыдущее (некомпактное) представление.
:::


## distributed_ddl {#distributed_ddl}

Управление выполнением [распределённых DDL-запросов](../../sql-reference/distributed-ddl.md) (`CREATE`, `DROP`, `ALTER`, `RENAME`) на кластере.
Работает только при включённом [ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper).

Настраиваемые параметры в секции `<distributed_ddl>`:

| Параметр               | Описание                                                                                                                          | Значение по умолчанию                  |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `path`                 | путь в Keeper для очереди задач (`task_queue`) DDL-запросов                                                                      |                                        |
| `profile`              | профиль, используемый для выполнения DDL-запросов                                                                                 |                                        |
| `pool_size`            | количество запросов `ON CLUSTER`, которые могут выполняться одновременно                                                          |                                        |
| `max_tasks_in_queue`   | максимальное количество задач в очереди                                                                                           | `1,000`                                |
| `task_max_lifetime`    | удаление узла, если его возраст превышает указанное значение                                                                      | `7 * 24 * 60 * 60` (неделя в секундах) |
| `cleanup_delay_period` | очистка запускается после получения события нового узла, если последняя очистка была выполнена не ранее чем `cleanup_delay_period` секунд назад | `60` секунд                            |

**Пример**

```xml
<distributed_ddl>
    <!-- Путь в ZooKeeper к очереди DDL-запросов -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- Настройки из этого профиля будут использоваться для выполнения DDL-запросов -->
    <profile>default</profile>

    <!-- Управляет количеством запросов ON CLUSTER, которые могут выполняться одновременно -->
    <pool_size>1</pool_size>

    <!--
         Настройки очистки (активные задачи не удаляются)
    -->

    <!-- Управляет TTL задачи (по умолчанию 1 неделя) -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- Управляет частотой выполнения очистки (в секундах) -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- Управляет максимальным количеством задач в очереди -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```


## access_control_path {#access_control_path}

Путь к папке, где сервер ClickHouse хранит конфигурации пользователей и ролей, созданных SQL-командами.

**См. также**

- [Управление доступом и учётными записями](/operations/access-rights#access-control-usage)


## allow_plaintext_password {#allow_plaintext_password}

Определяет, разрешено ли использование паролей в открытом виде (небезопасно).

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```


## allow_no_password {#allow_no_password}

Определяет, разрешён ли небезопасный тип пароля no_password.

```xml
<allow_no_password>1</allow_no_password>
```


## allow_implicit_no_password {#allow_implicit_no_password}

Запрещает создание пользователя без пароля, если явно не указано `IDENTIFIED WITH no_password`.

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```


## default_session_timeout {#default_session_timeout}

Тайм-аут сеанса по умолчанию, в секундах.

```xml
<default_session_timeout>60</default_session_timeout>
```


## default_password_type {#default_password_type}

Задает тип пароля, который будет автоматически использоваться в запросах вида `CREATE USER u IDENTIFIED BY 'p'`.

Допустимые значения:

- `plaintext_password`
- `sha256_password`
- `double_sha1_password`
- `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```


## user_directories {#user_directories}

Раздел конфигурационного файла, содержащий настройки:

- Путь к конфигурационному файлу с предопределёнными пользователями.
- Путь к папке, в которой хранятся пользователи, созданные SQL-командами.
- Путь к узлу ZooKeeper, в котором хранятся и реплицируются пользователи, созданные SQL-командами.

Если этот раздел указан, пути из [users_config](/operations/server-configuration-parameters/settings#users_config) и [access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path) использоваться не будут.

Раздел `user_directories` может содержать любое количество элементов, порядок элементов определяет их приоритет (чем выше элемент в списке, тем выше его приоритет).

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

Пользователи, роли, политики строк, квоты и профили также могут храниться в ZooKeeper:

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

Также можно определить разделы `memory` — для хранения информации только в памяти, без записи на диск, и `ldap` — для хранения информации на LDAP-сервере.

Чтобы добавить LDAP-сервер в качестве удалённого каталога пользователей, не определённых локально, создайте один раздел `ldap` со следующими настройками:

| Настройка  | Описание                                                                                                                                                                                                                                                                                                                                                                    |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `server` | Одно из имён LDAP-серверов, определённых в разделе конфигурации `ldap_servers`. Этот параметр обязателен и не может быть пустым.                                                                                                                                                                                                                                            |
| `roles`  | Раздел со списком локально определённых ролей, которые будут назначены каждому пользователю, полученному с LDAP-сервера. Если роли не указаны, пользователь не сможет выполнять никакие действия после аутентификации. Если какая-либо из перечисленных ролей не определена локально на момент аутентификации, попытка аутентификации завершится неудачей, как если бы был указан неверный пароль. |

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


## top_level_domains_list {#top_level_domains_list}

Определяет список пользовательских доменов верхнего уровня для добавления, где каждая запись имеет формат `<name>/path/to/file</name>`.

Например:

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

См. также:

- функция [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cutToFirstSignificantSubdomainCustom) и её варианты,
  которая принимает имя пользовательского списка доменов верхнего уровня и возвращает часть домена, включающую поддомены верхнего уровня до первого значимого поддомена.


## proxy {#proxy}

Определение прокси-серверов для HTTP и HTTPS запросов. В настоящее время поддерживается для хранилища S3, табличных функций S3 и функций URL.

Существует три способа определения прокси-серверов:

- переменные окружения
- списки прокси
- удалённые резолверы прокси.

Также поддерживается обход прокси-серверов для конкретных хостов с использованием `no_proxy`.

**Переменные окружения**

Переменные окружения `http_proxy` и `https_proxy` позволяют указать
прокси-сервер для заданного протокола. Если они установлены в вашей системе, всё должно работать без проблем.

Это самый простой подход, если для данного протокола используется
только один прокси-сервер, который не изменяется.

**Списки прокси**

Этот подход позволяет указать один или несколько
прокси-серверов для протокола. Если определено более одного прокси-сервера,
ClickHouse использует различные прокси по принципу round-robin, распределяя
нагрузку между серверами. Это самый простой подход, если для протокола используется более
одного прокси-сервера, и список прокси-серверов не изменяется.

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

Выберите родительское поле на вкладках ниже, чтобы просмотреть его дочерние элементы:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| Поле      | Описание                                     |
| --------- | -------------------------------------------- |
| `<http>`  | Список из одного или нескольких HTTP прокси  |
| `<https>` | Список из одного или нескольких HTTPS прокси |

  </TabItem>
  <TabItem value="http_https" label="<http> и <https>">

| Поле    | Описание           |
| ------- | ------------------ |
| `<uri>` | URI прокси-сервера |

  </TabItem>
</Tabs>

**Удалённые резолверы прокси**

Возможна ситуация, когда прокси-серверы изменяются динамически. В таком
случае можно определить конечную точку резолвера. ClickHouse отправляет
пустой GET запрос на эту конечную точку, а удалённый резолвер должен вернуть хост прокси.
ClickHouse использует его для формирования URI прокси по следующему шаблону: `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

Выберите родительское поле на вкладках ниже, чтобы просмотреть его дочерние элементы:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| Поле      | Описание                                     |
| --------- | -------------------------------------------- |
| `<http>`  | Список из одного или нескольких резолверов\* |
| `<https>` | Список из одного или нескольких резолверов\* |

  </TabItem>
  <TabItem value="http_https" label="<http> и <https>">

| Поле         | Описание                                        |
| ------------ | ----------------------------------------------- |
| `<resolver>` | Конечная точка и другие параметры для резолвера |

:::note
Можно указать несколько элементов `<resolver>`, но используется только первый
`<resolver>` для данного протокола. Любые другие элементы `<resolver>`
для этого протокола игнорируются. Это означает, что балансировка нагрузки
(при необходимости) должна быть реализована удалённым резолвером.
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| Поле                 | Описание                                                                                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `<endpoint>`         | URI резолвера прокси                                                                                                                                                                                         |
| `<proxy_scheme>`     | Протокол итогового URI прокси. Может быть либо `http`, либо `https`.                                                                                                                                        |
| `<proxy_port>`       | Номер порта резолвера прокси                                                                                                                                                                                 |
| `<proxy_cache_time>` | Время в секундах, в течение которого значения от резолвера должны кэшироваться в ClickHouse. Установка этого значения в `0` приводит к тому, что ClickHouse обращается к резолверу при каждом HTTP или HTTPS запросе. |

  </TabItem>
</Tabs>

**Приоритет**

Настройки прокси определяются в следующем порядке:


| Порядок | Настройка                  |
|--------|----------------------------|
| 1.     | Удалённые прокси-резолверы |
| 2.     | Списки прокси              |
| 3.     | Переменные окружения       |

ClickHouse проверяет тип резолвера с наивысшим приоритетом для протокола запроса. Если он не задан,
проверяется следующий по приоритету тип резолвера, пока не будет достигнут резолвер, использующий переменные окружения.
Это также позволяет использовать комбинацию различных типов резолверов.



## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy}

По умолчанию для выполнения `HTTPS`-запросов через `HTTP`-прокси используется туннелирование (т. е. `HTTP CONNECT`). Эта настройка позволяет его отключить.

**no_proxy**

По умолчанию все запросы проходят через прокси-сервер. Чтобы отключить прокси для определённых хостов, необходимо задать переменную `no_proxy`.
Её можно указать внутри секции `<proxy>` для списочных и удалённых резолверов, а также в качестве переменной окружения для резолвера окружения.
Поддерживаются IP-адреса, домены, поддомены и символ подстановки `'*'` для полного обхода прокси. Ведущие точки удаляются аналогично curl.

**Пример**

Приведённая ниже конфигурация обходит прокси для запросов к `clickhouse.cloud` и всем его поддоменам (например, `auth.clickhouse.cloud`).
То же самое относится к GitLab, несмотря на наличие ведущей точки. И `gitlab.com`, и `about.gitlab.com` будут обходить прокси.

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


## workload_path {#workload_path}

Директория, используемая для хранения всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. По умолчанию используется папка `/workload/` в рабочем каталоге сервера.

**Пример**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**См. также**

- [Иерархия рабочих нагрузок](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)


## workload_zookeeper_path {#workload_zookeeper_path}

Путь к узлу ZooKeeper, который используется в качестве хранилища для всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. Для обеспечения согласованности все SQL-определения хранятся как значение этого единственного znode. По умолчанию ZooKeeper не используется, и определения хранятся на [диске](#workload_path).

**Пример**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**См. также**

- [Иерархия рабочих нагрузок](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)


## zookeeper_log {#zookeeper_log}

Настройки системной таблицы [`zookeeper_log`](/operations/system-tables/zookeeper_log).

Следующие настройки можно задать с помощью подтегов:

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
