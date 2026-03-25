---
sidebar_label: '設定'
sidebar_position: 2
keywords: ['ClickHouse', 'go', 'golang', '設定', '接続', 'TLS', '認証']
description: 'clickhouse-goクライアントの設定: 接続設定、TLS、認証、接続プーリング、ロギング、圧縮。'
slug: /integrations/language-clients/go/configuration
title: '設定'
doc_type: 'reference'
---

# 設定 \{#configuration\}

## 接続設定 \{#connection-settings\}

接続を開く際は、`Options` 構造体を使用してクライアントの動作を制御できます。使用できる設定は次のとおりです。

| パラメータ                  | 型                                                  | デフォルト              | 説明                                                                                                                              |
| ---------------------- | -------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| `Protocol`             | `Protocol`                                         | `Native`           | 通信プロトコル: `Native` (TCP) または `HTTP`。詳細は [TCP vs HTTP](#tcp-vs-http) を参照してください。                                                   |
| `Addr`                 | `[]string`                                         | —                  | `host:port` 形式のアドレスのスライス。複数ノードについては [Connecting to multiple nodes](#connecting-to-multiple-nodes) を参照してください。                    |
| `Auth`                 | `Auth`                                             | —                  | 認証情報 (`Database`, `Username`, `Password`)。詳細は [Authentication](#authentication) を参照してください。                                      |
| `TLS`                  | `*tls.Config`                                      | `nil`              | TLS 設定。`nil` 以外の値を指定すると TLS が有効になります。詳細は [TLS](#using-tls) を参照してください。                                                           |
| `DialContext`          | `func(ctx, addr) (net.Conn, error)`                | —                  | TCP 接続の確立方法を制御するためのカスタムダイヤル関数。                                                                                                  |
| `DialTimeout`          | `time.Duration`                                    | `30s`              | 新しい接続を開く際の最大待機時間。                                                                                                               |
| `MaxOpenConns`         | `int`                                              | `MaxIdleConns + 5` | 同時に開くことができる接続の最大数。                                                                                                              |
| `MaxIdleConns`         | `int`                                              | `5`                | 接続プール内で維持するアイドル接続の数。                                                                                                            |
| `ConnMaxLifetime`      | `time.Duration`                                    | `1h`               | プールされた接続の最大存続時間。詳細は [Connection pooling](#connection-pooling) を参照してください。                                                        |
| `ConnOpenStrategy`     | `ConnOpenStrategy`                                 | `ConnOpenInOrder`  | `Addr` からノードを選択する戦略。詳細は [Connecting to multiple nodes](#connecting-to-multiple-nodes) を参照してください。                                |
| `BlockBufferSize`      | `uint8`                                            | `2`                | 並列にデコードするブロック数。値を大きくすると、メモリ消費と引き換えにスループットが向上します。クエリごとに context 経由で上書きできます。                                                      |
| `Settings`             | `Settings`                                         | —                  | すべてのクエリに適用される ClickHouse 設定のマップ。個別のクエリでは [context](/integrations/language-clients/go/clickhouse-api#using-context) を通じて上書きできます。 |
| `Compression`          | `*Compression`                                     | `nil`              | ブロック単位の圧縮。詳細は [Compression](#compression) を参照してください。                                                                            |
| `ReadTimeout`          | `time.Duration`                                    | —                  | 1 回の呼び出しでサーバーからの読み取りを待機する最大時間。                                                                                                  |
| `FreeBufOnConnRelease` | `bool`                                             | `false`            | true の場合、クエリごとに接続のメモリバッファをプールに戻します。わずかな CPU コストでメモリ使用量を削減できます。                                                                  |
| `Logger`               | `*slog.Logger`                                     | `nil`              | 構造化ロガー (Go `log/slog`)。詳細は [Logging](#logging) を参照してください。                                                                       |
| `Debug`                | `bool`                                             | `false`            | **非推奨。** 代わりに `Logger` を使用してください。従来のデバッグ出力を stdout に出力します。                                                                      |
| `Debugf`               | `func(string, ...any)`                             | —                  | **非推奨。** 代わりに `Logger` を使用してください。カスタムのデバッグログ関数。`Debug: true` が必要です。                                                             |
| `GetJWT`               | `GetJWTFunc`                                       | —                  | ClickHouse Cloud 認証用の JWT token を返すコールバック (HTTPS のみ)。                                                                           |
| `HttpHeaders`          | `map[string]string`                                | —                  | すべてのリクエストで送信される追加の HTTP header (HTTP トランスポートのみ)。                                                                                     |
| `HttpUrlPath`          | `string`                                           | —                  | HTTP リクエストに追加される URL パス (HTTP トランスポートのみ)。                                                                                            |
| `HttpMaxConnsPerHost`  | `int`                                              | —                  | 基盤となる `http.Transport` の `MaxConnsPerHost` を上書きします (HTTP トランスポートのみ)。                                                                 |
| `TransportFunc`        | `func(*http.Transport) (http.RoundTripper, error)` | —                  | カスタム HTTP トランスポート ファクトリ。必要な項目だけを上書きできるよう、デフォルトのトランスポートが渡されます (HTTP トランスポートのみ)。                                                 |
| `HTTPProxyURL`         | `*url.URL`                                         | —                  | すべてのリクエストに使用する HTTP プロキシ URL (HTTP トランスポートのみ)。                                                                                       |

```go
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.Port)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
    DialContext: func(ctx context.Context, addr string) (net.Conn, error) {
        dialCount++
        var d net.Dialer
        return d.DialContext(ctx, "tcp", addr)
    },
    Debug: true,
    Debugf: func(format string, v ...interface{}) {
        fmt.Printf(format, v)
    },
    Settings: clickhouse.Settings{
        "max_execution_time": 60,
    },
    Compression: &clickhouse.Compression{
        Method: clickhouse.CompressionLZ4,
    },
    DialTimeout:      time.Duration(10) * time.Second,
    MaxOpenConns:     5,
    MaxIdleConns:     5,
    ConnMaxLifetime:  time.Duration(10) * time.Minute,
    ConnOpenStrategy: clickhouse.ConnOpenInOrder,
    BlockBufferSize: 10,
})
if err != nil {
    return err
}
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/connect_settings.go)

## TLS \{#using-tls\}

低レベルでは、すべてのクライアント接続メソッド (`DSN/OpenDB/Open`) で、安全な接続を確立するために [Go tls package](https://pkg.go.dev/crypto/tls) が使われます。クライアントは、Options 構造体に nil ではない `tls.Config` ポインタが含まれている場合、TLS を使うことを認識します。

```go
env, err := GetNativeTestEnvironment()
if err != nil {
    return err
}
cwd, err := os.Getwd()
if err != nil {
    return err
}
t := &tls.Config{}
caCert, err := ioutil.ReadFile(path.Join(cwd, "../../tests/resources/CAroot.crt"))
if err != nil {
    return err
}
caCertPool := x509.NewCertPool()
successful := caCertPool.AppendCertsFromPEM(caCert)
if !successful {
    return err
}
t.RootCAs = caCertPool
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.SslPort)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
    TLS: t,
})
if err != nil {
    return err
}
v, err := conn.ServerVersion()
if err != nil {
    return err
}
fmt.Println(v.String())
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/ssl.go)

この最小限の `TLS.Config` で、通常は ClickHouse サーバーのセキュアなネイティブポート (通常は 9440) への接続に十分です。ClickHouse サーバーに有効な証明書がない場合 (期限切れ、ホスト名の不一致、または一般に信頼されている公開ルート認証局による署名がない場合など) 、`InsecureSkipVerify` を true にできますが、これは強く非推奨です。

```go
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.SslPort)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
    TLS: &tls.Config{
        InsecureSkipVerify: true,
    },
})
if err != nil {
    return err
}
v, err := conn.ServerVersion()
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/ssl_no_verify.go)

追加のTLSパラメータが必要な場合は、アプリケーションコードで `tls.Config` 構造体の必要なフィールドを設定してください。これには、特定の暗号スイートの指定、特定のTLSバージョン (1.2 や 1.3 など) の強制、内部CA証明書チェーンの追加、ClickHouse サーバーで必要な場合のクライアント証明書 (および秘密鍵) の追加、さらに、より高度なセキュリティ構成に伴うその他のオプションのほとんどが含まれます。

## 認証 \{#authentication\}

ユーザー名とパスワードを指定するには、接続情報で Auth 構造体を指定します。

```go
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.Port)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
})
if err != nil {
    return err
}

v, err := conn.ServerVersion()
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/auth.go)

## 複数のノードへの接続 \{#connecting-to-multiple-nodes\}

複数のアドレスは、`Addr` 構造体で指定できます。

```go
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{"127.0.0.1:9001", "127.0.0.1:9002", fmt.Sprintf("%s:%d", env.Host, env.Port)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
})
if err != nil {
    return err
}
v, err := conn.ServerVersion()
if err != nil {
    return err
}
fmt.Println(v.String())
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/1c0d81d0b1388dbb9e09209e535667df212f4ae4/examples/clickhouse_api/multi_host.go#L26-L45)

利用可能な接続戦略は 3 つあります。

* `ConnOpenInOrder` (default)  - アドレスは順番に使用されます。後ろのアドレスは、一覧内で先にあるアドレスへの接続に失敗した場合にのみ使用されます。実質的にはフェイルオーバー戦略です。
* `ConnOpenRoundRobin` - ラウンドロビン方式でアドレス間に負荷が分散されます。
* `ConnOpenRandom` - アドレス一覧からノードがランダムに選択されます。

これは `ConnOpenStrategy` オプションで制御できます。

```go
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr:             []string{"127.0.0.1:9001", "127.0.0.1:9002", fmt.Sprintf("%s:%d", env.Host, env.Port)},
    ConnOpenStrategy: clickhouse.ConnOpenRoundRobin,
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
})
if err != nil {
    return err
}
v, err := conn.ServerVersion()
if err != nil {
    return err
}
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/1c0d81d0b1388dbb9e09209e535667df212f4ae4/examples/clickhouse_api/multi_host.go#L50-L67)

