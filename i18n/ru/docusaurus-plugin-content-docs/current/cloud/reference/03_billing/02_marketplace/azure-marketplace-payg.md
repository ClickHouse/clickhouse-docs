---
slug: /cloud/billing/marketplace/azure-marketplace-payg
title: 'Azure Marketplace PAYG'
description: 'Подписка на ClickHouse Cloud через Azure Marketplace (PAYG).'
keywords: ['azure', 'marketplace', 'billing', 'PAYG']
doc_type: 'guide'
---

import Image from '@theme/IdealImage';
import azure_marketplace_payg_1 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-1.png';
import azure_marketplace_payg_2 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-2.png';
import azure_marketplace_payg_3 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-3.png';
import azure_marketplace_payg_4 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-4.png';
import azure_marketplace_payg_5 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-5.png';
import azure_marketplace_payg_6 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-6.png';
import azure_marketplace_payg_7 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-7.png';
import azure_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-8.png';
import azure_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-9.png';
import azure_marketplace_payg_10 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-10.png';
import aws_marketplace_payg_8 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-8.png';
import aws_marketplace_payg_9 from '@site/static/images/cloud/manage/billing/marketplace/aws-marketplace-payg-9.png';
import azure_marketplace_payg_11 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-11.png';
import azure_marketplace_payg_12 from '@site/static/images/cloud/manage/billing/marketplace/azure-marketplace-payg-12.png';

Начните работу с ClickHouse Cloud в [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) с помощью публичного предложения PAYG (Pay-as-you-go).


## Предварительные требования {#prerequisites}

- Проект Azure с правами на совершение покупок, предоставленными вашим администратором биллинга.
- Для подписки на ClickHouse Cloud в Azure Marketplace необходимо войти в систему с учетной записью, имеющей права на совершение покупок, и выбрать соответствующий проект.

1. Перейдите в [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) и найдите ClickHouse Cloud. Убедитесь, что вы вошли в систему, чтобы иметь возможность приобрести предложение на маркетплейсе.

<br />

<Image
  img={azure_marketplace_payg_1}
  size='md'
  alt='Форма регистрации ClickHouse Cloud'
  border
/>

<br />

2. На странице описания продукта нажмите **Get It Now**.

<br />

<Image
  img={azure_marketplace_payg_2}
  size='md'
  alt='Форма регистрации ClickHouse Cloud'
  border
/>

<br />

3. На следующем экране необходимо указать имя, адрес электронной почты и информацию о местоположении.

<br />

<Image
  img={azure_marketplace_payg_3}
  size='md'
  alt='Форма регистрации ClickHouse Cloud'
  border
/>

<br />

4. На следующем экране нажмите **Subscribe**.

<br />

<Image
  img={azure_marketplace_payg_4}
  size='md'
  alt='Форма регистрации ClickHouse Cloud'
  border
/>

<br />

5. На следующем экране выберите подписку, группу ресурсов и расположение группы ресурсов. Расположение группы ресурсов не обязательно должно совпадать с расположением, в котором вы планируете запускать сервисы ClickHouse Cloud.

<br />

<Image
  img={azure_marketplace_payg_5}
  size='md'
  alt='Форма регистрации ClickHouse Cloud'
  border
/>

<br />

6. Также необходимо указать имя подписки и выбрать период биллинга из доступных вариантов. Вы можете включить или отключить **Recurring billing**. Если установить значение «off», ваш контракт завершится после окончания периода биллинга, и ваши ресурсы будут удалены.

<br />

<Image
  img={azure_marketplace_payg_6}
  size='md'
  alt='Форма регистрации ClickHouse Cloud'
  border
/>

<br />

7. Нажмите **«Review + subscribe»**.

8. На следующем экране убедитесь, что все данные верны, и нажмите **Subscribe**.

<br />

<Image
  img={azure_marketplace_payg_7}
  size='md'
  alt='Форма регистрации ClickHouse Cloud'
  border
/>

<br />

9. Обратите внимание, что на данном этапе вы оформили подписку Azure для ClickHouse Cloud, но еще не настроили учетную запись в ClickHouse Cloud. Следующие шаги необходимы и критически важны для того, чтобы ClickHouse Cloud мог привязаться к вашей подписке Azure и биллинг корректно осуществлялся через Azure Marketplace.

<br />

<Image
  img={azure_marketplace_payg_8}
  size='md'
  alt='Форма регистрации ClickHouse Cloud'
  border
/>

<br />

10. После завершения настройки Azure кнопка **Configure account now** должна стать активной.

<br />

<Image
  img={azure_marketplace_payg_9}
  size='md'
  alt='Форма регистрации ClickHouse Cloud'
  border
/>

<br />

11. Нажмите **Configure account now**.

<br />

Вы получите электронное письмо, подобное приведенному ниже, с подробной информацией о настройке учетной записи:

<br />

<Image
  img={azure_marketplace_payg_10}
  size='md'
  alt='Форма регистрации ClickHouse Cloud'
  border
/>

<br />

12. Вы будете перенаправлены на страницу регистрации или входа в ClickHouse Cloud. После перенаправления в ClickHouse Cloud вы можете войти с существующей учетной записью или зарегистрировать новую. Этот шаг очень важен, чтобы мы могли привязать вашу организацию ClickHouse Cloud к биллингу Azure Marketplace.

13. Обратите внимание, что если вы новый пользователь, вам также потребуется предоставить базовую информацию о вашей компании. См. скриншоты ниже.

<br />

<Image
  img={aws_marketplace_payg_8}
  size='md'
  alt='Форма регистрации ClickHouse Cloud'
  border
/>

<br />

<Image
  img={aws_marketplace_payg_9}
  size='md'
  alt='Форма регистрации ClickHouse Cloud 2'
  border
/>

<br />

После нажатия **Complete sign up** вы будете перенаправлены в вашу организацию в ClickHouse Cloud, где сможете просмотреть экран биллинга, чтобы убедиться, что оплата осуществляется через Azure Marketplace, и создать сервисы.

<br />

<br />

<Image
  img={azure_marketplace_payg_11}
  size='md'
  alt='Форма регистрации ClickHouse Cloud'
  border
/>

<br />

<br />

<Image
  img={azure_marketplace_payg_12}
  size='md'
  alt='Форма регистрации ClickHouse Cloud'
  border
/>


<br />

14. Если у вас возникнут какие-либо проблемы, пожалуйста, обращайтесь в [нашу службу поддержки](https://clickhouse.com/support/program).
