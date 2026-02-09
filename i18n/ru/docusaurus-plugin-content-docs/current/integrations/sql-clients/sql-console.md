---
sidebar_label: 'SQL-консоль'
sidebar_position: 1
title: 'SQL-консоль'
slug: /integrations/sql-clients/sql-console
description: 'Подробнее о SQL-консоли'
doc_type: 'guide'
keywords: ['sql console', 'интерфейс запросов', 'веб-интерфейс', 'редактор SQL', 'облачная консоль']
integration:
   - support_level: 'community'
   - category: 'sql_client'
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

# SQL Console \{#sql-console\}

SQL-консоль — самый быстрый и простой способ изучать ваши базы данных и выполнять запросы в ClickHouse Cloud. Вы можете использовать SQL-консоль, чтобы:

- Подключаться к сервисам ClickHouse Cloud
- Просматривать, фильтровать и сортировать данные таблиц
- Выполнять запросы и визуализировать результаты всего в несколько кликов
- Делиться запросами с членами команды и более эффективно взаимодействовать.

## Изучение таблиц \{#exploring-tables\}

### Просмотр списка таблиц и информации о схеме \{#viewing-table-list-and-schema-info\}

Обзор таблиц, содержащихся в экземпляре ClickHouse, доступен в левой боковой панели. Используйте селектор базы данных в верхней части этой панели, чтобы просматривать таблицы в конкретной базе данных.

<Image img={table_list_and_schema} size="lg" border alt="Просмотр списка таблиц и схемы, показывающий таблицы баз данных в левой боковой панели"/>

Таблицы в списке также можно развернуть, чтобы просмотреть столбцы и их типы.

<Image img={view_columns} size="lg" border alt="Вид развернутой таблицы, показывающий имена столбцов и типы данных"/>

### Изучение данных таблицы \{#exploring-table-data\}

Щёлкните таблицу в списке, чтобы открыть её в новой вкладке. В представлении Table View данные можно легко просматривать, выделять и копировать. Обратите внимание, что структура и форматирование сохраняются при копировании и вставке в табличные приложения, такие как Microsoft Excel и Google Sheets. Вы можете переключаться между страницами данных таблицы (по 30 строк на страницу) с помощью навигации в нижней части экрана.

<Image img={abc} size="lg" border alt="Представление таблицы с данными, которые можно выделять и копировать"/>

### Просмотр данных ячейки \{#inspecting-cell-data\}

Инструмент Cell Inspector можно использовать для просмотра больших объемов данных, содержащихся в одной ячейке. Чтобы открыть его, щелкните правой кнопкой мыши по ячейке и выберите «Inspect Cell». Содержимое Cell Inspector можно скопировать, нажав значок копирования в правом верхнем углу окна инспектора.

<Image img={inspecting_cell_content} size="lg" border alt="Диалоговое окно инспектора ячейки, показывающее содержимое выбранной ячейки"/>

## Фильтрация и сортировка таблиц \{#filtering-and-sorting-tables\}

### Сортировка таблицы \{#sorting-a-table\}

Чтобы отсортировать таблицу в SQL-консоли, откройте таблицу и нажмите кнопку 'Sort' на панели инструментов. Откроется меню, в котором можно настроить параметры сортировки. Вы можете выбрать столбец, по которому будет выполняться сортировка, и задать порядок сортировки (по возрастанию или по убыванию). Нажмите 'Apply' или клавишу Enter, чтобы отсортировать таблицу.

<Image img={sort_descending_on_column} size="lg" border alt="Диалог сортировки с настройкой сортировки столбца по убыванию"/>

SQL-консоль также позволяет добавить к таблице несколько условий сортировки. Нажмите кнопку 'Sort' ещё раз, чтобы добавить ещё одно условие. Обратите внимание: сортировки применяются в том порядке, в котором они указаны в панели сортировки (сверху вниз). Чтобы удалить сортировку, нажмите кнопку 'x' рядом с соответствующим условием.

### Фильтрация таблицы \{#filtering-a-table\}

Чтобы отфильтровать таблицу в SQL-консоли, откройте таблицу и нажмите кнопку `Filter`. Как и при сортировке, эта кнопка откроет меню, в котором вы сможете настроить фильтр. Вы можете выбрать столбец, по которому будет выполняться фильтрация, и задать необходимые критерии. SQL-консоль автоматически предлагает варианты фильтрации, соответствующие типу данных в столбце.

<Image img={filter_on_radio_column_equal_gsm} size="lg" border alt="Диалог фильтрации с настройкой фильтрации по столбцу с типом radio со значением, равным GSM"/>

Когда результат фильтрации вас устраивает, нажмите `Apply`, чтобы применить фильтр к данным. Вы также можете добавить дополнительные фильтры, как показано ниже.

