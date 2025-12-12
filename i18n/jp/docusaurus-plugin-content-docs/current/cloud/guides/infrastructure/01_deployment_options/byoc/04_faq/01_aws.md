---
title: 'AWS での BYOC に関する FAQ'
slug: /cloud/reference/byoc/faq/aws
sidebar_label: 'AWS'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'AWS']
description: 'お使いのクラウドインフラストラクチャ上に ClickHouse をデプロイする'
doc_type: 'reference'
---



## FAQ {#faq}

### コンピュート {#compute}

<details>
<summary>1 つの EKS クラスター上に複数のサービスを作成できますか？</summary>

はい。インフラストラクチャは、AWS アカウントとリージョンの組み合わせごとに 1 回だけプロビジョニングすれば十分です。

</details>

<details>
<summary>BYOC ではどのリージョンがサポートされていますか？</summary>

BYOC は、ClickHouse Cloud と同じ [リージョン](/cloud/reference/supported-regions#aws-regions ) をサポートします。

</details>

<details>
<summary>リソースのオーバーヘッドは発生しますか？ClickHouse インスタンス以外のサービスを実行するために必要なリソースは何ですか？</summary>

ClickHouse インスタンス（ClickHouse サーバーと ClickHouse Keeper）に加えて、`clickhouse-operator`、`aws-cluster-autoscaler`、Istio などのサービスと監視スタックを実行します。

現在、専用のノードグループに m5.xlarge ノードを 3 台（各 AZ に 1 台）用意し、これらのワークロードを実行しています。

</details>

### ネットワークとセキュリティ {#network-and-security}

<details>
<summary>セットアップ完了後に、インストール時に設定した権限を取り消すことはできますか？</summary>

現時点ではできません。

</details>

<details>
<summary>トラブルシューティングのために ClickHouse エンジニアが顧客インフラへアクセスする際の、将来的なセキュリティ制御については検討済みですか？</summary>

はい。顧客がエンジニアのクラスターへのアクセスを承認できる、顧客管理型のメカニズムの実装をロードマップに含めています。現時点では、エンジニアはクラスターへのジャストインタイムアクセスを取得するために、当社内部のエスカレーションプロセスを経る必要があります。これはセキュリティチームによって記録および監査されます。

</details>

<details>
<summary>作成される VPC の IP レンジのサイズはどのくらいですか？</summary>

デフォルトでは、BYOC VPC に `10.0.0.0/16` を使用します。将来的なスケーリングの可能性を考慮し、少なくとも /22 を予約することを推奨しますが、規模を制限したい場合、サーバーのポッド数が 30 に制限される見込みであれば /23 を使用することも可能です。

</details>

<details>
<summary>メンテナンス頻度を自分で決めることはできますか？</summary>

サポートに連絡し、メンテナンスウィンドウをスケジュールしてください。少なくとも週 1 回の更新スケジュールになるとお考えください。

</details>

### 稼働率 SLA {#uptime-sla}

<details>
<summary>ClickHouse は BYOC に対して稼働率 SLA を提供していますか？</summary>

いいえ。データプレーンは顧客のクラウド環境にホストされているため、サービス可用性は ClickHouse の管理外のリソースに依存します。そのため、ClickHouse は BYOC デプロイメントに対して正式な稼働率 SLA を提供していません。追加の質問がある場合は、support@clickhouse.com までご連絡ください。

</details>