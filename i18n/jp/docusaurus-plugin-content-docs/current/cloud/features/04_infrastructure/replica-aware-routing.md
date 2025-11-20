---
title: 'レプリカ対応ルーティング'
slug: /manage/replica-aware-routing
description: 'レプリカ対応ルーティングを使用してキャッシュの再利用性を高める方法'
keywords: ['cloud', 'sticky endpoints', 'sticky', 'endpoints', 'sticky routing', 'routing', 'replica aware routing']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';


# レプリカ認識ルーティング

<PrivatePreviewBadge/>

レプリカ認識ルーティング（sticky sessions、sticky routing、session affinity とも呼ばれます）は、[Envoy proxy の ring hash ロードバランシング](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/load_balancers#ring-hash)を利用します。レプリカ認識ルーティングの主な目的は、キャッシュ再利用の可能性を高めることです。分離を保証するものではありません。

サービスに対してレプリカ認識ルーティングを有効にすると、そのサービスのホスト名に対してワイルドカードサブドメインを利用できるようになります。ホスト名が `abcxyz123.us-west-2.aws.clickhouse.cloud` のサービスの場合、サービスにアクセスするために、`*.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud` にマッチする任意のホスト名を使用できます:

|ホスト名の例|
|---|
|`aaa.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|
|`000.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|
|`clickhouse-is-the-best.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|

Envoy がこのパターンにマッチするホスト名を受信すると、そのホスト名に基づいてルーティング用のハッシュ値を計算し、そのハッシュ値に基づいてハッシュリング上の対応する ClickHouse サーバーを特定します。サービスに対して進行中の変更（例: サーバーの再起動、スケールアウト/イン）がないと仮定すると、Envoy は常に同じ ClickHouse サーバーを選択して接続します。

元のホスト名では、引き続きデフォルトのルーティングアルゴリズムである `LEAST_CONNECTION` ロードバランシングが使用される点に注意してください。



## レプリカ認識ルーティングの制限事項 {#limitations-of-replica-aware-routing}

### レプリカ認識ルーティングは分離を保証しません {#replica-aware-routing-does-not-guarantee-isolation}

サービスへの障害、例えばサーバーポッドの再起動(バージョンアップグレード、クラッシュ、垂直スケーリングなどの理由による)やサーバーのスケールアウト/スケールインは、ルーティングハッシュリングに障害を引き起こします。これにより、同じホスト名を持つ接続が異なるサーバーポッドに振り分けられることになります。

### レプリカ認識ルーティングはプライベートリンクでそのまま動作しません {#replica-aware-routing-does-not-work-out-of-the-box-with-private-link}

新しいホスト名パターンの名前解決を機能させるには、お客様が手動でDNSエントリを追加する必要があります。誤った使用方法により、サーバー負荷の不均衡を引き起こす可能性があります。


## レプリカ認識ルーティングの設定 {#configuring-replica-aware-routing}

レプリカ認識ルーティングを有効にするには、[サポートチーム](https://clickhouse.com/support/program)にお問い合わせください。
