---
slug: /use-cases/observability/clickstack/overview
title: 'ClickStack - ClickHouse オブザーバビリティスタック'
sidebar_label: '概要'
pagination_prev: null
pagination_next: use-cases/observability/clickstack/getting-started
description: 'ClickStack - ClickHouse オブザーバビリティスタックの概要'
doc_type: 'guide'
keywords: ['clickstack', 'observability', 'logs', 'monitoring', 'platform']
---

import Image from '@theme/IdealImage';
import architecture from '@site/static/images/use-cases/observability/clickstack-simple-architecture.png';
import landing_image from '@site/static/images/use-cases/observability/hyperdx-landing.png';

<Image img={landing_image} alt="ランディングページ" size="lg" />

**ClickStack** は ClickHouse 上に構築された本番環境対応のオブザーバビリティプラットフォームであり、ログ、トレース、メトリクス、セッションを単一の高性能なソリューションとして統合します。複雑なシステムの監視とデバッグ向けに設計されており、開発者や SRE はツールを切り替えたり、タイムスタンプや相関 ID を使って手作業でデータをつなぎ合わせることなく、問題をエンドツーエンドでトレースできます。

ClickStack の中核となるのは、「すべてのオブザーバビリティデータは、情報量の多いワイドなイベントとして取り込まれるべきだ」というシンプルだが強力な考え方です。これらのイベントはデータ種別ごと（ログ、トレース、メトリクス、セッション）に ClickHouse のテーブルに保存されますが、データベースレベルで完全にクエリ可能であり、相互にクロス相関させることができます。

ClickStack は、ClickHouse のカラム指向アーキテクチャ、ネイティブな JSON サポート、完全並列の実行エンジンを活用することで、高カーディナリティなワークロードを効率的に処理できるように構築されています。これにより、巨大なデータセットに対するサブ秒レベルのクエリ、広い時間範囲にわたる高速な集約、個々のトレースの詳細なインスペクションが可能になります。JSON は圧縮されたカラム指向フォーマットで保存されるため、手動での対応や事前のスキーマ定義なしにスキーマの進化を行うことができます。


## 機能 {#features}

このスタックには、デバッグと根本原因解析のために設計された、いくつかの主要な機能を備えています：

- ログ、メトリクス、セッションリプレイ、トレースを一元的に相関付けて検索
- スキーマに依存せず、既存の ClickHouse スキーマの上で動作
- ClickHouse に最適化された超高速な検索と可視化
- 直感的な全文検索およびプロパティ検索構文（例：`level:err`）。SQL はオプション
- イベント差分を用いた異常トレンドの分析
- 数クリックでアラートを設定
- 複雑なクエリ言語なしで高カーディナリティなイベントをダッシュボードで可視化
- JSON 文字列に対するネイティブクエリ
- ライブテイル機能でログとトレースを追跡し、常に最新のイベントを取得
- OpenTelemetry (OTel) を標準でサポート
- HTTP リクエストからデータベースクエリまで（APM）、健全性とパフォーマンスを監視
- 異常やパフォーマンス劣化を特定するためのイベント差分
- ログパターン認識



## コンポーネント {#components}

ClickStack は次の 3 つの中核コンポーネントで構成されています。

1. **HyperDX UI** – オブザーバビリティデータを探索・可視化するために特化して設計されたフロントエンド
2. **OpenTelemetry collector** – ログ、トレース、メトリクス向けの意図的なスキーマを備えた、カスタム構築かつ事前構成済みのコレクター
3. **ClickHouse** – このスタックの中核となる高性能な分析データベース

これらのコンポーネントは個別にも、まとめて一括でデプロイできます。ブラウザでホストされる HyperDX UI のバージョンも利用可能であり、追加のインフラなしに既存の ClickHouse デプロイメントへ接続できます。

まずは [Getting started guide](/use-cases/observability/clickstack/getting-started) を参照し、その後に [sample dataset](/use-cases/observability/clickstack/sample-datasets) をロードしてください。また、[deployment options](/use-cases/observability/clickstack/deployment) や [production best practices](/use-cases/observability/clickstack/production) に関するドキュメントも参照できます。



