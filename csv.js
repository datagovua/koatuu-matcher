import csv from 'csv';
import fs from 'fs';


export function readCSV(filename) {
  const p = new Promise((resolve, reject) => {
    const data = fs.readFileSync(filename);
    csv.parse(data, {columns: true}, (err, records) => {
      if (err) reject(err);
      resolve(records);
    });
  });
  return p;
}
