---
sidebar_title: 'Аналитика запросов'
slug: /cloud/get-started/query-insights
description: 'Визуализируйте данные из system.query_log для упрощения отладки запросов и оптимизации производительности'
keywords: ['query insights', 'query log', 'query log ui', 'system.query_log insights']
title: 'Аналитика запросов'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import insights_overview from '@site/static/images/cloud/sqlconsole/insights_overview.png';
import insights_latency from '@site/static/images/cloud/sqlconsole/insights_latency.png';
import insights_recent from '@site/static/images/cloud/sqlconsole/insights_recent.png';
import insights_drilldown from '@site/static/images/cloud/sqlconsole/insights_drilldown.png';
import insights_query_info from '@site/static/images/cloud/sqlconsole/insights_query_info.png';


# Аналитика запросов

Функция **Query Insights** упрощает использование встроенного журнала запросов ClickHouse благодаря различным визуализациям и таблицам. Таблица `system.query_log` в ClickHouse является ключевым источником информации для оптимизации запросов, отладки и мониторинга общего состояния и производительности кластера.



## Обзор запросов {#query-overview}

После выбора сервиса элемент навигации **Monitoring** в левой боковой панели раскроется, показав новый подпункт **Query insights**. При нажатии на него откроется страница Query insights:

<Image
  img={insights_overview}
  size='md'
  alt='Обзор интерфейса Query Insights'
  border
/>


## Метрики верхнего уровня {#top-level-metrics}

Информационные блоки в верхней части отображают основные метрики запросов верхнего уровня за выбранный период времени. Ниже представлены три временных графика, отображающие объём запросов, задержку и частоту ошибок с разбивкой по типу запроса (select, insert, прочие) за выбранный временной интервал. График задержки можно дополнительно настроить для отображения задержек p50, p90 и p99:

<Image
  img={insights_latency}
  size='md'
  alt='График задержки в интерфейсе Query Insights'
  border
/>


## Последние запросы {#recent-queries}

Под метриками верхнего уровня расположена таблица с записями из журнала запросов (сгруппированными по нормализованному хешу запроса и пользователю) за выбранный временной интервал:

<Image
  img={insights_recent}
  size='md'
  alt='Таблица последних запросов в интерфейсе Query Insights'
  border
/>

Последние запросы можно фильтровать и сортировать по любому доступному полю. Таблицу также можно настроить для отображения или скрытия дополнительных полей, таких как таблицы, задержки p90 и p99.


## Детализация запроса {#query-drill-down}

При выборе запроса из таблицы последних запросов откроется боковая панель с метриками и информацией по выбранному запросу:

<Image
  img={insights_drilldown}
  size='md'
  alt='Интерфейс Query Insights — детализация запроса'
  border
/>

Как видно из боковой панели, этот запрос был выполнен более 3000 раз за последние 24 часа. Все метрики на вкладке **Query info** являются агрегированными, однако можно также просмотреть метрики отдельных выполнений, перейдя на вкладку **Query history**:

<Image
  img={insights_query_info}
  size='sm'
  alt='Интерфейс Query Insights — информация о запросе'
  border
/>

<br />

На этой панели можно развернуть элементы `Settings` и `Profile Events` для каждого выполнения запроса, чтобы получить дополнительную информацию.
