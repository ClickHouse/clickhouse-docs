---
slug: /engines/table-engines/integrations/hudi
sidebar_position: 86
sidebar_label: Hudi
title: "Hudiテーブルエンジン"
description: "このエンジンは、Amazon S3の既存のApache Hudiテーブルとの読み取り専用統合を提供します。"
---

# Hudiテーブルエンジン

このエンジンは、Amazon S3の既存のApache [Hudi](https://hudi.apache.org/)テーブルとの読み取り専用統合を提供します。

## テーブルの作成 {#create-table}

HudiテーブルはすでにS3に存在している必要があります。このコマンドは新しいテーブルを作成するためのDDLパラメータを受け取りません。

``` sql
CREATE TABLE hudi_table
    ENGINE = Hudi(url, [aws_access_key_id, aws_secret_access_key,])
```

**エンジンパラメータ**

- `url` — 既存のHudiテーブルへのパスを含むバケットのURL。
- `aws_access_key_id`, `aws_secret_access_key` - [AWS](https://aws.amazon.com/)アカウントのユーザー向けの長期資格情報。 リクエストの認証に使用できます。このパラメータはオプションです。資格情報が指定されていない場合は、設定ファイルから使用されます。

エンジンパラメータは、[Named Collections](/operations/named-collections.md)を使用して指定できます。

**例**

```sql
CREATE TABLE hudi_table ENGINE=Hudi('http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/test_table/', 'ABC123', 'Abc+123')
```

名前付きコレクションを使用する場合：

``` xml
<clickhouse>
    <named_collections>
        <hudi_conf>
            <url>http://mars-doc-test.s3.amazonaws.com/clickhouse-bucket-3/</url>
            <access_key_id>ABC123<access_key_id>
            <secret_access_key>Abc+123</secret_access_key>
        </hudi_conf>
    </named_collections>
</clickhouse>
```

```sql
CREATE TABLE hudi_table ENGINE=Hudi(hudi_conf, filename = 'test_table')
```

## 関連情報 {#see-also}

- [hudiテーブル関数](/sql-reference/table-functions/hudi.md)
