---
sidebar_label: 'Первичные индексы'
sidebar_position: 1
description: 'В этом руководстве мы подробно рассмотрим индексацию в ClickHouse.'
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

# Практическое введение в первичные индексы в ClickHouse
## Введение {#introduction}

В этом руководстве мы подробно рассмотрим индексацию в ClickHouse. Мы проиллюстрируем и обсудим:
- [как индексация в ClickHouse отличается от традиционных систем управления реляционными базами данных](#an-index-design-for-massive-data-scales)
- [как ClickHouse строит и использует разреженный первичный индекс таблицы](#a-table-with-a-primary-key)
- [какие лучшие практики существуют для индексации в ClickHouse](#using-multiple-primary-indexes)

Вы можете выполнять все SQL-операторы и запросы ClickHouse, указанные в этом руководстве, на своей машине.
Для установки ClickHouse и инструкций по началу работы, смотрите [Быстрый старт](/quick-start.mdx).

:::note
Это руководство фокусируется на разреженных первичных индексах ClickHouse.

Для вторичных индексов [data skipping indexes](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes) в ClickHouse смотрите [Учебник](/guides/best-practices/skipping-indexes.md).
:::
### Набор данных {#data-set}

На протяжении всего данного руководства мы будем использовать образец анонимизированных данных веб-трафика.

- Мы будем использовать подмножество из 8,87 миллиона строк (событий) из образца данных.
- Не сжатый размер данных составляет 8,87 миллиона событий и примерно 700 МБ. Это сжимается до 200 МБ при хранении в ClickHouse.
- В нашем подмножестве каждая строка содержит три колонки, которые указывают на интернет-пользователя (`UserID` колонка), который кликнул по URL (`URL` колонка) в определенное время (`EventTime` колонка).

С этими тремя колонками мы уже можем сформулировать некоторые типичные запросы веб-аналитики, такие как:

- "Какие 10 URL были доступны наиболее часто для конкретного пользователя?"
- "Какие 10 пользователей чаще всего кликали на конкретный URL?"
- "В какое время (например, дни недели) пользователь кликает на конкретный URL?"
### Тестовая машина {#test-machine}

Все данные о производительности, указанные в этом документе, основаны на запуске ClickHouse 22.2.1 локально на MacBook Pro с чипом Apple M1 Pro и 16 ГБ ОЗУ.
### Полное сканирование таблицы {#a-full-table-scan}

Чтобы увидеть, как выполняется запрос к нашему набору данных без первичного ключа, мы создаем таблицу (с движком таблицы MergeTree), выполнив следующий SQL DDL оператор:

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

Затем вставляем подмножество данных о кликах в таблицу с помощью следующего SQL оператора вставки.
Это использует [функцию таблицы URL](/sql-reference/table-functions/url.md) для загрузки подмножества полного набора данных, размещенного удаленно на clickhouse.com:

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

Вывод результата клиента ClickHouse показывает, что вышеуказанный оператор вставил 8.87 миллиона строк в таблицу.

Наконец, чтобы упростить обсуждения позже в этом руководстве и сделать диаграммы и результаты воспроизводимыми, мы [оптимизируем](/sql-reference/statements/optimize.md) таблицу, используя ключевое слово FINAL:

```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
В общем, не требуется и не рекомендуется сразу оптимизировать таблицу после загрузки данных в неё. Почему это необходимо для этого примера станет очевидно позже.
:::

Теперь мы выполняем наш первый запрос веб-аналитики. Следующий запрос вычисляет 10 наиболее кликаемых URL для интернет-ползователя с UserID 749927693:

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
// highlight-next-line
Processed 8.87 million rows,
70.45 MB (398.53 million rows/s., 3.17 GB/s.)
```

Вывод результата клиента ClickHouse указывает на то, что ClickHouse выполнил полное сканирование таблицы! Каждая отдельная строка из 8.87 миллиона строк нашей таблицы была передана в ClickHouse. Это не масштабируется.

Чтобы сделать это (в разы) более эффективным и (гораздо) быстрее, нам нужно использовать таблицу с подходящим первичным ключом. Это позволит ClickHouse автоматически (на основе колонок первичного ключа) создать разреженный первичный индекс, который затем может быть использован для значительного ускорения выполнения нашего примера запроса.
### Связанный контент {#related-content}
- Блог: [Ускорьте ваши запросы ClickHouse](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)
## Дизайн индексов ClickHouse {#clickhouse-index-design}
### Дизайн индекса для масштабов больших данных {#an-index-design-for-massive-data-scales}

В традиционных системах управления реляционными базами данных первичный индекс будет содержать одну запись на каждую строку таблицы. Это приведет к тому, что первичный индекс будет содержать 8,87 миллиона записей для нашего набора данных. Такой индекс позволяет быстро находить конкретные строки, что обеспечивает высокую эффективность запросов на поиск и точные обновления. Поиск записи в структуре данных `B(+)-Tree` имеет среднюю временную сложность `O(log n)`; более точно, `log_b n = log_2 n / log_2 b`, где `b` - это степень разветвления `B(+)-Tree`, а `n` - количество индексированных строк. Поскольку `b` обычно находится в пределах нескольких сотен и нескольких тысяч, `B(+)-Trees` являются очень плоскими структурами, и для поиска записей требуется немного обращений к диску. При 8,87 миллиона строках и степени разветвления 1000 в среднем требуется 2,3 обращения к диску. Эта способность приносит с собой свои расходы: дополнительные затраты на диск и память, более высокие затраты на вставку при добавлении новых строк и записей в индекс, а иногда и перераспределение B-дерева.

Учитывая проблемы, связанные с индексами B-дерева, движки таблиц в ClickHouse используют другой подход. Семейство [MergeTree Engine](/engines/table-engines/mergetree-family/index.md) ClickHouse было разработано и оптимизировано для обработки массивов больших объемов данных. Эти таблицы спроектированы для получения миллионов вставок строк в секунду и хранения очень больших объемов данных (сотни петабайт). Данные быстро записываются в таблицу [частями](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage), с правилами для объединения частей в фоновом режиме. В ClickHouse каждая часть имеет свой собственный первичный индекс. Когда части объединяются, первичные индексы объединенных частей также сливаются. На очень большом масштабе, для которого предназначен ClickHouse, крайне важно быть очень эффективным в использовании диска и памяти. Поэтому вместо индексации каждой строки первичный индекс для части содержит одну запись индекса (известную как 'mark') на группу строк (называемую 'granule') - эта техника называется **разреженный индекс**.

Разреженная индексация возможна, поскольку ClickHouse хранит строки части на диске в порядке, определяемом колонками первичного ключа. Вместо прямого нахождения отдельных строк (как и в индексе на основе B-дерева), разреженный первичный индекс позволяет ему быстро (через бинарный поиск по записям индекса) идентифицировать группы строк, которые могут соответствовать запросу. Найденные группы потенциально подходящих строк (гранулы) затем параллельно передаются в движок ClickHouse для нахождения совпадений. Этот дизайн индекса позволяет делать первичный индекс небольшим (он может и должен полностью помещаться в основную память), при этом значительно ускоряя время выполнения запросов: особенно для диапазонных запросов, которые типичны для случаев использования аналитики данных.

Следующий раздел детализирует, как ClickHouse строит и использует свой разреженный первичный индекс. Позже в статье мы обсудим некоторые лучшие практики выбора, удаления и упорядочивания колонок таблицы, которые используются для построения индекса (колонки первичного ключа).
### Таблица с первичным ключом {#a-table-with-a-primary-key}

Создайте таблицу, которая имеет составной первичный ключ с ключевыми колонками UserID и URL:

```sql
CREATE TABLE hits_UserID_URL
(
    `UserID` UInt32,
    `URL` String,
    `EventTime` DateTime
)
ENGINE = MergeTree
// highlight-next-line
PRIMARY KEY (UserID, URL)
ORDER BY (UserID, URL, EventTime)
SETTINGS index_granularity = 8192, index_granularity_bytes = 0, compress_primary_key = 0;
```

[//]: # (<details open>)
<details>
    <summary>
    Подробности оператора DDL
    </summary>
    <p>

Для упрощения обсуждений далее в этом руководстве, а также для того, чтобы диаграммы и результаты были воспроизводимыми, DDL оператор:

<ul>
  <li>
    Указывает составной ключ сортировки для таблицы через условие <code>ORDER BY</code>.
  </li>
  <li>
    Явно контролирует, сколько записей индекса будет в первичном индексе, через настройки:
    <ul>
      <li>
        <code>index_granularity</code>: явно установлен на его значение по умолчанию 8192. Это означает, что для каждой группы из 8192 строк первичный индекс будет иметь одну запись индекса. Например, если таблица содержит 16384 строки, индекс будет иметь две записи индекса.
      </li>
      <li>
        <code>index_granularity_bytes</code>: установлен на 0, чтобы отключить <a href="https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1" target="_blank">адаптивную гранулярность индекса</a>. Адаптивная гранулярность индекса означает, что ClickHouse автоматически создает одну запись индекса для группы из n строк, если выполняется хотя бы одно из следующих условий:
        <ul>
          <li>
            Если <code>n</code> меньше 8192, и размер объединенных данных строки для этих <code>n</code> строк больше или равен 10 МБ (значение по умолчанию для <code>index_granularity_bytes</code>).
          </li>
          <li>
            Если общий размер данных строки для <code>n</code> строк меньше 10 МБ, но <code>n</code> равен 8192.
          </li>
        </ul>
      </li>
      <li>
        <code>compress_primary_key</code>: установлен на 0, чтобы отключить <a href="https://github.com/ClickHouse/ClickHouse/issues/34437" target="_blank">сжатие первичного индекса</a>. Это позволит нам при необходимости позже исследовать его содержимое.
      </li>
    </ul>
  </li>
</ul>

</p>
</details>

Первичный ключ в вышеуказанном DDL операторе приводит к созданию первичного индекса на основе двух указанных ключевых колонок.

<br/>
Затем вставьте данные:

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
Мы можем использовать следующий запрос, чтобы получить метаданные о нашей таблице:

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

- Данные таблицы хранятся в [широком формате](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) в конкретном каталоге на диске, что означает, что для каждой колонки таблицы будет один файл данных (и один файл меток) в этом каталоге.
- Таблица имеет 8,87 миллиона строк.
- Нерасжатый размер данных всех строк вместе составляет 733,28 МБ.
- Сжатый размер на диске всех строк вместе составляет 206,94 МБ.
- Таблица имеет первичный индекс с 1083 записями (называемыми 'marks') и размер индекса составляет 96,93 КБ.
- В общей сложности данные таблицы и файлы меток и файл первичного индекса вместе занимают 207,07 МБ на диске.
### Данные хранятся на диске в порядке колонок первичного ключа {#data-is-stored-on-disk-ordered-by-primary-key-columns}

Наша таблица, которую мы создали выше, имеет
- составной [первичный ключ](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)` и
- составной [ключ сортировки](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)`.

:::note
- Если бы мы указали только ключ сортировки, то первичный ключ был бы неявно определён равным ключу сортировки.

- Чтобы быть эффективным по памяти, мы явно указали первичный ключ, который содержит только колонки, по которым наши запросы фильтруют. Первичный индекс, основанный на первичном ключе, полностью загружается в основную память.

- Чтобы обеспечить согласованность диаграмм и максимизировать коэффициент сжатия, мы определили отдельный ключ сортировки, который включает все колонки нашей таблицы (если в колонке похожие данные размещены близко друг к другу, например, через сортировку, то эти данные будут лучше сжаты).

- Первичный ключ должен быть префиксом ключа сортировки, если оба они указаны.
:::

Вставленные строки хранятся на диске в лексикографическом порядке (по возрастанию) по колонкам первичного ключа (и дополнительной колонке `EventTime` из ключа сортировки).

:::note
ClickHouse допускает вставку нескольких строк с одинаковыми значениями колонок первичного ключа. В этом случае (см. строку 1 и строку 2 на диаграмме ниже) окончательный порядок определяется указанным ключом сортировки и, следовательно, значением колонки `EventTime`.
:::

ClickHouse является <a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms" target="_blank">колоночной системой управления базами данных</a>. Как показано на диаграмме ниже
- для представления на диске есть один файл данных (*.bin) на каждую колонку таблицы, где все значения для этой колонки хранятся в <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">сжатом</a> формате, и
- 8,87 миллиона строк хранятся на диске в лексикографическом порядке по колонкам первичного ключа (и дополнительным колонкам сортировки), то есть в данном случае
  - сначала по `UserID`,
  - затем по `URL`,
  - и, наконец, по `EventTime`:

<img src={sparsePrimaryIndexes01} class="image"/>

`UserID.bin`, `URL.bin` и `EventTime.bin` — это файлы данных на диске, где хранятся значения колонок `UserID`, `URL` и `EventTime`.

<br/>
<br/>

:::note
- Поскольку первичный ключ определяет лексикографический порядок строк на диске, у таблицы может быть только один первичный ключ.

- Мы нумеруем строки, начиная с 0, чтобы соответствовать внутренней схеме нумерации строк ClickHouse, которая также используется для сообщений журнала.
:::
### Данные организованы в гранулы для параллельной обработки {#data-is-organized-into-granules-for-parallel-data-processing}

Для целей обработки данных значения колонок таблицы логически делятся на гранулы.
Гранула — это наименьший неделимый набор данных, который передается в ClickHouse для обработки данных.
Это означает, что вместо чтения отдельных строк ClickHouse всегда читает (в потоковом режиме и параллельно) целую группу (гранулу) строк.
:::note
Значения колонок физически не хранятся внутри гранул: гранулы — это лишь логическая организация значений колонок для обработки запросов.
:::

Следующая диаграмма показывает, как (значения колонок из) 8,87 миллиона строк нашей таблицы
организованы в 1083 гранулы, в результате выполнения DDL оператора таблицы, содержащего настройку `index_granularity` (установленную на его значение по умолчанию 8192).

<img src={sparsePrimaryIndexes02} class="image"/>

Первые (в соответствии с физическим порядком на диске) 8192 строки (их значения колонок) логически принадлежат грануле 0, затем следующие 8192 строки (их значения колонок) принадлежат грануле 1 и так далее.

:::note
- Последняя гранула (гранула 1082) "содержит" менее 8192 строк.

- Мы упоминали в начале этого руководства в разделе "Подробности оператора DDL", что мы отключили [адаптивную гранулярность индекса](/whats-new/changelog/2019.md/#experimental-features-1) (чтобы упростить обсуждения в этом руководстве, а также сделать диаграммы и результаты воспроизводимыми).

  Поэтому все гранулы (кроме последней) в примере нашей таблицы имеют одинаковый размер.

- Для таблиц с адаптивной гранулярностью индекса (гранулярность индекса по [умолчанию](/operations/settings/merge-tree-settings#index_granularity_bytes) адаптивная, размер некоторых гранул может быть меньше 8192 строк в зависимости от размеров данных строк.

- Мы выделили некоторые значения колонок из наших колонок первичного ключа (`UserID`, `URL`) оранжевым цветом.
  Эти выделенные оранжевым цветом значения колонок являются значениями колонок первичного ключа каждой первой строки каждой гранулы.
  Как мы увидим ниже, эти выделенные оранжевым цветом значения колонок будут записями в первичном индексе таблицы.

- Мы нумеруем гранулы, начиная с 0, чтобы соответствовать внутренней схеме нумерации ClickHouse, которая также используется для сообщений журнала.
:::
### Первичный индекс имеет одну запись на каждую гранулу {#the-primary-index-has-one-entry-per-granule}

Первичный индекс создается на основе гранул, показанных на диаграмме выше. Этот индекс представляет собой не сжатый плоский массив файлов (primary.idx), содержащий так называемые числовые метки индекса, начиная с 0.

На диаграмме ниже показано, что индекс хранит значения колонок первичного ключа (значения, отмеченные оранжевым цветом на диаграмме выше) для каждой первой строки каждой гранулы.
Иными словами, первичный индекс хранит значения колонок первичного ключа из каждой 8192-й строки таблицы (на основе физического порядка строк, определенного колонками первичного ключа).
Например,
- первая запись индекса (‘метка 0’ на диаграмме ниже) хранит значения ключевых колонок первой строки гранулы 0 из диаграммы выше,
- вторая запись индекса (‘метка 1’ на диаграмме ниже) хранит значения ключевых колонок первой строки гранулы 1 из диаграммы выше, и так далее.

<img src={sparsePrimaryIndexes03a} class="image"/>

Всего индекс содержит 1083 записи для нашей таблицы с 8.87 миллионами строк и 1083 гранулами:

<img src={sparsePrimaryIndexes03b} class="image"/>

:::note
- Для таблиц с [адаптивной гранулярностью индекса](/whats-new/changelog/2019.md/#experimental-features-1) в первичном индексе также хранится одна "финальная" добавочная метка, которая записывает значения колонок первичного ключа последней строки таблицы. Однако, поскольку мы отключили адаптивную гранулярность индекса (чтобы упростить обсуждение в этом руководстве, а также сделать диаграммы и результаты воспроизводимыми), индекс нашей примерной таблицы не включает эту финальную метку.

- Файл первичного индекса полностью загружается в оперативную память. Если размер файла превышает доступное свободное место в памяти, ClickHouse выдаст ошибку.
:::

<details>
    <summary>
    Изучение содержимого первичного индекса
    </summary>
    <p>

На самоуправляемом кластере ClickHouse мы можем использовать <a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">функцию file</a> для изучения содержимого первичного индекса нашей примерной таблицы.

Для этого сначала нам необходимо скопировать файл первичного индекса в <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a> узла из работающего кластера:
<ul>
<li>Шаг 1: Получить часть пути, содержащую файл первичного индекса</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

возвращает `/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4` на тестовой машине.

<li>Шаг 2: Получить user_files_path</li>
<a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">Путь user_files_path по умолчанию</a> на Linux:
`/var/lib/clickhouse/user_files/`

и на Linux вы можете проверить, был ли он изменен: `$ grep user_files_path /etc/clickhouse-server/config.xml`

На тестовой машине путь: `/Users/tomschreiber/Clickhouse/user_files/`


<li>Шаг 3: Скопировать файл первичного индекса в user_files_path</li>

`cp /Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4/primary.idx /Users/tomschreiber/Clickhouse/user_files/primary-hits_UserID_URL.idx`

<br/>

</ul>

Теперь мы можем исследовать содержание первичного индекса через SQL:
<ul>
<li>Получить количество записей</li>
`
SELECT count( )<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String');
`

<br/>
<br/>
возвращает `1083`
<br/>
<br/>
<li>Получить первые две метки индекса</li>
`
SELECT UserID, URL<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 0, 2;
`
<br/>
<br/>
возвращает
<br/>
`
240923, http://showtopics.html%3...<br/>
4073710, http://mk.ru&pos=3_0
`
<br/>
<br/>
<li>Получить последнюю метку индекса</li>
`
SELECT UserID, URL<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 1082, 1;
`
<br/>
<br/>
возвращает
<br/>
`
4292714039 │ http://sosyal-mansetleri...
`



</ul>

Это точно соответствует нашей диаграмме содержимого первичного индекса для нашей примерной таблицы:
<img src={sparsePrimaryIndexes03b} class="image"/>
</p>
</details>

Записи первичного ключа называются метками индекса, потому что каждая запись индекса помечает начало конкретного диапазона данных. В частности, для примерной таблицы:
- Метки индекса UserID:<br/>
  Хранимые значения `UserID` в первичном индексе отсортированы в порядке возрастания.<br/>
  Таким образом, ‘метка 1’ на диаграмме выше указывает на то, что значения `UserID` всех строк таблицы в грануле 1 и всех последующих гранул гарантированно больше или равны 4.073.710.

 [Как мы увидим позже](#the-primary-index-is-used-for-selecting-granules), этот глобальный порядок позволяет ClickHouse использовать <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">алгоритм бинарного поиска</a> по меткам индекса для первой колонки ключа, когда запрос фильтрует по первой колонке первичного ключа.

- Метки индекса URL:<br/>
  Довольно схожая кардинальность колонок первичного ключа `UserID` и `URL`
  означает, что метки индекса для всех ключевых колонок после первой, как правило, только указывают на диапазон данных, если значение предшествующей ключевой колонки остается неизменным для всех строк таблицы по крайней мере в текущей грануле.<br/>
 Например, поскольку значения UserID метки 0 и метки 1 различны на диаграмме выше, ClickHouse не может предположить, что все значения URL всех строк таблицы в грануле 0 больше или равны `'http://showtopics.html%3...'`. Однако если бы значения UserID метки 0 и метки 1 были одинаковыми на диаграмме выше (что означает, что значение UserID остается тем же для всех строк таблицы в грануле 0), ClickHouse мог бы предположить, что все значения URL всех строк таблицы в грануле 0 больше или равны `'http://showtopics.html%3...'`.

  Мы обсудим последствия этого для производительности выполнения запросов более подробно позже.
### Первичный индекс используется для выбора гранул {#the-primary-index-is-used-for-selecting-granules}

Теперь мы можем выполнять наши запросы с поддержкой первичного индекса.

Следующий запрос вычисляет 10 наиболее кликабельных URL для UserID 749927693.

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
// highlight-next-line
Обработано 8.19 тысяч строк,
740.18 КБ (1.53 миллиона строк/с., 138.59 МБ/с.)
```

Вывод для клиента ClickHouse теперь показывает, что вместо полной проверки таблицы, в ClickHouse были переданы только 8.19 тысяч строк.

Если <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">включено трассировочное журналирование</a>, то файл журнала сервера ClickHouse показывает, что ClickHouse выполнил <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">бинарный поиск</a> по 1083 меткам индекса UserID, чтобы определить гранулы, которые потенциально могут содержать строки со значением колонки UserID `749927693`. Это требует 19 шагов со средней временной сложностью `O(log2 n)`:
```response
...Executor): Условие ключа: (колонка 0 в [749927693, 749927693])
// highlight-next-line
...Executor): Выполняется бинарный поиск по диапазону индекса для части all_1_9_2 (1083 меток)
...Executor): Найдена (ЛЕВАЯ) граница метки: 176
...Executor): Найдена (ПРАВАЯ) граница метки: 177
...Executor): Найден непрерывный диапазон за 19 шагов
...Executor): Выбраны 1/1 части по ключу партиции, 1 часть по первичному ключу,
// highlight-next-line
              1/1083 метки по первичному ключу, 1 метка для чтения из 1 диапазонов
...Чтение ...примерно 8192 строки, начиная с 1441792
```


Мы видим в трассировочном журнале выше, что одна метка из 1083 существующих меток удовлетворила запрос.

<details>
    <summary>
    Подробности трассировочного журнала
    </summary>
    <p>

Меткой 176 была идентифицирована (левая граница - включительная, правая граница - исключительная), и поэтому все 8192 строки из гранулы 176 (которая начинается с строки 1.441.792 - мы увидим это позже в нашем руководстве) затем передаются в ClickHouse для поиска фактических строк со значением колонки UserID `749927693`.
</p>
</details>

Мы также можем воспроизвести это, используя <a href="https://clickhouse.com/docs/sql-reference/statements/explain/" target="_blank">клаузу EXPLAIN</a> в нашем примерном запросе:
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
│   Ограничение (предварительный LIMIT (без OFFSET))                                   │
│     Сортировка (Сортировка для ORDER BY)                                             │
│       Выражение (Перед ORDER BY)                                                     │
│         Агрегирование                                                                  │
│           Выражение (Перед GROUP BY)                                                 │
│             Фильтр (WHERE)                                                           │
│               Установка Ограничений и Лимитов (Задать ограничения и квоты после чтения из хранилища) │
│                 ЧтениеИзMergeTree                                                     │
│                 Индексы:                                                               │
│                   PrimaryKey                                                          │
│                     Ключи:                                                             │
│                       UserID                                                          │
│                     Условие: (UserID в [749927693, 749927693])                     │
│                     Части: 1/1                                                        │
// highlight-next-line
│                     Гранулы: 1/1083                                                  │
└───────────────────────────────────────────────────────────────────────────────────────┘

16 строк в наборе. Время выполнения: 0.003 сек.
```
Вывод клиента показывает, что одна из 1083 гранул была выбрана как потенциально содержащая строки со значением колонки UserID 749927693.

:::note Заключение
Когда запрос фильтрует по колонке, которая является частью составного ключа и является первой колоночной ключом, ClickHouse выполняет бинарный поиск по меткам индекса колонки ключа.
:::

<br/>

Как обсуждалось выше, ClickHouse использует свой разреженный первичный индекс для быстрого (через бинарный поиск) выбора гранул, которые могут потенциально содержать строки, соответствующие запросу.

Это **первая стадия (выбор гранулы)** выполнения запроса ClickHouse.

Во **второй стадии (чтение данных)** ClickHouse находит выбранные гранулы, чтобы передать все их строки в движок ClickHouse, чтобы найти строки, которые фактически соответствуют запросу.

Эту вторую стадию мы обсудим более подробно в следующем разделе.
### Файлы меток используются для нахождения гранул {#mark-files-are-used-for-locating-granules}

Следующая диаграмма иллюстрирует часть файла первичного индекса для нашей таблицы.

<img src={sparsePrimaryIndexes04} class="image"/>

Как обсуждалось выше, через бинарный поиск по 1083 меткам UserID была выявлена метка 176. Следовательно, соответствующая гранула 176 потенциально может содержать строки со значением колонки UserID 749.927.693.

<details>
    <summary>
    Подробности выбора гранулы
    </summary>
    <p>

Диаграмма выше показывает, что метка 176 является первой записью индекса, где минимальное значение UserID связанной гранулы 176 меньше 749.927.693, а минимальное значение UserID гранулы 177 для следующей метки (метка 177) больше этого значения. Поэтому только соответствующая гранула 176 для метки 176 может потенциально содержать строки со значением UserID 749.927.693.
</p>
</details>

Чтобы подтвердить (или опровергнуть), что некоторые строки в грануле 176 содержат значение UserID 749.927.693, все 8192 строки, принадлежащие этой грануле, необходимо передать в ClickHouse.

Для этого ClickHouse должен знать физическое местоположение гранулы 176.

В ClickHouse физические расположения всех гранул для нашей таблицы хранятся в файлах меток. Аналогично файловым данным, для каждой колонки таблицы существует один файл меток.

Следующая диаграмма показывает три файла меток `UserID.mrk`, `URL.mrk` и `EventTime.mrk`, которые хранят физические местоположения гранул для колонок `UserID`, `URL` и `EventTime` таблицы.
<img src={sparsePrimaryIndexes05} class="image"/>

Мы обсудили, что первичный индекс представляет собой плоский не сжатый массив файлов (primary.idx), содержащий метки индекса, которые нумеруются, начиная с 0.

Аналогично, файл меток также представляет собой плоский не сжатый массив файлов (*.mrk), содержащий метки, которые нумеруются, начиная с 0.

Как только ClickHouse идентифицирует и выбирает метку индекса для гранулы, которая может потенциально содержать строки, соответствующие запросу, может быть выполнен поиск по массиву в файлах меток для получения физических местоположений гранулы.

Каждая запись в файле меток для конкретной колонки хранит два местоположения в виде смещений:

- Первое смещение ('block_offset' на диаграмме выше) указывает на <a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">блок</a> в <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">сжатом</a> файле данных колонок, который содержит сжатую версию выбранной гранулы. Этот сжатый блок потенциально содержит несколько сжатых гранул. Найденный сжатый файл блока раскрашивается в оперативную память при чтении.

- Второе смещение ('granule_offset' на диаграмме выше) из файла меток предоставляет местоположение гранулы в рамках не сжатого блока данных.

Все 8192 строки, принадлежащие найденной не сжатой грануле, затем передаются в ClickHouse для дальнейшей обработки.

:::note

- Для таблиц с [широким форматом](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) и без [адаптивной гранулярности индекса](/whats-new/changelog/2019.md/#experimental-features-1) ClickHouse использует файлы меток `.mrk`, как визуализировано выше, которые содержат записи с двумя адресами по 8 байт на каждую запись. Эти записи являются физическими местоположениями гранул, которые все имеют одинаковый размер.

 Гранулярность индекса адаптивна по [умолчанию](/operations/settings/merge-tree-settings#index_granularity_bytes), но для нашей примерной таблицы мы отключили адаптивную гранулярность индекса (чтобы упростить обсуждения в этом руководстве, а также сделать диаграммы и результаты воспроизводимыми). Наша таблица использует широкий формат, так как размер данных больше [min_bytes_for_wide_part](/operations/settings/merge-tree-settings#min_bytes_for_wide_part) (который по умолчанию составляет 10 МБ для самоуправляемых кластеров).

- Для таблиц с широким форматом и с адаптивной гранулярностью индекса ClickHouse использует файлы меток `.mrk2`, которые содержат аналогичные записи с файлам `.mrk`, но с дополнительным третьим значением на каждую запись: количество строк гранулы, к которой относится текущая запись.

- Для таблиц с [компактным форматом](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) ClickHouse использует файлы меток `.mrk3`.

:::

:::note Почему файлы меток

Почему первичный индекс не содержит непосредственно физических местоположений гранул, соответствующих меткам индекса?

Потому что на таком очень большом масштабе, для которого ClickHouse и был разработан, важно быть очень эффективным в отношении использования диска и памяти.

Файл первичного индекса должен вмещаться в оперативную память.

Для нашего примерного запроса ClickHouse использовал первичный индекс и выбрал одну гранулу, которая может потенциально содержать строки, соответствующие нашему запросу. Только для этой одной гранулы ClickHouse затем требует физических местоположений, чтобы передать соответствующие строки для дальнейшей обработки.

Кроме того, эта информация о смещении нужна только для колонок UserID и URL.

Информация о смещении не требуется для колонок, которые не используются в запросе, например, для `EventTime`.

Для нашего примерного запроса ClickHouse требуется только два физических местоположения для гранулы 176 в файле данных UserID (UserID.bin) и два физических местоположения для гранулы 176 в файле данных URL (URL.bin).

Указание, предоставляемое файлами меток, избегает хранения непосредственно в первичном индексе записей для всех 1083 гранул для всех трех колонок: таким образом, избегая наличия ненужного (возможно, неиспользуемого) объема в оперативной памяти.
:::

Следующая диаграмма и текст ниже иллюстрируют, как для нашего примерного запроса ClickHouse находит гранулу 176 в файле данных UserID.bin.

<img src={sparsePrimaryIndexes06} class="image"/>

Ранее мы обсуждали в этом руководстве, что ClickHouse выбрал метку первичного индекса 176 и, следовательно, гранулу 176, как потенциально содержащую строки, соответствующие нашему запросу.

Теперь ClickHouse использует выбранный номер метки (176) из индекса для поиска в массиве по файлу меток UserID.mrk, чтобы получить два смещения для нахождения гранулы 176.

Как показано, первое смещение указывает на сжатый файл блока в файле данных UserID.bin, который в свою очередь содержит сжатую версию гранулы 176.

Как только найденный блок файла раскрашивается в оперативную память, второе смещение из файла меток может быть использовано для нахождения гранулы 176 в рамках не сжатых данных.

ClickHouse необходимо найти (и передать все значения из) гранулы 176 как из файла данных UserID.bin, так и из файла данных URL.bin, для выполнения нашего примерного запроса (топ 10 наиболее кликабельных URL для интернет-пользователя с UserID 749.927.693).

Диаграмма выше показывает, как ClickHouse находит гранулу для файла данных UserID.bin.

Параллельно ClickHouse выполняет то же самое для гранулы 176 для файла данных URL.bin. Обе соответствующие гранулы выравниваются и передаются в движок ClickHouse для дальнейшей обработки, т.е. агрегации и подсчета значений URL по группам для всех строк, где UserID равен 749.927.693, прежде чем в конечном итоге вывести 10 крупнейших групп URL в порядке убывания количества.
## Использование нескольких первичных индексов {#using-multiple-primary-indexes}

<a name="filtering-on-key-columns-after-the-first"></a>
### Вторичные ключевые колонки могут (не) иметь низкую эффективность {#secondary-key-columns-can-not-be-inefficient}

Когда запрос фильтрует по колонке, которая является частью составного ключа и является первой колонкой ключа, [тогда ClickHouse выполняет бинарный поиск по меткам индекса колонки ключа](#the-primary-index-is-used-for-selecting-granules).

Но что происходит, когда запрос фильтрует по колонке, которая является частью составного ключа, но не является первой колонкой ключа?

:::note
Мы обсуждаем сценарий, когда запрос явно не фильтрует по первой колонке ключа, а по вторичной колонке ключа.

Когда запрос фильтрует по обеим колонкам ключа и по любой колонке (или колонкам) ключа после первой, то ClickHouse выполняет бинарный поиск по меткам индекса первой колонки ключа.
:::

<br/>
<br/>

<a name="query-on-url"></a>
Мы используем запрос, который вычисляет 10 пользователей, которые чаще всего кликали на URL "http://public_search":

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
// highlight-next-line
Обработано 8.81 миллиона строк,
799.69 МБ (102.11 миллиона строк/с., 9.27 ГБ/с.)
```

Вывод клиента указывает на то, что ClickHouse почти выполнил полное сканирование таблицы, несмотря на то, что [колонка URL является частью составного первичного ключа](#a-table-with-a-primary-key)! ClickHouse считывает 8.81 миллиона строк из 8.87 миллиона строк таблицы.

Если [trace_logging](/operations/server-configuration-parameters/settings#logger) включено, то файл журнала сервера ClickHouse показывает, что ClickHouse использовал <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">алгоритм общего исключения</a> по 1083 меткам индекса URL, чтобы определить те гранулы, которые потенциально могут содержать строки со значением колонки URL "http://public_search":
```response
...Executor): Условие ключа: (колонка 1 в ['http://public_search',
                                           'http://public_search'])
// highlight-next-line
...Executor): Выполнен общий исключающий поиск по индексу для части all_1_9_2
              с 1537 шагами
...Executor): Выбраны 1/1 частей по ключу партиции, 1 часть по первичному ключу,
// highlight-next-line
              1076/1083 меток по первичному ключу, 1076 меток для чтения из 5 диапазонов
...Executor): Чтение примерно 8814592 строк с 10 потоками
```
Мы видим в приведенном выше трассировочном журнале, что 1076 (через метки) из 1083 гранул были выбраны как потенциально содержащие строки с соответствующим значением URL.

Это приводит к тому, что 8.81 миллиона строк передаются в движок ClickHouse (параллельно, используя 10 потоков), чтобы идентифицировать строки, которые фактически содержат значение URL "http://public_search".

Однако, как мы увидим позже, только 39 гранул из выбранных 1076 гранул действительно содержат соответствующие строки.

Хотя первичный индекс, основанный на составном первичном ключе (UserID, URL), был весьма полезен для ускорения запросов, фильтрующих строки с конкретным значением UserID, индекс не предоставляет существенной помощи в ускорении запроса, который фильтрует строки с конкретным значением URL.

Причина этого заключается в том, что колонка URL не является первой колонкой ключа, и поэтому ClickHouse использует алгоритм общего исключения (вместо бинарного поиска) по меткам индекса колонки URL, и **эффективность этого алгоритма зависит от различия в кардинальности** между колонкой URL и ее предшествующей ключевой колонкой UserID.

Чтобы проиллюстрировать это, мы предоставляем некоторые детали о том, как работает алгоритм общего исключения.

<a name="generic-exclusion-search-algorithm"></a>
### Алгоритм общего исключения {#generic-exclusion-search-algorithm}

Следующее иллюстрирует, как работает <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank">алгоритм общего исключения ClickHouse</a>, когда гранулы выбираются через вторичную колонку, где предшествующая ключевая колонка имеет низкую или высокую кардинальность.

В качестве примера для обоих случаев мы предположим:
- запрос, который ищет строки со значением URL = "W3".
- абстрактную версию нашей таблицы hits с упрощенными значениями для UserID и URL.
- тот же составной первичный ключ (UserID, URL) для индекса. Это означает, что строки сначала упорядочиваются по значениям UserID. Строки с одинаковым значением UserID затем упорядочиваются по URL.
- размер гранулы два, то есть каждая гранула содержит две строки.

Мы отметили значения ключевых колонок для первых строк таблицы для каждой гранулы оранжевым цветом на диаграммах ниже.

**Предшествующая ключевая колонка имеет низкую кардинальность**<a name="generic-exclusion-search-fast"></a>

Допустим, UserID имеет низкую кардинальность. В этом случае маловероятно, что одно и то же значение UserID распределяется по нескольким строкам таблицы и гранулам, и, следовательно, по меткам индексов. Для меток индекса с одинаковым UserID значения URL для меток индекса сортируются в порядке возрастания (поскольку строки таблицы упорядочены сначала по UserID, а затем по URL). Это позволяет эффективно фильтровать, как описано ниже:
<img src={sparsePrimaryIndexes07} class="image"/>

Существуют три разные сценария для процесса выбора гранул для наших абстрактных образцов данных на приведенной выше диаграмме:

1.  Метка индекса 0, для которой **значение URL меньше W3, и значение URL непосредственно следующей метки также меньше W3**, может быть исключена, потому что метка 0 и 1 имеют одно и то же значение UserID. Обратите внимание, что это условие исключения гарантирует, что гранула 0 полностью состоит из значений UserID U1, что позволяет ClickHouse предполагать, что и максимальное значение URL в грануле 0 меньше W3, и исключить гранулу.

2. Метка индекса 1, для которой **значение URL меньше (или равно) W3, и значение URL непосредственно следующей метки больше (или равно) W3**, выбирается, потому что это означает, что гранула 1 может потенциально содержать строки со значением URL W3.

3. Метки индексов 2 и 3, для которых **значение URL больше W3**, могут быть исключены, так как метки индекса первичного индекса хранят значения ключевых колонок для первой строки таблицы для каждой гранулы, а строки таблицы отсортированы на диске по значениям ключевых колонок, таким образом гранулы 2 и 3 не могут содержать значение URL W3.

**Предшествующая ключевая колонка имеет высокую кардинальность**<a name="generic-exclusion-search-slow"></a>

Когда UserID имеет высокую кардинальность, маловероятно, что одно и то же значение UserID распределяется по нескольким строкам таблицы и гранулам. Это означает, что значения URL для меток индекса не увеличиваются монотонно:

<img src={sparsePrimaryIndexes08} class="image"/>

Как мы видим на приведенной выше диаграмме, все показанные метки, у которых значения URL меньше W3, выбираются для передачи строк ассоциированных гранул в движок ClickHouse.

Это происходит, потому что, хотя все метки индекса на диаграмме подпадают под 1 сценарий, описанный выше, они не удовлетворяют упомянутому условию исключения, что *непосредственно следующая метка должна иметь то же значение UserID, что и текущая метка*, и таким образом не могут быть исключены.

Например, рассмотрим метку индекса 0, для которой **значение URL меньше W3, и значение URL непосредственно следующей метки также меньше W3**. Это *не* может быть исключено, потому что непосредственно следующая метка 1 не имеет то же значение UserID, что и текущая метка 0.

Это в конечном итоге мешает ClickHouse делать предположения о максимальном значении URL в грануле 0. Вместо этого ему нужно предполагать, что гранула 0 может содержать строки со значением URL W3 и ему требуется выбрать метку 0.


Та же ситуация верна для меток 1, 2 и 3.


:::note Заключение
<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">Алгоритм общего исключения</a>, который ClickHouse использует вместо <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">алгоритма бинарного поиска</a>, когда запрос фильтрует по колонке, которая является частью составного ключа, но не является первой колонкой ключа, наиболее эффективен, когда предшествующая ключевая колонка имеет низкую кардинальность.
:::

В нашем примере данных обе ключевые колонки (UserID, URL) имеют схожую высокую кардинальность, и, как объяснялось, алгоритм общего исключения не очень эффективен, когда предшествующая ключевая колонка колонки URL имеет высокую или схожую кардинальность.
### Заметка о индексах пропуска данных {#note-about-data-skipping-index}

Из-за аналогично высокой кардинальности столбцов UserID и URL, наш [фильтр запросов по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) также не получит значительной выгоды от создания [вторичного индекса пропуска данных](./skipping-indexes.md) по колонке URL в нашей [таблице с составным первичным ключом (UserID, URL)](#a-table-with-a-primary-key).

Например, два следующих запроса создают и заполняют индекс пропуска данных [minmax](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) по колонке URL в нашей таблице:
```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```
ClickHouse теперь создал дополнительный индекс, который хранит — для группы из 4 последовательных [гранул](#data-is-organized-into-granules-for-parallel-data-processing) (обратите внимание на условие `GRANULARITY 4` в команде `ALTER TABLE` выше) — минимальные и максимальные значения URL:

<img src={sparsePrimaryIndexes13a} class="image"/>

Первая запись индекса (‘mark 0’ на диаграмме выше) хранит минимальные и максимальные значения URL для [строк, относящихся к первым 4 гранулам нашей таблицы](#data-is-organized-into-granules-for-parallel-data-processing).

Вторая запись индекса (‘mark 1’) хранит минимальные и максимальные значения URL для строк, относящихся к следующим 4 гранулам нашей таблицы, и так далее.

(ClickHouse также создал специальный [файл меток](#mark-files-are-used-for-locating-granules) для индекса пропуска данных для [определения](#mark-files-are-used-for-locating-granules) групп гранул, связанных с метками индекса.)

Из-за аналогично высокой кардинальности столбцов UserID и URL, этот вторичный индекс пропуска данных не поможет исключать гранулы из выборки, когда выполняется наш [фильтр запросов по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient).

Конкретное значение URL, которое ищет запрос (то есть 'http://public_search'), вероятно, находится между минимальным и максимальным значением, хранящимся индексом для каждой группы гранул, что приводит к тому, что ClickHouse вынужден выбирать группу гранул (поскольку они могут содержать строки, соответствующие запросу).
### Необходимость использования нескольких первичных индексов {#a-need-to-use-multiple-primary-indexes}

В результате, если мы хотим значительно ускорить наш пример запроса, который фильтрует строки с конкретным URL, нам нужно использовать первичный индекс, оптимизированный для этого запроса.

Если дополнительно мы хотим сохранить хорошую производительность нашего примера запроса, который фильтрует строки с конкретным UserID, то нам нужно использовать несколько первичных индексов.

Следующие способы показывают, как достичь этого.

<a name="multiple-primary-indexes"></a>
### Варианты создания дополнительных первичных индексов {#options-for-creating-additional-primary-indexes}

Если мы хотим значительно ускорить оба наших примера запросов — один, который фильтрует строки с конкретным UserID и один, который фильтрует строки с конкретным URL — тогда нам нужно использовать несколько первичных индексов с помощью одного из этих трех вариантов:

- Создание **второй таблицы** с другим первичным ключом.
- Создание **материализованного представления** на нашей существующей таблице.
- Добавление **проекции** в нашу существующую таблицу.

Все три варианта фактически дублируют наши образцы данных в дополнительной таблице для реорганизации первичного индекса таблицы и порядка сортировки строк.

Тем не менее, три варианта отличаются тем, насколько прозрачна эта дополнительная таблица для пользователя с точки зрения маршрутизации запросов и операторов вставки.

При создании **второй таблицы** с другим первичным ключом запросы должны быть явно направлены на ту версию таблицы, которая лучше всего подходит для запроса, и новые данные должны быть явно вставлены в обе таблицы для поддержания синхронизации таблиц:
<img src={sparsePrimaryIndexes09a} class="image"/>

С **материализованным представлением** дополнительная таблица создается неявно, и данные автоматически синхронизируются между обеими таблицами:
<img src={sparsePrimaryIndexes09b} class="image"/>

А **проекция** является самым прозрачным вариантом, потому что, помимо автоматического поддержания неявно созданной (и скрытой) дополнительной таблицы в синхронизации с изменениями данных, ClickHouse автоматически выберет наиболее эффективную версию таблицы для запросов:
<img src={sparsePrimaryIndexes09c} class="image"/>

В следующем разделе мы обсудим эти три варианта создания и использования нескольких первичных индексов более подробно с реальными примерами.

<a name="multiple-primary-indexes-via-secondary-tables"></a>
### Вариант 1: Вторичные таблицы {#option-1-secondary-tables}

<a name="secondary-table"></a>
Мы создаем новую дополнительную таблицу, где меняем порядок ключевых колонок (по сравнению с нашей оригинальной таблицей) в первичном ключе:

```sql
CREATE TABLE hits_URL_UserID
(
    `UserID` UInt32,
    `URL` String,
    `EventTime` DateTime
)
ENGINE = MergeTree
// highlight-next-line
PRIMARY KEY (URL, UserID)
ORDER BY (URL, UserID, EventTime)
SETTINGS index_granularity = 8192, index_granularity_bytes = 0, compress_primary_key = 0;
```

Вставьте все 8.87 миллионов строк из нашей [оригинальной таблицы](#a-table-with-a-primary-key) в дополнительную таблицу:

```sql
INSERT INTO hits_URL_UserID
SELECT * from hits_UserID_URL;
```

Ответ выглядит следующим образом:

```response
Ok.

0 rows in set. Elapsed: 2.898 sec. Processed 8.87 million rows, 838.84 MB (3.06 million rows/s., 289.46 MB/s.)
```

И наконец оптимизируйте таблицу:
```sql
OPTIMIZE TABLE hits_URL_UserID FINAL;
```

Поскольку мы изменили порядок колонок в первичном ключе, вставленные строки теперь хранятся на диске в другом лексикографическом порядке (по сравнению с нашей [оригинальной таблицей](#a-table-with-a-primary-key)), и поэтому 1083 гранулы этой таблицы содержат другие значения, чем раньше:

<img src={sparsePrimaryIndexes10} class="image"/>

Это получившийся первичный ключ:

<img src={sparsePrimaryIndexes11} class="image"/>

Который теперь может быть использован для значительного ускорения выполнения нашего примера запроса, фильтрующего по колонке URL, чтобы вычислить топ-10 пользователей, которые чаще всего нажимали на URL "http://public_search":
```sql
SELECT UserID, count(UserID) AS Count
// highlight-next-line
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
// highlight-next-line
Processed 319.49 thousand rows, 11.38 MB (18.41 million rows/s., 655.75 MB/s.)
```

Теперь, вместо [почти полного сканирования таблицы](/guides/best-practices/sparse-primary-indexes#efficient-filtering-on-secondary-key-columns), ClickHouse выполнил этот запрос гораздо более эффективно.

С первичным индексом из [оригинальной таблицы](#a-table-with-a-primary-key), где UserID был первым, а URL - вторым ключевым столбцом, ClickHouse использовал [генерический алгоритм исключения](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) для выполнения этого запроса, и это было не очень эффективно из-за аналогично высокой кардинальности UserID и URL.

С использованием URL в качестве первого столбца в первичном индексе, ClickHouse теперь выполняет <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">бинарный поиск</a> по меткам индекса.
Соответствующий журнал трассировки в файле журнала сервера ClickHouse подтверждает это:
```response
...Executor): Key condition: (column 0 in ['http://public_search',
                                           'http://public_search'])
// highlight-next-line
...Executor): Running binary search on index range for part all_1_9_2 (1083 marks)
...Executor): Found (LEFT) boundary mark: 644
...Executor): Found (RIGHT) boundary mark: 683
...Executor): Found continuous range in 19 steps
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,
// highlight-next-line
              39/1083 marks by primary key, 39 marks to read from 1 ranges
