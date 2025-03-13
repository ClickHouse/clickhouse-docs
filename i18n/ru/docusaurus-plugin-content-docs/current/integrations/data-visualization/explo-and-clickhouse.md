---
sidebar_label: Explo
sidebar_position: 131
slug: /integrations/explo
keywords: [clickhouse, Explo, connect, integrate, ui]
description: Explo – это простой в использовании инструмент пользовательского интерфейса с открытым исходным кодом для получения ответов на вопросы о ваших данных.
---
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


# Подключение Explo к ClickHouse

Аналитика для клиентов на любой платформе. Разработано для красивой визуализации. Создано для простоты.

## Цель {#goal}

В этом руководстве вы подключите свои данные из ClickHouse к Explo и визуализируете результаты. График будет выглядеть так:
<img src={explo_15} class="image" alt="Explo Dashboard" />

<p/>

:::tip Добавьте данные
Если у вас нет набора данных для работы, вы можете добавить один из примеров. Это руководство использует набор данных [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md), так что можно выбрать его. В той же категории документации есть и другие наборы для изучения.
:::

## 1. Соберите свои данные для подключения {#1-gather-your-connection-details}
<ConnectionDetails />

## 2. Подключите Explo к ClickHouse {#2--connect-explo-to-clickhouse}

1. Зарегистрируйтесь на Explo.

2. Нажмите на вкладку **data** в левой боковой панели.


<img src={explo_01} class="image" alt="Data Tab" />

3. Нажмите **Connect Data Source** в верхнем правом углу.


<img src={explo_02} class="image" alt="Connect Data Source" />

4. Заполните информацию на странице **Getting Started**.


<img src={explo_03} class="image" alt="Getting Started" />

5. Выберите **Clickhouse**.


<img src={explo_04} class="image" alt="Clickhouse" />

6. Введите свои **Clickhouse Credentials**. 


<img src={explo_05} class="image" alt="Credentials" />

7. Настройте **Security**.


<img src={explo_06} class="image" alt="Security" />

8. В Clickhouse, **Whitelist the Explo IPs**.
`
54.211.43.19, 52.55.98.121, 3.214.169.94 и 54.156.141.148
`

## 3. Создайте панель управления {#3-create-a-dashboard}

1. Перейдите на вкладку **Dashboard** в левой боковой панели навигации.


<img src={explo_07} class="image" alt="Dashboard" />

2. Нажмите **Create Dashboard** в верхнем правом углу и назовите свою панель. Вы только что создали панель управления!


<img src={explo_08} class="image" alt="Create Dashboard" />

3. Теперь вы должны видеть экран, который похож на следующий:


<img src={explo_09} class="image" alt="Explo Dashboard" />

## 4. Выполните SQL-запрос {#4-run-a-sql-query}

1. Получите имя своей таблицы из правой боковой панели под заголовком вашей схемы. Затем введите следующую команду в редакторе набора данных:
`
SELECT * FROM YOUR_TABLE_NAME
LIMIT 100
`


<img src={explo_10} class="image" alt="Explo Dashboard" />

2. Теперь нажмите выполнить и перейдите на вкладку предварительного просмотра, чтобы увидеть ваши данные.


<img src={explo_11} class="image" alt="Explo Dashboard" />

## 5. Постройте график {#5-build-a-chart}

1. Слева перетащите значок столбчатой диаграммы на экран.


<img src={explo_16} class="image" alt="Explo Dashboard" />

2. Выберите набор данных. Теперь вы должны видеть экран, похожий на следующий:


<img src={explo_12} class="image" alt="Explo Dashboard" />

3. Укажите **county** по оси X и **Price** по оси Y следующим образом:


<img src={explo_13} class="image" alt="Explo Dashboard" />

4. Теперь измените агрегацию на **AVG**.


<img src={explo_14} class="image" alt="Explo Dashboard" />

5. Теперь у нас есть средняя цена домов по ценовому сегменту!


<img src={explo_15} class="image" alt="Explo Dashboard" />

## Узнайте больше {#learn-more}

Дополнительную информацию об Explo и о том, как создавать панели управления, можно найти, <a href="https://docs.explo.co/" target="_blank">посетив документацию Explo</a>.
