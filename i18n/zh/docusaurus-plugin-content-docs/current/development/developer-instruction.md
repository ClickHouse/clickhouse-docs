---
'description': 'ClickHouse 开发的先决条件和设置说明'
'sidebar_label': '先决条件'
'sidebar_position': 5
'slug': '/development/developer-instruction'
'title': '开发者先决条件'
'doc_type': 'guide'
---


# 先决条件

ClickHouse 可以在 Linux、FreeBSD 和 macOS 上构建。如果你使用 Windows，仍然可以在虚拟机中运行 Linux 来构建 ClickHouse，例如使用 [VirtualBox](https://www.virtualbox.org/) 及 Ubuntu。

## 在 GitHub 上创建一个仓库 {#create-a-repository-on-github}

要开始为 ClickHouse 开发，你需要一个 [GitHub](https://www.github.com/) 账户。请同时在本地生成一个 SSH 密钥（如果你还没有的话），并将公钥上传到 GitHub，因为这是贡献补丁的先决条件。

接下来，通过点击右上角的“fork”按钮，在你的个人账户中复制 [ClickHouse 仓库](https://github.com/ClickHouse/ClickHouse/)。

要贡献更改，例如，修复一个问题或添加一个功能，首先把你的更改提交到你 fork 的一个分支中，然后创建一个“拉取请求”（Pull Request），将更改提交给主仓库。

关于 Git 仓库的工作，请安装 Git。例如，在 Ubuntu 中运行：

```sh
sudo apt update
sudo apt install git
```

可以在 [这里](https://education.github.com/git-cheat-sheet-education.pdf) 找到 Git 速查手册。详细的 Git 手册可以在 [这里](https://git-scm.com/book/en/v2)。

## 将仓库克隆到你的开发机器 {#clone-the-repository-to-your-development-machine}

首先，将源文件下载到你的工作机器，即克隆仓库：

```sh
git clone git@github.com:your_github_username/ClickHouse.git  # replace the placeholder with your GitHub user name
cd ClickHouse
```

此命令会创建一个名为 `ClickHouse/` 的目录，其中包含源代码、测试和其他文件。你可以在 URL 后指定一个自定义目录进行检出，但重要的是这个路径不能包含空格，因为这可能会在之后的构建中造成问题。

ClickHouse 的 Git 仓库使用子模块来拉取第三方库。子模块默认情况下不会被检出。你可以选择：

- 使用 `--recurse-submodules` 选项运行 `git clone`，

- 如果 `git clone` 是在没有 `--recurse-submodules` 的情况下运行的，请运行 `git submodule update --init --jobs <N>` 来显式检出所有子模块。（`<N>` 可以设置为例如 `12` 以并行下载。）

- 如果 `git clone` 是在没有 `--recurse-submodules` 的情况下运行的，并且你想使用 [稀疏](https://github.blog/2020-01-17-bring-your-monorepo-down-to-size-with-sparse-checkout/) 和 [浅层](https://github.blog/2020-12-21-get-up-to-speed-with-partial-clone-and-shallow-clone/) 子模块检出以省略不需要的文件和历史记录从而节省空间（大约 5 GB 而不是大约 15 GB），请运行 `./contrib/update-submodules.sh`。这个替代方法被 CI 使用，但不推荐用于本地开发，因为它会使处理子模块变得不方便且较慢。

要检查 Git 子模块的状态，请运行 `git submodule status`。

如果你收到以下错误信息：

```bash
Permission denied (publickey).
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

表示连接到 GitHub 的 SSH 密钥丢失。这些密钥通常位于 `~/.ssh`。为了使 SSH 密钥被接受，你需要在 GitHub 的设置中上传它们。

你也可以通过 HTTPS 克隆仓库：

```sh
git clone https://github.com/ClickHouse/ClickHouse.git
```

但是，这样将无法将你的更改推送到服务器。你仍然可以暂时使用它，稍后再添加 SSH 密钥，使用 `git remote` 命令替换仓库的远程地址。

你还可以将原始的 ClickHouse 仓库地址添加到你的本地仓库中，以从那里拉取更新：

```sh
git remote add upstream git@github.com:ClickHouse/ClickHouse.git
```

成功运行此命令后，你将能够通过运行 `git pull upstream master` 从主 ClickHouse 仓库拉取更新。

:::tip
请不要直接使用 `git push`，你可能会推送到错误的远程和/或错误的分支。最好明确指定远程和分支名称，例如 `git push origin my_branch_name`。
:::

## 编写代码 {#writing-code}

在这里你可以找到一些在为 ClickHouse 编写代码时可能有用的快速链接：

- [ClickHouse 架构](/development/architecture/)。
- [代码风格指南](/development/style/)。
- [第三方库](/development/contrib#adding-and-maintaining-third-party-libraries)
- [编写测试](/development/tests/)
- [打开的问题](https://github.com/ClickHouse/ClickHouse/issues?q=is%3Aopen+is%3Aissue+label%3A%22easy+task%22)

### IDE {#ide}

[Visual Studio Code](https://code.visualstudio.com/) 和 [Neovim](https://neovim.io/) 是过去在开发 ClickHouse 时效果良好的两个选项。如果你使用 VS Code，我们推荐使用 [clangd 扩展](https://marketplace.visualstudio.com/items?itemName=llvm-vs-code-extensions.vscode-clangd) 来替代 IntelliSense，因为它的性能更优。

[CLion](https://www.jetbrains.com/clion/) 是另一个不错的替代品。然而，在像 ClickHouse 这样的大型项目上可能会比较慢。使用 CLion 时需要注意一些事项：

- CLion 会自动创建一个 `build` 路径，默认选择 `debug` 作为构建类型
- 它使用 CLion 中定义的版本的 CMake，而不是你安装的版本
- CLion 将使用 `make` 来运行构建任务，而不是 `ninja`（这是正常行为）

你还可以使用其他 IDE，如 [Sublime Text](https://www.sublimetext.com/)、[Qt Creator](https://www.qt.io/product/development-tools) 或 [Kate](https://kate-editor.org/)。

## 创建拉取请求 {#create-a-pull-request}

在 GitHub 的 UI 中导航到你的 fork 仓库。如果你在一个分支中进行开发，你需要选择那个分支。屏幕上会有一个“拉取请求”按钮。从本质上讲，这意味着“创建一个请求以接受我的更改到主仓库中”。

即使工作尚未完成，也可以创建拉取请求。在这种情况下，请在标题的开头加上“WIP”（进行中的工作），稍后可以更改。这对于协作审查和更改讨论以及运行所有可用测试非常有用。重要的是要提供对你更改的简要描述，后来将用于生成发布的变更日志。

测试将在 ClickHouse 员工将你的 PR 标记为“可以测试”后开始。一些初步检查（如代码风格）的结果将在几分钟内反馈。构建检查结果将在半小时内到达。主要测试集将在一小时内报告结果。

系统将为你的拉取请求单独准备 ClickHouse 二进制构建。要获取这些构建，请单击检查列表中的“构建”条目旁的“详细信息”链接。在那里你将找到构建的 ClickHouse .deb 包的直接链接，你可以在你的生产服务器上部署这些包（如果你不害怕的话）。

## 编写文档 {#write-documentation}

每个添加新功能的拉取请求都必须附带适当的文档。如果你想预览文档更改，可以在 [这里](https://github.com/ClickHouse/clickhouse-docs) 的 README.md 文件中找到如何在本地构建文档页面的说明。当向 ClickHouse 添加新函数时，可以使用下面的模板作为指南：

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

开发 ClickHouse 通常需要加载真实的数据集。这对于性能测试尤为重要。我们有一套特别准备的匿名网络分析数据集。它另外需要大约 3GB 的可用磁盘空间。

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
