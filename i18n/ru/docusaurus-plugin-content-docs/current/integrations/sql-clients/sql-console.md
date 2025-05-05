---
sidebar_label: 'Консоль SQL'
sidebar_position: 1
title: 'Консоль SQL'
slug: /integrations/sql-clients/sql-console
description: 'Узнайте о Консоли SQL'
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

Консоль SQL — это самый быстрый и простой способ исследовать и выполнять запросы к вашим базам данных в ClickHouse Cloud. Вы можете использовать консоль SQL для:

- Подключения к вашим ClickHouse Cloud Services
- Просмотра, фильтрации и сортировки данных таблиц
- Выполнения запросов и визуализации данных результатов всего за несколько кликов
- Совместного использования запросов с участниками команды и более эффективного сотрудничества.

## Исследование таблиц {#exploring-tables}

### Просмотр списка таблиц и информации о схеме {#viewing-table-list-and-schema-info}

Общий обзор таблиц, содержащихся в вашем экземпляре ClickHouse, можно найти в области левой боковой панели. Используйте селектор базы данных в верхней части левой панели, чтобы просмотреть таблицы в конкретной базе данных.

<Image img={table_list_and_schema} size="lg" border alt="Просмотр списка таблиц и схемы, показывающий таблицы базы данных в левой боковой панели"/>

Таблицы в списке также могут быть развернуты для просмотра колонок и типов.

<Image img={view_columns} size="lg" border alt="Просмотр развернутой таблицы, показывающий имена колонок и типы данных"/>

### Исследование данных таблицы {#exploring-table-data}

Нажмите на таблицу в списке, чтобы открыть ее на новой вкладке. В представлении таблицы данные можно легко просматривать, выделять и копировать. Обратите внимание, что структура и форматирование сохраняются при копировании-вставке в электронные таблицы, такие как Microsoft Excel и Google Sheets. Вы можете переключаться между страницами данных таблицы (разбитыми по 30 строк) с помощью навигации внизу страницы.

<Image img={abc} size="lg" border alt="Представление таблицы, показывающее данные, которые можно выделять и копировать"/>

### Проверка данных ячейки {#inspecting-cell-data}

Инструмент проверки ячеек можно использовать для просмотра больших объемов данных, содержащихся в одной ячейке. Чтобы открыть его, щелкните правой кнопкой мыши на ячейке и выберите «Проверить ячейку». Содержимое инспектора ячеек можно скопировать, нажав на значок копирования в правом верхнем углу содержимого инспектора.

<Image img={inspecting_cell_content} size="lg" border alt="Диалог инспектора ячеек, показывающий содержимое выбранной ячейки"/>

## Фильтрация и сортировка таблиц {#filtering-and-sorting-tables}

### Сортировка таблицы {#sorting-a-table}

Чтобы отсортировать таблицу в консоли SQL, откройте таблицу и выберите кнопку «Сортировка» на панели инструментов. Эта кнопка откроет меню, которое позволит вам настроить сортировку. Вы можете выбрать колонку, по которой хотите отсортировать, и настроить порядок сортировки (по возрастанию или убыванию). Выберите «Применить» или нажмите Enter, чтобы отсортировать вашу таблицу.

<Image img={sort_descending_on_column} size="lg" border alt="Диалог сортировки, показывающий настройку для сортировки по убыванию на колонке"/>

Консоль SQL также позволяет добавлять несколько сортировок к таблице. Щелкните кнопку «Сортировка» еще раз, чтобы добавить другую сортировку. Примечание: сортировки применяются в порядке их появления в панели сортировки (сверху вниз). Чтобы удалить сортировку, просто нажмите кнопку «x» рядом с сортировкой.

### Фильтрация таблицы {#filtering-a-table}

Чтобы отфильтровать таблицу в консоли SQL, откройте таблицу и выберите кнопку «Фильтр». Так же, как и при сортировке, эта кнопка откроет меню, которое позволит вам настроить фильтр. Вы можете выбрать колонку, по которой хотите отфильтровать, и выбрать необходимые критерии. Консоль SQL интеллектуально отображает параметры фильтра, соответствующие типу данных, содержащимся в колонке.

<Image img={filter_on_radio_column_equal_gsm} size="lg" border alt="Диалог фильтрации, показывающий настройку для фильтрации радиоколонки, равной GSM"/>

Когда вы будете довольны вашим фильтром, вы можете выбрать «Применить», чтобы отфильтровать ваши данные. Вы также можете добавить дополнительные фильтры, как показано ниже.

<Image img={add_more_filters} size="lg" border alt="Диалог, показывающий, как добавить дополнительный фильтр по диапазону больше 2000"/>

Так же, как и в функциональности сортировки, нажмите кнопку «x» рядом с фильтром, чтобы удалить его.

