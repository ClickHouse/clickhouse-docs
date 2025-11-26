---
sidebar_title: 'SQL консоль'
slug: /cloud/get-started/sql-console
description: 'Выполняйте запросы и создавайте визуализации с помощью SQL консоли.'
keywords: ['sql консоль', 'sql клиент', 'облачная консоль', 'консоль']
title: 'SQL консоль'
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import table_list_and_schema from '@site/static/images/cloud/sqlconsole/table-list-and-schema.png';
import view_columns from '@site/static/images/cloud/sqlconsole/view-columns.png';
import abc from '@site/static/images/cloud/sqlconsole/abc.png';
import inspecting_cell_content from '@site/static/images/cloud/sqlconsole/inspecting-cell-content.png';
import sort_descending_on_column from '@site/static/images/cloud/sqlconsole/sort-descending-on-column.png';
import filter_on_radio_column_equal_gsm from '@site/static/images/cloud/sqlconsole/filter-on-radio-column-equal-gsm.png';
import add_more_filters from '@site/static/images/cloud/sqlconsole/add-more-filters.png';
import filtering_and_sorting_together from '@site/static/images/cloud/sqlconsole/filtering-and-sorting-together.png';
import create_a_query_from_sorts_and_filters from '@site/static/images/cloud/sqlconsole/create-a-query-from-sorts-and-filters.png';
import creating_a_query from '@site/static/images/cloud/sqlconsole/creating-a-query.png';
import run_selected_query from '@site/static/images/cloud/sqlconsole/run-selected-query.png';
import run_at_cursor_2 from '@site/static/images/cloud/sqlconsole/run-at-cursor-2.png';
import run_at_cursor from '@site/static/images/cloud/sqlconsole/run-at-cursor.png';
import cancel_a_query from '@site/static/images/cloud/sqlconsole/cancel-a-query.png';
import sql_console_save_query from '@site/static/images/cloud/sqlconsole/sql-console-save-query.png';
import sql_console_rename from '@site/static/images/cloud/sqlconsole/sql-console-rename.png';
import sql_console_share from '@site/static/images/cloud/sqlconsole/sql-console-share.png';
import sql_console_edit_access from '@site/static/images/cloud/sqlconsole/sql-console-edit-access.png';
import sql_console_add_team from '@site/static/images/cloud/sqlconsole/sql-console-add-team.png';
import sql_console_edit_member from '@site/static/images/cloud/sqlconsole/sql-console-edit-member.png';
import sql_console_access_queries from '@site/static/images/cloud/sqlconsole/sql-console-access-queries.png';
import search_hn from '@site/static/images/cloud/sqlconsole/search-hn.png';
import match_in_body from '@site/static/images/cloud/sqlconsole/match-in-body.png';
import pagination from '@site/static/images/cloud/sqlconsole/pagination.png';
import pagination_nav from '@site/static/images/cloud/sqlconsole/pagination-nav.png';
import download_as_csv from '@site/static/images/cloud/sqlconsole/download-as-csv.png';
import tabular_query_results from '@site/static/images/cloud/sqlconsole/tabular-query-results.png';
import switch_from_query_to_chart from '@site/static/images/cloud/sqlconsole/switch-from-query-to-chart.png';
import trip_total_by_week from '@site/static/images/cloud/sqlconsole/trip-total-by-week.png';
import bar_chart from '@site/static/images/cloud/sqlconsole/bar-chart.png';
import change_from_bar_to_area from '@site/static/images/cloud/sqlconsole/change-from-bar-to-area.png';
import update_query_name from '@site/static/images/cloud/sqlconsole/update-query-name.png';
import update_subtitle_etc from '@site/static/images/cloud/sqlconsole/update-subtitle-etc.png';
import adjust_axis_scale from '@site/static/images/cloud/sqlconsole/adjust-axis-scale.png';

# SQL консоль

SQL консоль — это самый быстрый и простой способ изучения и запроса ваших баз данных в ClickHouse Cloud. Вы можете использовать SQL консоль для:

