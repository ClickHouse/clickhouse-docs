---
description: 'Документация по клиенту командной строки ClickHouse'
sidebar_label: 'Клиент ClickHouse'
sidebar_position: 17
slug: /interfaces/cli
title: 'Клиент ClickHouse'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import cloud_connect_button from '@site/static/images/_snippets/cloud-connect-button.png';
import connection_details_native from '@site/static/images/_snippets/connection-details-native.png';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

ClickHouse предоставляет штатный клиент командной строки для выполнения SQL-запросов непосредственно на сервере ClickHouse.
Он поддерживает как интерактивный режим (для выполнения запросов в реальном времени), так и пакетный режим (для написания скриптов и автоматизации).
Результаты запросов могут отображаться в терминале или экспортироваться в файл, с поддержкой всех форматов вывода ClickHouse, таких как Pretty, CSV, JSON и другие. См. также [formats](formats.md).

Клиент предоставляет информацию в реальном времени о выполнении запроса с индикатором прогресса, количеством прочитанных строк, объёмом обработанных данных (в байтах) и временем выполнения запроса.
Он поддерживает как [параметры командной строки](#command-line-options), так и [конфигурационные файлы](#configuration_files).


## Установка \{#install\}

Чтобы загрузить ClickHouse, выполните команду:

```bash
curl https://clickhouse.com/ | sh
```

Чтобы установить его, выполните:

```bash
sudo ./clickhouse install
```

См. раздел [Install ClickHouse](../getting-started/install/install.mdx) для получения дополнительных вариантов установки.

Разные версии клиента и сервера совместимы между собой, но некоторые функции могут быть недоступны в более старых клиентах. Рекомендуется использовать одинаковую версию для клиента и сервера.


## Запуск \{#run\}

:::note
Если вы только скачали, но ещё не установили ClickHouse, используйте `./clickhouse client` вместо `clickhouse-client`.
:::

Чтобы подключиться к серверу ClickHouse, выполните команду:

```bash
$ clickhouse-client --host server

ClickHouse client version 24.12.2.29 (official build).
Connecting to server:9000 as user default.
Connected to ClickHouse server version 24.12.2.

:)
```

Укажите дополнительные параметры подключения при необходимости:

| Опция                            | Описание                                                                                                                                                                                        |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--port <port>`                  | Порт, на котором сервер ClickHouse принимает подключения. Порты по умолчанию: 9440 (TLS) и 9000 (без TLS). Обратите внимание, что ClickHouse Client использует нативный протокол, а не HTTP(S). |
| `-s [ --secure ]`                | Использовать ли TLS (как правило, определяется автоматически).                                                                                                                                  |
| `-u [ --user ] <username>`       | Пользователь базы данных, от имени которого выполняется подключение. По умолчанию подключается как пользователь `default`.                                                                      |
| `--password <password>`          | Пароль пользователя базы данных. Пароль для подключения также можно указать в конфигурационном файле. Если пароль не указан, клиент запросит его при подключении.                               |
| `-c [ --config ] <path-to-file>` | Расположение конфигурационного файла для ClickHouse Client, если он расположен не в одном из стандартных путей. См. раздел [Файлы конфигурации](#configuration_files).                          |
| `--connection <name>`            | Имя предварительно настроенного подключения из [конфигурационного файла](#connection-credentials).                                                                                              |

Полный список параметров командной строки см. в разделе [Параметры командной строки](#command-line-options).


### Подключение к ClickHouse Cloud \{#connecting-cloud\}

Сведения о вашем сервисе ClickHouse Cloud доступны в консоли ClickHouse Cloud. Выберите сервис, к которому вы хотите подключиться, и нажмите **Connect**:

<Image img={cloud_connect_button}
  size="md"
  alt="Кнопка подключения к сервису ClickHouse Cloud"
/>

<br/>

<br/>

Выберите **Native** — отобразятся параметры подключения и пример команды `clickhouse-client`:

<Image img={connection_details_native}
  size="md"
  alt="Параметры подключения ClickHouse Cloud Native TCP"
/>

### Сохранение подключений в конфигурационном файле \{#connection-credentials\}

Вы можете сохранять параметры подключения для одного или нескольких серверов ClickHouse в [конфигурационном файле](#configuration_files).

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

См. [раздел о файлах конфигурации](#configuration_files) для получения дополнительной информации.

:::note
Чтобы сосредоточиться на синтаксисе запроса, в остальных примерах опущены параметры подключения (`--host`, `--port` и т.д.). Не забудьте добавить их, когда будете использовать команды.
:::


## Интерактивный режим \{#interactive-mode\}

### Использование интерактивного режима \{#using-interactive-mode\}

Чтобы запустить ClickHouse в интерактивном режиме, достаточно выполнить:

```bash
clickhouse-client
```

Откроется интерактивная оболочка REPL (Read-Eval-Print Loop), где вы сможете вводить SQL-запросы.
После подключения появится приглашение, куда можно вводить запросы:

```bash
ClickHouse client version 25.x.x.x
Connecting to localhost:9000 as user default.
Connected to ClickHouse server version 25.x.x.x

hostname :)
```

В интерактивном режиме формат вывода по умолчанию — `PrettyCompact`.
Вы можете изменить формат в секции `FORMAT` запроса или, указав параметр командной строки `--format`.
Чтобы использовать формат `Vertical`, можно указать `--vertical` или добавить `\G` в конец запроса.
В этом формате каждое значение выводится на отдельной строке, что удобно для широких таблиц.

В интерактивном режиме по умолчанию при нажатии `Enter` выполняется всё введённое.
Точка с запятой в конце запроса необязательна.

Вы можете запустить клиент с параметром `-m, --multiline`.
Чтобы ввести многострочный запрос, введите обратную косую черту `\` перед переводом строки.
После нажатия `Enter` вам будет предложено ввести следующую строку запроса.
Чтобы выполнить запрос, завершите его точкой с запятой и нажмите `Enter`.

ClickHouse Client основан на `replxx` (аналог библиотеки `readline`), поэтому он использует знакомые комбинации клавиш и ведёт историю.
История по умолчанию записывается в `~/.clickhouse-client-history`.

Чтобы выйти из клиента, нажмите `Ctrl+D` или вместо запроса введите одну из следующих команд:

* `exit` или `exit;`
* `quit` или `quit;`
* `q`, `Q` или `:q`
* `logout` или `logout;`


### Информация об обработке запроса \{#processing-info\}

При обработке запроса клиент показывает:

1.  Прогресс, который по умолчанию обновляется не чаще 10 раз в секунду.
    Для быстрых запросов прогресс может не успеть отобразиться.
2.  Отформатированный запрос после разбора — для отладки.
3.  Результат в указанном формате.
4.  Количество строк в результате, затраченное время и среднюю скорость обработки запроса.
    Все объёмы данных относятся к несжатым данным.

Долгий запрос можно отменить, нажав `Ctrl+C`.
Однако всё равно придётся немного подождать, пока сервер прервёт запрос.
На некоторых этапах выполнения отменить запрос невозможно.
Если не ждать и нажать `Ctrl+C` второй раз, клиент завершит работу.

Клиент ClickHouse позволяет передавать внешние данные (внешние временные таблицы) для выполнения запроса.
Подробности см. в разделе [External data for query processing](../engines/table-engines/special/external-data.md).

### Псевдонимы \{#cli_aliases\}

Вы можете использовать следующие псевдонимы в REPL:

- `\l` - SHOW DATABASES
- `\d` - SHOW TABLES
- `\c <DATABASE>` - USE DATABASE
- `.` - повторить последний запрос

### Сочетания клавиш \{#keyboard_shortcuts\}

- `Alt (Option) + Shift + e` — открыть редактор с текущим запросом. Можно задать редактор с помощью переменной окружения `EDITOR`. По умолчанию используется `vim`.
- `Alt (Option) + #` — закомментировать строку.
- `Ctrl + r` — приблизительный поиск по истории.

