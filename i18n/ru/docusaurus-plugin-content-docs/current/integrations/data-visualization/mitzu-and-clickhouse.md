---
slug: '/integrations/mitzu'
sidebar_label: Mitzu
description: 'Mitzu является приложением для аналитики продуктов, родственным складом'
title: 'Подключение Mitzu к ClickHouse'
keywords: ['clickhouse', 'Mitzu', 'connect', 'integrate', 'ui']
doc_type: guide
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


# Подключение Mitzu к ClickHouse

<CommunityMaintainedBadge/>

Mitzu — это приложение для аналитики продуктов без кода, нативное для хранилища данных. Подобно таким инструментам, как Amplitude, Mixpanel и PostHog, Mitzu позволяет пользователям анализировать данные о использовании продукта без необходимости в знании SQL или Python.

Однако в отличие от этих платформ, Mitzu не дублирует данные о использовании продукта компании. Вместо этого оно генерирует нативные SQL-запросы непосредственно на базе существующего хранилища данных или ДатаЛэйка компании.

## Цель {#goal}

В данном руководстве мы рассмотрим следующее:

- Нативная аналитика продуктов для хранилищ данных
- Как интегрировать Mitzu с ClickHouse

:::tip Примеры наборов данных
Если у вас нет набора данных для использования с Mitzu, вы можете поработать с данными такси Нью-Йорка (NYC Taxi Data).
Этот набор данных доступен в ClickHouse Cloud или [может быть загружен с помощью этих инструкций](/getting-started/example-datasets/nyc-taxi).
:::

