---
sidebar_label: 'Explo'
sidebar_position: 131
slug: /integrations/explo
keywords: ['clickhouse', 'Explo', 'connect', 'integrate', 'ui']
description: 'Explo — это простой в использовании инструмент с открытым исходным кодом и графическим интерфейсом, который упрощает получение ответов на вопросы о ваших данных.'
title: 'Подключение Explo к ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
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

# Подключение Explo к ClickHouse {#connecting-explo-to-clickhouse}

<CommunityMaintainedBadge/>

Клиентская аналитика для любой платформы. Создана для красивой визуализации. Спроектирована с упором на простоту.

## Цель {#goal}

В этом руководстве вы подключите данные из ClickHouse к Explo и визуализируете результаты. Диаграмма будет выглядеть так:
<Image img={explo_15} size="md" alt="Explo Dashboard" />

<p/>

:::tip Добавьте данные
Если у вас ещё нет набора данных для работы, вы можете добавить один из примерных наборов. В этом руководстве используется набор данных [UK Price Paid](/getting-started/example-datasets/uk-price-paid.md), поэтому вы можете выбрать его. В той же категории документации есть и несколько других примеров.
:::

## 1. Соберите сведения о подключении {#1-gather-your-connection-details}
<ConnectionDetails />

## 2.  Подключение Explo к ClickHouse {#2--connect-explo-to-clickhouse}

1. Зарегистрируйтесь в Explo.

2. Нажмите на вкладку **Data** в левой боковой панели Explo.

<Image img={explo_01} size="sm" alt="Вкладка Data" border />

3. Нажмите **Connect Data Source** в правом верхнем углу.

<Image img={explo_02} size="sm" alt="Connect Data Source" border />

4. Заполните данные на странице **Getting Started**.

<Image img={explo_03} size="md" alt="Getting Started" border />

5. Выберите **ClickHouse**.

<Image img={explo_04} size="md" alt="Clickhouse" border />

6. Введите свои учетные данные **ClickHouse**.

<Image img={explo_05} size="md" alt="Credentials" border />

7. Настройте параметры **Security**.

<Image img={explo_06} size="md" alt="Security" border />

8. В ClickHouse **добавьте IP-адреса Explo в whitelist**.
`
54.211.43.19, 52.55.98.121, 3.214.169.94 и 54.156.141.148
`

## 3. Создайте дашборд {#3-create-a-dashboard}

1. Перейдите на вкладку **Dashboard** в левой панели навигации.

<Image img={explo_07} size="sm" alt="Dashboard" border />

2. Нажмите **Create Dashboard** в правом верхнем углу и задайте имя дашборду. Дашборд создан!

<Image img={explo_08} size="sm" alt="Create Dashboard" border />

3. Теперь вы увидите экран, похожий на этот:

<Image img={explo_09} size="md" alt="Explo Dashboard" border />

## 4. Выполните SQL-запрос {#4-run-a-sql-query}

1. Найдите имя таблицы в правой боковой панели под заголовком схемы. Затем введите следующую команду в редактор датасета:
`
SELECT * FROM YOUR_TABLE_NAME
LIMIT 100
`

<Image img={explo_10} size="md" alt="Панель управления Explo" border />

2. Нажмите кнопку `Run` и перейдите на вкладку `Preview`, чтобы просмотреть данные.

<Image img={explo_11} size="md" alt="Панель управления Explo" border />

## 5. Построение графика {#5-build-a-chart}

1. С левой стороны экрана перетащите значок столбчатой диаграммы на область построения.

<Image img={explo_16} size="sm" alt="Explo Dashboard" border />

2. Выберите набор данных. Теперь вы должны увидеть экран, похожий на следующий:

<Image img={explo_12} size="sm" alt="Explo Dashboard" border />

3. Укажите **county** в разделе X Axis и **Price** в разделе Y Axis следующим образом:

<Image img={explo_13} size="sm" alt="Explo Dashboard" border />

4. Теперь измените тип агрегации на **AVG**.

<Image img={explo_14} size="sm" alt="Explo Dashboard" border />

5. Теперь у нас есть средняя стоимость домов с разбивкой по округам!

<Image img={explo_15} size="md" alt="Explo Dashboard" />

## Узнать больше {#learn-more}

Найдите более подробную информацию об Explo и о том, как создавать дашборды, в <a href="https://docs.explo.co/" target="_blank">документации Explo</a>.
