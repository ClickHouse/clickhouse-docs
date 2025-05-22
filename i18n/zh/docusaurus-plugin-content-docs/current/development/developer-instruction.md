---
'description': 'ClickHouse 开发的先决条件和设置说明'
'sidebar_label': '先决条件'
'sidebar_position': 5
'slug': '/development/developer-instruction'
'title': '开发者先决条件'
---


# 前提条件

ClickHouse 可以在 Linux、FreeBSD 和 macOS 上构建。
如果您使用 Windows，您仍然可以在运行 Linux 的虚拟机中构建 ClickHouse，例如使用 [VirtualBox](https://www.virtualbox.org/) 和 Ubuntu。

## 在 GitHub 上创建一个仓库 {#create-a-repository-on-github}

要开始为 ClickHouse 开发，您需要一个 [GitHub](https://www.github.com/) 账户。
请在本地生成一个 SSH 密钥（如果您还没有的话），并将公钥上传到 GitHub，因为这是贡献补丁的前提。

接下来，通过点击右上角的 "fork" 按钮，在您的个人账户中 fork [ClickHouse 仓库](https://github.com/ClickHouse/ClickHouse/)。

要贡献更改，例如修复问题或添加功能，首先将更改提交到您 fork 的一个分支，然后创建一个对主仓库的 "Pull Request"。

要使用 Git 仓库，请安装 Git。在 Ubuntu 中，您可以运行：

```sh
sudo apt update
sudo apt install git
```

Git 速查表可以在 [此处](https://education.github.com/git-cheat-sheet-education.pdf) 找到。
详尽的 Git 手册可以在 [此处](https://git-scm.com/book/en/v2) 找到。

## 将仓库克隆到开发机器 {#clone-the-repository-to-your-development-machine}

首先，将源文件下载到您的工作机器，即克隆仓库：

```sh
git clone git@github.com:your_github_username/ClickHouse.git  # replace the placeholder with your GitHub user name
cd ClickHouse
```

此命令会创建一个名为 `ClickHouse/` 的目录，包含源代码、测试和其他文件。
您可以在 URL 后指定一个自定义目录进行检出，但重要的是该路径不能包含空格，因为这可能会破坏后续的构建。

ClickHouse 的 Git 仓库使用子模块来引入第三方库。
子模块默认情况下不会被检出。
您可以选择

- 运行 `git clone` 并加上 `--recurse-submodules` 选项，

- 如果 `git clone` 是在没有 `--recurse-submodules` 的情况下运行，则运行 `git submodule update --init --jobs <N>` 来显式检出所有子模块。（`<N>` 可以设置为 `12` 等值以并行下载。）

- 如果 `git clone` 是在没有 `--recurse-submodules` 的情况下运行，并且您希望使用 [sparse](https://github.blog/2020-01-17-bring-your-monorepo-down-to-size-with-sparse-checkout/) 和 [shallow](https://github.blog/2020-12-21-get-up-to-speed-with-partial-clone-and-shallow-clone/) 子模块检出以省略不需要的文件和子模块中的历史记录以节省空间（约 5 GB 而不是约 15 GB），请运行 `./contrib/update-submodules.sh`。这种替代方案由 CI 使用，但不推荐用于本地开发，因为它使得处理子模块变得不便利且较慢。

要检查 Git 子模块的状态，请运行 `git submodule status`。

如果您收到以下错误消息

```bash
Permission denied (publickey).
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

则表示连接到 GitHub 的 SSH 密钥缺失。
这些密钥通常位于 `~/.ssh` 中。
要接受 SSH 密钥，您需要在 GitHub 的设置中上传它们。

您还可以通过 HTTPS 克隆仓库：

```sh
git clone https://github.com/ClickHouse/ClickHouse.git
```

但是，这不会使您能够将更改发送到服务器。
您仍然可以暂时使用它，稍后添加 SSH 密钥并使用 `git remote` 命令替换仓库的远程地址。

您还可以将原始 ClickHouse 仓库地址添加到您的本地仓库，以便从那里拉取更新：

```sh
git remote add upstream git@github.com:ClickHouse/ClickHouse.git
```

成功运行此命令后，您将能够通过运行 `git pull upstream master` 从主 ClickHouse 仓库拉取更新。

:::tip
请不要直接使用 `git push`，您可能会推送到错误的远程和/或错误的分支。
最好明确指定远程和分支名称，例如 `git push origin my_branch_name`。
:::

## 编写代码 {#writing-code}

在下方您可以找到一些在为 ClickHouse 编写代码时可能有用的快速链接：

- [ClickHouse 架构](/development/architecture/)。
- [代码风格指南](/development/style/)。
- [第三方库](/development/contrib#adding-and-maintaining-third-party-libraries)
- [编写测试](/development/tests/)
- [开放问题](https://github.com/ClickHouse/ClickHouse/issues?q=is%3Aopen+is%3Aissue+label%3A%22easy+task%22)

### IDE {#ide}

[Visual Studio Code](https://code.visualstudio.com/) 和 [Neovim](https://neovim.io/) 是过去在开发 ClickHouse 时表现良好的两个选项。如果您正在使用 VS Code，我们建议使用 [clangd 扩展](https://marketplace.visualstudio.com/items?itemName=llvm-vs-code-extensions.vscode-clangd) 来替代 IntelliSense，因为它性能更佳。

[CLion](https://www.jetbrains.com/clion/) 是另一个很好的选择。然而，在像 ClickHouse 这样的较大项目中，它的速度可能会较慢。使用 CLion 时需要记住几点：

- CLion 会自动创建一个 `build` 路径，并为构建类型自动选择 `debug`
- 它使用的是在 CLion 中定义的 CMake 版本，而不是您安装的版本
- CLion 将使用 `make` 来运行构建任务，而不是 `ninja`（这属于正常行为）

您还可以使用其他 IDE，如 [Sublime Text](https://www.sublimetext.com/)、[Qt Creator](https://www.qt.io/product/development-tools) 或 [Kate](https://kate-editor.org/)。

## 创建 Pull Request {#create-a-pull-request}

在 GitHub 的 UI 中导航到您的 fork 仓库。
如果您一直在一个分支中开发，您需要选择该分支。
屏幕上将会有一个 "Pull request" 按钮。
本质上，这意味着 "创建一个请求以接受我的更改到主仓库中"。

即使工作尚未完成，也可以创建一个 Pull Request。
在这种情况下，请在标题的开头添加 "WIP"（进行中的工作），之后可以进行更改。
这对于协作审查和更改讨论以及运行所有可用测试非常有用。
重要的是您提供一份简要的更改描述，这将在稍后用于生成发布变更日志。

测试将在 ClickHouse 员工给您的 PR 打标签“可以测试”后开始。
某些初步检查（例如代码风格）的结果将在几分钟内到达。
构建检查结果将在半小时内到达。
主要测试集将在一小时内报告。

系统会单独为您的 Pull Request 准备 ClickHouse 二进制构建。
要获取这些构建，请单击检查列表中 "Builds" 项目的 "Details" 链接。
在那里，您将找到构建的 .deb 包的直接链接，您甚至可以在生产服务器上部署它们（如果您不怕的话）。

## 编写文档 {#write-documentation}

每个添加新功能的 Pull Request 必须附带适当的文档。
如果您想预览文档更改，构建文档页面的本地说明可在 README.md 文件 [这里](https://github.com/ClickHouse/clickhouse-docs) 中找到。
在向 ClickHouse 添加新功能时，您可以使用下面的模板作为指南：

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

## 使用测试数据 {#using-test-data}

开发 ClickHouse 通常需要加载真实的数据集。
这对于性能测试特别重要。
我们有一组特别准备的匿名网页分析数据。
它额外需要约 3GB 的可用磁盘空间。

```sh
sudo apt install wget xz-utils

wget https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz
wget https://datasets.clickhouse.com/visits/tsv/visits_v1.tsv.xz

xz -v -d hits_v1.tsv.xz
xz -v -d visits_v1.tsv.xz

clickhouse-client
```

在 clickhouse-client 中：

```sql
CREATE DATABASE IF NOT EXISTS test;

CREATE TABLE test.hits ( WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16),  URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8,  FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8,  UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8,  JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8,  SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8,  SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8,  IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8,  HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16),  RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16,  SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32,  DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32,  NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8,  SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64,  ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16,  GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String,  UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String,  FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  `ParsedParams.Key1` Array(String),  `ParsedParams.Key2` Array(String),  `ParsedParams.Key3` Array(String),  `ParsedParams.Key4` Array(String),  `ParsedParams.Key5` Array(String),  `ParsedParams.ValueDouble` Array(Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8) ENGINE = MergeTree PARTITION BY toYYYYMM(EventDate) SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID), EventTime);

CREATE TABLE test.visits ( CounterID UInt32,  StartDate Date,  Sign Int8,  IsNew UInt8,  VisitID UInt64,  UserID UInt64,  StartTime DateTime,  Duration UInt32,  UTCStartTime DateTime,  PageViews Int32,  Hits Int32,  IsBounce UInt8,  Referer String,  StartURL String,  RefererDomain String,  StartURLDomain String,  EndURL String,  LinkURL String,  IsDownload UInt8,  TraficSourceID Int8,  SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  PlaceID Int32,  RefererCategories Array(UInt16),  URLCategories Array(UInt16),  URLRegions Array(UInt32),  RefererRegions Array(UInt32),  IsYandex UInt8,  GoalReachesDepth Int32,  GoalReachesURL Int32,  GoalReachesAny Int32,  SocialSourceNetworkID UInt8,  SocialSourcePage String,  MobilePhoneModel String,  ClientEventTime DateTime,  RegionID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RemoteIP UInt32,  RemoteIP6 FixedString(16),  IPNetworkID UInt32,  SilverlightVersion3 UInt32,  CodeVersion UInt32,  ResolutionWidth UInt16,  ResolutionHeight UInt16,  UserAgentMajor UInt16,  UserAgentMinor UInt16,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  SilverlightVersion2 UInt8,  SilverlightVersion4 UInt16,  FlashVersion3 UInt16,  FlashVersion4 UInt16,  ClientTimeZone Int16,  OS UInt8,  UserAgent UInt8,  ResolutionDepth UInt8,  FlashMajor UInt8,  FlashMinor UInt8,  NetMajor UInt8,  NetMinor UInt8,  MobilePhone UInt8,  SilverlightVersion1 UInt8,  Age UInt8,  Sex UInt8,  Income UInt8,  JavaEnable UInt8,  CookieEnable UInt8,  JavascriptEnable UInt8,  IsMobile UInt8,  BrowserLanguage UInt16,  BrowserCountry UInt16,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16),  Params Array(String),  `Goals.ID` Array(UInt32),  `Goals.Serial` Array(UInt32),  `Goals.EventTime` Array(DateTime),  `Goals.Price` Array(Int64),  `Goals.OrderID` Array(String),  `Goals.CurrencyID` Array(UInt32),  WatchIDs Array(UInt64),  ParamSumPrice Int64,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16,  ClickLogID UInt64,  ClickEventID Int32,  ClickGoodEvent Int32,  ClickEventTime DateTime,  ClickPriorityID Int32,  ClickPhraseID Int32,  ClickPageID Int32,  ClickPlaceID Int32,  ClickTypeID Int32,  ClickResourceID Int32,  ClickCost UInt32,  ClickClientIP UInt32,  ClickDomainID UInt32,  ClickURL String,  ClickAttempt UInt8,  ClickOrderID UInt32,  ClickBannerID UInt32,  ClickMarketCategoryID UInt32,  ClickMarketPP UInt32,  ClickMarketCategoryName String,  ClickMarketPPName String,  ClickAWAPSCampaignName String,  ClickPageName String,  ClickTargetType UInt16,  ClickTargetPhraseID UInt64,  ClickContextType UInt8,  ClickSelectType Int8,  ClickOptions String,  ClickGroupBannerID Int32,  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String,  UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String,  FromTag String,  HasGCLID UInt8,  FirstVisit DateTime,  PredLastVisit Date,  LastVisit Date,  TotalVisits UInt32,  `TraficSource.ID` Array(Int8),  `TraficSource.SearchEngineID` Array(UInt16),  `TraficSource.AdvEngineID` Array(UInt8),  `TraficSource.PlaceID` Array(UInt16),  `TraficSource.SocialSourceNetworkID` Array(UInt8),  `TraficSource.Domain` Array(String),  `TraficSource.SearchPhrase` Array(String),  `TraficSource.SocialSourcePage` Array(String),  Attendance FixedString(16),  CLID UInt32,  YCLID UInt64,  NormalizedRefererHash UInt64,  SearchPhraseHash UInt64,  RefererDomainHash UInt64,  NormalizedStartURLHash UInt64,  StartURLDomainHash UInt64,  NormalizedEndURLHash UInt64,  TopLevelDomain UInt64,  URLScheme UInt64,  OpenstatServiceNameHash UInt64,  OpenstatCampaignIDHash UInt64,  OpenstatAdIDHash UInt64,  OpenstatSourceIDHash UInt64,  UTMSourceHash UInt64,  UTMMediumHash UInt64,  UTMCampaignHash UInt64,  UTMContentHash UInt64,  UTMTermHash UInt64,  FromHash UInt64,  WebVisorEnabled UInt8,  WebVisorActivity UInt32,  `ParsedParams.Key1` Array(String),  `ParsedParams.Key2` Array(String),  `ParsedParams.Key3` Array(String),  `ParsedParams.Key4` Array(String),  `ParsedParams.Key5` Array(String),  `ParsedParams.ValueDouble` Array(Float64),  `Market.Type` Array(UInt8),  `Market.GoalID` Array(UInt32),  `Market.OrderID` Array(String),  `Market.OrderPrice` Array(Int64),  `Market.PP` Array(UInt32),  `Market.DirectPlaceID` Array(UInt32),  `Market.DirectOrderID` Array(UInt32),  `Market.DirectBannerID` Array(UInt32),  `Market.GoodID` Array(String),  `Market.GoodName` Array(String),  `Market.GoodQuantity` Array(Int32),  `Market.GoodPrice` Array(Int64),  IslandID FixedString(16)) ENGINE = CollapsingMergeTree(Sign) PARTITION BY toYYYYMM(StartDate) SAMPLE BY intHash32(UserID) ORDER BY (CounterID, StartDate, intHash32(UserID), VisitID);

```

导入数据：

```bash
clickhouse-client --max_insert_block_size 100000 --query "INSERT INTO test.hits FORMAT TSV" < hits_v1.tsv
clickhouse-client --max_insert_block_size 100000 --query "INSERT INTO test.visits FORMAT TSV" < visits_v1.tsv
```
