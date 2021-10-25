/**
 * routines to help the router setup
 */

 /**
  * merge the routes. 
  * if there are duplicates by name, the last one will overload the previous one
  */
 export const routeMerge = function(...routes) {
  let route = [];
  for (let index = 0; index < routes.length; index++) {
    for (let stepIndex = 0; stepIndex < routes[index].length; stepIndex++) {
      let step = routes[index][stepIndex];
//      console.log('step', step)
      let pivot = route.findIndex( (r) => r.name === step.name);
      if (pivot >= 0) {
        route[pivot] = step;
      } else {
        route.push(step)
      }
    }
  }
  return route
}

