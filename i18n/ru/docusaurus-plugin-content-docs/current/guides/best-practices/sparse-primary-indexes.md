---
sidebar_label: 'Первичные индексы'
sidebar_position: 1
description: 'В этом руководстве мы подробно рассмотрим индексацию в ClickHouse.'
title: 'Практическое введение в первичные индексы ClickHouse'
slug: /guides/best-practices/sparse-primary-indexes
show_related_blogs: true
doc_type: 'guide'
keywords: ['первичный индекс', 'индексирование', 'производительность', 'оптимизация запросов', 'лучшие практики']
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


# Практическое руководство по первичным индексам в ClickHouse {#a-practical-introduction-to-primary-indexes-in-clickhouse}

## Введение {#introduction}

В этом руководстве мы подробно рассмотрим индексацию в ClickHouse. Мы продемонстрируем и детально обсудим:

- [чем индексация в ClickHouse отличается от традиционных систем управления реляционными базами данных](#an-index-design-for-massive-data-scales)
- [как ClickHouse строит и использует разреженный первичный индекс таблицы](#a-table-with-a-primary-key)
- [каковы лучшие практики индексации в ClickHouse](#using-multiple-primary-indexes)

При желании вы можете самостоятельно выполнить все SQL-команды и запросы ClickHouse, приведённые в этом руководстве, на своём компьютере.
Инструкции по установке ClickHouse и началу работы см. в разделе [Quick Start](/get-started/quick-start).

:::note
Это руководство сосредоточено на разреженных первичных индексах ClickHouse.

Руководство по [вторичным индексам пропуска данных в ClickHouse](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes) см. в разделе [Tutorial](/guides/best-practices/skipping-indexes.md).
:::

### Набор данных {#data-set}

На протяжении всего этого руководства мы будем использовать пример анонимизированных данных о веб‑трафике.

- Мы будем использовать подмножество из 8,87 миллиона строк (событий) из этого примерного набора данных.
- Несжатый объём данных составляет 8,87 миллиона событий и около 700 МБ. При хранении в ClickHouse данные сжимаются до 200 МБ.
- В нашем подмножестве каждая строка содержит три столбца, которые описывают интернет‑пользователя (столбец `UserID`), кликнувшего по URL (столбец `URL`) в определённый момент времени (столбец `EventTime`).

С этими тремя столбцами мы уже можем сформулировать некоторые типичные запросы веб‑аналитики, такие как:

- «Каковы топ‑10 наиболее часто кликаемых URL для конкретного пользователя?»
- «Каковы топ‑10 пользователей, которые чаще всего кликали по конкретному URL?»
- «В какое время (например, в какие дни недели) пользователь чаще всего кликает по конкретному URL?»

### Тестовая машина {#test-machine}

Все приведённые в этом документе показатели времени выполнения получены при локальном запуске ClickHouse 22.2.1 на MacBook Pro с чипом Apple M1 Pro и 16 ГБ оперативной памяти.

### Полное сканирование таблицы {#a-full-table-scan}

Чтобы увидеть, как выполняется запрос над нашим набором данных без первичного ключа, мы создадим таблицу (с движком таблицы MergeTree), выполнив следующий DDL-оператор SQL:

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

Далее вставьте подмножество набора данных hits в таблицу с помощью следующего оператора INSERT в SQL.
Здесь используется [табличная функция URL](/sql-reference/table-functions/url.md), чтобы загрузить подмножество полного набора данных, удалённо размещённого на clickhouse.com:


```sql
INSERT INTO hits_NoPrimaryKey SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```

Результат:

```response
Ok.

0 rows in set. Elapsed: 145.993 sec. Processed 8.87 million rows, 18.40 GB (60.78 thousand rows/s., 126.06 MB/s.)
```

Вывод клиента ClickHouse показывает, что приведённая выше команда вставила в таблицу 8,87 миллиона строк.

Наконец, чтобы упростить дальнейшее обсуждение в этом руководстве и сделать диаграммы и результаты воспроизводимыми, мы [оптимизируем](/sql-reference/statements/optimize.md) таблицу с помощью ключевого слова FINAL:


```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
В целом не требуется и не рекомендуется немедленно оптимизировать таблицу
после загрузки данных в неё. Почему это необходимо в данном примере, станет понятно далее.
:::

Теперь выполним наш первый запрос веб-аналитики. Следующий запрос вычисляет топ‑10 наиболее кликаемых URL‑адресов для интернет‑пользователя с UserID 749927693:

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

10 rows in set. Elapsed: 0.022 sec.
# highlight-next-line
Processed 8.87 million rows,
70.45 MB (398.53 million rows/s., 3.17 GB/s.)
```

Вывод результатов клиента ClickHouse показывает, что ClickHouse выполнил полное сканирование таблицы! Каждая из 8,87 миллиона строк нашей таблицы была передана в ClickHouse. Такой подход не масштабируется.

Чтобы сделать это (намного) более эффективным и (гораздо) более быстрым, нам нужно использовать таблицу с подходящим первичным ключом. Это позволит ClickHouse автоматически (на основе столбцов первичного ключа) создать разреженный первичный индекс, который затем можно использовать для значительного ускорения выполнения нашего примерного запроса.


## Проектирование индексов ClickHouse {#clickhouse-index-design}

### Проектирование индексов для колоссальных объёмов данных {#an-index-design-for-massive-data-scales}

В традиционных системах управления реляционными базами данных первичный индекс содержит одну запись на каждую строку таблицы. В нашем наборе данных это привело бы к 8,87 миллионам записей в первичном индексе. Такой индекс позволяет быстро находить конкретные строки, обеспечивая высокую эффективность запросов на поиск и точечных обновлений. Поиск записи в структуре данных `B(+)-Tree` имеет среднюю временную сложность `O(log n)`; точнее, `log_b n = log_2 n / log_2 b`, где `b` — коэффициент ветвления `B(+)-Tree`, а `n` — количество индексированных строк. Поскольку `b` обычно находится в диапазоне от нескольких сотен до нескольких тысяч, `B(+)-Trees` являются очень неглубокими структурами, и для поиска записей требуется небольшое количество обращений к диску. При 8,87 миллионах строк и коэффициенте ветвления 1000 в среднем требуется 2,3 обращения к диску. За это приходится платить: дополнительными накладными расходами на диск и память, более высокой стоимостью вставки при добавлении новых строк в таблицу и записей в индекс, а также иногда необходимостью перебалансировки B-Tree.

Учитывая сложности, связанные с индексами на основе B-Tree, движки таблиц в ClickHouse используют иной подход. Семейство движков [MergeTree Engine Family](/engines/table-engines/mergetree-family/index.md) в ClickHouse спроектировано и оптимизировано для работы с колоссальными объёмами данных. Эти таблицы рассчитаны на приём миллионов вставок строк в секунду и хранение очень больших объёмов данных (сотни PB). Данные быстро записываются в таблицу [часть за частью](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage), при этом в фоновом режиме применяются правила слияния частей. В ClickHouse у каждой части есть собственный первичный индекс. Когда части сливаются, первичные индексы этих частей также объединяются. На очень больших масштабах, под которые спроектирован ClickHouse, критически важно эффективно использовать диск и память. Поэтому вместо индексирования каждой строки первичный индекс для части содержит одну индексную запись (известную как «метка») на группу строк (называемую «гранула») — такая техника называется **разрежённым индексом**.

Использование разрежённого индекса возможно, потому что ClickHouse хранит строки части на диске, отсортированными по столбцам первичного ключа. Вместо прямого поиска единичных строк (как в индексе на основе B-Tree) разрежённый первичный индекс позволяет быстро (посредством двоичного поиска по индексным записям) идентифицировать группы строк, которые потенциально могут соответствовать запросу. Найденные группы потенциально подходящих строк (гранулы) затем параллельно передаются в движок ClickHouse для поиска точных совпадений. Такая схема индекса позволяет сделать первичный индекс небольшим (он может и должен полностью помещаться в оперативную память), при этом существенно ускоряя выполнение запросов, особенно диапазонных запросов, которые типичны для аналитических сценариев работы с данными.

Ниже подробно показано, как ClickHouse строит и использует свой разрежённый первичный индекс. Позже в статье мы рассмотрим лучшие практики выбора, удаления и упорядочения столбцов таблицы, которые используются для построения индекса (столбцы первичного ключа).

### Таблица с первичным ключом {#a-table-with-a-primary-key}

Создайте таблицу с составным первичным ключом, в который входят столбцы UserID и URL:

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
SETTINGS index_granularity_bytes = 0, compress_primary_key = 0;
```

[//]: # "<details open>"

<details>
  <summary>
    Подробности оператора DDL
  </summary>

  <p>
    Чтобы упростить дальнейшее изложение в этом руководстве, а также сделать диаграммы и результаты воспроизводимыми, оператор DDL:

    <ul>
      <li>
        задаёт составной ключ сортировки для таблицы с помощью предложения <code>ORDER BY</code>.
      </li>

      <li>
        явно управляет количеством записей в первичном индексе через настройки:

        <ul>
          <li>
            <code>index&#95;granularity</code>: явно установлен в значение по умолчанию 8192. Это означает, что для каждой группы из 8192 строк первичный индекс будет иметь одну запись. Например, если таблица содержит 16384 строки, индекс будет иметь две записи.
          </li>

          <li>
            <code>index&#95;granularity&#95;bytes</code>: установлен в 0, чтобы отключить <a href="https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1" target="_blank">адаптивную гранулярность индекса</a>. Адаптивная гранулярность индекса означает, что ClickHouse автоматически создаёт одну запись индекса для группы из n строк, если выполняется одно из следующих условий:

            <ul>
              <li>
                если <code>n</code> меньше 8192 и совокупный объём данных для этих <code>n</code> строк больше либо равен 10 МБ (значение по умолчанию для <code>index&#95;granularity&#95;bytes</code>);
              </li>

              <li>
                если совокупный объём данных для <code>n</code> строк меньше 10 МБ, но <code>n</code> равно 8192.
              </li>
            </ul>
          </li>

          <li>
            <code>compress&#95;primary&#95;key</code>: установлен в 0 для отключения <a href="https://github.com/ClickHouse/ClickHouse/issues/34437" target="_blank">сжатия первичного индекса</a>. Это позволит нам при необходимости позже изучить его содержимое.
          </li>
        </ul>
      </li>
    </ul>
  </p>
</details>

Первичный ключ в приведённом выше операторе DDL приводит к созданию первичного индекса на основе двух указанных ключевых столбцов.

<br />

Далее вставьте данные:


```sql
INSERT INTO hits_UserID_URL SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```

Ответ выглядит следующим образом:

```response
0 rows in set. Elapsed: 149.432 sec. Processed 8.87 million rows, 18.40 GB (59.38 thousand rows/s., 123.16 MB/s.)
```

<br />

А затем оптимизируем таблицу:

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

Результат:

```response
part_type:                   Wide
path:                        ./store/d9f/d9f36a1a-d2e6-46d4-8fb5-ffe9ad0d5aed/all_1_9_2/
rows:                        8.87 million
data_uncompressed_bytes:     733.28 MiB
data_compressed_bytes:       206.94 MiB
primary_key_bytes_in_memory: 96.93 KiB
marks:                       1083
bytes_on_disk:               207.07 MiB

1 rows in set. Elapsed: 0.003 sec.
```

Вывод клиента ClickHouse показывает:

* Данные таблицы хранятся в [wide format](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) в отдельном каталоге на диске, то есть внутри этого каталога будет по одному файлу данных (и одному файлу меток) на каждый столбец таблицы.
* Таблица содержит 8.87 миллиона строк.
* Несжатый объём данных по всем строкам составляет 733.28 МБ.
* Сжатый на диске объём данных по всем строкам составляет 206.94 МБ.
* У таблицы есть первичный индекс с 1083 записями (называемыми «marks»), размер индекса — 96.93 КБ.
* В сумме данные таблицы, файлы меток и файл первичного индекса занимают на диске 207.07 МБ.


### Данные хранятся на диске в порядке столбцов первичного ключа {#data-is-stored-on-disk-ordered-by-primary-key-columns}

Наша таблица, которую мы создали выше, имеет

- составной [первичный ключ](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)` и
- составной [ключ сортировки](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)`.

:::note

- Если бы мы указали только ключ сортировки, первичный ключ был бы неявно определён как равный ключу сортировки.

- Для эффективного использования памяти мы явно задали первичный ключ, который содержит только те столбцы, по которым наши запросы фильтруют данные. Первичный индекс, основанный на первичном ключе, полностью загружается в оперативную память.

- Для обеспечения согласованности диаграмм в этом руководстве и для максимизации коэффициента сжатия мы определили отдельный ключ сортировки, который включает все столбцы нашей таблицы (если в столбце похожие данные располагаются близко друг к другу, например путём сортировки, то эти данные будут сжиматься лучше).

- Первичный ключ должен быть префиксом ключа сортировки, если оба они заданы.
:::

Вставленные строки хранятся на диске в лексикографическом порядке (по возрастанию) по столбцам первичного ключа (и дополнительному столбцу `EventTime` из ключа сортировки).

:::note
ClickHouse позволяет вставлять несколько строк с идентичными значениями столбцов первичного ключа. В этом случае (см. строки 1 и 2 на диаграмме ниже) окончательный порядок определяется указанным ключом сортировки и, следовательно, значением столбца `EventTime`.
:::

ClickHouse — это <a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms
" target="_blank">столбцовая система управления базами данных</a>. Как показано на диаграмме ниже,

- для представления на диске существует один файл данных (*.bin) для каждого столбца таблицы, где все значения для этого столбца хранятся в <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">сжатом</a> формате, и
- 8,87 миллиона строк хранятся на диске в лексикографическом порядке по возрастанию по столбцам первичного ключа (и дополнительным столбцам ключа сортировки), то есть в данном случае
  - сначала по `UserID`,
  - затем по `URL`,
  - и, наконец, по `EventTime`:

<Image img={sparsePrimaryIndexes01} size="md" alt="Разреженные первичные индексы 01" background="white"/>

`UserID.bin`, `URL.bin` и `EventTime.bin` — это файлы данных на диске, в которых хранятся значения столбцов `UserID`, `URL` и `EventTime`.

:::note

- Так как первичный ключ определяет лексикографический порядок строк на диске, таблица может иметь только один первичный ключ.

- Мы нумеруем строки, начиная с 0, чтобы соответствовать внутренней схеме нумерации строк в ClickHouse, которая также используется для сообщений журналирования.
:::

### Данные организованы в гранулы для параллельной обработки данных {#data-is-organized-into-granules-for-parallel-data-processing}

Для целей обработки данные значения столбцов таблицы логически разделяются на гранулы.
Гранула — это наименьший неделимый объём данных, который потоково передаётся в ClickHouse для обработки.
Это означает, что вместо чтения отдельных строк ClickHouse всегда читает (в потоковом режиме и параллельно) целую группу (гранулу) строк.
:::note
Значения столбцов физически не хранятся внутри гранул: гранулы — это лишь логическая организация значений столбцов для обработки запросов.
:::

На следующей диаграмме показано, как (значения столбцов) 8,87 миллиона строк нашей таблицы
организованы в 1083 гранулы, поскольку в DDL-операторе создания таблицы указана настройка `index_granularity` (установленная в её значение по умолчанию, равное 8192).

<Image img={sparsePrimaryIndexes02} size="md" alt="Sparse Primary Indices 02" background="white"/>

Первые 8192 строки (их значения столбцов), в соответствии с физическим порядком на диске, логически относятся к грануле 0, следующие 8192 строки (их значения столбцов) относятся к грануле 1 и так далее.

:::note

- Последняя гранула (гранула 1082) «содержит» меньше 8192 строк.

- В начале этого руководства, в разделе «DDL Statement Details», мы упомянули, что отключили [adaptive index granularity](/whats-new/changelog/2019.md/#experimental-features-1) (для упрощения изложения в этом руководстве, а также для того, чтобы диаграммы и результаты были воспроизводимыми).

  Поэтому все гранулы (кроме последней) в нашей таблице-примере имеют одинаковый размер.

- Для таблиц с adaptive index granularity (размер гранулы индекса адаптивный по [умолчанию](/operations/settings/merge-tree-settings#index_granularity_bytes)) размер некоторых гранул может быть меньше 8192 строк в зависимости от размеров данных строк.

- Мы выделили некоторые значения столбцов из наших столбцов первичного ключа (`UserID`, `URL`) оранжевым цветом.
  Эти отмеченные оранжевым значения столбцов являются значениями столбцов первичного ключа для первой строки каждой гранулы.
  Как мы увидим ниже, эти отмеченные оранжевым значения столбцов будут записями в первичном индексе таблицы.

- Мы нумеруем гранулы, начиная с 0, чтобы соответствовать внутренней схеме нумерации ClickHouse, которая также используется для сообщений журналирования.
:::

### У первичного индекса одна запись на каждую гранулу {#the-primary-index-has-one-entry-per-granule}

Первичный индекс создаётся на основе гранул, показанных на диаграмме выше. Этот индекс представляет собой несжатый плоский массив в виде файла (primary.idx), содержащий так называемые числовые метки индекса, начинающиеся с 0.

Диаграмма ниже показывает, что индекс хранит значения столбцов первичного ключа (значения, отмеченные оранжевым на диаграмме выше) для первой строки каждой гранулы.
Иными словами: первичный индекс хранит значения столбцов первичного ключа из каждой 8192-й строки таблицы (на основе физического порядка следования строк, определённого столбцами первичного ключа).
Например:

- первая запись индекса («метка 0» на диаграмме ниже) хранит значения столбцов первичного ключа первой строки гранулы 0 с диаграммы выше,
- вторая запись индекса («метка 1» на диаграмме ниже) хранит значения столбцов первичного ключа первой строки гранулы 1 с диаграммы выше и так далее.

<Image img={sparsePrimaryIndexes03a} size="lg" alt="Sparse Primary Indices 03a" background="white"/>

Всего индекс содержит 1083 записи для нашей таблицы с 8,87 миллионами строк и 1083 гранулами:

<Image img={sparsePrimaryIndexes03b} size="md" alt="Sparse Primary Indices 03b" background="white"/>

:::note

- Для таблиц с [адаптивной гранулярностью индекса](/whats-new/changelog/2019.md/#experimental-features-1) в первичном индексе дополнительно хранится одна «финальная» метка, которая содержит значения столбцов первичного ключа последней строки таблицы, но так как мы отключили адаптивную гранулярность индекса (чтобы упростить обсуждение в этом руководстве, а также сделать диаграммы и результаты воспроизводимыми), индекс нашей примерной таблицы не включает эту финальную метку.

- Файл первичного индекса полностью загружается в оперативную память. Если файл больше, чем доступный объём свободной памяти, ClickHouse выдаст ошибку.
:::

<details>
    <summary>
    Анализ содержимого первичного индекса
    </summary>
    <p>

В самоуправляемом кластере ClickHouse мы можем использовать <a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">табличную функцию file</a>, чтобы проанализировать содержимое первичного индекса нашей примерной таблицы.

Для этого сначала нужно скопировать файл первичного индекса в <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a> одного из узлов работающего кластера:
<ul>
<li>Шаг 1: Получить путь к части, которая содержит файл первичного индекса</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

на тестовой машине возвращает `/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4`.

<li>Шаг 2: Получить user_files_path</li>
<a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">Значение user_files_path по умолчанию</a> в Linux:
`/var/lib/clickhouse/user_files/`

В Linux можно проверить, изменился ли путь: `$ grep user_files_path /etc/clickhouse-server/config.xml`

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

<li>Получить первые две индексные метки</li>
`
SELECT UserID, URL<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 0, 2;
`

возвращает

`
240923, http://showtopics.html%3...<br/>
4073710, http://mk.ru&pos=3_0
`

<li>Получить последнюю индексную метку</li>
`
SELECT UserID, URL FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 1082, 1;
`
возвращает
`
4292714039 │ http://sosyal-mansetleri...
`
</ul>
<br/>
Это в точности совпадает с нашей диаграммой содержимого первичного индекса для примерной таблицы:

</p>
</details>

Записи первичного ключа называются индексными метками, потому что каждая запись индекса помечает начало определённого диапазона данных. В частности, для примерной таблицы:

- Индексные метки по UserID:

  Сохраняемые в первичном индексе значения `UserID` отсортированы по возрастанию.<br/>
  «метка 1» на диаграмме выше, таким образом, указывает, что значения `UserID` всех строк таблицы в грануле 1 и во всех последующих гранулах гарантированно больше либо равны 4 073 710.

[Как мы увидим позже](#the-primary-index-is-used-for-selecting-granules), такой глобальный порядок позволяет ClickHouse <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">использовать алгоритм двоичного поиска</a> по индексным меткам для первого столбца ключа, когда запрос фильтрует по первому столбцу первичного ключа.

- Метки индекса для URL:

  Похожая кардинальность столбцов первичного ключа `UserID` и `URL`
  означает, что метки индекса для всех столбцов ключа, начиная со второго, в общем случае лишь указывают диапазон данных, пока значение предыдущего столбца ключа остаётся одинаковым для всех строк таблицы как минимум в пределах текущего гранула.<br/>
 Например, поскольку значения UserID у метки 0 и метки 1 на диаграмме выше различаются, ClickHouse не может предположить, что все значения URL всех строк таблицы в грануле 0 больше либо равны `'http://showtopics.html%3...'`. Однако если бы значения UserID у метки 0 и метки 1 на диаграмме выше были одинаковыми (то есть значение UserID оставалось бы одинаковым для всех строк таблицы в пределах гранула 0), ClickHouse мог бы предположить, что все значения URL всех строк таблицы в грануле 0 больше либо равны `'http://showtopics.html%3...'`.

  Мы более подробно обсудим последствия этого для производительности выполнения запросов далее.

### Первичный индекс используется для отбора гранул {#the-primary-index-is-used-for-selecting-granules}

Теперь мы можем выполнять запросы с использованием первичного индекса.

Следующий запрос определяет 10 URL-адресов, по которым чаще всего кликали, для UserID 749927693.

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

10 rows in set. Elapsed: 0.005 sec.
# highlight-next-line
Processed 8.19 thousand rows,
740.18 KB (1.53 million rows/s., 138.59 MB/s.)
```

Вывод клиента ClickHouse теперь показывает, что вместо полного сканирования таблицы в ClickHouse было передано всего 8,19 тыс. строк.

Если включено <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">трассировочное логирование</a>, то в журнале сервера ClickHouse видно, что ClickHouse выполнял <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">двоичный поиск</a> по 1083 меткам индекса UserID, чтобы определить гранулы, которые потенциально могут содержать строки со значением в столбце UserID `749927693`. Это потребовало 19 шагов при средней асимптотической временной сложности `O(log2 n)`:

```response
...Executor): Key condition: (column 0 in [749927693, 749927693])
# highlight-next-line
...Executor): Running binary search on index range for part all_1_9_2 (1083 marks)
...Executor): Found (LEFT) boundary mark: 176
...Executor): Found (RIGHT) boundary mark: 177
...Executor): Found continuous range in 19 steps
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,
# highlight-next-line
              1/1083 marks by primary key, 1 marks to read from 1 ranges
...Reading ...approx. 8192 rows starting from 1441792
```

Мы видим в приведённом выше trace-логе, что только одна метка из 1083 существующих меток удовлетворила запрос.

<details>
  <summary>
    Подробности trace-лога
  </summary>

  <p>
    Была найдена метка 176 (метка «found left boundary mark» включительна, а метка «found right boundary mark» исключительно), и, следовательно, все 8192 строки из гранулы 176 (которая начинается со строки 1.441.792 — мы вернёмся к этому далее в руководстве) затем передаются в ClickHouse для поиска конкретных строк со значением в столбце UserID `749927693`.
  </p>
</details>

Мы также можем воспроизвести это, используя в нашем примерном запросе <a href="https://clickhouse.com/docs/sql-reference/statements/explain/" target="_blank">оператор EXPLAIN</a>:

```sql
EXPLAIN indexes = 1
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

Ответ будет выглядеть так:


```response
┌─explain───────────────────────────────────────────────────────────────────────────────┐
│ Expression (Projection)                                                               │
│   Limit (preliminary LIMIT (without OFFSET))                                          │
│     Sorting (Sorting for ORDER BY)                                                    │
│       Expression (Before ORDER BY)                                                    │
│         Aggregating                                                                   │
│           Expression (Before GROUP BY)                                                │
│             Filter (WHERE)                                                            │
│               SettingQuotaAndLimits (Set limits and quota after reading from storage) │
│                 ReadFromMergeTree                                                     │
│                 Indexes:                                                              │
│                   PrimaryKey                                                          │
│                     Keys:                                                             │
│                       UserID                                                          │
│                     Condition: (UserID in [749927693, 749927693])                     │
│                     Parts: 1/1                                                        │
# highlight-next-line
│                     Granules: 1/1083                                                  │
└───────────────────────────────────────────────────────────────────────────────────────┘

16 rows in set. Elapsed: 0.003 sec.
```

Вывод клиента показывает, что одна из 1083 гранул была выбрана как потенциально содержащая строки со значением столбца UserID, равным 749927693.

:::note Conclusion
Когда запрос выполняет фильтрацию по столбцу, который является частью составного ключа и первым столбцом ключа, ClickHouse выполняет алгоритм двоичного поиска по индексным меткам этого столбца ключа.
:::

<br />

Как было показано выше, ClickHouse использует свой разреженный первичный индекс для быстрого (с помощью двоичного поиска) выбора гранул, которые потенциально могут содержать строки, соответствующие запросу.

Это **первая стадия (выбор гранул)** выполнения запроса в ClickHouse.

На **второй стадии (чтение данных)** ClickHouse определяет местоположение выбранных гранул, чтобы передать все их строки в движок ClickHouse и найти строки, которые фактически соответствуют запросу.

Эта вторая стадия подробно рассматривается в следующем разделе.


### Файлы меток используются для определения расположения гранул {#mark-files-are-used-for-locating-granules}

На следующей диаграмме показана часть файла первичного индекса для нашей таблицы.

<Image img={sparsePrimaryIndexes04} size="md" alt="Разреженные первичные индексы 04" background="white"/>

Как обсуждалось выше, с помощью двоичного поиска по 1083 меткам UserID в индексе была найдена метка 176. Соответствующая ей гранула 176 поэтому потенциально может содержать строки со значением столбца UserID, равным 749.927.693.

<details>
    <summary>
    Подробности выбора гранулы
    </summary>
    <p>

Диаграмма выше показывает, что метка 176 — это первая запись индекса, для которой одновременно выполняются два условия: минимальное значение UserID в связанной с ней грануле 176 меньше 749.927.693, и минимальное значение UserID гранулы 177 для следующей метки (метка 177) больше этого значения. Поэтому только соответствующая гранула 176 для метки 176 может потенциально содержать строки со значением столбца UserID, равным 749.927.693.
</p>
</details>

Чтобы подтвердить (или опровергнуть), что одна или несколько строк в грануле 176 содержат значение столбца UserID, равное 749.927.693, все 8192 строки, принадлежащие этой грануле, должны быть потоково переданы в ClickHouse.

Для этого ClickHouse необходимо знать физическое расположение гранулы 176.

В ClickHouse физические расположения всех гранул для нашей таблицы хранятся в файлах меток (mark files). Аналогично файлам данных, существует по одному файлу меток на каждый столбец таблицы.

Следующая диаграмма показывает три файла меток `UserID.mrk`, `URL.mrk` и `EventTime.mrk`, которые хранят физические расположения гранул для столбцов таблицы `UserID`, `URL` и `EventTime`.

<Image img={sparsePrimaryIndexes05} size="md" alt="Разреженные первичные индексы 05" background="white"/>

Мы обсудили, что первичный индекс — это файл — плоский несжатый массив (primary.idx), содержащий метки индекса, которые нумеруются, начиная с 0.

Аналогично, файл меток (*.mrk) — это также файл — плоский несжатый массив, содержащий метки, которые нумеруются, начиная с 0.

Как только ClickHouse идентифицировал и выбрал метку индекса для гранулы, которая потенциально может содержать строки, соответствующие запросу, в файлах меток может быть выполнен позиционный поиск по массиву для получения физического расположения этой гранулы.

Каждая запись файла меток для конкретного столбца хранит два расположения в виде смещений:

- Первое смещение (`block_offset` на диаграмме выше) указывает расположение <a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">блока</a> в <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">сжатом</a> файле данных столбца, который содержит сжатую версию выбранной гранулы. Этот сжатый блок потенциально содержит несколько сжатых гранул. Найденный сжатый блок файла при чтении разжимается в основную память.

- Второе смещение (`granule_offset` на диаграмме выше) из файла меток предоставляет расположение гранулы внутри несжатого блока данных.

Затем все 8192 строки, принадлежащие найденной несжатой грануле, потоково передаются в ClickHouse для дальнейшей обработки.

:::note

- Для таблиц с [широким форматом](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) и без [адаптивной гранулярности индекса](/whats-new/changelog/2019.md/#experimental-features-1) ClickHouse использует файлы меток `.mrk`, как показано выше; они содержат записи с двумя 8‑байтовыми адресами на запись. Эти записи являются физическими расположениями гранул, которые все имеют одинаковый размер.

Гранулярность индекса по умолчанию [адаптивная](/operations/settings/merge-tree-settings#index_granularity_bytes), но для нашей примерной таблицы мы отключили адаптивную гранулярность индекса (чтобы упростить обсуждения в этом руководстве, а также сделать диаграммы и результаты воспроизводимыми). Наша таблица использует широкий формат, потому что размер данных больше, чем [min_bytes_for_wide_part](/operations/settings/merge-tree-settings#min_bytes_for_wide_part) (по умолчанию 10 МБ для самоуправляемых кластеров).

- Для таблиц с широким форматом и с адаптивной гранулярностью индекса ClickHouse использует файлы меток `.mrk2`, которые содержат записи, аналогичные файлам меток `.mrk`, но с дополнительным третьим значением на запись: количеством строк гранулы, с которой связана текущая запись.

- Для таблиц с [компактным форматом](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) ClickHouse использует файлы меток `.mrk3`.

:::

:::note Почему файлы меток

Почему первичный индекс не содержит напрямую физические расположения гранул, соответствующих меткам индекса?

Потому что в тех очень больших масштабах данных, для которых спроектирован ClickHouse, крайне важно эффективно использовать диск и память.

Файл первичного индекса должен целиком помещаться в оперативную память.

В нашем примерном запросе ClickHouse использовал первичный индекс и выбрал одну гранулу, которая потенциально может содержать строки, соответствующие нашему запросу. Только для этой одной гранулы ClickHouse затем нужны физические расположения, чтобы потоково прочитать соответствующие строки для дальнейшей обработки.

Кроме того, информация о смещениях нужна только для столбцов UserID и URL.

Информация о смещениях не нужна для столбцов, которые не используются в запросе, например для `EventTime`.

Для нашего примерного запроса ClickHouse нужны только два смещения физических расположений для гранулы 176 в файле данных UserID (UserID.bin) и два смещения физических расположений для гранулы 176 в файле данных URL (URL.bin).

Уровень косвенности, обеспечиваемый файлами меток, позволяет избежать хранения непосредственно в первичном индексе записей о физических расположениях всех 1083 гранул для всех трёх столбцов, тем самым избегая наличия в оперативной памяти ненужных (потенциально неиспользуемых) данных.
:::

Следующая диаграмма и текст ниже иллюстрируют, как для нашего примерного запроса ClickHouse находит гранулу 176 в файле данных UserID.bin.

<Image img={sparsePrimaryIndexes06} size="md" alt="Sparse Primary Indices 06" background="white"/>

Ранее в этом руководстве мы обсуждали, что ClickHouse выбрал метку первичного индекса 176 и, следовательно, гранулу 176 как потенциально содержащую строки, соответствующие нашему запросу.

Теперь ClickHouse использует выбранный номер метки (176) из индекса для позиционного обращения к массиву в файле меток UserID.mrk, чтобы получить два смещения для нахождения гранулы 176.

Как показано, первое смещение указывает на блок сжатых данных внутри файла данных UserID.bin, который, в свою очередь, содержит сжатую версию гранулы 176.

После того как найденный блок данных распакован в оперативную память, второе смещение из файла меток может быть использовано для нахождения гранулы 176 внутри распакованных данных.

ClickHouse должен найти (и потоково прочитать все значения) гранулы 176 как из файла данных UserID.bin, так и из файла данных URL.bin, чтобы выполнить наш примерный запрос (топ-10 наиболее кликаемых URL-адресов для интернет-пользователя с UserID 749.927.693).

Диаграмма выше показывает, как ClickHouse находит гранулу для файла данных UserID.bin.

Параллельно ClickHouse делает то же самое для гранулы 176 в файле данных URL.bin. Две соответствующие гранулы выравниваются и потоково передаются в движок ClickHouse для дальнейшей обработки, то есть агрегации и подсчёта значений URL по группам для всех строк, где UserID равен 749.927.693, прежде чем, в конце, вывести 10 крупнейших по счёту групп URL в порядке убывания.

## Использование нескольких первичных индексов {#using-multiple-primary-indexes}

<a name="filtering-on-key-columns-after-the-first"></a>

### Столбцы вторичных ключей могут быть (не)эффективными {#secondary-key-columns-can-not-be-inefficient}

Когда запрос фильтрует по столбцу, который является частью составного ключа и является первым столбцом ключа, [ClickHouse выполняет алгоритм двоичного поиска по меткам индекса этого столбца ключа](#the-primary-index-is-used-for-selecting-granules).

Но что происходит, когда запрос фильтрует по столбцу, который является частью составного ключа, но не является первым столбцом ключа?

:::note
Мы рассматриваем сценарий, когда запрос явно не фильтрует по первому столбцу ключа, а по одному из последующих столбцов ключа.

Когда запрос фильтрует как по первому столбцу ключа, так и по любым последующим столбцам ключа, ClickHouse выполняет двоичный поиск по меткам индекса первого столбца ключа.
:::

<br />

<br />

<a name="query-on-url" />

Мы используем запрос, который вычисляет 10 пользователей, которые чаще всего переходили по URL &quot;[http://public&#95;search](http://public\&#95;search)&quot;:

```sql
SELECT UserID, count(UserID) AS Count
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

Ответ выглядит так:

<a name="query-on-url-slow" />

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

10 rows in set. Elapsed: 0.086 sec.
# highlight-next-line
Processed 8.81 million rows,
799.69 MB (102.11 million rows/s., 9.27 GB/s.)
```

Вывод клиента показывает, что ClickHouse почти полностью просканировал таблицу, несмотря на то, что [столбец URL является частью составного первичного ключа](#a-table-with-a-primary-key)! ClickHouse прочитал 8,81 миллиона строк из 8,87 миллиона строк таблицы.

Если [trace&#95;logging](/operations/server-configuration-parameters/settings#logger) включен, то в журнале сервера ClickHouse будет видно, что ClickHouse использовал <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">обобщённый алгоритм поиска по исключению (generic exclusion search)</a> по 1083 меткам индекса URL, чтобы определить те гранулы, которые потенциально могут содержать строки со значением столбца URL &quot;[http://public&#95;search](http://public\&#95;search)&quot;:

```response
...Executor): Key condition: (column 1 in ['http://public_search',
                                           'http://public_search'])
# highlight-next-line
...Executor): Used generic exclusion search over index for part all_1_9_2
              with 1537 steps
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,
# highlight-next-line
              1076/1083 marks by primary key, 1076 marks to read from 5 ranges
...Executor): Reading approx. 8814592 rows with 10 streams
```

Мы можем увидеть на примере трассировочного лога выше, что 1076 гранул (по меткам) из 1083 были выбраны как потенциально содержащие строки с совпадающим значением URL.

В результате в движок ClickHouse было отправлено на потоковую обработку 8,81 млн строк (параллельно с использованием 10 потоков), чтобы определить строки, которые действительно содержат значение URL &quot;[http://public&#95;search](http://public\&#95;search)&quot;.

Однако, как мы увидим позже, только 39 гранул из выбранных 1076 гранул на самом деле содержат совпадающие строки.

Хотя первичный индекс на основе составного первичного ключа (UserID, URL) был очень полезен для ускорения запросов, фильтрующих строки по конкретному значению UserID, этот индекс не даёт существенного выигрыша в скорости для запроса, который фильтрует строки по конкретному значению URL.

Причина в том, что столбец URL не является первым ключевым столбцом, и поэтому ClickHouse использует обобщённый алгоритм исключающего поиска (вместо двоичного поиска) по индексным меткам столбца URL, и **эффективность этого алгоритма зависит от различия в кардинальности** между столбцом URL и предшествующим ему ключевым столбцом UserID.

Чтобы проиллюстрировать это, мы рассмотрим подробнее, как работает обобщённый исключающий поиск.

<a name="generic-exclusion-search-algorithm" />


### Обобщенный алгоритм исключающего поиска {#generic-exclusion-search-algorithm}

Ниже показано, как работает <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank" >обобщенный алгоритм исключающего поиска ClickHouse</a>, когда гранулы выбираются по вторичному столбцу, где предшествующий ключевой столбец имеет низкую (или высокую) кардинальность.

В качестве примера для обоих случаев будем считать, что:

- выполняется запрос, ищущий строки со значением URL = "W3";
- имеется абстрактная версия нашей таблицы hits с упрощёнными значениями для UserID и URL;
- для индекса используется тот же составной первичный ключ (UserID, URL). Это означает, что строки сначала упорядочены по значениям UserID. Строки с одинаковым значением UserID затем упорядочены по URL;
- размер гранулы равен двум, т. е. каждая гранула содержит две строки.

На диаграммах ниже мы отметили значения ключевых столбцов для первой строки таблицы каждой гранулы оранжевым цветом.

**Предшествующий ключевой столбец имеет низкую кардинальность**<a name="generic-exclusion-search-fast"></a>

Предположим, что UserID имеет низкую кардинальность. В этом случае вероятно, что одно и то же значение UserID распределено по нескольким строкам таблицы и гранулам, а следовательно, и по нескольким меткам индекса. Для меток индекса с одинаковым UserID значения URL для этих меток отсортированы по возрастанию (поскольку строки таблицы упорядочены сначала по UserID, а затем по URL). Это позволяет эффективно фильтровать данные, как описано ниже:

<Image img={sparsePrimaryIndexes07} size="md" alt="Sparse Primary Indices 06" background="white"/>

Для процесса выбора гранул для наших абстрактных данных из примера на диаграмме выше существуют три различных сценария:

1.  Метка индекса 0, для которой **значение URL меньше W3 и значение URL непосредственно следующей метки индекса также меньше W3**, может быть исключена, потому что для меток 0 и 1 значение UserID одинаково. Обратите внимание, что это предусловие исключения гарантирует, что гранула 0 полностью состоит из значений UserID U1, так что ClickHouse может предположить, что максимальное значение URL в грануле 0 также меньше W3 и исключить гранулу.

2. Метка индекса 1, для которой **значение URL меньше (или равно) W3 и значение URL непосредственно следующей метки индекса больше (или равно) W3**, выбирается, поскольку это означает, что гранула 1 может потенциально содержать строки с URL W3.

3. Метки индекса 2 и 3, для которых **значение URL больше W3**, могут быть исключены, так как метки первичного индекса хранят значения ключевых столбцов для первой строки таблицы в каждой грануле, а строки таблицы отсортированы на диске по значениям ключевых столбцов. Следовательно, гранулы 2 и 3 не могут содержать значение URL W3.

**Предшествующий ключевой столбец имеет высокую кардинальность**<a name="generic-exclusion-search-slow"></a>

Когда UserID имеет высокую кардинальность, маловероятно, что одно и то же значение UserID распределено по нескольким строкам таблицы и гранулам. Это означает, что значения URL для меток индекса больше не являются монотонно возрастающими:

<Image img={sparsePrimaryIndexes08} size="md" alt="Sparse Primary Indices 06" background="white"/>

Как видно на диаграмме выше, все показанные метки, чьи значения URL меньше W3, выбираются для потоковой передачи строк их соответствующих гранул в движок ClickHouse.

Это происходит потому, что хотя все метки индекса на диаграмме подпадают под сценарий 1, описанный выше, они не удовлетворяют указанному предусловию исключения, согласно которому *непосредственно следующая метка индекса должна иметь то же значение UserID, что и текущая метка*, и, следовательно, не могут быть исключены.

Например, рассмотрим метку индекса 0, для которой **значение URL меньше W3 и значение URL непосредственно следующей метки индекса также меньше W3**. Она *не может* быть исключена, потому что непосредственно следующая метка индекса 1 *не* имеет того же значения UserID, что и текущая метка 0.

В итоге это не позволяет ClickHouse делать предположения о максимальном значении URL в грануле 0. Вместо этого он должен предположить, что гранула 0 потенциально содержит строки со значением URL W3 и вынужден выбрать метку 0.

Та же ситуация справедлива для меток 1, 2 и 3.

:::note Заключение
<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">Общий алгоритм поиска методом исключения</a>, который ClickHouse использует вместо <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">алгоритма бинарного поиска</a>, когда запрос фильтрует по столбцу, который входит в составной ключ, но не является первым столбцом этого ключа, наиболее эффективен, когда предшествующий столбец ключа имеет низкую (или более низкую) кардинальность.
:::

В нашем тестовом наборе данных оба столбца ключа (UserID, URL) имеют сопоставимо высокую кардинальность и, как уже объяснялось, общий алгоритм поиска методом исключения не очень эффективен, когда предшествующий столбец ключа для столбца URL имеет высокую (или схожую) кардинальность.

### Примечание о data skipping index {#note-about-data-skipping-index}

Из-за схожей высокой кардинальности `UserID` и `URL` наш [фильтр по URL в запросе](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) также не дал бы заметного выигрыша от создания [вторичного data skipping index](./skipping-indexes.md) по столбцу URL
в нашей [таблице с составным первичным ключом (UserID, URL)](#a-table-with-a-primary-key).

Например, следующие две команды создают и заполняют data skipping index [minmax](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) по столбцу URL в нашей таблице:

```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```

ClickHouse теперь создал дополнительный индекс, который хранит — для каждой группы из 4 последовательных [гранул](#data-is-organized-into-granules-for-parallel-data-processing) (обратите внимание на параметр `GRANULARITY 4` в операторе `ALTER TABLE` выше) — минимальное и максимальное значение URL:

<Image img={sparsePrimaryIndexes13a} size="md" alt="Sparse Primary Indices 13a" background="white" />

Первая запись индекса (&#39;mark 0&#39; на диаграмме выше) хранит минимальные и максимальные значения URL для [строк, относящихся к первым 4 гранулам нашей таблицы](#data-is-organized-into-granules-for-parallel-data-processing).

Вторая запись индекса (&#39;mark 1&#39;) хранит минимальные и максимальные значения URL для строк, относящихся к следующим 4 гранулам нашей таблицы, и так далее.

(ClickHouse также создал специальный [mark file](#mark-files-are-used-for-locating-granules) для индекса пропуска данных, используемый для [поиска](#mark-files-are-used-for-locating-granules) групп гранул, связанных с метками индекса.)

Из-за сопоставимо высокой кардинальности UserID и URL этот вторичный индекс пропуска данных не помогает исключать гранулы при выполнении нашего [запроса с фильтрацией по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient).

Конкретное значение URL, которое ищет запрос (то есть &#39;[http://public&#95;search&amp;#39](http://public\&#95;search\&#39);), с высокой долей вероятности находится между минимальным и максимальным значениями, хранимыми индексом для каждой группы гранул, в результате чего ClickHouse вынужден выбирать эту группу гранул (поскольку она может содержать строки, соответствующие запросу).


### Необходимость использования нескольких первичных индексов {#a-need-to-use-multiple-primary-indexes}

Как следствие, если мы хотим значительно ускорить наш пример запроса, который фильтрует строки по конкретному URL, нам нужно использовать первичный индекс, оптимизированный под этот запрос.

Если при этом мы хотим также сохранить хорошую производительность примера запроса, который фильтрует строки по конкретному UserID, нам нужно использовать несколько первичных индексов.

Ниже показаны способы, как этого добиться.

<a name="multiple-primary-indexes"></a>

### Варианты создания дополнительных первичных индексов {#options-for-creating-additional-primary-indexes}

Если мы хотим значительно ускорить оба наших примерных запроса — и тот, который фильтрует строки по конкретному UserID, и тот, который фильтрует строки по конкретному URL, — нам нужно использовать несколько первичных индексов, выбрав один из трех следующих вариантов:

- Создать **вторую таблицу** с другим первичным ключом.
- Создать **materialized view** на нашей существующей таблице.
- Добавить **projection** к нашей существующей таблице.

Во всех трех вариантах наши примерные данные фактически дублируются в дополнительной таблице, чтобы перестроить первичный индекс таблицы и порядок сортировки строк.

Однако эти три варианта различаются тем, насколько эта дополнительная таблица «прозрачна» для пользователя с точки зрения маршрутизации запросов и операций вставки.

При создании **второй таблицы** с другим первичным ключом запросы должны явно отправляться в ту версию таблицы, которая лучше всего подходит для данного запроса, а новые данные должны явно вставляться в обе таблицы, чтобы поддерживать их синхронизированными:

<Image img={sparsePrimaryIndexes09a} size="md" alt="Sparse Primary Indices 09a" background="white"/>

При использовании **materialized view** дополнительная таблица неявно создается, и данные между обеими таблицами автоматически синхронизируются:

<Image img={sparsePrimaryIndexes09b} size="md" alt="Sparse Primary Indices 09b" background="white"/>

А **projection** является наиболее прозрачным вариантом, потому что, помимо автоматической синхронизации неявно создаваемой (и скрытой) дополнительной таблицы при изменениях данных, ClickHouse автоматически выбирает наиболее эффективную версию таблицы для запросов:

<Image img={sparsePrimaryIndexes09c} size="md" alt="Sparse Primary Indices 09c" background="white"/>

Далее мы подробно рассмотрим эти три варианта создания и использования нескольких первичных индексов на реальных примерах.

<a name="multiple-primary-indexes-via-secondary-tables"></a>

### Вариант 1: вторичные таблицы {#option-1-secondary-tables}

<a name="secondary-table" />

Мы создаём новую таблицу, в которой изменяем порядок ключевых столбцов (по сравнению с нашей исходной таблицей) в первичном ключе:

```sql
CREATE TABLE hits_URL_UserID
(
    `UserID` UInt32,
    `URL` String,
    `EventTime` DateTime
)
ENGINE = MergeTree
-- highlight-next-line
PRIMARY KEY (URL, UserID)
ORDER BY (URL, UserID, EventTime)
SETTINGS index_granularity_bytes = 0, compress_primary_key = 0;
```

Вставьте все 8,87 миллиона строк из нашей [исходной таблицы](#a-table-with-a-primary-key) во вспомогательную таблицу:

```sql
INSERT INTO hits_URL_UserID
SELECT * FROM hits_UserID_URL;
```

Ответ будет выглядеть так:

```response
Ok.

