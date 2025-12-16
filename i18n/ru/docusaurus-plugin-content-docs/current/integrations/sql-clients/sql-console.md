---
sidebar_label: 'SQL Console'
sidebar_position: 1
title: 'SQL Console'
slug: /integrations/sql-clients/sql-console
description: 'Узнайте больше о SQL Console'
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


# SQL Console {#sql-console}

SQL console — это самый быстрый и простой способ исследовать базы данных и выполнять запросы к ним в ClickHouse Cloud. Вы можете использовать SQL console, чтобы:

- Подключаться к своим сервисам ClickHouse Cloud
- Просматривать, фильтровать и сортировать данные таблиц
- Выполнять запросы и визуализировать результаты всего в несколько кликов
- Делиться запросами с участниками команды и эффективнее сотрудничать

## Обзор таблиц {#exploring-tables}

### Просмотр списка таблиц и сведений о схеме {#viewing-table-list-and-schema-info}

Общий обзор таблиц, содержащихся в вашем экземпляре ClickHouse, отображается в левой боковой панели. Используйте селектор базы данных в верхней части этой панели, чтобы просматривать таблицы в выбранной базе данных.

<Image img={table_list_and_schema} size="lg" border alt="Просмотр списка таблиц и схемы, показывающий таблицы базы данных в левой боковой панели"/>

Таблицы в списке также можно развернуть, чтобы просматривать столбцы и их типы.

<Image img={view_columns} size="lg" border alt="Вид развернутой таблицы с именами столбцов и типами данных"/>

### Исследование данных таблицы {#exploring-table-data}

Щёлкните таблицу в списке, чтобы открыть её в новой вкладке. В режиме Table View данные можно легко просматривать, выделять и копировать. Обратите внимание, что структура и форматирование сохраняются при копировании и вставке в табличные редакторы, такие как Microsoft Excel и Google Sheets. Вы можете переключаться между страницами данных таблицы (постраничное отображение, шаг — 30 строк) с помощью навигации в нижней части страницы.

<Image img={abc} size="lg" border alt="Представление таблицы с данными, которые можно выделять и копировать"/>

### Просмотр данных ячейки {#inspecting-cell-data}

Инструмент Cell Inspector можно использовать для просмотра большого объёма данных, содержащихся в одной ячейке. Чтобы открыть его, щёлкните правой кнопкой мыши по ячейке и выберите «Inspect Cell». Содержимое инспектора ячеек можно скопировать, нажав на значок копирования в правом верхнем углу окна инспектора.

<Image img={inspecting_cell_content} size="lg" border alt="Диалоговое окно инспектора ячеек, показывающее содержимое выбранной ячейки"/>

## Фильтрация и сортировка таблиц {#filtering-and-sorting-tables}

### Сортировка таблицы {#sorting-a-table}

Чтобы отсортировать таблицу в SQL-консоли, откройте таблицу и нажмите кнопку «Sort» на панели инструментов. Откроется меню, в котором вы сможете настроить сортировку: выбрать столбец и задать порядок сортировки (по возрастанию или по убыванию). Нажмите «Apply» или клавишу Enter, чтобы отсортировать таблицу.

<Image img={sort_descending_on_column} size="lg" border alt="Диалог сортировки с настройкой сортировки по убыванию по столбцу"/>

SQL-консоль также позволяет добавлять к таблице несколько критериев сортировки. Нажмите кнопку «Sort» ещё раз, чтобы добавить ещё один критерий. Примечание: сортировки применяются в том порядке, в котором они отображаются в области сортировки (сверху вниз). Чтобы удалить сортировку, нажмите кнопку «x» рядом с соответствующей строкой.

### Фильтрация таблицы {#filtering-a-table}

Чтобы отфильтровать таблицу в консоли SQL, откройте таблицу и нажмите кнопку 'Filter'. Аналогично сортировке, эта кнопка откроет меню, в котором вы сможете настроить фильтр. Вы можете выбрать столбец, по которому нужно фильтровать, и задать необходимые критерии. Консоль SQL автоматически подбирает варианты фильтрации, соответствующие типу данных в выбранном столбце.

<Image img={filter_on_radio_column_equal_gsm} size="lg" border alt="Диалог фильтрации с настройкой фильтрации столбца с переключателями (radio) по значению, равному GSM"/>

Когда результат фильтрации вас устраивает, нажмите 'Apply', чтобы применить фильтр к данным. Вы также можете добавить дополнительные фильтры, как показано ниже.

<Image img={add_more_filters} size="lg" border alt="Диалог, показывающий, как добавить дополнительный фильтр по диапазону значений больше 2000"/>

