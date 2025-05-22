---
{}
---




# ClickHouseのtgzアーカイブを使用したインストール

> `deb` または `rpm` パッケージのインストールが不可能なすべてのLinuxディストリビューションに対して、公式の事前コンパイルされた `tgz` アーカイブを使用することをお勧めします。

<VerticalStepper>

## 最新の安定版をダウンロードしてインストールする {#install-latest-stable}

必要なバージョンは、https://packages.clickhouse.com/tgz/ から `curl` または `wget` を使用してダウンロードできます。
その後、ダウンロードしたアーカイブを解凍し、インストールスクリプトを使用してインストールする必要があります。

以下は、最新の安定版をインストールする方法の例です。

:::note
本番環境では、最新の `stable` バージョンを使用することをお勧めします。
リリース番号は、この [GitHubページ](https://github.com/ClickHouse/ClickHouse/tags) で
`-stable` の接尾辞を持つものを見つけることができます。
:::

## 最新のClickHouseバージョンを取得する {#get-latest-version}

GitHubから最新のClickHouseバージョンを取得し、`LATEST_VERSION` 変数に格納します。

```bash
LATEST_VERSION=$(curl -s https://raw.githubusercontent.com/ClickHouse/ClickHouse/master/utils/list-versions/version_date.tsv | \
    grep -Eo '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | sort -V -r | head -n 1)
export LATEST_VERSION
```

## システムアーキテクチャの検出 {#detect-system-architecture}

システムアーキテクチャを検出し、ARCH変数をそれに応じて設定します。

```bash
case $(uname -m) in
  x86_64) ARCH=amd64 ;;         # Intel/AMD 64ビットプロセッサ用
  aarch64) ARCH=arm64 ;;        # ARM 64ビットプロセッサ用
  *) echo "Unknown architecture $(uname -m)"; exit 1 ;; # サポートされていないアーキテクチャの場合は終了
esac
```

## 各ClickHouseコンポーネントのtarボールをダウンロード {#download-tarballs}

各ClickHouseコンポーネントのtarボールをダウンロードします。ループは先にアーキテクチャ固有の 
パッケージを試し、それが失敗した場合は一般的なものにフォールバックします。

```bash
for PKG in clickhouse-common-static clickhouse-common-static-dbg clickhouse-server clickhouse-client clickhouse-keeper
do
  curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION-${ARCH}.tgz" \
    || curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION.tgz"
done
```

## パッケージの抽出とインストール {#extract-and-install}

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

# 設定付きのサーバーパッケージを抽出してインストール
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
