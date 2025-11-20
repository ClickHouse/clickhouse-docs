---
sidebar_label: 'SQL Console'
sidebar_position: 1
title: 'SQL-консоль'
slug: /integrations/sql-clients/sql-console
description: 'Подробнее о SQL-консоли'
doc_type: 'guide'
keywords: ['sql console', 'query interface', 'web ui', 'sql editor', 'cloud console']
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
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
import give_a_query_a_name from '@site/static/images/cloud/sqlconsole/give-a-query-a-name.png'
import save_the_query from '@site/static/images/cloud/sqlconsole/save-the-query.png'


# Консоль SQL

Консоль SQL — это самый быстрый и простой способ исследовать и выполнять запросы к вашим базам данных в ClickHouse Cloud. Вы можете использовать консоль SQL, чтобы:

- Подключаться к своим сервисам ClickHouse Cloud
- Просматривать, фильтровать и сортировать данные таблиц
- Выполнять запросы и визуализировать результаты всего в несколько кликов
- Делиться запросами с членами команды и эффективнее взаимодействовать.



## Изучение таблиц {#exploring-tables}

### Просмотр списка таблиц и информации о схеме {#viewing-table-list-and-schema-info}

Обзор таблиц, содержащихся в вашем экземпляре ClickHouse, можно найти на левой боковой панели. Используйте селектор базы данных в верхней части левой панели для просмотра таблиц в конкретной базе данных

<Image
  img={table_list_and_schema}
  size='lg'
  border
  alt='Список таблиц и представление схемы с таблицами базы данных на левой боковой панели'
/>

Таблицы в списке также можно развернуть для просмотра столбцов и типов данных

<Image
  img={view_columns}
  size='lg'
  border
  alt='Представление развернутой таблицы с именами столбцов и типами данных'
/>

### Просмотр данных таблицы {#exploring-table-data}

Нажмите на таблицу в списке, чтобы открыть её в новой вкладке. В представлении таблицы данные можно легко просматривать, выделять и копировать. Обратите внимание, что структура и форматирование сохраняются при копировании в приложения для работы с электронными таблицами, такие как Microsoft Excel и Google Sheets. Вы можете переключаться между страницами данных таблицы (с разбивкой по 30 строк) с помощью навигации в нижней части страницы.

<Image
  img={abc}
  size='lg'
  border
  alt='Представление таблицы с данными, которые можно выделить и скопировать'
/>

### Просмотр данных ячейки {#inspecting-cell-data}

Инструмент просмотра ячеек можно использовать для просмотра больших объёмов данных, содержащихся в одной ячейке. Чтобы открыть его, щёлкните правой кнопкой мыши по ячейке и выберите «Inspect Cell». Содержимое инспектора ячеек можно скопировать, нажав на значок копирования в правом верхнем углу.

<Image
  img={inspecting_cell_content}
  size='lg'
  border
  alt='Диалоговое окно просмотра ячейки с содержимым выбранной ячейки'
/>


## Фильтрация и сортировка таблиц {#filtering-and-sorting-tables}

### Сортировка таблицы {#sorting-a-table}

Чтобы отсортировать таблицу в SQL-консоли, откройте таблицу и нажмите кнопку 'Sort' на панели инструментов. Откроется меню настройки сортировки. Вы можете выбрать столбец для сортировки и задать порядок сортировки (по возрастанию или по убыванию). Нажмите 'Apply' или клавишу Enter для применения сортировки

<Image
  img={sort_descending_on_column}
  size='lg'
  border
  alt='Диалоговое окно сортировки с настройкой сортировки по убыванию для столбца'
/>

SQL-консоль также позволяет применять несколько сортировок к таблице. Нажмите кнопку 'Sort' повторно, чтобы добавить еще одну сортировку. Примечание: сортировки применяются в порядке их отображения на панели сортировки (сверху вниз). Чтобы удалить сортировку, нажмите кнопку 'x' рядом с ней.

### Фильтрация таблицы {#filtering-a-table}

Чтобы отфильтровать таблицу в SQL-консоли, откройте таблицу и нажмите кнопку 'Filter'. Как и в случае с сортировкой, откроется меню настройки фильтра. Вы можете выбрать столбец для фильтрации и задать необходимые критерии. SQL-консоль автоматически отображает параметры фильтрации, соответствующие типу данных в столбце.

