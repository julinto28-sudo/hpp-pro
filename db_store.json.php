<?php http_response_code(403); exit('Akses ditolak.'); ?>
{
    "users": [
        {
            "id": "user_cea04b26a31e5097",
            "username": "admin",
            "passwordHash": "55d3043bbf655a341a85bd0e330d191fb02b59aadd287713720ab620baaf2c2e",
            "salt": "d1d903577f95e3c59d056b176d5440eb",
            "securityQuestion": "Nama brand kuliner pertama Anda?",
            "securityAnswerHash": "5e637915d305003b722285f928e75fb47a0d2de60ee231eafa4331f41b0ee6f3",
            "createdAt": "2026-07-05T19:17:00+02:00"
        }
    ],
    "tokens": {
        "d67f5dce7d5047c8c3bf3dbed4ffc76305780809605f46a26e0fbf7c27763207": {
            "userId": "user_cea04b26a31e5097",
            "username": "admin",
            "expiresAt": 1785863820
        }
    },
    "userData": {
        "user_cea04b26a31e5097": {
            "materials": [
                {
                    "id": "mat_z32pqe7",
                    "name": "susu",
                    "purchasePrice": 95000,
                    "packageSize": 1,
                    "unit": "liter",
                    "costPerUnit": 95000
                },
                {
                    "id": "mat_c84dqzh",
                    "name": "kopi",
                    "purchasePrice": 80000,
                    "packageSize": 1,
                    "unit": "kg",
                    "costPerUnit": 80000
                },
                {
                    "id": "mat_1",
                    "name": "Tepung Terigu Cakra Kembar",
                    "purchasePrice": 18000,
                    "packageSize": 1000,
                    "unit": "gram",
                    "costPerUnit": 18,
                    "notes": "Beli kartonan di Grosir Sinar Abadi"
                },
                {
                    "id": "mat_2",
                    "name": "Mentega Butter Wysman",
                    "purchasePrice": 145000,
                    "packageSize": 500,
                    "unit": "gram",
                    "costPerUnit": 290,
                    "notes": "Mentega premium import untuk rasa maksimal"
                },
                {
                    "id": "mat_3",
                    "name": "Gula Pasir Gulaku",
                    "purchasePrice": 175000,
                    "packageSize": 10000,
                    "unit": "gram",
                    "costPerUnit": 17.5,
                    "notes": "Kemasan karung isi 10 kg"
                },
                {
                    "id": "mat_4",
                    "name": "Kuning Telur Ayam Ras",
                    "purchasePrice": 32000,
                    "packageSize": 1000,
                    "unit": "gram",
                    "costPerUnit": 32,
                    "notes": "Diambil dari supplier lokal segar harian"
                },
                {
                    "id": "mat_5",
                    "name": "Ragi Instan Fermipan",
                    "purchasePrice": 6500,
                    "packageSize": 44,
                    "unit": "gram",
                    "costPerUnit": 147.7,
                    "notes": "Sachet kecil isi 44 gram"
                },
                {
                    "id": "mat_6",
                    "name": "Kotak Dus Box Premium",
                    "purchasePrice": 3500,
                    "packageSize": 1,
                    "unit": "pcs",
                    "costPerUnit": 3500,
                    "notes": "Cetak logo emas di percetakan Jaya"
                }
            ],
            "labors": [
                {
                    "id": "lab_1",
                    "role": "Baker Utama (Kepala Dapur)",
                    "rate": 25000,
                    "rateType": "hour",
                    "description": "Mengatur resep dan proses pemanggangan adonan utama"
                },
                {
                    "id": "lab_2",
                    "role": "Staf Packer \/ Finishing",
                    "rate": 15000,
                    "rateType": "hour",
                    "description": "Melakukan quality control dan memasukkan roti ke kemasan dus"
                }
            ],
            "overheads": [
                {
                    "id": "oh_1",
                    "name": "Sewa Ruko Dapur Produksi",
                    "cost": 2000000,
                    "description": "Dibayar tahunan, diamortisasi bulanan"
                },
                {
                    "id": "oh_2",
                    "name": "Listrik & Air Pabrik",
                    "cost": 750000,
                    "description": "Beban daya mixer industri dan pompa air bersih"
                },
                {
                    "id": "oh_3",
                    "name": "Penyusutan Oven & Mixer",
                    "cost": 500000,
                    "description": "Depresiasi alat produksi metode garis lurus"
                },
                {
                    "id": "oh_4",
                    "name": "Gas Elpiji 12kg (Dapur)",
                    "cost": 250000,
                    "description": "Rata-rata habis 1 tabung per minggu"
                }
            ],
            "products": [
                {
                    "id": "prod_1",
                    "name": "Roti Tawar Butter Premium (Batch 10 Unit)",
                    "description": "Roti tawar mentega wangi premium untuk segmen pasar menengah ke atas.",
                    "batchSize": 10,
                    "materials": [
                        {
                            "materialId": "mat_1",
                            "quantityUsed": 2500
                        },
                        {
                            "materialId": "mat_2",
                            "quantityUsed": 250
                        },
                        {
                            "materialId": "mat_3",
                            "quantityUsed": 300
                        },
                        {
                            "materialId": "mat_4",
                            "quantityUsed": 400
                        },
                        {
                            "materialId": "mat_5",
                            "quantityUsed": 50
                        },
                        {
                            "materialId": "mat_6",
                            "quantityUsed": 10
                        }
                    ],
                    "labors": [
                        {
                            "laborId": "lab_1",
                            "timeOrQty": 3
                        },
                        {
                            "laborId": "lab_2",
                            "timeOrQty": 1.5
                        }
                    ],
                    "overheads": [
                        {
                            "overheadId": "oh_1",
                            "isAutomatic": true,
                            "manualCost": 0
                        },
                        {
                            "overheadId": "oh_2",
                            "isAutomatic": true,
                            "manualCost": 0
                        },
                        {
                            "overheadId": "oh_3",
                            "isAutomatic": true,
                            "manualCost": 0
                        },
                        {
                            "overheadId": "oh_4",
                            "isAutomatic": true,
                            "manualCost": 0
                        }
                    ],
                    "targetMargin": 40,
                    "sellingPrice": 32500,
                    "createdAt": "2026-07-05T19:17:00+02:00",
                    "updatedAt": "2026-07-05T19:17:00+02:00"
                }
            ],
            "monthlyVolume": 1000
        }
    }
}