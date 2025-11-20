---
sidebar_label: 'Mitzu'
slug: /integrations/mitzu
keywords: ['clickhouse', 'Mitzu', 'connect', 'integrate', 'ui']
description: 'Mitzu — нативное для хранилища приложение для аналitika продукта, не требующее написания кода.'
title: 'Подключение Mitzu к ClickHouse'
doc_type: 'guide'
integration:
  - support_level: 'partner'
  - category: 'data_visualization'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_http.mdx';
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


# Подключение Mitzu к ClickHouse

<CommunityMaintainedBadge/>

Mitzu — это no-code‑платформа продуктовой аналитики, нативно работающая с хранилищем данных. Подобно таким инструментам, как Amplitude, Mixpanel и PostHog, Mitzu позволяет пользователям анализировать данные об использовании продукта без необходимости владеть SQL или Python.

Однако, в отличие от этих платформ, Mitzu не дублирует данные компании об использовании продукта. Вместо этого она генерирует нативные SQL‑запросы непосредственно по данным в существующем хранилище или озере данных компании.



## Цель {#goal}

В этом руководстве мы рассмотрим следующее:

- Продуктовая аналитика, встроенная в хранилище данных
- Как интегрировать Mitzu с ClickHouse

:::tip Примеры наборов данных
Если у вас нет набора данных для работы с Mitzu, вы можете использовать данные NYC Taxi.
Этот набор данных доступен в ClickHouse Cloud или [может быть загружен согласно этой инструкции](/getting-started/example-datasets/nyc-taxi).
:::

