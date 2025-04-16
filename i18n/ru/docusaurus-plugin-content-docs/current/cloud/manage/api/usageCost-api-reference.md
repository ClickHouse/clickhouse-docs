---
sidebar_label: 'Стоимость использования'
title: 'Стоимость использования'
slug: /cloud/manage/api/usageCost-api-reference
description: 'Документация справки по API облака для стоимости использования'
---

## Получение затрат на использование организации

Возвращает общую сумму и список записей о ежедневных затратах на использование организации по сущностям за запрашиваемый период времени (максимум 31 день). Все дни как в запросе, так и в ответе оцениваются на основе часового пояса UTC.

| Метод | Путь |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/usageCost` |

### Запрос

#### Параметры пути

| Имя | Тип | Описание |
| :--- | :--- | :---------- |
| organizationId | uuid | ID запрашиваемой организации. | 
| from_date | date-time | Дата начала отчета, например, 2024-12-19. | 
| to_date | date-time | Дата окончания (включительно) отчета, например, 2024-12-20. Эта дата не может быть более чем на 30 дней позже from_date (максимальный запрашиваемый период – 31 день). | 

### Ответ

#### Схема ответа

| Имя | Тип | Описание |
| :--- | :--- | :---------- |
| grandTotalCHC | number | Общая стоимость использования в кредите ClickHouse (CHC). | 
| costs.dataWarehouseId | uuid | ID хранилища данных, к которому принадлежит эта сущность (или является ей). | 
| costs.serviceId | uuid | ID сервиса, к которому принадлежит эта сущность (или является ей). Установлено в null для сущностей хранилища данных. | 
| costs.date | date | Дата использования. Дата в ISO-8601, основанная на часовом поясе UTC. | 
| costs.entityType | string | Тип сущности. | 
| costs.entityId | uuid | Уникальный ID сущности. | 
| costs.entityName | string | Название сущности. | 
| costs.metrics.storageCHC | number | Стоимость хранения в кредитах ClickHouse (CHC). Применяется к сущностям хранилища данных. | 
| costs.metrics.backupCHC | number | Стоимость резервного копирования в кредитах ClickHouse (CHC). Применяется к сущностям хранилища данных. | 
| costs.metrics.computeCHC | number | Стоимость вычислений в кредитах ClickHouse (CHC). Применяется к сущностям сервиса и clickpipe. | 
| costs.metrics.dataTransferCHC | number | Стоимость передачи данных в кредитах ClickHouse (CHC). Применяется к сущностям clickpipe. | 
| costs.metrics.publicDataTransferCHC | number | Стоимость передачи данных в кредитах ClickHouse (CHC). Применяется к сущностям сервиса. | 
| costs.metrics.interRegionTier1DataTransferCHC | number | Стоимость передачи данных между регионами уровня 1 в кредитах ClickHouse (CHC). Применяется к сущностям сервиса. | 
| costs.metrics.interRegionTier2DataTransferCHC | number | Стоимость передачи данных между регионами уровня 2 в кредитах ClickHouse (CHC). Применяется к сущностям сервиса. | 
| costs.metrics.interRegionTier3DataTransferCHC | number | Стоимость передачи данных между регионами уровня 3 в кредитах ClickHouse (CHC). Применяется к сущностям сервиса. | 
| costs.metrics.interRegionTier4DataTransferCHC | number | Стоимость передачи данных между регионами уровня 4 в кредитах ClickHouse (CHC). Применяется к сущностям сервиса. | 
| costs.totalCHC | number | Общая стоимость использования в кредитах ClickHouse (CHC) для этой сущности. | 
| costs.locked | boolean | Если true, запись является неизменяемой. Разблокированные записи могут изменяться, пока не будут заблокированы. | 

#### Пример ответа

```
{
  "grandTotalCHC": 0,
  "costs": {
    "dataWarehouseId": "uuid",
    "serviceId": "uuid",
    "date": "date",
    "entityType": "string",
    "entityId": "uuid",
    "entityName": "string",
    "metrics": {
      "storageCHC": 0,
      "backupCHC": 0,
      "computeCHC": 0,
      "dataTransferCHC": 0,
      "publicDataTransferCHC": 0,
      "interRegionTier1DataTransferCHC": 0,
      "interRegionTier2DataTransferCHC": 0,
      "interRegionTier3DataTransferCHC": 0,
      "interRegionTier4DataTransferCHC": 0
    },
    "totalCHC": 0,
    "locked": "boolean"
  }
}
```