0 rows in set. Elapsed: 2.898 sec. Processed 8.87 million rows, 838.84 MB (3.06 million rows/s., 289.46 MB/s.)
```

И, наконец, оптимизируйте таблицу:

```sql
OPTIMIZE TABLE hits_URL_UserID FINAL;
```

Так как мы изменили порядок столбцов в первичном ключе, вставленные строки теперь хранятся на диске в другом лексикографическом порядке (по сравнению с нашей [исходной таблицей](#a-table-with-a-primary-key)), и, следовательно, 1083 гранулы этой таблицы также содержат другие значения, чем раньше:

<Image img={sparsePrimaryIndexes10} size="md" alt="Sparse Primary Indices 10" background="white" />

Вот итоговый первичный ключ:

<Image img={sparsePrimaryIndexes11} size="md" alt="Sparse Primary Indices 11" background="white" />

Теперь его можно использовать для значительного ускорения выполнения нашего примерного запроса с фильтрацией по столбцу URL, чтобы вычислить топ-10 пользователей, которые чаще всего кликали по URL &quot;[http://public&#95;search](http://public\&#95;search)&quot;:

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

10 rows in set. Elapsed: 0.017 sec.
# highlight-next-line
Processed 319.49 thousand rows,
11.38 MB (18.41 million rows/s., 655.75 MB/s.)
```

