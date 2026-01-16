---
sidebar_label: 'FAQ'
description: 'ClickPipes for MySQL に関するよくある質問です。'
slug: /integrations/clickpipes/mysql/faq
sidebar_position: 2
title: 'ClickPipes for MySQL FAQ（よくある質問）'
doc_type: 'reference'
keywords: ['MySQL ClickPipes FAQ', 'ClickPipes MySQL のトラブルシューティング', 'MySQL から ClickHouse へのレプリケーション', 'ClickPipes MySQL のサポート', 'MySQL CDC ClickHouse']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# MySQL 向け ClickPipes FAQ \\{#clickpipes-for-mysql-faq\\}

### MySQL ClickPipe は MariaDB をサポートしていますか？  \\{#does-the-clickpipe-support-mariadb\\}

はい、MySQL ClickPipe は MariaDB 10.0 以上をサポートしています。設定は MySQL と非常によく似ており、デフォルトで GTID レプリケーションを使用します。

### MySQL ClickPipe は PlanetScale、Vitess、または TiDB をサポートしていますか？ \\{#does-the-clickpipe-support-planetscale-vitess\\}

いいえ。これらのサービスは MySQL の binlog API をサポートしていません。

### レプリケーションはどのように管理されますか？ \\{#how-is-replication-managed\\}

`GTID` と `FilePos` の両方のレプリケーションをサポートしています。Postgres と異なり、オフセットを管理するスロットはありません。その代わりに、MySQL サーバーで十分な binlog の保持期間を設定する必要があります。binlog へのオフセットが無効になった場合（*例: ミラーが長時間一時停止された、または `FilePos` レプリケーション使用中にデータベースフェイルオーバーが発生した*）は、パイプを再同期する必要があります。宛先テーブルに応じてマテリアライズドビューを最適化してください。非効率なクエリはインジェストを遅くし、保持期間に追いつけなくなる可能性があります。

アクティブでないデータベースが、ClickPipes がより新しいオフセットに進む前にログファイルをローテーションしてしまう可能性もあります。その場合は、定期的に更新されるハートビートテーブルを設定する必要があるかもしれません。

初回ロードの開始時に、開始に使用する binlog オフセットを記録します。CDC が継続して進行するためには、初回ロードが完了する時点でもこのオフセットが有効である必要があります。大量のデータをインジェストしている場合は、適切な binlog 保持期間を設定してください。テーブルをセットアップする際、大きなテーブルについては詳細設定の *Use a custom partitioning key for initial load* を構成することで、単一テーブルを並列にロードでき、初回ロードを高速化できます。

### MySQL への接続時に TLS 証明書検証エラーが発生するのはなぜですか？ \\{#tls-certificate-validation-error\\}

MySQL に接続する際、`x509: certificate is not valid for any names` や `x509: certificate signed by unknown authority` といった証明書エラーが発生することがあります。これは、ClickPipes がデフォルトで TLS 暗号化を有効にしているために発生します。

これらの問題を解決するには、次のいずれかの方法を使用できます。

1. **TLS Host フィールドを設定する** - 接続で使用するホスト名が証明書と異なる場合（Endpoint Service 経由の AWS PrivateLink などで一般的です）は、「TLS Host (optional)」を証明書の Common Name (CN) または Subject Alternative Name (SAN) と一致する値に設定します。

2. **Root CA をアップロードする** - 内部認証局 (Certificate Authority) や、デフォルトのインスタンス単位 CA 構成の Google Cloud SQL を使用している MySQL サーバー向けです。Google Cloud SQL の証明書へのアクセス方法については、[このセクション](https://clickhouse.com/docs/integrations/clickpipes/mysql/source/gcp#download-root-ca-certificate-gcp-mysql) を参照してください。

3. **サーバー証明書を構成する** - サーバーの SSL 証明書を更新して、すべての接続ホスト名を含め、信頼された認証局を使用するようにします。

4. **証明書検証をスキップする** - デフォルト構成で自己署名証明書が払い出され、ClickPipes から検証できないセルフホスト MySQL または MariaDB 向けです（[MySQL](https://dev.mysql.com/doc/refman/8.4/en/creating-ssl-rsa-files-using-mysql.html#creating-ssl-rsa-files-using-mysql-automatic)、[MariaDB](https://mariadb.com/kb/en/securing-connections-for-client-and-server/#enabling-tls-for-mariadb-server)）。この証明書に依存すると、転送中のデータは暗号化されますが、サーバーなりすましのリスクがあります。本番環境では適切に署名された証明書の使用を推奨しますが、このオプションは単発のインスタンスでのテストやレガシーインフラへの接続に有用です。

### スキーマ変更はサポートされていますか？ \\{#do-you-support-schema-changes\\}

詳細については、[ClickPipes for MySQL: Schema Changes Propagation Support](./schema-changes) ページを参照してください。

### MySQL の外部キーのカスケード削除 `ON DELETE CASCADE` のレプリケーションはサポートされていますか？ \\{#support-on-delete-cascade\\}

MySQL の[カスケード削除の扱い](https://dev.mysql.com/doc/refman/8.0/en/innodb-and-mysql-replication.html)により、これらは binlog に書き込まれません。そのため、ClickPipes（または任意の CDC ツール）でレプリケーションすることはできません。これにより不整合なデータが発生する可能性があります。カスケード削除をサポートするには、代わりにトリガーを使用することを推奨します。

### ドットを含むテーブルをレプリケートできないのはなぜですか？ \\{#replicate-table-dot\\}

PeerDB には現在、ソーステーブル識別子（スキーマ名またはテーブル名）の中にドットが含まれている場合、そのレプリケーションをサポートしないという制限があります。これは、PeerDB がドットで分割する際に、どれがスキーマでどれがテーブルかを識別できないためです。
この制限を回避できるよう、スキーマとテーブルを別々に入力できるようにする取り組みが進められています。

### レプリケーションから最初に除外したカラムを後から含めることはできますか？ \\{#include-excluded-columns\\}

これはまだサポートされていません。代替手段としては、対象のカラムを含めたい[テーブルを再同期する](./table_resync.md)方法があります。