---
slug: /use-cases/AI/MCP/ai-agent-libraries/upsonic
sidebar_label: 'Интеграция Upsonic'
title: 'Как создать AI-агента с использованием Upsonic и ClickHouse MCP Server'
pagination_prev: null
pagination_next: null
description: 'Узнайте, как создать AI-агента с использованием Upsonic и ClickHouse MCP Server'
keywords: ['ClickHouse', 'MCP', 'Upsonic']
show_related_blogs: true
doc_type: 'guide'
---



# Как создать AI-агента с помощью Upsonic и ClickHouse MCP Server

В этом руководстве вы узнаете, как создать AI-агента [Upsonic](https://github.com/Upsonic/Upsonic/tree/master), который может взаимодействовать с 
[SQL-песочницей ClickHouse](https://sql.clickhouse.com/), используя [ClickHouse MCP Server](https://github.com/ClickHouse/mcp-clickhouse).

:::note Пример в виде notebook
Этот пример доступен в виде notebook в [репозитории примеров](https://github.com/ClickHouse/examples/blob/main/ai/mcp/upsonic/upsonic.ipynb).
:::



## Предварительные требования {#prerequisites}

- На вашей системе должен быть установлен Python.
- На вашей системе должен быть установлен `pip`.
- Вам потребуется API-ключ OpenAI.

Следующие шаги можно выполнить либо из Python REPL, либо с помощью скрипта.

<VerticalStepper headerLevel="h2">


## Установка библиотек {#install-libraries}

Установите библиотеку mcp-agent, выполнив следующие команды:

```python
pip install -q --upgrade pip
pip install -q "upsonic[loaders,tools]" openai
pip install -q ipywidgets
```


## Настройка учетных данных {#setup-credentials}

Далее вам потребуется указать ваш API-ключ OpenAI:

```python
import os, getpass
os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter OpenAI API Key:")
```

```response title="Response"
Enter OpenAI API Key: ········
```

Затем определите учетные данные, необходимые для подключения к тестовой среде ClickHouse SQL:

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```


## Инициализация MCP-сервера и агента Upsonic {#initialize-mcp-and-agent}

Теперь настройте ClickHouse MCP Server для подключения к ClickHouse SQL playground
и инициализируйте агента, задав ему вопрос:

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
    description="Расскажи, что происходило на рынке недвижимости Великобритании в 2020-х годах. Используй ClickHouse.",
    tools=[DatabaseMCP]
)

```


# Выполнение рабочего процесса

workflow&#95;result = database&#95;agent.do(task)
print(&quot;\nРезультат Multi-MCP рабочего процесса:&quot;)
print(workflow&#95;result)

````

```response title="Ответ"
2025-10-10 11:26:12,758 - mcp.server.lowlevel.server - INFO - Обработка запроса типа ListToolsRequest
Найдено 3 инструмента из DatabaseMCP
  - list_databases: Вывод списка доступных баз данных ClickHouse
  - list_tables: Вывод списка доступных таблиц ClickHouse в базе данных, включая схему, комментарий,
количество строк и количество столбцов.
  - run_select_query: Выполнение SELECT-запроса к базе данных ClickHouse
✅ Инструменты MCP обнаружены через поток

...
````


[10/10/25 11:26:20] INFO Starting MCP server 'mcp-clickhouse' with transport 'stdio' server.py:1502
2025-10-10 11:26:20,183 - mcp.server.lowlevel.server - INFO - Processing request of type ListToolsRequest
2025-10-10 11:26:20,184 - mcp.server.lowlevel.server - INFO - Processing request of type ListPromptsRequest
2025-10-10 11:26:20,185 - mcp.server.lowlevel.server - INFO - Processing request of type ListResourcesRequest
[INFO] 2025-10-10T11:26:20 mcp_agent.workflows.llm.augmented_llm_openai.database-anayst - Using reasoning model 'gpt-5-mini-2025-08-07' with
'medium' reasoning effort
[INFO] 2025-10-10T11:26:23 mcp_agent.mcp.mcp_aggregator.database-anayst - Requesting tool call
{
"data": {
"progress_action": "Calling Tool",
"tool_name": "list_databases",
"server_name": "clickhouse",
"agent_name": "database-anayst"
}
}
2025-10-10 11:26:23,477 - mcp.server.lowlevel.server - INFO - Processing request of type CallToolRequest
2025-10-10 11:26:23,479 - mcp-clickhouse - INFO - Listing all databases
2025-10-10 11:26:23,479 - mcp-clickhouse - INFO - Creating ClickHouse client connection to sql-clickhouse.clickhouse.com:8443 as demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:24,375 - mcp-clickhouse - INFO - Successfully connected to ClickHouse server version 25.8.1.8344
2025-10-10 11:26:24,551 - mcp-clickhouse - INFO - Found 38 databases
[INFO] 2025-10-10T11:26:26 mcp_agent.mcp.mcp_aggregator.database-anayst - Requesting tool call
{
"data": {
"progress_action": "Calling Tool",
"tool_name": "list_tables",
"server_name": "clickhouse",
"agent_name": "database-anayst"
}
}
2025-10-10 11:26:26,825 - mcp.server.lowlevel.server - INFO - Processing request of type CallToolRequest
2025-10-10 11:26:26,832 - mcp-clickhouse - INFO - Listing tables in database 'uk'
2025-10-10 11:26:26,832 - mcp-clickhouse - INFO - Creating ClickHouse client connection to sql-clickhouse.clickhouse.com:8443 as demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:27,311 - mcp-clickhouse - INFO - Successfully connected to ClickHouse server version 25.8.1.8344
2025-10-10 11:26:28,738 - mcp-clickhouse - INFO - Found 9 tables
[INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - Requesting tool call
{
"data": {
"progress_action": "Calling Tool",
"tool_name": "run_select_query",
"server_name": "clickhouse",
"agent_name": "database-anayst"
}
}
[INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - Requesting tool call
{
"data": {
"progress_action": "Calling Tool",
"tool_name": "run_select_query",
"server_name": "clickhouse",
"agent_name": "database-anayst"
}
}
[INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - Requesting tool call
{
"data": {
"progress_action": "Calling Tool",
"tool_name": "run_select_query",
"server_name": "clickhouse",
"agent_name": "database-anayst"
}
}
[INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - Requesting tool call
{
"data": {
"progress_action": "Calling Tool",
"tool_name": "run_select_query",
"server_name": "clickhouse",
"agent_name": "database-anayst"
}
}
[INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - Requesting tool call
{
"data": {
"progress_action": "Calling Tool",
"tool_name": "run_select_query",
"server_name": "clickhouse",
"agent_name": "database-anayst"
}
}
2025-10-10 11:26:48,366 - mcp.server.lowlevel.server - INFO - Processing request of type CallToolRequest
2025-10-10 11:26:48,367 - mcp-clickhouse - INFO - Executing SELECT query: SELECT
count(_) AS transactions,
avg(price) AS avg_price,
quantileExact(0.5)(price) AS median_price,
min(price) AS min_price,
max(price) AS max_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date)=2025
2025-10-10 11:26:48,367 - mcp-clickhouse - INFO - Creating ClickHouse client connection to sql-clickhouse.clickhouse.com:8443 as demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:49,262 - mcp-clickhouse - INFO - Successfully connected to ClickHouse server version 25.8.1.8344
2025-10-10 11:26:49,407 - mcp-clickhouse - INFO - Query returned 1 rows
2025-10-10 11:26:49,408 - mcp.server.lowlevel.server - INFO - Processing request of type CallToolRequest
2025-10-10 11:26:49,408 - mcp-clickhouse - INFO - Executing SELECT query: SELECT toMonth(date) AS month, count(_) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date)=2025
GROUP BY month
ORDER BY month
2025-10-10 11:26:49,408 - mcp-clickhouse - INFO - Creating ClickHouse client connection to sql-clickhouse.clickhouse.com:8443 as demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:49,857 - mcp-clickhouse - INFO - Successfully connected to ClickHouse server version 25.8.1.8344
2025-10-10 11:26:50,067 - mcp-clickhouse - INFO - Query returned 8 rows
2025-10-10 11:26:50,068 - mcp.server.lowlevel.server - INFO - Processing request of type CallToolRequest
2025-10-10 11:26:50,069 - mcp-clickhouse - INFO - Executing SELECT query: SELECT town, count(_) AS transactions, avg(price) AS avg_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date)=2025
GROUP BY town
HAVING transactions >= 50
ORDER BY avg_price DESC
LIMIT 10
2025-10-10 11:26:50,069 - mcp-clickhouse - INFO - Creating ClickHouse client connection to sql-clickhouse.clickhouse.com:8443 as demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:50,594 - mcp-clickhouse - INFO - Successfully connected to ClickHouse server version 25.8.1.8344
2025-10-10 11:26:50,741 - mcp-clickhouse - INFO - Query returned 10 rows
2025-10-10 11:26:50,744 - mcp.server.lowlevel.server - INFO - Processing request of type CallToolRequest
2025-10-10 11:26:50,746 - mcp-clickhouse - INFO - Executing SELECT query: SELECT toYear(date) AS year, count(_) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date) IN (2024,2025)
GROUP BY year
ORDER BY year
2025-10-10 11:26:50,747 - mcp-clickhouse - INFO - Creating ClickHouse client connection to sql-clickhouse.clickhouse.com:8443 as demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:51,256 - mcp-clickhouse - INFO - Успешное подключение к серверу ClickHouse версии 25.8.1.8344
2025-10-10 11:26:51,447 - mcp-clickhouse - INFO - Запрос вернул 2 строки
2025-10-10 11:26:51,449 - mcp.server.lowlevel.server - INFO - Обработка запроса типа CallToolRequest
2025-10-10 11:26:51,452 - mcp-clickhouse - INFO - Выполнение SELECT-запроса: SELECT type, count(\*) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid
WHERE toYear(date)=2025
GROUP BY type
ORDER BY avg_price DESC
2025-10-10 11:26:51,452 - mcp-clickhouse - INFO - Создание клиентского подключения ClickHouse к sql-clickhouse.clickhouse.com:8443 от имени demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:51,952 - mcp-clickhouse - INFO - Успешное подключение к серверу ClickHouse версии 25.8.1.8344
2025-10-10 11:26:52,166 - mcp-clickhouse - INFO - Запрос вернул 5 строк
[INFO] 2025-10-10T11:27:51 mcp_agent.mcp_basic_agent - Сводка (TL;DR)

- На основе таблиц UK Price Paid в ClickHouse для транзакций, зарегистрированных в 2025 году, на данный момент зафиксировано 376 633 продажи со средней ценой
  £362 283 и медианой £281 000. Данные включают только месяцы с января по август 2025 года (таким образом, данные за 2025 год неполные). Присутствуют экстремальные
  выбросы (минимум £100, максимум £127 700 000), которые искажают среднее значение.



Что я вычислил (как)
Я выполнил агрегации по таблицам uk.price-paid в ClickHouse:
- общая сводка за 2025 год (количество, среднее, медиана, минимум, максимум) из uk.uk_price_paid_simple_partitioned
- помесячная разбивка за 2025 год (транзакции, среднее, медиана)
- топ городов в 2025 году по средней цене (города с >= 50 транзакциями)
- сравнение по годам: 2024 vs 2025 (количество, среднее, медиана)
- разбивка по типу недвижимости за 2025 год (количество, среднее, медиана) с использованием uk.uk_price_paid

Ключевые цифры (из набора данных)
- Общие данные за 2025 год (зарегистрированные транзакции): транзакций = 376 633; средняя цена = £362 282,66; медианная цена = £281 000; минимум = £100; максимум =
£127 700 000.
- По месяцам (2025): (месяц, транзакции, средняя цена, медианная цена)
  - Янв: 53 927, среднее £386 053, медиана £285 000
  - Фев: 58 740, среднее £371 803, медиана £285 000
  - Мар: 95 274, среднее £377 200, медиана £315 000
  - Апр: 24 987, среднее £331 692, медиана £235 000
  - Май: 39 013, среднее £342 380, медиана £255 000
  - Июн: 41 446, среднее £334 667, медиана £268 500
  - Июл: 44 431, среднее £348 293, медиана £277 500
  - Авг: 18 815, среднее £364 653, медиана £292 999
  (В наборе данных присутствуют только месяцы 1–8.)
- Топ городов по средней цене (2025, города с ≥50 транзакциями)
  - TRING: 126 транзакций, среднее £1 973 274
  - BUCKHURST HILL: 98 транзакций, среднее £1 441 331
  - ASCOT: 175 транзакций, среднее £1 300 748
  - RADLETT: 69 транзакций, среднее £1 160 217
  - COBHAM: 115 транзакций, среднее £1 035 192
  - EAST MOLESEY, BEACONSFIELD, ESHER, CHALFONT ST GILES, THAMES DITTON также входят в топ-10 (все это города с высокими средними ценами — пригороды/обеспеченные районы).
- Сравнение по годам (2024 vs 2025 по зарегистрированным данным)
  - 2024: 859 960 транзакций, среднее £390 879, медиана £280 000
  - 2025: 376 633 транзакции, среднее £362 283, медиана £281 000
  (Количество за 2025 год значительно ниже, поскольку набор данных включает только часть года.)
- По типу недвижимости (2025)
  - detached: 85 362 транзакции, среднее £495 714, медиана £415 000
  - semi-detached: 107 580 транзакций, среднее £319 922, медиана £270 000
  - flat: 62 975 транзакций, среднее £298 529, медиана £227 000
  - terraced: 112 832 транзакции, среднее £286 616, медиана £227 000
  - other: 7 884 транзакции, среднее £1 087 765 (медиана £315 000) — обратите внимание на эффект малой выборки и выбросов

Важные оговорки и замечания о качестве данных
- Набор данных за 2025 год является неполным (присутствуют только месяцы январь–август). Любые итоги за «2025 год» не являются полногодовыми показателями.
- Присутствуют значительные выбросы (например, максимум £127,7 млн и минимум £100). Вероятно, это ошибки ввода данных или нестандартные записи, которые завышают
среднее значение. Медиана в данном случае является более надежной мерой.
- Средние значения для типа недвижимости «other» нестабильны из-за малого/неоднородного количества записей и выбросов.
- Я не применял фильтрацию по is_new, duration или другим метаданным; эти фильтры могут изменить результаты (например, при исключении новостроек или
недвижимости с арендным правом).
- Таблицы содержат записи транзакций в формате Price Paid (зарегистрированные продажи) — они не отражают напрямую запрашиваемые цены или оценочную стоимость.



Предлагаемые следующие шаги (я могу их выполнить)

- Удалить явные выбросы (например, цены < £10k или > £10M) и пересчитать средние значения/медианы.
- Создать сводки по регионам / округам / почтовым индексам и карты.
- Вычислить медиану месяц к месяцу или скользящую 3-месячную медиану для отображения тренда в течение 2025 года.
- Рассчитать темпы роста год к году (YoY) по месяцам (например, март 2025 vs март 2024).
- Составить прогноз на весь 2025 год с использованием простой экстраполяции или моделирования временных рядов (но лучше после решения вопроса об обработке отсутствующих
  месяцев/выбросов).

Если хотите, я могу:

- Повторно выполнить те же агрегации после удаления экстремальных выбросов и показать очищенные результаты.
- Создать месячный рост YoY и графики (я могу вернуть агрегаты в формате CSV или JSON для построения графиков).
  Что бы вы хотели, чтобы я сделал дальше?
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_aggregator.database-anayst - Закрытие последнего агрегатора, завершение всех постоянных
  соединений...
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
