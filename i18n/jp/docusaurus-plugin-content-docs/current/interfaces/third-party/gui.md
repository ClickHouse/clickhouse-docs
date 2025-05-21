description: 'ClickHouseを使用して作業するためのサードパーティ製GUIツールとアプリケーションのリスト'
sidebar_label: '視覚インターフェース'
sidebar_position: 28
slug: /interfaces/third-party/gui
title: 'サードパーティ製開発者による視覚インターフェース'
```


# サードパーティ製開発者による視覚インターフェース

## オープンソース {#open-source}

### agx {#agx}

[agx](https://github.com/agnosticeng/agx) は、ClickHouseの埋め込みデータベースエンジン (chdb) を使用してデータを探索し、クエリを実行するためのモダンなインターフェースを提供する、TauriとSvelteKitで構築されたデスクトップアプリケーションです。

- ネイティブアプリケーションを実行する際にch-dbを活用。
- Webインスタンスを実行しているときにClickhouseインスタンスに接続可能。
- Monacoエディタにより、快適な操作感を提供。
- 多様で進化するデータビジュアライゼーション。

### ch-ui {#ch-ui}

[ch-ui](https://github.com/caioricciuti/ch-ui) は、ClickHouseデータベース向けに設計されたシンプルなReact.jsアプリインターフェースで、クエリを実行しデータを可視化します。ReactとClickHouseのWebクライアントで構築されており、データベースとのインタラクションが容易なスタイリッシュでユーザーフレンドリーなUIを提供します。

機能:

- ClickHouse統合: 接続を簡単に管理し、クエリを実行。
- レスポンシブタブ管理: クエリとテーブルタブなど、複数のタブを動的に管理。
- パフォーマンス最適化: 効率的なキャッシングと状態管理のためにIndexed DBを活用。
- ローカルデータストレージ: すべてのデータがブラウザにローカル保存され、他の場所にデータが送信されないことを保証。

### ChartDB {#chartdb}

[ChartDB](https://chartdb.io) は、ClickHouseを含むデータベーススキーマの視覚化と設計を、1つのクエリで行うための無料でオープンソースのツールです。Reactで構築されており、シームレスでユーザーフレンドリーな体験を提供し、データベースの資格情報やサインアップなしで開始できます。

機能:

- スキーマ視覚化: ClickHouseスキーマを即座にインポートし、ER図や物化ビュー、標準ビューを含む視覚化ができ、テーブルへの参照を示します。
- AI駆動のDDLエクスポート: スキーマ管理とドキュメントの向上のために、DDLスクリプトを簡単に生成。
- マルチSQLダイアレクトサポート: 幅広いSQLダイアレクトに対応し、さまざまなデータベース環境での柔軟性を確保。
- サインアップや資格情報不要: すべての機能はブラウザから直接アクセス可能で、摩擦のない安全な体験を提供。

[ChartDB ソースコード](https://github.com/chartdb/chartdb).

### ClickHouseスキーマフロービジュアライザー {#clickhouse-schemaflow-visualizer}

Mermaid.jsダイアグラムを使用してClickHouseテーブルの関係を視覚化するための強力なWebアプリケーションです。

機能:

- 直感的なインターフェースでClickHouseデータベースとテーブルをブラウズ
- Mermaid.jsダイアグラムでテーブル関係を視覚化
- テーブル間のデータフローの方向を表示
- ダイアグラムをスタンドアロンのHTMLファイルとしてエクスポート
- TLSサポートを備えたClickHouseへの安全な接続
- すべてのデバイス向けのレスポンシブウェブインターフェース

[ClickHouseスキーマフロービジュアライザー - ソースコード](https://github.com/FulgerX2007/clickhouse-schemaflow-visualizer)

### Tabix {#tabix}

[Tabix](https://github.com/tabixio/tabix)プロジェクトのためのClickHouseのWebインターフェースです。

機能:

- 追加のソフトウェアをインストールすることなく、ブラウザからClickHouseに直接アクセス。
- シンタックスハイライト付きのクエリエディタ。
- コマンドの自動補完。
- クエリ実行のグラフィカル分析ツール。
- カラースキームオプション。

[Tabixドキュメント](https://tabix.io/doc/).

### HouseOps {#houseops}

[HouseOps](https://github.com/HouseOps/HouseOps) は、OSX、Linux、Windows向けのUI/IDEです。

機能:

- シンタックスハイライト付きのクエリビルダー。応答をテーブルまたはJSONビューで表示。
- クエリ結果をCSVまたはJSONとしてエクスポート。
- 説明を伴うプロセスのリスト。書き込みモード。プロセスを停止する機能（`KILL`）。
- データベースグラフ。すべてのテーブルとそのカラムを追加情報と共に表示。
- カラムサイズのクイックビュー。
- サーバー設定。

開発予定の機能:

- データベース管理。
- ユーザー管理。
- リアルタイムデータ分析。
- クラスター監視。
- クラスター管理。
- レプリケートテーブルとKafkaテーブルの監視。

### LightHouse {#lighthouse}

[LightHouse](https://github.com/VKCOM/lighthouse) は、ClickHouse向けの軽量なWebインターフェースです。

機能:

- フィルタリングとメタデータ付きのテーブルリスト。
- フィルタリングとソートを含むテーブルプレビュー。
- 読み取り専用のクエリ実行。

### Redash {#redash}

[Redash](https://github.com/getredash/redash) はデータ視覚化のプラットフォームです。

ClickHouseを含む複数のデータソースに対応しており、Redashは異なるデータソースからのクエリ結果を結合し、1つの最終データセットにまとめることができます。

機能:

- 強力なクエリエディタ。
- データベースエクスプローラ。
- データを異なる形で表現するビジュアライゼーションツール。

### Grafana {#grafana}

[Grafana](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/) は、監視と視覚化のプラットフォームです。

「Grafanaは、メトリクスを格納している場所に関係なく、クエリを実行し、視覚化し、アラートを通知し、理解するためのツールです。ダッシュボードを作成、探索、およびチームと共有し、データ駆動型文化を育みます。コミュニティに信頼され、愛されている」&mdash; grafana.com。

ClickHouseデータソースプラグインは、バックエンドデータベースとしてClickHouseをサポートします。

### qryn {#qryn}

[qryn](https://metrico.in) は、ClickHouseのためのポリグロットで高性能な可観測スタックで、_(旧称 cLoki)_、Loki/LogQL、Prometheus/PromQL、OTLP/Tempo、Elastic、InfluxDBなど、任意のエージェントからログ、メトリクス、テレメトリートレースを取り込み、分析できるネイティブGrafana統合を提供します。

機能:

- データをクエリ、抽出、視覚化するための組み込みExplore UIとLogQL CLI
- プラグインなしでクエリ、処理、取り込み、トレース、アラートのためのネイティブGrafana APIサポート
- ログ、イベント、トレースなどからデータを動的に検索、フィルタリング、抽出するための強力なパイプライン
- LogQL、PromQL、InfluxDB、Elasticなどとも透過的に互換性のある取り込みおよびPUSH API
- Promtail、Grafana-Agent、Vector、Logstash、Telegrafなどのエージェントとすぐに使える

### DBeaver {#dbeaver}

[DBeaver](https://dbeaver.io/) - ClickHouseサポートを備えたユニバーサルデスクトップデータベースクライアント。

機能:

- シンタックスハイライトと自動補完によるクエリ開発。
- フィルタとメタデータ検索機能を持つテーブルリスト。
- テーブルデータのプレビュー。
- フルテキスト検索。

デフォルトでは、DBeaverはセッションを使用して接続しません（CLIはそのように接続します）。セッションサポートが必要な場合（例：セッションの設定を設定するため）、ドライバ接続プロパティを編集し、`session_id`をランダムな文字列に設定します（その際、内部でHTTP接続を使用）。次に、クエリウィンドウから任意の設定を使用できます。

### clickhouse-cli {#clickhouse-cli}

[clickhouse-cli](https://github.com/hatarist/clickhouse-cli) は、Python 3で書かれたClickHouseの代替コマンドラインクライアントです。

機能:

- 自動補完。
- クエリとデータ出力のシンタックスハイライティング。
- データ出力のためのページャサポート。
- PostgreSQLライクなカスタムコマンド。

### clickhouse-flamegraph {#clickhouse-flamegraph}

[clickhouse-flamegraph](https://github.com/Slach/clickhouse-flamegraph) は、`system.trace_log`を[flamegraph](http://www.brendangregg.com/flamegraphs.html)として視覚化するための専門ツールです。

### clickhouse-plantuml {#clickhouse-plantuml}

[cickhouse-plantuml](https://pypi.org/project/clickhouse-plantuml/) は、テーブルスキームの[PlantUML](https://plantuml.com/)ダイアグラムを生成するスクリプトです。

### ClickHouseテーブルグラフ {#clickhouse-table-graph}

[ClickHouseテーブルグラフ](https://github.com/mbaksheev/clickhouse-table-graph) は、ClickHouseテーブル間の依存関係を視覚化するためのシンプルなCLIツールです。このツールは、`system.tables`テーブルからテーブル間の接続を取得し、[mermaid](https://mermaid.js.org/syntax/flowchart.html)形式で依存関係のフローチャートを構築します。このツールを使用すると、テーブルの依存関係を視覚化し、ClickHouseデータベースにおけるデータフローを理解できます。Mermaidのおかげで、結果のフローチャートは魅力的に見え、簡単にMarkdownドキュメントに追加できます。

### xeus-clickhouse {#xeus-clickhouse}

[xeus-clickhouse](https://github.com/wangfenjin/xeus-clickhouse) は、ClickHouseのJupyterカーネルで、SQLを使用してJupyter内のCHデータをクエリします。

### MindsDB Studio {#mindsdb}

[MindsDB](https://mindsdb.com/) は、ClickHouseを含むデータベース向けのオープンソースのAIレイヤーで、最新の機械学習モデルを簡単に開発、トレーニング、デプロイすることができます。MindsDB Studio (GUI) により、データベースから新しいモデルをトレーニングしたり、モデルによって行われた予測を解釈したり、潜在的なデータバイアスを特定し、Explainable AI機能を使用してモデルの精度を評価および視覚化し、機械学習モデルをより迅速に適応させ調整できます。

### DBM {#dbm}

[DBM](https://github.com/devlive-community/dbm) は、ClickHouseのための視覚管理ツールです！

機能:

- クエリ履歴のサポート (ページネーション、すべてクリアなど)
- 選択されたSQL句のクエリサポート
- クエリの停止サポート
- テーブル管理のサポート (メタデータ、削除、プレビュー)
- データベース管理のサポート (削除、作成)
- カスタムクエリのサポート
- 複数データソース管理のサポート (接続テスト、監視)
- 監視のサポート (プロセッサ、接続、クエリ)
- データの移行をサポート

### Bytebase {#bytebase}

[Bytebase](https://bytebase.com) は、チーム向けのWebベースのオープンソーススキーマ変更およびバージョン管理ツールです。ClickHouseを含むさまざまなデータベースをサポートしています。

機能:

- 開発者とDBA間のスキーマレビュー。
- データベースをコードとして扱い、GitLabなどのVCSにスキーマをバージョン管理し、コードコミットに応じてデプロイをトリガします。
- 環境ごとのポリシーによるスムーズなデプロイ。
- 完全なマイグレーション履歴。
- スキーマのドリフト検出。
- バックアップと復元。
- RBAC。

### Zeppelin-Interpreter-for-ClickHouse {#zeppelin-interpreter-for-clickhouse}

[Zeppelin-Interpreter-for-ClickHouse](https://github.com/SiderZhang/Zeppelin-Interpreter-for-ClickHouse) は、ClickHouse用の[Zeppelin](https://zeppelin.apache.org)インタープリタです。JDBCインタープリタと比較して、長時間実行されるクエリのタイムアウト制御を改善できます。

### ClickCat {#clickcat}

[ClickCat](https://github.com/clickcat-project/ClickCat) は、ユーザーがClickHouseデータを検索、探索、視覚化できるフレンドリーなユーザーインターフェースです。

機能:

- SQLコードをインストールなしで実行できるオンラインSQLエディタ。
- すべてのプロセスと変異を観察できます。未完了のプロセスに対しては、UIで停止できます。
- メトリクスにはクラスター分析、データ分析、クエリ分析が含まれています。

### ClickVisual {#clickvisual}

[ClickVisual](https://clickvisual.net/) ClickVisualは、軽量のオープンソースのログクエリ、分析、およびアラーム視覚化プラットフォームです。

機能:

- 分析ログライブラリのワンクリック作成をサポート
- ログ収集構成管理をサポート
- ユーザー定義のインデックス構成をサポート
- アラーム構成をサポート
- ライブラリおよびテーブルのアクセス許可構成のための権限の粒度をサポート

### ClickHouse-Mate {#clickmate}

[ClickHouse-Mate](https://github.com/metrico/clickhouse-mate) は、ClickHouseデータを検索し探索するためのAngular Webクライアント及びユーザーインターフェースです。

機能:

- ClickHouse SQLクエリの自動補完
- 高速なデータベースおよびテーブルツリーのナビゲーション
- 高度な結果フィルタリングとソート
- インラインのClickHouse SQLドキュメント
- クエリプリセットと履歴
- 100%ブラウザベース、サーバー/バックエンドなし

このクライアントは、以下のリンクから即時使用可能です: https://metrico.github.io/clickhouse-mate/

### Uptrace {#uptrace}

[Uptrace](https://github.com/uptrace/uptrace) は、OpenTelemetryとClickHouseによって強化された分散トレーシングとメトリクスを提供するAPMツールです。

機能:

- [OpenTelemetryトレーシング](https://uptrace.dev/opentelemetry/distributed-tracing.html)、メトリクス、ログ。
- AlertManagerによるEmail/Slack/PagerDuty通知。
- スパンを集約するためのSQLライクなクエリ言語。
- メトリクスをクエリするためのPromqlライクな言語。
- 作成済みのメトリクスダッシュボード。
- YAML構成による複数のユーザー/プロジェクト管理。

### clickhouse-monitoring {#clickhouse-monitoring}

[clickhouse-monitoring](https://github.com/duyet/clickhouse-monitoring) は、`system.*`テーブルを利用してClickHouseクラスターを監視し、概要を提供するシンプルなNext.jsダッシュボードです。

機能:

- クエリモニタ: 現在のクエリ、クエリ履歴、クエリリソース (メモリ、読み込まれたパーツ、file_openなど)、最も高価なクエリ、最も使用されるテーブルまたはカラムなど。
- クラスターモニタ: 総メモリ/CPU使用率、分散キュー、グローバル設定、mergetree設定、メトリクスなど。
- テーブルおよびパーツ情報: サイズ、行数、圧縮、パートサイズなど、カラムレベルの詳細。
- 有用なツール: Zookeeperデータの探索、クエリEXPLAIN、クエリの強制終了など。
- メトリックチャートの視覚化: クエリとリソース使用状況、マージ/ミューテーションの数、マージパフォーマンス、クエリパフォーマンスなど。

### CKibana {#ckibana}

[CKibana](https://github.com/TongchengOpenSource/ckibana) は、KibanaのネイティブUIを使用してClickHouseデータを簡単に検索、探索、視覚化できる軽量サービスです。

機能:

- ネイティブKibana UIからのチャートリクエストをClickHouseクエリシンタックスに変換します。
- クエリパフォーマンスを向上させるためにサンプリングやキャッシングなどの高度な機能をサポートします。
- ElasticSearchからClickHouseに移行した後のユーザーの学習コストを最小限に抑えます。

## 商業 {#commercial}

### DataGrip {#datagrip}

[DataGrip](https://www.jetbrains.com/datagrip/) は、ClickHouse専用サポートを提供するJetBrainsのデータベースIDEです。他のIntelliJベースのツールにも組み込まれています: PyCharm、IntelliJ IDEA、GoLand、PhpStormなど。

機能:

- 非常に高速なコード補完。
- ClickHouseのシンタックスハイライティング。
- ネストされたカラム、テーブルエンジンなど、ClickHouse特有の機能のサポート。
- データエディタ。
- リファクタリング。
- 検索とナビゲーション。

### Yandex DataLens {#yandex-datalens}

[Yandex DataLens](https://cloud.yandex.ru/services/datalens) は、データ視覚化と分析のサービスです。

機能:

- シンプルな棒グラフから複雑なダッシュボードまで様々な視覚化。
- ダッシュボードは公開可能。
- ClickHouseを含む複数のデータソースのサポート。
- ClickHouseに基づいた物化データのストレージ。

DataLensは、低負荷プロジェクト向けに[無料](https://cloud.yandex.com/docs/datalens/pricing)で提供されており、商業利用も可能です。

- [DataLensドキュメント](https://cloud.yandex.com/docs/datalens/).
- ClickHouseデータベースからデータを視覚化するための[チュートリアル](https://cloud.yandex.com/docs/solutions/datalens/data-from-ch-visualization)。

### Holistics Software {#holistics-software}

[Holistics](https://www.holistics.io/) は、フルスタックデータプラットフォームおよびビジネスインテリジェンスツールです。

機能:

- レポートの自動メール、Slack、Google Sheetsのスケジュール。
- ビジュアライゼーションを伴うSQLエディタ、自動補完、再利用可能なクエリコンポーネント、動的フィルタ。
- iframeを介したレポートおよびダッシュボードの埋め込み分析機能。
- データ準備とETL機能。
- リレーショナルマッピングのためのSQLデータモデリングサポート。

### Looker {#looker}

[Looker](https://looker.com) は、ClickHouseを含む50以上のデータベースダイアレクトをサポートするデータプラットフォームおよびビジネスインテリジェンスツールです。LookerはSaaSプラットフォームおよびセルフホスト型で利用可能です。ユーザーはブラウザを介してデータを探索し、視覚化やダッシュボードを作成し、レポートをスケジュールし、同僚と洞察を共有できます。Lookerは、これらの機能を他のアプリケーションに埋め込むための豊富なツールセットと、他のアプリケーションとのデータ統合のためのAPIを提供します。

機能:

- キュレーションされた[データモデリング](https://looker.com/platform/data-modeling)をサポートするLookMLを使用した簡単かつアジャイルな開発。
- Lookerの[データアクション](https://looker.com/platform/actions)を介した強力なワークフロー統合。

[LookerでClickHouseを設定する方法。](https://docs.looker.com/setup-and-management/database-config/clickhouse)

### SeekTable {#seektable}

[SeekTable](https://www.seektable.com) は、データ探索と運用報告のためのセルフサービスBIツールです。クラウドサービスとセルフホスト型バージョンの両方が利用可能です。SeekTableからのレポートは、任意のWebアプリに埋め込むことができます。

機能:

- ビジネスユーザー向けのレポートビルダー。
- SQLフィルタリングと特定のクエリカスタマイズのための強力なレポートパラメータ。
- ネイティブTCP/IPエンドポイントおよびHTTP(S)インターフェースの両方でClickHouseに接続可能（2つの異なるドライバ）。
- 次元/測定定義でClickHouse SQLダイアレクトの全機能を使用可能。
- 自動レポート生成のための[Web API](https://www.seektable.com/help/web-api-integration)。
- アカウントデータの[バックアップ/復元](https://www.seektable.com/help/self-hosted-backup-restore)に関するレポートの開発フローをサポート; データモデル（キューブ）/レポート構成は読みやすいXMLであり、バージョン管理システムに保存できます。

SeekTableは、個人/個人的な使用向けに[無料](https://www.seektable.com/help/cloud-pricing)です。

[SeekTableでのClickHouse接続設定方法。](https://www.seektable.com/help/clickhouse-pivot-table)

### Chadmin {#chadmin}

[Chadmin](https://github.com/bun4uk/chadmin) は、ClickHouseクラスター上で現在実行中のクエリを視覚化し、その情報を表示し、必要に応じてそれらを停止できるシンプルなUIです。

### TABLUM.IO {#tablum_io}

[TABLUM.IO](https://tablum.io/) — ETLおよび視覚化のためのオンラインクエリおよび分析ツールです。ClickHouseに接続し、多目的なSQLコンソールを介してデータをクエリできるだけでなく、静的ファイルや3rdパーティサービスからデータをロードすることもできます。TABLUM.IOは、チャートやテーブルとしてデータ結果を視覚化できます。

機能:
- ETL: 人気のデータベース、ローカルおよびリモートファイル、API呼び出しからのデータのロード。
- シンタックスハイライトとビジュアルクエリビルダーを備えた多目的SQLコンソール。
- チャートやテーブルとしてのデータ視覚化。
- データの物化とサブクエリ。
- Slack、Telegram、またはメールへのデータ報告。
- 専有APIを介したデータパイプライニング。
- JSON、CSV、SQL、HTML形式でのデータエクスポート。
- Webベースのインターフェース。

TABLUM.IOは、セルフホスト型ソリューション（Dockerイメージとして）またはクラウドで実行できます。
ライセンス: [商業用](https://tablum.io/pricing)商品で3ヶ月の無料期間があります。

[クラウドで無料で試してみる](https://tablum.io/try).
商品の詳細は[TABLUM.IO](https://tablum.io/)で確認してください。

### CKMAN {#ckman}

[CKMAN](https://www.github.com/housepower/ckman) は、ClickHouseクラスターの管理と監視のためのツールです！

機能:

- ブラウザインターフェースを介した迅速で便利な自動クラスターデプロイ。
- クラスターのスケールアップまたはスケールダウン。
- クラスターのデータの負荷分散。
- クラスターをオンラインでアップグレード。
- ページ上でクラスターの設定を変更。
- クラスターノード監視とZookeeper監視を提供。
- テーブルとパーティションの状態を監視し、遅いSQL文を特定。
- 簡単に使えるSQL実行ページを提供。
