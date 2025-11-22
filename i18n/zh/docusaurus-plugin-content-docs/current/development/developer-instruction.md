---
description: 'ClickHouse 开发的前提条件与环境配置说明'
sidebar_label: '前提条件'
sidebar_position: 5
slug: /development/developer-instruction
title: '开发者前提条件'
doc_type: 'guide'
---



# 前提条件

ClickHouse 可以在 Linux、FreeBSD 和 macOS 上编译和构建。
如果您使用 Windows，仍然可以在运行 Linux（例如 Ubuntu）的虚拟机（如 [VirtualBox](https://www.virtualbox.org/)）中构建 ClickHouse。



## 在 GitHub 上创建仓库 {#create-a-repository-on-github}

要开始为 ClickHouse 开发,您需要一个 [GitHub](https://www.github.com/) 账户。
请在本地生成 SSH 密钥(如果尚未生成),并将公钥上传到 GitHub,这是贡献代码的前提条件。

接下来,点击右上角的 "fork" 按钮,在您的个人账户中 fork [ClickHouse 仓库](https://github.com/ClickHouse/ClickHouse/)。

要贡献代码更改(例如修复问题或添加功能),首先将更改提交到您 fork 仓库中的一个分支,然后创建一个 "Pull Request" 将更改提交到主仓库。

要使用 Git 仓库,请先安装 Git。例如,在 Ubuntu 中运行:

```sh
sudo apt update
sudo apt install git
```

Git 速查表可以在[这里](https://education.github.com/git-cheat-sheet-education.pdf)找到。
详细的 Git 手册请参阅[这里](https://git-scm.com/book/en/v2)。


## 将代码仓库克隆到开发机器 {#clone-the-repository-to-your-development-machine}

首先,将源代码文件下载到工作机器,即克隆代码仓库:

```sh
git clone git@github.com:your_github_username/ClickHouse.git  # 将占位符替换为您的 GitHub 用户名
cd ClickHouse
```

此命令会创建一个包含源代码、测试和其他文件的 `ClickHouse/` 目录。
您可以在 URL 后指定自定义的检出目录,但该路径不能包含空格,否则可能会导致后续构建失败。

ClickHouse 的 Git 仓库使用子模块来引入第三方库。
子模块默认不会被检出。
您可以选择以下方式之一:

- 运行 `git clone` 时使用 `--recurse-submodules` 选项,

- 如果运行 `git clone` 时未使用 `--recurse-submodules`,则运行 `git submodule update --init --jobs <N>` 来显式检出所有子模块。(例如,可以将 `<N>` 设置为 `12` 以并行下载。)

- 如果运行 `git clone` 时未使用 `--recurse-submodules`,并且您希望使用[稀疏](https://github.blog/2020-01-17-bring-your-monorepo-down-to-size-with-sparse-checkout/)和[浅层](https://github.blog/2020-12-21-get-up-to-speed-with-partial-clone-and-shallow-clone/)子模块检出来省略子模块中不需要的文件和历史记录以节省空间(约 5 GB 而非约 15 GB),请运行 `./contrib/update-submodules.sh`。此方式用于 CI,但不建议用于本地开发,因为它会使子模块的使用变得不太方便且速度较慢。

要检查 Git 子模块的状态,请运行 `git submodule status`。

如果您收到以下错误消息

```bash
Permission denied (publickey).
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

说明用于连接 GitHub 的 SSH 密钥缺失。
这些密钥通常位于 `~/.ssh` 目录中。
要使 SSH 密钥被接受,您需要在 GitHub 的设置中上传它们。

您也可以通过 HTTPS 克隆代码仓库:

```sh
git clone https://github.com/ClickHouse/ClickHouse.git
```

但是,这种方式不允许您将更改推送到服务器。
您仍然可以暂时使用它,稍后添加 SSH 密钥并使用 `git remote` 命令替换仓库的远程地址。

您还可以将原始 ClickHouse 仓库地址添加到本地仓库,以便从那里拉取更新:

```sh
git remote add upstream git@github.com:ClickHouse/ClickHouse.git
```

成功运行此命令后,您将能够通过运行 `git pull upstream master` 从主 ClickHouse 仓库拉取更新。

:::tip
请不要直接使用 `git push`,您可能会推送到错误的远程仓库和/或错误的分支。
最好明确指定远程仓库和分支名称,例如 `git push origin my_branch_name`。
:::


## 编写代码 {#writing-code}

以下是一些在为 ClickHouse 编写代码时可能有用的快速链接：

- [ClickHouse 架构](/development/architecture/)。
- [代码风格指南](/development/style/)。
- [第三方库](/development/contrib#adding-and-maintaining-third-party-libraries)
- [编写测试](/development/tests/)
- [待解决问题](https://github.com/ClickHouse/ClickHouse/issues?q=is%3Aopen+is%3Aissue+label%3A%22easy+task%22)

### IDE {#ide}

[Visual Studio Code](https://code.visualstudio.com/) 和 [Neovim](https://neovim.io/) 是两个在 ClickHouse 开发中表现良好的选择。如果您使用 VS Code，我们建议使用 [clangd 扩展](https://marketplace.visualstudio.com/items?itemName=llvm-vs-code-extensions.vscode-clangd) 来替代 IntelliSense，因为它的性能更优。

[CLion](https://www.jetbrains.com/clion/) 是另一个很好的选择。但是，在像 ClickHouse 这样的大型项目上它可能会比较慢。使用 CLion 时需要注意以下几点：

- CLion 会自行创建 `build` 路径，并自动选择 `debug` 作为构建类型
- 它使用 CLion 中定义的 CMake 版本，而不是您安装的版本
- CLion 将使用 `make` 来运行构建任务，而不是 `ninja`（这是正常行为）

您还可以使用的其他 IDE 包括 [Sublime Text](https://www.sublimetext.com/)、[Qt Creator](https://www.qt.io/product/development-tools) 或 [Kate](https://kate-editor.org/)。


## 创建拉取请求 {#create-a-pull-request}

在 GitHub 的用户界面中导航到您的 fork 仓库。
如果您一直在某个分支中进行开发,则需要选择该分支。
屏幕上会有一个"Pull request"按钮。
本质上,这意味着"创建一个请求,将我的更改合并到主仓库中"。

即使工作尚未完成,也可以创建拉取请求。
在这种情况下,请在标题开头添加"WIP"(work in progress,进行中)字样,稍后可以更改。
这对于协作审查和讨论更改以及运行所有可用测试非常有用。
重要的是,您需要提供更改的简要描述,它稍后将用于生成发布变更日志。

一旦 ClickHouse 员工为您的 PR 添加"can be tested"标签,测试就会开始。
一些初步检查(例如代码风格)的结果将在几分钟内返回。
构建检查结果将在半小时内返回。
主要测试集将在一小时内报告结果。

系统将为您的拉取请求单独准备 ClickHouse 二进制构建。
要获取这些构建,请点击检查列表中"Builds"条目旁边的"Details"链接。
在那里您将找到已构建的 ClickHouse .deb 软件包的直接链接,您甚至可以将其部署到生产服务器上(如果您不担心的话)。


## 编写文档 {#write-documentation}

每个添加新功能的拉取请求都必须包含相应的文档。
如果您想预览文档更改,可以在 [此处](https://github.com/ClickHouse/clickhouse-docs) 的 README.md 文件中查看如何在本地构建文档页面的说明。
在向 ClickHouse 添加新函数时,您可以参考以下模板:


````markdown
# newFunctionName

此处简要描述函数的功能，应简要说明其作用和典型使用场景。

**语法**

\```sql
newFunctionName(arg1, arg2[, arg3])
\```

**参数**

- `arg1` — 参数说明。 [DataType](../data-types/float.md)
- `arg2` — 参数说明。 [DataType](../data-types/float.md)
- `arg3` — 可选参数说明（可选）。 [DataType](../data-types/float.md)

**实现细节**

如有必要，此处描述实现细节。

**返回值**

- 返回 {在此插入函数返回内容}。 [DataType](../data-types/float.md)

**示例**

查询：

\```sql
SELECT '在此编写示例查询';
\```

响应：

\```response
┌───────────────────────────────────┐
│ 查询结果                          │
└───────────────────────────────────┘
\```
````


## 使用测试数据 {#using-test-data}

开发 ClickHouse 时通常需要加载真实的数据集。
这对于性能测试尤为重要。
我们准备了一套经过特殊处理的匿名化网络分析数据。
此数据集需要额外约 3GB 的可用磁盘空间。

```sh
    sudo apt install wget xz-utils

    wget https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz
    wget https://datasets.clickhouse.com/visits/tsv/visits_v1.tsv.xz

    xz -v -d hits_v1.tsv.xz
    xz -v -d visits_v1.tsv.xz

    clickhouse-client
```

在 clickhouse-client 中:

```sql
CREATE DATABASE IF NOT EXISTS test;

```


CREATE TABLE test.hits ( WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16),  URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8,  FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8,  UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8,  JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8,  SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8,  SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8,  IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8,  HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16),  RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16,  SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32,  DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32,  NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8,  SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64,  ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16,  GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String,  UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String,  FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  `ParsedParams.Key1` Array(String),  `ParsedParams.Key2` Array(String),  `ParsedParams.Key3` Array(String),  `ParsedParams.Key4` Array(String),  `ParsedParams.Key5` Array(String),  `ParsedParams.ValueDouble` Array(Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8) ENGINE = MergeTree PARTITION BY toYYYYMM(EventDate) SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID), EventTime);



CREATE TABLE test.visits ( CounterID UInt32, StartDate Date, Sign Int8, IsNew UInt8, VisitID UInt64, UserID UInt64, StartTime DateTime, Duration UInt32, UTCStartTime DateTime, PageViews Int32, Hits Int32, IsBounce UInt8, Referer String, StartURL String, RefererDomain String, StartURLDomain String, EndURL String, LinkURL String, IsDownload UInt8, TraficSourceID Int8, SearchEngineID UInt16, SearchPhrase String, AdvEngineID UInt8, PlaceID Int32, RefererCategories Array(UInt16), URLCategories Array(UInt16), URLRegions Array(UInt32), RefererRegions Array(UInt32), IsYandex UInt8, GoalReachesDepth Int32, GoalReachesURL Int32, GoalReachesAny Int32, SocialSourceNetworkID UInt8, SocialSourcePage String, MobilePhoneModel String, ClientEventTime DateTime, RegionID UInt32, ClientIP UInt32, ClientIP6 FixedString(16), RemoteIP UInt32, RemoteIP6 FixedString(16), IPNetworkID UInt32, SilverlightVersion3 UInt32, CodeVersion UInt32, ResolutionWidth UInt16, ResolutionHeight UInt16, UserAgentMajor UInt16, UserAgentMinor UInt16, WindowClientWidth UInt16, WindowClientHeight UInt16, SilverlightVersion2 UInt8, SilverlightVersion4 UInt16, FlashVersion3 UInt16, FlashVersion4 UInt16, ClientTimeZone Int16, OS UInt8, UserAgent UInt8, ResolutionDepth UInt8, FlashMajor UInt8, FlashMinor UInt8, NetMajor UInt8, NetMinor UInt8, MobilePhone UInt8, SilverlightVersion1 UInt8, Age UInt8, Sex UInt8, Income UInt8, JavaEnable UInt8, CookieEnable UInt8, JavascriptEnable UInt8, IsMobile UInt8, BrowserLanguage UInt16, BrowserCountry UInt16, Interests UInt16, Robotness UInt8, GeneralInterests Array(UInt16), Params Array(String), `Goals.ID` Array(UInt32), `Goals.Serial` Array(UInt32), `Goals.EventTime` Array(DateTime), `Goals.Price` Array(Int64), `Goals.OrderID` Array(String), `Goals.CurrencyID` Array(UInt32), WatchIDs Array(UInt64), ParamSumPrice Int64, ParamCurrency FixedString(3), ParamCurrencyID UInt16, ClickLogID UInt64, ClickEventID Int32, ClickGoodEvent Int32, ClickEventTime DateTime, ClickPriorityID Int32, ClickPhraseID Int32, ClickPageID Int32, ClickPlaceID Int32, ClickTypeID Int32, ClickResourceID Int32, ClickCost UInt32, ClickClientIP UInt32, ClickDomainID UInt32, ClickURL String, ClickAttempt UInt8, ClickOrderID UInt32, ClickBannerID UInt32, ClickMarketCategoryID UInt32, ClickMarketPP UInt32, ClickMarketCategoryName String, ClickMarketPPName String, ClickAWAPSCampaignName String, ClickPageName String, ClickTargetType UInt16, ClickTargetPhraseID UInt64, ClickContextType UInt8, ClickSelectType Int8, ClickOptions String, ClickGroupBannerID Int32, OpenstatServiceName String, OpenstatCampaignID String, OpenstatAdID String, OpenstatSourceID String, UTMSource String, UTMMedium String, UTMCampaign String, UTMContent String, UTMTerm String, FromTag String, HasGCLID UInt8, FirstVisit DateTime, PredLastVisit Date, LastVisit Date, TotalVisits UInt32, `TraficSource.ID` Array(Int8), `TraficSource.SearchEngineID` Array(UInt16), `TraficSource.AdvEngineID` Array(UInt8), `TraficSource.PlaceID` Array(UInt16), `TraficSource.SocialSourceNetworkID` Array(UInt8), `TraficSource.Domain` Array(String), `TraficSource.SearchPhrase` Array(String), `TraficSource.SocialSourcePage` Array(String), Attendance FixedString(16), CLID UInt32, YCLID UInt64, NormalizedRefererHash UInt64, SearchPhraseHash UInt64, RefererDomainHash UInt64, NormalizedStartURLHash UInt64, StartURLDomainHash UInt64, NormalizedEndURLHash UInt64, TopLevelDomain UInt64, URLScheme UInt64, OpenstatServiceNameHash UInt64, OpenstatCampaignIDHash UInt64, OpenstatAdIDHash UInt64, OpenstatSourceIDHash UInt64, UTMSourceHash UInt64, UTMMediumHash UInt64, UTMCampaignHash UInt64, UTMContentHash UInt64, UTMTermHash UInt64, FromHash UInt64, WebVisorEnabled UInt8, WebVisorActivity UInt32, `ParsedParams.Key1` Array(String), `ParsedParams.Key2` Array(String), `ParsedParams.Key3` Array(String), `ParsedParams.Key4` Array(String), `ParsedParams.Key5` Array(String), `ParsedParams.ValueDouble` Array(Float64), `Market.Type` Array(UInt8), `Market.GoalID` Array(UInt32), `Market.OrderID` Array(String), `Market.OrderPrice` Array(Int64), `Market.PP` Array(UInt32), `Market.DirectPlaceID` Array(UInt32), `Market.DirectOrderID` Array(UInt32), `Market.DirectBannerID` Array(UInt32), `Market.GoodID` Array(String), `Market.GoodName` Array(String), `Market.GoodQuantity` Array(Int32), `Market.GoodPrice` Array(Int64), IslandID FixedString(16)) ENGINE = CollapsingMergeTree(Sign) PARTITION BY toYYYYMM(StartDate) SAMPLE BY intHash32(UserID) ORDER BY (CounterID, StartDate, intHash32(UserID), VisitID);

````

导入数据：

```bash
clickhouse-client --max_insert_block_size 100000 --query "INSERT INTO test.hits FORMAT TSV" < hits_v1.tsv
clickhouse-client --max_insert_block_size 100000 --query "INSERT INTO test.visits FORMAT TSV" < visits_v1.tsv
````
