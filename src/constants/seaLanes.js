// src/constants/seaLanes.js

export const SEA_LANES = [
  {
    id: 'middle_east_to_japan',
    name: 'Energy Route (Middle East - Japan)',
    type: 'energy',
    coordinates: [
      [56.48, 26.56],  // Hormuz
      [70.0, 15.0],    // Arabian Sea
      [80.0, 5.0],     // Indian Ocean
      [95.0, 5.5],     // Towards Malacca
      [100.0, 4.0],    // Malacca
      [112.0, 12.0],   // South China Sea
      [119.5, 24.5],   // Taiwan Strait
      [139.69, 35.68], // Tokyo, Japan
    ],
  },
  {
    id: 'europe_to_japan',
    name: 'Trade Route (Europe - Japan)',
    type: 'trade',
    coordinates: [
      [32.35, 30.60], // Suez
      [43.32, 12.58], // Bab-el-Mandeb
      [60.0, 10.0],   // Arabian Sea
      [80.0, 5.0],    // Joins main route...
    ],
  },
];
