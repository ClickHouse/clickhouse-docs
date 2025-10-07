---
'sidebar_title': 'SQL Console'
'slug': '/cloud/get-started/sql-console'
'description': 'Запускайте запросы и создавайте визуализации с использованием SQL
  Консоли.'
'keywords':
- 'sql console'
- 'sql client'
- 'cloud console'
- 'console'
'title': 'SQL Консоль'
'doc_type': 'guide'
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

SQL консоль — самый быстрый и простой способ исследовать и запрашивать ваши базы данных в ClickHouse Cloud. Вы можете использовать SQL консоль для:

- Подключения к вашим ClickHouse Cloud Services
- Просмотра, фильтрации и сортировки данных таблиц
- Выполнения запросов и визуализации данных результатов всего за несколько кликов
- Обмена запросами с членами команды и более эффективного сотрудничества.

### Исследование таблиц {#exploring-tables}

### Просмотр списка таблиц и информации о схеме {#viewing-table-list-and-schema-info}

Обзор таблиц, содержащихся в вашем экземпляре ClickHouse, можно найти в области левой боковой панели. Используйте селектор базы данных в верхней части левой панели, чтобы просмотреть таблицы в конкретной базе данных.

<Image img={table_list_and_schema} size="md" alt='список таблиц и схема' />
Таблицы в списке также можно развернуть, чтобы увидеть колонки и типы.

<Image img={view_columns} size="md" alt='просмотр колонок' />

### Исследование данных таблицы {#exploring-table-data}

Нажмите на таблицу в списке, чтобы открыть ее в новой вкладке. В виде таблицы данные можно легко просматривать, выбирать и копировать. Обратите внимание, что структура и форматирование сохраняются при копировании и вставке в приложения для работы с таблицами, такие как Microsoft Excel и Google Sheets. Вы можете переключаться между страницами данных таблицы (пагинированными с увеличением на 30 строк) с помощью навигации в нижнем колонтитуле.

<Image img={abc} size="md" alt='abc' />

### Просмотр данных ячейки {#inspecting-cell-data}

Инструмент инспектора ячеек можно использовать для просмотра больших объемов данных, содержащихся в одной ячейке. Чтобы открыть его, щелкните правой кнопкой мыши на ячейке и выберите 'Просмотреть ячейку'. Содержимое инспектора ячейки можно скопировать, нажав на иконку копирования в правом верхнем углу содержимого инспектора.

<Image img={inspecting_cell_content} size="md" alt='просмотр содержимого ячейки' />

## Фильтрация и сортировка таблиц {#filtering-and-sorting-tables}

### Сортировка таблицы {#sorting-a-table}

Чтобы отсортировать таблицу в SQL консоли, откройте таблицу и выберите кнопку 'Сортировать' на панели инструментов. Эта кнопка откроет меню, которое позволит вам настроить сортировку. Вы можете выбрать колонку, по которой хотите сортировать, и настроить порядок сортировки (по возрастанию или убыванию). Выберите 'Применить' или нажмите Enter, чтобы отсортировать вашу таблицу.

<Image img={sort_descending_on_column} size="md" alt='сортировка по убыванию по колонке' />

SQL консоль также позволяет добавлять несколько сортировок к таблице. Нажмите кнопку 'Сортировать' еще раз, чтобы добавить другую сортировку.

:::note
Сортировки применяются в порядке их появления в области сортировки (сверху вниз). Чтобы удалить сортировку, просто нажмите кнопку 'x' рядом с сортировкой.
:::

### Фильтрация таблицы {#filtering-a-table}

Чтобы отфильтровать таблицу в SQL консоли, откройте таблицу и выберите кнопку 'Фильтр'. Точно так же, как и при сортировке, эта кнопка откроет меню, которое позволит вам настроить фильтр. Вы можете выбрать колонку, по которой будете фильтровать, и выбрать необходимые критерии. SQL консоль интеллектуально отображает варианты фильтра, которые соответствуют типу данных, содержащихся в колонке.

