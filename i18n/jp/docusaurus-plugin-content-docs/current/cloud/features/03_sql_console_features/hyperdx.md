---
sidebar_label: 'HyperDX'
slug: /cloud/manage/hyperdx
title: 'HyperDX'
description: 'ClickHouse と OpenTelemetry（OTel）上に構築された、本番環境向けオブザーバビリティプラットフォーム ClickStack の UI である HyperDX を提供します。ログ、トレース、メトリクス、セッションを、単一の高性能かつスケーラブルなソリューションに統合します。'
doc_type: 'guide'
keywords: ['hyperdx', 'オブザーバビリティ', '統合', 'Cloud の機能', '監視']
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx_cloud.png';

<PrivatePreviewBadge />

HyperDX は、ClickHouse と OpenTelemetry (OTel) を基盤に構築された本番運用向けのオブザーバビリティ プラットフォーム [**ClickStack**](/use-cases/observability/clickstack) のユーザー インターフェースです。ログ、トレース、メトリクス、セッション データを単一の高性能ソリューションに統合します。複雑なシステムの監視とデバッグ向けに設計された ClickStack により、開発者と SRE は、ツールを切り替えたり、タイムスタンプや相関 ID を使って手作業でデータをつなぎ合わせたりすることなく、問題をエンドツーエンドで追跡できます。

HyperDX は、オブザーバビリティ データの探索と可視化のために専用設計されたフロントエンドであり、Lucene スタイルと SQL クエリの両方、インタラクティブなダッシュボード、アラート、トレース探索などをサポートします。これらはすべて、バックエンドとしての ClickHouse 向けに最適化されています。

ClickHouse Cloud の HyperDX を使用すると、より簡単に導入できる ClickStack を利用できます。管理すべきインフラストラクチャはなく、個別に認証を構成する必要もありません。
HyperDX はワンクリックで起動してデータに接続でき、ClickHouse Cloud の認証システムに完全に統合されているため、オブザーバビリティのインサイトにシームレスかつ安全にアクセスできます。

## デプロイメント \{#main-concepts\}

ClickHouse Cloud の HyperDX は現在プライベートプレビュー中で、組織レベルで有効にする必要があります。有効にすると、任意のサービスを選択した際に、左側のメインナビゲーションメニューに HyperDX が表示されます。

<Image img={hyperdx_cloud} alt="ClickHouse Cloud HyperDX" size="lg" />

ClickHouse Cloud で HyperDX を使い始めるには、専用の[導入ガイド](/use-cases/observability/clickstack/deployment/clickstack-clickhouse-cloud)を参照することを推奨します。

ClickStack の詳細については、[完全版ドキュメント](/use-cases/observability/clickstack)を参照してください。