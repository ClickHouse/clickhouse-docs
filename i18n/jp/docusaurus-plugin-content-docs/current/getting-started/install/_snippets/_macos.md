import Image from "@theme/IdealImage";
import dev_error from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/dev-verification-error.png";
import privacy_default from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-default-view.png";
import privacy_allow from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-screen-allow-anyway.png";



# HomebrewによるClickHouseのインストール

<VerticalStepper>


## コミュニティのHomebrewフォーミュラを使用したインストール {#install-using-community-homebrew-formula}

[Homebrew](https://brew.sh/)を使用してmacOSにClickHouseをインストールするには、ClickHouseコミュニティの[Homebrewフォーミュラ](https://formulae.brew.sh/cask/clickhouse)を使用できます。

```bash
brew install --cask clickhouse
```


## macOSでの開発者検証エラーの修正 {#fix-developer-verification-error-macos}

`brew`を使用してClickHouseをインストールする場合、macOSからエラーが発生することがあります。
デフォルトでは、macOSは検証できない開発者によって作成されたアプリケーションやツールを実行しません。

`clickhouse`コマンドを実行しようとすると、次のエラーが表示される場合があります:

<Image
  img={dev_error}
  size='sm'
  alt='macOS開発者検証エラーダイアログ'
  border
/>

この検証エラーを回避するには、システム設定ウィンドウで適切な設定を見つけるか、ターミナルを使用するか、ClickHouseを再インストールすることで、macOSの隔離領域からアプリを削除する必要があります。

### システム設定による手順 {#system-settings-process}

隔離領域から`clickhouse`実行ファイルを削除する最も簡単な方法は次のとおりです:

1. **システム設定**を開きます。
1. **プライバシーとセキュリティ**に移動します:

   <Image
     img={privacy_default}
     size='md'
     alt='macOSプライバシーとセキュリティ設定のデフォルト表示'
     border
   />

1. ウィンドウの下部までスクロールして、\_"clickhouse-macos-aarch64"は識別された開発者からのものではないため、使用がブロックされました"というメッセージを見つけます。
1. **このまま許可**をクリックします。

   <Image
     img={privacy_allow}
     size='md'
     alt='このまま許可ボタンが表示されたmacOSプライバシーとセキュリティ設定'
     border
   />

1. macOSユーザーパスワードを入力します。

これで、ターミナルで`clickhouse`コマンドを実行できるようになります。

### ターミナルによる手順 {#terminal-process}

**このまま許可**ボタンを押してもこの問題が解決しない場合があります。その場合は、コマンドラインを使用してこの手順を実行することもできます。
または、単にコマンドラインの使用を好む場合もあるでしょう。

まず、Homebrewが`clickhouse`実行ファイルをインストールした場所を確認します:

```shell
which clickhouse
```

次のような出力が表示されます:

```shell
/opt/homebrew/bin/clickhouse
```

`xattr -d com.apple.quarantine`に続けて前のコマンドで取得したパスを実行して、隔離領域から`clickhouse`を削除します:

```shell
xattr -d com.apple.quarantine /opt/homebrew/bin/clickhouse
```

これで、`clickhouse`実行ファイルを実行できるようになります:

```shell
clickhouse
```

次のような出力が表示されます:

```bash
Use one of the following commands:
clickhouse local [args]
clickhouse client [args]
clickhouse benchmark [args]
```


## ClickHouseを再インストールして問題を修正する {#fix-issue}

Brewには、インストールされたバイナリを隔離しないようにするコマンドラインオプションがあります。

まず、ClickHouseをアンインストールします:

```shell
brew uninstall clickhouse
```

次に、`--no-quarantine`オプションを指定してClickHouseを再インストールします:

```shell
brew install --no-quarantine clickhouse
```

</VerticalStepper>