Теперь вместо [почти полного сканирования таблицы](/guides/best-practices/sparse-primary-indexes#efficient-filtering-on-secondary-key-columns) ClickHouse выполняет этот запрос гораздо эффективнее.

С первичным индексом из [исходной таблицы](#a-table-with-a-primary-key), где первым был UserID, а вторым ключевым столбцом — URL, ClickHouse использовал [обобщённый алгоритм поиска с исключением (generic exclusion search)](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) по меткам индекса для выполнения этого запроса, что было не очень эффективно из-за схожей высокой кардинальности UserID и URL.

При URL в качестве первого столбца в первичном индексе ClickHouse теперь выполняет <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">двоичный поиск</a> по меткам индекса.
Соответствующая запись трассировки в журнале сервера ClickHouse подтверждает это:


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

ClickHouse выбрал только 39 меток индекса вместо 1076 при использовании generic exclusion search.

Обратите внимание, что дополнительная таблица оптимизирована для ускорения выполнения нашего примерного запроса с фильтрацией по URL.

Аналогично [плохой производительности](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) того запроса с нашей [исходной таблицей](#a-table-with-a-primary-key), наш [пример запроса с фильтрацией по `UserIDs`](#the-primary-index-is-used-for-selecting-granules) также будет выполняться не очень эффективно с новой дополнительной таблицей, потому что UserID теперь является вторым ключевым столбцом в первичном индексе этой таблицы и, следовательно, ClickHouse будет использовать generic exclusion search для выбора гранул, что [не очень эффективно при схожей высокой кардинальности](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) UserID и URL.
Откройте окно с подробностями, чтобы увидеть специфику.

<details>
  <summary>
    Запрос с фильтрацией по UserIDs теперь имеет плохую производительность<a name="query-on-userid-slow" />
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

    Ответ:

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

    10 rows in set. Elapsed: 0.024 sec.
    # highlight-next-line
    Processed 8.02 million rows,
    73.04 MB (340.26 million rows/s., 3.10 GB/s.)
    ```

    Журнал сервера:

    ```response
    ...Executor): Key condition: (column 1 in [749927693, 749927693])
    # highlight-next-line
    ...Executor): Used generic exclusion search over index for part all_1_9_2
                  with 1453 steps
    ...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,
    # highlight-next-line
                  980/1083 marks by primary key, 980 marks to read from 23 ranges
    ...Executor): Reading approx. 8028160 rows with 10 streams
    ```
  </p>
</details>

Теперь у нас есть две таблицы, оптимизированные соответственно: одна — для ускорения запросов с фильтрацией по `UserIDs`, другая — для ускорения запросов с фильтрацией по URL:


### Вариант 2: materialized view {#option-2-materialized-views}

Создайте [materialized view](/sql-reference/statements/create/view.md) для нашей существующей таблицы.

```sql
CREATE MATERIALIZED VIEW mv_hits_URL_UserID
ENGINE = MergeTree()
PRIMARY KEY (URL, UserID)
ORDER BY (URL, UserID, EventTime)
POPULATE
AS SELECT * FROM hits_UserID_URL;
```

Ответ будет выглядеть следующим образом:

```response
Ok.

