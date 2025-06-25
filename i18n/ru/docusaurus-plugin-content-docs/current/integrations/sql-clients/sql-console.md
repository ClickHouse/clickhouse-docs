---
sidebar_label: 'SQL Консоль'
sidebar_position: 1
title: 'SQL Консоль'
slug: /integrations/sql-clients/sql-console
description: 'Узнайте о SQL Консоли'
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


# SQL Консоль

SQL консоль — это самый быстрый и простой способ исследовать и запрашивать ваши базы данных в ClickHouse Cloud. Вы можете использовать SQL консоль для:

- Подключения к вашим ClickHouse Cloud Services
- Просмотра, фильтрации и сортировки данных таблиц
- Выполнения запросов и визуализации данных результатов всего за несколько кликов
- Совместного использования запросов с членами команды и более эффективного сотрудничества.

## Исследование Таблиц {#exploring-tables}

### Просмотр Списка Таблиц и Информации о Схеме {#viewing-table-list-and-schema-info}

Обзор таблиц, содержащихся в вашем экземпляре ClickHouse, можно найти в левом боковом меню. Используйте селектор базы данных в верхней части левой панели, чтобы просмотреть таблицы в конкретной базе данных.

<Image img={table_list_and_schema} size="lg" border alt="Просмотр списка таблиц и схемы, показывающий базы данных в левой боковой панели"/>

Таблицы в списке также могут быть развернуты, чтобы увидеть колонки и типы.

<Image img={view_columns} size="lg" border alt="Просмотр развернутой таблицы, показывающей имена колонок и типы данных"/>

### Исследование Данных Таблицы {#exploring-table-data}

Нажмите на таблицу в списке, чтобы открыть её в новой вкладке. В представлении таблицы данные можно легко просматривать, выделять и копировать. Обратите внимание, что структура и форматирование сохраняются при копировании и вставке в такие приложения, как Microsoft Excel и Google Sheets. Вы можете переключаться между страницами данных таблицы (пагинация по 30 строк за раз), используя навигацию в нижней части.

<Image img={abc} size="lg" border alt="Представление таблицы с данными, которые можно выделить и скопировать"/>

### Просмотр Данных Ячейки {#inspecting-cell-data}

Инструмент инспектора ячеек может использоваться для просмотра большого объема данных, содержащихся в одной ячейке. Чтобы открыть его, щелкните правой кнопкой мыши по ячейке и выберите 'Inspect Cell'. Содержимое инспектора ячейки можно скопировать, нажав на иконку копирования в верхнем правом углу содержимого инспектора.

<Image img={inspecting_cell_content} size="lg" border alt="Диалог инспектора ячейки, показывающий содержимое выбранной ячейки"/>

## Фильтрация и Сортировка Таблиц {#filtering-and-sorting-tables}

### Сортировка Таблицы {#sorting-a-table}

Чтобы отсортировать таблицу в SQL консоли, откройте таблицу и выберите кнопку 'Sort' на панели инструментов. Эта кнопка откроет меню, которое позволит вам настроить вашу сортировку. Вы можете выбрать колонку, по которой будет производиться сортировка, и настроить порядок сортировки (по возрастанию или убыванию). Выберите 'Apply' или нажмите Enter, чтобы отсортировать вашу таблицу.

<Image img={sort_descending_on_column} size="lg" border alt="Диалог сортировки, показывающий конфигурацию для сортировки по убыванию на колонке"/>

SQL консоль также позволяет добавлять несколько сортировок к таблице. Нажмите кнопку 'Sort' снова, чтобы добавить еще одну сортировку. Примечание: сортировки применяются в порядке их появления в панели сортировки (сверху вниз). Чтобы удалить сортировку, просто щелкните кнопку 'x' рядом с сортировкой.

### Фильтрация Таблицы {#filtering-a-table}

Чтобы отфильтровать таблицу в SQL консоли, откройте таблицу и выберите кнопку 'Filter'. Как и в случае с сортировкой, эта кнопка откроет меню, которое позволит вам настроить ваш фильтр. Вы можете выбрать колонку, по которой будет производиться фильтрация, и задать необходимые критерии. SQL консоль интеллектуально отображает параметры фильтрации, соответствующие типу данных в колонке.

<Image img={filter_on_radio_column_equal_gsm} size="lg" border alt="Диалог фильтрации, показывающий конфигурацию для фильтрации радиоколоночки, равной GSM"/>

Когда вы будете довольны своим фильтром, вы можете выбрать 'Apply', чтобы отфильтровать ваши данные. Вы также можете добавить дополнительные фильтры, как показано ниже.

<Image img={add_more_filters} size="lg" border alt="Диалог, показывающий, как добавить дополнительный фильтр по диапазону больше 2000"/>

