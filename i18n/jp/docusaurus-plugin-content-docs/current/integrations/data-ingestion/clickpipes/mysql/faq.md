---
sidebar_label: 'FAQ'
description: 'MySQL 向け ClickPipes に関する FAQ。'
slug: /integrations/clickpipes/mysql/faq
sidebar_position: 2
title: 'MySQL 向け ClickPipes FAQ'
doc_type: 'reference'
keywords: ['MySQL ClickPipes FAQ', 'ClickPipes MySQL トラブルシューティング', 'MySQL ClickHouse レプリケーション', 'ClickPipes MySQL サポート', 'MySQL CDC（変更データキャプチャ） ClickHouse']
integration:
  - support_level: 'core'
  - category: 'clickpipes'
---

# MySQL 用 ClickPipes に関する FAQ \{#clickpipes-for-mysql-faq\}

### MySQL ClickPipe は MariaDB をサポートしていますか？ \{#does-the-clickpipe-support-mariadb\}

はい、MySQL ClickPipe は MariaDB 10.0 以降をサポートしています。構成は MySQL とほぼ同じで、デフォルトで GTID レプリケーションを使用します。

### MySQL ClickPipe は PlanetScale、Vitess、または TiDB をサポートしますか？ \{#does-the-clickpipe-support-planetscale-vitess\}

いいえ、これらは MySQL のバイナリログ（binlog）API をサポートしていません。

### レプリケーションはどのように管理されていますか？ \{#how-is-replication-managed\}

`GTID` と `FilePos` の両方のレプリケーションをサポートしています。Postgres と異なり、オフセットを管理するためのスロットはありません。その代わりに、MySQL サーバー側で十分な binlog の保持期間を設定する必要があります。binlog へのオフセットが無効になった場合（*例: ミラー処理が長時間一時停止された、または `FilePos` レプリケーションを使用中にデータベースのフェイルオーバーが発生した場合*）は、pipe を再同期する必要があります。宛先テーブルに応じて materialized view を最適化してください。非効率なクエリはインジェストを遅くし、保持期間に追従できなくなる可能性があります。

更新頻度の低いデータベースでは、ClickPipes がより新しいオフセットに進めない状態のままログファイルがローテーションされてしまう可能性もあります。定期的に更新を行うハートビート用テーブルをセットアップする必要がある場合があります。

初回ロードの開始時に、開始地点となる binlog のオフセットを記録します。CDC を進めるためには、このオフセットが初回ロード完了時点でも有効である必要があります。大量のデータをインジェストしている場合は、適切な binlog の保持期間を設定してください。テーブルをセットアップする際、大規模なテーブルについては詳細設定の中で *初回ロード用にカスタムのパーティショニングキーを使用する* を有効化することで、単一テーブルを並列にロードでき、初回ロードを高速化できます。

### MySQL に接続するときに TLS 証明書検証エラーが発生するのはなぜですか？ \{#tls-certificate-validation-error\}

MySQL に接続する際、`x509: certificate is not valid for any names` や `x509: certificate signed by unknown authority` のような証明書エラーが発生する場合があります。これは、ClickPipes がデフォルトで TLS による暗号化を有効化しているためです。

これらの問題を解決するには、いくつかの方法があります。

1. **TLS Host フィールドを設定する** - 接続設定で指定しているホスト名が証明書に記載されたホスト名と異なる場合（Endpoint Service 経由の AWS PrivateLink でよく発生します）に使用します。"TLS Host (optional)" を、証明書の Common Name (CN) または Subject Alternative Name (SAN) に記載されている値と一致するように設定します。

2. **Root CA をアップロードする** - 独自の認証局 (Certificate Authority) を使用している MySQL サーバーや、デフォルトのインスタンス単位 CA 構成で動作している Google Cloud SQL に接続する場合に使用します。Google Cloud SQL の証明書にアクセスする方法の詳細については、[このセクション](https://clickhouse.com/docs/integrations/clickpipes/mysql/source/gcp#download-root-ca-certificate-gcp-mysql)を参照してください。

3. **サーバー証明書を適切に構成する** - サーバーの SSL 証明書を更新し、すべての接続ホスト名を SAN などに含めるとともに、信頼された認証局で発行された証明書を使用するようにします。

4. **証明書検証をスキップする** - デフォルト設定で自己署名証明書がプロビジョニングされており、ClickPipes 側で検証できない、自前でホストしている MySQL または MariaDB 向けです（[MySQL](https://dev.mysql.com/doc/refman/8.4/en/creating-ssl-rsa-files-using-mysql.html#creating-ssl-rsa-files-using-mysql-automatic)、[MariaDB](https://mariadb.com/kb/en/securing-connections-for-client-and-server/#enabling-tls-for-mariadb-server)）。この証明書に依存すると、転送中のデータ自体は暗号化されますが、サーバーなりすましのリスクがあります。本番環境では正しく署名された証明書の利用を推奨しますが、このオプションは一時的なインスタンスでのテストや、レガシーインフラへの接続には有用です。

### スキーマ変更には対応していますか？ \{#do-you-support-schema-changes\}

詳細については、[ClickPipes for MySQL: Schema Changes Propagation Support](./schema-changes) ページを参照してください。

### MySQL の外部キーのカスケード削除 `ON DELETE CASCADE` のレプリケーションはサポートしていますか？ \{#support-on-delete-cascade\}

MySQL が[カスケード削除を処理する方法](https://dev.mysql.com/doc/refman/8.0/en/innodb-and-mysql-replication.html)により、これらの削除操作は binlog に書き込まれません。そのため、ClickPipes（や他のあらゆる CDC ツール）でレプリケーションすることはできません。この結果、データの不整合が発生する可能性があります。カスケード削除をサポートする必要がある場合は、代わりにトリガーを使用することを推奨します。

### テーブル名にドットが含まれているとレプリケーションできないのはなぜですか？ \{#replicate-table-dot\}

PeerDB には現在、ソーステーブル識別子（スキーマ名またはテーブル名）にドットが含まれている場合、そのテーブルはレプリケーション対象としてサポートされないという制限があります。これは、PeerDB がドットで分割してスキーマとテーブルを判別する際、どちらがスキーマでどちらがテーブルかを特定できないためです。
この制限を回避するために、スキーマとテーブルを別々に入力できるようにする対応が進められています。

### 最初にレプリケーションから除外したカラムを後から含めることはできますか？ \{#include-excluded-columns\}

これは現時点ではサポートされていません。代替策として、含めたいカラムを含むテーブルを[再同期](./table_resync.md)してください。