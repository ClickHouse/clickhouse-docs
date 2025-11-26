---
slug: /use-cases/AI/MCP/ai-agent-libraries/upsonic
sidebar_label: 'Интеграция с Upsonic'
title: 'Как создать ИИ-агента с Upsonic и сервером ClickHouse MCP'
pagination_prev: null
pagination_next: null
description: 'Узнайте, как создать ИИ-агента с Upsonic и сервером ClickHouse MCP'
keywords: ['ClickHouse', 'MCP', 'Upsonic']
show_related_blogs: true
doc_type: 'guide'
---

# Как создать AI‑агента с Upsonic и сервером ClickHouse MCP

В этом руководстве вы узнаете, как создать AI‑агента [Upsonic](https://github.com/Upsonic/Upsonic/tree/master), который может взаимодействовать с 
[SQL‑песочницей ClickHouse](https://sql.clickhouse.com/), используя [сервер ClickHouse MCP](https://github.com/ClickHouse/mcp-clickhouse).

:::note Пример блокнота
Этот пример доступен в виде блокнота в [репозитории примеров](https://github.com/ClickHouse/examples/blob/main/ai/mcp/upsonic/upsonic.ipynb).
:::

## Предварительные требования {#prerequisites}

- На вашей системе должен быть установлен Python.
- На вашей системе должен быть установлен `pip`.
- Вам нужен ключ OpenAI API.

Вы можете выполнить следующие шаги в интерактивной оболочке Python (REPL) или запустив скрипт.

<VerticalStepper headerLevel="h2">
  ## Установка библиотек

  Установите библиотеку mcp-agent, выполнив следующие команды:

  ```python
  pip install -q --upgrade pip
  pip install -q "upsonic[loaders,tools]" openai
  pip install -q ipywidgets
  ```

  ## Настройка учетных данных

  Далее необходимо указать ваш API-ключ OpenAI:

  ```python
  import os, getpass
  os.environ["OPENAI_API_KEY"] = getpass.getpass("Введите API-ключ OpenAI:")
  ```

  ```response title="Response"
  Введите ключ API OpenAI: ········
  ```

  Далее укажите учетные данные для подключения к SQL-песочнице ClickHouse:

  ```python
  env = {
      "CLICKHOUSE_HOST": "sql-clickhouse.clickhouse.com",
      "CLICKHOUSE_PORT": "8443",
      "CLICKHOUSE_USER": "demo",
      "CLICKHOUSE_PASSWORD": "",
      "CLICKHOUSE_SECURE": "true"
  }
  ```

  ## Инициализация MCP Server и агента Upsonic

  Теперь настройте ClickHouse MCP Server для подключения к ClickHouse SQL playground,
  инициализируйте агента и задайте ему вопрос:

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
      description="Расскажи, что произошло на рынке недвижимости Великобритании в 2020-х годах. Используй ClickHouse.",
      tools=[DatabaseMCP]
  )

  # Выполнение рабочего процесса
  workflow_result = database_agent.do(task)
  print("\nРезультат рабочего процесса Multi-MCP:")
  print(workflow_result)
  ```

  ```response title="Response"
  2025-10-10 11:26:12,758 - mcp.server.lowlevel.server - INFO - Processing request of type ListToolsRequest
  Найдено 3 инструмента из DatabaseMCP
    - list_databases: Список доступных баз данных ClickHouse
    - list_tables: Список доступных таблиц ClickHouse в базе данных, включая схему, комментарий,
  количество строк и количество столбцов
    - run_select_query: Выполнение SELECT-запроса в базе данных ClickHouse
  ✅ Инструменты MCP обнаружены через поток

  ...

  [10/10/25 11:26:20] INFO     Запуск MCP-сервера 'mcp-clickhouse' с транспортом 'stdio'                                      server.py:1502
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
  2025-10-10 11:26:24,551 - mcp-clickhouse - INFO - Найдено 38 баз данных
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
  2025-10-10 11:26:28,738 - mcp-clickhouse - INFO - Найдено 9 таблиц
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
  count(*) AS transactions,
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
  2025-10-10 11:26:49,408 - mcp-clickhouse - INFO - Выполнение SELECT-запроса: SELECT toMonth(date) AS month, count(*) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
  FROM uk.uk_price_paid_simple_partitioned
  WHERE toYear(date)=2025
  GROUP BY month
  ORDER BY month
  2025-10-10 11:26:49,408 - mcp-clickhouse - INFO - Создание клиентского подключения ClickHouse к sql-clickhouse.clickhouse.com:8443 от имени demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
  2025-10-10 11:26:49,857 - mcp-clickhouse - INFO - Успешное подключение к серверу ClickHouse версии 25.8.1.8344
  2025-10-10 11:26:50,067 - mcp-clickhouse - INFO - Запрос вернул 8 строк
  2025-10-10 11:26:50,068 - mcp.server.lowlevel.server - INFO - Обработка запроса типа CallToolRequest
  2025-10-10 11:26:50,069 - mcp-clickhouse - INFO - Выполнение SELECT-запроса: SELECT town, count(*) AS transactions, avg(price) AS avg_price
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
  2025-10-10 11:26:50,746 - mcp-clickhouse - INFO - Выполнение SELECT-запроса: SELECT toYear(date) AS year, count(*) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
  FROM uk.uk_price_paid_simple_partitioned
  WHERE toYear(date) IN (2024,2025)
  GROUP BY year
  ORDER BY year
  2025-10-10 11:26:50,747 - mcp-clickhouse - INFO - Создание клиентского подключения ClickHouse к sql-clickhouse.clickhouse.com:8443 от имени demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
  2025-10-10 11:26:51,256 - mcp-clickhouse - INFO - Успешное подключение к серверу ClickHouse версии 25.8.1.8344
  2025-10-10 11:26:51,447 - mcp-clickhouse - INFO - Запрос вернул 2 строки
  2025-10-10 11:26:51,449 - mcp.server.lowlevel.server - INFO - Обработка запроса типа CallToolRequest
  2025-10-10 11:26:51,452 - mcp-clickhouse - INFO - Выполнение SELECT-запроса: SELECT type, count(*) AS transactions, avg(price) AS avg_price, quantileExact(0.5)(price) AS median_price
  FROM uk.uk_price_paid
  WHERE toYear(date)=2025
  GROUP BY type
  ORDER BY avg_price DESC
  2025-10-10 11:26:51,452 - mcp-clickhouse - INFO - Создание клиентского подключения ClickHouse к sql-clickhouse.clickhouse.com:8443 от имени demo (secure=True, verify=True, connect_timeout=30s, send_receive_timeout=30s)
  2025-10-10 11:26:51,952 - mcp-clickhouse - INFO - Успешное подключение к серверу ClickHouse версии 25.8.1.8344
  2025-10-10 11:26:52,166 - mcp-clickhouse - INFO - Запрос вернул 5 строк
  [INFO] 2025-10-10T11:27:51 mcp_agent.mcp_basic_agent - Сводка (краткое изложение)
  - На основе таблиц UK Price Paid в ClickHouse для транзакций, зарегистрированных в 2025 году на данный момент, имеется 376 633 продажи со средней ценой
  £362 283 и медианной ценой £281 000. Данные, по-видимому, включают только месяцы январь–август 2025 года (таким образом, 2025 год неполный). Присутствуют экстремальные
  выбросы (минимум £100, максимум £127 700 000), которые искажают среднее значение.

  Что я вычислил (как)
  Я выполнил агрегации по таблицам uk.price-paid в ClickHouse:
  - общая сводка за 2025 год (количество, среднее, медиана, минимум, максимум) из uk.uk_price_paid_simple_partitioned
  - помесячная разбивка за 2025 год (транзакции, среднее, медиана)
  - топ городов в 2025 году по средней цене (города с >= 50 транзакциями)
  - сравнение по годам: 2024 vs 2025 (количество, среднее, медиана)
  - разбивка по типу недвижимости за 2025 год (количество, среднее, медиана) с использованием uk.uk_price_paid

  Ключевые показатели (из набора данных)
  - Общие показатели за 2025 год (зарегистрированные транзакции): транзакций = 376,633; средняя цена = £362,282.66; медианная цена = £281,000; минимум = £100; максимум =
  £127,700,000.
  - По месяцам (2025): (месяц, транзакции, средняя цена, медианная цена)
    - Янв: 53,927, среднее £386,053, медиана £285,000
    - Фев: 58,740, среднее £371,803, медиана £285,000
    - Мар: 95,274, среднее £377,200, медиана £315,000
    - Апр: 24,987, среднее £331,692, медиана £235,000
    - Май: 39,013, среднее £342,380, медиана £255,000
    - Июн: 41,446, среднее £334,667, медиана £268,500
    - Июл: 44,431, среднее £348,293, медиана £277,500
    - Авг: 18,815, среднее £364,653, медиана £292,999
    (В наборе данных присутствуют только месяцы 1–8.)
  - Топ городов по средней цене (2025, города с ≥50 транзакциями)
    - TRING: 126 транз., среднее £1,973,274
    - BUCKHURST HILL: 98 транз., среднее £1,441,331
    - ASCOT: 175 транз., среднее £1,300,748
    - RADLETT: 69 транз., среднее £1,160,217
    - COBHAM: 115 транз., среднее £1,035,192
    - EAST MOLESEY, BEACONSFIELD, ESHER, CHALFONT ST GILES, THAMES DITTON также входят в топ-10 (все города с высокой средней стоимостью, пригороды для состоятельных жителей).
  - Сравнение по годам (2024 vs 2025 по зарегистрированным данным)
    - 2024: 859,960 транзакций, среднее £390,879, медиана £280,000
    - 2025: 376,633 транзакций, среднее £362,283, медиана £281,000
    (Показатели за 2025 год значительно ниже, поскольку набор данных включает только часть года.)
  - По типу недвижимости (2025)
    - отдельно стоящий дом: 85,362 транз., среднее £495,714, медиана £415,000
    - двухквартирный дом: 107,580 транз., среднее £319,922, медиана £270,000
    - квартира: 62,975 транз., среднее £298,529, медиана £227,000
    - таунхаус: 112,832 транз., среднее £286,616, медиана £227,000
    - прочее: 7,884 транз., среднее £1,087,765 (медиана £315,000) — обратите внимание на эффект малой группы и выбросов

  Важные оговорки и замечания по качеству данных
  - Набор данных за 2025 год является неполным (присутствуют только месяцы с января по август). Любые итоговые показатели за «2025 год» не являются данными за полный год.
  - Присутствуют значительные выбросы (например, максимум £127.7M и минимум £100). Вероятно, они включают ошибки ввода данных или нестандартные записи и завышают
  среднее значение. Медиана часто является более надежной мерой в данном случае.
  - Средние значения для типа недвижимости «прочее» нестабильны из-за малого/неоднородного количества записей и выбросов.
  - Я не применял фильтрацию по is_new, duration или другим метаданным; эти фильтры могут изменить результаты (например, исключение новостроек или
  арендованной недвижимости).
  - Таблицы содержат записи транзакций в стиле Price Paid (зарегистрированные продажи) — они не отражают напрямую запрашиваемые цены или оценочную стоимость.

  Предлагаемые следующие шаги (я могу их выполнить)
  - Удалить очевидные выбросы (например, цены < £10k или > £10M) и пересчитать средние значения/медианы.
  - Создать региональные сводки / по округам / по почтовым индексам и карты.
  - Вычислить медиану месяц к месяцу или скользящую 3-месячную медиану для отображения тренда в течение 2025 года.
  - Рассчитать темпы роста год к году (YoY) по месяцам (например, март 2025 vs март 2024).
  - Составить прогноз на полный 2025 год с использованием простой экстраполяции или моделирования временных рядов (но лучше после принятия решения о том, как обрабатывать отсутствующие
  месяцы/выбросы).

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