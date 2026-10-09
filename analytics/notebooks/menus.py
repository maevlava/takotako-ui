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
            "restoran": "Takoyaki Cober Villa - Gunung Putri",
            "menu": "(Buy 2 get 3) 15 kepiting+ 15 gurita olahan+ 6 fishroll",
            "harga": 93000,
            "likes": 0,
            "terjual": 6,
        },
        {
            "restoran": "Takoyaki Cober Villa - Gunung Putri",
            "menu": "(Buy 2 get 3) 15 kepiting+ 15 mozarella+ 6 fishroll",
            "harga": 93000,
            "likes": 0,
            "terjual": 6,
        },
        {
            "restoran": "Takoyaki Cober Villa - Gunung Putri",
            "menu": "(Buy 2 get 3) 15 kornet+ 15 sosis+ 6 fishroll",
            "harga": 87750,
            "likes": 0,
            "terjual": 4,
        },
        {
            "restoran": "Takoyaki Cober Villa - Gunung Putri",
            "menu": "(Buy 2 get 3) 6 gurita olahan+ 6 kepiting + 6 fishroll",
            "harga": 56250,
            "likes": 2,
            "terjual": 34,
        },
        {
            "restoran": "Takoyaki Cober Villa - Gunung Putri",
            "menu": "(Buy 2 get 3) 6 gurita olahan+ 6 mozarella+ 6 fishroll",
            "harga": 56250,
            "likes": 3,
            "terjual": 100,
        },
        {
            "restoran": "Takoyaki Cober Villa - Gunung Putri",
            "menu": "(Buy 2 geti 3) 6 kepiting+ 6 mozarella+ 6 fishroll",
            "harga": 56250,
            "likes": 0,
            "terjual": 17,
        },
        {
            "restoran": "Takoyaki Cober Villa - Gunung Putri",
            "menu": "Takoyaki kepiting 10pcs",
            "harga": 33000,
            "likes": 4,
            "terjual": 69,
        },
        {
            "restoran": "Takoyaki Cober Villa - Gunung Putri",
            "menu": "Takoyaki gurita olahan 10pcs",
            "harga": 33000,
            "likes": 14,
            "terjual": 300,
        },
        {
            "restoran": "Takoyaki Cober Villa - Gunung Putri",
            "menu": "Takoyaki kornet 10pcs",
            "harga": 30000,
            "likes": 0,
            "terjual": 12,
        },
        {
            "restoran": "Takoyaki Cober Villa - Gunung Putri",
            "menu": "Takoyaki sosis 15pcs",
            "harga": 39650,
            "likes": 7,
            "terjual": 63,
        },
        {
            "restoran": "Takoyaki Cober Villa - Gunung Putri",
            "menu": "Takoyaki bakso 15pcs",
            "harga": 39950,
            "likes": 1,
            "terjual": 47,
        },
        {
            "restoran": "Takoyaki Cober Villa - Gunung Putri",
            "menu": "Takoyaki kornet 15pcs",
            "harga": 39650,
            "likes": 1,
            "terjual": 39,
        },
        {
            "restoran": "Takoyaki Cober Villa - Gunung Putri",
            "menu": "Takoyaki roll ikan 15pcs",
            "harga": 40950,
            "likes": 3,
            "terjual": 17,
        },
        {
            "restoran": "Takoyaki Cober Villa - Gunung Putri",
            "menu": "Takoyaki mozarella 15pcs",
            "harga": 42500,
            "likes": 5,
            "terjual": 300,
        },
        {
            "restoran": "Takoyaki Cober Villa - Gunung Putri",
            "menu": "Takoyaki kepiting 15pcs",
            "harga": 42250,
            "likes": 4,
            "terjual": 60,
        },
        {
            "restoran": "Takoyaki Cober Villa - Gunung Putri",
            "menu": "Takoyaki sosis 15pcs",
            "harga": 39950,
            "likes": 0,
            "terjual": 8,
        },
        {
            "restoran": "Takoyaki Cober Villa - Gunung Putri",
            "menu": "Takoyaki gurita olahan 15pcs",
            "harga": 42500,
            "likes": 25,
            "terjual": 500,
        },
        {
            "restoran": "Takoyaki Cober Villa - Gunung Putri",
            "menu": "(Buy 2 get 3) 15 gurita olahan + 15 mozarella + 6 fish roll",
            "harga": 93000,
            "likes": 0,
            "terjual": 40,
        },
        {
            "restoran": "Takoyaki Cober Villa - Gunung Putri",
            "menu": "Takoyaki sosis 6pcs",
            "harga": 19550,
            "likes": 7,
            "terjual": 200,
        },
        {
            "restoran": "Takoyaki Cober Villa - Gunung Putri",
            "menu": "Takoyaki bakso 6pcs",
            "harga": 19550,
            "likes": 4,
            "terjual": 100,
        },
        {
            "restoran": "Takoyaki Cober Villa - Gunung Putri",
            "menu": "Takoyaki kornet 6pcs",
            "harga": 19500,
            "likes": 9,
            "terjual": 100,
        },
        {
            "restoran": "Takoyaki Cober Villa - Gunung Putri",
            "menu": "Takoyaki roll ikan 6pcs",
            "harga": 20500,
            "likes": 3,
            "terjual": 30,
        },
        {
            "restoran": "Takoyaki Cober Villa - Gunung Putri",
            "menu": "Takoyaki mozarella 6pcs",
            "harga": 21250,
            "likes": 13,
            "terjual": 300,
        },
        {
            "restoran": "Takoyaki Cober Villa - Gunung Putri",
            "menu": "Takoyaki kepiting 6pcs",
            "harga": 21250,
            "likes": 6,
            "terjual": 100,
        },
        {
            "restoran": "Takoyaki Cober Villa - Gunung Putri",
            "menu": "Takoyaki gurita olahan 6pcs",
            "harga": 21250,
            "likes": 15,
            "terjual": 300,
        },
        {
            "restoran": "Takoyaki Cober Villa - Gunung Putri",
            "menu": "Takoyaki sosis 10pcs",
            "harga": 30000,
            "likes": 2,
            "terjual": 87,
        },
        {
            "restoran": "Takoyaki Cober Villa - Gunung Putri",
            "menu": "Takoyaki bakso 10pcs",
            "harga": 30000,
            "likes": 5,
            "terjual": 69,
        },
        {
            "restoran": "Takoyaki Cober Villa - Gunung Putri",
            "menu": "Takoyaki kornet 10pcs",
            "harga": 30000,
            "likes": 2,
            "terjual": 52,
        },
        {
            "restoran": "Takoyaki Cober Villa - Gunung Putri",
            "menu": "Takoyaki roll ikan 10pcs",
            "harga": 31200,
            "likes": 0,
            "terjual": 18,
        },
        {
            "restoran": "Takoyaki Cober Villa - Gunung Putri",
            "menu": "Takoyaki mozarella 10pcs",
            "harga": 33000,
            "likes": 15,
            "terjual": 200,
        },
        {
            "restoran": "Takoyaki Cober Villa - Gunung Putri",
            "menu": "(Buy 2 get 3) 6 kornet+ 6 sosis+ 6 fishroll",
            "harga": 52500,
            "likes": 0,
            "terjual": 16,
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
