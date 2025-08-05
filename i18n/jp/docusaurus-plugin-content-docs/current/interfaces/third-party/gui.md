---
description: 'ClickHouse と連携するサードパーティー製 GUI ツールとアプリケーションのリスト'
sidebar_label: 'ビジュアルインタフェース'
sidebar_position: 28
slug: '/interfaces/third-party/gui'
title: 'サードパーティー開発者によるビジュアルインターフェース'
---





# 第三者開発者によるビジュアルインターフェース

## オープンソース {#open-source}

### agx {#agx}

[agx](https://github.com/agnosticeng/agx) は、ClickHouse の埋め込まれたデータベースエンジン (chdb) を使用してデータを探索およびクエリするためのモダンなインターフェースを提供する、Tauri と SvelteKit で構築されたデスクトップアプリケーションです。

- ネイティブアプリケーション実行時に ch-db を活用。
- ウェブインスタンスを実行しているときに Clickhouse インスタンスに接続できます。
- モナコエディタで、親しみやすいインターフェースを提供。
- 複数の進化するデータビジュアライゼーション。

### ch-ui {#ch-ui}

[ch-ui](https://github.com/caioricciuti/ch-ui)は、ClickHouse データベース用に設計されたシンプルな React.js アプリインターフェースで、クエリを実行し、データを視覚化するためのものです。React と ClickHouse クライアントを使用して構築されており、データベースとの簡単なインタラクションのための洗練されたユーザーフレンドリーな UI を提供します。

機能:

- ClickHouse 統合: 接続を簡単に管理し、クエリを実行します。
- レスポンシブタブ管理: クエリタブやテーブルタブなど、複数のタブを動的に扱います。
- パフォーマンス最適化: 効率的なキャッシングと状態管理のために Indexed DB を利用。
- ローカルデータストレージ: すべてのデータはブラウザにローカルに保存され、他の場所にデータが送信されないことを保証します。

### ChartDB {#chartdb}

[ChartDB](https://chartdb.io) は、ClickHouse を含むデータベーススキーマを単一のクエリで視覚化および設計するための無料でオープンソースのツールです。React で構築されており、シームレスでユーザーフレンドリーな体験を提供し、データベースの資格情報やサインアップなしですぐに始められます。

機能:

- スキーマ視覚化: ClickHouse スキーマを瞬時にインポートして視覚化し、マテリアライズドビューと標準ビューを含む ER 図でテーブルを参照できます。
- AI 搭載 DDL エクスポート: スキーマ管理と文書化をより良くするための DDL スクリプトを手軽に生成します。
- マルチ SQL 方言サポート: 様々なデータベース環境に対応した SQL 方言に互換性があります。
- サインアップや資格情報なしで利用可能: すべての機能はブラウザで直接アクセスでき、摩擦がなく、安全です。

[ChartDB ソースコード](https://github.com/chartdb/chartdb)。

### ClickHouse スキーマフロー ビジュアライザー {#clickhouse-schemaflow-visualizer}

Mermaid.js ダイアグラムを使用して ClickHouse テーブルの関係を視覚化するための強力なウェブアプリケーションです。

機能:

- 直感的なインターフェースで ClickHouse データベースとテーブルをブラウズ
- Mermaid.js ダイアグラムでテーブルの関係を視覚化
- テーブル間のデータフローの方向を表示
- ダイアグラムをスタンドアロン HTML ファイルとしてエクスポート
- TLS サポートを使用した ClickHouse への安全な接続
- すべてのデバイス向けのレスポンシブウェブインターフェース

[ClickHouse スキーマフロー ビジュアライザー - ソースコード](https://github.com/FulgerX2007/clickhouse-schemaflow-visualizer)

### Tabix {#tabix}

[Tabix](https://github.com/tabixio/tabix) プロジェクトの ClickHouse 用ウェブインターフェースです。

機能:

- 追加のソフトウェアをインストールすることなく、ブラウザから ClickHouse に直接アクセスします。
- 構文強調表示を持つクエリエディタ。
- コマンドの自動補完機能。
- クエリ実行のグラフィカル分析ツール。
- カラースキームオプション。

[Tabix ドキュメント](https://tabix.io/doc/)。

### HouseOps {#houseops}

[HouseOps](https://github.com/HouseOps/HouseOps) は、OSX、Linux、および Windows 用の UI/IDE です。

機能:

- 構文強調表示を持つクエリビルダー。応答をテーブルまたは JSON ビューで表示します。
- クエリ結果を CSV または JSON 形式でエクスポートします。
- 説明付きプロセスのリスト。書き込みモード。プロセスを停止する能力（`KILL`）。
- データベースグラフ。すべてのテーブルとそのカラムを追加情報とともに表示します。
- カラムサイズのクイックビュー。
- サーバー設定。

今後の開発計画:

- データベース管理。
- ユーザー管理。
- リアルタイムデータ分析。
- クラスター監視。
- クラスター管理。
- 複製されたテーブルと Kafka テーブルの監視。

### LightHouse {#lighthouse}

[LightHouse](https://github.com/VKCOM/lighthouse) は、ClickHouse 用の軽量ウェブインターフェースです。

機能:

- フィルタリングとメタデータのあるテーブルリスト。
- フィルタリングとソートのあるテーブルプレビュー。
- 読み取り専用のクエリ実行。

### Redash {#redash}

[Redash](https://github.com/getredash/redash) は、データビジュアライゼーションのプラットフォームです。

ClickHouse を含む複数のデータソースをサポートしており、Redash は異なるデータソースからのクエリ結果を一つの最終データセットに結合できます。

機能:

- 強力なクエリエディタ。
- データベースエクスプローラー。
- データをさまざまな形式で表現するためのビジュアライゼーションツール。

### Grafana {#grafana}

[Grafana](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/) は、監視とビジュアライゼーションのプラットフォームです。

「Grafana は、格納場所にかかわらずメトリックをクエリ、視覚化、アラート発信、および理解することを可能にします。ダッシュボードを作成、探索、共有し、データに基づく文化を育みます。コミュニティから信頼され、愛されています」 &mdash; grafana.com。

ClickHouse データソースプラグインは、バックエンドデータベースとして ClickHouse をサポートします。

### qryn {#qryn}

[qryn](https://metrico.in) は、ClickHouse 用の多言語対応の高性能観測スタック _(以前の cLoki)_ で、Grafana のネイティブ統合により、ユーザーは Loki/LogQL、Prometheus/PromQL、OTLP/Tempo、Elastic、InfluxDB などの任意のエージェントからログ、メトリック、テレメトリートレースを取り込み、分析できます。

機能:

- データのクエリ、抽出、視覚化のための内蔵探査 UI と LogQL CLI
- プラグインなしでクエリ、処理、取り込み、トレース、アラートのためのネイティブ Grafana API サポート
- ログ、イベント、トレースなどからデータを動的に検索、フィルタリング、抽出するための強力なパイプライン
- LogQL、PromQL、InfluxDB、Elastic などに透過的に互換性のある取り込みおよび PUSH API
- Promtail、Grafana-Agent、Vector、Logstash、Telegraf などのエージェントと簡単に使用できます。

### DBeaver {#dbeaver}

[DBeaver](https://dbeaver.io/) - ClickHouse をサポートするユニバーサルデスクトップデータベースクライアントです。

機能:

- 構文ハイライトとオートコンプリートによるクエリ開発。
- フィルターとメタデータ検索を備えたテーブルリスト。
- テーブルデータのプレビュー。
- フルテキスト検索。

デフォルトでは、DBeaver はセッションを使って接続しません（CLI はその例です）。セッションサポートが必要な場合（例えば、セッションの設定を行うため）には、ドライバー接続プロパティを編集して `session_id` をランダムな文字列に設定します（内部で http 接続を使用します）。その後、クエリウィンドウから任意の設定を使用できます。

### clickhouse-cli {#clickhouse-cli}

[clickhouse-cli](https://github.com/hatarist/clickhouse-cli) は、Python 3 で記述された ClickHouse の代替コマンドラインクライアントです。

機能:

- 自動補完。
- クエリとデータ出力の構文強調表示。
- データ出力のためのページャーサポート。
- PostgreSQL のようなカスタムコマンド。

### clickhouse-flamegraph {#clickhouse-flamegraph}

[clickhouse-flamegraph](https://github.com/Slach/clickhouse-flamegraph) は、`system.trace_log` を [flamegraph](http://www.brendangregg.com/flamegraphs.html) として視覚化する専門ツールです。

### clickhouse-plantuml {#clickhouse-plantuml}

[cickhouse-plantuml](https://pypi.org/project/clickhouse-plantuml/) は、テーブルスキーマの [PlantUML](https://plantuml.com/) ダイアグラムを生成するスクリプトです。

### ClickHouse テーブルグラフ {#clickhouse-table-graph}

[ClickHouse テーブルグラフ](https://github.com/mbaksheev/clickhouse-table-graph) は、ClickHouse テーブル間の依存関係を視覚化するためのシンプルな CLI ツールです。このツールは、`system.tables` テーブルからテーブル間の接続を取得し、[mermaid](https://mermaid.js.org/syntax/flowchart.html) 形式で依存関係のフローチャートを構築します。このツールを使用すると、テーブルの依存関係を簡単に視覚化し、ClickHouse データベース内のデータフローを理解できます。mermaid を使用することにより、生成されたフローチャートは魅力的に見え、Markdown ドキュメントに簡単に追加できます。

### xeus-clickhouse {#xeus-clickhouse}

[xeus-clickhouse](https://github.com/wangfenjin/xeus-clickhouse) は、Jupyter で SQL を使用して CH データをクエリすることをサポートする ClickHouse 用の Jupyter カーネルです。

### MindsDB Studio {#mindsdb}

[MindsDB](https://mindsdb.com/) は、ClickHouse を含むデータベース用のオープンソースの AI 層で、最先端の機械学習モデルを簡単に開発、トレーニング、展開できます。MindsDB Studio(GUI) は、データベースから新しいモデルをトレーニングし、モデルによって作成された予測を解釈し、潜在的なデータバイアスを特定し、Explainable AI 機能を使用してモデルの精度を評価、視覚化し、機械学習モデルを迅速に適応、調整できます。

### DBM {#dbm}

[DBM](https://github.com/devlive-community/dbm) DBM は、ClickHouse 用のビジュアル管理ツールです！

機能:

- クエリ履歴のサポート（ページネーション、すべてクリアなど）
- 選択した SQL 句のクエリをサポート
- クエリの中止をサポート
- テーブル管理のサポート（メタデータ、削除、プレビュー）
- データベース管理のサポート（削除、作成）
- カスタムクエリのサポート
- 複数データソースの管理（接続テスト、監視）をサポート
- 監視（プロセッサ、接続、クエリ）をサポート
- データ移行のサポート

### Bytebase {#bytebase}

[Bytebase](https://bytebase.com) は、チーム向けのウェブベースのオープンソーススキーマ変更およびバージョン管理ツールです。ClickHouse を含むさまざまなデータベースをサポートしています。

機能:

- 開発者と DBA の間のスキーマレビュー。
- Database-as-Code、VCS でスキーマをバージョン管理し、コードコミット時にデプロイをトリガーします。
- 環境ごとのポリシーによる簡素化されたデプロイ。
- 完全な移行履歴。
- スキーマのドリフト検出。
- バックアップと復元。
- RBAC。

### Zeppelin-Interpreter-for-ClickHouse {#zeppelin-interpreter-for-clickhouse}

[Zeppelin-Interpreter-for-ClickHouse](https://github.com/SiderZhang/Zeppelin-Interpreter-for-ClickHouse) は、ClickHouse のための [Zeppelin](https://zeppelin.apache.org) インタープリターです。JDBC インタープリターと比較して、長時間実行されるクエリに対するタイムアウト制御を提供できます。

### ClickCat {#clickcat}

[ClickCat](https://github.com/clickcat-project/ClickCat) は、ClickHouse データを検索、探索、視覚化するためのフレンドリーなユーザーインターフェースです。

機能:

- SQL コードをインストールせずに実行できるオンライン SQL エディタ。
- すべてのプロセスとミューテーションを観察できます。未完了のプロセスについては、UI でそれらを終了できます。
- メトリックスにはクラスタ分析、データ分析、クエリ分析が含まれます。

### ClickVisual {#clickvisual}

[ClickVisual](https://clickvisual.net/) ClickVisual は、軽量なオープンソースのログクエリ、分析およびアラーム視覚化プラットフォームです。

機能:

- 分析ログライブラリのワンクリック作成をサポート
- ログ収集構成管理をサポート
- ユーザー定義のインデックス構成をサポート
- アラーム構成をサポート
- ライブラリおよびテーブルの権限構成に対する権限の粒度をサポート

### ClickHouse-Mate {#clickmate}

[ClickHouse-Mate](https://github.com/metrico/clickhouse-mate) は、ClickHouse 内のデータを検索、探索するための Angular ウェブクライアント + ユーザーインターフェースです。

機能:

- ClickHouse SQL クエリの自動補完
- データベースとテーブルのツリーナビゲーションを迅速に行う
- 高度な結果フィルタリングとソート
- インライン ClickHouse SQL ドキュメント
- クエリのプリセットと履歴
- 100% ブラウザベースで、サーバー/バックエンドなし

クライアントは、Github Pages を通じて即座に使用可能です: https://metrico.github.io/clickhouse-mate/

### Uptrace {#uptrace}

[Uptrace](https://github.com/uptrace/uptrace) は、OpenTelemetry と ClickHouse によって駆動される分散トレーシングとメトリックを提供する APM ツールです。

機能:

- [OpenTelemetry トレース](https://uptrace.dev/opentelemetry/distributed-tracing.html)、メトリック、およびログ。
- AlertManager を使用したメール/Slack/PagerDuty の通知。
- スパンを集約するための SQL ライクなクエリ言語。
- メトリックを照会するための Promql ライクな言語。
- プリビルドされたメトリックダッシュボード。
- YAML 構成を介した複数のユーザー/プロジェクト。

### clickhouse-monitoring {#clickhouse-monitoring}

[clickhouse-monitoring](https://github.com/duyet/clickhouse-monitoring) は、`system.*` テーブルに依存して、ClickHouse クラスターの監視と概要を提供するシンプルな Next.js ダッシュボードです。

機能:

- クエリモニター: 現在のクエリ、クエリ履歴、クエリリソース（メモリ、読み取ったパーツ、ファイルオープンなど）、最も高価なクエリ、最も使用されるテーブルまたはカラムなど。
- クラスターモニター: 総メモリ/CPU 使用率、分散キュー、グローバル設定、mergetree 設定、メトリックなど。
- テーブルおよびパーツ情報: サイズ、行数、圧縮、パーツサイズなど、カラムレベルの詳細。
- 有用なツール: Zookeeper データ探索、クエリ EXPLAIN、クエリの終了など。
- メトリックチャートの視覚化: クエリとリソース使用量、マージ/ミューテーションの数、マージパフォーマンス、クエリパフォーマンスなど。

### CKibana {#ckibana}

[CKibana](https://github.com/TongchengOpenSource/ckibana) は、Kibana のネイティブ UI を使用して ClickHouse データを検索、探索、視覚化するための軽量サービスです。

機能:

- ネイティブ Kibana UI からのチャートリクエストを ClickHouse クエリ構文に変換。
- クエリパフォーマンスを向上させるためのサンプリングやキャッシングなどの高度な機能をサポート。
- ElasticSearch から ClickHouse への移行後、ユーザーの学習コストを最小限に抑えます。

## 商業 {#commercial}

### DataGrip {#datagrip}

[DataGrip](https://www.jetbrains.com/datagrip/) は、ClickHouse に特化した JetBrains のデータベース IDE です。他の IntelliJ ベースのツール（PyCharm、IntelliJ IDEA、GoLand、PhpStorm など）にも組み込まれています。

機能:

- 非常に迅速なコード補完。
- ClickHouse 構文ハイライト。
- ネストされたカラム、テーブルエンジンなど、ClickHouse 特有の機能をサポートします。
- データエディタ。
- リファクタリング。
- 検索とナビゲーション。

### Yandex DataLens {#yandex-datalens}

[Yandex DataLens](https://cloud.yandex.ru/services/datalens) は、データビジュアライゼーションと分析のサービスです。

機能:

- 簡単な棒グラフから複雑なダッシュボードまで、幅広いビジュアライゼーションが利用可能。
- ダッシュボードを公開することができます。
- ClickHouse を含む複数のデータソースをサポート。
- ClickHouse に基づいたマテリアライズされたデータのストレージ。

DataLens は、低負荷プロジェクトに対して[無料](https://cloud.yandex.com/docs/datalens/pricing)で提供され、商業利用も可能です。

- [DataLens ドキュメント](https://cloud.yandex.com/docs/datalens/)。
- [チュートリアル](https://cloud.yandex.com/docs/solutions/datalens/data-from-ch-visualization) ClickHouse データベースからのデータを視覚化する方法。

### Holistics Software {#holistics-software}

[Holistics](https://www.holistics.io/) は、フルスタックデータプラットフォームおよびビジネスインテリジェンスツールです。

機能:

- 自動メール、Slack、および Google Sheet のレポートスケジュール。
- ビジュアライゼーション、バージョン管理、自動補完、再利用可能なクエリコンポーネント、動的フィルタを備えた SQL エディタ。
- iframe を介したレポートとダッシュボードの組み込み分析。
- データ準備と ETL 機能。
- データのリレーショナルマッピングのための SQL データモデリングサポート。

### Looker {#looker}

[Looker](https://looker.com) は、ClickHouse を含む 50 以上のデータベース方言をサポートするデータプラットフォームおよびビジネスインテリジェンスツールです。Looker は SaaS プラットフォームおよびセルフホスト型で利用可能です。ユーザーはブラウザを介して Looker を使用してデータを探索し、ビジュアライゼーションとダッシュボードを構築し、レポートをスケジュールし、同僚と洞察を共有できます。Looker には、これらの機能を他のアプリケーションに埋め込むための豊富なツールセットが存在し、他のアプリケーションとデータを統合するための API も提供しています。

機能:

- キュレーションされた[データモデリング](https://looker.com/platform/data-modeling)をサポートする LookML という言語を用いて、簡単で敏捷な開発が可能です。
- Looker の [データアクション](https://looker.com/platform/actions) を介した強力なワークフロー統合。

[Looker で ClickHouse を設定する方法。](https://docs.looker.com/setup-and-management/database-config/clickhouse)

### SeekTable {#seektable}

[SeekTable](https://www.seektable.com) は、データ探索と操作報告のためのセルフサービス BI ツールです。クラウドサービスおよびセルフホスト型のバージョンが利用可能です。SeekTable からのレポートは、任意のウェブアプリに埋め込むことができます。

機能:

- ビジネスユーザー向けのレポートビルダー。
- SQL フィルタリングとレポート特有のクエリカスタマイズのための強力なレポートパラメーター。
- ネイティブ TCP/IP エンドポイントおよび HTTP(S) インターフェースの両方で ClickHouse に接続可能（2 つの異なるドライバー）。
- 次元/測定定義で ClickHouse SQL 方言の力をすべて使用できます。
- [Web API](https://www.seektable.com/help/web-api-integration) による自動レポート生成。
- アカウントデータの[バックアップ/復元](https://www.seektable.com/help/self-hosted-backup-restore)でレポート開発フローをサポート；データモデル（キューブ）/レポートの構成は人間が読める XML であり、バージョン管理システムに保存できます。

SeekTable は、個人/個々の使用に対して[無料](https://www.seektable.com/help/cloud-pricing)です。

[SeekTable で ClickHouse 接続を設定する方法。](https://www.seektable.com/help/clickhouse-pivot-table)

### Chadmin {#chadmin}

[Chadmin](https://github.com/bun4uk/chadmin) は、ClickHouse クラスターで現在実行中のクエリやその情報を視覚化し、必要に応じてそれらを終了させることができるシンプルな UI です。

### TABLUM.IO {#tablum_io}

[TABLUM.IO](https://tablum.io/) — ETL とビジュアライゼーションのためのオンラインクエリおよび分析ツールです。ClickHouse に接続し、多様な SQL コンソールを使用してデータをクエリしたり、静的ファイルやサードパーティサービスからデータをロードしたりできます。TABLUM.IO は、データ結果をチャートやテーブルとして視覚化できます。

機能:
- ETL: 人気のデータベース、ローカルおよびリモートファイル、API 呼び出しからのデータロード。
- 構文強調表示および視覚クエリビルダーを備えた多様な SQL コンソール。
- チャートおよびテーブルとしてのデータ視覚化。
- データのマテリアライズとサブクエリ。
- Slack、Telegram、電子メールへのデータ報告。
- 独自 API を介したデータパイプライン。
- JSON、CSV、SQL、HTML 形式でのデータエクスポート。
- ウェブベースのインターフェース。

TABLUM.IO は、セルフホストソリューション（Docker イメージとして）またはクラウドで実行できます。
ライセンス: [商業](https://tablum.io/pricing)製品で、3 ヶ月間の無料期間があります。

クラウドで無料でお試しください [こちらから](https://tablum.io/try)。
製品の詳細については [TABLUM.IO](https://tablum.io/) でご確認ください。

### CKMAN {#ckman}

[CKMAN](https://www.github.com/housepower/ckman) は、ClickHouse クラスターの管理と監視のためのツールです！

機能:

- ブラウザインターフェースを介してクラスターを迅速かつ便利に自動展開
- クラスターをスケールまたは縮小可能
- クラスターのデータを負荷分散
- クラスターをオンラインでアップグレード
- ページ上でクラスター設定の変更
- クラスター ノード監視と Zookeeper 監視を提供
- テーブルとパーティションのステータスを監視し、遅い SQL 文を監視
- 統一された SQL 実行ページを提供