- Подключения к вашим сервисам ClickHouse Cloud
- Просмотра, фильтрации и сортировки табличных данных
- Выполнения запросов и визуализации результатов всего в несколько кликов
- Совместного использования запросов с членами команды и более эффективной совместной работы.

### Изучение таблиц {#exploring-tables}

### Просмотр списка таблиц и информации о схеме {#viewing-table-list-and-schema-info}

Обзор таблиц, содержащихся в вашем экземпляре ClickHouse, можно найти в левой боковой панели. Используйте селектор базы данных в верхней части левой панели для просмотра таблиц в конкретной базе данных.

<Image img={table_list_and_schema} size="md" alt='список таблиц и схема' />
Таблицы в списке также можно развернуть для просмотра столбцов и типов данных.

<Image img={view_columns} size="md" alt='просмотр столбцов' />

### Изучение табличных данных {#exploring-table-data}

Нажмите на таблицу в списке, чтобы открыть её в новой вкладке. В представлении таблицы данные можно легко просматривать, выбирать и копировать. Обратите внимание, что структура и форматирование сохраняются при копировании и вставке в приложения для работы с электронными таблицами, такие как Microsoft Excel и Google Sheets. Вы можете переключаться между страницами табличных данных (разбитых на страницы по 30 строк) с помощью навигации в нижнем колонтитуле.

<Image img={abc} size="md" alt='abc' />

### Проверка данных ячейки {#inspecting-cell-data}

Инструмент проверки ячейки можно использовать для просмотра больших объёмов данных, содержащихся в одной ячейке. Чтобы открыть его, щёлкните правой кнопкой мыши на ячейке и выберите 'Inspect Cell' (Проверить ячейку). Содержимое инспектора ячеек можно скопировать, нажав значок копирования в правом верхнем углу содержимого инспектора.

<Image img={inspecting_cell_content} size="md" alt='проверка содержимого ячейки' />

## Фильтрация и сортировка таблиц {#filtering-and-sorting-tables}

### Сортировка таблицы {#sorting-a-table}

Чтобы отсортировать таблицу в SQL консоли, откройте таблицу и нажмите кнопку 'Sort' (Сортировка) на панели инструментов. Эта кнопка откроет меню, которое позволит вам настроить сортировку. Вы можете выбрать столбец, по которому хотите отсортировать данные, и настроить порядок сортировки (по возрастанию или по убыванию). Выберите 'Apply' (Применить) или нажмите Enter для сортировки таблицы.

<Image img={sort_descending_on_column} size="md" alt='сортировка по убыванию по столбцу' />

SQL консоль также позволяет добавлять несколько сортировок к таблице. Нажмите кнопку 'Sort' (Сортировка) снова, чтобы добавить ещё одну сортировку.

:::note
Сортировки применяются в порядке их появления на панели сортировки (сверху вниз). Чтобы удалить сортировку, просто нажмите кнопку 'x' рядом с сортировкой.
:::

### Фильтрация таблицы {#filtering-a-table}

Чтобы отфильтровать таблицу в SQL консоли, откройте таблицу и нажмите кнопку 'Filter' (Фильтр). Так же, как и при сортировке, эта кнопка откроет меню, которое позволит вам настроить фильтр. Вы можете выбрать столбец для фильтрации и выбрать необходимые критерии. SQL консоль интеллектуально отображает параметры фильтра, которые соответствуют типу данных, содержащихся в столбце.

<Image img={filter_on_radio_column_equal_gsm} size="md" alt='фильтр по столбцу radio равному GSM' />

Когда вы довольны своим фильтром, вы можете выбрать 'Apply' (Применить), чтобы отфильтровать данные. Вы также можете добавить дополнительные фильтры, как показано ниже.

<Image img={add_more_filters} size="md" alt='Добавление фильтра по range больше 2000' />

Подобно функции сортировки, нажмите кнопку 'x' рядом с фильтром, чтобы удалить его.

### Фильтрация и сортировка вместе {#filtering-and-sorting-together}

