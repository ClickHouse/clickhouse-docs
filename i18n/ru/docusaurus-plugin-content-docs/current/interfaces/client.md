---
description: 'Документация по интерфейсу командной строки клиента ClickHouse'
sidebar_label: 'Клиент ClickHouse'
sidebar_position: 18
slug: /interfaces/client
title: 'Клиент ClickHouse'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickHouse предоставляет собственный клиент командной строки для выполнения SQL-запросов непосредственно к серверу ClickHouse.
Он поддерживает как интерактивный режим (для выполнения запросов в реальном времени), так и пакетный режим (для сценариев и автоматизации).
Результаты запросов можно выводить в терминал или экспортировать в файл; поддерживаются все [форматы](formats.md) вывода ClickHouse, такие как Pretty, CSV, JSON и другие.

Клиент в реальном времени показывает ход выполнения запроса: индикатор прогресса, количество считанных строк, объём обработанных данных в байтах и время выполнения запроса.
Он поддерживает как [параметры командной строки](#command-line-options), так и [файлы конфигурации](#configuration_files).

## Установка \{#install\}

Чтобы загрузить ClickHouse, выполните:

```bash
curl https://clickhouse.com/ | sh
```

Чтобы установить и его, выполните:

```bash
sudo ./clickhouse install
```

См. [Install ClickHouse](../getting-started/install/install.mdx), чтобы ознакомиться с другими вариантами установки.

Разные версии клиента и сервера совместимы между собой, однако некоторые функции могут быть недоступны в старых версиях клиента. Рекомендуется использовать одну и ту же версию клиента и сервера.

## Запуск \{#run\}

:::note
Если вы только скачали ClickHouse, но не установили его, используйте `./clickhouse client` вместо `clickhouse-client`.
:::

Чтобы подключиться к серверу ClickHouse, выполните:

```bash
$ clickhouse-client --host server

ClickHouse client version 24.12.2.29 (official build).
Connecting to server:9000 as user default.
Connected to ClickHouse server version 24.12.2.

:)
```

При необходимости укажите дополнительные параметры подключения:

| Настройка                        | Описание                                                                                                                                                                                        |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--port <port>`                  | Порт, на котором сервер ClickHouse принимает подключения. Порты по умолчанию: 9440 (TLS) и 9000 (без TLS). Обратите внимание, что клиент ClickHouse использует нативный протокол, а не HTTP(S). |
| `-s [ --secure ]`                | Использовать ли TLS (обычно определяется автоматически).                                                                                                                                        |
| `-u [ --user ] <username>`       | Пользователь базы данных, от имени которого нужно подключаться. По умолчанию используется пользователь `default`.                                                                               |
| `--password <password>`          | Пароль пользователя базы данных. Вы также можете указать пароль для подключения в файле конфигурации. Если пароль не указан, клиент запросит его.                                              |
| `-c [ --config ] <path-to-file>` | Путь к файлу конфигурации клиента ClickHouse, если он находится не в одном из стандартных расположений. См. [Файлы конфигурации](#configuration_files).                                        |
| `--connection <name>`            | Имя предварительно настроенного подключения из [файла конфигурации](#connection-credentials).                                                                                                   |

Полный список параметров командной строки см. в разделе [Параметры командной строки](#command-line-options).

### Подключение к ClickHouse Cloud \{#connecting-cloud\}

Информация о вашем сервисе ClickHouse Cloud доступна в консоли ClickHouse Cloud. Выберите сервис, к которому нужно подключиться, и нажмите **Connect**:

<Image img={cloud_connect_button} size="md" alt="Кнопка подключения к сервису ClickHouse Cloud" />

<br />

<br />

Выберите **Native** — отобразятся сведения и пример команды `clickhouse-client`:

<Image img={connection_details_native} size="md" alt="Сведения о TCP-подключении Native в ClickHouse Cloud" />

### Хранение подключений в файле конфигурации \{#connection-credentials\}

Вы можете хранить данные для подключения к одному или нескольким серверам ClickHouse в [файле конфигурации](#configuration_files).

Формат выглядит так:

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

См. [раздел о настройке файлов](#configuration_files) — там приведена дополнительная информация.

:::note
Чтобы сосредоточиться на синтаксисе запросов, в остальных примерах опущены параметры подключения (`--host`, `--port` и т. д.). Не забудьте добавить их при использовании команд.
:::

## Интерактивный режим \{#interactive-mode\}

### Использование интерактивного режима \{#using-interactive-mode\}

Чтобы запустить ClickHouse в интерактивном режиме, просто выполните:

```bash
clickhouse-client
```

Это откроет цикл Read-Eval-Print Loop (REPL), в котором можно интерактивно вводить SQL-запросы.
После подключения появится приглашение, в котором можно вводить запросы:

```bash
ClickHouse client version 25.x.x.x
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 25.x.x.x

hostname :)
```

В интерактивном режиме выходной формат по умолчанию — `PrettyCompact`.
Вы можете изменить формат в предложении `FORMAT` запроса или указав параметр командной строки `--format`.
Чтобы использовать формат Vertical, можно использовать `--vertical` или указать `\G` в конце запроса.
В этом формате каждое значение выводится на отдельной строке, что удобно для широких таблиц.

В интерактивном режиме по умолчанию всё введённое выполняется при нажатии `Enter`.
Точка с запятой в конце запроса не требуется.

Вы можете запустить клиент ClickHouse с параметром `-m, --multiline`.
Чтобы ввести многострочный запрос, введите обратную косую черту `\` перед переводом строки.
После нажатия `Enter` вам будет предложено ввести следующую строку запроса.
Чтобы выполнить запрос, завершите его точкой с запятой и нажмите `Enter`.

Клиент ClickHouse основан на `replxx` (аналог `readline`), поэтому поддерживает привычные сочетания клавиш и сохраняет историю.
По умолчанию история записывается в `~/.clickhouse-client-history`.

Чтобы выйти из клиента, нажмите `Ctrl+D` или введите вместо запроса одно из следующих значений:

* `exit` или `exit;`
* `quit` или `quit;`
* `q`, `Q` или `:q`
* `logout` или `logout;`

### Информация об обработке запроса \{#processing-info\}

При обработке запроса клиент отображает:

1. Ход выполнения, который по умолчанию обновляется не чаще 10 раз в секунду.
   Для быстрых запросов он может не успеть отобразиться.
2. Отформатированный запрос после разбора — для отладки.
3. Результат в указанном формате.
4. Количество строк в результате, прошедшее время и среднюю скорость обработки запроса.
   Все объёмы данных относятся к несжатым данным.

Вы можете отменить длительный запрос, нажав `Ctrl+C`.
Однако вам всё равно потребуется немного подождать, пока сервер прервёт запрос.
На некоторых этапах отменить запрос невозможно.
Если не дождаться и нажать `Ctrl+C` второй раз, клиент завершит работу.

Клиент ClickHouse позволяет передавать внешние данные (внешние временные таблицы) при выполнении запросов.
Дополнительная информация приведена в разделе [Внешние данные для обработки запроса](../engines/table-engines/special/external-data.md).

### Псевдонимы \{#cli_aliases\}

Вы можете использовать в REPL следующие псевдонимы:

* `\l` - SHOW DATABASES
* `\d` - SHOW TABLES
* `\c <DATABASE>` - USE DATABASE
* `.` - повторить последний запрос

### Сочетания клавиш \{#keyboard_shortcuts\}

* `Alt (Option) + Shift + e` — открыть редактор с текущим запросом. Используемый редактор можно задать через переменную окружения `EDITOR`. По умолчанию используется `vim`.
* `Alt (Option) + #` — закомментировать строку.
* `Ctrl + r` — нечёткий поиск по истории.

