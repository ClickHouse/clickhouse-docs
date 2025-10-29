---
'description': 'ClickHouse 開発のための前提条件とセットアップ手順'
'sidebar_label': '前提条件'
'sidebar_position': 5
'slug': '/development/developer-instruction'
'title': '開発者の前提条件'
'doc_type': 'guide'
---



# 前提条件

ClickHouse は、Linux、FreeBSD、macOS でビルドできます。  
Windows を使用している場合でも、Ubuntu を実行している仮想マシン上で ClickHouse をビルドできます。たとえば、[VirtualBox](https://www.virtualbox.org/) を使用できます。

## GitHub にリポジトリを作成する {#create-a-repository-on-github}

ClickHouse の開発を始めるには、[GitHub](https://www.github.com/) アカウントが必要です。  
SSH キーをローカルで生成して（まだ持っていない場合）、公開鍵を GitHub にアップロードしてください。これはパッチに貢献するための前提条件です。

次に、右上の「fork」ボタンをクリックして、個人アカウントで [ClickHouse リポジトリ](https://github.com/ClickHouse/ClickHouse/) をフォークします。

変更を貢献するには、例えば、問題の修正や機能の追加の場合、まずフォークのブランチに変更をコミットし、次にメインリポジトリへの変更を含む「プルリクエスト」を作成します。

Git リポジトリで作業するためには、Git をインストールしてください。たとえば、Ubuntu では次のコマンドを実行します。

```sh
sudo apt update
sudo apt install git
```

Git のチートシートは [こちら](https://education.github.com/git-cheat-sheet-education.pdf) で見つけることができます。  
詳細な Git マニュアルは [こちら](https://git-scm.com/book/en/v2) にあります。

## 開発マシンにリポジトリをクローンする {#clone-the-repository-to-your-development-machine}

まず、作業マシンにソースファイルをダウンロードします。つまり、リポジトリをクローンします。

```sh
git clone git@github.com:your_github_username/ClickHouse.git  # replace the placeholder with your GitHub user name
cd ClickHouse
```

このコマンドは、ソースコード、テスト、その他のファイルを含む `ClickHouse/` というディレクトリを作成します。  
URL の後にカスタムディレクトリを指定できますが、このパスに空白が含まれないことが重要です。これはビルドが後で壊れる可能性があるためです。

ClickHouse の Git リポジトリは、サードパーティライブラリを取得するためにサブモジュールを使用しています。  
デフォルトではサブモジュールはチェックアウトされません。  
次のいずれかの方法を使用できます。

- `--recurse-submodules` オプションを付けて `git clone` を実行します。

- `git clone` を `--recurse-submodules` なしで実行した場合、全てのサブモジュールを明示的にチェックアウトするために `git submodule update --init --jobs <N>` を実行します。 (`<N>` を `12` などに設定してダウンロードを並列化できます。)

- `git clone` を `--recurse-submodules` なしで実行し、[スパース](https://github.blog/2020-01-17-bring-your-monorepo-down-to-size-with-sparse-checkout/)および[浅い](https://github.blog/2020-12-21-get-up-to-speed-with-partial-clone-and-shallow-clone/)サブモジュールチェックアウトを使用して不要なファイルや履歴を省略してスペースを節約したい場合は、`./contrib/update-submodules.sh` を実行します。この代替方法は CI で使用されますが、ローカル開発にはお勧めしません。サブモジュールの取り扱いが面倒になり、遅くなるためです。

Git サブモジュールのステータスを確認するには、`git submodule status` を実行します。

次のエラーメッセージが表示された場合

```bash
Permission denied (publickey).
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

GitHub に接続するための SSH キーが不足しています。  
これらのキーは通常 `~/.ssh` にあります。  
SSH キーが受け入れられるには、GitHub の設定でアップロードする必要があります。

HTTPS 経由でリポジトリをクローンすることもできます。

```sh
git clone https://github.com/ClickHouse/ClickHouse.git
```

ただし、これでは変更をサーバーに送信することはできません。  
一時的にそれを使用して、後で SSH キーを追加し、リモートアドレスを `git remote` コマンドで置き換えることもできます。

元の ClickHouse リポジトリのアドレスをローカルリポジトリに追加して、そこから更新を取得することもできます。

```sh
git remote add upstream git@github.com:ClickHouse/ClickHouse.git
```

このコマンドを正常に実行した後は、`git pull upstream master` を実行することで、メインの ClickHouse リポジトリから更新を取得できるようになります。

:::tip  
必ず `git push` をそのまま使用しないでください。誤ったリモートや誤ったブランチにプッシュする可能性があります。  
リモート名とブランチ名を明示的に指定する方が良いです。例: `git push origin my_branch_name`。  
:::

## コードを書く {#writing-code}

以下は、ClickHouse のコードを書く際に役立つクイックリンクです。

- [ClickHouse アーキテクチャ](/development/architecture/)  
- [コードスタイルガイド](/development/style/)  
- [サードパーティライブラリ](/development/contrib#adding-and-maintaining-third-party-libraries)  
- [テストの作成](/development/tests/)  
- [オープンな問題](https://github.com/ClickHouse/ClickHouse/issues?q=is%3Aopen+is%3Aissue+label%3A%22easy+task%22)  

### IDE {#ide}

[Visual Studio Code](https://code.visualstudio.com/) と [Neovim](https://neovim.io/) は、過去に ClickHouse の開発で良好に機能した二つのオプションです。  
VS Code を使用している場合は、[clangd 拡張機能](https://marketplace.visualstudio.com/items?itemName=llvm-vs-code-extensions.vscode-clangd)を使用して IntelliSense の代替とすることをお勧めします。パフォーマンスがはるかに良くなります。

[CLion](https://www.jetbrains.com/clion/) は別の優れた代替です。ただし、ClickHouse のような大規模なプロジェクトでは遅くなることがあります。  
CLion を使用する際に留意すべきことがいくつかあります。

- CLion は自動的に `build` パスを作成し、ビルドタイプに `debug` を自動的に選択します  
- CLion で定義された CMake のバージョンを使用し、あなたがインストールしたものは使用しません  
- CLion はタスクをビルドする際に `ninja` ではなく `make` を使用します（これは正常な動作です）

他にも使用できる IDE には [Sublime Text](https://www.sublimetext.com/)、[Qt Creator](https://www.qt.io/product/development-tools)、または [Kate](https://kate-editor.org/) があります。

## プルリクエストを作成する {#create-a-pull-request}

GitHub の UI でフォークしたリポジトリに移動します。  
ブランチで開発している場合は、そのブランチを選択する必要があります。  
画面には「プルリクエスト」ボタンがあります。  
本質的にこれは「メインリポジトリに私の変更を受け入れるリクエストを作成する」という意味です。

プルリクエストは、作業が完了していなくても作成できます。  
この場合、タイトルの先頭に「WIP」（作業中）の言葉を付けてください。後で変更できます。  
これは、変更の協力的なレビューや議論、利用可能な全てのテストの実行に役立ちます。  
変更の簡潔な説明を提供することが重要です。これは後でリリースの変更ログを生成するために使用されます。

ClickHouse の従業員が PR に「テスト可能」のタグを付けると、テストが始まります。  
最初のチェック（例: コードスタイル）の結果は数分内に届きます。  
ビルドチェックの結果は30分以内に届きます。  
主要なテストセットは1時間以内に報告されます。

システムはあなたのプルリクエストのために ClickHouse バイナリビルドを個別に準備します。  
これらのビルドを取得するには、チェックの一覧の「ビルド」エントリの横にある「詳細」リンクをクリックします。  
そこには、デプロイ可能な ClickHouse のビルドされた .deb パッケージへの直接リンクが見つかります（恐れがなければ、本番サーバーでも使用できます）。

## ドキュメントを書く {#write-documentation}

新しい機能を追加するプルリクエストには、適切なドキュメントが必要です。  
ドキュメントの変更をプレビューしたい場合は、ローカルでドキュメントページをビルドする手順が README.md ファイル [こちら](https://github.com/ClickHouse/clickhouse-docs) にあります。  
ClickHouse に新しい関数を追加する際は、以下のテンプレートをガイドとして使用できます。

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

## テストデータを使用する {#using-test-data}

ClickHouse の開発には、現実的なデータセットのロードが必要なことがよくあります。  
これは特にパフォーマンステストにおいて重要です。  
Web アナリティクスの匿名化されたデータセットを特別に準備しています。  
追加で約 3GB の空きディスクスペースが必要です。

```sh
sudo apt install wget xz-utils

wget https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz
wget https://datasets.clickhouse.com/visits/tsv/visits_v1.tsv.xz

xz -v -d hits_v1.tsv.xz
xz -v -d visits_v1.tsv.xz

clickhouse-client
```

clickhouse-client では：

```sql
CREATE DATABASE IF NOT EXISTS test;

CREATE TABLE test.hits ( WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16),  URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8,  FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8,  UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8,  JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8,  SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8,  SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8,  IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8,  HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16),  RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16,  SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32,  DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32,  NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8,  SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64,  ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16,  GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String,  UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String,  FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  `ParsedParams.Key1` Array(String),  `ParsedParams.Key2` Array(String),  `ParsedParams.Key3` Array(String),  `ParsedParams.Key4` Array(String),  `ParsedParams.Key5` Array(String),  `ParsedParams.ValueDouble` Array(Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8) ENGINE = MergeTree PARTITION BY toYYYYMM(EventDate) SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID), EventTime);

CREATE TABLE test.visits ( CounterID UInt32,  StartDate Date,  Sign Int8,  IsNew UInt8,  VisitID UInt64,  UserID UInt64,  StartTime DateTime,  Duration UInt32,  UTCStartTime DateTime,  PageViews Int32,  Hits Int32,  IsBounce UInt8,  Referer String,  StartURL String,  RefererDomain String,  StartURLDomain String,  EndURL String,  LinkURL String,  IsDownload UInt8,  TraficSourceID Int8,  SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  PlaceID Int32,  RefererCategories Array(UInt16),  URLCategories Array(UInt16),  URLRegions Array(UInt32),  RefererRegions Array(UInt32),  IsYandex UInt8,  GoalReachesDepth Int32,  GoalReachesURL Int32,  GoalReachesAny Int32,  SocialSourceNetworkID UInt8,  SocialSourcePage String,  MobilePhoneModel String,  ClientEventTime DateTime,  RegionID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RemoteIP UInt32,  RemoteIP6 FixedString(16),  IPNetworkID UInt32,  SilverlightVersion3 UInt32,  CodeVersion UInt32,  ResolutionWidth UInt16,  ResolutionHeight UInt16,  UserAgentMajor UInt16,  UserAgentMinor UInt16,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  SilverlightVersion2 UInt8,  SilverlightVersion4 UInt16,  FlashVersion3 UInt16,  FlashVersion4 UInt16,  ClientTimeZone Int16,  OS UInt8,  UserAgent UInt8,  ResolutionDepth UInt8,  FlashMajor UInt8,  FlashMinor UInt8,  NetMajor UInt8,  NetMinor UInt8,  MobilePhone UInt8,  SilverlightVersion1 UInt8,  Age UInt8,  Sex UInt8,  Income UInt8,  JavaEnable UInt8,  CookieEnable UInt8,  JavascriptEnable UInt8,  IsMobile UInt8,  BrowserLanguage UInt16,  BrowserCountry UInt16,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16),  Params Array(String),  `Goals.ID` Array(UInt32),  `Goals.Serial` Array(UInt32),  `Goals.EventTime` Array(DateTime),  `Goals.Price` Array(Int64),  `Goals.OrderID` Array(String),  `Goals.CurrencyID` Array(UInt32),  WatchIDs Array(UInt64),  ParamSumPrice Int64,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16,  ClickLogID UInt64,  ClickEventID Int32,  ClickGoodEvent Int32,  ClickEventTime DateTime,  ClickPriorityID Int32,  ClickPhraseID Int32,  ClickPageID Int32,  ClickPlaceID Int32,  ClickTypeID Int32,  ClickResourceID Int32,  ClickCost UInt32,  ClickClientIP UInt32,  ClickDomainID UInt32,  ClickURL String,  ClickAttempt UInt8,  ClickOrderID UInt32,  ClickBannerID UInt32,  ClickMarketCategoryID UInt32,  ClickMarketPP UInt32,  ClickMarketCategoryName String,  ClickMarketPPName String,  ClickAWAPSCampaignName String,  ClickPageName String,  ClickTargetType UInt16,  ClickTargetPhraseID UInt64,  ClickContextType UInt8,  ClickSelectType Int8,  ClickOptions String,  ClickGroupBannerID Int32,  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String,  UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String,  FromTag String,  HasGCLID UInt8,  FirstVisit DateTime,  PredLastVisit Date,  LastVisit Date,  TotalVisits UInt32,  `TraficSource.ID` Array(Int8),  `TraficSource.SearchEngineID` Array(UInt16),  `TraficSource.AdvEngineID` Array(UInt8),  `TraficSource.PlaceID` Array(UInt16),  `TraficSource.SocialSourceNetworkID` Array(UInt8),  `TraficSource.Domain` Array(String),  `TraficSource.SearchPhrase` Array(String),  `TraficSource.SocialSourcePage` Array(String),  Attendance FixedString(16),  CLID UInt32,  YCLID UInt64,  NormalizedRefererHash UInt64,  SearchPhraseHash UInt64,  RefererDomainHash UInt64,  NormalizedStartURLHash UInt64,  StartURLDomainHash UInt64,  NormalizedEndURLHash UInt64,  TopLevelDomain UInt64,  URLScheme UInt64,  OpenstatServiceNameHash UInt64,  OpenstatCampaignIDHash UInt64,  OpenstatAdIDHash UInt64,  OpenstatSourceIDHash UInt64,  UTMSourceHash UInt64,  UTMMediumHash UInt64,  UTMCampaignHash UInt64,  UTMContentHash UInt64,  UTMTermHash UInt64,  FromHash UInt64,  WebVisorEnabled UInt8,  WebVisorActivity UInt32,  `ParsedParams.Key1` Array(String),  `ParsedParams.Key2` Array(String),  `ParsedParams.Key3` Array(String),  `ParsedParams.Key4` Array(String),  `ParsedParams.Key5` Array(String),  `ParsedParams.ValueDouble` Array(Float64),  `Market.Type` Array(UInt8),  `Market.GoalID` Array(UInt32),  `Market.OrderID` Array(String),  `Market.OrderPrice` Array(Int64),  `Market.PP` Array(UInt32),  `Market.DirectPlaceID` Array(UInt32),  `Market.DirectOrderID` Array(UInt32),  `Market.DirectBannerID` Array(UInt32),  `Market.GoodID` Array(String),  `Market.GoodName` Array(String),  `Market.GoodQuantity` Array(Int32),  `Market.GoodPrice` Array(Int64),  IslandID FixedString(16)) ENGINE = CollapsingMergeTree(Sign) PARTITION BY toYYYYMM(StartDate) SAMPLE BY intHash32(UserID) ORDER BY (CounterID, StartDate, intHash32(UserID), VisitID);

```

データをインポートします：

```bash
clickhouse-client --max_insert_block_size 100000 --query "INSERT INTO test.hits FORMAT TSV" < hits_v1.tsv
clickhouse-client --max_insert_block_size 100000 --query "INSERT INTO test.visits FORMAT TSV" < visits_v1.tsv
```
