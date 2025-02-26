---
title: レプリカ対応ルーティング
slug: /manage/replica-aware-routing
description: キャッシュ再利用を増やすためのレプリカ対応ルーティングの使用方法
keywords: [クラウド, スティッキーエンドポイント, スティッキー, エンドポイント, スティッキールーティング, ルーティング, レプリカ対応ルーティング]
---

# レプリカ対応ルーティング (プライベートプレビュー)

レプリカ対応ルーティング（スティッキーセッション、スティッキールーティング、またはセッションアフィニティとも呼ばれます）は、[Envoyプロキシのリングハッシュ負荷分散](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/load_balancers#ring-hash)を利用します。レプリカ対応ルーティングの主な目的は、キャッシュ再利用の可能性を高めることです。隔離を保証するものではありません。

サービスに対してレプリカ対応ルーティングを有効にすると、サービスホスト名上にワイルドカードサブドメインを許可します。ホスト名が `abcxyz123.us-west-2.aws.clickhouse.cloud` のサービスの場合、`*.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud` に一致する任意のホスト名を使用してサービスにアクセスできます。

|例のホスト名|
|---|
|`aaa.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|
|`000.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|
|`clickhouse-is-the-best.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|

Envoyがこのようなパターンに一致するホスト名を受け取ると、ホスト名に基づいてルーティングハッシュを計算し、計算されたハッシュに基づいてハッシュリング上の対応するClickHouseサーバーを見つけます。サービスに ongoing 変更（サーバーの再起動、スケールアウト/インなど）がない限り、Envoyは常に同じClickHouseサーバーに接続します。

元のホスト名は依然として `LEAST_CONNECTION` 負荷分散を使用し、これはデフォルトのルーティングアルゴリズムです。

## レプリカ対応ルーティングの制限 {#limitations-of-replica-aware-routing}

### レプリカ対応ルーティングは隔離を保証しない {#replica-aware-routing-does-not-guarantee-isolation}

サーバーポッドの再起動（バージョンアップグレード、クラッシュ、垂直スケーリングなど、いかなる理由によるものでも）やサーバーのスケールアウト/インなど、サービスに対するいかなる中断も、ルーティングハッシュリングに影響を与えます。これにより、同じホスト名の接続が異なるサーバーポッドに着地することになります。

### レプリカ対応ルーティングはプライベートリンクでそのまま機能しない {#replica-aware-routing-does-not-work-out-of-the-box-with-private-link}

顧客は新しいホスト名パターンの名前解決を機能させるために、手動でDNSエントリを追加する必要があります。不適切に使用された場合、これがサーバー負荷の不均衡を引き起こす可能性があります。

## レプリカ対応ルーティングの設定 {#configuring-replica-aware-routing}

レプリカ対応ルーティングを有効にするには、[サポートチームにご連絡ください](https://clickhouse.com/support)。
