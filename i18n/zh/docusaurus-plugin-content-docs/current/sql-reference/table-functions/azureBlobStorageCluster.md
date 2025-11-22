---
description: '允许在指定集群中的多个节点上并行处理 Azure Blob 存储中的文件。'
sidebar_label: 'azureBlobStorageCluster'
sidebar_position: 15
slug: /sql-reference/table-functions/azureBlobStorageCluster
title: 'azureBlobStorageCluster'
doc_type: 'reference'
---



# azureBlobStorageCluster 表函数

允许在指定集群的多个节点上并行处理来自 [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) 的文件。在发起节点上，它会与集群中所有节点建立连接，展开 S3 文件路径中的星号通配符，并动态分发每个文件。在工作节点上，它向发起节点请求下一个要处理的任务并进行处理。此过程会重复，直到所有任务完成。
此表函数与 [s3Cluster 函数](../../sql-reference/table-functions/s3Cluster.md) 类似。



## 语法 {#syntax}

```sql
azureBlobStorageCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure])
```


## 参数 {#arguments}

| 参数            | 描述                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cluster_name`      | 集群名称,用于构建远程和本地服务器的地址集及连接参数。                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `connection_string` | storage_account_url` — connection_string 包含账户名称和密钥([创建连接字符串](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)),或者您也可以在此处提供存储账户 URL,并将账户名称和账户密钥作为单独的参数提供(参见参数 account_name 和 account_key) |
| `container_name`    | 容器名称                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `blobpath`          | 文件路径。在只读模式下支持以下通配符:`*`、`**`、`?`、`{abc,def}` 和 `{N..M}`,其中 `N`、`M` 为数字,`'abc'`、`'def'` 为字符串。                                                                                                                                                                                                                                                                                                                                          |
| `account_name`      | 如果使用 storage_account_url,则可以在此处指定账户名称                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `account_key`       | 如果使用 storage_account_url,则可以在此处指定账户密钥                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `format`            | 文件的[格式](/sql-reference/formats)。                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `compression`       | 支持的值:`none`、`gzip/gz`、`brotli/br`、`xz/LZMA`、`zstd/zst`。默认情况下,将根据文件扩展名自动检测压缩方式(与设置为 `auto` 相同)。                                                                                                                                                                                                                                                                                                                                               |
| `structure`         | 表结构。格式为 `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                                                                                                                                                                                                                                     |


## 返回值 {#returned_value}

返回一个具有指定结构的表，用于在指定文件中读取或写入数据。


## 示例 {#examples}

与 [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) 表引擎类似,用户可以使用 Azurite 模拟器进行本地 Azure Storage 开发。更多详细信息请参见[此处](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)。以下示例假设 Azurite 可通过主机名 `azurite1` 访问。

使用 `cluster_simple` 集群中的所有节点查询文件 `test_cluster_*.csv` 的行数:

```sql
SELECT count(*) FROM azureBlobStorageCluster(
        'cluster_simple', 'http://azurite1:10000/devstoreaccount1', 'testcontainer', 'test_cluster_count.csv', 'devstoreaccount1',
        'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==', 'CSV',
        'auto', 'key UInt64')
```


## 使用共享访问签名 (SAS) {#using-shared-access-signatures-sas-sas-tokens}

有关示例,请参阅 [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens)。


## 相关内容 {#related}

- [AzureBlobStorage 引擎](../../engines/table-engines/integrations/azureBlobStorage.md)
- [azureBlobStorage 表函数](../../sql-reference/table-functions/azureBlobStorage.md)
