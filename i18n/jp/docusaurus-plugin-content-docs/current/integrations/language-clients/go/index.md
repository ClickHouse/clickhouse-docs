
---
sidebar_label:  ゴー
sidebar_position: 1
keywords: [clickhouse, go, client, golang]
slug: /integrations/go
description: Goクライアントは、Goの標準database/sqlインターフェースまたは最適化されたネイティブインターフェースを使用してClickHouseに接続することを可能にします。
---

import ConnectionDetails from '@site/docs/_snippets/_gather_your_details_native.md';

# ClickHouse Go
## シンプルな例 {#a-simple-example}
シンプルな例を見ていきましょう。これによりClickHouseに接続し、システムデータベースから選択します。始めるには、接続の詳細が必要です。
### 接続の詳細 {#connection-details}
<ConnectionDetails />
### モジュールの初期化 {#initialize-a-module}

```bash
mkdir clickhouse-golang-example
cd clickhouse-golang-example
go mod init clickhouse-golang-example
```
### サンプルコードのコピー {#copy-in-some-sample-code}

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
### go mod tidyの実行 {#run-go-mod-tidy}

```bash
go mod tidy
```
### 接続の詳細を設定 {#set-your-connection-details}
以前に接続の詳細を調べました。それらを `main.go` の `connect()` 関数に設定してください：

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
### 例を実行 {#run-the-example}
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
このカテゴリの残りのドキュメントでは、ClickHouse Goクライアントの詳細について説明しています。
## ClickHouse Goクライアント {#clickhouse-go-client}

ClickHouseは2つの公式Goクライアントをサポートしています。これらのクライアントは補完的であり、意図的に異なるユースケースをサポートしています。

