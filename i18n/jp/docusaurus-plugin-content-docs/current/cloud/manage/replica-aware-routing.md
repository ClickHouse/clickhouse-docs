---
title: レプリカ対応ルーティング
slug: /manage/replica-aware-routing
description: キャッシュ再利用を増やすためにレプリカ対応ルーティングを使用する方法
keywords: [cloud, sticky endpoints, sticky, endpoints, sticky routing, routing, replica aware routing]
---


# レプリカ対応ルーティング (プライベートプレビュー)

レプリカ対応ルーティング（スティッキーセッション、スティッキールーティング、またはセッションの親和性とも呼ばれます）は、[Envoyプロキシのリングハッシュロードバランシング](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/load_balancers#ring-hash)を利用しています。レプリカ対応ルーティングの主な目的は、キャッシュ再利用の可能性を高めることです。 isolationを保証するものではありません。

サービスのレプリカ対応ルーティングを有効にすると、サービスホスト名の上にワイルドカードサブドメインを許可します。ホスト名が `abcxyz123.us-west-2.aws.clickhouse.cloud` のサービスの場合、 `*.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud` に一致する任意のホスト名を使用してサービスにアクセスできます：

|例のホスト名|
|---|
|`aaa.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|
|`000.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|
|`clickhouse-is-the-best.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|

Envoyがそのようなパターンに一致するホスト名を受け取ると、ホスト名に基づいてルーティングハッシュを計算し、計算されたハッシュに基づいてハッシュリング上の対応するClickHouseサーバーを見つけます。サービスに対する変更が行われていないと仮定すると（例：サーバーの再起動、スケールアウト/イン）、Envoyは常に同じClickHouseサーバーに接続します。

元のホスト名は依然として `LEAST_CONNECTION` ロードバランシングを使用します。これはデフォルトのルーティングアルゴリズムです。

## レプリカ対応ルーティングの制限 {#limitations-of-replica-aware-routing}

### レプリカ対応ルーティングは隔離を保証しません {#replica-aware-routing-does-not-guarantee-isolation}

サービスへのいかなる中断、例えば、サーバーポッドの再起動（バージョンのアップグレード、クラッシュ、垂直スケーリングアップなどの理由による）、サーバーのスケールアウト/インは、ルーティングハッシュリングに影響を及ぼします。これにより、同じホスト名の接続が異なるサーバーポッドに到達することになります。

### レプリカ対応ルーティングはプライベートリンクで直ちに使用できません {#replica-aware-routing-does-not-work-out-of-the-box-with-private-link}

顧客は、新しいホスト名パターンの名前解決を機能させるためにDNSエントリを手動で追加する必要があります。顧客がこれを誤って使用した場合、サーバーの負荷に不均衡が生じる可能性があります。

## レプリカ対応ルーティングの設定 {#configuring-replica-aware-routing}

レプリカ対応ルーティングを有効にするには、[サポートチームにお問い合わせください](https://clickhouse.com/support)。
