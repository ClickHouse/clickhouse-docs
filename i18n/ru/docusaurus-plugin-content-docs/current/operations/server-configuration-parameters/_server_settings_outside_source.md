## asynchronous_metric_log {#asynchronous_metric_log}

Включено по умолчанию на развертываниях ClickHouse Cloud.

Если настройка не включена по умолчанию в вашей среде, в зависимости от того, как был установлен ClickHouse, вы можете выполнить следующие инструкции, чтобы включить или отключить её.

**Включение**

Чтобы вручную включить сбор истории асинхронных логов метрик [`system.asynchronous_metric_log`](../../operations/system-tables/asynchronous_metric_log.md), создайте файл `/etc/clickhouse-server/config.d/asynchronous_metric_log.xml` со следующим содержимым:

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

Чтобы отключить настройку `asynchronous_metric_log`, необходимо создать следующий файл `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` со следующим содержимым:

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters/>
## auth_use_forwarded_address {#auth_use_forwarded_address}

Использовать исходный адрес для аутентификации клиентов, подключенных через прокси.

:::note
Эта настройка должна использоваться с повышенной осторожностью, так как подделать пересланные адреса довольно просто - сервера, принимающие такую аутентификацию, не должны быть доступны напрямую, а исключительно через доверенный прокси.
:::
## backups {#backups}

Настройки для резервных копий, используемые при выполнении команды `BACKUP TO File()`.

Следующие настройки могут быть настроены с помощью под-тегов:

| Настройка                           | Описание                                                                                                                                                                    | По умолчанию |
|-------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| `allowed_path`                      | Путь для резервного копирования при использовании `File()`. Эта настройка должна быть установлена для использования `File`. Путь может быть относительным или абсолютным.     | `true`       |
| `remove_backup_files_after_failure` | Если команда `BACKUP` завершится неудачей, ClickHouse попытается удалить файлы, которые были уже скопированы до сбоя, иначе он оставит скопированные файлы как есть.          | `true`       |

Эта настройка настроена по умолчанию следующим образом:

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

Если установлено в true, пользователям требуется разрешение для создания таблицы с определенным движком, например, `GRANT TABLE ENGINE ON TinyLog to user`.

