---
sidebar_title: 'Анализ запросов'
slug: /cloud/get-started/query-insights
description: 'Визуализируйте данные system.query_log, чтобы упростить отладку запросов и оптимизацию их производительности'
keywords: ['query insights', 'query log', 'query log ui', 'system.query_log insights']
title: 'Анализ запросов'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import insights_overview from '@site/static/images/cloud/sqlconsole/insights_overview.png';
import insights_latency from '@site/static/images/cloud/sqlconsole/insights_latency.png';
import insights_recent from '@site/static/images/cloud/sqlconsole/insights_recent.png';
import insights_drilldown from '@site/static/images/cloud/sqlconsole/insights_drilldown.png';
import insights_query_info from '@site/static/images/cloud/sqlconsole/insights_query_info.png';

# Аналитика запросов \\{#query-insights\\}

Возможность **Query Insights** упрощает работу со встроенным журналом запросов ClickHouse за счёт различных визуализаций и таблиц. Таблица `system.query_log` в ClickHouse является ключевым источником информации для оптимизации запросов, отладки и мониторинга общего состояния и производительности кластера.

## Обзор запросов \\{#query-overview\\}

После выбора сервиса пункт навигации **Monitoring** в левой боковой панели разворачивается и отображает новый подпункт **Query insights**. Щелчок по этому пункту открывает новую страницу Query insights:

<Image img={insights_overview} size="md" alt="Обзор интерфейса Query Insights" border/>

## Метрики верхнего уровня \\{#top-level-metrics\\}

Статистические блоки в верхней части отображают базовые сводные метрики запросов за выбранный период времени. Ниже представлены три графика временных рядов, показывающие объем запросов, задержку и уровень ошибок с разбивкой по типам запросов (select, insert, other) за выбранный временной интервал. График задержки можно дополнительно настроить для отображения задержек p50, p90 и p99:

<Image img={insights_latency} size="md" alt="График задержки в интерфейсе Query Insights" border/>

## Недавние запросы \\{#recent-queries\\}

Под основными метриками отображается таблица записей журнала запросов (сгруппированных по нормализованному хэшу запроса и пользователю) за выбранный временной интервал:

<Image img={insights_recent} size="md" alt="Таблица Recent Queries в интерфейсе Query Insights" border/>

Недавние запросы можно фильтровать и сортировать по любому из доступных полей. Таблицу также можно настроить для отображения или скрытия дополнительных полей, таких как таблицы, а также задержки p90 и p99.

## Детальный разбор запроса \\{#query-drill-down\\}

При выборе запроса в таблице недавних запросов открывается всплывающая панель, содержащая метрики и информацию, относящиеся к выбранному запросу:

<Image img={insights_drilldown} size="md" alt="Интерфейс Query Insights, детальный разбор запроса" border/>

Как видно из этой панели, этот запрос был выполнен более 3000 раз за последние 24 часа. Все метрики на вкладке **Query info** являются агрегированными, но мы также можем просмотреть метрики отдельных запусков, выбрав вкладку **Query history**:

<Image img={insights_query_info} size="sm" alt="Интерфейс Query Insights, информация о запросе" border/>

<br />

В этой панели элементы `Settings` и `Profile Events` для каждого запуска запроса можно развернуть, чтобы увидеть дополнительную информацию.
