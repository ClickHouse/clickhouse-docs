---
sidebar_label: 'Первичные индексы'
sidebar_position: 1
description: 'В этом руководстве мы подробно рассмотрим индексацию в ClickHouse.'
title: 'Практическое введение в первичные индексы в ClickHouse'
slug: /guides/best-practices/sparse-primary-indexes
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


# Практическое введение в первичные индексы в ClickHouse
## Введение {#introduction}

В этом руководстве мы подробно рассмотрим индексацию в ClickHouse. Мы проиллюстрируем и обсудим в деталях:
- [как индексация в ClickHouse отличается от традиционных систем управления реляционными базами данных](#an-index-design-for-massive-data-scales)
- [как ClickHouse строит и использует разреженный первичный индекс таблицы](#a-table-with-a-primary-key)
- [какие из лучших практик индексирования в ClickHouse](#using-multiple-primary-indexes)

Вы также можете выполнить все SQL-операторы и запросы ClickHouse, приведенные в этом руководстве, на своем компьютере. Для получения инструкций по установке ClickHouse и начальным шагам смотрите [Быстрый старт](/quick-start.mdx).

:::note
Это руководство сосредоточено на разреженных первичных индексах ClickHouse.

Для [вторичных индексов пропуска данных ClickHouse](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes) смотрите [Учебное пособие](/guides/best-practices/skipping-indexes.md).
:::
### Набор данных {#data-set}

На протяжении всего этого руководства мы будем использовать пример анонимизированного набора данных веб-трафика.

- Мы будем использовать подмножество из 8,87 миллиона строк (событий) из примера набора данных.
- Размер несжатых данных составляет 8,87 миллиона событий и около 700 МБ. При хранении в ClickHouse это сжимается до 200 МБ.
- В нашем подмножестве каждая строка содержит три столбца, которые указывают на интернет-пользователя (`UserID` столбец), который кликнул по URL (`URL` столбец) в определенное время (`EventTime` столбец).

С этими тремя столбцами мы уже можем сформулировать некоторые типичные запросы веб-аналитики, такие как:

- "Какие 10 URL являются самыми кликаемыми для конкретного пользователя?"
- "Кто из 10 пользователей чаще всего кликал по конкретному URL?"
- "В какое время (например, дни недели) пользователь чаще всего кликает по определенному URL?"
### Тестовая машина {#test-machine}

Все числовые показатели выполнения, приведенные в этом документе, основаны на локальном запуске ClickHouse 22.2.1 на MacBook Pro с чипом Apple M1 Pro и 16 ГБ ОЗУ.
### Полное сканирование таблицы {#a-full-table-scan}

Чтобы увидеть, как выполняется запрос по нашему набору данных без первичного ключа, мы создаем таблицу (с движком таблицы MergeTree), выполнив следующий SQL DDL оператор:

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

Затем добавляем подмножество данных hits в таблицу с помощью следующего SQL оператора вставки.
Это использует [табличную функцию URL](/sql-reference/table-functions/url.md) для загрузки подмножества полного набора данных, размещенного удаленно на clickhouse.com:

```sql
INSERT INTO hits_NoPrimaryKey SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```
Ответ:
```response
Ok.

0 rows in set. Elapsed: 145.993 sec. Processed 8.87 million rows, 18.40 GB (60.78 thousand rows/s., 126.06 MB/s.)
```

Вывод результатов клиента ClickHouse показывает, что вышеуказанный оператор вставки добавил 8,87 миллиона строк в таблицу.


В заключение, чтобы упростить обсуждение позже в этом руководстве и сделать диаграммы и результаты воспроизводимыми, мы [оптимизируем](/sql-reference/statements/optimize.md) таблицу, используя ключевое слово FINAL:

```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
В общем случае не требуется и не рекомендуется немедленно оптимизировать таблицу после загрузки данных в нее. Почему это необходимо для данного примера станет очевидным.
:::


Теперь мы выполняем наш первый запрос веб-аналитики. Следующий запрос вычисляет 10 самых кликаемых URL для интернет-пользователя с UserID 749927693:

```sql
SELECT URL, count(URL) as Count
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

Вывод результатов клиента ClickHouse указывает на то, что ClickHouse выполнил полное сканирование таблицы! Каждая отдельная строка из 8,87 миллиона строк нашей таблицы была передана в ClickHouse. Это не масштабируется.

Чтобы сделать это (значительно) более эффективно и (намного) быстрее, нам нужно использовать таблицу с подходящим первичным ключом. Это позволит ClickHouse автоматически (на основе столбцов первичного ключа) создать разреженный первичный индекс, который затем можно использовать для значительного ускорения выполнения нашего примера запроса.
### Связанный контент {#related-content}
- Блог: [Ускорение ваших запросов ClickHouse](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)
## Проектирование индексов ClickHouse {#clickhouse-index-design}
### Проектирование индекса для массовых объемов данных {#an-index-design-for-massive-data-scales}

В традиционных системах управления реляционными базами данных первичный индекс будет содержать одну запись на каждую строку таблицы. Это приведет к тому, что первичный индекс будет содержать 8,87 миллиона записей для нашего набора данных. Такой индекс позволяет быстро находить определенные строки, обеспечивая высокую эффективность для запросов поиска и точечных обновлений. Поиск записи в структуре данных `B(+)-Tree` имеет среднюю временную сложность `O(log n)`; более точно, `log_b n = log_2 n / log_2 b`, где `b` — это ветвевой фактор `B(+)-Tree`, а `n` — это количество индексированных строк. Поскольку `b` обычно составляет от нескольких сотен до нескольких тысяч, `B(+)-Trees` очень поверхностные структуры, и для нахождения записей требуется немного обращений к диску. При 8,87 миллиона строк и ветвевом факторе 1000 требуется в среднем 2,3 обращения к диску. Эта способность имеет свою цену: дополнительные затраты на диск и память, более высокие затраты на вставку при добавлении новых строк в таблицу и записей в индекс и иногда перераспределение B-Tree.

Учитывая проблемы, связанные с индексами B-Tree, движки таблиц в ClickHouse используют другой подход. [Семейство движков MergeTree](/engines/table-engines/mergetree-family/index.md) ClickHouse было разработано и оптимизировано для работы с массовыми объемами данных. Эти таблицы предназначены для получения миллионов вставок строк в секунду и хранения очень больших объемов данных (десятки ПетаБайт). Данные быстро записываются в таблицу [частями](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage), с применением правил для объединения частей в фоновом режиме. В ClickHouse каждая часть имеет свой собственный первичный индекс. Когда части объединяются, также объединяются первичные индексы этих частей. На очень большом масштабе, для которого предназначен ClickHouse, крайне важно быть эффективным по использованию диска и памяти. Поэтому, вместо индексирования каждой строки, первичный индекс для части имеет одну запись индекса (известную как «метка») на группу строк (называемую «гранулой») - эта техника называется **разреженным индексом**.

Разреженная индексация возможна, потому что ClickHouse хранит строки для части на диске в порядке столбцов первичного ключа. Вместо того чтобы напрямую находить отдельные строки (например, в индексе на основе B-Tree), разреженный первичный индекс позволяет быстро (через двоичный поиск по записям индекса) идентифицировать группы строк, которые могут соответствовать запросу. Найденные группы потенциально совпадающих строк (гранулы) затем в параллельном режиме передаются в движок ClickHouse для нахождения совпадений. Этот дизайн индекса позволяет первичному индексу быть маленьким (он может, и должен, полностью помещаться в основную память), при этом значительно ускоряя время выполнения запросов: особенно для диапазонных запросов, которые типичны в случаях использования аналитики данных.

Следующий раздел подробно иллюстрирует, как ClickHouse строит и использует свой разреженный первичный индекс. Позже в статье мы обсудим некоторые лучшие практики по выбору, удалению и сортировке столбцов таблицы, которые используются для построения индекса (столбцы первичного ключа).
### Таблица с первичным ключом {#a-table-with-a-primary-key}

Создайте таблицу с составным первичным ключом, состоящим из ключевых столбцов UserID и URL:

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

[//]: # (<details open>)
<details>
    <summary>
    Подробности DDL оператора
    </summary>
    <p>

Чтобы упростить обсуждение позже в этом руководстве, а также сделать диаграммы и результаты воспроизводимыми, оператор DDL:

<ul>
  <li>
    Указывает составной ключ сортировки для таблицы через оператор <code>ORDER BY</code>.
  </li>
  <li>
    Явно контролирует, сколько записей индекса будет иметь первичный индекс через следующие настройки:
    <ul>
      <li>
        <code>index_granularity</code>: явно установлено на его значение по умолчанию 8192. Это означает, что для каждой группы из 8192 строк первичный индекс будет иметь одну запись индекса. Например, если таблица содержит 16384 строки, индекс будет иметь две записи индекса.
      </li>
      <li>
        <code>index_granularity_bytes</code>: установлено на 0 для отключения <a href="https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1" target="_blank">адаптивной градации индекса</a>. Адаптивная градация индекса означает, что ClickHouse автоматически создает одну запись индекса для группы из n строк, если выполняется хотя бы одно из следующих условий:
        <ul>
          <li>
            Если <code>n</code> меньше 8192 и размер объединенных данных строк для этих <code>n</code> строк составляет не менее 10 МБ (значение по умолчанию для <code>index_granularity_bytes</code>).
          </li>
          <li>
            Если размер объединенных данных строк для <code>n</code> строк меньше 10 МБ, но <code>n</code> равно 8192.
          </li>
        </ul>
      </li>
      <li>
        <code>compress_primary_key</code>: установлено на 0, чтобы отключить <a href="https://github.com/ClickHouse/ClickHouse/issues/34437" target="_blank">сжатие первичного индекса</a>. Это позволит нам при необходимости просмотреть его содержимое позже.
      </li>
    </ul>
  </li>
</ul>

</p>
</details>

Первичный ключ в операторе DDL выше вызывает создание первичного индекса на основе двух указанных ключевых столбцов.

<br/>
Затем добавляем данные:

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

<br/>
И оптимизируем таблицу:

```sql
OPTIMIZE TABLE hits_UserID_URL FINAL;
```

<br/>
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
rows:                        8.87 million
data_uncompressed_bytes:     733.28 MiB
data_compressed_bytes:       206.94 MiB
primary_key_bytes_in_memory: 96.93 KiB
marks:                       1083
bytes_on_disk:               207.07 MiB


1 rows in set. Elapsed: 0.003 sec.
```

Вывод клиента ClickHouse показывает:

- Данные таблицы хранятся в [широком формате](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) в определенной директории на диске, что означает, что на каждый столбец таблицы есть один файл данных (и один файл меток) внутри этой директории.
- Таблица содержит 8,87 миллиона строк.
- Общий размер несжатых данных всех строк составляет 733,28 МБ.
- Размер сжатых данных на диске составляет 206,94 МБ.
- Таблица имеет первичный индекс с 1083 записями (называемыми "метки"), и размер индекса составляет 96,93 КБ.
- В общей сложности файлы данных, файлы меток и файл первичного индекса таблицы занимают 207,07 МБ на диске.
### Данные хранятся на диске, упорядоченные по столбцам первичного ключа {#data-is-stored-on-disk-ordered-by-primary-key-columns}

Наша таблица, которую мы создали выше, имеет
- составной [первичный ключ](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)` и
- составной [ключ сортировки](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)`.

:::note
- Если бы мы указали только ключ сортировки, тогда первичный ключ был бы неявно определен как равный ключу сортировки.

- Для того чтобы быть эффективным по памяти, мы явно указали первичный ключ, который содержит только столбцы, по которым наши запросы фильтруются. Первичный индекс, основанный на первичном ключе, полностью загружается в основную память.

- Для обеспечения согласованности диаграмм в руководстве, а также для максимизации коэффициента сжатия мы определили отдельный ключ сортировки, который включает все столбцы нашей таблицы (если в столбце похожие данные располагаются близко друг к другу, например, через сортировку, то эти данные будут лучше сжиматься).

- Первичный ключ должен быть префиксом ключа сортировки, если оба указаны.
:::

Вставленные строки хранятся на диске в лексикографическом порядке (по возрастанию) по столбцам первичного ключа (и дополнительному столбцу `EventTime` из ключа сортировки).

:::note
ClickHouse позволяет вставлять несколько строк с одинаковыми значениями столбцов первичного ключа. В этом случае (смотрите строку 1 и строку 2 на диаграмме ниже) окончательный порядок определяется заданным ключом сортировки и, следовательно, значением колонки `EventTime`.
:::


ClickHouse является <a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms
" target="_blank">столбцовой системой управления базами данных</a>. Как показано на диаграмме ниже
- для представления на диске существует один файл данных (*.bin) на каждый столбец таблицы, где все значения для этого столбца хранятся в <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">сжатом</a> формате, и
- 8,87 миллиона строк хранятся на диске в лексикографическом порядке по столбцам первичного ключа (и дополнительным столбцам сортировки), а именно
  - сначала по `UserID`,
  - затем по `URL`,
  - и наконец по `EventTime`:

<Image img={sparsePrimaryIndexes01} size="md" alt="Разреженные первичные индексы 01" background="white"/>

`UserID.bin`, `URL.bin` и `EventTime.bin` — это файлы данных на диске, где хранатся значения столбцов `UserID`, `URL` и `EventTime`.

:::note
- Поскольку первичный ключ определяет лексикографический порядок строк на диске, таблица может иметь только один первичный ключ.

- Мы нумеруем строки, начиная с 0, чтобы соответствовать внутренней схеме нумерации строк ClickHouse, которая также используется для логирования сообщений.
:::
### Данные организованы в гранулы для параллельной обработки данных {#data-is-organized-into-granules-for-parallel-data-processing}

Для целей обработки данных, значения столбцов таблицы логически разделены на гранулы.
Гранула - это наименьший неделимый набор данных, который передается в ClickHouse для обработки данных.
Это означает, что вместо чтения отдельных строк ClickHouse всегда читает (в поточном режиме и параллельно) целую группу (гранулу) строк.
:::note
Значения столбцов физически не хранятся внутри гранул: гранулы просто логическая организация значений столбцов для обработки запросов.
:::

Следующая диаграмма показывает, как (значения столбцов) 8,87 миллиона строк нашей таблицы организованы в 1083 гранулы, в результате чего оператор DDL таблицы содержит настройку `index_granularity` (установленную на значение по умолчанию 8192).

<Image img={sparsePrimaryIndexes02} size="md" alt="Разреженные первичные индексы 02" background="white"/>

Первые (на основе физического порядка на диске) 8192 строки (их значения столбцов) логически принадлежат грануле 0, затем следующие 8192 строки (их значения столбцов) принадлежат грануле 1 и так далее.

:::note
- Последняя гранула (гранула 1082) "содержит" менее 8192 строк.

- Мы упоминали в начале этого руководства в разделе "Подробности DDL оператора", что мы отключили [адаптивную градацию индекса](/whats-new/changelog/2019.md/#experimental-features-1) (чтобы упростить обсуждение в этом руководстве, а также чтобы сделать диаграммы и результаты воспроизводимыми).

  Поэтому все гранулы (за исключением последней) нашей примерной таблицы имеют один и тот же размер.

- Для таблиц с адаптивной градацией индекса (градация индекса является адаптивной по [умолчанию](/operations/settings/merge-tree-settings#index_granularity_bytes), размер некоторых гранул может быть меньше 8192 строк в зависимости от размеров данных строк.


- Мы отметили некоторые значения столбцов из наших столбцов первичного ключа (`UserID`, `URL`) оранжевым цветом.
  Эти значения столбцов, выделенные оранжевым, будут записями в первичном индексе таблицы.

- Мы нумеруем гранулы, начиная с 0, чтобы соответствовать внутренней схеме нумерации ClickHouse, которая также используется для логирования сообщений.
:::
```yaml
title: 'Первичный индекс имеет одну запись на гранулу'
sidebar_label: 'Первичный индекс имеет одну запись на гранулу'
keywords: ['индекс', 'гранула', 'ClickHouse']
description: 'Объяснение структуры первичного индекса в ClickHouse.'
```

### Первичный индекс имеет одну запись на гранулу {#the-primary-index-has-one-entry-per-granule}

Первичный индекс создается на основе гранул, показанных на диаграмме выше. Этот индекс представляет собой несжатый плоский файл массива (primary.idx), содержащий так называемые числовые метки индекса, начинающиеся с 0.

На диаграмме ниже показано, что индекс хранит значения столбца первичного ключа (значения, отмеченные оранжевым на диаграмме выше) для каждой первой строки каждой гранулы. Или, другими словами: первичный индекс хранит значения столбца первичного ключа из каждой 8192-й строки таблицы (основанные на физическом порядке строк, определяемом столбцами первичного ключа). Например:
- первая запись индекса (‘метка 0’ на диаграмме ниже) хранит значения ключевого столбца первой строки гранулы 0 из диаграммы выше,
- вторая запись индекса (‘метка 1’ на диаграмме ниже) хранит значения ключевого столбца первой строки гранулы 1 из диаграммы выше, и так далее.

<Image img={sparsePrimaryIndexes03a} size="lg" alt="Sparse Primary Indices 03a" background="white"/>

В сумме индекс имеет 1083 записи для нашей таблицы с 8.87 миллиона строк и 1083 гранулами:

<Image img={sparsePrimaryIndexes03b} size="md" alt="Sparse Primary Indices 03b" background="white"/>

:::note
- Для таблиц с [адаптивной гранулярностью индекса](/whats-new/changelog/2019.md/#experimental-features-1) также хранится одна "финальная" дополнительная метка в первичном индексе, которая записывает значения столбцов первичного ключа последней строки таблицы, но поскольку мы отключили адаптивную гранулярность индекса (для упрощения обсуждений в этом руководстве, а также чтобы сделать диаграммы и результаты воспроизводимыми), индекс нашей примерной таблицы не включает эту финальную метку.

- Файл первичного индекса полностью загружается в основную память. Если файл больше доступного свободного пространства памяти, то ClickHouse выдаст ошибку.
:::

<details>
    <summary>
    Просмотр содержимого первичного индекса
    </summary>
    <p>

На самоуправляемом кластере ClickHouse мы можем использовать <a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">табличную функцию file</a> для просмотра содержимого первичного индекса нашей примерной таблицы.

Для этого сначала необходимо скопировать файл первичного индекса в <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a> узла из работающего кластера:
<ul>
<li>Шаг 1: Получить путь к части, содержащей файл первичного индекса</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

возвращает `/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4` на тестовой машине.

<li>Шаг 2: Получить user_files_path</li>
<a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">Путь по умолчанию для user_files_path</a> в Linux:
`/var/lib/clickhouse/user_files/`

и в Linux вы можете проверить, изменился ли он: `$ grep user_files_path /etc/clickhouse-server/config.xml`

На тестовой машине путь - `/Users/tomschreiber/Clickhouse/user_files/`


<li>Шаг 3: Скопировать файл первичного индекса в user_files_path</li>

`cp /Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4/primary.idx /Users/tomschreiber/Clickhouse/user_files/primary-hits_UserID_URL.idx`

</ul>

<br/>
Теперь мы можем просмотреть содержимое первичного индекса через SQL:
<ul>
<li>Получить количество записей</li>
`
SELECT count( )<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String');
`
возвращает `1083`

<li>Получить первые две метки индекса</li>
`
SELECT UserID, URL<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 0, 2;
`

возвращает

`
240923, http://showtopics.html%3...<br/>
4073710, http://mk.ru&pos=3_0
`

<li>Получить последнюю метку индекса</li>
`
SELECT UserID, URL FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 1082, 1;
`
возвращает
`
4292714039 │ http://sosyal-mansetleri...
`
</ul>
<br/>
Это точно соответствует нашей диаграмме содержимого первичного индекса для нашей примерной таблицы:
</p>
</details>

Записи первичного ключа называются метками индекса, потому что каждая запись индекса обозначает начало конкретного диапазона данных. В частности, для примерной таблицы:
- метки индекса UserID:

  Сохраненные значения `UserID` в первичном индексе отсортированы в порядке возрастания.<br/>
  Следовательно, ‘метка 1’ на диаграмме выше указывает на то, что значения `UserID` всех строк таблицы в грануле 1 и во всех последующих гранулах гарантированно больше или равны 4.073.710.

  [Как мы увидим позже](#the-primary-index-is-used-for-selecting-granules), этот глобальный порядок позволяет ClickHouse <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">использовать алгоритм бинарного поиска</a> по меткам индекса для первого столбца ключа, когда запрос фильтрует по первому столбцу первичного ключа.

- метки индекса URL:

  Достаточно похожая кардинальность столбцов первичного ключа `UserID` и `URL` означает, что метки индекса для всех ключевых столбцов после первого столбца в общем случае только указывают на диапазон данных, пока значение предыдущего столбца ключа остается одинаковым для всех строк таблицы как минимум в текущей грануле.<br/>
  Например, поскольку значения UserID меток 0 и 1 различны на диаграмме выше, ClickHouse не может предположить, что все значения URL всех строк таблицы в грануле 0 больше или равны `'http://showtopics.html%3...'`. Однако, если бы значения UserID меток 0 и 1 были одинаковыми на диаграмме выше (что означало бы, что значение UserID остается одинаковым для всех строк таблицы в грануле 0), ClickHouse мог бы предположить, что все значения URL всех строк таблицы в грануле 0 больше или равны `'http://showtopics.html%3...'`.

  Мы обсудим последствия этого для производительности выполнения запросов более подробно позже.
### Первичный индекс используется для выбора гранул {#the-primary-index-is-used-for-selecting-granules}

Теперь мы можем выполнять наши запросы с поддержкой первичного индекса.

Следующий запрос вычисляет 10 наиболее часто кликаемых URL для UserID 749927693.

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

10 строк в наборе. Время выполнения: 0.005 сек.

# highlight-next-line
Обработано 8.19 тысячи строк,
740.18 KB (1.53 миллиона строк/с., 138.59 MB/с.)
```

Вывод для клиента ClickHouse теперь показывает, что вместо полной выборки таблицы было обработано только 8.19 тысячи строк.

Если включено <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">логирование трассировки</a>, то в файле журнала сервера ClickHouse показывается, что ClickHouse выполнял <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">бинарный поиск</a> по 1083 меткам индекса UserID, чтобы идентифицировать гранулы, которые могут содержать строки со значением столбца UserID `749927693`. Это требует 19 шагов со средней временной сложностью `O(log2 n)`:
```response
...Executor): Условие ключа: (столбец 0 в [749927693, 749927693])

# highlight-next-line
...Executor): Выполняется бинарный поиск по диапазону индекса для части all_1_9_2 (1083 метки)
...Executor): Найдена (ЛЕВАЯ) граница метки: 176
...Executor): Найдена (ПРАВАЯ) граница метки: 177
...Executor): Найден непрерывный диапазон за 19 шагов
...Executor): Выбрано 1/1 частей по ключу раздела, 1 часть по первичному ключу,

# highlight-next-line
              1/1083 меток по первичному ключу, 1 метка для чтения из 1 диапазонов
...Чтение ...примерно 8192 строки, начиная с 1441792
```

Мы можем видеть в журнале трассировки выше, что одна метка из 1083 существующих меток удовлетворяла запросу.

<details>
    <summary>
    Подробности журнала трассировки
    </summary>
    <p>

Метку 176 идентифицировали (согласно 'найденной левой границе метки', включая, 'найденной правой границе метки', исключая), и поэтому все 8192 строки из гранулы 176 (которая начинается с 1.441.792 - мы увидим это позже в этом руководстве) затем передаются в ClickHouse для нахождения фактических строк со значением столбца UserID `749927693`.
</p>
</details>

Мы также можем воспроизвести это, используя <a href="https://clickhouse.com/docs/sql-reference/statements/explain/" target="_blank">предложение EXPLAIN</a> в нашем примерном запросе:
```sql
EXPLAIN indexes = 1
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

Ответ выглядит следующим образом:

```response
┌─explain───────────────────────────────────────────────────────────────────────────────┐
│ Выражение (Проекция)                                                                │
│   LIMIT (предварительный LIMIT (без OFFSET))                                          │
│     Сортировка (Сортировка для ORDER BY)                                            │
│       Выражение (Перед ORDER BY)                                                    │
│         Агрегирование                                                                │
│           Выражение (Перед GROUP BY)                                                │
│             Фильтр (WHERE)                                                          │
│               УстановкаКвотыИЛимитов (Установить лимиты и квоту после чтения из хранилища) │
│                 ЧтениеИзMergeTree                                                   │
│                 Индексы:                                                            │
│                   ПервичныйКлюч                                                      │
│                     Ключи:                                                           │
│                       UserID                                                          │
│                     Условие: (UserID в [749927693, 749927693])                       │
│                     Части: 1/1                                                        │

# highlight-next-line
│                     Гранулы: 1/1083                                                  │
└───────────────────────────────────────────────────────────────────────────────────────┘

16 строк в наборе. Время выполнения: 0.003 сек.
```
Вывод клиента показывает, что одна из 1083 гранул была выбрана как возможно содержащая строки со значением столбца UserID `749927693`.

:::note Заключение
Когда запрос фильтрует по столбцу, который является частью составного ключа и является первым столбцом ключа, ClickHouse выполняет бинарный поиск по меткам индекса столбца ключа.
:::

<br/>

Как обсуждалось выше, ClickHouse использует свой разреженный первичный индекс для быстрого (через бинарный поиск) выбора гранул, которые могут содержать строки, соответствующие запросу.


Это первая стадия (выбор гранул) выполнения запроса ClickHouse.

На второй стадии (чтение данных) ClickHouse находит выбранные гранулы, чтобы передать все их строки в движок ClickHouse для поиска строк, которые действительно соответствуют запросу.

Эту вторую стадию мы обсудим более подробно в следующем разделе.
### Файлы меток используются для локализации гранул {#mark-files-are-used-for-locating-granules}

Следующая диаграмма иллюстрирует часть файла первичного индекса для нашей таблицы.

<Image img={sparsePrimaryIndexes04} size="md" alt="Sparse Primary Indices 04" background="white"/>

Как обсуждалось выше, через бинарный поиск по 1083 меткам индекса UserID была идентифицирована метка 176. Следовательно, ее соответствующая гранула 176 может содержать строки со значением столбца UserID 749.927.693.

<details>
    <summary>
    Подробности выбора гранулы
    </summary>
    <p>

На диаграмме выше показано, что метка 176 является первой записью индекса, где минимальное значение UserID соответствующей гранулы 176 меньше 749.927.693, а минимальное значение UserID гранулы 177 для следующей метки (метка 177) больше этого значения. Поэтому только соответствующая гранула 176 для метки 176 может содержать строки со значением столбца UserID 749.927.693.
</p>
</details>

Чтобы подтвердить (или опровергнуть), что какие-либо строки в грануле 176 содержат значение столбца UserID 749.927.693, все 8192 строки, принадлежащие этой грануле, должны быть переданы в ClickHouse.

Для достижения этого ClickHouse нужно знать физическое местоположение гранулы 176.

В ClickHouse физические расположения всех гранул для нашей таблицы хранятся в файлах меток. Подобно файлам данных, для каждого столбца таблицы существует один файл меток.

Следующая диаграмма показывает три файла меток `UserID.mrk`, `URL.mrk`, и `EventTime.mrk`, которые хранят физические расположения гранул для столбцов `UserID`, `URL` и `EventTime` таблицы.

<Image img={sparsePrimaryIndexes05} size="md" alt="Sparse Primary Indices 05" background="white"/>

Мы уже обсудили, как первичный индекс является плоским несжатым файлом массива (primary.idx), содержащим метки индекса, номера которых начинаются с 0.

Аналогично, файл меток также является плоским несжатым файлом массива (*.mrk), содержащим метки, номера которых начинаются с 0.

Как только ClickHouse идентифицирует и выберет метку индекса для гранулы, которая может содержать соответствующие строки для запроса, может быть выполнен поиск по позиционному массиву в файлах меток для получения физических расположений гранулы.

Каждая запись файла меток для конкретного столбца хранит два местоположения в форме смещений:

- Первое смещение ('block_offset' на диаграмме выше) указывает на <a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">блок</a> в <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">сжатом</a> файле данных столбца, который содержит сжатую версию выбранной гранулы. Этот сжатый блок потенциально может содержать несколько сжатых гранул. На чтение найденный сжатый файл блока распаковывается в основную память.

- Второе смещение ('granule_offset' на диаграмме выше) из файла меток предоставляет расположение гранулы внутри распакованных данных блока.

Все 8192 строки, относящиеся к найденной распакованной грануле, затем передаются в ClickHouse для дальнейшей обработки.

:::note

- Для таблиц с [широким форматом](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) и без [адаптивной гранулярности индекса](/whats-new/changelog/2019.md/#experimental-features-1) ClickHouse использует файлы меток `.mrk`, как показано выше, которые содержат записи с двумя адресами длиной 8 байт для каждой записи. Эти записи - физические расположения гранул, которые все имеют одинаковый размер.

Гранулярность индекса по умолчанию является адаптивной (/operations/settings/merge-tree-settings#index_granularity_bytes), но для нашей примерной таблицы мы отключили адаптивную гранулярность индекса (для упрощения обсуждений в этом руководстве и воспроизводимости диаграмм и результатов). Наша таблица использует широкий формат, потому что объем данных превышает [min_bytes_for_wide_part](/operations/settings/merge-tree-settings#min_bytes_for_wide_part) (который по умолчанию составляет 10 МБ для самоуправляемых кластеров).

- Для таблиц с широким форматом и с адаптивной гранулярностью индекса ClickHouse использует файлы меток `.mrk2`, которые содержат аналогичные записи для файлов меток `.mrk`, но с дополнительным третьим значением для каждой записи: количество строк гранулы, к которой относится текущая запись.

- Для таблиц с [компактным форматом](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) ClickHouse использует файлы меток `.mrk3`.

:::

:::note Почему файлы меток

Почему первичный индекс не содержит напрямую физических расположений гранул, которые соответствуют меткам индекса?

Потому что на таком очень большом масштабе, для которого разработан ClickHouse, важно быть очень эффективным в использовании диска и памяти.

Файл первичного индекса должен помещаться в основную память.

Для нашего примерного запроса ClickHouse воспользовался первичным индексом и выбрал одну гранулу, которая может содержать строки, соответствующие нашему запросу. Только для этой одной гранулы ClickHouse затем нужны физические местоположения, чтобы передать соответствующие строки для дальнейшей обработки.

Кроме того, эта информация о смещении необходима только для столбцов UserID и URL.

Информация о смещении не нужна для столбцов, не используемых в запросе, например, для `EventTime`.

Для нашего примерного запроса ClickHouse нуждается только в двух физических местоположениях для гранулы 176 в файле данных UserID (UserID.bin) и двух физических местоположениях для гранулы 176 в файле данных URL (URL.bin).

Промежуточная информация, предоставляемая файлами меток, позволяет избежать хранения непосредственно в первичном индексе записей физических местоположений всех 1083 гранул для всех трех столбцов: таким образом избегая наличия ненужных (потенциально неиспользуемых) данных в основной памяти.
:::

Следующая диаграмма и текст ниже иллюстрируют, как для нашего примерного запроса ClickHouse локализует гранулу 176 в файле данных UserID.bin.

<Image img={sparsePrimaryIndexes06} size="md" alt="Sparse Primary Indices 06" background="white"/>

Мы ранее обсуждали, что ClickHouse выбрал метку 176 первичного индекса и, следовательно, гранулу 176 как возможно содержащую строки, соответствующие нашему запросу.

Теперь ClickHouse использует выбранный номер метки (176) из индекса для поиска по позиционному массиву в файле меток UserID.mrk, чтобы получить два смещения для локализации гранулы 176.

Как показано, первое смещение указывает на сжатый файл блока в файле данных UserID.bin, который, в свою очередь, содержит сжатую версию гранулы 176.

После того, как расположенный файл блока распакован в основную память, второе смещение из файла меток может быть использовано для локализации гранулы 176 в распакованных данных.

ClickHouse необходимо локализовать (и передать все значения из) гранулы 176 как из файла данных UserID.bin, так и из файла данных URL.bin, чтобы выполнить наш примерный запрос (10 наиболее кликаемых URL для интернет-пользователя с UserID 749.927.693).

На диаграмме выше показано, как ClickHouse локализует гранулу для файла данных UserID.bin.

Параллельно ClickHouse делает то же самое для гранулы 176 для файла данных URL.bin. Две соответствующие гранулы совмещаются и передаются в движок ClickHouse для дальнейшей обработки, т.е. агрегации и подсчета значений URL по группам для всех строк, где UserID равен 749.927.693, прежде чем, наконец, выводить 10 крупнейших групп URL в порядке убывания их количества.
## Использование нескольких первичных индексов {#using-multiple-primary-indexes}

<a name="filtering-on-key-columns-after-the-first"></a>
### Вторичные ключевые столбцы могут (не) быть неэффективными {#secondary-key-columns-can-not-be-inefficient}


Когда запрос фильтрует по столбцу, который является частью составного ключа и является первым ключевым столбцом, [то ClickHouse выполняет бинарный поиск по меткам индекса столбца ключа](#the-primary-index-is-used-for-selecting-granules).

Но что происходит, когда запрос фильтрует по столбцу, который является частью составного ключа, но не является первым ключевым столбцом?

:::note
Мы обсуждаем сценарий, когда запрос явно не фильтрует по первому ключевому столбцу, а по вторичному ключевому столбцу.

Когда запрос фильтрует как по первому ключевому столбцу, так и по любому ключевому столбцу после первого, ClickHouse выполняет бинарный поиск по меткам индекса первого ключевого столбца.
:::

<br/>
<br/>

<a name="query-on-url"></a>
Мы используем запрос, который вычисляет 10 пользователей, которые чаще всего кликали по URL "http://public_search":

```sql
SELECT UserID, count(UserID) AS Count
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

Ответ: <a name="query-on-url-slow"></a>
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

10 строк в наборе. Время выполнения: 0.086 сек.

# highlight-next-line
Обработано 8.81 миллиона строк,
799.69 MB (102.11 миллиона строк/с., 9.27 GB/с.)
```

Вывод клиента указывает на то, что ClickHouse почти выполнил полную выборку таблицы, несмотря на то, что [столбец URL является частью составного первичного ключа](#a-table-with-a-primary-key)! ClickHouse считывает 8.81 миллиона строк из 8.87 миллиона строк таблицы.

Если [trace_logging](/operations/server-configuration-parameters/settings#logger) включен, то в файле журнала сервера ClickHouse показывается, что ClickHouse использовал <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">общий поиск исключений</a> по 1083 меткам индекса URL для идентификации гранул, которые могут содержать строки со значением столбца URL "http://public_search":
```response
...Executor): Условие ключа: (столбец 1 в ['http://public_search',
                                           'http://public_search'])

# highlight-next-line
...Executor): Использован общий поиск исключений по индексу для части all_1_9_2
              с 1537 шагами
...Executor): Выбрано 1/1 частей по ключу раздела, 1 часть по первичному ключу,

# highlight-next-line
              1076/1083 меток по первичному ключу, 1076 меток для чтения из 5 диапазонов
...Executor): Чтение примерно 8814592 строк с 10 потоками
```
Мы можем видеть в образце журнала трассировки выше, что 1076 (по меткам) из 1083 гранул были выбраны как возможно содержащие строки со значением URL, соответствующим "http://public_search".

Это приводит к тому, что в движок ClickHouse передаются 8.81 миллиона строк (параллельно с использованием 10 потоков), чтобы идентифицировать строки, которые действительно содержат значение URL "http://public_search".

Однако, как мы увидим позже, только 39 гранул из выбранных 1076 гранул действительно содержат соответствующие строки.

В то время как первичный индекс на основе составного первичного ключа (UserID, URL) оказался весьма полезным для ускорения запросов, фильтрующих строки со специфическим значением UserID, индекс не предоставляет значительной помощи с ускорением запроса, фильтрующего строки со специфическим значением URL.

Причина этого заключается в том, что столбец URL не является первым ключевым столбцом, и поэтому ClickHouse использует алгоритм общего поиска исключений (вместо бинарного поиска) по меткам индекса столбца URL, и **эффективность этого алгоритма зависит от разницы кардинальности** между столбцом URL и его предыдущим столбцом ключа UserID.

Чтобы проиллюстрировать это, мы предоставим некоторые детали о том, как работает общий алгоритм поиска исключений.

<a name="generic-exclusion-search-algorithm"></a>
### Алгоритм общего поиска исключений {#generic-exclusion-search-algorithm}

Следующее иллюстрирует, как <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank">алгоритм общего поиска исключений ClickHouse</a> работает, когда гранулы выбираются с помощью второго столбца, где предыдущий столбец ключа имеет низкую или высокую кардинальность.

В качестве примера для обоих случаев мы предположим:
- запрос, который ищет строки со значением URL = "W3".
- абстрактная версия нашей таблицы hits с упрощенными значениями для UserID и URL.
- тот же составной первичный ключ (UserID, URL) для индекса. Это означает, что строки сначала упорядочиваются по значениям UserID. Строки с одинаковыми значениями UserID затем упорядочиваются по URL.
- размер гранулы составляет два, т.е. каждая гранула содержит две строки.

Мы отметили значения ключевых столбцов для первых строк каждой гранулы оранжевым цветом на диаграммах ниже.

**Предыдущий ключевой столбец имеет низкую(ю) кардинальность**<a name="generic-exclusion-search-fast"></a>

Предположим, что UserID имел низкую кардинальность. В этом случае, вероятно, что одно и то же значение UserID распределено по нескольким строкам таблицы и гранулам, и поэтому меткам индекса. Для меток индекса с одинаковым UserID значения URL для меток индекса упорядочены по возрастанию (поскольку строки таблицы упорядочены сначала по UserID, а затем по URL). Это позволяет эффективно фильтровать, как описано ниже:

<Image img={sparsePrimaryIndexes07} size="md" alt="Sparse Primary Indices 06" background="white"/>

Существует три различных сценария для процесса выбора гранул для наших абстрактных образцов данных на диаграмме выше:

1.  Метка индекса 0, для которой **значение URL меньше W3 и для которой значение URL непосредственно следующей метки также меньше W3** может быть исключена, потому что метки 0 и 1 имеют одинаковое значение UserID. Заметьте, что это условие исключения гарантирует, что гранула 0 полностью состоит из значений UserID U1, так что ClickHouse может предположить, что также максимальное значение URL в грануле 0 меньше W3 и исключить гранулу.

2. Метка индекса 1, для которой **значение URL меньше (или равно) W3 и для которой значение URL непосредственно следующей метки больше (или равно) W3** выбрана, поскольку это означает, что гранула 1 может содержать строки со значением URL W3.

3. Метки индекса 2 и 3, для которых **значение URL больше W3** можно исключить, так как метки индекса первичного индекса хранят значения ключевых столбцов для первой строки таблицы для каждой гранулы, а строки таблицы отсортированы на диске по значениям ключевых столбцов. Поэтому гранулы 2 и 3 не могут содержать значение URL W3.

**Предыдущий ключевой столбец имеет высокую(ю) кардинальность**<a name="generic-exclusion-search-slow"></a>

Когда UserID имеет высокую кардинальность, то маловероятно, что одно и то же значение UserID распределено по нескольким строкам таблицы и гранулам. Это означает, что значения URL для меток индекса не убывают монотонно:

<Image img={sparsePrimaryIndexes08} size="md" alt="Sparse Primary Indices 06" background="white"/>

Как мы видим на диаграмме выше, все показанные метки, чьи значения URL меньше W3, выбираются для потоковой передачи строк соответствующей гранулы в движок ClickHouse.

Это происходит потому, что, хотя все метки индекса на диаграмме попадают в сценарий 1, описанный выше, они не удовлетворяют указанному условию исключения, что *непосредственно следующая метка имеет то же значение UserID, что и текущая метка*, и потому их нельзя исключить.

Например, рассмотрим метку индекса 0, для которой **значение URL меньше W3 и для которой значение URL непосредственно следующей метки также меньше W3**. Это не может быть исключено, поскольку непосредственно следующая метка 1 *не* имеет то же значение UserID, что и текущая метка 0.

В конечном итоге это предотвращает ClickHouse от того, чтобы делать предположения о максимальном значении URL в грануле 0. Вместо этого он должен предположить, что гранула 0 потенциально может содержать строки со значением URL W3 и вынужден выбирать метку 0.

Тот же сценарий верен и для меток 1, 2 и 3.

:::note Заключение
<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">Алгоритм общего поиска исключений</a>, который ClickHouse использует вместо <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">алгоритма бинарного поиска</a>, когда запрос фильтрует по столбцу, который является частью составного ключа, но не является первым ключевым столбцом, наиболее эффективен, когда предыдущий ключевой столбец имеет низкую кардинальность.
:::

В нашем наборе примеров обе ключевые колонки (UserID, URL) имеют похожую высокую кардинальность, и, как было объяснено, алгоритм общего поиска исключений не очень эффективен, когда предыдущий ключевой столбец столбца URL имеет высокую или подобную кардинальность.
### Примечание о индексе пропуска данных {#note-about-data-skipping-index}

Из-за сходной высокой кардинальности UserID и URL, наша [фильтрация запросов по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) также не будет значительно выигрывать от создания [вторичного индекса пропуска данных](./skipping-indexes.md) по столбцу URL в нашей [таблице со сложным первичным ключом (UserID, URL)](#a-table-with-a-primary-key).

Например, эти два утверждения создают и заполняют [индекс minmax](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) для пропуска данных по столбцу URL в нашей таблице:
```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```
ClickHouse теперь создал дополнительный индекс, который хранит - по группе из 4 последовательных [гранул](#data-is-organized-into-granules-for-parallel-data-processing) (обратите внимание на условие `GRANULARITY 4` в инструкции `ALTER TABLE` выше) - минимальное и максимальное значение URL:

<Image img={sparsePrimaryIndexes13a} size="md" alt="Sparse Primary Indices 13a" background="white"/>

Первое значение индекса («метка 0» на диаграмме выше) хранит минимальные и максимальные значения URL для [строк, принадлежащих первым 4 гранулам нашей таблицы](#data-is-organized-into-granules-for-parallel-data-processing).

Вторая метка индекса («метка 1») хранит минимальные и максимальные значения URL для строк, принадлежащих следующим 4 гранулам нашей таблицы, и так далее.

(ClickHouse также создал специальный [файл метки](#mark-files-are-used-for-locating-granules) для индекса пропуска данных для [локализации](#mark-files-are-used-for-locating-granules) групп гранул, связанных с метками индекса.)

Из-за сходной высокой кардинальности UserID и URL, этот вторичный индекс пропуска данных не сможет помочь исключить гранулы, которые будут выбраны, когда выполняется наша [фильтрация запросов по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient).

Конкретное значение URL, которое ищет запрос (т.е. 'http://public_search'), вероятно, находится между минимальным и максимальным значением, хранящимся индексом для каждой группы гранул, что приводит к тому, что ClickHouse вынужден выбирать группу гранул (поскольку они могут содержать строку(и), соответствующую запросу).

### Необходимость использования нескольких первичных индексов {#a-need-to-use-multiple-primary-indexes}

Как следствие, если мы хотим значительно ускорить наш образец запроса, который фильтрует строки с конкретным URL, то нам нужно использовать первичный индекс, оптимизированный под этот запрос.

Если, кроме того, мы хотим сохранить хорошую производительность нашего образца запроса, который фильтрует строки с конкретным UserID, то нам нужно использовать несколько первичных индексов.

Ниже показаны способы достижения этого.

<a name="multiple-primary-indexes"></a>
### Варианты создания дополнительных первичных индексов {#options-for-creating-additional-primary-indexes}

Если мы хотим значительно ускорить оба наших образца запросов - один, который фильтрует строки с конкретным UserID, и другой, который фильтрует строки с конкретным URL - то нам нужно использовать несколько первичных индексов, применяя один из этих трех вариантов:

- Создание **второй таблицы** с другим первичным ключом.
- Создание **материализованного представления** в нашей существующей таблице.
- Добавление **проекции** в нашу существующую таблицу.

Все три варианта фактически дублируют наши образцы данных в дополнительной таблице, чтобы реорганизовать первичный индекс таблицы и порядок сортировки строк.

Тем не менее, три варианта различаются по тому, насколько прозрачно эта дополнительная таблица для пользователя относительно маршрутизации запросов и инструкций вставки.

При создании **второй таблицы** с другим первичным ключом запросы должны явно отправляться в версию таблицы, наилучшим образом подходящую для запроса, и новые данные должны вставляться явно в обе таблицы, чтобы поддерживать их синхронизацию:

<Image img={sparsePrimaryIndexes09a} size="md" alt="Sparse Primary Indices 09a" background="white"/>

С **материализованным представлением** дополнительная таблица создается неявно, и данные автоматически синхронизируются между обеими таблицами:

<Image img={sparsePrimaryIndexes09b} size="md" alt="Sparse Primary Indices 09b" background="white"/>

А **проекция** является наиболее прозрачным вариантом, поскольку наряду с автоматическим поддержанием неявно созданной (и скрытой) дополнительной таблицы в синхронизации с изменениями данных, ClickHouse автоматически выберет наиболее эффективную версию таблицы для запросов:

<Image img={sparsePrimaryIndexes09c} size="md" alt="Sparse Primary Indices 09c" background="white"/>

В следующем разделе мы подробно обсудим три этих варианта создания и использования нескольких первичных индексов на реальных примерах.

<a name="multiple-primary-indexes-via-secondary-tables"></a>
### Вариант 1: Вторичные таблицы {#option-1-secondary-tables}

<a name="secondary-table"></a>
Мы создаем новую дополнительную таблицу, где изменяем порядок ключевых столбцов (по сравнению с нашей оригинальной таблицей) в первичном ключе:

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
SETTINGS index_granularity = 8192, index_granularity_bytes = 0, compress_primary_key = 0;
```

