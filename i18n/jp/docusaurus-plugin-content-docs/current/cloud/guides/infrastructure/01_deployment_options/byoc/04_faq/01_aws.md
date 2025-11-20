---
title: 'AWS における BYOC のよくある質問'
slug: /cloud/reference/byoc/faq/aws
sidebar_label: 'AWS'
keywords: ['BYOC', 'cloud', 'bring your own cloud', 'AWS']
description: '自分のクラウドインフラストラクチャ上で ClickHouse をデプロイする'
doc_type: 'reference'
---



## よくある質問 {#faq}

### コンピュート {#compute}

<details>
<summary>この単一のEKSクラスタ内に複数のサービスを作成できますか？</summary>

はい。インフラストラクチャは、AWSアカウントとリージョンの組み合わせごとに一度プロビジョニングするだけで済みます。

</details>

<details>
<summary>BYOCではどのリージョンをサポートしていますか？</summary>

BYOCは、ClickHouse Cloudと同じ[リージョン](/cloud/reference/supported-regions#aws-regions)をサポートしています。

</details>

<details>
<summary>リソースのオーバーヘッドは発生しますか？ClickHouseインスタンス以外のサービスを実行するために必要なリソースは何ですか？</summary>

ClickHouseインスタンス(ClickHouseサーバーとClickHouse Keeper)に加えて、`clickhouse-operator`、`aws-cluster-autoscaler`、Istioなどのサービスと監視スタックを実行しています。

現在、これらのワークロードを実行するために、専用のノードグループに3つのm5.xlargeノード(各アベイラビリティゾーンに1つずつ)を配置しています。

</details>

### ネットワークとセキュリティ {#network-and-security}

<details>
<summary>セットアップ完了後に、インストール時に設定された権限を取り消すことはできますか？</summary>

現時点では対応していません。

</details>

<details>
<summary>トラブルシューティングのためにClickHouseエンジニアが顧客インフラにアクセスする際の、将来的なセキュリティ制御について検討していますか？</summary>

はい。顧客がエンジニアのクラスタへのアクセスを承認できる、顧客制御メカニズムの実装をロードマップに含めています。現時点では、エンジニアはクラスタへのジャストインタイムアクセスを取得するために、社内のエスカレーションプロセスを経る必要があります。これはログに記録され、セキュリティチームによって監査されます。

</details>

<details>
<summary>作成されるVPC IPレンジのサイズはどのくらいですか？</summary>

デフォルトでは、BYOC VPCに`10.0.0.0/16`を使用しています。将来的な拡張の可能性に備えて、少なくとも/22を確保することを推奨していますが、サイズを制限したい場合は、サーバーポッドが30個に制限される可能性が高ければ、/23を使用することも可能です。

</details>

<details>
<summary>メンテナンス頻度を決定できますか？</summary>

メンテナンスウィンドウをスケジュールするには、サポートにお問い合わせください。最低でも週次の更新スケジュールとなります。

</details>

### 稼働時間SLA {#uptime-sla}

<details>
<summary>ClickHouseはBYOCに対して稼働時間SLAを提供していますか？</summary>

いいえ。データプレーンは顧客のクラウド環境でホストされているため、サービスの可用性はClickHouseの管理下にないリソースに依存します。したがって、ClickHouseはBYOCデプロイメントに対して正式な稼働時間SLAを提供していません。追加のご質問がある場合は、support@clickhouse.comまでお問い合わせください。

</details>
