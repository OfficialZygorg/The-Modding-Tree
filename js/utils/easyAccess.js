function hasUpgrade(layer, id) {
  return (player[layer].upgrades.includes(toNumber(id)) || player[layer].upgrades.includes(id.toString())) && !tmp[layer].deactivated;
}

function hasMilestone(layer, id) {
  return (player[layer].milestones.includes(toNumber(id)) || player[layer].milestones.includes(id.toString())) && !tmp[layer].deactivated;
}

function hasAchievement(layer, id) {
  return (player[layer].achievements.includes(toNumber(id)) || player[layer].achievements.includes(id.toString())) && !tmp[layer].deactivated;
}

function hasChallenge(layer, id) {
  return player[layer].challenges[id] && !tmp[layer].deactivated;
}

function maxedChallenge(layer, id) {
  return player[layer].challenges[id] >= tmp[layer].challenges[id].completionLimit && !tmp[layer].deactivated;
}

function challengeCompletions(layer, id) {
  return player[layer].challenges[id];
}

function getBuyableAmount(layer, id) {
  return player[layer].buyables[id];
}

function setBuyableAmount(layer, id, amt) {
  player[layer].buyables[id] = amt;
}

function addBuyables(layer, id, amt) {
  player[layer].buyables[id] = player[layer].buyables[id].add(amt);
}

function getClickableState(layer, id) {
  return player[layer].clickables[id];
}

function setClickableState(layer, id, state) {
  player[layer].clickables[id] = state;
}

function getGridData(layer, id) {
  return player[layer].grid[id];
}

function setGridData(layer, id, data) {
  player[layer].grid[id] = data;
}

function upgradeEffect(layer, id) {
  return tmp[layer].upgrades[id].effect;
}

function challengeEffect(layer, id) {
  return tmp[layer].challenges[id].rewardEffect;
}

function buyableEffect(layer, id) {
  return tmp[layer].buyables[id].effect;
}

function clickableEffect(layer, id) {
  return tmp[layer].clickables[id].effect;
}

function achievementEffect(layer, id) {
  return tmp[layer].achievements[id].effect;
}

function gridEffect(layer, id) {
  return gridRun(layer, "getEffect", player[layer].grid[id], id);
}

function D(number) {
  return new Decimal(number);
}

function getLayerSoftcap(layer, softcapID) {
  if (softcapID === undefined) return D(tmp[layer].softcap);
  else {
    let data = tmp[layer].startData();
    return D(data["softcap" + softcapID]);
  }
}

function setLayerSoftcap(value, layer, softcapID) {
  if (softcapID === undefined) tmp[layer].softcap = D(value);
  else {
    let data = tmp[layer].startData();
    data["softcap" + softcapID] = D(value);
  }
}

function getLayerSoftcapAble(layer, softcapID) {
  if (softcapID === undefined) {
    if (D(player[layer].points).gte(tmp[layer].softcap) || D(tmp[layer].resetGain).gte(tmp[layer].softcap)) return true;
  } else if (D(player[layer].points).gte(player[layer]["softcap" + softcapID]) || D(tmp[layer].resetGain).gte(player[layer]["softcap" + softcapID])) return true;
  else return false;
}

function hasBuyable(layer, id) {
  return D(player[layer].buyables[id]).gt(0);
}

function getBuyableCost(layer, id) {
  return D(tmp[layer].buyables[id].cost);
}

function getUpgradeName(layer, id) {
  return `${tmp[layer].name} Upgrade ${id}`;
}

function getChallengeName(layer, id) {
  return `${tmp[layer].challenges[id].name}`;
}

function getDisabledByChallenge(layer, id) {
  return `Disabled by ${tmp[layer].challenges[id].name} in layer ${tmp[layer].name}`;
}

function getUpgradeSoftcap(layer, id, softcapID) {
  return D(tmp[layer].upgrades[id].softcaps["softcap" + softcapID]);
}

function setUpgradeSoftcap(layer, id, softcapID, value) {
  return (tmp[layer].upgrades[id].softcaps["softcap" + softcapID] = D(value));
}

function getUpgradeSoftcapPower(layer, id, powerID) {
  return D(tmp[layer].upgrades[id].softcaps["power" + powerID]);
}

function setUpgradeSoftcapPower(layer, id, powerID, value) {
  return (tmp[layer].upgrades[id].softcaps["power" + powerID] = D(value));
}