Полный список всех доступных сочетаний клавиш приведён в [replxx](https://github.com/AmokHuginnsson/replxx/blob/1f149bf/src/replxx_impl.cxx#L262).

:::tip
Чтобы корректно настроить работу мета-клавиши (Option) в macOS:

iTerm2: перейдите в Preferences -> Profile -> Keys -> Left Option key и нажмите Esc+
:::

## Пакетный режим \{#batch-mode\}

### Использование пакетного режима \{#using-batch-mode\}

Вместо интерактивного использования ClickHouse Client вы можете запускать его в пакетном режиме.
В пакетном режиме ClickHouse выполняет один запрос и сразу завершает работу — без интерактивного режима или циклического ввода команд.

Один запрос можно задать следующим образом:

```bash
$ clickhouse-client "SELECT sum(number) FROM numbers(10)"
45
```

Можно также использовать опцию командной строки `--query`:

```bash
$ clickhouse-client --query "SELECT uniq(number) FROM numbers(10)"
10
```

Вы можете передать запрос через стандартный ввод (`stdin`):

```bash
$ echo "SELECT avg(number) FROM numbers(10)" | clickhouse-client
4.5
```

Если таблица `messages` уже существует, вы также можете вставлять данные из командной строки:

```bash
$ echo "Hello\nGoodbye" | clickhouse-client --query "INSERT INTO messages FORMAT CSV"
```

Когда указан параметр `--query`, любой введённый текст добавляется к запросу после символа перевода строки.


### Загрузка CSV-файла в удалённый сервис ClickHouse \{#cloud-example\}

В этом примере демонстрируется вставка данных из CSV-файла `cell_towers.csv` в существующую таблицу `cell_towers` в базе данных `default`:

```bash
clickhouse-client --host HOSTNAME.clickhouse.cloud \
  --port 9440 \
  --user default \
  --password PASSWORD \
  --query "INSERT INTO cell_towers FORMAT CSVWithNames" \
  < cell_towers.csv
```


### Примеры вставки данных из командной строки \{#more-examples\}

Существует несколько способов вставки данных из командной строки.
В следующем примере в таблицу ClickHouse в пакетном режиме вставляются две строки данных в формате CSV:

```bash
echo -ne "1, 'some text', '2016-08-14 00:00:00'\n2, 'some more text', '2016-08-14 00:00:01'" | \
  clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

В примере ниже `cat <<_EOF` запускает конструкцию heredoc, которая будет считывать всё до тех пор, пока снова не встретит `_EOF`, а затем выведет считанное:

```bash
cat <<_EOF | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
3, 'some text', '2016-08-14 00:00:00'
4, 'some more text', '2016-08-14 00:00:01'
_EOF
```

В примере ниже содержимое файла file.csv выводится на стандартный вывод (stdout) с помощью `cat` и по конвейеру передаётся в `clickhouse-client` как входные данные:

```bash
cat file.csv | clickhouse-client --database=test --query="INSERT INTO test FORMAT CSV";
```

В пакетном режиме формат данных по умолчанию — `TabSeparated` (см. [формат](formats.md)).
Вы можете задать формат в операторе `FORMAT` запроса, как показано в примере выше.


## Запросы с параметрами \{#cli-queries-with-parameters\}

Вы можете указать параметры в запросе и задавать их значения с помощью параметров командной строки.
Это избавляет от необходимости форматировать запрос с конкретными динамическими значениями на стороне клиента.
Например:

```bash
$ clickhouse-client --param_parName="[1, 2]" --query "SELECT {parName: Array(UInt16)}"
[1,2]
```

Параметры можно задавать и из [интерактивной сессии](#interactive-mode):

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

В запросе заключайте значения, которые вы хотите передавать через параметры командной строки, в фигурные скобки следующего вида:

```sql
{<name>:<data type>}
```

| Параметр    | Описание                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `name`      | Идентификатор параметра-плейсхолдера. Соответствующая ему опция командной строки: `--param_<name> = value`.                                                                                                                                                                                                                                                                                                                                                                          |
| `data type` | [Тип данных](../sql-reference/data-types/index.md) параметра. <br /><br />Например, структура данных вида `(integer, ('string', integer))` может иметь тип данных `Tuple(UInt8, Tuple(String, UInt8))` (можно также использовать другие типы [integer](../sql-reference/data-types/int-uint.md)). <br /><br />Также можно передавать имя таблицы, имя базы данных и имена столбцов в качестве параметров; в этом случае необходимо использовать `Identifier` в качестве типа данных. |


### Примеры \{#cli-queries-with-parameters-examples\}

```bash
$ clickhouse-client --param_tuple_in_tuple="(10, ('dt', 10))" \
    --query "SELECT * FROM table WHERE val = {tuple_in_tuple:Tuple(UInt8, Tuple(String, UInt8))}"

$ clickhouse-client --param_tbl="numbers" --param_db="system" --param_col="number" --param_alias="top_ten" \
    --query "SELECT {col:Identifier} as {alias:Identifier} FROM {db:Identifier}.{tbl:Identifier} LIMIT 10"
```


## Генерация SQL с поддержкой ИИ \{#ai-sql-generation\}

ClickHouse Client включает встроенный ИИ‑помощник для генерации SQL‑запросов по описаниям на естественном языке. Эта функция помогает пользователям составлять сложные запросы без глубоких знаний SQL.

ИИ‑помощник работает из коробки, если у вас установлена переменная окружения `OPENAI_API_KEY` или `ANTHROPIC_API_KEY`. Для более продвинутой конфигурации см. раздел [Конфигурация](#ai-sql-generation-configuration).

### Использование \{#ai-sql-generation-usage\}

Чтобы использовать генерацию SQL‑запросов с помощью ИИ, добавьте в начало запроса на естественном языке символы `??`:

```bash
:) ?? show all users who made purchases in the last 30 days
```

ИИ будет:

1. Автоматически проанализирует схему вашей базы данных
2. Сгенерирует соответствующий SQL на основе найденных таблиц и столбцов
3. Сразу выполнит сгенерированный запрос


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


### Конфигурация \{#ai-sql-generation-configuration\}

Для генерации SQL с использованием ИИ необходимо настроить поставщика ИИ в конфигурационном файле клиента ClickHouse. Вы можете использовать OpenAI, Anthropic или любой API‑сервис, совместимый с OpenAI.

#### Резервный механизм на основе переменных окружения \{#ai-sql-generation-fallback\}

Если конфигурация AI не задана в конфигурационном файле, ClickHouse Client автоматически попытается использовать переменные окружения:

1. Сначала проверяется переменная окружения `OPENAI_API_KEY`
2. Если она не найдена, проверяется переменная окружения `ANTHROPIC_API_KEY`
3. Если не найдена ни одна из них, функции AI будут отключены

Благодаря этому можно быстро выполнить настройку без конфигурационных файлов:

```bash
# Using OpenAI
export OPENAI_API_KEY=your-openai-key
clickhouse-client