:::note
По умолчанию, для обратной совместимости создание таблицы с определенным движком таблицы игнорирует разрешение, однако вы можете изменить это поведение, установив это значение в true.
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
Рекомендуем не изменять это, если вы только начали использовать ClickHouse.
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
- `level` – Уровень сжатия. См. [Codecs](/sql-reference/statements/create/table#general-purpose-codecs).

:::note
Вы можете настроить несколько секций `<case>`.
:::

**Действия, когда условия выполнены**:

- Если часть данных соответствует установленным условиям, ClickHouse использует указанный метод сжатия.
- Если часть данных соответствует нескольким набором условий, ClickHouse использует первый соответствующий набор условий.

:::note
Если для части данных не выполнено ни одно условие, ClickHouse использует сжатие `lz4`.
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

Настраивает команду для получения ключа, который будет использоваться кодеками [шифрования](/sql-reference/statements/create/table#encryption-codecs). Ключ (или ключи) должны быть записаны в переменные окружения или заданы в конфигурационном файле.

Ключи могут быть в шестнадцатеричном формате или строками длиной 16 байт.

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
Хранение ключей в конфигурационном файле не рекомендуется. Это небезопасно. Вы можете переместить ключи в отдельный файл конфигурации на защищенном диске и создать символьную ссылку на этот файл конфигурации в папке `config.d/`.
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

Здесь `current_key_id` задает текущий ключ для шифрования, и все указанные ключи могут быть использованы для расшифровки.

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

Также пользователи могут добавить nonce, который должен иметь длину 12 байт (по умолчанию процессы шифрования и расшифровки используют nonce, состоящий из нулевых байтов):

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

Или он может быть задан в шестнадцатеричном формате:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```
:::note
Всё вышеперечисленное может применяться для `aes_256_gcm_siv` (но ключ должен быть длиной 32 байта).
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

Чтобы отключить настройку `error_log`, вам нужно создать следующий файл `/etc/clickhouse-server/config.d/disable_error_log.xml` со следующим содержимым:

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

Настраивает мягкий лимит для размера файла дампа памяти.

:::note
Жёсткий лимит настраивается с помощью системных инструментов.
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

Путь к конфигурационному файлу для словарей.

Путь:

- Укажите абсолютный путь или путь относительно конфигурационного файла сервера.
- Путь может содержать подстановочные знаки \* и ?.

Смотрите также:
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

Смотрите также:
- "[Исполняемые пользовательские функции](/sql-reference/functions/udf#executable-user-defined-functions).".

**Пример**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```
## format_schema_path {#format_schema_path}

Путь к каталогу со схемами для входных данных, таким как схемы для формата [CapnProto](../../interfaces/formats.md#capnproto).

**Пример**

```xml
<!-- Каталог, содержащий файлы схем для различных форматов ввода. -->
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
- `events` – Отправка данных дельт, накопленных за период времени, из таблицы [system.events](/operations/system-tables/events).
- `events_cumulative` – Отправка кумулятивных данных из таблицы [system.events](/operations/system-tables/events).
- `asynchronous_metrics` – Отправка данных из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).

Вы можете настроить несколько `<graphite>` положений. Например, вы можете использовать это для отправки различных данных с различными интервалами.

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

Настройки для упрощения данных для Graphite.

Для получения более подробной информации смотрите [GraphiteMergeTree](../../engines/table-engines/mergetree-family/graphitemergetree.md).

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

Определяет каталог, содержащий proto файлы для типов Protobuf.

Пример:

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```
## http_handlers {#http_handlers}

Разрешает использовать пользовательские HTTP обработчики.
Чтобы добавить новый http обработчик, просто добавьте новое `<rule>`.
Правила проверяются сверху вниз, как определено, и первое соответствие запустит обработчик.

Следующие настройки могут быть настроены с помощью под-тегов:

| Под-теги              | Определение                                                                                                                                                      |
|-----------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                 | Для соответствия URL запроса вы можете использовать префикс 'regex:' для использования регулярного соответствия (необязательно)                                 |
| `methods`             | Для соответствия методам запроса вы можете использовать запятые для разделения нескольких соответствий методов (необязательно)                                 |
| `headers`             | Для соответствия заголовкам запроса совпадайте с каждым дочерним элементом (имя дочернего элемента - имя заголовка), вы можете использовать префикс 'regex:' для использования регулярного соответствия (необязательно) |
| `handler`             | Обработчик запроса                                                                                                                                           |
| `empty_query_string`  | Проверьте, что в URL нет строки запроса                                                                                                                        |

`handler` содержит следующие настройки, которые могут быть настроены с помощью под-тегов:

| Под-теги            | Определение                                                                                                                                                                   |
|---------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`               | Место для перенаправления                                                                                                                                                    |
| `type`              | Поддерживаемые типы: static, dynamic_query_handler, predefined_query_handler, redirect                                                                                        |
| `status`            | Используется с типом static, код состояния ответа                                                                                                                              |
| `query_param_name`  | Используется с типом dynamic_query_handler, извлекает и выполняет значение, соответствующее параметру `<query_param_name>` в параметрах HTTP запроса                               |
| `query`             | Используется с типом predefined_query_handler, выполняет запрос, когда обработчик вызывается                                                                                    |
| `content_type`      | Используется с типом static, тип контента ответа                                                                                                                                 |
| `response_content`  | Используется с типом static, содержимое ответа, отправляемое клиенту, при использовании префиксов 'file://' или 'config://', содержимое находится в файле или конфигурации, отправляется клиенту |

Вместе со списком правил вы можете указать `<defaults/>`, которое указывает на включение всех обработчиков по умолчанию.

**Пример**

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
Значение по умолчанию - "Ok." (с переводом строки в конце)

**Пример**

Открывается `https://tabix.io/` при доступе к `http://localhost: http_port`.

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```
## http_options_response {#http_options_response}

Используется для добавления заголовков к ответу в HTTP запросе `OPTIONS`.
Метод `OPTIONS` используется при выполнении предварительных запросов CORS.

Для получения дополнительной информации смотрите [OPTIONS](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods/OPTIONS).

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

Время истечения HSTS в секундах.

:::note
Значение `0` означает, что ClickHouse отключает HSTS. Если вы установите положительное число, HSTS будет включен, а max-age будет равным заданному вами числу.
:::

**Пример**

```xml
<hsts_max_age>600000</hsts_max_age>
```
## mlock_executable {#mlock_executable}

Выполнить `mlockall` после запуска, чтобы уменьшить задержку первой выборки запросов и предотвратить выгрузку исполняемого файла ClickHouse под высокой загрузкой ввода-вывода.

:::note
Рекомендуется включить эту опцию, но это приведет к увеличению времени запуска до нескольких секунд.
Имейте в виду, что эта настройка не будет работать без права "CAP_IPC_LOCK".
:::

**Пример**

```xml
<mlock_executable>false</mlock_executable>
```
## include_from {#include_from}

Путь к файлу с заменами. Поддерживаются форматы XML и YAML.

Для получения дополнительной информации смотрите раздел "[Конфигурационные файлы](/operations/configuration-files)".

**Пример**

```xml
<include_from>/etc/metrica.xml</include_from>
```
## interserver_listen_host {#interserver_listen_host}

Ограничения на хосты, которые могут обмениваться данными между серверами ClickHouse.
Если используется Keeper, то то же ограничение будет применяться к связи между различными экземплярами Keeper.

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

Если опущено, оно определяется так же, как и команда `hostname -f`.

Полезно для отхода от конкретного сетевого интерфейса.

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

Похоже на [`interserver_http_host`](#interserver_http_host), за исключением того, что это имя хоста можно использовать другими серверами для доступа к этому серверу по `HTTPS`.

**Пример**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```
## interserver_http_credentials {#interserver_http_credentials}

Имя пользователя и пароль, используемые для подключения к другим серверам во время [репликации](../../engines/table-engines/mergetree-family/replication.md). Кроме того, сервер аутентифицирует другие реплики, используя эти учетные данные.
Следовательно, `interserver_http_credentials` должны быть одинаковыми для всех реплик в кластере.

:::note
- По умолчанию, если секция `interserver_http_credentials` пропущена, аутентификация не используется во время репликации.
- Настройки `interserver_http_credentials` не относятся к учетным данным клиента ClickHouse [конфигурации](../../interfaces/cli.md#configuration_files).
- Эти учетные данные общие для репликации через `HTTP` и `HTTPS`.
:::

Следующие настройки могут быть настроены с помощью под-тегов:

- `user` — Имя пользователя.
- `password` — Пароль.
- `allow_empty` — Если `true`, другие реплики могут подключаться без аутентификации, даже если учетные данные установлены. Если `false`, то подключения без аутентификации отклоняются. По умолчанию: `false`.
- `old` — Содержит старые `user` и `password`, использованные во время ротации учетных данных. Можно указать несколько секций `old`.

**Ротация учетных данных**

ClickHouse поддерживает динамическую ротацию межсерверных учетных данных без одновременной остановки всех реплик для обновления их конфигурации. Учетные данные могут быть изменены в несколько шагов.

Чтобы включить аутентификацию, установите `interserver_http_credentials.allow_empty` в `true` и добавьте учетные данные. Это позволяет подключениям как с аутентификацией, так и без неё.

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

После настройки всех реплик установите `allow_empty` в `false` или удалите эту настройку. Это сделает аутентификацию с новыми учетными данными обязательной.

Чтобы изменить существующие учетные данные, переместите имя пользователя и пароль в секцию `interserver_http_credentials.old` и обновите `user` и `password` новыми значениями. В этот момент сервер использует новые учетные данные для подключения к другим репликам и принимает подключения как с новыми, так и со старыми учетными данными.

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

Перечислите LDAP-серверы с их параметрами соединения здесь, чтобы:
- использовать их в качестве аутентификаторов для выделенных локальных пользователей, у которых вместо 'password' указан механизм аутентификации 'ldap'
- использовать их в качестве удалённых каталогов пользователей.

Следующие настройки могут быть сконфигурированы с помощью под-тегов:

| Настройка                     | Описание                                                                                                                                                                                                                                                                                                                                                                   |
|-------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                        | Имя хоста или IP-адрес LDAP-сервера, этот параметр обязателен и не может быть пустым.                                                                                                                                                                                                                                                                                     |
| `port`                        | Порт LDAP-сервера, по умолчанию 636, если `enable_tls` установлено в true, и 389 в противном случае.                                                                                                                                                                                                                                                                      |
| `bind_dn`                     | Шаблон, используемый для построения DN для привязки. Результирующий DN будет создан путём замены всех подстрок `\{user_name\}` шаблона на фактическое имя пользователя на каждом этапе аутентификации.                                                                                                                                                                                                                     |
| `user_dn_detection`           | Раздел с параметрами поиска LDAP для определения фактического DN пользователя, которому производится привязка. Это в основном используется в фильтрах поиска для дальнейшего сопоставления ролей, когда сервер является Active Directory. Результирующий DN пользователя будет использоваться при замене подстрок `\{user_dn\}` везде, где это допускается. По умолчанию DN пользователя устанавливается равным DN привязки, но как только поиск выполнен, он будет обновлён фактическим значением обнаруженного DN пользователя. |
| `verification_cooldown`       | Период времени в секундах, после успешной попытки привязки, в течение которого пользователь будет считаться успешно аутентифицированным для всех последующих запросов без обращения к LDAP-серверу. Укажите `0` (по умолчанию), чтобы отключить кэширование и заставить обращаться к LDAP-серверу для каждого запроса аутентификации.                                                                                                                               |
| `enable_tls`                  | Флаг для включения использования защищённого соединения с LDAP-сервером. Укажите `no` для протокола в открытом тексте (`ldap://`) (не рекомендуется). Укажите `yes` для протокола LDAP через SSL/TLS (`ldaps://`) (рекомендуется, по умолчанию). Укажите `starttls` для устаревшего протокола StartTLS (протокол в открытом тексте (`ldap://`), модернизированный до TLS).                                                                                               |
| `tls_minimum_protocol_version` | Минимальная версия протокола SSL/TLS. Приемлемые значения: `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2` (по умолчанию).                                                                                                                                                                                                                                                            |
| `tls_require_cert`            | Поведение верификации SSL/TLS-сертификата партнёра. Приемлемые значения: `never`, `allow`, `try`, `demand` (по умолчанию).                                                                                                                                                                                                                                                 |
| `tls_cert_file`               | путь к файлу сертификата.                                                                                                                                                                                                                                                                                                                                                   |
| `tls_key_file`                | путь к файлу ключа сертификата.                                                                                                                                                                                                                                                                                                                                             |
| `tls_ca_cert_file`            | путь к файлу сертификата CA.                                                                                                                                                                                                                                                                                                                                              |
| `tls_ca_cert_dir`             | путь к директории, содержащей сертификаты CA.                                                                                                                                                                                                                                                                                                                             |
| `tls_cipher_suite`            | разрешённый набор шифров (в нотации OpenSSL).                                                                                                                                                                                                                                                                                                                             |

Настройка `user_dn_detection` может быть сконфигурирована с под-тегами:

| Настройка         | Описание                                                                                                                                                                                                                                                                                                                                             |
|-------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`         | шаблон, используемый для построения базового DN для поиска LDAP. Результирующий DN будет создаваться путём замены всех подстрок `\{user_name\}` и '\{bind_dn\}' шаблона на фактическое имя пользователя и DN привязки во время поиска LDAP.                                                                                                    |
| `scope`           | область поиска LDAP. Приемлемые значения: `base`, `one_level`, `children`, `subtree` (по умолчанию).                                                                                                                                                                                                                                           |
| `search_filter`   | шаблон, используемый для построения фильтра поиска для поиска LDAP. Результирующий фильтр будет создан путём замены всех подстрок `\{user_name\}`, `\{bind_dn\}` и `\{base_dn\}` шаблона на фактическое имя пользователя, DN привязки и базовый DN во время поиска LDAP. Обратите внимание, что специальные символы должны быть должным образом экранированы в XML.  |

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

Пример (типичный Active Directory с настроенной детекцией DN пользователя для дальнейшего сопоставления ролей):

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

Ограничение на хосты, с которых могут поступать запросы. Если вы хотите, чтобы сервер отвечал на все, укажите `::`.

Примеры:

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```

## listen_try {#listen_try}

Сервер не выйдет, если сети IPv6 или IPv4 недоступны при попытке слушать.

**Пример**

```xml
<listen_try>0</listen_try>
```

## listen_reuse_port {#listen_reuse_port}

Разрешить нескольким серверам слушать на одном адресе:порту. Запросы будут маршрутизироваться к случайному серверу операционной системой. Включение этой настройки не рекомендуется.

**Пример**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

Тип:

По умолчанию:

## listen_backlog {#listen_backlog}

Очередь (размер очереди ожидающих соединений) сокета прослушивания. Значение по умолчанию `4096` такое же, как и в linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)).

Обычно это значение не нужно изменять, так как:
- Значение по умолчанию достаточно велико,
- Для принятия соединений клиентов сервер имеет отдельный поток.

Так что, даже если у вас `TcpExtListenOverflows` (от `nstat`) ненулевое и этот счётчик растёт для сервера ClickHouse, это не означает, что это значение нужно увеличивать, так как:
- Обычно, если `4096` недостаточно, это показывает какую-то внутреннюю проблему масштабирования ClickHouse, поэтому лучше сообщить о проблеме.
- Это не означает, что сервер сможет обработать больше соединений позже (и даже если и сможет, к тому моменту клиенты могут быть исчезнувшими или отключёнными).

**Пример**

```xml
<listen_backlog>4096</listen_backlog>
```

## logger {#logger}

Местоположение и формат лог-сообщений.

**Ключи**:

| Ключ                       | Описание                                                                                                                                                                         |
|----------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                    | Уровень логирования. Приемлемые значения: `none` (отключить ведение журнала), `fatal`, `critical`, `error`, `warning`, `notice`, `information`, `debug`, `trace`, `test`                                  |
| `log`                      | Путь к файлу журнала.                                                                                                                                                           |
| `errorlog`                 | Путь к файлу журнала ошибок.                                                                                                                                                     |
| `size`                     | Политика ротации: Максимальный размер файлов журнала в байтах. Когда размер файла журнала превышает этот порог, он переименовывается и архивируется, и создаётся новый файл журнала.                  |
| `count`                    | Политика ротации: Сколько исторических файлов журналов Clickhouse сохраняется максимум.                                                                                         |
| `stream_compress`          | Сжать сообщения журнала с использованием LZ4. Установите в `1` или `true`, чтобы включить.                                                                                      |
| `console`                  | Не записывать сообщения журнала в файлы, вместо этого печатать их в консоли. Установите в `1` или `true`, чтобы включить. По умолчанию это `1`, если Clickhouse не работает в режиме демона, `0` в противном случае. |
| `console_log_level`        | Уровень логирования для консольного вывода. По умолчанию `level`.                                                                                                                                     |
| `formatting`               | Формат сообщений журнала для консольного вывода. В настоящее время поддерживается только `json`                                                                                  |
| `use_syslog`               | Также перенаправлять вывод журнала в syslog.                                                                                                                                      |
| `syslog_level`             | Уровень логирования для ведения журнала в syslog.                                                                                                                                 |

**Спецификаторы формата журнала**

Имена файлов в путях `log` и `errorLog` поддерживают указанные ниже спецификаторы формата для результирующего имени файла (составная часть директории не поддерживает их).

Столбец "Пример" показывает вывод при `2023-07-06 18:32:07`.

| Спецификатор | Описание                                                                                                         | Пример                  |
|--------------|---------------------------------------------------------------------------------------------------------------------|--------------------------|
| `%%`         | Литерал %                                                                                                           | `%`                        |
| `%n`         | Символ новой строки                                                                                                  |                          |
| `%t`         | Символ горизонтальной табуляции                                                                                            |                          |
| `%Y`         | Год в виде десятичного числа, например 2017                                                                                  | `2023`                     |
| `%y`         | Последние 2 цифры года в виде десятичного числа (диапазон [00,99])                                                           | `23`                       |
| `%C`         | Первые 2 цифры года в виде десятичного числа (диапазон [00,99])                                                          | `20`                       |
| `%G`         | Четырёхзначный [ISO 8601 год, основанный на неделях](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), т.е. год, содержащий указанную неделю. Обычно полезен только с `%V`  | `2023`       |
| `%g`         | Последние 2 цифры [ISO 8601 года, основанного на неделях](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), т.е. год, содержащий указанную неделю.                         | `23`         |
| `%b`         | Сокращённое название месяца, например, окт (в зависимости от локали)                                                                 | `Jul`                      |
| `%h`         | Синоним %b                                                                                                       | `Jul`                      |
| `%B`         | Полное название месяца, например, октябрь (в зависимости от локали)                                                                    | `July`                     |
| `%m`         | Месяц в виде десятичного числа (диапазон [01,12])                                                                           | `07`                       |
| `%U`         | Номер недели года в виде десятичного числа (воскресенье - первый день недели) (диапазон [00,53])                          | `27`                       |
| `%W`         | Номер недели года в виде десятичного числа (понедельник - первый день недели) (диапазон [00,53])                          | `27`                       |
| `%V`         | Номер недели по стандарту ISO 8601 (диапазон [01,53])                                                                                | `27`                       |
| `%j`         | Номер дня в году в виде десятичного числа (диапазон [001,366])                                                               | `187`                      |
| `%d`         | Номер дня в месяце в виде десятичного числа с дополнением нуля (диапазон [01,31]). Однозначное число предшествует нулю.                 | `06`                       |
| `%e`         | Номер дня в месяце в виде десятичного числа с пробелом на месте нуля (диапазон [1,31]). Однозначное число предшествует пробелу.              | `&nbsp; 6`                 |
| `%a`         | Сокращённое название дня недели, например, пт (в зависимости от локали)                                                               | `Thu`                      |
| `%A`         | Полное название дня недели, например, пятница (в зависимости от локали)                                                                   | `Thursday`                 |
| `%w`         | День недели как целое число с воскресеньем как 0 (диапазон [0-6])                                                          | `4`                        |
| `%u`         | День недели как десятичное число, где понедельник - 1 (формат ISO 8601) (диапазон [1-7])                                      | `4`                        |
| `%H`         | Час в виде десятичного числа, 24-часовой формат (диапазон [00-23])                                                             | `18`                       |
| `%I`         | Час в виде десятичного числа, 12-часовой формат (диапазон [01,12])                                                             | `06`                       |
| `%M`         | Минута в виде десятичного числа (диапазон [00,59])                                                                          | `32`                       |
| `%S`         | Секунда в виде десятичного числа (диапазон [00,60])                                                                          | `07`                       |
| `%c`         | Стандартная строка даты и времени, например, Вс Окт 17 04:41:13 2010 (в зависимости от локали)                                     | `Thu Jul  6 18:32:07 2023` |
| `%x`         | Локализованное представление даты (в зависимости от локали)                                                                    | `07/06/23`                 |
| `%X`         | Локализованное представление времени, например, 18:40:20 или 6:40:20 PM (в зависимости от локали)                                       | `18:32:07`                 |
| `%D`         | Краткая дата MM/DD/YY, эквивалентная %m/%d/%y                                                                         | `07/06/23`                 |
| `%F`         | Краткая дата YYYY-MM-DD, эквивалентная %Y-%m-%d                                                                       | `2023-07-06`               |
| `%r`         | Локализованное время 12-часового формата (в зависимости от локали)                                                                     | `06:32:07 PM`              |
| `%R`         | Эквивалентно "%H:%M"                                                                                               | `18:32`                    |
| `%T`         | Эквивалентно "%H:%M:%S" (формат времени ISO 8601)                                                                 | `18:32:07`                 |
| `%p`         | Локализованное обозначение a.m. или p.m. (в зависимости от локали)                                                               | `PM`                       |
| `%z`         | Смещение от UTC в формате ISO 8601 (например, -0430), или никаких символов, если информация о временной зоне недоступна | `+0800`                    |
| `%Z`         | Зависимое от локали название или аббревиатура временной зоны, или никаких символов, если информация о временной зоне недоступна     | `Z AWST `                  |

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

**Переопределение на уровне**

Уровень журнала отдельных имен журналов может быть переопределён. Например, чтобы отключить все сообщения логгеров "Backup" и "RBAC".

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

Чтобы дополнительно записывать сообщения журнала в syslog:

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
|-------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `address`   | Адрес syslog в формате `host\[:port\]`. Если не указан, используется локальный демон.                                                                                                                                                                        |
| `hostname`  | Имя хоста, с которого отправляются журналы (необязательно).                                                                                                                                                                                              |
| `facility`  | Ключевое слово [системы журналирования](https://en.wikipedia.org/wiki/Syslog#Facility). Должно указываться в верхнем регистре с префиксом "LOG_", например, `LOG_USER`, `LOG_DAEMON`, `LOG_LOCAL3` и т.д. По умолчанию: `LOG_USER`, если указан `address`, иначе `LOG_DAEMON`. |
| `format`    | Формат сообщения журнала. Возможные значения: `bsd` и `syslog.`                                                                                                                                                                                          |

**Форматы журнала**

Вы можете указать формат журнала, который будет выводиться в консольном журнале. В настоящее время поддерживается только JSON.

**Пример**

Вот пример вывода JSON-журнала:

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

Имена ключей могут быть изменены путём изменения значений тегов внутри тега `<names>`. Например, чтобы изменить `DATE_TIME` на `MY_DATE_TIME`, вы можете использовать `<date_time>MY_DATE_TIME</date_time>`.

**Омоложение ключей для JSON-журналов**

Свойства журнала могут быть опущены путём комментария соответствующего свойства. Например, если вы не хотите, чтобы ваш журнал печатал `query_id`, вы можете закомментировать тег `<query_id>`.

## send_crash_reports {#send_crash_reports}

Настройки для добровольной отправки отчётов о сбоях команде разработчиков ClickHouse через [Sentry](https://sentry.io).

Включение этой функции, особенно в предварительных версиях, высоко ценится.

Серверу потребуется доступ в интернет по IPv4 (на момент написания IPv6 не поддерживается Sentry) для того, чтобы эта функция работала исправно.

Ключи:

| Ключ                   | Описание                                                                                                                                                                                            |
|------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `enabled`              | Логическое значение для включения функции, по умолчанию `false`. Установите в `true`, чтобы разрешить отправку отчётов о сбоях.                                                                                                  |
| `send_logical_errors`  | `LOGICAL_ERROR` как `assert`, это ошибка в ClickHouse. Этот логический флаг включает отправку этих исключений в sentry (По умолчанию: `false`).                                                        |
| `endpoint`             | Вы можете переопределить URL-адрес Sentry для отправки отчётов о сбоях. Это может быть либо отдельная учетная запись Sentry, либо ваш собственный развернутый Sentry-инстанс. Используйте синтаксис [Sentry DSN](https://docs.sentry.io/error-reporting/quickstart/?platform=native#configure-the-sdk).            |
| `anonymize`            | Избегать прикрепления имени хоста сервера к отчёту о сбое.                                                                                                                                               |
| `http_proxy`           | Настроить HTTP-прокси для отправки отчётов о сбоях.                                                                                                                                                       |
| `debug`                | Установить клиент Sentry в режим отладки.                                                                                                                                                               |
| `tmp_path`             | Путь в файловой системе для временного состояния отчёта о сбое.                                                                                                                                             |
| `environment`          | Произвольное имя окружения, в котором работает сервер ClickHouse. Оно будет упоминаться в каждом отчёте о сбое. По умолчанию `test` или `prod` в зависимости от версии ClickHouse.|

**Рекомендуемое использование**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```

## ssh_server {#ssh_server}

Публичная часть ключа хоста будет записана в файл known_hosts на стороне SSH-клиента при первом подключении.

Конфигурации ключа хоста по умолчанию неактивны.
Раскомментируйте конфигурации ключа хоста и укажите путь к соответствующему SSH-ключу, чтобы активировать их:

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

Позволяет конфигурировать много дисков для хранения.

Конфигурация хранения имеет следующую структуру:

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

Конфигурация `disks` следует структуре, заданной ниже:

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

| Настройка                   | Описание                                                                                               |
|-----------------------------|---------------------------------------------------------------------------------------------------------|
| `<disk_name_N>`             | Имя диска, которое должно быть уникальным.                                                             |
| `path`                      | Путь, по которому будут храниться данные сервера (каталоги `data` и `shadow`). Должен заканчиваться на `/`|
| `keep_free_space_bytes`     | Размер резервированного свободного места на диске.                                                    |

:::note
Порядок дисков не имеет значения.
:::
### Конфигурация политик {#configuration-of-policies}

Подтеги выше определяют следующие настройки для `policies`:

| Настройка                         | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
|-----------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`                   | Имя политики. Имена политик должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `volume_name_N`                   | Имя объема. Имена объемов должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `disk`                            | Диск, расположенный внутри объема.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `max_data_part_size_bytes`        | Максимальный размер кусочка данных, который может находиться на любом из дисков в этом объеме. Если слияние приводит к размеру кусочка, ожидаемому больше `max_data_part_size_bytes`, то кусочек будет записан в следующий объем. По сути, эта функция позволяет хранить новые / маленькие куски на горячем (SSD) объеме и перемещать их на холодный (HDD) объем, когда они достигают большого размера. Не используйте этот параметр, если у политики только один объем.|
| `move_factor`                     | Доля доступного свободного места на объеме. Если свободного места становится меньше, данные начнут переноситься в следующий объем, если он есть. Для переноса куски сортируются по размеру от большего к меньшему (по убыванию), и выбираются куски, общий размер которых достаточен для выполнения условия `move_factor`; если общего размера всех кусков недостаточно, все куски будут перемещены.                                                                                                                              |
| `perform_ttl_move_on_insert`      | Отключает перемещение данных с истекшим TTL при вставке. По умолчанию (если включено), если мы вставляем кусок данных, который уже истек в соответствии с правилом перемещения по сроку службы, его немедленно перемещают в объем / диск, указанный в правиле перемещения. Это может значительно замедлить вставку, если целевой объем / диск медленный (например, S3). Если отключить, истекшая часть данных записывается в стандартный объем, а затем немедленно перемещается в объем, указанный в правиле для истекшего TTL.|
| `load_balancing`                  | Политика балансировки дисков, `round_robin` или `least_used`.                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `least_used_ttl_ms`               | Устанавливает тайм-аут (в миллисекундах) для обновления доступного пространства на всех дисках (`0` - всегда обновлять, `-1` - никогда не обновлять, значение по умолчанию - `60000`). Обратите внимание, если диск используется только ClickHouse и не будет подвергаться изменению размера файловой системы на лету, вы можете использовать значение `-1`. В противном случае это не рекомендуется, так как в конечном итоге приведет к неправильному распределению пространства.                |
| `prefer_not_to_merge`             | Отключает слияние частей данных на этом объеме. Примечание: это потенциально вредно и может вызвать замедление. Когда эта настройка включена (не делайте этого), слияние данных на этом объеме запрещено (что плохо). Это позволяет контролировать, как ClickHouse взаимодействует с медленными дисками. Мы рекомендуем вообще не использовать это.                                                                                                                                                             |
| `volume_priority`                 | Определяет приоритет (порядок), в котором заполняются объемы. Чем меньше значение, тем выше приоритет. Параметры должны быть натуральными числами и охватывать диапазон от 1 до N (N - наибольшее указанное значение параметра) без пробелов.                                                                                                                                                                                                                                                                                                          |

Для `volume_priority`:
- Если все объемы имеют этот параметр, они приоритизируются в указанном порядке.
- Если только _некоторые_ объемы имеют его, объемы, которые его не имеют, имеют самый низкий приоритет. Те, которые имеют, приоритизируются в соответствии со значением тега, а приоритет остальных определяется порядком описания в конфигурационном файле относительно друг друга.
- Если _никакие_ объемы не имеют этого параметра, их порядок определяется порядком описания в конфигурационном файле.
- Приоритет объемов может не совпадать.
## macros {#macros}

Замены параметров для реплицированных таблиц.

Может быть опущено, если реплицированные таблицы не используются.

Дополнительную информацию смотрите в разделе [Создание реплицированных таблиц](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables).

**Пример**

```xml
<macros incl="macros" optional="true" />
```
## replica_group_name {#replica_group_name}

Имя группы реплик для базы данных Replicated.

Кластер, созданный с помощью базы данных Replicated, будет состоять из реплик в одной и той же группе.
DDL-запросы будут ожидать только реплик в одной и той же группе.

По умолчанию пусто.

**Пример**

```xml
<replica_group_name>backups</replica_group_name>
```
## remap_executable {#remap_executable}

Настройка для перераспределения памяти для машинного кода ("текста") с использованием огромных страниц.

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
Мы рекомендуем использовать эту опцию в macOS, так как функция `getrlimit()` возвращает неправильное значение.
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

Дополнительную информацию смотрите в заголовочном файле MergeTreeSettings.h.

**Пример**

```xml
<merge_tree>
    <max_suspicious_broken_parts>5</max_suspicious_broken_parts>
</merge_tree>
```
## metric_log {#metric_log}

По умолчанию отключено.

**Включение**

Для вручную включения сбора истории метрик [`system.metric_log`](../../operations/system-tables/metric_log.md), создайте `/etc/clickhouse-server/config.d/metric_log.xml` со следующим содержанием:

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

Чтобы отключить настройку `metric_log`, вам следует создать следующий файл `/etc/clickhouse-server/config.d/disable_metric_log.xml` с следующим содержанием:

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## latency_log {#latency_log}

По умолчанию отключено.

**Включение**

Для вручную включения сбора истории задержек [`system.latency_log`](../../operations/system-tables/latency_log.md), создайте `/etc/clickhouse-server/config.d/latency_log.xml` со следующим содержанием:

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

Чтобы отключить настройку `latency_log`, вам следует создать следующий файл `/etc/clickhouse-server/config.d/disable_latency_log.xml` с следующим содержанием:

```xml
<clickhouse>
<latency_log remove="1" />
</clickhouse>
```
## replicated_merge_tree {#replicated_merge_tree}

Тонкая настройка для таблиц в [ReplicatedMergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Эта настройка имеет более высокий приоритет.

Для получения дополнительной информации см. заголовочный файл MergeTreeSettings.h.

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

Поддержка SSL обеспечивается библиотекой `libpoco`. Доступные параметры конфигурации объяснены в [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h). Значения по умолчанию можно найти в [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp).

Ключи для настроек сервера/клиента:

| Параметр                          | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Значение по умолчанию                       |
|------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------|
| `privateKeyFile`                   | Путь к файлу с секретным ключом PEM-сертификата. Файл может одновременно содержать ключ и сертификат.                                                                                                                                                                                                                                                                                                                                                             |                                              |
| `certificateFile`                  | Путь к файлу клиента/сервера сертификата в формате PEM. Можно опустить, если `privateKeyFile` содержит сертификат.                                                                                                                                                                                                                                                                                                                                                |                                              |
| `caConfig`                         | Путь к файлу или директории, содержащей доверенные CA-сертификаты. Если это указывает на файл, он должен быть в формате PEM и может содержать несколько CA-сертификатов. Если это указывает на директорию, она должна содержать один .pem файл на каждый CA-сертификат. Имена файлов ищутся по хеш-значению имени субъекта CA. Детали можно найти в странице man команды [SSL_CTX_load_verify_locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html). |                                              |
| `verificationMode`                 | Метод проверки сертификатов узлов. Детали описаны в описании класса [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h). Возможные значения: `none`, `relaxed`, `strict`, `once`.                                                                                                                                                                                                                                                                           | `relaxed`                                  |
| `verificationDepth`                | Максимальная длина цепочки проверки. Проверка завершится неудачей, если длина цепочки сертификатов превышает заданное значение.                                                                                                                                                                                                                                                                                                                                     | `9`                                        |
| `loadDefaultCAFile`                | Использовать ли встроенные CA-сертификаты для OpenSSL. ClickHouse предполагает, что встроенные CA-сертификаты находятся в файле `/etc/ssl/cert.pem` (соответственно, в директории `/etc/ssl/certs`) или в файле (соответственно, в директории), указанной переменной окружения `SSL_CERT_FILE` (соответственно, `SSL_CERT_DIR`).                                                                                                                                                                           | `true`                                     |
| `cipherList`                       | Поддерживаемые шифрования OpenSSL.                                                                                                                                                                                                                                                                                                                                                                                                                                | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`  |
| `cacheSessions`                    | Включает или отключает кэширование сессий. Должен использоваться в сочетании с `sessionIdContext`. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                       | `false`                                    |
| `sessionIdContext`                 | Уникальный набор случайных символов, который сервер добавляет к каждому сгенерированному идентификатору. Длина строки не должна превышать `SSL_MAX_SSL_SESSION_ID_LENGTH`. Этот параметр всегда рекомендуется, так как помогает избежать проблем как в том случае, если сервер кэширует сессию, так и в том случае, если клиент запросил кэширование.                                                                                                                                                          | `$\{application.name\}`                    |
| `sessionCacheSize`                 | Максимальное количество сессий, которые сервер кэширует. Значение `0` означает неограниченное количество сессий.                                                                                                                                                                                                                                                                                                                                                  | [1024\*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978)          |
| `sessionTimeout`                   | Время кэширования сессии на стороне сервера в часах.                                                                                                                                                                                                                                                                                                                                                                                                               | `2`                                        |
| `extendedVerification`             | Если включено, проверяйте, что CN или SAN сертификата соответствуют имени узла партнера.                                                                                                                                                                                                                                                                                                                                                                          | `false`                                    |
| `requireTLSv1`                     | Требовать соединение TLSv1. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                               | `false`                                    |
| `requireTLSv1_1`                   | Требовать соединение TLSv1.1. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                             | `false`                                    |
| `requireTLSv1_2`                   | Требовать соединение TLSv1.2. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                             | `false`                                    |
| `fips`                             | Активирует режим FIPS для OpenSSL. Поддерживается, если версия библиотеки OpenSSL поддерживает FIPS.                                                                                                                                                                                                                                                                                                                                                             | `false`                                    |
| `privateKeyPassphraseHandler`      | Класс (подкласс PrivateKeyPassphraseHandler), который запрашивает пароль для доступа к приватному ключу. Например: `<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`.                                                                                                                                                                              | `KeyConsoleHandler`                        |
| `invalidCertificateHandler`        | Класс (подкласс CertificateHandler) для проверки недействительных сертификатов. Например: `<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>`.                                                                                                                                                                                                                                                                    | `RejectCertificateHandler`                 |
| `disableProtocols`                 | Протоколы, использование которых не разрешено.                                                                                                                                                                                                                                                                                                                                                                                                                  |                                              |
| `preferServerCiphers`              | Предпочитаемые серверные шифры со стороны клиента.                                                                                                                                                                                                                                                                                                                                                                                                                   | `false`                                    |

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

Логирование событий, связанных с [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Например, добавление или слияние данных. Вы можете использовать журнал для моделирования алгоритмов слияния и сравнения их характеристик. Вы можете визуализировать процесс слияния.

Запросы записываются в таблицу [system.part_log](/operations/system-tables/part_log), а не в отдельный файл. Вы можете настроить имя этой таблицы в параметре `table` (см. ниже).

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

Путь к каталогу, содержащему данные.

:::note
Заключительный слеш обязателен.
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

Экспорт данных метрик для сбора с помощью [Prometheus](https://prometheus.io).

Настройки:

- `endpoint` – HTTP конечная точка для сбора метрик сервером prometheus. Начинается с '/'.
- `port` – Порт для `endpoint`.
- `metrics` – Экспорт метрик из таблицы [system.metrics](/operations/system-tables/metrics).
- `events` – Экспорт метрик из таблицы [system.events](/operations/system-tables/events).
- `asynchronous_metrics` – Экспорт текущих значений метрик из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).
- `errors` - Экспорт количества ошибок по коду ошибок, произошедших с момента последнего перезапуска сервера. Эта информация также может быть получена из [system.errors](/operations/system-tables/errors).

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

Запросы записываются в таблицу [system.query_log](/operations/system-tables/query_log), а не в отдельный файл. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

Если таблица не существует, ClickHouse создаст её. Если структура журнала запросов была изменена при обновлении сервера ClickHouse, таблица со старой структурой переименовывается, а новая таблица создаётся автоматически.

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

Чтобы вручную включить сбор истории метрик [`system.query_metric_log`](../../operations/system-tables/query_metric_log.md), создайте `/etc/clickhouse-server/config.d/query_metric_log.xml` со следующим содержимым:

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

Чтобы отключить настройку `query_metric_log`, необходимо создать следующий файл `/etc/clickhouse-server/config.d/disable_query_metric_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## query_cache {#query_cache}

Конфигурация [кэша запросов](../query-cache.md).

Доступны следующие настройки:

| Настройка                   | Описание                                                                            | Значение по умолчанию |
|-----------------------------|--------------------------------------------------------------------------------------|-----------------------|
| `max_size_in_bytes`         | Максимальный размер кэша в байтах. `0` означает, что кэш запросов отключен.        | `1073741824`          |
| `max_entries`               | Максимальное количество результатов запросов `SELECT`, хранящихся в кэше.          | `1024`                |
| `max_entry_size_in_bytes`   | Максимальный размер в байтах, который могут иметь результаты запросов `SELECT`, чтобы быть сохранёнными в кэше. | `1048576`             |
| `max_entry_size_in_rows`    | Максимальное количество строк, которое могут иметь результаты запросов `SELECT`, чтобы быть сохранёнными в кэше. | `30000000`            |

:::note
- Изменённые настройки вступают в силу немедленно.
- Данные для кэша запросов выделяются в DRAM. Если память ограничена, убедитесь, что установлено небольшое значение для `max_size_in_bytes` или вообще отключите кэш запросов.
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

Настройка для логирования потоков запросов, полученных с помощью настройки [log_query_threads=1](/operations/settings/settings#log_query_threads).

Запросы записываются в таблицу [system.query_thread_log](/operations/system-tables/query_thread_log), а не в отдельный файл. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

Если таблица не существует, ClickHouse создаст её. Если структура журнала потоков запросов была изменена при обновлении сервера ClickHouse, таблица со старой структурой переименовывается, а новая таблица создаётся автоматически.

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

Настройка для логирования представлений (живых, материализованных и т.д.), зависящих от запросов, полученных с помощью настройки [log_query_views=1](/operations/settings/settings#log_query_views).

Запросы записываются в таблицу [system.query_views_log](/operations/system-tables/query_views_log), а не в отдельный файл. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

Если таблица не существует, ClickHouse создаст её. Если структура журнала представлений запросов была изменена при обновлении сервера ClickHouse, таблица со старой структурой переименовывается, а новая таблица создаётся автоматически.

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

| Настройка | Описание                                                                                                                                                                                                  | Значение по умолчанию |
|-----------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-----------------------|
| `level`   | Максимальный уровень сообщений (по умолчанию `Trace`), который будет храниться в таблице.                                                                                                                | `Trace`               |

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

Настройки для системной таблицы [crash_log](../../operations/system-tables/crash-log.md).

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

Эта настройка определяет путь к кэшу для пользовательских (созданных из SQL) кэшированных дисков. 
`custom_cached_disks_base_directory` имеет более высокий приоритет для пользовательских дисков по сравнению с `filesystem_caches_path` (найден в `filesystem_caches_path.xml`), который используется в случае отсутствия первого.
Путь к настройкам кэша файловой системы должен находиться внутри этого каталога, в противном случае будет выброшено исключение, предотвращающее создание диска.

:::note
Это не повлияет на диски, созданные в старой версии, для которых сервер был обновлён. В этом случае исключение не будет выброшено, чтобы разрешить успешный запуск сервера.
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

Правила, основанные на регулярных выражениях, которые будут применяться к запросам, а также ко всем сообщениям журнала перед их сохранением в журналы сервера,
в таблицах [`system.query_log`](/operations/system-tables/query_log), [`system.text_log`](/operations/system-tables/text_log), [`system.processes`](/operations/system-tables/processes) и в журналах, отправляемых клиенту. Это позволяет предотвратить утечку конфиденциальных данных из SQL-запросов, таких как имена, электронные адреса, личные идентификаторы или номера кредитных карт в журналы.

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
|-------------|---------------------------------------------------------------------------|
| `name`      | имя правила (опционально)                                                |
| `regexp`    | регулярное выражение, совместимое с RE2 (обязательно)                    |
| `replace`   | строка замещения для конфиденциальных данных (опционально, по умолчанию - шесть звездочек) |

Правила маскирования применяются ко всему запросу (чтобы предотвратить утечки конфиденциальных данных из неправильно оформленных / неразбираемых запросов).

В таблице [`system.events`](/operations/system-tables/events) есть счётчик `QueryMaskingRulesMatch`, который показывает общее количество совпадений правил маскирования запросов.

Для распределённых запросов каждый сервер должен быть настроен отдельно, в противном случае подзапросы, переданные другим
узлам, будут храниться без маскировки.
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
- [Движок реплицированных баз данных](../../engines/database-engines/replicated.md)
## remote_url_allow_hosts {#remote_url_allow_hosts}

Список хостов, которые разрешено использовать в движках хранения и функциях таблиц, связанных с URL.

При добавлении хоста с помощью тега `\<host\>` xml:
- он должен быть указан точно так же, как в URL, так как имя проверяется перед разрешением DNS. Например: `<host>clickhouse.com</host>`
- если порт явно указан в URL, то проверяется host:port как единое целое. Например: `<host>clickhouse.com:80</host>`
- если хост указан без порта, то разрешается любой порт хоста. Например: если указан `<host>clickhouse.com</host>`, то `clickhouse.com:20` (FTP), `clickhouse.com:80` (HTTP), `clickhouse.com:443` (HTTPS) и т.д. разрешены.
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

Указан как идентификатор IANA для временной зоны UTC или географического местоположения (например, Africa/Abidjan).

Часовой пояс необходим для преобразования между строковыми и форматами DateTime при выводе полей DateTime в текстовый формат (вывод на экран или в файл) и при получении DateTime из строки. Кроме того, часовой пояс используется в функциях, которые работают с временем и датой, если они не получили часовой пояс в входных параметрах.

**Пример**

```xml
<timezone>Asia/Istanbul</timezone>
```

**Смотрите также**

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

Путь на локальной файловой системе для хранения временных данных при обработке больших запросов.

:::note
- Можно использовать только одну опцию для настройки хранения временных данных: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
- Заключительный слэш обязателен.
:::

**Пример**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```
## url_scheme_mappers {#url_scheme_mappers}

Конфигурация для преобразования сокращённых или символических префиксов URL в полные URL.

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

Каталог с пользовательскими файлами. Используется в функции таблицы [file()](../../sql-reference/table-functions/file.md), [fileCluster()](../../sql-reference/table-functions/fileCluster.md).

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

Тип:

Значение по умолчанию:
## user_defined_path {#user_defined_path}

Каталог с пользовательскими файлами. Используется для SQL пользовательских функций [SQL пользовательские функции](/sql-reference/functions/udf).

**Пример**

```xml
<user_defined_path>/var/lib/clickhouse/user_defined/</user_defined_path>
```
## users_config {#users_config}

Путь к файлу, который содержит:

- Конфигурации пользователей.
- Права доступа.
- Профили настроек.
- Настройки квот.

**Пример**

```xml
<users_config>users.xml</users_config>
```
## access_control_improvements {#access_control_improvements}

Настройки для дополнительных улучшений в системе контроля доступа.

| Настройка                                         | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Значение по умолчанию |
|-------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------|
| `users_without_row_policies_can_read_rows`      | Устанавливает, могут ли пользователи без разрешающих политик по строкам всё равно читать строки с помощью запроса `SELECT`. Например, если есть два пользователя A и B, а политика строк определена только для A, то если эта настройка истинна, пользователь B увидит все строки. Если эта настройка ложна, пользователь B не увидит ни одной строки.                                                                                                                                                                                                                    | `true`  |
| `on_cluster_queries_require_cluster_grant`      | Устанавливает, требуют ли запросы `ON CLUSTER` разрешение `CLUSTER`.                                                                                                                                                                                                                                                                                                                                                                                                                                                   | `true`  |
| `select_from_system_db_requires_grant`          | Устанавливает, требует ли `SELECT * FROM system.<table>` каких-либо разрешений и может быть выполненным любым пользователем. Если установлено в true, то этот запрос требует `GRANT SELECT ON system.<table>`, как для обычных таблиц. Исключения: несколько системных таблиц (`tables`, `columns`, `databases`, и некоторые постоянные таблицы вроде `one`, `contributors`) по-прежнему доступны для всех, и если есть привилегия `SHOW` (например, `SHOW USERS`), то соответствующая системная таблица (например, `system.users`) будет доступна. | `true`  |
| `select_from_information_schema_requires_grant` | Устанавливает, требует ли `SELECT * FROM information_schema.<table>` каких-либо разрешений и может быть выполненным любым пользователем. Если установлено в true, то этот запрос требует `GRANT SELECT ON information_schema.<table>`, так же как для обычных таблиц.                                                                                                                                                                                                                                                                                 | `true`  |
| `settings_constraints_replace_previous`         | Устанавливает, будет ли ограничение в профиле настроек для некоторой настройки отменять действия предыдущего ограничения (определённого в других профилях) для этой настройки, включая поля, которые не определены новым ограничением. Это также включает тип ограничения `changeable_in_readonly`.                                                                                                                                                                                                                            | `true`  |
| `table_engines_require_grant`                   | Устанавливает, требуется ли разрешение для создания таблицы с конкретным движком таблиц.                                                                                                                                                                                                                                                                                                                                                                                                                                     | `false` |
| `role_cache_expiration_time_seconds`            | Устанавливает количество секунд с последнего доступа, на которое роль хранится в кэше ролей.                                                                                                                                                                                                                                                                                                                                                                                                                           | `600`   |

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

Содержит настройки, которые позволяют ClickHouse взаимодействовать с кластером [ZooKeeper](http://zookeeper.apache.org/). ClickHouse использует ZooKeeper для хранения метаданных реплик при использовании реплицируемых таблиц. Если реплицируемые таблицы не используются, этот раздел параметров можно опустить.

Следующие настройки могут быть настроены с помощью под-тегов:

| Настройка                                  | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|--------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `node`                                     | Точка доступа ZooKeeper. Вы можете указать несколько точек доступа. Например, `<node index="1"><host>example_host</host><port>2181</port></node>`. Атрибут `index` задает порядок узлов при попытке подключения к кластеру ZooKeeper.                                                                                                                                                                                                                                                                                            |
| `session_timeout_ms`                       | Максимальный тайм-аут для клиентской сессии в миллисекундах.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `operation_timeout_ms`                     | Максимальный тайм-аут для одной операции в миллисекундах.                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `root` (опционально)                       | Znode, который используется в качестве корня для znodes, используемых сервером ClickHouse.                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `fallback_session_lifetime.min` (опционально) | Минимальный предел для срока жизни сессии zookeeper на резервном узле, когда основной недоступен (балансировка нагрузки). Устанавливается в секундах. По умолчанию: 3 часа.                                                                                                                                                                                                                                                                                                                                                              |
| `fallback_session_lifetime.max` (опционально) | Максимальный предел для срока жизни сессии zookeeper на резервном узле, когда основной недоступен (балансировка нагрузки). Устанавливается в секундах. По умолчанию: 6 часов.                                                                                                                                                                                                                                                                                                                                                              |
| `identity` (опционально)                  | Пользователь и пароль, требуемые ZooKeeper для доступа к запрашиваемым znodes.                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `use_compression` (опционально)           | Включает сжатие в протоколе Keeper, если установлено в true.                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |

Существует также настройка `zookeeper_load_balancing` (опционально), которая позволяет выбрать алгоритм для выбора узла ZooKeeper:

| Название алгоритма                  | Описание                                                                                                                    |
|-------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| `random`                           | случайно выбирает один из узлов ZooKeeper.                                                                                       |
| `in_order`                         | выбирает первый узел ZooKeeper, если он недоступен, то второй, и так далее.                                                    |
| `nearest_hostname`                 | выбирает узел ZooKeeper, у которого имя хоста наиболее похоже на имя хоста сервера, имя хоста сравнивается с префиксом имени. |
| `hostname_levenshtein_distance`    | аналогично nearest_hostname, но сравнивает имя хоста по методу расстояния Левенштейна.                                         |
| `first_or_random`                  | выбирает первый узел ZooKeeper, если он недоступен, то случайно выбирает один из оставшихся узлов ZooKeeper.                |
| `round_robin`                      | выбирает первый узел ZooKeeper, если происходит повторное подключение, выбирает следующий.                                                    |

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
    <!-- Опционально. Строка ACL digest для Zookeeper. -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**См. также**

- [Replication](../../engines/table-engines/mergetree-family/replication.md)
- [ZooKeeper Programmer's Guide](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [Опциональная защищенная связь между ClickHouse и Zookeeper](/operations/ssl-zookeeper)

## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper}

Метод хранения заголовков частей данных в ZooKeeper. Эта настройка применяется только к семейству [`MergeTree`](/engines/table-engines/mergetree-family). Она может быть указана:

**Глобально в разделе [merge_tree](#merge_tree) файла `config.xml`**

ClickHouse использует эту настройку для всех таблиц на сервере. Вы можете изменить настройку в любое время. Существующие таблицы изменят свое поведение, когда настройка изменится.

**Для каждой таблицы**

При создании таблицы укажите соответствующую [настройку движка](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table). Поведение существующей таблицы с этой настройкой не изменится, даже если глобальная настройка изменится.

**Возможные значения**

- `0` — Функциональность отключена.
- `1` — Функциональность включена.

Если [`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper), то [реплицируемые](../../engines/table-engines/mergetree-family/replication.md) таблицы хранят заголовки частей данных компактно, используя один `znode`. Если таблица содержит много колонок, этот метод хранения значительно снижает объем данных, хранящихся в ZooKeeper.

:::note
После применения `use_minimalistic_part_header_in_zookeeper = 1` вы не сможете снизить версию сервера ClickHouse до версии, которая не поддерживает эту настройку. Будьте осторожны при обновлении ClickHouse на серверах в кластере. Не обновляйте все серверы одновременно. Безопаснее протестировать новые версии ClickHouse в тестовой среде или всего на нескольких серверах кластера.

Заголовки частей данных, уже сохраненные с этой настройкой, не могут быть восстановлены к их предыдущему (не компактному) представлению.
:::

## distributed_ddl {#distributed_ddl}

Управление выполнением [распределенных DDL-запросов](../../sql-reference/distributed-ddl.md) (`CREATE`, `DROP`, `ALTER`, `RENAME`) в кластере. Работает только если [ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper) включен.

Настраиваемые параметры в `<distributed_ddl>` включают:

| Настройка                | Описание                                                                                                                       | Значение по умолчанию                          |
|------------------------|-----------------------------------------------------------------------------------------------------------------------------------|----------------------------------------|
| `path`                 | путь в Keeper для `task_queue` для DDL-запросов                                                                           |                                        |
| `profile`              | профиль, используемый для выполнения DDL-запросов                                                                                       |                                        |
| `pool_size`            | сколько `ON CLUSTER` запросов можно выполнять одновременно                                                                           |                                        |
| `max_tasks_in_queue`   | максимальное количество задач, которые могут находиться в очереди.                                                                             | `1,000`                                |
| `task_max_lifetime`    | удалить узел, если его возраст больше этого значения.                                                                                | `7 * 24 * 60 * 60` (неделя в секундах) |
| `cleanup_delay_period` | очистка начинается после получения нового события узла, если последняя очистка не была выполнена раньше, чем `cleanup_delay_period` секунд назад. | `60` секунд                           |

**Пример**

```xml
<distributed_ddl>
    <!-- Путь в ZooKeeper к очереди с DDL-запросами -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- Настройки из этого профиля будут использоваться для выполнения DDL-запросов -->
    <profile>default</profile>

    <!-- Контролирует, сколько ON CLUSTER запросов можно выполнять одновременно. -->
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

Путь к папке, где сервер ClickHouse хранит конфигурации пользователей и ролей, созданные SQL-командами.

**См. также**

- [Контроль доступа и управление учетными записями](/operations/access-rights#access-control-usage)

## allow_plaintext_password {#allow_plaintext_password}

Настраивает, разрешены ли типы паролей в открытом виде (небезопасные).

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```

## allow_no_password {#allow_no_password}

Настраивает, разрешен ли небезопасный тип пароля без пароля.

```xml
<allow_no_password>1</allow_no_password>
```

## allow_implicit_no_password {#allow_implicit_no_password}

Запрещает создание пользователя без пароля, если 'IDENTIFIED WITH no_password' не указано явно.

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```

## default_session_timeout {#default_session_timeout}

Тайм-аут сессии по умолчанию, в секундах.

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
- Путь к папке, где хранятся пользователи, созданные SQL-командами.
- Путь к узлу ZooKeeper, где хранятся и реплицируются пользователи, созданные SQL-командами (экспериментально).

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

Вы также можете определить разделы `memory` — означает хранение информации только в памяти, без записи на диск, и `ldap` — означает хранение информации на LDAP-сервере.

Чтобы добавить LDAP-сервер как удаленный каталог пользователей для пользователей, которые не определены локально, определите один раздел `ldap` со следующими настройками:

| Настройка  | Описание                                                                                                                                                                                                                                                                                                                                                                    |
|------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `server`   | одно из имен серверов LDAP, определенных в разделе конфигурации `ldap_servers`. Этот параметр обязательный и не может быть пустым.                                                                                                                                                                                                                                            |
| `roles`    | секция со списком локально определенных ролей, которые будут назначены каждому пользователю, полученному с сервера LDAP. Если роли не указаны, пользователь не сможет выполнять никаких действий после аутентификации. Если любая из перечисленных ролей не определена локально в момент аутентификации, попытка аутентификации завершится неудачей, как если бы введенный пароль был неверным. |

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

Определяет список пользовательских доменов верхнего уровня, которые нужно добавить, где каждый элемент имеет формат `<name>/path/to/file</name>`.

Например:

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

См. также:
- функция [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cuttofirstsignificantsubdomaincustom) и ее вариации,
  которые принимают имя пользовательского списка TLD, возвращая часть домена, которая включает домены верхнего уровня до первого значимого поддомена.

## proxy {#proxy}

Определить прокси-серверы для HTTP и HTTPS-запросов, которые в настоящее время поддерживаются для хранилища S3, таблиц S3 и функций URL.

Существует три способа определения прокси-серверов:
- переменные окружения
- списки прокси
- удаленные прокси-разрешители.

Также поддерживается обход прокси-серверов для определенных хостов с помощью `no_proxy`.

**Переменные окружения**

Переменные окружения `http_proxy` и `https_proxy` позволяют вам указать
прокси-сервер для данного протокола. Если вы его установили в своей системе, он должен работать без проблем.

Это самый простой подход, если для данного протокола имеется
только один прокси-сервер, и этот прокси-сервер не меняется.

**Списки прокси**

Этот подход позволяет вам указать один или несколько
прокси-серверов для протокола. Если определено более одного прокси-сервера,
ClickHouse использует разные прокси по принципу round-robin, распределяя
нагрузку между серверами. Это самый простой подход, если есть более одного
прокси-сервера для протокола, и список прокси-серверов не меняется.

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

| Поле      | Описание                         |
|-----------|-------------------------------------|
| `<http>`  | Список одного или более HTTP-прокси  |
| `<https>` | Список одного или более HTTPS-прокси |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| Поле   | Описание          |
|---------|----------------------|
| `<uri>` | URI прокси |

  </TabItem>
</Tabs>

**Удаленные прокси-разрешители**

Возможно, что прокси-серверы меняются динамически. В этом
случае вы можете определить конечную точку разрешителя. ClickHouse отправляет
пустой GET-запрос на эту конечную точку, удаленный разрешитель должен вернуть хост прокси.
ClickHouse будет использовать его для формирования URI прокси с помощью следующего шаблона: `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

| Поле    | Описание                      |
|----------|----------------------------------|
| `<http>` | Список одного или более разрешителей* |
| `<https>` | Список одного или более разрешителей* |

  </TabItem>
  <TabItem value="http_https" label="<http> and <https>">

| Поле       | Описание                                   |
|-------------|-----------------------------------------------|
| `<resolver>` | Конечная точка и другие детали для разрешителя |

  </TabItem>
</Tabs>

:::note
Вы можете иметь несколько `<resolver>` элементов, но используется только первый
`<resolver>` для данного протокола. Все другие `<resolver>`
элементы для этого протокола игнорируются. Это означает, что балансировка нагрузки 
(при необходимости) должна быть реализована удалённым разрешителем.
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| Поле               | Описание                                                                                                                                                                            |
|---------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `<endpoint>`        | URI разрешителя прокси                                                                                                                                                          |
| `<proxy_scheme>`    | Протокол последнего URI прокси. Это может быть либо `http`, либо `https`.                                                                                                             |
| `<proxy_port>`      | Номер порта разрешителя прокси                                                                                                                                                  |
| `<proxy_cache_time>` | Время в секундах, в течение которого значения от разрешителя должны кэшироваться ClickHouse. Установка этого значения в `0` заставляет ClickHouse связываться с разрешителем для каждого HTTP или HTTPS запроса. |

  </TabItem>
</Tabs>

**Приоритет**

Настройки прокси определяются в следующем порядке:

| Порядок | Настройка                |
|-------|------------------------|
| 1.    | Удаленные прокси-разрешители |
| 2.    | Списки прокси            |
| 3.    | Переменные окружения  |

ClickHouse проверит разрешитель с самым высоким приоритетом для протокола запроса. Если он не определен,
он проверяет следующий разрешитель более высокого приоритета, пока не дойдет до разрешителя окружения.
Это также позволяет использовать комбинированные типы разрешителей.

## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy}

По умолчанию туннелирование (то есть `HTTP CONNECT`) используется для выполнения `HTTPS` запросов через `HTTP` прокси. Эта настройка может быть использована для его отключения.

**no_proxy**

По умолчанию все запросы будут проходить через прокси. Чтобы отключить его для определенных хостов, необходимо установить переменную `no_proxy`.
Ее можно указать внутри предложения `<proxy>` для списков и удаленных разрешителей, а также как переменную окружения для разрешителя из окружения.
Она поддерживает IP-адреса, домены, поддомены и дикий символ `'*'` для полного обхода. Ведущие точки удаляются так же, как это делает curl.

**Пример**

Следующая конфигурация обходить запросы прокси к `clickhouse.cloud` и всем его поддоменам (например, `auth.clickhouse.cloud`).
То же самое относится к GitLab, несмотря на то, что у него есть ведущая точка. Оба `gitlab.com` и `about.gitlab.com` будут обходить прокси.

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

Директория, используемая в качестве хранилища для всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. По умолчанию используется папка `/workload/` в рабочем каталоге сервера.

**Пример**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**См. также**
- [Иерархия нагрузки](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)

## workload_zookeeper_path {#workload_zookeeper_path}

Путь к znode ZooKeeper, который используется в качестве хранилища для всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. Для согласованности все SQL определения хранятся как значение этого единственного znode. По умолчанию ZooKeeper не используется, и определения хранятся на [диске](#workload_path).

**Пример**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**См. также**
- [Иерархия нагрузки](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)
