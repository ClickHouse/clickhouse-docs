---
title: 'Подключение Chartbrew к ClickHouse'
sidebar_label: 'Chartbrew'
sidebar_position: 131
slug: /integrations/chartbrew-and-clickhouse
keywords: ['ClickHouse', 'Chartbrew', 'connect', 'integrate', 'visualization']
description: 'Подключите Chartbrew к ClickHouse, чтобы создавать панели мониторинга и клиентские отчёты в реальном времени.'
doc_type: 'guide'
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

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';
import Image from '@theme/IdealImage';


# Подключение Chartbrew к ClickHouse

<CommunityMaintainedBadge/>

[Chartbrew](https://chartbrew.com) — это платформа визуализации данных, которая позволяет пользователям создавать панели мониторинга и отслеживать данные в режиме реального времени. Она поддерживает множество источников данных, включая ClickHouse, и предоставляет интерфейс без необходимости писать код для создания графиков и отчётов.



## Цель {#goal}

В этом руководстве вы подключите Chartbrew к ClickHouse, выполните SQL-запрос и создадите визуализацию. В итоге ваша панель управления может выглядеть примерно так:

<Image img={chartbrew_01} size='lg' alt='Панель управления Chartbrew' />

:::tip Добавьте данные
Если у вас нет набора данных для работы, можно добавить один из примеров. В этом руководстве используется набор данных [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md).
:::


## 1. Соберите данные для подключения {#1-gather-your-connection-details}

<ConnectionDetails />


## 2. Подключение Chartbrew к ClickHouse {#2-connect-chartbrew-to-clickhouse}

1. Войдите в [Chartbrew](https://chartbrew.com/login) и перейдите на вкладку **Connections**.
2. Нажмите **Create connection** и выберите **ClickHouse** из доступных вариантов баз данных.

   <Image
     img={chartbrew_02}
     size='lg'
     alt='Выбор подключения ClickHouse в Chartbrew'
   />

3. Введите параметры подключения к базе данных ClickHouse:
   - **Display Name**: Имя для идентификации подключения в Chartbrew.
   - **Host**: Имя хоста или IP-адрес сервера ClickHouse.
   - **Port**: Обычно `8443` для HTTPS-соединений.
   - **Database Name**: База данных, к которой требуется подключиться.
   - **Username**: Имя пользователя ClickHouse.
   - **Password**: Пароль ClickHouse.

   <Image
     img={chartbrew_03}
     size='lg'
     alt='Настройки подключения ClickHouse в Chartbrew'
   />

4. Нажмите **Test connection**, чтобы проверить возможность подключения Chartbrew к ClickHouse.
5. Если проверка прошла успешно, нажмите **Save connection**. Chartbrew автоматически загрузит схему из ClickHouse.

   <Image
     img={chartbrew_04}
     size='lg'
     alt='JSON-схема ClickHouse в Chartbrew'
   />


## 3. Создание набора данных и выполнение SQL-запроса {#3-create-a-dataset-and-run-a-sql-query}

1. Нажмите кнопку **Create dataset** или перейдите на вкладку **Datasets** для создания набора данных.
2. Выберите созданное ранее подключение к ClickHouse.

<Image
  img={chartbrew_05}
  size='lg'
  alt='Выбор подключения к ClickHouse для набора данных'
/>

Напишите SQL-запрос для получения данных, которые требуется визуализировать. Например, следующий запрос вычисляет среднюю цену по годам из набора данных `uk_price_paid`:

```sql
SELECT toYear(date) AS year, avg(price) AS avg_price
FROM uk_price_paid
GROUP BY year
ORDER BY year;
```

<Image img={chartbrew_07} size='lg' alt='SQL-запрос к ClickHouse в Chartbrew' />

Нажмите **Run query** для получения данных.

Если вы не знаете, как составить запрос, можно воспользоваться **AI-ассистентом Chartbrew** для генерации SQL-запросов на основе схемы базы данных.

<Image
  img={chartbrew_06}
  size='lg'
  alt='AI SQL-ассистент для ClickHouse в Chartbrew'
/>

После получения данных нажмите **Configure dataset** для настройки параметров визуализации.


## 4. Создайте визуализацию {#4-create-a-visualization}

1. Определите метрику (числовое значение) и измерение (категориальное значение) для вашей визуализации.
2. Просмотрите набор данных, чтобы убедиться, что результаты запроса структурированы правильно.
3. Выберите тип диаграммы (например, линейная диаграмма, столбчатая диаграмма, круговая диаграмма) и добавьте её на ваш дашборд.
4. Нажмите **Завершить набор данных**, чтобы завершить настройку.

<Image
  img={chartbrew_08}
  size='lg'
  alt='Дашборд Chartbrew с данными ClickHouse'
/>

Вы можете создавать столько наборов данных, сколько хотите, чтобы визуализировать разные аспекты ваших данных. Используя эти наборы данных, вы можете создавать несколько дашбордов для отслеживания различных метрик.

<Image
  img={chartbrew_01}
  size='lg'
  alt='Дашборд Chartbrew с данными ClickHouse'
/>


## 5. Автоматизация обновления данных {#5-automate-data-updates}

Чтобы дашборд всегда содержал актуальные данные, можно настроить автоматическое обновление:

1. Нажмите на значок календаря рядом с кнопкой обновления набора данных.
2. Настройте интервал обновления (например, каждый час или каждый день).
3. Сохраните настройки, чтобы включить автоматическое обновление.

<Image img={chartbrew_09} size='lg' alt='Настройки обновления набора данных Chartbrew' />


## Узнать больше {#learn-more}

Подробнее читайте в статье блога о [Chartbrew и ClickHouse](https://chartbrew.com/blog/visualizing-clickhouse-data-with-chartbrew-a-step-by-step-guide/).
