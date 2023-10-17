addLayer("a", {
  name: "alpha", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "A", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: true,
      points: new Decimal(0),
      best: new Decimal(0),
      total: new Decimal(0),
      autoBuy: false,
    };
  },
  requires: new Decimal(10), // Can be a function that takes requirement increases into account
  resource: "alpha points", // Name of prestige currency
  baseResource: "points", // Name of resource prestige is based on
  baseAmount() {
    return player.points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.9, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (hasUpgrade("b", 11)) mult = mult.mul(upgradeEffect("b", 11));
    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    return new Decimal(1);
  },
  softcap: new Decimal(30000),
  softcapPower: new Decimal(0.1),
  row: 0, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    {
      key: "a",
      description: "A: Reset for alpha points",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  passiveGeneration() {
    let value = new Decimal(hasUpgrade("b", 12) ? 1 : 0).mul(0.01).max(0);
    if (hasUpgrade("b", 13)) value = value.mul(upgradeEffect("b", 13));
    if ((value === NaN, undefined)) value = new Decimal(0);
    return value;
  },
  //Code by escapee from The Modding Tree discord https://discord.com/channels/762036407719428096/762071767346839573/1163891655410200689
  doReset(resettingLayer) {
    // Stage 1, almost always needed, makes resetting this layer not delete your progress
    if (layers[resettingLayer].row <= this.row) return;

    // Stage 2, track which specific subfeatures you want to keep, e.g. Upgrade 11, Challenge 32, Buyable 12
    let keptUpgrades = [];
    if (hasUpgrade(this.layer, 33)) keptUpgrades.push(33);

    // Stage 3, track which main features you want to keep - all upgrades, total points, specific toggles, etc.
    let keep = [];
    // if (someOtherCondition) keep.push("milestones");

    // Stage 4, do the actual data reset
    layerDataReset(this.layer, keep);

    // Stage 5, add back in the specific subfeatures you saved earlier
    player[this.layer].upgrades.push(...keptUpgrades);
  },
  layerShown() {
    return true;
  },
  color: "yellow",
  branches: ["b"],
  milestones: {
    0: {
      requirementDescription: "100 Alpha points.",
      done() {
        return player[this.layer].best.gte(100);
      },
      effectDescription: "Unlock 2nd row of alpha upgrades.",
      unlocked() {
        return hasUpgrade("a", 13) || player.b.points.gte(1);
      },
    },
    1: {
      requirementDescription: "500 Alpha points.",
      done() {
        return player[this.layer].best.gte(500);
      },
      effectDescription: "Unlock 3rd row of alpha upgrades.",
      unlocked() {
        return hasUpgrade("a", 23) || player.b.points.gte(1);
      },
    },
  },
  upgrades: {
    11: {
      title: "Doubler",
      description: "Double your point gain.",
      cost: new Decimal(5),
    },
    12: {
      title: "Tripler",
      description: "Triples your point gain.",
      cost: new Decimal(15),
      unlocked() {
        return hasUpgrade("a", 11);
      },
    },
    13: {
      title: "Additive",
      description: "Every alpha point multiplies point gain by 0.1",
      cost: new Decimal(30),
      effect() {
        let value = new Decimal(1);
        let cap = new Decimal(10);
        let power = new Decimal(0.1);
        if (hasUpgrade("a", 21)) power = power.mul(upgradeEffect("a", 21)).min(0.9);
        if (hasUpgrade("a", 23)) cap = cap.add(upgradeEffect("a", 23));
        value = value.add(player[this.layer].points.mul(0.1));
        value = softcap(value, cap, power);
        return value;
      },
      effectDisplay() {
        return (
          format(upgradeEffect(this.layer, this.id)) +
          "x" +
          (upgradeEffect(this.layer, this.id).gte(10)
            ? " (Softcapped)<br>" +
              "(Softcap Power: " +
              format(new Decimal(0.1).mul(1000).div(hasUpgrade("a", 21) ? upgradeEffect("a", 21) : 1)) +
              "%)<br>" +
              "(Softcap starts at: x" +
              format(new Decimal(10).add(hasUpgrade("a", 23) ? upgradeEffect("a", 23) : 0)) +
              ")"
            : "")
        );
      },
      unlocked() {
        return hasUpgrade("a", 12);
      },
    },
    21: {
      title: "Depowerer",
      description: "Your total alpha points lowers the softcap power of the 3rd alpha upgrade.",
      cost: new Decimal(100),
      effect() {
        let value = new Decimal(1);
        value = value.add(player[this.layer].total.div(100).log(2)).max(1);
        return value;
      },
      effectDisplay() {
        return "/" + format(upgradeEffect(this.layer, this.id));
      },
      unlocked() {
        return hasMilestone("a", 0);
      },
    },
    22: {
      title: "Quadrupler",
      description: "Quadruples your point gain",
      cost: new Decimal(125),
      unlocked() {
        return hasUpgrade("a", 21);
      },
    },
    23: {
      title: "Uncapper",
      description: "Your total alpha points increments the start of the 3rd alpha upgrade softcap.",
      cost: new Decimal(250),
      effect() {
        let value = new Decimal(1);
        value = value.add(player[this.layer].total.div(250).log(5));
        if (hasUpgrade("a", 32)) value = value.mul(upgradeEffect("a", 32));
        let cap = new Decimal(10);
        let power = new Decimal(0.1);
        value = softcap(value, cap, power).max(0);
        return value;
      },
      effectDisplay() {
        return "+" + format(upgradeEffect(this.layer, this.id));
      },
      unlocked() {
        return hasUpgrade("a", 22);
      },
    },
    31: {
      title: "Quintupler",
      description: "Quintuples your point gain",
      cost: new Decimal(500),
      unlocked() {
        return hasMilestone("a", 1);
      },
    },
    32: {
      title: "Uncapper II",
      description: "Multiplies Uncapper by some ammount.",
      cost: new Decimal(1500),
      effect() {
        let value = new Decimal(1);
        value = value.add(player[this.layer].total.div(50000).log(50).add(1));
        return value;
      },
      effectDisplay() {
        return "x" + format(upgradeEffect(this.layer, this.id));
      },
      unlocked() {
        return hasUpgrade("a", 31);
      },
    },
    33: {
      title: "Betax",
      description: "Unlocks the Beta layer.",
      cost: new Decimal(3000),
      unlocked() {
        return hasUpgrade("a", 32);
      },
    },
  },
});