...Executor): Reading approx. 319488 rows with 2 streams
```
ClickHouse выбрал только 39 меток индекса, вместо 1076 при использовании генерического алгоритма исключения.


Обратите внимание, что дополнительная таблица оптимизирована для ускорения выполнения нашего примера запроса, фильтрующего по URL.


Аналогично [плохой производительности](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) этого запроса с нашей [оригинальной таблицей](#a-table-with-a-primary-key), наш [пример запроса, фильтрующего по `UserIDs`](#the-primary-index-is-used-for-selecting-granules) не будет выполняться очень эффективно с новой дополнительной таблицей, поскольку UserID теперь является вторым ключевым столбцом в первичном индексе этой таблицы, и поэтому ClickHouse будет использовать генерический алгоритм исключения для выбора гранул, который [не очень эффективен при аналогичной высокой кардинальности](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) UserID и URL.
Откройте детальную информацию для конкретики.

<details>
    <summary>
    Запрос, фильтрующий по UserIDs, теперь имеет плохую производительность<a name="query-on-userid-slow"></a>
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
// highlight-next-line
Processed 8.02 million rows,
73.04 MB (340.26 million rows/s., 3.10 GB/s.)
```

Журнал сервера:
```response
...Executor): Key condition: (column 1 in [749927693, 749927693])
// highlight-next-line
...Executor): Used generic exclusion search over index for part all_1_9_2
              with 1453 steps
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,
// highlight-next-line
              980/1083 marks by primary key, 980 marks to read from 23 ranges
...Executor): Reading approx. 8028160 rows with 10 streams
```
</p>
</details>

