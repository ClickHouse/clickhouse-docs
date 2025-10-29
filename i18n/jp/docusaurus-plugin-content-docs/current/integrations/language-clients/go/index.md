---
'sidebar_label': 'Go'
'sidebar_position': 1
'keywords':
- 'clickhouse'
- 'go'
- 'client'
- 'golang'
'slug': '/integrations/go'
'description': 'Goクライアントは、ClickHouseに接続するために、Goの標準database/sqlインターフェースまたは最適化されたネイティブインターフェースのいずれかを使用します。'
'title': 'ClickHouse Go'
'doc_type': 'reference'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';



# ClickHouse Go
## A simple example {#a-simple-example}

簡単な例でGoを使ってみましょう。これによりClickHouseに接続し、システムデータベースから選択します。最初に、接続の詳細情報が必要です。
### Connection details {#connection-details}

<ConnectionDetails />
### Initialize a module {#initialize-a-module}

```bash
mkdir clickhouse-golang-example
cd clickhouse-golang-example
go mod init clickhouse-golang-example
```
### Copy in some sample code {#copy-in-some-sample-code}

このコードを `clickhouse-golang-example` ディレクトリに `main.go` としてコピーします。

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
### Run go mod tidy {#run-go-mod-tidy}

```bash
go mod tidy
```
### Set your connection details {#set-your-connection-details}
前に接続の詳細情報を調べました。それを `main.go` の `connect()` 関数に設定します：

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
### Run the example {#run-the-example}
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
### Learn more {#learn-more}
このカテゴリの残りのドキュメントでは、ClickHouse Go クライアントの詳細を説明しています。
## ClickHouse Go client {#clickhouse-go-client}

ClickHouseは2つの公式のGoクライアントをサポートしています。これらのクライアントは補完的であり、意図的に異なるユースケースをサポートします。

