---
{}
---

import Image from "@theme/IdealImage";
import dev_error from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/dev-verification-error.png";
import privacy_default from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-default-view.png";
import privacy_allow from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-screen-allow-anyway.png";


# ClickHouseをHomebrewを使用してインストールする

<VerticalStepper>

## コミュニティのHomebrewフォーミュラを使用してインストールする {#install-using-community-homebrew-formula}

[Homebrew](https://brew.sh/)を使用してmacOSにClickHouseをインストールするには、ClickHouseコミュニティの[homebrewフォーミュラ](https://formulae.brew.sh/cask/clickhouse)を使用できます。

```bash
brew install --cask clickhouse
```

## MacOSでの開発者検証エラーを修正する {#fix-developer-verification-error-macos}

`brew`を使用してClickHouseをインストールすると、MacOSからエラーが表示されることがあります。デフォルトでは、MacOSは検証できない開発者によって作成されたアプリケーションやツールを実行しません。

任意の`clickhouse`コマンドを実行しようとすると、次のエラーが表示されることがあります：

<Image img={dev_error} size="sm" alt="MacOSの開発者検証エラーのダイアログ" border />

この検証エラーを回避するには、以下の方法でMacOSの隔離ビンからアプリを削除する必要があります。システム設定ウィンドウ内の適切な設定を見つけるか、ターミナルを使用するか、ClickHouseを再インストールする方法があります。

### システム設定のプロセス {#system-settings-process}

`clickhouse`実行ファイルを隔離ビンから削除する最も簡単な方法は以下の通りです：

1. **システム設定**を開きます。
1. **プライバシーとセキュリティ**に移動します：

    <Image img={privacy_default} size="md" alt="MacOSのプライバシーとセキュリティ設定のデフォルトビュー" border />

1. ウィンドウの下部までスクロールして、_「clickhouse-macos-aarch64」が未確認の開発者からのものであるため、使用がブロックされました_というメッセージを見つけます。
1. **許可する**をクリックします。

    <Image img={privacy_allow} size="md" alt="MacOSのプライバシーとセキュリティ設定に「許可する」ボタンが表示されている" border />

1. MacOSユーザーパスワードを入力します。

これでターミナルで`clickhouse`コマンドを実行できるようになるはずです。

### ターミナルプロセス {#terminal-process}

場合によっては、`許可する`ボタンを押してもこの問題が解決しないことがあります。その場合は、コマンドラインを使用してこのプロセスを実行することもできます。また、コマンドラインの使用を好むかもしれません！

まず、Homebrewが`clickhouse`実行ファイルをインストールした場所を確認します：

```shell
which clickhouse
```

これにより、次のような出力が得られます：

```shell
/opt/homebrew/bin/clickhouse
```

次のコマンドで`xattr -d com.apple.quarantine`を実行し、前のコマンドのパスを続けて入力して、`clickhouse`を隔離ビンから削除します：

```shell
xattr -d com.apple.quarantine /opt/homebrew/bin/clickhouse
```

これで`clickhouse`実行ファイルを実行できるようになります：

```shell
clickhouse
```

これにより、次のような出力が得られます：

```bash
次のコマンドのいずれかを使用してください：
clickhouse local [args]
clickhouse client [args]
clickhouse benchmark [args]
...

## ClickHouseを再インストールして問題を修正する {#fix-issue}

Brewには、インストールされたバイナリの隔離を避けるためのコマンドラインオプションがあります。

まず、ClickHouseをアンインストールします：

```shell
brew uninstall clickhouse
```

次に、`--no-quarantine`オプションを使用してClickHouseを再インストールします：

```shell
brew install --no-quarantine clickhouse
```
</VerticalStepper>
