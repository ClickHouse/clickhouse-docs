---
slug: '/integrations/explo'
sidebar_label: Explo
sidebar_position: 131
description: 'Explo — это простой в использовании инструмент пользовательского интерфейса'
title: 'Подключение Explo к ClickHouse'
keywords: ['clickhouse', 'Explo', 'connect', 'integrate', 'ui']
doc_type: guide
---
import Image from '@theme/IdealImage';
import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import explo_01 from '@site/static/images/integrations/data-visualization/explo_01.png';
import explo_02 from '@site/static/images/integrations/data-visualization/explo_02.png';
import explo_03 from '@site/static/images/integrations/data-visualization/explo_03.png';
import explo_04 from '@site/static/images/integrations/data-visualization/explo_04.png';
import explo_05 from '@site/static/images/integrations/data-visualization/explo_05.png';
import explo_06 from '@site/static/images/integrations/data-visualization/explo_06.png';
import explo_07 from '@site/static/images/integrations/data-visualization/explo_07.png';
import explo_08 from '@site/static/images/integrations/data-visualization/explo_08.png';
import explo_09 from '@site/static/images/integrations/data-visualization/explo_09.png';
import explo_10 from '@site/static/images/integrations/data-visualization/explo_10.png';
import explo_11 from '@site/static/images/integrations/data-visualization/explo_11.png';
import explo_12 from '@site/static/images/integrations/data-visualization/explo_12.png';
import explo_13 from '@site/static/images/integrations/data-visualization/explo_13.png';
import explo_14 from '@site/static/images/integrations/data-visualization/explo_14.png';
import explo_15 from '@site/static/images/integrations/data-visualization/explo_15.png';
import explo_16 from '@site/static/images/integrations/data-visualization/explo_16.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение Explo к ClickHouse

<CommunityMaintainedBadge/>

Аналитика для клиентов на любой платформе. Создана для красивой визуализации. Разработана для простоты.

## Цель {#goal}

В этом руководстве вы подключите свои данные из ClickHouse к Explo и визуализируете результаты. График будет выглядеть следующим образом:
<Image img={explo_15} size="md" alt="Панель мониторинга Explo" />

<p/>

:::tip Добавьте данные
Если у вас нет набора данных для работы, вы можете добавить один из примеров. Это руководство использует набор данных [Цены в Великобритании](/getting-started/example-datasets/uk-price-paid.md), поэтому вы можете выбрать его. В той же категории документации есть несколько других наборов данных для изучения.
:::

## 1. Соберите детали подключения {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Подключите Explo к ClickHouse {#2--connect-explo-to-clickhouse}

1. Зарегистрируйтесь для получения учетной записи Explo.

2. Нажмите на вкладку Explo **данные** в левом боковом меню.

<Image img={explo_01} size="sm" alt="Вкладка Данные" border />

3. Нажмите **Подключить источник данных** в правом верхнем углу.

<Image img={explo_02} size="sm" alt="Подключить источник данных" border />

4. Заполните информацию на странице **Начало работы**.

<Image img={explo_03} size="md" alt="Начало работы" border />

5. Выберите **Clickhouse**.

<Image img={explo_04} size="md" alt="Clickhouse" border />

6. Введите свои **учетные данные Clickhouse**.

<Image img={explo_05} size="md" alt="Учетные данные" border />

7. Настройте **Безопасность**.

<Image img={explo_06} size="md" alt="Безопасность" border />

8. В Clickhouse **добавьте IP-адреса Explo в белый список**.
`
54.211.43.19, 52.55.98.121, 3.214.169.94, и 54.156.141.148
`

## 3. Создайте панель мониторинга {#3-create-a-dashboard}

1. Перейдите на вкладку **Панель мониторинга** в левом боковом меню.

<Image img={explo_07} size="sm" alt="Панель мониторинга" border />

2. Нажмите **Создать панель мониторинга** в правом верхнем углу и назовите свою панель. Вы только что создали панель мониторинга!

<Image img={explo_08} size="sm" alt="Создать панель мониторинга" border />

3. Теперь вы должны увидеть экран, похожий на следующий:

<Image img={explo_09} size="md" alt="Панель мониторинга Explo" border />

## 4. Выполните SQL-запрос {#4-run-a-sql-query}

1. Получите имя вашей таблицы в правом боковом меню под заголовком вашей схемы. Затем введите следующую команду в редакторе вашего набора данных:
`
SELECT * FROM YOUR_TABLE_NAME
LIMIT 100
`

<Image img={explo_10} size="md" alt="Панель мониторинга Explo" border />

2. Теперь нажмите "Запустить" и перейдите на вкладку "Предварительный просмотр", чтобы увидеть ваши данные.

<Image img={explo_11} size="md" alt="Панель мониторинга Explo" border />

## 5. Постройте график {#5-build-a-chart}

1. С левой стороны перетащите значок столбчатой диаграммы на экран.

<Image img={explo_16} size="sm" alt="Панель мониторинга Explo" border />

2. Выберите набор данных. Теперь вы должны увидеть экран, похожий на следующий:

<Image img={explo_12} size="sm" alt="Панель мониторинга Explo" border />

3. Заполните **county** по оси X и **Price** в разделе оси Y следующим образом:

<Image img={explo_13} size="sm" alt="Панель мониторинга Explo" border />

4. Теперь измените агрегирование на **AVG**.

<Image img={explo_14} size="sm" alt="Панель мониторинга Explo" border />

5. Теперь у нас есть средняя цена домов, разбитая по ценам!

<Image img={explo_15} size="md" alt="Панель мониторинга Explo" />

## Узнать больше {#learn-more}

Найдите дополнительную информацию о Explo и о том, как создавать панели мониторинга, <a href="https://docs.explo.co/" target="_blank">посетив документацию Explo</a>.