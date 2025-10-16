---
'slug': '/use-cases/observability/clickstack/overview'
'title': 'ClickStack - The ClickHouse 可观测性堆栈'
'sidebar_label': '概述'
'pagination_prev': null
'pagination_next': 'use-cases/observability/clickstack/getting-started'
'description': 'ClickStack - The ClickHouse 可观测性堆栈的概述'
'doc_type': 'guide'
---

import Image from '@theme/IdealImage';
import architecture from '@site/static/images/use-cases/observability/clickstack-simple-architecture.png';
import landing_image from '@site/static/images/use-cases/observability/hyperdx-landing.png';

<Image img={landing_image} alt="Landing page" size="lg"/>

**ClickStack**は、ClickHouse上に構築された生産グレードの可観測性プラットフォームであり、ログ、トレース、メトリクス、セッションを一つの高性能ソリューションに統合します。複雑なシステムの監視とデバッグを目的に設計されており、ClickStackは開発者やSRE（Site Reliability Engineers）がツールを切り替えたり、タイムスタンプや相関IDを使用して手動でデータを結合することなく、エンドツーエンドで問題を追跡できるようにします。

ClickStackの中心にはシンプルですが強力なアイデアがあります。それは、すべての可観測性データを広範でリッチなイベントとして取り込むべきであるということです。これらのイベントは、データ型（ログ、トレース、メトリクス、セッション）ごとにClickHouseテーブルに保存されますが、データベースレベルで完全にクエリ可能で、相互相関可能です。

ClickStackは、ClickHouseの列指向アーキテクチャ、ネイティブJSONサポート、完全に並列化された実行エンジンを活用することで、高いカーディナリティワークロードを効率的に処理するように構築されています。これにより、大規模なデータセットに対してサブ秒でのクエリ、高速集計、および個々のトレースに対する深い検査が可能となります。JSONは圧縮された列指向形式で保存されるため、手動介入や事前定義なしにスキーマの進化が可能です。

## 機能 {#features}

このスタックには、デバッグや根本原因分析のために設計されたいくつかの主要な機能が含まれています：

- ログ、メトリクス、セッションリプレイ、トレースをすべて一か所で相関/検索
- スキーマに依存せず、既存のClickHouseスキーマの上で動作
- ClickHouse向けに最適化された驚異的な検索と視覚化
- 直感的なフルテキスト検索とプロパティ検索構文（例：`level:err`）、SQLオプション
- イベントデルタを使用して異常のトレンドを分析
- 数回のクリックでアラートを設定
- 複雑なクエリ言語なしで高カーディナリティイベントのダッシュボードを作成
- ネイティブJSON文字列のクエリ
- 常に最新のイベントを取得できるライブテールログとトレース
- OpenTelemetry（OTel）を標準でサポート
- HTTPリクエストからDBクエリまでの健康状態とパフォーマンスを監視（APM）
- 異常とパフォーマンス回帰を特定するためのイベントデルタ
- ログパターン認識

## コンポーネント {#components}

ClickStackは、3つのコアコンポーネントから構成されています：

1. **HyperDX UI** – 可観測性データを探索し視覚化するための特別に設計されたフロントエンド
2. **OpenTelemetry collector** – ログ、トレース、メトリクスのためのオピニオン付きスキーマを持つカスタムビルドの事前設定コレクター
3. **ClickHouse** – スタックの中心にある高性能の分析データベース

これらのコンポーネントは独立して、または一緒にデプロイ可能です。また、HyperDX UIのブラウザホステッドバージョンも利用可能で、ユーザーは追加のインフラストラクチャなしに既存のClickHouseデプロイメントに接続できます。

始めるには、[Getting started guide](/use-cases/observability/clickstack/getting-started)を訪れてから、[sample dataset](/use-cases/observability/clickstack/sample-datasets)をロードしてください。また、[deployment options](/use-cases/observability/clickstack/deployment)や[production best practices](/use-cases/observability/clickstack/production)に関するドキュメントも探ることができます。

