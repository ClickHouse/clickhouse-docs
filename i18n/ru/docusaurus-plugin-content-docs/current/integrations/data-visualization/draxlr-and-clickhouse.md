---
sidebar_label: 'Draxlr'
sidebar_position: 131
slug: /integrations/draxlr
keywords: ['clickhouse', 'Draxlr', 'connect', 'integrate', 'ui']
description: 'Draxlr - это инструмент бизнес-аналитики с визуализацией данных и аналитикой.'
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

Draxlr предлагает интуитивно понятный интерфейс для подключения к вашей базе данных ClickHouse, позволяя вашей команде исследовать, визуализировать и публиковать инсайты всего за несколько минут. Этот гид проведет вас через шаги для успешного подключения.

## 1. Получите свои учетные данные ClickHouse {#1-get-your-clickhouse-credentials}
<ConnectionDetails />

## 2. Подключите Draxlr к ClickHouse {#2--connect-draxlr-to-clickhouse}

1. Нажмите на кнопку **Подключить базу данных** в верхней панели навигации.

2. Выберите **ClickHouse** из списка доступных баз данных и нажмите "Далее".

3. Выберите один из хостинг-сервисов и нажмите "Далее".

4. Введите любое имя в поле **Имя подключения**.

5. Добавьте детали подключения в форму.

  <Image size="md" img={draxlr_01} alt="Форма подключения Draxlr, показывающая параметры конфигурации базы данных ClickHouse" border />

6. Нажмите на кнопку **Далее** и ждите, пока соединение будет установлено. Вы увидите страницу таблиц, если соединение успешно.

## 4. Исследуйте свои данные {#4-explore-your-data}

1. Нажмите на одну из таблиц в списке.

2. Это перенесет вас на страницу исследования, чтобы увидеть данные в таблице.

3. Вы можете начать добавлять фильтры, делать соединения и сортировать данные.

  <Image size="md" img={draxlr_02} alt="Интерфейс исследования данных Draxlr, показывающий параметры фильтрации и сортировки" border />

4. Вы также можете использовать кнопку **График** и выбрать тип графика для визуализации данных.

  <Image size="md" img={draxlr_05} alt="Варианты визуализации графиков Draxlr для данных ClickHouse" border />

## 4. Использование SQL запросов {#4-using-sql-queries}

1. Нажмите на кнопку "Исследовать" в верхней панели навигации.

2. Нажмите кнопку **Сырой запрос** и введите ваш запрос в текстовой области.

  <Image size="md" img={draxlr_03} alt="Интерфейс SQL запроса Draxlr для ClickHouse" border />

3. Нажмите на кнопку **Выполнить запрос**, чтобы увидеть результаты.

## 4. Сохранение вашего запроса {#4-saving-you-query}

1. После выполнения вашего запроса нажмите на кнопку **Сохранить запрос**.

  <Image size="md" img={draxlr_04} alt="Диалог сохранения запроса Draxlr с параметрами панели управления" border />

2. Вы можете дать имя запросу в текстовом поле **Имя запроса** и выбрать папку, чтобы его классифицировать.

3. Вы также можете использовать опцию **Добавить в панель управления**, чтобы добавить результат на панель.

4. Нажмите на кнопку **Сохранить**, чтобы сохранить запрос.

## 5. Создание панелей управления {#5-building-dashboards}

1. Нажмите на кнопку **Панели управления** в верхней панели навигации.

  <Image size="md" img={draxlr_06} alt="Интерфейс управления панелями управления Draxlr" border />

2. Вы можете добавить новую панель, нажав на кнопку **Добавить +** на левой боковой панели.

3. Чтобы добавить новый виджет, нажмите на кнопку **Добавить** в правом верхнем углу.

4. Вы можете выбрать запрос из списка сохраненных запросов и выбрать тип визуализации, затем нажмите на кнопку **Добавить элемент панели управления**.

## Узнать больше {#learn-more}
Чтобы узнать больше о Draxlr, вы можете посетить [документацию Draxlr](https://draxlr.notion.site/draxlr/Draxlr-Docs-d228b23383f64d00a70836ff9643a928).