# Using Anthropic
export ANTHROPIC_API_KEY=your-anthropic-key
clickhouse-client
```


#### Файл конфигурации \{#ai-sql-generation-configuration-file\}

Для более гибкого управления настройками ИИ укажите их в конфигурационном файле клиента ClickHouse, расположенном по адресу:

* `$XDG_CONFIG_HOME/clickhouse/config.xml` (или `~/.config/clickhouse/config.xml`, если `XDG_CONFIG_HOME` не задан) (формат XML)
* `$XDG_CONFIG_HOME/clickhouse/config.yaml` (или `~/.config/clickhouse/config.yaml`, если `XDG_CONFIG_HOME` не задан) (формат YAML)
* `~/.clickhouse-client/config.xml` (формат XML, устаревший путь)
* `~/.clickhouse-client/config.yaml` (формат YAML, устаревший путь)
* Или укажите собственный путь с помощью `--config-file`

<Tabs>
  <TabItem value="xml" label="XML" default>
    ```xml
    <config>
        <ai>
            <!-- Обязательно: ваш API-ключ (или задайте через переменную окружения) -->
            <api_key>your-api-key-here</api_key>

            <!-- Обязательно: тип провайдера (openai, anthropic) -->
            <provider>openai</provider>

            <!-- Используемая модель (значения по умолчанию зависят от провайдера) -->
            <model>gpt-4o</model>

            <!-- Необязательно: пользовательская конечная точка API для сервисов, совместимых с OpenAI -->
            <!-- <base_url>https://openrouter.ai/api</base_url> -->

            <!-- Настройки исследования схемы -->
            <enable_schema_access>true</enable_schema_access>

            <!-- Параметры генерации -->
            <temperature>0.0</temperature>
            <max_tokens>1000</max_tokens>
            <timeout_seconds>30</timeout_seconds>
            <max_steps>10</max_steps>

            <!-- Необязательно: пользовательский системный промпт -->
            <!-- <system_prompt>You are an expert ClickHouse SQL assistant...</system_prompt> -->
        </ai>
    </config>
    ```
  </TabItem>

  <TabItem value="yaml" label="YAML">
    ```yaml
    ai:
      # Обязательно: ваш API-ключ (или задайте через переменную окружения)
      api_key: your-api-key-here

      # Обязательно: тип провайдера (openai, anthropic)
      provider: openai

      # Используемая модель
      model: gpt-4o

      # Необязательно: пользовательская конечная точка API для сервисов, совместимых с OpenAI
      # base_url: https://openrouter.ai/api

      # Включить доступ к схеме — позволяет ИИ запрашивать информацию о базах данных и таблицах
      enable_schema_access: true

      # Параметры генерации
      temperature: 0.0      # Управляет степенью случайности (0.0 = детерминированно)
      max_tokens: 1000      # Максимальная длина ответа
      timeout_seconds: 30   # Тайм-аут запроса
      max_steps: 10         # Максимальное число шагов исследования схемы

      # Необязательно: пользовательский системный промпт
      # system_prompt: |
      #   You are an expert ClickHouse SQL assistant. Convert natural language to SQL.
      #   Focus on performance and use ClickHouse-specific optimizations.
      #   Always return executable SQL without explanations.
    ```
  </TabItem>
</Tabs>

<br />

**Использование API, совместимых с OpenAI (например, OpenRouter):**

```yaml
ai:
  provider: openai  # Use 'openai' for compatibility
  api_key: your-openrouter-api-key
  base_url: https://openrouter.ai/api/v1
  model: anthropic/claude-3.5-sonnet  # Use OpenRouter model naming
