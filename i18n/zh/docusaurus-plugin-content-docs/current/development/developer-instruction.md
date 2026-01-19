---
description: 'ClickHouse 开发的前提条件与设置指南'
sidebar_label: '前提条件'
sidebar_position: 5
slug: /development/developer-instruction
title: '开发者前提条件'
doc_type: 'guide'
---

# 前提条件 \{#prerequisites\}

ClickHouse 可以在 Linux、FreeBSD 和 macOS 上构建。
如果你使用的是 Windows，仍然可以在运行 Linux 的虚拟机中构建 ClickHouse，例如在安装了 Ubuntu 的 [VirtualBox](https://www.virtualbox.org/) 中。

## 在 GitHub 上创建仓库 \{#create-a-repository-on-github\}

要开始为 ClickHouse 开发，你需要一个 [GitHub](https://www.github.com/) 账号。
如果你还没有 SSH 密钥，请在本地生成一个 SSH 密钥，并将公钥上传到 GitHub，因为这是提交补丁的前置条件。

接下来，在你的个人账号中 fork [ClickHouse 仓库](https://github.com/ClickHouse/ClickHouse/)，方法是在右上角点击 “Fork” 按钮。

要贡献更改（例如修复 issue 或添加功能），请先将你的修改提交到 fork 后仓库中的某个分支，然后向主仓库创建一个包含这些更改的 Pull Request。

若要操作 Git 仓库，请先安装 Git。例如，在 Ubuntu 中运行：

```sh
sudo apt update
sudo apt install git
```

Git 速查表可在[此处](https://education.github.com/git-cheat-sheet-education.pdf)查阅。
Git 详细手册在[此处](https://git-scm.com/book/en/v2)。

## 将仓库克隆到你的开发环境中 \{#clone-the-repository-to-your-development-machine\}

首先，将源文件下载到你的工作环境中，也就是克隆该仓库：

```sh
git clone git@github.com:your_github_username/ClickHouse.git  # replace the placeholder with your GitHub user name
cd ClickHouse
```

此命令会创建一个 `ClickHouse/` 目录，其中包含源代码、测试以及其他文件。
你可以在 URL 之后指定一个自定义检出目录，但务必要确保该路径中不包含空格，否则可能会在后续构建过程中导致失败。

ClickHouse 的 Git 仓库使用子模块来拉取第三方库。
默认情况下不会检出子模块。
你可以：

* 使用带有 `--recurse-submodules` 选项的 `git clone`；

* 如果 `git clone` 未使用 `--recurse-submodules`，则运行 `git submodule update --init --jobs <N>` 显式检出所有子模块。（例如可以将 `<N>` 设为 `12` 以并行下载。）

* 如果 `git clone` 未使用 `--recurse-submodules`，并且你希望使用 [shallow](https://github.blog/2020-12-21-get-up-to-speed-with-partial-clone-and-shallow-clone/) 子模块检出以省略子模块的历史记录从而节省空间，则运行 `./contrib/update-submodules.sh`。这种方式由 CI 使用，但不推荐用于本地开发，因为它会让使用子模块变得不太方便且更慢。

要检查 Git 子模块的状态，运行 `git submodule status`。

如果你收到如下错误信息

```bash
Permission denied (publickey).
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

用于连接 GitHub 的 SSH 密钥不存在。
这些密钥通常位于 `~/.ssh`。
要让 SSH 密钥被 GitHub 接受，你需要在 GitHub 的设置页面中上传它们。

你也可以通过 HTTPS 克隆该仓库：

```sh
git clone https://github.com/ClickHouse/ClickHouse.git
```

不过，这样你还不能将更改推送到服务器。
你仍然可以先暂时这样使用，之后再添加 SSH 密钥，并通过 `git remote` 命令替换仓库的远程地址。

你也可以在本地仓库中添加原始 ClickHouse 仓库地址，以便从那里拉取更新：

```sh
git remote add upstream git@github.com:ClickHouse/ClickHouse.git
```

成功运行此命令后，你就可以通过执行 `git pull upstream master` 从 ClickHouse 主仓库拉取更新。

:::tip
请不要直接使用 `git push`，否则你可能会推送到错误的远程仓库或错误的分支。
最好显式指定远程和分支名，例如 `git push origin my_branch_name`。
:::

## 编写代码 \{#writing-code\}

下面是一些在为 ClickHouse 编写代码时可能会用到的快速链接：

- [ClickHouse 架构](/development/architecture/)
- [代码风格指南](/development/style/)
- [第三方库](/development/contrib#adding-and-maintaining-third-party-libraries)
- [编写测试](/development/tests/)
- [开放的 issue](https://github.com/ClickHouse/ClickHouse/issues?q=is%3Aopen+is%3Aissue+label%3A%22easy+task%22)

### IDE \{#ide\}

[Visual Studio Code](https://code.visualstudio.com/) 和 [Neovim](https://neovim.io/) 在开发 ClickHouse 的实践中被证明是两个效果不错的选项。若你使用 VS Code，我们建议使用 [clangd 扩展](https://marketplace.visualstudio.com/items?itemName=llvm-vs-code-extensions.vscode-clangd) 来替换 IntelliSense，因为它的性能要高得多。

[CLion](https://www.jetbrains.com/clion/) 是另一个很好的选择。不过，在像 ClickHouse 这样的大型项目上，它可能会更慢。使用 CLion 时需要注意以下几点：

- CLion 会自行创建一个 `build` 目录，并自动选择 `debug` 作为构建类型
- 它使用的是在 CLion 中定义的 CMake 版本，而不是你自行安装的版本
- CLion 会使用 `make` 来运行构建任务，而不是 `ninja`（这是正常行为）

你也可以使用其他 IDE，例如 [Sublime Text](https://www.sublimetext.com/)、[Qt Creator](https://www.qt.io/product/development-tools) 或 [Kate](https://kate-editor.org/)。

## 创建 Pull Request \{#create-a-pull-request\}

在 GitHub 的 UI 中打开你 fork 出来的仓库。
如果你是在某个分支上开发的，需要先选择该分支。
界面上会有一个名为 “Pull request” 的按钮。
本质上，这意味着“创建一个请求，将我的更改合并到主仓库中”。

即使工作尚未完成，也可以创建 Pull Request。
在这种情况下，请在标题开头加上 “WIP”（work in progress，进行中），之后可以再修改。
这对于协同审阅和讨论更改，以及运行所有可用测试都非常有用。
请务必对你的更改内容做一个简要说明，之后会用它来生成发布版本的变更日志。

当 ClickHouse 员工给你的 PR 加上 “can be tested” 标签后，测试就会开始。
部分初始检查结果（例如代码风格）会在几分钟内给出。
构建检查结果会在半小时内完成。
主要测试集的结果通常会在一小时内返回。

系统会为你的 Pull Request 单独准备 ClickHouse 二进制构建。
要获取这些构建，点击检查列表中 “Builds” 条目旁边的 “Details” 链接。
在那里你会找到已构建的 ClickHouse `.deb` 包的直接链接，你甚至可以将它们部署到生产环境服务器上（如果你不担心的话）。

## 编写文档 \{#write-documentation\}

每个添加新功能的 pull request 都必须附带相应的文档。
如果你想预览文档修改内容，如何在本地构建文档页面的说明请参见 README.md 文件：[链接](https://github.com/ClickHouse/clickhouse-docs)。
在向 ClickHouse 添加新函数时，你可以参考下面的模板：

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

## 使用测试数据 \{#using-test-data\}

在开发 ClickHouse 时，经常需要加载接近真实的数据集。
这对性能测试尤为重要。
我们准备了一套经过匿名化处理的网站分析数据。
使用它大约需要额外 3GB 的可用磁盘空间。

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
