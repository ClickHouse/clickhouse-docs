# tgzアーカイブを使用したClickHouseのインストール \{#install-clickhouse-using-tgz-archives\}

> `deb`または`rpm`パッケージのインストールができないすべてのLinuxディストリビューションでは、公式のプリコンパイル済み`tgz`アーカイブの使用を推奨します。

<VerticalStepper>

## 最新の安定版をダウンロードしてインストールする \{#install-latest-stable\}

必要なバージョンは、リポジトリ https://packages.clickhouse.com/tgz/ から `curl` または `wget` を使ってダウンロードできます。
その後、ダウンロードしたアーカイブを展開し、付属のインストールスクリプトでインストールします。

以下は、最新の安定版をインストールする例です。

:::note
本番環境では、最新の `stable` 版を使用することを推奨します。
`-stable` の接尾辞が付いたリリース番号は、この [GitHub ページ](https://github.com/ClickHouse/ClickHouse/tags) で確認できます。
:::

## 最新の ClickHouse バージョンを取得する \{#get-latest-version\}

GitHub から最新の ClickHouse バージョンを取得し、`LATEST_VERSION` 変数に設定します。

```bash
LATEST_VERSION=$(curl -s https://raw.githubusercontent.com/ClickHouse/ClickHouse/master/utils/list-versions/version_date.tsv | \
    grep -Eo '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | sort -V -r | head -n 1)
export LATEST_VERSION
```

## システムアーキテクチャを特定する \{#detect-system-architecture\}

システムアーキテクチャを特定し、それに応じて `ARCH` 変数を設定します。

```bash
case $(uname -m) in
  x86_64) ARCH=amd64 ;;         # For Intel/AMD 64-bit processors
  aarch64) ARCH=arm64 ;;        # For ARM 64-bit processors
  *) echo "Unknown architecture $(uname -m)"; exit 1 ;; # Exit if architecture isn't supported
esac
```

## 各 ClickHouse コンポーネント用の tarball をダウンロードする \{#download-tarballs\}

各 ClickHouse コンポーネント用の tarball をダウンロードします。ループではまずアーキテクチャ固有のパッケージを試し、なければ汎用パッケージにフォールバックします。

```bash
for PKG in clickhouse-common-static clickhouse-common-static-dbg clickhouse-server clickhouse-client clickhouse-keeper
do
  curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION-${ARCH}.tgz" \
    || curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION.tgz"
done
```

## パッケージの展開とインストール \{#extract-and-install\}

以下のパッケージを展開してインストールするには、次のコマンドを実行します：
- `clickhouse-common-static`

```bash
# Extract and install clickhouse-common-static package
tar -xzvf "clickhouse-common-static-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-$LATEST_VERSION/install/doinst.sh"
```

* `clickhouse-common-static-dbg`

```bash
# Extract and install debug symbols package
tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-dbg-$LATEST_VERSION/install/doinst.sh"
```

* `clickhouse-server`

```bash
# Extract and install server package with configuration
tar -xzvf "clickhouse-server-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-server-$LATEST_VERSION.tgz"
sudo "clickhouse-server-$LATEST_VERSION/install/doinst.sh" configure
sudo /etc/init.d/clickhouse-server start  # Start the server
```

* `clickhouse-client`

```bash
# Extract and install client package
tar -xzvf "clickhouse-client-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-client-$LATEST_VERSION.tgz"
sudo "clickhouse-client-$LATEST_VERSION/install/doinst.sh"
```

</VerticalStepper>
