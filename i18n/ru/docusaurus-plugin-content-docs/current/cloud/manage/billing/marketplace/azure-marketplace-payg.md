---
slug: /cloud/billing/marketplace/azure-marketplace-payg
title: Azure Marketplace PAYG
description: Подпишитесь на ClickHouse Cloud через Azure Marketplace (PAYG).
keywords: [azure, marketplace, billing, PAYG]
---

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

Начните работу с ClickHouse Cloud на [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) через публичное предложение PAYG (платите по мере использования).

## ПрPrerequisites {#prerequisites}

- Проект Azure, который активирован с правами на покупки вашим администратором биллинга.
- Чтобы подписаться на ClickHouse Cloud на Azure Marketplace, необходимо войти в систему с учетной записью, имеющей права на покупки, и выбрать соответствующий проект.

1. Перейдите в [Azure Marketplace](https://azuremarketplace.microsoft.com/en-us/marketplace/apps) и найдите ClickHouse Cloud. Убедитесь, что вы вошли в систему, чтобы иметь возможность приобрести предложение на маркетплейсе.

<br />

<img src={azure_marketplace_payg_1}
    alt='Форма информации о регистрации ClickHouse Cloud'
    class='image'
    style={{width: '300px'}}
    />

<br />

2. На странице объявления продукта нажмите **Получить сейчас**.

<br />

<img src={azure_marketplace_payg_2}
    alt='Форма информации о регистрации ClickHouse Cloud'
    class='image'
    style={{width: '500px'}}
    />

<br />

3. Вам нужно будет предоставить имя, адрес электронной почты и информацию о местонахождении на следующем экране.

<br />

<img src={azure_marketplace_payg_3}
    alt='Форма информации о регистрации ClickHouse Cloud'
    class='image'
    style={{width: '400px'}}
    />

<br />

4. На следующем экране нажмите **Подписаться**.

<br />

<img src={azure_marketplace_payg_4}
    alt='Форма информации о регистрации ClickHouse Cloud'
    class='image'
    style={{width: '400px'}}
    />

<br />

5. На следующем экране выберите подписку, группу ресурсов и расположение группы ресурсов. Расположение группы ресурсов не обязательно должно совпадать с тем местоположением, где вы собираетесь разворачивать свои услуги на ClickHouse Cloud.

<br />

<img src={azure_marketplace_payg_5}
    alt='Форма информации о регистрации ClickHouse Cloud'
    class='image'
    style={{width: '500px'}}
    />

<br />

6. Вам также нужно будет предоставить имя для подписки, а также выбрать тарифный план из доступных вариантов. Вы можете решить, включить ли **Периодическую оплату** или отключить. Если вы установите "выключено", ваш контракт завершится после окончания срока действия биллинга, и ваши ресурсы будут деактивированы.

<br />

<img src={azure_marketplace_payg_6}
    alt='Форма информации о регистрации ClickHouse Cloud'
    class='image'
    style={{width: '500px'}}
    />

<br />

7. Нажмите **"Обзор + подписка"**.

8. На следующем экране проверьте, что всё выглядит корректно, и нажмите **Подписаться**.

<br />

<img src={azure_marketplace_payg_7}
    alt='Форма информации о регистрации ClickHouse Cloud'
    class='image'
    style={{width: '400px'}}
    />

<br />

9. Обратите внимание, что на этом этапе вы подписались на подписку Azure ClickHouse Cloud, но ещё не настроили свою учетную запись на ClickHouse Cloud. Следующие шаги необходимы и критически важны, чтобы ClickHouse Cloud мог связаться с вашей подпиской Azure, чтобы ваш биллинг происходил корректно через Azure Marketplace.

<br />

<img src={azure_marketplace_payg_8}
    alt='Форма информации о регистрации ClickHouse Cloud'
    class='image'
    style={{width: '500px'}}
    />

<br />

10. После завершения настройки Azure кнопка **Настроить аккаунт сейчас** должна активироваться.

<br />

<img src={azure_marketplace_payg_9}
    alt='Форма информации о регистрации ClickHouse Cloud'
    class='image'
    style={{width: '400px'}}
    />

<br />

11. Нажмите **Настроить аккаунт сейчас**.

<br />

Вы получите электронное письмо, похожее на то, что показано ниже, с информацией о настройке вашей учетной записи:

<br />

<img src={azure_marketplace_payg_10}
    alt='Форма информации о регистрации ClickHouse Cloud'
    class='image'
    style={{width: '400px'}}
    />

<br />

12. Вы будете перенаправлены на страницу регистрации или входа в ClickHouse Cloud. Вы можете либо зарегистрироваться с помощью новой учетной записи, либо войти, используя существующую учетную запись. После входа будет создана новая организация, готовая к использованию и биллингу через Azure Marketplace.

13. Вам нужно будет ответить на несколько вопросов - адрес и информацию о компании - прежде чем вы сможете продолжить.

<br />

<img src={aws_marketplace_payg_8}
    alt='Форма информации о регистрации ClickHouse Cloud'
    class='image'
    style={{width: '400px'}}
    />

<br />

<img src={aws_marketplace_payg_9}
    alt='Форма информации о регистрации ClickHouse Cloud 2'
    class='image'
    style={{width: '400px'}}
    />

<br />

14. Как только вы нажмете **Завершить регистрацию**, вы будете перенаправлены на свою организацию в ClickHouse Cloud, где вы сможете просмотреть экран биллинга, чтобы убедиться, что вы находитесь на биллинге через Azure Marketplace, и создать услуги.

<br />

<br />

<img src={azure_marketplace_payg_11}
    alt='Форма информации о регистрации ClickHouse Cloud'
    class='image'
    style={{width: '300px'}}
    />

<br />

<br />

<img src={azure_marketplace_payg_12}
    alt='Форма информации о регистрации ClickHouse Cloud'
    class='image'
    style={{width: '500px'}}
    />

<br />

15. Если у вас возникнут проблемы, пожалуйста, не стесняйтесь обращаться в [нашу службу поддержки](https://clickhouse.com/support/program).
