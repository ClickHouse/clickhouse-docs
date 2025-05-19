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

SQL консоль — это самый быстрый и простой способ исследовать и запрашивать ваши базы данных в ClickHouse Cloud. Вы можете использовать SQL консоль для:

- Подключения к вашим службам ClickHouse Cloud
- Просмотра, фильтрации и сортировки данных таблиц
- Выполнения запросов и визуализации данных результатов всего за несколько кликов
- Обмена запросами с членами команды и более эффективного сотрудничества.

### Исследование таблиц {#exploring-tables}

### Просмотр списка таблиц и информации о схеме {#viewing-table-list-and-schema-info}

Обзор таблиц, содержащихся в вашей инстанции ClickHouse, можно найти в области левой боковой панели. Используйте селектор базы данных в верхней части левой панели, чтобы просмотреть таблицы в конкретной базе данных.

<Image img={table_list_and_schema} size="md" alt='список таблиц и схема' />
Таблицы в списке также можно развернуть, чтобы посмотреть колонки и их типы.

<Image img={view_columns} size="md" alt='просмотр колонок' />

### Исследование данных таблицы {#exploring-table-data}

Нажмите на таблицу в списке, чтобы открыть её в новой вкладке. В представлении таблицы данные можно легко просматривать, выбирать и копировать. Обратите внимание, что структура и форматирование сохраняются при копировании-вставке в приложения для работы с таблицами, такие как Microsoft Excel и Google Sheets. Вы можете переключаться между страницами данных таблицы (пагинация по 30 строк) с помощью навигации в нижнем колонтитуле.

<Image img={abc} size="md" alt='abc' />

### Проверка данных ячейки {#inspecting-cell-data}

Инструмент проверки ячейки позволяет просматривать большие объемы данных, содержащиеся в одной ячейке. Чтобы открыть его, щелкните правой кнопкой мыши по ячейке и выберите 'Проверить ячейку'. Содержимое инспектора ячеек можно скопировать, нажав на иконку копирования в правом верхнем углу содержимого инспектора.

<Image img={inspecting_cell_content} size="md" alt='проверка содержимого ячейки' />

## Фильтрация и сортировка таблиц {#filtering-and-sorting-tables}

### Сортировка таблицы {#sorting-a-table}

Чтобы отсортировать таблицу в SQL консоли, откройте таблицу и выберите кнопку 'Сортировать' в панели инструментов. Эта кнопка откроет меню, которое позволит вам настроить сортировку. Вы можете выбрать колонку, по которой хотите сортировать, и настроить порядок сортировки (возрастание или убывание). Выберите 'Применить' или нажмите Enter, чтобы отсортировать вашу таблицу.

<Image img={sort_descending_on_column} size="md" alt='сортировка по колонке в порядке убывания' />

SQL консоль также позволяет добавлять несколько сортировок к таблице. Нажмите кнопку 'Сортировать' снова, чтобы добавить ещё одну сортировку.

:::note
Сортировки применяются в том порядке, в котором они появляются в панели сортировки (сверху вниз). Чтобы удалить сортировку, просто нажмите кнопку 'x' рядом с сортировкой.
:::

### Фильтрация таблицы {#filtering-a-table}

Чтобы отфильтровать таблицу в SQL консоли, откройте таблицу и выберите кнопку 'Фильтр'. Так же, как и при сортировке, эта кнопка откроет меню, которое позволит вам настроить фильтрацию. Вы можете выбрать колонку, по которой хотите фильтровать, и задать необходимые критерии. SQL консоль интеллектуально отображает варианты фильтров, соответствующие типу данных, содержащихся в колонке.

<Image img={filter_on_radio_column_equal_gsm} size="md" alt='фильтр по колонке, равной GSM' />

Когда вас устроит ваш фильтр, вы можете выбрать 'Применить' для фильтрации ваших данных. Вы также можете добавить дополнительные фильтры, как показано ниже.

<Image img={add_more_filters} size="md" alt='Добавить фильтр по диапазону больше 2000' />

Аналогично функции сортировки, нажмите кнопку 'x' рядом с фильтром, чтобы удалить его.

### Фильтрация и сортировка одновременно {#filtering-and-sorting-together}

SQL консоль позволяет одновременно фильтровать и сортировать таблицу. Для этого добавьте все желаемые фильтры и сортировки с помощью описанных выше шагов и нажмите кнопку 'Применить'.

<Image img={filtering_and_sorting_together} size="md" alt='Добавить фильтр по диапазону больше 2000' />

### Создание запроса из фильтров и сортировок {#creating-a-query-from-filters-and-sorts}

SQL консоль может преобразовать ваши сортировки и фильтры напрямую в запросы одним нажатием кнопки. Просто выберите кнопку 'Создать запрос' на панели инструментов с параметрами сортировки и фильтров по вашему выбору. После нажатия 'Создать запрос' откроется новая вкладка запроса с предзаполненной SQL командой, соответствующей данным, содержащимся в вашем представлении таблицы.

<Image img={create_a_query_from_sorts_and_filters} size="md" alt='Создать запрос из сортировок и фильтров' />

