---
'sidebar_label': 'SQL Console'
'sidebar_position': 1
'title': 'SQL Console'
'slug': '/integrations/sql-clients/sql-console'
'description': 'Узнайте о SQL Console'
'doc_type': 'guide'
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

SQL консоль — это самый быстрый и простой способ исследовать и выполнять запросы к вашим базам данных в ClickHouse Cloud. Вы можете использовать SQL консоль для:

- Подключения к вашим ClickHouse Cloud Services
- Просмотра, фильтрации и сортировки данных таблиц
- Выполнения запросов и визуализации данных результатов всего за несколько кликов
- Обмен запросами с членами команды и более эффективного сотрудничества.

## Исследование таблиц {#exploring-tables}

### Просмотр списка таблиц и информации о схеме {#viewing-table-list-and-schema-info}

Обзор таблиц, содержащихся в вашей ClickHouse инстансе, можно найти в левой боковой панели. Используйте селектор базы данных в верхней части левой панели, чтобы просмотреть таблицы в конкретной базе данных

<Image img={table_list_and_schema} size="lg" border alt="Список таблиц и вид схемы, показывающий таблицы базы данных в левой боковой панели"/>

Таблицы в списке также можно развернуть, чтобы просмотреть столбцы и типы

<Image img={view_columns} size="lg" border alt="Вид развернутой таблицы с названием столбцов и типами данных"/>

### Исследование данных таблицы {#exploring-table-data}

Щелкните на таблицу в списке, чтобы открыть ее в новой вкладке. В представлении таблицы данные можно легко просматривать, выбирать и копировать. Обратите внимание, что структура и форматирование сохраняются при копировании и вставке в приложения для работы с таблицами, такие как Microsoft Excel и Google Sheets. Вы можете переключаться между страницами данных таблицы (пагинация по 30 строк) с помощью навигации в нижнем колонтитуле.

<Image img={abc} size="lg" border alt="Представление таблицы с данными, которые можно выбрать и скопировать"/>

### Изучение данных ячейки {#inspecting-cell-data}

Инструмент проверки ячеек можно использовать для просмотра больших объемов данных, содержащихся в одной ячейке. Чтобы открыть его, щелкните правой кнопкой мыши на ячейке и выберите 'Проверить ячейку'. Содержимое инспектора ячейки можно скопировать, нажав на иконку копирования в верхнем правом углу содержимого инспектора.

<Image img={inspecting_cell_content} size="lg" border alt="Диалог инспектора ячейки, показывающий содержимое выбранной ячейки"/>

## Фильтрация и сортировка таблиц {#filtering-and-sorting-tables}

### Сортировка таблицы {#sorting-a-table}

Чтобы отсортировать таблицу в SQL консоли, откройте таблицу и выберите кнопку 'Сортировать' на панели инструментов. Эта кнопка откроет меню, которое позволит вам настроить сортировку. Вы можете выбрать столбец, по которому будете сортировать, и настроить порядок сортировки (по возрастанию или убыванию). Выберите 'Применить' или нажмите Enter, чтобы отсортировать вашу таблицу

<Image img={sort_descending_on_column} size="lg" border alt="Диалог сортировки с настройками для сортировки по убыванию по столбцу"/>

SQL консоль также позволяет вам добавлять несколько сортировок к таблице. Щелкните кнопку 'Сортировать' снова, чтобы добавить другую сортировку. Примечание: сортировки применяются в порядке их появления в области сортировки (сверху вниз). Чтобы удалить сортировку, просто нажмите кнопку 'x' рядом с сортировкой.

### Фильтрация таблицы {#filtering-a-table}

Чтобы отфильтровать таблицу в SQL консоли, откройте таблицу и выберите кнопку 'Фильтр'. Точно так же, как и в сортировке, эта кнопка откроет меню, которое позволит вам настроить фильтр. Вы можете выбрать столбец, по которому будете фильтровать, и выбрать необходимые критерии. SQL консоль интеллектуально отображает параметры фильтра, соответствующие типу данных, содержащимся в столбце.

<Image img={filter_on_radio_column_equal_gsm} size="lg" border alt="Диалог фильтрации с настройками фильтрации радиостанции, равной GSM"/>

Когда вы будете довольны вашим фильтром, вы можете выбрать 'Применить', чтобы отфильтровать ваши данные. Вы также можете добавлять дополнительные фильтры, как показано ниже.

<Image img={add_more_filters} size="lg" border alt="Диалог, показывающий, как добавить дополнительный фильтр на диапазон больше 2000"/>

Аналогично функции сортировки, щелкните кнопку 'x' рядом с фильтром, чтобы удалить его.

### Фильтрация и сортировка вместе {#filtering-and-sorting-together}

