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

function getLayerSoftcapAble(layer, softcapID) {
  if (D(player[layer].points).gte(player[layer]["softcap" + softcapID]) || D(tmp[layer].resetGain).gte(player[layer]["softcap" + softcapID])) return true;
  else return false;
}

function hasBuyable(layer, id) {
  return D(player[layer].buyables[id]).gt(0);
}

function getBuyableCost(layer, id) {
  return D(tmp[layer].buyables[id].cost);
}
