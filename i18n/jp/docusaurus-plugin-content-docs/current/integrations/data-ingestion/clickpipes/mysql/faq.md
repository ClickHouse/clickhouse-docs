---
'sidebar_label': 'FAQ'
'description': 'MySQLに関するClickPipesについてのよくある質問。'
'slug': '/integrations/clickpipes/mysql/faq'
'sidebar_position': 2
'title': 'ClickPipes for MySQL FAQ'
'doc_type': 'reference'
---



# ClickPipes for MySQL FAQ

### Does the MySQL ClickPipe support MariaDB?  {#does-the-clickpipe-support-mariadb}
はい、MySQL ClickPipeはMariaDB 10.0以降をサポートしています。その構成はMySQLと非常に似ており、デフォルトでGTIDレプリケーションを使用します。

### Does the MySQL ClickPipe support PlanetScale, Vitess, or TiDB? {#does-the-clickpipe-support-planetscale-vitess}
いいえ、これらはMySQLのbinlog APIをサポートしていません。

### How is replication managed? {#how-is-replication-managed}
私たちは`GTID`および`FilePos`レプリケーションの両方をサポートしています。Postgresとは異なり、オフセットを管理するスロットはありません。その代わりに、MySQLサーバーのbinlog保持期間を十分に設定する必要があります。もし私たちのbinlogへのオフセットが無効になると *(例: ミラーが長時間停止した、または`FilePos`レプリケーションを使用中にデータベースのフェイルオーバーが発生した)*、パイプを再同期する必要があります。効率の悪いクエリは取り込みを遅らせ、保持期間に遅れをもたらす可能性があるため、宛先テーブルに応じてマテリアライズドビューを最適化することを忘れないでください。

無効なデータベースがClickPipesを最近のオフセットに進めないままログファイルをローテーションさせることも可能です。定期的に更新されるハートビートテーブルを設定する必要があるかもしれません。

初期ロードの開始時に開始するbinlogオフセットを記録します。このオフセットは、初期ロードが完了するときにも有効でなければならず、そうでないとCDCが進行しません。大量のデータを取り込む場合は、適切なbinlog保持期間を設定してください。テーブルを設定する際には、*初期ロードのためのカスタムパーティショニングキーを使用*を大規模テーブルの高度な設定で構成することで、単一のテーブルを並行して読み込むことにより初期ロードを迅速化できます。

### Why am I getting a TLS certificate validation error when connecting to MySQL? {#tls-certificate-validation-error}

MySQLに接続するときに、`x509: certificate is not valid for any names`や`x509: certificate signed by unknown authority`といった証明書エラーが発生することがあります。これはClickPipesがデフォルトでTLS暗号化を有効にしているために発生します。

これらの問題を解決するためのいくつかのオプションがあります：

1. **TLS Hostフィールドを設定する** - 接続時のホスト名が証明書と異なる場合（AWS PrivateLinkを通じたエンドポイントサービスで一般的）。TLS Host（オプション）を証明書の共通名（CN）または代替名（SAN）に一致させるように設定します。

2. **Root CAをアップロードする** - 内部認証機関やGoogle Cloud SQLのデフォルトのインスタンスごとのCA構成を使用しているMySQLサーバーの場合。Google Cloud SQLの証明書にアクセスする方法についての詳細は、[このセクション](https://clickhouse.com/docs/integrations/clickpipes/mysql/source/gcp#download-root-ca-certificate-gcp-mysql)を参照してください。

3. **サーバー証明書を構成する** - すべての接続ホスト名を含むようにサーバーのSSL証明書を更新し、信頼できる認証機関を使用します。

4. **証明書の検証をスキップする** - デフォルトの構成で自己署名証明書を提供するセルフホストされたMySQLまたはMariaDBの場合（[MySQL](https://dev.mysql.com/doc/refman/8.4/en/creating-ssl-rsa-files-using-mysql.html#creating-ssl-rsa-files-using-mysql-automatic)、[MariaDB](https://mariadb.com/kb/en/securing-connections-for-client-and-server/#enabling-tls-for-mariadb-server)）。この証明書に依存するとデータが転送中に暗号化されますが、サーバーのなりすましのリスクがあります。プロダクション環境では適切に署名された証明書を推奨しますが、このオプションはテスト環境やレガシーインフラへの接続に役立ちます。

### Do you support schema changes? {#do-you-support-schema-changes}

スキーマ変更の伝播サポートについての詳細は、[ClickPipes for MySQL: Schema Changes Propagation Support](./schema-changes)ページを参照してください。

### Do you support replicating MySQL foreign key cascading deletes `ON DELETE CASCADE`? {#support-on-delete-cascade}

MySQLが[カスケード削除を操作する方法](https://dev.mysql.com/doc/refman/8.0/en/innodb-and-mysql-replication.html)のため、これらはbinlogに書き込まれません。したがって、ClickPipes（または他のCDCツール）がそれらを複製することは不可能です。これにより、一貫性のないデータが生じる可能性があります。カスケード削除をサポートするためにはトリガーの使用をお勧めします。

### Why can I not replicate my table which has a dot in it? {#replicate-table-dot}
PeerDBには現在、ソーステーブル識別子 - つまりスキーマ名またはテーブル名のいずれか - にピリオドが含まれている場合、PeerDBが分割するため、どの部分がスキーマでどの部分がテーブルであるかを判断できないという制限があります。この制限を回避するために、スキーマとテーブルを別々に入力できるようにする努力がなされています。
