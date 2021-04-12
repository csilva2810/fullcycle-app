import shuffle from 'lodash/shuffle'
import sample from 'lodash/sample'

export const colors = [
    "#b71c1c",
    "#4a148c",
    "#2e7d32",
    "#e65100",
    "#2962ff",
    "#c2185b",
    "#FFCD00",
    "#3e2723",
    "#03a9f4",
    "#827717",
  ];
  
export const getRandomColor = () => sample(shuffle(colors)) as string