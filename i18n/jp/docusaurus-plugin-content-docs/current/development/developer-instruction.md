description: 'ClickHouseの開発のための前提条件とセットアップ手順'
sidebar_label: '前提条件'
sidebar_position: 5
slug: /development/developer-instruction
title: '開発者の前提条件'
```


# 前提条件

ClickHouseはLinux、FreeBSD、macOS上でビルド可能です。  
Windowsを使用している場合でも、Linuxを実行している仮想マシン（例：[VirtualBox](https://www.virtualbox.org/) と Ubuntu）でClickHouseをビルドすることができます。

## GitHubにリポジトリを作成する {#create-a-repository-on-github}

ClickHouseの開発を開始するには、[GitHub](https://www.github.com/) アカウントが必要です。  
SSHキーをローカルに生成し（すでに持っていない場合）、公開鍵をGitHubにアップロードすることも必須です。これにより、パッチの貢献が可能になります。

次に、[ClickHouseリポジトリ](https://github.com/ClickHouse/ClickHouse/)を個人アカウントにフォークします。右上にある「fork」ボタンをクリックしてください。

変更を貢献するためには、例えばバグの修正や機能追加など、まず自分のフォーク内のブランチに変更をコミットし、その後「Pull Request」を作成してメインリポジトリに変更を提案します。

Gitリポジトリで作業するためには、Gitをインストールしてください。Ubuntuの場合、次のコマンドを実行します：

```sh
sudo apt update
sudo apt install git
```

Gitのチートシートは[こちら](https://education.github.com/git-cheat-sheet-education.pdf)で見つけることができます。  
詳しいGitマニュアルは[こちら](https://git-scm.com/book/en/v2)です。

## リポジトリを開発環境にクローンする {#clone-the-repository-to-your-development-machine}

まず、作業マシンにソースファイルをダウンロードします。つまり、リポジトリをクローンします：

```sh
git clone git@github.com:your_github_username/ClickHouse.git  # プレースホルダーはあなたのGitHubユーザー名に置き換えてください
cd ClickHouse
```

このコマンドは、ソースコード、テスト、およびその他のファイルを含む `ClickHouse/` ディレクトリを作成します。  
URLの後にカスタムディレクトリの指定は可能ですが、このパスにホワイトスペースを含めないことが重要です。そうしないと、後のビルドが壊れる可能性があります。

ClickHouseのGitリポジトリは、サードパーティのライブラリを引き込むためにサブモジュールを使用しています。  
サブモジュールはデフォルトではチェックアウトされません。次のいずれかの方法を実行できます。

- `git clone` を `--recurse-submodules` オプション付きで実行する。

- `--recurse-submodules` オプションなしで `git clone` を実行した場合は、すべてのサブモジュールを明示的にチェックアウトするために `git submodule update --init --jobs <N>` を実行します。(` <N>` は例えば `12` に設定してダウンロードを並行処理することができます。)

- `--recurse-submodules` を指定せずに `git clone` を実行し、不要なファイルとサブモジュールの履歴を省略してストレージを節約するために、[スパース](https://github.blog/2020-01-17-bring-your-monorepo-down-to-size-with-sparse-checkout/) と [シャロー](https://github.blog/2020-12-21-get-up-to-speed-with-partial-clone-and-shallow-clone/) サブモジュールチェックアウトを使用したい場合は、`./contrib/update-submodules.sh` を実行します。このオプションはCIに使用されているが、ローカル開発にはおすすめしません。作業が不便で遅くなるためです。

Gitサブモジュールのステータスを確認するには、`git submodule status` を実行します。

次のエラーメッセージを受け取った場合：

```bash
Permission denied (publickey).
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

接続に必要なSSHキーがGitHubに存在していないことが原因です。これらのキーは通常 `~/.ssh` にあります。SSHキーを受け入れてもらうためには、GitHubの設定にアップロードする必要があります。

HTTPSを介してリポジトリをクローンすることも可能です：

```sh
git clone https://github.com/ClickHouse/ClickHouse.git
```

しかし、これでは変更をサーバーに送ることはできません。  
一時的にこれを使用して、後でSSHキーを追加してリモートアドレスを `git remote` コマンドで置き換えることができます。

