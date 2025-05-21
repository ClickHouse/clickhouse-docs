# Install ClickHouse using tgz archives

> すべてのLinuxディストリビューションで、`deb`または`rpm`パッケージのインストールが不可能な場合は、公式の事前コンパイルされた `tgz` アーカイブを使用することをお勧めします。

<VerticalStepper>

## Download and install latest stable version {#install-latest-stable}

必要なバージョンは `curl` または `wget` を使用してリポジトリ https://packages.clickhouse.com/tgz/ からダウンロードできます。その後、ダウンロードしたアーカイブは解凍され、インストールスクリプトでインストールされるべきです。

以下は最新の安定版をインストールする方法の例です。

:::note
本番環境では、最新の `stable` バージョンを使用することをお勧めします。
リリース番号はこの [GitHubページ](https://github.com/ClickHouse/ClickHouse/tags) で確認でき、ポストフィックスは `-stable` です。
:::

## Get the latest ClickHouse version {#get-latest-version}

最新のClickHouseバージョンをGitHubから取得し、`LATEST_VERSION` 変数に保存します。

```bash
LATEST_VERSION=$(curl -s https://raw.githubusercontent.com/ClickHouse/ClickHouse/master/utils/list-versions/version_date.tsv | \
    grep -Eo '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | sort -V -r | head -n 1)
export LATEST_VERSION
```

## Detect your system architecture {#detect-system-architecture}

システムアーキテクチャを検出し、それに応じてARCH変数を設定します：

```bash
case $(uname -m) in
  x86_64) ARCH=amd64 ;;         # Intel/AMD 64ビットプロセッサ用
  aarch64) ARCH=arm64 ;;        # ARM 64ビットプロセッサ用
  *) echo "未知のアーキテクチャ $(uname -m)"; exit 1 ;; # アーキテクチャがサポートされていない場合は終了
esac
```

## Download tarballs for each ClickHouse component {#download-tarballs}

各ClickHouseコンポーネントのためにtarballをダウンロードします。ループはアーキテクチャ特有のパッケージを最初に試し、次に一般的なものにフォールバックします。

```bash
for PKG in clickhouse-common-static clickhouse-common-static-dbg clickhouse-server clickhouse-client clickhouse-keeper
do
  curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION-${ARCH}.tgz" \
    || curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION.tgz"
done
```

## Extract and install packages {#extract-and-install}

以下のコマンドを実行して、次のパッケージを抽出してインストールします：
- `clickhouse-common-static`

```bash

# clickhouse-common-staticパッケージを抽出してインストール
tar -xzvf "clickhouse-common-static-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-$LATEST_VERSION/install/doinst.sh"
```


- `clickhouse-common-static-dbg`

```bash

# デバッグシンボルパッケージを抽出してインストール
tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-dbg-$LATEST_VERSION/install/doinst.sh"
```

- `clickhouse-server`

```bash

# 設定付きサーバーパッケージを抽出してインストール
tar -xzvf "clickhouse-server-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-server-$LATEST_VERSION.tgz"
sudo "clickhouse-server-$LATEST_VERSION/install/doinst.sh" configure
sudo /etc/init.d/clickhouse-server start  # サーバーを起動
```

- `clickhouse-client`

```bash

# クライアントパッケージを抽出してインストール
tar -xzvf "clickhouse-client-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-client-$LATEST_VERSION.tgz"
sudo "clickhouse-client-$LATEST_VERSION/install/doinst.sh"
```

</VerticalStepper>
