import Image from "@theme/IdealImage";
import dev_error from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/dev-verification-error.png";
import privacy_default from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-default-view.png";
import privacy_allow from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-screen-allow-anyway.png";


# 使用 Homebrew 安装 ClickHouse

<VerticalStepper>

## 使用社区 Homebrew 配方进行安装 {#install-using-community-homebrew-formula}

要在 macOS 上使用 [Homebrew](https://brew.sh/) 安装 ClickHouse，您可以使用 ClickHouse 社区提供的 [homebrew 配方](https://formulae.brew.sh/cask/clickhouse)。

```bash
brew install --cask clickhouse
```

## 修复 macOS 中的开发者验证错误 {#fix-developer-verification-error-macos}

如果您使用 `brew` 安装 ClickHouse，您可能会遇到来自 macOS 的错误。
默认情况下，macOS 不会运行由无法验证的开发者创建的应用程序或工具。

当您尝试运行任何 `clickhouse` 命令时，您可能会看到以下错误：

<Image img={dev_error} size="sm" alt="MacOS 开发者验证错误对话框" border />

要解决此验证错误，您需要通过在系统设置窗口中找到相应的设置、使用终端或重新安装 ClickHouse 来从 macOS 的隔离箱中移除该应用。

### 系统设置过程 {#system-settings-process}

从隔离箱中移除 `clickhouse` 可执行文件的最简单方法是：

1. 打开 **系统设置**。
1. 导航到 **隐私与安全**：

    <Image img={privacy_default} size="md" alt="MacOS 隐私与安全设置默认视图" border />

1. 向下滚动到窗口底部，找到一条消息，内容为 _"clickhouse-macos-aarch64" 被阻止使用，因为它不是来自已识别的开发者。
1. 点击 **仍然允许**。

    <Image img={privacy_allow} size="md" alt="MacOS 隐私与安全设置显示仍然允许按钮" border />

1. 输入您的 macOS 用户密码。

您现在应该能够在终端中运行 `clickhouse` 命令。

### 终端过程 {#terminal-process}

有时，按下 `仍然允许` 按钮并不能解决此问题，在这种情况下，您还可以通过命令行执行此过程。
或者您可能更喜欢使用命令行！

首先找出 Homebrew 安装的 `clickhouse` 可执行文件的位置：

```shell
which clickhouse
```

这应该输出类似于以下内容：

```shell
/opt/homebrew/bin/clickhouse
```

通过运行 `xattr -d com.apple.quarantine` 后跟前一个命令中的路径来从隔离箱中移除 `clickhouse`：

```shell
xattr -d com.apple.quarantine /opt/homebrew/bin/clickhouse
```

您现在应该能够运行 `clickhouse` 可执行文件：

```shell
clickhouse
```

这应该输出类似于以下内容：

```bash
Use one of the following commands:
clickhouse local [args]
clickhouse client [args]
clickhouse benchmark [args]
```

## 通过重新安装 ClickHouse 修复问题 {#fix-issue}

Brew 有一个命令行选项，避免在第一时间隔离已安装的二进制文件。

首先，卸载 ClickHouse：

```shell
brew uninstall clickhouse
```

现在使用 `--no-quarantine` 重新安装 ClickHouse：

```shell
brew install --no-quarantine clickhouse
```
</VerticalStepper>
