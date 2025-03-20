---
sidebar_label: SQL Консоль
sidebar_position: 1
---

import ExperimentalBadge from '@theme/badges/ExperimentalBadge';
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

- Подключения к вашим ClickHouse Cloud Сервисам
- Просмотра, фильтрации и сортировки данных таблиц
- Выполнения запросов и визуализации данных результата всего за несколько кликов
- Совместного использования запросов с членами команды и более эффективного сотрудничества.

## Исследование Таблиц {#exploring-tables}

### Просмотр списка таблиц и информации о схеме {#viewing-table-list-and-schema-info}

Обзор таблиц, содержащихся в вашем экземпляре ClickHouse, можно найти в области левой боковой панели. Используйте селектор базы данных в верхней части левой панели для просмотра таблиц в конкретной базе данных.

<img src={table_list_and_schema} alt="список таблиц и схема"/>

Таблицы в списке также можно развернуть для просмотра колонок и типов.

<img src={view_columns} alt="просмотр колонок"/>

### Исследование данных таблицы {#exploring-table-data}

Нажмите на таблицу в списке, чтобы открыть ее в новой вкладке. В представлении таблицы данные можно легко просмотреть, выбрать и скопировать. Обратите внимание, что структура и форматирование сохраняются при копировании и вставке в приложения для работы с таблицами, такие как Microsoft Excel и Google Sheets. Вы можете переключаться между страницами данных таблицы (разделенные на 30 строк) с помощью навигации в нижнем колонтитуле.

<img src={abc} alt="abc"/>

### Просмотр данных ячейки {#inspecting-cell-data}

Инструмент инспектора ячеек можно использовать для просмотра больших объемов данных, содержащихся в одной ячейке. Чтобы открыть его, щелкните правой кнопкой мыши на ячейке и выберите «Просмотреть ячейку». Содержимое инспектора ячейки можно скопировать, нажав на иконку копирования в правом верхнем углу содержимого инспектора.

<img src={inspecting_cell_content} alt="просмотр содержимого ячейки"/>

## Фильтрация и Сортировка Таблиц {#filtering-and-sorting-tables}

### Сортировка таблицы {#sorting-a-table}

Чтобы отсортировать таблицу в SQL консоли, откройте таблицу и выберите кнопку «Сортировать» на панели инструментов. Эта кнопка откроет меню, которое позволит вам настроить сортировку. Вы можете выбрать колонку, по которой хотите сортировать, и настроить порядок сортировки (по возрастанию или убыванию). Выберите «Применить» или нажмите Enter, чтобы отсортировать вашу таблицу.

<img src={sort_descending_on_column} alt="сортировать по убыванию в колонке"/>

SQL консоль также позволяет вам добавлять несколько сортировок к таблице. Нажмите кнопку «Сортировать» снова, чтобы добавить другую сортировку. Примечание: сортировки применяются в порядке их появления в окне сортировки (сверху вниз). Чтобы удалить сортировку, просто нажмите кнопку «x» рядом с сортировкой.

### Фильтрация таблицы {#filtering-a-table}

Чтобы отфильтровать таблицу в SQL консоли, откройте таблицу и выберите кнопку «Фильтр». Как и в случае с сортировкой, эта кнопка откроет меню, которое позволит вам настроить фильтр. Вы можете выбрать колонку, по которой хотите фильтровать, и выбрать необходимые критерии. SQL консоль интеллектуально отображает параметры фильтрации, которые соответствуют типу данных, содержащихся в колонке.

<img src={filter_on_radio_column_equal_gsm} alt="фильтровать по радиоколоночному равному gsm"/>

Когда вас устроит ваш фильтр, вы можете выбрать «Применить», чтобы отфильтровать ваши данные. Вы также можете добавить дополнительные фильтры, как показано ниже.

<img src={add_more_filters} alt="Добавить фильтр на диапазон больше 2000"/>

