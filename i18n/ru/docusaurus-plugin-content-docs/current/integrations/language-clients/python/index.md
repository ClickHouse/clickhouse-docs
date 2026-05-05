---
keywords: ['clickhouse', 'python', 'client', 'connect', 'integrate']
slug: /integrations/python
description: 'Набор инструментов ClickHouse Connect для подключения Python к ClickHouse'
title: 'Интеграция Python с ClickHouse с помощью ClickHouse Connect'
doc_type: 'guide'
integration:
  - support_level: 'core'
  - category: 'language_client'
  - website: 'https://github.com/ClickHouse/clickhouse-connect'
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import CodeBlock from '@theme/CodeBlock';

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';


# Введение \{#introduction\}

ClickHouse Connect — это основной драйвер базы данных, обеспечивающий взаимодействие с широким спектром приложений на Python.

- Основной интерфейс — объект `Client` в пакете `clickhouse_connect.driver`. Этот базовый пакет также включает различные вспомогательные классы и утилитные функции, используемые для взаимодействия с сервером ClickHouse, а также реализации «контекстов» для продвинутого управления запросами вставки и выборки.
- Пакет `clickhouse_connect.datatypes` предоставляет базовую реализацию и подклассы для всех неэкспериментальных типов данных ClickHouse. Его основная функция — сериализация и десериализация данных ClickHouse в «родной» бинарный колоночный формат ClickHouse Native, используемый для достижения максимально эффективной передачи между ClickHouse и клиентскими приложениями.
- Классы на Cython/C в пакете `clickhouse_connect.cdriver` оптимизируют некоторые из наиболее распространённых операций сериализации и десериализации, что значительно повышает производительность по сравнению с реализацией на чистом Python.
- В пакете `clickhouse_connect.cc_sqlalchemy` имеется диалект [SQLAlchemy](https://www.sqlalchemy.org/), построенный на основе пакетов `datatypes` и `dbi`. Эта реализация поддерживает функциональность SQLAlchemy Core, включая запросы `SELECT` с `JOIN` (`INNER`, `LEFT OUTER`, `FULL OUTER`, `CROSS`), предложения `WHERE`, `ORDER BY`, операции `LIMIT`/`OFFSET`, `DISTINCT`, «лёгкие» операторы `DELETE` с условиями `WHERE`, рефлексию таблиц и базовые DDL-операции (`CREATE TABLE`, `CREATE`/`DROP DATABASE`). Хотя она не поддерживает продвинутые возможности ORM и расширенные DDL-функции, она обеспечивает надёжные возможности построения запросов, подходящие для большинства аналитических нагрузок к OLAP-ориентированной базе данных ClickHouse.
- Базовый драйвер и реализация [ClickHouse Connect SQLAlchemy](sqlalchemy.md) являются предпочтительным способом подключения ClickHouse к Apache Superset. Используйте подключение к базе данных `ClickHouse Connect` или строку подключения SQLAlchemy-диалекта `clickhousedb`.

Эта документация актуальна для релиза clickhouse-connect 0.9.2.

:::note
Официальный Python-драйвер ClickHouse Connect использует протокол HTTP для взаимодействия с сервером ClickHouse. Это обеспечивает поддержку HTTP-балансировщиков нагрузки и хорошо работает в корпоративных средах с межсетевыми экранами и прокси-серверами, но даёт немного более низкий уровень сжатия и производительности по сравнению с нативным протоколом на основе TCP, а также не поддерживает некоторые расширенные возможности, такие как отмена запросов. Для некоторых сценариев вы можете рассмотреть использование одного из [Community Python drivers](/interfaces/third-party/client-libraries.md), которые используют нативный протокол на основе TCP.
:::

## Требования и совместимость \{#requirements-and-compatibility\}

|       Python |   |       Платформа¹ |   |      ClickHouse |    | SQLAlchemy² |   | Apache Superset |   |  Pandas |   | Polars |   |
|-------------:|:--|-----------------:|:--|----------------:|:---|------------:|:--|----------------:|:--|--------:|:--|-------:|:--|
| 2.x, &lt;3.9 | ❌ |     Linux (x86) | ✅ |       &lt;25.x³ | 🟡 |  &lt;1.4.40 | ❌ |         &lt;1.4 | ❌ | &ge;1.5 | ✅ |    1.x | ✅ |
|        3.9.x | ✅ | Linux (Aarch64) | ✅ |           25.x³ | 🟡 |  &ge;1.4.40 | ✅ |           1.4.x | ✅ |     2.x | ✅ |        |   |
|       3.10.x | ✅ |     macOS (x86) | ✅ |    25.3.x (LTS) | ✅  |     &ge;2.x | ✅ |           1.5.x | ✅ |         |   |        |   |
|       3.11.x | ✅ |     macOS (ARM) | ✅ | 25.6.x (Stable) | ✅  |             |   |           2.0.x | ✅ |         |   |        |   |
|       3.12.x | ✅ |         Windows | ✅ | 25.7.x (Stable) | ✅  |             |   |           2.1.x | ✅ |         |   |        |   |
|       3.13.x | ✅ |                 |   |    25.8.x (LTS) | ✅  |             |   |           3.0.x | ✅ |         |   |        |   |
|              |   |                 |   | 25.9.x (Stable) | ✅  |             |   |                 |   |         |   |        |   |

¹ClickHouse Connect был специально протестирован на перечисленных платформах. Кроме того, для всех архитектур, поддерживаемых отличным проектом [`cibuildwheel`](https://cibuildwheel.readthedocs.io/en/stable/), собираются не прошедшие тестирование бинарные wheel-пакеты (с C-оптимизацией). Наконец, поскольку ClickHouse Connect также может работать как чистый Python, установка из исходников должна работать на любой актуальной установке Python.

²Поддержка SQLAlchemy ограничена функциональностью Core (запросы, базовый DDL). Возможности ORM не поддерживаются. Подробности см. в документации [SQLAlchemy Integration Support](sqlalchemy.md).

³ClickHouse Connect, как правило, хорошо работает с версиями вне официально поддерживаемого диапазона.

## Установка \{#installation\}

Установите ClickHouse Connect из [PyPI](https://pypi.org/project/clickhouse-connect/) с помощью pip:

`pip install clickhouse-connect`

ClickHouse Connect также можно установить из исходного кода:

* выполните `git clone` для [репозитория на GitHub](https://github.com/ClickHouse/clickhouse-connect)
* (необязательно) выполните `pip install cython`, чтобы собрать и включить оптимизации на C/Cython
* перейдите в корневой каталог проекта (`cd`) и выполните `pip install .`

## Политика поддержки \{#support-policy\}

Прежде чем сообщать о проблемах, обновите ClickHouse Connect до последней версии. Проблемы следует регистрировать в [GitHub-проекте](https://github.com/ClickHouse/clickhouse-connect/issues). В будущих релизах ClickHouse Connect планируется обеспечивать совместимость с активно поддерживаемыми версиями ClickHouse на момент выхода релиза. Актуальный список активно поддерживаемых версий сервера ClickHouse можно найти [здесь](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md). Если вы не уверены, какую версию сервера ClickHouse использовать, ознакомьтесь с обсуждением по этой теме [здесь](https://clickhouse.com/docs/knowledgebase/production#how-to-choose-between-clickhouse-releases). Наша матрица CI-тестов проверяет совместимость с двумя последними LTS-релизами и тремя последними стабильными релизами. Однако, благодаря использованию HTTP-протокола и минимальным критическим изменениям между релизами ClickHouse, ClickHouse Connect, как правило, хорошо работает и с версиями сервера вне официально поддерживаемого диапазона, хотя совместимость с некоторыми расширенными типами данных может различаться.

## Базовое использование \{#basic-usage\}

### Соберите параметры подключения \{#gather-your-connection-details\}

<ConnectionDetails />

### Установление соединения \{#establish-a-connection\}

Приведены два примера подключения к ClickHouse:

- Подключение к серверу ClickHouse на localhost.
- Подключение к сервису ClickHouse Cloud.

#### Используйте экземпляр клиента ClickHouse Connect для подключения к серверу ClickHouse на локальном хосте: \{#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-server-on-localhost\}

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='localhost', username='default', password='password')
```

#### Используйте экземпляр клиента ClickHouse Connect для подключения к сервису ClickHouse Cloud: \{#use-a-clickhouse-connect-client-instance-to-connect-to-a-clickhouse-cloud-service\}

:::tip
Используйте параметры подключения, полученные ранее. Для сервисов ClickHouse Cloud требуется TLS, поэтому используйте порт 8443.
:::

```python
import clickhouse_connect

client = clickhouse_connect.get_client(host='HOSTNAME.clickhouse.cloud', port=8443, username='default', password='your password')
```

### Взаимодействие с базой данных \{#interact-with-your-database\}

Чтобы выполнить SQL-команду ClickHouse, используйте метод клиента `command`:

```python
client.command('CREATE TABLE new_table (key UInt32, value String, metric Float64) ENGINE MergeTree ORDER BY key')
```

Для пакетной вставки данных используйте клиентский метод `insert` с двумерным массивом строк (записей) и значений:

```python
row1 = [1000, 'String Value 1000', 5.233]
row2 = [2000, 'String Value 2000', -107.04]
data = [row1, row2]
client.insert('new_table', data, column_names=['key', 'value', 'metric'])
```

Чтобы извлечь данные с помощью ClickHouse SQL, используйте метод клиента `query`:

```python
result = client.query('SELECT max(key), avg(metric) FROM new_table')
print(result.result_rows)
# Output: [(2000, -50.9035)]
```
