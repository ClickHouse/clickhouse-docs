---
'description': 'ClickHouseと連携するサードパーティのGUIツールおよびアプリケーションのリスト'
'sidebar_label': 'Visual Interfaces'
'sidebar_position': 28
'slug': '/interfaces/third-party/gui'
'title': 'サードパーティ開発者による視覚的インターフェース'
'doc_type': 'reference'
---


# サードパーティ開発者によるビジュアルインターフェース

## オープンソース {#open-source}

### agx {#agx}

[agx](https://github.com/agnosticeng/agx) は、ClickHouseの組み込みデータベースエンジン (chdb) を使用してデータを探索およびクエリするためのモダンなインターフェースを提供する、TauriとSvelteKitを使用して構築されたデスクトップアプリケーションです。

- ネイティブアプリケーションを実行する際にch-dbを活用。
- ウェブインスタンスを実行しているときにClickHouseインスタンスに接続可能。
- モナコエディタを使用しているので、使い慣れた感じを保つことができます。
- 複数の進化するデータビジュアライゼーション。

### ch-ui {#ch-ui}

[ch-ui](https://github.com/caioricciuti/ch-ui) は、ClickHouseデータベース向けに設計されたシンプルなReact.jsアプリインターフェースで、クエリを実行しデータを可視化します。Reactとウェブ用のClickHouseクライアントを使用して構築されており、データベースとのインタラクションを容易にするスリークでユーザーフレンドリーなUIを提供します。

機能:

- ClickHouse統合: 簡単に接続を管理し、クエリを実行。
- レスポンシブタブ管理: クエリタブやテーブルタブなど、複数のタブを動的に管理。
- パフォーマンス最適化: 効率的なキャッシングと状態管理のためにIndexed DBを利用。
- ローカルデータストレージ: すべてのデータはブラウザ内にローカルに保存され、他の場所には送信されないことを保証。

### ChartDB {#chartdb}

[ChartDB](https://chartdb.io) は、単一のクエリでClickHouseを含むデータベーススキーマを視覚化および設計するための無料でオープンソースのツールです。Reactで構築されており、データベース資格情報やサインアップなしですぐに始められるシームレスでユーザーフレンドリーな体験を提供します。

機能:

- スキーマビジュアライゼーション: ClickHouseスキーマを瞬時にインポートし、マテリアライズドビューや標準ビューを含むER図を視覚化し、テーブルへの参照を表示。
- AI駆動のDDLエクスポート: スキーマ管理とドキュメントの向上のためにDDLスクリプトを簡単に生成。
- マルチSQL方言サポート: 様々なデータベース環境に対応する多様性。
- サインアップまたは資格情報不要: すべての機能はブラウザ内で直接アクセス可能で、ストレスフリーで安全。

[ChartDBソースコード](https://github.com/chartdb/chartdb)。

### DataPup {#datapup}

[DataPup](https://github.com/DataPupOrg/DataPup) は、ネイティブのClickHouseサポートを持つモダンでAI支援のクロスプラットフォームデータベースクライアントです。

機能:

- インテリジェントな提案によるAI駆動のSQLクエリ支援
- セキュアな資格情報処理を伴うネイティブClickHouse接続サポート
- 複数のテーマ（ライト、ダーク、カラフルバリエーション）を持つ美しいアクセス可能なインターフェース
- 高度なクエリ結果フィルタリングと探索
- クロスプラットフォームサポート (macOS、Windows、Linux)
- 高速で応答性の高いパフォーマンス
- オープンソースおよびMITライセンス

### ClickHouseスキーマフロー可視化ツール {#clickhouse-schemaflow-visualizer}

[ClickHouseスキーマフロー可視化ツール](https://github.com/FulgerX2007/clickhouse-schemaflow-visualizer) は、Mermaid.jsダイアグラムを使用してClickHouseテーブル関係を視覚化するための強力なオープンソースのWebアプリケーションです。直感的なインターフェースでデータベースやテーブルをブラウズし、行数やサイズ情報のオプションを持つテーブルメタデータを探求し、インタラクティブなスキーマダイアグラムをエクスポートします。

機能:

- 直感的なインターフェースでClickHouseデータベースとテーブルをブラウズ
- Mermaid.jsダイアグラムを使用してテーブルの関係を視覚化
- より良い視覚化のためのテーブルタイプにマッチする色分けされたアイコン
- テーブル間のデータフローの方向を表示
- ダイアグラムを独立したHTMLファイルとしてエクスポート
- メタデータの可視性をトグル (テーブル行とサイズ情報)
- TLSサポートを利用したClickHouseへの安全な接続
- すべてのデバイス向けのレスポンシブウェブインターフェース

[ClickHouseスキーマフロー可視化ツール - ソースコード](https://github.com/FulgerX2007/clickhouse-schemaflow-visualizer)

### Tabix {#tabix}

Webインターフェースは、[Tabix](https://github.com/tabixio/tabix)プロジェクト用のClickHouse向けです。

機能:

- 追加のソフトウェアをインストールすることなく、ブラウザから直接ClickHouseと連携。
- 構文ハイライト付きのクエリエディタ。
- コマンドの自動補完。
- クエリ実行のグラフィカル分析のためのツール。
- カラースキームオプション。

[Tabixドキュメント](https://tabix.io/doc/)。

### HouseOps {#houseops}

[HouseOps](https://github.com/HouseOps/HouseOps) は、OSX、Linux、Windows用の UI/IDE です。

機能:

- 構文ハイライト付きのクエリビルダー。レスポンスをテーブルまたはJSONビューで表示。
- クエリ結果をCSVまたはJSONとしてエクスポート。
- 説明付きのプロセスリスト。書き込みモード。プロセスを停止する能力 (`KILL`)。
- データベースグラフ。すべてのテーブルとそのカラムに関する追加情報を表示。
- カラムサイズのクイックビュー。
- サーバー設定。

以下の機能が開発予定です:

- データベース管理。
- ユーザー管理。
- リアルタイムデータ分析。
- クラスタ監視。
- クラスタ管理。
- レプリケートされたテーブルおよびKafkaテーブルの監視。

### LightHouse {#lighthouse}

[LightHouse](https://github.com/VKCOM/lighthouse) は、ClickHouseのための軽量なWebインターフェースです。

機能:

- フィルタリングおよびメタデータ付きのテーブルリスト。
- フィルタリングおよびソートのテーブルプレビュー。
- 読み取り専用のクエリ実行。

### Redash {#redash}

[Redash](https://github.com/getredash/redash) は、データビジュアライゼーションのプラットフォームです。

ClickHouseを含む複数のデータソースをサポートしており、Redashは異なるデータソースからのクエリ結果を1つの最終データセットに結合できます。

機能:

- 強力なクエリエディタ。
- データベースエクスプローラー。
- データをさまざまな形式で表現するビジュアライゼーションツール。

### Grafana {#grafana}

[Grafana](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/) は、監視とビジュアライゼーションのためのプラットフォームです。

「Grafanaは、保存先に関係なく、メトリクスをクエリし、視覚化し、アラートを生成し、理解を深めることができます。チームとダッシュボードを作成、探索、共有し、データドリブンな文化を育てましょう。コミュニティに信頼され、愛されています」 – grafana.com。

ClickHouseデータソースプラグインは、ClickHouseをバックエンドデータベースとしてサポートします。

### qryn {#qryn}

[qryn](https://metrico.in) は、ClickHouseのための多言語で高性能な可観測性スタック _(以前のcLoki)_ で、Loki/LogQL、Prometheus/PromQL、OTLP/Tempo、Elastic、InfluxDBなど、任意のエージェントからログ、メトリクス、テレメトリトレースを取り込み、分析するためのネイティブGrafana統合を提供します。

機能:

- データをクエリ、抽出、視覚化するための組み込みのExplore UIとLogQL CLI
- プラグインなしでクエリ、処理、取り込み、トレース、アラートを行うためのネイティブGrafana APIサポート
- ログ、イベント、トレースなどからデータを動的に検索、フィルタリング、抽出する強力なパイプライン
- LogQL、PromQL、InfluxDB、Elasticなどと透過的に互換性のある取り込みとPUSH API
- Promtail、Grafana-Agent、Vector、Logstash、Telegrafなどのエージェントで使用可能

### DBeaver {#dbeaver}

[DBeaver](https://dbeaver.io/) - ClickHouseサポートを持つユニバーサルデスクトップデータベースクライアントです。

機能:

- 構文ハイライトとオートコンプリートによるクエリ開発。
- フィルターおよびメタデータ検索を含むテーブルリスト。
- テーブルデータのプレビュー。
- フルテキスト検索。

デフォルトで、DBeaverはセッションを使用して接続しません (例えばCLIはそうします)。セッションサポートが必要な場合 (例えばセッションの設定を行うため)、ドライバー接続プロパティを編集し、`session_id`をランダムな文字列に設定してください (内部でHTTP接続を使用します)。その後、クエリウィンドウから任意の設定を使用できます。

### clickhouse-cli {#clickhouse-cli}

[clickhouse-cli](https://github.com/hatarist/clickhouse-cli) は、Python 3で書かれたClickHouseの代替コマンドラインクライアントです。

機能:

- 自動補完。
- クエリとデータ出力の構文ハイライト。
- データ出力のためのページャーサポート。
- PostgreSQLに似たカスタムコマンド。

### clickhouse-flamegraph {#clickhouse-flamegraph}

[clickhouse-flamegraph](https://github.com/Slach/clickhouse-flamegraph) は、`system.trace_log`を [flamegraph](http://www.brendangregg.com/flamegraphs.html) として視覚化するための専門ツールです。

### clickhouse-plantuml {#clickhouse-plantuml}

[cickhouse-plantuml](https://pypi.org/project/clickhouse-plantuml/) は、テーブルスキームの [PlantUML](https://plantuml.com/) ダイアグラムを生成するスクリプトです。

### ClickHouseテーブルグラフ {#clickhouse-table-graph}

[ClickHouseテーブルグラフ](https://github.com/mbaksheev/clickhouse-table-graph) は、ClickHouseテーブル間の依存関係を視覚化するためのシンプルなCLIツールです。このツールは`system.tables`テーブルからテーブル間の接続を取得し、[mermaid](https://mermaid.js.org/syntax/flowchart.html)形式で依存関係のフローチャートを構築します。このツールを使用すると、テーブルの依存関係を簡単に視覚化し、ClickHouseデータベース内のデータフローを理解できます。mermaidのおかげで、生成されたフローチャートは魅力的で、マークダウンドキュメントに簡単に追加できます。

### xeus-clickhouse {#xeus-clickhouse}

[xeus-clickhouse](https://github.com/wangfenjin/xeus-clickhouse) は、JupyterでSQLを使用してCHデータをクエリするためのClickHouse用Jupyterカーネルです。

### MindsDB Studio {#mindsdb}

[MindsDB](https://mindsdb.com/) は、ClickHouseを含むデータベースのためのオープンソースのAIレイヤーです。機械学習モデルを容易に開発、トレーニング、およびデプロイできます。MindsDB Studio(GUI)は、データベースから新しいモデルをトレーニングし、モデルが行う予測を解釈し、潜在的なデータバイアスを特定し、Explainable AI機能を使用してモデルの精度を評価および視覚化することを可能にします。

### DBM {#dbm}

[DBM](https://github.com/devlive-community/dbm) DBMはClickHouse用の視覚管理ツールです！

機能:

- クエリ履歴のサポート (ページネーション、すべてクリアなど)
- 選択したSQL条項のクエリをサポート
- クエリの終了をサポート
- テーブル管理のサポート (メタデータ、削除、プレビュー)
- データベース管理のサポート (削除、作成)
- カスタムクエリのサポート
- 複数のデータソース管理のサポート (接続テスト、監視)
- モニタリングのサポート (プロセス、接続、クエリ)
- データ移行のサポート

### Bytebase {#bytebase}

[Bytebase](https://bytebase.com) は、チーム向けのウェブベースのオープンソーススキーマ変更およびバージョン管理ツールです。ClickHouseを含むさまざまなデータベースをサポートしています。

機能:

- 開発者とDBAの間でのスキーマレビュー。
- Database-as-Code、VCS（GitLabなど）でのスキーマのバージョン管理とコードコミット時のデプロイメントトリガー。
- 環境ごとのポリシーによる簡素化されたデプロイメント。
- 完全なマイグレーション履歴。
- スキーマドリフト検出。
- バックアップと復元。
- RBAC。

### Zeppelin-Interpreter-for-ClickHouse {#zeppelin-interpreter-for-clickhouse}

[Zeppelin-Interpreter-for-ClickHouse](https://github.com/SiderZhang/Zeppelin-Interpreter-for-ClickHouse) は、ClickHouse用の [Zeppelin](https://zeppelin.apache.org) インタープリターです。JDBCインタープリターと比較して、長時間実行されるクエリのタイムアウト制御がより優れています。

### ClickCat {#clickcat}

[ClickCat](https://github.com/clickcat-project/ClickCat) は、ClickHouseデータを検索、探索、視覚化するためのフレンドリーなユーザーインターフェースです。

機能:

- SQLコードをインストールなしで実行できるオンラインSQLエディタ。
- すべてのプロセスと変異を観察できます。未完了のプロセスについては、UI上でそれらを終了することができます。
- メトリクスには、クラスター分析、データ分析、クエリ分析が含まれます。

### ClickVisual {#clickvisual}

[ClickVisual](https://clickvisual.net/) ClickVisualは、ログクエリ、分析、およびアラームの視覚化プラットフォームとして軽量なオープンソースです。

機能:

- 分析ログライブラリのワンクリック作成をサポート
- ログ収集構成管理をサポート
- ユーザー定義のインデックス構成をサポート
- アラーム構成をサポート
- ライブラリとテーブル権限構成に対する権限の粒度をサポート

### ClickHouse-Mate {#clickmate}

[ClickHouse-Mate](https://github.com/metrico/clickhouse-mate) は、ClickHouse内のデータを検索および探索するためのAngularウェブクライアントとユーザーインターフェースです。

機能:

- ClickHouse SQLクエリの自動補完
- 高速なデータベースおよびテーブルツリーのナビゲーション
- 高度な結果のフィルタリングとソート
- インラインClickHouse SQLドキュメント
- クエリプリセットと履歴
- 100%ブラウザベースで、サーバー/バックエンド不要

クライアントは即時使用可能で、GitHubページからアクセスできます: https://metrico.github.io/clickhouse-mate/

### Uptrace {#uptrace}

[Uptrace](https://github.com/uptrace/uptrace) は、OpenTelemetryおよびClickHouseによって駆動される分散トレーシングとメトリクスのAPMツールです。

機能:

- [OpenTelemetryトレーシング](https://uptrace.dev/opentelemetry/distributed-tracing.html)、メトリクス、ログ。
- AlertManagerを使用してのメール/Slack/PagerDuty通知。
- スパンを集計するためのSQLライクなクエリ言語。
- メトリクスをクエリするためのPromqlライクな言語。
- 予め構築されたメトリクスダッシュボード。
- YAML設定を介した複数のユーザー/プロジェクト。

### clickhouse-monitoring {#clickhouse-monitoring}

[clickhouse-monitoring](https://github.com/duyet/clickhouse-monitoring) は、`system.*` テーブルを使用してClickHouseクラスターを監視し、概要を提供するシンプルなNext.jsダッシュボードです。

機能:

- クエリモニター: 現在のクエリ、クエリ履歴、クエリリソース (メモリ、読み取りパーツ、ファイルオープンなど)、最も高価なクエリ、最も使用されたテーブルまたはカラムなど。
- クラスターモニター: 総メモリ/CPU使用量、分散キュー、グローバル設定、mergetree設定、メトリクスなど。
- テーブルおよびパーツ情報: サイズ、行数、圧縮、パートサイズなどの列レベルの詳細。
- 有用なツール: Zookeeperデータの探索、クエリEXPLAIN、クエリの終了など。
- ビジュアライゼーションメトリックチャート: クエリおよびリソース使用、マージ/ミューテーションの数、マージパフォーマンス、クエリパフォーマンスなど。

### CKibana {#ckibana}

[CKibana](https://github.com/TongchengOpenSource/ckibana) は、ネイティブKibana UIを使用してClickHouseデータを簡単に検索、探索、視覚化できる軽量サービスです。

機能:

- ネイティブKibana UIからのチャート要求をClickHouseクエリ構文に変換します。
- クエリパフォーマンスを向上させるためのサンプリングやキャッシングなどの高度な機能をサポート。
- ElasticSearchからClickHouseへの移行後、ユーザーの学習コストを最小限に抑えます。

### Telescope {#telescope}

[Telescope](https://iamtelescope.net/) は、ClickHouseに保存されたログを探索するための現代的なWebインターフェースです。ログデータをクエリ、視覚化、および管理するためのユーザーフレンドリーなUIを提供し、細かいアクセス制御を伴います。

機能:

- 強力なフィルターとカスタマイズ可能なフィールド選択を伴うクリーンでレスポンシブなUI。
- 直感的で表現力豊かなログフィルタリングのためのFlyQL構文。
- ネストされたJSON、Map、Arrayフィールドを含むグループ化をサポートする時間ベースのグラフ。
- 高度なフィルタリングのためのオプションの生SQL `WHERE`クエリサポート (権限チェック付き)。
- 保存されたビュー: クエリとレイアウトのカスタムUI構成を永続化および共有。
- ロールベースのアクセス制御 (RBAC) およびGitHub認証統合。
- ClickHouse側に追加のエージェントやコンポーネントは不要。

[Telescope ソースコード](https://github.com/iamtelescope/telescope) · [ライブデモ](https://demo.iamtelescope.net)

## 商用 {#commercial}

### DataGrip {#datagrip}

[DataGrip](https://www.jetbrains.com/datagrip/) は、ClickHouseに専用のサポートを持つJetBrainsのデータベースIDEです。これは、他のIntelliJベースのツールにも埋め込まれています: PyCharm、IntelliJ IDEA、GoLand、PhpStormなど。

機能:

- 非常に高速なコード補完。
- ClickHouse構文のハイライト。
- ネストされたカラム、テーブルエンジンなど、ClickHouseに特有の機能をサポート。
- データエディタ。
- リファクタリング。
- 検索とナビゲーション。

### Yandex DataLens {#yandex-datalens}

[Yandex DataLens](https://cloud.yandex.ru/services/datalens) は、データビジュアライゼーションと分析のサービスです。

機能:

- シンプルな棒グラフから複雑なダッシュボードまで、幅広い利用可能なビジュアライゼーションを提供。
- ダッシュボードは公開可能。
- ClickHouseを含む複数のデータソースをサポート。
- ClickHouseに基づくマテリアライズされたデータのストレージ。

DataLensは、低負荷プロジェクトであれば商用利用でも[無料で利用可能](https://cloud.yandex.com/docs/datalens/pricing)です。

- [DataLensドキュメント](https://cloud.yandex.com/docs/datalens/)。
- [チュートリアル](https://cloud.yandex.com/docs/solutions/datalens/data-from-ch-visualization) ClickHouseデータベースからのデータの視覚化に関して。

### Holistics Software {#holistics-software}

[Holistics](https://www.holistics.io/) は、フルスタックデータプラットフォームおよびビジネスインテリジェンスツールです。

機能:

- 自動メール、Slack、Googleシートのレポートスケジュール。
- ビジュアライゼーション、バージョン管理、オートコンプリート、再利用可能なクエリコンポーネント、ダイナミックフィルタを備えたSQLエディタ。
- iframeを通じたレポートおよびダッシュボードの埋め込み分析。
- データ準備およびETL機能。
- データのリレーショナルマッピングのためのSQLデータモデリングサポート。

### Looker {#looker}

[Looker](https://looker.com) は、ClickHouseを含む50以上のデータベース方言のサポートを持つデータプラットフォームおよびビジネスインテリジェンスツールです。LookerはSaaSプラットフォームおよびセルフホステッドで提供されます。ユーザーはブラウザを介してLookerを使用してデータを探索し、ビジュアライゼーションやダッシュボードを構築し、レポートのスケジューリングを行い、洞察を同僚と共有できます。Lookerは、これらの機能を他のアプリケーションに埋め込むための豊富なツールセットを提供し、データを他のアプリケーションと統合するためのAPIも提供します。

機能:

- LookMLを使用した簡単かつ敏捷な開発。これは、報告書作成者およびエンドユーザーをサポートするために整理された[データモデリング](https://looker.com/platform/data-modeling)をサポートする言語です。
- Lookerの[データアクション](https://looker.com/platform/actions)を介した強力なワークフロー統合。

[ClickHouseをLookerに設定する方法。](https://docs.looker.com/setup-and-management/database-config/clickhouse)

### SeekTable {#seektable}

[SeekTable](https://www.seektable.com) は、データ探索と運用レポートのためのセルフサービスBIツールです。クラウドサービスとセルフホステッドバージョンの両方で提供されます。SeekTableからのレポートは、任意のWebアプリに埋込むことができます。

機能:

- ビジネスユーザー向けに使いやすいレポートビルダー。
- SQLフィルタリングとレポート特有のクエリカスタマイズのための強力なレポートパラメータ。
- ネイティブTCP/IPエンドポイントとHTTP(S)インターフェースの両方でClickHouseに接続可能 (2つの異なるドライバー)。
- 次元/計測定義においてClickHouse SQL方言のすべての力を使用可能。
- [Web API](https://www.seektable.com/help/web-api-integration)を使用して、自動レポート生成をサポート。
- アカウントデータの[バックアップ/復元](https://www.seektable.com/help/self-hosted-backup-restore)をサポートし、データモデル (キューブ)/レポート構成は人間が読み取れるXML形式でバージョン管理システムに格納可能。

SeekTableは[無料](https://www.seektable.com/help/cloud-pricing)で個人または個別の使用向けです。

[SeekTableにおけるClickHouse接続の設定方法。](https://www.seektable.com/help/clickhouse-pivot-table)

### Chadmin {#chadmin}

[Chadmin](https://github.com/bun4uk/chadmin) は、ClickHouseクラスターで現在実行中のクエリを視覚化し、それに関する情報を表示し、望む場合は終了できるシンプルなUIです。

### TABLUM.IO {#tablum_io}

[TABLUM.IO](https://tablum.io/) — ETLと視覚化のためのオンラインクエリおよび分析ツールです。ClickHouseに接続し、多様なSQLコンソールを介してデータをクエリし、静的ファイルやサードパーティサービスからデータを読み込むことができます。TABLUM.IOは、データ結果をチャートやテーブルとして視覚化できます。

機能:
- ETL: 人気のデータベース、ローカルおよびリモートファイル、API呼び出しからのデータの読み込み。
- 構文ハイライトおよび視覚的クエリビルダーを備えた多様なSQLコンソール。
- チャートおよびテーブルとしてのデータ視覚化。
- データの具現化およびサブクエリ。
- データのSlack、Telegram、またはメールへのレポート。
- 商用APIを介したデータパイプライン。
- JSON、CSV、SQL、HTML形式でのデータエクスポート。
- ウェブベースのインターフェース。

TABLUM.IOは、セルフホステッドソリューション（Dockerイメージとして）またはクラウドで実行可能です。
ライセンス: [商用](https://tablum.io/pricing)製品で、3ヶ月の無料期間があります。

無料で[クラウドで試してみる](https://tablum.io/try)。
製品の詳細は[TABLUM.IO](https://tablum.io/)で確認してください。

### CKMAN {#ckman}

[CKMAN](https://www.github.com/housepower/ckman) は、ClickHouseクラスターを管理し、監視するためのツールです！

機能:

- ブラウザインターフェースを通じた迅速で便利な自動クラスターデプロイメント
- クラスターのスケーリングまたはスケールダウン
- クラスターのデータの負荷分散
- クラスターをオンラインでアップグレード
- ページ上でクラスター設定を変更
- クラスターノードとZookeeperの監視を提供
- テーブルとパーティションの状態、および遅いSQLステートメントを監視します