SQL консоль позволяет фильтровать и сортировать таблицу одновременно. Для этого добавьте все необходимые фильтры и сортировки, используя шаги, описанные выше, и нажмите кнопку 'Apply' (Применить).

<Image img={filtering_and_sorting_together} size="md" alt='Добавление фильтра по range больше 2000' />

### Создание запроса из фильтров и сортировок {#creating-a-query-from-filters-and-sorts}

SQL консоль может преобразовать ваши сортировки и фильтры непосредственно в запросы одним кликом. Просто выберите кнопку 'Create Query' (Создать запрос) на панели инструментов с выбранными параметрами сортировки и фильтра. После нажатия 'Create query' (Создать запрос) откроется новая вкладка запроса, предварительно заполненная SQL-командой, соответствующей данным, содержащимся в вашем представлении таблицы.

<Image img={create_a_query_from_sorts_and_filters} size="md" alt='Создание запроса из сортировок и фильтров' />

:::note
Фильтры и сортировки не являются обязательными при использовании функции 'Create Query' (Создать запрос).
:::

Вы можете узнать больше о запросах в SQL консоли, прочитав документацию по запросам (ссылка).

## Создание и выполнение запроса {#creating-and-running-a-query}

### Создание запроса {#creating-a-query}

Существует два способа создать новый запрос в SQL консоли.

- Нажмите кнопку '+' на панели вкладок
- Выберите кнопку 'New Query' (Новый запрос) в списке запросов левой боковой панели

<Image img={creating_a_query} size="md" alt='Создание запроса' />

### Выполнение запроса {#running-a-query}

Чтобы выполнить запрос, введите SQL-команду(ы) в SQL-редактор и нажмите кнопку 'Run' (Выполнить) или используйте сочетание клавиш `cmd / ctrl + enter`. Чтобы написать и последовательно выполнить несколько команд, убедитесь, что после каждой команды добавлена точка с запятой.

Параметры выполнения запроса
По умолчанию нажатие кнопки выполнения запустит все команды, содержащиеся в SQL-редакторе. SQL консоль поддерживает два других варианта выполнения запроса:

- Выполнение выбранной(ых) команды(команд)
- Выполнение команды в позиции курсора

Чтобы выполнить выбранную(ые) команду(ы), выделите нужную команду или последовательность команд и нажмите кнопку 'Run' (Выполнить) (или используйте сочетание клавиш `cmd / ctrl + enter`). Вы также можете выбрать 'Run selected' (Выполнить выбранное) из контекстного меню SQL-редактора (открывается щелчком правой кнопкой мыши в любом месте редактора), когда присутствует выделение.

<Image img={run_selected_query} size="md" alt='выполнение выбранного запроса' />

Выполнение команды в текущей позиции курсора можно осуществить двумя способами:

- Выберите 'At Cursor' (В позиции курсора) из расширенного меню параметров выполнения (или используйте соответствующее сочетание клавиш `cmd / ctrl + shift + enter`)

<Image img={run_at_cursor_2} size="md" alt='выполнение в позиции курсора' />

- Выбор 'Run at cursor' (Выполнить в позиции курсора) из контекстного меню SQL-редактора

<Image img={run_at_cursor} size="md" alt='выполнение в позиции курсора' />

:::note
Команда, присутствующая в позиции курсора, будет мигать жёлтым цветом при выполнении.
:::

### Отмена запроса {#canceling-a-query}

Во время выполнения запроса кнопка 'Run' (Выполнить) на панели инструментов редактора запросов будет заменена на кнопку 'Cancel' (Отменить). Просто нажмите эту кнопку или нажмите `Esc`, чтобы отменить запрос. Примечание: Любые результаты, которые уже были возвращены, сохранятся после отмены.

<Image img={cancel_a_query} size="md" alt='Отмена запроса' />

### Сохранение запроса {#saving-a-query}

Сохранение запросов позволяет легко найти их позже и поделиться ими с вашими товарищами по команде. SQL консоль также позволяет организовывать запросы в папки.

