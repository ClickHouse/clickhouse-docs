---
sidebar_label: 'Go'
sidebar_position: 1
keywords: ['clickhouse', 'go', 'client', 'golang']
slug: /integrations/go
description: 'ClickHouse 用の Go クライアントを使用すると、Go 標準の database/sql インターフェイスまたは最適化されたネイティブインターフェイスを使用して ClickHouse に接続できます。'
title: 'ClickHouse Go'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'language_client'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_native.md';


# ClickHouse Go

## 簡単な例 {#a-simple-example}

まずは簡単な例から始めましょう。これは ClickHouse に接続し、`system` データベースに対して `SELECT` を実行します。始めるにあたっては、接続情報を手元に用意しておく必要があります。

### 接続情報 {#connection-details}

<ConnectionDetails />

### モジュールを初期化する

```bash
mkdir clickhouse-golang-example
cd clickhouse-golang-example
go mod init clickhouse-golang-example
```


### サンプルコードをコピーする

このコードを `clickhouse-golang-example` ディレクトリに `main.go` として保存します。

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


### go mod tidy を実行する

```bash
go mod tidy
```


### 接続情報を設定する

先ほど接続情報を確認しました。その値を `main.go` の `connect()` 関数内で設定します。

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


### サンプルを実行する

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


### さらに詳しく {#learn-more}

このカテゴリの他のドキュメントでは、ClickHouse Go クライアントの詳細について説明します。

## ClickHouse Go client {#clickhouse-go-client}

ClickHouse は 2 つの公式な Go クライアントをサポートしています。これらのクライアントは補完的な関係にあり、意図的に異なるユースケースをサポートしています。

