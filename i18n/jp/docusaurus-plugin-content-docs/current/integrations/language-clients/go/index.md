---
sidebar_label: 'Go'
sidebar_position: 1
keywords: ['clickhouse', 'go', 'client', 'golang']
slug: /integrations/go
description: 'ClickHouse 用の Go クライアントを使用すると、Go の標準 database/sql インターフェイスまたは最適化されたネイティブインターフェイスを通じて ClickHouse に接続できます。'
title: 'ClickHouse Go'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'language_client'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_native.md';


# ClickHouse Go



## シンプルな例 {#a-simple-example}

シンプルな例から始めましょう。ClickHouseに接続し、systemデータベースから選択を行います。開始するには、接続情報が必要です。

### 接続情報 {#connection-details}

<ConnectionDetails />

### モジュールの初期化 {#initialize-a-module}

```bash
mkdir clickhouse-golang-example
cd clickhouse-golang-example
go mod init clickhouse-golang-example
```

### サンプルコードのコピー {#copy-in-some-sample-code}

このコードを`clickhouse-golang-example`ディレクトリに`main.go`としてコピーします。

```go title=main.go
package main

import (
        "context"
        "crypto/tls"
        "fmt"
        "log"

        "github.com/ClickHouse/clickhouse-go/v2"
        "github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

func main() {
        conn, err := connect()
        if err != nil {
                panic(err)
        }

        ctx := context.Background()
        rows, err := conn.Query(ctx, "SELECT name, toString(uuid) as uuid_str FROM system.tables LIMIT 5")
        if err != nil {
                log.Fatal(err)
        }

        for rows.Next() {
                var name, uuid string
                if err := rows.Scan(&name, &uuid); err != nil {
                        log.Fatal(err)
                }
                log.Printf("name: %s, uuid: %s", name, uuid)
        }

}

func connect() (driver.Conn, error) {
        var (
                ctx       = context.Background()
                conn, err = clickhouse.Open(&clickhouse.Options{
                        Addr: []string{"<CLICKHOUSE_SECURE_NATIVE_HOSTNAME>:9440"},
                        Auth: clickhouse.Auth{
                                Database: "default",
                                Username: "default",
                                Password: "<DEFAULT_USER_PASSWORD>",
                        },
                        ClientInfo: clickhouse.ClientInfo{
                                Products: []struct {
                                        Name    string
                                        Version string
                                }{
                                        {Name: "an-example-go-client", Version: "0.1"},
                                },
                        },
                        Debugf: func(format string, v ...interface{}) {
                                fmt.Printf(format, v)
                        },
                        TLS: &tls.Config{
                                InsecureSkipVerify: true,
                        },
                })
        )

        if err != nil {
                return nil, err
        }

        if err := conn.Ping(ctx); err != nil {
                if exception, ok := err.(*clickhouse.Exception); ok {
                        fmt.Printf("Exception [%d] %s \n%s\n", exception.Code, exception.Message, exception.StackTrace)
                }
                return nil, err
        }
        return conn, nil
}
```

### go mod tidyの実行 {#run-go-mod-tidy}

```bash
go mod tidy
```

### 接続情報の設定 {#set-your-connection-details}

先ほど接続情報を確認しました。`main.go`の`connect()`関数内でそれらを設定します。

```go
func connect() (driver.Conn, error) {
  var (
    ctx       = context.Background()
    conn, err = clickhouse.Open(&clickhouse.Options{
    #highlight-next-line
      Addr: []string{"<CLICKHOUSE_SECURE_NATIVE_HOSTNAME>:9440"},
      Auth: clickhouse.Auth{
    #highlight-start
        Database: "default",
        Username: "default",
        Password: "<DEFAULT_USER_PASSWORD>",
    #highlight-end
      },
```

### 例の実行 {#run-the-example}

```bash
go run .
```

```response
2023/03/06 14:18:33 name: COLUMNS, uuid: 00000000-0000-0000-0000-000000000000
2023/03/06 14:18:33 name: SCHEMATA, uuid: 00000000-0000-0000-0000-000000000000
2023/03/06 14:18:33 name: TABLES, uuid: 00000000-0000-0000-0000-000000000000
2023/03/06 14:18:33 name: VIEWS, uuid: 00000000-0000-0000-0000-000000000000
2023/03/06 14:18:33 name: hourly_data, uuid: a4e36bd4-1e82-45b3-be77-74a0fe65c52b
```

### 詳細情報 {#learn-more}

このカテゴリの残りのドキュメントでは、ClickHouse Goクライアントの詳細について説明します。


## ClickHouse Goクライアント {#clickhouse-go-client}

ClickHouseは2つの公式Goクライアントをサポートしています。これらのクライアントは相互補完的であり、意図的に異なるユースケースに対応しています。

