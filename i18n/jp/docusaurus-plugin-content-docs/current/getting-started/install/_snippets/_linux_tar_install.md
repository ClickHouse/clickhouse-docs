# tgzアーカイブを使用したClickHouseのインストール

> `deb`または`rpm`パッケージのインストールが不可能なすべてのLinuxディストリビューションでは、公式のプリコンパイル済み`tgz`アーカイブを使用することを推奨します。

<VerticalStepper>


## 最新の安定版をダウンロードしてインストールする {#install-latest-stable}

必要なバージョンは、リポジトリ https://packages.clickhouse.com/tgz/ から `curl` または `wget` を使用してダウンロードできます。
ダウンロード後、アーカイブを展開し、インストールスクリプトを使用してインストールしてください。

以下は、最新の安定版をインストールする例です。

:::note
本番環境では、最新の `stable` バージョンの使用を推奨します。
リリース番号は、[こちらのGitHubページ](https://github.com/ClickHouse/ClickHouse/tags)で `-stable` の接尾辞が付いたものを確認できます。
:::


## 最新のClickHouseバージョンを取得する {#get-latest-version}

GitHubから最新のClickHouseバージョンを取得し、`LATEST_VERSION`変数に格納します。

```bash
LATEST_VERSION=$(curl -s https://raw.githubusercontent.com/ClickHouse/ClickHouse/master/utils/list-versions/version_date.tsv | \
    grep -Eo '[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+' | sort -V -r | head -n 1)
export LATEST_VERSION
```


## システムアーキテクチャの検出 {#detect-system-architecture}

システムアーキテクチャを検出し、ARCH変数を適切に設定します：

```bash
case $(uname -m) in
  x86_64) ARCH=amd64 ;;         # Intel/AMD 64ビットプロセッサ用
  aarch64) ARCH=arm64 ;;        # ARM 64ビットプロセッサ用
  *) echo "Unknown architecture $(uname -m)"; exit 1 ;; # サポートされていないアーキテクチャの場合は終了
esac
```


## 各ClickHouseコンポーネントのtarballをダウンロードする {#download-tarballs}

各ClickHouseコンポーネントのtarballをダウンロードします。このループは、まずアーキテクチャ固有のパッケージを試行し、該当するものがない場合は汎用パッケージにフォールバックします。

```bash
for PKG in clickhouse-common-static clickhouse-common-static-dbg clickhouse-server clickhouse-client clickhouse-keeper
do
  curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION-${ARCH}.tgz" \
    || curl -fO "https://packages.clickhouse.com/tgz/stable/$PKG-$LATEST_VERSION.tgz"
done
```


## パッケージの展開とインストール {#extract-and-install}

以下のコマンドを実行して、次のパッケージを展開しインストールします:

- `clickhouse-common-static`


```bash
# clickhouse-common-staticパッケージを展開してインストール
tar -xzvf "clickhouse-common-static-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-$LATEST_VERSION/install/doinst.sh"
```

* `clickhouse-common-static-dbg`


```bash
# デバッグシンボルパッケージを展開してインストール
tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-common-static-dbg-$LATEST_VERSION.tgz"
sudo "clickhouse-common-static-dbg-$LATEST_VERSION/install/doinst.sh"
```

* `clickhouse-server`


```bash
# サーバーパッケージを展開して設定付きでインストール
tar -xzvf "clickhouse-server-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-server-$LATEST_VERSION.tgz"
sudo "clickhouse-server-$LATEST_VERSION/install/doinst.sh" configure
sudo /etc/init.d/clickhouse-server start  # サーバーを起動
```

* `clickhouse-client`


```bash
# クライアントパッケージを展開してインストール
tar -xzvf "clickhouse-client-$LATEST_VERSION-${ARCH}.tgz" \
  || tar -xzvf "clickhouse-client-$LATEST_VERSION.tgz"
sudo "clickhouse-client-$LATEST_VERSION/install/doinst.sh"
```

</VerticalStepper>
