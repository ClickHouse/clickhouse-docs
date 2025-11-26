---
sidebar_label: 'Go'
sidebar_position: 1
keywords: ['clickhouse', 'go', 'client', 'golang']
slug: /integrations/go
description: 'ClickHouse 用 Go クライアントを使用すると、Go 標準の database/sql インターフェイスまたは最適化されたネイティブインターフェイス経由で ClickHouse に接続できます。'
title: 'ClickHouse Go'
doc_type: 'reference'
integration:
  - support_level: 'core'
  - category: 'language_client'
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_native.md';


# ClickHouse Go



## 簡単な例

まずは、簡単な Go の例から始めます。これは ClickHouse に接続し、`system` データベースに対して `SELECT` を実行します。作業を始めるにあたっては、接続情報が必要です。

### 接続情報

<ConnectionDetails />

### モジュールの初期化

```bash
mkdir clickhouse-golang-example
cd clickhouse-golang-example
go mod init clickhouse-golang-example
```

### サンプルコードをコピーする

次のコードを `clickhouse-golang-example` ディレクトリ内に `main.go` としてコピーします。

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

### go mod tidy を実行

```bash
go mod tidy
```

### 接続情報を設定する

前の手順で接続情報を確認しました。`main.go` の `connect()` 関数内でそれらを設定します。

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

### さらに詳しく

このカテゴリの他のドキュメントでは、ClickHouse Go クライアントの詳細について説明します。


## ClickHouse Go クライアント {#clickhouse-go-client}

ClickHouse は 2 つの公式 Go クライアントをサポートしています。これらのクライアントは補完的な関係にあり、意図的に異なるユースケースをサポートしています。

