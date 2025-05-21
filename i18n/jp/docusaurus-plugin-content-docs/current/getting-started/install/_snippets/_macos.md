import Image from "@theme/IdealImage";
import dev_error from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/dev-verification-error.png";
import privacy_default from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-default-view.png";
import privacy_allow from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-screen-allow-anyway.png";

# Homebrewを使用してClickHouseをインストールする

<VerticalStepper>

## コミュニティHomebrewフォーミュラを使用してインストール {#install-using-community-homebrew-formula}

[Homebrew](https://brew.sh/)を使用してmacOSにClickHouseをインストールするには、ClickHouseコミュニティの[homebrew formula](https://formulae.brew.sh/cask/clickhouse)を使用できます。

```bash
brew install --cask clickhouse
```

## MacOSでの開発者認証エラーを修正する {#fix-developer-verification-error-macos}

`brew`を使用してClickHouseをインストールすると、MacOSからエラーが発生することがあります。 デフォルトでは、MacOSは確認できない開発者によって作成されたアプリケーションやツールを実行しません。

`clickhouse`コマンドを実行しようとすると、このようなエラーが表示されることがあります。

<Image img={dev_error} size="sm" alt="MacOS開発者認証エラーのダイアログ" border />

この認証エラーを回避するには、MacOSの隔離ゴミ箱からアプリを削除する必要があります。これには、システム設定ウィンドウの適切な設定を見つける、ターミナルを使用する、またはClickHouseを再インストールする方法があります。

### システム設定プロセス {#system-settings-process}

`clickhouse`実行ファイルを隔離ゴミ箱から削除する最も簡単な方法は次のとおりです。

1. **システム設定**を開きます。
1. **プライバシーとセキュリティ**に移動します：

    <Image img={privacy_default} size="md" alt="MacOSプライバシーとセキュリティ設定のデフォルトビュー" border />

1. ウィンドウの下部までスクロールし、「_clickhouse-macos-aarch64_は確認できない開発者からのため使用をブロックされました」というメッセージを見つけます。
1. **許可する**をクリックします。

    <Image img={privacy_allow} size="md" alt="MacOSプライバシーとセキュリティ設定の許可ボタンの表示" border />

1. MacOSユーザーのパスワードを入力します。

これで、ターミナルで`clickhouse`コマンドを実行できるようになります。

### ターミナルプロセス {#terminal-process}

時には`Allow Anyway`ボタンを押してもこの問題が解決しないことがあります。その場合、コマンドラインを使用してこのプロセスを実行することもできます。また、単にコマンドラインを使用することを好む場合もあるでしょう！

まず、Homebrewが`clickhouse`実行ファイルをどこにインストールしたかを調べます。

```shell
which clickhouse
```

これにより、次のような出力が得られるはずです。

```shell
/opt/homebrew/bin/clickhouse
```

次に、前のコマンドからのパスを使って、`xattr -d com.apple.quarantine`を実行して`clickhouse`を隔離ゴミ箱から削除します。

```shell
xattr -d com.apple.quarantine /opt/homebrew/bin/clickhouse
```

これで`clickhouse`実行可能ファイルを実行できるようになります。

```shell
clickhouse
```

これにより、次のような出力が得られるはずです。

```bash
次のコマンドのいずれかを使用します：
clickhouse local [args]
clickhouse client [args]
clickhouse benchmark [args]
...
```

## ClickHouseを再インストールして問題を修正する {#fix-issue}

Brewには、インストールされたバイナリを最初から隔離しないようにするオプションがあります。

まず、ClickHouseをアンインストールします。

```shell
brew uninstall clickhouse
```

次に、`--no-quarantine`オプションを付けてClickHouseを再インストールします。

```shell
brew install --no-quarantine clickhouse
```
</VerticalStepper>