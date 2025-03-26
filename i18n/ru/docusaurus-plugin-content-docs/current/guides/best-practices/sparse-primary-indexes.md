sidebar_label: 'Первичные индексы'
description: 'В этом руководстве мы подробно рассмотрим индексацию ClickHouse.'
title: 'Практическое введение в первичные индексы в ClickHouse'
slug: /guides/best-practices/sparse-primary-indexes
```

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

В этом руководстве мы подробно рассмотрим индексацию ClickHouse. Мы подробно иллюстрируем и обсуждаем:

- [чем индексация в ClickHouse отличается от традиционных систем управления реляционными базами данных](#an-index-design-for-massive-data-scales)
- [как ClickHouse создает и использует разреженный первичный индекс таблицы](#a-table-with-a-primary-key)
- [какие лучшие практики существуют для индексации в ClickHouse](#using-multiple-primary-indexes)

Вы можете по желанию самостоятельно выполнять все SQL-операторы и запросы ClickHouse, приведённые в этом руководстве на вашем собственном компьютере.
Для установки ClickHouse и начала работы см. [Quick Start](/quick-start.mdx).

:::note
Это руководство фокусируется на разрежённых первичных индексах ClickHouse.

Для ClickHouse [вторичных индексов пропуска данных](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes), см. [Учебное пособие](/guides/best-practices/skipping-indexes.md).
:::

### Набор данных {#data-set}

На протяжении всего руководства мы будем использовать образец анонимизированного набора данных веб-трафика.

- Мы будем использовать подмножество из 8,87 миллионов строк (событий) из образца данных.
- Неразжатый размер данных составляет 8,87 миллионов событий и около 700 МБ. При хранении в ClickHouse это сжимается до 200 МБ.
- В нашем подмножестве каждая строка содержит три столбца, указывающих на интернет-пользователя (столбец `UserID`), который кликнул по URL (`URL` столбец) в определенное время (`EventTime` столбец).

С этими тремя столбцами мы уже можем сформулировать некоторые типичные запросы веб-аналитики, такие как:

- "Каковы топ 10 самых кликабельных URL для конкретного пользователя?"
- "Каковы топ 10 пользователей, которые чаще всего кликают по определенному URL?"
- "Какое самое популярное время (например, дни недели), когда пользователь кликает по конкретному URL?"

### Тестовая машина {#test-machine}

Все данные о времени выполнения, приведённые в этом документе, основаны на запуске ClickHouse 22.2.1 локально на MacBook Pro с чипом Apple M1 Pro и 16 ГБ ОЗУ.

### Полное сканирование таблицы {#a-full-table-scan}

Чтобы увидеть, как запрос выполняется над нашим набором данных без первичного ключа, мы создаём таблицу (с движком таблицы MergeTree), выполняя следующий SQL-оператор DDL:

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

Затем вставьте подмножество набора данных hits в таблицу с помощью следующего SQL-оператора вставки.
Это используется [табличная функция URL](/sql-reference/table-functions/url.md), чтобы загрузить подмножество полного набора данных, размещённых удалённо на clickhouse.com:

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

Вывод результата клиента ClickHouse показывает нам, что оператор выше вставил 8,87 миллионов строк в таблицу.

Наконец, чтобы упростить обсуждение в дальнейшем в этом руководстве и сделать диаграммы и результаты воспроизводимыми, мы [оптимизируем](/sql-reference/statements/optimize.md) таблицу, используя ключевое слово FINAL:

```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
Как правило, не требуется и не рекомендуется немедленно оптимизировать таблицу после загрузки данных в нее. Почему это необходимо для этого примера станет очевидным.
:::

Теперь мы выполняем наш первый запрос веб-аналитики. Следующий запрос вычисляет топ 10 самых кликабельных URL для интернет-пользователя с `UserID` 749927693:

