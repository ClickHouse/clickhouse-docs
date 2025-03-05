---
slug: /development/developer-instruction
sidebar_position: 5
sidebar_label: 前提条件
---


# 前提条件

ClickHouseはLinux、FreeBSD、macOSでビルド可能です。  
Windowsを使用している場合でも、UbuntuなどのLinuxを実行する仮想マシン内でClickHouseをビルドできます。例えば、[VirtualBox](https://www.virtualbox.org/)を使用することができます。

## GitHubにリポジトリを作成する {#create-a-repository-on-github}

ClickHouseの開発を始めるには、[GitHub](https://www.github.com/)アカウントが必要です。  
SSHキーをローカルに生成し（まだ持っていない場合）、その公開鍵をGitHubにアップロードしてください。これはパッチを寄稿するための前提条件です。

次に、右上の「fork」ボタンをクリックして、個人アカウントに[ClickHouseリポジトリ](https://github.com/ClickHouse/ClickHouse/)をフォークします。

変更を寄稿するには、まずフォークしたリポジトリ内のブランチに変更をコミットし、その後、メインリポジトリへの変更を持つ「Pull Request」を作成します。

Gitリポジトリを操作するためには、Gitをインストールしてください。たとえば、Ubuntuでは次のコマンドを実行します：

```sh
sudo apt update
sudo apt install git
```

Gitのチートシートは[こちら](https://education.github.com/git-cheat-sheet-education.pdf)にあります。  
詳細なGitマニュアルは[こちら](https://git-scm.com/book/en/v2)にあります。

## 開発マシンにリポジトリをクローンする {#clone-the-repository-to-your-development-machine}

最初に、作業マシンにソースファイルをダウンロードします。すなわち、リポジトリをクローンします：

```sh
git clone git@github.com:your_github_username/ClickHouse.git  # プレースホルダをあなたのGitHubユーザー名に置き換えてください
cd ClickHouse
```

このコマンドは、ソースコード、テスト、およびその他のファイルを含むディレクトリ `ClickHouse/` を作成します。  
チェックアウトする際にカスタムディレクトリを指定できますが、このパスに空白が含まれているとビルドが後で失敗する可能性があるため、注意が必要です。

ClickHouseのGitリポジトリは、3rdパーティのライブラリをインポートするためにサブモジュールを使用しています。  
サブモジュールはデフォルトではチェックアウトされません。  
以下のいずれかの方法で行うことができます：

- `--recurse-submodules`オプションを使って`git clone`を実行する、

- `--recurse-submodules`なしで`git clone`を実行した場合は、`git submodule update --init --jobs <N>`を実行してすべてのサブモジュールを明示的にチェックアウトします。 (`<N>`は、例えばダウンロードを並列化するために`12`などに設定できます。)

- `--recurse-submodules`なしで`git clone`を実行し、必要なファイルと履歴を省略するために[sparse](https://github.blog/2020-01-17-bring-your-monorepo-down-to-size-with-sparse-checkout/)および[shallow](https://github.blog/2020-12-21-get-up-to-speed-with-partial-clone-and-shallow-clone/)サブモジュールチェックアウトを使用したい場合は、`./contrib/update-submodules.sh`を実行します。このオプションはCIによって使用されていますが、サブモジュールを扱う際に便利さが失われ、遅くなるため、ローカル開発には推奨されません。

Gitサブモジュールのステータスを確認するには、`git submodule status`を実行します。

以下のエラーメッセージが表示された場合：

```bash
Permission denied (publickey).
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

GitHubに接続するためのSSHキーが欠落していることを意味します。  
これらのキーは通常、`~/.ssh`にあります。  
SSHキーが受け入れられるようにするには、GitHubの設定にアップロードする必要があります。

HTTPS経由でリポジトリをクローンすることもできます：

```sh
git clone https://github.com/ClickHouse/ClickHouse.git
```

ただし、これでは変更をサーバーに送信することはできません。  
一時的にこれを使用することはできますが、後でSSHキーを追加してリモートアドレスを`git remote`コマンドで置き換える必要があります。

また、元のClickHouseリポジトリのアドレスをローカルリポジトリに追加して、そこから更新をプルすることもできます：

```sh
git remote add upstream git@github.com:ClickHouse/ClickHouse.git
```

このコマンドを正常に実行した後、`git pull upstream master`を実行することで、メインのClickHouseリポジトリから更新をプルできるようになります。

:::tip
必ず`git push`をそのまま使用しないでください。間違ったリモートや間違ったブランチにプッシュしてしまうかもしれません。リモートおよびブランチ名を明示的に指定する方が良いです。たとえば、`git push origin my_branch_name`のようにしてください。
:::

## コードを書く {#writing-code}

以下は、ClickHouse用のコードを書く際に役立つクイックリンクです：

- [ClickHouseのアーキテクチャ](/development/architecture/).
- [コードスタイルガイド](/development/style/).
- [サードパーティライブラリ](/development/contrib#adding-and-maintaining-third-party-libraries)
- [テストの作成](/development/tests/)
- [オープンな問題](https://github.com/ClickHouse/ClickHouse/issues?q=is%3Aopen+is%3Aissue+label%3A%22easy+task%22)

### IDE {#ide}

**CLion（推奨）**

使用するIDEがわからない場合は、[CLion](https://www.jetbrains.com/clion/)の使用をお勧めします。  
CLionは商用ソフトウェアですが、30日間の無料トライアルを提供しています。  
学生には無償で提供されます。  
CLionはLinuxおよびmacOSの両方で使用できます。

ClickHouseの開発にCLionを使用する際に知っておくべき事柄：

- CLionは独自で`build`パスを作成し、ビルドタイプとして`debug`を自動的に選択します。
- CLionで定義されたCMakeのバージョンを使用し、あなたがインストールしたものは使用しません。
- CLionは`ninja`の代わりに`make`を使用してビルドタスクを実行します（これは通常の動作です）。

**代替手段**

[KDevelop](https://kdevelop.org/)や[QTCreator](https://www.qt.io/product/development-tools)は、ClickHouseを開発するための別の優れたIDEです。  
KDevelopは素晴らしいIDEですが、時々不安定です。  
プロジェクトを開くときにKDevelopがクラッシュした場合、プロジェクトのファイルリストを開いたらすぐに「すべて停止」ボタンをクリックすべきです。  
そうすることで、KDevelopは問題なく作業できます。

他に使用できるIDEとしては、[Sublime Text](https://www.sublimetext.com/)、[Visual Studio Code](https://code.visualstudio.com/)、または[Kate](https://kate-editor.org/)（これらはすべてLinuxで利用可能）が挙げられます。  
VS Codeを使用している場合は、IntelliSenseの代わりに[clangd拡張機能](https://marketplace.visualstudio.com/items?itemName=llvm-vs-code-extensions.vscode-clangd)の使用をお勧めします。これははるかにパフォーマンスが良いです。

## プルリクエストを作成する {#create-a-pull-request}

GitHubのUIで自分のフォークリポジトリに移動します。  
ブランチで開発している場合は、そのブランチを選択する必要があります。  
画面上には「Pull request」ボタンが表示されます。  
本質的には、「私の変更をメインリポジトリに取り込むリクエストを作成する」という意味です。

作業がまだ完了していなくてもプルリクエストを作成できます。  
その場合、タイトルの最初に「WIP」（作業中）を付けておくと、後で変更できます。  
これは、共同レビューと変更の議論、およびすべての利用可能なテストを実行するために便利です。  
変更の簡単な説明を提供することが重要です。この説明は後でリリースの変更ログを生成する際に使用されます。

ClickHouseの社員が、あなたのPRに「can be tested」というタグを付けると、テストが開始されます。  
最初のいくつかのチェック（例：コードスタイル）の結果は数分以内に返されます。  
ビルドチェックの結果は30分以内に到着します。  
主要なテストセットは1時間以内に報告されます。

システムは、あなたのプルリクエスト用にClickHouseバイナリビルドを個別に準備します。  
これらのビルドを取得するには、チェックリストの「Builds」項目の横にある「Details」リンクをクリックします。  
そこには、プロダクションサーバーにデプロイできるClickHouseのビルド済み`.deb`パッケージへの直接リンクがあります（恐れがなければ）。

## ドキュメントを書く {#write-documentation}

新しい機能を追加するプルリクエストには、適切なドキュメントが必要です。  
ドキュメントの変更をプレビューしたい場合は、README.mdファイルにローカルでドキュメントページをビルドする方法についての指示が[こちら](https://github.com/ClickHouse/clickhouse-docs)にあります。  
ClickHouseに新しい関数を追加する際は、以下のテンプレートをガイドとして使用することができます：

```markdown

# newFunctionName

関数の簡単な説明はここに入力してください。関数が何をするか、典型的な使用ケースを簡潔に説明する必要があります。

**構文**

\```sql
newFunctionName(arg1, arg2[, arg3])
\```

**引数**

- `arg1` — 引数の説明。 [DataType](../data-types/float.md)
- `arg2` — 引数の説明。 [DataType](../data-types/float.md)
- `arg3` — 任意の引数の説明（オプション）。 [DataType](../data-types/float.md)

**実装の詳細**

関連する場合、実装の詳細の説明。

**戻り値**

- {functionが戻すものをここに挿入}を返します。 [DataType](../data-types/float.md)

**例**

クエリ：

\```sql
SELECT 'ここに例のクエリを書いてください';
\```

レスポンス：

\```response
┌───────────────────────────────────┐
│ クエリの結果                     │
└───────────────────────────────────┘
\```
```

## テストデータを使用する {#using-test-data}

ClickHouseの開発には、リアルなデータセットをロードすることが必要な場合がよくあります。  
これは特にパフォーマンステストにおいて重要です。  
ウェブ分析のために特別に準備されたデータセットがあります。  
追加で約3GBの空きディスクスペースが必要です。

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
```
