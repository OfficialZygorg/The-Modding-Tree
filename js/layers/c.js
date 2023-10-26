addLayer("c", {
  name: "chalie", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      best: new Decimal(0),
      total: new Decimal(0),
      softcap2: D(2500),
    };
  },
  requires: new Decimal(1e16), // Can be a function that takes requirement increases into account
  resource: "charlie points", // Name of prestige currency
  baseResource: "alpha points", // Name of resource prestige is based on
  baseAmount() {
    return player["a"].points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.7, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    return new Decimal(1);
  },
  softcap() {
    let value = new Decimal(50);
    return value;
  },
  softcapPower() {
    let power = new Decimal(0.1);
    if (getLayerSoftcapAble(this.layer, 2)) power = power.pow(1.3);
    return power;
  },
  row: 1, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    {
      key: "c",
      description: "C: Reset for Charlie points",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  infoboxes: {
    lore: {
      title: "Softcaps",
      unlocked() {
        return getLayerSoftcapAble(this.layer);
      },
      body() {
        let softcapText = getLayerSoftcapAble(this.layer) || hasUpgrade("b", 21) ? `(Softcapped gain at: ${format(getLayerSoftcap(this.layer))})<br>` : "";
        let softcapText2 = getLayerSoftcapAble(this.layer, 2) ? `(Softcapped^2 gain at: ${format(getLayerSoftcap(this.layer, 2))})<br>` : "";
        let stext = softcapText + softcapText2;
        return `${stext}`;
      },
    },
  },
  prestigeButtonText() {
    let nextGain = new Decimal(tmp[this.layer].nextAt);
    return `
    Reset for +${format(tmp[this.layer].resetGain, 0)} alpha points.<br>
    Next at: ${format(nextGain)} alpha points.
    `;
  },
  //Code by escapee from The Modding Tree discord https://discord.com/channels/762036407719428096/762071767346839573/1163891655410200689
  doReset(resettingLayer) {
    // Stage 1, almost always needed, makes resetting this layer not delete your progress
    if (layers[resettingLayer].row <= this.row) return;

    // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 11, Challenge 32, Buyable 12
    let keptUpgrades = [];
    // if (hasUpgrade(this.layer, 33)) keptUpgrades.push(33);

    // Stage 3, track which main features you want to keep - all upgrades, total points, specific toggles, etc.
    let keep = [];
    // if (hasUpgrade("a", 33)) keep.push("milestones");

    // Stage 4, do the actual data reset
    layerDataReset(this.layer, keep);

    // Stage 5, add back in the specific subfeatures you saved earlier
    player[this.layer].upgrades.push(...keptUpgrades);
  },
  layerShown() {
    return hasUpgrade("b", 41);
  },
  color: "purple",
  milestones: {
    0: {
      requirementDescription: "1000 Charlie points.",
      done() {
        return player[this.layer].points.gte(1000);
      },
      effectDescription() {
        let text = `Unlock next row of C layer upgrades, and an extra colum of upgrades for A & B layers.<br>(Upgrades not yet implemented)`;
        return text;
      },
      unlocked() {
        return hasBuyable(this.layer, 13);
      },
    },
  },
  buyables: {
    11: {
      cost(x) {
        let current = x.add(1);
        let cost = new Decimal(50).mul(current);
        if (buyableEffect(this.layer, this.id).gte(100)) return new Decimal(Infinity);
        return cost;
      },
      title: "B: Depowerer II",
      display() {
        let cost = new Decimal(tmp[this.layer].buyables[this.id].cost);
        let capped = buyableEffect(this.layer, this.id).gte(100) ? "(Capped)" : "";
        return `Divide Vitamin B I softcap power by bought amount + 1<br>
        Cost: ${format(cost)}
        Effect: /${format(buyableEffect(this.layer, this.id))} ${capped}
        Bought: ${getBuyableAmount(this.layer, this.id)}/99`;
      },
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },
      buy() {
        player[this.layer].points = player[this.layer].points.sub(this.cost());
        setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
      },
      effect(x) {
        let eff = new Decimal(1).add(x).min(100);
        return eff;
      },
      purchaseLimit: new Decimal(10),
    },
    12: {
      cost(x) {
        let current = x.add(1);
        let cost = new Decimal(75).mul(current);
        return cost;
      },
      title: "B: Uncapper III",
      display() {
        let cost = new Decimal(tmp[this.layer].buyables[this.id].cost);
        return `Multiply Vitamin B I softcap start by bought amount + 1<br>
        Cost: ${format(cost)}
        Effect: x${format(buyableEffect(this.layer, this.id))}
        Bought: ${getBuyableAmount(this.layer, this.id)}`;
      },
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },
      buy() {
        player[this.layer].points = player[this.layer].points.sub(this.cost());
        setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
      },
      effect(x) {
        let eff = new Decimal(1).add(x);
        return eff;
      },
    },
    13: {
      cost(x) {
        let current = x.add(1);
        let cost = new Decimal(100).mul(current);
        return cost;
      },
      title: "A: Empowerer I",
      display() {
        let cost = new Decimal(tmp[this.layer].buyables[this.id].cost);
        return `Raise Additive I by 0.5 per amount bought.<br>
        Cost: ${format(cost)}
        Effect: ^${format(buyableEffect(this.layer, this.id))}
        Bought: ${getBuyableAmount(this.layer, this.id)}`;
      },
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },
      buy() {
        player[this.layer].points = player[this.layer].points.sub(this.cost());
        setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
      },
      effect(x) {
        let bought = x;
        let eff = new Decimal(1).add(bought.div(2));
        return eff;
      },
    },
  },
});
