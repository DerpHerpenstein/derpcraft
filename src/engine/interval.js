
const secondIntervalList = [];
export function intervalSecond(fn) {
  secondIntervalList.push(fn);
}

export function initIntervalSecond(){
  console.log("Init interval");
  setInterval(() => {
    secondIntervalList.forEach(fn => fn());
  }, 1000);
}

//export default second;
