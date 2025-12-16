---
slug: /guides/sre/configuring-tls-acme-client
sidebar_label: 'ACME を使用した自動 TLS プロビジョニングの構成'
sidebar_position: 20
title: 'ACME クライアントの構成'
description: 'このガイドでは、ClickHouse で接続の検証に OpenSSL 証明書を使用できるようにするための、シンプルで最小限の設定方法について説明します。'
keywords: ['ACME の構成', 'TLS のセットアップ', 'OpenSSL 証明書', '安全な接続', 'SRE 向けガイド', "Let's Encrypt"]
doc_type: 'guide'
---

import SelfManaged from '@site/i18n/jp/docusaurus-plugin-content-docs/current/_snippets/_self_managed_only_automated.md';
import configuringSsl01 from '@site/static/images/guides/sre/configuring-ssl_01.png';
import Image from '@theme/IdealImage';
import ExperimentalBadge from '@theme/badges/ExperimentalBadge';


# ACME を利用した自動 TLS プロビジョニングの設定 {#configuring-automatic-tls-provisioning-via-acme}

<ExperimentalBadge/>

<SelfManaged />

このガイドでは、[RFC8555](https://www.rfc-editor.org/rfc/rfc8555) で定義されている [ACME](https://en.wikipedia.org/wiki/Automatic_Certificate_Management_Environment) プロトコルを ClickHouse で利用するための設定方法を説明します。
ACME をサポートすることで、ClickHouse は [Let's Encrypt](https://letsencrypt.org/) や [ZeroSSL](https://zerossl.com/) などのプロバイダから証明書を自動的に取得および更新できます。
TLS による暗号化は、クライアントと ClickHouse サーバー間で転送されるデータを保護し、機密性の高いクエリや結果の盗聴を防ぎます。

## 概要 {#overview}

ACME プロトコルは、[Let&#39;s Encrypt](https://letsencrypt.org/) や [ZeroSSL](https://zerossl.com/) のようなサービスを用いて証明書を自動取得・更新するプロセスを定義します。簡単に言えば、証明書要求者である ClickHouse は、証明書を取得するために、あらかじめ定義されたチャレンジ方式を通じてドメイン所有権を証明する必要があります。

ACME を有効にするには、`acme` ブロックとともに HTTP および HTTPS ポートを設定します。

```xml
<http_port>80</http_port>
<https_port>443</https_port>

<acme>
    <email>valid_email@example.com</email>
    <terms_of_service_agreed>true</terms_of_service_agreed>
    <domains>
        <domain>example.com</domain>
    </domains>
</acme>
```

HTTP ポートは、ドメイン検証中に ACME の `HTTP-01` チャレンジ要求（チャレンジの種類については[こちら](https://letsencrypt.org/docs/challenge-types/)を参照）を処理します。検証が完了して証明書が発行されると、HTTPS ポートが取得した証明書を使用して暗号化されたトラフィックを処理します。

HTTP ポートはサーバー上で必ずしも 80 である必要はなく、`nftables` などのツールを使用してポート番号を付け替えることができます。`HTTP-01` チャレンジで許可されるポートについては、利用している ACME プロバイダーのドキュメントを確認してください。

`acme` ブロックでは、アカウント作成用の `email` を定義し、ACME サービス利用規約に同意します。
その後に必要なのは、ドメインのリストだけです。


### 現在の制限事項 {#current-limitations}

- `HTTP-01` チャレンジタイプのみサポートされています。
- `RSA 2048` キーのみサポートされています。
- レート制限は考慮されません。

## 設定パラメータ {#configuration-parameters}

`acme` セクションで利用可能な設定オプション:

| Parameter                             | Default value | Description |
|--------------------------------------|---------------|-------------|
| `zookeeper_path`                     | `/clickhouse/acme`   | ACME アカウントデータ、証明書、および ClickHouse ノード間の調整状態を保存するために使用される ZooKeeper のパス。 |
| `directory_url`                      | `https://acme-v02.api.letsencrypt.org/directory` | 証明書発行に使用される ACME ディレクトリのエンドポイント。デフォルトでは Let’s Encrypt の本番サーバーが使用される。 |
| `email`                              |               | ACME アカウントの作成と管理に使用されるメールアドレス。ACME プロバイダーは有効期限通知や重要な更新のためにこのアドレスを使用する場合がある。 |
| `terms_of_service_agreed`            | `false`       | ACME プロバイダーの利用規約に同意しているかどうかを示す。ACME を有効化するには `true` に設定する必要がある。 |
| `domains`                            |               | TLS 証明書を発行すべきドメイン名の一覧。各ドメインは `<domain>` エントリとして指定する。 |
| `refresh_certificates_before`        | `2592000` (1 か月、秒単位)         | 証明書の有効期限切れ前に、ClickHouse が証明書の更新を試行するタイミング。 |
| `refresh_certificates_task_interval` | `3600` (1 時間、秒単位)           | ClickHouse が証明書の更新が必要かどうかをチェックする間隔。 |

設定では、デフォルトで Let’s Encrypt の本番ディレクトリを使用する点に注意してください。誤設定によりリクエスト QUOTA の上限に達することを避けるため、まずは [staging directory](https://letsencrypt.org/docs/staging-environment/)（ステージングディレクトリ）を用いて証明書発行プロセスをテストすることを推奨する。

# 管理 {#administration}

## 初期デプロイメント {#initial-deployment}

複数のレプリカを持つクラスタで ACME クライアントを有効化する場合、初回の証明書発行時には追加の考慮が必要です。

ACME を有効化して起動した最初のレプリカは、直ちに ACME オーダーの作成と HTTP-01 チャレンジ検証を試みます。その時点で一部のレプリカのみがトラフィックを処理している場合、他のレプリカが検証リクエストに応答できないため、チャレンジは失敗する可能性が高くなります。

可能であれば、一時的にトラフィックを単一のレプリカにルーティングし（たとえば DNS レコードを調整することにより）、そのレプリカが初回の証明書発行を完了できるようにすることを推奨します。証明書が正常に発行され Keeper に保存されたら、残りのレプリカで ACME を有効化できます。これらのレプリカは既存の証明書を自動的に再利用し、以後の更新処理に参加します。

トラフィックを単一のレプリカにルーティングすることが現実的でない場合の代替手段として、ACME クライアントを有効化する前に、既存の証明書と秘密鍵を手動で Keeper にアップロードする方法があります。これにより初回の検証プロセスを回避でき、すべてのレプリカがすでに有効な証明書を保持した状態で起動できます。

初回の証明書が発行またはインポートされた後は、すべてのレプリカが ACME クライアントを実行し Keeper を通じて状態を共有しているため、証明書の更新に特別な対応は不要です。

## Keeper のデータ構造 {#keeper-data-structure}

```text
/clickhouse/acme
└── <acme-directory-host>
    ├── account_private_key          # ACME account private key (PEM)
    ├── challenges                   # Active HTTP-01 challenge state
    └── domains
        └── <domain-name>
            ├── certificate          # Issued TLS certificate (PEM)
            └── private_key          # Domain private key (PEM)
```


## 他の ACME クライアントからの移行 {#migrating-from-other-acme-clients}

現在使用中の TLS 証明書と鍵を Keeper に取り込むことで、移行を容易にできます。
現時点では、サーバーは `RSA 2048` 鍵のみをサポートしています。

`certbot` から移行し、`/etc/letsencrypt/live` ディレクトリを使用していると仮定すると、次の一連のコマンドを使用できます。

```bash
DOMAIN=example.com
CERT_DIR=/etc/letsencrypt/live/$DOMAIN
ZK_BASE=/clickhouse/acme/acme-v02.api.letsencrypt.org/domains/$DOMAIN

clickhouse keeper-client -q "create '/clickhouse' ''"
clickhouse keeper-client -q "create '/clickhouse/acme' ''"
clickhouse keeper-client -q "create '/clickhouse/acme/acme-v02.api.letsencrypt.org' ''"
clickhouse keeper-client -q "create '/clickhouse/acme/acme-v02.api.letsencrypt.org/domains' ''"
clickhouse keeper-client -q "create '$ZK_BASE' ''"

clickhouse keeper-client -q "create '$ZK_BASE/certificate' \"$(cat $CERT_DIR/fullchain.pem)\""
clickhouse keeper-client -q "set '$ZK_BASE/certificate' \"$(cat $CERT_DIR/fullchain.pem)\""

clickhouse keeper-client -q "create '$ZK_BASE/private_key' \"$(cat $CERT_DIR/privkey.pem)\""
clickhouse keeper-client -q "set '$ZK_BASE/private_key' \"$(cat $CERT_DIR/privkey.pem)\""
```
