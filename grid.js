/**
 * A grid module by Arva
 * @dependency p5.js
 * @param {number} canvasW - canvas width
 * @param {number} canvasH - canvas width
 * @param {number} margin - default: 0; canvas margin
 * @param {number} xdiv - default: 1; number of col
 * @param {number} ydiv - default: 1; number of row
 * @param {number} xgutter - default 0; space between row in px
 * @param {number} ygutter - default 0; space between col in px
 */

function Grid(canvasW, canvasH, margin = 0, xdiv = 1, ydiv = 1, gutter = 0){drawHeight < drawWidth ? drawWidth / 10 : drawHeight / 10;
  // TODO: create a function that return the rect bound (xstart, ystart, xend, yend) from point x and y
  
  this.canvas = {
    width: canvasW,
    height: canvasH,
    margin,
    drawWidth: canvasW - 2 * margin,
    drawHeight: canvasH - 2 * margin,
  }

  this.grid = {
    col: xdiv,
    row: ydiv,
    gutter: gutter,
    colSize: this.canvas.drawWidth / xdiv,
    rowSize: this.canvas.drawHeight / ydiv,
    n: xdiv * ydiv
  }

  this.mask
  
  // boolean array to make composition;
  this.boolArr = [];
  
  // array of rectangle object, {x, y, xdimension, ydimension}
  this.rectArr = [];
  
  // fill the boolean array and rectangle array with current column and row
  this.setup = () => {
    this.mask = createGraphics(width, height);

    for(let i = 0; i < this.grid.n; i++){
      let x = i % this.grid.col;
      let y = floor(i / this.grid.col);

      this.boolArr[i] = 0;
      appendRect(x, y, 1, 1);
    }

  }

  /**
   * Function to create random composition by combining multiple grid into one bigger grid. Updating the rectArr.
   * Using number of tries to bruteforce square assimilation, by defining the x and y position with the random x dimension and y dimension given by sizesArr.
   * By default it will create rectangle grid with random x and y dimension.
   * @function Grid.createComposition
   * @param {Array} sizesArr - array of dimensions for xdim and ydim
   * @param {number} tries - number of tries
   * @param {boolean} fill - default: true; fill remaining empty space with squares
   * @param {boolean} order - default: false; change to true to create a square composition instead of rectangles
   * @returns {void} No return value.
   */
  this.createComposition = (sizesArr, tries, fill = true, order = false) => {
    resetBooleanArray();
    resetRectArray();
    for(let i = 0; i < tries; i++){
      let x = randInt(0, this.grid.col);
      let y = randInt(0, this.grid.row);
      let xdim = random(sizesArr);
      let ydim = order ? xdim : random(sizesArr);
  
      let fits = true;
  
      if(x + xdim > this.grid.col || y + ydim > this.grid.row){
        fits = false;
      }
  
      if(fits){
        fits = checkIfFits(x, y, xdim, ydim);
      }
  
      if(fits){
        appendRect(x, y, xdim, ydim);
      }
    }

    if (fill){
      this.boolArr.forEach((el, index) => {
        if(el == 0){
          this.boolArr[index] = 1;
          let x = index % this.grid.col;
          let y = floor(index / this.grid.col);
          appendRect(x, y, 1, 1, this.grid.col, this.grid.row);
        }
      });
    }
  }

  /**
   * Function to draw rectangles from array into canvas
   * @function Grid.renderBox
   * @returns {void} No return value.
   */
  this.renderBox = () => {
    push();
    colorMode(HSL);
    stroke(163, 93, 52);
    strokeWeight(3);
    noFill();
    translate(this.canvas.margin, this.canvas.margin);
    for(let rct of this.rectArr){
      rect(rct.x * this.grid.colSize + gutter / 2, rct.y * this.grid.rowSize + gutter / 2, rct.w * this.grid.colSize - gutter, rct.h * this.grid.rowSize - gutter);
    }
    pop();
  }

  /**
   * Function to draw rectangles from array into masked canvas
   * @function Grid.renderBox
   * @param {Array} arr - default: true; draw stroke on every rectangle
   * @param {boolean} stroke - default: true; draw stroke on every rectangle
   * @returns {p5.Graphics} Image with masked rectangles
   */
  this.createMask = (stroke = true, arr = this.rectArr) => {
    this.mask.reset();
    this.mask.background(255);
    this.mask.erase();
    push();
    this.mask.translate(canvasMargin, canvasMargin);
    for(let rct of arr){
      this.mask.rect(rct.x * this.grid.colSize + gutter / 2, rct.y * this.grid.rowSize + gutter / 2, rct.w * this.grid.colSize - gutter, rct.h * this.grid.rowSize - gutter);
    };
    pop();
    this.mask.noErase();
    this.mask.colorMode(HSL);
    if(stroke){
      this.mask.stroke(163, 93, 52);
      this.mask.strokeWeight(3);
      this.mask.noFill();
      for(let rct of arr){
        this.mask.rect(rct.x * this.grid.colSize + gutter / 2, rct.y * this.grid.rowSize + gutter / 2, rct.w * this.grid.colSize - gutter, rct.h * this.grid.rowSize - gutter);
      };
    }
    return this.mask;
  }

  /**
   * Function that asserts array of grid rect object into rect boundaries
   * @function Grid.rectBoundaries
   * @param {Array} arr - default empty array, array of grid rect object {x:, y:, w:, h:}
   * @returns {Array} array of rect object with xstart, ystart, width, height, xend, yend
   */
  this.rectBoundaries = (arr = []) => {
    let boundaries = []
    if(arr.length == 0){
      this.rectArr.forEach(rct => {
        boundaries.push(this.getBoundary(rct))
      });
      return boundaries;
    } 

    arr.forEach(rct => {
      boundaries.push(this.getBoundary(rct))
    })
    return boundaries;
  }

  /**
   * Function to return boundaries from a grid rect object
   * @function Grid.getBoundary
   * @param {Object} rct - grid rect object {x:, y:, w:, h:}
   * @returns {Object} rect object of boundaries with xstart, ystart, width, height, xend, yend
   */
  this.getBoundary = (rct) => {
    return {
      xstart: rct.x * this.grid.colSize + gutter / 2 + this.canvas.margin,
      ystart: rct.y * this.grid.rowSize + gutter / 2 + this.canvas.margin,
      width: rct.w * this.grid.colSize - gutter + this.canvas.margin,
      height: rct.h * this.grid.rowSize - gutter,
      xend: this.grid.colSize * (rct.x + rct.w) - gutter / 2 + this.canvas.margin,
      yend: this.grid.rowSize * (rct.y + rct.h) - gutter / 2 + this.canvas.margin,
    }
  }

  /**
   * Function to draw rectangles from array into canvas
   * @function Grid.largestGrid
   * @param {number} - default 1; number of largest grid (descending)
   * @returns {Array} array of rect object with xstart, ystart, width, height, xend, yend
   */
  this.largestGrid = (n = 1) => {
    let rects = [...this.rectArr];
    let result = [];
    while(result.length < n){
      let largestArea = {
        area: -99,
        w: 1,
      };
      let i = -1;
      rects.forEach((rct, index) => {
        // let w = this.grid.colSize > this.grid.rowSize ? rct.w * 2 : rct.w;
        // let h = this.grid.rowSize > this.grid.colSize ? rct.h * 2 : rct.h;
        let w = rct.w;
        let h = rct.h;
        if(w * h > largestArea.area || (w * h == largestArea.area && w > largestArea.w)){
          largestArea = {
            area: w * h,
            width: w,
          };
          i = index;
        };
      });
      result.push(rects[i]);
      rects.splice(i, 1);
      largestArea = {
        area: -99,
        w: 1,
      };
      i = -1;
    }
    return result;
  }

  let resetBooleanArray = () => {
    for(let i = 0; i < this.grid.n; i++){
      this.boolArr[i] = 0;
    }
  }

  let resetRectArray = () => {
    this.rectArr = [];
  }

  let checkIfFits = (xpos, ypos, xdim, ydim) => {
    for(let y = ypos; y < ypos + ydim; y++){
      for(let x = xpos; x < xpos + xdim; x++){
        let i = x + y * this.grid.col;
        if(this.boolArr[i] == 1){
          return false
        }
      }
    }
  
    return true;
  }

  let appendRect = (xpos, ypos, xdim, ydim) => {
    for(let y = ypos; y < ypos + ydim; y++){
      for(let x = xpos; x < xpos + xdim; x++){
        let i = x + y * this.grid.col;
        this.boolArr[i] = 1;
      }
    }
  
    this.rectArr.push({
      x: xpos,
      y: ypos,
      w: xdim,
      h: ydim,
    })
  }

  let randInt = (a, b) => (floor(random(a, b + 1)));
}