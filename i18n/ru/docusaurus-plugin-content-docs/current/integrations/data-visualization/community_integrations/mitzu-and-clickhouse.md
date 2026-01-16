---
sidebar_label: 'Mitzu'
slug: /integrations/mitzu
keywords: ['clickhouse', 'Mitzu', 'connect', 'integrate', 'ui']
description: 'Mitzu — это нативное для хранилища данных приложение для продуктовой аналитики, не требующее написания кода.'
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

# Подключение Mitzu к ClickHouse \\{#connecting-mitzu-to-clickhouse\\}

<CommunityMaintainedBadge/>

Mitzu — это no-code решение для продуктовой аналитики, нативно работающее с хранилищем данных. Подобно таким инструментам, как Amplitude, Mixpanel и PostHog, Mitzu позволяет пользователям анализировать данные об использовании продукта без необходимости владения SQL или Python.

Однако в отличие от этих платформ Mitzu не дублирует данные об использовании продукта компании. Вместо этого оно генерирует нативные SQL-запросы непосредственно к уже существующему хранилищу или озеру данных компании.

## Цель \\{#goal\\}

В этом руководстве мы рассмотрим следующее:

- Нативную для хранилища данных продуктовую аналитику
- Как интегрировать Mitzu с ClickHouse

:::tip Пример набора данных
Если у вас нет набора данных для использования в Mitzu, вы можете работать с NYC Taxi Data.
Этот набор данных доступен в ClickHouse Cloud или [может быть загружен по этим инструкциям](/getting-started/example-datasets/nyc-taxi).
:::