```sql
SELECT URL, count(URL) as Count
FROM hits_NoPrimaryKey
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

Ответ на запрос:

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

Вывод результата клиента ClickHouse указывает на то, что ClickHouse выполнил полное сканирование таблицы! Каждая строка из 8,87 миллионов строк нашей таблицы была передана в ClickHouse. Это не масштабируется.

Чтобы сделать это (значительно) более эффективным и (намного) более быстрым, нам нужно использовать таблицу с соответствующим первичным ключом. Это позволит ClickHouse автоматически (на основе столбца (столбцов) первичного ключа) создать разреженный первичный индекс, который затем можно будет использовать для значительного ускорения выполнения нашего примерного запроса.

### Связанный контент {#related-content}

- Блог: [Ускорение запросов ClickHouse](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)

## Дизайн индексов ClickHouse {#clickhouse-index-design}

### Дизайн индекса для массовых объемов данных {#an-index-design-for-massive-data-scales}

В традиционных системах управления реляционными базами данных первичный индекс содержал бы одну запись на строку таблицы. Это привело бы к тому, что первичный индекс содержал бы 8,87 миллионов записей для нашего набора данных. Такой индекс позволяет быстро находить конкретные строки, обеспечивая высокую эффективность для запросов поиска и обновления точек. Поиск записи в структуре данных `B(+)-Tree` имеет среднюю временную сложность `O(log n)`; более точно, `log_b n = log_2 n / log_2 b`, где `b` - это коэффициент разветвления `B(+)-Tree`, а `n` - количество индексированных строк. Поскольку `b` обычно составляет от нескольких сотен до нескольких тысяч, `B(+)-Tree` представляют собой очень мелкие структуры, и для поиска записей требуется минимальное количество запросов к диску. С 8,87 миллионами строк и коэффициентом разветвления 1000 в среднем требуется 2,3 запроса к диску. Эта возможность сопровождается издержками: дополнительными накладными расходами на диск и память, более высокими затратами на вставку при добавлении новых строк в таблицу и записи в индекс, а также иногда ребалансировкой B-Tree.

Учитывая проблемы, связанные с индексами B-Tree, движки таблиц в ClickHouse используют иной подход. [Семейство движков MergeTree](/engines/table-engines/mergetree-family/index.md) в ClickHouse было разработано и оптимизировано для обработки огромных объемов данных. Эти таблицы предназначены для приёма миллионов вставок строк в секунду и хранения очень больших (сотни петабайт) объемов данных. Данные быстро записываются в таблицу [по частям](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) с применением правил для слияния частей в фоновом режиме. В ClickHouse каждая часть имеет собственный первичный индекс. Когда части объединяются, также объединяются и их первичные индексы. На очень большом масштабе, для которого разработан ClickHouse, крайне важно быть очень эффективным с точки зрения использования диска и памяти. Поэтому вместо индексирования каждой строки, первичный индекс для части имеет одну запись индекса (называемую 'меткой') на группу строк (называемую 'гранулой') - этот метод называется **разреженный индекс**.

Разреженный индекс возможен, потому что ClickHouse сохраняет строки для части на диске в порядке первичных ключевых столбцов. Вместо того, чтобы напрямую находить отдельные строки (как делает индекс на основе B-Tree), разреженный первичный индекс позволяет быстро (путём бинарного поиска по записям индекса) определить группы строк, которые могут соответствовать запросу. Обнаруженные группы потенциально соответствующих строк (гранулы) затем параллельно передаются в движок ClickHouse для поиска совпадений. Такая конструкция индекса позволяет сделать первичный индекс небольшим (он может и должен полностью умещаться в основной памяти), при этом значительно ускоряя время выполнения запросов: особенно для запросов диапазона, характерных для случаев использования аналитики данных.

Следующие детали иллюстрируют, как ClickHouse создаёт и использует свой разреженный первичный индекс. Далее в статье мы обсудим несколько лучших практик по выбору, удалению и упорядочению столбцов таблицы, которые используются для создания индекса (столбцы первичного ключа).

### Таблица с первичным ключом {#a-table-with-a-primary-key}

Создайте таблицу с составным первичным ключом, использующим столбцы UserID и URL:

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

<details>
    <summary>
    Подробности оператора DDL
    </summary>
    <p>

Чтобы упростить обсуждение в дальнейшем в этом руководстве, а также сделать диаграммы и результаты воспроизводимыми, оператор DDL:

<ul>
  <li>
    Задает составной ключ сортировки для таблицы через оператор <code>ORDER BY</code>.
  </li>
  <li>
    Явно контролирует количество записей индекса, которые будет иметь первичный индекс, через настройки:
    <ul>
      <li>
        <code>index_granularity</code>: явно установлен в его значение по умолчанию 8192. Это означает, что для каждой группы из 8192 строк первичный индекс будет иметь одну запись. Например, если таблица содержит 16384 строки, индекс будет иметь две записи.
      </li>
      <li>
        <code>index_granularity_bytes</code>: установлено значение 0 для отключения <a href="https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1" target="_blank">адаптивной гранулярности индекса</a>. Адаптивная гранулярность индекса означает, что ClickHouse автоматически создаёт одну запись для группы из n строк, если верно одно из следующих условий:
        <ul>
          <li>
            Если <code>n</code> меньше 8192 и размер данных строки для этих <code>n</code> строк больше или равен 10 МБ (значение по умолчанию для <code>index_granularity_bytes</code>).
          </li>
          <li>
            Если размер данных строки для <code>n</code> строк меньше 10 МБ, но <code>n</code> равно 8192.
          </li>
        </ul>
      </li>
      <li>
        <code>compress_primary_key</code>: установлено значение 0 для отключения <a href="https://github.com/ClickHouse/ClickHouse/issues/34437" target="_blank">сжатия первичного индекса</a>. Это позволит нам, при желании, осмотреть его содержимое позже.
      </li>
    </ul>
  </li>
</ul>

</p>
</details>

Первичный ключ в операторе DDL, приведённом выше, приводит к созданию первичного индекса на основе двух указанных столбцов ключей.

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

- Данные таблицы хранятся в [широком формате](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) в определенной директории на диске, что означает, что внутри этой директории будет один файл данных (и один файл меток) на каждый столбец таблицы.
- Таблица содержит 8,87 миллионов строк.
- Неразжатый размер данных всех строк вместе составляет 733,28 МБ.
- Сжатый размер на диске всех строк вместе составляет 206,94 МБ.
- Таблица имеет первичный индекс с 1083 записями (называемыми "метками"), и размер индекса составляет 96,93 КБ.
- В общей сложности данные таблицы и файлы меток и файл первичного индекса вместе занимают 207,07 МБ на диске.

### Данные хранятся на диске, упорядоченные по столбцам первичного ключа {#data-is-stored-on-disk-ordered-by-primary-key-columns}

Наша таблица, которую мы создали выше имеет:
- составной [первичный ключ](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)` и
- составной [ключ сортировки](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)`.

:::note

- Если бы мы указали только ключ сортировки, то первичный ключ был бы неявно определён как равный ключу сортировки.

- Чтобы быть эффективными с точки зрения использования памяти, мы явно указали первичный ключ, который содержит только те столбцы, по которым производятся фильтрация в наших запросах. Первичный индекс, основанный на первичном ключе, полностью загружается в основную память.

- Чтобы обеспечить согласованность диаграмм в руководстве и максимизировать коэффициент сжатия, мы определили отдельный ключ сортировки, который включает в себя все столбцы нашей таблицы (если в столбце аналогичные данные расположены близко друг к другу, например, с помощью сортировки, то такие данные будут сжиматься лучше).

- Первичный ключ должен быть префиксом ключа сортировки, если оба указаны.

:::

Вставленные строки хранятся на диске в лексикографическом порядке (по возрастанию) по столбцам первичного ключа (и дополнительному столбцу `EventTime` из ключа сортировки).

:::note

ClickHouse позволяет вставлять несколько строк с одинаковыми значениями столбцов первичного ключа. В этом случае (см. строчку 1 и строчку 2 на диаграмме ниже), окончательный порядок определяется указанным ключом сортировки и, следовательно, значением столбца `EventTime`.

:::

ClickHouse является <a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms" target="_blank">столбцово-ориентированной системой управления базами данных</a>. Как показано на диаграмме ниже:
- для представления на диске существует один файл данных (*.bin) на каждый столбец таблицы, где все значения для этого столбца хранятся в <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">сжатом</a> формате, и
- 8,87 миллионов строк хранятся на диске в лексикографическом порядке по возрастанию по столбцам первичного ключа (и дополнительным столбцам ключа сортировки), то есть в этом случае:
  - сначала по `UserID`,
  - затем по `URL`,
  - и, наконец, по `EventTime`:

<Image img={sparsePrimaryIndexes01} size="md" alt="Sparse Primary Indices 01" background="white"/>

`UserID.bin`, `URL.bin`, и `EventTime.bin` - это файлы данных на диске, где хранятся значения столбцов `UserID`, `URL` и `EventTime`.

:::note

- Поскольку первичный ключ определяет лексикографический порядок строк на диске, таблица может иметь только один первичный ключ.

- Мы начинаем нумерацию строк с 0, чтобы быть в соответствии с внутренней системой нумерации строк ClickHouse, которая также используется для сообщений журнала.

:::

### Данные организованы в гранулы для параллельной обработки данных {#data-is-organized-into-granules-for-parallel-data-processing}

Для целей обработки данных значения столбцов таблицы логически делятся на гранулы. Гранула — это наименьший неделимый набор данных, который передаётся в ClickHouse для обработки данных. Это означает, что вместо чтения отдельных строк ClickHouse всегда читает (в потоковом режиме и параллельно) целую группу (гранулу) строк.

:::note

Значения столбцов не хранятся физически внутри гранул: гранулы — это всего лишь логическая организация значений столбцов для обработки запросов.

:::

На следующей диаграмме показано, как (значения столбцов) 8,87 миллионов строк нашей таблицы организованы в 1083 гранулы в результате того, что в операторе DDL таблицы указана настройка `index_granularity` (установленная по умолчанию на значение 8192).

<Image img={sparsePrimaryIndexes02} size="md" alt="Sparse Primary Indices 02" background="white"/>

Первые (по физическому порядку на диске) 8192 строки (их значения столбцов) логически принадлежат грануле 0, затем следующие 8192 строки (их значения столбцов) принадлежат грануле 1 и так далее.

:::note

- Последняя гранула (гранула 1082) "содержит" менее 8192 строк.

- Мы упомянули в начале этого руководства в разделе "Детали оператора DDL", что мы отключили [адаптивную гранулярность индекса](/whats-new/changelog/2019.md/#experimental-features-1) (чтобы упростить обсуждение в этом руководстве, а также сделать диаграммы и результаты воспроизводимыми).

  Поэтому все гранулы (кроме последней) нашей примерной таблицы имеют одинаковый размер.

- Для таблиц с адаптивной гранулярностью индекса (гранулярность индекса адаптивна по [умолчанию](/operations/settings/merge-tree-settings#index_granularity_bytes)) размер некоторых гранул может быть менее 8192 строк в зависимости от размеров данных строки.


- Мы выделили некоторые значения столбцов из наших столбцов первичного ключа (`UserID`, `URL`) оранжевым цветом.
  Эти выделенные оранжевым цветом значения столбцов являются значениями столбцов первичного ключа каждой первой строки каждой гранулы.
  Как мы увидим ниже, эти выделенные оранжевым цветом значения столбцов станут записями в первичном индексе таблицы.

- Мы начинаем нумерацию гранул с 0, чтобы быть в соответствии с внутренней системой нумерации ClickHouse, которая также используется для сообщений журнала.

:::
### Первичный индекс имеет одну запись на каждую гранулу {#the-primary-index-has-one-entry-per-granule}

Первичный индекс создаётся на основе гранул, показанных на диаграмме выше. Этот индекс — это несжатый плоский файл массива (primary.idx), содержащий так называемые числовые метки индекса, начиная с 0.

Диаграмма ниже показывает, что индекс хранит значения столбцов первичного ключа (значения, отмеченные оранжевым цветом на диаграмме выше) для каждой первой строки каждой гранулы.
Или, другими словами: первичный индекс хранит значения столбцов первичного ключа из каждой 8192 строки таблицы (на основе физического порядка строк, определённого столбцами первичного ключа).
Например:
- первая запись индекса («метка 0» на диаграмме ниже) хранит значения столбцов ключа первой строки гранулы 0 на диаграмме выше,
- вторая запись индекса («метка 1» на диаграмме ниже) хранит значения столбцов ключа первой строки гранулы 1 на диаграмме выше и так далее.

<Image img={sparsePrimaryIndexes03a} size="lg" alt="Sparse Primary Indices 03a" background="white"/>

Всего индекс имеет 1083 записи для нашей таблицы с 8.87 миллионами строк и 1083 гранулами:

<Image img={sparsePrimaryIndexes03b} size="md" alt="Sparse Primary Indices 03b" background="white"/>

:::note
- Для таблиц с [адаптивной гранулярностью индекса](/whats-new/changelog/2019.md/#experimental-features-1) в первичном индексе также хранится одна "финальная" дополнительная метка, записывающая значения столбцов первичного ключа последней строки таблицы. Но поскольку мы отключили адаптивную гранулярность индекса (чтобы упростить обсуждение в данном руководстве, а также сделать диаграммы и результаты воспроизводимыми), индекс нашей таблицы-примера не включает эту финальную метку.

- Файл первичного индекса полностью загружается в основную память. Если файл больше доступного свободного пространства памяти, то ClickHouse выдаст ошибку.
:::

<details>
    <summary>
    Изучение содержимого первичного индекса
    </summary>
    <p>

В самоуправляемом кластерe ClickHouse мы можем использовать <a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">табличную функцию file</a> для изучения содержимого первичного индекса нашей таблицы-примера.

Для этого сначала необходимо скопировать файл первичного индекса в <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a> узла из работающего кластера:
<ul>
<li>Шаг 1: Получить часть пути, содержащую файл первичного индекса</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

возвращает `/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4` на тестовой машине.

<li>Шаг 2: Получить user_files_path</li>
<a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">Путь по умолчанию для user_files_path</a> в Linux:
`/var/lib/clickhouse/user_files/`

и в Linux вы можете проверить, изменился ли он: `$ grep user_files_path /etc/clickhouse-server/config.xml`

На тестовой машине путь: `/Users/tomschreiber/Clickhouse/user_files/`


<li>Шаг 3: Скопировать файл первичного индекса в user_files_path</li>

`cp /Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4/primary.idx /Users/tomschreiber/Clickhouse/user_files/primary-hits_UserID_URL.idx`

</ul>

<br/>
Теперь можно изучить содержимое первичного индекса через SQL:
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
Это точно соответствует нашей диаграмме содержимого первичного индекса для нашей таблицы-примера:


</p>
</details>



Записи первичного ключа называются метками индекса, потому что каждая запись индекса маркирует начало определённого диапазона данных. В частности, для таблицы-примера:
- Метки индекса UserID:

  Сохраняемые значения `UserID` в первичном индексе отсортированы в порядке возрастания.<br/>
  'метка 1' на диаграмме выше, таким образом, указывает, что значения `UserID` всех строк таблицы в грануле 1 и во всех последующих гранулах гарантированно больше или равны 4.073.710.

 [Как мы увидим позже](#the-primary-index-is-used-for-selecting-granules), этот глобальный порядок позволяет ClickHouse <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">использовать алгоритм бинарного поиска</a> в метках индекса для первого столбца ключа, когда запрос фильтруется по первому столбцу первичного ключа.

- Метки индекса URL:

  Довольно схожая кардинальность столбцов первичного ключа `UserID` и `URL`
  означает, что метки индекса для всех столбцов ключа после первого столбца в общем случае лишь указывают диапазон данных, пока значение столбца ключа-предшественника остаётся одинаковым для всех строк таблицы как минимум в пределах текущей гранулы.<br/>
 Например, поскольку значения UserID для меток 0 и 1 различаются на диаграмме выше, ClickHouse не может предположить, что все значения URL всех строк таблицы в грануле 0 больше или равны `'http://showtopics.html%3...'`. Однако, если бы значения UserID для меток 0 и 1 были одинаковыми на диаграмме выше (что означает, что значение UserID остаётся одинаковым для всех строк таблицы в пределах гранулы 0), ClickHouse мог бы предположить, что все значения URL всех строк таблицы в грануле 0 больше или равны `'http://showtopics.html%3...'`.

  Мы обсудим последствия этого на производительности выполнения запросов более подробно позже.
### Первичный индекс используется для выбора гранул {#the-primary-index-is-used-for-selecting-granules}

Теперь мы можем выполнять наши запросы с поддержкой первичного индекса.


Следующий запрос вычисляет топ 10 самых часто кликаемых URL для UserID 749927693.

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
Processed 8.19 thousand rows,
740.18 KB (1.53 million rows/s., 138.59 MB/s.)
```

