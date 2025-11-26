---
sidebar_label: 'Первичные индексы'
sidebar_position: 1
description: 'В этом руководстве мы подробно рассмотрим индексацию в ClickHouse.'
title: 'Практическое введение в первичные индексы ClickHouse'
slug: /guides/best-practices/sparse-primary-indexes
show_related_blogs: true
doc_type: 'guide'
keywords: ['первичный индекс', 'индексация', 'производительность', 'оптимизация запросов', 'лучшие практики']
---

import sparsePrimaryIndexes01 from '@site/static/images/guides/best-practices/sparse-primary-indexes-01.png';
import sparsePrimaryIndexes02 from '@site/static/images/guides/best-practices/sparse-primary-indexes-02.png';
import sparsePrimaryIndexes03a from '@site/static/images/guides/best-practices/sparse-primary-indexes-03a.png';
import sparsePrimaryIndexes03b from '@site/static/images/guides/best-practices/sparse-primary-indexes-03b.png';
import sparsePrimaryIndexes04 from '@site/static/images/guides/best-practices/sparse-primary-indexes-04.png';
import sparsePrimaryIndexes05 from '@site/static/images/guides/best-practices/sparse-primary-indexes-05.png';
import sparsePrimaryIndexes06 from '@site/static/images/guides/best-practices/sparse-primary-indexes-06.png';
import sparsePrimaryIndexes07 from '@site/static/images/guides/best-practices/sparse-primary-indexes-07.png';
import sparsePrimaryIndexes08 from '@site/static/images/guides/best-practices/sparse-primary-indexes-08.png';
import sparsePrimaryIndexes09a from '@site/static/images/guides/best-practices/sparse-primary-indexes-09a.png';
import sparsePrimaryIndexes09b from '@site/static/images/guides/best-practices/sparse-primary-indexes-09b.png';
import sparsePrimaryIndexes09c from '@site/static/images/guides/best-practices/sparse-primary-indexes-09c.png';
import sparsePrimaryIndexes10 from '@site/static/images/guides/best-practices/sparse-primary-indexes-10.png';
import sparsePrimaryIndexes11 from '@site/static/images/guides/best-practices/sparse-primary-indexes-11.png';
import sparsePrimaryIndexes12a from '@site/static/images/guides/best-practices/sparse-primary-indexes-12a.png';
import sparsePrimaryIndexes12b1 from '@site/static/images/guides/best-practices/sparse-primary-indexes-12b-1.png';
import sparsePrimaryIndexes12b2 from '@site/static/images/guides/best-practices/sparse-primary-indexes-12b-2.png';
import sparsePrimaryIndexes12c1 from '@site/static/images/guides/best-practices/sparse-primary-indexes-12c-1.png';
import sparsePrimaryIndexes12c2 from '@site/static/images/guides/best-practices/sparse-primary-indexes-12c-2.png';
import sparsePrimaryIndexes13a from '@site/static/images/guides/best-practices/sparse-primary-indexes-13a.png';
import sparsePrimaryIndexes14a from '@site/static/images/guides/best-practices/sparse-primary-indexes-14a.png';
import sparsePrimaryIndexes14b from '@site/static/images/guides/best-practices/sparse-primary-indexes-14b.png';
import sparsePrimaryIndexes15a from '@site/static/images/guides/best-practices/sparse-primary-indexes-15a.png';
import sparsePrimaryIndexes15b from '@site/static/images/guides/best-practices/sparse-primary-indexes-15b.png';
import Image from '@theme/IdealImage';


# Практическое руководство по первичным индексам в ClickHouse



## Введение

В этом руководстве мы подробно рассмотрим индексацию в ClickHouse. Мы продемонстрируем и детально обсудим:

