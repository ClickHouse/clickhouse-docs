---
title: 'レプリカ対応ルーティング'
slug: /manage/replica-aware-routing
description: 'キャッシュの再利用率を高めるための Replica-aware routing の使用方法'
keywords: ['クラウド', 'スティッキー エンドポイント', 'スティッキー', 'エンドポイント', 'スティッキー ルーティング', 'ルーティング', 'レプリカ認識ルーティング']
doc_type: 'guide'
---

import PrivatePreviewBadge from '@theme/badges/PrivatePreviewBadge';

<PrivatePreviewBadge />

レプリカ対応ルーティング (sticky sessions、sticky routing、session affinity とも呼ばれます) は、[Envoy プロキシの ring hash ロードバランシング](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/load_balancers#ring-hash) を利用します。レプリカ対応ルーティング の主な目的は、キャッシュを再利用できる可能性を高めることです。分離を保証するものではありません。

サービスで レプリカ対応ルーティング を有効にすると、そのサービスのホスト名に対してワイルドカード付きサブドメインが許可されます。ホスト名が `abcxyz123.us-west-2.aws.clickhouse.cloud` のサービスであれば、`*.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud` に一致する任意のホスト名を使用して、そのサービスにアクセスできます。

| ホスト名の例                                                                   |
| ------------------------------------------------------------------------ |
| `aaa.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`                    |
| `000.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`                    |
| `clickhouse-is-the-best.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud` |

Envoy がこのパターンに一致するホスト名を受信すると、そのホスト名に基づいてルーティング用のハッシュ値を計算し、そのハッシュ値に基づいてハッシュリング上の対応する ClickHouse サーバーを特定します。サービスに対する変更 (例: サーバーの再起動、スケールアウト/イン) が進行中でないと仮定すると、Envoy は常に同じ ClickHouse サーバーを接続先として選択します。

元のホスト名を使用した場合は、デフォルトのルーティングアルゴリズムである `LEAST_CONNECTION` ロードバランシングが引き続き使用されることに注意してください。

## Replica-aware routing の制限事項 \{#limitations-of-replica-aware-routing\}

### Replica-aware routing はアイソレーションを保証しない \{#replica-aware-routing-does-not-guarantee-isolation\}

サービスに対するあらゆる中断要因、たとえばサーバーポッドの再起動（バージョンアップ、クラッシュ、垂直スケールアップなどによるもの）やサーバーのスケールアウト／スケールインは、ルーティングのハッシュリングに変更を発生させます。これにより、同じホスト名での接続が別のサーバーポッドに到達する可能性があります。

### Replica-aware routing は Private Link と組み合わせてもそのままでは動作しない \{#replica-aware-routing-does-not-work-out-of-the-box-with-private-link\}

お客様は、新しいホスト名パターンに対して名前解決が機能するように、DNS エントリを手動で追加する必要があります。誤って構成・使用すると、サーバー負荷に不均衡を生じさせる可能性があります。

## レプリカ対応ルーティングの設定 \{#configuring-replica-aware-routing\}

Replica-aware routing を有効にするには、弊社の[サポートチーム](https://clickhouse.com/support/program)までお問い合わせください。