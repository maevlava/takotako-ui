# %%
import pandas as pd

# %% Restaurant
restoran = pd.read_csv("./data/restoran.csv")
menus = pd.read_csv("./data/menu.csv")

restoran.head()
menus.head()

# %% Menus
newMenus = pd.DataFrame(
    [
        {
            "restoran": "Warung Mamah Aini",
            "menu": "Takoyaki Originaru 10",
            "harga": 23000,
            "likes": 10,
            "terjual": 300,
        },
        {
            "restoran": "Warung Mamah Aini",
            "menu": "Takoyaki Soosejikun 10",
            "harga": 25000,
            "likes": 2,
            "terjual": 57,
        },
        {
            "restoran": "Warung Mamah Aini",
            "menu": "Takoyaki Mitoborusan ( Bakso )",
            "harga": 25000,
            "likes": 1,
            "terjual": 24,
        },
        {
            "restoran": "Warung Mamah Aini",
            "menu": "Takoyaki Sumokubiifusan (Beef ) 10",
            "harga": 25000,
            "likes": 1,
            "terjual": 32,
        },
        {
            "restoran": "Warung Mamah Aini",
            "menu": "Takoyaki Kornet Chicken 10",
            "harga": 25000,
            "likes": 4,
            "terjual": 100,
        },
        {
            "restoran": "Warung Mamah Aini",
            "menu": "Takoyaki Chikuwa 10",
            "harga": 25000,
            "likes": 5,
            "terjual": 31,
        },
        {
            "restoran": "Warung Mamah Aini",
            "menu": "Takoyaki Bakso Salmon 10",
            "harga": 25000,
            "likes": 6,
            "terjual": 100,
        },
        {
            "restoran": "Warung Mamah Aini",
            "menu": "Takoyaki Duo Twister 10",
            "harga": 25000,
            "likes": 1,
            "terjual": 13,
        },
        {
            "restoran": "Warung Mamah Aini",
            "menu": "Takoyaki Beef Patties 10",
            "harga": 27000,
            "likes": 4,
            "terjual": 78,
        },
        {
            "restoran": "Warung Mamah Aini",
            "menu": "Takoyaki Crab Stick 10",
            "harga": 27000,
            "likes": 8,
            "terjual": 89,
        },
        {
            "restoran": "Warung Mamah Aini",
            "menu": "Takoyaki Chiizukun ( Keju ) 10",
            "harga": 30000,
            "likes": 1,
            "terjual": 100,
        },
        {
            "restoran": "Warung Mamah Aini",
            "menu": "Takoyaki Kembang Cumi 10",
            "harga": 30000,
            "likes": 1,
            "terjual": 62,
        },
        {
            "restoran": "Warung Mamah Aini",
            "menu": "Takoyaki Daging Kebab 10",
            "harga": 35000,
            "likes": 1,
            "terjual": 13,
        },
        {
            "restoran": "Warung Mamah Aini",
            "menu": "Takoyaki Takosama ( Gurita ) 10",
            "harga": 40000,
            "likes": 0,
            "terjual": 74,
        },
        {
            "restoran": "Warung Mamah Aini",
            "menu": "Takoyaki Mozachan ( Mozarella )",
            "harga": 40000,
            "likes": 0,
            "terjual": 5,
        },
        {
            "restoran": "Warung Mamah Aini",
            "menu": "Okonomiyaki Originaru",
            "harga": 30000,
            "likes": 5,
            "terjual": 100,
        },
        {
            "restoran": "Warung Mamah Aini",
            "menu": "Okonomiyaki Mitoborusan",
            "harga": 35000,
            "likes": 0,
            "terjual": 25,
        },
        {
            "restoran": "Warung Mamah Aini",
            "menu": "Okonomiyaki Sosejikun",
            "harga": 35000,
            "likes": 0,
            "terjual": 13,
        },
        {
            "restoran": "Warung Mamah Aini",
            "menu": "Okonomiyaki Kornet Chicken",
            "harga": 38000,
            "likes": 2,
            "terjual": 7,
        },
        {
            "restoran": "Warung Mamah Aini",
            "menu": "Okonomiyaki Chikuwa",
            "harga": 38000,
            "likes": 2,
            "terjual": 2,
        },
        {
            "restoran": "Warung Mamah Aini",
            "menu": "Okonomiyaki Bakso Salmon",
            "harga": 38000,
            "likes": 1,
            "terjual": 4,
        },
        {
            "restoran": "Warung Mamah Aini",
            "menu": "Okonomiyaki Duo Twister",
            "harga": 38000,
            "likes": 0,
            "terjual": 1,
        },
        {
            "restoran": "Warung Mamah Aini",
            "menu": "Okonomiyaki Crab Stick",
            "harga": 38000,
            "likes": 1,
            "terjual": 11,
        },
        {
            "restoran": "Warung Mamah Aini",
            "menu": "Okonomiyaki Beef Patties",
            "harga": 40000,
            "likes": 0,
            "terjual": 24,
        },
        {
            "restoran": "Warung Mamah Aini",
            "menu": "Okonomiyaki Chiizukun",
            "harga": 40000,
            "likes": 0,
            "terjual": 16,
        },
        {
            "restoran": "Warung Mamah Aini",
            "menu": "Okonomiyaki Mozachan",
            "harga": 40000,
            "likes": 0,
            "terjual": 6,
        },
        {
            "restoran": "Warung Mamah Aini",
            "menu": "Okonomiyaki Kembang Cumi",
            "harga": 40000,
            "likes": 1,
            "terjual": 8,
        },
        {
            "restoran": "Warung Mamah Aini",
            "menu": "Okonomiyaki Daging Kebab",
            "harga": 40000,
            "likes": 1,
            "terjual": 6,
        },
        {
            "restoran": "Warung Mamah Aini",
            "menu": "Okonomiyaki Takosama",
            "harga": 46000,
            "likes": 0,
            "terjual": 12,
        },
    ]
)

# %% Write new menus
menus = pd.concat([menus, newMenus], ignore_index=True)
menus.tail()

menus.to_csv("menu.csv", index=False)

# %% Add channel to restaurant
restoran["channel"] = "Shopee"
restoran.head()
restoran.to_csv("./data/restoran.csv", index=False)
