---
sidebar_label: '設定リファレンス'
sidebar_position: 3
keywords: ['clickhouse', 'go', 'golang', 'configuration', 'options', 'reference', 'DSN', 'connection pool', 'TLS', 'compression', 'timeout']
description: '接続レベル、コンテキストレベル、バッチオプションを含む、clickhouse-go クライアントのオプションごとの完全な設定リファレンスです。'
slug: /integrations/language-clients/go/config-reference
title: 'Go クライアントの設定リファレンス'
doc_type: 'reference'
---

このページでは、`clickhouse-go` v2.x で設定可能なすべてのオプションを説明します。コード例付きのガイドについては、[Configuration](/integrations/language-clients/go/configuration)を参照してください。

:::note[バージョン注記]
`clickhouse-go` v2.35.0 以降で追加されたオプションには、説明の横に *(Since vX.Y.Z)* と記載されています。&quot;Since&quot; タグのないオプションは v2.0 から利用可能で、サポートされているすべてのリリースに含まれています。
:::

## オプションの設定方法 \{#how-options-are-set\}

オプションは3つのスコープで設定できます。

| Scope   | How to set                               | Lifetime      |
| ------- | ---------------------------------------- | ------------- |
| **接続**  | `clickhouse.Options` 構造体または DSN 文字列      | その接続上のすべてのクエリ |
| **クエリ** | `WithXxx` 関数を指定した `clickhouse.Context()` | 1回のクエリ実行      |
| **バッチ** | `PrepareBatch()` のオプション関数                | 1回のバッチ操作      |

スコープが重複する場合は、より具体的なスコープが優先されます：**バッチ &gt; クエリ &gt; 接続**。`Settings` では、クエリレベルのキーは接続レベルのキーとマージされ、競合する場合はクエリレベルの値が優先されます。

**Options 構造体を使用する場合：**

```go
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr:        []string{"localhost:9000"},
    Auth:        clickhouse.Auth{Database: "default", Username: "default", Password: ""},
    DialTimeout: 10 * time.Second,
    Compression: &clickhouse.Compression{Method: clickhouse.CompressionLZ4},
})
```

**DSN文字列を使用する場合:**

```go
db, err := sql.Open("clickhouse", "clickhouse://user:pass@localhost:9000/default?dial_timeout=10s&compress=lz4")
```

**コネクタ経由 (database/sql と Options 構造体を使用) :**

```go
db := sql.OpenDB(clickhouse.Connector(&clickhouse.Options{
    Addr:        []string{"localhost:9000"},
    Auth:        clickhouse.Auth{Database: "default", Username: "default"},
    DialTimeout: 10 * time.Second,
}))
// Set database/sql-only pool settings after creation
db.SetConnMaxIdleTime(5 * time.Minute)
```

**コンテキスト経由 (クエリ単位) :**

```go
ctx := clickhouse.Context(context.Background(),
    clickhouse.WithQueryID("my-query-123"),
    clickhouse.WithSettings(clickhouse.Settings{"max_execution_time": 60}),
)
rows, err := conn.Query(ctx, "SELECT ...")
```

***

## 接続オプション \{#connection-options\}

### プロトコルと接続 \{#protocol-and-connection\}