:::note
Фильтры и сортировки не обязательны при использовании функции 'Создать запрос'.
:::

Вы можете узнать больше о запросах в SQL консоли, прочитав документацию по (link) запросам.

## Создание и выполнение запроса {#creating-and-running-a-query}

### Создание запроса {#creating-a-query}

Существует два способа создать новый запрос в SQL консоли.

- Нажмите кнопку '+' в строке вкладок.
- Выберите кнопку 'Новый запрос' в списке запросов левой боковой панели.

<Image img={creating_a_query} size="md" alt='Создание запроса' />

### Выполнение запроса {#running-a-query}

Чтобы выполнить запрос, введите ваши SQL команды в редакторе SQL и нажмите кнопку 'Запустить' или используйте сочетание клавиш `cmd / ctrl + enter`. Чтобы записывать и выполнять несколько команд последовательно, убедитесь, что после каждой команды стоит точка с запятой.

Варианты выполнения запросов
По умолчанию, нажатие кнопки запуска выполняет все команды, содержащиеся в редакторе SQL. SQL консоль поддерживает два других варианта выполнения запросов:

- Выполнить выделенные команды
- Выполнить команду в позиции курсора

Чтобы выполнить выделенные команды, выделите нужную команду или последовательность команд и нажмите кнопку 'Запустить' (или используйте сочетание клавиш `cmd / ctrl + enter`). Вы также можете выбрать 'Выполнить выделенное' из контекстного меню редактора SQL (открывается при щелчке правой кнопкой мыши в редакторе), когда выделение присутствует.

<Image img={run_selected_query} size="md" alt='выполнить выделенный запрос' />

Выполнить команду в текущей позиции курсора можно двумя способами:

- Выберите 'По курсору' из меню расширенных вариантов запуска (или используйте соответствующее сочетание клавиш `cmd / ctrl + shift + enter`).

<Image img={run_at_cursor_2} size="md" alt='выполнить по курсору' />

  - Выбрав 'Выполнить по курсору' из контекстного меню редактора SQL.

<Image img={run_at_cursor} size="md" alt='выполнить по курсору' />

:::note
Команда, находящаяся в позиции курсора, будет мигать желтым при выполнении.
:::

### Отмена запроса {#canceling-a-query}

Пока выполняется запрос, кнопка 'Запустить' в панели инструментов редактора запросов будет заменена кнопкой 'Отмена'. Просто нажмите эту кнопку или клавишу `Esc`, чтобы отменить запрос. Примечание: любые результаты, которые уже были возвращены, сохранятся после отмены.

<Image img={cancel_a_query} size="md" alt='Отменить запрос' />

### Сохранение запроса {#saving-a-query}

Сохранение запросов позволяет вам легко находить их позже и делиться ими с вашими коллегами. SQL консоль также позволяет организовать ваши запросы в папки.

Чтобы сохранить запрос, просто нажмите кнопку "Сохранить" сразу рядом с кнопкой "Запустить" на панели инструментов. Введите желаемое имя и нажмите "Сохранить запрос".

:::note
Использование сочетания клавиш `cmd / ctrl + s` также сохранит любую работу в текущей вкладке запроса.
:::

<Image img={sql_console_save_query} size="md" alt='Сохранить запрос' />

Кроме того, вы можете одновременно назвать и сохранить запрос, нажав на "Безымянный запрос" на панели инструментов, изменив название и нажав Enter:

<Image img={sql_console_rename} size="md" alt='Переименовать запрос' />

### Обмен запросами {#query-sharing}

SQL консоль позволяет легко делиться запросами с вашими коллегами. SQL консоль поддерживает четыре уровня доступа, которые могут быть настроены как глобально, так и на уровне конкретного пользователя:

- Владелец (может настраивать параметры обмена)
- Права на запись
- Доступ только для чтения
- Нет доступа

После сохранения запроса нажмите кнопку "Поделиться" на панели инструментов. Появится модальное окно с параметрами обмена:

<Image img={sql_console_share} size="md" alt='Поделиться запросом' />

Чтобы настроить доступ к запросу для всех членов организации с доступом к службе, просто измените селектор уровня доступа в верхней строке:

<Image img={sql_console_edit_access} size="md" alt='Редактировать доступ' />

После применения вышеизложенного запрос теперь может быть просмотрен (и выполнен) всеми членами команды, имеющими доступ к SQL консоли для службы.

Чтобы настроить доступ к запросу для конкретных участников, выберите нужного участника команды из селектора "Добавить участника команды":

<Image img={sql_console_add_team} size="md" alt='Добавить участника команды' />

После выбора участника команды должна появиться новая строка с селектором уровня доступа:

<Image img={sql_console_edit_member} size="md" alt='Редактировать доступ участника команды' />

### Доступ к общим запросам {#accessing-shared-queries}

Если запрос был с вами разделен, он будет отображаться на вкладке "Запросы" в левой боковой панели SQL консоли:

<Image img={sql_console_access_queries} size="md" alt='Доступ к запросам' />

### Ссылка на запрос (постоянные ссылки) {#linking-to-a-query-permalinks}