* [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) - Go標準database/sqlインターフェースまたはネイティブインターフェースのいずれかをサポートする高レベル言語クライアント。
* [ch-go](https://github.com/ClickHouse/ch-go) - 低レベルクライアント。ネイティブインターフェースのみ。

clickhouse-goは高レベルインターフェースを提供し、データ型に対して寛容な行指向のセマンティクスとバッチを使用してデータをクエリおよび挿入できます。ch-goは一方で、型の厳格さと複雑な使用法の代償として、低CPUおよびメモリオーバーヘッドで高速なデータブロックストリーミングを提供する最適化された列指向インターフェースを提供します。

バージョン2.3から、clickhouse-goはエンコーディング、デコーディング、圧縮などの低レベル機能にch-goを利用しています。なお、clickhouse-goはGoの`database/sql`インターフェース標準もサポートしています。両方のクライアントはネイティブ形式を使用してエンコーディングを行い、最適なパフォーマンスを提供し、ネイティブClickHouseプロトコルを介して通信できます。また、clickhouse-goは、ユーザーがトラフィックをプロキシまたは負荷分散する必要がある場合のためにHTTPもトランスポートメカニズムとしてサポートしています。

クライアントライブラリを選択する際には、それぞれの利点と欠点を理解しておく必要があります - クライアントライブラリの選択を見てください。

|               | ネイティブ形式 | ネイティブプロトコル | HTTPプロトコル | 行指向API | 列指向API | 型の柔軟性 | 圧縮 | クエリプレースホルダ |
|:-------------:|:-------------:|:---------------:|:-------------:|:------------------:|:---------------------:|:----------------:|:-----------:|:------------------:|
| clickhouse-go |       ✅       |        ✅        |       ✅       |          ✅         |           ✅           |         ✅        |      ✅      |          ✅         |
|     ch-go     |       ✅       |        ✅        |               |                    |           ✅           |                  |      ✅      |                    |
## クライアントの選択 {#choosing-a-client}

クライアントライブラリの選択は、使用パターンと最適なパフォーマンスの必要性に依存します。毎秒数百万の挿入が要求される挿入重視のユースケースでは、低レベルクライアント [ch-go](https://github.com/ClickHouse/ch-go) を使用することをお勧めします。このクライアントは、ClickHouseのネイティブ形式が要求する行指向形式から列へのデータピボットに関連するオーバーヘッドを回避します。さらに、`interface{}`(`any`) 型の反射や使用を避けて、使用を簡単にしています。

集計に重点を置いたクエリワークロードやスループットが低い挿入ワークロードの場合、[clickhouse-go](https://github.com/ClickHouse/clickhouse-go) が馴染みのある `database/sql` インターフェースとより簡潔な行セマンティクスを提供します。ユーザーは、トランスポートプロトコルとしてHTTPを選択的に使用し、行を構造体に変換するためのヘルパー関数を利用できる場合もあります。
## clickhouse-goクライアント {#the-clickhouse-go-client}

clickhouse-goクライアントはClickHouseとの通信のために2つのAPIインターフェースを提供します：

* ClickHouseクライアント特有のAPI
* `database/sql` 標準 - Golangが提供するSQLデータベースの一般的なインターフェース。

`database/sql` はデータベースに依存しないインターフェースを提供し、デベロッパーがデータストアを抽象化できるようにしますが、一部の型とクエリセマンティクスを強制し、パフォーマンスに影響を与えます。このため、[パフォーマンスが重要な場合](https://github.com/clickHouse/clickHouse-go#benchmark) はクライアント特有のAPIを使用するべきです。しかし、複数のデータベースをサポートするツールにClickHouseを統合したいユーザーは、標準インターフェースを使用することを好むかもしれません。

両方のインターフェースは[ネイティブ形式](/native-protocol/basics.md)とネイティブプロトコルを使用してデータをエンコードします。また、標準インターフェースはHTTPを介した通信もサポートしています。

|                    | ネイティブ形式 | ネイティブプロトコル | HTTPプロトコル | 一括書き込みサポート | 構造体マシュアル | 圧縮 | クエリプレースホルダ |
|:------------------:|:-------------:|:---------------:|:-------------:|:------------------:|:-----------------:|:-----------:|:------------------:|
|   ClickHouse API   |       ✅       |        ✅        |               |          ✅         |         ✅         |      ✅      |          ✅         |
| `database/sql` API |       ✅       |        ✅        |       ✅       |          ✅         |                   |      ✅      |          ✅         |
## インストール {#installation}

ドライバーのv1は非推奨であり、機能更新や新しいClickHouseタイプのサポートは行われません。ユーザーは性能が優れているv2に移行するべきです。

クライアントの2.xバージョンをインストールするには、go.modファイルにパッケージを追加します：

`require github.com/ClickHouse/clickhouse-go/v2 main`

または、リポジトリをクローンします：

```bash
git clone --branch v2 https://github.com/clickhouse/clickhouse-go.git $GOPATH/src/github
```

別のバージョンをインストールするには、パスまたはブランチ名を適宜修正してください。

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

クライアントはClickHouseとは独立してリリースされます。2.xは現在開発中の主要バージョンを表します。すべての2.xバージョンは互換性があります。
#### ClickHouse互換性 {#clickhouse-compatibility}

クライアントは以下をサポートします：

- すべての現在サポートされているClickHouseバージョン [こちら](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md) に記録されています。ClickHouseのバージョンがサポートされなくなった場合、それらはクライアントリリースに対しても積極的にはテストされなくなります。
- クライアントのリリース日から2年間、すべてのClickHouseバージョン。なお、LTSバージョンのみ積極的にテストされます。
#### Golang互換性 {#golang-compatibility}

| クライアントバージョン | Golangバージョン |
|:--------------:|:---------------:|
|  => 2.0 &lt;= 2.2 |    1.17, 1.18   |
|     >= 2.3     |       1.18      |
## ClickHouseクライアントAPI {#clickhouse-client-api}

ClickHouseクライアントAPIのすべてのコードサンプルは [こちら](https://github.com/ClickHouse/clickhouse-go/tree/main/examples) で見つけることができます。
### 接続 {#connecting}

以下の例は、サーバーバージョンを返し、ClickHouseに接続することを示しており、ClickHouseが保護されていないことを前提とし、デフォルトユーザーでアクセスできます。

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

**すべてのその後の例では、明示的に示されない限り、ClickHouse `conn` 変数が作成され、利用可能であることを前提とします。**
#### 接続設定 {#connection-settings}

接続を開くときは、Options構造体を使用してクライアントの動作を制御できます。利用可能な設定は次のとおりです：

* `Protocol` - ネイティブまたはHTTP。HTTPは、現在[database/sql API](#databasesql-api)のみに対応しています。
* `TLS` - TLSオプション。非nilの値はTLSを有効にします。[TLSの使用](#using-tls)を参照してください。
* `Addr` - ポートを含むアドレスのスライス。
* `Auth` - 認証の詳細。[認証](#authentication)を参照してください。
* `DialContext` - 接続を確立する方法を決定するカスタムダイヤル関数。
* `Debug` - デバッグを有効にするためのtrue/false。
* `Debugf` - デバッグ出力を消費する関数を提供します。`debug`をtrueに設定する必要があります。
* `Settings` - ClickHouse設定のマップ。これらはすべてのClickHouseクエリに適用されます。[コンテキストの使用](#using-context)によりクエリごとに設定を設定できます。
* `Compression` - ブロックの圧縮を有効にします。[圧縮](#compression)を参照してください。
* `DialTimeout` - 接続を確立する最大時間。デフォルトは `1s`。
* `MaxOpenConns` - いつでも使用できる最大接続数。アイドルプールにはそれ以上またはそれ以下の接続があるかもしれませんが、いつでもこの数の接続しか使用できません。デフォルトは `MaxIdleConns+5`。
* `MaxIdleConns` - プール内で維持する接続の数。可能な場合、接続は再利用されます。デフォルトは `5`。
* `ConnMaxLifetime` - 接続を使用可能な状態で保持する最大期間。デフォルトは1時間。接続はこの時間が経過すると破棄され、新しい接続が必要に応じてプールに追加されます。
* `ConnOpenStrategy` - ノードアドレスのリストをどのように消費し、使用して接続を開くかを決定します。[複数ノードへの接続](#connecting-to-multiple-nodes)を参照してください。
* `BlockBufferSize` - 一度にバッファにデコードするブロックの最大数。大きな値はメモリの代償で並列化を増加させます。ブロックサイズはクエリに依存するため、接続時にこれを設定できますが、返すデータに基づいてクエリごとに上書きすることをお勧めします。デフォルトは `2`。

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

クライアントは接続プールを維持し、必要に応じてこれをクエリに再利用します。最大で、`MaxOpenConns` がいつでも使用され、プールの最大サイズは `MaxIdleConns` によって制御されます。クライアントは各クエリ実行のためにプールから接続を取得し、再利用のためにプールに返します。接続はバッチの寿命に使用され、`Send()` で解放されます。

プール内の同じ接続がその後のクエリで使用されることは保証されていません。もしユーザーが `MaxOpenConns=1` を設定しない限り。これは通常必要とされることはありませんが、ユーザーが一時テーブルを使用している場合には必要になることがあります。

また、`ConnMaxLifetime` はデフォルトで1時間です。これは、ノードがクラスタから離れた場合にClickHouseへの負荷が不均衡になるケースを引き起こす可能性があります。ノードが利用できなくなると、この接続は他のノードにバランスされます。これらの接続は保持され、デフォルトで1時間はリフレッシュされません。問題のあるノードがクラスタに戻ってもそうです。重いワークロードの場合はこの値を下げることを検討してください。
### TLSの使用 {#using-tls}

低レベルでは、すべてのクライアント接続メソッド（`DSN/OpenDB/Open`）は、[Go tlsパッケージ](https://pkg.go.dev/crypto/tls)を使用して安全な接続を確立します。Options構造体に非nilの `tls.Config` ポインタが含まれている場合、クライアントはTLSを使用することを知っています。

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

この最小限の `TLS.Config` は通常、ClickHouseサーバーのセキュアネイティブポート（通常9440）に接続するために十分です。ClickHouseサーバーに有効な証明書（期限切れ、誤ったホスト名、公開認識されたルート認証局によって署名されていない）がない場合、`InsecureSkipVerify`をtrueにすることができますが、これは強く推奨されません。

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

追加のTLSパラメータが必要な場合、アプリケーションコードは`tls.Config`構造体内の希望するフィールドを設定する必要があります。これには、特定の暗号スイートの強制、特定のTLSバージョン（1.2や1.3など）の強制、内部CA証明書チェーンの追加、ClickHouseサーバーによって必要とされる場合にクライアント証明書（および秘密鍵）の追加、その他の専門的なセキュリティ設定に関するすべてのオプションが含まれます。
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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/1c0d81d0b1388dbb9e09209e535667df212f4ae4/examples/clickhouse_api/multi_host.go#L26-L45)


2つの接続戦略が利用可能です：

* `ConnOpenInOrder`（デフォルト） - アドレスは順に消費されます。後のアドレスは、リストの先頭にあるアドレスを使用して接続できない場合にのみ利用されます。これは事実上のフェイルオーバー戦略です。
* `ConnOpenRoundRobin` - ロードがラウンドロビン戦略を使用してアドレス間でバランスが取られます。

これはオプション `ConnOpenStrategy` を介して制御できます。

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

任意のステートメントは `Exec` メソッドを介して実行できます。これはDDLおよびシンプルなステートメントに便利です。大きな挿入やクエリの反復には使用すべきではありません。

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


クエリにコンテキストを渡す能力に注意してください。これは特定のクエリレベル設定を渡すために使用できます - [コンテキストの使用](#using-context)を参照してください。
### バッチ挿入 {#batch-insert}

多数の行を挿入するには、クライアントはバッチセマンティクスを提供します。これにより、行を追加できるようにバッチを準備する必要があります。これは最終的に `Send()` メソッドを介して送信されます。バッチはSendが実行されるまでメモリに保持されます。

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

ClickHouseの推奨事項が[ここにも](guides/inserting-data#best-practices-for-inserts)適用されます。バッチはゴルーチン間で共有するべきではなく、各ゴルーチンごとに別々のバッチを構築する必要があります。

上記の例から、行を追加する際には変数タイプがカラムタイプと一致する必要があることに注意してください。マッピングが通常は明白である一方で、このインターフェースは柔軟性を持つようにし、精度損失が生じない限り型を変換します。たとえば、以下はdatetime64に文字列を挿入するデモです。

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


各カラムタイプのサポートされているgo型の完全な概要は、[型変換](#type-conversions)を参照してください。
### 行のクエリ {#querying-rows}


ユーザーは `QueryRow` メソッドを使用して単一の行をクエリするか、`Query` を介して結果セットを反復するためのカーソルを取得できます。前者はデータをシリアライズするための宛先を受け入れ、後者は各行で `Scan` を呼び出す必要があります。

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

この場合、我々はそれぞれのカラム値をシリアライズするためにポインタを渡す必要があります。これらは `SELECT` ステートメントで指定された順序で渡す必要があり、デフォルトでは `SELECT *` の場合カラム宣言の順序が使用されます。

挿入時と同様に、Scanメソッドはターゲット変数が適切な型である必要があります。このインターフェースは柔軟性を持つことを目指しており、精度損失がない場合は可能な限り型を変換します。たとえば、上記の例は、UUIDカラムが文字列変数に読み込まれることを示しています。サポートされているgo型の完全なリストは、各カラムタイプの[型変換](#type-conversions)を参照してください。

最後に、`Query` と `QueryRow` メソッドに `Context` を渡す能力に注意してください。これはクエリレベルの設定に使用できます - [コンテキストの使用](#using-context)の詳細を確認してください。
### 非同期挿入 {#async-insert}

非同期挿入はAsyncメソッドを介してサポートされています。これにより、クライアントがサーバーが挿入を完了するまで待機するか、データが受信された時点で応答するかを指定できます。これは事実上 [wait_for_async_insert](/operations/settings/settings#wait_for_async_insert) パラメータを制御します。

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
### 列指向の挿入 {#columnar-insert}

挿入は列形式で挿入できます。これにより、データがすでにこの構造で配置されている場合にパフォーマンス上の利点が得られ、行にピボットする必要がなくなります。

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

ユーザーにとって、Golangの構造体はClickHouseのデータ行を論理的に表現します。これを支援するために、ネイティブインターフェースはいくつかの便利な関数を提供します。
#### シリアライズを伴う選択 {#select-with-serialize}

Selectメソッドは、応答行のセットを単一の呼び出しで構造体のスライスにマシュアルします。

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
#### 構造体をスキャンする {#scan-struct}

`ScanStruct`は、クエリからの単一の行を構造体にマシュアルすることを可能にします。

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
```
#### Append Struct {#append-struct}

`AppendStruct` を使用すると、構造体を既存の [バッチ](#batch-insert) に追加し、完全な行として解釈することができます。これは、構造体のカラムがテーブルの名前と型と一致する必要があります。すべてのカラムが相応の構造体フィールドを持つ必要がありますが、相応のカラム表現を持たない構造体フィールドも存在します。これらは単に無視されます。

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

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/append_struct.go)

### 型変換 {#type-conversions}

クライアントは、挿入とレスポンスのマーシャリングの双方に対し、変数型を受け入れる柔軟性を持つことを目指しています。ほとんどの場合、ClickHouse カラム型に対する同等の Golang 型が存在し、例えば、 [UInt64](/sql-reference/data-types/int-uint/) は [uint64](https://pkg.go.dev/builtin#uint64) に対応しています。これらの論理マッピングは常にサポートされるべきです。ユーザーは、挿入できるカラムに対して、またはレスポンスを受け取るために、どちらかの変数や受信データの変換が最初に行われる場合に変数型を使用したいと考えるかもしれません。クライアントは、これらの変換を透明にサポートし、ユーザーがデータを正確に揃えるために変換する必要がなく、クエリ時で柔軟なマーシャリングを提供できるようにします。この透明な変換は、精度の損失を許可しません。たとえば、uint32 は UInt64 カラムからデータを受け取るためには使用できません。逆に、時間の形式要件を満たす場合、文字列は datetime64 フィールドに挿入できます。

現在サポートされている原始型の型変換は [こちら](https://github.com/ClickHouse/clickhouse-go/blob/main/TYPES.md) に記載されています。

この取り組みは継続中であり、挿入（`Append`/`AppendRow`）とリードタイム（`Scan` を介して）に分けることができます。特定の変換に対するサポートが必要な場合は、問題を提起してください。

### 複合型 {#complex-types}
#### 日付/日時型 {#datedatetime-types}

ClickHouse の Go クライアントは、`Date`、`Date32`、`DateTime`、および `DateTime64` の日付/日時型をサポートしています。日付は `2006-01-02` 形式の文字列として挿入するか、ネイティブ Go の `time.Time{}` または `sql.NullTime` を使用できます。日時は後者の型もサポートしていますが、文字列は `2006-01-02 15:04:05` 形式で渡す必要があり、オプションのタイムゾーンオフセット（例：`2006-01-02 15:04:05 +08:00`）が必要です。`time.Time{}` と `sql.NullTime` は、リードタイムでもサポートされており、`sql.Scanner` インターフェースの実装であればどれでも対応します。

タイムゾーン情報の取り扱いは、ClickHouse 型や、値が挿入されているか読み取られているかによって異なります：

* **DateTime/DateTime64**
    * **挿入**時、値は UNIX タイムスタンプ形式で ClickHouse に送信されます。タイムゾーンが指定されていない場合、クライアントはクライアントのローカルタイムゾーンを仮定します。`time.Time{}` または `sql.NullTime` は適宜エポックに変換されます。
    * **選択**時、カラムのタイムゾーンが設定されている場合はそれが使用されて `time.Time` 値が返されます。設定されていない場合は、サーバーのタイムゾーンが使用されます。
* **Date/Date32**
    * **挿入**時、Unix タイムスタンプに変換するときにタイムゾーンが考慮され、データが日付として保存される前にタイムゾーンでオフセットされます。ClickHouse では Date 型にはロケールがないため、文字列値でこれが指定されていない場合はローカルタイムゾーンが使用されます。
    * **選択**時、日付は `time.Time{}` または `sql.NullTime{}` インスタンスにスキャンされ、タイムゾーン情報は返されません。

#### 配列 {#array}

配列はスライスとして挿入する必要があります。要素の型付けルールは [原始型](#type-conversions) に関するものと一貫しており、可能な場合には要素が変換されます。

スキャン時には、スライスへのポインタを指定する必要があります。

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
    fmt.Printf("row: col1=%v, col2=%v\n", col1, col2)
}
rows.Close()
```

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/array.go)

#### マップ {#map}

マップは、型ルールに準拠したキーと値を持つ Golang マップとして挿入されるべきです。

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
    fmt.Printf("row: col1=%v, col2=%v, col3=%v\n", col1, col2, col3)
}
rows.Close()
```

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/map.go)

#### タプル {#tuples}

タプルは、任意の長さのカラムのグループを表します。カラムは明示的に名前付けされることも、単に型を指定することもできます。例えば：

```sql
//名前なし
Col1 Tuple(String, Int64)

//名前付き
Col2 Tuple(name String, id Int64, age uint8)
```

これらのアプローチの中で、名前付きタプルはより柔軟性を提供します。名前なしのタプルはスライスを使用して挿入および読み取りする必要がありますが、名前付きタプルはマップとも互換性があります。

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
// 名前付きおよび名前なしの両方はスライスで追加することができます。すべての要素が同じ型であった場合、強い型付けリストとマップを使用できます。
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
// 名前付きタプルはマップまたはスライスに取得できますが、名前なしはスライスのみです。
if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2, &col3); err != nil {
    return err
}
fmt.Printf("row: col1=%v, col2=%v, col3=%v\n", col1, col2, col3)
```

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/tuple.go)

注意：型付けされたスライスおよびマップがサポートされている場合は、名前付きタプルのサブカラムすべてが同じ型である必要があります。

#### ネスト {#nested}

ネストされたフィールドは、名前付きタプルの配列に相当します。使用は、ユーザーが [flatten_nested](/operations/settings/settings#flatten_nested) を 1 または 0 に設定したかどうかに依存します。

`flatten_nested` を 0 に設定すると、ネストされたカラムは単一のタプルの配列として維持されます。これにより、ユーザーは挿入と取得のためにマップのスライスを使用し、任意のネストレベルを持つことができます。マップのキーはカラムの名前と等しくする必要があります。以下の例に示すように。

注意：マップはタプルを表すため、`map[string]interface{}` 型である必要があります。現在、値は強く型付けされていません。

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
    fmt.Printf("row: col1=%v, col2=%v\n", col1, col2)
}
rows.Close()
```

[フル例 - `flatten_tested=0`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L28-L118)

`flatten_nested` のデフォルト値である 1 が使用されると、ネストされたカラムは別々の配列にフラット化されます。これには、挿入と取得のためにネストされたスライスを使用する必要があります。任意のネストレベルが機能する場合もありますが、これは公式にはサポートされていません。

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

[フル例 - `flatten_nested=1`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L123-L180)

注意：ネストされたカラムは同じ次元である必要があります。たとえば、上記の例では、 `Col_2_2` と `Col_2_1` は同じ数の要素を持つ必要があります。

よりシンプルなインターフェースとネスティングに対する公式なサポートのために、`flatten_nested=0` を推奨します。

#### ジオタイプ {#geo-types}

クライアントは、ジオタイプである Point、Ring、Polygon、および Multi Polygon をサポートしています。これらのフィールドは Golang で、[github.com/paulmach/orb](https://github.com/paulmach/orb) パッケージを使用して扱われます。

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

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/geo.go)

#### UUID {#uuid}

UUID 型は [github.com/google/uuid](https://github.com/google/uuid) パッケージによってサポートされています。ユーザーは UUID を文字列として送信およびマーシャリングすることも、`sql.Scanner` または `Stringify` を実装している任意の型として扱うこともできます。

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

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/uuid.go)

#### Decimal {#decimal}

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

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/decimal.go)

#### Nullable {#nullable}

Go の Nil 値は、ClickHouse の NULL を表します。これは、フィールドが Nullable として宣言されている場合に使用できます。挿入時には、通常のカラムと Nullable バージョンの両方に対して Nil を渡すことができます。前者の場合は、その型のデフォルト値が保持され、例えば文字列の場合は空の文字列になります。Nullable バージョンの場合は、ClickHouse に NULL 値が保存されます。

スキャン時には、ユーザーは nil をサポートする型（例えば *string）へのポインタを渡さなくてはなりません。これにより、Nullable フィールドについての nil 値が表現されます。以下の例では、col1 が Nullable(String) のため、**string を受け取ります。これにより nil が表現可能となります。

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

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nullable.go)

クライアントはさらに `sql.Null*` 型（例：`sql.NullInt64`）もサポートしています。これらは、それぞれの同等の ClickHouse 型と互換性があります。

#### ビッグイント - Int128, Int256, UInt128, UInt256 {#big-ints---int128-int256-uint128-uint256}

64 ビットを超える数値型は、ネイティブ Go の [big](https://pkg.go.dev/math/big) パッケージを使用して表示されます。

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

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/big_int.go)

### 圧縮 {#compression}

圧縮メソッドのサポートは、使用するプロトコルに依存します。ネイティブプロトコルの場合、クライアントは `LZ4` および `ZSTD` 圧縮をサポートしています。これはブロックレベルでのみ実行されます。圧縮は接続に `Compression` 設定を含めることで有効にできます。

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

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/compression.go)

標準インターフェースを通じて HTTP を使用する場合に、追加の圧縮技術が利用可能です。詳細については [database/sql API - 圧縮](#compression) を参照してください。

### パラメータバインディング {#parameter-binding}

クライアントは、`Exec`、`Query`、および `QueryRow` メソッドのためのパラメータバインディングをサポートしています。以下の例に示すように、これは名前付き、番号付き、および位置指定のパラメータを使用してサポートされています。これらの例を以下に示します。

```go
var count uint64
// 位置指定のバインド
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

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind.go)

#### 特殊なケース {#special-cases}

デフォルトでは、スライスはクエリにパラメータとして渡された場合、カンマで区切られた値のリストに展開されます。ユーザーが、値のセットを `[ ]` でラッピングして挿入する必要がある場合、`ArraySet` を使用する必要があります。

グループやタプルが必要な場合は、 `IN` 演算子で使用するために、 `GroupSet` を使用できます。これは、複数のグループが必要な場合に特に便利で、以下の例に示されています。

最後に、DateTime64 フィールドは、パラメータが適切に描画されるように精度が要求されます。しかし、フィールドの精度レベルはクライアントによって不明であるため、ユーザーがそれを提供する必要があります。そのため、`DateNamed` パラメータを提供しています。

```go
var count uint64
// 配列は展開されます
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN (?)", []int{100, 200, 300, 400, 500}).Scan(&count); err != nil {
    return err
}
fmt.Printf("配列展開のカウント: %d\n", count)
// 配列は [] で保持されます
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col4 = ?", clickhouse.ArraySet{300, 301}).Scan(&count); err != nil {
    return err
}
fmt.Printf("配列のカウント: %d\n", count)
// グループセットを使うことで ( ) リストを形成できます
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN ?", clickhouse.GroupSet{[]interface{}{100, 200, 300, 400, 500}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("グループのカウント: %d\n", count)
// ネスティングが必要な場合に特に便利です
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE (Col1, Col5) IN (?)", []clickhouse.GroupSet{{[]interface{}{100, 101}}, {[]interface{}{200, 201}}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("グループのカウント: %d\n", count)
// 精度が必要な場合には DateNamed を使用します
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col3 >= @col3", clickhouse.DateNamed("col3", now.Add(time.Duration(500)*time.Millisecond), clickhouse.NanoSeconds)).Scan(&count); err != nil {
    return err
}
fmt.Printf("NamedDate のカウント: %d\n", count)
```

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind_special.go)

### コンテキストの使用 {#using-context}

Go のコンテキストは、期限、キャンセルシグナル、および他のリクエストスコープ値を API 境界を越えて渡す手段を提供します。接続のすべてのメソッドは、最初の変数としてコンテキストを受け取ります。前の例では context.Background() を使用しましたが、ユーザーはこの機能を利用して設定や期限を渡し、クエリをキャンセルすることができます。

`withDeadline` で作成されたコンテキストを渡すことで、クエリに対して実行時間制限を設定することができます。これは絶対的な時間であり、期限が過ぎると接続が解放され、ClickHouse にキャンセルシグナルが送信されます。 alternatively, `WithCancel` を使用して、クエリを明示的にキャンセルすることもできます。

ヘルパーである `clickhouse.WithQueryID` および `clickhouse.WithQuotaKey` を使用することで、クエリ ID およびクオータキーを指定できます。クエリ ID は、ログ内でクエリを追跡し、キャンセルを目的として便利です。クオータキーは、ユニークキー値に基づいて ClickHouse の使用制限を課すために使用できます - 詳細は [クオータ管理](/operations/access-rights#quotas-management) を参照してください。

ユーザーはまた、特定のクエリにのみ設定を適用するためにコンテキストを使用できます - 接続全体ではなく、[接続設定](#connection-settings)に示したように。

最後に、ユーザーは `clickhouse.WithBlockSize` を介してブロックバッファのサイズを制御できます。これにより、接続レベル設定 `BlockBufferSize` がオーバーライドされ、メモリ内にデコードされ保持されるブロックの最大数が制御されます。大きな値は、メモリを犠牲にして並列処理が増加する可能性があります。

上記の例は、以下に示されています。

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
// 特定のAPI呼び出しに設定を渡すためにコンテキストを使用できます
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

// クエリはコンテキストを使用してキャンセルできます
ctx, cancel := context.WithCancel(context.Background())
go func() {
    cancel()
}()
if err = conn.QueryRow(ctx, "SELECT sleep(3)").Scan(); err == nil {
    return fmt.Errorf("expected cancel")
}

// クエリに期限を設定する - これは絶対的な時間が達成されるとクエリをキャンセルします。
// クエリは ClickHouse で完了するまで続行されます
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.Ping(ctx); err == nil {
    return fmt.Errorf("expected deadline exceeded")
}

// ログ内でのクエリ追跡を支援するためにクエリ ID を設定します - system.query_log を参照
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
```

[フル例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/context.go)
### 進捗/プロファイル/ログ情報 {#progressprofilelog-information}

クエリに対して進捗、プロファイル、ログ情報をリクエストすることができます。進捗情報は、ClickHouseで読み取りおよび処理された行数とバイト数に関する統計を報告します。一方、プロファイル情報は、クライアントに返されたデータの概要を提供し、バイトの合計（圧縮されていない）、行数、ブロック数を含みます。最後に、ログ情報は、スレッドに関する統計（例：メモリ使用量やデータ速度）を提供します。

この情報を取得するには、ユーザーが[Context](#using-context)を使用する必要があり、ユーザーはコールバック関数を渡すことができます。

```go
totalRows := uint64(0)
// 進捗とプロファイル情報のためのコールバックを渡すためにコンテキストを使用します
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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/progress.go)
### 動的スキャン {#dynamic-scanning}

ユーザーは、スキーマや返されるフィールドの型が不明なテーブルを読み取る必要がある場合があります。これは、アドホックデータ分析が行われる場合や汎用ツールが書かれる場合によく見られます。これを実現するために、クエリレスポンスにはカラムタイプ情報が提供されます。これをGoのリフレクションと組み合わせて、正しい型の変数のランタイムインスタンスを作成し、Scanに渡すことができます。

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

[外部テーブル](/engines/table-engines/special/external-data/)は、クライアントがSELECTクエリを使用してClickHouseにデータを送信できるようにします。このデータは一時テーブルに置かれ、クエリ自体で評価に使用できます。

クエリを使用してクライアントに外部データを送信するには、ユーザーはコンテキストを介してこれを渡す前に`ext.NewTable`を使用して外部テーブルを構築する必要があります。

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
### OpenTelemetry {#open-telemetry}

ClickHouseは、ネイティブプロトコルの一部として[トレースコンテキスト](/operations/opentelemetry/)を渡すことを許可します。クライアントは、`clickhouse.withSpan`関数を介してSpanを作成し、これをContextを介して渡すことができます。

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

トレースを活用するための詳細は、[OpenTelemetryサポート](https://operations/opentelemetry/)に記載されています。
## データベース/SQL API {#databasesql-api}

`database/sql`または「標準」APIは、アプリケーションコードが基盤となるデータベースに無関心であるべきシナリオでクライアントを使用できるようにします。これはいくつかのコストを伴います - 追加の抽象化層、間接的であり、ClickHouseと必ずしも一致しないプリミティブが含まれます。しかし、これらのコストは、ツールが複数のデータベースに接続する必要があるシナリオでは通常受け入れられます。

さらに、このクライアントはHTTPを輸送層として使用することもサポートしており、データは最適なパフォーマンスのためにネイティブフォーマットでエンコードされます。

以下は、ClickHouse APIのドキュメントの構造を反映することを目指しています。

標準APIの完全なコード例は、[ここ](https://github.com/ClickHouse/clickhouse-go/tree/main/examples/std)で見つけることができます。
### 接続 {#connecting-1}

接続は、形式`clickhouse://<host>:<port>?<query_option>=<value>`のDSN文字列または`clickhouse.OpenDB`メソッドを介して達成できます。後者は`database/sql`の仕様の一部ではありませんが、`sql.DB`インスタンスを返します。このメソッドは、`database/sql`の仕様を通じて明示的に公開する手段がないプロファイリングなどの機能を提供します。

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

**以降のすべての例では、明示的に表示されない限り、ClickHouse `conn`変数が作成されているものと仮定します。**
#### 接続設定 {#connection-settings-1}

次のパラメータをDSN文字列に渡すことができます：

* `hosts` - ロードバランシングとフェイルオーバーのための単一のアドレスホストのカンマ区切りリスト - [複数ノードへの接続](#connecting-to-multiple-nodes)を参照してください。
* `username/password` - 認証情報 - [認証](#authentication)を参照してください。
* `database` - 現在のデフォルトデータベースを選択します。
* `dial_timeout` - 期間文字列は、符号付きの10進数の数列であり、オプションの分数と単位接尾辞を持ちます（例：`300ms`、`1s`）。有効な時間単位は`ms`、`s`、`m`です。
* `connection_open_strategy` - `random/in_order`（デフォルトは`random`） - [複数ノードへの接続](#connecting-to-multiple-nodes)を参照してください。
    - `round_robin` - セットからラウンドロビンサーバーを選択します。
    - `in_order` - 指定された順序で最初のライブサーバーが選択されます。
* `debug` - デバッグ出力を有効にします（ブール値）。
* `compress` - 圧縮アルゴリズムを指定します - `none`（デフォルト）、`zstd`、`lz4`、`gzip`、`deflate`、`br`。`true`に設定すると、`lz4`が使用されます。ネイティブ通信では`lz4`と`zstd`のみがサポートされています。
* `compress_level` - 圧縮レベル（デフォルトは`0`）。圧縮を参照してください。これはアルゴリズムによって特異です：
    - `gzip` - `-2`（最良の速度）から`9`（最良の圧縮）
    - `deflate` - `-2`（最良の速度）から`9`（最良の圧縮）
    - `br` - `0`（最良の速度）から`11`（最良の圧縮）
    - `zstd`、`lz4` - 無視されます。
* `secure` - 安全なSSL接続を確立します（デフォルトは`false`）。
* `skip_verify` - 証明書検証をスキップします（デフォルトは`false`）。
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

ユーザーは、[複数ノードへの接続](#connecting-to-multiple-nodes)で説明したように、提供されたノードアドレスのリストの使用に影響を与えることができます。ただし、接続管理とプーリングは設計上`sql.DB`に委任されます。
#### HTTP経由での接続 {#connecting-over-http}

デフォルトでは、接続はネイティブプロトコルを介して確立されます。HTTPが必要なユーザーは、DSNを修正してHTTPプロトコルを含めるか、接続オプションでプロトコルを指定することでこれを有効にできます。

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

`OpenDB`を使用する場合、ClickHouse APIに使用されるのと同じオプションアプローチを使用して、同じオプションセットを使用して複数のホストに接続します - `ConnOpenStrategy`を指定することもできます。

DSNベースの接続では、文字列は複数のホストと`connection_open_strategy`パラメータを受け入れ、`round_robin`または`in_order`の値を設定できます。

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
### TLSを使用する {#using-tls-1}

DSN接続文字列を使用している場合、SSLは"secure=true"パラメータを介して有効にできます。`OpenDB`メソッドは、非nil TLS構造体の指定に依存しており、TLS用の[ネイティブAPI](#using-tls)と同じアプローチを利用します。DSN接続文字列はSSL検証をスキップするためのパラメータskip_verifyをサポートしていますが、より高度なTLS構成のためには`OpenDB`メソッドが必要です - これは構成を渡すことを許可します。

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

`OpenDB`を使用している場合、認証情報は通常のオプションを介して渡すことができます。DSNベースの接続の場合、ユーザー名とパスワードは接続文字列にパラメータとして渡すことができ、またはアドレスにエンコードされた認証情報として渡すことができます。

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

接続が取得された後、ユーザーはExecメソッドを介して`sql`文を実行できます。

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


このメソッドはコンテキストを受け取ることをサポートしていません - デフォルトでは、バックグラウンドコンテキストで実行されます。ユーザーは`ExecContext`を使用する必要があります - [コンテキストの使用](#using-context)を参照してください。
### バッチ挿入 {#batch-insert-1}

バッチセマンティクスは、`Being`メソッドを使用して`sql.Tx`を作成することによって実現できます。これを使用して`INSERT`文で`Prepare`メソッドを使用してバッチを取得できます。これにより、行を`Exec`メソッドを介して追加できる`sql.Stmt`が返されます。バッチは、元の`sql.Tx`で`Commit`が実行されるまでメモリに累積されます。

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

単一行のクエリは、`QueryRow`メソッドを使用して達成できます。これは`*sql.Row`を返し、Scanを呼び出して列をマージするための変数へのポインタを指定できます。`QueryRowContext`のバリアントは、バックグラウンド以外のコンテキストを渡すことを可能にします - [コンテキストの使用](#using-context)を参照してください。

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

複数行を反復処理するには、`Query`メソッドが必要です。これは、行を反復処理するためにNextを呼び出す`*sql.Rows`構造体を返します。`QueryContext`に相当するものを使用して、コンテキストを渡すことができます。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/query_rows.go)
### 非同期挿入 {#async-insert-1}

非同期挿入は、`ExecContext`メソッドを介して挿入を実行することによって達成できます。これは、以下のように非同期モードを有効にしたコンテキストを渡す必要があります。これにより、クライアントが挿入の完了を待機するか、データが受信され次第応答するかを指定できます。これは、[wait_for_async_insert](/operations/settings/settings#wait_for_async_insert)パラメータを効果的に制御します。

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

標準インターフェースではサポートされていません。
### 構造体の使用 {#using-structs-1}

標準インターフェースではサポートされていません。
### 型変換 {#type-conversions-1}

標準の`database/sql`インターフェースは、[ClickHouse API](#type-conversions)と同じ型をサポートするべきです。主に複雑な型に関しては、いくつかの例外があります。クライアントは、挿入とレスポンスのマージに関してできるだけ柔軟であることを目指しています。詳細は[型変換](#type-conversions)を参照してください。
### 複雑な型 {#complex-types-1}

特に記載がない限り、複雑な型の取り扱いは[ClickHouse API](#complex-types)と同じであるべきです。違いは`database/sql`の内部によるものです。
#### マップ {#maps}

ClickHouse APIとは異なり、標準APIではスキャンタイプでマップを強く型指定する必要があります。例えば、ユーザーは`Map(String,String)`フィールドに対して`map[string]interface{}`を渡すことができず、代わりに`map[string]string`を使用する必要があります。`interface{}`変数は常に互換性があり、より複雑な構造に使用できます。構造体は読み取り時にサポートされていません。

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

挿入の動作はClickHouse APIと同じです。
### 圧縮 {#compression-1}

標準APIは、ネイティブの[ClickHouse API](#compression)と同じ圧縮アルゴリズム（すなわち、`lz4`および`zstd`）をサポートします。また、HTTP接続のためにgzip、deflate、br圧縮もサポートされています。これらのいずれかが有効にされると、挿入時とクエリレスポンス時にブロックで圧縮が行われます。他のリクエスト（例：ピングやクエリリクエスト）は圧縮されずに残ります。これは、`lz4`および`zstd`オプションと一貫しています。

接続を確立するために`OpenDB`メソッドを使用する場合、Compression構成を渡すことができます。これには、圧縮レベルを指定する機能が含まれています（以下を参照）。DSN経由で`sql.Open`を使用する場合、`compress`パラメータを利用します。これは、特定の圧縮アルゴリズム（すなわち、`gzip`、`deflate`、`br`、`zstd`または`lz4`）またはブールフラグであることができます。`true`に設定すると、`lz4`が使用されます。デフォルトは`none`（圧縮無効）です。

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

適用される圧縮レベルは、DSNパラメータcompress_levelまたはCompressionオプションのLevelフィールドによって制御できます。これはデフォルトで0ですが、アルゴリズムに特異です：

* `gzip` - `-2`（最良の速度）から`9`（最良の圧縮）
* `deflate` - `-2`（最良の速度）から`9`（最良の圧縮）
* `br` - `0`（最良の速度）から`11`（最良の圧縮）
* `zstd`、`lz4` - 無視されます。
### パラメータバインディング {#parameter-binding-1}

標準APIは、[ClickHouse API](#parameter-binding)と同じパラメータバインディング機能をサポートし、`Exec`、`Query`、`QueryRow`メソッド（およびその相当の[Context](#using-context)バリアント）にパラメータを渡すことができます。位置指定、名前付き、番号付きのパラメータがサポートされています。

```go
var count uint64
// 位置指定バインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 >= ? AND Col3 < ?", 500, now.Add(time.Duration(750)*time.Second)).Scan(&count); err != nil {
    return err
}
// 250
fmt.Printf("位置指定バインドのカウント: %d\n", count)
// 数字バインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= $2 AND Col3 > $1", now.Add(time.Duration(150)*time.Second), 250).Scan(&count); err != nil {
    return err
}
// 100
fmt.Printf("数字バインドのカウント: %d\n", count)
// 名前付きバインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= @col1 AND Col3 > @col3", clickhouse.Named("col1", 100), clickhouse.Named("col3", now.Add(time.Duration(50)*time.Second))).Scan(&count); err != nil {
    return err
}
// 50
fmt.Printf("名前付きバインドのカウント: %d\n", count)
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/bind.go)

特別なケースに関しては、依然として適用されます。
### コンテキストの使用 {#using-context-1}

標準APIは、[ClickHouse API](#using-context)と同様に、コンテキストを介して期限、キャンセルシグナル、その他のリクエストスコープの値を渡す機能をサポートしています。ClickHouse APIとは異なり、これはメソッドの`Context`バリアントを使用して達成されます。すなわち、デフォルトでバックグラウンドコンテキストを使用するメソッド（例：`Exec`）には、コンテキストを最初のパラメータとして渡すことができるバリアント`ExecContext`があります。これにより、アプリケーションフローの任意の段階でコンテキストを渡すことができます。たとえば、ユーザーは、`ConnContext`を介して接続を確立する際や、`QueryRowContext`を介してクエリ行をリクエストする際にコンテキストを渡すことができます。以下に使用可能なすべてのメソッドの例を示します。

期限、キャンセルシグナル、クエリID、クォータキー、接続設定を渡すためにコンテキストを使用する詳細については、[ClickHouse APIのコンテキストの使用](#using-context)を参照してください。

```go
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "allow_experimental_object_type": "1",
}))
conn.ExecContext(ctx, "DROP TABLE IF EXISTS example")
// JSONカラムを作成するためにはallow_experimental_object_type=1が必要です
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
    return fmt.Errorf("キャンセルが予期されました")
}

// クエリに期限を設定します - これは絶対時間が達成された後にクエリをキャンセルします。接続だけを終了することを再度、
// クエリはClickHouseで完了するまで継続されます
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.PingContext(ctx); err == nil {
    return fmt.Errorf("期限超過が予期されました")
}

// ログでクエリをトレースするのを助けるためにクエリIDを設定します（例：system.query_logを参照）
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
// クォータキーを設定します - まずはクォータを作成します
if _, err = conn.ExecContext(ctx, "CREATE QUOTA IF NOT EXISTS foobar KEYED BY client_key FOR INTERVAL 1 minute MAX queries = 5 TO default"); err != nil {
    return err
}

// コンテキストを使用してクエリをキャンセルできます
ctx, cancel = context.WithCancel(context.Background())
// キャンセルの前にいくつかの結果を取得します
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
            fmt.Println("キャンセルが予期されました")
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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/context.go)
### セッション {#sessions}

ネイティブ接続は本質的にセッションを持っていますが、HTTP経由の接続では、ユーザーが設定としてコンテキストを渡すためのセッションIDを作成する必要があります。これにより、セッションにバインドされた一時テーブルなどの機能を使用できるようになります。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/session.go)
### 動的スキャン {#dynamic-scanning-1}

[ClickHouse API](#dynamic-scanning) と同様に、カラムタイプ情報が利用可能で、ユーザーは正しい型の変数のランタイムインスタンスを作成し、Scan に渡すことができます。これにより、型が不明なカラムを読み取ることが可能になります。

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

[外部テーブル](/engines/table-engines/special/external-data/) は、クライアントが `SELECT` クエリを用いて ClickHouse にデータを送信することを可能にします。このデータは一時テーブルに格納され、クエリ自体の評価に使用できます。

クエリを使用して外部データをクライアントに送信するには、ユーザーはコンテキストを介して送信する前に `ext.NewTable` を使用して外部テーブルを構築する必要があります。

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
### オープンテレメトリ {#open-telemetry-1}

ClickHouse は、[トレースコンテキスト](/operations/opentelemetry/) をネイティブプロトコルの一部として渡すことを許可します。クライアントは `clickhouse.withSpan` 関数を使用して Span を作成し、これをコンテキストを介して渡すことができます。これは HTTP が輸送手段として使用される場合にはサポートされていません。

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

* 可能な限り ClickHouse API を活用してください。特にプリミティブ型の場合、これは重大なリフレクションや間接参照を回避します。
* 大規模データセットを読み取る場合は、[`BlockBufferSize`](#connection-settings) を変更することを検討してください。これによりメモリ使用量は増加しますが、行の反復処理中により多くのブロックを並行してデコードできます。デフォルト値の 2 は保守的で、メモリオーバーヘッドを最小化します。より大きな値はメモリ内のブロックを増やします。これは、異なるクエリが異なるブロックサイズを生成できるため、テストが必要です。そのため、これはコンテキストを介して[クエリレベル](#using-context)で設定することができます。
* データを挿入する際には、型を明確にしてください。クライアントはUUIDやIPのために文字列の解析を許可するなど柔軟であることを目指していますが、これにはデータ検証が必要で、挿入時にコストがかかります。
* 可能な場合は列指向の挿入を使用してください。これも強く型付けされるべきで、クライアントが値を変換する必要を回避します。
* 最適な挿入パフォーマンスのために ClickHouse の[推奨事項](/sql-reference/statements/insert-into/#performance-considerations)に従ってください。
