---
sidebar_label: 'FAQ'
description: 'ClickPipes for MySQL に関するよくある質問'
slug: /integrations/clickpipes/mysql/faq
sidebar_position: 2
title: 'ClickPipes for MySQL FAQ'
doc_type: 'reference'
keywords: ['MySQL ClickPipes FAQ', 'ClickPipes MySQL トラブルシューティング', 'MySQL ClickHouse レプリケーション', 'ClickPipes MySQL サポート', 'MySQL CDC ClickHouse']
---



# ClickPipes for MySQL FAQ

### MySQL ClickPipeはMariaDBをサポートしていますか？ {#does-the-clickpipe-support-mariadb}

はい、MySQL ClickPipeはMariaDB 10.0以降をサポートしています。設定はMySQLとほぼ同じで、デフォルトでGTIDレプリケーションを使用します。

### MySQL ClickPipeはPlanetScale、Vitess、またはTiDBをサポートしていますか？ {#does-the-clickpipe-support-planetscale-vitess}

いいえ、これらのシステムはMySQLのbinlog APIをサポートしていません。

### レプリケーションはどのように管理されますか？ {#how-is-replication-managed}

`GTID`と`FilePos`の両方のレプリケーション方式をサポートしています。Postgresとは異なり、オフセットを管理するスロットは存在しません。代わりに、MySQLサーバーに十分なbinlog保持期間を設定する必要があります。binlogへのオフセットが無効になった場合（例：ミラーが長時間停止した場合、または`FilePos`レプリケーション使用中にデータベースフェイルオーバーが発生した場合）、パイプを再同期する必要があります。非効率なクエリによって取り込みが遅延し保持期間に追いつけなくなる可能性があるため、宛先テーブルに応じてマテリアライズドビューを最適化してください。

また、非アクティブなデータベースがClickPipesが新しいオフセットに進む前にログファイルをローテーションしてしまう可能性もあります。この場合、定期的に更新されるハートビートテーブルを設定する必要があります。

初期ロードの開始時に、開始するbinlogオフセットを記録します。CDCが進行するためには、初期ロードが完了した時点でこのオフセットが有効である必要があります。大量のデータを取り込む場合は、適切なbinlog保持期間を設定してください。テーブルのセットアップ中に、詳細設定で大きなテーブルに対して「初期ロード用のカスタムパーティショニングキーを使用」を設定することで、単一のテーブルを並列にロードし、初期ロードを高速化できます。

### MySQLへの接続時にTLS証明書検証エラーが発生するのはなぜですか？ {#tls-certificate-validation-error}

MySQLへの接続時に、`x509: certificate is not valid for any names`や`x509: certificate signed by unknown authority`のような証明書エラーが発生する場合があります。これらは、ClickPipesがデフォルトでTLS暗号化を有効にしているために発生します。

これらの問題を解決するには、以下のオプションがあります：

1. **TLS Hostフィールドを設定する** - 接続のホスト名が証明書と異なる場合（Endpoint Service経由のAWS PrivateLinkで一般的）。「TLS Host（オプション）」を証明書のCommon Name（CN）またはSubject Alternative Name（SAN）と一致するように設定します。

2. **ルートCAをアップロードする** - 内部認証局を使用しているMySQLサーバー、またはデフォルトのインスタンスごとのCA設定を使用しているGoogle Cloud SQLの場合。Google Cloud SQLの証明書にアクセスする方法の詳細については、[このセクション](https://clickhouse.com/docs/integrations/clickpipes/mysql/source/gcp#download-root-ca-certificate-gcp-mysql)を参照してください。

3. **サーバー証明書を設定する** - サーバーのSSL証明書を更新して、すべての接続ホスト名を含め、信頼された認証局を使用します。

4. **証明書検証をスキップする** - セルフホスト型のMySQLまたはMariaDBの場合、デフォルト設定では検証できない自己署名証明書が提供されます（[MySQL](https://dev.mysql.com/doc/refman/8.4/en/creating-ssl-rsa-files-using-mysql.html#creating-ssl-rsa-files-using-mysql-automatic)、[MariaDB](https://mariadb.com/kb/en/securing-connections-for-client-and-server/#enabling-tls-for-mariadb-server)）。この証明書を使用すると転送中のデータは暗号化されますが、サーバーのなりすましのリスクがあります。本番環境では適切に署名された証明書を推奨しますが、このオプションは単発のインスタンスでのテストやレガシーインフラストラクチャへの接続に有用です。

### スキーマ変更はサポートされていますか？ {#do-you-support-schema-changes}

詳細については、[ClickPipes for MySQL: スキーマ変更の伝播サポート](./schema-changes)ページを参照してください。

### MySQLの外部キーカスケード削除`ON DELETE CASCADE`のレプリケーションはサポートされていますか？ {#support-on-delete-cascade}

MySQLが[カスケード削除を処理する](https://dev.mysql.com/doc/refman/8.0/en/innodb-and-mysql-replication.html)方法により、カスケード削除はbinlogに書き込まれません。そのため、ClickPipes（または任意のCDCツール）がそれらをレプリケートすることはできません。これはデータの不整合につながる可能性があります。カスケード削除をサポートするには、代わりにトリガーを使用することをお勧めします。

### ドットを含むテーブルをレプリケートできないのはなぜですか？ {#replicate-table-dot}

PeerDBには現在、ソーステーブル識別子（スキーマ名またはテーブル名）にドットが含まれている場合、レプリケーションがサポートされないという制限があります。この場合、PeerDBはドットで分割するため、どれがスキーマでどれがテーブルかを識別できません。
この制限を回避するために、スキーマとテーブルを個別に入力できるようにする取り組みが進められています。