* [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) - Go標準のdatabase/sqlインターフェースまたはネイティブインターフェースのいずれかをサポートする高レベル言語クライアント。
* [ch-go](https://github.com/ClickHouse/ch-go) - 低レベルクライアント。ネイティブインターフェースのみ。

clickhouse-goは高レベルのインターフェースを提供し、ユーザーはデータ型に対して寛容な行志向の意味論とバッチ処理を使用してデータをクエリしたり挿入したりできます - 値は精度の損失が発生しない限り変換されます。一方、ch-goは、型の厳密さとより複雑な使用法の代償として、低CPUおよびメモリオーバーヘッドで高速なデータブロックストリーミングを提供する最適化された列指向インターフェースを提供します。

バージョン2.3から、Clickhouse-goはエンコーディング、デコーディング、および圧縮などの低レベルの機能にch-goを利用します。clickhouse-goはGoの `database/sql` インターフェース標準もサポートしていることに注意してください。両方のクライアントは、最適なパフォーマンスを提供するためにネイティブフォーマットを使用し、ネイティブClickHouseプロトコルを介して通信できます。また、clickhouse-goは、ユーザーがトラフィックのプロキシまたはロードバランシングの要件を持つ場合にHTTPをトランスポートメカニズムとしてサポートします。

クライアントライブラリを選択する際には、それぞれの長所と短所を考慮する必要があります - クライアントライブラリの選択を参照してください。

|               | Native format | Native protocol | HTTP protocol | Row Orientated API | Column Orientated API | Type flexibility | Compression | Query Placeholders |
|:-------------:|:-------------:|:---------------:|:-------------:|:------------------:|:---------------------:|:----------------:|:-----------:|:------------------:|
| clickhouse-go |       ✅       |        ✅        |       ✅       |          ✅         |           ✅           |         ✅        |      ✅      |          ✅         |
|     ch-go     |       ✅       |        ✅        |               |                    |           ✅           |                  |      ✅      |                    |
## Choosing a client {#choosing-a-client}

クライアントライブラリの選択は、使用パターンと最適なパフォーマンスの必要性に依存します。毎秒数百万の挿入が必要な挿入重視のユースケースには、低レベルのクライアント [ch-go](https://github.com/ClickHouse/ch-go) を使用することをお勧めします。このクライアントは、ClickHouseのネイティブフォーマットが要求する行指向フォーマットから列にデータをピボットする際のオーバーヘッドを回避します。さらに、使用を簡素化するために、リフレクションや `interface{}` (`any`) 型の利用を回避します。

集計に焦点を当てたクエリワークロードや低スループットの挿入ワークロードでは、[clickhouse-go](https://github.com/ClickHouse/clickhouse-go) が馴染みのある `database/sql` インターフェースとより簡単な行の意味論を提供します。ユーザーはオプションとしてHTTPトランスポートプロトコルを使用し、構造体と行をマシャリングするためのヘルパー関数を利用することもできます。
## The clickhouse-go client {#the-clickhouse-go-client}

clickhouse-goクライアントは、ClickHouseと通信するための2つのAPIインターフェースを提供します：

* ClickHouseクライアント特有のAPI
* `database/sql`標準 - Golangによって提供されるSQLデータベースのための一般的なインターフェース。

`database/sql`はデータベースに依存しないインターフェースを提供し、開発者がデータストアを抽象化できるようにしますが、パフォーマンスに影響を与えるいくつかの型付けやクエリの意味論を強制します。このため、[パフォーマンスが重要な場合](https://github.com/clickHouse/clickHouse-go#benchmark) はクライアント特有のAPIを使用することをお勧めします。ただし、複数のデータベースをサポートするツールにClickHouseを統合したいユーザーは、標準インターフェースを使用することを好むかもしれません。

両方のインターフェースは、通信のために[native format](/native-protocol/basics.md)とネイティブプロトコルを使用します。さらに、標準インターフェースはHTTP通信もサポートします。

|                    | Native format | Native protocol | HTTP protocol | Bulk write support | Struct marshaling | Compression | Query Placeholders |
|:------------------:|:-------------:|:---------------:|:-------------:|:------------------:|:-----------------:|:-----------:|:------------------:|
|   ClickHouse API   |       ✅       |        ✅        |               |          ✅         |         ✅         |      ✅      |          ✅         |
| `database/sql` API |       ✅       |        ✅        |       ✅       |          ✅         |                   |      ✅      |          ✅         |
## Installation {#installation}

ドライバーのv1は非推奨であり、新しいClickHouseタイプへの機能更新やサポートには到達しません。ユーザーは、より優れたパフォーマンスを提供するv2に移行する必要があります。

クライアントの2.xバージョンをインストールするには、go.modファイルにパッケージを追加します：

`require github.com/ClickHouse/clickhouse-go/v2 main`

または、リポジトリをクローンします：

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
### Versioning & compatibility {#versioning--compatibility}

クライアントはClickHouseとは独立してリリースされます。2.xは現在開発中の主要なバージョンを表します。2.xのすべてのバージョンは互換性があります。
#### ClickHouse compatibility {#clickhouse-compatibility}

クライアントは以下をサポートします：

- [こちら](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md) に記載のすべての現在サポートされているClickHouseのバージョン。ClickHouseバージョンはもはやサポートされていないため、クライアントリリースに対してももはや積極的にテストされていません。
- クライアントのリリース日から2年間のすべてのバージョンのClickHouse。注意：LTSバージョンのみが積極的にテストされます。
#### Golang compatibility {#golang-compatibility}

| Client Version | Golang Versions |
|:--------------:|:---------------:|
|  => 2.0 &lt;= 2.2 |    1.17, 1.18   |
|     >= 2.3     |       1.18      |
## ClickHouse client API {#clickhouse-client-api}

ClickHouse Client APIのすべてのコード例は[こちら](https://github.com/ClickHouse/clickhouse-go/tree/main/examples)にあります。
### Connecting {#connecting}

次の例では、サーバーバージョンを返し、ClickHouseに接続することを示しています - ClickHouseがセキュリティで保護されておらず、デフォルトのユーザーでアクセスできると仮定します。

接続するためにデフォルトのネイティブポートを使用します。

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/connect.go)

**以降のすべての例では、明示的に示されない限り、ClickHouseの `conn` 変数が作成されて利用可能であると仮定します。**
#### Connection settings {#connection-settings}

接続を開くときに、Options構造体を使用してクライアントの動作を制御できます。以下の設定が利用可能です：

* `Protocol` - ネイティブまたはHTTPのいずれか。HTTPは現在、[database/sql API](#databasesql-api)のみにサポートされています。
* `TLS` - TLSオプション。非nilの値はTLSを有効にします。[TLSの使用](#using-tls)を参照してください。
* `Addr` - ポートを含むアドレスのスライス。
* `Auth` - 認証の詳細。[Authentication](#authentication)を参照してください。
* `DialContext` - 接続を確立する方法を決定するカスタムダイヤル関数。
* `Debug` - デバッグを有効にするためのtrue/false。
* `Debugf` - デバッグ出力を消費する関数を提供します。 `debug` をtrueに設定する必要があります。
* `Settings` - ClickHouse設定のマップ。これらはすべてのClickHouseクエリに適用されます。[Contextの使用](#using-context)により、クエリごとの設定を行うことができます。
* `Compression` - ブロックのための圧縮を有効にします。[Compression](#compression)を参照してください。
* `DialTimeout` - 接続を確立するための最大時間。デフォルトは `1s` です。
* `MaxOpenConns` - 常時使用する最大接続数。アイドルプールにはより多くまたは少ない接続がある可能性がありますが、常時使用できるのはこの数だけです。デフォルトは `MaxIdleConns+5` です。
* `MaxIdleConns` - プール内に保持する接続数。可能であれば接続が再利用されます。デフォルトは `5` です。
* `ConnMaxLifetime` - 接続が利用可能である最大寿命。デフォルトは1時間です。この時間が経過すると接続は破棄され、新しい接続が必要に応じてプールに追加されます。
* `ConnOpenStrategy` - ノードアドレスのリストを消費し、接続を開く方法を決定します。[複数のノードに接続する](#connecting-to-multiple-nodes)を参照してください。
* `BlockBufferSize` - 一度にバッファにデコードする最大ブロック数。より大きな値はメモリの代償として並行処理を増加させます。ブロックのサイズはクエリによって異なるため、この設定を接続に設定できますが、返されるデータに基づいてクエリごとに上書きすることをお勧めします。デフォルトは `2` です。

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
[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/connect_settings.go)
#### Connection pooling {#connection-pooling}

クライアントは接続のプールを維持し、必要に応じてこれをクエリを跨いで再利用します。最大で `MaxOpenConns` は常時使用され、プールの最大サイズは `MaxIdleConns` によって制御されます。クライアントは各クエリ実行のためにプールから接続を取得し、それをプールに返して再利用します。接続はバッチの寿命の間使用され、`Send()` で解放されます。

ユーザーが `MaxOpenConns=1` を設定しない限り、プール内の同じ接続が後続のクエリに利用されることは保証されません。これはあまり必要ではありませんが、一時テーブルを使用するユーザーにとっては必須のケースもあります。

また、デフォルトで `ConnMaxLifetime` は1時間です。これにより、ノードがクラスターを離れると、ClickHouseの負荷が不均等になる場合があります。ノードが利用不可になると、この接続は他のノードにバランスされます。デフォルトでこれらの接続は1時間の間更新されず、問題のあるノードがクラスターに戻っても、そのままとなります。負荷の重い作業の場合は、この値を下げることを検討してください。
### Using TLS {#using-tls}

低レベルでは、すべてのクライアント接続メソッド（`DSN/OpenDB/Open`）は[Go tlsパッケージ](https://pkg.go.dev/crypto/tls)を使用して安全な接続を確立します。Options構造体に非nilの `tls.Config` ポインタが含まれている場合、クライアントはTLSを使用することを認識します。

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/ssl.go)

この最小限の `TLS.Config` は通常、ClickHouseサーバーの安全なネイティブポート（通常9440）への接続に十分です。ClickHouseサーバーに有効な証明書がない場合（期限切れ、ホスト名が間違っている、公共の認知されたルート証明書機関によって署名されていないなど）、 `InsecureSkipVerify` をtrueにすることができますが、これは強く非推奨です。

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/ssl_no_verify.go)

追加のTLSパラメータが必要な場合、アプリケーションコードは `tls.Config` 構造体に必要なフィールドを設定する必要があります。これには、特定の暗号スイート、特定のTLSバージョン（1.2または1.3など）、内部CA証明書チェーンの追加、ClickHouseサーバーによって要求される場合はクライアント証明書（および秘密鍵）の追加、さらに特殊なセキュリティセットアップに関するその他のオプションが含まれます。
### Authentication {#authentication}

認証の詳細を指定するために接続の詳細にAuth構造体を指定します。

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/auth.go)
### Connecting to multiple nodes {#connecting-to-multiple-nodes}

複数のアドレスを `Addr` 構造体を介して指定できます。

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/1c0d81d0b1388dbb9e09209e535667df212f4ae4/examples/clickhouse_api/multi_host.go#L26-L45)

2つの接続戦略が利用可能です：

* `ConnOpenInOrder`（デフォルト） - アドレスは順番に消費されます。後のアドレスは、リスト内の以前のアドレスを使用して接続に失敗した場合にのみ利用されます。これは実質的にフェイルオーバー戦略です。
* `ConnOpenRoundRobin` - アドレス間でラウンドロビン戦略を使用して負荷を分散します。

これは、オプション `ConnOpenStrategy` を通じて制御できます。

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/1c0d81d0b1388dbb9e09209e535667df212f4ae4/examples/clickhouse_api/multi_host.go#L50-L67)
### Execution {#execution}

任意のステートメントは `Exec` メソッドを介して実行できます。これはDDLや単純なステートメントに便利です。大きな挿入やクエリの反復には使用すべきではありません。

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/exec.go)

クエリにContextを渡すことができることに注意してください。これは、特定のクエリレベルの設定を渡すために使用できます - [Contextの使用](#using-context)を参照してください。
### Batch Insert {#batch-insert}

大量の行を挿入するために、クライアントはバッチ意味論を提供します。これは、行を追加できるバッチの準備を必要とします。これは最終的に `Send()` メソッドを介して送信されます。バッチは `Send` が実行されるまでメモリ内に保持されます。

接続の漏れを防ぐために、バッチで `Close` を呼び出すことをお勧めします。これは、バッチを準備した後に `defer` キーワードを使用して行うことができます。これにより、`Send` が呼び出されなかった場合に接続がクリーンアップされます。行が追加されなかった場合、これによりクエリログに0行の挿入が表示されることに注意してください。

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/batch.go)

ClickHouseへの推奨事項は[こちら](/guides/inserting-data#best-practices-for-inserts)で適用されます。バッチはgoルーチン間で共有しないでください - 各ルーチンごとに別のバッチを構築してください。

上記の例から、行を追加する際に変数タイプがカラムタイプと一致する必要があることに注意してください。マッピングは通常明白ですが、このインターフェースは柔軟性を保つことを目指し、精度の損失が発生しない限り、型は変換されます。例えば、次の例では、文字列をdatetime64に挿入することを示しています。

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/type_convert.go)

各カラムタイプのサポートされているgoタイプの完全な概要については、[Type Conversions](#type-conversions)を参照してください。
### Querying rows {#querying-rows}

ユーザーは `QueryRow` メソッドを使用して単一行をクエリするか、 `Query` を介して結果セットを反復するためのカーソルを取得できます。前者はデータをシリアル化するための宛先を受け入れ、後者は各行で `Scan` のコールが必要です。

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/query_row.go)

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/query_rows.go)

どちらの場合でも、シリアル化したいそれぞれのカラムの値を格納するための変数へのポインタを渡す必要があることに注意してください。これらは`SELECT` ステートメントで指定された順序で渡される必要があります - デフォルトでは、カラムの宣言順序が `SELECT *` の場合に使用されます。

挿入と同様に、Scanメソッドでは、ターゲット変数が適切な型である必要があります。これは再び柔軟性を持たせることを目的としており、可能な限り型が変換されます。たとえば、上記の例ではUUIDカラムが文字列変数に読み込まれることを示しています。各カラムタイプのサポートされているgoタイプの完全なリストについては、[Type Conversions](#type-conversions)を参照してください。

最後に、`Query`および`QueryRow`メソッドに`Context`を渡す能力に注意してください。これはクエリレベルの設定に使用できます - 詳細については[Contextの使用](#using-context)を参照してください。
### Async Insert {#async-insert}

非同期挿入は、Asyncメソッドを通じてサポートされます。これにより、クライアントがサーバーが挿入を完了するのを待つべきか、データが受信されたら応答するべきかを指定できます。これは実質的にパラメータ[wait_for_async_insert](/operations/settings/settings#wait_for_async_insert)を制御します。

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
    )`, i, "Golang SQL database driver"), false); err != nil {
        return err
    }
}
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/async.go)
### Columnar Insert {#columnar-insert}

挿入は列形式で行うことができます。これは、データがすでにこの構造で配置されている場合、行にピボットする必要を回避することによりパフォーマンスの利点を提供します。

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
    col2 = append(col2, "Golang SQL database driver")
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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/columnar_insert.go)
### Using structs {#using-structs}

ユーザーにとって、Golang の構造体は ClickHouse におけるデータ行の論理的な表現を提供します。これを支援するために、ネイティブインターフェースはいくつかの便利な関数を提供します。
#### Select with serialize {#select-with-serialize}

Select メソッドは、応答行のセットを一回の呼び出しで構造体のスライスにマシャルすることを可能にします。

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/select_struct.go)
#### Scan struct {#scan-struct}

`ScanStruct` は、クエリからの単一行を構造体にマシャルします。

```go
var result struct {
    Col1  int64
    Count uint64 `ch:"count"`
}
if err := conn.QueryRow(context.Background(), "SELECT Col1, COUNT() AS count FROM example WHERE Col1 = 5 GROUP BY Col1").ScanStruct(&result); err != nil {
    return err
}
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/scan_struct.go)
#### Append struct {#append-struct}

`AppendStruct` は、既存の[バッチ](#batch-insert)に構造体を追加し、完全な行として解釈できるようにします。これには、構造体のカラムがテーブルと名称と型の両方で一致する必要があります。すべてのカラムが同等の構造体フィールドを持つ必要がありますが、一部の構造体フィールドは同等のカラム表現を持たない場合もあります。これらは単に無視されます。

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/append_struct.go)
### Type conversions {#type-conversions}

クライアントは、挿入と応答のマシャルの両方において、受け入れる変数の型に関して可能な限り柔軟であることを目指しています。ほとんどの場合、ClickHouseのカラム型に対応するGolangの型が存在します。例えば、[UInt64](/sql-reference/data-types/int-uint/)を[uint64](https://pkg.go.dev/builtin#uint64)にマッピングできます。これらの論理的マッピングは常にサポートされるべきです。ユーザーは、変数型をカラムに挿入するために使用するか、受信応答を受け取るために使用できるようにするために、変換が最初に行われる場合も想定しています。クライアントは、透明にこれらの変換をサポートすることを目指しており、ユーザーが挿入の前にデータを正確に整列する必要がないようにし、クエリ時に柔軟なマシャリングを提供します。この透明な変換は精度の損失を許可しません。例えば、uint32はUInt64カラムからデータを受信するためには使用できません。逆に、文字列は形式要件を満たしている場合、datetime64フィールドに挿入できます。

現在サポートされているプリミティブ型に対する型変換は[こちら](https://github.com/ClickHouse/clickhouse-go/blob/main/TYPES.md)に記録されています。

この取り組みは継続中で、挿入(`Append`/`AppendRow`)と読み取り時間（`Scan`を介して）に分けられます。特定の変換のサポートが必要な場合は、問題を提起してください。
### Complex types {#complex-types}
#### Date/DateTime types {#datedatetime-types}

ClickHouse Go クライアントは `Date`、`Date32`、`DateTime`、および `DateTime64` の日付/日時型をサポートしています。日付は `2006-01-02` の形式の文字列として、またはネイティブGoの `time.Time{}` または `sql.NullTime` を使用して挿入できます。日時も後者のタイプをサポートしますが、文字列は「`2006-01-02 15:04:05`」の形式で渡す必要があり、オプショナルのタイムゾーンオフセットとして「`2006-01-02 15:04:05 +08:00`」を指定できます。`time.Time{}` および `sql.NullTime` は、読み取り時にもサポートされており、`sql.Scanner` インターフェースの任意の実装もサポートされています。

タイムゾーン情報の取り扱いは、ClickHouseの型および値の挿入または読み取りによって異なります：

* **DateTime/DateTime64**
  * **挿入**時に、値はUNIXタイムスタンプ形式でClickHouseに送信されます。タイムゾーンが指定されていない場合、クライアントはローカルタイムゾーンを使用するとみなします。`time.Time{}`または`sql.NullTime`はそれに応じてエポックに変換されます。
  * **選択**時に、カラムのタイムゾーンが設定されていれば、`time.Time`値を返すときに用いられます。そうでない場合は、サーバーのタイムゾーンが使用されます。
* **Date/Date32**
  * **挿入**時に、日付のタイムゾーンは、日付をUNIXタイムスタンプに変換する際に考慮されます。つまり、ClickHouseにはロケールを持たないため、日付として保存される前にタイムゾーンによってオフセットが調整されます。これは文字列値で指定されない場合、ローカルタイムゾーンが使用されます。
  * **選択**時に、日付は `time.Time{}` にスキャンされ、タイムゾーン情報なしで `sql.NullTime{}` インスタンスが返されます。
#### Array {#array}

配列はスライスとして挿入されるべきです。サポートされる要素の型のルールは、[プリミティブ型](#type-conversions)に対するルールと一致します。つまり、可能な限り要素は変換されます。

スキャン時にはスライスへのポインタを提供する必要があります。

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/array.go)
#### Map {#map}

マップは、定義された型ルールに従ったキーと値のあるGolangのマップとして挿入されるべきです。[earlier](#type-conversions)

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/map.go)
#### Tuples {#tuples}

タプルは、任意の長さのカラムのグループを表します。カラムは明示的に名前を付けるか、または型だけを指定することができます。

```sql
//unnamed
Col1 Tuple(String, Int64)

//named
Col2 Tuple(name String, id Int64, age uint8)
```

これらのアプローチのうち、名前付きタプルはより大きな柔軟性を提供します。名前の付いていないタプルは、スライスを使用して挿入および読み込む必要がありますが、名前付きタプルはマップとも互換性があります。

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

// both named and unnamed can be added with slices. Note we can use strongly typed lists and maps if all elements are the same type
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
// named tuples can be retrieved into a map or slices, unnamed just slices
if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2, &col3); err != nil {
    return err
}
fmt.Printf("row: col1=%v, col2=%v, col3=%v\n", col1, col2, col3)
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/tuple.go)

注意：型付きスライスとマップがサポートされており、名前付きタプルのすべてのサブカラムが同じ型である必要があります。
#### Nested {#nested}

ネストされたフィールドは、名前付きタプルの配列に相当します。使用方法は、ユーザーが[flatten_nested](/operations/settings/settings#flatten_nested)を1または0に設定したかどうかによります。

`flatten_nested`を0に設定すると、ネストされたカラムは単一の配列のタプルとして保持されます。これにより、ユーザーは挿入および取得のためにマップのスライスを使用し、任意のレベルのネストを利用できます。マップのキーはカラムの名前と等しくする必要があります。以下の例に示されています。

注意：マップはタプルを表すため、型は `map[string]interface{}` である必要があります。値は現在、強く型付けされていません。

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

[Full Example - `flatten_tested=0`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L28-L118)

デフォルトの値1が `flatten_nested` に使用される場合、ネストされたカラムは別の配列にフラット化されます。これには、挿入および取得のためにネストされたスライスを使用する必要があります。任意のレベルのネストが機能する可能性がありますが、これは公式にはサポートされていません。

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

[Full Example - `flatten_nested=1`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L123-L180)

注意：ネストされたカラムは、同じ次元を持つ必要があります。たとえば、上記の例では `Col_2_2` と `Col_2_1` は同じ数の要素を持つ必要があります。

より簡潔なインターフェースとネストの公式サポートにより、`flatten_nested=0` を推奨します。
#### Geo types {#geo-types}

このクライアントは、Point、Ring、Polygon、Multi PolygonといったGeo型をサポートしています。これらのフィールドは、[github.com/paulmach/orb](https://github.com/paulmach/orb) パッケージを用いてGolangで表現されます。

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/geo.go)
#### UUID {#uuid}

UUID型は、[github.com/google/uuid](https://github.com/google/uuid) パッケージによってサポートされています。ユーザーは、UUIDを文字列または `sql.Scanner` または `Stringify` を実装する任意の型として送信およびマシャルすることもできます。

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/uuid.go)
#### Decimal {#decimal}

Decimal型は、[github.com/shopspring/decimal](https://github.com/shopspring/decimal) パッケージによってサポートされています。

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/decimal.go)
#### Nullable {#nullable}

GoのNil値はClickHouseのNULLを表します。これはフィールドがNullableとして宣言されている場合に使用できます。挿入時に、Nilは通常版およびNullable版のカラムの両方に渡されることができます。前者の場合、その型のデフォルト値が保持されます。たとえば、文字列の場合は空の文字列です。Nullable版の場合、ClickHouseにはNULL値が保存されます。

スキャン時に、ユーザーはNullableフィールドのnil値を表すために、nilをサポートする型へのポインタを渡す必要があります。以下の例では、col1がNullable(String)であるため、**stringを受け取ります。これにより、nilを表現できます。

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nullable.go)

クライアントはさらに `sql.Null*` 型（例： `sql.NullInt64`）をサポートしています。これらはそれぞれのClickHouse型との互換性があります。
#### Big Ints - Int128, Int256, UInt128, UInt256 {#big-ints---int128-int256-uint128-uint256}

64ビットを超える数値型は、ネイティブGoの[big](https://pkg.go.dev/math/big)パッケージを使用して表現されます。

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/big_int.go)
### Compression {#compression}

圧縮メソッドのサポートは、使用される基盤プロトコルに依存します。ネイティブプロトコルの場合、クライアントは`LZ4`および`ZSTD`圧縮をサポートしています。これはブロックレベルでのみ実行されます。圧縮は接続時に `Compression` 設定を含めることによって有効にできます。

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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/compression.go)

標準インターフェースをHTTPで使用する場合、追加の圧縮技術が利用可能です。詳細については[database/sql API - Compression](#compression)を参照してください。
### Parameter binding {#parameter-binding}

クライアントは `Exec`、`Query`、および `QueryRow` メソッドのためのパラメータバインディングをサポートしています。以下の例のように、これは名前付き、番号付き、位置パラメータを使用してサポートされています。以下にこれらの例を提供します。

```go
var count uint64
// positional bind
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 >= ? AND Col3 < ?", 500, now.Add(time.Duration(750)*time.Second)).Scan(&count); err != nil {
    return err
}
// 250
fmt.Printf("Positional bind count: %d\n", count)
// numeric bind
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= $2 AND Col3 > $1", now.Add(time.Duration(150)*time.Second), 250).Scan(&count); err != nil {
    return err
}
// 100
fmt.Printf("Numeric bind count: %d\n", count)
// named bind
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= @col1 AND Col3 > @col3", clickhouse.Named("col1", 100), clickhouse.Named("col3", now.Add(time.Duration(50)*time.Second))).Scan(&count); err != nil {
    return err
}
// 50
fmt.Printf("Named bind count: %d\n", count)
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind.go)
#### Special cases {#special-cases}

デフォルトでは、スライスはクエリへのパラメータとして渡されたときにカンマ区切りの値のリストに展開されます。ユーザーが値のセットを `[ ]` でラップされた状態で挿入する必要がある場合、`ArraySet` を使用する必要があります。

グループ/タプルが必要な場合、ラップされた `( )` でIN演算子とともに使用するために、ユーザーは `GroupSet` を使用することができます。以下の例に示されているように、複数のグループを必要とする場合に特に便利です。

最後に、DateTime64フィールドには精度が必要であり、パラメータが適切にレンダリングされることを保証する必要があります。しかし、クライアントはフィールドの精度レベルを認識していないため、ユーザーがそれを提供する必要があります。これを容易にするために、`DateNamed` パラメータを提供します。

```go
var count uint64
// arrays will be unfolded
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN (?)", []int{100, 200, 300, 400, 500}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Array unfolded count: %d\n", count)
// arrays will be preserved with []
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col4 = ?", clickhouse.ArraySet{300, 301}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Array count: %d\n", count)
// Group sets allow us to form ( ) lists
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN ?", clickhouse.GroupSet{[]interface{}{100, 200, 300, 400, 500}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Group count: %d\n", count)
// More useful when we need nesting
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE (Col1, Col5) IN (?)", []clickhouse.GroupSet{{[]interface{}{100, 101}}, {[]interface{}{200, 201}}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("Group count: %d\n", count)
// Use DateNamed when you need a precision in your time#
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col3 >= @col3", clickhouse.DateNamed("col3", now.Add(time.Duration(500)*time.Millisecond), clickhouse.NanoSeconds)).Scan(&count); err != nil {
    return err
}
fmt.Printf("NamedDate count: %d\n", count)
```

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind_special.go)
### Using context {#using-context}

Goのコンテキストは、API境界を越えて期限、キャンセル信号、およびその他のリクエストスコープの値を渡す手段を提供します。接続のすべてのメソッドは、最初の変数としてコンテキストを受け取ります。前の例ではcontext.Background()が使用されていましたが、ユーザーはこの機能を利用して設定や期限を渡し、クエリをキャンセルできます。

`withDeadline`で作成したコンテキストを渡すと、クエリに実行時間の制限を設けることができます。これは絶対的な時間であり、期限が切れると接続が解放され、ClickHouseにキャンセル信号が送信されます。代わりに `WithCancel` を使用してクエリを明示的にキャンセルすることもできます。

ヘルパー関数 `clickhouse.WithQueryID` と `clickhouse.WithQuotaKey` により、クエリIDとクォータキーを指定できます。クエリIDはログのクエリを追跡するのに役立ち、キャンセル目的にも使用されます。クォータキーは、ユニークなキー値を基にClickHouseの使用を制限するために使用できます - 詳細については[Quotas Management ](/operations/access-rights#quotas-management)を参照してください。

ユーザーはまた、コンテキストを使用して特定のクエリに対してのみ設定が適用されることを保証できます - 完全な接続のためではなく、[Connection Settings](#connection-settings)に示すように。

最後に、ユーザーは `clickhouse.WithBlockSize` を介してブロックバッファのサイズを制御できます。これにより接続レベル設定 `BlockBufferSize` が上書きされ、常にメモリ内でデコードされ保持される最大ブロック数が制御されます。大きな値は、メモリの代償としてより多くの並行処理を意味する可能性があります。

上記の例は以下に示されています。

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
// we can use context to pass settings to a specific API call
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "allow_experimental_object_type": "1",
}))

conn.Exec(ctx, "DROP TABLE IF EXISTS example")

// to create a JSON column we need allow_experimental_object_type=1
if err = conn.Exec(ctx, `
    CREATE TABLE example (
            Col1 JSON
        )
        Engine Memory
    `); err != nil {
    return err
}

// queries can be cancelled using the context
ctx, cancel := context.WithCancel(context.Background())
go func() {
    cancel()
}()
if err = conn.QueryRow(ctx, "SELECT sleep(3)").Scan(); err == nil {
    return fmt.Errorf("expected cancel")
}

// set a deadline for a query - this will cancel the query after the absolute time is reached.
// queries will continue to completion in ClickHouse
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.Ping(ctx); err == nil {
    return fmt.Errorf("expected deadline exceeeded")
}

// set a query id to assist tracing queries in logs e.g. see system.query_log
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
// set a quota key - first create the quota
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

[Full Example](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/context.go)

### プログレス/プロファイル/ログ情報 {#progressprofilelog-information}

クエリの進行状況、プロファイル、およびログ情報は、リクエストすることができます。進行状況情報は、ClickHouseで読み取られ処理された行とバイトの数に関する統計を報告します。一方、プロファイル情報は、クライアントに返されるデータの概要を提供し、バイト（圧縮されていない）、行、およびブロックの合計を含みます。最後に、ログ情報は、メモリ使用量やデータ速度など、スレッドに関する統計を提供します。

この情報を取得するには、ユーザーが[Context](#using-context)を使用する必要があります。このコンテキストにコールバック関数を渡すことができます。

```go
totalRows := uint64(0)
// use context to pass a call back for progress and profile info
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
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/progress.go)
### 動的スキャン {#dynamic-scanning}

ユーザーは、スキーマや返されるフィールドのタイプがわからないテーブルを読み取る必要があるかもしれません。これは、アドホックデータ分析が行われる場合や、汎用ツールが書かれる場合に一般的です。これを達成するために、クエリレスポンスでカラムタイプ情報が利用可能です。これは、Goのリフレクションを使用して、正しく型指定された変数のランタイムインスタンスを作成し、Scanに渡すことができます。

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

[外部テーブル](/engines/table-engines/special/external-data/)は、クライアントがデータをClickHouseに送信することを許可します。これは、SELECTクエリを使用します。このデータは、一時テーブルに格納され、評価のためにクエリ自体で使用できます。

クエリでクライアントに外部データを送信するには、ユーザーが`ext.NewTable`を介して外部テーブルを構築し、これをコンテキストを介して渡す必要があります。

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
### オープンテレメトリー {#open-telemetry}

ClickHouseは、[トレースコンテキスト](/operations/opentelemetry/)をネイティブプロトコルの一部として渡すことを許可します。クライアントは、`clickhouse.withSpan`関数を介してSpanを作成し、これをContextを通じて渡すことができます。

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

トレースの利用に関する詳細は、[OpenTelemetryサポート](/operations/opentelemetry/)の下で見つけることができます。
## データベース/SQL API {#databasesql-api}

`database/sql`または「標準」APIは、アプリケーションコードが基盤となるデータベースに依存しないシナリオでクライアントを使用することを可能にします。これは何らかのコストがかかります - 追加の抽象化と間接層、ClickHouseに必ずしも整合しないプリミティブが含まれます。ただし、これらのコストは、ツールが複数のデータベースに接続する必要があるシナリオでは通常許容可能です。

加えて、このクライアントは、データが最適なパフォーマンスのためにネイティブ形式でエンコードされるため、HTTPをトランスポート層として使用することがサポートされています。

以下は、ClickHouse APIのドキュメントの構造を反映することを目的としています。

標準APIの完全なコード例は[こちら](https://github.com/ClickHouse/clickhouse-go/tree/main/examples/std)で見つけることができます。
### 接続 {#connecting-1}

接続は、`clickhouse://<host>:<port>?<query_option>=<value>`という形式のDSN文字列を使用して、`Open`メソッドを介して行うことができます。または、`clickhouse.OpenDB`メソッドを使用して行うこともできます。後者は`database/sql`仕様の一部ではありませんが、`sql.DB`インスタンスを返します。このメソッドは、`database/sql`仕様に明示的に公開する方法がないプロファイリングなどの機能を提供します。

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

**以降のすべての例では、明示的に示されていない限り、ClickHouseの`conn`変数が作成され、利用可能であると想定します。**
#### 接続設定 {#connection-settings-1}

次のパラメーターをDSN文字列に渡すことができます。

* `hosts` - ロードバランシングとフェイルオーバーのためのカンマ区切りの単一アドレスホストのリスト - [複数ノードへの接続](#connecting-to-multiple-nodes)を参照。
* `username/password` - 認証情報 - [認証](#authentication)を参照。
* `database` - 現在のデフォルトデータベースを選択。
* `dial_timeout` - 期間文字列は、符号付きの10進数の数値のシーケンスであり、各数値にオプションの小数点および`300ms`、`1s`などの単位のサフィックスがあります。有効な時間単位は`ms`、`s`、`m`です。
* `connection_open_strategy` - `random/in_order`（デフォルトは`random`） - [複数ノードへの接続](#connecting-to-multiple-nodes)を参照。
  - `round_robin` - セットからラウンドロビンサーバーを選択。
  - `in_order` - 指定された順序で最初のライブサーバーを選択。
* `debug` - デバッグ出力を有効にする（真偽値）。
* `compress` - 圧縮アルゴリズムを指定 - `none`（デフォルト）、`zstd`、`lz4`、`gzip`、`deflate`、`br`。`true`に設定すると、`lz4`が使用されます。ネイティブ通信には`lz4`と`zstd`のみがサポートされています。
* `compress_level` - 圧縮レベル（デフォルトは`0`）。圧縮については、これがアルゴリズム固有です：
  - `gzip` - `-2`（最高速度）から`9`（最高圧縮）
  - `deflate` - `-2`（最高速度）から`9`（最高圧縮）
  - `br` - `0`（最高速度）から`11`（最高圧縮）
  - `zstd`、`lz4` - 無視。
* `secure` - セキュアなSSL接続を確立（デフォルトは`false`）。
* `skip_verify` - 証明書の検証をスキップ（デフォルトは`false`）。
* `block_buffer_size` - ユーザーがブロックバッファサイズを制御できるようにします。[`BlockBufferSize`](#connection-settings)を参照してください。（デフォルトは`2`）

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
#### 接続プーリング {#connection-pooling-1}

ユーザーは、[複数ノードへの接続](#connecting-to-multiple-nodes)で説明したように、提供されたノードアドレスのリストの使用に影響を与えることができます。ただし、接続管理とプーリングは設計上`sql.DB`に委譲されています。
#### HTTP経由の接続 {#connecting-over-http}

デフォルトでは、接続はネイティブプロトコルを介して確立されます。HTTPが必要なユーザーには、DSNを変更してHTTPプロトコルを含めるか、接続オプションにプロトコルを指定することでそれを有効にできます。

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

`OpenDB`を使用する場合、ClickHouse APIで使用されたのと同じオプションアプローチを使用して複数のホストに接続できます - オプションで`ConnOpenStrategy`を指定します。

DSNベースの接続では、文字列は複数のホストと、`connection_open_strategy`パラメータを受け入れ、値`round_robin`または`in_order`を設定できます。

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

DSN接続文字列を使用する場合、SSLは「secure=true」パラメーターを介して有効にできます。`OpenDB`メソッドは、[ネイティブAPI](#using-tls)のTLSと同じアプローチを利用し、nil以外のTLS構造体の仕様に依存します。DSN接続文字列は、SSL検証をスキップするためのパラメーター`skip_verify`をサポートしていますが、`OpenDB`メソッドは、構成を渡すことを許可するため、より高度なTLS構成に必要です。

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

`OpenDB`を使用している場合、認証情報は通常のオプションを介して渡すことができます。DSNベースの接続では、接続文字列にユーザー名とパスワードをパラメーターとして渡すことができますし、またはアドレスにエンコードされた資格情報として渡すこともできます。

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

接続が取得されると、ユーザーはExecメソッドを介して`sql`文を実行できます。

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

このメソッドは、コンテキストの受信をサポートしていません - デフォルトでは、バックグラウンドコンテキストで実行されます。これが必要な場合は、`ExecContext`を使用できます - [Contextの使用](#using-context)を参照してください。
### バッチ挿入 {#batch-insert-1}

バッチセマンティクスは、`Being`メソッドを介して`sql.Tx`を作成することで達成できます。そこから、`INSERT`文を使用して`Prepare`メソッドでバッチを取得できます。これにより、行を追加できる`sql.Stmt`が返されます。バッチは、元の`sql.Tx`で`Commit`が実行されるまでメモリに蓄積されます。

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

単一行のクエリは、`QueryRow`メソッドを使用して実現できます。これにより、*sql.Rowが返され、Scanは、カラムがマシャルされる変数へのポインタで呼び出すことができます。`QueryRowContext`のバリアントを使用すると、バックグラウンド以外のコンテキストを渡すことができます - [Contextの使用](#using-context)を参照してください。

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

複数の行を繰り返すには、`Query`メソッドが必要です。これにより、`*sql.Rows`構造体が返され、Nextを呼び出して行を繰り返すことができます。同様に、`QueryContext`の同等物では、コンテキストを渡すことができます。

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

非同期挿入は、`ExecContext`メソッドを介して挿入を実行することで実現できます。これは、以下に示すように非同期モードを有効にしたコンテキストを渡す必要があります。これにより、クライアントがサーバーが挿入を完了するのを待つか、データが受信されたら応答するかを指定できます。これは実質的に、[wait_for_async_insert](/operations/settings/settings#wait_for_async_insert)パラメータを制御します。

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
### 列指向挿入 {#columnar-insert-1}

標準インターフェースを使用してはサポートされていません。
### 構造体の使用 {#using-structs-1}

標準インターフェースを使用してはサポートされていません。
### 型変換 {#type-conversions-1}

標準の`database/sql`インターフェースは、[ClickHouse API](#type-conversions)と同じ型をサポートしているはずです。いくつかの例外、特に複雑な型に関しては、以下に文書化しています。ClickHouse APIと同様に、クライアントは挿入とレスポンスのマシャリングの両方に関して、変数型の受け入れにおいてできるだけ柔軟であることを目指しています。詳細については[型変換](#type-conversions)を参照してください。
### 複雑な型 {#complex-types-1}

明示されていない限り、複雑な型の取り扱いは、[ClickHouse API](#complex-types)と同じであるべきです。違いは`database/sql`内部の結果です。
#### マップ {#maps}

ClickHouse APIとは異なり、標準APIではマップがスキャンタイプで強く型指定される必要があります。たとえば、ユーザーは`Map(String,String)`フィールドに対して`map[string]interface{}`を渡すことはできず、代わりに`map[string]string`を使用する必要があります。`interface{}`変数は常に互換性があり、より複雑な構造体に使用できます。読み取り時に構造体はサポートされていません。

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

挿入の振る舞いはClickHouse APIと同じです。
### 圧縮 {#compression-1}

標準APIは、ネイティブの[ClickHouse API](#compression)と同じ圧縮アルゴリズム、すなわちブロックレベルで`lz4`および`zstd`圧縮をサポートしています。また、HTTP接続に対してgzip、deflateおよびbr圧縮がサポートされています。これらのいずれかが有効になっている場合、圧縮は挿入中およびクエリレスポンスに対してブロックで実行されます。他のリクエスト、例えばpingやクエリリクエストは、圧縮されずにそのまま残ります。これは`lz4`および`zstd`オプションと一貫しています。

接続を確立するために`OpenDB`メソッドを使用する場合、圧縮設定を渡すことができます。これには、圧縮レベルの指定が含まれます（以下を参照）。DSNで`sql.Open`を介して接続する場合は、`compress`パラメーターを利用します。これは特定の圧縮アルゴリズムであることができます、すなわち`gzip`、`deflate`、`br`、`zstd`または`lz4`であるか、真偽値フラグです。`true`に設定すると、`lz4`が使用されます。デフォルトは`none`すなわち圧縮無効です。

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

適用される圧縮のレベルは、DSNパラメーター`compress_level`または圧縮オプションのレベルフィールドで制御できます。これはデフォルトで0ですが、アルゴリズム固有です：

* `gzip` - `-2`（最高速度）から`9`（最高圧縮）
* `deflate` - `-2`（最高速度）から`9`（最高圧縮）
* `br` - `0`（最高速度）から`11`（最高圧縮）
* `zstd`、`lz4` - 無視。
### パラメーターのバインディング {#parameter-binding-1}

標準APIは、[ClickHouse API](#parameter-binding)と同じパラメーターのバインディング機能をサポートしており、パラメーターを`Exec`、`Query`および`QueryRow`メソッド（およびそれらの同等の[Context](#using-context)バリアント）に渡すことができます。位置指定、名前指定、番号付きパラメーターがサポートされています。

```go
var count uint64
// positional bind
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 >= ? AND Col3 < ?", 500, now.Add(time.Duration(750)*time.Second)).Scan(&count); err != nil {
    return err
}
// 250
fmt.Printf("Positional bind count: %d\n", count)
// numeric bind
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= $2 AND Col3 > $1", now.Add(time.Duration(150)*time.Second), 250).Scan(&count); err != nil {
    return err
}
// 100
fmt.Printf("Numeric bind count: %d\n", count)
// named bind
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= @col1 AND Col3 > @col3", clickhouse.Named("col1", 100), clickhouse.Named("col3", now.Add(time.Duration(50)*time.Second))).Scan(&count); err != nil {
    return err
}
// 50
fmt.Printf("Named bind count: %d\n", count)
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/bind.go)

[特別なケース](#special-cases)は依然として適用されます。
### コンテキストの使用 {#using-context-1}

標準APIは、[ClickHouse API](#using-context)と同様に、デッドライン、キャンセリングシグナル、およびリクエストスコープの他の値をコンテキストを介して渡すことができる同じ能力をサポートしています。ClickHouse APIとは異なり、これは方法の`Context`バリアントを使用することで達成されます。すなわち、デフォルトではバックグラウンドコンテキストを使用する`Exec`のようなメソッドには、コンテキストを最初のパラメーターとして渡すことができる`ExecContext`というバリアントがあります。これにより、アプリケーションフローの任意の段階でコンテキストを渡すことができます。たとえば、ユーザーは`ConnContext`を介して接続を確立する際や、`QueryRowContext`を介してクエリ行を要求する際にコンテキストを渡すことができます。利用可能なメソッドのすべての例は以下に示されています。

デッドライン、キャンセリングシグナル、クエリID、クォータキー、接続設定を渡す際のコンテキストの使用の詳細については、[ClickHouse API](#using-context)におけるContextの使用を参照してください。

```go
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "allow_experimental_object_type": "1",
}))
conn.ExecContext(ctx, "DROP TABLE IF EXISTS example")
// to create a JSON column we need allow_experimental_object_type=1
if _, err = conn.ExecContext(ctx, `
    CREATE TABLE example (
            Col1 JSON
        )
        Engine Memory
    `); err != nil {
    return err
}

// queries can be cancelled using the context
ctx, cancel := context.WithCancel(context.Background())
go func() {
    cancel()
}()
if err = conn.QueryRowContext(ctx, "SELECT sleep(3)").Scan(); err == nil {
    return fmt.Errorf("expected cancel")
}

// set a deadline for a query - this will cancel the query after the absolute time is reached. Again terminates the connection only,
// queries will continue to completion in ClickHouse
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.PingContext(ctx); err == nil {
    return fmt.Errorf("expected deadline exceeeded")
}

// set a query id to assist tracing queries in logs e.g. see system.query_log
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
// set a quota key - first create the quota
if _, err = conn.ExecContext(ctx, "CREATE QUOTA IF NOT EXISTS foobar KEYED BY client_key FOR INTERVAL 1 minute MAX queries = 5 TO default"); err != nil {
    return err
}

// queries can be cancelled using the context
ctx, cancel = context.WithCancel(context.Background())
// we will get some results before cancel
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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/context.go)
### セッション {#sessions}

ネイティブ接続は本質的にセッションを持っていますが、HTTP経由の接続では、設定としてコンテキストに渡すセッションIDをユーザーが作成する必要があります。これにより、一時テーブルなど、セッションにバインドされた機能を使用できます。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/session.go)
### 動的スキャン {#dynamic-scanning-1}

[ClickHouse API](#dynamic-scanning)と同様に、列タイプ情報が利用可能で、ユーザーが正しく型指定された変数のランタイムインスタンスを作成し、これをScanに渡すことができます。これにより、タイプが不明な場合の列の読み取りが可能になります。

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

[外部テーブル](/engines/table-engines/special/external-data/)は、クライアントがデータをClickHouseに送信することを許可します。これは、`SELECT`クエリを使用します。このデータは、一時テーブルに格納され、評価のためにクエリ自体で使用できます。

クエリでクライアントに外部データを送信するには、ユーザーが`ext.NewTable`を介して外部テーブルを構築し、これをコンテキストを介して渡す必要があります。

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
### オープンテレメトリー {#open-telemetry-1}

ClickHouseは、[トレースコンテキスト](/operations/opentelemetry/)をネイティブプロトコルの一部として渡すことを許可します。クライアントは、`clickhouse.withSpan`関数を介してSpanを作成し、これをContextを介して渡すことでこれを実現します。これは、HTTPがトランスポートとして使用される場合にはサポートされていません。

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

* 可能な場合はClickHouse APIを利用してください、特にプリミティブ型に対して。これにより、重要なリフレクションと間接処理を避けることができます。
* 大規模なデータセットを読み取る場合は、[`BlockBufferSize`](#connection-settings)を修正することを検討してください。これにより、メモリフットプリントは増加しますが、行の繰り返し中に並行してデコードできるブロックが増えることを意味します。デフォルト値の2は保守的であり、メモリのオーバーヘッドを最小限に抑えます。より高い値はメモリ内のブロックが増えることになります。異なるクエリは異なるブロックサイズを生成する可能性があるため、テストが必要です。これにより、[クエリレベル](#using-context)でContextを介して設定できます。
* データを挿入する際は、型を明示的に指定してください。クライアントは、UUIDやIPのために文字列を解析することを許可するなど柔軟性を目指していますが、これはデータ検証を要求し、挿入時にコストが発生します。
* 可能な場合には列指向挿入を使用してください。再び、これらは強く型指定されるべきであり、クライアントがあなたの値を変換する必要を避けます。
* ClickHouseの[推奨事項](/sql-reference/statements/insert-into/#performance-considerations)に従い、最適な挿入パフォーマンスを確保してください。
