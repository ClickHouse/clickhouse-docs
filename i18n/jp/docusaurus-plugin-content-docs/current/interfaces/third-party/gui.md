---
description: 'ClickHouse を操作するためのサードパーティ製 GUI ツールおよびアプリケーションの一覧'
sidebar_label: 'ビジュアルインターフェイス'
sidebar_position: 28
slug: /interfaces/third-party/gui
title: 'サードパーティ製ビジュアルインターフェイス'
doc_type: 'reference'
---



# サードパーティ開発のビジュアルインターフェース {#visual-interfaces-from-third-party-developers}



## オープンソース {#open-source}

### agx {#agx}

[agx](https://github.com/agnosticeng/agx) は、Tauri と SvelteKit で構築されたデスクトップアプリケーションで、ClickHouse の組み込みデータベースエンジン (chdb) を利用してデータを探索およびクエリするためのモダンなインターフェイスを提供します。

- ネイティブアプリケーション実行時に chdb を活用可能。
- Web 版として実行する場合、ClickHouse インスタンスに接続可能。
- Monaco エディタにより、なじみのある操作感を提供。
- 多様で拡張可能なデータ可視化機能。

### ch-ui {#ch-ui}

[ch-ui](https://github.com/caioricciuti/ch-ui) は、ClickHouse データベース向けに設計されたシンプルな React.js アプリケーションインターフェイスで、クエリ実行とデータ可視化を行うことができます。React と Web 向け ClickHouse クライアントで構築されており、洗練された使いやすい UI により、データベースとのやり取りを容易にします。

Features:

- ClickHouse 連携: 接続の管理やクエリ実行を容易に実施。
- レスポンシブなタブ管理: クエリタブやテーブルタブなど、複数タブを動的に扱うことが可能。
- パフォーマンス最適化: Indexed DB を利用した効率的なキャッシュおよび状態管理。
- ローカルデータ保存: すべてのデータはブラウザ内にローカル保存され、外部には送信されません。

### ChartDB {#chartdb}

[ChartDB](https://chartdb.io) は、ClickHouse を含むデータベーススキーマを単一のクエリで設計・可視化できる、無料かつオープンソースのツールです。React で構築されており、データベースの認証情報やサインアップを行うことなく、シームレスで使いやすい体験を提供します。

Features:

- スキーマの可視化: ClickHouse スキーマを即座にインポートして可視化可能。マテリアライズドビューや標準ビューを含む ER 図を生成し、テーブルへの参照も表示。
- AI ベースの DDL エクスポート: スキーマ管理とドキュメント化のために、DDL スクリプトを容易に生成。
- 複数の SQL 方言をサポート: 多様なデータベース環境で利用可能。
- サインアップや認証情報は不要: すべての機能はブラウザ上から直接利用可能で、摩擦のない安全な利用が可能。

[ChartDB Source Code](https://github.com/chartdb/chartdb).

### DataPup {#datapup}

[DataPup](https://github.com/DataPupOrg/DataPup) は、ネイティブな ClickHouse サポートを備えた、モダンで AI 支援のクロスプラットフォームデータベースクライアントです。

Features:

- AI による SQL クエリ支援とインテリジェントなサジェスト機能
- 安全な認証情報管理を備えたネイティブ ClickHouse 接続サポート
- 複数のテーマ (ライト、ダーク、カラフルなバリエーション) を備えた美しくアクセシブルなインターフェイス
- 高度なクエリ結果のフィルタリングと探索機能
- クロスプラットフォームサポート (macOS, Windows, Linux)
- 高速かつレスポンシブなパフォーマンス
- オープンソースかつ MIT ライセンス

### ClickHouse Schema Flow Visualizer {#clickhouse-schemaflow-visualizer}

[ClickHouse Schema Flow Visualizer](https://github.com/FulgerX2007/clickhouse-schemaflow-visualizer) は、Mermaid.js ダイアグラムを使用して ClickHouse のテーブル間リレーションシップを可視化する強力なオープンソース Web アプリケーションです。直感的なインターフェイスでデータベースやテーブルをブラウズし、オプションの行数やサイズ情報を含むテーブルメタデータを探索し、インタラクティブなスキーマダイアグラムをエクスポートできます。

Features:

- 直感的なインターフェイスで ClickHouse のデータベースとテーブルをブラウズ
- Mermaid.js ダイアグラムでテーブル間のリレーションシップを可視化
- テーブルタイプに対応した色分けアイコンによる視認性の向上
- テーブル間のデータフロー方向を表示
- 図をスタンドアロンの HTML ファイルとしてエクスポート
- メタデータ (テーブル行数およびサイズ情報) の表示切り替え
- TLS サポート付きの安全な ClickHouse 接続
- あらゆるデバイス向けのレスポンシブ Web インターフェイス

[ClickHouse Schema Flow Visualizer - source code](https://github.com/FulgerX2007/clickhouse-schemaflow-visualizer)

### Tabix {#tabix}

[Tabix](https://github.com/tabixio/tabix) プロジェクトにおける ClickHouse 向け Web インターフェイス。

Features:

- 追加ソフトウェアをインストールすることなく、ブラウザから直接 ClickHouse を操作可能。
- 構文ハイライト付きクエリエディタ。
- コマンドの自動補完。
- クエリ実行のグラフィカル解析ツール。
- 配色スキームの選択オプション。

[Tabix documentation](https://tabix.io/doc/).

### HouseOps {#houseops}

[HouseOps](https://github.com/HouseOps/HouseOps) は macOS、Linux、Windows 向けの UI/IDE です。

Features:

- 構文ハイライト付きクエリビルダー。レスポンスをテーブルビューまたは JSON ビューで表示可能。
- クエリ結果を CSV または JSON としてエクスポート可能。
- 説明付きのプロセス一覧。書き込みモード。プロセスを停止する (`KILL`) 機能。
- データベースグラフ。すべてのテーブルとそのカラム、および追加情報を表示。
- カラムサイズのクイックビュー。
- サーバー設定管理。

今後開発が予定されている機能:

- データベース管理。
- ユーザー管理。
- リアルタイムデータ分析。
- クラスター監視。
- クラスター管理。
- レプリケートテーブルおよび Kafka テーブルの監視。

### LightHouse {#lighthouse}



[LightHouse](https://github.com/VKCOM/lighthouse) は、ClickHouse 向けの軽量な Web インターフェイスです。

特徴:

- フィルタリングおよびメタデータ付きのテーブル一覧。
- フィルタリングおよびソートが可能なテーブルプレビュー。
- 読み取り専用クエリの実行。

### Redash {#redash}

[Redash](https://github.com/getredash/redash) は、データ可視化のためのプラットフォームです。

ClickHouse を含む複数のデータソースをサポートしており、Redash は異なるデータソースからのクエリ結果を 1 つの最終データセットに結合できます。

特徴:

- 強力なクエリエディタ。
- データベースエクスプローラー。
- データをさまざまな形式で表現できる可視化ツール。

### Grafana {#grafana}

[Grafana](https://grafana.com/grafana/plugins/grafana-clickhouse-datasource/) は、モニタリングと可視化のためのプラットフォームです。

"Grafana allows you to query, visualize, alert on and understand your metrics no matter where they are stored. Create, explore, and share dashboards with your team and foster a data-driven culture. Trusted and loved by the community" &mdash; grafana.com.

ClickHouse data source プラグインにより、ClickHouse をバックエンドデータベースとして利用できます。

### qryn {#qryn}

[qryn](https://metrico.in) は、ClickHouse 向けの複数プロトコル対応・高性能なオブザーバビリティスタック _(旧称 cLoki)_ であり、ネイティブな Grafana 連携により、Loki/LogQL、Prometheus/PromQL、OTLP/Tempo、Elastic、InfluxDB などをサポートするあらゆるエージェントからログ、メトリクス、テレメトリトレースを取り込み、分析できます。

特徴:

- データのクエリ、抽出、可視化のための組み込み Explore UI と LogQL CLI
- プラグイン不要で、クエリ、処理、インジェスト、トレース、アラートに対応するネイティブ Grafana API サポート
- ログやイベント、トレースなどから動的にデータを検索、フィルタ、抽出できる強力なパイプライン
- LogQL、PromQL、InfluxDB、Elastic などと透過的に互換性のあるインジェストおよび PUSH API
- Promtail、Grafana-Agent、Vector、Logstash、Telegraf などのエージェントですぐに利用可能

### DBeaver {#dbeaver}

[DBeaver](https://dbeaver.io/) は、ClickHouse をサポートする汎用デスクトップデータベースクライアントです。

特徴:

- 構文ハイライトとオートコンプリートによるクエリ開発。
- フィルタおよびメタデータ検索付きのテーブル一覧。
- テーブルデータのプレビュー。
- フルテキスト検索。

デフォルトでは、DBeaver はセッションを使用して接続しません（CLI などは使用します）。セッションサポートが必要な場合（例: セッションに対して設定を行いたい場合）、ドライバーの接続プロパティを編集し、`session_id` をランダムな文字列に設定します（内部的には HTTP 接続を使用します）。その後、クエリウィンドウから任意の設定を使用できます。

### clickhouse-cli {#clickhouse-cli}

[clickhouse-cli](https://github.com/hatarist/clickhouse-cli) は、Python 3 で実装された ClickHouse 用の代替コマンドラインクライアントです。

特徴:

- オートコンプリート。
- クエリおよびデータ出力の構文ハイライト。
- データ出力のページャサポート。
- PostgreSQL 風のカスタムコマンド。

### clickhouse-flamegraph {#clickhouse-flamegraph}

[clickhouse-flamegraph](https://github.com/Slach/clickhouse-flamegraph) は、`system.trace_log` を [flamegraph](http://www.brendangregg.com/flamegraphs.html) として可視化するための専用ツールです。

### clickhouse-plantuml {#clickhouse-plantuml}

[cickhouse-plantuml](https://pypi.org/project/clickhouse-plantuml/) は、テーブルスキーマの [PlantUML](https://plantuml.com/) 図を生成するためのスクリプトです。

### ClickHouse table graph {#clickhouse-table-graph}

[ClickHouse table graph](https://github.com/mbaksheev/clickhouse-table-graph) は、ClickHouse テーブル間の依存関係を可視化するためのシンプルな CLI ツールです。このツールは `system.tables` テーブルからテーブル間の接続情報を取得し、[mermaid](https://mermaid.js.org/syntax/flowchart.html) 形式で依存関係のフローチャートを構築します。このツールを使用することで、テーブルの依存関係を簡単に可視化し、ClickHouse データベース内のデータフローを把握できます。mermaid により、生成されたフローチャートは見栄えが良く、Markdown ドキュメントにも容易に追加できます。

### xeus-clickhouse {#xeus-clickhouse}

[xeus-clickhouse](https://github.com/wangfenjin/xeus-clickhouse) は ClickHouse 用の Jupyter カーネルであり、Jupyter 上で SQL を使用して ClickHouse のデータをクエリできます。

### MindsDB Studio {#mindsdb}



[MindsDB](https://mindsdb.com/) は、ClickHouse を含むデータベース向けのオープンソースの AI レイヤーであり、最先端の機械学習モデルを容易に開発・学習・デプロイできるようにします。MindsDB Studio（GUI）を使用すると、データベースから新しいモデルを学習させ、モデルによる予測結果を解釈し、潜在的なデータバイアスを特定し、Explainable AI 機能を用いてモデル精度を評価および可視化することで、機械学習モデルをより迅速に適応・チューニングできます。

### DBM {#dbm}

[DBM](https://github.com/devlive-community/dbm) DBM は ClickHouse 用のビジュアル管理ツールです。

機能:

- クエリ履歴のサポート（ページネーション、すべてクリアなど）
- 選択した SQL 句のクエリをサポート
- クエリの強制終了をサポート
- テーブル管理をサポート（メタデータ、削除、プレビュー）
- データベース管理をサポート（削除、作成）
- カスタムクエリをサポート
- 複数のデータソース管理をサポート（接続テスト、モニタリング）
- モニタリングをサポート（プロセッサ、接続、クエリ）
- データ移行をサポート

### Bytebase {#bytebase}

[Bytebase](https://bytebase.com) は、チーム向けの Web ベースのオープンソースのスキーマ変更およびバージョン管理ツールです。ClickHouse を含む各種データベースをサポートします。

機能:

- 開発者と DBA 間でのスキーマレビュー。
- Database-as-Code による、GitLab などの VCS でのスキーマのバージョン管理と、コードコミット時のデプロイメントのトリガー。
- 環境ごとのポリシーに基づく効率的なデプロイメント。
- 完全なマイグレーション履歴。
- スキーマドリフト検出。
- バックアップおよびリストア。
- RBAC。

### Zeppelin-Interpreter-for-ClickHouse {#zeppelin-interpreter-for-clickhouse}

[Zeppelin-Interpreter-for-ClickHouse](https://github.com/SiderZhang/Zeppelin-Interpreter-for-ClickHouse) は、ClickHouse 向けの [Zeppelin](https://zeppelin.apache.org) インタプリタです。JDBC インタプリタと比較して、長時間実行されるクエリに対してより優れたタイムアウト制御を提供します。

### ClickCat {#clickcat}

[ClickCat](https://github.com/clickcat-project/ClickCat) は、ClickHouse データを検索、探索、および可視化できる、使いやすいユーザーインターフェースです。

機能:

- インストール不要で SQL コードを実行できるオンライン SQL エディタ。
- すべてのプロセスおよびミューテーションを確認可能。未完了のプロセスについては、UI から強制終了できます。
- メトリクスには、クラスター分析、データ分析、およびクエリ分析が含まれます。

### ClickVisual {#clickvisual}

[ClickVisual](https://clickvisual.net/) ClickVisual は、軽量なオープンソースのログクエリ・分析・アラーム可視化プラットフォームです。

機能:

- ワンクリックで分析ログライブラリを作成可能
- ログ収集設定管理をサポート
- ユーザー定義インデックス設定をサポート
- アラーム設定をサポート
- ライブラリおよびテーブル単位のきめ細かな権限設定に対応

### ClickHouse-Mate {#clickmate}

[ClickHouse-Mate](https://github.com/metrico/clickhouse-mate) は、ClickHouse 内のデータを検索および探索するための Angular 製 Web クライアント + ユーザーインターフェースです。

機能:

- ClickHouse SQL クエリのオートコンプリート
- 高速なデータベースおよびテーブルツリーナビゲーション
- 高度な結果フィルタリングおよびソート
- インライン ClickHouse SQL ドキュメント
- クエリプリセットおよび履歴
- 100% ブラウザベースで、サーバー/バックエンド不要

クライアントは GitHub Pages を通じてすぐに利用可能です: https://metrico.github.io/clickhouse-mate/

### Uptrace {#uptrace}

[Uptrace](https://github.com/uptrace/uptrace) は、OpenTelemetry と ClickHouse を基盤とした分散トレーシングおよびメトリクスを提供する APM ツールです。

機能:

- [OpenTelemetry トレーシング](https://uptrace.dev/opentelemetry/distributed-tracing.html)、メトリクス、およびログ。
- AlertManager を使用した Email/Slack/PagerDuty 通知。
- スパンを集約するための SQL ライクなクエリ言語。
- メトリクスをクエリするための PromQL ライクな言語。
- 事前構築済みのメトリクスダッシュボード。
- YAML 設定による複数ユーザー/プロジェクトのサポート。

### clickhouse-monitoring {#clickhouse-monitoring}

[clickhouse-monitoring](https://github.com/duyet/clickhouse-monitoring) は、`system.*` テーブルに依存して ClickHouse クラスターの監視および概要把握を支援する、シンプルな Next.js ダッシュボードです。

機能:

- クエリモニター: 現在のクエリ、クエリ履歴、クエリリソース（メモリ、読み取られたパーツ、file_open など）、最も高コストなクエリ、最も使用されているテーブルやカラムなど。
- クラスター監視: 合計メモリ/CPU 使用量、分散キュー、グローバル設定、MergeTree 設定、メトリクスなど。
- テーブルおよびパーツ情報: サイズ、行数、圧縮、パーツサイズなど、カラムレベルの詳細。
- 有用なツール: Zookeeper データ探索、クエリ EXPLAIN、クエリの強制終了など。
- 可視化メトリクスチャート: クエリおよびリソース使用量、マージ/ミューテーション数、マージ性能、クエリ性能など。

### CKibana {#ckibana}



[CKibana](https://github.com/TongchengOpenSource/ckibana) は、ネイティブな Kibana UI を使用して ClickHouse のデータを手軽に検索・探索・可視化できる軽量なサービスです。

機能:

- ネイティブな Kibana UI からのチャートのリクエストを ClickHouse 用のクエリ構文に変換します。
- サンプリングやキャッシュなど、クエリ性能を向上させる高度な機能をサポートします。
- Elasticsearch から ClickHouse への移行後も、ユーザーの学習コストを最小限に抑えます。

### Telescope {#telescope}

[Telescope](https://iamtelescope.net/) は、ClickHouse に保存されたログを探索するためのモダンな Web インターフェースです。きめ細かなアクセス制御を備えた、ログデータのクエリ、可視化、管理を行うためのユーザーフレンドリーな UI を提供します。

機能:

- 強力なフィルタとカスタマイズ可能なフィールド選択を備えた、クリーンでレスポンシブな UI。
- 直感的かつ表現力の高いログフィルタリングを可能にする FlyQL 構文。
- ネストされた JSON、Map、Array フィールドを含む、グループ化に対応した時間ベースのグラフ。
- 高度なフィルタリングのための任意指定の生の SQL `WHERE` クエリのサポート（権限チェック付き）。
- Saved Views: クエリおよびレイアウトに対する UI のカスタム構成を保存・共有可能。
- ロールベースのアクセス制御 (RBAC) および GitHub 認証との連携。
- ClickHouse 側では追加のエージェントやコンポーネントは不要です。

[Telescope ソースコード](https://github.com/iamtelescope/telescope) · [ライブデモ](https://demo.iamtelescope.net)



## 商用 {#commercial}

### DataGrip {#datagrip}

[DataGrip](https://www.jetbrains.com/datagrip/) は、JetBrains が提供する ClickHouse をネイティブにサポートするデータベース IDE です。PyCharm、IntelliJ IDEA、GoLand、PhpStorm など他の IntelliJ ベースのツールにも組み込まれています。

機能:

- 非常に高速なコード補完。
- ClickHouse 構文のシンタックスハイライト。
- 入れ子カラム、テーブルエンジンなど、ClickHouse 固有機能のサポート。
- データエディタ。
- リファクタリング。
- 検索とナビゲーション。

### Yandex DataLens {#yandex-datalens}

[Yandex DataLens](https://cloud.yandex.ru/services/datalens) は、データの可視化および分析のためのサービスです。

機能:

- シンプルな棒グラフから複雑なダッシュボードまで、多彩なビジュアライゼーション。
- ダッシュボードを公開して一般に利用可能にすることが可能。
- ClickHouse を含む複数のデータソースをサポート。
- ClickHouse をベースにしたマテリアライズドデータ用ストレージ。

DataLens は、商用利用であっても、低負荷のプロジェクト向けには[無料で利用可能](https://cloud.yandex.com/docs/datalens/pricing)です。

- [DataLens のドキュメント](https://cloud.yandex.com/docs/datalens/)。
- ClickHouse データベースのデータを可視化するための[チュートリアル](https://cloud.yandex.com/docs/solutions/datalens/data-from-ch-visualization)。

### Holistics Software {#holistics-software}

[Holistics](https://www.holistics.io/) は、フルスタックのデータプラットフォーム兼ビジネスインテリジェンスツールです。

機能:

- レポートの自動メール送信、Slack、Google Sheet へのスケジュール配信。
- ビジュアライゼーション、バージョン管理、オートコンプリート、再利用可能なクエリコンポーネント、動的フィルタを備えた SQL エディタ。
- iframe を利用したレポートおよびダッシュボードの埋め込み分析。
- データ準備および ETL 機能。
- データのリレーショナルマッピングを行う SQL データモデリングのサポート。

### Looker {#looker}

[Looker](https://looker.com) は、ClickHouse を含む 50 以上のデータベースダイアレクトをサポートするデータプラットフォーム兼ビジネスインテリジェンスツールです。Looker は SaaS プラットフォームおよびセルフホストで利用できます。ユーザーはブラウザから Looker を利用してデータを探索し、ビジュアライゼーションやダッシュボードを作成し、レポートをスケジュールし、インサイトを同僚と共有できます。Looker はこれらの機能を他のアプリケーションに埋め込むための豊富なツールと、他のアプリケーションとデータ連携するための API を提供します。

機能:

- LookML を用いた、容易かつアジャイルな開発。LookML はレポート作成者やエンドユーザーを支援するための精選された
    [Data Modeling](https://looker.com/platform/data-modeling) をサポートする言語です。
- Looker の [Data Actions](https://looker.com/platform/actions) による強力なワークフロー統合。

[Looker で ClickHouse を構成する方法。](https://docs.looker.com/setup-and-management/database-config/clickhouse)

### SeekTable {#seektable}

[SeekTable](https://www.seektable.com) は、データ探索および運用レポーティング向けのセルフサービス BI ツールです。クラウドサービスとセルフホスト版の両方が利用可能です。SeekTable のレポートは任意の Web アプリケーションに埋め込むことができます。

機能:

- ビジネスユーザーにとって扱いやすいレポートビルダー。
- SQL フィルタリングおよびレポート固有のクエリカスタマイズのための強力なレポートパラメータ。
- ネイティブな TCP/IP エンドポイントおよび HTTP(S) インターフェイス（2 種類のドライバ）の両方で ClickHouse に接続可能。
- ディメンション／メジャーの定義で ClickHouse の SQL 方言のすべての機能を利用可能。
- 自動レポート生成のための [Web API](https://www.seektable.com/help/web-api-integration)。
- アカウントデータの [backup/restore](https://www.seektable.com/help/self-hosted-backup-restore) によるレポート開発フローをサポート。データモデル（キューブ）／レポート設定は人間が読める XML で表現され、バージョン管理システムで管理できます。

SeekTable は、個人／個人用途での利用については[無料](https://www.seektable.com/help/cloud-pricing)です。

[SeekTable で ClickHouse 接続を構成する方法。](https://www.seektable.com/help/clickhouse-pivot-table)

### Chadmin {#chadmin}

[Chadmin](https://github.com/bun4uk/chadmin) は、ClickHouse クラスター上で現在実行中のクエリとその情報を可視化し、必要に応じてそれらを強制終了できるシンプルな UI です。

### TABLUM.IO {#tablum_io}

[TABLUM.IO](https://tablum.io/) は、ETL と可視化のためのオンラインクエリおよび分析ツールです。ClickHouse へ接続し、柔軟な SQL コンソール経由でデータをクエリできるほか、静的ファイルやサードパーティサービスからデータをロードすることもできます。TABLUM.IO は、クエリ結果データをチャートやテーブルとして可視化できます。



機能:
- ETL: 一般的なデータベース、ローカルおよびリモートファイル、API 呼び出しからのデータのロード。
- シンタックスハイライトとビジュアルクエリビルダーを備えた多機能 SQL コンソール。
- チャートやテーブルによるデータの可視化。
- データのマテリアライゼーションおよびサブクエリ。
- Slack、Telegram、メールへのデータレポート。
- 独自 API を利用したデータパイプライニング。
- JSON、CSV、SQL、HTML 形式でのデータエクスポート。
- Web ベースのインターフェース。

TABLUM.IO は、セルフホスト型ソリューション（Docker イメージ）としても、クラウド上でも実行できます。
ライセンス: 3 か月の無料期間付きの[商用](https://tablum.io/pricing)製品です。

[クラウド上](https://tablum.io/try)で無料で試すことができます。
製品の詳細は [TABLUM.IO](https://tablum.io/) を参照してください。

### CKMAN {#ckman}

[CKMAN](https://www.github.com/housepower/ckman) は、ClickHouse クラスターの管理およびモニタリング用のツールです。

機能:

- ブラウザーインターフェースによる、クラスターの迅速かつ手軽な自動デプロイメント
- クラスターをスケールインまたはスケールアウト可能
- クラスター内のデータを負荷分散
- クラスターをオンラインでアップグレード
- Web ページ上からクラスター設定を変更可能
- クラスターノードおよび ZooKeeper のモニタリングを提供
- テーブルおよびパーティションの状態、ならびに遅い SQL ステートメントを監視
- 使いやすい SQL 実行ページを提供