<Image img={filter_on_radio_column_equal_gsm} size="md" alt='фильтр по колонке равной GSM' />

Когда вы будете довольны выбранным фильтром, вы можете выбрать 'Применить', чтобы отфильтровать ваши данные. Вы также можете добавить дополнительные фильтры, как показано ниже.

<Image img={add_more_filters} size="md" alt='Добавить фильтр по диапазону больше 2000' />

Подобно функциональности сортировки, нажмите кнопку 'x' рядом с фильтром, чтобы удалить его.

### Фильтрация и сортировка вместе {#filtering-and-sorting-together}

SQL консоль позволяет фильтровать и сортировать таблицу одновременно. Для этого добавьте все желаемые фильтры и сортировки, используя описанные выше шаги, и нажмите кнопку 'Применить'.

<Image img={filtering_and_sorting_together} size="md" alt='Добавить фильтр по диапазону больше 2000' />

### Создание запроса из фильтров и сортировок {#creating-a-query-from-filters-and-sorts}

SQL консоль может преобразовать ваши сортировки и фильтры прямо в запросы одним кликом. Просто выберите кнопку 'Создать запрос' на панели инструментов с параметрами сортировки и фильтра по вашему выбору. После нажатия 'Создать запрос' откроется новая вкладка запроса, предварительно заполненная SQL-командой, соответствующей данным, содержащимся в вашем представлении таблицы.

<Image img={create_a_query_from_sorts_and_filters} size="md" alt='Создать запрос из сортировок и фильтров' />

:::note
Фильтры и сортировки не являются обязательными при использовании функции 'Создать запрос'.
:::

Вы можете узнать больше о запросах в SQL консоли, прочитав (link) документацию по запросам.

## Создание и выполнение запроса {#creating-and-running-a-query}

### Создание запроса {#creating-a-query}

Существует два способа создать новый запрос в SQL консоли.

- Нажмите кнопку '+' в строке вкладок
- Выберите кнопку 'Новый запрос' из списка запросов в левой боковой панели

<Image img={creating_a_query} size="md" alt='Создание запроса' />

### Выполнение запроса {#running-a-query}

Чтобы выполнить запрос, введите ваши SQL-команды в SQL редактор и нажмите кнопку 'Выполнить' или используйте сочетание клавиш `cmd / ctrl + enter`. Чтобы написать и выполнить несколько команд последовательно, обязательно добавьте точку с запятой в конце каждой команды.

Варианты выполнения запросов
По умолчанию нажатие кнопки выполнения запустит все команды, содержащиеся в SQL редакторе. SQL консоль поддерживает два других варианта выполнения запросов:

- Выполнить выбранные команды
- Выполнить команду на позиции курсора

Чтобы выполнить выбранные команды, выделите нужную команду или последовательность команд и нажмите кнопку 'Выполнить' (или используйте сочетание клавиш `cmd / ctrl + enter`). Вы также можете выбрать 'Выполнить выделенное' из контекстного меню SQL редактора (открывается по щелчку правой кнопкой мыши в любом месте редактора), когда присутствует выделение.

<Image img={run_selected_query} size="md" alt='выполнить выбранный запрос' />

Выполнить команду на текущей позиции курсора можно двумя способами:

- Выбрать 'На курсоре' из расширенного меню выполнения (или использовать соответствующее сочетание клавиш `cmd / ctrl + shift + enter`)

<Image img={run_at_cursor_2} size="md" alt='выполнить на курсоре' />

- Выбрав 'Выполнить на курсоре' из контекстного меню SQL редактора

<Image img={run_at_cursor} size="md" alt='выполнить на курсоре' />

:::note
Команда, находящаяся на позиции курсора, будет мигать желтым при выполнении.
:::

### Отмена запроса {#canceling-a-query}

Пока запрос выполняется, кнопка 'Выполнить' на панели инструментов редактора запросов будет заменена на кнопку 'Отмена'. Просто нажмите эту кнопку или нажмите `Esc`, чтобы отменить запрос. Обратите внимание: любые результаты, которые уже были возвращены, останутся после отмены.