SQL консоль позволяет вам фильтровать и сортировать таблицу одновременно. Для этого добавьте все желаемые фильтры и сортировки, используя шаги, описанные выше, и нажмите кнопку 'Применить'.

<Image img={filtering_and_sorting_together} size="lg" border alt="Интерфейс, показывающий одновременное применение фильтрации и сортировки"/>

### Создание запроса из фильтров и сортировок {#creating-a-query-from-filters-and-sorts}

SQL консоль может преобразовать ваши сортировки и фильтры непосредственно в запросы одним кликом. Просто выберите кнопку 'Создать запрос' на панели инструментов с параметрами сортировки и фильтра по вашему выбору. После нажатия 'Создать запрос' откроется новая вкладка с предзаполненной командой SQL, соответствующей данным, содержащимся в вашем представлении таблицы.

<Image img={create_a_query_from_sorts_and_filters} size="lg" border alt="Интерфейс, показывающий кнопку Создать запрос, которая генерирует SQL из фильтров и сортировок"/>

:::note
Фильтры и сортировки не являются обязательными при использовании функции 'Создать запрос'.
:::

Вы можете узнать больше о запросах в SQL консоли, прочитав [документацию по запросам](link).

## Создание и выполнение запроса {#creating-and-running-a-query}

### Создание запроса {#creating-a-query}

Существует два способа создать новый запрос в SQL консоли.

- Щелкните кнопку '+' на панели вкладок
- Выберите кнопку 'Новый запрос' из списка запросов в левой боковой панели

<Image img={creating_a_query} size="lg" border alt="Интерфейс, показывающий, как создать новый запрос, используя кнопку + или кнопку Новый запрос"/>

### Выполнение запроса {#running-a-query}

Чтобы выполнить запрос, введите свои SQL команд(ы) в SQL редактор и нажмите кнопку 'Запустить' или используйте сочетание клавиш `cmd / ctrl + enter`. Чтобы написать и выполнить несколько команд последовательно, убедитесь, что после каждой команды стоит точка с запятой.

Опции выполнения запросов
По умолчанию нажатие на кнопку запуска выполнит все команды, содержащиеся в SQL редакторе. SQL консоль поддерживает две другие опции выполнения запросов:

- Выполнить выделенные команд(ы)
- Выполнить команду на текущей позиции курсора

Чтобы выполнить выделенные команд(ы), выделите желаемую команду или последовательность команд и нажмите кнопку 'Запустить' (или используйте сочетание клавиш `cmd / ctrl + enter`). Вы также можете выбрать 'Выполнить выделенное' из контекстного меню SQL редактора (открывается правым щелчком мыши в редакторе) при наличии выделения.

<Image img={run_selected_query} size="lg" border alt="Интерфейс, показывающий, как выполнить выделенную часть SQL запроса"/>

Выполнить команду в текущей позиции курсора можно несколькими способами:

- Выбрать 'На курсоре' из меню расширенных опций запуска (или используйте соответствующее сочетание клавиш `cmd / ctrl + shift + enter`)

<Image img={run_at_cursor_2} size="lg" border alt="Опция Выполнить на курсоре в меню расширенных опций запуска"/>

- Выбор 'Выполнить на курсоре' из контекстного меню SQL редактора

<Image img={run_at_cursor} size="lg" border alt="Опция Выполнить на курсоре в контекстном меню SQL редактора"/>

:::note
Команда, находящаяся в позиции курсора, будет мигать желтым при выполнении.
:::

### Отмена запроса {#canceling-a-query}

Пока запрос выполняется, кнопка 'Запустить' на панели инструментов редактора запросов будет заменена на кнопку 'Отменить'. Просто нажмите эту кнопку или нажмите `Esc`, чтобы отменить запрос. Примечание: любые результаты, которые уже были возвращены, сохранятся после отмены.

<Image img={cancel_a_query} size="lg" border alt="Кнопка отмены, которая появляется во время выполнения запроса"/>

### Сохранение запроса {#saving-a-query}

Если запрос еще не был назван, его следует назвать 'Безымянный запрос'. Щелкните на имени запроса, чтобы изменить его. Переименование запроса приведет к его сохранению.

<Image img={give_a_query_a_name} size="lg" border alt="Интерфейс, показывающий, как переименовать запрос из Безымянного запроса"/>

Вы также можете использовать кнопку сохранения или сочетание клавиш `cmd / ctrl + s`, чтобы сохранить запрос.

<Image img={save_the_query} size="lg" border alt="Кнопка сохранения на панели инструментов редактора запросов"/>

## Использование GenAI для управления запросами {#using-genai-to-manage-queries}

Эта функция позволяет пользователям писать запросы в виде вопросов на естественном языке и позволяет консоли запросов создавать SQL запросы на основе контекста доступных таблиц. GenAI также может помочь пользователям отлаживать их запросы.

