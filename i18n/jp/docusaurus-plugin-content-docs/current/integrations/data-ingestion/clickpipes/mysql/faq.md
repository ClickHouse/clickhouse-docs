---
sidebar_label: 'よくある質問'
description: 'MySQL 向け ClickPipes に関するよくある質問。'
slug: /integrations/clickpipes/mysql/faq
sidebar_position: 2
title: 'MySQL 向け ClickPipes FAQ'
---


# MySQL 向け ClickPipes FAQ

### MySQL ClickPipe は MariaDB をサポートしていますか？ {#does-the-clickpipe-support-mariadb}
はい、MySQL ClickPipe は MariaDB 10.0 以上をサポートしています。設定は MySQL と非常に似ており、GTID の動作はデフォルトで有効になっています。

### MySQL ClickPipe は Planetscale や Vitess をサポートしていますか？ {#does-the-clickpipe-support-planetscale-vitess}
現在、標準の MySQL のみをサポートしています。PlanetScale は Vitess 上に構築されているため、Vitess の VStream API と統合し、VGtids（Vitess グローバルトランザクション ID）を使用して増分変更を追跡する必要があります。これは、ネイティブ MySQL の CDC の動作とは異なります。この機能のサポートを追加する作業が進行中です。

### MySQL に接続するときに TLS 証明書の検証エラーが発生するのはなぜですか？ {#tls-certificate-validation-error}
`failed to verify certificate: x509: certificate is not valid for any names` のようなエラーが表示される場合、これは MySQL サーバーの SSL/TLS 証明書に接続先のホスト名（例：EC2 インスタンスの DNS 名）が有効な名前のリストに含まれていないときに発生します。ClickPipes はデフォルトで TLS を有効にして、安全な暗号化接続を提供します。

この問題を解決するためのオプションは 3 つあります：

1. 接続設定でホスト名の代わりに IP アドレスを使用し、「TLS Host (optional)」フィールドを空のままにします。これは最も簡単な解決策ですが、ホスト名の検証をバイパスするため、最も安全ではありません。

2. 「TLS Host (optional)」フィールドを、証明書の Subject Alternative Name (SAN) フィールドにある実際のホスト名と一致させるように設定します。これにより、適切な検証が維持されます。

3. MySQL サーバーの SSL 証明書を更新し、接続に使用している実際のホスト名を証明書に含めます。

これは、特にクラウド環境でセルフホスティングされているデータベース（または AWS Private Link を介してエンドポイントサービスを使用している場合）に接続する際に、MySQL TLS 証明書の一般的な構成問題です。この場合、公開 DNS 名が証明書の内容と異なります。
