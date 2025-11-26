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



# Как создать AI‑агента с CrewAI и MCP Server для ClickHouse

В этом руководстве вы узнаете, как создать AI‑агент [mcp-agent](https://github.com/lastmile-ai/mcp-agent), который может взаимодействовать с 
[SQL-песочницей ClickHouse](https://sql.clickhouse.com/) с помощью [MCP Server для ClickHouse](https://github.com/ClickHouse/mcp-clickhouse).

:::note Пример ноутбука
Этот пример доступен в виде ноутбука в [репозитории примеров](https://github.com/ClickHouse/examples/blob/main/ai/mcp/mcp-agent/mcp-agent.ipynb).
:::



## Предварительные требования {#prerequisites}

- На вашей системе должен быть установлен Python.
- На вашей системе должен быть установлен `pip`.
- Вам понадобится ключ API OpenAI.

Вы можете выполнить следующие шаги либо из интерактивной оболочки Python (REPL), либо с помощью скрипта.

<VerticalStepper headerLevel="h2">


## Установка библиотек

Установите библиотеку mcp-agent с помощью следующих команд:

```python
pip install -q --upgrade pip
pip install -q mcp-agent openai
pip install -q ipywidgets
```


## Настройка учетных данных

Далее вам нужно будет указать свой API-ключ OpenAI:

```python
import os, getpass
os.environ["OPENAI_API_KEY"] = getpass.getpass("Введите API-ключ OpenAI:")
```

```response title="Response"
Введите ключ API OpenAI: ········
```

Далее укажите учетные данные, необходимые для подключения к ClickHouse SQL Playground:

```python
env = {
    "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
    "CLICKHOUSE_PORT": "8443",
    "CLICKHOUSE_USER": "demo",
    "CLICKHOUSE_PASSWORD": "",
    "CLICKHOUSE_SECURE": "true"
}
```


## Инициализация MCP Server и агента mcp-agent

Теперь настройте MCP Server ClickHouse так, чтобы он указывал на SQL‑песочницу ClickHouse,
а также инициализируйте агента mcp-agent и задайте ему вопрос:

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
        instruction="""Вы можете отвечать на вопросы, используя базу данных ClickHouse.""",
        server_names=["clickhouse"],
    )

    async with data_agent:
        llm = await data_agent.attach_llm(OpenAIAugmentedLLM)
        result = await llm.generate_str(
            message="Расскажите о ценах на недвижимость в Великобритании в 2025 году. Для расчётов используйте ClickHouse."
        )
        
        logger.info(result)
```


```response title="Response"
[10/10/25 11:26:20] INFO     Запуск сервера MCP 'mcp-clickhouse' с транспортом 'stdio'                                      server.py:1502
2025-10-10 11:26:20,183 - mcp.server.lowlevel.server - INFO - Обработка запроса типа ListToolsRequest
2025-10-10 11:26:20,184 - mcp.server.lowlevel.server - INFO - Обработка запроса типа ListPromptsRequest
2025-10-10 11:26:20,185 - mcp.server.lowlevel.server - INFO - Обработка запроса типа ListResourcesRequest
[INFO] 2025-10-10T11:26:20 mcp_agent.workflows.llm.augmented_llm_openai.database-anayst - Использование модели рассуждений 'gpt-5-mini-2025-08-07' с
уровнем усилий рассуждений 'medium'
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
2025-10-10 11:26:23,479 - mcp-clickhouse - INFO - Перечисление всех баз данных
2025-10-10 11:26:23,479 - mcp-clickhouse - INFO - Создание соединения клиента ClickHouse с sql-clickhouse.clickhouse.com:8443 как demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:24,375 - mcp-clickhouse - INFO - Успешное подключение к серверу ClickHouse версии 25.8.1.8344
2025-10-10 11:26:24,551 - mcp-clickhouse - INFO - Найдено 38 баз данных
[INFO] 2025-10-10T11:26:26 mcp_agent.mcp.mcp_aggregator.database-anayst - Requesting tool call
{
  "data": {
    "progress_action": "Вызов инструмента",
    "tool_name": "list_tables",
    "server_name": "clickhouse",
    "agent_name": "database-anayst"
  }
}
2025-10-10 11:26:26,825 - mcp.server.lowlevel.server - INFO - Processing request of type CallToolRequest
2025-10-10 11:26:26,832 - mcp-clickhouse - INFO - Перечисление таблиц в базе данных 'uk'
2025-10-10 11:26:26,832 - mcp-clickhouse - INFO - Creating ClickHouse client connection to sql-clickhouse.clickhouse.com:8443 as demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:27,311 - mcp-clickhouse - INFO - Успешное подключение к серверу ClickHouse версии 25.8.1.8344
2025-10-10 11:26:28,738 - mcp-clickhouse - INFO - Найдено 9 таблиц
[INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - Requesting tool call
{
  "data": {
    "progress_action": "Вызов инструмента",
    "tool_name": "run_select_query",
    "server_name": "clickhouse",
    "agent_name": "database-anayst"
  }
}
[INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - Requesting tool call
{
  "data": {
    "progress_action": "Вызов инструмента",
    "tool_name": "run_select_query",
    "server_name": "clickhouse",
    "agent_name": "database-anayst"
  }
}
[INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - Requesting tool call
{
  "data": {
    "progress_action": "Вызов инструмента",
    "tool_name": "run_select_query",
    "server_name": "clickhouse",
    "agent_name": "database-anayst"
  }
}
[INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - Requesting tool call
{
  "data": {
    "progress_action": "Вызов инструмента",
    "tool_name": "run_select_query",
    "server_name": "clickhouse",
    "agent_name": "database-anayst"
  }
}
[INFO] 2025-10-10T11:26:48 mcp_agent.mcp.mcp_aggregator.database-anayst - Requesting tool call
{
  "data": {
    "progress_action": "Вызов инструмента",
    "tool_name": "run_select_query",
    "server_name": "clickhouse",
    "agent_name": "database-anayst"
  }
}
2025-10-10 11:26:48,366 - mcp.server.lowlevel.server - INFO - Processing request of type CallToolRequest
2025-10-10 11:26:48,367 - mcp-clickhouse - INFO - Выполнение запроса SELECT: SELECT
count(*) AS transactions,
avg(price) AS avg_price,
quantileExact(0.5)(price) AS median_price,
min(price) AS min_price,
max(price) AS max_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date)=2025
2025-10-10 11:26:48,367 - mcp-clickhouse - INFO - Creating ClickHouse client connection to sql-clickhouse.clickhouse.com:8443 as demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:49,262 - mcp-clickhouse - INFO - Успешное подключение к серверу ClickHouse версии 25.8.1.8344
2025-10-10 11:26:49,407 - mcp-clickhouse - INFO - Запрос вернул 1 строку
2025-10-10 11:26:49,408 - mcp.server.lowlevel.server - INFO - Processing request of type CallToolRequest
2025-10-10 11:26:49,408 - mcp-clickhouse - INFO - Выполнение запроса SELECT: SELECT toMonth(date) AS month, count(*) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date)=2025
GROUP BY month
ORDER BY month
2025-10-10 11:26:49,408 - mcp-clickhouse - INFO - Creating ClickHouse client connection to sql-clickhouse.clickhouse.com:8443 as demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:49,857 - mcp-clickhouse - INFO - Успешное подключение к серверу ClickHouse версии 25.8.1.8344
2025-10-10 11:26:50,067 - mcp-clickhouse - INFO - Запрос вернул 8 строк
2025-10-10 11:26:50,068 - mcp.server.lowlevel.server - INFO - Processing request of type CallToolRequest
2025-10-10 11:26:50,069 - mcp-clickhouse - INFO - Выполнение запроса SELECT: SELECT town, count(*) AS transactions, avg(price) AS avg_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date)=2025
GROUP BY town
HAVING transactions >= 50
ORDER BY avg_price DESC
LIMIT 10
2025-10-10 11:26:50,069 - mcp-clickhouse - INFO - Creating ClickHouse client connection to sql-clickhouse.clickhouse.com:8443 as demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:50,594 - mcp-clickhouse - INFO - Успешное подключение к серверу ClickHouse версии 25.8.1.8344
2025-10-10 11:26:50,741 - mcp-clickhouse - INFO - Запрос вернул 10 строк
2025-10-10 11:26:50,744 - mcp.server.lowlevel.server - INFO - Processing request of type CallToolRequest
2025-10-10 11:26:50,746 - mcp-clickhouse - INFO - Выполнение запроса SELECT: SELECT toYear(date) AS year, count(*) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid_simple_partitioned
WHERE toYear(date) IN (2024,2025)
GROUP BY year
ORDER BY year
2025-10-10 11:26:50,747 - mcp-clickhouse - INFO - Создание клиентского подключения к ClickHouse на sql-clickhouse.clickhouse.com:8443 от имени demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:51,256 - mcp-clickhouse - INFO - Подключение к серверу ClickHouse версии 25.8.1.8344 успешно установлено
2025-10-10 11:26:51,447 - mcp-clickhouse - INFO - Запрос вернул 2 строки
2025-10-10 11:26:51,449 - mcp.server.lowlevel.server - INFO - Обработка запроса типа CallToolRequest
2025-10-10 11:26:51,452 - mcp-clickhouse - INFO - Выполнение запроса SELECT: SELECT type, count(*) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
FROM uk.uk_price_paid
WHERE toYear(date)=2025
GROUP BY type
ORDER BY avg_price DESC
2025-10-10 11:26:51,452 - mcp-clickhouse - INFO - Создание клиентского подключения к ClickHouse на sql-clickhouse.clickhouse.com:8443 от имени demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
2025-10-10 11:26:51,952 - mcp-clickhouse - INFO - Подключение к серверу ClickHouse версии 25.8.1.8344 успешно установлено
2025-10-10 11:26:52,166 - mcp-clickhouse - INFO - Запрос вернул 5 строк
[INFO] 2025-10-10T11:27:51 mcp_agent.mcp_basic_agent - Краткое резюме (TL;DR)
- На основе данных таблиц UK Price Paid в ClickHouse по транзакциям, зарегистрированным в 2025 году, на данный момент зафиксировано 376 633 продажи со средней ценой
£362 283 и медианной ценой £281 000. Похоже, что данные включают только месяцы с января по август 2025 года (то есть 2025 год представлен неполностью). Наблюдаются сильные
выбросы (минимум £100, максимум £127 700 000), которые искажают среднее значение.
```



Что я посчитал (как)
Я выполнил агрегирующие запросы по таблицам uk.price-paid в ClickHouse:
- общий итог за 2025 год (count, mean, median, min, max) из uk.uk_price_paid_simple_partitioned
- помесячная разбивка за 2025 год (transactions, mean, median)
- топ городов в 2025 году по средней цене (города с >= 50 транзакциями)
- сравнение по годам: 2024 vs 2025 (count, mean, median)
- разбивка по типу недвижимости за 2025 год (counts, avg, median) с использованием uk.uk_price_paid

Ключевые цифры (из набора данных)
- В целом за 2025 год (записанные транзакции): transactions = 376,633; mean price = £362,282.66; median price = £281,000; min = £100; max =
£127,700,000.
- По месяцам (2025): (месяц, количество транзакций, средняя цена, медианная цена)
  - Jan: 53,927, mean £386,053, median £285,000
  - Feb: 58,740, mean £371,803, median £285,000
  - Mar: 95,274, mean £377,200, median £315,000
  - Apr: 24,987, mean £331,692, median £235,000
  - May: 39,013, mean £342,380, median £255,000
  - Jun: 41,446, mean £334,667, median £268,500
  - Jul: 44,431, mean £348,293, median £277,500
  - Aug: 18,815, mean £364,653, median £292,999
  (В наборе данных присутствуют только месяцы 1–8.)
- Топ городов по средней цене (2025, города с ≥50 транзакциями)
  - TRING: 126 транзакций, avg £1,973,274
  - BUCKHURST HILL: 98 транзакций, avg £1,441,331
  - ASCOT: 175 транзакций, avg £1,300,748
  - RADLETT: 69 транзакций, avg £1,160,217
  - COBHAM: 115 транзакций, avg £1,035,192
  - EAST MOLESEY, BEACONSFIELD, ESHER, CHALFONT ST GILES, THAMES DITTON также входят в топ-10 (все это обеспеченные пригородные/«коммутерские» города с высокой средней ценой).
- Сравнение по годам (2024 vs 2025 по записанным данным)
  - 2024: 859,960 транзакций, mean £390,879, median £280,000
  - 2025: 376,633 транзакций, mean £362,283, median £281,000
  (Показатели за 2025 год гораздо ниже, потому что набор данных охватывает только часть года.)
- По типу недвижимости (2025)
  - detached: 85,362 транзакций, avg £495,714, median £415,000
  - semi-detached: 107,580 транзакций, avg £319,922, median £270,000
  - flat: 62,975 транзакций, avg £298,529, median £227,000
  - terraced: 112,832 транзакций, avg £286,616, median £227,000
  - other: 7,884 транзакций, avg £1,087,765 (median £315,000) — обратите внимание на эффект малого числа наблюдений и выбросов

Важные оговорки и замечания по качеству данных
- Набор данных за 2025 год, по-видимому, неполный (присутствуют только месяцы Jan–Aug). Любые итоги по «2025» не являются годовыми.
- Имеются крупные выбросы (например, max £127.7M и min £100). Вероятно, они включают ошибки ввода данных или нестандартные записи и завышают
среднее значение. В этом случае медиана часто является более надежной мерой.
- Средние значения для типа недвижимости «other» нестабильны из-за малого/неоднородного количества записей и выбросов.
- Я не фильтровал по is_new, duration или другим метаданным; эти фильтры могут менять результаты (например, при исключении новостроек или
договоров долгосрочной аренды (leasehold)).
- Таблицы представляют собой записи о транзакциях в формате Price Paid (записанные продажи) — они не отражают напрямую запрашиваемые цены или оценки стоимости.



Предлагаю следующие шаги (я могу выполнить их сам):

- Удалить очевидные выбросы (например, цены < £10k или > £10M) и пересчитать средние значения/медианы.
- Подготовить сводки и карты по регионам / графствам / почтовым районам.
- Рассчитать помесячную или скользящую 3-месячную медиану, чтобы показать тренд в 2025 году.
- Рассчитать помесячные темпы роста год к году (YoY) (например, март 2025 года против марта 2024 года).
- Сделать прогноз на весь 2025 год с помощью простой экстраполяции или моделирования временных рядов (лучше после принятия решения о том, как обрабатывать отсутствующие месяцы/выбросы).

Если хотите, я могу:

- Повторно выполнить те же агрегации после удаления экстремальных выбросов и показать очищенные результаты.
- Построить помесячный YoY‑рост и графики (могу вернуть агрегаты в формате CSV или JSON для вашей визуализации).
  Что вы хотите, чтобы я сделал дальше?
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_aggregator.database-anayst - Last aggregator closing, shutting down all persistent
  connections...
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_connection_manager - Disconnecting all persistent server connections...
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_connection_manager - clickhouse: Requesting shutdown...
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp.mcp_connection_manager - All persistent server connections signaled to disconnect.
  [INFO] 2025-10-10T11:27:52 mcp_agent.mcp.mcp_aggregator.database-anayst - Connection manager successfully closed and removed from context
  [INFO] 2025-10-10T11:27:52 mcp_agent.mcp_basic_agent - MCPApp cleanup
  {
  "data": {
  "progress_action": "Finished",
  "target": "mcp_basic_agent",
  "agent_name": "mcp_application_loop"
  }
  }

```

</VerticalStepper>
```
