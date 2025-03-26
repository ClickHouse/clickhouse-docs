---
sidebar_label: 'Draxlr'
sidebar_position: 131
slug: /integrations/draxlr
keywords: ['clickhouse', 'Draxlr', 'connect', 'integrate', 'ui']
description: 'Draxlr — это инструмент бизнес-аналитики с визуализацией данных и анализом.'
title: 'Подключение Draxlr к ClickHouse'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
import draxlr_01 from '@site/static/images/integrations/data-visualization/draxlr_01.png';
import draxlr_02 from '@site/static/images/integrations/data-visualization/draxlr_02.png';
import draxlr_03 from '@site/static/images/integrations/data-visualization/draxlr_03.png';
import draxlr_04 from '@site/static/images/integrations/data-visualization/draxlr_04.png';
import draxlr_05 from '@site/static/images/integrations/data-visualization/draxlr_05.png';
import draxlr_06 from '@site/static/images/integrations/data-visualization/draxlr_06.png';
import Image from '@theme/IdealImage';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение Draxlr к ClickHouse

<CommunityMaintainedBadge/>

Draxlr предлагает интуитивно понятный интерфейс для подключения к вашей базе данных ClickHouse, позволяя вашей команде исследовать, визуализировать и публиковать аналитические данные всего за несколько минут. Этот гид проведет вас через шаги, необходимые для успешного подключения.

## 1. Получите свои учетные данные ClickHouse {#1-get-your-clickhouse-credentials}
<ConnectionDetails />

## 2. Подключите Draxlr к ClickHouse {#2--connect-draxlr-to-clickhouse}

1. Нажмите на кнопку **Подключить базу данных** в меню.

2. Выберите **ClickHouse** из списка доступных баз данных и нажмите "Далее".

3. Выберите один из сервисов хостинга и нажмите "Далее".

4. Введите любое имя в поле **Имя подключения**.

5. Добавьте данные подключения в форму.

  <Image size="md" img={draxlr_01} alt="Форма подключения Draxlr, показывающая параметры конфигурации базы данных ClickHouse" border />

6. Нажмите кнопку **Далее** и дождитесь установления соединения. Если соединение прошло успешно, вы увидите страницу с таблицами.

## 4. Исследуйте свои данные {#4-explore-your-data}

1. Нажмите на одну из таблиц в списке.

2. Это приведет вас на страницу исследования, где вы сможете увидеть данные в таблице.

3. Вы можете начать добавлять фильтры, делать соединения и добавлять сортировку к своим данным.

  <Image size="md" img={draxlr_02} alt="Интерфейс исследования данных Draxlr, показывающий параметры фильтрации и сортировки" border />

4. Также вы можете использовать кнопку **График** и выбрать тип графика для визуализации данных.

  <Image size="md" img={draxlr_05} alt="Параметры визуализации графиков Draxlr для данных ClickHouse" border />


## 4. Использование SQL-запросов {#4-using-sql-queries}

1. Нажмите на кнопку "Исследовать" в меню.

2. Нажмите кнопку **Сырой запрос** и введите ваш запрос в текстовом поле.

  <Image size="md" img={draxlr_03} alt="Интерфейс SQL-запросов Draxlr для ClickHouse" border />

3. Нажмите кнопку **Выполнить запрос**, чтобы увидеть результаты.


## 4. Сохранение вашего запроса {#4-saving-you-query}

1. После выполнения вашего запроса нажмите кнопку **Сохранить запрос**.

  <Image size="md" img={draxlr_04} alt="Диалог сохранения запроса Draxlr с параметрами панели инструментов" border />

2. Вы можете дать имя запросу в текстовом поле **Имя запроса** и выбрать папку для его категоризации.

3. Также вы можете использовать опцию **Добавить в панель**, чтобы добавить результат на панель инструментов.

4. Нажмите кнопку **Сохранить**, чтобы сохранить запрос.


## 5. Создание панелей инструментов {#5-building-dashboards}

1. Нажмите кнопку **Панели инструментов** в меню.

  <Image size="md" img={draxlr_06} alt="Интерфейс управления панелями инструментов Draxlr" border />

2. Вы можете добавить новую панель, нажав на кнопку **Добавить +** на боковой панели слева.

3. Чтобы добавить новый виджет, нажмите кнопку **Добавить** в правом верхнем углу.

4. Вы можете выбрать запрос из списка сохраненных запросов и выбрать тип визуализации, затем нажмите кнопку **Добавить элемент панели**.

## Узнать больше {#learn-more}
Чтобы узнать больше о Draxlr, вы можете посетить [документацию Draxlr](https://draxlr.notion.site/draxlr/Draxlr-Docs-d228b23383f64d00a70836ff9643a928).
