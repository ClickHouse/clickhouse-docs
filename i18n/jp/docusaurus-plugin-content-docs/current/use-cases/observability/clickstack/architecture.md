---
slug: /use-cases/observability/clickstack/architecture
pagination_prev: null
pagination_next: null
description: 'ClickStack のアーキテクチャ - ClickHouse オブザーバビリティスタック'
title: 'アーキテクチャ'
doc_type: 'reference'
keywords: ['ClickStack architecture', 'observability architecture', 'HyperDX', 'OpenTelemetry collector', 'MongoDB', 'system design']
---

import Image from '@theme/IdealImage';
import architecture from '@site/static/images/use-cases/observability/clickstack-architecture.png';

ClickStack のアーキテクチャは、**ClickHouse**、**HyperDX**、および **OpenTelemetry (OTel) コレクター**という 3 つの中核コンポーネントを中心に構成されています。**MongoDB** インスタンスはアプリケーション状態の保存先を提供します。これらを組み合わせることで、ログ、メトリクス、トレースに最適化された高性能なオープンソースのオブザーバビリティスタックを提供します。


## アーキテクチャ概要 {#architecture-overview}

<Image img={architecture} alt='アーキテクチャ' size='lg' />


## ClickHouse: データベースエンジン {#clickhouse}

ClickStackの中核を担うのはClickHouseです。これは大規模なリアルタイム分析向けに設計されたカラム指向データベースであり、オブザーバビリティデータの取り込みとクエリを実現し、以下を可能にします:

- テラバイト規模のイベントに対するサブセカンド検索
- 1日あたり数十億件の高カーディナリティレコードの取り込み
- オブザーバビリティデータに対する最低10倍の高圧縮率
- 半構造化JSONデータのネイティブサポートによる動的なスキーマ進化の実現
- 数百の組み込み分析関数を備えた強力なSQLエンジン

ClickHouseはオブザーバビリティデータをワイドイベントとして処理し、ログ、メトリクス、トレースを単一の統合構造内で深く相関させることができます。


## OpenTelemetryコレクター: データ取り込み {#open-telemetry-collector}

ClickStackには、オープンで標準化された方法でテレメトリを取り込むための事前設定済みのOpenTelemetry（OTel）コレクターが含まれています。ユーザーは、OTLPプロトコルを使用して以下の方法でデータを送信できます：

- gRPC（ポート`4317`）
- HTTP（ポート`4318`）

コレクターは、テレメトリを効率的なバッチでClickHouseにエクスポートします。データソースごとに最適化されたテーブルスキーマをサポートし、すべてのシグナルタイプにわたってスケーラブルなパフォーマンスを実現します。


## HyperDX: インターフェース {#hyperdx}

HyperDXはClickStackのユーザーインターフェースです。以下の機能を提供します:

- 自然言語およびLucene形式の検索
- リアルタイムデバッグのためのライブテーリング
- ログ、メトリクス、トレースの統合ビュー
- フロントエンド可観測性のためのセッションリプレイ
- ダッシュボード作成とアラート設定
- 高度な分析のためのSQLクエリインターフェース

ClickHouse専用に設計されたHyperDXは、強力な検索機能と直感的なワークフローを組み合わせ、ユーザーが異常を検出し、問題を調査し、迅速にインサイトを得ることを可能にします。


## MongoDB: アプリケーション状態 {#mongo}

ClickStackはMongoDBを使用してアプリケーションレベルの状態を保存します。これには以下が含まれます：

- ダッシュボード
- アラート
- ユーザープロファイル
- 保存された可視化

状態とイベントデータを分離することで、パフォーマンスとスケーラビリティを確保しながら、バックアップと設定を簡素化します。

このモジュラーアーキテクチャにより、ClickStackは高速で柔軟性があり、オープンソースのすぐに使えるオブザーバビリティプラットフォームを提供できます。
