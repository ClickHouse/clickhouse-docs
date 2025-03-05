---
sidebar_label:  Go
sidebar_position: 1
keywords: [clickhouse, go, client, golang]
slug: /integrations/go
description: Goクライアントを使用すると、ユーザーはGo標準のdatabase/sqlインターフェースまたは最適化されたネイティブインターフェースを使用してClickHouseに接続できます。
---

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';

# ClickHouse Go
## シンプルな例 {#a-simple-example}
シンプルな例でGoを開始しましょう。これはClickHouseに接続し、systemデータベースから選択します。始めるには、接続詳細が必要です。
### 接続詳細 {#connection-details}
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
### go mod tidy の実行 {#run-go-mod-tidy}

```bash
go mod tidy
```
### 接続詳細の設定 {#set-your-connection-details}
先ほど接続詳細を確認しました。それらを `main.go` の `connect()` 関数に設定します：

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
このカテゴリの残りのドキュメントでは、ClickHouse Goクライアントの詳細が説明されています。
## ClickHouse Go クライアント {#clickhouse-go-client}

ClickHouseは2つの公式Goクライアントをサポートしています。これらのクライアントは補完的であり、意図的に異なるユースケースをサポートしています。

* [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) - Go標準のdatabase/sqlインターフェースまたはネイティブインターフェースのいずれかをサポートする高レベル言語クライアント。
* [ch-go](https://github.com/ClickHouse/ch-go) - 低レベルクライアント。ネイティブインターフェースのみ。

clickhouse-goはユーザーが行指向のセマンティクスを使用してデータをクエリおよび挿入できる高レベルのインターフェースを提供し、データ型に対して寛容なバッチ処理を可能にします - 精度損失が発生しない限り、値は変換されます。一方、ch-goは、タイプの厳密さとより複雑な使用のリスクを伴う、低CPUおよびメモリオーバーヘッドでの高速データブロックストリーミングを提供する最適化された列指向インターフェースを提供します。

バージョン2.3から、Clickhouse-goはch-goを使用してエンコーディング、デコーディング、および圧縮などの低レベルの機能を実行します。clickhouse-goもGoの `database/sql` インターフェース標準をサポートしていることに注意してください。両方のクライアントはエンコードのためにネイティブフォーマットを使用して最適なパフォーマンスを提供し、ネイティブClickHouseプロトコルを介して通信できます。clickhouse-goは、ユーザーが必要な場合にトラフィックをプロキシまたはロードバランスするための輸送メカニズムとしてHTTPもサポートしています。

クライアントライブラリを選択する際、ユーザーはそれぞれの利点と欠点について認識する必要があります - [クライアントライブラリの選択](#choosing-a-client-library)を参照してください。

|               | ネイティブフォーマット | ネイティブプロトコル | HTTPプロトコル | 行指向API | 列指向API | 型の柔軟性 | 圧縮 | クエリプレースホルダ |
|:-------------:|:-------------:|:---------------:|:-------------:|:------------------:|:---------------------:|:----------------:|:-----------:|:------------------:|
| clickhouse-go |       ✅       |        ✅        |       ✅       |          ✅         |           ✅           |         ✅        |      ✅      |          ✅         |
|     ch-go     |       ✅       |        ✅        |               |                    |           ✅           |                  |      ✅      |                    |
## クライアントの選択 {#choosing-a-client}

クライアントライブラリの選択は、使用パターンと最適なパフォーマンスの必要性に依存します。毎秒数百万の挿入が必要な挿入重視のユースケースでは、低レベルクライアントの[ch-go](https://github.com/ClickHouse/ch-go)の使用を推奨します。このクライアントは、ClickHouseのネイティブフォーマットに必要な、行指向フォーマットから列へのデータの変換に伴うオーバーヘッドを回避します。さらに、使用を簡素化するために、リフレクションや`interface{}`（`any`）タイプの使用を回避しています。

集約やスループットが低い挿入作業に焦点を当てたクエリワークロードでは、[clickhouse-go](https://github.com/ClickHouse/clickhouse-go)が親しみやすい`database/sql`インターフェースとより簡潔な行セマンティクスを提供します。ユーザーは、輸送プロトコルとしてHTTPをオプションで使用し、行を構造体にマシャルするためのヘルパー関数を利用することもできます。
## clickhouse-go クライアント {#the-clickhouse-go-client}

clickhouse-goクライアントは、ClickHouseと通信するための2つのAPIインターフェースを提供します：

* ClickHouseクライアント専用API
* `database/sql` 標準 - Golangが提供するSQLデータベースに対する一般的なインターフェース。

`database/sql`はデータベース非依存なインターフェースを提供し、開発者がデータストアを抽象化できるようにしますが、パフォーマンスに影響を与えるいくつかの型とクエリのセマンティクスを強制します。このため、[パフォーマンスが重要な場合](https://github.com/clickHouse/clickHouse-go#benchmark)にはクライアント専用APIを使用することを推奨します。ただし、複数のデータベースをサポートするツールにClickHouseを統合したいユーザーは、標準インターフェースを好むかもしれません。

両方のインターフェースは、[ネイティブフォーマット](/native-protocol/basics.md)を使用して通信のためにデータをエンコードします。さらに、標準インターフェースはHTTP経由の通信をサポートしています。

|                    | ネイティブフォーマット | ネイティブプロトコル | HTTPプロトコル | バルク書き込みサポート | 構造体マシャリング | 圧縮 | クエリプレースホルダ |
|:------------------:|:-------------:|:---------------:|:-------------:|:------------------:|:-----------------:|:-----------:|:------------------:|
|   ClickHouse API   |       ✅       |        ✅        |               |          ✅         |         ✅         |      ✅      |          ✅         |
| `database/sql` API |       ✅       |        ✅        |       ✅       |          ✅         |                   |      ✅      |          ✅         |
## インストール {#installation}

ドライバーのv1は非推奨であり、機能の更新や新しいClickHouse型のサポートは行われません。ユーザーは、より優れたパフォーマンスを提供するv2に移行する必要があります。

クライアントの2.xバージョンをインストールするには、次のようにgo.modファイルにパッケージを追加します：

`require github.com/ClickHouse/clickhouse-go/v2 main`

または、リポジトリをクローンします：

```bash
git clone --branch v2 https://github.com/clickhouse/clickhouse-go.git $GOPATH/src/github
```

他のバージョンをインストールするには、パスまたはブランチ名を適宜変更します。

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

クライアントはClickHouseから独立してリリースされています。2.xは現在開発中のメジャーバージョンを表しています。すべての2.xバージョンは互換性があります。
#### ClickHouseとの互換性 {#clickhouse-compatibility}

クライアントは以下のバージョンをサポートしています：

- 現在サポートされているClickHouseバージョンすべて（[こちら](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md)に記録されています）。ClickHouseのバージョンがもはやサポートされていない場合、それらはクライアントリリースに対してもアクティブにテストされなくなります。
- クライアントのリリース日から2年間のすべてのClickHouseバージョン。LTSバージョンのみがアクティブにテストされていることに注意してください。
#### Golangとの互換性 {#golang-compatibility}

| クライアントバージョン | Golangバージョン |
|:--------------:|:---------------:|
|  => 2.0 &lt;= 2.2 |    1.17, 1.18   |
|     >= 2.3     |       1.18      |
## ClickHouse クライアント API {#clickhouse-client-api}

ClickHouseクライアントAPIのすべてのコード例は[こちら](https://github.com/ClickHouse/clickhouse-go/tree/main/examples)で見つけることができます。
### 接続 {#connecting}

次の例は、サーバーバージョンを返すもので、ClickHouseに接続することを示しています - ClickHouseが保護されておらず、デフォルトユーザーでアクセス可能であると仮定します。

接続するには、デフォルトのネイティブポートを使用します。

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

[フルエクスAMPLE](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/connect.go)

**以降のすべての例では、明示的に示されていない限り、ClickHouseの `conn` 変数が作成され利用可能であると仮定します。**
#### 接続設定 {#connection-settings}

接続を開くとき、Options構造体を使用してクライアントの動作を制御できます。以下の設定が可能です：

* `Protocol` - ネイティブまたはHTTP。現在HTTPは[database/sql API](#databasesql-api)のみサポートされています。
* `TLS` - TLSオプション。nilでない値はTLSを有効にします。[TLSを使用する](#using-tls)を参照してください。
* `Addr` - ポートを含むアドレスのスライス。
* `Auth` - 認証詳細。[認証](#authentication)を参照してください。
* `DialContext` - 接続を確立する方法を決定するカスタムダイアル関数。
* `Debug` - デバッグを有効にするためのtrue/false。
* `Debugf` - デバッグ出力を消費するための関数を提供します。`debug`がtrueに設定されている必要があります。
* `Settings` - ClickHouse設定のマップ。これらはすべてのClickHouseクエリに適用されます。[コンテキストの使用](#using-context)により、クエリごとに設定を設定できます。
* `Compression` - ブロックの圧縮を有効にします。[圧縮](#compression)を参照してください。
* `DialTimeout` - 接続を確立する最大時間。デフォルトは`1s`です。
* `MaxOpenConns` - 一度に使用できる最大接続数。アイドルプールにはもっと少ない接続があるかもしれませんが、いつでもこの数だけを使用できます。デフォルトは`MaxIdleConns+5`です。
* `MaxIdleConns` - プールで維持する接続の数。可能な場合は接続が再利用されます。デフォルトは`5`です。
* `ConnMaxLifetime` - 接続を使用可能な状態に保つ最大寿命。デフォルトは1時間です。この時間経過後に接続は破棄され、新しい接続が必要に応じてプールに追加されます。
* `ConnOpenStrategy` - ノードアドレスのリストを消費して接続を開く方法を決定します。[複数ノードへの接続](#connecting-to-multiple-nodes)を参照してください。
* `BlockBufferSize` - 一度にバッファにデコードする最大ブロック数。大きな値はメモリの代償で平行化を高めます。ブロックサイズはクエリに依存するため、この設定は接続ごとに設定できますが、返すデータに基づいてオーバーライドすることを推奨します。デフォルトは`2`です。

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
[フルエクスAMPLE](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/connect_settings.go)
#### 接続プーリング {#connection-pooling}

クライアントは接続プールを維持し、必要に応じてこれをクエリ間で再利用します。最大で、`MaxOpenConns`が常に使用され、プールの最大サイズは`MaxIdleConns`によって制御されます。クライアントは各クエリの実行のためにプールから接続を取得し、再利用のためにプールに戻します。接続はバッチの寿命に使用され、`Send()`時に解放されます。

プール内の同じ接続が以降のクエリで使用されることは保証されませんが、ユーザーが`MaxOpenConns=1`を設定した場合は例外です。これはめったに必要ありませんが、ユーザーが一時テーブルを使用する場合には必要となることがあります。

また、`ConnMaxLifetime`はデフォルトで1時間です。これにより、ノードがクラスタを離れるとClickHouseに対する負荷が不均衡になる可能性があります。これは、ノードが利用できなくなると、接続が他のノードにバランスされる場合に発生します。これらの接続は持続し、デフォルトでは1時間はリフレッシュされません。問題のあるノードがクラスタに戻ってもそうです。この時間を短縮することを重い作業のケースでは考慮してください。
### TLSの使用 {#using-tls}

低レベルで、すべてのクライアント接続メソッド（`DSN/OpenDB/Open`）は、[Goのtlsパッケージ](https://pkg.go.dev/crypto/tls)を使用して安全な接続を確立します。クライアントは、Options構造体にnilでない `tls.Config` ポインタが含まれている場合にTLSを使用することを知っています。

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

[フルエクスAMPLE](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/ssl.go)

この最小限の`TLS.Config`は、通常ClickHouseサーバーの安全なネイティブポート（通常は9440）に接続するのに十分です。ClickHouseサーバーに有効な証明書（期限切れ、誤ったホスト名、公開の認識されたルート証明機関によって署名されていない）がない場合、`InsecureSkipVerify`をtrueにすることができますが、これは強く推奨されません。

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
[フルエクスAMPLE](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/ssl_no_verify.go)

追加のTLSパラメータが必要な場合、アプリケーションコードは`tls.Config`構造体内の望ましいフィールドを設定する必要があります。これには、特定の暗号スイートの強制、特定のTLSバージョン（1.2や1.3など）の強制、内部CA証明書チェーンの追加、ClickHouseサーバーによって要求される場合のクライアント証明書（および秘密鍵）の追加、およびより専門的なセキュリティ設定に付随する他のオプションが含まれます。
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
if err != nil {
    return err
}
v, err := conn.ServerVersion()
```
[フルエクスAMPLE](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/auth.go)
### 複数ノードへの接続 {#connecting-to-multiple-nodes}

複数のアドレスを`Addr`構造体を介して指定できます。

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

[フルエクスAMPLE](https://github.com/ClickHouse/clickhouse-go/blob/1c0d81d0b1388dbb9e09209e535667df212f4ae4/examples/clickhouse_api/multi_host.go#L26-L45)


2つの接続戦略が利用可能です：

* `ConnOpenInOrder`（デフォルト） - アドレスは順番に消費され、リストの早いほうのアドレスを使って接続できない場合にのみ、遅いアドレスが利用されます。これは事実上のフェイルオーバー戦略です。
* `ConnOpenRoundRobin` - ラウンドロビン戦略を使用してアドレス間の負荷がバランスされます。

これは、オプション `ConnOpenStrategy` を介して制御できます。

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

[フルエクスAMPLE](https://github.com/ClickHouse/clickhouse-go/blob/1c0d81d0b1388dbb9e09209e535667df212f4ae4/examples/clickhouse_api/multi_host.go#L50-L67)
### 実行 {#execution}

任意の文を`Exec`メソッドを介して実行できます。これはDDLや簡単な文に便利です。大規模な挿入やクエリイテレーションには使用すべきではありません。

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

[フルエクスAMPLE](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/exec.go)


コンテキストをクエリに渡すことができる機能に注意してください。これは、特定のクエリレベル設定を渡すために使用できます - [コンテキストの使用](#using-context)を参照してください。
### バッチ挿入 {#batch-insert}

大量の行を挿入するために、クライアントはバッチセマンティクスを提供します。これは、行を追加できるバッチを準備する必要があります。最終的には`Send()`メソッドを介して送信されます。バッチは、Sendが実行されるまでメモリに保持されます。

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

[フルエクスAMPLE](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/batch.go)

ClickHouseに対する推奨事項は、[こちら](/guides/inserting-data#best-practices-for-inserts)にも適用されます。バッチはgoルーチン間で共有すべきではなく、各ルーチンごとに別のバッチを構築すべきです。

上記の例から、行を追加する際の変数タイプとカラムタイプを合わせる必要があることに注意してください。マッピングは通常は明白ですが、このインターフェースは柔軟性を持つように努めており、精度損失が生じない限り、型は変換されます。たとえば、以下はdatetime64に文字列を挿入することを示しています。

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

[フルエクスAMPLE](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/type_convert.go)


サポートされているgo型の完全な概要は、[型変換](#type-conversions)を参照してください。
### 行のクエリ {#querying-rows}

ユーザーは`QueryRow`メソッドを使用して単一行をクエリするか、`Query`を介して結果セットを反復するためのカーソルを取得できます。前者はデータを格納するための宛先を受け入れ、後者は各行で`Scan`を呼び出す必要があります。

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

[フルエクスAMPLE](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/query_row.go)

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

[フルエクスAMPLE](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/query_rows.go)

両方のケースで、直列化したい変数にポインタを渡す必要があることに注意してください。これらは、`SELECT`文で指定された順序で渡す必要があります - デフォルトでは、`SELECT *`の場合、カラムの宣言の順序が使用されます。

挿入と同様に、Scanメソッドには、対象変数が適切な型である必要があります。これも柔軟性を持ち、この場合型は変換されることを目指しており、精度損失が起こり得ない限り、例えば上記の例ではUUIDカラムが文字列変数に読み込まれることが示されています。サポートされているgo型の完全なリストは、[型変換](#type-conversions)を参照してください。

最後に、`Query`および`QueryRow`メソッドに`Context`を渡すことができる機能に注意してください。これは、クエリレベルの設定に使うことができます - [コンテキストの使用](#using-context)を参照してください。
### 非同期挿入 {#async-insert}

非同期挿入はAsyncメソッドを介してサポートされています。これにより、クライアントがサーバーが挿入を 완료するのを待つべきか、データが受信された時点で応答するべきかを指定できます。これは効果적으로、[wait_for_async_insert](/operations/settings/settings/#wait-for-async-insert)パラメータを制御します。

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

[フルエクスAMPLE](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/async.go)
### 列指向挿入 {#columnar-insert}

挿入は列形式で行うことも可能です。これは、データがすでにこの構造で整列されている場合、行にピボットする必要を回避することでパフォーマンスの利点を提供することがあります。

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

[フルエクスAMPLE](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/columnar_insert.go)
### 構造体の使用 {#using-structs}

ユーザーにとって、Golangの構造体はClickHouseのデータ行の論理的な表現を提供します。これを支援するために、ネイティブインターフェースはいくつかの便利な関数を提供しています。
#### シリアライズするセレクト {#select-with-serialize}

Selectメソッドを使用すると、応答行のセットを一度の呼び出しで構造体のスライスにマシャルできます。

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


[フルエクスAMPLE](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/select_struct.go)
#### 構造体のスキャン {#scan-struct}

`ScanStruct`を使用すると、クエリからの単一行を構造体にマシャルできます。

```go
var result struct {
    Col1  int64
    Count uint64 `ch:"count"`
}
if err := conn.QueryRow(context.Background(), "SELECT Col1, COUNT() AS count FROM example WHERE Col1 = 5 GROUP BY Col1").ScanStruct(&result); err != nil {
    return err
}
```

[フルエクスAMPLE](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/scan_struct.go)
#### Append Struct {#append-struct}

`AppendStruct` は、構造体を既存の [batch](#batch-insert) に追加し、完全な行として解釈することを可能にします。これには、構造体のカラムがテーブルと名前および型で整合する必要があります。すべてのカラムには対応する構造体フィールドが必要ですが、一部の構造体フィールドには対応するカラム表現がない場合があります。これらは単に無視されます。

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

### タイプ変換 {#type-conversions}

クライアントは、挿入およびレスポンスのシリアル化において、変数型を受け入れる柔軟性を最大限に高めることを目指しています。ほとんどの場合、ClickHouseのカラム型に対して同等のGolang型が存在します。例えば、[UInt64](/sql-reference/data-types/int-uint/) は [uint64](https://pkg.go.dev/builtin#uint64) にマッピングされます。こうした論理的なマッピングは常にサポートされるべきです。ユーザーは、変換が行われる前に、カラムに挿入できる変数型や、レスポンスを受け取るために使用できる型を利用したいと考えるかもしれません。クライアントは、ユーザーが挿入前にデータを厳密に整列させる必要がないように、これらの変換を透明にサポートすることを目指しています。また、クエリ時に柔軟にシリアル化を提供します。この透明な変換は、精度の損失を許可しません。たとえば、uint32はUInt64カラムからデータを受け取るために使用できません。逆に、文字列は日付時刻フィールドに挿入することができますが、その形式要件を満たす必要があります。

現在サポートされているプリミティブ型のタイプ変換は、[こちら](https://github.com/ClickHouse/clickhouse-go/blob/main/TYPES.md) にまとめられています。

この取り組みは継続中であり、挿入（`Append` / `AppendRow`）と読み取り時（`Scan`を介して）に分けることができます。特定の変換のサポートが必要な場合は、イシューを作成してください。

### 複雑な型 {#complex-types}

#### 日付/日付時刻型 {#datedatetime-types}

ClickHouseのGoクライアントは、`Date`、`Date32`、`DateTime`、および `DateTime64`の日付/日時型をサポートしています。日付は `2006-01-02` 形式の文字列として挿入するか、ネイティブのGo型 `time.Time{}` または `sql.NullTime` を使用して挿入できます。日時は後者の型もサポートしていますが、文字列は `2006-01-02 15:04:05` 形式で渡す必要があり、任意のタイムゾーンオフセット（例：`2006-01-02 15:04:05 +08:00`）もサポートされます。`time.Time{}` および `sql.NullTime` は読み取り時にもサポートされており、`sql.Scanner` インターフェイスの実装はすべてサポートされます。

タイムゾーン情報の処理は、ClickHouse型と値が挿入されるか読み取られるかによって異なります。

* **DateTime/DateTime64**
    * **挿入**時に、値はUNIXタイムスタンプ形式でClickHouseに送信されます。時間帯が提供されない場合、クライアントはクライアントのローカル時間帯を想定します。`time.Time{}` または `sql.NullTime` は epoch に応じて変換されます。
    * **選択**時に、カラムのタイムゾーンが設定されている場合はそれが使用され、そうでなければサーバーのタイムゾーンが使用されます。

* **Date/Date32**
    * **挿入**時に、日付をUNIXタイムスタンプに変換する際に日付のタイムゾーンが考慮されます。すなわち、日付として保存する前にタイムゾーンによってオフセットされます。Date型はClickHouseにロケールがないため、文字列値で指定されていない場合はローカルタイムゾーンが使用されます。
    * **選択**時に、日付は `time.Time{}` または `sql.NullTime{}` インスタンスにスキャンされ、タイムゾーン情報なしで返されます。

#### 配列 {#array}

配列はスライスとして挿入する必要があります。要素の型ルールは[プリミティブ型](#type-conversions)と一致しており、可能であれば要素は変換されます。

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
    fmt.Printf("row: col1=%v, col2=%v\n", col1, col2)
}
rows.Close()
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/array.go)

#### マップ {#map}

マップは、以前に定義された型ルールに準拠したGolangマップとして挿入される必要があります。

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

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/map.go)

#### タプル {#tuples}

タプルは任意の長さのカラムのグループを表します。カラムは明示的に名前を付けることも、中身の型だけを指定することもできます。例えば、

```sql
//名前なし
Col1 Tuple(String, Int64)

//名前あり
Col2 Tuple(name String, id Int64, age uint8)
```

名前ありのタプルは、より柔軟性があります。名前なしのタプルはスライスを使用して挿入および読み取る必要がありますが、名前ありのタプルはマップとも互換性があります。

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
// 名前ありのタプルと名前なしのタプルはスライスを使用して追加できます。同じ型の要素がすべてである場合、強い型のリストとマップを使用可能です
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
// 名前ありのタプルはマップまたはスライスに取得できますが、名前なしのものはスライスのみです
if err = conn.QueryRow(ctx, "SELECT * FROM example").Scan(&col1, &col2, &col3); err != nil {
    return err
}
fmt.Printf("row: col1=%v, col2=%v, col3=%v\n", col1, col2, col3)
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/tuple.go)

注：名前付きタプルのサブカラムはすべて同じ型である必要があります。

#### ネスト {#nested}

ネストされたフィールドは、名前付きタプルの配列に相当します。使用方法は、ユーザーが [flatten_nested](/operations/settings/settings/#flatten-nested) を1または0に設定したかどうかによって決まります。

flatten_nestedを0に設定すると、ネストされたカラムは単一のタプルの配列として保持されます。これにより、ユーザーは挿入および取得にマップのスライスを使用でき、任意のレベルのネストを許可されます。マップのキーはカラムの名前と等しくなければなりません。

注：マップはタプルを表すため、`map[string]interface{}` 型でなければなりません。値は現在、弱い型です。

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

[完全な例 - `flatten_tested=0`](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/nested.go#L28-L118)

デフォルト値として1を使用すると、ネストされたカラムは別々の配列にフラット化されます。これにより、挿入および取得にネストされたスライスを使用する必要があります。任意のレベルのネストが機能する可能性がありますが、これは公式にはサポートされていません。

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

注：ネストされたカラムは同じ次元を持つ必要があります。例えば、上記の例では、`Col_2_2` と `Col_2_1` は同じ数の要素を持つ必要があります。

より簡単なインターフェースとネストの公式サポートのため、`flatten_nested=0`を推奨します。

#### 地理型 {#geo-types}

クライアントは、ポイント、リング、ポリゴン、およびマルチポリゴンの地理型をサポートしています。これらのフィールドは、Golangのパッケージ [github.com/paulmach/orb](https://github.com/paulmach/orb) を使用しています。

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

UUID型は、[github.com/google/uuid](https://github.com/google/uuid) パッケージによってサポートされています。ユーザーはUUIDを文字列または `sql.Scanner` または `Stringify` を実装する任意の型として送信およびシリアル化することもできます。

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

#### 小数 {#decimal}

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

GoのNil値はClickHouseのNULLを表します。これは、フィールドがNullableとして宣言されている場合に使用できます。挿入時、通常およびNullableバージョンのカラムの両方に対してNilを渡すことができます。前者の場合、型のデフォルト値が保存されます。例えば、文字列の場合は空文字列になります。Nullableバージョンの場合、NULL値がClickHouseに保存されます。

スキャン時、ユーザーはnilをサポートする型へのポインタを渡す必要があります。例えば、*string のような型です。これにより、Nullableフィールドのnil値が表されます。以下の例では、col1はNullable(String)であり、したがって、**stringとして受け取ります。これにより、nilを表すことが可能になります。

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

クライアントは、`sql.Null*` 型（例：`sql.NullInt64`）もサポートしています。これらは、それぞれのClickHouse型と互換性があります。

#### 大きな整数 - Int128、Int256、UInt128、UInt256 {#big-ints---int128-int256-uint128-uint256}

64ビットを超える数値型は、ネイティブのGo [big](https://pkg.go.dev/math/big) パッケージを使用して表現されます。

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

圧縮方法のサポートは、使用しているプロトコルに依存します。ネイティブプロトコルでは、クライアントは `LZ4` および `ZSTD` 圧縮をサポートしています。これはブロックレベルでのみ行われます。接続に `Compression` 設定を含めることで、圧縮を有効にできます。

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

HTTPを介した標準インターフェースを使用する場合、追加の圧縮技術が利用可能です。詳細については、[database/sql API - 圧縮](#compression) を参照してください。

### パラメータバインディング {#parameter-binding}

クライアントは、`Exec`、`Query`、および `QueryRow` メソッドに対してパラメータバインディングをサポートしています。以下の例のように、名前付き、番号付き、および位置引数のパラメータを使用してサポートされます。これらの例を以下に示します。

```go
var count uint64
// 位置引数のバインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 >= ? AND Col3 < ?", 500, now.Add(time.Duration(750)*time.Second)).Scan(&count); err != nil {
    return err
}
// 250
fmt.Printf("位置引数のバインド count: %d\n", count)
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

#### 特殊なケース {#special-cases}

デフォルトでは、スライスはクエリのパラメータとして渡されると、カンマ区切りの値のリストに展開されます。ユーザーが、 `[ ]` で囲まれた値のセットを注入する必要がある場合は、`ArraySet` を使用する必要があります。

グループ/タプルが必要な場合、 `IN` 演算子と共に使用するために、丸括弧 `( )` で囲むことができます。これは、複数のグループが必要な場合に特に便利です。以下の例に示します。

最後に、DateTime64フィールドは、パラメータが適切にレンダリングされるように精度が必要です。ただし、クライアントはフィールドの精度レベルを知りませんので、ユーザーが提供する必要があります。これを促進するために、`DateNamed` パラメータを提供します。

```go
var count uint64
// 配列は展開される
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN (?)", []int{100, 200, 300, 400, 500}).Scan(&count); err != nil {
    return err
}
fmt.Printf("配列展開された count: %d\n", count)
// 配列は [] で保持される
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col4 = ?", clickhouse.ArraySet{300, 301}).Scan(&count); err != nil {
    return err
}
fmt.Printf("配列 count: %d\n", count)
// グループセットを使用すると ( ) リストを形成できます
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 IN ?", clickhouse.GroupSet{[]interface{}{100, 200, 300, 400, 500}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("グループ count: %d\n", count)
// ネストが必要な場合に便利
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE (Col1, Col5) IN (?)", []clickhouse.GroupSet{{[]interface{}{100, 101}}, {[]interface{}{200, 201}}}).Scan(&count); err != nil {
    return err
}
fmt.Printf("グループ count: %d\n", count)
// 精度が必要な時には DateNamed を使用
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col3 >= @col3", clickhouse.DateNamed("col3", now.Add(time.Duration(500)*time.Millisecond), clickhouse.NanoSeconds)).Scan(&count); err != nil {
    return err
}
fmt.Printf("名前付きDate count: %d\n", count)
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/clickhouse_api/bind_special.go)

### コンテキストの使用 {#using-context}

Goのコンテキストは、締切、キャンセル信号、およびその他のリクエストスコープの値をAPI境界を超えて渡す手段を提供します。接続のすべてのメソッドは、最初の変数としてコンテキストを受け入れます。以前の例では `context.Background()` を使用しましたが、ユーザーはこの機能を利用して設定や締切を渡し、クエリをキャンセルすることができます。

`withDeadline` で作成されたコンテキストを渡すことで、クエリの実行時間に制限を設けることができます。これは絶対的な時間であり、期限切れは接続を解放し、ClickHouseにキャンセル信号を送信するだけです。代わりに、`WithCancel` を使用してクエリを明示的にキャンセルすることもできます。

`clickhouse.WithQueryID` と `clickhouse.WithQuotaKey` というヘルパーは、クエリIDとクオータキーを指定できるようにします。クエリIDは、ログでクエリを追跡したり、キャンセルする目的で便利です。クオータキーは、ユニークなキー値に基づいてClickHouseの使用制限を課すために使用できます。詳細については、[クオータ管理](/operations/access-rights#quotas-management) を参照してください。

ユーザーは、特定のクエリのためだけに設定を適用するようにコンテキストを使用することもできます—接続全体に対してではなく、[接続設定](#connection-settings)に示されているように。

最後に、ユーザーは `clickhouse.WithBlockSize` を介してブロックバッファのサイズを制御できます。これは接続レベル設定 `BlockBufferSize` をオーバーライドし、メモリ内でデコードされ保持される最大ブロック数を制御します。大きな値は、メモリのコストでより多くの並列性を意味する可能性があります。

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
// コンテキストを使用して特定のAPIコールに設定を渡すことができます
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "allow_experimental_object_type": "1",
}))

conn.Exec(ctx, "DROP TABLE IF EXISTS example")

// JSONカラムを作成するには、allow_experimental_object_type=1が必要です
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

// クエリの締切を設定 - これは絶対的な時間に達するとクエリをキャンセルします。
// クエリはClickHouseで完了するまで続行されます
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.Ping(ctx); err == nil {
    return fmt.Errorf("expected deadline exceeded")
}

// クエリIDを設定して、ログでクエリをトレースします。例：system.query_log
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
// クオータキーを設定する - まずクオータを作成
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
### 進捗/プロファイル/ログ情報 {#progressprofilelog-information}

進捗、プロファイル、およびログ情報はクエリに対して要求することができます。進捗情報は、ClickHouseで読み取られ処理された行数およびバイト数に関する統計を報告します。逆に、プロファイル情報は、クライアントに返されたデータの要約を提供し、合計バイト数（非圧縮）、行数、およびブロック数を含みます。最後に、ログ情報はスレッドに関する統計を提供し、例えばメモリ使用量やデータ速度を含みます。

これらの情報を取得するには、ユーザーは [Context](#using-context) を使用する必要があり、ユーザーはコールバック関数を渡すことができます。

```go
totalRows := uint64(0)
// 進捗とプロファイル情報のコールバックを渡すためにコンテキストを使用
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

ユーザーは、スキーマや返されるフィールドの型が不明なテーブルを読み取る必要がある場合があります。これは、アドホックデータ分析が実行される場合や、一般的なツールが書かれる場合に一般的です。これを実現するために、クエリ応答にはカラムタイプ情報が利用可能です。これは、Goの反射と組み合わせて使用することで、スキャンに渡すことができる正しい型の変数のインスタンスを作成できます。

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

[外部テーブル](/engines/table-engines/special/external-data/)は、クライアントがClickHouseにデータを送信できるようにします。これは、SELECTクエリを使用して行われます。このデータは一時テーブルに置かれ、クエリ自体で評価に使用されることができます。

クエリによって外部データをクライアントに送信するには、ユーザーは`ext.NewTable`を介して外部テーブルを構築する必要があります。その後、これをコンテキストを介して渡すことができます。

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
### Open Telemetry {#open-telemetry}

ClickHouseでは、ネイティブプロトコルの一部として[トレースコンテキスト](/operations/opentelemetry/)を渡すことができます。クライアントは、`clickhouse.withSpan`関数を介してスパンを作成し、これをコンテキストを介して渡すことにより、これを実現します。

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

トレーシングの活用に関する詳細は、[OpenTelemetryサポート](/operations/opentelemetry/)の下にあります。
## データベース/SQL API {#databasesql-api}

`database/sql`または「標準」APIは、ユーザーがアプリケーションコードが基盤となるデータベースから独立して使用できるシナリオでクライアントを使用できるようにします。これは、標準インターフェースに従うことで達成されます。これにはいくらかのコストがかかります - 追加の抽象化と間接的なレイヤー、そしてClickHouseに必ずしも一致しないプリミティブが必要です。しかし、これらのコストは、ツールが複数のデータベースに接続する必要があるシナリオでは、通常は受け入れられます。

さらに、このクライアントはHTTPをトランスポート層として使用することをサポートしています - データは依然として最適なパフォーマンスのためにネイティブフォーマットでエンコードされます。

以下は、ClickHouse APIのドキュメント構造に合わせることを目的としています。

標準APIの完全なコード例は[こちら](https://github.com/ClickHouse/clickhouse-go/tree/main/examples/std)にあります。
### 接続 {#connecting-1}

接続は、形式 `clickhouse://<host>:<port>?<query_option>=<value>` のDSN文字列を使用するか、`clickhouse.OpenDB`メソッドを介して達成できます。後者は、`database/sql`の仕様の一部ではありませんが、`sql.DB`インスタンスを返します。このメソッドは、`database/sql`の仕様を通じて公開するための明白な手段がないプロファイリングなどの機能を提供します。

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

**すべての後続の例では、明示的に示されない限り、ClickHouse `conn`変数の使用が作成され、利用可能であると仮定します。**
#### 接続設定 {#connection-settings-1}

DSN文字列には以下のパラメータを渡すことができます。

* `hosts` - ロードバランシングおよびフェイルオーバーのための単一アドレスホストのカンマ区切りリスト - [複数ノードへの接続](#connecting-to-multiple-nodes)を参照してください。
* `username/password` - 認証資格情報 - [認証](#authentication)を参照してください。
* `database` - 現在のデフォルトのデータベースを選択します。
* `dial_timeout` - 期間文字列は、各オプションの小数点以下の桁数と単位の接尾辞（例：`300ms`、`1s`）で構成される可能性のある符号付きの小数の並びです。有効な時間単位は `ms`、`s`、`m` です。
* `connection_open_strategy` - `random/in_order`（デフォルトは `random`） - [複数ノードへの接続](#connecting-to-multiple-nodes)を参照してください。
    - `round_robin` - セットの中からラウンドロビンサーバーを選択します。
    - `in_order` - 指定された順序で最初に生きているサーバーが選択されます。
* `debug` - デバッグ出力を有効にします（論理値）。
* `compress` - 圧縮アルゴリズムを指定します - `none`（デフォルト）、`zstd`、`lz4`、`gzip`、`deflate`、`br`。`true` に設定されている場合、`lz4` が使用されます。ネイティブ通信には `lz4` と `zstd` のみがサポートされています。
* `compress_level` - 圧縮レベル（デフォルトは `0`）。圧縮に関しては、アルゴリズム固有です：
    - `gzip` - `-2`（最良速度）から `9`（最良圧縮）
    - `deflate` - `-2`（最良速度）から `9`（最良圧縮）
    - `br` - `0`（最良速度）から `11`（最良圧縮）
    - `zstd`、`lz4` - 無視されます
* `secure` - セキュアなSSL接続を確立します（デフォルトは `false`）。
* `skip_verify` - 証明書確認をスキップします（デフォルトは `false`）。
* `block_buffer_size` - ユーザーがブロックバッファサイズを制御できるようにします。[`BlockBufferSize`](#connection-settings)を参照してください。（デフォルトは `2`）。

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

ユーザーは、[複数ノードへの接続](#connecting-to-multiple-nodes)で説明されているように、提供されたノードアドレスのリストの使用に影響を与えることができます。ただし、接続管理およびプーリングは設計上 `sql.DB` に委任されています。
#### HTTP経由での接続 {#connecting-over-http}

デフォルトでは、接続はネイティブプロトコルを介して確立されます。HTTPが必要なユーザーは、DSNを変更してHTTPプロトコルを含むか、接続オプションでプロトコルを指定することによって、これを有効にできます。

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

`OpenDB`を使用している場合、ClickHouse APIで使用されるのと同じオプションアプローチを使用して、複数のホストに接続します - 任意で `ConnOpenStrategy` を指定します。

DSNベースの接続の場合、文字列は複数のホストと `connection_open_strategy` パラメータを受け付け、その値として `round_robin` または `in_order` を設定できます。

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

DSN接続文字列を使用している場合、SSLは「secure=true」パラメータを介して有効にすることができます。`OpenDB`メソッドは、[TLSのネイティブAPI](#using-tls)と同じアプローチを利用しており、非nil TLS構造体の指定に依存します。DSN接続文字列ではSSL検証をスキップするためのskip_verifyパラメータがサポートされていますが、より高度なTLS設定には `OpenDB` メソッドが必要です - それには設定を渡す許可があるためです。

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

`OpenDB`を使用している場合、認証情報は通常のオプションを介して渡すことができます。DSNベースの接続の場合、接続文字列にユーザー名とパスワードをパラメータとして渡すことができます。

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

接続が取得されると、ユーザーはExecメソッドを介して `sql` ステートメントを発行することができます。

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


このメソッドは、コンテキストを受け取ることをサポートしていません - デフォルトでは、バックグラウンドコンテキストで実行されます。ユーザーは、これが必要な場合に `ExecContext` を使用できます - [コンテキストの使用](#using-context)を参照してください。
### バッチ挿入 {#batch-insert-1}

バッチセマンティクスは、`Being` メソッドを介して `sql.Tx` を作成することによって達成できます。そこから、`INSERT` ステートメントを使用して `Prepare` メソッドを取得することでバッチを取得できます。これにより、行を追加できる `sql.Stmt` が返されます。バッチは、元の `sql.Tx` で `Commit` が実行されるまでメモリに蓄積されます。

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

単一行のクエリは、`QueryRow` メソッドを使用して達成できます。これにより、スキャンを呼び出せる *sql.Row が返されます。これは、列がマシュアルされるべき変数へのポインタでスキャンを呼び出せます。`QueryRowContext` バリアントを使用すると、バックグラウンド以外のコンテキストを渡すことができます - [コンテキストの使用](#using-context)を参照してください。

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

複数行を反復処理するには、`Query` メソッドが必要です。これにより、行を反復処理できる `*sql.Rows` 構造体が返されます。`QueryContext` の同等物は、コンテキストを渡すことを可能にします。

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

非同期挿入は、`ExecContext` メソッドを介して挿入を実行することで達成できます。これは、以下に示すように非同期モードを有効にしたコンテキストを渡す必要があります。これにより、クライアントが挿入を完了するのを待つべきか、データが受信された後に応答するかを指定します。これにより、[wait_for_async_insert](/operations/settings/settings/#wait-for-async-insert)パラメータを効果的に制御します。

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

標準インターフェースを使用している場合、サポートされていません。
### 構造体の使用 {#using-structs-1}

標準インターフェースを使用している場合、サポートされていません。
### 型変換 {#type-conversions-1}

標準の `database/sql` インターフェースは、[ClickHouse API](#type-conversions)と同じ型をサポートする必要があります。いくつかの例外、主に複雑な型については、以下に記載されています。ClickHouse APIに似て、クライアントは挿入と応答のマシュアルの両方に関して、受け入れる可変型の柔軟性を可能な限り持つことを目指しています。詳細については、[型変換](#type-conversions)を参照してください。
### 複雑な型 {#complex-types-1}

明示されていない限り、複雑な型の取り扱いは[ClickHouse API](#complex-types)と同じである必要があります。違いは `database/sql` の内部によるものです。
#### マップ {#maps}

ClickHouse APIとは異なり、標準APIはマップをスキャンタイプで強く型付けする必要があります。たとえば、ユーザーは `Map(String,String)` フィールドの `map[string]interface{}` を渡すことはできず、代わりに `map[string]string` を使用する必要があります。`interface{}` 変数は常に互換性があり、より複雑な構造体に使用できます。ストラクチャは読み取り時にサポートされていません。

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

標準APIは、ネイティブの[ClickHouse API](#compression)と同じ圧縮アルゴリズム、つまりブロックレベルでの `lz4` および `zstd` 圧縮をサポートしています。加えて、HTTP接続にはgzip、deflate、br圧縮がサポートされています。これらのいずれかが有効になっている場合、挿入中およびクエリ応答中にブロックに対して圧縮が行われます。他のリクエスト（例：pingまたはクエリリクエスト）は圧縮されません。これは `lz4` および `zstd` オプションと一致します。

接続を確立するために `OpenDB` メソッドを使用する場合、圧縮の設定を渡すことができます。これには圧縮レベルを指定する機能が含まれています（下記参照）。`sql.Open`を使用してDSN経由で接続する場合は、パラメータ `compress` を利用してください。これは、特定の圧縮アルゴリズム（例：`gzip`、`deflate`、`br`、`zstd`または`lz4`）か、ブールフラグにすることができます。trueに設定すると、`lz4`が使用されます。デフォルトは`none`、つまり圧縮は無効です。

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

適用された圧縮のレベルは、DSNパラメータ `compress_level` または `Compression` オプションの Levelフィールドによって制御できます。これはデフォルトで0ですが、アルゴリズム固有です：

* `gzip` - `-2`（最良速度）から `9`（最良圧縮）
* `deflate` - `-2`（最良速度）から `9`（最良圧縮）
* `br` - `0`（最良速度）から `11`（最良圧縮）
* `zstd`、`lz4` - 無視されます
### パラメータバインディング {#parameter-binding-1}

標準APIは、[ClickHouse API](#parameter-binding)と同じパラメータバインディング機能をサポートしており、`Exec`、`Query`、および`QueryRow`メソッド（およびそれらの同等の[Context](#using-context)バリアント）に対してパラメータを渡すことができます。位置指定、名前付きおよび番号付けられたパラメータがサポートされています。

```go
var count uint64
// 位置バインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 >= ? AND Col3 < ?", 500, now.Add(time.Duration(750)*time.Second)).Scan(&count); err != nil {
    return err
}
// 250
fmt.Printf("位置バインドカウント: %d\n", count)
// 数値バインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= $2 AND Col3 > $1", now.Add(time.Duration(150)*time.Second), 250).Scan(&count); err != nil {
    return err
}
// 100
fmt.Printf("数値バインドカウント: %d\n", count)
// 名称付きバインド
if err = conn.QueryRow(ctx, "SELECT count() FROM example WHERE Col1 <= @col1 AND Col3 > @col3", clickhouse.Named("col1", 100), clickhouse.Named("col3", now.Add(time.Duration(50)*time.Second))).Scan(&count); err != nil {
    return err
}
// 50
fmt.Printf("名前付きバインドカウント: %d\n", count)
```

[完全な例](https://github.com/ClickHouse/clickhouse-go/blob/main/examples/std/bind.go)

注意 [特別なケース](#special-cases) は依然として適用されます。
### コンテキストの使用 {#using-context-1}

標準APIは、[ClickHouse API](#using-context)と同じように、コンテキストを介してデッドライン、キャンセル信号、および他のリクエストスコープの値を送信する能力をサポートしています。ClickHouse APIとは異なり、これはメソッドの `Context` バリアントを使用することによって実現されます。すなわち、デフォルトでバックグラウンドコンテキストを使用するメソッド（例：`Exec`）には、最初のパラメータとしてコンテキストを渡すことができるバリアント `ExecContext` があります。これにより、アプリケーションフローの任意の段階でコンテキストを渡すことができます。たとえば、ユーザーは接続を確立するときに `ConnContext` を介してコンテキストを渡すことができます、または `QueryRowContext` を介してクエリ行を要求するときに渡すことができます。すべての利用可能なメソッドの例が以下に示されています。

デッドライン、キャンセル信号、クエリID、クォータキー、および接続設定を渡すためにコンテキストを使用する方法の詳細については、[ClickHouse API](#using-context)のコンテキストの使用を参照してください。

```go
ctx := clickhouse.Context(context.Background(), clickhouse.WithSettings(clickhouse.Settings{
    "allow_experimental_object_type": "1",
}))
conn.ExecContext(ctx, "DROP TABLE IF EXISTS example")
// JSONカラムを作成するにはallow_experimental_object_type=1が必要です
if _, err = conn.ExecContext(ctx, `
    CREATE TABLE example (
            Col1 JSON
        )
        Engine Memory
    `); err != nil {
    return err
}

// クエリはコンテキストを使用してキャンセル可能です
ctx, cancel := context.WithCancel(context.Background())
go func() {
    cancel()
}()
if err = conn.QueryRowContext(ctx, "SELECT sleep(3)").Scan(); err == nil {
    return fmt.Errorf("キャンセルが予想される")
}

// クエリのデッドラインを設定します - この時点に絶対時刻が経過した後はクエリがキャンセルされます。接続は終了しませんが、ClickHouse内でクエリは完了します
ctx, cancel = context.WithDeadline(context.Background(), time.Now().Add(-time.Second))
defer cancel()
if err := conn.PingContext(ctx); err == nil {
    return fmt.Errorf("期限が切れたと予想される")
}

// ログにトレースの助けとなるクエリIDを設定します。例: system.query_log を参照
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
// クォータキーを設定します - 最初にクォータを作成します
if _, err = conn.ExecContext(ctx, "CREATE QUOTA IF NOT EXISTS foobar KEYED BY client_key FOR INTERVAL 1 minute MAX queries = 5 TO default"); err != nil {
    return err
}

// クエリはコンテキストを使用してキャンセルできます
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
            fmt.Println("キャンセルが予想される")
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

ネイティブ接続には本質的にセッションがありますが、HTTP経由の接続では、ユーザーが設定としてコンテキストを渡すためのセッションIDを作成する必要があります。これにより、セッションにバインドされた一時テーブルなどの機能を使用できます。

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

[ClickHouse API](#dynamic-scanning) と同様に、カラムの型情報が利用可能で、ユーザーはスキャンに渡すために正しく型指定された変数のランタイムインスタンスを作成できます。これにより、型が不明なカラムを読み取ることが可能になります。

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

[外部テーブル](/engines/table-engines/special/external-data/) を使用することで、クライアントは `SELECT` クエリを介してClickHouseにデータを送信できます。このデータは一時テーブルに入れられ、クエリ自体の評価に使用できます。

クエリと共に外部データをクライアントに送信するには、ユーザーはコンテキストを介して渡す前に `ext.NewTable` を使って外部テーブルを構築する必要があります。

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

ClickHouseはネイティブプロトコルの一部として[トレースコンテキスト](/operations/opentelemetry/)を渡すことを許可しています。クライアントは `clickhouse.withSpan` 関数を介してスパンを作成し、これをコンテキストに渡すことで実現します。HTTPをトランスポートとして使用する場合はサポートされていません。

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

* プリミティブ型に対しては、可能な限りClickHouse APIを利用してください。これにより、重要なリフレクションと間接呼び出しを避けることができます。
* 大規模なデータセットを読み取る場合は、[`BlockBufferSize`](#connection-settings) を変更することを検討してください。これによりメモリのフットプリントが増加しますが、行イテレーション中により多くのブロックを並列にデコードできるようになります。デフォルト値の2は保守的であり、メモリのオーバーヘッドを最小限に抑えます。高い値にするとメモリ内のブロックが増えます。異なるクエリが異なるブロックサイズを生成する可能性があるため、テストが必要です。これにより、コンテキストを介して[クエリレベル](#using-context)で設定できます。
* データを挿入する際には、型を具体的に指定してください。クライアントは柔軟に設計されていますが、例えばUUIDやIPの解析を許可しているため、これによりデータ検証が必要となり、挿入時にコストが発生します。
* 可能な限り列指向の挿入を使用してください。これらは強く型指定されるべきで、クライアントが値を変換する必要を避けることができます。
* 最適な挿入パフォーマンスのためにClickHouseの[推奨事項](/sql-reference/statements/insert-into/#performance-considerations)に従ってください。