0 rows in set. Elapsed: 2.935 sec. Processed 8.87 million rows, 838.84 MB (3.02 million rows/s., 285.84 MB/s.)
```

:::note

* мы меняем порядок ключевых столбцов (по сравнению с [исходной таблицей](#a-table-with-a-primary-key)) в первичном ключе представления
* materialized view использует **неявно созданную таблицу**, порядок строк и первичный индекс которой основаны на заданном определении первичного ключа
* неявно созданная таблица отображается в результате запроса `SHOW TABLES` и имеет имя, которое начинается с `.inner`
* также возможно сначала явно создать базовую таблицу для materialized view, а затем само представление может ссылаться на эту таблицу через предложение `TO [db].[table]` [clause](/sql-reference/statements/create/view.md)
* мы используем ключевое слово `POPULATE`, чтобы немедленно заполнить неявно созданную таблицу всеми 8,87 млн строк из исходной таблицы [hits&#95;UserID&#95;URL](#a-table-with-a-primary-key)
* если в исходную таблицу hits&#95;UserID&#95;URL вставляются новые строки, то эти строки автоматически вставляются и в неявно созданную таблицу
* по сути, неявно созданная таблица имеет тот же порядок строк и тот же первичный индекс, что и [вторичная таблица, которую мы создавали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables):

<Image img={sparsePrimaryIndexes12b1} size="md" alt="Разреженные первичные индексы 12b1" background="white" />

ClickHouse сохраняет [файлы данных столбцов](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin), [файлы меток](#mark-files-are-used-for-locating-granules) (*.mrk2) и [первичный индекс](#the-primary-index-has-one-entry-per-granule) (primary.idx) неявно созданной таблицы в специальной папке внутри каталога данных сервера ClickHouse:

<Image img={sparsePrimaryIndexes12b2} size="md" alt="Разреженные первичные индексы 12b2" background="white" />

:::

Теперь неявно созданная таблица (и её первичный индекс), лежащая в основе materialized view, может использоваться для значительного ускорения выполнения нашего примерного запроса с фильтрацией по столбцу URL:

```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM mv_hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

