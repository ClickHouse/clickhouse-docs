---
title: 'ClickHouse Private'
slug: /cloud/infrastructure/clickhouse-private
keywords: ['プライベート', 'オンプレミス']
description: 'ClickHouse Private 提供の概要'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import private_gov_architecture from '@site/static/images/cloud/reference/private-gov-architecture.png';


## 概要 \{#overview\}

ClickHouse Private は、ClickHouse Cloud 上で動作しているものと同じプロプライエタリ版の ClickHouse と、コンピュートとストレージの分離向けに構成された ClickHouse Operator で構成されるセルフホスト型パッケージです。

:::note 注記
ClickHouse Private は、専用インフラストラクチャに対する完全な制御を必要とし、2 TB を超えるメモリをデプロイする大企業向けに設計されています。お客様はすべてのインフラストラクチャの管理責任を負うため、大規模な ClickHouse の運用に関する知識を備えている必要があります。このオプションは、[お問い合わせ](https://clickhouse.com/company/contact?loc=nav) を通じてのみご利用いただけます。
:::

## オープンソースに対する利点 \{#benefits-over-os\}

以下の機能により、ClickHouse Private は自己管理型のオープンソースデプロイメントとの差別化を実現しています。

- コンピュートとストレージのネイティブな分離
- [shared merge tree](/cloud/reference/shared-merge-tree) や [warehouse](/cloud/reference/warehouses) 機能などのプロプライエタリなクラウド機能
- ClickHouse Cloud で十分にテストおよび検証された ClickHouse データベースおよび Operator のバージョン
- バックアップやスケーリング操作を含む、プログラムによる操作のための API

## アーキテクチャ \{#architecture\}

ClickHouse Private は、お使いのデプロイ環境内で完結しており、当社が提供するクラウドネイティブなコンピュートとストレージの分離を実現します。

<br />

<Image img={private_gov_architecture} size="md" alt="ClickHouse Private のアーキテクチャ" background="black" />

<br />

## サポート対象の構成 \{#supported-configurations\}

ClickHouse Private は現在、以下の構成をサポートしています。

| 環境    | オーケストレーション                       | ストレージ                       | ステータス |
| :---- | :------------------------------- | :-------------------------- | :---- |
| AWS   | Elastic Kubernetes Service (EKS) | Simple Storage Service (S3) | 利用可能  |
| GCP   | Google Kubernetes Service (GKS)  | Google Cloud Storage (GCS)  | プレビュー |
| ベアメタル | Kubernetes                       | AIStor (NVMe 必須)            | プレビュー | 

## オンボーディングプロセス \{#onboarding-process\}

お客様は、[お問い合わせ](https://clickhouse.com/company/contact?loc=nav)からご連絡のうえ、ユースケースに応じた ClickHouse Private の検討に関する打ち合わせを依頼できます。最小規模要件を満たし、サポート対象の構成にデプロイされるユースケースが審査対象となります。オンボーディングには限りがあります。インストールプロセスでは、AWS ECR からダウンロードしたイメージおよび Helm チャートを使用して ClickHouse をデプロイする対象環境向けのインストールガイドに従います。