- [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) - Go標準のdatabase/sqlインターフェースまたはネイティブインターフェースのいずれかをサポートする高レベルクライアント。
- [ch-go](https://github.com/ClickHouse/ch-go) - 低レベルクライアント。ネイティブインターフェースのみ対応。

clickhouse-goは高レベルインターフェースを提供し、行指向のセマンティクスとバッチ処理を使用したデータのクエリと挿入を可能にします。データ型に関しては柔軟で、精度の損失が発生しない限り値は自動的に変換されます。一方、ch-goは最適化された列指向インターフェースを提供し、型の厳密性と複雑な使用方法を代償として、低いCPUおよびメモリオーバーヘッドで高速なデータブロックストリーミングを実現します。

バージョン2.3以降、clickhouse-goはエンコード、デコード、圧縮などの低レベル機能にch-goを利用しています。なお、clickhouse-goはGoの`database/sql`インターフェース標準もサポートしています。両クライアントは最適なパフォーマンスを提供するためにエンコードにネイティブ形式を使用し、ネイティブClickHouseプロトコルで通信できます。clickhouse-goは、ユーザーがトラフィックをプロキシまたはロードバランスする必要がある場合のために、トランスポートメカニズムとしてHTTPもサポートしています。

クライアントライブラリを選択する際は、それぞれの長所と短所を理解しておく必要があります。詳細は「クライアントライブラリの選択」を参照してください。

|               | ネイティブ形式 | ネイティブプロトコル | HTTPプロトコル | 行指向API | 列指向API | 型の柔軟性 | 圧縮 | クエリプレースホルダー |
| :-----------: | :-----------: | :-------------: | :-----------: | :----------------: | :-------------------: | :--------------: | :---------: | :----------------: |
| clickhouse-go |      ✅       |       ✅        |      ✅       |         ✅         |          ✅           |        ✅        |     ✅      |         ✅         |
|     ch-go     |      ✅       |       ✅        |               |                    |          ✅           |                  |     ✅      |                    |


## クライアントの選択 {#choosing-a-client}

クライアントライブラリの選択は、使用パターンと最適なパフォーマンスの必要性によって決まります。毎秒数百万件の挿入が必要な挿入負荷の高いユースケースでは、低レベルクライアントである [ch-go](https://github.com/ClickHouse/ch-go) の使用を推奨します。このクライアントは、ClickHouseのネイティブフォーマットが要求する行指向フォーマットから列形式へのデータ変換に伴うオーバーヘッドを回避します。さらに、使用を簡素化するためにリフレクションや `interface{}` (`any`) 型の使用を避けています。

集計に焦点を当てたクエリワークロードや低スループットの挿入ワークロードの場合、[clickhouse-go](https://github.com/ClickHouse/clickhouse-go) が使い慣れた `database/sql` インターフェースとより直感的な行セマンティクスを提供します。ユーザーはトランスポートプロトコルとしてHTTPをオプションで使用することもでき、構造体との間で行をマーシャリングするヘルパー関数を活用できます。


## clickhouse-goクライアント {#the-clickhouse-go-client}

clickhouse-goクライアントは、ClickHouseとの通信用に2つのAPIインターフェースを提供します:

- ClickHouse専用のクライアントAPI
- `database/sql`標準 - Golangが提供するSQLデータベース向けの汎用インターフェース

`database/sql`はデータベースに依存しないインターフェースを提供し、開発者がデータストアを抽象化できるようにしますが、パフォーマンスに影響を与える型付けとクエリセマンティクスが強制されます。このため、[パフォーマンスが重要な場合](https://github.com/clickHouse/clickHouse-go#benchmark)は、クライアント専用のAPIを使用する必要があります。ただし、複数のデータベースをサポートするツールにClickHouseを統合したいユーザーは、標準インターフェースの使用を好む場合があります。

両方のインターフェースは、通信に[ネイティブ形式](/native-protocol/basics.md)とネイティブプロトコルを使用してデータをエンコードします。さらに、標準インターフェースはHTTP経由の通信もサポートしています。

|                    | ネイティブ形式 | ネイティブプロトコル | HTTPプロトコル | 一括書き込みサポート | 構造体マーシャリング | 圧縮 | クエリプレースホルダー |
| :----------------: | :-----------: | :-------------: | :-----------: | :----------------: | :---------------: | :---------: | :----------------: |
|   ClickHouse API   |      ✅       |       ✅        |               |         ✅         |        ✅         |     ✅      |         ✅         |
| `database/sql` API |      ✅       |       ✅        |      ✅       |         ✅         |                   |     ✅      |         ✅         |


## インストール {#installation}

ドライバのv1は非推奨となっており、機能更新や新しいClickHouseタイプのサポートは提供されません。ユーザーはより優れたパフォーマンスを提供するv2への移行を推奨します。

クライアントの2.xバージョンをインストールするには、go.modファイルにパッケージを追加します:

`require github.com/ClickHouse/clickhouse-go/v2 main`

または、リポジトリをクローンします:

```bash
git clone --branch v2 https://github.com/clickhouse/clickhouse-go.git $GOPATH/src/github
```

別のバージョンをインストールする場合は、パスまたはブランチ名を適宜変更してください。

```bash
mkdir my-clickhouse-app && cd my-clickhouse-app

cat > go.mod <<-END
  module my-clickhouse-app

  go 1.18

  require github.com/ClickHouse/clickhouse-go/v2 main
END

cat > main.go <<-END
  package main

  import (
    "fmt"
    "github.com/ClickHouse/clickhouse-go/v2"
  )

  func main() {
   conn, _ := clickhouse.Open(&clickhouse.Options{Addr: []string{"127.0.0.1:9000"}})
    v, _ := conn.ServerVersion()
    fmt.Println(v.String())
  }
END

go mod tidy
go run main.go

```

### バージョン管理と互換性 {#versioning--compatibility}

クライアントはClickHouseとは独立してリリースされます。2.xは現在開発中のメジャーバージョンを表します。2.xのすべてのバージョンは相互に互換性を持つ必要があります。

#### ClickHouseとの互換性 {#clickhouse-compatibility}

クライアントは以下をサポートします:

- [こちら](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md)に記載されている、現在サポートされているすべてのClickHouseバージョン。ClickHouseバージョンのサポートが終了すると、クライアントリリースに対する積極的なテストも行われなくなります。
- クライアントのリリース日から2年以内のすべてのClickHouseバージョン。ただし、LTSバージョンのみが積極的にテストされます。

#### Golangとの互換性 {#golang-compatibility}

|  クライアントバージョン  | Golangバージョン |
| :--------------: | :-------------: |
| => 2.0 &lt;= 2.2 |   1.17, 1.18    |
|      >= 2.3      |      1.18       |


## ClickHouse クライアント API {#clickhouse-client-api}

ClickHouse クライアント API のすべてのコード例は[こちら](https://github.com/ClickHouse/clickhouse-go/tree/main/examples)で確認できます。

### 接続 {#connecting}

以下の例では、サーバーバージョンを返すことで ClickHouse への接続方法を示しています。ClickHouse がセキュリティ保護されておらず、デフォルトユーザーでアクセス可能であることを前提としています。

デフォルトのネイティブポートを使用して接続していることに注意してください。

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
fmt.Println(v)
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/connect.go)

**以降のすべての例では、明示的に示されていない限り、ClickHouse の `conn` 変数が作成され利用可能であることを前提としています。**

#### 接続設定 {#connection-settings}

接続を開く際、Options 構造体を使用してクライアントの動作を制御できます。以下の設定が利用可能です:

- `Protocol` - Native または HTTP のいずれか。HTTP は現在 [database/sql API](#databasesql-api) でのみサポートされています。
- `TLS` - TLS オプション。nil 以外の値を設定すると TLS が有効になります。[TLS の使用](#using-tls)を参照してください。
- `Addr` - ポートを含むアドレスのスライス。
- `Auth` - 認証の詳細。[認証](#authentication)を参照してください。
- `DialContext` - 接続の確立方法を決定するカスタムダイヤル関数。
- `Debug` - デバッグを有効にするための true/false。
- `Debugf` - デバッグ出力を処理する関数を提供します。`debug` が true に設定されている必要があります。
- `Settings` - ClickHouse 設定のマップ。これらはすべての ClickHouse クエリに適用されます。[Context の使用](#using-context)により、クエリごとに設定を指定できます。
- `Compression` - ブロックの圧縮を有効にします。[圧縮](#compression)を参照してください。
- `DialTimeout` - 接続を確立するための最大時間。デフォルトは `1s` です。
- `MaxOpenConns` - 同時に使用できる最大接続数。アイドルプールにはこれより多いまたは少ない接続が存在する可能性がありますが、同時に使用できるのはこの数のみです。デフォルトは `MaxIdleConns+5` です。
- `MaxIdleConns` - プールに維持する接続数。可能な場合、接続は再利用されます。デフォルトは `5` です。
- `ConnMaxLifetime` - 接続を利用可能な状態で保持する最大有効期間。デフォルトは 1 時間です。この時間が経過すると接続は破棄され、必要に応じて新しい接続がプールに追加されます。
- `ConnOpenStrategy` - ノードアドレスのリストをどのように使用して接続を開くかを決定します。[複数ノードへの接続](#connecting-to-multiple-nodes)を参照してください。
- `BlockBufferSize` - 一度にバッファにデコードするブロックの最大数。値を大きくすると、メモリを犠牲にして並列化が向上します。ブロックサイズはクエリに依存するため、接続時に設定することもできますが、返されるデータに基づいてクエリごとにオーバーライドすることを推奨します。デフォルトは `2` です。

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

#### コネクションプーリング {#connection-pooling}


クライアントは接続プールを維持し、必要に応じてクエリ間でこれらを再利用します。同時に使用される接続数は最大で `MaxOpenConns` までであり、プールの最大サイズは `MaxIdleConns` によって制御されます。クライアントは各クエリ実行時にプールから接続を取得し、再利用のためにプールに返却します。接続はバッチの存続期間中使用され、`Send()` 時に解放されます。

ユーザーが `MaxOpenConns=1` を設定しない限り、プール内の同じ接続が後続のクエリで使用される保証はありません。これが必要になることは稀ですが、一時テーブルを使用している場合には必要となる可能性があります。

また、`ConnMaxLifetime` はデフォルトで1時間であることに注意してください。これにより、ノードがクラスタから離脱した場合に、ClickHouseへの負荷が不均衡になる可能性があります。ノードが利用不可能になると、接続は他のノードに分散されます。これらの接続は持続し、問題のあるノードがクラスタに復帰した場合でも、デフォルトでは1時間更新されません。高負荷の場合は、この値を下げることを検討してください。

### TLSの使用 {#using-tls}

低レベルでは、すべてのクライアント接続メソッド（`DSN/OpenDB/Open`）は[ Go tlsパッケージ](https://pkg.go.dev/crypto/tls)を使用してセキュアな接続を確立します。Options構造体に非nilの `tls.Config` ポインタが含まれている場合、クライアントはTLSを使用します。

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

この最小限の `TLS.Config` は、通常、ClickHouseサーバーのセキュアなネイティブポート（通常は9440）への接続に十分です。ClickHouseサーバーが有効な証明書を持っていない場合（期限切れ、誤ったホスト名、公的に認識されたルート認証局によって署名されていない）、`InsecureSkipVerify` をtrueに設定できますが、これは強く非推奨です。

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

追加のTLSパラメータが必要な場合、アプリケーションコードは `tls.Config` 構造体に必要なフィールドを設定する必要があります。これには、特定の暗号スイート、特定のTLSバージョン（1.2や1.3など）の強制、内部CA証明書チェーンの追加、ClickHouseサーバーが要求する場合のクライアント証明書（および秘密鍵）の追加、およびより専門的なセキュリティ設定に伴うその他のオプションのほとんどが含まれます。

### 認証 {#authentication}

接続詳細にAuth構造体を指定して、ユーザー名とパスワードを指定します。

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

### 複数ノードへの接続 {#connecting-to-multiple-nodes}

`Addr` 構造体を介して複数のアドレスを指定できます。


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

2つの接続戦略が利用可能です:

- `ConnOpenInOrder` (デフォルト) - アドレスは順番に使用されます。リストの前方のアドレスでの接続に失敗した場合にのみ、後方のアドレスが利用されます。これは実質的にフェイルオーバー戦略です。
- `ConnOpenRoundRobin` - ラウンドロビン戦略を使用してアドレス間で負荷が分散されます。

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

### 実行 {#execution}

任意のステートメントは `Exec` メソッドを介して実行できます。これはDDLやシンプルなステートメントに有用です。大規模な挿入やクエリの反復処理には使用すべきではありません。

```go
conn.Exec(context.Background(), `DROP TABLE IF EXISTS example`)
err = conn.Exec(context.Background(), `
    CREATE TABLE IF NOT EXISTS example (
        Col1 UInt8,
        Col2 String
    ) engine=Memory
`)
if err != nil {
    return err
}
conn.Exec(context.Background(), "INSERT INTO example VALUES (1, 'test-1')")
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/exec.go)

クエリにContextを渡すことができる点に注意してください。これは特定のクエリレベルの設定を渡すために使用できます - [Contextの使用](#using-context)を参照してください。

### バッチ挿入 {#batch-insert}

大量の行を挿入するために、クライアントはバッチセマンティクスを提供します。これには、行を追加できるバッチの準備が必要です。最終的に `Send()` メソッドを介して送信されます。バッチは `Send` が実行されるまでメモリに保持されます。

接続のリークを防ぐために、バッチに対して `Close` を呼び出すことを推奨します。これはバッチの準備後に `defer` キーワードを使用して行うことができます。これにより、`Send` が呼び出されなかった場合に接続がクリーンアップされます。行が追加されなかった場合、クエリログに0行の挿入が表示されることに注意してください。

```go
conn, err := GetNativeConnection(nil, nil, nil)
if err != nil {
    return err
}
ctx := context.Background()
defer func() {
    conn.Exec(ctx, "DROP TABLE example")
}()
conn.Exec(context.Background(), "DROP TABLE IF EXISTS example")
err = conn.Exec(ctx, `
    CREATE TABLE IF NOT EXISTS example (
            Col1 UInt8
        , Col2 String
        , Col3 FixedString(3)
        , Col4 UUID
        , Col5 Map(String, UInt8)
        , Col6 Array(String)
        , Col7 Tuple(String, UInt8, Array(Map(String, String)))
        , Col8 DateTime
    ) Engine = Memory
`)
if err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

```


for i := 0; i < 1000; i++ {
err := batch.Append(
uint8(42),
"ClickHouse",
"Inc",
uuid.New(),
map[string]uint8{"key": 1}, // Map(String, UInt8)
[]string{"Q", "W", "E", "R", "T", "Y"}, // Array(String)
[]interface{}{ // Tuple(String, UInt8, Array(Map(String, String)))
"String Value", uint8(5), []map[string]string{
{"key": "value"},
{"key": "value"},
{"key": "value"},
},
},
time.Now(),
)
if err != nil {
return err
}
}

return batch.Send()

````

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/batch.go)

ClickHouseの推奨事項は[こちら](/guides/inserting-data#best-practices-for-inserts)を参照してください。バッチはgo-routines間で共有しないでください。ルーチンごとに個別のバッチを構築してください。

上記の例から、行を追加する際に変数の型が列の型と一致する必要があることに注意してください。通常、マッピングは明白ですが、このインターフェースは柔軟性を持たせており、精度の損失が発生しない限り型変換が行われます。例えば、以下はdatetime64型に文字列を挿入する方法を示しています。

```go
batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

for i := 0; i < 1000; i++ {
    err := batch.Append(
        "2006-01-02 15:04:05.999",
    )
    if err != nil {
        return err
    }
}

return batch.Send()
````

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/type_convert.go)

各列型でサポートされているGo型の完全な概要については、[型変換](#type-conversions)を参照してください。

### 行のクエリ {#querying-rows}

ユーザーは`QueryRow`メソッドを使用して単一行をクエリするか、`Query`を介して結果セットを反復処理するためのカーソルを取得できます。前者はデータをシリアライズする宛先を受け入れますが、後者は各行で`Scan`を呼び出す必要があります。

```go
row := conn.QueryRow(context.Background(), "SELECT * FROM example")
var (
    col1             uint8
    col2, col3, col4 string
    col5             map[string]uint8
    col6             []string
    col7             []interface{}
    col8             time.Time
)
if err := row.Scan(&col1, &col2, &col3, &col4, &col5, &col6, &col7, &col8); err != nil {
    return err
}
fmt.Printf("row: col1=%d, col2=%s, col3=%s, col4=%s, col5=%v, col6=%v, col7=%v, col8=%v\n", col1, col2, col3, col4, col5, col6, col7, col8)
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/query_row.go)

```go
rows, err := conn.Query(ctx, "SELECT Col1, Col2, Col3 FROM example WHERE Col1 >= 2")
if err != nil {
    return err
}
for rows.Next() {
    var (
        col1 uint8
        col2 string
        col3 time.Time
    )
    if err := rows.Scan(&col1, &col2, &col3); err != nil {
        return err
    }
    fmt.Printf("row: col1=%d, col2=%s, col3=%s\n", col1, col2, col3)
}
rows.Close()
return rows.Err()
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/query_rows.go)

どちらの場合も、各列の値をシリアライズする変数へのポインタを渡す必要があることに注意してください。これらは`SELECT`文で指定された順序で渡す必要があります。デフォルトでは、上記のように`SELECT *`の場合は列宣言の順序が使用されます。


挿入と同様に、Scanメソッドでは対象変数が適切な型である必要があります。精度の損失が発生しない限り、可能な場合は型が変換されるため、柔軟性を持たせています。例えば、上記の例ではUUID列が文字列変数に読み込まれています。各Column型でサポートされているGo型の完全なリストについては、[型変換](#type-conversions)を参照してください。

最後に、`Query`および`QueryRow`メソッドに`Context`を渡すことができる点に注意してください。これはクエリレベルの設定に使用できます。詳細については[Contextの使用](#using-context)を参照してください。

### 非同期挿入 {#async-insert}

非同期挿入はAsyncメソッドを通じてサポートされています。これにより、クライアントがサーバーの挿入完了を待つか、データが受信された時点で応答するかを指定できます。これは実質的にパラメータ[wait_for_async_insert](/operations/settings/settings#wait_for_async_insert)を制御します。

```go
conn, err := GetNativeConnection(nil, nil, nil)
if err != nil {
    return err
}
ctx := context.Background()
if err := clickhouse_tests.CheckMinServerServerVersion(conn, 21, 12, 0); err != nil {
    return nil
}
defer func() {
    conn.Exec(ctx, "DROP TABLE example")
}()
conn.Exec(ctx, `DROP TABLE IF EXISTS example`)
const ddl = `
    CREATE TABLE example (
            Col1 UInt64
        , Col2 String
        , Col3 Array(UInt8)
        , Col4 DateTime
    ) ENGINE = Memory
`
if err := conn.Exec(ctx, ddl); err != nil {
    return err
}
for i := 0; i < 100; i++ {
    if err := conn.AsyncInsert(ctx, fmt.Sprintf(`INSERT INTO example VALUES (
        %d, '%s', [1, 2, 3, 4, 5, 6, 7, 8, 9], now()
    )`, i, "Golang SQLデータベースドライバ"), false); err != nil {
        return err
    }
}
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/async.go)

### カラム形式の挿入 {#columnar-insert}

挿入はカラム形式で実行できます。データが既にこの構造で配置されている場合、行への変換が不要になるため、パフォーマンス上の利点が得られます。

```go
batch, err := conn.PrepareBatch(context.Background(), "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

var (
    col1 []uint64
    col2 []string
    col3 [][]uint8
    col4 []time.Time
)
for i := 0; i < 1_000; i++ {
    col1 = append(col1, uint64(i))
    col2 = append(col2, "Golang SQLデータベースドライバ")
    col3 = append(col3, []uint8{1, 2, 3, 4, 5, 6, 7, 8, 9})
    col4 = append(col4, time.Now())
}
if err := batch.Column(0).Append(col1); err != nil {
    return err
}
if err := batch.Column(1).Append(col2); err != nil {
    return err
}
if err := batch.Column(2).Append(col3); err != nil {
    return err
}
if err := batch.Column(3).Append(col4); err != nil {
    return err
}

return batch.Send()
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/columnar_insert.go)

### 構造体の使用 {#using-structs}

Golang構造体は、ClickHouseのデータ行の論理的な表現を提供します。これを支援するため、ネイティブインターフェースはいくつかの便利な関数を提供しています。

#### シリアライズを伴うSelect {#select-with-serialize}

Selectメソッドは、単一の呼び出しで応答行のセットを構造体のスライスにマーシャリングすることができます。

```go
var result []struct {
    Col1           uint8
    Col2           string
    ColumnWithName time.Time `ch:"Col3"`
}

if err = conn.Select(ctx, &result, "SELECT Col1, Col2, Col3 FROM example"); err != nil {
    return err
}

for _, v := range result {
    fmt.Printf("row: col1=%d, col2=%s, col3=%s\n", v.Col1, v.Col2, v.ColumnWithName)
}
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/select_struct.go)

#### 構造体のスキャン {#scan-struct}


`ScanStruct`は、クエリから取得した単一行を構造体にマーシャリングできます。

```go
var result struct {
    Col1  int64
    Count uint64 `ch:"count"`
}
if err := conn.QueryRow(context.Background(), "SELECT Col1, COUNT() AS count FROM example WHERE Col1 = 5 GROUP BY Col1").ScanStruct(&result); err != nil {
    return err
}
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/scan_struct.go)

#### 構造体の追加 {#append-struct}

`AppendStruct`は、既存の[バッチ](#batch-insert)に構造体を追加し、完全な行として解釈できます。これには、構造体のカラムが名前と型の両方でテーブルと一致している必要があります。すべてのカラムに対応する構造体フィールドが必要ですが、一部の構造体フィールドには対応するカラム表現がない場合があります。これらは単に無視されます。

```go
batch, err := conn.PrepareBatch(context.Background(), "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

for i := 0; i < 1_000; i++ {
    err := batch.AppendStruct(&row{
        Col1:       uint64(i),
        Col2:       "Golang SQL database driver",
        Col3:       []uint8{1, 2, 3, 4, 5, 6, 7, 8, 9},
        Col4:       time.Now(),
        ColIgnored: "this will be ignored",
    })
    if err != nil {
        return err
    }
}
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/append_struct.go)

### 型変換 {#type-conversions}

クライアントは、挿入とレスポンスのマーシャリングの両方において、可能な限り柔軟に変数型を受け入れることを目指しています。ほとんどの場合、ClickHouseのカラム型に対応するGolang型が存在します。例えば、[UInt64](/sql-reference/data-types/int-uint/)に対する[uint64](https://pkg.go.dev/builtin#uint64)などです。これらの論理的なマッピングは常にサポートされます。ユーザーは、変数または受信データの変換が事前に行われる場合、カラムに挿入可能な変数型や、レスポンスを受け取るために使用できる変数型を利用したい場合があります。クライアントは、これらの変換を透過的にサポートすることを目指しており、ユーザーは挿入前にデータを正確に整合させるために変換する必要がなく、クエリ時に柔軟なマーシャリングを提供します。この透過的な変換では精度の損失は許可されません。例えば、uint32はUInt64カラムからデータを受け取るために使用できません。逆に、文字列は形式要件を満たしていればdatetime64フィールドに挿入できます。

プリミティブ型に対して現在サポートされている型変換は[こちら](https://github.com/ClickHouse/clickhouse-go/blob/main/TYPES.md)に記載されています。

この取り組みは継続中であり、挿入(`Append`/`AppendRow`)と読み取り時(`Scan`経由)に分けることができます。特定の変換のサポートが必要な場合は、issueを作成してください。

### 複合型 {#complex-types}

#### Date/DateTime型 {#datedatetime-types}

ClickHouse goクライアントは、`Date`、`Date32`、`DateTime`、および`DateTime64`の日付/日時型をサポートしています。日付は`2006-01-02`形式の文字列として、またはネイティブのgo `time.Time{}`または`sql.NullTime`を使用して挿入できます。DateTimeも後者の型をサポートしていますが、文字列は`2006-01-02 15:04:05`形式で渡す必要があり、オプションでタイムゾーンオフセット(例:`2006-01-02 15:04:05 +08:00`)を含めることができます。`time.Time{}`と`sql.NullTime`は、読み取り時にサポートされており、`sql.Scanner`インターフェースの任意の実装もサポートされています。

タイムゾーン情報の処理は、ClickHouse型と値が挿入されるか読み取られるかによって異なります:


- **DateTime/DateTime64**
  - **挿入**時、値はUNIXタイムスタンプ形式でClickHouseに送信されます。タイムゾーンが指定されていない場合、クライアントはクライアントのローカルタイムゾーンを想定します。`time.Time{}`または`sql.NullTime`は、それに応じてエポックに変換されます。
  - **選択**時、`time.Time`値を返す際に、カラムのタイムゾーンが設定されている場合はそれが使用されます。設定されていない場合は、サーバーのタイムゾーンが使用されます。
- **Date/Date32**
  - **挿入**時、日付をUNIXタイムスタンプに変換する際に、日付のタイムゾーンが考慮されます。つまり、ClickHouseのDate型にはロケール情報がないため、日付として保存される前にタイムゾーンによってオフセットされます。文字列値でこれが指定されていない場合は、ローカルタイムゾーンが使用されます。
  - **選択**時、日付は`time.Time{}`または`sql.NullTime{}`インスタンスにスキャンされ、タイムゾーン情報なしで返されます。

#### 配列 {#array}

配列はスライスとして挿入する必要があります。要素の型ルールは[プリミティブ型](#type-conversions)のルールと一致しており、可能な場合は要素が変換されます。

Scan時にはスライスへのポインタを提供する必要があります。

```go
batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

var i int64
for i = 0; i < 10; i++ {
    err := batch.Append(
        []string{strconv.Itoa(int(i)), strconv.Itoa(int(i + 1)), strconv.Itoa(int(i + 2)), strconv.Itoa(int(i + 3))},
        [][]int64{{i, i + 1}, {i + 2, i + 3}, {i + 4, i + 5}},
    )
    if err != nil {
        return err
    }
}
if err := batch.Send(); err != nil {
    return err
}
var (
    col1 []string
    col2 [][]int64
)
rows, err := conn.Query(ctx, "SELECT * FROM example")
if err != nil {
    return err
}
for rows.Next() {
    if err := rows.Scan(&col1, &col2); err != nil {
        return err
    }
    fmt.Printf("row: col1=%v, col2=%v\n", col1, col2)
}
rows.Close()
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/array.go)

#### マップ {#map}

マップは、[前述](#type-conversions)で定義された型ルールに準拠したキーと値を持つGolangマップとして挿入する必要があります。

```go
batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

var i int64
for i = 0; i < 10; i++ {
    err := batch.Append(
        map[string]uint64{strconv.Itoa(int(i)): uint64(i)},
        map[string][]string{strconv.Itoa(int(i)): {strconv.Itoa(int(i)), strconv.Itoa(int(i + 1)), strconv.Itoa(int(i + 2)), strconv.Itoa(int(i + 3))}},
        map[string]map[string]uint64{strconv.Itoa(int(i)): {strconv.Itoa(int(i)): uint64(i)}},
    )
    if err != nil {
        return err
    }
}
if err := batch.Send(); err != nil {
    return err
}
var (
    col1 map[string]uint64
    col2 map[string][]string
    col3 map[string]map[string]uint64
)
rows, err := conn.Query(ctx, "SELECT * FROM example")
if err != nil {
    return err
}
for rows.Next() {
    if err := rows.Scan(&col1, &col2, &col3); err != nil {
        return err
    }
    fmt.Printf("row: col1=%v, col2=%v, col3=%v\n", col1, col2, col3)
}
rows.Close()
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/map.go)

#### タプル {#tuples}

タプルは任意の長さのカラムのグループを表します。カラムは明示的に名前を付けることも、型のみを指定することもできます。例:

```sql
//名前なし
Col1 Tuple(String, Int64)

//名前付き
Col2 Tuple(name String, id Int64, age uint8)
```

これらのアプローチのうち、名前付きタプルはより高い柔軟性を提供します。名前なしタプルはスライスを使用して挿入および読み取りを行う必要がありますが、名前付きタプルはマップとも互換性があります。


```go
if err = conn.Exec(ctx, `
    CREATE TABLE example (
            Col1 Tuple(name String, age UInt8),
            Col2 Tuple(String, UInt8),
            Col3 Tuple(name String, id String)
        )
        Engine Memory
    `); err != nil {
    return err
}

defer func() {
    conn.Exec(ctx, "DROP TABLE example")
}()
batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

// 名前付きと名前なしの両方をスライスで追加できます。すべての要素が同じ型の場合、強く型付けされたリストとマップを使用できます
if err = batch.Append([]interface{}{"Clicky McClickHouse", uint8(42)}, []interface{}{"Clicky McClickHouse Snr", uint8(78)}, []string{"Dale", "521211"}); err != nil {
    return err
}
if err = batch.Append(map[string]interface{}{"name": "Clicky McClickHouse Jnr", "age": uint8(20)}, []interface{}{"Baby Clicky McClickHouse", uint8(1)}, map[string]string{"name": "Geoff", "id": "12123"}); err != nil {
    return err
}
if err = batch.Send(); err != nil {
    return err
}
var (
    col1 map[string]interface{}
    col2 []interface{}
    col3 map[string]string
)
// 名前付きタプルはマップまたはスライスに取得でき、名前なしタプルはスライスのみに取得できます
if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2, &col3); err != nil {
    return err
}
fmt.Printf("row: col1=%v, col2=%v, col3=%v\n", col1, col2, col3)
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/tuple.go)

注: 型付きスライスとマップがサポートされていますが、名前付きタプル内のサブカラムがすべて同じ型である必要があります。

#### Nested {#nested}

Nestedフィールドは名前付きタプルの配列と同等です。使用方法は、ユーザーが[flatten_nested](/operations/settings/settings#flatten_nested)を1または0に設定しているかによって異なります。

flatten_nestedを0に設定すると、Nestedカラムは単一のタプル配列として保持されます。これにより、ユーザーは挿入と取得にマップのスライスを使用でき、任意のレベルのネストが可能になります。以下の例に示すように、マップのキーはカラム名と一致する必要があります。

注: マップはタプルを表すため、`map[string]interface{}`型である必要があります。現在、値は強く型付けされていません。

```go
conn, err := GetNativeConnection(clickhouse.Settings{
    "flatten_nested": 0,
}, nil, nil)
if err != nil {
    return err
}
ctx := context.Background()
defer func() {
    conn.Exec(ctx, "DROP TABLE example")
}()
conn.Exec(context.Background(), "DROP TABLE IF EXISTS example")
err = conn.Exec(ctx, `
    CREATE TABLE example (
        Col1 Nested(Col1_1 String, Col1_2 UInt8),
        Col2 Nested(
            Col2_1 UInt8,
            Col2_2 Nested(
                Col2_2_1 UInt8,
                Col2_2_2 UInt8
            )
        )
    ) Engine Memory
`)
if err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

```


var i int64
for i = 0; i < 10; i++ {
err := batch.Append(
[]map[string]interface{}{
{
"Col1_1": strconv.Itoa(int(i)),
"Col1_2": uint8(i),
},
{
"Col1_1": strconv.Itoa(int(i + 1)),
"Col1_2": uint8(i + 1),
},
{
"Col1_1": strconv.Itoa(int(i + 2)),
"Col1_2": uint8(i + 2),
},
},
[]map[string]interface{}{
{
"Col2_2": []map[string]interface{}{
{
"Col2_2_1": uint8(i),
"Col2_2_2": uint8(i + 1),
},
},
"Col2_1": uint8(i),
},
{
"Col2_2": []map[string]interface{}{
{
"Col2_2_1": uint8(i + 2),
"Col2_2_2": uint8(i + 3),
},
},
"Col2_1": uint8(i + 1),
},
},
)
if err != nil {
return err
}
}
if err := batch.Send(); err != nil {
return err
}
var (
col1 []map[string]interface{}
col2 []map[string]interface{}
)
rows, err := conn.Query(ctx, "SELECT \* FROM example")
if err != nil {
return err
}
for rows.Next() {
if err := rows.Scan(&col1, &col2); err != nil {
return err
}
fmt.Printf("row: col1=%v, col2=%v\n", col1, col2)
}
rows.Close()

````

[完全な例 - `flatten_nested=0`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L28-L118)

`flatten_nested` のデフォルト値である 1 を使用すると、ネストされたカラムは個別の配列にフラット化されます。これには、挿入と取得にネストされたスライスを使用する必要があります。任意のレベルのネストが動作する可能性はありますが、公式にはサポートされていません。

```go
conn, err := GetNativeConnection(nil, nil, nil)
if err != nil {
    return err
}
ctx := context.Background()
defer func() {
    conn.Exec(ctx, "DROP TABLE example")
}()
conn.Exec(ctx, "DROP TABLE IF EXISTS example")
err = conn.Exec(ctx, `
    CREATE TABLE example (
        Col1 Nested(Col1_1 String, Col1_2 UInt8),
        Col2 Nested(
            Col2_1 UInt8,
            Col2_2 Nested(
                Col2_2_1 UInt8,
                Col2_2_2 UInt8
            )
        )
    ) Engine Memory
`)
if err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

var i uint8
for i = 0; i < 10; i++ {
    col1_1_data := []string{strconv.Itoa(int(i)), strconv.Itoa(int(i + 1)), strconv.Itoa(int(i + 2))}
    col1_2_data := []uint8{i, i + 1, i + 2}
    col2_1_data := []uint8{i, i + 1, i + 2}
    col2_2_data := [][][]interface{}{
        {
            {i, i + 1},
        },
        {
            {i + 2, i + 3},
        },
        {
            {i + 4, i + 5},
        },
    }
    err := batch.Append(
        col1_1_data,
        col1_2_data,
        col2_1_data,
        col2_2_data,
    )
    if err != nil {
        return err
    }
}
if err := batch.Send(); err != nil {
    return err
}
````

[完全な例 - `flatten_nested=1`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L123-L180)

注意: ネストされたカラムは同じ次元を持つ必要があります。例えば、上記の例では、`Col_2_2` と `Col_2_1` は同じ数の要素を持つ必要があります。

より直感的なインターフェースとネストの公式サポートにより、`flatten_nested=0` を推奨します。

#### Geo 型 {#geo-types}


クライアントは地理型のPoint、Ring、Polygon、およびMulti Polygonをサポートしています。これらのフィールドは、Golangで[github.com/paulmach/orb](https://github.com/paulmach/orb)パッケージを使用して扱われます。

```go
if err = conn.Exec(ctx, `
    CREATE TABLE example (
            point Point,
            ring Ring,
            polygon Polygon,
            mPolygon MultiPolygon
        )
        Engine Memory
    `); err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

if err = batch.Append(
    orb.Point{11, 22},
    orb.Ring{
        orb.Point{1, 2},
        orb.Point{1, 2},
    },
    orb.Polygon{
        orb.Ring{
            orb.Point{1, 2},
            orb.Point{12, 2},
        },
        orb.Ring{
            orb.Point{11, 2},
            orb.Point{1, 12},
        },
    },
    orb.MultiPolygon{
        orb.Polygon{
            orb.Ring{
                orb.Point{1, 2},
                orb.Point{12, 2},
            },
            orb.Ring{
                orb.Point{11, 2},
                orb.Point{1, 12},
            },
        },
        orb.Polygon{
            orb.Ring{
                orb.Point{1, 2},
                orb.Point{12, 2},
            },
            orb.Ring{
                orb.Point{11, 2},
                orb.Point{1, 12},
            },
        },
    },
); err != nil {
    return err
}

if err = batch.Send(); err != nil {
    return err
}

var (
    point    orb.Point
    ring     orb.Ring
    polygon  orb.Polygon
    mPolygon orb.MultiPolygon
)

if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&point, &ring, &polygon, &mPolygon); err != nil {
    return err
}
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/geo.go)

#### UUID {#uuid}

UUID型は[github.com/google/uuid](https://github.com/google/uuid)パッケージでサポートされています。ユーザーはUUIDを文字列として、または`sql.Scanner`や`Stringify`を実装する任意の型として送信およびマーシャルすることもできます。

```go
if err = conn.Exec(ctx, `
    CREATE TABLE example (
            col1 UUID,
            col2 UUID
        )
        Engine Memory
    `); err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

col1Data, _ := uuid.NewUUID()
if err = batch.Append(
    col1Data,
    "603966d6-ed93-11ec-8ea0-0242ac120002",
); err != nil {
    return err
}

if err = batch.Send(); err != nil {
    return err
}

var (
    col1 uuid.UUID
    col2 uuid.UUID
)

if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2); err != nil {
    return err
}
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/uuid.go)

#### Decimal {#decimal}

Decimal型は[github.com/shopspring/decimal](https://github.com/shopspring/decimal)パッケージでサポートされています。

```go
if err = conn.Exec(ctx, `
    CREATE TABLE example (
        Col1 Decimal32(3),
        Col2 Decimal(18,6),
        Col3 Decimal(15,7),
        Col4 Decimal128(8),
        Col5 Decimal256(9)
    ) Engine Memory
    `); err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

if err = batch.Append(
    decimal.New(25, 4),
    decimal.New(30, 5),
    decimal.New(35, 6),
    decimal.New(135, 7),
    decimal.New(256, 8),
); err != nil {
    return err
}

if err = batch.Send(); err != nil {
    return err
}

var (
    col1 decimal.Decimal
    col2 decimal.Decimal
    col3 decimal.Decimal
    col4 decimal.Decimal
    col5 decimal.Decimal
)

```


if err = conn.QueryRow(ctx, "SELECT \* FROM example").Scan(&col1, &col2, &col3, &col4, &col5); err != nil {
return err
}
fmt.Printf("col1=%v, col2=%v, col3=%v, col4=%v, col5=%v\n", col1, col2, col3, col4, col5)

````

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/decimal.go)

#### Nullable {#nullable}

GoのNil値はClickHouseのNULLを表します。これはフィールドがNullableとして宣言されている場合に使用できます。挿入時には、通常のカラムとNullableカラムの両方に対してNilを渡すことができます。通常のカラムの場合、型のデフォルト値が永続化されます(例:String型の場合は空文字列)。Nullableカラムの場合、NULL値がClickHouseに格納されます。

スキャン時には、Nullableフィールドのnil値を表現するために、nilをサポートする型へのポインタ(例:`*string`)を渡す必要があります。以下の例では、Nullable(String)であるcol1は`**string`を受け取ります。これによりnilを表現できます。

```go
if err = conn.Exec(ctx, `
    CREATE TABLE example (
            col1 Nullable(String),
            col2 String,
            col3 Nullable(Int8),
            col4 Nullable(Int64)
        )
        Engine Memory
    `); err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

if err = batch.Append(
    nil,
    nil,
    nil,
    sql.NullInt64{Int64: 0, Valid: false},
); err != nil {
    return err
}

if err = batch.Send(); err != nil {
    return err
}

var (
    col1 *string
    col2 string
    col3 *int8
    col4 sql.NullInt64
)

if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2, &col3, &col4); err != nil {
    return err
}
````

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nullable.go)

クライアントは`sql.Null*`型(例:`sql.NullInt64`)もサポートしています。これらは対応するClickHouse型と互換性があります。

#### 大きな整数型 - Int128、Int256、UInt128、UInt256 {#big-ints---int128-int256-uint128-uint256}

64ビットより大きい数値型は、Goネイティブの[big](https://pkg.go.dev/math/big)パッケージを使用して表現されます。

```go
if err = conn.Exec(ctx, `
    CREATE TABLE example (
        Col1 Int128,
        Col2 UInt128,
        Col3 Array(Int128),
        Col4 Int256,
        Col5 Array(Int256),
        Col6 UInt256,
        Col7 Array(UInt256)
    ) Engine Memory`); err != nil {
    return err
}

batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

col1Data, _ := new(big.Int).SetString("170141183460469231731687303715884105727", 10)
col2Data := big.NewInt(128)
col3Data := []*big.Int{
    big.NewInt(-128),
    big.NewInt(128128),
    big.NewInt(128128128),
}
col4Data := big.NewInt(256)
col5Data := []*big.Int{
    big.NewInt(256),
    big.NewInt(256256),
    big.NewInt(256256256256),
}
col6Data := big.NewInt(256)
col7Data := []*big.Int{
    big.NewInt(256),
    big.NewInt(256256),
    big.NewInt(256256256256),
}

if err = batch.Append(col1Data, col2Data, col3Data, col4Data, col5Data, col6Data, col7Data); err != nil {
    return err
}

if err = batch.Send(); err != nil {
    return err
}

var (
    col1 big.Int
    col2 big.Int
    col3 []*big.Int
    col4 big.Int
    col5 []*big.Int
    col6 big.Int
    col7 []*big.Int
)

```


if err = conn.QueryRow(ctx, "SELECT \* FROM example").Scan(&col1, &col2, &col3, &col4, &col5, &col6, &col7); err != nil {
return err
}
fmt.Printf("col1=%v, col2=%v, col3=%v, col4=%v, col5=%v, col6=%v, col7=%v\n", col1, col2, col3, col4, col5, col6, col7)

````

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/big_int.go)

### 圧縮 {#compression}

圧縮方式のサポートは、使用する基盤プロトコルに依存します。ネイティブプロトコルの場合、クライアントは`LZ4`および`ZSTD`圧縮をサポートします。圧縮はブロックレベルでのみ実行されます。圧縮を有効にするには、接続に`Compression`設定を含めます。

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
````

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/compression.go)

HTTP経由で標準インターフェースを使用する場合、追加の圧縮技術が利用可能です。詳細については、[database/sql API - 圧縮](#compression)を参照してください。

### パラメータバインディング {#parameter-binding}

クライアントは、`Exec`、`Query`、および`QueryRow`メソッドに対するパラメータバインディングをサポートしています。以下の例に示すように、名前付き、番号付き、および位置指定パラメータを使用できます。以下にこれらの例を示します。

```go
var count uint64
// 位置指定バインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 >= ? AND Col3 < ?", 500, now.Add(time.Duration(750)*time.Second)).Scan(&count); err != nil {
    return err
}
// 250
fmt.Printf("位置指定バインドのカウント: %d\n", count)
// 番号バインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= $2 AND Col3 > $1", now.Add(time.Duration(150)*time.Second), 250).Scan(&count); err != nil {
    return err
}
// 100
fmt.Printf("番号バインドのカウント: %d\n", count)
// 名前付きバインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= @col1 AND Col3 > @col3", clickhouse.Named("col1", 100), clickhouse.Named("col3", now.Add(time.Duration(50)*time.Second))).Scan(&count); err != nil {
    return err
}
// 50
fmt.Printf("名前付きバインドのカウント: %d\n", count)
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind.go)

#### 特殊なケース {#special-cases}

デフォルトでは、スライスがクエリのパラメータとして渡された場合、カンマ区切りの値リストに展開されます。`[ ]`で囲まれた値のセットを挿入する必要がある場合は、`ArraySet`を使用してください。

グループやタプルが必要で、例えばIN演算子で使用するために`( )`で囲む必要がある場合、`GroupSet`を使用できます。これは、以下の例に示すように、複数のグループが必要な場合に特に有用です。

最後に、DateTime64フィールドは、パラメータが適切にレンダリングされるように精度が必要です。ただし、フィールドの精度レベルはクライアントには不明であるため、ユーザーが提供する必要があります。これを容易にするために、`DateNamed`パラメータを提供しています。


```go
var count uint64
// 配列は展開されます
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN (?)", []int{100, 200, 300, 400, 500}).Scan(&count); err != nil {
    return err
}
fmt.Printf("配列展開後の件数: %d\n", count)
// 配列は [] で保持されます
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col4 = ?", clickhouse.ArraySet{300, 301}).Scan(&count); err != nil {
    return err
}
fmt.Printf("配列の件数: %d\n", count)
// グループセットを使用すると ( ) リストを形成できます
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN ?", clickhouse.GroupSet{[]interface{}{100, 200, 300, 400, 500}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("グループの件数: %d\n", count)
// ネストが必要な場合により便利です
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE (Col1, Col5) IN (?)", []clickhouse.GroupSet{{[]interface{}{100, 101}}, {[]interface{}{200, 201}}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("グループの件数: %d\n", count)
// 時刻の精度が必要な場合は DateNamed を使用してください
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col3 >= @col3", clickhouse.DateNamed("col3", now.Add(time.Duration(500)*time.Millisecond), clickhouse.NanoSeconds)).Scan(&count); err != nil {
    return err
}
fmt.Printf("NamedDate の件数: %d\n", count)
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind_special.go)

### コンテキストの使用 {#using-context}

Go のコンテキストは、API 境界を越えてデッドライン、キャンセルシグナル、その他のリクエストスコープの値を渡す手段を提供します。接続のすべてのメソッドは、最初の引数としてコンテキストを受け取ります。これまでの例では context.Background() を使用していましたが、この機能を使用して設定やデッドラインを渡したり、クエリをキャンセルしたりできます。

`withDeadline` で作成されたコンテキストを渡すことで、クエリに実行時間制限を設定できます。これは絶対時刻であり、期限切れになると接続が解放され、ClickHouse にキャンセルシグナルが送信されるだけであることに注意してください。また、`WithCancel` を使用してクエリを明示的にキャンセルすることもできます。

ヘルパー関数 `clickhouse.WithQueryID` と `clickhouse.WithQuotaKey` を使用すると、クエリ ID とクォータキーを指定できます。クエリ ID は、ログでクエリを追跡したり、キャンセル目的で使用したりする際に便利です。クォータキーは、一意のキー値に基づいて ClickHouse の使用量に制限を課すために使用できます。詳細については、[クォータ管理](/operations/access-rights#quotas-management)を参照してください。

また、[接続設定](#connection-settings)で示されているように、コンテキストを使用して、設定が接続全体ではなく特定のクエリにのみ適用されるようにすることもできます。

最後に、`clickhouse.WithBlockSize` を介してブロックバッファのサイズを制御できます。これは接続レベルの設定 `BlockBufferSize` を上書きし、任意の時点でデコードされメモリに保持されるブロックの最大数を制御します。値を大きくすると、メモリを犠牲にしてより多くの並列化が可能になります。

上記の例を以下に示します。

```go
dialCount := 0
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
})
if err != nil {
    return err
}
if err := clickhouse_tests.CheckMinServerServerVersion(conn, 22, 6, 1); err != nil {
    return nil
}
// コンテキストを使用して特定の API 呼び出しに設定を渡すことができます
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "allow_experimental_object_type": "1",
}))

conn.Exec(ctx, "DROP TABLE IF EXISTS example")

// JSON カラムを作成するには allow_experimental_object_type=1 が必要です
if err = conn.Exec(ctx, `
    CREATE TABLE example (
            Col1 JSON
        )
        Engine Memory
    `); err != nil {
    return err
}

```


// コンテキストを使用してクエリをキャンセルできます
ctx, cancel := context.WithCancel(context.Background())
go func() {
cancel()
}()
if err = conn.QueryRow(ctx, "SELECT sleep(3)").Scan(); err == nil {
return fmt.Errorf("expected cancel")
}

// クエリに期限を設定します - 絶対時刻に達するとクエリがキャンセルされます。
// ClickHouse内ではクエリは完了まで継続されます
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.Ping(ctx); err == nil {
return fmt.Errorf("expected deadline exceeeded")
}

// ログ内でクエリをトレースするためにクエリIDを設定します(例: system.query*logを参照)
var one uint8
queryId, * := uuid.NewUUID()
ctx = clickhouse.Context(context.Background(), clickhouse.WithQueryID(queryId.String()))
if err = conn.QueryRow(ctx, "SELECT 1").Scan(&one); err != nil {
return err
}

conn.Exec(context.Background(), "DROP QUOTA IF EXISTS foobar")
defer func() {
conn.Exec(context.Background(), "DROP QUOTA IF EXISTS foobar")
}()
ctx = clickhouse.Context(context.Background(), clickhouse.WithQuotaKey("abcde"))
// クォータキーを設定します - まずクォータを作成します
if err = conn.Exec(ctx, "CREATE QUOTA IF NOT EXISTS foobar KEYED BY client_key FOR INTERVAL 1 minute MAX queries = 5 TO default"); err != nil {
return err
}

type Number struct {
Number uint64 `ch:"number"`
}
for i := 1; i <= 6; i++ {
var result []Number
if err = conn.Select(ctx, &result, "SELECT number FROM numbers(10)"); err != nil {
return err
}
}

````

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/context.go)

### 進行状況/プロファイル/ログ情報 {#progressprofilelog-information}

クエリに対して進行状況、プロファイル、ログ情報をリクエストできます。進行状況情報は、ClickHouseで読み取られ処理された行数とバイト数の統計を報告します。プロファイル情報は、クライアントに返されたデータの要約を提供し、バイト数(非圧縮)、行数、ブロック数の合計を含みます。ログ情報は、スレッドに関する統計(メモリ使用量やデータ速度など)を提供します。

この情報を取得するには、[コンテキスト](#using-context)を使用し、コールバック関数を渡す必要があります。

```go
totalRows := uint64(0)
// コンテキストを使用して進行状況とプロファイル情報のコールバックを渡します
ctx := clickhouse.Context(context.Background(), clickhouse.WithProgress(func(p *clickhouse.Progress) {
    fmt.Println("progress: ", p)
    totalRows += p.Rows
}), clickhouse.WithProfileInfo(func(p *clickhouse.ProfileInfo) {
    fmt.Println("profile info: ", p)
}), clickhouse.WithLogs(func(log *clickhouse.Log) {
    fmt.Println("log info: ", log)
}))

rows, err := conn.Query(ctx, "SELECT number from numbers(1000000) LIMIT 1000000")
if err != nil {
    return err
}
for rows.Next() {
}

fmt.Printf("Total Rows: %d\n", totalRows)
rows.Close()
````

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/progress.go)

### 動的スキャン {#dynamic-scanning}

返されるフィールドのスキーマや型が不明なテーブルを読み取る必要がある場合があります。これは、アドホックなデータ分析を実行する場合や汎用ツールを作成する場合によく見られます。これを実現するために、クエリレスポンスでカラム型情報が利用可能です。これをGoのリフレクションと組み合わせて使用することで、正しく型付けされた変数のランタイムインスタンスを作成し、Scanに渡すことができます。

```go
const query = `
SELECT
        1     AS Col1
    , 'Text' AS Col2
`
rows, err := conn.Query(context.Background(), query)
if err != nil {
    return err
}
var (
    columnTypes = rows.ColumnTypes()
    vars        = make([]interface{}, len(columnTypes))
)
for i := range columnTypes {
    vars[i] = reflect.New(columnTypes[i].ScanType()).Interface()
}
for rows.Next() {
    if err := rows.Scan(vars...); err != nil {
        return err
    }
    for _, v := range vars {
        switch v := v.(type) {
        case *string:
            fmt.Println(*v)
        case *uint8:
            fmt.Println(*v)
        }
    }
}
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/dynamic_scan_types.go)

### 外部テーブル {#external-tables}


[外部テーブル](/engines/table-engines/special/external-data/)を使用すると、クライアントはSELECTクエリと共にClickHouseにデータを送信できます。このデータは一時テーブルに格納され、クエリ内で評価に使用できます。

クエリと共に外部データをサーバーに送信するには、`ext.NewTable`を使用して外部テーブルを構築し、それをコンテキスト経由で渡す必要があります。

```go
table1, err := ext.NewTable("external_table_1",
    ext.Column("col1", "UInt8"),
    ext.Column("col2", "String"),
    ext.Column("col3", "DateTime"),
)
if err != nil {
    return err
}

for i := 0; i < 10; i++ {
    if err = table1.Append(uint8(i), fmt.Sprintf("value_%d", i), time.Now()); err != nil {
        return err
    }
}

table2, err := ext.NewTable("external_table_2",
    ext.Column("col1", "UInt8"),
    ext.Column("col2", "String"),
    ext.Column("col3", "DateTime"),
)

for i := 0; i < 10; i++ {
    table2.Append(uint8(i), fmt.Sprintf("value_%d", i), time.Now())
}
ctx := clickhouse.Context(context.Background(),
    clickhouse.WithExternalTable(table1, table2),
)
rows, err := conn.Query(ctx, "SELECT * FROM external_table_1")
if err != nil {
    return err
}
for rows.Next() {
    var (
        col1 uint8
        col2 string
        col3 time.Time
    )
    rows.Scan(&col1, &col2, &col3)
    fmt.Printf("col1=%d, col2=%s, col3=%v\n", col1, col2, col3)
}
rows.Close()

var count uint64
if err := conn.QueryRow(ctx, "SELECT COUNT(*) FROM external_table_1").Scan(&count); err != nil {
    return err
}
fmt.Printf("external_table_1: %d\n", count)
if err := conn.QueryRow(ctx, "SELECT COUNT(*) FROM external_table_2").Scan(&count); err != nil {
    return err
}
fmt.Printf("external_table_2: %d\n", count)
if err := conn.QueryRow(ctx, "SELECT COUNT(*) FROM (SELECT * FROM external_table_1 UNION ALL SELECT * FROM external_table_2)").Scan(&count); err != nil {
    return err
}
fmt.Printf("external_table_1 UNION external_table_2: %d\n", count)
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/external_data.go)

### Open telemetry {#open-telemetry}

ClickHouseでは、ネイティブプロトコルの一部として[トレースコンテキスト](/operations/opentelemetry/)を渡すことができます。クライアントは`clickhouse.withSpan`関数を使用してSpanを作成し、Contextを介して渡すことでこれを実現できます。

```go
var count uint64
rows := conn.QueryRow(clickhouse.Context(context.Background(), clickhouse.WithSpan(
    trace.NewSpanContext(trace.SpanContextConfig{
        SpanID:  trace.SpanID{1, 2, 3, 4, 5},
        TraceID: trace.TraceID{5, 4, 3, 2, 1},
    }),
)), "SELECT COUNT() FROM (SELECT number FROM system.numbers LIMIT 5)")
if err := rows.Scan(&count); err != nil {
    return err
}
fmt.Printf("count: %d\n", count)
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/open_telemetry.go)

トレーシングの活用に関する詳細は、[OpenTelemetryサポート](/operations/opentelemetry/)を参照してください。


## Database/SQL API {#databasesql-api}

`database/sql`または「標準」APIを使用すると、標準インターフェースに準拠することで、アプリケーションコードが基盤となるデータベースに依存しないシナリオでクライアントを使用できます。これには、追加の抽象化レイヤーや間接参照、ClickHouseと必ずしも整合しないプリミティブなどのコストが伴います。ただし、これらのコストは、ツールが複数のデータベースに接続する必要があるシナリオでは通常許容範囲内です。

さらに、このクライアントはトランスポート層としてHTTPの使用をサポートしています。データは最適なパフォーマンスを実現するためにネイティブ形式でエンコードされます。

以下は、ClickHouse APIのドキュメント構造に準拠しています。

標準APIの完全なコード例は[こちら](https://github.com/ClickHouse/clickhouse-go/tree/main/examples/std)で確認できます。

### 接続 {#connecting-1}

接続は、`clickhouse://<host>:<port>?<query_option>=<value>`形式のDSN文字列と`Open`メソッドを使用するか、`clickhouse.OpenDB`メソッドを使用して実現できます。後者は`database/sql`仕様の一部ではありませんが、`sql.DB`インスタンスを返します。このメソッドは、プロファイリングなどの機能を提供しますが、これらは`database/sql`仕様を通じて公開する明確な手段がありません。

```go
func Connect() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        conn := clickhouse.OpenDB(&clickhouse.Options{
                Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.Port)},
                Auth: clickhouse.Auth{
                        Database: env.Database,
                        Username: env.Username,
                        Password: env.Password,
                },
        })
        return conn.Ping()
}

func ConnectDSN() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        conn, err := sql.Open("clickhouse", fmt.Sprintf("clickhouse://%s:%d?username=%s&password=%s", env.Host, env.Port, env.Username, env.Password))
        if err != nil {
                return err
        }
        return conn.Ping()
}
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect.go)

**以降のすべての例では、明示的に示されていない限り、ClickHouseの`conn`変数が作成され利用可能であることを前提としています。**

#### 接続設定 {#connection-settings-1}

DSN文字列には以下のパラメータを渡すことができます:

- `hosts` - 負荷分散とフェイルオーバーのための単一アドレスホストのカンマ区切りリスト - [複数ノードへの接続](#connecting-to-multiple-nodes)を参照してください。
- `username/password` - 認証資格情報 - [認証](#authentication)を参照してください
- `database` - 現在のデフォルトデータベースを選択
- `dial_timeout` - 期間文字列は、符号付きの10進数のシーケンスで、それぞれにオプションの小数部と`300ms`、`1s`などの単位接尾辞が付きます。有効な時間単位は`ms`、`s`、`m`です。
- `connection_open_strategy` - `random/in_order`(デフォルトは`random`) - [複数ノードへの接続](#connecting-to-multiple-nodes)を参照してください
  - `round_robin` - セットからラウンドロビン方式でサーバーを選択
  - `in_order` - 指定された順序で最初の稼働中のサーバーを選択
- `debug` - デバッグ出力を有効化(真偽値)
- `compress` - 圧縮アルゴリズムを指定 - `none`(デフォルト)、`zstd`、`lz4`、`gzip`、`deflate`、`br`。`true`に設定すると、`lz4`が使用されます。ネイティブ通信では`lz4`と`zstd`のみがサポートされています。
- `compress_level` - 圧縮レベル(デフォルトは`0`)。圧縮を参照してください。これはアルゴリズム固有です:
  - `gzip` - `-2`(最速)から`9`(最高圧縮)
  - `deflate` - `-2`(最速)から`9`(最高圧縮)
  - `br` - `0`(最速)から`11`(最高圧縮)
  - `zstd`、`lz4` - 無視されます
- `secure` - セキュアなSSL接続を確立(デフォルトは`false`)
- `skip_verify` - 証明書検証をスキップ(デフォルトは`false`)
- `block_buffer_size` - ブロックバッファサイズを制御できます。[`BlockBufferSize`](#connection-settings)を参照してください。(デフォルトは`2`)


```go
func ConnectSettings() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        conn, err := sql.Open("clickhouse", fmt.Sprintf("clickhouse://127.0.0.1:9001,127.0.0.1:9002,%s:%d/%s?username=%s&password=%s&dial_timeout=10s&connection_open_strategy=round_robin&debug=true&compress=lz4", env.Host, env.Port, env.Database, env.Username, env.Password))
        if err != nil {
                return err
        }
        return conn.Ping()
}
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect_settings.go)

#### コネクションプーリング {#connection-pooling-1}

[複数ノードへの接続](#connecting-to-multiple-nodes)で説明されているように、ユーザーは提供されたノードアドレスリストの使用方法に影響を与えることができます。ただし、コネクション管理とプーリングは設計上`sql.DB`に委譲されます。

#### HTTP経由での接続 {#connecting-over-http}

デフォルトでは、接続はネイティブプロトコル経由で確立されます。HTTPが必要な場合は、DSNを変更してHTTPプロトコルを含めるか、接続オプションでProtocolを指定することで有効化できます。

```go
func ConnectHTTP() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        conn := clickhouse.OpenDB(&clickhouse.Options{
                Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.HttpPort)},
                Auth: clickhouse.Auth{
                        Database: env.Database,
                        Username: env.Username,
                        Password: env.Password,
                },
                Protocol: clickhouse.HTTP,
        })
        return conn.Ping()
}

func ConnectDSNHTTP() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        conn, err := sql.Open("clickhouse", fmt.Sprintf("http://%s:%d?username=%s&password=%s", env.Host, env.HttpPort, env.Username, env.Password))
        if err != nil {
                return err
        }
        return conn.Ping()
}
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect_http.go)

#### 複数ノードへの接続 {#connecting-to-multiple-nodes-1}

`OpenDB`を使用する場合、ClickHouse APIと同じオプション方式を使用して複数のホストに接続します。オプションで`ConnOpenStrategy`を指定することもできます。

DSNベースの接続では、文字列が複数のホストと`connection_open_strategy`パラメータを受け入れ、値として`round_robin`または`in_order`を設定できます。

```go
func MultiStdHost() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        conn, err := clickhouse.Open(&clickhouse.Options{
                Addr: []string{"127.0.0.1:9001", "127.0.0.1:9002", fmt.Sprintf("%s:%d", env.Host, env.Port)},
                Auth: clickhouse.Auth{
                        Database: env.Database,
                        Username: env.Username,
                        Password: env.Password,
                },
                ConnOpenStrategy: clickhouse.ConnOpenRoundRobin,
        })
        if err != nil {
                return err
        }
        v, err := conn.ServerVersion()
        if err != nil {
                return err
        }
        fmt.Println(v.String())
        return nil
}

func MultiStdHostDSN() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        conn, err := sql.Open("clickhouse", fmt.Sprintf("clickhouse://127.0.0.1:9001,127.0.0.1:9002,%s:%d?username=%s&password=%s&connection_open_strategy=round_robin", env.Host, env.Port, env.Username, env.Password))
        if err != nil {
                return err
        }
        return conn.Ping()
}
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/multi_host.go)

### TLSの使用 {#using-tls-1}

DSN接続文字列を使用する場合、SSLはパラメータ「secure=true」で有効化できます。`OpenDB`メソッドは[TLS用ネイティブAPI](#using-tls)と同じアプローチを利用し、非nilのTLS構造体の指定に依存します。DSN接続文字列はSSL検証をスキップするためのskip_verifyパラメータをサポートしていますが、より高度なTLS設定には`OpenDB`メソッドが必要です。これは設定の受け渡しを可能にするためです。


```go
func ConnectSSL() error {
        env, err := GetStdTestEnvironment()
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

        conn := clickhouse.OpenDB(&clickhouse.Options{
                Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.SslPort)},
                Auth: clickhouse.Auth{
                        Database: env.Database,
                        Username: env.Username,
                        Password: env.Password,
                },
                TLS: t,
        })
        return conn.Ping()
}

func ConnectDSNSSL() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        conn, err := sql.Open("clickhouse", fmt.Sprintf("https://%s:%d?secure=true&skip_verify=true&username=%s&password=%s", env.Host, env.HttpsPort, env.Username, env.Password))
        if err != nil {
                return err
        }
        return conn.Ping()
}
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/ssl.go)

### 認証 {#authentication-1}

`OpenDB`を使用する場合、認証情報は通常のオプションを介して渡すことができます。DSNベースの接続の場合、ユーザー名とパスワードは接続文字列で渡すことができます。パラメータとして指定するか、アドレスにエンコードされた認証情報として指定します。

```go
func ConnectAuth() error {
        env, err := GetStdTestEnvironment()
        if err != nil {
                return err
        }
        conn := clickhouse.OpenDB(&clickhouse.Options{
                Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.Port)},
                Auth: clickhouse.Auth{
                        Database: env.Database,
                        Username: env.Username,
                        Password: env.Password,
                },
        })
        return conn.Ping()
}

func ConnectDSNAuth() error {
        env, err := GetStdTestEnvironment()
        conn, err := sql.Open("clickhouse", fmt.Sprintf("http://%s:%d?username=%s&password=%s", env.Host, env.HttpPort, env.Username, env.Password))
        if err != nil {
                return err
        }
        if err = conn.Ping(); err != nil {
                return err
        }
        conn, err = sql.Open("clickhouse", fmt.Sprintf("http://%s:%s@%s:%d", env.Username, env.Password, env.Host, env.HttpPort))
        if err != nil {
                return err
        }
        return conn.Ping()
}
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/auth.go)

