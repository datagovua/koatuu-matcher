import { readKoatuu } from './koatuu';
import { readCSV } from './csv';
import { match } from './vdvs';


Promise.all([
  readCSV('data/minjust_vdvs.csv'),
  readKoatuu()
]).then(function(data) {
  let [vdvs, koatuu] = data;
  let nn = 1;
  vdvs.forEach((viddil) => {
    let viddilKoatuu = match(viddil, koatuu);
    if(viddilKoatuu == undefined) {
      console.log(viddilKoatuu, viddil.name);
    } else {
      //console.log(nn, region, rayonCode, viddil.name); nn += 1;
    }

  });
}).catch((e) => console.log('error', e));
