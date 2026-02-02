---
title: 'BYOC よくある質問'
slug: /cloud/reference/byoc/reference/faq
sidebar_label: 'FAQ'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'FAQ']
description: 'お使いのクラウドインフラストラクチャ上で ClickHouse をデプロイする'
doc_type: 'reference'
---

## FAQ（よくあるご質問） \{#faq\}

### コンピュート \{#compute\}

<details>
<summary>この単一の EKS クラスター内に複数のサービスを作成できますか？</summary>

はい。インフラストラクチャは、AWS アカウントとリージョンの組み合わせごとに 1 回だけプロビジョニングすれば十分です。

</details>

<details>
<summary>BYOC ではどのリージョンをサポートしていますか？</summary>

BYOC は、ClickHouse Cloud と同じ[リージョン](/cloud/reference/supported-regions#aws-regions )をサポートします。

</details>

<details>
<summary>リソースのオーバーヘッドは発生しますか？ ClickHouse インスタンス以外のサービスを実行するために必要なリソースは何ですか？</summary>

ClickHouse インスタンス（ClickHouse サーバーおよび ClickHouse Keeper）に加えて、`clickhouse-operator`、`aws-cluster-autoscaler`、Istio などのサービスや監視スタックを実行します。

現在、これらのワークロードを実行するために、専用ノードグループ内に m5.xlarge ノードを 3 台（各 AZ に 1 台）用意しています。

</details>

### ネットワークとセキュリティ \{#network-and-security\}

<details>
<summary>セットアップ完了後に、インストール時に設定した権限を取り消すことはできますか？</summary>

現時点ではできません。

</details>

<details>
<summary>トラブルシューティングのために ClickHouse エンジニアが顧客インフラへアクセスする際の、将来的なセキュリティ制御は検討していますか？</summary>

はい。お客様がクラスターへのエンジニアのアクセスを承認できるようにする、お客様が制御可能な仕組みの実装をロードマップに含めています。現時点では、エンジニアはクラスターへのジャストインタイムアクセスを得るために、社内のエスカレーションプロセスを経る必要があります。このプロセスはセキュリティチームによって記録および監査されます。

</details>

<details>
<summary>作成される VPC の IP レンジのサイズはどのくらいですか？</summary>

デフォルトでは、BYOC VPC に対して `10.0.0.0/16` を使用します。将来のスケーリングの可能性を考慮して、少なくとも /22 を確保することを推奨しますが、サイズを制限したい場合は、サーバーポッドが 30 個に制限される見込みであれば /23 を使用することも可能です。

</details>

<details>
<summary>メンテナンスの頻度を自分で決めることはできますか？</summary>

メンテナンスウィンドウのスケジュールについては、サポートにお問い合わせください。最低でも週次のアップデートスケジュールを想定してください。

</details>

<details>
<summary>BYOC VPC と S3 間のストレージ通信はどのように機能しますか？</summary>

お客様の BYOC VPC と S3 間のトラフィックは、テーブルデータ、バックアップ、およびログに対して AWS S3 API を介し、HTTPS（ポート 443）を使用します。S3 VPC エンドポイントを使用する場合、このトラフィックは AWS ネットワーク内にとどまり、パブリックインターネットを通過しません。

</details>

<details>
<summary>内部の ClickHouse クラスター通信にはどのポートが使用されますか？</summary>

Customer BYOC VPC 内部の ClickHouse クラスター通信には、次のポートが使用されます:
- ポート 9000 上の ClickHouse ネイティブプロトコル
- ポート 8123/8443 上の HTTP/HTTPS
- レプリケーションおよび分散クエリ用の、ポート 9009 上のサーバー間通信

</details>

### 稼働時間 SLA \{#uptime-sla\}

<details>
<summary>ClickHouse は BYOC 向けに稼働時間 SLA を提供していますか？</summary>

いいえ。データプレーンはお客様の Cloud 環境でホストされるため、サービスの可用性は ClickHouse の管理外のリソースに依存します。このため、ClickHouse は BYOC デプロイメント向けに正式な稼働時間 SLA を提供していません。その他のご質問がある場合は、support@clickhouse.com までお問い合わせください。

</details>