### 実行 {#execution-1}

接続が確立されると、Execメソッドを介して`sql`ステートメントを実行できます。

```go
conn.Exec(`DROP TABLE IF EXISTS example`)
_, err = conn.Exec(`
    CREATE TABLE IF NOT EXISTS example (
        Col1 UInt8,
        Col2 String
    ) engine=Memory
`)
if err != nil {
    return err
}
_, err = conn.Exec("INSERT INTO example VALUES (1, 'test-1')")
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/exec.go)

このメソッドはコンテキストの受け取りをサポートしていません。デフォルトでは、バックグラウンドコンテキストで実行されます。必要な場合は、`ExecContext`を使用してください。詳細は[コンテキストの使用](#using-context)を参照してください。

### バッチ挿入 {#batch-insert-1}

バッチセマンティクスは、`Begin`メソッドを介して`sql.Tx`を作成することで実現できます。そこから、`INSERT`ステートメントを指定した`Prepare`メソッドを使用してバッチを取得できます。これにより`sql.Stmt`が返され、`Exec`メソッドを使用して行を追加できます。バッチは、元の`sql.Tx`に対して`Commit`が実行されるまでメモリに蓄積されます。


```go
batch, err := scope.Prepare("INSERT INTO example")
if err != nil {
    return err
}
for i := 0; i < 1000; i++ {
    _, err := batch.Exec(
        uint8(42),
        "ClickHouse", "Inc",
        uuid.New(),
        map[string]uint8{"key": 1},             // Map(String, UInt8)
        []string{"Q", "W", "E", "R", "T", "Y"}, // Array(String)
        []interface{}{ // Tuple(String, UInt8, Array(Map(String, String)))
            "String Value", uint8(5), []map[string]string{
                map[string]string{"key": "value"},
                map[string]string{"key": "value"},
                map[string]string{"key": "value"},
            },
        },
        time.Now(),
    )
    if err != nil {
        return err
    }
}
return scope.Commit()
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/batch.go)

