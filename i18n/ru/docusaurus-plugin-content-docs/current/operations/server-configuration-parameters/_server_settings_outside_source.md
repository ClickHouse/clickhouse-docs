## asynchronous_metric_log {#asynchronous_metric_log}

Включено по умолчанию на развертываниях ClickHouse Cloud.

Если настройка не включена по умолчанию в вашей среде, в зависимости от способа установки ClickHouse, вы можете следовать инструкции ниже, чтобы включить или отключить ее.

**Включение**

Чтобы вручную включить сбор истории логов асинхронных метрик [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md), создайте файл `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` со следующим содержимым:

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

Использовать исходный адрес для аутентификации для клиентов, подключенных через прокси.

:::note
Эта настройка должна использоваться с особой осторожностью, так как перенаправленные адреса могут быть легко подделаны - серверам, принимающим такую аутентификацию, не следует обращаться напрямую, а исключительно через доверенный прокси.
:::
## backups {#backups}

Настройки для резервных копий, используемые при записи `BACKUP TO File()`.

Следующие настройки могут быть настроены с помощью под-тегов:

| Настройка                             | Описание                                                                                                                                                                    | По умолчанию |
|---------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| `allowed_path`                        | Путь для резервного копирования с использованием `File()`. Эта настройка должна быть установлена для использования `File`. Путь может быть относительным к директории инстанса или абсолютным. | `true`       |
| `remove_backup_files_after_failure`   | Если команда `BACKUP` завершается с ошибкой, ClickHouse попытается удалить файлы, которые уже были скопированы в резервную копию до сбоя, в противном случае он оставит скопированные файлы как есть. | `true`       |

Эта настройка по умолчанию конфигурируется как:

```xml
<backups>
    <allowed_path>backups</allowed_path>
    <remove_backup_files_after_failure>true</remove_backup_files_after_failure>
</backups>
```
## bcrypt_workfactor {#bcrypt_workfactor}

Фактор работы для типа аутентификации bcrypt_password, который использует [алгоритм Bcrypt](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/).

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```
## table_engines_require_grant {#table_engines_require_grant}

Если установлено в true, пользователи требуют разрешение для создания таблицы с определенным движком, например `GRANT TABLE ENGINE ON TinyLog to user`.

:::note
По умолчанию, для обратной совместимости создание таблицы с определенным движком таблицы игнорирует разрешение, однако вы можете изменить это поведение, установив значение в true.
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
Рекомендуется не изменять это, если вы только начали использовать ClickHouse.
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
- `min_part_size_ratio` – Соотношение размера части данных к размеру таблицы.
- `method` – Метод сжатия. Допустимые значения: `lz4`, `lz4hc`, `zstd`,`deflate_qpl`.
- `level` – Уровень сжатия. См. [Кодеки](/sql-reference/statements/create/table#general-purpose-codecs).

:::note
Вы можете настроить несколько секций `<case>`.
:::

**Действия при выполнении условий**:

- Если часть данных соответствует установленному условию, ClickHouse использует указанный метод сжатия.
- Если часть данных соответствует нескольким наборам условий, ClickHouse использует первый подходящий набор условий.

:::note
Если ни одно условие не выполняется для части данных, ClickHouse использует сжатие `lz4`.
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

Настраивает команду для получения ключа, который будет использоваться кодеками [шифрования](/sql-reference/statements/create/table#encryption-codecs). Ключ (или ключи) должны быть записаны в переменных окружения или установлены в конфигурационном файле.

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
Хранение ключей в конфигурационном файле не рекомендуется. Это небезопасно. Вы можете переместить ключи в отдельный конфигурационный файл на безопасном диске и создать символическую ссылку на этот конфигурационный файл в папке `config.d/`.
:::

Загрузка из конфигурации, когда ключ в шестнадцатеричном формате:

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

Каждый из этих методов может быть применен для нескольких ключей:

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

Также пользователи могут добавить nonce, который должен быть длиной 12 байт (по умолчанию процессы шифрования и расшифровки используют nonce, состоящий из нулевых байтов):

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
Все, что упомянуто выше, может быть применено для `aes_256_gcm_siv` (но ключ должен быть длиной 32 байта).
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

**См. также**

- [Пользовательские настройки](/operations/settings/query-level#custom_settings)
## core_dump {#core_dump}

Настраивает мягкий лимит для размера файла дампа памяти.

:::note
Жесткий лимит настраивается с помощью системных инструментов.
:::

**Пример**

```xml
<core_dump>
     <size_limit>1073741824</size_limit>
</core_dump>
```
## default_profile {#default_profile}

Профиль настроек по умолчанию. Профили настройки расположены в файле, указанном в настройке `user_config`.

**Пример**

```xml
<default_profile>default</default_profile>
```
## dictionaries_config {#dictionaries_config}

Путь к конфигурационному файлу для словарей.

Путь:

- Укажите абсолютный путь или путь относительно конфигурационного файла сервера.
- Путь может содержать подстановочные знаки \* и ?.

См. также:
- "[Словари](../../sql-reference/dictionaries/index.md)".

**Пример**

```xml
<dictionaries_config>*_dictionary.xml</dictionaries_config>
```
## user_defined_executable_functions_config {#user_defined_executable_functions_config}

Путь к конфигурационному файлу для исполняемых пользовательских функций.

Путь:

- Укажите абсолютный путь или путь относительно конфигурационного файла сервера.
- Путь может содержать подстановочные знаки \* и ?.

См. также:
- "[Исполняемые пользовательские функции](/sql-reference/functions/udf#executable-user-defined-functions).".

**Пример**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```
## format_schema_path {#format_schema_path}

Путь к директории со схемами для входных данных, таким как схемы для формата [CapnProto](../../interfaces/formats.md#capnproto).

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
- `timeout` – Тайм-аут для отправки данных, в секундах.
- `root_path` – Префикс для ключей.
- `metrics` – Отправка данных из таблицы [system.metrics](/operations/system-tables/metrics).
- `events` – Отправка данных дельты, накопленных за период времени, из таблицы [system.events](/operations/system-tables/events).
- `events_cumulative` – Отправка кумулятивных данных из таблицы [system.events](/operations/system-tables/events).
- `asynchronous_metrics` – Отправка данных из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).

Вы можете настроить несколько пунктов `<graphite>`. Например, вы можете использовать это для отправки различных данных с различными интервалами.

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

Настройки для сгущения данных для Graphite.

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
## google_protos_path {#google_protos_path}

Определяет директорию, содержащую файлы proto для типов Protobuf.

**Пример:**

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```
## http_handlers {#http_handlers}

Позволяет использовать пользовательские HTTP-обработчики.
Чтобы добавить новый http-обработчик, просто добавьте новое `<rule>`.
Правила проверяются сверху вниз, как указано,
и первое совпадение запустит обработчик.

Следующие настройки могут быть настроены с помощью под-тегов:

| Под-теги             | Определение                                                                                                                                         |
|----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                | Чтобы сопоставить URL запроса, вы можете использовать префикс 'regex:' для использования регулярного выражения (необязательно)                        |
| `methods`            | Чтобы сопоставить методы запроса, вы можете использовать запятые для разделения нескольких совпадений методов (необязательно)                          |
| `headers`            | Чтобы сопоставить заголовки запроса, сопоставьте каждый дочерний элемент (имя дочернего элемента - имя заголовка), вы можете использовать префикс 'regex:' для использования регулярного выражения (необязательно) |
| `handler`            | Обработчик запроса                                                                                                                                |
| `empty_query_string` | Проверьте, что в URL нет строки запроса                                                                                                           |

`handler` содержит следующие настройки, которые могут быть настроены с помощью под-тегов:

| Под-теги           | Определение                                                                                                                                                            |
|--------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`              | Место для перенаправления                                                                                                                                               |
| `type`             | Поддерживаемые типы: static, dynamic_query_handler, predefined_query_handler, redirect                                                                                  |
| `status`           | Используйте со статическим типом, код состояния ответа                                                                                                                |
| `query_param_name` | Используйте с типом dynamic_query_handler, извлекает и выполняет значение, соответствующее значению `<query_param_name>` в параметрах HTTP-запроса                        |
| `query`            | Используйте с типом predefined_query_handler, выполняет запрос, когда вызывается обработчик                                                                              |
| `content_type`     | Используйте со статическим типом, content-type ответа                                                                                                               |
| `response_content` | Используйте со статическим типом, содержимое ответа, отправляемое клиенту; при использовании префикса 'file://' или 'config://', найдет содержимое в файле или конфигурации, отправленное клиенту |

В дополнение к списку правил можно указать `<defaults/>`, которое указывает на включение всех стандартных обработчиков.

