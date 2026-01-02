---
description: 'ClickHouse C++ クライアントライブラリおよび u-server フレームワークとの統合に関するドキュメント'
sidebar_label: 'C++'
sidebar_position: 24
slug: /interfaces/cpp
title: 'C++ クライアントライブラリ'
doc_type: 'reference'
---

# C++ クライアントライブラリ {#c-client-library}

`clickhouse-cpp` は ClickHouse 用の公式 C++ クライアントライブラリであり、ClickHouse のネイティブバイナリプロトコルを用いて、高速かつ型安全なインターフェースを提供します。

ビルド手順、使用例、および追加のドキュメントは、プロジェクトの GitHub リポジトリで参照できます:
[https://github.com/ClickHouse/clickhouse-cpp](https://github.com/ClickHouse/clickhouse-cpp)。 

:::note
このライブラリは現在も活発に開発されています。すでに ClickHouse の中核となる機能はサポートされていますが、
一部の機能やデータ型については、まだ完全には実装されていない、あるいはサポートされていない場合があります。

皆さまからのフィードバックは非常に有益であり、新機能や改善の優先順位付けに役立ちます。制約や機能不足、
想定外の動作などに遭遇した場合には、ぜひ以下の issue トラッカーからご意見や機能要望をお寄せください:
[https://github.com/ClickHouse/clickhouse-cpp/issues](https://github.com/ClickHouse/clickhouse-cpp/issues)
:::

## ライブラリをプロジェクトに組み込む {#including-library-into-project}

ライブラリをプロジェクトに組み込む最も簡単な方法は、CMakeの`FetchContent`
モジュールを使用することです。この方法により、ライブラリの特定のバージョンに固定し、通常の
CMakeワークフローの一部としてビルドできます。

```cmake
include(FetchContent)

set(WITH_OPENSSL YES CACHE BOOL "Enable OpenSSL in clickhouse-cpp" FORCE)
FetchContent_Declare(
    clickhouse-cpp
    GIT_REPOSITORY https://github.com/ClickHouse/clickhouse-cpp.git
    GIT_TAG v2.6.0   # can also be `master` or other banch
)
FetchContent_MakeAvailable(clickhouse-cpp)
```

`WITH_OPENSSL` オプションはライブラリで TLS サポートを有効にし、ClickHouse Cloud やその他の SSL 対応 ClickHouse デプロイメントに接続する際に必要です。TLS を使用しない接続の場合は省略できますが、有効にしておくことが一般的に推奨されます。

SSL サポート付きでビルドするには、OpenSSL の開発パッケージがインストールされている必要があります。Debian、Ubuntu もしくはその派生ディストリビューションでは `libssl-dev`、Fedora や Red Hat では `openssl-devel`、macOS では Homebrew を用いて `openssl` をインストールしてください。

依存関係を利用可能にしたら、エクスポートされたライブラリターゲットに対してリンクしてください。

```cmake
target_link_libraries(your-target PRIVATE clickhouse-cpp-lib)
```


## 使用例 {#examples}

### クライアントオブジェクトの設定 {#example-setup-client}

ClickHouse に接続するために `Client` インスタンスを作成します。次の例では、パスワードが不要で SSL も有効化されていないローカルの ClickHouse インスタンスに接続する方法を示します。

```cpp
#include <clickhouse/client.h>

clickhouse::Client client{clickhouse::ClientOptions().SetHost("localhost")};
```

より高度な構成では、追加の設定が必要になります。次の例では、いくつかの追加パラメータを指定して
ClickHouse Cloud インスタンスに接続する方法を示します。

```cpp
#include <clickhouse/client.h>

clickhouse::Client client{
    clickhouse::ClientOptions{}
      .SetHost("your.instance.clickhouse.cloud")
      .SetUser("default")
      .SetPassword("your-password")
      .SetSSLOptions({})   // Enable SSL
      .SetPort(9440)       // for connections over SSL ClickHouse Cloud uses port 9440
    };
```


### データを返さないテーブル作成とクエリの実行 {#example-create-table}

テーブル作成など、データを返さないクエリを実行するには、`Execute` メソッドを使用します。
同様に、`ALTER TABLE` や `DROP` などの他の文にも使用できます。

```cpp
client.Execute(R"(
    CREATE TABLE IF NOT EXISTS greetings (
        id UInt64,
        message String,
        language String) 
    ENGINE = MergeTree ORDER BY id)");
```


### データの挿入 {#example-insert-data}

テーブルにデータを挿入するには、`Block` を作成し、テーブルスキーマに対応するカラムオブジェクトで埋めます。データはカラム単位で追加され、その後、バッチ書き込みを効率化するよう最適化された `Insert` メソッドを用いて、1 回の操作で挿入されます。

```cpp
auto id = std::make_shared<clickhouse::ColumnUInt64>();
auto message = std::make_shared<clickhouse::ColumnString>();
auto language = std::make_shared<clickhouse::ColumnString>();

id->Append(1);
message->Append("Hello, World!");
language->Append("English");

id->Append(2);
message->Append("¡Hola, Mundo!");
language->Append("Spanish");

id->Append(3);
message->Append("Hallo wereld!");
language->Append("Dutch");

clickhouse::Block block{};
block.AppendColumn("id", id);
block.AppendColumn("message", message);
block.AppendColumn("language", language);

client.Insert("greetings", block);
```


### データの選択 {#example-select}

データを返すクエリを実行するには、`Select` メソッドを使用し、結果を処理するためのコールバックを指定します。クエリ結果は、ClickHouse のネイティブなカラム指向データ表現を反映した `Block` オブジェクトとして返されます。

```cpp
client.Select(
    "SELECT id, message, language FROM greetings",
    [](const clickhouse::Block & block){
        for (size_t i = 0; i < block.GetRowCount(); ++i) {
            auto id = block[0]->AsStrict<clickhouse::ColumnUInt64>()->At(i);
            auto message = block[1]->AsStrict<clickhouse::ColumnString>()->At(i);
            auto language = block[2]->AsStrict<clickhouse::ColumnString>()->At(i);
            std::cout << id << "\t" << message << "\t" << language << "\n";
        }
    });
```


## サポートされているデータ型 {#supported-data-types}

- `UInt8`, `UInt16`, `UInt32`, `UInt64`, `Int8`, `Int16`, `Int32`, `Int64`
- `UInt128`, `Int128`
- `Decimal32`, `Decimal64`, `Decimal128`
- `Float32`, `Float64`
- `Date`
- `DateTime`, `DateTime64`
- `DateTime([timezone])`, `DateTime64(N, [timezone])`
- `UUID`
- `Enum8`, `Enum16`
- `String`
- `FixedString(N)`
- `LowCardinality(String)` および `LowCardinality(FixedString(N))`
- `Nullable(T)`
- `Array(T)`
- `Tuple`
- `Map`
- `IPv4`, `IPv6`
- `Point`, `Ring`, `Polygon`, `MultiPolygon`