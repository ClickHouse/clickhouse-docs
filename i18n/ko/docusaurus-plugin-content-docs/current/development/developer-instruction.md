---
description: 'ClickHouse 개발을 위한 필수 사전 준비 사항 및 설정 지침'
sidebar_label: '사전 준비 사항'
sidebar_position: 5
slug: /development/developer-instruction
title: '개발자 사전 준비 사항'
doc_type: 'guide'
---

# 사전 준비 사항 \{#prerequisites\}

ClickHouse는 Linux, FreeBSD 및 macOS에서 빌드할 수 있습니다.
Windows를 사용하는 경우에도 Linux를 실행하는 가상 머신(예: Ubuntu가 설치된 [VirtualBox](https://www.virtualbox.org/))에서 ClickHouse를 빌드할 수 있습니다.

## GitHub에 리포지토리 생성하기 \{#create-a-repository-on-github\}

ClickHouse 개발을 시작하려면 [GitHub](https://www.github.com/) 계정이 필요합니다.
또한 아직 SSH 키가 없다면 로컬에서 SSH 키를 생성한 후, 공개 키를 GitHub에 업로드해야 합니다. 이는 패치를 기여하기 위한 필수 선행 조건입니다.

다음으로, 오른쪽 상단의 &quot;fork&quot; 버튼을 클릭하여 개인 계정으로 [ClickHouse 리포지토리](https://github.com/ClickHouse/ClickHouse/)를 포크하십시오.

이슈 수정이나 기능 추가와 같은 변경 사항을 기여하려면, 먼저 포크된 리포지토리의 브랜치에 변경 사항을 커밋한 다음, 해당 변경 사항을 메인 리포지토리에 반영하기 위한 &quot;Pull Request&quot;를 생성하십시오.

Git 리포지토리로 작업하려면 Git을 설치해야 합니다. 예를 들어 Ubuntu에서는 다음 명령을 실행하십시오.

```sh
sudo apt update
sudo apt install git
```

Git 치트 시트는 [여기](https://education.github.com/git-cheat-sheet-education.pdf)에서 확인할 수 있습니다.
자세한 Git 매뉴얼은 [여기](https://git-scm.com/book/en/v2)에서 확인할 수 있습니다.


## 개발 머신에 리포지토리를 클론합니다 \{#clone-the-repository-to-your-development-machine\}

먼저 작업 머신에 소스 파일을 다운로드합니다. 즉, 리포지토리를 클론합니다:

```sh
git clone git@github.com:your_github_username/ClickHouse.git  # replace the placeholder with your GitHub user name
cd ClickHouse
```

이 명령은 소스 코드, 테스트 및 기타 파일을 포함하는 `ClickHouse/` 디렉터리를 생성합니다.
URL 뒤에 체크아웃할 사용자 지정 디렉터리를 지정할 수 있지만, 나중에 빌드가 실패할 수 있으므로 이 경로에 공백이 포함되지 않도록 하는 것이 중요합니다.

ClickHouse의 Git 저장소는 서브모듈을 사용하여 서드 파티 라이브러리를 가져옵니다.
서브모듈은 기본적으로 체크아웃되지 않습니다.
다음 중 하나를 수행할 수 있습니다.

* `git clone`을 `--recurse-submodules` 옵션과 함께 실행하거나,

* `git clone`을 `--recurse-submodules` 없이 실행한 경우, `git submodule update --init --jobs <N>`을 실행하여 모든 서브모듈을 명시적으로 체크아웃합니다. (`<N>`은 예를 들어 다운로드를 병렬화하기 위해 `12`로 설정할 수 있습니다.)

* `git clone`을 `--recurse-submodules` 없이 실행했고, 서브모듈의 기록을 생략하여 공간을 절약하기 위해 [shallow clone(얕은 클론)](https://github.blog/2020-12-21-get-up-to-speed-with-partial-clone-and-shallow-clone/) 방식의 서브모듈 체크아웃을 사용하려면 `./contrib/update-submodules.sh`를 실행합니다. 이 대안은 CI에서 사용되지만, 서브모듈 작업을 덜 편리하고 더 느리게 만들기 때문에 로컬 개발에는 권장되지 않습니다.

Git 서브모듈의 상태를 확인하려면 `git submodule status`를 실행합니다.

다음과 같은 오류 메시지가 출력되는 경우

```bash
Permission denied (publickey).
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

GitHub에 연결하는 데 필요한 SSH 키가 없습니다.
이 키는 일반적으로 `~/.ssh` 디렉터리에 있습니다.
SSH 키를 사용하려면 GitHub 설정에서 업로드해야 합니다.

HTTPS를 통해 저장소를 클론할 수도 있습니다:

```sh
git clone https://github.com/ClickHouse/ClickHouse.git
```

그러나 이렇게 하면 변경 사항을 서버로 푸시할 수 없습니다.
임시로는 계속 사용할 수 있으며, 나중에 SSH 키를 추가한 뒤 `git remote` 명령어로 저장소의 원격 주소를 변경하면 됩니다.

또한 로컬 저장소에 원본 ClickHouse 저장소 주소를 추가하여 그곳에서 업데이트를 가져올 수도 있습니다:

```sh
git remote add upstream git@github.com:ClickHouse/ClickHouse.git
```

이 명령을 성공적으로 실행한 후에는 `git pull upstream master`를 실행하여 메인 ClickHouse 저장소에서 업데이트를 가져올 수 있습니다.

:::tip
`git push`만 그대로 사용하지 마십시오. 잘못된 원격 저장소나 잘못된 브랜치로 푸시될 수 있습니다.
예를 들어 `git push origin my_branch_name`처럼 원격 저장소와 브랜치 이름을 명시적으로 지정하는 것이 더 좋습니다.
:::


## 코드 작성 \{#writing-code\}

아래 링크는 ClickHouse용 코드를 작성할 때 참고하면 도움이 되는 자료입니다:

- [ClickHouse 아키텍처](/development/architecture/).
- [코드 스타일 가이드](/development/style/).
- [서드파티 라이브러리](/development/contrib#adding-and-maintaining-third-party-libraries)
- [테스트 작성](/development/tests/)
- [열려 있는 이슈](https://github.com/ClickHouse/ClickHouse/issues?q=is%3Aopen+is%3Aissue+label%3A%22easy+task%22)

### IDE \{#ide\}

[Visual Studio Code](https://code.visualstudio.com/)와 [Neovim](https://neovim.io/)은 ClickHouse 개발에 많이 사용되는 두 가지 IDE 옵션입니다. VS Code를 사용하는 경우, 성능이 훨씬 뛰어나므로 IntelliSense를 대체하기 위해 [clangd 확장](https://marketplace.visualstudio.com/items?itemName=llvm-vs-code-extensions.vscode-clangd)을 사용할 것을 권장합니다.

[CLion](https://www.jetbrains.com/clion/)도 또 다른 훌륭한 대안입니다. 다만 ClickHouse와 같은 대규모 프로젝트에서는 더 느릴 수 있습니다. CLion을 사용할 때 염두에 두어야 할 몇 가지 사항은 다음과 같습니다.

- CLion은 자체적으로 `build` 경로를 생성하고 빌드 타입으로 자동으로 `debug`를 선택합니다.
- 사용자가 설치한 것이 아니라 CLion에 정의된 CMake 버전을 사용합니다.
- CLion은 빌드 작업을 실행할 때 `ninja` 대신 `make`를 사용합니다(이는 정상적인 동작입니다).

이 밖에도 [Sublime Text](https://www.sublimetext.com/), [Qt Creator](https://www.qt.io/product/development-tools), [Kate](https://kate-editor.org/)와 같은 IDE를 사용할 수 있습니다.

## Pull request 생성하기 \{#create-a-pull-request\}

GitHub UI에서 포크한 저장소로 이동합니다.
별도의 브랜치에서 개발했다면 해당 브랜치를 선택합니다.
화면에 "Pull request" 버튼이 표시됩니다.
이는 본질적으로 「내 변경 사항을 메인 저장소에 반영해 달라」는 요청을 생성한다는 의미입니다.

작업이 아직 완료되지 않았더라도 pull request를 생성할 수 있습니다.
이 경우 제목의 맨 앞에 "WIP" (work in progress)를 붙이십시오. 이후에 변경할 수 있습니다.
이는 변경 사항에 대한 공동 검토와 토론, 그리고 사용 가능한 모든 테스트를 실행하는 데 유용합니다.
변경 사항에 대한 간단한 설명을 제공하는 것이 중요합니다. 이 설명은 이후 릴리스 변경 로그를 생성하는 데 사용됩니다.

ClickHouse 직원이 PR에 "can be tested" 라벨을 추가하면 테스트가 시작됩니다.
일부 초기 검사(예: 코드 스타일) 결과는 몇 분 이내에 도착합니다.
빌드 검사 결과는 약 30분 이내에 도착합니다.
주요 테스트 세트는 약 1시간 이내에 완료됩니다.

시스템은 pull request마다 개별적으로 ClickHouse 바이너리 빌드를 준비합니다.
이 빌드를 가져오려면 검사 목록에서 "Builds" 항목 옆의 "Details" 링크를 클릭하십시오.
그러면 프로덕션 서버에도(두려움이 없다면) 배포할 수 있는 ClickHouse .deb 패키지에 대한 직접 링크를 확인할 수 있습니다.

## 문서 작성 \{#write-documentation\}

새로운 기능을 추가하는 모든 pull request에는 적절한 문서가 반드시 포함되어야 합니다.
문서 변경 사항을 미리 확인하려면, 문서 페이지를 로컬에서 빌드하는 방법에 대한 안내가 README.md 파일 [여기](https://github.com/ClickHouse/clickhouse-docs)에 제공됩니다.
ClickHouse에 새로운 함수를 추가할 때는 아래의 템플릿을 참고로 사용할 수 있습니다.

````markdown
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
````


## 테스트 데이터 사용 \{#using-test-data\}

ClickHouse를 개발할 때는 현실적인 데이터 세트를 로드해야 하는 경우가 많습니다.
이는 성능 테스트에서 특히 중요합니다.
웹 분석용 익명화된 데이터 세트를 별도로 준비해 두었습니다.
추가로 약 3GB의 여유 디스크 공간이 필요합니다.

```sh
    sudo apt install wget xz-utils

    wget https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz
    wget https://datasets.clickhouse.com/visits/tsv/visits_v1.tsv.xz

    xz -v -d hits_v1.tsv.xz
    xz -v -d visits_v1.tsv.xz

    clickhouse-client
```

clickhouse-client에서 실행합니다:


```sql
CREATE DATABASE IF NOT EXISTS test;

CREATE TABLE test.hits ( WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16),  URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8,  FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8,  UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8,  JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8,  SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8,  SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8,  IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8,  HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16),  RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16,  SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32,  DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32,  NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8,  SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64,  ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16,  GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String,  UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String,  FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  `ParsedParams.Key1` Array(String),  `ParsedParams.Key2` Array(String),  `ParsedParams.Key3` Array(String),  `ParsedParams.Key4` Array(String),  `ParsedParams.Key5` Array(String),  `ParsedParams.ValueDouble` Array(Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8) ENGINE = MergeTree PARTITION BY toYYYYMM(EventDate) SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID), EventTime);

CREATE TABLE test.visits ( CounterID UInt32,  StartDate Date,  Sign Int8,  IsNew UInt8,  VisitID UInt64,  UserID UInt64,  StartTime DateTime,  Duration UInt32,  UTCStartTime DateTime,  PageViews Int32,  Hits Int32,  IsBounce UInt8,  Referer String,  StartURL String,  RefererDomain String,  StartURLDomain String,  EndURL String,  LinkURL String,  IsDownload UInt8,  TraficSourceID Int8,  SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  PlaceID Int32,  RefererCategories Array(UInt16),  URLCategories Array(UInt16),  URLRegions Array(UInt32),  RefererRegions Array(UInt32),  IsYandex UInt8,  GoalReachesDepth Int32,  GoalReachesURL Int32,  GoalReachesAny Int32,  SocialSourceNetworkID UInt8,  SocialSourcePage String,  MobilePhoneModel String,  ClientEventTime DateTime,  RegionID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RemoteIP UInt32,  RemoteIP6 FixedString(16),  IPNetworkID UInt32,  SilverlightVersion3 UInt32,  CodeVersion UInt32,  ResolutionWidth UInt16,  ResolutionHeight UInt16,  UserAgentMajor UInt16,  UserAgentMinor UInt16,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  SilverlightVersion2 UInt8,  SilverlightVersion4 UInt16,  FlashVersion3 UInt16,  FlashVersion4 UInt16,  ClientTimeZone Int16,  OS UInt8,  UserAgent UInt8,  ResolutionDepth UInt8,  FlashMajor UInt8,  FlashMinor UInt8,  NetMajor UInt8,  NetMinor UInt8,  MobilePhone UInt8,  SilverlightVersion1 UInt8,  Age UInt8,  Sex UInt8,  Income UInt8,  JavaEnable UInt8,  CookieEnable UInt8,  JavascriptEnable UInt8,  IsMobile UInt8,  BrowserLanguage UInt16,  BrowserCountry UInt16,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16),  Params Array(String),  `Goals.ID` Array(UInt32),  `Goals.Serial` Array(UInt32),  `Goals.EventTime` Array(DateTime),  `Goals.Price` Array(Int64),  `Goals.OrderID` Array(String),  `Goals.CurrencyID` Array(UInt32),  WatchIDs Array(UInt64),  ParamSumPrice Int64,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16,  ClickLogID UInt64,  ClickEventID Int32,  ClickGoodEvent Int32,  ClickEventTime DateTime,  ClickPriorityID Int32,  ClickPhraseID Int32,  ClickPageID Int32,  ClickPlaceID Int32,  ClickTypeID Int32,  ClickResourceID Int32,  ClickCost UInt32,  ClickClientIP UInt32,  ClickDomainID UInt32,  ClickURL String,  ClickAttempt UInt8,  ClickOrderID UInt32,  ClickBannerID UInt32,  ClickMarketCategoryID UInt32,  ClickMarketPP UInt32,  ClickMarketCategoryName String,  ClickMarketPPName String,  ClickAWAPSCampaignName String,  ClickPageName String,  ClickTargetType UInt16,  ClickTargetPhraseID UInt64,  ClickContextType UInt8,  ClickSelectType Int8,  ClickOptions String,  ClickGroupBannerID Int32,  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String,  UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String,  FromTag String,  HasGCLID UInt8,  FirstVisit DateTime,  PredLastVisit Date,  LastVisit Date,  TotalVisits UInt32,  `TraficSource.ID` Array(Int8),  `TraficSource.SearchEngineID` Array(UInt16),  `TraficSource.AdvEngineID` Array(UInt8),  `TraficSource.PlaceID` Array(UInt16),  `TraficSource.SocialSourceNetworkID` Array(UInt8),  `TraficSource.Domain` Array(String),  `TraficSource.SearchPhrase` Array(String),  `TraficSource.SocialSourcePage` Array(String),  Attendance FixedString(16),  CLID UInt32,  YCLID UInt64,  NormalizedRefererHash UInt64,  SearchPhraseHash UInt64,  RefererDomainHash UInt64,  NormalizedStartURLHash UInt64,  StartURLDomainHash UInt64,  NormalizedEndURLHash UInt64,  TopLevelDomain UInt64,  URLScheme UInt64,  OpenstatServiceNameHash UInt64,  OpenstatCampaignIDHash UInt64,  OpenstatAdIDHash UInt64,  OpenstatSourceIDHash UInt64,  UTMSourceHash UInt64,  UTMMediumHash UInt64,  UTMCampaignHash UInt64,  UTMContentHash UInt64,  UTMTermHash UInt64,  FromHash UInt64,  WebVisorEnabled UInt8,  WebVisorActivity UInt32,  `ParsedParams.Key1` Array(String),  `ParsedParams.Key2` Array(String),  `ParsedParams.Key3` Array(String),  `ParsedParams.Key4` Array(String),  `ParsedParams.Key5` Array(String),  `ParsedParams.ValueDouble` Array(Float64),  `Market.Type` Array(UInt8),  `Market.GoalID` Array(UInt32),  `Market.OrderID` Array(String),  `Market.OrderPrice` Array(Int64),  `Market.PP` Array(UInt32),  `Market.DirectPlaceID` Array(UInt32),  `Market.DirectOrderID` Array(UInt32),  `Market.DirectBannerID` Array(UInt32),  `Market.GoodID` Array(String),  `Market.GoodName` Array(String),  `Market.GoodQuantity` Array(Int32),  `Market.GoodPrice` Array(Int64),  IslandID FixedString(16)) ENGINE = CollapsingMergeTree(Sign) PARTITION BY toYYYYMM(StartDate) SAMPLE BY intHash32(UserID) ORDER BY (CounterID, StartDate, intHash32(UserID), VisitID);

```

데이터를 가져오십시오:

```bash
clickhouse-client --max_insert_block_size 100000 --query "INSERT INTO test.hits FORMAT TSV" < hits_v1.tsv
clickhouse-client --max_insert_block_size 100000 --query "INSERT INTO test.visits FORMAT TSV" < visits_v1.tsv
```
