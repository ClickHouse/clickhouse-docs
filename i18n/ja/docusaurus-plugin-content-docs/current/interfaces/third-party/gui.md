---
slug: /interfaces/third-party/gui
sidebar_position: 28
sidebar_label: ビジュアルインターフェース
---

# サードパーティ開発者によるビジュアルインターフェース

## オープンソース {#open-source}

### ch-ui {#ch-ui}

[ch-ui](https://github.com/caioricciuti/ch-ui) は、ClickHouseデータベース用に設計されたシンプルなReact.jsアプリインターフェースで、クエリの実行とデータの視覚化を目的としています。ReactとWeb用のClickHouseクライアントを使用して構築されており、使いやすいUIが提供され、データベースとのインタラクションが簡単に行えます。

特徴:

- ClickHouse統合: 接続を簡単に管理し、クエリを実行できます。
- レスポンシブタブ管理: クエリタブやテーブルタブなど、複数のタブを動的に処理します。
- パフォーマンス最適化: 効率的なキャッシングとステート管理のためにIndexed DBを利用しています。
- ローカルデータストレージ: すべてのデータはブラウザ内にローカルに保存され、他の場所にデータが送信されることはありません。

### ChartDB {#chartdb}

[ChartDB](https://chartdb.io) は、ClickHouseを含むデータベーススキーマの視覚化と設計のための無料でオープンソースのツールです。Reactで構築されており、シームレスで使いやすい体験を提供し、データベースの認証情報やサインアップなしで始められます。

特徴:

- スキーマ視覚化: ClickHouseスキーマを即座にインポートし、ER図やマテリアライズドビュー、標準ビューを含む視覚化が可能で、テーブルへの参照を表示します。
- AI-powered DDLエクスポート: スキーマ管理とドキュメント作成が向上するDDLスクリプトを簡単に生成します。
- マルチSQLダイアレクトサポート: 様々なデータベース環境に適した多様なSQLダイアレクトに対応しています。
- サインアップや認証情報なし: すべての機能はブラウザ内で直接アクセス可能で、摩擦のない安全で簡単な利用ができます。

[ChartDBソースコード](https://github.com/chartdb/chartdb)。

### Tabix {#tabix}

[Tabix](https://github.com/tabixio/tabix)プロジェクトのClickHouse用のWebインターフェース。

特徴:

- 追加のソフトウェアをインストールすることなく、ブラウザから直接ClickHouseと連携します。
- 構文ハイライト付きのクエリエディタ。
- コマンドの自動補完。
- クエリ実行のためのグラフィカル分析ツール。
- カラースキームオプション。

[Tabixドキュメント](https://tabix.io/doc/)。

### HouseOps {#houseops}

[HouseOps](https://github.com/HouseOps/HouseOps)は、OSX、Linux、Windows向けのUI/IDEです。

特徴:

- 構文ハイライト付きのクエリビルダー。応答をテーブルビューまたはJSONビューで表示。
- クエリ結果のCSVまたはJSONへのエクスポート。
- 説明付きのプロセスリスト。書き込みモード。プロセスを停止する能力（`KILL`）。
- データベースグラフ。全てのテーブルとそのカラムの追加情報を表示。
- カラムサイズのクイックビュー。
- サーバー設定。

以下の機能が開発予定です:

- データベース管理。
- ユーザー管理。
- リアルタイムデータ分析。
- クラスタ監視。
- クラスタ管理。
- レプリケート及びKafkaテーブルの監視。

### LightHouse {#lighthouse}

[LightHouse](https://github.com/VKCOM/lighthouse)は、ClickHouse用の軽量Webインターフェースです。

特徴:

- フィルタリングとメタデータを伴うテーブルリスト。
- フィルタリングとソーティング付きのテーブルプレビュー。
- 読み取り専用のクエリ実行。

### Redash {#redash}

[Redash](https://github.com/getredash/redash)は、データ視覚化のためのプラットフォームです。

ClickHouseを含む複数のデータソースをサポートし、異なるデータソースからのクエリ結果を1つの最終データセットに結合できます。

特徴:

- 強力なクエリエディタ。
- データベースエクスプローラー。
- データを様々な形で表現するための視覚化ツール。

### Grafana {#grafana}

[Grafana](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/)は、監視と視覚化のためのプラットフォームです。

「Grafanaは、どこに保存されていても、メトリクスをクエリし、視覚化し、アラートを発し、理解することを可能にします。ダッシュボードを作成、探査、共有し、データ駆動型文化を育成します。コミュニティに信頼され、愛されています」 &mdash; grafana.com。

ClickHouseデータソースプラグインは、ClickHouseをバックエンドデータベースとしてサポートします。

### qryn {#qryn}

[qryn](https://metrico.in)は、ClickHouse用のポリグロット高性能可観測スタックで、ネイティブGrafana統合を持ち、ユーザーはLoki/LogQL、Prometheus/PromQL、OTLP/Tempo、Elastic、InfluxDBなどをサポートする任意のエージェントからログ、メトリクス、テレメトリトレースを取り込んで分析できます。

特徴:

- データをクエリ、抽出、視覚化するための組み込みExplore UIとLogQL CLI。
- プラグインなしでクエリ、処理、取り込み、トレース、アラートを行うためのネイティブGrafana APIサポート。
- ログ、イベント、トレースなどからデータを動的に検索、フィルタ、抽出するための強力なパイプライン。
- LogQL、PromQL、InfluxDB、Elasticなどに透明に互換性のある取り込みとPUSH API。
- Promtail、Grafana-Agent、Vector、Logstash、Telegrafなどのエージェントで即使用可能。

### DBeaver {#dbeaver}

[DBeaver](https://dbeaver.io/)は、ClickHouseをサポートするユニバーサルデスクトップデータベースクライアントです。

特徴:

- 構文ハイライトと自動補完を伴うクエリ開発。
- フィルタとメタデータ検索付きのテーブルリスト。
- テーブルデータプレビュー。
- フルテキスト検索。

デフォルトでは、DBeaverはセッションを使用して接続しません（CLIはその例です）。セッションサポートが必要な場合（例えば、セッションの設定を行うためなど）は、ドライバ接続プロパティを編集し、`session_id`をランダムな文字列に設定します（内部でHTTP接続が使用されます）。その後、クエリウィンドウから任意の設定を使用できます。

### clickhouse-cli {#clickhouse-cli}

[clickhouse-cli](https://github.com/hatarist/clickhouse-cli)は、Python 3で書かれたClickHouse用の代替コマンドラインクライアントです。

特徴:

- 自動補完。
- クエリとデータ出力のための構文ハイライト。
- データ出力のためのページャサポート。
- PostgreSQLのようなカスタムコマンド。

### clickhouse-flamegraph {#clickhouse-flamegraph}

[clickhouse-flamegraph](https://github.com/Slach/clickhouse-flamegraph)は、`system.trace_log`を[フレームグラフ](http://www.brendangregg.com/flamegraphs.html)として視覚化するための専門ツールです。

### clickhouse-plantuml {#clickhouse-plantuml}

[cickhouse-plantuml](https://pypi.org/project/clickhouse-plantuml/)は、テーブルのスキームの[PlantUML](https://plantuml.com/)図を生成するためのスクリプトです。

### xeus-clickhouse {#xeus-clickhouse}

[xeus-clickhouse](https://github.com/wangfenjin/xeus-clickhouse)は、JupyterのためのClickHouse用カーネルで、Jupyter内でSQLを使用してCHデータをクエリできます。

### MindsDB Studio {#mindsdb}

[MindsDB](https://mindsdb.com/)は、ClickHouseを含むデータベース用のオープンソースのAIレイヤーで、最先端の機械学習モデルを簡単に開発、トレーニング、デプロイできます。MindsDB Studio（GUI）では、データベースから新しいモデルをトレーニングし、モデルによる予測を解釈し、潜在的なデータバイアスを特定し、Explainable AI機能を使用してモデルの精度を評価・視覚化することで、機械学習モデルを迅速に適応・チューニングできます。

### DBM {#dbm}

[DBM](https://github.com/devlive-community/dbm) は、ClickHouse用のビジュアル管理ツールです！

特徴:

- クエリ履歴のサポート（ページング、すべてクリアなど）。
- 選択したSQL句クエリのサポート。
- クエリの停止サポート。
- テーブル管理のサポート（メタデータ、削除、プレビュー）。
- データベース管理のサポート（削除、作成）。
- カスタムクエリのサポート。
- 複数データソースの管理サポート（接続テスト、監視）。
- 監視サポート（プロセッサー、接続、クエリ）。
- データの移行サポート。

### Bytebase {#bytebase}

[Bytebase](https://bytebase.com)は、チーム向けのWebベースのオープンソーススキーマ変更およびバージョン管理ツールです。ClickHouseを含むさまざまなデータベースをサポートしています。

特徴:

- 開発者とDBA間のスキーマレビュー。
- Database-as-Code、スキーマをGitLabなどのVCSでバージョン管理し、コードコミットに基づいてデプロイをトリガー。
- 環境ごとのポリシーに基づいたスムーズなデプロイ。
- 完全な移行履歴。
- スキーマのずれ検出。
- バックアップと復元。
- RBAC。

### Zeppelin-Interpreter-for-ClickHouse {#zeppelin-interpreter-for-clickhouse}

[Zeppelin-Interpreter-for-ClickHouse](https://github.com/SiderZhang/Zeppelin-Interpreter-for-ClickHouse)は、ClickHouse用の[Zeppelin](https://zeppelin.apache.org)インタープリターです。JDBCインタープリターと比較して、長時間実行されるクエリのためのより良いタイムアウト制御を提供します。

### ClickCat {#clickcat}

[ClickCat](https://github.com/clickcat-project/ClickCat)は、ClickHouseデータを検索、探索、視覚化するためのユーザーフレンドリーなインターフェースです。

特徴:

- SQLコードをインストールせずに実行できるオンラインSQLエディタ。
- すべてのプロセスとミューテーションを観測できます。未完了のプロセスについては、UIから終了させることができます。
- メトリクスには、クラスタ分析、データ分析、クエリ分析が含まれます。

### ClickVisual {#clickvisual}

[ClickVisual](https://clickvisual.net/) ClickVisualは、軽量オープンソースのログクエリ、分析、アラーム視覚化プラットフォームです。

特徴:

- 分析ログライブラリのワンクリック作成をサポート。
- ログ収集構成管理をサポート。
- ユーザー定義のインデックス構成をサポート。
- アラーム構成をサポート。
- ライブラリとテーブルの権限構成に対する権限の粒度をサポート。

### ClickHouse-Mate {#clickmate}

[ClickHouse-Mate](https://github.com/metrico/clickhouse-mate)は、ClickHouse内のデータを検索・探索するためのAngular Webクライアント+ユーザーインターフェースです。

特徴:

- ClickHouse SQLクエリの自動補完。
- 高速データベースおよびテーブルツリーのナビゲーション。
- 高度な結果のフィルタリングおよびソーティング。
- インラインClickHouse SQLドキュメント。
- クエリプリセットと履歴。
- 100%ブラウザベース、サーバー/バックエンド不要。

このクライアントは、即座に使用が可能で、GitHubページから提供されています: https://metrico.github.io/clickhouse-mate/

### Uptrace {#uptrace}

[Uptrace](https://github.com/uptrace/uptrace)は、OpenTelemetryとClickHouseを活用した分散トレーシングとメトリクスを提供するAPMツールです。

特徴:

- [OpenTelemetryトレーシング](https://uptrace.dev/opentelemetry/distributed-tracing.html)、メトリクス、およびログ。
- AlertManagerを使用したEmail/Slack/PagerDuty通知。
- スパンを集約するためのSQLライクなクエリ言語。
- メトリクスをクエリするためのPromqlライクな言語。
- プリビルドのメトリクスダッシュボード。
- YAML構成を介した複数ユーザー/プロジェクトの管理。

### clickhouse-monitoring {#clickhouse-monitoring}

[clickhouse-monitoring](https://github.com/duyet/clickhouse-monitoring)は、`system.*`テーブルに依存してClickHouseクラスタを監視し、概要を提供するシンプルなNext.jsダッシュボードです。

特徴:

- クエリモニター: 現在のクエリ、クエリ履歴、クエリリソース（メモリ、読み込んだパーツ、ファイルオープンなど）、最も高コストのクエリ、最も使用されたテーブルやカラムなど。
- クラスタモニター: 総メモリ/CPU使用量、分散キュー、グローバル設定、mergetree設定、メトリクスなど。
- テーブル及びパーツ情報: カラムレベルの詳細でサイズ、行数、圧縮、パートサイズなど。
- 有用なツール: Zookeeperデータ探索、クエリEXPLAIN、クエリの中止など。
- 視覚化メトリクスチャート: クエリとリソース使用状況、マージ/ミューテーションの数、マージパフォーマンス、クエリパフォーマンスなど。

### CKibana {#ckibana}

[CKibana](https://github.com/TongchengOpenSource/ckibana)は、ネイティブKibana UIを使用してClickHouseデータを簡単に検索、探索、視覚化できる軽量サービスです。

特徴:

- ネイティブKibana UIからのチャートリクエストをClickHouseクエリ構文に翻訳します。
- クエリ性能を向上させるためのサンプリングやキャッシングなどの高度な機能をサポート。
- ElasticSearchからClickHouseへの移行後のユーザーの学習コストを最小限に抑えます。

## 商業用 {#commercial}

### DataGrip {#datagrip}

[DataGrip](https://www.jetbrains.com/datagrip/)は、ClickHouse専用サポートを備えたJetBrainsのデータベースIDEです。PyCharm、IntelliJ IDEA、GoLand、PhpStormなどの他のIntelliJベースのツールにも埋め込まれています。

特徴:

- 非常に迅速なコード補完。
- ClickHouseの構文ハイライト。
- ネストされたカラム、テーブルエンジンなど、ClickHouseに特有の特徴のサポート。
- データエディタ。
- リファクタリング。
- 検索とナビゲーション。

### Yandex DataLens {#yandex-datalens}

[Yandex DataLens](https://cloud.yandex.ru/services/datalens) は、データ視覚化と分析のためのサービスです。

特徴:

- 単純な棒グラフから複雑なダッシュボードまで、幅広い視覚化オプション。
- ダッシュボードは一般に公開される可能性があります。
- ClickHouseを含む複数のデータソースのサポート。
- ClickHouseに基づくマテリアライズドデータのストレージ。

DataLensは、低負荷プロジェクトに対して[無料](https://cloud.yandex.com/docs/datalens/pricing)で利用可能であり、商業利用も可能です。

- [DataLensドキュメント](https://cloud.yandex.com/docs/datalens/)。
- [チュートリアル](https://cloud.yandex.com/docs/solutions/datalens/data-from-ch-visualization) ClickHouseデータベースからのデータを視覚化する方法。

### Holistics Software {#holistics-software}

[Holistics](https://www.holistics.io/)は、フルスタックデータプラットフォームおよびビジネスインテリジェンスツールです。

特徴:

- レポートの自動化されたメール、Slack、Google Sheetスケジュール。
- 可視化、バージョン管理、自動補完、再利用可能なクエリコンポーネント、動的フィルタを備えたSQLエディタ。
- iframe経由でのレポートおよびダッシュボードの埋め込まれた分析。
- データ準備およびETL機能。
- データの関係マッピングをサポートするSQLデータモデリング。

### Looker {#looker}

[Looker](https://looker.com)は、ClickHouseを含む50以上のデータベース方言をサポートするデータプラットフォームおよびビジネスインテリジェンスツールです。LookerはSaaSプラットフォームとして、またはセルフホスティング版として利用可能です。ユーザーはブラウザを介してLookerを使用してデータを探索し、視覚化やダッシュボードを作成し、レポートをスケジュールし、洞察を同僚と共有することができます。Lookerは、これらの機能を他のアプリケーションに埋め込むための豊富なツールセットと、他のアプリケーションとデータを統合するためのAPIを提供しています。

特徴:

- きわめて簡単かつアジャイルな開発を可能にするLookMLを使用した curated
    [データモデリング](https://looker.com/platform/data-modeling)のサポート。
- Lookerの[データアクション](https://looker.com/platform/actions)を介した強力なワークフロー統合。

[LookerにClickHouseを設定する方法](https://docs.looker.com/setup-and-management/database-config/clickhouse)。

### SeekTable {#seektable}

[SeekTable](https://www.seektable.com)は、データ探索および操作レポート用のセルフサービスBIツールです。クラウドサービスとセルフホスティング版の両方が利用可能です。SeekTableのレポートは、任意のWebアプリ内に埋め込むことができます。

特徴:

- ビジネスユーザー向けの使いやすいレポートビルダー。
- SQLフィルタリングおよびレポート特有のクエリカスタマイズのための強力なレポートパラメータ。
- TCP/IPエンドポイントとHTTP(S)インターフェース（2つの異なるドライバ）を介してClickHouseに接続可能。
- サイズや測定の定義にClickHouse SQLダイアレクトの全機能を使用できます。
- [Web API](https://www.seektable.com/help/web-api-integration)による自動レポート生成。
- アカウントデータの[バックアップ/復元](https://www.seektable.com/help/self-hosted-backup-restore)を含むレポート開発フローをサポート。データモデル（キューブ）/レポート構成は人間が読み取れるXML形式で、バージョン管理システムに保存可能。

SeekTableは[個人/個人使用向けに無料](https://www.seektable.com/help/cloud-pricing)です。

[SeekTableにおけるClickHouse接続の設定方法](https://www.seektable.com/help/clickhouse-pivot-table)。

### Chadmin {#chadmin}

[Chadmin](https://github.com/bun4uk/chadmin)は、ClickHouseクラスタで現在実行中のクエリを視覚化し、その情報を確認し、必要に応じてクエリを終了させることができるシンプルなUIです。

### TABLUM.IO {#tablum_io}

[TABLUM.IO](https://tablum.io/) — ETLおよび視覚化のためのオンラインクエリおよび分析ツール。ClickHouseに接続し、多様なSQLコンソールを介してデータをクエリ可能で、静的ファイルやサードパーティーサービスからデータを読み込むこともできます。TABLUM.IOは、結果をチャートやテーブルとして視覚化できます。

特徴:
- ETL: 人気のあるデータベース、ローカルおよびリモートファイル、API呼び出しからのデータ読み込み。
- シンタックスハイライトと視覚的クエリビルダーを備えた多用途なSQLコンソール。
- チャートとテーブルとしてのデータ視覚化。
- データの具現化とサブクエリ。
- Slack、Telegram、またはメールへのデータレポート。
- 独自のAPIを介したデータパイプライン化。
- JSON、CSV、SQL、HTML形式でのデータエクスポート。
- Webベースのインターフェース。

TABLUM.IOは、セルフホスティングソリューション（Dockerイメージとして）またはクラウドで実行できます。
ライセンス: [商業用](https://tablum.io/pricing)製品で、3ヶ月の無料期間があります。

[クラウドで無料で試す](https://tablum.io/try)。
より詳細な情報は[TABLUM.IO](https://tablum.io/)でご確認ください。

### CKMAN {#ckman}

[CKMAN](https://www.github.com/housepower/ckman)は、ClickHouseクラスタを管理・監視するためのツールです！

特徴:

- ブラウザインターフェースを介した迅速かつ便利な自動クラスタデプロイメント
- クラスタはスケールアップまたはダウンできる
- クラスタのデータの負荷分散
- クラスタのオンラインアップグレード
- ページ上でクラスタ構成を修正
- クラスタノードの監視とZookeeperの監視を提供
- テーブルやパーティションのステータスを監視し、遅いSQLステートメントを監視
