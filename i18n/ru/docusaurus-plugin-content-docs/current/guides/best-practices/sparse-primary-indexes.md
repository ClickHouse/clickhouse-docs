---
sidebar_label: 'Первичные индексы'
sidebar_position: 1
description: 'В этом руководстве мы углубимся в индексацию ClickHouse.'
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

В этом руководстве мы углубимся в индексацию ClickHouse. Мы детально проиллюстрируем и обсудим:
- [как индексация в ClickHouse отличается от традиционных систем управления реляционными базами данных](#an-index-design-for-massive-data-scales)
- [как ClickHouse строит и использует разреженный первичный индекс таблицы](#a-table-with-a-primary-key)
- [какие лучшие практики существуют для индексации в ClickHouse](#using-multiple-primary-indexes)

Вы можете по желанию выполнять все SQL-запросы ClickHouse, приведенные в этом руководстве, у себя на машине. 
Для установки ClickHouse и инструкций по началу работы смотрите [Быстрый старт](/quick-start.mdx).

:::note
Это руководство сосредоточено на разреженных первичных индексах ClickHouse.

Для [вторичных индексов пропуска данных ClickHouse](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes) смотрите [Учебник](/guides/best-practices/skipping-indexes.md).
:::
### Набор данных {#data-set}

На протяжении этого руководства мы будем использовать анонимизированный набор данных о веб-трафике.

- Мы используем подмножество из 8,87 миллиона строк (событий) из выборки данных.
- Нерасжатый размер данных составляет 8,87 миллиона событий и около 700 МБ. Это сжимается до 200 МБ при хранении в ClickHouse.
- В нашем подмножестве каждая строка содержит три колонки, которые указывают на интернет-пользователя (колонка `UserID`), который кликнул по URL (колонка `URL`) в определенное время (колонка `EventTime`).

С этими тремя колонками мы уже можем сформулировать некоторые типичные запросы веб-аналитики, такие как:

- "Какие 10 URL были наиболее кликнутыми для конкретного пользователя?"
- "Кто из 10 пользователей наиболее часто кликал по конкретному URL?"
- "В какое время (например, в какие дни недели) пользователь чаще всего кликает по конкретному URL?"
### Тестовая машина {#test-machine}

Все числовые данные выполнения, приведенные в этом документе, основаны на работе ClickHouse 22.2.1 локально на MacBook Pro с чипом Apple M1 Pro и 16 ГБ ОЗУ.
### Полное сканирование таблицы {#a-full-table-scan}

Чтобы увидеть, как выполняется запрос по нашему набору данных без первичного ключа, создадим таблицу (с движком таблицы MergeTree), выполнив следующий SQL DDL-запрос:

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



Далее вставим подмножество данных в таблицу с помощью следующего SQL-запроса на вставку. Для этого используется [табличная функция URL](/sql-reference/table-functions/url.md), чтобы загрузить подмножество полного набора данных, размещенного удаленно по адресу clickhouse.com:

```sql
INSERT INTO hits_NoPrimaryKey SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```
Ответ будет:
```response
Ok.

0 rows in set. Elapsed: 145.993 sec. Processed 8.87 million rows, 18.40 GB (60.78 thousand rows/s., 126.06 MB/s.)
```


Вывод результата клиента ClickHouse показывает, что вышеуказанный запрос вставил 8,87 миллиона строк в таблицу.


Наконец, чтобы упростить последующие обсуждения в этом руководстве и сделать диаграммы и результаты воспроизводимыми, мы [оптимизируем](/sql-reference/statements/optimize.md) таблицу с использованием ключевого слова FINAL:

```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
В общем случае не требуется и не рекомендуется немедленно оптимизировать таблицу после загрузки данных. Причины, по которым это необходимо для этого примера, станут очевидны.
:::


Теперь мы выполняем наш первый запрос веб-аналитики. Следующий запрос считает 10 наиболее кликнутых URL для интернет-пользователя с `UserID 749927693`:

```sql
SELECT URL, count(URL) as Count
FROM hits_NoPrimaryKey
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

10 rows in set. Elapsed: 0.022 sec.

# highlight-next-line
Processed 8.87 million rows,
70.45 MB (398.53 million rows/s., 3.17 GB/s.)
```

Вывод клиента ClickHouse указывает на то, что ClickHouse выполнил полное сканирование таблицы! Каждая отдельная строка из 8,87 миллиона строк нашей таблицы была передана в ClickHouse. Это не масштабируется.

Чтобы сделать это (значительно) более эффективно и (значительно) быстрее, нам необходимо использовать таблицу с соответствующим первичным ключом. Это позволит ClickHouse автоматически (на основе столбца(ов) первичного ключа) создать разреженный первичный индекс, который затем можно использовать для значительного ускорения выполнения нашего примера запроса.
### Связанный контент {#related-content}
- Блог: [Ускорение ваших запросов ClickHouse](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)
## Проектирование индекса в ClickHouse {#clickhouse-index-design}
### Проектирование индекса для массовых объемов данных {#an-index-design-for-massive-data-scales}

В традиционных системах управления реляционными базами данных первичный индекс будет содержать одну запись на каждую строку таблицы. Это приведет к тому, что первичный индекс будет содержать 8,87 миллиона записей для нашего набора данных. Такой индекс позволяет быстро находить конкретные строки, что повышает эффективность запросов на поиск и точечных обновлений. Поиск записи в структуре данных `B(+)-Tree` имеет среднюю временную сложность `O(log n)`; точнее, `log_b n = log_2 n / log_2 b`, где `b` — коэффициент ветвления `B(+)-Tree`, а `n` — количество индексированных строк. Поскольку `b` обычно составляет несколько сотен или несколько тысяч, `B(+)-Trees` являются очень мелкими структурами, и для их нахождения требуется немного операций чтения с диска. При 8,87 миллиона строк и коэффициенте ветвления 1000 в среднем требуется 2,3 чтения с диска. Эта возможность имеет свою цену: дополнительные затраты на диск и память, более высокие затраты на вставку при добавлении новых строк в таблицу и записей в индекс, а иногда и необходимость балансировки B-Tree.

Учитывая проблемы, связанные с индексами B-Tree, движки таблиц в ClickHouse используют другой подход. [Семейство движков MergeTree](/engines/table-engines/mergetree-family/index.md) ClickHouse было разработано и оптимизировано для обработки массивных объемов данных. Эти таблицы разработаны для приема миллионов вставок строк в секунду и хранения очень больших объемов данных (сотни Петабайт). Данные быстро записываются в таблицу [частями](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage), с применением правил для слияния частей в фоновом режиме. В ClickHouse каждая часть имеет свой собственный первичный индекс. Когда части объединяются, также объединяются первичные индексы объединенных частей. На очень большом масштабе, для которого разработан ClickHouse, крайне важно быть экономичным в использовании диска и памяти. Поэтому, вместо индексации каждой строки, первичный индекс для части имеет одну запись индекса (известную как "метка") на группу строк (называемую "гранулой") - эта техника называется **разреженным индексом**.

Разреженная индексация возможна, потому что ClickHouse хранит строки для части на диске, упорядоченные по столбцам(ам) первичного ключа. Вместо того, чтобы непосредственно находить отдельные строки (как в индексе на основе B-Tree), разреженный первичный индекс позволяет быстро (путем бинарного поиска по записям индекса) определить группы строк, которые могут соответствовать запросу. Найденные группы потенциально подходящих строк (гранулы) затем параллельно передаются в движок ClickHouse для нахождения совпадений. Эта конструкция индекса позволяет первичному индексу быть маленьким (он может и должен вмещаться полностью в основную память), сохраняя при этом значительное ускорение времени выполнения запросов: особенно для диапазонных запросов, что типично для случаев использования аналитики данных.

Следующее иллюстрирует, как ClickHouse строит и использует свой разреженный первичный индекс. Позже в статье мы обсудим некоторые лучшие практики выбора, удаления и упорядочивания столбцов таблицы, которые используются для построения индекса (столбцы первичного ключа).
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
    Подробности DDL-запроса
    </summary>
    <p>

Для упрощения последующих обсуждений в этом руководстве, а также для воспроизводимости диаграмм и результатов, DDL-запрос:

<ul>
  <li>
    Указывает составной ключ сортировки для таблицы через оператор <code>ORDER BY</code>.
  </li>
  <li>
    Явно контролирует, сколько записей индекса будет в первичном индексе через настройки:
    <ul>
      <li>
        <code>index_granularity</code>: явно установлен на его значение по умолчанию 8192. Это означает, что для каждой группы из 8192 строк первичный индекс будет иметь одну запись индекса. Например, если таблица содержит 16384 строки, индекс будет иметь две записи индекса.
      </li>
      <li>
        <code>index_granularity_bytes</code>: установлен на 0, чтобы отключить <a href="https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1" target="_blank">адаптивную гранулярность индекса</a>. Адаптивная гранулярность индекса означает, что ClickHouse автоматически создает одну запись индекса для группы из n строк, если истинно хотя бы одно из следующих:
        <ul>
          <li>
            Если <code>n</code> меньше 8192, и размер объединенных данных строк для этих <code>n</code> строк больше или равен 10 МБ (значение по умолчанию для <code>index_granularity_bytes</code>).
          </li>
          <li>
            Если размер объединенных данных строк для <code>n</code> строк меньше 10 МБ, но <code>n</code> равно 8192.
          </li>
        </ul>
      </li>
      <li>
        <code>compress_primary_key</code>: установлен на 0, чтобы отключить <a href="https://github.com/ClickHouse/ClickHouse/issues/34437" target="_blank">сжатие первичного индекса</a>. Это позволит нам по желанию позже проверить его содержимое.
      </li>
    </ul>
  </li>
</ul>

</p>
</details>


Первичный ключ в вышеуказанном DDL-запросе вызывает создание первичного индекса на основе двух указанных ключевых столбцов.

<br/>
Далее вставляем данные:

```sql
INSERT INTO hits_UserID_URL SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```
Ответ будет выглядеть следующим образом:
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

Ответ будет следующим:

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

- Данные таблицы хранятся в [широком формате](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) в конкретном каталоге на диске, что означает, что будет один файл данных (и один файл меток) на каждый столбец таблицы внутри этого каталога.
- Таблица содержит 8,87 миллиона строк.
- Нерасжатый размер данных всех строк вместе составляет 733,28 МБ.
- Сжатый размер всех строк на диске составляет 206,94 МБ.
- Таблица имеет первичный индекс с 1083 записями (называемыми 'метками'), и размер индекса составляет 96,93 КБ.
- В общей сложности файлы данных таблицы и файлы меток, а также файл первичного индекса занимают 207,07 МБ на диске.
### Данные хранятся на диске, упорядоченные по столбцам(ам) первичного ключа {#data-is-stored-on-disk-ordered-by-primary-key-columns}

Наша созданная выше таблица имеет
- составной [первичный ключ](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)` и
- составной [ключ сортировки](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)`.

:::note
- Если бы мы указали только ключ сортировки, то первичный ключ был бы неявно определен как равный ключу сортировки.

- Для экономии памяти мы явно указали первичный ключ, который содержит только столбцы, по которым фильтруются наши запросы. Первичный индекс, основанный на первичном ключе, полностью загружен в основную память.

- Для обеспечения согласованности диаграмм и максимизации коэффициента сжатия мы определили отдельный ключ сортировки, который включает все столбцы нашей таблицы (если в столбце хранятся схожие данные, расположенные близко друг к другу, например, через сортировку, то такие данные будут лучше сжиматься).

- Первичный ключ должен быть префиксом ключа сортировки, если оба указаны.
:::

Вставленные строки хранятся на диске в лексикографическом порядке (возрастания) по столбцам(ам) первичного ключа (и дополнительной колонке `EventTime` из ключа сортировки).

:::note
ClickHouse позволяет вставлять несколько строк с одинаковыми значениями колонок первичного ключа. В этом случае (см. строку 1 и строку 2 на диаграмме ниже) окончательный порядок определяется указанным ключом сортировки, а следовательно, значением колонки `EventTime`.
:::


ClickHouse является <a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms" target="_blank">столбцовой системой управления базами данных</a>. Как показано на диаграмме ниже,
- для представления на диске существует один файл данных (*.bin) на каждый столбец таблицы, где хранятся все значения для этого столбца в <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">сжатом</a> формате, и
- 8,87 миллиона строк хранятся на диске в лексикографическом порядке по столбцам(ам) первичного ключа (и дополнительным колонкам сортировки), т.е. в данном случае
  - сначала по `UserID`,
  - затем по `URL`,
  - и, наконец, по `EventTime`:

<Image img={sparsePrimaryIndexes01} size="md" alt="Sparse Primary Indices 01" background="white"/>

`UserID.bin`, `URL.bin` и `EventTime.bin` — это файлы данных на диске, где хранятся значения колонок `UserID`, `URL` и `EventTime`.

:::note
- Поскольку первичный ключ определяет лексикографический порядок строк на диске, у таблицы может быть только один первичный ключ.

- Мы нумеруем строки, начиная с 0, чтобы соответствовать внутренней схеме нумерации строк ClickHouse, которая также используется для сообщений в логах.
:::
### Данные организованы в гранулы для параллельной обработки данных {#data-is-organized-into-granules-for-parallel-data-processing}

Для целей обработки данных значения столбцов таблицы логически разделены на гранулы.
Гранула — это наименьший неделимый набор данных, который передается в ClickHouse для обработки данных.
Это означает, что вместо чтения отдельных строк ClickHouse всегда читает (в потоковом режиме и параллельно) целую группу (гранулу) строк.
:::note
Значения столбцов физически не хранятся внутри гранул: гранулы — это всего лишь логическая организация значений столбцов для обработки запросов.
:::

Следующая диаграмма показывает, как (значения колонок) 8,87 миллиона строк нашей таблицы
организованы в 1083 гранулы, в результате DDL-запроса таблицы, содержащего настройку `index_granularity` (установленную на его значение по умолчанию 8192).

<Image img={sparsePrimaryIndexes02} size="md" alt="Sparse Primary Indices 02" background="white"/>

Первые (на основе физического порядка на диске) 8192 строки (их значения столбцов) логически принадлежат грануле 0, затем следующие 8192 строки (их значения столбцов) принадлежат грануле 1 и так далее.

:::note
- Последняя гранула (гранула 1082) "содержит" меньше 8192 строк.

- Мы упоминали в начале этого руководства в "Подробностях DDL-запроса", что мы отключили [адаптивную гранулярность индекса](/whats-new/changelog/2019.md/#experimental-features-1) (чтобы упростить обсуждения в этом руководстве, а также сделать диаграммы и результаты воспроизводимыми).

  Поэтому все гранулы (за исключением последней) нашей примерной таблицы имеют одинаковый размер.

- Для таблиц с адаптивной гранулярностью индекса (гранулярность индекса адаптивная по [умолчанию](/operations/settings/merge-tree-settings#index_granularity_bytes) размер некоторых гранул может быть меньше 8192 строк в зависимости от размеров данных строк.


- Мы выделили некоторые значения колонок из столбцов нашего первичного ключа (`UserID`, `URL`) оранжевым цветом.
  Эти значения колонок, выделенные оранжевым цветом, будут записями в первичном индексе таблицы.

- Мы нумеруем гранулы, начиная с 0, чтобы соответствовать внутренней нумерации ClickHouse, которая также используется для сообщений в логах.
:::
### Первичный индекс имеет одну запись на гранулу {#the-primary-index-has-one-entry-per-granule}

Первичный индекс создается на основе гранул, показанных на диаграмме выше. Этот индекс представляет собой несжатый плоский файл массива (primary.idx), содержащий так называемые числовые индексные метки, начинающиеся с 0.

Нижеуказанная диаграмма показывает, что индекс хранит значения колонок первичного ключа (значения, выделенные оранжевым на диаграмме выше) для каждой первой строки каждой гранулы. И, другими словами, первичный индекс хранит значения колонок первичного ключа каждой 8192-й строки таблицы (на основе физического порядка строк, определяемого колонками первичного ключа).
Например:
- первая запись индекса (‘метка 0’ на диаграмме ниже) хранит значения ключевых колонок первой строки гранулы 0 на диаграмме выше,
- вторая запись индекса (‘метка 1’ на диаграмме ниже) хранит значения ключевых колонок первой строки гранулы 1 на диаграмме выше и так далее.

<Image img={sparsePrimaryIndexes03a} size="lg" alt="Sparse Primary Indices 03a" background="white"/>

В целом индекс содержит 1083 записи для нашей таблицы с 8.87 миллиона строк и 1083 гранулами:

<Image img={sparsePrimaryIndexes03b} size="md" alt="Sparse Primary Indices 03b" background="white"/>

:::note
- Для таблиц с [адаптивной гранулярностью индекса](/whats-new/changelog/2019.md/#experimental-features-1) в первичном индексе также хранится одна "финальная" дополнительная метка, записывающая значения колонок первичного ключа последней строки таблицы. Однако, поскольку мы отключили адаптивную гранулярность индекса (чтобы упростить обсуждения в этом руководстве, а также сделать диаграммы и результаты воспроизводимыми), индекс нашей примерной таблицы не включает эту финальную метку.

- Файл первичного индекса полностью загружается в основную память. Если файл больше доступного свободного пространства памяти, ClickHouse выдаст ошибку.
:::

<details>
    <summary>
    Изучение содержимого первичного индекса
    </summary>
    <p>

На самоуправляемом кластере ClickHouse мы можем использовать <a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">табличную функцию file</a> для изучения содержимого первичного индекса нашей примерной таблицы.

Для этого нам сначала нужно скопировать файл первичного индекса в <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a> узла из работающего кластера:
<ul>
<li>Шаг 1: Получите путь к части, содержащей файл первичного индекса</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

возвращает `/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4` на тестовой машине.

<li>Шаг 2: Получите user_files_path</li>
<a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">По умолчанию user_files_path</a> на Linux:
`/var/lib/clickhouse/user_files/`

и на Linux вы можете проверить, изменился ли он: `$ grep user_files_path /etc/clickhouse-server/config.xml`

На тестовой машине путь — `/Users/tomschreiber/Clickhouse/user_files/`

<li>Шаг 3: Скопируйте файл первичного индекса в user_files_path</li>

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
Это точно совпадает с нашей диаграммой содержимого первичного индекса для нашей примерной таблицы:

</p>
</details>

Записи первичного ключа называются индексными метками, потому что каждая запись индекса отмечает начало конкретного диапазона данных. Конкретно для примерной таблицы:
- Индексные метки UserID:

  Сохраненные значения `UserID` в первичном индексе отсортированы в порядке возрастания.<br/>
  ‘метка 1’ на диаграмме выше, таким образом, указывает на то, что значения `UserID` всех строк таблицы в грануле 1, и во всех следующих гранулах, гарантированно больше либо равны 4.073.710.

 [Как мы увидим позже](#the-primary-index-is-used-for-selecting-granules), этот глобальный порядок позволяет ClickHouse <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">использовать алгоритм бинарного поиска</a> по индексным меткам для первого ключевого столбца, когда запрос фильтрует по первому столбцу первичного ключа.

- Индексные метки URL:

  Довольно схожая кардинальность колонок первичного ключа `UserID` и `URL` значит, что индексные метки для всех ключевых колонок после первого столбца в общем случае просто указывают на диапазон данных, пока значение предшествующей ключевой колонки остается тем же для всех строк таблицы как минимум в текущей грануле.<br/>
 Например, поскольку значения UserID метки 0 и метки 1 отличаются на диаграмме выше, ClickHouse не может предположить, что все значения URL всех строк таблицы в грануле 0 больше или равны `'http://showtopics.html%3...'`. Однако, если бы значения UserID метки 0 и метки 1 были одинаковыми на диаграмме выше (что означало бы, что значение UserID остается тем же для всех строк таблицы в грануле 0), ClickHouse мог бы предположить, что все значения URL всех строк таблицы в грануле 0 больше или равны `'http://showtopics.html%3...'`.

  Мы обсудим последствия этого для производительности выполнения запроса более подробно позже.
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

10 строк в наборе. Затрачено: 0.005 сек.

# highlight-next-line
Обработано 8.19 тысячи строк,
740.18 KB (1.53 миллиона строк/с., 138.59 МБ/с.)
```

Вывод для клиента ClickHouse теперь показывает, что вместо полной проверки таблицы только 8.19 тысячи строк были переданы в ClickHouse.

Если <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">включен логирование трассировки</a>, тогда файл журнала сервера ClickHouse показывает, что ClickHouse выполнял <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">бинарный поиск</a> по 1083 индексным меткам UserID, чтобы идентифицировать гранулы, которые могут содержать строки со значением колонки UserID `749927693`. Это требует 19 шагов со средней временной сложностью `O(log2 n)`:
```response
...Executor): Условие ключа: (столбец 0 в [749927693, 749927693])

# highlight-next-line
...Executor): Выполнение бинарного поиска по диапазону индексов для части all_1_9_2 (1083 метки)
...Executor): Найдена (ЛЕВАЯ) граница метки: 176
...Executor): Найдена (ПРАВАЯ) граница метки: 177
...Executor): Найден непрерывный диапазон за 19 шагов
...Executor): Выбраны 1/1 частей по ключу партиции, 1 частей по первичному ключу,

# highlight-next-line
              1/1083 меток по первичному ключу, 1 меток для чтения из 1 диапазонов
...Чтение ...примерно 8192 строки начиная с 1441792
```

Мы видим в журнале трассировки выше, что одна метка из 1083 существующих меток удовлетворяла запросу.

<details>
    <summary>
    Подробности журнала трассировки
    </summary>
    <p>

Метка 176 была идентифицирована (найденная "левая граница метки" является включительной, "найденная правая граница метки" является исключительной), и поэтому все 8192 строки из гранулы 176 (которая начинается со строки 1.441.792 - мы увидим это позже в этом руководстве) затем будут переданы в ClickHouse, чтобы найти фактические строки со значением колонки UserID `749927693`.
</p>
</details>

Мы также можем воспроизвести это, используя <a href="https://clickhouse.com/docs/sql-reference/statements/explain/" target="_blank">условие EXPLAIN</a> в нашем примерном запросе:
```sql
EXPLAIN indexes = 1
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

Ответ выглядит так:

```response
┌─explain───────────────────────────────────────────────────────────────────────────────┐
│ Выражение (Projection)                                                               │
│   Ограничение (предварительное LIMIT (без OFFSET))                                   │
│     Сортировка (С сортировкой для ORDER BY)                                         │
│       Выражение (Перед ORDER BY)                                                    │
│         Агрегация                                                                    │
│           Выражение (Перед GROUP BY)                                                │
│             Фильтр (WHERE)                                                          │
│               УстановкаКвотыИЛимиты (Установка лимитов и квот после чтения из хранилища) │
│                 ЧтениеИзMergeTree                                                   │
│                 Индексы:                                                            │
│                   PrimaryKey                                                          │
│                     Ключи:                                                           │
│                       UserID                                                          │
│                     Условие: (UserID в [749927693, 749927693])                     │
│                     Части: 1/1                                                        │

# highlight-next-line
│                     Гранулы: 1/1083                                                  │
└───────────────────────────────────────────────────────────────────────────────────────┘

16 строк в наборе. Затрачено: 0.003 сек.
```
Вывод клиента показывает, что была выбрана одна из 1083 гранул, которая может содержать строки со значением колонки UserID 749927693.

:::note Заключение
Когда запрос фильтрует по колонке, которая является частью составного ключа и является первым ключевым столбцом, то ClickHouse выполняет бинарный поиск по индексным меткам ключевой колонки.
:::

<br/>

Как обсуждалось выше, ClickHouse использует свой разреженный первичный индекс для быстрого (через бинарный поиск) выбора гранул, которые могут содержать строки, совпадающие с запросом.

Это **первая стадия (выбор гранулы)** выполнения запроса ClickHouse.

На **второй стадии (чтение данных)** ClickHouse находит выбранные гранулы, чтобы передать все их строки в движок ClickHouse для нахождения строк, которые действительно соответствуют запросу.

Мы обсудим эту вторую стадию более подробно в следующем разделе.
### Файлы меток используются для локализации гранул {#mark-files-are-used-for-locating-granules}

Следующая диаграмма иллюстрирует часть файла первичного индекса для нашей таблицы.

<Image img={sparsePrimaryIndexes04} size="md" alt="Sparse Primary Indices 04" background="white"/>

Как обсуждалось выше, по бинарному поиску по 1083 меткам UserID была идентифицирована метка 176. Следовательно, соответствующая гранула 176 может содержать строки со значением колонки UserID 749.927.693.

<details>
    <summary>
    Подробности выбора гранулы
    </summary>
    <p>

Диаграмма выше показывает, что метка 176 является первой индексной записью, где минимальное значение UserID связанной гранулы 176 меньше 749.927.693, а минимальное значение UserID гранулы 177 для следующей метки (метки 177) больше этого значения. Следовательно, только соответствующая гранула 176 для метки 176 может содержать строки со значением колонки UserID 749.927.693.
</p>
</details>

Чтобы подтвердить (или опровергнуть), что некоторые строки в грануле 176 содержат значение колонки UserID 749.927.693, все 8192 строки, принадлежащие этой грануле, необходимо передать в ClickHouse.

Для достижения этого ClickHouse должен знать физическое местоположение гранулы 176.

В ClickHouse физические местоположения всех гранул для нашей таблицы хранятся в файлах меток. Аналогично файлам данных, для каждого столбца таблицы имеется один файл меток.

Следующая диаграмма показывает три файла меток `UserID.mrk`, `URL.mrk` и `EventTime.mrk`, которые хранят физические местоположения гранул для колонок `UserID`, `URL` и `EventTime` таблицы.

<Image img={sparsePrimaryIndexes05} size="md" alt="Sparse Primary Indices 05" background="white"/>

Мы обсудили, как первичный индекс является плоским несжатым файлом массива (primary.idx), содержащим индексные метки, которые нумеруются начиная с 0.

Аналогично, файл меток также представляет собой плоский несжатый файл массива (*.mrk), содержащий метки, которые нумеруются начиная с 0.

Когда ClickHouse идентифицировал и выбрал индексную метку для гранулы, которая может содержать строки, соответствующие запросу, можно выполнить позиционную выборку массива в файлах меток для получения физических местоположений гранулы.

Каждая запись файла меток для конкретного столбца хранит два местоположения в форме смещений:

- Первое смещение ('block_offset' на диаграмме выше) указывает на <a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">блок</a> в <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">сжатом</a> файле данных колонны, который содержит сжатую версию выбранной гранулы. Этот сжатый блок может содержать несколько сжатых гранул. Найденный сжатый файл блока распаковывается в основную память при чтении.

- Второе смещение ('granule_offset' на диаграмме выше) из файла меток предоставляет местоположение гранулы внутри распакованного блока данных.

Все 8192 строки, принадлежащие найденной распакованной грануле, затем передаются в ClickHouse для дальнейшей обработки.

:::note

- Для таблиц с [широким форматом](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) и без [адаптивной гранулярности индекса](/whats-new/changelog/2019.md/#experimental-features-1) ClickHouse использует файлы меток `.mrk`, как показано выше, которые содержат записи с двумя адресами длиной 8 байт для каждой записи. Эти записи являются физическими местоположениями гранул, которые все имеют одинаковый размер.

 Гранулярность индекса по умолчанию адаптивна, но для нашей примерной таблицы мы отключили адаптивную гранулярность индекса (чтобы упростить обсуждения в этом руководстве, а также сделать диаграммы и результаты воспроизводимыми). Наша таблица использует широкий формат, потому что размер данных больше [min_bytes_for_wide_part](/operations/settings/merge-tree-settings#min_bytes_for_wide_part) (что по умолчанию составляет 10 МБ для самоуправляемых кластеров).

- Для таблиц с широким форматом и с адаптивной гранулярностью индекса ClickHouse использует файлы меток `.mrk2`, которые содержат аналогичные записи к `.mrk` файлам меток, но с дополнительным третьим значением в каждой записи: количество строк гранулы, с которой связана текущая запись.

- Для таблиц с [компактным форматом](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) ClickHouse использует файлы меток `.mrk3`.

:::

:::note Почему файлы меток

Почему первичный индекс не содержит напрямую физических местоположений гранул, соответствующих индексным меткам?

Потому что на столь большом масштабе, для которого был спроектирован ClickHouse, важно быть очень эффективным по дисковому и оперативному пространству.

Файл первичного индекса должен помещаться в основную память.

Для нашего примерного запроса ClickHouse использовал первичный индекс и выбрал единственную гранулу, которая может содержать строки, соответствующие нашему запросу. Только для этой одной гранулы ClickHouse затем нужны физические местоположения, чтобы передать соответствующие строки для дальнейшей обработки.

Кроме того, эта информация о смещении нужна только для колонок UserID и URL.

Информация о смещении не нужна для колонок, которые не используются в запросе, например, `EventTime`.

Для нашего примерного запроса ClickHouse нужно только два физических адреса местоположения для гранулы 176 в файле данных UserID (UserID.bin) и два физических адреса местоположения для гранулы 176 в файле данных URL (URL.bin).

Косвенная информация, предоставленная файлами меток, избегает хранения, напрямую в первичном индексе, записей для физических местоположений всех 1083 гранул для всех трех колонок: таким образом, избегая ненужных (потенциально неиспользуемых) данных в основной памяти.
:::

Следующая диаграмма и текст ниже иллюстрируют, как ClickHouse для нашего примерного запроса находит гранулу 176 в файле данных UserID.bin.

<Image img={sparsePrimaryIndexes06} size="md" alt="Sparse Primary Indices 06" background="white"/>

Мы обсудили ранее в этом руководстве, что ClickHouse выбрал первичную индексную метку 176 и, следовательно, гранулу 176 как потенциально содержащую строки, соответствующие нашему запросу.

Теперь ClickHouse использует выбранный номер метки (176) из индекса для позиционной выборки массива в файле меток UserID.mrk, чтобы получить два смещения для локализации гранулы 176.

Как показано, первое смещение находит сжатый файл блока в файле данных UserID.bin, который в свою очередь содержит сжатую версию гранулы 176.

После того, как найденный блок файла распаковывается в основную память, второе смещение из файла меток может быть использовано для локализации гранулы 176 внутри распакованных данных.

ClickHouse должен локализовать (и передать все значения из) гранулы 176 как из файла данных UserID.bin, так и из файла данных URL.bin, чтобы выполнить наш примерный запрос (топ-10 самых кликабельных URL для интернет-пользователя с UserID 749.927.693).

Диаграмма выше показывает, как ClickHouse локализует гранулу для файла данных UserID.bin.

Параллельно ClickHouse делает то же самое для гранулы 176 в файле данных URL.bin. Эти две гранулы выровнены и передаются в движок ClickHouse для дальнейшей обработки, т.е. агрегации и подсчета значений URL по группе для всех строк, где UserID равен 749.927.693, прежде чем, в конечном итоге, вывести 10 крупнейших групп URL по убывающему порядку по количеству.
## Использование нескольких первичных индексов {#using-multiple-primary-indexes}

<a name="filtering-on-key-columns-after-the-first"></a>
### Вторичные ключевые колонки могут (не) быть неэффективными {#secondary-key-columns-can-not-be-inefficient}

Когда запрос фильтрует по колонке, которая является частью составного ключа и является первым ключевым столбцом, [тогда ClickHouse выполняет бинарный поиск по индексным меткам ключевой колонки](#the-primary-index-is-used-for-selecting-granules).

Но что происходит, когда запрос фильтрует по колонке, которая является частью составного ключа, но не является первым ключевым столбцом?

:::note
Мы обсуждаем сценарий, когда запрос явно не фильтрует по первому ключевому столбцу, а по вторичной ключевой колонке.

Когда запрос фильтрует как по первому ключевому столбцу, так и по любому ключевому столбцу(ам) после первого, то ClickHouse выполняет бинарный поиск по индексным меткам первого ключевого столбца.
:::

<br/>
<br/>

<a name="query-on-url"></a>
Мы используем запрос, который вычисляет топ-10 пользователей, которые чаще всего кликали по URL "http://public_search":

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

10 строк в наборе. Затрачено: 0.086 сек.

# highlight-next-line
Обработано 8.81 миллиона строк,
799.69 MB (102.11 миллиона строк/с., 9.27 ГБ/с.)
```

Вывод клиента указывает на то, что ClickHouse почти выполнил полное сканирование таблицы, несмотря на то, что [колонка URL является частью составного первичного ключа](#a-table-with-a-primary-key)! ClickHouse считывает 8.81 миллиона строк из 8.87 миллиона строк таблицы.

Если [trace_logging](/operations/server-configuration-parameters/settings#logger) включен, то файл журнала сервера ClickHouse показывает, что ClickHouse использовал <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">общий алгоритм исключения</a> по 1083 индексным меткам URL, чтобы идентифицировать гранулы, которые могут содержать строки со значением колонки URL "http://public_search":
```response
...Executor): Условие ключа: (столбец 1 в ['http://public_search',
                                           'http://public_search'])

# highlight-next-line
...Executor): Использован общий алгоритм исключения по индексу для части all_1_9_2
              с 1537 шагами
...Executor): Выбраны 1/1 частей по ключу партиции, 1 частей по первичному ключу,

# highlight-next-line
              1076/1083 меток по первичному ключу, 1076 меток для чтения из 5 диапазонов
...Executor): Чтение примерно 8814592 строк с 10 потоками
```
Мы видим в образце журнала трассировки выше, что 1076 (по меткам) из 1083 гранул были выбраны как потенциально содержащие строки со значением URL.

Это приводит к тому, что 8.81 миллиона строк передаются в движок ClickHouse (параллельно с использованием 10 потоков), чтобы определить строки, которые фактически содержат значение URL "http://public_search".

Однако, как мы увидим позже, только 39 гранул из выбранных 1076 гранул действительно содержат совпадающие строки.

Хотя первичный индекс, основанный на составном первичном ключе (UserID, URL), был очень полезен для ускорения запросов фильтрации строк с конкретным значением UserID, индекс не предоставляет значительной помощи в ускорении запроса, который фильтрует строки с конкретным значением URL.

Причина этого в том, что колонка URL не является первым ключевым столбцом, и поэтому ClickHouse использует общий алгоритм исключения (вместо бинарного поиска) по индексным меткам колонки URL, и **эффективность этого алгоритма зависит от разницы в кардинальности** между колонкой URL и предшествующей ключевой колонкой UserID.

Чтобы проиллюстрировать это, мы дадим некоторые детали о том, как работает общий алгоритм исключения.

<a name="generic-exclusion-search-algorithm"></a>
### Алгоритм общего исключения {#generic-exclusion-search-algorithm}

Следующее иллюстрирует, как работает <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank">алгоритм общего исключения ClickHouse</a>, когда гранулы выбираются через вторичный столбец, где предшествующая ключевая колонка имеет низкую или высокую кардинальность.

В качестве примера для обеих случаев мы предположим:
- запрос, который ищет строки с URL = "W3".
- абстрактная версия нашей таблицы hits с упрощенными значениями для UserID и URL.
- тот же составной первичный ключ (UserID, URL) для индекса. Это означает, что строки сначала упорядочены по значениям UserID. Строки с одинаковым значением UserID затем упорядочиваются по URL.
- размер гранулы равен двум, т.е. каждая гранула содержит две строки.

Мы выделили значения ключевых колонок для первых строк таблиц для каждой гранулы оранжевым цветом на диаграммах ниже.

**Предшествующая ключевая колонка имеет низкую кардинальность**<a name="generic-exclusion-search-fast"></a>

Предположим, значение UserID имеет низкую кардинальность. В этом случае вполне вероятно, что одно и то же значение UserID распределено по нескольким строкам таблицы и гранулам, и, следовательно, по индексным меткам. Для индексных меток с одинаковым UserID значения URL для индексных меток отсортированы в порядке возрастания (поскольку строки таблицы сначала упорядочиваются по UserID, а затем по URL). Это позволяет эффективно фильтровать, как описано ниже:

<Image img={sparsePrimaryIndexes07} size="md" alt="Sparse Primary Indices 06" background="white"/>

Существует три разных сценария для процесса выбора гранул для наших абстрактных данных в диаграмме выше:

1.  Индексная метка 0, для которой **значение URL меньше W3 и значение URL непосредственно следующей индексной метки также меньше W3**, может быть исключена, потому что метка 0 и 1 имеют одинаковое значение UserID. Обратите внимание, что это предусловие для исключения гарантирует, что гранула 0 полностью состоит из значений UserID U1, поэтому ClickHouse может предположить, что максимальное значение URL в грануле 0 также меньше W3 и исключить гранулу.

2. Индексная метка 1, для которой **значение URL меньше (или равно) W3 и значение URL непосредственно следующей индексной метки больше (или равно) W3**, выбирается, потому что это означает, что гранула 1 может содержать строки со значением URL W3.

3. Индексные метки 2 и 3, для которых **значение URL больше W3**, могут быть исключены, поскольку индексные метки первичного индекса хранят значения ключевых колонок для первой строки таблицы для каждой гранулы, и строки таблицы отсортированы на диске по значениям ключевых колонок, следовательно, гранулы 2 и 3 не могут содержать значение URL W3.

**Предшествующая ключевая колонка имеет высокую кардинальность**<a name="generic-exclusion-search-slow"></a>

Когда значение UserID имеет высокую кардинальность, маловероятно, что одно и то же значение UserID распределено по нескольким строкам таблицы и гранулам. Это означает, что значения URL для индексных меток не возрастают монотонно:

<Image img={sparsePrimaryIndexes08} size="md" alt="Sparse Primary Indices 06" background="white"/>

Как видно на диаграмме выше, все показанные метки, чьи значения URL меньше W3, выбираются для передачи строк ассоциированных гранул в движок ClickHouse.

Это происходит потому, что хотя все индексные метки на диаграмме подпадают под сценарий 1, описанный выше, они не удовлетворяют указанному заранее условию исключения, что *непосредственно следующая индексная метка имеет то же значение UserID, что и текущая метка*, и поэтому не могут быть исключены.

Например, рассмотрим индексную метку 0, для которой **значение URL меньше W3 и значение URL непосредственно следующей индексной метки также меньше W3**. Это *не* может быть исключено, поскольку непосредственно следующая индексная метка 1 *не* имеет такое же значение UserID, как текущая метка 0.

Это в конечном итоге предотвращает ClickHouse от того, чтобы делать предположения о максимальном значении URL в грануле 0. Вместо этого он должен предположить, что гранула 0 может содержать строки со значением URL W3 и вынужден выбрать метку 0.

Тот же сценарий верен для меток 1, 2 и 3.

:::note Заключение
<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">Алгоритм общего исключения</a>, который ClickHouse использует вместо <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">алгоритма бинарного поиска</a>, когда запрос фильтрует по колонке, которая является частью составного ключа, но не является первым ключевым столбцом, наиболее эффективен, когда предшествующая ключевая колонка имеет низкую кардинальность.
:::

В нашем образце данных обе ключевые колонки (UserID, URL) имеют схожую высокую кардинальность, и, как было объяснено, алгоритм общего исключения не очень эффективен, когда предшествующая ключевая колонка URL имеет высокую или схожую кардинальность.
### Примечание о индексе пропуска данных {#note-about-data-skipping-index}

Из-за аналогично высокой кардинальности UserID и URL, наш [фильтр запросов по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) также не получит значительной выгоды от создания [вторичного индекса пропуска данных](./skipping-indexes.md) по колонке URL нашей [таблицы со составным первичным ключом (UserID, URL)](#a-table-with-a-primary-key).

Например, эти две команды создают и заполняют индекс пропуска данных [minmax](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) по колонке URL нашей таблицы:
```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```
ClickHouse теперь создал дополнительный индекс, который хранит - для группы из 4 последовательных [гранул](#data-is-organized-into-granules-for-parallel-data-processing) (обратите внимание на условие `GRANULARITY 4` в команде `ALTER TABLE` выше) - минимальное и максимальное значения URL:

<Image img={sparsePrimaryIndexes13a} size="md" alt="Sparse Primary Indices 13a" background="white"/>

Первая запись индекса (‘mark 0’ на диаграмме выше) хранит минимальные и максимальные значения URL для [строк, принадлежащих первым 4 гранулам нашей таблицы](#data-is-organized-into-granules-for-parallel-data-processing).

Вторая запись индекса (‘mark 1’) хранит минимальные и максимальные значения URL для строк, принадлежащих следующим 4 гранулам нашей таблицы, и так далее.

(ClickHouse также создал специальный [файл меток](#mark-files-are-used-for-locating-granules) для индекса пропуска данных для [определения](#mark-files-are-used-for-locating-granules) групп гранул, связанных с индексными метками.)

Из-за аналогично высокой кардинальности UserID и URL, этот вторичный индекс пропуска данных не может помочь в исключении гранул из выборки при выполнении нашего [фильтра запроса по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient).

Конкретное значение URL, которое ищет запрос (т.е. 'http://public_search'), вполне вероятно находится между минимальным и максимальным значениями, хранящимися индексом для каждой группы гранул, что приводит к тому, что ClickHouse вынужден выбирать группу гранул (поскольку они могут содержать строку(и), соответствующую запросу).

### Необходимость использования нескольких первичных индексов {#a-need-to-use-multiple-primary-indexes}

Следовательно, если мы хотим значительно ускорить наш образец запроса, который фильтрует строки с конкретным URL, то нам необходимо использовать первичный индекс, оптимизированный для этого запроса.

Если, кроме того, мы хотим сохранить хорошую производительность нашего образца запроса, который фильтрует строки с конкретным UserID, тогда нам нужно использовать несколько первичных индексов.

Следующее демонстрирует варианты для достижения этой цели.

<a name="multiple-primary-indexes"></a>
### Варианты создания дополнительных первичных индексов {#options-for-creating-additional-primary-indexes}

Если мы хотим значительно ускорить оба наших образца запросов - один, который фильтрует строки с конкретным UserID, и другой, который фильтрует строки с конкретным URL - то нам нужно использовать несколько первичных индексов, применив один из этих трех вариантов:

- Создать **вторую таблицу** с другим первичным ключом.
- Создать **материализованный вид** на нашей существующей таблице.
- Добавить **проекцию** к нашей существующей таблице.

Все три варианта фактически дублируют наши образцы данных в дополнительную таблицу для реорганизации первичного индекса таблицы и порядка сортировки строк.

Тем не менее, три варианта различаются по тому, насколько прозрачно эта дополнительная таблица для пользователя в отношении маршрутизации запросов и операций вставки.

При создании **второй таблицы** с другим первичным ключом запросы должны быть явно направлены к версии таблицы, наиболее подходящей для запроса, а новые данные должны быть явно вставлены в обе таблицы, чтобы поддерживать их синхронизацию:

<Image img={sparsePrimaryIndexes09a} size="md" alt="Sparse Primary Indices 09a" background="white"/>

С **материализованным видом** дополнительная таблица создается неявно, и данные автоматически синхронизируются между обеими таблицами:

<Image img={sparsePrimaryIndexes09b} size="md" alt="Sparse Primary Indices 09b" background="white"/>

А **проекция** является самым прозрачным вариантом, поскольку, помимо автоматического поддержания неявно созданной (и скрытой) дополнительной таблицы в синхронизации с изменениями данных, ClickHouse автоматически выбирает наиболее эффективную версию таблицы для запросов:

<Image img={sparsePrimaryIndexes09c} size="md" alt="Sparse Primary Indices 09c" background="white"/>

В следующем мы обсудим эти три варианта создания и использования нескольких первичных индексов более подробно с реальными примерами.

<a name="multiple-primary-indexes-via-secondary-tables"></a>
### Вариант 1: Вторичные таблицы {#option-1-secondary-tables}

<a name="secondary-table"></a>
Мы создаем новую дополнительную таблицу, в которой меняем порядок ключевых колонок (по сравнению с нашей оригинальной таблицей) в первичном ключе:

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

Поскольку мы изменили порядок колонок в первичном ключе, вставленные строки теперь сохраняются на диске в другом лексикографическом порядке (по сравнению с нашей [оригинальной таблицей](#a-table-with-a-primary-key)), и, следовательно, 1083 гранулы этой таблицы содержат различные значения, чем раньше:

<Image img={sparsePrimaryIndexes10} size="md" alt="Sparse Primary Indices 10" background="white"/>

Это результирующий первичный ключ:

<Image img={sparsePrimaryIndexes11} size="md" alt="Sparse Primary Indices 11" background="white"/>

Который теперь можно использовать для значительного ускорения выполнения нашего примера запроса, фильтрующего по колонке URL, чтобы вычислить 10 пользователей, которые чаще всего кликали по URL "http://public_search":
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

Теперь, вместо [почти полного сканирования таблицы](/guides/best-practices/sparse-primary-indexes#efficient-filtering-on-secondary-key-columns), ClickHouse выполнил этот запрос гораздо более эффективно.

С первичным индексом из [оригинальной таблицы](#a-table-with-a-primary-key), где UserID находился первым, а URL вторым ключевым столбцом, ClickHouse использовал [алгоритм генерации исключений](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) для выполнения этого запроса, и это не было очень эффективно из-за аналогично высокой кардинальности UserID и URL.

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
ClickHouse выбрал только 39 индексных меток, вместо 1076, когда использовался общий алгоритм исключения.

Обратите внимание, что дополнительная таблица оптимизирована для ускорения выполнения нашего примера запроса, фильтрующего по URL.

Похожим образом, как и [плохая производительность](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) этого запроса с нашей [оригинальной таблицей](#a-table-with-a-primary-key), наш [пример запроса, фильтрующего по `UserID`](#the-primary-index-is-used-for-selecting-granules) не будет работать очень эффективно с новой дополнительной таблицей, поскольку UserID теперь является вторым ключевым столбцом в первичном индексе этой таблицы, и следовательно ClickHouse использует общий поиск исключений для выбора гранул, что [не очень эффективно из-за аналогично высокой кардинальности](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) UserID и URL.
Откройте детали для получения специфики.

<details>
    <summary>
    Запрос, фильтрующий по UserID теперь имеет плохую производительность<a name="query-on-userid-slow"></a>
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

Теперь у нас есть две таблицы. Оптимизированные для ускорения запросов, фильтрующих по `UserID`, и для ускорения запросов, фильтрующих по URL, соответственно:

### Вариант 2: Материализованные виды {#option-2-materialized-views}

Создайте [материализованный вид](/sql-reference/statements/create/view.md) на нашей существующей таблице.
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
- мы меняем порядок ключевых колонок (по сравнению с нашей [оригинальной таблицей](#a-table-with-a-primary-key)) в первичном ключе вида
- материализованный вид поддерживается **неявно созданной таблицей**, у которой порядок строк и первичный индекс основаны на заданном определении первичного ключа
- неявно созданная таблица отображается в результате запроса `SHOW TABLES` и имеет имя, начинающееся с `.inner`
- также возможно сначала явно создать вспомогательную таблицу для материализованного вида, а затем вид может обращаться к этой таблице через [клаузулу](/sql-reference/statements/create/view.md) `TO [db].[table]`
- мы используем ключевое слово `POPULATE`, чтобы немедленно заполнить неявно созданную таблицу всеми 8.87 миллионами строк из исходной таблицы [hits_UserID_URL](#a-table-with-a-primary-key)
- если новые строки вставляются в исходную таблицу hits_UserID_URL, то эти строки автоматически также вставляются в неявно созданную таблицу
- Фактически неявно созданная таблица имеет тот же порядок строк и первичный индекс, что и [вторичная таблица, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables):

<Image img={sparsePrimaryIndexes12b1} size="md" alt="Sparse Primary Indices 12b1" background="white"/>

ClickHouse хранит [файлы данных колонок](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin), [файлы меток](#mark-files-are-used-for-locating-granules) (*.mrk2) и [первичный индекс](#the-primary-index-has-one-entry-per-granule) (primary.idx) неявно созданной таблицы в специальной папке в директории данных сервера ClickHouse:

<Image img={sparsePrimaryIndexes12b2} size="md" alt="Sparse Primary Indices 12b2" background="white"/>

:::

Неявно созданная таблица (и ее первичный индекс), поддерживающая материализированный вид, теперь могут использоваться для значительного ускорения выполнения нашего примера запроса, фильтрующего по колонке URL:
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

Поскольку фактически неявно созданная таблица (и ее первичный индекс), поддерживающие материализованный вид, идентичны [вторичной таблице, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables), запрос выполняется так же эффективно, как и с явно созданной таблицей.

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
- проекция создает **скрытую таблицу**, чье упорядочение строк и первичный индекс основаны на заданной клаузуле `ORDER BY` проекции
- скрытая таблица не отображается в результате запроса `SHOW TABLES`
- мы используем ключевое слово `MATERIALIZE`, чтобы немедленно заполнить скрытую таблицу всеми 8.87 миллионами строк из исходной таблицы [hits_UserID_URL](#a-table-with-a-primary-key)
- если новые строки вставляются в исходную таблицу hits_UserID_URL, то эти строки автоматически также вставляются в скрытую таблицу
- запрос всегда (синтаксически) нацеливается на исходную таблицу hits_UserID_URL, но если порядок строк и первичный индекс скрытой таблицы позволяют более эффективно выполнять запрос, то будет использоваться эта скрытая таблица
- обратите внимание, что проекции не делают запросы, которые используют ORDER BY, более эффективными, даже если ORDER BY совпадает с оператором ORDER BY проекции (см. https://github.com/ClickHouse/ClickHouse/issues/47333)
- Фактически неявно созданная скрытая таблица имеет тот же порядок строк и первичный индекс, что и [вторичная таблица, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables):

<Image img={sparsePrimaryIndexes12c1} size="md" alt="Sparse Primary Indices 12c1" background="white"/>

ClickHouse хранит [файлы данных колонок](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin), [файлы меток](#mark-files-are-used-for-locating-granules) (*.mrk2) и [первичный индекс](#the-primary-index-has-one-entry-per-granule) (primary.idx) скрытой таблицы в специальной папке (выделенной оранжевым на скриншоте ниже) рядом с файлами данных исходной таблицы, файлами меток и файлами первичных индексов:

<Image img={sparsePrimaryIndexes12c2} size="sm" alt="Sparse Primary Indices 12c2" background="white"/>

:::

Скрытая таблица (и ее первичный индекс), созданные проекцией, теперь могут быть (неявно) использованы для значительного ускорения выполнения нашего примера запроса, фильтрующего по колонке URL. Обратите внимание, что запрос синтаксически нацеливается на исходную таблицу проекции.
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

Поскольку фактически скрытая таблица (и ее первичный индекс), созданная проекцией, идентична [вторичной таблице, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables), запрос выполняется так же эффективно, как и с явно созданной таблицей.

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

Первичный индекс нашей [таблицы со составным первичным ключом (UserID, URL)](#a-table-with-a-primary-key) был очень полезен для ускорения [запроса, фильтрующего по UserID](#the-primary-index-is-used-for-selecting-granules). Однако этот индекс не предоставляет значительной помощи в ускорении [запроса, фильтрующего по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient), несмотря на то, что колонка URL является частью составного первичного ключа.

И наоборот: первичный индекс нашей [таблицы со составным первичным ключом (URL, UserID)](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) ускорял [запрос, фильтрующий по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient), но не обеспечивал много поддержки для [запроса, фильтрующего по UserID](#the-primary-index-is-used-for-selecting-granules).

Из-за аналогично высокой кардинальности столбцов первичного ключа UserID и URL запрос, который фильтрует по второму ключевому столбцу [не получает значительной выгоды от того, что второй ключевой столбец находится в индексе](#generic-exclusion-search-algorithm).

Поэтому имеет смысл удалить второй ключевой столбец из первичного индекса (что приводит к меньшему потреблению памяти индекса) и вместо этого [использовать несколько первичных индексов](/guides/best-practices/sparse-primary-indexes#using-multiple-primary-indexes).

Тем не менее, если ключевые столбцы в составном первичном ключе имеют большие различия в кардинальности, то это [выгодно для запросов](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) упорядочивать ключевые столбцы первичного ключа по кардинальности в порядке возрастания.

Чем больше разница в кардинальности между ключевыми столбцами, тем больше значение порядка этих столбцов в ключе. Мы продемонстрируем это в следующем разделе.
## Эффективная сортировка ключевых столбцов {#ordering-key-columns-efficiently}

<a name="test"></a>

В составном первичном ключе порядок ключевых столбцов может значительно влиять как на:
- эффективность фильтрации по вторичным ключевым столбцам в запросах, так и
- коэффициент сжатия для файлов данных таблицы.

Чтобы продемонстрировать это, мы используем версию нашего [набора данных веб-трафика](#data-set), где каждая строка содержит три колонки, которые указывают, был ли доступ интернет "пользователя" (`UserID`) к URL (`URL`) отмечен как бот-трафик (`IsRobot`).

Мы будем использовать составной первичный ключ, содержащий все три упомянутые колонки, которые можно использовать для ускорения типичных запросов веб-анализа, которые вычисляют
- какую часть (процент) трафика к конкретному URL составляет бот или
- насколько мы уверены, что конкретный пользователь является (не) ботом (какой процент трафика от этого пользователя (не) считается бот-трафиком).

Мы используем этот запрос для вычисления кардинальностей трех колонок, которые мы хотим использовать в качестве ключевых колонок в составном первичном ключе (обратите внимание, что мы используем [функцию таблицы URL](/sql-reference/table-functions/url.md) для запроса TSV-данных на лету без необходимости создания локальной таблицы). Запустите этот запрос в `clickhouse client`:
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

Мы видим, что существует большая разница между кардинальностями, особенно между колонками `URL` и `IsRobot`, и следовательно порядок этих колонок в составном первичном ключе имеет значение как для эффективного ускорения запросов, фильтрующих по этим колонкам, так и для достижения оптимальных коэффициентов сжатия для файлов данных колонки таблицы.

С целью продемонстрировать это мы создаем две версии таблиц для нашего анализа трафика ботов:
- таблицу `hits_URL_UserID_IsRobot` со составным первичным ключом `(URL, UserID, IsRobot)` в которой ключевые колонки упорядочены по кардинальности в порядке убывания
- таблицу `hits_IsRobot_UserID_URL` со составным первичным ключом `(IsRobot, UserID, URL)` в которой ключевые колонки упорядочены по кардинальности в порядке возрастания.

Создайте таблицу `hits_URL_UserID_IsRobot` со составным первичным ключом `(URL, UserID, IsRobot)`:
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

И заполните ее 8.87 миллионами строк:
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

Далее создайте таблицу `hits_IsRobot_UserID_URL` со составным первичным ключом `(IsRobot, UserID, URL)`:
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
И заполните ее теми же 8.87 миллионами строк, которые мы использовали для заполнения предыдущей таблицы:

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

Когда запрос фильтрует по крайней мере одной колонке, которая является частью составного ключа, и это первая ключевая колонка, [то ClickHouse выполняет бинарный поиск по индексным меткам этой ключевой колонки](#the-primary-index-is-used-for-selecting-granules).

Когда запрос фильтрует (только) по колонке, которая является частью составного ключа, но не является первой ключевой колонкой, [то ClickHouse использует алгоритм генерации исключений по индексным меткам ключевой колонки](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient).

Для второго случая порядок ключевых колонок в составном первичном ключе имеет значительное значение для эффективности [алгоритма общего исключения](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444).

Вот запрос, который фильтрует по колонке `UserID` таблицы, в которой мы упорядочили ключевые колонки `(URL, UserID, IsRobot)` по кардинальности в порядке убывания:
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

Это тот же самый запрос к таблице, в которой упорядочили ключевые колонки `(IsRobot, UserID, URL)` по кардинальности в порядке возрастания:
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

Мы видим, что выполнение запроса значительно более эффективно и быстрее на таблице, где порядок ключевых колонок упорядочен по кардинальности в порядке возрастания.

Причина этого в том, что [алгоритм общего исключения](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444) работает наиболее эффективно, когда [гранулы](#the-primary-index-is-used-for-selecting-granules) выбираются через вторичную ключевую колонку, где предшествующая ключевая колонка имеет более низкую кардинальность. Мы подробно раскрыли это в [предыдущем разделе](#generic-exclusion-search-algorithm) этого руководства.
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
Это ответ:
```response
┌─Table───────────────────┬─Column─┬─Uncompressed─┬─Compressed─┬─Ratio─┐
│ hits_URL_UserID_IsRobot │ UserID │ 33.83 MiB    │ 11.24 MiB  │     3 │
│ hits_IsRobot_UserID_URL │ UserID │ 33.83 MiB    │ 877.47 KiB │    39 │
└─────────────────────────┴────────┴──────────────┴────────────┴───────┘

2 строки в наборе. Затраченное время: 0.006 сек.
```
Мы видим, что соотношение сжатия для колонки `UserID` значительно выше для таблицы, где мы упорядочили ключевые колонки `(IsRobot, UserID, URL)` по кардинальности в порядке возрастания.

Несмотря на то, что в обеих таблицах хранятся точно одни и те же данные (мы вставили одни и те же 8.87 миллионов строк в обе таблицы), порядок ключевых колонок в составном первичном ключе значительно влияет на то, сколько дискового пространства требуется для <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">сжатых</a> данных в [файлах данных колонок](#data-is-stored-on-disk-ordered-by-primary-key-columns) таблицы:
- в таблице `hits_URL_UserID_IsRobot` с составным первичным ключом `(URL, UserID, IsRobot)` где мы упорядочили ключевые колонки по кардинальности в порядке убывания, файл данных `UserID.bin` занимает **11.24 MiB** дискового пространства
- в таблице `hits_IsRobot_UserID_URL` с составным первичным ключом `(IsRobot, UserID, URL)` где мы упорядочили ключевые колонки по кардинальности в порядке возрастания, файл данных `UserID.bin` занимает всего **877.47 KiB** дискового пространства

Хорошее соотношение сжатия для данных колонки таблицы на диске не только экономит дисковое пространство, но и делает запросы (особенно аналитические), которые требуют чтения данных из этой колонки, быстрее, так как требуется меньше ввода-вывода для перемещения данных из колонки из диска в основную память (кэш файлов операционной системы).

Далее мы иллюстрируем, почему полезно, чтобы соотношение сжатия колонок таблицы упорядочивалось по кардинальности ключевых колонок в порядке возрастания.

Диаграмма ниже изображает порядок строк на диске для первичного ключа, где ключевые колонки упорядочены по кардинальности в порядке возрастания:

<Image img={sparsePrimaryIndexes14a} size="md" alt="Sparse Primary Indices 14a" background="white"/>

Мы обсуждали, что [данные строк таблицы хранятся на диске в порядке, упорядоченном по первичным ключевым колонкам](#data-is-stored-on-disk-ordered-by-primary-key-columns).

На диаграмме выше строки таблицы (их значения колонок на диске) сначала упорядочиваются по значению `cl`, а строки с одинаковым значением `cl` упорядочиваются по значению `ch`. И поскольку первая ключевая колонка `cl` имеет низкую кардинальность, вполне вероятно, что есть строки с одинаковым значением `cl`. И из-за этого также вероятно, что значения `ch` упорядочены (локально - для строк с одинаковым значением `cl`).

Если в колонке аналогичные данные располагаются близко друг к другу, например, через сортировку, то такие данные будут лучше сжиматься.
В общем, алгоритм сжатия выигрывает от длинной последовательности данных (чем больше данных он видит, тем лучше для сжатия)
и локальности (чем более схожи данные, тем лучше соотношение сжатия).

В отличие от диаграммы выше, диаграмма ниже изображает порядок строк на диске для первичного ключа, где ключевые колонки упорядочены по кардинальности в порядке убывания:

<Image img={sparsePrimaryIndexes14b} size="md" alt="Sparse Primary Indices 14b" background="white"/>

Теперь строки таблицы сначала упорядочены по значению `ch`, а строки с одинаковым значением `ch` упорядочены по значению `cl`.
Но поскольку первая ключевая колонка `ch` имеет высокую кардинальность, маловероятно, что будут строки с одинаковым значением `ch`. И из-за этого также маловероятно, что значения `cl` упорядочены (локально - для строк с одинаковым значением `ch`).

Таким образом, значения `cl` скорее всего расположены в случайном порядке, и, следовательно, имеют плохую локальность и соотношение сжатия, соответственно.
### Резюме {#summary-1}

Для эффективной фильтрации по вторичным ключевым колонкам в запросах, а также для соотношения сжатия файлов данных колонки таблицы полезно упорядочивать колонки в первичном ключе по их кардинальности в порядке возрастания.
### Связанное содержание {#related-content-1}
- Блог: [Ускорение ваших запросов ClickHouse](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)
## Эффективное определение отдельных строк {#identifying-single-rows-efficiently}

Хотя в общем случае это [не](/knowledgebase/key-value) лучший вариант использования ClickHouse,
иногда приложения, построенные на ClickHouse, требуют определения отдельных строк таблицы ClickHouse.

Интуитивным решением для этого может быть использование колонки [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) с уникальным значением для каждой строки и для быстрой выборки строк использовать эту колонку как колонку первичного ключа.

Для самой быстрой выборки колонка UUID [должна быть первой ключевой колонкой](#the-primary-index-is-used-for-selecting-granules).

Мы обсуждали, что поскольку [данные строк таблицы ClickHouse хранятся на диске в порядке, упорядоченном по первичным ключевым колонкам](#data-is-stored-on-disk-ordered-by-primary-key-columns), наличие колонки с очень высокой кардинальностью (как колонка UUID) в первичном ключе или в составном первичном ключе перед колонками с более низкой кардинальностью [невыгодно для соотношения сжатия других колонок таблицы](#optimal-compression-ratio-of-data-files).

Компромисс между самой быстрой выборкой и оптимальным сжатием данных заключается в использовании составного первичного ключа, где UUID является последней ключевой колонкой, после колонок с низкой(ими) кардинальностью, используемых для обеспечения хорошего соотношения сжатия для некоторых колонок таблицы.
### Конкретный пример {#a-concrete-example}

Один конкретный пример — это сервис для размещения текстовых сообщений https://pastila.nl, который разработал Алексей Миловидов и [описывал в блоге](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/).

При каждом изменении текстового поля данные автоматически сохраняются в строку таблицы ClickHouse (одна строка на изменение).

И один из способов идентификации и извлечения (определенной версии) вставленного контента — использовать хеш контента в качестве UUID для строки таблицы, содержащей контент.

Следующая диаграмма показывает
- порядок вставки строк, когда контент изменяется (например, из-за нажатий клавиш при вводе текста в текстовом поле) и
- порядок данных на диске из вставленных строк, когда используется `PRIMARY KEY (hash)`:

<Image img={sparsePrimaryIndexes15a} size="md" alt="Sparse Primary Indices 15a" background="white"/>

Поскольку колонка `hash` используется как ключевая колонка первичного ключа
- конкретные строки могут быть извлечены [очень быстро](#the-primary-index-is-used-for-selecting-granules), но
- строки таблицы (их данные колонок) хранятся на диске в порядке, упорядоченном по (уникальным и случайным) значениям хеша. Поэтому значения колонки контента также хранятся в случайном порядке без локальности данных, что приводит к **субоптимальному соотношению сжатия для файла данных колонки контента**.

С целью значительного улучшения соотношения сжатия для колонки контента, при этом обеспечивая быструю выборку конкретных строк, pastila.nl использует два хеша (и составной первичный ключ) для идентификации конкретной строки:
- хеш контента, как обсуждалось выше, который уникален для различных данных, и
- [локально-чувствительный хеш (отпечаток)](https://en.wikipedia.org/wiki/Locality-sensitive_hashing), который **не** изменяется при небольших изменениях данных.

Следующая диаграмма показывает
- порядок вставки строк, когда контент изменяется (например, из-за нажатий клавиш при вводе текста в текстовом поле) и
- порядок данных на диске из вставленных строк, когда используется составной `PRIMARY KEY (fingerprint, hash)`:

<Image img={sparsePrimaryIndexes15b} size="md" alt="Sparse Primary Indices 15b" background="white"/>

Теперь строки на диске сначала упорядочены по `fingerprint`, и для строк с одинаковым значением отпечатка их значение `hash` определяет окончательный порядок.

Поскольку данные, которые отличаются только небольшими изменениями, получают одно и то же значение отпечатка, аналогичные данные теперь хранятся на диске рядом друг с другом в колонке контента. И это очень хорошо для соотношения сжатия колонки контента, так как алгоритм сжатия в общем выигрывает от локальности данных (чем более схожи данные, тем лучше соотношение сжатия).

Компромисс заключается в том, что для извлечения конкретной строки требуются два поля (`fingerprint` и `hash`), чтобы оптимально использовать первичный индекс, который получается из составного `PRIMARY KEY (fingerprint, hash)`.