**Пример:**

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

Страница, которая отображается по умолчанию, когда вы обращаетесь к HTTP(s) серверу ClickHouse.
Значение по умолчанию - "Ok." (с символом новой строки в конце)

**Пример**

Открывает `https://tabix.io/` при обращении к `http://localhost: http_port`.

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```
## http_options_response {#http_options_response}

Используется для добавления заголовков к ответу в запросе HTTP `OPTIONS`.
Метод `OPTIONS` используется при выполнении предвходящих запросов CORS.

Для получения дополнительной информации см. [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS).

**Пример:**

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

Срок действия для HSTS в секундах.

:::note
Значение `0` означает, что ClickHouse отключает HSTS. Если вы задаете положительное число, HSTS будет включен, а max-age - это число, которое вы установили.
:::

**Пример**

```xml
<hsts_max_age>600000</hsts_max_age>
```
## mlock_executable {#mlock_executable}

Выполнить `mlockall` после запуска, чтобы снизить задержку первых запросов и предотвратить выгрузку исполняемого файла ClickHouse под высокой нагрузкой ввода-вывода.

:::note
Рекомендуется включение этой опции, но это приведет к увеличению времени запуска до нескольких секунд.
Учтите, что эта настройка не будет работать без возможности "CAP_IPC_LOCK".
:::

**Пример**

```xml
<mlock_executable>false</mlock_executable>
```
## include_from {#include_from}

Путь к файлу с заменами. Поддерживаются как XML, так и YAML форматы.

Для получения дополнительной информации см. раздел "[Файлы конфигурации](/operations/configuration-files)".

**Пример**

```xml
<include_from>/etc/metrica.xml</include_from>
```
## interserver_listen_host {#interserver_listen_host}

Ограничение на хосты, которые могут обмениваться данными между серверами ClickHouse.
Если используется Keeper, то то же ограничение будет применяться к общению между различными экземплярами Keeper.

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

Имя хоста, которое могут использовать другие сервера для доступа к этому серверу.

Если упущено, оно определяется так же, как команда `hostname -f`.

Полезно для отвязки от конкретного сетевого интерфейса.

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

Аналогично [`interserver_http_host`](#interserver_http_host), за исключением того, что это имя хоста может использоваться другими серверами для доступа к этому серверу по `HTTPS`.

**Пример**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```
## interserver_http_credentials {#interserver_http_credentials}

Имя пользователя и пароль, используемые для подключения к другим серверам во время [репликации](../../engines/table-engines/mergetree-family/replication.md). Кроме того, сервер аутентифицирует другие реплики, используя эти учетные данные.
`interserver_http_credentials` должны быть одинаковыми для всех реплик в кластере.

