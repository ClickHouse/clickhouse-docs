---
sidebar_label: 'Mitzu'
slug: /integrations/mitzu
keywords: ['clickhouse', 'Mitzu', 'connect', 'integrate', 'ui']
description: 'Mitzu — это no-code приложение для продуктовой аналитики, работающее непосредственно с хранилищем данных.'
title: 'Подключение Mitzu к ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'community'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
import Image from '@theme/IdealImage';
import mitzu_01 from '@site/static/images/integrations/data-visualization/mitzu_01.png';
import mitzu_02 from '@site/static/images/integrations/data-visualization/mitzu_02.png';
import mitzu_03 from '@site/static/images/integrations/data-visualization/mitzu_03.png';
import mitzu_04 from '@site/static/images/integrations/data-visualization/mitzu_04.png';
import mitzu_05 from '@site/static/images/integrations/data-visualization/mitzu_05.png';
import mitzu_06 from '@site/static/images/integrations/data-visualization/mitzu_06.png';
import mitzu_07 from '@site/static/images/integrations/data-visualization/mitzu_07.png';
import mitzu_08 from '@site/static/images/integrations/data-visualization/mitzu_08.png';
import mitzu_09 from '@site/static/images/integrations/data-visualization/mitzu_09.png';
import mitzu_10 from '@site/static/images/integrations/data-visualization/mitzu_10.png';
import mitzu_11 from '@site/static/images/integrations/data-visualization/mitzu_11.png';
import CommunityMaintainedBadge from '@theme/badges/CommunityMaintained';


# Подключение Mitzu к ClickHouse \{#connecting-mitzu-to-clickhouse\}

<CommunityMaintainedBadge/>

Mitzu — это no-code, warehouse-native-приложение для продуктовой аналитики. Подобно таким инструментам, как Amplitude, Mixpanel и PostHog, Mitzu позволяет пользователям анализировать данные об использовании продукта без необходимости владеть SQL или Python.

Однако, в отличие от этих платформ, Mitzu не дублирует данные об использовании продукта компании. Вместо этого оно генерирует нативные SQL-запросы напрямую по данным, хранящимся в существующем хранилище или озере данных компании.

## Цель \{#goal\}

В этом руководстве мы рассмотрим следующее:

- Нативная для хранилища данных продуктовая аналитика
- Как интегрировать Mitzu с ClickHouse

:::tip Примеры наборов данных
Если у вас нет набора данных для работы с Mitzu, вы можете использовать NYC Taxi Data.
Этот набор данных доступен в ClickHouse Cloud или [может быть загружен по этой инструкции](/getting-started/example-datasets/nyc-taxi).
:::

