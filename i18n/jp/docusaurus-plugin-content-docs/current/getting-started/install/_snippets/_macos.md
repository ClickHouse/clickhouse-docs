

import Image from "@theme/IdealImage";
import dev_error from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/dev-verification-error.png";
import privacy_default from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-default-view.png";
import privacy_allow from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-screen-allow-anyway.png";


# ClickHouseのインストール（Homebrewを使用）

<VerticalStepper>

## コミュニティHomebrewフォーミュラを使用したインストール {#install-using-community-homebrew-formula}

[Homebrew](https://brew.sh/)を使用してmacOSにClickHouseをインストールするには、ClickHouseコミュニティの[homebrewフォーミュラ](https://formulae.brew.sh/cask/clickhouse)を使用できます。

```bash
brew install --cask clickhouse
```

## macOSの開発者認証エラーを修正する {#fix-developer-verification-error-macos}

`brew`を使用してClickHouseをインストールすると、macOSからエラーが発生することがあります。デフォルトでは、macOSは確認されていない開発者によって作成されたアプリケーションやツールを実行しません。

任意の`clickhouse`コマンドを実行しようとすると、次のようなエラーが表示されることがあります：

<Image img={dev_error} size="sm" alt="MacOS開発者認証エラーのダイアログ" border />

この認証エラーを回避するには、システム設定ウィンドウで適切な設定を見つけるか、ターミナルを使用するか、またはClickHouseを再インストールして、macOSの隔離バイナリからアプリを削除する必要があります。

### システム設定プロセス {#system-settings-process}

`clickhouse`実行可能ファイルを隔離バイナリから削除する最も簡単な方法は以下の通りです：

1. **システム設定**を開く。
1. **プライバシーとセキュリティ**に移動：

    <Image img={privacy_default} size="md" alt="MacOSプライバシーとセキュリティ設定のデフォルトビュー" border />

1. ウィンドウの下部までスクロールして、_「clickhouse-macos-aarch64」は確認されていない開発者からのものであるため、使用が制限されています_というメッセージを見つける。
1. **とにかく許可**をクリックする。

    <Image img={privacy_allow} size="md" alt="MacOSプライバシーとセキュリティ設定におけるとにかく許可ボタンの表示" border />

1. MacOSユーザーパスワードを入力する。

これでターミナルで`clickhouse`コマンドを実行できるようになります。

### ターミナルプロセス {#terminal-process}

時には`とにかく許可`ボタンを押してもこの問題が解決しないことがあります。その場合、コマンドラインを使用してこのプロセスを実行することもできます。また、単にコマンドラインを使用する方が好きな場合もあります！

まず、Homebrewが`clickhouse`実行可能ファイルをどこにインストールしたかを確認します：

```shell
which clickhouse
```

これにより、次のような出力が得られるはずです：

```shell
/opt/homebrew/bin/clickhouse
```

`clickhouse`を隔離バイナリから削除するには、`xattr -d com.apple.quarantine`を実行し、前のコマンドのパスを続けて入力します：

```shell
xattr -d com.apple.quarantine /opt/homebrew/bin/clickhouse
```

これで`clickhouse`実行可能ファイルを実行できるようになるはずです：

```shell
clickhouse
```

これにより、次のような出力が得られるはずです：

```bash
Use one of the following commands:
clickhouse local [args]
clickhouse client [args]
clickhouse benchmark [args]
```

## ClickHouseを再インストールして問題を修正する {#fix-issue}

Brewには、インストールされたバイナリを最初から隔離しないようにするコマンドラインオプションがあります。

まず、ClickHouseをアンインストールします：

```shell
brew uninstall clickhouse
```

次に、`--no-quarantine`オプションを使用してClickHouseを再インストールします：

```shell
brew install --no-quarantine clickhouse
```
</VerticalStepper>