:::note
- По умолчанию, если раздел `interserver_http_credentials` пропущен, аутентификация не используется во время репликации.
- Настройки `interserver_http_credentials` не относятся к учетным данным клиента ClickHouse [конфигурации](../../interfaces/cli.md#configuration_files).
- Эти учетные данные общие для репликации через `HTTP` и `HTTPS`.
  :::

Следующие настройки могут быть настроены с помощью под-тегов:

- `user` — Имя пользователя.
- `password` — Пароль.
- `allow_empty` — Если `true`, то другим репликам разрешено подключаться без аутентификации, даже если учетные данные установлены. Если `false`, то соединения без аутентификации отклоняются. По умолчанию: `false`.
- `old` — Содержит старые `user` и `password`, использованные во время ротации учетных данных. Можно указать несколько секций `old`.

**Ротация учетных данных**

ClickHouse поддерживает динамическую ротацию учетных данных межсерверной аутентификации без одновременной остановки всех реплик для обновления их конфигурации. Учетные данные могут изменяться в несколько этапов.

Чтобы включить аутентификацию, установите `interserver_http_credentials.allow_empty` в `true` и добавьте учетные данные. Это позволяет подключениям с аутентификацией и без нее.

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

После настройки всех реплик установите `allow_empty` в `false` или удалите эту настройку. Это сделает аутентификацию с новыми учетными данными обязательной.

Чтобы изменить существующие учетные данные, переместите имя пользователя и пароль в раздел `interserver_http_credentials.old`, а новые значения обновите в `user` и `password`. На этом этапе сервер использует новые учетные данные для подключения к другим репликам и принимает соединения как с новыми, так и со старыми учетными данными.

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

Когда новые учетные данные применены ко всем репликам, старые учетные данные могут быть удалены.

## ldap_servers {#ldap_servers}

Список серверов LDAP с их параметрами подключения здесь для:
- использования в качестве аутентификаторов для выделенных локальных пользователей, у которых указан механизм аутентификации 'ldap' вместо 'password'
- использования в качестве удаленных каталогов пользователей.

Следующие параметры можно настроить с помощью под-тегов:

| Параметр                        | Описание                                                                                                                                                                                                                                                                                                                                                                                                                              |
|---------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                          | Имя хоста или IP-адрес сервера LDAP, этот параметр обязателен и не может быть пустым.                                                                                                                                                                                                                                                                                                                                                             |
| `port`                          | Порт сервера LDAP, по умолчанию 636, если `enable_tls` установлен в true, иначе `389`.                                                                                                                                                                                                                                                                                                                                                        |
| `bind_dn`                       | Шаблон, используемый для построения DN для подключения. Результирующий DN будет построен путем замены всех подстрок `\{user_name\}` шаблона на фактическое имя пользователя при каждой попытке аутентификации.                                                                                                                                                                                                                               |
| `user_dn_detection`             | Раздел с параметрами поиска LDAP для определения фактического DN пользователя, к которому подключен пользователь. Это в основном используется в фильтрах поиска для дальнейшего отображения ролей, когда сервер является Active Directory. Результирующий DN пользователя будет использоваться при замене подстрок `\{user_dn\}`, где это разрешено. По умолчанию DN пользователя устанавливается равным DN подключения, но после выполнения поиска он будет обновлен до фактического обнаруженного значения DN пользователя. |
| `verification_cooldown`         | Период времени, в секундах, после успешной попытки подключения, в течение которого пользователь будет считаться успешно аутентифицированным для всех последующих запросов без обращения к серверу LDAP. Укажите `0` (по умолчанию), чтобы отключить кэширование и заставить обращаться к серверу LDAP для каждого запроса аутентификации.                                                                                                                  |
| `enable_tls`                    | Флаг для активации использования защищенного соединения с сервером LDAP. Укажите `no` для протокола в простом тексте (`ldap://`) (не рекомендуется). Укажите `yes` для LDAP по SSL/TLS (`ldaps://`) (рекомендуется, по умолчанию). Укажите `starttls` для устаревшего протокола StartTLS (простой текст (`ldap://`), обновленный до TLS).                                                                                                               |
| `tls_minimum_protocol_version`  | Минимальная версия протокола SSL/TLS. Приемлемые значения: `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2` (по умолчанию).                                                                                                                                                                                                                                                                                                                |
| `tls_require_cert`              | Поведение проверки сертификатов пиров SSL/TLS. Приемлемые значения: `never`, `allow`, `try`, `demand` (по умолчанию).                                                                                                                                                                                                                                                                                                                    |
| `tls_cert_file`                 | Путь к файлу сертификата.                                                                                                                                                                                                                                                                                                                                                                                                                |
| `tls_key_file`                  | Путь к файлу ключа сертификата.                                                                                                                                                                                                                                                                                                                                                                                                            |
| `tls_ca_cert_file`              | Путь к файлу сертификата CA.                                                                                                                                                                                                                                                                                                                                                                                                             |
| `tls_ca_cert_dir`               | Путь к каталогу, содержащему сертификаты CA.                                                                                                                                                                                                                                                                                                                                                                                        |
| `tls_cipher_suite`              | Разрешенный набор криптографических алгоритмов (в нотации OpenSSL).                                                                                                                                                                                                                                                                                                                                                                                              |

Параметр `user_dn_detection` можно настроить с под-тегами:

| Параметр         | Описание                                                                                                                                                                                                                                                                                                                                    |
|------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`        | Шаблон, используемый для построения базового DN для поиска LDAP. Результирующий DN будет построен путем замены всех подстрок `\{user_name\}` и '\{bind_dn\}' шаблона на фактическое имя пользователя и DN подключения во время поиска LDAP.                                                                                                       |
| `scope`          | Область поиска LDAP. Приемлемые значения: `base`, `one_level`, `children`, `subtree` (по умолчанию).                                                                                                                                                                                                                                       |
| `search_filter`  | Шаблон, используемый для построения фильтра поиска для поиска LDAP. Результирующий фильтр будет построен путем замены всех подстрок `\{user_name\}`, `\{bind_dn\}` и `\{base_dn\}` шаблона на фактическое имя пользователя, DN подключения и базовый DN во время поиска LDAP. Обратите внимание, что специальные символы должны быть правильно экранированы в XML.  |

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

Пример (типичный Active Directory с настроенным определением DN пользователя для дальнейшего отображения ролей):

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

Сервер не выйдет из работы, если сети IPv6 или IPv4 недоступны во время попытки прослушивания.

**Пример**

```xml
<listen_try>0</listen_try>
```
## listen_reuse_port {#listen_reuse_port}

Разрешить нескольким серверам прослушивать один и тот же адрес:порт. Запросы будут направляться к случайному серверу операционной системой. Включение этой настройки не рекомендуется.

**Пример**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

Тип:

По умолчанию:
## listen_backlog {#listen_backlog}

Размер очереди ожидания подключений на сокете прослушивания (backlog). Значение по умолчанию `4096` совпадает с таковым в linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)).

Обычно это значение не нужно изменять, поскольку:
- Значение по умолчанию достаточно велико,
- Для приема подключений клиентов сервер имеет отдельный поток.

Таким образом, даже если у вас значение `TcpExtListenOverflows` (из `nstat`) не нулевое и этот счетчик увеличивается для сервера ClickHouse, это не означает, что это значение нужно увеличивать, поскольку:
- Обычно, если `4096` недостаточно, это показывает какую-то внутреннюю проблему масштабирования ClickHouse, поэтому лучше обратиться по этой проблеме.
- Это не означает, что сервер сможет обрабатывать больше подключений позже (и даже если бы мог, к тому моменту клиенты могли бы отключиться).

**Пример**

```xml
<listen_backlog>4096</listen_backlog>
```
## logger {#logger}

Местоположение и формат сообщений журнала.

**Ключи**:

| Ключ                      | Описание                                                                                                                                                                         |
|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                   | Уровень журнала. Приемлемые значения: `none` (отключить журналирование), `fatal`, `critical`, `error`, `warning`, `notice`, `information`, `debug`, `trace`, `test`                                  |
| `log`                     | Путь к файлу журнала.                                                                                                                                                           |
| `errorlog`                | Путь к файлу журнала ошибок.                                                                                                                                                     |
| `size`                    | Политика ротации: Максимальный размер файлов журнала в байтах. Как только размер файла журнала превышает этот порог, он переименовывается и архивируется, и создается новый файл журнала.                  |
| `count`                   | Политика ротации: Сколько исторических файлов журнала ClickHouse хранится максимум.                                                                                                         |
| `stream_compress`         | Сжимать сообщения журнала с использованием LZ4. Установите в `1` или `true`, чтобы включить.                                                                                                                    |
| `console`                 | Не записывать сообщения журнала в файлы журнала, вместо этого выводить их в консоль. Установите в `1` или `true`, чтобы включить. По умолчанию `1`, если ClickHouse не работает в режиме демона, `0` в противном случае. |
| `console_log_level`       | Уровень журнала для вывода в консоли. По умолчанию равен `level`.                                                                                                                                  |
| `formatting`              | Формат журнала для вывода в консоли. В настоящее время поддерживается только `json`                                                                                                                  |
| `use_syslog`              | Также пересылать вывод журнала в syslog.                                                                                                                                                  |
| `syslog_level`            | Уровень журнала для записи в syslog.                                                                                                                                                    |

**Спецификаторы формата журнала**

Имена файлов в путях `log` и `errorLog` поддерживают ниже указанные спецификаторы формата для результирующего имени файла (часть каталога не поддерживает их).

Столбец "Пример" показывает вывод на `2023-07-06 18:32:07`.

| Спецификатор    | Описание                                                                                                         | Пример                  |
|------------------|---------------------------------------------------------------------------------------------------------------------|--------------------------|
| `%%`             | Литерал %                                                                                                           | `%`                        |
| `%n`             | Символ новой строки                                                                                                  |                          |
| `%t`             | Символ горизонтальной табуляции                                                                                            |                          |
| `%Y`             | Год в десятичном представлении, например, 2017                                                                                 | `2023`                     |
| `%y`             | Последние 2 цифры года в десятичном представлении (диапазон [00,99])                                                           | `23`                       |
| `%C`             | Первая 2 цифры года в десятичном представлении (диапазон [00,99])                                                          | `20`                       |
| `%G`             | Четырехзначный [ISO 8601 год по неделям](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), т.е. год, содержащий указанную неделю. Обычно полезен только с `%V`  | `2023`       |
| `%g`             | Последние 2 цифры [ISO 8601 года по неделям](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), т.е. год, содержащий указанную неделю.                         | `23`         |
| `%b`             | Сокращенное название месяца, например, Окт (зависит от локали)                                                                 | `Jul`                      |
| `%h`             | Синоним для %b                                                                                                       | `Jul`                      |
| `%B`             | Полное название месяца, например, октябрь (зависит от локали)                                                                    | `July`                     |
| `%m`             | Месяц в десятичном представлении (диапазон [01,12])                                                                           | `07`                       |
| `%U`             | Неделя года в десятичном представлении (воскресенье - первый день недели) (диапазон [00,53])                          | `27`                       |
| `%W`             | Неделя года в десятичном представлении (понедельник - первый день недели) (диапазон [00,53])                          | `27`                       |
| `%V`             | Номер недели ISO 8601 (диапазон [01,53])                                                                                | `27`                       |
| `%j`             | День в году в десятичном представлении (диапазон [001,366])                                                               | `187`                      |
| `%d`             | День месяца в виде числа с ведущим нулем (диапазон [01,31]). Однозначное число предшествует нулю.                 | `06`                       |
| `%e`             | День месяца в виде числа с пробелом (диапазон [1,31]). Однозначное число предшествует пробелу.              | `&nbsp; 6`                 |
| `%a`             | Сокращенное название дня недели, например, Пт (в зависимости от локали)                                                               | `Thu`                      |
| `%A`             | Полное название дня недели, например, пятница (в зависимости от локали)                                                                   | `Thursday`                 |
| `%w`             | День недели в виде целого числа, воскресенье - 0 (диапазон [0-6])                                                          | `4`                        |
| `%u`             | День недели в десятичном формате, где понедельник - 1 (стандарт ISO 8601) (диапазон [1-7])                                      | `4`                        |
| `%H`             | Час в десятичном формате, 24-часовой формат (диапазон [00-23])                                                             | `18`                       |
| `%I`             | Час в десятичном формате, 12-часовой формат (диапазон [01,12])                                                             | `06`                       |
| `%M`             | Минута в десятичном формате (диапазон [00,59])                                                                          | `32`                       |
| `%S`             | Секунда в десятичном формате (диапазон [00,60])                                                                          | `07`                       |
| `%c`             | Стандартная строка даты и времени, например, Вс Окт 17 04:41:13 2010 (в зависимости от локали)                                     | `Thu Jul  6 18:32:07 2023` |
| `%x`             | Локализованное представление даты (в зависимости от локали)                                                                    | `07/06/23`                 |
| `%X`             | Локализованное представление времени, например, 18:40:20 или 6:40:20 PM (в зависимости от локали)                                       | `18:32:07`                 |
| `%D`             | Краткая дата в формате ММ/DD/ГГ, эквивалентно %m/%d/%y                                                                         | `07/06/23`                 |
| `%F`             | Краткая дата в формате ГГГГ-ММ-ДД, эквивалентно %Y-%m-%d                                                                       | `2023-07-06`               |
| `%r`             | Локализованное время в 12-часовом формате (в зависимости от локали)                                                                     | `06:32:07 PM`              |
| `%R`             | Эквивалентно "%H:%M"                                                                                               | `18:32`                    |
| `%T`             | Эквивалентно "%H:%M:%S" (ISO 8601 формат времени)                                                                 | `18:32:07`                 |
| `%p`             | Локализованное обозначение A.M. или P.M. (в зависимости от локали)                                                               | `PM`                       |
| `%z`             | Смещение от UTC в формате ISO 8601 (например, -0430), или никаких символов, если информация о временной зоне недоступна | `+0800`                    |
| `%Z`             | Название часового пояса, зависящее от локали, или никаких символов, если информация о временной зоне недоступна     | `Z AWST `                  |

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

Чтобы выводить сообщения журнала только в консоль:

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**Перекрытия для каждого уровня**

Уровень журнала отдельных логгеров может быть переопределен. Например, чтобы отключить все сообщения логгеров "Backup" и "RBAC".

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

| Ключ         | Описание                                                                                                                                                                                                                                                    |
|--------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `address`    | Адрес syslog в формате `host\[:port\]`. Если опущен, используется локальный демон.                                                                                                                                                                         |
| `hostname`   | Имя хоста, с которого отправляются логи (необязательно).                                                                                                                                                                                                      |
| `facility`   | Ключевое слово syslog [факультета](https://en.wikipedia.org/wiki/Syslog#Facility). Должно быть указано в верхнем регистре с префиксом "LOG_", например, `LOG_USER`, `LOG_DAEMON`, `LOG_LOCAL3` и т.д. По умолчанию: `LOG_USER`, если задан `address`, иначе `LOG_DAEMON`.                                           |
| `format`     | Формат сообщения журнала. Возможные значения: `bsd` и `syslog.`                                                                                                                                                                                                |

**Форматы журнала**

Вы можете указать формат журнала, который будет выводиться в журнале консоли. В настоящее время поддерживается только JSON.

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

Чтобы включить поддержку JSON-журналирования, используйте следующий фрагмент:

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

**Переименование ключей для JSON-журналов**

Имена ключей можно изменить, изменив значения тегов внутри тега `<names>`. Например, чтобы изменить `DATE_TIME` на `MY_DATE_TIME`, вы можете использовать `<date_time>MY_DATE_TIME</date_time>`.

**Пропуск ключей для JSON-журналов**

Свойства журнала можно пропустить, закомментировав свойство. Например, если вы не хотите, чтобы ваш журнал отображал `query_id`, вы можете закомментировать тег `<query_id>`.
## send_crash_reports {#send_crash_reports}

Настройки для отправки отчетов о сбоях команде разработчиков ClickHouse через [Sentry](https://sentry.io).

Включение этой функции, особенно в предproduction средах, приветствуется.

Серверу потребуется доступ к публичному интернету через IPv4 (на момент написания IPv6 не поддерживается Sentry) для правильной работы этой функции.

Ключи:

| Ключ                   | Описание                                                                                                                                                                                            |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `enabled`             | Булев флаг для включения функции, по умолчанию `false`. Установите `true`, чтобы разрешить отправку отчетов о сбоях.                                                                                                  |
| `send_logical_errors` | `LOGICAL_ERROR` аналогично `assert`, это ошибка в ClickHouse. Этот булев флаг включает отправку этих исключений в Sentry (по умолчанию: `false`).                                                        |
| `endpoint`            | Вы можете переопределить URL-адрес Sentry для отправки отчетов о сбоях. Это может быть либо отдельная учетная запись Sentry, либо ваш собственный экземпляр Sentry. Используйте синтаксис [Sentry DSN](https://docs.sentry.io/error-reporting/quickstart/?platform=native#configure-the-sdk)                  |
| `anonymize`           | Избегать прикрепления имени хоста сервера к отчету о сбое.                                                                                                                                               |
| `http_proxy`          | Настроить HTTP-прокси для отправки отчетов о сбоях.                                                                                                                                                        |
| `debug`               | Установить клиент Sentry в режим отладки.                                                                                                                                                                |
| `tmp_path`            | Путь к файловой системе для временного состояния отчетов о сбоях.                                                                                                                                                      |
| `environment`         | Произвольное имя окружения, в котором работает сервер ClickHouse. Оно будет упомянуто в каждом отчете о сбое. Значение по умолчанию - `test` или `prod` в зависимости от версии ClickHouse.|

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
Распакуйте конфигурации ключей хоста и укажите путь к соответствующему ssh ключу для их активации:

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

Позволяет настроить многодисковую конфигурацию хранения.

Конфигурация хранения следует структуре:

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

Под-теги выше определяют следующие настройки для `disks`:

| Настройка                 | Описание                                                                                           |
|---------------------------|----------------------------------------------------------------------------------------------------|
| `<disk_name_N>`           | Имя диска, которое должно быть уникальным.                                                        |
| `path`                    | Путь, по которому будут храниться данные сервера (каталоги `data` и `shadow`). Должен заканчиваться на `/` |
| `keep_free_space_bytes`   | Размер зарезервированного свободного пространства на диске.                                       |

:::note
Порядок дисков не имеет значения.
:::
### Конфигурация политик {#configuration-of-policies}

Под-теги выше определяют следующие настройки для `policies`:

| Настройка                      | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|--------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`                | Имя политики. Имена политик должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `volume_name_N`                | Имя тома. Имена томов должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `disk`                         | Диск, находящийся внутри тома.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `max_data_part_size_bytes`     | Максимальный размер фрагмента данных, который может находиться на любом из дисков в этом томе. Если слияние приводит к тому, что размер фрагмента превышает max_data_part_size_bytes, фрагмент будет записан в следующий том. Эта функция позволяет хранить новые / маленькие фрагменты на горячем (SSD) томе и перемещать их на холодный (HDD) том, когда они достигают большого размера. Не используйте эту опцию, если у политики только один том.                      |
| `move_factor`                  | Доля доступного свободного пространства на томе. Если пространство становится меньше, данные начнут переноситься на следующий том, если таковой имеется. Для переноса фрагменты сортируются по размеру от большего к меньшему (по убыванию), и выбираются фрагменты, общий размер которых достаточен для выполнения условия `move_factor`, если общий размер всех фрагментов недостаточен, все фрагменты будут перенесены.                                                                                                             |
| `perform_ttl_move_on_insert`   | Отключает перемещение данных с истекшим TTL при вставке. По умолчанию (если включено), если мы вставляем часть данных, которая уже истекла согласно правилу перемещения по жизни, она немедленно переносится на том / диск, указанный в правиле перемещения. Это может значительно замедлить вставку в случае, если целевой том / диск медленный (например, S3). Если отключено, устаревшая часть данных записывается в дефолтный том, а затем немедленно переносится на том, указанном в правиле для истекшего TTL. |
| `load_balancing`               | Политика балансировки дисков, `round_robin` или `least_used`.                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `least_used_ttl_ms`            | Устанавливает таймаут (в миллисекундах) для обновления доступного пространства на всех дисках (`0` - всегда обновлять, `-1` - никогда не обновлять, значение по умолчанию - `60000`). Обратите внимание, если диск используется только ClickHouse и не подлежит изменению размера файловой системы на лету, вы можете использовать значение `-1`. В остальных случаях это не рекомендуется, так как в конечном итоге приведет к неправильному распределению пространства.                                                                                                                   |
| `prefer_not_to_merge`          | Отключает слияние частей данных на этом томе. Примечание: это потенциально вредно и может вызвать замедление. Когда эта настройка включена (не делайте этого), слияние данных на этом томе запрещено (что плохо). Это позволяет контролировать, как ClickHouse взаимодействует с медленными дисками. Мы рекомендуем вообще не использовать это.                                                                                                                                                                                       |
| `volume_priority`              | Определяет приоритет (порядок) заполнения томов. Чем меньше значение, тем выше приоритет. Значения параметра должны быть натуральными числами и охватывать диапазон от 1 до N (N - наибольшее указанное значение параметра) без пропусков.                                                                                                                                                                                                                                                                |

Для `volume_priority`:
- Если у всех томов есть этот параметр, они имеют приоритет в указанном порядке.
- Если только _некоторые_ тома имеют его, тома, которые не имеют, имеют самый низкий приоритет. Тома, которые имеют этот параметр, имеют приоритет в соответствии со значением тега, приоритет остальных определяется порядком описания в файле конфигурации относительно друг друга.
- Если _никаким_ томам не задан этот параметр, их порядок определяется порядком описания в файле конфигурации.
- Приоритет томов может не совпадать.
## macros {#macros}

Замены параметров для реплицированных таблиц.

Можно опустить, если реплицированные таблицы не используются.

Для получения дополнительной информации смотрите раздел [Создание реплицированных таблиц](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables).

**Пример**

```xml
<macros incl="macros" optional="true" />
```
## replica_group_name {#replica_group_name}

Имя группы реплик для базы данных Replicated.

Кластер, созданный базой данных Replicated, будет состоять из реплик в одной группе.
DDL-запросы будут ждать только реплик в одной группе.

По умолчанию пусто.

**Пример**

```xml
<replica_group_name>backups</replica_group_name>
```
## remap_executable {#remap_executable}

Настройка для перераспределения памяти для машинного кода ("текста") с использованием больших страниц.

:::note
Эта функция является высоко экспериментальной.
:::

Пример:

```xml
<remap_executable>false</remap_executable>
```
## max_open_files {#max_open_files}

Максимальное количество открытых файлов.

:::note
Мы рекомендуем использовать эту опцию в macOS, так как функция `getrlimit()` возвращает некорректное значение.
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

Для получения дополнительной информации смотрите заголовочный файл MergeTreeSettings.h.

**Пример**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```
## metric_log {#metric_log}

По умолчанию отключен.

**Включение**

Чтобы вручную включить сбор истории метрик [`system.metric_log`](../../operations/system-tables/metric_log.md), создайте файл `/etc/clickhouse-server/config.d/metric_log.xml` со следующим содержанием:

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

Чтобы отключить настройку `metric_log`, создайте следующий файл `/etc/clickhouse-server/config.d/disable_metric_log.xml` со следующим содержанием:

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## latency_log {#latency_log}

По умолчанию отключен.

**Включение**

Чтобы вручную включить сбор истории латентности [`system.latency_log`](../../operations/system-tables/latency_log.md), создайте файл `/etc/clickhouse-server/config.d/latency_log.xml` со следующим содержанием:

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

Чтобы отключить настройку `latency_log`, создайте следующий файл `/etc/clickhouse-server/config.d/disable_latency_log.xml` со следующим содержанием:

```xml
<clickhouse>
<latency_log remove="1" />
</clickhouse>
```
## replicated_merge_tree {#replicated_merge_tree}

Тонкая настройка для таблиц в [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Эта настройка имеет более высокий приоритет.

Для получения дополнительной информации смотрите заголовочный файл MergeTreeSettings.h.

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

Конфигурация SSL клиента/сервера.

Поддержка SSL предоставляется библиотекой `libpoco`. Доступные параметры конфигурации объясняются в [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h). Значения по умолчанию можно найти в [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp).

Ключи для настроек сервера/клиента:

| Опция                        | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Значение по умолчанию                       |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------|
| `privateKeyFile`              | Путь к файлу с секретным ключом сертификата PEM. Файл может одновременно содержать ключ и сертификат.                                                                                                                                                                                                                                                                                                                                                          |                                             |
| `certificateFile`             | Путь к файлу сертификата клиента/сервера в формате PEM. Можно опустить, если `privateKeyFile` содержит сертификат.                                                                                                                                                                                                                                                                                                                                                |                                             |
| `caConfig`                    | Путь к файлу или директории, содержащей доверенные сертификаты CA. Если это указывает на файл, он должен быть в формате PEM и может содержать несколько сертификатов CA. Если это указывает на директорию, она должна содержать один .pem файл на каждый сертификат CA. Имена файлов ищутся по значению хеша имени субъекта CA. Подробности можно найти в странице man [SSL_CTX_load_verify_locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html). |                                             |
| `verificationMode`            | Метод проверки сертификатов узла. Подробности описаны в описании класса [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h). Возможные значения: `none`, `relaxed`, `strict`, `once`.                                                                                                                                                                                                         | `relaxed`                                  |
| `verificationDepth`           | Максимальная длина цепочки проверки. Проверка завершится неудачей, если длина цепочки сертификатов превышает установленное значение.                                                                                                                                                                                                                                                                                                                            | `9`                                        |
| `loadDefaultCAFile`           | Использовать ли встроенные сертификаты CA для OpenSSL. ClickHouse предполагает, что встроенные сертификаты CA находятся в файле `/etc/ssl/cert.pem` (или в каталоге `/etc/ssl/certs`) или в файле (или каталоге), указанном переменной среды `SSL_CERT_FILE` (или `SSL_CERT_DIR`).                                                                                                                                                                           | `true`                                     |
| `cipherList`                  | Поддерживаемые шифрования OpenSSL.                                                                                                                                                                                                                                                                                                                                                                                                                                         | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`  |
| `cacheSessions`               | Включает или отключает кеширование сессий. Должен использоваться в сочетании с `sessionIdContext`. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                               | `false`                                    |
| `sessionIdContext`            | Уникальный набор случайных символов, который сервер добавляет к каждому сгенерированному идентификатору. Длина строки не должна превышать `SSL_MAX_SSL_SESSION_ID_LENGTH`. Этот параметр всегда рекомендован, так как помогает избежать проблем как при кэшировании сессии сервером, так и при запросе кэширования клиентом.                                                                                                                                                     | `$\{application.name\}`                      |
| `sessionCacheSize`            | Максимальное количество сессий, которые сервер кеширует. Значение `0` означает неограниченное количество сессий.                                                                                                                                                                                                                                                                                                                                                                        | [1024\*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978)                             |
| `sessionTimeout`              | Время кэширования сессии на сервере в часах.                                                                                                                                                                                                                                                                                                                                                                                                                   | `2`                                        |
| `extendedVerification`        | Если включено, проверить, что CN сертификата или SAN соответствует имени хоста пиринга.                                                                                                                                                                                                                                                                                                                                                                                           | `false`                                    |
| `requireTLSv1`                | Требовать соединение TLSv1. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                        | `false`                                    |
| `requireTLSv1_1`              | Требовать соединение TLSv1.1. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                    |
| `requireTLSv1_2`              | Требовать соединение TLSv1.2. Допустимые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                    |
| `fips`                        | Активирует режим FIPS для OpenSSL. Поддерживается, если версия библиотеки OpenSSL поддерживает FIPS.                                                                                                                                                                                                                                                                                                                                                                                | `false`                                    |
| `privateKeyPassphraseHandler` | Класс (подкласс PrivateKeyPassphraseHandler), который запрашивает пароль для доступа к личному ключу. Например: `<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`.                                                                                                                                                                                                | `KeyConsoleHandler`                        |
| `invalidCertificateHandler`   | Класс (подкласс CertificateHandler) для проверки недействительных сертификатов. Например: `<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>` .                                                                                                                                                                                                                                                                           | `RejectCertificateHandler`                 |
| `disableProtocols`            | Протоколы, которые не разрешено использовать.                                                                                                                                                                                                                                                                                                                                                                                                                             |                                            |
| `preferServerCiphers`         | Предпочтительные шифры сервера для клиента.                                                                                                                                                                                                                                                                                                                                                                                                                                       | `false`                                    |

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
        <!-- Используйте для самоподписанных: <verificationMode>none</verificationMode> -->
        <invalidCertificateHandler>
            <!-- Используйте для самоподписанных: <name>AcceptCertificateHandler</name> -->
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
Знак `/` в конце является обязательным.
:::

**Пример**

```xml
<path>/var/lib/clickhouse/</path>
```
## processors_profile_log {#processors_profile_log}

Настройки для системной таблицы [`processors_profile_log`](../system-tables/processors_profile_log.md).

<SystemLogParameters/>

Значения по умолчанию:

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

Expose метрики для считывания из [Prometheus](https://prometheus.io).

Настройки:

- `endpoint` – HTTP конечная точка для считывания метрик сервером prometheus. Начинается с '/'.
- `port` – Порт для `endpoint`.
- `metrics` – Экспонировать метрики из таблицы [system.metrics](/operations/system-tables/metrics).
- `events` – Экспонировать метрики из таблицы [system.events](/operations/system-tables/events).
- `asynchronous_metrics` – Экспонировать текущие значения метрик из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).
- `errors` - Экспонировать количество ошибок по кодам ошибок, произошедших с момента последнего перезапуска сервера. Эта информация также может быть получена из [system.errors](/operations/system-tables/errors).

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

Настройка для логирования запросов, полученных с настройкой [log_queries=1](../../operations/settings/settings.md).

Запросы логируются в таблице [system.query_log](/operations/system-tables/query_log), а не в отдельном файле. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

Если таблица не существует, ClickHouse создаст её. Если структура журнала запросов изменилась при обновлении сервера ClickHouse, таблица с старой структурой будет переименована, и новая таблица будет создана автоматически.

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

По умолчанию отключен.

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

Чтобы отключить настройку `query_metric_log`, вам нужно создать следующий файл `/etc/clickhouse-server/config.d/disable_query_metric_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## query_cache {#query_cache}

[Конфигурация кэша запросов](../query-cache.md).

Следующие настройки доступны:

| Параметр                   | Описание                                                                                   | Значение по умолчанию |
|----------------------------|-------------------------------------------------------------------------------------------|-----------------------|
| `max_size_in_bytes`       | Максимальный размер кэша в байтах. `0` означает, что кэш запросов отключен.              | `1073741824`          |
| `max_entries`             | Максимальное количество результатов запросов `SELECT`, хранящихся в кэше.                  | `1024`                |
| `max_entry_size_in_bytes` | Максимальный размер в байтах, который могут иметь результаты запроса `SELECT`, чтобы быть сохраненными в кэше. | `1048576`             |
| `max_entry_size_in_rows`  | Максимальное количество строк, которые могут иметь результаты запроса `SELECT`, чтобы быть сохраненными в кэше. | `30000000`            |

:::note
- Измененные настройки вступают в силу немедленно.
- Данные для кэша запросов выделяются в DRAM. Если память ограничена, убедитесь, что установлено небольшое значение для `max_size_in_bytes` или полностью отключите кэш запросов.
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

Запросы логируются в таблице [system.query_thread_log](/operations/system-tables/query_thread_log), а не в отдельном файле. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

Если таблица не существует, ClickHouse создаст её. Если структура журнала потоков запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой будет переименована, и новая таблица будет создана автоматически.

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

Настройка для логирования представлений (live, материализованных и т.д.), зависимых от запросов, полученных с настройкой [log_query_views=1](/operations/settings/settings#log_query_views).

Запросы логируются в таблице [system.query_views_log](/operations/system-tables/query_views_log), а не в отдельном файле. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

Если таблица не существует, ClickHouse создаст её. Если структура журнала запросов представлений изменилась при обновлении сервера ClickHouse, таблица со старой структурой будет переименована, и новая таблица будет создана автоматически.

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

| Параметр | Описание                                                                                                                                                                          | Значение по умолчанию |
|----------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------|
| `level`  | Максимальный уровень сообщений (по умолчанию `Trace`), которые будут храниться в таблице.                                                                                        | `Trace`               |

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

Настройки для системной таблицы [trace_log](/operations/system-tables/trace_log).

<SystemLogParameters/>

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

Настройки для системной таблицы [crash_log](../../operations/system-tables/crash-log.md).

<SystemLogParameters/>

Конфигурационный файл сервера по умолчанию `config.xml` содержит следующий раздел настроек:

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

Эта настройка определяет путь к кэшу для пользовательских (созданных из SQL) кэшированных дисков. `custom_cached_disks_base_directory` имеет более высокий приоритет для пользовательских дисков по сравнению с `filesystem_caches_path` (который находится в `filesystem_caches_path.xml`), который используется, если первый отсутствует. Путь настройки кэширования файловой системы должен находиться внутри этого каталога, иначе будет выброшено исключение, предотвращающее создание диска.

:::note
Это не повлияет на диски, созданные в предыдущей версии, для которых сервер был обновлен. В этом случае исключение не будет выброшено, чтобы позволить серверу успешно запуститься.
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
    <database>system</database>
    <table>blob_storage_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
    <ttl>event_date + INTERVAL 30 DAY</ttl>
</blob_storage_log>
```
## query_masking_rules {#query_masking_rules}

Правила на основе регулярных выражений, которые будут применяться к запросам, а также ко всем сообщениям журнала перед их сохранением в серверах логов, в таблицах [`system.query_log`](/operations/system-tables/query_log), [`system.text_log`](/operations/system-tables/text_log), [`system.processes`](/operations/system-tables/processes) и в логах, отправленных клиенту. Это позволяет предотвратить утечку конфиденциальных данных из SQL-запросов, таких как имена, электронные адреса, персональные идентификаторы или номера кредитных карт в логи.

**Пример**

```xml
<query_masking_rules>
    <rule>
        <name>скрыть SSN</name>
        <regexp>(^|\D)\d{3}-\d{2}-\d{4}($|\D)</regexp>
        <replace>000-00-0000</replace>
    </rule>
</query_masking_rules>
```

**Поля конфигурации**:

| Параметр   | Описание                                                                     |
|------------|------------------------------------------------------------------------------|
| `name`     | имя для правила (необязательно)                                             |
| `regexp`   | Совместимое с RE2 регулярное выражение (обязательно)                        |
| `replace`  | строка замены для конфиденциальных данных (необязательно, по умолчанию - шесть звездочек) |

Правила маскировки применяются ко всему запросу (чтобы предотвратить утечки конфиденциальных данных из неправильно оформленных / непарсируемых запросов).

Таблица [`system.events`](/operations/system-tables/events) имеет счетчик `QueryMaskingRulesMatch`, который показывает общее количество совпадений правил маскировки запросов.

Для распределенных запросов каждый сервер должен быть настроен отдельно, иначе подпроцессы, передаваемые на другие узлы, будут храниться без маскировки.
## remote_servers {#remote_servers}

Конфигурация кластеров, используемых движком таблиц [Distributed](../../engines/table-engines/special/distributed.md) и функцией таблицы `cluster`.

**Пример**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

Для значения атрибута `incl` смотрите раздел "[Файлы конфигурации](/operations/configuration-files)".

**Смотрите также**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [Обнаружение кластера](../../operations/cluster-discovery.md)
- [Движок реплицированной базы данных](../../engines/database-engines/replicated.md)
## remote_url_allow_hosts {#remote_url_allow_hosts}

Список узлов, которые разрешены для использования в движках хранения и функциях таблиц, связанных с URL.

При добавлении узла с тегом `\<host\>` xml:
- он должен быть указан точно так же, как в URL, так как имя проверяется перед разрешением DNS. Например: `<host>clickhouse.com</host>`
- если порт явно указан в URL, тогда host:port проверяется целиком. Например: `<host>clickhouse.com:80</host>`
- если узел указан без порта, тогда разрешены любые порты узла. Например: если указан `<host>clickhouse.com</host>`, то разрешены `clickhouse.com:20` (FTP), `clickhouse.com:80` (HTTP), `clickhouse.com:443` (HTTPS) и т. д.
- если узел указан как IP-адрес, тогда он проверяется так же, как указано в URL. Например: `[2a02:6b8:a::a]`.
- если есть перенаправления и поддержка перенаправлений включена, тогда проверяется каждое перенаправление (поле location).

Например:

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```
## timezone {#timezone}

Часовой пояс сервера.

Указывается как идентификатор IANA для часового пояса UTC или географического местоположения (например, Africa/Abidjan).

Часовой пояс необходим для преобразования между строковыми и DateTime форматами, когда поля DateTime выводятся в текстовом формате (выводятся на экран или в файл) и при получении DateTime из строки. Кроме того, часовой пояс используется в функциях, которые работают с временем и датой, если они не получили часовой пояс в входных параметрах.

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

TCP порт для безопасной связи с клиентами. Используйте его с настройками [OpenSSL](#openssl).

**Значение по умолчанию**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```
## mysql_port {#mysql_port}

Порт для связи с клиентами по протоколу MySQL.

:::note
- Положительные целые числа указывают номер порта для прослушивания.
- Пустые значения используются для отключения связи с клиентами по протоколу MySQL.
:::

**Пример**

```xml
<mysql_port>9004</mysql_port>
```
## postgresql_port {#postgresql_port}

Порт для связи с клиентами по протоколу PostgreSQL.

:::note
- Положительные целые числа указывают номер порта для прослушивания.
- Пустые значения используются для отключения связи с клиентами по протоколу MySQL.
:::

**Пример**

```xml
<postgresql_port>9005</postgresql_port>
```
## tmp_path {#tmp_path}

Путь на локальной файловой системе для хранения временных данных для обработки больших запросов.

:::note
- Только один вариант может быть использован для настройки хранения временных данных: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
- Законченный слэш обязателен.
:::

**Пример**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```
## url_scheme_mappers {#url_scheme_mappers}

Конфигурация для перевода сокращенных или символических префиксов URL в полные URL.

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

Каталог с пользовательскими файлами. Используется в табличных функциях [file()](../../sql-reference/table-functions/file.md), [fileCluster()](../../sql-reference/table-functions/fileCluster.md).

**Пример**

```xml
<user_files_path>/var/lib/clickhouse/user_files/</user_files_path>
```
## user_scripts_path {#user_scripts_path}

Каталог с файлами пользовательских скриптов. Используется для исполняемых пользовательских функций [Executable User Defined Functions](/sql-reference/functions/udf#executable-user-defined-functions).

**Пример**

```xml
<user_scripts_path>/var/lib/clickhouse/user_scripts/</user_scripts_path>
```

Type:

Default:
## user_defined_path {#user_defined_path}

Каталог с пользовательскими определенными файлами. Используется для SQL пользовательских функций [SQL User Defined Functions](/sql-reference/functions/udf).

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

| Параметр                                         | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Значение по умолчанию |
|-------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------|
| `users_without_row_policies_can_read_rows`      | Определяет, могут ли пользователи без разрешающих правил строк по-прежнему считывать строки с помощью запроса `SELECT`. Например, если есть два пользователя A и B, и правило строки задано только для A, тогда, если эта настройка истинна, пользователь B увидит все строки. Если эта настройка ложна, пользователь B не увидит ни одной строки.                                                                                                                                                        | `true`                |
| `on_cluster_queries_require_cluster_grant`      | Определяет, требуется ли для запросов `ON CLUSTER` разрешение `CLUSTER`.                                                                                                                                                                                                                                                                                                                                                                                                                                       | `true`                |
| `select_from_system_db_requires_grant`          | Определяет, требуется ли `SELECT * FROM system.<table>` любое разрешение и может ли этот запрос выполнять любой пользователь. Если установлено в true, то этот запрос требует `GRANT SELECT ON system.<table>`, так же как и для нестандартных таблиц. Исключения: несколько системных таблиц (`tables`, `columns`, `databases` и некоторые постоянные таблицы, такие как `one`, `contributors`) все еще доступны для всех; и если есть право `SHOW` (например, `SHOW USERS`), то соответствующая системная таблица (т.е. `system.users`) будет доступна. | `true`                |
| `select_from_information_schema_requires_grant` | Определяет, требуется ли `SELECT * FROM information_schema.<table>` любое разрешение и может ли этот запрос выполнять любой пользователь. Если установлено в true, то этот запрос требует `GRANT SELECT ON information_schema.<table>`, так же как и для обычных таблиц.                                                                                                                                                                                                            | `true`                |
| `settings_constraints_replace_previous`         | Определяет, будет ли ограничение в профиле настроек для некоторого параметра отменять действия предыдущего ограничения (определенного в других профилях) для этого параметра, включая поля, которые не установлены новым ограничением. Это также включает тип ограничения `changeable_in_readonly`.                                                                                                                                               | `true`                |
| `table_engines_require_grant`                   | Определяет, требуется ли для создания таблицы с конкретным движком таблицы разрешение.                                                                                                                                                                                                                                                                                                                                                                                                                                     | `false`               |
| `role_cache_expiration_time_seconds`            | Устанавливает количество секунд с последнего доступа, которое роль хранится в кэше ролей.                                                                                                                                                                                                                                                                                                                                                                                                                           | `600`                 |

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

Настройки по умолчанию:

```xml
<s3queue_log>
    <database>system</database>
    <table>s3queue_log</table>
    <partition_by>toYYYYMM(event_date)</partition_by>
    <flush_interval_milliseconds>7500</flush_interval_milliseconds>
</s3queue_log>
```

## zookeeper {#zookeeper}

Содержит настройки, позволяющие ClickHouse взаимодействовать с кластером [ZooKeeper](http://zookeeper.apache.org/). ClickHouse использует ZooKeeper для хранения метаданных реплик при использовании реплицированных таблиц. Если реплицированные таблицы не используются, этот раздел параметров можно опустить.

Следующие настройки могут быть настроены с помощью под-тегов:

| Настройка                                   | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
|---------------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `node`                                      | Указатель на ZooKeeper. Вы можете установить несколько указателей. Например, `<node index="1"><host>example_host</host><port>2181</port></node>`. Атрибут `index` указывает порядок узлов при попытке подключиться к кластеру ZooKeeper.                                                                                                                                                                                                                                                                        |
| `session_timeout_ms`                        | Максимальное время ожидания для клиентской сессии в миллисекундах.                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `operation_timeout_ms`                      | Максимальное время ожидания для одной операции в миллисекундах.                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `root` (опционально)                       | Znode, который используется как корень для znodes, используемых сервером ClickHouse.                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `fallback_session_lifetime.min` (опционально)| Минимальный лимит на срок действия сессии zookeeper для резервного узла, когда основной недоступен (балансировка нагрузки). Устанавливается в секундах. По умолчанию: 3 часа.                                                                                                                                                                                                                                                                                    |
| `fallback_session_lifetime.max` (опционально)| Максимальный лимит на срок действия сессии zookeeper для резервного узла, когда основной недоступен (балансировка нагрузки). Устанавливается в секундах. По умолчанию: 6 часов.                                                                                                                                                                                                                                                                                    |
| `identity` (опционально)                    | Пользователь и пароль, требуемые ZooKeeper для доступа к запрашиваемым znodes.                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `use_compression` (опционально)             | Включает сжатие в протоколе Keeper, если установить значение true.                                                                                                                                                                                                                                                                                                                                                                                                                                                       |

Также есть настройка `zookeeper_load_balancing` (опционально), которая позволяет выбрать алгоритм для выбора узла ZooKeeper:

| Название алгоритма                | Описание                                                                                                                     |
|-----------------------------------|-----------------------------------------------------------------------------------------------------------------------------|
| `random`                          | случайно выбирает один из узлов ZooKeeper.                                                                                  |
| `in_order`                        | выбирает первый узел ZooKeeper, если он недоступен, то второй, и так далее.                                                |
| `nearest_hostname`                | выбирает узел ZooKeeper с именем хоста, наиболее похожим на имя хоста сервера, имя хоста сравнивается с префиксом имени.  |
| `hostname_levenshtein_distance`   | точно так же, как nearest_hostname, но сравнивает имя хоста с помощью расстояния Левенштейна.                               |
| `first_or_random`                 | выбирает первый узел ZooKeeper, если он недоступен, случайно выбирает один из оставшихся узлов ZooKeeper.                   |
| `round_robin`                     | выбирает первый узел ZooKeeper, если происходит повторное соединение, выбирает следующий.                                   |

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
    <!-- Опционально. Суффикс Chroot. Должен существовать. -->
    <root>/path/to/zookeeper/node</root>
    <!-- Опционально. Строка ACL digest Zookeeper. -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**См. также**

- [Replication](../../engines/table-engines/mergetree-family/replication.md)
- [ZooKeeper Programmer's Guide](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [Optional secured communication between ClickHouse and Zookeeper](/operations/ssl-zookeeper)

## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper}

Метод хранения заголовков частей данных в ZooKeeper. Эта настройка применяется только к семейству [`MergeTree`](/engines/table-engines/mergetree-family). Она может быть указана:

**Глобально в разделе [merge_tree](#merge_tree) файла `config.xml`**

ClickHouse использует настройку для всех таблиц на сервере. Вы можете изменить настройку в любое время. Существующие таблицы изменяют свое поведение при изменении настройки.

**Для каждой таблицы**

При создании таблицы укажите соответствующую [настройку движка](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table). Поведение существующей таблицы с этой настройкой не изменяется, даже если глобальная настройка изменяется.

**Возможные значения**

- `0` — Функциональность отключена.
- `1` — Функциональность включена.

Если [`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper), то [реплицированные](../../engines/table-engines/mergetree-family/replication.md) таблицы хранят заголовки частей данных компактно с использованием одного `znode`. Если таблица содержит много столбцов, этот метод хранения значительно уменьшает объем данных, хранящихся в ZooKeeper.

