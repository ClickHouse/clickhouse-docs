## asynchronous_metric_log {#asynchronous_metric_log}

Включен по умолчанию в развертываниях ClickHouse Cloud.

Если настройка не включена по умолчанию в вашей среде, в зависимости от способа установки ClickHouse, вы можете следовать приведенным ниже инструкциям, чтобы включить или отключить её.

**Включение**

Чтобы вручную включить сбор истории журналов асинхронных метрик [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md), создайте `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` со следующим содержимым:

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

Чтобы отключить настройку `asynchronous_metric_log`, создайте следующий файл `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` со следующим содержимым:

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters/>
## auth_use_forwarded_address {#auth_use_forwarded_address}

Использовать исходный адрес для аутентификации клиентов, подключенных через прокси.

:::note
Эту настройку следует использовать с особой осторожностью, поскольку перенаправленные адреса можно легко подделать - сервера, принимающие такую аутентификацию, не должны быть доступны напрямую, а только через доверенный прокси.
:::
## backups {#backups}

Настройки для резервных копий, используемых при записи `BACKUP TO File()`.

Следующие настройки можно настроить с помощью под-тегов:

| Настройка                           | Описание                                                                                                                                                                   | По умолчанию |
|-------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| `allowed_path`                      | Путь к резервной копии при использовании `File()`. Эта настройка должна быть установлена для использования `File`. Путь может быть относительным к директории экземпляра или абсолютным. | `true`       |
| `remove_backup_files_after_failure` | Если команда `BACKUP` завершилась неудачей, ClickHouse попытается удалить файлы, которые уже были скопированы в резервную копию до сбоя, в противном случае он оставит скопированные файлы как есть. | `true`       |

Эта настройка по умолчанию конфигурируется следующим образом:

```xml
<backups>
    <allowed_path>backups</allowed_path>
    <remove_backup_files_after_failure>true</remove_backup_files_after_failure>
</backups>
```
## bcrypt_workfactor {#bcrypt_workfactor}

Фактор работы для аутентификационного типа bcrypt_password, который использует [алгоритм Bcrypt](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/).

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```
## table_engines_require_grant {#table_engines_require_grant}

Если установлено в true, пользователям требуется разрешение для создания таблицы с определённым движком, например, `GRANT TABLE ENGINE ON TinyLog to user`.

:::note
По умолчанию, для обратной совместимости создание таблицы с определённым движком игнорирует разрешение, однако вы можете изменить это поведение, установив true.
:::
## builtin_dictionaries_reload_interval {#builtin_dictionaries_reload_interval}

Интервал в секундах перед перезагрузкой встроенных словарей.

ClickHouse перезагружает встроенные словари каждые x секунд. Это позволяет редактировать словари "на лету" без перезапуска сервера.

**Пример**

```xml
<builtin_dictionaries_reload_interval>3600</builtin_dictionaries_reload_interval>
```
## compression {#compression}

Настройки сжатия данных для таблиц с движком [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

:::note
Мы рекомендуем не изменять это, если вы только начали использовать ClickHouse.
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

- `min_part_size` – Минимальный размер части данных.
- `min_part_size_ratio` – Отношение размера части данных к размеру таблицы.
- `method` – Метод сжатия. Допустимые значения: `lz4`, `lz4hc`, `zstd`,`deflate_qpl`.
- `level` – Уровень сжатия. См. [Codecs](/sql-reference/statements/create/table#general-purpose-codecs).

:::note
Вы можете настроить несколько секций `<case>`.
:::

**Действия при выполнении условий**:

- Если часть данных соответствуют установленному условию, ClickHouse использует указанный метод сжатия.
- Если часть данных соответствует нескольким наборам условий, ClickHouse использует первый совпавший набор условий.

:::note
Если для части данных не выполняется ни одно условие, ClickHouse использует сжатие `lz4`.
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

Настраивает команду для получения ключа, используемого кодеками [шифрования](/sql-reference/statements/create/table#encryption-codecs). Ключ (или ключи) должен быть записан в переменных окружения или установлен в конфигурационном файле.

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
Хранение ключей в конфигурационном файле не рекомендуется. Это небезопасно. Вы можете перенести ключи в отдельный конфигурационный файл на защищённом диске и создать символическую ссылку на этот конфигурационный файл в папке `config.d/`.
:::

Загрузка из конфигурации, когда ключ находится в шестнадцатеричном формате:

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

Здесь `current_key_id` устанавливает текущий ключ для шифрования, и все указанные ключи могут быть использованы для расшифровки.

Каждый из этих методов может быть применен к нескольким ключам:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <key_hex id="0">00112233445566778899aabbccddeeff</key_hex>
        <key_hex id="1" from_env="ENVVAR"></key_hex>
        <current_key_id>1</current_key_id>
    </aes_128_gcm_siv>
</encryption_codecs>
```

Здесь `current_key_id` показывает текущий ключ для шифрования.

Кроме того, пользователи могут добавить nonce, который должен иметь длину 12 байт (по умолчанию процессы шифрования и расшифрования используют nonce, состоящий из нулевых байтов):

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

Или он может быть установлен в шестнадцатеричном формате:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```
:::note
Все упомянутое выше может быть применимо к `aes_256_gcm_siv` (но ключ должен быть длиной 32 байта).
:::
## error_log {#error_log}

По умолчанию отключен.

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

Чтобы отключить настройку `error_log`, создайте следующий файл `/etc/clickhouse-server/config.d/disable_error_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <error_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## custom_settings_prefixes {#custom_settings_prefixes}

