---
description: 'Набор данных с количеством дизлайков видео на YouTube.'
sidebar_label: 'Дизлайки YouTube'
slug: /getting-started/example-datasets/youtube-dislikes
title: 'Набор данных YouTube о дизлайках'
doc_type: 'guide'
keywords: ['пример набора данных', 'youtube', 'образцы данных', 'аналитика видео', 'дизлайки']
---

В ноябре 2021 года YouTube убрал публичный счётчик ***дизлайков*** у всех своих видео. Хотя авторы по-прежнему могут видеть количество дизлайков, зрители теперь видят только количество ***лайков***, которые получило видео.

:::important
Набор данных содержит более 4,55 миллиарда записей, поэтому не спешите просто копировать и выполнять приведённые ниже команды, если ваши ресурсы не способны обработать такой объём данных. Команды ниже были выполнены на **Production**-инстансе [ClickHouse Cloud](https://clickhouse.cloud).
:::

Данные представлены в формате JSON и могут быть загружены с [archive.org](https://archive.org/download/dislikes_youtube_2021_12_video_json_files). Мы также разместили эти данные в S3, чтобы их можно было более эффективно загружать в инстанс ClickHouse Cloud.

Ниже приведены шаги для создания таблицы в ClickHouse Cloud и загрузки данных.

:::note
Приведённые ниже шаги также без проблем подойдут для локальной установки ClickHouse. Единственное изменение — использовать функцию `s3` вместо `s3cluster` (если только у вас не настроен кластер — в этом случае замените `default` на имя вашего кластера).
:::

## Пошаговые инструкции {#step-by-step-instructions}

<VerticalStepper headerLevel="h3">
  ### Исследование данных

  Давайте посмотрим, как выглядят данные. Табличная функция `s3cluster` возвращает таблицу, поэтому мы можем применить `DESCRIBE` к результату:

  ```sql
  DESCRIBE s3(
      'https://clickhouse-public-datasets.s3.amazonaws.com/youtube/original/files/*.zst',
      'JSONLines'
  );
  ```

  ClickHouse определяет следующую схему из JSON-файла:

  ```response
  ┌─name────────────────┬─type───────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┬─default_type─┬─default_expression─┬─comment─┬─codec_expression─┬─ttl_expression─┐
  │ id                  │ Nullable(String)                                                                                                                       │              │                    │         │                  │                │
  │ fetch_date          │ Nullable(String)                                                                                                                       │              │                    │         │                  │                │
  │ upload_date         │ Nullable(String)                                                                                                                       │              │                    │         │                  │                │
  │ title               │ Nullable(String)                                                                                                                       │              │                    │         │                  │                │
  │ uploader_id         │ Nullable(String)                                                                                                                       │              │                    │         │                  │                │
  │ uploader            │ Nullable(String)                                                                                                                       │              │                    │         │                  │                │
  │ uploader_sub_count  │ Nullable(Int64)                                                                                                                        │              │                    │         │                  │                │
  │ is_age_limit        │ Nullable(Bool)                                                                                                                         │              │                    │         │                  │                │
  │ view_count          │ Nullable(Int64)                                                                                                                        │              │                    │         │                  │                │
  │ like_count          │ Nullable(Int64)                                                                                                                        │              │                    │         │                  │                │
  │ dislike_count       │ Nullable(Int64)                                                                                                                        │              │                    │         │                  │                │
  │ is_crawlable        │ Nullable(Bool)                                                                                                                         │              │                    │         │                  │                │
  │ is_live_content     │ Nullable(Bool)                                                                                                                         │              │                    │         │                  │                │
  │ has_subtitles       │ Nullable(Bool)                                                                                                                         │              │                    │         │                  │                │
  │ is_ads_enabled      │ Nullable(Bool)                                                                                                                         │              │                    │         │                  │                │
  │ is_comments_enabled │ Nullable(Bool)                                                                                                                         │              │                    │         │                  │                │
  │ description         │ Nullable(String)                                                                                                                       │              │                    │         │                  │                │
  │ rich_metadata       │ Array(Tuple(call Nullable(String), content Nullable(String), subtitle Nullable(String), title Nullable(String), url Nullable(String))) │              │                    │         │                  │                │
  │ super_titles        │ Array(Tuple(text Nullable(String), url Nullable(String)))                                                                              │              │                    │         │                  │                │
  │ uploader_badges     │ Nullable(String)                                                                                                                       │              │                    │         │                  │                │
  │ video_badges        │ Nullable(String)                                                                                                                       │              │                    │         │                  │                │
  └─────────────────────┴────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┴──────────────┴────────────────────┴─────────┴──────────────────┴────────────────┘
  ```

  ### Создайте таблицу

  На основе выведенной схемы были уточнены типы данных и добавлен первичный ключ.
  Создайте следующую таблицу:

  ```sql
  CREATE TABLE youtube
  (
      `id` String,
      `fetch_date` DateTime,
      `upload_date_str` String,
      `upload_date` Date,
      `title` String,
      `uploader_id` String,
      `uploader` String,
      `uploader_sub_count` Int64,
      `is_age_limit` Bool,
      `view_count` Int64,
      `like_count` Int64,
      `dislike_count` Int64,
      `is_crawlable` Bool,
      `has_subtitles` Bool,
      `is_ads_enabled` Bool,
      `is_comments_enabled` Bool,
      `description` String,
      `rich_metadata` Array(Tuple(call String, content String, subtitle String, title String, url String)),
      `super_titles` Array(Tuple(text String, url String)),
      `uploader_badges` String,
      `video_badges` String
  )
  ENGINE = MergeTree
  ORDER BY (uploader, upload_date)
  ```

  ### Вставка данных

  Следующая команда потоково загружает записи из файлов S3 в таблицу `youtube`.

  :::important
  Эта операция вставляет большой объем данных — 4,65 миллиарда строк. Если вам не требуется весь набор данных, просто добавьте условие `LIMIT` с нужным количеством строк.
  :::

  ```sql
  INSERT INTO youtube
  SETTINGS input_format_null_as_default = 1
  SELECT
      id,
      parseDateTimeBestEffortUSOrZero(toString(fetch_date)) AS fetch_date,
      upload_date AS upload_date_str,
      toDate(parseDateTimeBestEffortUSOrZero(upload_date::String)) AS upload_date,
      ifNull(title, '') AS title,
      uploader_id,
      ifNull(uploader, '') AS uploader,
      uploader_sub_count,
      is_age_limit,
      view_count,
      like_count,
      dislike_count,
      is_crawlable,
      has_subtitles,
      is_ads_enabled,
      is_comments_enabled,
      ifNull(description, '') AS description,
      rich_metadata,
      super_titles,
      ifNull(uploader_badges, '') AS uploader_badges,
      ifNull(video_badges, '') AS video_badges
  FROM s3(
      'https://clickhouse-public-datasets.s3.amazonaws.com/youtube/original/files/*.zst',
      'JSONLines'
  )
  ```

  Несколько комментариев к команде `INSERT`:

  * Функция `parseDateTimeBestEffortUSOrZero` удобна, когда входящие поля даты могут быть в некорректном формате. Если `fetch_date` не удастся корректно разобрать, ему будет присвоено значение `0`.
  * Столбец `upload_date` содержит валидные даты, но также и строки вроде &quot;4 hours ago&quot; — что, очевидно, не является валидной датой. Мы решили сохранять исходное значение в `upload_date_str` и пытаться распарсить его с помощью `toDate(parseDateTimeBestEffortUSOrZero(upload_date::String))`. Если парсинг не удаётся, мы просто получаем `0`.
  * Мы использовали `ifNull`, чтобы избежать появления значений `NULL` в нашей таблице. Если входящее значение равно `NULL`, функция `ifNull` присваивает ему пустую строку

  ### Подсчитайте количество строк

  Откройте новую вкладку в SQL Console ClickHouse Cloud (или новое окно `clickhouse-client`) и следите за увеличением счётчика.
  Вставка 4,56 млрд строк займёт некоторое время в зависимости от ресурсов сервера. (Без настройки параметров это занимает около 4,5 часов.)

  ```sql
  SELECT formatReadableQuantity(count())
  FROM youtube
  ```

  ```response
  ┌─formatReadableQuantity(count())─┐
  │ 4,56 миллиарда                  │
  └─────────────────────────────────┘
  ```

  ### Изучение данных

  После вставки данных можно подсчитать количество дизлайков для ваших любимых видео или каналов. Посмотрим, сколько видео было загружено каналом ClickHouse:

  ```sql
  SELECT count()
  FROM youtube
  WHERE uploader = 'ClickHouse';
  ```

  ```response
  ┌─count()─┐
  │      84 │
  └─────────┘

  Получена 1 строка. Прошло: 0.570 сек. Обработано 237.57 тыс. строк, 5.77 МБ (416.54 тыс. строк/сек., 10.12 МБ/сек.)
  ```

  :::note
  Запрос выполняется так быстро, потому что мы выбрали `uploader` в качестве первого столбца первичного ключа — поэтому потребовалось обработать только 237 тыс. строк.
  :::

  Рассмотрим лайки и дизлайки видеороликов о ClickHouse:

  ```sql
  SELECT
      title,
      like_count,
      dislike_count
  FROM youtube
  WHERE uploader = 'ClickHouse'
  ORDER BY dislike_count DESC;
  ```

  Ответ выглядит следующим образом:

  ```response
  ┌─title────────────────────────────────────────────────────────────────────────────────────────────────┬─like_count─┬─dislike_count─┐
  │ ClickHouse v21.11 Release Webinar                                                                    │         52 │             3 │
  │ ClickHouse Introduction                                                                              │         97 │             3 │
  │ Casa Modelo Algarve                                                                                  │        180 │             3 │
  │ Профайлер запросов:  трудный путь                                                                    │         33 │             3 │
  │ ClickHouse в Курсометре                                                                              │          4 │             2 │
  │ 10 Good Reasons to Use ClickHouse                                                                    │         27 │             2 │
  ...

  Получено 84 строки. Затрачено: 0,013 сек. Обработано 155,65 тыс. строк, 16,94 МБ (11,96 млн строк/с., 1,30 ГБ/с.)
  ```

  Вот пример поиска видео с упоминанием **ClickHouse** в полях `title` или `description`:

  ```sql
  SELECT
      view_count,
      like_count,
      dislike_count,
      concat('https://youtu.be/', id) AS url,
      title
  FROM youtube
  WHERE (title ILIKE '%ClickHouse%') OR (description ILIKE '%ClickHouse%')
  ORDER BY
      like_count DESC,
      view_count DESC;
  ```

  Этот запрос должен обработать каждую строку и выполнить парсинг двух столбцов со строковыми данными. Тем не менее, производительность остается достойной — 4,15 млн строк в секунду:

  ```response
  Получено 1174 строк. Затрачено: 1099,368 сек. Обработано 4,56 млрд строк, 1,98 ТБ (4,15 млн строк/с., 1,80 ГБ/с.)
  ```

  Результаты выглядят следующим образом:

  ```response
  ┌─view_count─┬─like_count─┬─dislike_count─┬─url──────────────────────────┬─title──────────────────────────────────────────────────────────────────────────────────────────────────┐
  │       1919 │         63 │             1 │ https://youtu.be/b9MeoOtAivQ │ Вебинар по выпуску ClickHouse v21.10                                                                   │
  │       8710 │         62 │             4 │ https://youtu.be/PeV1mC2z--M │ Что такое JDBC DriverManager? | JDBC                                                                   │
  │       3534 │         62 │             1 │ https://youtu.be/8nWRhK9gw10 │ CLICKHOUSE - Модульная архитектура                                                                     │
  ```
</VerticalStepper>

## Вопросы {#questions}

### Если отключить комментарии, уменьшится ли вероятность того, что кто-то поставит лайк или дизлайк?

Когда комментарии отключены, станут ли люди чаще ставить лайки или дизлайки, чтобы выразить своё отношение к видео?

```sql
SELECT
    concat('< ', formatReadableQuantity(view_range)) AS просмотры,
    is_comments_enabled,
    total_clicks / num_views AS вероятность_реакции
FROM
(
    SELECT
        is_comments_enabled,
        power(10, CEILING(log10(view_count + 1))) AS view_range,
        sum(like_count + dislike_count) AS всего_реакций,
        sum(view_count) AS число_просмотров
    FROM youtube
    GROUP BY
        view_range,
        is_comments_enabled
) WHERE view_range > 1
ORDER BY
    is_comments_enabled ASC,
    num_views ASC;
```

```response
┌─views─────────────┬─is_comments_enabled─┬────prob_like_dislike─┐
│ < 10.00           │ false               │  0.08224180712685371 │
│ < 100.00          │ false               │  0.06346337759167248 │
│ < 1.00 thousand   │ false               │  0.03201883652987105 │
│ < 10.00 thousand  │ false               │  0.01716073540410903 │
│ < 10.00 billion   │ false               │ 0.004555639481829971 │
│ < 100.00 thousand │ false               │  0.01293351460515323 │
│ < 1.00 billion    │ false               │ 0.004761811192464957 │
│ < 1.00 million    │ false               │ 0.010472604018980551 │
│ < 10.00 million   │ false               │  0.00788902538420125 │
│ < 100.00 million  │ false               │  0.00579152804250582 │
│ < 10.00           │ true                │  0.09819517478134059 │
│ < 100.00          │ true                │  0.07403784478585775 │
│ < 1.00 thousand   │ true                │  0.03846294910067627 │
│ < 10.00 billion   │ true                │ 0.005615217329358215 │
│ < 10.00 thousand  │ true                │  0.02505881391701455 │
│ < 1.00 billion    │ true                │ 0.007434998802482997 │
│ < 100.00 thousand │ true                │ 0.022694648130822004 │
│ < 100.00 million  │ true                │ 0.011761563746575625 │
│ < 1.00 million    │ true                │ 0.020776022304589435 │
│ < 10.00 million   │ true                │ 0.016917095718089584 │
└───────────────────┴─────────────────────┴──────────────────────┘

22 строки в наборе. Затрачено: 8.460 сек. Обработано 4.56 миллиарда строк, 77.48 ГБ (538.73 миллионов строк/с., 9.16 ГБ/с.)
```

Включение комментариев, как правило, коррелирует с более высоким уровнем вовлечённости.


### Как со временем меняется количество видео — какие при этом можно выделить события?

```sql
SELECT
    toStartOfMonth(toDateTime(upload_date)) AS month,
    uniq(uploader_id) AS uploaders,
    count() AS num_videos,
    sum(view_count) AS view_count
FROM youtube
GROUP BY month
ORDER BY month ASC;
```

```response
┌──────месяц─┬─загрузчики─┬─кол_видео─┬───просмотры─┐
│ 2005-04-01 │         5 │          6 │    213597737 │
│ 2005-05-01 │         6 │          9 │      2944005 │
│ 2005-06-01 │       165 │        351 │     18624981 │
│ 2005-07-01 │       395 │       1168 │     94164872 │
│ 2005-08-01 │      1171 │       3128 │    124540774 │
│ 2005-09-01 │      2418 │       5206 │    475536249 │
│ 2005-10-01 │      6750 │      13747 │    737593613 │
│ 2005-11-01 │     13706 │      28078 │   1896116976 │
│ 2005-12-01 │     24756 │      49885 │   2478418930 │
│ 2006-01-01 │     49992 │     100447 │   4532656581 │
│ 2006-02-01 │     67882 │     138485 │   5677516317 │
│ 2006-03-01 │    103358 │     212237 │   8430301366 │
│ 2006-04-01 │    114615 │     234174 │   9980760440 │
│ 2006-05-01 │    152682 │     332076 │  14129117212 │
│ 2006-06-01 │    193962 │     429538 │  17014143263 │
│ 2006-07-01 │    234401 │     530311 │  18721143410 │
│ 2006-08-01 │    281280 │     614128 │  20473502342 │
│ 2006-09-01 │    312434 │     679906 │  23158422265 │
│ 2006-10-01 │    404873 │     897590 │  27357846117 │
```

Всплеск числа авторов, загружающих видео, [в период COVID-19 заметен](https://www.theverge.com/2020/3/27/21197642/youtube-with-me-style-videos-views-coronavirus-cook-workout-study-home-beauty).


### Больше субтитров со временем: когда это произошло

С развитием технологий распознавания речи создавать субтитры для видео стало проще, чем когда-либо: YouTube добавил автоматическое создание субтитров в конце 2009 года — стал ли это переломным моментом?

```sql
SELECT
    toStartOfMonth(upload_date) AS month,
    countIf(has_subtitles) / count() AS percent_subtitles,
    percent_subtitles - any(percent_subtitles) OVER (
        ORDER BY month ASC ROWS BETWEEN 1 PRECEDING AND 1 PRECEDING
    ) AS previous
FROM youtube
GROUP BY month
ORDER BY month ASC;
```

```response
┌──────месяц─┬───процент_субтитров─┬────────────────предыдущий─┐
│ 2015-01-01 │  0.2652653881082824 │      0.2652653881082824 │
│ 2015-02-01 │  0.3147556050309162 │    0.049490216922633834 │
│ 2015-03-01 │ 0.32460464492371877 │    0.009849039892802558 │
│ 2015-04-01 │ 0.33471963051468445 │    0.010114985590965686 │
│ 2015-05-01 │  0.3168087575501062 │   -0.017910872964578273 │
│ 2015-06-01 │  0.3162609788438222 │  -0.0005477787062839745 │
│ 2015-07-01 │ 0.31828767677518033 │   0.0020266979313581235 │
│ 2015-08-01 │  0.3045551564286859 │   -0.013732520346494415 │
│ 2015-09-01 │   0.311221133995152 │    0.006665977566466086 │
│ 2015-10-01 │ 0.30574870926812175 │   -0.005472424727030245 │
│ 2015-11-01 │ 0.31125409712077234 │   0.0055053878526505895 │
│ 2015-12-01 │  0.3190967954651779 │    0.007842698344405541 │
│ 2016-01-01 │ 0.32636021432496176 │    0.007263418859783877 │

```

Данные показывают всплеск в 2009 году. По‑видимому, в это время YouTube убрал функцию «Субтитры сообщества», которая позволяла загружать субтитры к чужим видео.
Это привело к запуску очень успешной кампании, призывавшей авторов добавлять субтитры к своим видео для слабослышащих и глухих зрителей.


### Лидеры по загрузкам во времени

```sql
WITH uploaders AS
    (
        SELECT uploader
        FROM youtube
        GROUP BY uploader
        ORDER BY sum(view_count) DESC
        LIMIT 10
    )
SELECT
    month,
    uploader,
    sum(view_count) AS total_views,
    avg(dislike_count / like_count) AS like_to_dislike_ratio
FROM youtube
WHERE uploader IN (uploaders)
GROUP BY
    toStartOfMonth(upload_date) AS month,
    uploader
ORDER BY
    month ASC,
    total_views DESC;
```

```response
┌──────month─┬─uploader───────────────────┬─total_views─┬─like_to_dislike_ratio─┐
│ 1970-01-01 │ T-Series                   │    10957099 │  0.022784656361208206 │
│ 1970-01-01 │ Ryan's World               │           0 │  0.003035559410234172 │
│ 1970-01-01 │ SET India                  │           0 │                   nan │
│ 2006-09-01 │ Cocomelon - Nursery Rhymes │   256406497 │    0.7005566715978622 │
│ 2007-06-01 │ Cocomelon - Nursery Rhymes │    33641320 │    0.7088650914344298 │
│ 2008-02-01 │ WWE                        │    43733469 │   0.07198856488734842 │
│ 2008-03-01 │ WWE                        │    16514541 │    0.1230603715431997 │
│ 2008-04-01 │ WWE                        │     5907295 │    0.2089399470159618 │
│ 2008-05-01 │ WWE                        │     7779627 │   0.09101676560436774 │
│ 2008-06-01 │ WWE                        │     7018780 │    0.0974184753155297 │
│ 2008-07-01 │ WWE                        │     4686447 │    0.1263845422065158 │
│ 2008-08-01 │ WWE                        │     4514312 │   0.08384574274791441 │
│ 2008-09-01 │ WWE                        │     3717092 │   0.07872802579349912 │
```


### Как меняется соотношение лайков по мере увеличения числа просмотров?

```sql
SELECT
    concat('< ', formatReadableQuantity(view_range)) AS view_range,
    is_comments_enabled,
    round(like_ratio, 2) AS like_ratio
FROM
(
SELECT
    power(10, CEILING(log10(view_count + 1))) AS view_range,
    is_comments_enabled,
    avg(like_count / dislike_count) AS like_ratio
FROM youtube WHERE dislike_count > 0
GROUP BY
    view_range,
    is_comments_enabled HAVING view_range > 1
ORDER BY
    view_range ASC,
    is_comments_enabled ASC
);
```

```response
┌─view_range────────┬─is_comments_enabled─┬─like_ratio─┐
│ < 10.00           │ false               │       0.66 │
│ < 10.00           │ true                │       0.66 │
│ < 100.00          │ false               │          3 │
│ < 100.00          │ true                │       3.95 │
│ < 1.00 тысяч   │ false               │       8.45 │
│ < 1.00 тысяч   │ true                │      13.07 │
│ < 10.00 тысяч  │ false               │      18.57 │
│ < 10.00 тысяч  │ true                │      30.92 │
│ < 100.00 тысяч │ false               │      23.55 │
│ < 100.00 тысяч │ true                │      42.13 │
│ < 1.00 миллион    │ false               │      19.23 │
│ < 1.00 миллион    │ true                │      37.86 │
│ < 10.00 миллион   │ false               │      12.13 │
│ < 10.00 миллион   │ true                │      30.72 │
│ < 100.00 миллион  │ false               │       6.67 │
│ < 100.00 миллион  │ true                │      23.32 │
│ < 1.00 миллиард    │ false               │       3.08 │
│ < 1.00 миллиард    │ true                │      20.69 │
│ < 10.00 миллиард   │ false               │       1.77 │
│ < 10.00 миллиард   │ true                │       19.5 │
└───────────────────┴─────────────────────┴────────────┘
```


### Как распределяются представления?

```sql
SELECT
    labels AS percentile,
    round(quantiles) AS views
FROM
(
    SELECT
        quantiles(0.999, 0.99, 0.95, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1)(view_count) AS quantiles,
        ['99.9th', '99th', '95th', '90th', '80th', '70th','60th', '50th', '40th', '30th', '20th', '10th'] AS labels
    FROM youtube
)
ARRAY JOIN
    quantiles,
    labels;
```

```response
┌─процентиль─┬───просмотры─┐
│ 99.9-й     │ 1216624     │
│ 99-й       │  143519     │
│ 95-й       │   13542     │
│ 90-й       │    4054     │
│ 80-й       │     950     │
│ 70-й       │     363     │
│ 60-й       │     177     │
│ 50-й       │      97     │
│ 40-й       │      57     │
│ 30-й       │      32     │
│ 20-й       │      16     │
│ 10-й       │       6     │
└────────────┴─────────────┘
```