:::note
После применения `use_minimalistic_part_header_in_zookeeper = 1` вы не сможете понизить версию сервера ClickHouse до версии, которая не поддерживает эту настройку. Будьте осторожны при обновлении ClickHouse на серверах в кластере. Не обновляйте все серверы сразу. Безопаснее тестировать новые версии ClickHouse в тестовой среде или на нескольких серверах кластера.

Заголовки частей данных, уже хранящиеся с этой настройкой, не могут быть восстановлены к предыдущему (не компактному) представлению.
:::

## distributed_ddl {#distributed_ddl}

Управляет выполнением [распределенных ddl-запросов](../../sql-reference/distributed-ddl.md) (`CREATE`, `DROP`, `ALTER`, `RENAME`) на кластере. Работает только если [ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper) включен.

Конфигурируемые настройки внутри `<distributed_ddl>` включают:

| Настройка              | Описание                                                                                                                        | Значение по умолчанию              |
|------------------------|--------------------------------------------------------------------------------------------------------------------------------|-------------------------------------|
| `path`                 | путь в Keeper для `task_queue` для DDL запросов                                                                                |                                     |
| `profile`              | профиль, используемый для выполнения DDL запросов                                                                              |                                     |
| `pool_size`            | сколько `ON CLUSTER` запросов можно выполнять одновременно                                                                     |                                     |
| `max_tasks_in_queue`   | максимальное количество задач, которые могут находиться в очереди.                                                              | `1,000`                             |
| `task_max_lifetime`    | удалить узел, если его возраст больше этого значения.                                                                         | `7 * 24 * 60 * 60` (неделя в секундах) |
| `cleanup_delay_period` | очистка начинается после получения нового события узла, если последняя очистка не была выполнена ранее, чем `cleanup_delay_period` секунд назад. | `60` секунд                        |