### Фильтрация и сортировка вместе {#filtering-and-sorting-together}

Консоль SQL позволяет одновременно фильтровать и сортировать таблицу. Для этого добавьте все желаемые фильтры и сортировки, используя описанные выше шаги, и нажмите кнопку «Применить».

<Image img={filtering_and_sorting_together} size="lg" border alt="Интерфейс, показывающий применение как фильтрации, так и сортировки одновременно"/>

### Создание запроса из фильтров и сортировок {#creating-a-query-from-filters-and-sorts}

Консоль SQL может преобразовать ваши сортировки и фильтры напрямую в запросы одним кликом. Просто выберите кнопку «Создать запрос» на панели инструментов с параметрами сортировки и фильтрации на ваш выбор. После нажатия на «Создать запрос» откроется новая вкладка запроса, заранее заполненная SQL-командой, соответствующей данным, содержащимся в вашем представлении таблицы.

<Image img={create_a_query_from_sorts_and_filters} size="lg" border alt="Интерфейс, показывающий кнопку Создать запрос, которая генерирует SQL из фильтров и сортировок"/>

:::note
Фильтры и сортировки не являются обязательными при использовании функции «Создать запрос».
:::

Вы можете узнать больше о запросах в консоли SQL, прочитав (link) документацию по запросам.

## Создание и выполнение запроса {#creating-and-running-a-query}

### Создание запроса {#creating-a-query}

Существует два способа создать новый запрос в консоли SQL.

- Нажмите кнопку «+» на панели вкладок
- Выберите кнопку «Новый запрос» из списка запросов в левой боковой панели

<Image img={creating_a_query} size="lg" border alt="Интерфейс, показывающий, как создать новый запрос, используя кнопку + или кнопку Новый запрос"/>

### Выполнение запроса {#running-a-query}

Чтобы выполнить запрос, введите ваши SQL-команды в редактор SQL и нажмите кнопку «Выполнить» или используйте сочетание клавиш `cmd / ctrl + enter`. Чтобы записать и выполнить несколько команд по очереди, обязательно добавьте точку с запятой после каждой команды.

Опции выполнения запроса
По умолчанию нажатие кнопки выполнения запустит все команды, содержащиеся в редакторе SQL. Консоль SQL поддерживает две другие опции выполнения запросов:

- Выполнить выбранную команду(ы)
- Выполнить команду на курсоре

Чтобы выполнить выбранную команду(ы), выделите нужную команду или последовательность команд и нажмите кнопку «Выполнить» (или используйте сочетание `cmd / ctrl + enter`). Вы также можете выбрать «Выполнить выбранное» из контекстного меню редактора SQL (открывается щелчком правой кнопки мыши в любом месте редактора), когда выбрано что-либо.

<Image img={run_selected_query} size="lg" border alt="Интерфейс, показывающий, как выполнить выбранную часть SQL-запроса"/>

Выполнить команду в текущей позиции курсора можно двумя способами:

- Выберите «На курсоре» из расширенного меню опций выполнения (или используйте соответствующее сочетание клавиш `cmd / ctrl + shift + enter`).

<Image img={run_at_cursor_2} size="lg" border alt="Опция выполнения на курсоре в расширенном меню опций выполнения"/>

  - Выбирая «Выполнить на курсоре» из контекстного меню редактора SQL.

<Image img={run_at_cursor} size="lg" border alt="Опция выполнения на курсоре в контекстном меню редактора SQL"/>

:::note
Команда, присутствующая в позиции курсора, будет мигать желтым при выполнении.
:::

### Отмена запроса {#canceling-a-query}

Во время выполнения запроса кнопка «Выполнить» на панели инструментов редактора запросов будет заменена на кнопку «Отмена». Просто нажмите эту кнопку или нажмите `Esc`, чтобы отменить запрос. Обратите внимание: любые результаты, которые уже были возвращены, останутся после отмены.

<Image img={cancel_a_query} size="lg" border alt="Кнопка отмены, которая появляется во время выполнения запроса"/>

### Сохранение запроса {#saving-a-query}

Если раньше не было присвоено название, ваш запрос должен называться «Непридуманное название запроса». Щелкните на имя запроса, чтобы изменить его. Переименование запроса приведет к его сохранению.

<Image img={give_a_query_a_name} size="lg" border alt="Интерфейс, показывающий, как переименовать запрос с Непридуманного названия запроса"/>

Вы также можете использовать кнопку сохранения или сочетание клавиш `cmd / ctrl + s`, чтобы сохранить запрос.

<Image img={save_the_query} size="lg" border alt="Кнопка сохранения на панели инструментов редактора"/>

## Использование GenAI для управления запросами {#using-genai-to-manage-queries}

