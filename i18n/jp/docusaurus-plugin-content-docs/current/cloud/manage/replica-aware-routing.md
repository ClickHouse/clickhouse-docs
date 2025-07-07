---
'title': 'レプリカ意識型ルーティング'
'slug': '/manage/replica-aware-routing'
'description': 'キャッシュ再利用を増やすためのレプリカ意識型ルーティングの使用方法'
'keywords':
- 'cloud'
- 'sticky endpoints'
- 'sticky'
- 'endpoints'
- 'sticky routing'
- 'routing'
- 'replica aware routing'
---




# レプリカ対応ルーティング (プライベートプレビュー)

レプリカ対応ルーティング（スティッキーセッション、スティッキールーティング、またはセッションアフィニティとも呼ばれる）は、[Envoyプロキシのリングハッシュ負荷分散](https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/load_balancers#ring-hash)を利用しています。レプリカ対応ルーティングの主な目的は、キャッシュ再利用の機会を増やすことです。それは隔離を保証するものではありません。

サービスのレプリカ対応ルーティングを有効にすると、サービスホスト名の上にワイルドカードサブドメインを許可します。ホスト名が `abcxyz123.us-west-2.aws.clickhouse.cloud` のサービスの場合、`*.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud` に一致する任意のホスト名を使用してサービスにアクセスできます：

|例のホスト名|
|---|
|`aaa.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|
|`000.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|
|`clickhouse-is-the-best.sticky.abcxyz123.us-west-2.aws.clickhouse.cloud`|

Envoyがそのようなパターンに一致するホスト名を受け取ると、ホスト名に基づいてルーティングハッシュを計算し、計算されたハッシュに基づいてハッシュリング上の対応するClickHouseサーバーを見つけます。サービスに対する変更がないと仮定すると（例： サーバーの再起動、スケールアウト/ イン）、Envoyは常に同じClickHouseサーバーを選択して接続します。

元のホスト名は、デフォルトのルーティングアルゴリズムである `LEAST_CONNECTION` 負荷分散を引き続き使用することに注意してください。

## レプリカ対応ルーティングの制限 {#limitations-of-replica-aware-routing}

### レプリカ対応ルーティングは隔離を保証しません {#replica-aware-routing-does-not-guarantee-isolation}

サービスへのいかなる中断、例えばサーバーポッドの再起動（バージョンアップグレード、クラッシュ、縦型スケーリングなどによる理由で）、サーバーのスケールアウト/インなどが、ルーティングハッシュリングを中断させます。これにより、同じホスト名の接続が異なるサーバーポッドに到達することになります。

### レプリカ対応ルーティングはプライベートリンクでそのまま動作しません {#replica-aware-routing-does-not-work-out-of-the-box-with-private-link}

顧客は新しいホスト名パターンの名前解決を機能させるために、手動でDNSエントリを追加する必要があります。これを不適切に使用すると、サーバーロードの不均衡を引き起こす可能性があります。

## レプリカ対応ルーティングの設定 {#configuring-replica-aware-routing}

レプリカ対応ルーティングを有効にするには、[サポートチームにお問い合わせください](https://clickhouse.com/support)。
