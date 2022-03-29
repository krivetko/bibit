// Author: Lukanov Andrey.
// Total spent time: about 12 hours

// Brief breakdown:
// Before programming I've spent about 2 hours for drawing the algorithm
// schemes, data structures and maual calculation of the test cases by myself.
// Also I've designed the printable template for speeding up the manual
// calculation (it was very helpful in further testing).

// I've splitted the task into three routines: composing the Pyramid from the
// input string, applying the transition rules (with transitive reducing), and
// printing.
// I've spent 3, 3 and 4 hours respectively for implementing them, debugging and
// testing with different test cases.


// So, this is my implementation of Bibit algorithm in JavaScript:
//-----------------------------------------------------------------------------

//Each pyramid is stored as an object, that consists of the list
//  of its triangles, and the field "checksum", that fills in with the value
//  in which it could be reduced.
//
//  Pyramids can be nested level by level into the one huge pyramid, that should
//  be solved to get the checksum of the origin binary number.
class Pyramid {

  constructor(elements, indexNumber) {
    this._checksum = "";
    this._elements = elements;
    this._indexNumber = indexNumber;
  }
  //Getters and setters of the private values
  get elements() {
    return this._elements;
  }
  get checksum() {
    return this._checksum;
  }
  set checksum(value) {
    this._checksum = value;
  }
  get indexNumber() {
    return this._indexNumber;
  }
  set indexNumber(value) {
    this._indexNumber = value;
  }
  //setElements method splits the provided string into the triangles list.
  //  Also it fills in the "checksum" value if the pyramid could be reduced to
  //  triangle.
  setElements(valuesString) {
    if (valuesString === "0000") {
      this._checksum = "0";
    } else if (valuesString === "1111") {
      this._checksum = "1";
    }
    this._elements = valuesString.split("");
  }

}

//Object "rules" stores the rules sheet, that used in solving the pyramid, and
//  the method, that returns the resulting checksum after transformation
const rules = {

  input: [
    "0000", "0001", "0010", "0011", "0100", "0101", "0110", "0111",
    "1000", "1001", "1010", "1011", "1100", "1101", "1110", "1111"
  ],
  output: [
    "0000", "1000", "0001", "0010", "0000", "0010", "1011", "1011",
    "0100", "0101", "0111", "1111", "1101", "1110", "0111", "1111"
  ],
  getMatchingResult: function (valuesString) {
    inputString = reverseString(valuesString);
    outputString = rules.output[rules.input.findIndex(rule => rule === inputString)];
    return reverseString(outputString);
  }
}

// The function for reversing the string: all the triangles store the values in
//  lowest-to-highest order, so all values needed to be reversed for storing to
// or reading from the triangle/pyramid.
function reverseString(inputString) {

  return inputString.split("").reverse().join("");

}

