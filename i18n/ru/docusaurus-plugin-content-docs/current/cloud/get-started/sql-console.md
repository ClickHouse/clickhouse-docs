---
sidebar_title: 'SQL Консоль'
slug: /cloud/get-started/sql-console
description: 'Запускайте запросы и создавайте визуализации с помощью SQL Консоли.'
keywords: ['sql console', 'sql client', 'cloud console', 'console']
title: 'SQL Консоль'
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


# SQL Консоль

SQL консоль - это самый быстрый и простой способ исследовать и запрашивать ваши базы данных в ClickHouse Cloud. Вы можете использовать SQL консоль для:

- Подключения к вашим ClickHouse Cloud Services
- Просмотра, фильтрации и сортировки данных таблицы
- Выполнения запросов и визуализации результатов всего за несколько кликов
- Совместного использования запросов с членами команды и более эффективного сотрудничества.

### Изучение таблиц {#exploring-tables}

### Просмотр списка таблиц и информации о схеме {#viewing-table-list-and-schema-info}

Обзор таблиц, содержащихся в вашем экземпляре ClickHouse, можно найти в области левой боковой панели. Используйте селектор базы данных в верхней части левой панели, чтобы просмотреть таблицы в конкретной базе данных.

<Image img={table_list_and_schema} size="md" alt='список таблиц и схема' />
Таблицы в списке также могут быть развернуты для просмотра колонок и типов.

<Image img={view_columns} size="md" alt='просмотр колонок' />

### Изучение данных таблицы {#exploring-table-data}

Щелкните по таблице в списке, чтобы открыть её в новой вкладке. В представлении таблицы данные можно легко просматривать, выделять и копировать. Обратите внимание, что структура и форматирование сохраняются при копировании и вставке в такие приложения для работы с таблицами, как Microsoft Excel и Google Sheets. Вы можете переключаться между страницами данных таблицы (пагинация по 30 строк) с помощью навигации в нижней части.

<Image img={abc} size="md" alt='abc' />

### Проверка данных ячейки {#inspecting-cell-data}

Инструмент проверки ячеек может быть использован для просмотра большого объёма данных, содержащихся в одной ячейке. Чтобы открыть его, щелкните правой кнопкой мыши на ячейке и выберите «Проверить ячейку». Содержимое инспектора ячейки можно скопировать, нажав на иконку копирования в правом верхнем углу.

<Image img={inspecting_cell_content} size="md" alt='инспекция содержимого ячейки' />

## Фильтрация и сортировка таблиц {#filtering-and-sorting-tables}

### Сортировка таблицы {#sorting-a-table}

Чтобы отсортировать таблицу в SQL консоли, откройте таблицу и выберите кнопку «Сортировка» на панели инструментов. Эта кнопка откроет меню, которое позволит вам настроить сортировку. Вы можете выбрать колонку, по которой хотите отсортировать, и настроить порядок сортировки (по возрастанию или по убыванию). Выберите «Применить» или нажмите Enter, чтобы отсортировать вашу таблицу.

<Image img={sort_descending_on_column} size="md" alt='сортировка по убыванию по колонке' />

SQL консоль также позволяет добавлять несколько сортировок к таблице. Щелкните на кнопку «Сортировка» снова, чтобы добавить другую сортировку.

:::note
Сортировки применяются в порядке, в котором они отображаются в области сортировки (сверху вниз). Чтобы удалить сортировку, просто щелкните на кнопку «x» рядом с сортировкой.
:::

### Фильтрация таблицы {#filtering-a-table}

Чтобы отфильтровать таблицу в SQL консоли, откройте таблицу и выберите кнопку «Фильтр». Так же, как и сортировка, эта кнопка откроет меню, которое позволит вам настроить фильтр. Вы можете выбрать колонку, по которой будете фильтровать, и выбрать необходимые критерии. SQL консоль интеллектуально отображает варианты фильтрации, которые соответствуют типу данных, содержащихся в колонке.