```

**Примеры минимальных конфигураций:**

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

- `api_key` - Ваш API-ключ для AI-сервиса. Можно опустить, если он задан через переменную окружения:
  - OpenAI: `OPENAI_API_KEY`
  - Anthropic: `ANTHROPIC_API_KEY`
  - Примечание: API-ключ в конфигурационном файле имеет приоритет над переменной окружения
- `provider` - Провайдер AI: `openai` или `anthropic`
  - Если не указан, выполняется автоматический выбор на основе доступных переменных окружения

</details>

<details>
<summary>Конфигурация модели</summary>

- `model` - Используемая модель (по умолчанию зависит от провайдера)
  - OpenAI: `gpt-4o`, `gpt-4`, `gpt-3.5-turbo` и т. д.
  - Anthropic: `claude-3-5-sonnet-20241022`, `claude-3-opus-20240229` и т. д.
  - OpenRouter: используйте их схему именования моделей, например `anthropic/claude-3.5-sonnet`

</details>

<details>
<summary>Настройки подключения</summary>

- `base_url` - Пользовательская конечная точка API для сервисов, совместимых с OpenAI (необязательно)
- `timeout_seconds` - Тайм-аут запроса в секундах (по умолчанию: `30`)

</details>

<details>
<summary>Исследование схемы</summary>

- `enable_schema_access` - Разрешить AI исследовать схемы баз данных (по умолчанию: `true`)
- `max_steps` - Максимальное количество шагов вызова инструментов при исследовании схемы (по умолчанию: `10`)

</details>

<details>
<summary>Параметры генерации</summary>

- `temperature` - Управляет степенью случайности: 0.0 = детерминированно, 1.0 = более творческие ответы (по умолчанию: `0.0`)
- `max_tokens` - Максимальная длина ответа в токенах (по умолчанию: `1000`)
- `system_prompt` - Пользовательские инструкции для AI (необязательно)

</details>

### Как это работает \{#ai-sql-generation-how-it-works\}

Генератор SQL на основе ИИ использует многошаговый процесс:

<VerticalStepper headerLevel="list">

1. **Обнаружение схемы**

ИИ использует встроенные инструменты для анализа вашей базы данных:
- Перечисляет доступные базы данных
- Обнаруживает таблицы в соответствующих базах данных
- Изучает структуры таблиц с помощью команд `CREATE TABLE`

2. **Генерация запроса**

На основе обнаруженной схемы ИИ генерирует SQL, который:
- Соответствует вашему запросу на естественном языке
- Использует корректные имена таблиц и столбцов
- Применяет подходящие JOIN-операции и агрегации

3. **Выполнение**

Сгенерированный SQL автоматически выполняется, и результаты отображаются

</VerticalStepper>

### Ограничения \{#ai-sql-generation-limitations\}

- Требуется активное подключение к Интернету
- Использование API подчиняется ограничениям по частоте запросов и тарифам провайдера ИИ
- Для сложных запросов может потребоваться несколько итераций уточнения
- Модель ИИ имеет доступ только для чтения к сведениям о схеме, но не к реальным данным

### Безопасность \{#ai-sql-generation-security\}

- Ключи API никогда не отправляются на серверы ClickHouse
- ИИ получает доступ только к информации о схеме (именам таблиц/столбцов и типам), но не к реальным данным
- Все сгенерированные запросы соблюдают ваши действующие права доступа к базе данных

## Строка подключения \{#connection_string\}

### Использование \{#connection-string-usage\}

ClickHouse Client также поддерживает, в качестве альтернативы, подключение к серверу ClickHouse по строке подключения, аналогичной той, что используется в [MongoDB](https://www.mongodb.com/docs/manual/reference/connection-string/), [PostgreSQL](https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING), [MySQL](https://dev.mysql.com/doc/refman/8.0/en/connecting-using-uri-or-key-value-pairs.html#connecting-using-uri). Она имеет следующий синтаксис:

```text
clickhouse:[//[user[:password]@][hosts_and_ports]][/database][?query_parameters]
```

| Компонент (все необязательны) | Описание                                                                                                                                                                 | Значение по умолчанию |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- |
| `user`                        | Имя пользователя базы данных.                                                                                                                                            | `default`             |
| `password`                    | Пароль пользователя базы данных. Если указан символ `:` и пароль не задан, клиент запросит пароль пользователя.                                                          | -                     |
| `hosts_and_ports`             | Список хостов и необязательных портов `host[:port] [, host:[port]], ...`.                                                                                                | `localhost:9000`      |
| `database`                    | Имя базы данных.                                                                                                                                                         | `default`             |
| `query_parameters`            | Список пар ключ–значение `param1=value1[,&param2=value2], ...`. Для некоторых параметров значение не требуется. Имена параметров и их значений чувствительны к регистру. | -                     |


### Примечания \{#connection-string-notes\}

Если имя пользователя, пароль или база данных указаны в строке подключения, их нельзя дополнительно указывать через `--user`, `--password` или `--database` (и наоборот).

Компонент host может быть либо именем хоста, либо адресом IPv4 или IPv6.
Адреса IPv6 должны быть указаны в `[]`:

```text
clickhouse://[2001:db8::1234]
```

Строки подключения могут содержать несколько хостов.
ClickHouse Client будет пытаться подключиться к этим хостам по порядку (слева направо).
После установления соединения попытки подключения к оставшимся хостам не выполняются.

Строка подключения должна быть указана в качестве первого аргумента `clickHouse-client`.
Строку подключения можно комбинировать с произвольным количеством других [параметров командной строки](#command-line-options), за исключением `--host` и `--port`.

Для `query_parameters` разрешены следующие ключи:

| Key               | описание                                                                                                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `secure` (or `s`) | Если указан, клиент будет подключаться к серверу по защищённому соединению (TLS). См. `--secure` в [параметрах командной строки](#command-line-options). |

**Процентное кодирование**

Символы, не входящие в набор US-ASCII, пробелы и специальные символы в следующих параметрах должны быть [закодированы в формате percent-encoding](https://en.wikipedia.org/wiki/URL_encoding):

* `user`
* `password`
* `hosts`
* `database`
* `query parameters`


### Примеры \{#connection_string_examples\}

Подключитесь к `localhost` на порту 9000 и выполните запрос `SELECT 1`.

```bash
clickhouse-client clickhouse://localhost:9000 --query "SELECT 1"
```

Подключитесь к `localhost` под пользователем `john` с паролем `secret` на хосте `127.0.0.1` и порту `9000`

```bash
clickhouse-client clickhouse://john:secret@127.0.0.1:9000
```

Подключитесь к `localhost` под пользователем `default`, используя хост с IPv6-адресом `[::1]` и порт `9000`.

```bash
clickhouse-client clickhouse://[::1]:9000
```

Подключитесь к `localhost` на порту 9000 в режиме многострочного ввода.

```bash
clickhouse-client clickhouse://localhost:9000 '-m'
```

Подключитесь к `localhost` через порт 9000 от имени пользователя `default`.

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

Подключитесь к `localhost` на порту 9000, при этом по умолчанию будет использоваться база данных `my_database`, указанная в строке подключения, а для защищённого соединения применён сокращённый параметр `s`.

```bash
clickhouse-client clickhouse://localhost/my_database?s

# equivalent to:
clickhouse-client clickhouse://localhost/my_database -s
```

Подключитесь к хосту, порту, пользователю и базе данных по умолчанию.

```bash
clickhouse-client clickhouse:
```

Подключитесь к хосту по умолчанию на порту по умолчанию под пользователем `my_user` без пароля.

```bash
clickhouse-client clickhouse://my_user@

# Using a blank password between : and @ means to asking the user to enter the password before starting the connection.
clickhouse-client clickhouse://my_user:@
```

Подключитесь к `localhost`, используя адрес электронной почты в качестве имени пользователя. Символ `@` кодируется как `%40` (percent-encoding).

```bash
clickhouse-client clickhouse://some_user%40some_mail.com@localhost:9000
```

Подключитесь к одному из следующих хостов: `192.168.1.15`, `192.168.1.25`.

```bash
clickhouse-client clickhouse://192.168.1.15,192.168.1.25
```


## Формат идентификатора запроса \{#query-id-format\}

В интерактивном режиме ClickHouse Client показывает идентификатор для каждого выполняемого запроса. По умолчанию его формат следующий:

```sql
Query id: 927f137d-00f1-4175-8914-0dd066365e96
```

Произвольный формат может быть задан в файле конфигурации внутри тега `query_id_formats`. Заполнитель `{query_id}` в строке формата заменяется идентификатором запроса. Внутри тега может быть указано несколько форматных строк.
Эта возможность может использоваться для генерации URL-адресов, чтобы упростить профилирование запросов.

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

ClickHouse Client использует первый существующий файл из следующего списка:

- Файл, указанный параметром `-c [ -C, --config, --config-file ]`.
- `./clickhouse-client.[xml|yaml|yml]`
- `$XDG_CONFIG_HOME/clickhouse/config.[xml|yaml|yml]` (или `~/.config/clickhouse/config.[xml|yaml|yml]`, если `XDG_CONFIG_HOME` не установлен)
- `~/.clickhouse-client/config.[xml|yaml|yml]`
- `/etc/clickhouse-client/config.[xml|yaml|yml]`

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

## Параметры переменных окружения \{#environment-variable-options\}

Имя пользователя, пароль и хост могут быть заданы с помощью переменных окружения `CLICKHOUSE_USER`, `CLICKHOUSE_PASSWORD` и `CLICKHOUSE_HOST`.
Аргументы командной строки `--user`, `--password` или `--host`, либо [строка подключения](#connection_string) (если указана), имеют приоритет над переменными окружения.

## Параметры командной строки \{#command-line-options\}

Все параметры командной строки могут быть заданы напрямую в командной строке или в качестве значений по умолчанию в [файле конфигурации](#configuration_files).

### Общие параметры \{#command-line-options-general\}

| Параметр                                           | Описание                                                                                                                           | Значение по умолчанию        |
|----------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------|------------------------------|
| `-c [ -C, --config, --config-file ] <path-to-file>` | Расположение файла конфигурации клиента, если он не находится ни в одном из стандартных путей. См. раздел [Configuration Files](#configuration_files). | -                            |
| `--help`                                           | Вывести краткую справку по использованию и завершить работу. Используйте вместе с `--verbose` для отображения всех возможных параметров, включая настройки запроса. | -                            |
| `--history_file <path-to-file>`                    | Путь к файлу, содержащему историю команд.                                                                                          | -                            |
| `--history_max_entries`                            | Максимальное количество записей в файле истории.                                                                                   | `1000000` (1 миллион)        |
| `--prompt <prompt>`                                | Задать пользовательскую строку приглашения.                                                                                        | `display_name` сервера       |
| `--verbose`                                        | Увеличить подробность выходных сообщений.                                                                                          | -                            |
| `-V [ --version ]`                                 | Вывести версию и завершить работу.                                                                                                 | -                            |

### Параметры подключения \{#command-line-options-connection\}

| Параметр                         | Описание                                                                                                                                                                                                                                                                                                                           | Значение по умолчанию                                                                                             |
|----------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------|
| `--connection <name>`            | Имя заранее настроенного подключения из файла конфигурации. См. раздел [Учетные данные подключения](#connection-credentials).                                                                                                                                                                                                     | -                                                                                                                 |
| `-d [ --database ] <database>`   | База данных, которая будет использоваться по умолчанию для этого подключения.                                                                                                                                                                                                                                                     | Текущая база данных из настроек сервера (`default` по умолчанию)                                                 |
| `-h [ --host ] <host>`           | Имя хоста сервера ClickHouse, к которому нужно подключиться. Может быть либо именем хоста, либо адресом IPv4 или IPv6. Можно указать несколько хостов через несколько аргументов.                                                                                                                                                | `localhost`                                                                                                       |
| `--jwt <value>`                  | Использовать JSON Web Token (JWT) для аутентификации. <br/><br/>Авторизация с использованием JWT на стороне сервера доступна только в ClickHouse Cloud.                                                                                                                                                                         | -                                                                                                                 |
| `login`                          | Запускает OAuth-поток авторизации с device grant для аутентификации через IDP. <br/><br/>Для хостов ClickHouse Cloud параметры OAuth определяются автоматически, в противном случае их необходимо указать с помощью `--oauth-url`, `--oauth-client-id` и `--oauth-audience`.                                                       | -                                                                                                                 |
| `--no-warnings`                  | Отключить показ предупреждений из `system.warnings` при подключении клиента к серверу.                                                                                                                                                                                                                                           | -                                                                                                                 |
| `--no-server-client-version-message`                  | Отключить сообщение о несоответствии версий клиента и сервера при подключении клиента к серверу.                                                                                                                                                                                                                               | -                                                                                                                 |
| `--password <password>`          | Пароль пользователя базы данных. Пароль для подключения также можно указать в файле конфигурации. Если пароль не указан, клиент запросит его.                                                                                                                                                                                  | -                                                                                                                 |
| `--port <port>`                  | Порт, на котором сервер принимает подключения. Порты по умолчанию: 9440 (TLS) и 9000 (без TLS). <br/><br/>Примечание: клиент использует собственный (native) протокол, а не HTTP(S).                                                                                                                                           | `9440`, если указан `--secure`, иначе `9000`. Всегда по умолчанию `9440`, если имя хоста оканчивается на `.clickhouse.cloud`. |
| `-s [ --secure ]`                | Использовать ли TLS. <br/><br/>Автоматически включается при подключении к порту 9440 (безопасный порт по умолчанию) или к ClickHouse Cloud. <br/><br/>Может потребоваться настроить корневые сертификаты (CA) в [файле конфигурации](#configuration_files). Доступные параметры конфигурации такие же, как для [настроек TLS на стороне сервера](../operations/server-configuration-parameters/settings.md#openssl). | Автоматически включается при подключении к порту 9440 или ClickHouse Cloud                                       |
| `--ssh-key-file <path-to-file>`  | Файл, содержащий приватный SSH-ключ для аутентификации на сервере.                                                                                                                                                                                                                                                               | -                                                                                                                 |
| `--ssh-key-passphrase <value>`   | Парольная фраза для приватного SSH-ключа, указанного в `--ssh-key-file`.                                                                                                                                                                                                                                                         | -                                                                                                                 |
| `--tls-sni-override <server name>`       | При использовании TLS — имя сервера (SNI), которое будет передано при TLS-рукопожатии.                                                                                                                                                                                                                                                                                 | Хост, указанный через `-h` или `--host`.                                                                                                               |
| `-u [ --user ] <username>`       | Пользователь базы данных, от имени которого выполняется подключение.                                                                                                                                                                                                                                                             | `default`                                                                                                         |

:::note
Вместо параметров `--host`, `--port`, `--user` и `--password` клиент также поддерживает [строки подключения](#connection_string).
:::

### Параметры запросов \{#command-line-options-query\}

| Option                          | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
|---------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `--param_<name>=<value>`        | Значение подстановки для параметра [запроса с параметрами](#cli-queries-with-parameters).                                                                                                                                                                                                                                                                                                                                                                                                          |
| `-q [ --query ] <query>`        | Запрос для выполнения в пакетном режиме. Можно указать несколько раз (`--query "SELECT 1" --query "SELECT 2"`) или один раз с несколькими запросами, разделёнными точкой с запятой (`--query "SELECT 1; SELECT 2;"`). Во втором случае `INSERT`-запросы с форматами, отличными от `VALUES`, должны быть разделены пустыми строками. <br/><br/>Один запрос также можно указать без параметра: `clickhouse-client "SELECT 1"` <br/><br/>Нельзя использовать вместе с `--queries-file`.                               |
| `--queries-file <path-to-file>` | Путь к файлу, содержащему запросы. `--queries-file` можно указать несколько раз, например: `--queries-file queries1.sql --queries-file queries2.sql`. <br/><br/>Нельзя использовать вместе с `--query`.                                                                                                                                                                                                                                                                                            |
| `-m [ --multiline ]`            | Если указана, разрешает многострочные запросы (запрос не отправляется по нажатию Enter). Запросы будут отправляться только тогда, когда они заканчиваются точкой с запятой.                                                                                                                                                                                                                                                                                                                      |

### Настройки запросов \{#command-line-options-query-settings\}

Настройки запросов можно задавать в виде параметров командной строки клиента, например:

```bash
$ clickhouse-client --max_threads 1
```

Список настроек см. в разделе [Settings](../operations/settings/settings.md).


### Параметры форматирования \{#command-line-options-formatting\}

| Параметр                  | Описание                                                                                                                                                                                                                     | Значение по умолчанию |
|---------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------|
| `-f [ --format ] <format>` | Использовать указанный формат для вывода результата. <br/><br/>Список поддерживаемых форматов см. в разделе [Formats for Input and Output Data](formats.md).                                                                | `TabSeparated`         |
| `--pager <command>`       | Направить весь вывод в эту команду. Как правило, используется `less` (например, `less -S` для отображения широких наборов результатов) или аналогичная команда.                                                              | -                      |
| `-E [ --vertical ]`       | Использовать [формат Vertical](/interfaces/formats/Vertical) для вывода результата. То же, что и `--format Vertical`. В этом формате каждое значение выводится на отдельной строке, что удобно при отображении широких таблиц. | -                      |

### Подробности выполнения \{#command-line-options-execution-details\}

| Параметр                          | Описание                                                                                                                                                                                                                                                                                                            | Значение по умолчанию                                               |
|-----------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------|
| `--enable-progress-table-toggle`  | Включает переключение таблицы прогресса при нажатии клавиши пробел. Применимо только в интерактивном режиме с включённым выводом таблицы прогресса.                                                                                                                                                                | `enabled`                                                           |
| `--hardware-utilization`          | Выводит информацию об использовании аппаратных ресурсов в индикаторе прогресса.                                                                                                                                                                                                                                    | -                                                                   |
| `--memory-usage`                  | Если указано, выводит использование памяти в `stderr` в неинтерактивном режиме. <br/><br/>Возможные значения: <br/>• `none` — не выводить использование памяти <br/>• `default` — выводить количество байт <br/>• `readable` — выводить использование памяти в человекочитаемом формате                                 | -                                                                   |
| `--print-profile-events`          | Выводит пакеты `ProfileEvents`.                                                                                                                                                                                                                                                                                     | -                                                                   |
| `--progress`                      | Выводит прогресс выполнения запроса. <br/><br/>Возможные значения: <br/>• `tty\|on\|1\|true\|yes` — вывод в терминал в интерактивном режиме <br/>• `err` — вывод в `stderr` в неинтерактивном режиме <br/>• `off\|0\|false\|no` — отключает вывод прогресса                                                   | `tty` в интерактивном режиме, `off` в неинтерактивном (batch) режиме |
| `--progress-table`                | Выводит таблицу прогресса с меняющимися метриками во время выполнения запроса. <br/><br/>Возможные значения: <br/>• `tty\|on\|1\|true\|yes` — вывод в терминал в интерактивном режиме <br/>• `err` — вывод в `stderr` в неинтерактивном режиме <br/>• `off\|0\|false\|no` — отключает таблицу прогресса | `tty` в интерактивном режиме, `off` в неинтерактивном (batch) режиме |
| `--stacktrace`                    | Выводит стеки вызовов исключений.                                                                                                                                                                                                                                                                                   | -                                                                   |
| `-t [ --time ]`                   | Выводит время выполнения запроса в `stderr` в неинтерактивном режиме (для бенчмарков).                                                                                                                                                                                                                            | -                                                                   |