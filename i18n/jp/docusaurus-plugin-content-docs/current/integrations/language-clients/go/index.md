---
sidebar_label: 'Go'
sidebar_position: 1
keywords:
- 'clickhouse'
- 'go'
- 'client'
- 'golang'
slug: '/integrations/go'
description: 'The Go clients for ClickHouse allows users to connect to ClickHouse
  using either the Go standard database/sql interface or an optimized native interface.'
title: 'ClickHouse Go'
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';



# ClickHouse Go
## 簡単な例 {#a-simple-example}

簡単な例を使ってGoを試してみましょう。これによりClickHouseに接続し、システムデータベースから選択します。始めるには、接続情報が必要です。
### 接続情報 {#connection-details}

<ConnectionDetails />
### モジュールの初期化 {#initialize-a-module}

```bash
mkdir clickhouse-golang-example
cd clickhouse-golang-example
go mod init clickhouse-golang-example
```
### サンプルコードのコピー {#copy-in-some-sample-code}

このコードを `clickhouse-golang-example` ディレクトリに `main.go` としてコピーしてください。

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
### go mod tidyを実行 {#run-go-mod-tidy}

```bash
go mod tidy
```
### 接続情報を設定する {#set-your-connection-details}
以前に接続情報を調べました。 `main.go` の `connect()` 関数に設定します：

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
### サンプルを実行 {#run-the-example}
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
### 詳細を学ぶ {#learn-more}
このカテゴリの残りのドキュメントは、ClickHouse Go クライアントの詳細をカバーしています。
## ClickHouse Go クライアント {#clickhouse-go-client}

ClickHouseは、2つの公式Goクライアントをサポートしています。これらのクライアントは相補的であり、意図的に異なるユースケースをサポートしています。