## 接続プーリング \{#connection-pooling\}

クライアントは接続プールを維持し、必要に応じてクエリ間で接続を再利用します。同時に使用される接続数は最大でも `MaxOpenConns` までで、プールの最大サイズは `MaxIdleConns` によって制御されます。クライアントはクエリを実行するたびにプールから接続を取得し、再利用のためにプールへ返却します。接続は batch の存続期間中使用され、`Send()` の実行時に解放されます。

ユーザーが `MaxOpenConns=1` を設定しない限り、プール内の同じ接続が後続のクエリでも使われる保証はありません。これは必要になることはまれですが、一時テーブルを使うケースでは必要になる場合があります。

また、`ConnMaxLifetime` のデフォルト値は 1 時間である点にも注意してください。このため、ノードがクラスタから離脱すると、ClickHouse への負荷が不均衡になる場合があります。これは、あるノードが利用不能になると、接続が他のノードへ振り分けられることで発生します。問題のあったノードがクラスタに復帰しても、これらの接続は維持され、デフォルトでは 1 時間は更新されません。高負荷のワークロードでは、この値を小さくすることを検討してください。

接続プーリングは Native (TCP) と HTTP プロトコルの両方で有効化されています。

## ロギング \{#logging\}

クライアントは、`Options` の `Logger` フィールドを使用して、Go 標準の `log/slog` パッケージによる構造化ロギングをサポートします。以前の `Debug` フィールドと `Debugf` フィールドは非推奨ですが、後方互換性のため引き続き利用できます (優先順位: `Debugf` &gt; `Logger` &gt; no-op) 。

