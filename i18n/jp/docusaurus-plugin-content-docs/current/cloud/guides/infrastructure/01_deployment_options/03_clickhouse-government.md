---
title: 'ClickHouse government'
slug: /cloud/infrastructure/clickhouse-government
keywords: ['政府', 'fips', 'fedramp', '政府クラウド']
description: 'ClickHouse Government 提供サービスの概要'
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import private_gov_architecture from '@site/static/images/cloud/reference/private-gov-architecture.png';


## 概要 \{#overview\}

ClickHouse Government は、ClickHouse Cloud 上で動作するものと同じプロプライエタリ版の ClickHouse と、コンピュートとストレージの分離向けに構成され、政府機関および公共部門の組織の厳格な要求を満たすよう強化された ClickHouse Operator で構成される、セルフデプロイ型パッケージです。 

:::note Note
ClickHouse Government は、政府機関、公共部門の組織、またはそれらの機関や組織に販売するクラウドソフトウェア企業向けに設計されており、それぞれの専用インフラストラクチャに対する完全な制御と管理を提供します。最小デプロイメントサイズは 2 TB です。このオプションは、[お問い合わせ](https://clickhouse.com/government) いただいた場合にのみご利用いただけます。
:::

## オープンソースに対するメリット \{#benefits-over-os\}

以下の機能により、ClickHouse Government は自己管理のオープンソースデプロイメントとは一線を画します。

- コンピュートとストレージのネイティブな分離
- [shared merge tree](/cloud/reference/shared-merge-tree) や [warehouse](/cloud/reference/warehouses) の機能などの独自のクラウド機能
- ClickHouse のデータベースおよび Operator のバージョンは、ClickHouse Cloud で完全にテストおよび検証されています
- Authorization to Operate (ATO) の取得を加速するための [NIST Risk Management Framework (RMF)](https://csrc.nist.gov/projects/risk-management/about-rmf) ドキュメント
- バックアップやスケーリング操作を含む、プログラムによる操作のための API

## アーキテクチャ \{#architecture\}

ClickHouse Government は、デプロイ環境内で完全に自己完結して動作し、当社のクラウドネイティブなコンピュートとストレージの分離を実現します。

<br />

<Image img={private_gov_architecture} size="md" alt="ClickHouse Government アーキテクチャ" background="black" />

<br />

## サポート対象の構成 \{#supported-configurations\}

ClickHouse Government は現在、以下の構成をサポートしています。

| 環境  | オーケストレーション                       | ストレージ                       | 状態    |
| :-- | :------------------------------- | :-------------------------- | :---- |
| AWS | Elastic Kubernetes Service (EKS) | Simple Storage Service (S3) | 利用可能  |
| GCP | Google Kubernetes Service (GKS)  | Google Cloud Storage (GCS)  | プレビュー |

## オンボーディングプロセス \{#onboarding-process\}

お客様は、[お問い合わせ](https://clickhouse.com/company/contact?loc=nav)いただくことで、ご利用のユースケースに対する ClickHouse Government の適合性を確認するための打ち合わせを依頼できます。最小規模要件を満たし、サポート対象の構成にデプロイされるユースケースについて審査を行います。オンボーディングの提供数には限りがあります。インストールプロセスでは、AWS ECR からダウンロードしたイメージと Helm チャートを使用して ClickHouse をデプロイする対象環境向けのインストールガイドに従います。