<Image
  img={filter_on_radio_column_equal_gsm}
  size='lg'
  border
  alt='Диалоговое окно фильтрации с настройкой фильтра для столбца radio со значением GSM'
/>

Когда настройка фильтра завершена, нажмите 'Apply' для применения фильтрации к данным. Вы также можете добавить дополнительные фильтры, как показано ниже.

<Image
  img={add_more_filters}
  size='lg'
  border
  alt='Диалоговое окно, показывающее добавление дополнительного фильтра для диапазона больше 2000'
/>

Аналогично функции сортировки, для удаления фильтра нажмите кнопку 'x' рядом с ним.

### Совместное использование фильтрации и сортировки {#filtering-and-sorting-together}

SQL-консоль позволяет одновременно применять фильтрацию и сортировку к таблице. Для этого добавьте все необходимые фильтры и сортировки, используя описанные выше шаги, и нажмите кнопку 'Apply'.

<Image
  img={filtering_and_sorting_together}
  size='lg'
  border
  alt='Интерфейс с одновременно примененными фильтрацией и сортировкой'
/>

### Создание запроса из фильтров и сортировок {#creating-a-query-from-filters-and-sorts}

SQL-консоль может преобразовать ваши сортировки и фильтры непосредственно в запросы одним щелчком мыши. Просто нажмите кнопку 'Create Query' на панели инструментов с выбранными параметрами сортировки и фильтрации. После нажатия 'Create query' откроется новая вкладка запроса, предварительно заполненная SQL-командой, соответствующей данным в текущем представлении таблицы.

<Image
  img={create_a_query_from_sorts_and_filters}
  size='lg'
  border
  alt='Интерфейс с кнопкой Create Query, которая генерирует SQL из фильтров и сортировок'
/>

:::note
Фильтры и сортировки не являются обязательными при использовании функции 'Create Query'.
:::

Вы можете узнать больше о выполнении запросов в SQL-консоли, прочитав (link) документацию по запросам.


## Создание и выполнение запроса {#creating-and-running-a-query}

### Создание запроса {#creating-a-query}

Существует два способа создания нового запроса в SQL-консоли.

- Нажмите кнопку «+» на панели вкладок
- Нажмите кнопку «New Query» в списке запросов на левой боковой панели

<Image
  img={creating_a_query}
  size='lg'
  border
  alt='Интерфейс, показывающий создание нового запроса с помощью кнопки + или кнопки New Query'
/>

### Выполнение запроса {#running-a-query}

Чтобы выполнить запрос, введите SQL-команды в SQL-редактор и нажмите кнопку «Run» или используйте сочетание клавиш `cmd / ctrl + enter`. Для последовательного выполнения нескольких команд обязательно добавляйте точку с запятой после каждой команды.

Параметры выполнения запросов
По умолчанию при нажатии кнопки выполнения запускаются все команды, содержащиеся в SQL-редакторе. SQL-консоль поддерживает два дополнительных параметра выполнения запросов:

- Выполнить выбранные команды
- Выполнить команду в позиции курсора

Чтобы выполнить выбранные команды, выделите нужную команду или последовательность команд и нажмите кнопку «Run» (или используйте сочетание клавиш `cmd / ctrl + enter`). Также можно выбрать «Run selected» из контекстного меню SQL-редактора (открывается правым щелчком мыши в любом месте редактора), когда текст выделен.

<Image
  img={run_selected_query}
  size='lg'
  border
  alt='Интерфейс, показывающий выполнение выбранной части SQL-запроса'
/>

Выполнение команды в текущей позиции курсора можно осуществить двумя способами:

- Выберите «At Cursor» из расширенного меню параметров выполнения (или используйте соответствующее сочетание клавиш `cmd / ctrl + shift + enter`)

<Image
  img={run_at_cursor_2}
  size='lg'
  border
  alt='Опция Run at cursor в расширенном меню параметров выполнения'
/>

- Выберите «Run at cursor» из контекстного меню SQL-редактора

