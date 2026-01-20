import Image from "@theme/IdealImage";
import dev_error from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/dev-verification-error.png";
import privacy_default from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-default-view.png";
import privacy_allow from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-screen-allow-anyway.png";

# Homebrew を使用して ClickHouse をインストールする \{#install-clickhouse-using-homebrew\}

:::warning
Homebrew の Formulae を使用したインストールは非推奨となり、2026-09-01 に無効化される予定です。
代わりに、任意のプラットフォームで動作する [クイックインストール](/install/quick-install-curl) 方法の使用を推奨します。
:::

<VerticalStepper>

## コミュニティ版 Homebrew formula を使用してインストールする \{#install-using-community-homebrew-formula\}

macOS 上で [Homebrew](https://brew.sh/) を使用して ClickHouse をインストールするには、
ClickHouse コミュニティ提供の [homebrew formula](https://formulae.brew.sh/cask/clickhouse) を使用できます。

```bash
brew install --cask clickhouse
```

## macOS での開発元検証エラーの解消 \{#fix-developer-verification-error-macos\}

`brew` を使用して ClickHouse をインストールした場合、macOS からエラーが表示されることがあります。
デフォルトでは、macOS は確認できない開発元によって作成されたアプリケーションやツールを実行しません。

`clickhouse` コマンドを実行しようとすると、次のようなエラーが表示されることがあります。

<Image img={dev_error} size="sm" alt="MacOS developer verification error dialog" border />

この検証エラーを回避するには、システム設定ウィンドウで該当する設定を変更するか、ターミナルを使用するか、または ClickHouse を再インストールするなどして、いずれかの方法で macOS の隔離領域からアプリを削除する必要があります。

### システム設定での手順 \{#system-settings-process\}

`clickhouse` 実行ファイルを隔離領域から削除する最も簡単な方法は次のとおりです。

1. **システム設定** を開きます。
1. **プライバシーとセキュリティ** に移動します。

    <Image img={privacy_default} size="md" alt="MacOS Privacy & Security settings default view" border />

1. ウィンドウの一番下までスクロールし、「&#95;&quot;clickhouse-macos-aarch64&quot; は、認証済みの開発元によるものではないため、使用がブロックされました。」というメッセージを探します。
1. **それでも開く** をクリックします。

    <Image img={privacy_allow} size="md" alt="MacOS Privacy & Security settings showing Allow Anyway button" border />

1. macOS のユーザーアカウントのパスワードを入力します。

これでターミナルで `clickhouse` コマンドを実行できるようになるはずです。

### ターミナルでの手順 \{#terminal-process\}

`Allow Anyway` ボタンを押してもこの問題が解消しない場合は、コマンドラインを使って同じ処理を行うことができます。
あるいは、単にコマンドラインを使う方が好みの場合もあるでしょう。

まず、Homebrew が `clickhouse` 実行ファイルをどこにインストールしたかを確認します。

```shell
which clickhouse
```

次のような結果が出力されます。

```shell
/opt/homebrew/bin/clickhouse
```

前のコマンドで表示されたパスを指定して `xattr -d com.apple.quarantine` を実行し、`clickhouse` を隔離領域から削除します：

```shell
xattr -d com.apple.quarantine /opt/homebrew/bin/clickhouse
```

これで `clickhouse` 実行ファイルを実行できるようになったはずです。

```shell
clickhouse
```

次のような出力が得られるはずです:

```bash
Use one of the following commands:
clickhouse local [args]
clickhouse client [args]
clickhouse benchmark [args]
```

## ClickHouse を再インストールして問題を解消する \{#fix-issue\}

Brew には、インストールされたバイナリを最初から隔離しないためのコマンドラインオプションがあります。

まず、ClickHouse をアンインストールします。

```shell
brew uninstall clickhouse
```

次に、`--no-quarantine` を付けて ClickHouse を再インストールします。

```shell
brew install --no-quarantine clickhouse
```
</VerticalStepper>