Список префиксов для [пользовательских настроек](/operations/settings/query-level#custom_settings). Префиксы должны разделяться запятыми.

**Пример**

```xml
<custom_settings_prefixes>custom_</custom_settings_prefixes>
```

**Смотрите также**

- [Пользовательские настройки](/operations/settings/query-level#custom_settings)
## core_dump {#core_dump}

Настраивает мягкий предел для размера файла дампа ядра.

:::note
Жёсткий предел настраивается с помощью системных инструментов.
:::

**Пример**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```
## default_profile {#default_profile}

Профиль настроек по умолчанию. Профили настроек находятся в файле, указанном в настройке `user_config`.

**Пример**

```xml
<default_profile>default</default_profile>
```
## dictionaries_config {#dictionaries_config}

Путь к файлу конфигурации для словарей.

Путь:

- Укажите абсолютный путь или путь относительно файла конфигурации сервера.
- Путь может содержать подстановочные знаки \* и ?.

Смотрите также:
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

Смотрите также:
- "[Исполняемые пользовательские функции](/sql-reference/functions/udf#executable-user-defined-functions).".

**Пример**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```
## format_schema_path {#format_schema_path}

Путь к директории со схемами для входных данных, такими как схемы для формата [CapnProto](../../interfaces/formats.md#capnproto).

**Пример**

```xml
<!-- Директория, содержащая файлы схем для различных входных форматов. -->
<format_schema_path>format_schemas/</format_schema_path>
```
## graphite {#graphite}

Отправка данных в [Graphite](https://github.com/graphite-project).

Настройки:

- `host` – Сервер Graphite.
- `port` – Порт на сервере Graphite.
- `interval` – Интервал отправки, в секундах.
- `timeout` – Таймаут для отправки данных, в секундах.
- `root_path` – Префикс для ключей.
- `metrics` – Отправка данных из таблицы [system.metrics](/operations/system-tables/metrics).
- `events` – Отправка дельт данных, накопленных за период времени, из таблицы [system.events](/operations/system-tables/events).
- `events_cumulative` – Отправка накопленных данных из таблицы [system.events](/operations/system-tables/events).
- `asynchronous_metrics` – Отправка данных из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).

Вы можете настроить несколько секций `<graphite>`. Например, вы можете использовать это для отправки различных данных с разными интервалами.

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

Настройки для объединения данных для Graphite.

Для получения дополнительной информации смотрите [GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md).

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

Определяет директорию, содержащую файлы proto для типов Protobuf.

Пример:

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```
## http_handlers {#http_handlers}

Позволяет использовать пользовательские HTTP-обработчики.
Чтобы добавить новый http-обработчик, просто добавьте новое `<rule>`.
Правила проверяются сверху вниз в порядке определения,
и первое совпадение запустит обработчик.

Следующие настройки можно настроить с помощью под-тегов:

| Под-теги              | Определение                                                                                                                                    |
|----------------------|---------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                | Чтобы сопоставить URL запроса, вы можете использовать префикс 'regex:', чтобы использовать регулярное выражение (опционально)                       |
| `methods`            | Чтобы сопоставить методы запросов, вы можете использовать запятые для разделения нескольких соответствий методов (опционально)                        |
| `headers`            | Чтобы сопоставить заголовки запроса, сопоставьте каждый дочерний элемент (имя дочернего элемента - это имя заголовка), вы можете использовать префикс 'regex:', чтобы использовать регулярное выражение (опционально) |
| `handler`            | Обработчик запроса                                                                                                                               |
| `empty_query_string` | Проверяет, что в URL нет строки запроса                                                                                                        |

`handler` содержит следующие настройки, которые можно настроить с помощью под-тегов:

| Под-теги            | Определение                                                                                                                                                             |
|--------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`              | Местоположение для перенаправления                                                                                                                                   |
| `type`             | Поддерживаемые типы: static, dynamic_query_handler, predefined_query_handler, redirect                                                                                   |
| `status`           | Используется с типом static, код состояния ответа                                                                                                                       |
| `query_param_name` | Используется с типом dynamic_query_handler, извлекает и выполняет значение, соответствующее значению `<query_param_name>` в параметрах HTTP-запроса                              |
| `query`            | Используется с типом predefined_query_handler, выполняет запрос, когда вызывается обработчик                                                                                   |
| `content_type`     | Используется с типом static, тип контента ответа                                                                                                                                   |
| `response_content` | Используется с типом static, содержимое ответа, отправляемое клиенту, при использовании префиксов 'file://' или 'config://', найти содержимое из файла или конфигурации, отправляемой клиенту |

Вместе со списком правил, вы можете указать `<defaults/>`, который указывает включить все стандартные обработчики.

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

Страница, которая отображается по умолчанию при доступе к серверу ClickHouse HTTP(s).
Значение по умолчанию — "Ok." (с символом переноса строки в конце)

**Пример**

Открывает `https://tabix.io/`, когда обращаются к `http://localhost: http_port`.

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```
## http_options_response {#http_options_response}

Используется для добавления заголовков в ответ на HTTP-запрос `OPTIONS`.
Метод `OPTIONS` используется при выполнении предварительных запросов CORS.

Для получения дополнительной информации смотрите [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS).

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

Время истечения HSTS в секундах.

:::note
Значение `0` означает, что ClickHouse отключает HSTS. Если вы установите положительное число, HSTS будет включен, а max-age равен установленному вами числу.
:::

**Пример**

```xml
<hsts_max_age>600000</hsts_max_age>
```
## mlock_executable {#mlock_executable}

Выполняет `mlockall` после запуска, чтобы снизить задержку первых запросов и предотвратить выгрузку исполняемого файла ClickHouse при высокой нагрузке ввода-вывода.

:::note
Рекомендуется включить эту опцию, но это приведет к увеличению времени запуска до нескольких секунд.
Имейте в виду, что эта настройка не будет работать без возможности "CAP_IPC_LOCK".
:::

**Пример**

```xml
<mlock_executable>false</mlock_executable>
```
## include_from {#include_from}

Путь к файлу со заменами. Поддерживаются форматы XML и YAML.

Для получения дополнительной информации смотрите раздел "[Файлы конфигурации](/operations/configuration-files)".

**Пример**

```xml
<include_from>/etc/metrica.xml</include_from>
```
## interserver_listen_host {#interserver_listen_host}

Ограничение на хосты, которые могут обмениваться данными между серверами ClickHouse.
Если используется Keeper, то то же ограничение будет применено к взаимодействию между различными экземплярами Keeper.

:::note
По умолчанию значение равно настройке [`listen_host`](#listen_host).
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

Имя хоста, которое могут использовать другие серверы для доступа к этому серверу.

Если не указано, оно определяется так же, как команда `hostname -f`.

Полезно для выхода за рамки конкретного сетевого интерфейса.

**Пример**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```
## interserver_https_port {#interserver_https_port}

Порт для обмена данными между серверами ClickHouse по `HTTPS`.

**Пример**

```xml
<interserver_https_port>9010</interserver_https_port>
```
## interserver_https_host {#interserver_https_host}

Похоже на [`interserver_http_host`](#interserver_http_host), но это имя хоста может использоваться другими серверами для доступа к этому серверу по `HTTPS`.

**Пример**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```
## interserver_http_credentials {#interserver_http_credentials}

Имя пользователя и пароль, используемые для подключения к другим серверам во время [репликации](../../engines/table-engines/mergetree-family/replication.md). Кроме того, сервер аутентифицирует другие реплики, используя эти учетные данные.
Поэтому `interserver_http_credentials` должны быть одинаковыми для всех реплик в кластере.

:::note
- По умолчанию, если раздел `interserver_http_credentials` опущен, аутентификация не используется во время репликации.
- Настройки `interserver_http_credentials` не связаны с учетными данными клиента ClickHouse [конфигурация](../../interfaces/cli.md#configuration_files).
- Эти учетные данные общие для репликации через `HTTP` и `HTTPS`.
:::

Следующие настройки могут быть настроены с помощью под-тегов:

- `user` — Имя пользователя.
- `password` — Пароль.
- `allow_empty` — Если `true`, то другим репликам разрешается подключаться без аутентификации, даже если учетные данные заданы. Если `false`, то подключения без аутентификации будут отклоняться. По умолчанию: `false`.
- `old` — Содержит старые `user` и `password`, использованные при ротации учетных данных. Можно указать несколько секций `old`.

**Ротация учетных данных**

ClickHouse поддерживает динамическую ротацию учетных данных между серверами без остановки всех реплик одновременно для обновления их конфигурации. Учетные данные можно изменять в нескольких этапах.

Чтобы включить аутентификацию, установите `interserver_http_credentials.allow_empty` в `true` и добавьте учетные данные. Это позволяет соединения с аутентификацией и без неё.

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

После настройки всех реплик установите `allow_empty` в `false` или удалите эту настройку. Это делает аутентификацию с новыми учетными данными обязательной.

Чтобы изменить существующие учетные данные, переместите имя пользователя и пароль в раздел `interserver_http_credentials.old` и обновите `user` и `password` новыми значениями. На этом этапе сервер использует новые учетные данные для подключения к другим репликам и принимает подключения с новыми или старыми учетными данными.

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

Когда новые учетные данные будут применены ко всем репликам, старые учетные данные можно удалить.
## ldap_servers {#ldap_servers}

Список серверов LDAP с их параметрами подключения здесь для:
- использования их в качестве аутентификаторов для выделенных локальных пользователей, у которых указан механизм аутентификации 'ldap' вместо 'password'
- использования их в качестве удаленных каталогов пользователей.

Следующие параметры могут быть настроены с помощью под-тегов:

| Параметр                     | Описание                                                                                                                                                                                                                                                                                                                                                                                                                              |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                        | Имя хоста или IP-адрес сервера LDAP, этот параметр обязателен и не может быть пустым.                                                                                                                                                                                                                                                                                                                                                             |
| `port`                        | Порт сервера LDAP, по умолчанию 636, если `enable_tls` установлен в true, в противном случае `389`.                                                                                                                                                                                                                                                                                                                                                        |
| `bind_dn`                     | Шаблон, используемый для построения DN для связывания. Результирующий DN будет построен путем замены всех подстрок `\{user_name\}` шаблона на фактическое имя пользователя во время каждой попытки аутентификации.                                                                                                                                                                                                                               |
| `user_dn_detection`           | Раздел с параметрами поиска LDAP для определения фактического DN пользователя, с которым установлено соединение. Это в основном используется в фильтрах поиска для дальнейшего сопоставления ролей, когда сервер является Active Directory. Результирующий DN пользователя будет использоваться при замене подстрок `\{user_dn\}`, где это разрешено. По умолчанию DN пользователя установлен равным DN связывания, но после выполнения поиска он будет обновлен до фактического значения обнаруженного DN пользователя. |
| `verification_cooldown`       | Период времени, в секундах, после успешной попытки связывания, в течение которого предполагается, что пользователь успешно аутентифицирован для всех последовательных запросов без обращения к серверу LDAP. Укажите `0` (по умолчанию), чтобы отключить кэширование и заставить обращаться к серверу LDAP для каждого запроса аутентификации.                                                                                                                  |
| `enable_tls`                  | Флаг для включения использования безопасного соединения с сервером LDAP. Укажите `no` для протокола в открытом текстовом формате (`ldap://`) (не рекомендуется). Укажите `yes` для протокола LDAP через SSL/TLS (`ldaps://`) (рекомендуется, по умолчанию). Укажите `starttls` для устаревшего протокола StartTLS (протокол в открытом текстовом формате (`ldap://`), обновленный до TLS).                                                                                                               |
| `tls_minimum_protocol_version`| Минимальная версия протокола SSL/TLS. Принимаемые значения: `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2` (по умолчанию).                                                                                                                                                                                                                                                                                                                |
| `tls_require_cert`            | Поведение проверки SSL/TLS сертификата партнера. Принимаемые значения: `never`, `allow`, `try`, `demand` (по умолчанию).                                                                                                                                                                                                                                                                                                                    |
| `tls_cert_file`               | Путь к файлу сертификата.                                                                                                                                                                                                                                                                                                                                                                                                                |
| `tls_key_file`                | Путь к файлу ключа сертификата.                                                                                                                                                                                                                                                                                                                                                                                                            |
| `tls_ca_cert_file`            | Путь к файлу сертификата CA.                                                                                                                                                                                                                                                                                                                                                                                                             |
| `tls_ca_cert_dir`             | Путь к каталогу, содержащему сертификаты CA.                                                                                                                                                                                                                                                                                                                                                                                        |
| `tls_cipher_suite`            | Разрешенная шифровая система (в нотации OpenSSL).                                                                                                                                                                                                                                                                                                                                                                                              |

Настройка `user_dn_detection` может быть сконфигурирована с под-тегами:

| Параметр         | Описание                                                                                                                                                                                                                                                                                                                                    |
|------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`        | Шаблон, используемый для построения базового DN для поиска LDAP. Результирующий DN будет построен путем замены всех подстрок `\{user_name\}` и '\{bind_dn\}' шаблона на фактическое имя пользователя и привязанный DN во время поиска LDAP.                                                                                                       |
| `scope`          | Область поиска LDAP. Принимаемые значения: `base`, `one_level`, `children`, `subtree` (по умолчанию).                                                                                                                                                                                                                                       |
| `search_filter`  | Шаблон, используемый для построения фильтра поиска для поиска LDAP. Результирующий фильтр будет построен путем замены всех подстрок `\{user_name\}`, `\{bind_dn\}` и `\{base_dn\}` шаблона на фактическое имя пользователя, привязанный DN и базовый DN во время поиска LDAP. Обратите внимание, что специальные символы должны быть правильно экранированы в XML.  |

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

Пример (типичный Active Directory с настроенным обнаружением DN пользователя для дальнейшего сопоставления ролей):

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

Ограничение на хосты, с которых могут поступать запросы. Если вы хотите, чтобы сервер отвечал на все из них, укажите `::`.

Примеры:

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```

## listen_try {#listen_try}

Сервер не будет выходить, если сети IPv6 или IPv4 недоступны во время попытки прослушивания.

**Пример**

```xml
<listen_try>0</listen_try>
```

## listen_reuse_port {#listen_reuse_port}

Позволяет нескольким серверам слушать на одном адресе:порту. Запросы будут маршрутизироваться на случайный сервер операционной системой. Включение этой настройки не рекомендуется.

**Пример**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

Тип:

По умолчанию:
## listen_backlog {#listen_backlog}

Очередь (размер очереди ожидающих подключений) сокета прослушивания. Значение по умолчанию `4096` такое же, как и у linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)).

Обычно это значение не нужно изменять, поскольку:
- Значение по умолчанию достаточно велико,
- Для принятия соединений клиентов сервер имеет отдельный поток.

Поэтому даже если у вас есть `TcpExtListenOverflows` (из `nstat`) не ноль и этот счетчик растет для сервера ClickHouse, это не означает, что это значение нужно увеличивать, поскольку:
- Обычно, если `4096` недостаточно, это указывает на какую-то внутреннюю проблему масштабирования ClickHouse, поэтому лучше сообщить о проблеме.
- Это не означает, что сервер может обрабатывать больше соединений позже (и даже если может, на тот момент клиенты могут быть ушли или отключены).

**Пример**

```xml
<listen_backlog>4096</listen_backlog>
```

## logger {#logger}

Местоположение и формат журналов сообщений.

**Ключи**:

| Ключ                        | Описание                                                                                                                                                                         |
|------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                      | Уровень журнала. Приемлемые значения: `none` (выключить ведение журнала), `fatal`, `critical`, `error`, `warning`, `notice`, `information`, `debug`, `trace`, `test`                                  |
| `log`                        | Путь к файлу журнала.                                                                                                                                                           |
| `errorlog`                   | Путь к файлу журнала ошибок.                                                                                                                                                     |
| `size`                       | Политика ротации: Максимальный размер файлов журналов в байтах. Как только размер файла журнала превысит этот порог, он будет переименован и архивирован, и будет создан новый файл журнала.                  |
| `count`                      | Политика ротации: Сколько исторических файлов журналов ClickHouse сохраняется максимум.                                                                                         |
| `stream_compress`            | Сжимать сообщения журнала с использованием LZ4. Установите значение `1` или `true`, чтобы включить.                                                                                                                    |
| `console`                    | Не записывать сообщения журнала в файлы журналов, вместо этого выводить их в консоль. Установите значение `1` или `true`, чтобы включить. Значение по умолчанию - `1`, если ClickHouse не работает в режиме демона, `0` в противном случае. |
| `console_log_level`          | Уровень журнала для консольного вывода. По умолчанию соответствует `level`.                                                                                                                                  |
| `formatting`                 | Формат журнала для консольного вывода. В настоящее время поддерживается только `json`                                                                                                                  |
| `use_syslog`                 | Также перенаправлять вывод журнала в syslog.                                                                                                                                                  |
| `syslog_level`               | Уровень журнала для записи в syslog.                                                                                                                                                    |

**Спецификаторы формата журнала**

Имена файлов в путях `log` и `errorLog` поддерживают ниже указанные спецификаторы формата для результирующего имени файла (часть каталога их не поддерживает).

Столбец "Пример" показывает вывод на `2023-07-06 18:32:07`.

| Спецификатор| Описание                                                                                                         | Пример                  |
|--------------|---------------------------------------------------------------------------------------------------------------------|--------------------------|
| `%%`         | Литерал %                                                                                                           | `%`                        |
| `%n`         | Символ новой строки                                                                                                  |                          |
| `%t`         | Горизонтальный табулятор                                                                                            |                          |
| `%Y`         | Год в десятичном формате, например 2017                                                                                 | `2023`                     |
| `%y`         | последние 2 цифры года в десятичном формате (диапазон [00,99])                                                           | `23`                       |
| `%C`         | Первые 2 цифры года в десятичном формате (диапазон [00,99])                                                          | `20`                       |
| `%G`         | Четырехзначный [год на основе недели ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), т.е. год, содержащий указанную неделю. Обычно полезно только с `%V`  | `2023`       |
| `%g`         | Последние 2 цифры [года на основе недели ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), т.е. год, содержащий указанную неделю.                         | `23`         |
| `%b`         | Сокращенное название месяца, например, Окт (в зависимости от локали)                                                                 | `Jul`                      |
| `%h`         | Синоним %b                                                                                                       | `Jul`                      |
| `%B`         | Полное название месяца, например, Октябрь (в зависимости от локали)                                                                    | `July`                     |
| `%m`         | Месяц в десятичном формате (диапазон [01,12])                                                                           | `07`                       |
| `%U`         | Номер недели в году в десятичном формате (воскресенье - первый день недели) (диапазон [00,53])                          | `27`                       |
| `%W`         | Номер недели в году в десятичном формате (понедельник - первый день недели) (диапазон [00,53])                          | `27`                       |
| `%V`         | Номер недели ISO 8601 (диапазон [01,53])                                                                                | `27`                       |
| `%j`         | День в году в десятичном формате (диапазон [001,366])                                                               | `187`                      |
| `%d`         | День месяца как десятичное число с дополнением до нуля (диапазон [01,31]). Однозначное число предшествует нулю.                 | `06`                       |
| `%e`         | День месяца как десятичное число с пробелом для одиночных чисел (диапазон [1,31]). Однозначное число предшествует пробелу.              | `&nbsp; 6`                 |
| `%a`         | Сокращенное название дня недели, например, Пт (в зависимости от локали)                                                               | `Thu`                      |
| `%A`         | Полное название дня недели, например, Пятница (в зависимости от локали)                                                                   | `Thursday`                 |
| `%w`         | День недели как целое число с воскресеньем как 0 (диапазон [0-6])                                                          | `4`                        |
| `%u`         | День недели как десятичное число, где понедельник - 1 (формат ISO 8601) (диапазон [1-7])                                      | `4`                        |
| `%H`         | Час в десятичном формате, 24-х часовой формат (диапазон [00-23])                                                             | `18`                       |
| `%I`         | Час в десятичном формате, 12-ти часовом формате (диапазон [01,12])                                                             | `06`                       |
| `%M`         | Минуты в десятичном формате (диапазон [00,59])                                                                          | `32`                       |
| `%S`         | Секунды в десятичном формате (диапазон [00,60])                                                                          | `07`                       |
| `%c`         | Стандартная строка даты и времени, например Sun Oct 17 04:41:13 2010 (в зависимости от локали)                                     | `Thu Jul  6 18:32:07 2023` |
| `%x`         | Локализованное представление даты (в зависимости от локали)                                                                    | `07/06/23`                 |
| `%X`         | Локализованное представление времени, например, 18:40:20 или 6:40:20 PM (в зависимости от локали)                                       | `18:32:07`                 |
| `%D`         | Краткая дата MM/DD/YY, эквивалентно %m/%d/%y                                                                         | `07/06/23`                 |
| `%F`         | Краткая дата YYYY-MM-DD, эквивалентно %Y-%m-%d                                                                       | `2023-07-06`               |
| `%r`         | Локализованное 12-часовое время (в зависимости от локали)                                                                     | `06:32:07 PM`              |
| `%R`         | Эквивалентно "%H:%M"                                                                                               | `18:32`                    |
| `%T`         | Эквивалентно "%H:%M:%S" (формат времени ISO 8601)                                                                 | `18:32:07`                 |
| `%p`         | Локализованное обозначение a.m. или p.m. (в зависимости от локали)                                                               | `PM`                       |
| `%z`         | Смещение от UTC в формате ISO 8601 (например, -0430), или отсутствие символов, если информация о временной зоне недоступна | `+0800`                    |
| `%Z`         | Название или сокращение часового пояса (в зависимости от локали), или отсутствие символов, если информация о временной зоне недоступна     | `Z AWST `                  |

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

Чтобы печатать сообщения журнала только в консоли:

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**Переопределения по уровням**

Уровень журнала отдельных имен журналов может быть переопределен. Например, чтобы отключить все сообщения логгеров "Backup" и "RBAC".

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

Чтобы записывать сообщения журнала дополнительно в syslog:

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

| Ключ        | Описание                                                                                                                                                                                                                                                    |
|-------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `address`   | Адрес syslog в формате `host\[:port\]`. Если пропущено, используется локальный демон.                                                                                                                                                                         |
| `hostname`  | Имя хоста, с которого отправляются журналы (необязательно).                                                                                                                                                                                                      |
| `facility`  | Ключевое слово [фасилити](https://en.wikipedia.org/wiki/Syslog#Facility) syslog. Должен указываться в верхнем регистре с префиксом "LOG_", например, `LOG_USER`, `LOG_DAEMON`, `LOG_LOCAL3` и т. д. По умолчанию: `LOG_USER`, если указан `address`, иначе `LOG_DAEMON`.                                           |
| `format`    | Формат сообщения журнала. Возможные значения: `bsd` и `syslog`.                                                                                                                                                                                                       |

**Форматы журналов**

Вы можете указать формат журнала, который будет выводиться в консольном журнале. В настоящее время поддерживается только JSON.

**Пример**

Вот пример вывода JSON журнала:

```json
{
  "date_time_utc": "2024-11-06T09:06:09Z",
  "date_time": "1650918987.180175",
  "thread_name": "#1",
  "thread_id": "254545",
  "level": "Trace",
  "query_id": "",
  "logger_name": "BaseDaemon",
  "message": "Received signal 2",
  "source_file": "../base/daemon/BaseDaemon.cpp; virtual void SignalListener::run()",
  "source_line": "192"
}
```

Чтобы включить поддержку ведения журналов в формате JSON, используйте следующий фрагмент:

```xml
<logger>
    <formatting>
        <type>json</type>
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

**Переименование ключей для JSON журналов**

Имена ключей могут быть изменены путем изменения значений тегов внутри тега `<names>`. Например, чтобы изменить `DATE_TIME` на `MY_DATE_TIME`, вы можете использовать `<date_time>MY_DATE_TIME</date_time>`.

**Пропуск ключей для JSON журналов**

Свойства журнала можно пропустить, закомментировав свойство. Например, если вы не хотите, чтобы ваш журнал печатал `query_id`, вы можете закомментировать тег `<query_id>`.

## send_crash_reports {#send_crash_reports}

Настройки для опциональной отправки отчетов о сбоях команде разработчиков ClickHouse через [Sentry](https://sentry.io).

Включение этой функции, особенно в средах пред-разработки, очень приветствуется.

Серверу потребуется доступ в общедоступный интернет через IPv4 (на момент написания IPv6 не поддерживается Sentry) для правильной работы этой функции.

Ключи:

| Ключ                   | Описание                                                                                                                                                                                            |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `enabled`              | Логический флаг для включения функции, по умолчанию `false`. Установите `true`, чтобы разрешить отправку отчетов о сбоях.                                                                                                  |
| `send_logical_errors`  | `LOGICAL_ERROR` аналогичен `assert`, это ошибка в ClickHouse. Этот логический флаг включает отправку этих исключений в Sentry (по умолчанию: `false`).                                                        |
| `endpoint`             | Вы можете переопределить URL-адрес Sentry для отправки отчетов о сбоях. Это может быть либо отдельная учетная запись Sentry, либо ваш самопроведенный экземпляр Sentry. Используйте синтаксис [Sentry DSN](https://docs.sentry.io/error-reporting/quickstart/?platform=native#configure-the-sdk).                  |
| `anonymize`            | Избегайте прикрепления имени хоста сервера к отчету о сбое.                                                                                                                                               |
| `http_proxy`           | Настройте HTTP-прокси для отправки отчетов о сбоях.                                                                                                                                                        |
| `debug`                | Установите клиент Sentry в режим отладки.                                                                                                                                                                |
| `tmp_path`             | Путь в файловой системе для временного состояния отчета о сбое.                                                                                                                                                      |
| `environment`          | Произвольное имя среды, в которой работает сервер ClickHouse. Оно будет упомянуто в каждом отчете о сбое. Значение по умолчанию `test` или `prod` в зависимости от версии ClickHouse. |

**Рекомендуемое использование**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```

## ssh_server {#ssh_server}

Публичная часть ключа хоста будет записана в файл known_hosts
на стороне клиента SSH при первом подключении.

Конфигурации ключей хоста по умолчанию неактивны.
Раскомментируйте конфигурации ключей хоста и укажите путь к соответствующему ssh ключу для их активации:

Пример:

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```

## tcp_ssh_port {#tcp_ssh_port}

Порт для SSH-сервера, который позволяет пользователю подключаться и выполнять запросы интерактивно с использованием встроенного клиента через PTY.

Пример:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```

## storage_configuration {#storage_configuration}

Позволяет конфигурировать многодисковое хранилище.

Конфигурация хранилища следует такой структуре:

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

Конфигурация `disks` следует приведенной ниже структуре:

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

Подтеги выше определяют следующие настройки для `disks`:

| Настройка                 | Описание                                                                                           |
|---------------------------|----------------------------------------------------------------------------------------------------|
| `<disk_name_N>`           | Имя диска, которое должно быть уникальным.                                                       |
| `path`                    | Путь, по которому будут храниться данные сервера (каталоги `data` и `shadow`). Он должен заканчиваться на `/` |
| `keep_free_space_bytes`   | Размер резервируемого свободного места на диске.                                                  |

:::note
Порядок дисков не имеет значения.
:::
### Конфигурация политик {#configuration-of-policies}

Подтеги выше определяют следующие настройки для `policies`:

| Настройка                      | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`                | Имя политики. Имена политик должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `volume_name_N`                | Имя объема. Имена объемов должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `disk`                         | Диск, расположенный внутри объема.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `max_data_part_size_bytes`     | Максимальный размер фрагмента данных, который может находиться на любом из дисков в этом объеме. Если слияние приводит к тому, что размер фрагмента превышает max_data_part_size_bytes, фрагмент будет записан в следующий объем. Эта функция позволяет хранить новые / маленькие фрагменты на горячем (SSD) объеме и перемещать их на холодный (HDD) объем, когда они достигают большого размера. Не используйте эту опцию, если у политики только один объем.                                                                 |
| `move_factor`                  | Доля доступного свободного места на объеме. Если место становится меньше, данные начинают переноситься на следующий объем, если он есть. Для переноса фрагменты сортируются по размеру от большего к меньшему (по убыванию), и выбираются фрагменты, общий размер которых достаточен для выполнения условия `move_factor`. Если общего размера всех фрагментов недостаточно, будут перемещены все фрагменты.                                                                                                     |
| `perform_ttl_move_on_insert`   | Отключает перемещение данных с истекшим TTL при вставке. По умолчанию (если включено), если мы вставляем часть данных, которая уже истекла в соответствии с правилом перемещения по жизни, она немедленно перемещается в объем / диск, указанный в правиле перемещения. Это может значительно замедлить вставку, если целевой объем / диск медленный (например, S3). Если отключено, истекшая часть данных записывается в объем по умолчанию, а затем немедленно перемещается в объем, указанный в правиле для истекшего TTL. |
| `load_balancing`               | Политика балансировки дисков: `round_robin` или `least_used`.                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `least_used_ttl_ms`            | Устанавливает тайм-аут (в миллисекундах) для обновления доступного пространства на всех дисках (`0` - всегда обновлять, `-1` - никогда не обновлять, значение по умолчанию - `60000`). Обратите внимание, если диск используется только ClickHouse и не будет подвергаться изменению размера файловой системы на лету, вы можете использовать значение `-1`. В противном случае это не рекомендуется, так как в конечном итоге приведет к неправильному распределению пространства.                                                                                                                   |
| `prefer_not_to_merge`          | Отключает слияние частей данных на этом объеме. Примечание: это потенциально опасно и может вызвать замедление. Когда эта настройка включена (не делайте этого), слияние данных на этом объеме запрещено (что плохо). Это позволяет контролировать то, как ClickHouse взаимодействует с медленными дисками. Мы рекомендуем вообще не использовать это.                                                                                                                                                                                       |
| `volume_priority`              | Определяет приоритет (порядок) заполнения объемов. Чем меньше значение, тем выше приоритет. Значения параметров должны быть натуральными числами и покрывать диапазон от 1 до N (N - максимальное указанное значение параметра) без пропусков.                                                                                                                                                                                                                                                                |

Для `volume_priority`:
- Если все объемы имеют этот параметр, они имеют приоритет в указанном порядке.
- Если только _некоторые_ объемы имеют его, объемы без него имеют самый низкий приоритет. Тот, кто действительно его имеет, имеет приоритет в соответствии со значением тега, приоритет остального определяется порядком описания в конфигурационном файле относительно друг друга.
- Если _никакие_ объемы не имеют этого параметра, их порядок определяется порядком описания в конфигурационном файле.
- Приоритет объемов может не быть идентичным.
## macros {#macros}

Подстановки параметров для реплицированных таблиц.

Можно опустить, если реплицированные таблицы не используются.

Дополнительную информацию см. в разделе [Создание реплицированных таблиц](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables).

**Пример**

```xml
<macros incl="macros" optional="true" />
```
## replica_group_name {#replica_group_name}

Имя группы реплик для базы данных Replicated.

Кластер, созданный реплицированной базой данных, будет состоять из реплик в одной и той же группе. DDL запросы будут ждать только реплик в одной и той же группе.

По умолчанию пусто.

**Пример**

```xml
<replica_group_name>backups</replica_group_name>
```
## remap_executable {#remap_executable}

Настройка для перераспределения памяти для машинного кода ("текст") с использованием крупных страниц.

:::note
Эта функция является высокоэкспериментальной.
:::

Пример:

```xml
<remap_executable>false</remap_executable>
```
## max_open_files {#max_open_files}

Максимальное количество открытых файлов.

:::note
Рекомендуем использовать эту опцию в macOS, так как функция `getrlimit()` возвращает неправильное значение.
:::

**Пример**

```xml
<max_open_files>262144</max_open_files>
```
## max_session_timeout {#max_session_timeout}

Максимальный тайм-аут сессии в секундах.

Пример:

```xml
<max_session_timeout>3600</max_session_timeout>
```
## merge_tree {#merge_tree}

Тонкая настройка для таблиц в [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md).

Дополнительную информацию см. в заголовочном файле MergeTreeSettings.h.

**Пример**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```
## metric_log {#metric_log}

По умолчанию отключена.

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

Чтобы отключить настройку `metric_log`, создайте следующий файл `/etc/clickhouse-server/config.d/disable_metric_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## latency_log {#latency_log}

По умолчанию отключена.

**Включение**

Чтобы вручную включить сбор истории задержек [`system.latency_log`](../../operations/system-tables/latency_log.md), создайте файл `/etc/clickhouse-server/config.d/latency_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <latency_log>
        <database>system</database>
        <table>latency_log</table>
        <flush_interval_milliseconds>7500</flush_interval_milliseconds>
        <collect_interval_milliseconds>1000</collect_interval_milliseconds>
        <max_size_rows>1048576</max_size_rows>
        <reserved_size_rows>8192</reserved_size_rows>
        <buffer_size_rows_flush_threshold>524288</buffer_size_rows_flush_threshold>
        <flush_on_crash>false</flush_on_crash>
    </latency_log>
</clickhouse>
```

**Отключение**

Чтобы отключить настройку `latency_log`, создайте следующий файл `/etc/clickhouse-server/config.d/disable_latency_log.xml` со следующим содержимым:

```xml
<clickhouse>
<latency_log remove="1" />
</clickhouse>
```
## replicated_merge_tree {#replicated_merge_tree}

Тонкая настройка для таблиц в [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Эта настройка имеет более высокий приоритет.

Дополнительную информацию см. в заголовочном файле MergeTreeSettings.h.

**Пример**

```xml
<replicated_merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</replicated_merge_tree>
```
## opentelemetry_span_log {#opentelemetry_span_log}

Настройки для системной таблицы [`opentelemetry_span_log`](../system-tables/opentelemetry_span_log.md).

<SystemLogParameters/>

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

Конфигурация клиента/сервера SSL.

Поддержка SSL предоставляется библиотекой `libpoco`. Доступные параметры конфигурации описаны в [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h). Значения по умолчанию можно найти в [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp).

Ключи для настроек сервера/клиента:

| Параметр                    | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Значение по умолчанию                      |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------|
| `privateKeyFile`              | Путь к файлу с секретным ключом PEM-сертификата. Файл может одновременно содержать ключ и сертификат.                                                                                                                                                                                                                                                                                                                                                          |                                            |
| `certificateFile`             | Путь к файлу клиентского/серверного сертификата в формате PEM. Вы можете опустить его, если `privateKeyFile` содержит сертификат.                                                                                                                                                                                                                                                                                                                          |                                            |
| `caConfig`                    | Путь к файлу или каталогу, содержащему доверенные сертификаты CA. Если это указывает на файл, он должен быть в формате PEM и может содержать несколько сертификатов CA. Если это указывает на каталог, он должен содержать один файл .pem на сертификат CA. Имена файлов ищутся по значению хеш-значения имени субъекта CA. Подробности можно найти в мануале по [SSL_CTX_load_verify_locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html). |                                            |
| `verificationMode`            | Метод проверки сертификатов узла. Подробности находятся в описании класса [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h). Возможные значения: `none`, `relaxed`, `strict`, `once`.                                                                                                                                                                                                         | `relaxed`                                  |
| `verificationDepth`           | Максимальная длина цепи проверки сертификатов. Проверка будет неуспешной, если длина цепочки сертификатов превышает заданное значение.                                                                                                                                                                                                                                                                                                                 | `9`                                        |
| `loadDefaultCAFile`           | Использовать встроенные сертификаты CA для OpenSSL. ClickHouse предполагает, что встроенные сертификаты CA находятся в файле `/etc/ssl/cert.pem` (и/или в каталоге `/etc/ssl/certs`) или в файле (или каталоге), указанном переменной окружения `SSL_CERT_FILE` (или `SSL_CERT_DIR`).                                                                                                                                                                          | `true`                                     |
| `cipherList`                  | Поддерживаемые шифры OpenSSL.                                                                                                                                                                                                                                                                                                                                                                                                                                         | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`  |
| `cacheSessions`               | Включает или отключает кэширование сессий. Должен использоваться в сочетании с `sessionIdContext`. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                       | `false`                                    |
| `sessionIdContext`            | Уникальный набор случайных символов, который сервер добавляет к каждому сгенерированному идентификатору. Длина строки не должна превышать `SSL_MAX_SSL_SESSION_ID_LENGTH`. Этот параметр всегда рекомендуется, так как помогает избежать проблем как в случае кэширования сессии сервером, так и в случае запроса клиента на кэширование.                                                                                                                                                        | `$\{application.name\}`                      |
| `sessionCacheSize`            | Максимальное количество сессий, которые сервер кеширует. Значение `0` означает неограниченное количество сессий.                                                                                                                                                                                                                                                                                                                                                                        | [1024\*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978)                            |
| `sessionTimeout`              | Время кэширования сессии на сервере в часах.                                                                                                                                                                                                                                                                                                                                                                                                                   | `2`                                        |
| `extendedVerification`        | Если включено, проверить, что CN сертификата или SAN соответствует имени узла собеседника.                                                                                                                                                                                                                                                                                                                                                                                           | `false`                                    |
| `requireTLSv1`                | Требовать соединение TLSv1. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                        | `false`                                    |
| `requireTLSv1_1`              | Требовать соединение TLSv1.1. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                    |
| `requireTLSv1_2`              | Требовать соединение TLSv1.2. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                    |
| `fips`                        | Активирует режим FIPS OpenSSL. Поддерживается, если версия библиотеки OpenSSL поддерживает FIPS.                                                                                                                                                                                                                                                                                                                                                                                 | `false`                                    |
| `privateKeyPassphraseHandler` | Класс (от Subclass PrivateKeyPassphraseHandler), который запрашивает пароль для доступа к приватному ключу. Например: `<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`.                                                                                                                                                                                                | `KeyConsoleHandler`                        |
| `invalidCertificateHandler`   | Класс (подкласс CertificateHandler) для проверки недействительных сертификатов. Например: `<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>` .                                                                                                                                                                                                                                                                           | `RejectCertificateHandler`                 |
| `disableProtocols`            | Протоколы, которые не могут быть использованы.                                                                                                                                                                                                                                                                                                                                                                                                                             |                                            |
| `preferServerCiphers`         | Шифры сервера, предпочтительные для клиента.                                                                                                                                                                                                                                                                                                                                                                                                                                       | `false`                                    |

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
        <!-- Использовать для самоподписанных: <verificationMode>none</verificationMode> -->
        <invalidCertificateHandler>
            <!-- Использовать для самоподписанных: <name>AcceptCertificateHandler</name> -->
            <name>RejectCertificateHandler</name>
        </invalidCertificateHandler>
    </client>
</openSSL>
```
## part_log {#part_log}

Регистрация событий, связанных с [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Например, добавление или слияние данных. Вы можете использовать журнал для моделирования алгоритмов слияния и сравнения их характеристик. Вы можете визуализировать процесс слияния.

Запросы регистрируются в таблице [system.part_log](/operations/system-tables/part_log), а не в отдельном файле. Вы можете настроить имя этой таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

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

Путь к директории, содержащей данные.

:::note
Обязательный слеш в конце.
:::

**Пример**

```xml
<path>/var/lib/clickhouse/</path>
```
## processors_profile_log {#processors_profile_log}

Настройки для системной таблицы [`processors_profile_log`](../system-tables/processors_profile_log.md).

<SystemLogParameters/>

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

Экспонирование данных метрик для сбора с [Prometheus](https://prometheus.io).

Настройки:

- `endpoint` – HTTP-эндпоинт для сбора метрик сервером prometheus. Начинается с '/'.
- `port` – Порт для `endpoint`.
- `metrics` – Экспонирование метрик из таблицы [system.metrics](/operations/system-tables/metrics).
- `events` – Экспонирование метрик из таблицы [system.events](/operations/system-tables/events).
- `asynchronous_metrics` – Экспонирование текущих значений метрик из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).
- `errors` - Экспонирование количества ошибок по кодам ошибок, произошедших с момента последнего перезапуска сервера. Эта информация также может быть получена из [system.errors](/operations/system-tables/errors).

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
## query_log {#query_log}

Настройка для логирования запросов, полученных с помощью настройки [log_queries=1](../../operations/settings/settings.md).

Запросы логируются в таблице [system.query_log](/operations/system-tables/query_log), а не в отдельном файле. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

Если таблица не существует, ClickHouse создаст её. Если структура журнала запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой переименовывается, и новая таблица создается автоматически.

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

По умолчанию отключено.

**Включение**

Для ручного включения сбора истории метрик [`system.query_metric_log`](../../operations/system-tables/query_metric_log.md), создайте файл `/etc/clickhouse-server/config.d/query_metric_log.xml` со следующим содержимым:

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

Чтобы отключить настройку `query_metric_log`, вам нужно создать следующий файл `/etc/clickhouse-server/config.d/disable_query_metric_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## query_cache {#query_cache}

[Кэш запросов](../query-cache.md) конфигурация.

Доступные настройки:

| Настройка                   | Описание                                                                            | Значение по умолчанию |
|-----------------------------|------------------------------------------------------------------------------------|-----------------------|
| `max_size_in_bytes`         | Максимальный размер кэша в байтах. `0` означает отключение кэша запросов.         | `1073741824`          |
| `max_entries`               | Максимальное количество результатов запросов `SELECT`, хранящихся в кэше.         | `1024`                |
| `max_entry_size_in_bytes`   | Максимальный размер в байтах, который могут иметь результаты запросов `SELECT`, сохраненные в кэше. | `1048576`             |
| `max_entry_size_in_rows`    | Максимальное количество строк, которые могу иметь результаты запросов `SELECT`, сохраненные в кэше. | `30000000`            |

:::note
- Измененные настройки вступают в силу сразу.
- Данные для кэша запросов выделяются в DRAM. Если памяти недостаточно, обязательно установите небольшое значение для `max_size_in_bytes` или отключите кэш запросов полностью.
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

Настройка для логирования тредов запросов, полученных с помощью настройки [log_query_threads=1](/operations/settings/settings#log_query_threads).

Запросы логируются в таблице [system.query_thread_log](/operations/system-tables/query_thread_log), а не в отдельном файле. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

Если таблица не существует, ClickHouse создаст ее. Если структура журнала потоков запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой переименовывается, и новая таблица создается автоматически.

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

Настройка для логирования представлений (live, материализованные и др.), зависящих от запросов, полученных с помощью настройки [log_query_views=1](/operations/settings/settings#log_query_views).

Запросы логируются в таблице [system.query_views_log](/operations/system-tables/query_views_log), а не в отдельном файле. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

Если таблица не существует, ClickHouse создаст её. Если структура журнала представлений запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой переименовывается, и новая таблица создается автоматически.

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

Настройки для системной таблицы [text_log](/operations/system-tables/text_log) для логирования текстовых сообщений.

<SystemLogParameters/>

Дополнительно:

| Настройка | Описание                                                                                                                                                                                                     | Значение по умолчанию |
|-----------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------|
| `level`   | Максимальный уровень сообщения (по умолчанию `Trace`), который будет храниться в таблице.                                                                                                                 | `Trace`               |

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

Настройки для системной таблицы [trace_log](/operations/system-tables/trace_log) операции.

<SystemLogParameters/>

Файл конфигурации сервера по умолчанию `config.xml` содержит следующий раздел настроек:

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

Настройки для системной таблицы [asynchronous_insert_log](/operations/system-tables/asynchronous_insert_log) для логирования асинхронных вставок.

<SystemLogParameters/>

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

Настройки для системной таблицы [crash_log](../../operations/system-tables/crash-log.md) операции.

<SystemLogParameters/>

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
## custom_cached_disks_base_directory {#custom_cached_disks_base_directory}

Эта настройка указывает путь к кэшу для пользовательских (созданных из SQL) кэшированных дисков.
`custom_cached_disks_base_directory` имеет более высокий приоритет для пользовательских дисков по сравнению с `filesystem_caches_path` (находится в `filesystem_caches_path.xml`),
который используется, если первый отсутствует.
Путь настройки файловой системы должен находиться внутри этого каталога,
в противном случае будет выброшено исключение, предотвращающее создание диска.

:::note
Это не повлияет на диски, созданные в более старой версии, для которой сервер был обновлен.
В этом случае исключение не будет выброшено, чтобы сервер мог успешно запуститься.
:::

Пример:

```xml
<custom_cached_disks_base_directory>/var/lib/clickhouse/caches/</custom_cached_disks_base_directory>
```
## backup_log {#backup_log}

Настройки для системной таблицы [backup_log](../../operations/system-tables/backup_log.md) для логирования операций `BACKUP` и `RESTORE`.

<SystemLogParameters/>

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
## blog_storage_log {#blog_storage_log}

Настройки для системной таблицы [`blob_storage_log`](../system-tables/blob_storage_log.md).

<SystemLogParameters/>

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

Правила, основанные на регулярных выражениях, которые будут применяться к запросам, а также ко всем сообщениям журнала перед их хранением в журналах сервера,
[`system.query_log`](/operations/system-tables/query_log), [`system.text_log`](/operations/system-tables/text_log), [`system.processes`](/operations/system-tables/processes) таблицах и в журналах, отправленных клиенту. Это позволяет предотвратить
утечку конфиденциальных данных из SQL-запросов, таких как имена, электронные почты, персональные идентификаторы или номера кредитных карт в журналы.

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

| Настройка   | Описание                                                                   |
|-------------|----------------------------------------------------------------------------|
| `name`      | название правила (необязательно)                                           |
| `regexp`    | регулярное выражение совместимое с RE2 (обязательно)                     |
| `replace`   | строка замещения для конфиденциальных данных (необязательно, по умолчанию - шесть звездочек) |

Правила маскировки применяются ко всему запросу (чтобы предотвратить утечку конфиденциальных данных из неправильно сформированных / неразбираемых запросов).

В таблице [`system.events`](/operations/system-tables/events) имеется счетчик `QueryMaskingRulesMatch`, который отражает общее количество совпадений правил маскировки запросов.

Для распределенных запросов каждый сервер должен быть настроен отдельно, в противном случае подзапросы, переданные на другие
узлы, будут храниться без маскировки.
## remote_servers {#remote_servers}

Конфигурация кластеров, используемых движком таблиц [Distributed](../../engines/table-engines/special/distributed.md) и табличной функции `cluster`.

**Пример**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

Для значения атрибута `incl` смотрите раздел "[Файлы конфигурации](/operations/configuration-files)".

**См. также**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [Обнаружение кластера](../../operations/cluster-discovery.md)
- [Движок реплицированной базы данных](../../engines/database-engines/replicated.md)
## remote_url_allow_hosts {#remote_url_allow_hosts}

Список хостов, которые могут быть использованы в хранилищах, связанных с URL, и табличных функциях.

При добавлении хоста с тегом `\<host\>` XML:
- он должен указываться точно так же, как в URL, так как имя проверяется перед разрешением DNS. Например: `<host>clickhouse.com</host>`
- если порт явно указан в URL, тогда проверяется хост:порт целиком. Например: `<host>clickhouse.com:80</host>`
- если хост указан без порта, то разрешены любые порты этого хоста. Например: если указан `<host>clickhouse.com</host>`, тогда разрешены `clickhouse.com:20` (FTP), `clickhouse.com:80` (HTTP), `clickhouse.com:443` (HTTPS) и т.д.
- если хост указан как IP-адрес, то он проверяется так, как указано в URL. Например: `[2a02:6b8:a::a]`.
- если есть перенаправления и поддержка перенаправлений включена, то каждое перенаправление (поле location) проверяется.

Например:

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```
## timezone {#timezone}

Часовой пояс сервера.

Указывается как идентификатор IANA для часового пояса UTC или географического местоположения (например, Africa/Abidjan).

Часовой пояс необходим для преобразований между строками и форматами DateTime, когда поля DateTime выводятся в текстовом формате (печатаются на экране или в файл), и при получении DateTime из строки. Кроме того, часовой пояс используется в функциях, которые работают со временем и датой, если они не получили часовой пояс в входных параметрах.

**Пример**

```xml
<timezone>Asia/Istanbul</timezone>
```

**См. также**

- [session_timezone](../settings/settings.md#session_timezone)
## tcp_port {#tcp_port}

Порт для связи с клиентами по протоколу TCP.

**Пример**

```xml
<tcp_port>9000</tcp_port>
```
## tcp_port_secure {#tcp_port_secure}

TCP порт для защищенной связи с клиентами. Используйте его с настройками [OpenSSL](#openssl).

**Значение по умолчанию**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```
## mysql_port {#mysql_port}

Порт для связи с клиентами по протоколу MySQL.

:::note
- Положительные целые числа задают номер порта для прослушивания
- Пустые значения используются для отключения связи с клиентами по протоколу MySQL.
:::

**Пример**

```xml
<mysql_port>9004</mysql_port>
```
## postgresql_port {#postgresql_port}

Порт для связи с клиентами по протоколу PostgreSQL.

:::note
- Положительные целые числа задают номер порта для прослушивания
- Пустые значения используются для отключения связи с клиентами по протоколу MySQL.
:::

**Пример**

```xml
<postgresql_port>9005</postgresql_port>
```
## tmp_path {#tmp_path}

Путь в локальной файловой системе для хранения временных данных при обработке крупных запросов.

:::note
- Можно использовать только один вариант для настройки хранения временных данных: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
- Заключительный слэш обязателен.
:::

**Пример**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```
## url_scheme_mappers {#url_scheme_mappers}

Конфигурация для перевода сокращенных или символьных префиксов URL в полные URL.

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

Каталог с пользовательскими файлами. Используется в табличной функции [file()](../../sql-reference/table-functions/file.md), [fileCluster()](../../sql-reference/table-functions/fileCluster.md).

**Пример**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```
## user_scripts_path {#user_scripts_path}

Каталог с файлами пользовательских скриптов. Используется для исполняемых пользовательских функций [Исполняемые пользовательские функции](/sql-reference/functions/udf#executable-user-defined-functions).

**Пример**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```
## user_defined_path {#user_defined_path}

Каталог с пользовательскими файлами. Используется для SQL пользовательских функций [SQL Пользовательские функции](/sql-reference/functions/udf).

**Пример**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```
## users_config {#users_config}

Путь к файлу, который содержит:

- Конфигурации пользователей.
- Права доступа.
- Профили настроек.
- Настройки квоты.

**Пример**

```xml
<users_config>users.xml</users_config>
```
## access_control_improvements {#access_control_improvements}

Настройки для дополнительных улучшений в системе контроля доступа.

| Настройка                                         | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Значение по умолчанию |
|---------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------|
| `users_without_row_policies_can_read_rows`        | Устанавливает, могут ли пользователи без разрешений на никаких строк по прежнему читать строки с помощью запроса `SELECT`. Например, если есть два пользователя A и B, и политика строк определена только для A, то если эта настройка истинна, пользователь B увидит все строки. Если эта настройка ложна, пользователь B не увидит ни одной строки.                                                                                                                                                                | `true`                |
| `on_cluster_queries_require_cluster_grant`        | Устанавливает, требуют ли запросы `ON CLUSTER` разрешение `CLUSTER`.                                                                                                                                                                                                                                                                                                                                                                                                                                           | `true`                |
| `select_from_system_db_requires_grant`            | Устанавливает, требует ли `SELECT * FROM system.<table>` каких-либо разрешений и может быть выполнен любым пользователем. Если установлено в true, то этот запрос требует `GRANT SELECT ON system.<table>`, так же как для не системных таблиц. Исключения: несколько системных таблиц (`tables`, `columns`, `databases` и некоторые постоянные таблицы, такие как `one`, `contributors`) по-прежнему доступны для всех; если есть привилегия `SHOW` (например, `SHOW USERS`), то соответствующая системная таблица (т.е. `system.users`) будет доступна. | `true`                |
| `select_from_information_schema_requires_grant`   | Устанавливает, требует ли `SELECT * FROM information_schema.<table>` каких-либо разрешений и может быть выполнен любым пользователем. Если установлено в true, то этот запрос требует `GRANT SELECT ON information_schema.<table>`, как и для обычных таблиц.                                                                                                                                                                                                                                                                          | `true`                |
| `settings_constraints_replace_previous`           | Устанавливает, если ограничение в профиле настроек для какой-либо настройки отменит действия предыдущего ограничения (определенного в других профилях) для этой настройки, включая поля, которые не установлены новым ограничением. Оно также включает тип ограничения `changeable_in_readonly`.                                                                                                                                                                                                        | `true`                |
| `table_engines_require_grant`                     | Устанавливает, требует ли создание таблицы с определенным движком таблицы разрешение.                                                                                                                                                                                                                                                                                                                                                                                                                           | `false`               |
| `role_cache_expiration_time_seconds`              | Устанавливает количество секунд с момента последнего доступа, по истечении которого роль хранится в кэше ролей.                                                                                                                                                                                                                                                                                                                                                                                                   | `600`                 |

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

Настройки для системной таблицы `s3queue_log`.

<SystemLogParameters/>

Значения по умолчанию:

```xml
<s3queue_log>
    <database>system</database>
    <table>s3queue_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</s3queue_log>
```
## zookeeper {#zookeeper}

Содержит настройки, которые позволяют ClickHouse взаимодействовать с кластером [ZooKeeper](http://zookeeper.apache.org/). ClickHouse использует ZooKeeper для хранения метаданных реплик при использовании реплицируемых таблиц. Если реплицируемые таблицы не используются, этот раздел параметров можно опустить.

Следующие настройки могут быть сконфигурированы с помощью под-тегов:

| Параметр                                   | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|--------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `node`                                     | Конечная точка ZooKeeper. Можно задать несколько конечных точек. Например, `<node index="1"><host>example_host</host><port>2181</port></node>`. Атрибут `index` указывает порядок узлов при попытке подключиться к кластеру ZooKeeper.                                                                                                                                                                                                                                                                                          |
| `session_timeout_ms`                       | Максимальное время ожидания для клиентской сессии в миллисекундах.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `operation_timeout_ms`                     | Максимальное время ожидания для одной операции в миллисекундах.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `root` (необязательно)                     | znode, который используется в качестве корня для znodes, используемых сервером ClickHouse.                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `fallback_session_lifetime.min` (необязательно) | Минимальный лимит для срока жизни сессии ZooKeeper к узлу резервирования, когда основной недоступен (балансировка нагрузки). Устанавливается в секундах. По умолчанию: 3 часа.                                                                                                                                                                                                                                                                                                                                                              |
| `fallback_session_lifetime.max` (необязательно) | Максимальный лимит для срока жизни сессии ZooKeeper к узлу резервирования, когда основной недоступен (балансировка нагрузки). Устанавливается в секундах. По умолчанию: 6 часов.                                                                                                                                                                                                                                                                                                                                                              |
| `identity` (необязательно)                 | Пользователь и пароль, требуемые ZooKeeper для доступа к запрашиваемым znodes.                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `use_compression` (необязательно)          | Включает сжатие в протоколе Keeper, если установлено в true.                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

Также есть настройка `zookeeper_load_balancing` (необязательно), которая позволяет выбрать алгоритм для выбора узлов ZooKeeper:

| Название алгоритма                 | Описание                                                                                                                    |
|------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| `random`                           | случайно выбирает один из узлов ZooKeeper.                                                                                 |
| `in_order`                         | выбирает первый узел ZooKeeper, если он недоступен, то второй, и так далее.                                                |
| `nearest_hostname`                 | выбирает узел ZooKeeper с именем хоста, наиболее похожим на имя хоста сервера, имя хоста сравнивается с префиксом имени. |
| `hostname_levenshtein_distance`    | аналогично nearest_hostname, но сравнивает имя хоста с использованием расстояния Левенштейна.                           |
| `first_or_random`                  | выбирает первый узел ZooKeeper, если он недоступен, то случайным образом выбирает один из оставшихся узлов ZooKeeper.    |
| `round_robin`                      | выбирает первый узел ZooKeeper, если происходит повторное соединение, выбирает следующий.                                  |

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
    <!-- Необязательно. Суффикс Chroot. Должен существовать. -->
    <root>/path/to/zookeeper/node</root>
    <!-- Необязательно. Строка ACL digest для Zookeeper. -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**См. также**

- [Replication](../../engines/table-engines/mergetree-family/replication.md)
- [ZooKeeper Programmer's Guide](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [Опциональная защищённая связь между ClickHouse и Zookeeper](/operations/ssl-zookeeper)
## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper}

Метод хранения заголовков частей данных в ZooKeeper. Эта настройка применяется только к семейству [`MergeTree`](/engines/table-engines/mergetree-family). Ее можно указать:

**Глобально в разделе [merge_tree](#merge_tree) файла `config.xml`**

ClickHouse использует эту настройку для всех таблиц на сервере. Вы можете изменить настройку в любое время. Существующие таблицы изменяют свое поведение, когда настройка изменяется.

**Для каждой таблицы**

При создании таблицы укажите соответствующую [настройку движка](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table). Поведение существующей таблицы с этой настройкой не изменяется, даже если глобальная настройка изменится.

**Возможные значения**

- `0` — Функциональность отключена.
- `1` — Функциональность включена.

Если [`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper), то [реплицируемые](../../engines/table-engines/mergetree-family/replication.md) таблицы хранят заголовки частей данных компактно, используя один `znode`. Если таблица содержит много колонок, этот метод хранения значительно уменьшает объем данных, хранящихся в ZooKeeper.

:::note
После применения `use_minimalistic_part_header_in_zookeeper = 1` вы не можете понизить версию сервера ClickHouse до версии, которая не поддерживает эту настройку. Будьте осторожны при обновлении ClickHouse на серверах в кластере. Не обновляйте все серверы сразу. Безопаснее тестировать новые версии ClickHouse в тестовой среде или на нескольких серверах кластера.

Заголовки частей данных, уже сохраненные с этой настройкой, не могут быть восстановлены в их предыдущее (не компактное) представление.
:::
## distributed_ddl {#distributed_ddl}

Управляйте выполнением [распределенных ddl запросов](../../sql-reference/distributed-ddl.md) (`CREATE`, `DROP`, `ALTER`, `RENAME`) в кластере. Работает только если включен [ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper).

Конфигурируемые настройки внутри `<distributed_ddl>` включают:

| Параметр                | Описание                                                                                                                       | Значение по умолчанию                  |
|------------------------|-----------------------------------------------------------------------------------------------------------------------------------|----------------------------------------|
| `path`                 | путь в Keeper для `task_queue` для DDL запросов                                                                           |                                        |
| `profile`              | профиль, используемый для выполнения DDL запросов                                                                                       |                                        |
| `pool_size`            | сколько `ON CLUSTER` запросов может выполняться одновременно                                                                           |                                        |
| `max_tasks_in_queue`   | максимальное количество задач, которые могут находиться в очереди.                                                                             | `1,000`                                |
| `task_max_lifetime`    | удаляет узел, если его возраст превышает это значение.                                                                                | `7 * 24 * 60 * 60` (неделя в секундах) |
| `cleanup_delay_period` | очистка начинается после получения нового события узла, если последняя очистка не была выполнена ранее, чем `cleanup_delay_period` секунд назад. | `60` секунд                           |

**Пример**

```xml
<distributed_ddl>
    <!-- Путь в ZooKeeper к очереди с DDL запросами -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- Настройки из этого профиля будут использоваться для выполнения DDL запросов -->
    <profile>default</profile>

    <!-- Контролирует, сколько ON CLUSTER запросов может выполняться одновременно. -->
    <pool_size>1</pool_size>

    <!--
         Настройки очистки (активные задачи не будут удалены)
    -->

    <!-- Контролирует TTL задач (по умолчанию 1 неделя) -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- Контролирует, как часто должна выполняться очистка (в секундах) -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- Контролирует, сколько задач может быть в очереди -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```
## access_control_path {#access_control_path}

Путь к папке, где сервер ClickHouse хранит конфигурации пользователей и ролей, созданные с помощью SQL-команд.

**См. также**

- [Контроль доступа и управление учетными записями](/operations/access-rights#access-control-usage)
## allow_plaintext_password {#allow_plaintext_password}

Устанавливает, разрешены ли типы паролей в открытом виде (небезопасные).

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```
## allow_no_password {#allow_no_password}

Устанавливает, разрешен ли небезопасный тип пароля без пароля.

```xml
<allow_no_password>1</allow_no_password>
```
## allow_implicit_no_password {#allow_implicit_no_password}

Запрещает создание пользователя без пароля, если явно не указано 'IDENTIFIED WITH no_password'.

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```
## default_session_timeout {#default_session_timeout}

Настройка по умолчанию для времени ожидания сессии, в секундах.

```xml
<default_session_timeout>60</default_session_timeout>
```
## default_password_type {#default_password_type}

Устанавливает тип пароля, который будет автоматически установлен для запросов, таких как `CREATE USER u IDENTIFIED BY 'p'`.

Принимаемые значения:
- `plaintext_password`
- `sha256_password`
- `double_sha1_password`
- `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```
## user_directories {#user_directories}

Раздел конфигурационного файла, который содержит настройки:
- Путь к конфигурационному файлу с предопределенными пользователями.
- Путь к папке, где хранятся пользователи, созданные с помощью SQL-команд.
- Путь узла ZooKeeper, где хранятся и реплицируются пользователи, созданные с помощью SQL-команд (экспериментально).

Если этот раздел указан, путь из [users_config](/operations/server-configuration-parameters/settings#users_config) и [access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path) не будет использоваться.

Раздел `user_directories` может содержать любое количество элементов, порядок элементов означает их приоритет (чем выше элемент, тем выше приоритет).

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

Вы также можете определить секции `memory` — это означает хранение информации только в памяти, без записи на диск, и `ldap` — это означает хранение информации на LDP-сервере.

Чтобы добавить LDAP-сервер в качестве удаленного каталога пользователей, которые не определены локально, определите единую секцию `ldap` с следующими настройками:

| Параметр  | Описание                                                                                                                                                                                                                                                                                                                                                                    |
|-----------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `server`  | одно из имен LDAP-серверов, определенных в разделе конфигурации `ldap_servers`. Этот параметр обязательный и не может быть пустым.                                                                                                                                                                                                                                                            |
| `roles`   | секция со списком локально определенных ролей, которые будут назначены каждому пользователю, полученному с LDAP-сервера. Если роли не указаны, пользователь не сможет выполнять никаких действий после аутентификации. Если какая-либо из перечисленных ролей не определена локально на момент аутентификации, попытка аутентификации завершится неудачей, как будто предоставленный пароль был неправильным. |

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

Определяет список пользовательских доменов верхнего уровня для добавления, где каждая запись формата `<name>/path/to/file</name>`.

Например:

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

См. также:
- функция [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cuttofirstsignificantsubdomaincustom) и её вариации,
  которая принимает имя списка пользовательских TLD, возвращая часть домена, включающую верхние поддомены до первого значимого поддомена.
## proxy {#proxy}

Определите прокси-серверы для HTTP и HTTPS запросов, которые в настоящее время поддерживаются S3 хранилищами, S3 табличными функциями и URL функциями.

Существует три способа определения прокси-серверов:
- переменные окружения
- списки прокси
- удаленные прокси-резолверы.

Поддерживается также обход прокси-серверов для конкретных хостов с использованием `no_proxy`.

**Переменные окружения**

Переменные окружения `http_proxy` и `https_proxy` позволяют указать прокси-сервер для данного протокола. Если он установлен в вашей системе, это должно работать без проблем.

Это самый простой подход, если у данного протокола всего один прокси-сервер и этот прокси-сервер не меняется.

**Списки прокси**

Этот подход позволяет указать один или несколько прокси-серверов для протокола. Если определено более одного прокси-сервера, ClickHouse использует разные прокси по принципу "круговой очереди", балансируя нагрузку между серверами. Это самый простой способ, если для протокола есть более одного прокси-сервера и список прокси-серверов не меняется.

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
Выберите родительское поле на вкладках ниже, чтобы просмотреть их дочерние элементы:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| Поле      | Описание                          |
|-----------|-----------------------------------|
| `<http>`  | Список одного или нескольких HTTP прокси  |
| `<https>` | Список одного или нескольких HTTPS прокси |

  </TabItem>
  <TabItem value="http_https" label="<http> и <https>">


| Поле   | Описание          |
|--------|-------------------|
| `<uri>` | URI прокси |

  </TabItem>
</Tabs>

**Удаленные прокси-резолверы**

Возможно, прокси-серверы изменяются динамически. В этом случае вы можете определить конечную точку резолвера. ClickHouse отправляет пустой GET-запрос на эту конечную точку, удаленный резолвер должен вернуть хост прокси.
ClickHouse будет использовать его для формирования URI прокси, используя следующий шаблон: `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

Выберите родительское поле на вкладках ниже, чтобы просмотреть их дочерние элементы:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| Поле      | Описание                      |
|-----------|-------------------------------|
| `<http>`  | Список одного или нескольких резолверов* |
| `<https>` | Список одного или нескольких резолверов* |

  </TabItem>
  <TabItem value="http_https" label="<http> и <https>">

| Поле          | Описание                                   |
|---------------|--------------------------------------------|
| `<resolver>`  | Конечная точка и другие детали для резолвера |

:::note
Вы можете иметь несколько `<resolver>` элементов, но только первый
`<resolver>` для данного протокола используется. Любые другие элементы `<resolver>`
для этого протокола игнорируются. Это значит, что балансировка нагрузки
(если необходимо) должна быть реализована удаленным резолвером.
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| Поле                | Описание                                                                                                                                                                            |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `<endpoint>`        | URI резолвера прокси                                                                                                                                                                 |
| `<proxy_scheme>`    | Протокол финального URI прокси. Это может быть либо `http`, либо `https`.                                                                                                             |
| `<proxy_port>`      | Номер порта резолвера прокси                                                                                                                                                            |
| `<proxy_cache_time>` | Время в секундах, которое значения от резолвера должны кэшироваться ClickHouse. Установка этого значения в `0` заставляет ClickHouse обращаться к резолверу для каждого HTTP или HTTPS запроса. |

  </TabItem>
</Tabs>

**Приоритет**

Настройки прокси определяются в следующем порядке:

| Порядок | Параметр                |
|---------|-------------------------|
| 1.      | Удаленные прокси-резолверы |
| 2.      | Списки прокси           |
| 3.      | Переменные окружения    |

ClickHouse проверяет резолвер самого высокого приоритета для протокола запроса. Если он не определён,
он проверяет резолвер следующего наивысшего приоритета, пока не достигнет резолвера окружения.
Это также позволяет использовать смешанные типы резолверов.
## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy}

По умолчанию туннелирование (т.е. `HTTP CONNECT`) используется для выполнения `HTTPS` запросов через `HTTP` прокси. Эта настройка может быть использована для отключения его.

**no_proxy**

По умолчанию все запросы будут проходить через прокси. Чтобы отключить его для конкретных хостов, необходимо установить переменную `no_proxy`.
Её можно установить внутри раздела `<proxy>` для списков и удалённых резолверов, а также как переменную окружения для резолвера окружения.
Она поддерживает IP-адреса, домены, поддомены и `'*'` подстановочный знак для полного обхода. Ведущие точки удаляются, как это делает curl.

**Пример**

Нижеуказанная конфигурация обходит прокси-запросы к `clickhouse.cloud` и всем его поддоменам (например, `auth.clickhouse.cloud`).
То же самое применяется и к GitLab, даже если у него есть ведущая точка. Оба `gitlab.com` и `about.gitlab.com` будут обходить прокси.

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

Каталог, используемый в качестве хранилища для всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. По умолчанию используется папка `/workload/` в рабочем каталоге сервера.

**Пример**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**См. также**
- [Иерархия нагрузки](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)
## workload_zookeeper_path {#workload_zookeeper_path}

Путь к узлу ZooKeeper, который используется в качестве хранилища для всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. Для согласованности все SQL определения хранятся как значение этого единственного znode. По умолчанию ZooKeeper не используется, и определения хранятся на [диске](#workload_path).

**Пример**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**См. также**
- [Иерархия нагрузки](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)