// The function for converting input number to Pyramid object
function getPyramidFromTheString(binaryNumber) {

  let pyramidRows = [],
      numberOfSymbolsInRow = 1,
      startIndex = 0;
  //Every row of the pyramid has two more elements than previous one,
  //  starting from 1 element at row
  while (startIndex < binaryNumber.length) {
    pyramidRows.push(binaryNumber.slice(startIndex, startIndex + numberOfSymbolsInRow).split(""));
    startIndex = startIndex + numberOfSymbolsInRow;
    numberOfSymbolsInRow = numberOfSymbolsInRow + 2;
  }

  let pyramidsStack = [],
      elementsInRow,
      addedToStack = 0,
      indexNumber = 0;

  //The idea of the algorithm is that elements in each row arranged in a certain
  //  order:
  //  At odd rows there are 1 element of the first pyramid in row, 3 elements of
  //  the next pyramid, and so on...
  //  At even rows the order is reversed: 3 elements of first pyramid and 1 of
  //  the next one.
  //  Number of the resulting triangles is growing by two after each cycle.
  //  And the most interesting thing is that this algorithm can be used unchanged
  //  for calculating the larger groups of pyramids, obtained from the previous
  //  iterations.
  //
  //  The result is the one Pyramid object, that consists of the smaller pyramids,
  //  nested one by one in layers with 1-to-4 relations.

  while (addedToStack !== 1) {
    elementsInRow = 1;
    for (let rowIndex = 0; rowIndex < pyramidRows.length; rowIndex = rowIndex + 2) {
      if (rowIndex === 0) {
        // The first pyramid is differ from the others: it won't change the
        // direction of the calculation
        let newElements = [];
        newElements = newElements.concat(pyramidRows[rowIndex]);
        newElements = newElements.concat(pyramidRows[rowIndex + 1]);
        pyramidsStack.push(new Pyramid(newElements, indexNumber));
        addedToStack = addedToStack + 1;
        elementsInRow = elementsInRow + 2;
        indexNumber = indexNumber + 1;
        continue;
      }
      let direction = 1, currentPositionIndex = 0;
      //  The numbers in row are arranged in this order:
      //        ^   - - -   ^
      //      / 0 \ 1 2 3 / 0 \
      //    / 1 2 3 \ 0 / 1 2 3 \
      //   *  - - -   *   - - -  *
      //  So it's possible to transform two rows in one iteration by changing the
      //  direction of calculation the pyramids elements after each loop pass.
      for (let elementIndex = 0; elementIndex < elementsInRow; elementIndex++) {
        if (direction > 0) {
          let newElements = [];
          newElements = newElements.concat(pyramidRows[rowIndex].slice(currentPositionIndex, currentPositionIndex + 1));
          newElements = newElements.concat(pyramidRows[rowIndex + 1].slice(currentPositionIndex, currentPositionIndex + 3));
          pyramidsStack.push(new Pyramid(newElements, indexNumber));
          currentPositionIndex = currentPositionIndex + 1;
          indexNumber = indexNumber + 1;
        } else {
          let newElements = [];
          newElements = newElements.concat(pyramidRows[rowIndex + 1].slice(currentPositionIndex + 2, currentPositionIndex + 3));
          newElements = newElements.concat(pyramidRows[rowIndex].slice(currentPositionIndex, currentPositionIndex + 3));
          pyramidsStack.push(new Pyramid(newElements, indexNumber));
          currentPositionIndex = currentPositionIndex + 3;
          indexNumber = indexNumber + 1;
        }
        addedToStack = addedToStack + 1;
        direction = direction * -1; // Change the direction for the next pass
      }
      elementsInRow = elementsInRow + 2; // Next row will have two more elements
    }
    // All the rows was decomposed to elementary pyramids, for the larger pyramids
    //  we need to arrange them line by line to larger pyramid, and repeat the
    //  algorithm to get the only 1 remained pyramid.

    if (addedToStack !== 1) {
      pyramidRows = [];
      let addedToRow = 0, elementsToAdd = [];
      elementsInRow = 1;
      // All the calculated pyramids are stored in one list, and the last one
      //  will be desired most complex object, that consist of nested level by
      //  level simpler pyramids
      for (let pyramidIndex = pyramidsStack.length - addedToStack; pyramidIndex < pyramidsStack.length; pyramidIndex++) {
        elementsToAdd = elementsToAdd.concat(pyramidsStack[pyramidIndex]);
        addedToRow = addedToRow + 1;
        if (addedToRow === elementsInRow) {
          pyramidRows.push(elementsToAdd);
          addedToRow = 0;
          elementsInRow = elementsInRow + 2;
          elementsToAdd = [];
        }
      }
      addedToStack = 0;
    }
  }
  return pyramidsStack[pyramidsStack.length - 1];

}

// Recursive function of the decomposition the pyramid object to the lowest level
//  triangles: we have to change the direction of calculation for the every
//  second element - it's disposed upside-down in the pyramid.

function decomposePyramidToElements(pyramid, direction) {
  let elementsArray = [],
      indexArray = [];
  if (direction > 0) {
    indexArray = [0, 1, 2, 3];
  } else {
    indexArray = [1, 2, 3, 0];
  }
  for (let elementIndex = 0; elementIndex < indexArray.length; elementIndex++) {
    if (typeof pyramid.elements[indexArray[elementIndex]] === "object") {
      if (indexArray[elementIndex] === 2) {
        elementsArray = elementsArray.concat(decomposePyramidToElements(pyramid.elements[indexArray[elementIndex]], direction * -1));
      } else {
        elementsArray = elementsArray.concat(decomposePyramidToElements(pyramid.elements[indexArray[elementIndex]], direction));
      }
    } else {
      let pyramidsList = [];
      pyramidsList.push(pyramid);
      return pyramidsList;
    }
  }

  return elementsArray;
}

// The printing function prints the binary number corresponding to the pyramid
//  object: it uses the similar algorithm as the getPyramidFromTheString does.