* [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) - Goの標準データベース/sqlインターフェースまたはネイティブインターフェースのいずれかをサポートする高レベル言語クライアント。
* [ch-go](https://github.com/ClickHouse/ch-go) - 低レベルクライアント。ネイティブインターフェースのみ。

clickhouse-goは高レベルのインターフェースを提供し、ユーザーが行指向のセマンティクスを使用してデータをクエリしたり挿入したりできるようにし、データ型に関して寛容なバッチを提供します - 精度の損失がない限り、値は変換されます。一方、ch-goは、タイプの厳密さとより複雑な使用の代償に、低CPUおよびメモリオーバーヘッドで迅速なデータブロックストリーミングを提供する最適化された列指向インターフェースを提供します。

バージョン2.3から、Clickhouse-goはエンコーディング、デコーディング、および圧縮などの低レベル機能のためにch-goを利用します。clickhouse-goはまた、Goの `database/sql` インターフェース標準もサポートしています。両方のクライアントは、最適なパフォーマンスを提供するためにエンコーディングにネイティブフォーマットを使用し、ネイティブClickHouseプロトコルを介して通信できます。clickhouse-goはまた、ユーザーがトラフィックをプロキシまたは負荷分散する必要がある場合のために、HTTPをその輸送メカニズムとしてサポートしています。

クライアントライブラリを選択する際、ユーザーはそれぞれの利点と欠点を認識する必要があります - クライアントライブラリの選択を参照してください。

|               | ネイティブフォーマット | ネイティブプロトコル | HTTPプロトコル | 行指向API | 列指向API | 型の柔軟性 | 圧縮 | クエリプレースホルダー |
|:-------------:|:-------------:|:---------------:|:-------------:|:------------------:|:---------------------:|:----------------:|:-----------:|:------------------:|
| clickhouse-go |       ✅       |        ✅        |       ✅       |          ✅         |           ✅           |         ✅        |      ✅      |          ✅         |
|     ch-go     |       ✅       |        ✅        |               |                    |           ✅           |                  |      ✅      |                    |
## クライアントの選択 {#choosing-a-client}

クライアントライブラリを選択することは、使用パターンと最適なパフォーマンスの必要性によって異なります。毎秒数百万の挿入が必要な挿入重視のユースケースでは、低レベルクライアントの[ch-go](https://github.com/ClickHouse/ch-go)の使用をお勧めします。このクライアントは、ClickHouseのネイティブフォーマットが要求する行指向形式から列にデータを変換する際の関連するオーバーヘッドを回避します。さらに、使用を簡素化するために、`interface{}` (`any`) タイプのリフレクションや使用を回避します。

集計や低スループットの挿入ワークロードに焦点を当てたクエリ処理では、[clickhouse-go](https://github.com/ClickHouse/clickhouse-go)が馴染みのある `database/sql` インターフェースとより簡単な行セマンティクスを提供します。ユーザーはまた、輸送プロトコルとしてHTTPを選択的に使用し、構造体との間で行をマールシャリングするためのヘルパー関数を利用することができます。
## clickhouse-goクライアント {#the-clickhouse-go-client}

clickhouse-goクライアントは、ClickHouseと通信するための2つのAPIインターフェースを提供します：

* ClickHouseクライアント特有のAPI
* `database/sql`標準 - Golangによって提供されるSQLデータベースの一般的なインターフェース。

`database/sql`は、データストアを抽象化する開発者にデータベース非依存のインターフェースを提供しますが、一部のタイプとクエリセマンティクスを強制し、パフォーマンスに影響を及ぼすことがあります。このため、[パフォーマンスが重要](https://github.com/clickHouse/clickHouse-go#benchmark)な場合は、クライアント特有のAPIを使用するべきです。ただし、複数のデータベースをサポートするツールにClickHouseを統合したいユーザーは、標準インターフェースの使用を好むかもしれません。

両方のインターフェースは、[ネイティブフォーマット](/native-protocol/basics.md)および通信のためのネイティブプロトコルを使用してデータをエンコードします。さらに、標準インターフェースはHTTPを介した通信をサポートしています。

|                    | ネイティブフォーマット | ネイティブプロトコル | HTTPプロトコル | バルク書き込みサポート | 構造体マールシャリング | 圧縮 | クエリプレースホルダー |
|:------------------:|:-------------:|:---------------:|:-------------:|:------------------:|:-----------------:|:-----------:|:------------------:|
|   ClickHouse API   |       ✅       |        ✅        |               |          ✅         |         ✅         |      ✅      |          ✅         |
| `database/sql` API |       ✅       |        ✅        |       ✅       |          ✅         |                   |      ✅      |          ✅         |
## インストール {#installation}

ドライバのv1は非推奨であり、機能更新や新しいClickHouseタイプのサポートには到達しません。ユーザーは、より優れたパフォーマンスを提供するv2に移行する必要があります。

クライアントの2.xバージョンをインストールするには、go.modファイルにパッケージを追加します：

`require github.com/ClickHouse/clickhouse-go/v2 main`

または、リポジトリをクローンします：

```bash
git clone --branch v2 https://github.com/clickhouse/clickhouse-go.git $GOPATH/src/github
```

別のバージョンをインストールするには、パスまたはブランチ名を適宜変更します。

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

クライアントはClickHouseとは独立してリリースされます。2.xは現在開発中のメジャーバージョンを表します。2.xのすべてのバージョンは互換性があります。
#### ClickHouseとの互換性 {#clickhouse-compatibility}

クライアントは以下をサポートします：

- 現在サポートされているすべてのClickHouseバージョンは、[こちら](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md)に記録されています。ClickHouseバージョンがもはやサポートされない場合、それらはクライアントリリースに対しても積極的にテストされることはありません。
- クライアントのリリース日から2年以内のすべてのClickHouseバージョン。ただし、LTSバージョンのみが積極的にテストされています。
#### Golangとの互換性 {#golang-compatibility}

| クライアントバージョン | Golangバージョン |
|:--------------:|:---------------:|
|  => 2.0 &lt;= 2.2 |    1.17, 1.18   |
|     >= 2.3     |       1.18      |
## ClickHouseクライアントAPI {#clickhouse-client-api}

ClickHouseクライアントAPIのすべてのコード例は[こちら](https://github.com/ClickHouse/clickhouse-go/tree/main/examples)で見つけることができます。
### 接続 {#connecting}

以下の例は、サーバーバージョンを返し、ClickHouseに接続することを示しています - ClickHouseが保護されておらず、デフォルトユーザーでアクセス可能であると仮定しています。

デフォルトのネイティブポートを使用して接続します。

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

**その後のすべての例では、明示的に示されない限り、ClickHouse `conn` 変数が作成されて利用可能であると仮定します。**
#### 接続設定 {#connection-settings}

接続を開くとき、Options構造体を使用してクライアントの動作を制御できます。以下の設定が利用可能です：

* `Protocol` - ネイティブまたはHTTP。HTTPは現在、[database/sql API](#databasesql-api)のみでサポートされています。
* `TLS` - TLSオプション。非nil値はTLSを有効にします。[TLSの使用](#using-tls)を参照してください。
* `Addr` - ポートを含むアドレスのスライス。
* `Auth` - 認証の詳細。[認証](#authentication)を参照してください。
* `DialContext` - 接続を確立する方法を決定するカスタムダイヤル関数。
* `Debug` - デバッグを有効にするためのtrue/false。
* `Debugf` - デバッグ出力を消費する関数を提供します。`debug`をtrueに設定する必要があります。
* `Settings` - ClickHouse設定のマップ。これらはすべてのClickHouseクエリに適用されます。[コンテキストの使用](#using-context)を使用すると、クエリごとに設定を設定できます。
* `Compression` - ブロックの圧縮を有効にします。[圧縮](#compression)を参照してください。
* `DialTimeout` - 接続を確立する最大時間。デフォルトは `1s` です。
* `MaxOpenConns` - 同時に使用する最大接続数。アイドルプールにはより多くまたは少ない接続がある可能性がありますが、この数の接続のみを使用できます。デフォルトは `MaxIdleConns+5` です。
* `MaxIdleConns` - プール内で維持する接続の数。可能な場合は接続が再利用されます。デフォルトは `5` です。
* `ConnMaxLifetime` - 接続を利用可能にする最大ライフタイム。デフォルトは1時間です。この時間の後、接続は破棄され、新しい接続がプールに追加されます。
* `ConnOpenStrategy` - ノードアドレスのリストをどのように消費して接続を開くかを決定します。[複数ノードへの接続](#connecting-to-multiple-nodes)を参照してください。
* `BlockBufferSize` - 一度にバッファにデコードする最大ブロック数。大きな値はメモリの代償に並列性を増やします。ブロックサイズはクエリに依存するため、接続でこれを設定できますが、返すデータに基づいてクエリごとに上書きすることをお勧めします。デフォルトは `2` です。

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
#### 接続プール {#connection-pooling}

クライアントは接続プールを維持し、必要に応じてこれらをクエリを跨いで再利用します。最も多く `MaxOpenConns` は同時に使用され、プールの最大サイズは `MaxIdleConns` によって制御されます。クライアントは各クエリ実行のためにプールから接続を取得し、再利用のためにプールに戻します。接続はバッチの生涯の間使用され、 `Send()` で解放されます。

ユーザーが `MaxOpenConns=1` を設定しない限り、プール内の同じ接続が後続のクエリに使用される保証はありません。これはあまり必要ありませんが、ユーザーが一時テーブルを使用している場合には必要です。

また、デフォルトで `ConnMaxLifetime` は1時間です。これは、ノードがクラスタから離れた場合にClickHouseへの負荷が不均一になるケースを引き起こす可能性があります。ノードが利用できなくなると接続は他のノードに均等に振り分けられます。これらの接続は保持され、デフォルトで1時間の間はリフレッシュされません。問題のあるノードがクラスタに戻っても同様です。負荷の高いワークロードの場合はこの値を下げることを検討してください。
### TLSの使用 {#using-tls}

低レベルでは、すべてのクライアント接続メソッド（`DSN/OpenDB/Open`）は、[Goのtlsパッケージ](https://pkg.go.dev/crypto/tls)を使用して安全な接続を確立します。Options構造体が非nilの `tls.Config` ポインタを含む場合、クライアントはTLSを使用することを認識します。

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

この最小限の `TLS.Config` は通常、ClickHouseサーバーのセキュアなネイティブポート（通常9440）に接続するのに十分です。ClickHouseサーバーに有効な証明書（期限切れ、誤ったホスト名、一般的に認識されたルート認証機関によって署名されていない）がない場合、 `InsecureSkipVerify` をtrueに設定することができますが、これは強く推奨されません。

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

追加のTLSパラメータが必要な場合、アプリケーションコードは `tls.Config` 構造体の必要なフィールドを設定するべきです。これには、特定の暗号スイートの強制、特定のTLSバージョンの強制（1.2または1.3など）、内部CA証明書チェーンの追加、ClickHouseサーバーによって要求された場合のクライアント証明書（および秘密鍵）の追加、そしてより専門的なセキュリティセットアップに付随するその他のオプションが含まれます。
### 認証 {#authentication}

接続情報にAuth構造体を指定してユーザー名とパスワードを指定します。

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

複数のアドレスを `Addr` 構造体を通じて指定できます。

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

* `ConnOpenInOrder` （デフォルト） - アドレスは順番に消費されます。後のアドレスは、リストに含まれる早いアドレスへの接続に失敗した場合にのみ使用されます。これは実質的にフェイルオーバー戦略です。
* `ConnOpenRoundRobin` - ラウンドロビン戦略を使用してアドレス間の負荷をバランスさせます。

これはオプション `ConnOpenStrategy` を通じて制御できます。

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

任意のステートメントを `Exec` メソッドを通じて実行できます。これはDDLおよび簡単なステートメントに有用です。大きな挿入やクエリ反復には使用しないでください。

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


クエリにContextを渡す能力に注意してください。これは特定のクエリレベルの設定を渡すのに使用できます - [コンテキストの使用](#using-context)を参照してください。
### バッチ挿入 {#batch-insert}

大量の行を挿入するには、クライアントはバッチセマンティクスを提供しています。これは、行を追加できるバッチの準備が必要です。これは最終的に `Send()` メソッドを通じて送信されます。バッチはSendが実行されるまでメモリに保持されます。

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

ClickHouseに対する推奨事項は[ここ](https://guides/inserting-data#best-practices-for-inserts)にも適用されます。バッチはゴルーチン間で共有しないでください - 各Routineごとに別々のバッチを構築してください。

上記の例から、行を追加する際には変数の型がカラムの型と一致する必要があることに注意してください。マッピングは通常明白ですが、このインターフェースは柔軟性を提供し、精度の損失がない限り型は変換されます。たとえば、次のことが示されています。

```go
batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
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


各カラム型に対するサポートされたgo型の完全な要約については、[型変換](#type-conversions)を参照してください。
### 行のクエリ {#querying-rows}


ユーザーは `QueryRow` メソッドを使用して単一の行をクエリするか、 `Query` を介して結果セットを反復するためのカーソルを取得できます。前者はデータがシリアライズされる先を受け入れますが、後者は各行で `Scan` を呼び出す必要があります。

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

どちらの場合でも、シリアライズしたい各カラムの値を格納する変数のポインタを渡す必要があることに注意してください。これらは、デフォルトで、 `SELECT` ステートメントで指定された順序で渡す必要があります - デフォルトでは、 `SELECT *` の場合、カラム宣言の順序が使用されます。

挿入と同様に、Scanメソッドはターゲット変数が適切な型である必要があります。これは再度柔軟であることを目指しており、精度の損失が可能であれば型が変換されます。たとえば、上記の例ではUUIDカラムが文字列変数に読み取られています。各カラム型に対するサポートされたgo型の完全なリストについては、[型変換](#type-conversions)を参照してください。

最後に、 `Query` および `QueryRow` メソッドに `Context` を渡す能力に注意してください。これはクエリレベルの設定に使用できます - 詳細は[コンテキストの使用](#using-context)を参照してください。
### 非同期挿入 {#async-insert}

非同期挿入はAsyncメソッドを介してサポートされています。これにより、クライアントがサーバーに挿入を完了するまで待機するか、データを受信した時点で応答するかを指定できます。これは実質的にパラメータ [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert) を制御します。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/async.go)
### 列指向挿入 {#columnar-insert}

挿入は列形式で行うことができます。これは、データがすでにこの構造である場合、行にピボットする必要を回避することにより、パフォーマンスの利点を提供します。

```go
batch, err := conn.PrepareBatch(context.Background(), "INSERT INTO example")
if err != nil {
    return err
}
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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/columnar_insert.go)
### 構造体を使用する {#using-structs}

ユーザーにとって、Golangの構造体はClickHouseにおけるデータ行の論理的な表現を提供します。これをサポートするために、ネイティブインターフェースはさまざまな便利な関数を提供します。
#### シリアライズでの選択 {#select-with-serialize}

Selectメソッドは、一度の呼び出しでレスポンス行のセットを構造体のスライスにマールシャルすることを可能にします。

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
```
#### Scan Struct {#scan-struct}

`ScanStruct` は、クエリからの単一行を構造体にマーシャリングすることを可能にします。

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
#### Append Struct {#append-struct}

`AppendStruct` は、構造体を既存の [batch](#batch-insert) に追加し、完全な行として解釈することを可能にします。これには、構造体のカラムがテーブルのカラムと名前と型が一致する必要があります。すべてのカラムには対応する構造体フィールドが必要ですが、いくつかの構造体フィールドには対応するカラム表現がない場合があります。これらは単に無視されます。

```go
batch, err := conn.PrepareBatch(context.Background(), "INSERT INTO example")
if err != nil {
    return err
}
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

クライアントは、挿入と応答のマーシャリングの両方に対して、変数型を受け入れる柔軟性を可能な限り高めることを目指しています。ほとんどの場合、ClickHouseのカラム型に対して等価なGolang型が存在します。例えば、[UInt64](/sql-reference/data-types/int-uint/) は [uint64](https://pkg.go.dev/builtin#uint64) にマッピングされます。これらの論理的なマッピングは常にサポートされるべきです。ユーザーは、カラムに挿入するために使用したり、応答を受け取るために使用したりできる変数型を利用したいと考えるかもしれません。変数または受信データのいずれかの変換が最初に行われる場合があります。クライアントは、これらの変換を透過的にサポートすることを目指しているため、ユーザーは挿入前にデータを正確に揃えるために変換する必要がなく、クエリ時に柔軟なマーシャリングを提供します。この透過的な変換では精度の喪失は許可されません。例えば、uint32はUInt64列からのデータを受け取るために使用することはできません。逆に、文字列はフォーマット要件を満たす限り、datetime64フィールドに挿入できます。

現在サポートされているプリミティブ型の型変換は[こちら](https://github.com/ClickHouse/clickhouse-go/blob/main/TYPES.md)に記載されています。

この努力は継続中であり、挿入（`Append`/`AppendRow`）と読み取り時（`Scan`を通じて）に分けることができます。特定の変換に対するサポートが必要な場合は、問題を提起してください。
### 複雑な型 {#complex-types}
#### 日付/日時型 {#datedatetime-types}

ClickHouseのGoクライアントは、`Date`、`Date32`、`DateTime`、および `DateTime64`の日付/日時型をサポートしています。日付は、`2006-01-02`形式の文字列として挿入できます。またはGoの`time.Time{}`や`sql.NullTime`を使用します。DateTimeもこれらの型をサポートしていますが、文字列は`2006-01-02 15:04:05`形式で渡す必要があり、オプションのタイムゾーンオフセット（例：`2006-01-02 15:04:05 +08:00`）が必要です。`time.Time{}`および`sql.NullTime`は、読み取り時にもサポートされており、`sql.Scanner`インターフェイスの任意の実装も利用できます。

タイムゾーン情報の扱いは、ClickHouseの型や、値の挿入または読み取りに依存します：

* **DateTime/DateTime64**
    * **挿入**時に値はUNIXタイムスタンプ形式でClickHouseに送信されます。タイムゾーンが提供されていない場合、クライアントはクライアントのローカルタイムゾーンを想定します。`time.Time{}`または`sql.NullTime`は、その結果としてエポックに変換されます。
    * **選択**時に、カラムに設定されたタイムゾーンが、`time.Time`値を返す際に使用されます。設定されていない場合、サーバーのタイムゾーンが使用されます。
* **Date/Date32**
    * **挿入**時には、日付をUNIXタイムスタンプに変換する際に日付のタイムゾーンが考慮されます。すなわち、日付としてのストレージの前にタイムゾーンによってオフセットされます。ClickHouseのDate型にはロケールがないため、これは文字列値で指定されない限りローカルタイムゾーンが使用されます。
    * **選択**時には、日付が`time.Time{}`または`sql.NullTime{}`のインスタンスにスキャンされ、タイムゾーン情報なしで返されます。
#### 配列 {#array}

配列はスライスとして挿入される必要があります。要素の型ルールは、[プリミティブ型](#type-conversions)に対するものと一致します。すなわち、可能な範囲で要素が変換されます。

スキャン時にはスライスへのポインタを提供する必要があります。

```go
batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
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
    fmt.Printf("行: col1=%v, col2=%v\n", col1, col2)
}
rows.Close()
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/array.go)
#### マップ {#map}

マップは、前述の型ルールに準拠するキーと値を持つGolangマップとして挿入される必要があります。

```go
batch, err := conn.PrepareBatch(ctx, "INSERT INTO example")
if err != nil {
    return err
}
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
#### タプル {#tuples}

タプルは、任意の長さのカラムのグループを表します。カラムは明示的に名前を付けることも、型のみを指定することもできます（例：

```sql
//無名
Col1 Tuple(String, Int64)

//名前付き
Col2 Tuple(name String, id Int64, age uint8)
```

これらのアプローチのうち、名前付きタプルはより柔軟性があります。無名のタプルはスライスを使用して挿入および読み取りする必要がありますが、名前付きタプルはマップとも互換性があります。

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
// 無名および名前付き両方ともスライスで追加できます。同じ型のすべての要素が同じ場合は、強く型付けされたリストとマップも使用できます。
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
// 名前付きタプルはマップまたはスライスに取得でき、無名はスライスのみです。
if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2, &col3); err != nil {
    return err
}
fmt.Printf("行: col1=%v, col2=%v, col3=%v\n", col1, col2, col3)
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/tuple.go)

注：型付きスライスとマップがサポートされているため、すべての名前付きタプルのサブカラムが同じ型である必要があります。
#### ネスト {#nested}

ネストフィールドは、名前付きタプルの配列に相当します。ユーザーが[flatten_nested](/operations/settings/settings#flatten_nested)を1または0に設定したかどうかによって使用法が変わります。

flatten_nestedを0に設定すると、ネストしたカラムは単一のタプルの配列として保持されます。これにより、ユーザーは挿入や取得のためにマップのスライスを使用し、任意のレベルのネストを行うことができます。マップのキーはカラムの名前と等しくなければならず、以下の例のように示されます。

注：マップはタプルを表すため、`map[string]interface{}`型である必要があります。値は現在、強く型付けされていません。

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
    fmt.Printf("行: col1=%v, col2=%v\n", col1, col2)
}
rows.Close()
```

[完全な例 - `flatten_tested=0`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L28-L118)

デフォルト値の1が`flatten_nested`に使用される場合、ネストされたカラムは別々の配列にフラット化されます。これにより、挿入および取得のためにネストされたスライスを使用する必要があります。任意のレベルのネストが機能する可能性がありますが、これは正式にはサポートされていません。

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

[完全な例 - `flatten_nested=1`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L123-L180)

注：ネストされたカラムは同じ次元でなければなりません。例えば、上述の例では、`Col_2_2`と`Col_2_1`は同じ数の要素を持っている必要があります。

より簡潔なインターフェースとネスティングの公式サポートを考慮すると、`flatten_nested=0`を推奨します。
#### ジオタイプ {#geo-types}

クライアントは、Point、Ring、Polygon、および Multi Polygon のジオタイプをサポートしています。これらのフィールドは、[github.com/paulmach/orb](https://github.com/paulmach/orb)パッケージを使用してGolangで使用されます。

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

UUID型は、[github.com/google/uuid](https://github.com/google/uuid)パッケージによってサポートされています。ユーザーは、UUIDを文字列として送信したり、`sql.Scanner`または`Stringify`を実装した任意の型としてマーシャリングしたりすることもできます。

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

Decimal型は、[github.com/shopspring/decimal](https://github.com/shopspring/decimal)パッケージによってサポートされています。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/decimal.go)
#### Nullable {#nullable}

GoのNil値は、ClickHouseのNULLを表します。これは、フィールドがNullableとして宣言されている場合に使用できます。挿入時には、通常のカラムとNullableバージョンの両方にNilを渡すことができます。前者の場合、型のデフォルト値が保存されます。例えば、文字列の場合は空の文字列です。Nullableバージョンの場合、NULL値がClickHouseに保存されます。

スキャン時に、ユーザーは nil 値をNullableフィールドのために表すために、*string のような nil をサポートする型へのポインタを渡す必要があります。以下の例では、Nullable(String)のcol1は、したがって**stringを受け取ります。これによりnilが表現できるようになります。

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

クライアントは追加で、`sql.Null*`型（例：`sql.NullInt64`）をサポートします。これらは、それぞれのClickHouse型と互換性があります。
#### 大きな整数 - Int128, Int256, UInt128, UInt256 {#big-ints---int128-int256-uint128-uint256}

64ビットを超える数値型は、ネイティブなGo [big](https://pkg.go.dev/math/big)パッケージを使用して表されます。

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
### 圧縮 {#compression}

圧縮方法のサポートは、使用しているプロトコルに依存します。ネイティブプロトコルの場合、クライアントは`LZ4`と`ZSTD`圧縮をサポートしています。これは、ブロックレベルでのみ実行されます。圧縮は、接続の設定に`Compression`設定を含めることによって有効にできます。

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

HTTP経由の標準インターフェースを使用している場合、追加の圧縮手法が利用可能です。詳細については、[database/sql API - 圧縮](#compression)を参照してください。
### パラメータバインディング {#parameter-binding}

クライアントは、`Exec`、`Query`、および`QueryRow`メソッドのためのパラメータバインディングをサポートしています。以下の例に示すように、これは名前付き、番号付き、位置指定のパラメータを使用してサポートされています。これについての例を以下に示します。

```go
var count uint64
// 位置指定バインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 >= ? AND Col3 < ?", 500, now.Add(time.Duration(750)*time.Second)).Scan(&count); err != nil {
    return err
}
// 250
fmt.Printf("位置指定バインド count: %d\n", count)
// 数値バインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= $2 AND Col3 > $1", now.Add(time.Duration(150)*time.Second), 250).Scan(&count); err != nil {
    return err
}
// 100
fmt.Printf("数値バインド count: %d\n", count)
// 名前付きバインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= @col1 AND Col3 > @col3", clickhouse.Named("col1", 100), clickhouse.Named("col3", now.Add(time.Duration(50)*time.Second))).Scan(&count); err != nil {
    return err
}
// 50
fmt.Printf("名前付きバインド count: %d\n", count)
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind.go)
#### 特殊ケース {#special-cases}

デフォルトでは、スライスはクエリにパラメータとして渡された場合、値のカンマ区切りリストに展開されます。ユーザーが値のセットを `[]` でラップして挿入する必要がある場合は、`ArraySet`を使用する必要があります。

グループ/タプルが必要な場合は、`( )` でラップされ、IN演算子と共に使用するために、`GroupSet`を使用できます。これは、以下の例に示すように、複数のグループが必要なケースに特に便利です。

最後に、DateTime64フィールドはパラメータが適切に表示されるように精度が必要です。フィールドの精度レベルはクライアントには不明ですが、ユーザーはそれを提供しなければなりません。これを簡素化するために、`DateNamed`パラメータを提供します。

```go
var count uint64
// 配列は展開されます
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN (?)", []int{100, 200, 300, 400, 500}).Scan(&count); err != nil {
    return err
}
fmt.Printf("配列展開 count: %d\n", count)
// 配列は [ ] で保持されます
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col4 = ?", clickhouse.ArraySet{300, 301}).Scan(&count); err != nil {
    return err
}
fmt.Printf("配列 count: %d\n", count)
// グループセットにより ( ) リストを形成できます
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN ?", clickhouse.GroupSet{[]interface{}{100, 200, 300, 400, 500}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("グループ count: %d\n", count)
// ネストが必要な場合にもっと便利
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE (Col1, Col5) IN (?)", []clickhouse.GroupSet{{[]interface{}{100, 101}}, {[]interface{}{200, 201}}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("グループ count: %d\n", count)
// 時間の精度が必要な際に DateNamed を使用
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col3 >= @col3", clickhouse.DateNamed("col3", now.Add(time.Duration(500)*time.Millisecond), clickhouse.NanoSeconds)).Scan(&count); err != nil {
    return err
}
fmt.Printf("NamedDate count: %d\n", count)
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind_special.go)
### コンテキストの使用 {#using-context}

Goのコンテキストは、締切、キャンセレーション信号、および他のリクエストスコープの値をAPIの境界を越えて渡す手段を提供します。接続上のすべてのメソッドは、最初の変数としてコンテキストを受け入れます。前の例ではcontext.Background()が使用されていましたが、ユーザーはこの機能を利用して設定や締切を渡し、クエリをキャンセルすることができます。

`withDeadline`で作成されたコンテキストを渡すことで、クエリには実行時間の制限を設けることができます。これは絶対的な時間であり、有効期限が切れると接続が解放され、ClickHouseにキャンセル信号が送信されます。`WithCancel`を代わりに使用して、クエリを明示的にキャンセルすることもできます。

ヘルパーの `clickhouse.WithQueryID` と `clickhouse.WithQuotaKey` を使用すると、クエリIDとクオータキーを指定することができます。クエリIDは、ログ内でのクエリ追跡やキャンセル目的に役立ちます。クオータキーは、ユニークなキー値に基づいてClickHouseの使用制限を設けるために使用されます - 詳細については[クオータ管理](/operations/access-rights#quotas-management)を参照してください。

ユーザーはまた、コンテキストを使用して特定のクエリに対してのみ設定を適用することができます - 接続全体ではなく、[接続設定](#connection-settings)に示されています。

最後に、`clickhouse.WithBlockSize`を介してブロックバッファのサイズを制御できます。これは接続レベルの設定`BlockBufferSize`を上書きし、メモリ内でデコードされて保持されるブロックの最大数を制御します。大きな値は、メモリの代償としてより多くの並列化を意味する可能性があります。

以下に上記の例を示します。

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

// JSONカラムを作成するにはallow_experimental_object_type=1が必要です
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
    return fmt.Errorf("expected cancel")
}

// クエリの締切を設定します - これは絶対時間が経過した後にクエリをキャンセルします。
// クエリはClickHouseで完了するまで実行され続けます
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.Ping(ctx); err == nil {
    return fmt.Errorf("expected deadline exceeded")
}

// クエリIDを設定してログでのクエリトレースを支援します e.g. see system.query_log
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
// クオータキーを設定します - 先にクオータを作成します
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

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/context.go)
### 進捗/プロファイル/ログ情報 {#progressprofilelog-information}

クエリに関して進捗、プロファイル、およびログ情報を要求することができます。進捗情報は、ClickHouseで読み取りおよび処理された行数およびバイト数の統計を報告します。対照的に、プロファイル情報はクライアントに返されるデータの要約を提供し、バイト（非圧縮）、行、およびブロックの合計を含みます。最後に、ログ情報はスレッドに関する統計を提供し、メモリ使用量やデータ速度を含みます。

この情報を得るには、ユーザーは[コンテキスト](#using-context)を使用する必要があり、コールバック関数を渡すことができます。

```go
totalRows := uint64(0)
// コンテキストを使用して進捗とプロファイル情報のコールバックを渡します
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
```

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/progress.go)
### 動的スキャン {#dynamic-scanning}

ユーザーは、スキーマやフィールドの型がわからないテーブルを読み取る必要がある場合があります。これは、アドホックデータ分析が行われる場合や、汎用ツールが書かれる場合に一般的です。これを達成するために、クエリ応答ではカラムタイプ情報が利用可能です。これは、Goのリフレクションを使って、スキャンに渡すことができる正しい型の変数のインスタンスを作成するために使用できます。

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

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/dynamic_scan_types.go)
### 外部テーブル {#external-tables}

[外部テーブル](/engines/table-engines/special/external-data/)は、クライアントがSELECTクエリを介してデータをClickHouseに送信できるようにします。このデータは一時テーブルに配置され、評価のためにクエリ自体で使用できます。

外部データをクエリでクライアントに送信するには、ユーザーはコンテキストを介してこれを渡す前に `ext.NewTable` を使用して外部テーブルを構築する必要があります。

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

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/external_data.go)
### Open Telemetry {#open-telemetry}

ClickHouseは、ネイティブプロトコルの一部として[トレースコンテキスト](/operations/opentelemetry/)を渡すことを可能にします。クライアントは、`clickhouse.withSpan`関数を介してスパンを作成し、これをコンテキストを介して渡すことができます。

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

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/open_telemetry.go)

トレースの活用に関する詳細は、[OpenTelemetryサポート](/operations/opentelemetry/)の下を参照してください。
## データベース/SQL API {#databasesql-api}

`database/sql`または「標準」APIは、アプリケーションコードが基盤となるデータベースに無関心であるべきシナリオでクライアントを使用できるようにします。これはある種のコストがかかります - 追加の抽象化レイヤーと間接化、およびClickHouseと必ずしも一致しないプリミティブです。しかし、これらのコストは通常、ツールが複数のデータベースに接続する必要があるシナリオでは受け入れられます。

さらに、このクライアントはHTTPをトランスポートレイヤーとして使用することをサポートしており、データは最適なパフォーマンスのためにネイティブ形式でエンコードされます。

以下は、ClickHouse APIのドキュメント構造に合わせることを目指しています。

標準APIのフルコード例は[こちら](https://github.com/ClickHouse/clickhouse-go/tree/main/examples/std)で見つけることができます。
### 接続 {#connecting-1}

接続は、`clickhouse://<host>:<port>?<query_option>=<value>`という形式のDSN文字列と`Open`メソッド、または`clickhouse.OpenDB`メソッドを介して達成できます。後者は`database/sql`仕様の一部ではありませんが、`sql.DB`インスタンスを返します。このメソッドは、`database/sql`仕様を通じて明示的に公開する明確な手段がないプロファイリングなどの機能を提供します。

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

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect.go)

**以降のすべての例では、明示的に示されない限り、ClickHouseの `conn` 変数が作成され、利用可能であると仮定します。**
#### 接続設定 {#connection-settings-1}

以下のパラメータをDSN文字列に渡すことができます：

* `hosts` - ロードバランシングおよびフェイルオーバーのための単一アドレスホストのカンマ区切りリスト - [複数ノードへの接続](#connecting-to-multiple-nodes)を参照してください。
* `username/password` - 認証資格情報 - [認証](#authentication)を参照してください。
* `database` - 現在のデフォルトデータベースを選択する
* `dial_timeout` - 期間文字列は、符号付きの可能性がある小数のシーケンスであり、各小数にはオプションの分数と`300ms`、`1s`のような単位の接尾辞があります。有効な時間単位は`ms`、`s`、`m`です。
* `connection_open_strategy` - `random/in_order`（デフォルトは`random`） - [複数ノードに接続する](#connecting-to-multiple-nodes)を参照してください。
    - `round_robin` - セットからラウンドロビンサーバーを選択します
    - `in_order` - 指定された順序で最初のライブサーバーが選択されます
* `debug` - デバッグ出力を有効にする（ブール値）
* `compress` - 圧縮アルゴリズムを指定する - `none`（デフォルト）、`zstd`、`lz4`、`gzip`、`deflate`、`br`。`true`に設定すると、`lz4`が使用されます。ネイティブ通信については、`lz4`と`zstd`のみがサポートされます。
* `compress_level` - 圧縮レベル（デフォルトは`0`）。詳しくは圧縮を参照してください。これはアルゴリズム特有です：
    - `gzip` - `-2`（最高のスピード）から`9`（最高の圧縮）
    - `deflate` - `-2`（最高のスピード）から`9`（最高の圧縮）
    - `br` - `0`（最高のスピード）から`11`（最高の圧縮）
    - `zstd`、`lz4` - 無視される
* `secure` - セキュアなSSL接続を確立します（デフォルトは`false`）
* `skip_verify` - 証明書の検証をスキップします（デフォルトは`false`）
* `block_buffer_size` - ユーザーがブロックバッファのサイズを制御できるようにします。[`BlockBufferSize`](#connection-settings)を参照してください（デフォルトは`2`）。

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
[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect_settings.go)
#### 接続プーリング {#connection-pooling-1}

ユーザーは、[複数ノードへの接続](#connecting-to-multiple-nodes)で説明されているように、提供されたノードアドレスのリストの使用を影響を与えることができます。ただし、接続管理とプーリングは意図的に`sql.DB`に委任されています。
#### HTTP経由での接続 {#connecting-over-http}

デフォルトでは、接続はネイティブプロトコルを介して確立されます。HTTPが必要なユーザーは、DSNを修正してHTTPプロトコルを含めるか、接続オプションにプロトコルを指定することでこれを有効にできます。

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

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/connect_http.go)
#### 複数ノードへの接続 {#connecting-to-multiple-nodes-1}

`OpenDB`を使用する場合は、ClickHouse APIで使用されているのと同じオプションアプローチを使用して複数のホストに接続します。 `ConnOpenStrategy`をオプションとして指定できます。

DSNベースの接続の場合、文字列は複数のホストと`connection_open_strategy`パラメーターを受け入れ、その値を`round_robin`または`in_order`に設定できます。

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

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/multi_host.go)
### TLSの使用 {#using-tls-1}

DSN接続文字列を使用する場合、SSLは「secure=true」パラメータを介して有効にできます。`OpenDB`メソッドは、[ネイティブAPIのTLS](#using-tls)と同じアプローチを採用しており、非nil TLS構造体の指定に依存しています。DSN接続文字列は、SSL検証をスキップするために`skip_verify`パラメーターをサポートしますが、`OpenDB`メソッドは、構成を渡すことを許可するため、より高度なTLS構成に必要です。

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

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/ssl.go)
### 認証 {#authentication-1}

`OpenDB`を使用する場合、認証情報は通常のオプションを介して渡すことができます。DSNベースの接続の場合、接続文字列にユーザー名とパスワードをパラメータとして渡すか、アドレスにエンコードされた資格情報として渡すことができます。

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
        if err != nil {
                return err
        }
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

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/auth.go)
### 実行 {#execution-1}

接続が取得されると、ユーザーはExecメソッドを介して`sql`文を実行することができます。

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

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/exec.go)


このメソッドは、コンテキストを受け取ることはサポートしていません - デフォルトでは、バックグラウンドコンテキストで実行されます。ユーザーは必要に応じて`ExecContext`を使用できます - [コンテキストの使用](#using-context)を参照してください。
### バッチ挿入 {#batch-insert-1}

バッチセマンティクスは、`Being`メソッドを介して`sql.Tx`を作成することによって達成できます。これにより、`INSERT`文を使用して`Prepare`メソッドを取得できます。これにより、行を`Exec`メソッドを使用して追加できる`sql.Stmt`が返されます。バッチは、最初の`sql.Tx`で`Commit`が実行されるまでメモリに蓄積されます。

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

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/batch.go)
### 行のクエリ {#querying-rows-1}

単一の行のクエリは、`QueryRow`メソッドを使用して実行できます。これにより、スキャンを行うために変数へのポインタを伴う*sql.Rowが返されます。`QueryRowContext`のバリアントにより、バックグラウンド以外のコンテキストを渡すことができます - [コンテキストの使用](#using-context)を参照してください。

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

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/query_row.go)

複数行を繰り返すには、`Query`メソッドを使用します。これにより、行を反復処理するためにNextを呼び出すことができる`*sql.Rows`構造体が返されます。`QueryContext`の同等のものはコンテキストの渡しを可能にします。

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

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/query_rows.go)
### 非同期挿入 {#async-insert-1}

非同期挿入は、`ExecContext`メソッドを介して挿入を実行することで達成できます。これは、非同期モードが有効になったコンテキストを渡す必要があります。これにより、クライアントがサーバーが挿入を完了するまで待つか、データが受信された時点で応答するかを指定できます。これは、[wait_for_async_insert](/operations/settings/settings#wait_for_async_insert)パラメータを制御します。

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

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/async.go)
### 列指向の挿入 {#columnar-insert-1}

標準インターフェースではサポートされていません。
### 構造体の使用 {#using-structs-1}

標準インターフェースではサポートされていません。
### 型変換 {#type-conversions-1}

標準の`database/sql`インターフェースは、[ClickHouse API](#type-conversions)と同じ型をサポートする必要があります。いくつかの例外があり、主に複雑な型については、以下にドキュメントされています。ClickHouse APIに類似して、クライアントは挿入およびレスポンスのマシュアリングのために可能な限り柔軟性を持つことを目指しています。詳細については[型変換](#type-conversions)を参照してください。
### 複雑な型 {#complex-types-1}

特に明記されている場合を除いて、複雑な型の処理は[ClickHouse API](#complex-types)と同様であるべきです。違いは`database/sql`の内部によるものです。
#### マップ {#maps}

ClickHouse APIとは異なり、標準APIはマップをスキャンタイプで厳密に型付けする必要があります。たとえば、ユーザーは`Map(String,String)`フィールドに対して`map[string]interface{}`を渡すことはできず、代わりに`map[string]string`を使用する必要があります。`interface{}`変数は常に互換性があり、より複雑な構造に使用できます。ストラクチャは読み取り時にサポートされていません。

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

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/map.go)

挿入の動作はClickHouse APIと同様です。
### Compression {#compression-1}

標準APIは、ネイティブな [ClickHouse API](#compression) と同様に、ブロックレベルでの `lz4` および `zstd` 圧縮アルゴリズムをサポートしています。さらに、HTTP接続に対してはgzip、deflate、およびbr圧縮もサポートされています。これらのどれかが有効になっている場合、圧縮は挿入時およびクエリ応答時のブロックに対して行われます。pingやクエリリクエストなどの他のリクエストは圧縮されません。これは `lz4` および `zstd` オプションと一貫しています。

接続を確立するために `OpenDB` メソッドを使用する場合、Compression設定を渡すことができます。これには圧縮レベルを指定する機能も含まれています（以下参照）。DSNを使って `sql.Open` で接続する場合は、`compress` パラメータを使用します。これは、`gzip`、`deflate`、`br`、`zstd`、または `lz4` という特定の圧縮アルゴリズム、またはブーリアンフラグである可能性があります。trueに設定された場合、`lz4` が使用されます。デフォルトは `none` すなわち圧縮無効です。

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
[フルサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/compression.go#L27-L76)

```go
conn, err := sql.Open("clickhouse", fmt.Sprintf("http://%s:%d?username=%s&password=%s&compress=gzip&compress_level=5", env.Host, env.HttpPort, env.Username, env.Password))
```
[フルサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/compression.go#L78-L115)

適用された圧縮レベルは、DSNパラメータ compress_level または Compressionオプションの Level フィールドで制御できます。これはデフォルトで0ですが、アルゴリズムによって異なります：

* `gzip` - `-2` (最良の速度) から `9` (最良の圧縮)
* `deflate` - `-2` (最良の速度) から `9` (最良の圧縮)
* `br` - `0` (最良の速度) から `11` (最良の圧縮)
* `zstd`, `lz4` - 無視される

### Parameter Binding {#parameter-binding-1}

標準APIは、[ClickHouse API](#parameter-binding) と同様のパラメータバインディング機能をサポートしており、`Exec`、`Query`、および `QueryRow` メソッド（およびそれらの相当する [Context](#using-context) バリアント）にパラメータを渡すことができます。位置指定、名前付き、および番号付きパラメータがサポートされています。

```go
var count uint64
// 位置指定バインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 >= ? AND Col3 < ?", 500, now.Add(time.Duration(750)*time.Second)).Scan(&count); err != nil {
    return err
}
// 250
fmt.Printf("位置指定バインドカウント: %d\n", count)
// 数値バインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= $2 AND Col3 > $1", now.Add(time.Duration(150)*time.Second), 250).Scan(&count); err != nil {
    return err
}
// 100
fmt.Printf("数値バインドカウント: %d\n", count)
// 名前付きバインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= @col1 AND Col3 > @col3", clickhouse.Named("col1", 100), clickhouse.Named("col3", now.Add(time.Duration(50)*time.Second))).Scan(&count); err != nil {
    return err
}
// 50
fmt.Printf("名前付きバインドカウント: %d\n", count)
```

[フルサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/bind.go)

注意 [特別なケース](#special-cases) は依然として適用されます。

### Using Context {#using-context-1}

標準APIは、[ClickHouse API](#using-context) と同様に、期限、キャンセル信号、およびその他のリクエストスコープの値をコンテキストを通じて渡す機能をサポートしています。ClickHouse APIとは異なり、これは `Exec` のようなメソッドの `Context` バリアントを使用することで実現されます。デフォルトではバックグラウンドコンテキストを使用するメソッドは、コンテキストを最初のパラメータとして渡すことができる `ExecContext` バリアントを持っています。これにより、アプリケーションフローの任意の段階でコンテキストを渡すことができるようになります。たとえば、ユーザーは `ConnContext` を介して接続を確立する際や、`QueryRowContext` を介してクエリ行をリクエストする際にコンテキストを渡すことができます。使用可能なすべてのメソッドの例は以下に示されています。

コンテキストを使用して期限、キャンセル信号、クエリID、クォータキー、および接続設定を渡す詳細については、[ClickHouse API](#using-context) におけるコンテキストの使用を参照してください。

```go
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "allow_experimental_object_type": "1",
}))
conn.ExecContext(ctx, "DROP TABLE IF EXISTS example")
// JSONカラムを作成するには allow_experimental_object_type=1 が必要です
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
    return fmt.Errorf("キャンセルされることが期待されます")
}

// クエリの期限を設定する - これは絶対時間が到達した後にクエリをキャンセルします。接続のみを終了し、
// ClickHouse内のクエリは完了まで続行します
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.PingContext(ctx); err == nil {
    return fmt.Errorf("期限切れが発生することが期待されます")
}

// ログのクエリ追跡を助けるためにクエリIDを設定します。例: system.query_logを参照
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

// クエリはコンテキストを使用してキャンセルできます
ctx, cancel = context.WithCancel(context.Background())
// キャンセルする前にいくつかの結果を取得します
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
            fmt.Println("キャンセルされることが期待されます")
            return nil
        }
        return err
    }
    fmt.Printf("行: col2=%d\n", col2)
    if col2 == 3 {
        cancel()
    }
}
```

[フルサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/context.go)

### Sessions {#sessions}

ネイティブ接続は本質的にセッションを持っていますが、HTTP経由の接続では、ユーザーがコンテキストに設定として渡すためのセッションIDを作成する必要があります。これにより、セッションにバインドされる機能（例：一時テーブル）を使用できるようになります。

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
```

[フルサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/session.go)

### Dynamic Scanning {#dynamic-scanning-1}

[ClickHouse API](#dynamic-scanning) と同様に、カラム型情報が利用可能であり、これによりユーザーは正しく型付けされた変数のランタイムインスタンスを作成し、Scanに渡すことができます。これは、型が不明なカラムを読み取ることを可能にします。

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

[フルサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/dynamic_scan_types.go)

### External Tables {#external-tables-1}

[外部テーブル](/engines/table-engines/special/external-data/)は、クライアントがClickHouseにデータを送信できるようにし、`SELECT`クエリを使用します。このデータは一時テーブルに配置され、クエリ自体で評価に使用できます。

クエリと一緒に外部データをクライアントに送信するには、ユーザーは `ext.NewTable` を使用して外部テーブルを構築し、それをコンテキストを介して渡す必要があります。

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

[フルサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/external_data.go)

### Open Telemetry {#open-telemetry-1}

ClickHouseは、ネイティブプロトコルの一部として [トレースコンテキスト](/operations/opentelemetry/) を渡すことを許可します。クライアントは、`clickhouse.withSpan` 関数を介してSpanを作成し、これをコンテキストを通じて渡すことでこれを実現します。HTTPがトランスポートとして使用される場合はサポートされません。

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
fmt.Printf("カウント: %d\n", count)
```

[フルサンプル](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/open_telemetry.go)

## Performance Tips {#performance-tips}

* 可能なところではClickHouse APIを利用してください。特にプリミティブ型の場合。これにより、重要なリフレクションや間接呼び出しを避けることができます。
* 大規模なデータセットを読み取る場合は、[`BlockBufferSize`](#connection-settings) を修正することを検討してください。これにより、メモリフットプリントが増加しますが、行の反復中により多くのブロックを並行してデコードできるようになります。デフォルト値の2は保守的であり、メモリオーバーヘッドを最小限に抑えます。高い値はメモリ内のブロック数を増やすことになります。異なるクエリが異なるブロックサイズを生成する可能性があるため、これはテストが必要です。したがって、これを [クエリレベル](#using-context) でコンテキストを介して設定できます。
* データを挿入する際は、型を明確に指定してください。クライアントは柔軟性を目指していますが、例えばUUIDやIPのために文字列を解析できるようにすることは、データ検証を必要とし、挿入時にコストがかかります。
* 可能な限り列指向の挿入を使用してください。これらは強く型付けされているべきであり、クライアントがあなたの値を変換する必要がなくなります。
* ClickHouseの [推奨事項](/sql-reference/statements/insert-into/#performance-considerations) に従って、最適な挿入パフォーマンスを確保してください。
