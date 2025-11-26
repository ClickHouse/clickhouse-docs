---
sidebar_label: 'SQL-консоль'
sidebar_position: 1
title: 'SQL-консоль'
slug: /integrations/sql-clients/sql-console
description: 'Подробнее о SQL-консоли'
doc_type: 'guide'
keywords: ['sql-консоль', 'интерфейс для запросов', 'веб-интерфейс', 'sql-редактор', 'облачная консоль']
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

# SQL-консоль

SQL-консоль — самый быстрый и простой способ изучать ваши базы данных и выполнять по ним запросы в ClickHouse Cloud. Вы можете использовать SQL-консоль, чтобы:

- Подключаться к сервисам ClickHouse Cloud
- Просматривать, фильтровать и сортировать данные таблиц
- Выполнять запросы и визуализировать результаты всего за несколько кликов
- Делиться запросами с коллегами по команде и более эффективно сотрудничать.

## Изучение таблиц {#exploring-tables}

### Просмотр списка таблиц и сведений о схеме {#viewing-table-list-and-schema-info}

Общий обзор таблиц, содержащихся в вашем экземпляре ClickHouse, доступен в левой боковой панели. Используйте селектор базы данных в верхней части левой панели, чтобы просмотреть таблицы в конкретной базе данных.

<Image img={table_list_and_schema} size="lg" border alt="Просмотр списка таблиц и схемы, показывающий таблицы базы данных в левой боковой панели"/>

Таблицы в списке можно разворачивать, чтобы просматривать столбцы и их типы.

<Image img={view_columns} size="lg" border alt="Вид развёрнутой таблицы, показывающий имена столбцов и типы данных"/>

### Изучение данных таблицы {#exploring-table-data}

Щёлкните по таблице в списке, чтобы открыть её в новой вкладке. В представлении Table View данные можно легко просматривать, выделять и копировать. Обратите внимание, что структура и форматирование сохраняются при копировании и вставке в табличные приложения, такие как Microsoft Excel и Google Sheets. Вы можете переключаться между страницами данных таблицы (постраничное разбиение по 30 строк) с помощью навигации в нижней части окна.

<Image img={abc} size="lg" border alt="Table View с данными, которые можно выделить и скопировать"/>

### Просмотр данных ячейки {#inspecting-cell-data}

Инструмент Cell Inspector можно использовать для просмотра больших объёмов данных, содержащихся в одной ячейке. Чтобы открыть его, щёлкните правой кнопкой мыши по ячейке и выберите «Inspect Cell». Содержимое Cell Inspector можно скопировать, нажав на значок копирования в правом верхнем углу области содержимого инспектора.

<Image img={inspecting_cell_content} size="lg" border alt="Диалоговое окно инспектора ячеек, показывающее содержимое выбранной ячейки"/>

## Фильтрация и сортировка таблиц {#filtering-and-sorting-tables}

### Сортировка таблицы {#sorting-a-table}

Чтобы отсортировать таблицу в SQL-консоли, откройте таблицу и нажмите кнопку «Sort» на панели инструментов. Откроется меню, в котором вы сможете настроить сортировку. Выберите столбец для сортировки и задайте порядок (по возрастанию или по убыванию). Нажмите «Apply» или Enter, чтобы отсортировать таблицу.

<Image img={sort_descending_on_column} size="lg" border alt="Диалог сортировки с настройкой сортировки по убыванию для столбца"/>

SQL-консоль также позволяет добавить к таблице несколько сортировок. Нажмите кнопку «Sort» ещё раз, чтобы добавить ещё одну сортировку. Примечание: сортировки применяются в том порядке, в котором они отображаются в панели сортировки (сверху вниз). Чтобы удалить сортировку, нажмите кнопку «x» рядом с ней.

### Фильтрация таблицы {#filtering-a-table}

Чтобы отфильтровать таблицу в SQL-консоли, откройте таблицу и нажмите кнопку «Filter». Аналогично сортировке, откроется меню, в котором вы сможете настроить фильтр. Выберите столбец для фильтрации и задайте необходимые критерии. SQL-консоль автоматически предлагает варианты фильтрации, соответствующие типу данных в столбце.

<Image img={filter_on_radio_column_equal_gsm} size="lg" border alt="Диалог фильтрации с настройкой фильтра для radio-столбца со значением GSM"/>

Когда вы будете довольны настройкой фильтра, нажмите «Apply», чтобы отфильтровать данные. Вы также можете добавить дополнительные фильтры, как показано ниже.

<Image img={add_more_filters} size="lg" border alt="Диалог, показывающий, как добавить дополнительный фильтр по диапазону со значением больше 2000"/>

