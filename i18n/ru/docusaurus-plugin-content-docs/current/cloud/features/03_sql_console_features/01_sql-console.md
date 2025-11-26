---
sidebar_title: 'SQL-консоль'
slug: /cloud/get-started/sql-console
description: 'Выполняйте запросы и создавайте визуализации в SQL-консоли.'
keywords: ['sql-консоль', 'sql-клиент', 'облачная консоль', 'консоль']
title: 'SQL-консоль'
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


# SQL Console

SQL-консоль — это самый быстрый и простой способ исследовать и выполнять запросы к вашим базам данных в ClickHouse Cloud. Вы можете использовать SQL-консоль, чтобы:

- Подключаться к вашим ClickHouse Cloud Services
- Просматривать, фильтровать и сортировать данные таблиц
- Выполнять запросы и визуализировать результаты всего в несколько кликов
- Делиться запросами с членами команды и эффективнее сотрудничать.

### Исследование таблиц {#exploring-tables}

### Просмотр списка таблиц и информации о схеме {#viewing-table-list-and-schema-info}

Обзор таблиц, содержащихся в вашем экземпляре ClickHouse, можно найти в левой боковой панели. Используйте селектор базы данных в верхней части левой панели, чтобы просмотреть таблицы в определённой базе данных.

<Image img={table_list_and_schema} size="md" alt='список таблиц и схема' />
Таблицы в списке можно развернуть, чтобы просмотреть столбцы и их типы.

<Image img={view_columns} size="md" alt='просмотр столбцов' />

### Исследование данных таблицы {#exploring-table-data}

Щёлкните по таблице в списке, чтобы открыть её в новой вкладке. В Table View данные можно легко просматривать, выделять и копировать. Обратите внимание, что структура и форматирование сохраняются при копировании и вставке в табличные приложения, такие как Microsoft Excel и Google Sheets. Вы можете переключаться между страницами данных таблицы (страницы по 30 строк) с помощью навигации в нижней панели.

<Image img={abc} size="md" alt='abc' />

### Просмотр данных ячейки {#inspecting-cell-data}

Инструмент Cell Inspector можно использовать для просмотра больших объёмов данных, содержащихся в одной ячейке. Чтобы открыть его, щёлкните правой кнопкой мыши по ячейке и выберите «Inspect Cell». Содержимое инспектора ячейки можно скопировать, нажав на значок копирования в правом верхнем углу области содержимого инспектора.

<Image img={inspecting_cell_content} size="md" alt='просмотр содержимого ячейки' />



## Фильтрация и сортировка таблиц {#filtering-and-sorting-tables}

### Сортировка таблицы {#sorting-a-table}

Чтобы отсортировать таблицу в SQL‑консоли, откройте таблицу и нажмите кнопку 'Sort' на панели инструментов. Откроется меню, в котором вы сможете настроить параметры сортировки. Вы можете выбрать столбец, по которому хотите сортировать, и указать порядок сортировки (по возрастанию или по убыванию). Нажмите 'Apply' или клавишу Enter, чтобы отсортировать таблицу.

<Image img={sort_descending_on_column} size="md" alt='сортировка по убыванию по столбцу' />

SQL‑консоль также позволяет добавлять несколько сортировок для одной таблицы. Нажмите кнопку 'Sort' еще раз, чтобы добавить дополнительную сортировку. 

:::note
Сортировки применяются в том порядке, в котором они отображаются в панели сортировки (сверху вниз). Чтобы удалить сортировку, нажмите кнопку 'x' рядом с соответствующей сортировкой.
:::

### Фильтрация таблицы {#filtering-a-table}

Чтобы отфильтровать таблицу в SQL‑консоли, откройте таблицу и нажмите кнопку 'Filter'. Аналогично сортировке, откроется меню, в котором вы сможете настроить параметры фильтрации. Вы можете выбрать столбец для фильтрации и задать необходимые критерии. SQL‑консоль автоматически отображает доступные варианты фильтрации, соответствующие типу данных в выбранном столбце.