### 行のクエリ {#querying-rows-1}

単一行のクエリは`QueryRow`メソッドを使用して実行できます。このメソッドは\*sql.Rowを返し、列をマーシャルする変数へのポインタを指定してScanを呼び出すことができます。`QueryRowContext`バリアントを使用すると、バックグラウンド以外のコンテキストを渡すことができます - [コンテキストの使用](#using-context)を参照してください。

```go
row := conn.QueryRow("SELECT * FROM example")
var (
    col1             uint8
    col2, col3, col4 string
    col5             map[string]uint8
    col6             []string
    col7             interface{}
    col8             time.Time
)
if err := row.Scan(&col1, &col2, &col3, &col4, &col5, &col6, &col7, &col8); err != nil {
    return err
}
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/query_row.go)

複数行を反復処理するには`Query`メソッドを使用します。このメソッドは`*sql.Rows`構造体を返し、Nextを呼び出すことで行を反復処理できます。`QueryContext`を使用すると、コンテキストを渡すことができます。

```go
rows, err := conn.Query("SELECT * FROM example")
if err != nil {
    return err
}
var (
    col1             uint8
    col2, col3, col4 string
    col5             map[string]uint8
    col6             []string
    col7             interface{}
    col8             time.Time
)
for rows.Next() {
    if err := rows.Scan(&col1, &col2, &col3, &col4, &col5, &col6, &col7, &col8); err != nil {
        return err
    }
    fmt.Printf("row: col1=%d, col2=%s, col3=%s, col4=%s, col5=%v, col6=%v, col7=%v, col8=%v\n", col1, col2, col3, col4, col5, col6, col7, col8)
}
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/query_rows.go)

