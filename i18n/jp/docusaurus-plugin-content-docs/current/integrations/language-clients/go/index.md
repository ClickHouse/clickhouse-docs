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

import ConnectionDetails from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_gather_your_details_native.md';


# ClickHouse Go \{#clickhouse-go\}

## クイックスタート \{#quick-start\}

まずは簡単な例から始めましょう。これは ClickHouse に接続し、`system` データベースに対して `SELECT` を実行します。始めるにあたっては、接続情報を手元に用意しておく必要があります。

### 接続情報 \{#connection-details\}

<ConnectionDetails />

### モジュールを初期化する \{#initialize-a-module\}

```bash
mkdir clickhouse-golang-example
cd clickhouse-golang-example
go mod init clickhouse-golang-example
```

### サンプルコードをコピーする \{#copy-in-some-sample-code\}

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
    defer rows.Close()

    for rows.Next() {
        var name, uuid string
        if err := rows.Scan(&name, &uuid); err != nil {
            log.Fatal(err)
        }
        log.Printf("name: %s, uuid: %s", name, uuid)
    }

    // NOTE: Do not skip rows.Err() check
    if err := rows.Err(); err != nil {
        log.Fatal(err)
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


### go mod tidy を実行する \{#run-go-mod-tidy\}

```bash
go mod tidy
```

### 接続情報を設定する \{#set-your-connection-details\}

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

### サンプルを実行する \{#run-the-example\}

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

### さらに詳しく \{#learn-more\}

このカテゴリの他のドキュメントでは、ClickHouse Go クライアントの詳細について説明します。

## 概要 \{#overview\}

ClickHouse は 2 つの公式な Go クライアントをサポートしています。これらのクライアントは補完的な関係にあり、意図的に異なるユースケースをサポートしています。

* [clickhouse-go](https://github.com/ClickHouse/clickhouse-go) - Go 標準の `database/sql` インターフェイスまたはネイティブ ClickHouse API のいずれかをサポートする高レベルクライアント。
* [ch-go](https://github.com/ClickHouse/ch-go) - 低レベルクライアント。ネイティブインターフェイスのみ。

clickhouse-go は高レベルインターフェイスを提供し、ユーザーが行指向のセマンティクスとバッチ処理を用いてクエリおよびデータinsertを行えるようにします。これはデータ型に対して寛容であり、精度の損失が生じない限り値を変換します。一方、ch-go は最適化された列指向インターフェイスを提供し、型の厳密さとより複雑な使用方法を代償として、低い CPU およびメモリオーバーヘッドで高速なデータブロックストリーミングを実現します。

バージョン 2.3 から、clickhouse-go はエンコード、デコード、圧縮などの低レベル機能に ch-go を利用します。両方のクライアントは最適なパフォーマンスを提供するためにエンコードにネイティブフォーマットを使用し、ネイティブ ClickHouse プロトコルを介して通信できます。さらに、ユーザーがトラフィックのプロキシやロードバランシングを行う必要がある場合に備えて、clickhouse-go は HTTP をトランスポート方式としてもサポートします。

### 接続する 4 つの方法 \{#four-ways-to-connect\}

clickhouse-go では、**どの API** を使うかと、**どのトランスポート** を使うかという 2 つの独立した選択肢があります。これらを組み合わせると、4 つの接続モードになります。

|                                                | **TCP** (Native protocol、ポート 9000/9440)  |    **HTTP** (ポート 8123/8443)     |
| :--------------------------------------------- | :--------------------------------------: | :-----------------------------: |
| **ClickHouse API** (`clickhouse.Open`)         |            デフォルト — 最高のパフォーマンス            | `Protocol: clickhouse.HTTP` を設定 |
| **`database/sql` API** (`OpenDB` / `sql.Open`) |         `clickhouse://host:9000`         |        `http://host:8123`       |

**API の選択:** 最大限のパフォーマンスとフル機能 (進捗コールバック、列指向の insert、幅広い型のサポート) が必要な場合は、ClickHouse API を選択してください。ORM や標準的な Go のデータベースインターフェイスを前提とするツールと統合する必要がある場合は、`database/sql` を選択してください。

**トランスポートの選択:** TCP のほうが高速で、デフォルトです。インフラ側の要件で必要な場合は HTTP に切り替えてください。たとえば、HTTP ロードバランサーやプロキシ経由で接続する場合、一時テーブルを伴うセッションや追加の圧縮アルゴリズム (`gzip`、`deflate`、`br`) など、HTTP 固有の機能が必要な場合です。

どちらの API でも、トランスポートにかかわらず native バイナリエンコーディングを使うため、HTTP でもシリアライズのオーバーヘッドはありません。

|                    | Native format | TCP transport | HTTP transport | Bulk write | Struct marshaling | Compression | Progress callbacks |
| :----------------: | :-----------: | :-----------: | :------------: | :--------: | :---------------: | :---------: | :----------------: |
|   ClickHouse API   |       ✅       |       ✅       |        ✅       |      ✅     |         ✅         |      ✅      |          ✅         |
| `database/sql` API |       ✅       |       ✅       |        ✅       |      ✅     |                   |      ✅      |                    |

### クライアントの選択 \{#choosing-a-client\}

どのクライアントライブラリを選択するかは、利用パターンと求めるパフォーマンス要件によって異なります。毎秒数百万件のinsertが必要となるような挿入中心のユースケースでは、低レベルクライアントである [ch-go](https://github.com/ClickHouse/ch-go) の使用を推奨します。このクライアントは、ClickHouse のネイティブフォーマットが要求する列指向フォーマットへ行指向データを変換 (ピボット) する際のオーバーヘッドを回避します。さらに、使いやすさのために `interface{}` (`any`) 型やリフレクションの使用も避けています。

集約処理にフォーカスしたクエリワークロードや、スループット要件がそれほど高くないinsertワークロードでは、[clickhouse-go](https://github.com/ClickHouse/clickhouse-go) は親しみやすい `database/sql` インターフェイスと、より分かりやすい行セマンティクスを提供します。また、トランスポートプロトコルとして HTTP を任意で利用し、行と struct 間のマーシャリングを行うヘルパー関数を活用することもできます。

|               | ネイティブフォーマット | ネイティブプロトコル | HTTP プロトコル | 行指向 API | 列指向 API | 型の柔軟性 |  圧縮 | クエリプレースホルダー |
| :-----------: | :---------: | :--------: | :--------: | :-----: | :-----: | :---: | :-: | :---------: |
| clickhouse-go |      ✅      |      ✅     |      ✅     |    ✅    |    ✅    |   ✅   |  ✅  |      ✅      |
|     ch-go     |      ✅      |      ✅     |            |         |    ✅    |       |  ✅  |             |

## インストール \{#installation\}

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

  go 1.21

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


### バージョニング \{#versioning\}

このクライアントは ClickHouse とは独立してリリースされます。2.x は現在開発中のメジャーバージョンを表します。2.x 系のすべてのバージョンは互いに互換性があるように設計されています。

#### ClickHouse の互換性 \{#clickhouse-compatibility\}

このクライアントは以下をサポートします：

- [こちら](https://github.com/ClickHouse/ClickHouse/blob/master/SECURITY.md) に記載されている、現在サポートされているすべての ClickHouse バージョン。ClickHouse の各バージョンがサポート対象外になると、それらはクライアントのリリースに対しても積極的なテスト対象から外れます。
- クライアントのリリース日時点から遡って 2 年間にリリースされたすべての ClickHouse バージョン。なお、積極的にテストされるのは LTS バージョンのみです。

#### Golang の互換性 \{#golang-compatibility\}

|      クライアントバージョン     | Golang バージョン |
| :------------------: | :----------: |
|  =&gt; 2.0 &lt;= 2.2 |  1.17, 1.18  |
| &gt;= 2.3, &lt; 2.41 |     1.18+    |
|      &gt;= 2.41      |     1.21+    |
|      &gt;= 2.43      |     1.24+    |

## ベストプラクティス \{#best-practices\}

* 可能な限り、特にプリミティブ型については ClickHouse API を利用してください。これにより、大きなオーバーヘッドを伴うリフレクションや間接参照を避けられます。
* 大きなデータセットを読み込む場合は、[`BlockBufferSize`](/integrations/language-clients/go/configuration#connection-settings) の変更を検討してください。これはメモリ使用量を増加させますが、行のイテレーション時に、より多くのブロックを並列にデコードできるようになります。デフォルト値の 2 は保守的な設定で、メモリのオーバーヘッドを最小限に抑えます。より大きな値にすると、メモリ上のブロック数が増加します。クエリによって生成されるブロックサイズが異なるため、テストが必要です。そのため、Context を介して[クエリ単位](/integrations/language-clients/go/clickhouse-api#using-context)で設定できます。
* データをinsertする際は、型を明示的に指定してください。クライアントは、たとえば UUID や IP に対して文字列のパースを許可するなど、柔軟に扱えるよう設計されていますが、これはデータ検証を必要とし、insert時のコスト増につながります。
* 可能な限り列指向のinsertを使用してください。この場合も、強く型付けされた形式とし、クライアントによる値の変換が不要になるようにします。
* 最適なinsertパフォーマンスのために、ClickHouse の[推奨事項](/sql-reference/statements/insert-into/#performance-considerations)に従ってください。

## 次の手順 \{#next-steps\}

* [設定](/integrations/language-clients/go/configuration) — 接続設定、TLS、認証、ロギング、圧縮
* [ClickHouse API](/integrations/language-clients/go/clickhouse-api) — クエリとinsertのためのネイティブな Go API
* [Database/SQL API](/integrations/language-clients/go/database-sql-api) — 標準の `database/sql` インターフェイス
* [データ型](/integrations/language-clients/go/data-types) — Go の型マッピングと複雑な型のサポート