* [чем индексация в ClickHouse отличается от традиционных систем управления реляционными базами данных](#an-index-design-for-massive-data-scales)
* [как ClickHouse строит и использует разреженный первичный индекс таблицы](#a-table-with-a-primary-key)
* [каковы некоторые из лучших практик индексирования в ClickHouse](#using-multiple-primary-indexes)

При желании вы можете самостоятельно выполнить все SQL-инструкции и запросы ClickHouse, приведённые в этом руководстве, на своей машине.
Инструкции по установке ClickHouse и началу работы см. в разделе [Quick Start](/get-started/quick-start).

:::note
Это руководство посвящено разреженным первичным индексам ClickHouse.

См. [руководство](/guides/best-practices/skipping-indexes.md) по [вторичным индексам пропуска данных ClickHouse](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes).
:::

### Набор данных

На протяжении всего руководства мы будем использовать пример анонимизированного набора данных веб-трафика.

* Мы будем использовать подмножество из 8,87 миллиона строк (событий) из этого набора данных.
* Несжатый объём данных — 8,87 миллиона событий и около 700 МБ. При хранении в ClickHouse это сжимается до 200 МБ.
* В нашем подмножестве каждая строка содержит три столбца, которые указывают интернет-пользователя (столбец `UserID`), кликнувшего по URL (столбец `URL`) в определённое время (столбец `EventTime`).

С этими тремя столбцами мы уже можем сформулировать некоторые типичные запросы веб-аналитики, такие как:

* «Каковы 10 URL-адресов, по которым конкретный пользователь чаще всего кликает?»
* «Каковы 10 пользователей, которые чаще всего кликают по конкретному URL?»
* «Какое самое популярное время (например, дни недели), когда пользователь кликает по конкретному URL?»

### Тестовая машина

Все значения времени выполнения, приведённые в этом документе, основаны на локальном запуске ClickHouse 22.2.1 на MacBook Pro с чипом Apple M1 Pro и 16 ГБ оперативной памяти.

### Полное сканирование таблицы

Чтобы увидеть, как выполняется запрос по нашему набору данных без первичного ключа, мы создадим таблицу (с движком MergeTree), выполнив следующий оператор DDL SQL:

```sql
CREATE TABLE hits_NoPrimaryKey
(
    `UserID` UInt32,
    `URL` String,
    `EventTime` DateTime
)
ENGINE = MergeTree
PRIMARY KEY tuple();
```

Затем вставьте подмножество данных hits в таблицу с помощью следующего SQL-оператора INSERT.
Здесь используется [табличная функция URL](/sql-reference/table-functions/url.md) для загрузки подмножества полного набора данных, размещённого удалённо на clickhouse.com:


```sql
INSERT INTO hits_NoPrimaryKey SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64, JavaEnable UInt8, Title String, GoodEvent Int16, EventTime DateTime, EventDate Date, CounterID UInt32, ClientIP UInt32, ClientIP6 FixedString(16), RegionID UInt32, UserID UInt64, CounterClass Int8, OS UInt8, UserAgent UInt8, URL String, Referer String, URLDomain String, RefererDomain String, Refresh UInt8, IsRobot UInt8, RefererCategories Array(UInt16), URLCategories Array(UInt16), URLRegions Array(UInt32), RefererRegions Array(UInt32), ResolutionWidth UInt16, ResolutionHeight UInt16, ResolutionDepth UInt8, FlashMajor UInt8, FlashMinor UInt8, FlashMinor2 String, NetMajor UInt8, NetMinor UInt8, UserAgentMajor UInt16, UserAgentMinor FixedString(2), CookieEnable UInt8, JavascriptEnable UInt8, IsMobile UInt8, MobilePhone UInt8, MobilePhoneModel String, Params String, IPNetworkID UInt32, TraficSourceID Int8, SearchEngineID UInt16, SearchPhrase String, AdvEngineID UInt8, IsArtifical UInt8, WindowClientWidth UInt16, WindowClientHeight UInt16, ClientTimeZone Int16, ClientEventTime DateTime, SilverlightVersion1 UInt8, SilverlightVersion2 UInt8, SilverlightVersion3 UInt32, SilverlightVersion4 UInt16, PageCharset String, CodeVersion UInt32, IsLink UInt8, IsDownload UInt8, IsNotBounce UInt8, FUniqID UInt64, HID UInt32, IsOldCounter UInt8, IsEvent UInt8, IsParameter UInt8, DontCountHits UInt8, WithHash UInt8, HitColor FixedString(1), UTCEventTime DateTime, Age UInt8, Sex UInt8, Income UInt8, Interests UInt16, Robotness UInt8, GeneralInterests Array(UInt16), RemoteIP UInt32, RemoteIP6 FixedString(16), WindowName Int32, OpenerName Int32, HistoryLength Int16, BrowserLanguage FixedString(2), BrowserCountry FixedString(2), SocialNetwork String, SocialAction String, HTTPError UInt16, SendTiming Int32, DNSTiming Int32, ConnectTiming Int32, ResponseStartTiming Int32, ResponseEndTiming Int32, FetchTiming Int32, RedirectTiming Int32, DOMInteractiveTiming Int32, DOMContentLoadedTiming Int32, DOMCompleteTiming Int32, LoadEventStartTiming Int32, LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32, FirstPaintTiming Int32, RedirectCount Int8, SocialSourceNetworkID UInt8, SocialSourcePage String, ParamPrice Int64, ParamOrderID String, ParamCurrency FixedString(3), ParamCurrencyID UInt16, GoalsReached Array(UInt32), OpenstatServiceName String, OpenstatCampaignID String, OpenstatAdID String, OpenstatSourceID String, UTMSource String, UTMMedium String, UTMCampaign String, UTMContent String, UTMTerm String, FromTag String, HasGCLID UInt8, RefererHash UInt64, URLHash UInt64, CLID UInt32, YCLID UInt64, ShareService String, ShareURL String, ShareTitle String, ParsedParams Nested(Key1 String, Key2 String, Key3 String, Key4 String, Key5 String, ValueDouble Float64), IslandID FixedString(16), RequestNum UInt32, RequestTry UInt8')
WHERE URL != '';
```

Ответ:

```response
Ок.

0 строк в наборе. Прошло: 145.993 с. Обработано 8.87 млн строк, 18.40 ГБ (60.78 тыс. строк/с, 126.06 МБ/с.)
```

Вывод клиента ClickHouse показывает, что приведённый выше запрос вставил в таблицу 8,87 миллиона строк.

Наконец, чтобы упростить последующее обсуждение в этом руководстве и сделать диаграммы и результаты воспроизводимыми, мы [оптимизируем](/sql-reference/statements/optimize.md) таблицу, используя ключевое слово FINAL:


```sql
ОПТИМИЗИРОВАТЬ ТАБЛИЦУ hits_NoPrimaryKey FINAL;
```

:::note
Обычно нет необходимости и не рекомендуется немедленно оптимизировать таблицу
после загрузки в неё данных. Почему это требуется в данном примере, станет очевидно далее.
:::

Теперь выполним наш первый запрос веб-аналитики. Следующий запрос вычисляет топ-10 URL, по которым чаще всего кликают, для интернет-пользователя с UserID 749927693:

```sql
SELECT URL, count(URL) AS Count
FROM hits_NoPrimaryKey
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

Ответ:

```response
┌─URL────────────────────────────┬─Количество─┐
│ http://auto.ru/chatay-barana.. │   170 │
│ http://auto.ru/chatay-id=371...│    52 │
│ http://public_search           │    45 │
│ http://kovrik-medvedevushku-...│    36 │
│ http://forumal                 │    33 │
│ http://korablitz.ru/L_1OFFER...│    14 │
│ http://auto.ru/chatay-id=371...│    14 │
│ http://auto.ru/chatay-john-D...│    13 │
│ http://auto.ru/chatay-john-D...│    10 │
│ http://wot/html?page/23600_m...│     9 │
└────────────────────────────────┴───────┘
```


10 строк в наборе. Прошло: 0.022 сек.

# highlight-next-line

Обработано 8.87 млн строк,
70.45 MB (398.53 млн строк/с., 3.17 GB/с.)

```

Вывод клиента ClickHouse показывает, что ClickHouse выполнил полное сканирование таблицы! Каждая из 8,87 млн строк нашей таблицы была по очереди передана в ClickHouse. Это плохо масштабируется.

Чтобы сделать этот процесс гораздо более эффективным и быстрым, нам нужно использовать таблицу с подходящим первичным ключом. Это позволит ClickHouse автоматически (на основе столбцов первичного ключа) создать разреженный первичный индекс, который затем можно использовать для значительного ускорения выполнения запроса из нашего примера.
```


## Проектирование индекса ClickHouse {#clickhouse-index-design}

### Проектирование индекса для работы с данными огромного масштаба {#an-index-design-for-massive-data-scales}

В традиционных системах управления реляционными базами данных первичный индекс содержал бы одну запись на строку таблицы. Это привело бы к тому, что первичный индекс для нашего набора данных содержал бы 8,87 миллиона записей. Такой индекс позволяет быстро находить конкретные строки, обеспечивая высокую эффективность для запросов поиска и точечных обновлений. Поиск записи в структуре данных `B(+)-дерево` имеет среднюю временную сложность `O(log n)`; более точно, `log_b n = log_2 n / log_2 b`, где `b` — коэффициент ветвления `B(+)-дерева`, а `n` — количество индексируемых строк. Поскольку `b` обычно находится в диапазоне от нескольких сотен до нескольких тысяч, структуры `B(+)-деревьев` очень неглубокие, и для поиска записей требуется мало обращений к диску. Для 8,87 миллиона строк и коэффициента ветвления 1000 в среднем требуется 2,3 обращения к диску. Эта возможность имеет свою цену: дополнительные накладные расходы на диск и память, повышенные затраты на вставку при добавлении новых строк в таблицу и записей в индекс, а также периодическую ребалансировку B-дерева.

Учитывая проблемы, связанные с индексами B-дерева, движки таблиц в ClickHouse используют иной подход. Семейство движков [MergeTree](/engines/table-engines/mergetree-family/index.md) в ClickHouse разработано и оптимизировано для работы с огромными объемами данных. Эти таблицы рассчитаны на прием миллионов вставок строк в секунду и хранение очень больших (сотни петабайт) объемов данных. Данные быстро записываются в таблицу [частями](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage), при этом применяются правила для их слияния в фоновом режиме. В ClickHouse каждая часть имеет собственный первичный индекс. При слиянии частей первичные индексы сливаются в индекс объединенной части. На очень больших масштабах, для которых предназначен ClickHouse, крайне важно обеспечивать высокую эффективность использования диска и памяти. Поэтому вместо индексации каждой строки первичный индекс для части содержит одну запись индекса (известную как «метка») на группу строк (называемую «гранула») — эта техника называется **разреженным индексом**.

Разреженная индексация возможна, поскольку ClickHouse хранит строки части на диске, упорядоченными по столбцам первичного ключа. Вместо прямого позиционирования на отдельных строках (как в индексе на основе B-дерева) разреженный первичный индекс позволяет быстро (с помощью бинарного поиска по записям индекса) определить группы строк, которые потенциально могут соответствовать запросу. Эти группы потенциально соответствующих строк (гранулы) затем параллельно потоково загружаются в движок ClickHouse для поиска совпадений. Такой дизайн индекса позволяет первичному индексу оставаться компактным (он должен полностью помещаться в оперативную память), при этом существенно ускоряя выполнение запросов: особенно диапазонных запросов, типичных для сценариев аналитики данных.

Далее подробно показано, как ClickHouse строит и использует свой разреженный первичный индекс. Позже в статье мы обсудим некоторые лучшие практики по выбору, исключению и упорядочиванию столбцов таблицы, используемых для построения индекса (столбцов первичного ключа).

### Таблица с первичным ключом {#a-table-with-a-primary-key}

Создайте таблицу со составным первичным ключом, включающим столбцы UserID и URL:

```sql
CREATE TABLE hits_UserID_URL
(
    `UserID` UInt32,
    `URL` String,
    `EventTime` DateTime
)
ENGINE = MergeTree
-- highlight-next-line
PRIMARY KEY (UserID, URL)
ORDER BY (UserID, URL, EventTime)
SETTINGS index_granularity = 8192, index_granularity_bytes = 0, compress_primary_key = 0;
```

[//]: # "<details open>"

<details>
    <summary>
    Подробности оператора DDL
    </summary>
    <p>

Чтобы упростить последующие обсуждения в этом руководстве, а также сделать диаграммы и результаты воспроизводимыми, оператор DDL:


<ul>
  <li>
    Задает составной ключ сортировки таблицы с помощью предложения <code>ORDER BY</code>.
  </li>
  <li>
    Явно определяет, сколько записей индекса будет иметь первичный индекс,
    с помощью следующих настроек:
    <ul>
      <li>
        <code>index_granularity</code>: явно установлено в значение
        по умолчанию — 8192. Это означает, что для каждой группы из 8192 строк
        первичный индекс будет содержать одну запись индекса. Например, если
        таблица содержит 16384 строки, индекс будет иметь две записи.
      </li>
      <li>
        <code>index_granularity_bytes</code>: установлено в 0, чтобы отключить{" "}
        <a
          href='https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1'
          target='_blank'
        >
          адаптивную зернистость индекса
        </a>
        . Адаптивная зернистость индекса означает, что ClickHouse автоматически
        создает одну запись индекса для группы из n строк, если выполняется
        одно из следующих условий:
        <ul>
          <li>
            Если <code>n</code> меньше 8192 и размер совокупных данных строк
            для этих <code>n</code> строк больше либо равен 10 МБ
            (значение по умолчанию для <code>index_granularity_bytes</code>).
          </li>
          <li>
            Если размер совокупных данных строк для <code>n</code> строк
            меньше 10 МБ, но <code>n</code> равно 8192.
          </li>
        </ul>
      </li>
      <li>
        <code>compress_primary_key</code>: установлено в 0, чтобы отключить{" "}
        <a
          href='https://github.com/ClickHouse/ClickHouse/issues/34437'
          target='_blank'
        >
          сжатие первичного индекса
        </a>
        . Это позволит при необходимости просмотреть его содержимое позже.
      </li>
    </ul>
  </li>
</ul>

</p>
</details>

Первичный ключ в приведенном выше операторе DDL приводит к созданию первичного индекса на основе двух указанных столбцов ключа.

<br />
Затем вставьте данные:


```sql
INSERT INTO hits_UserID_URL SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```

Ответ будет выглядеть примерно так:

```response
0 строк в выборке. Прошло 149.432 сек. Обработано 8.87 млн строк, 18.40 GB (59.38 тыс. строк/с, 123.16 MB/s.)
```

<br />

И оптимизируйте таблицу:

```sql
OPTIMIZE TABLE hits_UserID_URL FINAL;
```

<br />

Мы можем использовать следующий запрос для получения метаданных о нашей таблице:


```sql
SELECT
    part_type,
    path,
    formatReadableQuantity(rows) AS rows,
    formatReadableSize(data_uncompressed_bytes) AS data_uncompressed_bytes,
    formatReadableSize(data_compressed_bytes) AS data_compressed_bytes,
    formatReadableSize(primary_key_bytes_in_memory) AS primary_key_bytes_in_memory,
    marks,
    formatReadableSize(bytes_on_disk) AS bytes_on_disk
FROM system.parts
WHERE (table = 'hits_UserID_URL') AND (active = 1)
FORMAT Vertical;
```

Ответ:

```response
part_type:                   Wide
path:                        ./store/d9f/d9f36a1a-d2e6-46d4-8fb5-ffe9ad0d5aed/all_1_9_2/
rows:                        8.87 млн
data_uncompressed_bytes:     733.28 MiB
data_compressed_bytes:       206.94 MiB
primary_key_bytes_in_memory: 96.93 KiB
marks:                       1083
bytes_on_disk:               207.07 MiB

1 строка в наборе. Время выполнения: 0.003 с.
```

Вывод клиента ClickHouse показывает:

* Данные таблицы хранятся в [широком формате](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) в отдельном каталоге на диске, то есть в этом каталоге для каждого столбца таблицы будет один файл данных (и один файл меток).
* Таблица содержит 8,87 миллиона строк.
* Несжатый объём данных всех строк вместе составляет 733,28 МБ.
* Сжатый объём данных всех строк на диске составляет 206,94 МБ.
* Таблица имеет первичный индекс с 1083 записями (называемыми `marks` — метками), и размер индекса составляет 96,93 КБ.
* В сумме данные таблицы, файлы меток и файл первичного индекса занимают на диске 207,07 МБ.

### Данные на диске хранятся в порядке столбцов первичного ключа

Наша таблица, созданная выше, имеет

* составной [первичный ключ](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)` и
* составной [ключ сортировки](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)`.

:::note

* Если бы мы указали только ключ сортировки, то первичный ключ был бы неявно определён как совпадающий с ключом сортировки.

* Чтобы эффективно использовать память, мы явно задали первичный ключ, который содержит только те столбцы, по которым наши запросы выполняют фильтрацию. Первичный индекс, основанный на первичном ключе, полностью загружается в основную память.

* Для того чтобы обеспечить согласованность диаграмм в этом руководстве и максимизировать степень сжатия, мы определили отдельный ключ сортировки, который включает все столбцы нашей таблицы (если в столбце похожие данные располагаются близко друг к другу, например за счёт сортировки, эти данные будут сжиматься лучше).

* Первичный ключ должен быть префиксом ключа сортировки, если оба они заданы.
  :::

Вставленные строки хранятся на диске в лексикографическом порядке по возрастанию по столбцам первичного ключа (и дополнительному столбцу `EventTime` из ключа сортировки).

:::note
ClickHouse позволяет вставлять несколько строк с одинаковыми значениями столбцов первичного ключа. В этом случае (см. строки 1 и 2 на диаграмме ниже) окончательный порядок определяется указанным ключом сортировки и, соответственно, значением столбца `EventTime`.
:::

ClickHouse — это <a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms
" target="_blank">колоночная система управления базами данных</a>. Как показано на диаграмме ниже,

* для представления на диске существует один файл данных (*.bin) на каждый столбец таблицы, где все значения этого столбца хранятся в <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">сжатом</a> формате, и
* 8,87 миллиона строк хранятся на диске в лексикографическом порядке по возрастанию по столбцам первичного ключа (и дополнительным столбцам ключа сортировки), то есть в данном случае:
  * сначала по `UserID`,
  * затем по `URL`,
  * и, наконец, по `EventTime`:

<Image img={sparsePrimaryIndexes01} size="md" alt="Разреженные первичные индексы 01" background="white" />


`UserID.bin`, `URL.bin` и `EventTime.bin` — это файлы данных на диске, в которых хранятся значения столбцов `UserID`, `URL` и `EventTime`.

:::note
- Так как первичный ключ задаёт лексикографический порядок строк на диске, таблица может иметь только один первичный ключ.

- Мы нумеруем строки, начиная с 0, чтобы соответствовать внутренней схеме нумерации строк в ClickHouse, которая также используется для журналирования сообщений.
:::

### Данные организованы в гранулы для параллельной обработки данных {#data-is-organized-into-granules-for-parallel-data-processing}

Для целей обработки данные значения столбцов таблицы логически делятся на гранулы.
Гранула — это наименьший неделимый набор данных, который передаётся в ClickHouse для обработки.
Это означает, что вместо чтения отдельных строк ClickHouse всегда читает (в потоковом режиме и параллельно) целую группу (гранулу) строк.
:::note
Значения столбцов физически не хранятся внутри гранул: гранулы — это лишь логическая организация значений столбцов для обработки запросов.
:::

На следующей схеме показано, как (значения столбцов) 8,87 миллиона строк нашей таблицы
организованы в 1083 гранулы в результате того, что DDL-выражение для таблицы содержит настройку `index_granularity` (установленную в значение по умолчанию — 8192).

<Image img={sparsePrimaryIndexes02} size="md" alt="Разреженные первичные индексы 02" background="white"/>

Первые (по физическому порядку на диске) 8192 строки (их значения столбцов) логически принадлежат грануле 0, затем следующие 8192 строки (их значения столбцов) принадлежат грануле 1 и так далее.

:::note
- Последняя гранула (гранула 1082) «содержит» меньше 8192 строк.

- В начале этого руководства в разделе «Подробности DDL-выражения» мы упомянули, что отключили [адаптивную зернистость индекса](/whats-new/changelog/2019.md/#experimental-features-1) (чтобы упростить обсуждение в этом руководстве, а также сделать диаграммы и результаты воспроизводимыми).

  Поэтому все гранулы (кроме последней) в нашей примерной таблице имеют одинаковый размер.

- Для таблиц с адаптивной зернистостью индекса (зернистость индекса адаптивна по [умолчанию](/operations/settings/merge-tree-settings#index_granularity_bytes)) размер некоторых гранул может быть меньше 8192 строк в зависимости от размеров строковых данных.

- Мы выделили некоторые значения столбцов из столбцов первичного ключа (`UserID`, `URL`) оранжевым цветом.
  Эти выделенные оранжевым цветом значения столбцов являются значениями столбцов первичного ключа для каждой первой строки каждой гранулы.
  Как мы увидим ниже, эти выделенные оранжевым цветом значения столбцов будут записями в первичном индексе таблицы.

- Мы нумеруем гранулы, начиная с 0, чтобы соответствовать внутренней схеме нумерации гранул в ClickHouse, которая также используется для журналирования сообщений.
:::

### Первичный индекс содержит одну запись на гранулу {#the-primary-index-has-one-entry-per-granule}

Первичный индекс создаётся на основе гранул, показанных на диаграмме выше. Этот индекс представляет собой несжатый плоский файл-массив (primary.idx), содержащий так называемые числовые метки индекса, начинающиеся с 0.

Диаграмма ниже показывает, что индекс хранит значения столбцов первичного ключа (значения, выделенные оранжевым на диаграмме выше) для первой строки каждой гранулы.
Или, другими словами: первичный индекс хранит значения столбцов первичного ключа из каждой 8192-й строки таблицы (на основе физического порядка строк, определённого столбцами первичного ключа).
Например:
- первая запись индекса («метка 0» на диаграмме ниже) хранит значения столбцов ключа для первой строки гранулы 0 с диаграммы выше,
- вторая запись индекса («метка 1» на диаграмме ниже) хранит значения столбцов ключа для первой строки гранулы 1 с диаграммы выше и так далее.

<Image img={sparsePrimaryIndexes03a} size="lg" alt="Разреженные первичные индексы 03a" background="white"/>

Всего индекс имеет 1083 записи для нашей таблицы с 8,87 миллиона строк и 1083 гранулами:

<Image img={sparsePrimaryIndexes03b} size="md" alt="Разреженные первичные индексы 03b" background="white"/>



:::note
- Для таблиц с [адаптивной зернистостью индекса](/whats-new/changelog/2019.md/#experimental-features-1) в первичном индексе дополнительно хранится одна «финальная» отметка, в которой записаны значения столбцов первичного ключа для последней строки таблицы, но поскольку мы отключили адаптивную зернистость индекса (чтобы упростить объяснения в этом руководстве, а также сделать диаграммы и результаты воспроизводимыми), индекс нашей примерной таблицы не включает эту финальную отметку.

- Файл первичного индекса полностью загружается в оперативную память. Если файл больше доступного свободного объёма памяти, ClickHouse выдаст ошибку.
:::

<details>
    <summary>
    Inspecting the content of the primary index
    </summary>
    <p>

В самостоятельно управляемом кластере ClickHouse мы можем использовать <a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">табличную функцию `file`</a> для анализа содержимого первичного индекса нашей примерной таблицы.

Для этого нам сначала нужно скопировать файл первичного индекса в <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a> одного из узлов работающего кластера:
<ul>
<li>Шаг 1: Получить путь части (part-path), содержащей файл первичного индекса</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

на тестовой машине возвращает `/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4`.

<li>Шаг 2: Получить user_files_path</li>
<a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">Значение user_files_path по умолчанию</a> в Linux —
`/var/lib/clickhouse/user_files/`

и в Linux вы можете проверить, изменялось ли оно: `$ grep user_files_path /etc/clickhouse-server/config.xml`

На тестовой машине путь — `/Users/tomschreiber/Clickhouse/user_files/`

<li>Шаг 3: Скопировать файл первичного индекса в user_files_path</li>

`cp /Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4/primary.idx /Users/tomschreiber/Clickhouse/user_files/primary-hits_UserID_URL.idx`

</ul>

<br/>
Теперь мы можем проанализировать содержимое первичного индекса с помощью SQL:
<ul>
<li>Получить количество записей</li>
`
SELECT count( )<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String');
`
возвращает `1083`

<li>Получить первые две отметки индекса</li>
`
SELECT UserID, URL<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 0, 2;
`

возвращает

`
240923, http://showtopics.html%3...<br/>
4073710, http://mk.ru&pos=3_0
`

<li>Получить последнюю отметку индекса</li>
`
SELECT UserID, URL FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 1082, 1;
`
возвращает
`
4292714039 │ http://sosyal-mansetleri...
`
</ul>
<br/>
Это в точности соответствует нашей диаграмме содержимого первичного индекса для примерной таблицы:

</p>
</details>

Записи первичного ключа называются отметками индекса (index marks), потому что каждая запись индекса помечает начало конкретного диапазона данных. В частности, для нашей примерной таблицы:
- Отметки индекса по UserID:

  Сохранённые значения `UserID` в первичном индексе отсортированы по возрастанию.<br/>
  Таким образом, «mark 1» на диаграмме выше указывает, что значения `UserID` всех строк таблицы в грануле 1 и во всех последующих гранулах гарантированно больше или равны 4.073.710.



[Как мы увидим позже](#the-primary-index-is-used-for-selecting-granules), этот глобальный порядок позволяет ClickHouse <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">использовать алгоритм бинарного поиска</a> по меткам индекса для первого столбца ключа, когда запрос фильтрует по первому столбцу первичного ключа.

* Метки индекса для URL:

  Довольно схожая кардинальность столбцов первичного ключа `UserID` и `URL`
  означает, что метки индекса для всех столбцов ключа после первого столбца в общем случае указывают только диапазон данных, пока значение предыдущего столбца ключа остаётся одинаковым для всех строк таблицы по крайней мере в пределах текущего гранула.<br />
  Например, поскольку значения UserID у метки 0 и метки 1 на приведённой выше диаграмме различаются, ClickHouse не может предположить, что все значения URL всех строк таблицы в грануле 0 больше или равны `'http://showtopics.html%3...'`. Однако, если бы значения UserID у метки 0 и метки 1 на диаграмме выше были одинаковыми (то есть значение UserID оставалось бы неизменным для всех строк таблицы в грануле 0), ClickHouse мог бы предположить, что все значения URL всех строк таблицы в грануле 0 больше или равны `'http://showtopics.html%3...'`.

  Мы обсудим последствия этого для производительности выполнения запросов подробнее позже.

### Первичный индекс используется для выбора гранул

Теперь мы можем выполнять наши запросы с поддержкой первичного индекса.

Следующий запрос вычисляет топ‑10 URL с наибольшим числом кликов для UserID 749927693.

```sql
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

Ответ:

```response
┌─URL────────────────────────────┬─Количество─┐
│ http://auto.ru/chatay-barana.. │   170 │
│ http://auto.ru/chatay-id=371...│    52 │
│ http://public_search           │    45 │
│ http://kovrik-medvedevushku-...│    36 │
│ http://forumal                 │    33 │
│ http://korablitz.ru/L_1OFFER...│    14 │
│ http://auto.ru/chatay-id=371...│    14 │
│ http://auto.ru/chatay-john-D...│    13 │
│ http://auto.ru/chatay-john-D...│    10 │
│ http://wot/html?page/23600_m...│     9 │
└────────────────────────────────┴───────┘
```


10 строк в наборе. Прошло: 0.005 сек.

# highlight-next-line

Обработано 8,19 тысяч строк,
740,18 КБ (1,53 млн строк/с., 138,59 МБ/с.)

```

Вывод клиента ClickHouse теперь показывает, что вместо полного сканирования таблицы в ClickHouse было передано всего 8,19 тыс. строк.
```


Если <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">трассировка логов</a> включена, то в серверном файле журнала ClickHouse видно, что ClickHouse выполнял <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">двоичный поиск</a> по 1083 меткам индекса UserID, чтобы определить гранулы, которые потенциально могут содержать строки со значением в столбце UserID `749927693`. Это занимает 19 шагов при средней временной сложности `O(log2 n)`:

```response
...Executor): Условие по ключу: (столбец 0 в [749927693, 749927693])
# highlight-next-line
...Executor): Выполняется двоичный поиск по диапазону индекса части all_1_9_2 (1083 меток)
...Executor): Найдена граничная метка (LEFT): 176
...Executor): Найдена граничная метка (RIGHT): 177
...Executor): Найден непрерывный диапазон за 19 шагов
...Executor): Выбрано 1/1 частей по ключу партиционирования, 1 часть по первичному ключу,
# highlight-next-line
              1/1083 меток по первичному ключу, 1 метка для чтения из 1 диапазона
...Чтение ...примерно 8192 строк, начиная с 1441792
```

Мы можем видеть в приведённом выше журнале трассировки, что одна метка из 1083 существующих меток удовлетворила запросу.

<details>
  <summary>
    Подробности журнала трассировки
  </summary>

  <p>
    Была определена метка 176 («найденная метка левой границы» включительна, «найденная метка правой границы» исключительна), и, следовательно, все 8192 строки из гранулы 176 (которая начинается с строки 1.441.792 — как будет показано далее в этом руководстве) затем передаются в ClickHouse для поиска фактических строк, в которых значение столбца UserID равно `749927693`.
  </p>
</details>

Мы также можем воспроизвести это, используя в нашем примерном запросе <a href="https://clickhouse.com/docs/sql-reference/statements/explain/" target="_blank">оператор EXPLAIN</a>:

```sql
EXPLAIN indexes = 1
SELECT URL, count(URL) AS Количество
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Количество DESC
LIMIT 10;
```

Ответ будет выглядеть так:


```response
┌─explain───────────────────────────────────────────────────────────────────────────────┐
│ Выражение (Проекция)                                                                 │
│   Ограничение (предварительное LIMIT (без OFFSET))                                    │
│     Сортировка (Сортировка для ORDER BY)                                              │
│       Выражение (Перед ORDER BY)                                                      │
│         Агрегация                                                                     │
│           Выражение (Перед GROUP BY)                                                  │
│             Фильтр (WHERE)                                                            │
│               УстановкаКвотИОграничений (Установка ограничений и квот после чтения из хранилища) │
│                 ЧтениеИзMergeTree                                                     │
│                 Индексы:                                                              │
│                   ПервичныйКлюч                                                       │
│                     Ключи:                                                            │
│                       UserID                                                          │
│                     Условие: (UserID in [749927693, 749927693])                       │
│                     Части: 1/1                                                        │
# highlight-next-line
│                     Гранулы: 1/1083                                                   │
└───────────────────────────────────────────────────────────────────────────────────────┘

16 строк в наборе. Прошло: 0.003 сек.
```

Вывод клиента показывает, что из 1083 гранул была выбрана одна как потенциально содержащая строки со значением столбца UserID 749927693.

:::note Заключение
Когда запрос фильтрует по столбцу, который является частью составного ключа и при этом является первым столбцом ключа, ClickHouse запускает алгоритм бинарного поиска по меткам индекса этого столбца.
:::

<br />

Как обсуждалось выше, ClickHouse использует разреженный первичный индекс для быстрого (через бинарный поиск) выбора гранул, которые потенциально могут содержать строки, удовлетворяющие запросу.

Это **первая стадия (выбор гранул)** выполнения запроса в ClickHouse.

На **второй стадии (чтение данных)** ClickHouse определяет местоположение выбранных гранул, чтобы построчно прочитать все их строки в движок ClickHouse и найти строки, которые фактически удовлетворяют запросу.

Эта вторая стадия более подробно рассматривается в следующем разделе.

### Файлы меток используются для поиска гранул

Следующая диаграмма иллюстрирует часть файла первичного индекса для нашей таблицы.

<Image img={sparsePrimaryIndexes04} size="md" alt="Разреженные первичные индексы 04" background="white" />

Как обсуждалось выше, с помощью бинарного поиска по 1083 меткам UserID в индексе была определена метка 176. Следовательно, соответствующая ей гранула 176 потенциально может содержать строки со значением столбца UserID, равным 749.927.693.

<details>
  <summary>
    Подробности выбора гранулы
  </summary>

  <p>
    Диаграмма выше показывает, что метка 176 является первой записью индекса, для которой одновременно минимальное значение UserID связанной гранулы 176 меньше 749.927.693, а минимальное значение UserID гранулы 177 для следующей метки (метка 177) больше этого значения. Поэтому только соответствующая гранула 176 для метки 176 может потенциально содержать строки со значением столбца UserID, равным 749.927.693.
  </p>
</details>

Чтобы подтвердить (или опровергнуть), что какая‑то строка(и) в грануле 176 содержит значение столбца UserID 749.927.693, все 8192 строки, принадлежащие этой грануле, должны быть считаны и переданы в ClickHouse.

Для этого ClickHouse необходимо знать физическое местоположение гранулы 176.

В ClickHouse физические местоположения всех гранул для нашей таблицы хранятся в файлах меток. Аналогично файлам данных, существует один файл меток на столбец таблицы.

Следующая диаграмма показывает три файла меток `UserID.mrk`, `URL.mrk` и `EventTime.mrk`, которые хранят физические местоположения гранул для столбцов таблицы `UserID`, `URL` и `EventTime`.

<Image img={sparsePrimaryIndexes05} size="md" alt="Разреженные первичные индексы 05" background="white" />

Мы обсудили, что первичный индекс — это плоский несжатый файловый массив (primary.idx), содержащий метки индекса, нумерация которых начинается с 0.

Аналогично, файл меток также является плоским несжатым файловым массивом (*.mrk), содержащим метки, нумерация которых начинается с 0.

Как только ClickHouse идентифицировал и выбрал метку индекса для гранулы, которая потенциально может содержать строки, соответствующие запросу, в файлах меток может быть выполнен позиционный поиск по массиву для получения физических местоположений этой гранулы.

Каждая запись файла меток для конкретного столбца хранит две позиции в виде смещений:


- Первое смещение (`block_offset` на диаграмме выше) определяет положение <a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">блока</a> в <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">сжатом</a> файле данных столбца, который содержит сжатую версию выбранной гранулы. Этот сжатый блок потенциально может содержать несколько сжатых гранул. Найденный сжатый блок файла при чтении распаковывается в оперативную память.

- Второе смещение (`granule_offset` на диаграмме выше) из файла меток указывает расположение гранулы внутри распакованных данных блока.

Затем все 8192 строки, принадлежащие найденной распакованной грануле, передаются в ClickHouse для дальнейшей обработки.

:::note

- Для таблиц с [широким форматом](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) и без [адаптивной гранулярности индекса](/whats-new/changelog/2019.md/#experimental-features-1) ClickHouse использует файлы меток `.mrk`, показанные выше, которые содержат записи с двумя 8-байтными адресами на запись. Эти записи указывают физические расположения гранул, все с одинаковым размером.

 Гранулярность индекса по умолчанию [адаптивная](/operations/settings/merge-tree-settings#index_granularity_bytes), но для нашей примерной таблицы мы отключили адаптивную гранулярность индекса (чтобы упростить обсуждение в данном руководстве, а также сделать диаграммы и результаты воспроизводимыми). Наша таблица использует широкий формат, потому что объём данных больше, чем [min_bytes_for_wide_part](/operations/settings/merge-tree-settings#min_bytes_for_wide_part) (по умолчанию 10 МБ для кластеров с самостоятельным управлением).

- Для таблиц с широким форматом и с адаптивной гранулярностью индекса ClickHouse использует файлы меток `.mrk2`, которые содержат аналогичные записи, как и файлы `.mrk`, но с дополнительным третьим значением в каждой записи: количеством строк в грануле, с которой связана данная запись.

- Для таблиц с [компактным форматом](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) ClickHouse использует файлы меток `.mrk3`.

:::

:::note Почему используются файлы меток

Почему первичный индекс напрямую не содержит физические расположения гранул, соответствующих меткам индекса?

Потому что при тех очень больших масштабах, для которых спроектирован ClickHouse, крайне важно эффективно использовать диск и память.

Файл первичного индекса должен умещаться в оперативную память.

В нашем примерном запросе ClickHouse использовал первичный индекс и выбрал одну гранулу, которая потенциально может содержать строки, удовлетворяющие нашему запросу. Только для этой одной гранулы ClickHouse затем требуются физические расположения, чтобы передать соответствующие строки для дальнейшей обработки.

Кроме того, эта информация о смещениях нужна только для столбцов UserID и URL.

Информация о смещениях не нужна для столбцов, не используемых в запросе, например `EventTime`.

Для нашего примерного запроса ClickHouse нужны только два смещения физических расположений для гранулы 176 в файле данных UserID (UserID.bin) и два смещения физических расположений для гранулы 176 в файле данных URL (URL.bin).

Дополнительный уровень косвенности, обеспечиваемый файлами меток, позволяет избежать хранения непосредственно в первичном индексе записей с физическими расположениями всех 1083 гранул для всех трёх столбцов, тем самым избегая наличия избыточных (потенциально неиспользуемых) данных в оперативной памяти.
:::

Следующая диаграмма и текст ниже показывают, как в нашем примерном запросе ClickHouse находит гранулу 176 в файле данных UserID.bin.

<Image img={sparsePrimaryIndexes06} size="md" alt="Разрежённые первичные индексы 06" background="white"/>

Ранее в этом руководстве мы обсудили, что ClickHouse выбрал метку первичного индекса 176 и, следовательно, гранулу 176 как потенциально содержащую строки, соответствующие нашему запросу.

Теперь ClickHouse использует выбранный номер метки (176) из индекса для позиционного поиска по массиву в файле меток UserID.mrk, чтобы получить два смещения для определения расположения гранулы 176.

Как показано, первое смещение определяет расположение сжатого блока файла внутри файла данных UserID.bin, который, в свою очередь, содержит сжатую версию гранулы 176.

После того как найденный блок файла распакован в оперативную память, второе смещение из файла меток можно использовать для поиска гранулы 176 в распакованных данных.

ClickHouse необходимо найти (и передать все значения из) гранулу 176 как из файла данных UserID.bin, так и из файла данных URL.bin, чтобы выполнить наш примерный запрос (топ-10 наиболее кликаемых URL для интернет-пользователя с UserID 749.927.693).



Диаграмма выше показывает, как ClickHouse находит гранулу для файла данных UserID.bin.

Параллельно ClickHouse делает то же самое для гранулы №176 файла данных URL.bin. Эти две соответствующие гранулы синхронизируются и в потоковом режиме передаются в движок ClickHouse для дальнейшей обработки, а именно агрегации и подсчёта значений URL по группам для всех строк, где UserID равен 749.927.693, после чего выводятся 10 групп URL с наибольшим количеством в порядке убывания.



## Использование нескольких первичных индексов

<a name="filtering-on-key-columns-after-the-first" />

### Вторичные столбцы ключа могут быть (не)эффективны

Когда в запросе выполняется фильтрация по столбцу, который является частью составного ключа и является первым столбцом ключа, [ClickHouse выполняет алгоритм двоичного поиска по меткам индекса этого столбца ключа](#the-primary-index-is-used-for-selecting-granules).

Но что происходит, когда в запросе выполняется фильтрация по столбцу, который является частью составного ключа, но не является первым столбцом ключа?

:::note
Мы рассматриваем сценарий, когда запрос явно не фильтрует по первому столбцу ключа, а фильтрует по вторичному столбцу ключа.

Когда запрос фильтрует и по первому столбцу ключа, и по любому из столбцов ключа после первого, ClickHouse выполняет двоичный поиск по меткам индекса первого столбца ключа.
:::

<br />

<br />

<a name="query-on-url" />

Мы используем запрос, который вычисляет топ-10 пользователей, чаще всего кликнувших по URL «[http://public&#95;search»](http://public\&#95;search»):

```sql
SELECT UserID, count(UserID) AS Count
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

Ответ: <a name="query-on-url-slow" />

```response
┌─────UserID─┬─Count─┐
│ 2459550954 │  3741 │
│ 1084649151 │  2484 │
│  723361875 │   729 │
│ 3087145896 │   695 │
│ 2754931092 │   672 │
│ 1509037307 │   582 │
│ 3085460200 │   573 │
│ 2454360090 │   556 │
│ 3884990840 │   539 │
│  765730816 │   536 │
└────────────┴───────┘
```


10 строк в выборке. Время выполнения: 0.086 сек.

# highlight-next-line

Обработано 8.81 миллиона строк,
799.69 MB (102.11 миллиона строк/с, 9.27 GB/с.)

```

Вывод клиента показывает, что ClickHouse почти полностью просканировал таблицу, несмотря на то, что [столбец URL входит в составной первичный ключ](#a-table-with-a-primary-key)! ClickHouse прочитал 8,81 млн строк из 8,87 млн строк таблицы.
```


Если [trace&#95;logging](/operations/server-configuration-parameters/settings#logger) включён, в файле журнала сервера ClickHouse будет видно, что ClickHouse выполнил <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">обобщённый поиск с исключением</a> по 1083 меткам индекса URL, чтобы определить те гранулы, которые потенциально могут содержать строки со значением столбца URL, равным &quot;[http://public&#95;search](http://public\&#95;search)&quot;:

```response
...Executor): Условие по ключу: (столбец 1 в ['http://public_search',
                                           'http://public_search'])
# highlight-next-line
...Executor): Использован обобщённый поиск с исключением по индексу для части all_1_9_2
              с 1537 шагами
...Executor): Выбрано 1/1 частей по ключу партиционирования, 1 часть по первичному ключу,
# highlight-next-line
              1076/1083 меток по первичному ключу, 1076 меток для чтения из 5 диапазонов
...Executor): Чтение примерно 8814592 строк с 10 потоками
```

Мы можем видеть в примере трассировочного лога выше, что 1076 (по меткам) из 1083 гранул были выбраны как потенциально содержащие строки с совпадающим значением URL.

В результате в движок ClickHouse (параллельно с использованием 10 потоков) передаётся 8,81 миллиона строк, чтобы идентифицировать строки, которые действительно содержат значение URL &quot;[http://public&#95;search](http://public\&#95;search)&quot;.

Однако, как мы увидим позже, только 39 гранул из выбранных 1076 гранул действительно содержат совпадающие строки.

Хотя первичный индекс, основанный на составном первичном ключе (UserID, URL), был очень полезен для ускорения запросов, отфильтровывающих строки по конкретному значению UserID, этот индекс не даёт заметного выигрыша в ускорении запроса, который фильтрует строки по конкретному значению URL.

Причина в том, что столбец URL не является первым столбцом ключа, и поэтому ClickHouse использует универсальный алгоритм поиска с исключением (вместо бинарного поиска) по меткам индекса столбца URL, и **эффективность этого алгоритма зависит от разницы в кардинальности** между столбцом URL и его предшествующим ключевым столбцом UserID.

Чтобы проиллюстрировать это, мы приведём некоторые детали того, как работает универсальный поиск с исключением.

<a name="generic-exclusion-search-algorithm" />

### Алгоритм универсального поиска с исключением

Ниже показано, как <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank">универсальный алгоритм поиска с исключением в ClickHouse</a> работает, когда гранулы выбираются по вторичному столбцу, у которого предшествующий ключевой столбец имеет низкую (или высокую) кардинальность.

В качестве примера для обоих случаев мы будем предполагать:

* запрос, который ищет строки со значением URL = &quot;W3&quot;.
* абстрактную версию нашей таблицы hits с упрощёнными значениями для UserID и URL.
* тот же составной первичный ключ (UserID, URL) для индекса. Это означает, что строки сначала упорядочены по значениям UserID. Строки с одинаковым значением UserID затем упорядочены по URL.
* размер гранулы два, т.е. каждая гранула содержит две строки.

Мы отметили значения ключевых столбцов для первых строк таблицы в каждой грануле оранжевым цветом на диаграммах ниже.

**Предшествующий ключевой столбец имеет низкую кардинальность**<a name="generic-exclusion-search-fast" />

Предположим, что UserID имеет низкую кардинальность. В этом случае вероятно, что одно и то же значение UserID распределено по нескольким строкам таблицы и гранулам и, следовательно, по нескольким меткам индекса. Для меток индекса с одинаковым UserID значения URL для этих меток отсортированы по возрастанию (поскольку строки таблицы упорядочены сначала по UserID, а затем по URL). Это позволяет эффективно фильтровать, как описано ниже:

<Image img={sparsePrimaryIndexes07} size="md" alt="Sparse Primary Indices 06" background="white" />

Существует три разных сценария процесса выбора гранул для нашего абстрактного набора данных на диаграмме выше:

1. Метка индекса 0, для которой **значение URL меньше W3 и для которой значение URL для непосредственно следующей метки индекса также меньше W3**, может быть исключена, потому что метки 0 и 1 имеют одно и то же значение UserID. Обратите внимание, что это предварительное условие для исключения гарантирует, что гранула 0 полностью состоит из значений UserID U1, так что ClickHouse может предположить, что максимальное значение URL в грануле 0 также меньше W3 и исключить гранулу.


2. Индексная метка 1, для которой **значение URL меньше (или равно) W3 и для которой значение URL непосредственно следующей индексной метки больше (или равно) W3**, выбирается, потому что это означает, что гранула 1 потенциально может содержать строки с URL W3.

3. Индексные метки 2 и 3, для которых **значение URL больше W3**, могут быть исключены, поскольку индексные метки первичного индекса хранят значения ключевого столбца для первой строки таблицы для каждой гранулы, а строки таблицы на диске отсортированы по значениям ключевого столбца, следовательно, гранулы 2 и 3 не могут содержать значение URL W3.

**Предшествующий ключевой столбец имеет высокую (или более высокую) кардинальность**<a name="generic-exclusion-search-slow" />

Когда у UserID высокая кардинальность, маловероятно, что одно и то же значение UserID будет распределено по нескольким строкам таблицы и гранулам. Это означает, что значения URL для индексных меток не возрастают монотонно:

<Image img={sparsePrimaryIndexes08} size="md" alt="Sparse Primary Indices 06" background="white" />

Как видно на диаграмме выше, все показанные метки, значения URL которых меньше W3, выбираются для потоковой передачи строк их соответствующей гранулы в движок ClickHouse.

Это связано с тем, что, хотя все индексные метки на диаграмме подпадают под сценарий 1, описанный выше, они не удовлетворяют указанному предварительному условию исключения, согласно которому *непосредственно следующая индексная метка имеет то же значение UserID, что и текущая метка*, и, следовательно, не могут быть исключены.

Например, рассмотрим индексную метку 0, для которой **значение URL меньше W3 и значение URL непосредственно следующей индексной метки также меньше W3**. Она *не* может быть исключена, потому что непосредственно следующая индексная метка 1 *не* имеет то же значение UserID, что и текущая метка 0.

В итоге это не позволяет ClickHouse делать предположения о максимальном значении URL в грануле 0. Вместо этого он должен предполагать, что гранула 0 потенциально содержит строки со значением URL W3, и вынужден выбрать метку 0.

Та же ситуация справедлива для меток 1, 2 и 3.

:::note Conclusion
<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">Алгоритм generic exclusion search</a>, который ClickHouse использует вместо <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">алгоритма двоичного поиска (binary search)</a>, когда запрос фильтрует по столбцу, который является частью составного ключа, но не является первым ключевым столбцом, наиболее эффективен, когда предшествующий ключевой столбец имеет низкую (или более низкую) кардинальность.
:::

В нашем примере набора данных оба ключевых столбца (UserID, URL) имеют схожую высокую кардинальность, и, как было объяснено, алгоритм generic exclusion search не очень эффективен, когда предшествующий по отношению к столбцу URL ключевой столбец имеет высокую (или схожую) кардинальность.

### Примечание об индексе пропуска данных

Из-за схожей высокой кардинальности UserID и URL наш [запрос, фильтрующий по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) также не получил бы значительной выгоды от создания [вторичного индекса пропуска данных](./skipping-indexes.md) по столбцу URL
в нашей [таблице с составным первичным ключом (UserID, URL)](#a-table-with-a-primary-key).

Например, следующие два оператора создают и заполняют индекс пропуска данных [minmax](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) по столбцу URL нашей таблицы:

```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```

ClickHouse создал дополнительный индекс, который для каждой группы из 4 последовательных [гранул](#data-is-organized-into-granules-for-parallel-data-processing) (обратите внимание на параметр `GRANULARITY 4` в приведённом выше выражении `ALTER TABLE`) сохраняет минимальное и максимальное значение URL:

<Image img={sparsePrimaryIndexes13a} size="md" alt="Разреженные первичные индексы 13a" background="white" />

Первая запись индекса («mark 0» на диаграмме выше) хранит минимальное и максимальное значения URL для [строк, относящихся к первым четырём гранулам нашей таблицы](#data-is-organized-into-granules-for-parallel-data-processing).


Второй элемент индекса (&#39;mark 1&#39;) хранит минимальные и максимальные значения URL для строк, относящихся к следующим 4 гранулам нашей таблицы, и так далее.

(ClickHouse также создал специальный [файл меток](#mark-files-are-used-for-locating-granules) для индекса пропуска данных для [поиска](#mark-files-are-used-for-locating-granules) групп гранул, связанных с метками индекса.)

Из‑за одинаково высокой кардинальности `UserID` и `URL` этот вторичный индекс пропуска данных не может помочь с исключением гранул из выборки при выполнении нашего [запроса, фильтрующего по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient).

Искомое запросом конкретное значение URL (т.е. &#39;[http://public&#95;search&amp;#39](http://public\&#95;search\&#39);) с высокой вероятностью находится между минимальным и максимальным значением, хранящимся индексом для каждой группы гранул, в результате чего ClickHouse вынужден выбирать группу гранул (потому что она может содержать строки, соответствующие запросу).

### Необходимость использовать несколько первичных индексов

Как следствие, если мы хотим существенно ускорить наш пример запроса, который фильтрует строки с конкретным `URL`, нам нужно использовать первичный индекс, оптимизированный под этот запрос.

Если, кроме того, мы хотим сохранить хорошую производительность нашего примера запроса, который фильтрует строки с конкретным `UserID`, тогда нам нужно использовать несколько первичных индексов.

Ниже показаны способы достижения этого.

<a name="multiple-primary-indexes" />

### Варианты создания дополнительных первичных индексов

Если мы хотим существенно ускорить оба наших примера запросов — тот, который фильтрует строки с конкретным `UserID`, и тот, который фильтрует строки с конкретным `URL`, — то нам нужно использовать несколько первичных индексов, применяя один из следующих трёх вариантов:

* Создать **вторую таблицу** с другим первичным ключом.
* Создать **материализованное представление** на нашей существующей таблице.
* Добавить **проекцию** к нашей существующей таблице.

Все три варианта по сути продублируют наши данные из примера в дополнительную таблицу, чтобы реорганизовать первичный индекс таблицы и порядок сортировки строк.

Однако эти три варианта различаются тем, насколько прозрачна эта дополнительная таблица для пользователя с точки зрения маршрутизации запросов и операторов вставки.

При создании **второй таблицы** с другим первичным ключом запросы должны явно отправляться в ту версию таблицы, которая наилучшим образом подходит для запроса, а новые данные должны явно вставляться в обе таблицы, чтобы поддерживать их синхронизацию:

<Image img={sparsePrimaryIndexes09a} size="md" alt="Разреженные первичные индексы 09a" background="white" />

С **материализованным представлением** дополнительная таблица неявно создаётся, и данные между обеими таблицами автоматически синхронизируются:

<Image img={sparsePrimaryIndexes09b} size="md" alt="Разреженные первичные индексы 09b" background="white" />

А **проекция** является наиболее прозрачным вариантом, потому что, помимо автоматического поддержания неявно созданной (и скрытой) дополнительной таблицы в синхронизации с изменениями данных, ClickHouse автоматически выбирает наиболее эффективную версию таблицы для запросов:

<Image img={sparsePrimaryIndexes09c} size="md" alt="Разреженные первичные индексы 09c" background="white" />

В дальнейшем мы обсудим эти три варианта создания и использования нескольких первичных индексов более подробно и на реальных примерах.

<a name="multiple-primary-indexes-via-secondary-tables" />

### Вариант 1: Вторичные таблицы

<a name="secondary-table" />

Мы создаём новую дополнительную таблицу, в которой меняем порядок столбцов ключа (по сравнению с исходной таблицей) в первичном ключе:

```sql
CREATE TABLE hits_URL_UserID
(
    `UserID` UInt32,
    `URL` String,
    `EventTime` DateTime
)
ENGINE = MergeTree
-- выделить-следующую-строку
PRIMARY KEY (URL, UserID)
ORDER BY (URL, UserID, EventTime)
SETTINGS index_granularity = 8192, index_granularity_bytes = 0, compress_primary_key = 0;
```

Вставьте все 8,87 миллиона строк из нашей [исходной таблицы](#a-table-with-a-primary-key) во вспомогательную таблицу:

```sql
INSERT INTO hits_URL_UserID
SELECT * FROM hits_UserID_URL;
```

Ответ будет выглядеть примерно так:

```response
ОК.

0 строк в наборе. Прошло: 2.898 сек. Обработано 8.87 млн строк, 838.84 МБ (3.06 млн строк/с, 289.46 МБ/с).
```

И, наконец, оптимизируйте таблицу:

```sql
ОПТИМИЗИРОВАТЬ ТАБЛИЦУ hits_URL_UserID FINAL;
```


Поскольку мы поменяли порядок столбцов в первичном ключе, вставленные строки теперь хранятся на диске в другом лексикографическом порядке (по сравнению с нашей [исходной таблицей](#a-table-with-a-primary-key)) и, следовательно, те же 1083 гранулы этой таблицы теперь содержат другие значения, чем раньше:

<Image img={sparsePrimaryIndexes10} size="md" alt="Sparse Primary Indices 10" background="white" />

В результате получаем следующий первичный ключ:

<Image img={sparsePrimaryIndexes11} size="md" alt="Sparse Primary Indices 11" background="white" />

Теперь его можно использовать для существенного ускорения выполнения нашего примерного запроса с фильтрацией по столбцу URL, чтобы вычислить топ-10 пользователей, которые чаще всего переходили по URL &quot;[http://public&#95;search](http://public\&#95;search)&quot;:

```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

Ответ:

<a name="query-on-url-fast" />

```response
┌─────UserID─┬─Count─┐
│ 2459550954 │  3741 │
│ 1084649151 │  2484 │
│  723361875 │   729 │
│ 3087145896 │   695 │
│ 2754931092 │   672 │
│ 1509037307 │   582 │
│ 3085460200 │   573 │
│ 2454360090 │   556 │
│ 3884990840 │   539 │
│  765730816 │   536 │
└────────────┴───────┘
```


10 строк в наборе. Прошло: 0.017 сек.

# highlight-next-line

Обработано 319.49 тыс. строк,
11.38 MB (18.41 млн строк/с, 655.75 MB/с.)

```

Теперь, вместо [почти полного сканирования таблицы](/guides/best-practices/sparse-primary-indexes#efficient-filtering-on-secondary-key-columns), ClickHouse выполнил этот запрос гораздо эффективнее.

С первичным индексом из [исходной таблицы](#a-table-with-a-primary-key), где UserID был первым, а URL — вторым столбцом ключа, ClickHouse использовал [обобщённый поиск по исключению](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) по меткам индекса для выполнения этого запроса, и это было не очень эффективно из‑за схожей высокой кардинальности UserID и URL.
```


С URL в качестве первого столбца в первичном индексе ClickHouse теперь выполняет <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">двоичный поиск</a> по меткам индекса.
Соответствующая трассировочная запись в журнале сервера ClickHouse подтверждает, что:

```response
...Executor): Key condition: (column 0 in ['http://public_search',
                                           'http://public_search'])
# highlight-next-line
...Executor): Running binary search on index range for part all_1_9_2 (1083 marks)
...Executor): Found (LEFT) boundary mark: 644
...Executor): Found (RIGHT) boundary mark: 683
...Executor): Found continuous range in 19 steps
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,
# highlight-next-line
              39/1083 marks by primary key, 39 marks to read from 1 ranges
...Executor): Reading approx. 319488 rows with 2 streams
```

ClickHouse выбрал только 39 меток индекса вместо 1076 при использовании алгоритма generic exclusion search.

Обратите внимание, что дополнительная таблица оптимизирована для ускорения выполнения нашего примера запроса с фильтрацией по URL.

Аналогично [низкой производительности](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) этого запроса с нашей [исходной таблицей](#a-table-with-a-primary-key), наш [пример запроса с фильтрацией по `UserIDs`](#the-primary-index-is-used-for-selecting-granules) будет выполняться не очень эффективно с новой дополнительной таблицей, потому что UserID теперь является вторым ключевым столбцом в первичном индексе этой таблицы, и поэтому ClickHouse будет использовать generic exclusion search для выбора гранул, что [не очень эффективно при сопоставимой высокой кардинальности значений](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) UserID и URL.
Откройте блок с подробностями, чтобы посмотреть детали.

<details>
    <summary>
    Запрос с фильтрацией по UserID теперь выполняется с низкой производительностью<a name="query-on-userid-slow"></a>
    </summary>
    <p>

```sql
SELECT URL, count(URL) AS Count
FROM hits_URL_UserID
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

Результат:

```response
┌─URL────────────────────────────┬─Count─┐
│ http://auto.ru/chatay-barana.. │   170 │
│ http://auto.ru/chatay-id=371...│    52 │
│ http://public_search           │    45 │
│ http://kovrik-medvedevushku-...│    36 │
│ http://forumal                 │    33 │
│ http://korablitz.ru/L_1OFFER...│    14 │
│ http://auto.ru/chatay-id=371...│    14 │
│ http://auto.ru/chatay-john-D...│    13 │
│ http://auto.ru/chatay-john-D...│    10 │
│ http://wot/html?page/23600_m...│     9 │
└────────────────────────────────┴───────┘

```


10 строк в наборе. Прошло: 0.024 сек.

# highlight-next-line

Обработано 8.02 миллиона строк,
73.04 МБ (340.26 миллиона строк/с., 3.10 ГБ/с.)

```
```


Журнал сервера:

```response
...Executor): Ключевое условие: (столбец 1 в [749927693, 749927693])
# highlight-next-line
...Executor): Использован универсальный поиск с исключением по индексу для части all_1_9_2
              с 1453 шагами
...Executor): Выбрано 1/1 части по ключу партиционирования, 1 часть по первичному ключу,
# highlight-next-line
              980/1083 меток по первичному ключу, 980 меток для чтения из 23 диапазонов
...Executor): Чтение примерно 8028160 строк с использованием 10 потоков
```

</p>
</details>

Теперь у нас есть две таблицы. Они оптимизированы, соответственно, для ускорения запросов с фильтрацией по `UserIDs` и для ускорения запросов с фильтрацией по URL.

### Вариант 2: материализованные представления {#option-2-materialized-views}

Создадим [материализованное представление](/sql-reference/statements/create/view.md) на основе нашей существующей таблицы.

```sql
CREATE MATERIALIZED VIEW mv_hits_URL_UserID
ENGINE = MergeTree()
PRIMARY KEY (URL, UserID)
ORDER BY (URL, UserID, EventTime)
POPULATE
AS SELECT * FROM hits_UserID_URL;
```

Ответ будет таким:

```response
Ok.

0 rows in set. Elapsed: 2.935 sec. Processed 8.87 million rows, 838.84 MB (3.02 million rows/s., 285.84 MB/s.)
```

:::note

- мы меняем порядок ключевых столбцов (по сравнению с [исходной таблицей](#a-table-with-a-primary-key)) в первичном ключе представления
- материализованное представление опирается на **неявно созданную таблицу**, порядок строк и первичный индекс которой основаны на заданном определении первичного ключа
- неявно созданная таблица отображается в результате запроса `SHOW TABLES` и имеет имя, начинающееся с `.inner`
- также можно сначала явно создать таблицу, лежащую в основе материализованного представления, а затем направить представление на эту таблицу с помощью [оператора](/sql-reference/statements/create/view.md) `TO [db].[table]`
- мы используем ключевое слово `POPULATE`, чтобы сразу заполнить неявно созданную таблицу всеми 8,87 млн строк из исходной таблицы [hits_UserID_URL](#a-table-with-a-primary-key)
- если в исходную таблицу hits_UserID_URL вставляются новые строки, эти строки автоматически вставляются и в неявно созданную таблицу
- Фактически неявно созданная таблица имеет тот же порядок строк и тот же первичный индекс, что и [вторичная таблица, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables):

<Image
  img={sparsePrimaryIndexes12b1}
  size='md'
  alt='Разреженные первичные индексы 12b1'
  background='white'
/>

ClickHouse хранит [файлы данных столбцов](#data-is-stored-on-disk-ordered-by-primary-key-columns) (_.bin), [файлы меток](#mark-files-are-used-for-locating-granules) (_.mrk2) и [первичный индекс](#the-primary-index-has-one-entry-per-granule) (primary.idx) неявно созданной таблицы в специальной папке внутри каталога данных сервера ClickHouse:

<Image
  img={sparsePrimaryIndexes12b2}
  size='md'
  alt='Разреженные первичные индексы 12b2'
  background='white'
/>

:::

Теперь неявно созданную таблицу (и её первичный индекс), обеспечивающую работу материализованного представления, можно использовать для значительного ускорения выполнения нашего примера запроса с фильтрацией по столбцу URL:

```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM mv_hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

Ответ:

```response
┌─────UserID─┬─Count─┐
│ 2459550954 │  3741 │
│ 1084649151 │  2484 │
│  723361875 │   729 │
│ 3087145896 │   695 │
│ 2754931092 │   672 │
│ 1509037307 │   582 │
│ 3085460200 │   573 │
│ 2454360090 │   556 │
│ 3884990840 │   539 │
│  765730816 │   536 │
└────────────┴───────┘

```


10 строк в наборе. Время выполнения: 0.026 сек.

# highlight-next-line

Обработано 335.87 тыс. строк,
13.54 МБ (12.91 млн строк/с, 520.38 МБ/с.)

```

Поскольку фактически неявно созданная таблица (и её первичный индекс), лежащая в основе материализованного представления, идентична [вторичной таблице, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables), запрос выполняется столь же эффективно, как и при использовании явно созданной таблицы.

Соответствующий трассировочный лог в журнале сервера ClickHouse подтверждает, что ClickHouse выполняет двоичный поиск по меткам индекса:
```


```response
...Executor): Ключевое условие: (столбец 0 IN ['http://public_search',
                                           'http://public_search'])
# highlight-next-line
...Executor): Выполнение двоичного поиска по диапазону индекса ...
...
...Executor): Выбрано 4/4 частей по ключу партиционирования, 4 части по первичному ключу,
# highlight-next-line
              41/1083 меток по первичному ключу, 41 метка для чтения из 4 диапазонов
...Executor): Чтение примерно 335 872 строк в 4 потоках
```

### Вариант 3: Проекции

Создайте проекцию в нашей существующей таблице:

```sql
ALTER TABLE hits_UserID_URL
    ADD PROJECTION prj_url_userid
    (
        SELECT *
        ORDER BY (URL, UserID)
    );
```

Теперь материализуем проекцию:

```sql
ALTER TABLE hits_UserID_URL
    MATERIALIZE PROJECTION prj_url_userid;
```

:::note

* проекция создает **скрытую таблицу**, порядок строк и первичный индекс которой определяются указанным в проекции предложением `ORDER BY`
* скрытая таблица не отображается в результате запроса `SHOW TABLES`
* мы используем ключевое слово `MATERIALIZE`, чтобы сразу заполнить скрытую таблицу всеми 8,87 миллионами строк из исходной таблицы [hits&#95;UserID&#95;URL](#a-table-with-a-primary-key)
* если в исходную таблицу hits&#95;UserID&#95;URL вставляются новые строки, то эти строки автоматически также вставляются и в скрытую таблицу
* запрос всегда (синтаксически) обращается к исходной таблице hits&#95;UserID&#95;URL, но если порядок строк и первичный индекс скрытой таблицы позволяют более эффективно выполнить запрос, то будет использована именно скрытая таблица
* обратите внимание, что проекции не делают более эффективными запросы, использующие ORDER BY, даже если ORDER BY совпадает с предложением ORDER BY проекции (см. [https://github.com/ClickHouse/ClickHouse/issues/47333](https://github.com/ClickHouse/ClickHouse/issues/47333))
* по сути, неявно созданная скрытая таблица имеет тот же порядок строк и первичный индекс, что и [вторичная таблица, которую мы создавали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables):

<Image img={sparsePrimaryIndexes12c1} size="md" alt="Sparse Primary Indices 12c1" background="white" />

ClickHouse хранит [файлы данных столбцов](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin), [файлы меток](#mark-files-are-used-for-locating-granules) (*.mrk2) и [первичный индекс](#the-primary-index-has-one-entry-per-granule) (primary.idx) скрытой таблицы в специальной папке (отмечена оранжевым цветом на скриншоте ниже) рядом с файлами данных, файлами меток и файлами первичного индекса исходной таблицы:

<Image img={sparsePrimaryIndexes12c2} size="sm" alt="Sparse Primary Indices 12c2" background="white" />

:::

Скрытая таблица (и её первичный индекс), созданная проекцией, теперь может (неявно) использоваться для значительного ускорения выполнения нашего примера запроса с фильтрацией по столбцу URL. Обратите внимание, что запрос синтаксически обращается к исходной таблице, на которую указывает проекция.

```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

Ответ:

```response
┌─────UserID─┬─Count─┐
│ 2459550954 │  3741 │
│ 1084649151 │  2484 │
│  723361875 │   729 │
│ 3087145896 │   695 │
│ 2754931092 │   672 │
│ 1509037307 │   582 │
│ 3085460200 │   573 │
│ 2454360090 │   556 │
│ 3884990840 │   539 │
│  765730816 │   536 │
└────────────┴───────┘
```


10 строк в наборе. Прошло: 0.029 с.

# highlight-next-line

Обработано 319,49 тыс. строк, 1
1,38 МБ (11,05 млн строк/с, 393,58 МБ/с.)

```

Поскольку скрытая таблица (и её первичный индекс), созданная проекцией, по сути идентична [вторичной таблице, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables), запрос выполняется так же эффективно, как и с явно созданной таблицей.

Соответствующая запись трассировки в журнале сервера ClickHouse подтверждает, что ClickHouse выполняет двоичный поиск по меткам индекса:
```


```response
...Executor): Условие по ключу: (столбец 0 IN ['http://public_search',
                                           'http://public_search'])
# highlight-next-line
...Executor): Выполняется двоичный поиск по диапазону индекса части prj_url_userid (1083 меток)
...Executor): ...
# highlight-next-line
...Executor): Выбрана полная проекция типа Normal prj_url_userid
...Executor): столбцы, требуемые проекцией: URL, UserID
...Executor): Выбрано 1/1 частей по ключу партиционирования, 1 часть по первичному ключу,
# highlight-next-line
              39/1083 меток по первичному ключу, 39 меток для чтения из 1 диапазона
