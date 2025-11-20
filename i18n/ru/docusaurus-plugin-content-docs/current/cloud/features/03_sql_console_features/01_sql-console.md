---
sidebar_title: 'SQL-консоль'
slug: /cloud/get-started/sql-console
description: 'Выполняйте запросы и создавайте визуализации в SQL-консоли.'
keywords: ['sql console', 'sql client', 'cloud console', 'console']
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

SQL-консоль — это самый быстрый и простой способ исследовать и запрашивать базы данных в ClickHouse Cloud. SQL-консоль позволяет:

- Подключаться к сервисам ClickHouse Cloud
- Просматривать, фильтровать и сортировать данные таблиц
- Выполнять запросы и визуализировать результаты всего за несколько кликов
- Делиться запросами с коллегами и эффективнее работать совместно.

### Работа с таблицами {#exploring-tables}

### Просмотр списка таблиц и информации о схеме {#viewing-table-list-and-schema-info}

Обзор таблиц, содержащихся в вашем экземпляре ClickHouse, можно найти на левой боковой панели. Используйте селектор базы данных в верхней части левой панели для просмотра таблиц в конкретной базе данных.

<Image img={table_list_and_schema} size='md' alt='table list and schema' />
Таблицы в списке также можно развернуть для просмотра столбцов и типов данных.

<Image img={view_columns} size='md' alt='view columns' />

### Просмотр данных таблицы {#exploring-table-data}

Нажмите на таблицу в списке, чтобы открыть её в новой вкладке. В режиме просмотра таблицы данные можно легко просматривать, выделять и копировать. Обратите внимание, что структура и форматирование сохраняются при копировании в приложения для работы с электронными таблицами, такие как Microsoft Excel и Google Sheets. Вы можете переключаться между страницами данных таблицы (с разбивкой по 30 строк) с помощью навигации в нижней части страницы.

<Image img={abc} size='md' alt='abc' />

### Просмотр содержимого ячейки {#inspecting-cell-data}

Инструмент инспектора ячеек можно использовать для просмотра больших объёмов данных, содержащихся в одной ячейке. Чтобы открыть его, щёлкните правой кнопкой мыши по ячейке и выберите «Inspect Cell». Содержимое инспектора ячеек можно скопировать, нажав на значок копирования в правом верхнем углу.

<Image img={inspecting_cell_content} size='md' alt='inspecting cell content' />


## Фильтрация и сортировка таблиц {#filtering-and-sorting-tables}

### Сортировка таблицы {#sorting-a-table}

Чтобы отсортировать таблицу в SQL Console, откройте таблицу и выберите кнопку «Sort» на панели инструментов. Эта кнопка откроет меню, в котором вы сможете настроить параметры сортировки. Вы можете выбрать столбец для сортировки и задать порядок сортировки (по возрастанию или по убыванию). Нажмите «Apply» или клавишу Enter, чтобы отсортировать таблицу.

<Image
  img={sort_descending_on_column}
  size='md'
  alt='сортировка по столбцу по убыванию'
/>

SQL Console также позволяет добавить к таблице несколько уровней сортировки. Нажмите кнопку «Sort» ещё раз, чтобы добавить ещё одну сортировку.

:::note
Сортировки применяются в том порядке, в котором они указаны в панели сортировки (сверху вниз). Чтобы удалить сортировку, просто нажмите кнопку «x» рядом с ней.
:::

### Фильтрация таблицы {#filtering-a-table}

Чтобы отфильтровать таблицу в SQL Console, откройте таблицу и выберите кнопку «Filter». Аналогично сортировке, эта кнопка откроет меню, в котором вы сможете настроить фильтр. Вы можете выбрать столбец для фильтрации и указать необходимые критерии. SQL Console автоматически отображает варианты фильтрации, соответствующие типу данных в выбранном столбце.

<Image
  img={filter_on_radio_column_equal_gsm}
  size='md'
  alt='фильтр по столбцу radio со значением GSM'
/>

Когда вы будете довольны настройкой фильтра, нажмите «Apply», чтобы применить его к данным. Вы также можете добавить дополнительные фильтры, как показано ниже.

<Image
  img={add_more_filters}
  size='md'
  alt='Добавление фильтра по диапазону больше 2000'
/>

Аналогично сортировке, нажмите кнопку «x» рядом с фильтром, чтобы удалить его.

### Совместная фильтрация и сортировка {#filtering-and-sorting-together}

SQL Console позволяет одновременно фильтровать и сортировать таблицу. Для этого добавьте все необходимые фильтры и сортировки, используя описанные выше шаги, и нажмите кнопку «Apply».

<Image
  img={filtering_and_sorting_together}
  size='md'
  alt='Добавление фильтра по диапазону больше 2000'
/>

### Создание запроса на основе фильтров и сортировок {#creating-a-query-from-filters-and-sorts}

