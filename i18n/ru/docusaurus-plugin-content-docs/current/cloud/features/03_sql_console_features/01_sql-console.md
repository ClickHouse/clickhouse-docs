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


# SQL-консоль

SQL-консоль — это самый быстрый и простой способ исследовать базы данных и выполнять запросы в ClickHouse Cloud. SQL-консоль позволяет:

- Подключаться к сервисам ClickHouse Cloud
- Просматривать, фильтровать и сортировать данные таблиц
- Выполнять запросы и визуализировать результаты всего за несколько кликов
- Делиться запросами с коллегами и эффективнее работать в команде.

### Работа с таблицами {#exploring-tables}

### Просмотр списка таблиц и информации о схеме {#viewing-table-list-and-schema-info}

Обзор таблиц в вашем экземпляре ClickHouse доступен на левой боковой панели. Используйте селектор базы данных в верхней части левой панели для просмотра таблиц конкретной базы данных

<Image img={table_list_and_schema} size='md' alt='table list and schema' />
Таблицы в списке можно разворачивать для просмотра столбцов и их типов

<Image img={view_columns} size='md' alt='view columns' />

### Просмотр данных таблицы {#exploring-table-data}

Нажмите на таблицу в списке, чтобы открыть её в новой вкладке. В режиме просмотра таблицы данные можно легко просматривать, выделять и копировать. Обратите внимание, что структура и форматирование сохраняются при копировании в приложения для работы с электронными таблицами, такие как Microsoft Excel и Google Sheets. Для навигации между страницами данных таблицы (по 30 строк на странице) используйте элементы управления в нижней части окна.

<Image img={abc} size='md' alt='abc' />

### Просмотр содержимого ячейки {#inspecting-cell-data}

Инспектор ячеек позволяет просматривать большие объёмы данных, содержащихся в одной ячейке. Чтобы открыть его, щёлкните правой кнопкой мыши по ячейке и выберите «Inspect Cell». Содержимое инспектора можно скопировать, нажав на значок копирования в правом верхнем углу.

<Image img={inspecting_cell_content} size='md' alt='inspecting cell content' />


## Фильтрация и сортировка таблиц {#filtering-and-sorting-tables}

### Сортировка таблицы {#sorting-a-table}

Чтобы отсортировать таблицу в SQL-консоли, откройте таблицу и нажмите кнопку «Sort» на панели инструментов. Откроется меню настройки сортировки. Вы можете выбрать столбец для сортировки и задать порядок сортировки (по возрастанию или по убыванию). Нажмите «Apply» или клавишу Enter, чтобы применить сортировку к таблице

<Image
  img={sort_descending_on_column}
  size='md'
  alt='сортировка по убыванию в столбце'
/>

SQL-консоль также позволяет применять несколько сортировок к таблице. Нажмите кнопку «Sort» снова, чтобы добавить еще одну сортировку.

:::note
Сортировки применяются в том порядке, в котором они отображаются на панели сортировки (сверху вниз). Чтобы удалить сортировку, нажмите кнопку «x» рядом с ней.
:::

### Фильтрация таблицы {#filtering-a-table}

Чтобы отфильтровать таблицу в SQL-консоли, откройте таблицу и нажмите кнопку «Filter». Как и в случае с сортировкой, откроется меню настройки фильтра. Вы можете выбрать столбец для фильтрации и задать необходимые критерии. SQL-консоль автоматически отображает параметры фильтрации, соответствующие типу данных в столбце.

<Image
  img={filter_on_radio_column_equal_gsm}
  size='md'
  alt='фильтр по столбцу radio со значением GSM'
/>

Когда настройка фильтра завершена, нажмите «Apply», чтобы применить фильтрацию к данным. Вы также можете добавить дополнительные фильтры, как показано ниже.

<Image
  img={add_more_filters}
  size='md'
  alt='Добавление фильтра по диапазону больше 2000'
/>

Аналогично функции сортировки, нажмите кнопку «x» рядом с фильтром, чтобы удалить его.

### Совместное использование фильтрации и сортировки {#filtering-and-sorting-together}

SQL-консоль позволяет одновременно применять фильтрацию и сортировку к таблице. Для этого добавьте все необходимые фильтры и сортировки, используя описанные выше шаги, и нажмите кнопку «Apply».

<Image
  img={filtering_and_sorting_together}
  size='md'
  alt='Добавление фильтра по диапазону больше 2000'
/>

### Создание запроса из фильтров и сортировок {#creating-a-query-from-filters-and-sorts}

SQL-консоль может преобразовать ваши сортировки и фильтры в запросы одним нажатием. Просто нажмите кнопку «Create Query» на панели инструментов с выбранными параметрами сортировки и фильтрации. После нажатия «Create query» откроется новая вкладка запроса, предварительно заполненная SQL-командой, соответствующей данным в текущем представлении таблицы.

<Image
  img={create_a_query_from_sorts_and_filters}
  size='md'
  alt='Создание запроса из сортировок и фильтров'
/>

:::note
Фильтры и сортировки не являются обязательными при использовании функции «Create Query».
:::