Подобно функции сортировки, нажмите кнопку «x» рядом с фильтром, чтобы удалить его.

### Фильтрация и сортировка вместе {#filtering-and-sorting-together}

SQL консоль позволяет вам фильтровать и сортировать таблицу одновременно. Для этого добавьте все желаемые фильтры и сортировки, следуя описанным выше шагам, и нажмите кнопку «Применить».

<img src={filtering_and_sorting_together} alt="Фильтрация и сортировка вместе"/>

### Создание запроса из фильтров и сортировок {#creating-a-query-from-filters-and-sorts}

SQL консоль может преобразовать ваши сортировки и фильтры непосредственно в запросы одним кликом. Просто выберите кнопку «Создать запрос» на панели инструментов с параметрами сортировки и фильтрации по вашему выбору. После нажатия «Создать запрос» откроется новая вкладка запроса, предварительно заполненная SQL командой, соответствующей данным в вашем представлении таблицы.

<img src={create_a_query_from_sorts_and_filters} alt="Создать запрос из сортировок и фильтров"/>

:::note
Фильтры и сортировки не являются обязательными при использовании функции «Создать запрос».
:::

Вы можете узнать больше о запросах в SQL консоли, прочитав (link) документацию по запросам.

## Создание и Запуск Запроса {#creating-and-running-a-query}

### Создание Запроса {#creating-a-query}

Существует два способа создать новый запрос в SQL консоли.

- Нажмите кнопку «+» в панели вкладок.
- Выберите кнопку «Новый запрос» из списка запросов в левой боковой панели.

<img src={creating_a_query} alt="Создание запроса"/>

### Запуск Запроса {#running-a-query}

Чтобы запустить запрос, введите ваши SQL команды в редактор SQL и нажмите кнопку «Запуск» или используйте комбинацию клавиш `cmd / ctrl + enter`. Чтобы написать и запустить несколько команд последовательно, убедитесь, что вы добавили точку с запятой после каждой команды.

Опции выполнения запроса
По умолчанию нажатие кнопки запуска выполнит все команды, содержащиеся в редакторе SQL. SQL консоль поддерживает две другие опции выполнения запросов:

- Выполнение выделенных команд
- Выполнение команды на курсоре

Чтобы выполнить выделенные команды, выделите нужную команду или последовательность команд и нажмите кнопку «Запуск» (или используйте комбинацию клавиш `cmd / ctrl + enter`). Вы также можете выбрать «Выполнить выделенные» из контекстного меню редактора SQL (открывается правым щелчком мыши в любом месте редактора), когда выделение присутствует.

<img src={run_selected_query} alt="выполнить выделенный запрос"/>

Выполнение команды в текущей позиции курсора можно осуществить двумя способами:

- Выберите «На курсоре» из меню расширенных опций запуска (или используйте соответствующую комбинацию клавиш `cmd / ctrl + shift + enter`).

<img src={run_at_cursor_2} alt="выполнить на курсоре"/>

  - Выбор «Выполнить на курсоре» из контекстного меню редактора SQL.

<img src={run_at_cursor} alt="выполнить на курсоре"/>

:::note
Команда, находящаяся в позиции курсора, будет мерцать желтым при выполнении.
:::

### Отмена Запроса {#canceling-a-query}

В то время как запрос выполняется, кнопка «Запуск» на панели инструментов редактора запроса будет заменена кнопкой «Отмена». Просто нажмите эту кнопку или клавишу `Esc`, чтобы отменить запрос. Примечание: любые результаты, которые уже были возвращены, останутся после отмены.

<img src={cancel_a_query} alt="Отменить запрос"/>

### Сохранение Запроса {#saving-a-query}

Если запрос не был ранее назван, он должен называться «Безымянный запрос». Нажмите на имя запроса, чтобы изменить его. Переименование запроса приведет к его сохранению.

<img src={give_a_query_a_name} alt="Дать запросу имя"/>

Вы также можете использовать кнопку сохранения или комбинацию клавиш `cmd / ctrl + s` для сохранения запроса.