SQL Console может одним щелчком преобразовать ваши сортировки и фильтры в SQL‑запрос. Просто нажмите кнопку «Create Query» на панели инструментов после настройки нужных параметров сортировки и фильтрации. После нажатия «Create Query» откроется новая вкладка запроса, заранее заполненная SQL‑командой, соответствующей данным в текущем представлении таблицы.

<Image
  img={create_a_query_from_sorts_and_filters}
  size='md'
  alt='Создание запроса на основе сортировок и фильтров'
/>

:::note
При использовании функции «Create Query» фильтры и сортировки не являются обязательными.
:::

Подробнее о выполнении запросов в SQL Console вы можете узнать в документации по запросам (link).


## Создание и выполнение запроса {#creating-and-running-a-query}

### Создание запроса {#creating-a-query}

В SQL‑консоли есть два способа создать новый запрос.

- Нажмите кнопку «+» на панели вкладок
- Нажмите кнопку «New Query» в списке запросов на левой боковой панели

<Image img={creating_a_query} size='md' alt='Создание запроса' />

### Выполнение запроса {#running-a-query}

Чтобы выполнить запрос, введите SQL‑команду (или несколько команд) в SQL‑редактор и нажмите кнопку «Run» либо используйте сочетание клавиш `cmd / ctrl + enter`. Для последовательного выполнения нескольких команд обязательно ставьте точку с запятой после каждой команды.

Варианты выполнения запроса
По умолчанию нажатие кнопки «Run» выполняет все команды, содержащиеся в SQL‑редакторе. SQL‑консоль также поддерживает два других варианта выполнения запросов:

- Выполнить выделенные команды
- Выполнить команду в позиции курсора

Чтобы выполнить выделенные команды, выделите нужную команду или последовательность команд и нажмите кнопку «Run» (или используйте сочетание клавиш `cmd / ctrl + enter`). Также при наличии выделения вы можете выбрать пункт «Run selected» в контекстном меню SQL‑редактора (открывается по щелчку правой кнопкой мыши внутри редактора).

<Image img={run_selected_query} size='md' alt='Выполнение выделенного запроса' />

Выполнить команду в текущей позиции курсора можно двумя способами:

- Выберите вариант «At Cursor» в расширенном меню параметров запуска (или используйте соответствующее сочетание клавиш `cmd / ctrl + shift + enter`)

<Image img={run_at_cursor_2} size='md' alt='Выполнение в позиции курсора' />

- Выберите пункт «Run at cursor» в контекстном меню SQL‑редактора

<Image img={run_at_cursor} size='md' alt='Выполнить в позиции курсора' />

:::note
Команда, находящаяся в позиции курсора, при выполнении кратковременно подсвечивается жёлтым цветом.
:::

### Отмена выполнения запроса {#canceling-a-query}

Во время выполнения запроса кнопка «Run» на панели инструментов редактора запросов заменяется на кнопку «Cancel». Нажмите эту кнопку или клавишу `Esc`, чтобы отменить выполнение запроса. Обратите внимание: любые результаты, которые уже были возвращены, сохранятся после отмены.

<Image img={cancel_a_query} size='md' alt='Отмена выполнения запроса' />

### Сохранение запроса {#saving-a-query}

Сохранение запросов позволяет легко находить их позже и делиться ими с коллегами. SQL‑консоль также позволяет организовывать запросы по папкам.

Чтобы сохранить запрос, нажмите кнопку «Save» на панели инструментов рядом с кнопкой «Run». Введите нужное имя и нажмите «Save Query».

:::note
Сочетание клавиш `cmd / ctrl + s` также сохранит текущую работу во вкладке запроса.
:::

<Image img={sql_console_save_query} size='md' alt='Сохранение запроса' />

Также вы можете одновременно задать имя и сохранить запрос, щёлкнув по «Untitled Query» на панели инструментов, изменив имя и нажав Enter:

<Image img={sql_console_rename} size='md' alt='Переименование запроса' />

### Совместное использование запросов {#query-sharing}

SQL‑консоль позволяет легко делиться запросами с участниками вашей команды. В SQL‑консоли поддерживаются четыре уровня доступа, которые можно настраивать как глобально, так и для отдельных пользователей:

- Владелец (может изменять параметры доступа)
- Доступ на запись
- Доступ только для чтения
- Нет доступа

После сохранения запроса нажмите кнопку «Share» на панели инструментов. Откроется модальное окно с параметрами доступа:

<Image img={sql_console_share} size='md' alt='Предоставление доступа к запросу' />

Чтобы настроить доступ к запросу для всех участников организации, имеющих доступ к сервису, измените уровень доступа в верхней строке:

<Image img={sql_console_edit_access} size='md' alt='Изменение доступа' />

