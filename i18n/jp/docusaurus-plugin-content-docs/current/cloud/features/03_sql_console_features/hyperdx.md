---
sidebar_label: 'HyperDX'
slug: /cloud/manage/hyperdx
title: 'HyperDX'
description: 'ClickHouse と OpenTelemetry (OTel) 上に構築された本番運用グレードのオブザーバビリティプラットフォーム ClickStack の UI である HyperDX を提供します。ClickStack はログ、トレース、メトリクス、セッションを単一の高性能かつスケーラブルなソリューションとして統合します。'
doc_type: 'guide'
keywords: ['hyperdx', 'observability', 'integration', 'cloud features', 'monitoring']
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';
import Image from '@theme/IdealImage';
import hyperdx_cloud from '@site/static/images/use-cases/observability/hyperdx_cloud.png';

<PrivatePreviewBadge />

HyperDX は [**ClickStack**](/use-cases/observability/clickstack) のユーザーインターフェースであり、ClickHouse と OpenTelemetry (OTel) 上に構築された本番環境対応のオブザーバビリティプラットフォームです。ログ、トレース、メトリクス、セッションを単一の高性能なソリューションとして統合します。複雑なシステムの監視とデバッグのために設計されており、ClickStack を利用することで開発者や SRE は、ツール間を行き来したり、タイムスタンプや相関 ID を使って手作業でデータを突き合わせることなく、エンドツーエンドで問題をトレースできます。

HyperDX は、オブザーバビリティデータの探索と可視化のために特化して設計されたフロントエンドであり、Lucene 風および SQL クエリの両方、インタラクティブなダッシュボード、アラート、トレースの探索などをサポートし、バックエンドとしての ClickHouse に最適化されています。

ClickHouse Cloud における HyperDX により、ユーザーはよりすぐに使い始められる ClickStack 体験を得ることができます。管理すべきインフラも、個別に設定する認証も不要です。
HyperDX はワンクリックで起動してデータに接続でき、ClickHouse Cloud の認証システムに完全に統合されているため、オブザーバビリティに関するインサイトへシームレスかつ安全にアクセスできます。


## デプロイメント {#main-concepts}

ClickHouse Cloud における HyperDX は現在プライベートプレビュー中であり、組織レベルで有効化する必要があります。有効化すると、任意のサービスを選択した際に、左側のメインナビゲーションに HyperDX が表示されるようになります。

<Image img={hyperdx_cloud} alt="ClickHouse Cloud の HyperDX" size="lg"/>

ClickHouse Cloud で HyperDX を使い始めるには、専用の[クイックスタートガイド](/use-cases/observability/clickstack/deployment/hyperdx-clickhouse-cloud)を参照することを推奨します。

ClickStack の詳細については、[ドキュメント全体](/use-cases/observability/clickstack)を参照してください。 