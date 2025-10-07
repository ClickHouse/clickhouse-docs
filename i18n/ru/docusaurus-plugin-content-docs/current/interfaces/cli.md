---
slug: '/interfaces/cli'
sidebar_label: 'Клиент ClickHouse'
sidebar_position: 17
description: 'Документация по интерфейсу командной строки ClickHouse'
title: 'Клиент ClickHouse'
doc_type: reference
---
import Image from '@theme/IdealImage';
import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png'

ClickHouse предоставляет родной клиент командной строки для выполнения SQL-запросов непосредственно к серверу ClickHouse. Он поддерживает как интерактивный режим (для выполнения запросов в реальном времени), так и пакетный режим (для скриптов и автоматизации). Результаты запросов могут отображаться в терминале или экспортироваться в файл с поддержкой всех выходных [форматов](formats.md) ClickHouse, таких как Pretty, CSV, JSON и других.

Клиент предоставляет обратную связь в реальном времени о выполнении запроса с помощью индикатора прогресса и информации о количестве прочитанных строк, обработанных байтах и времени выполнения запроса. Он поддерживает как [опции командной строки](#command-line-options), так и [файлы конфигурации](#configuration_files).

## Установка {#install}

Чтобы скачать ClickHouse, выполните:

```bash
curl https://clickhouse.com/ | sh
```

Чтобы также установить его, выполните:
```bash
sudo ./clickhouse install
```

Смотрите [Установить ClickHouse](../getting-started/install/install.mdx) для получения других вариантов установки.

Разные версии клиента и сервера совместимы друг с другом, но некоторые функции могут быть недоступны в старых клиентах. Мы рекомендуем использовать одну и ту же версию для клиента и сервера.

## Запуск {#run}

:::note
Если вы только скачали, но не установили ClickHouse, используйте `./clickhouse client` вместо `clickhouse-client`.
:::

Чтобы подключиться к серверу ClickHouse, выполните:

```bash
$ clickhouse-client --host server

ClickHouse client version 24.12.2.29 (official build).
Connecting to server:9000 as user default.
Connected to ClickHouse server version 24.12.2.

:)
```

Укажите дополнительные детали подключения по необходимости:

**`--port <port>`** - Порт, на котором сервер ClickHouse принимает соединения. Порты по умолчанию: 9440 (TLS) и 9000 (без TLS). Обратите внимание, что клиент ClickHouse использует родной протокол, а не HTTP(S).

**`-s [ --secure ]`** - Использовать ли TLS (обычно определяется автоматически).

**`-u [ --user ] <username>`** - Пользователь базы данных, под которым нужно подключиться. По умолчанию подключается как пользователь `default`.

**`--password <password>`** - Пароль пользователя базы данных. Вы также можете указать пароль для подключения в файле конфигурации. Если вы не укажете пароль, клиент запросит его.

**`-c [ --config ] <path-to-file>`** - Местоположение файла конфигурации для клиента ClickHouse, если он не находится в одном из мест по умолчанию. Смотрите [Файлы конфигурации](#configuration_files).

**`--connection <name>`** - Имя преднастроенных деталей подключения из файла конфигурации.

Для полного списка опций командной строки смотрите [Опции командной строки](#command-line-options).

### Подключение к ClickHouse Cloud {#connecting-cloud}

Детали для вашей службы ClickHouse Cloud доступны в консоли ClickHouse Cloud. Выберите службу, к которой хотите подключиться, и нажмите **Подключиться**:

<Image img={cloud_connect_button}
  size="md"
  alt="Кнопка подключения к службе ClickHouse Cloud"
/>

<br/><br/>

Выберите **Native**, и детали отобразятся с примером команды `clickhouse-client`:

<Image img={connection_details_native}
  size="md"
  alt="Детали соединения ClickHouse Cloud Native TCP"
/>

### Хранение соединений в файле конфигурации {#connection-credentials}

Вы можете хранить детали подключения для одного или нескольких серверов ClickHouse в [файле конфигурации](#configuration_files).

Формат выглядит следующим образом:
```xml
<config>
    <connections_credentials>
        <connection>
            <name>default</name>
            <hostname>hostname</hostname>
            <port>9440</port>
            <secure>1</secure>
            <user>default</user>
            <password>password</password>
            <!-- <history_file></history_file> -->
            <!-- <history_max_entries></history_max_entries> -->
            <!-- <accept-invalid-certificate>false</accept-invalid-certificate> -->
            <!-- <prompt></prompt> -->
        </connection>
    </connections_credentials>
</config>
```

Смотрите [раздел о файлах конфигурации](#configuration_files) для получения дополнительной информации.

:::note
Чтобы сосредоточиться на синтаксисе запроса, в остальных примерах опущены детали подключения (`--host`, `--port` и т.д.). Не забудьте добавить их, когда вы будете использовать команды.
:::

## Пакетный режим {#batch-mode}

Вместо использования клиента ClickHouse интерактивно, вы можете запустить его в пакетном режиме.

Вы можете указать один запрос следующим образом:

```bash
$ clickhouse-client "SELECT sum(number) FROM numbers(10)"
45
```

Вы также можете использовать опцию командной строки `--query`:

```bash
$ clickhouse-client --query "SELECT uniq(number) FROM numbers(10)"
10
```

Вы можете предоставить запрос на `stdin`:

```bash
$ echo "SELECT avg(number) FROM numbers(10)" | clickhouse-client
4.5
```

Вставка данных:

```bash
$ echo "Hello\nGoodbye" | clickhouse-client --query "INSERT INTO messages FORMAT CSV"
```

Когда указана `--query`, любой ввод будет добавлен к запросу после перевода строки.

**Вставка CSV-файла в удалённую службу ClickHouse**

В этом примере вставляется образец набора данных из CSV-файла `cell_towers.csv` в существующую таблицу `cell_towers` в базе данных `default`:

```bash
clickhouse-client --host HOSTNAME.clickhouse.cloud \
  --port 9440 \
  --user default \
  --password PASSWORD \
  --query "INSERT INTO cell_towers FORMAT CSVWithNames" \
  < cell_towers.csv
```

**Больше примеров вставки данных**

```bash
echo -ne "1, 'some text', '2016-08-14 00:00:00'\n2, 'some more text', '2016-08-14 00:00:01'" | \
  clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

```bash
cat <<_EOF | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
3, 'some text', '2016-08-14 00:00:00'
4, 'some more text', '2016-08-14 00:00:01'
_EOF
```

```bash
cat file.csv | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

## Заметки {#notes}

В интерактивном режиме формат вывода по умолчанию - `PrettyCompact`. Вы можете изменить формат в клаузе `FORMAT` запроса или указать опцию командной строки `--format`. Чтобы использовать вертикальный формат, вы можете использовать `--vertical` или указать `\G` в конце запроса. В этом формате каждое значение выводится на отдельной строке, что удобно для широких таблиц.

В пакетном режиме формат данных [формат](formats.md) по умолчанию - `TabSeparated`. Вы можете установить формат в клаузе `FORMAT` запроса.

В интерактивном режиме по умолчанию все, что было введено, выполняется при нажатии клавиши `Enter`. Точка с запятой не обязательна в конце запроса.

Вы можете запустить клиент с параметром `-m, --multiline`. Чтобы ввести многострочный запрос, введите обратный слэш `\` перед переводом строки. После нажатия `Enter` вам будет предложено ввести следующую строку запроса. Чтобы запустить запрос, завершите его точкой с запятой и нажмите `Enter`.

Клиент ClickHouse основан на `replxx` (аналогично `readline`), поэтому он использует знакомые сочетания клавиш и ведет историю. История записывается в `~/.clickhouse-client-history` по умолчанию.

Чтобы выйти из клиента, нажмите `Ctrl+D` или введите одну из следующих команд вместо запроса: `exit`, `quit`, `logout`, `exit;`, `quit;`, `logout;`, `q`, `Q`, `:q`.

При обработке запроса клиент отображает:

1.  Прогресс, который обновляется не более 10 раз в секунду по умолчанию. Для быстрых запросов прогресс может не успевать отображаться.
2.  Отформатированный запрос после разбора для отладки.
3.  Результат в указанном формате.
4.  Количество строк в результате, прошедшее время и среднюю скорость обработки запроса. Все объемы данных относятся к несжатым данным.

Вы можете отменить длительный запрос, нажав `Ctrl+C`. Однако вам все равно нужно будет подождать немного, пока сервер прервет запрос. Невозможно отменить запрос на определенных этапах. Если вы не подождете и нажмете `Ctrl+C` еще раз, клиент выйдет.

Клиент ClickHouse позволяет передавать внешние данные (временные внешние таблицы) для запросов. Для получения дополнительной информации смотрите раздел [Внешние данные для обработки запросов](../engines/table-engines/special/external-data.md).

## Запросы с параметрами {#cli-queries-with-parameters}

Вы можете указать параметры в запросе и передать значения для него с помощью опций командной строки. Это позволяет избежать форматирования запроса со специфичными динамическими значениями на стороне клиента. Например:

```bash
$ clickhouse-client --param_parName="[1, 2]" --query "SELECT * FROM table WHERE a = {parName:Array(UInt16)}"
```

Также возможно установить параметры из интерактивной сессии:
```bash
$ clickhouse-client --query "SET param_parName='[1, 2]'; SELECT {parName:Array(UInt16)}"
```

### Синтаксис запроса {#cli-queries-with-parameters-syntax}

В запросе расположите значения, которые хотите заполнить с помощью параметров командной строки, в фигурных скобках в следующем формате:

```sql
{<name>:<data type>}
```

- `name` — Идентификатор заполнителя. Соответствующая опция командной строки — `--param_<name> = value`.
- `data type` — [Тип данных](../sql-reference/data-types/index.md) параметра. Например, такая структура данных как `(integer, ('string', integer))` может иметь тип данных `Tuple(UInt8, Tuple(String, UInt8))` (вы также можете использовать другие [целочисленные](../sql-reference/data-types/int-uint.md) типы). Также можно передавать имя таблицы, имя базы данных и имена столбцов в качестве параметров, в этом случае вам необходимо использовать `Identifier` как тип данных.

### Примеры {#cli-queries-with-parameters-examples}

```bash
$ clickhouse-client --param_tuple_in_tuple="(10, ('dt', 10))" \
    --query "SELECT * FROM table WHERE val = {tuple_in_tuple:Tuple(UInt8, Tuple(String, UInt8))}"

$ clickhouse-client --param_tbl="numbers" --param_db="system" --param_col="number" --param_alias="top_ten" \
    --query "SELECT {col:Identifier} as {alias:Identifier} FROM {db:Identifier}.{tbl:Identifier} LIMIT 10"
```

## Генерация SQL с помощью ИИ {#ai-sql-generation}

Клиент ClickHouse включает встроенную помощь на основе ИИ для генерации SQL-запросов из описаний на естественном языке. Эта функция помогает пользователям писать сложные запросы без глубоких знаний SQL.

Помощь ИИ работает из коробки, если у вас установлен либо `OPENAI_API_KEY`, либо `ANTHROPIC_API_KEY` в переменной окружения. Для более продвинутой настройки смотрите раздел [Конфигурация](#ai-sql-generation-configuration).

### Использование {#ai-sql-generation-usage}

Чтобы использовать генерацию SQL с помощью ИИ, добавьте префикс `??` к вашему запросу на естественном языке:

```bash
:) ?? show all users who made purchases in the last 30 days
```

ИИ будет:
1. Автоматически исследовать схему вашей базы данных
2. Генерировать соответствующий SQL на основе обнаруженных таблиц и столбцов
3. Немедленно выполнять сгенерированный запрос

### Пример {#ai-sql-generation-example}

```bash
:) ?? count orders by product category

Starting AI SQL generation with schema discovery...
──────────────────────────────────────────────────

🔍 list_databases
   ➜ system, default, sales_db

🔍 list_tables_in_database
   database: sales_db
   ➜ orders, products, categories

🔍 get_schema_for_table
   database: sales_db
   table: orders
   ➜ CREATE TABLE orders (order_id UInt64, product_id UInt64, quantity UInt32, ...)

✨ SQL query generated successfully!
──────────────────────────────────────────────────

SELECT 
    c.name AS category,
    COUNT(DISTINCT o.order_id) AS order_count
FROM sales_db.orders o
JOIN sales_db.products p ON o.product_id = p.product_id
JOIN sales_db.categories c ON p.category_id = c.category_id
GROUP BY c.name
ORDER BY order_count DESC
```

### Конфигурация {#ai-sql-generation-configuration}

Генерация SQL с помощью ИИ требует настройки поставщика ИИ в вашем файле конфигурации клиента ClickHouse. Вы можете использовать либо OpenAI, Anthropic, либо любой совместимый с OpenAI API-сервис.

#### Резервное копирование на основе окружения {#ai-sql-generation-fallback}

Если в конфигурационном файле не указана конфигурация ИИ, клиент ClickHouse попытается использовать переменные окружения автоматически:

1. Сначала проверяет переменную окружения `OPENAI_API_KEY`
2. Если не найдена, проверяет переменную окружения `ANTHROPIC_API_KEY`
3. Если ни одна из переменных не найдена, функции ИИ будут отключены

Это позволяет быстро настроить без файлов конфигурации:
```bash

# Using OpenAI
export OPENAI_API_KEY=your-openai-key
clickhouse-client


# Using Anthropic
export ANTHROPIC_API_KEY=your-anthropic-key
clickhouse-client
```

#### Файл конфигурации {#ai-sql-generation-configuration-file}

Для более точного контроля над настройками ИИ настройте их в вашем файле конфигурации клиента ClickHouse, расположенном по адресу:
- `~/.clickhouse-client/config.xml` (XML формат)
- `~/.clickhouse-client/config.yaml` (YAML формат)
- Или укажите пользовательское местоположение с помощью `--config-file`

**Пример формата XML:**

```xml
<config>
    <ai>
        <!-- Required: Your API key (or set via environment variable) -->
        <api_key>your-api-key-here</api_key>

        <!-- Required: Provider type (openai, anthropic) -->
        <provider>openai</provider>

        <!-- Model to use (defaults vary by provider) -->
        <model>gpt-4o</model>

        <!-- Optional: Custom API endpoint for OpenAI-compatible services -->
        <!-- <base_url>https://openrouter.ai/api</base_url> -->

        <!-- Schema exploration settings -->
        <enable_schema_access>true</enable_schema_access>

        <!-- Generation parameters -->
        <temperature>0.0</temperature>
        <max_tokens>1000</max_tokens>
        <timeout_seconds>30</timeout_seconds>
        <max_steps>10</max_steps>

        <!-- Optional: Custom system prompt -->
        <!-- <system_prompt>You are an expert ClickHouse SQL assistant...</system_prompt> -->
    </ai>
</config>
```

**Пример формата YAML:**

```yaml
ai:
  # Required: Your API key (or set via environment variable)
  api_key: your-api-key-here

  # Required: Provider type (openai, anthropic)
  provider: openai

  # Model to use
  model: gpt-4o

  # Optional: Custom API endpoint for OpenAI-compatible services
  # base_url: https://openrouter.ai/api

  # Enable schema access - allows AI to query database/table information
  enable_schema_access: true

  # Generation parameters
  temperature: 0.0      # Controls randomness (0.0 = deterministic)
  max_tokens: 1000      # Maximum response length
  timeout_seconds: 30   # Request timeout
  max_steps: 10         # Maximum schema exploration steps

  # Optional: Custom system prompt
  # system_prompt: |
  #   You are an expert ClickHouse SQL assistant. Convert natural language to SQL.
  #   Focus on performance and use ClickHouse-specific optimizations.
  #   Always return executable SQL without explanations.
```

**Использование API, совместимых с OpenAI (например, OpenRouter):**

```yaml
ai:
  provider: openai  # Use 'openai' for compatibility
  api_key: your-openrouter-api-key
  base_url: https://openrouter.ai/api/v1
  model: anthropic/claude-3.5-sonnet  # Use OpenRouter model naming
```

**Минимальные примеры конфигурации:**

```yaml

# Minimal config - uses environment variable for API key
ai:
  provider: openai  # Will use OPENAI_API_KEY env var


# No config at all - automatic fallback

# (Empty or no ai section - will try OPENAI_API_KEY then ANTHROPIC_API_KEY)


# Only override model - uses env var for API key
ai:
  provider: openai
  model: gpt-3.5-turbo
```

### Параметры {#ai-sql-generation-parameters}

**Обязательные параметры:**
- `api_key` - Ваш ключ API для сервиса ИИ. Может быть опущен, если установлен через переменную окружения:
  - OpenAI: `OPENAI_API_KEY`
  - Anthropic: `ANTHROPIC_API_KEY`
  - Примечание: Ключ API в файле конфигурации имеет приоритет над переменной окружения.
- `provider` - Поставщик ИИ: `openai` или `anthropic`
  - Если опущен, используется автоматическое резервирование на основе доступных переменных окружения.

**Конфигурация модели:**
- `model` - Модель для использования (по умолчанию: специфичная для поставщика)
  - OpenAI: `gpt-4o`, `gpt-4`, `gpt-3.5-turbo` и т.д.
  - Anthropic: `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229` и т.д.
  - OpenRouter: Используйте их именование модели, например `anthropic/claude-3.5-sonnet`.

**Настройки подключения:**
- `base_url` - Пользовательский конечный API для совместимых с OpenAI сервисов (опционально).
- `timeout_seconds` - Тайм-аут запроса в секундах (по умолчанию: `30`).

**Исследование схемы:**
- `enable_schema_access` - Позволяет ИИ исследовать схемы баз данных (по умолчанию: `true`).
- `max_steps` - Максимальное количество шагов вызова инструмента для исследования схемы (по умолчанию: `10`).

**Параметры генерации:**
- `temperature` - Управляет случайностью, 0.0 = детерминированно, 1.0 = креативно (по умолчанию: `0.0`).
- `max_tokens` - Максимальная длина ответа в токенах (по умолчанию: `1000`).
- `system_prompt` - Пользовательские инструкции для ИИ (опционально).

### Как это работает {#ai-sql-generation-how-it-works}

Генератор SQL на основе ИИ использует многошаговый процесс:

1. **Открытие схемы**: ИИ использует встроенные инструменты для исследования вашей базы данных:
- Перечисляет доступные базы данных - Обнаруживает таблицы в соответствующих базах данных - Исследует структуры таблиц с помощью операторов `CREATE TABLE`

2. **Генерация запроса**: На основе найденной схемы ИИ генерирует SQL, который:
- Соответствует вашему намерению на естественном языке - Использует правильные имена таблиц и столбцов - Применяет соответствующие соединения и агрегации
3. **Выполнение**: Сгенерированный SQL автоматически выполняется, и результаты отображаются.

### Ограничения {#ai-sql-generation-limitations}

- Требуется активное интернет-соединение.
- Использование API подлежит лимитам и затратам со стороны поставщика ИИ.
- Сложные запросы могут потребовать нескольких уточнений.
- ИИ имеет доступ только для чтения к информации о схеме, а не к действительным данным.

### Безопасность {#ai-sql-generation-security}

- Ключи API никогда не отправляются на серверы ClickHouse.
- ИИ видит только информацию о схеме (имена и типы таблиц/столбцов), а не реальные данные.
- Все сгенерированные запросы соблюдают ваши текущие разрешения базы данных.

## Псевдонимы {#cli_aliases}

- `\l` - ПОКАЗАТЬ БАЗЫ ДАННЫХ
- `\d` - ПОКАЗАТЬ ТАБЛИЦЫ
- `\c <DATABASE>` - ИСПОЛЬЗОВАТЬ БАЗУ ДАННЫХ
- `.` - повторить последний запрос

## Комбинации клавиш {#keyboard_shortcuts}

- `Alt (Option) + Shift + e` - открыть редактор с текущим запросом. Можно указать используемый редактор с помощью переменной окружения `EDITOR`. По умолчанию используется `vim`.
- `Alt (Option) + #` - закомментировать строку.
- `Ctrl + r` - нечеткий поиск в истории.

Полный список всех доступных комбинаций клавиш доступен на [replxx](https://github.com/AmokHuginnsson/replxx/blob/1f149bf/src/replxx_impl.cxx#L262).

:::tip
Чтобы настроить правильную работу мета-клавиши (Option) на MacOS:

iTerm2: Перейдите в Preferences -> Profile -> Keys -> Left Option key и нажмите Esc+
:::

## Строка подключения {#connection_string}

Клиент ClickHouse также поддерживает подключение к серверу ClickHouse с использованием строки подключения, аналогичной [MongoDB](https://www.mongodb.com/docs/manual/reference/connection-string/), [PostgreSQL](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING), [MySQL](https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html#connecting-using-uri). Она имеет следующий синтаксис:

```text
clickhouse:[//[user[:password]@][hosts_and_ports]][/database][?query_parameters]
```

**Компоненты**

- `user` - (опционально) Имя пользователя базы данных. По умолчанию: `default`.
- `password` - (опционально) Пароль пользователя базы данных. Если указан `:`, и пароль пуст, клиент запросит пароль пользователя.
- `hosts_and_ports` - (опционально) Список хостов и опциональных портов `host[:port] [, host:[port]], ...`. По умолчанию: `localhost:9000`.
- `database` - (опционально) Имя базы данных. По умолчанию: `default`.
- `query_parameters` - (опционально) Список пар ключ-значение `param1=value1[,&param2=value2], ...`. Для некоторых параметров значение не требуется. Имена параметров и значения чувствительны к регистру.

Если имя пользователя, пароль или база данных были указаны в строке подключения, их нельзя указывать с помощью `--user`, `--password` или `--database` (и наоборот).

Компонент хоста может быть либо именем хоста, либо адресом IPv4 или IPv6. IPv6-адреса должны быть окружены квадратными скобками:

```text
clickhouse://[2001:db8::1234]
```

Строки подключения могут содержать несколько хостов. Клиент ClickHouse попытается подключиться к этим хостам в порядке (слева направо). После установления соединения никаких попыток подключения к оставшимся хостам не делается.

Строка подключения должна указываться как первый аргумент `clickHouse-client`. Строка подключения может быть комбинирована с произвольными другими [опциями командной строки](#command-line-options), кроме `--host` и `--port`.

Следующие ключи разрешены для `query_parameters`:

- `secure` или сокращенно `s`. Если указано, клиент подключится к серверу через защищенное соединение (TLS). Смотрите `--secure` в [опциях командной строки](#command-line-options).

**Процентное кодирование**

Не-US ASCII, пробелы и специальные символы в `user`, `password`, `hosts`, `database` и `query parameters` должны быть [процентно закодированы](https://en.wikipedia.org/wiki/URL_encoding).

### Примеры {#connection_string_examples}

Подключитесь к `localhost` на порту 9000 и выполните запрос `SELECT 1`.

```bash
clickhouse-client clickhouse://localhost:9000 --query "SELECT 1"
```

Подключитесь к `localhost` как пользователь `john` с паролем `secret`, хост `127.0.0.1` и порт `9000`.

```bash
clickhouse-client clickhouse://john:secret@127.0.0.1:9000
```

Подключитесь к `localhost` как пользователь `default`, хост с адресом IPV6 `[::1]` и порт `9000`.

```bash
clickhouse-client clickhouse://[::1]:9000
```

Подключитесь к `localhost` на порту 9000 в многострочном режиме.

```bash
clickhouse-client clickhouse://localhost:9000 '-m'
```

Подключитесь к `localhost`, используя порт 9000, как пользователь `default`.

```bash
clickhouse-client clickhouse://default@localhost:9000


# equivalent to:
clickhouse-client clickhouse://localhost:9000 --user default
```

Подключитесь к `localhost` на порту 9000 и по умолчанию используйте базу данных `my_database`.

```bash
clickhouse-client clickhouse://localhost:9000/my_database


# equivalent to:
clickhouse-client clickhouse://localhost:9000 --database my_database
```

Подключитесь к `localhost` на порту 9000 и по умолчанию используйте базу данных `my_database`, указанную в строке подключения, и защищенное соединение, используя сокращенный параметр `s`.

```bash
clickhouse-client clickhouse://localhost/my_database?s


# equivalent to:
clickhouse-client clickhouse://localhost/my_database -s
```

Подключитесь к стандартному хосту, используя стандартный порт, стандартного пользователя и стандартную базу данных.

```bash
clickhouse-client clickhouse:
```

Подключитесь к стандартному хосту, используя стандартный порт, как пользователь `my_user` без пароля.

```bash
clickhouse-client clickhouse://my_user@


# Using a blank password between : and @ means to asking the user to enter the password before starting the connection.
clickhouse-client clickhouse://my_user:@
```

Подключитесь к `localhost`, используя адрес электронной почты в качестве имени пользователя. Символ `@` закодирован в `%40`.

```bash
clickhouse-client clickhouse://some_user%40some_mail.com@localhost:9000
```

Подключитесь к одному из двух хостов: `192.168.1.15`, `192.168.1.25`.

```bash
clickhouse-client clickhouse://192.168.1.15,192.168.1.25
```

## Формат идентификатора запроса {#query-id-format}

В интерактивном режиме клиент ClickHouse отображает идентификатор запроса для каждого запроса. По умолчанию идентификатор форматируется следующим образом:

```sql
Query id: 927f137d-00f1-4175-8914-0dd066365e96
```

Пользовательский формат может быть указан в файле конфигурации внутри тега `query_id_formats`. Заполнитель `{query_id}` в строке формата заменяется на идентификатор запроса. Внутри тега допускается несколько строк формата.
Эта функция может быть использована для генерации URL для упрощения профилирования запросов.

**Пример**

```xml
<config>
  <query_id_formats>
    <speedscope>http://speedscope-host/#profileURL=qp%3Fid%3D{query_id}</speedscope>
  </query_id_formats>
</config>
```

С указанной выше конфигурацией идентификатор запроса отображается в следующем формате:

```response
speedscope:http://speedscope-host/#profileURL=qp%3Fid%3Dc8ecc783-e753-4b38-97f1-42cddfb98b7d
```

## Файлы конфигурации {#configuration_files}

Клиент ClickHouse использует первый существующий файл из следующих:

- Файл, определенный с помощью параметра `-c [ -C, --config, --config-file ]`.
- `./clickhouse-client.[xml|yaml|yml]`
- `~/.clickhouse-client/config.[xml|yaml|yml]`
- `/etc/clickhouse-client/config.[xml|yaml|yml]`

Смотрите пример файла конфигурации в репозитории ClickHouse: [`clickhouse-client.xml`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/client/clickhouse-client.xml)

Пример синтаксиса XML:

```xml
<config>
    <user>username</user>
    <password>password</password>
    <secure>true</secure>
    <host>hostname</host>
    <connections_credentials>
      <connection>
        <name>cloud</name>
        <hostname>abc.clickhouse.cloud</hostname>
        <user>username</user>
        <password>password</password>
      </connection>
    </connections_credentials>
    <openSSL>
      <client>
        <caConfig>/etc/ssl/cert.pem</caConfig>
      </client>
    </openSSL>
</config>
```

Та же конфигурация в формате YAML:

```yaml
user: username
password: 'password'
secure: true
connections_credentials:
  connection:
    - name: cloud
      hostname: abc.clickhouse.cloud
      user: username
      password: 'password'
openSSL:
  client:
    caConfig: '/etc/ssl/cert.pem'
```

## Разрешение конфигурации клиента {#config_resolution}

Конфигурация клиента следует следующему шаблону:

1. Параметры, переданные через [опции командной строки](#command-line-options), имеют
    наивысший приоритет.
2. Для параметров, не переданных через командную строку, будут использоваться [опции окружения](#environment-variable-options).
3. Другие параметры подключения будут извлекаться из одного или нескольких объектов `connection`
    под ключом `connections_credentials` в файле конфигурации,
    где `connection.name` совпадает с именем подключения. Это имя
    определяется значением `--connection`, корневым параметром `connection`,
    опцией `--host` или корневым параметром `host`, или "default". Все
    `connections`, соответствующие имени, будут оцениваться в порядке их появления. Поддерживаемые ключи в каждом объекте `connection`:
    * `name`
    * `hostname`
    * `port`
    * `secure`
    * `user`
    * `password`
    * `database`
    * `history_file`
    * `history_max_entries`
    * `accept-invalid-certificate`
    * `prompt`
4. Наконец, параметры, установленные на корневом уровне конфигурации, применяются.
    Эти параметры включают:
    * `connection`
    * `secure` и `no-secure`
    * `bind_host`
    * `host`
    * `port`
    * `user`
    * `password`
    * `database`
    * `history_file`
    * `history_max_entries`
    * `accept-invalid-certificate`
    * `prompt`
    * `jwt`
    * `ssh-key-file`
    * `ssh-key-passphrase`
    * `ask-password`

## Дополнительные параметры конфигурации {#additional_configuration}

Эти дополнительные параметры также могут быть установлены на корневом уровне конфигурации и не переопределяются другими средствами:

* `quota_key`
* `compression`
* `connect_timeout`
* `send_timeout`
* `receive_timeout`
* `tcp_keep_alive_timeout`
* `handshake_timeout_ms`
* `sync_request_timeout`
* `tcp_port`
* `tcp_port_secure`

### Защищенные соединения {#secure_connections}

Объект `openSSL` определяет поведение шифрования и аутентификации TLS. Смотрите
[OpenSSL](https://clickhouse.com/docs/operations/server-configuration-parameters/settings#openssl)
для подробностей.

Объект `openSSL` и другие параметры также влияют на определение
необходимости использования защищенного соединения следующим образом:

* Если был передан `--secure` или установлен параметр конфигурации `secure` на корневом уровне или на уровне `connection`, соединение будет использовать шифрование.
* Если был передан `--no-secure` или установлен параметр `no-secure` на уровне корня в значение true, соединение не будет зашифровано.
* Если имя хоста разрешено в подсеть `clickhouse.cloud`, соединение будет использовать шифрование.
* Если [порт](https://clickhouse.com/docs/guides/sre/network-ports) разрешается в порт SSL/TLS для родного протокола `9440`, соединение будет использовать шифрование.

## Опции окружения {#environment-variable-options}

Имя пользователя, пароль и хост могут быть установлены через переменные окружения `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD` и `CLICKHOUSE_HOST`.
Аргументы командной строки `--user`, `--password` или `--host`, или [строка подключения](#connection_string) (если указана) имеют приоритет над переменными окружения.

## Опции командной строки {#command-line-options}

Все опции командной строки могут быть указаны непосредственно в командной строке или в качестве значений по умолчанию в [файле конфигурации](#configuration_files).

### Общие опции {#command-line-options-general}

**`-c [ -C, --config, --config-file ] <path-to-file>`**

Местоположение файла конфигурации для клиента, если он не находится в одном из мест по умолчанию. Смотрите [Файлы конфигурации](#configuration_files).

**`--help`**

Печатает сводку по использованию и завершает работу. Объедините с `--verbose`, чтобы отобразить все возможные опции, включая настройки запроса.

**`--history_file <path-to-file>`**

 Путь к файлу, содержащему историю команд.

**`--history_max_entries`**

Максимальное количество записей в файле истории.

Значение по умолчанию: 1000000 (1 миллион)

**`--prompt <prompt>`**

Укажите пользовательский приглашение.

Значение по умолчанию: `display_name` сервера.

**`--verbose`**

Увеличивает уровень отображаемой информации.

**`-V [ --version ]`**

Печатает версию и завершает работу.

### Опции подключения {#command-line-options-connection}

**`--connection <name>`**

Имя преднастроенных деталей подключения из файла конфигурации. Смотрите [Данные для подключения](#connection-credentials).

**`-d [ --database ] <database>`**

Выберите базу данных по умолчанию для этого подключения.

Значение по умолчанию: текущая база данных из настроек сервера (по умолчанию `default`).

**`-h [ --host ] <host>`**

Имя хоста сервера ClickHouse, к которому нужно подключиться. Может быть либо именем хоста, либо адресом IPv4 или IPv6. Несколько хостов могут быть переданы через несколько аргументов.

Значение по умолчанию: localhost

**`--login`**

Вызывает поток аутентификации OAuth устройства для идентификации в IDP. Для хостов ClickHouse Cloud переменные OAuth определяются автоматически, в противном случае их необходимо указать с помощью `--oauth-url`, `--oauth-client-id` и `--oauth-audience`.

**`--jwt <value>`**

Используйте JSON Web Token (JWT) для аутентификации.

Аутентификация по JWT доступна только в ClickHouse Cloud.

**`--no-warnings`**

Отключить отображение предупреждений из `system.warnings`, когда клиент подключается к серверу.

**`--password <password>`**

Пароль пользователя базы данных. Вы также можете указать пароль для подключения в файле конфигурации. Если вы не укажете пароль, клиент запросит его.

**`--port <port>`**

Порт, на котором сервер принимает соединения. Порты по умолчанию: 9440 (TLS) и 9000 (без TLS).

Обратите внимание: клиент использует родной протокол, а не HTTP(S).

Значение по умолчанию: 9440, если указан `--secure`, иначе 9000. Всегда по умолчанию 9440, если имя хоста заканчивается на `.clickhouse.cloud`.

**`-s [ --secure ]`**

Использовать ли TLS.

Включен автоматически при подключении к порту 9440 (порту по умолчанию для защиты) или ClickHouse Cloud.

Вам может понадобиться настроить ваши сертификаты CA в [файле конфигурации](#configuration_files). Доступные настройки конфигурации такие же, как для [настройки TLS на стороне сервера](../operations/server-configuration-parameters/settings.md#openssl).

**`--ssh-key-file <path-to-file>`**

Файл, содержащий приватный ключ SSH для аутентификации на сервере.

**`--ssh-key-passphrase <value>`**

Пароль для приватного ключа SSH, указанного в `--ssh-key-file`.

**`-u [ --user ] <username>`**

Пользователь базы данных, под которым нужно подключиться.

Значение по умолчанию: default

Вместо опций `--host`, `--port`, `--user` и `--password` клиент также поддерживает [строки подключения](#connection_string).

### Опции запроса {#command-line-options-query}

**`--param_<name>=<value>`**

Значение замещения для параметра [запроса с параметрами](#cli-queries-with-parameters).

**`-q [ --query ] <query>`**

Запрос для выполнения в пакетном режиме. Может быть указан несколько раз (`--query "SELECT 1" --query "SELECT 2"`) или один раз с несколькими запросами, разделенными точками с запятой (`--query "SELECT 1; SELECT 2;"`). В последнем случае запросы `INSERT` с форматами, отличными от `VALUES`, должны быть разделены пустыми строками.

Один запрос также может быть указан без параметра:
```bash
$ clickhouse-client "SELECT 1"
1
```

Не может использоваться вместе с `--queries-file`.

**`--queries-file <path-to-file>`**

Путь к файлу, содержащему запросы. `--queries-file` может быть указан несколько раз, например, `--queries-file  queries1.sql --queries-file  queries2.sql`.

Не может использоваться вместе с `--query`.

**`-m [ --multiline ]`**

Если указано, разрешите многострочные запросы (не отправляйте запрос при нажатии Enter). Запросы будут отправлены только тогда, когда они будут завершены точкой с запятой.

### Настройки запросов {#command-line-options-query-settings}

Настройки запросов могут быть указаны в качестве опций командной строки в клиенте, например:
```bash
$ clickhouse-client --max_threads 1
```

Смотрите [Настройки](../operations/settings/settings.md) для списка доступных настроек.

### Опции форматирования {#command-line-options-formatting}

**`-f [ --format ] <format>`**

Используйте указанный формат для вывода результата.

Смотрите [Форматы входных и выходных данных](formats.md) для списка поддерживаемых форматов.

Значение по умолчанию: TabSeparated

**`--pager <command>`**

Перенаправьте весь вывод в эту команду. Обычно `less` (например, `less -S` для отображения широких наборов результатов) или аналогичную.

**`-E [ --vertical ]`**

Используйте [Вертикальный формат](../interfaces/formats.md#vertical) для вывода результата. Это то же самое, что и `–-format Vertical`. В этом формате каждое значение выводится на отдельной строке, что полезно при отображении широких таблиц.

### Подробности выполнения {#command-line-options-execution-details}

**`--enable-progress-table-toggle`**

Включите переключение таблицы прогресса, нажав клавишу управления (Space). Применимо только в интерактивном режиме с включённым печатью таблицы прогресса.

Значение по умолчанию: включено

**`--hardware-utilization`**

Вывести информацию об использовании аппаратного обеспечения в индикаторе прогресса.

**`--memory-usage`**

Если указано, выводить использование памяти в `stderr` в неинтерактивном режиме.

Возможные значения:
- `none` - не выводить использование памяти
- `default` - выводить количество байт
- `readable` - выводить использование памяти в удобочитаемом формате

**`--print-profile-events`**

Вывести пакеты `ProfileEvents`.

**`--progress`**

Выводить прогресс выполнения запроса.

Возможные значения:
- `tty|on|1|true|yes` - выводит в терминал в интерактивном режиме
- `err` - выводит в `stderr` в неинтерактивном режиме
- `off|0|false|no` - отключает печать прогресса

Значение по умолчанию: `tty` в интерактивном режиме, `off` в неинтерактивном (пакетном) режиме.

**`--progress-table`**

Выводить таблицу прогресса с изменяющимися метриками во время выполнения запроса.

Возможные значения:
- `tty|on|1|true|yes` - выводит в терминал в интерактивном режиме
- `err` - выводит в `stderr` в неинтерактивном режиме
- `off|0|false|no` - отключает таблицу прогресса

Значение по умолчанию: `tty` в интерактивном режиме, `off` в неинтерактивном (пакетном) режиме.

**`--stacktrace`**

Выводить трассировки стека исключений.

**`-t [ --time ]`**

Выводить время выполнения запроса в `stderr` в неинтерактивном режиме (для бенчмарков).