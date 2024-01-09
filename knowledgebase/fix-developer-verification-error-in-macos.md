---
title: "Fix the developer verification error in MacOS"
date: 2024-01-09
---

# Fix the developer verification error in MacOS

If you install ClickHouse using `brew`, you may encounter an error from MacOS. By default, MacOS will not run applications or tools created by a developer who cannot be verified. When attempting to run any `clickhouse` command, you may see this error:

![MacOS showing a developer verification error.](./images/fix-the-developer-verification-error-in-macos/dev-verification-error.png)

To get around this verification error, you need to remove the app from MacOS' quarintine bin either by finding the appropriate setting in your [System Settings window](#system-settings-process), or [using the terminal](#terminal-process).

## System settings process

The easiest way to remove the `clickhouse` executable from the quarintine bin is to:

1. Open **System settings**.
1. Navigate to **Privacy & Security**:

    ![](./images/fix-the-developer-verification-error-in-macos/privacy-and-security-default.png)

1. Scroll to the bottom of the window to find a message saying _"clickhouse-macos-aarch64" was blocked from use because it is not from an identified developer".
1. Click **Allow Anyway**.

    ![](./images/fix-the-developer-verification-error-in-macos/privacy-and-security-screen-allow-anyway.png)

1. Enter your MacOS user password.

You should now be able to run `clickhouse` commands in your terminal.

## Terminal process

You can perform this process using the command-line:

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

```
Use one of the following commands:
clickhouse local [args]
clickhouse client [args]
clickhouse benchmark [args]
...
```
