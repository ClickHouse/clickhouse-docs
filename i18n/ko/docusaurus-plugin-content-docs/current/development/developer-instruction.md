---
'description': 'ClickHouse 개발을 위한 전제 조건 및 설정 지침'
'sidebar_label': '전제 조건'
'sidebar_position': 5
'slug': '/development/developer-instruction'
'title': '개발자 전제 조건'
'doc_type': 'guide'
---


# 전제 조건

ClickHouse는 Linux, FreeBSD 및 macOS에서 빌드할 수 있습니다. Windows를 사용하는 경우에도 Linux에서 실행되는 가상 머신에서 ClickHouse를 빌드할 수 있습니다. 예를 들어 [VirtualBox](https://www.virtualbox.org/) 를 사용하여 Ubuntu를 실행할 수 있습니다.

## GitHub에 저장소 만들기 {#create-a-repository-on-github}

ClickHouse 개발을 시작하려면 [GitHub](https://www.github.com/) 계정이 필요합니다. 또한 로컬에서 SSH 키를 생성하고(아직 생성하지 않았다면) 공개 키를 GitHub에 업로드하십시오. 이는 패치를 기여하기 위한 전제 조건입니다.

다음으로, 개인 계정에서 오른쪽 상단의 "fork" 버튼을 클릭하여 [ClickHouse 저장소](https://github.com/ClickHouse/ClickHouse/)를 포크합니다.

수정 사항을 기여하려면, 예를 들어 문제 수정이나 기능 추가와 같은 경우, 먼저 포크한 브랜치에 변경 사항을 커밋한 후, 주 저장소에 대해 변경 사항과 함께 "Pull Request"를 생성하십시오.

Git 저장소 작업을 위해 Git을 설치하십시오. 예를 들어, Ubuntu에서 다음을 실행합니다:

```sh
sudo apt update
sudo apt install git
```

Git 치트 시트는 [여기](https://education.github.com/git-cheat-sheet-education.pdf)에서 찾을 수 있습니다. 자세한 Git 매뉴얼은 [여기](https://git-scm.com/book/en/v2)에서 확인하실 수 있습니다.

## 개발 머신에 저장소 복제하기 {#clone-the-repository-to-your-development-machine}

먼저, 작업 머신에 소스 파일을 다운로드합니다. 즉, 저장소를 복제합니다:

```sh
git clone git@github.com:your_github_username/ClickHouse.git  # replace the placeholder with your GitHub user name
cd ClickHouse
```

이 명령은 소스 코드, 테스트 및 기타 파일을 포함하는 `ClickHouse/` 디렉토리를 생성합니다. URL 뒤에 체크 아웃할 사용자 지정 디렉토리를 지정할 수 있지만, 이 경로에 공백이 포함되지 않는 것이 중요합니다. 공백이 포함되면 나중에 빌드 오류가 발생할 수 있습니다.

ClickHouse의 Git 저장소는 서브모듈을 사용하여 제3자 라이브러리를 가져옵니다. 서브모듈은 기본적으로 체크 아웃되지 않습니다. 다음 중 하나를 수행할 수 있습니다.

- `--recurse-submodules` 옵션과 함께 `git clone`을 실행합니다.

- `--recurse-submodules` 없이 `git clone`을 실행한 경우, 모든 서브모듈을 명시적으로 체크 아웃하려면 `git submodule update --init --jobs <N>`을 실행합니다. (`<N>`은 예를 들어 `12`로 설정하여 다운로드를 병렬화할 수 있습니다.)

- `--recurse-submodules` 없이 `git clone`을 실행하고 [스파스](https://github.blog/2020-01-17-bring-your-monorepo-down-to-size-with-sparse-checkout/)와 [샬로우](https://github.blog/2020-12-21-get-up-to-speed-with-partial-clone-and-shallow-clone/) 서브모듈 체크 아웃을 사용하여 필요 없는 파일과 서브모듈의 기록을 생략하여 공간을 절약하려면(약 15GB 대신 약 5GB) `./contrib/update-submodules.sh`를 실행합니다. 이 대안은 CI에 의해 사용되지만, 서브모듈 작업이 덜 편리하고 느려지기 때문에 로컬 개발에는 권장되지 않습니다.

Git 서브모듈의 상태를 확인하려면 `git submodule status`를 실행합니다.

다음과 같은 오류 메시지가 표시되면

```bash
Permission denied (publickey).
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

GitHub에 연결하기 위한 SSH 키가 누락된 것입니다. 이 키는 일반적으로 `~/.ssh`에 위치합니다. SSH 키가 수락되려면 GitHub의 설정에서 업로드해야 합니다.

HTTPS를 통해 저장소를 복제할 수도 있습니다:

```sh
git clone https://github.com/ClickHouse/ClickHouse.git
```

그러나 이렇게 하면 서버에 변경 사항을 전송할 수 없습니다. 임시로 사용하는 것은 가능하지만, 나중에 SSH 키를 추가하고 원격 주소를 `git remote` 명령으로 교체해야 합니다.

또한 원래 ClickHouse 저장소 주소를 로컬 저장소에 추가하여 그곳에서 업데이트를 가져올 수 있습니다:

```sh
git remote add upstream git@github.com:ClickHouse/ClickHouse.git
```

이 명령을 성공적으로 실행한 후에는 `git pull upstream master`를 실행하여 ClickHouse의 주요 저장소에서 업데이트를 가져올 수 있습니다.

:::tip
`git push`를 그대로 사용하지 마세요. 잘못된 원격 및/또는 잘못된 브랜치에 푸시할 수 있습니다. 원격 및 브랜치 이름을 명시적으로 지정하는 것이 좋습니다. 예: `git push origin my_branch_name`.
:::

## 코드 작성하기 {#writing-code}

다음은 ClickHouse를 위한 코드를 작성할 때 유용할 수 있는 빠른 링크입니다:

- [ClickHouse 아키텍처](/development/architecture/).
- [코드 스타일 가이드](/development/style/).
- [제3자 라이브러리](/development/contrib#adding-and-maintaining-third-party-libraries)
- [테스트 작성하기](/development/tests/)
- [열린 문제들](https://github.com/ClickHouse/ClickHouse/issues?q=is%3Aopen+is%3Aissue+label%3A%22easy+task%22)

### IDE {#ide}

[Visual Studio Code](https://code.visualstudio.com/)와 [Neovim](https://neovim.io/)은 이전에 ClickHouse 개발에 잘 사용된 두 가지 옵션입니다. VS Code를 사용하는 경우, 성능이 훨씬 더 우수한 [clangd 확장](https://marketplace.visualstudio.com/items?itemName=llvm-vs-code-extensions.vscode-clangd)을 사용하여 IntelliSense를 대체할 것을 권장합니다.

[CLion](https://www.jetbrains.com/clion/)은 또 다른 훌륭한 대안입니다. 그러나 ClickHouse와 같은 대규모 프로젝트에서는 느려질 수 있습니다. CLion을 사용할 때 염두에 두어야 할 몇 가지 사항은 다음과 같습니다:

- CLion은 자동으로 `build` 경로를 생성하며 빌드 유형으로 `debug`를 자동 선택합니다.
- CLion에 정의된 CMake 버전을 사용하며, 사용자가 설치한 버전이 아닙니다.
- CLion은 `ninja` 대신 `make`를 사용하여 빌드 작업을 실행합니다(이는 정상적인 동작입니다).

다른 사용할 수 있는 IDE로는 [Sublime Text](https://www.sublimetext.com/), [Qt Creator](https://www.qt.io/product/development-tools), 또는 [Kate](https://kate-editor.org/)가 있습니다.

## Pull Request 만들기 {#create-a-pull-request}

GitHub UI에서 포크한 저장소로 이동합니다. 브랜치에서 개발하고 있는 경우 해당 브랜치를 선택해야 합니다. 화면에는 "Pull request" 버튼이 위치해 있습니다. 본질적으로 이것은 "내 변경 사항을 주 저장소에 수용하기 위한 요청 생성"을 의미합니다.

작업이 아직 완료되지 않았더라도 Pull Request를 생성할 수 있습니다. 이 경우 제목의 시작 부분에 "WIP"(work in progress)라는 단어를 넣어야 하며, 나중에 변경할 수 있습니다. 이는 변경 사항의 공동 검토 및 토론과 모든 테스트를 실행하는 데 유용합니다. 변경 사항에 대한 간단한 설명을 제공하는 것이 중요합니다. 나중에 릴리스 변경 로그 생성을 위해 사용됩니다.

ClickHouse 직원이 PR에 "테스트 가능" 태그를 붙이면 테스트가 시작됩니다. 일부 초기 검사 결과(예: 코드 스타일)는 몇 분 이내에 도착할 것입니다. 빌드 검사 결과는 반 시간 이내에 도착합니다. 주요 테스트 세트는 1시간 이내에 보고됩니다.

시스템은 Pull Request에 대해 ClickHouse 이진 빌드를 개별적으로 준비합니다. 이 빌드를 가져오려면 검사 목록에서 "Builds" 항목 옆의 "Details" 링크를 클릭하십시오. 여기에서 프로덕션 서버에 배포할 수 있는 ClickHouse의 .deb 패키지 빌드에 대한 직접 링크를 찾을 수 있습니다(두려움이 없다면).

## 문서 작성하기 {#write-documentation}

새로운 기능을 추가하는 모든 Pull Request는 적절한 문서와 함께 제공되어야 합니다. 문서 변경 사항을 미리 보려면 로컬에서 문서 페이지를 빌드하는 방법에 대한 지침이 README.md 파일 [여기](https://github.com/ClickHouse/clickhouse-docs)에 있습니다. ClickHouse에 새로운 기능을 추가할 때 아래 템플릿을 가이드로 사용할 수 있습니다:

```markdown

# newFunctionName

A short description of the function goes here. It should describe briefly what it does and a typical usage case.

**Syntax**

\```sql
newFunctionName(arg1, arg2[, arg3])
\```

**Arguments**

- `arg1` — Description of the argument. [DataType](../data-types/float.md)
- `arg2` — Description of the argument. [DataType](../data-types/float.md)
- `arg3` — Description of optional argument (optional). [DataType](../data-types/float.md)

**Implementation Details**

A description of implementation details if relevant.

**Returned value**

- Returns {insert what the function returns here}. [DataType](../data-types/float.md)

**Example**

Query:

\```sql
SELECT 'write your example query here';
\```

Response:

\```response
┌───────────────────────────────────┐
│ the result of the query           │
└───────────────────────────────────┘
\```
```

## 테스트 데이터 사용하기 {#using-test-data}

ClickHouse 개발은 종종 현실적인 데이터 세트를 로드해야 합니다. 이는 성능 테스트에 특히 중요합니다. 웹 분석의 익명화된 데이터를 특별히 준비했습니다. 추가로 약 3GB의 여유 디스크 공간이 필요합니다.

```sh
sudo apt install wget xz-utils

wget https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz
wget https://datasets.clickhouse.com/visits/tsv/visits_v1.tsv.xz

xz -v -d hits_v1.tsv.xz
xz -v -d visits_v1.tsv.xz

clickhouse-client
```

clickhouse-client에서:

```sql
CREATE DATABASE IF NOT EXISTS test;

CREATE TABLE test.hits ( WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16),  URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8,  FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8,  UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8,  JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8,  SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8,  SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8,  IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8,  HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16),  RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16,  SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32,  DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32,  NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8,  SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64,  ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16,  GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String,  UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String,  FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  `ParsedParams.Key1` Array(String),  `ParsedParams.Key2` Array(String),  `ParsedParams.Key3` Array(String),  `ParsedParams.Key4` Array(String),  `ParsedParams.Key5` Array(String),  `ParsedParams.ValueDouble` Array(Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8) ENGINE = MergeTree PARTITION BY toYYYYMM(EventDate) SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID), EventTime);

CREATE TABLE test.visits ( CounterID UInt32,  StartDate Date,  Sign Int8,  IsNew UInt8,  VisitID UInt64,  UserID UInt64,  StartTime DateTime,  Duration UInt32,  UTCStartTime DateTime,  PageViews Int32,  Hits Int32,  IsBounce UInt8,  Referer String,  StartURL String,  RefererDomain String,  StartURLDomain String,  EndURL String,  LinkURL String,  IsDownload UInt8,  TraficSourceID Int8,  SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  PlaceID Int32,  RefererCategories Array(UInt16),  URLCategories Array(UInt16),  URLRegions Array(UInt32),  RefererRegions Array(UInt32),  IsYandex UInt8,  GoalReachesDepth Int32,  GoalReachesURL Int32,  GoalReachesAny Int32,  SocialSourceNetworkID UInt8,  SocialSourcePage String,  MobilePhoneModel String,  ClientEventTime DateTime,  RegionID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RemoteIP UInt32,  RemoteIP6 FixedString(16),  IPNetworkID UInt32,  SilverlightVersion3 UInt32,  CodeVersion UInt32,  ResolutionWidth UInt16,  ResolutionHeight UInt16,  UserAgentMajor UInt16,  UserAgentMinor UInt16,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  SilverlightVersion2 UInt8,  SilverlightVersion4 UInt16,  FlashVersion3 UInt16,  FlashVersion4 UInt16,  ClientTimeZone Int16,  OS UInt8,  UserAgent UInt8,  ResolutionDepth UInt8,  FlashMajor UInt8,  FlashMinor UInt8,  NetMajor UInt8,  NetMinor UInt8,  MobilePhone UInt8,  SilverlightVersion1 UInt8,  Age UInt8,  Sex UInt8,  Income UInt8,  JavaEnable UInt8,  CookieEnable UInt8,  JavascriptEnable UInt8,  IsMobile UInt8,  BrowserLanguage UInt16,  BrowserCountry UInt16,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16),  Params Array(String),  `Goals.ID` Array(UInt32),  `Goals.Serial` Array(UInt32),  `Goals.EventTime` Array(DateTime),  `Goals.Price` Array(Int64),  `Goals.OrderID` Array(String),  `Goals.CurrencyID` Array(UInt32),  WatchIDs Array(UInt64),  ParamSumPrice Int64,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16,  ClickLogID UInt64,  ClickEventID Int32,  ClickGoodEvent Int32,  ClickEventTime DateTime,  ClickPriorityID Int32,  ClickPhraseID Int32,  ClickPageID Int32,  ClickPlaceID Int32,  ClickTypeID Int32,  ClickResourceID Int32,  ClickCost UInt32,  ClickClientIP UInt32,  ClickDomainID UInt32,  ClickURL String,  ClickAttempt UInt8,  ClickOrderID UInt32,  ClickBannerID UInt32,  ClickMarketCategoryID UInt32,  ClickMarketPP UInt32,  ClickMarketCategoryName String,  ClickMarketPPName String,  ClickAWAPSCampaignName String,  ClickPageName String,  ClickTargetType UInt16,  ClickTargetPhraseID UInt64,  ClickContextType UInt8,  ClickSelectType Int8,  ClickOptions String,  ClickGroupBannerID Int32,  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String,  UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String,  FromTag String,  HasGCLID UInt8,  FirstVisit DateTime,  PredLastVisit Date,  LastVisit Date,  TotalVisits UInt32,  `TraficSource.ID` Array(Int8),  `TraficSource.SearchEngineID` Array(UInt16),  `TraficSource.AdvEngineID` Array(UInt8),  `TraficSource.PlaceID` Array(UInt16),  `TraficSource.SocialSourceNetworkID` Array(UInt8),  `TraficSource.Domain` Array(String),  `TraficSource.SearchPhrase` Array(String),  `TraficSource.SocialSourcePage` Array(String),  Attendance FixedString(16),  CLID UInt32,  YCLID UInt64,  NormalizedRefererHash UInt64,  SearchPhraseHash UInt64,  RefererDomainHash UInt64,  NormalizedStartURLHash UInt64,  StartURLDomainHash UInt64,  NormalizedEndURLHash UInt64,  TopLevelDomain UInt64,  URLScheme UInt64,  OpenstatServiceNameHash UInt64,  OpenstatCampaignIDHash UInt64,  OpenstatAdIDHash UInt64,  OpenstatSourceIDHash UInt64,  UTMSourceHash UInt64,  UTMMediumHash UInt64,  UTMCampaignHash UInt64,  UTMContentHash UInt64,  UTMTermHash UInt64,  FromHash UInt64,  WebVisorEnabled UInt8,  WebVisorActivity UInt32,  `ParsedParams.Key1` Array(String),  `ParsedParams.Key2` Array(String),  `ParsedParams.Key3` Array(String),  `ParsedParams.Key4` Array(String),  `ParsedParams.Key5` Array(String),  `ParsedParams.ValueDouble` Array(Float64),  `Market.Type` Array(UInt8),  `Market.GoalID` Array(UInt32),  `Market.OrderID` Array(String),  `Market.OrderPrice` Array(Int64),  `Market.PP` Array(UInt32),  `Market.DirectPlaceID` Array(UInt32),  `Market.DirectOrderID` Array(UInt32),  `Market.DirectBannerID` Array(UInt32),  `Market.GoodID` Array(String),  `Market.GoodName` Array(String),  `Market.GoodQuantity` Array(Int32),  `Market.GoodPrice` Array(Int64),  IslandID FixedString(16)) ENGINE = CollapsingMergeTree(Sign) PARTITION BY toYYYYMM(StartDate) SAMPLE BY intHash32(UserID) ORDER BY (CounterID, StartDate, intHash32(UserID), VisitID);

```

데이터를 가져옵니다:

```bash
clickhouse-client --max_insert_block_size 100000 --query "INSERT INTO test.hits FORMAT TSV" < hits_v1.tsv
clickhouse-client --max_insert_block_size 100000 --query "INSERT INTO test.visits FORMAT TSV" < visits_v1.tsv
```
