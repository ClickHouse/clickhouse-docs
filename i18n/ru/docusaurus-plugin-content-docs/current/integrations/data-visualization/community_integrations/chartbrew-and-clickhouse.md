---
title: 'Подключение Chartbrew к ClickHouse'
sidebar_label: 'Chartbrew'
sidebar_position: 131
slug: /integrations/chartbrew-and-clickhouse
keywords: ['ClickHouse', 'Chartbrew', 'connect', 'integrate', 'visualization']
description: 'Подключите Chartbrew к ClickHouse для создания дашбордов и клиентских отчётов в реальном времени.'
doc_type: 'guide'
integration:
   - support_level: 'community'
   - category: 'data_visualization'
---

import chartbrew_01 from '@site/static/images/integrations/data-visualization/chartbrew_01.png';
import chartbrew_02 from '@site/static/images/integrations/data-visualization/chartbrew_02.png';
import chartbrew_03 from '@site/static/images/integrations/data-visualization/chartbrew_03.png';
import chartbrew_04 from '@site/static/images/integrations/data-visualization/chartbrew_04.png';
import chartbrew_05 from '@site/static/images/integrations/data-visualization/chartbrew_05.png';
import chartbrew_06 from '@site/static/images/integrations/data-visualization/chartbrew_06.png';
import chartbrew_07 from '@site/static/images/integrations/data-visualization/chartbrew_07.png';
import chartbrew_08 from '@site/static/images/integrations/data-visualization/chartbrew_08.png';
import chartbrew_09 from '@site/static/images/integrations/data-visualization/chartbrew_09.png';

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import Image from '@theme/IdealImage';

# Подключение Chartbrew к ClickHouse \{#connecting-chartbrew-to-clickhouse\}

<CommunityMaintainedBadge/>

[Chartbrew](https://chartbrew.com) — это платформа визуализации данных, которая позволяет вам создавать дашборды и мониторить данные в режиме реального времени. Она поддерживает различные источники данных, включая ClickHouse, и предоставляет интерфейс без необходимости писать код для создания графиков и отчётов.

## Цель \\{#goal\\}

В этом руководстве вы подключите Chartbrew к ClickHouse, выполните SQL-запрос и создадите визуализацию. В конце ваша панель мониторинга может выглядеть примерно так:

<Image img={chartbrew_01} size="lg" alt="Панель мониторинга Chartbrew" />

:::tip Добавьте данные
Если у вас нет набора данных для работы, вы можете добавить один из примеров. В этом руководстве используется набор данных [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md).
:::

## 1. Соберите параметры подключения \\{#1-gather-your-connection-details\\}

<ConnectionDetails />

## 2. Подключение Chartbrew к ClickHouse \\{#2-connect-chartbrew-to-clickhouse\\}

1. Войдите в [Chartbrew](https://chartbrew.com/login) и перейдите на вкладку **Connections**.
2. Нажмите **Create connection** и выберите **ClickHouse** из доступных вариантов баз данных.

   <Image img={chartbrew_02} size="lg" alt="Выбор подключения ClickHouse в Chartbrew" />

3. Введите параметры подключения к вашей базе данных ClickHouse:

   - **Display Name**: Отображаемое имя подключения в Chartbrew.
   - **Host**: Имя хоста или IP-адрес сервера ClickHouse.
   - **Port**: Обычно `8443` для HTTPS-подключения.
   - **Database Name**: База данных, к которой вы хотите подключиться.
   - **Username**: Имя пользователя ClickHouse.
   - **Password**: Пароль пользователя ClickHouse.

   <Image img={chartbrew_03} size="lg" alt="Настройки подключения ClickHouse в Chartbrew" />

4. Нажмите **Test connection**, чтобы убедиться, что Chartbrew может подключиться к ClickHouse.
5. Если проверка прошла успешно, нажмите **Save connection**. Chartbrew автоматически получит схему базы данных из ClickHouse.

   <Image img={chartbrew_04} size="lg" alt="JSON-схема ClickHouse в Chartbrew" />

## 3. Создайте набор данных и выполните SQL-запрос \{#3-create-a-dataset-and-run-a-sql-query\}

1. Нажмите кнопку **Create dataset** или перейдите на вкладку **Datasets**, чтобы создать набор данных.
2. Выберите подключение к ClickHouse, созданное ранее.

<Image img={chartbrew_05} size="lg" alt="Выбор подключения ClickHouse для набора данных" />

Напишите SQL-запрос для получения данных, которые вы хотите визуализировать. Например, этот запрос вычисляет среднюю уплаченную цену по годам из набора данных `uk_price_paid`:

```sql
  SELECT toYear(date) AS year, avg(price) AS avg_price
  FROM uk_price_paid
  GROUP BY year
  ORDER BY year;
```

<Image img={chartbrew_07} size="lg" alt="SQL-запрос ClickHouse в Chartbrew" />

Нажмите **Run query**, чтобы выполнить запрос и получить данные.

Если вы не уверены, как составить запрос, вы можете использовать **AI-помощник Chartbrew** для генерации SQL-запросов на основе схемы вашей базы данных.

<Image img={chartbrew_06} size="lg" alt="AI-помощник по SQL для ClickHouse в Chartbrew" />

После того как данные будут получены, нажмите **Configure dataset**, чтобы настроить параметры визуализации.


## 4. Создание визуализации \\{#4-create-a-visualization\\}
   
  1. Определите метрику (числовое значение) и размерность (категориальное значение) для визуализации.
  2. Просмотрите набор данных в режиме предварительного просмотра, чтобы убедиться, что результаты запроса корректно структурированы.
  3. Выберите тип диаграммы (например, линейную, столбчатую или круговую диаграмму) и добавьте её на дашборд.
  4. Нажмите **Complete dataset**, чтобы завершить настройку.

  <Image img={chartbrew_08} size="lg" alt="Дашборд Chartbrew с данными ClickHouse" />

  Вы можете создавать столько наборов данных, сколько потребуется, чтобы визуализировать разные аспекты ваших данных. Используя эти наборы данных, вы можете создавать несколько дашбордов для отслеживания различных метрик.

  <Image img={chartbrew_01} size="lg" alt="Дашборд Chartbrew с данными ClickHouse" />

## 5. Автоматизация обновления данных \\{#5-automate-data-updates\\}

Чтобы панель мониторинга всегда отображала актуальные данные, вы можете запланировать автоматическое обновление:

1. Нажмите на значок календаря рядом с кнопкой обновления набора данных.
  2. Настройте интервал обновления (например, каждый час или каждый день).
  3. Сохраните настройки, чтобы включить автоматическое обновление.

<Image img={chartbrew_09} size="lg" alt="Настройки обновления набора данных в Chartbrew" />

## Дополнительные материалы \\{#learn-more\\}

Более подробную информацию можно найти в статье в блоге о [Chartbrew и ClickHouse](https://chartbrew.com/blog/visualizing-clickhouse-data-with-chartbrew-a-step-by-step-guide/).