Аналогично функции сортировки, щелкните кнопку 'x' рядом с фильтром, чтобы удалить его.

### Фильтрация и Сортировка Вместе {#filtering-and-sorting-together}

SQL консоль позволяет фильтровать и сортировать таблицу одновременно. Для этого добавьте все желаемые фильтры и сортировки, используя описанные выше шаги, и нажмите кнопку 'Apply'.

<Image img={filtering_and_sorting_together} size="lg" border alt="Интерфейс, показывающий одновременное применение фильтрации и сортировки"/>

### Создание Запроса из Фильтров и Сортировок {#creating-a-query-from-filters-and-sorts}

SQL консоль может непосредственно конвертировать ваши сортировки и фильтры в запросы одним кликом. Просто выберите кнопку 'Create Query' на панели инструментов с параметрами сортировки и фильтрации по вашему выбору. После нажатия 'Create query' откроется новая вкладка запроса, предварительно заполненная SQL командой, соответствующей данным в вашем представлении таблицы.

<Image img={create_a_query_from_sorts_and_filters} size="lg" border alt="Интерфейс, показывающий кнопку Создать Запрос, которая генерирует SQL из фильтров и сортировок"/>

:::note
Фильтры и сортировки не являются обязательными при использовании функции 'Create Query'.
:::

Вы можете узнать больше о запросах в SQL консоли, прочитав (link) документацию по запросам.

## Создание и Выполнение Запроса {#creating-and-running-a-query}

### Создание Запроса {#creating-a-query}

Существует два способа создать новый запрос в SQL консоли.

- Нажмите кнопку '+' на панели вкладок.
- Выберите кнопку 'New Query' из списка запросов в левой боковой панели.

<Image img={creating_a_query} size="lg" border alt="Интерфейс, показывающий, как создать новый запрос с помощью кнопки + или кнопки Новый Запрос"/>

### Выполнение Запроса {#running-a-query}

Чтобы выполнить запрос, введите ваши SQL команды в SQL редактор и нажмите кнопку 'Run' или используйте сочетание клавиш `cmd / ctrl + enter`. Чтобы написать и выполнить несколько команд последовательно, убедитесь, что вы добавили точку с запятой после каждой команды.

Опции Выполнения Запросов
По умолчанию, нажатие кнопки запуска выполнит все команды, содержащиеся в SQL редакторе. SQL консоль поддерживает две другие опции выполнения запросов:

- Выполнить выделенные команды
- Выполнить команду по курсору

Чтобы выполнить выделенные команды, выделите необходимую команду или последовательность команд и нажмите кнопку 'Run' (или используйте сочетание клавиш `cmd / ctrl + enter`). Вы также можете выбрать 'Run selected' из контекстного меню SQL редактора (открывается правым щелчком мыши в любом месте внутри редактора), когда выделение присутствует.

<Image img={run_selected_query} size="lg" border alt="Интерфейс, показывающий, как выполнить выделенную часть SQL запроса"/>

Запуск команды в текущей позиции курсора можно осуществить двумя способами:

- Выберите 'At Cursor' из расширенного меню опций выполнения (или используйте соответствующее сочетание клавиш `cmd / ctrl + shift + enter`).

<Image img={run_at_cursor_2} size="lg" border alt="Опция Выполнить по Курсору в расширенном меню опций выполнения"/>

  - Выбор 'Run at cursor' из контекстного меню SQL редактора.

<Image img={run_at_cursor} size="lg" border alt="Опция Выполнить по Курсору в контекстном меню SQL редактора"/>

:::note
Команда, находящаяся в позиции курсора, будет мигать желтым при выполнении.
:::

### Отмена Запроса {#canceling-a-query}

Во время выполнения запроса кнопка 'Run' на панели инструментов редактора запросов будет заменена кнопкой 'Cancel'. Просто нажмите эту кнопку или нажмите `Esc`, чтобы отменить запрос. Примечание: любые результаты, которые уже были возвращены, сохранятся после отмены.

<Image img={cancel_a_query} size="lg" border alt="Кнопка отмены, которая появляется во время выполнения запроса"/>

### Сохранение Запроса {#saving-a-query}

Если запрос не был ранее назван, он будет называться 'Untitled Query'. Щелкните по имени запроса, чтобы изменить его. Переименование запроса приведет к его сохранению.

<Image img={give_a_query_a_name} size="lg" border alt="Интерфейс, показывающий, как переименовать запрос из Untitled Query"/>

Вы также можете использовать кнопку сохранения или сочетание клавиш `cmd / ctrl + s` для сохранения запроса.

<Image img={save_the_query} size="lg" border alt="Кнопка сохранения на панели инструментов редактора запросов"/>