<Image
  img={run_at_cursor}
  size='lg'
  border
  alt='Опция Run at cursor в контекстном меню SQL-редактора'
/>

:::note
Команда в позиции курсора будет мигать желтым цветом при выполнении.
:::

### Отмена запроса {#canceling-a-query}

Во время выполнения запроса кнопка «Run» на панели инструментов редактора запросов заменяется кнопкой «Cancel». Просто нажмите эту кнопку или клавишу `Esc`, чтобы отменить запрос. Примечание: любые результаты, которые уже были возвращены, сохранятся после отмены.

<Image
  img={cancel_a_query}
  size='lg'
  border
  alt='Кнопка Cancel, которая появляется во время выполнения запроса'
/>

### Сохранение запроса {#saving-a-query}

Если запрос не был назван ранее, он будет называться «Untitled Query». Нажмите на имя запроса, чтобы изменить его. Переименование запроса приведет к его сохранению.

<Image
  img={give_a_query_a_name}
  size='lg'
  border
  alt='Интерфейс, показывающий переименование запроса из Untitled Query'
/>

Также можно использовать кнопку сохранения или сочетание клавиш `cmd / ctrl + s` для сохранения запроса.

<Image
  img={save_the_query}
  size='lg'
  border
  alt='Кнопка сохранения на панели инструментов редактора запросов'
/>


## Использование GenAI для управления запросами {#using-genai-to-manage-queries}

Эта функция позволяет пользователям формулировать запросы в виде вопросов на естественном языке, после чего консоль запросов создаёт SQL-запросы на основе контекста доступных таблиц. GenAI также помогает пользователям отлаживать запросы.