Чтобы сохранить запрос, просто нажмите кнопку "Save" (Сохранить) сразу рядом с кнопкой "Run" (Выполнить) на панели инструментов. Введите желаемое имя и нажмите "Save Query" (Сохранить запрос).

:::note
Использование сочетания клавиш `cmd / ctrl` + s также сохранит любую работу на текущей вкладке запроса.
:::

<Image img={sql_console_save_query} size="md" alt='Сохранение запроса' />

В качестве альтернативы вы можете одновременно назвать и сохранить запрос, нажав на "Untitled Query" (Безымянный запрос) на панели инструментов, изменив имя и нажав Enter:

<Image img={sql_console_rename} size="md" alt='Переименование запроса' />

### Совместное использование запросов {#query-sharing}

SQL консоль позволяет легко делиться запросами с членами вашей команды. SQL консоль поддерживает четыре уровня доступа, которые можно настроить как глобально, так и для каждого пользователя отдельно:

- Владелец (может настраивать параметры совместного использования)
- Доступ на запись
- Доступ только для чтения
- Нет доступа

После сохранения запроса нажмите кнопку "Share" (Поделиться) на панели инструментов. Появится модальное окно с параметрами совместного использования:

<Image img={sql_console_share} size="md" alt='Совместное использование запроса' />

Чтобы настроить доступ к запросу для всех членов организации с доступом к сервису, просто настройте селектор уровня доступа в верхней строке:

<Image img={sql_console_edit_access} size="md" alt='Редактирование доступа' />

После применения вышеуказанного запрос теперь может быть просмотрен (и выполнен) всеми членами команды с доступом к SQL консоли для сервиса.

Чтобы настроить доступ к запросу для конкретных членов, выберите нужного члена команды из селектора "Add a team member" (Добавить члена команды):

<Image img={sql_console_add_team} size="md" alt='Добавление члена команды' />

После выбора члена команды должна появиться новая строка с селектором уровня доступа:

<Image img={sql_console_edit_member} size="md" alt='Редактирование доступа члена команды' />

### Доступ к общим запросам {#accessing-shared-queries}

Если запрос был предоставлен вам для совместного использования, он будет отображаться на вкладке "Queries" (Запросы) левой боковой панели SQL консоли:

<Image img={sql_console_access_queries} size="md" alt='Доступ к запросам' />

### Ссылка на запрос (постоянные ссылки) {#linking-to-a-query-permalinks}

Сохранённые запросы также имеют постоянные ссылки, что означает, что вы можете отправлять и получать ссылки на общие запросы и открывать их напрямую.

Значения для любых параметров, которые могут существовать в запросе, автоматически добавляются к URL-адресу сохранённого запроса в качестве параметров запроса. Например, если запрос содержит параметры `{start_date: Date}` и `{end_date: Date}`, постоянная ссылка может выглядеть так: `https://console.clickhouse.cloud/services/:serviceId/console/query/:queryId?param_start_date=2015-01-01&param_end_date=2016-01-01`.

## Расширенные функции запросов {#advanced-querying-features}

### Поиск результатов запроса {#searching-query-results}

После выполнения запроса вы можете быстро выполнить поиск по возвращённому набору результатов, используя поле поиска на панели результатов. Эта функция помогает предварительно просмотреть результаты дополнительного предложения `WHERE` или просто убедиться, что конкретные данные включены в набор результатов. После ввода значения в поле поиска панель результатов обновится и вернёт записи, содержащие запись, которая соответствует введённому значению. В этом примере мы будем искать все вхождения `breakfast` в таблице `hackernews` для комментариев, содержащих `ClickHouse` (без учёта регистра):

<Image img={search_hn} size="md" alt='Поиск данных Hacker News' />

Примечание: Будет возвращено любое поле, соответствующее введённому значению. Например, третья запись на скриншоте выше не соответствует 'breakfast' в поле `by`, но поле `text` соответствует:

<Image img={match_in_body} size="md" alt='Совпадение в теле' />

### Настройка параметров пагинации {#adjusting-pagination-settings}

