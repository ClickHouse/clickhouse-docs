---
'title': 'レプリカ対応ルーティング'
'slug': '/manage/replica-aware-routing'
'description': 'レプリカ対応ルーティングを使用してキャッシュの再利用を増やす方法'
'keywords':
- 'cloud'
- 'sticky endpoints'
- 'sticky'
- 'endpoints'
- 'sticky routing'
- 'routing'
- 'replica aware routing'
'doc_type': 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';


# レプリカ対応ルーティング

<PrivatePreviewBadge/>

レプリカ対応ルーティング（スティッキーセッション、スティッキールーティング、セッションアフィニティとも呼ばれる）は、[Envoyプロキシのリングハッシュロードバランシング](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/load_balancers#ring-hash)を利用します。レプリカ対応ルーティングの主な目的は、キャッシュ再利用の確率を高めることです。隔離を保証するものではありません。

サービスに対してレプリカ対応ルーティングを有効にする場合、サービスのホスト名の上にワイルドカードサブドメインを許可します。ホスト名が `abcxyz123.us-west-2.aws.clickhouse.cloud` のサービスに対しては、`*.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud` に一致する任意のホスト名を使用してサービスにアクセスできます。

|例のホスト名|
|---|
|`aaa.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|
|`000.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|
|`clickhouse-is-the-best.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|

Envoyがそのようなパターンに一致するホスト名を受信すると、ホスト名に基づいてルーティングハッシュを計算し、計算されたハッシュに基づいてハッシュリング上の対応するClickHouseサーバーを見つけます。サービスに対して進行中の変更（例：サーバー再起動、スケールアウト/イン）がないと仮定すると、Envoyは常に同じClickHouseサーバーに接続することを選択します。

元のホスト名は `LEAST_CONNECTION` ロードバランシングを引き続き使用することに注意してください。これはデフォルトのルーティングアルゴリズムです。

## レプリカ対応ルーティングの制限 {#limitations-of-replica-aware-routing}

### レプリカ対応ルーティングは隔離を保証しない {#replica-aware-routing-does-not-guarantee-isolation}

サーバーポッドの再起動（バージョンアップグレード、クラッシュ、垂直スケーリングなどの理由による）や、サーバーのスケールアウト/インなど、サービスへの何らかの干渉があると、ルーティングハッシュリングに干渉が生じます。これにより、同じホスト名を持つ接続が異なるサーバーポッドに着地することになります。

### レプリカ対応ルーティングはプライベートリンクでそのまま機能しない {#replica-aware-routing-does-not-work-out-of-the-box-with-private-link}

顧客は新しいホスト名パターンの名前解決が機能するように、手動でDNSエントリを追加する必要があります。これを誤って使用すると、サーバー負荷が不均衡になる可能性があります。

## レプリカ対応ルーティングの設定 {#configuring-replica-aware-routing}

レプリカ対応ルーティングを有効にするには、[サポートチームにお問い合わせください](https://clickhouse.com/support/program)。
