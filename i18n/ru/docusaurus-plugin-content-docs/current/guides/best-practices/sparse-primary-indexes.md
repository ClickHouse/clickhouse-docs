---
sidebar_label: 'Первичные индексы'
sidebar_position: 1
description: 'В этом руководстве мы углубимся в индексацию ClickHouse.'
title: 'Практическое введение в первичные индексы ClickHouse'
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

# Практическое введение в первичные индексы ClickHouse
## Введение {#introduction}

В этом руководстве мы углубимся в индексацию ClickHouse. Мы детально проиллюстрируем и обсудим:
- [в чем отличие индексации в ClickHouse от традиционных систем управления реляционными базами данных](#an-index-design-for-massive-data-scales)
- [как ClickHouse строит и использует разреженный первичный индекс таблицы](#a-table-with-a-primary-key)
- [какие существуют лучшие практики для индексации в ClickHouse](#using-multiple-primary-indexes)

Вы можете по желанию выполнить все SQL-операторы и запросы ClickHouse, приведенные в этом руководстве, на вашем собственном компьютере. Для установки ClickHouse и начальных инструкций, смотрите [Быстрый старт](/quick-start.mdx).

:::note
Это руководство сосредоточено на разреженных первичных индексах ClickHouse.

Для [вторичных индексов пропуска данных](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes) в ClickHouse, смотрите [Учебник](/guides/best-practices/skipping-indexes.md).
:::
### Набор данных {#data-set}

На протяжении этого руководства мы будем использовать пример анонимизированного набора данных о веб-трафике.

- Мы будем использовать подмножество из 8.87 миллионов строк (событий) из примерного набора данных.
- Не сжатый размер данных составляет 8.87 миллионов событий и около 700 МБ. Это определяется до 200 МБ при хранении в ClickHouse.
- В нашем подмножестве каждая строка содержит три колонки, которые указывают на интернет-пользователя (колонка `UserID`), который нажал на URL (колонка `URL`) в конкретное время (колонка `EventTime`).

С этими тремя колонками мы можем уже сформулировать некоторые типичные запросы веб-аналитики, такие как:

- "Какие 10 URL были нажаты больше всего для конкретного пользователя?"
- "Кто 10 пользователей, которые чаще всего нажимали на конкретный URL?"
- "В какое время (например, в какие дни недели) пользователь чаще всего кликает на конкретный URL?"
### Тестовая машина {#test-machine}

Все временные показатели, указанные в этом документе, основаны на запуске ClickHouse 22.2.1 локально на MacBook Pro с чипом Apple M1 Pro и 16 ГБ ОЗУ.
### Полное сканирование таблицы {#a-full-table-scan}

Чтобы увидеть, как выполняется запрос по нашему набору данных без первичного ключа, мы создаем таблицу (с движком таблиц MergeTree), выполнив следующую SQL DDL команду:

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


Затем вставляем подмножество набора данных хитов в таблицу с помощью следующего SQL запроса на вставку. Это использует [табличную функцию URL](/sql-reference/table-functions/url.md) для загрузки подмножества полных данных, размещенных удаленно на clickhouse.com:

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


Вывод результата клиента ClickHouse показывает, что вышеуказанная команда вставила 8.87 миллионов строк в таблицу.


Наконец, чтобы упростить обсуждения в дальнейшем в этом руководстве и сделать диаграммы и результаты воспроизводимыми, мы [оптимизируем](/sql-reference/statements/optimize.md) таблицу с использованием ключевого слова FINAL:

```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
В общем, нет необходимости и не рекомендуется немедленно оптимизировать таблицу после загрузки данных в нее. Почему это необходимо для этого примера станет очевидным.
:::


Теперь мы выполняем наш первый запрос веб-аналитики. Следующий запрос вычисляет 10 наиболее часто нажатых URL для интернет-пользователя с идентификатором UserID 749927693:

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

Вывод результатов клиента ClickHouse указывает на то, что ClickHouse выполнил полное сканирование таблицы! Каждая отдельная строка из 8.87 миллионов строк нашей таблицы была передана в ClickHouse. Это не масштабируется.

Чтобы сделать этот процесс (гораздо) более эффективным и (значительно) быстрее, нам нужно использовать таблицу с соответствующим первичным ключом. Это позволит ClickHouse автоматически (на основе колонки(ок) первичного ключа) создать разреженный первичный индекс, который затем можно использовать для значительного ускорения выполнения нашего примера запроса.
### Связанный контент {#related-content}
- Блог: [Ускорение ваших запросов ClickHouse](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)
## Дизайн индексов ClickHouse {#clickhouse-index-design}
### Дизайн индекса для масштабов больших данных {#an-index-design-for-massive-data-scales}

В традиционных системах управления реляционными базами данных первичный индекс будет содержать одну запись на строку таблицы. Это приведет к тому, что первичный индекс будет содержать 8.87 миллионов записей для нашего набора данных. Такой индекс позволяет быстро находить конкретные строки, что приводит к высокой эффективности для запросов поиска и точечных обновлений. Поиск записи в структуре данных `B(+)-дерево` имеет среднюю временную сложность `O(log n)`; точнее, `log_b n = log_2 n / log_2 b`, где `b` — это коэффициент ветвления `B(+)-дерева`, а `n` — это количество индексированных строк. Поскольку `b` обычно находится между несколькими сотнями и несколькими тысячами, `B(+)-деревья` очень мелкие структуры, и для поиска записей требуется немного обращений к диску. С 8.87 миллионами строк и коэффициентом ветвления 1000 в среднем требуется 2.3 обращения к диску. Эта способность имеет свою цену: дополнительные затраты на диск и память, более высокие затраты на вставку при добавлении новых строк в таблицу и записей в индекс, а также иногда перераспределение B-дерева.

Учитывая проблемы, связанные с индексами B-дерева, движки таблиц в ClickHouse используют другой подход. Семейство [движков MergeTree](/engines/table-engines/mergetree-family/index.md) ClickHouse было разработано и оптимизировано для работы с большими объемами данных. Эти таблицы разработаны для получения миллионов вставок строк в секунду и хранения очень больших (сотни петабайт) объемов данных. Данные быстро записываются в таблицу [частями](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage), с применением правил для объединения частей в фоновом режиме. В ClickHouse каждая часть имеет свой собственный первичный индекс. Когда части объединяются, первичные индексы объединенной части также объединяются. На очень большом масштабе, для которого был разработан ClickHouse, крайне важно быть очень эффективным как по диску, так и по памяти. Поэтому вместо индексирования каждой строки первичный индекс для части имеет одно индексное значение (известное как 'метка') на группу строк (называемую 'гранулой') - эта техника называется **разреженным индексом**.

Разреженная индексация возможна, потому что ClickHouse хранит строки для части на диске в порядке, определяемом колонкой(ами) первичного ключа. Вместо того чтобы непосредственно находить отдельные строки (как в индексе на основе B-дерева), разреженный первичный индекс позволяет быстро (с помощью бинарного поиска по индексным записям) идентифицировать группы строк, которые могут соответствовать запросу. Найденные группы потенциально соответствующих строк (гранулы) затем параллельно передаются в движок ClickHouse для нахождения совпадений. Этот дизайн индекса позволяет первичному индексу быть небольшим (он может и должен полностью уместиться в основной памяти), при этом значительно ускоряя время выполнения запросов: особенно для диапазонных запросов, которые характерны для аналитических случаев использования данных.

Ниже показано, как ClickHouse строит и использует свой разреженный первичный индекс. Позже в статье мы обсудим некоторые лучшие практики выбора, удаления и сортировки колонок таблицы, используемых для построения индекса (колонок первичного ключа).
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
-- highlight-next-line
PRIMARY KEY (UserID, URL)
ORDER BY (UserID, URL, EventTime)
SETTINGS index_granularity = 8192, index_granularity_bytes = 0, compress_primary_key = 0;
```

[//]: # (<details open>)
<details>
    <summary>
    Подробности команды DDL
    </summary>
    <p>

Чтобы упростить дальнейшее обсуждение в этом руководстве, а также сделать диаграммы и результаты воспроизводимыми, команда DDL:

<ul>
  <li>
    Определяет составной ключ сортировки для таблицы через предложение <code>ORDER BY</code>.
  </li>
  <li>
    Явно контролирует, сколько записей индекса будет в первичном индексе через настройки:
    <ul>
      <li>
        <code>index_granularity</code>: явно задано по умолчанию 8192. Это означает, что для каждой группы из 8192 строк первичный индекс будет иметь одну запись индекса. Например, если таблица содержит 16384 строки, то индекс будет содержать две записи индекса.
      </li>
      <li>
        <code>index_granularity_bytes</code>: установлен в 0, чтобы отключить <a href="https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1" target="_blank">адаптивную гранулярность индекса</a>. Адаптивная гранулярность индекса означает, что ClickHouse автоматически создаёт одну запись индекса для группы из n строк, если истинно одно из следующих:
        <ul>
          <li>
            Если <code>n</code> меньше 8192, а размер объединенных данных строк для этих <code>n</code> строк больше или равен 10 МБ (значение по умолчанию для <code>index_granularity_bytes</code>).
          </li>
          <li>
            Если общий размер данных строк для <code>n</code> строк меньше 10 МБ, но <code>n</code> равно 8192.
          </li>
        </ul>
      </li>
      <li>
        <code>compress_primary_key</code>: установлен в 0, чтобы отключить <a href="https://github.com/ClickHouse/ClickHouse/issues/34437" target="_blank">сжатие первичного индекса</a>. Это позволит нам позже по желанию осмотреть его содержимое.
      </li>
    </ul>
  </li>
</ul>

</p>
</details>


Первичный ключ в приведенной выше команде DDL приводит к созданию первичного индекса на основе двух указанных ключевых колонок.

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
Ответ будет следующим:
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

Ответ будет:

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

- Данные таблицы хранятся в [широком формате](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) в определенной директории на диске, что означает, что для каждого столбца таблицы будет один файл данных (и один файл меток) в этой директории.
- Таблица содержит 8.87 миллионов строк.
- Не сжатый размер данных всех строк вместе составляет 733.28 МБ.
- Сжатый размер на диске всех строк вместе составляет 206.94 МБ.
- Таблица имеет первичный индекс с 1083 записями (называемыми 'метки'), а размер индекса составляет 96.93 КБ.
- В общей сложности данные таблицы и файлы меток, а также файл первичного индекса занимают 207.07 МБ на диске.
### Данные хранятся на диске в порядке колонок первичного ключа {#data-is-stored-on-disk-ordered-by-primary-key-columns}

Наша таблица, которую мы создали выше, имеет
- составной [первичный ключ](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)` и
- составной [ключ сортировки](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)`.

:::note
- Если бы мы указали только ключ сортировки, первичный ключ был бы неявно установлен равным ключу сортировки.

- Чтобы быть эффективным по памяти, мы явно указали первичный ключ, который включает только колонки, по которым наши запросы фильтруются. Первичный индекс, строящийся на основе первичного ключа, полностью загружается в основную память.

- Чтобы обеспечить последовательность в диаграммах руководства и максимизировать степень сжатия, мы определили отдельный ключ сортировки, который включает все колонки нашей таблицы (если в колонке находятся похожие данные, размещенные близко друг к другу, например, благодаря сортировке, то эти данные будут лучше сжиматься).

- Первичный ключ должен быть префиксом ключа сортировки, если оба указаны.
:::

Вставленные строки хранятся на диске в лексикографическом порядке (по возрастанию) по колонкам первичного ключа (а также дополнительной колонке `EventTime` из ключа сортировки).

:::note
ClickHouse позволяет вставлять несколько строк с одинаковыми значениями колонок первичного ключа. В этом случае (см. строку 1 и строку 2 на диаграмме ниже) окончательный порядок определяется указанным ключом сортировки и, следовательно, значением колонки `EventTime`.
:::


ClickHouse является <a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms" target="_blank">столбцовой системой управления базами данных</a>. Как показано на диаграмме ниже
- для представления на диске существует один файл данных (*.bin) для каждого колонки таблицы, где все значения для этой колонки хранятся в сжатом формате, и
- 8.87 миллионов строк хранятся на диске в лексикографическом порядке по колонкам первичного ключа (а также дополнительным колонкам сортировки), то есть в данном случае
  - сначала по `UserID`,
  - затем по `URL`,
  - и наконец по `EventTime`:

<Image img={sparsePrimaryIndexes01} size="md" alt="Разреженные первичные индексы 01" background="white"/>

`UserID.bin`, `URL.bin` и `EventTime.bin` — это файлы данных на диске, где хранятся значения колонок `UserID`, `URL` и `EventTime`.

:::note
- Поскольку первичный ключ определяет лексикографический порядок строк на диске, таблица может иметь только один первичный ключ.

- Мы нумеруем строки, начиная с 0, чтобы соответствовать внутренней схеме нумерации строк ClickHouse, которая также используется для сообщений журнала.
:::
### Данные организованы в гранулы для параллельной обработки данных {#data-is-organized-into-granules-for-parallel-data-processing}

Для целей обработки данных значения колонок таблицы логически делятся на гранулы. Гранула является наименьшим неделимым набором данных, который передается в ClickHouse для обработки. Это означает, что вместо считывания отдельных строк ClickHouse всегда считывает (потоком и параллельно) всю группу (гранулу) строк.
:::note
Значения колонок физически не хранятся внутри гранул: гранулы просто логическая организация значений колонок для обработки запросов.
:::

Следующая диаграмма показывает, как (значения колонок) 8.87 миллионов строк нашей таблицы организованы в 1083 гранулы в результате DDL команды таблицы, содержащей настройку `index_granularity` (установленную на значение по умолчанию 8192).

<Image img={sparsePrimaryIndexes02} size="md" alt="Разреженные первичные индексы 02" background="white"/>

Первые (на основе физического порядка на диске) 8192 строки (их значения колонок) логически принадлежат грануле 0, затем следующие 8192 строки (их значения колонок) принадлежат грануле 1 и так далее.

:::note
- Последняя гранула (гранула 1082) "содержит" менее 8192 строк.

- Мы упоминали в начале этого руководства в разделе "Подробности команды DDL", что мы отключили [адаптивную гранулярность индекса](/whats-new/changelog/2019.md/#experimental-features-1) (для упрощения обсуждений в этом руководстве, а также для воспроизводимости диаграмм и результатов).

  Поэтому все гранулы (кроме последней) в нашем примере таблицы имеют одинаковый размер.

- Для таблиц с адаптивной гранулярностью индекса (гранулярность индекса по умолчанию адаптивная) размер некоторых гранул может быть меньше 8192 строк в зависимости от размеров данных строк.

- Мы выделили некоторые значения колонок из наших колонок первичного ключа (`UserID`, `URL`) оранжевым цветом.
  Эти отмеченные оранжевым цветом значения колонок являются значениями колонок первичного ключа каждой первой строки каждой гранулы.
  Как мы увидим ниже, эти отмеченные оранжевым цветом значения колонок станут записями в первичном индексе таблицы.

- Мы нумеруем гранулы, начиная с 0, чтобы соответствовать внутренней нумерации ClickHouse, которая также используется для сообщений журнала.
:::
### Первичный индекс имеет одну запись на гранулу {#the-primary-index-has-one-entry-per-granule}

Первичный индекс создается на основе гранул, показанных на диаграмме выше. Этот индекс представляет собой несжатый плоский массив (primary.idx), содержащий так называемые числовые метки индекса, начиная с 0.

Диаграмма ниже показывает, что индекс хранит значения столбца первичного ключа (значения, отмеченные оранжевым на диаграмме выше) для каждой первой строки каждой гранулы. 
Или, другими словами: первичный индекс хранит значения столбца первичного ключа из каждой 8192-й строки таблицы (в соответствии с физическим порядком строк, определяемым столбцами первичного ключа). 
Например:
- первая запись индекса ('метка 0' на диаграмме ниже) хранит значения ключевых столбцов первой строки гранулы 0 из диаграммы выше,
- вторая запись индекса ('метка 1' на диаграмме ниже) хранит значения ключевых столбцов первой строки гранулы 1 из диаграммы выше, и так далее.

<Image img={sparsePrimaryIndexes03a} size="lg" alt="Sparse Primary Indices 03a" background="white"/>

Всего индекс имеет 1083 записи для нашей таблицы с 8,87 миллиона строк и 1083 гранулами:

<Image img={sparsePrimaryIndexes03b} size="md" alt="Sparse Primary Indices 03b" background="white"/>

:::note
- Для таблиц с [адаптивной гранулярностью индекса](/whats-new/changelog/2019.md/#experimental-features-1) также существует одна "финальная" дополнительная метка, хранящая значения столбцов первичного ключа последней строки таблицы, но поскольку мы отключили адаптивную гранулярность индекса (чтобы упростить обсуждения в этом руководстве, а также сделать диаграммы и результаты воспроизводимыми), индекс нашей примера таблицы не включает эту финальную метку.

- Файл первичного индекса полностью загружается в основную память. Если файл больше доступного свободного пространства в памяти, ClickHouse выдаст ошибку.
:::

<details>
    <summary>
    Исследование содержимого первичного индекса
    </summary>
    <p>

В самоуправляемом кластере ClickHouse мы можем использовать <a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">табличную функцию file</a> для изучения содержимого первичного индекса нашей примерной таблицы.

Для этого нам сначала нужно скопировать файл первичного индекса в <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a> узла из работающего кластера:
<ul>
<li>Шаг 1: Получите часть пути, содержащую файл первичного индекса</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

возвращает `/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4` на тестовой машине.

<li>Шаг 2: Получите user_files_path</li>
<a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">по умолчанию user_files_path</a> на Linux:
`/var/lib/clickhouse/user_files/`

и на Linux вы можете проверить, было ли это изменено: `$ grep user_files_path /etc/clickhouse-server/config.xml`

На тестовой машине путь `/Users/tomschreiber/Clickhouse/user_files/`


<li>Шаг 3: Скопируйте файл первичного индекса в user_files_path</li>

`cp /Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4/primary.idx /Users/tomschreiber/Clickhouse/user_files/primary-hits_UserID_URL.idx`

</ul>

<br/>
Теперь мы можем исследовать содержимое первичного индекса через SQL:
<ul>
<li>Получите количество записей</li>
`
SELECT count( )<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String');
`
возвращает `1083`

<li>Получите первые две метки индекса</li>
`
SELECT UserID, URL<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 0, 2;
`

возвращает

`
240923, http://showtopics.html%3...<br/>
4073710, http://mk.ru&pos=3_0
`

<li>Получите последнюю метку индекса</li>
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

Записи первичного ключа называются метками индекса, потому что каждая запись индекса определяет начало определенного диапазона данных. Конкретно для примерной таблицы:
- метки индекса UserID:

  Храненые значения `UserID` в первичном индексе отсортированы в порядке возрастания.<br/>
  'метка 1' на диаграмме выше таким образом указывает, что значения `UserID` всех строк таблицы в грануле 1, а также во всех последующих гранулах, гарантированно будут больше или равны 4.073.710.

 [Как мы увидим позже](#the-primary-index-is-used-for-selecting-granules), этот глобальный порядок позволяет ClickHouse <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">использовать алгоритм бинарного поиска</a> по меткам индекса для первого столбца ключа, когда запрос фильтруется по первому столбцу первичного ключа.

- метки индекса URL:

  Поскольку кардинальность столбцов первичного ключа `UserID` и `URL` достаточно схожа, метки индекса для всех ключевых столбцов после первого, как правило, только указывают на диапазон данных, пока значение предшествующего ключевого столбца остается неизменным для всех строк таблицы в пределах хотя бы текущей гранулы.<br/>
 Например, поскольку значения UserID метки 0 и 1 различны на диаграмме выше, ClickHouse не может предположить, что все значения URL всех строк таблицы в грануле 0 больше или равны `'http://showtopics.html%3...'`. Однако, если значения UserID метки 0 и 1 были бы одинаковыми на диаграмме выше (что означает, что значение UserID остается неизменным для всех строк таблицы внутри гранулы 0), ClickHouse мог бы предположить, что все значения URL всех строк таблицы в грануле 0 больше или равны `'http://showtopics.html%3...'`.

  Мы обсудим последствия этого для производительности выполнения запросов более подробно позже.
### Первичный индекс используется для выбора гранул {#the-primary-index-is-used-for-selecting-granules}

Теперь мы можем выполнять наши запросы с поддержкой первичного индекса.

В следующем запросе вычисляются 10 самых кликабельных URL для UserID 749927693.

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
740.18 КБ (1.53 миллиона строк/с., 138.59 МБ/с.)
```

Вывод для клиента ClickHouse теперь показывает, что вместо полного сканирования таблицы всего лишь 8.19 тысячи строк были отправлены в ClickHouse.

Если включено <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">логирование отслеживания</a>, то файл журнала сервера ClickHouse показывает, что ClickHouse выполнял <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">бинарный поиск</a> по 1083 меткам индекса UserID, чтобы определить гранулы, которые могут содержать строки со значением столбца UserID `749927693`. Это требует 19 шагов со средней временной сложностью `O(log2 n)`:
```response
...Executor): Условие по ключу: (столбец 0 в [749927693, 749927693])

# highlight-next-line
...Executor): Запуск бинарного поиска по диапазону индекса для части all_1_9_2 (1083 метки)
...Executor): Найдена (ЛЕВАЯ) граница метки: 176
...Executor): Найдена (ПРАВАЯ) граница метки: 177
...Executor): Найден непрерывный диапазон за 19 шагов
...Executor): Выбраны 1/1 частей по ключу партиционирования, 1 часть по первичному ключу,

# highlight-next-line
              1/1083 меток по первичному ключу, 1 метка для чтения из 1 диапазонов
...Чтение ...примерно 8192 строки, начиная с 1441792
```


Мы видим в журнале отслеживания выше, что одна метка из 1083 существующих меток удовлетворяла запросу.

<details>
    <summary>
    Подробности журнала отслеживания
    </summary>
    <p>

Метке 176 была присвоена идентификация (найденная левая граница метки является включительной, а найденная правая граница метки является исключительной), и поэтому все 8192 строки из гранулы 176 (которая начинается с строки 1.441.792 - мы увидим это позже в этом руководстве) затем передаются в ClickHouse, чтобы найти фактические строки со значением столбца UserID `749927693`.
</p>
</details>

Мы также можем воспроизвести это, используя <a href="https://clickhouse.com/docs/sql-reference/statements/explain/" target="_blank">клауза EXPLAIN</a> в нашем примерном запросе:
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
│ Выражение (Проекция)                                                                  │
│   Ограничение (предварительное LIMIT (без OFFSET))                                   │
│     Сортировка (Сортировка для ORDER BY)                                             │
│       Выражение (Перед ORDER BY)                                                     │
│         Агрегирование                                                                  │
│           Выражение (Перед GROUP BY)                                                 │
│             Фильтр (WHERE)                                                           │
│               УстановкаКвотИОграничений (Установить ограничения и квоты после чтения из хранилища) │
│                 ЧтениеИзMergeTree                                                     │
│                 Индексы:                                                               │
│                   ПервичныйКлюч                                                       │
│                     Ключи:                                                           │
│                       UserID                                                          │
│                     Условие: (UserID в [749927693, 749927693])                      │
│                     Части: 1/1                                                        │

# highlight-next-line
│                     Гранулы: 1/1083                                                  │
└───────────────────────────────────────────────────────────────────────────────────────┘

16 строк в наборе. Время выполнения: 0.003 сек.
```
Вывод клиента показывает, что одна из 1083 гранул была выбрана как возможно содержащая строки со значением столбца UserID 749927693.


:::note Заключение
Когда запрос фильтруется по столбцу, который является частью составного ключа и является первым ключевым столбцом, ClickHouse выполняет бинарный поиск по меткам индекса ключевого столбца.
:::

<br/>

Как обсуждалось выше, ClickHouse использует свой разреженный первичный индекс для быстрого (через бинарный поиск) выбора гранул, которые могут содержать строки, соответствующие запросу.

Это **первая стадия (выбор гранулы)** выполнения запроса ClickHouse.

На **второй стадии (чтение данных)** ClickHouse находит выбранные гранулы, чтобы передать все их строки в движок ClickHouse для поиска строк, которые фактически соответствуют запросу.

Мы обсудим эту вторую стадию более подробно в следующем разделе.
### Файлы меток используются для расположения гранул {#mark-files-are-used-for-locating-granules}

Следующая диаграмма иллюстрирует часть файла первичного индекса для нашей таблицы.

<Image img={sparsePrimaryIndexes04} size="md" alt="Sparse Primary Indices 04" background="white"/>

Как обсуждалось выше, через бинарный поиск по 1083 меткам UserID была идентифицирована метка 176. Соответствующая ей гранула 176 может, следовательно, содержать строки со значением столбца UserID 749.927.693.

<details>
    <summary>
    Подробности выбора гранул
    </summary>
    <p>

На диаграмме выше показано, что метка 176 является первой записью индекса, где минимальное значение UserID связанной гранулы 176 меньше 749.927.693, а минимальное значение UserID гранулы 177 для следующей метки (метка 177) больше этого значения. Таким образом, только соответствующая гранула 176 для метки 176 может содержать строки со значением столбца UserID 749.927.693.
</p>
</details>

Чтобы подтвердить (или опровергнуть), что в грануле 176 содержатся строки со значением столбца UserID 749.927.693, необходимо передать все 8192 строки, принадлежащие этой грануле, в ClickHouse.

Чтобы достичь этого, ClickHouse должен знать физическое расположение гранулы 176.

В ClickHouse физические расположения всех гранул для нашей таблицы хранятся в файлах меток. Аналогично файлам данных, для каждого столбца таблицы существует один файл меток.

Следующая диаграмма показывает три файла меток `UserID.mrk`, `URL.mrk` и `EventTime.mrk`, которые хранят физические расположения гранул для столбцов `UserID`, `URL` и `EventTime` таблицы.

<Image img={sparsePrimaryIndexes05} size="md" alt="Sparse Primary Indices 05" background="white"/>

Мы обсудили, как первичный индекс представляет собой плоский несжатый файл (primary.idx), содержащий метки индекса, которые нумеруются с 0.

Аналогично, файл меток также является плоским несжатым файлом (*.mrk), содержащим метки, которые нумеруются с 0.

После того как ClickHouse идентифицировал и выбрал метку индекса для гранулы, которая может содержать строки, соответствующие запросу, можно выполнить поиск по массиву позиций в файлах меток для получения физических расположений гранулы.

Каждая запись файла меток для конкретного столбца хранит два расположения в виде смещений:

- Первое смещение ('block_offset' на диаграмме выше) указывает на <a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">блок</a> в <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">сжатом</a> файле данных столбца, который содержит сжатую версию выбранной гранулы. Этот сжатый блок потенциально может содержать несколько сжатых гранул. Найденный сжатый блок файла распаковывается в основную память при чтении.

- Второе смещение ('granule_offset' на диаграмме выше) из файла меток предоставляет расположение гранулы внутри распакованного блока данных.

Все 8192 строки, принадлежащие найденной распакованной грануле, затем передаются в ClickHouse для дальнейшей обработки.

:::note

- Для таблиц с [широким форматом](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) и без [адаптивной гранулярности индекса](/whats-new/changelog/2019.md/#experimental-features-1) ClickHouse использует файлы меток `.mrk`, как показано выше, которые содержат записи с двумя адресами по 8 байт на запись. Эти записи информируют физические расположения гранул, которые все имеют одинаковый размер.

 Гранулярность индекса по умолчанию адаптивна [по умолчанию](/operations/settings/merge-tree-settings#index_granularity_bytes), но для нашей примерной таблицы мы отключили адаптивную гранулярность индекса (чтобы упростить обсуждения в этом руководстве, а также сделать диаграммы и результаты воспроизводимыми). Наша таблица использует широкий формат, поскольку размер данных больше [min_bytes_for_wide_part](/operations/settings/merge-tree-settings#min_bytes_for_wide_part) (которое по умолчанию составляет 10 МБ для самоуправляемых кластеров).

- Для таблиц с широким форматом и с адаптивной гранулярностью индекса ClickHouse использует файлы меток `.mrk2`, которые содержат аналогичные записи к `.mrk` файлам меток, но с дополнительным третьим значением на запись: количество строк гранулы, с которой связана текущая запись.

- Для таблиц с [компактным форматом](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) ClickHouse использует файлы меток `.mrk3`.

:::

:::note Почему файлы меток

Почему первичный индекс не содержит непосредственно физических расположений гранул, соответствующих меткам индекса?

Поскольку на том очень большом масштабе, для которого ClickHouse предназначен, важно быть очень эффективным в отношении дискового пространства и памяти.

Файл первичного индекса должен помещаться в основную память.

Для нашего примерного запроса ClickHouse воспользовался первичным индексом и выбрал единственную гранулу, которая может содержать строки, соответствующие нашему запросу. Только для этой одной гранулы ClickHouse затем нужно физическое расположение, чтобы передать соответствующие строки для дальнейшей обработки.

Кроме того, эта информация о смещении нужна только для столбцов UserID и URL.

Информация о смещении не нужна для столбцов, которые не используются в запросе, например, `EventTime`.

Для нашего примерного запроса ClickHouse нужны только два физических смещения для расположения гранулы 176 в файле данных UserID (UserID.bin) и два физических смещения для расположения гранулы 176 в файле данных URL (URL.bin).

Указание, предоставляемое файлами меток, позволяет избежать хранения непосредственно в первичном индексе записей для физических расположений всех 1083 гранул для всех трех столбцов: таким образом избегая хранения ненужных (возможно, неиспользуемых) данных в основной памяти.
:::

Следующая диаграмма и текст ниже иллюстрируют, как для нашего примерного запроса ClickHouse находит гранулу 176 в файле данных UserID.bin.

<Image img={sparsePrimaryIndexes06} size="md" alt="Sparse Primary Indices 06" background="white"/>

Мы ранее обсуждали в этом руководстве, что ClickHouse выбрал метку первичного индекса 176 и, следовательно, гранулу 176 как возможно содержащую строки, соответствующие нашему запросу.

Теперь ClickHouse использует выбраное число метки (176) из индекса для поиска по массиву позиций в файле меток UserID.mrk, чтобы получить два смещения для локализации гранулы 176.

Как показано, первое смещение указывает на сжатый блок файла в файле данных UserID.bin, который в свою очередь содержит сжатую версию гранулы 176.

После того как найденный блок файла распакован в основную память, второе смещение из файла меток можно использовать для нахождения гранулы 176 внутри распакованных данных.

ClickHouse необходимо локализовать (и передать все значения из) гранулы 176 из обоих файлов данных UserID.bin и URL.bin для выполнения нашего примерного запроса (10 самых кликабельных URL для интернет-пользователя с UserID 749.927.693).

На диаграмме выше показано, как ClickHouse находит гранулу для файла данных UserID.bin.

Параллельно ClickHouse делает также то же самое для гранулы 176 файла URL.bin. Две соответствующие гранулы синхронизируются и передаются в движок ClickHouse для дальнейшей обработки, т.е. агрегации и подсчета значений URL по группам для всех строк, где UserID равен 749.927.693, перед тем как в конечном итоге вывести 10 крупнейших групп URL в порядке убывания количества.
## Использование нескольких первичных индексов {#using-multiple-primary-indexes}

<a name="filtering-on-key-columns-after-the-first"></a>
### Вторичные ключевые столбцы могут (не) быть неэффективными {#secondary-key-columns-can-not-be-inefficient}

Когда запрос фильтруется по столбцу, который является частью составного ключа и является первым ключевым столбцом, [то ClickHouse выполняет бинарный поиск по меткам индекса ключевого столбца](#the-primary-index-is-used-for-selecting-granules).

Но что происходит, когда запрос фильтруется по столбцу, который является частью составного ключа, но не является первым ключевым столбцом?

:::note
Мы обсуждаем сценарий, когда запрос явно не фильтрует по первому ключевому столбцу, а по вторичному ключевому столбцу.

Когда запрос фильтрует по первому ключевому столбцу и по любым ключевым столбцам после первого, тогда ClickHouse выполняет бинарный поиск по меткам индекса первого ключевого столбца.
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
799.69 МБ (102.11 миллиона строк/с., 9.27 ГБ/с.)
```

Вывод клиента указывает на то, что ClickHouse практически выполнил полное сканирование таблицы, несмотря на то что [столбец URL является частью составного первичного ключа](#a-table-with-a-primary-key)! ClickHouse считывает 8.81 миллиона строк из 8.87 миллиона строк таблицы.

Если включено [trace_logging](/operations/server-configuration-parameters/settings#logger), то файл журнала сервера ClickHouse показывает, что ClickHouse использовал <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">поиск исключений</a> по 1083 меткам индекса URL, чтобы идентифицировать те гранулы, которые могут содержать строки со значением URL "http://public_search":
```response
...Executor): Условие по ключу: (столбец 1 в ['http://public_search',
                                           'http://public_search'])

# highlight-next-line
...Executor): Использован поиск исключений по индексу для части all_1_9_2
              с 1537 шагами
...Executor): Выбраны 1/1 частей по ключу партиционирования, 1 часть по первичному ключу,

# highlight-next-line
              1076/1083 меток по первичному ключу, 1076 меток для чтения из 5 диапазонов
...Executor): Чтение примерно 8814592 строк с 10 потоками
```
Мы видим в примере журнала следов выше, что 1076 (через метки) из 1083 гранул были выбраны как возможно содержащие строки с совпадающим значением URL.

Это приводит к тому, что 8.81 миллиона строк передается в движок ClickHouse (параллельно с использованием 10 потоков), чтобы идентифицировать строки, которые фактически содержат значение URL "http://public_search".

Тем не менее, как мы увидим позже, только 39 гранул из найденных 1076 гранул действительно содержат соответствующие строки.

Хотя первичный индекс, основанный на составном первичном ключе (UserID, URL), был очень полезен для ускорения запросов, фильтрующих строки с конкретным значением UserID, он не предоставляет значительной помощи в ускорении запроса, фильтрующего строки с конкретным значением URL.

Причина этого заключается в том, что столбец URL не является первым ключевым столбцом, и поэтому ClickHouse использует алгоритм поиска исключений (вместо бинарного поиска) по меткам индекса столбца URL, и **эффективность этого алгоритма зависит от разницы в кардинальности** между столбцом URL и его предшествующим ключевым столбцом UserID.

Чтобы это проиллюстрировать, мы предоставим некоторые детали о том, как работает поиск исключений.

<a name="generic-exclusion-search-algorithm"></a>
### Алгоритм поиска исключений {#generic-exclusion-search-algorithm}

Следующая схема иллюстрирует, как <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank">алгоритм поиска исключений ClickHouse</a> работает, когда гранулы выбираются по вторичному столбцу, где предшествующий ключевой столбец имеет низкую или высокую кардинальность.

В качестве примера для обеих случаев мы предполагаем:
- запрос, который ищет строки со значением URL = "W3".
- абстрактная версия нашей таблицы hits с упрощенными значениями для UserID и URL.
- такой же составной первичный ключ (UserID, URL) для индекса. Это означает, что строки сначала упорядочиваются по значениям UserID. Строки с одинаковым значением UserID затем упорядочиваются по URL.
- размер гранулы два, т.е. каждая гранула содержит две строки.

Мы отметили значения ключевых столбцов для первых строк таблицы для каждой гранулы оранжевым цветом на диаграммах ниже.

**Предшествующий ключевой столбец имеет низкую кардинальность**<a name="generic-exclusion-search-fast"></a>

Предположим, что UserID имеет низкую кардинальность. В этом случае вполне вероятно, что одно и то же значение UserID распределено по нескольким строкам таблицы и гранулам, и, следовательно, по меткам индекса. Для меток индекса с одинаковым UserID значения URL упорядочены по возрастанию (поскольку строки таблицы сначала упорядочиваются по UserID, а затем по URL). Это позволяет эффективно фильтровать, как описано ниже:

<Image img={sparsePrimaryIndexes07} size="md" alt="Sparse Primary Indices 06" background="white"/>

Существует три различные сценария для процесса выбора гранул для наших абстрактных данных, показанных на диаграмме выше:

1.  Метка индекса 0, для которой **значение URL меньше W3 и для которой значение URL непосредственно следующей метки также меньше W3**, может быть исключена, потому что метки 0 и 1 имеют одинаковое значение UserID. Обратите внимание, что это условие исключения гарантирует, что гранула 0 полностью состоит из значений UserID U1, так что ClickHouse может предположить, что максимальное значение URL в грануле 0 также будет меньше W3 и исключить гранулу.

2. Метка индекса 1, для которой **значение URL меньше (или равно) W3 и для которой значение URL следующей метки больше (или равно) W3**, выбирается, так как это означает, что гранула 1 может содержать строки с URL W3.

3. Метки 2 и 3, для которых **значение URL больше W3**, могут быть исключены, поскольку метки индекса первичного ключа хранят значения ключевых столбцов для первой строки таблицы для каждой гранулы, и строки таблицы упорядочиваются на диске по значениям ключевых столбцов, следовательно, гранулы 2 и 3 не могут содержать значение URL W3.

**Предшествующий ключевой столбец имеет высокую кардинальность**<a name="generic-exclusion-search-slow"></a>

Когда UserID имеет высокую кардинальность, маловероятно, что одно и то же значение UserID распределено по нескольким строкам таблицы и гранулам. Это означает, что значения URL для меток индекса не монотонно возрастают:

<Image img={sparsePrimaryIndexes08} size="md" alt="Sparse Primary Indices 06" background="white"/>

Как мы видим на диаграмме выше, все показанные метки, которые имеют значения URL меньше W3, выбираются для передачи строк их соответствующих гранул в движок ClickHouse.

Это происходит потому, что хотя все метки индекса на диаграмме подпадают под сценарий 1, описанный выше, они не соответствуют упомянутому условию исключения, что *непосредственно следующая метка имеет то же значение UserID, что и текущая метка*, и, следовательно, не могут быть исключены.

Например, рассмотрим метку индекса 0, для которой **значение URL меньше W3 и для которой значение URL следующей метки также меньше W3**. Эту метку *нельзя* исключить, потому что следующая метка 1 *не* имеет то же значение UserID как у текущей метки 0.

Это в конечном итоге препятствует ClickHouse в том, чтобы делать предположения о максимальном значении URL в грануле 0. Вместо этого он должен предположить, что гранула 0 потенциально может содержать строки со значением URL W3 и вынужден выбрать метку 0.

Та же сценария верна для меток 1, 2 и 3.

:::note Заключение
Алгоритм <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">поиска исключений</a>, который использует ClickHouse вместо <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">алгоритма бинарного поиска</a>, когда запрос фильтруется по столбцу, который является частью составного ключа, но не является первым ключевым столбцом, наиболее эффективен, когда предшествующий ключевой столбец имеет низкую кардинальность.
:::

В нашем наборе данных оба ключевых столбца (UserID, URL) имеют похожую высокую кардинальность, и, как объяснено, алгоритм поиска исключений не очень эффективен, когда предшествующий ключевой столбец URL имеет высокую или похожую кардинальность.
### Примечание о контроле доступа к данным {#note-about-data-skipping-index}

Из-за схожего высокого уровня кардинальности UserID и URL, наша [фильтрация запросов по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) также не принесла бы большой пользы от создания [вторичного индекса пропуска данных](./skipping-indexes.md) по колонке URL нашей [таблицы с составным первичным ключом (UserID, URL)](#a-table-with-a-primary-key).

Например, следующие два оператора создают и наполняют [индекс minmax](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) пропуска данных по колонке URL нашей таблицы:
```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```
ClickHouse теперь создал дополнительный индекс, который хранит - на группу из 4 последовательных [гранул](#data-is-organized-into-granules-for-parallel-data-processing) (обратите внимание наClause `GRANULARITY 4` в операторе `ALTER TABLE` выше) - минимальное и максимальное значение URL:

<Image img={sparsePrimaryIndexes13a} size="md" alt="Sparse Primary Indices 13a" background="white"/>

Первая запись в индексе ('mark 0' на диаграмме выше) хранит минимальные и максимальные значения URL для [строк, принадлежащих первым 4 гранулам нашей таблицы](#data-is-organized-into-granules-for-parallel-data-processing).

Вторая запись в индексе ('mark 1') хранит минимальные и максимальные значения URL для строк, принадлежащих следующим 4 гранулам нашей таблицы, и так далее.

(ClickHouse также создал специальный [файл меток](#mark-files-are-used-for-locating-granules) для индекса пропуска данных для [локализации](#mark-files-are-used-for-locating-granules) групп гранул, связанных с индексными метками.)

Из-за схожего высокого уровня кардинальности UserID и URL, этот вторичный индекс пропуска данных не может помочь в исключении гранул из выборки, когда выполняется наша [фильтрация запросов по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient).

Конкретное значение URL, которое ищет запрос (т.е. 'http://public_search'), вероятно, находится между минимальным и максимальным значением, хранящимся индексом для каждой группы гранул, в результате чего ClickHouse вынужден выбирать группу гранул (потому что они могут содержать строки, соответствующие запросу).
### Необходимость использования нескольких первичных индексов {#a-need-to-use-multiple-primary-indexes}

Следовательно, если мы хотим значительно ускорить наш тестовый запрос, который фильтрует строки с конкретным URL, нам необходимо использовать первичный индекс, оптимизированный для этого запроса.

Если мы также хотим сохранить хорошую производительность нашего тестового запроса, который фильтрует строки с конкретным UserID, тогда нам нужно использовать несколько первичных индексов.

В следующем показаны способы достижения этого.

<a name="multiple-primary-indexes"></a>
### Варианты создания дополнительных первичных индексов {#options-for-creating-additional-primary-indexes}

Если мы хотим значительно ускорить оба наших тестовых запроса - тот, который фильтрует строки с конкретным UserID и тот, который фильтрует строки с конкретным URL - тогда нам нужно использовать несколько первичных индексов, выбрав один из этих трех вариантов:

- Создание **второй таблицы** с другим первичным ключом.
- Создание **материализованного представления** на нашей существующей таблице.
- Добавление **проекции** в нашу существующую таблицу.

Все три варианта эффективно дублируют наши тестовые данные в дополнительной таблице, чтобы переорганизовать первичный индекс таблицы и порядок сортировки строк.

Однако три варианта отличаются по тому, насколько прозрачна эта дополнительная таблица для пользователя в отношении маршрутизации запросов и операторов вставки.

При создании **второй таблицы** с другим первичным ключом запросы должны быть явно отправлены в ту версию таблицы, которая лучше всего подходит для запроса, и новые данные должны быть явно вставлены в обе таблицы, чтобы поддерживать синхронизацию таблиц:

<Image img={sparsePrimaryIndexes09a} size="md" alt="Sparse Primary Indices 09a" background="white"/>

С помощью **материализованного представления** дополнительная таблица создается имплицитно, и данные автоматически синхронизируются между обеими таблицами:

<Image img={sparsePrimaryIndexes09b} size="md" alt="Sparse Primary Indices 09b" background="white"/>

А **проекция** является наиболее прозрачным вариантом, поскольку, помимо автоматического поддержания в синхронизации имплицитно созданной (и скрытой) дополнительной таблицы с изменениями данных, ClickHouse автоматически выберет наиболее эффективную версию таблицы для запросов:

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

Вставляем все 8.87 миллионов строк из нашей [оригинальной таблицы](#a-table-with-a-primary-key) в дополнительную таблицу:

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

Поскольку мы поменяли порядок колонок в первичном ключе, вставленные строки теперь хранятся на диске в другом лексикографическом порядке (по сравнению с нашей [оригинальной таблицей](#a-table-with-a-primary-key)), и поэтому также 1083 гранулы этой таблицы содержат другие значения, чем прежде:

<Image img={sparsePrimaryIndexes10} size="md" alt="Sparse Primary Indices 10" background="white"/>

Это результирующий первичный ключ:

<Image img={sparsePrimaryIndexes11} size="md" alt="Sparse Primary Indices 11" background="white"/>

Теперь этот ключ может использоваться для значительного ускорения выполнения нашего примера запроса с фильтрацией по колонке URL для вычисления топ-10 пользователей, которые чаще всего кликали по URL "http://public_search":
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

Теперь вместо [почти полной выборки таблицы](/guides/best-practices/sparse-primary-indexes#efficient-filtering-on-secondary-key-columns) ClickHouse выполнил этот запрос гораздо более эффективно.

С первичным индексом из [оригинальной таблицы](#a-table-with-a-primary-key), где UserID был первым, а URL - вторым ключевым столбцом, ClickHouse использовал [алгоритм поиска общего исключения](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) для выполнения этого запроса, что было не очень эффективно из-за схожего высокого уровня кардинальности UserID и URL.

С URL в качестве первого столбца в первичном индексе ClickHouse теперь выполняет <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">двоичный поиск</a> по индексным меткам.
Соответствующий лог трассировки в файле журнала сервера ClickHouse подтверждает это:
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
ClickHouse выбрал только 39 индексных меток, вместо 1076, когда использовался общий поиск исключений.

Обратите внимание, что дополнительная таблица оптимизирована для ускорения выполнения нашего примера запроса с фильтрацией по `UserIDs`, и для ускорения запросов с фильтрацией по URL соответственно:
### Вариант 2: Материализованные виды {#option-2-materialized-views}

Создаем [материализованный вид](/sql-reference/statements/create/view.md) на нашей существующей таблице.
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
- мы поменяли порядок ключевых колонок (по сравнению с нашей [оригинальной таблицей](#a-table-with-a-primary-key)) в первичном ключе представления
- материализованный вид поддерживается **имплицитно созданной таблицей**, порядок строк и первичный индекс которой основаны на заданном определении первичного ключа
- имплицитно созданная таблица отображается в результате запроса `SHOW TABLES` и имеет имя, начинающееся на `.inner`
- также возможно сначала явно создать таблицу, поддерживающую материализованный вид, а затем вид может ссылаться на эту таблицу с помощью [клаузы TO [db].[table]](/sql-reference/statements/create/view.md)
- мы используем ключевое слово `POPULATE`, чтобы немедленно заполнить имплицитно созданную таблицу всеми 8.87 миллионами строк из исходной таблицы [hits_UserID_URL](#a-table-with-a-primary-key)
- если новые строки будут вставлены в исходную таблицу hits_UserID_URL, то эти строки автоматически также будут вставляться в имплицитно созданную таблицу
- Фактически имплицитно созданная таблица имеет такой же порядок строк и первичный индекс, что и [вторичная таблица, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables):

<Image img={sparsePrimaryIndexes12b1} size="md" alt="Sparse Primary Indices 12b1" background="white"/>

ClickHouse хранит [файлы данных колонок](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin), [файлы меток](#mark-files-are-used-for-locating-granules) (*.mrk2) и [первичный индекс](#the-primary-index-has-one-entry-per-granule) (primary.idx) имплицитно созданной таблицы в специальной папке в каталоге данных сервера ClickHouse:

<Image img={sparsePrimaryIndexes12b2} size="md" alt="Sparse Primary Indices 12b2" background="white"/>

:::

Теперь имплицитно созданную таблицу (и ее первичный индекс), поддерживающую материализованный вид, можно использовать для значительного ускорения выполнения нашего примера запроса с фильтрацией по колонке URL:
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

Фактически имплицитно созданная таблица (и ее первичный индекс), поддерживающие материализованный вид, идентичны [вторичной таблице, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables), поэтому запрос выполняется так же эффективно, как с явно созданной таблицей.

Соответствующий лог трассировки в файле журнала сервера ClickHouse подтверждает, что ClickHouse выполняет двоичный поиск по индексным меткам:

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
- проекция создает **скрытую таблицу**, порядок строк и первичный индекс которой основаны на данной клаузе `ORDER BY` проекции
- скрытая таблица не отображается в результате запроса `SHOW TABLES`
- мы используем ключевое слово `MATERIALIZE`, чтобы немедленно заполнить скрытую таблицу всеми 8.87 миллионами строк из исходной таблицы [hits_UserID_URL](#a-table-with-a-primary-key)
- если новые строки будут вставлены в исходную таблицу hits_UserID_URL, то эти строки автоматически также будут вставляться в скрытую таблицу
- запрос всегда (по синтаксису) нацелен на исходную таблицу hits_UserID_URL, но если порядок строк и первичный индекс скрытой таблицы позволяют более эффективное выполнение запроса, то эта скрытая таблица будет использоваться вместо этого
- пожалуйста, обратите внимание, что проекции не делают запросы, использующие ORDER BY, более эффективными, даже если ORDER BY соответствует оператору ORDER BY проекции (см. https://github.com/ClickHouse/ClickHouse/issues/47333)
- Фактически имплицитно созданная скрытая таблица имеет такой же порядок строк и первичный индекс, что и [вторичная таблица, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables):

<Image img={sparsePrimaryIndexes12c1} size="md" alt="Sparse Primary Indices 12c1" background="white"/>

ClickHouse хранит [файлы данных колонок](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin), [файлы меток](#mark-files-are-used-for-locating-granules) (*.mrk2) и [первичный индекс](#the-primary-index-has-one-entry-per-granule) (primary.idx) скрытой таблицы в специальной папке (обозначенной оранжевым цветом на скриншоте ниже) рядом с файлами данных, файлами меток и первичными индексными файлами исходной таблицы:

<Image img={sparsePrimaryIndexes12c2} size="sm" alt="Sparse Primary Indices 12c2" background="white"/>

:::

Теперь скрытую таблицу (и ее первичный индекс), созданную проекцией, можно (имплицитно) использовать для значительного ускорения выполнения нашего примера запроса с фильтрацией по колонке URL. Обратите внимание, что запрос по синтаксису нацелен на исходную таблицу проекции.
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
Processed 319.49 thousand rows,
11.38 MB (11.05 million rows/s., 393.58 MB/s.)
```