## Использование GenAI для управления запросами {#using-genai-to-manage-queries}

Эта функция позволяет пользователям писать запросы в виде вопросов на естественном языке и заставлять консоль запросов создавать SQL запросы на основе контекста доступных таблиц. GenAI также может помочь пользователям отлаживать свои запросы.

Для получения дополнительной информации о GenAI, ознакомьтесь с [объявлением о предложениях запросов на базе GenAI в блоге ClickHouse](https://clickhouse.com/blog/announcing-genai-powered-query-suggestions-clickhouse-cloud).

### Настройка Таблицы {#table-setup}

Давайте импортируем пример набора данных UK Price Paid и используем его для создания некоторых запросов GenAI.

1. Откройте службу ClickHouse Cloud.
1. Создайте новый запрос, нажав значок _+_.
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

   Этот запрос должен занять около 1 секунды для завершения. Как только он выполнится, у вас должна быть пустая таблица с именем `uk_price_paid`.

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

Этот запрос извлекает набор данных с сайта `gov.uk`. Этот файл весит ~4 GB, поэтому на выполнение этого запроса потребуется несколько минут. Как только ClickHouse обработает запрос, у вас будет весь набор данных в таблице `uk_price_paid`.

#### Создание Запроса {#query-creation}

Давайте создадим запрос, используя естественный язык.

1. Выберите таблицу **uk_price_paid**, а затем нажмите **Create Query**.
1. Нажмите **Generate SQL**. Вам может быть предложено согласиться на отправку ваших запросов в Chat-GPT. Вы должны выбрать **I agree**, чтобы продолжить.
1. Теперь вы можете использовать этот запрос, чтобы ввести запрос на естественном языке и заставить ChatGPT преобразовать его в SQL запрос. В этом примере мы введем:

   > Показать мне общую цену и общее количество всех транзакций uk_price_paid по годам.

1. Консоль сгенерирует запрос, который нам нужен, и отобразит его в новой вкладке. В нашем примере, GenAI создал следующий запрос:

   ```sql
   -- Показать мне общую цену и общее количество всех транзакций uk_price_paid по годам.
   SELECT year(date), sum(price) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. Когда вы убедитесь, что запрос правильный, нажмите **Run**, чтобы выполнить его.

### Отладка {#debugging}

Теперь давайте протестируем возможности отладки запросов GenAI.

1. Создайте новый запрос, щелкнув по значку _+_ и вставьте следующий код:

   ```sql
   -- Показать мне общую цену и общее количество всех транзакций uk_price_paid по годам.
   SELECT year(date), sum(pricee) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. Нажмите **Run**. Запрос завершается с ошибкой, так как мы пытаемся получить значения из `pricee`, а не из `price`.
1. Нажмите **Fix Query**.
1. GenAI попытается исправить запрос. В этом случае он изменил `pricee` на `price`. Он также понял, что `toYear` — лучше функция для использования в этом сценарии.
1. Выберите **Apply**, чтобы добавить предложенные изменения в ваш запрос и нажмите **Run**.

Имейте в виду, что GenAI — это экспериментальная функция. Будьте осторожны при выполнении запросов, сгенерированных GenAI, против любого набора данных.

## Расширенные Функции Запросов {#advanced-querying-features}

### Поиск Результатов Запроса {#searching-query-results}

После выполнения запроса вы можете быстро искать среди возвращенного набора результатов, используя поле поиска в области результатов. Эта функция помогает предварительно просмотреть результаты дополнительного `WHERE` условия или просто проверить, чтобы убедиться, что конкретные данные включены в набор результатов. После ввода значения в поле поиска область результатов обновится и вернет записи, содержащие запись, соответствующую введенному значению. В этом примере мы будем искать все вхождения `breakfast` в таблице `hackernews` для комментариев, которые содержат `ClickHouse` (регистр не имеет значения):

<Image img={search_hn} size="lg" border alt="Поиск Данных Hacker News"/>

Примечание: Любое поле, соответствующее введенному значению, будет возвращено. Например, третья запись на приведенном выше скриншоте не соответствует 'breakfast' в поле `by`, но поле `text` соответствует:

<Image img={match_in_body} size="lg" border alt="Совпадение в тексте"/>

### Настройка Параметров Пагинации {#adjusting-pagination-settings}

По умолчанию область результатов запроса отображает каждую запись результата на одной странице. Для больших наборов результатов может быть предпочтительным пагинировать результаты для облегчения просмотра. Это можно сделать, используя селектор пагинации в правом нижнем углу области результатов:

<Image img={pagination} size="lg" border alt="Опции пагинации"/>

Выбор размера страницы немедленно применит пагинацию к набору результатов, и параметры навигации появятся в середине нижнего колонтитула области результатов.

<Image img={pagination_nav} size="lg" border alt="Навигация по пагинации"/>

### Экспорт Данных Результата Запроса {#exporting-query-result-data}

Наборы результатов запросов можно легко экспортировать в формат CSV непосредственно из SQL консоли. Для этого откройте меню `•••` на правой стороне панели инструментов области результатов и выберите 'Download as CSV'.

<Image img={download_as_csv} size="lg" border alt="Скачать как CSV"/>

## Визуализация Данных Запроса {#visualizing-query-data}

Некоторые данные можно легче интерпретировать в виде графиков. Вы можете быстро создать визуализации из данных результатов запроса непосредственно из SQL консоли всего за несколько кликов. В качестве примера мы будем использовать запрос, который вычисляет недельную статистику для поездок такси в Нью-Йорке:

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

<Image img={tabular_query_results} size="lg" border alt="Табличные результаты запроса"/>

Без визуализации эти результаты трудно интерпретировать. Давайте превратим их в график.

### Создание Графиков {#creating-charts}

Чтобы начать создание вашей визуализации, выберите опцию 'Chart' из панели инструментов области результатов запроса. Появится панель конфигурации графика:

<Image img={switch_from_query_to_chart} size="lg" border alt="Переключение с запроса на график"/>

Мы начнем с создания простого столбчатого графика, отслеживающего `trip_total` по `week`. Для этого мы перетащим поле `week` на ось x и поле `trip_total` на ось y:

<Image img={trip_total_by_week} size="lg" border alt="Общее количество поездок по неделям"/>

Большинство типов графиков поддерживают несколько полей на числовых осях. Чтобы продемонстрировать, мы перетащим поле fare_total на ось y:

<Image img={bar_chart} size="lg" border alt="Столбчатый график"/>

### Настройка Графиков {#customizing-charts}

SQL консоль поддерживает десять типов графиков, которые можно выбрать из селектора типов графиков в панели конфигурации графика. Например, мы можем легко изменить предыдущий тип графика со Столбчатого на Облако:

<Image img={change_from_bar_to_area} size="lg" border alt="Изменить с столбчатого графика на область"/>

Названия графиков соответствуют имени запроса, предоставляющему данные. Обновление имени запроса приведет к обновлению заголовка графика:

<Image img={update_query_name} size="lg" border alt="Обновить имя запроса"/>

Также можно настроить ряд более продвинутых характеристик графика в разделе 'Advanced' панели конфигурации графика. Начнем с настройки следующих параметров:

- Подзаголовок
- Заголовки осей
- Ориентация меток для оси x

Наш график будет обновлен соответственно:

<Image img={update_subtitle_etc} size="lg" border alt="Обновить подзаголовок и др."/>

В некоторых случаях может потребоваться отрегулировать масштабы осей для каждого поля независимо. Это также можно сделать в разделе 'Advanced' панели конфигурации графика, указав минимальные и максимальные значения для диапазона оси. Например, вышеуказанный график выглядит хорошо, но чтобы продемонстрировать корреляцию между нашими полями `trip_total` и `fare_total`, диапазоны осей требуют некоторых корректировок:

<Image img={adjust_axis_scale} size="lg" border alt="Настроить масштаб осей"/>

## Совместное Использование Запросов {#sharing-queries}

SQL консоль позволяет делиться запросами с вашей командой. Когда запрос совместен, все члены команды могут видеть и редактировать запрос. Совместные запросы — это отличный способ сотрудничества с вашей командой.

Чтобы поделиться запросом, нажмите кнопку 'Share' на панели инструментов запроса.

<Image img={sql_console_share} size="lg" border alt="Кнопка поделиться на панели инструментов запроса"/>

Откроется диалог, позволяющий вам поделиться запросом со всеми членами команды. Если у вас несколько команд, вы можете выбрать, с какой командой поделиться запросом.

<Image img={sql_console_edit_access} size="lg" border alt="Диалог для редактирования доступа к совместному запросу"/>

<Image img={sql_console_add_team} size="lg" border alt="Интерфейс для добавления команды к совместному запросу"/>

<Image img={sql_console_edit_member} size="lg" border alt="Интерфейс для редактирования доступа участника к совместному запросу"/>

В некоторых сценариях может потребоваться отрегулировать масштабы осей для каждого поля независимо. Это также можно сделать в разделе 'Advanced' панели конфигурации графика, указав минимальные и максимальные значения для диапазона оси. Например, вышеуказанный график выглядит хорошо, но чтобы продемонстрировать корреляцию между нашими полями `trip_total` и `fare_total`, диапазоны осей требуют некоторых корректировок:

<Image img={sql_console_access_queries} size="lg" border alt="Раздел 'Совместные со мной' в списке запросов"/>
