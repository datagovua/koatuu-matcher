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

function humanizeRegion(name) {
  name = name.replace('’', '\'');
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

function isRayonLevel(item) {
  const rayonLevel = 5;
  const regionLevel = 8;
  return item.code % 10**rayonLevel == 0 && item.code % 10**regionLevel !== 0;
}

function filterRayons(koatuu) {
  let rayons = koatuu.filter(isRayonLevel)
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


export function readKoatuu() {
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