Вывод для клиента ClickHouse теперь показывает, что вместо выполнения полного сканирования таблицы было обработано только 8.19 тысяч строк.


Если <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">трассировка логов</a> включена, то файл логов сервера ClickHouse показывает, что ClickHouse выполнял <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">бинарный поиск</a> среди 1083 меток индекса UserID, чтобы определить гранулы, которые могут содержать строки со значением столбца UserID `749927693`. Это требует 19 шагов со средней временной сложностью `O(log2 n)`:
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


Мы видим в трассировке лога выше, что одна метка из 1083 существующих меток удовлетворяет запросу.

<details>
    <summary>
    Подробности логов трассировки
    </summary>
    <p>

Была идентифицирована метка 176 (найденная левая граница метки является включающей, найденная правая граница метки является исключающей), и поэтому все 8192 строки из гранулы 176 (которая начинается с строки 1.441.792 - мы увидим это позже в этом руководстве) затем подаются в ClickHouse для поиска действительных строк со значением столбца UserID `749927693`.
</p>
</details>

Мы также можем воспроизвести это, используя предложение <a href="https://clickhouse.com/docs/sql-reference/statements/explain/" target="_blank">EXPLAIN</a> в нашем примере запроса:
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
Вывод для клиента показывает, что одна из 1083 гранул была выбрана как возможный источник строк со значением столбца UserID 749927693.


:::note Заключение
Когда запрос фильтруется по столбцу, который является частью составного ключа и является первым столбцом ключа, ClickHouse запускает алгоритм бинарного поиска по меткам индекса столбца ключа.
:::

<br/>


Как обсуждалось выше, ClickHouse использует свой разреженный первичный индекс для быстрого (с помощью бинарного поиска) отбора гранул, которые могут содержать строки, соответствующие запросу.


Это **первый этап (выбор гранул)** выполнения запроса в ClickHouse.

На **втором этапе (чтение данных)**, ClickHouse идентифицирует выбранные гранулы, чтобы передать все их строки в движок ClickHouse, найдя те, которые действительно соответствуют запросу.

Мы обсудим этот второй этап более подробно в следующем разделе.
### Файлы меток используются для определения местоположения гранул {#mark-files-are-used-for-locating-granules}

Следующая диаграмма иллюстрирует часть файла первичного индекса для нашей таблицы.

<Image img={sparsePrimaryIndexes04} size="md" alt="Sparse Primary Indices 04" background="white"/>

Как обсуждалось выше, в результате бинарного поиска по 1083 меткам индекса UserID была выбрана метка 176. Её соответствующая гранула 176 может содержать строки со значением столбца UserID 749.927.693.

<details>
    <summary>
    Подробности выбора гранулы
    </summary>
    <p>

Диаграмма выше показывает, что метка 176 — это первая запись индекса, где как минимум значение UserID ассоциированной гранулы 176 меньше, чем 749.927.693, и минимальное значение UserID для гранулы 177 для следующей метки (метка 177) больше, чем это значение. Поэтому только соответствующая гранула 176 для метки 176 может содержать строки со значением столбца UserID 749.927.693.
</p>
</details>

Чтобы подтвердить (или опровергнуть), что какие-то строки в грануле 176 содержат значение столбца UserID 749.927.693, все 8192 строки, принадлежащие этой грануле, нужно передать в ClickHouse.

Для этого ClickHouse необходимо знать физическое местоположение гранулы 176.

В ClickHouse физические местоположения всех гранул для нашей таблицы хранятся в файлах меток. Аналогично файлам данных, для каждого столбца таблицы имеется один файл меток.

Следующая диаграмма показывает три файла меток `UserID.mrk`, `URL.mrk` и `EventTime.mrk`, которые хранят физические местоположения гранул для столбцов `UserID`, `URL` и `EventTime` таблицы.

