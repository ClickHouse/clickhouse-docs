import Image from "@theme/IdealImage";
import dev_error from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/dev-verification-error.png";
import privacy_default from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-default-view.png";
import privacy_allow from "@site/static/images/knowledgebase/fix-the-developer-verification-error-in-macos/privacy-and-security-screen-allow-anyway.png";

# Install ClickHouse using Homebrew

<VerticalStepper>

## Install using the community Homebrew formula {#install-using-community-homebrew-formula}

To install ClickHouse on macOS using [Homebrew](https://brew.sh/), you can use
the ClickHouse community [homebrew formula](https://formulae.brew.sh/cask/clickhouse).

```bash
brew install --cask clickhouse
```

## Fix the developer verification error in macOS {#fix-developer-verification-error-macos}

If you install ClickHouse using `brew`, you may encounter an error from MacOS.
By default, MacOS will not run applications or tools created by a developer who cannot be verified.

When attempting to run any `clickhouse` command, you may see this error:

<Image img={dev_error} size="sm" alt="MacOS developer verification error dialog" border />

To get around this verification error, you need to remove the app from MacOS' quarantine bin either by finding the appropriate setting in your System Settings window, using the terminal, or by re-installing ClickHouse.

### System settings process {#system-settings-process}

The easiest way to remove the `clickhouse` executable from the quarantine bin is to:

1. Open **System settings**.
1. Navigate to **Privacy & Security**:

    <Image img={privacy_default} size="md" alt="MacOS Privacy & Security settings default view" border />

1. Scroll to the bottom of the window to find a message saying _"clickhouse-macos-aarch64" was blocked from use because it is not from an identified developer".
1. Click **Allow Anyway**.

    <Image img={privacy_allow} size="md" alt="MacOS Privacy & Security settings showing Allow Anyway button" border />

1. Enter your MacOS user password.

You should now be able to run `clickhouse` commands in your terminal.

### Terminal process {#terminal-process}

Sometimes pressing the `Allow Anyway` button doesn't doesn't fix this issue, in which case you can also perform this process using the command-line.
Or you might just prefer using the command line!

First find out where Homebrew installed the `clickhouse` executable:

```shell
which clickhouse
```

This should output something like:

```shell
/opt/homebrew/bin/clickhouse
```

Remove `clickhouse` from the quarantine bin by running `xattr -d com.apple.quarantine` following by the path from the previous command:

```shell
xattr -d com.apple.quarantine /opt/homebrew/bin/clickhouse
```

You should now be able to run the `clickhouse` executable:

```shell
clickhouse
```

This should output something like:

```bash
Use one of the following commands:
clickhouse local [args]
clickhouse client [args]
clickhouse benchmark [args]
...

## Fix the issue by reinstalling ClickHouse {#fix-issue}

Brew has a command-line option which avoids quarantining installed binaries in the first place.

First, uninstall ClickHouse:

```shell
brew uninstall clickhouse
```

Now reinstall ClickHouse with `--no-quarantine`:

```shell
brew install --no-quarantine clickhouse
```
</VerticalStepper>