Сохраненные запросы также имеют постоянные ссылки, что означает, что вы можете отправлять и получать ссылки на общие запросы и открывать их напрямую.

Значения для любых параметров, которые могут существовать в запросе, автоматически добавляются к URL сохраненного запроса в виде параметров запроса. Например, если запрос содержит параметры `{start_date: Date}` и `{end_date: Date}`, постоянная ссылка может выглядеть так: `https://console.clickhouse.cloud/services/:serviceId/console/query/:queryId?param_start_date=2015-01-01&param_end_date=2016-01-01`.

## Расширенные функции запросов {#advanced-querying-features}

### Поиск по результатам запроса {#searching-query-results}

После выполнения запроса вы можете быстро искать по возвращенному набору результатов, используя поле поиска в панели результатов. Эта функция помогает предварительно просматривать результаты дополнительного условия `WHERE` или просто проверять, чтобы убедиться, что конкретные данные включены в набор результатов. После ввода значения в поле поиска панель результатов обновится и вернет записи, содержащие элемент, соответствующий введенному значению. В этом примере мы будем искать все экземпляры `breakfast` в таблице `hackernews` для комментариев, содержащих `ClickHouse` (не учитывается регистр):

<Image img={search_hn} size="md" alt='Поиск данных Hacker News' />

Примечание: любое поле, соответствующее введенному значению, будет возвращено. Например, третья запись на приведенном выше скриншоте не соответствует 'breakfast' в поле `by`, но поле `text` соответствует:

<Image img={match_in_body} size="md" alt='Совпадение в теле' />

### Настройка параметров пагинации {#adjusting-pagination-settings}

По умолчанию панель результатов запроса отображает каждую запись результата на одной странице. Для больших наборов результатов может быть предпочтительнее разбивать результаты на страницы для более удобного просмотра. Это можно сделать с помощью селектора пагинации в правом нижнем углу панели результатов:

<Image img={pagination} size="md" alt='Опции пагинации' />

Выбор размера страницы немедленно применит пагинацию к набору результатов, и параметры навигации появятся в середине нижнего колонтитула панели результатов.

<Image img={pagination_nav} size="md" alt='Навигация пагинации' />

### Экспорт данных результата запроса {#exporting-query-result-data}

Наборы результатов запроса можно легко экспортировать в формат CSV прямо из SQL консоли. Для этого откройте меню `•••` на правой стороне панели инструментов результатов и выберите 'Скачать как CSV'.

<Image img={download_as_csv} size="md" alt='Скачать как CSV' />

## Визуализация данных запроса {#visualizing-query-data}

Некоторые данные могут быть легче интерпретированы в виде графика. Вы можете быстро создавать визуализации из данных результатов запроса прямо из SQL консоли всего за несколько кликов. В качестве примера мы будем использовать запрос, который рассчитывает еженедельную статистику для поездок такси в Нью-Йорке:

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

Без визуализации эти результаты трудно интерпретировать. Давайте превратим их в график.

### Создание графиков {#creating-charts}

Чтобы начать создавать вашу визуализацию, выберите опцию 'График' на панели инструментов панели результатов запроса. Появится панель конфигурации графика:

<Image img={switch_from_query_to_chart} size="md" alt='Переключиться с запроса на график' />

Мы начнем с создания простого столбчатого графика, отслеживающего `trip_total` по `week`. Для этого перетащим поле `week` на ось x, а поле `trip_total` на ось y:

<Image img={trip_total_by_week} size="md" alt='Итого поездок по неделям' />

Большинство типов графиков поддерживают несколько полей на числовых осях. Чтобы продемонстрировать это, мы перетащим поле fare_total на ось y:

<Image img={bar_chart} size="md" alt='Столбчатый график' />

### Настройка графиков {#customizing-charts}

SQL консоль поддерживает десять типов графиков, которые можно выбрать из селектора типов графиков в панели конфигурации графика. Например, мы можем легко изменить предыдущий тип графика с Столбчатого на Площадь:

<Image img={change_from_bar_to_area} size="md" alt='Изменить с столбчатого графика на график площадью' />

Названия графиков совпадают с именем запроса, предоставляющего данные. Обновление названия запроса приведет к обновлению названия графика:

<Image img={update_query_name} size="md" alt='Обновить имя запроса' />

Некоторые более продвинутые характеристики графиков также можно настроить в разделе 'Дополнительно' панели конфигурации графика. Для начала мы изменим следующие настройки:

- Подзаголовок
- Названия осей
- Ориентация меток для оси x

Наш график будет обновлен соответственно:

<Image img={update_subtitle_etc} size="md" alt='Обновить подзаголовок и т.д.' />

В некоторых случаях может потребоваться настроить шкалы осей для каждого поля отдельно. Это также можно сделать в разделе 'Дополнительно' панели конфигурации графика, указывая минимальные и максимальные значения для диапазона оси. Например, вышеуказанный график выглядит хорошо, но для демонстрации корреляции между нашими полями `trip_total` и `fare_total` диапазоны осей нуждаются в некоторой корректировке:

<Image img={adjust_axis_scale} size="md" alt='Настроить масштаб оси' />
