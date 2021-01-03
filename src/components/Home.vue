<template>
  <div class="hello">
    <div>
        <img src="../assets/logo.png" width="90%" height="100%">
    </div>
    <div class="question">{{description}}</div>

    <div class="sucess" v-if="(answer.join('').toLowerCase() == words[0].toLowerCase()) && this.chars.length != this.answer.length"> Tebrikler! </div>
    <div class="warning" v-if="(this.chars.length == this.answer.length) || (answer.join('').length == words[0].length) && (answer.join('').toLowerCase() != words[0].toLowerCase())"> Bu sayılmaz, hadi baştan :) </div>

    <ul>
        <li v-for="(char,i) of words[0]" :key="i">
            <input :ref="'input'" v-if="chars.indexOf(i) != -1" :value="char" maxlength="1" disabled>
            <input :ref="'input'" v-else v-model="answer[i]" maxlength="1" @keyup="nextChar(i)" disabled>
        </li>
    </ul>

    <div style="display:flex;flex-direction:column;margin:5px;">
        <button class="char" @click="getChar()" v-show="answer.join('').length != words[0].length"> Harf Aliim </button>

        <button class="next" @click="clearAnswer()"> Cevap Alanını Temizle </button>
        <button class="next" @click="nextWord()"> Sonraki Soru</button>
    </div>

    <div class="keyboard">
        <p>
            <button class="letter" @click="type(letter)" v-for="(letter,i) of keyboard[0]" :key="i">{{letter.toUpperCase()}}</button>
        </p>
        <p>
            <button class="letter" @click="type(letter)" v-for="(letter,i) of keyboard[1]" :key="i">{{ letter == "i" ? "İ" : letter.toUpperCase()}}</button>
        </p>
        <p>
            <button class="letter" @click="type(letter)" v-for="(letter,i) of keyboard[2]" :key="i">{{letter.toUpperCase()}}</button>
            <button class="letter" @click="deleteLetter()" style="background:#36729A"> SİL </button>
        </p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'Home',
  data() {
      return {
          description: '',
          words: [],
          chars: [],
          answer: [],
          keyboard: [
              ["q","w","e","r","t","y","u","ı","o","p","ğ","ü"],
              ["a","s","d","f","g","h","j","k","l","ş","i"],
              ["z","x","c","v","b","n","m","ö","ç"],
            ]
      }
  },
  async created() {
      this.getWords();
  },
  methods: {
      async getWords() {
        try {
          const res = await axios.get(`https://sozluk.gov.tr/icerik`);
          this.words = res.data.karistirma.map(l => l.dogru.trim());
          this.words = this.words.map(w => w.replace("â","a"))
          this.words = this.words.map(w => w.replace("î","i"))
          this.words = this.words.map(w => w.replace("û","u"))
          this.getDescription();

          this.answer.length = this.words[0].length;
          this.answer.fill('');

        } catch(e){
            console.error(e);
        }
      },

      nextWord(){
          this.clearAnswer();
          if(this.words.length != 1){
            this.words.shift();
            this.getDescription();
          }else{
              this.getWords();
          }
          this.answer.length = this.words[0].length;
          this.answer.fill('');
      },

      getChar(){
        let charNum = this.generateChar();
        while(this.chars.indexOf(charNum) != -1){
            charNum = this.generateChar();
        }
        this.answer[charNum] = this.words[0][charNum];
        this.chars.push(charNum);
      },

      generateChar(){
          return Math.floor(Math.random() * this.words[0].length);
      },

      async getDescription(){
        try {
          const res = await axios.get('https://sozluk.gov.tr/gts?ara='+encodeURIComponent(this.words[0]));
          this.description = res.data[0].anlamlarListe[0].anlam;
        } catch(e){
            console.error(e);
        }
      },

      nextChar(id){
          this.$refs.input[(id+1)].focus();
      },

      clearAnswer(){
          this.answer.length = this.words[0].length;
          this.answer.fill('');
          this.chars= [];
      },

      type(letter){

        this.$set(this.answer, this.focusAnswerBox(), letter)
        console.log(this.answer);
        
      },

      focusAnswerBox(){
          return this.answer.findIndex(v => v == '');
      },

      deleteLetter(){

        console.log(this.chars);

        let index = this.focusAnswerBox() != -1 ? this.focusAnswerBox() : this.answer.length;

        while(this.chars.includes(index-1) && index != 0){
            index--;
        }

        this.$set(this.answer, index -1, '')
      }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.hello{
    display: flex;
    flex-direction: column;
    justify-content:space-between;
    height: 90%;
    padding: 5% 0;
}

ul {
    list-style-type: none;
    padding: 0;
}
li {
    border-bottom:1px grey solid; 
    display: inline-block;
    margin: 0 10px;
}
a {
    color: #42b983;
}
input{
    margin:0;
    margin-top:5px;
    width:20px;
    font-size:20px;
    text-transform:lowercase;
    color: black;
    text-align: center;
    border: 1px black solid;
}

.char,.next{
    font-size:18px;
    border:1px #36729A solid;
    padding: 10px;
    margin:0 20px;
    text-align: center;
}
.char:hover,.next:hover{
    cursor:pointer
}

.question{
    margin: 25px 0;
    font-size: 20px;
}
.char{
    background:#36729A;
    color:white;
}
.next{
    color:#36729A;
}
.sucess{
    font-size:20px;
    color:green;
}

.warning{
    font-size:20px;
    color:red;
}


.keyboard p{
    display: flex;
    flex-direction: row;
    margin: 5px 0;
}

.letter{
    flex-grow:1;
    width: 100%;
    height: 100%;
    font-size:18px;
    border:1px #36729A solid;
    padding:10px 0;
}


</style>