<Image img={add_more_filters} size="lg" border alt="Диалог, показывающий, как добавить дополнительный фильтр по диапазону со значением больше 2000"/>

Как и при сортировке, нажмите кнопку `x` рядом с фильтром, чтобы удалить его.

### Одновременная фильтрация и сортировка \{#filtering-and-sorting-together\}

Консоль SQL позволяет одновременно фильтровать и сортировать таблицу. Для этого добавьте все нужные фильтры и сортировки с помощью описанных выше шагов и нажмите кнопку «Apply».

<Image img={filtering_and_sorting_together} size="lg" border alt="Интерфейс, в котором одновременно применены фильтрация и сортировка"/>

### Создание запроса из фильтров и сортировок \{#creating-a-query-from-filters-and-sorts\}

SQL-консоль может преобразовать ваши сортировки и фильтры непосредственно в SQL-запрос одним кликом. Просто нажмите кнопку «Create Query» на панели инструментов с нужными вам параметрами сортировки и фильтрации. После нажатия «Create Query» откроется новая вкладка запроса, уже заполненная SQL-командой, соответствующей данным, отображаемым в вашем табличном представлении.

<Image img={create_a_query_from_sorts_and_filters} size="lg" border alt="Интерфейс с кнопкой Create Query, которая генерирует SQL из фильтров и сортировок"/>

:::note
Фильтры и сортировки не являются обязательными при использовании функции «Create Query».
:::

Вы можете узнать больше о выполнении запросов в SQL-консоли, прочитав документацию по запросам (link).

## Создание и выполнение запроса \{#creating-and-running-a-query\}

### Создание запроса \{#creating-a-query\}

В SQL-консоли есть два способа создать новый запрос:

- Нажмите кнопку «+» на панели вкладок
- Выберите кнопку «New Query» в списке запросов на левой боковой панели

<Image img={creating_a_query} size="lg" border alt="Интерфейс, показывающий, как создать новый запрос с помощью кнопки + или кнопки New Query"/>

### Выполнение запроса \{#running-a-query\}

Чтобы выполнить запрос, введите SQL-команду (или несколько команд) в SQL Editor и нажмите кнопку «Run» или используйте сочетание клавиш `cmd / ctrl + enter`. Чтобы писать и выполнять несколько команд последовательно, обязательно добавляйте точку с запятой после каждой команды.

Параметры выполнения запроса  
По умолчанию нажатие кнопки «Run» выполнит все команды, содержащиеся в SQL Editor. SQL-консоль поддерживает ещё два варианта выполнения запроса:

- Выполнить выделенную команду (или команды)
- Выполнить команду в позиции курсора

Чтобы выполнить выделенную команду (или команды), выделите нужную команду или последовательность команд и нажмите кнопку «Run» (или используйте сочетание клавиш `cmd / ctrl + enter`). Вы также можете выбрать «Run selected» в контекстном меню SQL Editor (открывается по щелчку правой кнопкой мыши в любом месте редактора), когда есть выделение.

<Image img={run_selected_query} size="lg" border alt="Интерфейс, показывающий, как выполнить выделенную часть SQL-запроса"/>

Выполнить команду в текущей позиции курсора можно двумя способами:

- Выбрать «At Cursor» в расширенном меню параметров выполнения (или использовать соответствующее сочетание клавиш `cmd / ctrl + shift + enter`)

<Image img={run_at_cursor_2} size="lg" border alt="Опция Run at cursor в расширенном меню параметров выполнения"/>

- Выбрать «Run at cursor» в контекстном меню SQL Editor

<Image img={run_at_cursor} size="lg" border alt="Опция Run at cursor в контекстном меню SQL Editor"/>

:::note
Команда, находящаяся в позиции курсора, при выполнении кратковременно подсвечивается жёлтым цветом.
:::

### Отмена запроса \{#canceling-a-query\}

Во время выполнения запроса кнопка Run на панели инструментов Query Editor будет заменена на кнопку Cancel. Нажмите эту кнопку или клавишу `Esc`, чтобы отменить запрос. Обратите внимание: все результаты, которые уже были возвращены, сохранятся после отмены.

<Image img={cancel_a_query} size="lg" border alt="Кнопка Cancel, отображаемая во время выполнения запроса"/>

### Сохранение запроса \{#saving-a-query\}

Если ранее запрос не был назван, он будет называться `Untitled Query`. Нажмите на имя запроса, чтобы изменить его. При переименовании запрос будет сохранён.

<Image img={give_a_query_a_name} size="lg" border alt="Интерфейс, показывающий, как переименовать запрос с Untitled Query"/>

Вы также можете использовать кнопку сохранения или сочетание клавиш `cmd / ctrl + s`, чтобы сохранить запрос.

