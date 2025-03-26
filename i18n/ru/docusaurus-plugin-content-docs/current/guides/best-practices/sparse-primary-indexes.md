---
sidebar_label: 'Первичные индексы'
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

В этом руководстве мы углубимся в индексацию в ClickHouse. Мы подробно покажем и обсудим:

- [чем индексация в ClickHouse отличается от традиционных систем управления реляционными базами данных](#an-index-design-for-massive-data-scales)
- [как ClickHouse строит и использует разреженный первичный индекс таблицы](#a-table-with-a-primary-key)
- [каковы некоторые из лучших практик индексации в ClickHouse](#using-multiple-primary-indexes)

Вы можете самостоятельно выполнить все SQL-операторы и запросы ClickHouse, приведенные в этом руководстве, на своём компьютере. Для установки ClickHouse и инструкций по началу работы смотрите [Quick Start](/quick-start.mdx).

:::note
Это руководство сосредоточено на разреженных первичных индексах ClickHouse.

Для [вторичных индексов пропуска данных](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes) в ClickHouse, смотрите [Tutorial](/guides/best-practices/skipping-indexes.md).
:::

### Набор данных {#data-set}

Всё это руководство мы будем использовать пример анонимизированного набора данных о веб-трафике.

- Мы будем использовать подмножество из 8.87 миллионов строк (событий) из этого примера.
- Некомпрессированные данные составляют 8.87 миллионов событий и около 700 МБ. При хранении в ClickHouse этот объём сжимается до 200 МБ.
- В нашем подмножестве каждая строка содержит три столбца, которые указывают на интернет-пользователя (столбец `UserID`), кликнувшего по URL (`URL` столбец) в определённое время (`EventTime` столбец).

С этими тремя столбцами мы уже можем формулировать некоторые типичные запросы аналитики веб-данных, такие как:

- "Каковы топ-10 самых кликаемых URL для определённого пользователя?"
- "Кто топ-10 пользователей, которые чаще всего кликали по определённому URL?"
- "Какие наиболее популярные времена (например, дни недели), когда пользователь кликает по определённому URL?"

### Тестовая машина {#test-machine}

Все представленные в этом документе показатели работы основаны на запуске ClickHouse 22.2.1 локально на MacBook Pro с чипом Apple M1 Pro и 16 ГБ оперативной памяти.

### Полное сканирование таблицы {#a-full-table-scan}

Чтобы увидеть, как выполняется запрос по нашему набору данных без первичного ключа, мы создаем таблицу (с движком таблиц MergeTree), выполнив следующий SQL DDL-оператор:

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

Далее вставьте подмножество данных hits в таблицу с помощью следующего SQL-оператора вставки. Это использует [табличную функцию URL](/sql-reference/table-functions/url.md) для загрузки подмножества полного набора данных, размещённого удалённо на clickhouse.com:

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

Результаты выполнения ClickHouse показывают, что приведённый выше оператор вставил 8.87 миллионов строк в таблицу.

Наконец, чтобы упростить дискуссии, которые будут рассматриваться в этом руководстве, и сделать диаграммы и результаты воспроизводимыми, мы [оптимизируем](/sql-reference/statements/optimize.md) таблицу, используя ключевое слово FINAL:

```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
В общем случае, не требуется и не рекомендуется немедленно оптимизировать таблицу после загрузки данных в неё. Почему это необходимо в данном примере, станет очевидно.
:::

Теперь мы выполняем наш первый веб-аналитический запрос. Следующий запрос вычисляет топ-10 самых кликаемых URL для интернет-пользователя с `UserID` 749927693:

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

Результаты выполнения ClickHouse показывают, что ClickHouse выполнил полное сканирование таблицы! Каждая отдельная строка из 8.87 миллионов строк нашей таблицы была загружена в ClickHouse, что не масштабируется.

Чтобы сделать это (значительно) более эффективным и (намного) быстрее, нам нужна таблица с подходящим первичным ключом. Это позволит ClickHouse автоматически (на основе столбца(-ов) первичного ключа) создать разреженный первичный индекс, который затем может быть использован для значительного ускорения выполнения нашего примера запроса.

### Связанные материалы {#related-content}

- Блог: [Суперускорение ваших запросов ClickHouse](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)

## Дизайн индексов ClickHouse {#clickhouse-index-design}

### Дизайн индекса для работы с огромными объёмами данных {#an-index-design-for-massive-data-scales}

В традиционных системах управления реляционными базами данных в первичном индексе содержится одна запись на каждую строку таблицы. В результате первичный индекс будет содержать 8.87 миллионов записей для нашего набора данных. Такой индекс позволяет быстро находить определённые строки, обеспечивая высокую эффективность для запросов на поиск и точечные обновления. Поиск записи в структуре данных `B(+)-Tree` имеет среднюю временную сложность `O(log n)`; более точно, `log_b n = log_2 n / log_2 b`, где `b` — это коэффициент разветвления `B(+)-Tree`, а `n` — количество индексированных строк. Поскольку `b` обычно находится в пределах от нескольких сотен до нескольких тысяч, `B(+)-Trees` являются очень плоскими структурами, и требуется немного дисковых операций для поиска записей. При 8.87 миллионах строк и коэффициенте разветвления 1000 в среднем потребуется 2.3 дисковых обращения. Эта возможность достигается за счёт дополнительных накладных расходов на диск и память, более высоких затрат на вставку при добавлении новых строк в таблицу и записей в индекс, а иногда и ребалансировки B-дерева.

Учитывая сложности, связанные с индексами B-дерева, движки таблиц в ClickHouse используют другой подход. [Семейство движков MergeTree](/engines/table-engines/mergetree-family/index.md) в ClickHouse было разработано и оптимизировано для работы с огромными объёмами данных. Эти таблицы предназначены для приёма миллионов вставок строк в секунду и хранения очень больших объёмов данных (сотни петабайт). Данные быстро записываются в таблицу [частями](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage), с применением правил для фоновым слияний частей. В ClickHouse каждая часть имеет свой собственный первичный индекс. Когда части сливаются, также сливаются и их первичные индексы. На очень большом масштабе, для которого рассчитан ClickHouse, крайне важно быть очень эффективным с точки зрения использования диска и памяти. Поэтому вместо индексирования каждой строки, первичный индекс для части имеет одну запись индекса (известную как 'метка') на группу строк (называемую 'гранула') - эта техника называется **разреженный индекс**.

Разреженное индексирование возможно, потому что ClickHouse хранит строки для части на диске, упорядоченные по столбцу(-ам) первичного ключа. Вместо прямой локализации отдельных строк (как это делает индекс на основе B-дерева) разреженный первичный индекс позволяет быстро (посредством бинарного поиска по записям индекса) идентифицировать группы строк, которые могут соответствовать запросу. Обнаруженные группы потенциально подходящих строк (гранулы) затем параллельно передаются в движок ClickHouse для поиска совпадений. Этот дизайн индекса позволяет первичному индексу быть небольшим (он может и должен полностью умещаться в основной памяти), в то же время значительно ускоряя времена выполнения запросов: особенно для диапазонных запросов, которые типичны при аналитических работах с данными.

Следующее иллюстрирует, как ClickHouse строит и использует свой разреженный первичный индекс. Позже в статье мы обсудим некоторые лучшие практики для выбора, удаления и упорядочивания столбцов таблицы, которые используются для построения индекса (столбцы первичного ключа).

### Таблица с первичным ключом {#a-table-with-a-primary-key}

Создайте таблицу, которая имеет составной первичный ключ со столбцами ключей `UserID` и `URL`:

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
    Детали оператора DDL
    </summary>
    <p>

Чтобы упростить обсуждение в этом руководстве, а также сделать диаграммы и результаты воспроизводимыми, оператор DDL:

<ul>
  <li>
    Указывает составной ключ сортировки для таблицы через оператор <code>ORDER BY</code>.
  </li>
  <li>
    Явно контролирует, сколько записей индекса будет иметь первичный индекс через следующие настройки:
    <ul>
      <li>
        <code>index_granularity</code>: явно установлен на его значение по умолчанию, равное 8192. Это означает, что для каждой группы из 8192 строк, первичный индекс будет иметь одну запись индекса. Например, если в таблице содержится 16384 строки, индекс будет иметь две записи индекса.
      </li>
      <li>
        <code>index_granularity_bytes</code>: установлен в 0 для отключения <a href="https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1" target="_blank">адаптивной гранулярности индекса</a>. Адаптивная гранулярность индекса означает, что ClickHouse автоматически создаёт одну запись индекса для группы из n строк, если выполняется одно из следующих условий:
        <ul>
          <li>
            Если <code>n</code> меньше 8192, и размер объединённых данных строк для этих <code>n</code> строк больше или равен 10 MB (значение по умолчанию для <code>index_granularity_bytes</code>).
          </li>
          <li>
            Если размер объединённых данных строк для <code>n</code> строк меньше 10 MB, но <code>n</code> равно 8192.
          </li>
        </ul>
      </li>
      <li>
        <code>compress_primary_key</code>: установлен в 0 для отключения <a href="https://github.com/ClickHouse/ClickHouse/issues/34437" target="_blank">сжатия первичного индекса</a>. Это позволит нам по желанию инспектировать его содержимое позже.
      </li>
    </ul>
  </li>
</ul>

</p>
</details>

Первичный ключ в вышеуказанном операторе DDL вызывает создание первичного индекса на основе двух указанных столбцов ключа.

<br/>
Далее вставьте данные:

```sql
INSERT INTO hits_UserID_URL SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```
Ответ выглядит так:

```response
0 rows in set. Elapsed: 149.432 sec. Processed 8.87 million rows, 18.40 GB (59.38 thousand rows/s., 123.16 MB/s.)
```

<br/>
И оптимизируйте таблицу:

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

- Данные таблицы хранятся в [широком формате](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) в определённом каталоге на диске, что означает, что в этом каталоге будет один файл данных (и один файл меток) на столбец таблицы.
- В таблице 8.87 миллионов строк.
- Нестиснутый размер данных всех строк составляет 733.28 МБ.
- Сжатый размер на диске всех строк составляет 206.94 МБ.
- У таблицы есть первичный индекс с 1083 записями (называемыми 'метки'), и размер индекса составляет 96.93 КБ.
- В общей сложности данные таблицы, файлы меток и файл первичного индекса занимают 207.07 МБ на диске.

### Данные хранятся на диске, упорядоченные по столбцам первичного ключа {#data-is-stored-on-disk-ordered-by-primary-key-columns}

Наша таблица, которую мы создали выше, имеет
- составной [первичный ключ](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)` и
- составной [ключ сортировки](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)`.

:::note
- Если бы мы указали только ключ сортировки, то первичный ключ был бы неявно определён как равный ключу сортировки.

- Чтобы быть эффективными с точки зрения использования памяти, мы явно указали первичный ключ, который содержит только те столбцы, по которым наши запросы выполняют фильтрацию. Первичный индекс, основанный на этом первичном ключе, полностью загружается в основную память.

- Чтобы обеспечить согласованность диаграмм в руководстве и максимизировать коэффициент сжатия, мы определили отдельный ключ сортировки, который включает все столбцы нашей таблицы (если в столбце похожие данные находятся рядом друг с другом, например, через сортировку, то эти данные будут лучше сжаты).

- Первичный ключ должен быть префиксом ключа сортировки, если указаны оба.
:::

Вставленные строки хранятся на диске в лексикографическом (по возрастанию) порядке по столбцам первичного ключа (и дополнительному столбцу `EventTime` из ключа сортировки).

:::note
ClickHouse позволяет вставлять несколько строк с идентичными значениями столбцов первичного ключа. В этом случае (см. строку 1 и строку 2 на диаграмме ниже), конечный порядок определяется указанным ключом сортировки и, следовательно, значением столбца `EventTime`.
:::

ClickHouse является <a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms" target="_blank">столбцовой системой управления базами данных</a>. Как показано на диаграмме ниже,

- для представления на диске существует один файл данных (*.bin) на столбец таблицы, в котором все значения для этого столбца хранятся в <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">сжатом</a> формате, и
- 8.87 миллионов строк хранятся на диске в лексикографическом порядке по возрастанию по столбцам первичного ключа (и дополнительным столбцам ключа сортировки), то есть в данном случае
  - сначала по `UserID`,
  - затем по `URL`,
  - и, наконец, по `EventTime`:

<Image img={sparsePrimaryIndexes01} size="md" alt="Sparse Primary Indices 01" background="white"/>

`UserID.bin`, `URL.bin` и `EventTime.bin` - это файлы данных на диске, где хранятся значения столбцов `UserID`, `URL` и `EventTime`.

:::note
- Поскольку первичный ключ определяет лексикографический порядок строк на диске, у таблицы может быть только один первичный ключ.

- Мы нумеруем строки начиная с 0, чтобы соответствовать внутренней схеме нумерации строк ClickHouse, которая также используется для сообщений журнала.
:::

### Данные организованы в гранулы для параллельной обработки данных {#data-is-organized-into-granules-for-parallel-data-processing}

Для целей обработки данных значения столбцов таблицы логически разделены на гранулы. Гранула — это наименьший неделимый набор данных, который передаётся в ClickHouse для обработки данных. Это означает, что вместо чтения отдельных строк, ClickHouse всегда читает (в потоковом режиме и параллельно) целую группу (гранулу) строк. :::note Значения столбцов не хранятся физически внутри гранул: гранулы являются лишь логической организацией значений столбцов для выполнения запросов. :::

Следующая диаграмма показывает, как (значения столбцов) 8.87 миллиона строк нашей таблицы организованы в 1083 гранулы, в результате указания настроек `index_granularity` (установленной на значение по умолчанию 8192) в DDL-операторе таблицы.

<Image img={sparsePrimaryIndexes02} size="md" alt="Sparse Primary Indices 02" background="white"/>

Первые (на основе физического порядка на диске) 8192 строки (и их значения столбцов) логически принадлежат грануле 0, затем следующие 8192 строки (и их значения столбцов) принадлежат грануле 1 и так далее.

:::note
- Последняя гранула (гранула 1082) "содержит" менее 8192 строк.

- Мы упомянули в начале этого руководства в разделе "Детали оператора DDL", что мы отключили [адаптивную гранулярность индекса](/whats-new/changelog/2019.md/#experimental-features-1) (чтобы упростить обсуждение в этом руководстве и сделать диаграммы и результаты воспроизводимыми).

  Поэтому все гранулы (кроме последней) в нашей примерной таблице имеют одинаковый размер.

- Для таблиц с адаптивной гранулярностью индекса (гранулярность индекса по умолчанию [адаптивна](/operations/settings/merge-tree-settings#index_granularity_bytes)) размер некоторых гранул может быть меньше 8192 строк в зависимости от размеров данных строк.

- Мы выделили некоторые значения столбцов из наших столбцов первичного ключа (`UserID`, `URL`) оранжевым цветом. Эти оранжевые значения столбцов являются значениями столбцов первичного ключа каждой первой строки каждой гранулы. Как мы увидим ниже, эти оранжево выделенные значения столбцов станут записями в первичном индексе таблицы.

- Мы нумеруем гранулы, начиная с 0, чтобы соответствовать внутренней схеме нумерации ClickHouse, которая также используется для сообщений журнала.
:::
### Первичный индекс имеет одну запись на каждую гранулу {#the-primary-index-has-one-entry-per-granule}

Первичный индекс создаётся на основе гранул, показанных на вышеуказанной диаграмме. Этот индекс является несжатым плоским массивом (primary.idx), содержащим так называемые числовые метки индекса, начиная с 0.

На диаграмме ниже показано, что индекс хранит значения столбцов первичного ключа (значения, отмеченные оранжевым на вышеуказанной диаграмме) для каждой первой строки в каждой грануле.
Или, другими словами: первичный индекс хранит значения столбцов первичного ключа из каждой 8192-й строки таблицы (на основе физического порядка строк, определённого столбцами первичного ключа).
Например
- первая запись индекса («метка 0» на диаграмме ниже) хранит значения столбцов ключа первой строки гранулы 0 с диаграммы выше,
- вторая запись индекса («метка 1» на диаграмме ниже) хранит значения столбцов ключа первой строки гранулы 1 с диаграммы выше и так далее.

<Image img={sparsePrimaryIndexes03a} size="lg" alt="Sparse Primary Indices 03a" background="white"/>

Всего индекс содержит 1083 записи для нашей таблицы с 8,87 миллионами строк и 1083 гранулами:

<Image img={sparsePrimaryIndexes03b} size="md" alt="Sparse Primary Indices 03b" background="white"/>

:::note
- Для таблиц с [адаптивной гранулярностью индекса](/whats-new/changelog/2019.md/#experimental-features-1) в первичном индексе также хранится одна «финальная» дополнительная метка, которая фиксирует значения столбцов первичного ключа последней строки таблицы, но так как мы отключили адаптивную гранулярность индекса (чтобы упростить обсуждения в этом руководстве, а также сделать диаграммы и результаты воспроизводимыми), индекс нашей примерной таблицы не включает эту финальную метку.

- Файл первичного индекса полностью загружается в основную память. Если файл больше, чем доступное свободное пространство памяти, то ClickHouse выдает ошибку.
:::

<details>
    <summary>
    Проверка содержимого первичного индекса
    </summary>
    <p>

В самоуправляемом ClickHouse кластере мы можем использовать <a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">табличную функцию file</a> для проверки содержимого первичного индекса нашей примерной таблицы.

Для этого нам сначала нужно скопировать файл первичного индекса в <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a> одного из узлов работающего кластера:
<ul>
<li>Шаг 1: Получить путь к файлу данных, содержащему файл первичного индекса</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

возвращает `/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4` на тестовой машине.

<li>Шаг 2: Получить user_files_path</li>
По <a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">умолчанию user_files_path</a> на Linux
`/var/lib/clickhouse/user_files/`

и на Linux вы можете проверить, было ли оно изменено: `$ grep user_files_path /etc/clickhouse-server/config.xml`

На тестовой машине путь `/Users/tomschreiber/Clickhouse/user_files/`


<li>Шаг 3: Скопировать файл первичного индекса в user_files_path</li>

`cp /Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4/primary.idx /Users/tomschreiber/Clickhouse/user_files/primary-hits_UserID_URL.idx`

</ul>

<br/>
Теперь мы можем исследовать содержимое первичного индекса через SQL:
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



Записи первичного ключа называются метками индекса, потому что каждая запись индекса обозначает начало определённого диапазона данных. В частности, для примерной таблицы:
- Метки индекса UserID:

  Сохранённые значения `UserID` в первичном индексе отсортированы в порядке возрастания.<br/>
  «метка 1» на диаграмме выше, таким образом, указывает, что значения `UserID` всех строк таблицы в грануле 1 и всех последующих гранулах гарантированно больше или равны 4.073.710.

 [Как мы увидим позже](#the-primary-index-is-used-for-selecting-granules), этот глобальный порядок позволяет ClickHouse <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">использовать алгоритм бинарного поиска</a> по меткам индекса для первой колонки ключа, когда запрос фильтрует данные по первой колонке первичного ключа.

- Метки индекса URL:

  Достаточно похожая кардинальность столбцов первичного ключа `UserID` и `URL`
  означает, что метки индекса для всех столбцов ключа после первого столбца в общем случае указывают только на диапазон данных при условии, что значение столбца ключа-предшественника остаётся тем же в течение, как минимум, текущей гранулы.<br/>
 Например, поскольку значения UserID метки 0 и метки 1 различны на диаграмме выше, ClickHouse не может предположить, что все значения URL всех строк таблицы в грануле 0 больше или равны `'http://showtopics.html%3...'`. Однако, если значения UserID метки 0 и метки 1 будут одинаковыми на диаграмме выше (что означает, что значение UserID остаётся тем же для всех строк таблицы в грануле 0), ClickHouse мог бы предположить, что все значения URL всех строк таблицы в грануле 0 больше или равны `'http://showtopics.html%3...'`.

  Мы обсудим последствия этого на производительность выполнения запросов более подробно позже.
### Первичный индекс используется для выбора гранул {#the-primary-index-is-used-for-selecting-granules}

Теперь мы можем выполнять наши запросы с поддержкой первичного индекса.


Следующий запрос вычисляет топ-10 самых кликабельных URL для UserID 749927693.

```sql
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
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

10 rows in set. Elapsed: 0.005 sec.

# highlight-next-line
Обработано 8.19 тысяч строк,
740.18 KB (1.53 миллиона строк/сек., 138.59 MB/сек.)
```

Результат для клиента ClickHouse теперь показывает, что вместо полного сканирования таблицы только 8.19 тысяч строк было передано в ClickHouse.

Если включено <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">трассировочное логирование</a>, то файл журнала сервера ClickHouse показывает, что ClickHouse выполнял <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">бинарный поиск</a> по 1083 меткам индекса UserID, чтобы выявить гранулы, которые могут содержать строки со значением столбца UserID `749927693`. Это требует 19 шагов со средним временем выполнения `O(log2 n)`:
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

Мы видим в приведённом выше журнале трассировки, что одной метки из 1083 существующих меток оказалось достаточно для выполнения запроса.

<details>
    <summary>
    Подробности логирования трассировки
    </summary>
    <p>

Была найдена метка 176 ('найденная левая граница метки' включена, 'найденная правая граница метки' исключена), и, следовательно, все 8192 строки из гранулы 176 (которая начинается с строки 1.441.792 - мы увидим это позже в этом руководстве) затем поступают в ClickHouse для поиска фактических строк со значением столбца UserID `749927693`.
</p>
</details>

Мы также можем воспроизвести это, используя <a href="https://clickhouse.com/docs/sql-reference/statements/explain/" target="_blank">оператор EXPLAIN</a> в нашем примерном запросе:
```sql
EXPLAIN indexes = 1
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

Результат такой:

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
│                 Индексы:                                                              │
│                   PrimaryKey                                                          │
│                     Ключи:                                                            │
│                       UserID                                                          │
│                     Условие: (UserID in [749927693, 749927693])                       │
│                     Части: 1/1                                                        │

# highlight-next-line
│                     Гранулы: 1/1083                                                   │
└───────────────────────────────────────────────────────────────────────────────────────┘

16 rows in set. Elapsed: 0.003 sec.
```
Результат для клиента показывает, что одна из 1083 гранул была выбрана как потенциально содержащая строки со значением столбца UserID 749927693.


:::note Заключение
Когда запрос фильтруется по столбцу, который является частью составного ключа и является первым столбцом ключа, ClickHouse выполняет алгоритм бинарного поиска по меткам индекса столбца ключа.
:::

<br/>

Как обсуждалось выше, ClickHouse использует свой разреженный первичный индекс для быстрого (с помощью бинарного поиска) выбора гранул, которые могут содержать строки, соответствующие запросу.


Это **первая стадия (выбор гранул)** выполнения запроса в ClickHouse.

На **второй стадии (чтение данных)** ClickHouse находит выбранные гранулы, чтобы передать все их строки в движок ClickHouse для поиска строк, которые действительно соответствуют запросу.

Мы обсудим эту вторую стадию более подробно в следующем разделе.
### Файлы меток используются для обнаружения гранул {#mark-files-are-used-for-locating-granules}

Следующая диаграмма иллюстрирует часть файла первичного индекса для нашей таблицы.

<Image img={sparsePrimaryIndexes04} size="md" alt="Sparse Primary Indices 04" background="white"/>

Как обсуждалось выше, с помощью бинарного поиска по 1083 меткам UserID была идентифицирована метка 176. Её соответствующая гранула 176 может, таким образом, содержать строки со значением столбца UserID 749.927.693.

<details>
    <summary>
    Подробности выбора гранул
    </summary>
    <p>

На диаграмме выше показано, что метка 176 — это первая запись индекса, где и минимальное значение UserID связанной гранулы 176 меньше, чем 749.927.693, и минимальное значение UserID гранулы 177 для следующей метки (метка 177) больше этого значения. Поэтому только соответствующая гранула 176 для метки 176 может содержать строки со значением столбца UserID 749.927.693.
</p>
</details>

Чтобы подтвердить (или опровергнуть), что в грануле 176 есть строки со значением столбца UserID 749.927.693, все 8192 строки, принадлежащие этой грануле, должны быть переданы в движок ClickHouse.

Для этого ClickHouse должен знать физическое местоположение гранулы 176.

В ClickHouse физические местоположения всех гранул для нашей таблицы хранятся в файлах меток. Подобно файлам данных, на каждый столбец таблицы приходится один файл меток.

Следующая диаграмма показывает три файла меток `UserID.mrk`, `URL.mrk` и `EventTime.mrk`, которые хранят физические местоположения гранул для столбцов таблицы `UserID`, `URL` и `EventTime`.

<Image img={sparsePrimaryIndexes05} size="md" alt="Sparse Primary Indices 05" background="white"/>

Мы обсудили, что первичный индекс является плоским несжатым массивом (primary.idx), содержащим метки индекса, нумерация которых начинается с 0.

Аналогично, файл меток также является плоским несжатым массивом (*.mrk), содержащим метки, нумерация которых начинается с 0.

Как только ClickHouse идентифицировал и выбрал метку индекса для гранулы, которая может содержать строки, соответствующие запросу, можно выполнить позиционный поиск в файлах меток, чтобы получить физические местоположения гранулы.

Каждая запись файла меток для конкретного столбца хранит два местоположения в виде смещений:

- Первое смещение ('block_offset' на диаграмме выше) определяет расположение <a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">блока</a> в <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">сжатом</a> файле данных столбца, который содержит сжатую версию выбранной гранулы. Этот сжатый блок потенциально содержит несколько сжатых гранул. Обнаруженный сжатый блок разархивируется в основную память при чтении.

- Второе смещение ('granule_offset' на диаграмме выше) из файла меток указывает местоположение гранулы в пределах несжатых данных блока.

Затем все 8192 строки, принадлежащие обнаруженной несжатой грануле, передаются в движок ClickHouse для дальнейшей обработки.


:::note

- Для таблиц с [широким форматом](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) и без [адаптивной гранулярности индекса](/whats-new/changelog/2019.md/#experimental-features-1) ClickHouse использует `.mrk` файлы меток, как показано выше, которые содержат записи с двумя адресами длиной 8 байт на запись. Эти записи представляют собой физические местоположения гранул, которые все имеют одинаковый размер.

 Индексная гранулярность по умолчанию [адаптивна](/operations/settings/merge-tree-settings#index_granularity_bytes), но для нашей примерной таблицы мы отключили адаптивную индексную гранулярность (чтобы упростить обсуждения в этом руководстве, а также сделать диаграммы и результаты воспроизводимыми). Наша таблица использует широкий формат, потому что размер данных больше, чем [min_bytes_for_wide_part](/operations/settings/merge-tree-settings#min_bytes_for_wide_part) (который по умолчанию составляет 10 МБ для самоуправляемых кластеров).

- Для таблиц с широким форматом и с адаптивной гранулярностью индекса ClickHouse использует `.mrk2` файлы меток, которые содержат записи, аналогичные записям `.mrk`, но с дополнительным третьим значением на запись: количество строк в грануле, с которой связана текущая запись.

- Для таблиц с [компактным форматом](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) ClickHouse использует `.mrk3` файлы меток.

:::


:::note Зачем нужны файлы меток

Почему первичный индекс не содержит напрямую физические местоположения гранул, соответствующих меткам индекса?

Поскольку в таких масштабах, для которых спроектирован ClickHouse, важно быть очень эффективным в использовании диска и памяти.

Файл первичного индекса должен поместиться в основную память.

Для нашего примерного запроса ClickHouse использовал первичный индекс и выбрал одну гранулу, которая может содержать строки, соответствующие нашему запросу. Только для этой одной гранулы ClickHouse затем требуется физическое местоположение, чтобы передать соответствующие строки для дальнейшей обработки.

Кроме того, эта информация о смещении нужна только для столбцов UserID и URL.

Информация о смещении не нужна для столбцов, которые не используются в запросе, например, `EventTime`.

Для нашего примера ClickHouse нужны только два физических смещения местоположения для гранулы 176 в файле данных UserID (UserID.bin) и два физических смещения местоположения для гранулы 176 в файле данных URL (URL.bin).

Опосредованность, предоставляемая файлами меток, позволяет избежать необходимости хранения в самом первичном индексе записей о физическом положении всех 1083 гранул для всех трёх столбцов: таким образом, избегая ненужных (возможно неиспользуемых) данных в основной памяти.
:::

Следующая диаграмма и текст ниже иллюстрируют, как для нашего примера ClickHouse определяет местоположение гранулы 176 в файле данных UserID.bin.

<Image img={sparsePrimaryIndexes06} size="md" alt="Sparse Primary Indices 06" background="white"/>

Мы обсуждали ранее в этом руководстве, что ClickHouse выбрал метку первичного индекса 176 и поэтому гранулу 176 как потенциально содержащую строки, соответствующие нашему запросу.

Теперь ClickHouse использует выбранный номер метки (176) из индекса для позиционного поиска в файле меток UserID.mrk, чтобы получить два смещения для определения местоположения гранулы 176.

Как показано, первое смещение указывает местоположение сжатого блока файла данных UserID.bin, который, в свою очередь, содержит сжатую версию гранулы 176.

После того как найденный блок файла был разархивирован в основную память, второе смещение из файла меток можно использовать для определения местоположения гранулы 176 в пределах несжатых данных.

ClickHouse нужно найти (и передать все значения из) гранулу 176 из файла данных UserID.bin и файла данных URL.bin для выполнения нашего примерного запроса (топ 10 самых кликабельных URL для интернет-пользователя с UserID 749.927.693).

Диаграмма выше показывает, как ClickHouse определяет местоположение гранулы для файла данных UserID.bin.

Параллельно ClickHouse делает то же самое для гранулы 176 для файла данных URL.bin. Две соответствующие гранулы выровнены и передаются в движок ClickHouse для дальнейшей обработки, т.е. агрегации и подсчета значений URL на группу для всех строк, где UserID равен 749.927.693, прежде чем, наконец, будет выведено 10 крупнейших групп URL в порядке убывания счёта.
## Использование нескольких первичных индексов {#using-multiple-primary-indexes}

<a name="filtering-on-key-columns-after-the-first"></a>
### ВТОРИЧНЫЕ столбцы ключей могут (быть) неэффективны {#secondary-key-columns-can-not-be-inefficient}


Когда запрос фильтруется по столбцу, который является частью составного ключа и является первым столбцом ключа, [тогда ClickHouse запускает алгоритм бинарного поиска по меткам индекса столбца ключа](#the-primary-index-is-used-for-selecting-granules).

Но что происходит, когда запрос фильтруется по столбцу, который является частью составного ключа, но не является первым столбцом ключа?

:::note
Мы рассматриваем сценарий, когда запрос явно не фильтруется по первому столбцу ключа, а по вторичному столбцу ключа.

Когда запрос фильтруется как по первому столбцу ключа, так и по любым столбцам ключа после первого, ClickHouse выполняет бинарный поиск по меткам индекса первого столбца ключа.
:::

<br/>
<br/>

<a name="query-on-url"></a>
Мы используем запрос, который вычисляет топ-10 пользователей, которые чаще всего кликали на URL "http://public_search":

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

10 rows in set. Elapsed: 0.086 sec.

# highlight-next-line
Обработано 8.81 миллионов строк,
799.69 MB (102.11 миллионов строк/сек., 9.27 GB/сек.)
```

Вывод клиента указывает на то, что ClickHouse практически выполнял полное сканирование таблицы, несмотря на то, что [столбец URL является частью составного первичного ключа](#a-table-with-a-primary-key)! ClickHouse читает 8.81 миллиона строк из 8.87 миллионов строк таблицы.

Если включено [trace_logging](/operations/server-configuration-parameters/settings#logger), то файл журнала сервера ClickHouse показывает, что ClickHouse использовал <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">поиск с исключениями</a> по 1083 меткам индекса URL, чтобы выявить гранулы, которые могут содержать строки со значением столбца URL "http://public_search":
```response
...Executor): Key condition: (column 1 in ['http://public_search',
                                           'http://public_search'])

# highlight-next-line
...Executor): Used generic exclusion search over index for part all_1_9_2
              with 1537 steps
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,

# highlight-next-line
              1076/1083 marks by primary key, 1076 marks to read from 5 ranges
...Executor): Читать около 8814592 строк с 10 потоками
```
Мы видим в приведённом выше журнале трассировки, что 1076 (через метки) из 1083 гранул были выбраны как потенциально содержащие строки с соответствующим значением URL.

Это приводит к тому, что 8.81 миллиона строк передаются в движок ClickHouse (параллельно с использованием 10 потоков), чтобы выявить строки, которые действительно содержат значение URL "http://public_search".

Однако, как мы увидим позже, только 39 гранул из выбранных 1076 гранул действительно содержат совпадающие строки.

Хотя первичный индекс на основе составного первичного ключа (UserID, URL) был очень полезен для ускорения запросов, фильтрующих строки с определённым значением UserID, индекс не даёт значительной помощи в ускорении запроса, который фильтрует строки с определённым значением URL.

Причина этого в том, что столбец URL не является первым столбцом ключа, и поэтому ClickHouse использует алгоритм поиска с исключениями (вместо бинарного поиска) по меткам индекса столбца URL, и **эффективность этого алгоритма зависит от разницы кардинальности** между столбцом URL и его предшествующим столбцом ключа UserID.

Чтобы проиллюстрировать это, мы даём некоторые подробности о том, как работает поиск с исключениями.

<a name="generic-exclusion-search-algorithm"></a>
### Алгоритм поиска с исключениями {#generic-exclusion-search-algorithm}

Следующее иллюстрирует, как <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank" >алгоритм поиска с исключениями ClickHouse</a> работает, когда гранулы выбираются через вторичный столбец, где предшествующий столбец ключа имеет низкую(ие) или высокую(ие) кардинальность(и).

В качестве примера для обеих случаев мы предположим:
- запрос, который ищет строки со значением URL = "W3".
- абстрактную версию нашей таблицы hits с упрощёнными значениями для UserID и URL.
- тот же составной первичный ключ (UserID, URL) для индекса. Это означает, что строки сначала упорядочены по значениям UserID. Строки с одинаковым значением UserID затем упорядочиваются по значению URL.
- размер гранулы — два, т.е. каждая гранула содержит две строки.

Мы отметили значения столбцов ключа для первых строк таблицы для каждой гранулы оранжевым на диаграммах ниже.

**Предшествующий столбец ключа имеет низкую(ие) кардинальность(и)**<a name="generic-exclusion-search-fast"></a>

Предположим, что UserID имеет низкую кардинальность. В этом случае вероятно, что одно и то же значение UserID распределено по нескольким строкам и гранулам таблицы, а, следовательно, и меткам индекса. Для меток индекса с одинаковым значением UserID значения URL для меток индекса отсортированы в порядке возрастания (поскольку строки таблицы упорядочены сначала по UserID, а затем по URL). Это позволяет эффективно фильтровать, как описано ниже:

<Image img={sparsePrimaryIndexes07} size="md" alt="Sparse Primary Indices 06" background="white"/>

Существует три различных сценария для процесса выбора гранул для наших абстрактных примерных данных на диаграмме выше:

1.  Метка индекса 0, для которой **значение URL меньше, чем W3, и для которой значение URL следующей непосредственно за ним метки индекса также меньше, чем W3**, может быть исключена, потому что метки 0 и 1 имеют одинаковое значение UserID. Обратите внимание, что это условие исключения гарантирует, что гранула 0 полностью состоит из значений UserID U1, так что ClickHouse может предположить, что также максимальное значение URL в грануле 0 меньше, чем W3, и исключить гранулу.

2. Метка индекса 1, для которой **значение URL меньше (или равно) W3, и для которой значение URL следующей непосредственно за ней метки индекса больше (или равно) W3**, выбрана, потому что это означает, что гранула 1 может содержать строки с URL W3.

3. Метки индекса 2 и 3, для которых **значение URL больше, чем W3**, могут быть исключены, так как метки индекса первичного индекса хранят значения столбцов ключа для первой строки таблицы для каждой гранулы, а строки таблицы на диске отсортированы по значениям столбцов ключа, следовательно, гранулы 2 и 3 не могут содержать значение URL W3.

**Предшествующий столбец ключа имеет высокую(ие) кардинальность(и)**<a name="generic-exclusion-search-slow"></a>

Когда UserID имеет высокую кардинальность, маловероятно, что одно и то же значение UserID распределено по нескольким строкам и гранулам таблицы. Это означает, что значения URL для меток индекса не монотонно возрастают:

<Image img={sparsePrimaryIndexes08} size="md" alt="Sparse Primary Indices 06" background="white"/>

Как мы видим на диаграмме выше, все показанные метки, значения URL которых меньше, чем W3, выбираются для потоковой передачи строк ассоциированной с ними гранулы в движок ClickHouse.

Это потому, что хотя все метки индекса на диаграмме попадают в рассмотренный выше сценарий 1, они не удовлетворяют упомянутому условию исключения, при котором *непосредственно следующая метка индекса имеет то же значение UserID, что и текущая метка*, и, следовательно, не могут быть исключены.

Например, рассмотрим метку индекса 0, для которой **значение URL меньше, чем W3, и для которой значение URL следующей непосредственно за ним метки индекса также меньше, чем W3**. Это не *может быть* исключено, потому что следующая непосредственно за ним метка индекса 1 не *имеет* то же значение UserID, что и текущая метка 0.

Это в конечном итоге оставляет ClickHouse без возможности делать предположения о максимальном значении URL в грануле 0. Вместо этого он должен предполагать, что гранула 0 потенциально содержит строки со значением URL W3 и вынужден выбрать метку 0.


Та же ситуация верна для меток 1, 2 и 3.


:::note Заключение
<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">Алгоритм поиска с исключениями</a>, который ClickHouse использует вместо <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">алгоритма бинарного поиска</a>, когда запрос фильтруется по столбцу, который является частью составного ключа, но не первым столбцом ключа, наиболее эффективен, когда предшествующий столбец ключа имеет более низкую(ие) кардинальность(и).
:::

В нашем наборе данных оба столбца ключа (UserID, URL) имеют аналогичную высокую кардинальность, и, как объяснялось, алгоритм поиска с исключениями не очень эффективен, когда предшествующий столбец ключа столбца URL имеет более высокую или аналогичную кардинальность.
### Замечание об индексе пропуска данных {#note-about-data-skipping-index}

Из-за схожей высокой кардинальности UserID и URL, [фильтрация запросов по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) также не принесет большой пользы от создания [вторичного индекса пропуска данных](./skipping-indexes.md) по столбцу URL в нашей [таблице с составным первичным ключом (UserID, URL)](#a-table-with-a-primary-key).

Например, эти два оператора создают и заполняют [minmax](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) индекс пропуска данных по столбцу URL нашей таблицы:
```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```
ClickHouse теперь создал дополнительный индекс, который хранит - для каждой группы из 4 последовательных [гранул](#data-is-organized-into-granules-for-parallel-data-processing) (обратите внимание на выражение `GRANULARITY 4` в операторе `ALTER TABLE` выше) - минимальное и максимальное значение URL:

<Image img={sparsePrimaryIndexes13a} size="md" alt="Sparse Primary Indices 13a" background="white"/>

Первый элемент индекса (‘метка 0’ на диаграмме выше) хранит минимальные и максимальные значения URL для [строк, относящихся к первым 4 гранулам нашей таблицы](#data-is-organized-into-granules-for-parallel-data-processing).

Второй элемент индекса (‘метка 1’) хранит минимальные и максимальные значения URL для строк, относящихся к следующим 4 гранулам нашей таблицы, и так далее.

(ClickHouse также создал специальный [файл меток](#mark-files-are-used-for-locating-granules) для индекса пропуска данных для [определения местоположения](#mark-files-are-used-for-locating-granules) групп гранул, связанных с индексными метками.)

Из-за схожей высокой кардинальности UserID и URL, этот вторичный индекс пропуска данных не может помочь в исключении гранул из выбора при выполнении нашей [фильтрации запросов по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient).

Конкретное значение URL, которое ищет запрос (например, 'http://public_search'), очень вероятно находится между минимальным и максимальным значением, хранящимся в индексе для каждой группы гранул, в результате чего ClickHouse вынужден выбирать группу гранул (поскольку они могут содержать строку(и), соответствующую запросу). 
### Необходимость использования множества первичных индексов {#a-need-to-use-multiple-primary-indexes}

В результате, если мы хотим значительно ускорить выполнение нашего тестового запроса, который фильтрует строки по определенному URL, нам нужно использовать первичный индекс, оптимизированный для этого запроса.

Если, кроме того, мы хотим сохранить высокую производительность нашего тестового запроса, который фильтрует строки по определенному UserID, нам нужно использовать множество первичных индексов.

Ниже представлены способы достижения этого.

<a name="multiple-primary-indexes"></a>
### Варианты создания дополнительных первичных индексов {#options-for-creating-additional-primary-indexes}

Если мы хотим значительно ускорить оба наших тестовых запроса - один, который фильтрует строки по определенному UserID, и другой, который фильтрует строки по определенному URL, - нам нужно использовать множество первичных индексов с помощью одного из этих трех вариантов:

- Создание **второй таблицы** с другим первичным ключом.
- Создание **материализованного представления** на нашей текущей таблице.
- Добавление **проекции** к нашей текущей таблице.

Все три варианта эффективно дублируют наши тестовые данные в дополнительную таблицу, чтобы реорганизовать первичный индекс таблицы и порядок сортировки строк.

Однако эти три варианта различаются тем, насколько прозрачно для пользователя является эта дополнительная таблица с точки зрения маршрутизации запросов и вставок.

При создании **второй таблицы** с другим первичным ключом запросы должны явно отправляться в версию таблицы, лучше подходящую для данного запроса, а новые данные должны явно вставляться в обе таблицы, чтобы поддерживать синхронизацию таблиц:

<Image img={sparsePrimaryIndexes09a} size="md" alt="Sparse Primary Indices 09a" background="white"/>

С **материализованным представлением** дополнительная таблица создается неявно, и данные автоматически сохраняются в синхронизации между обеими таблицами:

<Image img={sparsePrimaryIndexes09b} size="md" alt="Sparse Primary Indices 09b" background="white"/>

Проекция является наиболее прозрачным вариантом, так как, помимо автоматического поддержания синхронизации неявно созданной (и скрытой) дополнительной таблицы при изменении данных, ClickHouse автоматически выбирает наиболее эффективную версию таблицы для запросов:

<Image img={sparsePrimaryIndexes09c} size="md" alt="Sparse Primary Indices 09c" background="white"/>

Далее мы более подробно обсуждаем эти три варианта создания и использования множества первичных индексов с реальными примерами.

<a name="multiple-primary-indexes-via-secondary-tables"></a>
### Вариант 1: Вторичные таблицы {#option-1-secondary-tables}

<a name="secondary-table"></a>
Мы создаем новую дополнительную таблицу, где меняем порядок ключевых столбцов (по сравнению с нашей оригинальной таблицей) в первичном ключе:

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

Вставьте все 8,87 миллиона строк из нашей [оригинальной таблицы](#a-table-with-a-primary-key) в дополнительную таблицу:

```sql
INSERT INTO hits_URL_UserID
SELECT * from hits_UserID_URL;
```

Ответ выглядит следующим образом:

```response
Ok.

0 rows in set. Elapsed: 2.898 sec. Processed 8.87 million rows, 838.84 MB (3.06 million rows/s., 289.46 MB/s.)
```

И, наконец, оптимизируйте таблицу:
```sql
OPTIMIZE TABLE hits_URL_UserID FINAL;
```

Поскольку мы изменили порядок столбцов в первичном ключе, вставленные строки теперь хранятся на диске в другом лексикографическом порядке (по сравнению с нашей [оригинальной таблицей](#a-table-with-a-primary-key)), и поэтому также 1083 гранулы этой таблицы содержат другие значения, чем ранее:

<Image img={sparsePrimaryIndexes10} size="md" alt="Sparse Primary Indices 10" background="white"/>

Это результирующий первичный ключ:

<Image img={sparsePrimaryIndexes11} size="md" alt="Sparse Primary Indices 11" background="white"/>

Что теперь можно использовать для значительного ускорения выполнения нашего примера запроса, фильтрующего по столбцу URL, чтобы вычислить топ-10 пользователей, которые чаще всего щелкали по URL "http://public_search":
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

Теперь, вместо того чтобы [почти выполнять полное сканирование таблицы](/guides/best-practices/sparse-primary-indexes#efficient-filtering-on-secondary-key-columns), ClickHouse выполняет этот запрос намного более эффективно.

С первичным индексом из [оригинальной таблицы](#a-table-with-a-primary-key), где UserID был первым, а URL — вторым ключевым столбцом, ClickHouse использовал [алгоритм поиска исключений](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) по меткам индекса для выполнения этого запроса, и это было не очень эффективно из-за схожей высокой кардинальности UserID и URL.

С URL в качестве первого столбца в первичном индексе ClickHouse теперь выполняет <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">бинарный поиск</a> по индексным меткам.
Соответствующий журнал трассировки в файле журнала сервера ClickHouse подтверждает это:
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
ClickHouse выбрал всего 39 меток индекса, вместо 1076, когда использовался поиск исключений.


Обратите внимание, что дополнительная таблица оптимизирована для ускорения выполнения нашего примера запроса, фильтрующего по URL.


Аналогично [плохой производительности](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) этого запроса с нашей [оригинальной таблицей](#a-table-with-a-primary-key), наш [пример запроса, фильтрующего по `UserID`](#the-primary-index-is-used-for-selecting-granules) не будет выполняться эффективно с новой дополнительной таблицей, потому что UserID теперь второй ключевой столбец в первичном индексе этой таблицы, и поэтому ClickHouse будет использовать поиск исключений для выбора гранул, что [не очень эффективно для схожей высокой кардинальности](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) UserID и URL.
Разверните подробности для деталей.

<details>
    <summary>
    Запрос, фильтрующий по UserID, теперь имеет плохую производительность<a name="query-on-userid-slow"></a>
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


Теперь у нас есть две таблицы, оптимизированные для ускорения запросов, фильтрующих по `UserID`, и ускорения запросов, фильтрующих по URL, соответственно.
### Вариант 2: Материализованные представления {#option-2-materialized-views}

Создайте [материализованное представление](/sql-reference/statements/create/view.md) на нашей текущей таблице.
```sql
CREATE MATERIALIZED VIEW mv_hits_URL_UserID
ENGINE = MergeTree()
PRIMARY KEY (URL, UserID)
ORDER BY (URL, UserID, EventTime)
POPULATE
AS SELECT * FROM hits_UserID_URL;
```

Ответ выглядит следующим образом:

```response
Ok.

0 rows in set. Elapsed: 2.935 sec. Processed 8.87 million rows, 838.84 MB (3.02 million rows/s., 285.84 MB/s.)
```

:::note
- мы меняем порядок ключевых столбцов (по сравнению с нашей [оригинальной таблицей](#a-table-with-a-primary-key)) в первичном ключе представления
- материализованное представление поддерживается **неявно созданной таблицей**, чей порядок строк и первичный индекс основаны на заданном определении первичного ключа
- неявно созданная таблица отображается с помощью запроса `SHOW TABLES` и имеет имя, начинающееся с `.inner`
- также возможно сначала явно создать базовую таблицу для материализованного представления, а затем представление может быть нацелено на эту таблицу с помощью [оператора `TO [db].[table]`](/sql-reference/statements/create/view.md)
- мы используем ключевое слово `POPULATE`, чтобы сразу же заполнить неявно созданную таблицу всеми 8,87 миллионами строк из исходной таблицы [hits_UserID_URL](#a-table-with-a-primary-key)
- если в исходную таблицу hits_UserID_URL вставляются новые строки, то эти строки также автоматически вставляются в неявно созданную таблицу
- Эффективно, неявно созданная таблица имеет тот же порядок строк и первичный индекс, что и [вторичная таблица, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables):

<Image img={sparsePrimaryIndexes12b1} size="md" alt="Sparse Primary Indices 12b1" background="white"/>

ClickHouse хранит [файлы данных столбцов](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin), [файлы меток](#mark-files-are-used-for-locating-granules) (*.mrk2) и [первичный индекс](#the-primary-index-has-one-entry-per-granule) (primary.idx) неявно созданной таблицы в специальной папке внутри директории данных сервера ClickHouse:

<Image img={sparsePrimaryIndexes12b2} size="md" alt="Sparse Primary Indices 12b2" background="white"/>

:::

Неявно созданная таблица (и ее первичный индекс), поддерживающая материализованное представление, теперь может быть использована для значительного ускорения выполнения нашего примера запроса, фильтрующего по столбцу URL:
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

Так как неявно созданная таблица (и ее первичный индекс), поддерживающая материализованное представление, по сути идентична [вторичной таблице, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables), то запрос выполняется так же эффективно, как и с явно созданной таблицей.

Соответствующий журнал трассировки в файле журнала сервера ClickHouse подтверждает, что ClickHouse выполняет бинарный поиск по индексным меткам:

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

Создайте проекцию на нашей текущей таблице:
```sql
ALTER TABLE hits_UserID_URL
    ADD PROJECTION prj_url_userid
    (
        SELECT *
        ORDER BY (URL, UserID)
    );
```

И материализуйте проекцию:
```sql
ALTER TABLE hits_UserID_URL
    MATERIALIZE PROJECTION prj_url_userid;
```

:::note
- проекция создает **скрытую таблицу**, чей порядок строк и первичный индекс основываются на указанном операторе `ORDER BY` проекции
- скрытая таблица не отображается в запросе `SHOW TABLES`
- мы используем ключевое слово `MATERIALIZE`, чтобы сразу же заполнить скрытую таблицу всеми 8,87 миллионами строк из исходной таблицы [hits_UserID_URL](#a-table-with-a-primary-key)
- если в исходную таблицу hits_UserID_URL вставляются новые строки, то эти строки также автоматически вставляются в скрытую таблицу
- запрос всегда (синтаксически) нацелен на исходную таблицу hits_UserID_URL, но если порядок строк и первичный индекс скрытой таблицы позволяют более эффективно выполнять запрос, то будет использована скрытая таблица
- обратите внимание, что проекции не делают запросы, использующие ORDER BY, более эффективными, даже если ORDER BY совпадает с оператором ORDER BY проекции (см. https://github.com/ClickHouse/ClickHouse/issues/47333)
- Эффективно, скрытая таблица, созданная с помощью проекции, имеет тот же порядок строк и первичный индекс, что и [вторичная таблица, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables):

<Image img={sparsePrimaryIndexes12c1} size="md" alt="Sparse Primary Indices 12c1" background="white"/>

ClickHouse хранит [файлы данных столбцов](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin), [файлы меток](#mark-files-are-used-for-locating-granules) (*.mrk2) и [первичный индекс](#the-primary-index-has-one-entry-per-granule) (primary.idx) скрытой таблицы в специальной папке (отмечено оранжевым на скриншоте ниже) рядом с файлами данных исходной таблицы, файлами меток и файлами первичного индекса:

<Image img={sparsePrimaryIndexes12c2} size="sm" alt="Sparse Primary Indices 12c2" background="white"/>

:::

Скрытая таблица (и ее первичный индекс), созданная с помощью проекции, теперь может быть (неявно) использована для значительного ускорения выполнения нашего примера запроса, фильтрующего по столбцу URL. Обратите внимание, что запрос синтаксически направлен на исходную таблицу проекции.
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

Поскольку скрытая таблица (и ее первичный индекс), созданная с помощью проекции, по сути идентична [вторичной таблице, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables), запрос выполняется так же эффективно, как и с явно созданной таблицей.

Соответствующий журнал трассировки в файле журнала сервера ClickHouse подтверждает, что ClickHouse выполняет бинарный поиск по индексным меткам:

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

Первичный индекс нашей [таблицы с составным первичным ключом (UserID, URL)](#a-table-with-a-primary-key) был очень полезен для ускорения [фильтрации по UserID](#the-primary-index-is-used-for-selecting-granules). Но этот индекс не оказывает значительной помощи в ускорении [фильтрации по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient), несмотря на то, что столбец URL является частью составного первичного ключа.

И наоборот:
Первичный индекс нашей [таблицы с составным первичным ключом (URL, UserID)](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) ускорял [фильтрацию по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient), но не оказывал большой поддержки [фильтрации по UserID](#the-primary-index-is-used-for-selecting-granules).

Из-за схожей высокой кардинальности столбцов первичного ключа UserID и URL, запрос, фильтрующий по второму ключевому столбцу, [не дает большого преимущества от его наличия в индексе](#generic-exclusion-search-algorithm).

Поэтому имеет смысл удалить второй ключевой столбец из первичного индекса (что приводит к меньшему использованию памяти индексом) и [использовать несколько первичных индексов](/guides/best-practices/sparse-primary-indexes#using-multiple-primary-indexes) вместо этого.

Однако, если ключевые столбцы в составном первичном ключе имеют большие различия в кардинальности, то [для запросов полезно](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) упорядочивать столбцы первичного ключа по возрастанию кардинальности.

Чем больше разница в кардинальности между ключевыми столбцами, тем больше важен порядок этих столбцов в ключе. Мы продемонстрируем это в следующем разделе.
## Эффективное упорядочение ключевых столбцов {#ordering-key-columns-efficiently}

<a name="test"></a>

В составном первичном ключе порядок ключевых столбцов может значительно влиять на обоих аспекта:
- эффективность фильтрации по вторичным ключевым столбцам в запросах и
- коэффициент сжатия для файлов данных таблицы.

Чтобы продемонстрировать это, мы будем использовать версию нашего [образца данных веб-трафика](#data-set), где каждая строка содержит три столбца, которые указывают, было ли отмечено обращение интернет-‘пользователя’ к URL (`UserID` столбец) как трафик от роботов (`URL` столбец).

Мы будем использовать сложный первичный ключ, содержащий все три вышеупомянутых столбца, которые могут быть использованы для ускорения типичных аналитических запросов, оценивающих
- сколько (в процентах) трафика на определенный URL поступает от роботов или
- насколько мы уверены, что конкретный пользователь (не) является роботом (какой процент трафика от этого пользователя предполагается (не) является трафиком от роботов)

Мы используем этот запрос для вычисления кардинальности трех столбцов, которые мы хотим использовать в качестве ключевых столбцов в сложном первичном ключе (обратите внимание, что мы используем [табличную функцию URL](/sql-reference/table-functions/url.md) для запроса к данным TSV ad hoc без необходимости создания локальной таблицы). Выполните этот запрос в `clickhouse client`:
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

Мы видим, что существует большая разница между кардинальностью, особенно между столбцами `URL` и `IsRobot`, и поэтому порядок этих столбцов в сложном первичном ключе значим как для эффективного ускорения запросов, фильтрующих по этим столбцам, так и для достижения оптимальных коэффициентов сжатия для файлов данных столбцев таблицы.

Чтобы продемонстрировать это, мы создадим две версии таблиц для наших данных анализа трафика роботов:
- таблица `hits_URL_UserID_IsRobot` с составным первичным ключом `(URL, UserID, IsRobot)`, где мы упорядочим ключевые столбцы по убыванию кардинальности
- таблица `hits_IsRobot_UserID_URL` с составным первичным ключом `(IsRobot, UserID, URL)`, где мы упорядочим ключевые столбцы по возрастанию кардинальности

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

И заполните её 8,87 миллионами строк:
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

Затем создайте таблицу `hits_IsRobot_UserID_URL` с составным первичным ключом `(IsRobot, UserID, URL)`:
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
И заполните её теми же 8,87 миллионами строк, которые мы использовали для заполнения предыдущей таблицы:

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

Когда запрос фильтрует хотя бы по одному столбцу, который является частью составного ключа, и это первый ключевой столбец, [тогда ClickHouse выполняет алгоритм бинарного поиска по меткам индексного столбца](#the-primary-index-is-used-for-selecting-granules).

Когда запрос фильтрует (только) по столбцу, который является частью составного ключа, но не является первым ключевым столбцом, [тогда ClickHouse использует алгоритм поиска исключений по меткам индексного столбца](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient).

Для второго случая порядок ключевых столбцов в составном первичном ключе значим для эффективности [алгоритма поиска исключений](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444).

Вот запрос, который фильтрует по столбцу `UserID` таблицы, где мы упорядочили ключевые столбцы `(URL, UserID, IsRobot)` по убыванию кардинальности:
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

Это тот же запрос для таблицы, где мы упорядочили ключевые столбцы `(IsRobot, UserID, URL)` по возрастанию кардинальности:
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
81.28 KB (6.61 million rows/s., 26.44 MB/s.)
```

Мы видим, что выполнение запроса значительно более эффективно и быстрее для таблицы, где мы упорядочили ключевые столбцы по возрастанию кардинальности.

Это связано с тем, что [алгоритм поиска исключений](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444) работает наиболее эффективно, когда [гранулы](#the-primary-index-is-used-for-selecting-granules) выбираются по вторичному ключевому столбцу, где предшествующий ключ столбец имеет более низкую кардинальность. Мы подробно иллюстрировали это в [предыдущем разделе](#generic-exclusion-search-algorithm) данного руководства.
### Оптимальное соотношение сжатия файлов данных {#optimal-compression-ratio-of-data-files}

Этот запрос сравнивает коэффициент сжатия столбца `UserID` между двумя таблицами, которые мы создали выше:

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
Это ответ:
```response
┌─Table───────────────────┬─Column─┬─Uncompressed─┬─Compressed─┬─Ratio─┐
│ hits_URL_UserID_IsRobot │ UserID │ 33.83 MiB    │ 11.24 MiB  │     3 │
│ hits_IsRobot_UserID_URL │ UserID │ 33.83 MiB    │ 877.47 KiB │    39 │
└─────────────────────────┴────────┴──────────────┴────────────┴───────┘

2 rows in set. Elapsed: 0.006 sec.
```
Мы видим, что отношение сжатия для столбца `UserID` значительно выше для таблицы, где мы отсортировали ключевые столбцы `(IsRobot, UserID, URL)` по кардинальности в порядке возрастания.

Хотя в обеих таблицах хранится точно одинаковые данные (мы вставили одинаковые 8.87 миллионов строк в обе таблицы), порядок ключевых столбцов в составном первичном ключе оказывает значительное влияние на то, сколько дискового пространства сжатые данные в [файлах данных столбца](#data-is-stored-on-disk-ordered-by-primary-key-columns) требуют:
- в таблице `hits_URL_UserID_IsRobot` с составным первичным ключом `(URL, UserID, IsRobot)`, где ключевые столбцы отсортированы по кардинальности в порядке убывания, файл данных `UserID.bin` занимает **11.24 MiB** дискового пространства
- в таблице `hits_IsRobot_UserID_URL` с составным первичным ключом `(IsRobot, UserID, URL)`, где ключевые столбцы отсортированы по кардинальности в порядке возрастания, файл данных `UserID.bin` занимает только **877.47 KiB** диска

Наличие хорошего коэффициента сжатия данных столбца таблицы на диске не только экономит место на диске, но и ускоряет выполнение запросов (особенно аналитических), требующих чтения данных из этого столбца, так как требуется меньше ввода-вывода для перемещения данных из диска в основную память (кэш файлов операционной системы).

Далее мы иллюстрируем, почему для коэффициента сжатия столбцов таблицы выгодно упорядочивать столбцы первичного ключа по кардинальности в порядке возрастания.

Диаграмма ниже показывает порядок строк на диске для первичного ключа, где ключевые столбцы упорядочены по кардинальности в порядке возрастания:

<Image img={sparsePrimaryIndexes14a} size="md" alt="Sparse Primary Indices 14a" background="white"/>

Мы обсуждали, что [данные строк таблицы хранятся на диске, упорядоченные по столбцам первичного ключа](#data-is-stored-on-disk-ordered-by-primary-key-columns).

На диаграмме выше, строки таблицы (их значения столбцов на диске) сначала упорядочены по их значению `cl`, и строки с одинаковым значением `cl` упорядочены по их значению `ch`. И потому что первый ключевой столбец `cl` имеет низкую кардинальность, вероятно, что существуют строки с одним и тем же значением `cl`. Из-за этого также вероятно, что значения `ch` упорядочены (локально - для строк с одинаковым значением `cl`).

Если в столбце схожие данные расположены близко друг к другу, например, через сортировку, то такие данные будут сжиматься лучше.
В общем, алгоритм сжатия выигрывает от длины рабочего диапазона данных (чем больше данных он видит, тем лучше сжатие) и локальности (чем более схожие данные, тем лучше коэффициент сжатия).

В отличие от диаграммы выше, диаграмма ниже показывает порядок строк на диске для первичного ключа, где ключевые столбцы упорядочены по кардинальности в порядке убывания:

<Image img={sparsePrimaryIndexes14b} size="md" alt="Sparse Primary Indices 14b" background="white"/>

Теперь строки таблицы сначала упорядочены по их значению `ch`, и строки с одинаковым значением `ch` упорядочены по их значению `cl`.
Но так как первый ключевой столбец `ch` имеет высокую кардинальность, маловероятно, что существуют строки с одинаковым значением `ch`. Из-за этого также маловероятно, что значения `cl` упорядочены (локально - для строк с одинаковым значением `ch`).

Таким образом, значения `cl`, скорее всего, находятся в случайном порядке и, следовательно, имеют плохую локальность и соотношение сжатия соответственно.
### Резюме {#summary-1}

Как для эффективной фильтрации по столбцам вторичного ключа в запросах, так и для коэффициента сжатия файлов данных столбцов таблицы выгодно упорядочивать столбцы в первичном ключе по их кардинальности в порядке возрастания.
### Сопутствующее содержание {#related-content-1}
- Блог: [Super charging your ClickHouse queries](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)
## Эффективное определение отдельных строк {#identifying-single-rows-efficiently}

Хотя в общем случае это [не](/knowledgebase/key-value) лучший сценарий использования ClickHouse,
иногда приложения, построенные на ClickHouse, требуют определения отдельных строк таблицы ClickHouse.

Интуитивное решение этой задачи может заключаться в использовании столбца [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) с уникальным значением на строку и для быстрого извлечения строк использовать этот столбец в качестве столбца первичного ключа.

Для самого быстрого извлечения столбец UUID [должен быть первым столбцом ключа](#the-primary-index-is-used-for-selecting-granules).

Мы обсуждали, что, так как [данные строк таблицы ClickHouse хранятся на диске, упорядоченные по столбцам первичного ключа](#data-is-stored-on-disk-ordered-by-primary-key-columns), наличие столбца с очень высокой кардинальностью (например, столбца UUID) в первичном ключе или в составном первичном ключе перед столбцами с более низкой кардинальностью [негативно сказывается на коэффициенте сжатия других столбцов таблицы](#optimal-compression-ratio-of-data-files).

Компромисс между самым быстрым извлечением и оптимальным сжатием данных заключается в использовании составного первичного ключа, где UUID является последним столбцом ключа, после столбцов ключа с низкой(ми) кардинальностью, которые используются для обеспечения хорошего коэффициента сжатия некоторых столбцов таблицы.
### Конкретный пример {#a-concrete-example}

Один конкретный пример — это сервис текстовых записей https://pastila.nl, который разработал Алексей Миловидов и [рассказал о этом в блоге](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/).

При каждом изменении текстовой области данные автоматически сохраняются в строке таблицы ClickHouse (одна строка на изменение).

И один из способов идентификации и извлечения (конкретной версии) вставленного контента — это использование хэша контента в качестве UUID для строки таблицы, содержащей контент.

Следующая диаграмма показывает:
- порядок вставки строк при изменении контента (например, из-за нажатий клавиш при вводе текста в текстовую область) и
- порядок данных на диске из вставленных строк при использовании `PRIMARY KEY (hash)`:

<Image img={sparsePrimaryIndexes15a} size="md" alt="Sparse Primary Indices 15a" background="white"/>

Поскольку столбец `hash` используется как столбец первичного ключа
- специфические строки могут быть извлечены [очень быстро](#the-primary-index-is-used-for-selecting-granules), но
- строки таблицы (их данные столбцов) хранятся на диске, упорядоченные по возрастанию уникальных и случайных значений хеша. Поэтому также значения столбца контента хранятся в случайном порядке без локальности данных, что приводит к **неоптимальному коэффициенту сжатия для файла данных столбца контента**.

Для того чтобы значительно улучшить коэффициент сжатия для столбца контента, при этом все ещё достигнув быстрого извлечения конкретных строк, pastila.nl использует два хеша (и составной первичный ключ) для идентификации конкретной строки:
- хеш контента, как было обсуждено выше, который отличается для разных данных, и
- [хеш чувствительный к локальности (отпечаток)](https://en.wikipedia.org/wiki/Locality-sensitive_hashing), который **не** изменяется при небольших изменениях данных.

Следующая диаграмма показывает:
- порядок вставки строк при изменении контента (например, из-за нажатий клавиш при вводе текста в текстовую область) и
- порядок данных на диске из вставленных строк при использовании составного `PRIMARY KEY (fingerprint, hash)`:

<Image img={sparsePrimaryIndexes15b} size="md" alt="Sparse Primary Indices 15b" background="white"/>

Теперь строки на диске сначала упорядочены по `fingerprint`, а для строк с одинаковым значением fingerprint, их значение `hash` определяет окончательный порядок.

Так как данные, которые отличаются только небольшими изменениями, получают одинаковое значение fingerprint, схожие данные теперь хранятся на диске близко друг к другу в столбце контента. И это очень хорошо для коэффициента сжатия столбца контента, так как алгоритм сжатия в общем выигрывает от локальности данных (чем более схожие данные, тем лучше коэффициент сжатия).

Компромисс заключается в том, что для извлечения конкретной строки требуется два поля (`fingerprint` и `hash`) для оптимального использования первичного индекса, который образуется от составного `PRIMARY KEY (fingerprint, hash)`.
