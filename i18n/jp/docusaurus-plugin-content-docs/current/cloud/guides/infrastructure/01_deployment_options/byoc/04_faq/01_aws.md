---
title: 'AWS での BYOC に関する FAQ'
slug: /cloud/reference/byoc/faq/aws
sidebar_label: 'AWS'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'AWS']
description: '自前のクラウドインフラストラクチャ上で ClickHouse をデプロイする'
doc_type: 'reference'
---



## FAQ {#faq}

### コンピュート {#compute}

<details>
<summary>単一のEKSクラスタ内に複数のサービスを作成できますか？</summary>

はい。インフラストラクチャは、AWSアカウントとリージョンの組み合わせごとに一度プロビジョニングするだけで済みます。

</details>

<details>
<summary>BYOCではどのリージョンをサポートしていますか？</summary>

BYOCは、ClickHouse Cloudと同じ[リージョン](/cloud/reference/supported-regions#aws-regions)をサポートしています。

</details>

<details>
<summary>リソースのオーバーヘッドは発生しますか？ClickHouseインスタンス以外のサービスを実行するために必要なリソースは何ですか？</summary>

ClickHouseインスタンス(ClickHouseサーバーとClickHouse Keeper)に加えて、`clickhouse-operator`、`aws-cluster-autoscaler`、Istioなどのサービスと監視スタックを実行しています。

現在、これらのワークロードを実行するために、専用のノードグループ内に3つのm5.xlargeノード(各AZに1つずつ)を使用しています。

</details>

### ネットワークとセキュリティ {#network-and-security}

<details>
<summary>セットアップ完了後に、インストール時に設定された権限を取り消すことはできますか？</summary>

現時点では対応していません。

</details>

<details>
<summary>ClickHouseエンジニアがトラブルシューティングのために顧客インフラにアクセスする際の、将来的なセキュリティ制御について検討していますか？</summary>

はい。顧客がエンジニアのクラスタへのアクセスを承認できる顧客制御メカニズムの実装をロードマップに含めています。現時点では、エンジニアはクラスタへのジャストインタイムアクセスを取得するために、社内のエスカレーションプロセスを経る必要があります。このアクセスはセキュリティチームによって記録され、監査されます。

</details>

<details>
<summary>作成されるVPC IPレンジのサイズはどのくらいですか？</summary>

デフォルトでは、BYOC VPCに`10.0.0.0/16`を使用します。将来的なスケーリングに備えて、少なくとも/22を確保することを推奨しますが、サイズを制限したい場合は、サーバーポッドが30個程度に制限される見込みであれば、/23を使用することも可能です。

</details>

<details>
<summary>メンテナンス頻度を決定できますか？</summary>

メンテナンスウィンドウをスケジュールするには、サポートにお問い合わせください。最低でも週次の更新スケジュールとなることをご了承ください。

</details>

### 稼働時間SLA {#uptime-sla}

<details>
<summary>ClickHouseはBYOCに対して稼働時間SLAを提供していますか？</summary>

いいえ。データプレーンは顧客のクラウド環境でホストされているため、サービスの可用性はClickHouseの管理下にないリソースに依存します。そのため、ClickHouseはBYOCデプロイメントに対して正式な稼働時間SLAを提供していません。追加のご質問がある場合は、support@clickhouse.comまでお問い合わせください。

</details>
