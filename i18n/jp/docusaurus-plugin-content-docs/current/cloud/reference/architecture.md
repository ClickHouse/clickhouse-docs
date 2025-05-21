---
sidebar_label: 'アーキテクチャ'
slug: /cloud/reference/architecture
title: 'ClickHouse Cloud アーキテクチャ'
description: 'このページでは、ClickHouse Cloud のアーキテクチャについて説明します'
---

import Architecture from '@site/static/images/cloud/reference/architecture.svg';


# ClickHouse Cloud アーキテクチャ

<Architecture alt='ClickHouse Cloud アーキテクチャ' class='image' />

## オブジェクトストアに基づくストレージ {#storage-backed-by-object-store}
- 実質的に無限のストレージ
- データを手動で共有する必要がない
- 特にアクセス頻度が低いデータのストレージコストが大幅に削減されます

## コンピュート {#compute}
- 自動スケーリングとアイドル: 事前にサイズを決定する必要がなく、ピーク時に過剰にプロビジョニングする必要がありません
- 自動アイドルと再開: 誰も使用していないときに未使用のコンピュートを実行しておく必要がありません
- デフォルトでセキュアで高可用性

## 管理 {#administration}
- セットアップ、モニタリング、バックアップ、請求は自動的に行われます。
- コスト管理はデフォルトで有効になっており、Cloud コンソールを通じてユーザーが調整可能です。

## サービスの分離 {#service-isolation}

### ネットワーク分離 {#network-isolation}

すべてのサービスはネットワークレイヤーで分離されています。

### コンピュート分離 {#compute-isolation}

すべてのサービスは、それぞれの Kubernetes スペース内の別々のポッドにデプロイされ、ネットワークレベルで分離されています。

### ストレージ分離 {#storage-isolation}

すべてのサービスは、共有バケット（AWS、GCP）またはストレージコンテナ（Azure）の別のサブパスを使用します。

AWSの場合、ストレージへのアクセスは AWS IAM を通じて制御されており、各 IAM ロールはサービスごとに独自のものです。エンタープライズサービスの場合、[CMEK](/cloud/security/cmek) を有効にすることで、静止状態のデータに対する高度な分離を提供できます。CMEKは現時点ではAWSサービスのみサポートされています。

GCP および Azure の場合、サービスはオブジェクトストレージの分離を持っています（すべてのサービスが独自のバケットまたはストレージコンテナを持っています）。

## コンピュート-コンピュート分離 {#compute-compute-separation}
[コンピュート-コンピュート分離](/cloud/reference/warehouses) により、ユーザーはそれぞれ独自のサービス URL を持つ複数のコンピュートノードグループを作成できます。これらは、すべて同じ共有オブジェクトストレージを使用します。これにより、同じデータを共有する書き込みからの読み取りなど、異なるユースケースのコンピュートの分離が可能になります。また、必要に応じてコンピュートグループを独立してスケーリングすることで、リソースの効率的な利用につながります。

## 同時実行制限 {#concurrency-limits}

ClickHouse Cloud サービス内のクエリ数（QPS）に制限はありません。ただし、各レプリカあたりの同時クエリの制限は 1000 です。QPS は最終的には平均クエリ実行時間とサービス内のレプリカ数に依存します。

ClickHouse Cloud の主な利点は、セルフマネージドの ClickHouse インスタンスや他のデータベース/データウェアハウスに比べて、[レプリカを追加することで同時実行性を簡単に増加させることができる（水平スケーリング）](/manage/scaling#manual-horizontal-scaling)点です。
