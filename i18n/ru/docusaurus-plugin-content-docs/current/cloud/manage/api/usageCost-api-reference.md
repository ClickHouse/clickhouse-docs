---
sidebar_label: 'UsageCost'
title: 'UsageCost'
slug: /cloud/manage/api/usageCost-api-reference
description: 'Документация справочника API Cloud для usageCost'
---

## Получение затрат на использование организации

Возвращает общую сумму и список ежедневных записей о затратах на использование для организации за запрашиваемый период времени (максимум 31 день). Все дни в запросе и ответе оцениваются на основе часового пояса UTC.

| Метод | Путь |
| :----- | :--- |
| GET | `/v1/organizations/{organizationId}/usageCost` |

### Запрос

#### Параметры пути

| Название | Тип | Описание |
| :--- | :--- | :---------- |
| organizationId | uuid | ID запрашиваемой организации. | 
| from_date | date-time | Дата начала отчета, напр. 2024-12-19. | 
| to_date | date-time | Дата окончания (включительно) для отчета, напр. 2024-12-20. Эта дата не может быть больше чем на 30 дней позже от from_date (для максимального запрашиваемого периода в 31 день). | 


### Ответ

#### Схема ответа

| Название | Тип | Описание |
| :--- | :--- | :---------- |
| grandTotalCHC | number | Общая стоимость использования в кредитах ClickHouse (CHC). | 
| costs.dataWarehouseId | uuid | ID хранилища данных, к которому принадлежит эта сущность (или является). | 
| costs.serviceId | uuid | ID сервиса, к которому принадлежит эта сущность (или является). Установите в null для сущностей хранилища данных. | 
| costs.date | date | Дата использования. Дата в формате ISO-8601, основанная на часовом поясе UTC. | 
| costs.entityType | string | Тип сущности. | 
| costs.entityId | uuid | Уникальный ID сущности. | 
| costs.entityName | string | Имя сущности. | 
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
| costs.locked | boolean | Когда true, запись становится неизменяемой. Не заблокированные записи могут изменяться до тех пор, пока не будут заблокированы. | 


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