Подробнее о выполнении запросов в SQL-консоли можно узнать из документации по запросам (link).


## Создание и выполнение запроса {#creating-and-running-a-query}

### Создание запроса {#creating-a-query}

Существует два способа создания нового запроса в SQL-консоли.

- Нажмите кнопку '+' на панели вкладок
- Нажмите кнопку 'New Query' в списке запросов на левой боковой панели

<Image img={creating_a_query} size='md' alt='Создание запроса' />

### Выполнение запроса {#running-a-query}

Чтобы выполнить запрос, введите SQL-команду(ы) в SQL-редактор и нажмите кнопку 'Run' или используйте сочетание клавиш `cmd / ctrl + enter`. Для последовательного написания и выполнения нескольких команд обязательно добавляйте точку с запятой после каждой команды.

Параметры выполнения запросов
По умолчанию при нажатии кнопки выполнения запускаются все команды, содержащиеся в SQL-редакторе. SQL-консоль поддерживает два дополнительных параметра выполнения запросов:

- Выполнить выбранную команду(ы)
- Выполнить команду в позиции курсора

Чтобы выполнить выбранную команду(ы), выделите нужную команду или последовательность команд и нажмите кнопку 'Run' (или используйте сочетание клавиш `cmd / ctrl + enter`). Также можно выбрать 'Run selected' из контекстного меню SQL-редактора (открывается правым щелчком мыши в любом месте редактора), когда присутствует выделение.

<Image img={run_selected_query} size='md' alt='выполнение выбранного запроса' />

Выполнение команды в текущей позиции курсора может быть осуществлено двумя способами:

- Выберите 'At Cursor' из расширенного меню параметров выполнения (или используйте соответствующее сочетание клавиш `cmd / ctrl + shift + enter`)

<Image img={run_at_cursor_2} size='md' alt='выполнение в позиции курсора' />

- Выберите 'Run at cursor' из контекстного меню SQL-редактора

<Image img={run_at_cursor} size='md' alt='выполнение в позиции курсора' />

:::note
Команда в позиции курсора будет мигать желтым цветом при выполнении.
:::

### Отмена запроса {#canceling-a-query}

Во время выполнения запроса кнопка 'Run' на панели инструментов редактора запросов будет заменена кнопкой 'Cancel'. Просто нажмите эту кнопку или клавишу `Esc`, чтобы отменить запрос. Примечание: любые результаты, которые уже были возвращены, сохранятся после отмены.

<Image img={cancel_a_query} size='md' alt='Отмена запроса' />

### Сохранение запроса {#saving-a-query}

Сохранение запросов позволяет легко находить их позже и делиться ими с коллегами. SQL-консоль также позволяет организовывать запросы в папки.

Чтобы сохранить запрос, просто нажмите кнопку "Save" рядом с кнопкой "Run" на панели инструментов. Введите желаемое имя и нажмите "Save Query".

:::note
Использование сочетания клавиш `cmd / ctrl + s` также сохранит любую работу в текущей вкладке запроса.
:::

<Image img={sql_console_save_query} size='md' alt='Сохранение запроса' />

Альтернативно, вы можете одновременно назвать и сохранить запрос, нажав на "Untitled Query" на панели инструментов, изменив имя и нажав Enter:

<Image img={sql_console_rename} size='md' alt='Переименование запроса' />

### Совместное использование запросов {#query-sharing}

SQL-консоль позволяет легко делиться запросами с членами команды. SQL-консоль поддерживает четыре уровня доступа, которые можно настроить как глобально, так и для отдельных пользователей:

- Владелец (может настраивать параметры совместного использования)
- Доступ на запись
- Доступ только для чтения
- Нет доступа

После сохранения запроса нажмите кнопку "Share" на панели инструментов. Появится модальное окно с параметрами совместного использования:

<Image img={sql_console_share} size='md' alt='Совместное использование запроса' />

Чтобы настроить доступ к запросу для всех членов организации, имеющих доступ к сервису, просто измените селектор уровня доступа в верхней строке:

<Image img={sql_console_edit_access} size='md' alt='Редактирование доступа' />

После применения вышеуказанных настроек запрос может быть просмотрен (и выполнен) всеми членами команды, имеющими доступ к SQL-консоли для данного сервиса.

Чтобы настроить доступ к запросу для конкретных членов команды, выберите нужного члена команды из селектора "Add a team member":

<Image img={sql_console_add_team} size='md' alt='Добавление члена команды' />

После выбора члена команды должна появиться новая строка с селектором уровня доступа:

<Image img={sql_console_edit_member} size='md' alt='Редактирование доступа члена команды' />

### Доступ к общим запросам {#accessing-shared-queries}

Если запрос был предоставлен вам в общий доступ, он будет отображаться на вкладке "Queries" левой боковой панели SQL-консоли:

<Image img={sql_console_access_queries} size='md' alt='Доступ к запросам' />

### Ссылка на запрос (постоянные ссылки) {#linking-to-a-query-permalinks}


Сохранённые запросы также имеют постоянные ссылки (permalinks), поэтому вы можете отправлять и получать ссылки на общие запросы и открывать их напрямую.