Это руководство представляет собой лишь краткий обзор того, как использовать Mitzu. Более подробную информацию вы можете найти в [документации Mitzu](https://docs.mitzu.io/).

## 1. Соберите сведения о подключении \\{#1-gather-your-connection-details\\}

<ConnectionDetails />

## 2. Войдите или зарегистрируйтесь в Mitzu \\{#2-sign-in-or-sign-up-to-mitzu\\}

Для начала перейдите на [https://app.mitzu.io](https://app.mitzu.io) и зарегистрируйтесь.

<Image size="lg" img={mitzu_01} alt="Страница входа в Mitzu с полями для адреса электронной почты и пароля" border />

## 3. Настройте свое рабочее пространство \\{#3-configure-your-workspace\\}

После создания организации следуйте руководству по первичной настройке `Set up your workspace` в левой панели. Затем нажмите ссылку `Connect Mitzu with your data warehouse`.

<Image size="lg" img={mitzu_02} alt="Страница настройки рабочего пространства Mitzu с отображением шагов начальной настройки" border />

## 4. Подключение Mitzu к ClickHouse \\{#4-connect-mitzu-to-clickhouse\\}

Сначала выберите ClickHouse в качестве типа подключения и задайте параметры подключения. Затем нажмите кнопку `Test connection & Save`, чтобы сохранить настройки.

<Image size="lg" img={mitzu_03} alt="Страница настройки подключения Mitzu к ClickHouse с формой конфигурации" border />

## 5. Настройка таблиц событий \\{#5-configure-event-tables\\}

После сохранения подключения выберите вкладку `Event tables` и нажмите кнопку `Add table`. В модальном окне выберите базу данных и таблицы, которые вы хотите добавить в Mitzu.

Используйте флажки, чтобы выбрать как минимум одну таблицу, и нажмите кнопку `Configure table`. Откроется модальное окно, в котором вы сможете задать ключевые столбцы для каждой таблицы.

<Image size="lg" img={mitzu_04} alt="Интерфейс выбора таблиц Mitzu, отображающий таблицы базы данных" border />
<br/>

> Чтобы запускать продуктовую аналитику в вашем окружении ClickHouse, нужно указать несколько ключевых столбцов из таблицы.
>
> Это следующие столбцы:
>
> - **User id** — столбец с уникальным идентификатором пользователя.
> - **Event time** — столбец с временной меткой событий.
> - Необязательный столбец **Event name** — сегментирует события, если таблица содержит несколько типов событий.

<Image size="lg" img={mitzu_05} alt="Конфигурация каталога событий Mitzu с отображением вариантов сопоставления столбцов" border />
<br/>
После того как все таблицы будут настроены, нажмите кнопку `Save & update event catalog`, и Mitzu найдет все события и их свойства в указанных выше таблицах. Этот шаг может занять до нескольких минут в зависимости от размера набора данных.

## 4. Запуск сегментационных запросов \\{#4-run-segmentation-queries\\}

Сегментация пользователей в Mitzu так же проста, как в Amplitude, Mixpanel или PostHog.

На странице Explore слева находится область выбора событий, а в верхней части можно настроить временной горизонт.

<Image size="lg" img={mitzu_06} alt="Интерфейс сегментационных запросов Mitzu с выбором событий и настройкой времени" border />

<br/>

:::tip Фильтры и разбиение
Фильтрация работает так, как вы ожидаете: выберите свойство (столбец ClickHouse) и укажите значения в выпадающем списке, по которым вы хотите фильтровать.
Вы можете выбрать любое событие или пользовательское свойство для разбиения (см. ниже, как интегрировать пользовательские свойства).
:::

## 5. Выполнение запросов по воронке \\{#5-run-funnel-queries\\}

Выберите до 9 шагов для воронки. Задайте временное окно, в течение которого пользователи могут пройти воронку.
Получайте мгновенные сведения о коэффициенте конверсии без единой строки SQL-кода.

<Image size="lg" img={mitzu_07} alt="Представление анализа воронки в Mitzu, показывающее коэффициенты конверсии между шагами" border />

<br/>

:::tip Визуализация трендов
Выберите `Funnel trends`, чтобы визуализировать динамику воронки во времени.
:::

## 6. Run retention queries \\{#6-run-retention-queries\\}

Выберите не более двух шагов для расчёта коэффициента удержания. Задайте окно удержания для повторяющегося периода.
Мгновенно получайте аналитику по коэффициентам конверсии, не написав ни одной строки SQL-кода.

<Image size="lg" img={mitzu_08} alt="Анализ удержания в Mitzu, демонстрирующий показатели удержания когорт" border />

<br/>

:::tip Когортное удержание
Выберите `Weekly cohort retention`, чтобы визуализировать, как ваши показатели удержания меняются со временем.
:::

## 7. Запуск запросов по пути пользователя \\{#7-run-journey-queries\\}
Выберите до 9 шагов для воронки. Укажите временной интервал, в течение которого пользователи могут завершить путь. Диаграмма пути в Mitzu дает наглядную карту всех вариантов прохождения пользователями выбранных событий.

<Image size="lg" img={mitzu_09} alt="Визуализация пути в Mitzu, показывающая поток переходов пользователей между событиями" border />
<br/>

:::tip Детализация шагов
Вы можете выбрать свойство для сегментации `Break down`, чтобы различать пользователей в рамках одного шага.
:::

<br/>

## 8. Запуск запросов по выручке \\{#8-run-revenue-queries\\}

Если параметры выручки настроены, Mitzu может вычислить общий MRR и количество подписок на основе ваших платежных событий.

<Image size="lg" img={mitzu_10} alt="Панель анализа выручки Mitzu с метриками MRR" border />

## 9. SQL native \\{#9-sql-native\\}

Mitzu работает напрямую с SQL, то есть генерирует нативный SQL‑код из выбранной вами конфигурации на странице Explore.

<Image size="lg" img={mitzu_11} alt="Представление генерации SQL-кода в Mitzu с нативным запросом ClickHouse" border />

<br/>

:::tip Продолжайте работу в BI‑инструменте
Если вы столкнулись с ограничением интерфейса Mitzu, скопируйте SQL‑код и продолжайте работу в BI‑инструменте.
:::

## Поддержка Mitzu \\{#mitzu-support\\}

Если у вас возникли сложности, свяжитесь с нами по адресу [support@mitzu.io](email://support@mitzu.io)

Или присоединяйтесь к нашему сообществу в Slack [здесь](https://join.slack.com/t/mitzu-io/shared_invite/zt-1h1ykr93a-_VtVu0XshfspFjOg6sczKg)

## Узнать больше \\{#learn-more\\}

Дополнительную информацию о Mitzu вы можете найти на сайте [mitzu.io](https://mitzu.io)

Ознакомьтесь с нашей документацией на [docs.mitzu.io](https://docs.mitzu.io)