<Image img={filter_on_radio_column_equal_gsm} size="md" alt='фильтр по столбцу radio со значением, равным GSM' />

Когда вы будете довольны настройками фильтра, нажмите 'Apply', чтобы отфильтровать данные. Вы также можете добавить дополнительные фильтры, как показано ниже.

<Image img={add_more_filters} size="md" alt='Добавить фильтр по диапазону значений больше 2000' />

Как и в случае с сортировкой, нажмите кнопку 'x' рядом с фильтром, чтобы удалить его.

### Совместное использование фильтрации и сортировки {#filtering-and-sorting-together}

SQL‑консоль позволяет одновременно фильтровать и сортировать таблицу. Для этого добавьте все необходимые фильтры и сортировки, используя шаги, описанные выше, и нажмите кнопку 'Apply'.

<Image img={filtering_and_sorting_together} size="md" alt='Добавить фильтр по диапазону значений больше 2000' />

### Создание запроса из фильтров и сортировок {#creating-a-query-from-filters-and-sorts}

SQL‑консоль может преобразовать ваши сортировки и фильтры непосредственно в запрос одним кликом. Просто нажмите кнопку 'Create Query' на панели инструментов с выбранными параметрами сортировки и фильтрации. После нажатия 'Create query' откроется новая вкладка с запросом, заранее заполненная SQL‑командой, соответствующей данным, отображаемым в текущем представлении таблицы.

<Image img={create_a_query_from_sorts-and-filters} size="md" alt='Создать запрос из сортировок и фильтров' />

:::note
При использовании функции 'Create Query' фильтры и сортировки не являются обязательными.
:::

Дополнительную информацию о работе с запросами в SQL‑консоли вы можете найти в (link) документации по запросам.



## Создание и выполнение запроса {#creating-and-running-a-query}

### Создание запроса {#creating-a-query}

Создать новый запрос в SQL-консоли можно двумя способами.

- Нажмите кнопку '+' на панели вкладок.
- Нажмите кнопку 'New Query' в списке запросов на левой боковой панели.

<Image img={creating_a_query} size="md" alt='Создание запроса' />

### Выполнение запроса {#running-a-query}

Чтобы выполнить запрос, введите SQL-команду или несколько команд в SQL-редактор и нажмите кнопку 'Run' или используйте сочетание клавиш `cmd / ctrl + enter`. Чтобы записать и выполнить несколько команд последовательно, обязательно добавляйте точку с запятой после каждой команды.

Параметры выполнения запроса  
По умолчанию нажатие кнопки выполнения запускает все команды, содержащиеся в SQL-редакторе. SQL-консоль также поддерживает два других варианта выполнения запросов:

- Выполнить выделенные команды
- Выполнить команду в позиции курсора

Чтобы выполнить выделенные команды, выделите нужную команду или последовательность команд и нажмите кнопку 'Run' (или используйте сочетание клавиш `cmd / ctrl + enter`). Вы также можете выбрать 'Run selected' в контекстном меню SQL-редактора (открывается по щелчку правой кнопкой мыши в любом месте редактора), когда есть выделение.

<Image img={run_selected_query} size="md" alt='выполнение выделенного запроса' />

Выполнить команду в текущей позиции курсора можно двумя способами:

- Выберите 'At Cursor' в расширенном меню параметров выполнения (или используйте соответствующее сочетание клавиш `cmd / ctrl + shift + enter`).

<Image img={run_at_cursor_2} size="md" alt='выполнение в позиции курсора' />

- Выберите 'Run at cursor' в контекстном меню SQL-редактора.

<Image img={run_at_cursor} size="md" alt='выполнение в позиции курсора' />

:::note
Команда в позиции курсора при выполнении кратковременно подсветится жёлтым цветом.
:::

### Отмена выполнения запроса {#canceling-a-query}