### 非同期挿入 {#async-insert-1}

非同期挿入は`ExecContext`メソッドを使用して実行できます。以下に示すように、非同期モードが有効になっているコンテキストを渡す必要があります。これにより、クライアントがサーバーの挿入完了を待つか、データを受信した時点で応答するかを指定できます。これは実質的に[wait_for_async_insert](/operations/settings/settings#wait_for_async_insert)パラメータを制御します。

```go
const ddl = `
    CREATE TABLE example (
            Col1 UInt64
        , Col2 String
        , Col3 Array(UInt8)
        , Col4 DateTime
    ) ENGINE = Memory
    `
if _, err := conn.Exec(ddl); err != nil {
    return err
}
ctx := clickhouse.Context(context.Background(), clickhouse.WithStdAsync(false))
{
    for i := 0; i < 100; i++ {
        _, err := conn.ExecContext(ctx, fmt.Sprintf(`INSERT INTO example VALUES (
            %d, '%s', [1, 2, 3, 4, 5, 6, 7, 8, 9], now()
        )`, i, "Golang SQL database driver"))
        if err != nil {
            return err
        }
    }
}
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/async.go)


### カラム形式の挿入 {#columnar-insert-1}

標準インターフェースではサポートされていません。

### 構造体の使用 {#using-structs-1}

標準インターフェースではサポートされていません。

### 型変換 {#type-conversions-1}

標準の`database/sql`インターフェースは、[ClickHouse API](#type-conversions)と同じ型をサポートします。主に複合型に関していくつかの例外があり、以下に記載しています。ClickHouse APIと同様に、クライアントは挿入とレスポンスのマーシャリングの両方において、可能な限り柔軟に変数型を受け入れることを目指しています。詳細については[型変換](#type-conversions)を参照してください。

### 複合型 {#complex-types-1}

特に記載がない限り、複合型の処理は[ClickHouse API](#complex-types)と同じです。相違点は`database/sql`の内部実装に起因します。

#### マップ {#maps}

ClickHouse APIとは異なり、標準APIではスキャン時にマップが強く型付けされている必要があります。例えば、`Map(String,String)`フィールドに対して`map[string]interface{}`を渡すことはできず、代わりに`map[string]string`を使用する必要があります。`interface{}`変数は常に互換性があり、より複雑な構造に使用できます。読み取り時に構造体はサポートされていません。

```go
var (
    col1Data = map[string]uint64{
        "key_col_1_1": 1,
        "key_col_1_2": 2,
    }
    col2Data = map[string]uint64{
        "key_col_2_1": 10,
        "key_col_2_2": 20,
    }
    col3Data = map[string]uint64{}
    col4Data = []map[string]string{
        {"A": "B"},
        {"C": "D"},
    }
    col5Data = map[string]uint64{
        "key_col_5_1": 100,
        "key_col_5_2": 200,
    }
)
if _, err := batch.Exec(col1Data, col2Data, col3Data, col4Data, col5Data); err != nil {
    return err
}
if err = scope.Commit(); err != nil {
    return err
}
var (
    col1 interface{}
    col2 map[string]uint64
    col3 map[string]uint64
    col4 []map[string]string
    col5 map[string]uint64
)
if err := conn.QueryRow("SELECT * FROM example").Scan(&col1, &col2, &col3, &col4, &col5); err != nil {
    return err
}
fmt.Printf("col1=%v, col2=%v, col3=%v, col4=%v, col5=%v", col1, col2, col3, col4, col5)
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/map.go)