Полный список всех доступных сочетаний клавиш см. в [replxx](https://github.com/AmokHuginnsson/replxx/blob/1f149bf/src/replxx_impl.cxx#L262).

:::tip
Чтобы настроить корректную работу клавиши Meta (Option) в macOS:

iTerm2: перейдите в Preferences -&gt; Profile -&gt; Keys -&gt; Left Option key и нажмите Esc+
:::

## Пакетный режим \{#batch-mode\}

### Использование пакетного режима \{#using-batch-mode\}

Вместо интерактивной работы с клиентом ClickHouse его можно запустить в пакетном режиме.
В пакетном режиме ClickHouse выполняет один запрос и сразу завершает работу — без интерактивного приглашения и цикла ввода команд.

Один запрос можно указать следующим образом:

```bash
$ clickhouse-client "SELECT sum(number) FROM numbers(10)"
45
```

Вы также можете использовать параметр `--query` командной строки:

```bash
$ clickhouse-client --query "SELECT uniq(number) FROM numbers(10)"
10
```

Вы можете передать запрос через `stdin`:

```bash
$ echo "SELECT avg(number) FROM numbers(10)" | clickhouse-client
4.5
```

При наличии таблицы `messages` вы также можете вставить данные из командной строки:

```bash
$ echo "Hello\nGoodbye" | clickhouse-client --query "INSERT INTO messages FORMAT CSV"
```

Если указан параметр `--query`, любые входные данные добавляются к запросу после символа перевода строки.

### Вставка CSV-файла в удалённый сервис ClickHouse \{#cloud-example\}

В этом примере в существующую таблицу `cell_towers` в базе данных `default` вставляется CSV-файл `cell_towers.csv` с выборкой данных:

```bash
clickhouse-client --host HOSTNAME.clickhouse.cloud \
  --port 9440 \
  --user default \
  --password PASSWORD \
  --query "INSERT INTO cell_towers FORMAT CSVWithNames" \
  < cell_towers.csv
```

### Примеры вставки данных из командной строки \{#more-examples\}

Данные из командной строки можно вставить несколькими способами.
В примере ниже в таблицу ClickHouse вставляются две строки CSV-данных в пакетном режиме:

```bash
echo -ne "1, 'some text', '2016-08-14 00:00:00'\n2, 'some more text', '2016-08-14 00:00:01'" | \
  clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

В приведённом ниже примере `cat <<_EOF` начинает heredoc, который считывает всё содержимое до повторного появления `_EOF`, а затем выводит его:

```bash
cat <<_EOF | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
3, 'some text', '2016-08-14 00:00:00'
4, 'some more text', '2016-08-14 00:00:01'
_EOF
```

В примере ниже содержимое файла file.csv выводится в stdout с помощью `cat`, а затем через конвейер передаётся на вход `clickhouse-client`:

```bash
cat file.csv | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

В пакетном режиме формат данных по умолчанию — `TabSeparated`.
Вы можете задать формат в предложении `FORMAT` запроса, как показано в примере выше. См. [форматы](formats.md).

## Запросы с параметрами \{#cli-queries-with-parameters\}

Вы можете указывать параметры в запросе и передавать им значения через параметры командной строки.
Это позволяет не форматировать запрос на стороне клиента, подставляя в него конкретные динамические значения.
Например:

```bash
$ clickhouse-client --param_parName="[1, 2]" --query "SELECT {parName: Array(UInt16)}"
[1,2]
```

Параметры также можно задавать в [интерактивном сеансе](#interactive-mode):

```text
$ clickhouse-client
ClickHouse client version 25.X.X.XXX (official build).

#highlight-next-line
:) SET param_parName='[1, 2]';

SET param_parName = '[1, 2]'

Query id: 7ac1f84e-e89a-4eeb-a4bb-d24b8f9fd977

Ok.

0 rows in set. Elapsed: 0.000 sec.

#highlight-next-line
:) SELECT {parName:Array(UInt16)}

SELECT {parName:Array(UInt16)}

Query id: 0358a729-7bbe-4191-bb48-29b063c548a7

   ┌─_CAST([1, 2]⋯y(UInt16)')─┐
1. │ [1,2]                    │
   └──────────────────────────┘

1 row in set. Elapsed: 0.006 sec.
```

### Синтаксис запроса \{#cli-queries-with-parameters-syntax\}

В запросе заключите в фигурные скобки значения, которые нужно подставить с помощью параметров командной строки, в следующем формате:

```sql
{<name>:<data type>}
```

| Параметр    | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `name`      | Идентификатор заполнителя. Соответствующая настройка командной строки — `--param_<name> = value`.                                                                                                                                                                                                                                                                                                                                                                                         |
| `data type` | [Тип данных](../sql-reference/data-types/index.md) параметра. <br /><br />Например, структура данных вида `(integer, ('string', integer))` может иметь тип данных `Tuple(UInt8, Tuple(String, UInt8))` (также можно использовать и другие [целочисленные](../sql-reference/data-types/int-uint.md) типы). <br /><br />В качестве параметров также можно передавать имя таблицы, имя базы данных и имена столбцов; в этом случае в качестве типа данных следует использовать `Identifier`. |

### Примеры \{#cli-queries-with-parameters-examples\}

```bash
$ clickhouse-client --param_tuple_in_tuple="(10, ('dt', 10))" \
    --query "SELECT * FROM table WHERE val = {tuple_in_tuple:Tuple(UInt8, Tuple(String, UInt8))}"

$ clickhouse-client --param_tbl="numbers" --param_db="system" --param_col="number" --param_alias="top_ten" \
    --query "SELECT {col:Identifier} as {alias:Identifier} FROM {db:Identifier}.{tbl:Identifier} LIMIT 10"
```

## Генерация SQL с помощью ИИ \{#ai-sql-generation\}

Клиент ClickHouse включает встроенные средства ИИ для генерации SQL-запросов по описанию на естественном языке. Эта функция помогает писать сложные запросы без глубокого знания SQL.

Поддержка ИИ работает сразу, если у вас задана переменная окружения `OPENAI_API_KEY` или `ANTHROPIC_API_KEY`. Дополнительные параметры см. в разделе [Настройка](#ai-sql-generation-configuration).

### Использование \{#ai-sql-generation-usage\}

Чтобы воспользоваться генерацией SQL с помощью ИИ, добавьте префикс `??` перед запросом на естественном языке:

```bash
:) ?? show all users who made purchases in the last 30 days
```

ИИ будет:

1. Автоматически анализировать schema вашей базы данных
2. Генерировать подходящий SQL на основе обнаруженных таблиц и столбцов
3. Немедленно выполнять сгенерированный запрос

### Пример \{#ai-sql-generation-example\}

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

### Настройка \{#ai-sql-generation-configuration\}

Для генерации SQL с помощью ИИ необходимо настроить ИИ-провайдера в файле конфигурации клиента ClickHouse. Можно использовать OpenAI, Anthropic или любой API-сервис, совместимый с OpenAI.

#### Резервный вариант с использованием переменных окружения \{#ai-sql-generation-fallback\}

Если в настройках AI не указана конфигурация в 설정 파일, клиент ClickHouse автоматически попытается использовать переменные окружения:

1. Сначала проверяется переменная окружения `OPENAI_API_KEY`
2. Если она не найдена, проверяется переменная окружения `ANTHROPIC_API_KEY`
3. Если не найдена ни одна из них, функции AI будут отключены

Это позволяет быстро выполнить настройку без 설정 파일:

```bash
# Using OpenAI
export OPENAI_API_KEY=your-openai-key
clickhouse-client

# Using Anthropic
export ANTHROPIC_API_KEY=your-anthropic-key
clickhouse-client
```

#### Файл конфигурации \{#ai-sql-generation-configuration-file\}

Чтобы более гибко управлять настройками ИИ, задайте их в файле конфигурации клиента ClickHouse, расположенном по одному из следующих путей:

* `$XDG_CONFIG_HOME/clickhouse/config.xml` (или `~/.config/clickhouse/config.xml`, если `XDG_CONFIG_HOME` не задан) (формат XML)
* `$XDG_CONFIG_HOME/clickhouse/config.yaml` (или `~/.config/clickhouse/config.yaml`, если `XDG_CONFIG_HOME` не задан) (формат YAML)
* `~/.clickhouse-client/config.xml` (формат XML, устаревший путь)
* `~/.clickhouse-client/config.yaml` (формат YAML, устаревший путь)
* Или укажите пользовательский путь с помощью `--config-file`

<Tabs>
  <TabItem value="xml" label="XML" default>
    ```xml
    <config>
        <ai>
            <!-- Обязательно: ваш API-ключ (или задайте его через переменную окружения) -->
            <api_key>your-api-key-here</api_key>

            <!-- Обязательно: тип провайдера (openai, anthropic) -->
            <provider>openai</provider>

            <!-- Используемая модель (значения по умолчанию зависят от провайдера) -->
            <model>gpt-4o</model>

            <!-- Необязательно: пользовательская конечная точка API для OpenAI-совместимых сервисов -->
            <!-- <base_url>https://openrouter.ai/api</base_url> -->

            <!-- Настройки доступа к schema -->
            <enable_schema_access>true</enable_schema_access>

            <!-- Параметры генерации -->
            <temperature>0.0</temperature>
            <max_tokens>1000</max_tokens>
            <timeout_seconds>30</timeout_seconds>
            <max_steps>10</max_steps>

            <!-- Необязательно: пользовательский системный запрос -->
            <!-- <system_prompt>Вы — экспертный помощник по ClickHouse SQL...</system_prompt> -->
        </ai>
    </config>
    ```
  </TabItem>

  <TabItem value="yaml" label="YAML">
    ```yaml
    ai:
      # Обязательно: ваш API-ключ (или задайте его через переменную окружения)
      api_key: your-api-key-here

      # Обязательно: тип провайдера (openai, anthropic)
      provider: openai

      # Используемая модель
      model: gpt-4o

      # Необязательно: пользовательская конечная точка API для OpenAI-совместимых сервисов
      # base_url: https://openrouter.ai/api

      # Включить доступ к schema — позволяет ИИ запрашивать информацию о базе данных и таблицах
      enable_schema_access: true

      # Параметры генерации
      temperature: 0.0      # Управляет случайностью (0.0 = детерминированный результат)
      max_tokens: 1000      # Максимальная длина ответа
      timeout_seconds: 30   # Тайм-аут запроса
      max_steps: 10         # Максимальное число шагов исследования schema

      # Необязательно: пользовательский системный запрос
      # system_prompt: |
      #   Вы — экспертный помощник по ClickHouse SQL. Преобразуйте естественный язык в SQL.
      #   Уделяйте внимание производительности и используйте оптимизации ClickHouse.
      #   Всегда возвращайте исполняемый SQL без объяснений.
    ```
  </TabItem>
</Tabs>

<br />

**Использование OpenAI-совместимых API (например, OpenRouter):**

```yaml
ai:
  provider: openai  # Use 'openai' for compatibility
  api_key: your-openrouter-api-key
  base_url: https://openrouter.ai/api/v1
  model: anthropic/claude-3.5-sonnet  # Use OpenRouter model naming
```

**Примеры минимальной конфигурации:**

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

### Параметры \{#ai-sql-generation-parameters\}

<details>
  <summary>Обязательные параметры</summary>

  * `api_key` - Ваш API-ключ для сервиса ИИ. Можно не указывать, если он задан через переменную окружения:
    * OpenAI: `OPENAI_API_KEY`
    * Anthropic: `ANTHROPIC_API_KEY`
    * Примечание: API-ключ в файле конфигурации имеет приоритет над переменной окружения
  * `provider` - Провайдер ИИ: `openai` или `anthropic`
    * Если не указан, автоматически выбирается на основе доступных переменных окружения
</details>

<details>
  <summary>Конфигурация модели</summary>

  * `model` - Модель, которую нужно использовать (по умолчанию: зависит от провайдера)
    * OpenAI: `gpt-4o`, `gpt-4`, `gpt-3.5-turbo` и т. д.
    * Anthropic: `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229` и т. д.
    * OpenRouter: Используйте их схему именования моделей, например `anthropic/claude-3.5-sonnet`
</details>

<details>
  <summary>Настройки подключения</summary>

  * `base_url` - Пользовательская конечная точка API для OpenAI-совместимых сервисов (необязательно)
  * `timeout_seconds` - Тайм-аут запроса в секундах (по умолчанию: `30`)
</details>

<details>
  <summary>Изучение schema</summary>

  * `enable_schema_access` - Разрешить ИИ изучать schema базы данных (по умолчанию: `true`)
  * `max_steps` - Максимальное количество шагов вызова инструментов для изучения schema (по умолчанию: `10`)
</details>

<details>
  <summary>Параметры генерации</summary>

  * `temperature` - Управляет случайностью: 0.0 = детерминированно, 1.0 = более креативно (по умолчанию: `0.0`)
  * `max_tokens` - Максимальная длина ответа в токенах (по умолчанию: `1000`)
  * `system_prompt` - Пользовательские инструкции для ИИ (необязательно)
</details>

### Как это работает \{#ai-sql-generation-how-it-works\}

Генератор SQL на базе ИИ использует многоэтапный процесс:

<VerticalStepper headerLevel="list">
  1. **Обнаружение schema**

  ИИ использует встроенные инструменты для изучения вашей базы данных:

  * Выводит список доступных баз данных
  * Находит таблицы в соответствующих базах данных
  * Анализирует структуру таблиц с помощью команд `CREATE TABLE`

  2. **Генерация запроса**

  На основе обнаруженной schema ИИ генерирует SQL, который:

  * Соответствует вашему намерению, выраженному на естественном языке
  * Использует правильные имена таблиц и столбцов
  * Применяет подходящие соединения и агрегации

  3. **Выполнение**

  Сгенерированный SQL автоматически выполняется, а результаты отображаются
</VerticalStepper>

### Ограничения \{#ai-sql-generation-limitations\}

* Требуется активное подключение к интернету
* Использование API ограничено по скорости и может повлечь расходы со стороны поставщика ИИ
* Для сложных запросов может потребоваться несколько уточнений
* ИИ имеет доступ только для чтения к информации о schema, но не к фактическим данным

### Безопасность \{#ai-sql-generation-security\}

* API-ключи никогда не отправляются на серверы ClickHouse
* ИИ видит только информацию о schema (имена таблиц, столбцов и типы), но не сами данные
* Все сгенерированные запросы учитывают ваши текущие права доступа к базе данных

## Строка подключения \{#connection_string\}

### Использование \{#connection-string-usage\}

Клиент ClickHouse также поддерживает подключение к серверу ClickHouse с помощью строки подключения, аналогичной строкам, используемым в [MongoDB](https://www.mongodb.com/docs/manual/reference/connection-string/), [PostgreSQL](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING) и [MySQL](https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html#connecting-using-uri). Она имеет следующий синтаксис:

```text
clickhouse:[//[user[:password]@][hosts_and_ports]][/database][?query_parameters]
```

| Компонент (все необязательны) | Описание                                                                                                                                                                 | По умолчанию     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- |
| `user`                        | Имя пользователя базы данных.                                                                                                                                            | `default`        |
| `password`                    | Пароль пользователя базы данных. Если указан `:` и пароль пуст, клиент предложит ввести пароль пользователя.                                                             | -                |
| `hosts_and_ports`             | Список хостов и необязательных портов `host[:port] [, host:[port]], ...`.                                                                                                | `localhost:9000` |
| `database`                    | Имя базы данных.                                                                                                                                                         | `default`        |
| `query_parameters`            | Список пар ключ-значение `param1=value1[,&param2=value2], ...`. Для некоторых параметров значение не требуется. Имена параметров и их значения чувствительны к регистру. | -                |

### Примечания \{#connection-string-notes\}

Если имя пользователя, пароль или база данных указаны в строке подключения, их нельзя также указывать через `--user`, `--password` или `--database` (и наоборот).

Компонент host может быть либо именем хоста, либо адресом IPv4 или IPv6.
Адреса IPv6 должны быть заключены в `[]`:

```text
clickhouse://[2001:db8::1234]
```

Строки подключения могут содержать несколько хостов.
Клиент ClickHouse будет пытаться подключиться к этим хостам по порядку (слева направо).
После установления соединения попытки подключения к оставшимся хостам не выполняются.

Строка подключения должна быть указана первым аргументом `clickHouse-client`.
Строку подключения можно использовать вместе с произвольным количеством других [параметров командной строки](#command-line-options), кроме `--host` и `--port`.

Для `query_parameters` допустимы следующие ключи:

| Ключ               | Описание                                                                                                                                                     |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `secure` (или `s`) | Если указан этот ключ, клиент подключается к серверу по защищённому соединению (TLS). См. `--secure` в [параметрах командной строки](#command-line-options). |

**Процентное кодирование**

Символы, не входящие в US-ASCII, пробелы и специальные символы в следующих параметрах должны быть [закодированы с помощью процентного кодирования](https://en.wikipedia.org/wiki/URL_encoding):

* `user`
* `password`
* `hosts`
* `database`
* `параметры запроса`

### Примеры \{#connection_string_examples\}

Подключитесь к `localhost` через порт 9000 и выполните запрос `SELECT 1`.

```bash
clickhouse-client clickhouse://localhost:9000 --query "SELECT 1"
```

Подключитесь к `localhost` под пользователем `john` с паролем `secret`, указав хост `127.0.0.1` и порт `9000`

```bash
clickhouse-client clickhouse://john:secret@127.0.0.1:9000
```

Подключитесь к `localhost` от имени пользователя `default`, используя хост с адресом IPv6 `[::1]` и порт `9000`.

```bash
clickhouse-client clickhouse://[::1]:9000
```

Подключитесь к `localhost` через порт 9000 в многострочном режиме.

```bash
clickhouse-client clickhouse://localhost:9000 '-m'
```

Подключитесь к `localhost` по порту 9000, используя пользователя `default`.

```bash
clickhouse-client clickhouse://default@localhost:9000

# equivalent to:
clickhouse-client clickhouse://localhost:9000 --user default
```

Подключитесь к `localhost` на порту 9000; по умолчанию будет использоваться база данных `my_database`.

```bash
clickhouse-client clickhouse://localhost:9000/my_database

# equivalent to:
clickhouse-client clickhouse://localhost:9000 --database my_database
```

Подключитесь к `localhost` на порту 9000, по умолчанию используйте базу данных `my_database`, указанную в строке подключения, а для защищённого соединения — сокращённый параметр `s`.

```bash
clickhouse-client clickhouse://localhost/my_database?s

# equivalent to:
clickhouse-client clickhouse://localhost/my_database -s
```

Подключитесь к хосту по умолчанию, используя порт по умолчанию, пользователя по умолчанию и базу данных по умолчанию.

```bash
clickhouse-client clickhouse:
```

Подключитесь к хосту по умолчанию на порту по умолчанию от имени пользователя `my_user` без пароля.

```bash
clickhouse-client clickhouse://my_user@

# Using a blank password between : and @ means to asking the user to enter the password before starting the connection.
clickhouse-client clickhouse://my_user:@
```

Подключитесь к `localhost`, используя адрес электронной почты в качестве имени пользователя. Символ `@` необходимо закодировать как `%40`.

```bash
clickhouse-client clickhouse://some_user%40some_mail.com@localhost:9000
```

Подключитесь к одному из двух хостов: `192.168.1.15`, `192.168.1.25`.

```bash
clickhouse-client clickhouse://192.168.1.15,192.168.1.25
```

## Формат идентификатора запроса \{#query-id-format\}

В интерактивном режиме клиент ClickHouse показывает идентификатор каждого запроса. По умолчанию он имеет следующий формат:

```sql
Query id: 927f137d-00f1-4175-8914-0dd066365e96
```

Пользовательский формат можно задать в файле конфигурации внутри тега `query_id_formats`. Заполнитель `{query_id}` в форматной строке заменяется идентификатором запроса. Внутри тега можно указать несколько форматных строк.
Эту возможность можно использовать для генерации URL-адресов, упрощающих профилирование запросов.

**Пример**

```xml
<config>
  <query_id_formats>
    <speedscope>http://speedscope-host/#profileURL=qp%3Fid%3D{query_id}</speedscope>
  </query_id_formats>
</config>
```

При указанной выше конфигурации идентификатор запроса отображается в следующем формате:

```response
speedscope:http://speedscope-host/#profileURL=qp%3Fid%3Dc8ecc783-e753-4b38-97f1-42cddfb98b7d
```

## Файлы конфигурации \{#configuration_files\}

Клиент ClickHouse использует первый из следующих существующих файлов:

* Файл, указанный параметром `-c [ -C, --config, --config-file ]`.
* `./clickhouse-client.[xml|yaml|yml]`
* `$XDG_CONFIG_HOME/clickhouse/config.[xml|yaml|yml]` (или `~/.config/clickhouse/config.[xml|yaml|yml]`, если `XDG_CONFIG_HOME` не задана)
* `~/.clickhouse-client/config.[xml|yaml|yml]`
* `/etc/clickhouse-client/config.[xml|yaml|yml]`

См. пример файла конфигурации в репозитории ClickHouse: [`clickhouse-client.xml`](https://github.com/ClickHouse/ClickHouse/blob/master/programs/client/clickhouse-client.xml)

<Tabs>
  <TabItem value="xml" label="XML" default>
    ```xml
    <config>
        <user>username</user>
        <password>password</password>
        <secure>true</secure>
        <openSSL>
          <client>
            <caConfig>/etc/ssl/cert.pem</caConfig>
          </client>
        </openSSL>
    </config>
    ```
  </TabItem>

  <TabItem value="yaml" label="YAML">
    ```yaml
    user: username
    password: 'password'
    secure: true
    openSSL:
      client:
        caConfig: '/etc/ssl/cert.pem'
    ```
  </TabItem>
</Tabs>

## Параметры переменных среды \{#environment-variable-options\}

Имя пользователя, пароль и хост можно задать с помощью переменных среды `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD` и `CLICKHOUSE_HOST`.
Аргументы командной строки `--user`, `--password` или `--host`, а также [строка подключения](#connection_string) (если она указана), имеют приоритет над переменными среды.

## Параметры командной строки \{#command-line-options\}

Все параметры командной строки можно указать прямо в командной строке или задать по умолчанию в [файле конфигурации](#configuration_files).

### Общие параметры \{#command-line-options-general\}

| настройка                                            | Описание                                                                                                                                                          | По умолчанию           |
| --------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| `-c [ -C, --config, --config-file ] <path-to-file>` | Расположение файла конфигурации клиента, если он не находится в одном из стандартных мест. См. [Файлы конфигурации](#configuration_files).                        | -                      |
| `--help`                                            | Вывести краткую справку по использованию и завершить работу. Используйте вместе с `--verbose`, чтобы показать все доступные параметры, включая настройки запроса. | -                      |
| `--history_file <path-to-file>`                     | Путь к файлу, содержащему историю команд.                                                                                                                         | -                      |
| `--history_max_entries`                             | Максимальное количество записей в файле истории.                                                                                                                  | `1000000` (1 миллион)  |
| `--prompt <prompt>`                                 | Указать собственное приглашение командной строки.                                                                                                                 | `display_name` сервера |
| `--verbose`                                         | Увеличить подробность вывода.                                                                                                                                     | -                      |
| `-V [ --version ]`                                  | Вывести версию и завершить работу.                                                                                                                                | -                      |

### Параметры подключения \{#command-line-options-connection\}

| настройка                            | Description                                                                                                                                                                                                                                                                                                                                                                                                         | Default                                                                                                                                                  |
| ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--connection <name>`                | Имя предварительно настроенного подключения из файла конфигурации. См. [Учетные данные подключения](#connection-credentials).                                                                                                                                                                                                                                                                                       | -                                                                                                                                                        |
| `-d [ --database ] <database>`       | Выберите базу данных, которая будет использоваться по умолчанию для этого подключения.                                                                                                                                                                                                                                                                                                                              | Текущая база данных из настроек сервера (`default` по умолчанию)                                                                                         |
| `-h [ --host ] <host>`               | Имя хоста сервера ClickHouse, к которому нужно подключиться. Это может быть имя хоста, IPv4- или IPv6-адрес. Можно указать несколько хостов, передав аргумент несколько раз.                                                                                                                                                                                                                                        | `localhost`                                                                                                                                              |
| `--jwt <value>`                      | Использовать JSON Web Token (JWT) для аутентификации. <br /><br />JWT-аутентификация на сервере доступна только в ClickHouse Cloud.                                                                                                                                                                                                                                                                                 | -                                                                                                                                                        |
| `login`                              | Запускает OAuth-поток Device Grant для аутентификации через IdP. <br /><br />Для хостов ClickHouse Cloud параметры OAuth определяются автоматически, в противном случае их нужно указать через `--oauth-url`, `--oauth-client-id` и `--oauth-audience`.                                                                                                                                                             | -                                                                                                                                                        |
| `--no-warnings`                      | Отключить показ предупреждений из `system.warnings` при подключении клиента к серверу.                                                                                                                                                                                                                                                                                                                              | -                                                                                                                                                        |
| `--no-server-client-version-message` | Подавить сообщение о несовпадении версий сервера и клиента при подключении клиента к серверу.                                                                                                                                                                                                                                                                                                                       | -                                                                                                                                                        |
| `--password <password>`              | Пароль пользователя базы данных. Пароль для подключения также можно указать в файле конфигурации. Если пароль не указан, клиент запросит его.                                                                                                                                                                                                                                                                       | -                                                                                                                                                        |
| `--port <port>`                      | Порт, на котором сервер принимает подключения. Порты по умолчанию: 9440 (TLS) и 9000 (без TLS). <br /><br />Обратите внимание: клиент использует собственный протокол, а не HTTP(S).                                                                                                                                                                                                                                | `9440`, если указан `--secure`, в противном случае `9000`. Если имя хоста заканчивается на `.clickhouse.cloud`, по умолчанию всегда используется `9440`. |
| `-s [ --secure ]`                    | Использовать ли TLS. <br /><br />Автоматически включается при подключении к порту 9440 (защищенный порт по умолчанию) или к ClickHouse Cloud. <br /><br />Возможно, потребуется настроить CA‑сертификаты в [файле конфигурации](#configuration_files). Доступные настройки конфигурации такие же, как для [конфигурации TLS на стороне сервера](../operations/server-configuration-parameters/settings.md#openssl). | Автоматически включается при подключении к порту 9440 или к ClickHouse Cloud                                                                             |
| `--ssh-key-file <path-to-file>`      | Файл, содержащий закрытый SSH-ключ для аутентификации на сервере.                                                                                                                                                                                                                                                                                                                                                   | -                                                                                                                                                        |
| `--ssh-key-passphrase <value>`       | Кодовая фраза для закрытого SSH-ключа, указанного в `--ssh-key-file`.                                                                                                                                                                                                                                                                                                                                               | -                                                                                                                                                        |
| `--tls-sni-override <server name>`   | При использовании TLS — имя сервера (SNI), передаваемое во время рукопожатия.                                                                                                                                                                                                                                                                                                                                       | Хост, указанный через `-h` или `--host`.                                                                                                                 |
| `-u [ --user ] <username>`           | Пользователь базы данных, от имени которого выполняется подключение.                                                                                                                                                                                                                                                                                                                                                | `default`                                                                                                                                                |

:::note
Вместо параметров `--host`, `--port`, `--user` и `--password` клиент также поддерживает [строки подключения](#connection_string).
:::

### Параметры запроса \{#command-line-options-query\}

| настройка                        | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--param_<name>=<value>`        | Значение подстановки для параметра [запроса с параметрами](#cli-queries-with-parameters).                                                                                                                                                                                                                                                                                                                                                                                                     |
| `-q [ --query ] <query>`        | Запрос для выполнения в пакетном режиме. Его можно указать несколько раз (`--query "SELECT 1" --query "SELECT 2"`) либо один раз, перечислив несколько запросов через точку с запятой (`--query "SELECT 1; SELECT 2;"`). В последнем случае запросы `INSERT` с форматами, отличными от `VALUES`, должны быть разделены пустыми строками. <br /><br />Один запрос также можно указать без параметра: `clickhouse-client "SELECT 1"` <br /><br />Нельзя использовать вместе с `--queries-file`. |
| `--queries-file <path-to-file>` | Путь к файлу с запросами. `--queries-file` можно указывать несколько раз, например: `--queries-file queries1.sql --queries-file queries2.sql`. <br /><br />Нельзя использовать вместе с `--query`.                                                                                                                                                                                                                                                                                            |
| `-m [ --multiline ]`            | Если указан, разрешает многострочные запросы (запрос не отправляется при нажатии Enter). Запросы будут отправляться только после завершения точкой с запятой.                                                                                                                                                                                                                                                                                                                                 |

### Настройки запроса \{#command-line-options-query-settings\}

Настройки запроса можно указать в клиенте как параметры командной строки, например:

```bash
$ clickhouse-client --max_threads 1
```

Список настроек см. в разделе [Settings](../operations/settings/settings.md).

### Параметры форматирования \{#command-line-options-formatting\}

| настройка                  | Description                                                                                                                                                                                                                      | Default        |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| `-f [ --format ] <format>` | Используйте указанный формат для вывода результата. <br /><br />Список поддерживаемых форматов см. в разделе [Форматы входных и выходных данных](formats.md).                                                                    | `TabSeparated` |
| `--pager <command>`        | Передавайте весь вывод в эту команду. Обычно это `less` (например, `less -S` для отображения широких наборов результатов) или аналогичная команда.                                                                               | -              |
| `-E [ --vertical ]`        | Используйте [формат Vertical](/interfaces/formats/Vertical) для вывода результата. Это то же самое, что `--format Vertical`. В этом формате каждое значение выводится с новой строки, что удобно при отображении широких таблиц. | -              |

### Детали выполнения \{#command-line-options-execution-details\}

| настройка                         | Описание                                                                                                                                                                                                                                                                                                        | По умолчанию                                                         |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `--enable-progress-table-toggle` | Включить переключение таблицы прогресса по нажатию управляющей клавиши (Space). Применимо только в интерактивном режиме, когда включён вывод таблицы прогресса.                                                                                                                                                 | `enabled`                                                            |
| `--hardware-utilization`         | Выводить в индикаторе выполнения информацию об использовании аппаратных ресурсов.                                                                                                                                                                                                                               | -                                                                    |
| `--memory-usage`                 | Если указано, выводить использование памяти в `stderr` в неинтерактивном режиме. <br /><br />Возможные значения: <br />• `none` - не выводить использование памяти <br />• `default` - выводить количество байтов <br />• `readable` - выводить использование памяти в удобочитаемом формате                    | -                                                                    |
| `--print-profile-events`         | Выводить пакеты `ProfileEvents`.                                                                                                                                                                                                                                                                                | -                                                                    |
| `--progress`                     | Выводить ход выполнения запроса. <br /><br />Возможные значения: <br />• `tty\|on\|1\|true\|yes` - вывод в терминал в интерактивном режиме <br />• `err` - вывод в `stderr` в неинтерактивном режиме <br />• `off\|0\|false\|no` - отключить вывод прогресса                                                    | `tty` в интерактивном режиме, `off` в неинтерактивном (batch) режиме |
| `--progress-table`               | Выводить таблицу прогресса с изменяющимися метриками во время выполнения запроса. <br /><br />Возможные значения: <br />• `tty\|on\|1\|true\|yes` - вывод в терминал в интерактивном режиме <br />• `err` - вывод в `stderr` в неинтерактивном режиме <br />• `off\|0\|false\|no` - отключить таблицу прогресса | `tty` в интерактивном режиме, `off` в неинтерактивном (batch) режиме |
| `--stacktrace`                   | Выводить стеки вызовов исключений.                                                                                                                                                                                                                                                                              | -                                                                    |
| `-t [ --time ]`                  | Выводить время выполнения запроса в `stderr` в неинтерактивном режиме (для бенчмарков).                                                                                                                                                                                                                         | -                                                                    |