```go
import (
    "log/slog"
    "os"
)

// JSON structured logging
logger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
    Level: slog.LevelDebug,
}))

conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.Port)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
    Logger: logger,
})
```

logger に application レベルの Context を追加して、情報を補うこともできます：

```go
baseLogger := slog.New(slog.NewJSONHandler(os.Stdout, &slog.HandlerOptions{
    Level: slog.LevelInfo,
}))
enrichedLogger := baseLogger.With(
    slog.String("service", "my-service"),
    slog.String("environment", "production"),
)

conn, err := clickhouse.Open(&clickhouse.Options{
    // ...
    Logger: enrichedLogger,
})
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/logger_test.go)

## 圧縮 \{#compression\}

圧縮方式のサポートは、使用する基盤プロトコルによって異なります。ネイティブプロトコルでは、クライアントは `LZ4` と `ZSTD` による圧縮をサポートします。これはブロックレベルでのみ実行されます。圧縮は、接続に `Compression` 設定を含めることで有効化できます。

```go
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.Port)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
    Compression: &clickhouse.Compression{
        Method: clickhouse.CompressionZSTD,
    },
    MaxOpenConns: 1,
})
ctx := context.Background()
defer func() {
    conn.Exec(ctx, "DROP TABLE example")
}()
conn.Exec(context.Background(), "DROP TABLE IF EXISTS example")
if err = conn.Exec(ctx, `
    CREATE TABLE example (
            Col1 Array(String)
    ) Engine Memory
    `); err != nil {
    return err
}
batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