挿入動作はClickHouse APIと同じです。

### 圧縮 {#compression-1}

標準APIは、ネイティブ[ClickHouse API](#compression)と同じ圧縮アルゴリズム、すなわちブロックレベルでの`lz4`および`zstd`圧縮をサポートします。さらに、HTTP接続ではgzip、deflate、br圧縮がサポートされています。これらのいずれかが有効になっている場合、挿入時およびクエリレスポンスに対してブロックの圧縮が実行されます。pingやクエリリクエストなどの他のリクエストは圧縮されません。これは`lz4`および`zstd`オプションと一貫しています。

`OpenDB`メソッドを使用して接続を確立する場合、圧縮設定を渡すことができます。これには圧縮レベルを指定する機能が含まれます(以下を参照)。DSNを使用して`sql.Open`経由で接続する場合は、`compress`パラメータを使用します。これは特定の圧縮アルゴリズム、すなわち`gzip`、`deflate`、`br`、`zstd`、`lz4`のいずれか、またはブール値フラグを指定できます。trueに設定すると、`lz4`が使用されます。デフォルトは`none`、つまり圧縮は無効です。

```go
conn := clickhouse.OpenDB(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.HttpPort)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
    Compression: &clickhouse.Compression{
        Method: clickhouse.CompressionBrotli,
        Level:  5,
    },
    Protocol: clickhouse.HTTP,
})
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/compression.go#L27-L76)


```go
conn, err := sql.Open("clickhouse", fmt.Sprintf("http://%s:%d?username=%s&password=%s&compress=gzip&compress_level=5", env.Host, env.HttpPort, env.Username, env.Password))
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/compression.go#L78-L115)

適用される圧縮レベルは、DSNパラメータ `compress_level` または Compression オプションの `Level` フィールドで制御できます。デフォルトは 0 ですが、アルゴリズムによって異なります:

- `gzip` - `-2` (最速) から `9` (最高圧縮)
- `deflate` - `-2` (最速) から `9` (最高圧縮)
- `br` - `0` (最速) から `11` (最高圧縮)
- `zstd`, `lz4` - 無視されます

### パラメータバインディング {#parameter-binding-1}

標準APIは、[ClickHouse API](#parameter-binding)と同じパラメータバインディング機能をサポートしており、`Exec`、`Query`、`QueryRow` メソッド(およびそれらに相当する [Context](#using-context) バリアント)にパラメータを渡すことができます。位置指定、名前付き、番号付きパラメータがサポートされています。

```go
var count uint64
// 位置指定バインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 >= ? AND Col3 < ?", 500, now.Add(time.Duration(750)*time.Second)).Scan(&count); err != nil {
    return err
}
// 250
fmt.Printf("位置指定バインドのカウント: %d\n", count)
// 数値バインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= $2 AND Col3 > $1", now.Add(time.Duration(150)*time.Second), 250).Scan(&count); err != nil {
    return err
}
// 100
fmt.Printf("数値バインドのカウント: %d\n", count)
// 名前付きバインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= @col1 AND Col3 > @col3", clickhouse.Named("col1", 100), clickhouse.Named("col3", now.Add(time.Duration(50)*time.Second))).Scan(&count); err != nil {
    return err
}
// 50
fmt.Printf("名前付きバインドのカウント: %d\n", count)
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/bind.go)

[特殊なケース](#special-cases)は引き続き適用されることに注意してください。

### コンテキストの使用 {#using-context-1}

標準APIは、[ClickHouse API](#using-context)と同様に、コンテキストを介してデッドライン、キャンセルシグナル、その他のリクエストスコープの値を渡す機能をサポートしています。ClickHouse APIとは異なり、これはメソッドの `Context` バリアントを使用することで実現されます。つまり、デフォルトでバックグラウンドコンテキストを使用する `Exec` などのメソッドには、最初のパラメータとしてコンテキストを渡すことができる `ExecContext` というバリアントがあります。これにより、アプリケーションフローのあらゆる段階でコンテキストを渡すことができます。たとえば、ユーザーは `ConnContext` を介して接続を確立する際や、`QueryRowContext` を介してクエリ行をリクエストする際にコンテキストを渡すことができます。利用可能なすべてのメソッドの例を以下に示します。

コンテキストを使用してデッドライン、キャンセルシグナル、クエリID、クォータキー、接続設定を渡す方法の詳細については、[ClickHouse API](#using-context)のコンテキストの使用を参照してください。

```go
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "allow_experimental_object_type": "1",
}))
conn.ExecContext(ctx, "DROP TABLE IF EXISTS example")
// JSON カラムを作成するには allow_experimental_object_type=1 が必要です
if _, err = conn.ExecContext(ctx, `
    CREATE TABLE example (
            Col1 JSON
        )
        Engine Memory
    `); err != nil {
    return err
}