Аналогично сортировке, нажмите кнопку «x» рядом с фильтром, чтобы удалить его.

### Одновременная фильтрация и сортировка {#filtering-and-sorting-together}

SQL-консоль позволяет одновременно фильтровать и сортировать таблицу. Для этого добавьте все необходимые фильтры и сортировки, используя шаги, описанные выше, и нажмите кнопку «Apply».

<Image img={filtering_and_sorting_together} size="lg" border alt="Интерфейс с одновременным применением фильтрации и сортировки"/>

### Создание запроса из фильтров и сортировок {#creating-a-query-from-filters-and-sorts}

SQL-консоль может преобразовать ваши сортировки и фильтры непосредственно в запрос одним нажатием. Просто нажмите кнопку «Create Query» на панели инструментов, используя нужные параметры сортировки и фильтрации. После нажатия «Create query» откроется новая вкладка с запросом, предварительно заполненная SQL-командой, соответствующей данным, отображаемым в текущем представлении таблицы.

<Image img={create_a_query_from_sorts_and_filters} size="lg" border alt="Интерфейс с кнопкой Create Query, которая генерирует SQL из фильтров и сортировок"/>

:::note
Фильтры и сортировки не являются обязательными при использовании функции «Create Query».
:::

Вы можете узнать больше о выполнении запросов в SQL-консоли, прочитав (link) документацию по запросам.



## Создание и выполнение запроса {#creating-and-running-a-query}

### Создание запроса {#creating-a-query}

Существует два способа создать новый запрос в SQL-консоли.

- Нажмите кнопку «+» на панели вкладок
- Выберите кнопку «New Query» в списке запросов на левой боковой панели

<Image img={creating_a_query} size="lg" border alt="Интерфейс, показывающий, как создать новый запрос с помощью кнопки + или кнопки New Query"/>

### Выполнение запроса {#running-a-query}

Чтобы выполнить запрос, введите SQL-команду (или команды) в SQL Editor и нажмите кнопку «Run» или используйте сочетание клавиш `cmd / ctrl + enter`. Чтобы писать и выполнять несколько команд последовательно, не забудьте добавить точку с запятой после каждой команды.

Параметры выполнения запроса  
По умолчанию нажатие кнопки «Run» выполнит все команды, содержащиеся в SQL Editor. SQL-консоль поддерживает ещё два варианта выполнения запроса:

- Выполнить выделенную команду (команды)
- Выполнить команду под курсором

Чтобы выполнить выделенную команду (или команды), выделите нужную команду или последовательность команд и нажмите кнопку «Run» (или используйте сочетание клавиш `cmd / ctrl + enter`). Вы также можете выбрать пункт «Run selected» в контекстном меню SQL Editor (открывается щелчком правой кнопкой мыши в любой части редактора), когда есть выделение.

<Image img={run_selected_query} size="lg" border alt="Интерфейс, показывающий, как выполнить выделенную часть SQL-запроса"/>

Выполнить команду в позиции текущего курсора можно двумя способами:

- Выберите пункт «At Cursor» в расширенном меню параметров выполнения (или используйте соответствующее сочетание клавиш `cmd / ctrl + shift + enter`)

<Image img={run_at_cursor_2} size="lg" border alt="Пункт Run at cursor в расширенном меню параметров выполнения"/>

- Выберите пункт «Run at cursor» в контекстном меню SQL Editor

<Image img={run_at_cursor} size="lg" border alt="Пункт Run at cursor в контекстном меню SQL Editor"/>

:::note
Команда в позиции курсора при выполнении кратковременно подсвечивается жёлтым цветом.
:::

### Отмена запроса {#canceling-a-query}

Во время выполнения запроса кнопка «Run» на панели инструментов Query Editor будет заменена на кнопку «Cancel». Просто нажмите эту кнопку или клавишу `Esc`, чтобы отменить запрос. Примечание: любые результаты, которые уже были возвращены, сохранятся после отмены.

<Image img={cancel_a_query} size="lg" border alt="Кнопка Cancel, появляющаяся во время выполнения запроса"/>

### Сохранение запроса {#saving-a-query}

Если запрос ранее не был переименован, по умолчанию он называется «Untitled Query». Нажмите на имя запроса, чтобы изменить его. Переименование запроса приведёт к его сохранению.

<Image img={give_a_query_a_name} size="lg" border alt="Интерфейс, показывающий, как переименовать запрос с названия Untitled Query"/>

Вы также можете использовать кнопку сохранения или сочетание клавиш `cmd / ctrl + s` для сохранения запроса.

