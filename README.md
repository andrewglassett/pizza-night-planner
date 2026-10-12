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
           |   CHEF    DOUGHBOY       |
```

*Buonasera, amici miei! Benvenuti! It is I, Chef Doughboy, pictured above in my finest toque and a mustache my mamma said would bring shame on the family. Allora, she was wrong. Look at it. Magnifico.*

In my little kitchen in Napoli, we have one rule: *la pizza non si improvvisa*. Pizza is not improvised! The flour, the water, the salt, the cheese, everything has its measure. Your nonna, she eyeballed it, sì, but your nonna made pizza ten thousand times with a wooden spoon in one hand and a grandchild in the other. You? Forse sei volte. Maybe six. So I made you a little planner. *Prego.*

## Cosa fa · What it does

Pick a style, tell it what you are making, and it tells you exactly how many grams of everything go in, with a plan for when to start. *Facile, no?*

| Style | What you get |
| --- | --- |
| **Detroit-style** | Rectangle or round pans in any size, even different pans in one bake. Two crusts (Traditional and Artisan), four cheese levels, four sauce levels, and a schedule that works backward from dinner. *Una pizza in teglia* with a crispy cheese edge. Mamma mia. |
| **New York-style** | Round pies from 12 to 18 inches (or whatever you like), three crusts, and a swap for bread flour plus vital wheat gluten when you cannot find high-gluten flour. Thin, foldable, *perfetta* for eating on the sidewalk. |
| **Sourdough** | A hydration slider from 60% to 100% that counts the flour and water in your 100% *lievito madre*, a 72-hour cold ferment, and a 750°F bake of 60 to 90 seconds. *Come a Napoli!* |

Every style also gives you:

- **Grams for everything.** *Sempre i grammi!* Spoon measures stay on the little things, like *Dried oregano (1 tsp)*, because nobody weighs ¼ teaspoon of garlic powder. Not even me.
- **A sauce batch,** *il sugo*, that tells you whether your can of *pomodori* is enough and scales it up with one tap.
- **Copy recipe,** for pasting into your notes, or texting to your *cugino* who says he "knows a guy" for mozzarella.
- **Light and dark mode,** for cooking *a mezzanotte*.
- **Keep screen on,** so your phone does not go dark while your hands are covered in dough. *Che disastro* that would be.

Your settings stay in your own browser. Nothing gets sent anywhere. The only thing I want from you is a clean plate. *Mangia, mangia!*

## Come si usa · Running it

Three files, like a good pizza has three parts:

| File | What's in it |
| --- | --- |
| `index.html` | *L'impasto*, the dough: the page structure |
| `styles.css` | *Il sugo*, the sauce: colors, fonts and layout, light and dark |
| `app.js` | *Il formaggio*, the cheese: all the math, the schedules and the buttons |

- **Open it:** double-click `index.html` (keep the three files in the same folder, *insieme*, like family).
- **Host it:** turn on GitHub Pages for this repo (Settings → Pages → deploy from `main`, root folder) and share the link.

No build step, no install, no `npm`. *Basta così.*

## Una nuova pizza · Adding a new style

Each style is one entry in the `TYPES` list in `app.js`, plus a screen block in `index.html` and a `calc…`, `render…` and `…Text` function in `app.js`. Copy the sourdough one; it is the simplest. Then send me a slice. *Grazie mille!*

## Grazie · Credits

- Detroit and New York ratios are adapted from Charlie Anderson's Detroit-Style Pizza Calculator (V2) and NYC Pizza Calculator.
- The sourdough formula is *la ricetta della casa*, the house recipe: 700 g flour, 490 g water, 98 g starter and 14 g salt for six 217 g balls.

*Ciao, ciao! E buon appetito!* 🇮🇹