// コンテキストを使用してクエリをキャンセルできます
ctx, cancel := context.WithCancel(context.Background())
go func() {
    cancel()
}()
if err = conn.QueryRowContext(ctx, "SELECT sleep(3)").Scan(); err == nil {
    return fmt.Errorf("expected cancel")
}

// クエリのデッドラインを設定 - 絶対時刻に達した後にクエリをキャンセルします。これも接続のみを終了し、
// クエリは ClickHouse で完了まで継続されます
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.PingContext(ctx); err == nil {
    return fmt.Errorf("expected deadline exceeeded")
}

```


// ログ内でクエリをトレースするためのクエリIDを設定します(例: system.query_logを参照)
var one uint8
ctx = clickhouse.Context(context.Background(), clickhouse.WithQueryID(uuid.NewString()))
if err = conn.QueryRowContext(ctx, "SELECT 1").Scan(&one); err != nil {
return err
}

conn.ExecContext(context.Background(), "DROP QUOTA IF EXISTS foobar")
defer func() {
conn.ExecContext(context.Background(), "DROP QUOTA IF EXISTS foobar")
}()
ctx = clickhouse.Context(context.Background(), clickhouse.WithQuotaKey("abcde"))
// クォータキーを設定します - まずクォータを作成します
if \_, err = conn.ExecContext(ctx, "CREATE QUOTA IF NOT EXISTS foobar KEYED BY client_key FOR INTERVAL 1 minute MAX queries = 5 TO default"); err != nil {
return err
}

// コンテキストを使用してクエリをキャンセルできます
ctx, cancel = context.WithCancel(context.Background())
// キャンセル前にいくつかの結果を取得します
ctx = clickhouse.Context(ctx, clickhouse.WithSettings(clickhouse.Settings{
"max_block_size": "1",
}))
rows, err := conn.QueryContext(ctx, "SELECT sleepEachRow(1), number FROM numbers(100);")
if err != nil {
return err
}
var (
col1 uint8
col2 uint8
)

for rows.Next() {
if err := rows.Scan(&col1, &col2); err != nil {
if col2 > 3 {
fmt.Println("expected cancel")
return nil
}
return err
}
fmt.Printf("row: col2=%d\n", col2)
if col2 == 3 {
cancel()
}
}

````

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/context.go)

### セッション {#sessions}

ネイティブ接続は本質的にセッションを持ちますが、HTTP経由の接続では、ユーザーが設定としてコンテキストに渡すためのセッションIDを作成する必要があります。これにより、セッションに紐付けられる一時テーブルなどの機能を使用できます。

```go
conn := clickhouse.OpenDB(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.HttpPort)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
    Protocol: clickhouse.HTTP,
    Settings: clickhouse.Settings{
        "session_id": uuid.NewString(),
    },
})
if _, err := conn.Exec(`DROP TABLE IF EXISTS example`); err != nil {
    return err
}
_, err = conn.Exec(`
    CREATE TEMPORARY TABLE IF NOT EXISTS example (
            Col1 UInt8
    )
`)
if err != nil {
    return err
}
scope, err := conn.Begin()
if err != nil {
    return err
}
batch, err := scope.Prepare("INSERT INTO example")
if err != nil {
    return err
}
for i := 0; i < 10; i++ {
    _, err := batch.Exec(
        uint8(i),
    )
    if err != nil {
        return err
    }
}
rows, err := conn.Query("SELECT * FROM example")
if err != nil {
    return err
}
var (
    col1 uint8
)
for rows.Next() {
    if err := rows.Scan(&col1); err != nil {
        return err
    }
    fmt.Printf("row: col1=%d\n", col1)
}
````

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/session.go)