<Image img={filter_on_radio_column_equal_gsm} size="md" alt='фильтр по радиокодам, равным GSM' />

Когда вы будете довольны своим фильтром, вы можете выбрать «Применить», чтобы отфильтровать данные. Вы также можете добавить дополнительные фильтры, как показано ниже.

<Image img={add_more_filters} size="md" alt='Добавить фильтр по диапазону больше 2000' />

Аналогично функционалу сортировки, щелкните на кнопку «x» рядом с фильтром, чтобы удалить его.

### Фильтрация и сортировка вместе {#filtering-and-sorting-together}

SQL консоль позволяет одновременно фильтровать и сортировать таблицу. Для этого добавьте все желаемые фильтры и сортировки, используя описанные выше шаги, и нажмите кнопку «Применить».

<Image img={filtering_and_sorting_together} size="md" alt='Добавить фильтр по диапазону больше 2000' />

### Создание запроса из фильтров и сортировок {#creating-a-query-from-filters-and-sorts}

SQL консоль может преобразовать ваши сортировки и фильтры непосредственно в запросы одним кликом. Просто выберите кнопку «Создать запрос» на панели инструментов с параметрами сортировки и фильтрации по вашему выбору. После нажатия на «Создать запрос» откроется новая вкладка запроса, предварительно заполненная SQL командой, соответствующей данным, содержащимся в вашем представлении таблицы.

<Image img={create_a_query_from_sorts_and_filters} size="md" alt='Создать запрос из сортировок и фильтров' />

:::note
Фильтры и сортировки не являются обязательными при использовании функции «Создать запрос».
:::

Вы можете узнать больше о запросах в SQL консоли, прочитав (link) документацию по запросам.

## Создание и выполнение запроса {#creating-and-running-a-query}

### Создание запроса {#creating-a-query}

Существует два способа создать новый запрос в SQL консоли.

- Щелкните кнопку «+» на панели вкладок.
- Выберите кнопку «Новый запрос» из списка запросов в левой боковой панели.

<Image img={creating_a_query} size="md" alt='Создание запроса' />

### Выполнение запроса {#running-a-query}

Чтобы выполнить запрос, введите вашу SQL команду(ы) в SQL редактор и нажмите кнопку «Выполнить» или используйте сочетание клавиш `cmd / ctrl + enter`. Чтобы написать и выполнить несколько команд последовательно, убедитесь, что после каждой команды стоит точка с запятой.

Опции выполнения запроса  
По умолчанию нажатие кнопки запускаем выполняет все команды, содержащиеся в SQL редакторе. SQL консоль поддерживает две другие опции выполнения запросов:

- Выполнить выделенные команды
- Выполнить команду на текущем курсоре

Чтобы выполнить выделенные команды, выделите желаемую команду или последовательность команд и нажмите кнопку «Выполнить» (или используйте сочетание клавиш `cmd / ctrl + enter`). Вы также можете выбрать «Выполнить выделенное» из контекстного меню SQL редактора (открывается по правому клику в любом месте редактора), когда имеется выделение.

<Image img={run_selected_query} size="md" alt='выполнить выбранный запрос' />

Запуск команды в текущей позиции курсора можно осуществить двумя способами:

- Выбрать «На курсоре» из расширенного меню опций выполнения (или использовать соответствующее сочетание клавиш `cmd / ctrl + shift + enter`).

<Image img={run_at_cursor_2} size="md" alt='выполнить на курсоре' />

  - Выбрав «Выполнить на курсоре» из контекстного меню SQL редактора.

<Image img={run_at_cursor} size="md" alt='выполнить на курсоре' />

:::note
Команда, находящаяся на позиции курсора, будет мигать желтым при выполнении.
:::

### Отмена запроса {#canceling-a-query}

Во время выполнения запроса кнопка «Выполнить» в панели инструментов редактора запросов будет заменена кнопкой «Отмена». Просто щелкните на эту кнопку или нажмите `Esc`, чтобы отменить запрос. Примечание: любые результаты, которые уже были возвращены, будут сохранены после отмены.

