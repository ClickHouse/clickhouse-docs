---
slug: /development/developer-instruction
sidebar_position: 5
sidebar_label: 前提条件
---

# 前提条件

ClickHouseは、Linux、FreeBSD、macOS上でビルド可能です。  
Windowsを使用している場合でも、Ubuntuを実行している仮想マシン内でClickHouseをビルドできます。たとえば、[VirtualBox](https://www.virtualbox.org/)を使用可能です。

## GitHubにリポジトリを作成する {#create-a-repository-on-github}

ClickHouseの開発を始めるには、[GitHub](https://www.github.com/)アカウントが必要です。  
SSHキーをローカルで生成し（すでに持っていない場合）、公開キーをGitHubにアップロードしてください。これは、パッチに貢献するための前提条件です。

次に、個人アカウントで[d ClickHouseリポジトリ](https://github.com/ClickHouse/ClickHouse/)をフォークします。右上の「fork」ボタンをクリックしてください。

変更を貢献するには、たとえば、問題の修正や機能を追加する場合、まず変更をあなたのフォークのブランチにコミットし、その後、メインリポジトリへの「Pull Request」を作成します。

Gitリポジトリを操作するためにGitをインストールしてください。たとえば、Ubuntuでは以下を実行します：

```sh
sudo apt update
sudo apt install git
```

Gitのチートシートは[こちら](https://education.github.com/git-cheat-sheet-education.pdf)にあります。  
詳細なGitマニュアルは[こちら](https://git-scm.com/book/en/v2)です。

## 開発マシンにリポジトリをクローンする {#clone-the-repository-to-your-development-machine}

まず、ソースファイルを作業マシンにダウンロードします。つまり、リポジトリをクローンします：

```sh
git clone git@github.com:your_github_username/ClickHouse.git  # プレースホルダをあなたのGitHubユーザー名に置き換えてください
cd ClickHouse
```

このコマンドは、ソースコード、テスト、その他のファイルを含む`ClickHouse/`ディレクトリを作成します。  
URLの後にカスタムディレクトリを指定できますが、このパスには空白を含まないことが重要です。そうしないと、ビルドが後で壊れる可能性があります。

ClickHouseのGitリポジトリは、サブモジュールを使用してサードパーティのライブラリを引き込んでいます。  
サブモジュールはデフォルトではチェックアウトされません。次のいずれかを実行できます。

- `--recurse-submodules`オプション付きで`git clone`を実行します。
- `--recurse-submodules`なしで`git clone`が実行された場合、すべてのサブモジュールを明示的にチェックアウトするために`git submodule update --init --jobs <N>`を実行します。 (`<N>`は例として`12`に設定してダウンロードを並列化できます。)
- `--recurse-submodules`なしで`git clone`が実行され、不要なファイルや履歴をサブモジュールから除外するために[sparse](https://github.blog/2020-01-17-bring-your-monorepo-down-to-size-with-sparse-checkout/)および[shallow](https://github.blog/2020-12-21-get-up-to-speed-with-partial-clone-and-shallow-clone/)サブモジュールチェックアウトを使用する場合、`./contrib/update-submodules.sh`を実行します。この代替方法はCIによって使用されますが、サブモジュールでの作業を不便にし、遅くなるため、ローカル開発には推奨されません。

Gitサブモジュールの状態を確認するには、`git submodule status`を実行します。

次のエラーメッセージが表示された場合、

```bash
Permission denied (publickey).
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

GitHubへの接続に必要なSSHキーが欠落しています。  
これらのキーは通常`~/.ssh`にあります。SSHキーが受け入れられるには、GitHubの設定にアップロードする必要があります。

HTTPS経由でリポジトリをクローンすることもできます：

```sh
git clone https://github.com/ClickHouse/ClickHouse.git
```

ただし、これでは変更をサーバーに送信できません。  
一時的に使用することはできますが、後でSSHキーを追加し、リモートのリポジトリのアドレスを`git remote`コマンドで置き換えることができます。

元のClickHouseリポジトリのアドレスをローカルリポジトリに追加して、そこから更新を取得することもできます：

```sh
git remote add upstream git@github.com:ClickHouse/ClickHouse.git
```

このコマンドを正常に実行すると、`git pull upstream master`を実行することでメインのClickHouseリポジトリから更新を取得できるようになります。

:::tip
`git push`をそのまま使用しないでください。誤ったリモートや誤ったブランチにプッシュする可能性があります。  
リモートとブランチ名を明示的に指定する方が良いでしょう。たとえば、`git push origin my_branch_name`のように。
:::

## コードを書く {#writing-code}

ClickHouseのコードを書く際に役立ついくつかのクイックリンクを以下に示します：

- [ClickHouseアーキテクチャ](/development/architecture/)。
- [コーディングスタイルガイド](/development/style/)。
- [サードパーティライブラリ](/development/contrib/#adding-third-party-libraries)
- [テストの作成](/development/tests/)
- [オープンイシュー](https://github.com/ClickHouse/ClickHouse/issues?q=is%3Aopen+is%3Aissue+label%3A%22easy+task%22)

### IDE {#ide}

**CLion（推奨）**

どのIDEを使用するか分からない場合は、[CLion](https://www.jetbrains.com/clion/)を使用することをお勧めします。  
CLionは商業ソフトウェアですが、30日間の無料トライアルを提供しています。  
学生には無償で提供されます。CLionはLinuxおよびmacOSの両方で使用できます。

ClickHouseの開発にCLionを使用する際に知っておくべきこと：

- CLionは自動的に`build`パスを作成し、ビルドタイプとして`debug`を自動的に選択します
- CLionは自分でインストールしたCMakeではなく、CLion内で定義されたバージョンのCMakeを使用します
- CLionは`ninja`の代わりに`make`を使用してビルドタスクを実行します（これは正常な動作です）

**代替手段**

[KDevelop](https://kdevelop.org/)や[QTCreator](https://www.qt.io/product/development-tools)は、ClickHouse開発に適した他の優れたIDEです。  
KDevelopは素晴らしいIDEですが、時々不安定です。  
KDevelopがプロジェクトを開く際にクラッシュした場合は、プロジェクトのファイルリストが開いたらすぐに「Stop All」ボタンをクリックしてください。  
そうすれば、KDevelopは通常通り動作するはずです。

他に使用できるIDEとしては、[Sublime Text](https://www.sublimetext.com/)、[Visual Studio Code](https://code.visualstudio.com/)、または[Kate](https://kate-editor.org/)（すべてLinuxで入手可能）があります。  
VS Codeを使用している場合は、[clangd拡張](https://marketplace.visualstudio.com/items?itemName=llvm-vs-code-extensions.vscode-clangd)を利用してIntelliSenseを置き換えることをお勧めします。これははるかにパフォーマンスが良いです。

## プルリクエストを作成する {#create-a-pull-request}

GitHubのUIでフォークしたリポジトリに移動してください。  
ブランチで開発している場合、そのブランチを選択する必要があります。  
画面上に「Pull request」ボタンがあります。  
本質的に、これは「私の変更をメインリポジトリに受け入れるリクエストを作成する」ということです。

作業がまだ完了していない場合でもプルリクエストを作成できます。  
この場合は、タイトルの最初に「WIP」（進行中）という言葉を入れてください。後で変更可能です。  
これは、協力的なレビューや変更の議論、及び利用可能なすべてのテストを実行するために便利です。  
変更について簡単な説明を提供することが重要で、後でリリースの変更ログを生成する際に使用されます。

ClickHouseのスタッフがあなたのPRに「テスト可能」とラベルを付けると、テストが開始されます。  
いくつかの最初のチェックの結果（例えば、コードスタイル）は数分以内に報告されます。  
ビルドチェックの結果は30分以内に届きます。  
主要なセットのテストは1時間以内に結果を報告します。

システムは、あなたのプルリクエストのためにClickHouseのバイナリビルドを個別に準備します。  
これらのビルドを取得するには、チェックリストの「Builds」エントリの隣にある「Details」リンクをクリックしてください。  
そこには、.debパッケージのリンクが直接表示され、プロダクションサーバーに展開することができます（恐れがなければ）。

## ドキュメントを書く {#write-documentation}

新機能を追加するプルリクエストには、適切なドキュメントも必要です。  
ドキュメントの変更をプレビューしたい場合は、README.mdファイルにローカルでドキュメントページをビルドする手順が記載されています。[こちら](https://github.com/ClickHouse/clickhouse-docs)から確認できます。  
ClickHouseに新しい関数を追加する場合は、以下のテンプレートをガイドとして使用できます：

# newFunctionName

関数の簡単な説明をここに記述します。  
この関数が何をするのかと典型的な使用ケースを簡潔に説明してください。

**構文**

```sql
newFunctionName(arg1, arg2[, arg3])
```

**引数**

- `arg1` — 引数の説明。[DataType](../data-types/float.md)
- `arg2` — 引数の説明。[DataType](../data-types/float.md)
- `arg3` — オプションの引数の説明（オプション）。[DataType](../data-types/float.md)

**実装の詳細**

関連する場合は、実装の詳細を説明します。

**返される値**

- 関数が返すものをここに挿入を返します。[DataType](../data-types/float.md)

**例**

クエリ：

```sql
SELECT 'ここに例のクエリを書く';
```

レスポンス：

```response
┌───────────────────────────────────┐
│ クエリの結果                     │
└───────────────────────────────────┘
```


## テストデータを使用する {#using-test-data}

ClickHouseの開発には、現実的なデータセットのロードが必要なことがよくあります。  
これは特にパフォーマンステストにとって重要です。  
ウェブ分析のために特別に準備された匿名化データのセットがあります。  
これには追加で約3GBの空きディスクスペースが必要です。

```sh
    sudo apt install wget xz-utils

    wget https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz
    wget https://datasets.clickhouse.com/visits/tsv/visits_v1.tsv.xz

    xz -v -d hits_v1.tsv.xz
    xz -v -d visits_v1.tsv.xz

    clickhouse-client
```

clickhouse-clientでは：

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
