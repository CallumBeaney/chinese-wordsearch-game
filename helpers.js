/* The fundamental idea of this game is to generate 16 hanzi from 8 seed words,
    which the user must then discover. But, the pairs the user makes from those 
    16 hanzi can also be compared against a dictionary of words. The user must 
    find all 8 seed words to win, but 
    This allows for unpredictable (natural) word-identification + challenge. */

let state = {
  "taps" : 0,                  // track user buttontaps
  "hanziPair" : [],           // the user's currently-selected hanzi pair
  "successes" : [],          // all successful hanzi thus far
  "gridHanzi" : [],         // the current grid's 16 hanzi
  "prevButton" : "",       // the previously-tapped button's DOM-element ID
  "originalWords" : [],   // the original words for this gridHanzi.
  "submittedWords" : [], // words that have been added to the list
};

let stats = {
  "thisGridPasses" : 0, // successful words found for a given grid
  "passCounter" : 0,   // the number of successful words found
  "gridCounter" : 0,  //  number of grids completed
  "errors" : 0,    // 2-hanzi guesses made by the user
};


const numWords = 8; // results in double the number of hanzi

!function main() {
  console.log("Cheater!")
  buildGrid(numWords);
}();



function buildGrid(){
  state.successes = [];
  state.gridHanzi = [];
  stats.gridCounter++;
  stats.thisGridPasses = 0;
  
  const hanziList = getListOfHanzi(wordList, numWords); // must make const or shuffling operations do not work
  state.gridHanzi = hanziList;
  const shuffledList = shuffle(hanziList);
  // buildButtons(hanjiList); // for debugging
  buildButtons(shuffledList); 
}


// Helpers hereafter __________________________________

function getListOfHanzi(words, limit)
{
  state.originalWords = [];

  const keys = Object.keys(words);
  let capturedHanziList = [];
  let passer = new Array;
  
  for (i = 0; i < limit; i++) // build a string of hanzi 
  {   
    do {
      // Get a random word by extracting a Key from the 'wordlist' Map
      passer = Array.from(keys[Math.floor(Math.random() * keys.length)]);
    } while (passer.some(e => capturedHanziList.includes(e)) == true && passer[0] != passer[1]); // ensure that no key is repeated && that no word contiains the same character
    
    capturedHanziList.push(...passer.map(String)); // get that Array as some strings  
    state.originalWords.push(passer.join("")); // store those strings as words
  }

  // For debugging
  // state.originalWords = ["膨張", "洋杯", "鼻孔", "改名", "中庭", "経文", "布教", "有罪"];
  // capturedHanziList = ["膨", "張", "洋", "杯", "鼻", "孔", "改", "名", "中", "庭", "経", "文", "布", "教", "有", "罪"];
  
  console.log("Word List: " + state.originalWords)
  return capturedHanziList;
}


function buildButtons(hanziList){  
  document.getElementById("griddyboi").innerHTML = ""; // clear any buttons (buildButtons called by tryhanzi)

  for (i = 0; i < 16; i++) 
  {
    const buttonID = 'kb' + i;
    const buildElem = '<button class="hanziButton base" id="' + buttonID + '" onclick="tryHanzi(this.innerHTML, this.id)">' + '</button>';
    document.getElementById("griddyboi").innerHTML += buildElem;
    document.getElementById(buttonID).innerHTML = hanziList[i];
  }
}





function tryHanzi(newHanzi, id) {
  // console.log(state)
  resetButtons(id, state.prevButton);

  if (state.taps == 0){ 

    // console.log(state.taps)
    // console.log(document.getElementById(id).className)
    
    document.getElementById(id).className = "hanziButton selected"; 

    state.hanziPair.push(newHanzi);
    state.prevButton = id;
    state.taps++;

    return;
  }
  else if (state.taps == 1)
  {
      // user is pushing second button in the pair

      const previousHanzi = state.hanziPair[0];
      const lookup = previousHanzi + newHanzi;
  
      if (state.originalWords.includes(lookup)) 
      { 
        stats.passCounter++;
        stats.thisGridPasses++;

        if (! state.submittedWords.includes(lookup)){
          addToUserList(lookup);
          state.submittedWords.push(lookup);
        }

        // Colour the successful buttons
        document.getElementById(state.prevButton).className = "hanziButton success";
        document.getElementById(state.prevButton).innerHTML = dictionary[lookup[0]].tc;
        
        document.getElementById(id).className = "hanziButton success";
        document.getElementById(id).innerHTML = dictionary[lookup[1]].tc;

        // add the pair of buttons to the state's success register (this used to maintain green tiles)
        state.successes.push(id);
        state.successes.push(state.prevButton);

        // reset state
        state.taps--; 
        state.prevButton = "";
        state.hanziPair = [];
        // console.log("well done; you've identified a pair!");

        if (checkAllButtonsPassed()){ // the user has completed a grid -- make a new one!
          buildGrid(numWords);
        }
        
        changeStats();
        return;
    } 
    else if (lookup in wordList) 
    {
        stats.passCounter++;
        stats.thisGridPasses++;

        if (! state.submittedWords.includes(lookup)){
          addToUserList(lookup);
          state.submittedWords.push(lookup);
        }

        // Colour the successful buttons
        document.getElementById(id).className = "hanziButton partSuccess";
        document.getElementById(state.prevButton).className = "hanziButton partSuccess";
        console.log("hahaha")

        // add the pair of buttons to the state's success register (this used to maintain green tiles)
        // state.successes.push(id);
        // state.successes.push(state.prevButton);

        // reset state
        state.taps--; 
        state.prevButton = "";
        state.hanziPair = [];

        changeStats()
        return;
    } 
    else 
    {   // word NOT successful
        
      document.getElementById(id).className = "hanziButton failure";

      if (state.successes.includes(state.prevButton)){
        document.getElementById(state.prevButton).className = "hanziButton success";
      } else {
        document.getElementById(state.prevButton).className = "hanziButton failure";
      }

      stats.errors++;
      state.taps--;
      state.hanziPair = [];
      changeStats();
      return;
    }
  }
}