## 原則 {#clickstack-principles}

ClickStack は、オブザーバビリティスタックのあらゆるレイヤーで、使いやすさ、性能、柔軟性を最優先とする一連のコア原則に基づいて設計されています。

### 数分でセットアップ可能 {#clickstack-easy-to-setup}

ClickStack は任意の ClickHouse インスタンスおよびスキーマとそのまま動作し、必要な設定は最小限です。新規に始める場合でも、既存のセットアップに統合する場合でも、数分で立ち上げて稼働させることができます。

### ユーザーフレンドリーかつ用途特化 {#user-friendly-purpose-built}

HyperDX の UI は SQL と Lucene スタイルの両方の構文をサポートしており、ユーザーはワークフローに合ったクエリインターフェイスを選択できます。オブザーバビリティに特化して設計されており、チームが根本原因を素早く特定し、複雑なデータをストレスなく操作できるよう最適化されています。

### エンドツーエンドのオブザーバビリティ {#end-to-end-observability}

ClickStack は、フロントエンドのユーザーセッションから、バックエンドのインフラストラクチャメトリクス、アプリケーションログ、分散トレースまで、フルスタックの可視性を提供します。この統合ビューにより、システム全体にわたる深い相関付けと分析が可能になります。

### ClickHouse 向けに構築 {#built-for-clickhouse}

スタックのあらゆるレイヤーは、ClickHouse の機能を最大限に活用できるよう設計されています。クエリは ClickHouse の分析関数とカラム型エンジンを活用するよう最適化されており、巨大なデータ量に対しても高速な検索と集約を実現します。

### OpenTelemetry ネイティブ {#open-telemetry-native}

ClickStack は OpenTelemetry とネイティブに連携しており、すべてのデータを OpenTelemetry Collector のエンドポイント経由でインジェストします。上級ユーザー向けには、ネイティブファイルフォーマット、カスタムパイプライン、Vector のようなサードパーティツールを用いて、ClickHouse に直接インジェストすることもサポートしています。

### オープンソースかつ完全にカスタマイズ可能 {#open-source-and-customizable}

ClickStack は完全にオープンソースで、あらゆる環境にデプロイできます。スキーマは柔軟でユーザーが変更可能であり、UI はコード側の変更なしにカスタムスキーマに対応できるよう設計されています。Collector、ClickHouse、UI を含むすべてのコンポーネントは、インジェスト、クエリ、ストレージの要件に合わせて個別にスケールできます。



## アーキテクチャ概要 {#architectural-overview}

<Image img={architecture} alt="シンプルなアーキテクチャ" size="lg"/>

ClickStack は、次の 3 つのコアコンポーネントで構成されています。

1. **HyperDX UI**  
   オブザーバビリティ向けに構築されたユーザーフレンドリーなインターフェースです。Lucene スタイルおよび SQL クエリの両方に対応し、インタラクティブなダッシュボード、アラート、トレースの探索などをサポートします。これらはすべて、バックエンドとして ClickHouse を最適に活用できるよう最適化されています。

2. **OpenTelemetry collector**  
   ClickHouse へのインジェストに最適化された、明確な設計方針に基づくスキーマを備えたカスタムビルドの collector です。OpenTelemetry プロトコル経由でログ、メトリクス、トレースを受信し、高効率なバッチ挿入を用いて ClickHouse に直接書き込みます。

3. **ClickHouse**  
   wide events（ワイドイベント）を中央で保持する、高性能な分析データベースです。ClickHouse は、そのカラム型エンジンと JSON のネイティブサポートを活用し、大規模な検索、フィルタリング、集約を高速に実行します。

これら 3 つのコンポーネントに加えて、ClickStack は **MongoDB インスタンス** を使用して、ダッシュボード、ユーザーアカウント、設定情報などのアプリケーション状態を保存します。

アーキテクチャ全体の図とデプロイの詳細は、[「Architecture」セクション](/use-cases/observability/clickstack/architecture)に記載されています。

ClickStack を本番環境にデプロイすることを検討している場合は、["Production"](/use-cases/observability/clickstack/production) ガイドを参照することを推奨します。