<Image img={cancel_a_query} size="md" alt='Отменить запрос' />

### Сохранение запроса {#saving-a-query}

Сохранение запросов позволяет вам легко находить их позже и делиться ими с коллегами. SQL консоль также позволяет организовывать ваши запросы в папки.

Чтобы сохранить запрос, просто нажмите кнопку "Сохранить" сразу рядом с кнопкой "Выполнить" на панели инструментов. Введите желаемое имя и нажмите "Сохранить запрос".

:::note
Использование сочетания клавиш `cmd / ctrl` + s также сохранит все работы в текущей вкладке запроса.
:::

<Image img={sql_console_save_query} size="md" alt='Сохранить запрос' />

В качестве альтернативы, вы можете одновременно задать имя и сохранить запрос, щелкнув на "Без названия" в панели инструментов, изменив имя и нажав Enter:

<Image img={sql_console_rename} size="md" alt='Переименовать запрос' />

### Совместное использование запросов {#query-sharing}

SQL консоль позволяет вам легко делиться запросами с членами вашей команды. SQL консоль поддерживает четыре уровня доступа, которые можно настраивать как глобально, так и для каждого пользователя:

- Владелец (может настраивать параметры совместного использования)
- Права на запись
- Доступ только для чтения
- Без доступа

После сохранения запроса нажмите кнопку "Поделиться" на панели инструментов. Появится модальное окно с параметрами совместного использования:

<Image img={sql_console_share} size="md" alt='Поделиться запросом' />

Чтобы настроить доступ к запросу для всех членов организации, имеющих доступ к сервису, просто отрегулируйте селектор уровня доступа в верхней строке:

<Image img={sql_console_edit_access} size="md" alt='Редактировать доступ' />

После применения вышеуказанного, запрос теперь может просматривать (и выполнять) все члены команды, имеющие доступ к SQL консоли для сервиса.

Чтобы настроить доступ к запросу для конкретных членов команды, выберите нужного члена команды в селекторе "Добавить члена команды":

<Image img={sql_console_add_team} size="md" alt='Добавить члена команды' />

После выбора члена команды должна появиться новая строка с селектором уровня доступа:

<Image img={sql_console_edit_member} size="md" alt='Редактировать доступ члена команды' />

### Доступ к общим запросам {#accessing-shared-queries}

Если запрос был удостоен доступа, он будет отображен во вкладке "Запросы" в левой боковой панели SQL консоли:

<Image img={sql_console_access_queries} size="md" alt='Доступ к запросам' />

### Ссылка на запрос (постоянные ссылки) {#linking-to-a-query-permalinks}

Сохраненные запросы также имеют постоянные ссылки, что означает, что вы можете отправлять и получать ссылки на общие запросы и открывать их непосредственно.

Значения для любых параметров, которые могут существовать в запросе, автоматически добавляются в URL сохраненного запроса в качестве параметров запроса. Например, если запрос содержит параметры `{start_date: Date}` и `{end_date: Date}`, ссылка может выглядеть как: `https://console.clickhouse.cloud/services/:serviceId/console/query/:queryId?param_start_date=2015-01-01&param_end_date=2016-01-01`.

## Расширенные функции запроса {#advanced-querying-features}

### Поиск в результатах запроса {#searching-query-results}

После выполнения запроса вы можете быстро просмотреть возвращаемый набор результатов, используя поле поиска в панели результатов. Эта функция помогает предварительно просмотреть результаты дополнительного `WHERE` выражения или просто проверить, чтобы убедиться, что определенные данные включены в набор результатов. После ввода значения в поле поиска панель результатов обновится и вернет записи, содержащие элемент, соответствующий введенному значению. В этом примере мы будем искать все вхождения `breakfast` в таблице `hackernews` для комментариев, содержащих `ClickHouse` (без учета регистра):

<Image img={search_hn} size="md" alt='Поиск данных Hacker News' />