Результат:

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

10 rows in set. Elapsed: 0.026 sec.
# highlight-next-line
Processed 335.87 thousand rows,
13.54 MB (12.91 million rows/s., 520.38 MB/s.)
```

Поскольку по сути неявно созданная таблица (и её первичный индекс), лежащая в основе materialized view, идентична [вторичной таблице, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables), запрос выполняется столь же эффективно, как и с явно созданной таблицей.

Соответствующая запись трассировки в файле журнала сервера ClickHouse подтверждает, что ClickHouse выполняет двоичный поиск по индексным меткам:


```response
...Executor): Key condition: (column 0 in ['http://public_search',
                                           'http://public_search'])
# highlight-next-line
...Executor): Running binary search on index range ...
...
...Executor): Selected 4/4 parts by partition key, 4 parts by primary key,
# highlight-next-line
              41/1083 marks by primary key, 41 marks to read from 4 ranges
...Executor): Reading approx. 335872 rows with 4 streams
```


### Вариант 3: PROJECTION {#option-3-projections}

Создайте PROJECTION для существующей таблицы:

```sql
ALTER TABLE hits_UserID_URL
    ADD PROJECTION prj_url_userid
    (
        SELECT *
        ORDER BY (URL, UserID)
    );
```

Теперь материализуйте проекцию:

```sql
ALTER TABLE hits_UserID_URL
    MATERIALIZE PROJECTION prj_url_userid;