function printPyramid(pyramid) {
  if (pyramid.checksum !== "" && pyramid.elements.length === 0) {
     console.log(pyramid.checksum);
     return;
  }
  let pyramidElements = decomposePyramidToElements(pyramid, 1),
      numberOfRows = Math.sqrt(pyramidElements.length * 4),
      elementsInRow = 1,
      startPositionIndex = 0,
      pyramidString = [],
      direction = 1;
      delta = 0;
  // Recursive function decomposePyramidToElements returns the elements, that
  //  are not placed in order as they arranged in the pyramid.
  // That's why they needed to be sorted in ascending order of the value of
  // indexNumber.
  pyramidElements.sort(function (a, b) {
    return a.indexNumber - b.indexNumber;
  })
  pyramidElements = pyramidElements.map(pyramid => pyramid.elements.join(""));
  pyramidString.push(pyramidElements[startPositionIndex].slice(0, 1));
  pyramidString.push(pyramidElements[startPositionIndex].slice(1, 4));
  delta = delta + 1;
  elementsInRow = elementsInRow + 4;
  for (let rowIndex = 2; rowIndex < numberOfRows; rowIndex++) {
    let newElements = [],
        addedElements = 0;
    if (rowIndex % 2 === 0) {
      startPositionIndex = startPositionIndex + delta;
    }
    delta = 0;
    while (addedElements < elementsInRow) {
      if (direction > 0) {
        newElements = newElements.concat(pyramidElements[startPositionIndex + delta].slice(0, 1));
        addedElements = addedElements + 1;
      } else {
        newElements = newElements.concat(pyramidElements[startPositionIndex + delta].slice(1, 4));
        addedElements = addedElements + 3;
      }
      delta = delta + 1;
      direction = direction * -1;
    }
    pyramidString.push(newElements.join(""));
    elementsInRow = elementsInRow + 2;
  }
  pyramidString = pyramidString.join("");
  console.log(reverseString(pyramidString));
}

// Recursive algorithm of the rules appliance to the pyramids.

function calculatePyramid(pyramid) {
  let sumResult = 0;
  if (pyramid.elements.filter(element => typeof element === "object").length !== 0) {
    for (let elementIndex = 0; elementIndex < pyramid.elements.length; elementIndex++) {
        sumResult = sumResult + calculatePyramid(pyramid.elements[elementIndex]);
    }
  } else {
    pyramid.setElements(rules.getMatchingResult(pyramid.elements.join("")));
    if (pyramid.checksum !== "") {
      sumResult = 1;
    }
  }
  return sumResult;
}

// Recursive algorith of reducing the pyramid by transitive rules.

function reducePyramid(pyramid) {
  let reducedPyramids = 0;
  if (pyramid.elements.filter(element => element.checksum !== undefined && element.checksum === "").length === 4) {
    for (let elementIndex = 0; elementIndex < pyramid.elements.length; elementIndex++) {
      reducedPyramids = reducedPyramids + reducePyramid(pyramid.elements[elementIndex]);
    }
    // Transitivity can'be applied to
    if (reducedPyramids === pyramid.elements.length) {
      let newElements = pyramid.elements.map(element => element.checksum);
      pyramid.setElements(newElements.join(""));
      return 1;
    }
  } else {
    let newElements = pyramid.elements.map(element => element.checksum);
    pyramid.setElements(newElements.join(""));
    if (pyramid.checksum !== "") {
      return 1;
    } else {
      return 0;
    }
  }
}

function main() {
  // Input validation:

  // Concatenate all the arguments for the cases, when user inputs the number
  //  with spaces as delimiters
  const originBinaryNumber = process.argv.slice(2).join("");

  if (originBinaryNumber === undefined) {
    console.log("You must specify the binary number as the first argument for this script!");
    return;
  } else {
    // Checking if the length of the binary number is a power of 4
    const exponent = Math.log2(originBinaryNumber.length)/Math.log2(4);
    if (exponent !== Math.round(exponent)) {
      console.log("The length of the binary number must be a power of 4!");
      return;
    }
    if (originBinaryNumber.split("").filter(char => char !== "0" && char !== "1").length > 0) {
      console.log("The number must consist only of 0s and 1s!");
      return;
    }
  }

  //The pyramid of 1 element does not needed to be reduced
  if (originBinaryNumber.length === 1) {
    console.log(originBinaryNumber); // Print origin binary number
    console.log(originBinaryNumber); // Print the checksum
    return;
  }

  //Reversing the number before filling the pyramid
  const reversedBinaryNumber = reverseString(originBinaryNumber);

  let pyramid = getPyramidFromTheString(reversedBinaryNumber),
      solvedPyramids;

  numberOfPyramidsToCalculate = decomposePyramidToElements(pyramid, 1).length;
  printPyramid(pyramid);
  while (pyramid.checksum === "") {
    solvedPyramids = calculatePyramid(pyramid);
    printPyramid(pyramid);
    // We have to limit the recursive functions to the one level depth for
    //  the proper calculation behavior
    if ( solvedPyramids === numberOfPyramidsToCalculate) {
      // When all the lowest level pyramids are solved we're ready to reduce
      //  the pyramid.
      reducePyramid(pyramid);
      printPyramid(pyramid);
      numberOfPyramidsToCalculate = decomposePyramidToElements(pyramid, 1).length
    }
  }
}

main();
