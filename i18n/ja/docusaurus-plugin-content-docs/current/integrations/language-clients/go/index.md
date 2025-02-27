---
sidebar_label: Go
sidebar_position: 1
keywords: [clickhouse, go, client, golang]
slug: /integrations/go
description: Goクライアントを使用してClickHouseに接続することができます。
---

import ConnectionDetails from '@site/i18n/ja/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';

# ClickHouse Go

## シンプルな例 {#a-simple-example}
シンプルな例でGoを使用してみましょう。これによりClickHouseに接続し、systemデータベースから選択を行います。始めるには接続の詳細が必要です。

### 接続の詳細 {#connection-details}
<ConnectionDetails />

### モジュールを初期化する {#initialize-a-module}

```bash
mkdir clickhouse-golang-example
cd clickhouse-golang-example
go mod init clickhouse-golang-example
```

### サンプルコードをコピーする {#copy-in-some-sample-code}

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
		panic((err))
	}

	ctx := context.Background()
	rows, err := conn.Query(ctx, "SELECT name,toString(uuid) as uuid_str FROM system.tables LIMIT 5")
	if err != nil {
		log.Fatal(err)
	}

	for rows.Next() {
		var (
			name, uuid string
		)
		if err := rows.Scan(
			&name,
			&uuid,
		); err != nil {
			log.Fatal(err)
		}
		log.Printf("name: %s, uuid: %s",
			name, uuid)
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

### go mod tidyを実行する {#run-go-mod-tidy}

```bash
go mod tidy
```
### 接続の詳細を設定する {#set-your-connection-details}
前に接続の詳細を調べました。それらを`main.go`の`connect()`関数に設定します：

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

### 例を実行する {#run-the-example}
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

### さらに学ぶ {#learn-more}
このカテゴリの残りのドキュメントでは、ClickHouse Goクライアントの詳細について説明します。

## ClickHouse Goクライアント {#clickhouse-go-client}

ClickHouseは2つの公式Goクライアントをサポートしています。これらのクライアントは補完的であり、意図的に異なるユースケースをサポートしています。

* [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) - Go標準のdatabase/sqlインターフェイスまたはネイティブインターフェイスをサポートする高水準言語クライアント。
* [ch-go](https://github.com/ClickHouse/ch-go) - 低水準クライアント。ネイティブインターフェイスのみ。

clickhouse-goは高水準インターフェースを提供しており、ユーザーはデータ型に対して寛容な行指向の構文とバッチを使用してデータのクエリと挿入を行うことができます - 精度損失が発生しない限り、値は変換されます。一方、ch-goは最適化された列指向インターフェースを提供し、タイプ厳密性とより複雑な使用を犠牲にして、低CPUおよびメモリ負荷で高速なデータブロックストリーミングを実現します。

バージョン2.3から、Clickhouse-goはエンコーディング、デコーディング、圧縮などの低レベル機能にch-goを利用しています。clickhouse-goもGoの`database/sql`インターフェイス標準をサポートしていることに注意してください。両方のクライアントは、最適なパフォーマンスを提供するためにネイティブ形式をロケーションし、ネイティブClickHouseプロトコル上で通信できます。clickhouse-goは、トラフィックをプロキシまたは負荷分散する必要がある場合には、HTTPもトランスポートメカニズムとしてサポートしています。

クライアントライブラリを選択する際、ユーザーはそれぞれの利点と欠点を認識しておくべきです - クライアントライブラリの選択を参照してください。

|               | ネイティブ形式 | ネイティブプロトコル | HTTPプロトコル | 行指向API | 列指向API | 型の柔軟性 | 圧縮 | クエリプレースホルダー |
|:-------------:|:-------------:|:---------------:|:-------------:|:------------------:|:---------------------:|:----------------:|:-----------:|:------------------:|
| clickhouse-go |       ✅       |        ✅        |       ✅       |          ✅         |           ✅           |         ✅        |      ✅      |          ✅         |
|     ch-go     |       ✅       |        ✅        |               |                    |           ✅           |                  |      ✅      |                    |

## クライアントの選択 {#choosing-a-client}

クライアントライブラリを選択する際は、使用パターンと最適なパフォーマンスのニーズを考慮する必要があります。毎秒数百万の挿入を必要とする挿入が多いユースケースには、低レベルクライアントの[ch-go](https://github.com/ClickHouse/ch-go)を使用することをお勧めします。このクライアントは、ClickHouseのネイティブ形式が必要とするように、データを行指向形式から列に変換する関連オーバーヘッドを回避します。さらに、`interface{}`（`any`）型の使用やリフレクションを避けることで、使用が簡素化されます。

集計に焦点を当てたクエリワークロードや低スループットの挿入ワークロードに対しては、[clickhouse-go](https://github.com/ClickHouse/clickhouse-go)が親しみやすい`database/sql`インターフェイスとより簡潔な行の意味論を提供します。ユーザーはオプションでHTTPをトランスポートプロトコルとして使用し、構造体間で行をマシャルするためのヘルパー関数を活用できます。

## clickhouse-goクライアント {#the-clickhouse-go-client}

clickhouse-goクライアントは、ClickHouseと通信するための2つのAPIインターフェースを提供します。

* ClickHouseクライアント専用API
* `database/sql`標準 - Golangによって提供されるSQLデータベース用の一般的なインターフェース。

`database/sql`はデータベース非依存のインターフェースを提供し、開発者がデータストアを抽象化することを可能にしますが、パフォーマンスに影響するいくつかの型付けとクエリの意味論を強制します。このため、パフォーマンスが重要な場合はクライアント専用APIを使用するべきです。ただし、複数のデータベースをサポートするツールにClickHouseを統合したいユーザーは、標準インターフェースを使用することを好むかもしれません。

両方のインターフェースは、通信のために[native format](/native-protocol/basics.md)とネイティブプロトコルを使用してデータをエンコードします。さらに、標準インターフェースはHTTP経由での通信をサポートします。

|                    | ネイティブ形式 | ネイティブプロトコル | HTTPプロトコル | バルク書き込みサポート | 構造体のマシャリング | 圧縮 | クエリプレースホルダー |
|:------------------:|:-------------:|:---------------:|:-------------:|:------------------:|:-----------------:|:-----------:|:------------------:|
|   ClickHouse API   |       ✅       |        ✅        |               |          ✅         |         ✅         |      ✅      |          ✅         |
| `database/sql` API |       ✅       |        ✅        |       ✅       |          ✅         |                   |      ✅      |          ✅         |

## インストール {#installation}

ドライバのバージョンv1は非推奨であり、機能の更新や新しいClickHouseタイプのサポートには達しません。ユーザーは、より優れたパフォーマンスを提供するv2に移行するべきです。

2.xバージョンのクライアントをインストールするには、go.modファイルにパッケージを追加します：

`require github.com/ClickHouse/clickhouse-go/v2 main`

または、リポジトリをクローンします：

```bash
git clone --branch v2 https://github.com/clickhouse/clickhouse-go.git $GOPATH/src/github
```

別のバージョンをインストールするには、パスやブランチ名をそれに応じて変更します。

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

クライアントはClickHouseから独立してリリースされます。2.xは現在開発中のメジャーバージョンを表しています。すべての2.xバージョンは相互に互換性があります。

#### ClickHouseの互換性 {#clickhouse-compatibility}

クライアントは以下をサポートしています：

- 現在サポートされているすべてのClickHouseバージョンは[ここ](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md)に記録されています。ClickHouseのバージョンがサポートされなくなった場合、それらはもはやクライアントリリースに対して積極的にはテストされません。
- クライアントのリリース日から2年間のすべてのClickHouseバージョン。LTSバージョンのみが積極的にテストされています。

#### Golangの互換性 {#golang-compatibility}

| クライアントバージョン | Golangバージョン |
|:--------------:|:---------------:|
|  => 2.0 &lt;= 2.2 |    1.17, 1.18   |
|     >= 2.3     |       1.18      |

## ClickHouse Client API {#clickhouse-client-api}

ClickHouse Client APIのすべてのコード例は[ここ](https://github.com/ClickHouse/clickhouse-go/tree/main/examples)で見つけることができます。

### 接続 {#connecting}

以下の例は、サーバーバージョンを返し、ClickHouseに接続することを示しています - ClickHouseが保護されておらず、デフォルトユーザーでアクセス可能であると仮定しています。

接続にはデフォルトのネイティブポートを使用しています。

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

**以降のすべての例について、明示的に示されていない限り、ClickHouseの`conn`変数が作成され使用可能であると仮定します。**

#### 接続設定 {#connection-settings}

接続を開くときに、Options構造体を使用してクライアントの動作を制御できます。以下の設定が利用可能です：

* `Protocol` - ネイティブまたはHTTPのいずれか。HTTPは現在[database/sql API](#databasesql-api)のみでサポートされています。
* `TLS` - TLSオプション。非nil値はTLSを有効にします。 [TLSの使用](#using-tls)を参照してください。
* `Addr` - ポートを含むアドレスのスライス。
* `Auth` - 認証の詳細。 [認証](#authentication)を参照してください。
* `DialContext` - 接続方法を決定するためのカスタムダイヤル関数。
* `Debug` - デバッグを有効にするためのtrue/false。
* `Debugf` - デバッグ出力を消費するための関数を提供します。`Debug`がtrueに設定されている必要があります。
* `Settings` - ClickHouseの設定のマップ。これらはすべてのClickHouseクエリに適用されます。[コンテキストの使用](#using-context)により、クエリごとに設定を設定できます。
* `Compression` - ブロックの圧縮を有効にします。 [圧縮](#compression)を参照してください。
* `DialTimeout` - 接続を確立するための最大時間。デフォルトは`1s`です。
* `MaxOpenConns` - いつでも使用できる最大接続数。アイドルプールにはより多くまたは少ない接続がある場合がありますが、いつでも使用できるのはこの数のみです。デフォルトは`MaxIdleConns+5`です。
* `MaxIdleConns` - プール内に維持すべき接続数。接続可能な場合は再利用されます。デフォルトは`5`です。
* `ConnMaxLifetime` - 接続を利用可能に保つ最大寿命。デフォルトは1時間です。この時間を超えると接続は破棄され、新しい接続が必要に応じてプールに追加されます。
* `ConnOpenStrategy` - ノードアドレスのリストを消費し、接続を開く方法を決定します。[複数ノードへの接続](#connecting-to-multiple-nodes)を参照してください。
* `BlockBufferSize` - 一度にバッファにデコードする最大ブロック数。より大きな値はメモリの代償として並列化を増加させます。ブロックサイズはクエリに依存するため、この設定は接続に設定できますが、戻りデータに基づいてクエリごとにオーバーライドすることをお勧めします。デフォルトは`2`です。

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

#### 接続プーリング {#connection-pooling}

クライアントは接続のプールを維持しており、必要に応じてこれらをクエリ間で再利用します。`MaxOpenConns`はいつでも最大限に使用され、最大プールサイズは`MaxIdleConns`によって制御されます。クライアントは各クエリ実行のためにプールから接続を取得し、それをプールに返して再利用します。接続はバッチのライフタイム中に使用され、`Send()`で解放されます。

プール内の同じ接続がその後のクエリに使用されることは保証されません。ユーザーが`MaxOpenConns=1`に設定しない限りです。これはめったに必要ではありませんが、ユーザーが一時テーブルを使用している場合には必要となることがあります。

また、デフォルトで`ConnMaxLifetime`は1時間です。これにより、ノードがクラスタを離れた場合にClickHouseへの負荷が不均衡になることがあります。これは、ノードが利用できなくなると発生し、接続は他のノードに均等に分配されます。これらの接続は、問題のあるノードがクラスタに戻ってきても、デフォルトでは1時間の間は持続し、更新されません。重いワークロードの場合は、この値を下げることを検討してください。

### TLSの使用 {#using-tls}

低レベルでは、すべてのクライアント接続メソッド（`DSN/OpenDB/Open`）は[Go tlsパッケージ](https://pkg.go.dev/crypto/tls)を使用して安全な接続を確立します。オプション構造体に非nilの`tls.Config`ポインタが含まれている場合、クライアントはTLSを使用することを知っています。

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

この最小限の`TLS.Config`は通常、ClickHouseサーバーの安全なネイティブポート（通常9440）に接続するのに十分です。ClickHouseサーバーに有効な証明書（期限切れ、ホスト名の間違い、公開に認識されたルート証明機関によって署名されていない）がない場合、`InsecureSkipVerify`をtrueにすることができますが、これは強く推奨されません。

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

追加のTLSパラメータが必要な場合、アプリケーションコードは`tls.Config`構造体の希望するフィールドを設定する必要があります。これには特定の暗号スイート、特定のTLSバージョン（1.2または1.3など）を強制すること、内部CA証明書チェーンを追加すること、ClickHouseサーバーによって必要な場合にクライアント証明書（および秘密鍵）を追加すること、さらに特別なセキュリティセットアップシナリオで提供されるその他のオプションが含まれている場合があります。

### 認証 {#authentication}

接続の詳細にAuth構造体を指定して、ユーザー名とパスワードを指定します。

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
if err != nil {
    return err
}
v, err := conn.ServerVersion()
```
[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/auth.go)

### 複数ノードへの接続 {#connecting-to-multiple-nodes}

複数のアドレスは`Addr`構造体を介して指定できます。

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

* `ConnOpenInOrder`（デフォルト） - アドレスは順番に使用されます。後のアドレスは、リストの最初にあるアドレスを使用することで接続に失敗した場合にのみ利用されます。これは実質的にフェイルオーバー戦略です。
* `ConnOpenRoundRobin` - ラウンドロビン戦略を使用してアドレス間で負荷を分散します。

これはオプション`ConnOpenStrategy`で制御できます。

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

任意のステートメントは`Exec`メソッドを介して実行できます。これはDDLや単純なステートメントに便利です。大きな挿入やクエリの反復には使用すべきではありません。

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

クエリにコンテキストを渡すことができることに注意してください。これは特定のクエリレベルの設定を渡すために使用できます - [コンテキストの使用](#using-context)を参照してください。

### バッチ挿入 {#batch-insert}

多数の行を挿入するために、クライアントはバッチセマンティクスを提供します。これは、行が追加できるバッチを準備することを必要とします。これは最終的に`Send()`メソッドを介して送信されます。バッチは`Send`が実行されるまでメモリ内に保持されます。

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

ClickHouseに対する推奨は[ここ](/about-us/performance/#performance-when-inserting-data)に適用されます。バッチはgoルーチン間で共有すべきではありません - 各ルーチンごとに別のバッチを構築してください。

上記の例から、行を追加する際に変数タイプが列タイプと揃う必要があることに注意してください。マッピングは通常明らかですが、このインターフェースは柔軟性を持たせようとし、精度損失が発生しない限りは型が変換されます。例えば、次のようにdatetime64に文字列を挿入することができます。

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

サポートされているgo型の完全な概要は、[型変換](#type-conversions)を参照してください。

### 行のクエリ {#querying-rows}

ユーザーは`QueryRow`メソッドを使用して単一の行クエリを実行するか、`Query`を介して結果セットの反復用のカーソルを取得できます。前者はシリアル化先のデータを受け入れ、後者は各行で`Scan`を呼び出す必要があります。

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

いずれの場合も、それぞれの列の値をシリアル化するために、シリアライズ先の変数へのポインタを渡す必要があります。これらは`SELECT`ステートメントで指定された順序で渡される必要があり、通常、`SELECT *`の場合には列の宣言の順序が使用されます。

挿入に似て、Scanメソッドもターゲット変数が適切な型であることを要求します。これは再び柔軟性を目指しており、可能な限り型が変換されます。例として、UUID列が文字列変数に読み込まれる例が示されています。サポートされているgo型の完全リストは、[型変換](#type-conversions)を参照してください。

最後に、`Query`と`QueryRow`メソッドに`Context`を渡す能力にも注目してください。これにより、クエリレベルの設定を渡すことができるようになります - 詳細については[コンテキストの使用](#using-context)を参照してください。

### 非同期挿入 {#async-insert}

非同期挿入はAsyncメソッドを通じてサポートされています。これにより、クライアントが挿入が完了するのを待つべきか、データが受信され次第応答するべきかを指定できます。これはパラメータ[wait_for_async_insert](/operations/settings/settings/#wait-for-async-insert)を制御します。

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

挿入は列フォーマットで行うことができます。これは、すでにこの構造に向けてデータが整形されている場合に、行にピボットする必要を回避することによるパフォーマンス上の利点を提供できます。

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

### 構造体の使用 {#using-structs}

ユーザーにとって、Golangの構造体はClickHouseのデータ行の論理表現を提供します。これを支援するために、ネイティブインターフェイスはいくつかの便利な関数を提供します。

#### シリアライズで選択 {#select-with-serialize}

Selectメソッドを使用すると、単一の呼び出しで応答行のセットを構造体のスライスにマシャルできます。

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

#### スキャン構造体 {#scan-struct}

`ScanStruct`を使うと、クエリから単一の行を構造体にマシャルできます。

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

（内容は未提供）
`AppendStruct`を使用すると、構造体を既存の[バッチ](#batch-insert)に追加し、完全な行として解釈できます。これは、構造体のカラムがテーブルのカラムと名前と型の両方で一致する必要があることを意味します。すべてのカラムには対応する構造体のフィールドが必要ですが、一部の構造体フィールドは対応するカラム表現を持たない場合があります。これらは単に無視されます。

```go
batch, err := conn.PrepareBatch(context.Background(), "INSERT INTO example")
if err != nil {
    return err
}
for i := 0; i < 1_000; i++ {
    err := batch.AppendStruct(&row{
        Col1:       uint64(i),
        Col2:       "Golang SQL データベースドライバ",
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

クライアントは、挿入およびレスポンスのマーシャリングに関して、さまざまな型を柔軟に受け入れることを目指しています。ほとんどの場合、ClickHouseのカラムタイプに対して対応するGolangタイプが存在し、例えば、[UInt64](/sql-reference/data-types/int-uint/)は[uint64](https://pkg.go.dev/builtin#uint64)に対応します。これらの論理的マッピングは常にサポートされるべきです。ユーザーは、変数や受信データの型変換が最初に行われる場合に、カラムに挿入できる変数型を利用したい場合があります。クライアントは、ユーザーがデータを正確に一致させるために変換する必要がないように、これらの変換を透明にサポートすることを目指しています。また、クエリ時の柔軟なマーシャリングを提供します。この透明な変換でも精度の損失は許可されません。例えば、uint32はUInt64カラムからデータを受け取るために使用できません。逆に、文字列はフォーマットの要件を満たしている場合、datetime64フィールドに挿入できます。

現在サポートされている基本的な型の型変換は、[こちら](https://github.com/ClickHouse/clickhouse-go/blob/main/TYPES.md)にまとめられています。

この取り組みは進行中であり、挿入（`Append` / `AppendRow`）と読み取り時（`Scan`を介して）に分けられます。特定の変換についてサポートが必要な場合は、issueを提起してください。

### 複雑な型 {#complex-types}

#### 日付/日時型 {#datedatetime-types}

ClickHouse Goクライアントは、`Date`、`Date32`、`DateTime`、および`DateTime64`の日付/日時型をサポートしています。日付は`2006-01-02`形式の文字列として、またはネイティブGoの`time.Time{}`や`sql.NullTime`を使用して挿入できます。日時もこれらの後者の型をサポートしていますが、文字列は`2006-01-02 15:04:05`形式で渡す必要があり、オプションでタイムゾーンオフセットを指定できます（例：`2006-01-02 15:04:05 +08:00`）。`time.Time{}`および`sql.NullTime`は、読み取り時にもサポートされており、`sql.Scanner`インターフェースの実装も同様です。

タイムゾーン情報の扱いはClickHouseの型や値が挿入されるか読み取られるかによって異なります。

* **DateTime/DateTime64**
    * **挿入**時、値はUNIXタイムスタンプ形式でClickHouseに送信されます。タイムゾーンが指定されていない場合、クライアントのローカルタイムゾーンが仮定されます。`time.Time{}`または`sql.NullTime`はそれに応じてエポックに変換されます。
    * **選択**時、カラムのタイムゾーンが設定されていれば、それが`time.Time`値を返す際に使用されます。設定されていない場合、サーバーのタイムゾーンが使用されます。
* **Date/Date32**
    * **挿入**時に、任意の日付のタイムゾーンがUNIXタイムスタンプに変換される際に考慮され、日付として保存される前にタイムゾーンによってオフセットされるため、ClickHouseのDate型にはロケールがありません。文字列値にこれが指定されない場合、ローカルタイムゾーンが使用されます。
    * **選択**時、日付は`time.Time{}`または`sql.NullTime{}`のインスタンスにスキャンされ、タイムゾーン情報は返されません。

#### 配列 {#array}

配列はスライスとして挿入する必要があります。要素の型のルールは[基本型](#type-conversions)のものと一致しており、可能な場合は要素が変換されます。

スキャン時にはスライスのポインタを提供する必要があります。

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

マップはGolangのマップとして挿入され、キーと値は[前述の](#type-conversions)型ルールに準拠していなければなりません。

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

タプルは任意の長さのカラムのグループを表します。カラムには明示的に名前が付けられる場合と、タイプのみが指定される場合があります。例：

```sql
// 無名
Col1 Tuple(String, Int64)

// 名前付き
Col2 Tuple(name String, id Int64, age uint8)
```

これらのアプローチの中で、名前付きタプルはより柔軟性があります。無名タプルはスライスを使用して挿入および読み取る必要がありますが、名前付きタプルはマップとも互換性があります。

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
// 名前付きも無名もスライスを使って追加できます。全ての要素が同じ型の場合、強く型付けされたリストやマップが使用できます。
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
// 名前付きタプルはマップやスライスに取得できますが、無名はスライスのみです。
if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2, &col3); err != nil {
    return err
}
fmt.Printf("行: col1=%v, col2=%v, col3=%v\n", col1, col2, col3)
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/tuple.go)

注：型付けされたスライスとマップがサポートされていますが、名前付きタプルのサブカラムはすべて同じ型である必要があります。

#### ネストされた {#nested}

ネストされたフィールドは、名前付きタプルの配列に相当します。使用は、ユーザーが[flatten_nested](/operations/settings/settings/#flatten-nested)を1または0に設定したかどうかに依存します。

`flatten_nested`を0に設定すると、ネストされたカラムは単一のタプルの配列として維持されます。これにより、ユーザーは挿入や取得のためにマップのスライスを使うことができ、任意のレベルの入れ子が可能になります。マップのキーはカラムの名前と一致する必要があります。以下の例を参照してください。

注：マップはタプルを表しているため、`map[string]interface{}`型でなければなりません。値は現在、強く型付けされていません。

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

[完全な例 - `flatten_nested=0`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L28-L118)

もし`flatten_nested`のデフォルト値1が使用された場合、ネストされたカラムは別々の配列にフラット化されます。これには、挿入と取得のためにネストされたスライスを使用する必要があります。任意のレベルの入れ子が動作する可能性がありますが、これは公式にはサポートされていません。

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

注：ネストされたカラムは同じ次元を持たなければなりません。例えば、上記の例では`Col_2_2`と`Col_2_1`は同じ数の要素を持っている必要があります。

インターフェースの簡素化とネストの公式サポートを考慮して、`flatten_nested=0`を推奨します。

#### ジオタイプ {#geo-types}

クライアントはジオタイプPoint、Ring、Polygon、およびMulti Polygonをサポートしています。これらのフィールドはGolangでは[github.com/paulmach/orb](https://github.com/paulmach/orb)パッケージを使用して表されます。

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

UUID型は[github.com/google/uuid](https://github.com/google/uuid)パッケージによってサポートされています。ユーザーはUUIDを文字列として、または`sql.Scanner`または`Stringify`を実装する任意の型として送信およびマーシャリングできます。

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

#### デシマル {#decimal}

デシマル型は[github.com/shopspring/decimal](https://github.com/shopspring/decimal)パッケージによってサポートされています。

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

GoのNilはClickHouseのNULLを表します。これはフィールドがNullableと宣言されている場合に使用できます。挿入時、Nilは通常版およびNullable版のカラムの両方に渡すことができます。前者の場合、型のデフォルト値が保持され、例えば文字列の場合は空の文字列になります。Nullable版の場合、ClickHouseにNULL値が保存されます。

スキャン時、ユーザーはnilをサポートする型のポインタ（例：*string）を渡す必要があります。これにより、Nullableフィールドのnil値を表すことができます。以下の例では、Nullabe(String)のcol1があり、したがって**stringを受け取ります。これにより、nilを表現できます。

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

クライアントはまた、`sql.Null*`型、例えば`sql.NullInt64`もサポートしています。これらは対応するClickHouse型と互換性があります。

#### 大きな整数 - Int128、Int256、UInt128、UInt256 {#big-ints---int128-int256-uint128-uint256}

64ビットを超える数値型は、ネイティブのGo [big](https://pkg.go.dev/math/big)パッケージを使用して表されます。

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

圧縮方法のサポートは、使用されているプロトコルによって異なります。ネイティブプロトコルの場合、クライアントは`LZ4`および`ZSTD`圧縮をサポートしています。これはブロックレベルでのみ実行されます。圧縮は接続に`Compression`設定を含めることで有効になります。

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

HTTP経由で標準インターフェースを使用する場合、追加の圧縮技術を利用できます。さらに詳しい情報は[database/sql API - 圧縮](#compression)を参照してください。

### パラメータバインディング {#parameter-binding}

クライアントは、`Exec`、`Query`、および`QueryRow`メソッドのためのパラメータバインディングをサポートしています。以下の例のように、名前付き、番号付き、位置指定のパラメータを使用してサポートされています。これらの例を以下に示します。

```go
var count uint64
// 位置バインディング
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 >= ? AND Col3 < ?", 500, now.Add(time.Duration(750)*time.Second)).Scan(&count); err != nil {
    return err
}
// 250
fmt.Printf("位置バインディングのカウント: %d\n", count)
// 数字バインディング
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= $2 AND Col3 > $1", now.Add(time.Duration(150)*time.Second), 250).Scan(&count); err != nil {
    return err
}
// 100
fmt.Printf("数字バインディングのカウント: %d\n", count)
// 名前付きバインディング
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= @col1 AND Col3 > @col3", clickhouse.Named("col1", 100), clickhouse.Named("col3", now.Add(time.Duration(50)*time.Second))).Scan(&count); err != nil {
    return err
}
// 50
fmt.Printf("名前付きバインディングのカウント: %d\n", count)
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind.go)

#### 特殊なケース {#special-cases}

デフォルトでは、スライスはクエリにパラメータとして渡された場合、コンマ区切りの値のリストに展開されます。ユーザーが値のセットを`[ ]`で囲んで挿入する必要がある場合は、`ArraySet`を使用する必要があります。

グループやタプルが必要な場合、`( )`で囲む必要があります。例えば、IN演算子に使用する場合は、`GroupSet`を使用することができます。これは、複数のグループが必要な場合に特に有用です。以下の例を参照してください。

最後に、DateTime64フィールドは、パラメータが適切にレンダリングされることを保証するために精度が必要です。フィールドの精度レベルはクライアントには不明ですが、ユーザーが提供する必要があります。このために、`DateNamed`パラメータを提供しています。

```go
var count uint64
// 配列は展開されます
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN (?)", []int{100, 200, 300, 400, 500}).Scan(&count); err != nil {
    return err
}
fmt.Printf("配列展開のカウント: %d\n", count)
// 配列は[]で保持されます
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col4 = ?", clickhouse.ArraySet{300, 301}).Scan(&count); err != nil {
    return err
}
fmt.Printf("配列のカウント: %d\n", count)
// グループセットで( )リストを形成できます
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN ?", clickhouse.GroupSet{[]interface{}{100, 200, 300, 400, 500}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("グループのカウント: %d\n", count)
// ネストが必要な場合により有用です
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE (Col1, Col5) IN (?)", []clickhouse.GroupSet{{[]interface{}{100, 101}}, {[]interface{}{200, 201}}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("グループのカウント: %d\n", count)
// 時間の精度が必要な場合はDateNamedを使用します
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col3 >= @col3", clickhouse.DateNamed("col3", now.Add(time.Duration(500)*time.Millisecond), clickhouse.NanoSeconds)).Scan(&count); err != nil {
    return err
}
fmt.Printf("名前付き日付のカウント: %d\n", count)
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind_special.go)

### コンテキストの使用 {#using-context}

Goのコンテキストは、デッドライン、キャンセル信号、およびその他のリクエストスコープの値をAPIの境界を越えて渡す手段を提供します。接続上のすべてのメソッドは、その最初の変数としてコンテキストを受け入れます。前の例では`context.Background()`を使用しましたが、ユーザーはこの機能を利用して設定やデッドラインを渡し、クエリをキャンセルできます。

`withDeadline`で作成されたコンテキストを渡すと、クエリに実行時間制限を設定できます。これは絶対時間であり、期限切れは接続をリリースし、ClickHouseにキャンセル信号を送信するだけです。`WithCancel`を使ってクエリを明示的にキャンセルすることもできます。

ヘルパー`clickhouse.WithQueryID`および`clickhouse.WithQuotaKey`を使用すると、クエリIDやクォータキーを指定できます。クエリIDは、ログでクエリを追跡するためや、キャンセル目的に役立ちます。クォータキーは、ユニークなキー値に基づいてClickHouseの使用に制限を設けるために使用できます。詳細は[クォータ管理](/operations/access-rights#quotas-management)を参照してください。

ユーザーは、接続全体ではなく特定のクエリに対してのみ設定が適用されることを保証するために、コンテキストを使用することができます。これは、[接続設定](#connection-settings)で示されています。

最後に、`clickhouse.WithBlockSize`を使用してブロックバッファのサイズを制御することができます。これは接続レベルの設定`BlockBufferSize`を上書きし、メモリ内に常にデコードされ保持される最大ブロック数を制御します。大きな値は、メモリの代わりにより多くの並列化を意味します。

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
// 特定のAPI呼び出しに対して設定を渡すためにコンテキストを使用できます
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

// クエリはコンテキストを使用してキャンセルできます
ctx, cancel := context.WithCancel(context.Background())
go func() {
    cancel()
}()
if err = conn.QueryRow(ctx, "SELECT sleep(3)").Scan(); err == nil {
    return fmt.Errorf("キャンセルが予想されました")
}

// クエリにデッドラインを設定します - これにより、絶対時間に達した後クエリがキャンセルされます。
// クエリはClickHouseで完了するまで続行されます
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.Ping(ctx); err == nil {
    return fmt.Errorf("デッドラインを超えました")
}

// クエリをトレースするためのIDを設定します。例：system.query_logを確認します
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


### プログレス/プロファイル/ログ情報 {#progressprofilelog-information}
```Japanese
進捗、プロファイル、およびログ情報は、クエリに対して要求することができます。進捗情報は、ClickHouseで読み取られ処理された行とバイトの数に関する統計を報告します。逆に、プロファイル情報は、クライアントに返されるデータの概要を提供し、総バイト（圧縮されていない）、行、ブロックの合計が含まれます。最後に、ログ情報は、スレッドに関する統計を提供します。例えば、メモリ使用量やデータ転送速度です。

この情報を取得するには、ユーザーが [Context](#using-context) を使う必要があり、ユーザーはコールバック関数を渡すことができます。

```go
totalRows := uint64(0)
// 進捗とプロファイル情報のコールバックを渡すためにコンテキストを使用
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

fmt.Printf("総行数: %d\n", totalRows)
rows.Close()
```

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/progress.go)


### 動的スキャン {#dynamic-scanning}

ユーザーは、スキーマや返されるフィールドの型がわからないテーブルを読み取る必要がある場合があります。これは、アドホックなデータ分析が行われる場合や、汎用ツールが作成される場合によく発生します。これを達成するために、クエリ応答時にカラム型情報が利用可能です。これは、Goのリフレクションを使用して、正しい型の変数のランタイムインスタンスを作成し、Scanに渡すために使用できます。

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

[外部テーブル](/engines/table-engines/special/external-data/)は、クライアントがSELECTクエリと共にデータをClickHouseに送信できるようにします。このデータは、一時テーブルに配置され、クエリ自体で評価に使用できます。

外部データをクエリとともにクライアントに送信するには、ユーザーはコンテキストを介してこの外部テーブルを渡す前に `ext.NewTable` を使用して外部テーブルを構築する必要があります。

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

ClickHouseは、[トレースコンテキスト](/operations/opentelemetry/)をネイティブプロトコルの一部として渡すことを許可しています。クライアントは、`clickhouse.withSpan` 関数を介してSpanを作成し、これをコンテキストを介して渡すことができます。

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
fmt.Printf("カウント: %d\n", count)
```

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/open_telemetry.go)

トレーシングを活用する詳細に関しては、[OpenTelemetryサポート](/operations/opentelemetry/)を参照してください。


## データベース/SQL API {#databasesql-api}

`database/sql` または "標準" APIは、アプリケーションコードが基盤となるデータベースに対して無関心であるべきシナリオでクライアントを利用できるようにします。これは、いくつかのコストがかかります - 追加の抽象化および間接層、ClickHouseと必ずしも一致しないプリミティブが含まれます。しかし、これらのコストは通常、ツールが複数のデータベースに接続する必要があるシナリオでは受け入れられます。

さらに、このクライアントはHTTPをトランスポート層として使用することをサポートしており、データは最適なパフォーマンスのためにネイティブフォーマットでエンコードされます。

以下は、ClickHouse APIのドキュメントの構造を反映することを目指しています。

標準APIのフルコード例は[こちら](https://github.com/ClickHouse/clickhouse-go/tree/main/examples/std)で見つけることができます。

### 接続 {#connecting-1}

接続は、`clickhouse://<host>:<port>?<query_option>=<value>`形式のDSN文字列と`Open`メソッド、または`clickhouse.OpenDB`メソッドを介して達成できます。後者は`database/sql`の仕様には含まれていませんが、`sql.DB`インスタンスを返します。このメソッドは、明示的に`database/sql`仕様を通じて公開する手段がないプロファイリングなどの機能を提供します。

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

**すべての次の例では、特に示されない限り、ClickHouseの`conn`変数が作成されて使用可能であると仮定します。**

#### 接続設定 {#connection-settings-1}

次のパラメータはDSN文字列に渡すことができます：

* `hosts` - ロードバランシングとフェイルオーバーのための単一アドレスホストのカンマ区切りリスト - [複数ノードへの接続](#connecting-to-multiple-nodes) を参照。
* `username/password` - 認証資格情報 - [認証](#authentication) を参照。
* `database` - 現在のデフォルトデータベースを選択。
* `dial_timeout` - 期間文字列で、符号付きの数のシーケンスで、各数字にはオプションの小数部分と単位の接尾辞（例：`300ms`、`1s`）が含まれます。 有効な時間単位は `ms`、`s`、`m`。
* `connection_open_strategy` - `random/in_order` (デフォルト `random`) - [複数ノードへの接続](#connecting-to-multiple-nodes) を参照。
    - `round_robin` - セットからラウンドロビンのサーバーを選択。
    - `in_order` - 指定された順序で最初の稼働中のサーバーを選択。
* `debug` - デバッグ出力を有効にする (boolean値)。
* `compress` - 圧縮アルゴリズムを指定 - `none` (デフォルト)、`zstd`、`lz4`、`gzip`、`deflate`、`br`。`true`に設定すると、`lz4`が使用されます。ネイティブ通信には`lz4`と`zstd`のみがサポートされています。
* `compress_level` - 圧縮レベル (デフォルトは `0`)。圧縮に関する詳細は圧縮を参照。これはアルゴリズム特有です：
    - `gzip` - `-2` (最速) から `9` (最良の圧縮) まで。
    - `deflate` - `-2` (最速) から `9` (最良の圧縮) まで。
    - `br` - `0` (最速) から `11` (最良の圧縮) まで。
    - `zstd`、`lz4` - 無視されます。
* `secure` - セキュアなSSL接続を確立 (デフォルトは `false`)。
* `skip_verify` - 証明書検証をスキップ (デフォルトは `false`)。
* `block_buffer_size` - ユーザーがブロックバッファサイズを制御できるようにします。 [`BlockBufferSize`](#connection-settings)を参照してください。 (デフォルトは `2`)

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

ユーザーは、[複数ノードへの接続](#connecting-to-multiple-nodes)で説明されているように提供されたノードアドレスのリストの使用に影響を与えることができます。しかし、接続管理とプーリングは設計上 `sql.DB` に委任されています。

#### HTTP経由の接続 {#connecting-over-http}

デフォルトでは、接続はネイティブプロトコルを介して確立されます。HTTPが必要なユーザーは、DSNをHTTPプロトコルを含むように変更するか、接続オプションでプロトコルを指定することで、これを有効にできます。

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

`OpenDB`を使用している場合は、ClickHouse APIで使用されるのと同じオプションアプローチを使用して、同じ設定で複数のホストに接続します - 任意で`ConnOpenStrategy`を指定できます。

DSNベースの接続の場合、文字列は複数のホストと `connection_open_strategy` パラメータを受け入れ、`round_robin`または`in_order`の値を設定できます。

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

DSN接続文字列を使用している場合、SSLは "secure=true" パラメータを介して有効にできます。`OpenDB`メソッドは、TLSの[ネイティブAPI](#using-tls)と同じアプローチを利用して、nilでないTLS構造体の指定に依存します。DSN接続文字列はSSL検証をスキップするためのパラメータ`skip_verify`をサポートしますが、より高度なTLS構成のためには `OpenDB` メソッドが必要です - 構成を渡すことを許可しているためです。

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

`OpenDB`を使用している場合、認証情報は通常のオプションを介して渡すことができます。DSNベースの接続では、接続文字列内でユーザー名とパスワードをパラメータとして指定するか、アドレスにエンコードされた資格情報として提供できます。

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

接続が確立されると、ユーザーはExecメソッドを介して`sql`文を発行できます。

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


このメソッドはコンテキストを受け取ることをサポートしていません - デフォルトでは、バックグラウンドコンテキストで実行されます。ユーザーは必要に応じて`ExecContext`を使用できます - [コンテキストの使用](#using-context)を参照。

### バッチ挿入 {#batch-insert-1}

バッチセマンティクスは、`Being`メソッドを介して`sql.Tx`を作成することで達成できます。これにより、`INSERT`文で`Prepare`メソッドを使用してバッチを取得できます。これにより、行を`Exec`メソッドで追加できる`sql.Stmt`が返されます。バッチは、元の`sql.Tx`で`Commit`が実行されるまでメモリに累積されます。

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

単一行のクエリは、`QueryRow`メソッドを使用して達成できます。これにより、スキャンされる変数のポインタで`Scan`を呼び出せる`*sql.Row`が返されます。クエリ行のコンテキストバリアントを使用するとバックグラウンド以外のコンテキストを渡すことができます - [コンテキストの使用](#using-context)を参照。

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

複数行を繰り返すには、`Query`メソッドが必要です。これにより、`*sql.Rows`構造体が返され、`Next`を呼び出して行を繰り返すことができます。`QueryContext`の同等物を使用してコンテキストを渡すことができます。

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

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/query_rows.go)

### 非同期挿入 {#async-insert-1}

非同期挿入は、`ExecContext`メソッドを使用して挿入を実行することで達成できる。これには、非同期モードを有効にするコンテキストを渡すべきで、以下のように示されています。これにより、クライアントが挿入の完了を待つか、データが受信された時点で応答するかを指定できます。これは、[wait_for_async_insert](/operations/settings/settings/#wait-for-async-insert)パラメータを効果的に制御します。

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

### 列指向挿入 {#columnar-insert-1}

標準インターフェースを使用してはサポートされていません。

### 構造体の使用 {#using-structs-1}

標準インターフェースを使用してはサポートされていません。

### 型変換 {#type-conversions-1}

標準`database/sql`インターフェースは、[ClickHouse API](#type-conversions)と同じ型をサポートするべきです。多くの例外があり、特に複雑な型に関しては、詳細を以下に文書化しています。ClickHouse APIと同様に、クライアントは挿入と応答のマシュアルに関して変数型の受け入れについてできるだけ柔軟であることを目指しています。詳細については[型変換](#type-conversions)を参照してください。

### 複雑な型 {#complex-types-1}

特に述べない限り、複雑な型の処理は[ClickHouse API](#complex-types)と同じであるべきです。違いは`database/sql`の内部に起因します。

#### マップ {#maps}

ClickHouse APIとは異なり、標準APIはスキャンタイプでマップが強く型指定されることを要求します。たとえば、ユーザーは `map[string]interface{}` を `Map(String,String)`フィールドに渡すことはできず、代わりに `map[string]string` を使用する必要があります。なお、`interface{}`変数は常に適合し、より複雑な構造体に使用できます。構造体は読み取り時にサポートされていません。

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

挿入の動作はClickHouse APIと同じです。

### 圧縮 {#compression-1}

標準APIは、ネイティブな[ClickHouse API](#compression)と同じ圧縮アルゴリズム、すなわちブロックレベルでの`lz4`および`zstd`圧縮をサポートします。さらに、gzip、deflate、およびbr圧縮がHTTP接続用にサポートされています。これらのいずれかが有効になっている場合、圧縮は挿入およびクエリ応答中にブロックで実行されます。他のリクエスト（例：pingやクエリリクエスト）は圧縮されずにそのまま残ります。これは、`lz4`および`zstd`オプションと一致します。

`OpenDB`メソッドを使用して接続を確立する場合、圧縮構成を渡すことができます。これには、圧縮レベルを指定する機能が含まれます（以下を参照）。DSN経由で接続する場合は、パラメータ `compress` を利用します。これは、特定の圧縮アルゴリズム（例：`gzip`、`deflate`、`br`、`zstd`、または`lz4`）またはブールフラグとして指定できます。`true`に設定した場合は、`lz4`が使用されます。デフォルトは `none`、つまり圧縮が無効です。

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
[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/compression.go#L27-L76)


```go
conn, err := sql.Open("clickhouse", fmt.Sprintf("http://%s:%d?username=%s&password=%s&compress=gzip&compress_level=5", env.Host, env.HttpPort, env.Username, env.Password))
```

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/compression.go#L78-L115)

適用される圧縮レベルは、DSNパラメータ `compress_level` またはCompressionオプションのLevelフィールドで制御できます。デフォルトは0ですが、アルゴリズム特有です：

* `gzip` - `-2` (最速) から `9` (最良の圧縮) まで。
* `deflate` - `-2` (最速) から `9` (最良の圧縮) まで。
* `br` - `0` (最速) から `11` (最良の圧縮) まで。
* `zstd`、`lz4` - 無視される。

### パラメータバインディング {#parameter-binding-1}

標準APIは、[ClickHouse API](#parameter-binding)と同じパラメータバインディング機能をサポートしており、`Exec`、`Query`、および `QueryRow`メソッド（およびそれらの[Context](#using-context)の同等物）にパラメータを渡すことができます。位置指定、名前付き、番号付きのパラメータがサポートされています。

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

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/bind.go)

特別なケースに関しては、[特別なケース](#special-cases)が依然として適用されます。

### コンテキストの使用 {#using-context-1}

標準APIは、[ClickHouse API](#using-context)と同じ方法で、期限、キャンセルシグナル、その他のリクエストスコープの値をコンテキストを介して渡す機能をサポートしています。ClickHouse APIとは異なり、これはメソッドの `Context` バリアントを使用することによって達成されます。すなわち、デフォルトでバックグラウンドコンテキストを使用する`Exec`のようなメソッドには、最初のパラメータとしてコンテキストを渡すことができる `ExecContext`というバリアントがあります。これにより、アプリケーションのフローの任意の段階でコンテキストを渡すことが可能です。たとえば、ユーザーは`ConnContext`を介して接続を確立するときや、`QueryRowContext`を介してクエリ行を要求するときにコンテキストを渡すことができます。利用可能なすべてのメソッドの例は以下に示されています。

期限の設定、キャンセルシグナル、クエリ ID、クォータキー、および接続設定を渡すためにコンテキストを使用する詳細については、[ClickHouse API](#using-context)のコンテキストの使用を参照してください。

```go
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "allow_experimental_object_type": "1",
}))
conn.ExecContext(ctx, "DROP TABLE IF EXISTS example")
// JSONカラムを作成するにはallow_experimental_object_type=1が必要
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
    return fmt.Errorf("キャンセルが予想されました")
}

// クエリの期限を設定 - これは絶対時間が達成された後にクエリをキャンセルします。再び、接続のみが終了し、クエリはClickHouseでの完了まで続きます。
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.PingContext(ctx); err == nil {
    return fmt.Errorf("期限超過が予想されました")
}

// ログ内のクエリをトレースするのに役立つクエリIDを設定します。例: system.query_logの確認
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
// クォータキーを設定 - 最初にクォータを作成します
if _, err = conn.ExecContext(ctx, "CREATE QUOTA IF NOT EXISTS foobar KEYED BY client_key FOR INTERVAL 1 minute MAX queries = 5 TO default"); err != nil {
    return err
}

// コンテキストを使用してクエリをキャンセルできます
ctx, cancel = context.WithCancel(context.Background())
// キャンセル前に何らかの結果が得られます
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
            fmt.Println("キャンセルが予想されました")
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

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/context.go)


### セッション {#sessions}

ネイティブ接続は本質的にセッションを持っていますが、HTTP経由の接続では、ユーザーがセッションIDを作成し、設定としてコンテキストに渡す必要があります。これにより、一時テーブルなどの機能がセッションにバインドされて使用できます。

```go
conn := clickhouse.OpenDB(&clickhouse.Options{
    Addr: []string{fmt.Sprintf("%s:%d", env.Host, env.HttpPort)},
    Auth: clickhouse.Auth{
        Database: env.Database,
        Username: env.Username,
        Password: env.Password,
    },
```
```
```go
プロトコル: clickhouse.HTTP,
設定: clickhouse.Settings{
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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/session.go)

### 動的スキャン {#dynamic-scanning-1}

[ClickHouse API](#dynamic-scanning) と同様に、カラムタイプ情報が利用可能で、ユーザーが適切な型の変数インスタンスをランタイムに作成し、それを Scan に渡すことができます。これにより、タイプが不明なカラムを読み取ることが可能になります。

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

[外部テーブル](/engines/table-engines/special/external-data/) により、クライアントは `SELECT` クエリを使用して ClickHouse にデータを送信できます。このデータは一時テーブルに置かれ、クエリ自体で評価に使用できます。

クエリを使用して外部データをクライアントに送信するには、ユーザーは `ext.NewTable` を介して外部テーブルを構築し、その後コンテキストを介して渡す必要があります。

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


### Open Telemetry {#open-telemetry-1}

ClickHouse では、[トレースコンテキスト](/operations/opentelemetry/) をネイティブプロトコルの一部として渡すことができます。クライアントは `clickhouse.withSpan` 関数を使用してスパンを作成し、コンテキストを通じて渡すことでこれを実現します。これは、HTTP がトランスポートとして使用されている場合にはサポートされていません。

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

## パフォーマンステips {#performance-tips}

* 可能な限り ClickHouse API を利用してください。特にプリミティブ型の場合は、重要なリフレクションと間接参照を避けることができます。
* 大規模なデータセットを読み取る場合、[`BlockBufferSize`](#connection-settings) の変更を検討してください。これはメモリ使用量を増加させますが、行のイテレーション中により多くのブロックを並行してデコードできるようになります。デフォルト値の2は保守的で、メモリオーバーヘッドを最小限に抑えます。より高い値は、メモリ内のブロック数を増やします。異なるクエリにより異なるブロックサイズが生成されるため、テストが必要です。したがって、これを [クエリレベル](#using-context) でコンテキストを介して設定することができます。
* データを挿入する際には、型に特化してください。クライアントは、UUID や IP の解析を許可するなど柔軟であることを目指していますが、これにはデータの検証が必要で、挿入時にコストが発生します。
* 可能な限り列指向の挿入を使用してください。これらは型を強く指定するべきで、クライアントが値を変換する必要を避けることができます。
* ClickHouse の [推奨事項](/sql-reference/statements/insert-into/#performance-considerations) に従って、最適な挿入性能を確保してください。
```