...Executor): Чтение примерно 319 488 строк в 2 потока
```

### Резюме

Первичный индекс нашей [таблицы с составным первичным ключом (UserID, URL)](#a-table-with-a-primary-key) был очень полезен для ускорения [запроса с фильтрацией по UserID](#the-primary-index-is-used-for-selecting-granules). Но этот индекс не даёт значимого ускорения для [запроса с фильтрацией по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient), несмотря на то что столбец URL является частью составного первичного ключа.

И наоборот:
Первичный индекс нашей [таблицы с составным первичным ключом (URL, UserID)](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) ускорял [запрос с фильтрацией по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient), но почти не помогал ускорить [запрос с фильтрацией по UserID](#the-primary-index-is-used-for-selecting-granules).

Из-за схожей высокой кардинальности столбцов первичного ключа UserID и URL запрос с фильтрацией по второму столбцу ключа [почти не получает выгоды от присутствия второго столбца ключа в индексе](#generic-exclusion-search-algorithm).

Поэтому имеет смысл убрать второй столбец ключа из первичного индекса (что приведёт к меньшему потреблению памяти индексом) и вместо этого [использовать несколько первичных индексов](/guides/best-practices/sparse-primary-indexes#using-multiple-primary-indexes).

Однако если столбцы ключа в составном первичном ключе сильно различаются по кардинальности, то [для запросов выгодно](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) упорядочить столбцы первичного ключа по кардинальности в порядке возрастания.

Чем больше разница в кардинальности между столбцами ключа, тем сильнее порядок этих столбцов в ключе влияет на результат. В следующем разделе мы это продемонстрируем.


## Эффективный порядок столбцов ключа

<a name="test" />

В составном первичном ключе порядок столбцов ключа может существенно влиять как на:

* эффективность фильтрации по вторичным столбцам ключа в запросах, так и на
* коэффициент сжатия файлов данных таблицы.

Чтобы продемонстрировать это, мы будем использовать версию нашего [примерного набора данных веб-трафика](#data-set),
в котором каждая строка содержит три столбца, указывающих, было ли обращение интернет‑«пользователя» (столбец `UserID`) к URL‑адресу (столбец `URL`) помечено как трафик от ботов (столбец `IsRobot`).

Мы будем использовать составной первичный ключ, содержащий все три вышеупомянутых столбца, который может быть использован для ускорения типичных запросов веб-аналитики, вычисляющих:

* какую долю (в процентах) трафика на конкретный URL составляют боты, или
* насколько мы уверены, что конкретный пользователь (не) является ботом (какой процент трафика от этого пользователя (не) считается трафиком от ботов).

Мы используем этот запрос для вычисления кардинальностей трех столбцов, которые мы хотим использовать в качестве столбцов ключа в составном первичном ключе (обратите внимание, что мы используем [функцию таблицы URL](/sql-reference/table-functions/url.md) для выполнения разовых запросов к TSV‑данным без необходимости создавать локальную таблицу). Выполните этот запрос в `clickhouse client`:

```sql
SELECT
    formatReadableQuantity(uniq(URL)) AS cardinality_URL,
    formatReadableQuantity(uniq(UserID)) AS cardinality_UserID,
    formatReadableQuantity(uniq(IsRobot)) AS cardinality_IsRobot
