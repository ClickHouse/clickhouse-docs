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


## 概要 {#overview}

BYOC（Bring Your Own Cloud）は、お客様自身のクラウドインフラストラクチャ上に ClickHouse Cloud をデプロイできるオプションです。ClickHouse Cloud のマネージドサービスを利用できない特定の要件や制約がある場合に有用です。

> **ご利用を希望される場合は、[こちらからお問い合わせください](https://clickhouse.com/cloud/bring-your-own-cloud)。** 追加情報については、[利用規約](https://clickhouse.com/legal/agreements/terms-of-service)をご参照ください。

:::note 
BYOC は特に大規模なデプロイメント向けに設計されており、ご利用にあたってはコミットメント契約の締結が必要です。
:::

対応しているクラウドサービスプロバイダー:

* AWS (GA)
* GCP (Private Preview)。ご興味のある方は[こちら](https://clickhouse.com/cloud/bring-your-own-cloud)からウェイティングリストにご登録ください。
* Azure (Roadmap)。ご興味のある方は[こちら](https://clickhouse.com/cloud/bring-your-own-cloud)からウェイティングリストにご登録ください。

## 用語集 {#glossary}

- **ClickHouse VPC:**  ClickHouse Cloud が所有する VPC。
- **Customer BYOC VPC:** 顧客のクラウドアカウントが所有し、ClickHouse Cloud によってプロビジョニングおよび管理される、ClickHouse Cloud の BYOC デプロイメント専用の VPC。
- **Customer VPC:** Customer BYOC VPC に接続する必要があるアプリケーションのために、顧客のクラウドアカウントが所有するその他の VPC。

## アーキテクチャ {#architecture}

メトリクスとログは、顧客の BYOC VPC 内に保存されています。ログは現在、EBS のローカルストレージに保存されています。今後のアップデートでは、ログは LogHouse に保存される予定であり、LogHouse は顧客の BYOC VPC 内で動作する ClickHouse サービスです。メトリクスは、顧客の BYOC VPC 内にローカルで構成された Prometheus と Thanos のスタックによって実装されています。

<br />

<Image img={byoc1} size="lg" alt="BYOC アーキテクチャ" background='black'/>

<br />

## 機能 {#features}

### サポートされている機能 {#supported-features}

- **SharedMergeTree**: ClickHouse Cloud と BYOC は同じバイナリと設定を使用します。そのため、SharedMergeTree をはじめとする ClickHouse コアのすべての機能が BYOC でもサポートされます。
- **サービス状態管理のためのコンソールアクセス**:
  - 開始、停止、終了などの操作をサポート。
  - サービスとそのステータスを表示。
- **バックアップとリストア。**
- **手動による垂直および水平スケーリング。**
- **自動アイドリング機能。**
- **Warehouse**: Compute-Compute 分離
- **Tailscale を用いたゼロトラストネットワーク。**
- **監視**:
  - Cloud コンソールには、サービスの健全性を監視するための組み込みヘルスダッシュボードが用意されています。
  - Prometheus、Grafana、Datadog を用いた集中監視のための Prometheus スクレイピング。セットアップ手順については [Prometheus ドキュメント](/integrations/prometheus) を参照してください。
- **VPC ピアリング。**
- **インテグレーション**: 完全な一覧は[このページ](/integrations)を参照してください。
- **セキュアな S3。**
- **[AWS PrivateLink](https://aws.amazon.com/privatelink/)。**

### 計画中の機能（現在は未サポート） {#planned-features-currently-unsupported}

- [AWS KMS](https://aws.amazon.com/kms/)、別名 CMEK（customer-managed encryption keys）
- ClickPipes
- オートスケーリング
- MySQL インターフェース