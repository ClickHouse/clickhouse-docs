---
slug: /development/developer-instruction
sidebar_position: 5
sidebar_label: 前提条件
---
# 前提条件

ClickHouseは、Linux、FreeBSD、およびmacOS上で構築できます。
Windowsを使用している場合でも、Linuxを実行している仮想マシン（例： [VirtualBox](https://www.virtualbox.org/) でUbuntu）内でClickHouseをビルドできます。
## GitHubにリポジトリを作成 {#create-a-repository-on-github}

ClickHouseの開発を始めるには、[GitHub](https://www.github.com/) アカウントが必要です。
また、SSHキーをローカルで生成し（まだ持っていない場合）、パッチに貢献するための前提条件として、その公開鍵をGitHubにアップロードしてください。

次に、自分のアカウントで[ClickHouseリポジトリ](https://github.com/ClickHouse/ClickHouse/)をフォークします。右上の「fork」ボタンをクリックします。

変更を貢献するには、例えば問題の修正や機能追加の場合、まずフォークしたリポジトリのブランチに変更をコミットし、次に変更をメインリポジトリに対する「プルリクエスト」を作成します。

Gitリポジトリを扱うには、Gitをインストールしてください。例えば、Ubuntuでは次のコマンドを実行します：

```sh
sudo apt update
sudo apt install git
```

Gitのチートシートは[ここ](https://education.github.com/git-cheat-sheet-education.pdf)にあります。
詳細なGitマニュアルは[こちら](https://git-scm.com/book/en/v2)です。
## 開発マシンにリポジトリをクローンする {#clone-the-repository-to-your-development-machine}

まず、作業マシンにソースファイルをダウンロードします。つまり、リポジトリをクローンします：

```sh
git clone git@github.com:your_github_username/ClickHouse.git  # プレースホルダーをあなたのGitHubユーザー名に置き換えます
cd ClickHouse
```

このコマンドは、ソースコード、テスト、およびその他のファイルを含む`ClickHouse/`というディレクトリを作成します。
URLの後にチェックアウト用のカスタムディレクトリを指定できますが、このパスには空白が含まれていないことが重要です。そうしないと、ビルドが後で壊れるかもしれません。

ClickHouseのGitリポジトリは、3rdパーティライブラリをプルするためにサブモジュールを使用します。
サブモジュールはデフォルトではチェックアウトされません。
以下のいずれかの方法を使用できます。

- `--recurse-submodules`オプションをつけて`git clone`を実行する。

- `--recurse-submodules`なしで`git clone`を実行した場合は、すべてのサブモジュールを明示的にチェックアウトするために、`git submodule update --init --jobs <N>`を実行します。 (`<N>`は、例えば`12`に設定してダウンロードを並列化できます。)

- `--recurse-submodules`なしで`git clone`を実行し、サブモジュールで不要なファイルと履歴を省略してスペースを節約するために、[スパース](https://github.blog/2020-01-17-bring-your-monorepo-down-to-size-with-sparse-checkout/)および[シャロー](https://github.blog/2020-12-21-get-up-to-speed-with-partial-clone-and-shallow-clone/)サブモジュールのチェックアウトを使用したい場合は、`./contrib/update-submodules.sh`を実行します。この代替案はCIで使用されますが、サブモジュールとの作業が便利ではなく、遅くなるため、ローカル開発には推奨されません。

Gitサブモジュールの状態を確認するには、`git submodule status`を実行します。

以下のエラーメッセージが表示される場合：

```bash
Permission denied (publickey).
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

GitHubへの接続に必要なSSHキーが不足しています。
これらのキーは通常`~/.ssh`にあります。
SSHキーを受け入れるには、GitHubの設定でアップロードする必要があります。

リポジトリをHTTPS経由でクローンすることもできます：

```sh
git clone https://github.com/ClickHouse/ClickHouse.git
```

ただし、これでは変更をサーバーに送信することはできません。
一時的に使用することはできますが、後でSSHキーを追加し、リモートアドレスを`git remote`コマンドで置き換える必要があります。

オリジナルのClickHouseリポジトリのアドレスをローカルリポジトリに追加して、そこから更新をプルすることもできます：

```sh
git remote add upstream git@github.com:ClickHouse/ClickHouse.git
```

このコマンドを正常に実行した後、`git pull upstream master`を実行することでメインのClickHouseリポジトリから更新をプルできるようになります。

:::tip
`git push`をそのまま使用しないでください。誤ったリモートやブランチにプッシュしてしまう可能性があります。
リモートとブランチ名を明示的に指定する方が良いです。例: `git push origin my_branch_name`。
:::
## コードの作成 {#writing-code}

ClickHouseのコーディングに役立つかもしれないクイックリンクを以下に示します：

- [ClickHouseアーキテクチャ](/development/architecture/)。
- [コードスタイルガイド](/development/style/)。
- [サードパーティライブラリ](/development/contrib/#adding-third-party-libraries)
- [テストの作成](/development/tests/)
- [オープンイシュー](https://github.com/ClickHouse/ClickHouse/issues?q=is%3Aopen+is%3Aissue+label%3A%22easy+task%22)

### IDE {#ide}

**CLion（推奨）**

どのIDEを使用するか分からない場合は、[CLion](https://www.jetbrains.com/clion/)を使用することをお勧めします。
CLionは商用ソフトウェアですが、30日間の無料トライアルを提供しています。
学生にとっては無償で提供されます。
CLionはLinuxとmacOSの両方で使用できます。

CLionを使用してClickHouseを開発する際に知っておくべきことはいくつかあります：

- CLionは自動的に`build`パスを作成し、ビルドタイプとして`debug`を自動的に選択します
- CLionでは、あなたがインストールしたCMakeのバージョンではなく、CLionで定義されたCMakeのバージョンが使用されます
- CLionは、`ninja`の代わりに`make`を使用してビルドタスクを実行します（これは通常の動作です）

**代替案**

[KDevelop](https://kdevelop.org/)や[QTCreator](https://www.qt.io/product/development-tools)もClickHouseの開発に適した優れた代替IDEです。
KDevelopは素晴らしいIDEですが、時々不安定になることがあります。
KDevelopがプロジェクトを開くときにクラッシュする場合は、プロジェクトのファイルリストが表示されたらすぐに「すべて停止」ボタンをクリックしてください。
そうすれば、KDevelopは正常に作業できるようになります。

他に使用できるIDEとしては、[Sublime Text](https://www.sublimetext.com/)、[Visual Studio Code](https://code.visualstudio.com/)、または[Kate](https://kate-editor.org/)（すべてLinuxで利用可能）があります。
VS Codeを使用している場合は、IntelliSenseの代わりに[clangd拡張機能](https://marketplace.visualstudio.com/items?itemName=llvm-vs-code-extensions.vscode-clangd)の使用をお勧めします。パフォーマンスがはるかに向上します。
## プルリクエストの作成 {#create-a-pull-request}

GitHubのUIで自分のフォークリポジトリに移動します。
ブランチで開発している場合、そのブランチを選択する必要があります。
画面上には「プルリクエスト」ボタンがあります。
本質的には、これは「私の変更をメインリポジトリに受け入れるリクエストを作成する」という意味です。

作業がまだ完了していなくてもプルリクエストを作成できます。
この場合、タイトルの最初に「WIP」（作業中）と付けてください。後で変更できます。
これは、協力的なレビューと変更の議論、ならびに利用可能なすべてのテストを実行するのに役立ちます。
変更の簡潔な説明を提供することが重要です。これは後でリリースの変更ログを生成するために使用されます。

ClickHouseの従業員があなたのPRに「テスト可能」と記載したタグを付けると、テストが始まります。
初期のチェック（例：コードスタイル）の結果が数分以内に届きます。
ビルドチェックの結果は、30分以内に届きます。
主要なテストセットは1時間以内に結果を報告します。

システムはあなたのプルリクエスト用にClickHouseのバイナリビルドを個別に準備します。
これらのビルドを取得するには、チェックのリスト内の「ビルド」の項目の隣にある「詳細」リンクをクリックしてください。
そこには、あなたの本番サーバーに展開も可能なClickHouseのビルド済み.debパッケージへの直接リンクが見つかります（恐れがなければ）。
## ドキュメントの作成 {#write-documentation}

新機能を追加するすべてのプルリクエストには、適切なドキュメントが必要です。
ドキュメントの変更をプレビューしたい場合は、README.mdファイルにローカルでドキュメントページをビルドするための手順が[こちら](https://github.com/ClickHouse/clickhouse-docs)にあります。
ClickHouseに新しい関数を追加するときは、以下のテンプレートをガイドとして使用できます：

```markdown
# newFunctionName

関数の短い説明がここに入ります。関数が何をするのか、典型的な使用ケースを簡潔に説明してください。

**構文**

\```sql
newFunctionName(arg1, arg2[, arg3])
\```

**引数**

- `arg1` — 引数の説明。 [データ型](../data-types/float.md)
- `arg2` — 引数の説明。 [データ型](../data-types/float.md)
- `arg3` — オプションの引数の説明（オプション）。 [データ型](../data-types/float.md)

**実装の詳細**

関連があれば、実装の詳細についての説明。

**戻り値**

- {関数が返すものを挿入}を返します。 [データ型](../data-types/float.md)

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
## テストデータの使用 {#using-test-data}

ClickHouseを開発する際は、現実的なデータセットをロードすることが必要です。
これは特にパフォーマンステストにおいて重要です。
ウェブ解析の匿名化データセットが特別に準備されており、追加で約3GBの空きディスクスペースが必要です。

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
