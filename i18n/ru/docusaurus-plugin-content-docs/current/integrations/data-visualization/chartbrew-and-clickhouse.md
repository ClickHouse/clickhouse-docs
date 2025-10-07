---
slug: '/integrations/chartbrew-and-clickhouse'
sidebar_label: Chartbrew
sidebar_position: 131
description: 'Подключите Chartbrew к ClickHouse для создания панелей управления'
title: 'Подключение Chartbrew к ClickHouse'
keywords: ['ClickHouse', 'Chartbrew', 'connect', 'integrate', 'visualization']
doc_type: guide
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


# Подключение Chartbrew к ClickHouse

<CommunityMaintainedBadge/>

[Chartbrew](https://chartbrew.com) — это платформа визуализации данных, которая позволяет пользователям создавать панели мониторинга и отслеживать данные в реальном времени. Она поддерживает несколько источников данных, включая ClickHouse, и предоставляет интерфейс без программирования для построения графиков и отчетов.

## Цель {#goal}

В этом руководстве вы подключите Chartbrew к ClickHouse, выполните SQL-запрос и создадите визуализацию. В конце ваша панель мониторинга может выглядеть примерно так:

<Image img={chartbrew_01} size="lg" alt="Панель мониторинга Chartbrew" />

:::tip Добавьте данные
Если у вас нет набора данных, с которым можно работать, вы можете добавить один из примеров. В этом руководстве используется набор данных [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md).
:::

## 1. Соберите данные для подключения {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. Подключите Chartbrew к ClickHouse {#2-connect-chartbrew-to-clickhouse}

1. Войдите в [Chartbrew](https://chartbrew.com/login) и перейдите на вкладку **Connections**.
2. Нажмите **Create connection** и выберите **ClickHouse** из доступных вариантов баз данных.

   <Image img={chartbrew_02} size="lg" alt="Выбор соединения ClickHouse в Chartbrew" />

3. Введите данные подключения для вашей базы данных ClickHouse:

   - **Display Name**: Имя для идентификации соединения в Chartbrew.
   - **Host**: Имя хоста или IP-адрес вашего сервера ClickHouse.
   - **Port**: Обычно `8443` для HTTPS-соединений.
   - **Database Name**: База данных, с которой вы хотите подключиться.
   - **Username**: Ваше имя пользователя ClickHouse.
   - **Password**: Ваш пароль ClickHouse.

   <Image img={chartbrew_03} size="lg" alt="Настройки соединения ClickHouse в Chartbrew" />

4. Нажмите **Test connection**, чтобы убедиться, что Chartbrew может подключиться к ClickHouse.
5. Если тест пройдет успешно, нажмите **Save connection**. Chartbrew автоматически извлечет схему из ClickHouse.

   <Image img={chartbrew_04} size="lg" alt="Схема JSON ClickHouse в Chartbrew" />

## 3. Создайте набор данных и выполните SQL-запрос {#3-create-a-dataset-and-run-a-sql-query}

1. Нажмите на кнопку **Create dataset** или перейдите на вкладку **Datasets**, чтобы создать новый набор.
2. Выберите соединение ClickHouse, которое вы создали ранее.

   <Image img={chartbrew_05} size="lg" alt="Выбор соединения ClickHouse для набора данных" />

Напишите SQL-запрос для извлечения данных, которые вы хотите визуализировать. Например, этот запрос вычисляет среднюю цену, уплаченную за год, из набора данных `uk_price_paid`:

```sql
SELECT toYear(date) AS year, avg(price) AS avg_price
FROM uk_price_paid
GROUP BY year
ORDER BY year;
```

<Image img={chartbrew_07} size="lg" alt="SQL-запрос ClickHouse в Chartbrew" />

Нажмите **Run query**, чтобы получить данные.

Если вы не уверены, как написать запрос, вы можете использовать **AI-ассистент Chartbrew**, чтобы сгенерировать SQL-запросы на основе вашей схемы базы данных.

<Image img={chartbrew_06} size="lg" alt="AI SQL ассистент ClickHouse в Chartbrew" />

После того как данные будут получены, нажмите **Configure dataset**, чтобы настроить параметры визуализации.

## 4. Создайте визуализацию {#4-create-a-visualization}

1. Определите метрику (числовое значение) и размерность (категориальное значение) для вашей визуализации.
2. Предварительно просмотрите набор данных, чтобы убедиться, что результаты запроса структурированы правильно.
3. Выберите тип графика (например, линейный график, столбчатый график, круговая диаграмма) и добавьте его на свою панель мониторинга.
4. Нажмите **Complete dataset**, чтобы завершить настройку.

   <Image img={chartbrew_08} size="lg" alt="Панель мониторинга Chartbrew с данными ClickHouse" />

Вы можете создать столько наборов данных, сколько хотите, чтобы визуализировать разные аспекты ваших данных. Используя эти наборы данных, вы можете создать несколько панелей мониторинга для отслеживания различных метрик.

<Image img={chartbrew_01} size="lg" alt="Панель мониторинга Chartbrew с данными ClickHouse" />

## 5. Автоматизируйте обновление данных {#5-automate-data-updates}

Чтобы ваша панель мониторинга оставалась актуальной, вы можете запланировать автоматическое обновление данных:

1. Нажмите на значок Календаря рядом с кнопкой обновления набора данных.
2. Настройте интервал обновления (например, каждый час, каждый день).
3. Сохраните настройки, чтобы включить автоматическое обновление.

<Image img={chartbrew_09} size="lg" alt="Настройки обновления набора данных Chartbrew" />

## Узнайте больше {#learn-more}

Для получения дополнительных сведений ознакомьтесь со статьей в блоге о [Chartbrew и ClickHouse](https://chartbrew.com/blog/visualizing-clickhouse-data-with-chartbrew-a-step-by-step-guide/).