for i := 0; i < 1000; i++ {
    if err := batch.Append([]string{strconv.Itoa(i), strconv.Itoa(i + 1), strconv.Itoa(i + 2), strconv.Itoa(i + 3)}); err != nil {
        return err
    }
}
if err := batch.Send(); err != nil {
    return err
}
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/compression.go)

HTTP トランスポートを使用する場合は、`gzip`、`deflate`、`br` といった追加の圧縮方式も利用できます。詳細については、[Database/SQL API - Compression](/integrations/language-clients/go/database-sql-api#compression) を参照してください。

## TCP vs HTTP \{#tcp-vs-http\}

トランスポートの違いは 1 つの設定を切り替えるだけで、それ以外のこのガイドの内容は両方に共通して適用されます。違いは次のとおりです。

|                                | TCP (Native protocol)    | HTTP                                                |
| :----------------------------- | :----------------------- | :-------------------------------------------------- |
| **デフォルトポート**                   | 9000 (plain), 9440 (TLS) | 8123 (plain), 8443 (TLS)                            |
| **有効**                         | デフォルト — `Protocol` は省略   | `Protocol: clickhouse.HTTP` または `http://` DSN を使う   |
| **圧縮**                         | `lz4`, `zstd`            | `lz4`, `zstd`, `gzip`, `deflate`, `br`              |
| **セッション**                      | 組み込み (常にアクティブ)           | 明示的 — `session_id` を設定として渡す                         |
| **HTTP ヘッダー**                  | —                        | `HttpHeaders`, `HttpUrlPath`, `HttpMaxConnsPerHost` |
| **カスタムトランスポート**                | —                        | `TransportFunc`                                     |
| **JWT 認証**                     | —                        | `GetJWT` (ClickHouse Cloud HTTPS)                   |
| **OpenTelemetry (`WithSpan`)** | ✅                        | サーバー側はサポートしているが、クライアントはまだ `traceparent` ヘッダーを送信しない  |

いずれかの API を HTTP に切り替えるには:

```go
// ClickHouse API over HTTP
conn, err := clickhouse.Open(&clickhouse.Options{
    Addr:     []string{"host:8123"},
    Protocol: clickhouse.HTTP,
    // ... auth, etc.
})

// database/sql over HTTP — via Options
conn := clickhouse.OpenDB(&clickhouse.Options{
    Addr:     []string{"host:8123"},
    Protocol: clickhouse.HTTP,
    // ... auth, etc.
})

// database/sql over HTTP — via DSN
conn, err := sql.Open("clickhouse", "http://host:8123?username=user&password=pass")
```