* [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) - Go 標準の `database/sql` インターフェイスまたはネイティブインターフェイスのいずれかをサポートする高レベルクライアント。
* [ch-go](https://github.com/ClickHouse/ch-go) - 低レベルクライアント。ネイティブインターフェイスのみ。

clickhouse-go は高レベルインターフェイスを提供し、ユーザーが行指向のセマンティクスとバッチ処理を用いてクエリおよびデータ挿入を行えるようにします。これはデータ型に対して寛容であり、精度の損失が生じない限り値を変換します。一方、ch-go は最適化された列指向インターフェイスを提供し、型の厳密さとより複雑な使用方法を代償として、低い CPU およびメモリオーバーヘッドで高速なデータブロックストリーミングを実現します。

バージョン 2.3 から、clickhouse-go はエンコード、デコード、圧縮などの低レベル機能に ch-go を利用します。なお、clickhouse-go は Go の `database/sql` インターフェイス標準もサポートしています。両方のクライアントは最適なパフォーマンスを提供するためにエンコードにネイティブフォーマットを使用し、ネイティブ ClickHouse プロトコルを介して通信できます。さらに、ユーザーがトラフィックのプロキシやロードバランシングを行う必要がある場合に備えて、clickhouse-go は HTTP を転送方式としてもサポートします。

クライアントライブラリを選択する際には、それぞれの長所と短所を把握しておく必要があります。詳細は「Choosing a Client Library」を参照してください。

|               | ネイティブフォーマット | ネイティブプロトコル | HTTP プロトコル | 行指向 API | 列指向 API | 型の柔軟性 | 圧縮 | クエリプレースホルダー |
|:-------------:|:----------------------:|:---------------------:|:---------------:|:----------:|:-----------:|:----------:|:----:|:----------------------:|
| clickhouse-go |           ✅           |           ✅           |        ✅        |     ✅      |      ✅      |     ✅      |  ✅   |           ✅           |
|     ch-go     |           ✅           |           ✅           |                 |            |      ✅      |            |  ✅   |                        |

## クライアントの選択 {#choosing-a-client}

どのクライアントライブラリを選択するかは、利用パターンと求めるパフォーマンス要件によって異なります。毎秒数百万件の挿入が必要となるような挿入中心のユースケースでは、低レベルクライアントである [ch-go](https://github.com/ClickHouse/ch-go) の使用を推奨します。このクライアントは、ClickHouse のネイティブフォーマットが要求する列指向フォーマットへ行指向データを変換（ピボット）する際のオーバーヘッドを回避します。さらに、使いやすさのために `interface{}`（`any`）型やリフレクションの使用も避けています。

集約処理にフォーカスしたクエリワークロードや、スループット要件がそれほど高くない挿入ワークロードでは、[clickhouse-go](https://github.com/ClickHouse/clickhouse-go) は親しみやすい `database/sql` インターフェイスと、より分かりやすい行セマンティクスを提供します。ユーザーはトランスポートプロトコルとして HTTP を任意で利用できるほか、行と struct 間のマーシャリングを行うヘルパー関数も活用できます。

## clickhouse-go クライアント {#the-clickhouse-go-client}

clickhouse-go クライアントは、ClickHouse と通信するために 2 つの API インターフェースを提供します:

* ClickHouse クライアント専用 API
* `database/sql` 標準 - Go 言語が提供する SQL データベース向けの汎用インターフェース

`database/sql` はデータベース非依存のインターフェースを提供し、開発者がデータストアを抽象化できる一方で、パフォーマンスに影響する型付けやクエリのセマンティクスを強制します。このため、[パフォーマンスが重要な場合](https://github.com/clickHouse/clickHouse-go#benchmark)にはクライアント専用 API を使用することを推奨します。ただし、複数のデータベースをサポートするツールに ClickHouse を統合したい場合は、標準インターフェースを利用した方がよいケースもあります。

両方のインターフェースは、通信に [native format](/native-protocol/basics.md) およびネイティブプロトコルを使用してデータをエンコードします。さらに、標準インターフェースは HTTP 経由での通信もサポートします。

|                    | Native format | Native protocol | HTTP protocol | Bulk write support | Struct marshaling | Compression | Query Placeholders |
|:------------------:|:-------------:|:---------------:|:-------------:|:------------------:|:-----------------:|:-----------:|:------------------:|
|   ClickHouse API   |       ✅       |        ✅        |               |          ✅         |         ✅         |      ✅      |          ✅         |
| `database/sql` API |       ✅       |        ✅        |       ✅       |          ✅         |                   |      ✅      |          ✅         |

## インストール

ドライバーの v1 は非推奨となっており、新しい ClickHouse 型へのサポートや機能更新は行われません。より高いパフォーマンスを提供する v2 への移行が推奨されます。

2.x 系バージョンのクライアントをインストールするには、次の行を go.mod ファイルに追加します:

`require github.com/ClickHouse/clickhouse-go/v2 main`

または、リポジトリをクローンします:

```bash
git clone --branch v2 https://github.com/clickhouse/clickhouse-go.git $GOPATH/src/github
```

別のバージョンをインストールするには、パスやブランチ名を適宜変更してください。

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


### バージョニングと互換性 {#versioning--compatibility}

このクライアントは ClickHouse とは独立してリリースされます。2.x は現在開発中のメジャーバージョンを表します。2.x 系のすべてのバージョンは互いに互換性があるように設計されています。

#### ClickHouse の互換性 {#clickhouse-compatibility}

このクライアントは以下をサポートします：

- [こちら](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md) に記載されている、現在サポートされているすべての ClickHouse バージョン。ClickHouse の各バージョンがサポート対象外になると、それらはクライアントのリリースに対しても積極的なテスト対象から外れます。
- クライアントのリリース日時点から遡って 2 年間にリリースされたすべての ClickHouse バージョン。なお、積極的にテストされるのは LTS バージョンのみです。

#### Golang の互換性 {#golang-compatibility}

| クライアントバージョン | Golang バージョン |
|:----------------------:|:------------------:|
|    => 2.0 &lt;= 2.2    |    1.17, 1.18     |
|        >= 2.3         |       1.18        |

## ClickHouse クライアント API {#clickhouse-client-api}

ClickHouse クライアント API のすべてのコード例は[こちら](https://github.com/ClickHouse/clickhouse-go/tree/main/examples)で確認できます。

### 接続

次の例はサーバーバージョンを返すもので、ClickHouse がセキュリティ保護されておらず、デフォルトユーザーでアクセス可能であることを前提に、ClickHouse への接続方法を示します。

接続にはデフォルトのネイティブポートを使用している点に注意してください。

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

**以降のすべてのサンプルでは、特に明記がない限り、ClickHouse の `conn` 変数はすでに作成済みで利用可能であるものとします。**


#### 接続設定

接続を開く際、`Options` 構造体を使用してクライアントの動作を制御できます。利用可能な設定は次のとおりです。

* `Protocol` - Native または HTTP のいずれか。HTTP は現在、[database/sql API](#databasesql-api) でのみサポートされています。
* `TLS` - TLS オプション。nil 以外の値を指定すると TLS が有効になります。詳しくは [Using TLS](#using-tls) を参照してください。
* `Addr` - ポートを含むアドレスのスライス。
* `Auth` - 認証情報。詳しくは [Authentication](#authentication) を参照してください。
* `DialContext` - 接続の確立方法を制御するためのカスタム dial 関数。
* `Debug` - デバッグを有効にするかどうかを指定する true/false。
* `Debugf` - デバッグ出力を処理する関数を指定します。`debug` が true に設定されている必要があります。
* `Settings` - ClickHouse の設定を保持するマップ。これらはすべての ClickHouse クエリに適用されます。[Using Context](#using-context) を使用すると、クエリごとに設定を行うことができます。
* `Compression` - ブロックの圧縮を有効にします。詳しくは [Compression](#compression) を参照してください。
* `DialTimeout` - 接続を確立するための最大時間。デフォルトは `1s` です。
* `MaxOpenConns` - 任意の時点で使用可能な最大接続数。アイドルプール内の接続数はこれより多くても少なくてもかまいませんが、一度に使用できるのはこの数までです。デフォルトは `MaxIdleConns+5` です。
* `MaxIdleConns` - プール内に維持する接続数。可能な場合には接続が再利用されます。デフォルトは `5` です。
* `ConnMaxLifetime` - 接続を利用可能な状態で維持する最大存続時間。デフォルトは 1 時間です。この時間を過ぎると接続は破棄され、必要に応じて新しい接続がプールに追加されます。
* `ConnOpenStrategy` - ノードアドレスのリストをどのような戦略で取り出し、接続の確立に使用するかを決定します。詳しくは [Connecting to Multiple Nodes](#connecting-to-multiple-nodes) を参照してください。
* `BlockBufferSize` - 一度にバッファへデコードするブロックの最大数。値を大きくすると、メモリ消費量と引き換えに並列処理が向上します。ブロックサイズはクエリに依存するため、接続単位でも設定できますが、返されるデータに応じてクエリ単位で上書きすることを推奨します。デフォルトは `2` です。

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

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/connect_settings.go)


#### コネクションプーリング {#connection-pooling}

クライアントはコネクションプールを保持し、必要に応じてクエリ間でコネクションを再利用します。任意の時点で使用されるコネクション数は最大で `MaxOpenConns` までであり、プールの最大サイズは `MaxIdleConns` によって制御されます。クライアントは各クエリ実行時にプールからコネクションを取得し、実行後は再利用のためにプールへ戻します。1つのバッチの存続期間中は同じコネクションが使用され、`Send()` の呼び出し時に解放されます。

ユーザーが `MaxOpenConns=1` を設定しない限り、プール内の同じコネクションが後続のクエリで使用されることは保証されません。この設定が必要になることはまれですが、一時テーブルを使用しているケースなどでは必要となる場合があります。

また、`ConnMaxLifetime` はデフォルトで 1 時間である点に注意してください。これは、ノードがクラスタから離脱した場合に ClickHouse への負荷が不均衡になる原因となる可能性があります。ノードが利用不能になると、コネクションは他のノードへ分散されます。これらのコネクションは、問題のあるノードがクラスタに復帰したとしても、デフォルトでは 1 時間は維持され、再確立されません。高負荷なワークロードの場合には、この値を下げることを検討してください。

### TLS の使用

内部的には、すべてのクライアント接続メソッド（`DSN/OpenDB/Open`）はセキュアな接続を確立するために [Go の tls パッケージ](https://pkg.go.dev/crypto/tls) を使用します。Options 構造体に `nil` ではない `tls.Config` ポインタが含まれている場合、クライアントは TLS を使用すべきことを認識します。

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

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/ssl.go)

この最小限の `TLS.Config` 設定だけで、通常は ClickHouse サーバーのセキュアなネイティブポート（デフォルトは 9440）に接続するのに十分です。ClickHouse サーバーが有効な証明書を持っていない場合（証明書の有効期限切れ、ホスト名の不一致、公的に認められたルート認証局による未署名 など）、`InsecureSkipVerify` を true に設定することも可能ですが、これは強く非推奨です。

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

追加の TLS パラメータが必要な場合は、アプリケーションコード側で `tls.Config` 構造体の該当フィールドを設定する必要があります。これには、特定の暗号スイートの指定、特定の TLS バージョン (1.2 や 1.3 など) の強制、内部 CA 証明書チェーンの追加、ClickHouse サーバーによって要求される場合のクライアント証明書 (および秘密鍵) の追加など、より高度なセキュリティ構成で利用されるほとんどのオプションが含まれます。


### 認証

接続設定で `Auth` 構造体を指定し、ユーザー名とパスワードを設定します。

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

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/auth.go)


### 複数ノードへの接続

複数のアドレスを `Addr` 構造体で指定できます。

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

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/1c0d81d0b1388dbb9e09209e535667df212f4ae4/examples/clickhouse_api/multi_host.go#L26-L45)

2 つの接続戦略を利用できます:

* `ConnOpenInOrder` (デフォルト) - アドレスを順番に試行します。リストの前方のアドレスで接続に失敗した場合にのみ、後方のアドレスが使用されます。これは実質的にフォールオーバー戦略です。
* `ConnOpenRoundRobin` - ラウンドロビン戦略を使用して、アドレス間で負荷を分散します。

これらはオプション `ConnOpenStrategy` で制御できます。

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

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/1c0d81d0b1388dbb9e09209e535667df212f4ae4/examples/clickhouse_api/multi_host.go#L50-L67)


### 実行

任意のステートメントは `Exec` メソッドで実行できます。これは DDL や簡単なステートメントを実行する場合に便利です。大量データの挿入やクエリの反復実行には使用すべきではありません。

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

クエリに `Context` を渡せることに注意してください。これは、クエリごとの特定の設定を渡すために使用できます。詳しくは [Using Context](#using-context) を参照してください。


### バッチ挿入

多数の行を挿入するには、クライアントはバッチ挿入用のセマンティクスを提供します。そのためには、行を追加していくためのバッチを事前に用意する必要があります。最終的にこのバッチは `Send()` メソッド経由で送信されます。バッチは `Send` が実行されるまでメモリ上に保持されます。

接続リークを防ぐため、バッチに対して `Close` を呼び出すことを推奨します。これは、バッチを準備した直後に `defer` キーワードを用いて指定することで実行できます。これにより、`Send` が一度も呼び出されなかった場合でも接続がクリーンアップされます。なお、行が一度も追加されなかった場合、クエリログには挿入行数 0 として表示される点に注意してください。

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

for i := 0; i < 1000; i++ {
    err := batch.Append(
        uint8(42),
        "ClickHouse",
        "Inc",
        uuid.New(),
        map[string]uint8{"key": 1},             // Map(String, UInt8)
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
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/batch.go)

ClickHouse に関する推奨事項については[こちら](/guides/inserting-data#best-practices-for-inserts)に記載されている内容がこの場合にも適用されます。バッチは goroutine 間で共有せず、goroutine ごとに個別のバッチを構築してください。

上記の例から、行を追加する際には変数の型がカラム型と一致している必要がある点に注意してください。マッピングは通常明らかですが、このインターフェイスは柔軟に動作するようになっており、精度の損失が発生しない限り型は変換されます。例えば、次の例では string を datetime64 列に挿入する方法を示しています。

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
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/type_convert.go)

各カラム型ごとにサポートされる Go 型の一覧については、[型変換](#type-conversions) を参照してください。


### 行のクエリ実行

ユーザーは、`QueryRow` メソッドを使用して 1 行だけを取得するか、`Query` を使用して結果セットを反復処理するためのカーソルを取得できます。前者はシリアライズ結果の格納先を引数として受け取りますが、後者では各行に対して `Scan` を呼び出す必要があります。

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

どちらの場合も、それぞれのカラム値を格納したい変数へのポインタを渡す必要がある点に注意してください。これらは `SELECT` ステートメントで指定された順序で渡さなければなりません。デフォルトでは、上記のように `SELECT *` を使用した場合、カラム宣言の順序が使用されます。

挿入時と同様に、Scan メソッドには適切な型のターゲット変数が必要です。ここでも柔軟に扱えるようになっており、精度損失が発生しない限りにおいて、可能な場合には型変換が行われます。たとえば、上記の例では UUID カラムが文字列型の変数に読み込まれています。各 Column 型に対してサポートされている Go 型の全一覧については、[Type Conversions](#type-conversions) を参照してください。

最後に、`Query` および `QueryRow` メソッドに `Context` を渡すことができる点に注意してください。これはクエリレベルの設定に利用できます。詳細については [Using Context](#using-context) を参照してください。


### 非同期挿入

非同期挿入は Async メソッドで利用できます。これにより、クライアントがサーバー側で挿入処理の完了を待機するか、データが受信された時点で応答を返すかを指定できます。これは実質的にパラメータ [wait&#95;for&#95;async&#95;insert](/operations/settings/settings#wait_for_async_insert) の挙動を制御します。

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
    )`, i, "Golang SQLデータベースドライバー"), false); err != nil {
        return err
    }
}
```

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/async.go)


### カラム単位の挿入

データはカラム形式で挿入できます。データがすでにこの構造で用意されている場合、行形式への変換が不要になるため、パフォーマンス上の利点が得られることがあります。

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
    col2 = append(col2, "Golang SQLデータベースドライバー")
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

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/columnar_insert.go)


### struct の使用 {#using-structs}

ユーザーにとって、Go 言語の struct は ClickHouse における 1 行分のデータを論理的に表現する手段となります。これを支援するために、ネイティブインターフェイスはいくつかの便利な関数を提供しています。

#### serialize を使用した Select

Select メソッドを使うと、1 回の呼び出しでレスポンスの行セットを構造体のスライスへマーシャリングできます。

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


#### 構造体のスキャン

`ScanStruct` を使用すると、クエリ結果の単一の Row を構造体にマッピングできます。

```go
var result struct {
    Col1  int64
    Count uint64 `ch:"count"`
}
if err := conn.QueryRow(context.Background(), "SELECT Col1, COUNT() AS count FROM example WHERE Col1 = 5 GROUP BY Col1").ScanStruct(&result); err != nil {
    return err
}
```

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/scan_struct.go)


#### Append struct

`AppendStruct` を使用すると、既存の[バッチ](#batch-insert)に構造体を追加し、それを 1 行分の完全なレコードとして解釈できます。これには、構造体の列がテーブルの列と名前・型の両方で一致している必要があります。すべての列に対応する構造体フィールドが存在している必要がありますが、一部の構造体フィールドには対応する列が存在しない場合があります。そのようなフィールドは単に無視されます。

```go
batch, err := conn.PrepareBatch(context.Background(), "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

for i := 0; i < 1_000; i++ {
    err := batch.AppendStruct(&row{
        Col1:       uint64(i),
        Col2:       "Golang SQLデータベースドライバー",
        Col3:       []uint8{1, 2, 3, 4, 5, 6, 7, 8, 9},
        Col4:       time.Now(),
        ColIgnored: "これは無視されます",
    })
    if err != nil {
        return err
    }
}
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/append_struct.go)


### 型変換 {#type-conversions}

このクライアントは、挿入およびレスポンスのマーシャリングの両方において、受け付ける変数の型に関して可能な限り柔軟であることを目指しています。ほとんどの場合、ClickHouse のカラム型には対応する Go 言語の型が存在します。例えば、[UInt64](/sql-reference/data-types/int-uint/) に対する [uint64](https://pkg.go.dev/builtin#uint64) などです。これらの論理的なマッピングは常にサポートされるべきです。ユーザーは、変数または受信データの変換が先に行われるのであれば、カラムへの挿入やレスポンスの受け取りに利用できる別の型を使用したい場合があります。クライアントは、ユーザーが挿入前にデータを厳密に変換する必要がないように、またクエリ実行時に柔軟なマーシャリングを提供できるように、これらの変換を透過的にサポートすることを目指しています。この透過的な変換では精度の損失は許可されません。例えば、`uint32` を使用して `UInt64` カラムからデータを受け取ることはできません。一方、フォーマット要件を満たしている限り、`string` を `datetime64` フィールドに挿入することは可能です。

現在、プリミティブ型に対してサポートされている型変換は [こちら](https://github.com/ClickHouse/clickhouse-go/blob/main/TYPES.md) にまとまっています。

この対応は継続中であり、挿入時（`Append` / `AppendRow`）と読み取り時（`Scan` を通じて）に分けて検討されています。特定の変換に対するサポートが必要な場合は、issue を作成してください。

### 複合データ型 {#complex-types}

#### Date/DateTime types {#datedatetime-types}

ClickHouse の Go クライアントは、`Date`、`Date32`、`DateTime`、`DateTime64` の日付/日時型をサポートしています。日付は、`2006-01-02` 形式の文字列として、またはネイティブな Go の `time.Time{}` もしくは `sql.NullTime` を用いて挿入できます。DateTime 型も同様にこれらの型をサポートしますが、文字列で渡す場合は `2006-01-02 15:04:05` 形式に従い、オプションでタイムゾーンオフセット（例: `2006-01-02 15:04:05 +08:00`）を指定する必要があります。`time.Time{}` と `sql.NullTime` は、`sql.Scanner` インターフェースを実装した任意の型と同様に、読み取り時にもサポートされます。

タイムゾーン情報の扱いは、ClickHouse の型と、その値が挿入されるのか読み取られるのかによって異なります。

* **DateTime/DateTime64**
  * **挿入** 時には、値は Unix タイムスタンプ形式で ClickHouse に送信されます。タイムゾーンが指定されていない場合、クライアントはクライアントのローカルタイムゾーンを仮定します。`time.Time{}` または `sql.NullTime` は、それに応じてエポックに変換されます。
  * **select** 時には、`time.Time` 値を返す際に、カラムにタイムゾーンが設定されていればそのタイムゾーンが使用されます。設定されていない場合は、サーバーのタイムゾーンが使用されます。
* **Date/Date32**
  * **挿入** 時には、任意の日付について、その日付を Unix タイムスタンプに変換する際にタイムゾーンが考慮されます。つまり、Date 型にはロケール情報がないため、日付として保存する前に、そのタイムゾーンを考慮してオフセットされます。文字列値でタイムゾーンが明示されていない場合は、ローカルタイムゾーンが使用されます。
  * **select** 時には、日付は `time.Time{}` または `sql.NullTime{}` インスタンスにスキャンされ、タイムゾーン情報なしで返されます。

#### Array

配列はスライスとして挿入する必要があります。要素の型付けのルールは [primitive type](#type-conversions) の場合と同じであり、可能な場合は要素が変換されます。

Scan 時には、スライスへのポインタを渡す必要があります。

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

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/array.go)


#### Map

Map 型の値は、キーと値が[前述](#type-conversions)の型ルールに従う Golang の map として挿入します。

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


#### Tuples

Tuple は任意の長さのカラムのグループを表します。各カラムは明示的に名前を付けることも、型だけを指定することもできます（例: ）。

```sql
//名前なし
Col1 Tuple(String, Int64)

//名前付き
Col2 Tuple(name String, id Int64, age uint8)
```

これらのアプローチの中では、名前付きタプルの方が柔軟に扱えます。名前なしタプルはスライスを使って挿入および読み取りを行う必要がありますが、名前付きタプルはマップとも互換性があります。

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

// 名前付きと名前なしの両方をスライスで追加できます。すべての要素が同じ型である場合、強く型付けされたリストとマップを使用できます
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
// 名前付きタプルはマップまたはスライスに取得できます。名前なしタプルはスライスのみです
if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2, &col3); err != nil {
    return err
}
fmt.Printf("row: col1=%v, col2=%v, col3=%v\n", col1, col2, col3)
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/tuple.go)

注意: 名前付きタプル内のサブカラムがすべて同じ型である場合、型付きスライスおよびマップがサポートされます。


#### Nested

Nested フィールドは、名前付き Tuple の配列に相当します。利用方法は、ユーザーが [flatten&#95;nested](/operations/settings/settings#flatten_nested) を 1 にしているか 0 にしているかによって異なります。

flatten&#95;nested を 0 に設定すると、Nested カラムは単一のタプル配列のまま保持されます。これにより、ユーザーは挿入および取得にマップのスライスを使用でき、任意のレベルのネストが可能になります。以下の例に示すように、マップのキーはカラム名と同一でなければなりません。

注: マップはタプルを表すため、型は `map[string]interface{}` である必要があります。値には現在、厳密な型付けは行われていません。

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

[完全な例 - `flatten_tested=0`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L28-L118)

`flatten_nested` のデフォルト値 1 を使用すると、ネストされたカラムは個別の配列に展開されます。これには、挿入および取得時にネストしたスライスを使用する必要があります。任意の深さのネストも動作する可能性はありますが、これは公式にはサポートされていません。


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
```

[完全なサンプル - `flatten_nested=1`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L123-L180)

注意：ネストされたカラムは同じ次元を持つ必要があります。たとえば上記の例では、`Col_2_2` と `Col_2_1` は同じ要素数でなければなりません。

よりシンプルなインターフェースとネストに対する公式なサポートがあるため、`flatten_nested=0` の使用を推奨します。


#### Geo 型

クライアントは Geo 型である Point、Ring、Polygon、Multi Polygon をサポートしています。これらのフィールドは、Go 言語ではパッケージ [github.com/paulmach/orb](https://github.com/paulmach/orb) を使用して表現されます。

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


#### UUID

UUID 型は [github.com/google/uuid](https://github.com/google/uuid) パッケージでサポートされています。また、UUID は文字列、または `sql.Scanner` もしくは `Stringify` を実装する任意の型として送信およびマーシャリングすることもできます。

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

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/uuid.go)


#### Decimal

Decimal 型は [github.com/shopspring/decimal](https://github.com/shopspring/decimal) パッケージによってサポートされています。

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

if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2, &col3, &col4, &col5); err != nil {
    return err
}
fmt.Printf("col1=%v, col2=%v, col3=%v, col4=%v, col5=%v\n", col1, col2, col3, col4, col5)
```

[完全なサンプルコード](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/decimal.go)


#### Nullable

`Nil` の Go 値は ClickHouse の `NULL` を表します。これはフィールドが `Nullable` として宣言されている場合に使用できます。挿入時には、非 Nullable のカラムと Nullable のカラムの両方に対して `Nil` を渡すことができます。前者の場合、その型のデフォルト値が永続化されます（例: `string` 型であれば空文字列）。後者の Nullable カラムの場合は、ClickHouse に `NULL` 値が保存されます。

Scan 時には、ユーザーは Nullable フィールドの nil 値を表現するために、`*string` のような nil を取り得る型へのポインタを渡す必要があります。以下の例では、`Nullable(String)` である `col1` は二重ポインタである `**string` を受け取ります。これにより nil を表現できるようになります。

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
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nullable.go)

クライアントはこれに加えて、`sql.Null*` 型（例: `sql.NullInt64`）もサポートしています。これらは対応する ClickHouse の型と互換性があります。


#### ビッグ整数 - Int128, Int256, UInt128, UInt256

64 ビットを超える数値型は、Go 標準の [big](https://pkg.go.dev/math/big) パッケージで表現されます。

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

if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2, &col3, &col4, &col5, &col6, &col7); err != nil {
    return err
}
fmt.Printf("col1=%v, col2=%v, col3=%v, col4=%v, col5=%v, col6=%v, col7=%v\n", col1, col2, col3, col4, col5, col6, col7)
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/big_int.go)


### 圧縮

サポートされる圧縮方式は、使用する下位プロトコルに依存します。ネイティブプロトコルの場合、クライアントは `LZ4` と `ZSTD` 圧縮をサポートします。圧縮はブロックレベルでのみ行われます。接続に `Compression` 設定を含めることで圧縮を有効にできます。

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

標準インターフェースを HTTP 経由で使用する場合は、追加の圧縮方式を利用できます。詳細は [database/sql API - Compression](#compression) を参照してください。


### パラメータバインディング

クライアントは `Exec`、`Query`、`QueryRow` メソッドに対してパラメータバインディングをサポートします。次の例のように、名前付きパラメータ、番号付きパラメータ、位置パラメータを利用できます。以下でそれぞれの例を示します。

```go
var count uint64
// 位置バインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 >= ? AND Col3 < ?", 500, now.Add(time.Duration(750)*time.Second)).Scan(&count); err != nil {
    return err
}
// 250
fmt.Printf("位置バインドのカウント: %d\n", count)
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

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind.go)


#### 特殊なケース

デフォルトでは、スライスをクエリのパラメータとして渡した場合、値のカンマ区切りリストに展開されます。角括弧 `[ ]` で囲まれた値の集合として埋め込みたい場合は、`ArraySet` を使用する必要があります。

グループやタプルが必要で、たとえば IN 演算子で使用するために丸括弧 `( )` で囲む必要がある場合は、`GroupSet` を使用できます。これは、以下の例で示すように、複数のグループが必要なケースで特に有用です。

最後に、`DateTime64` フィールドでは、パラメータが適切にレンダリングされるように精度を指定する必要があります。ただしクライアント側ではそのフィールドの精度レベルが不明なため、ユーザーがそれを指定しなければなりません。そのために、`DateNamed` パラメータを用意しています。

```go
var count uint64
// 配列は展開されます
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN (?)", []int{100, 200, 300, 400, 500}).Scan(&count); err != nil {
    return err
}
fmt.Printf("配列展開後のカウント: %d\n", count)
// 配列は [] で保持されます
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col4 = ?", clickhouse.ArraySet{300, 301}).Scan(&count); err != nil {
    return err
}
fmt.Printf("配列のカウント: %d\n", count)
// グループセットを使用すると ( ) リストを形成できます
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN ?", clickhouse.GroupSet{[]interface{}{100, 200, 300, 400, 500}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("グループのカウント: %d\n", count)
// ネストが必要な場合に便利です
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE (Col1, Col5) IN (?)", []clickhouse.GroupSet{{[]interface{}{100, 101}}, {[]interface{}{200, 201}}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("グループのカウント: %d\n", count)
// 時刻の精度が必要な場合は DateNamed を使用してください
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col3 >= @col3", clickhouse.DateNamed("col3", now.Add(time.Duration(500)*time.Millisecond), clickhouse.NanoSeconds)).Scan(&count); err != nil {
    return err
}
fmt.Printf("NamedDate のカウント: %d\n", count)
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind_special.go)


### コンテキストの利用

Go の context は、期限（デッドライン）、キャンセルシグナル、その他のリクエストスコープの値を API 境界をまたいで受け渡す手段を提供します。コネクションのすべてのメソッドは、最初の引数として context を受け取ります。前の例では `context.Background()` を使用していましたが、この仕組みを利用して設定やデッドラインを渡したり、クエリをキャンセルしたりできます。

`withDeadline` で作成した context を渡すと、クエリに対して実行時間の制限を設定できます。これは絶対時刻である点に注意してください。期限切れになった場合は、接続が解放され、ClickHouse にキャンセルシグナルが送信されるだけです。明示的にクエリをキャンセルしたい場合は、代わりに `WithCancel` を使用できます。

ヘルパー `clickhouse.WithQueryID` および `clickhouse.WithQuotaKey` を使用すると、クエリ ID とクオータキーを指定できます。クエリ ID は、ログ内でクエリを追跡したり、キャンセルに利用したりする場合に有用です。クオータキーは、一意なキー値に基づいて ClickHouse の利用に制限を課すために使用できます。詳細は [Quotas Management ](/operations/access-rights#quotas-management) を参照してください。

また、ユーザーは context を利用して、特定のクエリに対してのみ設定を適用し、[Connection Settings](#connection-settings) に示すようにコネクション全体には適用しないようにすることもできます。

最後に、`clickhouse.WithBlockSize` を使用してブロックバッファのサイズを制御できます。これはコネクションレベルの設定 `BlockBufferSize` を上書きし、ある時点でデコードされメモリ上に保持されるブロックの最大数を制御します。値を大きくすると、メモリ使用量と引き換えに、より高い並列化が可能になる場合があります。

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
// コンテキストを使用して特定のAPI呼び出しに設定を渡すことができます
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "allow_experimental_object_type": "1",
}))

conn.Exec(ctx, "DROP TABLE IF EXISTS example")

// JSON列を作成するには allow_experimental_object_type=1 が必要です
if err = conn.Exec(ctx, `
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
if err = conn.QueryRow(ctx, "SELECT sleep(3)").Scan(); err == nil {
    return fmt.Errorf("キャンセルされることを期待")
}

// クエリのデッドラインを設定します - 指定時刻に達するとクエリがキャンセルされます。
// ClickHouse内ではクエリは完了まで継続されます
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.Ping(ctx); err == nil {
    return fmt.Errorf("デッドライン超過を期待")
}

// ログ内でクエリをトレースするためにクエリIDを設定します(例: system.query_log を参照)
var one uint8
queryId, _ := uuid.NewUUID()
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
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/context.go)


### 進捗 / プロファイル / ログ情報

クエリに対して、Progress、Profile、Log の情報を要求できます。Progress 情報は、ClickHouse 内で読み取りおよび処理された行数とバイト数に関する統計を報告します。一方、Profile 情報はクライアントに返されたデータの概要を提供し、（非圧縮の）バイト数、行数、およびブロック数の合計を含みます。最後に、Log 情報は、メモリ使用量やデータ処理速度などのスレッドに関する統計を提供します。

この情報を取得するには、ユーザーは [Context](#using-context) を使用し、その Context にコールバック関数を渡す必要があります。

```go
totalRows := uint64(0)
// コンテキストを使用して進捗状況とプロファイル情報のコールバックを渡す
ctx := clickhouse.Context(context.Background(), clickhouse.WithProgress(func(p *clickhouse.Progress) {
    fmt.Println("進捗状況: ", p)
    totalRows += p.Rows
}), clickhouse.WithProfileInfo(func(p *clickhouse.ProfileInfo) {
    fmt.Println("プロファイル情報: ", p)
}), clickhouse.WithLogs(func(log *clickhouse.Log) {
    fmt.Println("ログ情報: ", log)
}))

rows, err := conn.Query(ctx, "SELECT number from numbers(1000000) LIMIT 1000000")
if err != nil {
    return err
}
for rows.Next() {
}

fmt.Printf("合計行数: %d\n", totalRows)
rows.Close()
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/progress.go)


### 動的スキャン

返されるフィールドのスキーマや型が分からないテーブルを読み取る必要がある場合があります。これは、アドホックなデータ分析を行う場合や、汎用的なツールを作成する場合によくあります。そのため、クエリのレスポンスには列の型情報が含まれています。これを Go のリフレクションと組み合わせることで、実行時に正しい型の変数インスタンスを生成し、それらを Scan に渡すことができます。

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


### 外部テーブル

[外部テーブル](/engines/table-engines/special/external-data/) を使用すると、クライアントは SELECT クエリとともにデータを ClickHouse に送信できます。このデータは一時テーブルに格納され、評価のためにクエリ自体の中で使用できます。

クエリとともに外部データを ClickHouse に送信するには、コンテキスト経由で渡す前に `ext.NewTable` を使って外部テーブルを作成しておく必要があります。

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

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/external_data.go)


### OpenTelemetry

ClickHouse では、ネイティブプロトコルの一部として [トレースコンテキスト](/operations/opentelemetry/) を渡せます。クライアントは、関数 `clickhouse.withSpan` を使用して Span を作成し、これを Context 経由で渡すことで、この機能を利用できます。

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

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/open_telemetry.go)

トレーシングの活用方法の詳細については、[OpenTelemetry サポート](/operations/opentelemetry/)をご覧ください。


## Database/SQL API {#databasesql-api}

`database/sql` や「標準」API は、標準インターフェイスに従うことで、アプリケーションコードを基盤となるデータベースに依存させずにクライアントを利用できるようにします。これは、追加の抽象化レイヤーや間接参照、さらに ClickHouse と必ずしも整合しないプリミティブを導入するというコストを伴います。しかし、ツールが複数のデータベースへ接続する必要があるようなシナリオでは、これらのコストは通常は許容可能です。

さらに、このクライアントはトランスポート層として HTTP の利用をサポートしています。データは引き続き、最適なパフォーマンスのためにネイティブ形式でエンコードされます。

以下では、ClickHouse API のドキュメント構成を踏襲することを目指します。

標準 API 向けの完全なコード例は[こちら](https://github.com/ClickHouse/clickhouse-go/tree/main/examples/std)で確認できます。

### 接続

接続は、`clickhouse://<host>:<port>?<query_option>=<value>` という形式の DSN 文字列と `Open` メソッドを使用するか、`clickhouse.OpenDB` メソッドを使用することで行えます。後者は `database/sql` 仕様の一部ではありませんが、`sql.DB` インスタンスを返します。このメソッドでは、`database/sql` 仕様では明確な公開手段がないプロファイリングなどの機能も利用できます。

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

**以降のすべてのサンプルでは、特に断りのない限り、ClickHouse の `conn` 変数はすでに作成されており、利用可能であるものとします。**


#### 接続設定

以下のパラメータを DSN 文字列で指定できます:

* `hosts` - ロードバランシングおよびフェイルオーバー用の、単一アドレスのホストをカンマ区切りで並べたリスト - [複数ノードへの接続](#connecting-to-multiple-nodes) を参照。
* `username/password` - 認証クレデンシャル - [認証](#authentication) を参照
* `database` - 現在のデフォルトデータベースを選択
* `dial_timeout` - 期間を表す文字列。符号付きの 10 進数の並びで構成され、それぞれは任意の小数部および `300ms` や `1s` のような単位サフィックスを持つことができます。有効な時間単位は `ms`、`s`、`m` です。
* `connection_open_strategy` - `random/in_order`（デフォルトは `random`） - [複数ノードへの接続](#connecting-to-multiple-nodes) を参照
  * `round_robin` - セット内からラウンドロビンでサーバーを選択
  * `in_order` - 指定された順序で、最初に稼働中のサーバーを選択
* `debug` - デバッグ出力を有効化（ブール値）
* `compress` - 圧縮アルゴリズムを指定 - `none`（デフォルト）、`zstd`、`lz4`、`gzip`、`deflate`、`br`。`true` に設定した場合は `lz4` が使用されます。ネイティブ通信では `lz4` と `zstd` のみがサポートされます。
* `compress_level` - 圧縮レベル（デフォルトは `0`）。圧縮については Compression を参照。これはアルゴリズム固有です:
  * `gzip` - `-2`（最高速度）から `9`（最高圧縮率）
  * `deflate` - `-2`（最高速度）から `9`（最高圧縮率）
  * `br` - `0`（最高速度）から `11`（最高圧縮率）
  * `zstd`、`lz4` - 無視されます
* `secure` - セキュアな SSL 接続を確立（デフォルトは `false`）
* `skip_verify` - 証明書検証をスキップ（デフォルトは `false`）
* `block_buffer_size` - ブロックバッファサイズを制御できます。[`BlockBufferSize`](#connection-settings) を参照。（デフォルトは `2`）

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

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect_settings.go)


#### 接続プーリング {#connection-pooling-1}

ユーザーは、[複数ノードへの接続](#connecting-to-multiple-nodes)で説明されているように、提供されたノードアドレス一覧の使われ方を制御できます。ただし、接続管理およびプーリングは、設計上 `sql.DB` に委任されています。

#### HTTP 経由で接続する

デフォルトでは、接続はネイティブプロトコルで確立されます。HTTP を利用する必要がある場合は、DSN を変更して HTTP プロトコルを指定するか、接続オプションで Protocol を指定して有効化できます。

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

[完全なサンプルコード](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect_http.go)


#### 複数ノードへの接続

`OpenDB` を使用する場合は、ClickHouse API と同じオプション指定方法で複数のホストに接続し、必要に応じて `ConnOpenStrategy` を指定します。

DSN ベースの接続では、DSN 文字列で複数のホストを指定できるほか、`connection_open_strategy` パラメータに `round_robin` または `in_order` の値を設定できます。

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

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/multi_host.go)


### TLS の使用

DSN 接続文字列を使用する場合は、パラメータ `secure=true` によって SSL を有効化できます。`OpenDB` メソッドは、非 nil の TLS struct を指定するという点で、[TLS 用のネイティブ API](#using-tls) と同じアプローチを取ります。DSN 接続文字列では SSL 検証をスキップするためのパラメータ `skip_verify` がサポートされていますが、より高度な TLS 設定を行うには、設定を渡すことができる `OpenDB` メソッドを使用する必要があります。

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


### 認証

`OpenDB` を使用する場合は、通常どおりオプションで認証情報を渡すことができます。DSN ベースの接続の場合、ユーザー名とパスワードは接続文字列内で指定できます。パラメーターとして渡すか、アドレスに資格情報としてエンコードして含めることができます。

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


### 実行

接続を取得したら、ユーザーは Exec メソッドで `sql` ステートメントを実行できます。

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

このメソッドは context の受け取りをサポートしていません。デフォルトでは background context で実行されます。必要な場合は `ExecContext` を使用してください。詳しくは [Using Context](#using-context) を参照してください。


### バッチ挿入

バッチ挿入は、`Being` メソッドで `sql.Tx` を作成することで実現できます。そこから、`INSERT` 文を指定して `Prepare` メソッドを呼び出すことでバッチを取得できます。これにより `sql.Stmt` が返され、`Exec` メソッドを使って行を追加していくことができます。バッチは、元の `sql.Tx` に対して `Commit` が実行されるまでメモリ上に蓄積されます。

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

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/batch.go)


### 行のクエリ実行

単一行のクエリは `QueryRow` メソッドを使って実行できます。これは *sql.Row を返し、その上で `Scan` をポインタを渡した変数に対して呼び出すことで、列の値をそれらの変数に詰め替えることができます。`QueryRowContext` バリアントを使用すると、バックグラウンド以外の context を渡すことができます。詳しくは [Using Context](#using-context) を参照してください。

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

複数行をイテレートするには `Query` メソッドを使用します。これは `*sql.Rows` 構造体を返し、その上で `Next` を呼び出して行を順に処理できます。`QueryContext` メソッドを使うと、context を渡すことができます。

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

[完全なコード例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/query_rows.go)


### 非同期 Insert

非同期 insert は、`ExecContext` メソッドで insert を実行することで実現できます。その際、以下の例のように非同期モードを有効にした context を渡す必要があります。これにより、クライアントがサーバーによる insert の完了を待つか、データが受信された時点で応答するかをユーザーが指定できるようになります。これは実質的にパラメータ [wait&#95;for&#95;async&#95;insert](/operations/settings/settings#wait_for_async_insert) を制御します。

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
        )`, i, "Golang SQLデータベースドライバー"))
        if err != nil {
            return err
        }
    }
}
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/async.go)


### 列指向挿入 {#columnar-insert-1}

標準インターフェースではサポートされていません。

### struct の使用 {#using-structs-1}

標準インターフェースでは利用できません。

### 型変換 {#type-conversions-1}

標準の `database/sql` インターフェイスは、[ClickHouse API](#type-conversions) と同じ型をサポートします。主に複合型に関していくつかの例外があり、それらを以下で説明します。ClickHouse API と同様に、このクライアントはデータ挿入とレスポンスのマーシャリングの両方において、受け付ける型に関して可能な限り柔軟であることを目指しています。詳細については [型変換](#type-conversions) を参照してください。

### 複合型 {#complex-types-1}

特に断りがない限り、複合型の扱いは [ClickHouse API](#complex-types) と同様です。差異は `database/sql` の内部実装によるものです。

#### マップ

ClickHouse の API と異なり、標準 API ではマップに対してスキャン時の型を厳密に指定する必要があります。例えば、`Map(String,String)` フィールドに `map[string]interface{}` を渡すことはできず、代わりに `map[string]string` を使用する必要があります。`interface{}` 変数は常に互換性があり、より複雑な構造に利用できます。構造体は読み取り時にはサポートされません。

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

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/map.go)

Insert の動作は ClickHouse API と同じです。


### 圧縮

標準 API は、ネイティブの [ClickHouse API](#compression) と同じ圧縮アルゴリズムをサポートしており、ブロック単位の `lz4` および `zstd` 圧縮を利用できます。さらに、HTTP 接続では gzip、deflate、br 圧縮もサポートされます。これらのいずれかが有効になっている場合、挿入時およびクエリレスポンスに対してブロック単位で圧縮が行われます。その他のリクエスト（例：ping リクエストやクエリの送信）は非圧縮のままです。これは `lz4` および `zstd` オプションの挙動と一貫しています。

接続確立に `OpenDB` メソッドを使用する場合は、Compression 設定を渡すことができます。ここでは圧縮レベルの指定も可能です（下記参照）。DSN を指定して `sql.Open` で接続する場合は、パラメータ `compress` を使用します。これは特定の圧縮アルゴリズム（例：`gzip`、`deflate`、`br`、`zstd`、`lz4`）か、もしくは真偽値フラグを指定できます。true に設定した場合は `lz4` が使用されます。デフォルトは `none`、すなわち圧縮は無効です。

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

適用される圧縮レベルは、DSN パラメータ `compress_level` または Compression オプションの `Level` フィールドで制御できます。既定値は 0 ですが、アルゴリズムごとに仕様が異なります:

* `gzip` - `-2` (最高速) から `9` (最高圧縮)
* `deflate` - `-2` (最高速) から `9` (最高圧縮)
* `br` - `0` (最高速) から `11` (最高圧縮)
* `zstd`, `lz4` - 無視されます


### パラメータバインディング

標準 API では [ClickHouse API](#parameter-binding) と同じパラメータバインディング機能がサポートされており、`Exec`、`Query`、`QueryRow` メソッド（およびそれらに対応する [Context](#using-context) 版）にパラメータを渡すことができます。位置指定パラメータ、名前付きパラメータ、および番号付きパラメータがサポートされています。

```go
var count uint64
// 位置バインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 >= ? AND Col3 < ?", 500, now.Add(time.Duration(750)*time.Second)).Scan(&count); err != nil {
    return err
}
// 250
fmt.Printf("位置バインドのカウント: %d\n", count)
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

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/bind.go)

なお、[特殊ケース](#special-cases) は引き続き有効です。


### コンテキストの使用

標準 API は、[ClickHouse API](#using-context) と同様に、コンテキストを介して期限、キャンセルシグナル、その他のリクエストスコープの値を渡す機能をサポートします。ClickHouse API と異なり、これはメソッドの `Context` 付きバリアントを使用することで実現されます。つまり、デフォルトではバックグラウンドコンテキストを使用する `Exec` のようなメソッドには、最初の引数としてコンテキストを渡せる `ExecContext` というバリアントが用意されています。これにより、アプリケーションフローの任意の段階でコンテキストを渡すことができます。例えば、`ConnContext` を使用して接続を確立する際や、`QueryRowContext` を使用してクエリの行を取得する際にコンテキストを渡すことができます。利用可能なすべてのメソッドの例を以下に示します。

コンテキストを使用して期限、キャンセルシグナル、クエリ ID、クオータキーおよび接続設定を渡す方法の詳細については、[ClickHouse API](#using-context) におけるコンテキストの使用に関するセクションを参照してください。

```go
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "allow_experimental_object_type": "1",
}))
conn.ExecContext(ctx, "DROP TABLE IF EXISTS example")
// JSON列を作成するには allow_experimental_object_type=1 が必要です
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

// クエリのデッドラインを設定します - 絶対時刻に達した後にクエリをキャンセルします。これも接続のみを終了し、
// クエリはClickHouse内で完了まで継続されます
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.PingContext(ctx); err == nil {
    return fmt.Errorf("expected deadline exceeeded")
}

// ログ内でクエリをトレースするためにクエリIDを設定します(例: system.query_logを参照)
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
if _, err = conn.ExecContext(ctx, "CREATE QUOTA IF NOT EXISTS foobar KEYED BY client_key FOR INTERVAL 1 minute MAX queries = 5 TO default"); err != nil {
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
```

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/context.go)


### セッション

ネイティブ接続では暗黙的にセッションが存在しますが、HTTP 経由の接続では、コンテキストを設定として渡すためにユーザーがセッション ID を作成する必要があります。これにより、セッションに紐づく一時テーブルなどの機能を利用できるようになります。

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
```

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/session.go)


### 動的スキャン

[ClickHouse API](#dynamic-scanning) と同様に、カラム型の情報を利用できるため、ユーザーは実行時に正しい型の変数のインスタンスを作成し、それを Scan に渡すことができます。これにより、事前に型が分からないカラムでも読み取ることが可能になります。

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

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/dynamic_scan_types.go)


### 外部テーブル

[外部テーブル](/engines/table-engines/special/external-data/) を使用すると、クライアントは `SELECT` クエリと一緒にデータを ClickHouse に送信できます。このデータは一時テーブルに格納され、クエリ内で評価に利用できます。

クエリとともに外部データを送信するには、ユーザーはコンテキスト経由で渡す前に `ext.NewTable` を使って外部テーブルを作成する必要があります。

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

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/external_data.go)


### OpenTelemetry

ClickHouse では、ネイティブプロトコルの一部として [trace context](/operations/opentelemetry/) を渡すことが可能です。クライアントは、関数 `clickhouse.withSpan` を使用して Span を作成し、Context 経由で渡すことでこれを実現できます。この機能は、HTTP をトランスポートとして使用している場合にはサポートされません。

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

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/open_telemetry.go)


## パフォーマンスのヒント {#performance-tips}

* 可能な限り、特にプリミティブ型については ClickHouse API を利用してください。これにより、大きなオーバーヘッドを伴うリフレクションや間接参照を避けられます。
* 大きなデータセットを読み込む場合は、[`BlockBufferSize`](#connection-settings) の変更を検討してください。これはメモリ使用量を増加させますが、行のイテレーション時に、より多くのブロックを並列にデコードできるようになります。デフォルト値の 2 は保守的な設定で、メモリのオーバーヘッドを最小限に抑えます。より大きな値にすると、メモリ上のブロック数が増加します。クエリによって生成されるブロックサイズが異なるため、テストが必要です。そのため、Context を介して[クエリ単位](#using-context)で設定できます。
* データを挿入する際は、型を明示的に指定してください。クライアントは、たとえば UUID や IP に対して文字列のパースを許可するなど、柔軟に扱えるよう設計されていますが、これはデータ検証を必要とし、挿入時のコスト増につながります。
* 可能な限り列指向の INSERT を使用してください。この場合も、強く型付けされた形式とし、クライアントによる値の変換が不要になるようにします。
* 最適な INSERT パフォーマンスのために、ClickHouse の[推奨事項](/sql-reference/statements/insert-into/#performance-considerations)に従ってください。