<Image img={sparsePrimaryIndexes05} size="md" alt="Sparse Primary Indices 05" background="white"/>

Мы обсудили, что первичный индекс — это плоский несжатый файл массива (primary.idx), содержащий метки индекса, которые нумеруются, начиная с 0.

Аналогично, файл меток также является плоским несжатым файлом массива (*.mrk), содержащим метки, которые нумеруются, начиная с 0.

Как только ClickHouse идентифицировал и выбрал метку индекса для гранулы, которая может содержать соответствующие записи для запроса, можно выполнить выборку в позиционном массиве в файлах меток, чтобы получить физические местоположения гранулы.

Каждая запись файла меток для конкретного столбца хранит два местоположения в виде смещений:

- Первое смещение ('block_offset' на диаграмме выше) находит <a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">блок</a> в файле данных <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">сжатого</a> столбца, который содержит сжатую версию выбранной гранулы. Этот сжатый блок потенциально содержит несколько сжатых гранул. На чтение расположенный сжатый блок файла распаковывается в основную память.

- Второе смещение ('granule_offset' на диаграмме выше) из файла меток предоставляет местоположение гранулы в данных распакованного блока.

Все 8192 строки, принадлежащие найденной распакованной грануле, затем передаются в ClickHouse для дальнейшей обработки.


:::note