### 動的スキャン {#dynamic-scanning-1}

[ClickHouse API](#dynamic-scanning)と同様に、カラム型情報が利用可能であり、ユーザーは正しく型付けされた変数のランタイムインスタンスを作成してScanに渡すことができます。これにより、型が不明なカラムを読み取ることができます。

```go
const query = `
SELECT
        1     AS Col1
    , 'Text' AS Col2
`
rows, err := conn.QueryContext(context.Background(), query)
if err != nil {
    return err
}
columnTypes, err := rows.ColumnTypes()
if err != nil {
    return err
}
vars := make([]interface{}, len(columnTypes))
for i := range columnTypes {
    vars[i] = reflect.New(columnTypes[i].ScanType()).Interface()
}
for rows.Next() {
    if err := rows.Scan(vars...); err != nil {
        return err
    }
    for _, v := range vars {
        switch v := v.(type) {
        case *string:
            fmt.Println(*v)
        case *uint8:
            fmt.Println(*v)
        }
    }
}
```


[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/dynamic_scan_types.go)

### 外部テーブル {#external-tables-1}

[外部テーブル](/engines/table-engines/special/external-data/)を使用すると、クライアントは`SELECT`クエリと共にClickHouseにデータを送信できます。このデータは一時テーブルに格納され、クエリ内で評価に使用できます。

クエリと共に外部データをサーバーに送信するには、`ext.NewTable`を使用して外部テーブルを構築し、コンテキスト経由で渡す必要があります。

```go
table1, err := ext.NewTable("external_table_1",
    ext.Column("col1", "UInt8"),
    ext.Column("col2", "String"),
    ext.Column("col3", "DateTime"),
)
if err != nil {
    return err
}

for i := 0; i < 10; i++ {
    if err = table1.Append(uint8(i), fmt.Sprintf("value_%d", i), time.Now()); err != nil {
        return err
    }
}

table2, err := ext.NewTable("external_table_2",
    ext.Column("col1", "UInt8"),
    ext.Column("col2", "String"),
    ext.Column("col3", "DateTime"),
)

for i := 0; i < 10; i++ {
    table2.Append(uint8(i), fmt.Sprintf("value_%d", i), time.Now())
}
ctx := clickhouse.Context(context.Background(),
    clickhouse.WithExternalTable(table1, table2),
)
rows, err := conn.QueryContext(ctx, "SELECT * FROM external_table_1")
if err != nil {
    return err
}
for rows.Next() {
    var (
        col1 uint8
        col2 string
        col3 time.Time
    )
    rows.Scan(&col1, &col2, &col3)
    fmt.Printf("col1=%d, col2=%s, col3=%v\n", col1, col2, col3)
}
rows.Close()

var count uint64
if err := conn.QueryRowContext(ctx, "SELECT COUNT(*) FROM external_table_1").Scan(&count); err != nil {
    return err
}
fmt.Printf("external_table_1: %d\n", count)
if err := conn.QueryRowContext(ctx, "SELECT COUNT(*) FROM external_table_2").Scan(&count); err != nil {
    return err
}
fmt.Printf("external_table_2: %d\n", count)
if err := conn.QueryRowContext(ctx, "SELECT COUNT(*) FROM (SELECT * FROM external_table_1 UNION ALL SELECT * FROM external_table_2)").Scan(&count); err != nil {
    return err
}
fmt.Printf("external_table_1 UNION external_table_2: %d\n", count)
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/external_data.go)

### OpenTelemetry {#open-telemetry-1}

ClickHouseでは、ネイティブプロトコルの一部として[トレースコンテキスト](/operations/opentelemetry/)を渡すことができます。クライアントは`clickhouse.WithSpan`関数を使用してSpanを作成し、Contextを介して渡すことでこれを実現できます。HTTPをトランスポートとして使用する場合、この機能はサポートされません。

```go
var count uint64
rows := conn.QueryRowContext(clickhouse.Context(context.Background(), clickhouse.WithSpan(
    trace.NewSpanContext(trace.SpanContextConfig{
        SpanID:  trace.SpanID{1, 2, 3, 4, 5},
        TraceID: trace.TraceID{5, 4, 3, 2, 1},
    }),
)), "SELECT COUNT() FROM (SELECT number FROM system.numbers LIMIT 5)")
if err := rows.Scan(&count); err != nil {
    return err
}
fmt.Printf("count: %d\n", count)
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/open_telemetry.go)


## パフォーマンスのヒント {#performance-tips}

- 可能な限りClickHouse APIを利用してください。特にプリミティブ型の場合に有効です。これにより、リフレクションや間接参照のオーバーヘッドを大幅に削減できます。
- 大規模なデータセットを読み取る場合は、[`BlockBufferSize`](#connection-settings)の変更を検討してください。これによりメモリ使用量は増加しますが、行の反復処理中により多くのブロックを並列でデコードできるようになります。デフォルト値の2は控えめな設定で、メモリオーバーヘッドを最小限に抑えます。より高い値を設定すると、メモリ内のブロック数が増加します。クエリによって生成されるブロックサイズが異なる可能性があるため、テストが必要です。そのため、Contextを介して[クエリレベル](#using-context)で設定することができます。
- データを挿入する際は、型を明確に指定してください。クライアントは柔軟性を重視しており、例えば文字列をUUIDやIPアドレスとして解析することを許可していますが、これにはデータ検証が必要であり、挿入時にコストが発生します。
- 可能な限りカラム指向の挿入を使用してください。これらも厳密に型付けする必要があり、クライアントによる値の変換を回避できます。
- 最適な挿入パフォーマンスを得るために、ClickHouseの[推奨事項](/sql-reference/statements/insert-into/#performance-considerations)に従ってください。