После применения настроек запрос станет доступен для просмотра (и выполнения) всем участникам команды, имеющим доступ к SQL‑консоли данного сервиса.

Чтобы настроить доступ к запросу для отдельных участников, выберите нужного пользователя в списке «Add a team member»:

<Image img={sql_console_add_team} size='md' alt='Добавление участника команды' />

После выбора участника появится новая строка с возможностью задать уровень доступа:

<Image img={sql_console_edit_member} size='md' alt='Изменение доступа участника команды' />

### Доступ к общим запросам {#accessing-shared-queries}

Если запрос был предоставлен вам, он отобразится на вкладке «Queries» в левой боковой панели SQL‑консоли:

<Image img={sql_console_access_queries} size='md' alt='Доступ к запросам' />

### Ссылка на запрос (постоянная ссылка) {#linking-to-a-query-permalinks}


Сохранённые запросы также имеют постоянные ссылки (permalinks), то есть вы можете отправлять и получать ссылки на общие запросы и открывать их напрямую.

Значения любых параметров, которые могут присутствовать в запросе, автоматически добавляются к URL сохранённого запроса в виде параметров запроса. Например, если запрос содержит параметры `{start_date: Date}` и `{end_date: Date}`, постоянная ссылка может выглядеть так: `https://console.clickhouse.cloud/services/:serviceId/console/query/:queryId?param_start_date=2015-01-01&param_end_date=2016-01-01`.



## Расширенные возможности выполнения запросов {#advanced-querying-features}

### Поиск по результатам запроса {#searching-query-results}

После выполнения запроса вы можете быстро выполнять поиск по возвращаемому набору результатов, используя поле поиска в панели результатов. Эта функция помогает предварительно оценить результаты дополнительного условия `WHERE` или просто проверить, что определённые данные присутствуют в наборе результатов. После ввода значения в поле поиска панель результатов обновится и вернёт записи, содержащие вхождение, совпадающее с введённым значением. В этом примере мы ищем все вхождения `breakfast` в таблице `hackernews` среди комментариев, содержащих `ClickHouse` (без учёта регистра):

<Image img={search_hn} size='md' alt='Поиск данных Hacker News' />

Примечание: Будут возвращены любые записи, в которых одно из полей соответствует введённому значению. Например, третья запись на скриншоте выше не содержит `breakfast` в поле `by`, но содержит его в поле `text`:

<Image img={match_in_body} size='md' alt='Совпадение в тексте' />

### Настройка параметров постраничного вывода {#adjusting-pagination-settings}

По умолчанию панель результатов запроса отображает все записи на одной странице. Для больших наборов результатов может быть удобнее разбивать их на страницы. Это можно сделать с помощью селектора постраничного вывода в правом нижнем углу панели результатов:

<Image img={pagination} size='md' alt='Параметры постраничного вывода' />

Выбор размера страницы немедленно применит постраничный вывод к набору результатов, и в середине нижней части панели результатов появятся элементы навигации.

<Image img={pagination_nav} size='md' alt='Навигация по страницам' />

### Экспорт данных результатов запроса {#exporting-query-result-data}

Наборы результатов запроса можно легко экспортировать в формат CSV прямо из SQL-консоли. Для этого откройте меню `•••` справа на панели инструментов панели результатов и выберите «Download as CSV».

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

Чтобы начать создание визуализации, выберите опцию 'Chart' на панели инструментов области результатов запроса. Откроется панель настройки диаграммы:

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

SQL-консоль поддерживает десять типов диаграмм, которые можно выбрать из селектора типов диаграмм на панели настройки. Например, можно легко изменить предыдущий тип диаграммы со столбчатой на диаграмму с областями:

<Image
  img={change_from_bar_to_area}
  size='md'
  alt='Изменение со столбчатой диаграммы на диаграмму с областями'
/>

Заголовки диаграмм соответствуют имени запроса, предоставляющего данные. При обновлении имени запроса заголовок диаграммы также обновится:

<Image img={update_query_name} size='md' alt='Обновление имени запроса' />

Ряд дополнительных характеристик диаграммы также можно настроить в разделе 'Advanced' панели настройки диаграммы. Для начала настроим следующие параметры:

- Подзаголовок
- Названия осей
- Ориентация меток для оси X

Диаграмма будет обновлена соответствующим образом:

<Image img={update_subtitle_etc} size='md' alt='Обновление подзаголовка и т.д.' />

В некоторых сценариях может потребоваться независимая настройка масштабов осей для каждого поля. Это также можно выполнить в разделе 'Advanced' панели настройки диаграммы, указав минимальные и максимальные значения для диапазона оси. Например, приведенная выше диаграмма выглядит хорошо, но для демонстрации корреляции между полями `trip_total` и `fare_total` диапазоны осей требуют корректировки:

<Image img={adjust_axis_scale} size='md' alt='Настройка масштаба осей' />
