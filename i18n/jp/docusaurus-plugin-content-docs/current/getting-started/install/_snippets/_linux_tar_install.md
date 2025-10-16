


# ClickHouseをtgzアーカイブを使用してインストールする

> `deb` または `rpm` パッケージのインストールが不可能な全てのLinuxディストリビューションには、公式のコンパイル済み `tgz` アーカイブを使用することをお勧めします。

<VerticalStepper>

## 最新の安定バージョンをダウンロードしてインストールする {#install-latest-stable}

必要なバージョンは、リポジトリ https://packages.clickhouse.com/tgz/ から `curl` または `wget` を使用してダウンロードできます。
その後、ダウンロードしたアーカイブを展開し、インストールスクリプトでインストールする必要があります。

以下は、最新の安定バージョンをインストールする方法の例です。

:::note
本番環境では、最新の `stable` バージョンを使用することをお勧めします。
リリース番号はこの [GitHubページ](https://github.com/ClickHouse/ClickHouse/tags) で 
`-stable` の接尾辞を持っているものを見つけることができます。
:::

## 最新のClickHouseバージョンを取得する {#get-latest-version}

GitHubから最新のClickHouseバージョンを取得し、`LATEST_VERSION` 変数に保存します。

```bash
LATEST_VERSION=$(curl -s https://raw.githubusercontent.com/ClickHouse/ClickHouse/master/utils/list-versions/version_date.tsv | \
    grep -Eo '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | sort -V -r | head -n 1)
export LATEST_VERSION
```

## システムアーキテクチャを検出する {#detect-system-architecture}

システムアーキテクチャを検出し、それに応じてARCH変数を設定します：

```bash
case $(uname -m) in
  x86_64) ARCH=amd64 ;;         # For Intel/AMD 64-bit processors
  aarch64) ARCH=arm64 ;;        # For ARM 64-bit processors
  *) echo "Unknown architecture $(uname -m)"; exit 1 ;; # Exit if architecture isn't supported
esac
```

## 各ClickHouseコンポーネントのtarballをダウンロードする {#download-tarballs}

各ClickHouseコンポーネントのtarballをダウンロードします。ループはまずアーキテクチャ固有の 
パッケージを試し、次に汎用のものにフォールバックします。

```bash
for PKG in clickhouse-common-static clickhouse-common-static-dbg clickhouse-server clickhouse-client clickhouse-keeper
do
  curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION-${ARCH}.tgz" \
    || curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION.tgz"
done
```

## パッケージを抽出してインストールする {#extract-and-install}

以下のコマンドを実行して、次のパッケージを抽出およびインストールします：
- `clickhouse-common-static`

```bash

# Extract and install clickhouse-common-static package
tar -xzvf "clickhouse-common-static-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-$LATEST_VERSION/install/doinst.sh"
```

- `clickhouse-common-static-dbg`

```bash

# Extract and install debug symbols package
tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-dbg-$LATEST_VERSION/install/doinst.sh"
```

- `clickhouse-server`

```bash

# Extract and install server package with configuration
tar -xzvf "clickhouse-server-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-server-$LATEST_VERSION.tgz"
sudo "clickhouse-server-$LATEST_VERSION/install/doinst.sh" configure
sudo /etc/init.d/clickhouse-server start  # Start the server
```

- `clickhouse-client`

```bash

# Extract and install client package
tar -xzvf "clickhouse-client-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-client-$LATEST_VERSION.tgz"
sudo "clickhouse-client-$LATEST_VERSION/install/doinst.sh"
```

</VerticalStepper>
