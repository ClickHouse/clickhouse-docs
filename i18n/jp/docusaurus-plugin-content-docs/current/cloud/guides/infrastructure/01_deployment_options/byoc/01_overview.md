---
title: '概要'
slug: /cloud/reference/byoc/overview
sidebar_label: '概要'
keywords: ['BYOC', 'cloud', 'bring your own cloud']
description: '独自のクラウドインフラストラクチャ上に ClickHouse をデプロイする'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import byoc1 from '@site/static/images/cloud/reference/byoc-1.png';


## 概要 \{#overview\}

Bring Your Own Cloud (BYOC) により、ClickHouse Cloud のデフォルトインフラストラクチャに依存するのではなく、お客様自身のクラウドアカウント内に ClickHouse サービスをデプロイし、データを直接保存できます。このアプローチは、データに対する完全なコントロールとデータ主権を求める、厳格なセキュリティポリシーやコンプライアンス要件を持つ組織に特に適しています。

概略として、BYOC では、ClickHouse Cloud によって管理され ClickHouse の VPC 内で動作する ClickHouse のコントロールプレーンと、お客様のクラウドアカウント内で完全に動作し、ClickHouse クラスター、データ、およびバックアップを含むデータプレーンを分離します。関係するコンポーネントの詳細およびそれらの間でトラフィックがどのように流れるかについては、[アーキテクチャ](/cloud/reference/byoc/architecture)ページを参照してください。

> **ご利用を希望される場合は、[こちらからお問い合わせください](https://clickhouse.com/cloud/bring-your-own-cloud)。** 追加情報については、[利用規約](https://clickhouse.com/legal/agreements/terms-of-service)をご参照ください。

:::note 
BYOC は特に大規模なデプロイメント向けに設計されており、ご利用にあたってはコミットメント契約の締結が必要です。
:::

**対応しているクラウドサービスプロバイダー:**

* AWS (GA)
* GCP (Private Preview)。ご興味のある方は[こちら](https://clickhouse.com/cloud/bring-your-own-cloud)からウェイティングリストにご登録ください。
* Azure (Roadmap)。ご興味のある方は[こちら](https://clickhouse.com/cloud/bring-your-own-cloud)からウェイティングリストにご登録ください。

**対応しているクラウドリージョン:**
[サポート対象リージョン](https://clickhouse.com/docs/cloud/reference/supported-regions) ドキュメントに記載されているすべての**パブリックリージョン**が、BYOC デプロイメントで利用可能です。プライベートリージョンは現在サポートされていません。

## 機能 \{#features\}

### サポートされている機能 \{#supported-features\}

- **SharedMergeTree**: ClickHouse Cloud と BYOC は同じバイナリと設定を使用します。そのため、SharedMergeTree をはじめとする ClickHouse コアのすべての機能が BYOC でもサポートされます。
- **Shared Catalog**
- **サービス状態管理のためのコンソールアクセス**:
  - 開始、停止、終了などの操作をサポート。
  - サービスとそのステータスを表示。
- **マネージドバックアップとリストア**
- **手動による垂直および水平スケーリング。**
- **自動アイドリング機能**
- **Warehouse**: Compute-Compute 分離
- **Tailscale を用いたゼロトラストネットワーク。**
- **監視**:
  - Cloud コンソールには、サービスの健全性を監視するための組み込みヘルスダッシュボードが用意されています。
  - Prometheus、Grafana、Datadog を用いた集中監視のための Prometheus スクレイピング。セットアップ手順については [Prometheus ドキュメント](/cloud/reference/byoc/observability#prometheus-monitoring) を参照してください。
- **VPC ピアリング**
- **インテグレーション**: 完全な一覧は[このページ](/integrations)を参照してください。
- **セキュアな S3**
- **[AWS PrivateLink](https://aws.amazon.com/privatelink/)**
- **[GCP Private Service Connect](https://docs.cloud.google.com/vpc/docs/private-service-connect)**

### 計画中の機能（現在は未サポート） \{#planned-features-currently-unsupported\}

- SQL コンソール
- ClickPipes（Kafka, S3）
- ClickPipes（CDC）
- オートスケーリング
- MySQL インターフェース
- [AWS KMS](https://aws.amazon.com/kms/)、別名 CMEK（customer-managed encryption keys）