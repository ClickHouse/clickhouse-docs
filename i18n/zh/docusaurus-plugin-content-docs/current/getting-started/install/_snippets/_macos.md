import Image from "@theme/IdealImage";
import dev_error from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/dev-verification-error.png";
import privacy_default from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-default-view.png";
import privacy_allow from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-screen-allow-anyway.png";

# 使用 Homebrew 安装 ClickHouse {#install-clickhouse-using-homebrew}

<VerticalStepper>

## 使用社区 Homebrew 配方进行安装 {#install-using-community-homebrew-formula}

要在 macOS 上使用 [Homebrew](https://brew.sh/) 安装 ClickHouse，可以使用 ClickHouse 社区提供的 [Homebrew 配方](https://formulae.brew.sh/cask/clickhouse)。

```bash
brew install --cask clickhouse
```

## 在 macOS 中修复开发者验证错误 {#fix-developer-verification-error-macos}

如果你使用 `brew` 安装 ClickHouse，可能会遇到来自 macOS 的错误提示。
默认情况下，macOS 不会运行由无法验证身份的开发者创建的应用程序或工具。

当尝试运行任意 `clickhouse` 命令时，你可能会看到如下错误：

<Image img={dev_error} size="sm" alt="MacOS 开发者验证错误对话框" border />

要绕过此验证错误，你需要将该应用从 macOS 的隔离区中移除，可以通过以下任一方式完成：在系统设置窗口中找到相应设置、使用终端，或者重新安装 ClickHouse。

### 系统设置流程 {#system-settings-process}

将 `clickhouse` 可执行文件从隔离区移除的最简单方式是：

1. 打开 **System Settings**（系统设置）。

2. 进入 **Privacy &amp; Security**（隐私与安全）：

   <Image img={privacy_default} size="md" alt="MacOS 隐私与安全设置的默认视图" border />

3. 滚动到窗口底部，找到一条消息，内容为 &#95;&quot;clickhouse-macos-aarch64&quot; was blocked from use because it is not from an identified developer&quot;（由于“clickhouse-macos-aarch64”不是来自已识别的开发者，因此被阻止使用）。

4. 点击 **Allow Anyway**（仍要允许）。

   <Image img={privacy_allow} size="md" alt="MacOS 隐私与安全设置中显示 Allow Anyway 按钮" border />

5. 输入你的 macOS 用户密码。

现在你应该可以在终端中运行 `clickhouse` 命令了。

### 终端流程 {#terminal-process}

有时点击 `Allow Anyway` 按钮并不能解决该问题，在这种情况下，你也可以通过命令行来完成这一流程。
或者你可能只是更喜欢使用命令行！

首先确定 Homebrew 安装 `clickhouse` 可执行文件的位置：

```shell
which clickhouse
```

应输出类似以下内容：

```shell
/opt/homebrew/bin/clickhouse
```

通过运行 `xattr -d com.apple.quarantine` 命令，并在其后加上上一条命令输出的路径，将 `clickhouse` 从隔离区中移除：

```shell
xattr -d com.apple.quarantine /opt/homebrew/bin/clickhouse
```

现在应该已经可以运行 `clickhouse` 可执行文件：

```shell
ClickHouse
```

应该输出类似下面的内容：

```bash
使用以下命令之一：
clickhouse local [args]
clickhouse client [args]
clickhouse benchmark [args]
```

## 通过重新安装 ClickHouse 来解决此问题 {#fix-issue}

Brew 提供了一个命令行选项,可以在首次安装时避免对二进制文件进行隔离检查。

首先,卸载 ClickHouse:

```shell
brew uninstall clickhouse
```

现在使用 `--no-quarantine` 重新安装 ClickHouse:

```shell
brew install --no-quarantine clickhouse
```

</VerticalStepper>