<Image img={cancel_a_query} size="md" alt='Отменить запрос' />

### Сохранение запроса {#saving-a-query}

Сохранение запросов позволяет вам легко находить их позже и делиться ими с вашими коллегами по команде. SQL консоль также позволяет организовывать ваши запросы в папки.

Чтобы сохранить запрос, просто нажмите кнопку "Сохранить" непосредственно рядом с кнопкой "Выполнить" на панели инструментов. Введите желаемое имя и нажмите "Сохранить запрос".

:::note
Использование сочетания клавиш `cmd / ctrl` + s также сохранит всю работу в текущей вкладке запроса.
:::

<Image img={sql_console_save_query} size="md" alt='Сохранить запрос' />

В качестве альтернативы вы можете одновременно дать имя запросу и сохранить его, нажав на "Безымянный запрос" на панели инструментов, изменив имя и нажав Enter:

<Image img={sql_console_rename} size="md" alt='Переименовать запрос' />

### Совместное использование запроса {#query-sharing}

SQL консоль позволяет вам легко делиться запросами с членами вашей команды. SQL консоль поддерживает четыре уровня доступа, которые можно настроить как глобально, так и по каждому пользователю:

- Владелец (может изменять параметры совместного использования)
- Запись
- Доступ только для чтения
- Без доступа

После сохранения запроса нажмите кнопку "Поделиться" на панели инструментов. Появится модальное окно с параметрами совместного использования:

<Image img={sql_console_share} size="md" alt='Поделиться запросом' />

Чтобы настроить доступ к запросу для всех членов организации, имеющих доступ к сервису, просто настройте селектор уровня доступа в верхней строке:

<Image img={sql_console_edit_access} size="md" alt='Изменить доступ' />

После применения вышеуказанного запроса теперь может просматривать (и выполнять) любой член команды, имеющий доступ к SQL консоли для сервиса.

Чтобы настроить доступ к запросу для конкретных членов, выберите желаемого члена команды из селектора "Добавить члена команды":

<Image img={sql_console_add_team} size="md" alt='Добавить члена команды' />

После выбора члена команды в списке появится новая строка с селектором уровня доступа:

<Image img={sql_console_edit_member} size="md" alt='Изменить доступ члена команды' />

### Доступ к общим запросам {#accessing-shared-queries}

Если запрос был расшарен с вами, он будет отображаться на вкладке "Запросы" в левой боковой панели SQL консоли:

<Image img={sql_console_access_queries} size="md" alt='Доступ к запросам' />

### Ссылки на запрос (постоянные ссылки) {#linking-to-a-query-permalinks}

Сохранённые запросы также имеют постоянные ссылки, что означает, что вы можете отправлять и получать ссылки на общие запросы и открывать их напрямую.

Значения для любых параметров, которые могут существовать в запросе, автоматически добавляются в URL сохранённого запроса в качестве параметров запроса. Например, если запрос содержит параметры `{start_date: Date}` и `{end_date: Date}`, постоянная ссылка может выглядеть так: `https://console.clickhouse.cloud/services/:serviceId/console/query/:queryId?param_start_date=2015-01-01&param_end_date=2016-01-01`.

## Расширенные функции запроса {#advanced-querying-features}

### Поиск по результатам запроса {#searching-query-results}

После выполнения запроса вы можете быстро искать по возвращенному набору результатов, используя поле поиска в области результата. Эта функция помогает проверить результаты дополнительного условия `WHERE` или просто убедиться, что конкретные данные включены в набор результатов. После ввода значения в поле поиска область результата обновится и вернет записи, содержащие запись, соответствующую введенному значению. В этом примере мы будем искать все упоминания `breakfast` в таблице `hackernews` для комментариев, содержащих `ClickHouse` (без учета регистра):

<Image img={search_hn} size="md" alt='Поиск данных Hacker News' />

