## asynchronous_metric_log {#asynchronous_metric_log}

Включен по умолчанию в развертываниях ClickHouse Cloud.

Если эта настройка не включена по умолчанию в вашей среде, в зависимости от способа установки ClickHouse, вы можете следовать инструкциям ниже, чтобы включить или отключить её.

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

Чтобы отключить настройку `asynchronous_metric_log`, создайте следующий файл `/etc/clickhouse-server/config.d/disable_asynchronous_metric_log.xml` со следующим содержимым:

```xml
<clickhouse><asynchronous_metric_log remove="1" /></clickhouse>
```

<SystemLogParameters/>
## auth_use_forwarded_address {#auth_use_forwarded_address}

Использует исходный адрес для аутентификации для клиентов, подключенных через прокси.

:::note
Эта настройка должна использоваться с особой осторожностью, так как перенаправленные адреса могут быть легко подделаны - серверам, принимающим такую аутентификацию, не следует получать доступ напрямую, а исключительно через доверенный прокси.
:::
## backups {#backups}

Настройки для резервных копий, используемые при выполнении `BACKUP TO File()`.

Следующие настройки могут быть настроены с помощью подпараметров:

| Настройка                          | Описание                                                                                                                                                                          | По умолчанию |
|-------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| `allowed_path`                      | Путь для резервного копирования при использовании `File()`. Эта настройка должна быть установлена для использования `File`. Путь может быть относительным к каталогу экземпляра или абсолютным. | `true`       |
| `remove_backup_files_after_failure` | Если команда `BACKUP` завершится неудачей, ClickHouse попытается удалить файлы, уже скопированные на резервное копирование до неудачи, иначе оставит скопированные файлы как есть.     | `true`       |

Эта настройка по умолчанию настроена как:

```xml
<backups>
    <allowed_path>backups</allowed_path>
    <remove_backup_files_after_failure>true</remove_backup_files_after_failure>
</backups>
```
## bcrypt_workfactor {#bcrypt_workfactor}