<Image img={save_the_query} size="lg" border alt="Кнопка сохранения на панели инструментов редактора запросов"/>

## Использование GenAI для управления запросами \{#using-genai-to-manage-queries\}

Эта функция позволяет формулировать запросы в виде вопросов на естественном языке, после чего консоль запросов создаст SQL-запросы на основе контекста доступных таблиц. GenAI также может помочь вам отлаживать запросы.

Дополнительные сведения о GenAI см. в записи в блоге [Announcing GenAI powered query suggestions in ClickHouse Cloud](https://clickhouse.com/blog/announcing-genai-powered-query-suggestions-clickhouse-cloud).

### Настройка таблицы \{#table-setup\}

Импортируем пример набора данных UK Price Paid и используем его для создания некоторых запросов GenAI.

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

   Этот запрос должен выполняться около 1 секунды. После завершения у вас должна появиться пустая таблица с именем `uk_price_paid`.

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

Этот запрос загружает набор данных с веб-сайта `gov.uk`. Размер файла — около 4 ГБ, поэтому выполнение запроса займет несколько минут. После того как ClickHouse обработает запрос, весь набор данных окажется в таблице `uk_price_paid`.

#### Создание запроса \{#query-creation\}

Давайте создадим запрос на естественном языке.

1. Выберите таблицу **uk_price_paid**, затем нажмите **Create Query**.
1. Нажмите **Generate SQL**. Возможно, вам будет предложено согласиться с тем, что ваши запросы будут отправляться в ChatGPT. Чтобы продолжить, необходимо выбрать **I agree**.
1. Теперь вы можете использовать это поле для ввода запроса на естественном языке, а ChatGPT преобразует его в SQL-запрос. В этом примере мы введем:

   > Покажи мне общую сумму и общее количество всех транзакций uk_price_paid по годам.

1. Консоль сгенерирует нужный нам запрос и отобразит его в новой вкладке. В нашем примере GenAI создал следующий запрос:

   ```sql
   -- Покажи мне общую сумму и общее количество всех транзакций uk_price_paid по годам.
   SELECT year(date), sum(price) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. После того как вы проверите, что запрос корректен, нажмите **Run** для его выполнения.

### Отладка \{#debugging\}

Теперь протестируем возможности отладки запросов в GenAI.

1. Создайте новый запрос, нажав на значок _+_, и вставьте следующий код:

   ```sql
   -- Покажи мне общую стоимость и общее количество всех транзакций uk_price_paid по годам.
   SELECT year(date), sum(pricee) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. Нажмите **Run**. Запрос завершится с ошибкой, потому что мы пытаемся получить значения из `pricee` вместо `price`.
1. Нажмите **Fix Query**.
1. GenAI попытается исправить запрос. В этом случае он заменит `pricee` на `price`, а также определит, что в этой ситуации лучше использовать функцию `toYear`.
1. Выберите **Apply**, чтобы добавить предлагаемые изменения в ваш запрос, и нажмите **Run**.

Помните, что GenAI — экспериментальная функция. Будьте осторожны при выполнении запросов, сгенерированных GenAI, по любым наборам данных.

## Расширенные возможности запросов \{#advanced-querying-features\}

### Поиск по результатам запроса \{#searching-query-results\}

После выполнения запроса вы можете быстро искать по возвращённому набору результатов, используя поле поиска в панели результатов. Эта функция помогает предварительно просмотреть результаты дополнительного условия `WHERE` или просто проверить, что определённые данные включены в набор результатов. После ввода значения в поле поиска панель результатов обновится и вернёт записи, содержащие вхождение, совпадающее с введённым значением. В этом примере мы будем искать все вхождения `breakfast` в таблице `hackernews` среди комментариев, которые содержат `ClickHouse` (без учёта регистра):

<Image img={search_hn} size="lg" border alt="Поиск данных Hacker News"/>

Примечание: Будет возвращено любое поле, соответствующее введённому значению. Например, третья запись на приведённом выше скриншоте не совпадает со строкой `breakfast` в поле `by`, но в поле `text` это значение присутствует:

<Image img={match_in_body} size="lg" border alt="Совпадение в тексте сообщения"/>

### Настройка параметров разбивки на страницы \{#adjusting-pagination-settings\}

По умолчанию панель результатов запроса отображает все строки результата на одной странице. Для больших наборов результатов может быть удобнее включить разбиение на страницы для упрощения просмотра. Это можно сделать с помощью переключателя разбивки на страницы в правом нижнем углу панели результатов:

<Image img={pagination} size="lg" border alt="Параметры разбивки на страницы"/>

При выборе размера страницы разбиение на страницы сразу применяется к набору результатов, и в средней части нижней панели результатов появляются элементы навигации.

<Image img={pagination_nav} size="lg" border alt="Навигация по страницам"/>

### Экспорт результатов запроса \{#exporting-query-result-data\}

Наборы результатов запросов можно легко экспортировать в формат CSV непосредственно из SQL-консоли. Для этого откройте меню `•••` справа на панели инструментов области результатов и выберите пункт «Download as CSV».

<Image img={download_as_csv} size="lg" border alt="Скачать в формате CSV"/>

## Визуализация данных запросов \{#visualizing-query-data\}

Часть данных проще воспринимать в виде диаграмм. Вы можете быстро создавать визуализации из данных результатов запросов напрямую в SQL-консоли всего за несколько кликов. В качестве примера мы используем запрос, который вычисляет еженедельную статистику по поездкам такси в Нью-Йорке:

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

Без визуализации эти результаты трудно анализировать. Давайте построим по ним график.


### Создание диаграмм \{#creating-charts\}

Чтобы начать создавать визуализацию, выберите вариант «Chart» на панели инструментов области результатов запроса. Откроется панель конфигурации диаграммы:

<Image img={switch_from_query_to_chart} size="lg" border alt="Переключение с запроса на диаграмму"/>

Начнем с создания простой столбчатой диаграммы, показывающей `trip_total` по `week`. Для этого перетащите поле `week` на ось x, а поле `trip_total` — на ось y:

<Image img={trip_total_by_week} size="lg" border alt="Общая стоимость поездок по неделям"/>

Большинство типов диаграмм поддерживают использование нескольких полей на числовых осях. В качестве примера перетащим поле fare_total на ось y:

<Image img={bar_chart} size="lg" border alt="Столбчатая диаграмма"/>

### Настройка диаграмм \{#customizing-charts\}

SQL-консоль поддерживает десять типов диаграмм, которые можно выбрать в селекторе типа диаграммы в панели конфигурации диаграммы. Например, мы можем легко изменить предыдущий тип диаграммы с Bar на Area:

<Image img={change_from_bar_to_area} size="lg" border alt="Изменение диаграммы Bar на Area"/>

Заголовки диаграмм совпадают с именем запроса, который поставляет данные. Изменение имени запроса приведёт к тому, что заголовок диаграммы также обновится:

<Image img={update_query_name} size="lg" border alt="Обновление имени запроса"/>

Ряд более продвинутых характеристик диаграммы также можно настроить в разделе 'Advanced' панели конфигурации диаграммы. Для начала мы изменим следующие настройки:

- Subtitle
- Axis titles
- Ориентация подписей для оси x

Диаграмма будет обновлена соответствующим образом:

<Image img={update_subtitle_etc} size="lg" border alt="Обновление подзаголовка и др."/>

В некоторых случаях может потребоваться настроить масштабы осей для каждого поля независимо. Это также можно сделать в разделе 'Advanced' панели конфигурации диаграммы, указав минимальное и максимальное значения для диапазона оси. В качестве примера: приведённая выше диаграмма выглядит хорошо, но для демонстрации корреляции между полями `trip_total` и `fare_total` диапазоны осей требуют некоторой корректировки:

<Image img={adjust_axis_scale} size="lg" border alt="Настройка масштаба оси"/>

## Совместное использование запросов \{#sharing-queries\}

SQL-консоль позволяет делиться запросами с вашей командой. Когда вы делитесь запросом, все участники команды могут просматривать и редактировать его. Общие запросы — отличный способ для совместной работы.

Чтобы поделиться запросом, нажмите кнопку «Share» на панели инструментов запроса.

<Image img={sql_console_share} size="lg" border alt="Кнопка Share на панели инструментов запроса"/>

Откроется диалоговое окно, в котором вы можете поделиться запросом со всеми участниками команды. Если у вас несколько команд, вы можете выбрать, с какой командой поделиться запросом.

<Image img={sql_console_edit_access} size="lg" border alt="Диалоговое окно редактирования доступа к общему запросу"/>

<Image img={sql_console_add_team} size="lg" border alt="Интерфейс добавления команды к общему запросу"/>

<Image img={sql_console_edit_member} size="lg" border alt="Интерфейс редактирования доступа участника к общему запросу"/>

В некоторых случаях может потребоваться независимо настроить шкалы осей для каждого поля. Это также можно сделать в разделе «Advanced» панели конфигурации графика, указав минимальные и максимальные значения диапазона оси. Например, приведённый выше график выглядит хорошо, но для демонстрации корреляции между нашими полями `trip_total` и `fare_total` диапазоны осей требуют некоторой корректировки:

<Image img={sql_console_access_queries} size="lg" border alt="Раздел Shared with me в списке запросов"/>