Фактически скрытая таблица (и ее первичный индекс), созданные проекцией, идентичны [вторичной таблице, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables), поэтому запрос выполняется так же эффективно, как с явно созданной таблицей.

Соответствующий лог трассировки в файле журнала сервера ClickHouse подтверждает, что ClickHouse выполняет двоичный поиск по индексным меткам:

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

Первичный индекс нашей [таблицы с составным первичным ключом (UserID, URL)](#a-table-with-a-primary-key) был очень полезен для ускорения [запроса фильтрации по UserID](#the-primary-index-is-used-for-selecting-granules). Но этот индекс не предоставляет значительной помощи в ускорении [запроса фильтрации по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient), несмотря на то, что колонка URL является частью составного первичного ключа.

И наоборот:
Первичный индекс нашей [таблицы с составным первичным ключом (URL, UserID)](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) ускорял [запрос фильтрации по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient), но не предоставлял много поддержки для [запроса фильтрации по UserID](#the-primary-index-is-used-for-selecting-granules).

Из-за схожего высокого уровня кардинальности столбцов первичного ключа UserID и URL, запрос, который фильтрует по второму ключевому столбцу, [не приносит много пользы от нахождения второго ключевого столбца в индексе](#generic-exclusion-search-algorithm).

Поэтому имеет смысл убрать второй ключевой столбец из первичного индекса (что приведет к меньшему потреблению памяти индекса) и [использовать несколько первичных индексов](/guides/best-practices/sparse-primary-indexes#using-multiple-primary-indexes) вместо этого.

Однако если ключевые столбцы в составном первичном ключе имеют большие различия в кардинальности, то [это полезно для запросов](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm), чтобы сортировать ключевые столбцы по кардинальности в порядке возрастания.

Чем больше разница в кардинальности между ключевыми столбцами, тем больше имеет значение порядок этих столбцов в ключе. Мы продемонстрируем это в следующем разделе.
## Эффективная сортировка ключевых столбцов {#ordering-key-columns-efficiently}

<a name="test"></a>

В составном первичном ключе порядок ключевых столбцов может значительно влиять как на:
- эффективность фильтрации по вторичным ключевым столбцам в запросах, так и
- коэффициент сжатия для файлов данных таблицы.

Чтобы продемонстрировать это, мы используем версию нашего [набора данных веб-трафика](#data-set), где каждая строка содержит три столбца, которые указывают, помечено ли обращение интернет-'пользователя' (столбец `UserID`) к URL (столбец `URL`) как бот-трафик (столбец `IsRobot`).

Мы используем составной первичный ключ, содержащий все три вышеуказанных столбца, который может быть использован для ускорения типичных запросов веб-аналитики, которые вычисляют
- какую долю (в процентах) трафика к конкретному URL составляют боты, или
- насколько уверены мы в том, что конкретный пользователь является (не является) ботом (какая доля трафика от этого пользователя не предполагается как бот-трафик)

Мы используем этот запрос для вычисления кардинальностей трех столбцов, которые мы хотим использовать в качестве ключевых столбцов в составном первичном ключе (обратите внимание, что мы используем [функцию таблицы URL](/sql-reference/table-functions/url.md) для запроса TSV-данных по запросу без необходимости создания локальной таблицы). Выполните этот запрос в `clickhouse client`:
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

Мы можем видеть, что между кардинальностями есть большая разница, особенно между колонками `URL` и `IsRobot`, и поэтому порядок этих колонок в составном первичном ключе имеет значение как для эффективного ускорения запросов, фильтрующих по этим колонкам, так и для достижения оптимальных коэффициентов сжатия для файлов данных колонок таблицы.

Чтобы продемонстрировать это, мы создаем две версии таблицы для анализа трафика ботов:
- таблицу `hits_URL_UserID_IsRobot` с составным первичным ключом `(URL, UserID, IsRobot)`, где мы упорядочиваем ключевые колонки по кардинальности по убыванию
- таблицу `hits_IsRobot_UserID_URL` с составным первичным ключом `(IsRobot, UserID, URL)`, где мы упорядочиваем ключевые колонки по кардинальности по возрастанию

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

И заполните ее 8.87 миллионами строк:
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

Когда запрос фильтрует хотя бы по одной колонке, которая является частью составного ключа и является первым ключевым столбцом, [то ClickHouse выполняет алгоритм двоичного поиска по индексным меткам ключевого столбца](#the-primary-index-is-used-for-selecting-granules).

Когда запрос фильтрует (только) по колонке, которая является частью составного ключа, но не является первым ключевым столбцом, [то ClickHouse использует алгоритм общего исключения по индексным меткам ключевого столбца](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient).

Для второго случая порядок ключевых столбцов в составном первичном ключе имеет значение для эффективности [алгоритма общего исключения](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444).

Это запрос, фильтрующий по столбцу `UserID` таблицы, где мы упорядочили ключевые столбцы `(URL, UserID, IsRobot)` по кардинальности по убыванию:
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

Это тот же самый запрос на таблице, где мы упорядочили ключевые столбцы `(IsRobot, UserID, URL)` по кардинальности по возрастанию:
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

Мы видим, что выполнение запроса значительно эффективнее и быстрее на таблице, где мы упорядочили ключевые столбцы по кардинальности по возрастанию.

Причина этому заключается в том, что [алгоритм общего исключения](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444) наиболее эффективно работает, когда [гранулы](#the-primary-index-is-used-for-selecting-granules) выбираются через вторичный ключевой столбец, где предшествующий ключевой столбец имеет более низкую кардинальность. Мы подробнее проиллюстрировали это в [предыдущем разделе](#generic-exclusion-search-algorithm) этого руководства.
### Оптимальное отношение сжатия файлов данных {#optimal-compression-ratio-of-data-files}

Этот запрос сравнивает отношение сжатия колонки `UserID` между двумя таблицами, которые мы создали выше:

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

2 строки в наборе. Затраченное время: 0.006 сек.
```
Мы видим, что отношение сжатия для колонки `UserID` значительно выше для таблицы, где мы упорядочили ключевые колонки `(IsRobot, UserID, URL)` по кардинальности в порядке возрастания.

Хотя в обеих таблицах хранится точно одно и то же значение (мы вставили одинаковые 8.87 миллионов строк в обе таблицы), порядок ключевых колонок в составном первичном ключе оказывает значительное влияние на то, сколько дискового пространства требуется для <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">сжатых</a> данных в [файлах данных колонок](#data-is-stored-on-disk-ordered-by-primary-key-columns) таблицы:
- в таблице `hits_URL_UserID_IsRobot` с составным первичным ключом `(URL, UserID, IsRobot)`, где мы упорядочиваем ключевые колонки по кардинальности в порядке убывания, файл данных `UserID.bin` занимает **11.24 MiB** дискового пространства
- в таблице `hits_IsRobot_UserID_URL` с составным первичным ключом `(IsRobot, UserID, URL)`, где мы упорядочиваем ключевые колонки по кардинальности в порядке возрастания, файл данных `UserID.bin` занимает всего **877.47 KiB** дискового пространства

Хорошее отношение сжатия для данных колонки таблицы на диске не только экономит дисковое пространство, но и делает запросы (особенно аналитические), которые требуют чтения данных из этой колонки, быстрее, так как требуется меньше ввода-вывода для перемещения данных колонки с диска в основную память (кэш файлов операционной системы).

В следующем разделе мы иллюстрируем, почему полезно для отношения сжатия колонок таблицы упорядочивать первичные ключевые колонки по кардинальности в порядке возрастания.

Диаграмма ниже схематически изображает порядок строк на диске для первичного ключа, где ключевые колонки упорядочены по кардинальности в порядке возрастания:

<Image img={sparsePrimaryIndexes14a} size="md" alt="Sparse Primary Indices 14a" background="white"/>

Мы обсудили, что [данные строк таблицы хранятся на диске упорядоченными по ключевым колонкам первичного ключа](#data-is-stored-on-disk-ordered-by-primary-key-columns).

На диаграмме выше строки таблицы (их значения колонок на диске) сначала упорядочены по значению `cl`, а строки с одинаковым значением `cl` упорядочены по значению `ch`. И поскольку первая ключевая колонка `cl` имеет низкую кардинальность, вероятно, что существуют строки с одинаковым значением `cl`. И именно поэтому значения `ch` тоже вероятно упорядочены (локально - для строк с одинаковым значением `cl`).

Если в колонке подобные данные расположены близко друг к другу, например, за счет сортировки, то такие данные будут сжиматься лучше.
В целом, алгоритм сжатия выигрывает от длины последовательности данных (чем больше данных он видит, тем лучше для сжатия) и локальности (чем более схожи данные, тем лучше отношение сжатия).

В отличие от диаграммы выше, диаграмма ниже схематически изображает порядок строк на диске для первичного ключа, где ключевые колонки упорядочены по кардинальности в порядке убывания:

<Image img={sparsePrimaryIndexes14b} size="md" alt="Sparse Primary Indices 14b" background="white"/>

Теперь строки таблицы сначала упорядочены по значению `ch`, а строки с одинаковым значением `ch` упорядочены по значению `cl`.
Но поскольку первая ключевая колонка `ch` имеет высокую кардинальность, маловероятно, что существуют строки с одинаковым значением `ch`. И именно поэтому также маловероятно, что значения `cl` будут упорядочены (локально - для строк с одинаковым значением `ch`).

Таким образом, значения `cl` скорее всего находятся в случайном порядке и, следовательно, обладают плохой локальностью и, соответственно, отношением сжатия. 
### Резюме {#summary-1}

Как для эффективной фильтрации по вторичным ключевым колонкам в запросах, так и для отношения сжатия файлов данных колонки таблицы полезно упорядочивать колонки в первичном ключе по их кардинальности в порядке возрастания.
### Связанный контент {#related-content-1}
- Блог: [Ускоряем ваши запросы в ClickHouse](https://clickhouse.com/blog/clickhouse-faster-queries-with-projections-and-primary-indexes)
## Эффективная идентификация одиночных строк {#identifying-single-rows-efficiently}

Хотя в общем это [не](/knowledgebase/key-value) лучший случай для ClickHouse,
иногда приложения, построенные на основе ClickHouse, требуют идентификации одиночных строк таблицы ClickHouse.

Интуитивное решение для этого может заключаться в использовании колонки [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) с уникальным значением для каждой строки, а для быстрой выборки строк использовать эту колонку как первичный ключ.

Для самой быстрой выборки колонка UUID [должна быть первой ключевой колонкой](#the-primary-index-is-used-for-selecting-granules).

Мы обсудили, что поскольку [данные строк таблицы ClickHouse хранятся на диске упорядоченными по колонкам первичного ключа](#data-is-stored-on-disk-ordered-by-primary-key-columns), наличие колонки с очень высокой кардинальностью (как колонка UUID) в первичном ключе или в составном первичном ключе перед колонками с низкой кардинальностью [вредно для отношения сжатия других колонок таблицы](#optimal-compression-ratio-of-data-files).

Компромисс между самой быстрой выборкой и оптимальным сжатием данных заключается в использовании составного первичного ключа, где UUID является последней ключевой колонкой, после колонок с более низкой кардинальностью, которые используются для обеспечения хорошего отношения сжатия для некоторых колонок таблицы.
### Конкретный пример {#a-concrete-example}

Одним конкретным примером является текстовый сервис paste https://pastila.nl, который разработал Алексей Миловидов и [писал о нем в блоге](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/).

При каждом изменении в текстовом поле данные автоматически сохраняются в строку таблицы ClickHouse (одна строка на каждое изменение).

И одним из способов идентификации и получения (определенной версии) вставленного содержимого является использование хеша содержимого в качестве UUID для строки таблицы, которая содержит это содержимое.

Следующая диаграмма показывает
- порядок вставки строк при изменении содержимого (например, из-за нажатий клавиш при вводе текста в текстовое поле) и
- порядок на диске данных из вставленных строк, когда используется `PRIMARY KEY (hash)`:

<Image img={sparsePrimaryIndexes15a} size="md" alt="Sparse Primary Indices 15a" background="white"/>

Поскольку колонка `hash` используется как колонка первичного ключа
- конкретные строки могут быть получены [очень быстро](#the-primary-index-is-used-for-selecting-granules), но
- строки таблицы (их данные колонок) хранятся на диске в порядке возрастания (уникальных и случайных) значений хеша. Поэтому значения колонки содержимого также хранятся в случайном порядке без локальности данных, что приводит к **подоптимальному отношению сжатия для файла данных колонки содержимого**.

Для значительного улучшения отношения сжатия для колонки содержимого при этом все еще обеспечивая быструю выборку конкретных строк, сервис pastila.nl использует два хеша (и составной первичный ключ) для идентификации конкретной строки:
- хеш содержимого, как обсуждалось выше, который уникален для разных данных, и
- [локально-чувствительный хеш (отпечаток)](https://en.wikipedia.org/wiki/Locality-sensitive_hashing), который **не** изменяется при небольших изменениях данных.

Следующая диаграмма показывает
- порядок вставки строк при изменении содержимого (например, из-за нажатий клавиш при вводе текста в текстовое поле) и
- порядок на диске данных из вставленных строк, когда используется составной `PRIMARY KEY (fingerprint, hash)`:

<Image img={sparsePrimaryIndexes15b} size="md" alt="Sparse Primary Indices 15b" background="white"/>

Теперь строки на диске сначала упорядочены по `fingerprint`, и для строк с одинаковым значением fingerprint их значение `hash` определяет окончательный порядок.

Поскольку данные, которые отличаются лишь небольшими изменениями, получают одинаковое значение fingerprint, подобные данные теперь хранятся на диске близко друг к другу в колонке содержимого. И это очень хорошо для отношения сжатия колонки содержимого, так как алгоритм сжатия в целом выигрывает от локальности данных (чем более схожи данные, тем лучше отношение сжатия).

Компромисс заключается в том, что для выборки конкретной строки необходимы два поля (`fingerprint` и `hash`), чтобы оптимально использовать первичный индекс, который возникает из составного `PRIMARY KEY (fingerprint, hash)`.
