addLayer("b", {
  name: "beta", // This is optional, only used in a few places, If absent it just uses the layer id.
  symbol: "B", // This appears on the layer's node. Default is the id with the first letter capitalized
  position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
  startData() {
    return {
      unlocked: false,
      points: new Decimal(0),
      best: new Decimal(0),
      total: new Decimal(0),
      keepUpgrades: [33],
    };
  },
  requires: new Decimal(1e6), // Can be a function that takes requirement increases into account
  resource: "beta points", // Name of prestige currency
  baseResource: "alpha points", // Name of resource prestige is based on
  baseAmount() {
    return player["a"].points;
  }, // Get the current amount of baseResource
  type: "normal", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
  exponent: 0.8, // Prestige currency exponent
  gainMult() {
    // Calculate the multiplier for main currency from bonuses
    mult = new Decimal(1);
    if (hasUpgrade("b", 22)) mult = mult.add();
    return mult;
  },
  gainExp() {
    // Calculate the exponent on main currency from bonuses
    return new Decimal(1);
  },
  row: 1, // Row the layer is in on the tree (0 is the first row)
  hotkeys: [
    {
      key: "b",
      description: "B: Reset for beta points",
      onPress() {
        if (canReset(this.layer)) doReset(this.layer);
      },
    },
  ],
  layerShown() {
    return hasUpgrade("a", 33);
  },
  color: "orange",
  milestones: {
    0: {
      requirementDescription: "15 Beta points.",
      done() {
        return player[this.layer].best.gte(15);
      },
      effectDescription: "Keep alpha milestones on beta reset.",
    },
    1: {
      requirementDescription: "20 Beta points.",
      done() {
        return player[this.layer].best.gte(20);
      },
      effectDescription: "Unlock 2nd row of beta upgrades.",
      unlocked() {
        return hasUpgrade("b", 13);
      },
    },
  },
  upgrades: {
    11: {
      title: "Additive II",
      description: "Every beta point multiplies alpha point gain by 0.1",
      cost: new Decimal(1),
      effect() {
        let value = new Decimal(1);
        let cap = new Decimal(10);
        let power = new Decimal(0.1);
        // if (hasUpgrade("a", 21)) power = power.mul(upgradeEffect("a", 21)).min(0.9);
        // if (hasUpgrade("a", 23)) cap = cap.add(upgradeEffect("a", 23));
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
              format(
                new Decimal(0.1).mul(1000)
                // .div(hasUpgrade("a", 21) ? upgradeEffect("a", 21) : 1)
              ) +
              "%)<br>" +
              "(Softcap starts at: x" +
              format(
                new Decimal(10)
                // .add(hasUpgrade("a", 23) ? upgradeEffect("a", 23) : 0)
              ) +
              ")"
            : "")
        );
      },
    },
    12: {
      title: "Auto Alpha I",
      description: "Generate passively 1% of alpha points on reset.",
      cost: new Decimal(5),
      unlocked() {
        return hasUpgrade("b", 11);
      },
    },
    13: {
      title: "Auto alpha II",
      description: "Multiply the passive generation of alpha points by 1% of best beta points.",
      cost: new Decimal(10),
      effect() {
        let value = new Decimal(1);
        let layerValue = new Decimal(player.b.best);
        value = value.add(layerValue.mul(0.01));
        return value;
      },
      effectDisplay() {
        return "x" + format(upgradeEffect(this.layer, this.id));
      },
      unlocked() {
        return hasUpgrade("b", 12);
      },
    },
    21: {
      title: "Alphacap I",
      description: "Best beta points increases alpha points gain softcap exponentially.",
      cost: new Decimal(20),
      effect() {
        let value = new Decimal(1);
        let layerValue = new Decimal(player.b.best);
        value = value.add(layerValue.sqrt(1e6).log(1e6));
        return value;
      },
      effectDisplay() {
        return "^" + format(upgradeEffect(this.layer, this.id));
      },
      unlocked() {
        return hasMilestone("b", 1);
      },
    },
    22: {
      title: "Sloggin I",
      description: "Points multiply beta points gain.",
      cost: new Decimal(25),
      effect() {
        let value = player.points.slog(25).log(25);
        return value;
      },
      effectDisplay() {
        return "x" + format(upgradeEffect(this.layer, this.id).add(1));
      },
      unlocked() {
        return hasUpgrade("b", 21);
      },
    },
  },
});
