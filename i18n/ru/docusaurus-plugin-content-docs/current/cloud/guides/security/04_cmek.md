---
sidebar_label: 'Шифрование данных'
slug: /cloud/security/cmek
title: 'Шифрование данных'
description: 'Узнайте подробнее о шифровании данных в ClickHouse Cloud'
doc_type: 'guide'
keywords: ['ClickHouse Cloud', 'шифрование', 'CMEK', 'поллер ключей KMS']
---

import Image from '@theme/IdealImage';
import EnterprisePlanFeatureBadge from '@theme/badges/EnterprisePlanFeatureBadge'
import cmek_performance from '@site/static/images/_snippets/cmek-performance.png';

# Шифрование данных {#data-encryption}

## Шифрование на уровне хранилища {#storage-encryption}

ClickHouse Cloud по умолчанию использует шифрование данных в состоянии покоя с использованием управляемых облачным провайдером ключей AES‑256. Для получения дополнительной информации см.:
- [Серверное шифрование S3 в AWS](https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingServerSideEncryption.html)
- [Шифрование данных в состоянии покоя по умолчанию в GCP](https://cloud.google.com/docs/security/encryption/default-encryption)
- [Шифрование данных в состоянии покоя в службе хранилища Azure](https://learn.microsoft.com/en-us/azure/storage/common/storage-service-encryption)

## Шифрование на уровне базы данных {#database-encryption}

<EnterprisePlanFeatureBadge feature="Enhanced Encryption"/>

Данные в состоянии покоя по умолчанию шифруются с помощью ключей AES‑256, управляемых облачным провайдером. Пользователи могут включить Transparent Data Encryption (TDE), чтобы обеспечить дополнительный уровень защиты служебных данных, или предоставить собственный ключ для использования Customer Managed Encryption Keys (CMEK) для своего сервиса.

Усиленное шифрование в настоящее время доступно в сервисах AWS и GCP. Поддержка Azure появится позже.

### Transparent Data Encryption (TDE) {#transparent-data-encryption-tde}

TDE необходимо включить при создании сервиса. Невозможно зашифровать уже существующие сервисы после их создания. После включения TDE его нельзя отключить. Все данные в сервисе останутся зашифрованными. Если вы хотите отключить TDE после того, как он был включён, необходимо создать новый сервис и перенести в него ваши данные.

1. Выберите `Create new service`
2. Задайте имя сервиса
3. Выберите AWS или GCP как облачного провайдера и нужный регион из выпадающего списка
4. Откройте выпадающий список Enterprise features и включите опцию Enable Transparent Data Encryption (TDE)
5. Нажмите `Create service`

### Customer Managed Encryption Keys (CMEK) {#customer-managed-encryption-keys-cmek}

:::warning
Удаление ключа KMS, используемого для шифрования сервиса ClickHouse Cloud, приведёт к остановке вашего сервиса ClickHouse, а его данные, включая существующие резервные копии, станут невосстановимыми. Чтобы предотвратить случайную потерю данных при ротации ключей, вы можете сохранить старые ключи KMS на некоторый период времени перед их удалением. 
:::

После того как сервис зашифрован с помощью TDE, пользователи могут обновить ключ, чтобы включить CMEK. Сервис будет автоматически перезапущен после обновления настройки TDE. В ходе этого процесса старый ключ KMS расшифровывает ключ шифрования данных (DEK), а новый ключ KMS повторно шифрует DEK. Это гарантирует, что после перезапуска сервис будет использовать новый ключ KMS для последующих операций шифрования. Этот процесс может занять несколько минут.

<details>
    <summary>Включение CMEK с AWS KMS</summary>
    
1. В ClickHouse Cloud выберите зашифрованный сервис
2. Нажмите `Settings` слева
3. Внизу экрана разверните раздел `Network security information`
4. Скопируйте `Encryption role ID` (AWS) или `Encryption Service Account` (GCP) — это потребуется вам на одном из следующих шагов
5. [Создайте ключ KMS для AWS](https://docs.aws.amazon.com/kms/latest/developerguide/create-keys.html)
6. Нажмите на ключ
7. Обновите политику ключа AWS следующим образом:
    
    ```json
    {
        "Sid": "Allow ClickHouse Access",
        "Effect": "Allow",
        "Principal": {
            "AWS": [ "Encryption role ID " ]
        },
        "Action": [
            "kms:Encrypt",
            "kms:Decrypt",
            "kms:ReEncrypt*",
            "kms:DescribeKey"
        ],
        "Resource": "*"
    }
    ```
    
10. Сохраните политику ключа (Key policy)
11. Скопируйте `Key ARN`
12. Вернитесь в ClickHouse Cloud и вставьте `Key ARN` в раздел Transparent Data Encryption в `Service Settings`
13. Сохраните изменения
    
</details>

<details>
    <summary>Включение CMEK с GCP KMS</summary>

1. В ClickHouse Cloud выберите зашифрованный сервис
2. Нажмите `Settings` слева
3. Внизу экрана разверните раздел `Network security information`
4. Скопируйте `Encryption Service Account` (GCP) — это потребуется вам на одном из следующих шагов
5. [Создайте ключ KMS для GCP](https://cloud.google.com/kms/docs/create-key)
6. Нажмите на ключ
7. Предоставьте следующие права аккаунту GCP Encryption Service Account, скопированному на шаге 4 выше:
   - Cloud KMS CryptoKey Encrypter/Decrypter
   - Cloud KMS Viewer
10. Сохраните права для ключа (Key permission)
11. Скопируйте `Key Resource Path`
12. Вернитесь в ClickHouse Cloud и вставьте `Key Resource Path` в раздел Transparent Data Encryption в `Service Settings`
13. Сохраните изменения
    
</details>

#### Ротация ключей {#key-rotation}

После настройки CMEK выполните ротацию ключа, следуя описанным выше процедурам по созданию нового ключа KMS и назначению прав. Вернитесь в настройки сервиса, вставьте новый ARN (AWS) или `Key Resource Path` (GCP) и сохраните настройки. Сервис перезапустится для применения нового ключа.

#### Служба опроса ключей KMS {#kms-key-poller}

При использовании CMEK валидность предоставленного ключа KMS проверяется каждые 10 минут. Если ключ KMS становится недоступным, служба ClickHouse будет остановлена. Чтобы возобновить работу службы, восстановите доступ к ключу KMS, следуя инструкциям в данном руководстве, а затем перезапустите службу.

### Резервное копирование и восстановление {#backup-and-restore}

Резервные копии шифруются тем же ключом, что и связанная служба. При восстановлении зашифрованной резервной копии создаётся зашифрованный экземпляр, который использует тот же ключ KMS, что и исходный экземпляр. При необходимости вы можете выполнить ротацию ключа KMS после восстановления; дополнительные сведения см. в разделе [Ротация ключей](#key-rotation).

## Производительность {#performance}

Шифрование базы данных использует встроенную в ClickHouse [виртуальную файловую систему для шифрования данных](/operations/storing-data#encrypted-virtual-file-system) для шифрования и защиты ваших данных. Для этой функции используется алгоритм `AES_256_CTR`, который, как ожидается, приведёт к снижению производительности на 5–15 % в зависимости от нагрузки:

<Image img={cmek_performance} size="lg" alt="Потеря производительности при использовании CMEK" />
