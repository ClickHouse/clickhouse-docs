# tgz アーカイブを使用して ClickHouse をインストールする \{#install-clickhouse-using-tgz-archives\}

> `deb` や `rpm` パッケージをインストールできない Linux ディストリビューションでは、公式の事前コンパイル済み `tgz` アーカイブを使用することを推奨します。

<VerticalStepper>

## 最新の stable バージョンをダウンロードしてインストールする \{#install-latest-stable\}

必要なバージョンは、`curl` または `wget` を使用してリポジトリ https://packages.clickhouse.com/tgz/ からダウンロードできます。
その後、ダウンロードしたアーカイブを展開し、付属のインストールスクリプトでインストールします。

以下は、最新の `stable` バージョンをインストールする方法の例です。

:::note
本番環境では、最新の `stable` バージョンを使用することを推奨します。
リリース番号は、この [GitHub ページ](https://github.com/ClickHouse/ClickHouse/tags) で
`-stable` という接尾辞が付いたものを確認してください。
:::

## 最新の ClickHouse バージョンを取得する \{#get-latest-version\}

GitHub から最新の ClickHouse バージョンを取得し、`LATEST_VERSION` 変数に保存します。

```bash
LATEST_VERSION=$(curl -s https://raw.githubusercontent.com/ClickHouse/ClickHouse/master/utils/list-versions/version_date.tsv | \
    grep -Eo '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | sort -V -r | head -n 1)
export LATEST_VERSION
```

## システムアーキテクチャを検出する \{#detect-system-architecture\}

システムアーキテクチャを検出し、それに応じて `ARCH` 変数を設定します。

```bash
case $(uname -m) in
  x86_64) ARCH=amd64 ;;         # Intel/AMD 64 ビットプロセッサー向け
  aarch64) ARCH=arm64 ;;        # ARM 64 ビットプロセッサー向け
  *) echo "Unknown architecture $(uname -m)"; exit 1 ;; # サポートされていないアーキテクチャの場合は終了
esac
```

## 各 ClickHouse コンポーネント用の tarball をダウンロードする \{#download-tarballs\}

各 ClickHouse コンポーネント用の tarball をダウンロードします。このループは、まずアーキテクチャ固有の
パッケージのダウンロードを試み、失敗した場合は汎用パッケージにフォールバックします。

```bash
for PKG in clickhouse-common-static clickhouse-common-static-dbg clickhouse-server clickhouse-client clickhouse-keeper
do
  curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION-${ARCH}.tgz" \
    || curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION.tgz"
done
```

## パッケージを展開してインストールする \{#extract-and-install\}

以下のパッケージを展開してインストールするために、次のコマンドを実行します:
- `clickhouse-common-static`

```bash
# clickhouse-common-static パッケージを展開してインストール
tar -xzvf "clickhouse-common-static-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-$LATEST_VERSION/install/doinst.sh"
```

- `clickhouse-common-static-dbg`

```bash
# デバッグシンボルパッケージを展開してインストール
tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-dbg-$LATEST_VERSION/install/doinst.sh"
```

- `clickhouse-server`

```bash
# 設定を含む server パッケージを展開してインストール
tar -xzvf "clickhouse-server-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-server-$LATEST_VERSION.tgz"
sudo "clickhouse-server-$LATEST_VERSION/install/doinst.sh" configure
sudo /etc/init.d/clickhouse-server start  # サーバーを起動
```

- `clickhouse-client`

```bash
# client パッケージを展開してインストール
tar -xzvf "clickhouse-client-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-client-$LATEST_VERSION.tgz"
sudo "clickhouse-client-$LATEST_VERSION/install/doinst.sh"
```

</VerticalStepper>