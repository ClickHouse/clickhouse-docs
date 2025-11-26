---
sidebar_label: 'アーキテクチャ'
slug: /cloud/reference/architecture
title: 'ClickHouse Cloud アーキテクチャ'
description: 'このページでは ClickHouse Cloud のアーキテクチャを説明します'
keywords: ['ClickHouse Cloud', 'クラウドアーキテクチャ', 'ストレージとコンピュートの分離']
doc_type: 'reference'
---

import Image from '@theme/IdealImage';
import Architecture from '@site/static/images/cloud/reference/architecture.png';


# ClickHouse Cloud アーキテクチャ

<Image img={Architecture} size='lg' alt='ClickHouse Cloud のアーキテクチャ'/>



## オブジェクトストレージをバックエンドにしたストレージ {#storage-backed-by-object-store}
- 事実上無制限のストレージ容量
- データを手動で共有する必要がない
- 特にアクセス頻度の低いデータの保存において、コストを大幅に削減できる



## コンピュート {#compute}
- 自動スケーリングとアイドリング: 事前にリソース容量を見積もる必要がなく、ピーク時を見越した過剰なプロビジョニングも不要
- 自動アイドリングと再開: 利用者がいない間に未使用のコンピュートリソースを動かしておく必要がない
- 標準でセキュアかつ高可用



## 管理 {#administration}
- セットアップ、モニタリング、バックアップ、課金はすべてサービス側で実行されます。
- コスト管理機能はデフォルトで有効になっており、Cloud コンソールから調整できます。



## サービス分離 {#service-isolation}

### ネットワーク分離 {#network-isolation}

すべてのサービスはネットワーク層で分離されています。

### コンピュート分離 {#compute-isolation}

すべてのサービスは、それぞれの Kubernetes 名前空間内で個別のポッドとしてデプロイされており、ネットワークレベルで分離されています。

### ストレージ分離 {#storage-isolation}

すべてのサービスは、共有バケット（AWS、GCP）またはストレージコンテナ（Azure）内の、サービス専用サブパスを使用します。

AWS の場合、ストレージへのアクセスは AWS IAM によって制御されており、各 IAM ロールはサービスごとに固有です。Enterprise サービスでは、保存データの高度な分離を提供するために [CMEK](/cloud/security/cmek) を有効化できます。現時点では、CMEK は AWS サービスでのみサポートされています。

GCP および Azure の場合、サービスはオブジェクトストレージレベルで分離されており（すべてのサービスが独自のバケットまたはストレージコンテナを持ちます）。



## コンピュート間分離 {#compute-compute-separation}
[コンピュート間分離](/cloud/reference/warehouses) により、同じオブジェクトストレージを共有しつつ、それぞれ固有のサービス URL を持つ複数のコンピュートグループを作成できます。これにより、同一データを共有しながら、読み取りと書き込みなどの異なるユースケース間でコンピュートリソースを分離できます。また、コンピュートグループごとに必要に応じて独立してスケーリングできるため、リソースをより効率的に活用できます。



## 同時実行制限 {#concurrency-limits}

ClickHouse Cloud サービスでは、1 秒あたりのクエリ数（QPS）に上限はありません。ただし、レプリカごとの同時実行クエリ数には 1000 件という上限があります。QPS は最終的には、平均クエリ実行時間とサービス内のレプリカ数によって決まります。

自己管理型の ClickHouse インスタンスや他のデータベース／データウェアハウスと比較した場合、ClickHouse Cloud の大きな利点は、[レプリカを追加する（水平スケーリング）ことで](/manage/scaling#manual-horizontal-scaling) 同時実行数を簡単に増やせることです。
