---
slug: /interfaces/third-party/gui
sidebar_position: 28
sidebar_label: ビジュアルインターフェース
---


# サードパーティ開発者によるビジュアルインターフェース

## オープンソース {#open-source}

### ch-ui {#ch-ui}

[ch-ui](https://github.com/caioricciuti/ch-ui) は、ClickHouseデータベース用のシンプルなReact.jsアプリインターフェースで、クエリの実行とデータの可視化を目的としています。Reactとウェブ用のClickHouseクライアントで構築されており、データベースとの簡単なインタラクションのための洗練されたユーザーフレンドリーなUIを提供します。

特徴:

- ClickHouse統合: 接続の管理とクエリの実行が簡単にできます。
- レスポンシブタブ管理: クエリやテーブルのタブなど、複数のタブを動的に扱えます。
- パフォーマンス最適化: 効率的なキャッシングと状態管理のためにIndexed DBを利用しています。
- ローカルデータストレージ: すべてのデータはブラウザ内にローカルに保存され、データが他の場所に送信されることはありません。

### ChartDB {#chartdb}

[ChartDB](https://chartdb.io) は、ClickHouseを含むデータベーススキーマの可視化と設計のための無料のオープンソースツールで、単一のクエリで操作できます。Reactで構築されており、シームレスでユーザーフレンドリーな体験を提供し、データベースの資格情報やサインアップ無しで始めることができます。

特徴:

- スキーマ可視化: ClickHouseスキーマを瞬時にインポートして可視化し、マテリアライズドビューや標準ビューを含むER図を表示し、テーブルへの参照を示します。
- AI駆動のDDLエクスポート: スキーマ管理と文書化のためにDDLスクリプトを簡単に生成できます。
- マルチSQLダイアレクトサポート: 様々なデータベース環境に適応できるSQLダイアレクトの範囲と互換性があります。
- サインアップや資格情報不要: すべての機能はブラウザ内で直接利用でき、摩擦が少なく安全です。

[ChartDB ソースコード](https://github.com/chartdb/chartdb).

### Tabix {#tabix}

[Tabix](https://github.com/tabixio/tabix) プロジェクトのClickHouse用ウェブインターフェース。

特徴:

- 追加のソフトウェアをインストールせずにブラウザから直接ClickHouseと連携します。
- 構文ハイライト付きのクエリエディタ。
- コマンドの自動補完。
- クエリ実行のグラフィカル分析ツール。
- カラースキームのオプション。

[Tabix ドキュメント](https://tabix.io/doc/).

### HouseOps {#houseops}

[HouseOps](https://github.com/HouseOps/HouseOps) は、OSX、Linux、Windows用のUI/IDEです。

特徴:

- 構文ハイライト付きのクエリビルダー。結果をテーブル形式またはJSON形式で表示します。
- クエリ結果をCSVまたはJSON形式でエクスポートします。
- プロセスのリストと説明。書き込みモード。プロセスを停止 (`KILL`) する機能。
- データベースグラフ。すべてのテーブルとそのカラムに追加情報を表示します。
- カラムサイズのクイックビュー。
- サーバー設定。

今後の開発予定の機能:

- データベース管理。
- ユーザー管理。
- リアルタイムデータ分析。
- クラスター監視。
- クラスター管理。
- レプリケートされたKafkaテーブルの監視。

### LightHouse {#lighthouse}

[LightHouse](https://github.com/VKCOM/lighthouse) は、ClickHouse用の軽量ウェブインターフェースです。

特徴:

- フィルタリングとメタデータ付きのテーブルリスト。
- フィルタリングとソート機能を備えたテーブルプレビュー。
- 読み取り専用のクエリ実行。

### Redash {#redash}

[Redash](https://github.com/getredash/redash) は、データ可視化のプラットフォームです。

ClickHouseを含む複数のデータソースをサポートし、異なるデータソースからのクエリ結果を1つの最終データセットに結合することができます。

特徴:

- 強力なクエリエディタ。
- データベースエクスプローラ。
- データをさまざまな形式で表現するための可視化ツール。

### Grafana {#grafana}

[Grafana](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/) は、監視と可視化のプラットフォームです。

「Grafanaにより、どこに保存されていてもメトリックをクエリし、可視化し、アラートを設定し、理解することができます。ダッシュボードを作成、探求、共有し、データ駆動の文化を育てることができます。コミュニティから信頼され、愛されています。」 &mdash; grafana.com。

ClickHouseデータソースプラグインは、バックエンドデータベースとしてClickHouseをサポートします。

### qryn {#qryn}

[qryn](https://metrico.in) は、ClickHouseのための多言語での高パフォーマンス可観測性スタックです _(以前はcLoki)_。Grafanaとのネイティブ統合により、ユーザーがLoki/LogQL、Prometheus/PromQL、OTLP/Tempo、Elastic、InfluxDBなど、任意のエージェントからログ、メトリック、テレメトリトレースを取り込み、分析することができます。

特徴:

- データをクエリ、抽出、視覚化するための組み込みExplore UIとLogQL CLI。
- プラグインなしでクエリ、処理、取り込み、トレース、アラートを行うためのネイティブGrafana APIのサポート。
- ログ、イベント、トレースなどからデータを動的に検索、フィルタリング、抽出するための強力なパイプライン。
- LogQL、PromQL、InfluxDB、Elasticなどと透明に互換性のある取り込みとPUSH API。
- Promtail、Grafana-Agent、Vector、Logstash、Telegrafなどのエージェントで即使用可能。

### DBeaver {#dbeaver}

[DBeaver](https://dbeaver.io/) - ClickHouseをサポートするユニバーサルデスクトップデータベースクライアントです。

特徴:

- 構文ハイライトと自動補完によるクエリ開発。
- フィルターとメタデータ検索付きのテーブルリスト。
- テーブルデータのプレビュー。
- フルテキスト検索。

デフォルトでは、DBeaverはセッションを使用して接続しません (CLIのように)。セッションサポートが必要な場合 (例えば、セッションの設定を行いたい場合)、ドライバー接続プロパティを編集し、`session_id` をランダムな文字列に設定します (内部でhttp接続を使用します)。その後、クエリウィンドウから任意の設定を使用できます。

### clickhouse-cli {#clickhouse-cli}

[clickhouse-cli](https://github.com/hatarist/clickhouse-cli) は、Python 3で書かれたClickHouseの代替コマンドラインクライアントです。

特徴:

- 自動補完。
- クエリとデータ出力のための構文ハイライト。
- データ出力のためのページャーサポート。
- PostgreSQLのようなカスタムコマンド。

### clickhouse-flamegraph {#clickhouse-flamegraph}

[clickhouse-flamegraph](https://github.com/Slach/clickhouse-flamegraph) は、`system.trace_log` を[フレームグラフ](http://www.brendangregg.com/flamegraphs.html)として可視化するための専門ツールです。

### clickhouse-plantuml {#clickhouse-plantuml}

[cickhouse-plantuml](https://pypi.org/project/clickhouse-plantuml/) は、テーブルのスキーマの[PlantUML](https://plantuml.com/)ダイアグラムを生成するスクリプトです。

### xeus-clickhouse {#xeus-clickhouse}

[xeus-clickhouse](https://github.com/wangfenjin/xeus-clickhouse) は、Jupyter用のClickHouseのカーネルで、Jupyter内でSQLを使用してCHデータをクエリできます。

### MindsDB Studio {#mindsdb}

[MindsDB](https://mindsdb.com/) は、ClickHouseを含むデータベース用のオープンソースAIレイヤーで、最先端の機械学習モデルを簡単に開発、トレーニング、デプロイできます。MindsDB Studio(GUI)を使用すると、データベースから新しいモデルをトレーニングし、モデルによる予測を解釈し、潜在的なデータバイアスを特定し、Explainable AI機能を使用してモデルの精度を評価および可視化することができ、機械学習モデルをより迅速に適応させることができます。

### DBM {#dbm}

[DBM](https://github.com/devlive-community/dbm) DBMはClickHouse用のビジュアル管理ツールです！

特徴:

- クエリ履歴のサポート (ページネーション、すべてクリアなど)
- 選択したSQL句のクエリのサポート
- クエリの終了をサポート
- テーブル管理のサポート (メタデータ、削除、プレビュー)
- データベース管理のサポート (削除、作成)
- カスタムクエリをサポート
- 複数のデータソースの管理をサポート (接続テスト、監視)
- モニタリングをサポート (プロセッサ、接続、クエリ)
- データの移行をサポート

### Bytebase {#bytebase}

[Bytebase](https://bytebase.com) は、チーム用のウェブベースのオープンソーススキーマ変更とバージョン管理ツールです。ClickHouseを含むさまざまなデータベースをサポートしています。

特徴:

- 開発者とDBAの間でのスキーマレビュー。
- データベースをコードとして管理し、VCS（GitLabなど）でスキーマのバージョン管理を行い、コードコミット時にデプロイをトリガー。
- 環境ごとのポリシーでのスムーズなデプロイ。
- 完全な移行履歴。
- スキーマドリフト検出。
- バックアップとリストア。
- RBAC。

### Zeppelin-Interpreter-for-ClickHouse {#zeppelin-interpreter-for-clickhouse}

[Zeppelin-Interpreter-for-ClickHouse](https://github.com/SiderZhang/Zeppelin-Interpreter-for-ClickHouse) は、ClickHouse用の[Zeppelin](https://zeppelin.apache.org)インタープリターです。JDBCインタープリターと比較して、長時間実行されるクエリのためのより良いタイムアウト制御を提供できます。

### ClickCat {#clickcat}

[ClickCat](https://github.com/clickcat-project/ClickCat) は、ClickHouseデータを検索、探索、可視化するためのフレンドリーなユーザーインターフェースです。

特徴:

- インストールなしでSQLコードを実行できるオンラインSQLエディタ。
- 実行中のすべてのプロセスと変更を観察できます。未完了のプロセスについては、UI内で終了できます。
- メトリクスには、クラスタ分析、データ分析、およびクエリ分析が含まれます。

### ClickVisual {#clickvisual}

[ClickVisual](https://clickvisual.net/) は、軽量のオープンソースログクエリ、分析、アラーム可視化プラットフォームです。

特徴:

- 分析ログライブラリのワンクリック作成をサポート
- ログ収集設定管理をサポート
- ユーザー定義のインデックス設定をサポート
- アラーム設定をサポート
- ライブラリとテーブルの権限設定の粒度を制御する権限設定をサポート

### ClickHouse-Mate {#clickmate}

[ClickHouse-Mate](https://github.com/metrico/clickhouse-mate) は、ClickHouse内のデータを検索、探索するためのAngularウェブクライアント + ユーザーインターフェースです。

特徴:

- ClickHouse SQLクエリの自動補完
- データベースとテーブルのツリーの迅速なナビゲーション
- 高度な結果のフィルタリングとソート
- インラインのClickHouse SQLドキュメント
- クエリプリセットと履歴
- 100%ブラウザベース、サーバー/バックエンド不要

クライアントは、GitHubページを通じて即座に使用可能です: https://metrico.github.io/clickhouse-mate/

### Uptrace {#uptrace}

[Uptrace](https://github.com/uptrace/uptrace) は、OpenTelemetryとClickHouseを利用して分散トレースとメトリックを提供するAPMツールです。

特徴:

- [OpenTelemetryトレース](https://uptrace.dev/opentelemetry/distributed-tracing.html)、メトリクス、ログ。
- AlertManagerを使用した通知（Email/Slack/PagerDuty）。
- スパンを集約するためのSQLライクなクエリ言語。
- メトリクスをクエリするためのPromqlライクな言語。
- 事前構築されたメトリクスダッシュボード。
- YAML構成を介した複数のユーザー/プロジェクト。

### clickhouse-monitoring {#clickhouse-monitoring}

[clickhouse-monitoring](https://github.com/duyet/clickhouse-monitoring) は、`system.*` テーブルを利用してClickHouseクラスターを監視し、概要を提供するシンプルなNext.jsダッシュボードです。

特徴:

- クエリモニタ: 現在のクエリ、クエリ履歴、クエリリソース (メモリ、読み込まれたパーツ、ファイルオープン、...)、最もコストのかかるクエリ、最も使用されているテーブルやカラムなど。
- クラスターモニタ: 総メモリ/CPU使用量、分散キュー、グローバル設定、mergetree設定、メトリクスなど。
- テーブルとパーツ情報: サイズ、行数、圧縮、パーツサイズなど。カラムレベルの詳細。
- 有用なツール: Zookeeperデータの探索、クエリEXPLAIN、クエリの殺害など。
- 可視化メトリックチャート: クエリとリソースの使用状況、マージ/ミューテーション数、マージパフォーマンス、クエリパフォーマンスなど。

### CKibana {#ckibana}

[CKibana](https://github.com/TongchengOpenSource/ckibana) は、ネイティブKibana UIを使用してClickHouseデータを簡単に検索、探索、可視化できる軽量サービスです。

特徴:

- ネイティブKibana UIからのチャートリクエストをClickHouseクエリ構文に変換します。
- クエリパフォーマンスを向上させるためのサンプリングやキャッシングなどの高度な機能をサポート。
- ElasticSearchからClickHouseへの移行後の学習コストを最小限に抑えます。

## 商業用途 {#commercial}

### DataGrip {#datagrip}

[DataGrip](https://www.jetbrains.com/datagrip/) は、JetBrainsによるデータベースIDEで、ClickHouseを専用サポートしています。他のIntelliJベースのツール（PyCharm、IntelliJ IDEA、GoLand、PhpStormなど）にも埋め込まれています。

特徴:

- 非常に高速なコード補完。
- ClickHouseの構文ハイライト。
- ネストされたカラム、テーブルエンジンなど、ClickHouse特有の機能をサポート。
- データエディタ。
- リファクタリング。
- 検索とナビゲーション。

### Yandex DataLens {#yandex-datalens}

[Yandex DataLens](https://cloud.yandex.ru/services/datalens) は、データ可視化および分析のサービスです。

特徴:

- シンプルな棒グラフから複雑なダッシュボードまで、さまざまな可視化が可能。
- ダッシュボードは公開できます。
- ClickHouseを含む複数のデータソースをサポート。
- ClickHouseに基づくマテリアライズドデータのストレージ。

DataLensは、低負荷プロジェクトの場合、商業用途でも[無料で利用可能です](https://cloud.yandex.com/docs/datalens/pricing) 。

- [DataLens ドキュメント](https://cloud.yandex.com/docs/datalens/)。
- ClickHouseデータベースからのデータ可視化に関する[Tutorial](https://cloud.yandex.com/docs/solutions/datalens/data-from-ch-visualization) 。

### Holistics Software {#holistics-software}

[Holistics](https://www.holistics.io/) は、フルスタックデータプラットフォームおよびビジネスインテリジェンスツールです。

特徴:

- レポートの自動メール、Slack、およびGoogle Sheetスケジュール。
- ビジュアル化、バージョン管理、自動補完、再利用可能なクエリコンポーネント、および動的フィルターを備えたSQLエディタ。
- iframeを介したレポートとダッシュボードの埋め込み分析。
- データ準備およびETL機能。
- データの関係マッピングに対応したSQLデータモデリングサポート。

### Looker {#looker}

[Looker](https://looker.com) は、ClickHouseを含む50以上のデータベースダイアレクトをサポートするデータプラットフォームおよびビジネスインテリジェンスツールです。LookerはSaaSプラットフォームとセルフホステッドの両方で提供されており、ユーザーはブラウザを通じてデータを探索し、視覚化やダッシュボードを構築し、レポートをスケジュールし、洞察を共有できます。Lookerは、これらの機能を他のアプリケーションに埋め込むための豊富なツールセットとデータを他のアプリケーションと統合するAPIを提供します。

特徴:

- レポート作成者やエンドユーザーを支援するためのキュレーションされた[データモデリング](https://looker.com/platform/data-modeling)をサポートする言語LookMLを使用した簡単で敏捷な開発。
- Lookerの[データアクション](https://looker.com/platform/actions)を介した強力なワークフロー統合。

[LookerでClickHouseを構成する方法。](https://docs.looker.com/setup-and-management/database-config/clickhouse)

### SeekTable {#seektable}

[SeekTable](https://www.seektable.com) は、データ探索と運用報告のためのセルフサービスBIツールです。クラウドサービスとセルフホステッドバージョンの両方で利用可能です。SeekTableのレポートは、任意のWebアプリに埋め込むことができます。

特徴:

- ビジネスユーザーフレンドリーなレポートビルダー。
- SQLフィルタリングおよびレポート特有のクエリカスタマイズのための強力なレポートパラメータ。
- ネイティブTCP/IPエンドポイントおよびHTTP(S)インターフェース（2つの異なるドライバ）でClickHouseに接続できます。
- 次元/指標の定義でClickHouse SQLダイアレクトの全機能を利用できます。
- 自動レポート生成のための[Web API](https://www.seektable.com/help/web-api-integration)。
- アカウントデータの[バックアップ/復元](https://www.seektable.com/help/self-hosted-backup-restore)によるレポート開発フローのサポート; データモデル（キューブ）/レポート設定は人間が読みやすいXMLであり、バージョン管理システムに保存できます。

SeekTableは[個人/個人利用に対して無料](https://www.seektable.com/help/cloud-pricing) です。

[SeekTableでClickHouse接続を構成する方法。](https://www.seektable.com/help/clickhouse-pivot-table)

### Chadmin {#chadmin}

[Chadmin](https://github.com/bun4uk/chadmin) は、ClickHouseクラスター上で現在実行中のクエリを可視化し、その情報を表示し、必要に応じてそれらを終了するためのシンプルなUIです。

### TABLUM.IO {#tablum_io}

[TABLUM.IO](https://tablum.io/) — ETLおよび可視化のためのオンラインクエリおよび分析ツールです。ClickHouseに接続し、多様なSQLコンソールを介してデータを照会したり、静的ファイルやサードパーティサービスからデータをロードしたりすることができます。TABLUM.IOは、データ結果をチャートやテーブルとして可視化します。

特徴:
- ETL: 人気のデータベースからのデータロード、ローカルおよびリモートファイル、API呼び出し。
- 構文ハイライトとビジュアルクエリビルダーを備えた多様なSQLコンソール。
- チャートやテーブルとしてのデータ可視化。
- データの具現化とサブクエリ。
- Slack、Telegram、またはメールへのデータ報告。
- プロプライエタリAPIを介したデータパイプライニング。
- JSON、CSV、SQL、HTML形式でのデータエクスポート。
- ウェブベースのインターフェース。

TABLUM.IOは、セルフホスティングソリューション（Dockerイメージとして）またはクラウドで実行できます。ライセンス: [商業](https://tablum.io/pricing)製品で、3か月の無料期間があります。

無料で[クラウドで試す](https://tablum.io/try)。
製品についての詳細は[TABLUM.IO](https://tablum.io/)を参照してください。

### CKMAN {#ckman}

[CKMAN](https://www.github.com/housepower/ckman) は、ClickHouseクラスターの管理と監視のためのツールです！

特徴:

- ブラウザインターフェースを介して迅速かつ便利な自動クラスター展開
- クラスターのスケーリングや縮小が可能
- クラスターのデータを負荷分散
- オンラインでクラスターをアップグレード
- ページ上でクラスター構成を変更
- クラスターノードの監視とZookeeperの監視を提供
- テーブルおよびパーティションの状態、遅いSQLステートメントを監視
- 使用しやすいSQL実行ページを提供
