# 🍕 Pizza Night Planner

```
                    _.-""""-._
                  .'          '.
                 /   .-"""-.    \
                |   (       )    |
                 \   '-...-'    /
                  '.__________.'
                  |  ________  |
                  | |        | |
                  |_|________|_|
                 /    .    .    \
                |   (o)    (o)   |
                |       __       |
                |  .-.-(__)-.-.  |
                |  '._.~~~~._.'  |
                 \     \__/     /
                  '.          .'
               ____|'-.____.-'|____
             .'    \   \__/   /    '.
            /       '.  ||  .'       \
           |  [==]    '.||.'    [==]  |
           |      CHEF  ||  BOY       |
```

*Ciao, my friends! It is I, Chef Boyardee, pictured above in my finest toque and a mustache I have been growing since 1928.*

For almost a hundred years I have said that good food is simple: the right flour, the right water, the right amount of cheese. And what is the right amount? **You weigh it.** Your nonna eyeballed it, yes, but your nonna also made pizza four thousand times. You? Maybe six. So I made you a little planner.

## What it does

Pick a style, tell it what you're making, and it tells you exactly how many grams of everything go in, with a plan for when to start.

| Style | What you get |
| --- | --- |
| **Detroit-style** | Rectangle or round pans in any size, even different pans in one bake. Two crusts (Traditional and Artisan), four cheese levels, four sauce levels, and a schedule that works backward from dinner. |
| **New York-style** | Round pies from 12 to 18 inches (or whatever you like), three crusts, and a swap for bread flour plus vital wheat gluten when you can't find high-gluten flour. |
| **Sourdough** | A hydration slider from 60% to 100% that counts the flour and water in your 100% starter, a 72-hour cold ferment schedule, and a 750°F, 90-second bake. |

Every style also gives you:

- **Grams for everything.** Spoon measures stay on the little things, like *Dried oregano (1 tsp)*, because nobody weighs ¼ teaspoon of garlic powder. Not even me.
- **A sauce batch** that tells you whether your can of tomatoes is enough and scales it up with one tap.
- **Copy recipe**, for pasting into your notes, or texting to your cousin who says he "knows a guy" for mozzarella.
- **Light and dark mode**, for cooking at midnight.
- **Keep screen on**, so your phone doesn't go dark while your hands are covered in dough.

Your settings stay in your own browser. Nothing gets sent anywhere. The only thing I want from you is a clean plate.

## Running it

Three files, like a good pizza has three parts:

| File | What's in it |
| --- | --- |
| `index.html` | The dough: the page structure |
| `styles.css` | The sauce: colors, fonts and layout, light and dark |
| `app.js` | The cheese: all the math, the schedules and the buttons |

- **Open it:** double-click `index.html` (keep the three files in the same folder).
- **Host it:** turn on GitHub Pages for this repo (Settings → Pages → deploy from `main`, root folder) and share the link.

No build step, no install, no `npm`. Mangia.

## Adding a new pizza style

Each style is one entry in the `TYPES` list in `app.js`, plus a screen block in `index.html` and a `calc…`, `render…` and `…Text` function in `app.js`. Copy the sourdough one; it's the simplest. Then send me a slice.

## Credits

- Detroit and New York ratios are adapted from Charlie Anderson's Detroit-Style Pizza Calculator (V2) and NYC Pizza Calculator.
- The sourdough formula is the house recipe: 700 g flour, 490 g water, 98 g starter and 14 g salt for six 217 g balls.

---

<sub>Chef Boyardee here is a parody voice for this README. This project is not affiliated with or endorsed by Chef Boyardee or Conagra Brands.</sub>