Значения любых параметров, которые могут присутствовать в запросе, автоматически добавляются к URL сохранённого запроса в виде параметров строки запроса. Например, если запрос содержит параметры `{start_date: Date}` и `{end_date: Date}`, постоянная ссылка может выглядеть так: `https://console.clickhouse.cloud/services/:serviceId/console/query/:queryId?param_start_date=2015-01-01&param_end_date=2016-01-01`.



## Расширенные возможности запросов {#advanced-querying-features}

### Поиск по результатам запроса {#searching-query-results}

После выполнения запроса вы можете быстро выполнить поиск по возвращённому набору результатов, используя поле поиска на панели результатов. Эта функция помогает предварительно просмотреть результаты дополнительного условия `WHERE` или просто убедиться, что определённые данные присутствуют в наборе результатов. После ввода значения в поле поиска панель результатов обновится и отобразит записи, содержащие элемент, соответствующий введённому значению. В этом примере мы будем искать все вхождения `breakfast` в таблице `hackernews` для комментариев, содержащих `ClickHouse` (без учёта регистра):

<Image img={search_hn} size='md' alt='Search Hacker News Data' />

Примечание: будут возвращены все поля, соответствующие введённому значению. Например, третья запись на приведённом выше снимке экрана не содержит 'breakfast' в поле `by`, но содержит его в поле `text`:

<Image img={match_in_body} size='md' alt='Match in body' />

### Настройка параметров постраничного отображения {#adjusting-pagination-settings}

По умолчанию панель результатов запроса отображает все записи на одной странице. Для больших наборов результатов может быть предпочтительнее разбить результаты на страницы для более удобного просмотра. Это можно сделать с помощью селектора постраничного отображения в правом нижнем углу панели результатов:

<Image img={pagination} size='md' alt='Pagination options' />

Выбор размера страницы немедленно применит постраничное отображение к набору результатов, и элементы навигации появятся в центре нижней части панели результатов.

<Image img={pagination_nav} size='md' alt='Pagination navigation' />

### Экспорт данных результатов запроса {#exporting-query-result-data}

Наборы результатов запросов можно легко экспортировать в формат CSV непосредственно из SQL-консоли. Для этого откройте меню `•••` в правой части панели инструментов результатов и выберите 'Download as CSV'.

<Image img={download_as_csv} size='md' alt='Download as CSV' />


## Визуализация данных запроса {#visualizing-query-data}

Некоторые данные проще интерпретировать в виде диаграмм. Вы можете быстро создавать визуализации на основе результатов запросов непосредственно из SQL-консоли всего за несколько кликов. В качестве примера используем запрос, который вычисляет еженедельную статистику поездок такси в Нью-Йорке:

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

<Image img={tabular_query_results} size='md' alt='Табличные результаты запроса' />

Без визуализации эти результаты сложно интерпретировать. Преобразуем их в диаграмму.

### Создание диаграмм {#creating-charts}

Чтобы начать создание визуализации, выберите опцию «Chart» на панели инструментов области результатов запроса. Откроется панель конфигурации диаграммы:

<Image
  img={switch_from_query_to_chart}
  size='md'
  alt='Переключение с запроса на диаграмму'
/>

Начнем с создания простой столбчатой диаграммы, отображающей `trip_total` по `week`. Для этого перетащим поле `week` на ось X, а поле `trip_total` — на ось Y:

<Image img={trip_total_by_week} size='md' alt='Общее количество поездок по неделям' />

Большинство типов диаграмм поддерживают несколько полей на числовых осях. Для демонстрации перетащим поле fare_total на ось Y:

<Image img={bar_chart} size='md' alt='Столбчатая диаграмма' />

### Настройка диаграмм {#customizing-charts}

SQL-консоль поддерживает десять типов диаграмм, которые можно выбрать из селектора типов диаграмм в панели конфигурации. Например, можно легко изменить предыдущий тип диаграммы со столбчатой на диаграмму с областями:

<Image
  img={change_from_bar_to_area}
  size='md'
  alt='Изменение со столбчатой диаграммы на диаграмму с областями'
/>

Заголовки диаграмм соответствуют имени запроса, предоставляющего данные. Обновление имени запроса приведет к обновлению заголовка диаграммы:

<Image img={update_query_name} size='md' alt='Обновление имени запроса' />

Ряд дополнительных характеристик диаграммы также можно настроить в разделе «Advanced» панели конфигурации диаграммы. Для начала настроим следующие параметры:

- Подзаголовок
- Названия осей
- Ориентация меток для оси X

Диаграмма будет соответствующим образом обновлена:

<Image img={update_subtitle_etc} size='md' alt='Обновление подзаголовка и т.д.' />

В некоторых сценариях может потребоваться независимая настройка масштабов осей для каждого поля. Это также можно выполнить в разделе «Advanced» панели конфигурации диаграммы, указав минимальные и максимальные значения для диапазона оси. Например, приведенная выше диаграмма выглядит хорошо, но для демонстрации корреляции между полями `trip_total` и `fare_total` диапазоны осей требуют корректировки:

<Image img={adjust_axis_scale} size='md' alt='Настройка масштаба осей' />
