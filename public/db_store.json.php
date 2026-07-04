<?php http_response_code(403); exit('Akses ditolak.'); ?>
{
    "users": [
        {
            "id": "user_1025b54e1369deee",
            "username": "admin",
            "passwordHash": "572613e8201fa3ea90939edf405707f03d7b7731af2a80193d0817c0aff79733",
            "salt": "25c1ca04e38c33af133458f54af8fa24",
            "createdAt": "2026-07-03T19:54:14+02:00"
        }
    ],
    "tokens": {
        "ebabea961d338c0f3b5dd88f45b8b78c454496b31469523903af473d65162529": {
            "userId": "user_1025b54e1369deee",
            "username": "admin",
            "expiresAt": 1785693254
        },
        "81910029db1c75a5e63db76cfc1649d967048148375dd721921da9089b718dab": {
            "userId": "user_1025b54e1369deee",
            "username": "admin",
            "expiresAt": 1785696565
        },
        "29d57f2343690a00242955b3cec6286e887bb125071f19e8ab9c35866dc6cafc": {
            "userId": "user_1025b54e1369deee",
            "username": "admin",
            "expiresAt": 1785696601
        },
        "ecbca9a672a081f9c855bb51d12b29b30708c63598be4ae42b4d85d720844c58": {
            "userId": "user_1025b54e1369deee",
            "username": "admin",
            "expiresAt": 1785734747
        },
        "58273f3500c4e088fc435e6dff411b911b39d1d0f5d3d46f7f0617478870d8d0": {
            "userId": "user_1025b54e1369deee",
            "username": "admin",
            "expiresAt": 1785750179
        },
        "6c646f5ff3a7778d69bab0420d73e84ad1abeb191b650bed27c053db5fc8b733": {
            "userId": "user_1025b54e1369deee",
            "username": "admin",
            "expiresAt": 1785752108
        },
        "61c7dc5ecc3d569f0fd4353353d1faab5d3aebab63c30abab835e16e8966387e": {
            "userId": "user_1025b54e1369deee",
            "username": "admin",
            "expiresAt": 1785776552
        },
        "3a95f788d129a0754b24bfe145d9926532907e97aafd7e9d13fdd62bd590ca3f": {
            "userId": "user_1025b54e1369deee",
            "username": "admin",
            "expiresAt": 1785776574
        },
        "13156cf348930174cc9fccc44f79b5cb0fc7360b67e99c806ad8106b557c784f": {
            "userId": "user_1025b54e1369deee",
            "username": "admin",
            "expiresAt": 1785776679
        },
        "81ffbf7e8d10098d0eee4ebc5516811283a0cd7e1fa451b461067b11f85d7e8f": {
            "userId": "user_1025b54e1369deee",
            "username": "admin",
            "expiresAt": 1785777082
        }
    },
    "userData": {
        "user_1025b54e1369deee": {
            "materials": [
                {
                    "id": "m_1783104862627",
                    "name": "Diamond Fresh Milk",
                    "price": 46717,
                    "packageSize": 1,
                    "unit": "liter",
                    "notes": "",
                    "usageUnit": "ml",
                    "conversionRatio": 1000
                },
                {
                    "id": "m_1783104906573",
                    "name": "Carnation Evaporasi",
                    "price": 18876,
                    "packageSize": 1,
                    "unit": "liter",
                    "notes": "",
                    "usageUnit": "ml",
                    "conversionRatio": 1000
                },
                {
                    "id": "m_1783104939231",
                    "name": "Caramel Syrup",
                    "price": 40000,
                    "packageSize": 1,
                    "unit": "liter",
                    "notes": "",
                    "usageUnit": "ml",
                    "conversionRatio": 1000
                },
                {
                    "id": "m_1783104982127",
                    "name": "Biji Kopi Arabica",
                    "price": 220000,
                    "packageSize": 1,
                    "unit": "kg",
                    "notes": "",
                    "usageUnit": "gr",
                    "conversionRatio": 1000
                }
            ],
            "labors": [],
            "overheads": [],
            "products": [
                {
                    "id": "p_1783105101980",
                    "name": "Caramel Frappe",
                    "batchSize": 1,
                    "sellingPrice": 22000,
                    "targetMargin": 20,
                    "image": "beverage",
                    "materials": [
                        {
                            "materialId": "m_1783104862627",
                            "quantity": 200
                        },
                        {
                            "materialId": "m_1783104906573",
                            "quantity": 30
                        },
                        {
                            "materialId": "m_1783104939231",
                            "quantity": 30
                        },
                        {
                            "materialId": "m_1783104982127",
                            "quantity": 30
                        }
                    ],
                    "labors": []
                }
            ],
            "monthlyVolume": 500
        }
    }
}