**Пример**

```xml
<distributed_ddl>
    <!-- Путь в ZooKeeper к очереди с DDL запросами -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- Настройки из этого профиля будут использоваться для выполнения DDL запросов -->
    <profile>default</profile>

    <!-- Управляет тем, сколько ON CLUSTER запросов можно выполнять одновременно. -->
    <pool_size>1</pool_size>

    <!--
         Настройки очистки (активные задачи не будут удалены)
    -->

    <!-- Управляет сроком действия задачи (по умолчанию 1 неделя) -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- Управляет частотой, с которой должна выполняться очистка (в секундах) -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- Управляет тем, сколько задач может находиться в очереди -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```

## access_control_path {#access_control_path}

Путь к папке, где сервер ClickHouse хранит конфигурации пользователей и ролей, созданные с помощью SQL команд.

**См. также**

- [Управление доступом и управление учетными записями](/operations/access-rights#access-control-usage)

## allow_plaintext_password {#allow_plaintext_password}

Устанавливает, разрешены ли типы паролей с открытым текстом (небезопасные) или нет.

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```

## allow_no_password {#allow_no_password}

Устанавливает, разрешен ли небезопасный тип пароля без пароля или нет.

```xml
<allow_no_password>1</allow_no_password>
```

## allow_implicit_no_password {#allow_implicit_no_password}

Запрещает создание пользователя без пароля, если не указано 'IDENTIFIED WITH no_password'.

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```

## default_session_timeout {#default_session_timeout}

Таймаут сессии по умолчанию, в секундах.

```xml
<default_session_timeout>60</default_session_timeout>
```

## default_password_type {#default_password_type}

Устанавливает тип пароля, который автоматически будет установлен для запросов, таких как `CREATE USER u IDENTIFIED BY 'p'`.

Допустимые значения:
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
- Путь к папке, где хранятся пользователи, созданные с помощью SQL команд.
- Путь к узлу ZooKeeper, где хранятся и реплицируются пользователи, созданные с помощью SQL команд (экспериментально).

Если этот раздел указан, путь из [users_config](/operations/server-configuration-parameters/settings#users_config) и [access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path) использоваться не будет.

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

Вы также можете определить разделы `memory` — для хранения информации только в памяти, без записи на диск, и `ldap` — для хранения информации на LDAP сервере.

Чтобы добавить LDAP сервер как удаленный каталог пользователей, которые не определены локально, определите единственный раздел `ldap` со следующими настройками:

| Настройка | Описание                                                                                                                                                                                                                                                                                                                                                               |
|-----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `server`  | одно из имен серверов LDAP, определенных в разделе конфигурации `ldap_servers`. Этот параметр обязателен и не может быть пустым.                                                                                                                                                                                                                                           |
| `roles`   | раздел со списком локально определенных ролей, которые будут назначены каждому пользователю, полученному с LDAP сервера. Если роли не указаны, пользователь не сможет выполнять никакие действия после аутентификации. Если любая из перечисленных ролей не определена локально на момент аутентификации, попытка аутентификации будет отклонена, как будто предоставленный пароль был некорректным. |

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

Определяет список пользовательских доменов верхнего уровня, которые необходимо добавить, где каждая запись имеет формат `<name>/path/to/file</name>`.

Например:

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

См. также:
- функция [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cuttofirstsignificantsubdomaincustom) и её вариации,
  которая принимает имя списка пользовательских TLD, возвращая часть домена, которая включает доменные поддомены вверх до первого значимого поддомена.

## proxy {#proxy}

Определяет прокси-серверы для HTTP и HTTPS-запросов, в настоящее время поддерживается S3 хранилищем, S3 табличными функциями и URL-функциями.

Существует три способа определения прокси-серверов:
- переменные окружения
- списки прокси
- удаленные прокси-резолверы.

Также поддерживается обход прокси-серверов для конкретных хостов с помощью `no_proxy`.

**Переменные окружения**

Переменные окружения `http_proxy` и `https_proxy` позволяют указать прокси-сервер для данного протокола. Если они установлены на вашей системе, это должно работать без проблем.

Это самый простой подход, если для данного протокола есть только один прокси-сервер, и этот прокси-сервер не меняется.

**Списки прокси**

Этот подход позволяет указать один или несколько прокси-серверов для протокола. Если определено более одного прокси-сервера, ClickHouse использует разные прокси по принципу круговой балансировки, распределяя нагрузку между серверами. Это самый простой подход, если для протокола есть более одного прокси-сервера и список прокси-серверов не меняется.

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
Выберите родительское поле в вкладках ниже, чтобы просмотреть их дочерние элементы:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| Поле      | Описание                        |
|-----------|---------------------------------|
| `<http>`  | Список одного или нескольких HTTP прокси |
| `<https>` | Список одного или нескольких HTTPS прокси |

  </TabItem>
  <TabItem value="http_https" label="<http> и <https>">


| Поле   | Описание                |
|--------|-------------------------|
| `<uri>` | URI прокси |

  </TabItem>
</Tabs>

**Удаленные прокси-резолверы**

Возможно, прокси-серверы изменяются динамически. В этом случае вы можете определить конечную точку резолвера. ClickHouse отправляет пустой GET-запрос к этой конечной точке, удаленный резолвер должен вернуть хост прокси. ClickHouse будет использовать его для формирования URI прокси с использованием следующего шаблона: `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

Выберите родительское поле в вкладках ниже, чтобы просмотреть их дочерние элементы:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| Поле    | Описание                       |
|---------|-------------------------------|
| `<http>` | Список одного или нескольких резолверов* |
| `<https>` | Список одного или нескольких резолверов* |

  </TabItem>
  <TabItem value="http_https" label="<http> и <https>">

| Поле        | Описание                                   |
|-------------|--------------------------------------------|
| `<resolver>` | Конечная точка и другие детали для резолвера |

:::note
Вы можете иметь несколько элементов `<resolver>`, но используется только первый
`<resolver>` для данного протокола. Любые другие элементы `<resolver>`
для этого протокола игнорируются. Это означает, что балансировка нагрузки
(если необходимо) должна быть реализована удаленным резолвером.
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| Поле                  | Описание                                                                                                                                                                                 |
|-----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `<endpoint>`          | URI прокси-резолвера                                                                                                                                                                  |
| `<proxy_scheme>`      | Протокол конечного URI прокси. Это может быть либо `http`, либо `https`.                                                                                                                  |
| `<proxy_port>`        | Номер порта прокси-резолвера                                                                                                                                                             |
| `<proxy_cache_time>`  | Время в секундах, на которое значения от резолвера должны кэшироваться ClickHouse. Установка этого значения в `0` заставляет ClickHouse запрашивать резолвер для каждого HTTP или HTTPS запроса. |

  </TabItem>
</Tabs>

**Приоритет**

Настройки прокси определяются в следующем порядке:

| Порядок | Настройка                |
|---------|--------------------------|
| 1.      | Удаленные прокси-резолверы |
| 2.      | Списки прокси            |
| 3.      | Переменные окружения      |

ClickHouse будет проверять резолвер с самым высоким приоритетом для протокола запроса. Если он не определен,
он проверит резолвер следующего по приоритету типа, пока не дойдет до резолвера окружения.
Это также позволяет использовать смешанные типы резолверов.

## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy}

По умолчанию, туннелирование (т.е. `HTTP CONNECT`) используется для выполнения `HTTPS` запросов через `HTTP` прокси. Эта настройка может быть использована для его отключения.

**no_proxy**

По умолчанию все запросы будут проходить через прокси. Чтобы отключить его для конкретных хостов, переменная `no_proxy` должна быть установлена.
Ее можно установить внутри клаузы `<proxy>` для списков и удаленных резолверов, а также как переменную окружения для резолвера окружения.
Она поддерживает IP-адреса, домены, поддомены и `'*'` подстановочный символ для полного обхода. Ведущие точки удаляются так же, как это делает curl.

**Пример**

Следующая конфигурация обходит прокси-запросы к `clickhouse.cloud` и всем его поддоменам (например, `auth.clickhouse.cloud`).
То же самое касается GitLab, даже если у него есть ведущая точка. Оба `gitlab.com` и `about.gitlab.com` будут обходить прокси.

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

Каталог, использующийся в качестве хранилища для всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. По умолчанию используется папка `/workload/` под рабочим каталогом сервера.

**Пример**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**См. также**
- [Иерархия рабочих нагрузок](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)

## workload_zookeeper_path {#workload_zookeeper_path}

Путь к узлу ZooKeeper, который используется в качестве хранилища для всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. Для согласованности все SQL определения хранятся как значение этого единственного znode. По умолчанию ZooKeeper не используется, и определения хранятся на [диске](#workload_path).

**Пример**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**См. также**
- [Иерархия рабочих нагрузок](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)
```
