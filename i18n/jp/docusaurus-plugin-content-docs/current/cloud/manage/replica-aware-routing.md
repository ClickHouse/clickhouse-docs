---
title: 'レプリカ対応ルーティング'
slug: /manage/replica-aware-routing
description: 'レプリカ対応ルーティングを使用してキャッシュの再利用を増加させる方法'
keywords: ['cloud', 'sticky endpoints', 'sticky', 'endpoints', 'sticky routing', 'routing', 'replica aware routing']
---


# レプリカ対応ルーティング (プライベートプレビュー)

レプリカ対応ルーティング（スティッキーセッション、スティッキールーティング、またはセッション親和性とも呼ばれる）は、[Envoyプロキシのリングハッシュ負荷分散](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/load_balancers#ring-hash)を利用します。レプリカ対応ルーティングの主な目的は、キャッシュ再利用の可能性を高めることです。これは隔離を保証するものではありません。

サービスに対してレプリカ対応ルーティングを有効にすると、サービスのホスト名の上にワイルドカードサブドメインを許可します。ホスト名が `abcxyz123.us-west-2.aws.clickhouse.cloud` のサービスの場合、`*.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud` に一致する任意のホスト名を使用してサービスにアクセスできます：

|例示的なホスト名|
|---|
|`aaa.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|
|`000.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|
|`clickhouse-is-the-best.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|

Envoyがこのようなパターンに一致するホスト名を受け取ると、ホスト名に基づいてルーティングハッシュを計算し、計算されたハッシュに基づいてハッシュリング上の対応するClickHouseサーバーを見つけます。サービスに対する変更（例えば、サーバーの再起動、スケールアウト/イン）がなく、Envoyは常に同じClickHouseサーバーに接続することを選択します。

元のホスト名は依然として `LEAST_CONNECTION` 負荷分散を使用し、これはデフォルトのルーティングアルゴリズムです。

## レプリカ対応ルーティングの制限 {#limitations-of-replica-aware-routing}

### レプリカ対応ルーティングは隔離を保証しない {#replica-aware-routing-does-not-guarantee-isolation}

サービスへのいかなる中断（サーバーポッドの再起動など、バージョンアップグレード、クラッシュ、垂直スケーリングアップなどの理由による）、サーバーのスケールアウト/インは、ルーティングハッシュリングに中断を引き起こします。これにより、同じホスト名の接続が異なるサーバーポッドに到達することになります。

### レプリカ対応ルーティングはプライベートリンクでそのままでは機能しない {#replica-aware-routing-does-not-work-out-of-the-box-with-private-link}

顧客は新しいホスト名パターンの名前解決を機能させるために手動でDNSエントリを追加する必要があります。顧客がこれを誤って使用した場合、サーバーの負荷に不均衡を引き起こす可能性があります。

## レプリカ対応ルーティングの設定 {#configuring-replica-aware-routing}

レプリカ対応ルーティングを有効にするには、[サポートチームにご連絡ください](https://clickhouse.com/support)。
