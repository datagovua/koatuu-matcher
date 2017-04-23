import csv from 'csv';
import fs from 'fs';

function readCSV(filename) {
  const p = new Promise((resolve, reject) => {
    const data = fs.readFileSync(filename);
    csv.parse(data, {columns: true}, (err, records) => {
      if (err) reject(err);
      resolve(records);
    });
  });
  return p;
}

function normalizeKoatuuFields(koatuu) {
  return koatuu.map((item) => {
    let code = parseInt(item.TE, 10);
    return { code: code, name: item.NU, type: item.NP || null };
  });
}

function filterRegions(koatuu) {
  const regionLevel = 8;
  let regions = koatuu.filter((item) => {
    return item.code % 10**regionLevel == 0;
  });
  return regions;
}

const capitalize = (name) => name.charAt(0).toUpperCase() + name.substr(1).toLowerCase()

function humanizeRegion(name) {
  return name.split('-').map(capitalize).join('-')
}

function humanizeRegions(regions) {
  let regionMap = regions.reduce((map, region) => {
    let nameMatch = region.name.match(/(?:(.*?)\ ОБЛАСТЬ\/М\.(.*)|.*?(КРИМ)\/М\.(.*)|^М\.(.*))/);
    if (nameMatch) {
      let name = humanizeRegion(nameMatch[1] || nameMatch[3] || nameMatch[5]);
      let code = region.code.toString().padStart(10, '0');
      map[name] = {
        name: name,
        code: code
      };
    } else {
      throw region.name + " is invalid region";
    };
    return map;
  }, {});
  return regionMap;
}

function filterRayons(koatuu) {
  const rayonLevel = 5;
  let rayons = koatuu.filter((item) => {
    return item.code % 10**rayonLevel == 0 && item.code % 10**(rayonLevel + 1) !== 0;
  });
  return rayons;
}

function humanizeRayons(rayons) {
  let rayonMap = rayons.reduce((map, rayon) => {
    if(rayon.name.match(/АВТОНОМНА РЕСПУБЛІКА КРИМ\/.*/)) {
      return map;
    }
    let nameMatch = rayon.name.match(/(?:(.*?)\ РАЙОН\/(.*))/);
    if (nameMatch) {
      let name = humanizeRegion(nameMatch[1]);
      let code = rayon.code.toString().padStart(10, '0');
      map[name] = {
        name: name,
        code: code
      };
    } else {
      let name = humanizeRegion(rayon.name);
      name.split(' ').map(capitalize).join(' ');
      console.log(name + " is a city " + (rayon.type == null ? 'of region' : rayon.type == 'Р' ? 'rayon' : rayon.type == 'М' ? '' : 'UNKNOWN') );
    };
    return map;
  }, {});
  return rayonMap;
}

function readKoatuu() {
  return readCSV('data/KOATUU_14022017.csv').then((koatuuRaw) => {
    // { TE, NU, NP } => { code, name, type }
    let koatuu = normalizeKoatuuFields(koatuuRaw);
    let regions = filterRegions(koatuu);
    let regionMap = humanizeRegions(regions);
    let rayons = filterRayons(koatuu);
    let rayonMap = humanizeRayons(rayons);
    return { regions: regionMap, rayons: rayonMap };
  });
}

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

function matchRayon(viddil, rayonKoatuu, region) {
    if (!viddil.name.match(/ РВ ДВС ГТУЮ/)) {
      return;
    }
    let rayon = viddil.name.split(' ')[0];
    let viddilKoatuu = rayonKoatuu[rayon];
    if(viddilKoatuu) {
      return viddilKoatuu;
    } else {
    }
}

function isCityViddil(viddil) {
  return viddil.name.match(/ /);
}

Promise.all([
  readCSV('data/minjust_vdvs.csv'),
  readKoatuu()
]).then(function(data) {
  let [vdvs, koatuu] = data;
  let regionKoatuu = koatuu.regions;
  let rayonKoatuu = koatuu.rayons;
  let nn = 1;
  vdvs.forEach((viddil) => {
    let region = matchRegion(viddil, regionKoatuu);
    if(region == null) {
      console.log('Couldnt find region in ' + viddil.name);
    }
    let rayonCode = matchRayon(viddil, rayonKoatuu, region);
    if(rayonCode == undefined) {
//      console.log(region, viddil.name);
    } else {
      //console.log(nn, region, rayonCode, viddil.name); nn += 1;
    }
  });
}).catch((e) => console.log('error', e));