FROM
(
    SELECT
        c11::UInt64 AS UserID,
        c15::String AS URL,
        c20::UInt8 AS IsRobot
    FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
    WHERE URL != ''
)
```

Ответ:

```response
┌─cardinality_URL─┬─cardinality_UserID─┬─cardinality_IsRobot─┐
│ 2.39 млн        │ 119.08 тыс.        │ 4.00                │
└─────────────────┴────────────────────┴─────────────────────┘

1 строка в наборе. Время выполнения: 118.334 сек. Обработано 8.87 млн строк, 15.88 ГБ (74.99 тыс. строк/с, 134.21 МБ/с).
```

Мы видим, что существует существенная разница в кардинальности, особенно между столбцами `URL` и `IsRobot`, и поэтому порядок этих столбцов в составном первичном ключе имеет важное значение как для эффективного выполнения запросов с фильтрацией по этим столбцам, так и для достижения оптимальных коэффициентов сжатия файлов данных столбцов таблицы.

Чтобы продемонстрировать это, мы создадим две версии таблицы для данных для анализа ботовского трафика:

* таблицу `hits_URL_UserID_IsRobot` с составным первичным ключом `(URL, UserID, IsRobot)`, где мы упорядочиваем столбцы ключа по кардинальности в порядке убывания;
* таблицу `hits_IsRobot_UserID_URL` с составным первичным ключом `(IsRobot, UserID, URL)`, где мы упорядочиваем столбцы ключа по кардинальности в порядке возрастания.

Создайте таблицу `hits_URL_UserID_IsRobot` с составным первичным ключом `(URL, UserID, IsRobot)`:

```sql
CREATE TABLE hits_URL_UserID_IsRobot
(
    `UserID` UInt32,
    `URL` String,
    `IsRobot` UInt8
)
ENGINE = MergeTree
-- highlight-next-line
PRIMARY KEY (URL, UserID, IsRobot);
```

И заполните таблицу 8,87 млн строк:

```sql
INSERT INTO hits_URL_UserID_IsRobot SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```

Вот ответ:

```response
0 строк в наборе. Прошло: 104.729 с. Обработано 8,87 млн строк, 15,88 ГБ (84,73 тыс. строк/с, 151,64 МБ/с.)
```

Затем создайте таблицу `hits_IsRobot_UserID_URL` со составным первичным ключом `(IsRobot, UserID, URL)`:

```sql
CREATE TABLE hits_IsRobot_UserID_URL
(
    `UserID` UInt32,
    `URL` String,
    `IsRobot` UInt8
)
ENGINE = MergeTree
-- выделить следующую строку
PRIMARY KEY (IsRobot, UserID, URL);
```

И заполните её теми же 8,87 миллионами строк, которые мы использовали для предыдущей таблицы:


```sql
INSERT INTO hits_IsRobot_UserID_URL SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```

Ответ:

```response
0 строк в наборе. Прошло: 95.959 сек. Обработано 8.87 млн строк, 15.88 ГБ (92.48 тыс. строк/с, 165.50 МБ/с).
```

### Эффективная фильтрация по вторичным ключевым столбцам

Когда запрос фильтрует как минимум по одному столбцу, который является частью составного ключа и является первым ключевым столбцом, [ClickHouse выполняет алгоритм двоичного поиска по меткам индекса этого ключевого столбца](#the-primary-index-is-used-for-selecting-granules).

Когда запрос фильтрует (только) по столбцу, который является частью составного ключа, но не является первым ключевым столбцом, [ClickHouse использует общий алгоритм исключающего поиска по меткам индекса этого ключевого столбца](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient).

Во втором случае порядок ключевых столбцов в составном первичном ключе имеет значение для эффективности [общего алгоритма исключающего поиска](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444).

Ниже приведён запрос, который фильтрует по столбцу `UserID` таблицы, в которой мы упорядочили ключевые столбцы `(URL, UserID, IsRobot)` по кардинальности в порядке убывания:

```sql
SELECT count(*)
FROM hits_URL_UserID_IsRobot
WHERE UserID = 112304
```

Ответ:

```response
┌─count()─┐
│      73 │
└─────────┘
```


1 строка в наборе. Время выполнения: 0.026 с.

# highlight-next-line

Обработано 7,92 миллиона строк,
31,67 МБ (306,90 миллиона строк/с, 1,23 ГБ/с)

````

Это тот же запрос к таблице, где мы упорядочили ключевые столбцы `(IsRobot, UserID, URL)` по кардинальности в порядке возрастания:
```sql
SELECT count(*)
FROM hits_IsRobot_UserID_URL
WHERE UserID = 112304
````

