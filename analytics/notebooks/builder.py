# %%
import pandas as pd

# please update restaurant dari csv, baca lewat pandas tambahin yang belum
# %% [data restoran]
restoran = pd.DataFrame(
    [
        {
            "restoran": "O-Takoyaki Jatiranggon",
            "bintang": 4.9,
            "penilaian": 1600,
            "jarak": 2800,
        },
        {
            "restoran": "Kedai kita roti bakar premium",
            "bintang": 4.8,
            "penilaian": 242,
            "jarak": 1800,
        },
        {
            "restoran": "Takoyaki N Corndog Bagol",
            "bintang": 4.8,
            "penilaian": 518,
            "jarak": 933,
        },
        {"restoran": "Takonichiwa", "bintang": 4.9, "penilaian": 55, "jarak": 3600},
        {"restoran": "Dapoer Bysby", "bintang": 4.9, "penilaian": 1400, "jarak": 6900},
        {
            "restoran": "Warung Mamah Aini",
            "bintang": 4.9,
            "penilaian": 1400,
            "jarak": 5900,
        },
        {
            "restoran": "Es Buah Jelly & Takoyaki",
            "bintang": 4.8,
            "penilaian": 277,
            "jarak": 10700,
        },
        {
            "restoran": "Super Siomay Gondrong",
            "bintang": 4.8,
            "penilaian": 100,
            "jarak": 1600,
        },
        {
            "restoran": "Piscok Crispy Parpostel",
            "bintang": 4.9,
            "penilaian": 117,
            "jarak": 2900,
        },
        {
            "restoran": "Cipto Kitchen",
            "bintang": 4.9,
            "penilaian": 742,
            "jarak": 7800,
        },
        {
            "restoran": "Sushi Stop",
            "bintang": 4.8,
            "penilaian": 430,
            "jarak": 3500,
        },
        {
            "restoran": "Takoyaki Cemiwiw",
            "bintang": 4.8,
            "penilaian": 205,
            "jarak": 6200,
        },
        {
            "restoran": "Dapur mama kei",
            "bintang": 0.0,
            "penilaian": 0,
            "jarak": 2900,
        },
    ]
)
menus = pd.DataFrame(
    [
        {
            "restoran": "O-Takoyaki Jatiranggon",
            "menu": "Takoyaki 16 Mix 3 O,C,B",
            "harga": 46400,
            "likes": 13,
            "terjual": 300,
        },
        {
            "restoran": "O-Takoyaki Jatiranggon",
            "menu": "Takoyaki 16 Sosis, Crab",
            "harga": 58000,
            "likes": 12,
            "terjual": 100,
        },
        {
            "restoran": "O-Takoyaki Jatiranggon",
            "menu": "Takoyaki 16 Octo, Sosis",
            "harga": 58000,
            "likes": 6,
            "terjual": 100,
        },
        {
            "restoran": "O-Takoyaki Jatiranggon",
            "menu": "Takoyaki 16 Octo, Crab",
            "harga": 58000,
            "likes": 6,
            "terjual": 200,
        },
        {
            "restoran": "O-Takoyaki Jatiranggon",
            "menu": "Takoyaki 16 Octopus",
            "harga": 58000,
            "likes": 67,
            "terjual": 1000,
        },
        {
            "restoran": "O-Takoyaki Jatiranggon",
            "menu": "Takoyaki 16 Crabstick",
            "harga": 58000,
            "likes": 2,
            "terjual": 36,
        },
        {
            "restoran": "O-Takoyaki Jatiranggon",
            "menu": "Takoyaki 16 Sosis",
            "harga": 58000,
            "likes": 2,
            "terjual": 78,
        },
        {
            "restoran": "O-Takoyaki Jatiranggon",
            "menu": "Takoyaki 8 Octopus",
            "harga": 29000,
            "likes": 78,
            "terjual": 1000,
        },
        {
            "restoran": "O-Takoyaki Jatiranggon",
            "menu": "Takoyaki 8 Crabstick",
            "harga": 29000,
            "likes": 15,
            "terjual": 200,
        },
        {
            "restoran": "O-Takoyaki Jatiranggon",
            "menu": "Takoyaki 8 Sosis",
            "harga": 29000,
            "likes": 12,
            "terjual": 200,
        },
        {
            "restoran": "O-Takoyaki Jatiranggon",
            "menu": "Takoyaki 4 Octopus",
            "harga": 15000,
            "likes": 23,
            "terjual": 500,
        },
        {
            "restoran": "O-Takoyaki Jatiranggon",
            "menu": "Takoyaki 4 Crabstick",
            "harga": 15000,
            "likes": 11,
            "terjual": 100,
        },
        {
            "restoran": "O-Takoyaki Jatiranggon",
            "menu": "Takoyaki 4 Sosis",
            "harga": 15000,
            "likes": 8,
            "terjual": 100,
        },
    ]
)

# %% Restaurant to csv