Для получения дополнительной информации о GenAI ознакомьтесь с [постом в блоге о запуске предложений по запросам на базе GenAI в ClickHouse Cloud](https://clickhouse.com/blog/announcing-genai-powered-query-suggestions-clickhouse-cloud).

### Настройка таблицы {#table-setup}

Давайте импортируем примерный набор данных UK Price Paid и используем его для создания некоторых запросов GenAI.

1. Откройте сервис ClickHouse Cloud.
1. Создайте новый запрос, щелкнув по значку _+_.
1. Вставьте и запустите следующий код:

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

   Этот запрос должен завершиться за примерно 1 секунду. Когда он завершится, у вас должна быть пустая таблица под названием `uk_price_paid`.

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

Этот запрос получает набор данных с сайта `gov.uk`. Этот файл весит ~4 ГБ, поэтому выполнение этого запроса займет несколько минут. Как только ClickHouse обработает запрос, у вас должен быть весь набор данных в таблице `uk_price_paid`.

#### Создание запроса {#query-creation}

Давайте создадим запрос с использованием естественного языка.

1. Выберите таблицу **uk_price_paid**, а затем щелкните **Создать запрос**.
1. Щелкните **Сгенерировать SQL**. Возможно, вас попросят подтвердить, что ваши запросы отправляются в Chat-GPT. Вы должны выбрать **Я согласен**, чтобы продолжить.
1. Теперь вы можете использовать этот запрос для ввода запроса на естественном языке и разрешить ChatGPT преобразовать его в SQL запрос. В этом примере мы введем:

   > Покажите мне общую стоимость и общее количество всех транзакций uk_price_paid по годам.

1. Консоль сгенерирует искомый запрос и отобразит его в новой вкладке. В нашем примере GenAI создал следующий запрос:

```sql
-- Show me the total price and total number of all uk_price_paid transactions by year.
SELECT year(date), sum(price) as total_price, Count(*) as total_transactions
FROM uk_price_paid
GROUP BY year(date)
```

1. После того, как вы удостоверитесь, что запрос верный, нажмите **Запустить**, чтобы выполнить его.

### Отладка {#debugging}

Теперь давайте протестируем возможности отладки запросов GenAI.

1. Создайте новый запрос, нажав на значок _+_, и вставьте следующий код:

```sql
-- Show me the total price and total number of all uk_price_paid transactions by year.
SELECT year(date), sum(pricee) as total_price, Count(*) as total_transactions
FROM uk_price_paid
GROUP BY year(date)
```

1. Нажмите **Запустить**. Запрос не удается выполнить, так как мы пытаемся получить значения из `pricee`, а не из `price`.
1. Нажмите **Исправить запрос**.
1. GenAI попытается исправить запрос. В данном случае он изменил `pricee` на `price`. Он также осознал, что `toYear` — лучшая функция для использования в данной ситуации.
1. Выберите **Применить**, чтобы добавить предложенные изменения к вашему запросу, и нажмите **Запустить**.

Имейте в виду, что GenAI является экспериментальной функцией. Будьте осторожны при выполнении сгенерированных GenAI запросов против любых наборов данных.

## Расширенные функции запросов {#advanced-querying-features}

### Поиск результатов запросов {#searching-query-results}

После выполнения запроса вы можете быстро искать в возвращенном наборе результатов, используя поле поиска в области результатов. Эта функция помогает в предварительном просмотре результатов дополнительного оператора `WHERE` или просто проверке, что определенные данные включены в набор результатов. После ввода значения в поле поиска область результатов обновится и вернет записи, содержащие запись, соответствующую введенному значению. В этом примере мы будем искать все экземпляры `breakfast` в таблице `hackernews` для комментариев, содержащих `ClickHouse` (без учета регистра):

<Image img={search_hn} size="lg" border alt="Поиск данных Hacker News"/>

Примечание: любое поле, соответствующее введенному значению, будет возвращено. Например, третья запись на скриншоте выше не соответствует 'breakfast' в поле `by`, но поле `text` соответствует:

<Image img={match_in_body} size="lg" border alt="Совпадение в теле"/>

### Настройка параметров пагинации {#adjusting-pagination-settings}

По умолчанию область результатов запроса будет отображать каждую запись на одной странице. Для более крупных наборов результатов может быть удобнее использовать пагинацию для облегчения просмотра. Это можно сделать с помощью селектора пагинации в нижнем правом углу области результатов:

<Image img={pagination} size="lg" border alt="Опции пагинации"/>

Выбор размера страницы немедленно применит пагинацию к набору результатов, и параметры навигации появятся в середине нижнего колонтитула области результатов

<Image img={pagination_nav} size="lg" border alt="Навигация по пагинации"/>

### Экспорт данных результата запроса {#exporting-query-result-data}

Наборы результатов запросов можно легко экспортировать в формат CSV непосредственно из SQL консоли. Для этого откройте меню `•••` на правой стороне панели инструментов области результатов и выберите 'Скачать как CSV'.

<Image img={download_as_csv} size="lg" border alt="Скачать как CSV"/>

## Визуализация данных запроса {#visualizing-query-data}

Некоторые данные легче интерпретировать в виде диаграмм. Вы можете быстро создать визуализации из данных результатов запроса прямо из SQL консоли всего за несколько кликов. Например, мы будем использовать запрос, который рассчитывает недельную статистику поездок такси в Нью-Йорке:

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

<Image img={tabular_query_results} size="lg" border alt="Табличные результаты запроса"/>

Без визуализации эти результаты трудно интерпретировать. Давайте превратим их в диаграмму.

### Создание диаграмм {#creating-charts}

Чтобы начать создание вашей визуализации, выберите опцию 'Диаграмма' на панели инструментов области результатов запроса. Появится панель конфигурации диаграммы:

<Image img={switch_from_query_to_chart} size="lg" border alt="Переключение с запроса на диаграмму"/>

Мы начнем с создания простой столбчатой диаграммы, отслеживающей `trip_total` по `week`. Для этого мы перетащим поле `week` на ось x и поле `trip_total` на ось y:

<Image img={trip_total_by_week} size="lg" border alt="Общая стоимость поездки по неделям"/>

Большинство типов диаграмм поддерживает несколько полей на числовых осях. Чтобы продемонстрировать это, мы перетащим поле fare_total на ось y:

<Image img={bar_chart} size="lg" border alt="Столбчатая диаграмма"/>

### Настройка диаграмм {#customizing-charts}

SQL консоль поддерживает десять типов диаграмм, которые можно выбрать из селектора типов диаграмм в панели конфигурации диаграммы. Например, мы можем легко изменить тип предыдущей диаграммы с столбчатой на область:

<Image img={change_from_bar_to_area} size="lg" border alt="Изменение с Столбчатой диаграммы на Областную"/>

Заголовки диаграмм соответствуют названию запроса, поставляющего данные. Обновление названия запроса приведет к обновлению заголовка диаграммы:

<Image img={update_query_name} size="lg" border alt="Обновление названия запроса"/>

Некоторые более продвинутые характеристики диаграмм также можно настроить в разделе 'Расширенные' панели конфигурации диаграммы. Для начала мы скорректируем следующие настройки:

- Подзаголовок
- Заголовки осей
- Ориентация меток для оси x

Наша диаграмма будет обновлена соответствующим образом:

<Image img={update_subtitle_etc} size="lg" border alt="Обновление подзаголовка и т.д."/>

В некоторых случаях может быть необходимо отдельно настроить масштабы осей для каждого поля. Это также можно сделать в разделе 'Расширенные' панели конфигурации диаграммы, указав минимальные и максимальные значения для диапазона оси. Например, вышеуказанная диаграмма выглядит хорошо, но для демонстрации корреляции между нашими полями `trip_total` и `fare_total` диапазоны осей требуют некоторой корректировки:

<Image img={adjust_axis_scale} size="lg" border alt="Настройка масштаба осей"/>

## Обмен запросами {#sharing-queries}

SQL консоль позволяет вам делиться запросами с вашей командой. Когда запрос делится, все члены команды могут видеть и редактировать его. Общие запросы — это отличный способ сотрудничества с вашей командой.

Чтобы поделиться запросом, нажмите кнопку 'Поделиться' на панели инструментов запроса.

<Image img={sql_console_share} size="lg" border alt="Кнопка Поделиться на панели инструментов запроса"/>

Откроется диалоговое окно, позволяющее вам поделиться запросом со всеми членами команды. Если у вас несколько команд, вы можете выбрать, с какой командой поделиться запросом.

<Image img={sql_console_edit_access} size="lg" border alt="Диалог редактирования доступа к общему запросу"/>

<Image img={sql_console_add_team} size="lg" border alt="Интерфейс для добавления команды к общему запросу"/>

<Image img={sql_console_edit_member} size="lg" border alt="Интерфейс для редактирования доступа участников к общему запросу"/>

В некоторых случаях может быть необходимо отдельно настроить масштабы осей для каждого поля. Это также можно сделать в разделе 'Расширенные' панели конфигурации диаграммы, указав минимальные и максимальные значения для диапазона оси. Например, вышеуказанная диаграмма выглядит хорошо, но для демонстрации корреляции между нашими полями `trip_total` и `fare_total` диапазоны осей требуют некоторой корректировки:

<Image img={sql_console_access_queries} size="lg" border alt="Раздел 'Общие запросы' в списке запросов"/>