```

:::note

* проекция создаёт **скрытую таблицу**, порядок строк и первичный индекс которой основаны на заданном в проекции выражении `ORDER BY`
* скрытая таблица не отображается в выводе запроса `SHOW TABLES`
* мы используем ключевое слово `MATERIALIZE`, чтобы немедленно заполнить скрытую таблицу всеми 8,87 миллионами строк из исходной таблицы [hits&#95;UserID&#95;URL](#a-table-with-a-primary-key)
* если в исходную таблицу hits&#95;UserID&#95;URL вставляются новые строки, то эти строки автоматически также вставляются в скрытую таблицу
* запрос всегда (с точки зрения синтаксиса) обращён к исходной таблице hits&#95;UserID&#95;URL, но если порядок строк и первичный индекс скрытой таблицы позволяют более эффективное выполнение запроса, то будет использована именно скрытая таблица
* обратите внимание, что проекции не делают запросы с использованием ORDER BY более эффективными, даже если ORDER BY совпадает с выражением ORDER BY проекции (см. [https://github.com/ClickHouse/ClickHouse/issues/47333](https://github.com/ClickHouse/ClickHouse/issues/47333))
* фактически неявно созданная скрытая таблица имеет тот же порядок строк и первичный индекс, что и [вторичная таблица, которую мы создали явным образом](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables):

<Image img={sparsePrimaryIndexes12c1} size="md" alt="Sparse Primary Indices 12c1" background="white" />

ClickHouse хранит [файлы данных столбцов](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin), [файлы меток](#mark-files-are-used-for-locating-granules) (*.mrk2) и [первичный индекс](#the-primary-index-has-one-entry-per-granule) (primary.idx) скрытой таблицы в специальной папке (выделена оранжевым на скриншоте ниже) рядом с файлами данных, файлами меток и файлами первичного индекса исходной таблицы:

<Image img={sparsePrimaryIndexes12c2} size="sm" alt="Sparse Primary Indices 12c2" background="white" />

:::

Скрытая таблица (и её первичный индекс), созданная проекцией, теперь может (неявно) использоваться для существенного ускорения выполнения нашего примерного запроса с фильтрацией по столбцу URL. Обратите внимание, что запрос с точки зрения синтаксиса обращён к исходной таблице проекции.

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

10 rows in set. Elapsed: 0.029 sec.
# highlight-next-line
Processed 319.49 thousand rows, 1
1.38 MB (11.05 million rows/s., 393.58 MB/s.)
```