Во время выполнения запроса кнопка 'Run' на панели инструментов редактора запросов будет заменена кнопкой 'Cancel'. Нажмите эту кнопку или клавишу `Esc`, чтобы отменить запрос. Примечание: любые результаты, которые уже были возвращены, сохранятся после отмены.

<Image img={cancel_a_query} size="md" alt='Отмена выполнения запроса' />

### Сохранение запроса {#saving-a-query}

Сохранение запросов позволяет легко находить их позже и делиться ими с вашей командой. SQL-консоль также позволяет организовывать запросы по папкам.

Чтобы сохранить запрос, нажмите кнопку "Save", расположенную сразу рядом с кнопкой "Run" на панели инструментов. Введите нужное имя и нажмите "Save Query".

:::note
Сочетание клавиш `cmd / ctrl` + s также сохраняет все изменения в текущей вкладке запроса.
:::

<Image img={sql_console_save_query} size="md" alt='Сохранение запроса' />

Также вы можете одновременно задать имя и сохранить запрос, щёлкнув по "Untitled Query" на панели инструментов, изменив имя и нажав Enter:

<Image img={sql_console_rename} size="md" alt='Переименование запроса' />

### Совместное использование запросов {#query-sharing}

SQL-консоль позволяет легко делиться запросами с участниками вашей команды. SQL-консоль поддерживает четыре уровня доступа, которые можно настраивать как глобально, так и для отдельных пользователей:

- Владелец (может изменять параметры общего доступа)
- Доступ на запись
- Доступ только для чтения
- Нет доступа

После сохранения запроса нажмите кнопку "Share" на панели инструментов. Появится модальное окно с параметрами общего доступа:

<Image img={sql_console_share} size="md" alt='Совместное использование запроса' />

Чтобы настроить доступ к запросу для всех участников организации, имеющих доступ к сервису, измените переключатель уровня доступа в верхней строке:

<Image img={sql_console_edit_access} size="md" alt='Изменение доступа' />

После применения указанных настроек запрос становится доступен для просмотра (и выполнения) всем участникам команды, имеющим доступ к SQL-консоли для этого сервиса.

Чтобы настроить доступ к запросу для отдельных участников, выберите нужного участника команды в поле "Add a team member":

<Image img={sql_console_add_team} size="md" alt='Добавление участника команды' />

После выбора участника появится новая строка с переключателем уровня доступа:

<Image img={sql_console_edit_member} size="md" alt='Изменение доступа участника команды' />

### Доступ к общим запросам {#accessing-shared-queries}

Если запрос был предоставлен вам в общий доступ, он будет отображаться на вкладке "Queries" в левой боковой панели SQL-консоли:

<Image img={sql_console_access_queries} size="md" alt='Доступ к запросам' />

### Ссылка на запрос (постоянные ссылки) {#linking-to-a-query-permalinks}



Сохранённые запросы также получают постоянные ссылки (permalink), что позволяет вам отправлять и получать ссылки на общие запросы и открывать их напрямую.

Значения любых параметров, которые могут присутствовать в запросе, автоматически добавляются к URL сохранённого запроса в виде параметров строки запроса. Например, если запрос содержит параметры `{start_date: Date}` и `{end_date: Date}`, постоянная ссылка может выглядеть так: `https://console.clickhouse.cloud/services/:serviceId/console/query/:queryId?param_start_date=2015-01-01&param_end_date=2016-01-01`.



## Расширенные возможности запросов {#advanced-querying-features}

### Поиск по результатам запроса {#searching-query-results}

После выполнения запроса вы можете быстро найти нужные данные в возвращённом наборе результатов, используя поле поиска в панели результатов. Эта функция помогает предварительно просматривать результаты дополнительного оператора `WHERE` или просто проверять, что определённые данные включены в набор результатов. После ввода значения в поле поиска панель результатов обновится и вернёт записи, содержащие вхождение, соответствующее введённому значению. В этом примере мы найдём все вхождения `breakfast` в таблице `hackernews` для комментариев, которые содержат `ClickHouse` (без учёта регистра):

