addLayer("c", {
  startData() {
    return {
      unlocked: false,
      points: D(0),
      best: D(0),
      total: D(0),
      softcap2: D(2500),
      CCh11BestPoints: D(0),
    };
  },
  layerShown() {
    return hasMilestone("b", 3);
  },
  componentStyles: {
    challenge() {
      return { height: "350px", width: "350px", "border-radius": "25px" };
    },
  },
  color: "gray",
  name: "Carbon", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 1, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  row: 1, // Row the layer is in on the tree (0 is the first row)
  resource: "carbon points", // Name of prestige currency
  baseResource: "alpha points", // Name of resource prestige is based on
  baseAmount() {
    return player["a"].points;
  }, // Get the current amount of baseResource
  requires: D(1e16), //D(1e16), // Can be a function that takes requirement increases into account
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.8, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = D(1);
    if (hasBuyable(this.layer, 23)) mult = mult.mul(buyableEffect(this.layer, 23));
    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    return D(1);
  },
  softcap() {
    let value = D(50);
    if (hasBuyable(this.layer, 14)) value = value.mul(buyableEffect(this.layer, 14));
    return value;
  },
  softcapPower() {
    let power = D(0.1);
    if (getLayerSoftcapAble(this.layer, 2)) power = power.pow(1.3);
    return power;
  },
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
        let softcapText = getLayerSoftcapAble(this.layer) ? `(Softcapped^1 gain at: ${format(getLayerSoftcap(this.layer))})<br>` : "";
        let softcapText2 = getLayerSoftcapAble(this.layer, 2) ? `(Softcapped^2 gain at: ${format(getLayerSoftcap(this.layer, 2))})<br>` : "";
        let stext = softcapText + softcapText2;
        return `${stext}`;
      },
    },
  },
  effect() {
    let value = player[this.layer].points.add(1).tetrate(0.12);
    return value;
  },
  effectDescription() {
    let text = `they multiply points by x${format(getLayerEffect(this.layer))}`;
    return text;
  },
  prestigeButtonText() {
    let nextGain = D(tmp[this.layer].nextAt);
    return `
    Reset for +${format(tmp[this.layer].resetGain, 0)} ${tmp[this.layer].name} points.<br>
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
  milestones: {
    0: {
      requirementDescription() {
        let text = `100 ${getLayerName(this.layer)} points.`;
        return text;
      },
      done() {
        return getLayerPoints(this.layer).gte(100);
      },
      effectDescription() {
        let text = `Add a 3rd row Alpha upgrade, unlock the 4th column of B upgrades & unlock the next row of Carbon buyables.`;
        return text;
      },
    },
    1: {
      requirementDescription() {
        let text = `250 ${getLayerName(this.layer)} points.`;
        return text;
      },
      done() {
        return getLayerPoints(this.layer).gte(250);
      },
      effectDescription() {
        let text = `Add one 1st row Carbon buyable.`;
        return text;
      },
      unlocked() {
        return hasMilestone(this.layer, 0);
      },
    },
    2: {
      requirementDescription() {
        let text = `500 ${getLayerName(this.layer)} points.`;
        return text;
      },
      done() {
        return getLayerPoints(this.layer).gte(500);
      },
      effectDescription() {
        let text = `Unlock a Carbon Challenge.`;
        return text;
      },
      unlocked() {
        return hasMilestone(this.layer, 1);
      },
    },
  },
  challenges: {
    11: {
      name() {
        let text = `${getLayerName(this.layer)} Challenge ${this.id}`;
        return text;
      },
      fullDisplay() {
        let goalText = D(1e6);
        let text = `-On entering: Raise Alpha point generation by ^0.1, then tetrate it by 0.01.<br>
        Alpha layer Softcapped^1 is raised by ^0.5.<br>
        -Reward: Multiply points by (bestPointsInChallenge)pow(0.1)tetrate(0.01) & unlock the next layer.<br><br>
        Goal: ${format(goalText)} Alpha points.<br>
        Completions ${challengeCompletions(this.layer, this.id)}/1<br>
        Effect: x${format(challengeEffect(this.layer, this.id))}<br>
        Best points in challenge: ${format(player[this.layer].CCh11BestPoints)}
        `;
        return text;
      },
      canComplete() {
        let goal = D(1e6);
        let value = player.a.points;
        return value.gte(goal);
      },
      completionLimit() {
        return D(1);
      },
      layer() {
        return player.a.points;
      },
      rewardEffect() {
        if (player.points.gte(player.c.CCh11BestPoints) && inChallenge(this.layer, this.id)) player.c.CCh11BestPoints = D(player.points);
        let value = player.c.CCh11BestPoints.pow(0.5).tetrate(0.01).max(1);
        return value;
      },
      unlocked() {
        return hasMilestone(this.layer, 2);
      },
    },
  },
  buyables: {
    11: {
      cost(x) {
        let current = x.add(1);
        let cost = D(7.5).mul(current);
        return cost;
      },
      title() {
        return getUpgradeName(this.layer, this.id);
      }, //title: "B: Depowerer II",
      display() {
        return `Divide ${getUpgradeName("b", 33)} Softcap^1 power by (bought amount+1)tetrate(0.1)<br>
        Cost: ${format(getBuyableCost(this.layer, this.id))}
        Effect: /${format(buyableEffect(this.layer, this.id))}
        Bought: ${getBuyableAmount(this.layer, this.id)}/${this.purchaseLimit()}
        `;
      },
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },
      buy() {
        setLayerPoints(this.layer, getLayerPoints(this.layer).sub(this.cost()));
        setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
      },
      effect(x) {
        let eff = D(1).add(x).tetrate(0.1).max(1);
        return eff;
      },
      purchaseLimit() {
        let limit = D(10);
        return limit;
      },
    },
    12: {
      cost(x) {
        let current = x.add(1);
        let cost = D(15).mul(current);
        return cost;
      },
      title() {
        return getUpgradeName(this.layer, this.id);
      }, //title: "B: Uncapper III",
      display() {
        return `Every bought amount adds +1 to ${getUpgradeName("b", 33)} Softcap^1 start.<br>
        Cost: ${format(getBuyableCost(this.layer, this.id))}
        Effect: +${format(buyableEffect(this.layer, this.id))} ${buyableEffect(this.layer, this.id).gte(10) ? `(Capped)` : ``}
        Bought: ${getBuyableAmount(this.layer, this.id)}/${this.purchaseLimit()}
        `;
      },
      canAfford() {
        return player[this.layer].points.gte(this.cost());
      },
      buy() {
        player[this.layer].points = player[this.layer].points.sub(this.cost());
        setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
      },
      effect(x) {
        let eff = D(x);
        return eff;
      },
      purchaseLimit() {
        let limit = D(10);
        return limit;
      },
    },
    13: {
      cost(x) {
        let current = x.add(1);
        let cost = D(30).mul(current);
        return cost;
      },
      title() {
        return getUpgradeName(this.layer, this.id);
      }, //title: "A: Empowerer I",
      display() {
        return `Raise ${getUpgradeName("a", 13)} by +^0.1 per amount bought.<br>
        Cost: ${format(getBuyableCost(this.layer, this.id))}
        Effect: ^${format(buyableEffect(this.layer, this.id))}
        Bought: ${getBuyableAmount(this.layer, this.id)}/${this.purchaseLimit()}
        `;
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
        let eff = D(1).add(bought.div(10));
        return eff;
      },
      purchaseLimit() {
        let limit = D(1);
        return limit;
      },
    },
    14: {
      cost(x) {
        let current = x.add(1);
        let cost = D(60).mul(current);
        return cost;
      },
      title() {
        return getUpgradeName(this.layer, this.id);
      }, //title: "A: Empowerer I",
      display() {
        return `Multiply Carbon Softcap^1 by effect.<br>Effect is multiplied x2 every time its bought.<br>
        Cost: ${format(getBuyableCost(this.layer, this.id))}
        Effect: x${format(buyableEffect(this.layer, this.id))}
        Bought: ${format(getBuyableAmount(this.layer, this.id))}
        `;
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
        let number = D(2);
        let eff = number.pow(bought.trunc());
        return eff;
      },
      unlocked() {
        return hasMilestone(this.layer, 1);
      },
    },
    21: {
      cost(x) {
        let current = x.add(1);
        let cost = D(60).mul(current);
        return cost;
      },
      title() {
        return getUpgradeName(this.layer, this.id);
      }, //title: "A: Empowerer I",
      display() {
        return `Multiply points by effect.<br>Effect is multiplied x2 every time its bought.<br>
        Cost: ${format(getBuyableCost(this.layer, this.id))}
        Effect: x${format(buyableEffect(this.layer, this.id))}
        Bought: ${format(getBuyableAmount(this.layer, this.id))}
        `;
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
        let number = D(2);
        let eff = number.pow(bought.trunc());
        return eff;
      },
      unlocked() {
        return hasMilestone(this.layer, 0);
      },
    },
    22: {
      cost(x) {
        let current = x.add(1);
        let cost = D(120).mul(current);
        return cost;
      },
      title() {
        return getUpgradeName(this.layer, this.id);
      }, //title: "A: Empowerer I",
      display() {
        return `Every amount bought generates 0.1% of Beta points (Capped at 100%).<br>
        Cost: ${format(getBuyableCost(this.layer, this.id))}
        Effect: ${format(buyableEffect(this.layer, this.id))}% ${this.effect().gte(100) ? `(Capped)` : ""}
        Bought: ${format(getBuyableAmount(this.layer, this.id))}/${format(this.purchaseLimit(), 2, true)}
        `;
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
        let eff = bought.mul(0.1);
        return eff;
      },
      purchaseLimit() {
        let limit = D(1e3);
        return limit;
      },
      unlocked() {
        return hasMilestone(this.layer, 0);
      },
    },
    23: {
      cost(x) {
        let current = x.add(1);
        let cost = D(240).mul(current);
        return cost;
      },
      title() {
        return getUpgradeName(this.layer, this.id);
      }, //title: "A: Empowerer I",
      display() {
        return `Every amount bought multiplies Carbon point gain by +x2.<br>
        Cost: ${format(getBuyableCost(this.layer, this.id))}
        Effect: x${format(buyableEffect(this.layer, this.id))}
        Bought: ${format(getBuyableAmount(this.layer, this.id))}
        `;
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
        let eff = bought.mul(2).max(1);
        return eff;
      },
      purchaseLimit() {
        let limit = D(1e4);
        return limit;
      },
      unlocked() {
        return hasMilestone(this.layer, 0);
      },
    },
  },
});
