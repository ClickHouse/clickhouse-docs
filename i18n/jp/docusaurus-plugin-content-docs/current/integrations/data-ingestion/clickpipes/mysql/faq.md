---
sidebar_label: 'FAQ'
description: 'Frequently asked questions about ClickPipes for MySQL.'
slug: '/integrations/clickpipes/mysql/faq'
sidebar_position: 2
title: 'ClickPipes for MySQL FAQ'
---




# ClickPipes for MySQL FAQ

### MySQL ClickPipeはMariaDBをサポートしていますか？ {#does-the-clickpipe-support-mariadb}
はい、MySQL ClickPipeはMariaDB 10.0以降をサポートしています。その設定はMySQLと非常に似ており、GTIDの動作はデフォルトで有効になっています。

### MySQL ClickPipeはPlanetscaleやVitessをサポートしていますか？ {#does-the-clickpipe-support-planetscale-vitess}
現在、標準のMySQLのみをサポートしています。PlanetScaleはVitess上に構築されているため、VitessのVStream APIと統合し、VGtids (Vitess Global Transaction IDs) を処理して増分変更を追跡する必要があります。これは、ネイティブMySQLのCDCの動作とは異なります。この機能のサポートを追加するための作業が進められています。

### MySQLに接続するときにTLS証明書の検証エラーが表示されるのはなぜですか？ {#tls-certificate-validation-error}
`failed to verify certificate: x509: certificate is not valid for any names`のようなエラーが表示された場合、これはMySQLサーバーのSSL/TLS証明書に接続ホスト名（例: EC2インスタンスのDNS名）が有効名のリストに含まれていないときに発生します。ClickPipesはデフォルトでTLSを有効にして、安全な暗号化接続を提供します。

この問題を解決するためには、以下の3つのオプションがあります：

1. 接続設定でホスト名の代わりにIPアドレスを使用し、「TLS Host (optional)」フィールドを空のままにします。この方法は最も簡単ですが、ホスト名の検証をバイパスするため、最も安全な方法ではありません。

2. 「TLS Host (optional)」フィールドを、証明書のSubject Alternative Name (SAN)フィールドにある実際のホスト名と一致させるように設定します。これにより、適切な検証が維持されます。

3. 接続に使用している実際のホスト名を証明書に含めるようにMySQLサーバーのSSL証明書を更新します。

これは特に、クラウド環境にセルフホスティングされているデータベース（またはAWS Private Linkをエンドポイントサービス経由で使用している場合）に接続する際に、パブリックDNS名が証明書に記載のものと異なる場合に一般的な構成上の問題です。
