---
description: 'ClickHouse を操作するためのサードパーティ製 GUI ツールおよびアプリケーションの一覧'
sidebar_label: 'ビジュアルインターフェース'
sidebar_position: 28
slug: /interfaces/third-party/gui
title: 'サードパーティ製ビジュアルインターフェース'
doc_type: 'reference'
---



# サードパーティ開発者が提供するビジュアルインターフェース



## オープンソース {#open-source}

### agx {#agx}

[agx](https://github.com/agnosticeng/agx)は、TauriとSvelteKitで構築されたデスクトップアプリケーションで、ClickHouseの組み込みデータベースエンジン（chdb）を使用したデータの探索とクエリ実行のための最新のインターフェースを提供します。

- ネイティブアプリケーション実行時にch-dbを活用します。
- Webインスタンス実行時にClickHouseインスタンスに接続できます。
- Monacoエディタを採用しているため、使い慣れた環境で作業できます。
- 複数の進化するデータ可視化機能を提供します。

### ch-ui {#ch-ui}

[ch-ui](https://github.com/caioricciuti/ch-ui)は、クエリの実行とデータの可視化を目的として設計されたClickHouseデータベース用のシンプルなReact.jsアプリインターフェースです。ReactとClickHouse web用クライアントで構築されており、データベース操作を容易にする洗練されたユーザーフレンドリーなUIを提供します。

機能：

- ClickHouse統合：接続を簡単に管理し、クエリを実行できます。
- レスポンシブなタブ管理：クエリタブやテーブルタブなど、複数のタブを動的に処理します。
- パフォーマンス最適化：効率的なキャッシュと状態管理のためにIndexed DBを活用します。
- ローカルデータストレージ：すべてのデータはブラウザ内にローカルに保存され、他の場所にデータが送信されることはありません。

### ChartDB {#chartdb}

[ChartDB](https://chartdb.io)は、ClickHouseを含むデータベーススキーマを単一のクエリで可視化および設計するための無料のオープンソースツールです。Reactで構築されており、シームレスでユーザーフレンドリーな体験を提供し、開始するためにデータベース認証情報やサインアップは不要です。

機能：

- スキーマ可視化：ClickHouseスキーマを即座にインポートして可視化し、マテリアライズドビューや標準ビューを含むER図でテーブルへの参照を表示します。
- AI駆動のDDLエクスポート：スキーマ管理とドキュメント作成を改善するためのDDLスクリプトを簡単に生成します。
- 複数のSQL方言サポート：さまざまなSQL方言に対応しており、多様なデータベース環境に柔軟に対応します。
- サインアップや認証情報不要：すべての機能にブラウザから直接アクセスでき、摩擦がなく安全です。

[ChartDBソースコード](https://github.com/chartdb/chartdb)。

### DataPup {#datapup}

[DataPup](https://github.com/DataPupOrg/DataPup)は、ネイティブなClickHouseサポートを備えた、最新のAI支援クロスプラットフォームデータベースクライアントです。

機能：

- インテリジェントな提案を備えたAI駆動のSQLクエリ支援
- 安全な認証情報処理を備えたネイティブなClickHouse接続サポート
- 複数のテーマ（ライト、ダーク、カラフルなバリエーション）を備えた美しくアクセシブルなインターフェース
- 高度なクエリ結果のフィルタリングと探索
- クロスプラットフォームサポート（macOS、Windows、Linux）
- 高速でレスポンシブなパフォーマンス
- オープンソースでMITライセンス

### ClickHouse Schema Flow Visualizer {#clickhouse-schemaflow-visualizer}

[ClickHouse Schema Flow Visualizer](https://github.com/FulgerX2007/clickhouse-schemaflow-visualizer)は、Mermaid.js図を使用してClickHouseテーブルの関係を可視化するための強力なオープンソースWebアプリケーションです。直感的なインターフェースでデータベースとテーブルを閲覧し、オプションの行数とサイズ情報を含むテーブルメタデータを探索し、インタラクティブなスキーマ図をエクスポートできます。

機能：

- 直感的なインターフェースでClickHouseデータベースとテーブルを閲覧
- Mermaid.js図でテーブルの関係を可視化
- より良い可視化のためにテーブルタイプに対応した色分けされたアイコン
- テーブル間のデータフローの方向を表示
- スタンドアロンHTMLファイルとして図をエクスポート
- メタデータの表示切り替え（テーブルの行数とサイズ情報）
- TLSサポートによるClickHouseへの安全な接続
- すべてのデバイスに対応したレスポンシブなWebインターフェース

[ClickHouse Schema Flow Visualizer - ソースコード](https://github.com/FulgerX2007/clickhouse-schemaflow-visualizer)

### Tabix {#tabix}

[Tabix](https://github.com/tabixio/tabix)プロジェクトにおけるClickHouse用のWebインターフェース。

機能：

- 追加のソフトウェアをインストールすることなく、ブラウザから直接ClickHouseを操作できます。
- 構文ハイライト機能を備えたクエリエディタ。
- コマンドの自動補完。
- クエリ実行のグラフィカル分析ツール。
- カラースキームオプション。

[Tabixドキュメント](https://tabix.io/doc/)。

### HouseOps {#houseops}

[HouseOps](https://github.com/HouseOps/HouseOps)は、OSX、Linux、Windows用のUI/IDEです。

機能：

- 構文ハイライト機能を備えたクエリビルダー。レスポンスをテーブルまたはJSONビューで表示できます。
- クエリ結果をCSVまたはJSONとしてエクスポート。
- 説明付きのプロセスリスト。書き込みモード。プロセスを停止（`KILL`）する機能。
- データベースグラフ。すべてのテーブルとそのカラムを追加情報とともに表示します。
- カラムサイズのクイックビュー。
- サーバー設定。

以下の機能が開発予定です：

- データベース管理。
- ユーザー管理。
- リアルタイムデータ分析。
- クラスタ監視。
- クラスタ管理。
- レプリケートされたテーブルとKafkaテーブルの監視。

### LightHouse {#lighthouse}


[LightHouse](https://github.com/VKCOM/lighthouse)は、ClickHouse用の軽量なWebインターフェースです。

機能:

- フィルタリングとメタデータ表示機能を備えたテーブル一覧。
- フィルタリングとソート機能を備えたテーブルプレビュー。
- 読み取り専用のクエリ実行。

### Redash {#redash}

[Redash](https://github.com/getredash/redash)は、データ可視化のためのプラットフォームです。

ClickHouseを含む複数のデータソースをサポートしており、Redashは異なるデータソースからのクエリ結果を1つの最終データセットに結合できます。

機能:

- 強力なクエリエディタ。
- データベースエクスプローラ。
- データをさまざまな形式で表現できる可視化ツール。

### Grafana {#grafana}

[Grafana](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/)は、監視と可視化のためのプラットフォームです。

「Grafanaを使用すると、メトリクスがどこに保存されていても、クエリ、可視化、アラート、理解が可能です。チームとダッシュボードを作成、探索、共有し、データ駆動型の文化を育成します。コミュニティから信頼され、愛されています」&mdash; grafana.com。

ClickHouseデータソースプラグインは、バックエンドデータベースとしてClickHouseをサポートします。

### qryn {#qryn}

[qryn](https://metrico.in)は、ClickHouse用の多言語対応、高性能なオブザーバビリティスタック_(旧cLoki)_であり、ネイティブなGrafana統合により、Loki/LogQL、Prometheus/PromQL、OTLP/Tempo、Elastic、InfluxDBなどをサポートする任意のエージェントからログ、メトリクス、テレメトリトレースを取り込み、分析できます。

機能:

- データのクエリ、抽出、可視化のための組み込みExplore UIとLogQL CLI
- プラグインなしでクエリ、処理、取り込み、トレース、アラートを行うためのネイティブGrafana APIサポート
- ログ、イベント、トレースなどからデータを動的に検索、フィルタリング、抽出する強力なパイプライン
- LogQL、PromQL、InfluxDB、Elasticなどと透過的に互換性のある取り込みおよびPUSH API
- Promtail、Grafana-Agent、Vector、Logstash、Telegrafなどのエージェントですぐに使用可能

### DBeaver {#dbeaver}

[DBeaver](https://dbeaver.io/) - ClickHouseをサポートするユニバーサルデスクトップデータベースクライアント。

機能:

- 構文ハイライトと自動補完を備えたクエリ開発。
- フィルタとメタデータ検索を備えたテーブル一覧。
- テーブルデータプレビュー。
- 全文検索。

デフォルトでは、DBeaverはセッションを使用して接続しません(例えばCLIは使用します)。セッションサポートが必要な場合(例えば、セッションの設定を行う場合)、ドライバ接続プロパティを編集し、`session_id`をランダムな文字列に設定してください(内部的にはHTTP接続を使用します)。その後、クエリウィンドウから任意の設定を使用できます。

### clickhouse-cli {#clickhouse-cli}

[clickhouse-cli](https://github.com/hatarist/clickhouse-cli)は、Python 3で書かれたClickHouse用の代替コマンドラインクライアントです。

機能:

- 自動補完。
- クエリとデータ出力の構文ハイライト。
- データ出力のページャサポート。
- PostgreSQL風のカスタムコマンド。

### clickhouse-flamegraph {#clickhouse-flamegraph}

[clickhouse-flamegraph](https://github.com/Slach/clickhouse-flamegraph)は、`system.trace_log`を[flamegraph](http://www.brendangregg.com/flamegraphs.html)として可視化する専用ツールです。

### clickhouse-plantuml {#clickhouse-plantuml}

[cickhouse-plantuml](https://pypi.org/project/clickhouse-plantuml/)は、テーブルスキーマの[PlantUML](https://plantuml.com/)図を生成するスクリプトです。

### ClickHouse table graph {#clickhouse-table-graph}

[ClickHouse table graph](https://github.com/mbaksheev/clickhouse-table-graph)は、ClickHouseテーブル間の依存関係を可視化するシンプルなCLIツールです。このツールは`system.tables`テーブルからテーブル間の接続を取得し、[mermaid](https://mermaid.js.org/syntax/flowchart.html)形式で依存関係フローチャートを構築します。このツールを使用すると、テーブルの依存関係を簡単に可視化し、ClickHouseデータベース内のデータフローを理解できます。mermaidのおかげで、生成されたフローチャートは魅力的で、markdownドキュメントに簡単に追加できます。

### xeus-clickhouse {#xeus-clickhouse}

[xeus-clickhouse](https://github.com/wangfenjin/xeus-clickhouse)は、ClickHouse用のJupyterカーネルであり、JupyterでSQLを使用してClickHouseデータをクエリすることをサポートします。

### MindsDB Studio {#mindsdb}


[MindsDB](https://mindsdb.com/)は、ClickHouseを含むデータベース向けのオープンソースAIレイヤーで、最先端の機械学習モデルを簡単に開発、訓練、デプロイできます。MindsDB Studio(GUI)を使用すると、データベースから新しいモデルを訓練し、モデルの予測を解釈し、潜在的なデータバイアスを特定できます。また、説明可能AI機能を使用してモデルの精度を評価・可視化することで、機械学習モデルをより迅速に適応・調整できます。

### DBM {#dbm}

[DBM](https://github.com/devlive-community/dbm) DBMは、ClickHouse用のビジュアル管理ツールです。

機能:

- クエリ履歴のサポート(ページネーション、全削除など)
- 選択したSQL句のクエリをサポート
- クエリの終了をサポート
- テーブル管理のサポート(メタデータ、削除、プレビュー)
- データベース管理のサポート(削除、作成)
- カスタムクエリのサポート
- 複数データソース管理のサポート(接続テスト、監視)
- モニタリングのサポート(プロセッサ、接続、クエリ)
- データ移行のサポート

### Bytebase {#bytebase}

[Bytebase](https://bytebase.com)は、チーム向けのWebベースのオープンソーススキーマ変更およびバージョン管理ツールです。ClickHouseを含む様々なデータベースをサポートしています。

機能:

- 開発者とDBA間のスキーマレビュー
- Database-as-Code、GitLabなどのVCSでスキーマをバージョン管理し、コードコミット時にデプロイをトリガー
- 環境ごとのポリシーによる効率的なデプロイ
- 完全な移行履歴
- スキーマドリフト検出
- バックアップと復元
- RBAC

### Zeppelin-Interpreter-for-ClickHouse {#zeppelin-interpreter-for-clickhouse}

[Zeppelin-Interpreter-for-ClickHouse](https://github.com/SiderZhang/Zeppelin-Interpreter-for-ClickHouse)は、ClickHouse用の[Zeppelin](https://zeppelin.apache.org)インタープリタです。JDBCインタープリタと比較して、長時間実行されるクエリに対してより優れたタイムアウト制御を提供します。

### ClickCat {#clickcat}

[ClickCat](https://github.com/clickcat-project/ClickCat)は、ClickHouseデータの検索、探索、可視化を可能にする使いやすいユーザーインターフェースです。

機能:

- インストール不要でSQLコードを実行できるオンラインSQLエディタ
- すべてのプロセスとミューテーションを監視可能。未完了のプロセスはUI上で終了可能
- メトリクスには、クラスタ分析、データ分析、クエリ分析が含まれる

### ClickVisual {#clickvisual}

[ClickVisual](https://clickvisual.net/) ClickVisualは、軽量なオープンソースのログクエリ、分析、アラーム可視化プラットフォームです。

機能:

- ワンクリックでの分析ログライブラリの作成をサポート
- ログ収集設定管理をサポート
- ユーザー定義インデックス設定をサポート
- アラーム設定をサポート
- ライブラリおよびテーブルレベルの権限設定の粒度をサポート

### ClickHouse-Mate {#clickmate}

[ClickHouse-Mate](https://github.com/metrico/clickhouse-mate)は、ClickHouseのデータを検索および探索するためのAngular Webクライアント + ユーザーインターフェースです。

機能:

- ClickHouse SQLクエリの自動補完
- 高速なデータベースおよびテーブルツリーナビゲーション
- 高度な結果のフィルタリングとソート
- インラインClickHouse SQLドキュメント
- クエリプリセットと履歴
- 100%ブラウザベース、サーバー/バックエンド不要

このクライアントは、GitHubページから即座に利用可能です: https://metrico.github.io/clickhouse-mate/

### Uptrace {#uptrace}

[Uptrace](https://github.com/uptrace/uptrace)は、OpenTelemetryとClickHouseを活用した分散トレーシングとメトリクスを提供するAPMツールです。

機能:

- [OpenTelemetryトレーシング](https://uptrace.dev/opentelemetry/distributed-tracing.html)、メトリクス、ログ
- AlertManagerを使用したEmail/Slack/PagerDuty通知
- スパンを集約するためのSQL風クエリ言語
- メトリクスをクエリするためのPromQL風言語
- 事前構築されたメトリクスダッシュボード
- YAML設定による複数ユーザー/プロジェクト

### clickhouse-monitoring {#clickhouse-monitoring}

[clickhouse-monitoring](https://github.com/duyet/clickhouse-monitoring)は、`system.*`テーブルを利用してClickHouseクラスタの監視と概要提供を支援するシンプルなNext.jsダッシュボードです。

機能:

- クエリモニタ: 現在のクエリ、クエリ履歴、クエリリソース(メモリ、読み取りパーツ、file_openなど)、最も高コストなクエリ、最も使用されるテーブルやカラムなど
- クラスタモニタ: 総メモリ/CPU使用率、分散キュー、グローバル設定、mergetree設定、メトリクスなど
- テーブルとパーツ情報: サイズ、行数、圧縮、パーツサイズなど、カラムレベルの詳細
- 便利なツール: Zookeeperデータ探索、クエリEXPLAIN、クエリ終了など
- 可視化メトリクスチャート: クエリとリソース使用状況、マージ/ミューテーション数、マージパフォーマンス、クエリパフォーマンスなど

### CKibana {#ckibana}


[CKibana](https://github.com/TongchengOpenSource/ckibana)は、ネイティブのKibana UIを使用してClickHouseデータを簡単に検索、探索、可視化できる軽量サービスです。

機能:

- ネイティブのKibana UIからのチャートリクエストをClickHouseクエリ構文に変換します。
- サンプリングやキャッシングなどの高度な機能をサポートし、クエリパフォーマンスを向上させます。
- ElasticSearchからClickHouseへの移行後、ユーザーの学習コストを最小限に抑えます。

### Telescope {#telescope}

[Telescope](https://iamtelescope.net/)は、ClickHouseに保存されたログを探索するためのモダンなWebインターフェースです。きめ細かなアクセス制御を備えた、ログデータのクエリ、可視化、管理のためのユーザーフレンドリーなUIを提供します。

機能:

- 強力なフィルタとカスタマイズ可能なフィールド選択を備えた、クリーンでレスポンシブなUI。
- 直感的で表現力豊かなログフィルタリングのためのFlyQL構文。
- ネストされたJSON、Map、Arrayフィールドを含む、グループ化サポート付きの時系列グラフ。
- 高度なフィルタリングのためのオプションの生SQL `WHERE`クエリサポート(権限チェック付き)。
- 保存されたビュー: クエリとレイアウトのカスタムUI設定を永続化して共有できます。
- ロールベースアクセス制御(RBAC)とGitHub認証の統合。
- ClickHouse側に追加のエージェントやコンポーネントは不要です。

[Telescopeソースコード](https://github.com/iamtelescope/telescope) · [ライブデモ](https://demo.iamtelescope.net)


## 商用 {#commercial}

### DataGrip {#datagrip}

[DataGrip](https://www.jetbrains.com/datagrip/)は、JetBrainsが提供するデータベースIDEで、ClickHouseに対する専用サポートを備えています。また、PyCharm、IntelliJ IDEA、GoLand、PhpStormなど、他のIntelliJベースのツールにも組み込まれています。

機能:

- 非常に高速なコード補完。
- ClickHouseの構文ハイライト。
- ネストされたカラムやテーブルエンジンなど、ClickHouse固有の機能のサポート。
- データエディタ。
- リファクタリング。
- 検索とナビゲーション。

### Yandex DataLens {#yandex-datalens}

[Yandex DataLens](https://cloud.yandex.ru/services/datalens)は、データの可視化と分析のためのサービスです。

機能:

- シンプルな棒グラフから複雑なダッシュボードまで、幅広い可視化オプション。
- ダッシュボードを公開可能。
- ClickHouseを含む複数のデータソースのサポート。
- ClickHouseベースのマテリアライズドデータのストレージ。

DataLensは、商用利用であっても、低負荷のプロジェクトに対して[無料で利用可能](https://cloud.yandex.com/docs/datalens/pricing)です。

- [DataLensドキュメント](https://cloud.yandex.com/docs/datalens/)。
- ClickHouseデータベースからのデータ可視化に関する[チュートリアル](https://cloud.yandex.com/docs/solutions/datalens/data-from-ch-visualization)。

### Holistics Software {#holistics-software}

[Holistics](https://www.holistics.io/)は、フルスタックのデータプラットフォームおよびビジネスインテリジェンスツールです。

機能:

- レポートの自動メール、Slack、Google Sheetスケジュール配信。
- 可視化、バージョン管理、自動補完、再利用可能なクエリコンポーネント、動的フィルタを備えたSQLエディタ。
- iframeを介したレポートとダッシュボードの埋め込み分析。
- データ準備とETL機能。
- データのリレーショナルマッピングのためのSQLデータモデリングサポート。

### Looker {#looker}

[Looker](https://looker.com)は、ClickHouseを含む50以上のデータベース方言をサポートするデータプラットフォームおよびビジネスインテリジェンスツールです。LookerはSaaSプラットフォームとしても、セルフホスト型としても利用可能です。ユーザーはブラウザを介してLookerを使用し、データの探索、可視化とダッシュボードの構築、レポートのスケジュール設定、同僚との洞察の共有が可能です。Lookerは、これらの機能を他のアプリケーションに埋め込むための豊富なツールセットと、他のアプリケーションとデータを統合するためのAPIを提供します。

機能:

- レポート作成者とエンドユーザーをサポートするキュレーションされた[データモデリング](https://looker.com/platform/data-modeling)をサポートする言語であるLookMLを使用した、簡単でアジャイルな開発。
- Lookerの[Data Actions](https://looker.com/platform/actions)による強力なワークフロー統合。

[LookerでClickHouseを設定する方法。](https://docs.looker.com/setup-and-management/database-config/clickhouse)

### SeekTable {#seektable}

[SeekTable](https://www.seektable.com)は、データ探索と運用レポート作成のためのセルフサービスBIツールです。クラウドサービスとセルフホスト版の両方で利用可能です。SeekTableのレポートは、任意のWebアプリケーションに埋め込むことができます。

機能:

- ビジネスユーザーに優しいレポートビルダー。
- SQLフィルタリングとレポート固有のクエリカスタマイズのための強力なレポートパラメータ。
- ネイティブTCP/IPエンドポイントとHTTP(S)インターフェースの両方でClickHouseに接続可能(2つの異なるドライバ)。
- ディメンション/メジャーの定義において、ClickHouse SQL方言のすべての機能を使用可能。
- 自動レポート生成のための[Web API](https://www.seektable.com/help/web-api-integration)。
- アカウントデータの[バックアップ/リストア](https://www.seektable.com/help/self-hosted-backup-restore)によるレポート開発フローのサポート。データモデル(キューブ)/レポート設定は人間が読めるXML形式で、バージョン管理システムで管理可能。

SeekTableは、個人/個人利用の場合は[無料](https://www.seektable.com/help/cloud-pricing)です。

[SeekTableでClickHouse接続を設定する方法。](https://www.seektable.com/help/clickhouse-pivot-table)

### Chadmin {#chadmin}

[Chadmin](https://github.com/bun4uk/chadmin)は、ClickHouseクラスタ上で現在実行中のクエリとその情報を可視化し、必要に応じてそれらを停止できるシンプルなUIです。

### TABLUM.IO {#tablum_io}

[TABLUM.IO](https://tablum.io/)は、ETLと可視化のためのオンラインクエリおよび分析ツールです。ClickHouseへの接続、多機能なSQLコンソールを介したデータクエリ、静的ファイルやサードパーティサービスからのデータ読み込みが可能です。TABLUM.IOは、データ結果をチャートやテーブルとして可視化できます。


機能:

- ETL: 主要なデータベース、ローカルおよびリモートファイル、API呼び出しからのデータ読み込み
- 構文ハイライトとビジュアルクエリビルダーを備えた多機能SQLコンソール
- チャートおよびテーブルによるデータ可視化
- データのマテリアライゼーションおよびサブクエリ
- Slack、Telegram、または電子メールへのデータレポート送信
- 独自APIを介したデータパイプライン処理
- JSON、CSV、SQL、HTML形式でのデータエクスポート
- Webベースのインターフェース

TABLUM.IOは、セルフホスト型ソリューション(Dockerイメージとして)またはクラウドで実行できます。
ライセンス: 3ヶ月間の無料期間付き[商用](https://tablum.io/pricing)製品

[クラウド](https://tablum.io/try)で無料でお試しください。
製品の詳細については[TABLUM.IO](https://tablum.io/)をご覧ください。

### CKMAN {#ckman}

[CKMAN](https://www.github.com/housepower/ckman)は、ClickHouseクラスタを管理および監視するためのツールです。

機能:

- ブラウザインターフェースを通じた迅速かつ便利なクラスタの自動デプロイ
- クラスタのスケールアップまたはスケールダウンが可能
- クラスタのデータの負荷分散
- クラスタのオンラインアップグレード
- ページ上でのクラスタ設定の変更
- クラスタノード監視およびZooKeeper監視の提供
- テーブルおよびパーティションのステータス監視、および低速SQL文の監視
- 使いやすいSQL実行ページの提供
