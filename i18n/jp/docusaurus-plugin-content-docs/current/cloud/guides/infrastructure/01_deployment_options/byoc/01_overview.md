---
title: '概要'
slug: /cloud/reference/byoc/overview
sidebar_label: '概要'
keywords: ['BYOC', 'cloud', 'bring your own cloud']
description: 'お使いのクラウドインフラストラクチャ上に ClickHouse をデプロイする'
doc_type: 'reference'
---



## 概要 {#overview}

BYOC（Bring Your Own Cloud）を使用すると、お客様独自のクラウドインフラストラクチャ上にClickHouse Cloudをデプロイできます。ClickHouse Cloudマネージドサービスの利用が困難な特定の要件や制約がある場合に有用です。

> **アクセスをご希望の場合は、[お問い合わせください](https://clickhouse.com/cloud/bring-your-own-cloud)。** 詳細については、[利用規約](https://clickhouse.com/legal/agreements/terms-of-service)をご参照ください。

BYOCは現在AWSのみでサポートされています。GCPおよびAzureのウェイトリストには[こちら](https://clickhouse.com/cloud/bring-your-own-cloud)から登録できます。

:::note
BYOCは大規模デプロイメント専用に設計されており、お客様にはコミット契約への署名が必要です。
:::


## 用語集 {#glossary}

- **ClickHouse VPC:** ClickHouse Cloudが所有するVPC。
- **Customer BYOC VPC:** 顧客のクラウドアカウントが所有し、ClickHouse Cloudによってプロビジョニングおよび管理される、ClickHouse Cloud BYOCデプロイメント専用のVPC。
- **Customer VPC:** 顧客のクラウドアカウントが所有するその他のVPCで、Customer BYOC VPCへの接続が必要なアプリケーションで使用される。


## 機能 {#features}

### サポートされている機能 {#supported-features}

- **SharedMergeTree**: ClickHouse CloudとBYOCは同じバイナリと設定を使用します。そのため、SharedMergeTreeなど、ClickHouseコアのすべての機能がBYOCでサポートされています。
- **サービス状態を管理するためのコンソールアクセス**:
  - 起動、停止、終了などの操作をサポートします。
  - サービスとステータスを表示します。
- **バックアップと復元**
- **手動による垂直および水平スケーリング**
- **アイドリング**
- **Warehouses**: コンピュート-コンピュート分離
- **Tailscaleによるゼロトラストネットワーク**
- **モニタリング**:
  - Cloudコンソールには、サービスの健全性を監視するための組み込みヘルスダッシュボードが含まれています。
  - Prometheus、Grafana、Datadogによる集中監視のためのPrometheusスクレイピング。セットアップ手順については、[Prometheusドキュメント](/integrations/prometheus)を参照してください。
- **VPCピアリング**
- **インテグレーション**: 完全なリストは[このページ](/integrations)を参照してください。
- **セキュアS3**
- **[AWS PrivateLink](https://aws.amazon.com/privatelink/)**

### 計画中の機能(現在未サポート) {#planned-features-currently-unsupported}

- [AWS KMS](https://aws.amazon.com/kms/) (CMEK: カスタマー管理暗号化キー)
- データ取り込み用のClickPipes
- オートスケーリング
- MySQLインターフェース