また、元のClickHouseリポジトリアドレスをローカルリポジトリに追加して、そこから更新を取得することも可能です：

```sh
git remote add upstream git@github.com:ClickHouse/ClickHouse.git
```

このコマンドが正常に実行された後は、`git pull upstream master` を実行してメインClickHouseリポジトリから更新を取得できるようになります。

:::tip
必ず `git push` をそのまま使用しないでください。異なるリモートや誤ったブランチにプッシュする可能性があります。リモートとブランチ名は明示的に指定するのが良いです。例： `git push origin my_branch_name` 。
:::

## コードを書く {#writing-code}

以下は、ClickHouseのコードを書く際に役立つクイックリンクです：

- [ClickHouseアーキテクチャ](/development/architecture/).
- [コードスタイルガイド](/development/style/).
- [サードパーティライブラリ](/development/contrib#adding-and-maintaining-third-party-libraries)
- [テストを書く](/development/tests/)
- [オープンイシュー](https://github.com/ClickHouse/ClickHouse/issues?q=is%3Aopen+is%3Aissue+label%3A%22easy+task%22)

### IDE {#ide}

[Visual Studio Code](https://code.visualstudio.com/) と [Neovim](https://neovim.io/) は、過去にClickHouseの開発でうまく機能した2つのオプションです。VS Codeを使用している場合は、IntelliSenseの代わりに[clangd拡張機能](https://marketplace.visualstudio.com/items?itemName=llvm-vs-code-extensions.vscode-clangd)を使用することをお勧めします。

[CLion](https://www.jetbrains.com/clion/)も素晴らしい代替手段です。ただし、ClickHouseのような大規模プロジェクトでは遅くなることがあります。CLionを使用する際に注意すべき点は以下の通りです：

- CLionは独自に `build` パスを作成し、自動的にビルドタイプに `debug` を選択します。
- CLion内で定義されたCMakeのバージョンを使用し、あなたがインストールしたものではありません。
- CLionはビルドタスクを実行するために `make` を使用し、`ninja` は使用しません（これは通常の動作です）。

他に使用できるIDEは、[Sublime Text](https://www.sublimetext.com/)、[Qt Creator](https://www.qt.io/product/development-tools)、または[Kate](https://kate-editor.org/)です。

## プルリクエストを作成する {#create-a-pull-request}

GitHubのUIでフォークしたリポジトリに移動します。  
ブランチで開発していた場合、そのブランチを選択する必要があります。  
画面上には「Pull request」ボタンがあります。  
基本的に、これは「私の変更をメインリポジトリに受け入れるリクエストを作成する」と意味します。

作業がまだ完了していない場合でもプルリクエストを作成できます。この場合、タイトルの先頭に「WIP」（作業中）という単語を入れてください。後で変更することができます。  
これは、協力して変更をレビューおよび議論するため、また利用可能なテストをすべて実行するために役立ちます。  
変更の概要を簡潔に説明することが重要です。これは、リリースの変更ログ生成に使用されます。

ClickHouseの従業員があなたのPRに「can be tested」のタグを付けると、テストが開始されます。  
いくつかの初期チェック（例：コードスタイル）の結果は数分内に届きます。  
ビルドチェックの結果は30分以内に届きます。  
主要なテストセットは1時間以内に結果を報告します。

システムは、あなたのプルリクエスト用にClickHouseのバイナリビルドを準備します。  
これらのビルドを取得するには、チェックリスト内の「Builds」エントリの横にある「Details」リンクをクリックします。  
そこには、あなたがデプロイできるClickHouseの作成された.debパッケージへの直接リンクがあります（怖くなければ本番サーバーでも可能です）。

## ドキュメントを書く {#write-documentation}

新機能を追加するプルリクエストには、適切なドキュメントが付属する必要があります。  
ドキュメントの変更をプレビューしたい場合、ドキュメントページをローカルにビルドする方法についての手順は、README.mdファイルにあります。[こちら](https://github.com/ClickHouse/clickhouse-docs)です。  
ClickHouseに新しい関数を追加する際は、以下のテンプレートをガイドとして使用できます：

```markdown

# newFunctionName

関数の短い説明がここに入ります。  
それが何をするのか、典型的な使用ケースを簡潔に説明してください。

**構文**

\```sql
newFunctionName(arg1, arg2[, arg3])
\```

**引数**

- `arg1` — 引数の説明。 [DataType](../data-types/float.md)
- `arg2` — 引数の説明。 [DataType](../data-types/float.md)
- `arg3` — オプション引数の説明（任意）。 [DataType](../data-types/float.md)

**実装の詳細**

関連がある場合、実装の詳細について説明します。

**返される値**

- {ここに関数の返り値を挿入} を返します。 [DataType](../data-types/float.md)

**例**

クエリ：

\```sql
SELECT 'ここに例のクエリを書く';
\```

レスポンス：

\```response
┌───────────────────────────────────┐
│ クエリの結果                     │
└───────────────────────────────────┘
\```
```

## テストデータの使用 {#using-test-data}

ClickHouseの開発には、現実的なデータセットを読み込むことがしばしば要求されます。  
これは特にパフォーマンステストで重要です。  
私たちは、Web分析のための特別に用意された匿名データセットを持っています。これには、追加で約3GBの空きディスクスペースが必要です。

```sh
sudo apt install wget xz-utils

wget https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz
wget https://datasets.clickhouse.com/visits/tsv/visits_v1.tsv.xz

xz -v -d hits_v1.tsv.xz
xz -v -d visits_v1.tsv.xz

clickhouse-client
```

clickhouse-client内で：

```sql
CREATE DATABASE IF NOT EXISTS test;

CREATE TABLE test.hits ( WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16),  URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8,  FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8,  UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8,  JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8,  SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8,  SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8,  IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8,  HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16),  RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16,  SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32,  DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32,  NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8,  SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64,  ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16,  GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String,  UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String,  FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  `ParsedParams.Key1` Array(String),  `ParsedParams.Key2` Array(String),  `ParsedParams.Key3` Array(String),  `ParsedParams.Key4` Array(String),  `ParsedParams.Key5` Array(String),  `ParsedParams.ValueDouble` Array(Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8) ENGINE = MergeTree PARTITION BY toYYYYMM(EventDate) SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID), EventTime);

CREATE TABLE test.visits ( CounterID UInt32,  StartDate Date,  Sign Int8,  IsNew UInt8,  VisitID UInt64,  UserID UInt64,  StartTime DateTime,  Duration UInt32,  UTCStartTime DateTime,  PageViews Int32,  Hits Int32,  IsBounce UInt8,  Referer String,  StartURL String,  RefererDomain String,  StartURLDomain String,  EndURL String,  LinkURL String,  IsDownload UInt8,  TraficSourceID Int8,  SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  PlaceID Int32,  RefererCategories Array(UInt16),  URLCategories Array(UInt16),  URLRegions Array(UInt32),  RefererRegions Array(UInt32),  IsYandex UInt8,  GoalReachesDepth Int32,  GoalReachesURL Int32,  GoalReachesAny Int32,  SocialSourceNetworkID UInt8,  SocialSourcePage String,  MobilePhoneModel String,  ClientEventTime DateTime,  RegionID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RemoteIP UInt32,  RemoteIP6 FixedString(16),  IPNetworkID UInt32,  SilverlightVersion3 UInt32,  CodeVersion UInt32,  ResolutionWidth UInt16,  ResolutionHeight UInt16,  UserAgentMajor UInt16,  UserAgentMinor UInt16,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  SilverlightVersion2 UInt8,  SilverlightVersion4 UInt16,  FlashVersion3 UInt16,  FlashVersion4 UInt16,  ClientTimeZone Int16,  OS UInt8,  UserAgent UInt8,  ResolutionDepth UInt8,  FlashMajor UInt8,  FlashMinor UInt8,  NetMajor UInt8,  NetMinor UInt8,  MobilePhone UInt8,  SilverlightVersion1 UInt8,  Age UInt8,  Sex UInt8,  Income UInt8,  JavaEnable UInt8,  CookieEnable UInt8,  JavascriptEnable UInt8,  IsMobile UInt8,  BrowserLanguage UInt16,  BrowserCountry UInt16,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16),  Params Array(String),  `Goals.ID` Array(UInt32),  `Goals.Serial` Array(UInt32),  `Goals.EventTime` Array(DateTime),  `Goals.Price` Array(Int64),  `Goals.OrderID` Array(String),  `Goals.CurrencyID` Array(UInt32),  WatchIDs Array(UInt64),  ParamSumPrice Int64,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16,  ClickLogID UInt64,  ClickEventID Int32,  ClickGoodEvent Int32,  ClickEventTime DateTime,  ClickPriorityID Int32,  ClickPhraseID Int32,  ClickPageID Int32,  ClickPlaceID Int32,  ClickTypeID Int32,  ClickResourceID Int32,  ClickCost UInt32,  ClickClientIP UInt32,  ClickDomainID UInt32,  ClickURL String,  ClickAttempt UInt8,  ClickOrderID UInt32,  ClickBannerID UInt32,  ClickMarketCategoryID UInt32,  ClickMarketPP UInt32,  ClickMarketCategoryName String,  ClickMarketPPName String,  ClickAWAPSCampaignName String,  ClickPageName String,  ClickTargetType UInt16,  ClickTargetPhraseID UInt64,  ClickContextType UInt8,  ClickSelectType Int8,  ClickOptions String,  ClickGroupBannerID Int32,  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String,  UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String,  FromTag String,  HasGCLID UInt8,  FirstVisit DateTime,  PredLastVisit Date,  LastVisit Date,  TotalVisits UInt32,  `TraficSource.ID` Array(Int8),  `TraficSource.SearchEngineID` Array(UInt16),  `TraficSource.AdvEngineID` Array(UInt8),  `TraficSource.PlaceID` Array(UInt16),  `TraficSource.SocialSourceNetworkID` Array(UInt8),  `TraficSource.Domain` Array(String),  `TraficSource.SearchPhrase` Array(String),  `TraficSource.SocialSourcePage` Array(String),  Attendance FixedString(16),  CLID UInt32,  YCLID UInt64,  NormalizedRefererHash UInt64,  SearchPhraseHash UInt64,  RefererDomainHash UInt64,  NormalizedStartURLHash UInt64,  StartURLDomainHash UInt64,  NormalizedEndURLHash UInt64,  TopLevelDomain UInt64,  URLScheme UInt64,  OpenstatServiceNameHash UInt64,  OpenstatCampaignIDHash UInt64,  OpenstatAdIDHash UInt64,  OpenstatSourceIDHash UInt64,  UTMSourceHash UInt64,  UTMMediumHash UInt64,  UTMCampaignHash UInt64,  UTMContentHash UInt64,  UTMTermHash UInt64,  FromHash UInt64,  WebVisorEnabled UInt8,  WebVisorActivity UInt32,  `ParsedParams.Key1` Array(String),  `ParsedParams.Key2` Array(String),  `ParsedParams.Key3` Array(String),  `ParsedParams.Key4` Array(String),  `ParsedParams.Key5` Array(String),  `ParsedParams.ValueDouble` Array(Float64),  `Market.Type` Array(UInt8),  `Market.GoalID` Array(UInt32),  `Market.OrderID` Array(String),  `Market.OrderPrice` Array(Int64),  `Market.PP` Array(UInt32),  `Market.DirectPlaceID` Array(UInt32),  `Market.DirectOrderID` Array(UInt32),  `Market.DirectBannerID` Array(UInt32),  `Market.GoodID` Array(String),  `Market.GoodName` Array(String),  `Market.GoodQuantity` Array(Int32),  `Market.GoodPrice` Array(Int64),  IslandID FixedString(16)) ENGINE = CollapsingMergeTree(Sign) PARTITION BY toYYYYMM(StartDate) SAMPLE BY intHash32(UserID) ORDER BY (CounterID, StartDate, intHash32(UserID), VisitID);

```

データをインポートします：

```bash
clickhouse-client --max_insert_block_size 100000 --query "INSERT INTO test.hits FORMAT TSV" < hits_v1.tsv
clickhouse-client --max_insert_block_size 100000 --query "INSERT INTO test.visits FORMAT TSV" < visits_v1.tsv