Данное руководство представляет собой краткий обзор работы с Mitzu. Более подробную информацию можно найти в [документации Mitzu](https://docs.mitzu.io/).


## 1. Соберите данные для подключения {#1-gather-your-connection-details}

<ConnectionDetails />


## 2. Войдите или зарегистрируйтесь в Mitzu {#2-sign-in-or-sign-up-to-mitzu}

Для начала перейдите на [https://app.mitzu.io](https://app.mitzu.io), чтобы зарегистрироваться.

<Image
  size='lg'
  img={mitzu_01}
  alt='Страница входа в Mitzu с полями для электронной почты и пароля'
  border
/>


## 3. Настройте рабочее пространство {#3-configure-your-workspace}

После создания организации следуйте инструкциям по настройке в разделе `Set up your workspace` на левой боковой панели. Затем нажмите на ссылку `Connect Mitzu with your data warehouse`.

<Image
  size='lg'
  img={mitzu_02}
  alt='Страница настройки рабочего пространства Mitzu с этапами начальной настройки'
  border
/>


## 4. Подключение Mitzu к ClickHouse {#4-connect-mitzu-to-clickhouse}

Сначала выберите ClickHouse в качестве типа подключения и укажите параметры соединения. Затем нажмите кнопку `Test connection & Save`, чтобы сохранить настройки.

<Image
  size='lg'
  img={mitzu_03}
  alt='Страница настройки подключения Mitzu к ClickHouse с формой конфигурации'
  border
/>


## 5. Настройка таблиц событий {#5-configure-event-tables}

После сохранения подключения перейдите на вкладку `Event tables` и нажмите кнопку `Add table`. В открывшемся окне выберите базу данных и таблицы, которые необходимо добавить в Mitzu.

С помощью флажков выберите хотя бы одну таблицу и нажмите кнопку `Configure table`. Откроется окно, в котором можно задать ключевые столбцы для каждой таблицы.

<Image
  size='lg'
  img={mitzu_04}
  alt='Интерфейс выбора таблиц Mitzu с отображением таблиц базы данных'
  border
/>
<br />

> Для запуска продуктовой аналитики в вашей установке ClickHouse необходимо указать несколько ключевых столбцов таблицы.
>
> К ним относятся:
>
> - **User id** — столбец с уникальным идентификатором пользователя.
> - **Event time** — столбец с временной меткой события.
> - Опционально[**Event name**] — столбец для сегментации событий, если таблица содержит несколько типов событий.

<Image
  size='lg'
  img={mitzu_05}
  alt='Настройка каталога событий Mitzu с параметрами сопоставления столбцов'
  border
/>
<br />
После настройки всех таблиц нажмите кнопку `Save & update event catalog`,
и Mitzu найдет все события и их свойства в
указанных таблицах. Этот шаг может занять несколько минут в зависимости от
размера набора данных.


## 4. Выполнение запросов сегментации {#4-run-segmentation-queries}

Сегментация пользователей в Mitzu так же проста, как в Amplitude, Mixpanel или PostHog.

На странице Explore слева находится область выбора событий, а в верхней части можно настроить временной горизонт.

<Image
  size='lg'
  img={mitzu_06}
  alt='Интерфейс запросов сегментации Mitzu с выбором событий и настройкой времени'
  border
/>

<br />

:::tip Фильтры и разбивка
Фильтрация работает интуитивно: выберите свойство (столбец ClickHouse) и укажите нужные значения из выпадающего списка для фильтрации.
Для разбивки можно использовать любое свойство события или пользователя (см. ниже, как интегрировать свойства пользователей).
:::


## 5. Запуск воронкообразных запросов {#5-run-funnel-queries}

Выберите до 9 шагов для воронки. Укажите временное окно, в течение которого пользователи могут завершить прохождение воронки.
Получайте мгновенную аналитику по коэффициенту конверсии без написания ни одной строки SQL-кода.

<Image
  size='lg'
  img={mitzu_07}
  alt='Представление анализа воронки Mitzu с коэффициентами конверсии между шагами'
  border
/>

<br />

:::tip Визуализация трендов
Выберите `Funnel trends` для визуализации трендов воронки во времени.
:::


## 6. Выполнение запросов на анализ удержания {#6-run-retention-queries}

Выберите до 2 шагов для расчета показателя удержания. Выберите окно удержания для повторяющегося окна.
Получайте мгновенную аналитику по конверсии без написания ни одной строки SQL-кода.

<Image
  size='lg'
  img={mitzu_08}
  alt='Анализ удержания Mitzu с показателями удержания когорт'
  border
/>

<br />

:::tip Удержание когорт
Выберите `Weekly cohort retention` для визуализации динамики изменения показателей удержания с течением времени.
:::


## 7. Выполнение запросов по путям пользователей {#7-run-journey-queries}

Выберите до 9 шагов для воронки. Укажите временной интервал, в течение которого пользователи могут завершить путь. График путей Mitzu предоставляет визуальное представление всех маршрутов, которые пользователи проходят через выбранные события.

<Image
  size='lg'
  img={mitzu_09}
  alt='Визуализация путей пользователей в Mitzu, показывающая поток переходов между событиями'
  border
/>
<br />

:::tip Детализация шагов
Вы можете выбрать свойство для параметра `Break down`, чтобы различать пользователей в рамках одного шага.
:::

<br />


## 8. Выполнение запросов по доходам {#8-run-revenue-queries}

При настроенных параметрах доходов Mitzu может рассчитать общий MRR и количество подписок на основе событий платежей.

<Image
  size='lg'
  img={mitzu_10}
  alt='Панель анализа доходов Mitzu с метриками MRR'
  border
/>


## 9. Нативный SQL {#9-sql-native}

Mitzu поддерживает нативный SQL, что означает генерацию нативного SQL-кода на основе выбранной конфигурации на странице Explore.

<Image
  size='lg'
  img={mitzu_11}
  alt='Представление генерации SQL-кода в Mitzu с нативным запросом ClickHouse'
  border
/>

<br />

:::tip Продолжите работу в BI-инструменте
Если вы столкнулись с ограничениями интерфейса Mitzu, скопируйте SQL-код и продолжите работу в BI-инструменте.
:::


## Поддержка Mitzu {#mitzu-support}

Если у вас возникли вопросы, свяжитесь с нами по адресу [support@mitzu.io](email://support@mitzu.io)

Или присоединяйтесь к нашему сообществу в Slack [здесь](https://join.slack.com/t/mitzu-io/shared_invite/zt-1h1ykr93a-_VtVu0XshfspFjOg6sczKg)


## Узнать больше {#learn-more}

Дополнительную информацию о Mitzu можно найти на сайте [mitzu.io](https://mitzu.io)

Документация доступна по адресу [docs.mitzu.io](https://docs.mitzu.io)