Вставляем все 8.87 миллиона строк из нашей [оригинальной таблицы](#a-table-with-a-primary-key) в дополнительную таблицу:

```sql
INSERT INTO hits_URL_UserID
SELECT * from hits_UserID_URL;
```

Ответ выглядит следующим образом:

```response
Ok.

0 rows in set. Elapsed: 2.898 sec. Processed 8.87 million rows, 838.84 MB (3.06 million rows/s., 289.46 MB/s.)
```

И наконец, оптимизируем таблицу:
```sql
OPTIMIZE TABLE hits_URL_UserID FINAL;
```

Поскольку мы изменили порядок столбцов в первичном ключе, вставленные строки теперь хранятся на диске в другом лексикографическом порядке (по сравнению с нашей [оригинальной таблицей](#a-table-with-a-primary-key)), и, следовательно, также 1083 гранулы этой таблицы содержат другие значения, чем раньше:

<Image img={sparsePrimaryIndexes10} size="md" alt="Sparse Primary Indices 10" background="white"/>

Это результирующий первичный ключ:

<Image img={sparsePrimaryIndexes11} size="md" alt="Sparse Primary Indices 11" background="white"/>

Который теперь можно использовать для значительного ускорения выполнения нашего примера запроса, фильтрующего по столбцу URL, чтобы вычислить 10 пользователей, которые чаще всего щелкнули по URL "http://public_search":
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
<a name="query-on-url-fast"></a>

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

Теперь, вместо [почти полного сканирования таблицы](/guides/best-practices/sparse-primary-indexes#efficient-filtering-on-secondary-key-columns), ClickHouse выполнил этот запрос гораздо эффективнее.

С первичным индексом из [оригинальной таблицы](#a-table-with-a-primary-key), где UserID был первым, а URL вторым ключевым столбцом, ClickHouse использовал [алгоритм общего исключения](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) для выполнения этого запроса, и это было не очень эффективно из-за сходной высокой кардинальности UserID и URL.

С URL в качестве первого столбца в первичном индексе, ClickHouse теперь выполняет <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">бинарный поиск</a> по меткам индекса.
Соответствующая трассировочная запись в файле журналов сервера ClickHouse подтверждает это:
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
ClickHouse выбрал всего 39 меток индекса вместо 1076, когда использовался общий алгоритм исключений.

Обратите внимание, что дополнительная таблица оптимизирована для ускорения выполнения нашего примера запроса, фильтрующего по `UserIDs`.

Подобно [плохой производительности](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) этого запроса с нашей [оригинальной таблицей](#a-table-with-a-primary-key), наш [пример запроса, фильтрующего по `UserIDs`](#the-primary-index-is-used-for-selecting-granules), не будет выполняться очень эффективно с новой дополнительной таблицей, потому что UserID теперь является вторым ключевым столбцом в первичном индексе этой таблицы, и поэтому ClickHouse будет использовать общий алгоритм исключения для выбора гранул, что [не очень эффективно при сходной высокой кардинальности](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) UserID и URL.
Откройте подробную информацию в блоке сведений.

<details>
    <summary>
    Фильтрация запросов по UserIDs теперь имеет плохую производительность<a name="query-on-userid-slow"></a>
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

Теперь у нас есть две таблицы. Оптимизированные для ускорения запросов, фильтрующих по `UserIDs`, и для ускорения запросов, фильтрующих по URL, соответственно:
### Вариант 2: Материализованные представления {#option-2-materialized-views}

Создаем [материализованное представление](/sql-reference/statements/create/view.md) в нашей существующей таблице.
```sql
CREATE MATERIALIZED VIEW mv_hits_URL_UserID
ENGINE = MergeTree()
PRIMARY KEY (URL, UserID)
ORDER BY (URL, UserID, EventTime)
POPULATE
AS SELECT * FROM hits_UserID_URL;
```

Ответ выглядит так:

```response
Ok.

0 rows in set. Elapsed: 2.935 sec. Processed 8.87 million rows, 838.84 MB (3.02 million rows/s., 285.84 MB/s.)
```

:::note
- мы изменяем порядок ключевых столбцов (по сравнению с нашей [оригинальной таблицей](#a-table-with-a-primary-key) ) в первичном ключе представления
- материализованное представление поддерживается **неявно созданной таблицей**, порядок строк и первичный индекс которой основаны на определении первичного ключа
- неявно созданная таблица отображается при выполнении запроса `SHOW TABLES` и имеет имя, начинающееся с `.inner`
- также можно сначала явно создать вспомогательную таблицу для материализованного представления, а затем представление может ориентироваться на эту таблицу через [клаузу `TO [db].[table]`](/sql-reference/statements/create/view.md)
- мы используем ключевое слово `POPULATE`, чтобы сразу заполнить неявно созданную таблицу всеми 8.87 миллионами строк из исходной таблицы [hits_UserID_URL](#a-table-with-a-primary-key)
- если новые строки вставляются в исходную таблицу hits_UserID_URL, то эти строки автоматически также вставляются в неявно созданную таблицу
- Эффективно неявно созданная таблица имеет тот же порядок строк и первичный индекс, что и [вторичная таблица, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables):

<Image img={sparsePrimaryIndexes12b1} size="md" alt="Sparse Primary Indices 12b1" background="white"/>

ClickHouse хранит [файлы данных столбцов](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin), [файлы меток](#mark-files-are-used-for-locating-granules) (*.mrk2) и [первичный индекс](#the-primary-index-has-one-entry-per-granule) (primary.idx) неявно созданной таблицы в специальной папке в директории данных сервера ClickHouse:

<Image img={sparsePrimaryIndexes12b2} size="md" alt="Sparse Primary Indices 12b2" background="white"/>

:::

Неявно созданная таблица (и ее первичный индекс), поддерживающие материализованное представление, теперь могут быть использованы для значительного ускорения выполнения нашего примера запроса, фильтрующего по столбцу URL:
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

10 rows in set. Elapsed: 0.026 sec.

# highlight-next-line
Processed 335.87 thousand rows,
13.54 MB (12.91 million rows/s., 520.38 MB/s.)
```

Поскольку эффективно неявно созданная таблица (и ее первичный индекс), поддерживающие материализованное представление, идентичны [вторичной таблице, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables), запрос выполняется так же эффективно, как с явно созданной таблицей.

Соответствующая трассировочная запись в файле журналов сервера ClickHouse подтверждает, что ClickHouse выполняет бинарный поиск по меткам индекса:

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
### Вариант 3: Проекции {#option-3-projections}

Создаем проекцию в нашей существующей таблице:
```sql
ALTER TABLE hits_UserID_URL
    ADD PROJECTION prj_url_userid
    (
        SELECT *
        ORDER BY (URL, UserID)
    );
```

И материализуем проекцию:
```sql
ALTER TABLE hits_UserID_URL
    MATERIALIZE PROJECTION prj_url_userid;
```

:::note
- проекция создает **скрытую таблицу**, порядок строк и первичный индекс которой основываются на заданном `ORDER BY` выражении проекции
- скрытая таблица не отображается при выполнении запроса `SHOW TABLES`
- мы используем ключевое слово `MATERIALIZE`, чтобы сразу заполнить скрытую таблицу всеми 8.87 миллионами строк из исходной таблицы [hits_UserID_URL](#a-table-with-a-primary-key)
- если новые строки вставляются в исходную таблицу hits_UserID_URL, то эти строки автоматически также вставляются в скрытую таблицу
- запрос всегда (синтаксически) нацелен на исходную таблицу hits_UserID_URL, но если порядок строк и первичный индекс скрытой таблицы позволяют более эффективное выполнение запроса, то будет использоваться именно эта скрытая таблица
- обратите внимание, что проекции не делают запросы, которые используют ORDER BY, более эффективными, даже если ORDER BY совпадает с оператором ORDER BY проекции (см. https://github.com/ClickHouse/ClickHouse/issues/47333)
- Эффективно неявно созданная скрытая таблица имеет тот же порядок строк и первичный индекс, что и [вторичная таблица, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables):

<Image img={sparsePrimaryIndexes12c1} size="md" alt="Sparse Primary Indices 12c1" background="white"/>

ClickHouse хранит [файлы данных столбцов](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin), [файлы меток](#mark-files-are-used-for-locating-granules) (*.mrk2) и [первичный индекс](#the-primary-index-has-one-entry-per-granule) (primary.idx) скрытой таблицы в специальной папке (выделенной желтым в скриншоте ниже) рядом с файлами данных, файлами меток и файлами первичного индекса исходной таблицы:

<Image img={sparsePrimaryIndexes12c2} size="sm" alt="Sparse Primary Indices 12c2" background="white"/>

:::

Скрытая таблица (и ее первичный индекс), созданные проекцией, теперь могут (неявно) использоваться для значительного ускорения выполнения нашего примера запроса, фильтрующего по столбцу URL. Обратите внимание, что запрос синтаксически нацелен на исходную таблицу проекции.
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

Поскольку эффективно скрытая таблица (и ее первичный индекс), созданные проекцией, идентичны [вторичной таблице, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables), запрос выполняется так же эффективно, как с явно созданной таблицей.

Соответствующая трассировочная запись в файле журналов сервера ClickHouse подтверждает, что ClickHouse выполняет бинарный поиск по меткам индекса:

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
### Резюме {#summary}

Первичный индекс нашей [таблицы со сложным первичным ключом (UserID, URL)](#a-table-with-a-primary-key) был очень полезен для ускорения [запроса, фильтрующего по UserID](#the-primary-index-is-used-for-selecting-granules). Но этот индекс не предоставляет значительной помощи в ускорении [запроса, фильтрующего по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient), несмотря на то, что столбец URL является частью составного первичного ключа.

И наоборот:
Первичный индекс нашей [таблицы со сложным первичным ключом (URL, UserID)](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) ускорял [запрос, фильтрующий по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient), но не предоставлял много поддержки для [запроса, фильтрующего по UserID](#the-primary-index-is-used-for-selecting-granules).

Из-за сходной высокой кардинальности столбцов первичного ключа UserID и URL, запрос, фильтрующий по второму ключевому столбцу [не приносит большого выигрыша от второго ключевого столбца в индексе](#generic-exclusion-search-algorithm).

Поэтому имеет смысл удалить второй ключевой столбец из первичного индекса (что приведет к уменьшению потребления памяти индекса) и вместо этого [использовать несколько первичных индексов](/guides/best-practices/sparse-primary-indexes#using-multiple-primary-indexes).

Тем не менее, если ключевые столбцы в составном первичном ключе имеют значительные различия в кардинальности, то [заказ столбцов первичного ключа](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) по кардинальности в порядке возрастания будет полезен для запросов.

Чем больше разница в кардинальности между ключевыми столбцами, тем больше значение имеет порядок этих столбцов в ключе. Мы продемонстрируем это в следующем разделе.

## Эффективный порядок ключевых столбцов {#ordering-key-columns-efficiently}

<a name="test"></a>

В составном первичном ключе порядок ключевых столбцов может значительно влиять на:
- эффективность фильтрации по вторичным ключевым столбцам в запросах, и
- коэффициент сжатия для файлов данных таблицы.

Чтобы продемонстрировать это, мы используем версию нашего [набора данных веб-трафика](#data-set), где каждая строка содержит три столбца, которые указывают, было ли обращение интернет 'пользователя' (столбец `UserID`) к URL (столбец `URL`) отмечено как бот-трафик (столбец `IsRobot`).

Мы используем составной первичный ключ, содержащий все три вышеупомянутых столбца, которые могут быть использованы для ускорения типичных запросов веб-аналитики, которые вычисляют:
- какова (процент) доля трафика к конкретному URL от ботов или
- насколько мы уверены, что конкретный пользователь является (не)ботом (какой процент трафика от этого пользователя (не) считается бот-трафиком)

Мы используем этот запрос для вычисления кардинальностей трех столбцов, которые мы хотим использовать в качестве ключевых столбцов в составном первичном ключе (обратите внимание, что мы используем [функцию таблицы URL](/sql-reference/table-functions/url.md) для выборки TSV-данных по требованию, не создавая локальную таблицу). Выполните этот запрос в `clickhouse client`:
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

Мы видим, что между кардинальностями есть большая разница, особенно между столбцами `URL` и `IsRobot`, и поэтому порядок этих столбцов в составном первичном ключе имеет значение как для эффективного ускорения запросов, фильтрующих по этим столбцам, так и для достижения оптимальных коэффициентов сжатия для файлов данных столбцов таблицы.

Чтобы продемонстрировать это, мы создаем две версии таблиц для нашего анализа трафика ботов:
- таблица `hits_URL_UserID_IsRobot` с составным первичным ключом `(URL, UserID, IsRobot)`, где мы располагаем ключевые столбцы по кардинальности в порядке убывания
- таблица `hits_IsRobot_UserID_URL` с составным первичным ключом `(IsRobot, UserID, URL)`, где ключевые столбцы располагаются по кардинальности в порядке возрастания

Создадим таблицу `hits_URL_UserID_IsRobot` с составным первичным ключом `(URL, UserID, IsRobot)`:
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

И заполним ее 8.87 миллиона строк:
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
0 rows in set. Elapsed: 104.729 sec. Processed 8.87 million rows, 15.88 GB (84.73 thousand rows/s., 151.64 MB/s.)
```

Далее создадим таблицу `hits_IsRobot_UserID_URL` с составным первичным ключом `(IsRobot, UserID, URL)`:
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
И заполним ее теми же 8.87 миллиона строк, которые мы использовали для заполнения предыдущей таблицы:

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
### Эффективная фильтрация по вторичным ключевым столбцам {#efficient-filtering-on-secondary-key-columns}

Когда запрос фильтрует по крайней мере одному столбцу, который является частью составного ключа, и этот столбец является первым ключевым столбцом, [то ClickHouse выполняет бинарный поиск по меткам индекса ключевого столбца](#the-primary-index-is-used-for-selecting-granules).

Когда запрос фильтрует (только) по столбцу, который является частью составного ключа, но не является первым ключевым столбцом, [то ClickHouse использует алгоритм общего исключения по меткам индекса ключевого столбца](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient).

Второй случай делает порядок ключевых столбцов в составном первичном ключе важным для эффективности [алгоритма общего исключения](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444).

Это запрос, фильтрующий по столбцу `UserID` таблицы, где мы упорядочили ключевые столбцы `(URL, UserID, IsRobot)` по кардинальности в порядке убывания:
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

1 row in set. Elapsed: 0.026 sec.

# highlight-next-line
Processed 7.92 million rows,
31.67 MB (306.90 million rows/s., 1.23 GB/s.)
```

Это тот же запрос к таблице, где мы упорядочили ключевые столбцы `(IsRobot, UserID, URL)` по кардинальности в порядке возрастания:
```sql
SELECT count(*)
FROM hits_IsRobot_UserID_URL
WHERE UserID = 112304
```
Ответ:
```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.003 sec.

# highlight-next-line
Processed 20.32 thousand rows,
81.28 KB (6.61 миллион строк/с., 26.44 MB/с.)
```

Мы можем видеть, что выполнение запроса значительно более эффективно и быстрее в таблице, где мы упорядочили ключевые столбцы по кардинальности в порядке возрастания.

Причина этого заключается в том, что [алгоритм общего исключения](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444) работает наиболее эффективно, когда [гранулы](#the-primary-index-is-used-for-selecting-granules) выбираются через вторичный ключевой столбец, где предшествующий ключевой столбец имеет более низкую кардинальность. Мы подробно иллюстрировали это в [предыдущем разделе](#generic-exclusion-search-algorithm) данного руководства.
### Оптимальное соотношение сжатия файлов данных {#optimal-compression-ratio-of-data-files}

Этот запрос сравнивает соотношение сжатия столбца `UserID` между двумя таблицами, которые мы создали выше:

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
Вот ответ:
```response
┌─Table───────────────────┬─Column─┬─Uncompressed─┬─Compressed─┬─Ratio─┐
│ hits_URL_UserID_IsRobot │ UserID │ 33.83 MiB    │ 11.24 MiB  │     3 │
│ hits_IsRobot_UserID_URL │ UserID │ 33.83 MiB    │ 877.47 KiB │    39 │
└─────────────────────────┴────────┴──────────────┴────────────┴───────┘

2 строки в наборе. Затрачено: 0.006 сек.
```
Мы видим, что соотношение сжатия для столбца `UserID` значительно выше для таблицы, в которой мы упорядочили ключевые столбцы `(IsRobot, UserID, URL)` по возрастанию кардинальности.

Хотя в обеих таблицах хранится точно одинаковые данные (мы вставили одни и те же 8.87 миллиона строк в обе таблицы), порядок ключевых столбцов в составном первичном ключе существенно влияет на то, сколько дискового пространства требует <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">сжатые</a> данные в [файлах данных столбцов](#data-is-stored-on-disk-ordered-by-primary-key-columns) таблицы:
- в таблице `hits_URL_UserID_IsRobot` с составным первичным ключом `(URL, UserID, IsRobot)`, где мы упорядочили ключевые столбцы по кардинальности по убыванию, файл данных `UserID.bin` занимает **11.24 MiB** дискового пространства
- в таблице `hits_IsRobot_UserID_URL` с составным первичным ключом `(IsRobot, UserID, URL)`, где мы упорядочили ключевые столбцы по кардинальности по возрастанию, файл данных `UserID.bin` занимает только **877.47 KiB** дискового пространства

Хорошее соотношение сжатия для данных столбца таблицы на диске не только экономит место на диске, но также делает запросы (особенно аналитические), которые требуют чтения данных из этого столбца, быстрее, так как требуется меньше ввод-вывод (I/O) для перемещения данных столбца с диска в основную память (кэш файлов операционной системы).

В следующем разделе мы иллюстрируем, почему выгодно для соотношения сжатия столбцов таблицы упорядочить первичные ключи по кардинальности в порядке возрастания.

Диаграмма ниже описывает порядок строк на диске для первичного ключа, где ключевые столбцы упорядочены по кардинальности в порядке возрастания:

<Image img={sparsePrimaryIndexes14a} size="md" alt="Sparse Primary Indices 14a" background="white"/>

Мы обсудили, что [данные строк таблицы хранятся на диске в порядке первичных ключей](#data-is-stored-on-disk-ordered-by-primary-key-columns).

На диаграмме выше строки таблицы (их значения столбцов на диске) сначала упорядочены по значению `cl`, а строки, имеющие одинаковое значение `cl`, упорядочены по значению `ch`. И поскольку первый ключевой столбец `cl` имеет низкую кардинальность, вероятно, что есть строки с одинаковым значением `cl`. И из-за этого также вероятно, что значения `ch` упорядочены (локально - для строк с одинаковым значением `cl`).

Если в столбце схожие данные находятся близко друг к другу, например, путем сортировки, то такие данные будут лучше сжиматься.
В общем, алгоритму сжатия выгодно продолжение длинного ряда данных (чем больше данных он видит, тем лучше для сжатия) и локальность (чем более схожи данные, тем лучше соотношение сжатия).

В отличие от диаграммы выше, диаграмма ниже описывает порядок строк на диске для первичного ключа, где ключевые столбцы упорядочены по кардинальности по убыванию:

<Image img={sparsePrimaryIndexes14b} size="md" alt="Sparse Primary Indices 14b" background="white"/>

Теперь строки таблицы сначала упорядочены по значению `ch`, а строки, имеющие одинаковое значение `ch`, упорядочены по значению `cl`.
Но поскольку первый ключевой столбец `ch` имеет высокую кардинальность, маловероятно, что на диске есть строки с одинаковым значением `ch`. И из-за этого также маловероятно, что значения `cl` упорядочены (локально - для строк с одинаковым значением `ch`).

Следовательно, значения `cl`, скорее всего, в случайном порядке и, следовательно, имеют плохую локальность и соотношение сжатия соответственно.
### Резюме {#summary-1}

Для эффективной фильтрации по вторичным ключевым столбцам в запросах и для соотношения сжатия файлов данных столбца таблицы выгодно упорядочивать столбцы в первичном ключе по кардинальности в порядке возрастания.
### Связанный контент {#related-content-1}
- Блог: [Ускорение ваших запросов ClickHouse](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)
## Эффективное определение отдельных строк {#identifying-single-rows-efficiently}

Хотя в общем это [не](/knowledgebase/key-value) лучший случай использования для ClickHouse,
иногда приложения, построенные на ClickHouse, требуют определения отдельных строк таблицы ClickHouse.


Интуитивным решением для этого может быть использование [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) столбца с уникальным значением для каждой строки и для быстрого извлечения строк использовать этот столбец в качестве первичного ключа.

Для самых быстрых извлечений, столбец UUID [должен быть первым ключевым столбцом](#the-primary-index-is-used-for-selecting-granules).

Мы обсуждали, что поскольку [данные строк таблицы ClickHouse хранятся на диске в порядке первичных ключей](#data-is-stored-on-disk-ordered-by-primary-key-columns), наличие столбца с очень высокой кардинальностью (таким как столбец UUID) в первичном ключе или в составном первичном ключе перед столбцами с низкой кардинальностью [вредно для соотношения сжатия других столбцов таблицы](#optimal-compression-ratio-of-data-files).

Компромисс между самым быстрым извлечением и оптимальным сжатием данных заключается в использовании составного первичного ключа, где UUID является последним ключевым столбцом, после столбцов с низкой кардинальностью, которые используются для обеспечения хорошего соотношения сжатия для некоторых столбцов таблицы.
### Конкретный пример {#a-concrete-example}

Одним из конкретных примеров является служба текстовых вставок http://pastila.nl, которую разработал Алексей Миловидов и [блогировал](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/).

При каждом изменении текстовой области данные автоматически сохраняются в строку таблицы ClickHouse (одна строка на изменение).

Одним из способов идентификации и извлечения (конкретной версии) вставленного содержимого является использование хеша содержимого в качестве UUID для строки таблицы, содержащей это содержимое.

Следующая диаграмма показывает
- порядок вставки строк, когда содержимое изменяется (например, из-за нажатий клавиш для ввода текста в текстовую область) и
- порядок данных на диске из вставленных строк, когда используется `PRIMARY KEY (hash)`:

<Image img={sparsePrimaryIndexes15a} size="md" alt="Sparse Primary Indices 15a" background="white"/>

Поскольку столбец `hash` используется в качестве первичного ключа
- конкретные строки могут быть извлечены [очень быстро](#the-primary-index-is-used-for-selecting-granules), но
- строки таблицы (их данные столбцов) хранятся на диске, упорядоченные по возрастанию (уникальных и случайных) значений хеша. Поэтому также значения содержимого столбца хранятся в произвольном порядке без локальности данных, что приводит к **субоптимальному соотношению сжатия для файла данных столбца содержимого**.


Для значительного улучшения соотношения сжатия для столбца содержимого, одновременно достигая быстрого извлечения конкретных строк, pastila.nl использует два хеша (и составной первичный ключ) для идентификации конкретной строки:
- хеш содержимого, как обсуждалось выше, который уникален для различных данных, и
- [локально чувствительный хеш (отпечаток)](https://en.wikipedia.org/wiki/Locality-sensitive_hashing), который **не** меняется при незначительных изменениях данных.

Следующая диаграмма показывает
- порядок вставки строк, когда содержимое изменяется (например, из-за нажатий клавиш для ввода текста в текстовую область) и
- порядок данных на диске из вставленных строк, когда используется составной `PRIMARY KEY (fingerprint, hash)`:

<Image img={sparsePrimaryIndexes15b} size="md" alt="Sparse Primary Indices 15b" background="white"/>

Теперь строки на диске сначала упорядочены по `fingerprint`, а для строк с одинаковым значением отпечатка их значение `hash` определяет окончательный порядок.

Поскольку данные, отличающиеся только небольшими изменениями, получают одинаковое значение отпечатка, схожие данные теперь хранятся на диске близко друг к другу в столбце содержимого. И это очень хорошо для соотношения сжатия содержимого столбца, так как алгоритм сжатия в общем выигрывает от локальности данных (чем более схожи данные, тем лучше соотношение сжатия).

Компромисс заключается в том, что для извлечения конкретной строки требуются два поля (`fingerprint` и `hash`), чтобы оптимально использовать первичный индекс, который возникает из составного `PRIMARY KEY (fingerprint, hash)`.