Ответ:

```response
┌─count()─┐
│      73 │
└─────────┘
```


1 строка в наборе. Затрачено времени: 0.003 сек.

# highlight-next-line

Обработано 20.32 тыс. строк,
81.28 КБ (6.61 млн строк/с, 26.44 МБ/с.)

````

Мы видим, что выполнение запроса значительно эффективнее и быстрее на таблице, в которой мы упорядочили ключевые столбцы по возрастанию их кардинальности.

Причина в том, что [обобщённый алгоритм поиска с исключением](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444) работает наиболее эффективно, когда [гранулы](#the-primary-index-is-used-for-selecting-granules) выбираются по столбцу вторичного ключа, предшествующий столбец которого имеет более низкую кардинальность. Мы подробно проиллюстрировали это в [предыдущем разделе](#generic-exclusion-search-algorithm) данного руководства.

### Оптимальный коэффициент сжатия файлов данных {#optimal-compression-ratio-of-data-files}

Этот запрос сравнивает коэффициент сжатия столбца `UserID` в двух таблицах, которые мы создали выше:

```sql
SELECT
    table AS Table,
    name AS Column,
    formatReadableSize(data_uncompressed_bytes) AS Uncompressed,
    formatReadableSize(data_compressed_bytes) AS Compressed,
    round(data_uncompressed_bytes / data_compressed_bytes, 0) AS Ratio
FROM system.columns
WHERE (table = 'hits_URL_UserID_IsRobot' OR table = 'hits_IsRobot_UserID_URL') AND (name = 'UserID')
ORDER BY Ratio ASC
````

Вот ответ:

```response
┌─Таблица─────────────────┬─Столбец┬─Несжатый─────┬─Сжатый─────┬─Коэффициент─┐
│ hits_URL_UserID_IsRobot │ UserID │ 33.83 MiB    │ 11.24 MiB  │     3 │
│ hits_IsRobot_UserID_URL │ UserID │ 33.83 MiB    │ 877.47 KiB │    39 │
└─────────────────────────┴────────┴──────────────┴────────────┴───────┘

2 строк в наборе. Прошло: 0.006 сек.
```

Мы видим, что коэффициент сжатия для столбца `UserID` значительно выше в таблице, где мы упорядочили ключевые столбцы `(IsRobot, UserID, URL)` по кардинальности по возрастанию.

Хотя в обеих таблицах хранятся ровно одни и те же данные (мы вставили одни и те же 8,87 миллиона строк в обе таблицы), порядок ключевых столбцов в составном первичном ключе существенно влияет на то, сколько дискового пространства занимают <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">сжатые</a> данные в [файлах данных столбцов](#data-is-stored-on-disk-ordered-by-primary-key-columns) таблицы:

* в таблице `hits_URL_UserID_IsRobot` с составным первичным ключом `(URL, UserID, IsRobot)`, где мы упорядочиваем ключевые столбцы по кардинальности по убыванию, файл данных `UserID.bin` занимает **11,24 MiB** дискового пространства;
* в таблице `hits_IsRobot_UserID_URL` с составным первичным ключом `(IsRobot, UserID, URL)`, где мы упорядочиваем ключевые столбцы по кардинальности по возрастанию, файл данных `UserID.bin` занимает всего **877,47 KiB** дискового пространства.

Хороший коэффициент сжатия данных столбца таблицы на диске не только экономит дисковое пространство, но и ускоряет запросы (особенно аналитические), которым требуется чтение данных из этого столбца, поскольку для перемещения данных столбца с диска в оперативную память (файловый кэш операционной системы) требуется меньше операций ввода-вывода.

Ниже мы покажем, почему для улучшения коэффициента сжатия столбцов таблицы выгодно упорядочивать столбцы первичного ключа по кардинальности по возрастанию.

На диаграмме ниже схематично показан порядок строк на диске для первичного ключа, в котором ключевые столбцы отсортированы по кардинальности по возрастанию:

<Image img={sparsePrimaryIndexes14a} size="md" alt="Разреженные первичные индексы 14a" background="white" />

Мы уже обсуждали, что [данные строк таблицы хранятся на диске в порядке столбцов первичного ключа](#data-is-stored-on-disk-ordered-by-primary-key-columns).


На диаграмме выше строки таблицы (их значения столбцов на диске) сначала упорядочены по значению `cl`, а строки с одинаковым значением `cl` упорядочены по значению `ch`. Поскольку первый столбец ключа `cl` имеет низкую кардинальность, вероятно, что существуют строки с одинаковым значением `cl`. По этой причине также вероятно, что значения `ch` упорядочены (локально — для строк с одинаковым значением `cl`).

Если в столбце похожие данные расположены близко друг к другу, например за счёт сортировки, то эти данные будут сжиматься лучше.
В общем случае алгоритм сжатия выигрывает от длины последовательностей данных (чем больше данных он видит, тем лучше сжатие)
и от локальности (чем более похожи данные, тем выше степень сжатия).

В отличие от диаграммы выше, диаграмма ниже иллюстрирует порядок строк на диске для первичного ключа, в котором столбцы ключа упорядочены по кардинальности по убыванию:

<Image img={sparsePrimaryIndexes14b} size="md" alt="Sparse Primary Indices 14b" background="white"/>

Теперь строки таблицы сначала упорядочены по значению `ch`, а строки с одинаковым значением `ch` упорядочены по значению `cl`.
Но поскольку первый столбец ключа `ch` имеет высокую кардинальность, маловероятно, что существуют строки с одинаковым значением `ch`. По этой причине также маловероятно, что значения `cl` упорядочены (локально — для строк с одинаковым значением `ch`).

Следовательно, значения `cl` с наибольшей вероятностью находятся в случайном порядке и, как следствие, имеют плохую локальность и, соответственно, низкую степень сжатия.

### Резюме {#summary-1}

Как для эффективной фильтрации по вторичным столбцам ключа в запросах, так и для улучшения степени сжатия столбцовых файлов данных таблицы выгодно упорядочивать столбцы в первичном ключе по их кардинальности по возрастанию.



## Эффективная идентификация отдельных строк {#identifying-single-rows-efficiently}

Хотя в общем случае это [не](/knowledgebase/key-value) является наилучшим сценарием использования ClickHouse,
иногда приложения, построенные поверх ClickHouse, требуют идентифицировать отдельные строки таблицы ClickHouse.

Интуитивным решением может быть использование столбца [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) с уникальным значением на строку и, для быстрого извлечения строк, использование этого столбца в качестве столбца первичного ключа.

Для максимально быстрого извлечения столбец UUID [должен быть первым столбцом ключа](#the-primary-index-is-used-for-selecting-granules).

Мы обсуждали, что поскольку [данные строк таблицы ClickHouse хранятся на диске в порядке сортировки по столбцу(ам) первичного ключа](#data-is-stored-on-disk-ordered-by-primary-key-columns), наличие столбца с очень высокой кардинальностью (например, столбца UUID) в первичном ключе или в составном первичном ключе перед столбцами с более низкой кардинальностью [ухудшает коэффициент сжатия других столбцов таблицы](#optimal-compression-ratio-of-data-files).

Компромиссом между самым быстрым извлечением и оптимальным сжатием данных является использование составного первичного ключа, где UUID является последним столбцом ключа, после столбцов с низкой (или более низкой) кардинальностью, которые используются для обеспечения хорошего коэффициента сжатия для некоторых столбцов таблицы.

### Конкретный пример {#a-concrete-example}

Один конкретный пример — сервис текстовых вставок в открытом виде [https://pastila.nl](https://pastila.nl), который разработал Alexey Milovidov и о котором он [написал в блоге](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/).

При каждом изменении текстовой области данные автоматически сохраняются в строку таблицы ClickHouse (одна строка на изменение).

И одним из способов идентификации и извлечения (конкретной версии) вставленного содержимого является использование хеша содержимого в качестве UUID для строки таблицы, содержащей это содержимое.

На следующей диаграмме показаны
- порядок вставки строк при изменении содержимого (например, из‑за нажатий клавиш при вводе текста в текстовую область) и
- порядок хранения на диске данных из вставленных строк, когда используется `PRIMARY KEY (hash)`:

<Image img={sparsePrimaryIndexes15a} size="md" alt="Разреженные первичные индексы 15a" background="white"/>

Поскольку столбец `hash` используется как столбец первичного ключа,
- отдельные строки могут быть извлечены [очень быстро](#the-primary-index-is-used-for-selecting-granules), но
- строки таблицы (их данные по столбцам) хранятся на диске в порядке возрастания (уникальных и случайных) значений хеша. Поэтому значения столбца с содержимым также хранятся в случайном порядке, без локальности данных, что приводит к **неоптимальному коэффициенту сжатия для файла данных столбца с содержимым**.

Чтобы значительно улучшить коэффициент сжатия для столбца с содержимым и при этом по‑прежнему быстро извлекать отдельные строки, pastila.nl использует два хеша (и составной первичный ключ) для идентификации конкретной строки:
- хеш содержимого, как обсуждалось выше, который различается для разных данных, и
- [локально-чувствительный хеш (отпечаток, fingerprint)](https://en.wikipedia.org/wiki/Locality-sensitive_hashing), который **не** изменяется при небольших изменениях данных.

На следующей диаграмме показаны
- порядок вставки строк при изменении содержимого (например, из‑за нажатий клавиш при вводе текста в текстовую область) и
- порядок хранения на диске данных из вставленных строк, когда используется составной `PRIMARY KEY (fingerprint, hash)`:

<Image img={sparsePrimaryIndexes15b} size="md" alt="Разреженные первичные индексы 15b" background="white"/>

Теперь строки на диске сначала упорядочены по `fingerprint`, а для строк с одинаковым значением fingerprint их значение `hash` определяет окончательный порядок.

Поскольку данные, отличающиеся только небольшими изменениями, получают одно и то же значение fingerprint, похожие данные теперь хранятся на диске близко друг к другу в столбце с содержимым. И это очень хорошо для коэффициента сжатия столбца с содержимым, так как алгоритм сжатия в целом выигрывает от локальности данных (чем более похожи данные, тем лучше коэффициент сжатия).

Компромисс состоит в том, что для извлечения конкретной строки требуются два поля (`fingerprint` и `hash`), чтобы оптимально использовать первичный индекс, получающийся из составного `PRIMARY KEY (fingerprint, hash)`.
