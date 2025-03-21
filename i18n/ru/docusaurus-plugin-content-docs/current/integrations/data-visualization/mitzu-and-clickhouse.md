---
sidebar_label: Mitzu
slug: /integrations/mitzu
keywords: ['clickhouse', 'Mitzu', 'connect', 'integrate', 'ui']
description: 'Mitzu is a no-code warehouse-native product analytics application.'
---

import ConnectionDetails from '@site/i18n/ru/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_http.mdx';
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


# Подключение Mitzu к ClickHouse

Mitzu - это продуктовая аналитическая платформа без кода, работающая в нативном хранилище данных. Подобно таким инструментам, как Amplitude, Mixpanel и PostHog, Mitzu позволяет пользователям анализировать данные об использовании продукта без необходимости в знаниях SQL или Python.

Однако, в отличие от этих платформ, Mitzu не дублирует данные о использовании продукта компании. Вместо этого он генерирует нативные SQL запросы непосредственно к существующему хранилищу данных или озеру компании.

## Цель {#goal}

В этом руководстве мы рассмотрим следующее:

- Продуктовая аналитика в нативном хранилище
- Как интегрировать Mitzu с ClickHouse

:::tip Пример наборов данных
Если у вас нет набора данных для использования в Mitzu, вы можете воспользоваться данными такси NYC.
Этот набор данных доступен в ClickHouse Cloud или [может быть загружен с помощью этих инструкций](/getting-started/example-datasets/nyc-taxi).
:::

Это руководство является всего лишь кратким обзором того, как использовать Mitzu. Вы можете найти более подробную информацию в [документации Mitzu](https://docs.mitzu.io/).

## 1. Соберите свои данные для подключения {#1-gather-your-connection-details}

<ConnectionDetails />

## 2. Войдите или зарегистрируйтесь в Mitzu {#2-sign-in-or-sign-up-to-mitzu}

На первом шаге перейдите на [https://app.mitzu.io](https://app.mitzu.io) для регистрации.

<img src={mitzu_01} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="Вход" />

## 3. Настройте свое рабочее пространство {#3-configure-your-workspace}

После создания организации следуйте руководству по `Настройке вашего рабочего пространства` в левой боковой панели. Затем нажмите на ссылку `Подключите Mitzu к своему хранилищу данных`.

<img src={mitzu_02} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="Создание рабочего пространства"></img>

## 4. Подключите Mitzu к ClickHouse {#4-connect-mitzu-to-clickhouse}

Сначала выберите ClickHouse в качестве типа подключения и задайте данные подключения. Затем нажмите кнопку `Проверить соединение и сохранить`, чтобы сохранить настройки.

<img src={mitzu_03} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="Настройка данных подключения"></img>

## 5. Настройте таблицы событий {#5-configure-event-tables}

После сохранения подключения выберите вкладку `Таблицы событий` и нажмите кнопку `Добавить таблицу`. В модальном окне выберите вашу базу данных и таблицы, которые вы хотите добавить в Mitzu.

Используйте флажки, чтобы выбрать хотя бы одну таблицу, и нажмите кнопку `Настроить таблицу`. Это откроет модальное окно, где вы можете задать ключевые колонки для каждой таблицы.

<img src={mitzu_04} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="Настройка подключения таблицы"></img>
<br/>

> Для проведения продуктовой аналитики на вашей настройке ClickHouse необходимо > указать несколько ключевых колонок из вашей таблицы.
>
> Это следующие:
>
> - **Идентификатор пользователя** - колонка для уникального идентификатора пользователей.
> - **Время события** - колонка с временными метками ваших событий.
> - Опционально [**Название события**] - Эта колонка сегментирует события, если таблица содержит несколько типов событий.

<img src={mitzu_05} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="Создание каталога событий"></img>
<br/>
После настройки всех таблиц нажмите кнопку `Сохранить и обновить каталог событий`, и Mitzu найдет все события и их свойства из вышеупомянутой таблицы. Этот шаг может занять несколько минут в зависимости от размера вашего набора данных.

## 6. Запустите запросы сегментации {#4-run-segmentation-queries}

Сегментация пользователей в Mitzu так же проста, как в Amplitude, Mixpanel или PostHog.

На странице Изучение есть область выбора событий с левой стороны, в то время как верхняя часть позволяет настраивать временной интервал.

<img src={mitzu_06} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="Сегментация"></img>

<br/>

:::tip Фильтры и Разделение
Фильтрация осуществляется так, как вы ожидаете: выберите свойство (колонка ClickHouse) и выберите значения из выпадающего списка, которые вы хотите отфильтровать.
Вы можете выбрать любое свойство события или пользователя для разделения (см. ниже, как интегрировать пользовательские свойства).
:::

## 7. Запустите запросы воронки {#5-run-funnel-queries}

Выберите до 9 шагов для воронки. Выберите временное окно, в течение которого ваши пользователи могут завершить воронку.
Получите немедленные сведения о коэффициенте конверсии, не написав ни строки SQL кода.

<img src={mitzu_07} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="Воронка"></img>

<br/>

:::tip Визуализируйте тренды
Выберите `Тренды воронки`, чтобы визуализировать тренды воронки с течением времени.
:::

## 8. Запустите запросы удержания {#6-run-retention-queries}

Выберите до 2 шагов для расчета коэффициента удержания. Выберите окно удержания для периодического окна, чтобы
Получить немедленные сведения о коэффициенте конверсии, не написав ни строки SQL кода.

<img src={mitzu_08} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="Удержание"></img>

<br/>

:::tip Удержание когорт
Выберите `Удержание по неделям`, чтобы визуализировать, как ваши коэффициенты удержания меняются со временем.
:::


## 9. Запустите запросы пути {#7-run-journey-queries}
Выберите до 9 шагов для воронки. Выберите временное окно, в течение которого ваши пользователи могут завершить путь. График маршрутов Mitzu дает вам визуальную карту каждого пути, по которому идут пользователи через выбранные события.

<img src={mitzu_09} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="Путь"></img>
<br/>

:::tip Разделите шаги
Вы можете выбрать свойство для сегмента `Разделить`, чтобы различать пользователей на одном и том же шаге.
:::

<br/>

## 10. Запустите запросы дохода {#8-run-revenue-queries}
Если настройки дохода настроены, Mitzu может рассчитывать общий MRR и количество подписок на основе ваших событий платежей.

<img src={mitzu_10} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="Доход"></img>

## 11. Нативный SQL {#9-sql-native}

Mitzu является SQL нативным, что означает, что он генерирует нативный SQL код на основе вашей выбранной конфигурации на странице Изучение.

<img src={mitzu_11} class="image" style={{width: '50%', 'background-color': 'transparent'}} alt="Нативный SQL"></img>

<br/>

:::tip Продолжайте свою работу в BI инструменте
Если вы столкнетесь с ограничением интерфейса Mitzu, скопируйте SQL код и продолжайте свою работу в BI инструменте.
:::

## Поддержка Mitzu {#mitzu-support}

Если вы потерялись, не стесняйтесь обращаться к нам по адресу [support@mitzu.io](email://support@mitzu.io)

Или присоединяйтесь к нашему сообществу Slack [здесь](https://join.slack.com/t/mitzu-io/shared_invite/zt-1h1ykr93a-_VtVu0XshfspFjOg6sczKg)

## Узнайте больше {#learn-more}

Найдите больше информации о Mitzu на [mitzu.io](https://mitzu.io)

Посетите нашу страницу документации на [docs.mitzu.io](https://docs.mitzu.io)
