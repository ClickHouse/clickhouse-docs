---
'sidebar_label': '기본 인덱스'
'sidebar_position': 1
'description': '이 가이드에서는 ClickHouse 인덱싱에 대해 깊이 파고들 것입니다.'
'title': 'ClickHouse에서 기본 키 인덱스에 대한 실용적인 소개'
'slug': '/guides/best-practices/sparse-primary-indexes'
'show_related_blogs': true
'doc_type': 'guide'
'keywords':
- 'primary index'
- 'indexing'
- 'performance'
- 'query optimization'
- 'best practices'
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


# ClickHouse에서 기본 키에 대한 실용적인 소개
## 소개 {#introduction}

이 가이드에서는 ClickHouse 인덱싱에 대해 깊이 있게 탐구할 것입니다. 우리는 다음을 자세히 설명하고 논의할 것입니다:
- [ClickHouse의 인덱싱이 전통적인 관계형 데이터베이스 관리 시스템과 어떻게 다른지](#an-index-design-for-massive-data-scales)
- [ClickHouse가 테이블의 스파스 기본 키 인덱스를 어떻게 구축하고 사용하는지](#a-table-with-a-primary-key)
- [ClickHouse에서 인덱싱을 위한 몇 가지 모범 사례는 무엇인지](#using-multiple-primary-indexes)

이 가이드에 제시된 모든 ClickHouse SQL 문과 쿼리는 여러분이 개인 컴퓨터에서 실행할 수 있습니다.
ClickHouse 설치 및 시작 방법에 대한 지침은 [빠른 시작](/get-started/quick-start)을 참조하세요.

:::note
이 가이드는 ClickHouse 스파스 기본 키 인덱스에 중점을 두고 있습니다.

ClickHouse에 대한 [2차 데이터 스킵 인덱스](/engines/table-engines/mergetree-family/mergetree.md/#table_engine-mergetree-data_skipping-indexes)에 대한 내용은 [튜토리얼](/guides/best-practices/skipping-indexes.md)을 참조하세요.
:::

### 데이터 세트 {#data-set}

이 가이드에서는 샘플 익명화된 웹 트래픽 데이터 세트를 사용할 것입니다.

- 샘플 데이터 세트에서 8.87백만 행(이벤트)의 하위 집합을 사용할 것입니다.
- 압축되지 않은 데이터 크기는 8.87백만 이벤트이며 약 700MB입니다. ClickHouse에 저장하면 200MB로 압축됩니다.
- 우리의 하위 집합에서 각 행은 특정 시간(`EventTime` 컬럼)에서 URL(`URL` 컬럼)을 클릭한 인터넷 사용자(`UserID` 컬럼)를 나타내는 세 개의 컬럼을 포함합니다.

이 세 개의 컬럼으로 우리는 이미 다음과 같은 전형적인 웹 분석 쿼리를 작성할 수 있습니다:

- "특정 사용자에게 가장 많이 클릭된 상위 10개의 URL은 무엇입니까?"
- "특정 URL을 가장 자주 클릭한 상위 10명의 사용자는 누구입니까?"
- "사용자가 특정 URL을 클릭하는 가장 인기 있는 시간(예: 주의 요일)은 언제입니까?"
### 테스트 머신 {#test-machine}

이 문서에서 제공된 모든 런타임 수치는 Apple M1 Pro 칩과 16GB RAM을 장착한 MacBook Pro에서 ClickHouse 22.2.1을 로컬에서 실행한 데이터에 기반합니다.
### 전체 테이블 스캔 {#a-full-table-scan}

기본 키 없이 쿼리가 우리의 데이터 세트에서 어떻게 실행되는지 보기 위해, 다음 SQL DDL 문을 실행하여 테이블(MergeTree 테이블 엔진을 사용)을 생성합니다:

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

다음으로, 다음 SQL 삽입 문을 사용하여 클릭 수 데이터 세트의 하위 집합을 테이블에 삽입합니다.
이는 clickhouse.com에 원격으로 호스팅된 전체 데이터 세트에서 하위 집합을 로드하기 위해 [URL 테이블 함수](/sql-reference/table-functions/url.md)를 사용합니다:

```sql
INSERT INTO hits_NoPrimaryKey SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```
응답은 다음과 같습니다:
```response
Ok.

0 rows in set. Elapsed: 145.993 sec. Processed 8.87 million rows, 18.40 GB (60.78 thousand rows/s., 126.06 MB/s.)
```

ClickHouse 클라이언트의 결과 출력은 위의 문이 테이블에 8.87백만 행을 삽입했음을 보여줍니다.

마지막으로, 이 가이드의 후속 논의를 단순화하고 다이어그램과 결과의 재현 가능성을 높이기 위해, 우리는 FINAL 키워드를 사용하여 테이블을 [최적화](/sql-reference/statements/optimize.md)합니다:

```sql
OPTIMIZE TABLE hits_NoPrimaryKey FINAL;
```

:::note
일반적으로 데이터 로딩 후 즉시 테이블을 최적화하는 것은 요구되지 않으며 권장되지 않습니다.
이 예에서 이러한 조치가 필요한 이유는 곧 분명해질 것입니다.
:::

이제 우리는 우리의 첫 번째 웹 분석 쿼리를 실행합니다. 다음 쿼리는 UserID 749927693인 인터넷 사용자에 대해 가장 많이 클릭된 상위 10개의 URL을 계산합니다:

```sql
SELECT URL, count(URL) AS Count
FROM hits_NoPrimaryKey
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```
응답은 다음과 같습니다:
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

ClickHouse 클라이언트의 결과 출력은 ClickHouse가 전체 테이블 스캔을 실행했음을 나타냅니다! 우리의 테이블의 8.87백만 행 각각이 ClickHouse로 스트리밍되었습니다. 이는 확장성에 맞지 않습니다.

이를 (훨씬) 더 효율적이고 (상당히) 빠르게 만들기 위해, 우리는 적절한 기본 키를 가진 테이블을 사용해야 합니다. 이를 통해 ClickHouse는 기본 키의 컬럼을 기반으로 자동으로 스파스 기본 인덱스를 생성할 수 있으며, 이를 통해 예제 쿼리의 실행 속도를 상당히 높일 수 있습니다.
## ClickHouse 인덱스 설계 {#clickhouse-index-design}
### 대규모 데이터 규모에 대한 인덱스 설계 {#an-index-design-for-massive-data-scales}

전통적인 관계형 데이터베이스 관리 시스템에서는 기본 인덱스가 테이블 행당 하나의 항목을 포함합니다. 이로 인해 우리 데이터 세트의 기본 인덱스에는 8.87백만 개의 항목이 포함됩니다. 이러한 인덱스는 특정 행의 빠른 위치 파악을 가능하게 하여 검색 쿼리와 포인트 업데이트에 대한 높은 효율성을 제공합니다. `B(+)-Tree` 데이터 구조에서 항목을 검색하는 평균 시간 복잡도는 `O(log n)`입니다; 보다 정확하게는 `log_b n = log_2 n / log_2 b`이며 여기서 `b`는 `B(+)-Tree`의 분기 계수이고 `n`은 인덱싱된 행의 수입니다. 일반적으로 `b`는 수백에서 수천 사이에 있으므로 `B(+)-Trees`는 매우 얕은 구조로 거의 모든 디스크 탐색 없이 레코드를 찾을 수 있습니다. 8.87백만 개의 행과 분기 계수가 1000인 경우 평균적으로 2.3회의 디스크 탐색이 필요합니다. 이러한 능력은 대가를 요구합니다: 추가적인 디스크와 메모리 오버헤드, 테이블에 새로운 행과 인덱스에 항목을 추가할 때 발생하는 높은 삽입 비용, 그리고 때때로 B-트리의 재균형입니다.

B-트리 인덱스와 관련된 도전을 고려할 때, ClickHouse의 테이블 엔진은 다른 접근 방식을 활용합니다. ClickHouse의 [MergeTree 엔진 패밀리](/engines/table-engines/mergetree-family/index.md)는 대규모 데이터 볼륨을 처리하도록 설계되고 최적화되었습니다. 이 테이블은 초당 수백만 행 삽입을 받고 수백 페타바이트의 매우 큰 데이터를 저장하도록 설계되었습니다. 데이터는 [파트 단위로](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage) 신속하게 테이블에 기록되며, 백그라운드에서 파트를 병합하기 위한 규칙이 적용됩니다. ClickHouse에서 각 파트는 자체 기본 인덱스를 가집니다. 파트가 병합되면 병합된 파트의 기본 인덱스도 함께 병합됩니다. ClickHouse가 설계된 매우 대규모 및 메모리 효율성을 가지도록 고려할 때, 모든 행을 인덱싱하는 대신, 파트의 기본 인덱스는 행의 그룹(‘그라뉼’이라고 함)당 하나의 인덱스 항목(‘마크’라고 함)을 갖습니다. 이 기술을 **스파스 인덱스**라고 합니다.

스파스 인덱싱은 ClickHouse가 파트의 행을 기본 키 컬럼에 따라 디스크에 순서대로 저장하기 때문에 가능합니다. 개별 행을 직접 찾는 대신(예: B-트리 기반 인덱스), 스파스 기본 인덱스는 인덱스 항목에 대한 이진 검색을 통해 쿼리에 일치할 수 있는 행 그룹을 신속하게 식별할 수 있도록 해줍니다. 식별된 잠재적으로 일치할 수 있는 행 그룹(그라뉼)은 ClickHouse 엔진으로 병렬 스트리밍되어 일치하는 데이터를 찾습니다. 이러한 인덱스 설계는 기본 인덱스가 작고(메인 메모리에 완전히 맞아야 하며, 맞아야 합니다), 여전히 쿼리 실행 시간을 상당히 단축시킬 수 있게 해줍니다: 특히 데이터 분석 사용 사례에서 일반적인 범위 쿼리에 대해 그렇습니다.

다음은 ClickHouse가 스파스 기본 인덱스를 구축하고 사용하는 방법을 자세히 설명합니다. 후속 부분에서는 인덱스를 구축하는 데 사용되는 테이블 컬럼(기본 키 컬럼)을 선택하고 제거하며 정렬하는 모범 사례에 대해 논의합니다.
### 기본 키가 있는 테이블 {#a-table-with-a-primary-key}

UserID 및 URL 키 컬럼이 있는 복합 기본 키가 있는 테이블을 생성합니다:

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
    DDL 문 상세
    </summary>
    <p>

이 가이드 후속 논의를 단순화하고 다이어그램과 결과의 재현 가능성을 높이기 위해, DDL 문은 다음을 수행합니다:

<ul>
  <li>
    <code>ORDER BY</code> 절을 통해 테이블에 대한 복합 정렬 키를 지정합니다.
  </li>
  <li>
    설정을 통해 기본 인덱스의 인덱스 항목 수를 명시적으로 제어합니다:
    <ul>
      <li>
        <code>index_granularity</code>: 기본값 8192로 명시적으로 설정됩니다. 이는 8192개의 행 그룹마다 기본 인덱스가 하나의 인덱스 항목을 가진다는 것을 의미합니다. 예를 들어, 테이블에 16384개의 행이 포함되어 있다면 인덱스는 두 개의 인덱스 항목을 가집니다.
      </li>
      <li>
        <code>index_granularity_bytes</code>: <a href="https://clickhouse.com/docs/whats-new/changelog/2019/#experimental-features-1" target="_blank">적응형 인덱스 밀도</a>를 비활성화하기 위해 0으로 설정됩니다. 적응형 인덱스 밀도는 ClickHouse가 다음의 경우 n개의 행의 그룹에 대해 하나의 인덱스 항목을 자동으로 생성하는 것을 의미합니다:
        <ul>
          <li>
            <code>n</code>이 8192보다 작고 해당 <code>n</code>개의 행에 대한 결합 행 데이터의 크기가 10MB 이상일 경우(기본값은 <code>index_granularity_bytes</code>).
          </li>
          <li>
            <code>n</code>개의 행에 대한 결합된 행 데이터 크기가 10MB보다 작지만 <code>n</code>이 8192인 경우.
          </li>
        </ul>
      </li>
      <li>
        <code>compress_primary_key</code>: <a href="https://github.com/ClickHouse/ClickHouse/issues/34437" target="_blank">기본 인덱스 압축</a>을 비활성화하기 위해 0으로 설정됩니다. 이는 나중에 우리가 그 내용을 선택적으로 검사할 수 있도록 해줍니다.
      </li>
    </ul>
  </li>
</ul>

</p>
</details>

위 DDL 문에서 기본 키는 지정된 두 키 컬럼을 기반으로 기본 인덱스의 생성을 유도합니다.

<br/>
다음으로 데이터를 삽입합니다:

```sql
INSERT INTO hits_UserID_URL SELECT
   intHash32(UserID) AS UserID,
   URL,
   EventTime
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz', 'TSV', 'WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16), URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8, FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8, UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8, JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8, SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8, SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8, IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8, HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16), RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16, SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32, DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32, NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8, SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64, ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16, GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String, UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String, FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  ParsedParams Nested(Key1 String,  Key2 String, Key3 String, Key4 String, Key5 String,  ValueDouble Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8')
WHERE URL != '';
```
응답은 다음과 같습니다:
```response
0 rows in set. Elapsed: 149.432 sec. Processed 8.87 million rows, 18.40 GB (59.38 thousand rows/s., 123.16 MB/s.)
```

<br/>
그리고 테이블을 최적화합니다:

```sql
OPTIMIZE TABLE hits_UserID_URL FINAL;
```

<br/>
다음 쿼리를 사용하여 테이블의 메타데이터를 얻을 수 있습니다:

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

응답은:

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

ClickHouse 클라이언트의 결과는:

- 테이블의 데이터는 특정 디렉토리에 있는 [넓은 형식](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)으로 저장되어 있으므로 해당 디렉토리 내의 각 테이블 컬럼 당 하나의 데이터 파일(및 하나의 마크 파일)이 있습니다.
- 테이블에는 8.87백만 개의 행이 있습니다.
- 모든 행의 압축되지 않은 데이터 크기는 733.28MB입니다.
- 모든 행의 압축된 크기는 206.94MB입니다.
- 테이블은 1083개의 항목(‘마크’라고 함)을 가진 기본 인덱스를 가지고 있으며 인덱스의 크기는 96.93KB입니다.
- 총합적으로 테이블의 데이터 파일, 마크 파일 및 기본 인덱스 파일이 함께 디스크에서 207.07MB를 차지합니다.
### 데이터는 기본 키 컬럼에 따라 디스크에 정렬되어 저장됩니다 {#data-is-stored-on-disk-ordered-by-primary-key-columns}

우리가 위에서 생성한 테이블은
- 복합 [기본 키](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) `(UserID, URL)`을 가지고 있으며
- 복합 [정렬 키](/engines/table-engines/mergetree-family/mergetree.md/#choosing-a-primary-key-that-differs-from-the-sorting-key) `(UserID, URL, EventTime)`을 가지고 있습니다.

:::note
- 만약 우리가 정렬 키만 지정했더라면, 기본 키는 암묵적으로 정렬 키와 같다고 정의됩니다.

- 메모리 효율성을 고려하여 우리는 쿼리에서 필터링하는 컬럼만 포함된 기본 키를 명시적으로 지정했습니다. 기본 키를 바탕으로 한 기본 인덱스는 메인 메모리에 완전히 로드됩니다.

- 가이드의 다이어그램에서 일관성을 유지하고 압축 비율을 극대화하기 위해 테이블의 모든 컬럼이 포함된 별도의 정렬 키를 정의했습니다(컬럼에 유사한 데이터가 서로 가까이 배치되면, 예를 들어 정렬을 통해, 해당 데이터는 더 잘 압축됩니다).

- 두 개가 지정된 경우, 기본 키는 정렬 키의 접두사여야 합니다.
:::

삽입된 행은 기본 키 컬럼(및 정렬 키로부터의 추가 `EventTime` 컬럼)에 따라 사전식 순으로(오름차순) 디스크에 저장됩니다.

:::note
ClickHouse는 동일한 기본 키 컬럼 값을 갖는 여러 행을 삽입하는 것을 허용합니다. 이 경우(아래 다이어그램의 행 1 및 행 2 참조), 최종 순서는 지정된 정렬 키에 따라 결정되며 따라서 `EventTime` 컬럼의 값에 따라 결정됩니다.
:::

ClickHouse는 <a href="https://clickhouse.com/docs/introduction/distinctive-features/#true-column-oriented-dbms" target="_blank">컬럼형 데이터베이스 관리 시스템</a>입니다. 아래 다이어그램에서 보여준 바와 같이,
- 디스크의 표현을 기준으로, 각 테이블 컬럼당 하나의 데이터 파일(*.bin) 이 존재하며, 그 컬럼에 대한 모든 값이 <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">압축된</a> 형식으로 저장되며,
- 8.87백만 행은 기본 키 컬럼과 추가 정렬 키 컬럼에 따라 사전식 오름차순으로 디스크에 저장됩니다. 즉, 이 경우에는
  - 첫 번째는 `UserID`,
  - 그 다음은 `URL`,
  - 마지막으로 `EventTime`입니다:

<Image img={sparsePrimaryIndexes01} size="md" alt="Sparse Primary Indices 01" background="white"/>

`UserID.bin`, `URL.bin`, 및 `EventTime.bin`은 각각의 `UserID`, `URL`, 및 `EventTime` 컬럼 값이 저장된 데이터 파일입니다.

:::note
- 기본 키가 디스크의 행 순서를 정의하므로, 하나의 테이블은 하나의 기본 키만 가질 수 있습니다.

- ClickHouse 내부 행 번호 매기기 스킴에 맞춰 0부터 시작하여 행을 번호 매기고 있습니다. 이는 로그 메시지에도 사용됩니다.
:::
### 데이터는 병렬 데이터 처리를 위해 그라뉼로 조직됩니다 {#data-is-organized-into-granules-for-parallel-data-processing}

데이터 처리 목적을 위해, 테이블의 컬럼 값은 논리적으로 그라뉼로 나뉩니다.
그라뉼은 ClickHouse에 데이터 처리를 위해 스트리밍되는 가장 작은 분할 불가능한 데이터 세트입니다.
즉, ClickHouse는 개별 행을 읽는 대신 항상 행 그룹(그라뉼)을 전체적으로 읽습니다(스트리밍 방식 및 병렬로).
:::note
컬럼 값은 물리적으로 그라뉼 내에 저장되지 않습니다: 그라뉼은 쿼리 처리를 위한 컬럼 값을 논리적으로 조직한 것입니다.
:::

아래 다이어그램은 테이블의 DDL 문에 포함된 설정 `index_granularity` (기본값 8192)에 따라 8.87백만 행의 (컬럼 값의) 데이터가 1083개의 그라뉼로 조직된 방법을 보여줍니다.

<Image img={sparsePrimaryIndexes02} size="md" alt="Sparse Primary Indices 02" background="white"/>

물리적 디스크 순서를 기준으로 처음 8192개의 행(그들의 컬럼 값)은 논리적으로 그라뉼 0에 속하고, 그 다음 8192개의 행(그들의 컬럼 값)은 그라뉼 1에 속하며, 그 다음 그러합니다.

:::note
- 마지막 그라뉼(그라뉼 1082)은 8192개보다 적은 행을 "포함"합니다.

- 우리는 이 가이드의 시작 부분에서 "DDL 문 상세"에서 [적응형 인덱스 밀도](/whats-new/changelog/2019.md/#experimental-features-1)를 비활성화했다고 언급했습니다(가이드의 논의를 단순화하고 다이어그램과 결과의 재현 가능성을 높이기 위해).

  따라서 우리의 예제 테이블의 모든 그라뉼(마지막 것을 제외하고)은 동일한 크기를 가집니다.

- 적응형 인덱스 밀도가 있는 테이블에서는 (인덱스 밀도가 기본적으로 [적응형](/operations/settings/merge-tree-settings#index_granularity_bytes) 이므로) 일부 그라뉼의 크기가 행 데이터 크기에 따라 8192 개보다 작을 수 있습니다.

- 우리는 기본 키 컬럼 (`UserID`, `URL`)의 일부 컬럼 값을 주황색으로 표시했습니다.
  이러한 주황색으로 표시된 컬럼 값은 각 그라뉼의 첫 번째 행의 기본 키 컬럼 값입니다.
  아래에서 볼 수 있듯이, 이러한 주황색으로 표시된 컬럼 값들은 테이블의 기본 인덱스에 있는 항목이 될 것입니다.

- 우리는 로그 메시지와도 연관되도록 0부터 시작하여 그라뉼에 번호를 매기고 있습니다.
:::
### 기본 인덱스는 각 그라뉼당 하나의 항목을 가집니다 {#the-primary-index-has-one-entry-per-granule}

기본 인덱스는 위의 다이어그램에서 보여준 그라뉼을 기반으로 생성됩니다. 이 인덱스는 하나의 "마크"를 포함한 비압축 평면 배열 파일(primary.idx)입니다. 

아래 다이어그램은 인덱스가 각 그라뉼의 첫 번째 행에 대한 기본 키 컬럼 값을(위의 다이어그램에서 주황색으로 표시된 값)를 저장하는 방법을 보여줍니다.
정확히 말하면, 기본 인덱스는 테이블의 8192번째 행 기준으로 기본 키 컬럼 값을 저장합니다.
예를 들어
- 첫 번째 인덱스 항목('마크 0' 아래 다이어그램)은 위에서 보여준 그라뉼 0의 첫 번째 행의 키 컬럼 값을 저장하고,
- 두 번째 인덱스 항목('마크 1' 아래 다이어그램)은 위에서 보여준 그라뉼 1의 첫 번째 행의 키 컬럼 값을 저장하며, 이런 식입니다.

<Image img={sparsePrimaryIndexes03a} size="lg" alt="Sparse Primary Indices 03a" background="white"/>

총 8.87백만 행과 1083개의 그라뉼이 있는 테이블에 대해 인덱스는 1083개의 항목을 갖습니다:

<Image img={sparsePrimaryIndexes03b} size="md" alt="Sparse Primary Indices 03b" background="white"/>

:::note
- [적응형 인덱스 밀도](/whats-new/changelog/2019.md/#experimental-features-1)가 있는 테이블의 경우, 마지막 테이블 행의 기본 키 컬럼 값을 기록하는 "최종" 추가 마크가 기본 인덱스에 저장되지만, 적응형 인덱스 밀도를 비활성화했기 때문에(가이드의 논의를 단순화하고 다이어그램과 결과의 재현 가능성을 높이기 위해), 우리의 예제 테이블의 인덱스는 이 최종 마크를 포함하지 않습니다.

- 기본 인덱스 파일은 메인 메모리에 완전히 로드됩니다. 파일이 사용 가능한 여유 메모리 공간보다 크면 ClickHouse는 오류를 발생시킵니다.
:::

<details>
    <summary>
    기본 인덱스 내용 검사하기
    </summary>
    <p>

자체 관리 ClickHouse 클러스터에서 우리는 [파일 테이블 함수](https://clickhouse.com/docs/sql-reference/table-functions/file/)를 사용하여 예제 테이블의 기본 인덱스 내용을 검사할 수 있습니다.

우선, 기본 인덱스 파일을 실행 중인 클러스터의 노드의 <a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-user_files_path" target="_blank">user_files_path</a>로 복사해야 합니다:
<ul>
<li>단계 1: 기본 인덱스 파일을 포함하는 파트 경로 가져오기</li>
`
SELECT path FROM system.parts WHERE table = 'hits_UserID_URL' AND active = 1
`

테스트 머신에서 `/Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4`을 반환합니다.

<li>단계 2: user_files_path 가져오기</li>
기본 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.12/programs/server/config.xml#L505" target="_blank">user_files_path</a>는 리눅스에서
`/var/lib/clickhouse/user_files/`

이며, 리눅스에서 변경되었는지 확인할 수 있습니다: `$ grep user_files_path /etc/clickhouse-server/config.xml`

테스트 머신에서 경로는 `/Users/tomschreiber/Clickhouse/user_files/`입니다.

<li>단계 3: 기본 인덱스 파일을 user_files_path에 복사하기</li>

`cp /Users/tomschreiber/Clickhouse/store/85f/85f4ee68-6e28-4f08-98b1-7d8affa1d88c/all_1_9_4/primary.idx /Users/tomschreiber/Clickhouse/user_files/primary-hits_UserID_URL.idx`

</ul>

<br/>
이제 SQL을 통해 기본 인덱스의 내용을 검사할 수 있습니다:
<ul>
<li>항목 수 가져오기</li>
`
SELECT count( )<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String');
`
반환값은 `1083`입니다.

<li>첫 두 인덱스 마크 가져오기</li>
`
SELECT UserID, URL<br/>FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 0, 2;
`

반환값은

`
240923, http://showtopics.html%3...<br/>
4073710, http://mk.ru&pos=3_0
`

<li>마지막 인덱스 마크 가져오기</li>
`
SELECT UserID, URL FROM file('primary-hits_UserID_URL.idx', 'RowBinary', 'UserID UInt32, URL String')<br/>LIMIT 1082, 1;
`
반환값은
`
4292714039 │ http://sosyal-mansetleri...
`
</ul>
<br/>
이것은 우리의 예제 테이블에 대한 기본 인덱스 내용 다이어그램과 정확히 일치합니다:

</p>
</details>

기본 키 항목은 각 인덱스 항목이 특정 데이터 범위의 시작을 표시하기 때문에 인덱스 마크라고 불립니다. 예제 테이블에 대해:
- UserID 인덱스 마크:

  기본 인덱스에 저장된 `UserID` 값들은 오름차순으로 정렬되어 있습니다.<br/>
  따라서 위 다이어그램의 '마크 1'은 그라뉼 1 내의 모든 테이블 행의 `UserID` 값이 4.073.710보다 크거나 같다는 것을 보장합니다.

 [추후에 볼 수 있듯이](#the-primary-index-is-used-for-selecting-granules), 이 전역적인 순서는 ClickHouse가 쿼리가 기본 키의 첫 번째 열을 필터링할 때, 인덱스 마크에 대해 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">이진 검색 알고리즘</a>을 사용할 수 있게 해줍니다.

- URL 인덱스 마크:

  기본 키 컬럼 `UserID`와 `URL`의 유사한 카디널리티는,
  일반적으로 첫 번째 컬럼 이후의 모든 키 컬럼에 대한 인덱스 마크가 데이터 범위를만 표시하는 것을 의미합니다. 이는 현재 그라뉼 내 모든 테이블 행의 선행 키 컬럼 값이 같을 때만 해당됩니다.<br/>
 예를 들어, 위 다이어그램의 마크 0과 마크 1의 UserID 값이 다르므로 ClickHouse는 그라뉼 0의 모든 테이블 행의 URL 값이 `'http://showtopics.html%3...'`보다 크거나 같다고 가정할 수 없습니다. 그러나 만약 위 다이어그램에서 마크 0과 마크 1의 UserID 값이 같다면(즉, UserID 값이 그라뉼 0의 모든 테이블 행에서 동일하게 유지된다면), ClickHouse는 그라뉼 0의 모든 테이블 행의 URL 값이 `'http://showtopics.html%3...'`보다 크거나 같다고 가정할 수 있습니다.

  우리는 이것이 쿼리 실행 성능에 미치는 영향을 더 자세히 논의할 것입니다.
### 기본 인덱스는 그라뉼 선택에 사용됩니다 {#the-primary-index-is-used-for-selecting-granules}

이제 기본 인덱스로 지원되는 쿼리를 실행할 수 있습니다.

다음은 UserID 749927693에 대해 가장 많이 클릭된 상위 10개의 URL을 계산합니다.

```sql
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

응답은:

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

ClickHouse 클라이언트의 출력은 이제 전체 테이블 스캔 대신 8.19천 개의 행만 ClickHouse로 스트리밍되었음을 보여줍니다.

<a href="https://clickhouse.com/docs/operations/server-configuration-parameters/settings/#server_configuration_parameters-logger" target="_blank">추적 로깅</a>이 활성화되어 있다면 ClickHouse 서버 로그 파일은 ClickHouse가 1083개의 UserID 인덱스 마크에 대해 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">이진 검색</a>을 실행하여 UserID 컬럼 값이 `749927693`인 행을 포함할 수 있는 그라뉼을 식별하고 있음을 보여줍니다. 이 과정에서 19단계를 필요로 하며, 평균 시간 복잡도는 `O(log2 n)`입니다:
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

위의 추적 로그에서 우리는 1083개의 기존 마크 중 하나가 쿼리를 만족시킨 것을 볼 수 있습니다.

<details>
    <summary>
    추적 로그 상세
    </summary>
    <p>

마크 176이 식별되었으며('왼쪽 경계 마크 발견'은 포함되며, '오른쪽 경계 마크 발견'은 제외됨), 따라서 그라뉼 176(행 1.441.792에서 시작)이 ClickHouse로 스트리밍되어 UserID 컬럼 값이 `749927693`인 실제 행을 찾습니다.
</p>
</details>

우리는 예제 쿼리에서 <a href="https://clickhouse.com/docs/sql-reference/statements/explain/" target="_blank">EXPLAIN 절</a>를 사용하여 이를 재현할 수 있습니다:
```sql
EXPLAIN indexes = 1
SELECT URL, count(URL) AS Count
FROM hits_UserID_URL
WHERE UserID = 749927693
GROUP BY URL
ORDER BY Count DESC
LIMIT 10;
```

응답은 다음과 같습니다:

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

클라이언트 출력은 1083개의 그라뉼 중 하나가 UserID 컬럼 값이 749927693인 행을 포함할 가능성이 있는 것으로 선택되었음을 보여줍니다.

:::note 결론
쿼리가 복합 키의 일부인 열을 필터링하고 첫 번째 키 열인 경우, ClickHouse는 해당 키 열의 인덱스 마크에 대해 이진 검색 알고리즘을 실행합니다.
:::

<br/>

위에서 논의한 것처럼 ClickHouse는 스파스 기본 인덱스를 사용하여 쿼리에 일치할 수 있는 행을 포함할 수 있는 그라뉼을 신속하게(이진 검색을 통해) 선택합니다.

이는 ClickHouse 쿼리 실행의 **첫 번째 단계(그라뉼 선택)**입니다.

**두 번째 단계(데이터 읽기)**에서는 ClickHouse가 선택된 그라뉼을 찾아서 그 안의 모든 행을 ClickHouse 엔진으로 스트리밍하여 실제로 쿼리에 일치하는 행을 찾습니다.

이 두 번째 단계에 대해서는 다음 섹션에서 더 자세히 논의할 것입니다.
### 마크 파일은 그라뉼을 찾는 데 사용됩니다 {#mark-files-are-used-for-locating-granules}

다음 다이어그램은 우리 테이블의 기본 인덱스 파일의 일부를 보여줍니다.

<Image img={sparsePrimaryIndexes04} size="md" alt="Sparse Primary Indices 04" background="white"/>

위에서 논의된 바와 같이, 인덱스의 1083 UserID 마크에 대해 이진 검색을 통해 마크 176이 확인되었습니다. 따라서 그에 해당하는 그라뉼 176은 UserID 컬럼 값이 749.927.693인 행을 포함할 수 있습니다.

<details>
    <summary>
    그라뉼 선택 세부정보
    </summary>
    <p>

위 다이어그램은 마크 176이 연결된 그라뉼 176의 최소 UserID 값이 749.927.693보다 작고, 다음 마크(마크 177)의 그라뉼 177의 최소 UserID 값이 이 값보다 크다는 첫 번째 인덱스 항목임을 보여줍니다. 따라서 마크 176에 해당하는 그라뉼 176만이 UserID 컬럼 값이 749.927.693인 행을 포함할 수 있습니다.
</p>
</details>

그라뉼 176에 있는 일부 행이 UserID 컬럼 값이 749.927.693인지 확인(또는 확인하지 않음)하려면 이 그라뉼에 속하는 모든 8192 행이 ClickHouse로 스트리밍되어야 합니다.

이를 달성하기 위해 ClickHouse는 그라뉼 176의 물리적 위치를 알아야 합니다.

ClickHouse에서는 테이블의 모든 그라뉼에 대한 물리적 위치가 마크 파일에 저장됩니다. 데이터 파일과 유사하게, 각 테이블 컬럼마다 하나의 마크 파일이 있습니다.

다음 다이어그램은 테이블의 `UserID`, `URL`, 및 `EventTime` 컬럼의 그라뉼에 대한 물리적 위치를 저장하는 세 개의 마크 파일 `UserID.mrk`, `URL.mrk`, 및 `EventTime.mrk`를 보여줍니다.

<Image img={sparsePrimaryIndexes05} size="md" alt="Sparse Primary Indices 05" background="white"/>

우리는 기본 인덱스가 인덱스 마크 번호가 0에서 시작하는 평면 비압축 배열 파일(primary.idx)이라는 점에 대해 논의했습니다.

유사하게, 마크 파일은 인덱스 마크 번호가 0에서 시작하는 평면 비압축 배열 파일(*.mrk)입니다.

ClickHouse가 쿼리에 대한 일치하는 행을 포함할 수 있는 그라뉼의 인덱스 마크를 식별하고 선택한 후, 마크 파일에서 위치 배열 조회를 수행하여 그라뉼의 물리적 위치를 얻을 수 있습니다.

특정 컬럼의 각 마크 파일 항목은 두 개의 위치를 오프셋 형태로 저장합니다:

- 첫 번째 오프셋(위 다이어그램의 'block_offset')은 선택된 그라뉼의 압축된 버전을 포함하는 <a href="https://clickhouse.com/docs/development/architecture/#block" target="_blank">블록</a>을 <a href="https://clickhouse.com/docs/introduction/distinctive-features/#data-compression" target="_blank">압축된</a> 컬럼 데이터 파일에서 찾아줍니다. 이 압축된 블록은 몇 개의 압축된 그라뉼을 포함할 수 있습니다. 찾아낸 압축된 파일 블록은 읽을 때 주 메모리로 압축이 해제됩니다.

- 두 번째 오프셋(위 다이어그램의 'granule_offset')은 비압축 블록 데이터 내에서 그라뉼의 위치를 제공합니다.

그런 다음 찾아진 비압축 그라뉼에 속하는 모든 8192 행이 ClickHouse로 스트리밍되어 추가 처리됩니다.

:::note

- [와이드 포맷](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)의 테이블이고 [적응형 인덱스 세분성](/whats-new/changelog/2019.md/#experimental-features-1)이 없는 경우, ClickHouse는 위와 같이 시각화된 `.mrk` 마크 파일을 사용하여 각각의 항목에 대해 8바이트 길이의 주소 두 개를 포함합니다. 이러한 항목은 모두 크기가 같은 그라뉼의 물리적 위치입니다.

인덱스 세분성은 [기본값](/operations/settings/merge-tree-settings#index_granularity_bytes)으로 적응형이지만, 예제 테이블의 경우 논의를 간단하게 만들기 위해 적응형 인덱스 세분성이 비활성화되었습니다(그리고 다이어그램 및 결과를 재현할 수 있도록). 우리의 테이블은 데이터의 크기가 [min_bytes_for_wide_part](/operations/settings/merge-tree-settings#min_bytes_for_wide_part)보다 크기 때문에 와이드 포맷을 사용하고 있습니다(기본값은 10MB이며, 이는 자체 관리 클러스터에 해당).

- 와이드 포맷과 적응형 인덱스 세분성이 있는 테이블의 경우, ClickHouse는 `.mrk2` 마크 파일을 사용합니다. 이 파일은 `.mrk` 마크 파일과 유사한 항목을 포함하되, 각 항목에 대한 추가적인 세 번째 값을 포함합니다: 현재 항목과 연결된 그라뉼의 행 수입니다.

- [콤팩트 포맷](/engines/table-engines/mergetree-family/mergetree.md/#mergetree-data-storage)의 테이블의 경우, ClickHouse는 `.mrk3` 마크 파일을 사용합니다.

:::

:::note 마크 파일의 이유

왜 기본 인덱스가 인덱스 마크와 대응하는 그라뉼의 물리적 위치를 직접 포함하지 않습니까?

ClickHouse가 설계된 그러한 매우 큰 규모에서는 디스크와 메모리를 효율적으로 사용하는 것이 중요합니다.

기본 인덱스 파일은 메인 메모리에 맞아야 합니다.

예제 쿼리의 경우 ClickHouse는 기본 인덱스를 사용하여 쿼리와 일치하는 행을 포함할 수 있는 단일 그라뉼을 선택했습니다. 이 한 그라뉼에 대해서만 ClickHouse는 해당 행의 스트리밍을 위한 물리적 위치가 필요합니다.

또한, 이 오프셋 정보는 UserID 및 URL 컬럼에만 필요합니다.

쿼리에 사용되지 않는 컬럼, 예를 들어 `EventTime`의 경우 오프셋 정보는 필요하지 않습니다.

샘플 쿼리의 경우 ClickHouse는 UserID 데이터 파일(UserID.bin)의 그라뉼 176에 대한 물리적 위치 오프셋 두 개와 URL 데이터 파일(URL.bin)의 그라뉼 176에 대한 물리적 위치 오프셋 두 개만 필요합니다.

마크 파일이 제공하는 간접성은 기본 인덱스 내에 모든 1083 그라뉼의 물리적 위치에 대한 항목을 직접 저장하는 것을 피할 수 있습니다: 따라서 메인 메모리에 불필요한(잠재적으로 사용되지 않는) 데이터를 갖지 않게 됩니다.
:::

다음 다이어그램과 아래 텍스트는 예제 쿼리에 대해 ClickHouse가 UserID.bin 데이터 파일 내에서 그라뉼 176을 찾는 방식을 설명합니다.

<Image img={sparsePrimaryIndexes06} size="md" alt="Sparse Primary Indices 06" background="white"/>

우리는 이 가이드에서 ClickHouse가 기본 인덱스 마크 176을 선택했고 따라서 그라뉼 176이 쿼리에 대한 일치하는 행을 포함하고 있을 수 있음을 논의했습니다.

ClickHouse는 이제 인덱스에서 선택된 마크 번호(176)를 사용하여 UserID.mrk 마크 파일에서 그라뉼 176을 찾기 위한 두 개의 오프셋을 얻기 위해 위치 배열 조회를 수행합니다.

보시는 바와 같이 첫 번째 오프셋은 UserID.bin 데이터 파일 내에서 압축된 파일 블록을 찾고, 그 블록은 그라뉼 176의 압축된 버전을 포함하고 있습니다.

찾아낸 파일 블록이 메인 메모리로 압축이 해제된 후, 마크 파일의 두 번째 오프셋을 사용하여 비압축 데이터 내에서 그라뉼 176을 찾을 수 있습니다.

ClickHouse는 예제 쿼리를 실행하기 위해 UserID.bin 데이터 파일과 URL.bin 데이터 파일의 두 곳에서 그라뉼 176을 찾아야 합니다(사용자의 UserID가 749.927.693인 가장 많이 클릭된 URL 상위 10개).

위 다이어그램은 ClickHouse가 UserID.bin 데이터 파일의 그라뉼을 찾는 방식을 보여줍니다.

동시에 ClickHouse는 URL.bin 데이터 파일의 그라뉼 176에 대해서도 동일한 작업을 수행합니다. 두 개의 해당 그라뉼이 정렬되어 ClickHouse 엔진으로 스트리밍되어 추가 처리 즉, UserID가 749.927.693인 모든 행에 대해 URL 값을 그룹별로 집계하고 수를 세어야 하며, 마지막으로 상위 10 개 URL 그룹을 내림차순으로 출력해야 합니다.
## 여러 기본 인덱스를 사용하는 방법 {#using-multiple-primary-indexes}

<a name="filtering-on-key-columns-after-the-first"></a>
### 보조 키 컬럼이 비효율적일 수 있음 {#secondary-key-columns-can-not-be-inefficient}

쿼리가 복합 키의 일부인 컬럼을 필터링하는 경우, 그리고 그 컬럼이 첫 번째 키 컬럼일 경우 [ClickHouse는 키 컬럼의 인덱스 마크에 대한 이진 검색 알고리즘을 실행합니다](#the-primary-index-is-used-for-selecting-granules).

그런데 복합 키의 일부인 컬럼을 필터링하고 있으면서 첫 번째 키 컬럼이 아닐 경우에는 어떻게 될까요?

:::note
쿼리가 명시적으로 첫 번째 키 컬럼이 아닌 두 번째 키 컬럼을 필터링하는 시나리오에 대해 논의합니다.

쿼리가 첫 번째 키 컬럼과 그 이후의 키 컬럼을 모두 필터링하는 경우, ClickHouse는 첫 번째 키 컬럼의 인덱스 마크에 대해 이진 검색을 실행합니다.
:::

<br/>
<br/>

<a name="query-on-url"></a>
우리는 URL "http://public_search"를 가장 많이 클릭한 상위 10명의 사용자를 계산하는 쿼리를 사용합니다:

```sql
SELECT UserID, count(UserID) AS Count
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

응답은: <a name="query-on-url-slow"></a>
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

클라이언트 출력은 ClickHouse가 [URL 컬럼이 복합 기본 키의 일부임에도 불구하고](#a-table-with-a-primary-key) 거의 전체 테이블 스캔을 수행했음을 나타냅니다! ClickHouse는 887만 개의 행 중 881만 행을 읽습니다.

[trace_logging](/operations/server-configuration-parameters/settings#logger)가 활성화된 경우 ClickHouse 서버 로그 파일은 ClickHouse가 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">일반적인 배제 검색</a>을 사용하여 1083 개의 URL 인덱스 마크를 통해 "http://public_search" 컬럼 값이 포함될 수 있는 그라뉼을 식별했다고 보여줍니다:
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
위의 샘플 추적 로그에서, 1076(마크를 통해) 개의 그라뉼이 선택되어 행을 포함할 가능성이 있습니다.

이로 인해 ClickHouse 엔진으로 881만 개의 행이 스트리밍되어, 실제로 URL 값이 "http://public_search"인 행을 식별하는 데 사용됩니다.

그러나 후속에서 알 수 있듯이, 선택된 1076 개의 그라뉼 중에서 실제로 일치하는 행을 포함한 것은 단 39개뿐입니다.

복합 기본 키(UserID, URL)를 기반으로 하는 기본 인덱스는 특정 UserID 값과 일치하는 행을 필터링하는 쿼리 속도를 높이는 데 매우 유용했지만, 특정 URL 값으로 행을 필터링하는 쿼리의 속도를 높이는 데는 그다지 도움이 되지 않습니다.

그 이유는 URL 컬럼이 첫 번째 키 컬럼이 아니기 때문에 ClickHouse는 URL 컬럼의 인덱스 마크에 대해 일반적인 배제 검색 알고리즘을 사용하고 있으며, **이 알고리즘의 효과는** URL 컬럼과 그 이전의 키 컬럼인 UserID 간의 카디널리티 차이에 의존합니다.

이를 설명하기 위해, 일반적인 배제 검색이 작동하는 방식을 자세히 설명합니다.

<a name="generic-exclusion-search-algorithm"></a>
### 일반 배제 검색 알고리즘 {#generic-exclusion-search-algorithm}

다음은 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1438" target="_blank">ClickHouse 일반 배제 검색 알고리즘</a>이 카디널리티가 낮거나 높은 이전 키 컬럼을 갖는 보조 컬럼을 통해 그라뉼이 선택되는 방식을 설명합니다.

두 가지 경우를 위한 예로 다음을 가정하겠습니다:
- URL 값이 "W3"인 행을 찾는 쿼리.
- UserID와 URL에 대해 단순화된 값을 가진 추상적인 히트 테이블.
- 인덱스에 대해 동일한 복합 기본 키(UserID, URL). 이는 행이 먼저 UserID 값으로 정렬되어 있다는 것을 의미합니다. 동일한 UserID 값을 가진 행은 그 다음 URL로 정렬됩니다.
- 그라뉼 크기가 2, 즉 각 그라뉼이 2개의 행을 포함합니다.

다음 다이어그램에서 각 그라뉼의 첫 번째 테이블 행에 대한 키 컬럼 값을 주황색으로 표시했습니다.

**이전 키 컬럼의 카디널리티가 낮은 경우**<a name="generic-exclusion-search-fast"></a>

UserID의 카디널리티가 낮다고 가정해 보겠습니다. 이 경우 동일한 UserID 값이 여러 테이블 행 및 그라뉼, 따라서 인덱스 마크에 분산될 가능성이 높습니다. 동일한 UserID에 대해 인덱스 마크의 URL 값은 오름차순으로 정렬됩니다(테이블 행이 먼저 UserID로 정렬되기 때문). 이는 다음과 같이 효율적인 필터링을 허용합니다.

<Image img={sparsePrimaryIndexes07} size="md" alt="Sparse Primary Indices 06" background="white"/>

위 다이어그램에서 우리의 추상 샘플 데이터에 대해 그라뉼 선택 프로세스에는 세 가지 다른 시나리오가 있습니다:

1. URL 값이 W3보다 작고, 바로 다음 인덱스 마크의 URL 값도 W3보다 작은 **인덱스 마크 0**는 배제 가능합니다. 이는 마크 0 및 1이 동일한 UserID 값을 가짐을 나타냅니다. 이 배제 전제 조건은 그라뉼 0이 U1 UserID 값으로 완전히 구성되었음을 보장하므로 ClickHouse는 그라뉼 0의 최대 URL 값 또한 W3보다 작다고 가정하고 그라뉼을 배제할 수 있습니다.

2. W3보다 작거나 같은 **URL 값을 가진 인덱스 마크 1**은 URL 값이 W3보다 크거나 같은 바로 다음 인덱스 마크의 URL 값도 포함하므로 선택됩니다. 이는 그라뉼 1이 URL W3인 행을 포함할 가능성이 있음을 의미합니다.

3. URL 값이 W3보다 큰 **인덱스 마크 2 및 3**은 배제될 수 있습니다. 이는 기본 인덱스의 인덱스 마크가 각 그라뉼의 첫 번째 테이블 행에 대한 키 컬럼 값을 저장하고 테이블 행이 디스크에 키 컬럼 값에 따라 정렬되기 때문에, 그라뉼 2 및 3은 URL 값 W3을 포함할 수 없음을 나타냅니다.

**이전 키 컬럼의 카디널리티가 높은 경우**<a name="generic-exclusion-search-slow"></a>

UserID의 카디널리티가 높은 경우 동일한 UserID 값이 여러 테이블 행 및 그라뉼에 분산될 가능성이 낮습니다. 즉, 인덱스 마크의 URL 값은 단순히 증가하지 않습니다:

<Image img={sparsePrimaryIndexes08} size="md" alt="Sparse Primary Indices 06" background="white"/>

위 다이어그램에서 볼 수 있듯이, W3보다 작은 URL 값을 가진 모든 표시된 마크가 그라뉼의 관련 행을 ClickHouse 엔진으로 스트리밍하기 위해 선택됩니다.

이는 다이어그램 내 모든 인덱스 마크가 위에서 설명한 시나리오 1에 포함되지만, *직접 후속 인덱스 마크가 현재 마크와 동일한 UserID 값을 가지고 있다는 배제 전제 조건을* 만족하지 않기 때문에 제외될 수 없음을 의미합니다.

예를 들어, URL 값이 W3보다 작은 **인덱스 마크 0**은 다음 인덱스 마크 1이 현재 마크 0과 동일한 UserID 값을 가지고 있지 않기 때문에 배제될 수 없습니다.

결국 ClickHouse는 그라뉼 0이 여전히 URL 값 W3인 행을 포함할 수 있다는 가정을 해야 하고, 마크 0을 선택해야 합니다.

같은 시나리오는 마크 1, 2 및 3에도 적용됩니다.

:::note 결론
ClickHouse가 사용하고 있는 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444" target="_blank">일반 배제 검색 알고리즘</a>은 쿼리가 복합 키의 일부인 컬럼을 필터링하면서 첫 번째 키 컬럼이 아닐 경우, 이전 키 컬럼이 카디널리티가 낮을수록 가장 효과적입니다.
:::

우리의 샘플 데이터 집합에서 두 키 컬럼(UserID, URL)은 유사한 높은 카디널리티를 가지고 있으며, 설명한 대로 URL 컬럼의 이전 키 컬럼이 높은 또는 유사한 카디널리티를 가지고 있을 때 일반 배제 검색 알고리즘이 그다지 효과적이지 않습니다.
### 데이터 스킵 인덱스에 대한 주의 사항 {#note-about-data-skipping-index}

UserID와 URL의 유사한 높은 카디널리 때문에, 우리의 [URL에서 필터링하는 쿼리](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) 또한 URL 컬럼에 대해 [보조 데이터 스킵 인덱스](./skipping-indexes.md)를 생성하는 것에서 큰 혜택을 보지 못할 것입니다.

예를 들어, 이 두 문장은 우리 테이블의 URL 컬럼에 대한 [minmax](/engines/table-engines/mergetree-family/mergetree.md/#primary-keys-and-indexes-in-queries) 데이터 스킵 인덱스를 생성하고 채웁니다:
```sql
ALTER TABLE hits_UserID_URL ADD INDEX url_skipping_index URL TYPE minmax GRANULARITY 4;
ALTER TABLE hits_UserID_URL MATERIALIZE INDEX url_skipping_index;
```
ClickHouse는 이제 그룹의 4개의 연속 [그라뉼](#data-is-organized-into-granules-for-parallel-data-processing)에 대해 각 4개의 [그라뉼](#data-is-organized-into-granules-for-parallel-data-processing)마다 최소 및 최대 URL 값을 저장하는 추가 인덱스를 생성했습니다(위 `ALTER TABLE` 문에서 `GRANULARITY 4` 조항을 참조하십시오):

<Image img={sparsePrimaryIndexes13a} size="md" alt="Sparse Primary Indices 13a" background="white"/>

첫 번째 인덱스 항목 ('마크 0' 위 다이어그램에서)은 우리 테이블의 첫 번째 4개의 그라뉼에 속하는 [행의 최소 및 최대 URL 값](#data-is-organized-into-granules-for-parallel-data-processing)을 저장합니다.

두 번째 인덱스 항목 ('마크 1')은 우리 테이블의 다음 4개의 그라뉼에 속하는 행의 최소 및 최대 URL 값을 저장하며, 그렇게 진행됩니다.

(ClickHouse는 또한 [마크 파일](#mark-files-are-used-for-locating-granules)에 대한 데이터 스킵 인덱스의 그룹을 [찾는](#mark-files-are-used-for-locating-granules) 데 사용되는 특별한 마크 파일을 생성했습니다.)

UserID와 URL의 유사한 높은 카디널리 때문에, 이 보조 데이터 스킵 인덱스는 URL에서 필터링하는 쿼리가 실행될 때 그라뉼이 선택되는 것을 제외하는 데 도움을 줄 수 없습니다.

쿼리가 찾고 있는 특정 URL 값(즉, 'http://public_search')은 각 그라뉼 그룹에 대해 인덱스에 저장된 최소 및 최대 값 사이에 있을 가능성이 매우 높아서 ClickHouse는(그라뉼이 쿼리와 일치하는 행을 포함할 수 있으므로) 해당 그룹의 그라뉼을 선택해야 합니다.
### 여러 기본 인덱스를 사용해야 하는 필요성 {#a-need-to-use-multiple-primary-indexes}

결과적으로 특정 URL로 행을 필터링하는 샘플 쿼리의 속도를 크게 높이고자 한다면, 해당 쿼리에 최적화된 기본 인덱스를 사용해야 합니다.

또한 특정 UserID로 행을 필터링하는 샘플 쿼리의 성능을 유지하고자 한다면 여러 기본 인덱스를 사용해야 합니다.

다음은 이를 달성하는 방법을 보여줍니다.

<a name="multiple-primary-indexes"></a>
### 추가 기본 인덱스를 생성하기 위한 옵션 {#options-for-creating-additional-primary-indexes}

두 샘플 쿼리, 즉 특정 UserID로 행을 필터링하는 쿼리와 특정 URL로 행을 필터링하는 쿼리를 모두 크게 가속화하려면, 다음 세 가지 옵션 중 하나를 사용하여 여러 기본 인덱스를 사용해야 합니다.

- **두 번째 테이블**을 생성하여 다른 기본 키를 설정합니다.
- 기존 테이블에서 **물리화된 뷰**를 생성합니다.
- 기존 테이블에 **프로젝션**을 추가합니다.

모든 세 가지 옵션은 효과적으로 샘플 데이터를 추가 테이블로 복제하여 기본 인덱스와 행 정렬 순서를 재구성합니다.

하지만 이 세 가지 옵션은 쿼리와 인서트 문에 대한 라우팅에 있어서 추가 테이블의 투명성의 차이가 있습니다.

**두 번째 테이블**을 생성할 때는 쿼리를 해당 쿼리에 가장 적합한 테이블 버전으로 명시적으로 보내야 하며, 데이터를 두 테이블 모두에 명시적으로 삽입해야 테이블이 동기화됩니다:

<Image img={sparsePrimaryIndexes09a} size="md" alt="Sparse Primary Indices 09a" background="white"/>

**물리화된 뷰**를 사용하면 추가 테이블이 암묵적으로 생성되며, 데이터가 두 테이블 간에 자동으로 동기화됩니다:

<Image img={sparsePrimaryIndexes09b} size="md" alt="Sparse Primary Indices 09b" background="white"/>

**프로젝션**은 가장 투명한 옵션입니다. 암묵적으로 생성된(그리고 숨김 처리된) 추가 테이블이 데이터 변경 사항과 동기화되도록 자동으로 유지하는 것 외에도, ClickHouse는 쿼리에 대해 가장 효과적인 테이블 버전을 자동으로 선택합니다:

<Image img={sparsePrimaryIndexes09c} size="md" alt="Sparse Primary Indices 09c" background="white"/>

다음에서는 여러 기본 인덱스를 생성하고 사용하는 세 가지 옵션에 대해 자세히 논의하고 실제 예를 보여드립니다.

<a name="multiple-primary-indexes-via-secondary-tables"></a>
### 옵션 1: 보조 테이블 {#option-1-secondary-tables}

기본 키에서 키 컬럼 순서를 전환하여 새 추가 테이블을 생성합니다(원래 테이블과 비교할 경우):

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

우리의 [원래 테이블](#a-table-with-a-primary-key)에서 887만 개의 모든 행을 추가 테이블에 삽입합니다:

```sql
INSERT INTO hits_URL_UserID
SELECT * FROM hits_UserID_URL;
```

응답은 다음과 같습니다:

```response
Ok.

0 rows in set. Elapsed: 2.898 sec. Processed 8.87 million rows, 838.84 MB (3.06 million rows/s., 289.46 MB/s.)
```

마지막으로 테이블을 최적화합니다:
```sql
OPTIMIZE TABLE hits_URL_UserID FINAL;
```

기본 키에서 컬럼의 순서를 전환했기 때문에, 삽입된 행은 이제 서로 다른 사전적 순서로 디스크에 저장됩니다(원래 테이블과 비교할 때) 따라서 해당 테이블의 1083 그라뉼은 이전과 다른 값을 포함하게 됩니다:

<Image img={sparsePrimaryIndexes10} size="md" alt="Sparse Primary Indices 10" background="white"/>

결과적인 기본 키는 다음과 같습니다:

<Image img={sparsePrimaryIndexes11} size="md" alt="Sparse Primary Indices 11" background="white"/>

이를 통해 URL 컬럼에서 쿼리 필터링의 속도를 크게 높이기 위해 사용할 수 있습니다. 이 쿼리는 "http://public_search" URL을 가장 자주 클릭한 상위 10명의 사용자를 계산합니다:
```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

응답은 다음과 같습니다:
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

이제 ClickHouse가 [거의 전체 테이블 스캔을 수행하는 대신](/guides/best-practices/sparse-primary-indexes#efficient-filtering-on-secondary-key-columns) 쿼리를 훨씬 더 효과적으로 실행했습니다.

원래 테이블의 기본 인덱스에서 UserID가 첫 번째, URL이 두 번째 키 컬럼일 경우, ClickHouse는 인덱스 마크에서 [일반적인 배제 검색](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)을 사용하여 그 쿼리를 실행했으나, UserID와 URL의 유사한 높은 카디널리 때문에 그것은 효과적이지 않았습니다.

URL이 기본 인덱스의 첫 번째 컬럼인 경우, ClickHouse는 이제 인덱스 마크에 대한 <a href="https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1452" target="_blank">이진 검색</a>을 실행합니다. ClickHouse 서버 로그 파일의 해당 추적 로그는 다음을 확인합니다:
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
ClickHouse는 일반적인 배제 검색이 사용될 때의 1076이 아닌 단 39개의 인덱스 마크만 선택했습니다.

추가 테이블은 URL에서 쿼리 필터링의 실행 속도를 높이기 위해 최적화되었습니다.

원래 테이블의 [부진한 성능](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient) 덕분에, 우리의 [UserIDs에 대한 쿼리 필터링](#the-primary-index-is-used-for-selecting-granules) 또한 새 추가 테이블에서 매우 효과적이지 않을 것입니다. UserID는 이제 해당 테이블의 기본 인덱스에서 두 번째 키 컬럼이 되었으므로 ClickHouse는 그라뉼 선택에 대해 일반적인 배제 검색을 사용해야 하고, 이는 [유사하게 높은 카디널리](/guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm)에 대해 그다지 효과적이지 않습니다. 자세한 내용을 확인하려면 세부 정보 상자를 열어보십시오.

<details>
    <summary>
    UserIDs에 대한 쿼리 필터링이 이제 성능이 저조합니다<a name="query-on-userid-slow"></a>
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

응답은 다음과 같습니다:

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

서버 로그:
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

현재 우리는 두 개의 테이블을 가지고 있습니다. 각각 `UserIDs`를 필터링하는 쿼리를 가속화하고, `URLs`를 필터링하는 쿼리를 가속화합니다:
### 옵션 2: 물리화된 뷰 {#option-2-materialized-views}

기존 테이블에 대해 [물리화된 뷰](/sql-reference/statements/create/view.md)를 생성합니다.
```sql
CREATE MATERIALIZED VIEW mv_hits_URL_UserID
ENGINE = MergeTree()
PRIMARY KEY (URL, UserID)
ORDER BY (URL, UserID, EventTime)
POPULATE
AS SELECT * FROM hits_UserID_URL;
```

응답은 다음과 같습니다:

```response
Ok.

0 rows in set. Elapsed: 2.935 sec. Processed 8.87 million rows, 838.84 MB (3.02 million rows/s., 285.84 MB/s.)
```

:::note
- 우리는 뷰의 기본 키에서 (우리의 [원래 테이블](#a-table-with-a-primary-key)과 비교하여) 키 컬럼의 순서를 전환합니다.
- 물리화된 뷰는 주어진 기본 키 정의를 기반으로 하는 **암묵적으로 생성된 테이블**에 의해 백업됩니다.
- 암묵적으로 생성된 테이블은 `SHOW TABLES` 쿼리에 나열되며, 이름은 `.inner`로 시작합니다.
- 물리화된 뷰의 백업 테이블을 먼저 명시적으로 생성한 다음, 뷰는 `TO [db].[table]` [절](https://sql-reference/statements/create/view.md)을 통해 해당 테이블을 타겟팅할 수 있습니다.
- 우리는 `POPULATE` 키워드를 사용하여 모든 887만 행을 즉시 암묵적으로 생성된 테이블에 채웁니다.
- 원래 테이블 hits_UserID_URL에 새 행이 삽입되면, 해당 행도 자동으로 암묵적으로 생성된 테이블에 삽입됩니다.
- 실제로 암묵적으로 생성된 테이블은 [비교적으로 명시적으로 생성한 보조 테이블](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)과 동일한 행 순서와 기본 인덱스를 가지고 있습니다.

<Image img={sparsePrimaryIndexes12b1} size="md" alt="Sparse Primary Indices 12b1" background="white"/>

ClickHouse는 [열 데이터 파일](#data-is-stored-on-disk-ordered-by-primary-key-columns) (*.bin), [마크 파일](#mark-files-are-used-for-locating-granules) (*.mrk2), 그리고 암묵적으로 생성된 테이블의 [기본 인덱스](#the-primary-index-has-one-entry-per-granule) (primary.idx)를 ClickHouse 서버의 데이터 디렉토리 내의 특별한 폴더에 저장합니다:

<Image img={sparsePrimaryIndexes12b2} size="md" alt="Sparse Primary Indices 12b2" background="white"/>

:::

물리화된 뷰를 지원하는 암묵적으로 생성된 테이블(및 기본 인덱스)은 이제 URL 컬럼에서 쿼리 필터링 실행 속도를 크게 높이는 데 사용될 수 있습니다:
```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM mv_hits_URL_UserID
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

응답은 다음과 같습니다:

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

실제로 초과 테이블 지원으로 인해 생성된 암묵적으로 생성된 테이블(및 기본 인덱스)은 [비교적으로 명시적으로 생성한 보조 테이블](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)와 동일하므로 쿼리는 명시적으로 생성된 테이블과 동일하게 효과적으로 실행됩니다.

ClickHouse 서버 로그 파일의 관련 추적 로그는 ClickHouse가 인덱스 마크에 대해 이진 검색을 실행하고 있음을 확인합니다:

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
### 옵션 3: 프로젝션 {#option-3-projections}

기존 테이블에 대해 프로젝션을 생성합니다:
```sql
ALTER TABLE hits_UserID_URL
    ADD PROJECTION prj_url_userid
    (
        SELECT *
        ORDER BY (URL, UserID)
    );
```

그리고 프로젝션을 물리화합니다:
```sql
ALTER TABLE hits_UserID_URL
    MATERIALIZE PROJECTION prj_url_userid;
```

:::note
- 프로젝션은 주어진 `ORDER BY` 절을 기반으로 하는 **숨겨진 테이블**을 생성합니다.
- 숨겨진 테이블은 `SHOW TABLES` 쿼리에서 나열되지 않습니다.
- 우리는 `MATERIALIZE` 키워드를 사용하여 즉시 숨겨진 테이블에 모든 887만 행을 암묵적으로 생성된 소스 테이블 hits_UserID_URL로부터 채웁니다.
- 소스 테이블 hits_UserID_URL에 새 행이 삽입되면, 해당 행도 자동으로 숨겨진 테이블에 삽입됩니다.
- 쿼리는 항상 (구문적으로) 소스 테이블 hits_UserID_URL를 타겟팅하지만, 숨겨진 테이블의 행 순서 및 기본 인덱스가 더 효과적인 쿼리 실행을 허용하는 경우 해당 숨겨진 테이블이 대신 사용됩니다.
- 프로젝션이 ORDER BY와 일치하더라도 ORDER BY를 사용하는 쿼리가 더 효율적으로 실행되지는 않음을 유의하세요(https://github.com/ClickHouse/ClickHouse/issues/47333 참조).
- 실제로 숨겨진 테이블은 [비교적으로 명시적으로 생성한 보조 테이블](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)과 동일한 행 순서와 기본 인덱스를 가지고 있습니다.

<Image img={sparsePrimaryIndexes12c1} size="md" alt="Sparse Primary Indices 12c1" background="white"/>

ClickHouse는 숨겨진 테이블(및 기본 인덱스)을 사용하여 URL 컬럼에서 쿼리 필터링 실행 속도를 크게 높일 수 있습니다. 쿼리는 구문적으로 프로젝션의 소스 테이블을 타겟팅하고 있습니다.
```sql
SELECT UserID, count(UserID) AS Count
-- highlight-next-line
FROM hits_UserID_URL
WHERE URL = 'http://public_search'
GROUP BY UserID
ORDER BY Count DESC
LIMIT 10;
```

응답은 다음과 같습니다:

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

사실상 프로젝션으로 생성된 숨겨진 테이블(및 기본 인덱스)은 [비교적으로 명시적으로 생성한 보조 테이블](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)과 동일하므로 쿼리는 명시적으로 생성된 테이블과 동일한 효과적 방식으로 실행됩니다.

ClickHouse 서버 로그 파일의 관련 추적 로그는 ClickHouse가 인덱스 마크에 대해 이진 검색을 실행하고 있음을 확인합니다:

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
### 요약 {#summary}

우리의 [복합 기본 키 (UserID, URL)를 가진 테이블](#a-table-with-a-primary-key)의 기본 인덱스는 [UserID로 필터링하는 쿼리](#the-primary-index-is-used-for-selecting-granules)를 빠르게 하는 데 매우 유용했습니다. 그러나 URL 컬럼이 복합 기본 키의 일부임에도 불구하고 [URL로 필터링하는 쿼리](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)를 빠르게 하는 데는 큰 도움이 되지 않습니다.

그리고 그 반대의 경우도 마찬가지입니다:
우리의 [복합 기본 키 (URL, UserID)를 가진 테이블](/guides/best-practices/sparse-primary-indexes#option-1-secondary-tables)의 기본 인덱스는 [URL로 필터링하는 쿼리](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient)를 빠르게 했지만, [UserID로 필터링하는 쿼리](#the-primary-index-is-used-for-selecting-granules)에 대해서는 큰 지원을 제공하지 않았습니다.

UserID 및 URL의 기본 키 컬럼의 유사하게 높은 카디널리티 때문에, 두 번째 키 컬럼으로 필터링하는 쿼리는 [인덱스에 있는 두 번째 키 컬럼으로부터 큰 혜택을 보지 않습니다](#generic-exclusion-search-algorithm).

따라서 기본 인덱스에서 두 번째 키 컬럼을 제거하고 (인덱스의 메모리 소비를 줄이면서) [여러 기본 인덱스를 사용](/guides/best-practices/sparse-primary-indexes#using-multiple-primary-indexes)하는 것이 합리적입니다.

그러나 복합 기본 키의 키 컬럼들 간에 큰 카디널리티 차이가 있는 경우, 기본 키 컬럼을 카디널리티에 따라 오름차순으로 정렬하는 것이 [쿼리에 유리합니다](#guides/best-practices/sparse-primary-indexes#generic-exclusion-search-algorithm).

키 컬럼 간의 카디널리티 차이가 클수록, 이들 컬럼의 순서가 더욱 중요해집니다. 다음 섹션에서 이를 시연할 것입니다.

## 키 컬럼의 효율적인 정렬 {#ordering-key-columns-efficiently}

<a name="test"></a>

복합 기본 키에서는 키 컬럼의 순서가 다음 두 가지 모두에 상당한 영향을 미칠 수 있습니다:
- 쿼리에서의 두 번째 키 컬럼에 대한 필터링의 효율성
- 테이블의 데이터 파일에 대한 압축 비율 

이를 증명하기 위해, 우리는 [웹 트래픽 샘플 데이터 세트](#data-set)의 버전을 사용할 것입니다.
각 행은 인터넷 '사용자'(`UserID` 컬럼)가 URL(`URL` 컬럼)에 접근할 때 봇 트래픽으로 표시되었는지를 나타내는 세 개의 컬럼을 포함합니다 (`IsRobot` 컬럼).

우리는 일정한 웹 분석 쿼리를 빠르게 처리하기 위해 사용할 수 있는 세 개의 컬럼을 포함하는 복합 기본 키를 사용할 것입니다:
- 특정 URL에 대한 트래픽 중 봇 트래픽의 비율 계산 또는
- 특정 사용자가 (아니면) 봇인지에 대한 신뢰도를 판단 (해당 사용자의 트래픽 중 봇 트래픽으로 추정되지 않는 비율 계산)

우리는 복합 기본 키에서 키 컬럼으로 사용하고자 하는 세 개의 컬럼의 카디널리티를 계산하기 위해 다음 쿼리를 사용합니다 (로컬 테이블을 만들지 않고 TSV 데이터를 쿼리하기 위해 [URL 테이블 함수](/sql-reference/table-functions/url.md)를 사용하고 있습니다). `clickhouse client`에서 이 쿼리를 실행하십시오:
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
응답은 다음과 같습니다:
```response
┌─cardinality_URL─┬─cardinality_UserID─┬─cardinality_IsRobot─┐
│ 2.39 million    │ 119.08 thousand    │ 4.00                │
└─────────────────┴────────────────────┴─────────────────────┘

1 row in set. Elapsed: 118.334 sec. Processed 8.87 million rows, 15.88 GB (74.99 thousand rows/s., 134.21 MB/s.)
```

여기에서 `URL` 컬럼과 `IsRobot` 컬럼 간의 카디널리티 차이가 크다는 것을 알 수 있으며, 따라서 이 컬럼들의 복합 기본 키에서의 순서는 이 컬럼을 필터링하는 쿼리의 효율적인 속도 향상 및 테이블의 컬럼 데이터 파일에 대한 최적의 압축 비율을 달성하는 데 중요합니다.

이러한 분석을 위해 우리는 두 개의 테이블 버전을 생성합니다:
- 카디널리티에 따라 내림차순으로 정렬된 복합 기본 키 `(URL, UserID, IsRobot)`를 가진 테이블 `hits_URL_UserID_IsRobot` 
- 카디널리티에 따라 오름차순으로 정렬된 복합 기본 키 `(IsRobot, UserID, URL)`를 가진 테이블 `hits_IsRobot_UserID_URL`

복합 기본 키 `(URL, UserID, IsRobot)`로 `hits_URL_UserID_IsRobot` 테이블을 생성하십시오:
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

8.87백만 행으로 채우십시오:
```sql
INSERT INTO hits_URL_UserID_IsRobot SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```
응답은 다음과 같습니다:
```response
0 rows in set. Elapsed: 104.729 sec. Processed 8.87 million rows, 15.88 GB (84.73 thousand rows/s., 151.64 MB/s.)
```

다음으로, 복합 기본 키 `(IsRobot, UserID, URL)`로 `hits_IsRobot_UserID_URL` 테이블을 생성하십시오:
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
이전 테이블을 채우는 데 사용한 것과 같은 8.87백만 행으로 채우십시오:

```sql
INSERT INTO hits_IsRobot_UserID_URL SELECT
    intHash32(c11::UInt64) AS UserID,
    c15 AS URL,
    c20 AS IsRobot
FROM url('https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz')
WHERE URL != '';
```
응답은 다음과 같습니다:
```response
0 rows in set. Elapsed: 95.959 sec. Processed 8.87 million rows, 15.88 GB (92.48 thousand rows/s., 165.50 MB/s.)
```

### 두 번째 키 컬럼에 대한 효율적인 필터링 {#efficient-filtering-on-secondary-key-columns}

쿼리가 복합 키의 일부인 컬럼에 대해 필터링되고 해당 컬럼이 첫 번째 키 컬럼인 경우, [ClickHouse는 키 컬럼의 인덱스 마크에 대한 이진 검색 알고리즘을 실행합니다](#the-primary-index-is-used-for-selecting-granules).

쿼리가 복합 키의 일부인 컬럼에 대해 (오직) 필터링되고, 해당 컬럼이 첫 번째 키 컬럼이 아닌 경우, [ClickHouse는 키 컬럼의 인덱스 마크에 대한 일반적인 배제 검색 알고리즘을 사용합니다](/guides/best-practices/sparse-primary-indexes#secondary-key-columns-can-not-be-inefficient).

두 번째 경우에서 복합 기본 키에서의 키 컬럼의 순서는 [일반적인 배제 검색 알고리즘](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444)의 효과성에 중요합니다.

이는 키 컬럼 `(URL, UserID, IsRobot)`을 카디널리티에 따라 내림차순으로 정렬한 테이블에서 `UserID` 컬럼에 대해 필터링하는 쿼리입니다:
```sql
SELECT count(*)
FROM hits_URL_UserID_IsRobot
WHERE UserID = 112304
```
응답은 다음과 같습니다:
```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.026 sec.

# highlight-next-line
Processed 7.92 million rows,
31.67 MB (306.90 million rows/s., 1.23 GB/s.)
```

이것은 키 컬럼 `(IsRobot, UserID, URL)`을 카디널리티에 따라 오름차순으로 정렬한 테이블에 대한 동일한 쿼리입니다:
```sql
SELECT count(*)
FROM hits_IsRobot_UserID_URL
WHERE UserID = 112304
```
응답은 다음과 같습니다:
```response
┌─count()─┐
│      73 │
└─────────┘

1 row in set. Elapsed: 0.003 sec.

# highlight-next-line
Processed 20.32 thousand rows,
81.28 KB (6.61 million rows/s., 26.44 MB/s.)
```

쿼리 실행이 키 컬럼을 카디널리티에 따라 오름차순으로 정렬한 테이블에서 훨씬 더 효과적이고 빠르다는 것을 볼 수 있습니다.

그 이유는 [일반적인 배제 검색 알고리즘](https://github.com/ClickHouse/ClickHouse/blob/22.3/src/Storages/MergeTree/MergeTreeDataSelectExecutor.cpp#L1444)이 낮은 카디널리티를 가진 선행 키 컬럼을 사용하는 경우에 가장 효율적으로 작동하기 때문입니다. [그란율](#the-primary-index-is-used-for-selecting-granules)이 이 경우 선택됩니다. 우리는 이 내용을 이 가이드의 [이전 섹션](#generic-exclusion-search-algorithm)에서 자세히 설명했습니다.

### 데이터 파일의 최적 압축 비율 {#optimal-compression-ratio-of-data-files}

이 쿼리는 위에서 생성한 두 테이블 간의 `UserID` 컬럼의 압축 비율을 비교합니다:

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
응답은 다음과 같습니다:
```response
┌─Table───────────────────┬─Column─┬─Uncompressed─┬─Compressed─┬─Ratio─┐
│ hits_URL_UserID_IsRobot │ UserID │ 33.83 MiB    │ 11.24 MiB  │     3 │
│ hits_IsRobot_UserID_URL │ UserID │ 33.83 MiB    │ 877.47 KiB │    39 │
└─────────────────────────┴────────┴──────────────┴────────────┴───────┘

2 rows in set. Elapsed: 0.006 sec.
```

`UserID` 컬럼의 압축 비율이 키 컬럼을 카디널리티에 따라 오름차순으로 정렬한 테이블에서 더 높다는 것을 볼 수 있습니다.

두 테이블에 동일한 데이터가 저장되지만 (두 테이블에 대해 동일한 8.87백만 행을 삽입했습니다), 복합 기본 키에서 키 컬럼의 순서는 테이블의 [컬럼 데이터 파일](#data-is-stored-on-disk-ordered-by-primary-key-columns)에 대한 압축된 데이터가 요구하는 디스크 공간에 상당한 영향을 미칩니다:
- 복합 기본 키 `(URL, UserID, IsRobot)`를 가진 `hits_URL_UserID_IsRobot` 테이블에서는 키 컬럼을 카디널리티에 따라 내림차순으로 정렬할 때 `UserID.bin` 데이터 파일이 **11.24 MiB**의 디스크 공간을 차지합니다.
- 복합 기본 키 `(IsRobot, UserID, URL)`를 가진 `hits_IsRobot_UserID_URL` 테이블에서는 키 컬럼을 카디널리티에 따라 오름차순으로 정렬할 때 `UserID.bin` 데이터 파일이 **877.47 KiB**의 디스크 공간만 차지합니다.

디스크의 테이블 컬럼 데이터에 대한 좋은 압축 비율은 디스크 공간을 절약할 뿐만 아니라, 그 컬럼의 데이터를 디스크에서 주 메모리 (운영 체제의 파일 캐시)로 이동하는데 필요한 I/O를 줄여 쿼리를 (특히 분석 쿼리를) 더 빠르게 만듭니다.

이제 테이블의 컬럼들의 압축 비율이 카디널리티에 따라 오름차순으로 정렬하는 것이 유리한 이유를 설명하겠습니다.

아래의 다이어그램은 카디널리티에 따라 오름차순으로 정렬된 기본 키의 경우의 디스크 상의 행들의 순서를 스케치합니다:

<Image img={sparsePrimaryIndexes14a} size="md" alt="Sparse Primary Indices 14a" background="white"/>

우리는 [테이블의 행 데이터가 기본 키 컬럼에 따라 디스크에 정렬되어 저장된다](#data-is-stored-on-disk-ordered-by-primary-key-columns)는 것을 논의했습니다.

위 다이어그램에서, 테이블의 행들 (디스크에서의 컬럼 값)은 먼저 그들의 `cl` 값에 따라 정렬되고, 같은 `cl` 값을 가진 행들은 그들의 `ch` 값에 따라 정렬됩니다. 첫 번째 키 컬럼 `cl`의 카디널리티가 낮기 때문에 동일한 `cl` 값을 가진 행들이 있을 가능성이 높습니다. 이로 인해 `ch` 값들이 (동일한 `cl` 값을 가진 행들에 대해) 로컬하게 정렬될 가능성도 있습니다.

컬럼에 유사한 데이터가 서로 가깝게 배치되면, 예를 들어 정렬을 통해, 해당 데이터는 더 잘 압축될 것입니다.
일반적으로, 압축 알고리즘은 데이터의 런 길이(더 많은 데이터를 볼수록 압축에 유리함)와 근접성(데이터가 더 유사할수록 더 좋은 압축 비율을 제공함)으로부터 이점을 얻습니다.

위 다이어그램과 대조적으로, 아래의 다이어그램은 카디널리티에 따라 내림차순으로 정렬된 기본 키의 경우의 디스크 상의 행들의 순서를 스케치합니다:

<Image img={sparsePrimaryIndexes14b} size="md" alt="Sparse Primary Indices 14b" background="white"/>

이제 테이블의 행들은 먼저 그들의 `ch` 값에 따라 정렬되고, 같은 `ch` 값을 가진 행들은 그들의 `cl` 값에 의해 최종 순서가 결정됩니다.
그러나 첫 번째 키 컬럼 `ch`의 카디널리티가 높기 때문에, 동일한 `ch` 값을 가진 행들이 존재할 가능성이 낮습니다. 따라서 `cl` 값들이 로컬하게 정렬될 가능성도 낮습니다 (해당 `ch` 값을 가진 행들에 대해).

따라서 `cl` 값들은 대부분 무작위 순서에 있고, 이는 낮은 근접성과 압축 비율 때문입니다.

### 요약 {#summary-1}

쿼리에서 두 번째 키 컬럼에 대한 효율적인 필터링과 테이블의 컬럼 데이터 파일의 압축 비율 두 가지 모두에 대해 기본 키의 컬럼을 카디널리티에 따라 오름차순으로 정렬하는 것이 유리합니다.

## 단일 행을 효율적으로 식별하기 {#identifying-single-rows-efficiently}

일반적으로 [좋은](/knowledgebase/key-value) 사용 사례는 아닙니다, ClickHouse 위에 구축된 애플리케이션 중 일부는 ClickHouse 테이블의 단일 행을 식별해야 할 필요가 있습니다.

그에 대한 직관적인 해결책은 각 행에 대해 고유한 값을 갖는 [UUID](https://en.wikipedia.org/wiki/Universally_unique_identifier) 컬럼을 사용하고, 행의 빠른 검색을 위해 해당 컬럼을 기본 키 컬럼으로 사용하는 것입니다.

가장 빠른 검색을 위해, UUID 컬럼은 [첫 번째 키 컬럼](#the-primary-index-is-used-for-selecting-granules)이어야 합니다.

우리는 [ClickHouse 테이블의 행 데이터가 기본 키 컬럼에 따라 디스크에 정렬되어 저장되기 때문에](#data-is-stored-on-disk-ordered-by-primary-key-columns), 매우 높은 카디널리티 컬럼 (예: UUID 컬럼)이 기본 키 또는 복합 기본 키에서 낮은 카디널리티(column)가 있는 컬럼보다 앞에 있게 할 경우 [다른 테이블 컬럼의 압축 비율에 해가 된다는 것](#optimal-compression-ratio-of-data-files)에 대해 논의했습니다.

가장 빠른 검색과 최적의 데이터 압축 간의 타협은 UUID가 마지막 키 컬럼인 복합 기본 키를 사용하는 것입니다, 이 컬럼은 일부 테이블의 컬럼에 대한 좋은 압축 비율을 보장하는 낮은 카디널리티 키 컬럼들 다음에 위치합니다.

### 구체적인 예시 {#a-concrete-example}

한 가지 구체적인 예시는 Alexey Milovidov가 개발하고 [블로그에 올린](https://clickhouse.com/blog/building-a-paste-service-with-clickhouse/) 평문 붙여넣기 서비스 [https://pastila.nl](https://pastila.nl)입니다.

텍스트 영역의 모든 변경사항에 대해 데이터는 자동으로 ClickHouse 테이블의 행에 저장됩니다 (변경사항당 하나의 행).

붙여넣은 콘텐츠의 (특정 버전)를 식별하고 검색하는 한 가지 방법은 콘텐츠의 해시를 UUID로 사용하여 이 행을 포함하게 하는 것입니다.

다음 다이어그램은
- 콘텐츠가 변경되는 경우의 행 삽입 순서 (예를 들어 텍스트를 키보드로 입력하여 텍스트 영역에 입력하는 경우)와
- `PRIMARY KEY (hash)`가 사용될 때 삽입된 행의 디스크 상의 데이터 순서를 보여줍니다:

<Image img={sparsePrimaryIndexes15a} size="md" alt="Sparse Primary Indices 15a" background="white"/>

`hash` 컬럼이 기본 키 컬럼으로 사용되므로
- 특정 행을 [매우 빠르게](#the-primary-index-is-used-for-selecting-granules) 검색할 수 있지만,
- 테이블의 행 (그들의 컬럼 데이터)은 고유하고 무작위적인 해시 값으로 오름차순으로 디스크에 저장됩니다. 따라서 콘텐츠 컬럼의 값들도 무작위로 저장되어 데이터의 근접성이 없으며 이는 **콘텐츠 컬럼 데이터 파일에 대한 최적이 아닌 압축 비율**을 초래합니다.

콘텐츠 컬럼에 대한 압축 비율을 크게 개선하면서도 여전히 특정 행의 신속한 검색을 달성하기 위해, pastila.nl은 두 개의 해시 (및 복합 기본 키)를 사용하여 특정 행을 식별합니다:
- 앞서 논의된 콘텐츠의 해시, 이는 고유한 데이터에 대해 구별되는 해시이고,
- 데이터의 작은 변경 사항에 대해서는 **변하지 않는** [지역 민감 해시 (fingerprint)](https://en.wikipedia.org/wiki/Locality-sensitive_hashing)

다음 다이어그램은
- 콘텐츠가 변경되는 경우의 행 삽입 순서 (예를 들어 키보드로 입력하는 경우)와
- 복합 `PRIMARY KEY (fingerprint, hash)`가 사용될 때에 삽입된 행의 디스크 상의 데이터 순서를 보여줍니다:

<Image img={sparsePrimaryIndexes15b} size="md" alt="Sparse Primary Indices 15b" background="white"/>

이제 디스크의 행들은 먼저 `fingerprint`에 따라 정렬되고 같은 fingerprint 값을 가진 행의 경우 `hash` 값이 최종 정렬을 결정합니다.

작은 변경만 있는 데이터는 동일한 fingerprint 값을 가지게 되므로, 이제 유사한 데이터가 디스크의 콘텐츠 컬럼에서 서로 가까이 저장됩니다. 이는 콘텐츠 컬럼의 압축 비율에 매우 좋으며, 일반적으로 압축 알고리즘은 데이터의 근접성(데이터가 유사할수록 압축 비율이 더 좋음)으로부터 이점을 얻습니다.

타협점은 특정 행 검색을 위해 두 개의 필드(`fingerprint` 및 `hash`)가 필요하다는 점입니다. 이는 복합 `PRIMARY KEY (fingerprint, hash)`에서 발생하는 기본 인덱스를 최적의 방식으로 활용하기 위해서입니다.