Поскольку фактически скрытая таблица (и её первичный индекс), создаваемая PROJECTION, идентична [вторичной таблице, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables), запрос выполняется столь же эффективно, как и при использовании явно созданной таблицы.

Соответствующая запись уровня trace в журнале сервера ClickHouse подтверждает, что ClickHouse выполняет двоичный поиск по меткам индекса:


```response
...Executor): Key condition: (column 0 in ['http://public_search',
                                           'http://public_search'])
# highlight-next-line
...Executor): Running binary search on index range for part prj_url_userid (1083 marks)
...Executor): ...
# highlight-next-line
...Executor): Choose complete Normal projection prj_url_userid
...Executor): projection required columns: URL, UserID
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,
# highlight-next-line
              39/1083 marks by primary key, 39 marks to read from 1 ranges
...Executor): Reading approx. 319488 rows with 2 streams
```


### Summary {#summary}

Первичный индекс нашей [таблицы с составным первичным ключом (UserID, URL)](#a-table-with-a-primary-key) был очень полезен для ускорения [запроса с фильтрацией по UserID](#the-primary-index-is-used-for-selecting-granules). Но этот индекс не дает существенного выигрыша при ускорении [запроса с фильтрацией по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient), несмотря на то что столбец URL входит в составной первичный ключ.

И наоборот:
Первичный индекс нашей [таблицы с составным первичным ключом (URL, UserID)](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) ускорял [запрос с фильтрацией по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient), но почти не помогал при выполнении [запроса с фильтрацией по UserID](#the-primary-index-is-used-for-selecting-granules).

Из‑за схожей высокой кардинальности столбцов первичного ключа UserID и URL запрос, который фильтрует по второму столбцу ключа, [получает мало выгоды от того, что второй столбец ключа присутствует в индексе](#generic-exclusion-search-algorithm).

Поэтому имеет смысл убрать второй столбец ключа из первичного индекса (что приведет к меньшему потреблению памяти индексом) и вместо этого [использовать несколько первичных индексов](/guides/best-practices/sparse-primary-indexes#using-multiple-primary-indexes).

Однако, если столбцы ключа в составном первичном ключе сильно различаются по кардинальности, то [для запросов выгодно](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) упорядочивать столбцы первичного ключа по кардинальности в порядке возрастания.

Чем больше разница в кардинальности между столбцами ключа, тем сильнее порядок этих столбцов в ключе влияет на эффективность запросов. Мы продемонстрируем это в следующем разделе.

## Эффективный порядок столбцов ключа {#ordering-key-columns-efficiently}

<a name="test" />

В составном первичном ключе порядок столбцов ключа может существенно влиять и на:

* эффективность фильтрации по вторичным столбцам ключа в запросах, и на
* коэффициент сжатия файлов данных таблицы.

Чтобы продемонстрировать это, мы будем использовать версию нашего [образца данных веб-трафика](#data-set),
где каждая строка содержит три столбца, которые указывают, было ли обращение интернет‑«пользователя» (столбец `UserID`) к URL (столбец `URL`) помечено как бот-трафик (столбец `IsRobot`).

Мы будем использовать составной первичный ключ, содержащий все три вышеперечисленных столбца, который может использоваться для ускорения типичных запросов веб-аналитики, вычисляющих:

* какой объём (процент) трафика на конкретный URL приходится на ботов, или
* насколько мы уверены, что конкретный пользователь (не) является ботом (какой процент трафика от этого пользователя (не) считается бот-трафиком).

Мы используем этот запрос для вычисления кардинальностей трёх столбцов, которые мы хотим использовать как столбцы ключа в составном первичном ключе (обратите внимание, что мы используем [табличную функцию URL](/sql-reference/table-functions/url.md) для выполнения ad hoc‑запросов к TSV-данным без необходимости создавать локальную таблицу). Запустите этот запрос в `clickhouse client`:

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
│ 2.39 million    │ 119.08 thousand    │ 4.00                │
└─────────────────┴────────────────────┴─────────────────────┘

1 row in set. Elapsed: 118.334 sec. Processed 8.87 million rows, 15.88 GB (74.99 thousand rows/s., 134.21 MB/s.)
```

Мы видим, что существует большая разница между кардинальностями, особенно между столбцами `URL` и `IsRobot`, и, следовательно, порядок этих столбцов в составном первичном ключе важен как для эффективного выполнения запросов с фильтрацией по этим столбцам, так и для достижения оптимальных коэффициентов сжатия файлов данных столбцов этой таблицы.

Чтобы продемонстрировать это, мы создадим две версии таблицы для наших данных анализа бот-трафика:

* таблица `hits_URL_UserID_IsRobot` с составным первичным ключом `(URL, UserID, IsRobot)`, в которой мы упорядочиваем столбцы ключа по кардинальности по убыванию
* таблица `hits_IsRobot_UserID_URL` с составным первичным ключом `(IsRobot, UserID, URL)`, в которой мы упорядочиваем столбцы ключа по кардинальности по возрастанию

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

И заполним её 8,87 млн строк:

```sql
INSERT INTO hits_URL_UserID_IsRobot SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```

Ответ:

```response
0 rows in set. Elapsed: 104.729 sec. Processed 8.87 million rows, 15.88 GB (84.73 thousand rows/s., 151.64 MB/s.)
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
-- highlight-next-line
PRIMARY KEY (IsRobot, UserID, URL);
```

И заполните её теми же 8,87 млн строк, которыми мы заполняли предыдущую таблицу:


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
0 rows in set. Elapsed: 95.959 sec. Processed 8.87 million rows, 15.88 GB (92.48 thousand rows/s., 165.50 MB/s.)
```


### Эффективная фильтрация по вторичным столбцам ключа {#efficient-filtering-on-secondary-key-columns}

Когда запрос фильтрует по крайней мере по одному столбцу, который входит в составной ключ и является первым столбцом ключа, [ClickHouse выполняет алгоритм бинарного поиска по индексным меткам этого столбца ключа](#the-primary-index-is-used-for-selecting-granules).

Когда запрос фильтрует (только) по столбцу, который входит в составной ключ, но не является первым столбцом ключа, [ClickHouse использует универсальный алгоритм поиска с исключениями по индексным меткам этого столбца ключа](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient).

Во втором случае порядок столбцов ключа в составном первичном ключе имеет значение для эффективности [универсального алгоритма поиска с исключениями](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444).

Ниже приведён запрос, который фильтрует по столбцу `UserID` в таблице, где мы упорядочили столбцы ключа `(URL, UserID, IsRobot)` по кардинальности в порядке убывания:

```sql
SELECT count(*)
FROM hits_URL_UserID_IsRobot
WHERE UserID = 112304
```

Ответ выглядит так:

```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.026 sec.
# highlight-next-line
Processed 7.92 million rows,
31.67 MB (306.90 million rows/s., 1.23 GB/s.)
```

Это тот же запрос к таблице, в которой мы отсортировали ключевые столбцы `(IsRobot, UserID, URL)` по возрастанию их кардинальности:

```sql
SELECT count(*)
FROM hits_IsRobot_UserID_URL
WHERE UserID = 112304
```

Получаем:

```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.003 sec.
# highlight-next-line
Processed 20.32 thousand rows,
81.28 KB (6.61 million rows/s., 26.44 MB/s.)
```

Мы видим, что выполнение запроса значительно эффективнее и быстрее для таблицы, в которой ключевые столбцы упорядочены по возрастанию кардинальности.

Причина в том, что [generic exclusion search algorithm](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444) работает наиболее эффективно, когда [гранулы](#the-primary-index-is-used-for-selecting-granules) отбираются по вторичному столбцу ключа, при этом предшествующий ему столбец ключа имеет более низкую кардинальность. Мы подробно проиллюстрировали это в [предыдущем разделе](#generic-exclusion-search-algorithm) этого руководства.


### Оптимальный коэффициент сжатия файлов данных {#optimal-compression-ratio-of-data-files}

Этот запрос сравнивает степень сжатия столбца `UserID` между двумя таблицами, которые мы создали выше:

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
```

Получаем:

```response
┌─Table───────────────────┬─Column─┬─Uncompressed─┬─Compressed─┬─Ratio─┐
│ hits_URL_UserID_IsRobot │ UserID │ 33.83 MiB    │ 11.24 MiB  │     3 │
│ hits_IsRobot_UserID_URL │ UserID │ 33.83 MiB    │ 877.47 KiB │    39 │
└─────────────────────────┴────────┴──────────────┴────────────┴───────┘

2 rows in set. Elapsed: 0.006 sec.
```

Мы видим, что коэффициент сжатия для столбца `UserID` значительно выше для таблицы, в которой мы упорядочили ключевые столбцы `(IsRobot, UserID, URL)` по кардинальности по возрастанию.

Хотя в обеих таблицах хранятся точно одни и те же данные (мы вставили одни и те же 8.87 миллиона строк в обе таблицы), порядок ключевых столбцов в составном первичном ключе существенно влияет на то, сколько дискового пространства требуется для <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">сжатых</a> данных в [файлах данных столбцов](#data-is-stored-on-disk-ordered-by-primary-key-columns) таблицы:

* в таблице `hits_URL_UserID_IsRobot` с составным первичным ключом `(URL, UserID, IsRobot)`, где мы упорядочиваем ключевые столбцы по кардинальности по убыванию, файл данных `UserID.bin` занимает **11.24 MiB** дискового пространства
* в таблице `hits_IsRobot_UserID_URL` с составным первичным ключом `(IsRobot, UserID, URL)`, где мы упорядочиваем ключевые столбцы по кардинальности по возрастанию, файл данных `UserID.bin` занимает всего **877.47 KiB** дискового пространства

Хороший коэффициент сжатия данных столбца таблицы на диске не только экономит место на диске, но и ускоряет запросы (особенно аналитические), которые требуют чтения данных из этого столбца, так как требуется меньше операций ввода-вывода (I/O) для переноса данных столбца с диска в основную память (файловый кэш операционной системы).

Далее мы иллюстрируем, почему для коэффициента сжатия столбцов таблицы выгодно упорядочивать столбцы первичного ключа по кардинальности по возрастанию.

На диаграмме ниже схематично показан порядок строк на диске для первичного ключа, в котором ключевые столбцы упорядочены по кардинальности по возрастанию:

<Image img={sparsePrimaryIndexes14a} size="md" alt="Sparse Primary Indices 14a" background="white" />

Мы обсуждали, что [данные строк таблицы хранятся на диске в порядке столбцов первичного ключа](#data-is-stored-on-disk-ordered-by-primary-key-columns).

На диаграмме выше строки таблицы (их значения столбцов на диске) сначала упорядочены по их значению `cl`, а строки с одинаковым значением `cl` упорядочены по значению `ch`. И поскольку первый ключевой столбец `cl` имеет низкую кардинальность, вероятно, что существует много строк с одинаковым значением `cl`. И из-за этого также вероятно, что значения `ch` оказываются упорядоченными (локально — для строк с одинаковым значением `cl`).

Если в столбце похожие данные размещены близко друг к другу, например за счёт сортировки, то такие данные сжимаются лучше.
В общем случае алгоритм сжатия выигрывает от длины последовательностей данных (чем больше данных он видит, тем лучше для сжатия)
и локальности (чем более похожи данные, тем лучше коэффициент сжатия).

В отличие от диаграммы выше, диаграмма ниже схематично показывает порядок строк на диске для первичного ключа, в котором ключевые столбцы упорядочены по кардинальности по убыванию:

<Image img={sparsePrimaryIndexes14b} size="md" alt="Sparse Primary Indices 14b" background="white" />


Теперь строки таблицы сначала упорядочены по их значению `ch`, а строки с одинаковым значением `ch` — по их значению `cl`.
Но поскольку первый столбец ключа `ch` имеет высокую кардинальность, маловероятно, что найдутся строки с одинаковым значением `ch`. По этой причине также маловероятно, что значения `cl` будут упорядочены (локально — для строк с одинаковым значением `ch`).

Следовательно, значения `cl`, скорее всего, находятся в случайном порядке и, как следствие, обладают плохой локальностью и низким коэффициентом сжатия.

### Резюме {#summary-1}

И для эффективной фильтрации по столбцам вторичного ключа в запросах, и для повышения степени сжатия файлов данных столбцов таблицы полезно располагать столбцы первичного ключа в порядке возрастания их кардинальности.

## Эффективная идентификация отдельных строк {#identifying-single-rows-efficiently}

Хотя в целом это [не является](/knowledgebase/key-value) наилучшим сценарием использования ClickHouse,
иногда приложения, построенные на базе ClickHouse, требуют идентифицировать отдельные строки таблицы ClickHouse.

Интуитивным решением для этого может быть использование столбца [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) с уникальным значением для каждой строки и применение этого столбца в качестве столбца первичного ключа для быстрого извлечения строк.

Для максимально быстрого извлечения столбец UUID [должен быть первым столбцом ключа](#the-primary-index-is-used-for-selecting-granules).

Мы обсуждали, что поскольку [строки таблицы ClickHouse хранятся на диске в порядке столбцов первичного ключа](#data-is-stored-on-disk-ordered-by-primary-key-columns), наличие столбца с очень высокой кардинальностью (как столбец UUID) в первичном ключе или в составном первичном ключе перед столбцами с более низкой кардинальностью [ухудшает коэффициент сжатия других столбцов таблицы](#optimal-compression-ratio-of-data-files).

Компромиссом между максимально быстрым извлечением и оптимальным сжатием данных является использование составного первичного ключа, где UUID является последним столбцом ключа, после столбцов с низкой (или более низкой) кардинальностью, которые обеспечивают хороший коэффициент сжатия для части столбцов таблицы.

### Конкретный пример {#a-concrete-example}

Один конкретный пример — сервис открытых текстовых вставок [https://pastila.nl](https://pastila.nl), который разработал Alexey Milovidov и о котором он [написал в блоге](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/).

При каждом изменении текста в текстовой области данные автоматически сохраняются в строку таблицы ClickHouse (одна строка на каждое изменение).

Один из способов идентифицировать и получить (конкретную версию) вставленного содержимого — использовать хеш содержимого как UUID для строки таблицы, которая содержит это содержимое.

На следующей схеме показаны

- порядок вставки строк при изменении содержимого (например, из‑за нажатия клавиш при вводе текста в текстовую область) и
- порядок расположения на диске данных из вставленных строк, когда используется `PRIMARY KEY (hash)`:

<Image img={sparsePrimaryIndexes15a} size="md" alt="Разреженные первичные индексы 15a" background="white"/>

Поскольку столбец `hash` используется как столбец первичного ключа,

- отдельные строки могут быть [очень быстро](#the-primary-index-is-used-for-selecting-granules) извлечены, но
- строки таблицы (их данные по столбцам) хранятся на диске в порядке возрастания (уникальных и случайных) значений `hash`. Поэтому значения столбца `content` также хранятся в случайном порядке, без локальности данных, что приводит к **неоптимальному коэффициенту сжатия для файла данных столбца `content`**.

Чтобы существенно улучшить коэффициент сжатия для столбца `content`, при этом сохранив быстрое извлечение отдельных строк, pastila.nl использует два хеша (и составной первичный ключ) для идентификации конкретной строки:

- хеш содержимого, как обсуждалось выше, который различается для различных данных, и
- [локально чувствительный хеш (отпечаток)](https://en.wikipedia.org/wiki/Locality-sensitive_hashing), который **не** изменяется при небольших изменениях данных.

На следующей схеме показаны

- порядок вставки строк при изменении содержимого (например, из‑за нажатия клавиш при вводе текста в текстовую область) и
- порядок расположения на диске данных из вставленных строк, когда используется составной `PRIMARY KEY (fingerprint, hash)`:

<Image img={sparsePrimaryIndexes15b} size="md" alt="Разреженные первичные индексы 15b" background="white"/>

Теперь строки на диске сначала упорядочены по `fingerprint`, а для строк с одинаковым значением `fingerprint` их значение `hash` определяет окончательный порядок.

Поскольку данные, отличающиеся только небольшими изменениями, получают одинаковое значение `fingerprint`, похожие данные теперь хранятся на диске близко друг к другу в столбце `content`. И это очень хорошо для коэффициента сжатия столбца `content`, так как алгоритм сжатия в целом выигрывает от локальности данных (чем более похожи данные, тем лучше коэффициент сжатия).

Компромисс заключается в том, что для извлечения конкретной строки требуются два поля (`fingerprint` и `hash`), чтобы оптимально использовать первичный индекс, получающийся из составного `PRIMARY KEY (fingerprint, hash)`.