* [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) - Go の標準である `database/sql` インターフェイスまたはネイティブインターフェイスのいずれかをサポートする高レベル言語クライアント。
* [ch-go](https://github.com/ClickHouse/ch-go) - 低レベルクライアント。ネイティブインターフェイスのみをサポート。

clickhouse-go は高レベルインターフェイスを提供しており、ユーザーは行指向のセマンティクスとバッチ処理を用いてクエリの実行およびデータの挿入を行えます。この際、データ型に対しては寛容であり、精度損失が発生しない限り値は変換されます。一方 ch-go は、型の厳密さとより複雑な利用方法と引き換えに、CPU およびメモリのオーバーヘッドが低く高速なデータブロックストリーミングを提供する、最適化された列指向インターフェイスを提供します。

バージョン 2.3 以降、clickhouse-go はエンコード、デコード、圧縮といった低レベル処理に ch-go を利用します。なお、clickhouse-go は Go の `database/sql` インターフェイス標準もサポートしています。両クライアントは、最適なパフォーマンスを提供するためエンコードにネイティブ形式を使用し、ネイティブ ClickHouse プロトコルで通信できます。さらに clickhouse-go は、トラフィックのプロキシやロードバランシングが必要なケース向けに HTTP をトランスポート機構としてもサポートします。

クライアントライブラリを選択する際は、それぞれの長所と短所を把握しておく必要があります。詳細は「Choosing a Client Library」を参照してください。

|               | ネイティブ形式 | ネイティブプロトコル | HTTP プロトコル | 行指向 API | 列指向 API | 型の柔軟性 | 圧縮 | クエリプレースホルダー |
|:-------------:|:-------------:|:---------------:|:-------------:|:------------------:|:---------------------:|:----------------:|:-----------:|:------------------:|
| clickhouse-go |       ✅       |        ✅        |       ✅       |          ✅         |           ✅           |         ✅        |      ✅      |          ✅         |
|     ch-go     |       ✅       |        ✅        |               |                    |           ✅           |                  |      ✅      |                    |



## クライアントの選択 {#choosing-a-client}

クライアントライブラリの選択は、利用パターンと求める性能要件によって異なります。1 秒あたり数百万件規模の大量インサートを行うユースケースでは、低レベルクライアントである [ch-go](https://github.com/ClickHouse/ch-go) の使用を推奨します。このクライアントは、ClickHouse ネイティブフォーマットが要求する列指向フォーマットに合わせるために、行指向フォーマットからデータを変換する際に発生するオーバーヘッドを回避します。さらに、使いやすさのためにリフレクションや `interface{}`（`any`）型の利用も避けています。

集計中心のクエリワークロードや、インサートのスループット要件がそれほど高くないワークロードの場合には、[clickhouse-go](https://github.com/ClickHouse/clickhouse-go) が、馴染みのある `database/sql` インターフェイスと、より扱いやすい行ベースのセマンティクスを提供します。ユーザーはオプションで HTTP をトランスポートプロトコルとして利用でき、構造体と行との相互変換を支援するヘルパー関数を活用できます。



## clickhouse-go クライアント {#the-clickhouse-go-client}

clickhouse-go クライアントは、ClickHouse と通信するために 2 種類の API インターフェースを提供します。

* ClickHouse クライアント専用 API
* `database/sql` 標準 - Go 言語が提供する、SQL データベース向けの汎用インターフェース

`database/sql` はデータベースに依存しないインターフェースを提供し、開発者がデータストアを抽象化できるようにしますが、パフォーマンスに影響しうる型やクエリセマンティクスに関する制約を課します。このため、[パフォーマンスが重要な場合](https://github.com/clickHouse/clickHouse-go#benchmark)には、クライアント専用 API を使用することを推奨します。ただし、複数のデータベースをサポートするツールに ClickHouse を統合したいユーザーは、標準インターフェースを使用することを好む場合があります。

どちらのインターフェースも、[ネイティブフォーマット](/native-protocol/basics.md) とネイティブプロトコルを用いてデータをエンコードし、通信を行います。さらに、標準インターフェースは HTTP 経由での通信もサポートします。

|                    | ネイティブフォーマット | ネイティブプロトコル | HTTP プロトコル | バルク書き込みサポート | 構造体のマーシャリング | 圧縮 | クエリプレースホルダー |
|:------------------:|:----------------------:|:---------------------:|:---------------:|:----------------------:|:----------------------:|:----:|:----------------------:|
|   ClickHouse API   |           ✅           |           ✅           |                 |           ✅            |           ✅            |  ✅   |           ✅            |
| `database/sql` API |           ✅           |           ✅           |        ✅        |           ✅            |                        |  ✅   |           ✅            |



## インストール

ドライバーの v1 は非推奨となっており、新しい ClickHouse 型に対する機能追加やサポートは今後行われません。より高いパフォーマンスを提供する v2 へ移行してください。

クライアントの 2.x バージョンをインストールするには、パッケージを go.mod ファイルに追加します:

`require github.com/ClickHouse/clickhouse-go/v2 main`

または、リポジトリをクローンします:

```bash
git clone --branch v2 https://github.com/clickhouse/clickhouse-go.git $GOPATH/src/github
```

別のバージョンをインストールするには、パスまたはブランチ名を適宜変更してください。

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

### バージョン管理と互換性

このクライアントは ClickHouse とは独立してリリースされます。2.x は現在開発中のメジャーバージョンを表します。2.x のすべてのバージョンは相互に互換性がある想定です。

#### ClickHouse との互換性

このクライアントは以下をサポートします:

* [こちら](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md) に記載されている、現在サポートされているすべての ClickHouse バージョン。ClickHouse のバージョンがサポート対象外になると、そのバージョンに対してはクライアント リリース時のテストも積極的には行われなくなります。
* クライアントのリリース日から遡って 2 年以内にリリースされたすべての ClickHouse バージョン。なお、積極的にテストされるのは LTS バージョンのみです。

#### Golang との互換性

|    Client Version   | Golang Versions |
| :-----------------: | :-------------: |
| &gt;= 2.0 &lt;= 2.2 |    1.17, 1.18   |
|      &gt;= 2.3      |       1.18      |


## ClickHouse クライアント API

ClickHouse クライアント API のすべてのコード例は[こちら](https://github.com/ClickHouse/clickhouse-go/tree/main/examples)にあります。

### 接続

次の例はサーバーのバージョンを返すもので、ClickHouse への接続方法を示しています。ここでは、ClickHouse がセキュリティで保護されておらず、デフォルトユーザーでアクセス可能であると仮定しています。

接続にはデフォルトのネイティブポートを使用していることに注意してください。

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

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/connect.go)

**この後に続くすべてのサンプルでは、明示的に示されていない限り、ClickHouse の `conn` 変数がすでに作成済みで利用可能であることを前提とします。**

#### 接続設定

接続を開く際、Options 構造体を使用してクライアントの挙動を制御できます。利用可能な設定は次のとおりです:

* `Protocol` - Native か HTTP のいずれか。HTTP は現時点では [database/sql API](#databasesql-api) でのみサポートされます。
* `TLS` - TLS オプション。nil 以外の値で TLS が有効になります。[Using TLS](#using-tls) を参照してください。
* `Addr` - ポートを含むアドレスのスライス。
* `Auth` - 認証情報。[Authentication](#authentication) を参照してください。
* `DialContext` - 接続の確立方法を決定するカスタム dial 関数。
* `Debug` - デバッグを有効にするかどうかを指定する true/false。
* `Debugf` - デバッグ出力を受け取る関数を指定します。`debug` が true に設定されている必要があります。
* `Settings` - ClickHouse 設定のマップ。これらはすべての ClickHouse クエリに適用されます。[Using Context](#using-context) を利用すると、クエリごとに設定を行うことができます。
* `Compression` - ブロックに対する圧縮を有効にします。[Compression](#compression) を参照してください。
* `DialTimeout` - 接続確立の最大時間。デフォルトは `1s` です。
* `MaxOpenConns` - 任意の時点で使用可能な最大接続数。アイドルプール内の接続数はこれより多くても少なくてもかまいませんが、同時に使用できるのはこの数のみです。デフォルトは `MaxIdleConns+5` です。
* `MaxIdleConns` - プール内に維持する接続数。可能であれば接続は再利用されます。デフォルトは `5` です。
* `ConnMaxLifetime` - 接続を利用可能な状態で維持する最大存続時間。デフォルトは 1 時間です。この時間経過後、接続は破棄され、必要に応じて新しい接続がプールに追加されます。
* `ConnOpenStrategy` - ノードアドレスのリストをどのように順に消費し、接続を確立するかを決定します。[Connecting to Multiple Nodes](#connecting-to-multiple-nodes) を参照してください。
* `BlockBufferSize` - 一度にバッファへデコードするブロックの最大数。値を大きくするとメモリを犠牲にして並列性が向上します。ブロックサイズはクエリ依存であるため、接続単位で設定することもできますが、返されるデータに基づいてクエリ単位で上書きすることを推奨します。デフォルトは `2` です。

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

#### 接続プール


クライアントはコネクションプールを維持し、必要に応じてクエリ間でコネクションを再利用します。任意の時点で同時に使用されるコネクション数は最大で `MaxOpenConns` となり、プールの最大サイズは `MaxIdleConns` によって制御されます。クライアントは各クエリ実行時にプールからコネクションを取得し、再利用のためにプールへ返却します。コネクションはバッチのライフタイムの間使用され、`Send()` のタイミングで解放されます。

プール内の同じコネクションが後続のクエリでも使用される保証はありません。これを保証したい場合は、ユーザーが `MaxOpenConns=1` を設定する必要があります。この設定が必要になることはまれですが、一時テーブルを使用するケースなどで必要となることがあります。

また、`ConnMaxLifetime` のデフォルト値は 1 時間である点にも注意してください。ノードがクラスタから離脱した場合、ClickHouse への負荷のバランスが崩れるケースが生じる可能性があります。これは、あるノードが利用不能になると、コネクションが他のノードに振り分けられる状況で発生します。これらのコネクションは、問題のあるノードがクラスタに復帰した後であっても、デフォルトでは 1 時間の間維持され、更新されません。高負荷ワークロードの場合は、この値を下げることを検討してください。

### TLS の使用

低レベルの実装としては、すべてのクライアント接続メソッド（`DSN/OpenDB/Open`）は [Go tls パッケージ](https://pkg.go.dev/crypto/tls) を利用してセキュアな接続を確立します。`Options` 構造体に `nil` ではない `tls.Config` ポインタが含まれている場合、クライアントは TLS を使用する必要があると判断します。

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

この最小限の `TLS.Config` の設定だけで、通常は ClickHouse サーバー上のセキュアなネイティブポート（通常は 9440）に接続するのに十分です。ClickHouse サーバーが有効な証明書（期限切れ、ホスト名の不一致、一般に信頼されているルート認証局によって署名されていない、など）を持たない場合、`InsecureSkipVerify` を true に設定することもできますが、これは強く非推奨です。

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

追加の TLS パラメータが必要な場合は、アプリケーションコード側で `tls.Config` 構造体内の必要なフィールドを設定します。これには、特定の暗号スイートの指定、特定の TLS バージョン（1.2 や 1.3 など）の強制、内部 CA 証明書チェーンの追加、ClickHouse サーバーで要求される場合のクライアント証明書（および秘密鍵）の追加など、より高度なセキュリティ設定に伴うほとんどのオプションが含まれます。

### 認証

接続情報で Auth 構造体を指定し、ユーザー名とパスワードを設定します。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/1c0d81d0b1388dbb9e09209e535667df212f4ae4/examples/clickhouse_api/multi_host.go#L26-L45)

2つの接続戦略が利用可能です：

* `ConnOpenInOrder` (デフォルト)  - アドレスは順番に試行されます。リスト内の前のアドレスでの接続に失敗した場合にのみ、後ろのアドレスが使用されます。これは実質的にフェイルオーバー戦略です。
* `ConnOpenRoundRobin` - ラウンドロビン戦略を用いて、負荷がアドレス間で分散されます。

これはオプション `ConnOpenStrategy` で制御できます。

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

任意のステートメントを `Exec` メソッドで実行できます。これは DDL や単純なステートメントに便利です。ただし、大量の挿入処理やクエリを繰り返し実行する用途には使用しないでください。

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

クエリに `Context` を渡すことができる点に注意してください。これは特定のクエリレベルの設定を渡すために使用できます。詳しくは [Using Context](#using-context) を参照してください。

### バッチ挿入

大量の行を挿入するには、クライアントはバッチ挿入のための機能を提供しています。まず、行を追加していくためのバッチを準備します。最終的にこれは `Send()` メソッドによって送信されます。バッチは `Send` が実行されるまでメモリ上に保持されます。

接続リークを防ぐため、バッチに対して `Close` を呼び出すことを推奨します。これは、バッチを準備した後に `defer` キーワードを使用することで実現できます。これにより、`Send` が一度も呼び出されなかった場合でも接続がクリーンアップされます。行が一行も追加されなかった場合、クエリログには 0 行の挿入として表示される点に注意してください。

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

ClickHouseの推奨事項は[こちら](/guides/inserting-data#best-practices-for-inserts)を参照してください。バッチはgo-routines間で共有せず、ルーチンごとに個別のバッチを構築してください。

上記の例から、行を追加する際に変数の型と列の型を一致させる必要があることに注意してください。通常、マッピングは明白ですが、このインターフェースは柔軟性を持たせており、精度の損失が発生しない限り型変換が行われます。例えば、以下はdatetime64型に文字列を挿入する例です。

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

各列型でサポートされているgo型の完全な一覧については、[型変換](#type-conversions)を参照してください。

### 行のクエリ {#querying-rows}

ユーザーは`QueryRow`メソッドを使用して単一行をクエリするか、`Query`を使用して結果セットを反復処理するためのカーソルを取得できます。前者はデータのシリアライズ先を受け取りますが、後者は各行で`Scan`を呼び出す必要があります。

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


挿入と同様に、Scan メソッドではスキャン先の変数が適切な型である必要があります。これは柔軟に扱えるように設計されており、精度の損失が生じない限り、可能な場合には型変換が行われます。例えば、上記の例では UUID カラムを文字列変数として読み取っています。各 Column 型に対してサポートされる Go 型の一覧については、[Type Conversions](#type-conversions) を参照してください。

最後に、`Query` および `QueryRow` メソッドに `Context` を渡すことができる点に注意してください。これはクエリレベルの設定に使用できます。詳細については [Using Context](#using-context) を参照してください。

### Async Insert

非同期挿入は Async メソッドでサポートされています。これにより、クライアントがサーバーによる挿入の完了を待つか、データが受信された時点で応答するかを指定できます。これは実質的にパラメータ [wait&#95;for&#95;async&#95;insert](/operations/settings/settings#wait_for_async_insert) を制御します。

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
    )`, i, "Go 言語用 SQL データベースドライバー"), false); err != nil {
        return err
    }
}
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/async.go)

### カラム形式での挿入

挿入はカラム形式で行うことができます。データがすでにこの構造に沿った形で用意されている場合、行形式への変換（ピボット）が不要になるため、パフォーマンスの向上が見込めます。

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
    col2 = append(col2, "Go 用 SQL データベースドライバ")
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

### struct の使用

ユーザーにとって、Go 言語の struct は ClickHouse 内の 1 行分のデータを論理的に表現する手段となります。これを支援するために、ネイティブインターフェースはいくつかの便利な関数を提供しています。

#### serialize を用いた Select

`Select` メソッドを使用すると、1 回の呼び出しでレスポンス行のセットを struct のスライスにマーシャルできます。

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

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/select_struct.go)

#### 構造体のスキャン


`ScanStruct` は、クエリ結果の単一の Row を構造体にマーシャリングすることを可能にします。

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

#### struct の追加

`AppendStruct` を使用すると、構造体を既存の [batch](#batch-insert) に追加して、1 行分のレコードとして解釈させることができます。これには、構造体のカラムがテーブルのカラムと名前および型の両方で揃っている必要があります。すべてのカラムに対応する構造体フィールドが存在しなければなりませんが、構造体フィールドの中には対応するカラムを持たないものがあってもかまいません。そのようなフィールドは単に無視されます。

```go
batch, err := conn.PrepareBatch(context.Background(), "INSERT INTO example")
if err != nil {
    return err
}
defer batch.Close()

for i := 0; i < 1_000; i++ {
    err := batch.AppendStruct(&row{
        Col1:       uint64(i),
        Col2:       "Golang 用 SQL データベースドライバ",
        Col3:       []uint8{1, 2, 3, 4, 5, 6, 7, 8, 9},
        Col4:       time.Now(),
        ColIgnored: "これは無視されます",
    })
    if err != nil {
        return err
    }
}
```

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/append_struct.go)

### 型変換

このクライアントは、挿入およびレスポンスのマーシャリングの両方について、受け付ける変数型に関して可能な限り柔軟であることを目指しています。多くの場合、ClickHouse のカラム型に対応する同等の Golang 型が存在します。例えば、[UInt64](/sql-reference/data-types/int-uint/) は [uint64](https://pkg.go.dev/builtin#uint64) に対応します。これらの論理的なマッピングは常にサポートされるべきです。ユーザーは、変数側または受信データ側で事前に変換を行えば、カラムへの挿入やレスポンスの受け取りに利用できる別の変数型を使いたい場合があります。クライアントは、ユーザーが挿入前にデータを厳密に揃えるために変換する必要がないようにし、かつクエリ時に柔軟なマーシャリングを提供するために、これらの変換を透過的にサポートすることを目指しています。この透過的な変換では精度の損失は許可されません。例えば、`uint32` は `UInt64` カラムからデータを受信するためには使用できません。逆に、フォーマット要件を満たしていれば、`string` を `datetime64` フィールドに挿入できます。

プリミティブ型に対して現在サポートされている型変換は[こちら](https://github.com/ClickHouse/clickhouse-go/blob/main/TYPES.md)にまとめられています。

この取り組みは継続中であり、挿入時（`Append` / `AppendRow`）と読み取り時（`Scan` を介して）の 2 つに分けて考えることができます。特定の変換に対するサポートが必要な場合は、Issue を起票してください。

### 複合型

#### Date/DateTime 型

ClickHouse Go クライアントは、`Date`、`Date32`、`DateTime`、`DateTime64` の日付/日時型をサポートします。日付は `2006-01-02` という形式の `string`、またはネイティブな Go の `time.Time{}` や `sql.NullTime` を用いて挿入できます。`DateTime` も同様に後者の型をサポートしますが、`string` を渡す場合は、オプションのタイムゾーンオフセット（例: `2006-01-02 15:04:05 +08:00`）付きの `2006-01-02 15:04:05` 形式で指定する必要があります。`time.Time{}` と `sql.NullTime` は読み取り時もサポートされており、さらに `sql.Scanner` インターフェースの任意の実装もサポートされます。

タイムゾーン情報の扱いは、ClickHouse の型と、その値が挿入されるのか読み出されるのかによって異なります。


* **DateTime/DateTime64**
  * **insert** 時には、値は UNIX タイムスタンプ形式で ClickHouse に送信されます。タイムゾーンが指定されていない場合、クライアントはクライアントのローカルタイムゾーンを前提とします。`time.Time{}` または `sql.NullTime` は、それに応じてエポック秒に変換されます。
  * **select** 時には、`time.Time` 値を返す際に、カラムにタイムゾーンが設定されていればそのタイムゾーンが使用されます。設定されていない場合は、サーバーのタイムゾーンが使用されます。
* **Date/Date32**
  * **insert** 時には、日付を UNIX タイムスタンプに変換する際に、その日付に対応するタイムゾーンが考慮されます。つまり、保存時にはタイムゾーンでオフセットされたうえで日付として格納されます。これは、ClickHouse における Date 型にはロケールの概念がないためです。文字列値でタイムゾーンが指定されていない場合は、ローカルタイムゾーンが使用されます。
  * **select** 時には、日付は `time.Time{}` または `sql.NullTime{}` のインスタンスにスキャンされ、タイムゾーン情報なしで返されます。

#### Array

配列はスライスとして挿入する必要があります。要素の型付けルールは [プリミティブ型](#type-conversions) と一貫しており、可能な場合には要素が変換されます。

Scan 時には、スライスへのポインタを指定する必要があります。

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

Map は、キーと値が[前述](#type-conversions)の型ルールに従うようにした Golang の map として挿入します。

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
    fmt.Printf("行: col1=%v, col2=%v, col3=%v\n", col1, col2, col3)
}
rows.Close()
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/map.go)

#### タプル

タプルは、任意の長さのカラム群を一つにまとめたものを表します。カラムには、明示的に名前を付けることも、型だけを指定することもできます（例えば）。

```sql
//名前なし
Col1 Tuple(String, Int64)

//名前付き
Col2 Tuple(name String, id Int64, age uint8)
```

これらのアプローチの中では、名前付きタプルの方が柔軟性に優れています。名前なしタプルはスライスを使って挿入および読み取りを行う必要がありますが、名前付きタプルはマップ型とも互換性があります。


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

// 名前付きタプルと名前なしタプルの両方をスライスで追加できます。すべての要素の型が同じであれば、強い型付けのリストやマップを使用できることに注意してください。
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
// 名前付きタプルは map またはスライスとして取得でき、名前なしタプルはスライスとしてのみ取得できます。
if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2, &col3); err != nil {
    return err
}
fmt.Printf("行: col1=%v, col2=%v, col3=%v\n", col1, col2, col3)
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/tuple.go)

注: 型付きの slice および map もサポートされていますが、名前付き Tuple 内のサブカラムがすべて同じ型である必要があります。

#### Nested

Nested フィールドは、名前付き Tuple の Array と同等です。どのように扱われるかは、ユーザーが [flatten&#95;nested](/operations/settings/settings#flatten_nested) を 1 または 0 に設定しているかどうかに依存します。

flatten&#95;nested を 0 に設定すると、Nested カラムは 1 つの Tuple の配列として保持されます。これにより、ユーザーは挿入および取得に map の slice を使用できるほか、任意のレベルまでネストできます。下記の例に示すように、map のキーはカラム名と一致している必要があります。

注: map は Tuple を表すため、型は `map[string]interface{}` でなければなりません。値は現在、厳密な型付けはされていません。

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

[完全な例 - `flatten_tested=0`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L28-L118)

`flatten_nested` のデフォルト値 1 を使用すると、ネストされたカラムは個別の配列にフラット化されます。これには、挿入と取得にネストされたスライスを使用する必要があります。任意のレベルのネストが機能する可能性がありますが、これは公式にはサポートされていません。

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


このクライアントは、geo 型である Point、Ring、Polygon、Multi Polygon をサポートしています。これらのフィールドは、Go 言語でパッケージ [github.com/paulmach/orb](https://github.com/paulmach/orb) を使用して扱われます。

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

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/geo.go)

#### UUID

UUID 型は [github.com/google/uuid](https://github.com/google/uuid) パッケージでサポートされています。ユーザーは、UUID を文字列として、または `sql.Scanner` もしくは `Stringify` を実装する任意の型として送信およびマーシャリングすることもできます。

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

Decimal 型は [github.com/shopspring/decimal](https://github.com/shopspring/decimal) パッケージによりサポートされています。

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

#### Nullable（NULL 可能） {#nullable}

Go の Nil 値は ClickHouse の NULL を表します。これはフィールドが Nullable として宣言されている場合に使用できます。挿入時には、非 Nullable なカラムと Nullable なカラムのどちらにも Nil を渡すことができます。前者の場合は、その型のデフォルト値（例: string 型であれば空文字列）が永続化されます。Nullable 版の場合は、ClickHouse には NULL 値が保存されます。

Scan 時には、ユーザーは Nullable フィールドの nil 値を表現できるよう、nil を取れる型（例: *string）へのポインタを渡す必要があります。以下の例では、Nullable(String) である col1 は **string を受け取ります。これにより nil を表現できます。

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

クライアントはさらに、`sql.NullInt64` などの `sql.Null*` 型もサポートします。これらは対応する ClickHouse の型と互換性があります。

#### 大きな整数型 - Int128, Int256, UInt128, UInt256 {#big-ints---int128-int256-uint128-uint256}

64 ビットを超える数値型は、Go 標準の [big](https://pkg.go.dev/math/big) パッケージを使って表現されます。

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

クライアントは、`Exec`、`Query`、および`QueryRow`メソッドに対するパラメータバインディングをサポートします。以下の例に示すように、名前付き、番号付き、および位置指定パラメータを使用できます。以下にこれらの例を示します。

```go
var count uint64
// 位置指定バインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 >= ? AND Col3 < ?", 500, now.Add(time.Duration(750)*time.Second)).Scan(&count); err != nil {
    return err
}
// 250
fmt.Printf("位置指定バインドのカウント: %d\n", count)
// 番号付きバインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= $2 AND Col3 > $1", now.Add(time.Duration(150)*time.Second), 250).Scan(&count); err != nil {
    return err
}
// 100
fmt.Printf("番号付きバインドのカウント: %d\n", count)
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

グループやタプルが必要な場合、例えばIN演算子で使用するために`( )`で囲む必要がある場合は、`GroupSet`を使用できます。これは、以下の例に示すように、複数のグループが必要な場合に特に有用です。

最後に、DateTime64フィールドは、パラメータが適切にレンダリングされるように精度が必要です。ただし、フィールドの精度レベルはクライアントには不明であるため、ユーザーが指定する必要があります。これを容易にするために、`DateNamed`パラメータを提供しています。


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
// ネストが必要な場合に便利です
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE (Col1, Col5) IN (?)", []clickhouse.GroupSet{{[]interface{}{100, 101}}, {[]interface{}{200, 201}}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("グループの件数: %d\n", count)
// 時刻の精度が必要な場合は DateNamed を使用します
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col3 >= @col3", clickhouse.DateNamed("col3", now.Add(time.Duration(500)*time.Millisecond), clickhouse.NanoSeconds)).Scan(&count); err != nil {
    return err
}
fmt.Printf("NamedDate の件数: %d\n", count)
```

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind_special.go)

### context の使用

Go の context は、デッドライン、キャンセルシグナル、およびその他のリクエスト単位の値を API 境界をまたいで受け渡す手段を提供します。コネクション上のすべてのメソッドは、最初の引数として context を受け取ります。前の例では context.Background() を使用していましたが、この仕組みを利用すると、設定やデッドラインを渡したり、クエリをキャンセルしたりできます。

`withDeadline` で作成された context を渡すことで、クエリに対して実行時間の上限を設定できます。これは絶対時刻である点に注意してください。有効期限が来ると、コネクションが解放され、ClickHouse にキャンセルシグナルが送信されるだけです。`WithCancel` を使用すると、クエリを明示的にキャンセルすることもできます。

ヘルパー関数 `clickhouse.WithQueryID` と `clickhouse.WithQuotaKey` を使用すると、クエリ ID とクオータキーを指定できます。クエリ ID は、ログでクエリを追跡したり、キャンセル目的で利用したりするのに有用です。クオータキーは、一意なキー値に基づいて ClickHouse の利用に制限を課すために使用できます。詳細については [Quotas Management](/operations/access-rights#quotas-management) を参照してください。

ユーザーは context を使って、[Connection Settings](#connection-settings) に示すように、設定をコネクション全体ではなく特定のクエリに対してのみ適用されるようにすることもできます。

最後に、`clickhouse.WithBlockSize` によってブロックバッファのサイズを制御できます。これはコネクションレベルの設定である `BlockBufferSize` をオーバーライドし、任意の時点でデコードされメモリ上に保持されるブロック数の上限を制御します。値を大きくすると、メモリ消費と引き換えに、より高い並列性が得られる可能性があります。

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
// context を使って特定の API 呼び出しに設定を渡せます
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "allow_experimental_object_type": "1",
}))

conn.Exec(ctx, "DROP TABLE IF EXISTS example")

// JSON 列を作成するには allow_experimental_object_type=1 が必要です
if err = conn.Exec(ctx, `
    CREATE TABLE example (
            Col1 JSON
        )
        Engine Memory
    `); err != nil {
    return err
}
```


// クエリは context を使用してキャンセルできます
ctx, cancel := context.WithCancel(context.Background())
go func() {
cancel()
}()
if err = conn.QueryRow(ctx, "SELECT sleep(3)").Scan(); err == nil {
return fmt.Errorf("キャンセルが発生するはずでした")
}

// クエリにデッドラインを設定します - 絶対時刻に到達するとクエリはキャンセルされます。
// ClickHouse ではクエリは完了まで実行され続けます
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.Ping(ctx); err == nil {
return fmt.Errorf("デッドライン超過が発生するはずでした")
}

// ログでクエリをトレースできるように、クエリ ID を設定します（例: system.query*log を参照）
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
// クオータキーを設定します - まずクオータを作成します
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

### Progress / Profile / Log 情報 {#progressprofilelog-information}

クエリに対して Progress、Profile、Log の情報を要求できます。Progress 情報は、ClickHouse で読み取りおよび処理された行数やバイト数の統計を報告します。これに対して、Profile 情報はクライアントに返されたデータの概要を提供し、非圧縮バイト数、行数、ブロック数の合計を含みます。最後に、Log 情報はスレッドに関する統計、たとえばメモリ使用量やデータ処理速度などを提供します。

これらの情報を取得するには [Context](#using-context) を使用する必要があり、そこにコールバック関数を渡すことができます。

```go
totalRows := uint64(0)
// Progress と Profile 情報用のコールバックを渡すために context を使用します
ctx := clickhouse.Context(context.Background(), clickhouse.WithProgress(func(p *clickhouse.Progress) {
    fmt.Println("進捗: ", p)
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
````

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/progress.go)

### 動的スキャン {#dynamic-scanning}

ユーザーは、返されるフィールドのスキーマや型が分からないテーブルを読み取る必要がある場合があります。これは、アドホックなデータ分析を実行する場合や、汎用ツールを実装する場合によく発生します。これを実現するために、クエリのレスポンスから列の型情報を取得できます。これを Go のリフレクションと組み合わせて使用することで、適切な型を持つ変数のランタイムインスタンスを生成し、それらを Scan に渡すことができます。

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


[External tables](/engines/table-engines/special/external-data/) により、クライアントは SELECT クエリと一緒にデータを ClickHouse に送信できます。このデータは一時テーブルに格納され、クエリ自体の評価に利用できます。

クエリに外部データを添えてクライアントに送信するには、ユーザーはコンテキスト経由で渡す前に、`ext.NewTable` を使って外部テーブルを作成しておく必要があります。

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

### OpenTelemetry

ClickHouse は、ネイティブプロトコルの一部として [トレースコンテキスト](/operations/opentelemetry/) を受け渡すことをサポートしています。クライアントでは、この目的のために、関数 `clickhouse.withSpan` を使って Span を作成し、それを Context 経由で渡すことができます。

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

[完全なコード例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/open_telemetry.go)

トレーシングの活用方法の詳細については、[OpenTelemetry サポート](/operations/opentelemetry/)を参照してください。


## Database/SQL API

`database/sql` または「標準」API は、標準インターフェイスに準拠することで、アプリケーションコードを基盤となるデータベースに依存させずにクライアントを利用できるようにします。これには、追加の抽象化レイヤーや間接参照、さらに ClickHouse に必ずしも適合しないプリミティブが伴うというコストが生じます。しかし、ツールが複数のデータベースに接続する必要があるシナリオでは、これらのコストは一般的に許容可能です。

さらに、このクライアントはトランスポート層として HTTP の利用をサポートしており、データ自体は引き続き最適なパフォーマンスのためにネイティブ形式でエンコードされます。

以下は、ClickHouse API のドキュメント構造に倣ったものです。

標準 API 向けの完全なコード例は[こちら](https://github.com/ClickHouse/clickhouse-go/tree/main/examples/std)で確認できます。

### Connecting

接続は、`clickhouse://<host>:<port>?<query_option>=<value>` という形式の DSN 文字列と `Open` メソッド、または `clickhouse.OpenDB` メソッドのいずれかによって行うことができます。後者は `database/sql` 仕様の一部ではありませんが、`sql.DB` インスタンスを返します。このメソッドは、`database/sql` 仕様上は明確な公開手段がないプロファイリングなどの機能を提供します。

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

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect.go)

**以降のすべての例では、明示的に記載されている場合を除き、ClickHouse の `conn` 変数がすでに作成されており、利用可能であることを前提とします。**

#### 接続設定

以下のパラメータを DSN 文字列で指定できます:

* `hosts` - ロードバランシングおよびフェイルオーバー用の、単一アドレスホストのカンマ区切りリスト - [複数ノードへの接続](#connecting-to-multiple-nodes)を参照
* `username/password` - 認証情報 - [認証](#authentication)を参照
* `database` - 現在のデフォルトデータベースを選択
* `dial_timeout` - 継続時間を表す文字列。符号付きの場合があり、小数部を含む 10 進数と、`300ms` や `1s` のような単位サフィックスから成るシーケンスです。利用可能な時間単位は `ms`、`s`、`m` です。
* `connection_open_strategy` - `random/in_order` (デフォルトは `random`) - [複数ノードへの接続](#connecting-to-multiple-nodes)を参照
  * `round_robin` - セット内からラウンドロビンでサーバーを選択
  * `in_order` - 指定された順序で、最初の稼働中サーバーを選択
* `debug` - デバッグ出力を有効化 (ブール値)
* `compress` - 圧縮アルゴリズムを指定 - `none` (デフォルト), `zstd`, `lz4`, `gzip`, `deflate`, `br`。`true` に設定した場合は `lz4` が使用されます。ネイティブ通信でサポートされるのは `lz4` と `zstd` のみです。
* `compress_level` - 圧縮レベル (デフォルトは `0`)。「Compression」を参照してください。これはアルゴリズム固有です:
  * `gzip` - `-2` (最高速度) 〜 `9` (最高圧縮)
  * `deflate` - `-2` (最高速度) 〜 `9` (最高圧縮)
  * `br` - `0` (最高速度) 〜 `11` (最高圧縮)
  * `zstd`, `lz4` - 無視されます
* `secure` - セキュアな SSL 接続を確立 (デフォルトは `false`)
* `skip_verify` - 証明書検証をスキップ (デフォルトは `false`)
* `block_buffer_size` - ブロックバッファサイズを制御します。[`BlockBufferSize`](#connection-settings) を参照。(デフォルトは `2`)


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

#### コネクションプール

ユーザーは、[複数ノードへの接続](#connecting-to-multiple-nodes) で説明されているように、提供されたノードアドレスのリストの利用方法を制御できます。ただし、コネクション管理およびプーリングは、設計上 `sql.DB` に委譲されています。

#### HTTP 経由での接続

デフォルトでは、ネイティブプロトコル経由で接続が確立されます。HTTP を利用する必要がある場合は、DSN を変更して HTTP プロトコルを含めるか、接続オプションで `Protocol` を指定することで有効化できます。

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

#### 複数ノードへの接続

`OpenDB` を使用する場合は、ClickHouse API と同様のオプション指定方法で複数ホストに接続します。必要に応じて `ConnOpenStrategy` を指定できます。

DSN ベースの接続では、接続文字列で複数ホストと `connection_open_strategy` パラメーターを指定でき、その値として `round_robin` または `in_order` を設定できます。

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

### TLS の使用

DSN 接続文字列を使用する場合、パラメータ `secure=true` によって SSL を有効化できます。`OpenDB` メソッドは、非 nil な TLS 構造体を指定するという点で、[TLS 用のネイティブ API](#using-tls) と同じアプローチを利用します。DSN 接続文字列は SSL 検証をスキップするための `skip_verify` パラメータをサポートしていますが、より高度な TLS 設定には `OpenDB` メソッドが必要です。これは TLS 設定を引数として渡すことができるためです。


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

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/ssl.go)

### 認証

`OpenDB` を使用する場合、認証情報は通常のオプションを通じて渡すことができます。DSN ベースの接続では、ユーザー名とパスワードを接続文字列で渡すことができ、パラメーターとして指定するか、アドレス内にエンコードされた認証情報として含めることができます。

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

接続を確立したら、Exec メソッドを使って `sql` ステートメントを実行できます。

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

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/exec.go)

このメソッドは `context` の受け取りをサポートしていません。デフォルトではバックグラウンド `context` で実行されます。必要な場合は `ExecContext` を使用してください。詳しくは [Using Context](#using-context) を参照してください。

### バッチ挿入

バッチ処理は、`Begin` メソッドで `sql.Tx` を作成することで実現できます。そのトランザクションから、`INSERT` 文を指定して `Prepare` メソッドを呼ぶことでバッチを取得します。これにより `sql.Stmt` が返され、`Exec` メソッドを使って行を追加できます。`Commit` が元の `sql.Tx` に対して実行されるまで、バッチはメモリ上に蓄積されます。


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

### 行のクエリ

単一行のクエリ実行は `QueryRow` メソッドで行えます。このメソッドは *sql.Row を返し、その Row に対して `Scan` を呼び出し、カラム値を格納する変数へのポインタを渡します。`QueryRowContext` バリアントを使用すると、`background` 以外の context を渡すことができます。詳しくは [Using Context](#using-context) を参照してください。

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

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/query_row.go)

複数行を反復処理するには `Query` メソッドを使用します。このメソッドは、`Next` を呼び出して行を順に処理できる `*sql.Rows` 構造体を返します。`Query` に対応する `QueryContext` メソッドを使うと、context を渡すことができます。

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
    fmt.Printf("行: col1=%d, col2=%s, col3=%s, col4=%s, col5=%v, col6=%v, col7=%v, col8=%v\n", col1, col2, col3, col4, col5, col6, col7, col8)
}
```

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/query_rows.go)

### 非同期 Insert

非同期での Insert は、`ExecContext` メソッドを使って Insert を実行することで行えます。以下に示すように、非同期モードを有効にした `context` を渡す必要があります。これにより、クライアントがサーバーによる Insert の完了を待つか、データが受信された時点で応答するかをユーザー側で指定できます。これは実質的にパラメータ [wait&#95;for&#95;async&#95;insert](/operations/settings/settings#wait_for_async_insert) を制御することになります。

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
        )`, i, "Golang SQL データベースドライバ"))
        if err != nil {
            return err
        }
    }
}
```

[完全なコード例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/async.go)


### カラム型インサート

標準インターフェイスではサポートされていません。

### struct の使用

標準インターフェイスではサポートされていません。

### 型変換

標準の `database/sql` インターフェイスは、[ClickHouse API](#type-conversions) と同じ型をサポートします。主に複合型に関していくつかの例外があり、それらについて以下で説明します。ClickHouse API と同様に、クライアントは挿入およびレスポンスのマーシャリングの両方において、さまざまな型をできる限り柔軟に受け入れることを目指しています。詳細については [Type Conversions](#type-conversions) を参照してください。

### 複合型

特に記載がない限り、複合型の扱いは [ClickHouse API](#complex-types) と同じです。違いは `database/sql` の内部実装によるものです。

#### Map

ClickHouse API と異なり、標準 API ではスキャン時の型として Map を厳密に型指定する必要があります。たとえば、ユーザーは `Map(String,String)` フィールドに対して `map[string]interface{}` を渡すことはできず、代わりに `map[string]string` を使用する必要があります。`interface{}` 変数は常に互換性があり、より複雑な構造に対して使用できます。読み取り時に struct はサポートされていません。

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

データ挿入時の動作は ClickHouse API と同じです。

### 圧縮

標準 API は、ネイティブな [ClickHouse API](#compression) と同じ圧縮アルゴリズム、すなわちブロック単位の `lz4` および `zstd` 圧縮をサポートします。加えて、HTTP 接続では gzip、deflate、および br 圧縮がサポートされます。これらのいずれかが有効化されている場合、挿入時のブロックおよびクエリ応答に対して圧縮が行われます。その他のリクエスト、たとえば ping やクエリ実行リクエストは非圧縮のままです。これは `lz4` および `zstd` オプションの場合と同様です。

接続を確立するために `OpenDB` メソッドを使用する場合は、`Compression` 設定を渡すことができます。これには圧縮レベルを指定する機能が含まれます（後述）。DSN を用いて `sql.Open` 経由で接続する場合は、パラメータ `compress` を利用します。これは、`gzip`、`deflate`、`br`、`zstd`、`lz4` のような特定の圧縮アルゴリズム、または真偽値フラグのいずれかを指定できます。`true` に設定した場合は `lz4` が使用されます。デフォルトは `none`、すなわち圧縮無効です。

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

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/compression.go#L27-L76)


```go
conn, err := sql.Open("clickhouse", fmt.Sprintf("http://%s:%d?username=%s&password=%s&compress=gzip&compress_level=5", env.Host, env.HttpPort, env.Username, env.Password))
```

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/compression.go#L78-L115)

適用される圧縮レベルは、DSN パラメーター `compress_level` または Compression オプションの `Level` フィールドで制御できます。デフォルトは 0 ですが、設定可能な範囲はアルゴリズムごとに異なります:

* `gzip` - `-2`（最高速）から `9`（最高圧縮）
* `deflate` - `-2`（最高速）から `9`（最高圧縮）
* `br` - `0`（最高速）から `11`（最高圧縮）
* `zstd`, `lz4` - 無視されます

### パラメータバインディング

標準の API は、[ClickHouse API](#parameter-binding) と同じパラメータバインディング機能をサポートしており、`Exec`、`Query`、`QueryRow` メソッド（およびそれらに相当する [Context](#using-context) 付きのバリアント）にパラメータを渡すことができます。位置指定パラメータ、名前付きパラメータ、および番号付きパラメータがサポートされています。

```go
var count uint64
// 位置パラメータバインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 >= ? AND Col3 < ?", 500, now.Add(time.Duration(750)*time.Second)).Scan(&count); err != nil {
    return err
}
// 250
fmt.Printf("位置パラメータバインドの件数: %d\n", count)
// 番号指定パラメータバインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= $2 AND Col3 > $1", now.Add(time.Duration(150)*time.Second), 250).Scan(&count); err != nil {
    return err
}
// 100
fmt.Printf("番号指定パラメータバインドの件数: %d\n", count)
// 名前付きパラメータバインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= @col1 AND Col3 > @col3", clickhouse.Named("col1", 100), clickhouse.Named("col3", now.Add(time.Duration(50)*time.Second))).Scan(&count); err != nil {
    return err
}
// 50
fmt.Printf("名前付きパラメータバインドの件数: %d\n", count)
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/bind.go)

[特殊なケース](#special-cases) についての注意事項は引き続き適用されます。

### context の使用

標準 API は、[ClickHouse API](#using-context) と同様に、context を通じて期限、キャンセルシグナル、その他のリクエストスコープの値を渡す機能をサポートします。ClickHouse API と異なり、これはメソッドの `Context` 付きバリアントを使用することで実現します。つまり、デフォルトでバックグラウンド context を使用する `Exec` のようなメソッドには、最初のパラメータとして context を渡せる `ExecContext` というバリアントが用意されています。これにより、アプリケーションフローの任意の段階で context を渡すことができます。例えば、`ConnContext` を用いて接続を確立する際や、`QueryRowContext` を用いてクエリの 1 行を取得する際に context を渡すことが可能です。利用可能なすべてのメソッドの例を以下に示します。

期限、キャンセルシグナル、クエリ ID、クオータキー、および接続設定を渡すために context を使用する方法の詳細については、[ClickHouse API](#using-context) 向けの「Using Context」を参照してください。

```go
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "allow_experimental_object_type": "1",
}))
conn.ExecContext(ctx, "DROP TABLE IF EXISTS example")
// JSON 列を作成するには allow_experimental_object_type=1 を有効にする必要があります
if _, err = conn.ExecContext(ctx, `
    CREATE TABLE example (
            Col1 JSON
        )
        Engine Memory
    `); err != nil {
    return err
}

// クエリはコンテキストを使用してキャンセルできます
ctx, cancel := context.WithCancel(context.Background())
go func() {
    cancel()
}()
if err = conn.QueryRowContext(ctx, "SELECT sleep(3)").Scan(); err == nil {
    return fmt.Errorf("キャンセルされるはずです")
}

// クエリにデッドラインを設定します - 絶対時刻に達するとクエリをキャンセルします。ここでも接続のみが終了し、
// ClickHouse ではクエリは完了まで実行され続けます
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.PingContext(ctx); err == nil {
    return fmt.Errorf("Deadline Exceeded が発生するはずです")
}
```


// ログでクエリをトレースしやすくするためにクエリ ID を設定します（例: system.query_log を参照）
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
// クオータキーを設定します - まずクオータを作成します
if \_, err = conn.ExecContext(ctx, "CREATE QUOTA IF NOT EXISTS foobar KEYED BY client_key FOR INTERVAL 1 minute MAX queries = 5 TO default"); err != nil {
return err
}

// コンテキストを使用してクエリをキャンセルできます
ctx, cancel = context.WithCancel(context.Background())
// キャンセルする前にいくつかの結果が得られます
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
fmt.Println("キャンセルされることを想定しています")
return nil
}
return err
}
fmt.Printf("行: col2=%d\n", col2)
if col2 == 3 {
cancel()
}
}

````

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/context.go)

### セッション {#sessions}

ネイティブ接続ではセッションが暗黙的に存在しますが、HTTP 経由の接続では、設定としてコンテキストに渡すためのセッション ID をユーザーが作成する必要があります。これにより、セッションに紐づく一時テーブルなどの機能を利用できるようになります。

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
    fmt.Printf("行: col1=%d\n", col1)
}
````

[完全なサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/session.go)

### 動的スキャン {#dynamic-scanning-1}

[ClickHouse API](#dynamic-scanning) と同様に、カラム型情報が利用可能であり、ユーザーはその情報を用いて実行時に適切な型の変数インスタンスを作成し、Scan に渡すことができます。これにより、型が事前に分からないカラムも読み取ることができます。

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

### 外部テーブル

[外部テーブル](/engines/table-engines/special/external-data/) を使用すると、クライアントは `SELECT` クエリと共にデータを ClickHouse に送信できます。このデータは一時テーブルに配置され、クエリ内で評価に利用できます。

クエリとともに外部データを送信するには、コンテキスト経由で渡す前に `ext.NewTable` を使って外部テーブルを作成しておく必要があります。

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

### Open telemetry

ClickHouse では、ネイティブプロトコルの一部として [trace context](/operations/opentelemetry/) を渡すことができます。クライアントは、関数 `clickhouse.withSpan` を使用して Span を作成し、Context 経由で渡すことで、これを実現します。HTTP をトランスポートとして使用している場合はサポートされません。

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

* 特にプリミティブ型に対しては、可能な限り ClickHouse API を利用してください。これにより、リフレクション処理や間接参照による大きなオーバーヘッドを回避できます。
* 大きなデータセットを読み取る場合は、[`BlockBufferSize`](#connection-settings) の変更を検討してください。これはメモリ使用量を増やしますが、行の反復処理中により多くのブロックを並列にデコードできるようになります。デフォルト値の 2 は保守的で、メモリのオーバーヘッドを最小限に抑えます。値を大きくすると、メモリ上に保持されるブロック数が増えます。クエリによってブロックサイズは変わり得るため、テストが必要です。そのため、Context を介して[クエリ単位](#using-context)で設定できます。
* データを挿入する際は、型を明確に指定してください。クライアントは、たとえば UUID や IP に対して文字列からのパースを許可するなど柔軟に動作することを目指していますが、これはデータ検証を必要とし、挿入時にコストが発生します。
* 可能な限りカラム指向の挿入を使用してください。この場合も厳密に型付けされたデータを使用し、クライアントによる値変換が不要になるようにしてください。
* 挿入処理のパフォーマンスを最適化するために、ClickHouse の[推奨事項](/sql-reference/statements/insert-into/#performance-considerations)に従ってください。