<Image img={search_hn} size="md" alt="Search Hacker News Data" />

Примечание: Будет возвращена любая запись, в которой какое-либо поле соответствует введённому значению. Например, третья запись на скриншоте выше не содержит `breakfast` в поле `by`, но поле `text` содержит его:

<Image img={match_in_body} size="md" alt="Match in body" />

### Настройка параметров разбиения на страницы {#adjusting-pagination-settings}

По умолчанию панель результатов запроса отображает все записи на одной странице. Для больших наборов результатов может быть удобнее разбивать результаты на страницы. Это можно сделать с помощью переключателя разбиения на страницы в правом нижнем углу панели результатов:

<Image img={pagination} size="md" alt="Pagination options" />

При выборе размера страницы разбиение на страницы сразу применяется к набору результатов, и в середине нижнего колонтитула панели результатов появляются элементы навигации.

<Image img={pagination_nav} size="md" alt="Pagination navigation" />

### Экспорт данных результатов запроса {#exporting-query-result-data}

Наборы результатов запроса можно легко экспортировать в формат CSV прямо из SQL-консоли. Для этого откройте меню `•••` в правой части панели инструментов области результатов и выберите пункт `Download as CSV`.

<Image img={download_as_csv} size="md" alt="Download as CSV" />



## Визуализация данных запросов

Некоторые данные проще воспринимать в виде диаграмм. Вы можете быстро создавать визуализации из результатов запросов непосредственно в SQL-консоли всего за несколько кликов. В качестве примера мы используем запрос, который вычисляет еженедельную статистику поездок на такси в Нью‑Йорке:

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

<Image img={tabular_query_results} size="md" alt="Табличные результаты запроса" />

Без визуализации эти результаты трудно интерпретировать. Превратим их в диаграмму.

### Создание диаграмм

Чтобы начать построение визуализации, выберите опцию «Chart» на панели инструментов области результатов запроса. Появится панель настройки диаграммы:

<Image img={switch_from_query_to_chart} size="md" alt="Переключение от запроса к диаграмме" />

Начнем с создания простой столбчатой диаграммы, отображающей `trip_total` по `week`. Для этого перетащим поле `week` на ось x, а поле `trip_total` — на ось y:

<Image img={trip_total_by_week} size="md" alt="Сумма поездок по неделям" />

Большинство типов диаграмм поддерживают несколько полей на числовых осях. Для демонстрации перетащим поле `fare_total` на ось y:

<Image img={bar_chart} size="md" alt="Столбчатая диаграмма" />

### Настройка диаграмм

SQL-консоль поддерживает десять типов диаграмм, которые можно выбрать в селекторе типа диаграммы на панели настройки диаграммы. Например, мы можем легко изменить предыдущий тип диаграммы с Bar на Area:

<Image img={change_from_bar_to_area} size="md" alt="Изменение типа диаграммы с Bar на Area" />

Заголовки диаграмм совпадают с именем запроса, который предоставляет данные. Обновление имени запроса приведет к обновлению заголовка диаграммы:

<Image img={update_query_name} size="md" alt="Обновление имени запроса" />

Несколько более продвинутых параметров диаграммы также можно настроить в разделе «Advanced» панели настройки диаграммы. Для начала изменим следующие параметры:

* Подзаголовок
* Заголовки осей
* Ориентация подписей для оси x

Наша диаграмма будет обновлена соответствующим образом:

<Image img={update_subtitle_etc} size="md" alt="Обновление подзаголовка и других параметров" />

В некоторых случаях может потребоваться настроить масштабы осей для каждого поля независимо. Это также можно сделать в разделе «Advanced» панели настройки диаграммы, указав минимальные и максимальные значения диапазона оси. В качестве примера, приведенная выше диаграмма выглядит хорошо, но чтобы продемонстрировать корреляцию между полями `trip_total` и `fare_total`, диапазоны осей нуждаются в некоторой корректировке:

<Image img={adjust_axis_scale} size="md" alt="Настройка масштаба осей" />
