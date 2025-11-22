---
description: 'ClickHouse 開発のための前提条件とセットアップ手順'
sidebar_label: '前提条件'
sidebar_position: 5
slug: /development/developer-instruction
title: '開発者向け前提条件'
doc_type: 'guide'
---



# 前提条件

ClickHouse は Linux、FreeBSD、macOS 上でビルドできます。
Windows を使用している場合でも、Ubuntu を実行する [VirtualBox](https://www.virtualbox.org/) などの Linux 仮想マシン内で ClickHouse をビルドできます。



## GitHubでリポジトリを作成する {#create-a-repository-on-github}

ClickHouseの開発を始めるには、[GitHub](https://www.github.com/)アカウントが必要です。
また、ローカルでSSHキーを生成し(まだお持ちでない場合)、公開鍵をGitHubにアップロードしてください。これはパッチを投稿するための前提条件です。

次に、右上隅の「fork」ボタンをクリックして、個人アカウントで[ClickHouseリポジトリ](https://github.com/ClickHouse/ClickHouse/)をフォークします。

変更を投稿するには、例えば問題の修正や機能の追加などの場合、まずフォーク内のブランチに変更をコミットし、その後メインリポジトリに対して変更内容を含む「Pull Request」を作成します。

Gitリポジトリを操作するには、Gitをインストールしてください。例えば、Ubuntuでは次のコマンドを実行します:

```sh
sudo apt update
sudo apt install git
```

Gitのチートシートは[こちら](https://education.github.com/git-cheat-sheet-education.pdf)で確認できます。
詳細なGitマニュアルは[こちら](https://git-scm.com/book/en/v2)にあります。


## 開発マシンへのリポジトリのクローン {#clone-the-repository-to-your-development-machine}

まず、ソースファイルを作業マシンにダウンロードします。つまり、リポジトリをクローンします:

```sh
git clone git@github.com:your_github_username/ClickHouse.git  # プレースホルダーをGitHubユーザー名に置き換えてください
cd ClickHouse
```

このコマンドは、ソースコード、テスト、その他のファイルを含む`ClickHouse/`ディレクトリを作成します。
URLの後にチェックアウト用のカスタムディレクトリを指定できますが、このパスに空白文字を含めないことが重要です。空白文字が含まれていると、後でビルドが失敗する可能性があります。

ClickHouseのGitリポジトリは、サードパーティライブラリを取り込むためにサブモジュールを使用しています。
サブモジュールはデフォルトではチェックアウトされません。
次のいずれかの方法を選択できます:

- `git clone`を`--recurse-submodules`オプション付きで実行する

- `git clone`を`--recurse-submodules`なしで実行した場合は、`git submodule update --init --jobs <N>`を実行してすべてのサブモジュールを明示的にチェックアウトします。(`<N>`は、例えば`12`に設定してダウンロードを並列化できます。)

- `git clone`を`--recurse-submodules`なしで実行し、[sparse](https://github.blog/2020-01-17-bring-your-monorepo-down-to-size-with-sparse-checkout/)および[shallow](https://github.blog/2020-12-21-get-up-to-speed-with-partial-clone-and-shallow-clone/)サブモジュールチェックアウトを使用して、サブモジュール内の不要なファイルと履歴を省略し、容量を節約したい場合(約15 GBではなく約5 GB)は、`./contrib/update-submodules.sh`を実行します。この方法はCIで使用されていますが、サブモジュールの操作が不便で遅くなるため、ローカル開発には推奨されません。

Gitサブモジュールのステータスを確認するには、`git submodule status`を実行します。

次のエラーメッセージが表示された場合:

```bash
Permission denied (publickey).
fatal: Could not read from remote repository.

Please make sure you have the correct access rights
and the repository exists.
```

GitHubに接続するためのSSHキーが見つかりません。
これらのキーは通常`~/.ssh`に配置されています。
SSHキーを使用するには、GitHubの設定でアップロードする必要があります。

HTTPSを使用してリポジトリをクローンすることもできます:

```sh
git clone https://github.com/ClickHouse/ClickHouse.git
```

ただし、この方法では変更をサーバーに送信できません。
一時的に使用し、後で`git remote`コマンドを使用してリポジトリのリモートアドレスを置き換えてSSHキーを追加することができます。

元のClickHouseリポジトリのアドレスをローカルリポジトリに追加して、そこから更新を取得することもできます:

```sh
git remote add upstream git@github.com:ClickHouse/ClickHouse.git
```

このコマンドを正常に実行すると、`git pull upstream master`を実行してメインのClickHouseリポジトリから更新を取得できるようになります。

:::tip
`git push`をそのまま使用しないでください。誤ったリモートや誤ったブランチにプッシュしてしまう可能性があります。
リモートとブランチ名を明示的に指定する方が良いでしょう。例:`git push origin my_branch_name`
:::


## コードの記述 {#writing-code}

以下は、ClickHouseのコードを記述する際に役立つリンク集です:

- [ClickHouseアーキテクチャ](/development/architecture/)
- [コードスタイルガイド](/development/style/)
- [サードパーティライブラリ](/development/contrib#adding-and-maintaining-third-party-libraries)
- [テストの記述](/development/tests/)
- [未解決の課題](https://github.com/ClickHouse/ClickHouse/issues?q=is%3Aopen+is%3Aissue+label%3A%22easy+task%22)

### IDE {#ide}

[Visual Studio Code](https://code.visualstudio.com/)と[Neovim](https://neovim.io/)は、ClickHouseの開発において実績のある2つの選択肢です。VS Codeを使用する場合は、IntelliSenseの代わりに[clangd拡張機能](https://marketplace.visualstudio.com/items?itemName=llvm-vs-code-extensions.vscode-clangd)を使用することを推奨します。パフォーマンスが大幅に向上します。

[CLion](https://www.jetbrains.com/clion/)も優れた選択肢です。ただし、ClickHouseのような大規模プロジェクトでは動作が遅くなる可能性があります。CLionを使用する際の留意点:

- CLionは独自に`build`パスを作成し、ビルドタイプとして自動的に`debug`を選択します
- ユーザーがインストールしたCMakeではなく、CLionで定義されたバージョンのCMakeを使用します
- CLionはビルドタスクの実行に`ninja`ではなく`make`を使用します(これは通常の動作です)

その他に使用できるIDEとしては、[Sublime Text](https://www.sublimetext.com/)、[Qt Creator](https://www.qt.io/product/development-tools)、[Kate](https://kate-editor.org/)があります。


## プルリクエストの作成 {#create-a-pull-request}

GitHubのUIでフォークしたリポジトリに移動します。
ブランチで開発を行っている場合は、そのブランチを選択する必要があります。
画面上に「Pull request」ボタンが表示されます。
これは本質的に「自分の変更をメインリポジトリに受け入れてもらうためのリクエストを作成する」ことを意味します。

プルリクエストは作業が完了していない段階でも作成できます。
この場合、タイトルの先頭に「WIP」(work in progress)という語を付けてください。これは後で変更できます。
これは変更内容の共同レビューや議論、および利用可能なすべてのテストの実行に役立ちます。
変更内容の簡潔な説明を提供することが重要です。これは後でリリースチェンジログの生成に使用されます。

ClickHouseの従業員がプルリクエストに「can be tested」タグを付けると、テストが開始されます。
最初のチェック(コードスタイルなど)の結果は数分以内に表示されます。
ビルドチェックの結果は30分以内に表示されます。
メインのテストセットの結果は1時間以内に報告されます。

システムはプルリクエストごとに個別にClickHouseバイナリビルドを準備します。
これらのビルドを取得するには、チェックリストの「Builds」エントリの横にある「Details」リンクをクリックします。
そこには、ビルドされたClickHouseの.debパッケージへの直接リンクがあり、本番サーバーにもデプロイできます(恐れがなければ)。


## ドキュメントの作成 {#write-documentation}

新機能を追加するプルリクエストには、必ず適切なドキュメントを含める必要があります。
ドキュメントの変更をプレビューしたい場合は、ローカルでドキュメントページをビルドする手順が[こちら](https://github.com/ClickHouse/clickhouse-docs)のREADME.mdファイルに記載されています。
ClickHouseに新しい関数を追加する際は、以下のテンプレートをガイドとして使用してください:


````markdown
# newFunctionName

関数の簡単な説明をここに記載します。この関数が何を行うか、および典型的な使用例を簡潔に説明してください。

**構文**

\```sql
newFunctionName(arg1, arg2[, arg3])
\```

**引数**

- `arg1` — 引数の説明。[DataType](../data-types/float.md)
- `arg2` — 引数の説明。[DataType](../data-types/float.md)
- `arg3` — オプション引数の説明(省略可能)。[DataType](../data-types/float.md)

**実装の詳細**

関連する場合は、実装の詳細についての説明を記載します。

**戻り値**

- {関数が返す内容をここに挿入}を返します。[DataType](../data-types/float.md)

**例**

クエリ:

\```sql
SELECT 'ここにサンプルクエリを記述してください';
\```

結果:

\```response
┌───────────────────────────────────┐
│ クエリの結果                      │
└───────────────────────────────────┘
\```
````


## テストデータの使用 {#using-test-data}

ClickHouseの開発では、現実的なデータセットを読み込む必要がしばしば生じます。
これはパフォーマンステストにおいて特に重要です。
ウェブ解析の匿名化データセットを特別に用意しています。
追加で約3GBの空きディスク容量が必要です。

```sh
    sudo apt install wget xz-utils

    wget https://datasets.clickhouse.com/hits/tsv/hits_v1.tsv.xz
    wget https://datasets.clickhouse.com/visits/tsv/visits_v1.tsv.xz

    xz -v -d hits_v1.tsv.xz
    xz -v -d visits_v1.tsv.xz

    clickhouse-client
```

clickhouse-client内で:

```sql
CREATE DATABASE IF NOT EXISTS test;

```


CREATE TABLE test.hits ( WatchID UInt64,  JavaEnable UInt8,  Title String,  GoodEvent Int16,  EventTime DateTime,  EventDate Date,  CounterID UInt32,  ClientIP UInt32,  ClientIP6 FixedString(16),  RegionID UInt32,  UserID UInt64,  CounterClass Int8,  OS UInt8,  UserAgent UInt8,  URL String,  Referer String,  URLDomain String,  RefererDomain String,  Refresh UInt8,  IsRobot UInt8,  RefererCategories Array(UInt16),  URLCategories Array(UInt16),  URLRegions Array(UInt32),  RefererRegions Array(UInt32),  ResolutionWidth UInt16,  ResolutionHeight UInt16,  ResolutionDepth UInt8,  FlashMajor UInt8,  FlashMinor UInt8,  FlashMinor2 String,  NetMajor UInt8,  NetMinor UInt8,  UserAgentMajor UInt16,  UserAgentMinor FixedString(2),  CookieEnable UInt8,  JavascriptEnable UInt8,  IsMobile UInt8,  MobilePhone UInt8,  MobilePhoneModel String,  Params String,  IPNetworkID UInt32,  TraficSourceID Int8,  SearchEngineID UInt16,  SearchPhrase String,  AdvEngineID UInt8,  IsArtifical UInt8,  WindowClientWidth UInt16,  WindowClientHeight UInt16,  ClientTimeZone Int16,  ClientEventTime DateTime,  SilverlightVersion1 UInt8,  SilverlightVersion2 UInt8,  SilverlightVersion3 UInt32,  SilverlightVersion4 UInt16,  PageCharset String,  CodeVersion UInt32,  IsLink UInt8,  IsDownload UInt8,  IsNotBounce UInt8,  FUniqID UInt64,  HID UInt32,  IsOldCounter UInt8,  IsEvent UInt8,  IsParameter UInt8,  DontCountHits UInt8,  WithHash UInt8,  HitColor FixedString(1),  UTCEventTime DateTime,  Age UInt8,  Sex UInt8,  Income UInt8,  Interests UInt16,  Robotness UInt8,  GeneralInterests Array(UInt16),  RemoteIP UInt32,  RemoteIP6 FixedString(16),  WindowName Int32,  OpenerName Int32,  HistoryLength Int16,  BrowserLanguage FixedString(2),  BrowserCountry FixedString(2),  SocialNetwork String,  SocialAction String,  HTTPError UInt16,  SendTiming Int32,  DNSTiming Int32,  ConnectTiming Int32,  ResponseStartTiming Int32,  ResponseEndTiming Int32,  FetchTiming Int32,  RedirectTiming Int32,  DOMInteractiveTiming Int32,  DOMContentLoadedTiming Int32,  DOMCompleteTiming Int32,  LoadEventStartTiming Int32,  LoadEventEndTiming Int32,  NSToDOMContentLoadedTiming Int32,  FirstPaintTiming Int32,  RedirectCount Int8,  SocialSourceNetworkID UInt8,  SocialSourcePage String,  ParamPrice Int64,  ParamOrderID String,  ParamCurrency FixedString(3),  ParamCurrencyID UInt16,  GoalsReached Array(UInt32),  OpenstatServiceName String,  OpenstatCampaignID String,  OpenstatAdID String,  OpenstatSourceID String,  UTMSource String,  UTMMedium String,  UTMCampaign String,  UTMContent String,  UTMTerm String,  FromTag String,  HasGCLID UInt8,  RefererHash UInt64,  URLHash UInt64,  CLID UInt32,  YCLID UInt64,  ShareService String,  ShareURL String,  ShareTitle String,  `ParsedParams.Key1` Array(String),  `ParsedParams.Key2` Array(String),  `ParsedParams.Key3` Array(String),  `ParsedParams.Key4` Array(String),  `ParsedParams.Key5` Array(String),  `ParsedParams.ValueDouble` Array(Float64),  IslandID FixedString(16),  RequestNum UInt32,  RequestTry UInt8) ENGINE = MergeTree PARTITION BY toYYYYMM(EventDate) SAMPLE BY intHash32(UserID) ORDER BY (CounterID, EventDate, intHash32(UserID), EventTime);



CREATE TABLE test.visits ( CounterID UInt32, StartDate Date, Sign Int8, IsNew UInt8, VisitID UInt64, UserID UInt64, StartTime DateTime, Duration UInt32, UTCStartTime DateTime, PageViews Int32, Hits Int32, IsBounce UInt8, Referer String, StartURL String, RefererDomain String, StartURLDomain String, EndURL String, LinkURL String, IsDownload UInt8, TraficSourceID Int8, SearchEngineID UInt16, SearchPhrase String, AdvEngineID UInt8, PlaceID Int32, RefererCategories Array(UInt16), URLCategories Array(UInt16), URLRegions Array(UInt32), RefererRegions Array(UInt32), IsYandex UInt8, GoalReachesDepth Int32, GoalReachesURL Int32, GoalReachesAny Int32, SocialSourceNetworkID UInt8, SocialSourcePage String, MobilePhoneModel String, ClientEventTime DateTime, RegionID UInt32, ClientIP UInt32, ClientIP6 FixedString(16), RemoteIP UInt32, RemoteIP6 FixedString(16), IPNetworkID UInt32, SilverlightVersion3 UInt32, CodeVersion UInt32, ResolutionWidth UInt16, ResolutionHeight UInt16, UserAgentMajor UInt16, UserAgentMinor UInt16, WindowClientWidth UInt16, WindowClientHeight UInt16, SilverlightVersion2 UInt8, SilverlightVersion4 UInt16, FlashVersion3 UInt16, FlashVersion4 UInt16, ClientTimeZone Int16, OS UInt8, UserAgent UInt8, ResolutionDepth UInt8, FlashMajor UInt8, FlashMinor UInt8, NetMajor UInt8, NetMinor UInt8, MobilePhone UInt8, SilverlightVersion1 UInt8, Age UInt8, Sex UInt8, Income UInt8, JavaEnable UInt8, CookieEnable UInt8, JavascriptEnable UInt8, IsMobile UInt8, BrowserLanguage UInt16, BrowserCountry UInt16, Interests UInt16, Robotness UInt8, GeneralInterests Array(UInt16), Params Array(String), `Goals.ID` Array(UInt32), `Goals.Serial` Array(UInt32), `Goals.EventTime` Array(DateTime), `Goals.Price` Array(Int64), `Goals.OrderID` Array(String), `Goals.CurrencyID` Array(UInt32), WatchIDs Array(UInt64), ParamSumPrice Int64, ParamCurrency FixedString(3), ParamCurrencyID UInt16, ClickLogID UInt64, ClickEventID Int32, ClickGoodEvent Int32, ClickEventTime DateTime, ClickPriorityID Int32, ClickPhraseID Int32, ClickPageID Int32, ClickPlaceID Int32, ClickTypeID Int32, ClickResourceID Int32, ClickCost UInt32, ClickClientIP UInt32, ClickDomainID UInt32, ClickURL String, ClickAttempt UInt8, ClickOrderID UInt32, ClickBannerID UInt32, ClickMarketCategoryID UInt32, ClickMarketPP UInt32, ClickMarketCategoryName String, ClickMarketPPName String, ClickAWAPSCampaignName String, ClickPageName String, ClickTargetType UInt16, ClickTargetPhraseID UInt64, ClickContextType UInt8, ClickSelectType Int8, ClickOptions String, ClickGroupBannerID Int32, OpenstatServiceName String, OpenstatCampaignID String, OpenstatAdID String, OpenstatSourceID String, UTMSource String, UTMMedium String, UTMCampaign String, UTMContent String, UTMTerm String, FromTag String, HasGCLID UInt8, FirstVisit DateTime, PredLastVisit Date, LastVisit Date, TotalVisits UInt32, `TraficSource.ID` Array(Int8), `TraficSource.SearchEngineID` Array(UInt16), `TraficSource.AdvEngineID` Array(UInt8), `TraficSource.PlaceID` Array(UInt16), `TraficSource.SocialSourceNetworkID` Array(UInt8), `TraficSource.Domain` Array(String), `TraficSource.SearchPhrase` Array(String), `TraficSource.SocialSourcePage` Array(String), Attendance FixedString(16), CLID UInt32, YCLID UInt64, NormalizedRefererHash UInt64, SearchPhraseHash UInt64, RefererDomainHash UInt64, NormalizedStartURLHash UInt64, StartURLDomainHash UInt64, NormalizedEndURLHash UInt64, TopLevelDomain UInt64, URLScheme UInt64, OpenstatServiceNameHash UInt64, OpenstatCampaignIDHash UInt64, OpenstatAdIDHash UInt64, OpenstatSourceIDHash UInt64, UTMSourceHash UInt64, UTMMediumHash UInt64, UTMCampaignHash UInt64, UTMContentHash UInt64, UTMTermHash UInt64, FromHash UInt64, WebVisorEnabled UInt8, WebVisorActivity UInt32, `ParsedParams.Key1` Array(String), `ParsedParams.Key2` Array(String), `ParsedParams.Key3` Array(String), `ParsedParams.Key4` Array(String), `ParsedParams.Key5` Array(String), `ParsedParams.ValueDouble` Array(Float64), `Market.Type` Array(UInt8), `Market.GoalID` Array(UInt32), `Market.OrderID` Array(String), `Market.OrderPrice` Array(Int64), `Market.PP` Array(UInt32), `Market.DirectPlaceID` Array(UInt32), `Market.DirectOrderID` Array(UInt32), `Market.DirectBannerID` Array(UInt32), `Market.GoodID` Array(String), `Market.GoodName` Array(String), `Market.GoodQuantity` Array(Int32), `Market.GoodPrice` Array(Int64), IslandID FixedString(16)) ENGINE = CollapsingMergeTree(Sign) PARTITION BY toYYYYMM(StartDate) SAMPLE BY intHash32(UserID) ORDER BY (CounterID, StartDate, intHash32(UserID), VisitID);

````

データをインポートします:

```bash
clickhouse-client --max_insert_block_size 100000 --query "INSERT INTO test.hits FORMAT TSV" < hits_v1.tsv
clickhouse-client --max_insert_block_size 100000 --query "INSERT INTO test.visits FORMAT TSV" < visits_v1.tsv
````