- Для таблиц с [широким форматом](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) и без [адаптивной гранулярности индекса](/whats-new/changelog/2019.md/#experimental-features-1) ClickHouse использует файлы меток `.mrk` так, как показано выше, которые содержат записи с двумя 8-байтными адресами на запись. Эти записи являются физическими местоположениями гранул однотипного размера.

 Гранулярность индекса по умолчанию является адаптивной [по умолчанию](/operations/settings/merge-tree-settings#index_granularity_bytes), но для нашей таблицы-примера мы отключили адаптивную гранулярность индекса (чтобы упростить обсуждение в данном руководстве, а также сделать диаграммы и результаты воспроизводимыми). Наша таблица использует широкий формат, потому что размер данных больше, чем [min_bytes_for_wide_part](/operations/settings/merge-tree-settings#min_bytes_for_wide_part) (который по умолчанию составляет 10 МБ для самоуправляемых кластеров).

- Для таблиц с широким форматом и с адаптивной гранулярностью индекса ClickHouse использует файлы меток `.mrk2`, которые содержат подобные записи файлов меток `.mrk`, но с дополнительным третьим значением на запись: количество строк в грануле, к которой относится запись.

- Для таблиц с [компактным форматом](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) ClickHouse использует файлы меток `.mrk3`.

:::


:::note Почему файлы меток

Почему первичный индекс не содержит напрямую физические местоположения гранул, соответствующих меткам индекса?

Поскольку в очень крупных масштабах, для которых разработан ClickHouse, важно быть очень эффективным с точки зрения использования диска и памяти.

Файл первичного индекса должен помещаться в основную память.

Для нашего примера запроса ClickHouse использовал первичный индекс и выбрал единственную гранулу, которая может содержать строки, соответствующие нашему запросу. Только для этой одной гранулы ClickHouse затем нужны физические местоположения, чтобы передать соответствующие строки для дальнейшей обработки.

Кроме того, эта информация о смещении нужна только для столбцов UserID и URL.

Информация о смещении не нужна для столбцов, которые не используются в запросе, например, `EventTime`.

Для нашего примера запроса ClickHouse нужны только два смещения физического местоположения для гранулы 176 в файле данных UserID (UserID.bin) и два смещения физического местоположения для гранулы 176 в файле данных URL (URL.bin).

Опосредование, предоставляемое файлами меток, позволяет избегать хранения, непосредственно внутри первичного индекса, записей для физических местоположений всех 1083 гранул для всех трёх столбцов: таким образом, избегая нахождения ненужных (возможно, неиспользуемых) данных в основной памяти.
:::

Следующая диаграмма и текст ниже иллюстрируют, как для нашего примера запроса ClickHouse находит гранулу 176 в файле данных UserID.bin.

<Image img={sparsePrimaryIndexes06} size="md" alt="Sparse Primary Indices 06" background="white"/>

Мы обсуждали ранее в данном руководстве, что ClickHouse выбрал метку первичного индекса 176 и, следовательно, гранулу 176 как потенциально содержащую соответствующие строки для нашего запроса.

Теперь ClickHouse использует выбранный номер метки (176) из индекса для поиска в массиве позиции в файле меток UserID.mrk, чтобы получить два смещения для определения местоположения гранулы 176.

Как показано, первое смещение находит сжатый блок файла в файле данных UserID.bin, который, в свою очередь, содержит сжатую версию гранулы 176.

После того как найденный блок файла будет распакован в основную память, второе смещение из файла меток может быть использовано для определения местоположения гранулы 176 в данных распакованного блока.

ClickHouse необходимо определить местоположение (и передать все значения) гранулы 176 как из файла данных UserID.bin, так и из файла данных URL.bin, чтобы выполнить наш пример запроса (топ 10 самых кликаемых URL для интернет-пользователя с UserID 749.927.693).

Диаграмма выше показывает, как ClickHouse находит гранулу для файла данных UserID.bin.

Параллельно ClickHouse делает то же самое для гранулы 176 для файла данных URL.bin. Две соответствующие гранулы выравниваются и передаются в движок ClickHouse для дальнейшей обработки, то есть для агрегации и подсчёта значений URL для каждой группы для всех строк, где UserID равен 749.927.693, перед окончательным выводом 10 наибольших групп URL в нисходящем порядке по количеству.
## Использование нескольких первичных индексов {#using-multiple-primary-indexes}

<a name="filtering-on-key-columns-after-the-first"></a>
### Вторичные столбцы ключа могут быть (не)эффективными {#secondary-key-columns-can-not-be-inefficient}

Когда запрос фильтруется по столбцу, который является частью составного ключа и является первым столбцом ключа, [тогда ClickHouse выполняет бинарный поиск по меткам индекса столбца ключа](#the-primary-index-is-used-for-selecting-granules).

Но что происходит, если запрос фильтруется по столбцу, который является частью составного ключа, но не является первым столбцом ключа?

:::note
Мы обсуждаем сценарий, когда запрос явно не фильтруется по первому столбцу ключа, а по вторичному столбцу ключа.

Когда запрос фильтруется как по первому столбцу ключа, так и по любому(ым) другому(им) столбцу(ам) ключа после первого, ClickHouse выполняет бинарный поиск по меткам индекса первого столбца ключа.
:::

<br/>
<br/>

<a name="query-on-url"></a>
Мы используем запрос, который вычисляет топ 10 пользователей, которые чаще всего кликали по URL "http://public_search":

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
Processed 8.81 million rows,
799.69 MB (102.11 million rows/s., 9.27 GB/s.)
```

Вывод клиента указывает на то, что ClickHouse почти выполнил полное сканирование таблицы, несмотря на то, что [столбец URL является частью составного первичного ключа](#a-table-with-a-primary-key)! ClickHouse считал 8.81 миллиона строк из 8.87 миллионов строк таблицы.

Если [trace_logging](/operations/server-configuration-parameters/settings#logger) включен, то файл логов сервера ClickHouse показывает, что ClickHouse использовал <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">генерический алгоритм поиска исключений</a> среди 1083 меток индекса URL, чтобы определить те гранулы, которые могут содержать строки со значением столбца URL "http://public_search":
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
Мы можем видеть в примере трассировки выше, что 1076 (через метки) из 1083 гранул были выбраны как потенциально содержащие строки с совпадающим значением URL.

Это приводит к тому, что 8.81 миллиона строк передаются в движок ClickHouse (параллельно, используя 10 потоков), чтобы найти строки, которые действительно содержат значение URL "http://public_search".

Однако, как мы увидим позже, только 39 гранул из выбранных 1076 гранул действительно содержат совпадающие строки.

Хотя первичный индекс, основанный на составном первичном ключе (UserID, URL), был очень полезен для ускорения запросов, фильтрующих строки с определённым значением UserID, индекс не оказывает значительной помощи в ускорении запросов, фильтрующих строки с определённым значением URL.

Причина в том, что столбец URL не является первым столбцом ключа, и поэтому ClickHouse использует алгоритм генерического поиска исключений (вместо бинарного поиска) среди меток индекса столбца URL, и **эффективность этого алгоритма зависит от разницы в кардинальности** между столбцом URL и его столбцом-предшественником UserID.

Для иллюстрации этого приведём некоторые детали о том, как работает алгоритм генерического поиска исключений.

<a name="generic-exclusion-search-algorithm"></a>
### Алгоритм генерического поиска исключений {#generic-exclusion-search-algorithm}

Следующее иллюстрирует, как работает <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank" >алгоритм генерического поиска исключений ClickHouse</a>, когда гранулы выбираются через вторичный столбец, где у столбца ключа-предшественника низкая(ая) или высокая(ая) кардинальность.

В качестве примера для обоих случаев мы предположим:
- запрос, который ищет строки со значением URL = "W3".
- абстрактную версию нашей таблицы хитов с упрощёнными значениями для UserID и URL.
- тот же составной первичный ключ (UserID, URL) для индекса. Это означает, что строки сначала упорядочены по значениям UserID. Строки с одинаковым значением UserID затем упорядочены по URL.
- размер гранулы равен двум, то есть каждая гранула содержит две строки.

Мы отметили значения столбцов ключа для первых строк таблицы каждой гранулы оранжевым цветом на диаграммах ниже.

**Столбец ключа-предшественника имеет низкую(ую) кардинальность**<a name="generic-exclusion-search-fast"></a>

Предположим, что UserID имеет низкую кардинальность. В этом случае вероятно, что одно и то же значение UserID распределено по нескольким строкам таблицы и гранулам, и, следовательно, метки индекса. Для меток индекса с одинаковым UserID значения URL для меток индекса отсортированы в порядке возрастания (поскольку строки таблицы упорядочены сначала по UserID, а затем по URL). Это позволяет эффективную фильтрацию, как описано ниже:

<Image img={sparsePrimaryIndexes07} size="md" alt="Sparse Primary Indices 06" background="white"/>

Есть три различных сценария для процесса выбора гранулы для нашего абстрактного примера данных на диаграмме выше:

1. Метка индекса 0, для которой **значение URL меньше, чем W3, и для которой значение URL следующей по порядку метки индекса также меньше, чем W3**, может быть исключена, потому что метки 0 и 1 имеют одно и то же значение UserID. Обратите внимание, что это условие исключения гарантирует, что гранула 0 полностью состоит из значений UserID U1, так что ClickHouse может предположить, что также и максимальное значение URL в грануле 0 меньше, чем W3, и исключить гранулу.

2. Метка индекса 1, для которой **значение URL меньше (или равно) W3, и для которой значение URL следующей по порядку метки индекса больше (или равно) W3**, выбирается, потому что это означает, что гранула 1 может содержать строки с URL W3.

3. Метки индекса 2 и 3, для которых **значение URL больше, чем W3**, могут быть исключены, поскольку метки индекса в первичном индексе хранят значения столбцов ключа для первой строки таблицы для каждой гранулы, а строки таблицы отсортированы на диске по значениям столбцов ключа, поэтому гранулы 2 и 3 не могут содержать значение URL W3.

**Столбец ключа-предшественника имеет высокую(ую) кардинальность**<a name="generic-exclusion-search-slow"></a>

Когда у UserID высокая кардинальность, маловероятно, что одно и то же значение UserID распределено по нескольким строкам таблицы и гранулам. Это означает, что значения URL для меток индекса не монотонно возрастают:

<Image img={sparsePrimaryIndexes08} size="md" alt="Sparse Primary Indices 06" background="white"/>

Как мы можем видеть на диаграмме выше, все показанные метки, значения URL которых меньше, чем W3, выбираются для передачи строк их соответствующих гранул в движок ClickHouse.

Это происходит потому, что, хотя все метки индекса на диаграмме подпадают под сценарий 1, описанный выше, они не удовлетворяют упомянутому условию исключения, что *следующая по порядку метка индекса имеет то же значение UserID, что и текущая метка*, и потому не могут быть исключены.

Например, рассмотрим метку индекса 0, для которой **значение URL меньше, чем W3, и для которой значение URL следующей по порядку метки индекса также меньше, чем W3**. Это исключение *не может* быть применено, потому что следующая по порядку метка индекса 1 не имеет того же значения UserID, что и текущая метка 0.

Это в конечном итоге препятствует ClickHouse делать предположения о максимальном значении URL в грануле 0. Вместо этого оно должно предположить, что гранула 0 может содержать строки со значением URL W3 и вынужденный выбрать метку 0.


Такая же ситуация применима для меток 1, 2 и 3.


:::note Заключение
<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">Алгоритм генерического поиска исключений</a>, который ClickHouse использует вместо <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">алгоритма бинарного поиска</a>, когда запрос фильтруется по столбцу, который является частью составного ключа, но не первым столбцом ключа, наиболее эффективен, когда у столбца ключа-предшественника низкая(ая) кардинальность.
:::

В нашей выборке данных для обоих столбцов ключа (UserID, URL) имеется схожая высокая кардинальность, и, как объяснено, алгоритм генерического поиска исключений не очень эффективен, когда у столбца ключа-предшественника для столбца URL высокая(ая) или схожая кардинальность.
### Примечание об индексе пропуска данных {#note-about-data-skipping-index}

Из-за одинаково высокой кардинальности UserID и URL наш [запрос с фильтрацией по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) также не получит значительной выгоды от создания [вторичного индекса пропуска данных](./skipping-indexes.md) по столбцу URL нашей [таблицы с составным первичным ключом (UserID, URL)](#a-table-with-a-primary-key).

Например, эти два оператора создают и заполняют индекс пропуска данных типа [minmax](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) по столбцу URL нашей таблицы:
```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```
ClickHouse теперь создал дополнительный индекс, который хранит - для группы из 4 последовательных [гранул](#data-is-organized-into-granules-for-parallel-data-processing) (обратите внимание на `GRANULARITY 4` в операторе `ALTER TABLE` выше) - минимальное и максимальное значение URL:

<Image img={sparsePrimaryIndexes13a} size="md" alt="Sparse Primary Indices 13a" background="white"/>

Первая запись индекса ('метка 0' на диаграмме выше) хранит минимальные и максимальные значения URL для [строк, относящихся к первым 4 гранулам нашей таблицы](#data-is-organized-into-granules-for-parallel-data-processing).

Вторая запись индекса ('метка 1') хранит минимальные и максимальные значения URL для строк, относящихся к следующим 4 гранулам нашей таблицы, и так далее.

(ClickHouse также создал специальный [файл меток](#mark-files-are-used-for-locating-granules) для индекса пропуска данных для [поиска](#mark-files-are-used-for-locating-granules) групп гранул, связанных с метками индекса.)


Из-за одинаково высокой кардинальности UserID и URL этот вторичный индекс пропуска данных не может помочь с исключением гранул из выбора, когда наш [запрос с фильтрацией по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) выполняется.

Конкретное значение URL, которое ищет запрос (например, 'http://public_search'), с большой вероятностью находится между минимальным и максимальным значением, хранимым индексом для каждой группы гранул, в результате чего ClickHouse вынужден выбирать группу гранул (так как они могут содержать строку или строки, соответствующие запросу).
### Необходимость использования нескольких первичных индексов {#a-need-to-use-multiple-primary-indexes}

Таким образом, если мы хотим значительно ускорить наш пример запроса, который фильтрует строки по конкретному URL, то нам нужно использовать первичный индекс, оптимизированный для этого запроса.

Если, кроме того, мы хотим сохранить хорошую производительность нашего примера запроса, который фильтрует строки по конкретному UserID, тогда нам нужно использовать несколько первичных индексов.

Ниже приведены способы достижения этой цели.

<a name="multiple-primary-indexes"></a>
### Варианты создания дополнительных первичных индексов {#options-for-creating-additional-primary-indexes}

Если мы хотим значительно ускорить оба наших примера запросов - тот, который фильтрует строки по конкретному UserID, и тот, который фильтрует строки по конкретному URL - тогда нам нужно использовать несколько первичных индексов, используя один из этих трех вариантов:

- Создать **вторую таблицу** с другим первичным ключом.
- Создать **материализованное представление** на нашей существующей таблице.
- Добавить **проекцию** к нашей существующей таблице.

Все три варианта фактически дублируют наши примерные данные в дополнительной таблице, чтобы реорганизовать первичный индекс таблицы и порядок сортировки строк.

Однако три варианта различаются по степени прозрачности этой дополнительной таблицы для пользователя в отношении маршрутизации запросов и вставки данных.

При создании **второй таблицы** с другим первичным ключом, запросы должны быть явно направлены на версию таблицы, лучше всего подходящую для запроса, а новые данные должны быть явно вставлены в обе таблицы для поддержания синхронности таблиц:

<Image img={sparsePrimaryIndexes09a} size="md" alt="Sparse Primary Indices 09a" background="white"/>

С **материализованным представлением** дополнительная таблица создается неявно, и данные автоматически синхронизируются между обеими таблицами:

<Image img={sparsePrimaryIndexes09b} size="md" alt="Sparse Primary Indices 09b" background="white"/>

А **проекция** является самым прозрачным вариантом, так как помимо автоматической синхронизации созданной (и скрытой) дополнительной таблицы с изменениями данных, ClickHouse автоматически выбирает наиболее эффективную версию таблицы для запросов:

<Image img={sparsePrimaryIndexes09c} size="md" alt="Sparse Primary Indices 09c" background="white"/>

В следующем разделе мы обсуждаем эти три варианта создания и использования нескольких первичных индексов более подробно и на реальных примерах.

<a name="multiple-primary-indexes-via-secondary-tables"></a>
### Вариант 1: Вторичные таблицы {#option-1-secondary-tables}

<a name="secondary-table"></a>
Мы создаем новую дополнительную таблицу, в которой меняем порядок столбцов ключа (по сравнению с нашей исходной таблицей) в первичном ключе:

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

Вставьте все 8.87 миллионов строк из нашей [исходной таблицы](#a-table-with-a-primary-key) в дополнительную таблицу:

```sql
INSERT INTO hits_URL_UserID
SELECT * from hits_UserID_URL;
```

Ответ будет таким:

```response
Ok.

0 rows in set. Elapsed: 2.898 sec. Processed 8.87 million rows, 838.84 MB (3.06 million rows/s., 289.46 MB/s.)
```

И, наконец, оптимизируйте таблицу:
```sql
OPTIMIZE TABLE hits_URL_UserID FINAL;
```

Поскольку мы изменили порядок столбцов в первичном ключе, вставленные строки теперь хранятся на диске в другом лексикографическом порядке (по сравнению с нашей [исходной таблицей](#a-table-with-a-primary-key)), и поэтому также 1083 гранулы этой таблицы содержат другие значения, чем раньше:

<Image img={sparsePrimaryIndexes10} size="md" alt="Sparse Primary Indices 10" background="white"/>

Это результативный первичный ключ:

<Image img={sparsePrimaryIndexes11} size="md" alt="Sparse Primary Indices 11" background="white"/>

Который теперь можно использовать для значительного ускорения выполнения нашего примерного запроса с фильтрацией по столбцу URL для вычисления топ-10 пользователей, которые чаще всего кликают на URL "http://public_search":
```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

Ответ будет:
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

Теперь, вместо [почти полного сканирования таблицы](/guides/best-practices/sparse-primary-indexes#efficient-filtering-on-secondary-key-columns), ClickHouse выполнил этот запрос намного эффективнее.

С первичным индексом из [исходной таблицы](#a-table-with-a-primary-key), где UserID был первым, а URL вторым столбцом ключа, ClickHouse использовал [алгоритм поиска исключений общего вида](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) по меткам индекса для выполнения этого запроса, и это было не очень эффективно из-за одинаково высокой кардинальности UserID и URL.

С URL в качестве первого столбца в первичном индексе, ClickHouse теперь выполняет <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">бинарный поиск</a> по меткам индекса.
Соответствующий трассировочный лог в файле журнала сервера ClickHouse подтверждает это:
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
ClickHouse выбрал только 39 меток индекса вместо 1076, когда использовался общий поиск исключений.


Обратите внимание, что дополнительная таблица оптимизирована для ускорения выполнения нашего примерного запроса с фильтрацией по URL.


Аналогично [плохой производительности](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) этого запроса с нашей [исходной таблицей](#a-table-with-a-primary-key), наш [пример запроса с фильтрацией по UserID](#the-primary-index-is-used-for-selecting-granules) не будет выполнен очень эффективно с новой дополнительной таблицей, потому что UserID теперь второй столбец ключа в первичном индексе этой таблицы, и поэтому ClickHouse будет использовать общий поиск исключений для выбора гранул, который [не очень эффективен при одинаково высокой кардинальности](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) UserID и URL.
Раскройте поле для деталей.

<details>
    <summary>
    Запрос с фильтрацией по UserID теперь имеет плохую производительность<a name="query-on-userid-slow"></a>
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

Ответ будет:

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

Теперь у нас есть две таблицы. Оптимизированы для ускорения запросов с фильтрацией по `UserID` и ускорения запросов с фильтрацией по URL соответственно:
### Вариант 2: Материализованные представления {#option-2-materialized-views}

Создайте [материализованное представление](/sql-reference/statements/create/view.md) на нашей существующей таблице.
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
- мы меняем порядок столбцов ключа (по сравнению с нашей [исходной таблицей](#a-table-with-a-primary-key)) в первичном ключе представления
- материализованное представление поддерживается **неявно созданной таблицей**, порядок строк и первичный индекс которой основаны на заданном определении первичного ключа
- неявно созданная таблица перечисляется запросом `SHOW TABLES` и имеет имя, начинающееся с `.inner`
- также возможно сначала явно создать поддерживающую таблицу для материализованного представления, и затем представление может быть направлено на эту таблицу с помощью `TO [db].[table]` [оператор](/sql-reference/statements/create/view.md)
- мы используем ключевое слово `POPULATE`, чтобы немедленно заполнить неявно созданную таблицу всеми 8.87 миллионами строк из исходной таблицы [hits_UserID_URL](#a-table-with-a-primary-key)
- если новые строки вставляются в исходную таблицу hits_UserID_URL, то эти строки автоматически также вставляются в неявно созданную таблицу
- фактически неявно созданная таблица имеет тот же порядок строк и первичный индекс, что и [вторичная таблица, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables):

<Image img={sparsePrimaryIndexes12b1} size="md" alt="Sparse Primary Indices 12b1" background="white"/>

ClickHouse хранит [файлы данных столбца](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin), [файлы меток](#mark-files-are-used-for-locating-granules) (*.mrk2) и [первичный индекс](#the-primary-index-has-one-entry-per-granule) (primary.idx) неявно созданной таблицы в специальной папке в каталоге данных сервера ClickHouse:

<Image img={sparsePrimaryIndexes12b2} size="md" alt="Sparse Primary Indices 12b2" background="white"/>

:::

Неявно созданная таблица (и ее первичный индекс), поддерживающая материализованное представление, теперь может использоваться для значительного ускорения выполнения нашего примера запроса с фильтрацией по столбцу URL:
```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM mv_hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

Ответ будет:

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

Поскольку фактически неявно созданная таблица (и ее первичный индекс), поддерживающая материализованное представление, идентична [вторичной таблице, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables), запрос выполняется также эффективно, как и с явно созданной таблицей.

Соответствующий трассировочный лог в файле журнала сервера ClickHouse подтверждает, что ClickHouse выполняет бинарный поиск по меткам индекса:

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
- проекция создаёт **скрытую таблицу**, порядок строк и первичный индекс которой основаны на заданной инструкции `ORDER BY` проекции
- скрытая таблица не отображается в результате выполнения запроса `SHOW TABLES`
- мы используем ключевое слово `MATERIALIZE`, чтобы немедленно заполнить скрытую таблицу всеми 8.87 миллионами строк из исходной таблицы [hits_UserID_URL](#a-table-with-a-primary-key)
- если новые строки вставляются в исходную таблицу hits_UserID_URL, то такие строки автоматически также вставляются в скрытую таблицу
- запрос всегда (синтаксически) нацелен на исходную таблицу hits_UserID_URL, но если порядок строк и первичный индекс скрытой таблицы позволяют выполнить запрос более эффективно, то будет использована эта скрытая таблица
- пожалуйста, обратите внимание, что проекции не делают запросы, использующие ORDER BY, более эффективными, даже если ORDER BY соответствует инструкциям ORDER BY проекции (см. https://github.com/ClickHouse/ClickHouse/issues/47333)
- фактически неявно созданная скрытая таблица имеет тот же порядок строк и первичный индекс, что и [вторичная таблица, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables):

<Image img={sparsePrimaryIndexes12c1} size="md" alt="Sparse Primary Indices 12c1" background="white"/>

ClickHouse хранит [файлы данных столбца](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin), [файлы меток](#mark-files-are-used-for-locating-granules) (*.mrk2) и [первичный индекс](#the-primary-index-has-one-entry-per-granule) (primary.idx) скрытой таблицы в специальной папке (отмеченной оранжевым на скриншоте ниже) рядом с файлами данных источника таблицы, файлами меток и файлами первичного индекса:

<Image img={sparsePrimaryIndexes12c2} size="sm" alt="Sparse Primary Indices 12c2" background="white"/>

:::


Скрытая таблица (и её первичный индекс), созданная проекцией, теперь может быть (неявно) использована для значительного ускорения выполнения нашего примерного запроса с фильтрацией по столбцу URL. Обратите внимание, что запрос синтаксически нацелен на исходную таблицу проекции.
```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

Ответ будет:

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

Поскольку фактически скрытая таблица (и её первичный индекс), созданная проекцией, идентична [вторичной таблице, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables), запрос выполняется также эффективно, как и с явно созданной таблицей.

Соответствующий трассировочный лог в файле журнала сервера ClickHouse подтверждает, что ClickHouse выполняет бинарный поиск по меткам индекса:


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

Первичный индекс нашей [таблицы с составным первичным ключом (UserID, URL)](#a-table-with-a-primary-key) был очень полезен для ускорения [запроса с фильтрацией по UserID](#the-primary-index-is-used-for-selecting-granules). Но этот индекс не предоставил значительной помощи в ускорении [запроса с фильтрацией по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient), несмотря на то, что столбец URL является частью составного первичного ключа.

И наоборот:
Первичный индекс нашей [таблицы с составным первичным ключом (URL, UserID)](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) ускорял [запрос с фильтрацией по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient), но не предоставил большой поддержки запросу с [фильтрацией по UserID](#the-primary-index-is-used-for-selecting-granules).

Из-за одинаково высокой кардинальности столбцов первичного ключа UserID и URL, запрос, который фильтрует по второму столбцу ключа, [не получает значительной выгоды от того, что второй столбец ключа находится в индексе](#generic-exclusion-search-algorithm).

Таким образом, имеет смысл удалить второй столбец ключа из первичного индекса (что приводит к меньшему использованию памяти индексом) и [использовать несколько первичных индексов](/guides/best-practices/sparse-primary-indexes#using-multiple-primary-indexes) вместо этого.


Однако, если столбцы ключа в составном первичном ключе имеют большие различия в кардинальности, то [полезно для запросов](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) упорядочить столбцы первичного ключа по кардинальности в порядке возрастания.

Чем выше разница в кардинальности между столбцами ключа, тем больше имеет значение порядок этих столбцов в ключе. Мы продемонстрируем это в следующем разделе.
## Эффективный порядок столбцов ключа {#ordering-key-columns-efficiently}

<a name="test"></a>

В составном первичном ключе порядок столбцов ключа может существенно влиять как на:
- эффективность фильтрации по вторичным столбцам ключа в запросах, так и
- коэффициент сжатия для файлов данных таблицы.

Чтобы продемонстрировать это, мы используем версию нашего [набор веб-трафика](#data-set), где каждая строка содержит три столбца, указывающих, был ли доступ по Интернету 'пользователя' (столбец `UserID`) к URL (столбец `URL`) отмечен как трафик ботов (столбец `IsRobot`).

Мы используем составной первичный ключ, содержащий все три упомянутых столбца, который можно использовать для ускорения запросов веб-аналитики, которые вычисляют:
- какой процент трафика на конкретный URL исходит от ботов, или
- насколько мы уверены, что конкретный пользователь (не) является ботом (какой процент трафика от этого пользователя (не) предполагается как трафик ботов)

Мы используем этот запрос для вычисления кардинальностей трех столбцов, которые мы хотим использовать в качестве столбцов ключа в составном первичном ключе (обратите внимание, что мы используем [табличную функцию URL](/sql-reference/table-functions/url.md), чтобы запрашивать данные TSV с использованием гибкого подхода без необходимости создания локальной таблицы). Выполните этот запрос в `clickhouse client`:
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

Мы видим, что существует большая разница между кардинальностями, особенно между столбцами `URL` и `IsRobot`, и поэтому порядок этих столбцов в составном первичном ключе имеет значение для как эффективного ускорения запросов, фильтрующих по этим столбцам, так и для достижения оптимальных коэффициентов сжатия для файлов данных столбцов таблицы.

Чтобы продемонстрировать это, мы создаем две версии таблицы для наших данных анализа трафика ботов:
- таблица `hits_URL_UserID_IsRobot` с составным первичным ключом `(URL, UserID, IsRobot)`, где мы упорядочиваем столбцы ключа по кардинальности в порядке убывания
- таблица `hits_IsRobot_UserID_URL` с составным первичным ключом `(IsRobot, UserID, URL)`, где мы упорядочиваем столбцы ключа по кардинальности в порядке возрастания


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

И заполните её 8.87 миллиона строк:
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


Далее, создайте таблицу `hits_IsRobot_UserID_URL` с составным первичным ключом `(IsRobot, UserID, URL)`:
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
И заполните её теми же 8.87 миллионами строк, которые мы использовали для заполнения предыдущей таблицы:

```sql
INSERT INTO hits_IsRobot_UserID_URL SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```
Ответ будет:
```response
0 rows in set. Elapsed: 95.959 sec. Processed 8.87 million rows, 15.88 GB (92.48 thousand rows/s., 165.50 MB/s.)
```
### Эффективная фильтрация по вторичным столбцам ключа {#efficient-filtering-on-secondary-key-columns}

Когда запрос фильтруется как минимум по одному столбцу, который является частью составного ключа, и является первым столбцом ключа, [тогда ClickHouse выполняет бинарный поиск по меткам индекса столбца ключа](#the-primary-index-is-used-for-selecting-granules).

Когда запрос фильтруется (только) по столбцу, который является частью составного ключа, но не первым столбцом ключа, [тогда ClickHouse использует алгоритм поиска исключений общего вида по меткам индекса столбца ключа](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient).


Для второго случая порядок столбцов ключа в составном первичном ключе имеет значение для эффективности [алгоритма поиска исключений общего вида](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444).

Это запрос, который фильтруется по столбцу `UserID` таблицы, где мы упорядочили столбцы ключа `(URL, UserID, IsRobot)` по кардинальности в порядке убывания:
```sql
SELECT count(*)
FROM hits_URL_UserID_IsRobot
WHERE UserID = 112304
```
Ответ будет:
```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.026 sec.

# highlight-next-line
Processed 7.92 million rows,
31.67 MB (306.90 million rows/s., 1.23 GB/s.)
```

Это тот же запрос на таблице, где мы упорядочили столбцы ключа `(IsRobot, UserID, URL)` по кардинальности в порядке возрастания:
```sql
SELECT count(*)
FROM hits_IsRobot_UserID_URL
WHERE UserID = 112304
```
Ответ будет:
```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.003 sec.

# highlight-next-line
Processed 20.32 thousand rows,
81.28 KB (6.61 million rows/s., 26.44 MB/s.)
```

Мы видим, что выполнение запроса значительно более эффективно и быстрее на таблице, где мы упорядочили столбцы ключа по кардинальности в порядке возрастания.

Причина этого в том, что [алгоритм поиска исключений общего вида](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444) работает наиболее эффективно, когда [гранулы](#the-primary-index-is-used-for-selecting-granules) выбираются через вторичный столбец ключа, где предшествующий столбец ключа имеет более низкую кардинальность. Мы подробно иллюстрировали это в [предыдущей части](#generic-exclusion-search-algorithm) данного руководства.
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
Мы можем видеть, что коэффициент сжатия для столбца `UserID` значительно выше для таблицы, где мы упорядочили ключевые столбцы `(IsRobot, UserID, URL)` по кардинальности в возрастающем порядке.

Хотя в обеих таблицах хранится совершенно одинаковые данные (мы вставили одинаковые 8,87 миллиона строк в обе таблицы), порядок ключевых столбцов в составном первичном ключе имеет значительное влияние на то, сколько дискового пространства требуется для <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">сжатых</a> данных в [файлах данных столбца](#data-is-stored-on-disk-ordered-by-primary-key-columns) таблицы:
- в таблице `hits_URL_UserID_IsRobot` с составным первичным ключом `(URL, UserID, IsRobot)`, где мы упорядочили ключевые столбцы по кардинальности в убывающем порядке, файл данных `UserID.bin` занимает **11.24 MiB** дискового пространства
- в таблице `hits_IsRobot_UserID_URL` с составным первичным ключом `(IsRobot, UserID, URL)`, где мы упорядочили ключевые столбцы по кардинальности в возрастающем порядке, файл данных `UserID.bin` занимает только **877.47 KiB** дискового пространства

Хороший коэффициент сжатия данных столбца таблицы на диске не только экономит место на диске, но и делает запросы (особенно аналитические), требующие чтения данных из этого столбца, быстрее, так как требуется меньше ввода-вывода для перемещения данных столбца с диска в оперативную память (файловый кэш операционной системы).

Далее мы иллюстрируем, почему для коэффициента сжатия столбцов таблицы выгодно упорядочивать столбцы первичного ключа по кардинальности в возрастающем порядке.

Диаграмма ниже показывает порядок строк на диске для первичного ключа, где ключевые столбцы упорядочены по кардинальности в возрастающем порядке:

<Image img={sparsePrimaryIndexes14a} size="md" alt="Sparse Primary Indices 14a" background="white"/>

Мы обсудили, что [данные строк таблицы хранятся на диске, упорядоченные по столбцам первичного ключа](#data-is-stored-on-disk-ordered-by-primary-key-columns).

На диаграмме выше строки таблицы (их значения столбцов на диске) сначала упорядочены по значению `cl`, и строки с одинаковым значением `cl` упорядочены по значению `ch`. И поскольку первый ключевой столбец `cl` имеет низкую кардинальность, вероятно, что существуют строки с одинаковым значением `cl`. Из-за этого также вероятно, что значения `ch` упорядочены (локально — для строк с одинаковым значением `cl`).

Если в столбце похожие данные расположены близко друг к другу, например, с помощью сортировки, то такие данные будут сжаты лучше. В общем случае, алгоритм сжатия выигрывает от длины последовательности данных (чем больше данных он видит, тем лучше для сжатия) и локальности (чем более похожи данные, тем лучше коэффициент сжатия).

В отличие от диаграммы выше, диаграмма ниже показывает порядок строк на диске для первичного ключа, где ключевые столбцы упорядочены по кардинальности в убывающем порядке:

<Image img={sparsePrimaryIndexes14b} size="md" alt="Sparse Primary Indices 14b" background="white"/>

Теперь строки таблицы сначала упорядочены по значению `ch`, и строки с одинаковым значением `ch` упорядочены по значению `cl`. Но поскольку первый ключевой столбец `ch` имеет высокую кардинальность, маловероятно, что существуют строки с одинаковым значением `ch`. Поэтому также маловероятно, что значения `cl` упорядочены (локально — для строк с одинаковым значением `ch`).

Поэтому значения `cl`, скорее всего, находятся в случайном порядке и, следовательно, имеют плохую локальность и, соответственно, коэффициент сжатия.
### Резюме {#summary-1}

Для как эффективной фильтрации по вторичным ключевым столбцам в запросах, так и коэффициента сжатия файлов данных столбцов таблицы выгодно упорядочивать столбцы в первичном ключе по их кардинальности в возрастающем порядке.
### Связанный контент {#related-content-1}
- Блог: [Ускорение ваших запросов в ClickHouse](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)
## Эффективная идентификация отдельных строк {#identifying-single-rows-efficiently}

Хотя в общем случае это [не является](/knowledgebase/key-value) лучшим случаем использования для ClickHouse, некоторые приложения, построенные поверх ClickHouse, требуют идентификации отдельных строк таблицы ClickHouse.

Интуитивным решением для этого может быть использование столбца [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) с уникальным значением для каждой строки и для быстрого извлечения строк использовать этот столбец в качестве столбца первичного ключа.

Для самого быстрого извлечения столбец UUID [должен быть первым ключевым столбцом](#the-primary-index-is-used-for-selecting-granules).

Мы обсудили, что поскольку [данные строк таблицы ClickHouse хранятся на диске, упорядоченные по столбцам первичного ключа](#data-is-stored-on-disk-ordered-by-primary-key-columns), наличие столбца с очень высокой кардинальностью (как столбец UUID) в первичном ключе или в составном первичном ключе перед столбцами с более низкой кардинальностью [вредно для коэффициента сжатия других столбцов таблицы](#optimal-compression-ratio-of-data-files).

Компромисс между самым быстрым извлечением и оптимальным сжатием данных — использование составного первичного ключа, где UUID является последним ключевым столбцом, после ключевых столбцов с низкой(er) кардинальностью, которые используются для обеспечения хорошего коэффициента сжатия для некоторых столбцов таблицы.
### Конкретный пример {#a-concrete-example}

Конкретным примером является текстовый сервис pastila.nl, который Алексей Миловидов разработал и [написал о нем в блоге](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/).

На каждое изменение текстового поля данные автоматически сохраняются в строке таблицы ClickHouse (одна строка на изменение).

И один из способов идентификации и извлечения (конкретной версии) вставленного контента — использование хеша контента в качестве UUID для строки таблицы, содержащей контент.

Следующая диаграмма показывает
- порядок вставки строк при изменении контента (например, из-за нажатий клавиш при вводе текста в текстовое поле) и
- порядок данных на диске из вставленных строк при использовании `PRIMARY KEY (hash)`:

<Image img={sparsePrimaryIndexes15a} size="md" alt="Sparse Primary Indices 15a" background="white"/>

Поскольку столбец `hash` используется как столбец первичного ключа,
- конкретные строки можно [очень быстро](#the-primary-index-is-used-for-selecting-granules) извлечь, но
- строки таблицы (их данные столбцов) хранятся на диске, упорядоченные по возрастанию значений (уникальных и случайных) хеша. Поэтому также значения столбца контента хранятся в случайном порядке без локальности данных, что приводит к **субоптимальному коэффициенту сжатия для файла данных столбца контента**.

Чтобы значительно улучшить коэффициент сжатия столбца контента и при этом достичь быстрого извлечения конкретных строк, pastila.nl использует два хеша (и составной первичный ключ) для идентификации конкретной строки:
- хеш контента, как обсуждалось выше, который отличается для различных данных, и
- [хеш локального чувствительного отпечатка](https://en.wikipedia.org/wiki/Locality-sensitive_hashing), который **не** изменяется при небольших изменениях данных.

Следующая диаграмма показывает
- порядок вставки строк при изменении контента (например, из-за нажатий клавиш при вводе текста в текстовое поле) и
- порядок данных на диске из вставленных строк при составном `PRIMARY KEY (fingerprint, hash)`:

<Image img={sparsePrimaryIndexes15b} size="md" alt="Sparse Primary Indices 15b" background="white"/>

Теперь строки на диске сначала упорядочены по `fingerprint`, а для строк с одинаковым значением отпечатка их `hash` определяет окончательный порядок.

Поскольку данные, которые отличаются только в небольших изменениях, получают одинаковое значение отпечатка, похожие данные теперь хранятся на диске близко друг к другу в столбце контента. И это очень хорошо для коэффициента сжатия столбца контента, так как алгоритм сжатия в общем случае выигрывает от локальности данных (чем более похожи данные, тем лучше коэффициент сжатия).

Компромисс состоит в том, что два поля (`fingerprint` и `hash`) необходимы для извлечения конкретной строки, чтобы оптимально использовать первичный индекс, который получается из составного `PRIMARY KEY (fingerprint, hash)`.
