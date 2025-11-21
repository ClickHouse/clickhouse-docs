---
slug: /use-cases/AI/MCP/ai-agent-libraries/mcp-agent
sidebar_label: 'Интеграция с mcp-agent'
title: 'Как создать AI-агента с помощью mcp-agent и сервера ClickHouse MCP'
pagination_prev: null
pagination_next: null
description: 'Узнайте, как создать AI-агента с помощью mcp-agent и сервера ClickHouse MCP'
keywords: ['ClickHouse', 'MCP', 'mcp-agent']
show_related_blogs: true
doc_type: 'guide'
---



# Как создать агента ИИ с помощью CrewAI и сервера ClickHouse MCP

В этом руководстве вы узнаете, как создать агента ИИ [mcp-agent](https://github.com/lastmile-ai/mcp-agent), способного взаимодействовать с 
[SQL-песочницей ClickHouse](https://sql.clickhouse.com/) через [сервер ClickHouse MCP](https://github.com/ClickHouse/mcp-clickhouse).

:::note Пример блокнота
Этот пример доступен в виде блокнота в [репозитории с примерами](https://github.com/ClickHouse/examples/blob/main/ai/mcp/mcp-agent/mcp-agent.ipynb).
:::



## Предварительные требования {#prerequisites}

- В вашей системе должен быть установлен Python.
- В вашей системе должен быть установлен `pip`.
- Вам потребуется API-ключ OpenAI.

Следующие шаги можно выполнить либо из Python REPL, либо с помощью скрипта.

<VerticalStepper headerLevel="h2">


## Установка библиотек {#install-libraries}

Установите библиотеку mcp-agent, выполнив следующие команды:

```python
pip install -q --upgrade pip
pip install -q mcp-agent openai
pip install -q ipywidgets
```


## Настройка учетных данных {#setup-credentials}

Далее вам потребуется указать ваш API-ключ OpenAI:

```python
import os, getpass
os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter OpenAI API Key:")
```

```response title="Ответ"
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


## Инициализация MCP Server и агента mcp-agent {#initialize-mcp-and-agent}

Теперь настройте ClickHouse MCP Server для подключения к ClickHouse SQL playground
и инициализируйте агента, задав ему вопрос:

```python
from mcp_agent.app import MCPApp
from mcp_agent.agents.agent import Agent
from mcp_agent.workflows.llm.augmented_llm_openai import OpenAIAugmentedLLM
from mcp_agent.config import Settings, MCPSettings, MCPServerSettings, OpenAISettings
```

```python
settings = Settings(
    execution_engine="asyncio",
    openai=OpenAISettings(
        default_model="gpt-5-mini-2025-08-07",
    ),
    mcp=MCPSettings(
        servers={
            "clickhouse": MCPServerSettings(
                command='uv',
                args=[
                    "run",
                    "--with", "mcp-clickhouse",
                    "--python", "3.10",
                    "mcp-clickhouse"
                ],
                env=env
            ),
        }
    ),
)

app = MCPApp(name="mcp_basic_agent", settings=settings)

async with app.run() as mcp_agent_app:
    logger = mcp_agent_app.logger
    data_agent = Agent(
        name="database-anayst",
        instruction="""Вы можете отвечать на вопросы с помощью базы данных ClickHouse.""",
        server_names=["clickhouse"],
    )

    async with data_agent:
        llm = await data_agent.attach_llm(OpenAIAugmentedLLM)
        result = await llm.generate_str(
            message="Расскажи о ценах на недвижимость в Великобритании в 2025 году. Используй ClickHouse для вычислений."
        )

        logger.info(result)
```


```response title="Response"
[10/10/25 11:26:20] INFO     Starting MCP server 'mcp-clickhouse' with transport 'stdio'                                      server.py:1502
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
count(*) AS transactions,
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
2025-10-10 11:26:49,408 - mcp-clickhouse - INFO - Executing SELECT query: SELECT toMonth(date) AS month, count(*) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date)=2025
GROUP BY month
ORDER BY month
2025-10-10 11:26:49,408 - mcp-clickhouse - INFO - Creating ClickHouse client connection to sql-clickhouse.clickhouse.com:8443 as demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:49,857 - mcp-clickhouse - INFO - Successfully connected to ClickHouse server version 25.8.1.8344
2025-10-10 11:26:50,067 - mcp-clickhouse - INFO - Query returned 8 rows
2025-10-10 11:26:50,068 - mcp.server.lowlevel.server - INFO - Processing request of type CallToolRequest
2025-10-10 11:26:50,069 - mcp-clickhouse - INFO - Executing SELECT query: SELECT town, count(*) AS transactions, avg(price) AS avg_price
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
2025-10-10 11:26:50,746 - mcp-clickhouse - INFO - Executing SELECT query: SELECT toYear(date) AS year, count(*) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date) IN (2024,2025)
GROUP BY year
ORDER BY year
2025-10-10 11:26:50,747 - mcp-clickhouse - INFO - Создание клиентского подключения ClickHouse к sql-clickhouse.clickhouse.com:8443 от имени demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:51,256 - mcp-clickhouse - INFO - Успешно подключено к серверу ClickHouse версии 25.8.1.8344
2025-10-10 11:26:51,447 - mcp-clickhouse - INFO - Запрос вернул 2 строки
2025-10-10 11:26:51,449 - mcp.server.lowlevel.server - INFO - Обработка запроса типа CallToolRequest
2025-10-10 11:26:51,452 - mcp-clickhouse - INFO - Выполнение SELECT-запроса: SELECT type, count(*) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid
WHERE toYear(date)=2025
GROUP BY type
ORDER BY avg_price DESC
2025-10-10 11:26:51,452 - mcp-clickhouse - INFO - Creating ClickHouse client connection to sql-clickhouse.clickhouse.com:8443 as demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:51,952 - mcp-clickhouse - INFO - Успешно подключено к серверу ClickHouse версии 25.8.1.8344
2025-10-10 11:26:52,166 - mcp-clickhouse - INFO - Запрос вернул 5 строк
[INFO] 2025-10-10T11:27:51 mcp_agent.mcp_basic_agent - Краткое резюме
- На основе таблиц UK Price Paid в ClickHouse, для транзакций, зарегистрированных в 2025 году на текущий момент, насчитывается 376 633 продажи со средней ценой
£362 283 и медианной ценой £281 000. Данные, по-видимому, включают только месяцы январь–август 2025 года (таким образом, данные за 2025 год неполные). Присутствуют экстремальные
выбросы (минимум £100, максимум £127 700 000), которые искажают среднее значение.
```



Что и как я считал
Я выполнил агрегирующие запросы по таблицам uk.price-paid в ClickHouse:
- общий итог за 2025 год (count, mean, median, min, max) из uk.uk_price_paid_simple_partitioned
- помесячная разбивка за 2025 год (transactions, mean, median)
- топ городов в 2025 году по средней цене (города с >= 50 транзакциями)
- сравнение по годам: 2024 vs 2025 (count, mean, median)
- разбивка по типам недвижимости за 2025 год (counts, avg, median) с использованием uk.uk_price_paid

Ключевые показатели (по набору данных)
- В целом за 2025 год (зарегистрированные транзакции): transactions = 376,633; mean price = £362,282.66; median price = £281,000; min = £100; max =
£127,700,000.
- По месяцам (2025): (month, transactions, mean price, median price)
  - Jan: 53,927, mean £386,053, median £285,000
  - Feb: 58,740, mean £371,803, median £285,000
  - Mar: 95,274, mean £377,200, median £315,000
  - Apr: 24,987, mean £331,692, median £235,000
  - May: 39,013, mean £342,380, median £255,000
  - Jun: 41,446, mean £334,667, median £268,500
  - Jul: 44,431, mean £348,293, median £277,500
  - Aug: 18,815, mean £364,653, median £292,999
  (В наборе данных присутствуют только месяцы с 1 по 8.)
- Топ городов по средней цене (2025, города с ≥50 транзакциями)
  - TRING: 126 txns, avg £1,973,274
  - BUCKHURST HILL: 98 txns, avg £1,441,331
  - ASCOT: 175 txns, avg £1,300,748
  - RADLETT: 69 txns, avg £1,160,217
  - COBHAM: 115 txns, avg £1,035,192
  - EAST MOLESEY, BEACONSFIELD, ESHER, CHALFONT ST GILES, THAMES DITTON также входят в топ-10 (все это обеспеченные пригородные города с высокой средней ценой).
- Сравнение по годам (2024 vs 2025, по имеющимся данным)
  - 2024: 859,960 transactions, mean £390,879, median £280,000
  - 2025: 376,633 transactions, mean £362,283, median £281,000
  (Показатели за 2025 год значительно ниже, поскольку набор данных покрывает только часть года.)
- По типу недвижимости (2025)
  - detached: 85,362 txns, avg £495,714, median £415,000
  - semi-detached: 107,580 txns, avg £319,922, median £270,000
  - flat: 62,975 txns, avg £298,529, median £227,000
  - terraced: 112,832 txns, avg £286,616, median £227,000
  - other: 7,884 txns, avg £1,087,765 (median £315,000) — обратите внимание на эффект малой выборки и выбросов

Важные оговорки и замечания по качеству данных
- Набор данных за 2025 год, по-видимому, неполный (присутствуют только месяцы Jan–Aug). Любые итоги за «2025» не являются годовыми.
- Существуют крупные выбросы (например, max £127.7M и min £100). Вероятно, это ошибки ввода или нестандартные записи, которые завышают
mean. В данном случае median часто является более устойчивой метрикой.
- Средние значения для типа недвижимости «other» нестабильны из-за небольшого/разнородного количества записей и выбросов.
- Я не фильтровал по is_new, duration или другим метаданным; такие фильтры могут изменить результаты (например, при исключении новостроек или
объектов leasehold).
- Таблицы представляют собой записи транзакций в формате Price Paid (зарегистрированные продажи) — они не отражают напрямую цены предложения или оценочную стоимость.



Предлагаемые следующие шаги (я могу их выполнить)

- Удалить явные выбросы (например, цены < £10k или > £10M) и пересчитать средние значения/медианы.
- Создать региональные сводки и карты по округам/почтовым районам.
- Вычислить медиану месяц к месяцу или скользящую 3-месячную медиану для отображения тренда на 2025 год.
- Рассчитать темпы роста год к году (YoY) по месяцам (например, март 2025 vs март 2024).
- Составить прогноз на весь 2025 год с использованием простой экстраполяции или моделирования временных рядов (но лучше после решения вопроса об обработке отсутствующих месяцев/выбросов).

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