function checkAllButtonsPassed() 
{   //this is a cursed way of doing this but it's 2am and I'm dying

    const successes = state.successes.map(element => parseInt(element.replace("kb", ""))).sort((a, b) => a - b);
    const sortedSuccesses = [...new Set(successes)] // now contains an array of integers no duplicates [0, 1, 2, ..., 15]
    const checkArray = [...Array(16).keys()]; // get 16-long array of ints
    
    if (checkArray.length !== sortedSuccesses.length) {
      // console.log('The arrays are not identical');
      return false;
    } else {
      // Loop through each element of the arrays and compare them
      for (let i = 0; i < checkArray.length; i++) {
        if (checkArray[i] !== sortedSuccesses[i]) {
          // console.log('The arrays are not identical');
          return false;
        }
      }
      // console.log('The arrays are identical');
      return true;
    }
}


function resetButtons(thisId, prevId) { 
  // Cycle through every button in the grid
  for (i=0;i<(numWords * 2);i++) 
  {
    let cycleId = "kb" + i;

    if (cycleId == thisId){ 
      // if the user is just pressing the same button twice, ignore
      continue;
    }

    if (state.successes.includes(cycleId)) {
      // if the user has used an already-passed button, keep it green 
      document.getElementById(cycleId).className = "hanziButton success";
      continue;
    }

    document.getElementById(cycleId).className = "hanziButton base"; // reset the button
  }
}


function addToUserList(word) {

  if (stats.passCounter == 1) {
    document.getElementById("title").remove();
  }
  const kana = wordList[word].p;
  const definition = wordList[word].d;

  // let buildElem = "#" + stats.passCounter;
  let buildElem = "□ " + stats.gridCounter + "　○ " + stats.thisGridPasses;
  buildElem  += '<table class="tg"><colgroup><col style="width: 25%"><col style="width: 50%"><col style="width: 50%">'
              + '<thead><tr>' 
              +   '<th class="tg-nrix" style="font-size: x-large;">' + word + '</th>'
              +   '<th class="tg-nrix medium">' + kana + '</th>';
  if (definition.length >= 10) {
    buildElem += '<th class="tg-nrix" style="font-size: 18px;">' + definition + '</th></tr></thead>';
  } else {              
    buildElem += '<th class="tg-nrix medium">' + definition + '</th></tr></thead>';
  }              

  // const dictionary = {"啶":{zy:"ㄉㄧㄥˋ",tc:"啶",yw:"-d+ine (chem.)"},"
  const hanzi1tradChar = dictionary[word[0]].tc;
  const hanzi1zhuyin = dictionary[word[0]].zy == null ? "注音数据不可用" : dictionary[word[0]].zy;
  const hanzi1eng  = dictionary[word[0]].yw == null ? "英文翻译不可用" : dictionary[word[0]].yw;

  buildElem  += '<tbody><tr>' 
              + '<th class="tg-nrix" style="width: 50%; font-size:22px">' + hanzi1tradChar + '</td>';

  if (hanzi1eng.length >= 20) {
    buildElem += '<td class="tg-nrix smaller">' + hanzi1eng + '</td>';
  } else {
    buildElem += '<td class="tg-nrix medium">' + hanzi1eng + '</td>';
  }

  buildElem += '<td class="tg-nrix medium">' + hanzi1zhuyin + '</td></tr>';
  
  
  const hanzi2tradChar = dictionary[word[1]].tc;
  const hanzi2zhuyin = dictionary[word[1]].zy == null ? "注音数据不可用" : dictionary[word[1]].zy;
  const hanzi2eng  = dictionary[word[1]].yw == null ? "英文翻译不可用" : dictionary[word[1]].yw;

  buildElem  += '<tbody><tr>' 
              + '<th class="tg-nrix" style="width: 50%; font-size:22px">' + hanzi2tradChar + '</td>';

  if (hanzi2eng.length >= 20) {
    buildElem += '<td class="tg-nrix smaller">' + hanzi2eng + '</td>';
  } else {
    buildElem += '<td class="tg-nrix medium">' + hanzi2eng + '</td>';
  }

  buildElem += '<td class="tg-nrix medium">' + hanzi2zhuyin + '</td></tr>';

                          
  buildElem  += '</tbody></table><br>';

  document.getElementById("infolad").insertAdjacentHTML("afterbegin", buildElem);
  updateScroll();
}


// Smaller functions continue __________________

function shuffle (arr) {
  var j, x, index;
  for (index = arr.length - 1; index > 0; index--) {
      j = Math.floor(Math.random() * (index + 1));
      x = arr[index];
      arr[index] = arr[j];
      arr[j] = x;
  }
  return arr;
}

function changeStats(){
  // ◯  ○ ◎  ╳ ᎒᎒᎒  ✕
  const buildHTML = " □ " + (stats.gridCounter + "　○ " + stats.passCounter + "　⤫ " + stats.errors);
  document.getElementById("statisticalfellow").innerHTML = buildHTML;
}


function updateScroll() 
{
    var element = document.getElementById("infolad");
      element.scrollTop = 0; // scroll to top of element
}

