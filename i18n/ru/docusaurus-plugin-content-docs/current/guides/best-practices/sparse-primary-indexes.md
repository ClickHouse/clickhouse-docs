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


# Практическое введение в первичные индексы ClickHouse



## Введение {#introduction}

В этом руководстве мы подробно рассмотрим индексирование в ClickHouse. Мы проиллюстрируем и детально обсудим:

- [чем индексирование в ClickHouse отличается от традиционных систем управления реляционными базами данных](#an-index-design-for-massive-data-scales)
- [как ClickHouse создаёт и использует разреженный первичный индекс таблицы](#a-table-with-a-primary-key)
- [какие существуют лучшие практики индексирования в ClickHouse](#using-multiple-primary-indexes)

При желании вы можете самостоятельно выполнить все SQL-запросы и команды ClickHouse, приведённые в этом руководстве, на своей машине.
Инструкции по установке ClickHouse и началу работы см. в разделе [Быстрый старт](/get-started/quick-start).

:::note
Это руководство посвящено разреженным первичным индексам ClickHouse.

Информацию о [вторичных индексах пропуска данных](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes) ClickHouse см. в [руководстве](/guides/best-practices/skipping-indexes.md).
:::

### Набор данных {#data-set}

В этом руководстве мы будем использовать образец анонимизированного набора данных веб-трафика.

- Мы будем использовать подмножество из 8,87 миллионов строк (событий) из образца набора данных.
- Размер несжатых данных составляет 8,87 миллионов событий и около 700 МБ. При хранении в ClickHouse данные сжимаются до 200 МБ.
- В нашем подмножестве каждая строка содержит три столбца, которые указывают на интернет-пользователя (столбец `UserID`), который перешёл по URL (столбец `URL`) в определённое время (столбец `EventTime`).

С помощью этих трёх столбцов мы уже можем сформулировать некоторые типичные запросы веб-аналитики, такие как:

- «Какие 10 URL чаще всего посещал конкретный пользователь?»
- «Какие 10 пользователей чаще всего переходили по конкретному URL?»
- «В какое время (например, дни недели) пользователь чаще всего переходит по конкретному URL?»

### Тестовая машина {#test-machine}

Все показатели производительности, приведённые в этом документе, основаны на локальном запуске ClickHouse 22.2.1 на MacBook Pro с чипом Apple M1 Pro и 16 ГБ оперативной памяти.

### Полное сканирование таблицы {#a-full-table-scan}

Чтобы увидеть, как выполняется запрос к нашему набору данных без первичного ключа, создадим таблицу (с движком таблиц MergeTree), выполнив следующую SQL DDL-команду:

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

Затем вставим подмножество набора данных о посещениях в таблицу с помощью следующей SQL-команды вставки.
Для этого используется [табличная функция URL](/sql-reference/table-functions/url.md), которая загружает подмножество полного набора данных, размещённого удалённо на clickhouse.com:


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

0 строк в наборе. Затрачено: 145.993 сек. Обработано 8.87 млн строк, 18.40 ГБ (60.78 тыс. строк/с., 126.06 МБ/с.)
```

Вывод результата клиента ClickHouse показывает, что выполненный выше запрос вставил в таблицу 8,87 миллиона строк.

Наконец, чтобы упростить дальнейшее обсуждение в этом руководстве и сделать диаграммы и результаты воспроизводимыми, мы [оптимизируем](/sql-reference/statements/optimize.md) таблицу с помощью ключевого слова FINAL:


```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
В целом обычно не требуется и не рекомендуется оптимизировать таблицу
сразу после загрузки в неё данных. Почему это необходимо в данном примере, станет понятно далее.
:::

Теперь выполним наш первый запрос веб-аналитики. Ниже приведён запрос, вычисляющий 10 наиболее кликаемых URL-адресов для интернет-пользователя с UserID 749927693:

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
```


10 строк в наборе. Прошло: 0.022 сек.

# highlight-next-line

Обработано 8.87 миллиона строк,
70.45 МБ (398.53 миллиона строк/с., 3.17 ГБ/с.)

```

Вывод результата клиента ClickHouse показывает, что ClickHouse выполнил полное сканирование таблицы! Каждая строка из 8,87 миллионов строк нашей таблицы была обработана ClickHouse. Это не масштабируется.

Чтобы сделать это намного более эффективным и быстрым, необходимо использовать таблицу с соответствующим первичным ключом. Это позволит ClickHouse автоматически создать разреженный первичный индекс на основе столбца (или столбцов) первичного ключа, который затем можно использовать для значительного ускорения выполнения нашего примера запроса.
```


## Дизайн индексов ClickHouse {#clickhouse-index-design}

### Дизайн индексов для массивных объемов данных {#an-index-design-for-massive-data-scales}

В традиционных системах управления реляционными базами данных первичный индекс содержит одну запись на каждую строку таблицы. Это приводит к тому, что первичный индекс для нашего набора данных содержит 8,87 миллиона записей. Такой индекс позволяет быстро находить конкретные строки, обеспечивая высокую эффективность для запросов поиска и точечных обновлений. Поиск записи в структуре данных `B(+)-дерево` имеет среднюю временную сложность `O(log n)`; точнее, `log_b n = log_2 n / log_2 b`, где `b` — коэффициент ветвления `B(+)-дерева`, а `n` — количество индексированных строк. Поскольку `b` обычно составляет от нескольких сотен до нескольких тысяч, `B(+)-деревья` являются очень неглубокими структурами, и для поиска записей требуется мало обращений к диску. При 8,87 миллионах строк и коэффициенте ветвления 1000 в среднем требуется 2,3 обращения к диску. Эта возможность имеет свою цену: дополнительные накладные расходы на диск и память, более высокие затраты на вставку при добавлении новых строк в таблицу и записей в индекс, а иногда и перебалансировка B-дерева.

Учитывая проблемы, связанные с индексами B-дерева, движки таблиц в ClickHouse используют другой подход. [Семейство движков MergeTree](/engines/table-engines/mergetree-family/index.md) в ClickHouse было разработано и оптимизировано для обработки массивных объемов данных. Эти таблицы предназначены для приема миллионов вставок строк в секунду и хранения очень больших (сотни петабайт) объемов данных. Данные быстро записываются в таблицу [частями](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage), при этом в фоновом режиме применяются правила слияния частей. В ClickHouse каждая часть имеет свой собственный первичный индекс. При слиянии частей первичные индексы объединенной части также сливаются. При очень больших масштабах, для которых разработан ClickHouse, крайне важна эффективность использования диска и памяти. Поэтому вместо индексирования каждой строки первичный индекс для части имеет одну индексную запись (известную как «метка») на группу строк (называемую «гранулой») — этот метод называется **разреженным индексом**.

Разреженное индексирование возможно, потому что ClickHouse хранит строки для части на диске, упорядоченные по столбцу (столбцам) первичного ключа. Вместо прямого поиска отдельных строк (как в индексе на основе B-дерева) разреженный первичный индекс позволяет быстро (с помощью бинарного поиска по индексным записям) идентифицировать группы строк, которые потенциально могут соответствовать запросу. Найденные группы потенциально подходящих строк (гранулы) затем параллельно передаются в движок ClickHouse для поиска совпадений. Такой дизайн индекса позволяет первичному индексу быть небольшим (он может и должен полностью помещаться в оперативную память), при этом значительно ускоряя время выполнения запросов, особенно для диапазонных запросов, типичных для сценариев аналитики данных.

Далее подробно показано, как ClickHouse строит и использует свой разреженный первичный индекс. Позже в статье мы обсудим некоторые рекомендации по выбору, удалению и упорядочиванию столбцов таблицы, которые используются для построения индекса (столбцы первичного ключа).

### Таблица с первичным ключом {#a-table-with-a-primary-key}

Создайте таблицу с составным первичным ключом, состоящим из столбцов UserID и URL:

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
    Детали DDL-выражения
    </summary>
    <p>

Чтобы упростить дальнейшее обсуждение в этом руководстве, а также сделать диаграммы и результаты воспроизводимыми, DDL-выражение:


<ul>
  <li>
    Задает составной ключ сортировки для таблицы с помощью конструкции <code>ORDER BY</code>{" "}.
  </li>
  <li>
    Явно управляет количеством записей в первичном индексе с помощью настроек:
    <ul>
      <li>
        <code>index_granularity</code>: явно установлена в значение по умолчанию
        8192. Это означает, что для каждой группы из 8192 строк первичный индекс
        будет содержать одну запись. Например, если таблица содержит 16384
        строки, индекс будет содержать две записи.
      </li>
      <li>
        <code>index_granularity_bytes</code>: установлена в 0 для отключения{" "}
        <a
          href='https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1'
          target='_blank'
        >
          адаптивной гранулярности индекса
        </a>
        . Адаптивная гранулярность индекса означает, что ClickHouse автоматически создает
        одну запись индекса для группы из n строк, если выполняется одно из следующих условий:
        <ul>
          <li>
            Если <code>n</code> меньше 8192 и размер объединенных данных
            для этих <code>n</code> строк больше или равен 10 МБ
            (значение по умолчанию для <code>index_granularity_bytes</code>).
          </li>
          <li>
            Если размер объединенных данных для <code>n</code> строк меньше
            10 МБ, но <code>n</code> равно 8192.
          </li>
        </ul>
      </li>
      <li>
        <code>compress_primary_key</code>: установлена в 0 для отключения{" "}
        <a
          href='https://github.com/ClickHouse/ClickHouse/issues/34437'
          target='_blank'
        >
          сжатия первичного индекса
        </a>
        . Это позволит при необходимости проверить его содержимое позже.
      </li>
    </ul>
  </li>
</ul>

</p>
</details>

Первичный ключ в приведенной выше DDL-инструкции приводит к созданию первичного индекса на основе двух указанных ключевых столбцов.

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

Ответ будет выглядеть так:

```response
0 строк в наборе. Прошло: 149.432 сек. Обработано 8.87 млн строк, 18.40 ГБ (59.38 тыс. строк/с., 123.16 МБ/с.)
```

<br />

Теперь оптимизируйте таблицу:

```sql
OPTIMIZE TABLE hits_UserID_URL FINAL;
```

<br />

Мы можем использовать следующий запрос, чтобы получить метаданные о таблице:


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
rows:                        8.87 миллионов
data_uncompressed_bytes:     733.28 МиБ
data_compressed_bytes:       206.94 МиБ
primary_key_bytes_in_memory: 96.93 КиБ
marks:                       1083
bytes_on_disk:               207.07 МиБ

Получена 1 строка. Затрачено: 0.003 сек.
```

Вывод клиента ClickHouse показывает:

- Данные таблицы хранятся в [широком формате](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) в определённом каталоге на диске, что означает наличие одного файла данных (и одного файла меток) для каждого столбца таблицы внутри этого каталога.
- Таблица содержит 8,87 миллионов строк.
- Размер несжатых данных всех строк составляет 733,28 МБ.
- Сжатый размер всех строк на диске составляет 206,94 МБ.
- Таблица имеет первичный индекс с 1083 записями (называемыми «метками»), размер индекса составляет 96,93 КБ.
- В общей сложности файлы данных и меток таблицы, а также файл первичного индекса занимают 207,07 МБ на диске.

### Данные хранятся на диске упорядоченными по столбцам первичного ключа {#data-is-stored-on-disk-ordered-by-primary-key-columns}

Созданная нами выше таблица имеет

- составной [первичный ключ](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)` и
- составной [ключ сортировки](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)`.

:::note

- Если бы мы указали только ключ сортировки, то первичный ключ был бы неявно определён равным ключу сортировки.

- Для эффективного использования памяти мы явно указали первичный ключ, который содержит только те столбцы, по которым фильтруются наши запросы. Первичный индекс, основанный на первичном ключе, полностью загружается в оперативную память.

- Для обеспечения согласованности диаграмм в руководстве и для максимизации степени сжатия мы определили отдельный ключ сортировки, который включает все столбцы нашей таблицы (если в столбце похожие данные размещены близко друг к другу, например, посредством сортировки, то эти данные будут сжаты лучше).

- Первичный ключ должен быть префиксом ключа сортировки, если указаны оба.
  :::

Вставленные строки хранятся на диске в лексикографическом порядке (по возрастанию) по столбцам первичного ключа (и дополнительному столбцу `EventTime` из ключа сортировки).

:::note
ClickHouse позволяет вставлять несколько строк с идентичными значениями столбцов первичного ключа. В этом случае (см. строки 1 и 2 на диаграмме ниже) окончательный порядок определяется указанным ключом сортировки и, следовательно, значением столбца `EventTime`.
:::

ClickHouse — это <a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms
" target="_blank">колоночная система управления базами данных</a>. Как показано на диаграмме ниже

- для представления на диске существует один файл данных (\*.bin) для каждого столбца таблицы, где все значения этого столбца хранятся в <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">сжатом</a> формате, и
- 8,87 миллионов строк хранятся на диске в лексикографическом порядке по возрастанию по столбцам первичного ключа (и дополнительным столбцам ключа сортировки), т. е. в данном случае
  - сначала по `UserID`,
  - затем по `URL`,
  - и наконец по `EventTime`:

<Image
  img={sparsePrimaryIndexes01}
  size='md'
  alt='Sparse Primary Indices 01'
  background='white'
/>


`UserID.bin`, `URL.bin` и `EventTime.bin` — это файлы данных на диске, в которых хранятся значения столбцов `UserID`, `URL` и `EventTime`.

:::note

- Поскольку первичный ключ определяет лексикографический порядок строк на диске, таблица может иметь только один первичный ключ.

- Мы нумеруем строки начиная с 0, чтобы соответствовать внутренней схеме нумерации строк ClickHouse, которая также используется для сообщений журнала.
  :::

### Данные организованы в гранулы для параллельной обработки {#data-is-organized-into-granules-for-parallel-data-processing}

Для целей обработки данных значения столбцов таблицы логически разделяются на гранулы.
Гранула — это наименьший неделимый набор данных, который передается в ClickHouse для обработки.
Это означает, что вместо чтения отдельных строк ClickHouse всегда читает (в потоковом режиме и параллельно) целую группу (гранулу) строк.
:::note
Значения столбцов физически не хранятся внутри гранул: гранулы представляют собой лишь логическую организацию значений столбцов для обработки запросов.
:::

На следующей диаграмме показано, как (значения столбцов) 8,87 миллионов строк нашей таблицы
организованы в 1083 гранулы в результате того, что DDL-инструкция таблицы содержит настройку `index_granularity` (установленную в значение по умолчанию 8192).

<Image
  img={sparsePrimaryIndexes02}
  size='md'
  alt='Sparse Primary Indices 02'
  background='white'
/>

Первые (на основе физического порядка на диске) 8192 строки (их значения столбцов) логически принадлежат грануле 0, затем следующие 8192 строки (их значения столбцов) принадлежат грануле 1 и так далее.

:::note

- Последняя гранула (гранула 1082) «содержит» менее 8192 строк.

- Мы упоминали в начале этого руководства в разделе «Детали DDL-инструкции», что отключили [адаптивную гранулярность индекса](/whats-new/changelog/2019.md/#experimental-features-1) (чтобы упростить изложение в этом руководстве, а также сделать диаграммы и результаты воспроизводимыми).

  Поэтому все гранулы (кроме последней) нашей примерной таблицы имеют одинаковый размер.

- Для таблиц с адаптивной гранулярностью индекса (гранулярность индекса адаптивна [по умолчанию](/operations/settings/merge-tree-settings#index_granularity_bytes)) размер некоторых гранул может быть меньше 8192 строк в зависимости от размеров данных строк.

- Мы отметили некоторые значения столбцов из наших столбцов первичного ключа (`UserID`, `URL`) оранжевым цветом.
  Эти отмеченные оранжевым значения столбцов являются значениями столбцов первичного ключа первой строки каждой гранулы.
  Как мы увидим ниже, эти отмеченные оранжевым значения столбцов станут записями в первичном индексе таблицы.

- Мы нумеруем гранулы начиная с 0, чтобы соответствовать внутренней схеме нумерации ClickHouse, которая также используется для сообщений журнала.
  :::

### Первичный индекс содержит одну запись на гранулу {#the-primary-index-has-one-entry-per-granule}

Первичный индекс создается на основе гранул, показанных на диаграмме выше. Этот индекс представляет собой несжатый файл плоского массива (primary.idx), содержащий так называемые числовые индексные метки, начинающиеся с 0.

На диаграмме ниже показано, что индекс хранит значения столбцов первичного ключа (значения, отмеченные оранжевым на диаграмме выше) для первой строки каждой гранулы.
Другими словами: первичный индекс хранит значения столбцов первичного ключа из каждой 8192-й строки таблицы (на основе физического порядка строк, определенного столбцами первичного ключа).
Например:

- первая запись индекса («метка 0» на диаграмме ниже) хранит значения ключевых столбцов первой строки гранулы 0 с диаграммы выше,
- вторая запись индекса («метка 1» на диаграмме ниже) хранит значения ключевых столбцов первой строки гранулы 1 с диаграммы выше, и так далее.

<Image
  img={sparsePrimaryIndexes03a}
  size='lg'
  alt='Sparse Primary Indices 03a'
  background='white'
/>

В общей сложности индекс содержит 1083 записи для нашей таблицы с 8,87 миллионами строк и 1083 гранулами:

<Image
  img={sparsePrimaryIndexes03b}
  size='md'
  alt='Sparse Primary Indices 03b'
  background='white'
/>


:::note
- Для таблиц с [адаптивной гранулярностью индекса](/whats-new/changelog/2019.md/#experimental-features-1) в первичном индексе также хранится одна дополнительная «финальная» метка, в которой записаны значения столбцов первичного ключа последней строки таблицы. Но поскольку мы отключили адаптивную гранулярность индекса (чтобы упростить обсуждения в этом руководстве, а также сделать диаграммы и результаты воспроизводимыми), индекс нашей таблицы-примера не включает эту финальную метку.

- Файл первичного индекса полностью загружается в оперативную память. Если файл больше доступного свободного объёма памяти, ClickHouse выдаст ошибку.
:::

<details>
    <summary>
    Просмотр содержимого первичного индекса
    </summary>
    <p>

В самостоятельно управляемом кластере ClickHouse мы можем использовать <a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">табличную функцию file</a> для просмотра содержимого первичного индекса нашей таблицы-примера.

Для этого нам сначала нужно скопировать файл первичного индекса в <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a> одного из узлов работающего кластера:
<ul>
<li>Шаг 1: Получить путь к part’у, который содержит файл первичного индекса</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

на тестовой машине возвращает `/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4`.

<li>Шаг 2: Получить user_files_path</li>
<a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">Значение по умолчанию для user_files_path</a> в Linux —  
`/var/lib/clickhouse/user_files/`

и в Linux вы можете проверить, изменялось ли оно: `$ grep user_files_path /etc/clickhouse-server/config.xml`

На тестовой машине путь — `/Users/tomschreiber/Clickhouse/user_files/`

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
Это в точности соответствует нашей диаграмме содержимого первичного индекса для таблицы-примера:

</p>
</details>

Записи первичного ключа называются метками индекса, потому что каждая запись индекса помечает начало определённого диапазона данных. В частности, для таблицы-примера:
- Метки индекса по UserID:

  Хранимые значения `UserID` в первичном индексе отсортированы по возрастанию.<br/>
  Таким образом, «метка 1» на диаграмме выше указывает, что значения `UserID` всех строк таблицы в грануле 1 и во всех следующих гранулах гарантированно больше или равны 4 073 710.



[Как мы увидим позже](#the-primary-index-is-used-for-selecting-granules), этот глобальный порядок позволяет ClickHouse <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">использовать алгоритм бинарного поиска</a> по индексным меткам для первого ключевого столбца, когда запрос выполняет фильтрацию по первому столбцу первичного ключа.

- Индексные метки URL:

  Довольно близкая кардинальность столбцов первичного ключа `UserID` и `URL`
  означает, что индексные метки для всех ключевых столбцов после первого столбца обычно указывают только на диапазон данных до тех пор, пока значение предыдущего ключевого столбца остается одинаковым для всех строк таблицы по крайней мере в пределах текущей гранулы.<br/>
  Например, поскольку значения UserID для метки 0 и метки 1 различаются на диаграмме выше, ClickHouse не может предполагать, что все значения URL всех строк таблицы в грануле 0 больше или равны `'http://showtopics.html%3...'`. Однако если бы значения UserID для метки 0 и метки 1 были одинаковыми на диаграмме выше (то есть значение UserID остается неизменным для всех строк таблицы в пределах гранулы 0), ClickHouse мог бы предположить, что все значения URL всех строк таблицы в грануле 0 больше или равны `'http://showtopics.html%3...'`.

  Мы более подробно обсудим влияние этого на производительность выполнения запросов позже.

### Первичный индекс используется для выбора гранул {#the-primary-index-is-used-for-selecting-granules}

Теперь мы можем выполнять наши запросы с использованием первичного индекса.

Следующий запрос вычисляет топ-10 наиболее часто посещаемых URL для UserID 749927693.

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

```


10 строк в наборе. Прошло: 0,005 сек.

# highlight-next-line

Обработано 8,19 тыс. строк,
740,18 KB (1,53 млн строк/с., 138,59 MB/с.)

```

Вывод клиента ClickHouse теперь показывает, что вместо полного сканирования таблицы в ClickHouse было передано только 8,19 тысячи строк.
```


Если включено <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">трассировочное логирование</a>, то в серверном журнале ClickHouse будет видно, что ClickHouse выполнял <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">бинарный поиск</a> по 1083 меткам индекса UserID, чтобы определить гранулы, которые потенциально могут содержать строки со значением столбца UserID `749927693`. Это требует 19 шагов со средней вычислительной сложностью `O(log2 n)`:

```response
...Executor): Условие по ключу: (столбец 0 в [749927693, 749927693])
# highlight-next-line
...Executor): Выполняется бинарный поиск по диапазону индекса для части all_1_9_2 (1083 гранулы)
...Executor): Найдена (ЛЕВАЯ) граничная гранула: 176
...Executor): Найдена (ПРАВАЯ) граничная гранула: 177
...Executor): Найден непрерывный диапазон за 19 шагов
...Executor): Выбрано 1/1 частей по ключу партиции, 1 частей по первичному ключу,
# highlight-next-line
              1/1083 гранул по первичному ключу, 1 гранул для чтения из 1 диапазонов
...Reading ...примерно 8192 строк, начиная с 1441792
```

Мы можем видеть из приведённого выше журнала трассировки, что одна метка из 1083 существующих меток удовлетворила условиям запроса.

<details>
  <summary>
    Подробности журнала трассировки
  </summary>

  <p>
    Была идентифицирована метка 176 (&#39;found left boundary mark&#39; — включительно, &#39;found right boundary mark&#39; — исключительно), и поэтому все 8192 строки из гранулы 176 (которая начинается с строки 1 441 792 — мы увидим это далее в данном руководстве) затем передаются в ClickHouse для поиска строк, в которых значение столбца UserID равно `749927693`.
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

Ответ будет выглядеть следующим образом:


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

Вывод клиента показывает, что одна из 1083 гранул была выбрана как потенциально содержащая строки со значением 749927693 в столбце UserID.

:::note Вывод
Когда запрос выполняет фильтрацию по столбцу, который является частью составного ключа и первым ключевым столбцом, ClickHouse применяет алгоритм бинарного поиска по индексным меткам этого столбца.
:::

<br />

Как обсуждалось выше, ClickHouse использует разреженный первичный индекс для быстрого выбора (с помощью бинарного поиска) гранул, которые могут содержать строки, соответствующие запросу.

Это **первый этап (выбор гранул)** выполнения запроса в ClickHouse.

На **втором этапе (чтение данных)** ClickHouse определяет местоположение выбранных гранул, чтобы передать все их строки в движок ClickHouse для поиска строк, фактически соответствующих запросу.

Второй этап подробно рассматривается в следующем разделе.

### Файлы меток используются для определения местоположения гранул {#mark-files-are-used-for-locating-granules}

Следующая диаграмма иллюстрирует часть файла первичного индекса для нашей таблицы.

<Image
  img={sparsePrimaryIndexes04}
  size='md'
  alt='Sparse Primary Indices 04'
  background='white'
/>

Как обсуждалось выше, с помощью бинарного поиска по 1083 меткам UserID индекса была идентифицирована метка 176. Следовательно, соответствующая ей гранула 176 может содержать строки со значением 749.927.693 в столбце UserID.

<details>
    <summary>
    Детали выбора гранул
    </summary>
    <p>

Диаграмма выше показывает, что метка 176 является первой записью индекса, где минимальное значение UserID связанной гранулы 176 меньше 749.927.693, а минимальное значение UserID гранулы 177 для следующей метки (метка 177) больше этого значения. Следовательно, только соответствующая гранула 176 для метки 176 может содержать строки со значением 749.927.693 в столбце UserID.

</p>
</details>

Чтобы подтвердить (или опровергнуть), что некоторые строки в грануле 176 содержат значение 749.927.693 в столбце UserID, все 8192 строки, принадлежащие этой грануле, должны быть переданы в ClickHouse.

Для этого ClickHouse необходимо знать физическое местоположение гранулы 176.

В ClickHouse физические местоположения всех гранул таблицы хранятся в файлах меток. Аналогично файлам данных, для каждого столбца таблицы существует один файл меток.

Следующая диаграмма показывает три файла меток `UserID.mrk`, `URL.mrk` и `EventTime.mrk`, которые хранят физические местоположения гранул для столбцов таблицы `UserID`, `URL` и `EventTime`.

<Image
  img={sparsePrimaryIndexes05}
  size='md'
  alt='Sparse Primary Indices 05'
  background='white'
/>

Мы обсудили, что первичный индекс представляет собой плоский несжатый файл-массив (primary.idx), содержащий индексные метки с нумерацией, начинающейся с 0.

Аналогично, файл меток также является плоским несжатым файлом-массивом (\*.mrk), содержащим метки с нумерацией, начинающейся с 0.

После того как ClickHouse идентифицировал и выбрал индексную метку для гранулы, которая может содержать соответствующие запросу строки, выполняется позиционный поиск в файлах меток для получения физического местоположения гранулы.

Каждая запись файла меток для конкретного столбца хранит два местоположения в виде смещений:


- Первое смещение (`block_offset` на диаграмме выше) указывает расположение <a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">блока</a> в файле данных столбца в <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">сжатом</a> виде, который содержит сжатую версию выбранной гранулы. Этот сжатый блок потенциально может содержать несколько сжатых гранул. Найденный сжатый блок файла при чтении распаковывается в оперативную память.

- Второе смещение (`granule_offset` на диаграмме выше) из mark-файла задаёт расположение гранулы внутри несжатых данных блока.

Затем все 8192 строки, принадлежащие найденной несжатой грануле, передаются в ClickHouse для дальнейшей обработки.

:::note

- Для таблиц с [широким форматом](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) и без [адаптивной гранулярности индекса](/whats-new/changelog/2019.md/#experimental-features-1) ClickHouse использует mark-файлы `.mrk`, как показано выше. Они содержат записи с двумя 8-байтовыми адресами на запись. Эти записи — физические расположения гранул, все с одинаковым размером.

 Гранулярность индекса по [умолчанию](/operations/settings/merge-tree-settings#index_granularity_bytes) является адаптивной, но для нашей примерной таблицы мы отключили адаптивную гранулярность индекса (чтобы упростить обсуждения в этом руководстве, а также сделать диаграммы и результаты воспроизводимыми). Наша таблица использует широкий формат, так как объём данных больше, чем [min_bytes_for_wide_part](/operations/settings/merge-tree-settings#min_bytes_for_wide_part) (по умолчанию 10 МБ для кластеров с самостоятельным управлением).

- Для таблиц с широким форматом и с адаптивной гранулярностью индекса ClickHouse использует mark-файлы `.mrk2`, которые содержат аналогичные записи, как и файлы `.mrk`, но с дополнительным третьим значением в каждой записи: количеством строк гранулы, с которой связана текущая запись.

- Для таблиц с [компактным форматом](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) ClickHouse использует mark-файлы `.mrk3`.

:::

:::note Why Mark Files

Почему первичный индекс напрямую не содержит физические расположения гранул, соответствующих меткам индекса?

Потому что на очень большом масштабе, для которого спроектирован ClickHouse, крайне важно эффективно использовать диск и память.

Файл первичного индекса должен помещаться в оперативную память.

В нашем примерном запросе ClickHouse использовал первичный индекс и выбрал одну гранулу, которая потенциально может содержать строки, удовлетворяющие нашему запросу. Только для этой одной гранулы ClickHouse нужны физические расположения, чтобы передать соответствующие строки для дальнейшей обработки.

Кроме того, эта информация о смещениях требуется только для столбцов UserID и URL.

Информация о смещениях не нужна для столбцов, которые не используются в запросе, например `EventTime`.

Для нашего примерного запроса ClickHouse нужны только два смещения физических расположений для гранулы 176 в файле данных UserID (UserID.bin) и два смещения физических расположений для гранулы 176 в файле данных URL (URL.bin).

Косвенная адресация, обеспечиваемая mark-файлами, позволяет не хранить непосредственно в первичном индексе записи с физическими расположениями всех 1083 гранул для всех трёх столбцов, тем самым избегая лишних (потенциально неиспользуемых) данных в оперативной памяти.
:::

Следующая диаграмма и текст ниже иллюстрируют, как в нашем примерном запросе ClickHouse находит гранулу 176 в файле данных UserID.bin.

<Image img={sparsePrimaryIndexes06} size="md" alt="Sparse Primary Indices 06" background="white"/>

Ранее в этом руководстве мы обсуждали, что ClickHouse выбрал метку первичного индекса 176 и, следовательно, гранулу 176 как потенциально содержащую строки, соответствующие нашему запросу.

Теперь ClickHouse использует выбранный номер метки (176) из индекса для позиционного поиска в массиве в mark-файле UserID.mrk, чтобы получить два смещения для определения расположения гранулы 176.

Как показано, первое смещение указывает расположение сжатого блока внутри файла данных UserID.bin, который, в свою очередь, содержит сжатую версию гранулы 176.

После того как найденный блок будет распакован в оперативную память, второе смещение из mark-файла можно использовать для поиска гранулы 176 внутри несжатых данных.

ClickHouse должен найти (и прочитать все значения из) гранулу 176 как в файле данных UserID.bin, так и в файле данных URL.bin, чтобы выполнить наш примерный запрос (топ-10 наиболее кликаемых URL-адресов для интернет-пользователя с UserID 749.927.693).



На диаграмме выше показано, как ClickHouse находит гранулу для файла данных UserID.bin.

Параллельно ClickHouse выполняет ту же операцию для гранулы 176 файла данных URL.bin. Эти две соответствующие гранулы выравниваются и потоково передаются в движок ClickHouse для дальнейшей обработки, то есть агрегации и подсчёта значений URL по группам для всех строк, где UserID равен 749.927.693, после чего выводятся 10 крупнейших групп URL в порядке убывания количества.



## Использование нескольких первичных индексов {#using-multiple-primary-indexes}

<a name='filtering-on-key-columns-after-the-first'></a>

### Вторичные ключевые столбцы могут быть неэффективными {#secondary-key-columns-can-not-be-inefficient}

Когда запрос фильтрует данные по столбцу, который является частью составного ключа и при этом является первым ключевым столбцом, [ClickHouse выполняет алгоритм бинарного поиска по индексным меткам этого столбца](#the-primary-index-is-used-for-selecting-granules).

Но что происходит, когда запрос фильтрует данные по столбцу, который является частью составного ключа, но не является первым ключевым столбцом?

:::note
Мы рассматриваем сценарий, когда запрос явно не фильтрует данные по первому ключевому столбцу, а по вторичному ключевому столбцу.

Когда запрос фильтрует данные одновременно по первому ключевому столбцу и по любому другому ключевому столбцу (столбцам) после первого, ClickHouse выполняет бинарный поиск по индексным меткам первого ключевого столбца.
:::

<br />
<br />

<a name='query-on-url'></a>
Используем запрос, который вычисляет топ-10 пользователей, наиболее часто
переходивших по URL "http://public_search":

```sql
SELECT UserID, count(UserID) AS Count
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

Результат: <a name="query-on-url-slow"></a>

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


10 строк в наборе. Прошло: 0.086 сек.

# highlight-next-line

Обработано 8.81 миллиона строк,
799.69 МБ (102.11 миллиона строк/с, 9.27 ГБ/с.)

```

Вывод клиента показывает, что ClickHouse практически выполнил полное сканирование таблицы, несмотря на то, что [столбец URL является частью составного первичного ключа](#a-table-with-a-primary-key)! ClickHouse считал 8,81 млн строк из 8,87 млн строк таблицы.
```


Если включен параметр [trace_logging](/operations/server-configuration-parameters/settings#logger), то в лог-файле сервера ClickHouse видно, что ClickHouse использовал <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">общий поиск с исключением</a> по 1083 индексным меткам URL для определения гранул, которые потенциально могут содержать строки со значением столбца URL "http://public_search":

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

Из приведенного выше примера журнала трассировки видно, что 1076 гранул (через метки) из 1083 были выбраны как потенциально содержащие строки с соответствующим значением URL.

В результате в движок ClickHouse передается 8,81 миллиона строк (параллельно с использованием 10 потоков) для определения строк, которые действительно содержат значение URL "http://public_search".

Однако, как мы увидим позже, только 39 гранул из этих выбранных 1076 гранул действительно содержат соответствующие строки.

Хотя первичный индекс на основе составного первичного ключа (UserID, URL) был очень полезен для ускорения запросов с фильтрацией строк по конкретному значению UserID, он не обеспечивает существенного ускорения запроса, который фильтрует строки по конкретному значению URL.

Причина этого заключается в том, что столбец URL не является первым ключевым столбцом, и поэтому ClickHouse использует алгоритм общего поиска с исключением (вместо бинарного поиска) по индексным меткам столбца URL, и **эффективность этого алгоритма зависит от разницы в кардинальности** между столбцом URL и предшествующим ему ключевым столбцом UserID.

Чтобы проиллюстрировать это, приведем некоторые детали о том, как работает общий поиск с исключением.

<a name='generic-exclusion-search-algorithm'></a>

### Алгоритм общего поиска с исключением {#generic-exclusion-search-algorithm}

Ниже показано, как работает <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank" >алгоритм общего поиска с исключением ClickHouse</a>, когда гранулы выбираются по вторичному столбцу, где предшествующий ключевой столбец имеет низкую или высокую кардинальность.

В качестве примера для обоих случаев предположим:

- запрос, который ищет строки со значением URL = "W3".
- абстрактную версию нашей таблицы hits с упрощенными значениями для UserID и URL.
- тот же составной первичный ключ (UserID, URL) для индекса. Это означает, что строки сначала упорядочиваются по значениям UserID. Строки с одинаковым значением UserID затем упорядочиваются по URL.
- размер гранулы равен двум, т.е. каждая гранула содержит две строки.

На диаграммах ниже мы отметили оранжевым цветом значения ключевых столбцов для первых строк таблицы каждой гранулы.

**Предшествующий ключевой столбец имеет низкую кардинальность**<a name="generic-exclusion-search-fast"></a>

Предположим, что UserID имеет низкую кардинальность. В этом случае вероятно, что одно и то же значение UserID распределено по нескольким строкам таблицы и гранулам, а следовательно, и по индексным меткам. Для индексных меток с одинаковым UserID значения URL отсортированы в порядке возрастания (поскольку строки таблицы упорядочены сначала по UserID, а затем по URL). Это позволяет эффективно выполнять фильтрацию, как описано ниже:

<Image
  img={sparsePrimaryIndexes07}
  size='md'
  alt='Sparse Primary Indices 06'
  background='white'
/>

Существует три различных сценария процесса выбора гранул для наших абстрактных примерных данных на диаграмме выше:

1.  Индексная метка 0, для которой **значение URL меньше W3 и для которой значение URL непосредственно следующей индексной метки также меньше W3**, может быть исключена, поскольку метки 0 и 1 имеют одинаковое значение UserID. Обратите внимание, что это условие исключения гарантирует, что гранула 0 полностью состоит из значений UserID U1, так что ClickHouse может предположить, что максимальное значение URL в грануле 0 также меньше W3, и исключить эту гранулу.


2. Выбирается индексная метка 1, для которой **значение URL меньше (или равно) W3, и для которой значение URL непосредственно следующей индексной метки больше (или равно) W3**, поскольку это означает, что гранула 1 может содержать строки со значением URL W3.

3. Индексные метки 2 и 3, для которых **значение URL больше W3**, могут быть исключены, поскольку индексные метки первичного индекса хранят значения ключевых столбцов для первой строки таблицы каждой гранулы, а строки таблицы отсортированы на диске по значениям ключевых столбцов, следовательно, гранулы 2 и 3 не могут содержать значение URL W3.

**Предшествующий ключевой столбец имеет высокую кардинальность**<a name="generic-exclusion-search-slow"></a>

Когда UserID имеет высокую кардинальность, маловероятно, что одно и то же значение UserID распределено по нескольким строкам таблицы и гранулам. Это означает, что значения URL для индексных меток не возрастают монотонно:

<Image
  img={sparsePrimaryIndexes08}
  size='md'
  alt='Разреженные первичные индексы 06'
  background='white'
/>

Как видно на диаграмме выше, все показанные метки, значения URL которых меньше W3, выбираются для потоковой передачи строк связанных с ними гранул в движок ClickHouse.

Это происходит потому, что хотя все индексные метки на диаграмме попадают в описанный выше сценарий 1, они не удовлетворяют упомянутому условию исключения, что _непосредственно следующая индексная метка имеет то же значение UserID, что и текущая метка_, и поэтому не могут быть исключены.

Например, рассмотрим индексную метку 0, для которой **значение URL меньше W3, и для которой значение URL непосредственно следующей индексной метки также меньше W3**. Она _не может_ быть исключена, поскольку непосредственно следующая индексная метка 1 _не имеет_ того же значения UserID, что и текущая метка 0.

В конечном итоге это не позволяет ClickHouse делать предположения о максимальном значении URL в грануле 0. Вместо этого он должен предполагать, что гранула 0 потенциально содержит строки со значением URL W3, и вынужден выбрать метку 0.

Тот же сценарий справедлив для меток 1, 2 и 3.

:::note Заключение
<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">Алгоритм общего поиска с исключением</a>, который ClickHouse использует вместо <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">алгоритма бинарного поиска</a>, когда запрос фильтрует по столбцу, который является частью составного ключа, но не является первым ключевым столбцом, наиболее эффективен, когда предшествующий ключевой столбец имеет низкую кардинальность.
:::

В нашем примере набора данных оба ключевых столбца (UserID, URL) имеют схожую высокую кардинальность, и, как объяснялось, алгоритм общего поиска с исключением не очень эффективен, когда предшествующий ключевой столбец для столбца URL имеет высокую или схожую кардинальность.

### Примечание об индексе пропуска данных {#note-about-data-skipping-index}

Из-за схожей высокой кардинальности UserID и URL наш [запрос с фильтрацией по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) также не получит значительной выгоды от создания [вторичного индекса пропуска данных](./skipping-indexes.md) для столбца URL
в нашей [таблице с составным первичным ключом (UserID, URL)](#a-table-with-a-primary-key).

Например, эти два оператора создают и заполняют индекс пропуска данных [minmax](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) для столбца URL нашей таблицы:

```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```

ClickHouse теперь создал дополнительный индекс, который хранит — для каждой группы из 4 последовательных [гранул](#data-is-organized-into-granules-for-parallel-data-processing) (обратите внимание на условие `GRANULARITY 4` в операторе `ALTER TABLE` выше) — минимальное и максимальное значение URL:

<Image
  img={sparsePrimaryIndexes13a}
  size='md'
  alt='Разреженные первичные индексы 13a'
  background='white'
/>

Первая запись индекса ('метка 0' на диаграмме выше) хранит минимальное и максимальное значения URL для [строк, принадлежащих первым 4 гранулам нашей таблицы](#data-is-organized-into-granules-for-parallel-data-processing).


Вторая запись индекса ('mark 1') хранит минимальное и максимальное значения URL для строк, относящихся к следующим 4 гранулам нашей таблицы, и так далее.

(ClickHouse также создал специальный [файл меток](#mark-files-are-used-for-locating-granules) для индекса пропуска данных, предназначенный для [определения местоположения](#mark-files-are-used-for-locating-granules) групп гранул, связанных с метками индекса.)

Из-за аналогично высокой кардинальности UserID и URL этот вторичный индекс пропуска данных не может помочь в исключении гранул из выборки при выполнении нашего [запроса с фильтрацией по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient).

Конкретное значение URL, которое ищет запрос (т. е. 'http://public_search'), с большой вероятностью находится между минимальным и максимальным значением, хранящимся в индексе для каждой группы гранул, что вынуждает ClickHouse выбирать группу гранул (поскольку они могут содержать строки, соответствующие запросу).

### Необходимость использования нескольких первичных индексов {#a-need-to-use-multiple-primary-indexes}

Как следствие, если мы хотим значительно ускорить наш примерный запрос, фильтрующий строки с конкретным URL, нам необходимо использовать первичный индекс, оптимизированный для этого запроса.

Если, кроме того, мы хотим сохранить высокую производительность нашего примерного запроса, фильтрующего строки с конкретным UserID, нам необходимо использовать несколько первичных индексов.

Ниже показаны способы достижения этой цели.

<a name='multiple-primary-indexes'></a>

### Варианты создания дополнительных первичных индексов {#options-for-creating-additional-primary-indexes}

Если мы хотим значительно ускорить оба наших примерных запроса — тот, который фильтрует строки с конкретным UserID, и тот, который фильтрует строки с конкретным URL — нам необходимо использовать несколько первичных индексов, применив один из следующих трёх вариантов:

- Создание **второй таблицы** с другим первичным ключом.
- Создание **материализованного представления** на основе существующей таблицы.
- Добавление **проекции** к существующей таблице.

Все три варианта фактически дублируют наши примерные данные в дополнительную таблицу для реорганизации первичного индекса таблицы и порядка сортировки строк.

Однако эти три варианта различаются степенью прозрачности дополнительной таблицы для пользователя в отношении маршрутизации запросов и операторов вставки.

При создании **второй таблицы** с другим первичным ключом запросы должны явно направляться в версию таблицы, наиболее подходящую для запроса, а новые данные должны явно вставляться в обе таблицы для поддержания их синхронизации:

<Image
  img={sparsePrimaryIndexes09a}
  size='md'
  alt='Sparse Primary Indices 09a'
  background='white'
/>

При использовании **материализованного представления** дополнительная таблица создаётся неявно, и данные автоматически синхронизируются между обеими таблицами:

<Image
  img={sparsePrimaryIndexes09b}
  size='md'
  alt='Sparse Primary Indices 09b'
  background='white'
/>

**Проекция** является наиболее прозрачным вариантом, поскольку помимо автоматической синхронизации неявно созданной (и скрытой) дополнительной таблицы с изменениями данных ClickHouse автоматически выбирает наиболее эффективную версию таблицы для запросов:

<Image
  img={sparsePrimaryIndexes09c}
  size='md'
  alt='Sparse Primary Indices 09c'
  background='white'
/>

Далее мы более подробно рассмотрим эти три варианта создания и использования нескольких первичных индексов на реальных примерах.

<a name='multiple-primary-indexes-via-secondary-tables'></a>

### Вариант 1: Вторичные таблицы {#option-1-secondary-tables}

<a name='secondary-table'></a>
Мы создаём новую дополнительную таблицу, в которой меняем порядок ключевых
столбцов (по сравнению с исходной таблицей) в первичном ключе:

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

Вставляем все 8,87 миллиона строк из нашей [исходной таблицы](#a-table-with-a-primary-key) в дополнительную таблицу:

```sql
INSERT INTO hits_URL_UserID
SELECT * FROM hits_UserID_URL;
```

Ответ выглядит следующим образом:

```response
Ok.

0 rows in set. Elapsed: 2.898 sec. Processed 8.87 million rows, 838.84 MB (3.06 million rows/s., 289.46 MB/s.)
```

И наконец оптимизируем таблицу:

```sql
OPTIMIZE TABLE hits_URL_UserID FINAL;
```


Поскольку мы изменили порядок столбцов в первичном ключе, вставленные строки теперь хранятся на диске в другом лексикографическом порядке (по сравнению с нашей [исходной таблицей](#a-table-with-a-primary-key)), и поэтому 1083 гранулы этой таблицы содержат иные значения, чем ранее:

<Image img={sparsePrimaryIndexes10} size="md" alt="Sparse Primary Indices 10" background="white" />

Это получившийся первичный ключ:

<Image img={sparsePrimaryIndexes11} size="md" alt="Sparse Primary Indices 11" background="white" />

Теперь его можно использовать для значительного ускорения выполнения нашего примера запроса с фильтрацией по столбцу URL, чтобы вычислить топ-10 пользователей, которые чаще всего переходили по URL &quot;[http://public&#95;search](http://public\&#95;search)&quot;:

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


10 строк в наборе. Затрачено: 0,017 сек.

# highlight-next-line

Обработано 319,49 тыс. строк,
11,38 МБ (18,41 млн строк/с, 655,75 МБ/с.)

```

Теперь, вместо [практически полного сканирования таблицы](/guides/best-practices/sparse-primary-indexes#efficient-filtering-on-secondary-key-columns), ClickHouse выполнил этот запрос значительно эффективнее.

При использовании первичного индекса из [исходной таблицы](#a-table-with-a-primary-key), где UserID был первым ключевым столбцом, а URL — вторым, ClickHouse применял [общий алгоритм поиска с исключением](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) по меткам индекса для выполнения этого запроса, что оказалось недостаточно эффективным из-за одинаково высокой кардинальности столбцов UserID и URL.
```


Поскольку URL является первым столбцом первичного индекса, ClickHouse теперь выполняет <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">бинарный поиск</a> по индексным меткам.
Соответствующая запись трассировки в лог-файле сервера ClickHouse подтверждает это:

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

ClickHouse выбрал только 39 индексных меток вместо 1076 при использовании общего поиска с исключением.

Обратите внимание, что дополнительная таблица оптимизирована для ускорения выполнения нашего примера запроса с фильтрацией по URL-адресам.

Аналогично [низкой производительности](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) этого запроса с нашей [исходной таблицей](#a-table-with-a-primary-key), наш [пример запроса с фильтрацией по `UserIDs`](#the-primary-index-is-used-for-selecting-granules) не будет выполняться достаточно эффективно с новой дополнительной таблицей, поскольку UserID теперь является вторым ключевым столбцом первичного индекса этой таблицы, и поэтому ClickHouse будет использовать общий поиск с исключением для выбора гранул, что [недостаточно эффективно при аналогично высокой кардинальности](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) UserID и URL.
Откройте блок с подробностями для получения дополнительной информации.

<details>
    <summary>
    Запрос с фильтрацией по UserID теперь имеет низкую производительность<a name="query-on-userid-slow"></a>
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

Обработано 8.02 млн строк,
73.04 MB (340.26 млн строк/с., 3.10 GB/с.)

```
```


Лог сервера:

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

Теперь у нас есть две таблицы, оптимизированные для ускорения запросов с фильтрацией по `UserIDs` и по URLs соответственно:

### Вариант 2: Материализованные представления {#option-2-materialized-views}

Создайте [материализованное представление](/sql-reference/statements/create/view.md) на основе существующей таблицы.

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

- мы меняем порядок ключевых столбцов (по сравнению с нашей [исходной таблицей](#a-table-with-a-primary-key)) в первичном ключе представления
- материализованное представление поддерживается **неявно созданной таблицей**, порядок строк и первичный индекс которой основаны на заданном определении первичного ключа
- неявно созданная таблица отображается в запросе `SHOW TABLES` и имеет имя, начинающееся с `.inner`
- также возможно сначала явно создать поддерживающую таблицу для материализованного представления, а затем представление может ссылаться на эту таблицу через [конструкцию](/sql-reference/statements/create/view.md) `TO [db].[table]`
- мы используем ключевое слово `POPULATE` для немедленного заполнения неявно созданной таблицы всеми 8.87 миллионами строк из исходной таблицы [hits_UserID_URL](#a-table-with-a-primary-key)
- если новые строки вставляются в исходную таблицу hits_UserID_URL, то эти строки автоматически также вставляются в неявно созданную таблицу
- Фактически неявно созданная таблица имеет тот же порядок строк и первичный индекс, что и [вторичная таблица, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables):

<Image
  img={sparsePrimaryIndexes12b1}
  size='md'
  alt='Sparse Primary Indices 12b1'
  background='white'
/>

ClickHouse хранит [файлы данных столбцов](#data-is-stored-on-disk-ordered-by-primary-key-columns) (_.bin), [файлы меток](#mark-files-are-used-for-locating-granules) (_.mrk2) и [первичный индекс](#the-primary-index-has-one-entry-per-granule) (primary.idx) неявно созданной таблицы в специальной папке внутри каталога данных сервера ClickHouse:

<Image
  img={sparsePrimaryIndexes12b2}
  size='md'
  alt='Sparse Primary Indices 12b2'
  background='white'
/>

:::

Неявно созданная таблица (и её первичный индекс), поддерживающая материализованное представление, теперь может использоваться для значительного ускорения выполнения нашего примера запроса с фильтрацией по столбцу URL:

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


10 строк в наборе. Прошло: 0.026 сек.

# highlight-next-line

Обработано 335.87 тыс. строк,
13.54 MB (12.91 миллиона строк/с., 520.38 МБ/с.)

```

Поскольку неявно созданная таблица (и её первичный индекс), лежащая в основе материализованного представления, идентична [вторичной таблице, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables), запрос выполняется так же эффективно, как и с явно созданной таблицей.

Соответствующий журнал трассировки в лог-файле сервера ClickHouse подтверждает, что ClickHouse выполняет бинарный поиск по меткам индекса:
```


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

Создайте проекцию для существующей таблицы:

```sql
ALTER TABLE hits_UserID_URL
    ADD PROJECTION prj_url_userid
    (
        SELECT *
        ORDER BY (URL, UserID)
    );
```

Материализуйте проекцию:

```sql
ALTER TABLE hits_UserID_URL
    MATERIALIZE PROJECTION prj_url_userid;
```

:::note

- проекция создает **скрытую таблицу**, порядок строк и первичный индекс которой основаны на указанной конструкции `ORDER BY` проекции
- скрытая таблица не отображается в результатах запроса `SHOW TABLES`
- мы используем ключевое слово `MATERIALIZE` для немедленного заполнения скрытой таблицы всеми 8,87 миллионами строк из исходной таблицы [hits_UserID_URL](#a-table-with-a-primary-key)
- если в исходную таблицу hits_UserID_URL вставляются новые строки, то эти строки автоматически также вставляются в скрытую таблицу
- запрос всегда (синтаксически) направлен на исходную таблицу hits_UserID_URL, но если порядок строк и первичный индекс скрытой таблицы позволяют более эффективное выполнение запроса, то будет использована скрытая таблица
- обратите внимание, что проекции не делают запросы с использованием ORDER BY более эффективными, даже если ORDER BY совпадает с конструкцией ORDER BY проекции (см. https://github.com/ClickHouse/ClickHouse/issues/47333)
- Фактически неявно созданная скрытая таблица имеет тот же порядок строк и первичный индекс, что и [вторичная таблица, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables):

<Image
  img={sparsePrimaryIndexes12c1}
  size='md'
  alt='Sparse Primary Indices 12c1'
  background='white'
/>

ClickHouse хранит [файлы данных столбцов](#data-is-stored-on-disk-ordered-by-primary-key-columns) (_.bin), [файлы меток](#mark-files-are-used-for-locating-granules) (_.mrk2) и [первичный индекс](#the-primary-index-has-one-entry-per-granule) (primary.idx) скрытой таблицы в специальной папке (отмечена оранжевым на скриншоте ниже) рядом с файлами данных, файлами меток и файлами первичного индекса исходной таблицы:

<Image
  img={sparsePrimaryIndexes12c2}
  size='sm'
  alt='Sparse Primary Indices 12c2'
  background='white'
/>

:::

Скрытая таблица (и ее первичный индекс), созданная проекцией, теперь может быть (неявно) использована для значительного ускорения выполнения нашего примера запроса с фильтрацией по столбцу URL. Обратите внимание, что запрос синтаксически направлен на исходную таблицу проекции.

```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM hits_UserID_URL
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

```


10 строк в наборе. Прошло: 0.029 сек.

# highlight-next-line

Обработано 319.49 тысяч строк, 1
1.38 МБ (11.05 миллионов строк/с, 393.58 МБ/с.)

```

Поскольку скрытая таблица (и её первичный индекс), создаваемая проекцией, идентична [вторичной таблице, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables), запрос выполняется так же эффективно, как и при использовании явно созданной таблицы.

Соответствующая запись трассировки в лог-файле сервера ClickHouse подтверждает, что ClickHouse выполняет бинарный поиск по индексным меткам:
```


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

Первичный индекс нашей [таблицы с составным первичным ключом (UserID, URL)](#a-table-with-a-primary-key) оказался очень полезен для ускорения [запроса с фильтрацией по UserID](#the-primary-index-is-used-for-selecting-granules). Однако этот индекс не обеспечивает существенного ускорения [запроса с фильтрацией по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient), несмотря на то что столбец URL является частью составного первичного ключа.

И наоборот:
Первичный индекс нашей [таблицы с составным первичным ключом (URL, UserID)](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) ускорял [запрос с фильтрацией по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient), но не обеспечивал значительного ускорения для [запроса с фильтрацией по UserID](#the-primary-index-is-used-for-selecting-granules).

Из-за схожей высокой кардинальности столбцов первичного ключа UserID и URL запрос с фильтрацией по второму ключевому столбцу [не получает значительного преимущества от присутствия второго ключевого столбца в индексе](#generic-exclusion-search-algorithm).

Поэтому имеет смысл удалить второй ключевой столбец из первичного индекса (что приведёт к меньшему потреблению памяти индексом) и вместо этого [использовать несколько первичных индексов](/guides/best-practices/sparse-primary-indexes#using-multiple-primary-indexes).

Однако если ключевые столбцы в составном первичном ключе имеют большие различия в кардинальности, то [для запросов выгодно](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) упорядочивать столбцы первичного ключа по возрастанию кардинальности.

Чем больше разница в кардинальности между ключевыми столбцами, тем важнее порядок этих столбцов в ключе. Мы продемонстрируем это в следующем разделе.


## Эффективное упорядочивание столбцов ключа {#ordering-key-columns-efficiently}

<a name='test'></a>

В составном первичном ключе порядок столбцов ключа может существенно влиять на:

- эффективность фильтрации по вторичным столбцам ключа в запросах, и
- коэффициент сжатия файлов данных таблицы.

Для демонстрации этого мы будем использовать версию нашего [набора данных веб-трафика](#data-set),
где каждая строка содержит три столбца, которые указывают, был ли доступ интернет-пользователя (столбец `UserID`) к URL (столбец `URL`) помечен как трафик бота (столбец `IsRobot`).

Мы будем использовать составной первичный ключ, содержащий все три вышеупомянутых столбца, который может быть использован для ускорения типичных запросов веб-аналитики, вычисляющих

- какой процент трафика к определенному URL исходит от ботов или
- насколько мы уверены, что конкретный пользователь является (или не является) ботом (какой процент трафика от этого пользователя считается (или не считается) трафиком бота)

Мы используем этот запрос для вычисления кардинальностей трех столбцов, которые мы хотим использовать в качестве столбцов ключа в составном первичном ключе (обратите внимание, что мы используем [табличную функцию URL](/sql-reference/table-functions/url.md) для выполнения ad hoc запросов к TSV данным без необходимости создания локальной таблицы). Выполните этот запрос в `clickhouse client`:

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

Результат:

```response
┌─cardinality_URL─┬─cardinality_UserID─┬─cardinality_IsRobot─┐
│ 2.39 million    │ 119.08 thousand    │ 4.00                │
└─────────────────┴────────────────────┴─────────────────────┘

1 row in set. Elapsed: 118.334 sec. Processed 8.87 million rows, 15.88 GB (74.99 thousand rows/s., 134.21 MB/s.)
```

Мы видим, что существует большая разница между кардинальностями, особенно между столбцами `URL` и `IsRobot`, и поэтому порядок этих столбцов в составном первичном ключе имеет значение как для эффективного ускорения запросов с фильтрацией по этим столбцам, так и для достижения оптимальных коэффициентов сжатия файлов данных столбцов таблицы.

Для демонстрации этого мы создаем две версии таблицы для наших данных анализа трафика ботов:

- таблицу `hits_URL_UserID_IsRobot` с составным первичным ключом `(URL, UserID, IsRobot)`, где мы упорядочиваем столбцы ключа по кардинальности в порядке убывания
- таблицу `hits_IsRobot_UserID_URL` с составным первичным ключом `(IsRobot, UserID, URL)`, где мы упорядочиваем столбцы ключа по кардинальности в порядке возрастания

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

Результат:

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

### Эффективная фильтрация по вторичным столбцам ключа {#efficient-filtering-on-secondary-key-columns}

Когда запрос выполняет фильтрацию хотя бы по одному столбцу, который является частью составного ключа и при этом является первым столбцом ключа, [ClickHouse применяет алгоритм бинарного поиска по индексным меткам этого столбца](#the-primary-index-is-used-for-selecting-granules).

Когда запрос выполняет фильтрацию (только) по столбцу, который является частью составного ключа, но не является первым столбцом ключа, [ClickHouse использует общий алгоритм поиска с исключениями по индексным меткам этого столбца](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient).

Во втором случае порядок следования столбцов ключа в составном первичном ключе существенно влияет на эффективность [общего алгоритма поиска с исключениями](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444).

Ниже приведен запрос с фильтрацией по столбцу `UserID` таблицы, в которой столбцы ключа `(URL, UserID, IsRobot)` упорядочены по кардинальности в порядке убывания:

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


1 строка в наборе. Время: 0.026 сек.

# highlight-next-line

Обработано 7.92 миллиона строк,
31.67 MB (306.90 миллиона строк/с., 1.23 GB/с.)

````

Это тот же запрос к таблице, в которой мы упорядочили ключевые столбцы `(IsRobot, UserID, URL)` по кардинальности в порядке возрастания:
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


1 строка в наборе. Прошло: 0.003 с.

# highlight-next-line

Обработано 20.32 тысячи строк,
81.28 KB (6.61 миллиона строк/с., 26.44 MB/с.)

````

Мы видим, что выполнение запроса значительно эффективнее и быстрее на таблице, где ключевые столбцы упорядочены по кардинальности в порядке возрастания.

Причина этого в том, что [алгоритм обобщённого поиска с исключением](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444) работает наиболее эффективно, когда [гранулы](#the-primary-index-is-used-for-selecting-granules) выбираются по вторичному ключевому столбцу, где предшествующий ключевой столбец имеет более низкую кардинальность. Мы подробно рассмотрели это в [предыдущем разделе](#generic-exclusion-search-algorithm) данного руководства.

### Оптимальная степень сжатия файлов данных {#optimal-compression-ratio-of-data-files}

Этот запрос сравнивает степень сжатия столбца `UserID` между двумя созданными выше таблицами:

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
┌─Table───────────────────┬─Column─┬─Uncompressed─┬─Compressed─┬─Ratio─┐
│ hits_URL_UserID_IsRobot │ UserID │ 33.83 МиБ    │ 11.24 МиБ  │     3 │
│ hits_IsRobot_UserID_URL │ UserID │ 33.83 МиБ    │ 877.47 КиБ │    39 │
└─────────────────────────┴────────┴──────────────┴────────────┴───────┘

2 rows in set. Elapsed: 0.006 sec.
```

Мы видим, что коэффициент сжатия для столбца `UserID` значительно выше для таблицы, в которой мы упорядочили столбцы ключа `(IsRobot, UserID, URL)` по возрастанию кардинальности.

Хотя в обеих таблицах хранятся одни и те же данные (мы вставили одинаковые 8,87 миллиона строк в обе таблицы), порядок столбцов ключа в составном первичном ключе существенно влияет на то, сколько дискового пространства требуется для <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">сжатых</a> данных в [файлах данных столбцов](#data-is-stored-on-disk-ordered-by-primary-key-columns) таблицы:

* в таблице `hits_URL_UserID_IsRobot` с составным первичным ключом `(URL, UserID, IsRobot)`, где мы упорядочиваем столбцы ключа по убыванию кардинальности, файл данных `UserID.bin` занимает **11.24 MiB** дискового пространства;
* в таблице `hits_IsRobot_UserID_URL` с составным первичным ключом `(IsRobot, UserID, URL)`, где мы упорядочиваем столбцы ключа по возрастанию кардинальности, файл данных `UserID.bin` занимает всего **877.47 KiB** дискового пространства.

Хороший коэффициент сжатия данных столбца на диске не только экономит место, но и ускоряет запросы (особенно аналитические), которым требуется чтение данных из этого столбца, поскольку требуется меньше операций ввода-вывода для перемещения данных столбца с диска в основную память (файловый кэш операционной системы).

Далее мы покажем, почему для улучшения коэффициента сжатия столбцов таблицы полезно упорядочивать столбцы первичного ключа по возрастанию кардинальности.

Диаграмма ниже схематично показывает порядок строк на диске для первичного ключа, в котором столбцы ключа упорядочены по возрастанию кардинальности:

<Image img={sparsePrimaryIndexes14a} size="md" alt="Разреженные первичные индексы 14a" background="white" />

Ранее мы обсудили, что [данные строк таблицы хранятся на диске в порядке столбцов первичного ключа](#data-is-stored-on-disk-ordered-by-primary-key-columns).


На диаграмме выше строки таблицы (значения их столбцов на диске) сначала упорядочиваются по значению `cl`, а строки с одинаковым значением `cl` упорядочиваются по значению `ch`. Поскольку первый ключевой столбец `cl` имеет низкую кардинальность, вероятно наличие строк с одинаковым значением `cl`. Вследствие этого также вероятно, что значения `ch` упорядочены (локально — для строк с одинаковым значением `cl`).

Если в столбце похожие данные расположены близко друг к другу, например, за счёт сортировки, то такие данные будут сжаты лучше.
В целом алгоритм сжатия выигрывает от длины последовательности данных (чем больше данных он обрабатывает, тем лучше сжатие)
и локальности (чем более похожи данные, тем выше степень сжатия).

В отличие от диаграммы выше, диаграмма ниже иллюстрирует порядок строк на диске для первичного ключа, где ключевые столбцы упорядочены по кардинальности в порядке убывания:

<Image
  img={sparsePrimaryIndexes14b}
  size='md'
  alt='Разреженные первичные индексы 14b'
  background='white'
/>

Теперь строки таблицы сначала упорядочиваются по значению `ch`, а строки с одинаковым значением `ch` упорядочиваются по значению `cl`.
Но поскольку первый ключевой столбец `ch` имеет высокую кардинальность, маловероятно наличие строк с одинаковым значением `ch`. Вследствие этого также маловероятно, что значения `cl` упорядочены (локально — для строк с одинаковым значением `ch`).

Следовательно, значения `cl` скорее всего находятся в случайном порядке и, соответственно, имеют плохую локальность и степень сжатия.

### Резюме {#summary-1}

Как для эффективной фильтрации по вторичным ключевым столбцам в запросах, так и для степени сжатия файлов данных столбцов таблицы полезно упорядочивать столбцы в первичном ключе по их кардинальности в порядке возрастания.


## Эффективная идентификация отдельных строк {#identifying-single-rows-efficiently}

Хотя в целом это [не](/knowledgebase/key-value) лучший вариант использования ClickHouse,
иногда приложениям, построенным на основе ClickHouse, необходимо идентифицировать отдельные строки таблицы ClickHouse.

Интуитивным решением может быть использование столбца [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) с уникальным значением для каждой строки и использование этого столбца в качестве столбца первичного ключа для быстрого извлечения строк.

Для максимально быстрого извлечения столбец UUID [должен быть первым ключевым столбцом](#the-primary-index-is-used-for-selecting-granules).

Мы обсуждали, что поскольку [данные строк таблицы ClickHouse хранятся на диске упорядоченными по столбцам первичного ключа](#data-is-stored-on-disk-ordered-by-primary-key-columns), наличие столбца с очень высокой кардинальностью (например, столбца UUID) в первичном ключе или в составном первичном ключе перед столбцами с более низкой кардинальностью [негативно влияет на степень сжатия других столбцов таблицы](#optimal-compression-ratio-of-data-files).

Компромиссом между максимально быстрым извлечением и оптимальным сжатием данных является использование составного первичного ключа, где UUID является последним ключевым столбцом, после ключевых столбцов с низкой кардинальностью, которые используются для обеспечения хорошей степени сжатия некоторых столбцов таблицы.

### Конкретный пример {#a-concrete-example}

Одним конкретным примером является сервис вставки текста [https://pastila.nl](https://pastila.nl), который разработал Алексей Миловидов и [описал в блоге](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/).

При каждом изменении текстовой области данные автоматически сохраняются в строку таблицы ClickHouse (одна строка на каждое изменение).

Одним из способов идентификации и извлечения (конкретной версии) вставленного содержимого является использование хеша содержимого в качестве UUID для строки таблицы, содержащей это содержимое.

На следующей диаграмме показаны

- порядок вставки строк при изменении содержимого (например, при вводе текста в текстовую область) и
- порядок данных на диске из вставленных строк при использовании `PRIMARY KEY (hash)`:

<Image
  img={sparsePrimaryIndexes15a}
  size='md'
  alt='Sparse Primary Indices 15a'
  background='white'
/>

Поскольку столбец `hash` используется в качестве столбца первичного ключа

- конкретные строки могут быть извлечены [очень быстро](#the-primary-index-is-used-for-selecting-granules), но
- строки таблицы (данные их столбцов) хранятся на диске упорядоченными по возрастанию (уникальных и случайных) значений хеша. Следовательно, значения столбца содержимого также хранятся в случайном порядке без локальности данных, что приводит к **неоптимальной степени сжатия файла данных столбца содержимого**.

Чтобы значительно улучшить степень сжатия для столбца содержимого, сохраняя при этом быстрое извлечение конкретных строк, pastila.nl использует два хеша (и составной первичный ключ) для идентификации конкретной строки:

- хеш содержимого, как обсуждалось выше, который различается для различных данных, и
- [локально-чувствительный хеш (отпечаток)](https://en.wikipedia.org/wiki/Locality-sensitive_hashing), который **не** изменяется при небольших изменениях данных.

На следующей диаграмме показаны

- порядок вставки строк при изменении содержимого (например, при вводе текста в текстовую область) и
- порядок данных на диске из вставленных строк при использовании составного `PRIMARY KEY (fingerprint, hash)`:

<Image
  img={sparsePrimaryIndexes15b}
  size='md'
  alt='Sparse Primary Indices 15b'
  background='white'
/>

Теперь строки на диске сначала упорядочены по `fingerprint`, а для строк с одинаковым значением отпечатка их значение `hash` определяет окончательный порядок.

Поскольку данные, различающиеся только небольшими изменениями, получают одинаковое значение отпечатка, похожие данные теперь хранятся на диске близко друг к другу в столбце содержимого. Это очень хорошо для степени сжатия столбца содержимого, поскольку алгоритм сжатия в целом выигрывает от локальности данных (чем более похожи данные, тем выше степень сжатия).

Компромисс заключается в том, что для извлечения конкретной строки требуются два поля (`fingerprint` и `hash`), чтобы оптимально использовать первичный индекс, полученный из составного `PRIMARY KEY (fingerprint, hash)`.