## 原則 {#clickstack-principles}

ClickStackは、可観測性スタックのあらゆるレイヤーで使いやすさ、パフォーマンス、柔軟性を優先する一連のコア原則をもとに設計されています：

### 数分で簡単に設定できる {#clickstack-easy-to-setup}

ClickStackは、あらゆるClickHouseインスタンスとスキーマでそのまま動作し、最小限の設定を必要とします。新しく始める場合でも、既存のセットアップに統合する場合でも、数分で開始できます。

### ユーザーフレンドリーで目的に特化 {#user-friendly-purpose-built}

HyperDX UIはSQLとLuceneスタイルの両方の構文をサポートしており、ユーザーが自分のワークフローに合ったクエリインターフェースを選択できます。可観測性専用に設計されたUIは、チームが根本原因を迅速に特定し、複雑なデータを摩擦なくナビゲートできるよう最適化されています。

### エンドツーエンドの可観測性 {#end-to-end-observability}

ClickStackは、フロントエンドのユーザーセッションからバックエンドのインフラメトリクス、アプリケーションログ、分散トレースまでのフルスタックの可視性を提供します。この統一されたビューにより、システム全体にわたる深い相関と分析が可能になります。

### ClickHouse向けに構築 {#built-for-clickhouse}

スタックのすべてのレイヤーは、ClickHouseの機能を最大限に活用するように設計されています。クエリはClickHouseの分析機能と列指向エンジンを活用するよう最適化されており、大量のデータに対して迅速な検索と集計を確保します。

### OpenTelemetryネイティブ {#open-telemetry-native}

ClickStackはOpenTelemetryとネイティブに統合されており、すべてのデータをOpenTelemetryコレクターエンドポイントを介して取り込みます。高度なユーザー向けには、ネイティブファイル形式、カスタムパイプライン、またはVectorのようなサードパーティツールを使用してClickHouseへの直接取り込みもサポートしています。

### オープンソースで完全にカスタマイズ可能 {#open-source-and-customizable}

ClickStackは完全にオープンソースであり、どこにでもデプロイできます。スキーマは柔軟でユーザーが変更可能であり、UIは変更を必要とせずカスタムスキーマに設定できるように設計されています。すべてのコンポーネント—コレクター、ClickHouse、UI—は、取り込み、クエリ、ストレージのニーズに応じて独立してスケールさせることができます。

## アーキテクチャ概要 {#architectural-overview}

<Image img={architecture} alt="Simple architecture" size="lg"/>

ClickStackは3つのコアコンポーネントから構成されています：

1. **HyperDX UI**  
   可観測性のために構築されたユーザーフレンドリーなインターフェース。LuceneスタイルとSQLの両方のクエリ、インタラクティブダッシュボード、アラート、トレース探索、などをサポートし、すべてClickHouseをバックエンドとして最適化されています。

2. **OpenTelemetry collector**  
   ClickHouseへの取り込みに最適化されたオピニオン付きスキーマで構成されたカスタムビルドのコレクター。OpenTelemetryプロトコルを介してログ、メトリクス、トレースを受け取り、効率的なバッチ挿入を使用して直接ClickHouseに書き込みます。

3. **ClickHouse**  
   幅広いイベントの中央データストアとして機能する高性能の分析データベース。ClickHouseは、その列指向エンジンとJSONのネイティブサポートを活用して、大規模な検索、フィルタリング、および集計を迅速に行います。

これらの3つのコンポーネントに加えて、ClickStackは**MongoDBインスタンス**を使用して、ダッシュボード、ユーザーアカウント、構成設定などのアプリケーション状態を保存します。

完全なアーキテクチャ図とデプロイの詳細は、[Architecture section](/use-cases/observability/clickstack/architecture)で確認できます。

ClickStackを本番環境にデプロイすることに興味があるユーザーには、["Production"](/use-cases/observability/clickstack/production)ガイドを読むことをお勧めします。
