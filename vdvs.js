function matchKyiv(viddil, regionKoatuu) {
  let kyivMatch = viddil.name.match(/у м. Києві/)
  if(!kyivMatch) {
    return null;
  }
  let kyivCode = regionKoatuu['Київ'];
  return kyivCode;
}

function matchRegion(viddil, regionKoatuu) {
    let regionMatch = viddil.name.match(/\s+(\S+)\s+області/);
    if(!regionMatch) {
      let kyivCode = matchKyiv(viddil, regionKoatuu);
      if(!kyivCode) {
        return null;
      }
      return kyivCode;
    }
    let regionName = regionMatch[1];
    regionName = regionName.replace(/ій$/, 'а');
    let region = regionKoatuu[regionName];
    return region;
}

function normalize(name) {
  return name.replace('’', '\'');
}

function matchRayon(viddil, rayonKoatuu, region) {
    if (!viddil.name.match(/ РВ\s?ДВС ГТУЮ/)) {
      return;
    }
    let rayon = viddil.name.split(' ')[0];
    rayon = normalize(rayon);
    let viddilKoatuu = rayonKoatuu[rayon];
    if(viddilKoatuu) {
      return viddilKoatuu;
    } else {
    }
}

function isCityViddil(viddil) {
  return viddil.name.match(/ /);
}

function isRegional(viddil) {
  let match = viddil.name.match(/^(ГТУЮ (у|в) (\S+) області|ГТУЮ у м. Києві)$/);
  return match !== null;
}

export function match(viddil, koatuu) {

  let regionKoatuu = koatuu.regions;
  let rayonKoatuu = koatuu.rayons;

  let region = matchRegion(viddil, regionKoatuu);
  if(region == null) {
    console.log('Couldnt find region in ' + viddil.name);
  }

  if(isRegional(viddil)) {
    return region;
  }
  let rayon = matchRayon(viddil, rayonKoatuu, region);
  if(rayon == undefined) {
//      console.log(region, viddil.name);
  }
  return rayon;
}