Подробнее о GenAI читайте в [записи блога об анонсе подсказок запросов на основе GenAI в ClickHouse Cloud](https://clickhouse.com/blog/announcing-genai-powered-query-suggestions-clickhouse-cloud).

### Настройка таблицы {#table-setup}

Импортируем пример набора данных UK Price Paid и используем его для создания нескольких запросов с помощью GenAI.

1. Откройте сервис ClickHouse Cloud.
1. Создайте новый запрос, нажав на значок _+_.
1. Вставьте и выполните следующий код:

   ```sql
   CREATE TABLE uk_price_paid
   (
       price UInt32,
       date Date,
       postcode1 LowCardinality(String),
       postcode2 LowCardinality(String),
       type Enum8('terraced' = 1, 'semi-detached' = 2, 'detached' = 3, 'flat' = 4, 'other' = 0),
       is_new UInt8,
       duration Enum8('freehold' = 1, 'leasehold' = 2, 'unknown' = 0),
       addr1 String,
       addr2 String,
       street LowCardinality(String),
       locality LowCardinality(String),
       town LowCardinality(String),
       district LowCardinality(String),
       county LowCardinality(String)
   )
   ENGINE = MergeTree
   ORDER BY (postcode1, postcode2, addr1, addr2);
   ```

   Выполнение этого запроса должно занять около 1 секунды. После завершения у вас появится пустая таблица с именем `uk_price_paid`.

1. Создайте новый запрос и вставьте следующий код:

   ```sql
   INSERT INTO uk_price_paid
   WITH
      splitByChar(' ', postcode) AS p
   SELECT
       toUInt32(price_string) AS price,
       parseDateTimeBestEffortUS(time) AS date,
       p[1] AS postcode1,
       p[2] AS postcode2,
       transform(a, ['T', 'S', 'D', 'F', 'O'], ['terraced', 'semi-detached', 'detached', 'flat', 'other']) AS type,
       b = 'Y' AS is_new,
       transform(c, ['F', 'L', 'U'], ['freehold', 'leasehold', 'unknown']) AS duration,
       addr1,
       addr2,
       street,
       locality,
       town,
       district,
       county
   FROM url(
       'http://prod.publicdata.landregistry.gov.uk.s3-website-eu-west-1.amazonaws.com/pp-complete.csv',
       'CSV',
       'uuid_string String,
       price_string String,
       time String,
       postcode String,
       a String,
       b String,
       c String,
       addr1 String,
       addr2 String,
       street String,
       locality String,
       town String,
       district String,
       county String,
       d String,
       e String'
   ) SETTINGS max_http_get_redirects=10;
   ```

Этот запрос получает набор данных с веб-сайта `gov.uk`. Размер файла составляет ~4 ГБ, поэтому выполнение запроса займёт несколько минут. После того как ClickHouse обработает запрос, весь набор данных будет находиться в таблице `uk_price_paid`.

#### Создание запроса {#query-creation}

Создадим запрос, используя естественный язык.

1. Выберите таблицу **uk_price_paid**, затем нажмите **Create Query**.
1. Нажмите **Generate SQL**. Вас могут попросить подтвердить, что ваши запросы отправляются в ChatGPT. Для продолжения необходимо выбрать **I agree**.
1. Теперь вы можете использовать это поле для ввода запроса на естественном языке, и ChatGPT преобразует его в SQL-запрос. В этом примере введём:

   > Show me the total price and total number of all uk_price_paid transactions by year.

1. Консоль сгенерирует нужный запрос и отобразит его в новой вкладке. В нашем примере GenAI создал следующий запрос:

   ```sql
   -- Show me the total price and total number of all uk_price_paid transactions by year.
   SELECT year(date), sum(price) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. После того как вы убедитесь в корректности запроса, нажмите **Run** для его выполнения.

### Отладка {#debugging}

Теперь протестируем возможности отладки запросов GenAI.

1. Создайте новый запрос, нажав на значок _+_, и вставьте следующий код:


```sql
   -- Показать общую стоимость и общее количество всех транзакций uk_price_paid по годам.
   SELECT year(date), sum(pricee) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
```

1. Нажмите **Run**. Запрос завершится с ошибкой, так как мы пытаемся получить значения из `pricee` вместо `price`.
2. Нажмите **Fix Query**.
3. GenAI попытается исправить запрос. В данном случае он изменил `pricee` на `price`. Он также определил, что `toYear` — более подходящая функция для этого сценария.
4. Нажмите **Apply**, чтобы применить предложенные изменения к вашему запросу, затем нажмите **Run**.

Помните, что GenAI — это экспериментальная функция. Будьте осторожны при запуске запросов, сгенерированных GenAI, для любых наборов данных.


## Расширенные возможности запросов {#advanced-querying-features}

### Поиск по результатам запроса {#searching-query-results}

После выполнения запроса вы можете быстро выполнить поиск по возвращённому набору результатов с помощью поля поиска в панели результатов. Эта функция помогает предварительно просмотреть результаты с дополнительным условием `WHERE` или просто проверить, что в набор результатов включены нужные данные. После ввода значения в поле поиска панель результатов обновится и вернёт записи, содержащие в каком‑либо поле значение, соответствующее введённому. В этом примере мы ищем все вхождения `breakfast` в таблице `hackernews` среди комментариев, содержащих `ClickHouse` (без учёта регистра):

<Image img={search_hn} size='lg' border alt='Поиск данных Hacker News' />

Примечание: Будут возвращены любые записи, в которых хотя бы одно поле соответствует введённому значению. Например, третья запись на приведённом выше скриншоте не содержит `breakfast` в поле `by`, но это значение есть в поле `text`:

<Image img={match_in_body} size='lg' border alt='Совпадение в тексте' />

### Настройка параметров постраничного отображения {#adjusting-pagination-settings}

По умолчанию панель результатов запроса отображает все записи на одной странице. Для больших наборов данных может быть удобнее включить постраничное отображение результатов. Это можно сделать с помощью переключателя постраничного отображения в правом нижнем углу панели результатов:

<Image img={pagination} size='lg' border alt='Параметры постраничного отображения' />

После выбора размера страницы постраничное отображение немедленно применится к набору результатов, и в центральной части нижней панели результатов появятся элементы навигации.

<Image img={pagination_nav} size='lg' border alt='Навигация по страницам' />

### Экспорт результатов запроса {#exporting-query-result-data}

Наборы результатов запросов можно легко экспортировать в формат CSV непосредственно из SQL‑консоли. Для этого откройте меню `•••` в правой части панели инструментов панели результатов и выберите пункт `Download as CSV`.

<Image img={download_as_csv} size='lg' border alt='Download as CSV' />


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

<Image
  img={tabular_query_results}
  size='lg'
  border
  alt='Табличные результаты запроса'
/>

Без визуализации эти результаты сложно интерпретировать. Преобразуем их в диаграмму.

### Создание диаграмм {#creating-charts}

Чтобы начать создание визуализации, выберите опцию 'Chart' на панели инструментов области результатов запроса. Откроется панель настройки диаграммы:

<Image
  img={switch_from_query_to_chart}
  size='lg'
  border
  alt='Переключение с запроса на диаграмму'
/>

Начнем с создания простой столбчатой диаграммы, отображающей `trip_total` по `week`. Для этого перетащим поле `week` на ось X, а поле `trip_total` — на ось Y:

<Image img={trip_total_by_week} size='lg' border alt='Общее количество поездок по неделям' />

Большинство типов диаграмм поддерживают несколько полей на числовых осях. Для демонстрации перетащим поле fare_total на ось Y:

<Image img={bar_chart} size='lg' border alt='Столбчатая диаграмма' />

### Настройка диаграмм {#customizing-charts}

SQL-консоль поддерживает десять типов диаграмм, которые можно выбрать из селектора типов диаграмм на панели настройки. Например, можно легко изменить предыдущий тип диаграммы со столбчатой на диаграмму с областями:

<Image
  img={change_from_bar_to_area}
  size='lg'
  border
  alt='Изменение со столбчатой диаграммы на диаграмму с областями'
/>

Заголовки диаграмм соответствуют имени запроса, предоставляющего данные. Обновление имени запроса приведет к обновлению заголовка диаграммы:

<Image img={update_query_name} size='lg' border alt='Обновление имени запроса' />

Ряд дополнительных характеристик диаграммы также можно настроить в разделе 'Advanced' панели настройки диаграммы. Для начала настроим следующие параметры:

- Подзаголовок
- Названия осей
- Ориентация меток для оси X

Диаграмма будет соответствующим образом обновлена:

<Image img={update_subtitle_etc} size='lg' border alt='Обновление подзаголовка и т.д.' />

В некоторых сценариях может потребоваться независимая настройка масштабов осей для каждого поля. Это также можно выполнить в разделе 'Advanced' панели настройки диаграммы, указав минимальные и максимальные значения для диапазона оси. Например, приведенная выше диаграмма выглядит хорошо, но для демонстрации корреляции между полями `trip_total` и `fare_total` диапазоны осей требуют корректировки:

<Image img={adjust_axis_scale} size='lg' border alt='Настройка масштаба осей' />


## Совместное использование запросов {#sharing-queries}

SQL-консоль позволяет делиться запросами с вашей командой. Когда запрос становится общедоступным, все участники команды могут просматривать и редактировать его. Общие запросы — отличный способ совместной работы с командой.

Чтобы поделиться запросом, нажмите кнопку «Share» на панели инструментов запроса.

<Image
  img={sql_console_share}
  size='lg'
  border
  alt='Кнопка Share на панели инструментов запроса'
/>

Откроется диалоговое окно, позволяющее предоставить доступ к запросу всем участникам команды. Если у вас несколько команд, вы можете выбрать, с какой командой поделиться запросом.

<Image
  img={sql_console_edit_access}
  size='lg'
  border
  alt='Диалоговое окно для редактирования доступа к общему запросу'
/>

<Image
  img={sql_console_add_team}
  size='lg'
  border
  alt='Интерфейс для добавления команды к общему запросу'
/>

<Image
  img={sql_console_edit_member}
  size='lg'
  border
  alt='Интерфейс для редактирования доступа участников к общему запросу'
/>

В некоторых сценариях может потребоваться независимая настройка масштабов осей для каждого поля. Это также можно выполнить в разделе «Advanced» панели конфигурации диаграммы, указав минимальные и максимальные значения для диапазона оси. Например, приведенная выше диаграмма выглядит хорошо, но для демонстрации корреляции между полями `trip_total` и `fare_total` необходимо скорректировать диапазоны осей:

<Image
  img={sql_console_access_queries}
  size='lg'
  border
  alt='Раздел «Shared with me» в списке запросов'
/>