Аналогично сортировке, нажмите кнопку 'x' рядом с фильтром, чтобы удалить его.

### Одновременная фильтрация и сортировка {#filtering-and-sorting-together}

SQL-консоль позволяет одновременно фильтровать и сортировать таблицу. Для этого добавьте все необходимые фильтры и параметры сортировки, используя шаги, описанные выше, и нажмите кнопку «Apply».

<Image img={filtering_and_sorting_together} size="lg" border alt="Интерфейс, в котором одновременно применены фильтрация и сортировка"/>

### Создание запроса из фильтров и сортировок {#creating-a-query-from-filters-and-sorts}

SQL-консоль может одним щелчком мыши преобразовать ваши сортировки и фильтры непосредственно в запросы. Просто выберите кнопку 'Create Query' на панели инструментов с нужными вам параметрами сортировки и фильтрации. После нажатия 'Create Query' откроется новая вкладка запроса, заранее заполненная SQL-командой, соответствующей данным, отображаемым в представлении вашей таблицы.

<Image img={create_a_query_from_sorts_and_filters} size="lg" border alt="Интерфейс с кнопкой Create Query, которая генерирует SQL из фильтров и сортировок"/>

:::note
Фильтры и сортировки не являются обязательными при использовании функции 'Create Query'.
:::

Дополнительные сведения о выполнении запросов в консоли SQL см. в (link) документации по запросам.

## Создание и запуск запроса {#creating-and-running-a-query}

### Создание запроса {#creating-a-query}

Существует два способа создать новый запрос в SQL-консоли.

- Нажмите кнопку «+» на панели вкладок
- Нажмите кнопку «New Query» в списке запросов на левой боковой панели

<Image img={creating_a_query} size="lg" border alt="Интерфейс, показывающий, как создать новый запрос с помощью кнопки «+» или кнопки «New Query»"/>

### Выполнение запроса {#running-a-query}

Чтобы выполнить запрос, введите одну или несколько SQL-команд в SQL Editor и нажмите кнопку «Run» или используйте сочетание клавиш `cmd / ctrl + enter`. Чтобы записать и выполнить несколько команд последовательно, обязательно добавляйте точку с запятой после каждой команды.

Параметры выполнения запроса  
По умолчанию при нажатии кнопки «Run» будут выполнены все команды, содержащиеся в SQL Editor. SQL console поддерживает ещё два варианта выполнения запросов:

- Выполнить выделенную команду (или команды)
- Выполнить команду в позиции курсора

Чтобы выполнить выделенную команду или последовательность команд, выделите нужный фрагмент и нажмите кнопку «Run» (или используйте сочетание `cmd / ctrl + enter`). Также можно выбрать «Run selected» в контекстном меню SQL Editor (открывается по щелчку правой кнопкой мыши в любом месте редактора), когда что-то выделено.

<Image img={run_selected_query} size="lg" border alt="Интерфейс, показывающий, как выполнить выделенную часть SQL-запроса"/>

Выполнение команды в текущей позиции курсора можно осуществить двумя способами:

- Выбрать «At Cursor» в расширенном меню параметров запуска (или воспользоваться соответствующим сочетанием клавиш `cmd / ctrl + shift + enter`)

<Image img={run_at_cursor_2} size="lg" border alt="Опция Run at cursor в расширенном меню параметров запуска"/>

- Выбрать «Run at cursor» в контекстном меню SQL Editor

<Image img={run_at_cursor} size="lg" border alt="Опция Run at cursor в контекстном меню SQL Editor"/>

:::note
Команда, находящаяся в позиции курсора, при выполнении кратковременно подсветится жёлтым цветом.
:::

### Отмена запроса {#canceling-a-query}

Во время выполнения запроса кнопка "Run" на панели инструментов редактора запросов заменяется кнопкой "Cancel". Нажмите эту кнопку или клавишу `Esc`, чтобы отменить запрос. Обратите внимание: все результаты, которые уже были возвращены, сохранятся после отмены.

<Image img={cancel_a_query} size="lg" border alt="Кнопка Cancel, которая отображается во время выполнения запроса"/>

### Сохранение запроса {#saving-a-query}

Если имя запроса ранее не задавалось, он будет называться «Untitled Query». Нажмите на имя запроса, чтобы изменить его. Переименование запроса автоматически сохранит его.

<Image img={give_a_query_a_name} size="lg" border alt="Интерфейс, показывающий, как переименовать запрос с «Untitled Query»"/>

Вы также можете использовать кнопку сохранения или сочетание клавиш `Cmd/Ctrl+S`, чтобы сохранить запрос.

