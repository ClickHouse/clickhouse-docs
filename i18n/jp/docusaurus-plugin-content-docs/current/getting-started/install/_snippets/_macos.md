import Image from "@theme/IdealImage";
import dev_error from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/dev-verification-error.png";
import privacy_default from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-default-view.png";
import privacy_allow from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-screen-allow-anyway.png";



# HomebrewによるClickHouseのインストール

<VerticalStepper>


## コミュニティ版 Homebrew フォーミュラを使用してインストールする

macOS で [Homebrew](https://brew.sh/) を使用して ClickHouse をインストールするには、
ClickHouse コミュニティの [Homebrew フォーミュラ](https://formulae.brew.sh/cask/clickhouse) を使用できます。

```bash
brew install --cask clickhouse
```


## macOS での開発元検証エラーの解消

`brew` を使用して ClickHouse をインストールした場合、macOS からエラーが表示されることがあります。
デフォルトでは、macOS は確認できない開発元によって作成されたアプリケーションやツールを実行しません。

`clickhouse` コマンドを実行しようとすると、次のようなエラーが表示されることがあります。

<Image img={dev_error} size="sm" alt="MacOS developer verification error dialog" border />

この検証エラーを回避するには、システム設定ウィンドウで該当する設定を変更するか、ターミナルを使用するか、または ClickHouse を再インストールするなどして、いずれかの方法で macOS の隔離領域からアプリを削除する必要があります。

### システム設定での手順

`clickhouse` 実行ファイルを隔離領域から削除する最も簡単な方法は次のとおりです。

1. **システム設定** を開きます。

2. **プライバシーとセキュリティ** に移動します。

   <Image img={privacy_default} size="md" alt="MacOS Privacy & Security settings default view" border />

3. ウィンドウの一番下までスクロールし、「&#95;&quot;clickhouse-macos-aarch64&quot; は、認証済みの開発元によるものではないため、使用がブロックされました。」というメッセージを探します。

4. **それでも開く** をクリックします。

   <Image img={privacy_allow} size="md" alt="MacOS Privacy & Security settings showing Allow Anyway button" border />

5. macOS のユーザーアカウントのパスワードを入力します。

これでターミナルで `clickhouse` コマンドを実行できるようになるはずです。

### ターミナルでの手順

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
ClickHouse
```

次のような出力が得られるはずです:

```bash
以下のいずれかのコマンドを使用します：
clickhouse local [args]
clickhouse client [args]
clickhouse benchmark [args]
```


## ClickHouseを再インストールして問題を修正する {#fix-issue}

Brewには、インストールされたバイナリを隔離対象から除外するコマンドラインオプションがあります。

まず、ClickHouseをアンインストールします:

```shell
brew uninstall clickhouse
```

次に、`--no-quarantine`を指定してClickHouseを再インストールします:

```shell
brew install --no-quarantine clickhouse
```

</VerticalStepper>
