---
description: '允许在指定集群的多个节点上并行处理 Azure Blob 存储中的文件。'
sidebar_label: 'azureBlobStorageCluster'
sidebar_position: 15
slug: /sql-reference/table-functions/azureBlobStorageCluster
title: 'azureBlobStorageCluster'
doc_type: 'reference'
---

# azureBlobStorageCluster 表函数 {#azureblobstoragecluster-table-function}

允许在指定集群中的多个节点上并行处理来自 [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) 的文件。在发起节点上，它会与集群中的所有节点建立连接，展开 S3 文件路径中的星号通配符，并动态分发各个文件。在工作节点上，它向发起节点请求下一个要处理的任务并对其进行处理。该过程会重复进行，直到所有任务处理完毕。
此表函数类似于 [s3Cluster 函数](../../sql-reference/table-functions/s3Cluster.md)。

## 语法 {#syntax}

```sql
azureBlobStorageCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure])
```

## 参数 {#arguments}

| Argument            | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
|---------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`      | 用于构建远程和本地服务器地址集合以及连接参数的集群名称。                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `connection_string` | `storage_account_url` — `connection_string` 包含帐户名称和密钥（[创建连接字符串](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)），也可以仅在此处提供存储帐户 URL，并通过单独的参数提供帐户名称和帐户密钥（参见参数 `account_name` 和 `account_key`）。 | 
| `container_name`    | 容器名称                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
| `blobpath`          | 文件路径。在只读模式下支持以下通配符：`*`、`**`、`?`、`{abc,def}` 和 `{N..M}`，其中 `N`、`M` 为数字，`'abc'`、`'def'` 为字符串。                                                                                                                                                                                                                                                                                                                                                |
| `account_name`      | 如果使用 `storage_account_url`，则可以在此处指定帐户名称。                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `account_key`       | 如果使用 `storage_account_url`，则可以在此处指定帐户密钥。                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `format`            | 文件的[格式](/sql-reference/formats)。                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `compression`       | 支持的取值：`none`、`gzip/gz`、`brotli/br`、`xz/LZMA`、`zstd/zst`。默认情况下，会根据文件扩展名自动检测压缩格式（等同于设置为 `auto`）。                                                                                                                                                                                                                                                                                                                                       |
| `structure`         | 表结构。格式为 `'column1_name column1_type, column2_name column2_type, ...'`。                                                                                                                                                                                                                                                                                                                                                                                             |

## 返回值 {#returned_value}

具有指定结构的表，用于在指定文件中读取或写入数据。

## 示例 {#examples}

与 [AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) 表引擎类似，用户可以使用 Azurite 模拟器在本地进行 Azure 存储开发。更多详情请参见[此处](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)。下面我们假设 Azurite 可通过主机名 `azurite1` 访问。

在 `cluster_simple` 集群的所有节点上，对文件 `test_cluster_*.csv` 执行计数查询：

```sql
SELECT count(*) FROM azureBlobStorageCluster(
        'cluster_simple', 'http://azurite1:10000/devstoreaccount1', 'testcontainer', 'test_cluster_count.csv', 'devstoreaccount1',
        'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==', 'CSV',
        'auto', 'key UInt64')
```

## 使用共享访问签名 (SAS) {#using-shared-access-signatures-sas-sas-tokens}

示例请参见 [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens)。

## 相关内容 {#related}

- [AzureBlobStorage 引擎](../../engines/table-engines/integrations/azureBlobStorage.md)
- [azureBlobStorage 表函数](../../sql-reference/table-functions/azureBlobStorage.md)