Эта функция позволяет пользователям формулировать запросы в виде вопросов на естественном языке и создавать SQL-запросы на основе контекста доступных таблиц. GenAI также может помочь пользователям отладить их запросы.

Для получения дополнительной информации о GenAI ознакомьтесь с [объявлением о предложениях запросов на основе GenAI в ClickHouse Cloud](https://clickhouse.com/blog/announcing-genai-powered-query-suggestions-clickhouse-cloud).

### Настройка таблицы {#table-setup}

Давайте импортируем пример набора данных UK Price Paid и воспользуемся им для создания запросов GenAI.

1. Откройте службу ClickHouse Cloud.
1. Создайте новый запрос, нажав на иконку _+_.
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

   Этот запрос должен занять около 1 секунды для завершения. После этого у вас должна быть пустая таблица с названием `uk_price_paid`.

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

Этот запрос загружает набор данных с сайта `gov.uk`. Этот файл весит около ~4 ГБ, поэтому выполнение этого запроса займет несколько минут. После того как ClickHouse обработает запрос, у вас должен быть полный набор данных в таблице `uk_price_paid`.

#### Создание запроса {#query-creation}

Давайте создадим запрос, используя естественный язык.

1. Выберите таблицу **uk_price_paid**, а затем нажмите **Создать запрос**.
1. Нажмите **Сгенерировать SQL**. Вас могут попросить подтвердить, что ваши запросы отправляются в Chat-GPT. Вы должны выбрать **Я согласен**, чтобы продолжить.
1. Теперь вы можете использовать этот запрос, чтобы ввести запрос на естественном языке и позволить ChatGPT преобразовать его в SQL-запрос. В этом примере мы введем:

   > Покажите мне общую цену и общее количество всех транзакций uk_price_paid по годам.

1. Консоль сгенерирует запрос, который мы ищем, и отобразит его в новой вкладке. В нашем примере GenAI создал следующий запрос:

   ```sql
   -- Покажите мне общую цену и общее количество всех транзакций uk_price_paid по годам.
   SELECT year(date), sum(price) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. После проверки того, что запрос корректен, нажмите **Выполнить**, чтобы его выполнить.

### Отладка {#debugging}

Теперь давайте протестируем возможности отладки запросов GenAI.

1. Создайте новый запрос, нажав на иконку _+_ и вставьте следующий код:

   ```sql
   -- Покажите мне общую цену и общее количество всех транзакций uk_price_paid по годам.
   SELECT year(date), sum(pricee) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. Нажмите **Выполнить**. Запрос не выполняется, так как мы пытаемся получить значения из `pricee`, а не из `price`.
1. Нажмите **Исправить запрос**.
1. GenAI попытается исправить запрос. В этом случае он изменил `pricee` на `price`. Он также понял, что функция `toYear` лучше подходит для этого сценария.
1. Выберите **Применить**, чтобы добавить предложенные изменения в ваш запрос, затем нажмите **Выполнить**.

Помните, что GenAI — это экспериментальная функция. Будьте осторожны при выполнении запросов, сгенерированных GenAI, с любым набором данных.

## Расширенные функции запросов {#advanced-querying-features}

### Поиск результатов запроса {#searching-query-results}

После выполнения запроса вы можете быстро искать по возвращенному набору результатов, используя поле поиска в панели результатов. Эта функция помогает предварительно просмотреть результаты дополнительного предложения `WHERE` или просто проверить, что определенные данные присутствуют в наборе результатов. После ввода значения в поле поиска панель результатов обновится и вернет записи, содержащие значение, совпадающее с введенным. В этом примере мы будем искать все экземпляры `breakfast` в таблице `hackernews` для комментариев, содержащих `ClickHouse` (регистронезависимо):

<Image img={search_hn} size="lg" border alt="Поиск данных Hacker News"/>

Примечание: любое поле, соответствующее введенному значению, будет возвращено. Например, третья запись на скриншоте выше не соответствует «breakfast» в поле `by`, но поле `text` соответствует:

<Image img={match_in_body} size="lg" border alt="Совпадение в теле"/>

### Настройка параметров постраничного отображения {#adjusting-pagination-settings}

По умолчанию панель результатов запроса будет отображать каждую запись результата на одной странице. Для больших наборов результатов может быть предпочтительнее разбивать результаты на страницы для более удобного просмотра. Это можно сделать, используя селектор постраничного отображения в правом нижнем углу панели результатов:

<Image img={pagination} size="lg" border alt="Параметры постраничного отображения"/>

Выбор размера страницы немедленно применит постраничное отображение к набору результатов, и навигационные параметры появятся в середине нижнего колонтитула панели результатов.

<Image img={pagination_nav} size="lg" border alt="Навигация по страницам"/>

### Экспорт данных результатов запроса {#exporting-query-result-data}

Наборы результатов запросов можно легко экспортировать в формате CSV непосредственно из консоли SQL. Для этого откройте меню `•••` на правой стороне панели инструментов результатов и выберите «Скачать как CSV».

<Image img={download_as_csv} size="lg" border alt="Скачать как CSV"/>

## Визуализация данных запроса {#visualizing-query-data}

Некоторые данные могут быть легче интерпретированы в виде диаграммы. Вы можете быстро создать визуализации из данных результата запроса непосредственно в консоли SQL всего за несколько кликов. В качестве примера, мы используем запрос, который рассчитывает недельную статистику для поездок такси в Нью-Йорке:

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

Без визуализации эти результаты трудно интерпретировать. Давайте превратим их в диаграмму.

### Создание диаграмм {#creating-charts}

Для начала создания вашей визуализации выберите опцию «Доказать» на панели результатов запроса. Появится панель конфигурации диаграммы:

<Image img={switch_from_query_to_chart} size="lg" border alt="Переключение с запроса на диаграмму"/>

Мы начнем с создания простой столбчатой диаграммы, отслеживающей `trip_total` по `week`. Для этого мы перетащим поле `week` на ось x и поле `trip_total` на ось y:

<Image img={trip_total_by_week} size="lg" border alt="Общее количество поездок по неделям"/>

Большинство типов диаграмм поддерживают несколько полей на числовых осях. Для демонстрации мы перетащим поле fare_total на ось y:

<Image img={bar_chart} size="lg" border alt="Столбчатая диаграмма"/>

### Настройка диаграмм {#customizing-charts}

Консоль SQL поддерживает десять типов диаграмм, которые можно выбрать из селектора типов диаграмм в панели конфигурации диаграммы. Например, мы можем легко изменить предыдущий тип диаграммы с Вертикальной на Площадь:

<Image img={change_from_bar_to_area} size="lg" border alt="Смена с диаграммы столбцов на диаграмму площади"/>

Заголовки диаграмм соответствуют названию запроса, предоставляющего данные. Обновление названия запроса приведет к обновлению заголовка диаграммы:

<Image img={update_query_name} size="lg" border alt="Обновить название запроса"/>

Некоторые более сложные характеристики диаграммы также могут быть настроены в разделе «Расширенные» панели конфигурации диаграммы. Чтобы начать, мы обновим следующие настройки:

- Подзаголовок
- Заголовки осей
- Ориентация меток для оси x

Наша диаграмма будет обновлена соответственно:

<Image img={update_subtitle_etc} size="lg" border alt="Обновить подзаголовок и т.д."/>

В некоторых сценариях может потребоваться изменять шкалы осей для каждого поля независимо. Это также можно сделать в разделе «Расширенные» панели конфигурации диаграммы, указав минимальные и максимальные значения для диапазона осей. Например, вышеуказанная диаграмма выглядит хорошо, но для демонстрации корреляции между нашими полями `trip_total` и `fare_total` диапазоны осей нуждаются в некотором корректировании:

<Image img={adjust_axis_scale} size="lg" border alt="Настроить шкалу оси"/>

## Совместное использование запросов {#sharing-queries}

Консоль SQL позволяет вам делиться запросами со своей командой. Когда запрос делится, все участники команды могут видеть и редактировать его. Совместное использование запросов — отличный способ сотрудничества с вашей командой.

Чтобы поделиться запросом, нажмите кнопку «Поделиться» на панели инструментов запроса.

<Image img={sql_console_share} size="lg" border alt="Кнопка «Поделиться» на панели инструментов запроса"/>

Откроется диалоговое окно, позволяющее вам поделиться запросом со всеми членами команды. Если у вас несколько команд, вы можете выбрать, с какой командой поделиться запросом.

<Image img={sql_console_edit_access} size="lg" border alt="Диалог для редактирования доступа к совместно используемому запросу"/>

<Image img={sql_console_add_team} size="lg" border alt="Интерфейс для добавления команды к совместно используемому запросу"/>

<Image img={sql_console_edit_member} size="lg" border alt="Интерфейс для редактирования доступа членов к совместно используемому запросу"/>

В некоторых сценариях может потребоваться изменять шкалы осей для каждого поля независимо. Это также можно сделать в разделе «Расширенные» панели конфигурации диаграммы, указав минимальные и максимальные значения для диапазона осей. Например, вышеуказанная диаграмма выглядит хорошо, но для демонстрации корреляции между нашими полями `trip_total` и `fare_total` диапазоны осей нуждаются в некотором корректировании:

<Image img={sql_console_access_queries} size="lg" border alt="Раздел «Поделитесь со мной» в списке запросов"/>