<Image img={save_the_query} size="lg" border alt="Кнопка сохранения на панели инструментов редактора запросов"/>

## Использование GenAI для управления запросами {#using-genai-to-manage-queries}

Эта функция позволяет формулировать запросы в виде вопросов на естественном языке, после чего консоль запросов создаст SQL‑запросы на основе контекста доступных таблиц. GenAI также может помочь с отладкой ваших запросов.

Дополнительные сведения о GenAI см. в записи блога [Announcing GenAI powered query suggestions in ClickHouse Cloud](https://clickhouse.com/blog/announcing-genai-powered-query-suggestions-clickhouse-cloud).

### Настройка таблицы {#table-setup}

Импортируем пример набора данных UK Price Paid и используем его для создания нескольких запросов с GenAI.

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

1. Создайте новый запрос и вставьте в него следующий запрос:

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

Этот запрос загружает набор данных с веб-сайта `gov.uk`. Размер файла составляет примерно 4 ГБ, поэтому выполнение запроса займет несколько минут. После того как ClickHouse обработает запрос, весь набор данных будет находиться в таблице `uk_price_paid`.

#### Создание запроса {#query-creation}

Давайте создадим запрос, используя естественный язык.

1. Выберите таблицу **uk_price_paid**, затем нажмите **Create Query**.
1. Нажмите **Generate SQL**. Возможно, вам будет предложено согласиться с тем, что ваши запросы будут отправляться в ChatGPT. Чтобы продолжить, необходимо выбрать **I agree**.
1. Теперь вы можете использовать этот prompt, чтобы ввести запрос на естественном языке и позволить ChatGPT преобразовать его в SQL-запрос. В этом примере мы введём:

   > Покажите мне общую сумму и общее количество всех транзакций uk_price_paid по годам.

1. Консоль сгенерирует нужный нам запрос и отобразит его в новой вкладке. В нашем примере GenAI сгенерировала следующий запрос:

   ```sql
   -- Show me the total price and total number of all uk_price_paid transactions by year.
   SELECT year(date), sum(price) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. После того как вы убедились, что запрос корректен, нажмите **Run** для его выполнения.

### Отладка {#debugging}

Теперь протестируем возможности отладки запросов в GenAI.

1. Создайте новый запрос, нажав на значок _+_, и вставьте следующий код:

   ```sql
   -- Покажи мне общую стоимость и общее количество всех транзакций uk_price_paid по годам.
   SELECT year(date), sum(pricee) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. Нажмите **Run**. Запрос завершится с ошибкой, так как мы пытаемся получить значения из `pricee` вместо `price`.
1. Нажмите **Fix Query**.
1. GenAI попытается исправить запрос. В этом случае он изменит `pricee` на `price`. Он также определит, что `toYear` — более подходящая функция для этого сценария.
1. Выберите **Apply**, чтобы добавить предложенные изменения в запрос, и нажмите **Run**.

Помните, что GenAI — экспериментальная функция. Будьте осторожны при выполнении запросов, сгенерированных GenAI, для любых наборов данных.

## Расширенные возможности выполнения запросов {#advanced-querying-features}

### Поиск в результатах запроса {#searching-query-results}

После выполнения запроса вы можете быстро искать по возвращённому набору результатов, используя поле поиска в панели результатов. Эта функция помогает просматривать результаты дополнительного условия `WHERE` или просто проверять, что определённые данные присутствуют в наборе результатов. После ввода значения в поле поиска панель результатов обновится и вернёт записи, содержащие вхождение, совпадающее с введённым значением. В этом примере мы будем искать все вхождения `breakfast` в таблице `hackernews` в комментариях, которые содержат `ClickHouse` (без учёта регистра):

<Image img={search_hn} size="lg" border alt="Поиск данных Hacker News"/>

Примечание: Будет возвращено любое поле, значение которого совпадает с введённым. Например, третья запись на скриншоте выше не содержит `breakfast` в поле `by`, но содержит его в поле `text`:

<Image img={match_in_body} size="lg" border alt="Совпадение в тексте сообщения"/>

### Настройка параметров постраничного отображения {#adjusting-pagination-settings}

По умолчанию панель результатов запроса отображает все записи на одной странице. Для больших наборов результатов может быть удобнее разбить их на страницы. Это можно сделать с помощью селектора постраничного отображения в правом нижнем углу панели результатов:

<Image img={pagination} size="lg" border alt="Настройки постраничного отображения"/>

Выбор размера страницы немедленно применит постраничное отображение к набору результатов, и по центру нижней панели результатов появятся элементы навигации:

<Image img={pagination_nav} size="lg" border alt="Постраничная навигация"/>

### Экспорт данных результатов запросов {#exporting-query-result-data}

Результаты запросов можно легко экспортировать в формат CSV непосредственно из SQL-консоли. Для этого откройте меню `•••` в правой части панели результатов и выберите «Download as CSV».

<Image img={download_as_csv} size="lg" border alt="Загрузка как CSV"/>

## Визуализация данных запроса {#visualizing-query-data}

Часть данных удобнее анализировать в виде диаграмм. Вы можете быстро создавать визуализации на основе результатов запроса прямо в SQL-консоли всего за несколько кликов. В качестве примера мы используем запрос, который вычисляет недельную статистику по поездкам такси в Нью-Йорке:

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

Без визуализации эти результаты сложно интерпретировать. Давайте построим по ним график.


### Создание диаграмм {#creating-charts}

Чтобы начать построение визуализации, выберите опцию «Chart» на панели инструментов области результатов запроса. Откроется панель настройки диаграммы:

<Image img={switch_from_query_to_chart} size="lg" border alt="Переключение от запроса к диаграмме"/>

Начнем с создания простой столбчатой диаграммы, отображающей `trip_total` по `week`. Для этого перетащите поле `week` на ось X, а поле `trip_total` — на ось Y:

<Image img={trip_total_by_week} size="lg" border alt="Сумма поездок по неделям"/>

Большинство типов диаграмм поддерживает несколько полей на числовых осях. Чтобы продемонстрировать это, перетащим поле `fare_total` на ось Y:

<Image img={bar_chart} size="lg" border alt="Столбчатая диаграмма"/>

### Настройка диаграмм {#customizing-charts}

Консоль SQL поддерживает десять типов диаграмм, которые можно выбрать в панели настройки диаграммы в селекторе типа. Например, мы можем легко изменить предыдущий тип диаграммы с Bar на Area:

<Image img={change_from_bar_to_area} size="lg" border alt="Смена диаграммы Bar на Area"/>

Заголовки диаграмм совпадают с названием запроса, который поставляет данные. Изменение имени запроса приведёт к автоматическому обновлению заголовка диаграммы:

<Image img={update_query_name} size="lg" border alt="Обновление имени запроса"/>

Ряд более продвинутых параметров диаграммы также можно настроить в разделе «Advanced» панели настройки диаграммы. Для начала изменим следующие настройки:

- Subtitle
- Axis titles
- Label orientation for the x-axis

Диаграмма будет обновлена соответствующим образом:

<Image img={update_subtitle_etc} size="lg" border alt="Обновление подзаголовка и др."/>

В некоторых случаях может потребоваться настроить шкалы осей для каждого поля отдельно. Это также можно сделать в разделе «Advanced» панели настройки диаграммы, указав минимальные и максимальные значения диапазона оси. Например, приведённая выше диаграмма выглядит хорошо, но для демонстрации корреляции между полями `trip_total` и `fare_total` диапазоны осей нужно немного скорректировать:

<Image img={adjust_axis_scale} size="lg" border alt="Настройка масштаба оси"/>

## Совместное использование запросов {#sharing-queries}

Консоль SQL позволяет делиться запросами со своей командой. Когда запрос открыт для совместного использования, все участники команды могут просматривать и редактировать этот запрос. Общие запросы — отличный способ совместной работы с командой.

Чтобы поделиться запросом, нажмите кнопку «Share» на панели инструментов запроса.

<Image img={sql_console_share} size="lg" border alt="Кнопка Share на панели инструментов запроса"/>

Откроется диалоговое окно, в котором вы сможете поделиться запросом со всеми участниками команды. Если у вас несколько команд, вы можете выбрать, с какой именно командой поделиться запросом.

<Image img={sql_console_edit_access} size="lg" border alt="Диалоговое окно редактирования доступа к общему запросу"/>

<Image img={sql_console_add_team} size="lg" border alt="Интерфейс добавления команды к общему запросу"/>

<Image img={sql_console_edit_member} size="lg" border alt="Интерфейс редактирования доступа участника к общему запросу"/>

В некоторых случаях может потребоваться независимо настроить шкалы осей для каждого поля. Это также можно сделать в разделе «Advanced» панели настройки диаграммы, указав минимальные и максимальные значения диапазона оси. Например, приведённая выше диаграмма выглядит неплохо, но для демонстрации корреляции между полями `trip_total` и `fare_total` диапазоны осей нужно немного скорректировать:

<Image img={sql_console_access_queries} size="lg" border alt="Раздел Shared with me в списке запросов"/>