Это руководство — лишь краткий обзор того, как использовать Mitzu. Более подробную информацию вы можете найти в [документации Mitzu](https://docs.mitzu.io/).

## 1. Соберите параметры подключения \{#1-gather-your-connection-details\}

<ConnectionDetails />

## 2. Войдите или зарегистрируйтесь в Mitzu \{#2-sign-in-or-sign-up-to-mitzu\}

Для начала перейдите на [https://app.mitzu.io](https://app.mitzu.io), чтобы зарегистрироваться.

<Image size="lg" img={mitzu_01} alt="Страница входа в Mitzu с полями электронной почты и пароля" border />

## 3. Настройте рабочее пространство \{#3-configure-your-workspace\}

После создания организации выполните мастер начальной настройки `Set up your workspace` в левой боковой панели. Затем нажмите ссылку `Connect Mitzu with your data warehouse`.

<Image size="lg" img={mitzu_02} alt="Страница настройки рабочего пространства Mitzu с этапами начальной настройки" border />

## 4. Подключите Mitzu к ClickHouse \{#4-connect-mitzu-to-clickhouse\}

Сначала выберите ClickHouse в качестве типа подключения и укажите параметры подключения. Затем нажмите кнопку `Test connection & Save`, чтобы сохранить настройки.

<Image size="lg" img={mitzu_03} alt="Страница настройки подключения Mitzu к ClickHouse с формой конфигурации" border />

## 5. Настройте таблицы событий \{#5-configure-event-tables\}

После сохранения подключения выберите вкладку `Event tables` и нажмите кнопку `Add table`. В модальном окне выберите вашу базу данных и таблицы, которые вы хотите добавить в Mitzu.

Используйте флажки, чтобы выбрать как минимум одну таблицу, и нажмите кнопку `Configure table`. Откроется модальное окно, где вы сможете задать ключевые столбцы для каждой таблицы.

<Image size="lg" img={mitzu_04} alt="Интерфейс выбора таблиц в Mitzu, показывающий таблицы базы данных" border />

<br/>

> Чтобы запускать продуктовую аналитику в вашем ClickHouse, нужно указать несколько ключевых столбцов из вашей таблицы.
>
> Необходимо указать следующие столбцы:
>
> - **User id** — столбец с уникальным идентификатором пользователей.
> - **Event time** — столбец с временной меткой ваших событий.
> - Необязательный [**Event name**] — этот столбец сегментирует события, если таблица содержит несколько типов событий.

<Image size="lg" img={mitzu_05} alt="Конфигурация каталога событий Mitzu, показывающая параметры сопоставления столбцов" border />

<br/>

После того как все таблицы будут настроены, нажмите кнопку `Save & update event catalog`, и Mitzu найдёт все события и их свойства из указанных выше таблиц. Этот шаг может занять до нескольких минут в зависимости от размера вашего набора данных.

## 4. Выполнение сегментационных запросов \{#4-run-segmentation-queries\}

Сегментация пользователей в Mitzu так же проста, как в Amplitude, Mixpanel или PostHog.

На странице Explore слева расположена область выбора событий, а в верхней части можно настроить временной диапазон.

<Image size="lg" img={mitzu_06} alt="Интерфейс сегментационного запроса Mitzu с выбором событий и настройкой времени" border />

<br/>

:::tip Фильтры и разбиения
Фильтрация работает так, как вы ожидаете: выберите свойство (столбец ClickHouse) и укажите значения из выпадающего списка, по которым вы хотите отфильтровать данные.
Для разбиений вы можете выбрать любое свойство события или пользователя (см. ниже, как подключить свойства пользователя).
:::

## 5. Запустите запросы по воронке \{#5-run-funnel-queries\}

Выберите до 9 шагов воронки. Укажите временной интервал, в течение которого пользователи могут пройти все шаги воронки.
Получайте мгновенные сведения о коэффициенте конверсии без написания ни одной строки SQL-кода.

<Image size="lg" img={mitzu_07} alt="Представление анализа воронки в Mitzu, показывающее коэффициенты конверсии между шагами" border />

<br/>

:::tip Визуализируйте динамику
Выберите `Funnel trends`, чтобы визуализировать изменение показателей воронки во времени.
:::

## 6. Запустите запросы по удержанию \{#6-run-retention-queries\}

Выберите до двух шагов для расчета коэффициента удержания. Задайте окно удержания для повторяющегося окна, чтобы мгновенно получить сведения о коэффициенте конверсии без написания ни одной строки SQL-кода.

<Image size="lg" img={mitzu_08} alt="Анализ удержания в Mitzu, отображающий показатели удержания когорт" border />

<br/>

:::tip Удержание когорт
Выберите `Weekly cohort retention`, чтобы визуализировать, как ваши показатели удержания меняются со временем.
:::

## 7. Запустите запросы по путям пользователей \{#7-run-journey-queries\}

Выберите до 9 шагов для воронки. Задайте временное окно, в течение которого пользователи могут завершить путь. Диаграмма путей Mitzu дает наглядную карту всех маршрутов, по которым пользователи проходят через выбранные события.

<Image size="lg" img={mitzu_09} alt="Визуализация путей Mitzu, показывающая прохождение пользователей между событиями" border />

<br/>

:::tip Детализация шагов
Вы можете выбрать свойство в сегменте `Break down`, чтобы различать пользователей в рамках одного и того же шага.
:::

<br/>

## 8. Выполнение запросов по выручке \{#8-run-revenue-queries\}

Если параметры выручки настроены, Mitzu может вычислить общий MRR и количество подписок на основе ваших платёжных событий.

<Image size="lg" img={mitzu_10} alt="Панель анализа выручки Mitzu, показывающая метрики MRR" border />

## 9. SQL native \{#9-sql-native\}

Mitzu является SQL‑нативным, то есть генерирует нативный SQL‑код на основе выбранной вами конфигурации на странице Explore.

<Image size="lg" img={mitzu_11} alt="Окно генерации SQL‑кода в Mitzu, показывающее нативный запрос ClickHouse" border />

<br/>

:::tip Продолжайте работу в BI‑инструменте
Если вы сталкиваетесь с ограничениями интерфейса Mitzu, скопируйте SQL‑код и продолжайте работу в BI‑инструменте.
:::

## Поддержка Mitzu \{#mitzu-support\}

Если вы столкнулись с трудностями, вы можете связаться с нами по адресу [support@mitzu.io](email://support@mitzu.io)

Также вы можете присоединиться к нашему сообществу в Slack [здесь](https://join.slack.com/t/mitzu-io/shared_invite/zt-1h1ykr93a-_VtVu0XshfspFjOg6sczKg)

## Узнайте больше \{#learn-more\}

Подробнее о Mitzu читайте на [mitzu.io](https://mitzu.io)

Посетите нашу страницу с документацией на [docs.mitzu.io](https://docs.mitzu.io)