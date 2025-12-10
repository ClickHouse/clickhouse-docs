---
description: 'ClickHouse における PostgreSQL ワイヤプロトコル インターフェイスに関するドキュメント'
sidebar_label: 'PostgreSQL インターフェイス'
sidebar_position: 20
slug: /interfaces/postgresql
title: 'PostgreSQL インターフェイス'
doc_type: 'リファレンス'
---

import CloudNotSupportedBadge from '@theme/badges/CloudNotSupportedBadge';

# PostgreSQL インターフェイス {#postgresql-interface}

<CloudNotSupportedBadge />

ClickHouse は PostgreSQL ワイヤープロトコルをサポートしており、Postgres クライアントを使用して ClickHouse に接続できます。言わば ClickHouse が PostgreSQL インスタンスとして振る舞うことで、ClickHouse がまだ直接サポートしていない PostgreSQL クライアントアプリケーション（たとえば Amazon Redshift）からも ClickHouse へ接続できるようになります。

PostgreSQL ワイヤープロトコルを有効化するには、サーバーの構成ファイルに [postgresql&#95;port](../operations/server-configuration-parameters/settings.md#postgresql_port) 設定を追加します。たとえば、`config.d` ディレクトリ内の新しい XML ファイルでポートを定義できます。

```xml
<clickhouse>
    <postgresql_port>9005</postgresql_port>
</clickhouse>
```

ClickHouse サーバーを起動し、**Listening for PostgreSQL compatibility protocol** という文言を含む、次のようなログメッセージを探します。

```response
{} <Information> Application: PostgreSQL互換プロトコルでリッスン中: 127.0.0.1:9005
```

## psql を ClickHouse に接続する {#connect-psql-to-clickhouse}

次のコマンドは、PostgreSQL クライアント `psql` を ClickHouse に接続する方法を示します。

```bash
psql -p [port] -h [hostname] -U [username] [database_name]
```

例えば：

```bash
psql -p 9005 -h 127.0.0.1 -U alice default
```

:::note
`psql` クライアントではパスワード付きのログインが必須のため、パスワード未設定の `default` ユーザーでは接続できません。`default` ユーザーにパスワードを設定するか、別のユーザーとしてログインしてください。
:::

`psql` クライアントはパスワードの入力を求めます。

```response
ユーザー alice のパスワード:
psql (14.2, server 22.3.1.1)
警告: psql メジャーバージョン 14、サーバーメジャーバージョン 22。
         一部の psql 機能が動作しない可能性があります。
ヘルプを表示するには "help" と入力してください。

default=>
```

以上で完了です。これで PostgreSQL クライアントが ClickHouse に接続され、すべてのコマンドとクエリは ClickHouse 上で実行されます。

:::note
現在、PostgreSQL プロトコルはプレーンテキストのパスワードのみをサポートしています。
:::

## SSL の使用 {#using-ssl}

ClickHouse インスタンスで SSL/TLS が構成されている場合、`postgresql_port` は同じ設定を使用します（このポートは、SSL を利用するクライアントと利用しないクライアントの両方で共有されます）。

各クライアントごとに、SSL を使用した接続方法は異なります。次のコマンドは、証明書と秘密鍵を指定して、`psql` を ClickHouse に安全に接続する方法を示しています。

```bash
psql "port=9005 host=127.0.0.1 user=alice dbname=default sslcert=/path/to/certificate.pem sslkey=/path/to/key.pem sslrootcert=/path/to/rootcert.pem sslmode=verify-ca"
```

## SCRAM-SHA-256 を使用した ClickHouse ユーザー認証の構成 {#using-scram-sha256}

ClickHouse で安全なユーザー認証を行うためには、SCRAM-SHA-256 プロトコルの使用を推奨します。`users.xml` ファイルで `password_scram_sha256_hex` 要素を指定してユーザーを設定します。パスワードハッシュは num&#95;iterations=4096 で生成する必要があります。

接続時に、psql クライアントが SCRAM-SHA-256 をサポートし、この方式で認証をネゴシエートできることを確認してください。

パスワード `abacaba` を持つユーザー `user_with_sha256` の設定例:

```xml
<user_with_sha256>
    <password_scram_sha256_hex>04e7a70338d7af7bb6142fe7e19fef46d9b605f3e78b932a60e8200ef9154976</password_scram_sha256_hex>
</user_with_sha256>
```

SSL 設定の詳細については、[PostgreSQL ドキュメント](https://jdbc.postgresql.org/documentation/head/ssl-client.html)を参照してください。
