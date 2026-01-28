---
title: 'BYOC 運用と保守'
slug: /cloud/reference/byoc/operations
sidebar_label: '運用と保守'
keywords: ['BYOC', 'クラウド', 'bring your own cloud', '運用', '保守']
description: 'お客様のクラウドインフラストラクチャ上に ClickHouse をデプロイする'
doc_type: 'reference'
---

## 概要 \{#overview\}

ClickHouse Cloud は、サービスが常に安全で高性能かつ最新の状態に保たれるよう、BYOC デプロイメントのアップグレードとメンテナンスを管理します。このページでは、BYOC インフラストラクチャに含まれる各コンポーネントのアップグレード プロセスと、メンテナンスウィンドウがどのように機能するかについて説明します。

## ClickHouse サービスのアップグレードプロセス \{#clickhouse-upgrade-process\}

ClickHouse データベースは、バージョンアップ、バグ修正、およびパフォーマンス改善を含め、定期的にアップグレードを実施しています。ClickHouse Cloud では、アップグレードに ["make before break" (MBB)](https://clickhouse.com/docs/cloud/features/mbb) アプローチを採用しており、既存のレプリカを削除する前に更新済みのレプリカを追加することで、実行中のワークロードへの影響を最小限に抑えた、よりシームレスなアップグレードを実現します。

BYOC における ClickHouse サービスのアップグレードは、リリースチャネル（Fast、Regular、Slow）のサポートおよびスケジュールされたメンテナンスウィンドウを含め、標準の ClickHouse Cloud サービスと同じプロセスおよびパターンに従います。すべての Scale および Enterprise 階層の機能は BYOC デプロイメントで利用可能です。アップグレードスケジュール、リリースチャネル、およびメンテナンスウィンドウの詳細については、[Upgrades ドキュメント](/manage/updates)を参照してください。

## Cloud サービスおよびリソースのアップグレードプロセス \{#cloud-upgrade-process\}

ClickHouse Cloud は、セキュリティ、信頼性、および新機能へのアクセスを確保するため、Kubernetes 上で動作するサポートサービスおよび BYOC デプロイメント内のインフラストラクチャコンポーネントを定期的にアップグレードします。これらのクラウドサービスのアップグレードはバックグラウンドで実行され、標準的な Cloud リリーススケジュールに合わせて行われます。すべてのサポートサービスは ArgoCD によって管理されており、アップグレードはサービスに影響を与えないように設計されています。これらの更新中にサービス中断が発生することは想定されていません。

アップグレードされるクラウドサービスの例は次のとおりです：

- **ClickHouse Operator**: ClickHouse クラスターを管理する Kubernetes オペレーター
- **Istio Services**: イングレスおよびエージェントコンポーネント
- **Monitoring Stack**: Prometheus、Grafana、AlertManager、および Thanos コンポーネント

## Kubernetes クラスターのアップグレードプロセス \{#k8s-upgrade-process\}

ClickHouse サービスをホストしている Kubernetes クラスター（AWS では EKS、GCP では GKE）は、セキュリティ、互換性、および新機能へのアクセスを維持するために、定期的なアップグレードが必要です。ClickHouse Cloud は、BYOC デプロイメントにおける Kubernetes クラスターのすべてのアップグレードを管理し、クラスターがサポート対象バージョンに常に追従できるようにします。

### クラスターアップグレードの種類 \{#cluster-upgrade-types\}

**コントロールプレーンのアップグレード**: Kubernetes のコントロールプレーンコンポーネント（API server、etcd、controller manager）は ClickHouse Cloud によってアップグレードされます。これらのアップグレードは通常、ワークロードに対して透過的であり、ポッドの再起動を必要としません。

**ノードグループのアップグレード**: ワーカーノードのアップグレードにはノードの置き換えが必要であり、稼働中のポッドに影響を与える可能性があります。ClickHouse Cloud は、影響を最小限に抑えるために make-before-break アプローチを使用してこれらのアップグレードを調整します。

- 既存ノードが削除される前に、新しいノードが更新された Kubernetes バージョンでプロビジョニングされる
- ポッドは新しいノードへグレースフルに drain およびマイグレーションされる
- ポッドのマイグレーションが正常に完了した後にのみ、古いノードが終了される

:::note
Kubernetes ノードのアップグレード中のマイグレーションプロセスでは、短時間のポッド再起動が発生する場合があります。ClickHouse Cloud は PodDisruptionBudget とグレースフルシャットダウンを使用して、ワークロードへの影響を最小限に抑えます。
:::

### アップグレードスケジュール \{#upgrade-schedule\}

Kubernetes クラスターのアップグレードは、ClickHouse サポートを通じてお客様と調整し、スケジュールを決定します。事前にアップグレード計画をご案内し、運用への影響を最小限に抑えられる適切なメンテナンスウィンドウをお客様とともに検討します。

### バージョンサポート \{#version-support\}

ClickHouse Cloud は、クラウドサービスプロバイダー（AWS EKS または Google GKE）が定義するサポート対象バージョン範囲内で Kubernetes クラスターを運用・管理します。プロバイダー要件との互換性を確保しつつ、セキュリティパッチおよび機能アップデートを最新の状態に保てるようクラスターを管理します。