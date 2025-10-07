---
'sidebar_label': 'Первичные индексы'
'sidebar_position': 1
'description': 'В этом руководстве мы собираемся углубиться в индексацию ClickHouse.'
'title': 'Практическое введение в первичные индексы в ClickHouse'
'slug': '/guides/best-practices/sparse-primary-indexes'
'show_related_blogs': true
'doc_type': 'guide'
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
- [какие лучшие практики существуют для индексации в ClickHouse](#using-multiple-primary-indexes)

Вы можете по желанию выполнить все SQL-запросы и команды ClickHouse, приведенные в этом руководстве, на своем собственном компьютере. Для установки ClickHouse и инструкций по началу работы, смотрите [Быстрый старт](/get-started/quick-start).

:::note
Это руководство сосредоточено на разреженных первичных индексах ClickHouse.

Для [вторичных индексов пропуска данных](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes) ClickHouse, смотрите [Учебное пособие](/guides/best-practices/skipping-indexes.md).
:::
### Набор данных {#data-set}

На протяжении этого руководства мы будем использовать набор данных анонимизированного веб-трафика.

- Мы будем использовать подмножество из 8,87 миллиона строк (событий) из образца данных.
- Не сжатый размер данных составляет 8,87 миллиона событий и около 700 MB. При хранении в ClickHouse он сжимается до 200 MB.
- В нашем подмножестве каждая строка содержит три колонки, которые указывают на интернет-пользователя (колонка `UserID`), который кликнул по URL (колонка `URL`) в определенное время (колонка `EventTime`).

С этими тремя колонками мы уже можем сформулировать некоторые типичные запросы веб-аналитики, такие как:

- "Какие 10 URL были наиболее часто кликаемы для конкретного пользователя?"
- "Какие 10 пользователей чаще всего кликали по конкретному URL?"
- "В какое время (например, дни недели) пользователь чаще всего кликает по конкретному URL?"
### Тестовая машина {#test-machine}

Все временные величины, указанные в этом документе, основаны на работе ClickHouse 22.2.1 локально на MacBook Pro с процессором Apple M1 Pro и 16 ГБ ОЗУ.
### Полное сканирование таблицы {#a-full-table-scan}

Чтобы увидеть, как выполняется запрос по нашему набору данных без первичного ключа, мы создаем таблицу (с движком таблицы MergeTree), выполняя следующее DDL-утверждение:

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

Следующим шагом вставляем подмножество данных о кликах в таблицу с помощью следующего SQL-утверждения insert. Это использует [табличную функцию URL](/sql-reference/table-functions/url.md), чтобы загрузить подмножество полного набора данных, размещенного удаленно на clickhouse.com:

```sql
INSERT INTO hits_NoPrimaryKey SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```
Ответ выглядит следующим образом:
```response
Ok.

0 rows in set. Elapsed: 145.993 sec. Processed 8.87 million rows, 18.40 GB (60.78 thousand rows/s., 126.06 MB/s.)
```

Результат, выведенный клиентом ClickHouse, показывает, что данное утверждение вставило в таблицу 8,87 миллиона строк.

Наконец, чтобы упростить обсуждение в дальнейшем в данном руководстве и сделать диаграммы и результаты воспроизводимыми, мы [оптимизируем](/sql-reference/statements/optimize.md) таблицу, используя ключевое слово FINAL:

```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
В общем, не требуется и не рекомендуется немедленно оптимизировать таблицу после загрузки в нее данных. Почему это необходимо для этого примера станет очевидным.
:::

Теперь мы выполняем наш первый запрос веб-аналитики. Следующий запрос вычисляет 10 наиболее кликаемых URL для интернет-пользователя с UserID 749927693:

```sql
SELECT URL, count(URL) AS Count
FROM hits_NoPrimaryKey
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```
Ответ выглядит следующим образом:
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

Вывод результата клиента ClickHouse указывает на то, что ClickHouse выполнил полное сканирование таблицы! Каждая отдельная строка из 8,87 миллиона строк нашей таблицы была загружена в ClickHouse. Это масштабируемо не работает.

Чтобы сделать это (значительно) более эффективным и (значительно) быстрее, нам нужно использовать таблицу с соответствующим первичным ключом. Это позволит ClickHouse автоматически (на основе колонок первичного ключа) создать разреженный первичный индекс, который затем можно использовать для значительного ускорения выполнения нашего примера запроса.
## Проектирование индексов в ClickHouse {#clickhouse-index-design}
### Проектирование индекса для больших объемов данных {#an-index-design-for-massive-data-scales}

В традиционных системах управления реляционными базами данных первичный индекс будет содержать одну запись на каждую строку таблицы. В результате первичный индекс будет содержать 8,87 миллиона записей для нашего набора данных. Такой индекс позволяет быстро находить конкретные строки, что обеспечивает высокую эффективность для запросов поиска и точечных обновлений. Поиск записи в структуре данных `B(+)-Tree` имеет среднюю временную сложность `O(log n)`; точнее, `log_b n = log_2 n / log_2 b`, где `b` — это коэффициент разветвления `B(+)-Tree`, а `n` — количество индексированных строк. Поскольку `b` обычно составляет от нескольких сотен до нескольких тысяч, `B(+)-Trees` очень мелкие структуры, и для нахождения записей требуется немного обращений к диску. При 8,87 миллиона строк и коэффициенте разветвления 1000 требуется в среднем 2,3 обращения к диску. Эта возможность имеет свою цену: дополнительные накладные расходы на диск и память, более высокие расходы на вставку при добавлении новых строк в таблицу и записей в индекс, а также иногда перераспределение B-Tree.

Учитывая проблемы, связанные с индексами B-Tree, движки таблиц в ClickHouse используют другой подход. [Семейство движков MergeTree](/engines/table-engines/mergetree-family/index.md) ClickHouse было разработано и оптимизировано для обработки огромных объемов данных. Эти таблицы предназначены для получения миллионов вставок строк в секунду и хранения очень больших объемов данных (сотни петабайт). Данные быстро записываются в таблицу [по частям](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage), с правилами, применяемыми для слияния частей в фоновом режиме. В ClickHouse каждая часть имеет свой собственный первичный индекс. Когда части сливаются, первичные индексы объединенных частей также сливаются. На очень больших масштабах, для которых предназначен ClickHouse, крайне важно быть эффективным в использовании диска и памяти. Поэтому, вместо индексации каждой строки, первичный индекс для части имеет одну запись индекса (известную как 'метка') на группу строк (называемую 'гранулой') — эта техника называется **разреженным индексом**.

Разреженная индексация возможна, поскольку ClickHouse хранит строки для части на диске в порядке, определенном колонками первичного ключа. Вместо того, чтобы напрямую находить отдельные строки (как в индексе на основе B-Tree), разреженный первичный индекс позволяет быстро (с помощью бинарного поиска по записям индекса) идентифицировать группы строк, которые могут соответствовать запросу. Найденные группы потенциально совпадающих строк (гранулы) затем параллельно передаются в движок ClickHouse для поиска соответствий. Этот дизайн индекса позволяет держать первичный индекс маленьким (он может и должен полностью помещаться в основной памяти), при этом значительно ускоряя время выполнения запросов: особенно для диапазонных запросов, которые характерны для аналитики данных.

Следующее подробно иллюстрирует, как ClickHouse строит и использует свой разреженный первичный индекс. Позже в статье мы обсудим некоторые лучшие практики для выбора, удаления и упорядочивания колонок таблицы, которые используются для построения индекса (колонок первичного ключа).
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
    Подробности DDL утверждения
    </summary>
    <p>

Чтобы упростить обсуждения позже в этом руководстве, а также сделать диаграммы и результаты воспроизводимыми, DDL-утверждение:

<ul>
  <li>
    Указывает составной ключ сортировки для таблицы через <code>ORDER BY</code>.
  </li>
  <li>
    Явно контролирует, сколько записей индекса будет у первичного индекса через настройки:
    <ul>
      <li>
        <code>index_granularity</code>: явно установлено на значение по умолчанию 8192. Это означает, что для каждой группы из 8192 строк первичный индекс будет иметь одну запись индекса. Например, если в таблице 16384 строки, индекс будет иметь две записи индекса.
      </li>
      <li>
        <code>index_granularity_bytes</code>: установлено в 0, чтобы отключить <a href="https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1" target="_blank">адаптивную гранулярность индекса</a>. Адаптивная гранулярность индекса означает, что ClickHouse автоматически создает одну запись индекса для группы из n строк, если выполняется одно из следующих условий:
        <ul>
          <li>
            Если <code>n</code> меньше 8192, и размер комбинированных данных строки для этих <code>n</code> строк больше или равен 10 MB (значение по умолчанию для <code>index_granularity_bytes</code>).
          </li>
          <li>
            Если комбинированный размер данных строки для <code>n</code> строк меньше 10 MB, но <code>n</code> равно 8192.
          </li>
        </ul>
      </li>
      <li>
        <code>compress_primary_key</code>: установлено в 0, чтобы отключить <a href="https://github.com/ClickHouse/ClickHouse/issues/34437" target="_blank">сжатие первичного индекса</a>. Это позволит нам по желанию позже просмотреть его содержимое.
      </li>
    </ul>
  </li>
</ul>

</p>
</details>

Первичный ключ в DDL-утверждении выше вызывает создание первичного индекса на основе двух указанных ключевых колонок.

<br/>
Следующий шаг — вставить данные:

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

Ответ выглядит следующим образом:

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

- Данные таблицы хранятся в [широком формате](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) в конкретном каталоге на диске, что означает, что будет один файл данных (и один файл меток) на каждую колонку таблицы внутри этого каталога.
- В таблице 8,87 миллиона строк.
- Не сжатый размер данных всех строк вместе составляет 733,28 MB.
- Сжатый размер на диске всех строк вместе составляет 206,94 MB.
- В таблице есть первичный индекс с 1083 записями (называемыми 'метками'), и размер индекса составляет 96,93 KB.
- В общей сложности файлы данных таблицы и метки, а также файл первичного индекса занимают 207,07 MB на диске.
### Данные хранятся на диске в порядке колонок первичного ключа {#data-is-stored-on-disk-ordered-by-primary-key-columns}

Наша таблица, которую мы создали выше, имеет
- составной [первичный ключ](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)` и
- составной [ключ сортировки](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)`.

:::note
- Если бы мы указали только ключ сортировки, тогда первичный ключ был бы неявно определен равным ключу сортировки.

- Чтобы быть эффективным в использовании памяти, мы явно указали первичный ключ, который содержит только колонки, по которым наши запросы выполняют фильтрацию. Первичный индекс, основанный на первичном ключе, полностью загружен в основную память.

- Чтобы иметь согласованность в диаграммах руководства и максимизировать коэффициент сжатия, мы определили отдельный сортировочный ключ, который включает все колонки нашей таблицы (если в колонке похожие данные располагаются близко друг к другу, например, путем сортировки, тогда эти данные будут лучше сжиматься).

- Первичный ключ должен быть префиксом сортировочного ключа, если оба указаны.
:::

Вставленные строки хранятся на диске в лексикографическом порядке (по возрастанию) по колонкам первичного ключа (и дополнительной колонке `EventTime` из сортировочного ключа).

:::note
ClickHouse позволяет вставлять несколько строк с одинаковыми значениями колонок первичного ключа. В этом случае (см. строка 1 и строка 2 на диаграмме ниже) окончательный порядок определяется заданным сортировочным ключом и, следовательно, значением колонки `EventTime`.
:::

ClickHouse является <a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms" target="_blank">столбцовой системой управления базами данных</a>. Как показано на диаграмме ниже
- для представления на диске имеется единственный файл данных (*.bin) для каждой колонки таблицы, в котором хранятся все значения для этой колонки в <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">сжатом</a> формате, и
- 8,87 миллиона строк хранятся на диске в лексикографическом порядке по возрастанию значений колонок первичного ключа (и дополнительных колонок ключа сортировки), а именно в данном случае
  - сначала по `UserID`,
  - затем по `URL`,
  - и наконец по `EventTime`:

<Image img={sparsePrimaryIndexes01} size="md" alt="Sparse Primary Indices 01" background="white"/>

`UserID.bin`, `URL.bin` и `EventTime.bin` — это файлы данных на диске, где хранятся значения колонок `UserID`, `URL` и `EventTime`.

:::note
- Поскольку первичный ключ определяет лексикографический порядок строк на диске, в таблице может быть только один первичный ключ.

- Мы нумеруем строки, начиная с 0, чтобы соответствовать внутренней схеме нумерации строк ClickHouse, которая также используется для логирования сообщений.
:::
### Данные организуются в гранулы для параллельной обработки данных {#data-is-organized-into-granules-for-parallel-data-processing}

Для целей обработки данных значения колонок таблицы логически делятся на гранулы.
Гранула — это самый маленький неделимый набор данных, который передается в ClickHouse для обработки данных.
Это означает, что вместо чтения отдельных строк ClickHouse всегда читает (в потоковом режиме и параллельно) целую группу (гранулу) строк.
:::note
Значения колонок физически не хранятся внутри гранул: гранулы — это просто логическая организация значений колонок для обработки запросов.
:::

Следующая диаграмма показывает, как (значения колонок) 8,87 миллиона строк нашей таблицы
организованы в 1083 гранулы, в результате содержащейся в DDL-утверждении таблицы настройки `index_granularity` (установленной на значение по умолчанию 8192).

<Image img={sparsePrimaryIndexes02} size="md" alt="Sparse Primary Indices 02" background="white"/>

Первые (на основе физического порядка на диске) 8192 строки (их значения колонок) логически принадлежат грануле 0, затем следующие 8192 строки (их значения колонок) принадлежат грануле 1 и так далее.

:::note
- Последняя гранула (гранула 1082) "содержит" менее 8192 строк.

- Мы упомянули в начале этого руководства в разделе "Подробности DDL утверждения", что мы отключили [адаптивную гранулярность индекса](/whats-new/changelog/2019.md/#experimental-features-1) (чтобы упростить обсуждение в этом руководстве и сделать диаграммы и результаты воспроизводимыми).

  Поэтому все гранулы (за исключением последней) нашей примерной таблицы имеют одинаковый размер.

- Для таблиц с адаптивной гранулярностью индекса (гранулярность индекса по [умолчанию](/operations/settings/merge-tree-settings#index_granularity_bytes) является адаптивной, размер некоторых гранул может быть меньше 8192 строк в зависимости от размеров данных строк.

- Мы выделили некоторые значения колонок из колонок нашего первичного ключа (`UserID`, `URL`) оранжевым цветом.
  Эти выделенные оранжевым цветом значения колонок являются значениями колонок первичного ключа каждой первой строки каждой гранулы.
  Как мы увидим ниже, эти выделенные значения колонок будут записями в первичном индексе таблицы.

- Мы нумеруем гранулы, начиная с 0, чтобы соответствовать внутренней схеме нумерации ClickHouse, которая также используется для логирования сообщений.
:::
### Первичный индекс имеет одну запись на гранулу {#the-primary-index-has-one-entry-per-granule}

Первичный индекс создается на основе гранул, показанных на диаграмме выше. Этот индекс представляет собой несжатый плоский массивный файл (primary.idx), содержащий так называемые числовые метки индекса, начиная с 0.

На диаграмме ниже показано, что индекс хранит значения колонок первичного ключа (значения, отмеченные оранжевым цветом на диаграмме выше) для каждой первой строки каждой гранулы.
Или другими словами: первичный индекс хранит значения колонок первичного ключа из каждой 8192-й строки таблицы (на основе физического порядка строк, определяемого колонками первичного ключа).
Например
- первая запись индекса ('метка 0' на диаграмме ниже) хранит значения ключевых колонок первой строки гранулы 0 из диаграммы выше,
- вторая запись индекса ('метка 1' на диаграмме ниже) хранит значения ключевых колонок первой строки гранулы 1 из диаграммы выше и так далее.

<Image img={sparsePrimaryIndexes03a} size="lg" alt="Sparse Primary Indices 03a" background="white"/>

В целом индекс имеет 1083 записи для нашей таблицы из 8,87 миллионов строк и 1083 гранул:

<Image img={sparsePrimaryIndexes03b} size="md" alt="Sparse Primary Indices 03b" background="white"/>

:::note
- Для таблиц с [адаптивной гранулярностью индекса](/whats-new/changelog/2019.md/#experimental-features-1) также хранится одна "финальная" метка в первичном индексе, которая фиксирует значения первичного ключа последней строки таблицы, но поскольку мы отключили адаптивную гранулярность индекса (чтобы упростить обсуждение в этом руководстве и сделать диаграммы и результаты воспроизводимыми), индекс нашей примерной таблицы не включает эту финальную метку.

- Файл первичного индекса полностью загружается в основную память. Если файл больше доступного свободного места в памяти, ClickHouse выдает ошибку.
:::

<details>
    <summary>
    Проверка содержимого первичного индекса
    </summary>
    <p>

На самоуправляемом кластере ClickHouse мы можем использовать <a href="https://clickhouse.com/docs/sql-reference/table-functions/file/" target="_blank">табличную функцию file</a> для проверки содержимого первичного индекса нашей примерной таблицы.

Для этого сначала нужно скопировать файл первичного индекса в <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a> узла из запущенного кластера:
<ul>
<li>Шаг 1: Получить путь к партии, которая содержит файл первичного индекса</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

возвращает `/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4` на тестовой машине.

<li>Шаг 2: Получить user_files_path</li>
<a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">значение по умолчанию user_files_path</a> на Linux равно
`/var/lib/clickhouse/user_files/`

и на Linux вы можете проверить, изменилось ли оно: `$ grep user_files_path /etc/clickhouse-server/config.xml`

На тестовой машине путь — `/Users/tomschreiber/Clickhouse/user_files/`

<li>Шаг 3: Скопировать файл первичного индекса в user_files_path</li>

`cp /Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4/primary.idx /Users/tomschreiber/Clickhouse/user_files/primary-hits_UserID_URL.idx`

</ul>

<br/>
Теперь мы можем проверить содержимое первичного индекса через SQL:
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
Это полностью соответствует нашей диаграмме содержимого первичного индекса для нашей примерной таблицы:

</p>
</details>

Записи первичного ключа называются метками индекса, потому что каждая запись индекса помечает начало конкретного диапазона данных. В частности для примерной таблицы:
- Индексные метки UserID:

  Сохраненные значения `UserID` в первичном индексе отсортированы в порядке возрастания.<br/>
  'метка 1' на диаграмме выше, таким образом, указывает на то, что значения `UserID` всех строк таблицы в грануле 1 и во всех следующих гранулах гарантированно больше или равны 4.073.710.

 [Как мы увидим позже](#the-primary-index-is-used-for-selecting-granules), этот глобальный порядок позволяет ClickHouse <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">использовать бинарный поиск</a> по меткам индекса для первого ключевого столбца, когда запрос фильтрует по первому столбцу первичного ключа.

- Индексные метки URL:

  Почти одинаковая кардинальность первичных ключевых колонок `UserID` и `URL`
  означает, что метки индекса для всех ключевых колонок после первого столбца в общем случае только указывают на диапазон данных, пока предшествующее значение ключевого столбца остается одинаковым для всех строк таблицы внутри как минимум текущей гранулы.<br/>
 Например, поскольку значения UserID меток 0 и 1 отличаются на диаграмме выше, ClickHouse не может предположить, что все значения URL всех строк таблицы в грануле 0 больше или равны `'http://showtopics.html%3...'`. Однако, если бы значения UserID меток 0 и 1 были одинаковыми на диаграмме выше (что означало бы, что значение UserID остается одинаковым для всех строк таблицы внутри гранулы 0), тогда ClickHouse мог бы предположить, что все значения URL всех строк таблицы в грануле 0 больше или равны `'http://showtopics.html%3...'`.

  Мы обсудим последствия этого для производительности выполнения запросов подробнее позже.
### Первичный индекс используется для выбора гранул {#the-primary-index-is-used-for-selecting-granules}

Теперь мы можем выполнять наши запросы с поддержкой первичного индекса.

Следующий запрос вычисляет 10 наиболее кликаемых URL для UserID 749927693.

```sql
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

Ответ выглядит следующим образом:

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

Вывод клиента ClickHouse теперь показывает, что вместо полного сканирования таблицы только 8.19 тысячи строк были переданы в ClickHouse.

Если включено <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">логирование трассировки</a>, то файл журнала сервера ClickHouse показывает, что ClickHouse выполнял <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">бинарный поиск</a> по 1083 меткам индекса UserID, чтобы идентифицировать гранулы, которые могут содержать строки со значением столбца UserID `749927693`. Это требует 19 шагов со средней временной сложностью `O(log2 n)`:
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

Мы видим в журнале трассировки выше, что одна метка из 1083 существующих меток удовлетворила запрос.

<details>
    <summary>
    Подробности журнала трассировки
    </summary>
    <p>

Была идентифицирована метка 176 (левая граница метки найдена включительно, правая граница метки найдена исключительно), и, следовательно, все 8192 строки из гранулы 176 (которая начинается с строки 1.441.792 — мы увидим это позже в этом руководстве) затем передаются в ClickHouse, чтобы найти фактические строки со значением столбца UserID `749927693`.
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
Вывод клиента показывает, что одна из 1083 гранул была выбрана как потенциально содержащая строки со значением столбца UserID 749927693.

:::note Заключение
Когда запрос выполняет фильтрацию по колонке, которая является частью составного ключа и является первым ключевым столбцом, ClickHouse выполняет бинарный поисковый алгоритм по меткам индекса ключевого столбца.
:::

<br/>

Как обсуждалось выше, ClickHouse использует свой разреженный первичный индекс для быстрого (с помощью бинарного поиска) выбора гранул, которые могут содержать строки, соответствующие запросу.

Это **первая стадия (выбор гранулы)** выполнения запроса в ClickHouse.

На **второй стадии (чтение данных)** ClickHouse находит выбранные гранулы, чтобы передать все их строки в движок ClickHouse для нахождения строк, которые фактически соответствуют запросу.

Мы обсудим эту вторую стадию подробнее в следующем разделе.
### Файлы меток используются для локализации гранул {#mark-files-are-used-for-locating-granules}

Следующая диаграмма иллюстрирует часть файла первичного индекса для нашей таблицы.

<Image img={sparsePrimaryIndexes04} size="md" alt="Sparse Primary Indices 04" background="white"/>

Как обсуждалось выше, с помощью бинарного поиска по 1083 меткам UserID индекса была определена метка 176. Следовательно, соответствующая гранула 176 может содержать строки со значением столбца UserID 749.927.693.

<details>
    <summary>
    Подробности выбора гранулы
    </summary>
    <p>

На диаграмме выше показано, что метка 176 является первой записью индекса, где минимальное значение UserID связанной гранулы 176 меньше 749.927.693, а минимальное значение UserID гранулы 177 для следующей метки (метка 177) больше этого значения. Поэтому только соответствующая гранула 176 для метки 176 может содержать строки со значением столбца UserID 749.927.693.
</p>
</details>

Чтобы подтвердить (или опровергнуть), что некоторые строки в грануле 176 содержат значение столбца UserID 749.927.693, необходимо передать все 8192 строки, принадлежащие этой грануле, в ClickHouse.

Для достижения этой цели ClickHouse необходимо знать физическое местоположение гранулы 176.

В ClickHouse физические местоположения всех гранул для нашей таблицы хранятся в файлах меток. Аналогично данным, для каждого столбца таблицы существует один файл меток.

Следующая диаграмма показывает три файла меток `UserID.mrk`, `URL.mrk` и `EventTime.mrk`, которые хранят физические местоположения гранул для столбцов `UserID`, `URL` и `EventTime` таблицы.

<Image img={sparsePrimaryIndexes05} size="md" alt="Sparse Primary Indices 05" background="white"/>

Мы обсуждали, что первичный индекс является плоским несжатым файловым массивом (primary.idx), содержащим метки индекса, которые пронумерованы, начиная с 0.

Аналогично, файл меток также является плоским несжатым файловым массивом (*.mrk), содержащим метки, которые также пронумерованы, начиная с 0.

Как только ClickHouse определил и выбрал метку индекса для гранулы, которая может содержать соответствующие строки для запроса, можно выполнить поиск по позиционному массиву в файлах меток, чтобы получить физические местоположения гранулы.

Каждая запись файла меток для конкретного столбца хранит два местоположения в виде смещений:

- Первое смещение ('block_offset' на диаграмме выше) указывает на <a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">блок</a> в <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">сжатом</a> файле данных столбца, который содержит сжатую версию выбранной гранулы. Этот сжатый блок потенциально может содержать несколько сжатых гранул. Найденный сжатый файл блока декомпрессируется в основную память при чтении.

- Второе смещение ('granule_offset' на диаграмме выше) из файла меток указывает местоположение гранулы внутри несжатого блока данных.

Все 8192 строки, принадлежащие найденной несжатой грануле, затем передаются в ClickHouse для дальнейшей обработки.

:::note

- Для таблиц с [широким форматом](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) и без [адаптивной зернистости индекса](/whats-new/changelog/2019.md/#experimental-features-1) ClickHouse использует файлы меток `.mrk`, как показано выше, которые содержат записи с двумя адресами длиной 8 байт на запись. Эти записи являются физическими местоположениями гранул, которые все имеют одинаковый размер.

 Зернистость индекса является адаптивной по [умолчанию](/operations/settings/merge-tree-settings#index_granularity_bytes), но для нашей примера таблицы мы отключили адаптивную зернистость индекса (чтобы упростить обсуждение в этом руководстве, а также сделать диаграммы и результаты воспроизводимыми). Наша таблица использует широкий формат, потому что размер данных больше, чем [min_bytes_for_wide_part](/operations/settings/merge-tree-settings#min_bytes_for_wide_part) (который по умолчанию составляет 10 МБ для самоуправляемых кластеров).

- Для таблиц с широким форматом и с адаптивной зернистостью индекса ClickHouse использует файлы меток `.mrk2`, которые содержат аналогичные записи, как файлы меток `.mrk`, но с дополнительным третьим значением для каждой записи: количество строк гранулы, с которой связана текущая запись.

- Для таблиц с [компактным форматом](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) ClickHouse использует файлы меток `.mrk3`.

:::

:::note Почему файлы меток

Почему первичный индекс не содержит напрямую физические местоположения гранул, которые соответствуют меткам индекса?

Потому что на таком крупномасштабном уровне, для которого предназначен ClickHouse, важно быть очень эффективным в отношении дискового и памяти.

Файл первичного индекса должен уместиться в основной памяти.

Для нашего примера запроса ClickHouse использовал первичный индекс и выбрал одну гранулу, которая может содержать строки, соответствующие нашему запросу. Только для этой одной гранулы ClickHouse затем нужно физическое местоположение, чтобы передать соответствующие строки для дальнейшей обработки.

Более того, эта информация о смещении требуется только для столбцов UserID и URL.

Информация о смещении не требуется для столбцов, которые не использованы в запросе, например, `EventTime`.

Для нашего примера запроса ClickHouse необходимо только два физических смещения для гранулы 176 в файле данных UserID (UserID.bin) и два физических смещения для гранулы 176 в файле данных URL (URL.bin).

Недирекция, предоставляемая файлами меток, позволяет избежать хранения прямо в первичном индексе записей для физических местоположений всех 1083 гранул для всех трех столбцов: таким образом избегая наличия ненужных (возможно неиспользуемых) данных в основной памяти.
:::

Следующая диаграмма и текст ниже иллюстрируют, как для нашего примера запроса ClickHouse локализует гранулу 176 в файле данных UserID.bin.

<Image img={sparsePrimaryIndexes06} size="md" alt="Sparse Primary Indices 06" background="white"/>

Мы обсуждали ранее в этом руководстве, что ClickHouse выбрал метку первичного индекса 176 и, следовательно, гранулу 176 как возможно содержащую соответствующие строки для нашего запроса.

ClickHouse теперь использует выбранный номер метки (176) из индекса для выполнения позиционного поиска массива в файле меток UserID.mrk, чтобы получить два смещения для локализации гранулы 176.

Как показано, первое смещение указывает на сжатый файл блока внутри файла данных UserID.bin, который, в свою очередь, содержит сжатую версию гранулы 176.

Как только найденный файл блока будет раскодирован в основную память, второе смещение из файла меток можно использовать для локализации гранулы 176 внутри несжатых данных.

ClickHouse необходимо локализовать (и отправить все значения из) гранулы 176 из обоих файлов данных UserID.bin и URL.bin, чтобы выполнить наш пример запроса (топ-10 самых кликабельных URL для интернет-пользователя с UserID 749.927.693).

Диаграмма выше показывает, как ClickHouse находит гранулу для файла данных UserID.bin.

Параллельно ClickHouse делает то же самое для гранулы 176 для файла данных URL.bin. Обе соответствующие гранулы выравниваются и передаются в движок ClickHouse для дальнейшей обработки, т.е. агрегации и подсчета значений URL по группам для всех строк, где UserID равен 749.927.693, перед окончательным выводом 10 крупнейших групп URL в порядке убывания количеств.
## Использование нескольких первичных индексов {#using-multiple-primary-indexes}

<a name="filtering-on-key-columns-after-the-first"></a>
### Вторичные ключевые столбцы могут быть (не) неэффективными {#secondary-key-columns-can-not-be-inefficient}

Когда запрос фильтрует по столбцу, который является частью составного ключа и является первым ключевым столбцом, [то ClickHouse выполняет алгоритм бинарного поиска по меткам индекса этого ключевого столбца](#the-primary-index-is-used-for-selecting-granules).

Но что происходит, когда запрос фильтрует по столбцу, который является частью составного ключа, но не является первым ключевым столбцом?

:::note
Мы обсуждаем сценарий, когда запрос явно не фильтрует по первому ключевому столбцу, а по вторичному ключевому столбцу.

Когда запрос фильтрует по первому ключевому столбцу и по любому ключевому столбцу после первого, тогда ClickHouse выполняет бинарный поиск по меткам индекса первого ключевого столбца.
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

10 rows in set. Elapsed: 0.086 sec.

# highlight-next-line
Processed 8.81 million rows,
799.69 MB (102.11 million rows/s., 9.27 GB/s.)
```

Вывод клиента указывает, что ClickHouse почти выполнил полное сканирование таблицы, несмотря на то, что [столбец URL является частью составного первичного ключа](#a-table-with-a-primary-key)! ClickHouse считывает 8.81 миллиона строк из 8.87 миллионов строк таблицы.

Если [trace_logging](/operations/server-configuration-parameters/settings#logger) включено, то файл журнала сервера ClickHouse показывает, что ClickHouse использовал <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">алгоритм общего исключения</a> по 1083 меткам индекса URL, чтобы определить те гранулы, которые, возможно, могут содержать строки со значением столбца URL "http://public_search":
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
Мы можем видеть в примере журнала трассировки выше, что 1076 (по меткам) из 1083 гранул были выбраны как возможно содержащие строки с соответствующим значением URL.

Это приводит к тому, что 8.81 миллиона строк передается в движок ClickHouse (параллельно используя 10 потоков), чтобы идентифицировать строки, которые действительно содержат значение URL "http://public_search".

Тем не менее, как мы увидим позже, только 39 гранул из 1076 выбранных гранул на самом деле содержат соответствующие строки.

Хотя первичный индекс, основанный на составном первичном ключе (UserID, URL), оказался очень полезным для ускорения запросов на фильтрацию строк с определенным значением UserID, индекс не предоставляет значительной помощи в ускорении запроса, который фильтрует строки с определенным значением URL.

Причина этого в том, что столбец URL не является первым ключевым столбцом, и поэтому ClickHouse использует алгоритм общего исключения (вместо бинарного поиска) по меткам индекса столбца URL, и **эффективность этого алгоритма зависит от разницы в кардинальности** между столбцом URL и его предшествующим ключевым столбцом UserID.

Чтобы проиллюстрировать это, мы предоставим некоторые детали о том, как работает алгоритм общего исключения.

<a name="generic-exclusion-search-algorithm"></a>
### Алгоритм общего исключения {#generic-exclusion-search-algorithm}

Следующее иллюстрирует, как работает <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank" >алгоритм общего исключения ClickHouse</a>, когда гранулы выбираются через вторичный столбец, где предшествующий ключевой столбец имеет низкую или высокую кардинальность.

В качестве примера для обоих случаев мы будем считать:
- запрос, который ищет строки со значением URL = "W3".
- абстрактную версию нашей таблицы с упрощенными значениями для UserID и URL.
- тот же составной первичный ключ (UserID, URL) для индекса. Это означает, что строки сначала упорядочены по значениям UserID. Строки с одинаковым значением UserID затем упорядочиваются по URL.
- размер гранулы равен двум, т.е. каждая гранула содержит две строки.

Мы отметили значения ключевого столбца для первых строк таблицы для каждой гранулы оранжевым цветом на диаграммах ниже.

**Предшествующий ключевой столбец имеет низкую кардинальность**<a name="generic-exclusion-search-fast"></a>

Предположим, что UserID имеет низкую кардинальность. В этом случае вполне вероятно, что одно и то же значение UserID распределено по нескольким строкам таблицы и гранулам, и, следовательно, по меткам индекса. Для меток индекса с одинаковым UserID значения URL для меток индекса сортируются в порядке возрастания (поскольку строки таблицы сначала упорядочены по UserID, а затем по URL). Это позволяет проводить эффективную фильтрацию, как описано ниже:

<Image img={sparsePrimaryIndexes07} size="md" alt="Sparse Primary Indices 06" background="white"/>

Существует три различных сценария для процесса выбора гранул для наших абстрактных примерных данных на диаграмме выше:

1. Метка индекса 0, для которой **значение URL меньше W3 и значение URL следующей за ней метки также меньше W3**, может быть исключена, потому что метка 0 и 1 имеют одно и то же значение UserID. Обратите внимание, что это предусловие исключения гарантирует, что гранула 0 полностью состоит из значений UserID U1, так что ClickHouse может предположить, что и максимальное значение URL в грануле 0 меньше W3 и исключить гранулу.

2. Метка индекса 1, для которой **значение URL меньше (или равно) W3 и значение URL следующей за ней метки больше (или равно) W3**, выбрана, потому что это означает, что гранула 1 может содержать строки со значением URL W3.

3. Метки индексов 2 и 3, для которых **значение URL больше W3**, могут быть исключены, поскольку метки индексов первичного индекса хранят значения ключевых столбцов для первой строки таблицы для каждой гранулы, и строки таблицы отсортированы на диске по значениям ключевых столбцов, поэтому гранулы 2 и 3 не могут содержать значение URL W3.

**Предшествующий ключевой столбец имеет высокую кардинальность**<a name="generic-exclusion-search-slow"></a>

Когда UserID имеет высокую кардинальность, маловероятно, что одно и то же значение UserID распределено по нескольким строкам таблицы и гранулам. Это означает, что значения URL для меток индекса не увеличиваются монотонно:

<Image img={sparsePrimaryIndexes08} size="md" alt="Sparse Primary Indices 06" background="white"/>

Как мы видим на диаграмме выше, все показанные метки, у которых значения URL меньше W3, выбираются для передачи строк их ассоциированных гранул в движок ClickHouse.

Это потому, что хотя все метки индекса на диаграмме попадают в сценарий 1, описанный выше, они не удовлетворяют упомянутому предположению об исключении, что *следующая за ней метка индекса имеет то же значение UserID, что и текущая метка*, и поэтому их нельзя исключить.

Например, рассмотрим метку индекса 0, для которой **значение URL меньше W3 и значение URL следующей метки также меньше W3**. Эта метка *не может* быть исключена, потому что следующая метка индекса 1 *не имеет* того же значения UserID, что и текущая метка 0.

Это, в конечном итоге, предотвращает ClickHouse от распространения предположений о максимальном значении URL в грануле 0. Вместо этого ему необходимо предположить, что гранула 0 потенциально содержит строки со значением URL W3 и вынуждено выбрать метку 0.

Та же ситуация справедлива для меток 1, 2 и 3.

:::note Заключение
<a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">Алгоритм общего исключения</a>, который использует ClickHouse вместо <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">алгоритма бинарного поиска</a>, когда запрос фильтрует по столбцу, который является частью составного ключа, но не является первым ключевым столбцом, наиболее эффективен, когда предшествующий ключевой столбец имеет низкую кардинальность.
:::

В нашем наборе примерных данных оба ключевых столбца (UserID, URL) имеют схожую высокую кардинальность, и, как объяснено, алгоритм общего исключения не очень эффективен, когда предшествующий ключевой столбец столбца URL имеет высокую или аналогичную кардинальность.
### Примечание о индексе пропуска данных {#note-about-data-skipping-index}

Из-за схожей высокой кардинальности UserID и URL, наш [запрос, фильтрующий по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) также не получит значительной выгоды от создания [вторичного индекса пропуска данных](./skipping-indexes.md) по столбцу URL нашей [таблицы с составным первичным ключом (UserID, URL)](#a-table-with-a-primary-key).

Например, эти два выражения создают и заполняют [минмакс](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) индекс пропуска данных по столбцу URL нашей таблицы:
```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```
ClickHouse теперь создал дополнительный индекс, который хранит - для группы из 4 последовательных [гранул](#data-is-organized-into-granules-for-parallel-data-processing) (обратите внимание на оператор `GRANULARITY 4` в выражении `ALTER TABLE` выше) - минимальное и максимальное значение URL:

<Image img={sparsePrimaryIndexes13a} size="md" alt="Sparse Primary Indices 13a" background="white"/>

Первая запись индекса ('метка 0' на диаграмме выше) хранит минимальные и максимальные значения URL для [строк, принадлежащих первой группе из 4 гранул нашей таблицы](#data-is-organized-into-granules-for-parallel-data-processing).

Вторая запись индекса ('метка 1') хранит минимальные и максимальные значения URL для строк, принадлежащих следующей группе из 4 гранул нашей таблицы, и так далее.

(ClickHouse также создал специальный [файл меток](#mark-files-are-used-for-locating-granules) для индекса пропуска данных для [локализации](#mark-files-are-used-for-locating-granules) групп гранул, связанных с метками индекса.)

Из-за схожей высокой кардинальности UserID и URL этот вторичный индекс пропуска данных не может помочь в исключении гранул из выборки, когда наш [запрос, фильтрующий по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) выполняется.
 
Конкретное значение URL, которого ищет запрос (т.е. 'http://public_search'), очень вероятно находится между минимальным и максимальным значением, хранящимся индексом для каждой группы гранул, что приводит к тому, что ClickHouse вынужден выбрать группу гранул (поскольку они могут содержать строки, соответствующие запросу).
### Необходимость использовать несколько первичных индексов {#a-need-to-use-multiple-primary-indexes}

Таким образом, если мы хотим значительно ускорить наш пример запроса, который фильтрует строки с определенным URL, то нам необходимо использовать первичный индекс, оптимизированный для этого запроса.

В дополнение, если мы хотим сохранить хорошую производительность нашего примера запроса, который фильтрует строки с определенным UserID, нам необходимо использовать несколько первичных индексов.

Следующее показывает способы достижения этого.

<a name="multiple-primary-indexes"></a>
### Опции для создания дополнительных первичных индексов {#options-for-creating-additional-primary-indexes}

Если мы хотим значительно ускорить оба наших примера запросов - тот, который фильтрует строки с конкретным UserID и тот, который фильтрует строки с конкретным URL - тогда нам необходимо использовать несколько первичных индексов, воспользовавшись одним из этих трех вариантов:

- Создание **второй таблицы** с другим первичным ключом.
- Создание **материализованного представления** на нашей существующей таблице.
- Добавление **проекции** к нашей существующей таблице.

Все три варианта эффективно дублируют наши примерные данные в дополнительной таблице для реорганизации первичного индекса таблицы и порядка сортировки строк.

Однако три варианта различаются тем, насколько прозрачна эта дополнительная таблица для пользователя в отношении маршрутизации запросов и операторов вставки.

При создании **второй таблицы** с другим первичным ключом запросы должны быть явно отправлены版本 таблицы, наиболее подходящей для запроса, и новые данные должны быть явно вставлены в обе таблицы для поддержания синхронизации таблиц:

<Image img={sparsePrimaryIndexes09a} size="md" alt="Sparse Primary Indices 09a" background="white"/>

С **материализованным представлением** дополнительная таблица создается неявно, и данные автоматически поддерживаются в синхронизации между обеими таблицами:

<Image img={sparsePrimaryIndexes09b} size="md" alt="Sparse Primary Indices 09b" background="white"/>

А **проекция** является наиболее прозрачным вариантом, потому что помимо автоматической синхронизации неявно созданной (и скрытой) дополнительной таблицы с изменениями данных, ClickHouse автоматически выберет наиболее эффективную версию таблицы для запросов:

<Image img={sparsePrimaryIndexes09c} size="md" alt="Sparse Primary Indices 09c" background="white"/>

В следующем мы подробнее обсудим эти три варианта создания и использования нескольких первичных индексов с реальными примерами.

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

Вставляем все 8.87 миллионов строк из нашей [оригинальной таблицы](#a-table-with-a-primary-key) в дополнительную таблицу:

```sql
INSERT INTO hits_URL_UserID
SELECT * FROM hits_UserID_URL;
```

Ответ выглядит так:

```response
Ok.

0 rows in set. Elapsed: 2.898 sec. Processed 8.87 million rows, 838.84 MB (3.06 million rows/s., 289.46 MB/s.)
```

И в конце оптимизируем таблицу:
```sql
OPTIMIZE TABLE hits_URL_UserID FINAL;
```

Поскольку мы поменяли порядок столбцов в первичном ключе, вставленные строки теперь хранятся на диске в другом лексикографическом порядке (по сравнению с нашей [оригинальной таблицей](#a-table-with-a-primary-key)), и, следовательно, 1083 гранулы этой таблицы содержат другие значения, чем прежде:

<Image img={sparsePrimaryIndexes10} size="md" alt="Sparse Primary Indices 10" background="white"/>

Вот как выглядит первичный ключ результирующей таблицы:

<Image img={sparsePrimaryIndexes11} size="md" alt="Sparse Primary Indices 11" background="white"/>

Этот ключ теперь можно использовать для значительного ускорения выполнения нашего примерного запроса, фильтрующего по столбцу URL, чтобы вычислить топ-10 пользователей, наиболее часто кликавших по URL "http://public_search":
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

Теперь, вместо [почти полного сканирования таблицы](/guides/best-practices/sparse-primary-indexes#efficient-filtering-on-secondary-key-columns) ClickHouse выполнил этот запрос гораздо более эффективно.

С первичным индексом из [оригинальной таблицы](#a-table-with-a-primary-key), где UserID был первым, а URL вторым ключевым столбцом, ClickHouse использовал [алгоритм общего исключения](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) для выполнения этого запроса, и это было не очень эффективно из-за схожей высокой кардинальности UserID и URL.

С URL в качестве первого столбца в первичном индексе ClickHouse теперь проводит <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">бинарный поиск</a> по меткам индекса.
Соответствующий журнал трассировки в файле журнала сервера ClickHouse подтверждает, что:
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
ClickHouse выбрал только 39 меток индекса, вместо 1076, когда использовался алгоритм общего исключения.

Обратите внимание, что дополнительная таблица оптимизирована для ускорения выполнения нашего примерного запроса, фильтрующего по URL.

Похожим образом, как в случае [низкой производительности](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) этого запроса в нашей [оригинальной таблице](#a-table-with-a-primary-key), наш [пример запроса, фильтрующего по UserID](#the-primary-index-is-used-for-selecting-granules) не будет выполняться очень эффективно с новой дополнительной таблицей, потому что UserID теперь является вторым ключевым столбцом в первичном индексе этой таблицы, и поэтому ClickHouse будет использовать общий алгоритм исключения для выбора гранул, что [неэффективно для схожей высокой кардинальности](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) UserID и URL.
Откройте подробности для уточнения.

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

Теперь у нас есть две таблицы. Оптимизированные для ускорения запросов фильтрации по `UserID`, и для ускорения запросов фильтрации по URL, соответственно:
### Вариант 2: Материализованные представления {#option-2-materialized-views}

Создать [материализованное представление](/sql-reference/statements/create/view.md) на нашей существующей таблице.
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
- мы меняем порядок ключевых столбцов (по сравнению с нашей [оригинальной таблицей](#a-table-with-a-primary-key)) в первичном ключе представления
- материализованное представление поддерживается **неявно созданной таблицей**, чья сортировка строк и первичный индекс основаны на заданном определении первичного ключа
- неявно созданная таблица отображается по запросу `SHOW TABLES` и имеет имя, начинающееся с `.inner`
- также возможно сначала явно создать вспомогательную таблицу для материализованного представления, а затем это представление может обращаться к этой таблице через [клаузу](/sql-reference/statements/create/view.md) `TO [db].[table]`
- мы используем ключевое слово `POPULATE`, чтобы немедленно заполнить неявно созданную таблицу всеми 8.87 миллионами строк из исходной таблицы [hits_UserID_URL](#a-table-with-a-primary-key)
- если в исходную таблицу hits_UserID_URL будут добавлены новые строки, то эти строки также автоматически будут вставляться в неявно созданную таблицу
- Эффективно неявно созданная таблица имеет тот же порядок строк и первичный индекс, что и [вторичная таблица, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables):

<Image img={sparsePrimaryIndexes12b1} size="md" alt="Sparse Primary Indices 12b1" background="white"/>

ClickHouse хранит [файлы данных столбцов](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin), [файлы меток](#mark-files-are-used-for-locating-granules) (*.mrk2) и [первичный индекс](#the-primary-index-has-one-entry-per-granule) (primary.idx) неявно созданной таблицы в специальной папке внутри каталога данных сервера ClickHouse:

<Image img={sparsePrimaryIndexes12b2} size="md" alt="Sparse Primary Indices 12b2" background="white"/>

:::

Неявно созданная таблица (и ее первичный индекс), которая поддерживает материализованное представление, теперь может быть использована для значительного ускорения выполнения нашего примерного запроса, фильтрующего по столбцу URL:
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

Поскольку фактически неявно созданная таблица (и ее первичный индекс), поддерживающая материализованное представление, идентична [вторичной таблице, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables), запрос выполняется так же эффективно, как и с явно созданной таблицей.

Соответствующий журнал трассировки в файле журнала сервера ClickHouse подтверждает, что ClickHouse выполняет бинарный поиск по меткам индекса:

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
- проекция создает **скрытую таблицу**, чья сортировка строк и первичный индекс основаны на данной клаузе `ORDER BY` проекции
- скрытая таблица не отображается по запросу `SHOW TABLES`
- мы используем ключевое слово `MATERIALIZE`, чтобы немедленно заполнить скрытую таблицу всеми 8.87 миллионами строк из исходной таблицы [hits_UserID_URL](#a-table-with-a-primary-key)
- если в исходную таблицу hits_UserID_URL будут добавлены новые строки, то эти строки также автоматически будут вставляться в скрытую таблицу
- запрос всегда (по синтаксису) обращается к исходной таблице hits_UserID_URL, но если порядок строк и первичный индекс скрытой таблицы позволяют более эффективное выполнение запроса, то при этом будет использоваться скрытая таблица
- пожалуйста, обратите внимание, что проекции не делают запросы, использующие ORDER BY, более эффективными, даже если ORDER BY совпадает с ORDER BY утверждением проекции (см. https://github.com/ClickHouse/ClickHouse/issues/47333)
- Эффективно неявно созданная скрытая таблица имеет тот же порядок строк и первичный индекс, что и [вторичная таблица, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables):

<Image img={sparsePrimaryIndexes12c1} size="md" alt="Sparse Primary Indices 12c1" background="white"/>

ClickHouse хранит [файлы данных столбцов](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin), [файлы меток](#mark-files-are-used-for-locating-granules) (*.mrk2) и [первичный индекс](#the-primary-index-has-one-entry-per-granule) (primary.idx) скрытой таблицы в специальной папке (отмеченной оранжевым цветом на скриншоте ниже), рядом с файлами данных, файлами меток и файлами первичного индекса исходной таблицы:

<Image img={sparsePrimaryIndexes12c2} size="sm" alt="Sparse Primary Indices 12c2" background="white"/>

:::

Скрытая таблица (и ее первичный индекс), созданные проекцией, теперь могут (неявно) использоваться для значительного ускорения выполнения нашего примерного запроса, фильтрующего по столбцу URL. Обратите внимание, что запрос по синтаксису обращается к исходной таблице проекции.
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

Поскольку фактически скрытая таблица (и ее первичный индекс), созданные проекцией, идентичны [вторичной таблице, которую мы создали явно](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables), запрос выполняется так же эффективно, как и с явно созданной таблицей.

Соответствующий журнал трассировки в файле журнала сервера ClickHouse подтверждает, что ClickHouse выполняет бинарный поиск по меткам индекса:

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

Первичный индекс нашей [таблицы со сложным первичным ключом (UserID, URL)](#a-table-with-a-primary-key) был очень полезен для ускорения [запроса с фильтрацией по UserID](#the-primary-index-is-used-for-selecting-granules). Но этот индекс не предоставляет значительной помощи в ускорении [запроса с фильтрацией по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient), несмотря на то, что колонка URL является частью сложного первичного ключа.

И наоборот:
Первичный индекс нашей [таблицы со сложным первичным ключом (URL, UserID)](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables) ускорял [запрос с фильтрацией по URL](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient), но не предоставлял много поддержки для [запроса с фильтрацией по UserID](#the-primary-index-is-used-for-selecting-granules).

Из-за схожей высокой кардинальности колонок первичного ключа UserID и URL, запрос, который фильтрует по второму ключевому столбцу, [не извлекает много пользы от того, что второй ключевой столбец находится в индексе](#generic-exclusion-search-algorithm).

Поэтому имеет смысл удалить второй ключевой столбец из первичного индекса (что приведет к меньшему потреблению памяти индекса) и [использовать несколько первичных индексов](/guides/best-practices/sparse-primary-indexes#using-multiple-primary-indexes) вместо этого.

Однако, если ключевые столбцы в сложном первичном ключе имеют большие различия в кардинальности, то [это полезно для запросов](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm) упорядочить ключевые столбцы по кардинальности в порядке возрастания.

Чем больше разница в кардинальности между ключевыми столбцами, тем больше значения имеет порядок этих столбцов в ключе. Мы продемонстрируем это в следующем разделе.

## Эффективное упорядочивание ключевых столбцов {#ordering-key-columns-efficiently}

<a name="test"></a>

В сложном первичном ключе порядок ключевых столбцов может значительно влиять как на:
- эффективность фильтрации по вторичным ключевым столбцам в запросах, так и
- коэффициент сжатия для файлов данных таблицы.

Чтобы продемонстрировать это, мы используем версию нашего [набора данных веб-трафика](#data-set), где каждая строка содержит три колонки, которые указывают, помечен ли доступ интернет 'пользователя' (`UserID` колонка) к URL (`URL` колонка) как бот-трафик (`IsRobot` колонка).

Мы будем использовать сложный первичный ключ, содержащий все три упомянутые колонки, который может быть использован для ускорения типичных веб-аналитических запросов, которые вычисляют:
- сколько (в процентах) трафика к определенному URL исходит от ботов или
- насколько мы уверены, что конкретный пользователь является (не является) ботом (каков процент трафика от этого пользователя, который (не) предполагается как бот-трафик)

Мы используем этот запрос для вычисления кардинальностей трех колонок, которые мы хотим использовать в качестве ключевых столбцов в сложном первичном ключе (обратите внимание, что мы используем [табличную функцию URL](/sql-reference/table-functions/url.md) для запроса TSV данных без необходимости создавать локальную таблицу). Выполните этот запрос в `clickhouse client`:
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

Мы видим, что есть большая разница между кардинальностями, особенно между колонками `URL` и `IsRobot`, и поэтому порядок этих колонок в сложном первичном ключе значителен как для эффективного ускорения запросов, фильтрующих по этим колонкам, так и для достижения оптимальных коэффициентов сжатия для файлов данных колонок таблицы.

Чтобы продемонстрировать это, мы создадим две версии таблицы для нашего анализа бот-трафика:
- таблица `hits_URL_UserID_IsRobot` со сложным первичным ключом `(URL, UserID, IsRobot)`, где мы упорядочиваем ключевые столбцы по кардинальности в порядке убывания
- таблица `hits_IsRobot_UserID_URL` со сложным первичным ключом `(IsRobot, UserID, URL)`, где мы упорядочиваем ключевые столбцы по кардинальности в порядке возрастания

Создайте таблицу `hits_URL_UserID_IsRobot` со сложным первичным ключом `(URL, UserID, IsRobot)`:
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

И заполните её 8.87 миллиона строками:
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

Следующим шагом создайте таблицу `hits_IsRobot_UserID_URL` со сложным первичным ключом `(IsRobot, UserID, URL)`:
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
И заполните её теми же 8.87 миллиона строками, которые мы использовали для заполнения предыдущей таблицы:

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

Когда запрос фильтрует по как минимум одному столбцу, который является частью составного ключа и является первым ключевым столбцом, [то ClickHouse выполняет бинарный поиск по индексным меткам ключевого столбца](#the-primary-index-is-used-for-selecting-granules).

Когда запрос фильтрует (только) по столбцу, который является частью составного ключа, но не является первым ключевым столбцом, [то ClickHouse использует алгоритм общего исключения по индексным меткам ключевого столбца](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient).

Для второго случая порядок ключевых столбцов в сложном первичном ключе имеет значение для эффективности [алгоритма общего исключения](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444).

Это запрос, который фильтрует по колонке `UserID` таблицы, где мы упорядочили ключевые столбцы `(URL, UserID, IsRobot)` по кардинальности в порядке убывания:
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
81.28 KB (6.61 million rows/s., 26.44 MB/s.)
```

Мы можем увидеть, что выполнение запроса значительно более эффективно и быстрее в таблице, где мы упорядочили ключевые столбцы по кардинальности в порядке возрастания.

Причина этого в том, что [алгоритм общего исключения](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444) работает наиболее эффективно, когда [гранулы](#the-primary-index-is-used-for-selecting-granules) выбираются через вторичный ключевой столбец, где предшествующий ключевой столбец имеет более низкую кардинальность. Мы подробно проиллюстрировали это в [предыдущем разделе](#generic-exclusion-search-algorithm) этого руководства.

### Оптимальный коэффициент сжатия файлов данных {#optimal-compression-ratio-of-data-files}

Этот запрос сравнивает коэффициент сжатия колонки `UserID` между двумя таблицами, которые мы создали выше:

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
Ответ:
```response
┌─Table───────────────────┬─Column─┬─Uncompressed─┬─Compressed─┬─Ratio─┐
│ hits_URL_UserID_IsRobot │ UserID │ 33.83 MiB    │ 11.24 MiB  │     3 │
│ hits_IsRobot_UserID_URL │ UserID │ 33.83 MiB    │ 877.47 KiB │    39 │
└─────────────────────────┴────────┴──────────────┴────────────┴───────┘

2 rows in set. Elapsed: 0.006 sec.
```

Мы видим, что коэффициент сжатия для колонки `UserID` значительно выше для таблицы, где мы упорядочили ключевые столбцы `(IsRobot, UserID, URL)` по кардинальности в порядке возрастания.

Хотя в обеих таблицах хранится точно одинаковые данные (мы вставили одинаковые 8.87 миллиона строк в обе таблицы), порядок ключевых столбцов в сложном первичном ключе имеет значительное влияние на то, сколько дискового пространства требуют <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">сжатые</a> данные в [файлах данных колонок](#data-is-stored-on-disk-ordered-by-primary-key-columns) таблицы:
- в таблице `hits_URL_UserID_IsRobot` со сложным первичным ключом `(URL, UserID, IsRobot)`, где мы упорядочили ключевые столбцы по кардинальности в порядке убывания, файл данных `UserID.bin` занимает **11.24 MiB** дискового пространства
- в таблице `hits_IsRobot_UserID_URL` со сложным первичным ключом `(IsRobot, UserID, URL)`, где мы упорядочили ключевые столбцы по кардинальности в порядке возрастания, файл данных `UserID.bin` занимает всего **877.47 KiB** дискового пространства

Наличие хорошего коэффициента сжатия для данных колонки таблицы на диске не только экономит место на диске, но также ускоряет запросы (особенно аналитические), которые требуют чтения данных из этой колонки, так как требуется меньше ввода-вывода для перемещения данных колонки с диска в оперативную память (кэш файловой системы операционной системы).

В следующем разделе мы иллюстрируем, почему для коэффициента сжатия колонок таблицы имеет смысл упорядочить первичные ключевые столбцы по кардинальности в порядке возрастания.

Диаграмма ниже иллюстрирует порядок строк на диске для первичного ключа, где ключевые столбцы упорядочены по кардинальности в порядке возрастания:

<Image img={sparsePrimaryIndexes14a} size="md" alt="Sparse Primary Indices 14a" background="white"/>

Мы обсуждали, что [данные строк таблицы хранятся на диске упорядоченными по ключевым колонкам](#data-is-stored-on-disk-ordered-by-primary-key-columns).

На диаграмме выше строки таблицы (их значения колонок на диске) сначала упорядочены по их значению `cl`, а строки, имеющие одинаковое значение `cl`, упорядочены по их значению `ch`. И поскольку первый ключевой столбец `cl` имеет низкую кардинальность, вероятно, что есть строки с одинаковым значением `cl`. И из-за этого также вероятно, что значения `ch` упорядочены (локально - для строк с одинаковым значением `cl`).

Если в колонке похожие данные расположены близко друг к другу, например, за счет сортировки, то эти данные будут сжаты лучше.
В общем, алгоритм сжатия выигрывает от длины последовательности данных (чем больше данных он видит, тем лучше для сжатия) и локальности (чем более схожи данные, тем лучше коэффициент сжатия).

В противоположность диаграмме выше, диаграмма ниже иллюстрирует порядок строк на диске для первичного ключа, где ключевые столбцы упорядочены по кардинальности в порядке убывания:

<Image img={sparsePrimaryIndexes14b} size="md" alt="Sparse Primary Indices 14b" background="white"/>

Теперь строки таблицы сначала упорядочены по их значению `ch`, а строки, имеющие одинаковое значение `ch`, упорядочены по их значению `cl`.
Но поскольку первый ключевой столбец `ch` имеет высокую кардинальность, маловероятно, что есть строки с одинаковым значением `ch`. И, следовательно, также маловероятно, что значения `cl` упорядочены (локально - для строк с одинаковым значением `ch`).

Поэтому значения `cl`, скорее всего, расположены в случайном порядке и, следовательно, имеют плохую локальность и коэффициент сжатия.

### Резюме {#summary-1}

Как для эффективной фильтрации по вторичным ключевым столбцам в запросах, так и для коэффициента сжатия файлов данных колонок таблицы полезно упорядочить колонки в первичном ключе по их кардинальности в порядке возрастания.

## Эффективное выявление отдельных строк {#identifying-single-rows-efficiently}

Хотя в общем это [не является](/knowledgebase/key-value) наилучшим вариантом использования ClickHouse,
иногда приложения, построенные на основе ClickHouse, требуют идентификации отдельных строк таблицы ClickHouse.

Интуитивным решением для этого может быть использование колонки [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) с уникальным значением для каждой строки, а для быстрого извлечения строк использовать эту колонку в качестве ключевого столбца.

Для самого быстрого извлечения колонка UUID [должна быть первым ключевым столбцом](#the-primary-index-is-used-for-selecting-granules).

Мы обсуждали, что поскольку [данные строк таблицы ClickHouse хранятся на диске упорядоченными по первичному ключевому столбцу(ам)](#data-is-stored-on-disk-ordered-by-primary-key-columns), наличие колонки с очень высокой кардинальностью (например, колонки UUID) в первичном ключе или в сложном первичном ключе перед колонками с более низкой кардинальностью [вредно для коэффициента сжатия других колонок таблицы](#optimal-compression-ratio-of-data-files).

Компромисс между самым быстрым извлечением и оптимальным сжатием данных состоит в использовании сложного первичного ключа, где UUID является последним ключевым столбцом, после колонок с низкой (или такой же) кардинальностью, которые используются для обеспечения хорошего коэффициента сжатия для некоторых колонок таблицы.

### Конкретный пример {#a-concrete-example}

Одним из конкретных примеров является сервис для хранения текста [https://pastila.nl](https://pastila.nl), который разработал Алексей Миловидов и [публиковал в блоге](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/).

При каждом изменении текстового поля данные автоматически сохраняются в строку таблицы ClickHouse (одна строка на каждое изменение).

И одним из способов идентифицировать и извлечь (конкретную версию) вставленного контента является использование хеша контента в качестве UUID для строки таблицы, содержащей этот контент.

Следующая диаграмма показывает:
- порядок вставки строк, когда контент изменяется (например, из-за нажатия клавиш для ввода текста в текстовое поле) и
- порядок данных на диске из вставленных строк, когда используется `PRIMARY KEY (hash)`:

<Image img={sparsePrimaryIndexes15a} size="md" alt="Sparse Primary Indices 15a" background="white"/>

Поскольку колонка `hash` используется в качестве первичного ключевого столбца,
- конкретные строки можно извлекать [очень быстро](#the-primary-index-is-used-for-selecting-granules), но
- строки таблицы (их данные колонок) хранятся на диске, упорядоченные по возрастанию (уникальных и случайных) хеш-значений. Поэтому значения колонки контента также хранятся в случайном порядке без локальности данных, что приводит к **субоптимальному коэффициенту сжатия для файла данных колонки контента**.

Для того чтобы значительно улучшить коэффициент сжатия для колонки контента, при этом всё равно достигая быстрого извлечения конкретных строк, pastila.nl использует два хеша (и сложный первичный ключ) для идентификации конкретной строки:
- хеш контента, как обсуждалось выше, который уникален для различных данных, и
- [локально-чувствительный хеш (отпечаток)](https://en.wikipedia.org/wiki/Locality-sensitive_hashing), который **не** изменяется при небольших изменениях данных.

Следующая диаграмма показывает:
- порядок вставки строк, когда контент изменяется (например, из-за нажатия клавиш для ввода текста в текстовое поле) и
- порядок данных на диске из вставленных строк, когда используется сложный `PRIMARY KEY (fingerprint, hash)`:

<Image img={sparsePrimaryIndexes15b} size="md" alt="Sparse Primary Indices 15b" background="white"/>

Теперь строки на диске сначала упорядочены по `fingerprint`, а для строк с одинаковым значением fingerprint их значение `hash` определяет окончательный порядок.

Поскольку данные, которые отличаются только небольшими изменениями, получают одно и то же значение fingerprint, похожие данные теперь хранятся на диске близко друг к другу в колонке контента. И это очень хорошо для коэффициента сжатия колонки контента, поскольку алгоритм сжатия в целом выигрывает от локальности данных (чем более схожи данные, тем лучше коэффициент сжатия).

Компромисс заключается в том, что для извлечения конкретной строки требуется два поля (`fingerprint` и `hash`), чтобы оптимально использовать первичный индекс, который возникает из сложного `PRIMARY KEY (fingerprint, hash)`.