<img src={save_the_query} alt="Сохранить запрос"/>

## Использование GenAI для управления запросами {#using-genai-to-manage-queries}

Эта функция позволяет пользователям писать запросы в виде вопросов на естественном языке, а консоль запроса создает SQL запросы на основе контекста доступных таблиц. GenAI также может помочь пользователям отлаживать их запросы.

Для получения дополнительной информации о GenAI, ознакомьтесь с [блогом о запуске предложений запросов на основе GenAI в ClickHouse Cloud](https://clickhouse.com/blog/announcing-genai-powered-query-suggestions-clickhouse-cloud).

### Настройка таблицы {#table-setup}

Давайте импортируем набор данных примера «Цена, оплаченная в Великобритании» и используем его для создания некоторых запросов GenAI.

1. Откройте сервис ClickHouse Cloud.
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

   Этот запрос должен занять около 1 секунды для завершения. После его выполнения у вас должна появиться пустая таблица под названием `uk_price_paid`.

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

Этот запрос получает набор данных с сайта `gov.uk`. Этот файл ~4 ГБ, поэтому выполнение этого запроса займет несколько минут. Когда ClickHouse обработает запрос, у вас должен быть весь набор данных в таблице `uk_price_paid`.

#### Создание запроса {#query-creation}

Создадим запрос на естественном языке.

1. Выберите таблицу **uk_price_paid**, а затем нажмите **Создать Запрос**.
1. Нажмите **Сгенерировать SQL**. Вам может быть предложено согласиться с тем, что ваши запросы отправляются в Chat-GPT. Вы должны выбрать **Согласен**, чтобы продолжить.
1. Теперь вы можете использовать этот запрос для ввода запроса на естественном языке и дать ChatGPT преобразовать его в SQL-запрос. В этом примере мы собираемся ввести:

   > Покажите мне общую цену и общее количество всех транзакций uk_price_paid по годам.

1. Консоль сгенерирует нужный нам запрос и отобразит его в новой вкладке. В нашем примере GenAI создал следующий запрос:

   ```sql
   -- Покажите мне общую цену и общее количество всех транзакций uk_price_paid по годам.
   SELECT year(date), sum(price) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. После того как вы убедитесь, что запрос верный, нажмите **Запустить** для его выполнения.

### Отладка {#debugging}

Теперь давайте протестируем возможности отладки запросов в GenAI.

1. Создайте новый запрос, нажав на иконку _+_ и вставьте следующий код:

   ```sql
   -- Покажите мне общую цену и общее количество всех транзакций uk_price_paid по годам.
   SELECT year(date), sum(pricee) as total_price, Count(*) as total_transactions
   FROM uk_price_paid
   GROUP BY year(date)
   ```

1. Нажмите **Запустить**. Запрос не выполняется, так как мы пытаемся получить значения из `pricee`, вместо `price`.
1. Нажмите **Исправить Запрос**.
1. GenAI попытается исправить запрос. В этом случае он изменил `pricee` на `price`. Он также понял, что`toYear` — это лучшая функция для использования в данном случае.
1. Выберите **Применить**, чтобы добавить предложенные изменения в ваш запрос, и нажмите **Запустить**.

Имейте в виду, что GenAI является экспериментальной функцией. Будьте осторожны при запуске сгенерированных GenAI запросов против любых наборов данных.

## Расширенные функции запросов {#advanced-querying-features}

### Поиск результатов запроса {#searching-query-results}

После выполнения запроса вы можете быстро искать в возвращенном наборе результатов, используя строку поиска в области результата. Эта функция помогает предварительно просмотреть результаты дополнительного `WHERE` условия или просто проверить, что определенные данные включены в набор результатов. После ввода значения в строку поиска область результатов обновится и вернет записи, содержащие запись, соответствующую введенному значению. В этом примере мы будем искать все экземпляры `breakfast` в таблице `hackernews` для комментариев, которые содержат `ClickHouse` (без учета регистра):

<img src={search_hn} alt="Поиск данных Hacker News"/>

Примечание: любое поле, соответствующее введенному значению, будет возвращено. Например, третья запись в приведенном выше скриншоте не соответствует 'breakfast' в поле `by`, но поле `text` соответствует:

<img src={match_in_body} alt="Совпадение в теле"/>

### Настройка параметров пагинации {#adjusting-pagination-settings}

По умолчанию область результатов запроса отобразит каждую запись результата на одной странице. Для больших наборов результатов может быть предпочтительнее разбивать результаты на страницы для удобства просмотра. Это можно сделать с помощью селектора пагинации в правом нижнем углу области результата:

<img src={pagination} alt="Параметры пагинации"/>

Выбор размера страницы немедленно применит пагинацию к набору результатов, и параметры навигации появятся в средней части нижнего колонтитула области результата.

<img src={pagination_nav} alt="Навигация по пагинации"/>

### Экспорт результатов запроса {#exporting-query-result-data}

Наборы результатов запросов можно легко экспортировать в формате CSV прямо из SQL консоли. Для этого откройте меню `•••` с правой стороны панели инструментов области результата и выберите «Скачать как CSV».

<img src={download_as_csv} alt="Скачать как CSV"/>

## Визуализация Данных Запроса {#visualizing-query-data}

Некоторые данные могут быть легче интерпретированы в виде графиков. Вы можете быстро создать визуализации из данных результата запроса прямо из SQL консоли всего за несколько кликов. В качестве примера мы воспользуемся запросом, который рассчитывает недельную статистику поездок такси в NYC:

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

<img src={tabular_query_results} alt="Табличные результаты запроса"/>

Без визуализации эти результаты трудно интерпретировать. Давайте превратим их в график.

### Создание графиков {#creating-charts}

Чтобы начать создание вашей визуализации, выберите вариант «График» на панели инструментов области результата запроса. Появится панель конфигурации графика:

<img src={switch_from_query_to_chart} alt="Переключить с запроса на график"/>

Мы начнем с создания простого столбчатого графика, отслеживающего `trip_total` по `week`. Для этого мы перетащим поле `week` на ось x и поле `trip_total` на ось y:

<img src={trip_total_by_week} alt="Общее количество поездок по неделям"/>

Большинство типов графиков поддерживают несколько полей на числовых осях. Чтобы продемонстрировать, мы перетащим поле fare_total на ось y:

<img src={bar_chart} alt="Столбчатый график"/>

### Настройка графиков {#customizing-charts}

SQL консоль поддерживает десять типов графиков, которые можно выбрать из селектора типов графиков на панели конфигурации графиков. Например, мы можем легко изменить предыдущий тип графика с "Столбчатый" на "Площадь":

<img src={change_from_bar_to_area} alt="Изменить график с баров на площадь"/>

Названия графиков соответствуют имени запроса, который поставляет данные. Обновление имени запроса приведет к обновлению названия графика.

<img src={update_query_name} alt="Обновление имени запроса"/>

Некоторые более продвинутые характеристики графиков также могут быть настроены в разделе «Расширенные» панели конфигурации графика. Для начала мы отрегулируем следующие настройки:

- Подзаголовок
- Заголовки осей
- Ориентация меток для оси x

Наш график будет обновлен соответственно:

<img src={update_subtitle_etc} alt="Обновление подзаголовка и пр."/>

В некоторых случаях может потребоваться настроить масштабы осей для каждого поля независимо. Это также можно сделать в разделе «Расширенные» панели конфигурации графиков, указав минимальные и максимальные значения для диапазона осей. В качестве примера, приведенный выше график выглядит хорошо, но для демонстрации корреляции между нашими полями `trip_total` и `fare_total` диапазоны осей требуют некоторых корректировок:

<img src={adjust_axis_scale} alt="Настройка масштаба осей"/>