Это руководство является кратким обзором того, как использовать Mitzu. Вы можете найти более подробную информацию в [документации Mitzu](https://docs.mitzu.io/).

## 1. Соберите данные для подключения {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. Войдите или зарегистрируйтесь в Mitzu {#2-sign-in-or-sign-up-to-mitzu}

На первом этапе перейдите на [https://app.mitzu.io](https://app.mitzu.io) для регистрации.

<Image size="lg" img={mitzu_01} alt="Страница входа в Mitzu с полями электронной почты и пароля" border />

## 3. Настройте свое рабочее пространство {#3-configure-your-workspace}

После создания организации следуйте руководству по настройке `Set up your workspace` в левом боковом меню. Затем нажмите на ссылку `Connect Mitzu with your data warehouse`.

<Image size="lg" img={mitzu_02} alt="Страница настройки рабочего пространства Mitzu с шагами по onboarding" border />

## 4. Подключите Mitzu к ClickHouse {#4-connect-mitzu-to-clickhouse}

Сначала выберите ClickHouse в качестве типа подключения и задайте данные подключения. Затем нажмите кнопку `Test connection & Save`, чтобы сохранить настройки.

<Image size="lg" img={mitzu_03} alt="Страница настройки подключения Mitzu для ClickHouse с формой конфигурации" border />

## 5. Настройте таблицы событий {#5-configure-event-tables}

После сохранения подключения выберите вкладку `Event tables` и нажмите кнопку `Add table`. В модальном окне выберите вашу базу данных и таблицы, которые вы хотите добавить в Mitzu.

Используйте флажки, чтобы выбрать как минимум одну таблицу, и нажмите кнопку `Configure table`. Это откроет модальное окно, в котором вы можете задать ключевые колонки для каждой таблицы.

<Image size="lg" img={mitzu_04} alt="Интерфейс выбора таблицы Mitzu с показом таблиц базы данных" border />
<br/>

> Для выполнения аналитики продуктов на вашей настройке ClickHouse вам необходимо > указать несколько ключевых колонок из вашей таблицы.
>
> Это следующие колонки:
>
> - **User id** - колонка для уникального идентификатора пользователей.
> - **Event time** - колонка с временными метками ваших событий.
> - Optional[**Event name**] - Эта колонка сегментирует события, если таблица содержит несколько типов событий.

<Image size="lg" img={mitzu_05} alt="Конфигурация каталога событий Mitzu с опциями сопоставления колонок" border />
<br/>
Как только все таблицы будут сконфигурированы, нажмите кнопку `Save & update event catalog`, и Mitzu найдет все события и их свойства из вышеуказанной таблицы. Этот шаг может занять несколько минут в зависимости от размера вашего набора данных.

## 4. Выполнение запросов сегментации {#4-run-segmentation-queries}

Сегментация пользователей в Mitzu так же проста, как в Amplitude, Mixpanel или PostHog.

Страница Explore имеет область выбора событий слева, в то время как верхняя часть позволяет настроить временной горизонт.

<Image size="lg" img={mitzu_06} alt="Интерфейс запроса сегментации Mitzu с выбором события и настройкой времени" border />

<br/>

:::tip Фильтры и разбивка
Фильтрация происходит так, как вы и ожидаете: выберите свойство (колонка ClickHouse) и выберите значения из выпадающего списка, которые хотите отфильтровать.
Вы можете выбрать любое свойство события или пользователя для разбивки (см. ниже, как интегрировать свойства пользователя).
:::

## 5. Выполнение запросов воронки {#5-run-funnel-queries}

Выберите до 9 шагов для воронки. Выберите временной интервал, в течение которого ваши пользователи могут завершить воронку.
Получите немедленные insights о конверсии без написания ни одной строки SQL-кода.

<Image size="lg" img={mitzu_07} alt="Представление анализа воронки Mitzu, показывающее коэффициенты конверсии между шагами" border />

<br/>

:::tip Визуализация трендов
Выберите `Funnel trends`, чтобы визуализировать тренды воронки с течением времени.
:::

## 6. Выполнение запросов удержания {#6-run-retention-queries}

Выберите до 2 шагов для расчета коэффициента удержания. Выберите окно удержания для повторяющегося окна, чтобы 
Получите немедленные insights о конверсии без написания ни одной строки SQL-кода.

<Image size="lg" img={mitzu_08} alt="Анализ удержания Mitzu, показывающий коэффициенты удержания когорты" border />

<br/>

:::tip Удержание по когорте
Выберите `Weekly cohort retention`, чтобы визуализировать, как ваши коэффициенты удержания меняются со временем.
:::

## 7. Выполнение запросов по пути пользователя {#7-run-journey-queries}
Выберите до 9 шагов для воронки. Выберите временной интервал, в течение которого ваши пользователи могут завершить путь. График пути Mitzu предоставляет визуальную карту каждого пути, который проходят пользователи через выбранные события.

<Image size="lg" img={mitzu_09} alt="Визуализация пути Mitzu, показывающая потоки пользователей между событиями" border />
<br/>

:::tip Разделение шагов
Вы можете выбрать свойство для сегмента `Break down`, чтобы различать пользователей внутри одного шага.
:::

<br/>

## 8. Выполнение запросов по доходу {#8-run-revenue-queries}
Если настройки дохода сконфигурированы, Mitzu может рассчитать общий MRR и количество подписок на основе ваших событий оплаты.

<Image size="lg" img={mitzu_10} alt="Панель анализа доходов Mitzu, показывающая метрики MRR" border />

## 9. SQL Native {#9-sql-native}

Mitzu — это SQL Native, что означает, что он генерирует нативный SQL-код на основе вашей выбранной конфигурации на странице Explore.

<Image size="lg" img={mitzu_11} alt="Представление генерации SQL-кода Mitzu, показывающее нативный запрос ClickHouse" border />

<br/>

:::tip Продолжите свою работу в BI инструменте
Если вы столкнетесь с ограничением в интерфейсе Mitzu, скопируйте SQL-код и продолжите свою работу в BI инструменте.
:::

## Поддержка Mitzu {#mitzu-support}

Если вы запутались, не стесняйтесь обращаться к нам по адресу [support@mitzu.io](email://support@mitzu.io)

Или присоединитесь к нашему Slack-сообществу [здесь](https://join.slack.com/t/mitzu-io/shared_invite/zt-1h1ykr93a-_VtVu0XshfspFjOg6sczKg)

## Узнайте больше {#learn-more}

Вы можете найти больше информации о Mitzu на [mitzu.io](https://mitzu.io)

Посетите нашу страницу документации на [docs.mitzu.io](https://docs.mitzu.io)