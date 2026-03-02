---
description: '지정된 클러스터의 여러 노드에서 Azure Blob Storage에 있는 파일을 병렬로 처리할 수 있도록 합니다.'
sidebar_label: 'azureBlobStorageCluster'
sidebar_position: 15
slug: /sql-reference/table-functions/azureBlobStorageCluster
title: 'azureBlobStorageCluster'
doc_type: 'reference'
---



# azureBlobStorageCluster 테이블 함수 \{#azureblobstoragecluster-table-function\}

지정된 클러스터의 여러 노드에서 [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs)의 파일을 병렬로 처리할 수 있도록 합니다. 이니시에이터 노드에서는 클러스터의 모든 노드에 대한 연결을 생성하고, S3 파일 경로의 애스터리스크(*)를 확장한 뒤 각 파일을 동적으로 분배합니다. 워커 노드에서는 다음에 처리할 작업을 이니시에이터에 요청하여 처리합니다. 모든 작업이 완료될 때까지 이 과정이 반복됩니다.
이 테이블 함수는 [s3Cluster 함수](../../sql-reference/table-functions/s3Cluster.md)와 유사합니다.



## 구문 \{#syntax\}

```sql
azureBlobStorageCluster(cluster_name, connection_string|storage_account_url, container_name, blobpath, [account_name, account_key, format, compression, structure])
```


## Arguments \{#arguments\}

| Argument            | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
|---------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `cluster_name`      | 원격 및 로컬 서버에 대한 주소 및 연결 파라미터 집합을 구성하는 데 사용되는 클러스터 이름입니다.                                                                                                                                                                                                                                                                                                                                                                                                 |
| `connection_string` | `storage_account_url` — `connection_string`에는 계정 이름과 키가 포함됩니다([Create connection string](https://learn.microsoft.com/en-us/azure/storage/common/storage-configure-connection-string?toc=%2Fazure%2Fstorage%2Fblobs%2Ftoc.json&bc=%2Fazure%2Fstorage%2Fblobs%2Fbreadcrumb%2Ftoc.json#configure-a-connection-string-for-an-azure-storage-account)). 또는 여기에는 storage account URL을 지정하고, 계정 이름과 계정 키는 별도의 파라미터로 제공할 수도 있습니다(`account_name` 및 `account_key` 파라미터 참조). | 
| `container_name`    | 컨테이너 이름입니다.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
| `blobpath`          | 파일 경로입니다. 읽기 전용 모드에서 다음 와일드카드를 지원합니다: `*`, `**`, `?`, `{abc,def}`, `{N..M}`. 여기서 `N`, `M`은 숫자이고, `'abc'`, `'def'`는 문자열입니다.                                                                                                                                                                                                                                                                                                                                                          |
| `account_name`      | `storage_account_url`을 사용하는 경우, 계정 이름을 여기에서 지정할 수 있습니다.                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `account_key`       | `storage_account_url`을 사용하는 경우, 계정 키를 여기에서 지정할 수 있습니다.                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `format`            | 파일의 [format](/sql-reference/formats)입니다.                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `compression`       | 지원되는 값: `none`, `gzip/gz`, `brotli/br`, `xz/LZMA`, `zstd/zst`. 기본값은 파일 확장자를 기준으로 압축 형식을 자동으로 감지합니다(`auto`로 설정한 것과 동일합니다).                                                                                                                                                                                                                                                                                                                                               |
| `structure`         | 테이블의 구조입니다. 형식: `'column1_name column1_type, column2_name column2_type, ...'`.                                                                                                                                                                                                                                                                                                                                                                                                                    |



## 반환 값 \{#returned_value\}

지정된 파일에서 데이터를 읽거나 쓰기 위해 지정된 구조를 가진 테이블입니다.



## 예시 \{#examples\}

[AzureBlobStorage](/engines/table-engines/integrations/azureBlobStorage) 테이블 엔진과 마찬가지로 Azurite 에뮬레이터를 사용하여 로컬 Azure Storage 개발 환경을 구성할 수 있습니다. 자세한 내용은 [여기](https://learn.microsoft.com/en-us/azure/storage/common/storage-use-azurite?tabs=docker-hub%2Cblob-storage)를 참조하십시오. 아래 예시에서는 Azurite가 호스트 이름 `azurite1`에서 사용 가능하다고 가정합니다.

`cluster_simple` 클러스터의 모든 노드를 사용하여 파일 `test_cluster_*.csv`의 레코드 수를 조회합니다:

```sql
SELECT count(*) FROM azureBlobStorageCluster(
        'cluster_simple', 'http://azurite1:10000/devstoreaccount1', 'testcontainer', 'test_cluster_count.csv', 'devstoreaccount1',
        'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==', 'CSV',
        'auto', 'key UInt64')
```


## Shared Access Signature(SAS) 사용 \{#using-shared-access-signatures-sas-sas-tokens\}

사용 예시는 [azureBlobStorage](/sql-reference/table-functions/azureBlobStorage#using-shared-access-signatures-sas-sas-tokens)를 참조하십시오.



## 관련 항목 \{#related\}

- [AzureBlobStorage 엔진](../../engines/table-engines/integrations/azureBlobStorage.md)
- [azureBlobStorage 테이블 함수](../../sql-reference/table-functions/azureBlobStorage.md)