По умолчанию панель результатов запроса будет отображать каждую запись результата на одной странице. Для больших наборов результатов может быть предпочтительнее разбить результаты на страницы для более лёгкого просмотра. Это можно сделать с помощью селектора пагинации в правом нижнем углу панели результатов:

<Image img={pagination} size="md" alt='Параметры пагинации' />

Выбор размера страницы немедленно применит пагинацию к набору результатов, и опции навигации появятся в середине нижнего колонтитула панели результатов.

<Image img={pagination_nav} size="md" alt='Навигация по страницам' />

### Экспорт данных результатов запроса {#exporting-query-result-data}

Наборы результатов запросов можно легко экспортировать в формат CSV непосредственно из SQL консоли. Для этого откройте меню `•••` в правой части панели инструментов панели результатов и выберите 'Download as CSV' (Скачать как CSV).

<Image img={download_as_csv} size="md" alt='Скачать как CSV' />

## Визуализация данных запроса {#visualizing-query-data}

Некоторые данные легче интерпретировать в виде диаграммы. Вы можете быстро создать визуализации из данных результатов запроса непосредственно из SQL консоли всего в несколько кликов. В качестве примера мы будем использовать запрос, который рассчитывает еженедельную статистику для поездок такси в Нью-Йорке:

```sql
SELECT
   toStartOfWeek(pickup_datetime) AS week,
   sum(total_amount) AS fare_total,
   sum(trip_distance) AS distance_total,
   count(*) AS trip_total
FROM
   nyc_taxi
GROUP BY
   1
ORDER BY
   1 ASC
```

<Image img={tabular_query_results} size="md" alt='Табличные результаты запроса' />

Без визуализации эти результаты сложно интерпретировать. Давайте превратим их в диаграмму.

### Создание диаграмм {#creating-charts}

Чтобы начать создание визуализации, выберите опцию 'Chart' (Диаграмма) на панели инструментов панели результатов запроса. Появится панель настройки диаграммы:

<Image img={switch_from_query_to_chart} size="md" alt='Переключение от запроса к диаграмме' />

Мы начнём с создания простой столбчатой диаграммы, отслеживающей `trip_total` по `week` (неделям). Для этого мы перетащим поле `week` на ось x, а поле `trip_total` на ось y:

<Image img={trip_total_by_week} size="md" alt='Общее количество поездок по неделям' />

Большинство типов диаграмм поддерживают несколько полей на числовых осях. Для демонстрации мы перетащим поле fare_total на ось y:

<Image img={bar_chart} size="md" alt='Столбчатая диаграмма' />

### Настройка диаграмм {#customizing-charts}

SQL консоль поддерживает десять типов диаграмм, которые можно выбрать из селектора типа диаграммы на панели настройки диаграммы. Например, мы можем легко изменить предыдущий тип диаграммы с Bar (Столбчатая) на Area (Область):

<Image img={change_from_bar_to_area} size="md" alt='Изменение со столбчатой диаграммы на диаграмму с областями' />

Заголовки диаграмм соответствуют имени запроса, предоставляющего данные. Обновление имени запроса приведёт к обновлению заголовка диаграммы:

<Image img={update_query_name} size="md" alt='Обновление имени запроса' />

Ряд более продвинутых характеристик диаграммы также можно настроить в разделе 'Advanced' (Расширенные) панели настройки диаграммы. Для начала мы настроим следующие параметры:

- Подзаголовок
- Заголовки осей
- Ориентация меток для оси x

Наша диаграмма будет обновлена соответствующим образом:

<Image img={update_subtitle_etc} size="md" alt='Обновление подзаголовка и т.д.' />

В некоторых сценариях может потребоваться независимая настройка масштабов осей для каждого поля. Это также можно сделать в разделе 'Advanced' (Расширенные) панели настройки диаграммы, указав минимальные и максимальные значения для диапазона осей. В качестве примера, приведённая выше диаграмма выглядит хорошо, но для демонстрации корреляции между нашими полями `trip_total` и `fare_total` диапазоны осей нуждаются в некоторой корректировке:

<Image img={adjust_axis_scale} size="md" alt='Настройка масштаба оси' />