У нас теперь есть две таблицы. Оптимизированные для ускорения запросов, фильтрующих по `UserIDs`, и ускорения запросов, фильтрующих по URL, соответственно:

<img src={sparsePrimaryIndexes12a} class="image"/>
### Вариант 2: Материализованные Представления {#option-2-materialized-views}

Создайте [материализованное представление](/sql-reference/statements/create/view.md) на нашей существующей таблице.
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
- мы меняем порядок ключевых колонок (по сравнению с нашей [оригинальной таблицей](#a-table-with-a-primary-key)) в первичном ключе представления
- материализованное представление поддерживается **неявно созданной таблицей**, чей порядок строк и первичный индекс основываются на данном определении первичного ключа
- неявно созданная таблица перечисляется в запросе `SHOW TABLES` и имеет имя, начинающееся с `.inner`
- также возможно сначала явно создать поддерживающую таблицу для материализованного представления, а затем представление может обращаться к этой таблице через [клаузу](/sql-reference/statements/create/view.md) `TO [db].[table]`
- мы используем ключевое слово `POPULATE`, чтобы немедленно заполнить неявно созданную таблицу всеми 8.87 миллиона строк из исходной таблицы [hits_UserID_URL](#a-table-with-a-primary-key)
- если новые строки вставляются в исходную таблицу hits_UserID_URL, то эти строки автоматически также вставляются в неявно созданную таблицу
- В результате неявно созданная таблица имеет такой же порядок строк и первичный индекс, как [вторичная таблица, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables):

<img src={sparsePrimaryIndexes12b1} class="image"/>

ClickHouse хранит [файлы данных столбцов](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin), [файлы меток](#mark-files-are-used-for-locating-granules) (*.mrk2) и [первичный индекс](#the-primary-index-has-one-entry-per-granule) (primary.idx) неявно созданной таблицы в специальной папке внутри директории данных сервера ClickHouse:

<img src={sparsePrimaryIndexes12b2} class="image"/>

:::

Теперь неявно созданная таблица (и ее первичный индекс), поддерживающая материализованное представление, может быть использована для значительного ускорения выполнения нашего примера запроса, фильтрующего по колонке URL:
```sql
SELECT UserID, count(UserID) AS Count
// highlight-next-line
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
// highlight-next-line
Processed 335.87 thousand rows,
13.54 MB (12.91 million rows/s., 520.38 MB/s.)
```

Поскольку фактически неявно созданная таблица (и ее первичный индекс), поддерживающая материализованное представление, идентичны [вторичной таблице, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables), запрос выполняется таким же эффективным образом, как и с явно созданной таблицей.

Соответствующий журнал трассировки в файле журнала сервера ClickHouse подтверждает, что ClickHouse выполняет бинарный поиск по меткам индекса:

```response
...Executor): Key condition: (column 0 in ['http://public_search',
                                           'http://public_search'])
// highlight-next-line
...Executor): Running binary search on index range ...
...
...Executor): Selected 4/4 parts by partition key, 4 parts by primary key,
// highlight-next-line
              41/1083 marks by primary key, 41 marks to read from 4 ranges
...Executor): Reading approx. 335872 rows with 4 streams
```
### Вариант 3: Проекции {#option-3-projections}

Создайте проекцию на нашей существующей таблице:
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
- проекция создает **скрытую таблицу**, чей порядок строк и первичный индекс основаны на данном `ORDER BY` операторе проекции
- скрытая таблица не перечисляется запросом `SHOW TABLES`
- мы используем ключевое слово `MATERIALIZE`, чтобы немедленно заполнить скрытую таблицу всеми 8.87 миллиона строк из исходной таблицы [hits_UserID_URL](#a-table-with-a-primary-key)
- если новые строки вставляются в исходную таблицу hits_UserID_URL, то эти строки автоматически также вставляются в скрытую таблицу
- запрос всегда синтаксически нацелен на исходную таблицу hits_UserID_URL, но если порядок строк и первичный индекс скрытой таблицы позволяют более эффективное выполнение запроса, то будет использоваться именно эта скрытая таблица
- обратите внимание, что проекции не делают запросы, использующие ORDER BY, более эффективными, даже если ORDER BY совпадает с оператором ORDER BY проекции (см. https://github.com/ClickHouse/ClickHouse/issues/47333)
- Эффективно неявно созданная скрытая таблица имеет тот же порядок строк и первичный индекс, что и [вторичная таблица, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables):

<img src={sparsePrimaryIndexes12c1} class="image"/>

ClickHouse хранит [файлы данных столбцов](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin), [файлы меток](#mark-files-are-used-for-locating-granules) (*.mrk2) и [первичный индекс](#the-primary-index-has-one-entry-per-granule) (primary.idx) скрытой таблицы в специальной папке (отмеченной оранжевым на скриншоте ниже) рядом с файлами данных, файлов меток и файлов первичных индексов исходной таблицы:

<img src={sparsePrimaryIndexes12c2} class="image"/>
:::

Теперь скрытая таблица (и ее первичный индекс), созданная проекцией, может (неявно) использоваться для значительного ускорения выполнения нашего примера запроса, фильтрующего по колонке URL. Обратите внимание, что запрос синтаксически нацелен на исходную таблицу проекции.
```sql
SELECT UserID, count(UserID) AS Count
// highlight-next-line
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
// highlight-next-line
Processed 319.49 thousand rows, 1
1.38 MB (11.05 million rows/s., 393.58 MB/s.)
```

Поскольку фактически скрытая таблица (и ее первичный индекс), созданная проекцией, идентична [вторичной таблице, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables), запрос выполняется таким же эффективным образом, как и с явно созданной таблицей.

Соответствующий журнал трассировки в файле журнала сервера ClickHouse подтверждает, что ClickHouse выполняет бинарный поиск по индексным меткам:


```response
...Executor): Key condition: (column 0 in ['http://public_search',
                                           'http://public_search'])
// highlight-next-line
...Executor): Running binary search on index range for part prj_url_userid (1083 marks)
...Executor): ...
// highlight-next-line
...Executor): Choose complete Normal projection prj_url_userid
...Executor): projection required columns: URL, UserID
...Executor): Selected 1/1 parts by partition key, 1 parts by primary key,
// highlight-next-line
              39/1083 marks by primary key, 39 marks to read from 1 ranges
...Executor): Reading approx. 319488 rows with 2 streams
```
### Резюме {#summary}

Первичный индекс нашей [таблицы с составным первичным ключом (UserID, URL)](#a-table-with-a-primary-key) был очень полезен для ускорения [запроса, фильтрующего по UserID](#the-primary-index-is-used-for-selecting-granules). Но этот индекс не предлагает значительной помощи для ускорения [запроса, фильтрующего по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient), несмотря на то, что колонка URL является частью составного первичного ключа.

И наоборот:
Первичный индекс нашей [таблицы с составным первичным ключом (URL, UserID)](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) ускорял [запрос, фильтрующий по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient), но не обеспечивал большого поддержки для [запроса, фильтрующего по UserID](#the-primary-index-is-used-for-selecting-granules).

Из-за аналогично высокой кардинальности столбцов первичного ключа UserID и URL, запрос, фильтрующий по второму ключевому столбцу, [не получает много прибыли от второго ключевого столбца, который находится в индексе](#generic-exclusion-search-algorithm).

Поэтому имеет смысл удалить второй ключевой столбец из первичного индекса (что приведет к меньшему потреблению памяти индекса) и вместо этого [использовать несколько первичных индексов](/guides/best-practices/sparse-primary-indexes#using-multiple-primary-indexes).

Тем не менее, если ключевые столбцы в составном первичном ключе имеют большие различия в кардинальности, то это [выгодно для запросов](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) упорядочить ключевые столбцы по кардинальности в порядке возрастания.

Чем больше разница в кардинальности между ключевыми столбцами, тем больше значение порядка этих столбцов в ключе. Мы продемонстрируем это в следующем разделе.
## Эффективное упорядочивание ключевых столбцов {#ordering-key-columns-efficiently}

<a name="test"></a>

В составном первичном ключе порядок ключевых столбцов может существенно повлиять как на:
- эффективность фильтрации по вторичным ключевым столбцам в запросах, так и
- коэффициент сжатия файлов данных таблицы.

Чтобы продемонстрировать это, мы используем версию нашего [набора данных о веб-трафике](#data-set), в которой каждая строка содержит три колонки, которые указывают, был ли доступ интернет 'пользователя' (`столбец UserID`) к URL (`столбец URL`) отмечен как трафик бота (`столбец IsRobot`).

Мы будем использовать составной первичный ключ, содержащий все три упомянутых столбца, которые могут быть использованы для ускорения типичных аналитических запросов по вебу, которые вычисляют
- сколько (процент) трафика к конкретному URL идет от ботов, или
- насколько мы уверены, что конкретный пользователь (не) является ботом (каков процент трафика от этого пользователя, который (не) предположительно является ботом).

Мы используем этот запрос для вычисления кардинальностей трех колонок, которые мы хотим использовать в качестве ключевых колонок в составном первичном ключе (обратите внимание, что мы используем [функцию таблицы URL](/sql-reference/table-functions/url.md) для запроса данных TSV по запросу, не создавая локальную таблицу). Выполните этот запрос в `clickhouse client`:
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
Ответ будет:
```response
┌─cardinality_URL─┬─cardinality_UserID─┬─cardinality_IsRobot─┐
│ 2.39 million    │ 119.08 thousand    │ 4.00                │
└─────────────────┴────────────────────┴─────────────────────┘

1 row in set. Elapsed: 118.334 sec. Processed 8.87 million rows, 15.88 GB (74.99 thousand rows/s., 134.21 MB/s.)
```

Мы видим, что существует большая разница между кардинальностями, особенно между колонками `URL` и `IsRobot`, и поэтому порядок этих колонок в составном первичном ключе имеет значение как для эффективного ускорения запросов фильтрации по этим колонкам, так и для достижения оптимальных коэффициентов сжатия для файлов данных столбцов таблицы.

Чтобы продемонстрировать это мы создаем две версии таблиц для нашего анализа трафика ботов:
- таблица `hits_URL_UserID_IsRobot` с составным первичным ключом `(URL, UserID, IsRobot)`, где мы упорядочиваем ключевые колонки по кардинальности в порядке убывания
- таблица `hits_IsRobot_UserID_URL` с составным первичным ключом `(IsRobot, UserID, URL)`, где мы упорядочиваем ключевые колонки по кардинальности в порядке возрастания

Создайте таблицу `hits_URL_UserID_IsRobot` с составным первичным ключом `(URL, UserID, IsRobot)`:
```sql
CREATE TABLE hits_URL_UserID_IsRobot
(
    `UserID` UInt32,
    `URL` String,
    `IsRobot` UInt8
)
ENGINE = MergeTree
// highlight-next-line
PRIMARY KEY (URL, UserID, IsRobot);
```

И заполните ее 8.87 миллиона строк:
```sql
INSERT INTO hits_URL_UserID_IsRobot SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```
Это ответ:
```response
0 rows in set. Elapsed: 104.729 sec. Processed 8.87 million rows, 15.88 GB (84.73 thousand rows/s., 151.64 MB/s.)
```

Далее создайте таблицу `hits_IsRobot_UserID_URL` с составным первичным ключом `(IsRobot, UserID, URL)`:
```sql
CREATE TABLE hits_IsRobot_UserID_URL
(
    `UserID` UInt32,
    `URL` String,
    `IsRobot` UInt8
)
ENGINE = MergeTree
// highlight-next-line
PRIMARY KEY (IsRobot, UserID, URL);
```
И заполните ее теми же 8.87 миллиона строк, которые мы использовали для заполнения предыдущей таблицы:

```sql
INSERT INTO hits_IsRobot_UserID_URL SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```
Ответ будет такой:
```response
0 rows in set. Elapsed: 95.959 sec. Processed 8.87 million rows, 15.88 GB (92.48 thousand rows/s., 165.50 MB/s.)
```
### Эффективная фильтрация по вторичным ключевым столбцам {#efficient-filtering-on-secondary-key-columns}

Когда запрос фильтрует по крайней мере по одному столбцу, который является частью составного ключа, и это первый ключевой столбец, [то ClickHouse выполняет бинарный поиск по меткам индекса столбца](#the-primary-index-is-used-for-selecting-granules).

Когда запрос фильтрует (только) по столбцу, который является частью составного ключа, но не является первым ключевым столбцом, [то ClickHouse использует алгоритм генерического исключения по меткам индекса ключевого столбца](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient).

Для второго случая порядок ключевых столбцов в составном первичном ключе имеет значение для эффективности [алгоритма генерического исключения](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444).

Это запрос, который фильтрует по столбцу `UserID` таблицы, где мы упорядочили ключевые столбцы `(URL, UserID, IsRobot)` по кардинальности в порядке убывания:
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
// highlight-next-line
Processed 7.92 million rows,
31.67 MB (306.90 million rows/s., 1.23 GB/s.)
```

Это тот же самый запрос на таблице, где мы упорядочили ключевые столбцы `(IsRobot, UserID, URL)` по кардинальности в порядке возрастания:
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
// highlight-next-line
Processed 20.32 thousand rows,
81.28 KB (6.61 million rows/s., 26.44 MB/s.)
```

Мы видим, что выполнение запроса значительно более эффективно и быстрее на таблице, где мы упорядочили ключевые столбцы по кардинальности в порядке возрастания.

Причина этого заключается в том, что [алгоритм генерического исключения](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444) работает наиболее эффективно, когда [гранулы](#the-primary-index-is-used-for-selecting-granules) выбираются через вторичный ключевой столбец, где предшествующий ключевой столбец имеет более низкую кардинальность. Мы подробно иллюстрировали это в [предыдущем разделе](#generic-exclusion-search-algorithm) данного руководства.
### Оптимальное соотношение сжатия файлов данных {#optimal-compression-ratio-of-data-files}

Этот запрос сравнивает соотношение сжатия колонки `UserID` между двумя таблицами, которые мы создали выше:

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

2 строки в наборе. Прошло: 0.006 сек.
```
Мы видим, что соотношение сжатия для колонки `UserID` значительно выше для таблицы, где мы упорядочили ключевые колонки `(IsRobot, UserID, URL)` по возрастанию кардинальности.

Хотя в обеих таблицах хранится точно одни и те же данные (мы вставили одинаковые 8.87 миллиона строк в обе таблицы), порядок ключевых колонок в составном первичном ключе значительно влияет на то, сколько дискового пространства требует <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">сжатые</a> данные в [файлах данных колонок](#data-is-stored-on-disk-ordered-by-primary-key-columns) таблицы:
- в таблице `hits_URL_UserID_IsRobot` с составным первичным ключом `(URL, UserID, IsRobot)` где мы упорядочили ключевые колонки по кардинальности по убыванию, файл данных `UserID.bin` занимает **11.24 MiB** дискового пространства
- в таблице `hits_IsRobot_UserID_URL` с составным первичным ключом `(IsRobot, UserID, URL)` где мы упорядочили ключевые колонки по кардинальности по возрастанию, файл данных `UserID.bin` занимает всего **877.47 KiB** дискового пространства

Хорошее соотношение сжатия данных колонки на диске не только экономит место на диске, но и делает запросы (особенно аналитические), которые требуют чтения данных из этой колонки, быстрее, так как требуется меньше ввода-вывода для перемещения данных колонки с диска в основную память (кэш файлов операционной системы).

В следующем мы иллюстрируем, почему выгодно, чтобы соотношение сжатия колонок таблицы упорядочивалось по кардинальности в порядке возрастания.

Диаграмма ниже рисует порядок строк на диске для первичного ключа, где ключевые колонки упорядочены по кардинальности в порядке возрастания:
<img src={sparsePrimaryIndexes14a} class="image"/>

Мы обсудили, что [данные строк таблицы хранятся на диске в порядке первичного ключа](#data-is-stored-on-disk-ordered-by-primary-key-columns).

На диаграмме выше строки таблицы (их значения колонок на диске) сначала упорядочены по значению `cl`, а строки, которые имеют одинаковое значение `cl`, упорядочены по значению `ch`. И поскольку первая ключевая колонка `cl` имеет низкую кардинальность, вероятно, что есть строки с одинаковым значением `cl`. И из-за этого также вероятно, что значения `ch` упорядочены (локально - для строк с одинаковым значением `cl`).

Если в колонке похожие данные расположены близко друг к другу, например, благодаря сортировке, то эти данные будут лучше сжаты.
В общем, алгоритм сжатия выигрывает от длины последовательности данных (чем больше данных он видит, тем лучше для сжатия) и локальности (чем более похожи данные, тем лучше соотношение сжатия).

В отличие от диаграммы выше, диаграмма ниже изображает порядок строк на диске для первичного ключа, где ключевые колонки упорядочены по кардинальности по убыванию:
<img src={sparsePrimaryIndexes14b} class="image"/>

Теперь строки таблицы сначала упорядочены по значению `ch`, а строки, которые имеют одинаковое значение `ch`, упорядочены по значению `cl`.
Но поскольку первая ключевая колонка `ch` имеет высокую кардинальность, маловероятно, что есть строки с одинаковым значением `ch`. И из-за этого также маловероятно, что значения `cl` упорядочены (локально - для строк с одинаковым значением `ch`).

Таким образом, значения `cl` скорее всего находятся в случайном порядке и, следовательно, имеют плохую локальность и соответственно плохое соотношение сжатия.
### Резюме {#summary-1}

Как для эффективной фильтрации по вторичным ключевым колонкам в запросах, так и для соотношения сжатия файлов данных колонок таблицы выгодно упорядочивать колонки в первичном ключе по кардинальности в порядке возрастания.
### Связанный контент {#related-content-1}
- Блог: [Ускорение ваших ClickHouse-запросов](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)
## Эффективное идентифицирование отдельных строк {#identifying-single-rows-efficiently}

Хотя в общем это [не](/knowledgebase/key-value) лучший случай использования для ClickHouse,
иногда приложения, построенные на базе ClickHouse, требуют идентифицировать отдельные строки таблицы ClickHouse.

Интуитивным решением для этого может быть использование колонки [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) с уникальным значением для строки и для быстрой выборки строк использовать эту колонку в качестве ключевой колонки первичного ключа.

Для самой быстрой выборки колонка UUID [должна быть первой ключевой колонкой](#the-primary-index-is-used-for-selecting-granules).

Мы обсудили, что поскольку [данные строк таблицы ClickHouse хранятся на диске в порядке ключевой колонки(ок)](#data-is-stored-on-disk-ordered-by-primary-key-columns), наличие колонки с очень высокой кардинальностью (например, колонки UUID) в первичном ключе или в составном первичном ключе перед колонками с более низкой кардинальностью [вредно для соотношения сжатия других колонок таблицы](#optimal-compression-ratio-of-data-files).

Компромисс между самой быстрой выборкой и оптимальным сжатием данных - это использование составного первичного ключа, где UUID является последней ключевой колонкой, после колонок с низкой(ими) кардинальностью, которые используются для обеспечения хорошего соотношения сжатия для некоторых колонок таблицы.
### Конкретный пример {#a-concrete-example}

Одним из конкретных примеров является сервис обмена текстом https://pastila.nl, который разработал Алексей Милиовидов и [в дальнейшем описал](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/).

При каждом изменении текстового поля данные автоматически сохраняются в строку таблицы ClickHouse (одна строка на изменение).

И одним из способов идентифицировать и извлечь (определенную версию) вставленного содержимого является использование хеша содержимого в качестве UUID для строки таблицы, содержащей это содержание.

Следующая диаграмма показывает
- порядок вставки строк, когда содержимое изменяется (например, из-за нажатий клавиш при вводе текста в текстовое поле) и
- порядок данных на диске из вставленных строк, когда используется `PRIMARY KEY (hash)`:
<img src={sparsePrimaryIndexes15a} class="image"/>

Поскольку колонка `hash` используется как ключевая колонка первичного ключа
- конкретные строки можно извлекать [очень быстро](#the-primary-index-is-used-for-selecting-granules), но
- строки таблицы (данные их колонок) хранятся на диске в порядке возрастания (уникальных и случайных) значений хеша. Поэтому также значения колонки содержимого хранятся в случайном порядке без локальности данных, в результате чего получается **неоптимальное соотношение сжатия для файла данных колонки содержимого**.


Чтобы значительно улучшить соотношение сжатия для колонки содержимого, обеспечивая при этом быструю выборку конкретных строк, pastila.nl использует два хеша (и составной первичный ключ) для идентификации конкретной строки:
- хеш содержимого, о котором говорилось выше, который является уникальным для различных данных, и
- [локально-чувствительный хеш (отпечаток)](https://en.wikipedia.org/wiki/Locality-sensitive_hashing), который **не** изменяется при небольших изменениях данных.

Следующая диаграмма показывает
- порядок вставки строк, когда содержимое изменяется (например, из-за нажатий клавиш при вводе текста в текстовое поле) и
- порядок данных на диске из вставленных строк, когда используется составной `PRIMARY KEY (fingerprint, hash)`:

<img src={sparsePrimaryIndexes15b} class="image"/>

Теперь строки на диске сначала упорядочены по `fingerprint`, а для строк с одинаковым значением отпечатка их значение `hash` определяет окончательный порядок.

Поскольку данные, которые различаются только небольшими изменениями, получают одно и то же значение отпечатка, похожие данные теперь хранятся на диске близко друг к другу в колонке содержимого. И это очень хорошо для соотношения сжатия колонки содержимого, так как алгоритм сжатия в целом выигрывает от локальности данных (чем больше данные похожи, тем лучше соотношение сжатия).

Компромиссом является то, что для извлечения конкретной строки требуется два поля (`fingerprint` и `hash`), чтобы оптимально использовать первичный индекс, который возникает из составного `PRIMARY KEY (fingerprint, hash)`.