Обратите внимание: любое поле, соответствующее введенному значению, будет возвращено. Например, третья запись в приведенном выше скриншоте не совпадает с 'breakfast' в поле `by`, но поле `text` совпадает:

<Image img={match_in_body} size="md" alt='Совпадение в теле' />

### Настройка параметров пагинации {#adjusting-pagination-settings}

По умолчанию панель результатов запроса будет отображать каждую запись результата на одной странице. Для больших наборов результатов может быть предпочтительнее разбить результаты на страницы для удобства просмотра. Это можно сделать с помощью селектора пагинации в нижнем правом углу панели результатов:

<Image img={pagination} size="md" alt='Опции пагинации' />

Выбор размера страницы сразу же применит пагинацию к набору результатов, и варианты навигации появятся в середине нижнего колонтитула панели результатов.

<Image img={pagination_nav} size="md" alt='Навигация по пагинации' />

### Экспорт данных результатов запроса {#exporting-query-result-data}

Наборы результатов запроса можно легко экспортировать в формат CSV напрямую из SQL консоли. Для этого откройте меню `•••` с правой стороны панели инструментов результатов и выберите 'Скачать как CSV'.

<Image img={download_as_csv} size="md" alt='Скачать как CSV' />

## Визуализация данных запроса {#visualizing-query-data}

Некоторые данные могут быть легче интерпретировать в форме диаграммы. Вы можете быстро создать визуализации из данных результатов запроса прямо из SQL консоли всего за несколько кликов. В качестве примера мы используем запрос, который рассчитывает недельную статистику по поездкам такси в Нью-Йорке:

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

Без визуализации эти результаты трудно интерпретировать. Давайте превратим их в диаграмму.

### Создание диаграмм {#creating-charts}

Чтобы начать создавать вашу визуализацию, выберите опцию 'Диаграмма' на панели инструментов панели результатов запроса. Появится панель конфигурации диаграммы:

<Image img={switch_from_query_to_chart} size="md" alt='Переключить с запроса на диаграмму' />

Мы начнем с создания простой столбчатой диаграммы, отслеживающей `trip_total` по `week`. Для этого мы перетащим поле `week` на ось x и поле `trip_total` на ось y:

<Image img={trip_total_by_week} size="md" alt='Общая сумма поездок по неделям' />

Большинство типов диаграмм поддерживают несколько полей на числовых осях. Для демонстрации мы перетащим поле fare_total на ось y:

<Image img={bar_chart} size="md" alt='Столбчатая диаграмма' />

### Настройка диаграмм {#customizing-charts}

SQL консоль поддерживает десять типов диаграмм, которые можно выбрать в селекторе типов диаграмм в панели конфигурации диаграммы. Например, мы можем легко изменить предыдущий тип диаграммы с 'Столбчатой' на 'Область':

<Image img={change_from_bar_to_area} size="md" alt='Изменить с столбчатой диаграммы на область' />

Заголовки диаграмм соответствуют имени запроса, предоставляющего данные. Обновление имени запроса вызовет также обновление заголовка диаграммы:

<Image img={update_query_name} size="md" alt='Обновить имя запроса' />

Несколько более продвинутых характеристик диаграммы также можно настроить в разделе 'Расширенные параметры' панели конфигурации диаграммы. Для начала мы изменим следующие настройки:

- Подзаголовок
- Заголовки осей
- Ориентация меток для оси x

Наша диаграмма будет обновлена соответственно:

<Image img={update_subtitle_etc} size="md" alt='Обновить подзаголовок и т.д.' />

В некоторых сценариях может быть необходимо изменять масштабы осей для каждого поля независимо. Это также можно сделать в разделе 'Расширенные параметры' панели конфигурации диаграммы, указав минимальные и максимальные значения для диапазона оси. Например, приведенная выше диаграмма выглядит хорошо, но чтобы продемонстрировать корреляцию между нашими полями `trip_total` и `fare_total`, диапазоны осей нуждаются в некоторой корректировке:

<Image img={adjust_axis_scale} size="md" alt='Настроить масштаб оси' />