<Image img={save_the_query} size="lg" border alt="Кнопка сохранения на панели инструментов редактора запросов"/>

## Использование GenAI для управления запросами {#using-genai-to-manage-queries}

Эта функция позволяет пользователям писать запросы в виде вопросов на естественном языке, а консоль запросов будет создавать SQL‑запросы на основе контекста доступных таблиц. GenAI также может помогать пользователям отлаживать их запросы.

Для получения дополнительной информации о GenAI см. запись в блоге [Announcing GenAI powered query suggestions in ClickHouse Cloud blog post](https://clickhouse.com/blog/announcing-genai-powered-query-suggestions-clickhouse-cloud).

### Настройка таблицы {#table-setup}

Давайте импортируем пример набора данных UK Price Paid и используем его для создания некоторых запросов GenAI.

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

   Выполнение этого запроса должно занять около 1 секунды. После завершения у вас должна появиться пустая таблица с именем `uk_price_paid`.

1. Создайте новый запрос и вставьте следующий запрос:

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

Этот запрос загружает набор данных с сайта `gov.uk`. Размер файла около 4 ГБ, поэтому выполнение запроса займет несколько минут. После того как ClickHouse обработает запрос, весь набор данных будет находиться в таблице `uk_price_paid`.

#### Создание запроса {#query-creation}

Давайте создадим запрос, используя естественный язык.

1. Выберите таблицу **uk_price_paid**, затем нажмите **Create Query**.
1. Нажмите **Generate SQL**. Вас могут попросить подтвердить, что ваши запросы отправляются в ChatGPT. Чтобы продолжить, необходимо выбрать **I agree**.
1. Теперь вы можете использовать это поле, чтобы вводить запрос на естественном языке и позволить ChatGPT преобразовать его в SQL‑запрос. В этом примере мы введем:

   > Покажи мне общую сумму цен и общее количество всех транзакций uk_price_paid по годам.

1. Консоль сгенерирует нужный нам запрос и отобразит его в новой вкладке. В нашем примере GenAI создал следующий запрос:

   ```sql
   -- Покажи мне общую сумму цен и общее количество всех транзакций uk_price_paid по годам.
   SELECT year(date), sum(price) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. После того как вы убедились, что запрос корректен, нажмите **Run** для его выполнения.

### Отладка {#debugging}

Теперь давайте протестируем возможности GenAI по отладке запросов.

1. Создайте новый запрос, нажав на значок _+_, и вставьте следующий код:



```sql
   -- Показать общую стоимость и общее количество всех транзакций uk_price_paid по годам.
   SELECT year(date), sum(pricee) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
```

1. Нажмите **Run**. Запрос завершится с ошибкой, так как мы пытаемся получить значения из `pricee` вместо `price`.
2. Нажмите **Fix Query**.
3. GenAI попытается исправить запрос. В данном случае он заменил `pricee` на `price`, а также определил, что `toYear` — более подходящая функция в этом сценарии.
4. Выберите **Apply**, чтобы добавить предложенные изменения в запрос, и нажмите **Run**.

Помните, что GenAI — экспериментальная функция. Будьте осторожны при выполнении запросов, сгенерированных GenAI, для любых наборов данных.


## Расширенные возможности выполнения запросов {#advanced-querying-features}

### Поиск по результатам запроса {#searching-query-results}

После выполнения запроса вы можете быстро выполнить поиск по полученному набору результатов, используя поле поиска в панели результатов. Эта функция помогает просматривать результаты дополнительного условия `WHERE` или просто проверять, что в набор результатов включены определённые данные. После ввода значения в поле поиска панель результатов обновится и вернёт записи, содержащие вхождение, совпадающее с введённым значением. В этом примере мы найдём все упоминания `breakfast` в таблице `hackernews` среди комментариев, которые содержат `ClickHouse` (без учёта регистра):

<Image img={search_hn} size="lg" border alt="Поиск данных Hacker News"/>

Примечание: Будут возвращены любые поля, содержащие введённое значение. Например, третья запись на приведённом выше скриншоте не содержит 'breakfast' в поле `by`, но содержит его в поле `text`:

<Image img={match_in_body} size="lg" border alt="Совпадение в тексте сообщения"/>

### Настройка параметров разбивки на страницы {#adjusting-pagination-settings}

По умолчанию панель результатов запроса отображает все записи на одной странице. Для больших наборов результатов может быть удобнее включить постраничный просмотр. Это можно сделать с помощью селектора разбивки на страницы в правом нижнем углу панели результатов:

<Image img={pagination} size="lg" border alt="Параметры разбивки на страницы"/>

После выбора размера страницы к набору результатов сразу будет применена разбивка на страницы, а в центральной части нижней панели результатов появятся элементы навигации.

<Image img={pagination_nav} size="lg" border alt="Навигация по страницам"/>

### Экспорт данных результатов запроса {#exporting-query-result-data}

Наборы результатов запроса можно легко экспортировать в формат CSV непосредственно из SQL-консоли. Для этого откройте меню `•••` в правой части панели инструментов области результатов и выберите «Download as CSV».

<Image img={download_as_csv} size="lg" border alt="Скачать как CSV"/>



## Визуализация данных запроса

Некоторые данные проще интерпретировать в виде диаграмм. Вы можете быстро создавать визуализации на основе результатов запросов прямо из SQL-консоли всего за несколько кликов. В качестве примера мы используем запрос, который вычисляет еженедельную статистику поездок на такси в Нью-Йорке:

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

<Image img={tabular_query_results} size="lg" border alt="Табличные результаты запроса" />

Без визуализации эти результаты трудно интерпретировать. Преобразуем их в график.

### Создание графиков

Чтобы начать построение визуализации, выберите параметр «Chart» на панели инструментов области результатов запроса. Появится панель настройки графика:

<Image img={switch_from_query_to_chart} size="lg" border alt="Переключение с запроса на график" />

Мы начнём с создания простого столбчатого графика, показывающего `trip_total` по `week`. Для этого перетащим поле `week` на ось x, а поле `trip_total` — на ось y:

<Image img={trip_total_by_week} size="lg" border alt="Общая стоимость поездки по неделям" />

Большинство типов графиков поддерживают несколько полей на числовых осях. Для демонстрации перетащим поле `fare_total` на ось y:

<Image img={bar_chart} size="lg" border alt="Столбчатый график" />

### Настройка графиков

SQL-консоль поддерживает десять типов графиков, которые можно выбрать в селекторе типа графика на панели настройки графика. Например, мы можем легко изменить предыдущий тип графика со столбчатого (Bar) на областной (Area):

<Image img={change_from_bar_to_area} size="lg" border alt="Изменение столбчатого графика на областной" />

Заголовки графиков соответствуют имени запроса, который предоставляет данные. Изменение имени запроса приведёт к обновлению заголовка графика:

<Image img={update_query_name} size="lg" border alt="Обновление имени запроса" />

Ряд более продвинутых характеристик графика также можно настроить в разделе «Advanced» панели настройки графика. Для начала изменим следующие параметры:

* Подзаголовок
* Заголовки осей
* Ориентация подписей для оси x

Наш график будет обновлён соответствующим образом:

<Image img={update_subtitle_etc} size="lg" border alt="Обновление подзаголовка и других параметров" />

В некоторых случаях может потребоваться настроить масштабы осей для каждого поля независимо. Это также можно сделать в разделе «Advanced» панели настройки графика, указав минимальные и максимальные значения для диапазона оси. В качестве примера: приведённый выше график выглядит хорошо, но для демонстрации корреляции между полями `trip_total` и `fare_total` диапазоны осей требуют некоторой корректировки:

<Image img={adjust_axis_scale} size="lg" border alt="Настройка масштаба осей" />


## Совместное использование запросов {#sharing-queries}

Консоль SQL позволяет делиться запросами с вашей командой. Когда запрос становится общим, все участники команды могут просматривать и изменять его. Общие запросы — отличный способ совместной работы с вашей командой.

Чтобы поделиться запросом, нажмите кнопку «Share» на панели инструментов запроса.

<Image img={sql_console_share} size="lg" border alt="Кнопка «Share» на панели инструментов запроса"/>

Откроется диалоговое окно, в котором вы можете поделиться запросом со всеми участниками команды. Если у вас несколько команд, вы можете выбрать, с какой командой поделиться запросом.

<Image img={sql_console_edit_access} size="lg" border alt="Диалоговое окно редактирования доступа к общему запросу"/>

<Image img={sql_console_add_team} size="lg" border alt="Интерфейс добавления команды к общему запросу"/>

<Image img={sql_console_edit_member} size="lg" border alt="Интерфейс редактирования доступа участника к общему запросу"/>

В некоторых случаях может потребоваться настроить масштаб осей для каждого поля отдельно. Это также можно сделать в разделе «Advanced» панели настроек графика, указав минимальные и максимальные значения для диапазона оси. Например, приведённый выше график выглядит хорошо, но для демонстрации корреляции между полями `trip_total` и `fare_total` диапазоны осей нужно немного скорректировать:

<Image img={sql_console_access_queries} size="lg" border alt="Раздел «Shared with me» в списке запросов"/>