Фактор работы для типа аутентификации `bcrypt_password`, который использует [алгоритм Bcrypt](https://wildlyinaccurate.com/bcrypt-choosing-a-work-factor/). Фактор работы определяет количество вычислений и времени, необходимого для вычисления хеша и проверки пароля.

```xml
<bcrypt_workfactor>12</bcrypt_workfactor>
```

:::warning
Для приложений с высокочастотной аутентификацией,
рассмотрите альтернативные методы аутентификации из-за
вычислительных затрат bcrypt при более высоких факторах работы.
:::
## table_engines_require_grant {#table_engines_require_grant}

Если установить значение true, пользователи требуют грант для создания таблицы с конкретным движком, например, `GRANT TABLE ENGINE ON TinyLog to user`.

:::note
По умолчанию, для обратной совместимости создание таблицы с конкретным движком таблицы игнорирует грант, однако вы можете изменить это поведение, установив его на true.
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
Мы рекомендуем не изменять это, если вы только что начали использовать ClickHouse.
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

**Действия при соблюдении условий**:

- Если часть данных соответствует установленному условию, ClickHouse использует указанный метод сжатия.
- Если часть данных соответствует нескольким наборам условий, ClickHouse использует первый совпавший набор условий.

:::note
Если никаких условий не выполняется для части данных, ClickHouse использует сжатие `lz4`.
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

Настраивает команду для получения ключа, который будет использоваться кодеками [шифрования](/sql-reference/statements/create/table#encryption-codecs). Ключ (или ключи) должны быть записаны в переменных окружения или заданы в файле конфигурации.

Ключи могут быть в шестнадцатеричном формате или строке длиной 16 байт.

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
Хранение ключей в файле конфигурации не рекомендуется. Это небезопасно. Вы можете переместить ключи в отдельный файл конфигурации на безопасный диск и создать символическую ссылку на этот файл конфигурации в папке `config.d/`.
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

Также пользователи могут добавить nonce, который должен быть 12 байт в длину (по умолчанию процессы шифрования и расшифровки используют nonce, состоящий из нулевых байтов):

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce>012345678910</nonce>
    </aes_128_gcm_siv>
</encryption_codecs>
```

Или это может быть указано в шестнадцатеричном формате:

```xml
<encryption_codecs>
    <aes_128_gcm_siv>
        <nonce_hex>abcdefabcdef</nonce_hex>
    </aes_128_gcm_siv>
</encryption_codecs>
```
:::note
Все, упомянутое выше, может быть применено для `aes_256_gcm_siv` (но ключ должен быть длиной 32 байта).
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

Список префиксов для [пользовательских настроек](/operations/settings/query-level#custom_settings). Префиксы должны быть разделены запятыми.

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

Профиль настроек по умолчанию. Профили настроек находятся в файле, указанном в настройке `user_config`.

**Пример**

```xml
<default_profile>default</default_profile>
```
## dictionaries_config {#dictionaries_config}

Путь к файлу конфигурации для словарей.

Путь:

- Укажите абсолютный путь или путь относительно файла конфигурации сервера.
- Путь может содержать подстановочные знаки * и ?.

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
- Путь может содержать подстановочные знаки * и ?.

См. также:
- "[Исполняемые пользовательские функции](/sql-reference/functions/udf#executable-user-defined-functions).".

**Пример**

```xml
<user_defined_executable_functions_config>*_function.xml</user_defined_executable_functions_config>
```
## format_schema_path {#format_schema_path}

Путь к директории со схемами для входящих данных, например схемами для формата [CapnProto](../../interfaces/formats.md#capnproto).

**Пример**

```xml
<!-- Directory containing schema files for various input formats. -->
<format_schema_path>format_schemas/</format_schema_path>
```
## graphite {#graphite}

Отправка данных в [Graphite](https://github.com/graphite-project).

Настройки:

- `host` – Сервер Graphite.
- `port` – Порт на сервере Graphite.
- `interval` – Интервал для отправки, в секундах.
- `timeout` – Тайм-аут для отправки данных, в секундах.
- `root_path` – Префикс для ключей.
- `metrics` – Отправка данных из таблицы [system.metrics](/operations/system-tables/metrics).
- `events` – Отправка данных дельт, накопленных за период времени, из таблицы [system.events](/operations/system-tables/events).
- `events_cumulative` – Отправка кумулятивных данных из таблицы [system.events](/operations/system-tables/events).
- `asynchronous_metrics` – Отправка данных из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).

Вы можете настраивать несколько условий `<graphite>`. Например, вы можете использовать это для отправки различных данных с различными интервалами.

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

Определяет каталог, содержащий proto-файлы для типов Protobuf.

Пример:

```xml
<google_protos_path>/usr/share/clickhouse/protos/</google_protos_path>
```
## http_handlers {#http_handlers}

Позволяет использовать пользовательские HTTP-обработчики. Чтобы добавить новый HTTP-обработчик, просто добавьте новое `<rule>`. Правила проверяются сверху вниз в указанном порядке, и первый подходящий обработчик будет запущен.

Следующие настройки могут быть настроены с помощью подпараметров:

| Подпараметры          | Определение                                                                                                                                                                                            |
|-----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                 | Для сопоставления URL-запроса вы можете использовать префикс 'regex:' для использования регулярного выражения (по желанию)                                                                            |
| `methods`             | Для сопоставления методов запросов вы можете перечислить несколько совпадений методов через запятую (по желанию)                                                                                      |
| `headers`             | Для сопоставления заголовков запросов сопоставьте каждый дочерний элемент (имя дочернего элемента - это имя заголовка), вы можете использовать префикс 'regex:' для использования регулярного выражения (по желанию) |
| `handler`             | Обработчик запроса                                                                                                                                                                                  |
| `empty_query_string`  | Убедитесь, что в URL нет строки запроса                                                                                                                                                             |

`handler` содержит следующие настройки, которые могут быть настроены с помощью подпараметров:

| Подпараметры         | Определение                                                                                                                                                                                                                        |
|----------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `url`                | Место для перенаправления                                                                                                                                                                                                          |
| `type`               | Поддерживаемые типы: static, dynamic_query_handler, predefined_query_handler, redirect                                                                                                                                             |
| `status`             | Использовать с типом static, код состояния ответа                                                                                                                                                                                |
| `query_param_name`   | Использовать с типом dynamic_query_handler, извлекает и выполняет значение, соответствующее значению `<query_param_name>` в параметрах HTTP-запроса                                                                                 |
| `query`              | Использовать с типом predefined_query_handler, выполняет запрос, когда вызывается обработчик                                                                                                                                     |
| `content_type`       | Использовать с типом static, тип контента ответа                                                                                                                                                                                 |
| `response_content`   | Использовать с типом static, содержимое ответа, отправляемое клиенту; при использовании префиксов 'file://' или 'config://', находите содержимое из файла или конфигурации, отправляемой клиенту                                   |

Вместе со списком правил вы можете указать `<defaults/>`, который определяет включение всех стандартных обработчиков.

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

Страница, которая отображается по умолчанию, когда вы обращаетесь к серверу ClickHouse HTTP(s). Значение по умолчанию - "Ok." (с переводом строки в конце)

**Пример**

Открывает `https://tabix.io/`, когда вы обращаетесь к `http://localhost: http_port`.

```xml
<http_server_default_response>
  <![CDATA[<html ng-app="SMI2"><head><base href="http://ui.tabix.io/"></head><body><div ui-view="" class="content-ui"></div><script src="http://loader.tabix.io/master.js"></script></body></html>]]>
</http_server_default_response>
```
## http_options_response {#http_options_response}

Используется для добавления заголовков в ответ на HTTP-запрос `OPTIONS`. Метод `OPTIONS` используется при выполнении предзапросов CORS.

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

Время хранения для HSTS в секундах.

:::note
Значение `0` означает, что ClickHouse отключает HSTS. Если вы установите положительное значение, HSTS будет включен, а max-age - это число, которое вы установили.
:::

**Пример**

```xml
<hsts_max_age>600000</hsts_max_age>
```
## mlock_executable {#mlock_executable}

Выполнить `mlockall` после старта, чтобы снизить задержку первых запросов и предотвратить выгрузку исполняемого файла ClickHouse при высокой нагрузке на ввод-вывод.

:::note
Включение этой опции рекомендуется, но это приведет к увеличению времени старта до нескольких секунд.
Имейте в виду, что эта настройка не будет работать без возможности "CAP_IPC_LOCK".
:::

**Пример**

```xml
<mlock_executable>false</mlock_executable>
```
## include_from {#include_from}

Путь к файлу с заменами. Поддерживаются как XML, так и YAML форматы.

Для получения дополнительной информации смотрите раздел "[Файлы конфигурации](/operations/configuration-files)".

**Пример**

```xml
<include_from>/etc/metrica.xml</include_from>
```
## interserver_listen_host {#interserver_listen_host}

Ограничение на хосты, которые могут обмениваться данными между серверами ClickHouse. Если используется Keeper, то то же ограничение будет применяться к связи между различными экземплярами Keeper.

:::note
По умолчанию, значение равно настройке [`listen_host`](#listen_host).
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

Если пропущено, оно определяется так же, как команда `hostname -f`.

Полезно для выхода за пределы конкретного сетевого интерфейса.

**Пример**

```xml
<interserver_http_host>example.clickhouse.com</interserver_http_host>
```
## interserver_https_port {#interserver_https_port}

Порт для обмена данными между серверами ClickHouse через `HTTPS`.

**Пример**

```xml
<interserver_https_port>9010</interserver_https_port>
```
## interserver_https_host {#interserver_https_host}

Похоже на [`interserver_http_host`](#interserver_http_host), за исключением того, что это имя хоста может использоваться другими серверами для доступа к этому серверу через `HTTPS`.

**Пример**

```xml
<interserver_https_host>example.clickhouse.com</interserver_https_host>
```
## interserver_http_credentials {#interserver_http_credentials}

Имя пользователя и пароль, используемые для подключения к другим серверам во время [репликации](../../engines/table-engines/mergetree-family/replication.md). Кроме того, сервер аутентифицирует другие реплики с использованием этих учетных данных. `interserver_http_credentials` должен быть одинаковым для всех реплик в кластере.

:::note
- По умолчанию, если раздел `interserver_http_credentials` пропущен, аутентификация не используется во время репликации.
- Настройки `interserver_http_credentials` не относятся к учетным данным клиента ClickHouse [конфигурации](../../interfaces/cli.md#configuration_files).
- Эти учетные данные общие для репликации через `HTTP` и `HTTPS`.
:::

Следующие настройки могут быть настроены с помощью подпараметров:

- `user` — Имя пользователя.
- `password` — Пароль.
- `allow_empty` — Если `true`, то другим репликам разрешается подключаться без аутентификации, даже если учетные данные установлены. Если `false`, то подключения без аутентификации отклоняются. По умолчанию: `false`.
- `old` — Содержит старые `user` и `password`, использованные во время ротации учетных данных. Можно указать несколько секций `old`.

**Ротация учетных данных**

ClickHouse поддерживает динамическую ротацию межсерверных учетных данных без остановки всех реплик одновременно для обновления их конфигурации. Учетные данные можно изменить в несколько этапов.

Чтобы включить аутентификацию, установите `interserver_http_credentials.allow_empty` в `true` и добавьте учетные данные. Это позволяет подключениям как с аутентификацией, так и без нее.

```xml
<interserver_http_credentials>
    <user>admin</user>
    <password>111</password>
    <allow_empty>true</allow_empty>
</interserver_http_credentials>
```

После настройки всех реплик установите `allow_empty` в `false` или удалите эту настройку. Это делает обязательной аутентификацию с новыми учетными данными.

Для изменения существующих учетных данных переместите имя пользователя и пароль в секцию `interserver_http_credentials.old` и обновите `user` и `password` новыми значениями. В этот момент сервер использует новые учетные данные для подключения к другим репликам и принимает подключения с новыми или старыми учетными данными.

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

Когда новые учетные данные применяются ко всем репликам, старые учетные данные могут быть удалены.
## ldap_servers {#ldap_servers}

Список LDAP-серверов с их параметрами подключения, чтобы:
- использовать их в качестве аутентификаторов для выделенных локальных пользователей, у которых механизм аутентификации 'ldap' указан вместо 'password'
- использовать их в качестве удаленных каталогов пользователей.

Следующие настройки могут быть настроены с помощью подпараметров:

| Настройка                       | Описание                                                                                                                                                                                                                                                                                                                                             |
|---------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `host`                          | Имя хоста или IP LDAP-сервера, этот параметр обязателен и не может быть пустым.                                                                                                                                                                                                                                                                       |
| `port`                          | Порт LDAP-сервера, по умолчанию 636, если `enable_tls` установлен в true, 389 иначе.                                                                                                                                                                                                                                                                 |
| `bind_dn`                       | Шаблон, используемый для построения DN для привязки. Результирующий DN будет построен, заменяя все подстроки `\{user_name\}` шаблона на фактическое имя пользователя при каждой попытке аутентификации.                                                                                                                                               |
| `user_dn_detection`             | Раздел с параметрами поиска LDAP для определения фактического DN пользователя, связанного с пользователем. В основном используется в фильтрах поиска для дальнейшего отображения ролей, когда сервер является Active Directory. Результирующий DN пользователя будет использоваться при замене подстрок `\{user_dn\}` везде, где это разрешено. |
| `verification_cooldown`         | Период времени в секундах после успешной попытки привязки, в течение которого будет считаться, что пользователь успешно аутентифицирован для всех последовательных запросов, без обращения к серверу LDAP. Укажите `0` (по умолчанию), чтобы отключить кэширование и заставить связаться с сервером LDAP для каждого запроса аутентификации.         |
| `enable_tls`                    | Флаг для активации использования защищенного соединения с LDAP-сервером. Укажите `no` для протокола в открытом текстовом формате (`ldap://`) (не рекомендуется). Укажите `yes` для протокола LDAP через SSL/TLS (`ldaps://`) (рекомендуется, по умолчанию). Укажите `starttls` для устаревшего протокола StartTLS (протокол в открытом текстовом формате, обновленный до TLS).                       |
| `tls_minimum_protocol_version`  | Минимальная версия протокола SSL/TLS. Приемлемые значения: `ssl2`, `ssl3`, `tls1.0`, `tls1.1`, `tls1.2` (по умолчанию).                                                                                                                                                                                                                              |
| `tls_require_cert`              | Поведение проверки сертификата SSL/TLS. Приемлемые значения: `never`, `allow`, `try`, `demand` (по умолчанию).                                                                                                                                                                                                                                     |
| `tls_cert_file`                 | путь к файлу сертификата.                                                                                                                                                                                                                                                                                                                            |
| `tls_key_file`                  | путь к файлу ключа сертификата.                                                                                                                                                                                                                                                                                                                      |
| `tls_ca_cert_file`              | путь к файлу сертификата CA.                                                                                                                                                                                                                                                                                                                         |
| `tls_ca_cert_dir`               | путь к директории, содержащей сертификаты CA.                                                                                                                                                                                                                                                                                                       |
| `tls_cipher_suite`              | разрешенный набор шифров (в нотации OpenSSL).                                                                                                                                                                                                                                                                                                           |

Настройка `user_dn_detection` может быть настроена с подпараметрами:

| Настройка         | Описание                                                                                                                                                                                                                                                                                                                                   |
|-------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `base_dn`         | шаблон, используемый для построения базового DN для поиска LDAP. Результирующий DN будет построен, заменяя все подстроки `\{user_name\}` и '\{bind_dn\}' шаблона на фактическое имя пользователя и DN привязки во время поиска LDAP.                                                                                                            |
| `scope`           | область поиска LDAP. Приемлемые значения: `base`, `one_level`, `children`, `subtree` (по умолчанию).                                                                                                                                                                                                                                    |
| `search_filter`   | шаблон, используемый для построения фильтра поиска для поиска LDAP. Результирующий фильтр будет построен, заменяя все подстроки `\{user_name\}`, `\{bind_dn\}` и `\{base_dn\}` шаблона на фактическое имя пользователя, DN привязки и базовый DN во время поиска LDAP. Обратите внимание, что специальные символы должны быть правильно экранированы в XML. |

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

Пример (типичный Active Directory с настроенной детекцией DN пользователя для дальнейшего отображения ролей):

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

Ограничение на хосты, с которых могут поступать запросы. Если вы хотите, чтобы сервер отвечал на все запросы, укажите `::`.

Примеры:

```xml
<listen_host>::1</listen_host>
<listen_host>127.0.0.1</listen_host>
```
## listen_try {#listen_try}

Сервер не завершит работу, если сети IPv6 или IPv4 недоступны при попытке прослушивания.

**Пример**

```xml
<listen_try>0</listen_try>
```
## listen_reuse_port {#listen_reuse_port}

Разрешает нескольким серверам прослушивать один и тот же адрес:порт. Запросы будут направляться на случайный сервер операционной системы. Включение этой настройки не рекомендуется.

**Пример**

```xml
<listen_reuse_port>0</listen_reuse_port>
```

Тип:

По умолчанию:
## listen_backlog {#listen_backlog}

Размер очереди ожидающих подключений (backlog) для сокета прослушивания. Значение по умолчанию `4096` такое же, как и у Linux [5.4+](https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git/commit/?id=19f92a030ca6d772ab44b22ee6a01378a8cb32d4)).

Как правило, это значение не нужно изменять, поскольку:
- Значение по умолчанию достаточно велико,
- Для принятия соединений от клиентов у сервера есть отдельный поток.

Таким образом, даже если вы наблюдаете ненулевое значение `TcpExtListenOverflows` (из `nstat`) и этот счетчик увеличивается для сервера ClickHouse, это не означает, что это значение необходимо увеличивать, поскольку:
- Обычно, если `4096` недостаточно, это указывает на какую-то внутреннюю проблему масштабирования ClickHouse, поэтому лучше сообщить об этой проблеме.
- Это не означает, что сервер сможет обработать больше соединений позже (и даже если бы мог, на тот момент клиенты могли бы покинуть или разорвать соединение).

**Пример**

```xml
<listen_backlog>4096</listen_backlog>
```
## logger {#logger}

Расположение и формат лог-сообщений.

**Ключи**:

| Ключ                   | Описание                                                                                                                                                        |
|------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `level`                | Уровень логирования. Допустимые значения: `none` (отключить логирование), `fatal`, `critical`, `error`, `warning`, `notice`, `information`, `debug`, `trace`, `test`                 |
| `log`                  | Путь к лог-файлу.                                                                                                                                          |
| `errorlog`             | Путь к файлу лога ошибок.                                                                                                                                    |
| `size`                 | Политика ротации: максимальный размер лог-файлов в байтах. Как только размер лог-файла превышает этот порог, он переименовывается и архивируется, создается новый лог-файл. |
| `count`                | Политика ротации: сколько исторических лог-файлов Clickhouse сохраняется максимум.                                                                                        |
| `stream_compress`      | Сжимать лог-сообщения с использованием LZ4. Установите `1` или `true`, чтобы включить.                                                                                                   |
| `console`              | Включить логирование в консоль. Установите `1` или `true`, чтобы включить. По умолчанию `1`, если Clickhouse не работает в режиме демона, `0` в противном случае.                            |
| `console_log_level`    | Уровень логирования для вывода в консоль. По умолчанию `level`.                                                                                                                 |
| `formatting.type`      | Формат логов для вывода в консоль. В настоящее время поддерживается только `json`                                                                                                 |
| `use_syslog`           | Также пересылать вывод логов в syslog.                                                                                                                                 |
| `syslog_level`         | Уровень логирования для записи в syslog.                                                                                                                                   |
| `async`                | Когда `true` (по умолчанию) логирование будет происходить асинхронно (один фоновый поток на канал вывода). В противном случае лог будет записываться в потоке, вызывающем LOG           |
| `async_queue_max_size` | При использовании асинхронного логирования максимальное количество сообщений, которые будут храниться в очереди, ожидая очистки. Избыточные сообщения будут отброшены                       |
| `startup_level`        | Уровень запуска используется для установки уровня корневого логгера при запуске сервера. После запуска уровень логирования возвращается к настройке `level`                                   |
| `shutdown_level`       | Уровень завершения используется для установки уровня корневого логгера при завершении работы сервера.                                                                                            |

**Спецификаторы формата лога**

Имена файлов в путях `log` и `errorLog` поддерживают нижеприведенные спецификаторы формата для результирующего имени файла (часть каталога их не поддерживает).

Столбец "Пример" показывает вывод при `2023-07-06 18:32:07`.

| Спецификатор | Описание                                                                                                         | Пример                  |
|--------------|---------------------------------------------------------------------------------------------------------------------|--------------------------|
| `%%`         | Литерал %                                                                                                           | `%`                        |
| `%n`         | Символ новой строки                                                                                                  |                          |
| `%t`         | Символ горизонтальной табуляции                                                                                        |                          |
| `%Y`         | Год в десятичном формате, например, 2017                                                                                 | `2023`                     |
| `%y`         | Последние 2 цифры года в десятичном формате (диапазон [00,99])                                                           | `23`                       |
| `%C`         | Первые 2 цифры года в десятичном формате (диапазон [00,99])                                                          | `20`                       |
| `%G`         | Четырехзначный [год, основанный на неделях ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), т.е. год, который содержит указанную неделю. Обычно полезен только с `%V`  | `2023`       |
| `%g`         | Последние 2 цифры [года, основанного на неделях ISO 8601](https://en.wikipedia.org/wiki/ISO_8601#Week_dates), т.е. год, который содержит указанную неделю.                         | `23`         |
| `%b`         | Сокращенное название месяца, например, Окт (зависит от локали)                                                                 | `Jul`                      |
| `%h`         | Синоним %b                                                                                                       | `Jul`                      |
| `%B`         | Полное название месяца, например, Октябрь (зависит от локали)                                                                    | `July`                     |
| `%m`         | Месяц в десятичном формате (диапазон [01,12])                                                                           | `07`                       |
| `%U`         | Неделя года в десятичном формате (воскресенье - первый день недели) (диапазон [00,53])                          | `27`                       |
| `%W`         | Неделя года в десятичном формате (понедельник - первый день недели) (диапазон [00,53])                          | `27`                       |
| `%V`         | Номер недели по ISO 8601 (диапазон [01,53])                                                                                | `27`                       |
| `%j`         | День года в десятичном формате (диапазон [001,366])                                                               | `187`                      |
| `%d`         | День месяца в виде десятичного числа с заполнением нулями (диапазон [01,31]). Однозначное число предшествует нулю.                 | `06`                       |
| `%e`         | День месяца в виде десятичного числа с заполнением пробелом (диапазон [1,31]). Однозначное число предшествует пробелу.              | `&nbsp; 6`                 |
| `%a`         | Сокращенное название дня недели, например, Пт (зависит от локали)                                                               | `Thu`                      |
| `%A`         | Полное название дня недели, например, Пятница (зависит от локали)                                                                   | `Thursday`                 |
| `%w`         | День недели как целое число, где воскресенье - 0 (диапазон [0-6])                                                          | `4`                        |
| `%u`         | День недели как десятичное число, где понедельник - 1 (формат ISO 8601) (диапазон [1-7])                                      | `4`                        |
| `%H`         | Час в десятичном формате, 24-часовой формат (диапазон [00-23])                                                             | `18`                       |
| `%I`         | Час в десятичном формате, 12-часовой формат (диапазон [01,12])                                                             | `06`                       |
| `%M`         | Минута в десятичном формате (диапазон [00,59])                                                                          | `32`                       |
| `%S`         | Секунда в десятичном формате (диапазон [00,60])                                                                          | `07`                       |
| `%c`         | Стандартная строка даты и времени, например, Sun Oct 17 04:41:13 2010 (зависит от локали)                                     | `Thu Jul  6 18:32:07 2023` |
| `%x`         | Локализованное представление даты (зависит от локали)                                                                    | `07/06/23`                 |
| `%X`         | Локализованное представление времени, например, 18:40:20 или 6:40:20 PM (зависит от локали)                                       | `18:32:07`                 |
| `%D`         | Короткая дата MM/DD/YY, эквивалентная %m/%d/%y                                                                         | `07/06/23`                 |
| `%F`         | Короткая дата YYYY-MM-DD, эквивалентная %Y-%m-%d                                                                       | `2023-07-06`               |
| `%r`         | Локализованное время в 12-часовом формате (зависит от локали)                                                                     | `06:32:07 PM`              |
| `%R`         | Эквивалентно "%H:%M"                                                                                               | `18:32`                    |
| `%T`         | Эквивалентно "%H:%M:%S" (формат времени ISO 8601)                                                                 | `18:32:07`                 |
| `%p`         | Локализованное обозначение a.m. или p.m. (зависит от локали)                                                               | `PM`                       |
| `%z`         | Смещение от UTC в формате ISO 8601 (например, -0430) или отсутствие символов, если информация о временной зоне недоступна | `+0800`                    |
| `%Z`         | Название или аббревиатура временной зоны, зависящая от локали, или отсутствие символов, если информация о временной зоне недоступна     | `Z AWST `                  |

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

Чтобы печатать лог-сообщения только в консоль:

```xml
<logger>
    <level>information</level>
    <console>true</console>
</logger>
```

**Переопределения по уровням**

Уровень логирования отдельных имен логов может быть переопределен. Например, чтобы отключить все сообщения логгеров "Backup" и "RBAC".

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

Чтобы записывать лог-сообщения дополнительно в syslog:

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
|------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `address`  | Адрес syslog в формате `host\[:port\]`. Если не указано, используется локальный демон.                                                                                                                                                                         |
| `hostname` | Имя хоста, с которого отправляются логи (необязательно).                                                                                                                                                                                                      |
| `facility` | Ключевое слово syslog [facility](https://en.wikipedia.org/wiki/Syslog#Facility). Должно быть указано в верхнем регистре с префиксом "LOG_", например, `LOG_USER`, `LOG_DAEMON`, `LOG_LOCAL3` и т.д. По умолчанию: `LOG_USER`, если указан `address`, `LOG_DAEMON` в противном случае.                                           |
| `format`   | Формат лог-сообщения. Возможные значения: `bsd` и `syslog.`                                                                                                                                                                                                       |

**Форматы логов**

Вы можете указать формат лога, который будет выводиться в консоль. В настоящее время поддерживается только JSON.

**Пример**

Вот пример JSON лога на выводе:

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

Чтобы включить поддержку JSON логирования, используйте следующий фрагмент:

```xml
<logger>
    <formatting>
        <type>json</type>
        <!-- Can be configured on a per-channel basis (log, errorlog, console, syslog), or globally for all channels (then just omit it). -->
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

**Переименование ключей для JSON логов**

Имена ключей могут быть изменены путем изменения значений тегов внутри тега `<names>`. Например, чтобы изменить `DATE_TIME` на `MY_DATE_TIME`, используйте `<date_time>MY_DATE_TIME</date_time>`.

**Пропуск ключей для JSON логов**

Свойства лога могут быть пропущены путем комментирования свойства. Например, если вы не хотите, чтобы ваш лог печатал `query_id`, вы можете закомментировать тег `<query_id>`.
## send_crash_reports {#send_crash_reports}

Настройки для отправки отчетов о сбоях команде разработчиков ClickHouse.

Включение этой опции, особенно в предрелизных средах, очень приветствуется.

Ключи:

| Ключ                   | Описание                                                                                                                          |
|-----------------------|--------------------------------------------------------------------------------------------------------------------------------------|
| `enabled`             | Булев флаг для включения функции, по умолчанию `true`. Установите в `false`, чтобы избежать отправки отчетов о сбоях.                                |
| `send_logical_errors` | `LOGICAL_ERROR` похож на `assert`, это ошибка в ClickHouse. Этот булев флаг включает отправку этих исключений (по умолчанию: `true`). |
| `endpoint`            | Вы можете переопределить URL-адрес конечной точки для отправки отчетов о сбоях.                                                                         |

**Рекомендуемое использование**

```xml
<send_crash_reports>
    <enabled>true</enabled>
</send_crash_reports>
```
## ssh_server {#ssh_server}

Публичная часть ключа хоста будет записана в файл known_hosts на стороне SSH-клиента при первом подключении.

Конфигурации ключа хоста по умолчанию неактивны. Раскомментируйте конфигурации ключа хоста и укажите путь к соответствующему ssh ключу, чтобы активировать их:

Пример:

```xml
<ssh_server>
    <host_rsa_key>path_to_the_ssh_key</host_rsa_key>
    <host_ecdsa_key>path_to_the_ssh_key</host_ecdsa_key>
    <host_ed25519_key>path_to_the_ssh_key</host_ed25519_key>
</ssh_server>
```
## tcp_ssh_port {#tcp_ssh_port}

Порт для SSH-сервера, который позволяет пользователю подключаться и выполнять запросы в интерактивном режиме с помощью встроенного клиента через PTY.

Пример:

```xml
<tcp_ssh_port>9022</tcp_ssh_port>
```
## storage_configuration {#storage_configuration}

Позволяет выполнить конфигурацию хранилища для нескольких дисков.

Конфигурация хранилища следует структуре:

```xml
<storage_configuration>
    <disks>
        <!-- configuration -->
    </disks>
    <policies>
        <!-- configuration -->
    </policies>
</storage_configuration>
```
### Конфигурация дисков {#configuration-of-disks}

Конфигурация `disks` следует структуре, приведенной ниже:

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

| Настройка                | Описание                                                                                           |
|-------------------------|-------------------------------------------------------------------------------------------------------|
| `<disk_name_N>`         | Имя диска, которое должно быть уникальным.                                                         |
| `path`                  | Путь, по которому будут храниться данные сервера (каталоги `data` и `shadow`). Должен заканчиваться на `/` |
| `keep_free_space_bytes` | Размер зарезервированного свободного пространства на диске.                                                              |

:::note
Порядок дисков не имеет значения.
:::
### Конфигурация политик {#configuration-of-policies}

Подтеги выше определяют следующие настройки для `policies`:

| Настройка                      | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `policy_name_N`              | Имя политики. Имена политик должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `volume_name_N`              | Имя объема. Имена объемов должны быть уникальными.                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `disk`                       | Диск, находящийся внутри объема.                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `max_data_part_size_bytes`   | Максимальный размер блока данных, который может находиться на любом из дисков в этом объеме. Если результат объединения приводит к тому, что размер блока ожидается больше max_data_part_size_bytes, блок будет записан в следующий объем. В основном, эта функция позволяет вам хранить новые / маленькие блоки на горячем (SSD) объеме и перемещать их в холодный (HDD) объем, когда они достигнут большого размера. Не используйте эту опцию, если у политики есть только один объем.                                                                 |
| `move_factor`                | Доля доступного свободного места на объеме. Если пространство становится меньше, данные начнут передаваться на следующий объем, если он есть. Для передачи блоки сортируются по размеру от большего к меньшему (по убыванию), и выбираются блоки, общий размер которых достаточно для выполнения условия `move_factor`, если общий размер всех блоков недостаточен, все блоки будут перемещены.                                                                                                             |
| `perform_ttl_move_on_insert` | Отключает перемещение данных с истекшим TTL при вставке. По умолчанию (если включено), если мы вставляем фрагмент данных, который уже истек в соответствии с правилом перемещения по времени жизни, он немедленно перемещается на объем / диск, указанный в правиле перемещения. Это может значительно замедлить вставку в случае, если целевой объем / диск медленный (например, S3). Если отключено, истекшая часть данных записывается в основной объем, а затем немедленно перемещается на объем, указанный в правиле для истекшего TTL. |
| `load_balancing`             | Политика балансировки дисков, `round_robin` или `least_used`.                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `least_used_ttl_ms`          | Устанавливает таймаут (в миллисекундах) для обновления доступного места на всех дисках (`0` - всегда обновлять, `-1` - никогда не обновлять, значение по умолчанию `60000`). Обратите внимание, если диск используется только ClickHouse и не будет подвергаться изменению файловой системы на лету, вы можете использовать значение `-1`. Во всех остальных случаях это не рекомендуется, так как это в конечном итоге приведет к некорректному распределению пространства.                                                                                                                   |
| `prefer_not_to_merge`        | Отключает слияние частей данных на этом объеме. Примечание: это потенциально опасно и может вызвать замедление. Когда эта настройка включена (не делайте этого), слияние данных на этом объеме запрещено (что плохо). Это позволяет контролировать, как ClickHouse взаимодействует с медленными дисками. Рекомендуем вообще не использовать это.                                                                                                                                                                                       |
| `volume_priority`            | Определяет приоритет (порядок) заполнения объемов. Чем меньше значение, тем выше приоритет. Значения параметров должны быть натуральными числами и охватывать диапазон от 1 до N (N - наибольшее значение параметра, указанное) без промежутков.                                                                                                                                                                                                                                                                |

Для `volume_priority`:
- Если все объемы имеют этот параметр, они приоритизируются в указанном порядке.
- Если только _некоторые_ объемы имеют его, объемы, у которых его нет, имеют самый низкий приоритет. Те, у кого он есть, приоритизируются согласно значению тега, приоритет остальных определяется порядком описания в конфигурационном файле относительно друг друга.
- Если _никакие_ объемы не имеют этого параметра, их порядок определяется порядком описания в конфигурационном файле.
- Приоритет объемов может быть не идентичным.
## macros {#macros}

Замены параметров для реплицированных таблиц.

Может быть пропущено, если реплицированные таблицы не используются.

Для получения дополнительной информации смотрите раздел [Создание реплицированных таблиц](../../engines/table-engines/mergetree-family/replication.md#creating-replicated-tables).

**Пример**

```xml
<macros incl="macros" optional="true" />
```
## replica_group_name {#replica_group_name}

Имя группы реплик для базы данных Replicated.

Кластер, созданный реплицированной базой данных, будет состоять из реплик в одной и той же группе.
DDL-запросы будут ждать только реплик в одной и той же группе.

По умолчанию пусто.

**Пример**

```xml
<replica_group_name>backups</replica_group_name>
```
## remap_executable {#remap_executable}

Настройка для перераспределения памяти для машинного кода ("текст") с использованием больших страниц.

:::note
Эта функция является крайне экспериментальной.
:::

Пример:

```xml
<remap_executable>false</remap_executable>
```
## max_open_files {#max_open_files}

Максимальное количество открытых файлов.

:::note
Рекомендуем использовать эту опцию в macOS, так как функция `getrlimit()` возвращает некорректное значение.
:::

**Пример**

```xml
<max_open_files>262144</max_open_files>
```
## max_session_timeout {#max_session_timeout}

Максимальный тайм-аут сессии, в секундах.

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

По умолчанию отключено.

**Включение**

Чтобы вручную включить сбор истории метрик [`system.metric_log`](../../operations/system-tables/metric_log.md), создайте `/etc/clickhouse-server/config.d/metric_log.xml` с следующим содержимым:

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

Чтобы отключить настройку `metric_log`, создайте следующий файл `/etc/clickhouse-server/config.d/disable_metric_log.xml` с следующими содержимым:

```xml
<clickhouse>
    <metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
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

Поддержка SSL обеспечивается библиотекой `libpoco`. Доступные параметры конфигурации объяснены в [SSLManager.h](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/SSLManager.h). Значения по умолчанию можно найти в [SSLManager.cpp](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/src/SSLManager.cpp).

Ключи для настроек сервера/клиента:

| Option                        | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Default Value                              |
|-------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------------|
| `privateKeyFile`              | Путь к файлу с секретным ключом PEM-сертификата. Файл может содержать как ключ, так и сертификат одновременно.                                                                                                                                                                                                                                                                                                                                              |                                            |
| `certificateFile`             | Путь к файлу клиентского/серверного сертификата в формате PEM. Его можно опустить, если `privateKeyFile` содержит сертификат.                                                                                                                                                                                                                                                                                                                                                |                                            |
| `caConfig`                    | Путь к файлу или каталогу, который содержит доверенные CA сертификаты. Если это указывает на файл, он должен быть в формате PEM и может содержать несколько CA сертификатов. Если указывает на каталог, он должен содержать один .pem файл на каждый CA сертификат. Имена файлов ищутся по хешу имени субъекта CA. Подробности можно найти в мануале [SSL_CTX_load_verify_locations](https://www.openssl.org/docs/man3.0/man3/SSL_CTX_load_verify_locations.html). |                                            |
| `verificationMode`            | Метод проверки сертификатов узла. Подробности описаны в описании класса [Context](https://github.com/ClickHouse-Extras/poco/blob/master/NetSSL_OpenSSL/include/Poco/Net/Context.h). Возможные значения: `none`, `relaxed`, `strict`, `once`.                                                                                                                                                                                                         | `relaxed`                                  |
| `verificationDepth`           | Максимальная длина цепочки проверки. Проверка не пройдет, если длина цепочки сертификатов превышает установленное значение.                                                                                                                                                                                                                                                                                                                                            | `9`                                        |
| `loadDefaultCAFile`           | Используются ли встроенные CA сертификаты для OpenSSL. ClickHouse предполагает, что встроенные CA сертификаты находятся в файле `/etc/ssl/cert.pem` (или в каталоге `/etc/ssl/certs`) или в файле (или каталоге), указанном в переменной окружения `SSL_CERT_FILE` (или `SSL_CERT_DIR`).                                                                                                                                                                        | `true`                                     |
| `cipherList`                  | Поддерживаемые шифры OpenSSL.                                                                                                                                                                                                                                                                                                                                                                                                                                         | `ALL:!ADH:!LOW:!EXP:!MD5:!3DES:@STRENGTH`  |
| `cacheSessions`               | Включает или отключает кэширование сессий. Должен использоваться в сочетании с `sessionIdContext`. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                         | `false`                                    |
| `sessionIdContext`            | Уникальный набор случайных символов, который сервер добавляет к каждому сгенерированному идентификатору. Длина строки не должна превышать `SSL_MAX_SSL_SESSION_ID_LENGTH`. Этот параметр всегда рекомендуется, так как он помогает избежать проблем как в случае кэширования сессии сервером, так и если клиент запросил кэширование.                                                                                                                                                        | `$\{application.name\}`                      |
| `sessionCacheSize`            | Максимальное количество сессий, которые сервер кэширует. Значение `0` означает неограниченное количество сессий.                                                                                                                                                                                                                                                                                                                                                                        | [1024\*20](https://github.com/ClickHouse/boringssl/blob/master/include/openssl/ssl.h#L1978)                            |
| `sessionTimeout`              | Время кэширования сессии на сервере в часах.                                                                                                                                                                                                                                                                                                                                                                                                                   | `2`                                        |
| `extendedVerification`        | Если включено, проверяет, что CN или SAN сертификата совпадает с именем узла партнера.                                                                                                                                                                                                                                                                                                                                                                                           | `false`                                    |
| `requireTLSv1`                | Требуется ли соединение TLSv1. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                        | `false`                                    |
| `requireTLSv1_1`              | Требуется ли соединение TLSv1.1. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                    |
| `requireTLSv1_2`              | Требуется ли соединение TLSv1.2. Приемлемые значения: `true`, `false`.                                                                                                                                                                                                                                                                                                                                                                                                      | `false`                                    |
| `fips`                        | Активирует режим FIPS OpenSSL. Поддерживается, если версия OpenSSL библиотеки поддерживает FIPS.                                                                                                                                                                                                                                                                                                                                                                                 | `false`                                    |
| `privateKeyPassphraseHandler` | Класс (подкласс PrivateKeyPassphraseHandler), который запрашивает пароль для доступа к закрытому ключу. Например: `<privateKeyPassphraseHandler>`, `<name>KeyFileHandler</name>`, `<options><password>test</password></options>`, `</privateKeyPassphraseHandler>`.                                                                                                                                                                                                | `KeyConsoleHandler`                        |
| `invalidCertificateHandler`   | Класс (подкласс CertificateHandler) для проверки недействительных сертификатов. Например: `<invalidCertificateHandler> <name>RejectCertificateHandler</name> </invalidCertificateHandler>` .                                                                                                                                                                                                                                                                           | `RejectCertificateHandler`                 |
| `disableProtocols`            | Протоколы, использование которых не разрешено.                                                                                                                                                                                                                                                                                                                                                                                                                             |                                            |
| `preferServerCiphers`         | Предпочитаемые шифры сервера клиентом.                                                                                                                                                                                                                                                                                                                                                                                                                                       | `false`                                    |

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
        <!-- Use for self-signed: <verificationMode>none</verificationMode> -->
        <invalidCertificateHandler>
            <!-- Use for self-signed: <name>AcceptCertificateHandler</name> -->
            <name>RejectCertificateHandler</name>
        </invalidCertificateHandler>
    </client>
</openSSL>
```
## part_log {#part_log}

Логирование событий, связанных с [MergeTree](../../engines/table-engines/mergetree-family/mergetree.md). Например, добавление или слияние данных. Вы можете использовать лог для симуляции алгоритмов слияния и сравнения их характеристик. Вы можете визуализировать процесс слияния.

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

Путь к директории, содержащей данные.

:::note
Косая черта в конце обязательна.
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

- `endpoint` – HTTP конечная точка для сбора метрик сервером prometheus. Начинается с '/'.
- `port` – Порт для `endpoint`.
- `metrics` – Экспонирование метрик из таблицы [system.metrics](/operations/system-tables/metrics).
- `events` – Экспонирование метрик из таблицы [system.events](/operations/system-tables/events).
- `asynchronous_metrics` – Экспонирование текущих значений метрик из таблицы [system.asynchronous_metrics](/operations/system-tables/asynchronous_metrics).
- `errors` - Экспонирование количества ошибок по кодам ошибок, произошедших с момента последнего перезапуска сервера. Эта информация также может быть получена из таблицы [system.errors](/operations/system-tables/errors).

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

Настройка для регистрации запросов, полученных с настройкой [log_queries=1](../../operations/settings/settings.md).

Запросы регистрируются в таблице [system.query_log](/operations/system-tables/query_log), а не в отдельном файле. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

Если таблица не существует, ClickHouse создаст ее. Если структура журнала запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой будет переименована, и новая таблица будет создана автоматически.

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

По умолчанию отключена.

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

Чтобы отключить настройку `query_metric_log`, вы должны создать следующий файл `/etc/clickhouse-server/config.d/disable_query_metric_log.xml` со следующим содержимым:

```xml
<clickhouse>
    <query_metric_log remove="1" />
</clickhouse>
```

<SystemLogParameters/>
## query_cache {#query_cache}

Конфигурация [кэша запросов](../query-cache.md).

Доступные настройки:

| Setting                   | Description                                                                            | Default Value |
|---------------------------|----------------------------------------------------------------------------------------|---------------|
| `max_size_in_bytes`       | Максимальный размер кэша в байтах. `0` означает, что кэш запросов отключен.                | `1073741824`  |
| `max_entries`             | Максимальное количество результатов запросов `SELECT`, хранящихся в кэше.                      | `1024`        |
| `max_entry_size_in_bytes` | Максимальный размер в байтах результатов запросов `SELECT`, которые могут быть сохранены в кэше.    | `1048576`     |
| `max_entry_size_in_rows`  | Максимальное количество строк результатов запросов `SELECT`, которые могут быть сохранены в кэше.   | `30000000`    |

:::note
- Измененные настройки вступают в силу немедленно.
- Данные для кэша запросов выделяются в DRAM. Если память ограничена, убедитесь, что установили небольшое значение для `max_size_in_bytes` или полностью отключите кэш запросов.
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

Настройка для регистрации потоков запросов, полученных с настройкой [log_query_threads=1](/operations/settings/settings#log_query_threads).

Запросы регистрируются в таблице [system.query_thread_log](/operations/system-tables/query_thread_log), а не в отдельном файле. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

Если таблица не существует, ClickHouse создаст ее. Если структура журнала потоков запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой будет переименована, и новая таблица будет создана автоматически.

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

Настройка для регистрации представлений (live, материализованные и др.), зависимых от запросов, полученных с настройкой [log_query_views=1](/operations/settings/settings#log_query_views).

Запросы регистрируются в таблице [system.query_views_log](/operations/system-tables/query_views_log), а не в отдельном файле. Вы можете изменить имя таблицы в параметре `table` (см. ниже).

<SystemLogParameters/>

Если таблица не существует, ClickHouse создаст ее. Если структура журнала представлений запросов изменилась при обновлении сервера ClickHouse, таблица со старой структурой будет переименована, и новая таблица будет создана автоматически.

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

Настройки для системной таблицы [text_log](/operations/system-tables/text_log) для регистрации текстовых сообщений.

<SystemLogParameters/>

Дополнительно:

| Setting | Description                                                                                                                                                                                                 | Default Value       |
|---------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------|
| `level` | Максимальный уровень сообщения (по умолчанию `Trace`), который будет храниться в таблице.                                                                                                                                 | `Trace`             |

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

Настройки для системной таблицы [crash_log](../../operations/system-tables/crash_log.md) операции.

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
Путь настройки кэширования файловой системы должен находиться внутри этого каталога,
в противном случае будет выброшено исключение, предотвращающее создание диска.

:::note
Это не повлияет на диски, созданные на более старой версии, для которой сервер был обновлен.
В этом случае исключение не будет выброшено, чтобы позволить серверу успешно запуститься.
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
## blob_storage_log {#blob_storage_log}

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

Правила на основе Regexp, которые будут применяться к запросам, а также ко всем сообщениям журнала перед их сохранением в системных журналах,
[`system.query_log`](/operations/system-tables/query_log), [`system.text_log`](/operations/system-tables/text_log), [`system.processes`](/operations/system-tables/processes) и в журналах, отправленных клиенту. Это позволяет предотвратить
утечку конфиденциальных данных из SQL-запросов, таких как имена, электронные письма, личные идентификаторы или номера кредитных карт в журналы.

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

| Setting   | Description                                                                   |
|-----------|-------------------------------------------------------------------------------|
| `name`    | имя правила (необязательно)                                                  |
| `regexp`  | Регулярное выражение, совместимое с RE2 (обязательно)                                 |
| `replace` | строка подстановки для конфиденциальных данных (необязательно, по умолчанию - шесть звездочек) |

Правила маскировки применяются ко всему запросу (чтобы предотвратить утечки конфиденциальных данных из неверно сформулированных / неразборчивых запросов).

Таблица [`system.events`](/operations/system-tables/events) имеет счетчик `QueryMaskingRulesMatch`, который показывает общее количество совпадений правил маскировки запросов.

Для распределенных запросов каждый сервер должен быть настроен отдельно, в противном случае подзапросы, переданные другим
узлам, будут храниться без маскировки.
## remote_servers {#remote_servers}

Конфигурация кластеров, используемых движком таблиц [Distributed](../../engines/table-engines/special/distributed.md) и функцией таблицы `cluster`.

**Пример**

```xml
<remote_servers incl="clickhouse_remote_servers" />
```

Для значения атрибута `incl` смотрите раздел "[Файлы конфигурации](/operations/configuration-files)".

**См. Также**

- [skip_unavailable_shards](../../operations/settings/settings.md#skip_unavailable_shards)
- [Cluster Discovery](../../operations/cluster-discovery.md)
- [Replicated database engine](../../engines/database-engines/replicated.md)
## remote_url_allow_hosts {#remote_url_allow_hosts}

Список хостов, которые могут быть использованы в хранилищах, связанных с URL, и таблицах функций.

При добавлении хоста с помощью тега xml `\<host\>`:
- он должен быть указан точно так же, как в URL, так как имя проверяется перед разрешением DNS. Например: `<host>clickhouse.com</host>`
- если порт явно указан в URL, тогда проверяется host:port в целом. Например: `<host>clickhouse.com:80</host>`
- если хост указан без порта, то разрешены любые порты хоста. Например: если указан `<host>clickhouse.com</host>`, то разрешены `clickhouse.com:20` (FTP), `clickhouse.com:80` (HTTP), `clickhouse.com:443` (HTTPS) и т.д.
- если хост указан как IP-адрес, то он проверяется так, как указано в URL. Например: `[2a02:6b8:a::a]`.
- если есть редиректы и поддержка редиректов включена, то каждый редирект (поле location) проверяется.

Например:

```sql
<remote_url_allow_hosts>
    <host>clickhouse.com</host>
</remote_url_allow_hosts>
```
## timezone {#timezone}

Часовой пояс сервера.

Указывается как идентификатор IANA для часового пояса UTC или географического местоположения (например, Africa/Abidjan).

Часовой пояс необходим для преобразований между строковыми и DateTime форматами, когда поля DateTime выводятся в текстовом формате (выводятся на экран или в файл), и при получении DateTime из строки. Кроме того, часовой пояс используется в функциях, которые работают с временем и датой, если они не получили часовой пояс во входных параметрах.

**Пример**

```xml
<timezone>Asia/Istanbul</timezone>
```

**См. также**

- [session_timezone](../settings/settings.md#session_timezone)
## tcp_port {#tcp_port}

Порт для общения с клиентами по протоколу TCP.

**Пример**

```xml
<tcp_port>9000</tcp_port>
```
## tcp_port_secure {#tcp_port_secure}

TCP порт для защищенного общения с клиентами. Используйте его с настройками [OpenSSL](#openssl).

**Значение по умолчанию**

```xml
<tcp_port_secure>9440</tcp_port_secure>
```
## mysql_port {#mysql_port}

Порт для общения с клиентами по протоколу MySQL.

:::note
- Положительные целые числа указывают номер порта для прослушивания
- Пустые значения используются для отключения общения с клиентами по протоколу MySQL.
:::

**Пример**

```xml
<mysql_port>9004</mysql_port>
```
## postgresql_port {#postgresql_port}

Порт для общения с клиентами по протоколу PostgreSQL.

:::note
- Положительные целые числа указывают номер порта для прослушивания
- Пустые значения используются для отключения общения с клиентами по протоколу PostgreSQL.
:::

**Пример**

```xml
<postgresql_port>9005</postgresql_port>
```
## mysql_require_secure_transport {#mysql_require_secure_transport}

Если установлено в true, требуется защищенное общение с клиентами по [mysql_port](#mysql_port). Соединение с опцией `--ssl-mode=none` будет отклонено. Используйте его с настройками [OpenSSL](#openssl).
## postgresql_require_secure_transport {#postgresql_require_secure_transport}

Если установлено в true, требуется защищенное общение с клиентами по [postgresql_port](#postgresql_port). Соединение с опцией `sslmode=disable` будет отклонено. Используйте его с настройками [OpenSSL](#openssl).
## tmp_path {#tmp_path}

Путь на локальной файловой системе для хранения временных данных для обработки больших запросов.

:::note
- Можно использовать только один параметр для настройки хранения временных данных: `tmp_path`, `tmp_policy`, `temporary_data_in_cache`.
- Косая черта в конце обязательна.
:::

**Пример**

```xml
<tmp_path>/var/lib/clickhouse/tmp/</tmp_path>
```
## url_scheme_mappers {#url_scheme_mappers}

Конфигурация для преобразования сокращенных или символических префиксов URL в полные URL.

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

Тип:

Значение по умолчанию:
## user_defined_path {#user_defined_path}

Каталог с пользовательскими файлами. Используется для пользовательских функций SQL [Пользовательские функции SQL](/sql-reference/functions/udf).

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

Настройки для необязательных улучшений в системе контроля доступа.

| Настройка                                        | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | По умолчанию |
|-------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------|
| `users_without_row_policies_can_read_rows`      | Устанавливает, могут ли пользователи без разрешающих политик строк все равно читать строки с помощью запроса `SELECT`. Например, если существуют два пользователя A и B, а политика строк определена только для A, то, если эта настройка истинна, пользователь B увидит все строки. Если эта настройка ложна, пользователь B не увидит ни одной строки.                                                                                                                                                                    | `true`       |
| `on_cluster_queries_require_cluster_grant`      | Устанавливает, требуют ли запросы `ON CLUSTER` разрешение `CLUSTER`.                                                                                                                                                                                                                                                                                                                                                                                                                                           | `true`       |
| `select_from_system_db_requires_grant`          | Устанавливает, требует ли `SELECT * FROM system.<table>` каких-либо разрешений и может быть выполнен любым пользователем. Если установлено в true, то этот запрос требует `GRANT SELECT ON system.<table>`, так же как и для не системных таблиц. Исключения: несколько системных таблиц (`tables`, `columns`, `databases` и некоторые постоянные таблицы, такие как `one`, `contributors`) все еще доступны для всех; и если есть привилегия `SHOW` (например, `SHOW USERS`), то соответствующая системная таблица (т.е. `system.users`) будет доступна. | `true`       |
| `select_from_information_schema_requires_grant` | Устанавливает, требует ли `SELECT * FROM information_schema.<table>` каких-либо разрешений и может быть выполнен любым пользователем. Если установлено в true, то этот запрос требует `GRANT SELECT ON information_schema.<table>`, так же как и для обычных таблиц.                                                                                                                                                                                                                                               | `true`       |
| `settings_constraints_replace_previous`         | Устанавливает, будет ли ограничение в профиле настроек для некоторой настройки отменять действия предыдущего ограничения (определенного в других профилях) для этой настройки, включая поля, которые не установлены новым ограничением. Также включает тип ограничения `changeable_in_readonly`.                                                                                                                                                                                | `true`       |
| `table_engines_require_grant`                   | Устанавливает, требуется ли разрешение для создания таблицы с определенным движком таблицы.                                                                                                                                                                                                                                                                                                                                                                                                                   | `false`      |
| `role_cache_expiration_time_seconds`            | Устанавливает количество секунд с момента последнего доступа, в течение которых роль хранится в кэше ролей.                                                                                                                                                                                                                                                                                                                                                                                                 | `600`        |

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
## dead_letter_queue {#dead_letter_queue}

Настройки для системной таблицы 'dead_letter_queue'.

<SystemLogParameters/>

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

Содержит настройки, которые позволяют ClickHouse взаимодействовать с кластером [ZooKeeper](http://zookeeper.apache.org/). ClickHouse использует ZooKeeper для хранения метаданных реплик при использовании реплицированных таблиц. Если реплицированные таблицы не используются, этот раздел параметров можно опустить.

Следующие настройки могут быть настроены с помощью под-тегов:

| Настройка                                   | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
|---------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `node`                                      | Точка доступа ZooKeeper. Вы можете задать несколько точек доступа. Например, `<node index="1"><host>example_host</host><port>2181</port></node>`. Атрибут `index` указывает порядок узлов при попытке подключения к кластеру ZooKeeper.                                                                                                                                                                                                                                                                                    |
| `session_timeout_ms`                        | Максимальный тайм-аут для клиентской сессии в миллисекундах.                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `operation_timeout_ms`                      | Максимальный тайм-аут для одной операции в миллисекундах.                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `root` (опционально)                        | znode, который используется как корень для znodes, используемых сервером ClickHouse.                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| `fallback_session_lifetime.min` (опционально) | Минимальный лимит для срока службы сессии ZooKeeper на резервном узле, когда основной недоступен (балансировка нагрузки). Устанавливается в секундах. По умолчанию: 3 часа.                                                                                                                                                                                                                                                                                                                                        |
| `fallback_session_lifetime.max` (опционально) | Максимальный лимит для срока службы сессии ZooKeeper на резервном узле, когда основной недоступен (балансировка нагрузки). Устанавливается в секундах. По умолчанию: 6 часов.                                                                                                                                                                                                                                                                                                                                        |
| `identity` (опционально)                   | Пользователь и пароль, требуемые ZooKeeper для доступа к запрашиваемым znodes.                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `use_compression` (опционально)            | Включает сжатие в протоколе Keeper, если установлено в true.                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

Существует также настройка `zookeeper_load_balancing` (опционально), которая позволяет выбрать алгоритм для выбора узлов ZooKeeper:

| Название алгоритма                   | Описание                                                                                                                    |
|--------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| `random`                            | случайным образом выбирает один из узлов ZooKeeper.                                                                       |
| `in_order`                          | выбирает первый узел ZooKeeper, если он недоступен, то второй, и так далее.                                               |
| `nearest_hostname`                  | выбирает узел ZooKeeper с именем хоста, наиболее схожим с именем хоста сервера, имя хоста сравнивается с префиксом имени. |
| `hostname_levenshtein_distance`     | так же, как nearest_hostname, но сравнивает имя хоста по методу расстояния Левенштейна.                                   |
| `first_or_random`                   | выбирает первый узел ZooKeeper, если он недоступен, то случайным образом выбирает один из оставшихся узлов ZooKeeper.     |
| `round_robin`                       | выбирает первый узел ZooKeeper, если происходит повторное подключение, выбирает следующий.                                 |

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
    <!-- Optional. Chroot suffix. Should exist. -->
    <root>/path/to/zookeeper/node</root>
    <!-- Optional. Zookeeper digest ACL string. -->
    <identity>user:password</identity>
    <!--<zookeeper_load_balancing>random / in_order / nearest_hostname / hostname_levenshtein_distance / first_or_random / round_robin</zookeeper_load_balancing>-->
    <zookeeper_load_balancing>random</zookeeper_load_balancing>
</zookeeper>
```

**Смотрите также**

- [Репликация](../../engines/table-engines/mergetree-family/replication.md)
- [Руководство программиста ZooKeeper](http://zookeeper.apache.org/doc/current/zookeeperProgrammers.html)
- [Необязательная защищенная связь между ClickHouse и Zookeeper](/operations/ssl-zookeeper)
## use_minimalistic_part_header_in_zookeeper {#use_minimalistic_part_header_in_zookeeper}

Метод хранения заголовков данных в ZooKeeper. Эта настройка применяется только к семейству [`MergeTree`](/engines/table-engines/mergetree-family). Ее можно указать:

**Глобально в разделе [merge_tree](#merge_tree) файла `config.xml`**

ClickHouse использует настройку для всех таблиц на сервере. Вы можете изменить настройку в любое время. Существующие таблицы изменяют свое поведение, когда настройка меняется.

**Для каждой таблицы**

При создании таблицы укажите соответствующую [настройку движка](../../engines/table-engines/mergetree-family/mergetree.md#table_engine-mergetree-creating-a-table). Поведение существующей таблицы с этой настройкой не меняется, даже если глобальная настройка изменяется.

**Возможные значения**

- `0` — Функциональность отключена.
- `1` — Функциональность включена.

Если [`use_minimalistic_part_header_in_zookeeper = 1`](#use_minimalistic_part_header_in_zookeeper), то [реплицированные](../../engines/table-engines/mergetree-family/replication.md) таблицы компактно хранят заголовки частей данных, используя один `znode`. Если таблица содержит много колонок, то этот метод хранения значительно сокращает объем данных, хранимых в ZooKeeper.

:::note
После применения `use_minimalistic_part_header_in_zookeeper = 1` вы не сможете понизить сервер ClickHouse до версии, которая не поддерживает эту настройку. Будьте осторожны при обновлении ClickHouse на серверах в кластере. Не обновляйте все серверы одновременно. Безопаснее тестировать новые версии ClickHouse в тестовой среде или только на нескольких серверах кластера.

Заголовки частей данных, уже сохраненные с этой настройкой, не могут быть восстановлены в их предыдущее (не компактное) представление.
:::
## distributed_ddl {#distributed_ddl}

Управление выполнением [распределенных ddl запросов](../../sql-reference/distributed-ddl.md) (`CREATE`, `DROP`, `ALTER`, `RENAME`) в кластере. Работает только если [ZooKeeper](/operations/server-configuration-parameters/settings#zookeeper) включен.

Настройки, которые можно настроить внутри `<distributed_ddl>`, включают:

| Настройка             | Описание                                                                                                                       | Значение по умолчанию               |
|-----------------------|-------------------------------------------------------------------------------------------------------------------------------|-------------------------------------|
| `path`                | путь в Keeper для `task_queue` для DDL запросов                                                                              |                                     |
| `profile`             | профиль, используемый для выполнения DDL запросов                                                                            |                                     |
| `pool_size`           | сколько запросов `ON CLUSTER` может быть выполнено одновременно                                                              |                                     |
| `max_tasks_in_queue`  | максимальное количество задач, которые могут находиться в очереди.                                                           | `1,000`                             |
| `task_max_lifetime`   | удалить узел, если его возраст больше этого значения.                                                                        | `7 * 24 * 60 * 60` (неделя в секундах) |
| `cleanup_delay_period`| очистка начинается после получения нового события узла, если последняя очистка не была выполнена раньше, чем `cleanup_delay_period` секунд назад. | `60` секунд                         |

**Пример**

```xml
<distributed_ddl>
    <!-- Path in ZooKeeper to queue with DDL queries -->
    <path>/clickhouse/task_queue/ddl</path>

    <!-- Settings from this profile will be used to execute DDL queries -->
    <profile>default</profile>

    <!-- Controls how much ON CLUSTER queries can be run simultaneously. -->
    <pool_size>1</pool_size>

    <!--
         Cleanup settings (active tasks will not be removed)
    -->

    <!-- Controls task TTL (default 1 week) -->
    <task_max_lifetime>604800</task_max_lifetime>

    <!-- Controls how often cleanup should be performed (in seconds) -->
    <cleanup_delay_period>60</cleanup_delay_period>

    <!-- Controls how many tasks could be in the queue -->
    <max_tasks_in_queue>1000</max_tasks_in_queue>
</distributed_ddl>
```
## access_control_path {#access_control_path}

Путь к папке, где сервер ClickHouse хранит конфигурации пользователей и ролей, созданные SQL командами.

**Смотрите также**

- [Контроль доступа и управление учетными записями](/operations/access-rights#access-control-usage)
## allow_plaintext_password {#allow_plaintext_password}

Устанавливает, разрешены ли типы паролей в открытом виде (несанкционированные) или нет.

```xml
<allow_plaintext_password>1</allow_plaintext_password>
```
## allow_no_password {#allow_no_password}

Устанавливает, разрешен ли несекретный тип пароля no_password или нет.

```xml
<allow_no_password>1</allow_no_password>
```
## allow_implicit_no_password {#allow_implicit_no_password}

Запрещает создание пользователя без пароля, если не указано явно 'IDENTIFIED WITH no_password'.

```xml
<allow_implicit_no_password>1</allow_implicit_no_password>
```
## default_session_timeout {#default_session_timeout}

Сессия времени ожидания по умолчанию, в секундах.

```xml
<default_session_timeout>60</default_session_timeout>
```
## default_password_type {#default_password_type}

Устанавливает тип пароля, который автоматически устанавливается для запросов, таких как `CREATE USER u IDENTIFIED BY 'p'`.

Допустимые значения:
- `plaintext_password`
- `sha256_password`
- `double_sha1_password`
- `bcrypt_password`

```xml
<default_password_type>sha256_password</default_password_type>
```
## user_directories {#user_directories}

Раздел файла конфигурации, который содержит настройки:
- Путь к файлу конфигурации с заранее определенными пользователями.
- Путь к папке, где хранятся пользователи, созданные SQL командами.
- Путь узла ZooKeeper, где хранятся и реплицируются пользователи, созданные SQL командами (экспериментально).

Если этот раздел указан, путь из [users_config](/operations/server-configuration-parameters/settings#users_config) и [access_control_path](../../operations/server-configuration-parameters/settings.md#access_control_path) не будет использоваться.

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

Вы также можете определить разделы `memory` — означает хранение информации только в памяти, без записи на диск, и `ldap` — означает хранение информации на сервере LDAP.

Чтобы добавить сервер LDAP в качестве удаленного каталога пользователей, которые не определены локально, определите один раздел `ldap` со следующими настройками:

| Настройка  | Описание                                                                                                                                                                                                                                                                                                                                                                    |
|------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `server`   | одно из имен серверов LDAP, определенных в разделе конфигурации `ldap_servers`. Этот параметр обязателен и не может быть пустым.                                                                                                                                                                                                                                       |
| `roles`    | раздел со списком локально определенных ролей, которые будут назначены каждому пользователю, полученному с сервера LDAP. Если роли не указаны, пользователь не сможет выполнять никаких действий после аутентификации. Если какая-либо из перечисленных ролей не определена локально в момент аутентификации, то попытка аутентификации завершится неудачей, как если бы указанный пароль был неправильным. |

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

Определяет список пользовательских доменов верхнего уровня, которые следует добавить, где каждый элемент имеет формат `<name>/path/to/file</name>`.

Например:

```xml
<top_level_domains_lists>
    <public_suffix_list>/path/to/public_suffix_list.dat</public_suffix_list>
</top_level_domains_lists>
```

Смотрите также:
- функция [`cutToFirstSignificantSubdomainCustom`](../../sql-reference/functions/url-functions.md/#cuttofirstsignificantsubdomaincustom) и ее вариации,
  которые принимают имя пользовательского списка TLD, возвращая часть домена, которая включает поддомены верхнего уровня до первого значимого поддомена.
## proxy {#proxy}

Определите прокси-серверы для HTTP и HTTPS запросов, которые в настоящее время поддерживаются хранилищем S3, табличными функциями S3 и URL-функциями.

Существуют три способа определить прокси-серверы:
- переменные окружения
- списки прокси
- удаленные разрешители прокси.

Поддерживается также обход прокси-серверов для конкретных хостов с помощью переменной `no_proxy`.

**Переменные окружения**

Переменные окружения `http_proxy` и `https_proxy` позволяют указать
прокси-сервер для данного протокола. Если она установлена в вашей системе, она должна работать без проблем.

Это самый простой подход, если у данного протокола есть
только один прокси-сервер и этот прокси-сервер не меняется.

**Списки прокси**

Этот подход позволяет вам указать один или несколько
прокси-серверов для протокола. Если определено более одного прокси-сервера,
ClickHouse использует различные прокси по круговой схеме, балансируя
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
Выберите родительское поле в вкладках ниже, чтобы просмотреть их детей:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| Поле      | Описание                          |
|-----------|-----------------------------------|
| `<http>`  | Список одного или нескольких HTTP-прокси  |
| `<https>` | Список одного или нескольких HTTPS-прокси |

  </TabItem>
  <TabItem value="http_https" label="<http> и <https>">

| Поле    | Описание         |
|---------|-------------------|
| `<uri>` | URI прокси |

  </TabItem>
</Tabs>

**Удаленные разрешители прокси**

Возможно, прокси-серверы изменяются динамически. В этом
случае вы можете определить конечную точку разрешителя. ClickHouse отправляет
пустой GET запрос на эту конечную точку, удаленный разрешитель должен вернуть хост прокси.
ClickHouse использует его для формирования URI прокси с использованием следующего шаблона: `\{proxy_scheme\}://\{proxy_host\}:{proxy_port}`

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

Выберите родительское поле в вкладках ниже, чтобы просмотреть их детей:

<Tabs>
  <TabItem value="proxy" label="<proxy>" default>

| Поле     | Описание                       |
|----------|-------------------------------|
| `<http>` | Список одного или нескольких разрешителей* |
| `<https>` | Список одного или нескольких разрешителей* |

  </TabItem>
  <TabItem value="http_https" label="<http> и <https>">

| Поле         | Описание                                    |
|--------------|---------------------------------------------|
| `<resolver>` | Конечная точка и другие детали для разрешителя |

:::note
Вы можете иметь несколько элементов `<resolver>`, но используется только первый
`<resolver>` для данного протокола. Все другие элементы `<resolver>`
для этого протокола игнорируются. Это означает, что балансировка нагрузки
(если это необходимо) должна быть реализована удаленным разрешителем.
:::

  </TabItem>
  <TabItem value="resolver" label="<resolver>">

| Поле               | Описание                                                                                                                                                                            |
|--------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `<endpoint>`       | URI разрешителя прокси                                                                                                                                                             |
| `<proxy_scheme>`   | Протокол окончательного URI прокси. Это может быть либо `http`, либо `https`.                                                                                                     |
| `<proxy_port>`     | Номер порта разрешителя прокси                                                                                                                                                   |
| `<proxy_cache_time>` | Время в секундах, в течение которого значения из разрешителя должны кэшироваться ClickHouse. Установка этого значения в `0` приводит к тому, что ClickHouse будет обращаться к разрешителю для каждого HTTP или HTTPS запроса. |

  </TabItem>
</Tabs>

**Приоритет**

Настройки прокси определяются в следующем порядке:

| Порядок | Настройка                |
|---------|--------------------------|
| 1.      | Удаленные разрешители прокси |
| 2.      | Списки прокси            |
| 3.      | Переменные окружения     |

ClickHouse проверит тип разрешителя с самым высоким приоритетом для протокола запроса. Если он не определен,
он проверит следующий тип разрешителя с высшим приоритетом, пока не дойдет до разрешителя окружения.
Это также позволяет использовать комбинацию типов разрешителей.
## disable_tunneling_for_https_requests_over_http_proxy {#disable_tunneling_for_https_requests_over_http_proxy}

По умолчанию туннелирование (т.е. `HTTP CONNECT`) используется для выполнения `HTTPS` запросов через `HTTP` прокси. Эта настройка может быть использована для его отключения.

**no_proxy**

По умолчанию все запросы будут проходить через прокси. Чтобы отключить его для конкретных хостов, переменная `no_proxy` должна быть установлена.
Она может быть установлена внутри условия `<proxy>` для списков и удаленных разрешителей, а также как переменная окружения для разрешителя окружения.
Она поддерживает IP-адреса, домены, поддомены и `'*'` для полного обхода. Ведущие точки отбрасываются так же, как это делает curl.

**Пример**

Следующая конфигурация обходит запросы прокси для `clickhouse.cloud` и всех его поддоменов (например, `auth.clickhouse.cloud`).
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

Каталог, используемый в качестве хранилища для всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. По умолчанию используется папка `/workload/` в рабочем каталоге сервера.

**Пример**

```xml
<workload_path>/var/lib/clickhouse/workload/</workload_path>
```

**Смотрите также**
- [Иерархия нагрузок](/operations/workload-scheduling.md#workloads)
- [workload_zookeeper_path](#workload_zookeeper_path)
## workload_zookeeper_path {#workload_zookeeper_path}

Путь к узлу ZooKeeper, который используется в качестве хранилища для всех запросов `CREATE WORKLOAD` и `CREATE RESOURCE`. Для согласованности все определения SQL хранятся как значение этого одного znode. По умолчанию ZooKeeper не используется, и определения хранятся на [диске](#workload_path).

**Пример**

```xml
<workload_zookeeper_path>/clickhouse/workload/definitions.sql</workload_zookeeper_path>
```

**Смотрите также**
- [Иерархия нагрузок](/operations/workload-scheduling.md#workloads)
- [workload_path](#workload_path)