| オプション              | 型                          | デフォルト                                                     | DSN パラメータ                                                        | 説明                                                                                     | ベストプラクティス                                                                                                                                                                                                  | 設定を誤った場合                                                                                                   |
| ------------------ | -------------------------- | --------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `Protocol`         | `Protocol` (int)           | `Native`                                                  | スキーム: `clickhouse://`=Native, `http://`=HTTP                     | 通信プロトコル。TCP には `Native` (0)、HTTP には `HTTP` (1) を使用します。                                 | 約 30% 高い性能が見込めるため、通常は Native を使用します。プロキシ対応、ファイアウォール越え (ポート 80/443) 、または HTTP 専用の圧縮 (`gzip`/`br`) が必要な場合は HTTP を使用します。[TCP vs HTTP](/integrations/language-clients/go/configuration#tcp-vs-http) を参照してください。 | Native ポート (9000) に HTTP スキームを使うと接続拒否になります。ファイアウォールで Native がブロックされているとタイムアウトします。                          |
| `Addr`             | `[]string`                 | `["localhost:9000"]` (Native) `["localhost:8123"]` (HTTP) | URL 内でホストをカンマ区切りで指定                                              | 接続およびフェイルオーバーに使用する `"host:port"` アドレスの一覧                                               | 本番環境では HA のために複数のアドレスを指定します。正しいポートは 9000 (Native)、8123 (HTTP)、9440 (Native+TLS)、8443 (HTTP+TLS) です。                                                                                                        | 単一アドレス: フェイルオーバー不可。誤ったポート: `"connection refused"`。空または nil: localhost がデフォルトとなり、分散デプロイメントでは失敗します。          |
| `ConnOpenStrategy` | `ConnOpenStrategy` (uint8) | `ConnOpenInOrder` (0)                                     | `connection_open_strategy` (`in_order`, `round_robin`, `random`) | `Addr` からサーバーを選択する戦略です。`InOrder` (0)=フェイルオーバー、`RoundRobin` (1)=負荷分散、`Random` (2)=ランダム。 | アクティブ-スタンバイには `InOrder`、アクティブ-アクティブ/K8s には `RoundRobin` を使用します。サンダリングハードを避けるには `Random` を使用します。                                                                                                            | アクティブ-アクティブで `InOrder` を使うと、最初のサーバーに負荷が集中し、他はアイドル状態になります。障害時には、どの戦略でもすべてのサーバーを試行します -- 違いは*最初*にどれを試すかだけです。 |

***

### 認証 \{#authentication\}

| Option          | Type                        | Default               | DSN param                          | Description                                                                           | Best practice                                                   | When misconfigured                                                                                               |
| --------------- | --------------------------- | --------------------- | ---------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `Auth.Username` | `string`                    | `"default"`           | `username` or URL user portion     | ClickHouse の認証に使用するユーザー名                                                              | 本番環境では `default` を決して使用しないでください。最小権限の専用ユーザーを作成してください。           | ユーザー名が誤っている場合: `"Code: 516. DB::Exception: Authentication failed"`。空文字列の場合: `"default"` が暗黙的に使用されます。             |
| `Auth.Password` | `string`                    | `""`                  | `password` or URL password portion | ClickHouse の認証に使用するパスワード                                                              | 本番環境では環境変数またはシークレットマネージャーを使用してください。DSN 内の特殊文字は URL エンコードしてください。 | パスワードが誤っている場合: `"Code: 516. DB::Exception: Authentication failed"`。特殊文字が URL エンコードされていない場合: 解析エラー。               |
| `Auth.Database` | `string`                    | `""` (server default) | `database` or URL path (`/mydb`)   | connection で使用するデフォルトデータベース                                                           | 必ず明示的に指定してください。本番環境ではアプリケーションごとに専用のデータベースを使用してください。             | 存在しない場合: `"Code: 81. DB::Exception: Database xyz doesn't exist"`。マルチテナント構成で空の場合: クエリが誤ったデータベースに送られます。            |
| `GetJWT`        | `func(ctx) (string, error)` | `nil`                 | (programmatic only)                | ClickHouse Cloud 認証用の JWT を返すコールバック。`WithJWT(token)` を使うとクエリ単位で上書きできます。*(v2.35.0 以降)* | トークンのキャッシュと refresh を実装してください。connection / リクエストごとに呼び出されます。     | トークンの有効期限切れ: 認証エラー。コールバックがブロックすると: タイムアウト。JWT はユーザー名 / パスワードより優先されます。TLS が必要で、ない場合は暗黙的にユーザー名 / パスワードへフォールバックします。 |

```go
GetJWT: func(ctx context.Context) (string, error) {
    return getTokenFromVault(ctx)
}
```

***

### タイムアウト \{#timeouts\}

| オプション         | 型               | デフォルト       | DSN パラメータ      | 説明                                                                           | 推奨値                                               | 設定を誤った場合                                                                                                              |
| ------------- | --------------- | ----------- | -------------- | ---------------------------------------------------------------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `DialTimeout` | `time.Duration` | `30s`       | `dial_timeout` | 新しい接続の確立にかける最大時間です。`MaxOpenConns` に達した場合の、プールからの接続取得待機時間にも適用されます。            | LAN では 5～10 秒、WAN/クラウドでは 15～30 秒。1 秒未満にはしないでください。 | 短すぎる場合: 輻輳時に `"clickhouse: acquire conn timeout"` が発生します。長すぎる場合 (60 秒超) : 障害時にアプリがハングします。                             |
| `ReadTimeout` | `time.Duration` | `5m` (300s) | `read_timeout` | 読み取り呼び出しごとにサーバー応答を待機する最大時間です。クエリ全体ではなく、ブロックごとに適用されます。Context のデッドラインが優先されます。 | 短時間の対話型クエリでは 10～30 秒、長時間の分析クエリでは 5～30 分。          | 短すぎる場合: クエリ実行中に `"i/o timeout"` または `"read: connection reset by peer"` が発生し、サーバー側では実行が継続されます。長すぎる場合: 切断された接続を検出できません。 |

***

### 接続プール \{#connection-pool\}

| Option            | Type            | Default                          | DSN param           | API               | Description                                                                             | Best practice                                                                                                          | When misconfigured                                                                                                                                    |
| ----------------- | --------------- | -------------------------------- | ------------------- | ----------------- | --------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MaxIdleConns`    | `int`           | `5`                              | `max_idle_conns`    | 両方                | プール内のアイドル (未使用だが有効な) 接続の最大数                                                             | 想定される同時実行クエリ数の 50〜80%。低: 2〜5、中: 10〜20、高: 20〜50。                                                                        | 低すぎる場合: 接続の生成と破棄が頻発し、レイテンシが増加します。高すぎる場合: メモリを無駄に消費します。`MaxOpenConns` が自動的な上限になります。                                                                    |
| `MaxOpenConns`    | `int`           | `MaxIdleConns + 5` (default: 10) | `max_open_conns`    | 両方                | 接続の総数 (アイドル + アクティブ) の最大値                                                               | 低: 10〜20、中: 20〜50、高: 50〜100。式: 同時実行クエリ数 + バースト + バッファ。監視: `SELECT * FROM system.metrics WHERE metric='TCPConnection'`。 | 低すぎる場合: `"clickhouse: acquire conn timeout"`。高すぎる場合: サーバーで `"Too many connections"` が発生し、FD 制限を超過します。ClickHouse のデフォルト `max_connections`: 1024 (共有) 。 |
| `ConnMaxLifetime` | `time.Duration` | `1h`                             | `conn_max_lifetime` | 両方                | 接続を再利用できる最大時間。プールへ返却される際にチェックされます。                                                      | 安定した環境では 1〜5 時間。K8s/ローリングデプロイでは 5〜15 分。無期限にはしないでください。                                                                  | 短すぎる場合 (&lt; 1m) : 接続の生成と破棄が頻発し、レイテンシが増加します。長すぎる/無期限の場合: 古い接続が残り、DNS の変更が反映されず、トラフィックも再分散されません。                                                       |
| `ConnMaxIdleTime` | `time.Duration` | `0` (none)                       | —                   | `database/sql` のみ | 接続が *idle* のまま保持された後にクローズされるまでの最大時間。`Options` 構造体にはなく、`db.SetConnMaxIdleTime()` で設定します。 | K8s やバースト性のあるワークロードでは、トラフィックスパイク後にアイドル接続を回収するため 5〜10 分。                                                                | 未設定の場合: アイドル接続は `ConnMaxLifetime` まで残ります。短すぎる場合 (&lt; 30s) : 通常の待機時間中にも接続が再作成されます。                                                                    |

:::note database/sql only
`ConnMaxIdleTime` は標準の Go `database/sql` 接続プール設定です。`clickhouse.Options` 構造体や `clickhouse.Open()` では利用できません。`OpenDB()` の後で設定してください:

```go
db := clickhouse.OpenDB(&clickhouse.Options{...})
db.SetConnMaxIdleTime(5 * time.Minute)
```

:::

使用方法の詳細は、[接続プーリング](/integrations/language-clients/go/configuration#connection-pooling)を参照してください。

***

### 標準の database/sql プール設定 \{#sql-db-settings\}

`clickhouse.OpenDB()` または `sql.Open("clickhouse", dsn)` を使用すると、返される `*sql.DB` では Go 標準のプールメソッドを利用できます。`OpenDB()` は `Options` の先頭 3 項目を自動的に適用します。

| Method                     | Options equivalent | Notes                   |
| -------------------------- | ------------------ | ----------------------- |
| `db.SetMaxIdleConns(n)`    | `MaxIdleConns`     | `OpenDB()` によって自動適用されます |
| `db.SetMaxOpenConns(n)`    | `MaxOpenConns`     | `OpenDB()` によって自動適用されます |
| `db.SetConnMaxLifetime(d)` | `ConnMaxLifetime`  | `OpenDB()` によって自動適用されます |
| `db.SetConnMaxIdleTime(d)` | *None*             | 作成後に手動で設定する必要があります      |

:::note[ClickHouse API (clickhouse.Open)]
これらのメソッドは、`clickhouse.Open()` が返す connection では**使用できません**。ClickHouse API は、`Options` 構造体のフィールドを直接使って、内部で独自にプールを管理します。
:::

***

### 圧縮 \{#compression\}

| オプション                  | 型                          | デフォルト               | DSN パラメータ                                                                         | 説明                                                                     | ベストプラクティス                                                                                                          | 設定を誤った場合                                                                                            |
| ---------------------- | -------------------------- | ------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `Compression.Method`   | `CompressionMethod` (byte) | なし                  | `compress` (`lz4`, `zstd`, `lz4hc`, `gzip`, `deflate`, `br`, または LZ4 の場合は `true`) | データ転送時の圧縮アルゴリズムです。下記のプロトコル対応表を参照してください。                                | LAN: なしまたは LZ4。WAN: ZSTD または LZ4。CPU に制約がある場合: LZ4。最大圧縮率: ZSTD (Native) または Brotli (HTTP)。挿入が 1 MB 未満の場合は省略してください。 | Native で GZIP/Brotli: ハンドシェイク失敗。HTTP で LZ4HC: エラー、または暗黙的にフォールバック。低速ネットワークで圧縮なし: 挿入が 10～100 倍遅くなります。 |
| `Compression.Level`    | `int`                      | `3`                 | `compress_level`                                                                  | アルゴリズム固有の圧縮レベルです。GZIP/Deflate: -2 ～ 9。Brotli: 0 ～ 11。LZ4/ZSTD: 無視されます。 | GZIP でバランス重視なら 3～6。Brotli でバランス重視なら 4～6。                                                                           | 非常に高いレベル: CPU 負荷が極端に高くなる一方、効果はわずかです。LZ4/ZSTD に対して 0 以外を指定: 暗黙的に無視されます。圧縮を有効にせずレベルだけ指定: 効果はありません。    |
| `MaxCompressionBuffer` | `int` (bytes)              | `10485760` (10 MiB) | `max_compression_buffer`                                                          | フラッシュ前の最大圧縮バッファサイズです。各接続はそれぞれ独自のバッファを持ちます。                             | デフォルトの 10 MiB で十分です。幅の広い行では 20～50 MiB。合計メモリ = バッファ x `MaxOpenConns`。                                               | 小さすぎる場合 (&lt; 1 MiB): フラッシュが頻発し、効率が低下します。大きすぎる場合 (&gt; 100 MiB): 接続数が多いと OOM になる可能性があります。           |

**プロトコルごとの圧縮方式サポート:**

| Method               | Native | HTTP |
| -------------------- | ------ | ---- |
| `CompressionLZ4`     | はい     | はい   |
| `CompressionLZ4HC`   | はい     | いいえ  |
| `CompressionZSTD`    | はい     | はい   |
| `CompressionGZIP`    | いいえ    | はい   |
| `CompressionDeflate` | いいえ    | はい   |
| `CompressionBrotli`  | いいえ    | はい   |

***

### TLS \{#tls\}

| オプション | 型             | デフォルト       | DSN param                         | 説明                                                                              | ベストプラクティス                                                                                                             | 誤設定時                                                                                                                                                                                                                                                                                                                                   |
| ----- | ------------- | ----------- | --------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TLS` | `*tls.Config` | `nil` (平文)  | `secure=true`, `skip_verify=true` | TLS/SSL の設定です。`nil` 以外を指定すると TLS が有効になります。ポート: Native 9000/9440、HTTP 8123/8443。 | 本番環境および ClickHouse Cloud では常に有効にしてください (必須) 。本番環境では `InsecureSkipVerify: false` を使用してください。カスタム CA は `RootCAs` で追加します。 | ポートが誤っている場合: `"connection reset by peer"`。本番環境で `skip_verify=true` を使用すると: MITM 攻撃に対して脆弱になります。証明書の有効期限切れ: `"x509: certificate has expired"`。ホストが誤っている場合: `"x509: certificate is valid for X, not Y"`。信頼されていない CA: `"x509: certificate signed by unknown authority"`。HTTP DSN で `secure=true` を使用している場合: 代わりに `https://` スキームを使用してください。 |

コード例については、[TLS](/integrations/language-clients/go/configuration#using-tls) を参照してください。

***

### ロギング \{#logging\}

| オプション                 | 型                      | デフォルト           | DSN パラメータ | 説明                                                                                         | ベストプラクティス                                                                    | 誤設定時                                                      |
| --------------------- | ---------------------- | --------------- | --------- | ------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- | --------------------------------------------------------- |
| `Logger`              | `*slog.Logger`         | `nil` (ログ出力なし)  | —         | Go の `log/slog` による構造化ロガーです。優先順位: `Debug`+`Debugf` &gt; `Logger` &gt; no-op。*(v2.43.0 以降)* | 本番環境では JSON ハンドラを使用する `slog` を利用してください。`logger.With(...)` でアプリのコンテキストを追加します。 | —                                                         |
| `Debug` (deprecated)  | `bool`                 | `false`         | `debug`   | 旧来のデバッグ切り替えです。代わりに `Logger` を使用してください。`Debugf` が設定されていない場合は stdout にログを出力します。              | —                                                                            | 本番環境で有効にすると、パフォーマンスのオーバーヘッド、冗長なログ、機微なデータの出力につながる可能性があります。 |
| `Debugf` (deprecated) | `func(string, ...any)` | `nil`           | —         | カスタムのデバッグログ関数です。代わりに `Logger` を使用してください。使用するには `Debug: true` が必要です。                        | —                                                                            | —                                                         |

```go
logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{Level: slog.LevelInfo}))
conn, err := clickhouse.Open(&clickhouse.Options{
    Logger: logger,
    // ...
})
```

詳しい例については、[ロギング](/integrations/language-clients/go/configuration#logging)を参照してください。

***

### バッファとメモリ \{#buffers-and-memory\}

| Option                 | Type    | Default | DSN param           | Per-query                  | Description                                       | Best practice                                                                  | When misconfigured                                                                            |
| ---------------------- | ------- | ------- | ------------------- | -------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| `BlockBufferSize`      | `uint8` | `2`     | `block_buffer_size` | はい (`WithBlockBufferSize`) | 結果読み取り時にバッファする、デコード済みブロック数。読み取りとデコードの同時実行を有効にします。 | 通常はデフォルトの 2 で十分です。大きなストリーミング結果には 5～10 を使用します。メモリ = バッファ x ブロックサイズ x 同時実行クエリ数。  | 小さすぎる場合 (1) : ブロックリーダーが詰まり、レイテンシが増加します。大きすぎる場合 (&gt; 50) : メモリ使用量が増え、効果は頭打ちになります。             |
| `FreeBufOnConnRelease` | `bool`  | `false` | —                   | いいえ                        | 再利用せず、各クエリ後に接続のメモリバッファを解放します。                     | クエリレートが高い場合は `false` を使用します。メモリに制約のあるコンテナや、頻度は低いものの大きなバッチを扱う場合は `true` を使用します。 | `false` + メモリ制約あり: バッファが蓄積します (メモリ = バッファ x アイドル接続数) 。`true` + 高レート: GC 負荷が高まり、CPU 使用率が増加します。 |

***

### HTTP 固有 \{#http-specific\}

:::warning[Native では通知なく無視される]
これらのオプションが影響するのは `Protocol: clickhouse.HTTP` の場合のみです。ネイティブプロトコル使用時は通知なく無視され、エラーも警告も出力されません。
:::

| オプション                 | 型                                                  | デフォルト            | DSN パラメータ                 | 説明                                                              | ベストプラクティス                                                                    | 誤設定時                                                                                          |
| --------------------- | -------------------------------------------------- | ---------------- | ------------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `HttpHeaders`         | `map[string]string`                                | `nil`            | —                         | すべてのリクエストに追加される HTTP ヘッダー                                       | トレーシング (`X-Request-ID`) や認証プロキシ用ヘッダーに使用します。必要最小限にとどめてください。                   | 内部ヘッダー (`Content-Type`、`Authorization`) を上書きすると、予測不能な動作を招く可能性があります。                           |
| `HttpUrlPath`         | `string`                                           | `""`             | `http_path`               | リクエストに付加される URL パス。先頭の `/` は自動で追加されます。                          | パスベースのルーティングを行うリバースプロキシ配下で使用します。                                             | パスが誤っている場合: プロキシ/LB から HTTP 404 が返されます。                                                       |
| `HttpMaxConnsPerHost` | `int`                                              | `0` (無制限)        | —                         | トランスポート層におけるホストごとの TCP 接続数 (`http.Transport.MaxConnsPerHost`) 。 | ほとんどのアプリでは 0 のままにします。サーバー側に厳しい接続数制限がある場合にのみ設定します。                            | 低すぎる場合 (例: `MaxOpenConns`=50 に対して 10) : トランスポートがボトルネックとなり、サーバー負荷が低くてもクエリが遅くなります。              |
| `HTTPProxyURL`        | `*url.URL`                                         | `nil` (環境変数を使用)  | `http_proxy` (URL エンコード)  | リクエストのルーティングに使用する HTTP プロキシ                                     | プロキシが必要な場合は明示的に設定します。`HTTP_PROXY`/`HTTPS_PROXY` 環境変数より優先されます。                | アドレスが誤っている場合: `"dial tcp: lookup proxy: no such host"`。プロキシで認証が必要な場合: HTTP 407。               |
| `TransportFunc`       | `func(*http.Transport) (http.RoundTripper, error)` | `nil`            | —                         | カスタム HTTP トランスポートファクトリ。ラップ用にデフォルトのトランスポートを受け取ります。*(v2.41.0 以降)* | オブザーバビリティ用ミドルウェアに使用します。`Proxy`、`DialContext`、`TLSClientConfig` は上書きしないでください。 | `nil` を返すと panic になります。クライアントフィールドを上書きすると、TLS/プロキシは通知なく無視されます。RoundTripper をブロックするとデッドロックします。 |

:::note[2 層の HTTP プーリング]
HTTP を使用する場合、接続プールは 2 層あります。

* **層 1 (アプリケーション) :** `MaxIdleConns` / `MaxOpenConns` -- `httpConnect` オブジェクトを制御します
* **層 2 (トランスポート) :** `HttpMaxConnsPerHost` -- 基盤となる TCP 接続を制御します

ネイティブプロトコルは単純な 1:1 対応で、`HttpMaxConnsPerHost` は無視されます。
:::

```go
TransportFunc: func(t *http.Transport) (http.RoundTripper, error) {
    return &loggingRoundTripper{transport: t}, nil
}
```

***

### 高度な接続 \{#advanced-connection\}

| オプション          | Type                                                   | デフォルト                 | DSN param | 説明                                                           | ベストプラクティス                                                                          | 誤設定時                                                                                                         |
| -------------- | ------------------------------------------------------ | --------------------- | --------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `DialContext`  | `func(ctx, addr) (net.Conn, error)`                    | `nil` (標準ダイヤラ)        | —         | TCP connection 用のカスタムダイヤル関数です。Native と HTTP の両方で使用できます。      | 99% のケースでは `nil` のままにしてください。Unix socket、SOCKS プロキシ、カスタム DNS で使用します。                | context を考慮しないと、ハングやリソースリークの原因になります。`TLS` を設定している場合、カスタムダイヤラ側で TLS を処理する必要があります。無効な `net.Conn` を返すとクラッシュします。 |
| `DialStrategy` | `func(ctx, connID, options, dial) (DialResult, error)` | `DefaultDialStrategy` | —         | サーバー選択と connection 戦略をカスタマイズします。`ConnOpenStrategy` より優先されます。 | 99.9% のケースではデフォルトを使用してください。カスタム実装が必要なのは、地理情報を考慮したルーティング、重み付き選択、ヘルスチェックなどの場合に限られます。 | すべてのサーバーを試行しないと、正常なサーバーが利用可能でも接続に失敗します。内部で高コストな処理を行うと、接続のたびにプール取得がブロックされます。                                  |

***

### クライアント情報 \{#client-information\}

| Option       | Type                | Default                               | DSN param                       | Per-query                | Description                                                                                                                  | Best practice                                                                                                 | When misconfigured                            |
| ------------ | ------------------- | ------------------------------------- | ------------------------------- | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `ClientInfo` | `ClientInfo` struct | 自動: `clickhouse-go` のバージョン + Go ランタイム | `client_info_product=myapp/1.0` | はい (`WithClientInfo`、追記) | ClickHouse に送信されるアプリ識別情報です。`Products` (`[]struct{Name,Version}`) と `Comment` (`[]string`) が含まれます。`system.query_log` で確認できます。 | アプリ名とバージョンは必ず設定してください。クエリの発行元の特定: `SELECT client_name FROM system.query_log WHERE client_name LIKE '%myapp%'` | 未設定の場合、複数サービスがある環境で、どのサービスがクエリを発行したのか特定できません。 |

```go
ClientInfo: clickhouse.ClientInfo{
    Products: []struct{ Name, Version string }{
        {Name: "my-service", Version: "1.0.0"},
    },
}
// Appears as: clickhouse-go/2.x my-service/1.0.0 (lv:go/1.23; os:linux)
```

***

### ClickHouse サーバー設定 \{#server-settings\}

| Option          | Type                          | Default | DSN param                                     | Per-query                               | Description                                                                                                        | Best practice                               | When misconfigured                                                                                                              |
| --------------- | ----------------------------- | ------- | --------------------------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `Settings`      | `map[string]any`              | `nil`   | 認識されない任意のパラメータ (例: `?max_execution_time=60`)  | はい (`WithSettings`、競合時は `context` が優先)  | すべてのクエリに適用される ClickHouse のサーバー設定です。DSN の変換: `"true"`→`1`、`"false"`→`0`、数値→`int`。                                   | 共通の制限は接続レベルで設定し、クエリ単位の上書きは `context` で行います。 | タイプミス: バージョンによっては黙って無視されるか、エラーになります。型が不正: `"Cannot parse string 'abc' as Int64"`。`max_execution_time=0` かつ期限なし: クエリが無期限に実行されます。 |
| `CustomSetting` | `CustomSetting{Value string}` | —       | —                                             | はい (`WithSettings` 経由)                  | ネイティブプロトコルで設定を &quot;custom&quot; (重要ではない設定) として扱います。サーバーが認識しなくてもエラーにはなりません。HTTP では、デフォルトですべての設定が custom として扱われます。 | Experimental な設定やバージョン固有の設定に使用します。          | 重要な設定を custom としてマークすると、未対応の場合に黙って無視されます。                                                                                       |

**一般的な設定:**

| Setting              | Type | Description                  |
| -------------------- | ---- | ---------------------------- |
| `max_execution_time` | int  | クエリのタイムアウト (秒)               |
| `max_memory_usage`   | int  | クエリごとのメモリ制限 (バイト)            |
| `max_block_size`     | int  | 処理時の block サイズ               |
| `readonly`           | int  | 1 = 読み取り専用、2 = 読み取り専用 + 設定変更 |

```go
Settings: clickhouse.Settings{
    "max_execution_time":  60,                                        // important -- errors if unknown
    "my_custom_setting":   clickhouse.CustomSetting{Value: "value"},  // custom -- ignored if unknown
}
```

***

## Context レベルのクエリオプション \{#context-options\}

各クエリごとに `clickhouse.Context()` を使用して設定します:

```go
ctx := clickhouse.Context(context.Background(),
    clickhouse.WithQueryID("my-query"),
    clickhouse.WithSettings(clickhouse.Settings{"max_execution_time": 60}),
)
```

:::note[Context のデッドライン動作]
Context のデッドラインが 1 秒を超えている場合、`max_execution_time` は自動的に `seconds_remaining + 5` に設定されます。これにより、手動で設定した値は上書きされます。
:::

| オプション                     | 型                                  | 既定値                 | プロトコル       | 説明                                                                                                                                                                 | ベストプラクティス                                                                                  | 誤設定時                                                                                                                                      |
| ------------------------- | ---------------------------------- | ------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `WithQueryID`             | `string`                           | 自動生成                | 両方          | カスタムのクエリ識別子。`system.query_log` および `system.processes` に表示されます。                                                                                                     | UUID を使用します。`KILL QUERY WHERE query_id='...'` の実行時に便利です。                                   | 重複したIDにより、`system.query_log` で混乱が生じます。                                                                                                    |
| `WithQuotaKey`            | `string`                           | `""`                | 両方          | マルチテナントのリソース制限のためのQUOTAキー。サーバー側でQUOTAを設定する必要があります。                                                                                                                 | 顧客別／ユーザー別の制限に使用します。                                                                        | Quota が設定されていない場合: 何も出力せず無視されます。                                                                                                          |
| `WithJWT`                 | `string`                           | `""`                | HTTPS のみ    | ClickHouse Cloud のクエリ単位の JWT 上書き。*(v2.35.0 以降)*                                                                                                                    | マルチテナントプロキシで、リクエスト単位の認証に使用します。                                                             | TLS なし: 無視され、接続の認証にフォールバックします。期限切れ: `"Token has expired"`。                                                                                |
| `WithSettings`            | `Settings`                         | 接続設定を継承             | 両方          | クエリごとのサーバー設定。接続設定と統合され、競合する場合はコンテキスト側が優先されます。                                                                                                                      | クエリ種別ごとに `max_execution_time` または `max_rows_to_read` を上書きします。                              | 接続レベルの`Settings`と同様です。                                                                                                                    |
| `WithParameters`          | `Parameters` (`map[string]string`) | `nil`               | 両方          | サーバー側のパラメータ化クエリの値。クエリ構文: `{param_name:Type}`。                                                                                                                      | SQLインジェクションを防ぐため、文字列連結の代わりに使用します。                                                          | パラメータが不足: `"Substitution {param_name:Type} isn't set"`。型が不正: `"Cannot parse string 'abc' as UInt64"`。                                     |
| `WithAsync`               | `bool` (wait)                      | 同期                  | 両方          | 非同期 INSERT モード。`async_insert=1` を設定します。`wait=true` を指定すると、`wait_for_async_insert=1` も設定されます。ClickHouse 21.11 以降が必要です。*(v2.41.0 以降。従来の `WithStdAsync` に置き換わるものです。)* | 高スループットの挿入に使用します。                                                                          | `wait=false`: エラーは非同期で発生する場合があります -- `system.asynchronous_insert_log` を確認してください。SELECT では無視されます。古いサーバー: `"Unknown setting async_insert"`。 |
| `WithLogs`                | `func(*Log)`                       | `nil`               | Native のみ   | クエリ実行中のサーバーのログエントリを受け取るコールバック。                                                                                                                                     | 高速に保ってください。実行をブロックするためです。負荷の高い処理には goroutine を使用してください。                                    | HTTP では、何の警告もなく呼び出されません。                                                                                                                  |
| `WithProgress`            | `func(*Progress)`                  | `nil`               | Native のみ   | クエリの進捗更新 (処理済みの行数/バイト数) 。                                                                                                                                          | 高速に保ってください -- 実行をブロックします。                                                                  | HTTP では、何の警告もなく呼び出されません。                                                                                                                  |
| `WithProfileInfo`         | `func(*ProfileInfo)`               | `nil`               | Native のみ   | クエリ実行統計のコールバック。                                                                                                                                                    | 高速に保ってください。処理をブロックします。                                                                     | HTTP では呼び出されませんが、エラーにはなりません。                                                                                                              |
| `WithProfileEvents`       | `func([]ProfileEvent)`             | `nil`               | Native のみ   | パフォーマンスカウンターのコールバック。                                                                                                                                               | 高速に保つこと。処理をブロックします。                                                                        | HTTP では、何の通知もなく呼び出されません。                                                                                                                  |
| `WithoutProfileEvents`    | —                                  | イベントを送信             | Native のみ対応 | profile events を抑制します。サーバー ≥ 25.11 でのパフォーマンス最適化。*(v2.44.0 以降)*                                                                                                     | profile events が不要な場合に使用します。                                                               | 古いサーバーでは: 不明な設定としてエラーになります。                                                                                                               |
| `WithExternalTable`       | `...*ext.Table`                    | `nil`               | 両対応         | 一時的なルックアップテーブルをクエリに添付します。データはクエリごとに転送されます。                                                                                                                         | テーブルは 10 MB 未満に抑えてください。native は HTTP (multipart) より効率的です。                                  | テーブルが大きい場合: クエリごとにネットワークのオーバーヘッドが発生します。                                                                                                   |
| `WithUserLocation`        | `*time.Location`                   | サーバーのタイムゾーン         | 両方          | DateTime の解析時に timezone を上書きします。                                                                                                                                   | クライアントとサーバーの timezones が異なる場合は、明示的に設定します。                                                  | timezone が誤っていると、DateTime の値が気付かないうちに数時間ずれ、データ破損を招くおそれがあります。                                                                              |
| `WithColumnNamesAndTypes` | `[]ColumnNameAndType`              | `nil` (DESCRIBEを実行) | HTTPのみ      | カラム情報を事前に指定することで、HTTPインサート時の `DESCRIBE TABLE` の往復を省略します。 *(v2.37.0以降)*                                                                                             | スキーマが既知で安定している場合に使用します。                                                                    | 型の不一致: `"Cannot convert String to UInt64"`。移行後のスキーマ変更: 情報が古いまま。                                                                           |
| `WithBlockBufferSize`     | `uint8`                            | 接続レベル (2)           | 両方          | 単一のクエリについて、接続レベルの`BlockBufferSize`を上書きします。                                                                                                                         | 特定のクエリで結果セットが大きい場合は増やします。                                                                  | —                                                                                                                                         |
| `WithClientInfo`          | `ClientInfo`                       | 接続レベル               | 両方          | 1つのクエリに対して追加のクライアント情報を付加します。置き換えは行わず、追記します。*(v2.42.0 以降)*                                                                                                          | リクエストごとのコンテキスト (例: エンドポイント名) を追加                                                           | —                                                                                                                                         |
| `WithSpan`                | `trace.SpanContext`                | 空                   | ネイティブのみ     | 分散トレーシングのための OpenTelemetry スパンコンテキスト。                                                                                                                              | [OpenTelemetry](/integrations/language-clients/go/clickhouse-api#open-telemetry)を参照してください。 | —                                                                                                                                         |

```go
ctx := clickhouse.Context(ctx,
    clickhouse.WithQueryID("query-123"),
    clickhouse.WithParameters(clickhouse.Parameters{
        "user_id": "12345",
    }),
    clickhouse.WithProgress(func(p *clickhouse.Progress) {
        log.Printf("Progress: %d rows, %d bytes", p.Rows, p.Bytes)
    }),
)
rows, err := conn.Query(ctx, "SELECT * FROM users WHERE id = {user_id:String}")
```

***

## バッチオプション \{#batch-options\}

`PrepareBatch()` に渡すオプションです。インポート: `github.com/ClickHouse/clickhouse-go/v2/lib/driver`。

| Option                  | Default          | Description                                                    | Best practice                             | When misconfigured                                             |
| ----------------------- | ---------------- | -------------------------------------------------------------- | ----------------------------------------- | -------------------------------------------------------------- |
| `WithReleaseConnection` | `Send()` まで接続を保持 | `PrepareBatch()` の直後に接続をプールへ返却します。`Send()`/`Flush()` 時に再取得します。 | 接続プールの枯渇を防ぐため、長時間維持するバッチ (数分～数時間) で使用します。 | 長時間のバッチで使わない場合: アクティブなバッチが多いと `"acquire conn timeout"` が発生します。 |
| `WithCloseOnFlush`      | バッチは開いたまま        | `Flush()` の呼び出し時にバッチを自動的に閉じます。                                 | 1 回限りのバッチで使用します。明示的な `Close()` を省けます。     | `Flush()` を複数回呼び出す場合に使うと、最初の flush でバッチが閉じ、以降の操作は失敗します。        |

```go
batch, err := conn.PrepareBatch(ctx, "INSERT INTO table",
    driver.WithReleaseConnection(),
    driver.WithCloseOnFlush(),
)
```

***

## 早見表 \{#quick-reference-tables\}

### 接続プールのサイズ設定の推奨値 \{#pool-sizing\}

| アプリケーションの種類        | MaxIdleConns | MaxOpenConns | ConnMaxLifetime |
| ------------------ | ------------ | ------------ | --------------- |
| 低トラフィックの Web アプリ   | 5            | 10           | 1h              |
| 中程度のトラフィックの API    | 20           | 50           | 30m             |
| 高トラフィックのサービス       | 50           | 100          | 15m             |
| バックグラウンド バッチジョブ    | 10           | 20           | 2h              |
| Kubernetes デプロイメント | 10           | 20           | 10m             |
| サーバーレス (Lambda)    | 1            | 5            | 5m              |

### タイムアウトの推奨値 \{#timeout-recommendations\}

| 環境               | DialTimeout | ReadTimeout |
| ---------------- | ----------- | ----------- |
| ローカル / LAN       | 5s          | 30s         |
| Cloud (同一リージョン)  | 10s         | 2m          |
| Cloud (リージョン間)   | 30s         | 5m          |
| OLAP ワークロード      | 10s         | 30m         |
| リアルタイム / OLTP    | 5s          | 10s         |

### DSN パラメータのクイックリファレンス \{#dsn-parameters\}

| DSN パラメータ                  | Options フィールド            | 例                                       |
| -------------------------- | ------------------------ | --------------------------------------- |
| `username`                 | `Auth.Username`          | `?username=admin`                       |
| `password`                 | `Auth.Password`          | `?password=secret`                      |
| `database`                 | `Auth.Database`          | `?database=mydb` またはパス内の `/mydb`        |
| `dial_timeout`             | `DialTimeout`            | `?dial_timeout=10s`                     |
| `read_timeout`             | `ReadTimeout`            | `?read_timeout=5m`                      |
| `max_open_conns`           | `MaxOpenConns`           | `?max_open_conns=50`                    |
| `max_idle_conns`           | `MaxIdleConns`           | `?max_idle_conns=20`                    |
| `conn_max_lifetime`        | `ConnMaxLifetime`        | `?conn_max_lifetime=30m`                |
| `connection_open_strategy` | `ConnOpenStrategy`       | `?connection_open_strategy=round_robin` |
| `block_buffer_size`        | `BlockBufferSize`        | `?block_buffer_size=10`                 |
| `compress`                 | `Compression.Method`     | `?compress=lz4`                         |
| `compress_level`           | `Compression.Level`      | `?compress_level=6`                     |
| `max_compression_buffer`   | `MaxCompressionBuffer`   | `?max_compression_buffer=20971520`      |
| `secure`                   | `TLS`                    | `?secure=true`                          |
| `skip_verify`              | `TLS.InsecureSkipVerify` | `?skip_verify=true`                     |
| `debug`                    | `Debug`                  | `?debug=true`                           |
| `client_info_product`      | `ClientInfo.Products`    | `?client_info_product=myapp/1.0`        |
| `http_proxy`               | `HTTPProxyURL`           | `?http_proxy=http%3A%2F%2Fproxy%3A8080` |
| `http_path`                | `HttpUrlPath`            | `?http_path=/clickhouse`                |
| *(その他)*                    | `Settings[key]`          | `?max_execution_time=60`                |

***

## トラブルシューティング \{#troubleshooting\}

### 接続プールが枯渇: &quot;acquire conn timeout&quot; \{#acquire-conn-timeout\}

**原因:** 接続プールが枯渇しています。`MaxOpenConns` で許可されたすべての接続が使用中で、`DialTimeout` 内に空きができませんでした。

**対処方法**

次の手順を順に試し、設定値を調整する前に根本原因を特定してください。

1. 接続を保持したままになっている長時間実行中のクエリがないか確認します: `SELECT query_id, elapsed FROM system.processes ORDER BY elapsed DESC`。見つかった場合は、まず低速なクエリに対処してください。
2. 長時間にわたるバッチ (`PrepareBatch()` から `Send()` まで数分または数時間空くもの) を実行している場合は、バッチを開いたままでも接続をプールに戻せるよう、`WithReleaseConnection()` を使用します。
3. 実際に観測された同時実行数に合わせて `MaxOpenConns` を増やします。
4. バーストが想定され、接続取得待ちが実際のボトルネックである場合にのみ `DialTimeout` を増やします。

### 読み取りタイムアウトおよび接続リセットエラー \{#io-timeout\}

**原因:** サーバーからの応答を待機中に `ReadTimeout` を超過したか、サーバーまたはネットワークによって接続が切断されました。

**対処方法:**

* 長時間実行されるクエリでは `ReadTimeout` を増やします
* クエリごとのタイムアウトを制御するには、context のデッドラインを使用します
* ClickHouse サーバー側の `max_execution_time` 制限を確認します

### &quot;Code: 516. 認証に失敗しました&quot; \{#auth-failed\}

**原因:** ユーザー名またはパスワードが誤っているか、ユーザーが存在しません。

**対処方法:**

* `system.users` テーブルで認証情報を確認します
* DSN のパスワードに含まれる特殊文字の URL エンコードに問題がないか確認します
* ユーザーに指定したデータベースへのアクセス権があることを確認します

### TLS 証明書エラー \{#tls-errors\}

| エラー                                             | 原因             | 対処                                            |
| ----------------------------------------------- | -------------- | --------------------------------------------- |
| `x509: certificate has expired`                 | サーバー証明書の有効期限切れ | サーバー証明書を更新する                                  |
| `x509: certificate is valid for X, not Y`       | ホスト名の不一致       | 正しいホスト名を使用するか、SAN に追加する                       |
| `x509: certificate signed by unknown authority` | 信頼されていない CA    | CA を `tls.Config.RootCAs` に追加する               |
| `connection reset by peer`                      | TLS/ポートの設定不一致  | TLS にはポート 9440 (Native) または 8443 (HTTP) を使用する |

### メモリ使用量が徐々に増加する \{#memory-growth\}

**原因:** 大きなアイドル状態の接続バッファが蓄積している。

**対処:**

* メモリに制約がある環境では、`FreeBufOnConnRelease: true` を設定する
* アイドル接続数を抑えるため、`MaxIdleConns` を減らす
* 圧縮を使用している場合は、`MaxCompressionBuffer` を減らす
* 接続をより頻繁に入れ替えるため、`ConnMaxLifetime` を短くする