Примечание: любое поле, соответствующее введённому значению, будет возвращено. Например, третья запись на приведённом выше скриншоте не соответствует ‘breakfast’ в поле `by`, но поле `text` соответствует:

<Image img={match_in_body} size="md" alt='Совпадение в теле' />

### Настройка настроек пагинации {#adjusting-pagination-settings}

По умолчанию область результатов запроса будет отображать все записи результата на одной странице. Для больших наборов результатов может быть предпочтительно разбить результаты на страницы для удобства просмотра. Это можно сделать с помощью селектора пагинации в правом нижнем углу области результата:

<Image img={pagination} size="md" alt='Параметры пагинации' />

Выбор размера страницы сразу применит пагинацию к набору результатов, а параметры навигации появятся в середине нижней части области результата.

<Image img={pagination_nav} size="md" alt='Навигация пагинации' />

### Экспорт данных результата запроса {#exporting-query-result-data}

Наборы результатов запроса можно легко экспортировать в формат CSV прямо из SQL консоли. Для этого откройте меню `•••` на правой стороне панели инструментов области результата и выберите «Скачать как CSV».

<Image img={download_as_csv} size="md" alt='Скачать как CSV' />

## Визуализация данных запроса {#visualizing-query-data}

Некоторые данные можно легче интерпретировать в виде графика. Вы можете быстро создать визуализации из данных результатов запроса прямо из SQL консоли всего за несколько кликов. В качестве примера мы используем запрос, который вычисляет недельную статистику для поездок такси в Нью-Йорке:

```sql
select
   toStartOfWeek(pickup_datetime) as week,
   sum(total_amount) as fare_total,
   sum(trip_distance) as distance_total,
   count(*) as trip_total
from
   nyc_taxi
group by
   1
order by
   1 asc
```

<Image img={tabular_query_results} size="md" alt='Табличные результаты запроса' />

Без визуализации эти результаты сложно интерпретировать. Давайте превратим их в график.

### Создание графиков {#creating-charts}

Чтобы начать создание вашей визуализации, выберите опцию «График» на панели инструментов области результатов запроса. Появится панель настройки графика:

<Image img={switch_from_query_to_chart} size="md" alt='Переключение с запроса на график' />

Мы начнем с создания простого столбчатого графика, показывающего `trip_total` по `week`. Для этого мы переместим поле `week` на ось x, а поле `trip_total` на ось y:

<Image img={trip_total_by_week} size="md" alt='Общее число поездок по неделям' />

Большинство типов графиков поддерживают несколько полей на числовых осях. Для демонстрации мы перетянем поле fare_total на ось y:

<Image img={bar_chart} size="md" alt='Столбчатый график' />

### Настройка графиков {#customizing-charts}

SQL консоль поддерживает десять типов графиков, которые можно выбрать из селектора типов графиков в панели настройки графика. Например, мы можем легко изменить тип предыдущего графика с столбчатого на область:

<Image img={change_from_bar_to_area} size="md" alt='Переключение с столбчатого графика на область' />

Названия графиков соответствуют именам запросов, поставляющим данные. Обновление названия запроса также приведет к обновлению названия графика:

<Image img={update_query_name} size="md" alt='Обновить имя запроса' />

Некоторые более продвинутые характеристики графика также могут быть настроены в разделе «Дополнительно» панели настройки графика. Сначала мы настроим следующие параметры:

- Подзаголовок
- Названия осей
- Ориентация меток для оси x

Наш график будет обновлён соответственно:

<Image img={update_subtitle_etc} size="md" alt='Обновить подзаголовок и т.д.' />

В некоторых сценариях может быть необходимо настраивать шкалы осей для каждого поля независимо. Это также можно сделать в разделе «Дополнительно» панели настройки графика, указав минимальные и максимальные значения для диапазона оси. Например, приведённый выше график выглядит хорошо, но для демонстрации соотношения между нашими полями `trip_total` и `fare_total` диапазоны осей нужно немного подкорректировать:

<Image img={adjust_axis_scale} size="md" alt='Настроить шкалу оси' />
