---
slug: /use-cases/AI/MCP/ai-agent-libraries/upsonic
sidebar_label: 'Интеграция с Upsonic'
title: 'Как создать AI-агента с помощью Upsonic и сервера ClickHouse MCP'
pagination_prev: null
pagination_next: null
description: 'Узнайте, как создать AI-агента с помощью Upsonic и сервера ClickHouse MCP'
keywords: ['ClickHouse', 'MCP', 'Upsonic']
show_related_blogs: true
doc_type: 'guide'
---



# Как создать AI-агента с Upsonic и сервером MCP ClickHouse

В этом руководстве вы узнаете, как создать AI-агента [Upsonic](https://github.com/Upsonic/Upsonic/tree/master), который может взаимодействовать с 
[SQL-песочницей ClickHouse](https://sql.clickhouse.com/), используя [сервер MCP ClickHouse](https://github.com/ClickHouse/mcp-clickhouse).

:::note Пример ноутбука
Этот пример доступен в виде ноутбука в [репозитории примеров](https://github.com/ClickHouse/examples/blob/main/ai/mcp/upsonic/upsonic.ipynb).
:::



## Предварительные требования {#prerequisites}

- В вашей системе должен быть установлен Python.
- В вашей системе должен быть установлен `pip`.
- Вам потребуется ключ API OpenAI.

Вы можете выполнить следующие шаги либо в интерактивной оболочке Python (REPL), либо с помощью скрипта.

<VerticalStepper headerLevel="h2">


## Установка библиотек

Установите библиотеку mcp-agent, выполнив следующие команды:

```python
pip install -q --upgrade pip
pip install -q "upsonic[loaders,tools]" openai
pip install -q ipywidgets
```


## Настройка учётных данных

Далее вам нужно указать свой ключ API OpenAI:

```python
import os, getpass
os.environ["OPENAI_API_KEY"] = getpass.getpass("Введите API-ключ OpenAI:")
```

```response title="Response"
Введите API-ключ OpenAI: ········
```

Далее задайте учетные данные для подключения к SQL-песочнице ClickHouse:

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```


## Инициализация сервера MCP и агента Upsonic

Теперь настройте ClickHouse MCP Server так, чтобы он использовал ClickHouse SQL Playground,
а также инициализируйте агента и задайте ему вопрос:

```python
from upsonic import Agent, Task
from upsonic.models.openai import OpenAIResponsesModel
```

```python
class DatabaseMCP:
    """
    MCP-сервер для операций с базой данных ClickHouse.
    Предоставляет инструменты для выполнения запросов к таблицам и базам данных
    """
    command="uv"
    args=[
        "run",
        "--with",
        "mcp-clickhouse",
        "--python",
        "3.10",
        "mcp-clickhouse"
    ]
    env=env


database_agent = Agent(
    name="Аналитик данных",
    role="Специалист по ClickHouse.",
    goal="Выполнять запросы к базе данных и таблицам ClickHouse и отвечать на вопросы",
    model=OpenAIResponsesModel(model_name="gpt-5-mini-2025-08-07")
)


task = Task(
    description="Расскажите, что происходило на рынке недвижимости Великобритании в 2020-х годах. Используйте ClickHouse.",
    tools=[DatabaseMCP]
)
```


# Выполните рабочий процесс

workflow&#95;result = database&#95;agent.do(task)
print(&quot;\nMulti-MCP Workflow Result:&quot;)
print(workflow&#95;result)

````

```response title="Ответ"
2025-10-10 11:26:12,758 - mcp.server.lowlevel.server - INFO - Обработка запроса типа ListToolsRequest
Найдено 3 инструмента из DatabaseMCP
  - list_databases: выводит список доступных баз данных ClickHouse
  - list_tables: выводит список доступных таблиц ClickHouse в базе данных, включая схему, комментарий,
число строк и столбцов.
  - run_select_query: выполняет запрос SELECT в базе данных ClickHouse
✅ Инструменты MCP обнаружены в треде

...
````


[10/10/25 11:26:20] INFO Запуск MCP-сервера 'mcp-clickhouse' с транспортом 'stdio' server.py:1502
2025-10-10 11:26:20,183 - mcp.server.lowlevel.server - INFO - Обработка запроса типа ListToolsRequest
2025-10-10 11:26:20,184 - mcp.server.lowlevel.server - INFO - Обработка запроса типа ListPromptsRequest
2025-10-10 11:26:20,185 - mcp.server.lowlevel.server - INFO - Обработка запроса типа ListResourcesRequest
[INFO] 2025-10-10T11:26:20 mcp_agent.workflows.llm.augmented_llm_openai.database-anayst - Использование модели рассуждений 'gpt-5-mini-2025-08-07' с
уровнем рассуждений 'medium'
[INFO] 2025-10-10T11:26:23 mcp_agent.mcp.mcp_aggregator.database-anayst - Запрос вызова инструмента
{
"data": {
"progress_action": "Вызов инструмента",
"tool_name": "list_databases",
"server_name": "clickhouse",
"agent_name": "database-anayst"
}
}
2025-10-10 11:26:23,477 - mcp.server.lowlevel.server - INFO - Обработка запроса типа CallToolRequest
2025-10-10 11:26:23,479 - mcp-clickhouse - INFO - Получение списка всех баз данных
2025-10-10 11:26:23,479 - mcp-clickhouse - INFO - Создание клиентского подключения ClickHouse к sql-clickhouse.clickhouse.com:8443 от имени demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:24,375 - mcp-clickhouse - INFO - Успешное подключение к серверу ClickHouse версии 25.8.1.8344
2025-10-10 11:26:24,551 - mcp-clickhouse - INFO - Найдено баз данных: 38
[INFO] 2025-10-10T11:26:26 mcp_agent.mcp.mcp_aggregator.database-anayst - Запрос вызова инструмента
{
"data": {
"progress_action": "Вызов инструмента",
"tool_name": "list_tables",
"server_name": "clickhouse",
"agent_name": "database-anayst"
}
}
2025-10-10 11:26:26,825 - mcp.server.lowlevel.server - INFO - Обработка запроса типа CallToolRequest
2025-10-10 11:26:26,832 - mcp-clickhouse - INFO - Получение списка таблиц в базе данных 'uk'
2025-10-10 11:26:26,832 - mcp-clickhouse - INFO - Создание клиентского подключения ClickHouse к sql-clickhouse.clickhouse.com:8443 от имени demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:27,311 - mcp-clickhouse - INFO - Успешное подключение к серверу ClickHouse версии 25.8.1.8344
2025-10-10 11:26:28,738 - mcp-clickhouse - INFO - Найдено таблиц: 9
[INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - Запрос вызова инструмента
{
"data": {
"progress_action": "Вызов инструмента",
"tool_name": "run_select_query",
"server_name": "clickhouse",
"agent_name": "database-anayst"
}
}
[INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - Запрос вызова инструмента
{
"data": {
"progress_action": "Вызов инструмента",
"tool_name": "run_select_query",
"server_name": "clickhouse",
"agent_name": "database-anayst"
}
}
[INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - Запрос вызова инструмента
{
"data": {
"progress_action": "Вызов инструмента",
"tool_name": "run_select_query",
"server_name": "clickhouse",
"agent_name": "database-anayst"
}
}
[INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - Запрос вызова инструмента
{
"data": {
"progress_action": "Вызов инструмента",
"tool_name": "run_select_query",
"server_name": "clickhouse",
"agent_name": "database-anayst"
}
}
[INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - Запрос вызова инструмента
{
"data": {
"progress_action": "Вызов инструмента",
"tool_name": "run_select_query",
"server_name": "clickhouse",
"agent_name": "database-anayst"
}
}
2025-10-10 11:26:48,366 - mcp.server.lowlevel.server - INFO - Обработка запроса типа CallToolRequest
2025-10-10 11:26:48,367 - mcp-clickhouse - INFO - Выполнение SELECT-запроса: SELECT
count(_) AS transactions,
avg(price) AS avg_price,
quantileExact(0.5)(price) AS median_price,
min(price) AS min_price,
max(price) AS max_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date)=2025
2025-10-10 11:26:48,367 - mcp-clickhouse - INFO - Создание клиентского подключения ClickHouse к sql-clickhouse.clickhouse.com:8443 от имени demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:49,262 - mcp-clickhouse - INFO - Успешное подключение к серверу ClickHouse версии 25.8.1.8344
2025-10-10 11:26:49,407 - mcp-clickhouse - INFO - Запрос вернул 1 строку
2025-10-10 11:26:49,408 - mcp.server.lowlevel.server - INFO - Обработка запроса типа CallToolRequest
2025-10-10 11:26:49,408 - mcp-clickhouse - INFO - Выполнение SELECT-запроса: SELECT toMonth(date) AS month, count(_) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date)=2025
GROUP BY month
ORDER BY month
2025-10-10 11:26:49,408 - mcp-clickhouse - INFO - Создание клиентского подключения ClickHouse к sql-clickhouse.clickhouse.com:8443 от имени demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:49,857 - mcp-clickhouse - INFO - Успешное подключение к серверу ClickHouse версии 25.8.1.8344
2025-10-10 11:26:50,067 - mcp-clickhouse - INFO - Запрос вернул 8 строк
2025-10-10 11:26:50,068 - mcp.server.lowlevel.server - INFO - Обработка запроса типа CallToolRequest
2025-10-10 11:26:50,069 - mcp-clickhouse - INFO - Выполнение SELECT-запроса: SELECT town, count(_) AS transactions, avg(price) AS avg_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date)=2025
GROUP BY town
HAVING transactions >= 50
ORDER BY avg_price DESC
LIMIT 10
2025-10-10 11:26:50,069 - mcp-clickhouse - INFO - Создание клиентского подключения ClickHouse к sql-clickhouse.clickhouse.com:8443 от имени demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:50,594 - mcp-clickhouse - INFO - Успешное подключение к серверу ClickHouse версии 25.8.1.8344
2025-10-10 11:26:50,741 - mcp-clickhouse - INFO - Запрос вернул 10 строк
2025-10-10 11:26:50,744 - mcp.server.lowlevel.server - INFO - Обработка запроса типа CallToolRequest
2025-10-10 11:26:50,746 - mcp-clickhouse - INFO - Выполнение SELECT-запроса: SELECT toYear(date) AS year, count(_) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date) IN (2024,2025)
GROUP BY year
ORDER BY year
2025-10-10 11:26:50,747 - mcp-clickhouse - INFO - Создание клиентского подключения ClickHouse к sql-clickhouse.clickhouse.com:8443 от имени demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:51,256 - mcp-clickhouse - INFO - Успешно подключено к серверу ClickHouse версии 25.8.1.8344
2025-10-10 11:26:51,447 - mcp-clickhouse - INFO - Запрос вернул 2 строк
2025-10-10 11:26:51,449 - mcp.server.lowlevel.server - INFO - Обработка запроса типа CallToolRequest
2025-10-10 11:26:51,452 - mcp-clickhouse - INFO - Выполнение SELECT-запроса: SELECT type, count(\*) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid
WHERE toYear(date)=2025
GROUP BY type
ORDER BY avg_price DESC
2025-10-10 11:26:51,452 - mcp-clickhouse - INFO - Создание клиентского подключения ClickHouse к sql-clickhouse.clickhouse.com:8443 от имени demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:51,952 - mcp-clickhouse - INFO - Успешно подключено к серверу ClickHouse версии 25.8.1.8344
2025-10-10 11:26:52,166 - mcp-clickhouse - INFO - Запрос вернул 5 строк
[INFO] 2025-10-10T11:27:51 mcp_agent.mcp_basic_agent - Сводка (кратко)

- На основе таблиц UK Price Paid в ClickHouse для транзакций, записанных в 2025 году на данный момент, насчитывается 376 633 продаж со средней ценой
  £362 283 и медианной ценой £281 000. Данные, похоже, включают только месяцы янв–авг 2025 года (поэтому 2025 год неполный). Существуют экстремальные
  выбросы (мин £100, макс £127 700 000), которые искажают среднее значение.



Что и как я посчитал
Я выполнял агрегирующие запросы по таблицам uk.price-paid в ClickHouse:
- общая сводка за 2025 год (count, mean, median, min, max) из uk.uk_price_paid_simple_partitioned
- помесячная разбивка за 2025 год (количество транзакций, среднее, медиана)
- топ городов в 2025 году по средней цене (города с числом транзакций ≥ 50)
- сравнение по годам: 2024 vs 2025 (count, mean, median)
- разбивка по типу недвижимости за 2025 год (количество, среднее, медиана) с использованием uk.uk_price_paid

Ключевые показатели (из набора данных)
- В целом за 2025 год (зарегистрированные транзакции): транзакций = 376,633; средняя цена = £362,282.66; медиана = £281,000; min = £100; max =
£127,700,000.
- По месяцам (2025): (месяц, количество транзакций, средняя цена, медиана цены)
  - Jan: 53,927, среднее £386,053, медиана £285,000
  - Feb: 58,740, среднее £371,803, медиана £285,000
  - Mar: 95,274, среднее £377,200, медиана £315,000
  - Apr: 24,987, среднее £331,692, медиана £235,000
  - May: 39,013, среднее £342,380, медиана £255,000
  - Jun: 41,446, среднее £334,667, медиана £268,500
  - Jul: 44,431, среднее £348,293, медиана £277,500
  - Aug: 18,815, среднее £364,653, медиана £292,999
  (В наборе данных присутствуют только месяцы 1–8.)
- Топ городов по средней цене (2025, города с ≥50 транзакциями)
  - TRING: 126 сделок, среднее £1,973,274
  - BUCKHURST HILL: 98 сделок, среднее £1,441,331
  - ASCOT: 175 сделок, среднее £1,300,748
  - RADLETT: 69 сделок, среднее £1,160,217
  - COBHAM: 115 сделок, среднее £1,035,192
  - EAST MOLESEY, BEACONSFIELD, ESHER, CHALFONT ST GILES, THAMES DITTON также входят в топ‑10 (все это обеспеченные пригородные/маятниковые города с высокой средней ценой).
- Сравнение по годам (2024 vs 2025 по имеющимся данным)
  - 2024: 859,960 транзакций, среднее £390,879, медиана £280,000
  - 2025: 376,633 транзакции, среднее £362,283, медиана £281,000
  (Показатели за 2025 год значительно ниже, поскольку набор данных покрывает только часть года.)
- По типу недвижимости (2025)
  - detached: 85,362 сделок, среднее £495,714, медиана £415,000
  - semi-detached: 107,580 сделок, среднее £319,922, медиана £270,000
  - flat: 62,975 сделок, среднее £298,529, медиана £227,000
  - terraced: 112,832 сделок, среднее £286,616, медиана £227,000
  - other: 7,884 сделок, среднее £1,087,765 (медиана £315,000) — обратите внимание на эффект малой выборки и выбросов

Важные оговорки и замечания по качеству данных
- Набор данных за 2025 год выглядит неполным (присутствуют только месяцы Jan–Aug). Любые итоговые значения за «2025 год» не являются показателями за полный год.
- Присутствуют крупные выбросы (например, max £127.7M и min £100). Скорее всего, это ошибки ввода данных или нестандартные записи, которые завышают
среднее. В такой ситуации медиана часто является более надежной метрикой.
- Средние значения для типа недвижимости «other» нестабильны из‑за малого/разнородного количества записей и выбросов.
- Я не фильтровал по is_new, duration или другим метаданным; такие фильтры могут изменить результаты (например, исключая новостройки или
leaseholds).
- Таблицы представляют собой записи транзакций в стиле Price Paid (зарегистрированные продажи) — они не отражают напрямую цены предложения или оценочную стоимость.



Предлагаемые следующие шаги (я могу их выполнить)

- Удалить явные выбросы (например, цены < £10k или > £10M) и пересчитать средние значения/медианы.
- Создать сводки по регионам / округам / почтовым индексам и карты.
- Вычислить медиану месяц к месяцу или скользящую 3-месячную медиану для отображения тренда в течение 2025 года.
- Рассчитать темпы роста год к году (YoY) по месяцам (например, март 2025 vs март 2024).
- Составить прогноз на весь 2025 год с использованием простой экстраполяции или моделирования временных рядов (но лучше после принятия решения о том, как обрабатывать отсутствующие месяцы/выбросы).

Если хотите, я могу:

- Повторно выполнить те же агрегации после удаления экстремальных выбросов и показать очищенные результаты.
- Рассчитать месячный рост YoY и построить графики (я могу вернуть агрегаты в формате CSV или JSON для визуализации).
  Что бы вы хотели, чтобы я сделал следующим?
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_aggregator.database-anayst - Закрытие последнего агрегатора, завершение всех постоянных соединений...
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_connection_manager - Отключение всех постоянных серверных соединений...
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_connection_manager - clickhouse: Запрос на завершение работы...
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_connection_manager - Всем постоянным серверным соединениям отправлен сигнал на отключение.
  [INFO] 2025-10-10T11:27:52 mcp_agent.mcp.mcp_aggregator.database-anayst - Менеджер соединений успешно закрыт и удален из контекста
  [INFO] 2025-10-10T11:27:52 mcp_agent.mcp_basic_agent - Очистка MCPApp
  {
  "data": {
  "progress_action": "Завершено",
  "target": "mcp_basic_agent",
  "agent_name": "mcp_application_loop"
  }
  }

```

</VerticalStepper>
```
