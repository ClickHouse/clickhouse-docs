---
'description': 'ClickHouse 開発の前提条件とセットアップ手順'
'sidebar_label': '事前条件'
'sidebar_position': 5
'slug': '/development/developer-instruction'
'title': '開発者の事前条件'
---





# 前提条件

ClickHouseは、Linux、FreeBSD、macOS上でビルドできます。
Windowsを使用している場合でも、Linuxを実行している仮想マシン（例：Ubuntuがインストールされた [VirtualBox](https://www.virtualbox.org/)）でClickHouseをビルドできます。

## GitHubにリポジトリを作成する {#create-a-repository-on-github}

ClickHouseの開発を開始するには、[GitHub](https://www.github.com/)アカウントが必要です。
SSHキーをローカルで生成し（すでに存在しない場合）、パッチの寄稿において前提条件となるため、その公開キーをGitHubにアップロードしてください。

次に、画面の右上隅にある「fork」ボタンをクリックして、個人アカウントに[ClickHouseリポジトリ](https://github.com/ClickHouse/ClickHouse/)をフォークします。

変更を寄稿するには、まずフォークしたリポジトリのブランチに変更をコミットし、その後、メインリポジトリに対して変更を含む「Pull Request」を作成します。

Gitリポジトリで作業するためには、Gitをインストールしてください。例えば、Ubuntuでは、次のコマンドを実行します：

```sh
sudo apt update
sudo apt install git
```

Gitのチートシートは[ここ](https://education.github.com/git-cheat-sheet-education.pdf)にあります。
詳細なGitマニュアルは[こちら](https://git-scm.com/book/en/v2)です。

## リポジトリを開発用マシンにクローンする {#clone-the-repository-to-your-development-machine}

まず、作業マシンにソースファイルをダウンロードします。つまり、リポジトリをクローンします：

```sh
git clone git@github.com:your_github_username/ClickHouse.git  # プレースホルダーをあなたのGitHubユーザー名に置き換えてください
cd ClickHouse
```

このコマンドは、ソースコード、テスト、およびその他のファイルを含む `ClickHouse/` ディレクトリを作成します。
URLの後にカスタムディレクトリを指定できますが、このパスにはホワイトスペースが含まれないことが重要です。これは、後でビルドが壊れる可能性があるためです。

ClickHouseのGitリポジトリは、サブモジュールを使用してサードパーティライブラリをプルします。
サブモジュールはデフォルトではチェックアウトされません。次のいずれかを実行できます：

- `--recurse-submodules` オプションを付けて `git clone` を実行する。

- `--recurse-submodules`なしで `git clone` を実行した場合、すべてのサブモジュールを明示的にチェックアウトするために `git submodule update --init --jobs <N>` を実行します。 (`<N>`は、たとえば `12` に設定してダウンロードを並列化できます。）

- `--recurse-submodules`なしで `git clone` が実行された場合、不要なファイルと履歴を省略してスペースを節約するために [スパース](https://github.blog/2020-01-17-bring-your-monorepo-down-to-size-with-sparse-checkout/) および [浅い](https://github.blog/2020-12-21-get-up-to-speed-with-partial-clone-and-shallow-clone/) サブモジュールのチェックアウトを使用するために `./contrib/update-submodules.sh` を実行します。この選択肢はCIによって使用されますが、サブモジュールとの作業を不便にし、遅くするため、ローカル開発には推奨されません。

Gitサブモジュールの状態を確認するには、`git submodule status`を実行します。

次のエラーメッセージが表示される場合：

```bash
Permission denied (publickey).
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

GitHubに接続するためのSSHキーが不足しています。
これらのキーは通常、`~/.ssh`にあります。
SSHキーが受け入れられるためには、それらをGitHubの設定にアップロードする必要があります。

HTTPS経由でリポジトリをクローンすることも可能です：

```sh
git clone https://github.com/ClickHouse/ClickHouse.git
```

ただし、これにより変更をサーバーに送信することはできません。
一時的に使用することはできますが、後でSSHキーを追加し、`git remote`コマンドでリポジトリのリモートアドレスを置き換える必要があります。

ローカルリポジトリに元のClickHouseリポジトリのアドレスを追加して、そこから更新をプルすることもできます：

```sh
git remote add upstream git@github.com:ClickHouse/ClickHouse.git
```

このコマンドを正常に実行すると、`git pull upstream master` を実行してメインのClickHouseリポジトリから更新をプルできるようになります。

:::tip
必ず `git push` をそのまま使用しないでください。間違ったリモートや間違ったブランチにプッシュしてしまう可能性があります。
リモート名とブランチ名を明示的に指定することをお勧めします。例えば、`git push origin my_branch_name`のようにしてください。
:::

## コードを書く {#writing-code}

以下は、ClickHouseのコードを書く際に便利なクイックリンク集です：

- [ClickHouseアーキテクチャ](/development/architecture/).
- [コードスタイルガイド](/development/style/).
- [サードパーティライブラリ](/development/contrib#adding-and-maintaining-third-party-libraries)
- [テストの作成](/development/tests/)
- [オープンな問題](https://github.com/ClickHouse/ClickHouse/issues?q=is%3Aopen+is%3Aissue+label%3A%22easy+task%22)

### IDE {#ide}

[Visual Studio Code](https://code.visualstudio.com/) と [Neovim](https://neovim.io/) は、ClickHouseの開発において過去にうまく機能してきた2つの選択肢です。VS Codeを使用している場合は、[clangd拡張](https://marketplace.visualstudio.com/items?itemName=llvm-vs-code-extensions.vscode-clangd)を使用してIntelliSenseを置き換えることをお勧めします。こちらの方がパフォーマンスが優れています。

[CLion](https://www.jetbrains.com/clion/) はもう一つの素晴らしい選択肢です。ただし、ClickHouseのような大規模プロジェクトでは遅くなることがあります。CLionを使用する際の注意点は次のとおりです：

- CLionは独自に`build`パスを作成し、ビルドタイプとして`debug`を自動的に選択します。
- CLionで定義されたCMakeのバージョンを使用し、あなたがインストールしたものは使用しません。
- CLionは`ninja`ではなく`make`を使用してビルドタスクを実行します（これは通常の動作です）。

他にも使用できるIDEには、[Sublime Text](https://www.sublimetext.com/)、[Qt Creator](https://www.qt.io/product/development-tools)、または[Kate](https://kate-editor.org/)があります。

## プルリクエストを作成する {#create-a-pull-request}

GitHubのUIでフォークしたリポジトリに移動します。
ブランチで開発している場合は、そのブランチを選択する必要があります。
画面に「Pull request」ボタンがあります。
本質的には、これは「私の変更をメインリポジトリに受け入れるリクエストを作成する」という意味です。

作業が完了していない場合でもプルリクエストを作成できます。
この場合、タイトルの冒頭に「WIP」（作業中）と記載してください。後で変更可能です。
これは、協力的なレビューおよび変更の議論、およびすべての利用可能なテストを実行するために便利です。
変更内容の簡潔な説明を提供することが重要です。これは後でリリースの変更履歴を生成する際に使用されます。

ClickHouseの社員があなたのPRに「テスト可能」タグを付けると、テストが開始されます。
最初のチェック（例えば、コードスタイル）の結果は数分以内に届きます。
ビルドチェックの結果は30分以内に届きます。
主要なテストセットの結果は1時間以内に報告されます。

システムは、あなたのプルリクエスト専用のClickHouseバイナリビルドを準備します。
これらのビルドを取得するには、チェックリストの「Builds」エントリの横にある「Details」リンクをクリックします。
そこには、デプロイ可能なClickHouseの.build .debパッケージへの直接リンクがあります（恐れがなければ本番サーバーでも展開できます）。

## ドキュメントを書く {#write-documentation}

新しい機能を追加するプルリクエストには、適切なドキュメントが付随する必要があります。
ドキュメントの変更をプレビューしたい場合の、ローカルでドキュメントページをビルドする手順は、README.mdファイルの[こちら](https://github.com/ClickHouse/clickhouse-docs)に記載されています。
ClickHouseに新しい関数を追加する際には、以下のテンプレートをガイドとして使用できます：

```markdown

# newFunctionName

関数の短い説明がここに入ります。これは、関数が何をするかや典型的な使用例を簡潔に説明するべきです。

**構文**

\```sql
newFunctionName(arg1, arg2[, arg3])
\```

**引数**

- `arg1` — 引数の説明。 [データ型](../data-types/float.md)
- `arg2` — 引数の説明。 [データ型](../data-types/float.md)
- `arg3` — オプション引数の説明（オプション）。 [データ型](../data-types/float.md)

**実装の詳細**

関連がある場合は、実装の詳細の説明。

**返される値**

- {関数が返すものをここに挿入します}を返します。 [データ型](../data-types/float.md)

**例**

クエリ：

\```sql
SELECT 'write your example query here';
\```

応答：

\```response
┌───────────────────────────────────┐
│ クエリの結果                   │
└───────────────────────────────────┘
\```
```

## テストデータの使用 {#using-test-data}

ClickHouseの開発には、実際のデータセットをロードすることがしばしば必要です。
特に、パフォーマンステストには重要です。
ウェブ分析用の特別に準備された匿名データセットがあります。
このデータセットは、さらに約3GBの空きディスクスペースが必要です。

```sh
    sudo apt install wget xz-utils

    wget https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz
    wget https://datasets.clickhouse.com/visits/tsv/visits_v1.tsv.xz

    xz -v -d hits_v1.tsv.xz
    xz -v -d visits_v1.tsv.xz

    clickhouse-client
```

clickhouse-clientで：

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
